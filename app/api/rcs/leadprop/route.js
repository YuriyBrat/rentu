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
      const pageSize = req.nextUrl.searchParams.get('pageSize') || 20;

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
      // const reqData = await req.json();

      const formData = await req.formData();

      let reqObject = {};
      for (let [name, value] of formData) {
         if (name != 'images' && name != 'advantages') {
            reqObject[name] = value
         }
      }

      // Upload image(s) to Cloudaniry
      let advantages = [];
      try {
         advantages = formData.getAll('advantages');
         const images = formData.getAll('images').filter(image => image.name !== '');
         const imageUploadPromises = [];
         for (const image of images) {

            const imageBuffer = await image.arrayBuffer();
            const imageArray = Array.from(new Uint8Array(imageBuffer));
            const imageData = Buffer.from(imageArray);

            // Convert the image data to base64
            const imageBase64 = imageData.toString('base64');

            // Upload request to upload to Cloudaniry
            const result = await cloudinary.uploader.upload(
               `data:image/png;base64,${imageBase64}`, {
               folder: 'Propertypulse/test'
            }
            );

            imageUploadPromises.push(result.secure_url) // adress of images
            // Wait for all images to upload
            const uploadedImages = await Promise.all(imageUploadPromises);
            reqObject['images'] = uploadedImages;
         }
      } catch (error) {
         console.log('Error in saving images ' + error);
      }
      reqObject = { ...reqObject, advantages };
      const newLeadProperty = new LeadProperty(reqObject);
      await newLeadProperty.save();

      // console.log(reqObject)
      // return Response.redirect(`${process.env.NEXTAUTH_URL}/properties/${newProperty._id}`)

      return new Response(JSON.stringify({ message: 'Success' }),
         { status: 200 });
   } catch (error) {
      // return new Response(JSON.stringify({ message: 'Smth done wrong' }), { status: 500 })
      return new Response(JSON.stringify({ message: 'Error in saving datas in db', error }), { status: 500 })
   }
}