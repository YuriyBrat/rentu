import connectDB from '@/config/database';
import Lead from '@/models/Lead';
import LeadProperty from '@/models/LeadProperty';
import { getSessionUser } from '@/utils/getSessionUser';
import cloudinary from '@/config/cloudinary';


//  export const dynamic = 'force-dynamic'; //! хз чи треба хз що за фігня

// GET /api/rcs/leadprops
export const GET = async (req) => {
   try {
      await connectDB();

      const page = req.nextUrl.searchParams.get('page') || 1;
      const pageSize = req.nextUrl.searchParams.get('pageSize') || 10;

      const skip = (page - 1) * pageSize;

      const total = await LeadProperty.countDocuments({});
      const leadprops = await LeadProperty.find({}).skip(skip).limit(pageSize);

      const result = {
         total,
         leadprops
      }

      return new Response(JSON.stringify(result), { status: 200 })
   } catch (error) {
      console.log(error)
      return new Response('Smth wrong', {
         status: 500
      })
   }
};


// POST /api/rcs/leads

export const POST = async (req) => {

   try {
      await connectDB();

      //       const formData = await request.formData();
      // console.log(formData);
      const reqData = await req.json();

      // const leadData = {
      //    leadname: reqData.name,
      //    phone: reqData.phone,
      //    email: reqData.email,
      //    notes: reqData.notes,
      //    // notes: formData.get('notes'),
      //    ip: reqData.ip
      // };

      console.log(reqData);


      const newLeadProperty = new LeadProperty(reqData);
      await newLeadProperty.save();

      // console.log(propertyData)
      // return Response.redirect(`${process.env.NEXTAUTH_URL}/properties/${newProperty._id}`)

      return new Response(JSON.stringify({ message: 'Success' }),
         { status: 200 });
   } catch (error) {
      // return new Response(JSON.stringify({ message: 'Smth done wrong' }), { status: 500 })
      return new Response(JSON.stringify({ message: 'Error in saving datas in db', error }), { status: 500 })
   }
}