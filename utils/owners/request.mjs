export const ATTRIBUTION_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'gclid', 'gbraid', 'wbraid'];
export const READINESS_LABELS = { soon: 'До місяця', q1: 'За 1–3 місяці', q2: 'За 3–6 місяців', later: 'Пізніше', unknown: 'Поки придивляюся' };
export const CONTACT_LABELS = { phone: 'Телефонний дзвінок', telegram: 'Telegram', viber: 'Viber' };

const clean = (value, max) => typeof value === 'string' ? value.replace(/[\u0000-\u001f\u007f]/g, ' ').trim().slice(0, max) : '';

// A bounded, per-instance burst limiter complements the persistent phone cooldown.
export function createOwnerRequestLimiter({ limit = 8, windowMs = 15 * 60 * 1000, maxEntries = 2000 } = {}) {
  const attempts = new Map();
  return (key, now = Date.now()) => {
    let entry = attempts.get(key);
    if (!entry || entry.until <= now) {
      attempts.delete(key);
      if (attempts.size >= maxEntries) attempts.delete(attempts.keys().next().value);
      entry = { count: 0, until: now + windowMs };
      attempts.set(key, entry);
    }
    entry.count += 1;
    return entry.count <= limit;
  };
}

export function normalizeOwnerPhone(value) {
  if (typeof value !== 'string' || /[^\d\s()+-]/.test(value)) return '';
  let digits = value.replace(/\D/g, '');
  if (/^0\d{9}$/.test(digits)) digits = `38${digits}`;
  if (!/^380\d{9}$/.test(digits)) return '';
  return `+${digits}`;
}

export function validateOwnerRequest(body) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) return { error: 'Перевірте дані форми.' };
  if (clean(body.website, 200)) return { error: 'Не вдалося надіслати заявку. Зателефонуйте нам.' };
  const name = clean(body.name, 80);
  const location = clean(body.location, 180);
  const phone = normalizeOwnerPhone(body.phone);
  const rooms = clean(body.rooms, 20);
  const readiness = clean(body.readiness, 20);
  const contact = clean(body.contact, 20);
  const area = body.area === '' || body.area == null ? null : Number(body.area);
  if (location.length < 3) return { error: 'Вкажіть район або вулицю квартири.' };
  if (!['1', '2', '3', '4+'].includes(rooms)) return { error: 'Оберіть кількість кімнат.' };
  if (area !== null && (!Number.isFinite(area) || area < 10 || area > 2000)) return { error: 'Перевірте площу квартири: від 10 до 2000 м².' };
  if (!Object.hasOwn(READINESS_LABELS, readiness)) return { error: 'Оберіть орієнтовний строк продажу.' };
  if (name.length < 2) return { error: 'Вкажіть ваше ім’я.' };
  if (!phone) return { error: 'Вкажіть український номер у форматі +380 або 0XX XXX XX XX.' };
  if (!Object.hasOwn(CONTACT_LABELS, contact)) return { error: 'Оберіть зручний спосіб зв’язку.' };
  if (body.consent !== true) return { error: 'Потрібна згода на обробку даних для підготовки розбору.' };
  const attribution = {};
  for (const key of ATTRIBUTION_KEYS) {
    const value = clean(body.attribution?.[key], 250);
    if (value) attribution[key] = value;
  }
  return { data: { name, location, phone, rooms, area, readiness, contact, attribution } };
}

export function ownerRequestToNavodka(data) {
  const details = [
    'Запит на безкоштовний персональний розбір квартири з /owners.',
    `Кімнат: ${data.rooms}${data.area ? ` · Площа: ${data.area} м²` : ''}`,
    `Строк продажу: ${READINESS_LABELS[data.readiness]}`,
    `Зручний зв’язок: ${CONTACT_LABELS[data.contact]}`,
    'Згода на обробку контактних даних для відповіді на запит: отримана.',
    ...Object.entries(data.attribution).map(([key, value]) => `${key}: ${value}`),
  ];
  return {
    title: `Розбір квартири · ${data.location}`,
    ownerName: data.name,
    phone: data.phone,
    source: 'Сайт /owners',
    propertyType: 'Квартира',
    locationText: data.location,
    status: 'active',
    readiness: data.readiness,
    description: details.join('\n'),
    nextContactAt: new Date(),
  };
}
