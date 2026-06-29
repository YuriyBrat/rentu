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
import { getParsingStageKey, isInspectionReservationActive } from './ParsingRowCard';

const STATUS_OPTIONS = [
   { value: 'duplicate', label: 'Дубль' },
   { value: 'fake', label: 'Фейк' },
   { value: 'base', label: 'БАЗА' },
   { value: 'inactive', label: 'Неактуальний' },
   { value: 'paused', label: 'Зупинений' },
];

const INACTIVE_REASONS = [
   ['sold_us', 'Проданий нами'],
   ['sold_owner', 'Проданий власником'],
   ['sold_not_us', 'Проданий не нами'],
   ['removed', 'Знято з продажу'],
   ['unknown', 'Невідома причина'],
];

const PAUSED_REASONS = [
   ['deposit', 'Завдаток'],
   ['thinking', 'Власник думає'],
   ['pause', 'Пауза'],
   ['unknown', 'Невідомо'],
];

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
   '& .MuiInputBase-input': { color: `${theme.text} !important`, WebkitTextFillColor: theme.text },
   '& textarea': { color: `${theme.text} !important`, WebkitTextFillColor: theme.text },
   '& .MuiSelect-icon': { color: theme.text },
});

export function buildInitialStatusForm(item) {
   const allowedStatuses = STATUS_OPTIONS.map((option) => option.value);
   const status = item?.stage === 'qualified'
      ? 'base'
      : allowedStatuses.includes(item?.stage)
         ? item.stage
         : 'base';

   return {
      status,
      duplicatePropertyId: item?.duplicatePropertyId?._id || item?.duplicatePropertyId || item?.phoneIntel?.relatedObjects?.[0]?._id || '',
      marketGroup: status === 'inactive' ? 'inactive' : status === 'paused' ? 'paused' : 'active',
      marketReason: '',
      callCenter: {
         verifiedAddressText: item?.callCenter?.verifiedAddressText || '',
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
}) {
   const fieldSx = getFieldSx(theme, mode);
   const status = form?.status || 'raw';
   const needsCommunication = ['base', 'inactive', 'paused', 'duplicate', 'fake'].includes(status);
   const showCallCenter = ['base', 'paused'].includes(status);
   const parsingStage = getParsingStageKey(item);
   const showReserveInspection = !isInspectionReservationActive(item) &&
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
         maxWidth="md"
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
            <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between">
               <Typography component="span" sx={{ fontWeight: 950, fontSize: 20 }}>
                  Зміна статусу
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

               <Box>
                  <Typography sx={{ color: theme.textSoft, fontSize: 12, fontWeight: 900, mb: 0.75 }}>
                     Статус
                  </Typography>
                  <Stack direction="row" spacing={0.7} flexWrap="wrap" useFlexGap>
                     {STATUS_OPTIONS.map((option) => (
                        <Button
                           key={option.value}
                           onClick={() => {
                              if (option.value === 'inactive') {
                                 onChange?.({ ...form, status: option.value, marketGroup: 'inactive', marketReason: form?.marketReason || 'unknown' });
                                 return;
                              }
                              if (option.value === 'paused') {
                                 onChange?.({ ...form, status: option.value, marketGroup: 'paused', marketReason: form?.marketReason || 'unknown' });
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
                           value={form?.callCenter?.verifiedAddressText || ''}
                           onChange={(e) => setCallCenter('verifiedAddressText', e.target.value)}
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
                           type="datetime-local"
                           value={form?.communication?.happenedAt || ''}
                           onChange={(e) => setCommunication('happenedAt', e.target.value)}
                           InputLabelProps={{ shrink: true }}
                           sx={fieldSx}
                        />
                        <TextField
                           label="Опис"
                           value={form?.communication?.text || ''}
                           onChange={(e) => setCommunication('text', e.target.value)}
                           multiline
                           minRows={3}
                           sx={fieldSx}
                        />
                     </Stack>
                  </Box>
               )}
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
               Зберегти
            </Button>
         </DialogActions>
      </Dialog>
   );
}
