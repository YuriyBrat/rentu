import test from 'node:test';
import assert from 'node:assert/strict';
import { createOwnersAnalytics } from '../utils/owners/analytics.mjs';
import { createOwnersAttribution } from '../utils/owners/attribution.mjs';
import { ownerRequestToNavodka, validateOwnerRequest } from '../utils/owners/request.mjs';

function storage() {
  const values = new Map();
  return { getItem: key => values.get(key) || null, setItem: (key, value) => values.set(key, value), removeItem: key => values.delete(key), values };
}
function browser() {
  const scripts = [];
  return { document: { scripts, getElementById: id => scripts.find(script => script.id === id), createElement: () => ({}), head: { appendChild: script => scripts.push(script) } } };
}
const config = { ga4: 'G-TEST123', ads: 'AW-123456', adsLabel: 'test-label', meta: '123456' };

test('optional tracking and acquisition storage remain off until permission', () => {
  const win = browser(), store = storage();
  const tracker = createOwnersAnalytics(win, config);
  tracker.setConsent({});
  tracker.event('owners_submit_success', 'request', 'form');
  assert.equal(win.document.scripts.length, 0);
  assert.equal(win.dataLayer, undefined);
  const read = createOwnersAttribution('https://karamax.com.ua/owners?utm_source=google&gclid=secret&email=private#name', store);
  assert.deepEqual(read({}), { landing_page: 'https://karamax.com.ua/owners' });
  assert.equal(store.values.size, 0);
});

test('first touch survives empty navigation and a later campaign without mixing sources', () => {
  const store = storage();
  const first = createOwnersAttribution('https://karamax.com.ua/owners?utm_source=google&gclid=first&fbclid=fb-first', store, 1000);
  first({ ads: true });
  const empty = createOwnersAttribution('https://karamax.com.ua/owners', store, 1001);
  assert.equal(empty({ ads: true }).gclid, 'first');
  const later = createOwnersAttribution('https://karamax.com.ua/owners?utm_source=meta&utm_campaign=later&fbclid=second', store, 1002);
  assert.deepEqual(later({ ads: true }), { landing_page: 'https://karamax.com.ua/owners', utm_source: 'google', gclid: 'first', fbclid: 'fb-first' });
});

test('analytics-only excludes advertising identifiers and revocation purges storage', () => {
  const store = storage();
  const read = createOwnersAttribution('https://karamax.com.ua/owners?utm_source=google&gclid=first&fbclid=second', store);
  assert.deepEqual(read({ analytics: true }), { landing_page: 'https://karamax.com.ua/owners', utm_source: 'google' });
  assert.equal(read({ analytics: true, ads: true }).gclid, 'first');
  assert.deepEqual(read({}), { landing_page: 'https://karamax.com.ua/owners' });
  assert.equal(store.values.size, 0);
});

test('view, form milestones, and confirmed conversion deduplicate; events contain no inputs', () => {
  const win = browser(), tracker = createOwnersAnalytics(win, config);
  const consent = { analytics: true, ads: true };
  tracker.setConsent(consent); tracker.setConsent(consent);
  for (let i = 0; i < 2; i++) {
    tracker.event('owners_form_start', 'request', 'form');
    tracker.event('owners_step_2', 'request', 'form');
    tracker.event('owners_submit_success', 'request', 'form');
  }
  tracker.event('owners_phone_click', '+380679850911');
  tracker.event('forged', 'request');
  for (const event of ['owners_view', 'owners_form_start', 'owners_step_2', 'owners_submit_success', 'owner_analysis_request']) assert.equal(win.dataLayer.filter(item => item.event === event).length, 1);
  assert.equal(win.document.scripts.length, 2);
  const calls = win.dataLayer.filter(item => item[0] === 'event');
  assert.equal(calls.filter(item => item[1] === 'conversion').length, 1);
  assert.equal(win.fbq.queue.filter(item => item[0] === 'trackSingleCustom' && item[2] === 'owners_submit_success').length, 1);
  assert.ok(!JSON.stringify(win.dataLayer).includes('0679850911'));
  tracker.setConsent({});
  const count = calls.length;
  tracker.event('owners_cta_click', 'hero');
  assert.equal(win.dataLayer.filter(item => item[0] === 'event').length, count);
  assert.ok(win.fbq.queue.some(item => item[0] === 'consent' && item[1] === 'revoke'));
});

test('fbclid and sanitized landing context reach the existing CRM description', () => {
  const { data } = validateOwnerRequest({ location: 'Львів', rooms: '2', name: 'Тест', phone: '0679850911', readiness: 'unknown', contact: 'phone', consent: true, attribution: { fbclid: 'click', landing_page: 'https://karamax.com.ua/owners?phone=private#address' } });
  const lead = ownerRequestToNavodka(data);
  assert.match(lead.description, /fbclid: click/);
  assert.match(lead.description, /landing_page: https:\/\/karamax.com.ua\/owners/);
  assert.ok(!lead.description.includes('private'));
  assert.equal(lead.source, 'Сайт /owners');
});
