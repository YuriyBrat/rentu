import connectDB from '@/config/database';
import Property from '@/models/Property';

export const PATCH = async (req, { params }) => {
   try {
      await connectDB();

      const body = await req.json();

      await Property.updateOne(
         { _id: params.id, 'shareLinks.slug': params.slug },
         {
            $set: {
               'shareLinks.$.title': body.title || '',
            },
         }
      );

      return Response.json({ ok: true });
   } catch (error) {
      console.error('UPDATE SHARE LINK ERROR:', error);
      return Response.json({ error: 'Server error' }, { status: 500 });
   }
};

export const DELETE = async (req, { params }) => {
   try {
      await connectDB();

      await Property.updateOne(
         { _id: params.id },
         {
            $pull: {
               shareLinks: { slug: params.slug },
            },
         }
      );

      return Response.json({ ok: true });
   } catch (error) {
      console.error('DELETE SHARE LINK ERROR:', error);
      return Response.json({ error: 'Server error' }, { status: 500 });
   }
};