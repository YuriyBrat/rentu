import connectDB from '@/config/database';
import Property from '@/models/Property';

export const dynamic = 'force-dynamic'; //! хз чи треба хз що за фігня

// GET /api/properties/featured
export const GET = async (req) => {
   try {
      await connectDB();
      const properties = await Property.find({ is_featured: true });

      return new Response(JSON.stringify(properties), { status: 200 })
   } catch (error) {
      console.log(error)
      return new Response('Smth wrong', {
         status: 500
      })
   }
};