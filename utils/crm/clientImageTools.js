import imageCompression from 'browser-image-compression';

export const SAFE_IMAGE_FILE_BYTES = 900 * 1024;
export const SAFE_IMAGE_PAYLOAD_BYTES = 3.4 * 1024 * 1024;

export function formatImageBytes(bytes) {
   if (!bytes && bytes !== 0) return '';
   const mb = bytes / (1024 * 1024);
   if (mb >= 1) return `${mb.toFixed(mb >= 10 ? 0 : 2)} MB`;
   return `${(bytes / 1024).toFixed(0)} KB`;
}

export function isHeicFile(file) {
   const name = file?.name?.toLowerCase?.() || '';
   const type = file?.type?.toLowerCase?.() || '';

   return (
      type === 'image/heic' ||
      type === 'image/heif' ||
      name.endsWith('.heic') ||
      name.endsWith('.heif')
   );
}

export async function convertHeicToJpeg(file) {
   const { default: heic2any } = await import('heic2any');

   const result = await heic2any({
      blob: file,
      toType: 'image/jpeg',
      quality: 0.82,
   });

   const blob = Array.isArray(result) ? result[0] : result;
   const safeName = (file.name || 'image.heic').replace(/\.(heic|heif)$/i, '.jpg');

   return new File([blob], safeName, {
      type: 'image/jpeg',
      lastModified: Date.now(),
   });
}

export async function compressImageForUpload(file, options = {}) {
   const before = file?.size || 0;
   const originalName = file?.name || 'image';
   let sourceFile = file;

   if (isHeicFile(file)) {
      sourceFile = await convertHeicToJpeg(file);
   }

   if (!sourceFile?.type?.startsWith('image/')) {
      throw new Error('Файл не є зображенням');
   }

   const compressed = await imageCompression(sourceFile, {
      maxSizeMB: options.maxSizeMB || SAFE_IMAGE_FILE_BYTES / (1024 * 1024),
      maxWidthOrHeight: options.maxWidthOrHeight || 1920,
      useWebWorker: true,
      initialQuality: options.initialQuality || 0.72,
      alwaysKeepResolution: false,
   });

   const safeName = compressed.name || originalName.replace(/\.(heic|heif)$/i, '.jpg');
   const safeType = compressed.type || 'image/jpeg';

   return new File([compressed], safeName, {
      type: safeType,
      lastModified: Date.now(),
   });
}

export async function prepareImageUploadFiles(files, options = {}) {
   const sourceFiles = Array.from(files || []);
   const maxPayloadBytes = options.maxPayloadBytes || SAFE_IMAGE_PAYLOAD_BYTES;
   const accepted = [];
   const meta = [];
   const failed = [];
   const skipped = [];
   let totalBytes = options.initialPayloadBytes || 0;

   for (const file of sourceFiles) {
      const originalName = file?.name || 'image';
      const before = file?.size || 0;

      try {
         options.onProgress?.(accepted.length + failed.length + skipped.length, file);
         const compressed = await compressImageForUpload(file, options);
         const after = compressed.size || 0;

         if (totalBytes + after > maxPayloadBytes) {
            skipped.push(originalName);
            meta.push({
               name: compressed.name || originalName,
               before,
               after,
               ok: false,
               reason: `пакет фото > ${formatImageBytes(maxPayloadBytes)}`,
            });
            continue;
         }

         totalBytes += after;
         accepted.push(compressed);
         meta.push({
            name: compressed.name || originalName,
            before,
            after,
            ok: true,
            reason: '',
         });
      } catch (error) {
         failed.push(`${originalName} (${error?.message || 'не вдалося обробити'})`);
         meta.push({
            name: originalName,
            before,
            after: 0,
            ok: false,
            reason: error?.message || 'помилка обробки',
         });
      }
   }

   return { accepted, meta, failed, skipped, totalBytes };
}

export function buildImageUploadBatches(files, options = {}) {
   const sourceFiles = Array.from(files || []);
   const maxPayloadBytes = options.maxPayloadBytes || SAFE_IMAGE_PAYLOAD_BYTES;
   const batches = [];
   let currentBatch = [];
   let currentBytes = 0;

   sourceFiles.forEach((file) => {
      const size = file?.size || 0;

      if (currentBatch.length && currentBytes + size > maxPayloadBytes) {
         batches.push(currentBatch);
         currentBatch = [];
         currentBytes = 0;
      }

      currentBatch.push(file);
      currentBytes += size;
   });

   if (currentBatch.length) batches.push(currentBatch);
   return batches;
}
