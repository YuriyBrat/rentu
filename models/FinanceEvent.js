import pkg from 'mongoose';

const { Schema, model, models } = pkg;

const FINANCE_TYPES = ['deposit', 'reregistration'];
const FINANCE_STATUSES = [
   'waiting',
   'completed_success',
   'completed_improved',
   'completed_worse',
   'failed',
];
const REREGISTRATION_PLACE_TYPES = ['notary', 'developer_sales', 'other'];
const FINANCIAL_PRODUCT_OPTIONS = ['OO', 'OP', 'PP', 'PO'];

const FinanceNoteSchema = new Schema(
   {
      text: {
         type: String,
         trim: true,
         default: '',
      },
      color: {
         type: String,
         trim: true,
         default: '#8b5cf6',
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
   { _id: false }
);

const FinanceEventSchema = new Schema(
   {
      financeType: {
         type: String,
         enum: FINANCE_TYPES,
         required: true,
         index: true,
      },

      deposit: {
         type: Schema.Types.ObjectId,
         ref: 'FinanceEvent',
         default: null,
         index: true,
      },

      reregistrationEvent: {
         type: Schema.Types.ObjectId,
         ref: 'FinanceEvent',
         default: null,
      },

      sourceOperationEvent: {
         type: Schema.Types.ObjectId,
         ref: 'OperationEvent',
         default: null,
         index: true,
      },

      sourcePreDepositEvent: {
         type: Schema.Types.ObjectId,
         ref: 'OperationEvent',
         default: null,
         index: true,
      },

      financialProduct: {
         type: String,
         enum: [...FINANCIAL_PRODUCT_OPTIONS, ''],
         default: '',
         index: true,
      },

      occurredAt: {
         type: Date,
         default: Date.now,
         index: true,
      },

      responsibleEmployee: {
         type: Schema.Types.ObjectId,
         ref: 'Employee',
         default: null,
         index: true,
      },

      processedByEmployee: {
         type: Schema.Types.ObjectId,
         ref: 'Employee',
         default: null,
         index: true,
      },

      property: {
         type: Schema.Types.ObjectId,
         ref: 'Property',
         default: null,
         index: true,
      },

      lead: {
         type: Schema.Types.ObjectId,
         ref: 'Lead',
         default: null,
         index: true,
      },

      objectRealtorEmployee: {
         type: Schema.Types.ObjectId,
         ref: 'Employee',
         default: null,
      },
      objectRealtorKind: {
         type: String,
         enum: ['employee', 'partner', 'none'],
         default: 'employee',
      },
      objectPartnerName: {
         type: String,
         trim: true,
         default: '',
      },

      buyerRealtorEmployee: {
         type: Schema.Types.ObjectId,
         ref: 'Employee',
         default: null,
      },
      buyerRealtorKind: {
         type: String,
         enum: ['employee', 'partner', 'none'],
         default: 'employee',
      },
      buyerPartnerName: {
         type: String,
         trim: true,
         default: '',
      },

      tensionLevel: {
         type: Number,
         min: 1,
         max: 5,
         default: 3,
      },

      location: {
         type: String,
         trim: true,
         default: '',
      },

      status: {
         type: String,
         enum: FINANCE_STATUSES,
         default: 'waiting',
         index: true,
      },

      deadlineAt: {
         type: Date,
         default: null,
         index: true,
      },

      scheduledReregistrationAt: {
         type: Date,
         default: null,
         index: true,
      },

      notary: {
         type: String,
         trim: true,
         default: '',
      },

      reregistrationPlaceType: {
         type: String,
         enum: REREGISTRATION_PLACE_TYPES,
         default: 'notary',
      },

      reregistrationPlaceName: {
         type: String,
         trim: true,
         default: '',
      },

      sellerConditions: {
         type: [{ type: String, trim: true }],
         default: [],
      },

      buyerConditions: {
         type: [{ type: String, trim: true }],
         default: [],
      },

      agencyConditions: {
         type: [{ type: String, trim: true }],
         default: [],
      },

      resultSummary: {
         type: String,
         trim: true,
         default: '',
      },

      notes: {
         type: [FinanceNoteSchema],
         default: [],
      },

      createdByEmployee: {
         type: Schema.Types.ObjectId,
         ref: 'Employee',
         default: null,
      },
   },
   { timestamps: true }
);

FinanceEventSchema.pre('validate', function validateFinanceEvent(next) {
   if (this.financeType === 'reregistration' && !this.deposit) {
      this.invalidate('deposit', 'deposit is required for reregistration');
   }

   if (this.financeType === 'deposit') {
      this.deposit = null;
      this.reregistrationPlaceType = this.reregistrationPlaceType || 'notary';
   }

   next();
});

FinanceEventSchema.index({ financeType: 1, occurredAt: -1 });
FinanceEventSchema.index({ property: 1, occurredAt: -1 });
FinanceEventSchema.index({ lead: 1, occurredAt: -1 });
FinanceEventSchema.index({ deposit: 1, financeType: 1 });
FinanceEventSchema.index({ financialProduct: 1, occurredAt: -1 });

export default models.FinanceEvent || model('FinanceEvent', FinanceEventSchema);
