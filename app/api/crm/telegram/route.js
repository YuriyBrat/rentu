import { randomUUID } from 'node:crypto';
import { NextResponse } from 'next/server';
import { getSessionUser } from '@/utils/getSessionUser';
import { isElevatedCrmUser } from '@/utils/crm/accessControl';
import Navodka from '@/models/Navodka';
import { TelegramBot, TelegramDestination, TelegramRule, TelegramDelivery } from '@/models/Telegram';
import { TELEGRAM_EVENTS, TOKEN_ENV_PATTERN, OBJECT_ID_PATTERN, telegramConfigInput, safeTelegramError } from '@/utils/telegram/shared.mjs';
import { ensureTelegramDB, checkTelegramBot, checkTelegramDestination, testTelegramDestination, processTelegramQueue, deliverTelegramNotification } from '@/utils/telegram/service';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
const json = (data, status = 200) => NextResponse.json(data, { status, headers: { 'Cache-Control': 'no-store' } });

async function authorize() {
  const user = await getSessionUser();
  if (!user) return json({ error: 'Увійдіть у CRM.' }, 401);
  if (!isElevatedCrmUser(user)) return json({ error: 'Налаштування Telegram доступні власнику й адміністратору.' }, 403);
  return null;
}

export async function GET() {
  const denied = await authorize();
  if (denied) return denied;
  try {
    await ensureTelegramDB();
    const [bots, destinations, rules, deliveries, statusCounts, recoveryCount] = await Promise.all([
      TelegramBot.find().sort({ createdAt: 1 }).lean(),
      TelegramDestination.find().sort({ createdAt: 1 }).lean(),
      TelegramRule.find().lean(),
      TelegramDelivery.find().sort({ createdAt: -1 }).limit(30).select('-text -lockToken').lean(),
      TelegramDelivery.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
      Navodka.countDocuments({ telegramNotificationRequestedAt: { $type: 'date' }, telegramNotificationQueuedAt: null }),
    ]);
    return json({
      bots: bots.map(bot => ({ ...bot, configured: TOKEN_ENV_PATTERN.test(bot.tokenEnv || '') && !!process.env[bot.tokenEnv]?.trim() })),
      destinations, rules, deliveries, events: TELEGRAM_EVENTS,
      tokenEnvOptions: Object.keys(process.env).filter(key => TOKEN_ENV_PATTERN.test(key)).sort(),
      counts: Object.fromEntries(statusCounts.map(item => [item._id, item.count])), recoveryCount,
    });
  } catch {
    return json({ error: 'Не вдалося завантажити налаштування Telegram.' }, 503);
  }
}

export async function POST(request) {
  const denied = await authorize();
  if (denied) return denied;
  const origin = request.headers.get('origin');
  const allowed = new Set([request.nextUrl.origin, 'https://karamax.com.ua', 'https://www.karamax.com.ua']);
  try { if (process.env.NEXTAUTH_URL) allowed.add(new URL(process.env.NEXTAUTH_URL).origin); } catch {}
  if (origin && !allowed.has(origin)) return json({ error: 'Запит із цього сайту не дозволений.' }, 403);
  if (!request.headers.get('content-type')?.includes('application/json')) return json({ error: 'Невірний формат запиту.' }, 415);
  if (Number(request.headers.get('content-length')) > 12000) return json({ error: 'Завеликий запит.' }, 413);
  let body;
  try {
    const text = await request.text();
    if (text.length > 12000) return json({ error: 'Завеликий запит.' }, 413);
    body = JSON.parse(text);
  } catch { return json({ error: 'Перевірте дані.' }, 400); }
  if (!body || typeof body !== 'object' || Array.isArray(body)) return json({ error: 'Перевірте дані.' }, 400);
  const validId = id => typeof id === 'string' && OBJECT_ID_PATTERN.test(id);

  try {
    await ensureTelegramDB();
    if (body.action === 'save_bot' || body.action === 'save_destination') {
      const kind = body.action === 'save_bot' ? 'bot' : 'destination';
      let input;
      try { input = telegramConfigInput(kind, body); } catch (error) { return json({ error: error.message }, 400); }
      if (body.id && !validId(body.id)) return json({ error: 'Некоректний запис.' }, 400);
      if (kind === 'destination' && !await TelegramBot.exists({ _id: input.bot })) return json({ error: 'Бота не знайдено.' }, 400);
      const Model = kind === 'bot' ? TelegramBot : TelegramDestination;
      if (body.id) {
        const updated = await Model.findByIdAndUpdate(body.id, { $set: { ...input, checkedAt: null, lastError: '' } }, { runValidators: true });
        if (!updated) return json({ error: 'Запис не знайдено.' }, 404);
      } else await Model.create({ ...input, key: randomUUID() });
      return json({ success: true });
    }
    if (body.action === 'save_rule') {
      let input;
      try { input = telegramConfigInput('rule', body); } catch (error) { return json({ error: error.message }, 400); }
      if (await TelegramDestination.countDocuments({ _id: { $in: input.destinations } }) !== input.destinations.length) return json({ error: 'Один із каналів більше не існує.' }, 400);
      await TelegramRule.updateOne({ event: input.event }, { $set: input }, { upsert: true, runValidators: true });
      return json({ success: true });
    }
    if (body.action === 'process_queue') return json({ success: true, ...await processTelegramQueue() });
    if (!validId(body.id)) return json({ error: 'Некоректний запис.' }, 400);
    if (body.action === 'check_bot') return json({ success: true, ...await checkTelegramBot(body.id) });
    if (body.action === 'check_destination') return json({ success: true, ...await checkTelegramDestination(body.id) });
    if (body.action === 'test_destination') {
      const result = await testTelegramDestination(body.id);
      return result.sent ? json({ success: true }) : json({ error: result.error || 'Повідомлення ще обробляється.' }, 502);
    }
    if (body.action === 'retry_delivery') {
      if (!await TelegramDelivery.exists({ _id: body.id })) return json({ error: 'Повідомлення не знайдено.' }, 404);
      const result = await deliverTelegramNotification(body.id);
      return result.sent ? json({ success: true }) : json({ error: result.error || 'Уже надіслано, обробляється або ще діє пауза перед повтором.' }, 409);
    }
    return json({ error: 'Невідома дія.' }, 400);
  } catch (error) {
    return json({ error: safeTelegramError(error) }, 502);
  }
}
