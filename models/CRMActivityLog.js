import { Schema, model, models } from "mongoose";

export const CRM_ACTIVITY_ENTITY_TYPES = [
   "leadProperty",
   "property",
   "lead",
   "communication",
   "operation",
   "employee",
   "system",
];

export const CRM_ACTIVITY_ACTIONS = [
   "created",
   "imported",
   "updated",
   "deleted",
   "status_changed",
   "communication_added",
   "moved",
   "linked",
   "unlinked",
];

const CRMActivityLogSchema = new Schema(
   {
      entityType: {
         type: String,
         enum: CRM_ACTIVITY_ENTITY_TYPES,
         required: true,
         index: true,
      },
      entityId: { type: Schema.Types.ObjectId, index: true, default: null },

      action: {
         type: String,
         enum: CRM_ACTIVITY_ACTIONS,
         required: true,
         index: true,
      },

      actorEmployee: { type: Schema.Types.ObjectId, ref: "Employee", default: null, index: true },
      actorUserId: { type: String, trim: true, default: "", index: true },
      actorName: { type: String, trim: true, default: "" },
      actorRole: { type: String, trim: true, default: "", index: true },

      source: {
         type: String,
         enum: ["manual", "system", "dimria", "reamak", "api", "import", "unknown", ""],
         default: "unknown",
         index: true,
      },

      title: { type: String, trim: true, default: "" },
      message: { type: String, trim: true, default: "" },

      before: { type: Schema.Types.Mixed, default: null },
      after: { type: Schema.Types.Mixed, default: null },
      diff: { type: Schema.Types.Mixed, default: [] },
      meta: { type: Schema.Types.Mixed, default: {} },
   },
   { timestamps: { createdAt: true, updatedAt: false } }
);

CRMActivityLogSchema.index({ entityType: 1, entityId: 1, createdAt: -1 });
CRMActivityLogSchema.index({ actorEmployee: 1, createdAt: -1 });
CRMActivityLogSchema.index({ action: 1, createdAt: -1 });
CRMActivityLogSchema.index({ source: 1, createdAt: -1 });

const CRMActivityLog = models.CRMActivityLog || model("CRMActivityLog", CRMActivityLogSchema);
export default CRMActivityLog;
