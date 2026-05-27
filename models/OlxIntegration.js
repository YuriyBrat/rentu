import { Schema, model, models } from 'mongoose';

const OlxIntegrationSchema = new Schema(
   {
      provider: {
         type: String,
         enum: ['olx'],
         default: 'olx',
         unique: true,
         index: true,
      },

      clientId: {
         type: String,
         trim: true,
         default: '',
      },

      scope: {
         type: String,
         trim: true,
         default: '',
      },

      tokenType: {
         type: String,
         trim: true,
         default: '',
      },

      accessToken: {
         type: String,
         default: '',
      },

      refreshToken: {
         type: String,
         default: '',
      },

      expiresAt: {
         type: Date,
         default: null,
      },

      connectedAt: {
         type: Date,
         default: null,
      },

      lastCheckedAt: {
         type: Date,
         default: null,
      },

      lastError: {
         type: String,
         default: '',
      },
   },
   { timestamps: true }
);

export default models.OlxIntegration || model('OlxIntegration', OlxIntegrationSchema);
