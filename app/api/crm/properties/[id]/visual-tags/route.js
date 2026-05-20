import connectDB from '@/config/database';
import Property from '@/models/Property';

const ALLOWED = ['isHot', 'isFavorite', 'isRealtorObject'];

export const PATCH = async (req, { params }) => {
   try {
      await connectDB();

      const body = await req.json();
      const key = body.key;

      if (!ALLOWED.includes(key)) {
         return Response.json({ error: 'Bad key' }, { status: 400 });
      }

      const property = await Property.findById(params.id);
      if (!property) {
         return Response.json({ error: 'Not found' }, { status: 404 });
      }

      if (!property.visualTags) {
         property.visualTags = {};
      }

      property.visualTags[key] = !property.visualTags[key];

      await property.save();

      return Response.json({
         ok: true,
         visualTags: property.visualTags,
      });
   } catch (error) {
      console.error(error);
      return Response.json({ error: 'Server error' }, { status: 500 });
   }
};