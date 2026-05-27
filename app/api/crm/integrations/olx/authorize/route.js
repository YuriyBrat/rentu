const OLX_AUTHORIZE_URL = 'https://www.olx.ua/oauth/authorize/';
const DEFAULT_SCOPE = 'read write v2';

function getRedirectUri(req) {
   return (
      process.env.OLX_REDIRECT_URI ||
      new URL('/api/crm/integrations/olx/callback', new URL(req.url).origin).toString()
   );
}

export const GET = async (req) => {
   const clientId = process.env.OLX_CLIENT_ID;

   if (!clientId) {
      return Response.json(
         { ok: false, error: 'OLX_CLIENT_ID is not configured' },
         { status: 500 }
      );
   }

   const state = crypto.randomUUID();
   const authorizeUrl = new URL(OLX_AUTHORIZE_URL);

   authorizeUrl.searchParams.set('client_id', clientId);
   authorizeUrl.searchParams.set('response_type', 'code');
   authorizeUrl.searchParams.set('state', state);
   authorizeUrl.searchParams.set('scope', process.env.OLX_SCOPE || DEFAULT_SCOPE);
   authorizeUrl.searchParams.set('redirect_uri', getRedirectUri(req));

   return Response.redirect(authorizeUrl.toString(), 302);
};
