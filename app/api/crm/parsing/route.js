import connectDB from '@/config/database';
import LeadProperty from '@/models/LeadProperty';

function parseNumber(value) {
   if (value === undefined || value === null || value === '') return undefined;
   const n = Number(value);
   return Number.isNaN(n) ? undefined : n;
}

function normalizeImages(images) {
   if (!Array.isArray(images)) return [];
   return images.map((x) => String(x || '').trim()).filter(Boolean);
}

function normalizePhone(value) {
   const digits = String(value || '').replace(/\D/g, '');
   if (!digits) return '';

   if (digits.length === 12 && digits.startsWith('380')) return `0${digits.slice(3)}`;
   if (digits.length === 11 && digits.startsWith('80')) return `0${digits.slice(2)}`;
   if (digits.length === 9) return `0${digits}`;

   return digits;
}

async function getPhoneCountMap() {
   const rows = await LeadProperty.find({
      phone: { $exists: true, $nin: ['', null] },
   })
      .select('phone')
      .lean();

   return rows.reduce((acc, row) => {
      const key = normalizePhone(row.phone);
      if (!key) return acc;
      acc[key] = (acc[key] || 0) + 1;
      return acc;
   }, {});
}

function attachPhoneCounts(items, phoneCountMap) {
   return items.map((item) => {
      const phoneKey = normalizePhone(item?.phone);
      const phoneCount = phoneKey ? phoneCountMap[phoneKey] || 0 : 0;

      return {
         ...item,
         phoneCount,
         attrs: {
            ...(item.attrs || {}),
            phoneCount,
         },
      };
   });
}

export const GET = async (req) => {
   try {
      await connectDB();

      const sp = req.nextUrl.searchParams;
      const q = (sp.get('q') || '').trim();
      const stage = (sp.get('stage') || '').trim();
      const source = (sp.get('source') || '').trim();

      const page = Math.max(parseInt(sp.get('page') || '1', 10), 1);
      const pageSize = Math.min(Math.max(parseInt(sp.get('pageSize') || '40', 10), 1), 100);
      const skip = (page - 1) * pageSize;

      const filter = {};

      if (stage && stage !== 'all') filter.stage = stage;
      if (source && source !== 'all') filter.source = source;

      if (q) {
         filter.$or = [
            { title: { $regex: q, $options: 'i' } },
            { location_text: { $regex: q, $options: 'i' } },
            { 'location.city': { $regex: q, $options: 'i' } },
            { 'location.street': { $regex: q, $options: 'i' } },
            { phone: { $regex: q, $options: 'i' } },
            { source: { $regex: q, $options: 'i' } },
            { sourceUrl: { $regex: q, $options: 'i' } },
            { description: { $regex: q, $options: 'i' } },
         ];
      }

      const total = await LeadProperty.countDocuments(filter);

      const rawItems = await LeadProperty.find(filter)
         .populate('assignedToEmployee', 'name fullName surname role')
         .populate('propertyId', 'title actualityGroup')
         .populate('duplicateOf', 'title source sourceUrl')
         .sort({ importedAt: -1, updatedAt: -1 })
         .skip(skip)
         .limit(pageSize)
         .lean();

      const phoneCountMap = await getPhoneCountMap();
      const items = attachPhoneCounts(rawItems, phoneCountMap);

      const sources = await LeadProperty.distinct('source');

      return Response.json({ items, total, page, pageSize, sources }, { status: 200 });
   } catch (error) {
      console.error(error);
      return new Response('Error fetching parsed properties', { status: 500 });
   }
};

export const POST = async (request) => {
   try {
      await connectDB();

      const body = await request.json();

      const data = {
         source: String(body?.source || 'manual').trim() || 'manual',
         sourceId: String(body?.sourceId || '').trim() || undefined,
         sourceUrl: String(body?.sourceUrl || '').trim(),
         fingerprint: String(body?.fingerprint || '').trim(),
         stage: body?.stage || 'raw',

         type_estate: String(body?.type_estate || '').trim(),
         type_deal: String(body?.type_deal || '').trim(),
         title: String(body?.title || '').trim(),
         location_text: String(body?.location_text || '').trim(),
         location: {
            city: String(body?.location?.city || '').trim(),
            street: String(body?.location?.street || '').trim(),
            number: String(body?.location?.number || '').trim(),
         },
         rooms: parseNumber(body?.rooms),
         square_tot: parseNumber(body?.square_tot),
         floor: parseNumber(body?.floor),
         floors: parseNumber(body?.floors),
         cost: parseNumber(body?.cost),
         currency: String(body?.currency || 'USD').trim() || 'USD',
         description: String(body?.description || '').trim(),
         images: normalizeImages(body?.images),
         leadname: String(body?.leadname || '').trim(),
         phone: String(body?.phone || '').trim(),
         email: String(body?.email || '').trim(),
         attrs: body?.attrs && typeof body.attrs === 'object' ? body.attrs : {},
         raw: body?.raw,
      };

      const created = await LeadProperty.create(data);
      return Response.json({ item: created }, { status: 201 });
   } catch (error) {
      console.error(error);
      return new Response('Error creating parsed property', { status: 500 });
   }
};
