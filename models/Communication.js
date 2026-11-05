import { Schema, model, models } from 'mongoose';

export const COMMUNICATION_ENTITY_TYPES = ['leadProperty', 'property', 'lead', 'operation'];
export const COMMUNICATION_TYPES = ['call', 'sms', 'messenger', 'note'];
export const COMMUNICATION_TONES = ['positive', 'negative', 'important', 'info'];

const CommunicationSchema = new Schema(
   {
      entityType: {
         type: String,
         enum: COMMUNICATION_ENTITY_TYPES,
         required: true,
         index: true,
      },
      entityId: {
         type: Schema.Types.ObjectId,
         required: true,
         index: true,
      },

      type: {
         type: String,
         enum: COMMUNICATION_TYPES,
         default: 'note',
         index: true,
      },
      tone: {
         type: String,
         enum: COMMUNICATION_TONES,
         default: 'info',
         index: true,
      },

      happenedAt: {
         type: Date,
         default: Date.now,
         index: true,
      },
      text: {
         type: String,
         trim: true,
         default: '',
      },

      responsibleEmployee: {
         type: Schema.Types.ObjectId,
         ref: 'Employee',
         default: null,
         index: true,
      },
      createdByEmployee: {
         type: Schema.Types.ObjectId,
         ref: 'Employee',
         default: null,
         index: true,
      },
      operationEvent: {
         type: Schema.Types.ObjectId,
         ref: 'OperationEvent',
         default: null,
         index: true,
      },

      meta: {
         type: Schema.Types.Mixed,
         default: {},
      },
   },
   { timestamps: true }
);

CommunicationSchema.index({ entityType: 1, entityId: 1, happenedAt: -1 });
CommunicationSchema.index({ entityType: 1, type: 1, 'meta.callCenter.actorKey': 1, happenedAt: -1 });
CommunicationSchema.index({ entityType: 1, type: 1, createdByEmployee: 1, happenedAt: -1 });
CommunicationSchema.index({ responsibleEmployee: 1, happenedAt: -1 });
CommunicationSchema.index({ entityType: 1, createdAt: -1 });
CommunicationSchema.index({ 'meta.callCenter.requestId': 1 }, {
   unique: true,
   partialFilterExpression: { 'meta.callCenter.requestId': { $type: 'string' } },
});

export default models.Communication || model('Communication', CommunicationSchema);
