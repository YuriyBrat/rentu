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

const VALID_TYPES = ['showing', 'inspection', 'review', 'call', 'meeting', 'other'];
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
      const page = Math.max(parseInt(sp.get('page') || '1', 10), 1);
      const pageSize = Math.min(Math.max(parseInt(sp.get('pageSize') || '30', 10), 1), 100);
      const skip = (page - 1) * pageSize;

      const filter = {};

      if (VALID_TYPES.includes(type)) filter.type = type;
      if (VALID_SHOWING_RESULTS.includes(resultShowing)) filter.resultShowing = resultShowing;

      if (Types.ObjectId.isValid(property)) filter.property = property;
      if (Types.ObjectId.isValid(lead)) filter.lead = lead;

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
         filter.$and = [
            ...(filter.$and || []),
            {
               $or: [
                  { objectPartnerName: { $regex: q, $options: 'i' } },
                  { buyerPartnerName: { $regex: q, $options: 'i' } },
                  { objections: { $elemMatch: { $regex: q, $options: 'i' } } },
                  { objectionArguments: { $regex: q, $options: 'i' } },
                  { resultDescription: { $regex: q, $options: 'i' } },
               ],
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

      const item = await OperationEvent.create({
         type: pick(body?.type, VALID_TYPES, 'showing'),
         occurredAt: parseDate(body?.occurredAt) || new Date(),
         responsibleEmployee: objectIdOrNull(body?.responsibleEmployee),
         showingKind: pick(body?.showingKind, VALID_SHOWING_KINDS, 'primary'),
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
         createdByEmployee: objectIdOrNull(body?.createdByEmployee) || sessionUser?.employeeId || null,
      });

      const populated = await OperationEvent.findById(item._id)
         .populate('responsibleEmployee', 'name fullName surname role color avatarUrl')
         .populate('shownByEmployee', 'name fullName surname role color avatarUrl')
         .populate('facilitatedByEmployee', 'name fullName surname role color avatarUrl')
         .populate('objectRealtorEmployee', 'name fullName surname role color avatarUrl')
         .populate('buyerRealtorEmployee', 'name fullName surname role color avatarUrl')
         .populate('createdByEmployee', 'name fullName surname role')
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
