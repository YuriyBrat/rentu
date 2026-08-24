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

const VALID_STEP_TYPES = ['negotiation', 'next_step', 'deposit', 'failed', 'note'];

function objectIdOrNull(value) {
   if (!value) return null;
   return Types.ObjectId.isValid(value) ? value : null;
}

function pick(value, options, fallback) {
   return options.includes(value) ? value : fallback;
}

function parseDate(value) {
   if (!value) return undefined;
   const d = new Date(value);
   return Number.isNaN(d.getTime()) ? undefined : d;
}

function populateEvent(query) {
   return query
      .populate('responsibleEmployee', 'name fullName surname role color avatarUrl')
      .populate('shownByEmployee', 'name fullName surname role color avatarUrl')
      .populate('facilitatedByEmployee', 'name fullName surname role color avatarUrl')
      .populate('objectRealtorEmployee', 'name fullName surname role color avatarUrl')
      .populate('buyerRealtorEmployee', 'name fullName surname role color avatarUrl')
      .populate('createdByEmployee', 'name fullName surname role')
      .populate('pzs.sourceOperationEvent', 'type occurredAt resultShowing')
      .populate('pzs.resultFinanceEvent', 'financeType occurredAt status')
      .populate('property', 'title location_text location rooms square_tot floor floors cost currency images assignee actualityStatus actualityGroup')
      .populate('lead', 'name phones stage status requestSummary budgetMax assignee actualityStatus');
}

function operationTitle(item) {
   const propertyTitle = item?.property?.title || item?.property?.location_text;
   const leadName = item?.lead?.name;
   return [propertyTitle, leadName].filter(Boolean).join(' · ') || 'ПЗС';
}

function stepPayload(body, fallbackType = 'note') {
   return {
      at: parseDate(body?.at) || new Date(),
      type: pick(body?.type, VALID_STEP_TYPES, fallbackType),
      text: String(body?.text || '').trim(),
      createdByEmployee: objectIdOrNull(body?.createdByEmployee) || null,
   };
}

function applyStatusFromStep(doc, step) {
   if (!step) return;
   if (step.type === 'failed') {
      doc.pzs.status = 'failed';
      doc.pzs.closedAt = step.at;
   } else if (step.type === 'deposit') {
      doc.pzs.status = 'deposit';
      doc.pzs.closedAt = step.at;
   } else if (step.type === 'next_step') {
      doc.pzs.nextStepAt = step.at;
   }
}

function recomputePzsState(doc) {
   if (!doc?.pzs) return;
   const steps = doc.pzs.steps || [];
   const lastClosingStep = [...steps].reverse().find((step) => ['failed', 'deposit'].includes(step.type));
   const lastNextStep = [...steps].reverse().find((step) => step.type === 'next_step');

   if (doc.pzs.resultFinanceEvent || lastClosingStep?.type === 'deposit') {
      doc.pzs.status = 'deposit';
      doc.pzs.closedAt = lastClosingStep?.at || doc.pzs.closedAt || null;
   } else if (lastClosingStep?.type === 'failed') {
      doc.pzs.status = 'failed';
      doc.pzs.closedAt = lastClosingStep.at || null;
   } else {
      doc.pzs.status = 'active';
      doc.pzs.closedAt = null;
   }

   doc.pzs.nextStepAt = lastNextStep?.at || null;
}

export const POST = async (request, { params }) => {
   try {
      await connectDB();

      const sessionUser = await getSessionUser().catch(() => null);
      const id = params?.id;
      if (!Types.ObjectId.isValid(id)) {
         return Response.json({ error: 'invalid id' }, { status: 400 });
      }

      const body = await request.json();
      const type = pick(body?.type, VALID_STEP_TYPES, 'note');
      const text = String(body?.text || '').trim();
      if (!text) {
         return Response.json({ error: 'step text required' }, { status: 400 });
      }

      const existing = await OperationEvent.findOne({ _id: id, type: 'pzs' });
      if (!existing) {
         return Response.json({ error: 'pzs not found' }, { status: 404 });
      }
      const beforeSnapshot = pickActivitySnapshot(existing, OPERATION_EVENT_FIELDS);

      const at = parseDate(body?.at) || new Date();
      const update = {
         $push: {
            'pzs.steps': {
               at,
               type,
               text,
               createdByEmployee: objectIdOrNull(body?.createdByEmployee) || sessionUser?.employeeId || null,
            },
         },
      };

      if (type === 'failed') {
         update.$set = {
            'pzs.status': 'failed',
            'pzs.closedAt': at,
         };
      }

      if (type === 'deposit') {
         update.$set = {
            'pzs.status': 'deposit',
            'pzs.closedAt': at,
         };
      }

      if (type === 'next_step') {
         update.$set = {
            'pzs.nextStepAt': at,
         };
      }

      const updated = await OperationEvent.findByIdAndUpdate(id, update, {
         new: true,
         runValidators: true,
      });

      const populated = await populateEvent(OperationEvent.findById(updated._id)).lean();
      const afterSnapshot = pickActivitySnapshot(updated, OPERATION_EVENT_FIELDS);

      await logActivity({
         entityType: 'operation',
         entityId: updated._id,
         action: 'updated',
         sessionUser,
         source: 'manual',
         title: operationTitle(populated),
         message: type === 'failed' ? 'ПЗС зірвано' : type === 'deposit' ? 'ПЗС переведено до завдатку' : 'Додано крок ПЗС',
         before: beforeSnapshot,
         after: afterSnapshot,
         diff: buildActivityDiff(beforeSnapshot, afterSnapshot, OPERATION_EVENT_FIELDS),
         meta: { pzsStepType: type },
      });

      return Response.json({ item: populated }, { status: 200 });
   } catch (error) {
      console.error(error);
      return new Response('Error adding PZS step', { status: 500 });
   }
};

export const PATCH = async (request, { params }) => {
   try {
      await connectDB();

      const sessionUser = await getSessionUser().catch(() => null);
      const id = params?.id;
      if (!Types.ObjectId.isValid(id)) {
         return Response.json({ error: 'invalid id' }, { status: 400 });
      }

      const body = await request.json();
      const index = Number(body?.index);
      if (!Number.isInteger(index) || index < 0) {
         return Response.json({ error: 'invalid step index' }, { status: 400 });
      }

      const text = String(body?.text || '').trim();
      if (!text) {
         return Response.json({ error: 'step text required' }, { status: 400 });
      }

      const existing = await OperationEvent.findOne({ _id: id, type: 'pzs' });
      if (!existing) {
         return Response.json({ error: 'pzs not found' }, { status: 404 });
      }
      if (!existing.pzs?.steps?.[index]) {
         return Response.json({ error: 'step not found' }, { status: 404 });
      }

      const beforeSnapshot = pickActivitySnapshot(existing, OPERATION_EVENT_FIELDS);
      const previous = existing.pzs.steps[index];
      const next = stepPayload(body, previous.type || 'note');
      next.createdByEmployee = previous.createdByEmployee || objectIdOrNull(body?.createdByEmployee) || sessionUser?.employeeId || null;

      existing.pzs.steps[index] = next;
      recomputePzsState(existing);
      applyStatusFromStep(existing, next);
      existing.markModified('pzs.steps');
      const updated = await existing.save();

      const populated = await populateEvent(OperationEvent.findById(updated._id)).lean();
      const afterSnapshot = pickActivitySnapshot(updated, OPERATION_EVENT_FIELDS);

      await logActivity({
         entityType: 'operation',
         entityId: updated._id,
         action: 'updated',
         sessionUser,
         source: 'manual',
         title: operationTitle(populated),
         message: 'Оновлено крок ПЗС',
         before: beforeSnapshot,
         after: afterSnapshot,
         diff: buildActivityDiff(beforeSnapshot, afterSnapshot, OPERATION_EVENT_FIELDS),
         meta: { pzsStepType: next.type, pzsStepIndex: index },
      });

      return Response.json({ item: populated }, { status: 200 });
   } catch (error) {
      console.error(error);
      return new Response('Error updating PZS step', { status: 500 });
   }
};

export const DELETE = async (request, { params }) => {
   try {
      await connectDB();

      const sessionUser = await getSessionUser().catch(() => null);
      const id = params?.id;
      if (!Types.ObjectId.isValid(id)) {
         return Response.json({ error: 'invalid id' }, { status: 400 });
      }

      const sp = request.nextUrl.searchParams;
      const index = Number(sp.get('index'));
      if (!Number.isInteger(index) || index < 0) {
         return Response.json({ error: 'invalid step index' }, { status: 400 });
      }

      const existing = await OperationEvent.findOne({ _id: id, type: 'pzs' });
      if (!existing) {
         return Response.json({ error: 'pzs not found' }, { status: 404 });
      }
      if (!existing.pzs?.steps?.[index]) {
         return Response.json({ error: 'step not found' }, { status: 404 });
      }

      const beforeSnapshot = pickActivitySnapshot(existing, OPERATION_EVENT_FIELDS);
      existing.pzs.steps.splice(index, 1);
      recomputePzsState(existing);
      existing.markModified('pzs.steps');
      const updated = await existing.save();

      const populated = await populateEvent(OperationEvent.findById(updated._id)).lean();
      const afterSnapshot = pickActivitySnapshot(updated, OPERATION_EVENT_FIELDS);

      await logActivity({
         entityType: 'operation',
         entityId: updated._id,
         action: 'updated',
         sessionUser,
         source: 'manual',
         title: operationTitle(populated),
         message: 'Видалено крок ПЗС',
         before: beforeSnapshot,
         after: afterSnapshot,
         diff: buildActivityDiff(beforeSnapshot, afterSnapshot, OPERATION_EVENT_FIELDS),
         meta: { pzsStepIndex: index },
      });

      return Response.json({ item: populated }, { status: 200 });
   } catch (error) {
      console.error(error);
      return new Response('Error deleting PZS step', { status: 500 });
   }
};
