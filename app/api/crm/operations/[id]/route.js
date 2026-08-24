import connectDB from '@/config/database';
import Employee from '@/models/Employee';
import Lead from '@/models/Lead';
import OperationEvent from '@/models/OperationEvent';
import Property from '@/models/Property';
import {
   OPERATION_EVENT_FIELDS,
   buildActivityDiff,
   logActivity,
   pickActivitySnapshot,
} from '@/utils/crm/activityLog';
import { getSessionUser } from '@/utils/getSessionUser';
import { Types } from 'mongoose';

void Employee;
void Lead;
void Property;

const VALID_TYPES = ['showing', 'inspection', 'review', 'call', 'meeting', 'other', 'pzs'];
const VALID_FINANCIAL_PRODUCTS = ['OO', 'OP', 'PP', 'PO', ''];
const VALID_PZS_STATUSES = ['active', 'deposit', 'failed', 'paused'];
const VALID_PZS_STEP_TYPES = ['created', 'negotiation', 'next_step', 'deposit', 'failed', 'note'];
const VALID_REVIEW_RESULTS = ['not_taken', 'new_object', 'historical'];
const VALID_REVIEW_OBJECT_RESULTS = [
   'not_our_format',
   'owner_not_ready',
   'problematic_object',
   'problematic_owner',
   'hard_loyalty',
   'dirty_advertising',
   'cosmic_price',
   'documents_risk',
   'other',
];
const VALID_OBJECT_RESULTS = [
   'new_object',
   'price_reduced',
   'loyalty_improved',
   'ad_removed_by_owner',
   'category_improved',
   'exclusive_agreed',
   'exclusive_signed',
   'documents_checked',
   'none',
];
const VALID_BUYER_RESULTS = [
   'new_client',
   'loyalty_improved',
   'exclusive_work',
   'readiness_increased',
   'deposit_taken',
   'category_improved',
   'none',
];
const VALID_SHOWING_RESULTS = [
   'zs',
   'pzs',
   'high_interest',
   'objections_found',
   'unclear',
   'refusal',
];
const VALID_SHOWING_KINDS = [
   'passive',
   'primary',
   'repeat',
   'initiative',
   'inbound_call',
   'sms',
   'assistance',
];
const VALID_PRESENCE_TYPES = ['me', 'partner', 'agency_colleague', 'client_self'];

function parseDate(value) {
   if (!value) return undefined;
   const d = new Date(value);
   return Number.isNaN(d.getTime()) ? undefined : d;
}

function objectIdOrNull(value) {
   if (!value) return null;
   return Types.ObjectId.isValid(value) ? value : null;
}

function pick(value, options, fallback) {
   return options.includes(value) ? value : fallback;
}

async function inheritedFinancialProduct(body, fallback = '') {
   const direct = pick(body?.financialProduct, VALID_FINANCIAL_PRODUCTS, '');
   if (direct) return direct;

   const sourceOperationId = objectIdOrNull(body?.sourceOperationEvent || body?.pzs?.sourceOperationEvent);
   if (!sourceOperationId) return pick(fallback, VALID_FINANCIAL_PRODUCTS, '');

   const source = await OperationEvent.findById(sourceOperationId).select('financialProduct').lean();
   return pick(source?.financialProduct, VALID_FINANCIAL_PRODUCTS, pick(fallback, VALID_FINANCIAL_PRODUCTS, ''));
}

function stringArray(value) {
   if (Array.isArray(value)) return value.map((x) => String(x || '').trim()).filter(Boolean);
   if (typeof value === 'string') return value.split('\n').map((x) => x.trim()).filter(Boolean);
   return [];
}

function pzsPayload(body, createdByEmployee = null) {
   const raw = body?.pzs || body || {};
   const steps = Array.isArray(raw?.steps)
      ? raw.steps
         .map((step) => ({
            at: parseDate(step?.at) || new Date(),
            type: pick(step?.type, VALID_PZS_STEP_TYPES, 'note'),
            text: String(step?.text || '').trim(),
            createdByEmployee: objectIdOrNull(step?.createdByEmployee) || createdByEmployee,
         }))
         .filter((step) => step.text)
      : [];
   const noteSteps = stringArray(raw?.stepsText).map((text) => ({
      at: new Date(),
      type: 'note',
      text,
      createdByEmployee,
   }));

   return {
      status: pick(raw?.status, VALID_PZS_STATUSES, 'active'),
      condition: String(raw?.condition || raw?.conditionText || '').trim(),
      sourceLabel: String(raw?.sourceLabel || '').trim(),
      sourceOperationEvent: objectIdOrNull(raw?.sourceOperationEvent || body?.sourceOperationEvent),
      resultFinanceEvent: objectIdOrNull(raw?.resultFinanceEvent || body?.resultFinanceEvent),
      nextStepAt: parseDate(raw?.nextStepAt) || null,
      closedAt: parseDate(raw?.closedAt) || null,
      steps: [...steps, ...noteSteps],
   };
}

function reviewPayload(body) {
   const raw = body?.review || body || {};
   return {
      result: pick(raw?.result, VALID_REVIEW_RESULTS, 'not_taken'),
      objectResult: pick(raw?.objectResult || body?.resultObject, VALID_REVIEW_OBJECT_RESULTS, 'owner_not_ready'),
      source: pick(raw?.source, ['operations', 'properties'], 'operations'),
      sourceLabel: String(raw?.sourceLabel || 'Операційка · не взято').trim(),
      reason: String(raw?.reason || body?.resultDescription || '').trim(),
      note: String(raw?.note || '').trim(),
      linkedPropertyStatus: String(raw?.linkedPropertyStatus || '').trim(),
   };
}

function mapEvent(item) {
   return {
      ...item,
      _id: item._id?.toString?.() || item._id,
      property: item.property
         ? {
            ...item.property,
            _id: item.property._id?.toString?.() || item.property._id,
         }
         : null,
      lead: item.lead
         ? {
            ...item.lead,
            _id: item.lead._id?.toString?.() || item.lead._id,
         }
         : null,
   };
}

function populateEvent(query) {
   return query
      .populate('responsibleEmployee', 'name fullName surname role color avatarUrl')
      .populate('shownByEmployee', 'name fullName surname role color avatarUrl')
      .populate('facilitatedByEmployee', 'name fullName surname role color avatarUrl')
      .populate('objectRealtorEmployee', 'name fullName surname role color avatarUrl')
      .populate('buyerRealtorEmployee', 'name fullName surname role color avatarUrl')
      .populate('createdByEmployee', 'name fullName surname role')
       .populate('pzs.sourceOperationEvent', 'type occurredAt resultShowing financialProduct showingKind')
       .populate('pzs.resultFinanceEvent', 'financeType occurredAt status financialProduct')
      .populate('property', 'title location_text location rooms square_tot floor floors cost currency images assignee actualityStatus actualityGroup')
      .populate('lead', 'name phones stage status requestSummary budgetMax assignee actualityStatus');
}

function operationTitle(item) {
   const propertyTitle = item?.property?.title || item?.property?.location_text;
   const leadName = item?.lead?.name;
   return [propertyTitle, leadName].filter(Boolean).join(' · ') || `Операційна подія: ${item?.type || 'подія'}`;
}

export const PATCH = async (request, { params }) => {
   try {
      await connectDB();

      const sessionUser = await getSessionUser().catch(() => null);
      const id = params?.id;
      if (!Types.ObjectId.isValid(id)) {
         return Response.json({ error: 'invalid id' }, { status: 400 });
      }

      const body = await request.json();
      const propertyId = objectIdOrNull(body?.property);
      const leadId = objectIdOrNull(body?.lead);

      if (!propertyId && !leadId) {
         return Response.json({ error: 'property or lead required' }, { status: 400 });
      }

      const existing = await OperationEvent.findById(id);
      if (!existing) {
         return Response.json({ error: 'not found' }, { status: 404 });
      }
      const beforeSnapshot = pickActivitySnapshot(existing, OPERATION_EVENT_FIELDS);

      const operationType = pick(body?.type, VALID_TYPES, 'showing');
      const financialProduct = await inheritedFinancialProduct(body, existing.financialProduct || '');
      const update = {
         type: operationType,
         occurredAt: parseDate(body?.occurredAt) || new Date(),
         responsibleEmployee: objectIdOrNull(body?.responsibleEmployee),
         showingKind: pick(body?.showingKind, VALID_SHOWING_KINDS, 'passive'),
         financialProduct,
         presenceType: pick(body?.presenceType, VALID_PRESENCE_TYPES, 'me'),
         shownByEmployee: objectIdOrNull(body?.shownByEmployee),
         facilitatedByEmployee: objectIdOrNull(body?.facilitatedByEmployee),
         property: propertyId,
         lead: leadId,
         propertyStage: String(body?.propertyStage || '').trim(),
         buyerStage: String(body?.buyerStage || '').trim(),
         objectRealtorKind: pick(body?.objectRealtorKind, ['employee', 'partner', 'none'], 'employee'),
         objectRealtorEmployee: objectIdOrNull(body?.objectRealtorEmployee),
         objectPartnerName: String(body?.objectPartnerName || '').trim(),
         buyerRealtorKind: pick(body?.buyerRealtorKind, ['employee', 'partner', 'none'], 'employee'),
         buyerRealtorEmployee: objectIdOrNull(body?.buyerRealtorEmployee),
         buyerPartnerName: String(body?.buyerPartnerName || '').trim(),
         resultObject: pick(body?.resultObject, VALID_OBJECT_RESULTS, 'none'),
         resultBuyer: pick(body?.resultBuyer, VALID_BUYER_RESULTS, 'none'),
         resultShowing: pick(body?.resultShowing, VALID_SHOWING_RESULTS, 'unclear'),
         objections: Array.isArray(body?.objections)
            ? body.objections.map((x) => String(x || '').trim()).filter(Boolean)
            : [],
         objectionArguments: String(body?.objectionArguments || '').trim(),
         resultDescription: String(body?.resultDescription || '').trim(),
      };

      if (operationType === 'pzs') {
         const rawPzs = body?.pzs || body || {};
         const nextPzs = pzsPayload(body, existing.createdByEmployee || sessionUser?.employeeId || null);
         const hasIncomingSteps = Array.isArray(rawPzs?.steps) || stringArray(rawPzs?.stepsText).length > 0;
         const existingPzs = existing.pzs?.toObject?.() || existing.pzs || {};
         update.pzs = {
            ...existingPzs,
            ...nextPzs,
            steps: hasIncomingSteps ? [...(existingPzs.steps || []), ...nextPzs.steps] : existingPzs.steps || [],
            resultFinanceEvent: nextPzs.resultFinanceEvent || existingPzs.resultFinanceEvent || null,
            nextStepAt: nextPzs.nextStepAt || existingPzs.nextStepAt || null,
            closedAt: nextPzs.closedAt || existingPzs.closedAt || null,
         };
      }

      if (operationType === 'review') {
         update.review = reviewPayload(body);
      }

      const updated = await OperationEvent.findByIdAndUpdate(id, update, {
         new: true,
         runValidators: true,
      });

      if (!updated) {
         return Response.json({ error: 'not found' }, { status: 404 });
      }

      const populated = await populateEvent(OperationEvent.findById(updated._id)).lean();
      const afterSnapshot = pickActivitySnapshot(updated, OPERATION_EVENT_FIELDS);
      await logActivity({
         entityType: 'operation',
         entityId: updated._id,
         action: 'updated',
         sessionUser,
         source: 'manual',
         title: operationTitle(populated),
         message: 'Оновлено операційну подію',
         before: beforeSnapshot,
         after: afterSnapshot,
         diff: buildActivityDiff(beforeSnapshot, afterSnapshot, OPERATION_EVENT_FIELDS),
         meta: {
            pageName: 'Операційка',
            pagePath: '/crm/operations',
            operationType: updated.type,
            propertyId: updated.property,
            leadId: updated.lead,
         },
      });

      return Response.json({ item: mapEvent(populated) }, { status: 200 });
   } catch (error) {
      console.error(error);
      return new Response('Error updating operation event', { status: 500 });
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

      const existing = await OperationEvent.findById(id);

      if (!existing) {
         return Response.json({ error: 'not found' }, { status: 404 });
      }

      const populated = await populateEvent(OperationEvent.findById(id)).lean();
      await logActivity({
         entityType: 'operation',
         entityId: existing._id,
         action: 'deleted',
         sessionUser,
         source: 'manual',
         title: operationTitle(populated),
         message: 'Видалено операційну подію',
         before: pickActivitySnapshot(existing, OPERATION_EVENT_FIELDS),
         meta: {
            pageName: 'Операційка',
            pagePath: '/crm/operations',
            operationType: existing.type,
            propertyId: existing.property,
            leadId: existing.lead,
         },
      });
      await existing.deleteOne();

      return Response.json({ ok: true }, { status: 200 });
   } catch (error) {
      console.error(error);
      return new Response('Error deleting operation event', { status: 500 });
   }
};
