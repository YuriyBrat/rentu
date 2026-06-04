import connectDB from '@/config/database';
import cloudinary from '@/config/cloudinary';
import LeadProperty from '@/models/LeadProperty';
import Property from '@/models/Property';
import { attachPhoneIntel, buildPhoneIntelMap } from '@/utils/crm/phoneIntel';
import { getSessionUser } from '@/utils/getSessionUser';
import { randomUUID } from 'crypto';

const STAGES = ['raw', 'processing', 'called', 'qualified', 'duplicate', 'fake', 'rejected', 'moved'];

function parseDate(value) {
   if (!value) return null;
   const d = new Date(value);
   return Number.isNaN(d.getTime()) ? null : d;
}

function parseNumber(value) {
   if (value === undefined || value === null || value === '') return undefined;
   const n = Number(value);
   return Number.isNaN(n) ? undefined : n;
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

function normalizeCallCenterPatch(value) {
   if (!value || typeof value !== 'object') return null;

   const patch = {};

   if (value.verifiedAddressText !== undefined) patch.verifiedAddressText = String(value.verifiedAddressText || '').trim();
   if (value.infoVerified !== undefined) patch.infoVerified = pickEnum(value.infoVerified, ['unchecked', 'verified', 'partial', 'mismatch', ''], 'unchecked');
   if (value.inspectionLoyalty !== undefined) patch.inspectionLoyalty = pickEnum(value.inspectionLoyalty, ['unknown', 'yes', 'maybe', 'no', ''], 'unknown');
   if (value.bottomPrice !== undefined) patch.bottomPrice = parseNumber(value.bottomPrice) ?? null;
   if (value.interestLevel !== undefined) patch.interestLevel = clampRating(value.interestLevel) ?? null;
   if (value.urgencyLevel !== undefined) patch.urgencyLevel = clampRating(value.urgencyLevel) ?? null;
   if (value.cooperationWarmth !== undefined) patch.cooperationWarmth = clampRating(value.cooperationWarmth) ?? null;
   if (value.note !== undefined) patch.note = String(value.note || '').trim();

   if (Object.keys(patch).length) {
      patch.updatedAt = parseDate(value.updatedAt) || new Date();
      patch.updatedBy = value.updatedBy || null;
   }

   return patch;
}

function normalizeKey(value) {
   return String(value || '').trim().toLowerCase();
}

function canDeleteParsing(sessionUser) {
   const role = sessionUser?.role || sessionUser?.user?.role || '';
   return !!sessionUser?.isFallbackAdmin || role === 'owner';
}

function applyEditableFields(item, body) {
   item.attrs = item.attrs && typeof item.attrs === 'object' ? item.attrs : {};

   const stringFields = [
      'source',
      'sourceId',
      'sourceUrl',
      'type_estate',
      'type_deal',
      'title',
      'location_text',
      'currency',
      'leadname',
      'phone',
      'email',
      'description',
   ];

   stringFields.forEach((field) => {
      if (body?.[field] !== undefined) item[field] = String(body[field] || '').trim();
   });

   ['rooms', 'square_tot', 'floor', 'floors', 'cost'].forEach((field) => {
      if (body?.[field] !== undefined) {
         const value = parseNumber(body[field]);
         item[field] = value === undefined ? null : value;
      }
   });

   if (body?.sourcePublishedAt !== undefined) item.attrs.sourcePublishedAt = parseDate(body.sourcePublishedAt);
   if (body?.sourceAddedAt !== undefined) item.attrs.sourceAddedAt = parseDate(body.sourceAddedAt);
   if (body?.sourceUpdatedAt !== undefined) item.attrs.sourceUpdatedAt = parseDate(body.sourceUpdatedAt);
   if (body?.sourcePriceChangedAt !== undefined) item.attrs.sourcePriceChangedAt = parseDate(body.sourcePriceChangedAt);

   if (body?.contactType !== undefined) {
      item.attrs.contactType = String(body.contactType || 'unknown').trim() || 'unknown';
      if (body.contactType === 'owner' || body.contactType === 'realtor') {
         item.reviewStatus = body.contactType;
      } else if (!['actual', 'not_actual'].includes(item.reviewStatus)) {
         item.reviewStatus = 'unknown';
      }
   }
}

function ensureSourceId(item) {
   if (item.sourceId) return;

   // Legacy guard for old test rows created before sourceId generation existed.
   // New rows get sourceId in POST; remove this after cleaning old LeadProperty data.
   const source = String(item.source || 'manual').trim() || 'manual';
   const url = String(item.sourceUrl || '').trim();

   item.sourceId = url
      ? `url:${normalizeKey(url)}`
      : `local:${source}:${Date.now()}:${randomUUID()}`;
}

function buildPropertyData(lead, options = {}) {
   const title = lead.title?.trim() || lead.location_text?.trim() || 'Обʼєкт з парсингу';

   return {
      title,
      type_estate: lead.type_estate || '',
      type_deal: lead.type_deal || '',
      location_text: lead.location_text || '',
      location: {
         city: lead.location?.city || '',
         street: lead.location?.street || '',
         number: lead.location?.number || '',
      },
      rooms: lead.rooms,
      square_tot: lead.square_tot,
      floor: lead.floor,
      floors: lead.floors,
      cost: lead.cost,
      currency: lead.currency || 'USD',
      description: lead.description || '',
      advantages: Array.isArray(lead.advantages) ? lead.advantages : [],
      sourceLeadId: lead._id,
      source: lead.source || 'parsing',
      crmStage: 'base',
      actualityGroup: options.actualityGroup || 'active',
      actualityNote: options.actualityNote || '',
      owners: lead.phone || lead.leadname || lead.email
         ? [{
            name: lead.leadname || '',
            phones: lead.phone ? [lead.phone] : [],
            emails: lead.email ? [lead.email] : [],
            status: 'active',
            isPrimary: true,
            notes: lead.reviewNote || lead.callResult || '',
         }]
         : [],
      advertisingLinks: lead.sourceUrl
         ? [{
            platform: ['olx', 'dimria', 'rieltor', 'facebook', 'instagram'].includes(lead.source)
               ? lead.source
               : 'other',
            title: lead.source || 'Джерело',
            url: lead.sourceUrl,
            status: 'active',
            sourceType: 'owner',
            note: 'Імпортовано з парсингу',
         }]
         : [],
      images: [],
      workHistory: [{
         type: 'note',
         tone: 'info',
         text: `Створено з бази парсингу${lead.source ? ` (${lead.source})` : ''}. Фото лишились у записі парсингу.`,
      }],
   };
}

export const GET = async (_request, { params }) => {
   try {
      await connectDB();

      const item = await LeadProperty.findById(params.id)
         .populate('assignedToEmployee', 'name fullName surname role')
         .populate('propertyId', 'title actualityGroup crmStage')
         .populate('duplicateOf', 'title source sourceUrl')
         .populate('duplicatePropertyId', 'title location_text crmStage actualityGroup')
         .lean();

      if (!item) return new Response('Parsed property not found', { status: 404 });

      const phoneIntelMap = await buildPhoneIntelMap();
      const [itemWithPhoneCount] = attachPhoneIntel([item], phoneIntelMap);

      return Response.json({ item: itemWithPhoneCount }, { status: 200 });
   } catch (error) {
      console.error(error);
      return new Response('Error fetching parsed property', { status: 500 });
   }
};

export const PATCH = async (request, { params }) => {
   try {
      await connectDB();

      const body = await request.json();
      const item = await LeadProperty.findById(params.id);

      if (!item) return new Response('Parsed property not found', { status: 404 });

      if (body?.action === 'moveToObjects') {
         const callCenterPatch = normalizeCallCenterPatch(body.callCenter);
         if (callCenterPatch) {
            item.callCenter = {
               ...(item.callCenter?.toObject ? item.callCenter.toObject() : item.callCenter || {}),
               ...callCenterPatch,
            };
         }

         if (item.propertyId) {
            item.stage = 'moved';
            ensureSourceId(item);
            await item.save();
            return Response.json({ item, propertyId: item.propertyId }, { status: 200 });
         }

         const property = await Property.create(buildPropertyData(item, {
            actualityGroup: ['active', 'paused', 'inactive'].includes(body?.actualityGroup)
               ? body.actualityGroup
               : 'active',
            actualityNote: String(body?.actualityNote || body?.marketReason || '').trim(),
         }));
         item.stage = 'moved';
         item.propertyId = property._id;
         item.reviewStatus = body?.actualityGroup === 'inactive' ? 'not_actual' : 'actual';
         item.lastCallAt = item.lastCallAt || new Date();
         ensureSourceId(item);
         await item.save();

         return Response.json({ item, property }, { status: 200 });
      }

      if (STAGES.includes(body?.stage)) item.stage = body.stage;
      if (body?.reviewStatus !== undefined) item.reviewStatus = body.reviewStatus || '';
      if (body?.callResult !== undefined) item.callResult = String(body.callResult || '').trim();
      if (body?.reviewNote !== undefined) item.reviewNote = String(body.reviewNote || '').trim();
      if (body?.lastCallAt !== undefined) item.lastCallAt = parseDate(body.lastCallAt);
      if (body?.assignedToEmployee !== undefined) item.assignedToEmployee = body.assignedToEmployee || null;
      if (body?.duplicateOf !== undefined) item.duplicateOf = body.duplicateOf || null;
      if (body?.duplicatePropertyId !== undefined) item.duplicatePropertyId = body.duplicatePropertyId || null;
      if (body?.sourceStatus !== undefined) item.sourceStatus = String(body.sourceStatus || 'unknown').trim() || 'unknown';
      if (body?.sourceCheckedAt !== undefined) item.sourceCheckedAt = parseDate(body.sourceCheckedAt);
      if (body?.editableFields === true) applyEditableFields(item, body);
      if (body?.callCenter !== undefined) {
         const callCenterPatch = normalizeCallCenterPatch(body.callCenter);
         if (callCenterPatch) {
            item.callCenter = {
               ...(item.callCenter?.toObject ? item.callCenter.toObject() : item.callCenter || {}),
               ...callCenterPatch,
            };
         }
      }

      if (item.stage === 'duplicate' && !item.duplicatePropertyId) {
         const phoneTail = String(item.phone || '').replace(/\D/g, '').slice(-9);
         if (phoneTail) {
            const match = await Property.findOne({ 'owners.phones': { $regex: phoneTail } })
               .select('_id')
               .lean();
            if (match?._id) item.duplicatePropertyId = match._id;
         }
      }

      ensureSourceId(item);
      await item.save();

      const saved = await LeadProperty.findById(item._id)
         .populate('assignedToEmployee', 'name fullName surname role')
         .populate('propertyId', 'title actualityGroup crmStage')
         .populate('duplicateOf', 'title source sourceUrl')
         .populate('duplicatePropertyId', 'title location_text crmStage actualityGroup')
         .lean();

      const phoneIntelMap = await buildPhoneIntelMap();
      const [savedWithPhoneCount] = attachPhoneIntel([saved], phoneIntelMap);

      return Response.json({ item: savedWithPhoneCount }, { status: 200 });
   } catch (error) {
      console.error(error);
      return new Response('Error updating parsed property', { status: 500 });
   }
};

export const DELETE = async (_request, { params }) => {
   try {
      await connectDB();

      const sessionUser = await getSessionUser().catch(() => null);
      if (!canDeleteParsing(sessionUser)) {
         return Response.json({ error: 'delete forbidden' }, { status: 403 });
      }

      const item = await LeadProperty.findById(params.id);
      if (!item) return new Response('Parsed property not found', { status: 404 });

      const publicIds = (Array.isArray(item.images) ? item.images : [])
         .map((image) => image?.public_id)
         .filter(Boolean);

      for (const publicId of publicIds) {
         try {
            await cloudinary.uploader.destroy(publicId, { resource_type: 'image' });
         } catch (error) {
            console.error('Parsing image delete failed:', publicId, error);
         }
      }

      await item.deleteOne();

      return Response.json({ ok: true, deletedImages: publicIds.length }, { status: 200 });
   } catch (error) {
      console.error(error);
      return new Response('Error deleting parsed property', { status: 500 });
   }
};
