import { ATTRIBUTION_KEYS } from './request.mjs';

const CACHE_KEY = 'karamax_owners_first_touch_v2';
const DAY = 86400000;
const utmKeys = ATTRIBUTION_KEYS.filter(key => key.startsWith('utm_'));
export const CONSENT_KEY = 'karamax_owners_privacy_v1';

export function readOwnersConsent(storage) {
  try {
    const saved = JSON.parse(storage.getItem(CONSENT_KEY));
    if (saved?.at > Date.now() - 180 * DAY) return { analytics: saved.analytics === true, ads: saved.ads === true, decided: true };
  } catch { /* Storage may be disabled. */ }
  return { analytics: false, ads: false, decided: false };
}

export function createOwnersAttribution(href, storage, now = Date.now()) {
  const url = new URL(href);
  const current = { landing_page: `${url.origin}${url.pathname}` };
  for (const key of ATTRIBUTION_KEYS) {
    const value = url.searchParams.get(key)?.trim().slice(0, 250);
    if (value) current[key] = value;
  }
  let first = null;
  try {
    const cached = JSON.parse(storage.getItem(CACHE_KEY));
    if (cached?.at > now - DAY && cached.values && typeof cached.values === 'object') first = cached.values;
  } catch { /* In-memory attribution still works without storage. */ }
  const source = first || current;
  return consent => {
    // A page address without query/fragment is operational context for the request.
    // Optional acquisition data is stored/sent only after the corresponding choice.
    const allowed = consent.ads ? ATTRIBUTION_KEYS : consent.analytics ? utmKeys : [];
    const values = { landing_page: source.landing_page || current.landing_page };
    for (const key of allowed) {
      const value = source[key];
      if (typeof value === 'string' && value) values[key] = value.slice(0, 250);
    }
    try {
      storage.removeItem('karamax_owner_attribution'); // Retire the old unconsented cache.
      if (allowed.length) {
        storage.setItem(CACHE_KEY, JSON.stringify({ values, at: now }));
      } else { storage.removeItem(CACHE_KEY); }
    } catch { /* A disabled storage must not block a lead. */ }
    return values;
  };
}
