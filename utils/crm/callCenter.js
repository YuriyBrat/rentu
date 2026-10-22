export const CALL_CENTER_ROLES = ['owner', 'admin', 'manager', 'callcenter', 'realtor'];
export const CALL_OUTCOMES = {
   reached: 'Поговорили',
   no_answer: 'Не відповів',
   busy: 'Зайнято',
   callback: 'Передзвонити',
   wrong_number: 'Неправильний номер',
};
export const CALL_PRIORITIES = {
   interesting: { label: 'Цікаве', color: '#60a5fa', rank: 1 },
   priority: { label: 'Пріоритет', color: '#f59e0b', rank: 2 },
   urgent: { label: 'Терміново', color: '#fb7185', rank: 3 },
};
export const CALL_LEASE_MS = 5 * 60 * 1000;

export function getCallActor(sessionUser) {
   return {
      key: String(sessionUser?.employeeId || sessionUser?.userId || sessionUser?.user?.id || ''),
      name: sessionUser?.user?.name || 'Працівник',
      employeeId: sessionUser?.employeeId || null,
      role: sessionUser?.role || '',
   };
}

export function isCallClaimActive(item, now = Date.now()) {
   return !!item?.callQueue?.ownerKey && new Date(item.callQueue.expiresAt || 0).getTime() > Number(now);
}

export function callClaimConflict(item, actorKey, now = Date.now()) {
   return isCallClaimActive(item, now) && item.callQueue.ownerKey !== actorKey;
}

export function getOpenCallRequests(item) {
   return (item?.callRequests || []).filter(request => !request.resolvedAt);
}

export function getCallPriority(item) {
   return getOpenCallRequests(item).reduce((best, request) => {
      const priority = CALL_PRIORITIES[request.level];
      return priority && (!best || priority.rank > best.rank) ? priority : best;
   }, null);
}

// Calendar dates in Kyiv remain stable through daylight-saving transitions.
export function kyivDateKey(date = new Date()) {
   return new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Europe/Kyiv', year: 'numeric', month: '2-digit', day: '2-digit',
   }).format(date);
}

export function callPeriodStart(days = 1, now = new Date()) {
   const key = kyivDateKey(now);
   const date = new Date(`${key}T00:00:00Z`);
   date.setUTCDate(date.getUTCDate() - days + 1);
   // Find local midnight instead of assuming a fixed UTC offset.
   const parts = new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Europe/Kyiv', hour: '2-digit', hourCycle: 'h23',
   }).format(date);
   return new Date(date.getTime() - Number(parts) * 3600000);
}
