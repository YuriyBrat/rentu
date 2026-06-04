import connectDB from '@/config/database';
import LeadProperty from '@/models/LeadProperty';
import {
   fetchDimriaAdvert,
   mapDimriaAdvertToLeadProperty,
   searchDimriaIds,
} from '@/utils/crm/dimriaClient';
import { normalizePhone } from '@/utils/crm/phoneIntel';

function parseBoolean(value, fallback = false) {
   if (value === undefined || value === null || value === '') return fallback;
   if (typeof value === 'boolean') return value;
   return ['1', 'true', 'yes', 'on'].includes(String(value).toLowerCase());
}

function parsePositiveInt(value, fallback, max) {
   const parsed = Number.parseInt(value, 10);
   if (!Number.isFinite(parsed) || parsed <= 0) return fallback;
   return Math.min(parsed, max);
}

function normalizeKey(value) {
   return String(value || '').trim().toLowerCase();
}

function buildFingerprint(item) {
   const location = item?.location_text ||
      [item?.location?.city, item?.location?.street, item?.location?.number].filter(Boolean).join(' ');

   return [
      normalizePhone(item?.phone),
      normalizeKey(location),
      String(item?.rooms || ''),
      String(item?.square_tot || ''),
      String(item?.cost || ''),
   ].filter(Boolean).join('|');
}

function normalizeImages(images) {
   if (!Array.isArray(images)) return [];

   return images
      .map((image, index) => {
         const url = typeof image === 'string' ? image.trim() : String(image?.url || '').trim();
         if (!url) return null;

         return {
            ...(typeof image === 'object' && image ? image : {}),
            url,
            isMain: index === 0,
            sortOrder: index,
            origin: 'unknown',
            sourceUrl: url,
            stage: 'raw',
            variants: {
               preview: url,
               card: url,
               full: url,
            },
         };
      })
      .filter(Boolean);
}

function parseDate(value) {
   if (!value) return null;
   const date = new Date(value);
   return Number.isNaN(date.getTime()) ? null : date;
}

function samePrice(a, b) {
   const left = Number(a);
   const right = Number(b);
   return Number.isFinite(left) && Number.isFinite(right) && left === right;
}

function buildInitialPriceHistory(item) {
   const price = Number(item?.cost);
   if (!Number.isFinite(price)) return [];

   return [{
      price,
      currency: item?.currency || 'USD',
      changedAt: parseDate(item?.attrs?.sourcePriceChangedAt || item?.attrs?.sourcePublishedAt || item?.attrs?.sourceAddedAt),
      detectedAt: new Date(),
      source: 'dimria',
      note: 'initial import',
   }];
}

function buildPriceChangeEntry(item) {
   const price = Number(item?.cost);
   if (!Number.isFinite(price)) return null;

   return {
      price,
      currency: item?.currency || 'USD',
      changedAt: parseDate(item?.attrs?.sourcePriceChangedAt),
      detectedAt: new Date(),
      source: 'dimria',
      note: 'scan detected price change',
   };
}

async function updateExistingFromScan(existing, item) {
   const updates = {
      sourceStatus: item.sourceStatus || existing.sourceStatus || 'unknown',
      sourceCheckedAt: new Date(),
      sourceUrl: item.sourceUrl || existing.sourceUrl || '',
      raw: item.raw,
      attrs: {
         ...(existing.attrs || {}),
         ...(item.attrs || {}),
         sourceLastScannedAt: new Date().toISOString(),
         previousCost: existing.cost,
         previousCurrency: existing.currency,
      },
   };

   if (Array.isArray(item.images) && item.images.length && (!Array.isArray(existing.images) || !existing.images.length)) {
      updates.images = item.images;
   }

   if (!Array.isArray(existing.priceHistory) || !existing.priceHistory.length) {
      const initialHistory = buildInitialPriceHistory(item);
      if (initialHistory.length) {
         updates.$pushInitialPriceHistory = initialHistory[0];
      }
   }

   if (!samePrice(existing.cost, item.cost)) {
      updates.cost = item.cost;
      updates.currency = item.currency;
      const entry = buildPriceChangeEntry(item);
      if (entry) {
         const push = updates.$pushInitialPriceHistory
            ? { priceHistory: { $each: [updates.$pushInitialPriceHistory, entry] } }
            : { priceHistory: entry };
         delete updates.$pushInitialPriceHistory;
         await LeadProperty.updateOne({ _id: existing._id }, { $set: updates, $push: push });
         return;
      }
   }

   if (updates.$pushInitialPriceHistory) {
      const entry = updates.$pushInitialPriceHistory;
      delete updates.$pushInitialPriceHistory;
      await LeadProperty.updateOne({ _id: existing._id }, { $set: updates, $push: { priceHistory: entry } });
      return;
   }

   await LeadProperty.updateOne({ _id: existing._id }, { $set: updates });
}

function buildBodyFromSearchParams(searchParams) {
   const params = {};
   searchParams.forEach((value, key) => {
      params[key] = value;
   });

   return params;
}

async function readRequestInput(request, defaults = {}) {
   const requestUrl = new URL(request.url);

   if (request.method === 'GET') {
      return {
         ...defaults,
         ...buildBodyFromSearchParams(requestUrl.searchParams),
         dryRun: true,
      };
   }

   const contentType = request.headers.get('content-type') || '';
   if (!contentType.includes('application/json')) {
      return defaults;
   }

   const body = await request.json().catch(() => ({}));
   return {
      ...defaults,
      ...(body && typeof body === 'object' ? body : {}),
   };
}

async function fetchLeadItems(ids) {
   const items = [];
   const errors = [];

   for (const id of ids) {
      try {
         const advert = await fetchDimriaAdvert(id);
         const item = mapDimriaAdvertToLeadProperty(advert);
         items.push({
            ...item,
            images: normalizeImages(item.images),
            fingerprint: buildFingerprint(item),
            priceHistory: Array.isArray(item.priceHistory) && item.priceHistory.length
               ? item.priceHistory
               : buildInitialPriceHistory(item),
            attrs: {
               ...(item.attrs || {}),
               phoneNormalized: normalizePhone(item.phone),
            },
         });
      } catch (error) {
         errors.push({
            sourceId: String(id),
            error: error?.message || 'DIM.RIA advert fetch failed',
         });
      }
   }

   return { items, errors };
}

async function handleImport(request) {
   await connectDB();

   const input = await readRequestInput(request, {
      category: 1,
      realty_type: 2,
      operation_type: 1,
      secondary: 1,
      limit: 5,
   });

   const dryRun = request.method === 'GET' || parseBoolean(input.dryRun, false);
   const includeExisting = parseBoolean(input.includeExisting, false);
   const limit = parsePositiveInt(input.limit, 5, 50);

   const search = await searchDimriaIds({ ...input, limit });
   const candidateIds = search.ids.slice(0, limit);
   const existing = await LeadProperty.find({
      source: 'dimria',
      sourceId: { $in: candidateIds },
   }).select('_id source sourceId title sourceUrl importedAt cost currency images attrs priceHistory').lean();

   const existingIds = new Set(existing.map((item) => String(item.sourceId)));
   const idsToFetch = includeExisting
      ? candidateIds
      : candidateIds.filter((id) => !existingIds.has(String(id)));

   const fetched = await fetchLeadItems(idsToFetch);

   if (dryRun) {
      return Response.json({
         ok: true,
         dryRun: true,
         configured: true,
         requested: {
            limit,
            includeExisting,
            searchParams: search.params,
         },
         search: {
            count: search.count,
            returnedIds: search.ids.length,
            candidateIds,
         },
         existing: existing.length,
         toFetch: idsToFetch.length,
         fetched: fetched.items.length,
         failed: fetched.errors.length,
         errors: fetched.errors,
         sample: fetched.items.slice(0, 3).map((item) => ({
            sourceId: item.sourceId,
            title: item.title,
            sourceUrl: item.sourceUrl,
            price: item.cost,
            currency: item.currency,
            city: item.location?.city || '',
            street: item.location?.street || '',
            rooms: item.rooms,
            square_tot: item.square_tot,
            phone: item.phone,
            hasPhoneInApi: Boolean(item.phone),
            photoCount: Array.isArray(item.images) ? item.images.length : 0,
            rawKeys: Object.keys(item.raw || {}),
         })),
      });
   }

   const created = [];
   const duplicateItems = [...existing];
   const errors = [...fetched.errors];

   for (const item of fetched.items) {
      try {
         const duplicate = await LeadProperty.findOne({
            source: item.source,
            sourceId: item.sourceId,
         }).select('_id source sourceId title sourceUrl importedAt cost currency images attrs sourceStatus priceHistory').lean();

         if (duplicate) {
            await updateExistingFromScan(duplicate, item);
            duplicateItems.push(duplicate);
            continue;
         }

         const createdItem = await LeadProperty.create(item);
         created.push(createdItem);
      } catch (error) {
         if (error?.code === 11000) {
            duplicateItems.push({
               source: item.source,
               sourceId: item.sourceId,
               title: item.title,
               sourceUrl: item.sourceUrl,
            });
            continue;
         }

         errors.push({
            sourceId: item.sourceId,
            title: item.title,
            error: error?.message || 'unknown error',
         });
      }
   }

   return Response.json(
      {
         ok: true,
         dryRun: false,
         requested: {
            limit,
            includeExisting,
            searchParams: search.params,
         },
         search: {
            count: search.count,
            returnedIds: search.ids.length,
            candidateIds,
         },
         created: created.length,
         duplicates: duplicateItems.length,
         failed: errors.length,
         items: created,
         duplicateItems,
         errors,
      },
      { status: errors.length && !created.length ? 400 : created.length ? 201 : 200 }
   );
}

async function runImport(request) {
   try {
      return await handleImport(request);
   } catch (error) {
      console.error('DIM.RIA import error:', error);

      const message = error?.message || 'DIM.RIA import failed';
      const status = message.includes('DIMRIA_API_KEY') ? 409 : 500;

      return Response.json(
         {
            ok: false,
            error: message,
         },
         { status }
      );
   }
}

export const GET = runImport;
export const POST = runImport;
