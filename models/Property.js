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
  'Неактуальний. Реалізований мною',
  'Неактуальний. Реалізований не мною',
  'Неактуальний. Знятий з реалізації',
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

const RentStorySchema = new Schema(
  {
    rentedAt: { type: Date, default: null }, // дата здачі
    // rentedBy: {
    //   type: String,
    //   enum: ['employee', 'owner', 'competitor', 'other', ''],
    //   default: '',
    // }, // ким здано
    rentedBy: { type: String, trim: true, default: '' }, // ким здано (текст)
    note: { type: String, trim: true, default: '' }, // нотатка
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

    rentTitle: { type: String, trim: true, default: '' },
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

    rentStory: {
      type: RentStorySchema,
      default: () => ({}),
    },

    lastActualizedAt: { type: Date, default: null },
  },
  { _id: false }
);

const AdvertisingLinkSchema = new Schema(
  {
    platform: {
      type: String,
      enum: ['olx', 'dimria', 'rieltor', 'facebook', 'instagram', 'site', 'other'],
      default: 'other',
    },
    title: { type: String, trim: true, default: '' },
    url: { type: String, trim: true, default: '' },

    status: {
      type: String,
      enum: ['active', 'paused', 'archived', 'problem'],
      default: 'active',
    },

    note: { type: String, trim: true, default: '' },

    createdByEmployee: {
      type: Schema.Types.ObjectId,
      ref: 'Employee',
      default: null,
    },

    sourceType: {
      type: String,
      enum: ['ours', 'competitor', 'owner'],
      default: 'ours',
      index: true,
    },

    createdAt: { type: Date, default: Date.now },
    lastCheckedAt: { type: Date, default: null },
  },
  { _id: true }
);


const ShareLinkSchema = new Schema(
  {
    type: {
      type: String,
      enum: ['client', 'partner'],
      required: true,
      index: true,
    },

    slug: {
      type: String,
      trim: true,
      required: true,
      index: true,
    },

    title: {
      type: String,
      trim: true,
      default: '',
    },

    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },

    showBrand: {
      type: Boolean,
      default: true,
    },

    showManagerContact: {
      type: Boolean,
      default: true,
    },

    useBrandedPhotos: {
      type: Boolean,
      default: true,
    },

    viewsCount: {
      type: Number,
      default: 0,
    },

    lastViewedAt: {
      type: Date,
      default: null,
    },

    createdByEmployee: {
      type: Schema.Types.ObjectId,
      ref: 'Employee',
      default: null,
    },

    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: true }
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

    assignee: { type: Schema.Types.ObjectId, ref: 'Employee', required: false, index: true },
    createdByEmployee: {
      type: Schema.Types.ObjectId, ref: 'Employee', required: false, index: true,
    },
    // =========================

    source: {
      type: String,
      trim: true,
      default: '',
    },

    strategyApprovedBy: {
      type: Schema.Types.ObjectId,
      ref: 'Employee',
      default: null,
      index: true,
    },

    strategyApprovedAt: {
      type: Date,
      default: null,
    },

    businessScore: {
      finance: { type: Number, min: 1, max: 5, default: null },
      liquidity: { type: Number, min: 1, max: 5, default: null },
      loyalty: { type: Number, min: 1, max: 5, default: null },
      motivation: { type: Number, min: 1, max: 5, default: null },
      problemFree: { type: Number, min: 1, max: 5, default: null },
      adAttractiveness: { type: Number, min: 1, max: 5, default: null },
      adHistory: { type: Number, min: 1, max: 5, default: null },
      adStrategy: { type: Number, min: 1, max: 5, default: null },
    },

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


    workHistory: [
      {
        type: {
          type: String,
          enum: ['note', 'call', 'message', 'meeting', 'review', 'showing'],
          default: 'note',
        },
        tone: {
          type: String,
          enum: ['positive', 'negative', 'info', 'important'],
          default: 'info',
        },
        text: {
          type: String,
          trim: true,
          default: '',
        },
        createdByEmployee: {
          type: Schema.Types.ObjectId,
          ref: 'Employee',
          default: null,
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    advertisingTexts: [
      {
        title: { type: String, trim: true, default: '' },
        text: { type: String, trim: true, default: '' },
        note: { type: String, trim: true, default: '' },
        result: { type: String, trim: true, default: '' },

        status: {
          type: String,
          enum: ['draft', 'active', 'tested', 'winner', 'weak', 'archived'],
          default: 'draft',
        },
        createdByEmployee: {
          type: Schema.Types.ObjectId,
          ref: 'Employee',
          default: null,
        },

        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    advertisingLinks: {
      type: [AdvertisingLinkSchema],
      default: [],
    },


    shareLinks: {
      type: [ShareLinkSchema],
      default: [],
    },
  },
  { timestamps: true }
);

PropertySchema.index({ actualityGroup: 1, actualityStatus: 1, updatedAt: -1 });
PropertySchema.index({ 'shareLinks.slug': 1 });

const Property = models.Property || model("Property", PropertySchema);
export default Property;