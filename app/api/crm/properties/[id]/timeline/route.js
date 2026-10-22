import connectDB from '@/config/database';
import Lead from '@/models/Lead';
import OperationEvent from '@/models/OperationEvent';
import Property from '@/models/Property';
import { buildPropertyAccessFilter, combineMongoFilters } from '@/utils/crm/accessControl';
import { getSessionUser } from '@/utils/getSessionUser';
import { Types } from 'mongoose';

void Lead;

const OPERATION_TYPE_LABELS = {
   showing: 'Показ',
   inspection: 'Огляд',
   review: 'Огляд',
   call: 'Дзвінок',
   meeting: 'Зустріч',
   other: 'Операційка',
   pzs: 'ПЗС',
   loss: 'Втрата',
};

const OPERATION_KIND_LABELS = {
   zs: 'ЗС',
   pzs: 'ПЗС',
   showing: 'Показ',
   review: 'Огляд',
};

const RESULT_SHOWING_LABELS = {
   zs: 'ЗС',
   pzs: 'ПЗС',
   high_interest: 'висока зацікавленість',
   objections_found: 'виявлені заперечення',
   unclear: 'незрозуміло',
   refusal: 'відмова',
};

const RESULT_OBJECT_LABELS = {
   new_object: 'новий об’єкт',
   price_reduced: 'зменшено ціну',
   loyalty_improved: 'покращено лояльність',
   ad_removed_by_owner: 'знято рекламу власником',
   category_improved: 'покращено категорію об’єкта',
   exclusive_agreed: 'ексклюзив погоджено',
   exclusive_signed: 'ексклюзив підписано',
   documents_checked: 'перевірено документи',
};

const RESULT_BUYER_LABELS = {
   new_client: 'новий клієнт',
   loyalty_improved: 'покращено лояльність',
   exclusive_work: 'ексклюзивно працюємо',
   readiness_increased: 'підвищено готовність',
   deposit_taken: 'взято аванс',
   category_improved: 'покращено категорію',
};

function idString(value) {
   return value?._id?.toString?.() || value?.toString?.() || '';
}

function employeeName(employee) {
   if (!employee) return '';
   return (
      employee.fullName ||
      [employee.surname, employee.name].filter(Boolean).join(' ') ||
      employee.name ||
      ''
   );
}

function leadName(lead) {
   if (!lead) return '';
   return lead.name || lead.fullName || [lead.surname, lead.firstName].filter(Boolean).join(' ') || '';
}

function operationBuyerName(event) {
   return (
      leadName(event?.lead) ||
      leadName(event?.pzs?.sourceOperationEvent?.lead) ||
      ''
   );
}

function operationBuyerRealtorName(event) {
   const kind = event?.buyerRealtorKind || event?.pzs?.sourceOperationEvent?.buyerRealtorKind || '';
   if (kind === 'partner') {
      return event?.buyerPartnerName || event?.pzs?.sourceOperationEvent?.buyerPartnerName || 'СП';
   }
   if (kind === 'none') return '';

   return (
      employeeName(event?.buyerRealtorEmployee) ||
      employeeName(event?.pzs?.sourceOperationEvent?.buyerRealtorEmployee) ||
      ''
   );
}

function operationCounterpartyLine(event) {
   const buyer = operationBuyerName(event);
   const realtor = operationBuyerRealtorName(event);
   if (!buyer && !realtor) return '';

   return [
      `Покупець: ${buyer || 'Без клієнта'}`,
      realtor ? `рієлтор: ${realtor}` : '',
   ].filter(Boolean).join(' · ');
}

function isoDate(value) {
   if (!value) return null;
   const date = new Date(value);
   return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

function operationKind(event) {
   if (event?.type === 'pzs' || event?.resultShowing === 'pzs') return 'pzs';
   if (event?.resultShowing === 'zs') return 'zs';
   if (['inspection', 'review'].includes(event?.type)) return 'review';
   if (event?.type === 'showing') return 'showing';
   return event?.type || 'other';
}

function operationTone(event) {
   const kind = operationKind(event);
   if (kind === 'zs') return 'positive';
   if (kind === 'pzs') return 'pzs';
   if (['showing', 'review'].includes(kind)) return 'operationNeutral';
   if (event?.type === 'loss') return 'negative';
   if (event?.resultShowing === 'refusal') return 'negative';
   if (event?.resultShowing === 'high_interest') return 'positive';
   if (['new_object', 'price_reduced', 'loyalty_improved', 'exclusive_agreed', 'exclusive_signed', 'documents_checked'].includes(event?.resultObject)) return 'positive';
   if (event?.review?.result === 'not_taken') return 'negative';
   return 'important';
}

function operationText(event) {
   const counterparty = operationCounterpartyLine(event);
   const mainText = (
      event?.resultDescription ||
      event?.review?.note ||
      event?.review?.reason ||
      event?.pzs?.condition ||
      event?.loss?.note ||
      'Операційна подія по об’єкту'
   );

   if (counterparty) return [counterparty, mainText].filter(Boolean).join('\n');

   return (
      mainText
   );
}

function operationDetails(event) {
   const kind = operationKind(event);

   return [
      event?.type === 'showing' &&
      !['pzs', 'zs'].includes(kind) &&
      event?.resultShowing &&
      event.resultShowing !== 'unclear'
         ? `Результат показу: ${RESULT_SHOWING_LABELS[event.resultShowing] || event.resultShowing}`
         : '',
      event?.resultObject && event.resultObject !== 'none'
         ? `Результат об’єкта: ${RESULT_OBJECT_LABELS[event.resultObject] || event.resultObject}`
         : '',
      event?.resultBuyer && event.resultBuyer !== 'none'
         ? `Результат покупця: ${RESULT_BUYER_LABELS[event.resultBuyer] || event.resultBuyer}`
         : '',
   ].filter(Boolean);
}

function normalizeWorkNote(note) {
   return {
      _id: idString(note) || `work-${note?.createdAt || Math.random()}`,
      source: 'work',
      editable: true,
      type: note?.type || 'note',
      tone: note?.tone || 'info',
      label: '',
      text: note?.text || '',
      createdAt: isoDate(note?.createdAt),
   };
}

function normalizeOperation(event) {
   const who =
      employeeName(event?.responsibleEmployee) ||
      employeeName(event?.shownByEmployee) ||
      employeeName(event?.facilitatedByEmployee) ||
      employeeName(event?.createdByEmployee);

   return {
      _id: `operation-${idString(event)}`,
      source: 'operation',
      editable: false,
      operationId: idString(event),
      type: event?.type || 'other',
      operationKind: operationKind(event),
      tone: operationTone(event),
      label: OPERATION_KIND_LABELS[operationKind(event)] || OPERATION_TYPE_LABELS[event?.type] || 'Операційка',
      text: operationText(event),
      details: operationDetails(event),
      createdAt: isoDate(event?.occurredAt || event?.createdAt),
      meta: who ? `Операційка · ${who}` : 'Операційка',
   };
}

export const GET = async (_req, { params }) => {
   try {
      await connectDB();

      if (!Types.ObjectId.isValid(params.id)) {
         return Response.json({ error: 'Invalid property id' }, { status: 400 });
      }

      const sessionUser = await getSessionUser().catch(() => null);
      const propertyId = new Types.ObjectId(params.id);
      const accessFilter = await buildPropertyAccessFilter(sessionUser);
      const property = await Property.findOne(combineMongoFilters({ _id: propertyId }, accessFilter))
         .select('title location_text workHistory')
         .lean();

      if (!property) {
         return Response.json({ error: 'Property not found' }, { status: 404 });
      }

      const operations = await OperationEvent.find({ property: propertyId })
         .select('type occurredAt createdAt responsibleEmployee shownByEmployee facilitatedByEmployee createdByEmployee lead buyerRealtorKind buyerRealtorEmployee buyerPartnerName showingKind financialProduct resultObject resultBuyer resultShowing resultDescription review pzs loss')
         .populate('responsibleEmployee', 'name fullName surname')
         .populate('shownByEmployee', 'name fullName surname')
         .populate('facilitatedByEmployee', 'name fullName surname')
         .populate('createdByEmployee', 'name fullName surname')
         .populate('buyerRealtorEmployee', 'name fullName surname')
         .populate('lead', 'name phones stage status')
         .populate({
            path: 'pzs.sourceOperationEvent',
            select: 'lead type occurredAt resultShowing financialProduct showingKind buyerRealtorKind buyerRealtorEmployee buyerPartnerName',
            populate: [
               {
                  path: 'lead',
                  select: 'name phones stage status',
               },
               {
                  path: 'buyerRealtorEmployee',
                  select: 'name fullName surname',
               },
            ],
         })
         .sort({ occurredAt: -1, createdAt: -1 })
         .limit(80)
         .lean();

      const workItems = Array.isArray(property.workHistory)
         ? property.workHistory.map(normalizeWorkNote)
         : [];

      const operationItems = operations.map(normalizeOperation);
      const items = [...workItems, ...operationItems]
         .filter((item) => item.createdAt || item.text)
         .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
         .slice(0, 120);

      return Response.json({
         items,
         total: items.length,
         workHistoryCount: workItems.length,
         operationCount: operationItems.length,
      });
   } catch (error) {
      console.error(error);
      return Response.json({ error: 'Error fetching property timeline' }, { status: 500 });
   }
};
