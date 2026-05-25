import pkg from 'mongoose';

const { Schema, model, models } = pkg;

const RESULT_OBJECT_OPTIONS = [
   'new_object',
   'price_reduced',
   'loyalty_improved',
   'ad_removed_by_owner',
   'category_improved',
   'exclusive_agreed',
   'exclusive_signed',
   'documents_checked',
   'none',
];

const RESULT_BUYER_OPTIONS = [
   'new_client',
   'loyalty_improved',
   'exclusive_work',
   'readiness_increased',
   'deposit_taken',
   'category_improved',
   'none',
];

const RESULT_SHOWING_OPTIONS = [
   'zs',
   'pzs',
   'high_interest',
   'objections_found',
   'unclear',
   'refusal',
];

const SHOWING_KIND_OPTIONS = [
   'primary',
   'repeat',
   'initiative',
   'inbound_call',
   'sms',
   'assistance',
];

const PRESENCE_TYPE_OPTIONS = ['me', 'partner', 'agency_colleague', 'client_self'];

const OperationEventSchema = new Schema(
   {
      type: {
         type: String,
         enum: ['showing', 'review', 'call', 'meeting', 'other'],
         default: 'showing',
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

      showingKind: {
         type: String,
         enum: SHOWING_KIND_OPTIONS,
         default: 'primary',
         index: true,
      },

      presenceType: {
         type: String,
         enum: PRESENCE_TYPE_OPTIONS,
         default: 'me',
         index: true,
      },

      shownByEmployee: {
         type: Schema.Types.ObjectId,
         ref: 'Employee',
         default: null,
         index: true,
      },

      facilitatedByEmployee: {
         type: Schema.Types.ObjectId,
         ref: 'Employee',
         default: null,
         index: true,
      },

      propertyStage: {
         type: String,
         trim: true,
         default: '',
      },

      buyerStage: {
         type: String,
         trim: true,
         default: '',
      },

      objectRealtorKind: {
         type: String,
         enum: ['employee', 'partner', 'none'],
         default: 'employee',
      },

      objectRealtorEmployee: {
         type: Schema.Types.ObjectId,
         ref: 'Employee',
         default: null,
      },

      objectPartnerName: {
         type: String,
         trim: true,
         default: '',
      },

      buyerRealtorKind: {
         type: String,
         enum: ['employee', 'partner', 'none'],
         default: 'employee',
      },

      buyerRealtorEmployee: {
         type: Schema.Types.ObjectId,
         ref: 'Employee',
         default: null,
      },

      buyerPartnerName: {
         type: String,
         trim: true,
         default: '',
      },

      resultObject: {
         type: String,
         enum: RESULT_OBJECT_OPTIONS,
         default: 'none',
         index: true,
      },

      resultBuyer: {
         type: String,
         enum: RESULT_BUYER_OPTIONS,
         default: 'none',
         index: true,
      },

      resultShowing: {
         type: String,
         enum: RESULT_SHOWING_OPTIONS,
         default: 'unclear',
         index: true,
      },

      objections: {
         type: [{ type: String, trim: true }],
         default: [],
      },

      objectionArguments: {
         type: String,
         trim: true,
         default: '',
      },

      resultDescription: {
         type: String,
         trim: true,
         default: '',
      },

      createdByEmployee: {
         type: Schema.Types.ObjectId,
         ref: 'Employee',
         default: null,
      },
   },
   { timestamps: true }
);

OperationEventSchema.index({ occurredAt: -1, type: 1 });
OperationEventSchema.index({ property: 1, occurredAt: -1 });
OperationEventSchema.index({ lead: 1, occurredAt: -1 });

export default models.OperationEvent || model('OperationEvent', OperationEventSchema);
