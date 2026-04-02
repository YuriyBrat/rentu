import bcrypt from 'bcryptjs';
import connectDB from '@/config/database';
import Employee from '@/models/Employee';

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
      const role = (sp.get('role') || '').trim();
      const active = (sp.get('active') || '').trim();

      const filter = {};

      if (role && role !== 'all') {
         filter.role = role;
      }

      if (active === 'true') {
         filter.isActive = true;
      } else if (active === 'false') {
         filter.isActive = false;
      }

      if (q) {
         filter.$or = [
            { name: { $regex: q, $options: 'i' } },
            { position: { $regex: q, $options: 'i' } },
            { role: { $regex: q, $options: 'i' } },
            { login: { $regex: q, $options: 'i' } },
            { about: { $regex: q, $options: 'i' } },
            { phones: { $elemMatch: { $regex: q, $options: 'i' } } },
            { emails: { $elemMatch: { $regex: q, $options: 'i' } } },
            { 'links.name': { $regex: q, $options: 'i' } },
            { 'links.url': { $regex: q, $options: 'i' } },
         ];
      }

      const items = await Employee.find(filter)
         .sort({ displayOrder: 1, name: 1 })
         .lean();

      return Response.json({ items }, { status: 200 });
   } catch (error) {
      console.error(error);
      return new Response('Error fetching employees', { status: 500 });
   }
};

export const POST = async (request) => {
   try {
      await connectDB();

      const body = await request.json();

      const name = String(body?.name || '').trim();
      if (!name) {
         return Response.json({ error: 'name required' }, { status: 400 });
      }

      const phones = Array.isArray(body?.phones)
         ? body.phones.map((x) => String(x || '').trim()).filter(Boolean)
         : [];

      const emails = Array.isArray(body?.emails)
         ? body.emails.map((x) => String(x || '').trim().toLowerCase()).filter(Boolean)
         : [];

      const links = Array.isArray(body?.links)
         ? body.links
            .map((link) => ({
               name: String(link?.name || '').trim(),
               url: String(link?.url || '').trim(),
               addedAt: parseDate(link?.addedAt) || new Date(),
            }))
            .filter((x) => x.name || x.url)
         : [];

      const notes = Array.isArray(body?.notes)
         ? body.notes
            .map((note) => ({
               text: String(note?.text || '').trim(),
               type: ['positive', 'negative', 'info', 'important'].includes(note?.type)
                  ? note.type
                  : 'info',
               createdByEmployee: note?.createdByEmployee || undefined,
               createdByName: String(note?.createdByName || '').trim(),
               createdAt: parseDate(note?.createdAt) || new Date(),
            }))
            .filter((x) => x.text)
         : [];

      const login = String(body?.login || '').trim().toLowerCase();
      const password = String(body?.password || '').trim();

      let passwordHash = '';
      if (password) {
         passwordHash = await bcrypt.hash(password, 10);
      }

      const item = await Employee.create({
         name,
         phones,
         emails,
         position: String(body?.position || '').trim(),
         role: body?.role || 'viewer',
         login: login || undefined,
         passwordHash,
         avatarUrl: String(body?.avatarUrl || '').trim(),
         avatarPublicId: String(body?.avatarPublicId || '').trim(),
         careerStartAt: parseDate(body?.careerStartAt),
         firedAt: parseDate(body?.firedAt),
         isActive: body?.isActive !== false,
         displayOrder: parseNumber(body?.displayOrder) ?? 0,
         color: String(body?.color || '').trim(),
         about: String(body?.about || '').trim(),
         links,
         notes,
      });

      return Response.json({ item }, { status: 201 });
   } catch (error) {
      console.error(error);

      if (error?.code === 11000) {
         return Response.json(
            { error: 'Такий login вже існує' },
            { status: 409 }
         );
      }

      return new Response('Error creating employee', { status: 500 });
   }
};