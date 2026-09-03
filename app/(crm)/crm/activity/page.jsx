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
import GavelRoundedIcon from '@mui/icons-material/GavelRounded';
import HandshakeRoundedIcon from '@mui/icons-material/HandshakeRounded';
import ImportExportRoundedIcon from '@mui/icons-material/ImportExportRounded';
import MovingRoundedIcon from '@mui/icons-material/MovingRounded';
import NotesRoundedIcon from '@mui/icons-material/NotesRounded';
import PersonRoundedIcon from '@mui/icons-material/PersonRounded';
import FilterAltOffRoundedIcon from '@mui/icons-material/FilterAltOffRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import SwapHorizRoundedIcon from '@mui/icons-material/SwapHorizRounded';
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded';
import HeartBrokenRoundedIcon from '@mui/icons-material/HeartBrokenRounded';
import LockRoundedIcon from '@mui/icons-material/LockRounded';

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
   ['access_denied', 'Відмовлено'],
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
   ['properties', 'Об’єкти'],
];

const SOURCE_LABELS = {
   manual: 'Вручну',
   system: 'Автоматично',
   dimria: 'DIM.RIA',
   reamak: 'Reamak',
   api: 'Через API',
   import: 'Імпорт',
   properties: 'Об’єкти',
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

const EXTRA_DIFF_FIELD_LABELS = {
   type_estate: 'Тип нерухомості',
   type_deal: 'Тип угоди',
   leadname: 'Імʼя контакту',
   email: 'Email',
   phone: 'Телефон',
   type: 'Тип події',
   showingKind: 'Вид показу',
   presenceType: 'Присутність',
   shownByEmployee: 'Хто показав',
   facilitatedByEmployee: 'Хто сприяв',
   propertyStage: 'Стадія обʼєкта',
   buyerStage: 'Стадія покупця',
   objectRealtorKind: 'Тип рієлтора обʼєкта',
   objectPartnerName: 'СП обʼєкта',
   buyerRealtorKind: 'Тип рієлтора покупця',
   buyerPartnerName: 'СП покупця',
   resultObject: 'Результат обʼєкта',
   resultBuyer: 'Результат покупця',
   resultShowing: 'Результат показу',
   objections: 'Заперечення',
   objectionArguments: 'Аргументи',
   resultDescription: 'Опис результату',
   pzs: 'ПЗС',
   review: 'Огляд',
   loss: 'Втрата',
   sourceOperationEvent: 'Повʼязаний показ',
   sourcePreDepositEvent: 'Повʼязана ПЗС',
   resultFinanceEvent: 'Фінансовий результат',
   financeType: 'Тип фінансової події',
   deposit: 'Завдаток',
   reregistrationEvent: 'ПЕРС',
   occurredAt: 'Дата події',
   responsibleEmployee: 'Відповідальний',
   processedByEmployee: 'Хто оформив / провів',
   property: 'Обʼєкт',
   lead: 'Клієнт',
   objectRealtorEmployee: 'Рієлтор обʼєкта',
   buyerRealtorEmployee: 'Рієлтор покупця',
   tensionLevel: 'Рівень легкості',
   location: 'Місце',
   status: 'Статус',
   deadlineAt: 'Дедлайн',
   scheduledReregistrationAt: 'Плановий час ПЕРС',
   notary: 'Нотаріус / сторона',
   reregistrationPlaceType: 'Де проводили ПЕРС',
   reregistrationPlaceName: 'Місце ПЕРС',
   sellerConditions: 'Умови продавця',
   buyerConditions: 'Умови покупця',
   agencyConditions: 'Умови агентства',
   resultSummary: 'Підсумок',
   notes: 'Нотатки',
   actualityGroup: 'Актуальність',
   actualityStatus: 'Причина актуальності',
   actualityNote: 'Примітка по актуальності',
   inactiveAt: 'Дата неактуальності',
   inactiveNote: 'Нотатка неактуальності',
   crmStage: 'Стадія CRM',
   crmStageReason: 'Причина стадії CRM',
   tone: 'Тон',
   text: 'Текст',
   createdAt: 'Час події',
};

const FINANCE_TYPE_LABELS = {
   deposit: 'завдаток',
   reregistration: 'ПЕРС',
};

const OPERATION_TYPE_LABELS = {
   showing: 'показ',
   review: 'огляд',
   inspection: 'огляд',
   pzs: 'ПЗС',
   loss: 'втрата',
   call: 'дзвінок',
   meeting: 'зустріч',
   other: 'операційну подію',
};

const DIFF_VALUE_LABELS = {
   employee: 'наш',
   partner: 'СП',
   none: 'немає',
   showing: 'показ',
   review: 'огляд',
   inspection: 'огляд',
   pzs: 'ПЗС',
   loss: 'втрата',
   deposit: 'завдаток',
   reregistration: 'ПЕРС',
   completed_success: 'виконано успішно',
   completed_improved: 'виконано з покращенням',
   completed_worse: 'виконано з погіршенням',
   waiting: 'чекає',
   failed: 'зірвано',
   active: 'в роботі',
   paused: 'пауза',
   inactive: 'неактуальний',
   manual: 'вручну',
   not_taken: 'не взято в роботу',
   new_object: 'новий обʼєкт',
   historical: 'історичний огляд',
   not_our_format: 'не наш формат',
   owner_not_ready: 'власник не готовий',
   problematic_object: 'проблемний обʼєкт',
   problematic_owner: 'проблемний власник',
   hard_loyalty: 'важка лояльність',
   dirty_advertising: 'засмічена реклама обʼєктом',
   cosmic_price: 'космічна ціна',
   documents_risk: 'ризик по документах',
   other: 'інше',
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
   access_denied: { label: 'Відмовлено', color: '#dc2626', icon: <LockRoundedIcon fontSize="small" /> },
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
   if (type === 'financeEvent') return 'Фінансова подія';
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
   if (entityType === 'financeEvent') return 'Операційка';
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
   if (item?.entityType === 'financeEvent') {
      const financeType = item?.meta?.financeType;
      if (item?.action === 'created' && financeType) {
         return `Створено ${FINANCE_TYPE_LABELS[financeType] || 'фінансову подію'}`;
      }
       if (item?.action === 'updated' && financeType === 'deposit') return 'Оновлено завдаток';
       if (item?.action === 'updated' && financeType === 'reregistration') return 'Оновлено ПЕРС';
       if (item?.action === 'deleted' && financeType === 'deposit') return 'Видалено завдаток';
       if (item?.action === 'deleted' && financeType === 'reregistration') return 'Видалено ПЕРС';
      if (financeType) {
         return String(message || '').replace(/financeEvent|deposit|reregistration/gi, (value) => FINANCE_TYPE_LABELS[value] || value);
      }
   }
    if (item?.entityType === 'operation') {
      const operationType = item?.meta?.operationType || item?.meta?.pzsStepType;
      const operationLabel = OPERATION_TYPE_LABELS[operationType];
      if (item?.action === 'created' && operationLabel) return `Створено ${operationLabel}`;
      if (item?.action === 'updated' && operationLabel === 'ПЗС') return 'Оновлено ПЗС';
      if (item?.action === 'updated' && operationLabel) return `Оновлено ${operationLabel}`;
      if (item?.action === 'deleted' && operationLabel) return `Видалено ${operationLabel}`;
    }
    if (item?.entityType === 'property' && item?.meta?.workHistoryNoteId) {
       if (item?.action === 'created') return 'Додано запис в історію роботи';
       if (item?.action === 'updated') return 'Оновлено запис в історії роботи';
       if (item?.action === 'deleted') return 'Видалено запис з історії роботи';
    }
   if (item?.entityType === 'property') {
      if (item?.action === 'access_denied') return item?.message || 'Спроба дії з об’єктом без доступу';
      if (item?.action === 'status_changed') return 'Змінено статус об’єкта';
      if (item?.action === 'updated') return 'Оновлено об’єкт';
   }
   if (item?.action === 'access_denied') return item?.message || 'Спроба дії без доступу';
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
   return EXTRA_DIFF_FIELD_LABELS[field] || DIFF_FIELD_LABELS[field] || String(field || '-').replace(/_/g, ' ');
}

function formatDiffValue(value) {
   if (value === null || value === undefined || value === '') return '-';
   if (typeof value === 'boolean') return value ? 'так' : 'ні';
   if (typeof value === 'string') return DIFF_VALUE_LABELS[value] || value;
   if (Array.isArray(value)) return value.map(formatDiffValue).join(', ') || '-';
   if (typeof value === 'object') return 'змінено';
   return String(value);
}

function getEventVisual(item) {
   const financeType = item?.meta?.financeType;
   const operationType = item?.meta?.operationType;
   const pzsStepType = item?.meta?.pzsStepType;
   const message = getActivityMessage(item);

   if (financeType === 'deposit' || /завдат/i.test(message)) {
      return { label: 'ЗС', color: '#22c55e', icon: <HandshakeRoundedIcon sx={{ fontSize: 15 }} /> };
   }
   if (financeType === 'reregistration' || /ПЕРС/i.test(message)) {
      return { label: 'ПЕРС', color: '#a855f7', icon: <GavelRoundedIcon sx={{ fontSize: 15 }} /> };
   }
   if (operationType === 'pzs' || pzsStepType || /ПЗС/i.test(message)) {
      return { label: 'ПЗС', color: '#e879f9', icon: <MovingRoundedIcon sx={{ fontSize: 15 }} /> };
   }
   if (operationType === 'loss' || /втрат/i.test(message)) {
      return { label: 'Втрата', color: '#ef4444', icon: <HeartBrokenRoundedIcon sx={{ fontSize: 15 }} /> };
   }
   if (operationType === 'showing' || /показ/i.test(message)) {
      return { label: 'Показ', color: '#8b5cf6', icon: <VisibilityRoundedIcon sx={{ fontSize: 15 }} /> };
   }
   return null;
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
      denied: items.filter((item) => item.action === 'access_denied').length,
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
                 title={`${getDiffFieldLabel(entry.field)}: ${formatDiffValue(entry.before)} → ${formatDiffValue(entry.after)}`}
             >
               <Chip
                  size="small"
                  label={getDiffFieldLabel(entry.field)}
                  sx={{
                     height: 19,
                     maxWidth: 170,
                      fontSize: 11,
                      color: theme.textSoft,
                     border: `1px solid ${theme.border}`,
                     bgcolor: 'transparent',
                     '& .MuiChip-label': { overflow: 'hidden', textOverflow: 'ellipsis' },
                  }}
               />
            </Tooltip>
         ))}
         {diff.length > 5 && (
             <Chip size="small" label={`+${diff.length - 5}`} sx={{ height: 19, color: theme.textSoft, fontSize: 11 }} />
         )}
      </Stack>
   );
}

function ActivityRow({ item }) {
   const { theme, mode } = useCRMTheme();
   const meta = actionMeta[item.action] || { label: item.action || '-', color: theme.textSoft, icon: <AutoGraphRoundedIcon fontSize="small" /> };
   const eventVisual = getEventVisual(item);

   return (
      <Box
         sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '30px 1fr', lg: '30px minmax(210px, 1fr) 128px 116px 120px 132px' },
            gap: 0.75,
            alignItems: 'center',
            px: 0.9,
            py: 0.48,
            borderRadius: 2,
            border: `1px solid ${theme.border}`,
            bgcolor: mode === 'light' ? 'rgba(255,255,255,0.78)' : 'rgba(255,255,255,0.025)',
         }}
      >
         <Box
            sx={{
                width: 27,
                height: 27,
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

          <Stack spacing={0.22} minWidth={0}>
             <Stack direction="row" spacing={0.45} alignItems="center" flexWrap="wrap" useFlexGap>
                <Typography sx={{ color: theme.text, fontWeight: 950, fontSize: 12.7 }} noWrap>
                   {getActivityMessage(item)}
                </Typography>
                {eventVisual && (
                   <Chip
                      size="small"
                      icon={eventVisual.icon}
                      label={eventVisual.label}
                      sx={{
                         height: 20,
                         color: eventVisual.color,
                         bgcolor: `${eventVisual.color}17`,
                         border: `1px solid ${eventVisual.color}44`,
                         fontWeight: 950,
                         fontSize: 11,
                         '& .MuiChip-icon': { color: eventVisual.color, ml: 0.55, mr: -0.25 },
                      }}
                   />
                )}
                <Chip
                   size="small"
                   label={getActionLabel(item.action)}
                   sx={{ height: 20, color: meta.color, bgcolor: `${meta.color}16`, border: `1px solid ${meta.color}38`, fontSize: 11 }}
                />
                <Chip
                   size="small"
                   label={getEntityLabel(item.entityType)}
                   sx={{ height: 20, color: theme.textSoft, border: `1px solid ${theme.border}`, bgcolor: 'transparent', fontSize: 11 }}
                />
             </Stack>
             <Typography sx={{ color: theme.textSoft, fontSize: 11.6 }} noWrap>
                {item.title || item.entityId || '-'}
             </Typography>
            <DiffPreview item={item} theme={theme} />
         </Stack>

         <Stack spacing={0.15} sx={{ display: { xs: 'none', lg: 'flex' } }}>
            <Typography sx={{ color: theme.textSoft, fontSize: 10, fontWeight: 900 }}>Працівник</Typography>
            <Typography sx={{ color: theme.text, fontSize: 11.6, fontWeight: 850 }} noWrap>
               {getActorName(item)}
            </Typography>
         </Stack>

         <Stack spacing={0.15} sx={{ display: { xs: 'none', lg: 'flex' } }}>
              <Typography sx={{ color: theme.textSoft, fontSize: 10, fontWeight: 900 }}>Спосіб дії</Typography>
              <Typography sx={{ color: theme.text, fontSize: 11.6, fontWeight: 850 }} noWrap>
                {getSourceLabel(item.source)}
             </Typography>
         </Stack>

         <Tooltip title={item?.meta?.pagePath || getPageLabel(item)}>
            <Stack spacing={0.15} sx={{ display: { xs: 'none', lg: 'flex' } }}>
                <Typography sx={{ color: theme.textSoft, fontSize: 10, fontWeight: 900 }}>Сторінка</Typography>
                <Typography sx={{ color: theme.text, fontSize: 11.6, fontWeight: 850 }} noWrap>
                  {getPageLabel(item)}
               </Typography>
            </Stack>
         </Tooltip>

         <Tooltip title={formatDateTime(item.createdAt)}>
            <Stack alignItems={{ xs: 'flex-start', lg: 'flex-end' }} spacing={0.15} sx={{ gridColumn: { xs: '2 / -1', lg: 'auto' } }}>
                <Typography sx={{ color: theme.textSoft, fontSize: 10, fontWeight: 900 }}>Час</Typography>
                <Typography sx={{ color: theme.text, fontSize: 11.6, fontWeight: 850 }}>
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
      ['Відмови', stats.denied, <LockRoundedIcon />],
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
                  <MenuItem value="financeEvent">Фінансові події</MenuItem>
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
