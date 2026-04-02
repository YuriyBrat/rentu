import connectDB from '@/config/database';
import Lead from '@/models/Lead';
import Employee from '@/models/Employee';
import { getSessionUser } from '@/utils/getSessionUser';

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

export const GET = async (req) => {
   try {
      await connectDB();

      const sp = req.nextUrl.searchParams;

      const q = (sp.get('q') || '').trim();
      const stage = (sp.get('stage') || '').trim();
      const status = (sp.get('status') || '').trim();

      const page = Math.max(parseInt(sp.get('page') || '1', 10), 1);
      const pageSize = Math.min(Math.max(parseInt(sp.get('pageSize') || '20', 10), 1), 100);
      const skip = (page - 1) * pageSize;

      const filter = { isArchived: { $ne: true } };

      if (stage && stage !== 'all') {
         filter.stage = stage;
      }

      if (status && status !== 'all') {
         filter.status = status;
      }

      if (q) {
         filter.$or = [
            { name: { $regex: q, $options: 'i' } },
            { phones: { $elemMatch: { $regex: q, $options: 'i' } } },
            { emails: { $elemMatch: { $regex: q, $options: 'i' } } },
            { requestSummary: { $regex: q, $options: 'i' } },
            { sourceChannel: { $regex: q, $options: 'i' } },
            { sourceObject: { $regex: q, $options: 'i' } },
            { sourceNote: { $regex: q, $options: 'i' } },
            { actualityStatus: { $regex: q, $options: 'i' } },
            { createdByName: { $regex: q, $options: 'i' } },
         ];
      }

      const total = await Lead.countDocuments(filter);

      const items = await Lead.find(filter)
         .populate('assignee', 'name role')
         .populate('createdByEmployee', 'name role')
         // .sort({ updatedAt: -1 })
         .sort({ lastActualizedAt: -1, createdAt: -1 })
         .skip(skip)
         .limit(pageSize)
         .lean();

      return Response.json({ items, total, page, pageSize }, { status: 200 });
   } catch (error) {
      console.error(error);
      return new Response('Error fetching leads', { status: 500 });
   }
};

export const POST = async (request) => {
   try {
      await connectDB();

      const sessionUser = await getSessionUser().catch(() => null);
      const body = await request.json();

      const phones = Array.isArray(body?.phones)
         ? body.phones.map((x) => String(x || '').trim()).filter(Boolean)
         : [];

      const emails = Array.isArray(body?.emails)
         ? body.emails.map((x) => String(x || '').trim().toLowerCase()).filter(Boolean)
         : [];

      let createdByEmployeeName = '';
      if (body?.createdByEmployee) {
         const emp = await Employee.findById(body.createdByEmployee).select('name').lean();
         createdByEmployeeName = emp?.name || '';
      }

      const notes = Array.isArray(body?.notes)
         ? body.notes
            .map((note) => ({
               text: String(note?.text || '').trim(),
               type: ['positive', 'negative', 'info', 'important'].includes(note?.type)
                  ? note.type
                  : 'info',
               createdByEmployee: body?.createdByEmployee || undefined,
               createdByName: createdByEmployeeName,
               createdAt: parseDate(note?.createdAt) || new Date(),
            }))
            .filter((x) => x.text)
         : [];

      // duplicate check by phone/email
      let duplicate = null;
      if (phones.length || emails.length) {
         duplicate = await Lead.findOne({
            isArchived: { $ne: true },
            $or: [
               ...(phones.length ? [{ phones: { $in: phones } }] : []),
               ...(emails.length ? [{ emails: { $in: emails } }] : []),
            ],
         })
            .select('_id name stage assignee updatedAt')
            .lean();
      };

      const leadAppearedAt = parseDate(body?.leadAppearedAt) || new Date();
      const lastActualizedAt = parseDate(body?.lastActualizedAt) || leadAppearedAt;

      const leadData = {
         name: String(body?.name || '').trim(),
         phones,
         emails,

         status: body?.status || 'lead',
         stage: body?.stage || 'lead',

         requestSummary: String(body?.requestSummary || '').trim(),
         budgetMax: parseNumber(body?.budgetMax),

         sourceChannel: String(body?.sourceChannel || '').trim(),
         sourceObject: String(body?.sourceObject || '').trim(),
         sourceNote: String(body?.sourceNote || '').trim(),

         actualityStatus: body?.actualityStatus || 'Актуальний. Продзвін',
         // lastActualizedAt: parseDate(body?.lastActualizedAt),
         lastContactAt: parseDate(body?.lastContactAt),

         assignee: body?.assignee || undefined,
         createdByEmployee: body?.createdByEmployee || undefined,
         // createdByName:
         //    String(body?.createdByName || sessionUser?.name || '').trim(),

         notes,

         duplicateState: duplicate ? 'possible' : '',
         duplicateOf: duplicate?._id || undefined,

         leadAppearedAt,
         lastActualizedAt,
      };

      if (!leadData.name) {
         return Response.json({ error: 'name required' }, { status: 400 });
      }

      const created = await Lead.create(leadData);

      const item = await Lead.findById(created._id)
         .populate('assignee', 'name role')
         .populate('createdByEmployee', 'name role')
         .lean();

      return Response.json(
         {
            item,
            duplicate: duplicate
               ? {
                  _id: duplicate._id,
                  name: duplicate.name,
                  stage: duplicate.stage,
                  assignee: duplicate.assignee,
                  updatedAt: duplicate.updatedAt,
               }
               : null,
         },
         { status: 201 }
      );
   } catch (error) {
      console.error(error);
      return new Response('Error creating lead', { status: 500 });
   }
};