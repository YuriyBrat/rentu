import LeadProperty from '@/models/LeadProperty';
import Property from '@/models/Property';
import { getPhoneValidation } from '@/utils/crm/phone';
import { ownerPhoneKeys } from '@/utils/crm/phoneIndex';
import { cachedCRMQuery } from '@/utils/crm/queryCache';
export { normalizePhone } from '@/utils/crm/phone';

function getLeadContactKind(item) {
   const raw = String(
      item?.attrs?.contactType ||
      item?.attrs?.sellerType ||
      item?.reviewStatus ||
      ''
   ).toLowerCase();

   if (['realtor', 'agent', 'makler', 'маклер', 'агент'].includes(raw)) return 'realtor';
   if (['suspected_realtor', 'probable_realtor', 'ймовірний маклер', 'ймов. маклер'].includes(raw)) return 'suspected_realtor';
   if (['owner', 'власник', 'actual_owner'].includes(raw)) return 'owner';

   return 'unknown';
}

function addEmptyIntel(map, phoneKey) {
   if (!phoneKey) return null;

   if (!map[phoneKey]) {
      map[phoneKey] = {
         phoneKey,
         total: 0,
         parsingCount: 0,
         objectsCount: 0,
         explicitOwnerCount: 0,
         explicitRealtorCount: 0,
         suggestedKind: 'unknown',
         confidence: 'low',
         relatedParsing: [],
         relatedObjects: [],
      };
   }

   return map[phoneKey];
}

function finalizeIntel(intel) {
   if (!intel) return null;

   if (intel.explicitRealtorCount > 0) {
      intel.suggestedKind = 'realtor';
      intel.confidence = 'high';
      return intel;
   }

   if (intel.total >= 4 || intel.objectsCount >= 3 || intel.parsingCount >= 4) {
      intel.suggestedKind = 'suspected_realtor';
      intel.confidence = intel.total >= 5 ? 'high' : 'medium';
      return intel;
   }

   if (intel.explicitOwnerCount > 0 && intel.total <= 2) {
      intel.suggestedKind = 'owner';
      intel.confidence = intel.explicitOwnerCount > 1 ? 'high' : 'medium';
      return intel;
   }

   if (intel.total > 1) {
      intel.suggestedKind = 'unknown';
      intel.confidence = 'medium';
      return intel;
   }

   intel.suggestedKind = intel.explicitOwnerCount > 0 ? 'owner' : 'unknown';
   intel.confidence = intel.explicitOwnerCount > 0 ? 'medium' : 'low';
   return intel;
}

function assemblePhoneIntel(leadRows, propertyRows, requestedKeys = null) {
   const map = {};

   for (const row of leadRows) {
      const phone = getPhoneValidation(row.phone);
      // Invalid numbers retain their own contact classification without linking unrelated cards.
      const phoneKey = phone.isValid ? phone.normalized : `invalid:${row._id}`;
      if (requestedKeys && !requestedKeys.has(phoneKey)) continue;
      const intel = addEmptyIntel(map, phoneKey);
      if (!intel) continue;

      const kind = getLeadContactKind(row);

      intel.total += 1;
      intel.parsingCount += 1;
      if (kind === 'owner') intel.explicitOwnerCount += 1;
      if (kind === 'realtor') intel.explicitRealtorCount += 1;

      if (intel.relatedParsing.length < 8) {
         intel.relatedParsing.push({
            _id: row._id,
            title: row.title || '',
            source: row.source || '',
            sourceUrl: row.sourceUrl || '',
            stage: row.stage || '',
            reviewStatus: row.reviewStatus || '',
            contactKind: kind,
            importedAt: row.importedAt || null,
         });
      }
   }

   for (const property of propertyRows) {
      const owners = Array.isArray(property.owners) ? property.owners : [];

      for (const owner of owners) {
         const phones = Array.isArray(owner?.phones) ? owner.phones : [];

         for (const phone of phones) {
            const validation = getPhoneValidation(phone);
            const phoneKey = validation.isValid ? validation.normalized : '';
            if (requestedKeys && !requestedKeys.has(phoneKey)) continue;
            const intel = addEmptyIntel(map, phoneKey);
            if (!intel) continue;

            intel.total += 1;
            intel.objectsCount += 1;
            intel.explicitOwnerCount += 1;

            if (intel.relatedObjects.length < 8) {
               intel.relatedObjects.push({
                  _id: property._id,
                  title: property.title || '',
                  location_text: property.location_text || '',
                  actualityGroup: property.actualityGroup || '',
                  crmStage: property.crmStage || '',
                  ownerName: owner?.name || '',
                  ownerStatus: owner?.status || '',
               });
            }
         }
      }
   }

   Object.values(map).forEach(finalizeIntel);

   return map;
}

async function backfillPhoneKeys(model, property) {
   let cursor;
   const version = property ? 'phoneIndexVersion' : 'attrs.phoneIndexVersion';
   while (true) {
      const rows = await model.find({ [version]: { $ne: 1 }, ...(cursor ? { _id: { $gt: cursor } } : {}) })
         .select(property ? '_id owners updatedAt phoneIntelUpdatedAt' : '_id phone updatedAt phoneIntelUpdatedAt')
         .sort({ _id: 1 }).limit(500).lean();
      if (!rows.length) return;
      await model.collection.bulkWrite(rows.map(row => {
         const phone = getPhoneValidation(row.phone);
         return { updateOne: {
            // A concurrent edit wins; only derived fields are backfilled.
            filter: { _id: row._id, updatedAt: row.updatedAt || null, ...(!property ? { phone: row.phone ?? null } : {}) },
            update: [{ $set: {
               ...(property ? { phoneKeys: ownerPhoneKeys(row.owners), phoneIndexVersion: 1 }
                  : { attrs: { $mergeObjects: [
                     { $cond: [{ $eq: [{ $type: '$attrs' }, 'object'] }, '$attrs', {}] },
                     { phoneNormalized: phone.isValid ? phone.normalized : '', phoneIndexVersion: 1 },
                  ] } }),
               ...(!row.phoneIntelUpdatedAt ? { phoneIntelUpdatedAt: row.updatedAt || new Date(0) } : {}),
            } }],
         } };
      }), { ordered: false });
      cursor = rows[rows.length - 1]._id;
   }
}

async function ensurePhoneIndexes() {
   return cachedCRMQuery('phone-keys-backfill', 60000, () => Promise.all([
      backfillPhoneKeys(LeadProperty, false), backfillPhoneKeys(Property, true),
   ]));
}

async function getPhoneRevision() {
   return cachedCRMQuery('phone-revision', 1000, async () => {
      const [lead, property, leads, properties] = await Promise.all([
         LeadProperty.findOne().sort({ phoneIntelUpdatedAt: -1 }).select('_id phoneIntelUpdatedAt').lean(),
         Property.findOne().sort({ phoneIntelUpdatedAt: -1 }).select('_id phoneIntelUpdatedAt').lean(),
         LeadProperty.estimatedDocumentCount(), Property.estimatedDocumentCount(),
      ]);
      return JSON.stringify([lead?._id, lead?.phoneIntelUpdatedAt, leads, property?._id, property?.phoneIntelUpdatedAt, properties]);
   });
}

function legacyPhonePattern(key) {
   const tail = key.slice(1);
   const variants = [key, tail, `38${key}`, `38${tail}`, `8${key}`];
   return new RegExp(`^\\D*(?:${variants.map(value => value.split('').join('\\D*')).join('|')})\\D*$`);
}

export async function buildPhoneIntelMap(items = []) {
   const keys = [...new Set(items.flatMap(item => {
      const phone = getPhoneValidation(typeof item === 'string' ? item : item?.phone);
      return phone.isValid ? [phone.normalized] : [];
   }))];
   if (!keys.length) return {};
   await ensurePhoneIndexes();
   const revision = await getPhoneRevision();
   let batch;
   const readBatch = () => batch ||= (async () => {
      const legacy = keys.map(legacyPhonePattern);
      const [leads, properties] = await Promise.all([
         LeadProperty.find({ $or: [
            { 'attrs.phoneNormalized': { $in: keys } },
            { 'attrs.phoneIndexVersion': { $ne: 1 }, phone: { $in: legacy } },
         ] }).select('_id title phone source sourceUrl stage reviewStatus attrs.contactType attrs.sellerType importedAt').lean(),
         Property.find({ $or: [
            { phoneKeys: { $in: keys } },
            { phoneIndexVersion: { $ne: 1 }, 'owners.phones': { $in: legacy } },
         ] }).select('_id title location_text actualityGroup crmStage owners').lean(),
      ]);
      return assemblePhoneIntel(leads, properties, new Set(keys));
   })();
   const values = await Promise.all(keys.map(key => cachedCRMQuery(`phone:${revision}:${key}`, 20000,
      async () => (await readBatch())[key] || null)));
   return Object.fromEntries(keys.map((key, index) => [key, values[index]]));
}

export async function getPhoneContactIds(kind) {
   await ensurePhoneIndexes();
   const revision = await getPhoneRevision();
   const directory = await cachedCRMQuery(`phone-directory:${revision}`, 20000, async () => {
      const [leads, properties] = await Promise.all([
         LeadProperty.find({}).select('_id phone reviewStatus attrs.contactType attrs.sellerType').lean(),
         Property.find({ 'owners.phones': { $exists: true, $ne: [] } }).select('_id owners.phones').lean(),
      ]);
      const map = assemblePhoneIntel(leads, properties);
      const ids = { owner: [], realtor: [], suspected_realtor: [], unknown: [] };
      for (const lead of leads) {
         const explicit = getLeadContactKind(lead);
         if (explicit === 'owner' || explicit === 'realtor') ids[explicit].push(lead._id);
         const phone = getPhoneValidation(lead.phone);
         const suggested = map[phone.isValid ? phone.normalized : `invalid:${lead._id}`]?.suggestedKind || 'unknown';
         if (suggested === 'suspected_realtor' || suggested === 'unknown') ids[suggested].push(lead._id);
      }
      return ids;
   });
   return directory[kind] || [];
}

export function attachPhoneIntel(items, phoneIntelMap) {
   return items.map((item) => {
      const phoneValidation = getPhoneValidation(item?.phone);
      const phoneKey = phoneValidation.isValid ? phoneValidation.normalized : '';
      const phoneIntel = phoneKey ? phoneIntelMap[phoneKey] : null;
      const phoneCount = phoneIntel?.total || 0;

      return {
         ...item,
         phoneKey,
         phoneValidation,
         phoneCount,
         phoneIntel,
         attrs: {
            ...(item.attrs || {}),
            phoneCount,
            phoneIntel,
         },
      };
   });
}
