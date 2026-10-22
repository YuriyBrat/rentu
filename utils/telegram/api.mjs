export async function telegramApi(token, method, body = {}, { fetchImpl = fetch, timeoutMs = 6000 } = {}) {
  if (!token || !/^\d+:[A-Za-z0-9_-]+$/.test(token)) throw new Error('BOT_NOT_CONFIGURED');
  if (!['getMe', 'getChat', 'sendMessage'].includes(method)) throw new Error('UNKNOWN_TELEGRAM_METHOD');
  let response;
  try {
    response = await fetchImpl(`https://api.telegram.org/bot${token}/${method}`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body), signal: AbortSignal.timeout(timeoutMs),
    });
  } catch (cause) {
    // Never propagate a fetch error containing a URL with the bot token.
    const error = new Error('TELEGRAM_NETWORK_ERROR');
    error.name = ['TimeoutError', 'AbortError'].includes(cause?.name) ? cause.name : 'TelegramError';
    throw error;
  }
  let data;
  try { data = await response.json(); } catch { throw new Error('TELEGRAM_INVALID_RESPONSE'); }
  if (!response.ok || data.ok !== true) {
    const error = new Error('TELEGRAM_API_ERROR');
    error.code = data.error_code || response.status;
    error.retryAfter = Number(data.parameters?.retry_after) || 0;
    error.migrateTo = data.parameters?.migrate_to_chat_id ? String(data.parameters.migrate_to_chat_id) : '';
    throw error;
  }
  return data.result;
}
