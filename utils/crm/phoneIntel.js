import LeadProperty from '@/models/LeadProperty';
import Property from '@/models/Property';

export function normalizePhone(value) {
   const digits = String(value || '').replace(/\D/g, '');
   if (!digits) return '';

   if (digits.length === 12 && digits.startsWith('380')) return `0${digits.slice(3)}`;
   if (digits.length === 11 && digits.startsWith('80')) return `0${digits.slice(2)}`;
   if (digits.length === 9) return `0${digits}`;

   return digits;
}

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

export async function buildPhoneIntelMap() {
   const [leadRows, propertyRows] = await Promise.all([
      LeadProperty.find({ phone: { $exists: true, $nin: ['', null] } })
         .select('_id title phone source sourceUrl stage reviewStatus leadname attrs importedAt')
         .lean(),
      Property.find({ 'owners.phones': { $exists: true, $ne: [] } })
         .select('_id title location_text actualityGroup crmStage owners')
         .lean(),
   ]);

   const map = {};

   for (const row of leadRows) {
      const phoneKey = normalizePhone(row.phone);
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
            const phoneKey = normalizePhone(phone);
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

export function attachPhoneIntel(items, phoneIntelMap) {
   return items.map((item) => {
      const phoneKey = normalizePhone(item?.phone);
      const phoneIntel = phoneKey ? phoneIntelMap[phoneKey] : null;
      const phoneCount = phoneIntel?.total || 0;

      return {
         ...item,
         phoneKey,
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
