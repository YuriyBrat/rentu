'use client';

import { useEffect, useMemo, useState } from 'react';
import {
   Alert,
   Box,
   Button,
   Chip,
   Divider,
   MenuItem,
   Stack,
   TextField,
   Tooltip,
   Typography,
} from '@mui/material';

import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded';
import AutoGraphRoundedIcon from '@mui/icons-material/AutoGraphRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import DoneAllRoundedIcon from '@mui/icons-material/DoneAllRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import ImportExportRoundedIcon from '@mui/icons-material/ImportExportRounded';
import NotesRoundedIcon from '@mui/icons-material/NotesRounded';
import PersonRoundedIcon from '@mui/icons-material/PersonRounded';
import FilterAltOffRoundedIcon from '@mui/icons-material/FilterAltOffRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import SwapHorizRoundedIcon from '@mui/icons-material/SwapHorizRounded';

import { useCRMTheme } from '@/app/(crm)/crm/context/CRMThemeContext';

const ACTION_OPTIONS = [
   ['all', 'Усі дії'],
   ['created', 'Створено'],
   ['imported', 'Імпорт'],
   ['updated', 'Оновлено'],
   ['status_changed', 'Статус'],
   ['communication_added', 'Комунікація'],
   ['moved', 'Перенос'],
   ['deleted', 'Видалення'],
];

const ENTITY_OPTIONS = [
   ['all', 'Усі сутності'],
   ['leadProperty', 'Парсинг'],
   ['property', 'Обʼєкти'],
   ['lead', 'Ліди'],
   ['communication', 'Комунікації'],
   ['operation', 'Операційка'],
   ['employee', 'Персонал'],
];

const SOURCE_OPTIONS = [
   ['all', 'Усі джерела'],
   ['manual', 'Ручні'],
   ['system', 'Система'],
   ['dimria', 'DIM.RIA'],
   ['reamak', 'Reamak'],
   ['api', 'API'],
   ['import', 'Імпорт'],
];

const SOURCE_LABELS = {
   manual: 'Вручну',
   system: 'Автоматично',
   dimria: 'DIM.RIA',
   reamak: 'Reamak',
   api: 'Через API',
   import: 'Імпорт',
   unknown: 'Не визначено',
};

const DIFF_FIELD_LABELS = {
   source: 'Джерело оголошення',
   sourceId: 'ID у джерелі',
   sourceUrl: 'Посилання',
   sourceStatus: 'Стан посилання',
   stage: 'Статус парсингу',
   reviewStatus: 'Результат перевірки',
   duplicatePropertyId: 'Оригінал дубля',
   propertyId: 'Обʼєкт у базі',
   'callCenter.verifiedAddressText': 'Точна адреса',
   'callCenter.infoVerified': 'Перевірка інформації',
   'callCenter.inspectionLoyalty': 'Готовність до огляду',
   'callCenter.bottomPrice': 'Нижня ціна',
   'callCenter.interestLevel': 'Цікавість',
   'callCenter.urgencyLevel': 'Терміновість',
   'callCenter.cooperationWarmth': 'Теплість співпраці',
   'callCenter.note': 'Нотатка колцентру',
   'inspectionReservation.reservedByEmployee': 'Хто їде на огляд',
   'inspectionReservation.reservedByName': 'Рієлтор',
   'inspectionReservation.reservedAt': 'Резерв створено',
   'inspectionReservation.expiresAt': 'Резерв до',
};

const PERIOD_OPTIONS = [
   ['today', 'Сьогодні'],
   ['7d', '7 днів'],
   ['30d', '30 днів'],
   ['all', 'Усі'],
];

const actionMeta = {
   created: { label: 'Створено', color: '#22c55e', icon: <DoneAllRoundedIcon fontSize="small" /> },
   imported: { label: 'Імпорт', color: '#0ea5e9', icon: <ImportExportRoundedIcon fontSize="small" /> },
   updated: { label: 'Оновлено', color: '#8b5cf6', icon: <EditRoundedIcon fontSize="small" /> },
   status_changed: { label: 'Статус', color: '#f59e0b', icon: <SwapHorizRoundedIcon fontSize="small" /> },
   communication_added: { label: 'Комунікація', color: '#14b8a6', icon: <NotesRoundedIcon fontSize="small" /> },
   moved: { label: 'Перенос', color: '#06b6d4', icon: <SwapHorizRoundedIcon fontSize="small" /> },
   deleted: { label: 'Видалення', color: '#ef4444', icon: <DeleteOutlineRoundedIcon fontSize="small" /> },
};

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
      '& .MuiInputLabel-root': { color: theme.textSoft },
      '& .MuiInputBase-input': { color: `${theme.text} !important`, WebkitTextFillColor: theme.text },
      '& .MuiSelect-icon': { color: theme.text },
   };
}

function formatDateTime(value) {
   if (!value) return '-';
   const d = new Date(value);
   if (Number.isNaN(d.getTime())) return '-';
   return d.toLocaleString('uk-UA', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
   });
}

function getDateFromPeriod(period) {
   const now = new Date();
   if (period === 'today') {
      const d = new Date(now);
      d.setHours(0, 0, 0, 0);
      return d;
   }
   if (period === '7d') return new Date(now.getTime() - 7 * 86400000);
   if (period === '30d') return new Date(now.getTime() - 30 * 86400000);
   return null;
}

function getActorName(item) {
   const employee = item?.actorEmployee;
   return [employee?.fullName, employee?.name, employee?.surname].filter(Boolean).join(' ').trim() ||
      item?.actorName ||
      item?.actorRole ||
      'Система';
}

function getEntityLabel(type) {
   return ENTITY_OPTIONS.find(([value]) => value === type)?.[1] || type || '-';
}

function getActionLabel(action) {
   return actionMeta[action]?.label || action || '-';
}

function getSourceLabel(source) {
   return SOURCE_LABELS[source] || source || '-';
}

function getPageLabel(item) {
   if (item?.meta?.pageName) return item.meta.pageName;

   const entityType = item?.meta?.targetEntityType || item?.entityType;
   const labels = {
      leadProperty: 'Парсинг',
      property: 'Обʼєкти',
      lead: 'Ліди',
      communication: 'Комунікації',
      operation: 'Операційка',
      employee: 'Персонал',
      system: 'Система',
   };

   return labels[entityType] || 'CRM';
}

function getActivityMessage(item) {
   const message = item?.message || getActionLabel(item?.action);
   if (item?.action !== 'communication_added') return message;

   const labels = {
      call: 'Дзвінок',
      sms: 'SMS',
      messenger: 'Месенджер',
      note: 'Нотатка',
   };

   return String(message || '').replace(
      /:\s*(call|sms|messenger|note)$/i,
      (_, type) => `: ${labels[type.toLowerCase()] || type}`
   );
}

function getDiffFieldLabel(field) {
   return DIFF_FIELD_LABELS[field] || field || '-';
}

function summarize(items) {
   const byActor = {};
   items.forEach((item) => {
      const actor = getActorName(item);
      byActor[actor] = (byActor[actor] || 0) + 1;
   });
   const topActor = Object.entries(byActor).sort((a, b) => b[1] - a[1])[0];

   return {
      total: items.length,
      communications: items.filter((item) => item.action === 'communication_added').length,
      parsing: items.filter((item) => item.entityType === 'leadProperty').length,
      moved: items.filter((item) => item.action === 'moved').length,
      deleted: items.filter((item) => item.action === 'deleted').length,
      topActor: topActor ? `${topActor[0]} · ${topActor[1]}` : '-',
   };
}

function DiffPreview({ item, theme }) {
   const diff = Array.isArray(item?.diff) ? item.diff : [];
   if (!diff.length) return null;

   return (
      <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
         {diff.slice(0, 5).map((entry) => (
             <Tooltip
                key={entry.field}
                title={`${getDiffFieldLabel(entry.field)}: ${String(entry.before ?? '-')} → ${String(entry.after ?? '-')}`}
             >
               <Chip
                  size="small"
                  label={getDiffFieldLabel(entry.field)}
                  sx={{
                     height: 22,
                     maxWidth: 170,
                     color: theme.textSoft,
                     border: `1px solid ${theme.border}`,
                     bgcolor: 'transparent',
                     '& .MuiChip-label': { overflow: 'hidden', textOverflow: 'ellipsis' },
                  }}
               />
            </Tooltip>
         ))}
         {diff.length > 5 && (
            <Chip size="small" label={`+${diff.length - 5}`} sx={{ height: 22, color: theme.textSoft }} />
         )}
      </Stack>
   );
}

function ActivityRow({ item }) {
   const { theme, mode } = useCRMTheme();
   const meta = actionMeta[item.action] || { label: item.action || '-', color: theme.textSoft, icon: <AutoGraphRoundedIcon fontSize="small" /> };

   return (
      <Box
         sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '34px 1fr', lg: '34px minmax(210px, 1fr) 135px 130px 125px 145px' },
            gap: 1,
            alignItems: 'center',
            px: 1.05,
            py: 0.85,
            borderRadius: 2,
            border: `1px solid ${theme.border}`,
            bgcolor: mode === 'light' ? 'rgba(255,255,255,0.78)' : 'rgba(255,255,255,0.025)',
         }}
      >
         <Box
            sx={{
               width: 30,
               height: 30,
               borderRadius: 2,
               display: 'grid',
               placeItems: 'center',
               color: meta.color,
               bgcolor: `${meta.color}18`,
               border: `1px solid ${meta.color}42`,
            }}
         >
            {meta.icon}
         </Box>

         <Stack spacing={0.35} minWidth={0}>
            <Stack direction="row" spacing={0.6} alignItems="center" flexWrap="wrap" useFlexGap>
               <Typography sx={{ color: theme.text, fontWeight: 950, fontSize: 13.2 }} noWrap>
                  {getActivityMessage(item)}
               </Typography>
               <Chip
                  size="small"
                  label={getActionLabel(item.action)}
                  sx={{ height: 22, color: meta.color, bgcolor: `${meta.color}16`, border: `1px solid ${meta.color}38` }}
               />
               <Chip
                  size="small"
                  label={getEntityLabel(item.entityType)}
                  sx={{ height: 22, color: theme.textSoft, border: `1px solid ${theme.border}`, bgcolor: 'transparent' }}
               />
            </Stack>
            <Typography sx={{ color: theme.textSoft, fontSize: 12.1 }} noWrap>
               {item.title || item.entityId || '-'}
            </Typography>
            <DiffPreview item={item} theme={theme} />
         </Stack>

         <Stack spacing={0.15} sx={{ display: { xs: 'none', lg: 'flex' } }}>
            <Typography sx={{ color: theme.textSoft, fontSize: 10.5, fontWeight: 900 }}>Працівник</Typography>
            <Typography sx={{ color: theme.text, fontSize: 12.2, fontWeight: 850 }} noWrap>
               {getActorName(item)}
            </Typography>
         </Stack>

         <Stack spacing={0.15} sx={{ display: { xs: 'none', lg: 'flex' } }}>
             <Typography sx={{ color: theme.textSoft, fontSize: 10.5, fontWeight: 900 }}>Спосіб дії</Typography>
             <Typography sx={{ color: theme.text, fontSize: 12.2, fontWeight: 850 }} noWrap>
                {getSourceLabel(item.source)}
             </Typography>
         </Stack>

         <Tooltip title={item?.meta?.pagePath || getPageLabel(item)}>
            <Stack spacing={0.15} sx={{ display: { xs: 'none', lg: 'flex' } }}>
               <Typography sx={{ color: theme.textSoft, fontSize: 10.5, fontWeight: 900 }}>Сторінка</Typography>
               <Typography sx={{ color: theme.text, fontSize: 12.2, fontWeight: 850 }} noWrap>
                  {getPageLabel(item)}
               </Typography>
            </Stack>
         </Tooltip>

         <Tooltip title={formatDateTime(item.createdAt)}>
            <Stack alignItems={{ xs: 'flex-start', lg: 'flex-end' }} spacing={0.15} sx={{ gridColumn: { xs: '2 / -1', lg: 'auto' } }}>
               <Typography sx={{ color: theme.textSoft, fontSize: 10.5, fontWeight: 900 }}>Час</Typography>
               <Typography sx={{ color: theme.text, fontSize: 12.2, fontWeight: 850 }}>
                  {formatDateTime(item.createdAt)}
               </Typography>
            </Stack>
         </Tooltip>
      </Box>
   );
}

export default function ActivityPage() {
   const { theme, mode } = useCRMTheme();
   const fieldSx = getFieldSx(theme, mode);

   const [items, setItems] = useState([]);
   const [total, setTotal] = useState(0);
   const [loading, setLoading] = useState(false);
   const [error, setError] = useState('');
   const [period, setPeriod] = useState('7d');
   const [action, setAction] = useState('all');
   const [entityType, setEntityType] = useState('all');
   const [source, setSource] = useState('all');
   const [q, setQ] = useState('');

   const load = async () => {
      setLoading(true);
      setError('');

      try {
         const params = new URLSearchParams({ pageSize: '120' });
         const dateFrom = getDateFromPeriod(period);
         if (dateFrom) params.set('dateFrom', dateFrom.toISOString());
         if (action !== 'all') params.set('action', action);
         if (entityType !== 'all') params.set('entityType', entityType);
         if (source !== 'all') params.set('source', source);

         const res = await fetch(`/api/crm/activity?${params.toString()}`, { cache: 'no-store' });
         const data = await res.json().catch(() => ({}));
         if (!res.ok) throw new Error(data?.error || 'Не вдалося завантажити активність');

         setItems(Array.isArray(data?.items) ? data.items : []);
         setTotal(Number(data?.total || 0));
      } catch (e) {
         console.error(e);
         setError(e?.message || 'Не вдалося завантажити активність');
      } finally {
         setLoading(false);
      }
   };

   useEffect(() => {
      const t = setTimeout(load, 250);
      return () => clearTimeout(t);
   }, [period, action, entityType, source]);

   const visibleItems = useMemo(() => {
      const query = q.trim().toLowerCase();
      if (!query) return items;

      return items.filter((item) => [
         item.message,
         item.title,
         item.source,
         item.action,
         item.entityType,
         getPageLabel(item),
         getActorName(item),
      ].filter(Boolean).join(' ').toLowerCase().includes(query));
   }, [items, q]);

   const stats = useMemo(() => summarize(visibleItems), [visibleItems]);

   const statCards = [
      ['Усього', stats.total, <AutoGraphRoundedIcon />],
      ['Комунікації', stats.communications, <NotesRoundedIcon />],
      ['Парсинг', stats.parsing, <ImportExportRoundedIcon />],
      ['Переноси', stats.moved, <SwapHorizRoundedIcon />],
      ['Видалення', stats.deleted, <DeleteOutlineRoundedIcon />],
      ['Топ активність', stats.topActor, <PersonRoundedIcon />],
   ];

   return (
      <Box sx={{ p: { xs: 1.2, lg: 2 }, minHeight: '100%', bgcolor: theme.bgDark }}>
         <Stack spacing={1.3}>
            <Stack direction={{ xs: 'column', lg: 'row' }} alignItems={{ xs: 'stretch', lg: 'center' }} justifyContent="space-between" spacing={1}>
               <Stack spacing={0.2}>
                  <Typography sx={{ color: theme.text, fontSize: 22, fontWeight: 950, lineHeight: 1 }}>
                     Активність
                  </Typography>
                  <Typography sx={{ color: theme.textSoft, fontSize: 12.5 }}>
                     Журнал змін, комунікацій, імпортів, переносів і видалень
                  </Typography>
               </Stack>

               <Stack direction="row" spacing={0.7} flexWrap="wrap" useFlexGap>
                  {PERIOD_OPTIONS.map(([value, label]) => (
                     <Button
                        key={value}
                        onClick={() => setPeriod(value)}
                        startIcon={value === 'today' ? <AccessTimeRoundedIcon /> : null}
                        sx={{
                           minHeight: 32,
                           borderRadius: 2.5,
                           fontWeight: 950,
                           color: period === value ? '#0b0b12' : theme.text,
                           bgcolor: period === value ? theme.accent : 'transparent',
                           border: `1px solid ${period === value ? 'transparent' : theme.border}`,
                        }}
                     >
                        {label}
                     </Button>
                  ))}
               </Stack>
            </Stack>

            <Box
               sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: 'repeat(2, minmax(0, 1fr))', lg: 'repeat(6, minmax(0, 1fr))' },
                  gap: 0.8,
               }}
            >
               {statCards.map(([label, value, icon]) => (
                  <Box
                     key={label}
                     sx={{
                        p: 1,
                        minHeight: 72,
                        borderRadius: 2,
                        border: `1px solid ${theme.border}`,
                        bgcolor: mode === 'light' ? 'rgba(255,255,255,0.76)' : 'rgba(255,255,255,0.025)',
                     }}
                  >
                     <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1}>
                        <Typography sx={{ color: theme.textSoft, fontSize: 11.5, fontWeight: 900 }}>
                           {label}
                        </Typography>
                        <Box sx={{ color: theme.accent, display: 'flex', '& svg': { fontSize: 18 } }}>{icon}</Box>
                     </Stack>
                     <Typography sx={{ mt: 0.6, color: theme.text, fontSize: typeof value === 'number' ? 23 : 13.5, fontWeight: 950 }} noWrap>
                        {value}
                     </Typography>
                  </Box>
               ))}
            </Box>

            <Box
               sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', lg: 'minmax(220px, 1fr) 190px 190px 170px 42px' },
                  gap: 0.8,
                  alignItems: 'center',
               }}
            >
               <TextField
                  label="Пошук"
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  sx={fieldSx}
                  InputProps={{ startAdornment: <SearchRoundedIcon sx={{ mr: 0.7, color: theme.textSoft }} /> }}
               />
               <TextField select label="Дія" value={action} onChange={(e) => setAction(e.target.value)} sx={fieldSx}>
                  {ACTION_OPTIONS.map(([value, label]) => <MenuItem key={value} value={value}>{label}</MenuItem>)}
               </TextField>
               <TextField select label="Сутність" value={entityType} onChange={(e) => setEntityType(e.target.value)} sx={fieldSx}>
                  {ENTITY_OPTIONS.map(([value, label]) => <MenuItem key={value} value={value}>{label}</MenuItem>)}
               </TextField>
               <TextField select label="Джерело" value={source} onChange={(e) => setSource(e.target.value)} sx={fieldSx}>
                  {SOURCE_OPTIONS.map(([value, label]) => <MenuItem key={value} value={value}>{label}</MenuItem>)}
               </TextField>
               <Tooltip title="Скинути">
                  <Button
                     onClick={() => {
                        setQ('');
                        setAction('all');
                        setEntityType('all');
                        setSource('all');
                        setPeriod('7d');
                     }}
                     sx={{
                        minWidth: 42,
                        height: 42,
                        borderRadius: 2.5,
                        color: theme.text,
                        border: `1px solid ${theme.border}`,
                     }}
                  >
                     <FilterAltOffRoundedIcon />
                  </Button>
               </Tooltip>
            </Box>

            {!!error && <Alert severity="error" sx={{ borderRadius: 2 }}>{error}</Alert>}

            <Stack direction="row" alignItems="center" justifyContent="space-between">
               <Typography sx={{ color: theme.textSoft, fontSize: 12.5, fontWeight: 850 }}>
                  Показано {visibleItems.length} з {total}{loading ? ' · завантаження...' : ''}
               </Typography>
               <Chip
                  size="small"
                  label={period === 'all' ? 'усі записи' : PERIOD_OPTIONS.find(([value]) => value === period)?.[1]}
                  sx={{ color: theme.textSoft, border: `1px solid ${theme.border}`, bgcolor: 'transparent' }}
               />
            </Stack>

            <Divider sx={{ borderColor: theme.border }} />

            <Stack spacing={0.65}>
               {visibleItems.map((item) => (
                  <ActivityRow key={item._id} item={item} />
               ))}

               {!loading && !visibleItems.length && (
                  <Box
                     sx={{
                        p: 2,
                        borderRadius: 2,
                        border: `1px solid ${theme.border}`,
                        color: theme.textSoft,
                        bgcolor: mode === 'light' ? 'rgba(255,255,255,0.76)' : 'rgba(255,255,255,0.025)',
                     }}
                  >
                     Поки немає подій під ці фільтри.
                  </Box>
               )}
            </Stack>
         </Stack>
      </Box>
   );
}
