import connectDB from '@/config/database';
import LeadProperty from '@/models/LeadProperty';
import Property from '@/models/Property';
import OperationEvent from '@/models/OperationEvent';
import {
   PROPERTY_FIELDS,
   OPERATION_EVENT_FIELDS,
   buildActivityDiff,
   logActivity,
   pickActivitySnapshot,
} from '@/utils/crm/activityLog';
import { canManageProperty } from '@/utils/crm/accessControl';
import { getSessionUser } from '@/utils/getSessionUser';
import cloudinary from '@/config/cloudinary';
import { Types } from 'mongoose';

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

function getLossReasonFromStatus(status = '') {
   const value = String(status || '').toLowerCase();
   if (value.includes('реалізований не мною')) return 'sold_by_other';
   if (value.includes('знятий з реалізації')) return 'owner_removed';
   return 'other';
}

// GET /api/crm/properties/:id
export const GET = async (_request, { params }) => {
   try {
      await connectDB();

      // const item = await Property.findById(params.id).lean();
      const item = await Property.findById(params.id)
         .populate('assignee', 'name fullName surname phone email avatar')
         .populate('createdByEmployee', 'name fullName surname phone email avatar')
         .populate('rentOptions.rentStory.rentedByEmployee', 'name fullName surname phone email avatar')
         .populate('rentOptions.rentHistory.rentedByEmployee', 'name fullName surname phone email avatar')
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
      const existing = await Property.findById(params.id);
      if (!existing) return new Response('Property Not Found', { status: 404 });

      if (!(await canManageProperty(sessionUser, existing))) {
         await logActivity({
            entityType: 'property',
            entityId: existing._id,
            action: 'access_denied',
            sessionUser,
            source: 'properties',
            title: existing.title || existing.location_text || 'Об’єкт',
            message: 'Спроба редагування об’єкта без доступу',
            before: pickActivitySnapshot(existing, PROPERTY_FIELDS),
            meta: {
               pageName: 'Об’єкти',
               pagePath: '/crm/objects3',
               propertyId: existing._id,
               attemptedAction: 'update_property',
            },
         });
         return new Response('Недостатньо прав для зміни цього об’єкта', { status: 403 });
      }

      const formData = await request.formData();
      const wasInactive = existing.actualityGroup === 'inactive';
      const beforePropertySnapshot = pickActivitySnapshot(existing, PROPERTY_FIELDS);

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

      const parseObjectId = (value) => {
         if (!value) return null;
         return Types.ObjectId.isValid(value) ? value : null;
      };

      const normalizeRentHistory = (items = []) =>
         (Array.isArray(items) ? items : [])
            .map((row) => ({
               rentedAt: parseDate(row?.rentedAt),
               movedOutAt: parseDate(row?.movedOutAt),
               rentedByType: row?.rentedByType || '',
               rentedByEmployee: parseObjectId(row?.rentedByEmployee?._id || row?.rentedByEmployee),
               note: row?.note || '',
               createdAt: parseDate(row?.createdAt) || new Date(),
            }))
            .filter((row) => row.rentedAt || row.movedOutAt || row.rentedByType || row.rentedByEmployee || row.note);

      const parseOriginAction = () => {
         let raw = {};
         try {
            raw = JSON.parse(formData.get('originAction') || '{}');
            if (!raw || typeof raw !== 'object') raw = {};
         } catch {
            raw = {};
         }
         const kind = ['review', 'showing', 'manual'].includes(raw.kind) ? raw.kind : '';
         return {
            kind,
            occurredAt: parseDate(raw.occurredAt),
            sourceOperationEvent: kind === 'showing' ? parseObjectId(raw.sourceOperationEvent) : null,
            note: String(raw.note || '').trim(),
         };
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

      const changesLockedStatus = [
         'actualityGroup',
         'actualityStatus',
         'crmStage',
         'crmStageReason',
         'inspectedAt',
      ].some(hasKey);

      if (changesLockedStatus && existing.sourceLeadId) {
         const sourceLead = await LeadProperty.findById(existing.sourceLeadId)
            .select('inspectionReservation')
            .lean();
         const expiresAt = sourceLead?.inspectionReservation?.expiresAt
            ? new Date(sourceLead.inspectionReservation.expiresAt)
            : null;

         if (expiresAt && !Number.isNaN(expiresAt.getTime()) && expiresAt > new Date()) {
            return Response.json({
               error: 'inspection reservation active',
               expiresAt,
               reservedByName: sourceLead?.inspectionReservation?.reservedByName || '',
            }, { status: 423 });
         }
      }

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
      if (hasKey('inactiveAt')) existing.inactiveAt = parseDate(formData.get('inactiveAt'));
      if (hasKey('inactiveNote')) existing.inactiveNote = formData.get('inactiveNote') || '';
      if (hasKey('crmStage')) existing.crmStage = formData.get('crmStage') || 'rs';
      if (hasKey('crmStageReason')) existing.crmStageReason = formData.get('crmStageReason') || '';
      if (hasKey('inspectedAt')) existing.inspectedAt = parseDate(formData.get('inspectedAt'));
      if (hasKey('originAction')) existing.originAction = parseOriginAction();
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
                  rentedByType: rentOptions?.rentStory?.rentedByType || '',
                  rentedByEmployee: parseObjectId(rentOptions?.rentStory?.rentedByEmployee?._id || rentOptions?.rentStory?.rentedByEmployee),
                  rentedBy: rentOptions?.rentStory?.rentedBy || '',
                  note: rentOptions?.rentStory?.note || '',
               },
               rentHistory: normalizeRentHistory(rentOptions?.rentHistory),
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

      const shouldCreateLossEvent =
         !wasInactive &&
         existing.actualityGroup === 'inactive' &&
         String(existing.actualityStatus || '').trim() !== 'Неактуальний. Реалізований мною';
      const touchesInactiveStatus =
         ['actualityGroup', 'actualityStatus', 'inactiveAt', 'inactiveNote'].some((field) => hasKey(field));
      const submitsInactiveStatus = touchesInactiveStatus && existing.actualityGroup === 'inactive';
      const shouldDeleteLossEvents = wasInactive && existing.actualityGroup !== 'inactive';

      if (submitsInactiveStatus && !existing.inactiveAt) {
         return Response.json({ error: 'inactive date required' }, { status: 400 });
      }

      if (submitsInactiveStatus && !String(existing.inactiveNote || '').trim()) {
         return Response.json({ error: 'inactive note required' }, { status: 400 });
      }

      await existing.save();

      const afterPropertySnapshot = pickActivitySnapshot(existing, PROPERTY_FIELDS);
      const propertyDiff = buildActivityDiff(beforePropertySnapshot, afterPropertySnapshot, PROPERTY_FIELDS);

      if (propertyDiff.length) {
         const statusFields = ['actualityGroup', 'actualityStatus', 'actualityNote', 'inactiveAt', 'inactiveNote', 'crmStage', 'crmStageReason'];
         const isStatusChange = propertyDiff.some((change) => statusFields.includes(change.field));

         await logActivity({
            entityType: 'property',
            entityId: existing._id,
            action: isStatusChange ? 'status_changed' : 'updated',
            sessionUser,
            source: 'properties',
            title: existing.title || existing.location_text || 'Об’єкт',
            message: isStatusChange ? 'Змінено статус об’єкта' : 'Оновлено об’єкт',
            before: beforePropertySnapshot,
            after: afterPropertySnapshot,
            diff: propertyDiff,
            meta: {
               pageName: 'Об’єкти',
               pagePath: '/crm/objects3',
               propertyId: existing._id,
            },
         });
      }

      if (shouldCreateLossEvent) {
         const lossNote =
            String(existing.inactiveNote || '').trim() ||
            String(existing.actualityNote || '').trim() ||
            String(existing.actualityStatus || '').trim();

         const lossEvent = await OperationEvent.create({
            type: 'loss',
            occurredAt: existing.inactiveAt || new Date(),
            responsibleEmployee: existing.assignee || sessionUser?.employeeId || null,
            property: existing._id,
            propertyStage: existing.actualityGroup || '',
            resultDescription: lossNote,
            loss: {
               target: 'object',
               reason: getLossReasonFromStatus(existing.actualityStatus),
               note: lossNote,
               linkedPropertyStatus: existing.actualityStatus || '',
            },
            createdByEmployee: sessionUser?.employeeId || null,
         });

         await logActivity({
            entityType: 'operation',
            entityId: lossEvent._id,
            action: 'created',
            sessionUser,
            source: 'properties',
            title: existing.title || existing.location_text || 'Втрата об’єкта',
            message: 'Створено подію втрати об’єкта',
            after: pickActivitySnapshot(lossEvent, OPERATION_EVENT_FIELDS),
            meta: {
               pageName: 'Об’єкти',
               pagePath: '/crm/objects3',
               operationType: 'loss',
               propertyId: existing._id,
            },
         });
      }

      const shouldSyncLossEvent =
         !shouldCreateLossEvent &&
         !shouldDeleteLossEvents &&
         wasInactive &&
         existing.actualityGroup === 'inactive' &&
         String(existing.actualityStatus || '').trim() !== 'Неактуальний. Реалізований мною' &&
         propertyDiff.some((change) => ['actualityStatus', 'actualityNote', 'inactiveAt', 'inactiveNote', 'assignee'].includes(change.field));

      if (shouldSyncLossEvent) {
         const lossNote =
            String(existing.inactiveNote || '').trim() ||
            String(existing.actualityNote || '').trim() ||
            String(existing.actualityStatus || '').trim();

         const lossEvent = await OperationEvent.findOne({
            property: existing._id,
            type: 'loss',
            'loss.target': 'object',
         }).sort({ occurredAt: -1, createdAt: -1 });

         if (lossEvent) {
            const beforeLossSnapshot = pickActivitySnapshot(lossEvent, OPERATION_EVENT_FIELDS);

            lossEvent.occurredAt = existing.inactiveAt || lossEvent.occurredAt || new Date();
            lossEvent.responsibleEmployee = existing.assignee || sessionUser?.employeeId || null;
            lossEvent.propertyStage = existing.actualityGroup || '';
            lossEvent.resultDescription = lossNote;
            lossEvent.loss = {
               ...(lossEvent.loss?.toObject?.() || lossEvent.loss || {}),
               target: 'object',
               reason: getLossReasonFromStatus(existing.actualityStatus),
               note: lossNote,
               linkedPropertyStatus: existing.actualityStatus || '',
            };

            await lossEvent.save();

            const afterLossSnapshot = pickActivitySnapshot(lossEvent, OPERATION_EVENT_FIELDS);
            await logActivity({
               entityType: 'operation',
               entityId: lossEvent._id,
               action: 'updated',
               sessionUser,
               source: 'properties',
               title: existing.title || existing.location_text || 'Втрата об’єкта',
               message: 'Оновлено подію втрати об’єкта',
               before: beforeLossSnapshot,
               after: afterLossSnapshot,
               diff: buildActivityDiff(beforeLossSnapshot, afterLossSnapshot, OPERATION_EVENT_FIELDS),
               meta: {
                  pageName: 'Об’єкти',
                  pagePath: '/crm/objects3',
                  operationType: 'loss',
                  propertyId: existing._id,
               },
            });
         } else {
            const createdLossEvent = await OperationEvent.create({
               type: 'loss',
               occurredAt: existing.inactiveAt || new Date(),
               responsibleEmployee: existing.assignee || sessionUser?.employeeId || null,
               property: existing._id,
               propertyStage: existing.actualityGroup || '',
               resultDescription: lossNote,
               loss: {
                  target: 'object',
                  reason: getLossReasonFromStatus(existing.actualityStatus),
                  note: lossNote,
                  linkedPropertyStatus: existing.actualityStatus || '',
               },
               createdByEmployee: sessionUser?.employeeId || null,
            });

            await logActivity({
               entityType: 'operation',
               entityId: createdLossEvent._id,
               action: 'created',
               sessionUser,
               source: 'properties',
               title: existing.title || existing.location_text || 'Втрата об’єкта',
               message: 'Створено подію втрати об’єкта',
               after: pickActivitySnapshot(createdLossEvent, OPERATION_EVENT_FIELDS),
               meta: {
                  pageName: 'Об’єкти',
                  pagePath: '/crm/objects3',
                  operationType: 'loss',
                  propertyId: existing._id,
                  reason: 'loss_event_missing',
               },
            });
         }
      }

      if (shouldDeleteLossEvents) {
         const lossEvents = await OperationEvent.find({
            property: existing._id,
            type: 'loss',
            'loss.target': 'object',
         });

         for (const lossEvent of lossEvents) {
            const lossSnapshot = pickActivitySnapshot(lossEvent, OPERATION_EVENT_FIELDS);
            await lossEvent.deleteOne();

            await logActivity({
               entityType: 'operation',
               entityId: lossEvent._id,
               action: 'deleted',
               sessionUser,
               source: 'properties',
               title: existing.title || existing.location_text || 'Втрата об’єкта',
               message: 'Видалено подію втрати об’єкта',
               before: lossSnapshot,
               meta: {
                  pageName: 'Об’єкти',
                  pagePath: '/crm/objects3',
                  operationType: 'loss',
                  propertyId: existing._id,
                  reason: 'property_reactivated',
               },
            });
         }
      }

      const saved = await Property.findById(existing._id)
         .populate('assignee', 'name fullName surname phone email avatar')
         .populate('createdByEmployee', 'name fullName surname phone email avatar')
         .populate('rentOptions.rentStory.rentedByEmployee', 'name fullName surname phone email avatar')
         .populate('rentOptions.rentHistory.rentedByEmployee', 'name fullName surname phone email avatar')
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
      const property = await Property.findById(params.id);
      if (!property) return new Response('Property Not Found', { status: 404 });

      if (!(await canManageProperty(sessionUser, property))) {
         await logActivity({
            entityType: 'property',
            entityId: property._id,
            action: 'access_denied',
            sessionUser,
            source: 'properties',
            title: property.title || property.location_text || 'Об’єкт',
            message: 'Спроба видалення об’єкта без доступу',
            before: pickActivitySnapshot(property, PROPERTY_FIELDS),
            meta: {
               pageName: 'Об’єкти',
               pagePath: '/crm/objects3',
               propertyId: property._id,
               attemptedAction: 'delete_property',
            },
         });
         return new Response('Недостатньо прав для видалення цього об’єкта', { status: 403 });
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
