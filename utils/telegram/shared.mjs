export const TELEGRAM_EVENTS = [{ key: 'owner_request', label: 'Заявка власника з /owners' }];
export const TOKEN_ENV_PATTERN = /^TELEGRAM_[A-Z0-9_]*TOKEN$/;
export const CHAT_ID_PATTERN = /^(?:-?[1-9]\d{0,18}|@[A-Za-z][A-Za-z0-9_]{4,31})$/;
export const OBJECT_ID_PATTERN = /^[a-f\d]{24}$/i;

export function telegramConfigInput(kind, input) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Перевірте налаштування.');
  const name = typeof input.name === 'string' ? input.name.trim().slice(0, 100) : '';
  if (kind === 'bot') {
    const tokenEnv = typeof input.tokenEnv === 'string' ? input.tokenEnv.trim() : '';
    if (name.length < 2) throw new Error('Вкажіть назву бота.');
    if (!TOKEN_ENV_PATTERN.test(tokenEnv)) throw new Error('Назва серверної змінної має починатися з TELEGRAM_ і закінчуватися на TOKEN.');
    return { name, tokenEnv, enabled: input.enabled !== false };
  }
  if (kind === 'destination') {
    const chatId = typeof input.chatId === 'string' ? input.chatId.trim() : '';
    const bot = typeof input.bot === 'string' ? input.bot : '';
    const threadId = input.threadId === '' || input.threadId == null ? null : Number(input.threadId);
    if (name.length < 2) throw new Error('Вкажіть назву групи або каналу.');
    if (!CHAT_ID_PATTERN.test(chatId)) throw new Error('Вкажіть коректний ID чату або @username каналу.');
    if (!OBJECT_ID_PATTERN.test(bot)) throw new Error('Оберіть бота.');
    if (threadId !== null && (!Number.isSafeInteger(threadId) || threadId <= 0)) throw new Error('ID теми має бути додатним цілим числом.');
    return { name, chatId, bot, threadId, enabled: input.enabled !== false };
  }
  if (kind === 'rule') {
    if (!TELEGRAM_EVENTS.some(event => event.key === input.event)) throw new Error('Невідомий тип події.');
    const destinations = [...new Set(Array.isArray(input.destinations) ? input.destinations : [])];
    if (destinations.length > 20 || destinations.some(id => typeof id !== 'string' || !OBJECT_ID_PATTERN.test(id))) throw new Error('Перевірте обрані канали.');
    if (input.enabled !== false && !destinations.length) throw new Error('Оберіть хоча б один канал або вимкніть правило.');
    return { event: input.event, enabled: input.enabled !== false, destinations };
  }
  throw new Error('Невідомий тип налаштування.');
}

export function ownerTelegramText(lead, baseUrl = '') {
  const short = (value, limit) => String(value || '').replace(/[\u0000-\u001f\u007f]/g, ' ').trim().slice(0, limit);
  const lines = [
    '🏠 Нова заявка власника · KARAMAX',
    '',
    `Ім’я: ${short(lead.ownerName, 100)}`,
    `Телефон: ${short(lead.phone, 30)}`,
    `Квартира: ${short(lead.locationText, 200)}`,
    '',
    String(lead.description || '').slice(0, 2400),
    '',
    `Заявка № ${lead._id}`,
  ];
  try {
    const url = new URL(baseUrl);
    if (url.protocol === 'https:') lines.push(`CRM: ${url.origin}/crm/navodky4?q=${encodeURIComponent(lead.phone || '')}`);
  } catch { /* Notification is still useful without a configured public CRM URL. */ }
  return lines.join('\n').slice(0, 4000);
}

export function safeTelegramError(error) {
  if (error?.name === 'TimeoutError' || error?.name === 'AbortError') return 'Telegram не підтвердив надсилання вчасно. Перевірте групу перед повтором.';
  if (error?.code === 401) return 'Telegram відхилив токен бота. Перевірте серверні налаштування.';
  if (error?.code === 403) return 'Бот не має доступу до чату або права надсилати повідомлення.';
  if (error?.code === 429) return 'Telegram обмежив частоту запитів. Повторіть пізніше.';
  if (error?.code === 400) return 'Telegram не прийняв запит. Перевірте ID чату, тему та права бота.';
  if (error?.message === 'BOT_NOT_CONFIGURED') return 'Токен бота відсутній у серверних налаштуваннях.';
  if (error?.message === 'DESTINATION_DISABLED') return 'Канал або його бот вимкнений.';
  return 'Не вдалося зв’язатися з Telegram. Можна повторити надсилання.';
}
