import { getPhoneValidation } from '@/utils/crm/phone';

export function ownerPhoneKeys(owners) {
   return [...new Set((owners || []).flatMap(owner => (owner.phones || []).flatMap(value => {
      const phone = getPhoneValidation(value);
      return phone.isValid ? [phone.normalized] : [];
   })))];
}

export function installPhoneIndex(schema, property = false) {
   const relevant = property
      ? ['owners', 'title', 'location_text', 'actualityGroup', 'crmStage']
      : ['phone', 'attrs', 'reviewStatus', 'title', 'source', 'sourceUrl', 'stage', 'importedAt'];
   schema.add({ phoneIntelUpdatedAt: { type: Date, default: Date.now, index: true } });
   if (property) schema.add({ phoneKeys: [String], phoneIndexVersion: Number });

   schema.pre('validate', function () {
      if (this.isNew || relevant.some(path => this.isModified(path))) this.phoneIntelUpdatedAt = new Date();
      if (property) {
         if (this.isNew || this.isModified('owners') || this.phoneIndexVersion !== 1) {
            this.phoneKeys = ownerPhoneKeys(this.owners);
            this.phoneIndexVersion = 1;
         }
      } else if (this.isNew || this.isModified('phone') || this.isModified('attrs') || this.attrs?.phoneIndexVersion !== 1) {
         const phone = getPhoneValidation(this.phone);
         this.attrs = { ...(this.attrs || {}), phoneNormalized: phone.isValid ? phone.normalized : '', phoneIndexVersion: 1 };
         this.markModified('attrs');
      }
   });

   schema.pre(['findOneAndUpdate', 'updateOne', 'updateMany'], function () {
      const update = this.getUpdate();
      if (!update || Array.isArray(update)) return;
      const paths = Object.entries(update).flatMap(([key, value]) => key.startsWith('$') ? Object.keys(value || {}) : [key]);
      const removed = Object.keys(update.$unset || {});
      if (![...paths, ...removed].some(path => relevant.some(root => path === root || path.startsWith(`${root}.`)))) return;
      const set = Object.keys(update).some(key => key.startsWith('$')) ? (update.$set ||= {}) : update;
      set.phoneIntelUpdatedAt = new Date();
      if (property && Object.hasOwn(set, 'owners')) {
         set.phoneKeys = ownerPhoneKeys(set.owners);
         set.phoneIndexVersion = 1;
      } else if (property && [...paths, ...removed].some(path => path.startsWith('owners.') || path === 'owners')) {
         // Unusual positional edits are rebuilt by the next indexed read.
         set.phoneIndexVersion = 0;
      } else if (!property && Object.hasOwn(set, 'phone')) {
         const phone = getPhoneValidation(set.phone);
         if (set.attrs) {
            set.attrs = { ...set.attrs, phoneNormalized: phone.isValid ? phone.normalized : '', phoneIndexVersion: 1 };
         } else {
            set['attrs.phoneNormalized'] = phone.isValid ? phone.normalized : '';
            set['attrs.phoneIndexVersion'] = 1;
         }
      }
   });
}
