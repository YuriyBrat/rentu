import connectDB from '@/config/database';
import Property from '@/models/Property';
import { getSessionUser } from '@/utils/getSessionUser';
import cloudinary from '@/config/cloudinary';


// export const dynamic = 'force-dynamic'; //! хз чи треба хз що за фігня

// GET /api/properties
export const GET = async (req) => {
   try {
      await connectDB();

      const page = req.nextUrl.searchParams.get('page') || 1;
      const pageSize = req.nextUrl.searchParams.get('pageSize') || 10;

      const skip = (page - 1) * pageSize;

      const total = await Property.countDocuments({});
      const properties = await Property.find({}).skip(skip).limit(pageSize);

      const result = {
         total,
         properties
      }

      return new Response(JSON.stringify(result), { status: 200 })
   } catch (error) {
      console.log(error)
      return new Response('Smth wrong', {
         status: 500
      })
   }
};

export const POST = async (request) => {
   try {
      await connectDB();


      const sessionUser = await getSessionUser();
      if (!sessionUser || !sessionUser.userId) {
         return new Response('User ID required', { status: 401 })
      };

      const { userId } = sessionUser;


      const formData = await request.formData();
      // console.log(formData.get('name'));

      // Access all values from amenities and images
      const amenities = formData.getAll('amenities');
      const images = formData.getAll('images').filter(image => image.name !== '');

      // console.log(amenities, images)

      //Create propertyData object for db
      const propertyData = {
         type: formData.get('type'),
         name: formData.get('name'),
         description: formData.get('description'),
         location: {
            street: formData.get('location.street'),
            city: formData.get('location.city'),
            state: formData.get('location.state'),
            zipcode: formData.get('location.zipcode'),
         },
         beds: formData.get('beds'),
         baths: formData.get('baths'),
         square_feet: formData.get('square_feet'),
         amenities,
         rates: {
            weekly: formData.get('rates.weekly'),
            monthly: formData.get('rates.monthly'),
            nightly: formData.get('rates.nightly'),
         },
         seller_info: {
            name: formData.get('seller_info.name'),
            email: formData.get('seller_info.email'),
            phone: formData.get('seller_info.phone'),
         },
         owner: userId,
         // images
      };

      // Upload image(s) to Cloudaniry
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
            folder: 'Propertypulse'
         }
         );

         imageUploadPromises.push(result.secure_url) // adress of images
         // Wait for all images to upload
         const uploadedImages = await Promise.all(imageUploadPromises);

         // Add uploaded images to the property data
         propertyData.images = uploadedImages;
      }

      const newProperty = new Property(propertyData);
      await newProperty.save();

      // console.log(propertyData)
      return Response.redirect(`${process.env.NEXTAUTH_URL}/properties/${newProperty._id}`)

      // return new Response(JSON.stringify({ message: 'Success' }),
      //    { status: 200 });
   } catch (error) {
      return new Response('Error to add property',
         { status: 500 });
   }
}