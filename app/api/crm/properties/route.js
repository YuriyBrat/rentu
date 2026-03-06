import connectDB from '@/config/database';
import Property from '@/models/Property';
import { getSessionUser } from '@/utils/getSessionUser';
import cloudinary from '@/config/cloudinary';

// helper: upload File -> url
async function uploadToCloudinary(file, folder = 'karamax/properties') {
   const arrayBuffer = await file.arrayBuffer();
   const buffer = Buffer.from(new Uint8Array(arrayBuffer));
   const base64 = buffer.toString('base64');

   // краще брати mimetype з файлу
   const mime = file.type || 'image/jpeg';

   const res = await cloudinary.uploader.upload(`data:${mime};base64,${base64}`, {
      folder,
   });

   return res.secure_url;
}

// GET /api/crm/properties?page=1&pageSize=12&q=&actualityGroup=&isPublic=
export const GET = async (req) => {
   try {
      await connectDB();

      const sp = req.nextUrl.searchParams;

      const page = Math.max(parseInt(sp.get('page') || '1', 10), 1);
      const pageSize = Math.min(Math.max(parseInt(sp.get('pageSize') || '12', 10), 1), 100);
      const skip = (page - 1) * pageSize;

      const q = (sp.get('q') || '').trim();
      const actualityGroup = sp.get('actualityGroup'); // active/paused/inactive
      const actualityStatus = sp.get('actualityStatus'); // конкретний статус
      const isPublic = sp.get('isPublic'); // "true"/"false"

      const filter = {};

      if (q) {
         filter.$or = [
            { title: { $regex: q, $options: 'i' } },
            { location_text: { $regex: q, $options: 'i' } },
            { 'location.city': { $regex: q, $options: 'i' } },
         ];
      }

      if (actualityGroup) filter.actualityGroup = actualityGroup;
      if (actualityStatus) filter.actualityStatus = actualityStatus;

      if (isPublic === 'true') filter.isPublic = true;
      if (isPublic === 'false') filter.isPublic = false;

      const total = await Property.countDocuments(filter);
      const items = await Property.find(filter)
         .sort({ updatedAt: -1 })
         .skip(skip)
         .limit(pageSize)
         .lean();

      return new Response(JSON.stringify({ total, page, pageSize, items }), { status: 200 });
   } catch (error) {
      console.log(error);
      return new Response('Smth wrong', { status: 500 });
   }
};

// POST /api/crm/properties (multipart/form-data)
export const POST = async (request) => {
   try {
      await connectDB();

      // const sessionUser = await getSessionUser();
      // if (!sessionUser || !sessionUser.userId) {
      //    return new Response('User ID required', { status: 401 });
      // }
      // const { userId } = sessionUser;

      const formData = await request.formData();

      // images
      const imagesFiles = formData.getAll('images').filter((f) => f && f.name);
      const uploadedImages = await Promise.all(
         imagesFiles.map((f) => uploadToCloudinary(f, 'karamax/properties'))
      );

      // advantages/disadvantages як масиви
      const advantages = formData.getAll('advantages').map((x) => String(x).trim()).filter(Boolean);
      const disadvantages = formData.getAll('disadvantages').map((x) => String(x).trim()).filter(Boolean);

      // payload для CRM Property
      const propertyData = {
         // meta
         // owner: userId, // якщо в твоїй Property моделі є owner; якщо нема — прибери
         isPublic: formData.get('isPublic') === 'true',

         actualityGroup: formData.get('actualityGroup') || 'active',
         actualityStatus: formData.get('actualityStatus') || 'Продзвін',

         lastContactAt: formData.get('lastContactAt') ? new Date(formData.get('lastContactAt')) : undefined,
         nextCheckAt: formData.get('nextCheckAt') ? new Date(formData.get('nextCheckAt')) : undefined,
         actualityNote: formData.get('actualityNote') || '',

         disadvantages,

         // core
         type_estate: formData.get('type_estate') || '',
         type_deal: formData.get('type_deal') || '',
         title: formData.get('title') || '',
         location_text: formData.get('location_text') || '',
         location: {
            city: formData.get('location.city') || '',
            street: formData.get('location.street') || '',
            number: formData.get('location.number') || '',
         },

         rooms: formData.get('rooms') ? Number(formData.get('rooms')) : undefined,
         square_tot: formData.get('square_tot') ? Number(formData.get('square_tot')) : undefined,
         square_liv: formData.get('square_liv') ? Number(formData.get('square_liv')) : undefined,
         square_kit: formData.get('square_kit') ? Number(formData.get('square_kit')) : undefined,
         square_area: formData.get('square_area') ? Number(formData.get('square_area')) : undefined,
         square_use: formData.get('square_use') ? Number(formData.get('square_use')) : undefined,
         area_unit: formData.get('area_unit') || '',

         floor: formData.get('floor') ? Number(formData.get('floor')) : undefined,
         floors: formData.get('floors') ? Number(formData.get('floors')) : undefined,

         type_building: formData.get('type_building') || '',
         type_walls: formData.get('type_walls') || '',
         balconies: formData.get('balconies') ? Number(formData.get('balconies')) : undefined,

         height_wall: formData.get('height_wall') ? Number(formData.get('height_wall')) : undefined,

         type_using: formData.get('type_using') || '',
         type_commerce: formData.get('type_commerce') || '',
         type_house: formData.get('type_house') || '',
         purpose_area: formData.get('purpose_area') || '',

         cost: formData.get('cost') ? Number(formData.get('cost')) : undefined,
         currency: formData.get('currency') || 'USD',

         description: formData.get('description') || '',

         images: uploadedImages,
         advantages,
      };

      if (!propertyData.title) {
         return new Response(JSON.stringify({ error: 'title required' }), { status: 400 });
      }

      const created = await Property.create(propertyData);

      // CRM: не редіректимо як лендінг, а повертаємо JSON
      return new Response(JSON.stringify({ item: created }), { status: 201 });
   } catch (error) {
      console.log(error);
      return new Response('Error to add property', { status: 500 });
   }
};