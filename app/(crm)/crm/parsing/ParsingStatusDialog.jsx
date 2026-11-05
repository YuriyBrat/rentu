'use client';

import {
   Alert,
   Box,
   Button,
   Dialog,
   DialogActions,
   DialogContent,
   DialogTitle,
   CircularProgress,
   MenuItem,
   Stack,
   TextField,
   Typography,
} from '@mui/material';
import {
   COMMUNICATION_TONE_OPTIONS,
   COMMUNICATION_TYPE_OPTIONS,
   toDatetimeLocal,
} from '@/crm_components/communications/communicationMeta';
import DriveEtaRoundedIcon from '@mui/icons-material/DriveEtaRounded';
import PhoneMissedRoundedIcon from '@mui/icons-material/PhoneMissedRounded';
import { getParsingStageKey, isInspectionReservationActive } from './ParsingRowCard';
import { getPhoneValidation } from '@/utils/crm/phone';
import { getParsingMarketState, PARSING_MARKET_REASONS } from '@/utils/crm/parsingMarket';

const STATUS_OPTIONS = [
   { value: 'duplicate', label: 'Дубль' },
   { value: 'fake', label: 'Фейк' },
   { value: 'base', label: 'БАЗА' },
   { value: 'inactive', label: 'Неактуальний' },
   { value: 'paused', label: 'Зупинений' },
];

const CONTACT_TYPE_OPTIONS = [
   ['owner', 'Власник'],
   ['realtor', 'Маклер'],
   ['suspected_realtor', 'Ймов. маклер'],
   ['unknown', 'Невідомо'],
];

const INACTIVE_REASONS = PARSING_MARKET_REASONS.inactive;
const PAUSED_REASONS = PARSING_MARKET_REASONS.paused;

const INFO_VERIFIED_OPTIONS = [
   ['unchecked', 'Не перевірено'],
   ['verified', 'Перевірено'],
   ['partial', 'Частково'],
   ['mismatch', 'Є розбіжності'],
];

const INSPECTION_LOYALTY_OPTIONS = [
   ['unknown', 'Невідомо'],
   ['yes', 'Готовий до огляду'],
   ['maybe', 'Можливо'],
   ['no', 'Не готовий'],
];

const INTEREST_LEVEL_OPTIONS = [
   [1, '1 - нецікаво'],
   [2, '2 - слабкий інтерес'],
   [3, '3 - нормально'],
   [4, '4 - цікаво'],
   [5, '5 - дуже цікаво'],
];

const URGENCY_LEVEL_OPTIONS = [
   [1, '1 - взагалі не спішить'],
   [2, '2 - нетерміново'],
   [3, '3 - до 3 міс.'],
   [4, '4 - терміново'],
   [5, '5 - дуже терміново'],
];

const COOPERATION_WARMTH_OPTIONS = [
   [1, '1 - конфліктний'],
   [2, '2 - холодний'],
   [3, '3 - нормально'],
   [4, '4 - привітний'],
   [5, '5 - дуже привітний'],
];

const getFieldSx = (theme, mode) => ({
   '& .MuiOutlinedInput-root': {
      bgcolor: mode === 'light' ? 'rgba(124,58,237,0.035)' : 'rgba(255,255,255,0.04)',
      borderRadius: 2.5,
      color: theme.text,
      '& fieldset': { borderColor: theme.border },
      '&:hover fieldset': { borderColor: theme.accent },
      '&.Mui-focused fieldset': { borderColor: theme.accentLight },
   },
   '& .MuiInputLabel-root': { color: theme.textSoft },
   '& .MuiOutlinedInput-root.Mui-error fieldset': { borderColor: '#ef4444' },
   '& .MuiInputLabel-root.Mui-error': { color: '#ef4444' },
   '& .MuiInputBase-input': { color: `${theme.text} !important`, WebkitTextFillColor: theme.text },
   '& textarea': { color: `${theme.text} !important`, WebkitTextFillColor: theme.text },
   '& .MuiSelect-icon': { color: theme.text },
});

export function buildInitialStatusForm(item) {
   const allowedStatuses = STATUS_OPTIONS.map((option) => option.value);
   const contactType = item?.attrs?.contactType || item?.reviewStatus;
   const market = getParsingMarketState(item);
   const status = item?.propertyId?.actualityGroup === 'inactive' ? 'inactive'
      : item?.propertyId?.actualityGroup === 'paused' ? 'paused'
      : item?.stage === 'qualified'
      ? 'base'
      : allowedStatuses.includes(item?.stage)
         ? item.stage
         : 'base';

   return {
      status,
      contactType: CONTACT_TYPE_OPTIONS.some(([value]) => value === contactType) ? contactType : 'unknown',
      phone: item?.phone || '',
      leadname: item?.leadname || '',
      location_text: item?.callCenter?.verifiedAddressText?.trim() || item?.location_text || '',
      callOutcome: 'reached',
      nextContactAt: '',
      scheduleFollowup: false,
      submissionId: globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}-${Math.random().toString(36).slice(2)}`,
      duplicatePropertyId: item?.duplicatePropertyId?._id || item?.duplicatePropertyId || item?.phoneIntel?.relatedObjects?.[0]?._id || '',
      marketGroup: status === 'inactive' ? 'inactive' : status === 'paused' ? 'paused' : 'active',
      marketReason: market?.reason || (['inactive', 'paused'].includes(status) ? 'unknown' : ''),
      callCenter: {
         infoVerified: item?.callCenter?.infoVerified || 'unchecked',
         inspectionLoyalty: item?.callCenter?.inspectionLoyalty || 'unknown',
         bottomPrice: item?.callCenter?.bottomPrice || '',
         interestLevel: item?.callCenter?.interestLevel || '',
         urgencyLevel: item?.callCenter?.urgencyLevel || '',
         cooperationWarmth: item?.callCenter?.cooperationWarmth || '',
         note: item?.callCenter?.note || '',
      },
      communication: {
         type: 'call',
         tone: 'info',
         happenedAt: toDatetimeLocal(),
         text: '',
      },
   };
}

export default function ParsingStatusDialog({
   open,
   item,
   form,
   onChange,
   onClose,
   onSubmit,
   saving,
   error,
   theme,
   mode,
   duplicateSearch,
   duplicateCandidates,
   duplicateLoading,
   onDuplicateSearchChange,
   onReserveInspection,
   canReserveInspection,
   reservingInspection,
   canRecordCall = true,
   contactSaved = false,
}) {
   const fieldSx = getFieldSx(theme, mode);
   const phone = getPhoneValidation(form?.phone);
   const status = form?.status || 'raw';
   const noAnswer = form?.callOutcome === 'no_answer';
   const needsCommunication = ['base', 'inactive', 'paused', 'duplicate', 'fake'].includes(status);
   const showCallCenter = ['base', 'paused'].includes(status);
   const parsingStage = getParsingStageKey(item);
   const showReserveInspection = !noAnswer && !isInspectionReservationActive(item) &&
      (
         parsingStage === 'inspection_ready' ||
         (!!canReserveInspection && ['raw', 'base'].includes(parsingStage))
      );
   const possibleObjects = [
      ...(item?.phoneIntel?.relatedObjects || []),
      ...(duplicateCandidates || []),
   ].filter((property, index, list) => property?._id && list.findIndex((x) => x?._id === property._id) === index);

   const set = (key, value) => onChange?.({ ...form, [key]: value });
   const setCallCenter = (key, value) => onChange?.({
      ...form,
      callCenter: {
         ...(form?.callCenter || {}),
         [key]: value,
      },
   });
   const setCommunication = (key, value) => onChange?.({
      ...form,
      communication: {
         ...(form?.communication || {}),
         [key]: value,
      },
   });

   return (
      <Dialog
         open={open}
         onClose={saving ? undefined : onClose}
         fullWidth
         maxWidth={noAnswer ? 'sm' : 'md'}
         PaperProps={{
            sx: {
               borderRadius: 4,
               bgcolor: theme.bgPanel,
               color: theme.text,
               border: `1px solid ${theme.border}`,
            },
         }}
      >
         <DialogTitle sx={{ fontWeight: 950, pr: 3 }}>
            <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between" flexWrap="wrap" useFlexGap>
               <Typography component="span" sx={{ fontWeight: 950, fontSize: { xs: 17, sm: 20 } }}>
                  {noAnswer ? 'Недодзвін' : 'Результат контакту й статус об’єкта'}
               </Typography>
               {showReserveInspection && (
                  <Button
                     onClick={onReserveInspection}
                     disabled={saving || reservingInspection}
                     startIcon={<DriveEtaRoundedIcon />}
                     sx={{
                        borderRadius: 3,
                        fontWeight: 950,
                        color: '#083344',
                        bgcolor: '#67e8f9',
                        border: '1px solid rgba(34,211,238,0.82)',
                        whiteSpace: 'nowrap',
                        boxShadow: '0 8px 22px rgba(34,211,238,0.20)',
                        '&:hover': { bgcolor: '#22d3ee' },
                     }}
                  >
                     ЇДУ НА ОГЛЯД
                  </Button>
               )}
            </Stack>
         </DialogTitle>
         <DialogContent>
            <Stack spacing={1.4} sx={{ mt: 0.5 }}>
               {!!error && <Alert severity="error" sx={{ borderRadius: 2 }}>{error}</Alert>}

               <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.25} alignItems={{ xs: 'stretch', sm: 'center' }}>
               <Button
                  startIcon={<PhoneMissedRoundedIcon />}
                  onClick={() => onChange?.({
                     ...form,
                     callOutcome: noAnswer ? 'reached' : 'no_answer',
                     communication: {
                        ...form?.communication,
                        happenedAt: noAnswer ? form?.communication?.happenedAt : toDatetimeLocal(),
                     },
                  })}
                  disabled={saving || contactSaved || !canRecordCall}
                  aria-pressed={noAnswer}
                  title={noAnswer ? 'Повернути повну форму' : 'Зафіксувати недодзвін'}
                  sx={{ alignSelf: { xs: 'flex-start', sm: 'center' }, minHeight: 40, flexShrink: 0, borderRadius: 2, textTransform: 'none', fontWeight: 850, color: '#f59e0b', border: '1px solid rgba(245,158,11,0.45)', bgcolor: noAnswer ? 'rgba(245,158,11,0.16)' : 'transparent' }}
               >
                  Недодзвін
               </Button>
               {noAnswer && <TextField
                  label="Дата й час недодзвону"
                  type="datetime-local"
                  size="small"
                  value={form?.communication?.happenedAt || ''}
                  onChange={(event) => setCommunication('happenedAt', event.target.value)}
                  InputLabelProps={{ shrink: true }}
                  disabled={saving || contactSaved}
                  sx={{ ...fieldSx, flex: 1, minWidth: 0 }}
               />}
               </Stack>

               {noAnswer ? (
                  <Stack spacing={1} alignItems="flex-start">
                  <Button
                     size="small"
                     onClick={() => onChange?.({ ...form, scheduleFollowup: !form?.scheduleFollowup, nextContactAt: form?.scheduleFollowup ? '' : form?.nextContactAt || '' })}
                     disabled={saving || contactSaved}
                     sx={{ color: theme.textSoft, textTransform: 'none', px: 0 }}
                  >
                     {form?.scheduleFollowup ? 'Скасувати передзвін' : '+ Запланувати передзвін'}
                  </Button>
                  {form?.scheduleFollowup && <TextField
                     label="Коли передзвонити"
                     type="datetime-local"
                     size="small"
                     value={form?.nextContactAt || ''}
                     onChange={(event) => set('nextContactAt', event.target.value)}
                     InputLabelProps={{ shrink: true }}
                     helperText="Окремий час наступного дзвінка."
                     disabled={saving || contactSaved}
                     sx={{ ...fieldSx, width: '100%' }}
                  />}
                  </Stack>
               ) : <>
               <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, minmax(0, 1fr))' }, gap: 1 }}>
                  <TextField
                     select
                     label="Тип контакту"
                     value={form?.contactType || 'unknown'}
                     onChange={(event) => set('contactType', event.target.value)}
                     disabled={saving}
                     sx={fieldSx}
                  >
                     {CONTACT_TYPE_OPTIONS.map(([value, label]) => (
                        <MenuItem key={value} value={value}>{label}</MenuItem>
                     ))}
                  </TextField>
                  <TextField
                     label="Телефон"
                     type="tel"
                     value={form?.phone ?? ''}
                     onChange={(event) => set('phone', event.target.value)}
                     onBlur={() => { if (phone.isValid) set('phone', phone.normalized); }}
                     error={phone.hasValue && !phone.isValid}
                     helperText={phone.hasValue && !phone.isValid ? phone.error : undefined}
                     disabled={saving}
                     sx={fieldSx}
                  />
                  <TextField
                     label="Ім’я"
                     value={form?.leadname ?? ''}
                     onChange={(event) => set('leadname', event.target.value)}
                     disabled={saving}
                     sx={fieldSx}
                  />
               </Box>
               <Box>
                  <Typography sx={{ color: theme.textSoft, fontSize: 12, fontWeight: 900, mb: 0.75 }}>
                     Статус
                  </Typography>
                  <Stack direction="row" spacing={0.7} flexWrap="wrap" useFlexGap>
                     {STATUS_OPTIONS.map((option) => (
                        <Button
                           key={option.value}
                           disabled={saving}
                           onClick={() => {
                              if (option.value === 'inactive') {
                                 onChange?.({ ...form, status: option.value, marketGroup: 'inactive', marketReason: status === 'inactive' ? form?.marketReason || 'unknown' : 'unknown' });
                                 return;
                              }
                              if (option.value === 'paused') {
                                 onChange?.({ ...form, status: option.value, marketGroup: 'paused', marketReason: status === 'paused' ? form?.marketReason || 'unknown' : 'unknown' });
                                 return;
                              }
                              if (option.value === 'base') {
                                 onChange?.({ ...form, status: option.value, marketGroup: 'active', marketReason: '' });
                                 return;
                              }
                              set('status', option.value);
                           }}
                           sx={{
                              borderRadius: 2.5,
                              fontWeight: 950,
                              color: status === option.value ? '#0b0b12' : theme.text,
                              bgcolor: status === option.value ? theme.accent : 'transparent',
                              border: `1px solid ${status === option.value ? 'transparent' : theme.border}`,
                           }}
                        >
                           {option.label}
                        </Button>
                     ))}
                  </Stack>
               </Box>

               {status === 'duplicate' && (
                  <Stack spacing={1}>
                     <TextField
                        label="Пошук оригіналу"
                        value={duplicateSearch || ''}
                        onChange={(e) => onDuplicateSearchChange?.(e.target.value)}
                        sx={fieldSx}
                        helperText="Шукай по адресі, назві або телефону власника."
                        InputProps={{
                           endAdornment: duplicateLoading ? <CircularProgress size={18} sx={{ color: theme.textSoft }} /> : null,
                        }}
                     />
                     <TextField
                        select
                        label="Оригінал у нашій базі"
                        value={form?.duplicatePropertyId || ''}
                        onChange={(e) => set('duplicatePropertyId', e.target.value)}
                        sx={fieldSx}
                        helperText="Для дубля треба привʼязати наш обʼєкт, щоб потім не плутатись."
                     >
                        <MenuItem value="">Не вибрано</MenuItem>
                        {possibleObjects.map((property) => (
                           <MenuItem key={property._id} value={property._id}>
                              {property.displayTitle || property.title || property.location_text || property._id}
                           </MenuItem>
                        ))}
                     </TextField>
                  </Stack>
               )}

               {['inactive', 'paused'].includes(status) && (
                  <Box
                     sx={{
                        p: 1.2,
                        borderRadius: 2.5,
                        border: `1px solid ${theme.border}`,
                        bgcolor: mode === 'light' ? 'rgba(124,58,237,0.035)' : 'rgba(255,255,255,0.025)',
                     }}
                  >
                     <Typography sx={{ color: theme.text, fontWeight: 950, mb: 0.8 }}>
                        {status === 'inactive' ? 'Причина неактуальності' : 'Причина зупинки'}
                     </Typography>

                     {status === 'inactive' && (
                        <TextField
                           select
                           label="Причина неактуальності"
                           value={form?.marketReason || ''}
                           onChange={(e) => set('marketReason', e.target.value)}
                           sx={fieldSx}
                        >
                           {INACTIVE_REASONS.map(([value, label]) => (
                              <MenuItem key={value} value={value}>{label}</MenuItem>
                           ))}
                        </TextField>
                     )}

                     {status === 'paused' && (
                        <TextField
                           select
                           label="Причина зупинки"
                           value={form?.marketReason || ''}
                           onChange={(e) => set('marketReason', e.target.value)}
                           sx={fieldSx}
                        >
                           {PAUSED_REASONS.map(([value, label]) => (
                              <MenuItem key={value} value={value}>{label}</MenuItem>
                           ))}
                        </TextField>
                     )}
                  </Box>
               )}

               {showCallCenter && (
                  <Box
                     sx={{
                        p: 1.2,
                        borderRadius: 2.5,
                        border: `1px solid ${theme.border}`,
                        bgcolor: mode === 'light' ? 'rgba(124,58,237,0.035)' : 'rgba(255,255,255,0.025)',
                     }}
                  >
                     <Typography sx={{ color: theme.text, fontWeight: 950, mb: 0.9 }}>
                        Технічка продзвону
                     </Typography>

                     <Box
                        sx={{
                           display: 'grid',
                           gridTemplateColumns: { xs: '1fr', md: 'repeat(4, 1fr)' },
                           gap: 1,
                        }}
                     >
                        <TextField
                           label="Точна адреса"
                           value={form?.location_text ?? ''}
                           onChange={(e) => set('location_text', e.target.value)}
                           sx={{ ...fieldSx, gridColumn: { xs: 'auto', md: 'span 2' } }}
                        />

                        <TextField
                           select
                           label="Перевірка інформації"
                           value={form?.callCenter?.infoVerified || 'unchecked'}
                           onChange={(e) => setCallCenter('infoVerified', e.target.value)}
                           sx={fieldSx}
                        >
                           {INFO_VERIFIED_OPTIONS.map(([value, label]) => (
                              <MenuItem key={value} value={value}>{label}</MenuItem>
                           ))}
                        </TextField>

                        <TextField
                           select
                           label="Лояльність до огляду"
                           value={form?.callCenter?.inspectionLoyalty || 'unknown'}
                           onChange={(e) => setCallCenter('inspectionLoyalty', e.target.value)}
                           sx={fieldSx}
                        >
                           {INSPECTION_LOYALTY_OPTIONS.map(([value, label]) => (
                              <MenuItem key={value} value={value}>{label}</MenuItem>
                           ))}
                        </TextField>

                        <TextField
                           label="Гранично низька ціна"
                           value={form?.callCenter?.bottomPrice || ''}
                           onChange={(e) => setCallCenter('bottomPrice', e.target.value)}
                           sx={fieldSx}
                        />

                        <TextField
                           select
                           label="Цікавість нам"
                           value={form?.callCenter?.interestLevel || ''}
                           onChange={(e) => setCallCenter('interestLevel', e.target.value)}
                           sx={fieldSx}
                        >
                           <MenuItem value="">Не вказано</MenuItem>
                           {INTEREST_LEVEL_OPTIONS.map(([value, label]) => (
                              <MenuItem key={value} value={value}>{label}</MenuItem>
                           ))}
                        </TextField>

                        <TextField
                           select
                           label="Терміновість"
                           value={form?.callCenter?.urgencyLevel || ''}
                           onChange={(e) => setCallCenter('urgencyLevel', e.target.value)}
                           sx={fieldSx}
                           helperText="3 - до 3 міс., 5 - дуже терміново"
                        >
                           <MenuItem value="">Не вказано</MenuItem>
                           {URGENCY_LEVEL_OPTIONS.map(([value, label]) => (
                              <MenuItem key={value} value={value}>{label}</MenuItem>
                           ))}
                        </TextField>

                        <TextField
                           select
                           label="Теплість співпраці"
                           value={form?.callCenter?.cooperationWarmth || ''}
                           onChange={(e) => setCallCenter('cooperationWarmth', e.target.value)}
                           sx={fieldSx}
                        >
                           <MenuItem value="">Не вказано</MenuItem>
                           {COOPERATION_WARMTH_OPTIONS.map(([value, label]) => (
                              <MenuItem key={value} value={value}>{label}</MenuItem>
                           ))}
                        </TextField>

                        <TextField
                           label="Нотатка колцентру"
                           value={form?.callCenter?.note || ''}
                           onChange={(e) => setCallCenter('note', e.target.value)}
                           multiline
                           minRows={2}
                           sx={{ ...fieldSx, gridColumn: { xs: 'auto', md: 'span 4' } }}
                        />
                     </Box>
                  </Box>
               )}

               {needsCommunication && (
                  <Box
                     sx={{
                        p: 1.2,
                        borderRadius: 2.5,
                        border: `1px solid ${theme.border}`,
                        bgcolor: mode === 'light' ? 'rgba(255,255,255,0.72)' : 'rgba(255,255,255,0.025)',
                     }}
                  >
                     <Typography sx={{ color: theme.text, fontWeight: 950, mb: 0.9 }}>
                        Комунікація
                     </Typography>
                     <Stack spacing={1}>
                        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
                           <TextField
                              select
                              label="Тип"
                              disabled={saving || contactSaved}
                              value={form?.communication?.type || 'call'}
                              onChange={(e) => setCommunication('type', e.target.value)}
                              sx={{ ...fieldSx, flex: 1 }}
                           >
                              {COMMUNICATION_TYPE_OPTIONS.map((option) => (
                                 <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
                              ))}
                           </TextField>
                           <TextField
                              select
                              label="Тон"
                              disabled={saving || contactSaved}
                              value={form?.communication?.tone || 'info'}
                              onChange={(e) => setCommunication('tone', e.target.value)}
                              sx={{ ...fieldSx, flex: 1 }}
                           >
                              {COMMUNICATION_TONE_OPTIONS.map((option) => (
                                 <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
                              ))}
                           </TextField>
                        </Stack>
                        <TextField
                           label="Дата і час контакту"
                           disabled={saving || contactSaved}
                           type="datetime-local"
                           value={form?.communication?.happenedAt || ''}
                           onChange={(e) => setCommunication('happenedAt', e.target.value)}
                           InputLabelProps={{ shrink: true }}
                           sx={fieldSx}
                        />
                        <TextField
                           label="Опис"
                           disabled={saving || contactSaved}
                           value={form?.communication?.text || ''}
                           onChange={(e) => setCommunication('text', e.target.value)}
                           multiline
                           minRows={3}
                           sx={fieldSx}
                        />
                     </Stack>
                  </Box>
               )}
               {form?.communication?.type === 'call' && canRecordCall && (
                  <TextField
                     label="Наступний дзвінок (за потреби)"
                     type="datetime-local"
                     value={form?.nextContactAt || ''}
                     onChange={(event) => set('nextContactAt', event.target.value)}
                     InputLabelProps={{ shrink: true }}
                     disabled={saving || contactSaved}
                     sx={fieldSx}
                  />
               )}
               </>}
            </Stack>
         </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
             <Button onClick={onClose} disabled={saving} sx={{ color: theme.textSoft }}>
                Скасувати
             </Button>
             <Button
               onClick={onSubmit}
               disabled={saving}
               sx={{
                  borderRadius: 3,
                  fontWeight: 950,
                  color: '#0b0b12',
                  background: `linear-gradient(90deg, ${theme.accent}, ${theme.accentLight})`,
               }}
            >
               {saving ? 'Збереження…' : noAnswer ? 'Зберегти недодзвін' : 'Зберегти'}
            </Button>
         </DialogActions>
      </Dialog>
   );
}
