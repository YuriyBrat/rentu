import connectDB from '@/config/database';
import Property from '@/models/Property';

// GET /api/properties/user/:userId
export const GET = async (request, { params }) => {
   try {
      await connectDB();
      const userId = params.userId; //! same name as folder, if folder name id so params.id

      if (!userId) {
         return new Response('User ID is required', { status: 400 })
      };



      const properties = await Property.find({ owner: userId });
      //   console.log(properties)
      return new Response(JSON.stringify(properties), { status: 200 })
   } catch (error) {
      console.log(error)
      return new Response('Smth wrong', {
         status: 500
      })
   }
};