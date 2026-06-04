export const COMMUNICATION_TYPE_OPTIONS = [
   { value: 'call', label: 'Дзвінок' },
   { value: 'sms', label: 'SMS' },
   { value: 'messenger', label: 'Месенджер' },
   { value: 'note', label: 'Нотатка' },
];

export const COMMUNICATION_TONE_OPTIONS = [
   { value: 'positive', label: 'Позитивна', color: '#22c55e' },
   { value: 'negative', label: 'Негативна', color: '#ef4444' },
   { value: 'important', label: 'Важлива', color: '#3b82f6' },
   { value: 'info', label: 'Інформаційна', color: '#f59e0b' },
];

export function getCommunicationTypeLabel(value) {
   return COMMUNICATION_TYPE_OPTIONS.find((item) => item.value === value)?.label || value || 'Нотатка';
}

export function getCommunicationToneMeta(value) {
   return COMMUNICATION_TONE_OPTIONS.find((item) => item.value === value) || COMMUNICATION_TONE_OPTIONS[3];
}

export function toDatetimeLocal(value = new Date()) {
   const d = value instanceof Date ? value : new Date(value);
   if (Number.isNaN(d.getTime())) return '';

   const pad = (n) => String(n).padStart(2, '0');
   return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
