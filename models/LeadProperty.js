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

const LeadPropertySchema = new Schema(
   {
      source: { type: String, default: "manual", index: true }, // olx/telegram/...
      sourceId: { type: String, index: true },
      sourceUrl: String,
      importedAt: { type: Date, default: Date.now, index: true },

      fingerprint: { type: String, index: true }, // для “ймовірного дедупа”
      stage: {
         type: String,
         enum: ["raw", "called", "qualified", "rejected", "moved"],
         default: "raw",
         index: true,
      },

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
      description: String,
      images: [{ type: String }],
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
LeadPropertySchema.index({ source: 1, sourceId: 1 }, { unique: true, sparse: true });

const LeadProperty = models.LeadProperty || model("LeadProperty", LeadPropertySchema);
export default LeadProperty;