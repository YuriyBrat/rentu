import connectDB from '@/config/database';
import Property from '@/models/Property';
import { getSessionUser } from '@/utils/getSessionUser';
// POST /api/crm/properties/:id/add-ad-text

export const POST = async (req, { params }) => {
   try {
      await connectDB();

      const body = await req.json();

      const property = await Property.findById(params.id);
      if (!property) return new Response('Not found', { status: 404 });

      property.advertisingTexts.unshift({
         title: body.title || '',
         text: body.text || '',
         note: body.note || '',
         result: '',
      });

      await property.save();

      return Response.json({ ok: true });
   } catch (e) {
      console.log(e);
      return new Response('Error', { status: 500 });
   }
};