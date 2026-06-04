import connectDB from '@/config/database';
import Communication, {
   COMMUNICATION_ENTITY_TYPES,
   COMMUNICATION_TONES,
   COMMUNICATION_TYPES,
} from '@/models/Communication';
import Employee from '@/models/Employee';
import OperationEvent from '@/models/OperationEvent';
import { getSessionUser } from '@/utils/getSessionUser';
import { Types } from 'mongoose';

void Employee;
void OperationEvent;

function objectIdOrNull(value) {
   if (!value) return null;
   return Types.ObjectId.isValid(value) ? value : null;
}

function parseDate(value) {
   if (!value) return undefined;
   const d = new Date(value);
   return Number.isNaN(d.getTime()) ? undefined : d;
}

function pick(value, options, fallback) {
   return options.includes(value) ? value : fallback;
}

function mapCommunication(item) {
   if (!item) return item;

   return {
      ...item,
      _id: item._id?.toString?.() || item._id,
      entityId: item.entityId?.toString?.() || item.entityId,
      operationEvent: item.operationEvent?._id
         ? {
            ...item.operationEvent,
            _id: item.operationEvent._id?.toString?.() || item.operationEvent._id,
         }
         : item.operationEvent,
   };
}

export const GET = async (req) => {
   try {
      await connectDB();

      const sp = req.nextUrl.searchParams;
      const entityType = (sp.get('entityType') || '').trim();
      const entityId = (sp.get('entityId') || '').trim();
      const page = Math.max(parseInt(sp.get('page') || '1', 10), 1);
      const pageSize = Math.min(Math.max(parseInt(sp.get('pageSize') || '50', 10), 1), 100);
      const skip = (page - 1) * pageSize;

      if (!COMMUNICATION_ENTITY_TYPES.includes(entityType)) {
         return Response.json({ error: 'invalid entityType' }, { status: 400 });
      }

      if (!Types.ObjectId.isValid(entityId)) {
         return Response.json({ error: 'invalid entityId' }, { status: 400 });
      }

      const filter = { entityType, entityId };
      const total = await Communication.countDocuments(filter);
      const rawItems = await Communication.find(filter)
         .populate('responsibleEmployee', 'name fullName surname role color avatarUrl')
         .populate('createdByEmployee', 'name fullName surname role color avatarUrl')
         .populate('operationEvent', 'type occurredAt resultDescription')
         .sort({ happenedAt: -1, createdAt: -1 })
         .skip(skip)
         .limit(pageSize)
         .lean();

      return Response.json({ items: rawItems.map(mapCommunication), total, page, pageSize }, { status: 200 });
   } catch (error) {
      console.error(error);
      return new Response('Error fetching communications', { status: 500 });
   }
};

export const POST = async (request) => {
   try {
      await connectDB();

      const sessionUser = await getSessionUser().catch(() => null);
      const body = await request.json();
      const entityType = pick(body?.entityType, COMMUNICATION_ENTITY_TYPES, '');
      const entityId = objectIdOrNull(body?.entityId);

      if (!entityType || !entityId) {
         return Response.json({ error: 'entityType and entityId required' }, { status: 400 });
      }

      const sessionEmployeeId = objectIdOrNull(sessionUser?.employeeId);
      const item = await Communication.create({
         entityType,
         entityId,
         type: pick(body?.type, COMMUNICATION_TYPES, 'note'),
         tone: pick(body?.tone, COMMUNICATION_TONES, 'info'),
         happenedAt: parseDate(body?.happenedAt) || new Date(),
         text: String(body?.text || '').trim(),
         responsibleEmployee: objectIdOrNull(body?.responsibleEmployee) || sessionEmployeeId,
         createdByEmployee: objectIdOrNull(body?.createdByEmployee) || sessionEmployeeId,
         operationEvent: objectIdOrNull(body?.operationEvent),
         meta: body?.meta && typeof body.meta === 'object' ? body.meta : {},
      });

      const populated = await Communication.findById(item._id)
         .populate('responsibleEmployee', 'name fullName surname role color avatarUrl')
         .populate('createdByEmployee', 'name fullName surname role color avatarUrl')
         .populate('operationEvent', 'type occurredAt resultDescription')
         .lean();

      return Response.json({ item: mapCommunication(populated) }, { status: 201 });
   } catch (error) {
      console.error(error);
      return new Response('Error creating communication', { status: 500 });
   }
};
