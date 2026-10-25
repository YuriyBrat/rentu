import Employee from '@/models/Employee';
import connectDB from '@/config/database';
import { getSessionUser } from '@/utils/getSessionUser';
import { canEnterCrmWorkspace, getEmployeeScopeIds } from './accessControl';
import { canWriteNavodkas, elevatedNavodkaUser, navodkaError, isNavodkaOriginAllowed } from './navodky.mjs';

export const navodkaJson = (data, status = 200) => Response.json(data, { status, headers: { 'Cache-Control': 'no-store' } });

export async function navodkaActor(write = false) {
  const user = await getSessionUser();
  if (!user) throw navodkaError('Увійдіть у CRM.', 401);
  if (!canEnterCrmWorkspace(user) || (write && !canWriteNavodkas(user))) throw navodkaError('Недостатньо прав для цієї дії.', 403);
  await connectDB();
  const scopeIds = await getEmployeeScopeIds(user);
  return { user, scopeIds, elevated: elevatedNavodkaUser(user) };
}

export function checkNavodkaOrigin(request) {
  if (!isNavodkaOriginAllowed(request.headers.get('origin'), { requestOrigin: request.nextUrl.origin, host: request.headers.get('host'), authUrl: process.env.NEXTAUTH_URL })) throw navodkaError('Запит із цього сайту не дозволений.', 403);
}

export async function navodkaRequestBody(request) {
  checkNavodkaOrigin(request);
  if (!request.headers.get('content-type')?.includes('application/json')) throw navodkaError('Потрібні дані у форматі JSON.', 415);
  if (Number(request.headers.get('content-length')) > 20000) throw navodkaError('Завеликий запит.', 413);
  let text;
  try { text = await request.text(); } catch { throw navodkaError('Не вдалося прочитати запит.'); }
  if (text.length > 20000) throw navodkaError('Завеликий запит.', 413);
  try { return JSON.parse(text); } catch { throw navodkaError('Не вдалося прочитати дані.'); }
}

export async function checkNavodkaAssignment(actor, employeeId) {
  if (!employeeId) return;
  if (!actor.elevated && !actor.scopeIds.includes(employeeId)) throw navodkaError('Призначати наводку можна собі або своїм підлеглим.', 403);
  if (!await Employee.exists({ _id: employeeId })) throw navodkaError('Працівника не знайдено.');
}

export function navodkaFailure(error) {
  if (error.status) return navodkaJson({ error: error.message }, error.status);
  console.error('Navodka request failed:', error.name || 'Error');
  return navodkaJson({ error: 'Не вдалося виконати дію з наводкою. Спробуйте ще раз.' }, 500);
}
