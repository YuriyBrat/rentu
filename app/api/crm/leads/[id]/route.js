import connectDB from '@/config/database';
import Lead from '@/models/Lead';
import Employee from '@/models/Employee';

function parseDate(value) {
   if (!value) return undefined;
   const d = new Date(value);
   return Number.isNaN(d.getTime()) ? undefined : d;
}

export const PATCH = async (request, { params }) => {
   try {
      await connectDB();

      const { id } = params;
      const body = await request.json();

      const lead = await Lead.findById(id);
      if (!lead) {
         return Response.json({ error: 'Lead not found' }, { status: 404 });
      }

      // 1) Додати нотатку
      if (body?.action === 'add_note') {
         const text = String(body?.text || '').trim();
         const type = ['positive', 'negative', 'info', 'important'].includes(body?.type)
            ? body.type
            : 'info';

         if (!text) {
            return Response.json({ error: 'Note text required' }, { status: 400 });
         }

         let createdByName = '';
         if (body?.createdByEmployee) {
            const emp = await Employee.findById(body.createdByEmployee).select('name').lean();
            createdByName = emp?.name || '';
         }

         const note = {
            text,
            type,
            createdByEmployee: body?.createdByEmployee || undefined,
            createdByName,
            createdAt: new Date(),
         };

         lead.notes = Array.isArray(lead.notes) ? [note, ...lead.notes] : [note];

         if (body?.updateLastContactAt !== false) {
            lead.lastContactAt = new Date();
         }

         if (body?.updateLastActualizedAt !== false) {
            lead.lastActualizedAt = new Date();
         }

         if (body?.actualityStatus) {
            lead.actualityStatus = body.actualityStatus;
         }

         await lead.save();

         const item = await Lead.findById(id)
            .populate('assignee', 'name role')
            .populate('createdByEmployee', 'name role')
            .lean();

         return Response.json({ item }, { status: 200 });
      }

      // 2) Зміна стадії
      if (body?.action === 'set_stage') {
         const nextStage = body?.stage;

         if (!['lead', 'hot', 'ps', 'rs', 'ds', 'zs', 'pers'].includes(nextStage)) {
            return Response.json({ error: 'Invalid stage' }, { status: 400 });
         }

         lead.stage = nextStage;
         await lead.save();

         const item = await Lead.findById(id)
            .populate('assignee', 'name role')
            .populate('createdByEmployee', 'name role')
            .lean();

         return Response.json({ item }, { status: 200 });
      }

      return Response.json({ error: 'Unsupported action' }, { status: 400 });
   } catch (error) {
      console.error(error);
      return new Response('Error updating lead', { status: 500 });
   }
};

