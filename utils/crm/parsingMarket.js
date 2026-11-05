export const PARSING_MARKET_REASONS = {
   inactive: [
      ['sold_us', 'Проданий нами'], ['sold_owner', 'Проданий власником'],
      ['sold_not_us', 'Проданий не нами'], ['removed', 'Знято з продажу'], ['unknown', 'Невідома причина'],
   ],
   paused: [
      ['deposit', 'Завдаток'], ['thinking', 'Власник думає'], ['pause', 'Пауза'], ['unknown', 'Невідомо'],
   ],
};

export function getParsingMarketState(item) {
   const property = item?.propertyId;
   if (item?.stage !== 'moved' || !property || typeof property !== 'object') return null;
   const group = property.actualityGroup;
   const options = PARSING_MARKET_REASONS[group];
   if (!options) return null;
   const note = String(property.actualityNote || '').trim();
   let reason = options.find(([value, label]) => value === note || label === note)?.[0];
   const status = String(property.actualityStatus || '');
   if (!reason) {
      reason = group === 'paused' && status.includes('Завдаток') ? 'deposit'
         : group === 'inactive' && status.includes('Реалізований мною') ? 'sold_us'
         : group === 'inactive' && status.includes('Реалізований не мною') ? 'sold_not_us'
         : group === 'inactive' && status.includes('Знятий з реалізації') ? 'removed' : 'unknown';
   }
   const label = reason === 'unknown' ? (group === 'inactive' ? 'Неактуальний' : 'Зупинений')
      : options.find(([value]) => value === reason)[1];
   return { group, reason, label };
}

export function buildParsingMarketPatch(group, requestedReason, previous = {}, note, now = new Date()) {
   const options = PARSING_MARKET_REASONS[group];
   const previousState = getParsingMarketState({ stage: 'moved', propertyId: previous });
   const value = requestedReason || (previousState?.group === group ? previousState.reason : 'unknown');
   const reason = options?.some(([key]) => key === value) ? value : 'unknown';
   const statuses = {
      sold_us: 'Неактуальний. Реалізований мною',
      sold_owner: 'Неактуальний. Реалізований не мною',
      sold_not_us: 'Неактуальний. Реалізований не мною',
      removed: 'Неактуальний. Знятий з реалізації',
      deposit: 'Зупинений. Завдаток не мій',
      thinking: 'Зупинений. Виявлена причина власників',
      pause: 'Зупинений. Виявлена причина власників',
   };
   const activeStatus = previous.actualityGroup === 'active' && String(previous.actualityStatus || '').startsWith('Актуальний.')
      ? previous.actualityStatus : ['rs', 'ds', 'zs'].includes(previous.crmStage)
         ? 'Актуальний. Оглянутий! В роботі' : 'Актуальний. Продзвін';
   return {
      actualityGroup: group,
      actualityStatus: group === 'active' ? activeStatus : statuses[reason] || (group === 'inactive'
         ? 'Неактуальний. Невідома причина' : 'Зупинений. Невиявлена причина власників'),
      actualityNote: String(note ?? (group === 'active' ? '' : reason)).trim(),
      inactiveAt: group === 'inactive' ? previous.inactiveAt || now : null,
      inactiveNote: group === 'inactive' ? options.find(([key]) => key === reason)[1] : '',
   };
}

export function parsingPropertySnapshot(property) {
   return Object.fromEntries(['_id', 'title', 'actualityGroup', 'actualityStatus', 'actualityNote', 'crmStage', 'assignee']
      .filter(key => property?.[key] !== undefined).map(key => [key, property[key]]));
}
