import { Schema, model, models } from "mongoose";

export const MARKETING_EVENT_ACTIONS = [
   "created_first",
   "created_with_update",
   "created_without_changes",
   "updated_improved",
   "updated_without_changes",
   "edited_photo",
   "price_changed",
   "scanner",
   "financial_promotion",
   "deactivated",
];

export const MARKETING_EVENT_PLATFORMS = [
   "olx",
   "dimria",
   "rieltor",
   "lun",
   "flatfy",
   "real-estate",
   "facebook",
   "instagram",
   "tiktok",
   "telegram",
   "site",
   "other",
];

const MarketingMetricsSchema = new Schema(
   {
      views: { type: Number, default: null },
      calls: { type: Number, default: null },
      messages: { type: Number, default: null },
      phoneOpens: { type: Number, default: null },
      favorites: { type: Number, default: null },
      saves: { type: Number, default: null },
      clicks: { type: Number, default: null },
      position: { type: Number, default: null },
   },
   { _id: false }
);

const MarketingEventSchema = new Schema(
   {
      property: { type: Schema.Types.ObjectId, ref: "Property", required: true, index: true },
      advertisingLinkId: { type: Schema.Types.ObjectId, default: null, index: true },

      actionType: {
         type: String,
         enum: MARKETING_EVENT_ACTIONS,
         required: true,
         index: true,
      },

      platform: {
         type: String,
         enum: MARKETING_EVENT_PLATFORMS,
         default: "other",
         index: true,
      },

      occurredAt: { type: Date, default: Date.now, required: true, index: true },
      responsibleEmployee: { type: Schema.Types.ObjectId, ref: "Employee", default: null, index: true },
      createdByEmployee: { type: Schema.Types.ObjectId, ref: "Employee", default: null, index: true },

      sourceType: {
         type: String,
         enum: ["ours", "competitor", "owner"],
         default: "ours",
         index: true,
      },

      linkTitle: { type: String, trim: true, default: "" },
      linkUrl: { type: String, trim: true, default: "" },
      note: { type: String, trim: true, default: "" },

      costUah: { type: Number, min: 0, default: null },
      metrics: { type: MarketingMetricsSchema, default: () => ({}) },

      createdFrom: {
         type: String,
         enum: ["manual", "property_link", "system"],
         default: "manual",
         index: true,
      },
   },
   { timestamps: true }
);

MarketingEventSchema.index({ property: 1, occurredAt: -1 });
MarketingEventSchema.index({ actionType: 1, occurredAt: -1 });
MarketingEventSchema.index({ responsibleEmployee: 1, occurredAt: -1 });

const MarketingEvent = models.MarketingEvent || model("MarketingEvent", MarketingEventSchema);
export default MarketingEvent;
