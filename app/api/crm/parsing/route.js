import connectDB from '@/config/database';
import cloudinary from '@/config/cloudinary';
import Communication from '@/models/Communication';
import Employee from '@/models/Employee';
import LeadProperty from '@/models/LeadProperty';
import { attachPhoneIntel, buildPhoneIntelMap, normalizePhone } from '@/utils/crm/phoneIntel';
import { randomUUID } from 'crypto';

function parseNumber(value) {
   if (value === undefined || value === null || value === '') return undefined;
   const n = Number(value);
   return Number.isNaN(n) ? undefined : n;
}

function parseDate(value) {
   if (!value) return undefined;
   const d = new Date(value);
   return Number.isNaN(d.getTime()) ? undefined : d;
}

function clampRating(value) {
   const n = parseNumber(value);
   if (!Number.isFinite(n)) return undefined;
   return Math.min(Math.max(Math.round(n), 1), 5);
}

function pickEnum(value, allowed, fallback) {
   const key = String(value || '').trim();
   return allowed.includes(key) ? key : fallback;
}

function normalizeCallCenter(value) {
   if (!value || typeof value !== 'object') return undefined;

   const data = {
      verifiedAddressText: String(value.verifiedAddressText || '').trim(),
      infoVerified: pickEnum(value.infoVerified, ['unchecked', 'verified', 'partial', 'mismatch', ''], 'unchecked'),
      inspectionLoyalty: pickEnum(value.inspectionLoyalty, ['unknown', 'yes', 'maybe', 'no', ''], 'unknown'),
      bottomPrice: parseNumber(value.bottomPrice),
      interestLevel: clampRating(value.interestLevel),
      urgencyLevel: clampRating(value.urgencyLevel),
      cooperationWarmth: clampRating(value.cooperationWarmth),
      note: String(value.note || '').trim(),
      updatedAt: parseDate(value.updatedAt) || new Date(),
      updatedBy: value.updatedBy || null,
   };

   return Object.fromEntries(Object.entries(data).filter(([, fieldValue]) => fieldValue !== undefined));
}

function normalizeImages(images) {
   if (!Array.isArray(images)) return [];
   return images
      .map((image, index) => {
         if (typeof image === 'string') {
            const url = image.trim();
            if (!url) return null;
            return {
               url,
               isMain: index === 0,
               sortOrder: index,
               origin: 'unknown',
               stage: 'raw',
               variants: { preview: url, card: url, full: url },
            };
         }

         if (image && typeof image === 'object') {
            const url = String(image.url || image.secure_url || '').trim();
            if (!url) return null;
            return {
               ...image,
               url,
               isMain: !!image.isMain,
               sortOrder: Number.isFinite(Number(image.sortOrder)) ? Number(image.sortOrder) : index,
               origin: ['owner', 'competitor', 'unknown'].includes(image.origin) ? image.origin : 'unknown',
               stage: image.stage || 'raw',
               variants: image.variants || { preview: url, card: url, full: url },
            };
         }

         return null;
      })
      .filter(Boolean);
}

function normalizeKey(value) {
   return String(value || '').trim().toLowerCase();
}

function escapeRegex(value) {
   return String(value || '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function addAndFilter(filter, condition) {
   if (!condition || !Object.keys(condition).length) return;
   filter.$and = Array.isArray(filter.$and) ? filter.$and : [];
   filter.$and.push(condition);
}

function buildSourceId(body, source) {
   const explicit = String(body?.sourceId || '').trim();
   if (explicit) return explicit;

   const url = String(body?.sourceUrl || '').trim();
   if (url) return `url:${normalizeKey(url)}`;

   return `local:${source}:${Date.now()}:${randomUUID()}`;
}

function buildFingerprint(body) {
   const explicit = String(body?.fingerprint || '').trim();
   if (explicit) return explicit;

   return [
      normalizePhone(body?.phone),
      normalizeKey(body?.location_text || [body?.location?.city || body?.city, body?.location?.street || body?.street, body?.location?.number || body?.number].filter(Boolean).join(' ')),
      String(body?.rooms || ''),
      String(body?.square_tot || body?.square || ''),
      String(body?.cost || body?.price || ''),
   ].filter(Boolean).join('|');
}

function normalizePriceHistory(value) {
   if (!Array.isArray(value)) return [];

   return value
      .map((item) => {
         const price = parseNumber(item?.price ?? item?.cost);
         if (price === undefined) return null;

         return {
            price,
            currency: String(item?.currency || 'USD').trim() || 'USD',
            changedAt: parseDate(item?.changedAt),
            detectedAt: parseDate(item?.detectedAt) || new Date(),
            source: String(item?.source || '').trim(),
            note: String(item?.note || '').trim(),
         };
      })
      .filter(Boolean);
}

function buildLeadPropertyData(raw) {
   const body = raw && typeof raw === 'object' ? raw : {};
   const attrs = body?.attrs && typeof body.attrs === 'object' ? body.attrs : {};
   const source = String(body?.source || 'manual').trim() || 'manual';

   return {
      source,
      sourceId: buildSourceId(body, source),
      sourceUrl: String(body?.sourceUrl || '').trim(),
      reamakId: String(body?.reamakId || body?.reamak_id || attrs.reamakId || '').trim(),
      sourceStatus: String(body?.sourceStatus || 'unknown').trim() || 'unknown',
      sourceCheckedAt: parseDate(body?.sourceCheckedAt),
      importedAt: parseDate(body?.importedAt) || new Date(),
      fingerprint: buildFingerprint(body),
      stage: body?.stage || 'raw',
      reviewStatus: String(body?.reviewStatus || 'unchecked').trim() || 'unchecked',
      callCenter: normalizeCallCenter(body?.callCenter),

      type_estate: String(body?.type_estate || '').trim(),
      type_deal: String(body?.type_deal || '').trim(),
      title: String(body?.title || '').trim(),
      location_text: String(body?.location_text || '').trim(),
      location: {
         city: String(body?.location?.city || body?.city || '').trim(),
         street: String(body?.location?.street || body?.street || '').trim(),
         number: String(body?.location?.number || body?.number || '').trim(),
      },
      rooms: parseNumber(body?.rooms),
      square_tot: parseNumber(body?.square_tot || body?.square),
      floor: parseNumber(body?.floor),
      floors: parseNumber(body?.floors),
      cost: parseNumber(body?.cost || body?.price),
      currency: String(body?.currency || 'USD').trim() || 'USD',
      priceHistory: normalizePriceHistory(body?.priceHistory || attrs.priceHistory),
      description: String(body?.description || '').trim(),
      images: normalizeImages(body?.images),
      leadname: String(body?.leadname || body?.contactName || '').trim(),
      phone: String(body?.phone || '').trim(),
      email: String(body?.email || '').trim(),
      attrs: {
         ...attrs,
         phoneNormalized: normalizePhone(body?.phone),
         sourcePublishedAt: parseDate(body?.sourcePublishedAt || attrs.sourcePublishedAt),
         sourceAddedAt: parseDate(body?.sourceAddedAt || attrs.sourceAddedAt),
         sourceUpdatedAt: parseDate(body?.sourceUpdatedAt || attrs.sourceUpdatedAt),
         sourcePriceChangedAt: parseDate(body?.sourcePriceChangedAt || attrs.sourcePriceChangedAt),
      },
      raw: body?.raw || body,
   };
}

function getFormString(formData, key) {
   const value = formData.get(key);
   return typeof value === 'string' ? value : '';
}

function parseJsonField(formData, key, fallback) {
   try {
      const parsed = JSON.parse(getFormString(formData, key) || '');
      return parsed === undefined || parsed === null ? fallback : parsed;
   } catch {
      return fallback;
   }
}

function buildLeadPropertyDataFromForm(formData) {
   const attrs = parseJsonField(formData, 'attrs', {});

   return buildLeadPropertyData({
      source: getFormString(formData, 'source') || 'manual',
      sourceId: getFormString(formData, 'sourceId'),
      sourceUrl: getFormString(formData, 'sourceUrl'),
      sourceStatus: getFormString(formData, 'sourceStatus') || 'unknown',
      sourceCheckedAt: getFormString(formData, 'sourceCheckedAt'),
      importedAt: getFormString(formData, 'importedAt') || new Date().toISOString(),
      reviewStatus: getFormString(formData, 'reviewStatus') || 'unchecked',
      callCenter: parseJsonField(formData, 'callCenter', undefined),
      sourcePublishedAt: getFormString(formData, 'sourcePublishedAt'),
      sourceAddedAt: getFormString(formData, 'sourceAddedAt'),
      sourceUpdatedAt: getFormString(formData, 'sourceUpdatedAt'),
      sourcePriceChangedAt: getFormString(formData, 'sourcePriceChangedAt'),
      type_estate: getFormString(formData, 'type_estate'),
      type_deal: getFormString(formData, 'type_deal'),
      title: getFormString(formData, 'title'),
      location_text: getFormString(formData, 'location_text'),
      location: {
         city: getFormString(formData, 'location.city'),
         street: getFormString(formData, 'location.street'),
         number: getFormString(formData, 'location.number'),
      },
      rooms: getFormString(formData, 'rooms'),
      square_tot: getFormString(formData, 'square_tot'),
      floor: getFormString(formData, 'floor'),
      floors: getFormString(formData, 'floors'),
      cost: getFormString(formData, 'cost'),
      currency: getFormString(formData, 'currency') || 'USD',
      description: getFormString(formData, 'description'),
      leadname: getFormString(formData, 'leadname'),
      phone: getFormString(formData, 'phone'),
      email: getFormString(formData, 'email'),
      attrs,
      raw: parseJsonField(formData, 'raw', undefined),
      images: parseJsonField(formData, 'imageUrls', []),
   });
}

function buildParsingImageVariants(publicId) {
   return {
      preview: cloudinary.url(publicId, {
         width: 400,
         height: 300,
         crop: 'fill',
         gravity: 'auto',
         fetch_format: 'auto',
         quality: 'auto',
         secure: true,
      }),
      card: cloudinary.url(publicId, {
         width: 900,
         height: 650,
         crop: 'fill',
         gravity: 'auto',
         fetch_format: 'auto',
         quality: 'auto',
         secure: true,
      }),
      full: cloudinary.url(publicId, {
         width: 2000,
         height: 1500,
         crop: 'limit',
         fetch_format: 'auto',
         quality: 'auto',
         secure: true,
      }),
   };
}

async function uploadParsingImage(file, leadId, meta, index) {
   const arrayBuffer = await file.arrayBuffer();
   const buffer = Buffer.from(new Uint8Array(arrayBuffer));
   const base64 = buffer.toString('base64');
   const mime = file.type || 'image/jpeg';

   const result = await cloudinary.uploader.upload(`data:${mime};base64,${base64}`, {
      folder: `karamax/parsing/${leadId}/raw`,
      resource_type: 'image',
   });

   return {
      url: result.secure_url,
      public_id: result.public_id,
      width: result.width,
      height: result.height,
      bytes: result.bytes,
      format: result.format,
      originalName: meta?.originalName || file?.name || 'image',
      isMain: !!meta?.isMain,
      sortOrder: Number.isFinite(Number(meta?.sortOrder)) ? Number(meta.sortOrder) : index,
      origin: ['owner', 'competitor', 'unknown'].includes(meta?.origin) ? meta.origin : 'unknown',
      sourceUrl: meta?.sourceUrl || '',
      stage: 'raw',
      variants: buildParsingImageVariants(result.public_id),
      uploadedAt: new Date(),
   };
}

async function attachUploadedImages(item, formData) {
   const files = formData.getAll('images').filter((file) => file && file.name);
   if (!files.length) return item;

   const imageMeta = parseJsonField(formData, 'imagesMeta', []);
   const uploaded = [];

   for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const meta = Array.isArray(imageMeta) ? imageMeta[i] || {} : {};
      try {
         uploaded.push(await uploadParsingImage(file, item._id, meta, i));
      } catch (error) {
         console.error('Parsing image upload failed:', file?.name || 'image', error);
      }
   }

   if (!uploaded.length) return item;

   uploaded.sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));

   if (!uploaded.some((image) => image.isMain)) {
      uploaded[0].isMain = true;
   }

   item.images = [...(Array.isArray(item.images) ? item.images : []), ...uploaded];
   await item.save();
   return item;
}

async function attachLastCommunications(items) {
   const ids = items.map((item) => item?._id).filter(Boolean);
   if (!ids.length) return items;

   const rows = await Communication.aggregate([
      {
         $match: {
            entityType: 'leadProperty',
            entityId: { $in: ids },
         },
      },
      { $sort: { happenedAt: -1, createdAt: -1 } },
      {
         $group: {
            _id: '$entityId',
            lastCommunicationAt: { $first: '$happenedAt' },
            lastCommunicationType: { $first: '$type' },
            lastCommunicationTone: { $first: '$tone' },
            communicationCount: { $sum: 1 },
         },
      },
   ]);

   const map = new Map(rows.map((row) => [String(row._id), row]));

   return items.map((item) => {
      const row = map.get(String(item._id));
      if (!row) return { ...item, communicationCount: 0 };

      return {
         ...item,
         lastCommunicationAt: row.lastCommunicationAt,
         lastCommunicationType: row.lastCommunicationType,
         lastCommunicationTone: row.lastCommunicationTone,
         communicationCount: row.communicationCount,
      };
   });
}

function getLeadIdsByContactKind(phoneIntelMap, contactKind) {
   const ids = [];

   Object.values(phoneIntelMap || {}).forEach((intel) => {
      const related = intel?.relatedParsing || [];

      if (contactKind === 'owner' || contactKind === 'realtor') {
         related.forEach((item) => {
            if (item?.contactKind === contactKind && item?._id) ids.push(item._id);
         });
         return;
      }

      if (intel?.suggestedKind !== contactKind) return;
      related.forEach((item) => {
         if (item?._id) ids.push(item._id);
      });
   });

   return ids;
}

function applyQualityFilter(filter, value) {
   if (value === 'phone') {
      addAndFilter(filter, { phone: { $exists: true, $nin: ['', null] } });
      return;
   }

   if (value === 'price') {
      addAndFilter(filter, { cost: { $exists: true, $ne: null, $gt: 0 } });
      return;
   }

   if (value === 'address') {
      addAndFilter(filter, {
         $or: [
            { location_text: { $exists: true, $nin: ['', null] } },
            { 'location.city': { $exists: true, $nin: ['', null] } },
            { 'location.street': { $exists: true, $nin: ['', null] } },
         ],
      });
      return;
   }

   if (value === 'link') {
      addAndFilter(filter, { sourceUrl: { $exists: true, $nin: ['', null] } });
      return;
   }

   if (value === 'photo') {
      addAndFilter(filter, { images: { $exists: true, $type: 'array', $ne: [] } });
   }
}

export const GET = async (req) => {
   try {
      await connectDB();

      const sp = req.nextUrl.searchParams;
      const q = (sp.get('q') || '').trim();
      const stage = (sp.get('stage') || '').trim();
      const source = (sp.get('source') || '').trim();
      const communicationFilter = (sp.get('communicationFilter') || 'all').trim();
      const contactKind = (sp.get('contactKind') || 'all').trim();
      const qualityFilters = (sp.get('qualityFilters') || '')
         .split(',')
         .map((value) => value.trim())
         .filter(Boolean);

      const page = Math.max(parseInt(sp.get('page') || '1', 10), 1);
      const pageSize = Math.min(Math.max(parseInt(sp.get('pageSize') || '40', 10), 1), 100);
      const skip = (page - 1) * pageSize;

      const filter = {};
      const phoneIntelMap = await buildPhoneIntelMap();

      if (stage && stage !== 'all') filter.stage = stage;
      if (source && source !== 'all') filter.source = source;

      if (q) {
         const safeQ = escapeRegex(q);
         filter.$or = [
            { title: { $regex: safeQ, $options: 'i' } },
            { location_text: { $regex: safeQ, $options: 'i' } },
            { 'location.city': { $regex: safeQ, $options: 'i' } },
            { 'location.street': { $regex: safeQ, $options: 'i' } },
            { phone: { $regex: safeQ, $options: 'i' } },
            { source: { $regex: safeQ, $options: 'i' } },
            { sourceUrl: { $regex: safeQ, $options: 'i' } },
            { description: { $regex: safeQ, $options: 'i' } },
         ];
      }

      if (communicationFilter === 'none') {
         const communicatedIds = await Communication.distinct('entityId', { entityType: 'leadProperty' });
         filter._id = { ...(filter._id || {}), $nin: communicatedIds };
      }

      if (communicationFilter === 'stale3') {
         const cutoff = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
         const staleRows = await Communication.aggregate([
            { $match: { entityType: 'leadProperty' } },
            { $sort: { happenedAt: -1, createdAt: -1 } },
            { $group: { _id: '$entityId', lastCommunicationAt: { $first: '$happenedAt' } } },
            { $match: { lastCommunicationAt: { $lt: cutoff } } },
         ]);
         const staleIds = staleRows.map((row) => row._id).filter(Boolean);
         filter._id = { ...(filter._id || {}), $in: staleIds };
      }

      if (contactKind && contactKind !== 'all') {
         const contactLeadIds = getLeadIdsByContactKind(phoneIntelMap, contactKind);

         if (contactKind === 'unknown') {
            addAndFilter(filter, {
               $or: [
                  { _id: { $in: contactLeadIds } },
                  { phone: { $exists: false } },
                  { phone: null },
                  { phone: '' },
               ],
            });
         } else {
            addAndFilter(filter, { _id: { $in: contactLeadIds } });
         }
      }

      qualityFilters.forEach((value) => applyQualityFilter(filter, value));

      const total = await LeadProperty.countDocuments(filter);

      const rawItems = await LeadProperty.find(filter)
         .populate('assignedToEmployee', 'name fullName surname role')
         .populate('propertyId', 'title actualityGroup crmStage')
         .populate('duplicateOf', 'title source sourceUrl')
         .populate('duplicatePropertyId', 'title location_text crmStage actualityGroup')
         .sort({ importedAt: -1, updatedAt: -1 })
         .skip(skip)
         .limit(pageSize)
         .lean();

      const itemsWithPhoneIntel = attachPhoneIntel(rawItems, phoneIntelMap);
      const items = await attachLastCommunications(itemsWithPhoneIntel);

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

      const contentType = request.headers.get('content-type') || '';

      if (contentType.includes('multipart/form-data')) {
         const formData = await request.formData();
         const doc = buildLeadPropertyDataFromForm(formData);
         const existing = await LeadProperty.findOne({
            source: doc.source,
            sourceId: doc.sourceId,
         }).select('_id source sourceId title sourceUrl').lean();

         if (existing) {
            return Response.json({
               item: null,
               items: [],
               total: 0,
               created: 0,
               duplicates: 1,
               failed: 0,
               duplicateItems: [existing],
               errors: [],
            }, { status: 200 });
         }

         const created = await LeadProperty.create(doc);
         const item = await attachUploadedImages(created, formData);

         return Response.json({
            item,
            items: [item],
            total: 1,
            created: 1,
            duplicates: 0,
            failed: 0,
            duplicateItems: [],
            errors: [],
         }, { status: 201 });
      }

      const body = await request.json();
      const payload = Array.isArray(body) ? body : Array.isArray(body?.items) ? body.items : [body];
      const docs = payload.map(buildLeadPropertyData);

      if (!docs.length) {
         return Response.json({ error: 'empty payload' }, { status: 400 });
      }

      const created = [];
      const duplicateItems = [];
      const errors = [];

      for (const doc of docs) {
         try {
            const existing = await LeadProperty.findOne({
               source: doc.source,
               sourceId: doc.sourceId,
            }).select('_id source sourceId title sourceUrl').lean();

            if (existing) {
               duplicateItems.push(existing);
               continue;
            }

            const item = await LeadProperty.create(doc);
            created.push(item);
         } catch (error) {
            if (error?.code === 11000) {
               duplicateItems.push({
                  source: doc.source,
                  sourceId: doc.sourceId,
                  title: doc.title,
                  sourceUrl: doc.sourceUrl,
               });
               continue;
            }

            errors.push({
               source: doc.source,
               sourceId: doc.sourceId,
               title: doc.title,
               error: error?.message || 'unknown error',
            });
         }
      }

      return Response.json(
         {
            item: created[0] || null,
            items: created,
            total: created.length,
            created: created.length,
            duplicates: duplicateItems.length,
            failed: errors.length,
            duplicateItems,
            errors,
         },
         { status: errors.length && !created.length ? 400 : created.length ? 201 : 200 }
      );
   } catch (error) {
      console.error(error);
      return new Response('Error creating parsed property', { status: 500 });
   }
};
