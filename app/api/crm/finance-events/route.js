import connectDB from '@/config/database';
import Employee from '@/models/Employee';
import FinanceEvent from '@/models/FinanceEvent';
import Lead from '@/models/Lead';
import OperationEvent from '@/models/OperationEvent';
import Property from '@/models/Property';
import { FINANCE_EVENT_FIELDS, logActivity, pickActivitySnapshot } from '@/utils/crm/activityLog';
import { getSessionUser } from '@/utils/getSessionUser';
import { Types } from 'mongoose';

void Employee;
void Lead;
void OperationEvent;
void Property;

const VALID_TYPES = ['deposit', 'reregistration'];
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

async function inheritedFinancialProduct({ body, sourceOperationEvent, sourcePreDepositEvent }) {
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
      return pick(source?.financialProduct, VALID_FINANCIAL_PRODUCTS, '');
   }

   return '';
}

function stringArray(value) {
   if (Array.isArray(value)) return value.map((x) => String(x || '').trim()).filter(Boolean);
   if (typeof value === 'string') {
      return value.split('\n').map((x) => x.trim()).filter(Boolean);
   }
   return [];
}

function notesArray(value, createdByEmployee = null) {
   if (!Array.isArray(value)) return [];
   return value
      .map((note) => ({
         text: String(note?.text || '').trim(),
         color: String(note?.color || '#8b5cf6').trim(),
         createdByEmployee: objectIdOrNull(note?.createdByEmployee) || createdByEmployee,
      }))
      .filter((note) => note.text);
}

function populateEvent(query) {
   return query
      .populate('responsibleEmployee', 'name fullName surname role color avatarUrl')
      .populate('processedByEmployee', 'name fullName surname role color avatarUrl')
      .populate('objectRealtorEmployee', 'name fullName surname role color avatarUrl')
      .populate('buyerRealtorEmployee', 'name fullName surname role color avatarUrl')
      .populate('createdByEmployee', 'name fullName surname role')
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

export const GET = async (req) => {
   try {
      await connectDB();

      const sp = req.nextUrl.searchParams;
      const q = (sp.get('q') || '').trim();
      const financeType = (sp.get('financeType') || '').trim();
      const status = (sp.get('status') || '').trim();
      const employee = (sp.get('employee') || '').trim();
      const property = (sp.get('property') || '').trim();
      const lead = (sp.get('lead') || '').trim();
      const page = Math.max(parseInt(sp.get('page') || '1', 10), 1);
      const pageSize = Math.min(Math.max(parseInt(sp.get('pageSize') || '30', 10), 1), 100);
      const skip = (page - 1) * pageSize;

      const filter = {};
      if (VALID_TYPES.includes(financeType)) filter.financeType = financeType;
      if (VALID_STATUSES.includes(status)) filter.status = status;
      if (Types.ObjectId.isValid(property)) filter.property = property;
      if (Types.ObjectId.isValid(lead)) filter.lead = lead;

      if (Types.ObjectId.isValid(employee)) {
         filter.$and = [
            ...(filter.$and || []),
            {
               $or: [
                  { responsibleEmployee: employee },
                  { processedByEmployee: employee },
                  { objectRealtorEmployee: employee },
                  { buyerRealtorEmployee: employee },
               ],
            },
         ];
      }

      if (q) {
         filter.$and = [
            ...(filter.$and || []),
            {
               $or: [
                  { location: { $regex: q, $options: 'i' } },
                  { notary: { $regex: q, $options: 'i' } },
                  { reregistrationPlaceName: { $regex: q, $options: 'i' } },
                  { resultSummary: { $regex: q, $options: 'i' } },
                  { sellerConditions: { $elemMatch: { $regex: q, $options: 'i' } } },
                  { buyerConditions: { $elemMatch: { $regex: q, $options: 'i' } } },
                  { agencyConditions: { $elemMatch: { $regex: q, $options: 'i' } } },
                  { 'notes.text': { $regex: q, $options: 'i' } },
               ],
            },
         ];
      }

      const total = await FinanceEvent.countDocuments(filter);
      const rawItems = await populateEvent(FinanceEvent.find(filter))
         .sort({ occurredAt: -1, createdAt: -1 })
         .skip(skip)
         .limit(pageSize)
         .lean();

      return Response.json({ items: rawItems.map(mapEvent), total, page, pageSize }, { status: 200 });
   } catch (error) {
      console.error(error);
      return new Response('Error fetching finance events', { status: 500 });
   }
};

export const POST = async (request) => {
   try {
      await connectDB();

      const sessionUser = await getSessionUser().catch(() => null);
      const body = await request.json();
      const financeType = pick(body?.financeType, VALID_TYPES, 'deposit');

      if (financeType === 'reregistration') {
         return Response.json({ error: 'create reregistration from deposit endpoint' }, { status: 400 });
      }

      const propertyId = objectIdOrNull(body?.property);
      const leadId = objectIdOrNull(body?.lead);
      if (!propertyId && !leadId) {
         return Response.json({ error: 'property or lead required' }, { status: 400 });
      }

      const createdByEmployee = objectIdOrNull(body?.createdByEmployee) || sessionUser?.employeeId || null;
      const sourceOperationEvent = objectIdOrNull(body?.sourceOperationEvent);
      const sourcePreDepositEvent = objectIdOrNull(body?.sourcePreDepositEvent || body?.pzsEvent);
      const financialProduct = await inheritedFinancialProduct({ body, sourceOperationEvent, sourcePreDepositEvent });
      const item = await FinanceEvent.create({
         financeType: 'deposit',
         occurredAt: parseDate(body?.occurredAt) || new Date(),
         responsibleEmployee: objectIdOrNull(body?.responsibleEmployee),
         processedByEmployee: objectIdOrNull(body?.processedByEmployee),
         property: propertyId,
         lead: leadId,
         objectRealtorEmployee: objectIdOrNull(body?.objectRealtorEmployee),
         objectRealtorKind: pick(body?.objectRealtorKind, ['employee', 'partner', 'none'], 'employee'),
         objectPartnerName: String(body?.objectPartnerName || '').trim(),
         buyerRealtorEmployee: objectIdOrNull(body?.buyerRealtorEmployee),
         buyerRealtorKind: pick(body?.buyerRealtorKind, ['employee', 'partner', 'none'], 'employee'),
         buyerPartnerName: String(body?.buyerPartnerName || '').trim(),
         tensionLevel: Number(body?.tensionLevel || 3),
         location: String(body?.location || '').trim(),
         status: pick(body?.status, VALID_STATUSES, 'waiting'),
         deadlineAt: parseDate(body?.deadlineAt) || null,
         scheduledReregistrationAt: parseDate(body?.scheduledReregistrationAt) || null,
         notary: String(body?.notary || '').trim(),
         sellerConditions: stringArray(body?.sellerConditions),
         buyerConditions: stringArray(body?.buyerConditions),
         agencyConditions: stringArray(body?.agencyConditions),
         resultSummary: String(body?.resultSummary || '').trim(),
         notes: notesArray(body?.notes, createdByEmployee),
         sourceOperationEvent,
         sourcePreDepositEvent,
         financialProduct,
         createdByEmployee,
      });

      if (sourcePreDepositEvent) {
         await OperationEvent.findOneAndUpdate(
            { _id: sourcePreDepositEvent, type: 'pzs' },
            {
               $set: {
                  'pzs.status': 'deposit',
                  'pzs.resultFinanceEvent': item._id,
                  'pzs.closedAt': item.occurredAt,
               },
               $push: {
                  'pzs.steps': {
                     at: item.occurredAt,
                     type: 'deposit',
                     text: 'ПЗС закрито завдатком.',
                     createdByEmployee,
                  },
               },
            },
            { runValidators: true }
         );
      } else if (sourceOperationEvent) {
         await OperationEvent.findOneAndUpdate(
            { _id: sourceOperationEvent, type: 'showing' },
            {
               $set: {
                  resultShowing: 'zs',
               },
            },
            { runValidators: true }
         );
      }

      const populated = await populateEvent(FinanceEvent.findById(item._id)).lean();

      await logActivity({
         entityType: 'financeEvent',
         entityId: item._id,
         action: 'created',
         sessionUser,
         source: 'manual',
         title: financeTitle(populated),
         message: 'Створено фінансову подію: завдаток',
         after: pickActivitySnapshot(item, FINANCE_EVENT_FIELDS),
         meta: {
            pageName: 'Операційка',
            pagePath: '/crm/operations',
            financeType: item.financeType,
            propertyId: item.property,
            leadId: item.lead,
         },
      });

      return Response.json({ item: mapEvent(populated) }, { status: 201 });
   } catch (error) {
      console.error(error);
      return new Response('Error creating finance event', { status: 500 });
   }
};
