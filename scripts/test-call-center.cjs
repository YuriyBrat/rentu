// Run with: node scripts/test-call-center.cjs. No database or network access.
const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const { randomUUID } = require('node:crypto');
const { Types } = require('mongoose');

const helper = fs.readFileSync('utils/crm/callCenter.js', 'utf8').replace(/export (const|function)/g, '$1');
const route = fs.readFileSync('app/api/crm/parsing/[id]/workflow/route.js', 'utf8')
   .replace(/^import .*;\r?\n/gm, '').replace('export async function POST', 'async function POST');
const id = '507f1f77bcf86cd799439011';
const records = new Map();
const calls = new Map();
const read = (value, path) => path.split('.').reduce((current, key) => current?.[key], value);
const copy = value => value == null ? value : structuredClone(value);

function matches(doc, filter) {
   return Object.entries(filter).every(([key, expected]) => {
      if (key === '$or') return expected.some(part => matches(doc, part));
      const actual = read(doc, key);
      if (expected === null) return actual == null;
      if (typeof expected !== 'object' || expected instanceof Date) return String(actual) === String(expected);
      if ('$not' in expected) return !matches({ value: actual }, { value: expected.$not });
      if ('$elemMatch' in expected) return (actual || []).some(row => matches(row, expected.$elemMatch));
      if ('$in' in expected) return expected.$in.some(value => value == null ? actual == null : actual === value);
      if ('$gt' in expected) return actual != null && actual > expected.$gt;
      if ('$lte' in expected) return actual != null && actual <= expected.$lte;
      throw new Error(`Unsupported test query: ${JSON.stringify(expected)}`);
   });
}

function assign(doc, path, value, filter) {
   const keys = path.split('.');
   let current = doc;
   for (let index = 0; index < keys.length - 1; index++) {
      const key = keys[index];
      if (key === '$') {
         current = current.find(row => matches(row, filter.callRequests.$elemMatch));
      } else {
         current[key] ??= {};
         current = current[key];
      }
   }
   current[keys.at(-1)] = copy(value);
}

const query = value => ({ lean: async () => copy(value), then: (resolve, reject) => Promise.resolve(copy(value)).then(resolve, reject) });
const LeadProperty = {
   findById: key => query(records.get(key)),
   findOne: filter => query([...records.values()].find(item => matches(item, filter))),
   async findOneAndUpdate(filter, update) {
      // Matching and writing happen together, modelling MongoDB's atomic document update.
      const item = [...records.values()].find(value => matches(value, filter));
      if (!item) return null;
      if (Array.isArray(update)) {
         assert.ok(update[0].$set.callPriorityRank, 'Priority is recalculated in the atomic database pipeline');
         item.callPriorityRank = Math.max(0, ...(item.callRequests || []).filter(row => !row.resolvedAt).map(row => ({ interesting: 1, priority: 2, urgent: 3 }[row.level])));
      } else {
         for (const [path, value] of Object.entries(update.$set || {})) assign(item, path, value, filter);
         for (const [path, value] of Object.entries(update.$push || {})) {
            item[path] ??= [];
            item[path].push({ _id: new Types.ObjectId().toString(), resolvedAt: null, ...copy(value) });
         }
      }
      return copy(item);
   },
};
const Communication = {
   async findOne(filter) { return copy([...calls.values()].find(item => matches(item, filter))); },
   async create(value) {
      const requestId = value.meta.callCenter.requestId;
      if (calls.has(requestId)) throw Object.assign(new Error('duplicate'), { code: 11000 });
      const item = { _id: new Types.ObjectId().toString(), ...copy(value) };
      calls.set(requestId, item);
      return copy(item);
   },
};

function client(key, role = 'callcenter', authenticated = true) {
   const context = vm.createContext({
      Types, Response, randomUUID, LeadProperty, Communication,
      connectDB: async () => {}, logActivity: async () => {}, console: { error() {} },
      getSessionUser: async () => authenticated ? { user: { id: key, name: key }, userId: key, role } : null,
   });
   vm.runInContext(helper + '\n' + route + '\nglobalThis.api = POST;', context);
   return { context, async post(body) {
      const response = await context.api({ json: async () => body }, { params: { id } });
      return { status: response.status, ...(await response.json()) };
   } };
}

async function run() {
   records.set(id, { _id: id, title: 'Test property', stage: 'raw', callRequests: [] });
   const alice = client('alice');
   const bob = client('bob');
   const realtor = client('realtor', 'realtor');
   const otherRealtor = client('other-realtor', 'realtor');
   assert.equal((await client('', 'callcenter', false).post({ action: 'claim' })).status, 401);
   assert.equal((await client('viewer', 'viewer').post({ action: 'claim' })).status, 403);

   const competing = await Promise.all([alice.post({ action: 'claim' }), bob.post({ action: 'claim' })]);
   assert.deepEqual(competing.map(value => value.status).sort(), [200, 409]);
   assert.equal(records.get(id).callQueue.ownerKey, 'alice');
   assert.equal((await bob.post({ action: 'release' })).status, 409);
   assert.equal((await bob.post({ action: 'heartbeat' })).status, 409);
   assert.equal((await alice.post({ action: 'heartbeat' })).status, 200);

   const submissionId = randomUUID();
   assert.equal((await alice.post({ action: 'outcome', submissionId, outcome: 'callback' })).status, 400);
   assert.equal((await alice.post({ action: 'outcome', submissionId, outcome: 'callback', text: 'Call later', nextContactAt: '2020-01-01' })).status, 400);
   const payload = { action: 'outcome', submissionId, outcome: 'callback', text: 'Call in an hour', nextContactAt: new Date(Date.now() + 3600000).toISOString() };
   assert.equal((await alice.post(payload)).status, 200);
   assert.equal((await alice.post(payload)).status, 200);
   assert.equal(calls.size, 1, 'Retry does not count the same call twice');
   assert.equal(records.get(id).callQueue.callbackOwnerKey, 'alice');
   assert.equal(records.get(id).callQueue.ownerKey, '');
   assert.equal((await bob.post(payload)).status, 409, 'Other operator cannot reuse a submission id');

   assert.equal((await alice.post({ action: 'priority', level: 'priority' })).status, 403);
   assert.equal((await realtor.post({ action: 'priority', level: 'urgent' })).status, 400);
   const urgent = { action: 'priority', level: 'urgent', note: 'Buyer waiting', dueAt: new Date(Date.now() + 7200000).toISOString() };
   assert.equal((await realtor.post(urgent)).status, 200);
   assert.equal((await realtor.post({ ...urgent, note: 'Updated request' })).status, 200);
   assert.equal(records.get(id).callRequests.length, 1, 'Updating a request keeps one active request per realtor');
   assert.equal((await otherRealtor.post({ action: 'priority', level: 'interesting', note: 'Check address' })).status, 200);
   assert.equal(records.get(id).callRequests.length, 2);
   assert.equal(records.get(id).callPriorityRank, 3);
   const requestId = records.get(id).callRequests[0]._id;
   assert.equal((await bob.post({ action: 'resolveRequest', requestId, resolution: 'Done' })).status, 404);
   assert.equal((await bob.post({ action: 'claim' })).status, 200);
   assert.equal((await bob.post({ action: 'resolveRequest', requestId, resolution: 'Owner confirmed' })).status, 200);
   assert.equal(records.get(id).callPriorityRank, 1, 'Resolving urgent request leaves the other realtor request active');

   records.get(id).callQueue.expiresAt = new Date(Date.now() - 1000);
   assert.equal((await alice.post({ action: 'claim' })).status, 200, 'Expired lease can be taken by another operator');
   assert.equal((await bob.post({ action: 'heartbeat' })).status, 409);
   assert.equal(alice.context.callClaimConflict(records.get(id), 'bob'), true);
   assert.equal(alice.context.callClaimConflict(records.get(id), 'alice'), false);

   for (const day of ['2026-03-29', '2026-10-25', '2026-10-19']) {
      const start = alice.context.callPeriodStart(1, new Date(`${day}T12:00:00Z`));
      assert.equal(alice.context.kyivDateKey(start), day);
      const hour = new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Kyiv', hour: '2-digit', hourCycle: 'h23' }).format(start);
      assert.equal(hour, '00', 'Reporting period starts at Kyiv midnight, including DST transition days');
   }
   console.log('PASS: permissions, atomic competing claims, lease ownership/expiry, callbacks, idempotent call results, realtor priority requests, request resolution, Kyiv/DST periods.');
}
run().catch(error => { console.error(error); process.exitCode = 1; });
