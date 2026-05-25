'use client';

import { useEffect, useMemo, useState } from 'react';
import {
   Alert,
   Autocomplete,
   Box,
   Button,
   Chip,
   CircularProgress,
   Collapse,
   Dialog,
   DialogActions,
   DialogContent,
   DialogTitle,
   Divider,
   Grid,
   IconButton,
   InputAdornment,
   MenuItem,
   Stack,
   TextField,
   Tooltip,
   Typography,
} from '@mui/material';

import AddRoundedIcon from '@mui/icons-material/AddRounded';
import ApartmentRoundedIcon from '@mui/icons-material/ApartmentRounded';
import CalendarMonthRoundedIcon from '@mui/icons-material/CalendarMonthRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import ExploreRoundedIcon from '@mui/icons-material/ExploreRounded';
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';
import PersonSearchRoundedIcon from '@mui/icons-material/PersonSearchRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded';

import { useCRMTheme } from '@/app/(crm)/crm/context/CRMThemeContext';
import useCurrentUser from '@/utils/useCurrentUser';

const EVENT_TYPES = [
   { value: 'showing', label: 'Показ', icon: VisibilityRoundedIcon },
   { value: 'review', label: 'Огляд', icon: ExploreRoundedIcon },
   { value: 'call', label: 'Дзвінок', icon: CalendarMonthRoundedIcon },
   { value: 'meeting', label: 'Зустріч', icon: PersonSearchRoundedIcon },
   { value: 'other', label: 'Інше', icon: CheckCircleRoundedIcon },
];

const RESULT_OBJECT_OPTIONS = [
   { value: 'none', label: 'нема' },
   { value: 'new_object', label: 'новий об’єкт' },
   { value: 'price_reduced', label: 'зменшено ціну' },
   { value: 'loyalty_improved', label: 'покращено лояльність' },
   { value: 'ad_removed_by_owner', label: 'знято рекламу власником' },
   { value: 'category_improved', label: 'покращено категорію об’єкта' },
   { value: 'exclusive_agreed', label: 'ексклюзив погоджено' },
   { value: 'exclusive_signed', label: 'ексклюзив підписано' },
   { value: 'documents_checked', label: 'перевірено документи' },
];

const RESULT_BUYER_OPTIONS = [
   { value: 'none', label: 'нема' },
   { value: 'new_client', label: 'новий клієнт' },
   { value: 'loyalty_improved', label: 'покращено лояльність' },
   { value: 'exclusive_work', label: 'ексклюзивно працюємо' },
   { value: 'readiness_increased', label: 'підвищено готовність' },
   { value: 'deposit_taken', label: 'взято аванс' },
   { value: 'category_improved', label: 'покращено категорію' },
];

const RESULT_SHOWING_OPTIONS = [
   { value: 'unclear', label: 'незрозуміло', color: '#94a3b8' },
   { value: 'zs', label: 'ЗС', color: '#22c55e' },
   { value: 'pzs', label: 'ПЗС', color: '#84cc16' },
   { value: 'high_interest', label: 'висока зацікавленість', color: '#06b6d4' },
   { value: 'objections_found', label: 'виявлені заперечення', color: '#facc15' },
   { value: 'refusal', label: 'відмова', color: '#ef4444' },
];

const STAGE_LABELS = {
   lead: 'холодний лід',
   hot: 'гарячий лід',
   ps: 'ПС',
   rs: 'РС',
   ds: 'ДС',
   pzs: 'ПЗС',
   zs: 'ЗС',
   pers: 'ПЕРС',
   active: 'активний',
   paused: 'пауза',
   inactive: 'неактуальний',
};

const emptyForm = {
   type: 'showing',
   occurredAt: '',
   responsibleEmployee: '',
   property: '',
   lead: '',
   propertyStage: '',
   buyerStage: '',
   objectRealtorKind: 'employee',
   objectRealtorEmployee: '',
   objectPartnerName: '',
   buyerRealtorKind: 'employee',
   buyerRealtorEmployee: '',
   buyerPartnerName: '',
   resultObject: 'none',
   resultBuyer: 'none',
   resultShowing: 'unclear',
   objectionsText: '',
   objectionArguments: '',
   resultDescription: '',
};

function labelOf(options, value) {
   return options.find((item) => item.value === value)?.label || value || '—';
}

function employeeName(emp) {
   return emp?.fullName || [emp?.surname, emp?.name].filter(Boolean).join(' ') || emp?.name || '';
}

function formatDate(value) {
   if (!value) return '—';
   const d = new Date(value);
   if (Number.isNaN(d.getTime())) return '—';

   return new Intl.DateTimeFormat('uk-UA', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
   }).format(d);
}

function formatDateParts(value) {
   if (!value) return { date: '—', time: '—' };
   const d = new Date(value);
   if (Number.isNaN(d.getTime())) return { date: '—', time: '—' };

   return {
      date: new Intl.DateTimeFormat('uk-UA', {
         day: '2-digit',
         month: '2-digit',
         year: '2-digit',
      }).format(d),
      time: new Intl.DateTimeFormat('uk-UA', {
         hour: '2-digit',
         minute: '2-digit',
      }).format(d),
   };
}

function toDatetimeLocal(date = new Date()) {
   const pad = (n) => String(n).padStart(2, '0');
   return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function propertyTitle(property) {
   if (!property) return 'Без об’єкта';
   const location = property.location_text || [property.location?.city, property.location?.street, property.location?.number].filter(Boolean).join(', ');
   return property.title || location || 'Об’єкт без назви';
}

function propertyMeta(property) {
   if (!property) return '';
   return [
      property.rooms ? `${property.rooms}к` : '',
      property.square_tot ? `${property.square_tot} м2` : '',
      property.floor && property.floors ? `${property.floor}/${property.floors}` : '',
      property.cost ? `${Number(property.cost).toLocaleString('uk-UA')} ${property.currency || 'USD'}` : '',
   ].filter(Boolean).join(' · ');
}

function getPropertyImage(property) {
   const images = Array.isArray(property?.images) ? property.images : [];
   const main = images.find((img) => img?.isMain && !img?.isHidden) || images.find((img) => !img?.isHidden);

   return (
      main?.variants?.branded ||
      main?.brandedUrl ||
      main?.variants?.card ||
      main?.processedUrl ||
      main?.url ||
      ''
   );
}

function getFieldSx(theme, mode) {
   return {
      '& .MuiOutlinedInput-root': {
         bgcolor: mode === 'light' ? 'rgba(124,58,237,0.035)' : 'rgba(255,255,255,0.04)',
         borderRadius: 2.5,
         color: theme.text,
         '& fieldset': { borderColor: theme.border },
         '&:hover fieldset': { borderColor: theme.accent },
         '&.Mui-focused fieldset': { borderColor: theme.accentLight },
      },
      '& .MuiInputBase-input': {
         color: `${theme.text} !important`,
         WebkitTextFillColor: theme.text,
      },
      '& textarea': {
         color: `${theme.text} !important`,
         WebkitTextFillColor: theme.text,
      },
      '& .MuiInputLabel-root': { color: theme.textSoft },
      '& .MuiSelect-icon': { color: theme.text },
   };
}

function MiniMetric({ label, value, accent, theme }) {
   return (
      <Box
         sx={{
            minWidth: 132,
            px: 1.4,
            py: 1,
            borderRadius: 2,
            border: `1px solid ${theme.border}`,
            bgcolor: 'rgba(255,255,255,0.035)',
         }}
      >
         <Typography sx={{ fontSize: 11, color: theme.textSoft, fontWeight: 800, textTransform: 'uppercase' }}>
            {label}
         </Typography>
         <Typography sx={{ color: accent || theme.text, fontSize: 22, lineHeight: 1.05, fontWeight: 950 }}>
            {value}
         </Typography>
      </Box>
   );
}

function OperationRow({ item, theme, mode }) {
   const result = RESULT_SHOWING_OPTIONS.find((x) => x.value === item.resultShowing) || RESULT_SHOWING_OPTIONS[0];
   const eventType = EVENT_TYPES.find((x) => x.value === item.type) || EVENT_TYPES[0];
   const EventIcon = eventType.icon;
   const photo = getPropertyImage(item.property);

   const panelBg = mode === 'light' ? 'rgba(255,255,255,0.84)' : 'rgba(255,255,255,0.035)';

   const objectRealtor =
      item.objectRealtorKind === 'partner'
         ? item.objectPartnerName || 'СП'
         : employeeName(item.objectRealtorEmployee) || '—';
   const buyerRealtor =
      item.buyerRealtorKind === 'partner'
         ? item.buyerPartnerName || 'СП'
         : employeeName(item.buyerRealtorEmployee) || '—';

   return (
      <Box
         sx={{
            display: 'grid',
            gridTemplateColumns: {
               xs: '1fr',
               xl: '116px 1.45fr 1.05fr 1.1fr 1.2fr 1.45fr',
            },
            gap: 1,
            alignItems: 'stretch',
            p: 1,
            borderRadius: 2.5,
            border: `1px solid ${theme.border}`,
            bgcolor: panelBg,
            boxShadow: mode === 'light' ? '0 12px 26px rgba(124,58,237,0.05)' : '0 14px 32px rgba(0,0,0,0.22)',
         }}
      >
         <Stack
            spacing={0.7}
            sx={{
               borderRadius: 2,
               border: `1px solid ${theme.border}`,
               p: 1,
               minHeight: 96,
               justifyContent: 'center',
            }}
         >
            <Stack direction="row" spacing={0.7} alignItems="center">
               <EventIcon sx={{ color: theme.accent, fontSize: 19 }} />
               <Typography sx={{ color: theme.text, fontWeight: 950, fontSize: 13 }}>
                  {eventType.label}
               </Typography>
            </Stack>
            <Typography sx={{ color: theme.textSoft, fontSize: 12 }}>
               {formatDate(item.occurredAt)}
            </Typography>
            <Typography sx={{ color: theme.text, fontSize: 12, fontWeight: 800 }}>
               {employeeName(item.responsibleEmployee) || '—'}
            </Typography>
         </Stack>

         <Stack
            direction="row"
            spacing={1}
            sx={{
               minWidth: 0,
               p: 1,
               borderRadius: 2,
               bgcolor: mode === 'light' ? 'rgba(124,58,237,0.045)' : 'rgba(139,92,246,0.08)',
               border: `1px solid ${theme.accent}22`,
            }}
         >
            <Box
               sx={{
                  width: 72,
                  minWidth: 72,
                  borderRadius: 1.5,
                  overflow: 'hidden',
                  bgcolor: 'rgba(255,255,255,0.06)',
                  border: `1px solid ${theme.border}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
               }}
            >
               {photo ? (
                  <Box component="img" src={photo} alt="" sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
               ) : (
                  <ApartmentRoundedIcon sx={{ color: theme.textSoft }} />
               )}
            </Box>
            <Stack spacing={0.4} sx={{ minWidth: 0 }}>
               <Tooltip title={propertyTitle(item.property)}>
                  <Typography sx={{ color: theme.text, fontWeight: 950, fontSize: 13, lineHeight: 1.2 }} noWrap>
                     {propertyTitle(item.property)}
                  </Typography>
               </Tooltip>
               <Typography sx={{ color: theme.textSoft, fontSize: 12 }} noWrap>
                  {propertyMeta(item.property)}
               </Typography>
               <Stack direction="row" spacing={0.6} flexWrap="wrap" useFlexGap>
                  <Chip size="small" label={STAGE_LABELS[item.propertyStage] || item.propertyStage || STAGE_LABELS[item.property?.actualityGroup] || 'стадія —'} sx={{ height: 22, color: theme.text, bgcolor: 'rgba(255,255,255,0.06)' }} />
                  <Chip size="small" label={`рієлтор: ${objectRealtor}`} sx={{ height: 22, color: theme.text, bgcolor: 'rgba(255,255,255,0.06)' }} />
               </Stack>
            </Stack>
         </Stack>

         <Stack spacing={0.7} sx={{ p: 1, borderRadius: 2, border: `1px solid ${theme.border}` }}>
            <Typography sx={{ color: theme.textSoft, fontSize: 11, fontWeight: 900, textTransform: 'uppercase' }}>
               Покупець
            </Typography>
            <Typography sx={{ color: theme.text, fontWeight: 950, fontSize: 13 }} noWrap>
               {item.lead?.name || 'Без клієнта'}
            </Typography>
            <Typography sx={{ color: theme.textSoft, fontSize: 12 }} noWrap>
               {item.lead?.phones?.[0] || item.lead?.requestSummary || '—'}
            </Typography>
            <Stack direction="row" spacing={0.6} flexWrap="wrap" useFlexGap>
               <Chip size="small" label={STAGE_LABELS[item.buyerStage] || STAGE_LABELS[item.lead?.stage] || 'стадія —'} sx={{ height: 22, color: theme.text, bgcolor: 'rgba(255,255,255,0.06)' }} />
               <Chip size="small" label={`рієлтор: ${buyerRealtor}`} sx={{ height: 22, color: theme.text, bgcolor: 'rgba(255,255,255,0.06)' }} />
            </Stack>
         </Stack>

         <Grid container spacing={0.8}>
            <Grid item xs={4} xl={12}>
               <Chip size="small" label={`об’єкт: ${labelOf(RESULT_OBJECT_OPTIONS, item.resultObject)}`} sx={{ width: '100%', justifyContent: 'flex-start', color: theme.text, bgcolor: 'rgba(255,255,255,0.06)' }} />
            </Grid>
            <Grid item xs={4} xl={12}>
               <Chip size="small" label={`покупець: ${labelOf(RESULT_BUYER_OPTIONS, item.resultBuyer)}`} sx={{ width: '100%', justifyContent: 'flex-start', color: theme.text, bgcolor: 'rgba(255,255,255,0.06)' }} />
            </Grid>
            <Grid item xs={4} xl={12}>
               <Chip size="small" label={result.label} sx={{ width: '100%', justifyContent: 'flex-start', color: '#101014', bgcolor: result.color, fontWeight: 950 }} />
            </Grid>
         </Grid>

         <Stack spacing={0.8} sx={{ p: 1, borderRadius: 2, border: `1px solid ${theme.border}`, minWidth: 0 }}>
            <Typography sx={{ color: theme.textSoft, fontSize: 11, fontWeight: 900, textTransform: 'uppercase' }}>
               Виявлені заперечення
            </Typography>
            <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
               {(item.objections?.length ? item.objections : ['нема']).slice(0, 4).map((text) => (
                  <Chip key={text} size="small" label={text} sx={{ height: 23, color: theme.text, bgcolor: text === 'нема' ? 'rgba(255,255,255,0.05)' : 'rgba(250,204,21,0.16)' }} />
               ))}
            </Stack>
            <Typography sx={{ color: theme.textSoft, fontSize: 12 }} noWrap>
               {item.objectionArguments || 'аргументи не внесені'}
            </Typography>
         </Stack>

         <Stack spacing={0.6} sx={{ p: 1, borderRadius: 2, border: `1px solid ${theme.border}`, minWidth: 0 }}>
            <Typography sx={{ color: theme.textSoft, fontSize: 11, fontWeight: 900, textTransform: 'uppercase' }}>
               Опис результату
            </Typography>
            <Typography sx={{ color: theme.text, fontSize: 13, lineHeight: 1.35 }}>
               {item.resultDescription || 'Поки без опису результату'}
            </Typography>
         </Stack>
      </Box>
   );
}

function OperationRowCompact({ item, theme, mode }) {
   const [expanded, setExpanded] = useState(false);
   const result = RESULT_SHOWING_OPTIONS.find((x) => x.value === item.resultShowing) || RESULT_SHOWING_OPTIONS[0];
   const eventType = EVENT_TYPES.find((x) => x.value === item.type) || EVENT_TYPES[0];
   const EventIcon = eventType.icon;
   const photo = getPropertyImage(item.property);
   const dateParts = formatDateParts(item.occurredAt);

   const panelBg = mode === 'light' ? 'rgba(255,255,255,0.88)' : 'rgba(255,255,255,0.035)';
   const cellBg = mode === 'light' ? 'rgba(124,58,237,0.035)' : 'rgba(255,255,255,0.035)';

   const objectRealtor =
      item.objectRealtorKind === 'partner'
         ? item.objectPartnerName || 'СП'
         : employeeName(item.objectRealtorEmployee) || '—';
   const buyerRealtor =
      item.buyerRealtorKind === 'partner'
         ? item.buyerPartnerName || 'СП'
         : employeeName(item.buyerRealtorEmployee) || '—';

   const resultChipSx = {
      height: 24,
      maxWidth: '100%',
      justifyContent: 'flex-start',
      borderRadius: 1.4,
      fontSize: 11,
      fontWeight: 850,
      '& .MuiChip-label': {
         overflow: 'hidden',
         textOverflow: 'ellipsis',
         whiteSpace: 'nowrap',
         px: 0.9,
      },
   };

   return (
      <Box
         sx={{
            p: 0.75,
            borderRadius: 2.5,
            border: `1px solid ${theme.border}`,
            bgcolor: panelBg,
            boxShadow: mode === 'light' ? '0 12px 26px rgba(124,58,237,0.05)' : '0 14px 32px rgba(0,0,0,0.22)',
         }}
      >
         <Box
            sx={{
               display: 'grid',
               gridTemplateColumns: {
                  xs: '1fr',
                  lg: '92px minmax(220px,1.25fr) minmax(190px,0.95fr) minmax(250px,1.2fr) 116px',
               },
               gap: 0.75,
               alignItems: 'center',
            }}
         >
            <Stack
               spacing={0.25}
               sx={{
                  minHeight: 76,
                  borderRadius: 1.8,
                  border: `1px solid ${theme.border}`,
                  bgcolor: cellBg,
                  px: 1,
                  py: 0.8,
                  justifyContent: 'center',
               }}
            >
               <Stack direction="row" spacing={0.55} alignItems="center">
                  <EventIcon sx={{ color: theme.accent, fontSize: 17 }} />
                  <Typography sx={{ color: theme.text, fontWeight: 950, fontSize: 12 }} noWrap>
                     {eventType.label}
                  </Typography>
               </Stack>
               <Typography sx={{ color: theme.text, fontWeight: 950, fontSize: 15, lineHeight: 1.1 }}>
                  {dateParts.date}
               </Typography>
               <Typography sx={{ color: theme.textSoft, fontSize: 11, fontWeight: 800 }}>
                  {dateParts.time}
               </Typography>
               <Typography sx={{ color: theme.textSoft, fontSize: 11, fontWeight: 800 }} noWrap>
                  {employeeName(item.responsibleEmployee) || '—'}
               </Typography>
            </Stack>

            <Stack
               direction="row"
               spacing={0.85}
               sx={{
                  minWidth: 0,
                  minHeight: 76,
                  p: 0.75,
                  borderRadius: 1.8,
                  bgcolor: mode === 'light' ? 'rgba(124,58,237,0.045)' : 'rgba(139,92,246,0.08)',
                  border: `1px solid ${theme.accent}22`,
               }}
            >
               <Box
                  sx={{
                     width: 58,
                     height: 58,
                     minWidth: 58,
                     borderRadius: 1.3,
                     overflow: 'hidden',
                     bgcolor: 'rgba(255,255,255,0.06)',
                     border: `1px solid ${theme.border}`,
                     display: 'flex',
                     alignItems: 'center',
                     justifyContent: 'center',
                  }}
               >
                  {photo ? (
                     <Box component="img" src={photo} alt="" sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                     <ApartmentRoundedIcon sx={{ color: theme.textSoft, fontSize: 22 }} />
                  )}
               </Box>
               <Stack spacing={0.25} sx={{ minWidth: 0, justifyContent: 'center' }}>
                  <Tooltip title={propertyTitle(item.property)}>
                     <Typography sx={{ color: theme.text, fontWeight: 950, fontSize: 13, lineHeight: 1.12 }} noWrap>
                        {propertyTitle(item.property)}
                     </Typography>
                  </Tooltip>
                  <Typography sx={{ color: theme.textSoft, fontSize: 11.5, fontWeight: 750 }} noWrap>
                     {propertyMeta(item.property) || 'характеристики не внесені'}
                  </Typography>
                  <Typography sx={{ color: theme.textSoft, fontSize: 11, fontWeight: 800 }} noWrap>
                     рієлтор: <Box component="span" sx={{ color: theme.text }}>{objectRealtor}</Box>
                  </Typography>
               </Stack>
            </Stack>

            <Stack
               spacing={0.25}
               sx={{
                  minWidth: 0,
                  minHeight: 76,
                  p: 0.85,
                  borderRadius: 1.8,
                  border: `1px solid ${theme.border}`,
                  bgcolor: cellBg,
                  justifyContent: 'center',
               }}
            >
               <Typography sx={{ color: theme.textSoft, fontSize: 10.5, fontWeight: 900, textTransform: 'uppercase' }}>
                  Покупець
               </Typography>
               <Typography sx={{ color: theme.text, fontWeight: 950, fontSize: 13 }} noWrap>
                  {item.lead?.name || 'Без клієнта'}
               </Typography>
               <Typography sx={{ color: theme.textSoft, fontSize: 11.5, fontWeight: 750 }} noWrap>
                  {item.lead?.phones?.[0] || item.lead?.requestSummary || '—'}
               </Typography>
               <Typography sx={{ color: theme.textSoft, fontSize: 11, fontWeight: 800 }} noWrap>
                  рієлтор: <Box component="span" sx={{ color: theme.text }}>{buyerRealtor}</Box>
               </Typography>
            </Stack>

            <Stack direction={{ xs: 'column', sm: 'row', lg: 'column' }} spacing={0.45} sx={{ minWidth: 0 }}>
               <Chip size="small" label={`об’єкт: ${labelOf(RESULT_OBJECT_OPTIONS, item.resultObject)}`} sx={{ ...resultChipSx, color: theme.text, bgcolor: 'rgba(255,255,255,0.06)' }} />
               <Chip size="small" label={`покупець: ${labelOf(RESULT_BUYER_OPTIONS, item.resultBuyer)}`} sx={{ ...resultChipSx, color: theme.text, bgcolor: 'rgba(255,255,255,0.06)' }} />
               <Chip size="small" label={`показ: ${result.label}`} sx={{ ...resultChipSx, color: '#101014', bgcolor: result.color }} />
            </Stack>

            <Stack direction="row" spacing={0.25} justifyContent={{ xs: 'flex-start', lg: 'flex-end' }}>
               <Tooltip title="Редагувати">
                  <IconButton size="small" sx={{ color: theme.text, border: `1px solid ${theme.border}`, borderRadius: 1.5 }}>
                     <EditRoundedIcon fontSize="small" />
                  </IconButton>
               </Tooltip>
               <Tooltip title="Видалити">
                  <IconButton size="small" sx={{ color: '#f87171', border: `1px solid ${theme.border}`, borderRadius: 1.5 }}>
                     <DeleteOutlineRoundedIcon fontSize="small" />
                  </IconButton>
               </Tooltip>
               <Tooltip title={expanded ? 'Згорнути' : 'Деталі'}>
                  <IconButton
                     size="small"
                     onClick={() => setExpanded((value) => !value)}
                     sx={{
                        color: theme.text,
                        border: `1px solid ${theme.border}`,
                        borderRadius: 1.5,
                        transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
                        transition: 'transform 0.18s ease',
                     }}
                  >
                     <KeyboardArrowDownRoundedIcon fontSize="small" />
                  </IconButton>
               </Tooltip>
            </Stack>
         </Box>

         <Collapse in={expanded} timeout="auto" unmountOnExit>
            <Box
               sx={{
                  mt: 0.75,
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', md: '1fr 1.2fr' },
                  gap: 0.75,
               }}
            >
               <Stack spacing={0.55} sx={{ p: 1, borderRadius: 1.8, border: `1px solid ${theme.border}`, bgcolor: cellBg, minWidth: 0 }}>
                  <Typography sx={{ color: theme.textSoft, fontSize: 11, fontWeight: 900, textTransform: 'uppercase' }}>
                     Виявлені заперечення
                  </Typography>
                  <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
                     {(item.objections?.length ? item.objections : ['нема']).slice(0, 6).map((text) => (
                        <Chip key={text} size="small" label={text} sx={{ height: 23, color: theme.text, bgcolor: text === 'нема' ? 'rgba(255,255,255,0.05)' : 'rgba(250,204,21,0.16)' }} />
                     ))}
                  </Stack>
                  <Typography sx={{ color: theme.textSoft, fontSize: 12 }}>
                     {item.objectionArguments || 'Аргументи не внесені'}
                  </Typography>
               </Stack>

               <Stack spacing={0.45} sx={{ p: 1, borderRadius: 1.8, border: `1px solid ${theme.border}`, bgcolor: cellBg, minWidth: 0 }}>
                  <Typography sx={{ color: theme.textSoft, fontSize: 11, fontWeight: 900, textTransform: 'uppercase' }}>
                     Опис результату
                  </Typography>
                  <Typography sx={{ color: theme.text, fontSize: 13, lineHeight: 1.35 }}>
                     {item.resultDescription || 'Поки без опису результату'}
                  </Typography>
               </Stack>
            </Box>
         </Collapse>
      </Box>
   );
}

export default function OperationsPage() {
   const { theme, mode } = useCRMTheme();
   const { user } = useCurrentUser();

   const [items, setItems] = useState([]);
   const [properties, setProperties] = useState([]);
   const [leads, setLeads] = useState([]);
   const [employees, setEmployees] = useState([]);
   const [loading, setLoading] = useState(true);
   const [saving, setSaving] = useState(false);
   const [error, setError] = useState('');
   const [openCreate, setOpenCreate] = useState(false);
   const [q, setQ] = useState('');
   const [typeFilter, setTypeFilter] = useState('');
   const [resultFilter, setResultFilter] = useState('');
   const [form, setForm] = useState(() => ({ ...emptyForm, occurredAt: toDatetimeLocal() }));

   const fieldSx = getFieldSx(theme, mode);
   const menuProps = {
      PaperProps: {
         sx: {
            bgcolor: theme.bgPanel,
            color: theme.text,
            border: `1px solid ${theme.border}`,
         },
      },
   };

   const metrics = useMemo(() => {
      const today = new Date();
      const todayKey = today.toISOString().slice(0, 10);
      return {
         total: items.length,
         showings: items.filter((x) => x.type === 'showing').length,
         reviews: items.filter((x) => x.type === 'review').length,
         today: items.filter((x) => x.occurredAt?.slice?.(0, 10) === todayKey).length,
         objections: items.filter((x) => x.resultShowing === 'objections_found').length,
      };
   }, [items]);

   const loadOperations = async () => {
      try {
         setError('');
         const params = new URLSearchParams();
         params.set('pageSize', '50');
         if (q.trim()) params.set('q', q.trim());
         if (typeFilter) params.set('type', typeFilter);
         if (resultFilter) params.set('resultShowing', resultFilter);

         const res = await fetch(`/api/crm/operations?${params.toString()}`, { cache: 'no-store' });
         if (!res.ok) throw new Error('Не вдалося завантажити операційні події');
         const data = await res.json();
         setItems(Array.isArray(data?.items) ? data.items : []);
      } catch (e) {
         console.error(e);
         setError(e?.message || 'Помилка завантаження');
      } finally {
         setLoading(false);
      }
   };

   const loadDictionaries = async () => {
      const [propertiesRes, leadsRes, employeesRes] = await Promise.all([
         fetch('/api/crm/properties?mode=sale&pageSize=80', { cache: 'no-store' }),
         fetch('/api/crm/leads?pageSize=100', { cache: 'no-store' }),
         fetch('/api/crm/employees?active=true', { cache: 'no-store' }),
      ]);

      const [propertiesData, leadsData, employeesData] = await Promise.all([
         propertiesRes.ok ? propertiesRes.json() : { items: [] },
         leadsRes.ok ? leadsRes.json() : { items: [] },
         employeesRes.ok ? employeesRes.json() : { items: [] },
      ]);

      setProperties(Array.isArray(propertiesData?.items) ? propertiesData.items : []);
      setLeads(Array.isArray(leadsData?.items) ? leadsData.items : []);
      setEmployees(Array.isArray(employeesData?.items) ? employeesData.items : []);
   };

   useEffect(() => {
      setLoading(true);
      Promise.all([loadOperations(), loadDictionaries()]).finally(() => setLoading(false));
   }, []);

   useEffect(() => {
      const t = setTimeout(() => loadOperations(), 250);
      return () => clearTimeout(t);
   }, [q, typeFilter, resultFilter]);

   const selectedProperty = properties.find((x) => x._id === form.property) || null;
   const selectedLead = leads.find((x) => x._id === form.lead) || null;

   useEffect(() => {
      if (!selectedProperty) return;
      setForm((prev) => ({
         ...prev,
         propertyStage: prev.propertyStage || selectedProperty.actualityGroup || '',
         objectRealtorEmployee: prev.objectRealtorEmployee || selectedProperty.assignee?._id || selectedProperty.assignee || '',
      }));
   }, [selectedProperty?._id]);

   useEffect(() => {
      if (!selectedLead) return;
      setForm((prev) => ({
         ...prev,
         buyerStage: prev.buyerStage || selectedLead.stage || '',
         buyerRealtorEmployee: prev.buyerRealtorEmployee || selectedLead.assignee?._id || selectedLead.assignee || '',
      }));
   }, [selectedLead?._id]);

   const updateForm = (key, value) => {
      setForm((prev) => ({ ...prev, [key]: value }));
   };

   const resetForm = () => {
      setForm({ ...emptyForm, occurredAt: toDatetimeLocal(), responsibleEmployee: user?._id || user?.employeeId || '' });
   };

   const submit = async () => {
      try {
         setSaving(true);
         setError('');

         const payload = {
            ...form,
            objections: form.objectionsText
               .split(',')
               .map((x) => x.trim())
               .filter(Boolean),
            createdByEmployee: user?._id || user?.employeeId || '',
         };
         delete payload.objectionsText;

         const res = await fetch('/api/crm/operations', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
         });

         const data = await res.json().catch(() => null);
         if (!res.ok) throw new Error(data?.error || 'Не вдалося додати подію');

         setItems((prev) => [data.item, ...prev]);
         setOpenCreate(false);
         resetForm();
      } catch (e) {
         console.error(e);
         setError(e?.message || 'Помилка збереження');
      } finally {
         setSaving(false);
      }
   };

   return (
      <Box>
         <Stack spacing={2}>
            <Stack
               direction={{ xs: 'column', xl: 'row' }}
               spacing={1.4}
               alignItems={{ xs: 'stretch', xl: 'center' }}
               justifyContent="space-between"
            >
               <Stack spacing={0.5}>
                  <Typography sx={{ color: theme.text, fontSize: 25, fontWeight: 950 }}>
                     Операційка
                  </Typography>
                  <Typography sx={{ color: theme.textSoft, fontSize: 13 }}>
                     Покази, огляди й ключові результати роботи по об’єктах та покупцях
                  </Typography>
               </Stack>

               <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                  <MiniMetric label="всього" value={metrics.total} theme={theme} />
                  <MiniMetric label="покази" value={metrics.showings} theme={theme} accent={theme.accentLight} />
                  <MiniMetric label="огляди" value={metrics.reviews} theme={theme} />
                  <MiniMetric label="сьогодні" value={metrics.today} theme={theme} />
                  <MiniMetric label="заперечення" value={metrics.objections} theme={theme} accent="#facc15" />
               </Stack>
            </Stack>

            <Stack
               direction={{ xs: 'column', lg: 'row' }}
               spacing={1}
               sx={{
                  p: 1.2,
                  borderRadius: 2.5,
                  bgcolor: mode === 'light' ? 'rgba(124,58,237,0.045)' : 'rgba(255,255,255,0.035)',
                  border: `1px solid ${theme.border}`,
               }}
            >
               <TextField
                  placeholder="Пошук по опису, запереченнях, СП..."
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  sx={{ ...fieldSx, flex: 1 }}
                  InputProps={{
                     startAdornment: (
                        <InputAdornment position="start">
                           <SearchRoundedIcon sx={{ color: theme.textSoft }} />
                        </InputAdornment>
                     ),
                  }}
               />

               <TextField
                  select
                  label="Тип"
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  SelectProps={{ MenuProps: menuProps }}
                  sx={{ ...fieldSx, minWidth: 180 }}
               >
                  <MenuItem value="">Всі</MenuItem>
                  {EVENT_TYPES.map((x) => (
                     <MenuItem key={x.value} value={x.value}>{x.label}</MenuItem>
                  ))}
               </TextField>

               <TextField
                  select
                  label="Результат показу"
                  value={resultFilter}
                  onChange={(e) => setResultFilter(e.target.value)}
                  SelectProps={{ MenuProps: menuProps }}
                  sx={{ ...fieldSx, minWidth: 220 }}
               >
                  <MenuItem value="">Всі</MenuItem>
                  {RESULT_SHOWING_OPTIONS.map((x) => (
                     <MenuItem key={x.value} value={x.value}>{x.label}</MenuItem>
                  ))}
               </TextField>

               <Button
                  startIcon={<AddRoundedIcon />}
                  onClick={() => {
                     resetForm();
                     setOpenCreate(true);
                  }}
                  sx={{
                     borderRadius: 2.5,
                     px: 2.2,
                     color: mode === 'light' ? '#fff' : '#101014',
                     fontWeight: 950,
                     background: `linear-gradient(90deg, ${theme.accent}, ${theme.accentLight})`,
                     boxShadow: `0 14px 30px ${theme.glow}`,
                     whiteSpace: 'nowrap',
                  }}
               >
                  Додати показ
               </Button>
            </Stack>

            {!!error && <Alert severity="error" sx={{ borderRadius: 2 }}>{error}</Alert>}

            {loading ? (
               <Stack alignItems="center" sx={{ py: 8 }}>
                  <CircularProgress />
               </Stack>
            ) : items.length === 0 ? (
               <Box
                  sx={{
                     py: 8,
                     textAlign: 'center',
                     borderRadius: 2.5,
                     border: `1px solid ${theme.border}`,
                     bgcolor: 'rgba(255,255,255,0.025)',
                  }}
               >
                  <Typography sx={{ color: theme.text, fontWeight: 950 }}>Поки немає операційних подій</Typography>
                  <Typography sx={{ color: theme.textSoft, mt: 0.5 }}>Додай перший показ або огляд, і сторінка оживе.</Typography>
               </Box>
            ) : (
               <Stack spacing={1}>
                  {items.map((item) => (
                     <OperationRowCompact key={item._id} item={item} theme={theme} mode={mode} />
                  ))}
               </Stack>
            )}
         </Stack>

         <Dialog
            open={openCreate}
            onClose={() => !saving && setOpenCreate(false)}
            fullWidth
            maxWidth="lg"
            PaperProps={{
               sx: {
                  bgcolor: theme.bgPanel,
                  color: theme.text,
                  borderRadius: 3,
                  border: `1px solid ${theme.border}`,
               },
            }}
         >
            <DialogTitle sx={{ fontWeight: 950, pb: 1 }}>
               Новий показ / огляд
            </DialogTitle>
            <DialogContent sx={{ pt: 1 }}>
               <Grid container spacing={1.3}>
                  <Grid item xs={12} md={3}>
                     <TextField select fullWidth label="Тип" value={form.type} onChange={(e) => updateForm('type', e.target.value)} sx={fieldSx} SelectProps={{ MenuProps: menuProps }}>
                        {EVENT_TYPES.map((x) => <MenuItem key={x.value} value={x.value}>{x.label}</MenuItem>)}
                     </TextField>
                  </Grid>
                  <Grid item xs={12} md={3}>
                     <TextField fullWidth type="datetime-local" label="Дата і час" value={form.occurredAt} onChange={(e) => updateForm('occurredAt', e.target.value)} sx={fieldSx} InputLabelProps={{ shrink: true }} />
                  </Grid>
                  <Grid item xs={12} md={3}>
                     <TextField select fullWidth label="Відповідальний" value={form.responsibleEmployee} onChange={(e) => updateForm('responsibleEmployee', e.target.value)} sx={fieldSx} SelectProps={{ MenuProps: menuProps }}>
                        <MenuItem value="">—</MenuItem>
                        {employees.map((emp) => <MenuItem key={emp._id} value={emp._id}>{employeeName(emp)}</MenuItem>)}
                     </TextField>
                  </Grid>
                  <Grid item xs={12} md={3}>
                     <TextField select fullWidth label="Результат показу" value={form.resultShowing} onChange={(e) => updateForm('resultShowing', e.target.value)} sx={fieldSx} SelectProps={{ MenuProps: menuProps }}>
                        {RESULT_SHOWING_OPTIONS.map((x) => <MenuItem key={x.value} value={x.value}>{x.label}</MenuItem>)}
                     </TextField>
                  </Grid>

                  <Grid item xs={12}>
                     <Divider sx={{ borderColor: theme.border, my: 0.5 }} />
                  </Grid>

                  <Grid item xs={12} md={6}>
                     <Autocomplete
                        options={properties}
                        value={selectedProperty}
                        onChange={(_, value) => updateForm('property', value?._id || '')}
                        getOptionLabel={(option) => propertyTitle(option)}
                        renderInput={(params) => <TextField {...params} label="Об’єкт" sx={fieldSx} />}
                        PaperComponent={(props) => <Box {...props} sx={{ bgcolor: theme.bgPanel, color: theme.text, border: `1px solid ${theme.border}` }} />}
                     />
                  </Grid>
                  <Grid item xs={12} md={3}>
                     <TextField fullWidth label="Стадія об’єкта" value={form.propertyStage} onChange={(e) => updateForm('propertyStage', e.target.value)} sx={fieldSx} />
                  </Grid>
                  <Grid item xs={12} md={3}>
                     <TextField select fullWidth label="Результат об’єкту" value={form.resultObject} onChange={(e) => updateForm('resultObject', e.target.value)} sx={fieldSx} SelectProps={{ MenuProps: menuProps }}>
                        {RESULT_OBJECT_OPTIONS.map((x) => <MenuItem key={x.value} value={x.value}>{x.label}</MenuItem>)}
                     </TextField>
                  </Grid>

                  <Grid item xs={12} md={6}>
                     <Autocomplete
                        options={leads}
                        value={selectedLead}
                        onChange={(_, value) => updateForm('lead', value?._id || '')}
                        getOptionLabel={(option) => option?.name || ''}
                        renderOption={(props, option) => (
                           <Box component="li" {...props}>
                              <Stack>
                                 <Typography>{option.name}</Typography>
                                 <Typography sx={{ fontSize: 12, opacity: 0.72 }}>{option.phones?.[0] || option.requestSummary || '—'}</Typography>
                              </Stack>
                           </Box>
                        )}
                        renderInput={(params) => <TextField {...params} label="Покупець / лід" sx={fieldSx} />}
                        PaperComponent={(props) => <Box {...props} sx={{ bgcolor: theme.bgPanel, color: theme.text, border: `1px solid ${theme.border}` }} />}
                     />
                  </Grid>
                  <Grid item xs={12} md={3}>
                     <TextField fullWidth label="Стадія покупця" value={form.buyerStage} onChange={(e) => updateForm('buyerStage', e.target.value)} sx={fieldSx} />
                  </Grid>
                  <Grid item xs={12} md={3}>
                     <TextField select fullWidth label="Результат покупця" value={form.resultBuyer} onChange={(e) => updateForm('resultBuyer', e.target.value)} sx={fieldSx} SelectProps={{ MenuProps: menuProps }}>
                        {RESULT_BUYER_OPTIONS.map((x) => <MenuItem key={x.value} value={x.value}>{x.label}</MenuItem>)}
                     </TextField>
                  </Grid>

                  <Grid item xs={12}>
                     <Divider sx={{ borderColor: theme.border, my: 0.5 }} />
                  </Grid>

                  <Grid item xs={12} md={2}>
                     <TextField select fullWidth label="Рієлтор об’єкта" value={form.objectRealtorKind} onChange={(e) => updateForm('objectRealtorKind', e.target.value)} sx={fieldSx} SelectProps={{ MenuProps: menuProps }}>
                        <MenuItem value="employee">Наш</MenuItem>
                        <MenuItem value="partner">СП</MenuItem>
                        <MenuItem value="none">Нема</MenuItem>
                     </TextField>
                  </Grid>
                  <Grid item xs={12} md={4}>
                     {form.objectRealtorKind === 'partner' ? (
                        <TextField fullWidth label="Ім’я СП по об’єкту" value={form.objectPartnerName} onChange={(e) => updateForm('objectPartnerName', e.target.value)} sx={fieldSx} />
                     ) : (
                        <TextField select fullWidth label="Наш рієлтор по об’єкту" value={form.objectRealtorEmployee} onChange={(e) => updateForm('objectRealtorEmployee', e.target.value)} sx={fieldSx} SelectProps={{ MenuProps: menuProps }}>
                           <MenuItem value="">—</MenuItem>
                           {employees.map((emp) => <MenuItem key={emp._id} value={emp._id}>{employeeName(emp)}</MenuItem>)}
                        </TextField>
                     )}
                  </Grid>
                  <Grid item xs={12} md={2}>
                     <TextField select fullWidth label="Рієлтор покупця" value={form.buyerRealtorKind} onChange={(e) => updateForm('buyerRealtorKind', e.target.value)} sx={fieldSx} SelectProps={{ MenuProps: menuProps }}>
                        <MenuItem value="employee">Наш</MenuItem>
                        <MenuItem value="partner">СП</MenuItem>
                        <MenuItem value="none">Нема</MenuItem>
                     </TextField>
                  </Grid>
                  <Grid item xs={12} md={4}>
                     {form.buyerRealtorKind === 'partner' ? (
                        <TextField fullWidth label="Ім’я СП по покупцю" value={form.buyerPartnerName} onChange={(e) => updateForm('buyerPartnerName', e.target.value)} sx={fieldSx} />
                     ) : (
                        <TextField select fullWidth label="Наш рієлтор по покупцю" value={form.buyerRealtorEmployee} onChange={(e) => updateForm('buyerRealtorEmployee', e.target.value)} sx={fieldSx} SelectProps={{ MenuProps: menuProps }}>
                           <MenuItem value="">—</MenuItem>
                           {employees.map((emp) => <MenuItem key={emp._id} value={emp._id}>{employeeName(emp)}</MenuItem>)}
                        </TextField>
                     )}
                  </Grid>

                  <Grid item xs={12} md={4}>
                     <TextField fullWidth label="Виявлені заперечення" placeholder="вигляд з вікна, ціна, поверх" value={form.objectionsText} onChange={(e) => updateForm('objectionsText', e.target.value)} sx={fieldSx} />
                  </Grid>
                  <Grid item xs={12} md={4}>
                     <TextField fullWidth label="Аргументи до заперечень" value={form.objectionArguments} onChange={(e) => updateForm('objectionArguments', e.target.value)} sx={fieldSx} />
                  </Grid>
                  <Grid item xs={12} md={4}>
                     <TextField fullWidth label="Опис результату" value={form.resultDescription} onChange={(e) => updateForm('resultDescription', e.target.value)} sx={fieldSx} multiline minRows={1} />
                  </Grid>
               </Grid>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 2 }}>
               <Button startIcon={<CloseRoundedIcon />} onClick={() => setOpenCreate(false)} disabled={saving} sx={{ color: theme.text }}>
                  Закрити
               </Button>
               <Button startIcon={<CheckCircleRoundedIcon />} onClick={submit} disabled={saving || (!form.property && !form.lead)} sx={{ borderRadius: 2, px: 2, fontWeight: 950, color: mode === 'light' ? '#fff' : '#101014', background: `linear-gradient(90deg, ${theme.accent}, ${theme.accentLight})` }}>
                  {saving ? 'Зберігаю...' : 'Зберегти'}
               </Button>
            </DialogActions>
         </Dialog>
      </Box>
   );
}
