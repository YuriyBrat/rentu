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

      // const item = await Property.findById(params.id).lean();
      const item = await Property.findById(params.id)
         .populate('assignee', 'name fullName surname phone email avatar')
         .populate('createdByEmployee', 'name fullName surname phone email avatar')
         .lean();
      if (!item) return new Response('Property Not Found', { status: 404 });

      return new Response(JSON.stringify({ item }), { status: 200 });
   } catch (error) {
      console.log(error);
      return new Response('Smth wrong', { status: 500 });
   }
};

// PATCH /api/crm/properties/:id
// export const PATCH = async (request, { params }) => {
//    try {
//       await connectDB();

//       const sessionUser = await getSessionUser().catch(() => null);
//       const userId = sessionUser?.userId || null;

//       const existing = await Property.findById(params.id);
//       if (!existing) return new Response('Property Not Found', { status: 404 });

//       if (existing.owner && userId && existing.owner.toString() !== userId) {
//          return new Response('Unauthorized', { status: 401 });
//       }

//       const formData = await request.formData();

//       // прості поля
//       existing.title = formData.get('title') || existing.title;
//       existing.type_estate = formData.get('type_estate') || existing.type_estate;
//       existing.type_deal = formData.get('type_deal') || existing.type_deal;
//       existing.location_text = formData.get('location_text') || existing.location_text;
//       existing.description = formData.get('description') || existing.description;
//       existing.currency = formData.get('currency') || existing.currency;
//       existing.type_building = formData.get('type_building') || existing.type_building;
//       existing.type_walls = formData.get('type_walls') || existing.type_walls;
//       existing.type_using = formData.get('type_using') || existing.type_using;
//       existing.type_commerce = formData.get('type_commerce') || existing.type_commerce;
//       existing.type_house = formData.get('type_house') || existing.type_house;
//       existing.purpose_area = formData.get('purpose_area') || existing.purpose_area;
//       existing.area_unit = formData.get('area_unit') || existing.area_unit;

//       if (formData.get('location.city') !== null) existing.location.city = formData.get('location.city') || '';
//       if (formData.get('location.street') !== null) existing.location.street = formData.get('location.street') || '';
//       if (formData.get('location.number') !== null) existing.location.number = formData.get('location.number') || '';

//       if (formData.get('cost')) existing.cost = Number(formData.get('cost'));
//       if (formData.get('rooms')) existing.rooms = Number(formData.get('rooms'));
//       if (formData.get('square_tot')) existing.square_tot = Number(formData.get('square_tot'));
//       if (formData.get('square_liv')) existing.square_liv = Number(formData.get('square_liv'));
//       if (formData.get('square_kit')) existing.square_kit = Number(formData.get('square_kit'));
//       if (formData.get('square_area')) existing.square_area = Number(formData.get('square_area'));
//       if (formData.get('square_use')) existing.square_use = Number(formData.get('square_use'));
//       if (formData.get('floor')) existing.floor = Number(formData.get('floor'));
//       if (formData.get('floors')) existing.floors = Number(formData.get('floors'));
//       if (formData.get('balconies')) existing.balconies = Number(formData.get('balconies'));
//       if (formData.get('height_wall')) existing.height_wall = Number(formData.get('height_wall'));

//       if (formData.get('actualityGroup')) existing.actualityGroup = formData.get('actualityGroup');
//       if (formData.get('actualityStatus')) existing.actualityStatus = formData.get('actualityStatus');
//       if (formData.get('actualityNote') !== null) existing.actualityNote = formData.get('actualityNote') || '';
//       if (formData.get('isPublic') !== null) existing.isPublic = formData.get('isPublic') === 'true';

//       if (formData.get('lastContactAt')) existing.lastContactAt = new Date(formData.get('lastContactAt'));
//       if (formData.get('nextCheckAt')) existing.nextCheckAt = new Date(formData.get('nextCheckAt'));

//       const advantages = formData.getAll('advantages').map((x) => String(x).trim()).filter(Boolean);
//       const disadvantages = formData.getAll('disadvantages').map((x) => String(x).trim()).filter(Boolean);

//       if (advantages.length) existing.advantages = advantages;
//       if (disadvantages.length) existing.disadvantages = disadvantages;

//       // нові фото
//       const newFiles = formData.getAll('images').filter((f) => f && f.name).slice(0, MAX_FILES);

//       if (newFiles.length) {
//          const folder = `karamax/properties/${existing._id}`;
//          const newImages = [];

//          for (let i = 0; i < newFiles.length; i++) {
//             const file = newFiles[i];
//             const result = await uploadToCloudinary(file, folder);

//             newImages.push({
//                url: result.secure_url,
//                public_id: result.public_id,
//                width: result.width,
//                height: result.height,
//                bytes: result.bytes,
//                format: result.format,
//                originalName: file.name,
//                isMain: !existing.images?.length && i === 0,
//                variants: buildImageVariants(result.public_id),
//             });
//          }

//          existing.images = [...(existing.images || []), ...newImages];
//       }

//       await existing.save();

//       return new Response(JSON.stringify({ item: existing }), { status: 200 });
//    } catch (error) {
//       console.log(error);
//       return new Response('Smth wrong', { status: 500 });
//    }
// };

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

      const parseNumber = (value) => {
         if (value === undefined || value === null || value === '') return undefined;
         const n = Number(value);
         return Number.isNaN(n) ? undefined : n;
      };

      const parseDate = (value) => {
         if (!value) return null;
         const d = new Date(value);
         return Number.isNaN(d.getTime()) ? null : d;
      };


      let businessScore = {};
      try {
         businessScore = JSON.parse(formData.get('businessScore') || '{}');
         if (!businessScore || typeof businessScore !== 'object') businessScore = {};
      } catch {
         businessScore = {};
      }

      const score = (value) => {
         const n = Number(value);
         if (!n || Number.isNaN(n)) return null;
         return Math.min(Math.max(n, 1), 5);
      };


      const hasKey = (key) => formData.get(key) !== null;

      // -------------------------
      // прості поля
      // -------------------------
      if (hasKey('title')) existing.title = formData.get('title') || '';
      if (hasKey('type_estate')) existing.type_estate = formData.get('type_estate') || '';
      if (hasKey('type_deal')) existing.type_deal = formData.get('type_deal') || '';
      if (hasKey('location_text')) existing.location_text = formData.get('location_text') || '';
      if (hasKey('description')) existing.description = formData.get('description') || '';
      if (hasKey('currency')) existing.currency = formData.get('currency') || 'USD';
      if (hasKey('type_building')) existing.type_building = formData.get('type_building') || '';
      if (hasKey('type_walls')) existing.type_walls = formData.get('type_walls') || '';
      if (hasKey('type_using')) existing.type_using = formData.get('type_using') || '';
      if (hasKey('type_commerce')) existing.type_commerce = formData.get('type_commerce') || '';
      if (hasKey('type_house')) existing.type_house = formData.get('type_house') || '';
      if (hasKey('purpose_area')) existing.purpose_area = formData.get('purpose_area') || '';
      if (hasKey('area_unit')) existing.area_unit = formData.get('area_unit') || '';

      if (!existing.location) {
         existing.location = { city: '', street: '', number: '', flat: '' };
      }

      if (hasKey('location.city')) existing.location.city = formData.get('location.city') || '';
      if (hasKey('location.street')) existing.location.street = formData.get('location.street') || '';
      if (hasKey('location.number')) existing.location.number = formData.get('location.number') || '';
      if (hasKey('location.flat')) existing.location.flat = formData.get('location.flat') || '';

      if (hasKey('cost')) existing.cost = parseNumber(formData.get('cost'));
      if (hasKey('rooms')) existing.rooms = parseNumber(formData.get('rooms'));
      if (hasKey('square_tot')) existing.square_tot = parseNumber(formData.get('square_tot'));
      if (hasKey('square_liv')) existing.square_liv = parseNumber(formData.get('square_liv'));
      if (hasKey('square_kit')) existing.square_kit = parseNumber(formData.get('square_kit'));
      if (hasKey('square_area')) existing.square_area = parseNumber(formData.get('square_area'));
      if (hasKey('square_use')) existing.square_use = parseNumber(formData.get('square_use'));
      if (hasKey('floor')) existing.floor = parseNumber(formData.get('floor'));
      if (hasKey('floors')) existing.floors = parseNumber(formData.get('floors'));
      if (hasKey('balconies')) existing.balconies = parseNumber(formData.get('balconies'));
      if (hasKey('height_wall')) existing.height_wall = parseNumber(formData.get('height_wall'));

      if (hasKey('actualityGroup')) existing.actualityGroup = formData.get('actualityGroup') || 'active';
      if (hasKey('actualityStatus')) existing.actualityStatus = formData.get('actualityStatus') || '';
      if (hasKey('actualityNote')) existing.actualityNote = formData.get('actualityNote') || '';
      if (hasKey('crmStage')) existing.crmStage = formData.get('crmStage') || 'rs';
      if (hasKey('crmStageReason')) existing.crmStageReason = formData.get('crmStageReason') || '';
      if (hasKey('inspectedAt')) existing.inspectedAt = parseDate(formData.get('inspectedAt'));
      if (hasKey('isPublic')) existing.isPublic = formData.get('isPublic') === 'true';

      if (hasKey('lastContactAt')) existing.lastContactAt = parseDate(formData.get('lastContactAt'));
      if (hasKey('nextCheckAt')) existing.nextCheckAt = parseDate(formData.get('nextCheckAt'));

      // -------------------------
      // нові поля
      // -------------------------
      if (hasKey('statusRent')) existing.statusRent = formData.get('statusRent') || 'rentNo';

      if (hasKey('assignee')) {
         const assignee = formData.get('assignee');
         existing.assignee = assignee || null;
      }

      if (hasKey('createdByEmployee')) {
         const createdByEmployee = formData.get('createdByEmployee');
         existing.createdByEmployee = createdByEmployee || null;
      }

      // -------------------------
      // масиви
      // -------------------------
      if (hasKey('advantages')) {
         existing.advantages = formData.getAll('advantages').map((x) => String(x).trim()).filter(Boolean);
      }

      if (hasKey('disadvantages')) {
         existing.disadvantages = formData.getAll('disadvantages').map((x) => String(x).trim()).filter(Boolean);
      }

      // -------------------------
      // owners
      // -------------------------
      if (hasKey('owners')) {
         try {
            const owners = JSON.parse(formData.get('owners') || '[]');
            existing.owners = Array.isArray(owners) ? owners : [];
         } catch {
            existing.owners = [];
         }
      }

      // -------------------------
      // rentOptions
      // -------------------------
      if (hasKey('rentOptions')) {
         try {
            const rentOptionsRaw = JSON.parse(formData.get('rentOptions') || '{}');
            const rentOptions = rentOptionsRaw && typeof rentOptionsRaw === 'object' ? rentOptionsRaw : {};

            existing.rentOptions = {
               ...existing.rentOptions?.toObject?.(),
               price: parseNumber(rentOptions?.price),
               currency: rentOptions?.currency || 'USD',
               rentTitle: rentOptions?.rentTitle || '',
               availableFrom: parseDate(rentOptions?.availableFrom),
               adText: rentOptions?.adText || '',
               notes: rentOptions?.notes || '',
               conditions: Array.isArray(rentOptions?.conditions) ? rentOptions.conditions.filter(Boolean) : [],
               furniture: Array.isArray(rentOptions?.furniture) ? rentOptions.furniture.filter(Boolean) : [],
               appliances: Array.isArray(rentOptions?.appliances) ? rentOptions.appliances.filter(Boolean) : [],
               rentStory: {
                  rentedAt: parseDate(rentOptions?.rentStory?.rentedAt),
                  rentedBy: rentOptions?.rentStory?.rentedBy || '',
                  note: rentOptions?.rentStory?.note || '',
               },
               lastActualizedAt: parseDate(rentOptions?.lastActualizedAt),
            };
         } catch (e) {
            console.log('rentOptions parse error', e);
         }
      };


      // категорії бізнесу
      if (hasKey('source')) existing.source = formData.get('source') || '';

      if (hasKey('strategyApprovedBy')) {
         existing.strategyApprovedBy = formData.get('strategyApprovedBy') || null;
      }

      if (hasKey('strategyApprovedAt')) {
         existing.strategyApprovedAt = formData.get('strategyApprovedAt')
            ? new Date(formData.get('strategyApprovedAt'))
            : null;
      }

      if (hasKey('businessScore')) {
         existing.businessScore = {
            finance: score(businessScore.finance),
            liquidity: score(businessScore.liquidity),
            loyalty: score(businessScore.loyalty),
            motivation: score(businessScore.motivation),
            problemFree: score(businessScore.problemFree),
            adAttractiveness: score(businessScore.adAttractiveness),
            adHistory: score(businessScore.adHistory),
            adStrategy: score(businessScore.adStrategy),
         };
      }

      const newFiles = formData.getAll('images').filter((f) => f && f.name).slice(0, MAX_FILES);
      const shouldUpdateImages = hasKey('existingImages') || hasKey('imagesMeta') || newFiles.length > 0;

      if (shouldUpdateImages) {
         // -------------------------
         // existing images
         // -------------------------
         let existingImages = [];
         try {
            existingImages = JSON.parse(formData.get('existingImages') || '[]');
            if (!Array.isArray(existingImages)) existingImages = [];
         } catch {
            existingImages = [];
         }

         let imagesMeta = [];
         try {
            imagesMeta = JSON.parse(formData.get('imagesMeta') || '[]');
            if (!Array.isArray(imagesMeta)) imagesMeta = [];
         } catch {
            imagesMeta = [];
         }

         const uploadedImages = [];

         for (let i = 0; i < newFiles.length; i++) {
            const file = newFiles[i];
            const meta = imagesMeta[i] || {};
            const stage = meta?.stage || 'draft';
            const folder = `karamax/properties/${existing._id}/${stage}`;

            const result = await uploadToCloudinary(file, folder);

            uploadedImages.push({
               url: result.secure_url,
               public_id: result.public_id,
               width: result.width,
               height: result.height,
               bytes: result.bytes,
               format: result.format,
               originalName: meta?.originalName || file.name,
               isMain: !!meta?.isMain,
               sortOrder: typeof meta?.sortOrder === 'number' ? meta.sortOrder : i,
               stage,
               processedUrl: stage === 'processed' ? result.secure_url : '',
               brandedUrl: stage === 'branded' ? result.secure_url : '',
               isHidden: false,
               variants: buildImageVariants(result.public_id),
            });
         }

         const mergedImages = [...existingImages, ...uploadedImages]
            .map((img, idx) => ({
               ...img,
               isMain: !!img.isMain,
               sortOrder: img.sortOrder ?? idx,
               stage: img.stage || 'draft',
            }))
            .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));

         if (mergedImages.length > 0 && !mergedImages.some((img) => img.isMain)) {
            mergedImages[0].isMain = true;
         }

         existing.images = mergedImages;
      }

      await existing.save();

      const saved = await Property.findById(existing._id)
         .populate('assignee', 'name fullName surname phone email avatar')
         .populate('createdByEmployee', 'name fullName surname phone email avatar')
         .lean();

      return new Response(JSON.stringify({ item: saved }), { status: 200 });
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
