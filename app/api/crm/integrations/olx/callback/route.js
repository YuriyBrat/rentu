import connectDB from '@/config/database';
import OlxIntegration from '@/models/OlxIntegration';

const CRM_OLX_REDIRECT_PATH = '/crm?integration=olx';
const OLX_TOKEN_URL = 'https://www.olx.ua/api/open/oauth/token';
const DEFAULT_SCOPE = 'read write v2';

function getBaseUrl(req) {
   return process.env.NEXT_PUBLIC_SITE_URL || new URL(req.url).origin;
}

function getRedirectUri(req) {
   return (
      process.env.OLX_REDIRECT_URI ||
      new URL('/api/crm/integrations/olx/callback', new URL(req.url).origin).toString()
   );
}

function redirectToCrm(req, params) {
   const url = new URL(CRM_OLX_REDIRECT_PATH, getBaseUrl(req));

   Object.entries(params).forEach(([key, value]) => {
      if (value) url.searchParams.set(key, value);
   });

   return Response.redirect(url.toString(), 302);
}

async function exchangeCodeForTokens(req, code) {
   const response = await fetch(OLX_TOKEN_URL, {
      method: 'POST',
      headers: {
         'Content-Type': 'application/json',
         Accept: 'application/json',
      },
      body: JSON.stringify({
         grant_type: 'authorization_code',
         client_id: process.env.OLX_CLIENT_ID,
         client_secret: process.env.OLX_CLIENT_SECRET,
         redirect_uri: getRedirectUri(req),
         code,
         scope: process.env.OLX_SCOPE || DEFAULT_SCOPE,
      }),
   });

   const data = await response.json().catch(() => ({}));

   if (!response.ok) {
      const message = data?.error_description || data?.error || 'OLX token exchange failed';
      throw new Error(message);
   }

   return data;
}

async function saveTokens(tokens) {
   const now = new Date();
   const expiresInSeconds = Number(tokens.expires_in || 0);
   const expiresAt = expiresInSeconds
      ? new Date(now.getTime() + expiresInSeconds * 1000)
      : null;

   await connectDB();

   await OlxIntegration.findOneAndUpdate(
      { provider: 'olx' },
      {
         provider: 'olx',
         clientId: process.env.OLX_CLIENT_ID || '',
         scope: tokens.scope || process.env.OLX_SCOPE || DEFAULT_SCOPE,
         tokenType: tokens.token_type || '',
         accessToken: tokens.access_token || '',
         refreshToken: tokens.refresh_token || '',
         expiresAt,
         connectedAt: now,
         lastCheckedAt: now,
         lastError: '',
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
   );
}

export const GET = async (req) => {
   const requestUrl = new URL(req.url);
   const code = requestUrl.searchParams.get('code');
   const state = requestUrl.searchParams.get('state');
   const error = requestUrl.searchParams.get('error');
   const errorDescription = requestUrl.searchParams.get('error_description');

   if (error) {
      return redirectToCrm(req, {
         olx: 'error',
         error,
         message: errorDescription,
      });
   }

   if (!code) {
      return redirectToCrm(req, {
         olx: 'missing_code',
      });
   }

   if (!process.env.OLX_CLIENT_ID || !process.env.OLX_CLIENT_SECRET) {
      return redirectToCrm(req, {
         olx: 'missing_credentials',
         state,
      });
   }

   try {
      const tokens = await exchangeCodeForTokens(req, code);
      await saveTokens(tokens);

      return redirectToCrm(req, {
         olx: 'connected',
         state,
      });
   } catch (exchangeError) {
      console.error('OLX callback error:', exchangeError);

      try {
         await connectDB();
         await OlxIntegration.findOneAndUpdate(
            { provider: 'olx' },
            {
               provider: 'olx',
               clientId: process.env.OLX_CLIENT_ID || '',
               scope: process.env.OLX_SCOPE || DEFAULT_SCOPE,
               lastCheckedAt: new Date(),
               lastError: exchangeError.message || 'OLX callback failed',
            },
            { upsert: true, new: true, setDefaultsOnInsert: true }
         );
      } catch (saveError) {
         console.error('OLX callback error save failed:', saveError);
      }

      return redirectToCrm(req, {
         olx: 'exchange_error',
         message: exchangeError.message,
         state,
      });
   }
};
