import connectDB from '@/config/database';
import Employee from '@/models/Employee';
import Lead from '@/models/Lead';
import OperationEvent from '@/models/OperationEvent';
import Property from '@/models/Property';
import {
   OPERATION_EVENT_FIELDS,
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

async function inheritedFinancialProduct(body) {
   const direct = pick(body?.financialProduct, VALID_FINANCIAL_PRODUCTS, '');
   if (direct) return direct;

   const sourceOperationId = objectIdOrNull(body?.sourceOperationEvent || body?.pzs?.sourceOperationEvent);
   if (!sourceOperationId) return '';

   const source = await OperationEvent.findById(sourceOperationId).select('financialProduct').lean();
   return pick(source?.financialProduct, VALID_FINANCIAL_PRODUCTS, '');
}

function parseSearchDate(value) {
   const raw = String(value || '').trim().toLowerCase().replace(/,/g, ' ');
   const numeric = raw.match(/\b(\d{1,2})[.\-/](\d{1,2})[.\-/](\d{2,4})\b/);
   const monthMap = {
      січня: 1, січень: 1,
      лютого: 2, лютий: 2,
      березня: 3, березень: 3,
      квітня: 4, квітень: 4,
      травня: 5, травень: 5,
      червня: 6, червень: 6,
      липня: 7, липень: 7,
      серпня: 8, серпень: 8,
      вересня: 9, вересень: 9,
      жовтня: 10, жовтень: 10,
      листопада: 11, листопад: 11,
      грудня: 12, грудень: 12,
   };
   const text = raw.match(/\b(\d{1,2})\s+([а-яіїєґ]+)\s+(\d{2,4})\b/u);

   const parts = numeric
      ? { day: Number(numeric[1]), month: Number(numeric[2]), year: Number(numeric[3]) }
      : text
         ? { day: Number(text[1]), month: monthMap[text[2]], year: Number(text[3]) }
         : null;

   if (!parts?.day || !parts?.month || !parts?.year) return null;
   const year = parts.year < 100 ? 2000 + parts.year : parts.year;
   const start = new Date(year, parts.month - 1, parts.day, 0, 0, 0, 0);
   if (
      Number.isNaN(start.getTime()) ||
      start.getFullYear() !== year ||
      start.getMonth() !== parts.month - 1 ||
      start.getDate() !== parts.day
   ) {
      return null;
   }
   const end = new Date(start);
   end.setDate(end.getDate() + 1);
   return { start, end };
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

function operationTitle(item) {
   const propertyTitle = item?.property?.title || item?.property?.location_text;
   const leadName = item?.lead?.name;
   return [propertyTitle, leadName].filter(Boolean).join(' · ') || `Операційна подія: ${item?.type || 'подія'}`;
}

export const GET = async (req) => {
   try {
      await connectDB();

      const sp = req.nextUrl.searchParams;
      const q = (sp.get('q') || '').trim();
      const type = (sp.get('type') || '').trim();
      const resultShowing = (sp.get('resultShowing') || '').trim();
      const employee = (sp.get('employee') || '').trim();
      const property = (sp.get('property') || '').trim();
      const lead = (sp.get('lead') || '').trim();
      const occurredFrom = (sp.get('occurredFrom') || '').trim();
      const occurredTo = (sp.get('occurredTo') || '').trim();
      const page = Math.max(parseInt(sp.get('page') || '1', 10), 1);
      const pageSize = Math.min(Math.max(parseInt(sp.get('pageSize') || '30', 10), 1), 100);
      const skip = (page - 1) * pageSize;

      const filter = {};

      if (VALID_TYPES.includes(type)) filter.type = type;
      if (VALID_SHOWING_RESULTS.includes(resultShowing)) filter.resultShowing = resultShowing;

      if (Types.ObjectId.isValid(property)) filter.property = property;
      if (Types.ObjectId.isValid(lead)) filter.lead = lead;

      const occurredAt = {};
      const occurredFromDate = occurredFrom ? new Date(occurredFrom) : null;
      const occurredToDate = occurredTo ? new Date(occurredTo) : null;
      if (occurredFromDate && !Number.isNaN(occurredFromDate.getTime())) occurredAt.$gte = occurredFromDate;
      if (occurredToDate && !Number.isNaN(occurredToDate.getTime())) occurredAt.$lt = occurredToDate;
      if (Object.keys(occurredAt).length) filter.occurredAt = occurredAt;

      if (Types.ObjectId.isValid(employee)) {
         filter.$and = [
            ...(filter.$and || []),
            {
               $or: [
                  { responsibleEmployee: employee },
                  { shownByEmployee: employee },
                  { facilitatedByEmployee: employee },
                  { objectRealtorEmployee: employee },
                  { buyerRealtorEmployee: employee },
               ],
            },
         ];
      }

      if (q) {
         const searchDate = parseSearchDate(q);
         const searchOr = [
            { objectPartnerName: { $regex: q, $options: 'i' } },
            { buyerPartnerName: { $regex: q, $options: 'i' } },
            { objections: { $elemMatch: { $regex: q, $options: 'i' } } },
            { objectionArguments: { $regex: q, $options: 'i' } },
            { resultDescription: { $regex: q, $options: 'i' } },
            { 'pzs.condition': { $regex: q, $options: 'i' } },
            { 'pzs.sourceLabel': { $regex: q, $options: 'i' } },
            { 'pzs.steps.text': { $regex: q, $options: 'i' } },
            { 'review.reason': { $regex: q, $options: 'i' } },
            { 'review.note': { $regex: q, $options: 'i' } },
            { 'review.sourceLabel': { $regex: q, $options: 'i' } },
         ];
         if (searchDate) {
            searchOr.push({ occurredAt: { $gte: searchDate.start, $lt: searchDate.end } });
         }

         filter.$and = [
            ...(filter.$and || []),
            {
               $or: searchOr,
             },
          ];
      }

      const total = await OperationEvent.countDocuments(filter);
      const rawItems = await OperationEvent.find(filter)
         .populate('responsibleEmployee', 'name fullName surname role color avatarUrl')
         .populate('shownByEmployee', 'name fullName surname role color avatarUrl')
         .populate('facilitatedByEmployee', 'name fullName surname role color avatarUrl')
         .populate('objectRealtorEmployee', 'name fullName surname role color avatarUrl')
         .populate('buyerRealtorEmployee', 'name fullName surname role color avatarUrl')
         .populate('createdByEmployee', 'name fullName surname role')
          .populate('pzs.sourceOperationEvent', 'type occurredAt resultShowing financialProduct showingKind')
          .populate('pzs.resultFinanceEvent', 'financeType occurredAt status financialProduct')
         .populate('property', 'title location_text location rooms square_tot floor floors cost currency images assignee actualityStatus actualityGroup')
         .populate('lead', 'name phones stage status requestSummary budgetMax assignee actualityStatus')
         .sort({ occurredAt: -1, createdAt: -1 })
         .skip(skip)
         .limit(pageSize)
         .lean();

      return Response.json({ items: rawItems.map(mapEvent), total, page, pageSize }, { status: 200 });
   } catch (error) {
      console.error(error);
      return new Response('Error fetching operation events', { status: 500 });
   }
};

export const POST = async (request) => {
   try {
      await connectDB();

      const sessionUser = await getSessionUser().catch(() => null);
      const body = await request.json();

      const propertyId = objectIdOrNull(body?.property);
      const leadId = objectIdOrNull(body?.lead);

      if (!propertyId && !leadId) {
         return Response.json({ error: 'property or lead required' }, { status: 400 });
      }

      const operationType = pick(body?.type, VALID_TYPES, 'showing');
      const createdByEmployee = objectIdOrNull(body?.createdByEmployee) || sessionUser?.employeeId || null;
      const financialProduct = await inheritedFinancialProduct(body);
      const item = await OperationEvent.create({
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
         pzs: operationType === 'pzs' ? pzsPayload(body, createdByEmployee) : undefined,
         review: operationType === 'review' ? reviewPayload(body) : undefined,
         createdByEmployee,
      });

      const populated = await OperationEvent.findById(item._id)
         .populate('responsibleEmployee', 'name fullName surname role color avatarUrl')
         .populate('shownByEmployee', 'name fullName surname role color avatarUrl')
         .populate('facilitatedByEmployee', 'name fullName surname role color avatarUrl')
         .populate('objectRealtorEmployee', 'name fullName surname role color avatarUrl')
         .populate('buyerRealtorEmployee', 'name fullName surname role color avatarUrl')
         .populate('createdByEmployee', 'name fullName surname role')
          .populate('pzs.sourceOperationEvent', 'type occurredAt resultShowing financialProduct showingKind')
          .populate('pzs.resultFinanceEvent', 'financeType occurredAt status financialProduct')
         .populate('property', 'title location_text location rooms square_tot floor floors cost currency images assignee actualityStatus actualityGroup')
         .populate('lead', 'name phones stage status requestSummary budgetMax assignee actualityStatus')
         .lean();

      await logActivity({
         entityType: 'operation',
         entityId: item._id,
         action: 'created',
         sessionUser,
         source: 'manual',
         title: operationTitle(populated),
         message: 'Створено операційну подію',
         after: pickActivitySnapshot(item, OPERATION_EVENT_FIELDS),
         meta: {
            pageName: 'Операційка',
            pagePath: '/crm/operations',
            operationType: item.type,
            propertyId: item.property,
            leadId: item.lead,
         },
      });

      return Response.json({ item: mapEvent(populated) }, { status: 201 });
   } catch (error) {
      console.error(error);
      return new Response('Error creating operation event', { status: 500 });
   }
};
