'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
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
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import ExploreRoundedIcon from '@mui/icons-material/ExploreRounded';
import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded';
import HandshakeRoundedIcon from '@mui/icons-material/HandshakeRounded';
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';
import PersonSearchRoundedIcon from '@mui/icons-material/PersonSearchRounded';
import PestControlRoundedIcon from '@mui/icons-material/PestControlRounded';
import GavelRoundedIcon from '@mui/icons-material/GavelRounded';
import RestartAltRoundedIcon from '@mui/icons-material/RestartAltRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import MovingRoundedIcon from '@mui/icons-material/MovingRounded';
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded';

import { useCRMTheme } from '@/app/(crm)/crm/context/CRMThemeContext';
import useCurrentUser from '@/utils/useCurrentUser';
import { OPERATION_SCORING_DESCRIPTIONS, OPERATION_SCORING_LABELS, OPERATION_SCORING_RULES } from '@/utils/crm/operationScoring';

const EVENT_TYPES = [
   { value: 'showing', label: 'Показ', icon: VisibilityRoundedIcon },
   { value: 'review', label: 'Огляд', icon: ExploreRoundedIcon },
   { value: 'pzs', label: 'ПЗС', icon: MovingRoundedIcon },
];

const TIMELINE_GROUP_OPTIONS = [
   { value: 'none', label: 'без групування' },
   { value: 'day', label: 'день' },
   { value: 'week', label: 'тиждень' },
   { value: 'month', label: 'місяць' },
   { value: 'quarter', label: 'квартал' },
   { value: 'half', label: 'півріччя' },
   { value: 'year', label: 'рік' },
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
   { value: 'pzs', label: 'ПЗС', color: '#f472b6', icon: MovingRoundedIcon },
   { value: 'high_interest', label: 'висока зацікавленість', color: '#06b6d4' },
   { value: 'objections_found', label: 'виявлені заперечення', color: '#facc15' },
   { value: 'refusal', label: 'відмова', color: '#ef4444' },
];

const REVIEW_RESULT_OPTIONS = [
   { value: 'not_taken', label: 'не взято в роботу', color: '#ef4444' },
   { value: 'new_object', label: 'новий об’єкт', color: '#14b8a6' },
   { value: 'historical', label: 'історичний огляд', color: '#38bdf8' },
];

const REVIEW_FORM_RESULT_OPTIONS = REVIEW_RESULT_OPTIONS;

const REVIEW_OBJECT_RESULT_OPTIONS = [
   { value: 'not_our_format', label: 'не наш формат' },
   { value: 'owner_not_ready', label: 'власник не готовий' },
   { value: 'problematic_object', label: 'проблемний об’єкт' },
   { value: 'problematic_owner', label: 'проблемний власник' },
   { value: 'hard_loyalty', label: 'важка лояльність' },
   { value: 'dirty_advertising', label: 'засмічена реклама об’єктом' },
   { value: 'cosmic_price', label: 'космічна ціна' },
   { value: 'documents_risk', label: 'ризик по документах' },
   { value: 'other', label: 'інше' },
];

const SHOWING_KIND_OPTIONS = [
   { value: 'initiative', label: 'ініціативний' },
   { value: 'passive', label: 'пасивний' },
   { value: 'repeat', label: 'повторний' },
   { value: 'assistance', label: 'сприяння' },
];

const PRESENCE_TYPE_OPTIONS = [
   { value: 'me', label: 'я', short: 'я' },
   { value: 'partner', label: 'співпраця', short: 'сп' },
   { value: 'agency_colleague', label: 'колега з агентства', short: 'ф' },
   { value: 'client_self', label: 'клієнт сам', short: 'к' },
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

const FINANCE_EVENT_TYPES = {
   deposit: {
      label: 'Завдаток',
      icon: HandshakeRoundedIcon,
   },
   reregistration: {
      label: 'ПЕРС',
      icon: GavelRoundedIcon,
   },
};

const FINANCE_STATUS_LABELS = {
   waiting: 'Чекає',
   completed_success: 'Виконано успішно',
   completed_improved: 'Виконано з покращенням',
   completed_worse: 'Виконано з погіршенням',
   failed: 'Зірвано',
};

const FINANCE_STATUS_COLORS = {
   waiting: '#86efac',
   completed_success: '#16a34a',
   completed_improved: '#84cc16',
   completed_worse: '#166534',
   failed: '#ef4444',
};

const PZS_STATUS_LABELS = {
   active: 'В роботі',
   deposit: 'Завдаток',
   failed: 'Зірвано',
   paused: 'Пауза',
};

const PZS_STATUS_COLORS = {
   active: '#f472b6',
   deposit: '#22c55e',
   failed: '#ef4444',
   paused: '#94a3b8',
};

const PZS_STEP_OPTIONS = [
   { value: 'negotiation', label: 'Крок переговорів', icon: MovingRoundedIcon, color: '#f472b6' },
   { value: 'next_step', label: 'Наступна дія', icon: AccessTimeRoundedIcon, color: '#38bdf8' },
   { value: 'deposit', label: 'Перевести в завдаток', icon: HandshakeRoundedIcon, color: '#22c55e' },
   { value: 'failed', label: 'Зірвано', icon: CloseRoundedIcon, color: '#ef4444' },
   { value: 'note', label: 'Нотатка', icon: CheckCircleRoundedIcon, color: '#94a3b8' },
];

const PROPERTY_MIN_SEARCH_LENGTH = 5;
const LEAD_MIN_SEARCH_LENGTH = 5;
const SHOWING_MIN_SEARCH_LENGTH = 5;

const FINANCIAL_PRODUCT_OPTIONS = [
   { value: 'OO', code: 'ОО', label: 'Об’єкт → Об’єкт', fullLabel: 'ОО - Об’єкт (робота) - Об’єкт (платить)', description: 'класична робота на власника/об’єкт', color: '#a855f7' },
   { value: 'OP', code: 'ОП', label: 'Об’єкт → Покупець', fullLabel: 'ОП - Об’єкт (робота) - Покупець (платить)', description: 'працюємо по об’єкту, комісію сплачує покупець', color: '#fde047' },
   { value: 'PP', code: 'ПП', label: 'Покупець → Покупець', fullLabel: 'ПП - Покупець (робота) - Покупець (платить)', description: 'персональна робота на покупця', color: '#4ade80' },
   { value: 'PO', code: 'ПО', label: 'Покупець → Об’єкт', fullLabel: 'ПО - Покупець (робота) - Об’єкт (платить)', description: 'нестандартна покупцева робота з оплатою від власника', color: '#ef4444' },
];

const SHOW_DEMO_OPERATION_EVENTS = false;

const TENSION_LABELS = {
   1: 'дуже напружено',
   2: 'напружено',
   3: 'нормально',
   4: 'легко',
   5: 'дуже легко',
};

const TENSION_EMOJIS = {
   1: '😬',
   2: '😟',
   3: '🙂',
   4: '😌',
   5: '😎',
};

const REREGISTRATION_PLACE_LABELS = {
   notary: 'Нотаріус',
   developer_sales: 'Відділ продажу',
   other: 'Інше місце',
};

const emptyForm = {
   type: 'showing',
   occurredAt: '',
   responsibleEmployee: '',
   financialProduct: '',
   showingKind: 'passive',
   presenceType: 'me',
   shownByEmployee: '',
   facilitatedByEmployee: '',
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
   pzsCondition: '',
   pzsSourceLabel: '',
   sourceOperationEvent: '',
   pzsFirstStep: '',
   pzsStatus: 'active',
   reviewResult: 'not_taken',
   reviewObjectResult: 'owner_not_ready',
   reviewReason: '',
   reviewNote: '',
};

const emptyDepositForm = {
   occurredAt: '',
   responsibleEmployee: '',
   processedByEmployee: '',
   financialProduct: '',
   property: '',
   lead: '',
   objectRealtorKind: 'employee',
   objectRealtorEmployee: '',
   objectPartnerName: '',
   buyerRealtorKind: 'employee',
   buyerRealtorEmployee: '',
   buyerPartnerName: '',
   tensionLevel: 3,
   location: '',
   deadlineAt: '',
   scheduledReregistrationAt: '',
   notary: '',
   status: 'waiting',
   reregistrationPlaceType: 'notary',
   reregistrationPlaceName: '',
   resultSummary: '',
   sellerConditions: '',
   buyerConditions: '',
   agencyConditions: '',
   note: '',
   sourceOperationEvent: '',
   sourcePreDepositEvent: '',
};

function labelOf(options, value) {
   return options.find((item) => item.value === value)?.label || value || '—';
}

function mergeById(...groups) {
   const map = new Map();
   groups.flat().filter(Boolean).forEach((item) => {
      const id = item?._id?.toString?.() || item?._id;
      if (id && !map.has(id)) map.set(id, item);
   });
   return [...map.values()];
}

function financeTypeLabel(item) {
   return FINANCE_EVENT_TYPES[item?.financeType]?.label || item?.financeType || 'Фінансова подія';
}

function reviewResultLabel(value) {
   return REVIEW_RESULT_OPTIONS.find((item) => item.value === value)?.label || value || 'огляд';
}

function reviewResultColor(value) {
   return REVIEW_RESULT_OPTIONS.find((item) => item.value === value)?.color || '#14b8a6';
}

function reviewObjectResultLabel(value) {
   return REVIEW_OBJECT_RESULT_OPTIONS.find((item) => item.value === value)?.label || value || 'висновок не внесено';
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

function toDateLocal(date = new Date()) {
   const pad = (n) => String(n).padStart(2, '0');
   return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function idOf(value) {
   return value?._id || value || '';
}

function normalizeShowingKind(value) {
   if (['initiative', 'passive', 'repeat', 'assistance'].includes(value)) return value;
   return 'passive';
}

function hashString(value) {
   return String(value || '')
      .split('')
      .reduce((acc, char) => ((acc * 31) + char.charCodeAt(0)) % 9973, 7);
}

function demoFinancialProductForItem(item) {
   const direct =
      item?.financialProduct ||
      item?.sourceOperationEvent?.financialProduct ||
      item?.sourcePreDepositEvent?.financialProduct ||
      item?.sourcePreDepositEvent?.sourceOperationEvent?.financialProduct ||
      item?.deposit?.financialProduct ||
      item?.deposit?.sourceOperationEvent?.financialProduct ||
      item?.deposit?.sourcePreDepositEvent?.financialProduct;

   const product = FINANCIAL_PRODUCT_OPTIONS.find((option) => option.value === direct);

   const seed = hashString(idOf(item?.sourceOperationEvent) || idOf(item?.property) || idOf(item));
   const isInitiative = item?.showingKind === 'initiative' || item?.sourceOperationEvent?.showingKind === 'initiative' || seed % 3 === 0;
   const hasCooperation =
      item?.presenceType === 'partner' ||
      item?.objectRealtorKind === 'partner' ||
      item?.buyerRealtorKind === 'partner' ||
      item?.sourcePreDepositEvent?.objectRealtorKind === 'partner' ||
      item?.sourcePreDepositEvent?.buyerRealtorKind === 'partner' ||
      item?.deposit?.objectRealtorKind === 'partner' ||
      item?.deposit?.buyerRealtorKind === 'partner';

   return product ? {
      ...product,
      direction: isInitiative ? 'up' : 'down',
      hasCooperation,
   } : {
      value: '',
      code: '?',
      label: 'Фінпродукт не вибрано',
      description: 'обери фінпродукт у формі події',
      color: '#facc15',
      direction: isInitiative ? 'up' : 'down',
      hasCooperation,
      isMissing: true,
   };
}

function isMongoObjectId(value) {
   return /^[a-f\d]{24}$/i.test(String(value || ''));
}

function formFromOperation(item) {
   return {
      ...emptyForm,
      type: item?.type || 'showing',
      occurredAt: item?.occurredAt ? toDatetimeLocal(new Date(item.occurredAt)) : toDatetimeLocal(),
      responsibleEmployee: idOf(item?.responsibleEmployee),
      financialProduct: item?.financialProduct || '',
      showingKind: normalizeShowingKind(item?.showingKind),
      presenceType: item?.presenceType || 'me',
      shownByEmployee: idOf(item?.shownByEmployee),
      facilitatedByEmployee: idOf(item?.facilitatedByEmployee),
      property: idOf(item?.property),
      lead: idOf(item?.lead),
      propertyStage: item?.propertyStage || item?.property?.actualityGroup || '',
      buyerStage: item?.buyerStage || item?.lead?.stage || '',
      objectRealtorKind: item?.objectRealtorKind || 'employee',
      objectRealtorEmployee: idOf(item?.objectRealtorEmployee),
      objectPartnerName: item?.objectPartnerName || '',
      buyerRealtorKind: item?.buyerRealtorKind || 'employee',
      buyerRealtorEmployee: idOf(item?.buyerRealtorEmployee),
      buyerPartnerName: item?.buyerPartnerName || '',
      resultObject: item?.resultObject || 'none',
      resultBuyer: item?.resultBuyer || 'none',
      resultShowing: item?.resultShowing || 'unclear',
      objectionsText: Array.isArray(item?.objections) ? item.objections.join(', ') : '',
      objectionArguments: item?.objectionArguments || '',
      resultDescription: item?.resultDescription || '',
      pzsCondition: item?.pzs?.condition || '',
      pzsSourceLabel: item?.pzs?.sourceLabel || '',
      sourceOperationEvent: idOf(item?.pzs?.sourceOperationEvent),
      pzsFirstStep: '',
      pzsStatus: item?.pzs?.status || 'active',
      reviewResult: item?.review?.result || 'not_taken',
      reviewObjectResult: item?.review?.objectResult || item?.resultObject || 'owner_not_ready',
      reviewReason: item?.review?.reason || item?.resultDescription || '',
      reviewNote: item?.review?.note || '',
   };
}

function startOfLocalDay(date) {
   return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function addDays(date, amount) {
   const next = new Date(date);
   next.setDate(next.getDate() + amount);
   return next;
}

function startOfIsoWeek(date) {
   const d = startOfLocalDay(date);
   const day = d.getDay() || 7;
   return addDays(d, 1 - day);
}

function getIsoWeekYear(date) {
   const d = startOfLocalDay(date);
   const day = d.getDay() || 7;
   const thursday = addDays(d, 4 - day);
   return thursday.getFullYear();
}

function getIsoWeekNumber(date) {
   const d = startOfLocalDay(date);
   const day = d.getDay() || 7;
   const thursday = addDays(d, 4 - day);
   const yearStart = new Date(thursday.getFullYear(), 0, 1);
   const yearStartDay = yearStart.getDay() || 7;
   const firstThursday = addDays(yearStart, 4 - yearStartDay);
   return 1 + Math.round((thursday - firstThursday) / (7 * 24 * 60 * 60 * 1000));
}

function formatShortDate(value) {
   return new Intl.DateTimeFormat('uk-UA', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(value);
}

function formatDayMonth(value) {
   return new Intl.DateTimeFormat('uk-UA', { day: '2-digit', month: '2-digit' }).format(value);
}

function formatMonthYear(value) {
   return new Intl.DateTimeFormat('uk-UA', { month: 'long', year: 'numeric' }).format(value);
}

function romanQuarter(value) {
   return ['I', 'II', 'III', 'IV'][value - 1] || String(value);
}

function getTimelineItemBucket(item) {
   if (item.kind === 'financeEvent') {
      return item.financeType === 'reregistration' ? 'pers' : 'deposit';
   }
   if (item.kind === 'preDepositEvent' || item.type === 'pzs') return 'pzs';
   if (item.type === 'review' || item.kind === 'reviewEvent') return 'review';
   return 'showing';
}

function buildTimelineGroupMeta(item, mode) {
   const date = new Date(item?.occurredAt || item?.createdAt || Date.now());
   if (Number.isNaN(date.getTime()) || mode === 'none') {
      return { key: 'all', title: 'Усі події', subtitle: '' };
   }

   if (mode === 'day') {
      const start = startOfLocalDay(date);
      return {
         key: `day:${start.toISOString().slice(0, 10)}`,
         title: formatShortDate(start),
         subtitle: new Intl.DateTimeFormat('uk-UA', { weekday: 'long' }).format(start),
      };
   }

   if (mode === 'week') {
      const start = startOfIsoWeek(date);
      const end = addDays(start, 6);
      const week = getIsoWeekNumber(date);
      const year = getIsoWeekYear(date);
      return {
         key: `week:${year}:${week}`,
         title: `Тиждень ${week}`,
         subtitle: `${formatDayMonth(start)}–${formatDayMonth(end)}.${year}`,
      };
   }

   if (mode === 'month') {
      const start = new Date(date.getFullYear(), date.getMonth(), 1);
      return {
         key: `month:${date.getFullYear()}:${date.getMonth() + 1}`,
         title: formatMonthYear(start),
         subtitle: '',
      };
   }

   if (mode === 'quarter') {
      const quarter = Math.floor(date.getMonth() / 3) + 1;
      const start = new Date(date.getFullYear(), (quarter - 1) * 3, 1);
      const end = new Date(date.getFullYear(), quarter * 3, 0);
      return {
         key: `quarter:${date.getFullYear()}:${quarter}`,
         title: `${romanQuarter(quarter)} квартал ${date.getFullYear()}`,
         subtitle: `${formatDayMonth(start)}–${formatDayMonth(end)}.${date.getFullYear()}`,
      };
   }

   if (mode === 'half') {
      const half = date.getMonth() < 6 ? 1 : 2;
      const start = new Date(date.getFullYear(), half === 1 ? 0 : 6, 1);
      const end = new Date(date.getFullYear(), half === 1 ? 6 : 12, 0);
      return {
         key: `half:${date.getFullYear()}:${half}`,
         title: `${half === 1 ? 'I' : 'II'} півріччя ${date.getFullYear()}`,
         subtitle: `${formatDayMonth(start)}–${formatDayMonth(end)}.${date.getFullYear()}`,
      };
   }

   if (mode === 'year') {
      return {
         key: `year:${date.getFullYear()}`,
         title: `${date.getFullYear()} рік`,
         subtitle: '01.01–31.12',
      };
   }

   return { key: 'all', title: 'Усі події', subtitle: '' };
}

function groupTimelineItems(items, mode) {
   if (mode === 'none') return [{ key: 'all', title: '', subtitle: '', items }];

   const groups = [];
   const map = new Map();

   items.forEach((item) => {
      const meta = buildTimelineGroupMeta(item, mode);
      if (!map.has(meta.key)) {
         const group = { ...meta, items: [] };
         map.set(meta.key, group);
         groups.push(group);
      }
      map.get(meta.key).items.push(item);
   });

   let bestGroup = null;
   let bestScore = 0;
   groups.forEach((group) => {
      group.score = timelineGroupScore(group);
      if (group.score > bestScore) {
         bestScore = group.score;
         bestGroup = group;
      }
   });

   if (bestGroup && bestScore > 0 && groups.length > 1) {
      bestGroup.isBest = true;
   }

   return groups;
}

function timelineGroupScore(group) {
   return (group?.items || []).reduce((score, item) => {
      const bucket = getTimelineItemBucket(item);
      if (bucket === 'pers') return score + 12;
      if (bucket === 'deposit') return score + 8;
      if (bucket === 'pzs') return score + 4;
      if (bucket === 'review') {
         return score + (item.review?.result === 'new_object' ? 5 : 2);
      }
      if (bucket === 'showing') {
         return score + (item.resultBuyer === 'new_client' || item.resultObject === 'new_object' ? 3 : 1);
      }
      return score + 1;
   }, 0);
}

function formFromFinanceEvent(item) {
   const source = item?.sourcePreDepositEvent || item?.deposit?.sourcePreDepositEvent || item?.deposit || {};
   return {
      ...emptyDepositForm,
      occurredAt: item?.occurredAt ? toDatetimeLocal(new Date(item.occurredAt)) : toDatetimeLocal(),
      responsibleEmployee: idOf(item?.responsibleEmployee),
      processedByEmployee: idOf(item?.processedByEmployee),
      financialProduct: item?.financialProduct || source?.financialProduct || item?.sourceOperationEvent?.financialProduct || '',
      property: idOf(item?.property),
      lead: idOf(item?.lead),
      objectRealtorKind: item?.objectRealtorKind || source?.objectRealtorKind || 'employee',
      objectRealtorEmployee: idOf(item?.objectRealtorEmployee) || idOf(source?.objectRealtorEmployee),
      objectPartnerName: item?.objectPartnerName || source?.objectPartnerName || '',
      buyerRealtorKind: item?.buyerRealtorKind || source?.buyerRealtorKind || 'employee',
      buyerRealtorEmployee: idOf(item?.buyerRealtorEmployee) || idOf(source?.buyerRealtorEmployee),
      buyerPartnerName: item?.buyerPartnerName || source?.buyerPartnerName || '',
      tensionLevel: item?.tensionLevel || 3,
      location: item?.location || '',
      deadlineAt: item?.deadlineAt ? toDateLocal(new Date(item.deadlineAt)) : '',
      scheduledReregistrationAt: item?.scheduledReregistrationAt ? toDatetimeLocal(new Date(item.scheduledReregistrationAt)) : '',
      notary: item?.notary || '',
      status: item?.status || 'waiting',
      reregistrationPlaceType: item?.reregistrationPlaceType || 'notary',
      reregistrationPlaceName: item?.reregistrationPlaceName || '',
      resultSummary: item?.resultSummary || '',
      sellerConditions: Array.isArray(item?.sellerConditions) ? item.sellerConditions.join('\n') : '',
      buyerConditions: Array.isArray(item?.buyerConditions) ? item.buyerConditions.join('\n') : '',
      agencyConditions: Array.isArray(item?.agencyConditions) ? item.agencyConditions.join('\n') : '',
      note: '',
      sourceOperationEvent: idOf(item?.sourceOperationEvent),
      sourcePreDepositEvent: idOf(item?.sourcePreDepositEvent),
   };
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

function propertyOwnerPhone(property) {
   const owners = Array.isArray(property?.owners) ? property.owners : [];
   for (const owner of owners) {
      const phones = Array.isArray(owner?.phones) ? owner.phones : [];
      const phone = phones.find(Boolean);
      if (phone) return phone;
   }
   return '';
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

function sortOperationEvents(items) {
   return [...items].sort((a, b) => {
      const aTime = new Date(a?.occurredAt || a?.createdAt || 0).getTime();
      const bTime = new Date(b?.occurredAt || b?.createdAt || 0).getTime();

      return bTime - aTime;
   });
}

function pickDemoItem(items, index, fallback) {
   return items?.[index] || items?.[0] || fallback;
}

function buildDemoFinanceEvents({ properties, leads, employees }) {
   const fallbackEmployees = [
      { _id: 'demo-emp-1', fullName: 'Марія Савчук' },
      { _id: 'demo-emp-2', fullName: 'Андрій Коваль' },
      { _id: 'demo-emp-3', fullName: 'Олена Романюк' },
   ];
   const fallbackProperties = [
      { _id: 'demo-prop-1', title: '2к квартира, Центр', cost: 62000, currency: 'USD', location_text: 'Центр, вул. Шевченка' },
      { _id: 'demo-prop-2', title: 'Будинок біля парку', cost: 98000, currency: 'USD', location_text: 'Парк, тиха вулиця' },
      { _id: 'demo-prop-3', title: '1к новобудова', cost: 43500, currency: 'USD', location_text: 'Південний район' },
      { _id: 'demo-prop-4', title: '3к квартира з терасою', cost: 87500, currency: 'USD', location_text: 'Новий Львів' },
      { _id: 'demo-prop-5', title: 'Комерція під кавʼярню', cost: 112000, currency: 'USD', location_text: 'Франківський район' },
   ];
   const fallbackLeads = [
      { _id: 'demo-lead-1', name: 'Ірина Мельник', phones: ['+38 067 111 22 33'], stage: 'zs' },
      { _id: 'demo-lead-2', name: 'Олег Данилюк', phones: ['+38 050 444 55 66'], stage: 'zs' },
      { _id: 'demo-lead-3', name: 'Сімʼя Петренків', phones: ['+38 093 777 88 99'], stage: 'zs' },
      { _id: 'demo-lead-4', name: 'Назар і Христина', phones: ['+38 096 222 14 88'], stage: 'zs' },
      { _id: 'demo-lead-5', name: 'Підприємець Роман', phones: ['+38 063 808 40 40'], stage: 'zs' },
   ];
   const employeePool = employees?.length ? employees : fallbackEmployees;
   const propertyPool = properties?.length ? properties : fallbackProperties;
   const leadPool = leads?.length ? leads : fallbackLeads;

   return [
      {
         _id: 'demo-finance-deposit-waiting',
         kind: 'financeEvent',
         financeType: 'deposit',
         occurredAt: '2026-06-18T13:30:00.000Z',
         property: pickDemoItem(propertyPool, 0, fallbackProperties[0]),
         lead: pickDemoItem(leadPool, 0, fallbackLeads[0]),
         responsibleEmployee: pickDemoItem(employeePool, 0, fallbackEmployees[0]),
         processedByEmployee: pickDemoItem(employeePool, 1, fallbackEmployees[1]),
         objectRealtorEmployee: pickDemoItem(employeePool, 0, fallbackEmployees[0]),
         buyerRealtorEmployee: pickDemoItem(employeePool, 1, fallbackEmployees[1]),
         tensionLevel: 3,
         location: 'Офіс Karamax, переговорна',
         deadlineAt: '2026-06-27T20:59:00.000Z',
         notary: 'Нотаріус Гнатюк О. В.',
         status: 'waiting',
         scheduledReregistrationAt: '2026-06-27T08:00:00.000Z',
         sellerConditions: ['підготувати довідку про зареєстрованих', 'погодити виписку до переоформлення'],
         buyerConditions: ['внести залишок коштів у день нотаріуса', 'підтвердити банк до дедлайну'],
         agencyConditions: ['перевірити документи', 'синхронізувати продавця й покупця'],
         notes: [{ color: '#22c55e', text: 'Умови спокійні, всі сторони на звʼязку.' }],
      },
      {
         _id: 'demo-finance-deposit-completed',
         kind: 'financeEvent',
         financeType: 'deposit',
         occurredAt: '2026-05-24T10:10:00.000Z',
         property: pickDemoItem(propertyPool, 1, fallbackProperties[1]),
         lead: pickDemoItem(leadPool, 1, fallbackLeads[1]),
         responsibleEmployee: pickDemoItem(employeePool, 1, fallbackEmployees[1]),
         processedByEmployee: pickDemoItem(employeePool, 1, fallbackEmployees[1]),
         objectRealtorEmployee: pickDemoItem(employeePool, 2, fallbackEmployees[2]),
         buyerRealtorEmployee: pickDemoItem(employeePool, 1, fallbackEmployees[1]),
         tensionLevel: 4,
         location: 'Нотаріальна контора, вул. Соборна',
         deadlineAt: '2026-06-03T20:59:00.000Z',
         notary: 'Нотаріус Левченко Н. М.',
         status: 'completed_improved',
         scheduledReregistrationAt: '2026-06-02T11:30:00.000Z',
         sellerConditions: ['передати оригінали документів', 'підписати згоду подружжя'],
         buyerConditions: ['підготувати аванс і паспортні дані'],
         agencyConditions: ['контроль розписок', 'фінальна звірка умов'],
         notes: [{ color: '#16a34a', text: 'Завдаток пройшов рівно, переоформлення виконано.' }],
      },
      {
         _id: 'demo-finance-deposit-failed',
         kind: 'financeEvent',
         financeType: 'deposit',
         occurredAt: '2026-05-08T15:45:00.000Z',
         property: pickDemoItem(propertyPool, 2, fallbackProperties[2]),
         lead: pickDemoItem(leadPool, 2, fallbackLeads[2]),
         responsibleEmployee: pickDemoItem(employeePool, 2, fallbackEmployees[2]),
         processedByEmployee: pickDemoItem(employeePool, 0, fallbackEmployees[0]),
         objectRealtorEmployee: pickDemoItem(employeePool, 2, fallbackEmployees[2]),
         buyerRealtorEmployee: pickDemoItem(employeePool, 0, fallbackEmployees[0]),
         tensionLevel: 1,
         location: 'Офіс партнера',
         deadlineAt: '2026-05-17T20:59:00.000Z',
         notary: 'не погоджено',
         status: 'failed',
         scheduledReregistrationAt: '2026-05-17T09:00:00.000Z',
         sellerConditions: ['продавець мав зняти арешт'],
         buyerConditions: ['покупець чекав підтвердження документів'],
         agencyConditions: ['юридична перевірка до підписання'],
         notes: [{ color: '#ef4444', text: 'Зірвалося через невиконання умови продавцем.' }],
      },
      {
         _id: 'demo-finance-pers-improved',
         kind: 'financeEvent',
         financeType: 'reregistration',
         depositId: 'demo-finance-deposit-completed',
         occurredAt: '2026-06-02T11:30:00.000Z',
         deadlineAt: '2026-06-02T11:30:00.000Z',
         scheduledReregistrationAt: '2026-06-02T11:30:00.000Z',
         property: pickDemoItem(propertyPool, 1, fallbackProperties[1]),
         lead: pickDemoItem(leadPool, 1, fallbackLeads[1]),
         responsibleEmployee: pickDemoItem(employeePool, 1, fallbackEmployees[1]),
         processedByEmployee: pickDemoItem(employeePool, 1, fallbackEmployees[1]),
         objectRealtorEmployee: pickDemoItem(employeePool, 2, fallbackEmployees[2]),
         buyerRealtorEmployee: pickDemoItem(employeePool, 1, fallbackEmployees[1]),
         tensionLevel: 4,
         location: 'Нотаріальна контора',
         reregistrationPlaceType: 'notary',
         reregistrationPlaceName: 'Нотаріус Левченко Н. М.',
         notary: 'Нотаріус Левченко Н. М.',
         status: 'completed_improved',
         resultSummary: 'ПЕРС виконано з покращенням умов для агентства.',
         sellerConditions: ['продавець закрив технічну умову до угоди'],
         buyerConditions: ['покупець вийшов на угоду без перенесення'],
         agencyConditions: ['комісія зафіксована краще плану'],
         notes: [{ color: '#a855f7', text: 'Наслідок завдатку від 24.05.26.' }],
      },
      {
         _id: 'demo-finance-pers-success',
         kind: 'financeEvent',
         financeType: 'reregistration',
         depositId: 'demo-finance-deposit-waiting',
         occurredAt: '2026-06-27T08:00:00.000Z',
         deadlineAt: '2026-06-27T08:00:00.000Z',
         scheduledReregistrationAt: '2026-06-27T08:00:00.000Z',
         property: pickDemoItem(propertyPool, 0, fallbackProperties[0]),
         lead: pickDemoItem(leadPool, 0, fallbackLeads[0]),
         responsibleEmployee: pickDemoItem(employeePool, 0, fallbackEmployees[0]),
         processedByEmployee: pickDemoItem(employeePool, 1, fallbackEmployees[1]),
         objectRealtorEmployee: pickDemoItem(employeePool, 0, fallbackEmployees[0]),
         buyerRealtorEmployee: pickDemoItem(employeePool, 1, fallbackEmployees[1]),
         tensionLevel: 3,
         location: 'Відділ продажу ЖК',
         reregistrationPlaceType: 'developer_sales',
         reregistrationPlaceName: 'Відділ продажу забудовника Green Yard',
         notary: 'Нотаріус Гнатюк О. В.',
         status: 'completed_success',
         resultSummary: 'ПЕРС виконано штатно, без зміни умов.',
         sellerConditions: ['документи передано вчасно'],
         buyerConditions: ['розрахунок проведено в день угоди'],
         agencyConditions: ['акт і розрахунки звірено'],
         notes: [{ color: '#8b5cf6', text: 'Переоформлення привʼязане до завдатку.' }],
      },
      {
         _id: 'demo-finance-deposit-fresh-waiting',
         kind: 'financeEvent',
         financeType: 'deposit',
         occurredAt: '2026-07-18T12:20:00.000Z',
         property: pickDemoItem(propertyPool, 3, fallbackProperties[3]),
         lead: pickDemoItem(leadPool, 3, fallbackLeads[3]),
         responsibleEmployee: pickDemoItem(employeePool, 0, fallbackEmployees[0]),
         processedByEmployee: pickDemoItem(employeePool, 2, fallbackEmployees[2]),
         objectRealtorEmployee: pickDemoItem(employeePool, 0, fallbackEmployees[0]),
         buyerRealtorEmployee: pickDemoItem(employeePool, 2, fallbackEmployees[2]),
         tensionLevel: 5,
         location: 'Офіс Karamax, мала переговорна',
         deadlineAt: '2026-07-29T20:59:00.000Z',
         notary: 'Нотаріус Стецюк М. Р.',
         status: 'waiting',
         scheduledReregistrationAt: '2026-07-29T10:00:00.000Z',
         sellerConditions: ['підготувати техпаспорт', 'винести меблі до дня угоди'],
         buyerConditions: ['підтвердити джерело коштів', 'погодити фінальний огляд'],
         agencyConditions: ['тримати сторони в одному таймінгу', 'перевірити довідки за день до ПЕРС'],
         notes: [{ color: '#22c55e', text: 'Дуже легка домовленість, сторони конструктивні.' }],
      },
      {
         _id: 'demo-finance-deposit-worse',
         kind: 'financeEvent',
         financeType: 'deposit',
         occurredAt: '2026-06-11T16:10:00.000Z',
         property: pickDemoItem(propertyPool, 4, fallbackProperties[4]),
         lead: pickDemoItem(leadPool, 4, fallbackLeads[4]),
         responsibleEmployee: pickDemoItem(employeePool, 1, fallbackEmployees[1]),
         processedByEmployee: pickDemoItem(employeePool, 0, fallbackEmployees[0]),
         objectRealtorEmployee: pickDemoItem(employeePool, 1, fallbackEmployees[1]),
         buyerRealtorEmployee: pickDemoItem(employeePool, 0, fallbackEmployees[0]),
         tensionLevel: 2,
         location: 'Офіс покупця',
         deadlineAt: '2026-06-20T20:59:00.000Z',
         notary: 'Нотаріус Мороз І. П.',
         status: 'completed_worse',
         scheduledReregistrationAt: '2026-06-19T13:00:00.000Z',
         sellerConditions: ['узгодити звільнення приміщення', 'підготувати документи ФОП'],
         buyerConditions: ['внести оплату частинами', 'погодити акт прийому-передачі'],
         agencyConditions: ['зафіксувати зміну комісії', 'підготувати додаткову угоду'],
         notes: [{ color: '#f97316', text: 'Умови виконані, але фінально гірше плану по термінах.' }],
      },
      {
         _id: 'demo-finance-pers-worse',
         kind: 'financeEvent',
         financeType: 'reregistration',
         depositId: 'demo-finance-deposit-worse',
         occurredAt: '2026-06-19T13:00:00.000Z',
         deadlineAt: '2026-06-20T20:59:00.000Z',
         scheduledReregistrationAt: '2026-06-19T13:00:00.000Z',
         property: pickDemoItem(propertyPool, 4, fallbackProperties[4]),
         lead: pickDemoItem(leadPool, 4, fallbackLeads[4]),
         responsibleEmployee: pickDemoItem(employeePool, 1, fallbackEmployees[1]),
         processedByEmployee: pickDemoItem(employeePool, 0, fallbackEmployees[0]),
         objectRealtorEmployee: pickDemoItem(employeePool, 1, fallbackEmployees[1]),
         buyerRealtorEmployee: pickDemoItem(employeePool, 0, fallbackEmployees[0]),
         tensionLevel: 2,
         location: 'Нотаріальна контора',
         reregistrationPlaceType: 'notary',
         reregistrationPlaceName: 'Нотаріус Мороз І. П.',
         notary: 'Нотаріус Мороз І. П.',
         status: 'completed_worse',
         resultSummary: 'ПЕРС виконано, але із погіршенням умов по строках і сервісних платежах.',
         sellerConditions: ['продавець передав ключі після підписання'],
         buyerConditions: ['покупець прийняв зміну графіку платежів'],
         agencyConditions: ['агентство зафіксувало втрату частини бонусу'],
         notes: [{ color: '#a855f7', text: 'ПЕРС завершений, але не ідеальний сценарій.' }],
      },
      {
         _id: 'demo-finance-pers-failed',
         kind: 'financeEvent',
         financeType: 'reregistration',
         depositId: 'demo-finance-deposit-failed',
         occurredAt: '2026-05-17T09:00:00.000Z',
         deadlineAt: '2026-05-17T20:59:00.000Z',
         scheduledReregistrationAt: '2026-05-17T09:00:00.000Z',
         property: pickDemoItem(propertyPool, 2, fallbackProperties[2]),
         lead: pickDemoItem(leadPool, 2, fallbackLeads[2]),
         responsibleEmployee: pickDemoItem(employeePool, 2, fallbackEmployees[2]),
         processedByEmployee: pickDemoItem(employeePool, 0, fallbackEmployees[0]),
         objectRealtorEmployee: pickDemoItem(employeePool, 2, fallbackEmployees[2]),
         buyerRealtorEmployee: pickDemoItem(employeePool, 0, fallbackEmployees[0]),
         tensionLevel: 1,
         location: 'Скасована зустріч у нотаріуса',
         reregistrationPlaceType: 'other',
         reregistrationPlaceName: 'зустріч не відбулася',
         notary: 'не погоджено',
         status: 'failed',
         resultSummary: 'ПЕРС зірвано через невиконану юридичну умову продавця.',
         sellerConditions: ['арешт не знято до погодженого часу'],
         buyerConditions: ['покупець відмовився чекати перенесення'],
         agencyConditions: ['зафіксувати причину зриву і повернення коштів'],
         notes: [{ color: '#ef4444', text: 'Демо зірваного ПЕРС для червоного сценарію.' }],
      },
   ];
}

function buildDemoPreDepositEvents({ properties, leads, employees }) {
   const fallbackEmployees = [
      { _id: 'demo-emp-1', fullName: 'Марія Савчук' },
      { _id: 'demo-emp-2', fullName: 'Андрій Коваль' },
      { _id: 'demo-emp-3', fullName: 'Олена Романюк' },
   ];
   const fallbackProperties = [
      { _id: 'demo-prop-1', title: '2к квартира, Центр', cost: 62000, currency: 'USD', location_text: 'Центр, вул. Шевченка' },
      { _id: 'demo-prop-4', title: '3к квартира з терасою', cost: 87500, currency: 'USD', location_text: 'Новий Львів' },
      { _id: 'demo-prop-5', title: 'Комерція під кавʼярню', cost: 112000, currency: 'USD', location_text: 'Франківський район' },
   ];
   const fallbackLeads = [
      { _id: 'demo-lead-1', name: 'Ірина Мельник', phones: ['+38 067 111 22 33'], stage: 'pzs' },
      { _id: 'demo-lead-4', name: 'Назар і Христина', phones: ['+38 096 222 14 88'], stage: 'pzs' },
      { _id: 'demo-lead-5', name: 'Підприємець Роман', phones: ['+38 063 808 40 40'], stage: 'pzs' },
   ];
   const employeePool = employees?.length ? employees : fallbackEmployees;
   const propertyPool = properties?.length ? properties : fallbackProperties;
   const leadPool = leads?.length ? leads : fallbackLeads;

   return [
      {
         _id: 'demo-pzs-active-price',
         kind: 'preDepositEvent',
         occurredAt: '2026-07-19T15:40:00.000Z',
         property: pickDemoItem(propertyPool, 1, fallbackProperties[1]),
         lead: pickDemoItem(leadPool, 1, fallbackLeads[1]),
         responsibleEmployee: pickDemoItem(employeePool, 0, fallbackEmployees[0]),
         objectRealtorEmployee: pickDemoItem(employeePool, 0, fallbackEmployees[0]),
         buyerRealtorEmployee: pickDemoItem(employeePool, 2, fallbackEmployees[2]),
         status: 'active',
         condition: 'Покупець готовий дати завдаток, якщо продавець погодить 84 000$ і залишить кухню.',
         sourceLabel: 'Після повторного показу',
         nextStepAt: '2026-07-20T11:00:00.000Z',
         steps: [
            { at: '2026-07-19T15:40:00.000Z', type: 'created', text: 'Після показу покупець сформував чітку умову по ціні та кухні.' },
            { at: '2026-07-19T18:10:00.000Z', type: 'negotiation', text: 'Продавцю передано пропозицію, попросив час до ранку.' },
            { at: '2026-07-20T11:00:00.000Z', type: 'next_step', text: 'Запланований контрольний дзвінок і фіксація рішення.' },
         ],
      },
      {
         _id: 'demo-pzs-to-deposit',
         kind: 'preDepositEvent',
         occurredAt: '2026-06-17T12:15:00.000Z',
         property: pickDemoItem(propertyPool, 0, fallbackProperties[0]),
         lead: pickDemoItem(leadPool, 0, fallbackLeads[0]),
         responsibleEmployee: pickDemoItem(employeePool, 1, fallbackEmployees[1]),
         objectRealtorEmployee: pickDemoItem(employeePool, 0, fallbackEmployees[0]),
         buyerRealtorEmployee: pickDemoItem(employeePool, 1, fallbackEmployees[1]),
         status: 'deposit',
         condition: 'Покупець купує, якщо власник підтверджує виписку до 27.06 і нотаріуса Гнатюк.',
         sourceLabel: 'Після телефонних переговорів',
         closedAt: '2026-06-18T13:30:00.000Z',
         steps: [
            { at: '2026-06-17T12:15:00.000Z', type: 'created', text: 'ПЗС виник не одразу на показі, а наступного дня після переговорів.' },
            { at: '2026-06-17T17:25:00.000Z', type: 'negotiation', text: 'Власник погодив виписку і нотаріуса за умови швидкого завдатку.' },
            { at: '2026-06-18T13:30:00.000Z', type: 'deposit', text: 'Умова виконана, ПЗС закрито завдатком.' },
         ],
      },
      {
         _id: 'demo-pzs-failed-docs',
         kind: 'preDepositEvent',
         occurredAt: '2026-05-14T09:20:00.000Z',
         property: pickDemoItem(propertyPool, 2, fallbackProperties[2]),
         lead: pickDemoItem(leadPool, 2, fallbackLeads[2]),
         responsibleEmployee: pickDemoItem(employeePool, 2, fallbackEmployees[2]),
         objectRealtorEmployee: pickDemoItem(employeePool, 2, fallbackEmployees[2]),
         buyerRealtorEmployee: pickDemoItem(employeePool, 0, fallbackEmployees[0]),
         status: 'failed',
         condition: 'Покупець готовий купити тільки після підтвердження документів і відсутності обтяжень.',
         sourceLabel: 'Після юридичної перевірки',
         closedAt: '2026-05-16T16:40:00.000Z',
         steps: [
            { at: '2026-05-14T09:20:00.000Z', type: 'created', text: 'Покупець поставив умову: чисті документи до кінця тижня.' },
            { at: '2026-05-15T14:00:00.000Z', type: 'negotiation', text: 'Виявили ризик по обтяженню, продавець не дав чіткий строк.' },
            { at: '2026-05-16T16:40:00.000Z', type: 'failed', text: 'Покупець відмовився чекати, ПЗС зірвано.' },
         ],
      },
   ];
}

function buildDemoReviewEvents({ properties, employees }) {
   const fallbackEmployees = [
      { _id: 'demo-emp-1', fullName: 'Марія Савчук' },
      { _id: 'demo-emp-2', fullName: 'Андрій Коваль' },
      { _id: 'demo-emp-3', fullName: 'Олена Романюк' },
   ];
   const fallbackProperties = [
      { _id: 'demo-review-prop-1', title: 'Будинок у Брюховичах після огляду', cost: 145000, currency: 'USD', location_text: 'Брюховичі, соснова зона', rooms: 4, square_tot: 168, floor: 1, floors: 2 },
      { _id: 'demo-review-prop-2', title: '1к квартира біля університету', cost: 48500, currency: 'USD', location_text: 'Львів, вул. Коцюбинського', rooms: 1, square_tot: 39, floor: 3, floors: 5 },
      { _id: 'demo-review-prop-3', title: 'Комерційне приміщення на фасаді', cost: 99000, currency: 'USD', location_text: 'Львів, вул. Зелена', rooms: null, square_tot: 82, floor: 1, floors: 4 },
   ];
   const employeePool = employees?.length ? employees : fallbackEmployees;
   const propertyPool = properties?.length ? properties : fallbackProperties;

   return [
      {
         _id: 'demo-review-not-taken-owner',
         kind: 'reviewEvent',
         type: 'review',
         occurredAt: '2026-07-21T09:30:00.000Z',
         property: pickDemoItem(propertyPool, 2, fallbackProperties[2]),
         responsibleEmployee: pickDemoItem(employeePool, 0, fallbackEmployees[0]),
         objectRealtorEmployee: pickDemoItem(employeePool, 0, fallbackEmployees[0]),
         review: {
            result: 'not_taken',
            objectResult: 'owner_not_ready',
            source: 'operations',
            sourceLabel: 'Операційка · не взято',
            reason: 'Власник не готовий працювати по правилах агентства і не підтвердив реальну нижню ціну.',
            note: 'Огляд провели, фото й документи бачили, але в роботу не беремо до зміни позиції власника.',
         },
      },
      {
         _id: 'demo-review-new-object',
         kind: 'reviewEvent',
         type: 'review',
         occurredAt: '2026-07-16T14:15:00.000Z',
         property: pickDemoItem(propertyPool, 0, fallbackProperties[0]),
         responsibleEmployee: pickDemoItem(employeePool, 1, fallbackEmployees[1]),
         objectRealtorEmployee: pickDemoItem(employeePool, 1, fallbackEmployees[1]),
         review: {
            result: 'new_object',
            objectResult: 'other',
            source: 'properties',
            sourceLabel: 'Створено зі сторінки Об’єкти',
            linkedPropertyStatus: 'об’єкт у роботі',
            reason: '',
            note: 'Після огляду власник погодив ексклюзив, об’єкт внесено в роботу зі сторінки Об’єкти.',
         },
      },
      {
         _id: 'demo-review-historical',
         kind: 'reviewEvent',
         type: 'review',
         occurredAt: '2026-06-08T11:00:00.000Z',
         property: pickDemoItem(propertyPool, 1, fallbackProperties[1]),
         responsibleEmployee: pickDemoItem(employeePool, 2, fallbackEmployees[2]),
         objectRealtorEmployee: pickDemoItem(employeePool, 2, fallbackEmployees[2]),
         review: {
            result: 'historical',
            objectResult: 'dirty_advertising',
            source: 'properties',
            sourceLabel: 'Довнесено з картки Об’єкта',
            linkedPropertyStatus: 'наявний об’єкт',
            reason: '',
            note: 'Історичний огляд довнесено, бо подія була втрачена при перенесенні даних.',
         },
      },
   ];
}

function MiniMetric({ label, value, accent, theme, hint = '', initiativeCount = 0, productCounts = null }) {
   const color = accent || theme.accentLight || theme.text;
   const productRows = productCounts
      ? [
         ...FINANCIAL_PRODUCT_OPTIONS.map((option) => ({
            key: option.value,
            product: { ...option, direction: 'down', hasCooperation: false },
            count: productCounts[option.value] || 0,
         })),
         {
            key: 'missing',
            product: { isMissing: true },
            count: productCounts.missing || 0,
         },
      ].filter((item) => item.count > 0)
      : [];

   return (
      <Box
         sx={{
            position: 'relative',
            overflow: 'hidden',
            width: { xs: 116, md: 96, lg: 92, xl: 88 },
            flexBasis: { xs: 116, md: 96, lg: 92, xl: 88 },
            minWidth: 0,
            flex: '0 0 auto',
            px: { xs: 1.45, md: 0.9, xl: 0.78 },
            py: { xs: 1.05, md: 0.82, xl: 0.74 },
            borderRadius: 2.4,
            border: `1px solid ${accent ? `${accent}55` : theme.border}`,
            bgcolor: 'rgba(255,255,255,0.035)',
            background: `linear-gradient(135deg, ${color}1f 0%, rgba(255,255,255,0.035) 48%, rgba(255,255,255,0.02) 100%)`,
            boxShadow: accent ? `0 10px 30px ${accent}14` : 'none',
            transition: 'transform 140ms ease, border-color 140ms ease, box-shadow 140ms ease',
            '&:before': {
               content: '""',
               position: 'absolute',
               inset: '0 auto 0 0',
               width: 4,
               bgcolor: color,
               opacity: 0.82,
            },
            '&:hover': {
               transform: 'translateY(-1px)',
               borderColor: `${color}88`,
               boxShadow: `0 14px 34px ${color}18`,
            },
         }}
      >
          <Typography sx={{ fontSize: { xs: 11, md: 9.7, xl: 9.3 }, color: theme.textSoft, fontWeight: 800, textTransform: 'uppercase' }} noWrap>
            {label}
         </Typography>
          <Stack direction="row" spacing={0.45} alignItems="center">
             <Typography sx={{ color, fontSize: { xs: 23, md: 20, xl: 19 }, lineHeight: 1.05, fontWeight: 950 }}>
                {value}
             </Typography>
             {initiativeCount > 0 && (
                <Tooltip title="Ініціативні покази">
                   <Box
                      sx={{
                         px: 0.35,
                         py: 0.08,
                         borderRadius: 1,
                         color: '#4ade80',
                         bgcolor: 'rgba(74,222,128,0.12)',
                         border: '1px solid rgba(74,222,128,0.38)',
                         fontSize: 9.5,
                         fontWeight: 950,
                         lineHeight: 1.25,
                         whiteSpace: 'nowrap',
                      }}
                   >
                      ↗і{initiativeCount}
                   </Box>
                </Tooltip>
             )}
          </Stack>
          {!!hint && (
             <Typography sx={{ color: theme.textSoft, fontSize: 10.5, lineHeight: 1.1, fontWeight: 850, mt: 0.25 }} noWrap>
                {hint}
             </Typography>
          )}
          {productRows.length > 0 && (
             <Stack direction="row" spacing={0.48} alignItems="flex-start" sx={{ mt: 0.48, minHeight: 23 }}>
                {productRows.map((row) => (
                   <Stack key={row.key} spacing={0.1} alignItems="center" sx={{ minWidth: 13 }}>
                      <FinancialProductMark product={row.product} size={11} showCode={false} />
                      <Typography sx={{ color: theme.textSoft, fontSize: 9, fontWeight: 950, lineHeight: 1 }}>
                         {row.count}
                      </Typography>
                   </Stack>
                ))}
             </Stack>
          )}
      </Box>
   );
}

function FinancialProductMark({ product, size = 25, showCode = true }) {
   if (!product) return null;

   if (product.isMissing) {
      return (
         <Tooltip title="Фінпродукт не вибрано">
            <Box
               sx={{
                  width: size,
                  height: size,
                  flex: `0 0 ${size}px`,
                  borderRadius: '50%',
                  display: 'grid',
                  placeItems: 'center',
                  color: '#facc15',
                  bgcolor: 'rgba(250,204,21,0.13)',
                  border: '1px solid rgba(250,204,21,0.55)',
                  fontSize: Math.max(10, size * 0.72),
                  fontWeight: 950,
                  lineHeight: 1,
                  boxShadow: '0 0 0 rgba(250,204,21,0.0)',
                  animation: 'missingFinancialProductPulse 1.25s ease-in-out infinite',
                  '@keyframes missingFinancialProductPulse': {
                     '0%, 100%': {
                        opacity: 0.55,
                        transform: 'scale(0.92)',
                        boxShadow: '0 0 0 rgba(250,204,21,0.0)',
                     },
                     '50%': {
                        opacity: 1,
                        transform: 'scale(1.06)',
                        boxShadow: '0 0 12px rgba(250,204,21,0.38)',
                     },
                  },
               }}
            >
               ?
            </Box>
         </Tooltip>
      );
   }

   const isInitiative = product.direction === 'up';
   const clipPath = isInitiative
      ? 'polygon(50% 5%, 95% 92%, 5% 92%)'
      : 'polygon(5% 8%, 95% 8%, 50% 95%)';
   const title = `${product.code} · ${product.label} · ${product.description}${isInitiative ? ' · ініціативна робота' : ' · вхідна лійка'}${product.hasCooperation ? ' · співпраця' : ''}`;

   return (
      <Tooltip title={title}>
         <Box
            sx={{
               position: 'relative',
               width: size,
               height: size,
               flex: `0 0 ${size}px`,
               display: 'grid',
               placeItems: 'center',
            }}
         >
            <Box
               sx={{
                  position: 'absolute',
                  inset: 0,
                  clipPath,
                  bgcolor: product.color,
                  opacity: 0.92,
                  border: `1px solid ${product.color}`,
                  filter: `drop-shadow(0 5px 9px ${product.color}35)`,
               }}
            />
            {showCode && (
               <Typography
                  sx={{
                     position: 'relative',
                     zIndex: 1,
                     color: product.value === 'OP' ? '#171717' : '#fff',
                     fontSize: size <= 22 ? 7.4 : 8.2,
                     fontWeight: 950,
                     lineHeight: 1,
                     textShadow: product.value === 'OP' ? 'none' : '0 1px 2px rgba(0,0,0,0.5)',
                     mt: isInitiative ? 0.35 : -0.15,
                  }}
               >
                  {product.code}
               </Typography>
            )}
            {product.hasCooperation && (
               <Box
                  sx={{
                     position: 'absolute',
                     right: -3,
                     bottom: -3,
                     width: size * 0.46,
                     height: size * 0.46,
                     borderRadius: '50%',
                     display: 'grid',
                     placeItems: 'center',
                     bgcolor: '#ef4444',
                     color: '#fff',
                     border: '1px solid rgba(255,255,255,0.55)',
                     fontSize: size <= 22 ? 7 : 8,
                     fontWeight: 950,
                     lineHeight: 1,
                     boxShadow: '0 4px 10px rgba(239,68,68,0.35)',
                  }}
               >
                  ↗
               </Box>
            )}
         </Box>
      </Tooltip>
   );
}

function FinancialProductColumn({ product, theme, mode }) {
   return (
      <Box
         sx={{
            minHeight: 54,
            borderRadius: 1.45,
            border: `1px solid ${product?.color || theme.border}45`,
            bgcolor: mode === 'light' ? `${product?.color || '#94a3b8'}10` : `${product?.color || '#94a3b8'}16`,
            display: 'grid',
            placeItems: 'center',
         }}
      >
         <FinancialProductMark product={product} size={25} />
      </Box>
   );
}

function FinancialProductSelect({ value, onChange, label = 'Фінпродукт', fieldSx, menuProps, fullWidth = true, size }) {
   const selected = FINANCIAL_PRODUCT_OPTIONS.find((item) => item.value === value) || null;

   return (
      <TextField
         select
         fullWidth={fullWidth}
         size={size}
         label={label}
         value={value || ''}
         onChange={(e) => onChange(e.target.value)}
         sx={fieldSx}
         SelectProps={{
            ...(menuProps ? { MenuProps: menuProps } : {}),
            renderValue: (selectedValue) => {
               const item = FINANCIAL_PRODUCT_OPTIONS.find((option) => option.value === selectedValue);
               if (!item) return '—';
               return (
                  <Stack direction="row" spacing={0.75} alignItems="center" sx={{ minWidth: 0 }}>
                     <FinancialProductMark product={{ ...item, direction: 'down', hasCooperation: false }} size={15} showCode={false} />
                     <Typography sx={{ fontSize: 12, fontWeight: 900 }} noWrap>
                        {item.fullLabel}
                     </Typography>
                  </Stack>
               );
            },
         }}
      >
         <MenuItem value="">
            <Stack direction="row" spacing={0.75} alignItems="center">
               <Box sx={{ width: 15, height: 15, borderRadius: '50%', border: '1px dashed rgba(148,163,184,0.6)' }} />
               <Typography sx={{ fontWeight: 850 }}>— не вибрано</Typography>
            </Stack>
         </MenuItem>
         {FINANCIAL_PRODUCT_OPTIONS.map((item) => (
            <MenuItem key={item.value} value={item.value}>
               <Stack direction="row" spacing={1} alignItems="center" sx={{ minWidth: 0 }}>
                  <FinancialProductMark product={{ ...item, direction: 'down', hasCooperation: false }} size={20} showCode={false} />
                  <Stack spacing={0.1} sx={{ minWidth: 0 }}>
                     <Typography sx={{ fontWeight: 950, fontSize: 12.5 }} noWrap>
                        {item.fullLabel}
                     </Typography>
                     <Typography sx={{ fontSize: 11, opacity: 0.72 }} noWrap>
                        {item.description}
                     </Typography>
                  </Stack>
               </Stack>
            </MenuItem>
         ))}
      </TextField>
   );
}

function LeaderSummaryCard({ metrics, theme, mode }) {
   const leader = metrics.leader;
   const breakdown = leader?.breakdown || {};
   const scoreRows = Object.entries(OPERATION_SCORING_RULES)
      .map(([key, points]) => {
         const count = breakdown[key] || 0;
         return count > 0 ? { key, count, points, total: count * points, label: OPERATION_SCORING_LABELS[key] || key } : null;
      })
      .filter(Boolean);

   return (
      <Box
         sx={{
            width: { xs: '100%', md: 270, lg: 260, xl: 252 },
            flexBasis: { xs: '100%', md: 270, lg: 260, xl: 252 },
            flexShrink: 0,
            ml: { xl: 'auto' },
            px: { xs: 1.15, md: 0.85, xl: 0.78 },
            py: { xs: 0.95, md: 0.72, xl: 0.68 },
            borderRadius: 2.4,
            border: `1px solid ${mode === 'light' ? 'rgba(250,204,21,0.32)' : 'rgba(250,204,21,0.24)'}`,
            bgcolor: mode === 'light' ? 'rgba(255,251,235,0.82)' : 'rgba(250,204,21,0.075)',
            background: mode === 'light'
               ? 'linear-gradient(135deg, rgba(250,204,21,0.18), rgba(255,255,255,0.78))'
               : 'linear-gradient(135deg, rgba(250,204,21,0.13), rgba(255,255,255,0.035))',
            boxShadow: '0 14px 34px rgba(250,204,21,0.10)',
         }}
      >
          <Stack spacing={0.55}>
             <Stack direction="row" spacing={0.65} alignItems="center" justifyContent="space-between">
               <Stack direction="row" spacing={0.8} alignItems="center" sx={{ minWidth: 0 }}>
                   <Box sx={{ fontSize: { xs: 22, md: 19, xl: 18 }, lineHeight: 1 }}>👑</Box>
                  <Stack spacing={0.05} sx={{ minWidth: 0 }}>
                      <Typography sx={{ color: theme.textSoft, fontSize: { xs: 10, md: 9.4 }, fontWeight: 950, textTransform: 'uppercase', lineHeight: 1 }}>
                        Лідер періоду
                     </Typography>
                      <Typography sx={{ color: theme.text, fontSize: { xs: 15, md: 12.6, xl: 12.2 }, fontWeight: 950, lineHeight: 1.12 }} noWrap>
                        {leader?.name || 'ще немає даних'}
                     </Typography>
                  </Stack>
               </Stack>
               <Tooltip
                  arrow
                  title={
                     <Box sx={{ p: 0.4 }}>
                        <Typography sx={{ fontSize: 12, fontWeight: 950, mb: 0.4 }}>
                           Як нараховано рейтинг
                        </Typography>
                        <Stack spacing={0.25}>
                           {scoreRows.length ? scoreRows.map((row) => (
                              <Box key={row.key}>
                                 <Typography sx={{ fontSize: 11.5, fontWeight: 850 }}>
                                    {row.label}: {row.count} × {row.points} = {row.total}
                                 </Typography>
                                 <Typography sx={{ fontSize: 10.5, opacity: 0.72 }}>
                                    {OPERATION_SCORING_DESCRIPTIONS[row.key] || 'операційний результат'}
                                 </Typography>
                              </Box>
                           )) : (
                              <Typography sx={{ fontSize: 11.5 }}>Поки немає результативних дій</Typography>
                           )}
                        </Stack>
                        <Typography sx={{ fontSize: 10.5, opacity: 0.75, mt: 0.5 }}>
                           Ваги можна змінити у файлі utils/crm/operationScoring.js
                        </Typography>
                     </Box>
                  }
               >
                  <Chip
                     size="small"
                     label={`${leader?.score || 0} балів`}
                      sx={{ height: { xs: 24, md: 21 }, color: '#facc15', bgcolor: 'rgba(250,204,21,0.14)', border: '1px solid rgba(250,204,21,0.45)', fontWeight: 950, cursor: 'help', '& .MuiChip-label': { px: { md: 0.7 }, fontSize: { md: 11 } } }}
                  />
               </Tooltip>
            </Stack>

             <Stack direction="row" spacing={0.25} flexWrap="nowrap" useFlexGap sx={{ overflow: 'hidden' }}>
                <Chip size="small" label={`П→ПЗС ${metrics.conversions.showingToPzs}%`} sx={{ height: 20, color: '#f472b6', bgcolor: 'rgba(244,114,182,0.13)', border: '1px solid rgba(244,114,182,0.38)', fontWeight: 900, '& .MuiChip-label': { px: 0.45, fontSize: 10 } }} />
                <Chip size="small" label={`ПЗС→ЗС ${metrics.conversions.pzsToDeposit}%`} sx={{ height: 20, color: '#22c55e', bgcolor: 'rgba(34,197,94,0.13)', border: '1px solid rgba(34,197,94,0.38)', fontWeight: 900, '& .MuiChip-label': { px: 0.45, fontSize: 10 } }} />
                <Chip size="small" label={`ЗС→ПЕРС ${metrics.conversions.depositToPers}%`} sx={{ height: 20, color: '#a855f7', bgcolor: 'rgba(168,85,247,0.13)', border: '1px solid rgba(168,85,247,0.38)', fontWeight: 900, '& .MuiChip-label': { px: 0.45, fontSize: 10 } }} />
             </Stack>
         </Stack>
      </Box>
   );
}

function TimelinePeriodHeader({ group, theme, mode }) {
   if (!group?.title) return null;

   const counts = group.items.reduce((acc, item) => {
      const bucket = getTimelineItemBucket(item);
      acc[bucket] = (acc[bucket] || 0) + 1;
      acc.total += 1;
      return acc;
   }, { total: 0, showing: 0, review: 0, pzs: 0, deposit: 0, pers: 0 });

   const chips = [
      { key: 'showing', label: 'покази', color: '#94a3b8' },
      { key: 'review', label: 'огляди', color: '#38bdf8' },
      { key: 'pzs', label: 'ПЗС', color: '#f472b6' },
      { key: 'deposit', label: 'ЗС', color: '#22c55e' },
      { key: 'pers', label: 'ПЕРС', color: '#a855f7' },
   ].filter((chip) => counts[chip.key] > 0);

   return (
      <Box
         sx={{
            mt: 0.7,
            px: 1.15,
            py: 0.75,
            borderRadius: 2.1,
            border: `1px solid ${mode === 'light' ? 'rgba(100,116,139,0.22)' : 'rgba(148,163,184,0.16)'}`,
            bgcolor: mode === 'light' ? 'rgba(248,250,252,0.84)' : 'rgba(15,23,42,0.42)',
            backdropFilter: 'blur(12px)',
            boxShadow: mode === 'light' ? '0 10px 24px rgba(15,23,42,0.045)' : '0 14px 30px rgba(0,0,0,0.18)',
         }}
      >
         <Stack direction={{ xs: 'column', md: 'row' }} spacing={0.8} alignItems={{ xs: 'flex-start', md: 'center' }} justifyContent="space-between">
            <Stack direction="row" spacing={0.9} alignItems="center" sx={{ minWidth: 0 }}>
               <Box
                  sx={{
                     width: 34,
                     height: 34,
                     borderRadius: '50%',
                     display: 'grid',
                     placeItems: 'center',
                     color: group.isBest ? '#facc15' : '#f472b6',
                     bgcolor: group.isBest ? 'rgba(250,204,21,0.15)' : 'rgba(236,72,153,0.14)',
                     border: group.isBest ? '1px solid rgba(250,204,21,0.42)' : '1px solid rgba(236,72,153,0.36)',
                     fontWeight: 950,
                     boxShadow: group.isBest ? '0 0 22px rgba(250,204,21,0.14)' : 'none',
                  }}
               >
                  {group.isBest ? '👑' : '✦'}
               </Box>
               <Stack spacing={0.05} sx={{ minWidth: 0 }}>
                  <Typography sx={{ color: theme.text, fontSize: 14.5, fontWeight: 950, lineHeight: 1.15, textTransform: 'capitalize' }} noWrap>
                     {group.title}
                  </Typography>
                  {!!group.subtitle && (
                     <Typography sx={{ color: theme.textSoft, fontSize: 11.5, fontWeight: 800, lineHeight: 1.15 }} noWrap>
                        {group.subtitle}
                     </Typography>
                  )}
               </Stack>
            </Stack>

            <Stack direction="row" spacing={0.55} flexWrap="wrap" useFlexGap justifyContent={{ xs: 'flex-start', md: 'flex-end' }}>
               <Chip
                  size="small"
                  label={`${counts.total} подій`}
                  sx={{ height: 24, color: theme.text, bgcolor: 'rgba(255,255,255,0.07)', border: `1px solid ${theme.border}`, fontWeight: 950 }}
               />
               {group.isBest && (
                  <Chip
                     size="small"
                     label="найкращий період"
                     sx={{
                        height: 24,
                        color: '#facc15',
                        bgcolor: 'rgba(250,204,21,0.14)',
                        border: '1px solid rgba(250,204,21,0.45)',
                        fontWeight: 950,
                     }}
                  />
               )}
               {chips.map((chip) => (
                  <Chip
                     key={chip.key}
                     size="small"
                     label={`${counts[chip.key]} ${chip.label}`}
                     sx={{
                        height: 24,
                        color: chip.color,
                        bgcolor: `${chip.color}1b`,
                        border: `1px solid ${chip.color}55`,
                        fontWeight: 950,
                     }}
                  />
               ))}
            </Stack>
         </Stack>
      </Box>
   );
}

function OperationRow({ item, theme, mode }) {
   const result = RESULT_SHOWING_OPTIONS.find((x) => x.value === item.resultShowing) || RESULT_SHOWING_OPTIONS[0];
   const ResultIcon = result.icon || VisibilityRoundedIcon;
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
   const isBuyerPartner = item.buyerRealtorKind === 'partner';
   const presenceLabel = labelOf(PRESENCE_TYPE_OPTIONS, item.presenceType || 'me');
   const showingKindLabel = labelOf(SHOWING_KIND_OPTIONS, normalizeShowingKind(item.showingKind));
   const shownByLabel =
      employeeName(item.shownByEmployee) ||
      (item.presenceType === 'partner'
         ? 'співпраця'
         : item.presenceType === 'client_self'
            ? 'клієнт сам'
            : item.presenceType === 'agency_colleague'
               ? 'колега з агентства'
               : '—');
   const facilitatedByLabel = employeeName(item.facilitatedByEmployee) || '—';

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
               <Chip size="small" icon={<ResultIcon sx={{ color: '#101014 !important', fontSize: 15 }} />} label={result.label} sx={{ width: '100%', justifyContent: 'flex-start', color: '#101014', bgcolor: result.color, fontWeight: 950 }} />
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

function OperationRowCompact({ item, theme, mode, onEdit, onDelete, canManage = false, linkedPzs = null, onOpenPreDeposit }) {
   const [expanded, setExpanded] = useState(false);
   const result = RESULT_SHOWING_OPTIONS.find((x) => x.value === item.resultShowing) || RESULT_SHOWING_OPTIONS[0];
   const ResultIcon = result.icon || VisibilityRoundedIcon;
   const eventType = EVENT_TYPES.find((x) => x.value === item.type) || EVENT_TYPES[0];
   const EventIcon = eventType.icon;
   const photo = getPropertyImage(item.property);
   const dateParts = formatDateParts(item.occurredAt);

   const showingAccent = mode === 'light' ? '#64748b' : '#94a3b8';
   const panelBg = mode === 'light' ? 'rgba(248,250,252,0.92)' : 'rgba(148,163,184,0.040)';
   const cellBg = mode === 'light' ? 'rgba(100,116,139,0.045)' : 'rgba(148,163,184,0.045)';
   const objectCellBg = mode === 'light' ? 'rgba(100,116,139,0.055)' : 'rgba(148,163,184,0.060)';
   const showingBorder = mode === 'light' ? 'rgba(100,116,139,0.20)' : 'rgba(148,163,184,0.16)';
   const neutralResultBg = mode === 'light' ? 'rgba(100,116,139,0.085)' : 'rgba(148,163,184,0.075)';
   const showingResultBg =
      mode === 'light'
         ? `${result.color}2b`
         : mode === 'luxury'
            ? 'rgba(212,175,55,0.18)'
            : `${result.color}33`;
   const showingResultText = mode === 'light' ? '#171717' : theme.text;
   const linkedPzsData = linkedPzs?.pzs || linkedPzs || null;
   const linkedPzsStatus = linkedPzsData?.status || null;
   const linkedPzsColor = linkedPzsStatus ? PZS_STATUS_COLORS[linkedPzsStatus] || result.color : result.color;
   const LinkedPzsIcon = linkedPzsStatus === 'deposit'
      ? HandshakeRoundedIcon
      : linkedPzsStatus === 'failed'
         ? CloseRoundedIcon
         : ResultIcon;
   const showingResultLabel =
      item.resultShowing === 'pzs' && linkedPzsStatus
         ? linkedPzsStatus === 'deposit'
            ? 'Завдаток'
            : linkedPzsStatus === 'failed'
               ? 'Зірвано'
               : result.label
         : result.label;
   const buyerMoodByResult = {
      zs: '🤝',
      pzs: '🙂',
      high_interest: '😍',
      objections_found: '🤔',
      unclear: '😶',
      refusal: '🙁',
   };
   const buyerMood = buyerMoodByResult[item.resultShowing] || '🙂';
   const financialProduct = demoFinancialProductForItem(item);

   const objectRealtor =
      item.objectRealtorKind === 'partner'
         ? item.objectPartnerName || 'СП'
         : employeeName(item.objectRealtorEmployee) || '—';
   const buyerRealtor =
      item.buyerRealtorKind === 'partner'
         ? item.buyerPartnerName || 'СП'
         : employeeName(item.buyerRealtorEmployee) || '—';
   const isBuyerPartner = item.buyerRealtorKind === 'partner';
   const presenceLabel = labelOf(PRESENCE_TYPE_OPTIONS, item.presenceType || 'me');
   const showingKindLabel = labelOf(SHOWING_KIND_OPTIONS, normalizeShowingKind(item.showingKind));
   const shownByLabel =
      employeeName(item.shownByEmployee) ||
      (item.presenceType === 'partner'
         ? 'співпраця'
         : item.presenceType === 'client_self'
            ? 'клієнт сам'
            : item.presenceType === 'agency_colleague'
               ? 'колега з агентства'
               : '—');
   const facilitatedByLabel = employeeName(item.facilitatedByEmployee) || '—';

   return (
      <Box
         sx={{
            p: 0.42,
            borderRadius: 2.2,
            border: `1px solid ${showingBorder}`,
            bgcolor: panelBg,
            boxShadow: mode === 'light' ? '0 10px 22px rgba(15,23,42,0.045)' : '0 14px 30px rgba(0,0,0,0.20)',
         }}
      >
         <Box
            sx={{
               display: 'grid',
               gridTemplateColumns: {
                  xs: '1fr',
                  lg: '86px minmax(210px,1.2fr) minmax(190px,0.9fr) minmax(250px,1.05fr) 132px',
               },
               gap: 0.45,
               alignItems: 'center',
            }}
         >
            <Stack
               spacing={0.25}
               sx={{
                  minHeight: 54,
                  borderRadius: 1.6,
                   border: `1px solid ${showingBorder}`,
                  bgcolor: cellBg,
                  px: 0.8,
                  py: 0.3,
                  justifyContent: 'center',
                  alignItems: 'center',
               }}
            >
                <Stack direction="row" spacing={0.45} alignItems="center" justifyContent="center" sx={{ width: '100%' }}>
                    <EventIcon sx={{ color: showingAccent, fontSize: 15 }} />
                   <Typography sx={{ color: theme.text, fontWeight: 950, fontSize: 11 }} noWrap>
                      {eventType.label}
                   </Typography>
                </Stack>
               <Typography sx={{ color: theme.text, fontWeight: 950, fontSize: 14, lineHeight: 1.05, textAlign: 'center', width: '100%' }}>
                  {dateParts.date}
               </Typography>
               <Stack direction="row" spacing={0.35} alignItems="center" justifyContent="center" sx={{ width: '100%' }}>
                  <Typography sx={{ color: theme.textSoft, fontSize: 10.5, fontWeight: 800, lineHeight: 1.05, textAlign: 'center' }}>
                     {dateParts.time}
                  </Typography>
                  <FinancialProductMark product={financialProduct} size={14} showCode={false} />
               </Stack>
            </Stack>

            <Stack
               direction="row"
               spacing={0.55}
               sx={{
                  minWidth: 0,
                  minHeight: 54,
                  p: 0.4,
                  borderRadius: 1.6,
                  bgcolor: objectCellBg,
                  border: `1px solid ${showingBorder}`,
                  alignItems: 'flex-start',
               }}
            >
               <Box
                  sx={{
                     width: 42,
                     height: 42,
                     minWidth: 42,
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
               <Stack spacing={0.14} sx={{ minWidth: 0, justifyContent: 'flex-start', pt: 0 }}>
                  <Tooltip title={propertyTitle(item.property)}>
                     <Typography sx={{ color: theme.text, fontWeight: 950, fontSize: 12.5, lineHeight: 1.14 }} noWrap>
                        {propertyTitle(item.property)}
                     </Typography>
                  </Tooltip>
                  <Typography sx={{ color: theme.textSoft, fontSize: 11, fontWeight: 750, lineHeight: 1.16 }} noWrap>
                     {propertyMeta(item.property) || 'характеристики не внесені'}
                  </Typography>
                  <Typography sx={{ color: theme.textSoft, fontSize: 10.5, fontWeight: 800, lineHeight: 1.14 }} noWrap>
                     рієлтор: <Box component="span" sx={{ color: theme.text }}>{objectRealtor}</Box>
                  </Typography>
               </Stack>
            </Stack>

            <Stack
               direction="row"
               spacing={0.55}
               sx={{
                  minWidth: 0,
                  minHeight: 54,
                  p: 0.4,
                  borderRadius: 1.6,
                  border: `1px solid ${theme.border}`,
                  bgcolor: cellBg,
                  alignItems: 'flex-start',
               }}
            >
               <Box
                  sx={{
                     width: 36,
                     height: 36,
                     minWidth: 36,
                     borderRadius: '50%',
                     display: 'flex',
                     alignItems: 'center',
                     justifyContent: 'center',
                     bgcolor: isBuyerPartner
                        ? 'rgba(239,68,68,0.14)'
                        : mode === 'light'
                            ? 'rgba(100,116,139,0.12)'
                            : 'rgba(148,163,184,0.075)',
                      border: `1px solid ${showingBorder}`,
                     fontSize: 20,
                     lineHeight: 1,
                  }}
               >
                  {isBuyerPartner ? (
                     <Tooltip title="Покупець по співпраці">
                        <PestControlRoundedIcon
                           sx={{
                              fontSize: 25,
                              color: '#ef4444',
                              filter: 'drop-shadow(0 4px 7px rgba(0,0,0,0.45))',
                              transform: 'rotate(-12deg)',
                           }}
                        />
                     </Tooltip>
                  ) : (
                     buyerMood
                  )}
               </Box>
               <Stack spacing={0.14} sx={{ minWidth: 0, alignSelf: 'stretch', justifyContent: 'flex-start', pt: 0 }}>
                  <Typography sx={{ color: theme.text, fontWeight: 950, fontSize: 12.5, lineHeight: 1.14 }} noWrap>
                     {item.lead?.name || 'Без клієнта'}
                  </Typography>
                  <Typography sx={{ color: theme.textSoft, fontSize: 11, fontWeight: 750, lineHeight: 1.16 }} noWrap>
                     {item.lead?.phones?.[0] || item.lead?.requestSummary || '—'}
                  </Typography>
                  <Typography sx={{ color: theme.textSoft, fontSize: 10.5, fontWeight: 800, lineHeight: 1.14 }} noWrap>
                     рієлтор: <Box component="span" sx={{ color: theme.text }}>{buyerRealtor}</Box>
                  </Typography>
               </Stack>
            </Stack>

            <Box
               sx={{
                  minWidth: 0,
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
                  gap: 0.45,
                  alignSelf: 'stretch',
               }}
            >
               {[
                  {
                     key: 'showing',
                      icon: item.resultShowing === 'pzs' ? <LinkedPzsIcon /> : <ResultIcon />,
                      label: showingResultLabel,
                      color: showingResultText,
                      iconColor: item.resultShowing === 'pzs' ? linkedPzsColor : result.color,
                      bg: item.resultShowing === 'pzs' && linkedPzsStatus ? `${linkedPzsColor}26` : showingResultBg,
                      border: `${item.resultShowing === 'pzs' ? linkedPzsColor : result.color}66`,
                      clickable: item.resultShowing === 'pzs' && !linkedPzs,
                   },
                  {
                     key: 'object',
                     icon: <ApartmentRoundedIcon />,
                     label: labelOf(RESULT_OBJECT_OPTIONS, item.resultObject),
                     color: theme.text,
                      iconColor: showingAccent,
                      bg: neutralResultBg,
                      border: showingBorder,
                  },
                  {
                     key: 'buyer',
                     icon: <PersonSearchRoundedIcon />,
                     label: labelOf(RESULT_BUYER_OPTIONS, item.resultBuyer),
                     color: theme.text,
                      iconColor: showingAccent,
                      bg: neutralResultBg,
                      border: showingBorder,
                  },
               ].map((x) => (
                  <Tooltip key={x.key} title={x.clickable ? 'Створити ПЗС із показу' : x.label}>
                      <Stack
                         component={x.clickable ? 'button' : 'div'}
                         type={x.clickable ? 'button' : undefined}
                         onClick={x.clickable ? () => onOpenPreDeposit?.(item, linkedPzs) : undefined}
                         spacing={0.25}
                         alignItems="center"
                         justifyContent="center"
                         sx={{
                            appearance: 'none',
                            font: 'inherit',
                            minWidth: 0,
                            minHeight: 54,
                            px: 0.45,
                            py: 0.28,
                            borderRadius: 1.45,
                            border: `1px solid ${x.border}`,
                            bgcolor: x.bg,
                            cursor: x.clickable ? 'pointer' : 'default',
                            '&:hover': x.clickable ? { filter: 'brightness(1.08)', transform: 'translateY(-1px)' } : undefined,
                         }}
                      >
                        <Box sx={{ color: x.iconColor, display: 'flex', lineHeight: 0 }}>
                           {x.icon}
                        </Box>
                        <Typography
                           sx={{
                              color: x.color,
                              fontSize: 10,
                              fontWeight: 900,
                              lineHeight: 1.08,
                              textAlign: 'center',
                              width: '100%',
                           }}
                           noWrap
                        >
                           {x.label}
                        </Typography>
                     </Stack>
                  </Tooltip>
               ))}
            </Box>

            <Stack spacing={0.25} alignItems={{ xs: 'flex-start', lg: 'flex-end' }}>
               <Typography
                  sx={{
                     color: theme.textSoft,
                     fontSize: 10.5,
                     fontWeight: 850,
                     lineHeight: 1.1,
                     maxWidth: 132,
                  }}
                  noWrap
               >
                  {employeeName(item.responsibleEmployee) || '—'}
               </Typography>

                <Stack direction="row" spacing={0.2} justifyContent={{ xs: 'flex-start', lg: 'flex-end' }}>
                  {canManage && (
                     <>
                        <Tooltip title="Редагувати">
                           <IconButton
                              size="small"
                              onClick={() => onEdit?.(item)}
                              sx={{ color: theme.text, border: `1px solid ${theme.border}`, borderRadius: 1.35, width: 28, height: 28 }}
                           >
                              <EditRoundedIcon fontSize="small" />
                           </IconButton>
                        </Tooltip>
                        <Tooltip title="Видалити">
                           <IconButton
                              size="small"
                              onClick={() => onDelete?.(item)}
                              sx={{ color: '#f87171', border: `1px solid ${theme.border}`, borderRadius: 1.35, width: 28, height: 28 }}
                           >
                              <DeleteOutlineRoundedIcon fontSize="small" />
                           </IconButton>
                        </Tooltip>
                     </>
                  )}
                  <Tooltip title={expanded ? 'Згорнути' : 'Деталі'}>
                     <IconButton
                        size="small"
                        onClick={() => setExpanded((value) => !value)}
                        sx={{
                           color: theme.text,
                           border: `1px solid ${theme.border}`,
                           borderRadius: 1.35,
                           width: 28,
                           height: 28,
                           transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
                           transition: 'transform 0.18s ease',
                        }}
                     >
                        <KeyboardArrowDownRoundedIcon fontSize="small" />
                     </IconButton>
                  </Tooltip>
               </Stack>
            </Stack>
         </Box>

         <Collapse in={expanded} timeout="auto" unmountOnExit>
            <Box
               sx={{
                  mt: 0.75,
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', md: '0.95fr 1fr 1.2fr' },
                  gap: 0.75,
               }}
            >
               <Stack spacing={0.55} sx={{ p: 1, borderRadius: 1.8, border: `1px solid ${theme.border}`, bgcolor: cellBg, minWidth: 0 }}>
                  <Typography sx={{ color: theme.textSoft, fontSize: 11, fontWeight: 900, textTransform: 'uppercase' }}>
                     Деталі показу
                  </Typography>
                  <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
                      <Chip size="small" label={`ініціативність: ${showingKindLabel}`} sx={{ height: 23, color: theme.text, bgcolor: 'rgba(255,255,255,0.06)' }} />
                     <Chip size="small" label={`присутність: ${presenceLabel}`} sx={{ height: 23, color: theme.text, bgcolor: 'rgba(255,255,255,0.06)' }} />
                  </Stack>
                  <Typography sx={{ color: theme.textSoft, fontSize: 12 }}>
                     показав: <Box component="span" sx={{ color: theme.text }}>{shownByLabel}</Box>
                  </Typography>
                  <Typography sx={{ color: theme.textSoft, fontSize: 12 }}>
                     сприяв: <Box component="span" sx={{ color: theme.text }}>{facilitatedByLabel}</Box>
                  </Typography>
               </Stack>

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

function FinanceEventRowCompact({ item, theme, mode, onExecute, onEdit, onDelete, canManage }) {
   const [expanded, setExpanded] = useState(false);
   const financeType = FINANCE_EVENT_TYPES[item.financeType] || FINANCE_EVENT_TYPES.deposit;
   const EventIcon = financeType.icon;
   const photo = getPropertyImage(item.property);
   const dateParts = formatDateParts(item.occurredAt);
   const deadlineParts = formatDateParts(item.deadlineAt);
   const isReregistration = item.financeType === 'reregistration';
   const relationDateSource = isReregistration
      ? item.linkedDepositOccurredAt || item.deposit?.occurredAt
      : item.linkedReregistrationOccurredAt || item.reregistrationEvent?.occurredAt || item.scheduledReregistrationAt;
   const relationDateParts = formatDateParts(relationDateSource);
   const relationDateLabel = isReregistration && relationDateParts.date !== '—'
      ? `від ${relationDateParts.date}`
      : relationDateParts.date;
   const familyColor = isReregistration ? '#a855f7' : '#22c55e';
   const familySoftColor = isReregistration ? 'rgba(168,85,247,0.105)' : 'rgba(34,197,94,0.095)';
   const statusColor = FINANCE_STATUS_COLORS[item.status] || FINANCE_STATUS_COLORS.waiting;
   const statusLabel = FINANCE_STATUS_LABELS[item.status] || item.status || 'Чекає';
   const isCompletedWorseDeposit = !isReregistration && item.status === 'completed_worse';
   const isCompletedImprovedDeposit = !isReregistration && item.status === 'completed_improved';
   const panelBg = mode === 'light'
      ? isReregistration ? 'rgba(250,245,255,0.95)' : 'rgba(240,253,244,0.95)'
      : isReregistration ? 'rgba(88,28,135,0.145)' : isCompletedWorseDeposit ? 'rgba(20,83,45,0.18)' : isCompletedImprovedDeposit ? 'rgba(63,98,18,0.15)' : 'rgba(20,83,45,0.135)';
   const cellBg = mode === 'light'
      ? isReregistration ? 'rgba(168,85,247,0.075)' : 'rgba(34,197,94,0.075)'
      : isCompletedWorseDeposit ? 'rgba(22,101,52,0.115)' : isCompletedImprovedDeposit ? 'rgba(132,204,22,0.105)' : familySoftColor;
   const isWaiting = item.status === 'waiting';
   const sourcePreDeposit = item.sourcePreDepositEvent || item.deposit?.sourcePreDepositEvent || {};
   const objectRealtorKind = item.objectRealtorKind || sourcePreDeposit?.objectRealtorKind || item.deposit?.objectRealtorKind || 'employee';
   const objectPartnerName = item.objectPartnerName || sourcePreDeposit?.objectPartnerName || item.deposit?.objectPartnerName || '';
   const objectRealtorLabel =
      objectRealtorKind === 'partner'
         ? objectPartnerName || 'СП'
         : employeeName(item.objectRealtorEmployee || sourcePreDeposit?.objectRealtorEmployee || item.deposit?.objectRealtorEmployee) || '—';
   const buyerRealtorKind = item.buyerRealtorKind || sourcePreDeposit?.buyerRealtorKind || item.deposit?.buyerRealtorKind || 'employee';
   const buyerPartnerName = item.buyerPartnerName || sourcePreDeposit?.buyerPartnerName || item.deposit?.buyerPartnerName || '';
   const buyerRealtorLabel =
      buyerRealtorKind === 'partner'
         ? buyerPartnerName || 'СП'
         : employeeName(item.buyerRealtorEmployee || sourcePreDeposit?.buyerRealtorEmployee || item.deposit?.buyerRealtorEmployee) || '—';
   const financialProduct = demoFinancialProductForItem(item);

   const statusBorder =
      isReregistration
          ? 'rgba(168,85,247,0.52)'
          : item.status === 'failed'
          ? 'rgba(239,68,68,0.46)'
          : item.status === 'completed_worse'
             ? 'rgba(22,101,52,0.68)'
             : item.status === 'completed_improved'
                ? 'rgba(132,204,22,0.58)'
          : item.status?.startsWith?.('completed')
                 ? 'rgba(22,163,74,0.52)'
                 : 'rgba(134,239,172,0.46)';

   const statusShadow =
      isReregistration
         ? '0 14px 30px rgba(168,85,247,0.12)'
         : item.status === 'failed'
          ? '0 14px 30px rgba(239,68,68,0.10)'
          : item.status === 'completed_worse'
             ? '0 14px 30px rgba(22,101,52,0.16)'
             : item.status === 'completed_improved'
                ? '0 14px 30px rgba(132,204,22,0.14)'
             : item.status?.startsWith?.('completed')
                ? '0 14px 30px rgba(22,163,74,0.12)'
                : '0 14px 30px rgba(134,239,172,0.12)';

   const conditionBlock = (title, values) => (
      <Stack spacing={0.45} sx={{ p: 1, borderRadius: 1.8, border: `1px solid ${theme.border}`, bgcolor: cellBg, minWidth: 0 }}>
         <Typography sx={{ color: theme.textSoft, fontSize: 11, fontWeight: 900, textTransform: 'uppercase' }}>
            {title}
         </Typography>
         <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
            {(values?.length ? values : ['не вказано']).slice(0, 5).map((text) => (
               <Chip key={text} size="small" label={text} sx={{ height: 23, color: theme.text, bgcolor: 'rgba(34,197,94,0.12)' }} />
            ))}
         </Stack>
      </Stack>
   );

   return (
      <Box
         sx={{
            p: 0.42,
            borderRadius: 2.2,
            border: `1px solid ${statusBorder}`,
            bgcolor: panelBg,
            boxShadow: `${statusShadow}, inset 0 0 0 1px ${isReregistration ? 'rgba(168,85,247,0.05)' : isCompletedWorseDeposit ? 'rgba(22,101,52,0.08)' : isCompletedImprovedDeposit ? 'rgba(132,204,22,0.07)' : 'rgba(34,197,94,0.05)'}`,
         }}
      >
         <Box
            sx={{
               display: 'grid',
               gridTemplateColumns: {
                  xs: '1fr',
                  lg: '86px minmax(210px,1.2fr) minmax(190px,0.9fr) minmax(250px,1.05fr) 132px',
               },
               gap: 0.45,
               alignItems: 'center',
            }}
         >
            <Stack
               spacing={0.25}
               sx={{
                  minHeight: 54,
                  borderRadius: 1.6,
                  border: `1px solid ${statusBorder}`,
                    bgcolor: mode === 'light'
                      ? isReregistration ? 'rgba(168,85,247,0.08)' : isCompletedWorseDeposit ? 'rgba(22,101,52,0.13)' : isCompletedImprovedDeposit ? 'rgba(132,204,22,0.13)' : 'rgba(34,197,94,0.08)'
                      : isReregistration ? 'rgba(168,85,247,0.10)' : isCompletedWorseDeposit ? 'rgba(22,101,52,0.17)' : isCompletedImprovedDeposit ? 'rgba(132,204,22,0.13)' : 'rgba(34,197,94,0.09)',
                  px: 0.8,
                  py: 0.3,
                  justifyContent: 'center',
                  alignItems: 'center',
               }}
            >
               <Stack direction="row" spacing={0.45} alignItems="center" justifyContent="center" sx={{ width: '100%' }}>
                  <EventIcon sx={{ color: isReregistration ? familyColor : statusColor, fontSize: 16 }} />
                  <Typography sx={{ color: theme.text, fontWeight: 950, fontSize: 11 }} noWrap>
                     {financeType.label}
                  </Typography>
               </Stack>
               <Typography sx={{ color: theme.text, fontWeight: 950, fontSize: 14, lineHeight: 1.05, textAlign: 'center', width: '100%' }}>
                  {dateParts.date}
               </Typography>
                <Stack direction="row" spacing={0.35} alignItems="center" justifyContent="center" sx={{ width: '100%' }}>
                   <Typography sx={{ color: theme.textSoft, fontSize: 10.5, fontWeight: 800, lineHeight: 1.05, textAlign: 'center' }}>
                      {dateParts.time}
                   </Typography>
                   <FinancialProductMark product={financialProduct} size={14} showCode={false} />
                </Stack>
            </Stack>

            <Stack
               direction="row"
               spacing={0.55}
               sx={{
                  minWidth: 0,
                  minHeight: 54,
                  p: 0.4,
                  borderRadius: 1.6,
                  bgcolor: mode === 'light'
                     ? isReregistration ? 'rgba(168,85,247,0.052)' : 'rgba(34,197,94,0.052)'
                     : isReregistration ? 'rgba(168,85,247,0.08)' : 'rgba(34,197,94,0.07)',
                  border: `1px solid ${isReregistration ? familyColor : statusColor}44`,
                  alignItems: 'flex-start',
               }}
            >
               <Box
                  sx={{
                     width: 42,
                     height: 42,
                     minWidth: 42,
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
               <Stack spacing={0.14} sx={{ minWidth: 0, justifyContent: 'flex-start', pt: 0 }}>
                  <Tooltip title={propertyTitle(item.property)}>
                     <Typography sx={{ color: theme.text, fontWeight: 950, fontSize: 12.5, lineHeight: 1.14 }} noWrap>
                        {propertyTitle(item.property)}
                     </Typography>
                  </Tooltip>
                  <Typography sx={{ color: theme.textSoft, fontSize: 11, fontWeight: 750, lineHeight: 1.16 }} noWrap>
                     {propertyMeta(item.property) || 'характеристики не внесені'}
                  </Typography>
                  <Typography sx={{ color: theme.textSoft, fontSize: 10.5, fontWeight: 800, lineHeight: 1.14 }} noWrap>
                     рієлтор: <Box component="span" sx={{ color: theme.text }}>{objectRealtorLabel}</Box>
                  </Typography>
               </Stack>
            </Stack>

            <Stack
               direction="row"
               spacing={0.55}
               sx={{
                  minWidth: 0,
                  minHeight: 54,
                  p: 0.4,
                  borderRadius: 1.6,
                  border: `1px solid ${theme.border}`,
                  bgcolor: cellBg,
                  alignItems: 'flex-start',
               }}
            >
               <Box
                  sx={{
                     width: 36,
                     height: 36,
                     minWidth: 36,
                     borderRadius: '50%',
                     display: 'flex',
                     alignItems: 'center',
                     justifyContent: 'center',
                     bgcolor: isReregistration ? 'rgba(168,85,247,0.14)' : 'rgba(34,197,94,0.13)',
                     border: `1px solid ${theme.border}`,
                     fontSize: 20,
                     lineHeight: 1,
                  }}
               >
                  🤝
               </Box>
               <Stack spacing={0.14} sx={{ minWidth: 0, alignSelf: 'stretch', justifyContent: 'flex-start', pt: 0 }}>
                  <Typography sx={{ color: theme.text, fontWeight: 950, fontSize: 12.5, lineHeight: 1.14 }} noWrap>
                     {item.lead?.name || 'Без клієнта'}
                  </Typography>
                  <Typography sx={{ color: theme.textSoft, fontSize: 11, fontWeight: 750, lineHeight: 1.16 }} noWrap>
                     {item.lead?.phones?.[0] || item.lead?.requestSummary || '—'}
                  </Typography>
                  <Typography sx={{ color: theme.textSoft, fontSize: 10.5, fontWeight: 800, lineHeight: 1.14 }} noWrap>
                     рієлтор: <Box component="span" sx={{ color: theme.text }}>{buyerRealtorLabel}</Box>
                  </Typography>
               </Stack>
            </Stack>

            <Box
               sx={{
                  minWidth: 0,
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
                  gap: 0.45,
                  alignSelf: 'stretch',
               }}
            >
               <Stack spacing={0.14} justifyContent="center" sx={{ minHeight: 54, px: 0.55, py: 0.28, borderRadius: 1.45, border: `1px solid ${theme.border}`, bgcolor: cellBg, minWidth: 0 }}>
                  <Tooltip title={isReregistration ? 'Хто провів ПЕРС' : 'Хто оформив завдаток'}>
                     <Typography sx={{ color: theme.text, fontSize: 10.5, fontWeight: 950, lineHeight: 1.1 }} noWrap>
                        {employeeName(item.processedByEmployee) || '—'}
                     </Typography>
                  </Tooltip>
                  <Stack direction="row" spacing={0.35} alignItems="center" sx={{ minWidth: 0 }}>
                     <Box component="span" sx={{ fontSize: 15, lineHeight: 1, flexShrink: 0 }}>
                        {TENSION_EMOJIS[item.tensionLevel] || '🙂'}
                     </Box>
                     <Typography sx={{ color: theme.textSoft, fontSize: 10, fontWeight: 850, lineHeight: 1.1 }} noWrap>
                        {TENSION_LABELS[item.tensionLevel] || 'напруженість не вказана'}
                     </Typography>
                  </Stack>
                  <Typography sx={{ color: theme.textSoft, fontSize: 10, fontWeight: 750, lineHeight: 1.1 }} noWrap>
                     {item.location || 'місце не вказано'}
                  </Typography>
               </Stack>

               <Stack spacing={0.18} justifyContent="center" sx={{ minHeight: 54, px: 0.55, py: 0.28, borderRadius: 1.45, border: `1px solid ${theme.border}`, bgcolor: cellBg, minWidth: 0 }}>
                  {isReregistration ? (
                     <>
                        <Typography sx={{ color: familyColor, fontSize: 10.5, fontWeight: 950, lineHeight: 1.1 }} noWrap>
                           {REREGISTRATION_PLACE_LABELS[item.reregistrationPlaceType] || REREGISTRATION_PLACE_LABELS.other}
                        </Typography>
                        <Stack direction="row" spacing={0.35} alignItems="center" sx={{ minWidth: 0 }}>
                           <GavelRoundedIcon sx={{ color: familyColor, fontSize: 14, minWidth: 14 }} />
                           <Typography sx={{ color: theme.textSoft, fontSize: 10, fontWeight: 750, lineHeight: 1.1 }} noWrap>
                              {item.reregistrationPlaceName || item.location || 'місце не вказано'}
                           </Typography>
                        </Stack>
                     </>
                  ) : (
                     <>
                        <Typography sx={{ color: statusColor, fontSize: 10.5, fontWeight: 950, lineHeight: 1.1 }} noWrap>
                           дедлайн: {deadlineParts.date}
                        </Typography>
                        <Stack direction="row" spacing={0.35} alignItems="center" sx={{ minWidth: 0 }}>
                           <GavelRoundedIcon sx={{ color: theme.textSoft, fontSize: 14, minWidth: 14 }} />
                           <Typography sx={{ color: theme.textSoft, fontSize: 10, fontWeight: 750, lineHeight: 1.1 }} noWrap>
                              {item.notary || '—'}
                           </Typography>
                        </Stack>
                     </>
                  )}
               </Stack>

               <Stack spacing={0.32} alignItems="center" justifyContent="center" sx={{ minHeight: 54, px: 0.55, py: 0.28, borderRadius: 1.45, border: `1px solid ${statusBorder}`, bgcolor: `${statusColor}22`, minWidth: 0 }}>
                  {isWaiting && !isReregistration ? (
                     <Button
                        size="small"
                        startIcon={<CheckCircleRoundedIcon sx={{ fontSize: '14px !important' }} />}
                        onClick={() => onExecute?.(item)}
                        sx={{
                           minWidth: 0,
                           px: 0.7,
                           py: 0.12,
                           borderRadius: 1.2,
                           color: mode === 'light' ? '#064e3b' : '#dcfce7',
                           bgcolor: 'rgba(34,197,94,0.16)',
                           border: `1px solid ${statusColor}66`,
                           fontSize: 9.5,
                           fontWeight: 950,
                           lineHeight: 1.1,
                           '& .MuiButton-startIcon': { mr: 0.35 },
                           '&:hover': { bgcolor: 'rgba(34,197,94,0.24)' },
                        }}
                     >
                        Виконати
                     </Button>
                  ) : (
                     <Typography
                        sx={{
                           color: theme.text,
                           fontSize: 10.2,
                           fontWeight: 950,
                           lineHeight: 1.04,
                           textAlign: 'center',
                           maxWidth: '100%',
                           overflowWrap: 'anywhere',
                        }}
                     >
                        {statusLabel}
                     </Typography>
                  )}
                  {isWaiting && <AccessTimeRoundedIcon sx={{ color: statusColor, fontSize: 17, filter: `drop-shadow(0 0 8px ${statusColor}66)` }} />}
                  <Typography sx={{ color: isWaiting ? statusColor : theme.textSoft, fontSize: 10, fontWeight: 850, lineHeight: 1.08 }} noWrap>
                     {relationDateLabel}
                  </Typography>
               </Stack>
            </Box>

            <Stack spacing={0.25} alignItems={{ xs: 'flex-start', lg: 'flex-end' }}>
               <Typography
                  sx={{
                     color: theme.textSoft,
                     fontSize: 10.5,
                     fontWeight: 850,
                     lineHeight: 1.1,
                     maxWidth: 132,
                  }}
                  noWrap
               >
                  {employeeName(item.responsibleEmployee) || '—'}
               </Typography>
               <Stack direction="row" spacing={0.2} justifyContent={{ xs: 'flex-start', lg: 'flex-end' }}>
                  <Tooltip title={expanded ? 'Згорнути' : 'Деталі'}>
                     <IconButton
                        size="small"
                        onClick={() => setExpanded((value) => !value)}
                        sx={{
                           color: theme.text,
                           border: `1px solid ${theme.border}`,
                           borderRadius: 1.35,
                           width: 28,
                           height: 28,
                           transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
                           transition: 'transform 0.18s ease',
                        }}
                     >
                        <KeyboardArrowDownRoundedIcon fontSize="small" />
                     </IconButton>
                  </Tooltip>
               </Stack>
            </Stack>
         </Box>

         <Collapse in={expanded} timeout="auto" unmountOnExit>
            <Box
               sx={{
                  mt: 0.75,
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr' },
                  gap: 0.75,
               }}
            >
               {conditionBlock('Умови продавця', item.sellerConditions)}
               {conditionBlock('Умови покупця', item.buyerConditions)}
               {conditionBlock('Умови агентства', item.agencyConditions)}
               <Stack spacing={0.45} sx={{ p: 1, borderRadius: 1.8, border: `1px solid ${theme.border}`, bgcolor: cellBg, minWidth: 0, gridColumn: { md: '1 / -1' } }}>
                  <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1}>
                     <Typography sx={{ color: theme.textSoft, fontSize: 11, fontWeight: 900, textTransform: 'uppercase' }}>
                        Нотатки
                     </Typography>
                     {canManage && (
                        <Stack direction="row" spacing={0.35} sx={{ flexShrink: 0 }}>
                           <Tooltip title="Редагувати">
                              <IconButton
                                 size="small"
                                 onClick={() => onEdit?.(item)}
                                 sx={{
                                    width: 25,
                                    height: 25,
                                    color: theme.textSoft,
                                    border: `1px solid ${theme.border}`,
                                    borderRadius: 1.2,
                                    bgcolor: `${theme.cardAlt}cc`,
                                    '&:hover': { color: theme.accent, borderColor: `${theme.accent}77`, bgcolor: `${theme.accent}16` },
                                 }}
                              >
                                 <EditRoundedIcon sx={{ fontSize: 15 }} />
                              </IconButton>
                           </Tooltip>
                           <Tooltip title="Видалити">
                              <IconButton
                                 size="small"
                                 onClick={() => onDelete?.(item)}
                                 sx={{
                                    width: 25,
                                    height: 25,
                                    color: '#f87171',
                                    border: `1px solid ${theme.border}`,
                                    borderRadius: 1.2,
                                    bgcolor: `${theme.cardAlt}cc`,
                                    '&:hover': { borderColor: '#f87171aa', bgcolor: '#f8717118' },
                                 }}
                              >
                                 <DeleteOutlineRoundedIcon sx={{ fontSize: 15 }} />
                              </IconButton>
                           </Tooltip>
                        </Stack>
                     )}
                  </Stack>
                  <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
                     {(item.notes?.length ? item.notes : [{ color: theme.accent, text: 'нотаток поки немає' }]).map((note) => (
                        <Chip
                           key={`${note.color}-${note.text}`}
                           size="small"
                           label={note.text}
                           sx={{
                              height: 24,
                              color: theme.text,
                              bgcolor: `${note.color || theme.accent}22`,
                              border: `1px solid ${note.color || theme.accent}66`,
                           }}
                        />
                     ))}
                  </Stack>
               </Stack>
            </Box>
         </Collapse>
      </Box>
   );
}

function ReviewEventRowCompact({ item, theme, mode, canManage = false, onEdit, onDelete }) {
   const [expanded, setExpanded] = useState(false);
   const review = item.review || item.inspection || {};
   const dateParts = formatDateParts(item.occurredAt);
   const photo = getPropertyImage(item.property);
   const resultColor = reviewResultColor(review.result);
   const panelBg = mode === 'light' ? 'rgba(240,249,255,0.95)' : 'rgba(14,165,233,0.125)';
   const cellBg = mode === 'light' ? 'rgba(14,165,233,0.090)' : 'rgba(14,165,233,0.135)';
   const reviewAccent = '#38bdf8';
   const reviewBorder = 'rgba(14,165,233,0.48)';
   const borderColor = review.result === 'not_taken' ? 'rgba(239,68,68,0.42)' : reviewBorder;
   const financialProduct = demoFinancialProductForItem(item);
   const objectRealtor =
      item.objectRealtorKind === 'partner'
         ? item.objectPartnerName || 'СП'
         : employeeName(item.objectRealtorEmployee || item.responsibleEmployee) || '—';

   return (
      <Box
         sx={{
            p: 0.42,
            borderRadius: 2.2,
            border: `1px solid ${borderColor}`,
            bgcolor: panelBg,
            boxShadow: mode === 'light' ? '0 14px 30px rgba(14,165,233,0.14)' : '0 16px 34px rgba(14,165,233,0.20)',
         }}
      >
         <Box
            sx={{
               display: 'grid',
               gridTemplateColumns: {
                  xs: '1fr',
                  lg: '86px minmax(210px,1.2fr) minmax(190px,0.9fr) minmax(250px,1.05fr) 132px',
               },
               gap: 0.45,
               alignItems: 'center',
            }}
         >
            <Stack
               spacing={0.25}
               sx={{
                  minHeight: 54,
                  borderRadius: 1.6,
                  border: `1px solid rgba(14,165,233,0.42)`,
                  bgcolor: mode === 'light' ? 'rgba(14,165,233,0.095)' : 'rgba(14,165,233,0.13)',
                  px: 0.8,
                  py: 0.3,
                  justifyContent: 'center',
                  alignItems: 'center',
               }}
            >
               <Stack direction="row" spacing={0.45} alignItems="center" justifyContent="center" sx={{ width: '100%' }}>
                  <ExploreRoundedIcon sx={{ color: reviewAccent, fontSize: 16 }} />
                  <Typography sx={{ color: theme.text, fontWeight: 950, fontSize: 11 }} noWrap>
                     Огляд
                  </Typography>
               </Stack>
               <Typography sx={{ color: theme.text, fontWeight: 950, fontSize: 14, lineHeight: 1.05, textAlign: 'center', width: '100%' }}>
                  {dateParts.date}
               </Typography>
               <Stack direction="row" spacing={0.35} alignItems="center" justifyContent="center" sx={{ width: '100%' }}>
                  <Typography sx={{ color: theme.textSoft, fontSize: 10.5, fontWeight: 800, lineHeight: 1.05, textAlign: 'center' }}>
                     {dateParts.time}
                  </Typography>
                  <FinancialProductMark product={financialProduct} size={14} showCode={false} />
               </Stack>
            </Stack>

            <Stack direction="row" spacing={0.55} sx={{ minWidth: 0, minHeight: 54, p: 0.4, borderRadius: 1.6, bgcolor: cellBg, border: '1px solid rgba(14,165,233,0.34)', alignItems: 'flex-start' }}>
               <Box sx={{ width: 42, height: 42, minWidth: 42, borderRadius: 1.3, overflow: 'hidden', bgcolor: 'rgba(255,255,255,0.06)', border: `1px solid ${theme.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {photo ? (
                     <Box component="img" src={photo} alt="" sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                     <ApartmentRoundedIcon sx={{ color: reviewAccent, fontSize: 22 }} />
                  )}
               </Box>
               <Stack spacing={0.14} sx={{ minWidth: 0, justifyContent: 'flex-start', pt: 0 }}>
                  <Tooltip title={propertyTitle(item.property)}>
                     <Typography sx={{ color: theme.text, fontWeight: 950, fontSize: 12.5, lineHeight: 1.14 }} noWrap>
                        {propertyTitle(item.property)}
                     </Typography>
                  </Tooltip>
                  <Typography sx={{ color: theme.textSoft, fontSize: 11, fontWeight: 750, lineHeight: 1.16 }} noWrap>
                     {propertyMeta(item.property) || 'характеристики не внесені'}
                  </Typography>
                  <Typography sx={{ color: theme.textSoft, fontSize: 10.5, fontWeight: 800, lineHeight: 1.14 }} noWrap>
                     рієлтор: <Box component="span" sx={{ color: theme.text }}>{objectRealtor}</Box>
                  </Typography>
               </Stack>
            </Stack>

            <Stack
               sx={{
                  minWidth: 0,
                  minHeight: 54,
                  p: 0.4,
                  borderRadius: 1.6,
                  border: `1px solid ${theme.border}`,
                  bgcolor: mode === 'light' ? 'rgba(14,165,233,0.030)' : 'rgba(255,255,255,0.025)',
               }}
            />

            <Box
               sx={{
                  minWidth: 0,
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
                  gap: 0.45,
                  alignSelf: 'stretch',
               }}
            >
               <Stack spacing={0.18} sx={{ minWidth: 0, minHeight: 54, p: 0.5, borderRadius: 1.45, border: `1px solid ${resultColor}55`, bgcolor: `${resultColor}13`, justifyContent: 'center', alignItems: 'center' }}>
                  <Box sx={{ color: resultColor, display: 'flex', lineHeight: 0 }}>
                     {review.result === 'new_object' ? (
                        <CheckCircleRoundedIcon sx={{ color: resultColor, fontSize: 17 }} />
                     ) : review.result === 'historical' ? (
                        <AccessTimeRoundedIcon sx={{ color: resultColor, fontSize: 17 }} />
                     ) : (
                        <CloseRoundedIcon sx={{ color: resultColor, fontSize: 17 }} />
                     )}
                  </Box>
                  <Typography sx={{ color: theme.text, fontSize: 10.4, fontWeight: 950, lineHeight: 1.08, textAlign: 'center', overflowWrap: 'anywhere' }}>
                     {reviewResultLabel(review.result)}
                  </Typography>
               </Stack>

               <Stack spacing={0.18} sx={{ minWidth: 0, minHeight: 54, p: 0.5, borderRadius: 1.45, border: '1px solid rgba(14,165,233,0.36)', bgcolor: cellBg, justifyContent: 'center' }}>
                  <Typography sx={{ color: theme.text, fontSize: 10.2, fontWeight: 900, lineHeight: 1.1, textAlign: 'center', overflowWrap: 'anywhere', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                     {review.result === 'not_taken' ? review.reason || 'причину не внесено' : review.note || review.linkedPropertyStatus || reviewObjectResultLabel(review.objectResult)}
                  </Typography>
               </Stack>

               <Stack
                  sx={{
                     minWidth: 0,
                     minHeight: 54,
                     p: 0.5,
                     borderRadius: 1.45,
                     border: `1px solid ${theme.border}`,
                     bgcolor: mode === 'light' ? 'rgba(14,165,233,0.030)' : 'rgba(255,255,255,0.025)',
                  }}
               />
            </Box>

            <Stack spacing={0.25} alignItems={{ xs: 'flex-start', lg: 'flex-end' }}>
               <Typography sx={{ color: theme.textSoft, fontSize: 10.5, fontWeight: 850, lineHeight: 1.1, maxWidth: 132 }} noWrap>
                  {employeeName(item.responsibleEmployee) || '—'}
               </Typography>
               <Stack direction="row" spacing={0.25} alignItems="center">
                  {canManage && (
                     <>
                        <Tooltip title="Редагувати огляд">
                           <IconButton size="small" onClick={() => onEdit?.(item)} sx={{ color: reviewAccent, border: '1px solid rgba(14,165,233,0.42)', borderRadius: 1.35, width: 28, height: 28, bgcolor: 'rgba(14,165,233,0.10)' }}>
                              <EditRoundedIcon fontSize="small" />
                           </IconButton>
                        </Tooltip>
                        <Tooltip title="Видалити огляд">
                           <IconButton size="small" onClick={() => onDelete?.(item)} sx={{ color: '#f87171', border: '1px solid rgba(248,113,113,0.38)', borderRadius: 1.35, width: 28, height: 28, bgcolor: 'rgba(248,113,113,0.08)' }}>
                              <DeleteOutlineRoundedIcon fontSize="small" />
                           </IconButton>
                        </Tooltip>
                     </>
                  )}
                  <Tooltip title={expanded ? 'Згорнути' : 'Деталі огляду'}>
                     <IconButton
                        size="small"
                        onClick={() => setExpanded((value) => !value)}
                        sx={{
                           color: theme.text,
                           border: `1px solid ${theme.border}`,
                           borderRadius: 1.35,
                           width: 28,
                           height: 28,
                           transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
                           transition: 'transform 0.18s ease',
                        }}
                     >
                        <KeyboardArrowDownRoundedIcon fontSize="small" />
                     </IconButton>
                  </Tooltip>
               </Stack>
            </Stack>
         </Box>

         <Collapse in={expanded} timeout="auto" unmountOnExit>
            <Stack spacing={0.6} sx={{ mt: 0.75, p: 1, borderRadius: 1.8, border: `1px solid rgba(14,165,233,0.30)`, bgcolor: cellBg }}>
               <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
                  {review.source === 'properties' && (
                     <Chip size="small" label="джерело: Об’єкти" sx={{ height: 23, color: reviewAccent, bgcolor: 'rgba(14,165,233,0.16)', border: '1px solid rgba(14,165,233,0.38)', fontWeight: 900 }} />
                  )}
                  {review.linkedPropertyStatus && (
                     <Chip size="small" label={review.linkedPropertyStatus} sx={{ height: 23, color: theme.text, bgcolor: 'rgba(255,255,255,0.06)', border: `1px solid ${theme.border}`, fontWeight: 850 }} />
                  )}
               </Stack>
               <Typography sx={{ color: theme.text, fontSize: 12.2, fontWeight: 850, lineHeight: 1.32 }}>
                  {review.note || review.reason || 'Деталі огляду поки не внесені.'}
               </Typography>
            </Stack>
         </Collapse>
      </Box>
   );
}

function TimelineColumnHeader({
   theme,
   mode,
   fieldSx,
   menuProps,
   employees,
   properties,
   leads,
   selectedEmployeeFilter,
   selectedPropertyFilter,
   selectedLeadFilter,
   typeFilter,
   resultFilter,
   resultObjectFilter,
   resultBuyerFilter,
   setEmployeeFilter,
   setPropertyFilter,
   setLeadFilter,
   setTypeFilter,
   setResultFilter,
   setResultObjectFilter,
   setResultBuyerFilter,
   setPropertySearch,
   setLeadSearch,
   rememberPropertyOption,
   rememberLeadOption,
   renderPropertyOption,
   renderLeadOption,
   propertiesLoading,
   leadsLoading,
}) {
   const headerFieldSx = {
      ...fieldSx,
      '& .MuiOutlinedInput-root': {
         ...(fieldSx?.['& .MuiOutlinedInput-root'] || {}),
         minHeight: 30,
         borderRadius: 1.4,
         bgcolor: mode === 'light' ? 'rgba(255,255,255,0.72)' : 'rgba(255,255,255,0.035)',
      },
      '& .MuiInputBase-input': {
         ...(fieldSx?.['& .MuiInputBase-input'] || {}),
         py: '4px',
         fontSize: 11,
         fontWeight: 900,
      },
      '& .MuiInputLabel-root': {
         ...(fieldSx?.['& .MuiInputLabel-root'] || {}),
         fontSize: 10,
         fontWeight: 900,
      },
      '& .MuiSelect-select': {
         py: '4px',
         fontSize: 11,
         fontWeight: 900,
      },
   };

   return (
      <Box
         sx={{
            display: { xs: 'none', lg: 'grid' },
            gridTemplateColumns: '86px minmax(210px,1.2fr) minmax(190px,0.9fr) minmax(250px,1.05fr) 132px',
            gap: 0.45,
            alignItems: 'center',
            px: 0.42,
            py: 0.35,
            borderRadius: 1.8,
            border: `1px solid ${theme.border}`,
            bgcolor: mode === 'light' ? 'rgba(255,255,255,0.58)' : 'rgba(255,255,255,0.024)',
         }}
      >
          <TextField
            select
            size="small"
            label="Подія"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            SelectProps={{ MenuProps: menuProps }}
            sx={headerFieldSx}
         >
            <MenuItem value="">Всі</MenuItem>
            {EVENT_TYPES.map((x) => (
               <MenuItem key={x.value} value={x.value}>{x.label}</MenuItem>
            ))}
            <MenuItem value="finance_deposit">ЗС</MenuItem>
            <MenuItem value="finance_reregistration">ПЕРС</MenuItem>
         </TextField>
         <Autocomplete
            size="small"
            options={properties}
            value={selectedPropertyFilter}
            onChange={(_, value) => {
               rememberPropertyOption(value);
               setPropertyFilter(value?._id || '');
            }}
            onInputChange={(_, value, reason) => {
               if (reason === 'input') setPropertySearch(value);
            }}
            getOptionLabel={(option) => propertyTitle(option)}
            isOptionEqualToValue={(option, value) => option?._id === value?._id}
            filterOptions={(options) => options}
            loading={propertiesLoading}
            renderOption={renderPropertyOption}
            renderInput={(params) => <TextField {...params} label="Об’єкт" sx={headerFieldSx} />}
            PaperComponent={(props) => <Box {...props} sx={{ minWidth: 520, bgcolor: theme.bgPanel, color: theme.text, border: `1px solid ${theme.border}` }} />}
            ListboxProps={{ sx: { maxHeight: 320 } }}
         />
         <Autocomplete
            size="small"
            options={leads}
            value={selectedLeadFilter}
            onChange={(_, value) => {
               rememberLeadOption(value);
               setLeadFilter(value?._id || '');
            }}
            onInputChange={(_, value, reason) => {
               if (reason === 'input') setLeadSearch(value);
            }}
            getOptionLabel={(option) => option?.name || ''}
            isOptionEqualToValue={(option, value) => option?._id === value?._id}
            filterOptions={(options) => options}
            loading={leadsLoading}
            renderOption={renderLeadOption}
            renderInput={(params) => <TextField {...params} label="Покупець" sx={headerFieldSx} />}
            PaperComponent={(props) => <Box {...props} sx={{ minWidth: 500, bgcolor: theme.bgPanel, color: theme.text, border: `1px solid ${theme.border}` }} />}
            ListboxProps={{ sx: { maxHeight: 320 } }}
         />
         <Box
            sx={{
               display: 'grid',
               gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
               gap: 0.45,
               minWidth: 0,
            }}
         >
            <TextField
               select
               size="small"
               label="Результат"
               value={resultFilter}
               onChange={(e) => setResultFilter(e.target.value)}
               SelectProps={{ MenuProps: menuProps }}
               sx={headerFieldSx}
            >
               <MenuItem value="">Всі</MenuItem>
               {RESULT_SHOWING_OPTIONS.map((x) => (
                  <MenuItem key={x.value} value={x.value}>{x.label}</MenuItem>
               ))}
            </TextField>
            <TextField
               select
               size="small"
               label="Зміна об’єкту"
               value={resultObjectFilter}
               onChange={(e) => setResultObjectFilter(e.target.value)}
               SelectProps={{ MenuProps: menuProps }}
               sx={headerFieldSx}
            >
               <MenuItem value="">Всі</MenuItem>
               {[...RESULT_OBJECT_OPTIONS, ...REVIEW_OBJECT_RESULT_OPTIONS]
                  .filter((item, index, arr) => arr.findIndex((x) => x.value === item.value) === index)
                  .map((x) => (
                     <MenuItem key={x.value} value={x.value}>{x.label}</MenuItem>
                  ))}
            </TextField>
            <TextField
               select
               size="small"
               label="Зміна покупця"
               value={resultBuyerFilter}
               onChange={(e) => setResultBuyerFilter(e.target.value)}
               SelectProps={{ MenuProps: menuProps }}
               sx={headerFieldSx}
            >
               <MenuItem value="">Всі</MenuItem>
               {RESULT_BUYER_OPTIONS.map((x) => (
                  <MenuItem key={x.value} value={x.value}>{x.label}</MenuItem>
               ))}
            </TextField>
         </Box>
         <Autocomplete
            size="small"
            options={employees}
            value={selectedEmployeeFilter}
            onChange={(_, value) => setEmployeeFilter(value?._id || '')}
            getOptionLabel={(option) => employeeName(option)}
            renderInput={(params) => <TextField {...params} label="Відповідальний" sx={headerFieldSx} />}
            PaperComponent={(props) => <Box {...props} sx={{ bgcolor: theme.bgPanel, color: theme.text, border: `1px solid ${theme.border}` }} />}
         />
      </Box>
   );
}

function PreDepositEventRowCompact({ item, theme, mode, canManage = false, onAddStep, onEdit, onDelete, onEditStep, onDeleteStep }) {
   const [expanded, setExpanded] = useState(false);
   const pzs = item.pzs || item;
   const dateParts = formatDateParts(item.occurredAt);
   const nextParts = formatDateParts(pzs.nextStepAt || pzs.closedAt);
   const photo = getPropertyImage(item.property);
   const pzsStatus = pzs.status || 'active';
   const statusColor = PZS_STATUS_COLORS[pzsStatus] || PZS_STATUS_COLORS.active;
   const statusLabel = PZS_STATUS_LABELS[pzsStatus] || pzsStatus || 'ПЗС';
   const panelBg = mode === 'light' ? 'rgba(253,242,248,0.96)' : 'rgba(157,23,77,0.145)';
   const cellBg = mode === 'light' ? 'rgba(236,72,153,0.085)' : 'rgba(236,72,153,0.125)';
   const borderColor =
      pzsStatus === 'deposit'
          ? 'rgba(34,197,94,0.50)'
          : pzsStatus === 'failed'
             ? 'rgba(239,68,68,0.46)'
             : 'rgba(236,72,153,0.56)';
   const StatusIcon = pzsStatus === 'deposit'
      ? HandshakeRoundedIcon
      : pzsStatus === 'failed'
         ? CloseRoundedIcon
         : MovingRoundedIcon;
   const TypeIcon = pzsStatus === 'deposit'
      ? HandshakeRoundedIcon
      : pzsStatus === 'failed'
         ? CloseRoundedIcon
         : MovingRoundedIcon;
   const objectRealtor =
      item.objectRealtorKind === 'partner'
         ? item.objectPartnerName || 'СП'
         : employeeName(item.objectRealtorEmployee) || '—';
   const buyerRealtor =
      item.buyerRealtorKind === 'partner'
         ? item.buyerPartnerName || 'СП'
         : employeeName(item.buyerRealtorEmployee) || '—';
   const financialProduct = demoFinancialProductForItem(item);

   const stepIcon = (type) => {
      if (type === 'deposit') return <HandshakeRoundedIcon sx={{ fontSize: 15 }} />;
      if (type === 'failed') return <CloseRoundedIcon sx={{ fontSize: 15 }} />;
      if (type === 'next_step') return <AccessTimeRoundedIcon sx={{ fontSize: 15 }} />;
      return <MovingRoundedIcon sx={{ fontSize: 15 }} />;
   };

   return (
      <Box
         sx={{
            p: 0.42,
            borderRadius: 2.2,
            border: `1px solid ${borderColor}`,
            bgcolor: panelBg,
            boxShadow: mode === 'light' ? '0 14px 30px rgba(236,72,153,0.15)' : '0 16px 34px rgba(236,72,153,0.22)',
         }}
      >
         <Box
            sx={{
               display: 'grid',
               gridTemplateColumns: {
                  xs: '1fr',
                  lg: '86px minmax(210px,1.2fr) minmax(190px,0.9fr) minmax(250px,1.05fr) 132px',
               },
               gap: 0.45,
               alignItems: 'center',
            }}
         >
            <Stack
               spacing={0.25}
               sx={{
                  minHeight: 54,
                  borderRadius: 1.6,
                  border: `1px solid ${borderColor}`,
                  bgcolor: mode === 'light' ? 'rgba(236,72,153,0.085)' : 'rgba(236,72,153,0.12)',
                  px: 0.8,
                  py: 0.3,
                  justifyContent: 'center',
                  alignItems: 'center',
               }}
            >
               <Stack direction="row" spacing={0.45} alignItems="center" justifyContent="center" sx={{ width: '100%' }}>
                  <TypeIcon sx={{ color: statusColor, fontSize: 16 }} />
                  <Typography sx={{ color: theme.text, fontWeight: 950, fontSize: 11 }} noWrap>
                     ПЗС
                  </Typography>
                </Stack>
               <Typography sx={{ color: theme.text, fontWeight: 950, fontSize: 14, lineHeight: 1.05, textAlign: 'center', width: '100%' }}>
                  {dateParts.date}
               </Typography>
               <Stack direction="row" spacing={0.35} alignItems="center" justifyContent="center" sx={{ width: '100%' }}>
                  <Typography sx={{ color: theme.textSoft, fontSize: 10.5, fontWeight: 800, lineHeight: 1.05, textAlign: 'center' }}>
                     {dateParts.time}
                  </Typography>
                  <FinancialProductMark product={financialProduct} size={14} showCode={false} />
               </Stack>
            </Stack>

            <Stack direction="row" spacing={0.55} sx={{ minWidth: 0, minHeight: 54, p: 0.4, borderRadius: 1.6, bgcolor: cellBg, border: '1px solid rgba(236,72,153,0.42)', alignItems: 'flex-start' }}>
               <Box sx={{ width: 42, height: 42, minWidth: 42, borderRadius: 1.3, overflow: 'hidden', bgcolor: 'rgba(255,255,255,0.06)', border: `1px solid ${theme.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {photo ? (
                     <Box component="img" src={photo} alt="" sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                     <ApartmentRoundedIcon sx={{ color: theme.textSoft, fontSize: 22 }} />
                  )}
               </Box>
               <Stack spacing={0.14} sx={{ minWidth: 0, justifyContent: 'flex-start', pt: 0 }}>
                  <Tooltip title={propertyTitle(item.property)}>
                     <Typography sx={{ color: theme.text, fontWeight: 950, fontSize: 12.5, lineHeight: 1.14 }} noWrap>
                        {propertyTitle(item.property)}
                     </Typography>
                  </Tooltip>
                  <Typography sx={{ color: theme.textSoft, fontSize: 11, fontWeight: 750, lineHeight: 1.16 }} noWrap>
                     {propertyMeta(item.property) || 'характеристики не внесені'}
                  </Typography>
                  <Typography sx={{ color: theme.textSoft, fontSize: 10.5, fontWeight: 800, lineHeight: 1.14 }} noWrap>
                     рієлтор: <Box component="span" sx={{ color: theme.text }}>{objectRealtor}</Box>
                  </Typography>
               </Stack>
            </Stack>

            <Stack direction="row" spacing={0.55} sx={{ minWidth: 0, minHeight: 54, p: 0.4, borderRadius: 1.6, border: `1px solid ${theme.border}`, bgcolor: cellBg, alignItems: 'flex-start' }}>
               <Box sx={{ width: 36, height: 36, minWidth: 36, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'rgba(236,72,153,0.16)', border: `1px solid rgba(236,72,153,0.35)`, fontSize: 20, lineHeight: 1 }}>
                  🤝
               </Box>
               <Stack spacing={0.14} sx={{ minWidth: 0, alignSelf: 'stretch', justifyContent: 'flex-start', pt: 0 }}>
                  <Typography sx={{ color: theme.text, fontWeight: 950, fontSize: 12.5, lineHeight: 1.14 }} noWrap>
                     {item.lead?.name || 'Без клієнта'}
                  </Typography>
                  <Typography sx={{ color: theme.textSoft, fontSize: 11, fontWeight: 750, lineHeight: 1.16 }} noWrap>
                     {item.lead?.phones?.[0] || item.lead?.requestSummary || '—'}
                  </Typography>
                  <Typography sx={{ color: theme.textSoft, fontSize: 10.5, fontWeight: 800, lineHeight: 1.14 }} noWrap>
                     рієлтор: <Box component="span" sx={{ color: theme.text }}>{buyerRealtor}</Box>
                  </Typography>
               </Stack>
            </Stack>

            <Stack
               direction="row"
               spacing={0.55}
               alignItems="center"
               sx={{ minWidth: 0, minHeight: 54, p: 0.55, borderRadius: 1.6, border: '1px solid rgba(236,72,153,0.44)', bgcolor: cellBg }}
            >
               <Stack spacing={0.12} sx={{ minWidth: 0, flex: 1 }}>
                  <Typography sx={{ color: '#f472b6', fontSize: 10.5, fontWeight: 950, textTransform: 'uppercase', lineHeight: 1 }}>
                     Умови
                  </Typography>
                  <Typography
                     sx={{
                        color: theme.text,
                        fontSize: 10.8,
                        fontWeight: 850,
                        lineHeight: 1.12,
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                     }}
                  >
                     {pzs.condition || 'умову ПЗС не внесено'}
                  </Typography>
                  <Typography sx={{ color: theme.textSoft, fontSize: 10.5, fontWeight: 750 }} noWrap>
                     {pzs.sourceLabel || 'джерело ПЗС не вказано'}
                  </Typography>
               </Stack>
                <Tooltip title={pzsStatus === 'active' ? 'Додати крок ПЗС' : statusLabel}>
                   <Box
                      component="button"
                      type="button"
                      onClick={() => pzsStatus === 'active' && onAddStep?.(item)}
                      sx={{
                         width: 34,
                         height: 34,
                         minWidth: 34,
                         borderRadius: 1.5,
                         color: statusColor,
                         bgcolor: `${statusColor}18`,
                         border: `1px solid ${statusColor}55`,
                         display: 'flex',
                         alignItems: 'center',
                         justifyContent: 'center',
                         cursor: pzsStatus === 'active' ? 'pointer' : 'default',
                         '&:hover': pzsStatus === 'active' ? { bgcolor: `${statusColor}26`, transform: 'translateY(-1px)' } : undefined,
                      }}
                   >
                      <StatusIcon sx={{ fontSize: 18 }} />
                   </Box>
                </Tooltip>
            </Stack>

            <Stack spacing={0.25} alignItems={{ xs: 'flex-start', lg: 'flex-end' }}>
               <Typography sx={{ color: theme.textSoft, fontSize: 10.5, fontWeight: 850, lineHeight: 1.1, maxWidth: 132 }} noWrap>
                  {employeeName(item.responsibleEmployee) || '—'}
               </Typography>
                <Stack direction="row" spacing={0.25} alignItems="center" justifyContent={{ xs: 'flex-start', lg: 'flex-end' }}>
                   {!canManage && (
                      <Chip size="small" label={statusLabel} sx={{ height: 24, color: statusColor, bgcolor: `${statusColor}18`, border: `1px solid ${statusColor}55`, fontWeight: 950 }} />
                   )}
                   {canManage && (
                      <>
                         <Tooltip title="Редагувати ПЗС">
                            <IconButton
                               size="small"
                               onClick={() => onEdit?.(item)}
                               sx={{
                                  width: 28,
                                  height: 28,
                                  color: '#f472b6',
                                  border: `1px solid ${statusColor}55`,
                                  borderRadius: 1.35,
                                  bgcolor: `${statusColor}12`,
                                  '&:hover': { bgcolor: `${statusColor}22`, transform: 'translateY(-1px)' },
                               }}
                            >
                               <EditRoundedIcon fontSize="small" />
                            </IconButton>
                         </Tooltip>
                         <Tooltip title="Видалити ПЗС">
                            <IconButton
                               size="small"
                               onClick={() => onDelete?.(item)}
                               sx={{
                                  width: 28,
                                  height: 28,
                                  color: '#f87171',
                                  border: '1px solid rgba(248,113,113,0.38)',
                                  borderRadius: 1.35,
                                  bgcolor: 'rgba(248,113,113,0.08)',
                                  '&:hover': { bgcolor: 'rgba(248,113,113,0.16)', transform: 'translateY(-1px)' },
                               }}
                            >
                               <DeleteOutlineRoundedIcon fontSize="small" />
                            </IconButton>
                         </Tooltip>
                      </>
                   )}
                   <Tooltip title={expanded ? 'Згорнути' : 'Кроки ПЗС'}>
                     <IconButton
                        size="small"
                        onClick={() => setExpanded((value) => !value)}
                        sx={{
                           color: theme.text,
                           border: `1px solid ${theme.border}`,
                           borderRadius: 1.35,
                           width: 28,
                           height: 28,
                           transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
                           transition: 'transform 0.18s ease',
                        }}
                     >
                        <KeyboardArrowDownRoundedIcon fontSize="small" />
                     </IconButton>
                  </Tooltip>
               </Stack>
            </Stack>
         </Box>

         <Collapse in={expanded} timeout="auto" unmountOnExit>
            <Stack spacing={0.7} sx={{ mt: 0.75, p: 1, borderRadius: 1.8, border: `1px solid ${theme.border}`, bgcolor: cellBg }}>
               <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1}>
                  <Typography sx={{ color: theme.textSoft, fontSize: 11, fontWeight: 900, textTransform: 'uppercase' }}>
                     Хронологія кроків
                  </Typography>
                  {!!nextParts.date && nextParts.date !== '—' && (
                     <Typography sx={{ color: statusColor, fontSize: 10.5, fontWeight: 900 }} noWrap>
                        {pzsStatus === 'active' ? 'наступний крок' : 'закрито'}: {nextParts.date}
                     </Typography>
                  )}
               </Stack>
               <Stack spacing={0.55}>
                  {(pzs.steps?.length ? pzs.steps : [{ at: item.occurredAt, type: 'created', text: 'Кроки ПЗС поки не внесені.', readonly: true }]).map((step, idx) => {
                      const stepParts = formatDateParts(step.at);
                     const stepColor = step.type === 'deposit' ? '#22c55e' : step.type === 'failed' ? '#ef4444' : step.type === 'next_step' ? '#f9a8d4' : '#f472b6';
                      const canManageStep = !step.readonly;
                      return (
                         <Stack key={`${step.at}-${idx}`} direction="row" spacing={0.75} alignItems="flex-start">
                           <Box sx={{ width: 24, height: 24, minWidth: 24, borderRadius: '50%', color: stepColor, bgcolor: `${stepColor}18`, border: `1px solid ${stepColor}55`, display: 'flex', alignItems: 'center', justifyContent: 'center', mt: 0.1 }}>
                              {stepIcon(step.type)}
                           </Box>
                            <Stack spacing={0.1} sx={{ minWidth: 0, flex: 1 }}>
                              <Typography sx={{ color: theme.text, fontSize: 12, fontWeight: 850, lineHeight: 1.25 }}>
                                 {step.text}
                              </Typography>
                              <Typography sx={{ color: theme.textSoft, fontSize: 10.5, fontWeight: 750 }}>
                                 {stepParts.date} {stepParts.time}
                              </Typography>
                            </Stack>
                            {canManageStep && (
                               <Stack direction="row" spacing={0.25} sx={{ opacity: 0.82 }}>
                                  <Tooltip title="Редагувати крок">
                                     <IconButton
                                        size="small"
                                        onClick={() => onEditStep?.(item, step, idx)}
                                        sx={{ width: 24, height: 24, color: '#f472b6', border: '1px solid rgba(244,114,182,0.30)', bgcolor: 'rgba(236,72,153,0.10)' }}
                                     >
                                        <EditRoundedIcon sx={{ fontSize: 14 }} />
                                     </IconButton>
                                  </Tooltip>
                                  <Tooltip title="Видалити крок">
                                     <IconButton
                                        size="small"
                                        onClick={() => onDeleteStep?.(item, idx)}
                                        sx={{ width: 24, height: 24, color: '#fb7185', border: '1px solid rgba(251,113,133,0.25)', bgcolor: 'rgba(239,68,68,0.08)' }}
                                     >
                                        <DeleteOutlineRoundedIcon sx={{ fontSize: 14 }} />
                                     </IconButton>
                                  </Tooltip>
                               </Stack>
                            )}
                         </Stack>
                     );
                  })}
               </Stack>
            </Stack>
         </Collapse>
      </Box>
   );
}

export default function OperationsPage() {
   const { theme, mode } = useCRMTheme();
   const { user } = useCurrentUser();
   const propertySearchSeqRef = useRef(0);
   const leadSearchSeqRef = useRef(0);
   const sourceShowingSearchSeqRef = useRef(0);

   const [items, setItems] = useState([]);
   const [financeItems, setFinanceItems] = useState([]);
   const [properties, setProperties] = useState([]);
   const [propertySelectionCache, setPropertySelectionCache] = useState([]);
   const [propertySearch, setPropertySearch] = useState('');
   const [propertiesLoading, setPropertiesLoading] = useState(false);
   const [leads, setLeads] = useState([]);
   const [leadSelectionCache, setLeadSelectionCache] = useState([]);
   const [leadSearch, setLeadSearch] = useState('');
   const [leadsLoading, setLeadsLoading] = useState(false);
   const [sourceShowings, setSourceShowings] = useState([]);
   const [sourceShowingSearch, setSourceShowingSearch] = useState('');
   const [sourceShowingsLoading, setSourceShowingsLoading] = useState(false);
   const [employees, setEmployees] = useState([]);
   const [loading, setLoading] = useState(true);
   const [saving, setSaving] = useState(false);
   const [executingPers, setExecutingPers] = useState(false);
   const [deleting, setDeleting] = useState(false);
   const [error, setError] = useState('');
   const [openCreate, setOpenCreate] = useState(false);
   const [openDepositCreate, setOpenDepositCreate] = useState(false);
   const [editingItem, setEditingItem] = useState(null);
   const [editingFinanceItem, setEditingFinanceItem] = useState(null);
   const [deleteItem, setDeleteItem] = useState(null);
   const [deleteFinanceItem, setDeleteFinanceItem] = useState(null);
   const [pzsStepItem, setPzsStepItem] = useState(null);
   const [editingPzsStepIndex, setEditingPzsStepIndex] = useState(null);
   const [savingPzsStep, setSavingPzsStep] = useState(false);
   const [pzsStepForm, setPzsStepForm] = useState({
      type: 'negotiation',
      at: '',
      text: '',
   });
   const [executeDepositItem, setExecuteDepositItem] = useState(null);
   const [executeForm, setExecuteForm] = useState({
      result: 'completed_success',
      occurredAt: toDatetimeLocal(),
      placeType: 'notary',
      placeName: '',
      note: '',
   });
   const [q, setQ] = useState('');
   const [dateFromFilter, setDateFromFilter] = useState('');
   const [dateToFilter, setDateToFilter] = useState('');
   const [typeFilter, setTypeFilter] = useState('');
   const [resultFilter, setResultFilter] = useState('');
   const [resultObjectFilter, setResultObjectFilter] = useState('');
   const [resultBuyerFilter, setResultBuyerFilter] = useState('');
   const [financialProductFilter, setFinancialProductFilter] = useState('');
   const [employeeFilter, setEmployeeFilter] = useState('');
   const [propertyFilter, setPropertyFilter] = useState('');
   const [leadFilter, setLeadFilter] = useState('');
   const [timelineGroupMode, setTimelineGroupMode] = useState('week');
   const [form, setForm] = useState(() => ({ ...emptyForm, occurredAt: toDatetimeLocal() }));
   const [depositForm, setDepositForm] = useState(() => ({ ...emptyDepositForm, occurredAt: toDatetimeLocal() }));

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
   const currentEmployeeId = String(user?._id || user?.employeeId || '');
   const managerByEmployeeId = useMemo(
      () => new Map(employees.map((employee) => [String(employee._id), String(employee.manager?._id || employee.manager || '')])),
      [employees]
   );

   const isManagerAbove = (employeeId) => {
      let current = managerByEmployeeId.get(String(employeeId || ''));
      const visited = new Set();
      while (current && !visited.has(current)) {
         if (current === currentEmployeeId) return true;
         visited.add(current);
         current = managerByEmployeeId.get(current);
      }
      return false;
   };

   const canManageFinanceItem = (item) => {
      if (!item || !currentEmployeeId) return false;
      if (user?.isFallbackAdmin || ['owner', 'admin'].includes(user?.role)) return true;
      const ownerIds = [
         idOf(item.createdByEmployee),
         idOf(item.responsibleEmployee),
         idOf(item.processedByEmployee),
      ].filter(Boolean).map(String);
      return ownerIds.includes(currentEmployeeId) || ownerIds.some(isManagerAbove);
   };

   const canManageOperationItem = (item) => {
      if (!item || !currentEmployeeId) return false;
      if (user?.isFallbackAdmin || ['owner', 'admin'].includes(user?.role)) return true;
      const ownerIds = [
         idOf(item.createdByEmployee),
         idOf(item.responsibleEmployee),
         idOf(item.shownByEmployee),
         idOf(item.facilitatedByEmployee),
      ].filter(Boolean).map(String);
      return ownerIds.includes(currentEmployeeId) || ownerIds.some(isManagerAbove);
   };

   const demoFinanceEvents = useMemo(
      () => SHOW_DEMO_OPERATION_EVENTS ? buildDemoFinanceEvents({ properties, leads, employees }) : [],
      [properties, leads, employees]
   );
   const demoPreDepositEvents = useMemo(
      () => SHOW_DEMO_OPERATION_EVENTS ? buildDemoPreDepositEvents({ properties, leads, employees }) : [],
      [properties, leads, employees]
   );
   const demoReviewEvents = useMemo(
      () => SHOW_DEMO_OPERATION_EVENTS ? buildDemoReviewEvents({ properties, employees }) : [],
      [properties, employees]
   );
   const financeSourceItems = useMemo(() => {
      const seen = new Set();
      const uniqueItems = [...financeItems, ...demoFinanceEvents].filter((item) => {
         const key = item?._id || `${item?.financeType}-${item?.occurredAt}-${idOf(item?.property)}-${idOf(item?.lead)}`;
         if (!key || seen.has(key)) return false;
         seen.add(key);
         return true;
      });
      const byId = new Map(uniqueItems.map((item) => [String(item._id), item]));
      const reregistrationByDepositId = new Map();

      uniqueItems.forEach((item) => {
         if (item.financeType === 'reregistration' && item.depositId) {
            reregistrationByDepositId.set(String(item.depositId), item);
         }
      });

      return sortOperationEvents(uniqueItems.map((item) => {
         if (item.financeType === 'deposit') {
            const linkedReregistration =
               byId.get(String(idOf(item.reregistrationEvent))) ||
               reregistrationByDepositId.get(String(item._id)) ||
               null;

            return {
               ...item,
               linkedReregistrationOccurredAt: linkedReregistration?.occurredAt || item.reregistrationEvent?.occurredAt || null,
            };
         }

         const linkedDeposit = byId.get(String(item.depositId)) || item.deposit || null;
         return {
            ...item,
            linkedDepositOccurredAt: linkedDeposit?.occurredAt || item.deposit?.occurredAt || null,
         };
      }));
   }, [demoFinanceEvents, financeItems]);

   const matchesDateRange = (item) => {
      const time = new Date(item?.occurredAt || item?.createdAt || 0).getTime();
      if (!time || Number.isNaN(time)) return true;
      if (dateFromFilter) {
         const from = new Date(`${dateFromFilter}T00:00:00`).getTime();
         if (!Number.isNaN(from) && time < from) return false;
      }
      if (dateToFilter) {
         const to = new Date(`${dateToFilter}T23:59:59.999`).getTime();
         if (!Number.isNaN(to) && time > to) return false;
      }
      return true;
   };

   const visibleFinanceEvents = useMemo(() => {
      const financeTypeFilter = typeFilter === 'finance_deposit'
         ? 'deposit'
         : typeFilter === 'finance_reregistration'
            ? 'reregistration'
            : '';
      if (typeFilter && !financeTypeFilter) return [];
      if (resultFilter || resultObjectFilter || resultBuyerFilter) return [];

      const needle = q.trim().toLowerCase();
      return financeSourceItems.filter((item) => {
         if (!matchesDateRange(item)) return false;
         if (financeTypeFilter && item.financeType !== financeTypeFilter) return false;
         if (employeeFilter) {
            const employeeIds = [
               idOf(item.responsibleEmployee),
               idOf(item.processedByEmployee),
               idOf(item.objectRealtorEmployee),
               idOf(item.buyerRealtorEmployee),
            ];
            if (!employeeIds.includes(employeeFilter)) return false;
         }
          if (propertyFilter && idOf(item.property) !== propertyFilter) return false;
          if (leadFilter && idOf(item.lead) !== leadFilter) return false;
          if (financialProductFilter && demoFinancialProductForItem(item)?.value !== financialProductFilter) return false;
          if (!needle) return true;

         return [
            financeTypeLabel(item),
            propertyTitle(item.property),
            propertyMeta(item.property),
            item.lead?.name,
            item.lead?.phones?.[0],
            employeeName(item.responsibleEmployee),
            employeeName(item.processedByEmployee),
            item.location,
            item.notary,
            REREGISTRATION_PLACE_LABELS[item.reregistrationPlaceType],
            item.reregistrationPlaceName,
            item.depositId,
            item.resultSummary,
             FINANCE_STATUS_LABELS[item.status],
             demoFinancialProductForItem(item)?.label,
             demoFinancialProductForItem(item)?.code,
            ...(item.sellerConditions || []),
            ...(item.buyerConditions || []),
            ...(item.agencyConditions || []),
            ...(item.notes || []).map((note) => note.text),
         ]
            .filter(Boolean)
            .join(' ')
            .toLowerCase()
            .includes(needle);
      });
   }, [dateFromFilter, dateToFilter, employeeFilter, financeSourceItems, financialProductFilter, leadFilter, propertyFilter, q, resultBuyerFilter, resultFilter, resultObjectFilter, typeFilter]);

   const visiblePreDepositEvents = useMemo(() => {
      if (typeFilter && typeFilter !== 'pzs') return [];
      if (resultFilter || resultObjectFilter || resultBuyerFilter) return [];

      const needle = q.trim().toLowerCase();
      const sourceItems = [
         ...items.filter((item) => item.type === 'pzs'),
         ...demoPreDepositEvents,
      ];

      return sourceItems.filter((item) => {
         const pzs = item.pzs || item;
         if (!matchesDateRange(item)) return false;
         if (employeeFilter) {
            const employeeIds = [
               idOf(item.responsibleEmployee),
               idOf(item.objectRealtorEmployee),
               idOf(item.buyerRealtorEmployee),
            ];
            if (!employeeIds.includes(employeeFilter)) return false;
         }
          if (propertyFilter && idOf(item.property) !== propertyFilter) return false;
          if (leadFilter && idOf(item.lead) !== leadFilter) return false;
          if (financialProductFilter && demoFinancialProductForItem(item)?.value !== financialProductFilter) return false;
          if (!needle) return true;

         return [
            'ПЗС',
            PZS_STATUS_LABELS[pzs.status],
            propertyTitle(item.property),
            propertyMeta(item.property),
            item.lead?.name,
            item.lead?.phones?.[0],
            employeeName(item.responsibleEmployee),
            employeeName(item.objectRealtorEmployee),
            employeeName(item.buyerRealtorEmployee),
             pzs.condition,
             pzs.sourceLabel,
             demoFinancialProductForItem(item)?.label,
             demoFinancialProductForItem(item)?.code,
             ...(pzs.steps || []).map((step) => step.text),
         ]
            .filter(Boolean)
            .join(' ')
            .toLowerCase()
            .includes(needle);
      });
   }, [dateFromFilter, dateToFilter, demoPreDepositEvents, employeeFilter, financialProductFilter, items, leadFilter, propertyFilter, q, resultBuyerFilter, resultFilter, resultObjectFilter, typeFilter]);

   const preDepositBySourceOperationId = useMemo(() => {
      const map = new Map();
      [...items.filter((item) => item.type === 'pzs'), ...demoPreDepositEvents].forEach((item) => {
         const pzs = item.pzs || item;
         const sourceId = idOf(pzs.sourceOperationEvent);
         if (sourceId && !map.has(String(sourceId))) {
            map.set(String(sourceId), item);
         }
      });
      return map;
   }, [demoPreDepositEvents, items]);

   const visibleOperationItems = useMemo(() => {
      if (typeFilter === 'finance_deposit' || typeFilter === 'finance_reregistration' || typeFilter === 'pzs') return [];
      return [...items.filter((item) => item.type !== 'pzs'), ...demoReviewEvents].filter((item) => {
         if (!matchesDateRange(item)) return false;
         if (typeFilter && item.type !== typeFilter) return false;
         if (employeeFilter) {
            const employeeIds = [
               idOf(item.responsibleEmployee),
               idOf(item.shownByEmployee),
               idOf(item.facilitatedByEmployee),
               idOf(item.objectRealtorEmployee),
            ];
            if (!employeeIds.includes(employeeFilter)) return false;
         }
          if (propertyFilter && idOf(item.property) !== propertyFilter) return false;
          if (leadFilter && idOf(item.lead) !== leadFilter) return false;
          if (financialProductFilter && demoFinancialProductForItem(item)?.value !== financialProductFilter) return false;
          if (resultFilter && item.resultShowing !== resultFilter) return false;
         if (resultObjectFilter) {
            const review = item.review || item.inspection || {};
            const objectResult = item.type === 'review' && review.result !== 'new_object' ? review.objectResult : item.resultObject;
            if (objectResult !== resultObjectFilter) return false;
         }
         if (resultBuyerFilter && item.resultBuyer !== resultBuyerFilter) return false;

         const needle = q.trim().toLowerCase();
         if (!needle) return true;
         const review = item.review || item.inspection || {};
         return [
            labelOf(EVENT_TYPES, item.type),
            propertyTitle(item.property),
            propertyMeta(item.property),
            item.lead?.name,
            item.lead?.phones?.[0],
            employeeName(item.responsibleEmployee),
            employeeName(item.shownByEmployee),
            employeeName(item.facilitatedByEmployee),
            employeeName(item.objectRealtorEmployee),
            reviewResultLabel(review.result),
            reviewObjectResultLabel(review.objectResult),
            review.sourceLabel,
            review.reason,
            review.note,
             labelOf(RESULT_SHOWING_OPTIONS, item.resultShowing),
             labelOf(RESULT_OBJECT_OPTIONS, item.resultObject),
             labelOf(RESULT_BUYER_OPTIONS, item.resultBuyer),
             demoFinancialProductForItem(item)?.label,
             demoFinancialProductForItem(item)?.code,
         ]
            .filter(Boolean)
            .join(' ')
            .toLowerCase()
            .includes(needle);
      });
   }, [dateFromFilter, dateToFilter, demoReviewEvents, employeeFilter, financialProductFilter, items, leadFilter, propertyFilter, q, resultBuyerFilter, resultFilter, resultObjectFilter, typeFilter]);

   const timelineItems = useMemo(
      () => sortOperationEvents([...visibleOperationItems, ...visibleFinanceEvents, ...visiblePreDepositEvents]),
      [visibleOperationItems, visibleFinanceEvents, visiblePreDepositEvents]
   );

   const timelineGroups = useMemo(
      () => groupTimelineItems(timelineItems, timelineGroupMode),
      [timelineGroupMode, timelineItems]
   );

   const metrics = useMemo(() => {
      const showings = visibleOperationItems.filter((x) => x.type === 'showing');
      const reviews = visibleOperationItems.filter((x) => x.type === 'review');
      const newClientItems = visibleOperationItems.filter((x) => x.resultBuyer === 'new_client');
      const newObjectItems = visibleOperationItems.filter((x) => x.resultObject === 'new_object' || x.review?.result === 'new_object');
      const deposits = visibleFinanceEvents.filter((x) => x.financeType === 'deposit');
      const pers = visibleFinanceEvents.filter((x) => x.financeType === 'reregistration');
      const initiativeShowings = showings.filter((x) => x.showingKind === 'initiative').length;
      const pct = (part, total) => total > 0 ? Math.round((part / total) * 100) : 0;
      const emptyProductCounts = () => ({ OO: 0, OP: 0, PP: 0, PO: 0, missing: 0 });
      const productBreakdown = (list) => list.reduce((acc, item) => {
         const value = demoFinancialProductForItem(item)?.value;
         if (['OO', 'OP', 'PP', 'PO'].includes(value)) {
            acc[value] += 1;
         } else {
            acc.missing += 1;
         }
         return acc;
      }, emptyProductCounts());
      const pzsIds = new Set(visiblePreDepositEvents.map((item) => String(idOf(item))).filter(Boolean));
      const convertedPzsIds = new Set();

      visiblePreDepositEvents.forEach((item) => {
         const pzs = item.pzs || item;
         const itemId = String(idOf(item) || '');
         if (!itemId) return;
         if (pzs.status === 'deposit' || idOf(pzs.resultFinanceEvent)) convertedPzsIds.add(itemId);
      });

      deposits.forEach((item) => {
         const sourcePzsId = String(idOf(item.sourcePreDepositEvent) || '');
         if (sourcePzsId && pzsIds.has(sourcePzsId)) convertedPzsIds.add(sourcePzsId);
      });

      const leaderMap = new Map();
      const addLeaderScore = (employee, points, breakdownKey = '', details = {}) => {
         const id = idOf(employee);
         if (!id || points <= 0) return;
         const prev = leaderMap.get(String(id)) || {
            id: String(id),
            name: employeeName(employee) || 'Працівник',
            score: 0,
            breakdown: {},
            showings: 0,
            pzs: 0,
            deposits: 0,
            pers: 0,
         };
         prev.score += points;
         if (breakdownKey) prev.breakdown[breakdownKey] = (prev.breakdown[breakdownKey] || 0) + 1;
         Object.entries(details).forEach(([key, value]) => {
            prev[key] = (prev[key] || 0) + value;
         });
         if (employeeName(employee)) prev.name = employeeName(employee);
         leaderMap.set(String(id), prev);
      };

      showings.forEach((item) => {
         const employee = item.responsibleEmployee || item.shownByEmployee;
         addLeaderScore(employee, item.showingKind === 'initiative' ? OPERATION_SCORING_RULES.initiativeShowing : OPERATION_SCORING_RULES.showing, item.showingKind === 'initiative' ? 'initiativeShowing' : 'showing', { showings: 1 });
         if (item.resultBuyer === 'new_client') {
            addLeaderScore(employee, OPERATION_SCORING_RULES.showingNewClientBonus, 'showingNewClientBonus');
         }
         if (item.resultObject === 'new_object') {
            addLeaderScore(employee, OPERATION_SCORING_RULES.showingNewObjectBonus, 'showingNewObjectBonus');
         }
      });
      reviews.forEach((item) => {
         addLeaderScore(
            item.responsibleEmployee || item.objectRealtorEmployee,
            item.review?.result === 'new_object' ? OPERATION_SCORING_RULES.reviewNewObject : OPERATION_SCORING_RULES.review,
            item.review?.result === 'new_object' ? 'reviewNewObject' : 'review'
         );
      });
      visiblePreDepositEvents.forEach((item) => {
         addLeaderScore(item.responsibleEmployee || item.objectRealtorEmployee, OPERATION_SCORING_RULES.pzs, 'pzs', { pzs: 1 });
      });
      deposits.forEach((item) => {
         addLeaderScore(item.responsibleEmployee || item.processedByEmployee, OPERATION_SCORING_RULES.deposit, 'deposit', { deposits: 1 });
      });
      pers.forEach((item) => {
         addLeaderScore(item.responsibleEmployee || item.processedByEmployee, OPERATION_SCORING_RULES.pers, 'pers', { pers: 1 });
      });

      const leader = [...leaderMap.values()].sort((a, b) => b.score - a.score)[0] || null;

      return {
         total: timelineItems.length,
         showings: showings.length,
         initiativeShowings,
         initiativeShare: pct(initiativeShowings, showings.length),
         reviews: reviews.length,
         newClients: newClientItems.length,
         newObjects: newObjectItems.length,
         pzs: visiblePreDepositEvents.length,
         deposits: deposits.length,
         pers: pers.length,
         productCounts: {
            total: productBreakdown(timelineItems),
            showings: productBreakdown(showings),
            reviews: productBreakdown(reviews),
            newClients: productBreakdown(newClientItems),
            newObjects: productBreakdown(newObjectItems),
            pzs: productBreakdown(visiblePreDepositEvents),
            deposits: productBreakdown(deposits),
            pers: productBreakdown(pers),
         },
         leader,
         conversions: {
            showingToPzs: pct(visiblePreDepositEvents.length, showings.length),
            pzsToDeposit: pct(convertedPzsIds.size, pzsIds.size),
            depositToPers: pct(pers.length, deposits.length),
         },
      };
   }, [timelineItems, visibleFinanceEvents, visibleOperationItems, visiblePreDepositEvents]);

   const loadOperations = async () => {
      try {
         setError('');
         const params = new URLSearchParams();
         params.set('pageSize', '50');
         if (q.trim()) params.set('q', q.trim());
         if (typeFilter && typeFilter !== 'finance_deposit' && typeFilter !== 'finance_reregistration' && typeFilter !== 'pzs') params.set('type', typeFilter);
         if (resultFilter) params.set('resultShowing', resultFilter);
         if (employeeFilter) params.set('employee', employeeFilter);
         if (propertyFilter) params.set('property', propertyFilter);
         if (leadFilter) params.set('lead', leadFilter);

         const res = await fetch(`/api/crm/operations?${params.toString()}`, { cache: 'no-store' });
         if (!res.ok) throw new Error('Не вдалося завантажити операційні події');
         const data = await res.json();
         setItems(Array.isArray(data?.items) ? sortOperationEvents(data.items) : []);
      } catch (e) {
         console.error(e);
         setError(e?.message || 'Помилка завантаження');
      } finally {
         setLoading(false);
      }
   };

   const loadFinanceEvents = async () => {
      try {
         const params = new URLSearchParams();
         params.set('pageSize', '100');

         const res = await fetch(`/api/crm/finance-events?${params.toString()}`, { cache: 'no-store' });
         if (!res.ok) throw new Error('Не вдалося завантажити фінансові події');
         const data = await res.json();
         setFinanceItems(Array.isArray(data?.items) ? data.items : []);
      } catch (e) {
         console.error(e);
      }
   };

   const loadProperties = async (search = '') => {
      const requestSeq = propertySearchSeqRef.current + 1;
      propertySearchSeqRef.current = requestSeq;
      try {
         setPropertiesLoading(true);
         const value = search.trim();
         const params = new URLSearchParams();
         params.set('mode', 'sale');
         params.set('pageSize', '20');

         if (value && value.length < PROPERTY_MIN_SEARCH_LENGTH) {
            if (propertySearchSeqRef.current !== requestSeq) return;
            setProperties([]);
            return;
         }

         if (value.length >= PROPERTY_MIN_SEARCH_LENGTH) {
            params.set('q', value);
         } else {
            params.set('crmStage', 'work');
         }

         const res = await fetch(`/api/crm/properties?${params.toString()}`, { cache: 'no-store' });
         const data = res.ok ? await res.json() : { items: [] };
         const incoming = Array.isArray(data?.items) ? data.items : [];
         if (propertySearchSeqRef.current !== requestSeq) return;
         setProperties(incoming);
      } catch (e) {
         console.error(e);
      } finally {
         if (propertySearchSeqRef.current === requestSeq) setPropertiesLoading(false);
      }
   };

   const loadLeads = async (search = '') => {
      const requestSeq = leadSearchSeqRef.current + 1;
      leadSearchSeqRef.current = requestSeq;
      try {
         setLeadsLoading(true);
         const value = search.trim();
         const params = new URLSearchParams();
         params.set('pageSize', '20');

         if (value && value.length < LEAD_MIN_SEARCH_LENGTH) {
            if (leadSearchSeqRef.current !== requestSeq) return;
            setLeads([]);
            return;
         }

         if (value.length >= LEAD_MIN_SEARCH_LENGTH) {
            params.set('q', value);
            params.set('searchFields', 'identity');
            setLeads([]);
         } else {
            params.set('stageMin', 'rs');
            params.set('actuality', 'active');
         }

         const res = await fetch(`/api/crm/leads?${params.toString()}`, { cache: 'no-store' });
         const data = res.ok ? await res.json() : { items: [] };
         const incoming = Array.isArray(data?.items) ? data.items : [];
         if (leadSearchSeqRef.current !== requestSeq) return;
         setLeads(incoming);
      } catch (e) {
         console.error(e);
      } finally {
         if (leadSearchSeqRef.current === requestSeq) setLeadsLoading(false);
      }
   };

   const loadSourceShowings = async (search = '') => {
      const requestSeq = sourceShowingSearchSeqRef.current + 1;
      sourceShowingSearchSeqRef.current = requestSeq;
      try {
         setSourceShowingsLoading(true);
         const value = search.trim();
         const params = new URLSearchParams();
         params.set('type', 'showing');
         params.set('pageSize', '20');

         if (value && value.length < SHOWING_MIN_SEARCH_LENGTH) {
            if (sourceShowingSearchSeqRef.current !== requestSeq) return;
            setSourceShowings([]);
            return;
         }

         if (value.length >= SHOWING_MIN_SEARCH_LENGTH) {
            params.set('q', value);
            setSourceShowings([]);
         }

         const res = await fetch(`/api/crm/operations?${params.toString()}`, { cache: 'no-store' });
         const data = res.ok ? await res.json() : { items: [] };
         const incoming = Array.isArray(data?.items) ? data.items : [];
         if (sourceShowingSearchSeqRef.current !== requestSeq) return;
         setSourceShowings(incoming);
      } catch (e) {
         console.error(e);
      } finally {
         if (sourceShowingSearchSeqRef.current === requestSeq) setSourceShowingsLoading(false);
      }
   };

   const loadDictionaries = async () => {
      const [employeesRes] = await Promise.all([
         fetch('/api/crm/employees?active=true', { cache: 'no-store' }),
      ]);

      const [employeesData] = await Promise.all([
         employeesRes.ok ? employeesRes.json() : { items: [] },
      ]);

      await loadProperties('');
      await loadLeads('');
      await loadSourceShowings('');
      setEmployees(Array.isArray(employeesData?.items) ? employeesData.items : []);
   };

   useEffect(() => {
      setLoading(true);
      Promise.all([loadOperations(), loadFinanceEvents(), loadDictionaries()]).finally(() => setLoading(false));
   }, []);

   useEffect(() => {
      const t = setTimeout(() => {
         loadProperties(propertySearch);
      }, propertySearch.trim().length >= PROPERTY_MIN_SEARCH_LENGTH ? 350 : 0);
      return () => clearTimeout(t);
   }, [propertySearch]);

   useEffect(() => {
      const t = setTimeout(() => {
         loadLeads(leadSearch);
      }, leadSearch.trim().length >= LEAD_MIN_SEARCH_LENGTH ? 350 : 0);
      return () => clearTimeout(t);
   }, [leadSearch]);

   useEffect(() => {
      const t = setTimeout(() => {
         loadSourceShowings(sourceShowingSearch);
      }, sourceShowingSearch.trim().length >= SHOWING_MIN_SEARCH_LENGTH ? 350 : 0);
      return () => clearTimeout(t);
   }, [sourceShowingSearch]);

   useEffect(() => {
      const t = setTimeout(() => {
         loadOperations();
         loadFinanceEvents();
      }, 250);
      return () => clearTimeout(t);
   }, [q, typeFilter, resultFilter, employeeFilter, propertyFilter, leadFilter]);

   const propertyLookupOptions = useMemo(
      () => mergeById(
         properties,
         propertySelectionCache,
         items.map((item) => item.property),
         financeSourceItems.map((item) => item.property),
      ),
      [financeSourceItems, items, properties, propertySelectionCache]
   );
   const leadLookupOptions = useMemo(
      () => mergeById(
         leads,
         leadSelectionCache,
         items.map((item) => item.lead),
         financeSourceItems.map((item) => item.lead),
      ),
      [financeSourceItems, items, leadSelectionCache, leads]
   );

   const selectedProperty = propertyLookupOptions.find((x) => x._id === form.property) || null;
   const selectedLead = leadLookupOptions.find((x) => x._id === form.lead) || null;
   const selectedDepositProperty = propertyLookupOptions.find((x) => x._id === depositForm.property) || null;
   const selectedDepositLead = leadLookupOptions.find((x) => x._id === depositForm.lead) || null;
   const selectedEmployeeFilter = employees.find((x) => x._id === employeeFilter) || null;
   const selectedPropertyFilter = propertyLookupOptions.find((x) => x._id === propertyFilter) || null;
   const selectedLeadFilter = leadLookupOptions.find((x) => x._id === leadFilter) || null;
   const showingOptions = useMemo(
      () => mergeById(sourceShowings, items.filter((item) => item.type === 'showing' && idOf(item) === form.sourceOperationEvent)),
      [form.sourceOperationEvent, items, sourceShowings]
   );
   const selectedSourceOperationEvent = showingOptions.find((x) => x._id === form.sourceOperationEvent) || null;
   const rememberPropertyOption = (option) => {
      if (!option?._id) return;
      setPropertySelectionCache((prev) => mergeById([option], prev).slice(0, 12));
   };
   const rememberLeadOption = (option) => {
      if (!option?._id) return;
      setLeadSelectionCache((prev) => mergeById([option], prev).slice(0, 12));
   };
   const renderPropertyOption = (props, option) => {
      const meta = propertyMeta(option);
      const phone = propertyOwnerPhone(option);
      return (
         <Box component="li" {...props}>
            <Stack spacing={0.15} sx={{ minWidth: 0, maxWidth: 560 }}>
               <Typography sx={{ fontWeight: 850, lineHeight: 1.2 }}>{propertyTitle(option)}</Typography>
               <Typography sx={{ fontSize: 12, opacity: 0.72, lineHeight: 1.25 }}>
                  {[meta, phone && `тел: ${phone}`, option?._id && `ID: ${String(option._id).slice(-6)}`].filter(Boolean).join(' · ')}
               </Typography>
            </Stack>
         </Box>
      );
   };
   const renderLeadOption = (props, option) => (
      <Box component="li" {...props}>
         <Stack spacing={0.15} sx={{ minWidth: 0, maxWidth: 520 }}>
            <Typography sx={{ fontWeight: 850, lineHeight: 1.2 }}>{option?.name || 'Без імені'}</Typography>
            <Typography sx={{ fontSize: 12, opacity: 0.72, lineHeight: 1.25 }}>
               {[
                  option?.phones?.[0],
                  STAGE_LABELS[option?.stage] || option?.stage,
                  option?.actualityStatus,
                  option?._id && `ID: ${String(option._id).slice(-6)}`,
               ].filter(Boolean).join(' · ')}
            </Typography>
         </Stack>
      </Box>
   );

   const renderShowingOption = (props, option) => (
      <Box component="li" {...props}>
         <Stack spacing={0.15} sx={{ minWidth: 0, maxWidth: 560 }}>
            <Typography sx={{ fontWeight: 850, lineHeight: 1.2 }}>{propertyTitle(option.property)}</Typography>
            <Typography sx={{ fontSize: 12, opacity: 0.72, lineHeight: 1.25 }}>
               {[formatDate(option.occurredAt), option.lead?.name || 'Без покупця', employeeName(option.responsibleEmployee)].filter(Boolean).join(' · ')}
            </Typography>
         </Stack>
      </Box>
   );

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

   useEffect(() => {
      if (!selectedDepositProperty) return;
      setDepositForm((prev) => ({
         ...prev,
         objectRealtorEmployee: prev.objectRealtorKind === 'employee'
            ? prev.objectRealtorEmployee || selectedDepositProperty.assignee?._id || selectedDepositProperty.assignee || ''
            : prev.objectRealtorEmployee,
      }));
   }, [selectedDepositProperty?._id]);

   useEffect(() => {
      if (!selectedDepositLead) return;
      setDepositForm((prev) => ({
         ...prev,
         buyerRealtorEmployee: prev.buyerRealtorKind === 'employee'
            ? prev.buyerRealtorEmployee || selectedDepositLead.assignee?._id || selectedDepositLead.assignee || ''
            : prev.buyerRealtorEmployee,
      }));
   }, [selectedDepositLead?._id]);

   const updateForm = (key, value) => {
      setForm((prev) => {
          if (key === 'type' && value === 'pzs') {
             return {
                ...prev,
                type: value,
               resultShowing: prev.resultShowing === 'unclear' ? 'pzs' : prev.resultShowing,
               buyerStage: prev.buyerStage || 'pzs',
                pzsStatus: prev.pzsStatus || 'active',
             };
          }
         if (key === 'reviewResult') {
             const isPositiveReview = value === 'new_object' || value === 'historical';
             return {
                ...prev,
                reviewResult: value,
                 reviewReason: isPositiveReview ? '' : prev.reviewReason,
                 reviewObjectResult: isPositiveReview ? 'other' : prev.reviewObjectResult,
             };
          }
          return { ...prev, [key]: value };
       });
   };

   const selectSourceShowing = (showing) => {
      if (!showing) {
          setForm((prev) => ({ ...prev, sourceOperationEvent: '', pzsSourceLabel: '' }));
         return;
      }

      rememberPropertyOption(showing.property);
      rememberLeadOption(showing.lead);
      setForm((prev) => ({
         ...prev,
          sourceOperationEvent: showing._id || '',
          financialProduct: showing.financialProduct || prev.financialProduct,
          property: idOf(showing.property) || prev.property,
         lead: idOf(showing.lead) || prev.lead,
         responsibleEmployee: idOf(showing.responsibleEmployee) || prev.responsibleEmployee,
         objectRealtorKind: showing.objectRealtorKind || prev.objectRealtorKind,
         objectRealtorEmployee: idOf(showing.objectRealtorEmployee) || prev.objectRealtorEmployee,
         objectPartnerName: showing.objectPartnerName || prev.objectPartnerName,
         buyerRealtorKind: showing.buyerRealtorKind || prev.buyerRealtorKind,
         buyerRealtorEmployee: idOf(showing.buyerRealtorEmployee) || prev.buyerRealtorEmployee,
         buyerPartnerName: showing.buyerPartnerName || prev.buyerPartnerName,
         pzsSourceLabel: prev.pzsSourceLabel || `Після показу ${formatDate(showing.occurredAt)}`,
      }));
   };

   const resetForm = () => {
      const currentEmployeeId = user?._id || user?.employeeId || '';

      setForm({
         ...emptyForm,
         occurredAt: toDatetimeLocal(),
         responsibleEmployee: currentEmployeeId,
         shownByEmployee: currentEmployeeId,
      });
   };

   const openPreDepositDialog = () => {
      const currentEmployeeId = user?._id || user?.employeeId || '';
      setEditingItem(null);
      setSourceShowingSearch('');
      loadSourceShowings('');
      setForm({
         ...emptyForm,
         type: 'pzs',
         occurredAt: toDatetimeLocal(),
         responsibleEmployee: currentEmployeeId,
         shownByEmployee: currentEmployeeId,
         resultShowing: 'pzs',
         buyerStage: 'pzs',
         pzsStatus: 'active',
      });
      setOpenCreate(true);
   };

   const openPreDepositFromShowing = (showing, linkedPzs = null) => {
      if (!showing?._id) return;
      setSourceShowingSearch('');
      loadSourceShowings('');
      rememberPropertyOption(showing.property);
      rememberLeadOption(showing.lead);
      setSourceShowings((prev) => mergeById([showing], prev).slice(0, 20));

      if (linkedPzs?._id) {
         setEditingItem(linkedPzs);
         setForm(formFromOperation(linkedPzs));
         setOpenCreate(true);
         return;
      }

      const currentEmployeeId = user?._id || user?.employeeId || '';
      setEditingItem(null);
      setForm({
         ...emptyForm,
         type: 'pzs',
         occurredAt: toDatetimeLocal(),
         responsibleEmployee: idOf(showing.responsibleEmployee) || currentEmployeeId,
         shownByEmployee: idOf(showing.shownByEmployee) || currentEmployeeId,
         property: idOf(showing.property),
         lead: idOf(showing.lead),
         propertyStage: showing.propertyStage || showing.property?.actualityGroup || '',
         buyerStage: 'pzs',
         objectRealtorKind: showing.objectRealtorKind || 'employee',
         objectRealtorEmployee: idOf(showing.objectRealtorEmployee),
         objectPartnerName: showing.objectPartnerName || '',
         buyerRealtorKind: showing.buyerRealtorKind || 'employee',
         buyerRealtorEmployee: idOf(showing.buyerRealtorEmployee),
         buyerPartnerName: showing.buyerPartnerName || '',
         resultShowing: 'pzs',
          pzsSourceLabel: `Після показу ${formatDate(showing.occurredAt)}`,
          sourceOperationEvent: showing._id,
          financialProduct: showing.financialProduct || '',
          pzsStatus: 'active',
      });
      setOpenCreate(true);
   };

   const resetDepositForm = () => {
      const currentEmployeeId = user?._id || user?.employeeId || '';
      setDepositForm({
         ...emptyDepositForm,
         occurredAt: toDatetimeLocal(),
         responsibleEmployee: currentEmployeeId,
         processedByEmployee: currentEmployeeId,
      });
   };

   const updateDepositForm = (key, value) => {
      setDepositForm((prev) => ({ ...prev, [key]: value }));
   };

   const markPreDepositAsDeposit = (pzsId, financeItem) => {
      if (!pzsId) return;
      setItems((prev) =>
         prev.map((item) => {
            if (idOf(item) !== pzsId) return item;
            const pzs = item.pzs || {};
            return {
               ...item,
               pzs: {
                  ...pzs,
                  status: 'deposit',
                  resultFinanceEvent: financeItem,
                  closedAt: financeItem?.occurredAt || new Date().toISOString(),
                  steps: [
                     ...(pzs.steps || []),
                     {
                        at: financeItem?.occurredAt || new Date().toISOString(),
                        type: 'deposit',
                        text: 'ПЗС закрито завдатком.',
                     },
                  ],
               },
            };
         })
      );
   };

   const reopenPreDepositAfterDepositDelete = (pzsId) => {
      if (!pzsId) return;
      setItems((prev) =>
         prev.map((item) => {
            if (idOf(item) !== pzsId) return item;
            const pzs = item.pzs || {};
            return {
               ...item,
               pzs: {
                  ...pzs,
                  status: 'active',
                  resultFinanceEvent: null,
                  closedAt: null,
                  steps: [
                     ...(pzs.steps || []),
                     {
                        at: new Date().toISOString(),
                        type: 'note',
                        text: 'Завдаток видалено. ПЗС повернено в роботу.',
                     },
                  ],
               },
            };
         })
      );
   };

   const closeOperationDialog = () => {
      if (saving) return;
      setOpenCreate(false);
      setEditingItem(null);
   };

   const openEditDialog = (item) => {
      setEditingItem(item);
      setForm(formFromOperation(item));
   };

   const openFinanceEditDialog = (item) => {
      setEditingFinanceItem(item);
      setDepositForm(formFromFinanceEvent(item));
   };

   const openDepositFromPreDeposit = (item, stepText = '') => {
      const currentEmployeeId = user?._id || user?.employeeId || '';
      const condition = item?.pzs?.condition || item?.condition || '';
      setEditingFinanceItem(null);
      rememberPropertyOption(item?.property);
      rememberLeadOption(item?.lead);
      setDepositForm({
         ...emptyDepositForm,
         occurredAt: toDatetimeLocal(),
         responsibleEmployee: idOf(item?.responsibleEmployee) || currentEmployeeId,
         processedByEmployee: currentEmployeeId,
         property: idOf(item?.property),
         lead: idOf(item?.lead),
         objectRealtorKind: item?.objectRealtorKind || 'employee',
         objectRealtorEmployee: idOf(item?.objectRealtorEmployee),
         objectPartnerName: item?.objectPartnerName || '',
         buyerRealtorKind: item?.buyerRealtorKind || 'employee',
         buyerRealtorEmployee: idOf(item?.buyerRealtorEmployee),
          buyerPartnerName: item?.buyerPartnerName || '',
          financialProduct: item?.financialProduct || item?.pzs?.sourceOperationEvent?.financialProduct || '',
          sellerConditions: '',
         buyerConditions: condition,
         agencyConditions: '',
         note: [stepText, condition && `Умова ПЗС: ${condition}`].filter(Boolean).join('\n'),
         sourceOperationEvent: idOf(item?.pzs?.sourceOperationEvent),
         sourcePreDepositEvent: idOf(item),
      });
      setOpenDepositCreate(true);
   };

   const openPzsStepDialog = (item) => {
      setPzsStepItem(item);
      setEditingPzsStepIndex(null);
      setPzsStepForm({ type: 'negotiation', at: item?.occurredAt ? toDatetimeLocal(new Date(item.occurredAt)) : toDatetimeLocal(), text: '' });
   };

   const openPzsStepEditDialog = (item, step, index) => {
      setPzsStepItem(item);
      setEditingPzsStepIndex(index);
      setPzsStepForm({
         type: step?.type || 'note',
         at: step?.at ? toDatetimeLocal(new Date(step.at)) : item?.occurredAt ? toDatetimeLocal(new Date(item.occurredAt)) : toDatetimeLocal(),
         text: step?.text || '',
      });
   };

   const closePzsStepDialog = () => {
      if (savingPzsStep) return;
      setPzsStepItem(null);
      setEditingPzsStepIndex(null);
      setPzsStepForm({ type: 'negotiation', at: '', text: '' });
   };

   const buildPayload = () => {
      const payload = {
         ...form,
         objections: form.objectionsText
            .split(',')
            .map((x) => x.trim())
            .filter(Boolean),
         createdByEmployee: user?._id || user?.employeeId || '',
      };
      delete payload.objectionsText;
      delete payload.pzsCondition;
      delete payload.pzsSourceLabel;
      delete payload.pzsFirstStep;
      delete payload.pzsStatus;
      delete payload.reviewResult;
      delete payload.reviewObjectResult;
      delete payload.reviewReason;
      delete payload.reviewNote;

      if (form.type === 'pzs') {
         payload.pzs = {
            status: form.pzsStatus || 'active',
            condition: form.pzsCondition,
            sourceLabel: form.pzsSourceLabel,
            stepsText: form.pzsFirstStep,
         };
      }

      if (form.type === 'review') {
         const isHistoricalReview = form.reviewResult === 'historical';
         const isNewObjectReview = form.reviewResult === 'new_object';
         payload.lead = '';
         payload.resultShowing = 'unclear';
         payload.resultBuyer = 'none';
         payload.resultObject = isNewObjectReview ? 'new_object' : 'none';
         payload.buyerStage = '';
         payload.buyerRealtorKind = 'none';
         payload.buyerRealtorEmployee = '';
         payload.buyerPartnerName = '';
         payload.objections = [];
         payload.objectionArguments = '';
         payload.resultDescription = isHistoricalReview || isNewObjectReview ? form.reviewNote : form.reviewReason;
         payload.review = {
            result: form.reviewResult,
            objectResult: isHistoricalReview || isNewObjectReview ? 'other' : form.reviewObjectResult,
            source: isHistoricalReview || isNewObjectReview ? 'properties' : 'operations',
            sourceLabel: isNewObjectReview ? 'Об’єкти · новий об’єкт' : isHistoricalReview ? 'Об’єкти · історичний огляд' : 'Операційка · не взято',
            reason: isHistoricalReview || isNewObjectReview ? '' : form.reviewReason,
            note: form.reviewNote,
            linkedPropertyStatus: isNewObjectReview ? (form.propertyStage || 'об’єкт у роботі') : isHistoricalReview ? (form.propertyStage || 'наявний об’єкт') : '',
         };
      }

      return payload;
   };

   const submit = async () => {
      try {
         setSaving(true);
         setError('');

         const payload = buildPayload();
         const isEditing = !!editingItem?._id;

         const res = await fetch(isEditing ? `/api/crm/operations/${editingItem._id}` : '/api/crm/operations', {
            method: isEditing ? 'PATCH' : 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
         });

         const data = await res.json().catch(() => null);
         if (!res.ok) throw new Error(data?.error || (isEditing ? 'Не вдалося оновити подію' : 'Не вдалося додати подію'));

         setItems((prev) =>
            sortOperationEvents(
               isEditing
                  ? prev.map((item) => (item._id === data.item._id ? data.item : item))
                  : [data.item, ...prev]
            )
         );
         setOpenCreate(false);
         setEditingItem(null);
         resetForm();
      } catch (e) {
         console.error(e);
         setError(e?.message || 'Помилка збереження');
      } finally {
         setSaving(false);
      }
   };

   const submitPzsStep = async () => {
      if (!pzsStepItem?._id || !pzsStepForm.text.trim()) return;

      const isEditingPzsStep = editingPzsStepIndex !== null;

      if (!isEditingPzsStep && pzsStepForm.type === 'deposit') {
         const item = pzsStepItem;
         const stepText = pzsStepForm.text.trim();
         setPzsStepItem(null);
         setEditingPzsStepIndex(null);
         setPzsStepForm({ type: 'negotiation', at: '', text: '' });
         openDepositFromPreDeposit(item, stepText);
         return;
      }

      const step = {
         at: pzsStepForm.at ? new Date(pzsStepForm.at).toISOString() : new Date().toISOString(),
         type: pzsStepForm.type,
         text: pzsStepForm.text.trim(),
      };

      try {
         setSavingPzsStep(true);
         setError('');

         let updatedItem = null;

         if (isMongoObjectId(pzsStepItem._id)) {
            const res = await fetch(`/api/crm/operations/${pzsStepItem._id}/pzs-step`, {
               method: isEditingPzsStep ? 'PATCH' : 'POST',
               headers: { 'Content-Type': 'application/json' },
               body: JSON.stringify({
                  index: editingPzsStepIndex,
                  type: pzsStepForm.type,
                  at: pzsStepForm.at,
                  text: pzsStepForm.text,
                  createdByEmployee: user?._id || user?.employeeId || '',
               }),
            });
            const data = await res.json().catch(() => null);
            if (!res.ok) throw new Error(data?.error || (isEditingPzsStep ? 'Не вдалося оновити крок ПЗС' : 'Не вдалося додати крок ПЗС'));
            updatedItem = data.item;
         } else {
            const pzs = pzsStepItem.pzs || pzsStepItem;
            const nextSteps = [...(pzs.steps || [])];
            if (isEditingPzsStep) {
               nextSteps[editingPzsStepIndex] = step;
            } else {
               nextSteps.push(step);
            }
            const lastClosingStep = [...nextSteps].reverse().find((step) => ['failed', 'deposit'].includes(step.type));
            const lastNextStep = [...nextSteps].reverse().find((step) => step.type === 'next_step');
            updatedItem = {
               ...pzsStepItem,
               pzs: {
                  ...pzs,
                  status: lastClosingStep?.type || 'active',
                  closedAt: lastClosingStep?.at || null,
                  nextStepAt: lastNextStep?.at || null,
                  steps: nextSteps,
               },
            };
         }

         setItems((prev) => sortOperationEvents(prev.map((item) => item._id === updatedItem._id ? updatedItem : item)));
         setPzsStepItem(null);
         setEditingPzsStepIndex(null);
         setPzsStepForm({ type: 'negotiation', at: '', text: '' });

      } catch (e) {
         console.error(e);
         setError(e?.message || 'Помилка додавання кроку ПЗС');
      } finally {
         setSavingPzsStep(false);
      }
   };

   const deletePzsStep = async (item, index) => {
      if (!item?._id || !Number.isInteger(index)) return;
      const confirmed = window.confirm('Видалити цей крок ПЗС?');
      if (!confirmed) return;

      try {
         setError('');

         let updatedItem = null;
         if (isMongoObjectId(item._id)) {
            const res = await fetch(`/api/crm/operations/${item._id}/pzs-step?index=${index}`, {
               method: 'DELETE',
            });
            const data = await res.json().catch(() => null);
            if (!res.ok) throw new Error(data?.error || 'Не вдалося видалити крок ПЗС');
            updatedItem = data.item;
         } else {
            const pzs = item.pzs || item;
            const steps = [...(pzs.steps || [])];
            steps.splice(index, 1);
            const lastClosingStep = [...steps].reverse().find((step) => ['failed', 'deposit'].includes(step.type));
            const lastNextStep = [...steps].reverse().find((step) => step.type === 'next_step');
            updatedItem = {
               ...item,
               pzs: {
                  ...pzs,
                  steps,
                  status: lastClosingStep?.type || 'active',
                  closedAt: lastClosingStep?.at || null,
                  nextStepAt: lastNextStep?.at || null,
               },
            };
         }

         setItems((prev) => sortOperationEvents(prev.map((event) => event._id === updatedItem._id ? updatedItem : event)));
      } catch (e) {
         console.error(e);
         setError(e?.message || 'Помилка видалення кроку ПЗС');
      }
   };

   const submitDeposit = async () => {
      try {
         setSaving(true);
         setError('');

         const payload = {
            financeType: 'deposit',
            occurredAt: depositForm.occurredAt,
            responsibleEmployee: depositForm.responsibleEmployee,
            processedByEmployee: depositForm.processedByEmployee,
            property: depositForm.property,
            lead: depositForm.lead,
            objectRealtorKind: depositForm.objectRealtorKind,
            objectRealtorEmployee: depositForm.objectRealtorEmployee,
            objectPartnerName: depositForm.objectPartnerName,
            buyerRealtorKind: depositForm.buyerRealtorKind,
            buyerRealtorEmployee: depositForm.buyerRealtorEmployee,
            buyerPartnerName: depositForm.buyerPartnerName,
            tensionLevel: depositForm.tensionLevel,
            location: depositForm.location,
            deadlineAt: depositForm.deadlineAt,
            scheduledReregistrationAt: depositForm.scheduledReregistrationAt,
             notary: depositForm.notary,
             financialProduct: depositForm.financialProduct,
             status: 'waiting',
            sellerConditions: depositForm.sellerConditions,
            buyerConditions: depositForm.buyerConditions,
             agencyConditions: depositForm.agencyConditions,
             notes: depositForm.note ? [{ text: depositForm.note, color: '#22c55e' }] : [],
             sourceOperationEvent: depositForm.sourceOperationEvent,
             sourcePreDepositEvent: depositForm.sourcePreDepositEvent,
             createdByEmployee: user?._id || user?.employeeId || '',
          };

         const res = await fetch('/api/crm/finance-events', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
         });

         const data = await res.json().catch(() => null);
         if (!res.ok) throw new Error(data?.error || 'Не вдалося створити завдаток');

          setFinanceItems((prev) => sortOperationEvents([data.item, ...prev]));
          markPreDepositAsDeposit(payload.sourcePreDepositEvent, data.item);
          setOpenDepositCreate(false);
          resetDepositForm();
      } catch (e) {
         console.error(e);
         setError(e?.message || 'Помилка створення завдатку');
      } finally {
         setSaving(false);
      }
   };

   const submitFinanceEdit = async () => {
      if (!editingFinanceItem?._id || !isMongoObjectId(editingFinanceItem._id)) return;

      try {
         setSaving(true);
         setError('');

         const payload = {
            occurredAt: depositForm.occurredAt,
            responsibleEmployee: depositForm.responsibleEmployee,
            processedByEmployee: depositForm.processedByEmployee,
            property: depositForm.property,
            lead: depositForm.lead,
            objectRealtorKind: depositForm.objectRealtorKind,
            objectRealtorEmployee: depositForm.objectRealtorEmployee,
            objectPartnerName: depositForm.objectPartnerName,
            buyerRealtorKind: depositForm.buyerRealtorKind,
            buyerRealtorEmployee: depositForm.buyerRealtorEmployee,
            buyerPartnerName: depositForm.buyerPartnerName,
            tensionLevel: depositForm.tensionLevel,
            location: depositForm.location,
            status: depositForm.status,
            deadlineAt: depositForm.deadlineAt,
            scheduledReregistrationAt: depositForm.scheduledReregistrationAt,
            notary: depositForm.notary,
            reregistrationPlaceType: depositForm.reregistrationPlaceType,
            reregistrationPlaceName: depositForm.reregistrationPlaceName,
            sellerConditions: depositForm.sellerConditions,
            buyerConditions: depositForm.buyerConditions,
            agencyConditions: depositForm.agencyConditions,
             resultSummary: depositForm.resultSummary,
             notes: editingFinanceItem.notes || [],
             note: depositForm.note,
             sourceOperationEvent: depositForm.sourceOperationEvent,
             sourcePreDepositEvent: depositForm.sourcePreDepositEvent,
             financialProduct: depositForm.financialProduct,
          };

         const res = await fetch(`/api/crm/finance-events/${editingFinanceItem._id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
         });

         const data = await res.json().catch(() => null);
         if (!res.ok) throw new Error(data?.error || 'Не вдалося оновити фінансову подію');

          setFinanceItems((prev) => sortOperationEvents(prev.map((item) => item._id === data.item._id ? data.item : item)));
          setEditingFinanceItem(null);
          resetDepositForm();
      } catch (e) {
         console.error(e);
         setError(e?.message || 'Помилка оновлення фінансової події');
      } finally {
         setSaving(false);
      }
   };

   const confirmFinanceDelete = async () => {
      if (!deleteFinanceItem?._id || !isMongoObjectId(deleteFinanceItem._id)) {
         setDeleteFinanceItem(null);
         return;
      }

      try {
         setDeleting(true);
         setError('');

         const res = await fetch(`/api/crm/finance-events/${deleteFinanceItem._id}`, {
            method: 'DELETE',
         });

         const data = await res.json().catch(() => null);
         if (!res.ok) throw new Error(data?.error || 'Не вдалося видалити фінансову подію');

          setFinanceItems((prev) =>
             prev
               .filter((item) => item._id !== deleteFinanceItem._id)
               .map((item) =>
                  deleteFinanceItem.financeType === 'reregistration' && idOf(item.reregistrationEvent) === deleteFinanceItem._id
                     ? { ...item, status: 'waiting', reregistrationEvent: null }
                     : item
                )
          );
          if (deleteFinanceItem.financeType === 'deposit') {
             reopenPreDepositAfterDepositDelete(idOf(deleteFinanceItem.sourcePreDepositEvent));
          }
          setDeleteFinanceItem(null);
      } catch (e) {
         console.error(e);
         setError(e?.message || 'Помилка видалення фінансової події');
      } finally {
         setDeleting(false);
      }
   };

   const confirmDelete = async () => {
      if (!deleteItem?._id) return;

      try {
         setDeleting(true);
         setError('');

         const res = await fetch(`/api/crm/operations/${deleteItem._id}`, {
            method: 'DELETE',
         });

         const data = await res.json().catch(() => null);
         if (!res.ok) throw new Error(data?.error || 'Не вдалося видалити подію');

         setItems((prev) => prev.filter((item) => item._id !== deleteItem._id));
         setDeleteItem(null);
      } catch (e) {
         console.error(e);
         setError(e?.message || 'Помилка видалення');
      } finally {
         setDeleting(false);
      }
   };

   const closeExecuteDialog = () => {
      setExecuteDepositItem(null);
      setExecuteForm({
         result: 'completed_success',
         occurredAt: toDatetimeLocal(),
         placeType: 'notary',
         placeName: '',
         note: '',
      });
   };

   const submitExecutePers = async () => {
      if (!executeDepositItem?._id) return;

      if (!isMongoObjectId(executeDepositItem._id)) {
         closeExecuteDialog();
         return;
      }

      try {
         setExecutingPers(true);
         setError('');

         const res = await fetch(`/api/crm/finance-events/${executeDepositItem._id}/reregistration`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
               result: executeForm.result,
               occurredAt: executeForm.occurredAt,
               placeType: executeForm.placeType,
               placeName: executeForm.placeName,
               note: executeForm.note,
            }),
         });

         const data = await res.json().catch(() => null);
         if (!res.ok) throw new Error(data?.error || 'Не вдалося створити ПЕРС');

         setFinanceItems((prev) =>
            sortOperationEvents([
               data.item,
               ...prev.map((item) =>
                  item._id === executeDepositItem._id
                     ? {
                        ...item,
                        status: executeForm.result,
                        reregistrationEvent: data.item?._id,
                     }
                     : item
               ),
            ])
         );
         closeExecuteDialog();
      } catch (e) {
         console.error(e);
         setError(e?.message || 'Помилка створення ПЕРС');
      } finally {
         setExecutingPers(false);
      }
   };

   const renderTimelineItem = (item) =>
      item.kind === 'preDepositEvent' || item.type === 'pzs' ? (
         <PreDepositEventRowCompact
            key={item._id}
            item={item}
            theme={theme}
            mode={mode}
            canManage={canManageOperationItem(item)}
            onAddStep={openPzsStepDialog}
            onEdit={openEditDialog}
            onDelete={setDeleteItem}
            onEditStep={openPzsStepEditDialog}
            onDeleteStep={deletePzsStep}
         />
      ) : item.kind === 'financeEvent' ? (
         <FinanceEventRowCompact
            key={item._id}
            item={item}
            theme={theme}
            mode={mode}
            canManage={canManageFinanceItem(item)}
            onEdit={openFinanceEditDialog}
            onDelete={setDeleteFinanceItem}
            onExecute={(deposit) => {
               setExecuteDepositItem(deposit);
               setExecuteForm({
                  result: 'completed_success',
                  occurredAt: toDatetimeLocal(new Date(deposit.scheduledReregistrationAt || Date.now())),
                  placeType: 'notary',
                  placeName: deposit.notary || '',
                  note: '',
               });
            }}
         />
      ) : item.type === 'review' || item.kind === 'reviewEvent' ? (
         <ReviewEventRowCompact
            key={item._id}
            item={item}
            theme={theme}
            mode={mode}
            canManage={canManageOperationItem(item)}
            onEdit={openEditDialog}
            onDelete={setDeleteItem}
         />
      ) : (
         <OperationRowCompact
            key={item._id}
            item={item}
            theme={theme}
            mode={mode}
            canManage={canManageOperationItem(item)}
            onEdit={openEditDialog}
            onDelete={setDeleteItem}
            linkedPzs={preDepositBySourceOperationId.get(String(item._id))}
            onOpenPreDeposit={openPreDepositFromShowing}
         />
      );

   return (
      <Box>
         <Stack spacing={2}>
            <Stack spacing={1.15}>
               <Stack spacing={0.5}>
                  <Typography sx={{ color: theme.text, fontSize: 25, fontWeight: 950 }}>
                     Операційка
                  </Typography>
                  <Typography sx={{ color: theme.textSoft, fontSize: 13 }}>
                     Покази, огляди й ключові результати роботи по об’єктах та покупцях
                  </Typography>
               </Stack>

               <Box
                  sx={{
                     display: 'flex',
                     alignItems: 'stretch',
                     gap: { xs: 1, md: 0.8 },
                     flexWrap: { xs: 'wrap', lg: 'nowrap' },
                     width: '100%',
                     overflowX: { xs: 'visible', lg: 'hidden' },
                  }}
               >
                  <Stack direction="row" spacing={{ xs: 1, md: 0.45 }} flexWrap="nowrap" useFlexGap sx={{ minWidth: 0 }}>
                     <MiniMetric label="всього" value={metrics.total} theme={theme} productCounts={metrics.productCounts.total} />
                     <MiniMetric label="покази" value={metrics.showings} theme={theme} accent={theme.accentLight} initiativeCount={metrics.initiativeShowings} productCounts={metrics.productCounts.showings} />
                     <MiniMetric label="огляди" value={metrics.reviews} theme={theme} productCounts={metrics.productCounts.reviews} />
                     <MiniMetric label="нові клієнти" value={metrics.newClients} theme={theme} accent="#38bdf8" productCounts={metrics.productCounts.newClients} />
                     <MiniMetric label="нові об’єкти" value={metrics.newObjects} theme={theme} accent="#14b8a6" productCounts={metrics.productCounts.newObjects} />
                     <MiniMetric label="ПЗС" value={metrics.pzs} theme={theme} accent="#f472b6" productCounts={metrics.productCounts.pzs} />
                  </Stack>

                  <Stack
                     direction="row"
                     spacing={{ xs: 1, md: 0.45 }}
                     flexWrap="nowrap"
                     useFlexGap
                     sx={{
                        minWidth: 0,
                        pl: { lg: 0.8 },
                        borderLeft: { lg: `1px solid ${theme.border}` },
                     }}
                  >
                     <MiniMetric label="ЗС" value={metrics.deposits} theme={theme} accent="#22c55e" productCounts={metrics.productCounts.deposits} />
                     <MiniMetric label="ПЕРС" value={metrics.pers} theme={theme} accent="#a855f7" productCounts={metrics.productCounts.pers} />
                  </Stack>

                  <Box sx={{ ml: { lg: 'auto' }, flexShrink: 0, minWidth: 0 }}>
                     <LeaderSummaryCard metrics={metrics} theme={theme} mode={mode} />
                  </Box>
               </Box>
            </Stack>

            <Stack
               sx={{
                  display: 'flex',
                  flexDirection: 'row',
                  flexWrap: 'wrap',
                  gap: 0.5,
                  alignItems: 'center',
                  overflowX: 'hidden',
                  p: 0.7,
                  borderRadius: 2.5,
                  bgcolor: mode === 'light' ? 'rgba(124,58,237,0.045)' : 'rgba(255,255,255,0.035)',
                  border: `1px solid ${theme.border}`,
                  '& > *': {
                     flexShrink: 1,
                  },
                  '& .MuiInputBase-root': {
                     minHeight: 36,
                  },
                  '& .MuiInputBase-input': {
                     py: '7px',
                  },
               }}
            >
               <TextField
                  size="small"
                  type="date"
                  label="Дата з"
                  value={dateFromFilter}
                  onChange={(e) => setDateFromFilter(e.target.value)}
                  sx={{ ...fieldSx, width: 135 }}
                  InputLabelProps={{ shrink: true }}
               />

               <TextField
                  size="small"
                  type="date"
                  label="Дата до"
                  value={dateToFilter}
                  onChange={(e) => setDateToFilter(e.target.value)}
                  sx={{ ...fieldSx, width: 135 }}
                  InputLabelProps={{ shrink: true }}
               />

                <TextField
                   label="Опис"
                   placeholder="Пошук по опису, причині, нотатках..."
                  size="small"
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  sx={{ ...fieldSx, width: { xs: '100%', md: 280, xl: 380 }, flexGrow: 1 }}
                  InputProps={{
                     startAdornment: (
                        <InputAdornment position="start">
                           <SearchRoundedIcon sx={{ color: theme.textSoft }} />
                        </InputAdornment>
                     ),
                   }}
                />

                <Box sx={{ width: { xs: '100%', sm: 250 } }}>
                   <FinancialProductSelect
                      value={financialProductFilter}
                      onChange={setFinancialProductFilter}
                      label="Фінпродукт"
                      fieldSx={fieldSx}
                      menuProps={menuProps}
                      size="small"
                   />
                </Box>

                <TextField
                   select
                   size="small"
                  label="Групування"
                  value={timelineGroupMode}
                  onChange={(e) => setTimelineGroupMode(e.target.value)}
                  sx={{ ...fieldSx, width: { xs: '100%', sm: 160 } }}
                  SelectProps={{ MenuProps: menuProps }}
               >
                  {TIMELINE_GROUP_OPTIONS.map((option) => (
                     <MenuItem key={option.value} value={option.value}>
                        {option.label}
                     </MenuItem>
                  ))}
               </TextField>

               <Tooltip title="Скинути фільтри">
                  <IconButton
                      onClick={() => {
                          setQ('');
                          setDateFromFilter('');
                           setDateToFilter('');
                           setTypeFilter('');
                          setFinancialProductFilter('');
                          setResultFilter('');
                         setResultObjectFilter('');
                         setResultBuyerFilter('');
                         setEmployeeFilter('');
                        setPropertyFilter('');
                        setLeadFilter('');
                     }}
                     sx={{
                        width: 36,
                        height: 36,
                        borderRadius: 2,
                        color: theme.text,
                        border: `1px solid ${theme.border}`,
                        bgcolor: 'rgba(255,255,255,0.035)',
                     }}
                  >
                     <RestartAltRoundedIcon fontSize="small" />
                  </IconButton>
                </Tooltip>

                <Tooltip title="Додати ПЗС">
                   <IconButton
                      onClick={openPreDepositDialog}
                      sx={{
                         width: 36,
                         height: 36,
                         borderRadius: 2,
                         color: mode === 'light' ? '#fff' : '#18051d',
                        background: 'linear-gradient(90deg, #ec4899, #f472b6)',
                        boxShadow: '0 14px 30px rgba(236,72,153,0.22)',
                         '&:hover': {
                           background: 'linear-gradient(90deg, #db2777, #ec4899)',
                         },
                      }}
                   >
                      <MovingRoundedIcon />
                   </IconButton>
                </Tooltip>

                <Tooltip title="Додати завдаток">
                   <IconButton
                      onClick={() => {
                         resetDepositForm();
                         setOpenDepositCreate(true);
                      }}
                      sx={{
                          width: 36,
                          height: 36,
                         borderRadius: 2,
                         color: mode === 'light' ? '#fff' : '#04130a',
                         background: 'linear-gradient(90deg, #16a34a, #86efac)',
                         boxShadow: '0 14px 30px rgba(34,197,94,0.20)',
                         '&:hover': {
                            background: 'linear-gradient(90deg, #15803d, #4ade80)',
                         },
                      }}
                   >
                      <HandshakeRoundedIcon />
                   </IconButton>
                </Tooltip>

                <Tooltip title="Додати показ">
                   <IconButton
                     onClick={() => {
                        resetForm();
                        setOpenCreate(true);
                     }}
                     sx={{
                        width: 36,
                        height: 36,
                        borderRadius: 2,
                        color: mode === 'light' ? '#fff' : '#101014',
                        background: `linear-gradient(90deg, ${theme.accent}, ${theme.accentLight})`,
                        boxShadow: `0 14px 30px ${theme.glow}`,
                        '&:hover': {
                           background: `linear-gradient(90deg, ${theme.accent}, ${theme.accentLight})`,
                        },
                     }}
                  >
                     <AddRoundedIcon />
                  </IconButton>
               </Tooltip>

            </Stack>

            {!!error && <Alert severity="error" sx={{ borderRadius: 2 }}>{error}</Alert>}

            {loading ? (
               <Stack alignItems="center" sx={{ py: 8 }}>
                  <CircularProgress />
               </Stack>
            ) : (
               <Stack spacing={1}>
                  <TimelineColumnHeader
                     theme={theme}
                     mode={mode}
                     fieldSx={fieldSx}
                     menuProps={menuProps}
                     employees={employees}
                     properties={properties}
                     leads={leads}
                      selectedEmployeeFilter={selectedEmployeeFilter}
                      selectedPropertyFilter={selectedPropertyFilter}
                      selectedLeadFilter={selectedLeadFilter}
                      typeFilter={typeFilter}
                     resultFilter={resultFilter}
                     resultObjectFilter={resultObjectFilter}
                     resultBuyerFilter={resultBuyerFilter}
                      setEmployeeFilter={setEmployeeFilter}
                      setPropertyFilter={setPropertyFilter}
                      setLeadFilter={setLeadFilter}
                      setTypeFilter={setTypeFilter}
                     setResultFilter={setResultFilter}
                     setResultObjectFilter={setResultObjectFilter}
                     setResultBuyerFilter={setResultBuyerFilter}
                     setPropertySearch={setPropertySearch}
                     setLeadSearch={setLeadSearch}
                     rememberPropertyOption={rememberPropertyOption}
                     rememberLeadOption={rememberLeadOption}
                     renderPropertyOption={renderPropertyOption}
                     renderLeadOption={renderLeadOption}
                     propertiesLoading={propertiesLoading}
                     leadsLoading={leadsLoading}
                  />
                  {timelineItems.length === 0 ? (
                     <Box
                        sx={{
                           py: 8,
                           textAlign: 'center',
                           borderRadius: 2.5,
                           border: `1px solid ${theme.border}`,
                           bgcolor: 'rgba(255,255,255,0.025)',
                        }}
                     >
                        <Typography sx={{ color: theme.text, fontWeight: 950 }}>За цими фільтрами подій немає</Typography>
                        <Typography sx={{ color: theme.textSoft, mt: 0.5 }}>Зміни фільтр у хедері або скинь фільтри зверху.</Typography>
                     </Box>
                  ) : timelineGroups.map((group) => (
                     <Stack key={group.key} spacing={1}>
                        <TimelinePeriodHeader group={group} theme={theme} mode={mode} />
                        {group.items.map(renderTimelineItem)}
                     </Stack>
                  ))}
               </Stack>
            )}
         </Stack>

          <Dialog
            open={openDepositCreate || !!editingFinanceItem}
            onClose={() => {
               if (!saving) {
                  setOpenDepositCreate(false);
                  setEditingFinanceItem(null);
               }
            }}
            fullWidth
            maxWidth="lg"
            PaperProps={{
               sx: {
                  bgcolor: theme.bgPanel,
                  color: theme.text,
                  borderRadius: 3,
                  border: `1px solid rgba(34,197,94,0.35)`,
               },
            }}
          >
            <DialogTitle sx={{ fontWeight: 950, pb: 1 }}>
               {editingFinanceItem ? `Редагувати ${editingFinanceItem.financeType === 'reregistration' ? 'ПЕРС' : 'завдаток'}` : 'Новий завдаток'}
            </DialogTitle>
            <DialogContent sx={{ pt: '20px !important' }}>
               <Grid container spacing={1.3}>
                  <Grid item xs={12} md={6}>
                     <Autocomplete
                        options={properties}
                        value={selectedDepositProperty}
                        onChange={(_, value) => {
                           rememberPropertyOption(value);
                           updateDepositForm('property', value?._id || '');
                        }}
                        onInputChange={(_, value, reason) => {
                           if (reason === 'input') setPropertySearch(value);
                        }}
                        getOptionLabel={(option) => propertyTitle(option)}
                        isOptionEqualToValue={(option, value) => option?._id === value?._id}
                        filterOptions={(options) => options}
                        loading={propertiesLoading}
                        noOptionsText={propertySearch.trim().length >= PROPERTY_MIN_SEARCH_LENGTH ? 'Не знайдено' : `Введи мінімум ${PROPERTY_MIN_SEARCH_LENGTH} символів`}
                        renderOption={renderPropertyOption}
                        renderInput={(params) => <TextField {...params} label="Об’єкт" sx={fieldSx} />}
                        PaperComponent={(props) => <Box {...props} sx={{ minWidth: { xs: 320, sm: 560 }, bgcolor: theme.bgPanel, color: theme.text, border: `1px solid ${theme.border}` }} />}
                        ListboxProps={{ sx: { maxHeight: 360 } }}
                     />
                  </Grid>
                  <Grid item xs={12} md={6}>
                     <Autocomplete
                        options={leads}
                        value={selectedDepositLead}
                        onChange={(_, value) => {
                           rememberLeadOption(value);
                           updateDepositForm('lead', value?._id || '');
                        }}
                        onInputChange={(_, value, reason) => {
                           if (reason === 'input') setLeadSearch(value);
                        }}
                        getOptionLabel={(option) => option?.name || ''}
                        isOptionEqualToValue={(option, value) => option?._id === value?._id}
                        filterOptions={(options) => options}
                        loading={leadsLoading}
                        noOptionsText={leadSearch.trim().length >= LEAD_MIN_SEARCH_LENGTH ? 'Не знайдено' : `Введи мінімум ${LEAD_MIN_SEARCH_LENGTH} символів`}
                        renderOption={renderLeadOption}
                        renderInput={(params) => <TextField {...params} label="Клієнт" sx={fieldSx} />}
                        PaperComponent={(props) => <Box {...props} sx={{ minWidth: { xs: 320, sm: 520 }, bgcolor: theme.bgPanel, color: theme.text, border: `1px solid ${theme.border}` }} />}
                        ListboxProps={{ sx: { maxHeight: 360 } }}
                     />
                  </Grid>

                  <Grid item xs={12} md={4}>
                     <TextField fullWidth type="datetime-local" label="Дата завдатку" value={depositForm.occurredAt} onChange={(e) => updateDepositForm('occurredAt', e.target.value)} sx={fieldSx} InputLabelProps={{ shrink: true }} />
                  </Grid>
                  <Grid item xs={12} md={4}>
                     <FinancialProductSelect value={depositForm.financialProduct} onChange={(value) => updateDepositForm('financialProduct', value)} fieldSx={fieldSx} menuProps={menuProps} />
                  </Grid>
                  <Grid item xs={12} md={4}>
                     <TextField select fullWidth label="Хто оформляв" value={depositForm.processedByEmployee} onChange={(e) => updateDepositForm('processedByEmployee', e.target.value)} sx={fieldSx} SelectProps={{ MenuProps: menuProps }}>
                        <MenuItem value="">—</MenuItem>
                        {employees.map((emp) => <MenuItem key={emp._id} value={emp._id}>{employeeName(emp)}</MenuItem>)}
                     </TextField>
                  </Grid>
                  <Grid item xs={12} md={4}>
                     <TextField select fullWidth label="Відповідальний" value={depositForm.responsibleEmployee} onChange={(e) => updateDepositForm('responsibleEmployee', e.target.value)} sx={fieldSx} SelectProps={{ MenuProps: menuProps }}>
                        <MenuItem value="">—</MenuItem>
                        {employees.map((emp) => <MenuItem key={emp._id} value={emp._id}>{employeeName(emp)}</MenuItem>)}
                     </TextField>
                  </Grid>

                  <Grid item xs={12} md={2}>
                     <TextField select fullWidth label="Рієлтор об’єкта" value={depositForm.objectRealtorKind} onChange={(e) => updateDepositForm('objectRealtorKind', e.target.value)} sx={fieldSx} SelectProps={{ MenuProps: menuProps }}>
                        <MenuItem value="employee">Наш</MenuItem>
                        <MenuItem value="partner">СП</MenuItem>
                        <MenuItem value="none">Нема</MenuItem>
                     </TextField>
                  </Grid>
                  <Grid item xs={12} md={4}>
                     {depositForm.objectRealtorKind === 'partner' ? (
                        <TextField fullWidth label="Ім’я СП по об’єкту" value={depositForm.objectPartnerName} onChange={(e) => updateDepositForm('objectPartnerName', e.target.value)} sx={fieldSx} />
                     ) : (
                        <TextField select fullWidth label="Наш рієлтор по об’єкту" value={depositForm.objectRealtorEmployee} onChange={(e) => updateDepositForm('objectRealtorEmployee', e.target.value)} sx={fieldSx} SelectProps={{ MenuProps: menuProps }} disabled={depositForm.objectRealtorKind === 'none'}>
                           <MenuItem value="">—</MenuItem>
                           {employees.map((emp) => <MenuItem key={emp._id} value={emp._id}>{employeeName(emp)}</MenuItem>)}
                        </TextField>
                     )}
                  </Grid>
                  <Grid item xs={12} md={2}>
                     <TextField select fullWidth label="Рієлтор покупця" value={depositForm.buyerRealtorKind} onChange={(e) => updateDepositForm('buyerRealtorKind', e.target.value)} sx={fieldSx} SelectProps={{ MenuProps: menuProps }}>
                        <MenuItem value="employee">Наш</MenuItem>
                        <MenuItem value="partner">СП</MenuItem>
                        <MenuItem value="none">Нема</MenuItem>
                     </TextField>
                  </Grid>
                  <Grid item xs={12} md={4}>
                     {depositForm.buyerRealtorKind === 'partner' ? (
                        <TextField fullWidth label="Ім’я СП по покупцю" value={depositForm.buyerPartnerName} onChange={(e) => updateDepositForm('buyerPartnerName', e.target.value)} sx={fieldSx} />
                     ) : (
                        <TextField select fullWidth label="Наш рієлтор по покупцю" value={depositForm.buyerRealtorEmployee} onChange={(e) => updateDepositForm('buyerRealtorEmployee', e.target.value)} sx={fieldSx} SelectProps={{ MenuProps: menuProps }} disabled={depositForm.buyerRealtorKind === 'none'}>
                           <MenuItem value="">—</MenuItem>
                           {employees.map((emp) => <MenuItem key={emp._id} value={emp._id}>{employeeName(emp)}</MenuItem>)}
                        </TextField>
                     )}
                  </Grid>

                  <Grid item xs={12} md={4}>
                     <TextField select fullWidth label="Рівень легкості" value={depositForm.tensionLevel} onChange={(e) => updateDepositForm('tensionLevel', Number(e.target.value))} sx={fieldSx} SelectProps={{ MenuProps: menuProps }}>
                        {[1, 2, 3, 4, 5].map((value) => (
                           <MenuItem key={value} value={value}>{TENSION_LABELS[value]}</MenuItem>
                        ))}
                     </TextField>
                  </Grid>
                  <Grid item xs={12} md={4}>
                     <TextField fullWidth label="Місце проведення" value={depositForm.location} onChange={(e) => updateDepositForm('location', e.target.value)} sx={fieldSx} />
                  </Grid>
                  <Grid item xs={12} md={4}>
                     <TextField fullWidth label="Нотаріус / сторона" value={depositForm.notary} onChange={(e) => updateDepositForm('notary', e.target.value)} sx={fieldSx} />
                  </Grid>

                  {editingFinanceItem && (
                     <Grid item xs={12} md={4}>
                        <TextField select fullWidth label="Статус" value={depositForm.status} onChange={(e) => updateDepositForm('status', e.target.value)} sx={fieldSx} SelectProps={{ MenuProps: menuProps }}>
                           <MenuItem value="waiting">Чекає</MenuItem>
                           <MenuItem value="completed_success">Виконано успішно</MenuItem>
                           <MenuItem value="completed_improved">Виконано з покращенням</MenuItem>
                           <MenuItem value="completed_worse">Виконано з погіршенням</MenuItem>
                           <MenuItem value="failed">Зірвано</MenuItem>
                        </TextField>
                     </Grid>
                  )}

                  {editingFinanceItem?.financeType === 'reregistration' && (
                     <>
                        <Grid item xs={12} md={4}>
                           <TextField select fullWidth label="Де проводили" value={depositForm.reregistrationPlaceType} onChange={(e) => updateDepositForm('reregistrationPlaceType', e.target.value)} sx={fieldSx} SelectProps={{ MenuProps: menuProps }}>
                              <MenuItem value="notary">Нотаріус</MenuItem>
                              <MenuItem value="developer_sales">Відділ продажу</MenuItem>
                              <MenuItem value="other">Інше</MenuItem>
                           </TextField>
                        </Grid>
                        <Grid item xs={12} md={4}>
                           <TextField fullWidth label="Назва місця ПЕРС" value={depositForm.reregistrationPlaceName} onChange={(e) => updateDepositForm('reregistrationPlaceName', e.target.value)} sx={fieldSx} />
                        </Grid>
                     </>
                  )}

                  {editingFinanceItem?.financeType !== 'reregistration' && (
                     <>
                  <Grid item xs={12} md={6}>
                     <TextField fullWidth type="date" label="Дедлайн переоформлення" value={depositForm.deadlineAt} onChange={(e) => updateDepositForm('deadlineAt', e.target.value)} sx={fieldSx} InputLabelProps={{ shrink: true }} />
                  </Grid>
                  <Grid item xs={12} md={6}>
                     <TextField fullWidth type="datetime-local" label="Плановий час ПЕРС" value={depositForm.scheduledReregistrationAt} onChange={(e) => updateDepositForm('scheduledReregistrationAt', e.target.value)} sx={fieldSx} InputLabelProps={{ shrink: true }} />
                  </Grid>
                     </>
                  )}

                  <Grid item xs={12} md={4}>
                     <TextField fullWidth multiline minRows={3} label="Умови продавця" value={depositForm.sellerConditions} onChange={(e) => updateDepositForm('sellerConditions', e.target.value)} sx={fieldSx} />
                  </Grid>
                  <Grid item xs={12} md={4}>
                     <TextField fullWidth multiline minRows={3} label="Умови покупця" value={depositForm.buyerConditions} onChange={(e) => updateDepositForm('buyerConditions', e.target.value)} sx={fieldSx} />
                  </Grid>
                  <Grid item xs={12} md={4}>
                     <TextField fullWidth multiline minRows={3} label="Умови агентства" value={depositForm.agencyConditions} onChange={(e) => updateDepositForm('agencyConditions', e.target.value)} sx={fieldSx} />
                  </Grid>
                  <Grid item xs={12}>
                     <TextField fullWidth multiline minRows={2} label="Нотатка" value={depositForm.note} onChange={(e) => updateDepositForm('note', e.target.value)} sx={fieldSx} />
                  </Grid>
                  {editingFinanceItem && (
                     <Grid item xs={12}>
                        <TextField fullWidth multiline minRows={2} label="Підсумок" value={depositForm.resultSummary} onChange={(e) => updateDepositForm('resultSummary', e.target.value)} sx={fieldSx} />
                     </Grid>
                  )}
               </Grid>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 2 }}>
               <Button onClick={() => { setOpenDepositCreate(false); setEditingFinanceItem(null); }} disabled={saving} sx={{ color: theme.text }}>
                  Закрити
               </Button>
               <Button
                  variant="contained"
                  onClick={editingFinanceItem ? submitFinanceEdit : submitDeposit}
                  disabled={saving}
                  sx={{ bgcolor: '#16a34a', color: '#fff', fontWeight: 900, '&:hover': { bgcolor: '#15803d' } }}
               >
                  {editingFinanceItem ? 'Зберегти зміни' : 'Створити завдаток'}
               </Button>
            </DialogActions>
          </Dialog>

          <Dialog
            open={!!executeDepositItem}
            onClose={closeExecuteDialog}
            fullWidth
            maxWidth="sm"
            PaperProps={{
               sx: {
                  bgcolor: theme.bgPanel,
                  color: theme.text,
                  borderRadius: 3,
                  border: `1px solid rgba(168,85,247,0.35)`,
                  boxShadow: '0 24px 70px rgba(168,85,247,0.18)',
               },
            }}
          >
            <DialogTitle sx={{ fontWeight: 950, pb: 1 }}>
               Виконати ПЕРС із завдатку
            </DialogTitle>
            <DialogContent sx={{ pt: '16px !important' }}>
               <Stack spacing={1.2}>
                  <Box sx={{ p: 1.2, borderRadius: 2, border: `1px solid ${theme.border}`, bgcolor: 'rgba(168,85,247,0.07)' }}>
                     <Typography sx={{ color: theme.text, fontWeight: 950, fontSize: 13 }} noWrap>
                        {propertyTitle(executeDepositItem?.property)}
                     </Typography>
                     <Typography sx={{ color: theme.textSoft, fontSize: 12 }} noWrap>
                        Клієнт: {executeDepositItem?.lead?.name || '—'} · Звʼязок: {executeDepositItem?._id || '—'}
                     </Typography>
                  </Box>

                  <TextField
                     select
                     fullWidth
                     size="small"
                     label="Результат переоформлення"
                     value={executeForm.result}
                     onChange={(e) => setExecuteForm((prev) => ({ ...prev, result: e.target.value }))}
                     sx={fieldSx}
                     SelectProps={{ MenuProps: menuProps }}
                  >
                     <MenuItem value="completed_success">Норма / виконано успішно</MenuItem>
                     <MenuItem value="completed_improved">Виконано з покращенням</MenuItem>
                     <MenuItem value="completed_worse">Виконано з погіршенням</MenuItem>
                     <MenuItem value="failed">Зірвано</MenuItem>
                  </TextField>

                  <TextField
                     fullWidth
                     size="small"
                     type="datetime-local"
                     label="Дата і час ПЕРС"
                     value={executeForm.occurredAt}
                     onChange={(e) => setExecuteForm((prev) => ({ ...prev, occurredAt: e.target.value }))}
                     sx={fieldSx}
                     InputLabelProps={{ shrink: true }}
                  />

                  <Grid container spacing={1}>
                     <Grid item xs={12} sm={5}>
                        <TextField
                           select
                           fullWidth
                           size="small"
                           label="Де проводили"
                           value={executeForm.placeType}
                           onChange={(e) => setExecuteForm((prev) => ({ ...prev, placeType: e.target.value }))}
                           sx={fieldSx}
                           SelectProps={{ MenuProps: menuProps }}
                        >
                           <MenuItem value="notary">Нотаріус</MenuItem>
                           <MenuItem value="developer_sales">Відділ продажу</MenuItem>
                           <MenuItem value="other">Інше</MenuItem>
                        </TextField>
                     </Grid>
                     <Grid item xs={12} sm={7}>
                        <TextField
                           fullWidth
                           size="small"
                           label="Назва місця / відповідальна сторона"
                           value={executeForm.placeName}
                           onChange={(e) => setExecuteForm((prev) => ({ ...prev, placeName: e.target.value }))}
                           sx={fieldSx}
                        />
                     </Grid>
                  </Grid>

                  <TextField
                     fullWidth
                     multiline
                     minRows={3}
                     label="Нотатка по виконанню"
                     placeholder="Що змінилось, як пройшло, чому зірвано або що покращили..."
                     value={executeForm.note}
                     onChange={(e) => setExecuteForm((prev) => ({ ...prev, note: e.target.value }))}
                     sx={fieldSx}
                  />
               </Stack>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 2 }}>
               <Button onClick={closeExecuteDialog} disabled={executingPers} sx={{ color: theme.text }}>
                  Закрити
               </Button>
               <Button
                  variant="contained"
                  onClick={submitExecutePers}
                  disabled={executingPers}
                  sx={{
                     bgcolor: '#a855f7',
                     color: '#fff',
                     fontWeight: 900,
                     '&:hover': { bgcolor: '#9333ea' },
                  }}
               >
                  {isMongoObjectId(executeDepositItem?._id) ? 'Створити ПЕРС' : 'Демо: створити ПЕРС'}
               </Button>
            </DialogActions>
          </Dialog>

          <Dialog
             open={!!pzsStepItem}
             onClose={closePzsStepDialog}
             fullWidth
             maxWidth="sm"
             PaperProps={{
                sx: {
                   bgcolor: theme.bgPanel,
                   color: theme.text,
                   borderRadius: 3,
                  border: '1px solid rgba(236,72,153,0.40)',
                  boxShadow: '0 24px 70px rgba(236,72,153,0.18)',
                },
             }}
          >
            <DialogTitle sx={{ fontWeight: 950, pb: 1 }}>
               <Stack direction="row" spacing={1} alignItems="center">
                  <MovingRoundedIcon sx={{ color: '#f472b6' }} />
                  <Stack spacing={0.15}>
                     <Typography sx={{ color: theme.text, fontWeight: 950 }}>
                         {editingPzsStepIndex !== null ? 'Редагувати крок ПЗС' : 'Крок ПЗС'}
                     </Typography>
                     <Typography sx={{ color: theme.textSoft, fontSize: 12 }} noWrap>
                        {propertyTitle(pzsStepItem?.property)} · {pzsStepItem?.lead?.name || 'Без покупця'}
                     </Typography>
                  </Stack>
               </Stack>
            </DialogTitle>
            <DialogContent sx={{ pt: '16px !important' }}>
               <Stack spacing={1.2}>
                  <TextField
                     select
                     fullWidth
                     size="small"
                     label="Тип кроку"
                     value={pzsStepForm.type}
                     onChange={(e) => setPzsStepForm((prev) => ({ ...prev, type: e.target.value }))}
                     sx={fieldSx}
                     SelectProps={{ MenuProps: menuProps }}
                  >
                     {PZS_STEP_OPTIONS
                        .filter((option) => editingPzsStepIndex === null || option.value !== 'deposit' || pzsStepForm.type === 'deposit')
                        .map((option) => {
                        const Icon = option.icon;
                        return (
                           <MenuItem key={option.value} value={option.value}>
                              <Stack direction="row" spacing={1} alignItems="center">
                                 <Icon sx={{ fontSize: 18, color: option.color }} />
                                 <span>{option.label}</span>
                              </Stack>
                           </MenuItem>
                        );
                     })}
                  </TextField>

                  <TextField
                     fullWidth
                     size="small"
                     type="datetime-local"
                     label="Дата кроку"
                     value={pzsStepForm.at}
                     onChange={(e) => setPzsStepForm((prev) => ({ ...prev, at: e.target.value }))}
                     sx={fieldSx}
                     InputLabelProps={{ shrink: true }}
                  />

                  <TextField
                     fullWidth
                     multiline
                     minRows={3}
                     label={pzsStepForm.type === 'failed' ? 'Причина зриву' : pzsStepForm.type === 'deposit' ? 'Коментар до завдатку' : 'Опис кроку'}
                     placeholder={
                        pzsStepForm.type === 'failed'
                           ? 'Чому ПЗС зірвано...'
                           : pzsStepForm.type === 'deposit'
                              ? 'Що виконано, які умови переносимо в завдаток...'
                              : 'Що обговорили, що домовились, який наступний рух...'
                     }
                     value={pzsStepForm.text}
                     onChange={(e) => setPzsStepForm((prev) => ({ ...prev, text: e.target.value }))}
                     sx={fieldSx}
                  />

                  {editingPzsStepIndex === null && pzsStepForm.type === 'deposit' && (
                     <Alert severity="success" sx={{ borderRadius: 2 }}>
                        Відкриється форма завдатку з прив’язкою до цього ПЗС. Сам ПЗС закриється після створення ЗС.
                     </Alert>
                  )}
                  {pzsStepForm.type === 'failed' && (
                     <Alert severity="warning" sx={{ borderRadius: 2 }}>
                        ПЗС буде закрито як зірваний і залишиться в хронології.
                     </Alert>
                  )}
               </Stack>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 2 }}>
               <Button onClick={closePzsStepDialog} disabled={savingPzsStep} sx={{ color: theme.text }}>
                  Закрити
               </Button>
               <Button
                  variant="contained"
                  onClick={submitPzsStep}
                  disabled={savingPzsStep || !pzsStepForm.text.trim()}
                  sx={{
                     bgcolor: PZS_STEP_OPTIONS.find((option) => option.value === pzsStepForm.type)?.color || '#ec4899',
                     color: '#fff',
                     fontWeight: 900,
                     '&:hover': { bgcolor: PZS_STEP_OPTIONS.find((option) => option.value === pzsStepForm.type)?.color || '#db2777' },
                  }}
               >
                  {savingPzsStep ? 'Зберігаю...' : editingPzsStepIndex !== null ? 'Оновити крок' : pzsStepForm.type === 'deposit' ? 'Перейти до ЗС' : 'Зберегти крок'}
               </Button>
            </DialogActions>
          </Dialog>

          <Dialog
             open={openCreate || !!editingItem}
             onClose={closeOperationDialog}
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
               <Stack direction="row" spacing={1} alignItems="center">
                  {form.type === 'pzs' && <MovingRoundedIcon sx={{ color: '#f472b6' }} />}
                  {form.type === 'review' && <ExploreRoundedIcon sx={{ color: '#38bdf8' }} />}
                   <Typography sx={{ fontWeight: 950, color: theme.text }}>
                       {editingItem ? (form.type === 'pzs' ? 'Редагувати ПЗС' : form.type === 'review' ? 'Редагувати огляд' : 'Редагувати подію') : form.type === 'pzs' ? 'Нова ПЗС' : form.type === 'review' ? 'Новий огляд' : 'Новий показ'}
                   </Typography>
                   {form.type === 'pzs' && (
                     <Chip
                        size="small"
                        label="Передзавдаткова стадія"
                        sx={{
                           height: 24,
                           color: '#f5d0fe',
                           fontWeight: 900,
                           bgcolor: 'rgba(236,72,153,0.15)',
                           border: '1px solid rgba(236,72,153,0.40)',
                        }}
                      />
                   )}
                   {form.type === 'review' && (
                      <Chip
                         size="small"
                         label="Не взято в роботу"
                         sx={{
                            height: 24,
                            color: '#99f6e4',
                            fontWeight: 900,
                            bgcolor: 'rgba(14,165,233,0.15)',
                            border: '1px solid rgba(14,165,233,0.38)',
                         }}
                      />
                   )}
                </Stack>
            </DialogTitle>
            <DialogContent sx={{ pt: '20px !important' }}>
               <Grid container spacing={1.3} sx={{ pt: 0.5 }}>
                  {form.type === 'pzs' ? (
                     <>
                        <Grid item xs={12}>
                           <Box
                              sx={{
                                 display: 'grid',
                                  gridTemplateColumns: { xs: '1fr', md: '100px 185px 0.95fr 150px 1.05fr 0.9fr' },
                                 gap: 1.3,
                                 alignItems: 'start',
                              }}
                           >
                              <TextField select fullWidth label="Тип" value={form.type} onChange={(e) => updateForm('type', e.target.value)} sx={fieldSx} SelectProps={{ MenuProps: menuProps }}>
                                 {EVENT_TYPES.map((x) => <MenuItem key={x.value} value={x.value}>{x.label}</MenuItem>)}
                              </TextField>
                              <TextField fullWidth type="datetime-local" label="Дата і час" value={form.occurredAt} onChange={(e) => updateForm('occurredAt', e.target.value)} sx={fieldSx} InputLabelProps={{ shrink: true }} />
                               <TextField select fullWidth label="Відповідальний" value={form.responsibleEmployee} onChange={(e) => updateForm('responsibleEmployee', e.target.value)} sx={fieldSx} SelectProps={{ MenuProps: menuProps }}>
                                  <MenuItem value="">—</MenuItem>
                                  {employees.map((emp) => <MenuItem key={emp._id} value={emp._id}>{employeeName(emp)}</MenuItem>)}
                               </TextField>
                               <FinancialProductSelect value={form.financialProduct} onChange={(value) => updateForm('financialProduct', value)} fieldSx={fieldSx} menuProps={menuProps} />
                               <Autocomplete
                              options={showingOptions}
                              value={selectedSourceOperationEvent}
                              onChange={(_, value) => selectSourceShowing(value)}
                              onInputChange={(_, value, reason) => {
                                 if (reason === 'input') setSourceShowingSearch(value);
                              }}
                              getOptionLabel={(option) => option ? `${propertyTitle(option.property)} · ${option.lead?.name || 'Без покупця'}` : ''}
                              isOptionEqualToValue={(option, value) => option?._id === value?._id}
                              filterOptions={(options) => options}
                              loading={sourceShowingsLoading}
                              noOptionsText={sourceShowingSearch.trim().length >= SHOWING_MIN_SEARCH_LENGTH ? 'Не знайдено' : `Введи мінімум ${SHOWING_MIN_SEARCH_LENGTH} символів або вибери з останніх 20`}
                              renderOption={renderShowingOption}
                              renderInput={(params) => <TextField {...params} label="Пов’язаний показ" sx={fieldSx} />}
                                 PaperComponent={(props) => <Box {...props} sx={{ minWidth: { xs: 320, sm: 560 }, bgcolor: theme.bgPanel, color: theme.text, border: `1px solid ${theme.border}` }} />}
                                 ListboxProps={{ sx: { maxHeight: 360 } }}
                              />
                              <TextField
                                 fullWidth
                                 label="Звідки виникло"
                                 placeholder="Після показу / телефон / офіс"
                                 value={form.pzsSourceLabel}
                                 onChange={(e) => updateForm('pzsSourceLabel', e.target.value)}
                                 sx={fieldSx}
                              />
                           </Box>
                        </Grid>
                        <Grid item xs={12}>
                           <Box
                              sx={{
                                 p: 1.05,
                                 borderRadius: 2.4,
                                border: '1px solid rgba(236,72,153,0.40)',
                                bgcolor: mode === 'light' ? 'rgba(236,72,153,0.065)' : 'rgba(236,72,153,0.12)',
                              }}
                           >
                              <Stack direction="row" spacing={1} alignItems="center">
                                 <MovingRoundedIcon sx={{ color: '#f472b6' }} />
                                 <Stack spacing={0.1}>
                                    <Typography sx={{ color: theme.text, fontWeight: 950 }}>
                                       Передзавдаткова стадія
                                    </Typography>
                                    <Typography sx={{ color: theme.textSoft, fontSize: 12 }}>
                                       Зафіксуй чітку умову покупця, після якої він готовий дати завдаток.
                                    </Typography>
                                 </Stack>
                              </Stack>
                           </Box>
                        </Grid>
                     </>
                  ) : form.type === 'review' ? (
                     <>
                        <Grid item xs={12} md={2.4}>
                           <TextField select fullWidth label="Тип" value={form.type} onChange={(e) => updateForm('type', e.target.value)} sx={fieldSx} SelectProps={{ MenuProps: menuProps }}>
                              {EVENT_TYPES.map((x) => <MenuItem key={x.value} value={x.value}>{x.label}</MenuItem>)}
                           </TextField>
                        </Grid>
                        <Grid item xs={12} md={2.4}>
                           <TextField fullWidth type="datetime-local" label="Дата і час огляду" value={form.occurredAt} onChange={(e) => updateForm('occurredAt', e.target.value)} sx={fieldSx} InputLabelProps={{ shrink: true }} />
                        </Grid>
                        <Grid item xs={12} md={2.4}>
                           <TextField select fullWidth label="Відповідальний" value={form.responsibleEmployee} onChange={(e) => updateForm('responsibleEmployee', e.target.value)} sx={fieldSx} SelectProps={{ MenuProps: menuProps }}>
                              <MenuItem value="">—</MenuItem>
                              {employees.map((emp) => <MenuItem key={emp._id} value={emp._id}>{employeeName(emp)}</MenuItem>)}
                           </TextField>
                        </Grid>
                        <Grid item xs={12} md={2.4}>
                           <FinancialProductSelect value={form.financialProduct} onChange={(value) => updateForm('financialProduct', value)} fieldSx={fieldSx} menuProps={menuProps} />
                        </Grid>
                        <Grid item xs={12} md={2.4}>
                           <TextField select fullWidth label="Сценарій огляду" value={form.reviewResult} onChange={(e) => updateForm('reviewResult', e.target.value)} sx={fieldSx} SelectProps={{ MenuProps: menuProps }}>
                              {REVIEW_FORM_RESULT_OPTIONS.map((x) => <MenuItem key={x.value} value={x.value}>{x.label}</MenuItem>)}
                           </TextField>
                        </Grid>
                     </>
                  ) : (
                     <>
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
                           <FinancialProductSelect value={form.financialProduct} onChange={(value) => updateForm('financialProduct', value)} fieldSx={fieldSx} menuProps={menuProps} />
                        </Grid>
                        <Grid item xs={12} md={3}>
                           <TextField select fullWidth label="Результат показу" value={form.resultShowing} onChange={(e) => updateForm('resultShowing', e.target.value)} sx={fieldSx} SelectProps={{ MenuProps: menuProps }}>
                              {RESULT_SHOWING_OPTIONS.map((x) => <MenuItem key={x.value} value={x.value}>{x.label}</MenuItem>)}
                           </TextField>
                        </Grid>
                     </>
                  )}

                   {form.type === 'pzs' && (
                      <>
                         <Grid item xs={12}>
                            <TextField
                               fullWidth
                               multiline
                               minRows={2}
                               label="Умова ПЗС"
                               placeholder="Наприклад: покупець дає завдаток, якщо продавець погодить 84 000$ і залишить кухню"
                               value={form.pzsCondition}
                               onChange={(e) => updateForm('pzsCondition', e.target.value)}
                               sx={fieldSx}
                            />
                         </Grid>
                         {!editingItem && (
                            <Grid item xs={12}>
                               <TextField
                                  fullWidth
                                  multiline
                                  minRows={2}
                                  label="Перший крок / нотатка"
                                  placeholder="Що домовились зробити першим: дотиснути ціну, уточнити документи, погодити меблі..."
                                  value={form.pzsFirstStep}
                                  onChange={(e) => updateForm('pzsFirstStep', e.target.value)}
                                  sx={fieldSx}
                               />
                            </Grid>
                         )}
                      </>
                   )}

                   {form.type === 'showing' && (
                      <>
                         <Grid item xs={12} md={3}>
                  <TextField select fullWidth label="Ініціативність" value={form.showingKind} onChange={(e) => updateForm('showingKind', e.target.value)} sx={fieldSx} SelectProps={{ MenuProps: menuProps }}>
                              {SHOWING_KIND_OPTIONS.map((x) => <MenuItem key={x.value} value={x.value}>{x.label}</MenuItem>)}
                           </TextField>
                        </Grid>
                        <Grid item xs={12} md={3}>
                           <TextField select fullWidth label="Присутність" value={form.presenceType} onChange={(e) => updateForm('presenceType', e.target.value)} sx={fieldSx} SelectProps={{ MenuProps: menuProps }}>
                              {PRESENCE_TYPE_OPTIONS.map((x) => <MenuItem key={x.value} value={x.value}>{x.short} — {x.label}</MenuItem>)}
                           </TextField>
                        </Grid>
                        <Grid item xs={12} md={3}>
                           <TextField select fullWidth label="Хто показав" value={form.shownByEmployee} onChange={(e) => updateForm('shownByEmployee', e.target.value)} sx={fieldSx} SelectProps={{ MenuProps: menuProps }}>
                              <MenuItem value="">—</MenuItem>
                              {employees.map((emp) => <MenuItem key={emp._id} value={emp._id}>{employeeName(emp)}</MenuItem>)}
                           </TextField>
                        </Grid>
                        <Grid item xs={12} md={3}>
                           <TextField select fullWidth label="Хто сприяв" value={form.facilitatedByEmployee} onChange={(e) => updateForm('facilitatedByEmployee', e.target.value)} sx={fieldSx} SelectProps={{ MenuProps: menuProps }}>
                              <MenuItem value="">—</MenuItem>
                              {employees.map((emp) => <MenuItem key={emp._id} value={emp._id}>{employeeName(emp)}</MenuItem>)}
                           </TextField>
                        </Grid>
                     </>
                  )}

                  <Grid item xs={12}>
                     <Divider sx={{ borderColor: theme.border, my: 0.5 }} />
                  </Grid>

                  <Grid item xs={12} md={6}>
                     <Autocomplete
                        options={properties}
                        value={selectedProperty}
                        onChange={(_, value) => {
                           rememberPropertyOption(value);
                           updateForm('property', value?._id || '');
                        }}
                        onInputChange={(_, value, reason) => {
                           if (reason === 'input') setPropertySearch(value);
                        }}
                        getOptionLabel={(option) => propertyTitle(option)}
                        isOptionEqualToValue={(option, value) => option?._id === value?._id}
                        filterOptions={(options) => options}
                        loading={propertiesLoading}
                        noOptionsText={propertySearch.trim().length >= PROPERTY_MIN_SEARCH_LENGTH ? 'Не знайдено' : `Введи мінімум ${PROPERTY_MIN_SEARCH_LENGTH} символів`}
                        renderOption={renderPropertyOption}
                        renderInput={(params) => <TextField {...params} label={form.type === 'review' && (form.reviewResult === 'historical' || form.reviewResult === 'new_object') ? 'Об’єкт з Об’єктів' : 'Об’єкт'} sx={fieldSx} />}
                        PaperComponent={(props) => <Box {...props} sx={{ minWidth: { xs: 320, sm: 560 }, bgcolor: theme.bgPanel, color: theme.text, border: `1px solid ${theme.border}` }} />}
                        ListboxProps={{ sx: { maxHeight: 360 } }}
                     />
                  </Grid>
                  {form.type === 'review' && (form.reviewResult === 'historical' || form.reviewResult === 'new_object') && (
                      <Grid item xs={12} md={6}>
                         <Box
                            sx={{
                               minHeight: 56,
                               height: '100%',
                               px: 1.4,
                               py: 1,
                               borderRadius: 2,
                               border: form.reviewResult === 'new_object' ? '1px solid rgba(20,184,166,0.34)' : '1px solid rgba(56,189,248,0.30)',
                               bgcolor: form.reviewResult === 'new_object'
                                  ? (mode === 'light' ? 'rgba(20,184,166,0.055)' : 'rgba(20,184,166,0.10)')
                                  : (mode === 'light' ? 'rgba(56,189,248,0.055)' : 'rgba(56,189,248,0.10)'),
                               display: 'flex',
                               alignItems: 'center',
                               gap: 1,
                            }}
                         >
                            <ExploreRoundedIcon sx={{ color: form.reviewResult === 'new_object' ? '#2dd4bf' : '#38bdf8' }} />
                            <Stack spacing={0.15} sx={{ minWidth: 0 }}>
                               <Typography sx={{ color: theme.text, fontWeight: 950, lineHeight: 1.15 }}>
                                  {form.reviewResult === 'new_object' ? 'Огляд дав новий об’єкт' : 'Довнесення історії'}
                               </Typography>
                               <Typography sx={{ color: theme.textSoft, fontSize: 12, lineHeight: 1.25 }}>
                                  {form.reviewResult === 'new_object'
                                     ? 'Для об’єкта, який після огляду взяли в роботу. Картка піде як операційний результат “новий об’єкт”.'
                                     : 'Для об’єкта, який вже був у роботі, але огляд не потрапив у хронологію.'}
                               </Typography>
                            </Stack>
                         </Box>
                      </Grid>
                   )}
                  {form.type === 'review' && form.reviewResult === 'not_taken' && (
                     <>
                        <Grid item xs={12} md={5}>
                           <TextField select fullWidth label="Висновок по об’єкту" value={form.reviewObjectResult} onChange={(e) => updateForm('reviewObjectResult', e.target.value)} sx={fieldSx} SelectProps={{ MenuProps: menuProps }}>
                              {REVIEW_OBJECT_RESULT_OPTIONS.map((x) => <MenuItem key={x.value} value={x.value}>{x.label}</MenuItem>)}
                           </TextField>
                        </Grid>
                        <Grid item xs={12} md={7}>
                           <TextField
                              fullWidth
                              label="Причина / коротке пояснення"
                              placeholder="Наприклад: власник не готовий до правил роботи, завищена ціна, слабкі документи..."
                              value={form.reviewReason}
                              onChange={(e) => updateForm('reviewReason', e.target.value)}
                              sx={fieldSx}
                           />
                        </Grid>
                      </>
                   )}
                  {form.type === 'review' && (
                     <Grid item xs={12}>
                        <TextField
                           fullWidth
                           multiline
                           minRows={2}
                           label="Нотатка огляду"
                           placeholder={form.reviewResult === 'new_object' ? 'Коротко чому об’єкт взяли в роботу після огляду' : form.reviewResult === 'historical' ? 'Коротко що було на огляді і чому довносимо подію зараз' : 'Коротко що побачили на місці і чому не беремо в роботу'}
                           value={form.reviewNote}
                           onChange={(e) => updateForm('reviewNote', e.target.value)}
                           sx={fieldSx}
                        />
                     </Grid>
                  )}

                  {form.type === 'showing' && (
                     <>
                        <Grid item xs={12} md={3}>
                           <TextField fullWidth label="Стадія об’єкта" value={form.propertyStage} onChange={(e) => updateForm('propertyStage', e.target.value)} sx={fieldSx} />
                        </Grid>
                        <Grid item xs={12} md={3}>
                           <TextField select fullWidth label="Результат об’єкту" value={form.resultObject} onChange={(e) => updateForm('resultObject', e.target.value)} sx={fieldSx} SelectProps={{ MenuProps: menuProps }}>
                              {RESULT_OBJECT_OPTIONS.map((x) => <MenuItem key={x.value} value={x.value}>{x.label}</MenuItem>)}
                           </TextField>
                        </Grid>
                     </>
                  )}

                  {form.type === 'showing' && (
                     <Grid item xs={12} md={6}>
                        <Autocomplete
                           options={leads}
                           value={selectedLead}
                           onChange={(_, value) => {
                              rememberLeadOption(value);
                              updateForm('lead', value?._id || '');
                           }}
                           onInputChange={(_, value, reason) => {
                              if (reason === 'input') setLeadSearch(value);
                           }}
                           getOptionLabel={(option) => option?.name || ''}
                           isOptionEqualToValue={(option, value) => option?._id === value?._id}
                           filterOptions={(options) => options}
                           loading={leadsLoading}
                           noOptionsText={leadSearch.trim().length >= LEAD_MIN_SEARCH_LENGTH ? 'Не знайдено' : `Введи мінімум ${LEAD_MIN_SEARCH_LENGTH} символів`}
                           renderOption={renderLeadOption}
                           renderInput={(params) => <TextField {...params} label="Покупець / лід" sx={fieldSx} />}
                           PaperComponent={(props) => <Box {...props} sx={{ minWidth: { xs: 320, sm: 520 }, bgcolor: theme.bgPanel, color: theme.text, border: `1px solid ${theme.border}` }} />}
                           ListboxProps={{ sx: { maxHeight: 360 } }}
                        />
                     </Grid>
                  )}
                  {form.type === 'showing' && (
                     <>
                        <Grid item xs={12} md={3}>
                           <TextField fullWidth label="Стадія покупця" value={form.buyerStage} onChange={(e) => updateForm('buyerStage', e.target.value)} sx={fieldSx} />
                        </Grid>
                        <Grid item xs={12} md={3}>
                           <TextField select fullWidth label="Результат покупця" value={form.resultBuyer} onChange={(e) => updateForm('resultBuyer', e.target.value)} sx={fieldSx} SelectProps={{ MenuProps: menuProps }}>
                              {RESULT_BUYER_OPTIONS.map((x) => <MenuItem key={x.value} value={x.value}>{x.label}</MenuItem>)}
                           </TextField>
                        </Grid>
                     </>
                  )}

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
                  {form.type === 'showing' && (
                     <>
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
                     </>
                  )}

                  {form.type === 'showing' && (
                     <>
                        <Grid item xs={12} md={4}>
                           <TextField fullWidth label="Виявлені заперечення" placeholder="вигляд з вікна, ціна, поверх" value={form.objectionsText} onChange={(e) => updateForm('objectionsText', e.target.value)} sx={fieldSx} />
                        </Grid>
                        <Grid item xs={12} md={4}>
                           <TextField fullWidth label="Аргументи до заперечень" value={form.objectionArguments} onChange={(e) => updateForm('objectionArguments', e.target.value)} sx={fieldSx} />
                        </Grid>
                        <Grid item xs={12} md={4}>
                           <TextField fullWidth label="Опис результату" value={form.resultDescription} onChange={(e) => updateForm('resultDescription', e.target.value)} sx={fieldSx} multiline minRows={1} />
                        </Grid>
                     </>
                  )}
               </Grid>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 2 }}>
               <Button startIcon={<CloseRoundedIcon />} onClick={closeOperationDialog} disabled={saving} sx={{ color: theme.text }}>
                  Закрити
               </Button>
               <Button startIcon={<CheckCircleRoundedIcon />} onClick={submit} disabled={saving || (!form.property && !form.lead) || (form.type === 'pzs' && !form.pzsCondition.trim()) || (form.type === 'review' && (!form.property || (form.reviewResult === 'not_taken' ? !form.reviewReason.trim() : !form.reviewNote.trim())))} sx={{ borderRadius: 2, px: 2, fontWeight: 950, color: mode === 'light' ? '#fff' : '#101014', background: `linear-gradient(90deg, ${theme.accent}, ${theme.accentLight})` }}>
                  {saving ? 'Зберігаю...' : editingItem ? 'Оновити' : 'Зберегти'}
               </Button>
            </DialogActions>
         </Dialog>

         <Dialog
            open={!!deleteItem}
            onClose={() => !deleting && setDeleteItem(null)}
            fullWidth
            maxWidth="xs"
            PaperProps={{
               sx: {
                  bgcolor: theme.bgPanel,
                  color: theme.text,
                  borderRadius: 3,
                  border: '1px solid rgba(248,113,113,0.32)',
                  boxShadow: '0 24px 70px rgba(0,0,0,0.55)',
               },
            }}
         >
            <DialogTitle sx={{ pb: 1 }}>
               <Stack direction="row" spacing={1.2} alignItems="center">
                  <Box
                     sx={{
                        width: 38,
                        height: 38,
                        borderRadius: 2,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#f87171',
                        bgcolor: 'rgba(248,113,113,0.12)',
                        border: '1px solid rgba(248,113,113,0.25)',
                     }}
                  >
                     <DeleteOutlineRoundedIcon />
                  </Box>
                  <Stack spacing={0.2}>
                     <Typography sx={{ fontWeight: 950, color: theme.text }}>
                         Видалити {deleteItem?.type === 'pzs' ? 'ПЗС' : deleteItem?.type === 'review' ? 'огляд' : 'подію'}?
                     </Typography>
                     <Typography sx={{ fontSize: 12, color: theme.textSoft }}>
                         {deleteItem?.type === 'pzs' ? 'ПЗС і його хронологію кроків не можна буде відновити' : deleteItem?.type === 'review' ? 'Огляд не можна буде відновити' : 'Дію не можна буде відновити'}
                     </Typography>
                  </Stack>
               </Stack>
            </DialogTitle>

            <DialogContent sx={{ pt: 1 }}>
               <Box
                  sx={{
                     p: 1.2,
                     borderRadius: 2,
                     border: `1px solid ${theme.border}`,
                     bgcolor: mode === 'light' ? 'rgba(124,58,237,0.035)' : 'rgba(255,255,255,0.035)',
                  }}
               >
                  <Typography sx={{ color: theme.text, fontWeight: 900 }} noWrap>
                     {propertyTitle(deleteItem?.property)}
                  </Typography>
                  <Typography sx={{ color: theme.textSoft, fontSize: 12 }} noWrap>
                     {deleteItem?.lead?.name || 'Без клієнта'} · {formatDate(deleteItem?.occurredAt)}
                  </Typography>
               </Box>
            </DialogContent>

            <DialogActions sx={{ px: 3, pb: 2 }}>
               <Button onClick={() => setDeleteItem(null)} disabled={deleting} sx={{ color: theme.text }}>
                  Скасувати
               </Button>
               <Button
                  onClick={confirmDelete}
                  disabled={deleting}
                  startIcon={<DeleteOutlineRoundedIcon />}
                  sx={{
                     borderRadius: 2,
                     px: 2,
                     color: '#fff',
                     fontWeight: 950,
                     bgcolor: '#ef4444',
                     '&:hover': { bgcolor: '#dc2626' },
                  }}
               >
                  {deleting ? 'Видаляю...' : 'Видалити'}
               </Button>
            </DialogActions>
         </Dialog>

          <Dialog
             open={!!deleteFinanceItem}
             onClose={() => !deleting && setDeleteFinanceItem(null)}
             fullWidth
             maxWidth="xs"
             PaperProps={{
                sx: {
                   bgcolor: theme.bgPanel,
                   color: theme.text,
                   borderRadius: 3,
                   border: '1px solid rgba(248,113,113,0.32)',
                   boxShadow: '0 24px 70px rgba(0,0,0,0.55)',
                },
             }}
          >
             <DialogTitle sx={{ pb: 1 }}>
                <Stack direction="row" spacing={1.2} alignItems="center">
                   <Box
                      sx={{
                         width: 38,
                         height: 38,
                         borderRadius: 2,
                         display: 'flex',
                         alignItems: 'center',
                         justifyContent: 'center',
                         color: '#f87171',
                         bgcolor: 'rgba(248,113,113,0.12)',
                         border: '1px solid rgba(248,113,113,0.25)',
                      }}
                   >
                      <DeleteOutlineRoundedIcon />
                   </Box>
                   <Stack spacing={0.2}>
                      <Typography sx={{ fontWeight: 950, color: theme.text }}>
                         Видалити {deleteFinanceItem?.financeType === 'reregistration' ? 'ПЕРС' : 'завдаток'}?
                      </Typography>
                      <Typography sx={{ fontSize: 12, color: theme.textSoft }}>
                         Якщо у завдатку вже є ПЕРС, спочатку видали ПЕРС
                      </Typography>
                   </Stack>
                </Stack>
             </DialogTitle>

             <DialogContent sx={{ pt: 1 }}>
                <Box
                   sx={{
                      p: 1.2,
                      borderRadius: 2,
                      border: `1px solid ${theme.border}`,
                      bgcolor: mode === 'light' ? 'rgba(34,197,94,0.035)' : 'rgba(255,255,255,0.035)',
                   }}
                >
                   <Typography sx={{ color: theme.text, fontWeight: 900 }} noWrap>
                      {propertyTitle(deleteFinanceItem?.property)}
                   </Typography>
                   <Typography sx={{ color: theme.textSoft, fontSize: 12 }} noWrap>
                      {deleteFinanceItem?.lead?.name || 'Без клієнта'} · {formatDate(deleteFinanceItem?.occurredAt)}
                   </Typography>
                </Box>
             </DialogContent>

             <DialogActions sx={{ px: 3, pb: 2 }}>
                <Button onClick={() => setDeleteFinanceItem(null)} disabled={deleting} sx={{ color: theme.text }}>
                   Скасувати
                </Button>
                <Button
                   onClick={confirmFinanceDelete}
                   disabled={deleting}
                   startIcon={<DeleteOutlineRoundedIcon />}
                   sx={{
                      borderRadius: 2,
                      px: 2,
                      color: '#fff',
                      fontWeight: 950,
                      bgcolor: '#ef4444',
                      '&:hover': { bgcolor: '#dc2626' },
                   }}
                >
                   {deleting ? 'Видаляю...' : 'Видалити'}
                </Button>
             </DialogActions>
          </Dialog>
      </Box>
   );
}
