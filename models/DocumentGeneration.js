import pkg from 'mongoose';

const { Schema, model, models } = pkg;

const DOCUMENT_DOMAINS = ['sale', 'rent'];
const DOCUMENT_TYPES = [
   'sale_deposit',
   'sale_buyer_service',
   'sale_seller_service',
   'rent_contract',
   'rent_deposit',
   'rent_service',
];

const DocumentGenerationSchema = new Schema(
   {
      documentDomain: {
         type: String,
         enum: DOCUMENT_DOMAINS,
         default: 'sale',
         index: true,
      },

      documentType: {
         type: String,
         enum: DOCUMENT_TYPES,
         required: true,
         index: true,
      },

      generatedAt: {
         type: Date,
         default: Date.now,
         index: true,
      },

      generatedByEmployee: {
         type: Schema.Types.ObjectId,
         ref: 'Employee',
         default: null,
         index: true,
      },

      generatedByName: {
         type: String,
         trim: true,
         default: '',
      },

      generatedByRole: {
         type: String,
         trim: true,
         default: '',
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

      fileName: {
         type: String,
         trim: true,
         default: '',
      },

      fopName: {
         type: String,
         trim: true,
         default: '',
      },

      contractNumber: {
         type: String,
         trim: true,
         default: '',
      },

      contractDateText: {
         type: String,
         trim: true,
         default: '',
      },

      source: {
         type: String,
         enum: ['crm_gen_sale', 'crm_gen_rent', 'rcs_gen', 'api'],
         default: 'crm_gen_sale',
         index: true,
      },

      fieldsSnapshot: {
         type: Schema.Types.Mixed,
         default: {},
      },
   },
   { timestamps: true }
);

DocumentGenerationSchema.index({ documentType: 1, generatedAt: -1 });
DocumentGenerationSchema.index({ property: 1, generatedAt: -1 });
DocumentGenerationSchema.index({ lead: 1, generatedAt: -1 });

export default models.DocumentGeneration || model('DocumentGeneration', DocumentGenerationSchema);
