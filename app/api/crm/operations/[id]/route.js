import connectDB from '@/config/database';
import Employee from '@/models/Employee';
import Lead from '@/models/Lead';
import OperationEvent from '@/models/OperationEvent';
import Property from '@/models/Property';
import { Types } from 'mongoose';

void Employee;
void Lead;
void Property;

const VALID_TYPES = ['showing', 'review', 'call', 'meeting', 'other'];
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

function populateEvent(query) {
   return query
      .populate('responsibleEmployee', 'name fullName surname role color avatarUrl')
      .populate('shownByEmployee', 'name fullName surname role color avatarUrl')
      .populate('facilitatedByEmployee', 'name fullName surname role color avatarUrl')
      .populate('objectRealtorEmployee', 'name fullName surname role color avatarUrl')
      .populate('buyerRealtorEmployee', 'name fullName surname role color avatarUrl')
      .populate('createdByEmployee', 'name fullName surname role')
      .populate('property', 'title location_text location rooms square_tot floor floors cost currency images assignee actualityStatus actualityGroup')
      .populate('lead', 'name phones stage status requestSummary budgetMax assignee actualityStatus');
}

export const PATCH = async (request, { params }) => {
   try {
      await connectDB();

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

      const update = {
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
      };

      const updated = await OperationEvent.findByIdAndUpdate(id, update, {
         new: true,
         runValidators: true,
      });

      if (!updated) {
         return Response.json({ error: 'not found' }, { status: 404 });
      }

      const populated = await populateEvent(OperationEvent.findById(updated._id)).lean();
      return Response.json({ item: mapEvent(populated) }, { status: 200 });
   } catch (error) {
      console.error(error);
      return new Response('Error updating operation event', { status: 500 });
   }
};

export const DELETE = async (_request, { params }) => {
   try {
      await connectDB();

      const id = params?.id;
      if (!Types.ObjectId.isValid(id)) {
         return Response.json({ error: 'invalid id' }, { status: 400 });
      }

      const deleted = await OperationEvent.findByIdAndDelete(id).lean();

      if (!deleted) {
         return Response.json({ error: 'not found' }, { status: 404 });
      }

      return Response.json({ ok: true }, { status: 200 });
   } catch (error) {
      console.error(error);
      return new Response('Error deleting operation event', { status: 500 });
   }
};
