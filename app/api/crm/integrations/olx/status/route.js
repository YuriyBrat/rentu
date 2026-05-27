import connectDB from '@/config/database';
import OlxIntegration from '@/models/OlxIntegration';

function hasOlxConfig() {
   return Boolean(process.env.OLX_CLIENT_ID && process.env.OLX_CLIENT_SECRET);
}

export const GET = async () => {
   try {
      await connectDB();

      const integration = await OlxIntegration.findOne({ provider: 'olx' }).lean();

      return Response.json({
         ok: true,
         configured: hasOlxConfig(),
         connected: Boolean(integration?.refreshToken || integration?.accessToken),
         scope: integration?.scope || process.env.OLX_SCOPE || '',
         tokenType: integration?.tokenType || '',
         expiresAt: integration?.expiresAt || null,
         connectedAt: integration?.connectedAt || null,
         lastCheckedAt: integration?.lastCheckedAt || null,
         lastError: integration?.lastError || '',
      });
   } catch (error) {
      console.error('OLX status error:', error);
      return new Response('Error fetching OLX integration status', { status: 500 });
   }
};
