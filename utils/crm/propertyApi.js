import { buildPropertyFormData } from './propertyFormData';
import {
   buildImageUploadBatches,
   SAFE_IMAGE_PAYLOAD_BYTES,
} from './clientImageTools';

function splitPropertyImages(payload) {
   const fileImages = [];
   const existingImages = [];

   (payload.images || []).forEach((image, index) => {
      if (image?.file) {
         fileImages.push({
            ...image,
            sortOrder: index,
            stage: image.stage || payload.photoStage || 'draft',
         });
      } else {
         existingImages.push({
            ...image,
            sortOrder: index,
            stage: image.stage || 'draft',
         });
      }
   });

   fileImages.sort((a, b) => {
      if (!!a.isMain !== !!b.isMain) return a.isMain ? -1 : 1;
      return Number(a.sortOrder || 0) - Number(b.sortOrder || 0);
   });

   return {
      payloadWithoutNewImages: {
         ...payload,
         images: existingImages,
      },
      fileImages,
   };
}

async function uploadPropertyImageBatches(propertyId, fileImages) {
   if (!propertyId || !fileImages.length) return;

   const byStage = new Map();
   fileImages.forEach((image) => {
      const stage = image.stage || 'draft';
      if (!byStage.has(stage)) byStage.set(stage, []);
      byStage.get(stage).push(image.file);
   });

   for (const [stage, files] of byStage.entries()) {
      const batches = buildImageUploadBatches(files, {
         maxPayloadBytes: SAFE_IMAGE_PAYLOAD_BYTES,
      });

      for (const batch of batches) {
         const fd = new FormData();
         batch.forEach((file) => fd.append('images', file));
         fd.append('stage', stage);

         const res = await fetch(`/api/crm/properties/${propertyId}/images`, {
            method: 'POST',
            body: fd,
         });

         if (!res.ok) {
            const text = await res.text();
            const error = new Error(text || 'Помилка завантаження фото');
            error.status = res.status;
            throw error;
         }
      }
   }
}

export async function createProperty(payload) {
   const { payloadWithoutNewImages, fileImages } = splitPropertyImages(payload);
   const fd = buildPropertyFormData(payloadWithoutNewImages);

   const res = await fetch('/api/crm/properties', {
      method: 'POST',
      body: fd,
   });

   if (!res.ok) {
      const text = await res.text();
      const error = new Error(text || 'Помилка створення обʼєкта');
      error.status = res.status;
      throw error;
   }

   const created = await res.json();
   await uploadPropertyImageBatches(created?.item?._id, fileImages);
   return created;
}

export async function updateProperty(id, payload) {
   const { payloadWithoutNewImages, fileImages } = splitPropertyImages(payload);
   const fd = buildPropertyFormData(payloadWithoutNewImages);

   const res = await fetch(`/api/crm/properties/${id}`, {
      method: 'PATCH',
      body: fd,
   });

   if (!res.ok) {
      const text = await res.text();
      const error = new Error(text || 'Помилка оновлення обʼєкта');
      error.status = res.status;
      throw error;
   }

   const updated = await res.json();
   await uploadPropertyImageBatches(id, fileImages);
   return updated;
}
