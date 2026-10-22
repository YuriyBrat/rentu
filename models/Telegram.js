import mongoose from 'mongoose';

const { Schema, models, model } = mongoose;
const botSchema = new Schema({
  name: { type: String, required: true, trim: true, maxlength: 100 },
  key: { type: String, required: true, unique: true, trim: true },
  tokenEnv: { type: String, required: true, trim: true },
  username: { type: String, default: '' },
  enabled: { type: Boolean, default: true },
  checkedAt: { type: Date, default: null },
  lastError: { type: String, default: '' },
}, { timestamps: true, collection: 'telegrambots' });

const destinationSchema = new Schema({
  name: { type: String, required: true, trim: true, maxlength: 100 },
  key: { type: String, required: true, unique: true, trim: true },
  bot: { type: Schema.Types.ObjectId, ref: 'TelegramBot', required: true },
  chatId: { type: String, required: true, trim: true },
  threadId: { type: Number, default: null },
  chatTitle: { type: String, default: '' },
  chatType: { type: String, default: '' },
  enabled: { type: Boolean, default: true },
  checkedAt: { type: Date, default: null },
  lastError: { type: String, default: '' },
}, { timestamps: true, collection: 'telegramdestinations' });

const ruleSchema = new Schema({
  event: { type: String, required: true, unique: true },
  enabled: { type: Boolean, default: true },
  destinations: [{ type: Schema.Types.ObjectId, ref: 'TelegramDestination' }],
}, { timestamps: true, collection: 'telegramrules' });

const deliverySchema = new Schema({
  event: { type: String, required: true },
  sourceId: { type: Schema.Types.ObjectId, required: true },
  destination: { type: Schema.Types.ObjectId, ref: 'TelegramDestination', required: true },
  text: { type: String, required: true, maxlength: 4096 },
  status: { type: String, enum: ['pending', 'sending', 'sent', 'failed'], default: 'pending', index: true },
  attempts: { type: Number, default: 0 },
  lockedUntil: { type: Date, default: null },
  lockToken: { type: String, default: '' },
  nextAttemptAt: { type: Date, default: Date.now },
  sentAt: { type: Date, default: null },
  messageId: { type: Number, default: null },
  lastError: { type: String, default: '' },
}, { timestamps: true, collection: 'telegramdeliveries' });
deliverySchema.index({ event: 1, sourceId: 1, destination: 1 }, { unique: true });

export const TelegramBot = models.TelegramBot || model('TelegramBot', botSchema);
export const TelegramDestination = models.TelegramDestination || model('TelegramDestination', destinationSchema);
export const TelegramRule = models.TelegramRule || model('TelegramRule', ruleSchema);
export const TelegramDelivery = models.TelegramDelivery || model('TelegramDelivery', deliverySchema);
