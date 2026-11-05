import LeadProperty from '@/models/LeadProperty';
import Property from '@/models/Property';
import { cachedCRMQuery } from '@/utils/crm/queryCache';

export function getParsingStats(filter, now = new Date()) {
   const key = `parsing-stats:${Math.floor(+now / 5000)}:${JSON.stringify(filter)}`;
   return cachedCRMQuery(key, 5000, async () => {
      const rows = await LeadProperty.aggregate([
         { $match: filter },
         { $lookup: { from: Property.collection.name, let: { propertyId: '$propertyId' }, pipeline: [
            { $match: { $expr: { $eq: ['$_id', '$$propertyId'] } } },
            { $project: { crmStage: 1, actualityGroup: 1 } },
         ], as: 'linked' } },
         { $project: { stage: { $switch: {
            branches: [
               { case: { $and: [{ $eq: ['$stage', 'moved'] }, { $eq: [{ $arrayElemAt: ['$linked.actualityGroup', 0] }, 'inactive'] }] }, then: 'inactive' },
               { case: { $and: [{ $eq: ['$stage', 'moved'] }, { $eq: [{ $arrayElemAt: ['$linked.actualityGroup', 0] }, 'paused'] }] }, then: 'paused' },
               { case: { $gt: ['$inspectionReservation.expiresAt', now] }, then: 'inspection_reserved' },
               { case: { $in: ['$stage', ['raw', 'processing', 'called']] }, then: 'raw' },
               { case: { $eq: ['$stage', 'rejected'] }, then: 'fake' },
               { case: { $and: [{ $eq: ['$stage', 'moved'] }, { $in: [{ $arrayElemAt: ['$linked.crmStage', 0] }, ['rs', 'ds', 'zs']] }] }, then: 'objects' },
               { case: { $and: [
                  { $in: ['$stage', ['qualified', 'moved']] },
                  { $or: [{ $eq: ['$callCenter.inspectionLoyalty', 'yes'] }, { $eq: [{ $arrayElemAt: ['$linked.crmStage', 0] }, 'inspection'] }] },
               ] }, then: 'inspection_ready' },
               { case: { $in: ['$stage', ['qualified', 'moved']] }, then: 'base' },
            ], default: { $ifNull: ['$stage', 'raw'] },
         } } } },
         { $group: { _id: '$stage', count: { $sum: 1 } } },
      ]);
      return Object.fromEntries(rows.map(row => [row._id, row.count]));
   });
}
