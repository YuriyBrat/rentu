// Pure query/visibility rules shared by the API and its regression tests.
const id = value => value?._id?.toString?.() || value?.toString?.() || '';
export const NAVODKA_STATUSES = ['active', 'contact', 'waiting', 'converted', 'lost'];
export const NAVODKA_READINESS = ['soon', 'q1', 'q2', 'later', 'unknown'];
export const NAVODKA_EMPLOYEE_FIELDS = 'name firstName lastName avatarUrl';
export const elevatedNavodkaUser = user => !!user?.isFallbackAdmin || ['owner', 'admin'].includes(user?.role);
export const canWriteNavodkas = user => !!user && (elevatedNavodkaUser(user) || user.role !== 'viewer');
export const escapeNavodkaRegex = value => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export function navodkaScopeFilter(user, scopeIds) {
  if (elevatedNavodkaUser(user)) return {};
  return scopeIds.length ? { $or: [{ assignedTo: { $in: scopeIds } }, { createdBy: { $in: scopeIds } }] } : { _id: null };
}

export function navodkaPermissions(user, scopeIds, item) {
  const canViewPhone = elevatedNavodkaUser(user) || [item.assignedTo, item.createdBy].some(value => scopeIds.includes(id(value)) && !!id(value));
  const canEdit = canViewPhone && canWriteNavodkas(user);
  return { canViewPhone, canEdit, canDelete: canEdit };
}

// A contact pasted into a title/source/location must not bypass phone visibility.
export function redactNavodkaPhones(value, actualPhone = '') {
  let text = String(value || '');
  const digits = String(actualPhone).replace(/\D/g, '');
  if (digits.length >= 7) {
    const pattern = digits.split('').join('[\\s().+\\-]*');
    text = text.replace(new RegExp(`\\+?${pattern}`, 'g'), '[телефон приховано]');
    if (digits.startsWith('38') && digits.length === 12) text = text.replace(new RegExp(digits.slice(2).split('').join('[\\s().+\\-]*'), 'g'), '[телефон приховано]');
  }
  return text.replace(/\+?\d[\d\s().-]{5,}\d/g, match => match.replace(/\D/g, '').length >= 7 ? '[телефон приховано]' : match);
}

export function serializeNavodka(item, user, scopeIds) {
  const permissions = navodkaPermissions(user, scopeIds, item);
  // Explicit allowlist also excludes future fields/embedded contacts by default.
  const result = { _id: item._id, ...permissions, phoneHidden: !permissions.canViewPhone };
  for (const key of ['title', 'ownerName', 'source', 'status', 'readiness', 'propertyType', 'locationText', 'priceExpectation']) {
    result[key] = permissions.canViewPhone ? item[key] || '' : redactNavodkaPhones(item[key], item.phone);
  }
  for (const key of ['createdAt', 'updatedAt', 'lastContactAt', 'nextContactAt']) result[key] = item[key] || null;
  for (const key of ['assignedTo', 'createdBy']) {
    const employee = item[key];
    result[key] = employee?._id ? { _id: employee._id, name: redactNavodkaPhones(employee.name || `${employee.firstName || ''} ${employee.lastName || ''}`.trim()), avatarUrl: employee.avatarUrl || '' } : employee || null;
  }
  result.phone = permissions.canViewPhone ? item.phone || '' : '';
  result.description = permissions.canViewPhone ? item.description || '' : '';
  result.notes = permissions.canViewPhone ? (item.notes || []).map(note => ({
    _id: note._id, text: note.text, type: note.type || note.noteType, activityType: note.activityType,
    contactDate: note.contactDate, nextContactAt: note.nextContactAt, createdAt: note.createdAt,
    createdBy: note.createdBy?._id ? { _id: note.createdBy._id, name: note.createdBy.name || '' } : note.createdBy || null,
  })) : [];
  return result;
}

export function navodkaError(message, status = 400) { return Object.assign(new Error(message), { status }); }

export function isNavodkaOriginAllowed(origin, { requestOrigin, host, authUrl } = {}) {
  if (!origin) return true;
  try {
    const url = new URL(origin);
    if (!['http:', 'https:'].includes(url.protocol) || url.origin !== origin) return false;
    const allowed = new Set(['https://karamax.com.ua', 'https://www.karamax.com.ua', requestOrigin]);
    try { if (authUrl) allowed.add(new URL(authUrl).origin); } catch {}
    // Next/proxies can normalize nextUrl to localhost. The browser's actual
    // HTTP Host still identifies same-origin LAN/127.0.0.1 requests correctly.
    return allowed.has(origin) || (!!host && url.host.toLowerCase() === host.trim().toLowerCase());
  } catch { return false; }
}

const kyiv = new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Kyiv', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23' });
export function kyivDateString(date = new Date()) {
  const parts = Object.fromEntries(kyiv.formatToParts(date).map(part => [part.type, part.value]));
  return `${parts.year}-${parts.month}-${parts.day}`;
}
export function shiftCalendarDate(value, days) {
  const date = new Date(`${value}T12:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}
export function kyivDayStart(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) throw navodkaError('Перевірте дату періоду.');
  const midnight = Date.parse(`${value}T00:00:00Z`);
  if (!Number.isFinite(midnight) || new Date(midnight).toISOString().slice(0, 10) !== value) throw navodkaError('Перевірте дату періоду.');
  let time = midnight;
  for (let i = 0; i < 3; i++) {
    const p = Object.fromEntries(kyiv.formatToParts(new Date(time)).map(part => [part.type, part.value]));
    time = midnight - (Date.UTC(+p.year, +p.month - 1, +p.day, +p.hour, +p.minute, +p.second) - time);
  }
  return new Date(time);
}

export function buildNavodkaQuery(params, now = new Date()) {
  const page = Math.min(Math.max(Number.parseInt(params.get('page'), 10) || 1, 1), 100000);
  const pageSize = Math.min(Math.max(Number.parseInt(params.get('pageSize'), 10) || 25, 1), 100);
  const q = (params.get('q') || '').trim().slice(0, 180);
  const filter = {};
  const status = params.get('status');
  if (status && status !== 'all') {
    if (!NAVODKA_STATUSES.includes(status)) throw navodkaError('Невідомий статус.');
    filter.status = status;
  }
  const readiness = params.get('readiness');
  if (readiness && readiness !== 'all') {
    if (!NAVODKA_READINESS.includes(readiness)) throw navodkaError('Невідомий строк продажу.');
    filter.readiness = readiness;
  }
  const source = (params.get('source') || '').slice(0, 180);
  if (source && source !== 'all') filter.source = source === '__none__' ? { $in: ['', null] } : source;
  const assignedTo = params.get('assignedTo');
  if (assignedTo && assignedTo !== 'all') {
    if (assignedTo !== '__none__' && !/^[a-f\d]{24}$/i.test(assignedTo)) throw navodkaError('Некоректний відповідальний.');
    filter.assignedTo = assignedTo === '__none__' ? null : assignedTo;
  }
  const today = kyivDateString(now), tomorrow = shiftCalendarDate(today, 1);
  const contact = params.get('contactFilter');
  if (contact && contact !== 'all') {
    if (contact === 'today') filter.nextContactAt = { $gte: kyivDayStart(today), $lt: kyivDayStart(tomorrow) };
    else if (contact === 'overdue') filter.nextContactAt = { $ne: null, $lt: kyivDayStart(today) };
    else if (contact === 'planned') filter.nextContactAt = { $gte: kyivDayStart(tomorrow) };
    else if (contact === 'unscheduled') filter.nextContactAt = null;
    else throw navodkaError('Невідомий фільтр контакту.');
  }
  const period = params.get('period') || 'all';
  let from = params.get('from') || '', to = params.get('to') || '';
  if (period === 'today') from = to = today;
  else if (period === '7d' || period === '30d') { from = shiftCalendarDate(today, period === '7d' ? -6 : -29); to = today; }
  else if (!['all', 'custom'].includes(period)) throw navodkaError('Невідомий період.');
  const dateField = params.get('dateField') || 'updatedAt';
  if (!['createdAt', 'updatedAt'].includes(dateField)) throw navodkaError('Невідомий тип дати.');
  if (period !== 'all' && (from || to)) {
    if (from && to && from > to) throw navodkaError('Початок періоду має бути раніше завершення.');
    filter[dateField] = { ...(from ? { $gte: kyivDayStart(from) } : {}), ...(to ? { $lt: kyivDayStart(shiftCalendarDate(kyivDateString(kyivDayStart(to)), 1)) } : {}) };
  }
  const sortKey = params.get('sort') || 'updatedAt';
  const sorts = { updatedAt: { updatedAt: -1, createdAt: -1, _id: -1 }, createdAt: { createdAt: -1, _id: -1 }, nextContactAt: { nextContactAt: 1, updatedAt: -1, _id: -1 } };
  if (!Object.hasOwn(sorts, sortKey)) throw navodkaError('Невідоме сортування.');
  if (q) filter.$or = ['title', 'ownerName', 'phone', 'locationText', 'source', 'description'].map(key => ({ [key]: { $regex: escapeNavodkaRegex(q), $options: 'i' } }));
  return { filter, sort: sorts[sortKey], page, pageSize, q, today, tomorrow };
}

export function validateNavodkaBody(body, { partial = false } = {}) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) throw navodkaError('Перевірте дані наводки.');
  const result = {};
  for (const [key, max] of Object.entries({ title: 180, ownerName: 120, phone: 80, source: 180, propertyType: 100, locationText: 300, priceExpectation: 100, description: 6000 })) {
    if (key in body) {
      if (typeof body[key] !== 'string' || body[key].length > max) throw navodkaError(`Перевірте поле «${key}».`);
      result[key] = body[key].trim();
    }
  }
  for (const [key, label] of [['title', 'Назва'], ['ownerName', 'Ім’я власника'], ['phone', 'Телефон']]) if ((!partial || key in result) && !result[key]) throw navodkaError(`${label} — обов’язкове поле.`);
  for (const [key, choices, fallback] of [['status', NAVODKA_STATUSES, 'active'], ['readiness', NAVODKA_READINESS, 'unknown']]) {
    if (key in body || !partial) {
      result[key] = body[key] || fallback;
      if (!choices.includes(result[key])) throw navodkaError(`Некоректне значення ${key}.`);
    }
  }
  for (const key of ['lastContactAt', 'nextContactAt']) if (key in body) {
    result[key] = body[key] ? new Date(body[key]) : null;
    if (result[key] && (typeof body[key] !== 'string' || !Number.isFinite(result[key].getTime()))) throw navodkaError('Перевірте дату контакту.');
  }
  if ('assignedTo' in body) {
    if (body.assignedTo !== null && body.assignedTo !== '' && (typeof body.assignedTo !== 'string' || !/^[a-f\d]{24}$/i.test(body.assignedTo))) throw navodkaError('Некоректний відповідальний.');
    result.assignedTo = body.assignedTo || null;
  }
  if (body.newNote != null) {
    const note = body.newNote;
    if (typeof note !== 'object' || Array.isArray(note) || typeof note.text !== 'string' || !note.text.trim() || note.text.length > 6000) throw navodkaError('Заповніть текст нотатки (до 6000 символів).');
    result.newNote = { text: note.text.trim(), type: note.type || 'info', activityType: note.activityType || 'note' };
    if (!['positive', 'negative', 'info', 'important'].includes(result.newNote.type) || !['note', 'call', 'message', 'meeting'].includes(result.newNote.activityType)) throw navodkaError('Перевірте тип нотатки.');
    for (const key of ['contactDate', 'nextContactAt']) {
      result.newNote[key] = note[key] ? new Date(note[key]) : null;
      if (result.newNote[key] && (typeof note[key] !== 'string' || !Number.isFinite(result.newNote[key].getTime()))) throw navodkaError('Перевірте дату нотатки.');
    }
  }
  return result;
}
