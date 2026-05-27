import connectDB from '@/config/database';
import OlxIntegration from '@/models/OlxIntegration';

const OLX_TOKEN_URL = 'https://www.olx.ua/api/open/oauth/token';
const OLX_ADVERTS_URL = 'https://www.olx.ua/api/partner/adverts';
const DEFAULT_SCOPE = 'read write v2';
const TOKEN_REFRESH_MARGIN_MS = 2 * 60 * 1000;

function getAuthorizeUrl(req) {
   return new URL('/api/crm/integrations/olx/authorize', new URL(req.url).origin).toString();
}

function getPositiveInt(value, fallback, max) {
   const parsed = Number.parseInt(value, 10);
   if (!Number.isFinite(parsed) || parsed < 0) return fallback;
   return Math.min(parsed, max);
}

function sanitizeAdvert(advert) {
   if (!advert || typeof advert !== 'object') return advert;

   return {
      id: advert.id,
      title: advert.title,
      status: advert.status,
      url: advert.url,
      category_id: advert.category_id,
      created_at: advert.created_at,
      activated_at: advert.activated_at,
      valid_to: advert.valid_to,
      price: advert.price,
      currency: advert.currency,
      city_id: advert.city_id,
      district_id: advert.district_id,
      photos_count: Array.isArray(advert.photos) ? advert.photos.length : undefined,
      params: advert.params,
      raw_keys: Object.keys(advert),
   };
}

async function refreshAccessToken(integration) {
   if (!integration.refreshToken) return integration;

   const expiresAt = integration.expiresAt ? new Date(integration.expiresAt).getTime() : 0;
   const shouldRefresh = !expiresAt || expiresAt - Date.now() < TOKEN_REFRESH_MARGIN_MS;

   if (!shouldRefresh) return integration;

   const response = await fetch(OLX_TOKEN_URL, {
      method: 'POST',
      headers: {
         'Content-Type': 'application/json',
         Accept: 'application/json',
      },
      body: JSON.stringify({
         grant_type: 'refresh_token',
         client_id: process.env.OLX_CLIENT_ID,
         client_secret: process.env.OLX_CLIENT_SECRET,
         refresh_token: integration.refreshToken,
      }),
   });

   const data = await response.json().catch(() => ({}));

   if (!response.ok) {
      const message = data?.error_description || data?.error || 'OLX token refresh failed';
      throw new Error(message);
   }

   const now = new Date();
   const expiresInSeconds = Number(data.expires_in || 0);
   const expiresAtDate = expiresInSeconds
      ? new Date(now.getTime() + expiresInSeconds * 1000)
      : integration.expiresAt;

   return OlxIntegration.findOneAndUpdate(
      { provider: 'olx' },
      {
         accessToken: data.access_token || integration.accessToken,
         refreshToken: data.refresh_token || integration.refreshToken,
         tokenType: data.token_type || integration.tokenType,
         scope: data.scope || integration.scope || process.env.OLX_SCOPE || DEFAULT_SCOPE,
         expiresAt: expiresAtDate,
         lastCheckedAt: now,
         lastError: '',
      },
      { new: true }
   ).lean();
}

async function fetchOlxAdverts(accessToken, limit, offset) {
   const url = new URL(OLX_ADVERTS_URL);
   url.searchParams.set('limit', String(limit));
   url.searchParams.set('offset', String(offset));

   const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
         Accept: 'application/json',
         Authorization: `Bearer ${accessToken}`,
         Version: '2.0',
         'Accept-Language': 'uk',
      },
   });

   const data = await response.json().catch(() => ({}));

   if (!response.ok) {
      const message =
         data?.error?.detail ||
         data?.error_description ||
         data?.error ||
         `OLX adverts request failed with status ${response.status}`;
      throw new Error(message);
   }

   return data;
}

export const GET = async (req) => {
   try {
      await connectDB();

      const requestUrl = new URL(req.url);
      const limit = getPositiveInt(requestUrl.searchParams.get('limit'), 20, 100);
      const offset = getPositiveInt(requestUrl.searchParams.get('offset'), 0, 100000);

      const existingIntegration = await OlxIntegration.findOne({ provider: 'olx' }).lean();

      if (!existingIntegration?.accessToken && !existingIntegration?.refreshToken) {
         return Response.json(
            {
               ok: false,
               connected: false,
               error: 'OLX account is not connected yet',
               authorizeUrl: getAuthorizeUrl(req),
            },
            { status: 409 }
         );
      }

      const integration = await refreshAccessToken(existingIntegration);
      const olxResponse = await fetchOlxAdverts(integration.accessToken, limit, offset);
      const adverts = Array.isArray(olxResponse?.data) ? olxResponse.data : [];

      await OlxIntegration.findOneAndUpdate(
         { provider: 'olx' },
         { lastCheckedAt: new Date(), lastError: '' }
      );

      return Response.json({
         ok: true,
         connected: true,
         requested: { limit, offset },
         total: olxResponse?.metadata?.total_count ?? olxResponse?.total_count ?? null,
         returned: adverts.length,
         metadata: olxResponse?.metadata || null,
         links: olxResponse?.links || null,
         sample: adverts.slice(0, 5).map(sanitizeAdvert),
         responseKeys: Object.keys(olxResponse || {}),
      });
   } catch (error) {
      console.error('OLX adverts diagnostic error:', error);

      try {
         await OlxIntegration.findOneAndUpdate(
            { provider: 'olx' },
            { lastCheckedAt: new Date(), lastError: error.message || 'OLX adverts failed' }
         );
      } catch (saveError) {
         console.error('OLX adverts diagnostic error save failed:', saveError);
      }

      return Response.json(
         {
            ok: false,
            error: error.message || 'OLX adverts request failed',
         },
         { status: 500 }
      );
   }
};
