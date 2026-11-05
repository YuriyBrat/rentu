import { Types } from 'mongoose';
import connectDB from '@/config/database';
import LeadProperty from '@/models/LeadProperty';
import Communication from '@/models/Communication';
import CRMActivityLog from '@/models/CRMActivityLog';
import { getSessionUser } from '@/utils/getSessionUser';
import { CALL_CENTER_ROLES, getCallActor, getNewCallQueueFilter, callPeriodStart, kyivDateKey } from '@/utils/crm/callCenter';
import { cachedCRMQuery } from '@/utils/crm/queryCache';

export const dynamic = 'force-dynamic';

export async function GET(request) {
   try {
      const session = await getSessionUser();
      const actor = getCallActor(session);
      if (!session?.user || !actor.key) return Response.json({ error: 'Увійди в CRM.' }, { status: 401 });
      if (!CALL_CENTER_ROLES.includes(actor.role)) return Response.json({ error: 'Недостатньо прав.' }, { status: 403 });
      await connectDB();
      const [latestLead, latestCommunication, latestActivity] = await Promise.all([
         LeadProperty.findOne().sort({ updatedAt: -1 }).select('updatedAt').lean(),
         Communication.findOne({ entityType: 'leadProperty' }).sort({ createdAt: -1 }).select('createdAt').lean(),
         CRMActivityLog.findOne({ entityType: { $in: ['leadProperty', 'communication'] } }).sort({ createdAt: -1 }).select('_id').lean(),
      ]);
      const revision = `${latestLead?.updatedAt?.toISOString() || ''}:${latestCommunication?.createdAt?.toISOString() || ''}:${latestActivity?._id || ''}`;
      const headers = { 'Cache-Control': 'no-store' };
      if (request.nextUrl.searchParams.get('summary') === '0') return Response.json({ actor, revision }, { headers });

      const days = [1, 7, 30].includes(Number(request.nextUrl.searchParams.get('days'))) ? Number(request.nextUrl.searchParams.get('days')) : 1;
      const now = new Date();
      const start = callPeriodStart(days, now);
      const graphStart = callPeriodStart(Math.max(days, 7), now);
      const employeeId = Types.ObjectId.isValid(actor.employeeId) ? new Types.ObjectId(actor.employeeId) : null;
      const author = { $or: [
         { 'meta.callCenter.actorKey': actor.key },
         ...(employeeId ? [{ createdByEmployee: employeeId }] : []),
      ] };
      const reportKey = `call-center:${actor.key}:${days}:${kyivDateKey(now)}:${revision}`;
      const [calls, baseEvents, inspectionEvents, queue, recent] = await Promise.all([
         cachedCRMQuery(`${reportKey}:calls`, 30000, () => Communication.aggregate([
            { $match: { entityType: 'leadProperty', type: 'call', happenedAt: { $gte: graphStart, $lte: now }, ...author } },
            { $lookup: { from: LeadProperty.collection.name, localField: 'entityId', foreignField: '_id', as: 'lead' } },
            { $project: { happenedAt: 1, outcome: '$meta.callCenter.outcome', canonicalId: { $ifNull: [{ $arrayElemAt: ['$lead.propertyId', 0] }, '$entityId'] } } },
         ])),
         cachedCRMQuery(`${reportKey}:base`, 30000, () => CRMActivityLog.aggregate([
            { $match: {
               entityType: 'leadProperty', action: 'moved', createdAt: { $gte: start, $lte: now },
               'before.propertyId': null, 'meta.actualityGroup': 'active',
               ...(employeeId ? { actorEmployee: employeeId } : { actorUserId: actor.key }),
            } },
            { $group: { _id: '$meta.propertyId' } },
         ])),
         cachedCRMQuery(`${reportKey}:inspection`, 30000, () => CRMActivityLog.aggregate([
            { $match: {
               entityType: 'leadProperty', createdAt: { $gte: start, $lte: now },
               diff: { $elemMatch: { field: 'callCenter.inspectionLoyalty', before: { $ne: 'yes' }, after: 'yes' } },
               ...(employeeId ? { actorEmployee: employeeId } : { actorUserId: actor.key }),
            } },
            { $group: { _id: { $ifNull: ['$after.propertyId', '$entityId'] } } },
         ])),
         cachedCRMQuery(`${reportKey}:queue`, 2000, () => LeadProperty.aggregate([{ $facet: {
            new: [{ $match: {
               stage: { $in: ['raw', 'processing', 'called'] },
               $and: [
                  getNewCallQueueFilter(),
                  { $or: [{ 'inspectionReservation.expiresAt': null }, { 'inspectionReservation.expiresAt': { $lte: now } }] },
               ],
            } }, { $count: 'count' }],
            retry: [{ $match: { 'callQueue.lastOutcome': { $in: ['no_answer', 'busy'] }, 'callQueue.nextContactAt': null } }, { $count: 'count' }],
            mine: [{ $match: { 'callQueue.ownerKey': actor.key, 'callQueue.expiresAt': { $gt: now } } }, { $count: 'count' }],
            callbacks: [{ $match: { 'callQueue.callbackOwnerKey': actor.key, 'callQueue.nextContactAt': { $ne: null } } }, { $count: 'count' }],
            overdue: [{ $match: { 'callQueue.callbackOwnerKey': actor.key, 'callQueue.nextContactAt': { $lte: now, $ne: null } } }, { $count: 'count' }],
            requests: [{ $match: { callRequests: { $elemMatch: { resolvedAt: null } } } }, { $count: 'count' }],
         } }])),
         cachedCRMQuery(`${reportKey}:recent`, 10000, () => Communication.find({ entityType: 'leadProperty', happenedAt: { $gte: start, $lte: now }, ...author })
            .sort({ happenedAt: -1 }).limit(8).select('entityId type text happenedAt meta').lean()),
      ]);
      const daysMap = new Map();
      for (let index = Math.max(days, 7) - 1; index >= 0; index--) {
         const date = new Date(`${kyivDateKey(now)}T12:00:00Z`);
         date.setUTCDate(date.getUTCDate() - index);
         const key = kyivDateKey(date);
         daysMap.set(key, { date: key, label: key.slice(8) + '.' + key.slice(5, 7), attempts: 0, reached: 0 });
      }
      const selected = calls.filter(call => call.happenedAt >= start);
      for (const call of calls) {
         const day = daysMap.get(kyivDateKey(call.happenedAt));
         if (day) {
            day.attempts++;
            if (['reached', 'callback'].includes(call.outcome)) day.reached++;
         }
      }
      const counts = Object.fromEntries(Object.entries(queue[0] || {}).map(([key, rows]) => [key, rows[0]?.count || 0]));
      return Response.json({
         actor, revision, days, start,
         stats: {
            attempts: selected.length,
            reached: selected.filter(call => ['reached', 'callback'].includes(call.outcome)).length,
            unique: new Set(selected.map(call => String(call.canonicalId))).size,
            addedBase: baseEvents.filter(event => event._id).length,
            inspectionReady: inspectionEvents.filter(event => event._id).length,
         },
         queue: counts, chart: Array.from(daysMap.values()), recent,
      }, { headers });
   } catch (error) {
      console.error('Call center summary:', error);
      return Response.json({ error: 'Не вдалося оновити кабінет продзвону.' }, { status: 500 });
   }
}
