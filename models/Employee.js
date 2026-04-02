import pkg from 'mongoose';
const { Schema, model, models } = pkg;

const EmployeeNoteSchema = new Schema(
   {
      text: { type: String, trim: true, required: true },
      type: {
         type: String,
         enum: ['positive', 'negative', 'info', 'important'],
         default: 'info',
      },
      createdByEmployee: {
         type: Schema.Types.ObjectId,
         ref: 'Employee',
         required: false,
      },
      createdByName: {
         type: String,
         trim: true,
         default: '',
      },
      createdAt: {
         type: Date,
         default: Date.now,
      },
   },
   { _id: false }
);

const EmployeeLinkSchema = new Schema(
   {
      name: {
         type: String,
         trim: true,
         // enum: ['Telegram', 'Instagram', 'Facebook', 'TikTok', 'LinkedIn', 'Website', 'Other'],
         default: '',
      }, // Telegram / Instagram / Facebook / TikTok / LinkedIn / Website

      url: {
         type: String,
         trim: true,
         default: '',
      },

      addedAt: {
         type: Date,
         default: Date.now,
      },
   },
   { _id: false }
);

const EmployeeSchema = new Schema(
   {
      name: {
         type: String,
         required: true,
         trim: true,
         index: true,
      },

      phones: {
         type: [{ type: String, trim: true }],
         default: [],
      },

      emails: {
         type: [{ type: String, trim: true, lowercase: true }],
         default: [],
      },

      position: {
         type: String,
         trim: true,
         default: '',
         index: true,
      },

      role: {
         type: String,
         enum: ['owner', 'admin', 'manager', 'realtor', 'callcenter', 'viewer'],
         default: 'viewer',
         index: true,
      },

      login: {
         type: String,
         trim: true,
         lowercase: true,
         unique: true,
         sparse: true,
         index: true,
      },

      passwordHash: {
         type: String,
         default: '',
      },

      avatarUrl: {
         type: String,
         trim: true,
         default: '',
      },

      avatarPublicId: {
         type: String,
         trim: true,
         default: '',
      },

      careerStartAt: {
         type: Date,
         default: undefined,
      },

      firedAt: {
         type: Date,
         default: undefined,
      },

      isActive: {
         type: Boolean,
         default: true,
         index: true,
      },

      displayOrder: {
         type: Number,
         default: 0,
         index: true,
      },

      color: {
         type: String,
         trim: true,
         default: '',
      },

      about: {
         type: String,
         trim: true,
         default: '',
      },

      links: {
         type: [EmployeeLinkSchema],
         default: [],
      },

      notes: {
         type: [EmployeeNoteSchema],
         default: [],
      },
   },
   { timestamps: true }
);

EmployeeSchema.index({ phones: 1 });
EmployeeSchema.index({ emails: 1 });

export default models.Employee || model('Employee', EmployeeSchema);