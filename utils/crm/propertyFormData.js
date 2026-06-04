export function buildPropertyFormData(payload) {
   const fd = new FormData();

   const appendIfDefined = (key, value) => {
      if (value === undefined || value === null) return;
      fd.append(key, value);
   };

   appendIfDefined('isPublic', String(!!payload.isPublic));
   appendIfDefined('actualityGroup', payload.actualityGroup || '');
   appendIfDefined('actualityStatus', payload.actualityStatus || '');
   appendIfDefined('actualityNote', payload.actualityNote || '');
   appendIfDefined('crmStage', payload.crmStage || '');
   appendIfDefined('crmStageReason', payload.crmStageReason || '');
   appendIfDefined('inspectedAt', payload.inspectedAt || '');

   appendIfDefined('type_estate', payload.type_estate || '');
   appendIfDefined('type_deal', payload.type_deal || '');
   appendIfDefined('title', payload.title || '');

   appendIfDefined('location_text', payload.location_text || '');
   appendIfDefined('location.city', payload.location?.city || '');
   appendIfDefined('location.street', payload.location?.street || '');
   appendIfDefined('location.number', payload.location?.number || '');
   appendIfDefined('location.flat', payload.location?.flat || '');

   appendIfDefined('rooms', payload.rooms ?? '');
   appendIfDefined('square_tot', payload.square_tot ?? '');
   appendIfDefined('square_liv', payload.square_liv ?? '');
   appendIfDefined('square_kit', payload.square_kit ?? '');
   appendIfDefined('square_area', payload.square_area ?? '');
   appendIfDefined('square_use', payload.square_use ?? '');
   appendIfDefined('area_unit', payload.area_unit || '');

   appendIfDefined('floor', payload.floor ?? '');
   appendIfDefined('floors', payload.floors ?? '');

   appendIfDefined('type_building', payload.type_building || '');
   appendIfDefined('type_walls', payload.type_walls || '');
   appendIfDefined('balconies', payload.balconies ?? '');
   appendIfDefined('height_wall', payload.height_wall ?? '');

   appendIfDefined('type_using', payload.type_using || '');
   appendIfDefined('type_commerce', payload.type_commerce || '');
   appendIfDefined('type_house', payload.type_house || '');
   appendIfDefined('purpose_area', payload.purpose_area || '');

   appendIfDefined('cost', payload.cost ?? '');
   appendIfDefined('currency', payload.currency || '');
   appendIfDefined('description', payload.description || '');

   appendIfDefined('statusRent', payload.statusRent || 'rentNo');
   appendIfDefined('assignee', payload.assignee || '');
   appendIfDefined('createdByEmployee', payload.createdByEmployee || '');

   appendIfDefined('source', payload.source || '');
   appendIfDefined('strategyApprovedBy', payload.strategyApprovedBy || '');
   appendIfDefined('strategyApprovedAt', payload.strategyApprovedAt || '');

   fd.append('businessScore', JSON.stringify(payload.businessScore || {}));

   fd.append('owners', JSON.stringify(payload.owners || []));
   fd.append('rentOptions', JSON.stringify(payload.rentOptions || {}));

   (payload.advantages || []).forEach((x) => fd.append('advantages', x));
   (payload.disadvantages || []).forEach((x) => fd.append('disadvantages', x));

   const existingImages = [];
   const newImagesMeta = [];

   (payload.images || []).forEach((img, idx) => {
      if (img.file) {
         fd.append('images', img.file);
         newImagesMeta.push({
            originalName: img.file.name,
            isMain: !!img.isMain,
            sortOrder: idx,
            stage: img.stage || 'draft',
         });
      } else {
         existingImages.push({
            ...img,
            isMain: !!img.isMain,
            sortOrder: idx,
            stage: img.stage || 'draft',
         });
      }
   });

   fd.append('imagesMeta', JSON.stringify(newImagesMeta));
   fd.append('existingImages', JSON.stringify(existingImages));

   return fd;
}
