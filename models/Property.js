import { Schema, model, models } from "mongoose";

const ACTUALITY_GROUPS = ["active", "paused", "inactive"];
const ACTUALITY_STATUSES = [
  // "Оглянутий! В роботі",
  // "Продзвін",
  // "Проблемний",
  // "Оглянутий! Не в роботі",
  // "Проданий мною",
  // "Проданий не мною",
  // "Знятий з продажу",
  // "Невідома причина",
  // "Завдаток мій",
  // "Завдаток не мій",
  // "Виявлена причина власників",
  // "Невиявлена причина власників",
  'Актуальний. Оглянутий! В роботі',
  'Актуальний. Продзвін',
  'Актуальний. Проблемний',
  'Актуальний. Оглянутий! Не в роботі',
  'Неактуальний. Проданий мною',
  'Неактуальний. Проданий не мною',
  'Неактуальний. Знятий з продажу',
  'Неактуальний. Невідома причина',
  'Зупинений. Завдаток мій',
  'Зупинений. Завдаток не мій',
  'Зупинений. Виявлена причина власників',
  'Зупинений. Невиявлена причина власників',
];

// const PropertyImageSchema = new Schema(
//   {
//     url: String,
//     public_id: String,
//     width: Number,
//     height: Number,
//     bytes: Number,
//     format: String,
//     originalName: String,
//     isMain: { type: Boolean, default: false },

//     variants: {
//       preview: String,
//       card: String,
//       full: String,
//     },
//   },
//   { _id: false }
// );

const PropertyImageSchema = new Schema(
  {
    url: String,
    public_id: String,
    width: Number,
    height: Number,
    bytes: Number,
    format: String,
    originalName: String,

    isMain: { type: Boolean, default: false },
    sortOrder: { type: Number, default: 0 },

    stage: {
      type: String,
      enum: ['draft', 'processed', 'branded'],
      default: 'draft',
      index: true,
    },

    processedUrl: String,
    brandedUrl: String,

    isHidden: { type: Boolean, default: false },

    variants: {
      preview: String,
      card: String,
      full: String,
      branded: String,
    },
  },
  { _id: false }
);


const OwnerSchema = new Schema(
  {
    name: { type: String, trim: true }, // напр. "Олег від Миколи з Яворова"

    phones: {
      type: [{ type: String, trim: true }],
      default: [],
    },

    emails: {
      type: [{ type: String, trim: true, lowercase: true }],
      default: [],
    },

    status: {
      type: String,
      enum: ["active", "previous", "inactive"],
      default: "active",
    },

    isPrimary: { type: Boolean, default: false },

    notes: { type: String, trim: true, default: "" },
  },
  { _id: false }
);

const RentOptionsSchema = new Schema(
  {
    price: { type: Number, default: null },

    currency: {
      type: String,
      enum: ["USD", "UAH", "EUR"],
      default: "USD",
    },

    availableFrom: { type: Date, default: null }, // дата доступності / звільнення

    adText: { type: String, trim: true, default: "" }, // текст для реклами
    notes: { type: String, trim: true, default: "" }, // внутрішні нотатки

    conditions: {
      type: [{ type: String, trim: true }],
      default: [],
    }, // переваги / недоліки / особливості / обмеження

    furniture: {
      type: [{ type: String, trim: true }],
      default: [],
    }, // меблі

    appliances: {
      type: [{ type: String, trim: true }],
      default: [],
    }, // техніка

    lastActualizedAt: { type: Date, default: null },
  },
  { _id: false }
);


const PropertySchema = new Schema(
  {
    owner: { type: Schema.Types.ObjectId, ref: "User" },

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
      default: "Актуальний. Продзвін",
      index: true,
    },
    lastContactAt: { type: Date, index: true },
    nextCheckAt: { type: Date, index: true },
    actualityNote: String,

    disadvantages: [{ type: String }],

    type_estate: String,
    type_deal: String,
    title: { type: String, required: true },

    location_text: String,
    location: {
      city: String,
      street: String,
      number: String,
      flat: String,
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

    images: [PropertyImageSchema],
    // mainImage: {
    //   url: String,
    //   preview: String,
    //   card: String,
    //   full: String,
    //   branded: String,
    // }, // для швидкого доступу до головного фото

    advantages: [{ type: String }],

    sourceLeadId: { type: Schema.Types.ObjectId, ref: "LeadProperty", index: true },


    // =========================
    // нові поля для оренди
    // =========================

    statusRent: {
      type: String,
      enum: ["rentNo", "rentActual", "rentPause", "rentRented"],
      default: "rentNo",
      index: true,
    },

    rentOptions: {
      type: RentOptionsSchema,
      default: () => ({}),
    },

    // =========================
    // власники
    // =========================

    owners: {
      type: [OwnerSchema],
      default: [],
    },
  },
  { timestamps: true }
);

PropertySchema.index({ actualityGroup: 1, actualityStatus: 1, updatedAt: -1 });

const Property = models.Property || model("Property", PropertySchema);
export default Property;