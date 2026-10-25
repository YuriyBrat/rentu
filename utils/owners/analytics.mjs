// Only fixed event names and fixed placement values may reach analytics.
export const OWNERS_EVENTS = new Set(['owners_view', 'owners_cta_click', 'owners_form_start', 'owners_step_2', 'owners_submit_success', 'owners_phone_click']);
const placements = new Set(['hero', 'header', 'mobile_menu', 'mobile_sticky', 'analysis', 'strategy', 'perspective', 'request', 'faq', 'footer', 'other']);
const canonical = 'https://karamax.com.ua/owners';
export const ownersAnalyticsConfig = {
  ga4: process.env.NEXT_PUBLIC_OWNERS_GA4_ID || '',
  ads: process.env.NEXT_PUBLIC_OWNERS_GOOGLE_ADS_ID || '',
  adsLabel: process.env.NEXT_PUBLIC_OWNERS_GOOGLE_ADS_LABEL || '',
  meta: process.env.NEXT_PUBLIC_OWNERS_META_PIXEL_ID || '',
};

function scriptOnce(win, id, src) {
  if (win.document.getElementById(id) || [...win.document.scripts].some(script => script.src === src)) return;
  const script = win.document.createElement('script');
  script.id = id;
  script.async = true;
  script.src = src;
  win.document.head.appendChild(script);
}

function configure(win, consent, config) {
  const state = win.__karamaxOwnersTags ||= { google: new Set(), meta: new Set(), started: false };
  const ga4 = /^G-[A-Z0-9]+$/.test(config.ga4) ? config.ga4 : '';
  const ads = /^AW-\d+$/.test(config.ads) ? config.ads : '';
  const meta = /^\d+$/.test(config.meta) ? config.meta : '';
  if ((ga4 && consent.analytics) || (ads && consent.ads) || state.started) {
    win.dataLayer ||= [];
    win.gtag ||= function () { win.dataLayer.push(arguments); };
    if (!state.started) {
      win.gtag('consent', 'default', { analytics_storage: 'denied', ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied' });
      win.gtag('js', new Date());
      state.started = true;
    }
    win.gtag('consent', 'update', { analytics_storage: consent.analytics ? 'granted' : 'denied', ad_storage: consent.ads ? 'granted' : 'denied', ad_user_data: consent.ads ? 'granted' : 'denied', ad_personalization: 'denied' });
    win.gtag('set', { page_location: canonical, page_referrer: '', page_title: 'KARAMAX — розбір квартири у Львові', ads_data_redaction: true, allow_google_signals: false, allow_ad_personalization_signals: false });
    for (const id of [consent.analytics && ga4, consent.ads && ads].filter(Boolean)) {
      if (!state.google.has(id)) {
        win.gtag('config', id, { send_page_view: false, page_location: canonical, page_referrer: '', allow_enhanced_conversions: false });
        state.google.add(id);
      }
      // Reuse an existing Google tag loader; never inject a second one.
      if (![...win.document.scripts].some(script => script.src.startsWith('https://www.googletagmanager.com/gtag/js'))) scriptOnce(win, 'owners-google-tag', `https://www.googletagmanager.com/gtag/js?id=${id}`);
    }
  }
  if (consent.ads && meta) {
    if (!win.fbq) {
      const fbq = function () { fbq.callMethod ? fbq.callMethod.apply(fbq, arguments) : fbq.queue.push(arguments); };
      fbq.queue = []; fbq.loaded = true; fbq.version = '2.0'; fbq.push = fbq;
      win.fbq = fbq; win._fbq ||= fbq;
    }
    win.fbq('consent', 'grant');
    if (!state.meta.has(meta)) {
      win.fbq('set', 'autoConfig', false, meta);
      win.fbq('init', meta);
      state.meta.add(meta);
    }
    scriptOnce(win, 'owners-meta-pixel', 'https://connect.facebook.net/en_US/fbevents.js');
  } else if (win.fbq && state.meta.size) win.fbq('consent', 'revoke');
  return { ga4, ads, meta };
}

export function createOwnersAnalytics(win, config = ownersAnalyticsConfig) {
  let consent = { analytics: false, ads: false };
  const sentAnalytics = new Set(), sentAds = new Set();
  function event(name, placement = 'other', onceKey) {
    if (!OWNERS_EVENTS.has(name)) return;
    const params = { form_location: 'owners', placement: placements.has(placement) ? placement : 'other' };
    const key = onceKey ? `${name}:${onceKey}` : null;
    const ids = configure(win, consent, config);
    if (consent.analytics && (!key || !sentAnalytics.has(key))) {
      if (key) sentAnalytics.add(key);
      win.dataLayer ||= [];
      win.dataLayer.push({ event: name, ...params });
      if (ids.ga4) win.gtag('event', name, { ...params, send_to: ids.ga4, page_location: canonical, page_referrer: '' });
      // Preserve the original integration hook. Do not configure it as a second conversion.
      if (name === 'owners_submit_success') win.dataLayer.push({ event: 'owner_analysis_request', form_location: 'owners' });
    }
    if (consent.ads && (!key || !sentAds.has(key))) {
      if (key) sentAds.add(key);
      if (ids.meta) win.fbq('trackSingleCustom', ids.meta, name, params);
      if (name === 'owners_submit_success' && ids.ads && /^[A-Za-z0-9_-]+$/.test(config.adsLabel)) win.gtag('event', 'conversion', { send_to: `${ids.ads}/${config.adsLabel}`, page_location: canonical, page_referrer: '' });
    }
  }
  return {
    setConsent(next) {
      consent = { analytics: next.analytics === true, ads: next.ads === true };
      configure(win, consent, config);
      event('owners_view', 'other', 'view');
    },
    event,
  };
}
