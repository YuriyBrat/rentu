import connectDB from '@/config/database';
import Lead from '@/models/Lead';
import Employee from '@/models/Employee';
import { getSessionUser } from '@/utils/getSessionUser';
import { Types } from 'mongoose';

const STAGE_ORDER = ['lead', 'hot', 'ps', 'rs', 'ds', 'pzs', 'zs', 'pers'];

function escapeRegex(value) {
   return String(value || '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

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
      const stageMin = (sp.get('stageMin') || '').trim();
      const actuality = (sp.get('actuality') || '').trim();
      const searchFields = (sp.get('searchFields') || '').trim();
      const status = (sp.get('status') || '').trim();

      const page = Math.max(parseInt(sp.get('page') || '1', 10), 1);
      const pageSize = Math.min(Math.max(parseInt(sp.get('pageSize') || '20', 10), 1), 100);
      const skip = (page - 1) * pageSize;

      const filter = { isArchived: { $ne: true } };

      if (stage && stage !== 'all') {
         filter.stage = stage;
      } else if (stageMin && STAGE_ORDER.includes(stageMin)) {
         filter.stage = { $in: STAGE_ORDER.slice(STAGE_ORDER.indexOf(stageMin)) };
      }

      if (status && status !== 'all') {
         filter.status = status;
      }

      if (actuality === 'active') {
         filter.actualityStatus = { $regex: '^Актуальний\\.', $options: 'i' };
      }

      if (q) {
         const safeQ = escapeRegex(q);
         const identitySearch = [
            { name: { $regex: safeQ, $options: 'i' } },
            { phones: { $elemMatch: { $regex: safeQ, $options: 'i' } } },
            { emails: { $elemMatch: { $regex: safeQ, $options: 'i' } } },
         ];

         if (Types.ObjectId.isValid(q)) {
            identitySearch.push({ _id: q });
         }

         filter.$or = searchFields === 'identity'
            ? identitySearch
            : [
               ...identitySearch,
               { requestSummary: { $regex: safeQ, $options: 'i' } },
               { sourceChannel: { $regex: safeQ, $options: 'i' } },
               { sourceObject: { $regex: safeQ, $options: 'i' } },
               { sourceNote: { $regex: safeQ, $options: 'i' } },
               { actualityStatus: { $regex: safeQ, $options: 'i' } },
               { createdByName: { $regex: safeQ, $options: 'i' } },
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
