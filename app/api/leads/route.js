import connectDB from '@/config/database';
import Lead from '@/models/Lead';
import { getSessionUser } from '@/utils/getSessionUser';
import cloudinary from '@/config/cloudinary';


//  export const dynamic = 'force-dynamic'; //! хз чи треба хз що за фігня

// POST /api/leads

export const POST = async (req) => {

   try {
      await connectDB();

      //       const formData = await request.formData();
      // console.log(formData);
      const reqData = await req.json();

      const leadData = {
         leadname: reqData.name,
         phone: reqData.phone,
         email: reqData.email,
         notes: reqData.notes,
         // notes: formData.get('notes'),
         ip: reqData.ip
      };

      console.log(leadData);


      const newLead = new Lead(leadData);
      await newLead.save();

      // console.log(propertyData)
      // return Response.redirect(`${process.env.NEXTAUTH_URL}/properties/${newProperty._id}`)

      return new Response(JSON.stringify({ message: 'Success' }),
         { status: 200 });
   } catch (error) {
      // return new Response(JSON.stringify({ message: 'Smth done wrong' }), { status: 500 })
      return new Response(JSON.stringify({ message: 'Error in saving lead in db', error }), { status: 500 })
   }
}