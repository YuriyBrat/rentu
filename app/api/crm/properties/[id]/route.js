import connectDB from '@/config/database';
import Property from '@/models/Property';
import { getSessionUser } from '@/utils/getSessionUser';
import cloudinary from '@/config/cloudinary';

async function uploadToCloudinary(file, folder = 'karamax/properties') {
   const arrayBuffer = await file.arrayBuffer();
   const buffer = Buffer.from(new Uint8Array(arrayBuffer));
   const base64 = buffer.toString('base64');
   const mime = file.type || 'image/jpeg';

   const res = await cloudinary.uploader.upload(`data:${mime};base64,${base64}`, { folder });
   return res.secure_url;
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

// PATCH /api/crm/properties/:id (multipart/form-data or json)
export const PATCH = async (request, { params }) => {
   try {
      await connectDB();

      const sessionUser = await getSessionUser();
      if (!sessionUser || !sessionUser.userId) {
         return new Response('User ID required', { status: 401 });
      }
      const { userId } = sessionUser;

      const existing = await Property.findById(params.id);
      if (!existing) return new Response('Property Not Found', { status: 404 });

      // якщо є owner у моделі — залишаємо перевірку
      if (existing.owner && existing.owner.toString() !== userId) {
         return new Response('Unauthorized', { status: 401 });
      }

      const contentType = request.headers.get('content-type') || '';

      // --- JSON PATCH ---
      if (contentType.includes('application/json')) {
         const body = await request.json();
         const updated = await Property.findByIdAndUpdate(params.id, body, { new: true }).lean();
         return new Response(JSON.stringify({ item: updated }), { status: 200 });
      }

      // --- FORM PATCH (images add/remove etc.) ---
      const formData = await request.formData();

      const imagesFiles = formData.getAll('images').filter((f) => f && f.name);
      const newImages = await Promise.all(imagesFiles.map((f) => uploadToCloudinary(f, 'karamax/properties')));

      // можна передавати imagesToRemove[] (url) для видалення з масиву (з cloudinary можна теж видаляти, але треба public_id)
      const imagesToRemove = formData.getAll('imagesToRemove').map(String).filter(Boolean);

      const patch = {};

      // прості поля (тільки якщо передані)
      const setIf = (key, val) => {
         if (val !== null && val !== undefined && String(val).length) patch[key] = val;
      };

      setIf('title', formData.get('title'));
      setIf('type_estate', formData.get('type_estate'));
      setIf('type_deal', formData.get('type_deal'));
      setIf('location_text', formData.get('location_text'));
      setIf('description', formData.get('description'));
      setIf('currency', formData.get('currency'));
      if (formData.get('cost')) patch.cost = Number(formData.get('cost'));

      // актуальність
      if (formData.get('actualityGroup')) patch.actualityGroup = formData.get('actualityGroup');
      if (formData.get('actualityStatus')) patch.actualityStatus = formData.get('actualityStatus');
      if (formData.get('isPublic') !== null && formData.get('isPublic') !== undefined) {
         patch.isPublic = formData.get('isPublic') === 'true';
      }

      // масиви
      const advantages = formData.getAll('advantages').map((x) => String(x).trim()).filter(Boolean);
      const disadvantages = formData.getAll('disadvantages').map((x) => String(x).trim()).filter(Boolean);
      if (advantages.length) patch.advantages = advantages;
      if (disadvantages.length) patch.disadvantages = disadvantages;

      // картинки: додаємо + прибираємо
      let mergedImages = Array.isArray(existing.images) ? [...existing.images] : [];
      if (imagesToRemove.length) mergedImages = mergedImages.filter((url) => !imagesToRemove.includes(url));
      if (newImages.length) mergedImages.push(...newImages);
      patch.images = mergedImages;

      const updated = await Property.findByIdAndUpdate(params.id, patch, { new: true }).lean();
      return new Response(JSON.stringify({ item: updated }), { status: 200 });
   } catch (error) {
      console.log(error);
      return new Response('Smth wrong', { status: 500 });
   }
};

// DELETE /api/crm/properties/:id
export const DELETE = async (_request, { params }) => {
   try {
      const sessionUser = await getSessionUser();
      if (!sessionUser || !sessionUser.userId) {
         return new Response('User Id required', { status: 401 });
      }
      const { userId } = sessionUser;

      await connectDB();

      const property = await Property.findById(params.id);
      if (!property) return new Response('Property Not Found', { status: 404 });

      if (property.owner && property.owner.toString() !== userId) {
         return new Response('Unauthorized', { status: 401 });
      }

      await property.deleteOne();
      return new Response(JSON.stringify({ ok: true }), { status: 200 });
   } catch (error) {
      console.log(error);
      return new Response('Smth wrong', { status: 500 });
   }
};