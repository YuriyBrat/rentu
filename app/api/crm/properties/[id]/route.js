import connectDB from '@/config/database';
import Property from '@/models/Property';
import { getSessionUser } from '@/utils/getSessionUser';
import cloudinary from '@/config/cloudinary';

const MAX_FILES = 25;

async function uploadToCloudinary(file, folder) {
   const arrayBuffer = await file.arrayBuffer();
   const buffer = Buffer.from(new Uint8Array(arrayBuffer));
   const base64 = buffer.toString('base64');
   const mime = file.type || 'image/jpeg';

   const result = await cloudinary.uploader.upload(
      `data:${mime};base64,${base64}`,
      {
         folder,
         resource_type: 'image',
      }
   );

   return result;
}

function buildImageVariants(publicId) {
   return {
      preview: cloudinary.url(publicId, {
         width: 400,
         height: 300,
         crop: 'fill',
         gravity: 'auto',
         fetch_format: 'auto',
         quality: 'auto',
         secure: true,
      }),
      card: cloudinary.url(publicId, {
         width: 900,
         height: 650,
         crop: 'fill',
         gravity: 'auto',
         fetch_format: 'auto',
         quality: 'auto',
         secure: true,
      }),
      full: cloudinary.url(publicId, {
         width: 2000,
         height: 1500,
         crop: 'limit',
         fetch_format: 'auto',
         quality: 'auto',
         secure: true,
      }),
   };
}

// GET /api/crm/properties/:id
export const GET = async (_request, { params }) => {
   try {
      await connectDB();

      const item = await Property.findById(params.id).lean();
      if (!item) return new Response('Property Not Found', { status: 404 });

      return new Response(JSON.stringify({ item }), { status: 200 });
   } catch (error) {
      console.log(error);
      return new Response('Smth wrong', { status: 500 });
   }
};

// PATCH /api/crm/properties/:id
export const PATCH = async (request, { params }) => {
   try {
      await connectDB();

      const sessionUser = await getSessionUser().catch(() => null);
      const userId = sessionUser?.userId || null;

      const existing = await Property.findById(params.id);
      if (!existing) return new Response('Property Not Found', { status: 404 });

      if (existing.owner && userId && existing.owner.toString() !== userId) {
         return new Response('Unauthorized', { status: 401 });
      }

      const formData = await request.formData();

      // прості поля
      existing.title = formData.get('title') || existing.title;
      existing.type_estate = formData.get('type_estate') || existing.type_estate;
      existing.type_deal = formData.get('type_deal') || existing.type_deal;
      existing.location_text = formData.get('location_text') || existing.location_text;
      existing.description = formData.get('description') || existing.description;
      existing.currency = formData.get('currency') || existing.currency;
      existing.type_building = formData.get('type_building') || existing.type_building;
      existing.type_walls = formData.get('type_walls') || existing.type_walls;
      existing.type_using = formData.get('type_using') || existing.type_using;
      existing.type_commerce = formData.get('type_commerce') || existing.type_commerce;
      existing.type_house = formData.get('type_house') || existing.type_house;
      existing.purpose_area = formData.get('purpose_area') || existing.purpose_area;
      existing.area_unit = formData.get('area_unit') || existing.area_unit;

      if (formData.get('location.city') !== null) existing.location.city = formData.get('location.city') || '';
      if (formData.get('location.street') !== null) existing.location.street = formData.get('location.street') || '';
      if (formData.get('location.number') !== null) existing.location.number = formData.get('location.number') || '';

      if (formData.get('cost')) existing.cost = Number(formData.get('cost'));
      if (formData.get('rooms')) existing.rooms = Number(formData.get('rooms'));
      if (formData.get('square_tot')) existing.square_tot = Number(formData.get('square_tot'));
      if (formData.get('square_liv')) existing.square_liv = Number(formData.get('square_liv'));
      if (formData.get('square_kit')) existing.square_kit = Number(formData.get('square_kit'));
      if (formData.get('square_area')) existing.square_area = Number(formData.get('square_area'));
      if (formData.get('square_use')) existing.square_use = Number(formData.get('square_use'));
      if (formData.get('floor')) existing.floor = Number(formData.get('floor'));
      if (formData.get('floors')) existing.floors = Number(formData.get('floors'));
      if (formData.get('balconies')) existing.balconies = Number(formData.get('balconies'));
      if (formData.get('height_wall')) existing.height_wall = Number(formData.get('height_wall'));

      if (formData.get('actualityGroup')) existing.actualityGroup = formData.get('actualityGroup');
      if (formData.get('actualityStatus')) existing.actualityStatus = formData.get('actualityStatus');
      if (formData.get('actualityNote') !== null) existing.actualityNote = formData.get('actualityNote') || '';
      if (formData.get('isPublic') !== null) existing.isPublic = formData.get('isPublic') === 'true';

      if (formData.get('lastContactAt')) existing.lastContactAt = new Date(formData.get('lastContactAt'));
      if (formData.get('nextCheckAt')) existing.nextCheckAt = new Date(formData.get('nextCheckAt'));

      const advantages = formData.getAll('advantages').map((x) => String(x).trim()).filter(Boolean);
      const disadvantages = formData.getAll('disadvantages').map((x) => String(x).trim()).filter(Boolean);

      if (advantages.length) existing.advantages = advantages;
      if (disadvantages.length) existing.disadvantages = disadvantages;

      // нові фото
      const newFiles = formData.getAll('images').filter((f) => f && f.name).slice(0, MAX_FILES);

      if (newFiles.length) {
         const folder = `karamax/properties/${existing._id}`;
         const newImages = [];

         for (let i = 0; i < newFiles.length; i++) {
            const file = newFiles[i];
            const result = await uploadToCloudinary(file, folder);

            newImages.push({
               url: result.secure_url,
               public_id: result.public_id,
               width: result.width,
               height: result.height,
               bytes: result.bytes,
               format: result.format,
               originalName: file.name,
               isMain: !existing.images?.length && i === 0,
               variants: buildImageVariants(result.public_id),
            });
         }

         existing.images = [...(existing.images || []), ...newImages];
      }

      await existing.save();

      return new Response(JSON.stringify({ item: existing }), { status: 200 });
   } catch (error) {
      console.log(error);
      return new Response('Smth wrong', { status: 500 });
   }
};

// DELETE /api/crm/properties/:id
export const DELETE = async (_request, { params }) => {
   try {
      await connectDB();

      const sessionUser = await getSessionUser().catch(() => null);
      const userId = sessionUser?.userId || null;

      const property = await Property.findById(params.id);
      if (!property) return new Response('Property Not Found', { status: 404 });

      if (property.owner && userId && property.owner.toString() !== userId) {
         return new Response('Unauthorized', { status: 401 });
      }

      // 1. видаляємо всі фото з cloudinary
      if (Array.isArray(property.images) && property.images.length) {
         for (const img of property.images) {
            if (img?.public_id) {
               await cloudinary.uploader.destroy(img.public_id);
            }
         }
      };

      for (const img of property.images) {
         if (img?.public_id) {
            console.log('Deleting:', img.public_id);
            const result = await cloudinary.uploader.destroy(img.public_id);
            console.log('Delete result:', result);
         }
      }

      // 2. видаляємо документ
      await property.deleteOne();

      return new Response(JSON.stringify({ ok: true }), { status: 200 });
   } catch (error) {
      console.log(error);
      return new Response('Smth wrong', { status: 500 });
   }
};