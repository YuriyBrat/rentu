function imageStage(image) {
   if (['draft', 'processed', 'branded'].includes(image.stage)) return image.stage;
   // Older records may not have a folder/stage yet.
   if (image.processedUrl) return 'processed';
   if (image.brandedUrl || image.variants?.branded) return 'branded';
   return 'draft';
}

function imageUrl(image, stage) {
   const brandedUrls = [image.brandedUrl, image.variants?.branded].filter(Boolean);
   const plainUrls = [image.processedUrl, image.variants?.full, image.variants?.card, image.variants?.preview, image.url];
   const candidates = stage === 'branded'
      ? [...brandedUrls, ...plainUrls]
      : plainUrls.filter(url => !brandedUrls.includes(url));
   return candidates.find(url => typeof url === 'string' && url.trim())?.trim() || '';
}

export function selectShareImages(images, share = {}) {
   const priorities = share.type === 'partner'
      ? ['processed', 'draft']
      : ['processed', 'branded', 'draft'];
   const groups = { draft: [], processed: [], branded: [] };

   for (const image of Array.isArray(images) ? images : []) {
      if (!image || typeof image !== 'object' || image.isHidden) continue;
      const stage = imageStage(image);
      if (!priorities.includes(stage)) continue;
      const url = imageUrl(image, stage);
      if (!url) continue;
      groups[stage].push({ image, url });
   }

   const chosen = priorities.find(stage => groups[stage].length);
   if (!chosen) return [];

   return groups[chosen]
      .sort((a, b) => (Number(a.image.sortOrder) || 0) - (Number(b.image.sortOrder) || 0))
      .map(({ image, url }) => ({ url, width: image.width, height: image.height, isMain: image.isMain }));
}
