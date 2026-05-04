import connectDB from '@/config/database';
import Property from '@/models/Property';
import { getSessionUser } from '@/utils/getSessionUser';

export const POST = async (req, { params }) => {
   try {
      await connectDB();

      const body = await req.json();

      const property = await Property.findById(params.id);
      if (!property) return new Response('Property Not Found', { status: 404 });

      const createdAt = body.createdAt ? new Date(body.createdAt) : new Date();

      property.advertisingLinks.unshift({
         platform: body.platform || 'other',
         sourceType: ['ours', 'competitor', 'owner'].includes(body.sourceType)
            ? body.sourceType
            : 'ours',
         title: body.title || '',
         url: body.url || '',
         status: body.status || 'active',
         note: body.note || '',
         createdAt: Number.isNaN(createdAt.getTime()) ? new Date() : createdAt,
         lastCheckedAt: body.lastCheckedAt ? new Date(body.lastCheckedAt) : null,
      });

      await property.save();

      return Response.json({ ok: true, item: property });
   } catch (error) {
      console.log(error);
      return new Response('Smth wrong', { status: 500 });
   }
};