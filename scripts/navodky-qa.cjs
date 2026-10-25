// Integration/browser QA in an isolated temporary database; never edits CRM data.
const assert = require('node:assert/strict');
const fs = require('node:fs'), path = require('node:path'), os = require('node:os');
const { randomUUID } = require('node:crypto');
const { spawn } = require('node:child_process');
const { MongoClient, ObjectId } = require('mongodb');
const bcrypt = require('bcryptjs');
const WebSocket = require('next/dist/compiled/ws');
process.env.DEBUG = ''; process.env.NEXT_TELEMETRY_DISABLED = '1';
require('@next/env').loadEnvConfig(process.cwd());
const base = 'http://127.0.0.1:3012';
const dbName = 'krm_navqa_' + randomUUID().replaceAll('-', '').slice(0, 16);
const password = randomUUID();
const wait = ms => new Promise(resolve => setTimeout(resolve, ms));
const output = path.resolve('node_modules/.cache/owners-qa');
let client, app, server, browser, socket, db;
const errors = [], badScripts = [];

function makeClient() {
  const jar = new Map();
  async function request(route, options = {}) {
    const response = await fetch(base + route, { ...options, headers: { ...options.headers, Cookie: [...jar].map(([key, value]) => key + '=' + value).join('; ') }, redirect: 'manual', signal: AbortSignal.timeout(60000) });
    for (const line of response.headers.getSetCookie()) { const pair = line.split(';')[0], split = pair.indexOf('='); jar.set(pair.slice(0, split), pair.slice(split + 1)); }
    let data; try { data = await response.json(); } catch { data = {}; }
    return { status: response.status, data };
  }
  async function login(login) {
    const csrf = await request('/api/auth/csrf');
    await request('/api/auth/callback/credentials', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams({ csrfToken: csrf.data.csrfToken, email: login, password, callbackUrl: base + '/crm/navodky4', json: 'true' }) });
    const session = await request('/api/auth/session');
    assert.ok(session.data.user?.employeeId, 'Fixture login failed');
    return session.data.user;
  }
  const mutate = (route, method, body, origin = base) => request(route, { method, headers: { 'Content-Type': 'application/json', Origin: origin }, ...(body === undefined ? {} : { body: JSON.stringify(body) }) });
  return { request, login, mutate, jar };
}

(async () => {
  const uri = new URL(process.env.MONGODB_URI);
  uri.pathname = '/' + dbName;
  process.env.MONGODB_URI = uri.href;
  process.env.NEXTAUTH_URL = base;
  process.env.DEBUG = ''; process.env.NEXT_TELEMETRY_DISABLED = '1';
  require('@next/env').updateInitialEnv({ MONGODB_URI: uri.href, NEXTAUTH_URL: base, DEBUG: '', NEXT_TELEMETRY_DISABLED: '1' });
  client = new MongoClient(uri.href, { serverSelectionTimeoutMS: 15000 });
  await client.connect();
  if (process.argv.includes('--cleanup')) {
    const listed = await client.db().admin().listDatabases({ nameOnly: true });
    for (const entry of listed.databases.filter(value => /^krm_navqa_[a-f0-9]{16}$/.test(value.name))) {
      const candidate = client.db(entry.name);
      const employees = await candidate.collection('employees').find().toArray();
      const records = await candidate.collection('navodkas').find().toArray();
      assert.ok(employees.length === 8 && employees.every(item => /^QA /.test(item.name) && /^qa-/.test(item.login)), 'Refuse to remove non-fixture database');
      assert.ok(records.length <= 6 && records.every(item => /^QA /.test(item.title) && /^\+3800000001\d{2}$/.test(item.phone)), 'Refuse to remove non-fixture contacts');
      await candidate.dropDatabase();
      console.log('Removed verified temporary fixture database:', entry.name);
    }
    return;
  }
  db = client.db(dbName);
  assert.equal(db.databaseName, dbName);
  const people = Object.fromEntries(['owner', 'admin', 'manager', 'agent', 'junior', 'otherManager', 'otherAgent', 'viewer'].map(key => [key, new ObjectId()]));
  const hash = await bcrypt.hash(password, 4);
  await db.collection('employees').insertMany(Object.entries(people).map(([key, _id]) => ({ _id, name: 'QA ' + key, login: 'qa-' + key.toLowerCase(), passwordHash: hash, role: key === 'owner' || key === 'admin' || key === 'viewer' ? key : key.includes('Manager') || key === 'manager' ? 'manager' : 'realtor', manager: key === 'agent' ? people.manager : key === 'junior' ? people.agent : key === 'otherAgent' ? people.otherManager : null, isActive: true, phones: [], emails: [], createdAt: new Date(), updatedAt: new Date() })));
  const leads = Object.fromEntries(['own', 'junior', 'foreign', 'unassigned', 'historic'].map(key => [key, new ObjectId()]));
  const owner = { own: people.agent, junior: people.junior, foreign: people.otherAgent, historic: people.agent };
  await db.collection('navodkas').insertMany(Object.entries(leads).map(([key, _id], index) => ({
    _id, title: key === 'foreign' ? 'QA foreign +380000000103' : 'QA ' + key, ownerName: 'QA contact', phone: '+38000000010' + (index + 1),
    assignedTo: owner[key] || null, createdBy: owner[key] || null, source: key === 'unassigned' ? 'Сайт /owners' : key === 'historic' ? 'OLX' : 'Рекомендація',
    status: 'active', readiness: 'unknown', description: 'PRIVATE details ' + key + ' +38000000010' + (index + 1),
    nextContactAt: key === 'historic' ? null : new Date('2026-10-24T10:00:00Z'),
    createdAt: key === 'historic' ? new Date('2026-02-03T10:00:00Z') : new Date(Date.now() - 6 * 86400000), updatedAt: new Date(Date.now() - (5 - index) * 3600000),
    notes: [{ _id: new ObjectId(), text: 'PRIVATE note +38000000010' + (index + 1), type: 'info', activityType: 'note', createdBy: owner[key] || null, createdAt: new Date('2026-10-20T10:00:00Z') }],
  })));
  console.log('PASS temporary fixture DB created; original database untouched');
  const configPath = require.resolve('next/dist/server/config');
  const config = await require(configPath).default(require('next/constants').PHASE_DEVELOPMENT_SERVER, process.cwd());
  process.env.MONGODB_URI = uri.href; process.env.NEXTAUTH_URL = base; process.env.DEBUG = '';
  config.distDir = '.next/navodky-qa-' + dbName.slice(-16);
  require.cache[configPath].exports = { __esModule: true, ...require(configPath), default: async () => config };
  app = require('next')({ dev: true, hostname: '127.0.0.1', port: 3012, conf: config });
  await app.prepare();
  server = require('node:http').createServer(app.getRequestHandler());
  await new Promise(resolve => server.listen(3012, '127.0.0.1', resolve));
  const anonymous = makeClient();
  for (const method of ['GET', 'POST']) assert.equal((await anonymous.request('/api/crm/navodky', { method })).status, 401);
  for (const method of ['GET', 'PATCH', 'DELETE']) assert.equal((await anonymous.request('/api/crm/navodky/' + leads.own, { method })).status, 401);
  console.log('PASS anonymous list/detail/create/update/delete denied');
  const clients = {};
  for (const role of ['owner', 'admin', 'manager', 'agent', 'junior', 'otherAgent', 'viewer']) { clients[role] = makeClient(); await clients[role].login('qa-' + role.toLowerCase()); }
  const ownerList = (await clients.owner.request('/api/crm/navodky')).data;
  // Critical isolation assertion before any mutations.
  assert.equal(ownerList.items.length, 5);
  assert.ok(ownerList.items.every(item => Object.values(leads).some(value => String(value) === item._id)));
  assert.equal(ownerList.items[0]._id, String(leads.historic));
  for (const role of ['owner', 'admin']) assert.ok((await clients[role].request('/api/crm/navodky')).data.items.every(item => item.canViewPhone));
  for (const role of ['manager', 'agent']) {
    const list = (await clients[role].request('/api/crm/navodky')).data;
    assert.equal(list.items.find(item => item._id === String(leads.own)).canViewPhone, true);
    assert.equal(list.items.find(item => item._id === String(leads.junior)).canViewPhone, true);
    for (const key of ['foreign', 'unassigned']) { const item = list.items.find(value => value._id === String(leads[key])); assert.equal(item.phone, ''); assert.equal(item.canEdit, false); assert.ok(!JSON.stringify(item).includes('000000103')); assert.equal(item.notes.length, 0); }
  }
  const junior = (await clients.junior.request('/api/crm/navodky')).data.items;
  assert.equal(junior.find(item => item._id === String(leads.own)).canViewPhone, false);
  const foreign = await clients.agent.request('/api/crm/navodky/' + leads.foreign);
  assert.equal(foreign.status, 200); assert.equal(foreign.data.phone, ''); assert.equal(foreign.data.description, '');
  assert.equal((await clients.agent.mutate('/api/crm/navodky/' + leads.foreign, 'PATCH', { title: 'Forbidden' })).status, 403);
  assert.equal((await clients.agent.mutate('/api/crm/navodky/' + leads.foreign, 'DELETE')).status, 403);
  assert.equal((await clients.viewer.mutate('/api/crm/navodky/' + leads.own, 'PATCH', { title: 'Forbidden' })).status, 403);
  assert.equal((await clients.agent.request('/api/crm/navodky?q=' + encodeURIComponent('+380000000103'))).data.pagination.total, 0);
  console.log('PASS real logins: self/multiple hierarchy levels, siblings/ancestors denied, admin/owner full access, no phone search leak');

  const historical = (await clients.owner.request('/api/crm/navodky?period=custom&from=2026-02-03&to=2026-02-03&dateField=createdAt')).data;
  assert.equal(historical.pagination.total, 1); assert.equal(historical.items[0]._id, String(leads.historic));
  assert.equal((await clients.owner.request('/api/crm/navodky?source=' + encodeURIComponent('Сайт /owners'))).data.pagination.total, 1);
  assert.equal((await clients.owner.request('/api/crm/navodky?contactFilter=unscheduled')).data.pagination.total, 1);
  const paged = (await clients.owner.request('/api/crm/navodky?pageSize=2&page=2')).data;
  assert.equal(paged.items.length, 2); assert.equal(paged.stats.total, 5); assert.equal(paged.pagination.pages, 3);
  assert.equal((await clients.owner.request('/api/crm/navodky?period=custom&from=2026-10-24&to=2026-01-01')).status, 400);
  const payload = { title: 'QA created by agent', ownerName: 'QA', phone: '+380000000199', createdBy: String(people.otherAgent) };
  assert.equal((await clients.agent.mutate('/api/crm/navodky', 'POST', { ...payload, assignedTo: String(people.otherAgent) })).status, 403);
  const created = await clients.agent.mutate('/api/crm/navodky', 'POST', payload);
  assert.equal(created.status, 201); assert.equal(created.data.assignedTo._id || created.data.assignedTo, String(people.agent));
  assert.equal((await db.collection('navodkas').findOne({ _id: new ObjectId(created.data._id) })).createdBy.toString(), String(people.agent));
  assert.equal((await clients.agent.mutate('/api/crm/navodky/' + created.data._id, 'PATCH', { assignedTo: String(people.otherAgent) })).status, 403);
  const noted = await clients.agent.mutate('/api/crm/navodky/' + created.data._id, 'PATCH', { title: 'QA updated newest', newNote: { text: 'QA note', activityType: 'call', type: 'positive', contactDate: '2026-10-24T10:00:00Z', nextContactAt: '2026-11-01' } });
  assert.equal(noted.status, 200); assert.equal(noted.data.notes.length, 1); assert.equal(noted.data.notes[0].createdBy._id, String(people.agent));
  assert.equal((await clients.owner.request('/api/crm/navodky')).data.items[0]._id, created.data._id);
  assert.equal((await clients.owner.mutate('/api/crm/navodky/' + created.data._id, 'PATCH', { title: 'Cross origin' }, 'https://invalid.example')).status, 403);
  assert.equal((await clients.agent.mutate('/api/crm/navodky/' + created.data._id, 'DELETE')).status, 200);
  assert.equal((await clients.owner.request('/api/crm/navodky/' + created.data._id)).status, 404);
  console.log('PASS sort, date/source/contact filters, pagination totals, create/note/update/delete and assignment/origin guards');

  browser = spawn('C:/Program Files/Google/Chrome/Application/chrome.exe', ['--headless=new', '--disable-gpu', '--no-first-run', '--disable-extensions', '--disable-background-networking', '--remote-debugging-port=9340', '--user-data-dir=' + fs.mkdtempSync(path.join(os.tmpdir(), 'navodky-qa-')), 'about:blank'], { windowsHide: true, stdio: 'ignore' });
  let targets;
  for (let i = 0; i < 100; i++) { try { targets = await fetch('http://127.0.0.1:9340/json/list').then(response => response.json()); if (targets.length) break; } catch {} await wait(200); }
  assert.ok(targets?.length);
  socket = new WebSocket(targets.find(target => target.type === 'page').webSocketDebuggerUrl);
  await new Promise((resolve, reject) => { socket.once('open', resolve); socket.once('error', reject); });
  let sequence = 0; const pending = new Map();
  const cdp = (method, params = {}) => new Promise((resolve, reject) => { const id = ++sequence; pending.set(id, { resolve, reject }); socket.send(JSON.stringify({ id, method, params })); });
  socket.on('message', raw => { const message = JSON.parse(raw); if (message.id) { const task = pending.get(message.id); if (task) { pending.delete(message.id); message.error ? task.reject(new Error(JSON.stringify(message.error))) : task.resolve(message.result); } } if (message.method === 'Runtime.exceptionThrown') errors.push(message.params.exceptionDetails.exception?.description || message.params.exceptionDetails.text); if (message.method === 'Runtime.consoleAPICalled' && message.params.type === 'error') errors.push(message.params.args.map(item => item.value || item.description).join(' ')); if (message.method === 'Network.responseReceived' && message.params.type === 'Script' && message.params.response.status >= 400) badScripts.push(message.params.response.url); });
  const evaluate = async expression => { const result = await cdp('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true }); if (result.exceptionDetails) throw new Error(result.exceptionDetails.exception?.description || result.exceptionDetails.text); return result.result.value; };
  const poll = async (expression, label) => { for (let i = 0; i < 200; i++) { if (await evaluate(expression)) return; await wait(200); } throw new Error('Timed out: ' + label); };
  const click = text => evaluate('(()=>{const button=[...document.querySelectorAll("button")].find(el=>el.textContent.trim()===' + JSON.stringify(text) + ');if(!button)throw Error("Missing button");button.click();})()');
  const value = (selector, input) => evaluate('(()=>{const el=document.querySelector(' + JSON.stringify(selector) + ');Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,"value").set.call(el,' + JSON.stringify(input) + ');el.dispatchEvent(new Event("input",{bubbles:true}));})()');
  const shot = async name => { const result = await cdp('Page.captureScreenshot', { format: 'png' }); fs.mkdirSync(output, { recursive: true }); fs.writeFileSync(path.join(output, name), Buffer.from(result.data, 'base64')); };
  await cdp('Page.enable'); await cdp('Runtime.enable'); await cdp('Network.enable');
  await cdp('Network.setCookies', { cookies: [...clients.owner.jar].map(([name, value]) => ({ name, value, url: base, path: '/', httpOnly: true, sameSite: 'Lax' })) });
  await cdp('Emulation.setDeviceMetricsOverride', { width: 1440, height: 1000, deviceScaleFactor: 1, mobile: false });
  await cdp('Page.navigate', { url: base + '/crm/navodky4' });
  await poll('document.querySelectorAll("[data-navodka-id]").length===5', 'navodky load');
  const cardColor = () => evaluate('getComputedStyle(document.querySelector("[data-navodka-id]")).backgroundColor');
  const colors = [await cardColor()];
  await shot('navodky-dark.png');
  for (const mode of ['light', 'luxury']) {
    await evaluate('[...document.querySelectorAll("button")].find(el=>el.getAttribute("aria-label")==="Змінити тему CRM").click()');
    await poll('document.querySelector("[data-navodky-theme]").dataset.navodkyTheme===' + JSON.stringify(mode), mode);
    colors.push(await cardColor()); await shot('navodky-' + mode + '.png');
  }
  assert.equal(new Set(colors).size, 3);
  assert.ok((await evaluate('getComputedStyle(document.querySelector("[data-navodka-id] h2")).fontFamily')).includes('Segoe UI'));
  const labelColor = await evaluate('getComputedStyle(document.querySelector("label[for=navodky-search]")).color');
  assert.ok(!labelColor.includes('0, 0, 0'), 'dark-theme label inherits global black');
  // Exercise actual selects via keyboard to avoid relying on MUI popup structure.
  await evaluate('document.getElementById("navodky-period").focus()');
  await cdp('Input.dispatchKeyEvent', { type: 'keyDown', key: ' ', code: 'Space' });
  await poll('!!document.querySelector("[role=listbox]")', 'period menu');
  await evaluate('[...document.querySelectorAll("[role=option]")].find(el=>el.dataset.value==="custom").click()');
  await poll('!!document.getElementById("navodky-from")', 'custom date inputs');
  await value('#navodky-from', '2026-02-03'); await value('#navodky-to', '2026-02-03');
  await evaluate('document.getElementById("navodky-dateField").focus()');
  await cdp('Input.dispatchKeyEvent', { type: 'keyDown', key: ' ', code: 'Space' });
  await poll('!!document.querySelector("[role=listbox]")', 'date type menu');
  await evaluate('[...document.querySelectorAll("[role=option]")].find(el=>el.dataset.value==="createdAt").click()');
  await poll('document.querySelectorAll("[data-navodka-id]").length===1', 'period filters result');
  await evaluate('Array.from(document.querySelectorAll("button")).find(button => button.getAttribute("aria-label") === "Скинути фільтри").click()'); await poll('document.querySelectorAll("[data-navodka-id]").length===5', 'reset filters');
  await click('+ Додати наводку'); await poll('!!document.getElementById("navodka-form-title")', 'create dialog');
  assert.equal(await evaluate('getComputedStyle(document.querySelector("[role=dialog]")).backgroundColor'), colors[2]);
  await value('#navodka-form-title', 'QA browser create');
  await value('#navodka-form-ownerName', 'QA'); await value('#navodka-form-phone', '+380000000188');
  await click('Зберегти'); await poll('document.body.textContent.includes("QA browser create")&&!document.querySelector("[role=dialog]")', 'created by UI');
  const uiId = await evaluate('[...document.querySelectorAll("[data-navodka-id]")].find(el=>el.textContent.includes("QA browser create")).dataset.navodkaId');
  await evaluate('document.querySelector("[data-navodka-id]").querySelector("button[aria-expanded]").click()');
  await poll('document.body.textContent.includes("Видалити наводку")', 'delete in expanded panel');
  await click('Видалити наводку'); await poll('!!document.getElementById("navodka-delete-title")', 'delete confirmation');
  await click('Скасувати'); await wait(350);
  assert.ok(await db.collection('navodkas').findOne({ _id: new ObjectId(uiId) }));
  await click('Видалити наводку'); await poll('!!document.getElementById("navodka-delete-title")', 'confirm again'); await click('Видалити');
  await poll('!document.querySelector("[role=dialog]")&&!document.body.textContent.includes("QA browser create")', 'delete saved');
  assert.equal(await db.collection('navodkas').findOne({ _id: new ObjectId(uiId) }), null);
  for (const width of [390, 320]) {
    await cdp('Emulation.setDeviceMetricsOverride', { width, height: 844, deviceScaleFactor: 1, mobile: true }); await wait(400);
    assert.equal(await evaluate('document.documentElement.scrollWidth<=innerWidth'), true, 'overflow at ' + width);
    const metrics = await evaluate('(()=>{const input=document.getElementById("navodky-search");return {field:input.closest(".MuiTextField-root").getBoundingClientRect().width,input:input.getBoundingClientRect().width};})()');
    console.log('Mobile field width:', width, JSON.stringify(metrics));
    await shot('navodky-mobile-' + width + '.png');
    assert.ok(metrics.field>240, 'mobile fields squeezed by sidebar/padding');
  }
  await shot('navodky-mobile.png');
  await cdp('Network.clearBrowserCookies');
  await cdp('Network.setCookies', { cookies: [...clients.agent.jar].map(([name, value]) => ({ name, value, url: base, path: '/', httpOnly: true, sameSite: 'Lax' })) });
  await cdp('Page.navigate', { url: base + '/crm/navodky4' });
  await poll('document.querySelectorAll("[data-navodka-id]").length===5 && document.querySelectorAll("[data-phone-visible=false]").length>=2', 'employee page');
  assert.ok(!await evaluate('document.body.textContent.includes("+380000000103")'));
  assert.ok(await evaluate('document.body.textContent.includes("Телефон закритий")'));
  assert.equal(errors.length, 0, errors.join('\n')); assert.equal(badScripts.length, 0, badScripts.join('\n'));
  console.log('PASS browser: all header themes/dialogs, period/reset filters, create/delete/cancel, mobile 320/390, employee phone visibility, no console/runtime/script errors');
  await cdp('Browser.close');
})().catch(error => { console.error('NAVODKY QA FAILED:', error.stack); process.exitCode = 1; }).finally(async () => {
  socket?.close(); browser?.kill();
  if (server) { server.closeAllConnections?.(); await new Promise(resolve => server.close(resolve)); }
  await app?.close();
  await require('mongoose').disconnect();
  if (db && db.databaseName === dbName && /^krm_navqa_[a-f0-9]{16}$/.test(dbName)) { await db.dropDatabase(); console.log('Temporary QA database removed.'); }
  await client?.close();
  process.exit(process.exitCode || 0);
});
