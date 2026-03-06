// import { Schema, model, models } from 'mongoose';

// const PropertySchema = new Schema(
//   {
//     owner: {
//       type: Schema.Types.ObjectId,
//       ref: 'User',
//       required: true,
//     },
//     name: {
//       type: String,
//       required: true,
//     },
//     type: {
//       type: String,
//       required: true,
//     },
//     description: {
//       type: String,
//     },
//     location: {
//       street: {
//         type: String,
//       },
//       city: {
//         type: String,
//       },
//       state: {
//         type: String,
//       },
//       zipcode: {
//         type: String,
//       },
//     },
//     beds: {
//       type: Number,
//       required: true,
//     },
//     baths: {
//       type: Number,
//       required: true,
//     },
//     square_feet: {
//       type: Number,
//       required: true,
//     },
//     amenities: [
//       {
//         type: String,
//       },
//     ],
//     rates: {
//       nightly: {
//         type: Number,
//       },
//       weekly: {
//         type: Number,
//       },
//       monthly: {
//         type: Number,
//       },
//     },
//     seller_info: {
//       name: {
//         type: String,
//       },
//       email: {
//         type: String,
//       },
//       phone: {
//         type: String,
//       },
//     },
//     images: [
//       {
//         type: String,
//       },
//     ],
//     is_featured: {
//       type: Boolean,
//       default: false,
//     },
//   },
//   {
//     timestamps: true,
//   }
// );

//  const Property = models.Property || model('Property', PropertySchema);
// // const Property = model('Property', PropertySchema);

// export default Property;


import { Schema, model, models } from "mongoose";

const ACTUALITY_GROUPS = ["active", "paused", "inactive"];

const ACTUALITY_STATUSES = [
  // active
  "Оглянутий! В роботі",
  "Продзвін",
  "Проблемний",
  "Оглянутий! Не в роботі",
  // inactive
  "Проданий мною",
  "Проданий не мною",
  "Знятий з продажу",
  "Невідома причина",
  // paused
  "Завдаток мій",
  "Завдаток не мій",
  "Виявлена причина власників",
  "Невиявлена причина власників",
];

const PropertySchema = new Schema(
  {
    // CRM meta
    isPublic: { type: Boolean, default: false, index: true },

    actualityGroup: {
      type: String,
      enum: ACTUALITY_GROUPS,
      default: "active",
      index: true,
    },
    actualityStatus: {
      type: String,
      enum: ACTUALITY_STATUSES,
      default: "Продзвін",
      index: true,
    },
    lastContactAt: { type: Date, index: true },
    nextCheckAt: { type: Date, index: true },
    actualityNote: String,

    disadvantages: [{ type: String }],

    // core
    type_estate: String,
    type_deal: String,
    title: { type: String, required: true },

    location_text: String,
    location: {
      city: String,
      street: String,
      number: String,
    },

    rooms: Number,
    square_tot: Number,
    square_liv: Number,
    square_kit: Number,
    square_area: Number,
    square_use: Number,
    area_unit: String,

    floor: Number,
    floors: Number,

    type_building: String,
    type_walls: String,
    balconies: Number,
    height_wall: Number,

    type_using: String,
    type_commerce: String,
    type_house: String,
    purpose_area: String,

    cost: Number,
    currency: { type: String, default: "USD" },

    description: String,
    images: [{ type: String }],
    advantages: [{ type: String }],

    // link (на майбутнє)
    sourceLeadId: { type: Schema.Types.ObjectId, ref: "LeadProperty", index: true },
  },
  { timestamps: true }
);

PropertySchema.index({ actualityGroup: 1, actualityStatus: 1, updatedAt: -1 });

const Property = models.Property || model("Property", PropertySchema);
export default Property;