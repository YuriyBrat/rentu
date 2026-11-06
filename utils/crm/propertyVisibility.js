import { Types } from 'mongoose';
import { getEmployeeScopeIds } from '@/utils/crm/accessControl';

const CONTACT_EMPLOYEE_SCOPE = Symbol('propertyOwnerContactScope');

function idOf(value) {
   return String(value?._id || value || '');
}

export function restrictPropertyOwnerContacts(sessionUser) {
   if (sessionUser?.isFallbackAdmin) return false;
   return ['realtor', 'trainee', 'manager'].includes(sessionUser?.role || sessionUser?.user?.role);
}

// Resolve the hierarchy once per request, then reuse it for every property.
export async function withPropertyOwnerContactScope(sessionUser) {
   if (!sessionUser || !restrictPropertyOwnerContacts(sessionUser) || sessionUser[CONTACT_EMPLOYEE_SCOPE]) return sessionUser;
   const scopeIds = await getEmployeeScopeIds(sessionUser);
   return { ...sessionUser, [CONTACT_EMPLOYEE_SCOPE]: new Set(scopeIds.map(idOf)) };
}

function contactEmployeeScope(sessionUser) {
   return sessionUser[CONTACT_EMPLOYEE_SCOPE] || new Set([idOf(sessionUser.employeeId)].filter(Boolean));
}

export function canViewPropertyOwnerContacts(sessionUser, property) {
   if (!sessionUser || !property) return false;
   if (!restrictPropertyOwnerContacts(sessionUser)) return true;

   const scope = contactEmployeeScope(sessionUser);
   const assigneeId = idOf(property.assignee);
   // A reassigned property belongs to its current responsible employee.
   if (assigneeId) return scope.has(assigneeId);
   return scope.has(idOf(property.createdByEmployee))
      || (!!sessionUser.userId && idOf(property.owner) === String(sessionUser.userId));
}

export function buildPropertyOwnerContactFilter(sessionUser) {
   if (!sessionUser) return { _id: null };
   if (!restrictPropertyOwnerContacts(sessionUser)) return {};
   const asId = value => Types.ObjectId.isValid(value) ? new Types.ObjectId(value) : value;
   const scopedIds = [...contactEmployeeScope(sessionUser)].map(asId);
   const fallback = [];
   if (scopedIds.length) fallback.push({ createdByEmployee: { $in: scopedIds } });
   if (sessionUser.userId) fallback.push({ owner: asId(sessionUser.userId) });
   const conditions = [];
   if (scopedIds.length) conditions.push({ assignee: { $in: scopedIds } });
   if (fallback.length) conditions.push({ assignee: null, $or: fallback });
   return conditions.length ? { $or: conditions } : { _id: null };
}

const PRIVATE_FIELDS = new Set([
   'owners', 'phoneKeys', 'phoneIndexVersion', 'phone', 'phones', 'email', 'emails',
   'leadname', 'contactName', 'ownerName', 'ownerPhone', 'ownerEmail',
]);
const escapeRegex = value => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// Redact copies of owner contacts in notes as well as the structured fields.
export function redactPropertyOwnerContactText(property, value) {
   const owners = [...(property.owners || []), {
      name: property.leadname || property.contactName,
      phones: [property.phone, ...(property.phoneKeys || [])].filter(Boolean),
      emails: [property.email].filter(Boolean),
   }];
   const patterns = [];
   for (const owner of owners) {
      for (const phone of owner.phones || []) {
         let digits = String(phone || '').replace(/\D/g, '');
         if (digits.length === 12 && digits.startsWith('38')) digits = digits.slice(2);
         if (digits.length < 9) continue;
         const prefix = digits.startsWith('0') ? '(?:\\+?38[\\s().-]*)?' : '';
         patterns.push(new RegExp(prefix + digits.split('').join('[\\s().-]*'), 'g'));
      }
      for (const text of [owner.name, ...(owner.emails || [])]) {
         if (String(text || '').trim().length >= 3) patterns.push(new RegExp(escapeRegex(String(text).trim()), 'gi'));
      }
   }
   const redact = entry => {
      if (typeof entry === 'string') return patterns.reduce((text, regex) => text.replace(regex, '[контакт приховано]'), entry);
      if (Array.isArray(entry)) return entry.map(redact);
      if (!entry || typeof entry !== 'object' || entry instanceof Date || entry._bsontype) return entry;
      return Object.fromEntries(Object.entries(entry).map(([key, child]) => [key, redact(child)]));
   };
   return redact(value);
}

export function serializePropertyForUser(sessionUser, property) {
   if (!property) return property;
   const source = property.toObject ? property.toObject() : property;
   if (canViewPropertyOwnerContacts(sessionUser, source)) return { ...source, ownerContactsHidden: false };
   const visible = Object.fromEntries(Object.entries(source).filter(([key]) => !PRIVATE_FIELDS.has(key)));
   return {
      ...redactPropertyOwnerContactText(source, visible),
      owners: [],
      ownerContactsHidden: true,
   };
}
