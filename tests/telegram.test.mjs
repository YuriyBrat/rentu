import test from 'node:test';
import assert from 'node:assert/strict';
import { telegramApi } from '../utils/telegram/api.mjs';
import { telegramConfigInput, ownerTelegramText, safeTelegramError } from '../utils/telegram/shared.mjs';

const botId = 'aaaaaaaaaaaaaaaaaaaaaaaa';

test('configuration accepts multiple destinations and rejects secrets masquerading as env names', () => {
  assert.deepEqual(telegramConfigInput('bot', { name: 'Основний', tokenEnv: 'TELEGRAM_BOT_TOKEN' }), { name: 'Основний', tokenEnv: 'TELEGRAM_BOT_TOKEN', enabled: true });
  assert.throws(() => telegramConfigInput('bot', { name: 'Bot', tokenEnv: 'NEXTAUTH_SECRET' }));
  assert.throws(() => telegramConfigInput('bot', { name: 'Bot', tokenEnv: '123456:actualtoken' }));
  assert.deepEqual(telegramConfigInput('rule', { event: 'owner_request', destinations: [botId, botId] }).destinations, [botId]);
  assert.throws(() => telegramConfigInput('rule', { event: 'owner_request', destinations: [], enabled: true }));
  assert.equal(telegramConfigInput('rule', { event: 'owner_request', destinations: [], enabled: false }).enabled, false);
  assert.throws(() => telegramConfigInput('rule', { event: 'unknown', destinations: [botId] }));
});

test('destination input validates bot references, chat IDs and topic IDs', () => {
  const valid = { name: 'Заявки', bot: botId, chatId: '-1001234567890', threadId: '12' };
  assert.equal(telegramConfigInput('destination', valid).threadId, 12);
  assert.equal(telegramConfigInput('destination', { ...valid, chatId: '@karamax_channel', threadId: '' }).threadId, null);
  for (const patch of [{ chatId: 'https://example.com' }, { bot: { $ne: null } }, { threadId: -3 }, { threadId: 'abc' }, { threadId: 1.2 }]) {
    assert.throws(() => telegramConfigInput('destination', { ...valid, ...patch }));
  }
});

test('owner notification has contact, property, readable details and a trusted CRM link', () => {
  const text = ownerTelegramText({ _id: botId, ownerName: 'Олег', phone: '+380671234567', locationText: 'Львів, Сихів', description: 'Кімнат: 2\nСтрок продажу: До місяця\nЗручний зв’язок: Viber' }, 'https://karamax.com.ua');
  for (const fragment of ['Олег', '+380671234567', 'Сихів', 'Кімнат: 2', 'Viber', '/crm/navodky4?q=%2B380671234567']) assert.ok(text.includes(fragment));
  assert.ok(!ownerTelegramText({}, 'javascript:alert(1)').includes('CRM:'));
  assert.ok(ownerTelegramText({ description: 'x'.repeat(10000) }).length <= 4000);
});

test('transport uses JSON with intact Ukrainian text and no formatting injection', async () => {
  let captured;
  const result = await telegramApi('123456:FAKE_TEST_TOKEN', 'sendMessage', { chat_id: '-123', text: 'Ім’я: Олег & <тест>\nКвартира у Львові' }, {
    fetchImpl: async (url, options) => { captured = { url, options }; return { ok: true, json: async () => ({ ok: true, result: { message_id: 42 } }) }; },
  });
  assert.equal(result.message_id, 42);
  assert.equal(captured.options.method, 'POST');
  assert.equal(new URL(captured.url).search, '');
  assert.equal(JSON.parse(captured.options.body).text, 'Ім’я: Олег & <тест>\nКвартира у Львові');
  assert.equal(JSON.parse(captured.options.body).parse_mode, undefined);
});

test('Telegram errors preserve retry/migration metadata without exposing tokens or raw responses', async () => {
  let error;
  try { await telegramApi('123456:FAKE_TEST_TOKEN', 'sendMessage', {}, { fetchImpl: async () => ({ ok: false, status: 429, json: async () => ({ ok: false, error_code: 429, description: 'raw secret text', parameters: { retry_after: 19, migrate_to_chat_id: -1001234567890 } }) }) }); } catch (err) { error = err; }
  assert.equal(error.retryAfter, 19);
  assert.equal(error.migrateTo, '-1001234567890');
  assert.ok(!error.message.includes('secret'));
  assert.ok(!safeTelegramError(error).includes('FAKE_TEST_TOKEN'));
  await assert.rejects(telegramApi('123456:FAKE_TEST_TOKEN', 'sendMessage', {}, { fetchImpl: async () => { throw new Error('https://api.telegram.org/bot123456:FAKE_TEST_TOKEN/sendMessage'); } }), err => !err.message.includes('FAKE_TEST_TOKEN'));
});

test('invalid bot tokens and unapproved API methods never produce a network request', async () => {
  let calls = 0;
  const options = { fetchImpl: async () => { calls++; } };
  await assert.rejects(telegramApi('', 'getMe', {}, options));
  await assert.rejects(telegramApi('123456:FAKE_TEST_TOKEN', 'deleteWebhook', {}, options));
  assert.equal(calls, 0);
});
