import { Types } from 'mongoose';
import { randomUUID } from 'crypto';
import connectDB from '@/config/database';
import LeadProperty from '@/models/LeadProperty';
import Communication from '@/models/Communication';
import { getSessionUser } from '@/utils/getSessionUser';
import { logActivity } from '@/utils/crm/activityLog';
import { CALL_CENTER_ROLES, CALL_LEASE_MS, CALL_OUTCOMES, CALL_PRIORITIES, getCallActor, callClaimConflict } from '@/utils/crm/callCenter';

export async function POST(request, { params }) {
   try {
      const session = await getSessionUser();
      const actor = getCallActor(session);
      if (!session?.user || !actor.key) return Response.json({ error: 'Увійди в CRM.' }, { status: 401 });
      if (!CALL_CENTER_ROLES.includes(actor.role)) return Response.json({ error: 'Недостатньо прав.' }, { status: 403 });
      if (!Types.ObjectId.isValid(params.id)) return Response.json({ error: 'Некоректний об’єкт.' }, { status: 400 });
      const body = await request.json();
      await connectDB();
      const now = new Date();
      const id = params.id;
      let item;

      if (body.action === 'claim') {
         item = await LeadProperty.findOneAndUpdate({
            _id: id,
            $or: [
               { 'callQueue.ownerKey': actor.key },
               { 'callQueue.ownerKey': { $in: ['', null] } },
               { 'callQueue.expiresAt': { $lte: now } },
               { 'callQueue.expiresAt': null },
            ],
         }, { $set: {
            'callQueue.ownerKey': actor.key, 'callQueue.ownerName': actor.name,
            'callQueue.startedAt': now, 'callQueue.expiresAt': new Date(+now + CALL_LEASE_MS),
         } }, { new: true });
         if (!item) return Response.json({ error: 'Оголошення вже обробляє інший працівник. Онови список.' }, { status: 409 });
      } else if (body.action === 'heartbeat' || body.action === 'release') {
         item = await LeadProperty.findOneAndUpdate({ _id: id, 'callQueue.ownerKey': actor.key, 'callQueue.expiresAt': { $gt: now } }, {
            $set: body.action === 'heartbeat'
               ? { 'callQueue.expiresAt': new Date(+now + CALL_LEASE_MS) }
               : { 'callQueue.ownerKey': '', 'callQueue.ownerName': '', 'callQueue.expiresAt': now },
         }, { new: true });
         if (!item) return Response.json({ error: 'Твій сеанс обробки завершився. Візьми оголошення ще раз.' }, { status: 409 });
      } else if (body.action === 'priority') {
         if (!['owner', 'admin', 'manager', 'realtor'].includes(actor.role)) return Response.json({ error: 'Запит створює рієлтор або керівник.' }, { status: 403 });
         if (!Object.hasOwn(CALL_PRIORITIES, body.level)) return Response.json({ error: 'Обери пріоритет.' }, { status: 400 });
         const note = String(body.note || '').trim().slice(0, 1500);
         const dueAt = body.dueAt ? new Date(body.dueAt) : null;
         if (body.level === 'urgent' && (!note || !dueAt || !Number.isFinite(+dueAt) || dueAt <= now)) {
            return Response.json({ error: 'Для термінового запиту вкажи причину та майбутній час.' }, { status: 400 });
         }
         if (dueAt && !Number.isFinite(+dueAt)) return Response.json({ error: 'Некоректний час.' }, { status: 400 });
         // One active request per author, updated atomically; other realtors keep their requests.
         const value = { requestedByKey: actor.key, requestedByName: actor.name, level: body.level, note, dueAt, createdAt: now };
         item = await LeadProperty.findOneAndUpdate({ _id: id, callRequests: { $elemMatch: { requestedByKey: actor.key, resolvedAt: null } } },
            { $set: Object.fromEntries(Object.entries(value).map(([key, value]) => [`callRequests.$.${key}`, value])) }, { new: true });
         if (!item) {
            item = await LeadProperty.findOneAndUpdate({ _id: id, callRequests: { $not: { $elemMatch: { requestedByKey: actor.key, resolvedAt: null } } } },
               { $push: { callRequests: value } }, { new: true });
         }
         if (!item) return Response.json({ error: 'Запит змінився. Спробуй ще раз.' }, { status: 409 });
      } else if (body.action === 'resolveRequest') {
         if (!Types.ObjectId.isValid(body.requestId)) return Response.json({ error: 'Некоректний запит.' }, { status: 400 });
         const current = await LeadProperty.findById(id).lean();
         if (!current) return Response.json({ error: 'Оголошення не знайдено.' }, { status: 404 });
         if (callClaimConflict(current, actor.key)) return Response.json({ error: 'Оголошення обробляє інший працівник.' }, { status: 409 });
         const resolution = String(body.resolution || '').trim().slice(0, 1500);
         if (!resolution) return Response.json({ error: 'Додай відповідь на запит.' }, { status: 400 });
         item = await LeadProperty.findOneAndUpdate({ _id: id, 'callQueue.ownerKey': actor.key, 'callQueue.expiresAt': { $gt: now }, callRequests: { $elemMatch: { _id: body.requestId, resolvedAt: null } } }, {
            $set: { 'callRequests.$.resolvedAt': now, 'callRequests.$.resolvedByKey': actor.key, 'callRequests.$.resolution': resolution },
         }, { new: true });
      } else if (body.action === 'outcome') {
         if (!Object.hasOwn(CALL_OUTCOMES, body.outcome)) return Response.json({ error: 'Обери результат дзвінка.' }, { status: 400 });
         const requestId = String(body.submissionId || '');
         if (!/^[a-zA-Z0-9-]{16,80}$/.test(requestId)) return Response.json({ error: 'Некоректний ідентифікатор дзвінка.' }, { status: 400 });
         const text = String(body.text || '').trim().slice(0, 5000);
         const retainClaim = body.retainClaim === true;
         const happenedAt = body.happenedAt ? new Date(body.happenedAt) : now;
         if (!Number.isFinite(+happenedAt) || happenedAt > new Date(+now + 5 * 60000)) return Response.json({ error: 'Некоректний час дзвінка.' }, { status: 400 });
         const nextContactAt = body.nextContactAt ? new Date(body.nextContactAt) : null;
         if (nextContactAt && (!Number.isFinite(+nextContactAt) || nextContactAt <= now)) return Response.json({ error: 'Передзвін має бути в майбутньому.' }, { status: 400 });
         if (body.outcome === 'callback' && !nextContactAt) return Response.json({ error: 'Вкажи час передзвону.' }, { status: 400 });
         if (['reached', 'callback'].includes(body.outcome) && !text) return Response.json({ error: 'Коротко запиши результат розмови.' }, { status: 400 });

         let communication = await Communication.findOne({ 'meta.callCenter.requestId': requestId });
         if (communication && (communication.meta.callCenter.actorKey !== actor.key || String(communication.entityId) !== id)) {
            return Response.json({ error: 'Ідентифікатор дзвінка вже використано.' }, { status: 409 });
         }
         const completed = await LeadProperty.findOne({ _id: id, 'callQueue.lastSubmissionId': requestId }).lean();
         if (completed && communication) {
            if (!retainClaim) return Response.json({ item: completed, communication });
            // A retry resumes the same call without creating another history entry.
            const resumed = await LeadProperty.findOneAndUpdate({ _id: id, $or: [
               { 'callQueue.ownerKey': actor.key },
               { 'callQueue.ownerKey': { $in: ['', null] } },
               { 'callQueue.expiresAt': { $lte: now } },
               { 'callQueue.expiresAt': null },
            ] }, { $set: { 'callQueue.ownerKey': actor.key, 'callQueue.ownerName': actor.name, 'callQueue.expiresAt': new Date(+now + CALL_LEASE_MS) } }, { new: true });
            if (!resumed) return Response.json({ error: 'Дзвінок уже записано, але оголошення зараз обробляє інший працівник.' }, { status: 409 });
            return Response.json({ item: resumed, communication });
         }

         // Renew the owner's lease before saving the result. Claims never overwrite another owner.
         item = await LeadProperty.findOneAndUpdate({ _id: id, 'callQueue.ownerKey': actor.key, 'callQueue.expiresAt': { $gt: now } },
            { $set: { 'callQueue.expiresAt': new Date(+now + CALL_LEASE_MS) } }, { new: true });
         if (!item) return Response.json({ error: 'Спочатку візьми оголошення в обробку.' }, { status: 409 });
         if (!communication) {
            try {
               communication = await Communication.create({
                  entityType: 'leadProperty', entityId: id, type: 'call',
                  tone: ['positive', 'negative', 'important', 'info'].includes(body.tone) ? body.tone : body.outcome === 'reached' ? 'positive' : 'info',
                  happenedAt, text: text || CALL_OUTCOMES[body.outcome],
                  responsibleEmployee: actor.employeeId, createdByEmployee: actor.employeeId,
                  meta: {
                     parsingStatus: String(body.parsingStatus || '').slice(0, 30),
                     callCenter: { requestId, actorKey: actor.key, actorName: actor.name, outcome: body.outcome, nextContactAt },
                  },
               });
            } catch (error) {
               if (error.code !== 11000) throw error;
               communication = await Communication.findOne({ 'meta.callCenter.requestId': requestId });
               if (!communication || communication.meta.callCenter.actorKey !== actor.key || String(communication.entityId) !== id) {
                  return Response.json({ error: 'Ідентифікатор дзвінка вже використано.' }, { status: 409 });
               }
            }
         }
         const recordedOutcome = communication.meta.callCenter.outcome;
         const recordedNextContact = communication.meta.callCenter.nextContactAt || null;
         item = await LeadProperty.findOneAndUpdate({ _id: id, 'callQueue.ownerKey': actor.key }, { $set: {
            'callQueue.ownerKey': retainClaim ? actor.key : '', 'callQueue.ownerName': retainClaim ? actor.name : '',
            'callQueue.expiresAt': retainClaim ? new Date(+now + CALL_LEASE_MS) : now,
            'callQueue.nextContactAt': recordedNextContact, 'callQueue.callbackOwnerKey': recordedNextContact ? actor.key : '',
            'callQueue.lastOutcome': recordedOutcome, 'callQueue.lastHandledAt': now, 'callQueue.lastSubmissionId': requestId,
            lastCallAt: now,
         } }, { new: true });
         if (!item) item = await LeadProperty.findOne({ _id: id, 'callQueue.lastSubmissionId': requestId }).lean();
         if (!item) return Response.json({ error: 'Результат дзвінка записано. Онови список, щоб побачити актуальну обробку.' }, { status: 409 });
         return Response.json({ item, communication });
      } else {
         return Response.json({ error: 'Невідома дія.' }, { status: 400 });
      }
      if (!item) return Response.json({ error: 'Оголошення або активний запит не знайдено.' }, { status: 404 });
      if (['priority', 'resolveRequest'].includes(body.action)) {
         item = await LeadProperty.findOneAndUpdate({ _id: id }, [{ $set: {
            callPriorityRank: { $ifNull: [{ $max: { $map: {
               input: { $filter: { input: { $ifNull: ['$callRequests', []] }, as: 'request', cond: { $eq: [{ $ifNull: ['$$request.resolvedAt', null] }, null] } } },
               as: 'request', in: { $switch: { branches: [
                  { case: { $eq: ['$$request.level', 'urgent'] }, then: 3 },
                  { case: { $eq: ['$$request.level', 'priority'] }, then: 2 },
               ], default: 1 } },
            } } }, 0] },
         } }], { new: true });
      }
      if (!['heartbeat', 'release'].includes(body.action)) await logActivity({
         entityType: 'leadProperty', entityId: item._id, action: 'updated', sessionUser: session, source: 'manual',
         title: item.title, message: body.action === 'claim' ? `${actor.name}: в обробці` : body.action === 'priority' ? 'Запит на продзвін від рієлтора' : 'Виконано запит рієлтора',
         meta: { callCenterAction: body.action, actorKey: actor.key, eventId: randomUUID() },
      });
      return Response.json({ item });
   } catch (error) {
      console.error('Call center workflow:', error);
      return Response.json({ error: 'Не вдалося зберегти дію. Спробуй ще раз.' }, { status: 500 });
   }
}
