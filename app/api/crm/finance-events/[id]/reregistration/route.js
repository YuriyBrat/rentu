import connectDB from '@/config/database';
import Employee from '@/models/Employee';
import FinanceEvent from '@/models/FinanceEvent';
import Lead from '@/models/Lead';
import Property from '@/models/Property';
import {
   FINANCE_EVENT_FIELDS,
   buildActivityDiff,
   logActivity,
   pickActivitySnapshot,
} from '@/utils/crm/activityLog';
import { getSessionUser } from '@/utils/getSessionUser';
import { Types } from 'mongoose';

void Employee;
void Lead;
void Property;

const VALID_RESULTS = ['completed_success', 'completed_improved', 'completed_worse', 'failed'];
const VALID_PLACE_TYPES = ['notary', 'developer_sales', 'other'];
const SUCCESSFUL_REREGISTRATION_STATUSES = ['completed_success', 'completed_improved', 'completed_worse'];
const SOLD_BY_US_STATUS = 'Неактуальний. Реалізований мною';

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

function stringArray(value) {
   if (Array.isArray(value)) return value.map((x) => String(x || '').trim()).filter(Boolean);
   if (typeof value === 'string') return value.split('\n').map((x) => x.trim()).filter(Boolean);
   return [];
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
      .populate('reregistrationEvent', 'financeType occurredAt status');
}

function mapEvent(item) {
   return {
      ...item,
      _id: item._id?.toString?.() || item._id,
      kind: 'financeEvent',
      depositId: item.deposit?._id?.toString?.() || item.deposit?.toString?.() || item.deposit || null,
   };
}

async function markPropertySoldByReregistration(item, noteText = '') {
   if (!item?.property || !SUCCESSFUL_REREGISTRATION_STATUSES.includes(item.status)) return;

   const soldNote = ['Продано через ПЕРС', String(noteText || item.resultSummary || '').trim()]
      .filter(Boolean)
      .join('. ');

   await Property.findByIdAndUpdate(
      item.property,
      {
         $set: {
            actualityGroup: 'inactive',
            actualityStatus: SOLD_BY_US_STATUS,
            inactiveAt: item.occurredAt || new Date(),
            inactiveNote: soldNote,
            crmStage: 'archived',
            crmStageReason: 'Продано через ПЕРС',
         },
      },
      { runValidators: true }
   );
}

function financeTitle(item) {
   const propertyTitle = item?.property?.title || item?.property?.location_text;
   const leadName = item?.lead?.name;
   return ['ПЕРС', propertyTitle, leadName].filter(Boolean).join(' · ');
}

export const POST = async (request, { params }) => {
   try {
      await connectDB();

      const sessionUser = await getSessionUser().catch(() => null);
      const id = params?.id;
      if (!Types.ObjectId.isValid(id)) {
         return Response.json({ error: 'invalid deposit id' }, { status: 400 });
      }

      const deposit = await FinanceEvent.findById(id);
      if (!deposit || deposit.financeType !== 'deposit') {
         return Response.json({ error: 'deposit not found' }, { status: 404 });
      }

      const body = await request.json();
      const result = pick(body?.result || body?.status, VALID_RESULTS, 'completed_success');
      const createdByEmployee = sessionUser?.employeeId || null;

      const existingPers = await FinanceEvent.findOne({ financeType: 'reregistration', deposit: deposit._id });
      if (existingPers) {
         return Response.json({ error: 'reregistration already exists for this deposit' }, { status: 409 });
      }

      const beforeDeposit = pickActivitySnapshot(deposit, FINANCE_EVENT_FIELDS);
      const noteText = String(body?.note || '').trim();

      const item = await FinanceEvent.create({
         financeType: 'reregistration',
         deposit: deposit._id,
         occurredAt: parseDate(body?.occurredAt) || parseDate(deposit.scheduledReregistrationAt) || new Date(),
         responsibleEmployee: objectIdOrNull(body?.responsibleEmployee) || deposit.responsibleEmployee,
         processedByEmployee: objectIdOrNull(body?.processedByEmployee) || deposit.processedByEmployee,
         property: deposit.property,
         lead: deposit.lead,
         objectRealtorEmployee: deposit.objectRealtorEmployee,
         objectRealtorKind: deposit.objectRealtorKind || 'employee',
         objectPartnerName: deposit.objectPartnerName || '',
         buyerRealtorEmployee: deposit.buyerRealtorEmployee,
         buyerRealtorKind: deposit.buyerRealtorKind || 'employee',
         buyerPartnerName: deposit.buyerPartnerName || '',
         sourceOperationEvent: deposit.sourceOperationEvent,
         sourcePreDepositEvent: deposit.sourcePreDepositEvent,
         financialProduct: deposit.financialProduct || '',
         tensionLevel: Number(body?.tensionLevel || deposit.tensionLevel || 3),
         location: String(body?.location || deposit.location || '').trim(),
         status: result,
         reregistrationPlaceType: pick(body?.placeType || body?.reregistrationPlaceType, VALID_PLACE_TYPES, 'notary'),
         reregistrationPlaceName: String(body?.placeName || body?.reregistrationPlaceName || deposit.notary || '').trim(),
         notary: String(body?.notary || deposit.notary || '').trim(),
         sellerConditions: stringArray(body?.sellerConditions).length ? stringArray(body?.sellerConditions) : deposit.sellerConditions,
         buyerConditions: stringArray(body?.buyerConditions).length ? stringArray(body?.buyerConditions) : deposit.buyerConditions,
         agencyConditions: stringArray(body?.agencyConditions).length ? stringArray(body?.agencyConditions) : deposit.agencyConditions,
         resultSummary: String(body?.resultSummary || noteText || '').trim(),
         notes: noteText
            ? [{ text: noteText, color: result === 'failed' ? '#ef4444' : '#8b5cf6', createdByEmployee }]
            : [],
         createdByEmployee,
      });

      deposit.status = result;
      deposit.reregistrationEvent = item._id;
      if (noteText) {
         deposit.notes = [
            ...(Array.isArray(deposit.notes) ? deposit.notes : []),
            { text: `ПЕРС: ${noteText}`, color: result === 'failed' ? '#ef4444' : '#8b5cf6', createdByEmployee },
         ];
      }
      await deposit.save();

      await markPropertySoldByReregistration(item, noteText);

      const populated = await populateEvent(FinanceEvent.findById(item._id)).lean();
      const updatedDeposit = await FinanceEvent.findById(deposit._id);
      const afterDeposit = pickActivitySnapshot(updatedDeposit, FINANCE_EVENT_FIELDS);

      await logActivity({
         entityType: 'financeEvent',
         entityId: item._id,
         action: 'created',
         sessionUser,
         source: 'manual',
         title: financeTitle(populated),
         message: 'Створено фінансову подію: ПЕРС',
         after: pickActivitySnapshot(item, FINANCE_EVENT_FIELDS),
         meta: {
            pageName: 'Операційка',
            pagePath: '/crm/operations',
            financeType: item.financeType,
            depositId: deposit._id,
            propertyId: item.property,
            leadId: item.lead,
         },
      });

      await logActivity({
         entityType: 'financeEvent',
         entityId: deposit._id,
         action: 'updated',
         sessionUser,
         source: 'manual',
         title: 'Оновлено завдаток після ПЕРС',
         message: 'Оновлено статус завдатку після створення ПЕРС',
         before: beforeDeposit,
         after: afterDeposit,
         diff: buildActivityDiff(beforeDeposit, afterDeposit, FINANCE_EVENT_FIELDS),
         meta: {
            pageName: 'Операційка',
            pagePath: '/crm/operations',
            financeType: deposit.financeType,
            reregistrationEventId: item._id,
            propertyId: deposit.property,
            leadId: deposit.lead,
         },
      });

      return Response.json({ item: mapEvent(populated) }, { status: 201 });
   } catch (error) {
      console.error(error);
      return new Response('Error creating reregistration', { status: 500 });
   }
};
