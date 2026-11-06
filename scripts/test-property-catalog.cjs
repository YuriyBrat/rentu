// Offline access-control regressions: node scripts/test-property-catalog.cjs
const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const { Types } = require('mongoose');
const swc = require('next/dist/build/swc');
const React = require('react');

function load(path, dependencies, exports) {
   const source = fs.readFileSync(path, 'utf8')
      .replace(/^import[\s\S]*?;\r?\n/gm, '')
      .replace(/export (async function|function|const)/g, '$1');
   return vm.runInNewContext(source + '\n;({' + exports.join(',') + '});', { console, Response, Date, ...dependencies }, { filename: path });
}
const own = '507f1f77bcf86cd799439011';
const other = '507f1f77bcf86cd799439012';
const subordinate = '507f1f77bcf86cd799439013';
const grandchild = '507f1f77bcf86cd799439014';
const superior = '507f1f77bcf86cd799439015';
const rows = Array.from({ length: 15 }, (_, index) => ({
   _id: new Types.ObjectId((index + 1).toString(16).padStart(24, '0')),
   title: `Об’єкт ${index}`, assignee: new Types.ObjectId(index ? other : own),
   createdByEmployee: new Types.ObjectId(other), crmStage: 'rs', actualityGroup: 'active', type_deal: 'продаж',
   location_text: 'Львів', updatedAt: new Date('2026-11-05T12:00:00Z'),
   owners: [{ name: 'Приватний Власник', phones: ['+38 (097) 123-45-67'], emails: ['owner@example.test'], notes: 'Приватна нотатка' }],
   phoneKeys: ['0971234567'], phone: '+380971234567', email: 'owner@example.test', leadname: 'Приватний Власник',
   description: 'Зателефонуйте Приватний Власник +380971234567 або owner@example.test',
   workHistory: [{ _id: new Types.ObjectId(), text: 'Телефон: 097 123 45 67', type: 'call', createdAt: new Date() }],
}));
function read(row, path) { return path.split('.').reduce((value, key) => Array.isArray(value) ? value.flatMap(entry => entry?.[key] ?? []) : value?.[key], row); }
function matches(row, filter) {
   return Object.entries(filter).every(([key, expected]) => {
      if (key === '$and') return expected.every(part => matches(row, part));
      if (key === '$or') return expected.some(part => matches(row, part));
      const value = read(row, key);
      if (expected == null) return value == null;
      if (expected?._bsontype || typeof expected !== 'object') return String(value) === String(expected);
      if ('$regex' in expected) return (Array.isArray(value) ? value : [value]).some(item => new RegExp(expected.$regex, expected.$options || '').test(String(item || '')));
      return Object.entries(expected).every(([operator, operand]) => {
         if (operator === '$in') return operand.some(item => String(item) === String(value));
         if (operator === '$ne') return String(value) !== String(operand);
         if (operator === '$exists') return (value !== undefined) === operand;
         if (operator === '$gte') return value >= operand;
         throw new Error('Unexpected predicate ' + operator);
      });
   });
}
function query(items, filter = {}, single = false) {
   let skip = 0, limit = Infinity;
   return {
      select() { return this; }, populate() { return this; }, sort() { return this; },
      skip(value) { skip = value; return this; }, limit(value) { limit = value; return this; },
      async lean() { const selected = items.filter(row => matches(row, filter)).slice(skip, skip + limit); return single ? selected[0] || null : selected; },
   };
}
let saves = 0;
const Property = {
   find: filter => query(rows, filter), findOne: filter => query(rows, filter, true),
   findById: async id => { const row = rows.find(item => String(item._id) === String(id)); return row && { ...row, save: async () => { saves++; } }; },
   countDocuments: async filter => rows.filter(row => matches(row, filter)).length,
   distinct: async (key, filter) => rows.filter(row => matches(row, filter)).map(row => read(row, key)),
   aggregate: async () => [],
};
const employees = [{ _id: own, manager: superior }, { _id: other, manager: superior }, { _id: subordinate, manager: own }, { _id: grandchild, manager: subordinate }, { _id: superior }];
let employeeReads = 0;
const Employee = { find: () => ({ lean: async () => { employeeReads++; return employees; } }) };
const access = load('utils/crm/accessControl.js', { Types, Property, Employee }, ['buildPropertyAccessFilter', 'combineMongoFilters', 'canManageProperty', 'getEmployeeScopeIds']);
const visibility = load('utils/crm/propertyVisibility.js', { Types, ...access }, ['canViewPropertyOwnerContacts', 'serializePropertyForUser', 'buildPropertyOwnerContactFilter', 'restrictPropertyOwnerContacts', 'redactPropertyOwnerContactText', 'withPropertyOwnerContactScope']);
let actor = { employeeId: own, userId: own, role: 'realtor' };
const dependencies = {
   Types, Property, Employee, ...access, ...visibility,
   connectDB: async () => {}, getSessionUser: async () => actor,
   OperationEvent: { aggregate: async () => [], find: filter => query([{ _id: new Types.ObjectId(), property: rows[1]._id, type: 'review', review: { note: 'owner@example.test' }, occurredAt: new Date() }], filter) },
   FinanceEvent: { aggregate: async () => [], distinct: async () => [] },
   logActivity: async () => {}, pickActivitySnapshot: () => ({}), PROPERTY_FIELDS: [],
};
const listApi = load('app/api/crm/properties/route.js', dependencies, ['GET']);
const detailApi = load('app/api/crm/properties/[id]/route.js', dependencies, ['GET', 'PATCH']);
const timelineApi = load('app/api/crm/properties/[id]/timeline/route.js', { ...dependencies, Lead: {} }, ['GET']);
const noteApi = load('app/api/crm/properties/[id]/add-note/route.js', dependencies, ['POST', 'PATCH', 'DELETE']);
const communications = [{ _id: new Types.ObjectId(), entityType: 'property', entityId: rows[1]._id, text: '097 123 45 67 owner@example.test', responsibleEmployee: { name: 'Колега', phone: '0679999988' } }];
const communicationsApi = load('app/api/crm/communications/route.js', {
   ...dependencies, COMMUNICATION_ENTITY_TYPES: ['leadProperty', 'property', 'lead', 'operation'],
   Communication: { countDocuments: async filter => communications.filter(row => matches(row, filter)).length, find: filter => query(communications, filter) },
}, ['GET']);
const activities = [{ _id: new Types.ObjectId(), entityType: 'property', entityId: rows[1]._id, action: 'updated', title: 'Змінено власника',
   before: { owners: [{ phones: ['0661112233'] }] }, after: { owners: rows[1].owners }, diff: [{ field: 'owners', before: ['0661112233'] }],
   meta: { propertyId: String(rows[1]._id), request: { phone: '0661112233' } }, message: '0661112233', createdAt: new Date() }];
const activityApi = load('app/api/crm/activity/route.js', {
   ...dependencies, CRMActivityLog: { countDocuments: async () => activities.length, find: filter => query(activities, filter) },
}, ['GET']);
const req = search => ({ nextUrl: { searchParams: new URLSearchParams(search) } });
const json = async response => { assert.equal(response.status, 200, await response.clone().text()); return response.json(); };
function assertPrivate(value) {
   const text = JSON.stringify(value);
   for (const secret of ['0971234567', '097 123 45 67', '+380971234567', '123-45-67', 'owner@example.test', 'Приватний Власник', 'Приватна нотатка']) assert.ok(!text.includes(secret), 'Leaked ' + secret);
}

async function testAccess() {
   for (const role of ['trainee', 'realtor']) {
      actor = { employeeId: own, userId: own, role };
      const mine = await json(await listApi.GET(req(`catalog=agency&assignee=${own}`)));
      assert.equal(mine.total, 1);
      assert.equal(mine.items[0].ownerContactsHidden, false);
      assert.equal(mine.items[0].owners[0].phones[0], '+38 (097) 123-45-67');
      const agency = await json(await listApi.GET(req('catalog=agency')));
      assert.equal(agency.total, 15);
      assert.equal(agency.items.length, 12);
      assert.equal(agency.items[1].ownerContactsHidden, true);
      assertPrivate(agency.items.slice(1));
      const second = await json(await listApi.GET(req('catalog=agency&page=2')));
      assert.equal(second.items.length, 3);
      assert.equal(String(second.items[0]._id), String(rows[12]._id));
      assertPrivate(second.items);
      assert.equal((await json(await listApi.GET(req(`catalog=agency&assignee=${other}`)))).total, 14);
      const phoneSearch = await json(await listApi.GET(req('catalog=agency&q=123-45-67')));
      assert.equal(phoneSearch.total, 1, 'Private phone search must not reveal colleagues’ properties');
      const restricted = await json(await listApi.GET(req('')));
      assert.equal(restricted.total, 1, 'Other consumers retain their existing scope');
      const detail = await json(await detailApi.GET(null, { params: { id: String(rows[1]._id) } }));
      assertPrivate(detail);
      assert.equal(detail.item.title, 'Об’єкт 1');
      assert.equal(detail.item.owners.length, 0);
      const history = await json(await timelineApi.GET(null, { params: { id: String(rows[1]._id) } }));
      assert.equal(history.total, 2);
      assertPrivate(history);
      assert.ok(history.items.every(item => !item.editable));
      const conversation = await json(await communicationsApi.GET(req('entityType=property&entityId=' + rows[1]._id)));
      assertPrivate(conversation);
      assert.equal(conversation.items[0].responsibleEmployee.phone, '0679999988', 'Responsible realtor contacts remain available');
      const activity = await json(await activityApi.GET(req('')));
      assertPrivate(activity);
      assert.ok(!JSON.stringify(activity).includes('0661112233'), 'Historical owner contacts must not leak through audit snapshots');
      assert.equal(await access.canManageProperty(actor, rows[1]), false);
      for (const method of ['POST', 'PATCH', 'DELETE']) {
         const response = await noteApi[method]({ json: async () => ({ text: 'Overwrite', noteId: 'x' }) }, { params: { id: String(rows[1]._id) } });
         assert.equal(response.status, 403);
      }
      const patch = await detailApi.PATCH({ formData: async () => new FormData() }, { params: { id: String(rows[1]._id) } });
      assert.equal(patch.status, 403);
      assert.equal(saves, 0);
      const subordinateProperty = { ...rows[1], assignee: subordinate, createdByEmployee: own };
      assert.equal(await access.canManageProperty(actor, subordinateProperty), true);
      const scopedActor = await visibility.withPropertyOwnerContactScope(actor);
      assert.equal(visibility.canViewPropertyOwnerContacts(scopedActor, subordinateProperty), true, 'Manager can see subordinate owner contacts');
      const unassigned = { ...rows[1], assignee: null, createdByEmployee: own };
      assert.equal(visibility.canViewPropertyOwnerContacts(scopedActor, unassigned), true);
      assert.ok(matches(unassigned, visibility.buildPropertyOwnerContactFilter(scopedActor)));
      assert.ok(matches(subordinateProperty, visibility.buildPropertyOwnerContactFilter(scopedActor)));
      assert.equal(rows[1].owners[0].phones[0], '+38 (097) 123-45-67', 'Serialization must not modify stored documents');
   }
   for (const role of ['viewer', 'callcenter', 'marketing', 'manager']) {
      actor = { employeeId: own, userId: own, role };
      const response = await json(await listApi.GET(req('catalog=agency')));
      assert.equal(response.total, 1, 'Agency flag must not grant unrelated roles wider access');
   }
   actor = { employeeId: own, role: 'owner' };
   const adminDetail = await json(await detailApi.GET(null, { params: { id: String(rows[1]._id) } }));
   assert.equal(adminDetail.item.owners[0].phones[0], '+38 (097) 123-45-67');
   actor = null;
   assert.equal((await listApi.GET(req('catalog=agency'))).status, 401);
   assert.equal((await detailApi.GET(null, { params: { id: String(rows[1]._id) } })).status, 401);
   assert.equal((await timelineApi.GET(null, { params: { id: String(rows[1]._id) } })).status, 401);
   assert.equal((await communicationsApi.GET(req('entityType=property&entityId=' + rows[1]._id))).status, 401);
   assert.equal((await activityApi.GET(req(''))).status, 401);
}

async function testHierarchy() {
   const originalAssignees = rows.slice(1, 4).map(row => row.assignee);
   rows[1].assignee = new Types.ObjectId(subordinate);
   rows[2].assignee = new Types.ObjectId(grandchild);
   rows[3].assignee = new Types.ObjectId(superior);
   try {
      for (const role of ['realtor', 'trainee', 'manager']) {
         actor = { employeeId: own, userId: own, role };
         const before = employeeReads;
         const scoped = await visibility.withPropertyOwnerContactScope(actor);
         for (let repeat = 0; repeat < 100; repeat++) {
            assert.equal(visibility.serializePropertyForUser(scoped, rows[1]).ownerContactsHidden, false);
            assert.equal(visibility.serializePropertyForUser(scoped, rows[2]).ownerContactsHidden, false);
            assertPrivate(visibility.serializePropertyForUser(scoped, rows[3]));
            assertPrivate(visibility.serializePropertyForUser(scoped, rows[4]));
         }
         assert.equal(employeeReads - before, 1, 'Load hierarchy once, not for each card or serialization');
         assert.equal(await visibility.withPropertyOwnerContactScope(scoped), scoped);
         const list = await json(await listApi.GET(req('catalog=agency')));
         for (const row of [rows[1], rows[2]]) {
            const item = list.items.find(item => item._id === String(row._id));
            assert.equal(item.ownerContactsHidden, false);
            assert.equal(item.owners[0].phones[0], '+38 (097) 123-45-67');
         }
         const detail = await json(await detailApi.GET(null, { params: { id: String(rows[1]._id) } }));
         assert.equal(detail.item.ownerContactsHidden, false);
         const history = await json(await timelineApi.GET(null, { params: { id: String(rows[1]._id) } }));
         assert.ok(history.items.some(item => item.text.includes('097 123 45 67')));
         const conversation = await json(await communicationsApi.GET(req('entityType=property&entityId=' + rows[1]._id)));
         assert.ok(conversation.items[0].text.includes('owner@example.test'));
         const activity = await json(await activityApi.GET(req('')));
         assert.ok(JSON.stringify(activity).includes('0661112233'));
         assert.equal((await json(await listApi.GET(req('catalog=agency&q=123-45-67')))).total, 3, 'Phone search follows the same hierarchy');
         const unassigned = { ...rows[1], assignee: null, createdByEmployee: grandchild };
         assert.equal(visibility.canViewPropertyOwnerContacts(scoped, unassigned), true);
         assert.ok(matches(unassigned, visibility.buildPropertyOwnerContactFilter(scoped)));
         const reassigned = { ...unassigned, assignee: other };
         assert.equal(visibility.canViewPropertyOwnerContacts(scoped, reassigned), false, 'Creating a property does not reveal contacts after transfer outside the branch');
         assert.ok(!matches(reassigned, visibility.buildPropertyOwnerContactFilter(scoped)));
         const childActor = await visibility.withPropertyOwnerContactScope({ employeeId: subordinate, userId: subordinate, role });
         assert.equal(visibility.canViewPropertyOwnerContacts(childActor, rows[1]), true);
         assert.equal(visibility.canViewPropertyOwnerContacts(childActor, rows[2]), true);
         assertPrivate(visibility.serializePropertyForUser(childActor, rows[0]));
         assertPrivate(visibility.serializePropertyForUser(childActor, rows[4]));
         const noEmployee = await visibility.withPropertyOwnerContactScope({ role });
         assertPrivate(visibility.serializePropertyForUser(noEmployee, rows[1]));
      }
      actor = { employeeId: own, userId: own, role: 'realtor' };
      employees.find(employee => employee._id === subordinate).manager = other;
      const changedScope = await visibility.withPropertyOwnerContactScope(actor);
      assertPrivate(visibility.serializePropertyForUser(changedScope, rows[1]));
      assertPrivate(visibility.serializePropertyForUser(changedScope, rows[2]));
      assert.equal((await json(await listApi.GET(req('catalog=agency&q=123-45-67')))).total, 1, 'Changed reporting lines take effect on the next request');
   } finally {
      rows.slice(1, 4).forEach((row, index) => { row.assignee = originalAssignees[index]; });
      employees.find(employee => employee._id === subordinate).manager = own;
   }
}

async function testPage(role) {
   actor = { employeeId: own, userId: own, role };
   const hooks = [], timers = new Map(), requests = [];
   let cursor = 0, dirty = true, effects = [], tree, timerId = 0;
   const changed = (a, b) => !a || !b || a.length !== b.length || a.some((value, index) => value !== b[index]);
   const react = {
      useState(initial) { const index = cursor++; if (!(index in hooks)) hooks[index] = typeof initial === 'function' ? initial() : initial; return [hooks[index], value => { const next = typeof value === 'function' ? value(hooks[index]) : value; if (!Object.is(next, hooks[index])) { hooks[index] = next; dirty = true; } }]; },
      useRef(initial) { const index = cursor++; return hooks[index] ||= { current: initial }; },
      useMemo(fn, deps) { const index = cursor++; if (changed(hooks[index]?.deps, deps)) hooks[index] = { deps, value: fn() }; return hooks[index].value; },
      useEffect(fn, deps) { const index = cursor++; if (changed(hooks[index]?.deps, deps)) { effects.push(() => { hooks[index]?.cleanup?.(); hooks[index] = { deps, cleanup: fn() }; }); } },
   };
   const filename = 'app/(crm)/crm/objects3/page.jsx';
   const result = await swc.transform(fs.readFileSync(filename, 'utf8'), { filename, jsc: { parser: { syntax: 'ecmascript', jsx: true }, target: 'es2020', transform: { react: { runtime: 'automatic' } } }, module: { type: 'commonjs' } });
   const module = { exports: {} };
   const requireStub = name => {
      if (name === 'react') return react;
      if (name === 'react/jsx-runtime') return require(name);
      if (name === '@mui/material') return new Proxy({}, { get: (_, key) => String(key) });
      if (name.includes('CRMThemeContext')) return { useCRMTheme: () => ({ theme: { text: '#fff', textSoft: '#aaa', accent: '#a5f' }, mode: 'dark' }) };
      if (name.includes('useCurrentUser')) return () => ({ user: actor, loading: false });
      if (name.includes('propertyApi')) return {};
      return name.split('/').pop();
   };
   vm.runInNewContext(result.code, {
      module, exports: module.exports, require: requireStub, console, URLSearchParams,
      setTimeout: fn => { timers.set(++timerId, fn); return timerId; }, clearTimeout: id => timers.delete(id),
      fetch: async url => {
         if (url.startsWith('/api/crm/employees')) return Response.json({ items: [{ _id: own, name: 'Я' }, { _id: other, name: 'Колега' }] });
         requests.push(url);
         return listApi.GET(req(url.split('?')[1]));
      },
   }, { filename });
   async function flush() {
      for (let attempt = 0; attempt < 20; attempt++) {
         if (dirty) { dirty = false; cursor = 0; effects = []; tree = module.exports.default(); effects.forEach(fn => fn()); }
         await new Promise(resolve => setImmediate(resolve));
         if (dirty) continue;
         if (timers.size) { const pending = [...timers.values()]; timers.clear(); pending.forEach(fn => fn()); continue; }
         return;
      }
      throw new Error('Page did not settle');
   }
   function find(predicate, node) {
      if (arguments.length === 1) node = tree;
      if (!node || typeof node !== 'object') return null;
      if (Array.isArray(node)) { for (const child of node) { const result = find(predicate, child); if (result) return result; } return null; }
      if (React.isValidElement(node) && predicate(node)) return node;
      return find(predicate, node.props?.children);
   }
   await flush();
   assert.ok(requests.at(-1).includes('assignee=' + own), 'Entering Objects starts with My objects enabled');
   const mineButton = find(node => node.type === 'Button' && node.props.children === 'Мої');
   assert.ok(mineButton);
   mineButton.props.onClick({});
   await flush();
   assert.ok(requests.at(-1).includes('catalog=agency'));
   assert.ok(!requests.at(-1).includes('assignee='), 'Clicking My toggles to the whole agency');
   const pagination = find(node => node.type === 'Pagination');
   assert.equal(pagination.props.count, 2);
   pagination.props.onChange(null, 2);
   await flush();
   assert.ok(requests.at(-1).includes('page=2'));
   find(node => node.type === 'Button' && node.props.children === 'Мої').props.onClick({});
   await flush();
   assert.ok(requests.at(-1).includes('page=1'), 'Changing filters resets pagination');
   assert.ok(requests.at(-1).includes('assignee=' + own));
}

(async () => {
   await testAccess();
   await testHierarchy();
   await testPage('trainee');
   await testPage('realtor');
   const { buildPropertyFormData } = load('utils/crm/propertyFormData.js', { FormData }, ['buildPropertyFormData']);
   assert.equal(buildPropertyFormData({}).has('owners'), false, 'Hidden owner fields must not be submitted as empty data');
   assert.equal(buildPropertyFormData({ owners: [] }).get('owners'), '[]', 'Explicitly clearing permitted contacts still works');
   for (const filename of ['crm_components/PropertyForm6.jsx', 'app/(crm)/crm/objects3/ObjectWorkRowCard2.jsx']) {
      await swc.transform(fs.readFileSync(filename, 'utf8'), { filename, jsc: { parser: { syntax: 'ecmascript', jsx: true }, target: 'es2020' }, module: { type: 'commonjs' } });
   }
   console.log('PASS: agency catalog, My filter, pagination, hierarchical contact access across list/detail/history/search, peer and upward isolation, one hierarchy read per context, reporting-line updates.');
})().catch(error => { console.error(error); process.exitCode = 1; });
