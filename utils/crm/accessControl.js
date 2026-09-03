import Employee from '@/models/Employee';
import Lead from '@/models/Lead';
import Property from '@/models/Property';

export function idString(value) {
   return value?._id?.toString?.() || value?.toString?.() || '';
}

export function isElevatedCrmUser(sessionUser) {
   const role = sessionUser?.role || sessionUser?.user?.role || '';
   return !!sessionUser?.isFallbackAdmin || ['owner', 'admin'].includes(role);
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
