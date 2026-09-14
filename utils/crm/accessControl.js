import Employee from '@/models/Employee';
import Lead from '@/models/Lead';
import Property from '@/models/Property';
import { Types } from 'mongoose';

export const CRM_ROLES = ['owner', 'admin', 'realtor', 'trainee', 'manager', 'marketing', 'callcenter', 'viewer'];
export const ELEVATED_CRM_ROLES = ['owner', 'admin'];
export const CRM_WORKSPACE_ROLES = ['owner', 'admin', 'realtor', 'trainee', 'manager', 'callcenter', 'viewer'];
export const ADVERTISING_CABINET_ROLES = ['owner', 'admin', 'realtor', 'trainee', 'manager', 'marketing', 'viewer'];

export function idString(value) {
   return value?._id?.toString?.() || value?.toString?.() || '';
}

function objectIdOrString(value) {
   const id = idString(value);
   return Types.ObjectId.isValid(id) ? new Types.ObjectId(id) : id;
}

export function isElevatedCrmUser(sessionUser) {
   const role = sessionUser?.role || sessionUser?.user?.role || '';
   return !!sessionUser?.isFallbackAdmin || ELEVATED_CRM_ROLES.includes(role);
}

export function canEnterCrmWorkspace(sessionUser) {
   if (!sessionUser) return false;
   if (sessionUser?.isFallbackAdmin) return true;
   const role = sessionUser?.role || sessionUser?.user?.role || '';
   return CRM_WORKSPACE_ROLES.includes(role);
}

export function canEnterAdvertisingCabinet(sessionUser) {
   if (!sessionUser) return false;
   if (sessionUser?.isFallbackAdmin) return true;
   const role = sessionUser?.role || sessionUser?.user?.role || '';
   return ADVERTISING_CABINET_ROLES.includes(role);
}

async function managerByEmployeeId() {
   const employees = await Employee.find({}, 'manager').lean();
   return new Map(
      employees.map((employee) => [
         String(employee._id),
         employee.manager ? String(employee.manager) : '',
      ])
   );
}

export async function getEmployeeScopeIds(sessionUser) {
   if (isElevatedCrmUser(sessionUser)) return [];

   const actorId = String(sessionUser?.employeeId || '');
   if (!actorId) return [];

   const managers = await managerByEmployeeId();
   const scoped = new Set([actorId]);
   let changed = true;

   while (changed) {
      changed = false;
      for (const [employeeId, managerId] of managers.entries()) {
         if (managerId && scoped.has(managerId) && !scoped.has(employeeId)) {
            scoped.add(employeeId);
            changed = true;
         }
      }
   }

   return [...scoped];
}

export async function buildPropertyAccessFilter(sessionUser) {
   if (isElevatedCrmUser(sessionUser)) return {};

   const employeeScopeIds = await getEmployeeScopeIds(sessionUser);
   const userId = String(sessionUser?.userId || '');
   const conditions = [];

   if (userId) conditions.push({ owner: objectIdOrString(userId) });
   if (employeeScopeIds.length) {
      const scopedObjectIds = employeeScopeIds.map(objectIdOrString);
      conditions.push(
         { assignee: { $in: scopedObjectIds } },
         { createdByEmployee: { $in: scopedObjectIds } },
         { 'advertisingSettings.assignedEmployee': { $in: scopedObjectIds } }
      );
   }

   return conditions.length ? { $or: conditions } : { _id: null };
}

export function combineMongoFilters(...filters) {
   const active = filters.filter((filter) => filter && Object.keys(filter).length);
   if (!active.length) return {};
   if (active.length === 1) return active[0];
   return { $and: active };
}

export async function canManageEmployeeScope(sessionUser, employeeIds = []) {
   if (isElevatedCrmUser(sessionUser)) return true;

   const actorId = String(sessionUser?.employeeId || '');
   if (!actorId) return false;

   const ownerIds = [...new Set(employeeIds.map(idString).filter(Boolean))];
   if (ownerIds.includes(actorId)) return true;
   if (!ownerIds.length) return false;

   const managers = await managerByEmployeeId();

   return ownerIds.some((employeeId) => {
      let current = managers.get(employeeId);
      const visited = new Set();

      while (current && !visited.has(current)) {
         if (current === actorId) return true;
         visited.add(current);
         current = managers.get(current);
      }

      return false;
   });
}

export async function canManageProperty(sessionUser, property) {
   if (!property) return false;
   if (isElevatedCrmUser(sessionUser)) return true;

   const userId = String(sessionUser?.userId || '');
   if (property.owner && userId && idString(property.owner) === userId) return true;

   return canManageEmployeeScope(sessionUser, [
      property.assignee,
      property.createdByEmployee,
      property.advertisingSettings?.assignedEmployee,
   ]);
}

export async function canManageOperationEvent(sessionUser, event) {
   if (!event) return false;
   if (isElevatedCrmUser(sessionUser)) return true;

   const employeeIds = [
      event.createdByEmployee,
      event.responsibleEmployee,
      event.shownByEmployee,
      event.facilitatedByEmployee,
      event.objectRealtorEmployee,
      event.buyerRealtorEmployee,
      event.property?.assignee,
      event.property?.createdByEmployee,
      event.lead?.assignee,
      event.lead?.createdByEmployee,
   ];

   const propertyId = idString(event.property);
   if (propertyId && !event.property?.assignee) {
      const property = await Property.findById(propertyId).select('assignee createdByEmployee').lean();
      employeeIds.push(property?.assignee, property?.createdByEmployee);
   }

   const leadId = idString(event.lead);
   if (leadId && !event.lead?.assignee) {
      const lead = await Lead.findById(leadId).select('assignee createdByEmployee').lean();
      employeeIds.push(lead?.assignee, lead?.createdByEmployee);
   }

   return canManageEmployeeScope(sessionUser, employeeIds);
}
