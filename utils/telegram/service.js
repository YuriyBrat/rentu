import 'server-only';
import { randomUUID } from 'node:crypto';
import mongoose from 'mongoose';
import connectDB from '@/config/database';
import Navodka from '@/models/Navodka';
import { TelegramBot, TelegramDestination, TelegramRule, TelegramDelivery } from '@/models/Telegram';
import { TOKEN_ENV_PATTERN, ownerTelegramText, safeTelegramError } from './shared.mjs';
import { telegramApi } from './api.mjs';

export async function ensureTelegramDB() {
  await connectDB();
  if (mongoose.connection.readyState !== 1) throw new Error('TELEGRAM_STORAGE_UNAVAILABLE');
}

function botToken(bot) {
  if (!bot?.enabled) throw new Error('DESTINATION_DISABLED');
  const token = TOKEN_ENV_PATTERN.test(bot.tokenEnv || '') ? process.env[bot.tokenEnv]?.trim() : '';
  if (!token) throw new Error('BOT_NOT_CONFIGURED');
  return token;
}

async function destinationWithBot(id) {
  const destination = await TelegramDestination.findById(id).populate('bot');
  if (!destination?.enabled || !destination.bot) throw new Error('DESTINATION_DISABLED');
  return destination;
}

export async function checkTelegramBot(id) {
  const bot = await TelegramBot.findById(id);
  if (!bot) throw new Error('BOT_NOT_CONFIGURED');
  try {
    const me = await telegramApi(botToken(bot), 'getMe');
    await TelegramBot.updateOne({ _id: bot._id }, { $set: { username: me.username || '', checkedAt: new Date(), lastError: '' } });
    return { username: me.username || '' };
  } catch (error) {
    await TelegramBot.updateOne({ _id: bot._id }, { $set: { checkedAt: new Date(), lastError: safeTelegramError(error) } });
    throw error;
  }
}

export async function checkTelegramDestination(id) {
  const destination = await destinationWithBot(id);
  try {
    let chat;
    try { chat = await telegramApi(botToken(destination.bot), 'getChat', { chat_id: destination.chatId }); }
    catch (error) {
      if (!error.migrateTo) throw error;
      destination.chatId = error.migrateTo;
      chat = await telegramApi(botToken(destination.bot), 'getChat', { chat_id: destination.chatId });
    }
    await TelegramDestination.updateOne({ _id: id }, { $set: { chatId: String(chat.id), chatTitle: chat.title || chat.username || chat.first_name || '', chatType: chat.type || '', checkedAt: new Date(), lastError: '' } });
    return { title: chat.title || chat.username || '', type: chat.type };
  } catch (error) {
    await TelegramDestination.updateOne({ _id: id }, { $set: { checkedAt: new Date(), lastError: safeTelegramError(error) } });
    throw error;
  }
}

export async function queueOwnerNotification(lead) {
  const rule = await TelegramRule.findOne({ event: 'owner_request', enabled: true }).lean();
  const destinations = rule?.destinations?.length
    ? await TelegramDestination.find({ _id: { $in: rule.destinations }, enabled: true }).lean() : [];
  await TelegramDelivery.init();
  const text = ownerTelegramText(lead, process.env.TELEGRAM_CRM_BASE_URL || 'https://karamax.com.ua');
  for (const destination of destinations) {
    const filter = { event: 'owner_request', sourceId: lead._id, destination: destination._id };
    try {
      await TelegramDelivery.updateOne(filter, { $setOnInsert: { ...filter, text, status: 'pending', attempts: 0, nextAttemptAt: new Date() } }, { upsert: true });
    } catch (error) { if (error?.code !== 11000) throw error; }
  }
  await Navodka.updateOne({ _id: lead._id }, { $set: { telegramNotificationQueuedAt: new Date() } });
  return TelegramDelivery.find({ event: 'owner_request', sourceId: lead._id }).distinct('_id');
}

export async function deliverTelegramNotification(id) {
  const now = new Date();
  const lockToken = randomUUID();
  const delivery = await TelegramDelivery.findOneAndUpdate({
    _id: id,
    nextAttemptAt: { $lte: now },
    $or: [{ status: { $in: ['pending', 'failed'] } }, { status: 'sending', lockedUntil: { $lte: now } }],
  }, { $set: { status: 'sending', lockedUntil: new Date(Date.now() + 30000), lockToken }, $inc: { attempts: 1 } }, { new: true });
  if (!delivery) return { sent: false, waiting: true };
  try {
    const destination = await destinationWithBot(delivery.destination);
    const payload = { chat_id: destination.chatId, text: delivery.text, link_preview_options: { is_disabled: true } };
    if (destination.threadId) payload.message_thread_id = destination.threadId;
    let message;
    try { message = await telegramApi(botToken(destination.bot), 'sendMessage', payload); }
    catch (error) {
      if (!error.migrateTo) throw error;
      await TelegramDestination.updateOne({ _id: destination._id }, { $set: { chatId: error.migrateTo } });
      message = await telegramApi(botToken(destination.bot), 'sendMessage', { ...payload, chat_id: error.migrateTo });
    }
    await TelegramDelivery.updateOne({ _id: id, lockToken }, { $set: { status: 'sent', sentAt: new Date(), messageId: message.message_id, lastError: '', lockedUntil: null, lockToken: '' } });
    return { sent: true };
  } catch (error) {
    const lastError = safeTelegramError(error);
    const waitSeconds = Math.max(error.retryAfter || 0, error.name === 'TimeoutError' || error.name === 'AbortError' ? 30 : 0);
    await TelegramDelivery.updateOne({ _id: id, lockToken }, { $set: { status: 'failed', lastError, lockedUntil: null, lockToken: '', nextAttemptAt: new Date(Date.now() + waitSeconds * 1000) } });
    return { sent: false, error: lastError };
  }
}

export async function notifyOwnerRequest(lead) {
  const ids = await queueOwnerNotification(lead);
  return Promise.allSettled(ids.map(id => deliverTelegramNotification(id)));
}

export async function testTelegramDestination(id) {
  await destinationWithBot(id);
  const delivery = await TelegramDelivery.create({
    event: 'test', sourceId: new mongoose.Types.ObjectId(), destination: id,
    text: '🧪 KARAMAX · перевірка сповіщень\n\nTelegram підключено. Це тестове повідомлення з налаштувань CRM, без даних клієнта.',
  });
  return deliverTelegramNotification(delivery._id);
}

export async function processTelegramQueue() {
  const unqueued = await Navodka.find({ telegramNotificationRequestedAt: { $type: 'date' }, telegramNotificationQueuedAt: null }).sort({ createdAt: 1 }).limit(20).lean();
  for (const lead of unqueued) await queueOwnerNotification(lead);
  const now = new Date();
  const pending = await TelegramDelivery.find({ nextAttemptAt: { $lte: now }, $or: [{ status: { $in: ['pending', 'failed'] } }, { status: 'sending', lockedUntil: { $lte: now } }] }).sort({ createdAt: 1 }).limit(10).select('_id').lean();
  let sent = 0;
  // Batches keep Telegram calls and the duration of an admin request bounded.
  for (let start = 0; start < pending.length; start += 5) {
    const results = await Promise.allSettled(pending.slice(start, start + 5).map(item => deliverTelegramNotification(item._id)));
    sent += results.filter(result => result.status === 'fulfilled' && result.value.sent).length;
  }
  return { processed: pending.length, sent, recovered: unqueued.length };
}
