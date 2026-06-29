import connectDB from '@/config/database';
import CRMActivityLog from '@/models/CRMActivityLog';
import Employee from '@/models/Employee';
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

      return Response.json({ items, total, page, pageSize }, { status: 200 });
   } catch (error) {
      console.error(error);
      return new Response('Error fetching activity logs', { status: 500 });
   }
};
