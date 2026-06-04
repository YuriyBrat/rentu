const DIMRIA_BASE_URL = 'https://developers.ria.com/dom';
const DIMRIA_SITE_BASE_URL = 'https://dom.ria.com/uk';
const RIA_PHOTO_BASE_URL = 'https://cdn.riastatic.com/photos';

function requireApiKey() {
   const apiKey = process.env.DIMRIA_API_KEY;
   if (!apiKey) {
      throw new Error('DIMRIA_API_KEY is not configured');
   }
   return apiKey;
}

function toPlainObject(value) {
   return value && typeof value === 'object' && !Array.isArray(value) ? value : {};
}

function toPositiveInt(value, fallback, max) {
   const parsed = Number.parseInt(value, 10);
   if (!Number.isFinite(parsed) || parsed <= 0) return fallback;
   return Math.min(parsed, max);
}

function toNumber(value) {
   if (value === undefined || value === null || value === '') return undefined;
   const parsed = Number(value);
   return Number.isFinite(parsed) ? parsed : undefined;
}

function cleanString(value) {
   const text = String(value || '').trim();
   if (!/[\u00d0\u00d1]/.test(text)) return text;

   try {
      return Buffer.from(text, 'latin1').toString('utf8').trim();
   } catch {
      return text;
   }
}

function decodeText(value) {
   return cleanString(value)
      .replace(/<[^>]+>/g, ' ')
      .replace(/&quot;/g, '"')
      .replace(/&#039;/g, "'")
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/\s+/g, ' ')
      .trim();
}

function normalizeCurrency(value) {
   const normalized = cleanString(value).toLowerCase();
   if (!normalized) return 'USD';
   if (['$', 'usd', '\u0434\u043e\u043b', '\u0434\u043e\u043b\u0430\u0440', '\u0434\u043e\u043b\u043b\u0430\u0440'].includes(normalized)) return 'USD';
   if (['\u20ac', 'eur', 'euro', '\u0454\u0432\u0440\u043e'].includes(normalized)) return 'EUR';
   if (['\u0433\u0440\u043d', 'uah', '\u20b4'].includes(normalized)) return 'UAH';
   return cleanString(value).toUpperCase();
}

function buildDimriaUrl(path, params = {}) {
   const url = new URL(`${DIMRIA_BASE_URL}${path}`);
   url.searchParams.set('api_key', requireApiKey());

   Object.entries(params).forEach(([key, value]) => {
      if (value === undefined || value === null || value === '') return;

      if (Array.isArray(value)) {
         value.forEach((item) => {
            if (item !== undefined && item !== null && item !== '') {
               url.searchParams.append(key, String(item));
            }
         });
         return;
      }

      url.searchParams.set(key, String(value));
   });

   return url;
}

async function fetchJson(url) {
   const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
         Accept: 'application/json',
         'Accept-Language': 'uk',
      },
      cache: 'no-store',
   });

   const contentType = response.headers.get('content-type') || '';
   const charset = contentType.match(/charset=([^;]+)/i)?.[1]?.trim() || 'windows-1251';
   const buffer = await response.arrayBuffer();
   const text = new TextDecoder(charset).decode(buffer);
   const data = JSON.parse(text || '{}');

   if (!response.ok) {
      const message =
         data?.message ||
         data?.error ||
         data?.errors?.[0]?.message ||
         `DIM.RIA request failed with status ${response.status}`;
      throw new Error(message);
   }

   return data;
}

function buildSearchParams(input = {}) {
   const body = toPlainObject(input);
   const params = {
      category: body.category || body.categoryId || 1,
      realty_type: body.realty_type || body.realtyType || body.realtyTypeId || 2,
      operation_type: body.operation_type || body.operationType || body.operationTypeId || 1,
   };
   const passthroughKeys = new Set([
      'category',
      'categoryId',
      'realty_type',
      'realtyType',
      'realtyTypeId',
      'operation_type',
      'operationType',
      'operationTypeId',
      'secondary',
      'newbuildings',
      'state_id',
      'stateId',
      'city_id',
      'cityId',
      'district_id',
      'districtId',
      'limit',
      'dryRun',
      'includeExisting',
      'params',
   ]);

   if (body.secondary !== undefined) params.secondary = body.secondary ? 1 : 0;
   else if (body.newbuildings === undefined) params.secondary = 1;

   if (body.newbuildings !== undefined) params.newbuildings = body.newbuildings ? 1 : 0;
   if (body.state_id || body.stateId) params.state_id = body.state_id || body.stateId;
   if (body.city_id || body.cityId) params.city_id = body.city_id || body.cityId;
   if (body.district_id || body.districtId) params.district_id = body.district_id || body.districtId;

   const rawParams = toPlainObject(body.params);
   Object.entries(body).forEach(([key, value]) => {
      if (passthroughKeys.has(key)) return;
      if (key.startsWith('characteristic[') || key === 'sort') {
         rawParams[key] = value;
      }
   });

   return { ...params, ...rawParams };
}

export async function searchDimriaIds(input = {}) {
   const searchParams = buildSearchParams(input);
   const url = buildDimriaUrl('/search', searchParams);
   const data = await fetchJson(url);
   const items = Array.isArray(data?.items) ? data.items : [];

   return {
      ids: items.map((id) => cleanString(id)).filter(Boolean),
      count: toNumber(data?.count) ?? items.length,
      params: searchParams,
      raw: data,
   };
}

export async function fetchDimriaAdvert(id) {
   const safeId = cleanString(id);
   if (!safeId) throw new Error('DIM.RIA advert id is required');
   return fetchJson(buildDimriaUrl(`/info/${encodeURIComponent(safeId)}`));
}

function buildPhotoUrl(file) {
   const source = cleanString(file);
   if (!source) return '';
   if (/^https?:\/\//i.test(source)) return source;

   const withSize = source.replace(/\.jpg(\?.*)?$/i, 'xl.jpg$1');
   return `${RIA_PHOTO_BASE_URL}/${withSize.replace(/^\/+/, '')}`;
}

function extractPhotos(advert) {
   const photos = [];
   const main = buildPhotoUrl(advert?.main_photo);

   if (main) photos.push(main);

   Object.values(toPlainObject(advert?.photos)).forEach((photo) => {
      const url = buildPhotoUrl(photo?.file || photo?.url || photo);
      if (url && !photos.includes(url)) photos.push(url);
   });

   return photos;
}

function buildSourceUrl(advert) {
   const url = cleanString(advert?.beautiful_url || advert?.url);
   if (!url) return '';
   if (/^https?:\/\//i.test(url)) return url;
   return `${DIMRIA_SITE_BASE_URL}/${url.replace(/^\/+/, '')}`;
}

function extractPhone(advert) {
   const user = toPlainObject(advert?.user);
   const candidates = [
      advert?.phone,
      advert?.phones,
      advert?.phone_number,
      advert?.contact_phone,
      user?.phone,
      user?.phones,
      user?.phone_number,
      user?.contact_phone,
   ];

   for (const candidate of candidates) {
      if (Array.isArray(candidate)) {
         const first = candidate.map(cleanString).find(Boolean);
         if (first) return first;
      }

      const value = cleanString(candidate);
      if (value) return value;
   }

   return '';
}

function buildTitle(advert) {
   const explicit = decodeText(advert?.title || advert?.name);
   if (explicit) return explicit;

   const rooms = toNumber(advert?.rooms_count);
   const type = cleanString(advert?.realty_type_name_uk || advert?.realty_type_name) || 'real estate';
   const city = cleanString(advert?.city_name_uk || advert?.city_name);
   const prefix = rooms ? `${rooms} rooms` : '';

   return [prefix, type, city].filter(Boolean).join(' ');
}

function buildLocationText(advert) {
   return [
      advert?.state_name,
      advert?.state_name_uk,
      advert?.city_name_uk || advert?.city_name,
      advert?.district_name_uk || advert?.district_name,
      advert?.admin_district_name_uk,
      advert?.street_name_uk || advert?.street_name,
      advert?.building_number_str,
   ].map(cleanString).filter(Boolean).join(', ');
}

function mapDealType(advert) {
   const name = cleanString(advert?.advert_type_name).toLowerCase();
   if (name.includes('\u043e\u0440\u0435\u043d\u0434')) return 'rent';
   if (name.includes('\u0430\u0440\u0435\u043d\u0434')) return 'rent';
   if (name.includes('\u043f\u0440\u043e\u0434')) return 'sale';
   if (String(advert?.advert_type_id) === '3') return 'rent';
   return 'sale';
}

export function mapDimriaAdvertToLeadProperty(advert) {
   const sourceId = cleanString(advert?.realty_id || advert?._id).replace(/^realty-/, '');
   const description = decodeText(advert?.description_uk || advert?.description);
   const images = extractPhotos(advert);
   const cost = toNumber(advert?.price_total ?? advert?.price);
   const currency = normalizeCurrency(advert?.currency_type);
   const priceChangedAt = advert?.price_changed_at;

   return {
      source: 'dimria',
      sourceId,
      sourceUrl: buildSourceUrl(advert),
      sourceStatus: advert?.advert_publish_type === 1 ? 'active' : 'unknown',
      sourceCheckedAt: new Date().toISOString(),
      importedAt: new Date().toISOString(),

      type_estate: cleanString(advert?.realty_type_name_uk || advert?.realty_type_name),
      type_deal: mapDealType(advert),
      title: buildTitle(advert),
      location_text: buildLocationText(advert),
      location: {
         city: cleanString(advert?.city_name_uk || advert?.city_name),
         street: cleanString(advert?.street_name_uk || advert?.street_name),
         number: cleanString(advert?.building_number_str),
      },
      rooms: toNumber(advert?.rooms_count),
      square_tot: toNumber(advert?.total_square_meters),
      floor: toNumber(advert?.floor),
      floors: toNumber(advert?.floors_count),
      cost,
      currency,
      priceHistory: cost !== undefined ? [{
         price: cost,
         currency,
         changedAt: priceChangedAt || advert?.publishing_date || advert?.created_at || null,
         detectedAt: new Date().toISOString(),
         source: 'dimria',
         note: 'initial import',
      }] : [],
      description,
      images,
      leadname: cleanString(advert?.user?.name),
      phone: extractPhone(advert),
      attrs: {
         provider: 'dimria',
         sourcePublishedAt: advert?.publishing_date,
         sourceAddedAt: advert?.created_at,
         sourceUpdatedAt: advert?.updated_at,
         sourceEndedAt: advert?.date_end,
         sourcePriceChangedAt: priceChangedAt,
         sourceLastScannedAt: new Date().toISOString(),
         realtyId: sourceId,
         userId: advert?.user_id,
         categoryId: advert?.category_id,
         realtyTypeId: advert?.realty_type_id,
         realtyTypeParentId: advert?.realty_type_parent_id,
         advertTypeId: advert?.advert_type_id,
         stateId: advert?.state_id,
         cityId: advert?.city_id,
         districtId: advert?.district_id,
         inspected: advert?.inspected,
         inspectedAt: advert?.inspected_at,
         isCommercial: advert?.is_commercial,
         isBargain: advert?.is_bargain,
         latitude: advert?.latitude,
         longitude: advert?.longitude,
         metroStationName: advert?.metro_station_name,
         wallType: advert?.wall_type,
         kitchenSquareMeters: advert?.kitchen_square_meters,
         livingSquareMeters: advert?.living_square_meters,
         priceItem: advert?.price_item,
         priceType: advert?.price_type,
         photoCount: images.length,
         hasPhoneInApi: Boolean(extractPhone(advert)),
      },
      raw: advert,
   };
}

export async function fetchDimriaLeadItems(input = {}) {
   const limit = toPositiveInt(input.limit, 5, 50);
   const search = await searchDimriaIds(input);
   const ids = search.ids.slice(0, limit);
   const items = [];
   const errors = [];

   for (const id of ids) {
      try {
         const advert = await fetchDimriaAdvert(id);
         items.push(mapDimriaAdvertToLeadProperty(advert));
      } catch (error) {
         errors.push({
            sourceId: id,
            error: error?.message || 'DIM.RIA advert fetch failed',
         });
      }
   }

   return {
      items,
      errors,
      requested: {
         limit,
         searchParams: search.params,
      },
      search: {
         count: search.count,
         returnedIds: search.ids.length,
         usedIds: ids,
      },
   };
}
