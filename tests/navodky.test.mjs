import test from 'node:test';
import assert from 'node:assert/strict';
import { buildNavodkaQuery, kyivDayStart, navodkaPermissions, navodkaScopeFilter, redactNavodkaPhones, serializeNavodka, validateNavodkaBody, isNavodkaOriginAllowed } from '../utils/crm/navodky.mjs';

const actor = { role: 'realtor', employeeId: '111111111111111111111111' };
const report = '222222222222222222222222', stranger = '333333333333333333333333';
const scope = [actor.employeeId, report];
const lead = { _id: 'aaaaaaaaaaaaaaaaaaaaaaaa', title: 'Звернення +380 (67) 111-22-33', phone: '+380671112233', ownerName: 'Власник', source: 'Сайт /owners', description: 'Зателефонувати 0671112233', assignedTo: { _id: stranger, name: 'Інша команда', phone: 'private', email: 'private@example.com' }, createdBy: null, notes: [{ _id: 'note', text: 'Другий номер 0671112233' }], futurePrivateField: { phone: 'private' } };

test('same-origin requests work over localhost aliases/LAN while cross-site origins stay blocked', () => {
  const request = { requestOrigin: 'http://localhost:3012', host: '127.0.0.1:3012' };
  assert.equal(isNavodkaOriginAllowed('http://127.0.0.1:3012', request), true);
  assert.equal(isNavodkaOriginAllowed('http://192.168.1.5:3000', { ...request, host: '192.168.1.5:3000' }), true);
  for (const origin of ['https://invalid.example', 'null', 'javascript:alert(1)', 'http://127.0.0.1:3012/evil']) assert.equal(isNavodkaOriginAllowed(origin, request), false);
});

test('phone/write/delete access follows self and descendants, with owner/admin access to unassigned leads', () => {
  for (const owner of [actor.employeeId, report]) assert.equal(navodkaPermissions(actor, scope, { assignedTo: { _id: owner } }).canViewPhone, true);
  assert.equal(navodkaPermissions(actor, scope, { createdBy: report }).canEdit, true);
  assert.deepEqual(navodkaPermissions(actor, scope, lead), { canViewPhone: false, canEdit: false, canDelete: false });
  assert.equal(navodkaPermissions(actor, scope, {}).canViewPhone, false);
  for (const role of ['owner', 'admin']) assert.equal(navodkaPermissions({ role }, [], {}).canDelete, true);
  assert.equal(navodkaPermissions({ role: 'viewer' }, scope, { assignedTo: report }).canViewPhone, true);
  assert.equal(navodkaPermissions({ role: 'viewer' }, scope, { assignedTo: report }).canDelete, false);
  assert.deepEqual(navodkaScopeFilter(actor, []), { _id: null });
});

test('foreign contacts never leak in metadata, descriptions, notes, embedded employee fields or future fields', () => {
  const output = serializeNavodka(lead, actor, scope);
  assert.equal(output.phone, '');
  assert.equal(output.description, '');
  assert.deepEqual(output.notes, []);
  assert.equal(output.phoneHidden, true);
  assert.ok(!JSON.stringify(output).includes('1112233'));
  assert.ok(!JSON.stringify(output).includes('private'));
  assert.equal(output.futurePrivateField, undefined);
  assert.equal(serializeNavodka({ ...lead, assignedTo: report }, actor, scope).phone, lead.phone);
  for (const phone of ['+380671112233', '+380 (67) 111-22-33', '067 111 22 33', '0671112233']) assert.ok(!redactNavodkaPhones('Контакт: ' + phone, lead.phone).includes('2233'));
});

test('newest updated is the default, newest created and upcoming contact are explicit options', () => {
  assert.deepEqual(buildNavodkaQuery(new URLSearchParams()).sort, { updatedAt: -1, createdAt: -1, _id: -1 });
  assert.deepEqual(buildNavodkaQuery(new URLSearchParams({ sort: 'createdAt' })).sort, { createdAt: -1, _id: -1 });
  assert.throws(() => buildNavodkaQuery(new URLSearchParams({ sort: '__proto__' })));
  const query = buildNavodkaQuery(new URLSearchParams({ q: '(test).*', page: 'NaN', pageSize: '999', source: 'Сайт /owners', assignedTo: report, readiness: 'q1' }));
  assert.equal(query.page, 1); assert.equal(query.pageSize, 100);
  assert.equal(query.filter.$or[0].title.$regex, '\\(test\\)\\.\\*');
  assert.equal(query.filter.source, 'Сайт /owners');
  assert.equal(query.filter.assignedTo, report);
});

test('inclusive Kyiv date ranges cross summer/winter DST correctly without relying on server timezone', () => {
  assert.equal(kyivDayStart('2026-10-24').toISOString(), '2026-10-23T21:00:00.000Z');
  assert.equal(kyivDayStart('2026-10-26').toISOString(), '2026-10-25T22:00:00.000Z');
  const result = buildNavodkaQuery(new URLSearchParams({ period: 'custom', from: '2026-10-25', to: '2026-10-25', dateField: 'createdAt' }));
  assert.equal(result.filter.createdAt.$gte.toISOString(), '2026-10-24T21:00:00.000Z');
  assert.equal(result.filter.createdAt.$lt.toISOString(), '2026-10-25T22:00:00.000Z');
  assert.throws(() => buildNavodkaQuery(new URLSearchParams({ period: 'custom', from: '2026-11-01', to: '2026-10-01' })));
  assert.throws(() => buildNavodkaQuery(new URLSearchParams({ period: 'custom', to: '2026-02-30' })));
});

test('today/7d filters include the Kyiv calendar day and overdue excludes unscheduled records', () => {
  const query = buildNavodkaQuery(new URLSearchParams({ period: '7d', contactFilter: 'overdue' }), new Date('2026-10-23T22:00:00Z'));
  assert.equal(query.filter.updatedAt.$gte.toISOString(), '2026-10-17T21:00:00.000Z');
  assert.equal(query.filter.updatedAt.$lt.toISOString(), '2026-10-24T21:00:00.000Z');
  assert.equal(query.filter.nextContactAt.$ne, null);
});

test('mutation validation rejects objects, invalid assignments/enums/dates and keeps actor-owned fields out', () => {
  const data = { title: 'Тест', ownerName: 'Тест', phone: '0671112233' };
  const valid = validateNavodkaBody({ ...data, createdBy: stranger, canViewPhone: true, updatedAt: '2099-01-01', unknown: 'discard' });
  for (const key of ['createdBy', 'canViewPhone', 'updatedAt', 'unknown']) assert.equal(valid[key], undefined);
  for (const patch of [{ phone: { $ne: null } }, { assignedTo: { $ne: null } }, { title: ' ' }, { status: '__proto__' }, { lastContactAt: 'invalid' }, { newNote: { text: 'hello', activityType: 'bad' } }]) assert.throws(() => validateNavodkaBody({ ...data, ...patch }));
  assert.deepEqual(validateNavodkaBody({ source: 'Рекомендація' }, { partial: true }), { source: 'Рекомендація' });
});
