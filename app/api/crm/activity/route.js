import connectDB from '@/config/database';
import CRMActivityLog from '@/models/CRMActivityLog';
import Employee from '@/models/Employee';
import Property from '@/models/Property';
import { getSessionUser } from '@/utils/getSessionUser';
import { canViewPropertyOwnerContacts, redactPropertyOwnerContactText, restrictPropertyOwnerContacts, withPropertyOwnerContactScope } from '@/utils/crm/propertyVisibility';
import { Types } from 'mongoose';

void Employee;

function objectIdOrNull(value) {
   if (!value) return null;
   return Types.ObjectId.isValid(value) ? new Types.ObjectId(value) : null;
}

function parseDate(value) {
   if (!value) return null;
   const d = new Date(value);
   return Number.isNaN(d.getTime()) ? null : d;
}

export const GET = async (req) => {
   try {
      await connectDB();
      const sessionUser = await withPropertyOwnerContactScope(await getSessionUser().catch(() => null));
      if (!sessionUser) return Response.json({ error: 'Unauthorized' }, { status: 401 });

      const sp = req.nextUrl.searchParams;
      const page = Math.max(parseInt(sp.get('page') || '1', 10), 1);
      const pageSize = Math.min(Math.max(parseInt(sp.get('pageSize') || '50', 10), 1), 200);
      const skip = (page - 1) * pageSize;

      const filter = {};
      const entityType = (sp.get('entityType') || '').trim();
      const action = (sp.get('action') || '').trim();
      const source = (sp.get('source') || '').trim();
      const actorEmployee = objectIdOrNull(sp.get('actorEmployee'));
      const entityId = objectIdOrNull(sp.get('entityId'));
      const dateFrom = parseDate(sp.get('dateFrom'));
      const dateTo = parseDate(sp.get('dateTo'));

      if (entityType && entityType !== 'all') filter.entityType = entityType;
      if (action && action !== 'all') filter.action = action;
      if (source && source !== 'all') filter.source = source;
      if (actorEmployee) filter.actorEmployee = actorEmployee;
      if (entityId) filter.entityId = entityId;

      if (dateFrom || dateTo) {
         filter.createdAt = {};
         if (dateFrom) filter.createdAt.$gte = dateFrom;
         if (dateTo) filter.createdAt.$lte = dateTo;
      }

      const total = await CRMActivityLog.countDocuments(filter);
      const items = await CRMActivityLog.find(filter)
         .populate('actorEmployee', 'name fullName surname role color avatarUrl')
         .sort({ createdAt: -1 })
         .skip(skip)
         .limit(pageSize)
         .lean();

      let visibleItems = items;
      if (restrictPropertyOwnerContacts(sessionUser)) {
         const propertyIdOf = item => String(item.entityType === 'property' ? item.entityId || '' : item.meta?.propertyId || '');
         const propertyIds = [...new Set(items.map(propertyIdOf).filter(id => Types.ObjectId.isValid(id)))];
         const properties = propertyIds.length
            ? await Property.find({ _id: { $in: propertyIds } }).select('title assignee createdByEmployee owner owners phoneKeys').lean()
            : [];
         const byId = new Map(properties.map(property => [String(property._id), property]));
         visibleItems = items.map(item => {
            const propertyId = propertyIdOf(item);
            if (!propertyId) return item;
            const property = byId.get(propertyId);
            if (canViewPropertyOwnerContacts(sessionUser, property)) return item;
            return {
               _id: item._id, entityType: item.entityType, entityId: item.entityId,
               action: item.action, source: item.source, actorEmployee: item.actorEmployee,
               actorName: item.actorName, createdAt: item.createdAt,
               title: property ? redactPropertyOwnerContactText(property, property.title || 'Об’єкт агентства') : 'Об’єкт агентства',
               message: 'Зміни об’єкта агентства', before: null, after: null, diff: [],
               meta: { pageName: item.meta?.pageName, pagePath: item.meta?.pagePath, propertyId },
            };
         });
      }
      return Response.json({ items: visibleItems, total, page, pageSize }, { status: 200 });
   } catch (error) {
      console.error(error);
      return new Response('Error fetching activity logs', { status: 500 });
   }
};
