import connectDB from '@/config/database';
import LeadProperty from '@/models/LeadProperty';
import { normalizePhone } from '@/utils/crm/phoneIntel';

const CORS_HEADERS = {
   'Access-Control-Allow-Origin': '*',
   'Access-Control-Allow-Methods': 'POST, OPTIONS',
   'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Karamax-Token',
};

function json(data, init = {}) {
   return Response.json(data, {
      ...init,
      headers: {
         ...CORS_HEADERS,
         ...(init.headers || {}),
      },
   });
}

export function OPTIONS() {
   return new Response(null, { status: 204, headers: CORS_HEADERS });
}

function clean(value) {
   return String(value || '').replace(/\s+/g, ' ').trim();
}

function cleanDescription(value) {
   let text = clean(value);
   if (!text) return '';

   const stopPatterns = [
      /Стан об'єкту:/i,
      /Стан об’єкту:/i,
      /Час додавання на сайт:/i,
      /ID на сайті:/i,
      /ID оголошення:/i,
      /ще\s+\d+\s+фото/i,
   ];

   for (const pattern of stopPatterns) {
      const index = text.search(pattern);
      if (index > 120) text = text.slice(0, index);
   }

   const head = text.slice(0, Math.min(260, text.length));
   const repeatIndex = text.indexOf(head, Math.max(300, head.length + 20));
   if (repeatIndex > 0) text = text.slice(0, repeatIndex);

   return text
      .replace(/\s*-{5,}\s*/g, ' ')
      .replace(/\s{2,}/g, ' ')
      .trim()
      .slice(0, 2500);
}

function parseNumber(value) {
   if (value === undefined || value === null || value === '') return undefined;
   const normalized = String(value).replace(/\s/g, '').replace(',', '.').replace(/[^\d.-]/g, '');
   const parsed = Number(normalized);
   return Number.isFinite(parsed) ? parsed : undefined;
}

function roundPrice(value) {
   const parsed = parseNumber(value);
   return parsed === undefined ? undefined : Math.round(parsed);
}

function normalizeFloorPair(floorValue, floorsValue) {
   const floor = parseNumber(floorValue);
   const floors = parseNumber(floorsValue);
   if (!Number.isFinite(floor) || !Number.isFinite(floors)) return {};
   if (floor <= 0 || floors <= 0 || floor > floors || floors > 40) return {};
   return { floor, floors };
}

function hasMeaningfulPriceChange(left, right) {
   const a = Number(left);
   const b = Number(right);
   if (!Number.isFinite(a) || !Number.isFinite(b)) return false;
   return Math.abs(a - b) >= 100;
}

function hasPrice(value) {
   const parsed = Number(value);
   return Number.isFinite(parsed) && parsed > 0;
}

function parseDate(value) {
   if (!value) return undefined;
   const date = new Date(value);
   return Number.isNaN(date.getTime()) ? undefined : date;
}

function normalizeImages(images) {
   if (!Array.isArray(images)) return [];

   const seen = new Set();
   return images
      .map((image, index) => {
         const url = typeof image === 'string' ? clean(image) : clean(image?.url || image?.src);
         if (!url || url.startsWith('data:')) return null;
         const key = url
            .replace(/^https?:\/\//i, '')
            .replace(/[?&](w|width|h|height|size|thumb|preview)=[^&]+/gi, '')
            .replace(/[?&]$/g, '')
            .toLowerCase();
         if (seen.has(key)) return null;
         seen.add(key);

         return {
            url,
            isMain: index === 0,
            sortOrder: index,
            origin: 'unknown',
            sourceUrl: url,
            stage: 'raw',
            variants: { preview: url, card: url, full: url },
         };
      })
      .filter(Boolean)
      .slice(0, 12);
}

function normalizeSourceName(value) {
   const name = clean(value);
   return name;
}

function buildSourceId(input, reamakId, siteName, siteId) {
   const explicit = clean(input?.sourceId);
   if (explicit) return explicit;
   if (reamakId) return `reamak:${reamakId}`;
   if (siteId) return `site:${(siteName || 'unknown').toLowerCase()}:${siteId}`;

   return '';
}

function buildReadableTitle(input, siteName) {
   const rooms = parseNumber(input?.rooms);
   const objectType = clean(input?.type_estate || input?.estateType || input?.objectType || input?.title);
   const city = clean(input?.location?.city || input?.city);
   const street = clean(input?.location?.street || input?.street);
   const rawAddress = clean(input?.location_text || input?.address);
   const streetFromAddress = rawAddress.match(/(?:вул\.?|вулиця)\s*([^,]+)/i)?.[1];

   const parts = [];
   if (rooms) parts.push(`${rooms}к`);
   parts.push(/кварт/i.test(objectType) ? 'квартира' : objectType || 'обʼєкт');
   if (city) parts.push(city);
   if (street || streetFromAddress) parts.push(`вул. ${clean(street || streetFromAddress)}`);

   return clean(parts.join(' '));
}

function buildCleanReadableTitle(input) {
   const rooms = parseNumber(input?.rooms);
   const objectType = clean(input?.type_estate || input?.estateType || input?.objectType || input?.title);
   const city = clean(input?.location?.city || input?.city);
   const street = clean(input?.location?.street || input?.street);
   const rawAddress = clean(input?.location_text || input?.address);
   const streetFromAddress = rawAddress.match(/(?:\u0432\u0443\u043b\.?|\u0432\u0443\u043b\u0438\u0446\u044f)\s*([^,]+)/i)?.[1];
   const cityFromAddress = rawAddress.match(/\b(\u041b\u044c\u0432\u0456\u0432|\u0422\u0440\u0443\u0441\u043a\u0430\u0432\u0435\u0446\u044c|\u0412\u0438\u043d\u043d\u0438\u043a\u0438|\u0411\u0440\u044e\u0445\u043e\u0432\u0438\u0447\u0456|\u0421\u043e\u043a\u0456\u043b\u044c\u043d\u0438\u043a\u0438|\u0417\u0438\u043c\u043d\u0430 \u0412\u043e\u0434\u0430)\b/i)?.[1];

   const parts = [];
   if (rooms) parts.push(`${rooms}\u043a`);
   parts.push(/\u043a\u0432\u0430\u0440\u0442/i.test(objectType) ? '\u043a\u0432\u0430\u0440\u0442\u0438\u0440\u0430' : objectType || '\u043e\u0431\u0027\u0454\u043a\u0442');
   if (city || cityFromAddress) parts.push(city || cityFromAddress);
   if (street || streetFromAddress) parts.push(`\u0432\u0443\u043b. ${clean(street || streetFromAddress)}`);

   return clean(parts.join(' '));
}

function normalizeItem(input) {
   const attrs = input?.attrs && typeof input.attrs === 'object' ? input.attrs : {};
   const reamakAttrs = attrs.reamak && typeof attrs.reamak === 'object' ? attrs.reamak : {};
   const reamakId = clean(input?.reamakId || input?.reamak_id || reamakAttrs.reamakId);
   const siteName = normalizeSourceName(input?.siteName || input?.sourceSite || reamakAttrs.siteName);
   const siteId = clean(input?.siteId || input?.idOnSite || reamakAttrs.siteId);
   const sourceId = buildSourceId(input, reamakId, siteName, siteId);
   const cost = roundPrice(input?.cost ?? input?.price);
   const currency = clean(input?.currency) || 'USD';
   const phone = clean(input?.phone);
   const reamakPageUrl = clean(input?.reamakPageUrl || reamakAttrs.reamakPageUrl);
   const sourcePublishedAt = parseDate(input?.sourcePublishedAt || attrs.sourcePublishedAt || attrs.sourceAddedAt);
   const sourceUpdatedAt = parseDate(input?.sourceUpdatedAt || attrs.sourceUpdatedAt);
   const sourceLastScannedAt = parseDate(input?.sourceLastScannedAt || attrs.sourceLastScannedAt) || new Date();
   const floorPair = normalizeFloorPair(input?.floor, input?.floors);

   return {
      source: 'reamak',
      sourceId,
      sourceUrl: clean(input?.sourceUrl || input?.url),
      reamakId,
      sourceStatus: clean(input?.sourceStatus) || 'unknown',
      sourceCheckedAt: new Date(),
      importedAt: parseDate(input?.importedAt) || new Date(),
      stage: clean(input?.stage) || 'raw',
      reviewStatus: clean(input?.reviewStatus) || 'unchecked',
      type_estate: clean(input?.type_estate || input?.estateType || input?.objectType),
      type_deal: clean(input?.type_deal || input?.dealType),
      title: buildCleanReadableTitle(input),
      location_text: clean(input?.location_text || input?.address),
      location: {
         city: clean(input?.location?.city || input?.city),
         street: clean(input?.location?.street || input?.street),
         number: clean(input?.location?.number || input?.number),
      },
      rooms: parseNumber(input?.rooms),
      square_tot: parseNumber(input?.square_tot || input?.square),
      floor: floorPair.floor,
      floors: floorPair.floors,
      cost,
      currency,
      priceHistory: Number.isFinite(cost)
         ? [{
            price: cost,
            currency,
            changedAt: parseDate(input?.sourcePriceChangedAt || attrs.sourcePriceChangedAt),
            detectedAt: new Date(),
            source: 'reamak',
            note: 'hunter import',
         }]
         : [],
      description: cleanDescription(input?.description),
      images: normalizeImages(input?.images),
      leadname: clean(input?.leadname || input?.contactName),
      phone,
      attrs: {
         ...attrs,
         phoneNormalized: normalizePhone(phone),
         contactKind: clean(input?.contactKind || attrs.contactKind),
         sourcePublishedAt,
         sourceAddedAt: sourcePublishedAt,
         sourceUpdatedAt,
         sourceLastScannedAt,
         sourcePriceChangedAt: parseDate(input?.sourcePriceChangedAt || attrs.sourcePriceChangedAt),
         reamak: {
            ...reamakAttrs,
            reamakId,
            siteName,
            siteId,
            adId: clean(input?.adId || reamakAttrs.adId),
            reamakPageUrl,
            flags: input?.flags || reamakAttrs.flags || {},
            importedBy: 'hunter',
         },
      },
      raw: input,
   };
}

function buildDuplicateQuery(doc) {
   const or = [];
   if (doc.sourceId) or.push({ source: 'reamak', sourceId: doc.sourceId });
   if (doc.reamakId) or.push({ source: 'reamak', reamakId: doc.reamakId });
   if (doc.attrs?.reamak?.siteId) {
      or.push({
         source: 'reamak',
         'attrs.reamak.siteId': doc.attrs.reamak.siteId,
         'attrs.reamak.siteName': doc.attrs.reamak.siteName,
      });
      or.push({
         source: 'reamak',
         'attrs.reamak.siteId': doc.attrs.reamak.siteId,
      });
      or.push({
         'attrs.reamak.siteId': doc.attrs.reamak.siteId,
         'attrs.reamak.siteName': doc.attrs.reamak.siteName,
      });
      or.push({
         'attrs.reamak.siteId': doc.attrs.reamak.siteId,
      });
      or.push({
         sourceId: `site:${String(doc.attrs.reamak.siteName || 'unknown').toLowerCase()}:${doc.attrs.reamak.siteId}`,
      });
   }
   return or.length ? { $or: or } : null;
}

function isSameIdentity(existing, doc) {
   const existingReamakId = clean(existing.reamakId || existing.attrs?.reamak?.reamakId);
   const nextReamakId = clean(doc.reamakId || doc.attrs?.reamak?.reamakId);
   if (existingReamakId && nextReamakId) return existingReamakId === nextReamakId;

   const existingSiteId = clean(existing.attrs?.reamak?.siteId);
   const nextSiteId = clean(doc.attrs?.reamak?.siteId);
   const existingSiteName = clean(existing.attrs?.reamak?.siteName).toLowerCase();
   const nextSiteName = clean(doc.attrs?.reamak?.siteName).toLowerCase();
   if (existingSiteId && nextSiteId) {
      return existingSiteId === nextSiteId && (!existingSiteName || !nextSiteName || existingSiteName === nextSiteName);
   }

   if (existing.sourceId && doc.sourceId) return String(existing.sourceId) === String(doc.sourceId);
   return false;
}

function buildExistingUpdate(existing, doc) {
   const existingSiteId = clean(existing.attrs?.reamak?.siteId);
   const nextSiteId = clean(doc.attrs?.reamak?.siteId);
   const lastCheck = existing.sourceCheckedAt ? new Date(existing.sourceCheckedAt).getTime() : 0;
   const isRecentHunterCorrection = existingSiteId &&
      nextSiteId &&
      existingSiteId === nextSiteId &&
      existing.attrs?.reamak?.importedBy === 'hunter' &&
      lastCheck &&
      Date.now() - lastCheck < 24 * 60 * 60 * 1000;

   const attrs = {
      ...(existing.attrs || {}),
      ...(doc.attrs || {}),
      previousCost: existing.cost,
      previousCurrency: existing.currency,
      sourceLastScannedAt: new Date(),
   };

   const set = {
      sourceCheckedAt: new Date(),
      raw: doc.raw,
      attrs,
   };
   const unset = {};

   if (doc.sourceUrl) {
      set.sourceUrl = doc.sourceUrl;
   }

   if (doc.sourceId && (
      !existing.sourceId ||
      String(existing.sourceId).startsWith('url:https://reamak.info') ||
      (nextSiteId && existingSiteId !== nextSiteId)
   )) {
      set.sourceId = doc.sourceId;
   }
   if (doc.reamakId && existing.reamakId !== doc.reamakId) {
      set.reamakId = doc.reamakId;
   }
   if (doc.title) set.title = doc.title;
   if (doc.description) set.description = doc.description;
   if (doc.phone && !existing.phone) set.phone = doc.phone;
   if (doc.location_text) set.location_text = doc.location_text;
   if (doc.rooms) set.rooms = doc.rooms;
   if (doc.square_tot) set.square_tot = doc.square_tot;
   if (doc.floor && doc.floors) {
      set.floor = doc.floor;
      set.floors = doc.floors;
   } else if (Number(existing.floor) > Number(existing.floors) || Number(existing.floors) > 40) {
      unset.floor = '';
      unset.floors = '';
   }
   const shouldSetPrice = hasPrice(doc.cost) && (!hasPrice(existing.cost) || hasMeaningfulPriceChange(existing.cost, doc.cost));
   const shouldPushPrice = shouldSetPrice && hasPrice(existing.cost) && !isRecentHunterCorrection;

   if (shouldSetPrice) {
      set.cost = doc.cost;
      set.currency = doc.currency || existing.currency || 'USD';
      if (isRecentHunterCorrection && Array.isArray(doc.priceHistory) && doc.priceHistory.length) {
         set.priceHistory = doc.priceHistory;
      }
      if (!hasPrice(existing.cost) && Array.isArray(doc.priceHistory) && doc.priceHistory.length) {
         set.priceHistory = doc.priceHistory;
      }
   }
   if (Array.isArray(doc.images) && doc.images.length) {
      set.images = doc.images;
   }

   const push = {};
   if (shouldPushPrice) {
      push.priceHistory = doc.priceHistory?.[0] || {
         price: doc.cost,
         currency: doc.currency || 'USD',
         detectedAt: new Date(),
         source: 'reamak',
         note: 'hunter detected price change',
      };
   }

   const update = { $set: set };
   if (Object.keys(push).length) update.$push = push;
   if (Object.keys(unset).length) update.$unset = unset;
   return update;
}

async function importOne(input, options) {
   const doc = normalizeItem(input);
   const query = buildDuplicateQuery(doc);

   if (!doc.reamakId && !doc.attrs?.reamak?.siteId) {
      return {
         ok: false,
         created: false,
         duplicate: false,
         error: 'No REAMAK ID or site ID found',
      };
   }

   const candidates = query
      ? await LeadProperty.find(query).select('_id source sourceId sourceUrl sourceCheckedAt reamakId title cost currency phone images attrs priceHistory').limit(10).lean()
      : [];
   const existing = candidates.find((item) => isSameIdentity(item, doc)) || null;

   if (existing) {
      if (options.updateExisting) {
         await LeadProperty.updateOne({ _id: existing._id }, buildExistingUpdate(existing, doc));
      }

      return {
         ok: true,
         created: false,
         duplicate: true,
         item: existing,
      };
   }

   const created = await LeadProperty.create(doc);
   return {
      ok: true,
      created: true,
      duplicate: false,
      item: created,
   };
}

function isAuthorized(request, body) {
   const expected = process.env.REAMAK_IMPORT_TOKEN;
   if (!expected) return true;

   const auth = request.headers.get('authorization') || '';
   const bearer = auth.startsWith('Bearer ') ? auth.slice(7).trim() : '';
   const headerToken = request.headers.get('x-karamax-token') || '';
   const bodyToken = clean(body?.token);

   return [bearer, headerToken, bodyToken].includes(expected);
}

export async function POST(request) {
   try {
      const body = await request.json().catch(() => ({}));
      if (!isAuthorized(request, body)) {
         return json({ ok: false, error: 'Unauthorized REAMAK import' }, { status: 401 });
      }

      await connectDB();

      const items = Array.isArray(body?.items) ? body.items : [body?.item || body];
      const updateExisting = body?.updateExisting !== false;
      const results = [];

      for (const item of items) {
         results.push(await importOne(item, { updateExisting }));
      }

      const created = results.filter((item) => item.created).length;
      const duplicates = results.filter((item) => item.duplicate).length;
      const failed = results.filter((item) => !item.ok).length;

      return json({
         ok: failed === 0,
         created,
         duplicates,
         failed,
         results,
      }, { status: failed && !created && !duplicates ? 400 : created ? 201 : 200 });
   } catch (error) {
      console.error('REAMAK import error:', error);
      return json({ ok: false, error: error?.message || 'REAMAK import failed' }, { status: 500 });
   }
}
