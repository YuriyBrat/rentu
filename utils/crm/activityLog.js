import CRMActivityLog from "@/models/CRMActivityLog";
import { Types } from "mongoose";

const LEAD_PROPERTY_FIELDS = [
   "source",
   "sourceId",
   "sourceUrl",
   "sourceStatus",
   "stage",
   "reviewStatus",
   "duplicatePropertyId",
   "propertyId",
   "type_estate",
   "type_deal",
   "title",
   "location_text",
   "rooms",
   "square_tot",
   "floor",
   "floors",
   "cost",
   "currency",
   "leadname",
   "phone",
   "email",
   "callCenter.verifiedAddressText",
   "callCenter.infoVerified",
   "callCenter.inspectionLoyalty",
   "callCenter.bottomPrice",
   "callCenter.interestLevel",
   "callCenter.urgencyLevel",
   "callCenter.cooperationWarmth",
   "callCenter.note",
   "inspectionReservation.reservedByEmployee",
   "inspectionReservation.reservedByName",
   "inspectionReservation.reservedAt",
   "inspectionReservation.expiresAt",
   "attrs.contactType",
   "attrs.sourcePublishedAt",
   "attrs.sourceAddedAt",
   "attrs.sourceUpdatedAt",
   "attrs.sourcePriceChangedAt",
];

const OPERATION_EVENT_FIELDS = [
   "type",
   "occurredAt",
   "responsibleEmployee",
   "showingKind",
   "presenceType",
   "shownByEmployee",
   "facilitatedByEmployee",
   "property",
   "lead",
   "propertyStage",
   "buyerStage",
   "objectRealtorKind",
   "objectRealtorEmployee",
   "objectPartnerName",
   "buyerRealtorKind",
   "buyerRealtorEmployee",
   "buyerPartnerName",
   "resultObject",
   "resultBuyer",
   "resultShowing",
   "objections",
   "objectionArguments",
   "resultDescription",
];

function normalizeId(value) {
   if (!value) return null;
   if (value instanceof Types.ObjectId) return value;
   if (value?._id) return normalizeId(value._id);
   return Types.ObjectId.isValid(String(value)) ? new Types.ObjectId(String(value)) : null;
}

function normalizeValue(value) {
   if (value === undefined) return null;
   if (value instanceof Date) return value.toISOString();
   if (value instanceof Types.ObjectId) return value.toString();
   if (Array.isArray(value)) return value.map(normalizeValue);
   if (value && typeof value === "object") {
      if (value._id && Object.keys(value).length <= 2) return normalizeValue(value._id);
      return Object.fromEntries(Object.entries(value).map(([key, fieldValue]) => [key, normalizeValue(fieldValue)]));
   }
   return value;
}

function getPathValue(object, path) {
   return String(path || "")
      .split(".")
      .reduce((acc, key) => (acc && acc[key] !== undefined ? acc[key] : undefined), object);
}

export function pickActivitySnapshot(object, fields = LEAD_PROPERTY_FIELDS) {
   if (!object) return null;

   const source = object.toObject ? object.toObject() : object;
   const snapshot = {};

   fields.forEach((field) => {
      const value = getPathValue(source, field);
      if (value !== undefined) snapshot[field] = normalizeValue(value);
   });

   return snapshot;
}

export function buildActivityDiff(before, after, fields = LEAD_PROPERTY_FIELDS) {
   const beforeIsSnapshot = before && fields.some((field) => Object.prototype.hasOwnProperty.call(before, field));
   const afterIsSnapshot = after && fields.some((field) => Object.prototype.hasOwnProperty.call(after, field));
   const beforeSnapshot = beforeIsSnapshot ? before : pickActivitySnapshot(before, fields) || {};
   const afterSnapshot = afterIsSnapshot ? after : pickActivitySnapshot(after, fields) || {};

   return fields
      .map((field) => {
         const beforeValue = normalizeValue(beforeSnapshot?.[field]);
         const afterValue = normalizeValue(afterSnapshot?.[field]);

         if (JSON.stringify(beforeValue) === JSON.stringify(afterValue)) return null;

         return {
            field,
            before: beforeValue,
            after: afterValue,
         };
      })
      .filter(Boolean);
}

export function actorFromSession(sessionUser) {
   const user = sessionUser?.user || {};

   return {
      actorEmployee: normalizeId(sessionUser?.employeeId || user.employeeId),
      actorUserId: String(sessionUser?.userId || user.id || ""),
      actorName: String(user.name || sessionUser?.name || ""),
      actorRole: String(sessionUser?.role || user.role || ""),
   };
}

export async function logActivity(payload = {}) {
   try {
      const actor = actorFromSession(payload.sessionUser);

      return await CRMActivityLog.create({
         entityType: payload.entityType || "system",
         entityId: normalizeId(payload.entityId),
         action: payload.action || "updated",
         ...actor,
         source: payload.source || "unknown",
         title: String(payload.title || ""),
         message: String(payload.message || ""),
         before: payload.before ?? null,
         after: payload.after ?? null,
         diff: Array.isArray(payload.diff) ? payload.diff : [],
         meta: payload.meta && typeof payload.meta === "object" ? payload.meta : {},
      });
   } catch (error) {
      console.error("CRM activity log failed:", error);
      return null;
   }
}

export { LEAD_PROPERTY_FIELDS, OPERATION_EVENT_FIELDS };
