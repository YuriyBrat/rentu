import connectDB from '@/config/database';
import cloudinary from '@/config/cloudinary';
import Property from '@/models/Property';
import { getSessionUser } from '@/utils/getSessionUser';
import { canManageProperty } from '@/utils/crm/accessControl';
import { logActivity, pickActivitySnapshot, PROPERTY_FIELDS } from '@/utils/crm/activityLog';

const ALLOWED_STAGES = ['draft', 'processed', 'branded'];

async function uploadToCloudinary(file, folder) {
   const arrayBuffer = await file.arrayBuffer();
   const buffer = Buffer.from(new Uint8Array(arrayBuffer));
   const base64 = buffer.toString('base64');
   const mime = file.type || 'image/jpeg';

   return cloudinary.uploader.upload(`data:${mime};base64,${base64}`, {
      folder,
      resource_type: 'image',
   });
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

function normalizeStage(stage) {
   return ALLOWED_STAGES.includes(stage) ? stage : 'draft';
}

function findImageIndex(property, imageId) {
   const id = String(imageId || '');
   if (!id) return -1;
   return (property.images || []).findIndex((image) => (
      String(image || '') === id ||
      String(image._id || '') === id ||
      String(image.public_id || '') === id ||
      String(image.url || '') === id ||
      String(image.secure_url || '') === id ||
      String(image.src || '') === id ||
      String(image.preview || '') === id ||
      String(image.card || '') === id ||
      String(image.full || '') === id ||
      String(image.processedUrl || '') === id ||
      String(image.brandedUrl || '') === id ||
      String(image.variants?.full || '') === id ||
      String(image.variants?.card || '') === id ||
      String(image.variants?.preview || '') === id ||
      String(image.variants?.branded || '') === id
   ));
}

function findImage(property, imageId) {
   const index = findImageIndex(property, imageId);
   return index >= 0 ? property.images[index] : null;
}

function ensureMainImage(property) {
   const visibleImages = (property.images || []).filter((image) => !image.isHidden);
   if (!visibleImages.length) return;
   if (!visibleImages.some((image) => image.isMain)) {
      visibleImages[0].isMain = true;
   }
}

async function getManagedProperty(params) {
   const sessionUser = await getSessionUser().catch(() => null);
   const property = await Property.findById(params.id);
   if (!property) return { error: Response.json({ error: 'Об’єкт не знайдено' }, { status: 404 }) };

   if (!(await canManageProperty(sessionUser, property))) {
      await logActivity({
         entityType: 'property',
         entityId: property._id,
         action: 'access_denied',
         sessionUser,
         source: 'properties',
         title: property.title || property.location_text || 'Об’єкт',
         message: 'Спроба змінити фото об’єкта без доступу',
         before: pickActivitySnapshot(property, PROPERTY_FIELDS),
         meta: {
            pageName: 'Об’єкти',
            pagePath: '/crm/objects3',
            propertyId: property._id,
            attemptedAction: 'update_property_image',
         },
      });
      return { error: Response.json({ error: 'Недостатньо прав для зміни фото цього об’єкта' }, { status: 403 }) };
   }

   return { sessionUser, property };
}

export const PATCH = async (req, { params }) => {
   try {
      await connectDB();

      const managed = await getManagedProperty(params);
      if (managed.error) return managed.error;
      const { sessionUser, property } = managed;

      const body = await req.json();
      const imageIndex = findImageIndex(property, body.imageId);
      const image = imageIndex >= 0 ? property.images[imageIndex] : null;
      if (!image) return Response.json({ error: 'Фото не знайдено' }, { status: 404 });

      const beforeSnapshot = pickActivitySnapshot(property, PROPERTY_FIELDS);
      let message = 'Оновлено фото об’єкта';

      if (body.action === 'setMain') {
         (property.images || []).forEach((item, index) => {
            item.isMain = index === imageIndex;
         });
         image.isHidden = false;
         message = 'Змінено головне фото об’єкта';
      } else if (body.action === 'setHidden') {
         image.isHidden = !!body.hidden;
         if (image.isHidden) image.isMain = false;
         ensureMainImage(property);
         message = image.isHidden ? 'Фото об’єкта приховано' : 'Фото об’єкта показано';
      } else if (body.action === 'updateStage') {
         const stage = normalizeStage(body.stage);
         image.stage = stage;
         const imageUrl = image.url || image.processedUrl || image.brandedUrl || image.variants?.full || image.variants?.card || image.variants?.preview || '';
         image.processedUrl = stage === 'processed' ? (image.processedUrl || imageUrl) : image.processedUrl || '';
         image.brandedUrl = stage === 'branded' ? (image.brandedUrl || imageUrl) : image.brandedUrl || '';
         message = 'Змінено групу фото об’єкта';
      } else {
         return Response.json({ error: 'Невідома дія з фото' }, { status: 400 });
      }

      await property.save();

      await logActivity({
         entityType: 'property',
         entityId: property._id,
         action: 'update',
         sessionUser,
         source: 'properties',
         title: property.title || property.location_text || 'Об’єкт',
         message,
         before: beforeSnapshot,
         after: pickActivitySnapshot(property, PROPERTY_FIELDS),
         meta: {
            pageName: 'Об’єкти',
            pagePath: '/crm/objects3',
            propertyId: property._id,
            imageId: image._id,
            imageAction: body.action,
         },
      });

      return Response.json({
         ok: true,
         images: property.images,
      });
   } catch (error) {
      console.error(error);
      return Response.json({ error: error.message || 'Не вдалося оновити фото' }, { status: 500 });
   }
};

export const POST = async (req, { params }) => {
   try {
      await connectDB();

      const managed = await getManagedProperty(params);
      if (managed.error) return managed.error;
      const { sessionUser, property } = managed;

      const formData = await req.formData();
      const files = formData.getAll('images').filter((file) => file && file.name);
      if (!files.length) return Response.json({ error: 'Оберіть фото' }, { status: 400 });

      const stage = normalizeStage(formData.get('stage'));
      const beforeSnapshot = pickActivitySnapshot(property, PROPERTY_FIELDS);
      const baseSort = Math.max(-1, ...(property.images || []).map((image) => Number(image.sortOrder ?? 0)));
      const uploadedImages = [];

      for (let i = 0; i < files.length; i += 1) {
         const file = files[i];
         const result = await uploadToCloudinary(file, `karamax/properties/${property._id}/${stage}`);
         uploadedImages.push({
            url: result.secure_url,
            public_id: result.public_id,
            width: result.width,
            height: result.height,
            bytes: result.bytes,
            format: result.format,
            originalName: file.name,
            isMain: false,
            sortOrder: baseSort + i + 1,
            stage,
            processedUrl: stage === 'processed' ? result.secure_url : '',
            brandedUrl: stage === 'branded' ? result.secure_url : '',
            isHidden: false,
            variants: buildImageVariants(result.public_id),
         });
      }

      property.images = [...(property.images || []), ...uploadedImages];
      ensureMainImage(property);
      await property.save();

      await logActivity({
         entityType: 'property',
         entityId: property._id,
         action: 'update',
         sessionUser,
         source: 'properties',
         title: property.title || property.location_text || 'Об’єкт',
         message: `Додано фото об’єкта: ${uploadedImages.length}`,
         before: beforeSnapshot,
         after: pickActivitySnapshot(property, PROPERTY_FIELDS),
         meta: {
            pageName: 'Об’єкти',
            pagePath: '/crm/objects3',
            propertyId: property._id,
            imageAction: 'add',
            stage,
            count: uploadedImages.length,
         },
      });

      return Response.json({ ok: true, images: property.images });
   } catch (error) {
      console.error(error);
      return Response.json({ error: error.message || 'Не вдалося додати фото' }, { status: 500 });
   }
};

export const DELETE = async (req, { params }) => {
   try {
      await connectDB();

      const managed = await getManagedProperty(params);
      if (managed.error) return managed.error;
      const { sessionUser, property } = managed;

      const body = await req.json();
      const imageIndex = findImageIndex(property, body.imageId);
      const image = imageIndex >= 0 ? property.images[imageIndex] : null;
      if (!image) return Response.json({ error: 'Фото не знайдено' }, { status: 404 });

      const beforeSnapshot = pickActivitySnapshot(property, PROPERTY_FIELDS);
      const publicId = image.public_id;
      property.images.splice(imageIndex, 1);
      ensureMainImage(property);
      await property.save();

      if (publicId) {
         cloudinary.uploader.destroy(publicId).catch((error) => console.error('Cloudinary image delete failed', error));
      }

      await logActivity({
         entityType: 'property',
         entityId: property._id,
         action: 'update',
         sessionUser,
         source: 'properties',
         title: property.title || property.location_text || 'Об’єкт',
         message: 'Видалено фото об’єкта',
         before: beforeSnapshot,
         after: pickActivitySnapshot(property, PROPERTY_FIELDS),
         meta: {
            pageName: 'Об’єкти',
            pagePath: '/crm/objects3',
            propertyId: property._id,
            imageId: image._id,
            imageAction: 'delete',
         },
      });

      return Response.json({ ok: true, images: property.images });
   } catch (error) {
      console.error(error);
      return Response.json({ error: error.message || 'Не вдалося видалити фото' }, { status: 500 });
   }
};
