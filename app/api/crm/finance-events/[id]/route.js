import connectDB from '@/config/database';
import Employee from '@/models/Employee';
import FinanceEvent from '@/models/FinanceEvent';
import Lead from '@/models/Lead';
import OperationEvent from '@/models/OperationEvent';
import Property from '@/models/Property';
import {
   FINANCE_EVENT_FIELDS,
   buildActivityDiff,
   logActivity,
   pickActivitySnapshot,
} from '@/utils/crm/activityLog';
import { getSessionUser } from '@/utils/getSessionUser';
import { Types } from 'mongoose';

void Lead;
void OperationEvent;
void Property;

const VALID_STATUSES = ['waiting', 'completed_success', 'completed_improved', 'completed_worse', 'failed'];
const VALID_PLACE_TYPES = ['notary', 'developer_sales', 'other'];
const VALID_FINANCIAL_PRODUCTS = ['OO', 'OP', 'PP', 'PO', ''];

function parseDate(value) {
   if (!value) return undefined;
   const d = new Date(value);
   return Number.isNaN(d.getTime()) ? undefined : d;
}

function objectIdOrNull(value) {
   if (!value) return null;
   return Types.ObjectId.isValid(String(value)) ? value : null;
}

function pick(value, options, fallback) {
   return options.includes(value) ? value : fallback;
}

async function inheritedFinancialProduct({ body, sourceOperationEvent, sourcePreDepositEvent, fallback = '' }) {
   const direct = pick(body?.financialProduct, VALID_FINANCIAL_PRODUCTS, '');
   if (direct) return direct;

   if (sourcePreDepositEvent) {
      const pzs = await OperationEvent.findById(sourcePreDepositEvent)
         .select('financialProduct pzs.sourceOperationEvent')
         .populate('pzs.sourceOperationEvent', 'financialProduct')
         .lean();
      const pzsProduct = pick(pzs?.financialProduct, VALID_FINANCIAL_PRODUCTS, '');
      if (pzsProduct) return pzsProduct;
      const sourceProduct = pick(pzs?.pzs?.sourceOperationEvent?.financialProduct, VALID_FINANCIAL_PRODUCTS, '');
      if (sourceProduct) return sourceProduct;
   }

   if (sourceOperationEvent) {
      const source = await OperationEvent.findById(sourceOperationEvent).select('financialProduct').lean();
      const sourceProduct = pick(source?.financialProduct, VALID_FINANCIAL_PRODUCTS, '');
      if (sourceProduct) return sourceProduct;
   }

   return pick(fallback, VALID_FINANCIAL_PRODUCTS, '');
}

function stringArray(value) {
   if (Array.isArray(value)) return value.map((x) => String(x || '').trim()).filter(Boolean);
   if (typeof value === 'string') return value.split('\n').map((x) => x.trim()).filter(Boolean);
   return [];
}

function notesArray(value, fallbackColor = '#8b5cf6', createdByEmployee = null) {
   if (!Array.isArray(value)) return [];
   return value
      .map((note) => ({
         text: String(note?.text || '').trim(),
         color: String(note?.color || fallbackColor).trim(),
         createdByEmployee: objectIdOrNull(note?.createdByEmployee) || createdByEmployee,
      }))
      .filter((note) => note.text);
}

function idString(value) {
   return value?._id?.toString?.() || value?.toString?.() || '';
}

async function canManageFinanceEvent(sessionUser, item) {
   if (!sessionUser?.employeeId && !sessionUser?.isFallbackAdmin) return false;
   if (sessionUser?.isFallbackAdmin || ['owner', 'admin'].includes(sessionUser?.role)) return true;

   const actorId = String(sessionUser.employeeId || '');
   const ownIds = [
      item.createdByEmployee,
      item.responsibleEmployee,
      item.processedByEmployee,
   ].map(idString).filter(Boolean);

   if (ownIds.includes(actorId)) return true;

   const employees = await Employee.find({}, 'manager role').lean();
   const managerByEmployee = new Map(
      employees.map((employee) => [
         String(employee._id),
         employee.manager ? String(employee.manager) : '',
      ])
   );

   return ownIds.some((employeeId) => {
      let current = managerByEmployee.get(employeeId);
      const visited = new Set();

      while (current && !visited.has(current)) {
         if (current === actorId) return true;
         visited.add(current);
         current = managerByEmployee.get(current);
      }

      return false;
   });
}

function populateEvent(query) {
   return query
      .populate('responsibleEmployee', 'name fullName surname role color avatarUrl manager')
      .populate('processedByEmployee', 'name fullName surname role color avatarUrl manager')
      .populate('objectRealtorEmployee', 'name fullName surname role color avatarUrl manager')
      .populate('buyerRealtorEmployee', 'name fullName surname role color avatarUrl manager')
      .populate('createdByEmployee', 'name fullName surname role manager')
      .populate('property', 'title location_text location rooms square_tot floor floors cost currency images assignee actualityStatus actualityGroup')
      .populate('lead', 'name phones stage status requestSummary budgetMax assignee actualityStatus')
      .populate({
         path: 'deposit',
          select: 'financeType occurredAt status property lead objectRealtorKind objectPartnerName buyerRealtorKind buyerPartnerName objectRealtorEmployee buyerRealtorEmployee sourceOperationEvent sourcePreDepositEvent financialProduct',
         populate: {
            path: 'sourcePreDepositEvent',
             select: 'type occurredAt objectRealtorKind objectPartnerName buyerRealtorKind buyerPartnerName objectRealtorEmployee buyerRealtorEmployee financialProduct',
         },
      })
       .populate('reregistrationEvent', 'financeType occurredAt status financialProduct')
       .populate('sourceOperationEvent', 'type occurredAt resultShowing financialProduct showingKind')
       .populate('sourcePreDepositEvent', 'type occurredAt pzs.status pzs.condition objectRealtorKind objectPartnerName buyerRealtorKind buyerPartnerName objectRealtorEmployee buyerRealtorEmployee financialProduct');
}

function mapEvent(item) {
   return {
      ...item,
      _id: item._id?.toString?.() || item._id,
      kind: 'financeEvent',
      depositId: item.deposit?._id?.toString?.() || item.deposit?.toString?.() || item.deposit || null,
   };
}

function financeTitle(item) {
   const typeLabel = item?.financeType === 'reregistration' ? 'ПЕРС' : 'Завдаток';
   const propertyTitle = item?.property?.title || item?.property?.location_text;
   const leadName = item?.lead?.name;
   return [typeLabel, propertyTitle, leadName].filter(Boolean).join(' · ');
}

export const PATCH = async (request, { params }) => {
   try {
      await connectDB();

      const sessionUser = await getSessionUser().catch(() => null);
      const id = params?.id;
      if (!Types.ObjectId.isValid(id)) {
         return Response.json({ error: 'invalid id' }, { status: 400 });
      }

      const existing = await FinanceEvent.findById(id);
      if (!existing) return Response.json({ error: 'not found' }, { status: 404 });
      if (!(await canManageFinanceEvent(sessionUser, existing))) {
         return Response.json({ error: 'forbidden' }, { status: 403 });
      }

      const body = await request.json();
      const beforeSnapshot = pickActivitySnapshot(existing, FINANCE_EVENT_FIELDS);
      const createdByEmployee = sessionUser?.employeeId || null;
      const noteText = String(body?.note || '').trim();
      const sourceOperationEvent = objectIdOrNull(body?.sourceOperationEvent);
      const sourcePreDepositEvent = objectIdOrNull(body?.sourcePreDepositEvent || body?.pzsEvent);
      const financialProduct = await inheritedFinancialProduct({
         body,
         sourceOperationEvent,
         sourcePreDepositEvent,
         fallback: existing.financialProduct || '',
      });

      const update = {
         occurredAt: parseDate(body?.occurredAt) || existing.occurredAt || new Date(),
         responsibleEmployee: objectIdOrNull(body?.responsibleEmployee),
         processedByEmployee: objectIdOrNull(body?.processedByEmployee),
         property: objectIdOrNull(body?.property) || null,
         lead: objectIdOrNull(body?.lead) || null,
         objectRealtorEmployee: objectIdOrNull(body?.objectRealtorEmployee),
         objectRealtorKind: pick(body?.objectRealtorKind, ['employee', 'partner', 'none'], existing.objectRealtorKind || 'employee'),
         objectPartnerName: String(body?.objectPartnerName || '').trim(),
         buyerRealtorEmployee: objectIdOrNull(body?.buyerRealtorEmployee),
         buyerRealtorKind: pick(body?.buyerRealtorKind, ['employee', 'partner', 'none'], existing.buyerRealtorKind || 'employee'),
         buyerPartnerName: String(body?.buyerPartnerName || '').trim(),
         tensionLevel: Number(body?.tensionLevel || existing.tensionLevel || 3),
         location: String(body?.location || '').trim(),
         status: pick(body?.status, VALID_STATUSES, existing.status || 'waiting'),
         deadlineAt: parseDate(body?.deadlineAt) || null,
         scheduledReregistrationAt: parseDate(body?.scheduledReregistrationAt) || null,
         notary: String(body?.notary || '').trim(),
         reregistrationPlaceType: pick(body?.reregistrationPlaceType || body?.placeType, VALID_PLACE_TYPES, existing.reregistrationPlaceType || 'notary'),
         reregistrationPlaceName: String(body?.reregistrationPlaceName || body?.placeName || '').trim(),
         sellerConditions: stringArray(body?.sellerConditions),
         buyerConditions: stringArray(body?.buyerConditions),
         agencyConditions: stringArray(body?.agencyConditions),
         resultSummary: String(body?.resultSummary || '').trim(),
         notes: notesArray(body?.notes, existing.financeType === 'deposit' ? '#22c55e' : '#8b5cf6', createdByEmployee),
         sourceOperationEvent,
         sourcePreDepositEvent,
         financialProduct,
      };

      if (noteText) {
         update.notes = [
            ...(update.notes || []),
            { text: noteText, color: existing.financeType === 'deposit' ? '#22c55e' : '#8b5cf6', createdByEmployee },
         ];
      }

      const updated = await FinanceEvent.findByIdAndUpdate(id, update, {
         new: true,
         runValidators: true,
      });

      const populated = await populateEvent(FinanceEvent.findById(updated._id)).lean();
      const afterSnapshot = pickActivitySnapshot(updated, FINANCE_EVENT_FIELDS);

      if (updated.financeType === 'deposit' && updated.sourcePreDepositEvent) {
         await OperationEvent.findOneAndUpdate(
            { _id: updated.sourcePreDepositEvent, type: 'pzs' },
            {
               $set: {
                  'pzs.status': 'deposit',
                  'pzs.resultFinanceEvent': updated._id,
                  'pzs.closedAt': updated.occurredAt,
               },
            },
            { runValidators: true }
         );
      }

      await logActivity({
         entityType: 'financeEvent',
         entityId: updated._id,
         action: 'updated',
         sessionUser,
         source: 'manual',
         title: financeTitle(populated),
         message: updated.financeType === 'reregistration' ? 'Оновлено ПЕРС' : 'Оновлено завдаток',
         before: beforeSnapshot,
         after: afterSnapshot,
         diff: buildActivityDiff(beforeSnapshot, afterSnapshot, FINANCE_EVENT_FIELDS),
         meta: {
            pageName: 'Операційка',
            pagePath: '/crm/operations',
            financeType: updated.financeType,
            propertyId: updated.property,
            leadId: updated.lead,
            depositId: updated.deposit,
         },
      });

      return Response.json({ item: mapEvent(populated) }, { status: 200 });
   } catch (error) {
      console.error(error);
      return new Response('Error updating finance event', { status: 500 });
   }
};

export const DELETE = async (_request, { params }) => {
   try {
      await connectDB();

      const sessionUser = await getSessionUser().catch(() => null);
      const id = params?.id;
      if (!Types.ObjectId.isValid(id)) {
         return Response.json({ error: 'invalid id' }, { status: 400 });
      }

      const existing = await FinanceEvent.findById(id);
      if (!existing) return Response.json({ error: 'not found' }, { status: 404 });
      if (!(await canManageFinanceEvent(sessionUser, existing))) {
         return Response.json({ error: 'forbidden' }, { status: 403 });
      }

      if (existing.financeType === 'deposit') {
         const childPers = await FinanceEvent.findOne({ financeType: 'reregistration', deposit: existing._id }).select('_id').lean();
         if (childPers) {
            return Response.json({ error: 'delete reregistration first' }, { status: 409 });
         }
      }

      const populated = await populateEvent(FinanceEvent.findById(existing._id)).lean();
      await logActivity({
         entityType: 'financeEvent',
         entityId: existing._id,
         action: 'deleted',
         sessionUser,
         source: 'manual',
         title: financeTitle(populated),
         message: existing.financeType === 'reregistration' ? 'Видалено ПЕРС' : 'Видалено завдаток',
         before: pickActivitySnapshot(existing, FINANCE_EVENT_FIELDS),
         meta: {
            pageName: 'Операційка',
            pagePath: '/crm/operations',
            financeType: existing.financeType,
            propertyId: existing.property,
            leadId: existing.lead,
            depositId: existing.deposit,
         },
      });

      if (existing.financeType === 'reregistration' && existing.deposit) {
         await FinanceEvent.findByIdAndUpdate(existing.deposit, {
            $set: { reregistrationEvent: null, status: 'waiting' },
         });
      }

      if (existing.financeType === 'deposit' && existing.sourcePreDepositEvent) {
         await OperationEvent.findOneAndUpdate(
            { _id: existing.sourcePreDepositEvent, type: 'pzs', 'pzs.resultFinanceEvent': existing._id },
            {
               $set: {
                  'pzs.status': 'active',
                  'pzs.resultFinanceEvent': null,
                  'pzs.closedAt': null,
               },
               $push: {
                  'pzs.steps': {
                     at: new Date(),
                     type: 'note',
                     text: 'Завдаток, який закривав ПЗС, видалено. ПЗС повернено в роботу.',
                     createdByEmployee: sessionUser?.employeeId || null,
                  },
               },
            },
            { runValidators: true }
         );
      }

      await existing.deleteOne();

      return Response.json({ ok: true }, { status: 200 });
   } catch (error) {
      console.error(error);
      return new Response('Error deleting finance event', { status: 500 });
   }
};
