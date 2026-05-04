import connectDB from '@/config/database';
import Property from '@/models/Property';
import { getSessionUser } from '@/utils/getSessionUser';
// POST /api/crm/properties/:id/add-note

export const POST = async (req, { params }) => {
   try {
      await connectDB();

      const body = await req.json();

      const property = await Property.findById(params.id);
      if (!property) return new Response('Not found', { status: 404 });

      // property.workHistory.unshift({
      //    type: body.type || 'note',
      //    text: body.text || '',
      // });

      property.workHistory.unshift({
         type: ['note', 'call', 'message', 'meeting', 'review', 'showing'].includes(body.type)
            ? body.type
            : 'note',
         tone: ['positive', 'negative', 'info', 'important'].includes(body.tone)
            ? body.tone
            : 'info',
         text: body.text || '',
      });

      await property.save();

      return Response.json({ ok: true });
   } catch (e) {
      console.log(e);
      return new Response('Error', { status: 500 });
   }
};