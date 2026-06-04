// import { Schema, model, models } from "mongoose";

// const LeadPropertySchema = new Schema({
//    type_estate: String,
//    type_deal: String, // типу чи продаж оренда подобова оренда
//    ip: String,

//    title: String,
//    // owner: {
//    //    type: Schema.Types.ObjectId,
//    //    ref: 'User',
//    //    required: true,
//    // },
//    location_text: String,
//    location: {
//       city: String,
//       street: String,
//       number: String
//    },
//    rooms: Number,
//    square_tot: Number,
//    square_liv: Number,
//    square_kit: Number,
//    square_area: Number,
//    square_use: Number,

//    area_unit: String,

//    floor: Number,
//    floors: Number,

//    type_building: String,
//    type_walls: String,
//    balconies: Number,

//    height_wall: Number,
//    // height_unit: String, // вказуємо лише у см

//    type_using: String,
//    type_commerce: String,

//    type_house: String,
//    purpose_area: String,

//    cost: Number,
//    currency: String,

//    description: String,

//    images: [
//       {
//          type: String,
//       },
//    ],

//    advantages: [
//       {
//          type: String,
//       },
//    ],


//    leadname: String,
//    phone: String,
//    email: String,

// },
//    {
//       timestamps: true,
//    })

// const LeadProperty = models.LeadProperty || model('LeadProperty', LeadPropertySchema)

// export default LeadProperty


import { Schema, model, models } from "mongoose";

const LeadPropertyImageSchema = new Schema(
   {
      url: { type: String, default: "" },
      public_id: { type: String, default: "" },
      width: Number,
      height: Number,
      bytes: Number,
      format: String,
      originalName: { type: String, default: "" },
      isMain: { type: Boolean, default: false },
      sortOrder: { type: Number, default: 0 },
      origin: {
         type: String,
         enum: ["owner", "competitor", "unknown", ""],
         default: "unknown",
      },
      sourceUrl: { type: String, default: "" },
      stage: { type: String, default: "raw" },
      variants: {
         preview: { type: String, default: "" },
         card: { type: String, default: "" },
         full: { type: String, default: "" },
      },
      uploadedAt: { type: Date, default: Date.now },
   },
   { _id: false }
);

const LeadPropertyPriceHistorySchema = new Schema(
   {
      price: Number,
      currency: { type: String, default: "USD" },
      changedAt: { type: Date, default: null },
      detectedAt: { type: Date, default: Date.now },
      source: { type: String, default: "" },
      note: { type: String, default: "" },
   },
   { _id: false }
);

const LeadPropertyCallCenterSchema = new Schema(
   {
      verifiedAddressText: { type: String, trim: true, default: "" },
      infoVerified: {
         type: String,
         enum: ["unchecked", "verified", "partial", "mismatch", ""],
         default: "unchecked",
      },
      inspectionLoyalty: {
         type: String,
         enum: ["unknown", "yes", "maybe", "no", ""],
         default: "unknown",
      },
      bottomPrice: { type: Number, default: null },
      interestLevel: { type: Number, min: 1, max: 5, default: null },
      urgencyLevel: { type: Number, min: 1, max: 5, default: null },
      cooperationWarmth: { type: Number, min: 1, max: 5, default: null },
      note: { type: String, trim: true, default: "" },
      updatedAt: { type: Date, default: null },
      updatedBy: { type: Schema.Types.ObjectId, ref: "Employee", default: null },
   },
   { _id: false }
);

const LeadPropertySchema = new Schema(
   {
      source: { type: String, default: "manual", index: true }, // olx/telegram/...
      sourceId: { type: String, index: true },
      sourceUrl: String,
      reamakId: { type: String, trim: true, default: "", index: true },
      sourceStatus: {
         type: String,
         enum: ["unknown", "active", "inactive", "removed", "error", ""],
         default: "unknown",
         index: true,
      },
      sourceCheckedAt: { type: Date, default: null },
      importedAt: { type: Date, default: Date.now, index: true },

      fingerprint: { type: String, index: true }, // для “ймовірного дедупа”
      stage: {
         type: String,
         enum: ["raw", "processing", "called", "qualified", "duplicate", "fake", "rejected", "moved"],
         default: "raw",
         index: true,
      },
      reviewStatus: {
         type: String,
         enum: ["unchecked", "actual", "not_actual", "owner", "realtor", "unknown", ""],
         default: "unchecked",
         index: true,
      },
      callResult: { type: String, trim: true, default: "" },
      reviewNote: { type: String, trim: true, default: "" },
      callCenter: { type: LeadPropertyCallCenterSchema, default: () => ({}) },
      lastCallAt: { type: Date, default: null, index: true },
      assignedToEmployee: { type: Schema.Types.ObjectId, ref: "Employee", default: null, index: true },
      duplicateOf: { type: Schema.Types.ObjectId, ref: "LeadProperty", default: null, index: true },
      duplicatePropertyId: { type: Schema.Types.ObjectId, ref: "Property", default: null, index: true },

      // твоє ядро
      type_estate: String,
      type_deal: String,
      title: String,
      location_text: String,
      location: { city: String, street: String, number: String },
      rooms: Number,
      square_tot: Number,
      floor: Number,
      floors: Number,
      cost: Number,
      currency: String,
      priceHistory: [LeadPropertyPriceHistorySchema],
      description: String,
      images: [LeadPropertyImageSchema],
      advantages: [{ type: String }],
      leadname: String,
      phone: { type: String, index: true },
      email: String,

      // для OLX/інших сайтів
      attrs: { type: Schema.Types.Mixed, default: {} },
      raw: { type: Schema.Types.Mixed },

      // прив’язка до канонічного об’єкта
      propertyId: { type: Schema.Types.ObjectId, ref: "Property", index: true },
   },
   { timestamps: true }
);

// точний дедуп по джерелу
LeadPropertySchema.index(
   { source: 1, sourceId: 1 },
   {
      unique: true,
      partialFilterExpression: {
         sourceId: { $type: "string", $ne: "" },
      },
   }
);
LeadPropertySchema.index({ source: 1, reamakId: 1 });
LeadPropertySchema.index({ source: 1, "attrs.reamak.siteName": 1, "attrs.reamak.siteId": 1 });
LeadPropertySchema.index({ source: 1, "attrs.reamak.reamakPageUrl": 1 });

const LeadProperty = models.LeadProperty || model("LeadProperty", LeadPropertySchema);
export default LeadProperty;
