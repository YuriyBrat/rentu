import pkg from 'mongoose';
const { Schema, model, models } = pkg;

const LeadNoteSchema = new Schema(
   {
      text: { type: String, trim: true, required: true },
      type: {
         type: String,
         enum: ['positive', 'negative', 'info', 'important'],
         default: 'info',
      },
      createdByName: { type: String, trim: true, default: '' },
      createdByEmployee: { type: Schema.Types.ObjectId, ref: 'Employee', required: false },
      createdAt: { type: Date, default: Date.now },
   },
   { _id: false }
);

const LeadHistorySchema = new Schema(
   {
      type: {
         type: String,
         enum: ['stage_change', 'assignee_change', 'created', 'note'],
         required: true,
      },

      stage: {
         type: String,
         enum: ['lead', 'hot', 'ps', 'rs', 'ds', 'zs', 'pers'],
         default: undefined,
      },

      assignee: {
         type: Schema.Types.ObjectId,
         ref: 'Employee',
         required: false,
      },

      changedByEmployee: {
         type: Schema.Types.ObjectId,
         ref: 'Employee',
         required: false,
      },

      changedByName: {
         type: String,
         trim: true,
         default: '',
      },

      note: {
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

const LeadSchema = new Schema(
   {
      name: { type: String, required: true, trim: true },

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
         enum: ['lead', 'client'],
         default: 'lead',
         index: true,
      },

      stage: {
         type: String,
         enum: ['lead', 'hot', 'ps', 'rs', 'ds', 'zs', 'pers'],
         default: 'lead',
         index: true,
      },

      requestSummary: { type: String, trim: true, default: '' },
      budgetMax: { type: Number, default: undefined },

      sourceChannel: { type: String, trim: true, default: '' }, // соцмережі, сайти, рекомендація
      sourceObject: { type: String, trim: true, default: '' }, // об’єкт, що примагнітив
      sourceNote: { type: String, trim: true, default: '' },

      actualityStatus: {
         type: String,
         enum: [
            'Актуальний. Зустріч! В роботі',
            'Актуальний. Продзвін',
            'Актуальний. Проблемний',
            'Актуальний. Зустріч! Не в роботі',
            'Неактуальний. Купив зі мною',
            'Неактуальний. Купив без мене',
            'Неактуальний. Відмова покупки',
            'Неактуальний. Невідома причина',
            'Зупинений. Завдаток мій',
            'Зупинений. Завдаток не мій',
            'Зупинений. Виявлена причина',
            'Зупинений. Невиявлена причина',
         ],
         default: 'Актуальний. Продзвін',
      },

      lastActualizedAt: { type: Date, default: undefined },
      lastContactAt: { type: Date, default: undefined },

      assignee: { type: Schema.Types.ObjectId, ref: 'Employee', required: false, index: true },
      createdByEmployee: { type: Schema.Types.ObjectId, ref: 'Employee', required: false, index: true, },
      // createdByName: { type: String, trim: true, default: '' },

      notes: {
         type: [LeadNoteSchema],
         default: [],
      },

      duplicateState: {
         type: String,
         enum: ['', 'possible', 'active', 'archived'],
         default: '',
      },
      duplicateOf: { type: Schema.Types.ObjectId, ref: 'Lead', required: false },

      isArchived: { type: Boolean, default: false, index: true },


      history: {
         type: [LeadHistorySchema],
         default: [],
      },
      leadAppearedAt: { type: Date, default: Date.now, index: true },
   },
   { timestamps: true }
);

LeadSchema.index({ phones: 1 });
LeadSchema.index({ emails: 1 });

export default models.Lead || model('Lead', LeadSchema);