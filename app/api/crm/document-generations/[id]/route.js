import connectDB from '@/config/database';
import DocumentGeneration from '@/models/DocumentGeneration';
import { getSessionUser } from '@/utils/getSessionUser';
import { canManageEmployeeScope, isElevatedCrmUser } from '@/utils/crm/accessControl';
import { Types } from 'mongoose';

function idString(value) {
   return value?._id?.toString?.() || value?.toString?.() || '';
}

async function canAccessDocumentGeneration(sessionUser, item) {
   if (isElevatedCrmUser(sessionUser)) return true;
   return canManageEmployeeScope(sessionUser, [item?.generatedByEmployee]);
}

export const DELETE = async (req, { params }) => {
   try {
      const sessionUser = await getSessionUser().catch(() => null);
      if (!sessionUser) return Response.json({ error: 'Unauthorized' }, { status: 401 });

      const id = String(params?.id || '');
      if (!Types.ObjectId.isValid(id)) {
         return Response.json({ error: 'Invalid id' }, { status: 400 });
      }

      await connectDB();

      const item = await DocumentGeneration.findById(id).select('generatedByEmployee').lean();
      if (!item) return Response.json({ error: 'Not found' }, { status: 404 });

      if (!(await canAccessDocumentGeneration(sessionUser, item))) {
         return Response.json({ error: 'Forbidden' }, { status: 403 });
      }

      await DocumentGeneration.deleteOne({ _id: idString(item._id) });

      return Response.json({ ok: true }, { status: 200 });
   } catch (error) {
      console.error(error);
      return new Response('Error deleting document generation', { status: 500 });
   }
};
