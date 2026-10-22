import { NextResponse } from 'next/server';
import { createHash } from 'node:crypto';
import mongoose from 'mongoose';
import connectDB from '@/config/database';
import Navodka from '@/models/Navodka';
import { notifyOwnerRequest } from '@/utils/telegram/service';
import { createOwnerRequestLimiter, ownerRequestToNavodka, validateOwnerRequest } from '@/utils/owners/request.mjs';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const json = (body, status, extraHeaders = {}) => NextResponse.json(body, { status, headers: { 'Cache-Control': 'no-store', ...extraHeaders } });
const allowRequest = createOwnerRequestLimiter();

export async function POST(request) {
  const origin = request.headers.get('origin');
  const allowedOrigins = new Set([request.nextUrl.origin, 'https://karamax.com.ua', 'https://www.karamax.com.ua']);
  if (origin && !allowedOrigins.has(origin)) return json({ error: 'Запит із цього сайту не дозволений.' }, 403);
  if (!request.headers.get('content-type')?.includes('application/json')) return json({ error: 'Некоректний формат запиту.' }, 415);
  if (Number(request.headers.get('content-length')) > 8192) return json({ error: 'Завеликий запит.' }, 413);

  let body;
  try {
    // Bound the stream even when a caller omits Content-Length.
    const reader = request.body?.getReader();
    if (!reader) return json({ error: 'Заповніть форму.' }, 400);
    const chunks = [];
    let length = 0;
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      length += value.byteLength;
      if (length > 8192) {
        await reader.cancel();
        return json({ error: 'Завеликий запит.' }, 413);
      }
      chunks.push(value);
    }
    body = JSON.parse(Buffer.concat(chunks).toString('utf8'));
  } catch {
    return json({ error: 'Не вдалося прочитати дані форми.' }, 400);
  }

  const result = validateOwnerRequest(body);
  if (result.error) return json({ error: result.error }, 400);
  const address = (request.headers.get('x-forwarded-for')?.split(',')[0] || request.headers.get('x-real-ip') || 'unknown').trim().slice(0, 64);
  if (!allowRequest(createHash('sha256').update(address).digest('hex'))) {
    return json({ error: 'Забагато спроб. Спробуйте через 15 хвилин або зателефонуйте нам.' }, 429, { 'Retry-After': '900' });
  }
  if (!process.env.MONGODB_URI) return json({ error: 'Форма тимчасово недоступна. Зателефонуйте: 067 985 09 11.' }, 503);

  try {
    await connectDB();
    if (mongoose.connection.readyState !== 1) return json({ error: 'Не вдалося зберегти заявку. Спробуйте пізніше або зателефонуйте нам.' }, 503);

    // Persistent phone-based cooldown also applies across server instances.
    const recent = await Navodka.exists({
      phone: result.data.phone,
      source: 'Сайт /owners',
      createdAt: { $gte: new Date(Date.now() - 15 * 60 * 1000) },
    });
    if (recent) return json({ error: 'Заявка з цим номером уже отримана. Повторно надіслати її можна через 15 хвилин.' }, 429, { 'Retry-After': '900' });

    const lead = await Navodka.create({ ...ownerRequestToNavodka(result.data), telegramNotificationRequestedAt: new Date() });
    try {
      await notifyOwnerRequest(lead);
    } catch {
      // The lead remains saved; its requested/queued timestamps allow recovery.
      console.error('Owner request saved; Telegram notification awaits recovery.');
    }
    return json({ success: true }, 201);
  } catch (error) {
    // Do not write submitted contacts or database connection details into logs.
    console.error('Owner request could not be saved:', error?.name || 'UnknownError');
    return json({ error: 'Не вдалося зберегти заявку. Спробуйте ще раз або зателефонуйте: 067 985 09 11.' }, 500);
  }
}
