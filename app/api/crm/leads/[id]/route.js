import connectDB from '@/config/database';
import Lead from '@/models/Lead';
import Employee from '@/models/Employee';

const VALID_STAGES = ['lead', 'hot', 'ps', 'rs', 'ds', 'pzs', 'zs', 'pers'];
const VALID_NOTE_TYPES = ['positive', 'negative', 'info', 'important'];

function parseDate(value) {
   if (!value) return undefined;
   const d = new Date(value);
   return Number.isNaN(d.getTime()) ? undefined : d;
}

function parseNumber(value) {
   if (value === undefined || value === null || value === '') return undefined;
   const n = Number(value);
   return Number.isNaN(n) ? undefined : n;
}

async function populateLead(id) {
   return Lead.findById(id)
      .populate('assignee', 'name role color avatarUrl')
      .populate('createdByEmployee', 'name role')
      .lean();
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
      if (body?.action === 'update') {
         const phones = Array.isArray(body?.phones)
            ? body.phones.map((x) => String(x || '').trim()).filter(Boolean)
            : [];

         const emails = Array.isArray(body?.emails)
            ? body.emails.map((x) => String(x || '').trim().toLowerCase()).filter(Boolean)
            : [];

         const name = String(body?.name || '').trim();
         if (!name) {
            return Response.json({ error: 'name required' }, { status: 400 });
         }

         lead.name = name;
         lead.phones = phones;
         lead.emails = emails;
         lead.stage = VALID_STAGES.includes(body?.stage) ? body.stage : lead.stage;
         lead.status = body?.status === 'client' ? 'client' : 'lead';
         lead.requestSummary = String(body?.requestSummary || '').trim();
         lead.budgetMax = parseNumber(body?.budgetMax);
         lead.sourceChannel = String(body?.sourceChannel || '').trim();
         lead.sourceObject = String(body?.sourceObject || '').trim();
         lead.sourceNote = String(body?.sourceNote || '').trim();
         if (body?.actualityStatus) lead.actualityStatus = body.actualityStatus;
         lead.lastActualizedAt = parseDate(body?.lastActualizedAt) || lead.lastActualizedAt;
         lead.lastContactAt = parseDate(body?.lastContactAt) || undefined;
         lead.leadAppearedAt = parseDate(body?.leadAppearedAt) || lead.leadAppearedAt;
         lead.assignee = body?.assignee || undefined;
         lead.createdByEmployee = body?.createdByEmployee || undefined;

         await lead.save();

         const item = await populateLead(id);
         return Response.json({ item }, { status: 200 });
      }

      if (body?.action === 'add_note') {
         const text = String(body?.text || '').trim();
         const type = VALID_NOTE_TYPES.includes(body?.type)
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

         const item = await populateLead(id);

         return Response.json({ item }, { status: 200 });
      }

      // 2) Зміна стадії
      // if (body?.action === 'set_stage') {
      //    const nextStage = body?.stage;

      //    if (!['lead', 'hot', 'ps', 'rs', 'ds', 'pzs', 'zs', 'pers'].includes(nextStage)) {
      //       return Response.json({ error: 'Invalid stage' }, { status: 400 });
      //    }

      //    // lead.stage = nextStage;
      //    // await lead.save();
      //    const prevStage = lead.stage;

      //    let changedByName = '';
      //    if (body?.changedByEmployee) {
      //       const emp = await Employee.findById(body.changedByEmployee).select('name').lean();
      //       changedByName = emp?.name || '';
      //    }

      //    lead.stage = nextStage;

      //    lead.history = Array.isArray(lead.history)
      //       ? [
      //          {
      //             type: 'stage_change',
      //             fromStage: prevStage,
      //             toStage: nextStage,
      //             changedByEmployee: body?.changedByEmployee || undefined,
      //             changedByName,
      //             createdAt: new Date(),
      //          },
      //          ...lead.history,
      //       ]
      //       : [
      //          {
      //             type: 'stage_change',
      //             fromStage: prevStage,
      //             toStage: nextStage,
      //             changedByEmployee: body?.changedByEmployee || undefined,
      //             changedByName,
      //             createdAt: new Date(),
      //          },
      //       ];

      //    await lead.save();




      //    const item = await Lead.findById(id)
      //       .populate('assignee', 'name role color avatarUrl')
      //       .populate('createdByEmployee', 'name role')
      //       .lean();

      //    return Response.json({ item }, { status: 200 });
      // }


      if (body?.action === 'set_stage') {
         const nextStage = body?.stage;

         if (!VALID_STAGES.includes(nextStage)) {
            return Response.json({ error: 'Invalid stage' }, { status: 400 });
         }

         let changedByName = '';
         if (body?.changedByEmployee) {
            const emp = await Employee.findById(body.changedByEmployee).select('name').lean();
            changedByName = emp?.name || '';
         }

         const prevStage = lead.stage;

         lead.stage = nextStage;
         lead.status = nextStage === 'lead' ? 'lead' : 'client';
         lead.lastContactAt = new Date();
         lead.lastActualizedAt = new Date();
         lead.history = Array.isArray(lead.history)
            ? [
               {
                  type: 'stage_change',
                  fromStage: prevStage,
                  toStage: nextStage,
                  changedByEmployee: body?.changedByEmployee || undefined,
                  changedByName,
                  createdAt: new Date(),
               },
               ...lead.history,
            ]
            : [
               {
                  type: 'stage_change',
                  fromStage: prevStage,
                  toStage: nextStage,
                  changedByEmployee: body?.changedByEmployee || undefined,
                  changedByName,
                  createdAt: new Date(),
               },
            ];

         await lead.save();

         const item = await populateLead(id);
         return Response.json({ item }, { status: 200 });
      }

      if (body?.action === 'set_stage_with_assignee') {
         const nextStage = body?.stage;
         const assignee = body?.assignee || undefined;
         const noteText = String(body?.noteText || '').trim();
         const noteType = VALID_NOTE_TYPES.includes(body?.noteType) ? body.noteType : 'info';

         if (!VALID_STAGES.includes(nextStage)) {
            return Response.json({ error: 'Invalid stage' }, { status: 400 });
         }

         let changedByName = '';
         if (body?.changedByEmployee) {
            const emp = await Employee.findById(body.changedByEmployee).select('name').lean();
            changedByName = emp?.name || '';
         }

         const prevStage = lead.stage;
         const prevAssignee = lead.assignee;

         lead.stage = nextStage;
         lead.assignee = assignee;

         const historyItems = [];

         historyItems.push({
            type: 'stage_change',
            fromStage: prevStage,
            toStage: nextStage,
            changedByEmployee: body?.changedByEmployee || undefined,
            changedByName,
            createdAt: new Date(),
         });

         if (String(prevAssignee || '') !== String(assignee || '')) {
            historyItems.push({
               type: 'assignee_change',
               assignee: assignee,
               changedByEmployee: body?.changedByEmployee || undefined,
               changedByName,
               createdAt: new Date(),
            });
         }

         if (noteText) {
            const note = {
               text: noteText,
               type: noteType,
               createdByEmployee: body?.changedByEmployee || undefined,
               createdByName: changedByName,
               createdAt: new Date(),
            };

            lead.notes = Array.isArray(lead.notes) ? [note, ...lead.notes] : [note];

            historyItems.push({
               type: 'note',
               note: noteText,
               changedByEmployee: body?.changedByEmployee || undefined,
               changedByName,
               createdAt: new Date(),
            });
         }

         lead.status = nextStage === 'lead' ? 'lead' : 'client';
         lead.lastContactAt = new Date();
         lead.lastActualizedAt = new Date();
         lead.history = Array.isArray(lead.history)
            ? [...historyItems, ...lead.history]
            : historyItems;

         await lead.save();

         const item = await populateLead(id);

         return Response.json({ item }, { status: 200 });
      }

      return Response.json({ error: 'Unsupported action' }, { status: 400 });
   } catch (error) {
      console.error(error);
      return new Response('Error updating lead', { status: 500 });
   }
};

export const DELETE = async (request, { params }) => {
   try {
      await connectDB();

      const { id } = params;
      const lead = await Lead.findById(id);

      if (!lead) {
         return Response.json({ error: 'Lead not found' }, { status: 404 });
      }

      lead.isArchived = true;
      await lead.save();

      return Response.json({ ok: true }, { status: 200 });
   } catch (error) {
      console.error(error);
      return new Response('Error deleting lead', { status: 500 });
   }
};
