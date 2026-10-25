import Navodka from '@/models/Navodka';
import Employee from '@/models/Employee';
import { combineMongoFilters } from '@/utils/crm/accessControl';
import { navodkaActor, navodkaJson, navodkaFailure, navodkaRequestBody, checkNavodkaAssignment } from '@/utils/crm/navodkaAccess';
import { buildNavodkaQuery, navodkaScopeFilter, serializeNavodka, validateNavodkaBody, redactNavodkaPhones, kyivDayStart, NAVODKA_EMPLOYEE_FIELDS } from '@/utils/crm/navodky.mjs';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const actor = await navodkaActor();
    const query = buildNavodkaQuery(request.nextUrl.searchParams);
    // Free text can contain phones in any field. Restrict searches to the actor's
    // scope so result counts cannot be used to guess another team's number.
    const scope = navodkaScopeFilter(actor.user, actor.scopeIds);
    const unsafeSource = typeof query.filter.source === 'string' && redactNavodkaPhones(query.filter.source) !== query.filter.source;
    const filter = combineMongoFilters(query.filter, (query.q || unsafeSource) && !actor.elevated ? scope : {});
    const today = kyivDayStart(query.today), tomorrow = kyivDayStart(query.tomorrow);
    const [items, total, sources, employees, contactToday, overdue, active] = await Promise.all([
      Navodka.find(filter).populate('assignedTo', NAVODKA_EMPLOYEE_FIELDS).populate('createdBy', NAVODKA_EMPLOYEE_FIELDS).populate('notes.createdBy', NAVODKA_EMPLOYEE_FIELDS).sort(query.sort).skip((query.page - 1) * query.pageSize).limit(query.pageSize).lean(),
      Navodka.countDocuments(filter),
      Navodka.distinct('source'),
      Employee.find(actor.elevated ? {} : { _id: { $in: actor.scopeIds } }).select('name firstName lastName avatarUrl isActive').sort({ name: 1 }).lean(),
      Navodka.countDocuments(combineMongoFilters(filter, { nextContactAt: { $gte: today, $lt: tomorrow } })),
      Navodka.countDocuments(combineMongoFilters(filter, { nextContactAt: { $ne: null, $lt: today } })),
      Navodka.countDocuments(combineMongoFilters(filter, { status: { $in: ['active', 'contact'] } })),
    ]);
    return navodkaJson({
      items: items.map(item => serializeNavodka(item, actor.user, actor.scopeIds)),
      pagination: { total, page: query.page, pageSize: query.pageSize, pages: Math.ceil(total / query.pageSize) },
      stats: { total, today: contactToday, overdue, active },
      filters: {
        sources: sources.filter(value => value && (actor.elevated || redactNavodkaPhones(value) === value)).sort((a, b) => a.localeCompare(b, 'uk')),
        employees: employees.map(employee => ({ _id: employee._id, name: employee.name || [employee.firstName, employee.lastName].filter(Boolean).join(' '), isActive: employee.isActive !== false })),
      },
      permissions: { canCreate: actor.elevated || (actor.user.role !== 'viewer' && !!actor.user.employeeId), canManageAll: actor.elevated, employeeId: actor.user.employeeId },
    });
  } catch (error) { return navodkaFailure(error); }
}

export async function POST(request) {
  try {
    const actor = await navodkaActor(true);
    const payload = validateNavodkaBody(await navodkaRequestBody(request));
    if (!actor.elevated && !actor.user.employeeId) return navodkaJson({ error: 'До облікового запису не прив’язаний працівник.' }, 403);
    delete payload.newNote;
    payload.assignedTo ||= actor.elevated ? null : actor.user.employeeId;
    await checkNavodkaAssignment(actor, payload.assignedTo);
    const created = await Navodka.create({ ...payload, createdBy: actor.user.employeeId || null });
    return navodkaJson(serializeNavodka(created.toObject(), actor.user, actor.scopeIds), 201);
  } catch (error) { return navodkaFailure(error); }
}
