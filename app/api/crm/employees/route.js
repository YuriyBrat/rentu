import bcrypt from 'bcryptjs';
import { getServerSession } from 'next-auth';
import connectDB from '@/config/database';
import Employee from '@/models/Employee';
import { authOptions } from '@/utils/authOptions';

const CAN_MANAGE_ROLES = ['owner'];

async function getCurrentCrmUser() {
   const session = await getServerSession(authOptions);
   if (!session?.user) return null;
   return session.user;
}

function canManageEmployees(user) {
   return !!user && (user.isFallbackAdmin || CAN_MANAGE_ROLES.includes(user.role));
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

function cleanObjectId(value) {
   const v = String(value || '').trim();
   return /^[a-f\d]{24}$/i.test(v) ? v : null;
}

function cleanPhoto(photo, fallbackKind = 'photo') {
   const url = String(photo?.url || '').trim();
   if (!url) return null;

   return {
      url,
      publicId: String(photo?.publicId || photo?.public_id || '').trim(),
      kind: photo?.kind === 'live' || fallbackKind === 'live' ? 'live' : 'photo',
      caption: String(photo?.caption || '').trim(),
      showInPortfolio: photo?.showInPortfolio !== false,
      isPrimary: !!photo?.isPrimary,
      isHidden: !!photo?.isHidden,
      uploadedAt: parseDate(photo?.uploadedAt) || new Date(),
   };
}

function cleanPhone(phone, idx = 0) {
   if (typeof phone === 'string') {
      const number = phone.trim();
      if (!number) return null;
      return {
         number,
         type: idx === 0 ? 'personal' : 'work',
         note: '',
         showInPortfolio: idx === 0,
         isPrimary: idx === 0,
      };
   }

   const number = String(phone?.number || phone?.value || '').trim();
   if (!number) return null;

   return {
      number,
      type: ['personal', 'work', 'other'].includes(phone?.type) ? phone.type : 'work',
      note: String(phone?.note || '').trim(),
      showInPortfolio: !!phone?.showInPortfolio,
      isPrimary: !!phone?.isPrimary,
   };
}

function normalizePrimaryFlags(items) {
   const requestedPrimaryIndex = items.findIndex((item) => item.isPrimary);
   const primaryIndex = requestedPrimaryIndex >= 0 ? requestedPrimaryIndex : 0;
   return items.map((item, idx) => ({
      ...item,
      isPrimary: idx === primaryIndex,
   }));
}

function normalizeEmployeeBody(body) {
   const phones = Array.isArray(body?.phones)
      ? normalizePrimaryFlags(body.phones.map((x, idx) => cleanPhone(x, idx)).filter(Boolean))
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
            createdByEmployee: cleanObjectId(note?.createdByEmployee) || undefined,
            createdByName: String(note?.createdByName || '').trim(),
            createdAt: parseDate(note?.createdAt) || new Date(),
         }))
         .filter((x) => x.text)
      : [];

   const photos = Array.isArray(body?.photos)
      ? body.photos.map((photo) => cleanPhoto(photo)).filter(Boolean)
      : [];

   return {
      name: String(body?.name || '').trim(),
      phones,
      emails,
      position: String(body?.position || '').trim(),
      role: body?.role || 'viewer',
      manager: cleanObjectId(body?.manager),
      login: String(body?.login || '').trim().toLowerCase(),
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
      photos,
      livePhoto: cleanPhoto(body?.livePhoto, 'live') || undefined,
   };
}

export const GET = async (req) => {
   try {
      const currentUser = await getCurrentCrmUser();
      if (!currentUser) {
         return Response.json({ error: 'Unauthorized' }, { status: 401 });
      }

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
            { 'phones.number': { $regex: q, $options: 'i' } },
            { 'phones.note': { $regex: q, $options: 'i' } },
            { emails: { $elemMatch: { $regex: q, $options: 'i' } } },
            { 'links.name': { $regex: q, $options: 'i' } },
            { 'links.url': { $regex: q, $options: 'i' } },
         ];
      }

      const items = await Employee.find(filter)
         .select('-passwordHash')
         .populate('manager', 'name position role avatarUrl color')
         .sort({ displayOrder: 1, name: 1 })
         .lean();

      return Response.json({ items, canManage: canManageEmployees(currentUser) }, { status: 200 });
   } catch (error) {
      console.error(error);
      return new Response('Error fetching employees', { status: 500 });
   }
};

export const POST = async (request) => {
   try {
      const currentUser = await getCurrentCrmUser();
      if (!currentUser) {
         return Response.json({ error: 'Unauthorized' }, { status: 401 });
      }

      if (!canManageEmployees(currentUser)) {
         return Response.json({ error: 'Only owner can manage personnel' }, { status: 403 });
      }

      await connectDB();

      const body = await request.json();
      const data = normalizeEmployeeBody(body);

      if (!data.name) {
         return Response.json({ error: 'name required' }, { status: 400 });
      }

      const password = String(body?.password || '').trim();

      let passwordHash = '';
      if (password) {
         passwordHash = await bcrypt.hash(password, 10);
      }

      const item = await Employee.create({
         ...data,
         login: data.login || undefined,
         passwordHash,
      });

      const safeItem = item.toObject();
      delete safeItem.passwordHash;

      return Response.json({ item: safeItem }, { status: 201 });
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

export const PUT = async (request) => {
   try {
      const currentUser = await getCurrentCrmUser();
      if (!currentUser) {
         return Response.json({ error: 'Unauthorized' }, { status: 401 });
      }

      if (!canManageEmployees(currentUser)) {
         return Response.json({ error: 'Only owner can manage personnel' }, { status: 403 });
      }

      await connectDB();

      const body = await request.json();
      const id = cleanObjectId(body?._id || body?.id);
      if (!id) {
         return Response.json({ error: 'employee id required' }, { status: 400 });
      }

      const data = normalizeEmployeeBody(body);
      if (!data.name) {
         return Response.json({ error: 'name required' }, { status: 400 });
      }

      if (data.manager && data.manager === id) {
         return Response.json({ error: 'Employee cannot report to themself' }, { status: 400 });
      }

      const password = String(body?.password || '').trim();
      const update = {
         ...data,
         login: data.login || undefined,
      };

      if (password) {
         update.passwordHash = await bcrypt.hash(password, 10);
      }

      const item = await Employee.findByIdAndUpdate(id, update, {
         new: true,
         runValidators: true,
      }).select('-passwordHash').lean();

      if (!item) {
         return Response.json({ error: 'employee not found' }, { status: 404 });
      }

      return Response.json({ item }, { status: 200 });
   } catch (error) {
      console.error(error);

      if (error?.code === 11000) {
         return Response.json({ error: 'Такий login вже існує' }, { status: 409 });
      }

      return new Response('Error updating employee', { status: 500 });
   }
};
