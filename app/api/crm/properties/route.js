import connectDB from '@/config/database';
import Property from '@/models/Property';
import { getSessionUser } from '@/utils/getSessionUser';
import cloudinary from '@/config/cloudinary';

const MAX_FILES = 25;

const STAGE_FOLDERS = {
   draft: 'draft',
   processed: 'processed',
   branded: 'branded',
};

function normalizeStage(value) {
   if (value === 'processed') return 'processed';
   if (value === 'branded') return 'branded';
   return 'draft';
}

function parseNumber(value) {
   if (value === undefined || value === null || value === '') return undefined;
   const n = Number(value);
   return Number.isNaN(n) ? undefined : n;
}

function parseDate(value) {
   if (!value) return undefined;
   const d = new Date(value);
   return Number.isNaN(d.getTime()) ? undefined : d;
}

function getImageBestUrl(img) {
   return (
      img?.variants?.branded ||
      img?.brandedUrl ||
      img?.variants?.card ||
      img?.processedUrl ||
      img?.url ||
      ''
   );
}

// function buildImageVariants(publicId, stage) {
//    const preview = cloudinary.url(publicId, {
//       width: 400,
//       height: 300,
//       crop: 'fill',
//       gravity: 'auto',
//       fetch_format: 'auto',
//       quality: 'auto',
//       secure: true,
//    });

//    const card = cloudinary.url(publicId, {
//       width: 900,
//       height: 650,
//       crop: 'fill',
//       gravity: 'auto',
//       fetch_format: 'auto',
//       quality: 'auto',
//       secure: true,
//    });

//    const full = cloudinary.url(publicId, {
//       width: 2000,
//       height: 1500,
//       crop: 'limit',
//       fetch_format: 'auto',
//       quality: 'auto',
//       secure: true,
//    });

//    return {
//       preview,
//       card,
//       full,
//       branded: stage === 'branded' ? card : '',
//    };
// };

function buildImageVariants(publicId, stage = 'draft') {
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
      branded:
         stage === 'branded'
            ? cloudinary.url(publicId, {
               width: 900,
               height: 650,
               crop: 'fill',
               gravity: 'auto',
               fetch_format: 'auto',
               quality: 'auto',
               secure: true,
            })
            : '',
   };
};


async function uploadToCloudinary(file, folder) {
   const arrayBuffer = await file.arrayBuffer();
   const buffer = Buffer.from(new Uint8Array(arrayBuffer));
   const base64 = buffer.toString('base64');
   const mime = file.type || 'image/jpeg';

   const result = await cloudinary.uploader.upload(`data:${mime};base64,${base64}`, {
      folder,
      resource_type: 'image',
   });

   return result;
}

function mapPropertyListItem(item) {
   const visibleImages = (Array.isArray(item.images) ? item.images : [])
      .filter((img) => !img?.isHidden)
      .sort((a, b) => (a?.sortOrder ?? 0) - (b?.sortOrder ?? 0));

   const main = visibleImages.find((img) => img?.isMain) || visibleImages[0];

   return {
      ...item,
      _id: item._id?.toString?.() || item._id,
      mainImage: getImageBestUrl(main) || '/krm/logo-krm.png',
      images: visibleImages.map((img) => getImageBestUrl(img)).filter(Boolean),
   };
}

// GET /api/crm/properties
export const GET = async (req) => {
   try {
      await connectDB();

      const sp = req.nextUrl.searchParams;

      const page = Math.max(parseInt(sp.get('page') || '1', 10), 1);
      const pageSize = Math.min(Math.max(parseInt(sp.get('pageSize') || '12', 10), 1), 100);
      const skip = (page - 1) * pageSize;

      const q = (sp.get('q') || '').trim();

      const filter = {};

      const mode = sp.get('mode');

      if (mode === 'rent') {
         filter.statusRent = { $in: ['rentActual', 'rentPause', 'rentRented'] };
      }

      if (q) {
         filter.$or = [
            { title: { $regex: q, $options: 'i' } },
            { location_text: { $regex: q, $options: 'i' } },
            { 'location.city': { $regex: q, $options: 'i' } },
         ];
      }

      const total = await Property.countDocuments(filter);
      // const rawItems = await Property.find(filter)
      //    .sort({ updatedAt: -1 })
      //    .skip(skip)
      //    .limit(pageSize)
      //    .lean();

      // const items = rawItems.map(mapPropertyListItem);

      const rawItems = await Property.find(filter)
         .sort({ updatedAt: -1 })
         .skip(skip)
         .limit(pageSize)
         .lean();

      const items = rawItems.map((item) => ({
         ...item,
         _id: item._id?.toString?.() || item._id,
      }));

      return new Response(JSON.stringify({ total, page, pageSize, items }), {
         status: 200,
      });
   } catch (error) {
      console.log(error);
      return new Response('Smth wrong', { status: 500 });
   }
};




// POST /api/crm/properties
export const POST = async (request) => {
   try {
      await connectDB();

      const sessionUser = await getSessionUser().catch(() => null);
      const userId = sessionUser?.userId || null;

      const formData = await request.formData();

      const imagesFiles = formData
         .getAll('images')
         .filter((f) => f && f.name)
         .slice(0, MAX_FILES);

      let imagesMeta = [];
      try {
         imagesMeta = JSON.parse(formData.get('imagesMeta') || '[]');
         if (!Array.isArray(imagesMeta)) imagesMeta = [];
      } catch {
         imagesMeta = [];
      }

      const advantages = formData
         .getAll('advantages')
         .map((x) => String(x).trim())
         .filter(Boolean);

      const disadvantages = formData
         .getAll('disadvantages')
         .map((x) => String(x).trim())
         .filter(Boolean);

      const toNumber = (value) => {
         if (value === undefined || value === null || value === '') return undefined;
         const n = Number(value);
         return Number.isNaN(n) ? undefined : n;
      };

      const toDate = (value) => {
         if (!value) return undefined;
         const d = new Date(value);
         return Number.isNaN(d.getTime()) ? undefined : d;
      };

      const normalizeStage = (value) => {
         if (value === 'processed') return 'processed';
         if (value === 'branded') return 'branded';
         return 'draft';
      };

      // const propertyData = {
      //    owner: userId || undefined,

      //    isPublic: formData.get('isPublic') === 'true',

      //    actualityGroup: formData.get('actualityGroup') || 'active',
      //    actualityStatus: formData.get('actualityStatus') || 'Актуальний. Продзвін',
      //    lastContactAt: toDate(formData.get('lastContactAt')),
      //    nextCheckAt: toDate(formData.get('nextCheckAt')),
      //    actualityNote: formData.get('actualityNote') || '',

      //    disadvantages,

      //    type_estate: formData.get('type_estate') || '',
      //    type_deal: formData.get('type_deal') || '',
      //    title: formData.get('title') || '',

      //    location_text: formData.get('location_text') || '',
      //    location: {
      //       city: formData.get('location.city') || '',
      //       street: formData.get('location.street') || '',
      //       number: formData.get('location.number') || '',
      //    },

      //    rooms: toNumber(formData.get('rooms')),
      //    square_tot: toNumber(formData.get('square_tot')),
      //    square_liv: toNumber(formData.get('square_liv')),
      //    square_kit: toNumber(formData.get('square_kit')),
      //    square_area: toNumber(formData.get('square_area')),
      //    square_use: toNumber(formData.get('square_use')),
      //    area_unit: formData.get('area_unit') || '',

      //    floor: toNumber(formData.get('floor')),
      //    floors: toNumber(formData.get('floors')),

      //    type_building: formData.get('type_building') || '',
      //    type_walls: formData.get('type_walls') || '',
      //    balconies: toNumber(formData.get('balconies')),

      //    height_wall: toNumber(formData.get('height_wall')),

      //    type_using: formData.get('type_using') || '',
      //    type_commerce: formData.get('type_commerce') || '',
      //    type_house: formData.get('type_house') || '',
      //    purpose_area: formData.get('purpose_area') || '',

      //    cost: toNumber(formData.get('cost')),
      //    currency: formData.get('currency') || 'USD',

      //    description: formData.get('description') || '',

      //    advantages,

      //    images: [],
      // };
      let owners = [];
      try {
         owners = JSON.parse(formData.get('owners') || '[]');
         if (!Array.isArray(owners)) owners = [];
      } catch {
         owners = [];
      }

      let rentOptions = {};
      try {
         rentOptions = JSON.parse(formData.get('rentOptions') || '{}');
         if (!rentOptions || typeof rentOptions !== 'object') rentOptions = {};
      } catch {
         rentOptions = {};
      }

      const statusRent = formData.get('statusRent') || 'rentNo';

      const propertyData = {
         owner: userId || undefined,

         isPublic: formData.get('isPublic') === 'true',

         actualityGroup: formData.get('actualityGroup') || 'active',
         actualityStatus: formData.get('actualityStatus') || 'Актуальний. Продзвін',
         lastContactAt: toDate(formData.get('lastContactAt')),
         nextCheckAt: toDate(formData.get('nextCheckAt')),
         actualityNote: formData.get('actualityNote') || '',

         disadvantages,

         type_estate: formData.get('type_estate') || '',
         type_deal: formData.get('type_deal') || '',
         title: formData.get('title') || '',

         location_text: formData.get('location_text') || '',
         location: {
            city: formData.get('location.city') || '',
            street: formData.get('location.street') || '',
            number: formData.get('location.number') || '',
         },

         rooms: toNumber(formData.get('rooms')),
         square_tot: toNumber(formData.get('square_tot')),
         square_liv: toNumber(formData.get('square_liv')),
         square_kit: toNumber(formData.get('square_kit')),
         square_area: toNumber(formData.get('square_area')),
         square_use: toNumber(formData.get('square_use')),
         area_unit: formData.get('area_unit') || '',

         floor: toNumber(formData.get('floor')),
         floors: toNumber(formData.get('floors')),

         type_building: formData.get('type_building') || '',
         type_walls: formData.get('type_walls') || '',
         balconies: toNumber(formData.get('balconies')),

         height_wall: toNumber(formData.get('height_wall')),

         type_using: formData.get('type_using') || '',
         type_commerce: formData.get('type_commerce') || '',
         type_house: formData.get('type_house') || '',
         purpose_area: formData.get('purpose_area') || '',

         cost: toNumber(formData.get('cost')),
         currency: formData.get('currency') || 'USD',

         description: formData.get('description') || '',

         advantages,

         statusRent,

         owners: owners
            .map((owner) => ({
               name: owner?.name || '',
               phones: Array.isArray(owner?.phones) ? owner.phones.filter(Boolean) : [],
               emails: Array.isArray(owner?.emails) ? owner.emails.filter(Boolean) : [],
               status: owner?.status || 'active',
               isPrimary: !!owner?.isPrimary,
               notes: owner?.notes || '',
            }))
            .filter((owner) => owner.name || owner.phones.length || owner.emails.length || owner.notes),

         rentOptions: {
            price: toNumber(rentOptions?.price),
            currency: rentOptions?.currency || 'USD',
            availableFrom: toDate(rentOptions?.availableFrom),
            adText: rentOptions?.adText || '',
            notes: rentOptions?.notes || '',
            conditions: Array.isArray(rentOptions?.conditions) ? rentOptions.conditions.filter(Boolean) : [],
            furniture: Array.isArray(rentOptions?.furniture) ? rentOptions.furniture.filter(Boolean) : [],
            appliances: Array.isArray(rentOptions?.appliances) ? rentOptions.appliances.filter(Boolean) : [],
            lastActualizedAt: toDate(rentOptions?.lastActualizedAt),
         },

         images: [],
      };

      if (!propertyData.title?.trim()) {
         return new Response(JSON.stringify({ error: 'title required' }), { status: 400 });
      }

      // 1. створюємо об'єкт без фото
      const created = await Property.create(propertyData);

      // 2. вантажимо фото послідовно у папки конкретного об'єкта
      const uploadedImages = [];

      for (let i = 0; i < imagesFiles.length; i++) {
         const file = imagesFiles[i];
         const meta = imagesMeta[i] || {};
         const stage = normalizeStage(meta?.stage);

         const folder = `karamax/properties/${created._id}/${stage}`;

         try {
            const result = await uploadToCloudinary(file, folder);
            const variants = buildImageVariants(result.public_id, stage);

            uploadedImages.push({
               url: result.secure_url,
               public_id: result.public_id,
               width: result.width,
               height: result.height,
               bytes: result.bytes,
               format: result.format,
               originalName: meta?.originalName || file?.name || 'image',

               isMain: !!meta?.isMain,
               sortOrder: typeof meta?.sortOrder === 'number' ? meta.sortOrder : i,

               stage,
               processedUrl: stage === 'processed' ? result.secure_url : '',
               brandedUrl: stage === 'branded' ? result.secure_url : '',

               isHidden: false,
               variants,
            });
         } catch (err) {
            console.error('Upload failed:', file?.name || 'file', err);
         }
      }

      uploadedImages.sort((a, b) => (a?.sortOrder ?? 0) - (b?.sortOrder ?? 0));

      if (uploadedImages.length > 0 && !uploadedImages.some((img) => img.isMain)) {
         uploadedImages[0].isMain = true;
      }

      created.images = uploadedImages;
      await created.save();

      return new Response(JSON.stringify({ item: created }), { status: 201 });
   } catch (error) {
      console.log(error);
      return new Response('Error to add property', { status: 500 });
   }
};