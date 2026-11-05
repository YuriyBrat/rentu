// Shared by the browser and API; no database dependencies.
export function normalizePhone(value) {
   const raw = String(value || '').trim();
   let digits = raw.replace(/\D/g, '');
   if (digits.startsWith('38') && (digits.length > 10 || raw.startsWith('+38'))) {
      digits = digits.slice(2);
   } else if (digits.startsWith('8') && digits.length > 10) {
      digits = digits.slice(1);
   }
   if (digits.length === 9 && !digits.startsWith('0')) digits = `0${digits}`;
   return digits;
}

export function getPhoneValidation(value) {
   const normalized = normalizePhone(value);
   const hasValue = !!String(value || '').trim();
   const isValid = /^0[1-9]\d{8}$/.test(normalized);
   const error = isValid ? ''
      : !hasValue ? 'Телефон не вказано.'
      : normalized.length < 10 ? `Неповний номер: ${normalized.length} із 10 цифр.`
      : normalized.length > 10 ? 'Забагато цифр. Вкажи один номер у форматі 0XXXXXXXXX.'
      : 'Перевір номер: очікується формат 0XXXXXXXXX.';
   return { normalized, hasValue, isValid, error };
}
