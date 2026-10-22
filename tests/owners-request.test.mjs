import test from 'node:test';
import assert from 'node:assert/strict';
import { createOwnerRequestLimiter, normalizeOwnerPhone, ownerRequestToNavodka, validateOwnerRequest } from '../utils/owners/request.mjs';

const request = {
  location: 'Франківський район', rooms: '2', area: '64.5', readiness: 'q1',
  name: 'Олена', phone: '(067) 985-09-11', contact: 'telegram', consent: true, website: '',
  attribution: { utm_source: 'google', utm_medium: 'cpc', gclid: 'example-click', arbitrary: 'discard' },
};

test('a seller request becomes an actionable CRM record with attribution and consent', () => {
  const { data, error } = validateOwnerRequest(request);
  assert.equal(error, undefined);
  const lead = ownerRequestToNavodka(data);
  assert.equal(lead.phone, '+380679850911');
  assert.equal(lead.ownerName, 'Олена');
  assert.equal(lead.readiness, 'q1');
  assert.equal(lead.status, 'active');
  assert.equal(lead.source, 'Сайт /owners');
  assert.equal(lead.propertyType, 'Квартира');
  assert.match(lead.description, /64.5 м²/);
  assert.match(lead.description, /Telegram/);
  assert.match(lead.description, /gclid: example-click/);
  assert.match(lead.description, /Згода.*отримана/);
  assert.ok(!lead.description.includes('arbitrary'));
  assert.ok(lead.nextContactAt instanceof Date);
});

test('optional area and absent attribution do not prevent an exploratory request', () => {
  const { data } = validateOwnerRequest({ ...request, area: '', readiness: 'unknown', attribution: undefined });
  assert.equal(data.area, null);
  assert.deepEqual(data.attribution, {});
  assert.ok(!ownerRequestToNavodka(data).description.includes('Площа:'));
});

test('invalid contact, consent, area, and forged choices are rejected before storage', () => {
  for (const patch of [
    { phone: '+38012' }, { phone: 'email@example.com' }, { phone: '+480679850911' },
    { consent: false }, { consent: 'true' }, { website: 'https://spam.test' },
    { area: '-20' }, { area: 'Infinity' }, { area: 'hello' },
    { location: { $ne: null } }, { name: '' }, { rooms: '99' },
    { readiness: 'toString' }, { contact: 'constructor' },
  ]) {
    const result = validateOwnerRequest({ ...request, ...patch });
    assert.ok(result.error, `Expected rejection for ${JSON.stringify(patch)}`);
    assert.equal(result.data, undefined);
  }
});

test('Ukrainian phone input normalizes while malformed input stays invalid', () => {
  assert.equal(normalizeOwnerPhone('067 985 09 11'), '+380679850911');
  assert.equal(normalizeOwnerPhone('+380 (67) 985-09-11'), '+380679850911');
  assert.equal(normalizeOwnerPhone('380679850911'), '+380679850911');
  for (const value of [null, {}, '0679850911<script>', '+3806798509111']) assert.equal(normalizeOwnerPhone(value), '');
});

test('untrusted strings and ad tags are bounded and control characters removed', () => {
  const { data } = validateOwnerRequest({ ...request, name: 'Олена\nТест', attribution: { gclid: 'x'.repeat(1000), utm_source: { $ne: null } } });
  assert.equal(data.name, 'Олена Тест');
  assert.equal(data.attribution.gclid.length, 250);
  assert.equal(data.attribution.utm_source, undefined);
});

test('a burst from one visitor is limited without blocking a different visitor, and expires', () => {
  const allow = createOwnerRequestLimiter({ limit: 2, windowMs: 1000 });
  assert.equal(allow('visitor-a', 0), true);
  assert.equal(allow('visitor-a', 1), true);
  assert.equal(allow('visitor-a', 2), false);
  assert.equal(allow('visitor-b', 2), true);
  assert.equal(allow('visitor-a', 1001), true);
});
