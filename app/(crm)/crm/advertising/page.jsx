'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import {
   Alert,
   Autocomplete,
   Avatar,
   Box,
   Button,
   Chip,
   CircularProgress,
   Dialog,
   DialogActions,
   DialogContent,
   DialogTitle,
   Divider,
   IconButton,
   InputAdornment,
   Menu,
   MenuItem,
   Stack,
   TextField,
   Tooltip,
   Typography,
} from '@mui/material';
import { signOut, useSession } from 'next-auth/react';

import AddRoundedIcon from '@mui/icons-material/AddRounded';
import AddLinkRoundedIcon from '@mui/icons-material/AddLinkRounded';
import AutoFixHighRoundedIcon from '@mui/icons-material/AutoFixHighRounded';
import BlockRoundedIcon from '@mui/icons-material/BlockRounded';
import BookmarkRoundedIcon from '@mui/icons-material/BookmarkRounded';
import CallMadeRoundedIcon from '@mui/icons-material/CallMadeRounded';
import CampaignRoundedIcon from '@mui/icons-material/CampaignRounded';
import ChatRoundedIcon from '@mui/icons-material/ChatRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import DriveFileRenameOutlineRoundedIcon from '@mui/icons-material/DriveFileRenameOutlineRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import FilterAltOffRoundedIcon from '@mui/icons-material/FilterAltOffRounded';
import ImageRoundedIcon from '@mui/icons-material/ImageRounded';
import LinkRoundedIcon from '@mui/icons-material/LinkRounded';
import MonetizationOnRoundedIcon from '@mui/icons-material/MonetizationOnRounded';
import MoneyOffRoundedIcon from '@mui/icons-material/MoneyOffRounded';
import OpenInNewRoundedIcon from '@mui/icons-material/OpenInNewRounded';
import PaymentsRoundedIcon from '@mui/icons-material/PaymentsRounded';
import PersonRoundedIcon from '@mui/icons-material/PersonRounded';
import PhoneInTalkRoundedIcon from '@mui/icons-material/PhoneInTalkRounded';
import PriceChangeRoundedIcon from '@mui/icons-material/PriceChangeRounded';
import QueryStatsRoundedIcon from '@mui/icons-material/QueryStatsRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import StarRoundedIcon from '@mui/icons-material/StarRounded';
import TrackChangesRoundedIcon from '@mui/icons-material/TrackChangesRounded';
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded';
import LogoutIcon from '@mui/icons-material/Logout';

import { useCRMTheme } from '@/app/(crm)/crm/context/CRMThemeContext';
import useCurrentUser from '@/utils/useCurrentUser';

const ACTION_OPTIONS = [
   ['created_first', 'створено вперше'],
   ['created_with_update', 'створено з покращенням'],
   ['created_without_changes', 'створено без змін'],
   ['updated_improved', 'оновлено з покращенням'],
   ['updated_without_changes', 'оновлено без змін'],
   ['edited_photo', 'редаговано фото'],
   ['price_changed', 'змінено ціну'],
   ['scanner', 'сканер'],
   ['financial_promotion', 'фінансове просування'],
   ['deactivated', 'деактивовано'],
];

const PLATFORM_OPTIONS = [
   ['olx', 'OLX'],
   ['dimria', 'DIM.RIA'],
   ['rieltor', 'RIELTOR.UA'],
   ['lun', 'LUN.UA'],
   ['flatfy', 'FLATFY.UA'],
   ['real-estate', 'REAL-ESTATE'],
   ['facebook', 'Facebook'],
   ['instagram', 'Instagram'],
   ['tiktok', 'TikTok'],
   ['telegram', 'Telegram'],
   ['site', 'Сайт'],
   ['other', 'Інше'],
];

const SOURCE_OPTIONS = [
   ['ours', 'Наша'],
   ['competitor', 'Конкуренти'],
   ['owner', 'Власник'],
];

const PERIOD_OPTIONS = [
   ['day', 'День'],
   ['range', 'Період'],
   ['7d', '7 днів'],
   ['30d', 'Місяць'],
   ['90d', '3 місяці'],
   ['all', 'Увесь час'],
];

const actionMap = Object.fromEntries(ACTION_OPTIONS);
const platformMap = Object.fromEntries(PLATFORM_OPTIONS);
const sourceMap = Object.fromEntries(SOURCE_OPTIONS);
const PROPERTY_MIN_SEARCH_LENGTH = 2;
const EVENT_GRID_COLUMNS = '194px 176px 128px minmax(260px,1fr) 46px 46px 46px 46px 46px 74px 82px 104px';

const DEMO_MARKETING_EVENTS = [
   {
      _id: 'demo-ad-1',
      actionType: 'created_first',
      actionLabel: 'створено вперше',
      platform: 'olx',
      sourceType: 'ours',
      property: { title: 'Продаж 1к квартири у цегляній чешці', location_text: 'Львів, Роксоляни' },
      responsibleEmployee: { name: 'Вадим' },
      linkTitle: 'OLX · наша публікація',
      note: 'Стартова подача після підготовки тексту',
      occurredAt: new Date().toISOString(),
      isDemo: true,
   },
   {
      _id: 'demo-ad-2',
      actionType: 'created_with_update',
      actionLabel: 'створено з покращенням',
      platform: 'dimria',
      sourceType: 'ours',
      property: { title: 'Оренда 2к квартири, вул. Мазепи', location_text: 'Львів, Мазепи' },
      responsibleEmployee: { name: 'SMM' },
      linkTitle: 'DIM.RIA · оновлена подача',
      note: 'Додано новий заголовок і переставлено фото',
      occurredAt: new Date(Date.now() - 3600000).toISOString(),
      isDemo: true,
   },
   {
      _id: 'demo-ad-3',
      actionType: 'created_without_changes',
      actionLabel: 'створено без змін',
      platform: 'telegram',
      sourceType: 'ours',
      property: { title: '2 кімнатна квартира вул. Городоцька', location_text: 'Львів, Городоцька 103' },
      responsibleEmployee: { name: 'Надія' },
      linkTitle: 'Telegram канал',
      note: 'Опубліковано без редагування тексту',
      occurredAt: new Date(Date.now() - 7200000).toISOString(),
      isDemo: true,
   },
   {
      _id: 'demo-ad-4',
      actionType: 'updated_improved',
      actionLabel: 'оновлено з покращенням',
      platform: 'facebook',
      sourceType: 'ours',
      property: { title: 'Продаж будинку у Скнилові', location_text: 'село Скнилів, Шевченка 57' },
      responsibleEmployee: { name: 'Маркетинг' },
      linkTitle: 'Facebook група',
      note: 'Переписано перший абзац і додано сильніше фото',
      occurredAt: new Date(Date.now() - 10800000).toISOString(),
      isDemo: true,
   },
   {
      _id: 'demo-ad-5',
      actionType: 'updated_without_changes',
      actionLabel: 'оновлено без змін',
      platform: 'real-estate',
      sourceType: 'competitor',
      property: { title: 'Продаж 1к квартири з виглядом на парк. Ремонт. Новобуд!', location_text: 'Львів, Пасічна 94а' },
      responsibleEmployee: { name: 'Вадим' },
      linkTitle: 'REAL-ESTATE · конкурент',
      note: 'Піднято без зміни контенту',
      occurredAt: new Date(Date.now() - 14400000).toISOString(),
      isDemo: true,
   },
   {
      _id: 'demo-ad-6',
      actionType: 'edited_photo',
      actionLabel: 'редаговано фото',
      platform: 'instagram',
      sourceType: 'ours',
      property: { title: 'Оренда 1к біля Політеху', location_text: 'Львів, Бандери' },
      responsibleEmployee: { name: 'SMM' },
      linkTitle: 'Instagram stories',
      note: 'Замінено обкладинку і порядок фото',
      occurredAt: new Date(Date.now() - 18000000).toISOString(),
      isDemo: true,
   },
   {
      _id: 'demo-ad-8',
      actionType: 'price_changed',
      actionLabel: 'змінено ціну',
      platform: 'rieltor',
      sourceType: 'ours',
      property: { title: 'Будинок з ділянкою', location_text: 'Львівська область' },
      responsibleEmployee: { name: 'Юрій' },
      linkTitle: 'RIELTOR.UA',
      note: 'Оновлено рекламну ціну після погодження',
      occurredAt: new Date(Date.now() - 25200000).toISOString(),
      isDemo: true,
   },
   {
      _id: 'demo-ad-9',
      actionType: 'scanner',
      actionLabel: 'сканер',
      platform: 'olx',
      sourceType: 'ours',
      property: { title: 'Продаж 1к квартири у самому центрі Львова', location_text: 'Поповича 7' },
      responsibleEmployee: { name: 'Вадим' },
      linkTitle: 'OLX · наша публікація',
      note: 'Списано показники після вихідних',
      metrics: { views: 596, calls: 3, messages: 7, phoneOpens: 11, favorites: 5 },
      occurredAt: new Date(Date.now() - 28800000).toISOString(),
      isDemo: true,
   },
   {
      _id: 'demo-ad-10',
      actionType: 'financial_promotion',
      actionLabel: 'фінансове просування',
      platform: 'facebook',
      sourceType: 'ours',
      property: { title: 'Оренда 2к біля Наукової', location_text: 'Львів, Наукова' },
      responsibleEmployee: { name: 'Маркетинг' },
      linkTitle: 'Facebook група',
      note: 'Тестова платна подача на 24 години',
      costUah: 300,
      occurredAt: new Date(Date.now() - 32400000).toISOString(),
      isDemo: true,
   },
   {
      _id: 'demo-ad-11',
      actionType: 'deactivated',
      actionLabel: 'деактивовано',
      platform: 'dimria',
      sourceType: 'owner',
      property: { title: 'Будинок з ділянкою', location_text: 'Львівська область' },
      responsibleEmployee: { name: 'SMM' },
      linkTitle: 'DIM.RIA',
      note: 'Посилання закрите після втрати актуальності',
      occurredAt: new Date(Date.now() - 36000000).toISOString(),
      isDemo: true,
   },
];

function emptyForm() {
   return {
      property: '',
      actionType: 'scanner',
      platform: 'olx',
      sourceType: 'ours',
      advertisingLinkId: '',
      linkMode: 'existing',
      linkTitle: '',
      linkUrl: '',
      occurredAt: toInputDateTime(new Date()),
      responsibleEmployee: '',
      costUah: '',
      views: '',
      calls: '',
      messages: '',
      phoneOpens: '',
      favorites: '',
      saves: '',
      clicks: '',
      position: '',
      note: '',
   };
}

function toInputDateTime(value) {
   const date = value ? new Date(value) : new Date();
   if (Number.isNaN(date.getTime())) return '';
   const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
   return local.toISOString().slice(0, 16);
}

function toInputDate(value = new Date()) {
   const date = value instanceof Date ? value : new Date(value);
   if (Number.isNaN(date.getTime())) return '';
   const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
   return local.toISOString().slice(0, 10);
}

function dateRangeForFilters(period, day, dateTo) {
   if (period === 'all') return {};
   if (period === 'day') {
      const date = day ? new Date(`${day}T00:00:00`) : new Date();
      if (Number.isNaN(date.getTime())) return {};
      const start = new Date(date);
      start.setHours(0, 0, 0, 0);
      const end = new Date(date);
      end.setHours(23, 59, 59, 999);
      return { from: start.toISOString(), to: end.toISOString() };
   }
   if (period === 'range') {
      const startDate = day ? new Date(`${day}T00:00:00`) : null;
      const endDate = dateTo ? new Date(`${dateTo}T00:00:00`) : null;
      const result = {};
      if (startDate && !Number.isNaN(startDate.getTime())) {
         startDate.setHours(0, 0, 0, 0);
         result.from = startDate.toISOString();
      }
      if (endDate && !Number.isNaN(endDate.getTime())) {
         endDate.setHours(23, 59, 59, 999);
         result.to = endDate.toISOString();
      }
      return result;
   }
   const date = new Date();
   if (period === '7d') date.setDate(date.getDate() - 7);
   if (period === '30d') date.setMonth(date.getMonth() - 1);
   if (period === '90d') date.setMonth(date.getMonth() - 3);
   return { from: date.toISOString() };
}

function formatDateTime(value) {
   if (!value) return '-';
   const date = new Date(value);
   if (Number.isNaN(date.getTime())) return '-';
   return date.toLocaleString('uk-UA', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
   });
}

function formatDateOnly(value) {
   if (!value) return '-';
   const date = new Date(value);
   if (Number.isNaN(date.getTime())) return '-';
   return date.toLocaleDateString('uk-UA', { day: '2-digit', month: '2-digit', year: '2-digit' });
}

function formatTimeOnly(value) {
   if (!value) return '';
   const date = new Date(value);
   if (Number.isNaN(date.getTime())) return '';
   return date.toLocaleTimeString('uk-UA', { hour: '2-digit', minute: '2-digit' });
}

function formatMoney(value, currency = 'UAH') {
   const number = Number(value || 0);
   const suffixMap = { USD: '$', UAH: 'грн', EUR: '€' };
   const suffix = suffixMap[currency] || currency;
   return number.toLocaleString('uk-UA', { maximumFractionDigits: 0 }) + ' ' + suffix;
}

function getImageUrl(property) {
   const image = (property?.images || []).find((item) => item.isMain && !item.isHidden)
      || (property?.images || []).find((item) => !item.isHidden)
      || (property?.images || [])[0];
   return image?.variants?.card || image?.variants?.preview || image?.processedUrl || image?.url || '';
}
function employeeName(employee) {
   return employee?.name || [employee?.surname, employee?.fullName].filter(Boolean).join(' ') || 'Без працівника';
}

function propertyLabel(property) {
   return property?.displayTitle || property?.title || property?.rentOptions?.rentTitle || property?.location_text || 'Без назви';
}

function isCreateAction(actionType) {
   return String(actionType || '').startsWith('created');
}

function adLinkLabel(link, fallbackPlatform = '', links = []) {
   if (!link) return fallbackPlatform ? (platformMap[fallbackPlatform] || fallbackPlatform) : 'Реклама';
   if (link.workTitle || link.title) return link.workTitle || link.title;
   const platform = link.platform || fallbackPlatform || 'other';
   const samePlatformLinks = [...(links || [])]
      .filter((item) => (item.platform || 'other') === platform)
      .sort((a, b) => new Date(a?.createdAt || 0).getTime() - new Date(b?.createdAt || 0).getTime());
   const index = samePlatformLinks.findIndex((item) => String(item?._id || '') === String(link?._id || ''));
   return `${platformMap[platform] || platform || 'Реклама'}${index >= 0 ? ` ${index + 1}` : ''}`;
}

function getFieldSx(theme, mode) {
   return {
      '& .MuiOutlinedInput-root': {
         bgcolor: mode === 'light' ? 'rgba(124,58,237,0.035)' : 'rgba(255,255,255,0.04)',
         borderRadius: 2.5,
         color: theme.text,
         '& fieldset': { borderColor: theme.border },
         '&:hover fieldset': { borderColor: theme.accent },
         '&.Mui-focused fieldset': { borderColor: theme.accentLight || theme.accent },
      },
      '& .MuiInputLabel-root': { color: theme.textSoft },
      '& .MuiInputBase-input': { color: `${theme.text} !important`, WebkitTextFillColor: theme.text },
      '& .MuiSelect-icon': { color: theme.text },
   };
}

function getActionColor(actionType) {
   if (actionType === 'created_first') return '#22c55e';
   if (actionType === 'created_with_update' || actionType === 'updated_improved') return '#fb923c';
   if (actionType === 'created_without_changes' || actionType === 'updated_without_changes') return '#94a3b8';
   if (actionType === 'scanner') return '#fde047';
   if (actionType === 'price_changed') return '#facc15';
   if (actionType === 'financial_promotion') return '#a78bfa';
   if (actionType === 'deactivated') return '#ef4444';
   if (actionType === 'edited_photo') return '#38bdf8';
   return '#fb923c';
}

function getActionIcon(actionType) {
   const commonSx = { fontSize: 18 };
   const icons = {
      created_first: <AddRoundedIcon sx={commonSx} />,
      created_with_update: <AddRoundedIcon sx={commonSx} />,
      created_without_changes: <AddRoundedIcon sx={commonSx} />,
      updated_improved: <AutoFixHighRoundedIcon sx={commonSx} />,
      updated_without_changes: <DriveFileRenameOutlineRoundedIcon sx={commonSx} />,
      edited_photo: <ImageRoundedIcon sx={commonSx} />,
      price_changed: <PriceChangeRoundedIcon sx={commonSx} />,
      scanner: <TrackChangesRoundedIcon sx={commonSx} />,
      financial_promotion: <MonetizationOnRoundedIcon sx={commonSx} />,
      deactivated: <BlockRoundedIcon sx={commonSx} />,
   };
   return icons[actionType] || <CampaignRoundedIcon sx={commonSx} />;
}

function getPriorityMeta(priority) {
   const value = Number(priority || 3);
   if (value >= 5) return { label: '5', text: 'Надвисокий', color: '#ef4444', bg: 'rgba(239,68,68,0.16)' };
   if (value === 4) return { label: '4', text: 'Високий', color: '#fb923c', bg: 'rgba(251,146,60,0.16)' };
   if (value === 3) return { label: '3', text: 'Нормальний', color: '#facc15', bg: 'rgba(250,204,21,0.13)' };
   if (value === 2) return { label: '2', text: 'Низький', color: '#38bdf8', bg: 'rgba(56,189,248,0.12)' };
   return { label: '1', text: 'Найнижчий', color: '#94a3b8', bg: 'rgba(148,163,184,0.12)' };
}

function getAdvertisingStatusLabel(status) {
   if (status === 'paused') return 'Пауза';
   if (status === 'done') return 'Готово';
   if (status === 'none') return 'Без реклами';
   return 'Активно';
}

function getActiveAdvertisingLinks(property) {
   return (property?.advertisingLinks || []).filter((link) => !link?.closedAt && link?.status !== 'archived');
}

export default function AdvertisingCabinetPage() {
   const { theme: crmTheme } = useCRMTheme();
   const { data: session } = useSession();
   const { user } = useCurrentUser();
   const [profileAnchor, setProfileAnchor] = useState(null);
   const mode = 'dark';
   const theme = useMemo(() => ({
      ...crmTheme,
      bgDark: '#090912',
      bgPanel: '#12121d',
      border: '#292941',
      text: '#f4f4fb',
      textSoft: 'rgba(244,244,251,0.68)',
      accent: '#fb923c',
      accentLight: '#fdba74',
   }), [crmTheme]);
   const fieldSx = useMemo(() => getFieldSx(theme, mode), [theme, mode]);
   const compactFieldSx = useMemo(() => ({
      ...fieldSx,
      '& .MuiOutlinedInput-root': {
         ...fieldSx['& .MuiOutlinedInput-root'],
         height: 40,
         borderRadius: 1.6,
      },
      '& .MuiInputLabel-root': {
         ...fieldSx['& .MuiInputLabel-root'],
         fontSize: 12,
         fontWeight: 850,
      },
      '& .MuiInputBase-input': {
         ...fieldSx['& .MuiInputBase-input'],
         fontSize: 12,
         fontWeight: 850,
      },
      '& input[type=number]': {
         MozAppearance: 'textfield',
      },
      '& input[type=number]::-webkit-outer-spin-button, & input[type=number]::-webkit-inner-spin-button': {
         WebkitAppearance: 'none',
         margin: 0,
      },
   }), [fieldSx]);
   const metricFieldSx = useMemo(() => ({
      ...compactFieldSx,
      '& .MuiOutlinedInput-root': {
         ...compactFieldSx['& .MuiOutlinedInput-root'],
         height: 20,
         px: 0.6,
      },
      '& .MuiInputBase-input': {
         ...compactFieldSx['& .MuiInputBase-input'],
         fontSize: 11,
         textAlign: 'center',
         px: 0.25,
      },
      '& .MuiInputAdornment-root': {
         mr: 0.25,
      },
   }), [compactFieldSx]);
   const headerFilterSx = useMemo(() => ({
      ...compactFieldSx,
      '& .MuiOutlinedInput-root': {
         ...compactFieldSx['& .MuiOutlinedInput-root'],
         height: 30,
         borderRadius: 1.35,
         bgcolor: 'rgba(255,255,255,0.035)',
      },
      '& .MuiInputBase-input': {
         ...compactFieldSx['& .MuiInputBase-input'],
         fontSize: 10.8,
         fontWeight: 900,
         py: 0,
      },
      '& .MuiSelect-select': {
         fontSize: 10.8,
         fontWeight: 900,
         py: '4px !important',
      },
      '& .MuiInputLabel-root': {
         ...compactFieldSx['& .MuiInputLabel-root'],
         fontSize: 10,
         fontWeight: 900,
         transform: 'translate(10px, -6px) scale(0.74)',
      },
   }), [compactFieldSx]);
   const propertySearchSeqRef = useRef(0);
   const profileOpen = Boolean(profileAnchor);
   const profileName = user?.name || session?.user?.name || 'Профіль';
   const profileAvatar = user?.livePhoto?.url || user?.avatarUrl || session?.user?.avatarUrl || '';

   const [events, setEvents] = useState([]);
   const [summary, setSummary] = useState({});
   const [advertisingProperties, setAdvertisingProperties] = useState([]);
   const [advertisingPropertiesLoading, setAdvertisingPropertiesLoading] = useState(false);
   const [selectedAdvertisingPropertyId, setSelectedAdvertisingPropertyId] = useState('');
   const [propertyWorkSearch, setPropertyWorkSearch] = useState('');
   const [properties, setProperties] = useState([]);
   const [propertySelectionCache, setPropertySelectionCache] = useState([]);
   const [propertySearch, setPropertySearch] = useState('');
   const [propertiesLoading, setPropertiesLoading] = useState(false);
   const [employees, setEmployees] = useState([]);
   const [filters, setFilters] = useState({ period: '30d', day: toInputDate(), dateTo: toInputDate(), actionType: 'all', platform: 'all', employee: 'all', q: '' });
   const [loading, setLoading] = useState(false);
   const [saving, setSaving] = useState(false);
   const [error, setError] = useState('');
   const [dialogOpen, setDialogOpen] = useState(false);
   const [editingEvent, setEditingEvent] = useState(null);
   const [deleteEvent, setDeleteEvent] = useState(null);
   const [showDemoRows, setShowDemoRows] = useState(false);
   const [form, setForm] = useState(emptyForm);
   const [isTimePinned, setIsTimePinned] = useState(false);
   const [showAllWorkObjects, setShowAllWorkObjects] = useState(false);

   const propertyLookupOptions = useMemo(() => {
      const seen = new Set();
      return [...propertySelectionCache, ...properties].filter((item) => {
         const id = String(item?._id || '');
         if (!id || seen.has(id)) return false;
         seen.add(id);
         return true;
      });
   }, [properties, propertySelectionCache]);
   const selectedProperty = useMemo(
      () => propertyLookupOptions.find((item) => String(item._id) === String(form.property)) || null,
      [propertyLookupOptions, form.property]
   );
   const selectedAdvertisingProperty = useMemo(
      () => advertisingProperties.find((item) => String(item._id) === String(selectedAdvertisingPropertyId)) || null,
      [advertisingProperties, selectedAdvertisingPropertyId]
   );
   const sortedAdvertisingProperties = useMemo(() => (
      [...advertisingProperties].sort((a, b) => {
         const priorityDiff = Number(b?.advertisingSettings?.priority || 3) - Number(a?.advertisingSettings?.priority || 3);
         if (priorityDiff) return priorityDiff;
         const aTime = new Date(a?.advertisingCounters?.lastActionAt || a?.updatedAt || 0).getTime() || 0;
         const bTime = new Date(b?.advertisingCounters?.lastActionAt || b?.updatedAt || 0).getTime() || 0;
         return bTime - aTime;
      })
   ), [advertisingProperties]);
   const selectedLinks = useMemo(() => {
      const links = selectedProperty?.advertisingLinks || [];
      return [...links].sort((a, b) => {
         const aClosed = a?.closedAt || a?.status === 'archived';
         const bClosed = b?.closedAt || b?.status === 'archived';
         if (aClosed !== bClosed) return aClosed ? 1 : -1;
         return new Date(b?.createdAt || 0).getTime() - new Date(a?.createdAt || 0).getTime();
      });
   }, [selectedProperty]);
   const visibleEvents = useMemo(() => {
      const source = showDemoRows ? [...DEMO_MARKETING_EVENTS, ...events] : (events.length ? events : DEMO_MARKETING_EVENTS);
      return [...source].sort((a, b) => {
         const aTime = new Date(a?.occurredAt || a?.createdAt || 0).getTime() || 0;
         const bTime = new Date(b?.occurredAt || b?.createdAt || 0).getTime() || 0;
         return bTime - aTime;
      });
   }, [events, showDemoRows]);
   const showDemoHint = !loading && (!events.length || showDemoRows);
   const creatingAdLink = isCreateAction(form.actionType);
   const showQuickNumbers = !creatingAdLink;
   const showMetrics = showQuickNumbers;
   const showCost = showQuickNumbers;

   const fetchEvents = async () => {
      setLoading(true);
      setError('');
      try {
         const params = new URLSearchParams({ pageSize: '80' });
         const range = dateRangeForFilters(filters.period, filters.day, filters.dateTo);
         if (range.from) params.set('dateFrom', range.from);
         if (range.to) params.set('dateTo', range.to);
         if (filters.actionType !== 'all') params.set('actionType', filters.actionType);
         if (filters.platform !== 'all') params.set('platform', filters.platform);
         if (filters.employee !== 'all') params.set('employee', filters.employee);
         if (filters.q.trim()) params.set('q', filters.q.trim());
         if (selectedAdvertisingPropertyId) params.set('property', selectedAdvertisingPropertyId);

         const res = await fetch(`/api/crm/advertising/events?${params.toString()}`, { cache: 'no-store' });
         if (!res.ok) throw new Error(await res.text());
         const data = await res.json();
         setEvents(data.items || []);
         setSummary(data.summary || {});
      } catch (err) {
         setError(err.message || 'Не вдалося завантажити рекламні дії');
      } finally {
         setLoading(false);
      }
   };

   const fetchDictionaries = async () => {
      try {
         const employeesRes = await fetch('/api/crm/employees?active=true', { cache: 'no-store' });

         if (employeesRes.ok) {
            const data = await employeesRes.json();
            setEmployees(data.items || []);
         }
      } catch (err) {
         console.error(err);
      }
   };

   const fetchAdvertisingProperties = async () => {
      setAdvertisingPropertiesLoading(true);
      try {
         const params = new URLSearchParams({ pageSize: '60' });
         if (propertyWorkSearch.trim()) params.set('q', propertyWorkSearch.trim());
         const res = await fetch(`/api/crm/advertising/properties?${params.toString()}`, { cache: 'no-store' });
         const data = res.ok ? await res.json() : { items: [] };
         const incoming = Array.isArray(data?.items) ? data.items : [];
         setAdvertisingProperties(incoming);
         if (selectedAdvertisingPropertyId && !incoming.some((item) => String(item._id) === String(selectedAdvertisingPropertyId))) {
            setSelectedAdvertisingPropertyId('');
         }
      } catch (err) {
         console.error(err);
      } finally {
         setAdvertisingPropertiesLoading(false);
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
      } catch (err) {
         console.error(err);
      } finally {
         if (propertySearchSeqRef.current === requestSeq) setPropertiesLoading(false);
      }
   };

   const rememberPropertyOption = (property) => {
      if (!property?._id) return;
      setPropertySelectionCache((prev) => {
         const id = String(property._id);
         const next = [property, ...prev.filter((item) => String(item?._id || '') !== id)];
         return next.slice(0, 12);
      });
   };

   useEffect(() => {
      fetchDictionaries();
      loadProperties('');
      fetchAdvertisingProperties();
   }, []);

   useEffect(() => {
      const timer = setTimeout(fetchAdvertisingProperties, propertyWorkSearch.trim() ? 350 : 0);
      return () => clearTimeout(timer);
   }, [propertyWorkSearch]);

   useEffect(() => {
      const timer = setTimeout(() => {
         loadProperties(propertySearch);
      }, propertySearch.trim().length >= PROPERTY_MIN_SEARCH_LENGTH ? 350 : 0);

      return () => clearTimeout(timer);
   }, [propertySearch]);

   useEffect(() => {
      fetchEvents();
   }, [filters.period, filters.day, filters.dateTo, filters.actionType, filters.platform, filters.employee, selectedAdvertisingPropertyId]);

   useEffect(() => {
      const timer = setTimeout(fetchEvents, filters.q.trim() ? 350 : 0);
      return () => clearTimeout(timer);
   }, [filters.q]);

   useEffect(() => {
      if (isTimePinned || editingEvent) return undefined;
      const tick = () => {
         setForm((prev) => ({ ...prev, occurredAt: toInputDateTime(new Date()) }));
      };
      tick();
      const timer = setInterval(tick, 1000);
      return () => clearInterval(timer);
   }, [isTimePinned, editingEvent]);

   const handleOpenDialog = () => {
      setForm(emptyForm());
      setEditingEvent(null);
      setIsTimePinned(false);
      setPropertySearch('');
      loadProperties('');
   };

   const handleCloseDialog = () => {
      setDialogOpen(false);
      setEditingEvent(null);
      setForm(emptyForm());
      setPropertySearch('');
      setIsTimePinned(false);
   };

   const handleEditEvent = (event) => {
      if (!event || event.isDemo) return;
      if (event.property?._id) rememberPropertyOption(event.property);
      setEditingEvent(event);
      setForm({
         property: event.property?._id || event.property || '',
         actionType: event.actionType || 'scanner',
         platform: event.platform || 'olx',
         sourceType: event.sourceType || 'ours',
         advertisingLinkId: event.advertisingLinkId || '',
         linkMode: event.advertisingLinkId ? 'existing' : 'new',
         linkTitle: event.linkTitle || '',
         linkUrl: event.advertisingLinkId ? '' : event.linkUrl || '',
         occurredAt: toInputDateTime(event.occurredAt || new Date()),
         responsibleEmployee: event.responsibleEmployee?._id || event.responsibleEmployee || '',
         costUah: event.costUah ?? '',
         views: event.metrics?.views ?? '',
         calls: event.metrics?.calls ?? '',
         messages: event.metrics?.messages ?? '',
         phoneOpens: event.metrics?.phoneOpens ?? '',
         favorites: event.metrics?.favorites ?? '',
         saves: event.metrics?.saves ?? '',
         clicks: event.metrics?.clicks ?? '',
         position: event.metrics?.position ?? '',
         note: event.note || '',
      });
      setIsTimePinned(true);
      setPropertySearch(propertyLabel(event.property));
      if (event.property?._id) loadProperties(propertyLabel(event.property));
      setDialogOpen(true);
   };

   const clearSelectedAdvertisingProperty = () => {
      setSelectedAdvertisingPropertyId('');
      setFilters((prev) => ({ ...prev, q: '' }));
   };

   const selectAdvertisingPropertyForActions = (property, { toggle = false } = {}) => {
      if (!property?._id) return;
      const isSelected = String(property._id) === String(selectedAdvertisingPropertyId);
      if (toggle && isSelected) {
         clearSelectedAdvertisingProperty();
         return;
      }

      setSelectedAdvertisingPropertyId(property._id);
      setFilters((prev) => ({ ...prev, q: propertyLabel(property) }));
   };

   const handleOpenActionForProperty = (property, link = null, actionType = 'scanner') => {
      if (!property?._id) return;
      rememberPropertyOption(property);
      selectAdvertisingPropertyForActions(property);
      const selectedLink = link || property.advertisingLinks?.find((item) => !item?.closedAt && item?.status !== 'archived') || property.advertisingLinks?.[0] || null;
      setEditingEvent(null);
      setForm({
         ...emptyForm(),
         property: property._id,
         occurredAt: toInputDateTime(new Date()),
         responsibleEmployee: property.advertisingSettings?.assignedEmployee?._id || property.advertisingSettings?.assignedEmployee || '',
         actionType,
         platform: selectedLink?.platform || 'olx',
         advertisingLinkId: selectedLink?._id || '',
         linkTitle: adLinkLabel(selectedLink, '', property.advertisingLinks || []),
      });
      setIsTimePinned(false);
      setPropertySearch(propertyLabel(property));
   };

   const handleSelectFormProperty = (property) => {
      rememberPropertyOption(property);
      const firstLink = property?.advertisingLinks?.find((item) => !item?.closedAt && item?.status !== 'archived') || property?.advertisingLinks?.[0] || null;
      setForm((prev) => ({
         ...prev,
         property: property?._id || '',
         responsibleEmployee: property?.advertisingSettings?.assignedEmployee?._id || property?.advertisingSettings?.assignedEmployee || prev.responsibleEmployee || '',
         platform: firstLink?.platform || prev.platform,
         advertisingLinkId: firstLink?._id || '',
         linkMode: firstLink?._id ? 'existing' : prev.linkMode,
         linkTitle: adLinkLabel(firstLink, '', property?.advertisingLinks || []),
         linkUrl: '',
      }));
      if (property) setPropertySearch(propertyLabel(property));
   };

   const handleFormChange = (field, value) => {
      setForm((prev) => {
         const next = { ...prev, [field]: value };
         if (field === 'property') {
            next.advertisingLinkId = '';
            next.linkMode = 'existing';
         }
         if (field === 'actionType') {
            const shouldCreateLink = isCreateAction(value);
            if (shouldCreateLink) {
               next.linkMode = 'new';
               next.advertisingLinkId = '';
               next.linkTitle = '';
            } else if (!next.advertisingLinkId && selectedLinks[0]?._id) {
               next.linkMode = 'existing';
               next.advertisingLinkId = selectedLinks[0]._id;
               next.platform = selectedLinks[0].platform || next.platform;
               next.sourceType = selectedLinks[0].sourceType || next.sourceType;
               next.linkTitle = adLinkLabel(selectedLinks[0], '', selectedProperty?.advertisingLinks || []);
            }
         }
         if (field === 'linkMode' && value === 'new') {
            next.advertisingLinkId = '';
         }
         if (field === 'advertisingLinkId') {
            const link = selectedLinks.find((item) => String(item?._id || '') === String(value || ''));
            if (link) {
               next.platform = link.platform || next.platform;
               next.sourceType = link.sourceType || next.sourceType;
               next.linkTitle = adLinkLabel(link, '', selectedProperty?.advertisingLinks || []);
               next.linkUrl = '';
            }
         }
         return next;
      });
   };

   const handleFormTimeChange = (value) => {
      setIsTimePinned(true);
      handleFormChange('occurredAt', value);
   };

   const handleSubmit = async () => {
      const shouldCreateLink = isCreateAction(form.actionType);
      if (!form.property || (!shouldCreateLink && !form.advertisingLinkId)) {
         setError(shouldCreateLink ? 'Оберіть об’єкт для нової реклами' : 'Оберіть конкретну рекламу для цієї дії');
         return;
      }
      setSaving(true);
      setError('');
      try {
         const payload = {
            property: form.property,
            actionType: form.actionType,
            platform: form.platform,
            sourceType: form.sourceType,
            advertisingLinkId: shouldCreateLink ? '' : form.advertisingLinkId,
            linkTitle: shouldCreateLink ? '' : form.linkTitle,
            linkUrl: shouldCreateLink || form.linkMode === 'new' ? form.linkUrl : '',
            occurredAt: form.occurredAt,
            responsibleEmployee: form.responsibleEmployee,
            costUah: form.costUah,
            note: form.note,
            metrics: {
               views: form.views,
               calls: form.calls,
               messages: form.messages,
               phoneOpens: form.phoneOpens,
               favorites: form.favorites,
               saves: form.saves,
               clicks: form.clicks,
               position: form.position,
            },
         };

         const url = editingEvent?._id
            ? `/api/crm/advertising/events/${editingEvent._id}`
            : '/api/crm/advertising/events';
         const res = await fetch(url, {
            method: editingEvent?._id ? 'PATCH' : 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
         });
         if (!res.ok) {
            const body = await res.json().catch(async () => ({ error: await res.text() }));
            throw new Error(body.error || 'Не вдалося зберегти рекламну дію');
         }
         const body = await res.json().catch(() => ({}));
         if (body?.item?.property?._id) {
            const freshProperty = body.item.property;
            rememberPropertyOption(freshProperty);
            setProperties((prev) => {
               const id = String(freshProperty._id);
               return [freshProperty, ...prev.filter((item) => String(item?._id || '') !== id)];
            });
         }

         handleCloseDialog();
         await Promise.all([fetchEvents(), fetchDictionaries(), fetchAdvertisingProperties()]);
      } catch (err) {
         setError(err.message || 'Не вдалося зберегти рекламну дію');
      } finally {
         setSaving(false);
      }
   };

   const resetFilters = () => setFilters({ period: '30d', day: toInputDate(), dateTo: toInputDate(), actionType: 'all', platform: 'all', employee: 'all', q: '' });

   const handleDeleteEvent = async () => {
      if (!deleteEvent?._id || deleteEvent.isDemo) return;
      setSaving(true);
      setError('');
      try {
         const res = await fetch(`/api/crm/advertising/events/${deleteEvent._id}`, { method: 'DELETE' });
         if (!res.ok) {
            const body = await res.json().catch(async () => ({ error: await res.text() }));
            throw new Error(body.error || 'Не вдалося видалити рекламну дію');
         }
         setDeleteEvent(null);
         await Promise.all([fetchEvents(), fetchAdvertisingProperties()]);
      } catch (err) {
         setError(err.message || 'Не вдалося видалити рекламну дію');
      } finally {
         setSaving(false);
      }
   };

   return (
      <Box
         sx={{
            minHeight: '100vh',
            color: theme.text,
            background: `
               radial-gradient(circle at 16% 12%, rgba(249,115,22,0.16), transparent 34%),
               radial-gradient(circle at 86% 18%, rgba(56,189,248,0.08), transparent 30%),
               linear-gradient(180deg, #080811 0%, #0d0d18 44%, #090912 100%)
            `,
         }}
      >
         <Box
            sx={{
               position: 'sticky',
               top: 0,
               zIndex: 20,
               height: 64,
               px: { xs: 1.5, md: 3 },
               display: 'flex',
               alignItems: 'center',
               justifyContent: 'space-between',
               borderBottom: `1px solid ${theme.border}`,
               bgcolor: 'rgba(9,9,18,0.88)',
               backdropFilter: 'blur(14px)',
            }}
         >
            <Stack direction="row" alignItems="center" spacing={1.2}>
               <Box
                  sx={{
                     width: 38,
                     height: 38,
                     borderRadius: 2,
                     display: 'grid',
                     placeItems: 'center',
                     color: '#fb923c',
                     bgcolor: 'rgba(249,115,22,0.12)',
                     border: '1px solid rgba(249,115,22,0.35)',
                  }}
               >
                  <CampaignRoundedIcon fontSize="small" />
               </Box>
               <Box>
                  <Typography sx={{ fontWeight: 950, lineHeight: 1.05 }}>Karamax CRM</Typography>
                  <Typography sx={{ color: theme.textSoft, fontWeight: 800, fontSize: 12, lineHeight: 1.2 }}>
                     Рекламний кабінет
                  </Typography>
               </Box>
            </Stack>

            <Stack direction="row" alignItems="center" spacing={1.2}>
               <Typography sx={{ display: { xs: 'none', sm: 'block' }, color: theme.textSoft, fontWeight: 850, fontSize: 13 }}>
                  {profileName}
               </Typography>
               <IconButton onClick={(e) => setProfileAnchor(e.currentTarget)} sx={{ p: 0.35 }}>
                  <Avatar
                     src={profileAvatar}
                     sx={{
                        width: 38,
                        height: 38,
                        bgcolor: '#fb923c',
                        color: '#120a04',
                        fontWeight: 950,
                        border: '1px solid rgba(249,115,22,0.45)',
                     }}
                  >
                     {profileName?.[0]?.toUpperCase?.() || 'K'}
                  </Avatar>
               </IconButton>
               <Menu
                  anchorEl={profileAnchor}
                  open={profileOpen}
                  onClose={() => setProfileAnchor(null)}
                  PaperProps={{
                     sx: {
                        mt: 1,
                        minWidth: 220,
                        borderRadius: 2.5,
                        bgcolor: theme.bgPanel,
                        color: theme.text,
                        border: `1px solid ${theme.border}`,
                        boxShadow: '0 22px 50px rgba(0,0,0,0.5)',
                     },
                  }}
               >
                  <Box sx={{ px: 2, py: 1.2 }}>
                     <Typography sx={{ fontWeight: 950 }}>{profileName}</Typography>
                     <Typography sx={{ color: theme.textSoft, fontSize: 12 }}>{user?.position || user?.role || 'CRM'}</Typography>
                  </Box>
                  <Divider sx={{ borderColor: theme.border }} />
                  <MenuItem onClick={() => { setProfileAnchor(null); signOut({ callbackUrl: '/' }); }}>
                     <LogoutIcon sx={{ mr: 1, color: '#fb923c' }} /> Вийти
                  </MenuItem>
               </Menu>
            </Stack>
         </Box>

         <Box sx={{ px: { xs: 1.5, md: 3 }, pt: { xs: 1, md: 1.15 }, pb: 2.5 }}>
            <Stack spacing={2.2}>
             <Box
                sx={{
                  display: 'none',
                  border: `1px solid ${theme.border}`,
                  borderRadius: 3,
                  bgcolor: mode === 'light' ? 'rgba(255,255,255,0.9)' : 'rgba(10,10,18,0.68)',
                  px: { xs: 2, md: 2.5 },
                  py: 2,
               }}
            >
               <Stack direction={{ xs: 'column', md: 'row' }} alignItems={{ xs: 'flex-start', md: 'center' }} justifyContent="space-between" spacing={2}>
                  <Stack direction="row" alignItems="center" spacing={1.4}>
                     <Box
                        sx={{
                           width: 46,
                           height: 46,
                           borderRadius: 2,
                           display: 'grid',
                           placeItems: 'center',
                           color: '#f97316',
                           bgcolor: 'rgba(249,115,22,0.14)',
                           border: '1px solid rgba(249,115,22,0.34)',
                        }}
                     >
                        <CampaignRoundedIcon />
                     </Box>
                     <Box>
                        <Typography variant="h5" sx={{ fontWeight: 950, lineHeight: 1.05 }}>
                           Рекламний кабінет
                        </Typography>
                        <Typography sx={{ color: theme.textSoft, fontWeight: 700, mt: 0.5 }}>
                           Щоденник рекламних дій, витрат і сканерів по об’єктах
                        </Typography>
                     </Box>
                  </Stack>

                  <Button
                     startIcon={<AddRoundedIcon />}
                     onClick={handleOpenDialog}
                     sx={{
                        borderRadius: 999,
                        px: 2.4,
                        py: 1.1,
                        fontWeight: 950,
                        color: '#140a02',
                        bgcolor: '#fb923c',
                        '&:hover': { bgcolor: '#fdba74' },
                     }}
                   >
                      Додати дію
                   </Button>
                </Stack>

                <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.2} sx={{ mt: 2, display: 'none' }}>
                  {[
                     { icon: <QueryStatsRoundedIcon />, label: 'Дій', value: summary.total || 0, color: '#38bdf8' },
                     { icon: <PaymentsRoundedIcon />, label: 'Витрати', value: formatMoney(summary.totalCostUah), color: '#22c55e' },
                     { icon: <SearchRoundedIcon />, label: 'Сканери', value: summary.scannerCount || 0, color: '#facc15' },
                     { icon: <AddLinkRoundedIcon />, label: 'Нові', value: summary.newAdsCount || 0, color: '#a78bfa' },
                     { icon: <CloseRoundedIcon />, label: 'Деактивовано', value: summary.deactivatedCount || 0, color: '#ef4444' },
                  ].map((item) => (
                     <Box
                        key={item.label}
                        sx={{
                           flex: 1,
                           minWidth: 130,
                           px: 1.4,
                           py: 1,
                           borderRadius: 2,
                           border: `1px solid ${theme.border}`,
                           bgcolor: mode === 'light' ? 'rgba(124,58,237,0.035)' : 'rgba(255,255,255,0.035)',
                        }}
                     >
                        <Stack direction="row" alignItems="center" spacing={1}>
                           <Box sx={{ color: item.color, display: 'flex' }}>{item.icon}</Box>
                           <Typography sx={{ color: theme.textSoft, fontWeight: 850, fontSize: 13 }}>{item.label}</Typography>
                           <Typography sx={{ ml: 'auto', fontWeight: 950 }}>{item.value}</Typography>
                        </Stack>
                     </Box>
                  ))}
               </Stack>
            </Box>

             <Box
                sx={{
                   border: `1px solid ${theme.border}`,
                   borderRadius: 3,
                   bgcolor: mode === 'light' ? 'rgba(255,255,255,0.86)' : 'rgba(14,14,24,0.72)',
                   p: 1.15,
                }}
             >
                <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.2} alignItems={{ xs: 'stretch', md: 'center' }} sx={{ mb: 1 }}>
                   <Stack direction="row" alignItems="center" spacing={1} sx={{ flex: 1, minWidth: 0 }}>
                      <CampaignRoundedIcon sx={{ color: '#fb923c' }} />
                      <Typography sx={{ fontWeight: 950, whiteSpace: 'nowrap' }}>Об’єкти в роботі</Typography>
                      <Chip size="small" label={sortedAdvertisingProperties.length} sx={{ height: 20, fontSize: 11, fontWeight: 950 }} />
                      <Chip
                         size="small"
                         icon={<QueryStatsRoundedIcon sx={{ fontSize: '14px !important' }} />}
                         label={`дії ${summary.workActionsCount || 0}`}
                         sx={{
                            height: 22,
                            fontSize: 11,
                            fontWeight: 950,
                            color: '#bae6fd',
                            bgcolor: 'rgba(56,189,248,0.12)',
                            border: '1px solid rgba(56,189,248,0.28)',
                         }}
                      />
                      <Chip
                         size="small"
                         icon={<AddLinkRoundedIcon sx={{ fontSize: '14px !important' }} />}
                         label={`створення ${summary.newAdsCount || 0}`}
                         sx={{
                            height: 22,
                            fontSize: 11,
                            fontWeight: 950,
                            color: '#c4b5fd',
                            bgcolor: 'rgba(167,139,250,0.12)',
                            border: '1px solid rgba(167,139,250,0.28)',
                         }}
                      />
                      <Chip
                         size="small"
                         icon={<AutoFixHighRoundedIcon sx={{ fontSize: '14px !important' }} />}
                         label={`покращення ${summary.improvementsCount || 0}`}
                         sx={{
                            height: 22,
                            fontSize: 11,
                            fontWeight: 950,
                            color: '#fdba74',
                            bgcolor: 'rgba(251,146,60,0.12)',
                            border: '1px solid rgba(251,146,60,0.28)',
                         }}
                      />
                      {advertisingPropertiesLoading && <CircularProgress size={16} sx={{ color: theme.textSoft }} />}
                   </Stack>
                   <TextField
                      size="small"
                      label="Пошук об’єкта"
                      value={propertyWorkSearch}
                      onChange={(e) => setPropertyWorkSearch(e.target.value)}
                      sx={{ ...fieldSx, minWidth: { xs: '100%', md: 280 } }}
                   />
                   <Button
                      onClick={() => setShowAllWorkObjects((prev) => !prev)}
                      startIcon={<QueryStatsRoundedIcon />}
                      sx={{
                         borderRadius: 2,
                         px: 1.35,
                         color: showAllWorkObjects ? '#140a02' : theme.text,
                         bgcolor: showAllWorkObjects ? '#fb923c' : 'rgba(255,255,255,0.05)',
                         border: `1px solid ${showAllWorkObjects ? '#fb923c' : theme.border}`,
                         fontWeight: 950,
                         whiteSpace: 'nowrap',
                      }}
                   >
                      {showAllWorkObjects ? 'Стрічка' : 'Всі'}
                   </Button>
                   {selectedAdvertisingPropertyId && (
                      <Button onClick={clearSelectedAdvertisingProperty} sx={{ color: theme.textSoft, fontWeight: 900, whiteSpace: 'nowrap' }}>
                         Усі дії
                      </Button>
                   )}
                </Stack>

                <Box
                   sx={{
                      display: 'flex',
                      gap: 1,
                      overflowX: showAllWorkObjects ? 'visible' : 'auto',
                      flexWrap: showAllWorkObjects ? 'wrap' : 'nowrap',
                      pb: showAllWorkObjects ? 0 : 0.65,
                      scrollSnapType: showAllWorkObjects ? 'none' : 'x proximity',
                      '&::-webkit-scrollbar': { height: 8 },
                      '&::-webkit-scrollbar-thumb': { bgcolor: 'rgba(148,163,184,0.22)', borderRadius: 999 },
                   }}
                >
                   {sortedAdvertisingProperties.map((property) => {
                      const settings = property.advertisingSettings || {};
                      const counters = property.advertisingCounters || {};
                      const selected = String(property._id) === String(selectedAdvertisingPropertyId);
                      const imageUrl = getImageUrl(property);
                      const priority = getPriorityMeta(settings.priority || 3);

                      return (
                         <Box
                            key={property._id}
                            onClick={() => selectAdvertisingPropertyForActions(property, { toggle: true })}
                            sx={{
                               width: showAllWorkObjects ? { xs: '100%', sm: 'calc(50% - 4px)', lg: 'calc(25% - 9px)', xl: 'calc(20% - 10px)' } : { xs: 238, md: 258 },
                               minWidth: showAllWorkObjects ? 0 : { xs: 238, md: 258 },
                               scrollSnapAlign: 'start',
                               borderRadius: 2.2,
                               border: `1px solid ${selected ? priority.color : theme.border}`,
                               bgcolor: selected ? 'rgba(249,115,22,0.10)' : 'rgba(255,255,255,0.032)',
                               overflow: 'hidden',
                               cursor: 'pointer',
                               transition: '0.18s ease',
                               boxShadow: selected ? `0 0 0 1px ${priority.color}55` : 'none',
                               '&:hover': { borderColor: priority.color, transform: 'translateY(-1px)' },
                            }}
                         >
                            <Box sx={{ height: 3, bgcolor: priority.color }} />
                            <Stack direction="row" spacing={0.8} sx={{ p: 0.85 }}>
                               <Box
                                  sx={{
                                     width: 54,
                                     height: 54,
                                     flex: '0 0 54px',
                                     borderRadius: 1.6,
                                     overflow: 'hidden',
                                     bgcolor: 'rgba(255,255,255,0.05)',
                                     border: `1px solid ${theme.border}`,
                                     display: 'grid',
                                     placeItems: 'center',
                                  }}
                               >
                                  {imageUrl ? (
                                     <Box component="img" src={imageUrl} alt="" sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                  ) : (
                                     <CampaignRoundedIcon sx={{ color: theme.textSoft }} />
                                  )}
                               </Box>
                               <Box sx={{ minWidth: 0, flex: 1 }}>
                                  <Stack direction="row" spacing={0.45} alignItems="center" sx={{ mb: 0.35 }}>
                                     <Chip
                                        size="small"
                                        icon={<StarRoundedIcon sx={{ fontSize: '13px !important' }} />}
                                        label={priority.label}
                                        sx={{ height: 20, fontSize: 10.5, fontWeight: 950, color: priority.color, bgcolor: priority.bg, border: `1px solid ${priority.color}55`, '& .MuiChip-label': { px: 0.45 } }}
                                     />
                                     <Chip size="small" label={getAdvertisingStatusLabel(settings.status)} sx={{ height: 20, maxWidth: 82, fontSize: 10.5, fontWeight: 900, color: '#86efac', bgcolor: 'rgba(34,197,94,0.10)', border: '1px solid rgba(34,197,94,0.24)', '& .MuiChip-label': { px: 0.65 } }} />
                                  </Stack>
                                  <Typography sx={{ fontWeight: 950, fontSize: 12.5, lineHeight: 1.1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                     {propertyLabel(property)}
                                  </Typography>
                                  <Typography sx={{ color: theme.textSoft, fontSize: 10.8, fontWeight: 750, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', mt: 0.15 }}>
                                     {property.location_text || 'Адресу не вказано'}
                                  </Typography>
                                  <Stack direction="row" spacing={0.35} alignItems="center" sx={{ mt: 0.45 }}>
                                     <Chip size="small" icon={<PersonRoundedIcon sx={{ fontSize: '12px !important' }} />} label={employeeName(settings.assignedEmployee)} sx={{ height: 18, maxWidth: 96, fontSize: 9.5, fontWeight: 850, '& .MuiChip-label': { px: 0.45 } }} />
                                     <Chip size="small" label={`дії ${counters.events || 0}`} sx={{ height: 18, fontSize: 9.5, fontWeight: 850, '& .MuiChip-label': { px: 0.55 } }} />
                                  </Stack>
                               </Box>
                               <Tooltip title={selected ? 'Згорнути' : 'Обробляємо'}>
                                  <IconButton
                                     size="small"
                                     onClick={(e) => {
                                         e.stopPropagation();
                                         if (selected) {
                                           clearSelectedAdvertisingProperty();
                                         } else {
                                            handleOpenActionForProperty(property);
                                         }
                                     }}
                                     sx={{
                                        width: 30,
                                        height: 30,
                                        color: selected ? theme.textSoft : '#fb923c',
                                        border: `1px solid ${selected ? priority.color : theme.border}`,
                                        bgcolor: selected ? 'rgba(255,255,255,0.055)' : 'rgba(251,146,60,0.08)',
                                     }}
                                  >
                                     {selected ? <CloseRoundedIcon sx={{ fontSize: 17 }} /> : <AutoFixHighRoundedIcon sx={{ fontSize: 17 }} />}
                                  </IconButton>
                               </Tooltip>
                            </Stack>
                         </Box>
                      );
                   })}
                </Box>

                {selectedAdvertisingProperty && (() => {
                   const property = selectedAdvertisingProperty;
                   const settings = property.advertisingSettings || {};
                   const counters = property.advertisingCounters || {};
                   const priority = getPriorityMeta(settings.priority || 3);
                   const activeLinks = getActiveAdvertisingLinks(property);
                   const realtorInfo = [
                      property.location_text,
                      property.type_deal,
                      property.type_estate,
                      property.cost ? formatMoney(property.cost, property.currency || 'USD') : '',
                   ].filter(Boolean).join(' · ');

                   return (
                      <Box
                         sx={{
                            mt: 1,
                            borderRadius: 2.4,
                            border: `1px solid ${priority.color}66`,
                            bgcolor: 'rgba(9,9,18,0.72)',
                            overflow: 'hidden',
                         }}
                      >
                         <Stack direction={{ xs: 'column', md: 'row' }} spacing={1} alignItems={{ xs: 'stretch', md: 'center' }} sx={{ px: 1.1, py: 0.9, borderBottom: `1px solid ${theme.border}` }}>
                            <Stack direction="row" spacing={0.8} alignItems="center" sx={{ minWidth: 0, flex: 1 }}>
                               <Chip size="small" icon={<StarRoundedIcon sx={{ fontSize: '15px !important' }} />} label={`${priority.label} - ${priority.text}`} sx={{ height: 24, color: priority.color, bgcolor: priority.bg, border: `1px solid ${priority.color}55`, fontWeight: 950 }} />
                               <Typography sx={{ fontWeight: 950, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                  {propertyLabel(property)}
                               </Typography>
                            </Stack>
                            <Stack direction="row" spacing={0.6} alignItems="center" justifyContent={{ xs: 'flex-start', md: 'flex-end' }}>
                               <Button size="small" startIcon={<TrackChangesRoundedIcon />} onClick={() => handleOpenActionForProperty(property, activeLinks[0], 'scanner')} sx={{ color: '#fde047', fontWeight: 950, borderRadius: 2, border: `1px solid ${theme.border}` }}>
                                  Сканер
                               </Button>
                               <Button size="small" startIcon={<AutoFixHighRoundedIcon />} onClick={() => handleOpenActionForProperty(property, activeLinks[0], 'updated_improved')} sx={{ color: '#fb923c', fontWeight: 950, borderRadius: 2, border: `1px solid ${theme.border}` }}>
                                  Покращення
                                </Button>
                                <Tooltip title="Згорнути">
                                  <IconButton size="small" onClick={clearSelectedAdvertisingProperty} sx={{ color: theme.textSoft, border: `1px solid ${theme.border}` }}>
                                     <CloseRoundedIcon fontSize="small" />
                                  </IconButton>
                               </Tooltip>
                            </Stack>
                         </Stack>

                         <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '1.1fr 1.2fr 1fr' }, gap: 1, p: 1.1 }}>
                            <Box sx={{ p: 1, borderRadius: 2, border: `1px solid ${theme.border}`, bgcolor: 'rgba(255,255,255,0.025)' }}>
                               <Typography sx={{ color: theme.textSoft, fontSize: 11, fontWeight: 950, mb: 0.5 }}>Інфа від рієлтора</Typography>
                               <Typography sx={{ fontWeight: 850, fontSize: 13, lineHeight: 1.35 }}>{realtorInfo || 'Даних ще немає'}</Typography>
                               <Stack direction="row" spacing={0.45} flexWrap="wrap" useFlexGap sx={{ mt: 0.75 }}>
                                  <Chip size="small" icon={<PersonRoundedIcon sx={{ fontSize: '14px !important' }} />} label={employeeName(settings.assignedEmployee)} sx={{ height: 22, fontSize: 10.5, fontWeight: 850 }} />
                                  <Chip size="small" label={`ціна ${settings.price ? formatMoney(settings.price, settings.currency || 'USD') : '-'}`} sx={{ height: 22, fontSize: 10.5, fontWeight: 850 }} />
                                  <Chip size="small" label={`дій ${counters.events || 0}`} sx={{ height: 22, fontSize: 10.5, fontWeight: 850 }} />
                                  <Chip size="small" label={`скан ${counters.scanners || 0}`} sx={{ height: 22, fontSize: 10.5, fontWeight: 850 }} />
                               </Stack>
                            </Box>

                            <Box sx={{ p: 1, borderRadius: 2, border: `1px solid ${theme.border}`, bgcolor: 'rgba(251,146,60,0.045)' }}>
                               <Typography sx={{ color: '#fdba74', fontSize: 11, fontWeight: 950, mb: 0.5 }}>Завдання</Typography>
                               <Typography sx={{ fontSize: 13, fontWeight: 850, lineHeight: 1.35 }}>
                                  {settings.note || 'Завдання для рекламного відділу ще не вказане'}
                               </Typography>
                            </Box>

                            <Box sx={{ p: 1, borderRadius: 2, border: `1px solid ${theme.border}`, bgcolor: 'rgba(255,255,255,0.025)' }}>
                               <Typography sx={{ color: theme.textSoft, fontSize: 11, fontWeight: 950, mb: 0.5 }}>Чорновий текст</Typography>
                               <Typography sx={{ color: settings.draftText ? theme.text : theme.textSoft, fontSize: 12.5, fontWeight: 750, lineHeight: 1.35, maxHeight: 54, overflow: 'hidden' }}>
                                  {settings.draftText || 'Чорнового тексту ще немає'}
                               </Typography>
                            </Box>
                         </Box>

                         {!!activeLinks.length && (
                            <Stack direction="row" spacing={0.55} flexWrap="wrap" useFlexGap sx={{ px: 1.1, pb: 1.1 }}>
                               {activeLinks.map((link) => (
                                  <Chip
                                     key={link._id}
                                     size="small"
                                     icon={<LinkRoundedIcon sx={{ fontSize: '14px !important' }} />}
                                     label={adLinkLabel(link, '', property.advertisingLinks || [])}
                                     component={link.url ? 'a' : 'div'}
                                     href={link.url || undefined}
                                     target={link.url ? '_blank' : undefined}
                                     rel={link.url ? 'noreferrer' : undefined}
                                     clickable={Boolean(link.url)}
                                     sx={{ height: 24, color: '#d8fff0', bgcolor: 'rgba(34,197,94,0.10)', border: '1px solid rgba(34,197,94,0.26)', fontWeight: 950, textDecoration: 'none' }}
                                  />
                               ))}
                            </Stack>
                         )}
                      </Box>
                   );
                })()}
             </Box>

             <Box
                sx={{
                  display: 'none',
                   border: `1px solid ${theme.border}`,
                   borderRadius: 3,
                   bgcolor: mode === 'light' ? 'rgba(255,255,255,0.86)' : 'rgba(14,14,24,0.72)',
                  p: 1.4,
               }}
            >
               <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.2} alignItems={{ xs: 'stretch', md: 'center' }} sx={{ mb: 1.2 }}>
                  <Stack direction="row" alignItems="center" spacing={1} sx={{ flex: 1 }}>
                     <CampaignRoundedIcon sx={{ color: '#fb923c' }} />
                     <Typography sx={{ fontWeight: 950 }}>Об’єкти в рекламі</Typography>
                     {advertisingPropertiesLoading && <CircularProgress size={16} sx={{ color: theme.textSoft }} />}
                  </Stack>
                  <TextField
                     size="small"
                     label="Пошук об’єкта"
                     value={propertyWorkSearch}
                     onChange={(e) => setPropertyWorkSearch(e.target.value)}
                     sx={{ ...fieldSx, minWidth: { xs: '100%', md: 280 } }}
                  />
                  {selectedAdvertisingPropertyId && (
                     <Button onClick={() => setSelectedAdvertisingPropertyId('')} sx={{ color: theme.textSoft, fontWeight: 900 }}>
                        Усі дії
                     </Button>
                  )}
               </Stack>

               <Box
                  sx={{
                     display: 'grid',
                     gridTemplateColumns: { xs: '1fr', md: 'repeat(2, minmax(0, 1fr))', xl: 'repeat(3, minmax(0, 1fr))' },
                     gap: 1,
                  }}
               >
                  {advertisingProperties.map((property) => {
                     const settings = property.advertisingSettings || {};
                     const counters = property.advertisingCounters || {};
                     const selected = String(property._id) === String(selectedAdvertisingPropertyId);
                     const imageUrl = getImageUrl(property);

                     return (
                        <Box
                           key={property._id}
                           onClick={() => setSelectedAdvertisingPropertyId(selected ? '' : property._id)}
                           sx={{
                              minHeight: 112,
                              borderRadius: 2,
                              border: `1px solid ${selected ? '#fb923c' : theme.border}`,
                              bgcolor: selected
                                 ? 'rgba(249,115,22,0.1)'
                                 : (mode === 'light' ? 'rgba(124,58,237,0.035)' : 'rgba(255,255,255,0.035)'),
                              p: 1,
                              cursor: 'pointer',
                              transition: '0.18s ease',
                              '&:hover': { borderColor: '#fb923c', transform: 'translateY(-1px)' },
                           }}
                        >
                           <Stack direction="row" spacing={1.1}>
                              <Box
                                 sx={{
                                    width: 84,
                                    height: 84,
                                    flex: '0 0 84px',
                                    borderRadius: 2,
                                    overflow: 'hidden',
                                    bgcolor: 'rgba(255,255,255,0.05)',
                                    border: `1px solid ${theme.border}`,
                                    display: 'grid',
                                    placeItems: 'center',
                                 }}
                              >
                                 {imageUrl ? (
                                    <Box component="img" src={imageUrl} alt="" sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                 ) : (
                                    <CampaignRoundedIcon sx={{ color: theme.textSoft }} />
                                 )}
                              </Box>
                              <Box sx={{ minWidth: 0, flex: 1 }}>
                                 <Stack direction="row" spacing={0.7} alignItems="center">
                                    <Chip
                                       size="small"
                                       icon={<StarRoundedIcon sx={{ fontSize: '16px !important' }} />}
                                       label={settings.priority || 3}
                                       sx={{ height: 23, fontWeight: 950, color: '#facc15', bgcolor: 'rgba(250,204,21,0.12)', border: '1px solid rgba(250,204,21,0.32)' }}
                                    />
                                    <Chip
                                       size="small"
                                       label={settings.status === 'paused' ? 'пауза' : settings.status === 'done' ? 'готово' : settings.status === 'none' ? 'без реклами' : 'активно'}
                                       sx={{ height: 23, fontWeight: 900, color: '#22c55e', bgcolor: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.32)' }}
                                    />
                                    <Typography sx={{ ml: 'auto', color: theme.textSoft, fontSize: 12, fontWeight: 800 }}>
                                       {counters.lastActionAt ? formatDateTime(counters.lastActionAt) : 'без дій'}
                                    </Typography>
                                 </Stack>

                                 <Typography sx={{ mt: 0.6, fontWeight: 950, lineHeight: 1.15, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                    {propertyLabel(property)}
                                 </Typography>
                                 <Typography sx={{ color: theme.textSoft, fontSize: 12, fontWeight: 750, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                    {property.location_text || 'Адресу не вказано'}
                                 </Typography>

                                  <Stack direction="row" spacing={0.6} flexWrap="wrap" sx={{ mt: 0.7 }}>
                                     <Chip size="small" icon={<PersonRoundedIcon sx={{ fontSize: '15px !important' }} />} label={employeeName(settings.assignedEmployee)} sx={{ height: 22, fontSize: 11, fontWeight: 850 }} />
                                      <Chip size="small" label={`ціна ${settings.price ? formatMoney(settings.price, settings.currency || 'USD') : '-'}`} sx={{ height: 22, fontSize: 11, fontWeight: 850 }} />
                                     <Chip size="small" label={`дії ${counters.events || 0}`} sx={{ height: 22, fontSize: 11, fontWeight: 850 }} />
                                     <Chip size="small" label={`скан ${counters.scanners || 0}`} sx={{ height: 22, fontSize: 11, fontWeight: 850 }} />
                                     <Chip size="small" label={`лінки ${counters.activeLinks || 0}/${counters.links || 0}`} sx={{ height: 22, fontSize: 11, fontWeight: 850 }} />
                                     <Chip size="small" label={`тексти ${counters.texts || 0}`} sx={{ height: 22, fontSize: 11, fontWeight: 850 }} />
                                  </Stack>

                                  {!!property.advertisingLinks?.length && (
                                     <Stack direction="row" spacing={0.45} flexWrap="wrap" onClick={(e) => e.stopPropagation()} sx={{ mt: 0.65 }}>
                                        {property.advertisingLinks.slice(0, 5).map((link) => {
                                           const archived = Boolean(link.closedAt || link.status === 'archived');
                                           return (
                                              <Stack
                                                 key={link._id}
                                                 direction="row"
                                                 alignItems="center"
                                                 spacing={0.2}
                                                 sx={{
                                                    height: 22,
                                                    borderRadius: 999,
                                                    bgcolor: archived ? 'rgba(148,163,184,0.08)' : 'rgba(34,197,94,0.1)',
                                                    border: `1px solid ${archived ? 'rgba(148,163,184,0.22)' : 'rgba(34,197,94,0.28)'}`,
                                                    overflow: 'hidden',
                                                 }}
                                              >
                                                 <Chip
                                                    size="small"
                                                    label={adLinkLabel(link, '', property.advertisingLinks || [])}
                                                    component={link.url ? 'a' : 'div'}
                                                    href={link.url || undefined}
                                                    target={link.url ? '_blank' : undefined}
                                                    rel={link.url ? 'noreferrer' : undefined}
                                                    clickable={Boolean(link.url)}
                                                    sx={{
                                                       height: 20,
                                                       maxWidth: 86,
                                                       fontSize: 10.5,
                                                       fontWeight: 950,
                                                       color: archived ? theme.textSoft : '#d8fff0',
                                                       bgcolor: 'transparent',
                                                       textDecoration: 'none',
                                                       '& .MuiChip-label': { px: 0.8 },
                                                    }}
                                                 />
                                                 {!archived && (
                                                    <>
                                                       <Tooltip title="Сканер">
                                                          <IconButton size="small" onClick={() => handleOpenActionForProperty(property, link, 'scanner')} sx={{ width: 20, height: 20, color: '#fde047' }}>
                                                             <TrackChangesRoundedIcon sx={{ fontSize: 13 }} />
                                                          </IconButton>
                                                       </Tooltip>
                                                       <Tooltip title="Покращення">
                                                          <IconButton size="small" onClick={() => handleOpenActionForProperty(property, link, 'updated_improved')} sx={{ width: 20, height: 20, color: '#fb923c' }}>
                                                             <AutoFixHighRoundedIcon sx={{ fontSize: 13 }} />
                                                          </IconButton>
                                                       </Tooltip>
                                                    </>
                                                 )}
                                              </Stack>
                                           );
                                        })}
                                     </Stack>
                                  )}

                                  {(settings.note || settings.draftText) && (
                                     <Typography sx={{ color: settings.note ? '#fdba74' : theme.textSoft, fontSize: 12, fontWeight: settings.note ? 850 : 700, mt: 0.6, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                        {settings.note ? `Завдання: ${settings.note}` : settings.draftText}
                                     </Typography>
                                  )}
                              </Box>
                              <Stack spacing={0.5} onClick={(e) => e.stopPropagation()}>
                                 <Tooltip title="Додати дію">
                                    <IconButton size="small" onClick={() => handleOpenActionForProperty(property)} sx={{ color: '#fb923c' }}>
                                       <AddRoundedIcon fontSize="small" />
                                    </IconButton>
                                 </Tooltip>
                              </Stack>
                           </Stack>
                        </Box>
                     );
                  })}
               </Box>
            </Box>

             <Box
                sx={{
                   display: { xs: 'grid', md: 'none' },
                   gridTemplateColumns: { xs: '1fr', md: EVENT_GRID_COLUMNS },
                  gap: 0.8,
                  alignItems: 'center',
               }}
            >
               <Stack direction="row" spacing={0.6}>
                  <TextField select size="small" label="Період" value={filters.period} onChange={(e) => setFilters((prev) => ({ ...prev, period: e.target.value }))} sx={{ ...compactFieldSx, flex: 1 }}>
                     {PERIOD_OPTIONS.map(([value, label]) => <MenuItem key={value} value={value}>{label}</MenuItem>)}
                  </TextField>
                  {(filters.period === 'day' || filters.period === 'range') && (
                     <TextField
                        size="small"
                        type="date"
                        label={filters.period === 'range' ? 'Від' : ''}
                        value={filters.day}
                        onChange={(e) => setFilters((prev) => ({ ...prev, day: e.target.value }))}
                        sx={{ ...compactFieldSx, flex: 1.1 }}
                        InputLabelProps={{ shrink: true }}
                     />
                  )}
                  {filters.period === 'range' && (
                     <TextField
                        size="small"
                        type="date"
                        label="До"
                        value={filters.dateTo}
                        onChange={(e) => setFilters((prev) => ({ ...prev, dateTo: e.target.value }))}
                        sx={{ ...compactFieldSx, flex: 1.1 }}
                        InputLabelProps={{ shrink: true }}
                     />
                  )}
               </Stack>
               <TextField select size="small" label="Дія" value={filters.actionType} onChange={(e) => setFilters((prev) => ({ ...prev, actionType: e.target.value }))} sx={compactFieldSx}>
                  <MenuItem value="all">Усі дії</MenuItem>
                  {ACTION_OPTIONS.map(([value, label]) => <MenuItem key={value} value={value}>{label}</MenuItem>)}
               </TextField>
               <TextField select size="small" label="Майданчик" value={filters.platform} onChange={(e) => setFilters((prev) => ({ ...prev, platform: e.target.value }))} sx={compactFieldSx}>
                  <MenuItem value="all">Усі</MenuItem>
                  {PLATFORM_OPTIONS.map(([value, label]) => <MenuItem key={value} value={value}>{label}</MenuItem>)}
               </TextField>
               <TextField select size="small" label="Рекламщик" value={filters.employee} onChange={(e) => setFilters((prev) => ({ ...prev, employee: e.target.value }))} sx={compactFieldSx}>
                  <MenuItem value="all">Усі</MenuItem>
                  {employees.map((employee) => <MenuItem key={employee._id} value={employee._id}>{employeeName(employee)}</MenuItem>)}
               </TextField>
               <TextField
                  size="small"
                  label="Пошук"
                  value={filters.q}
                  onChange={(e) => setFilters((prev) => ({ ...prev, q: e.target.value }))}
                  onKeyDown={(e) => { if (e.key === 'Enter') fetchEvents(); }}
                  sx={compactFieldSx}
               />
               <Box sx={{ display: { xs: 'none', md: 'block' }, gridColumn: '5 / 12' }} />
               <Tooltip title="Скинути фільтри">
                  <IconButton onClick={resetFilters} sx={{ width: 40, height: 40, borderRadius: 1.6, border: `1px solid ${theme.border}`, color: theme.text }}>
                     <FilterAltOffRoundedIcon fontSize="small" />
                  </IconButton>
               </Tooltip>
            </Box>

             {error && <Alert severity="error" sx={{ borderRadius: 2 }}>{error}</Alert>}

             <Stack spacing={0.65}>
                <Box
                   sx={{
                      border: `1px solid ${theme.border}`,
                      borderRadius: 2,
                      bgcolor: 'rgba(13,15,26,0.92)',
                      p: 1,
                      boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.03)',
                   }}
                >
                   <Box
                      sx={{
                         display: 'grid',
                         gridTemplateColumns: { xs: '1fr', md: EVENT_GRID_COLUMNS },
                         gap: 0.8,
                         alignItems: 'center',
                      }}
                   >
                      <TextField
                         size="small"
                         label="Дата і час"
                         type="datetime-local"
                         value={form.occurredAt}
                         onChange={(e) => handleFormTimeChange(e.target.value)}
                         sx={{
                            ...compactFieldSx,
                            '& .MuiInputBase-input': {
                               ...compactFieldSx['& .MuiInputBase-input'],
                               fontSize: 11,
                               px: 1,
                            },
                         }}
                         InputLabelProps={{ shrink: true }}
                      />
                      <TextField select size="small" label="Дія" value={form.actionType} onChange={(e) => handleFormChange('actionType', e.target.value)} sx={compactFieldSx}>
                         {ACTION_OPTIONS.map(([value, label]) => <MenuItem key={value} value={value}>{label}</MenuItem>)}
                      </TextField>
                      {creatingAdLink ? (
                         <TextField select size="small" label="Сайт" value={form.platform} onChange={(e) => handleFormChange('platform', e.target.value)} sx={compactFieldSx}>
                            {PLATFORM_OPTIONS.map(([value, label]) => <MenuItem key={value} value={value}>{label}</MenuItem>)}
                         </TextField>
                      ) : (
                         <TextField
                            select
                            size="small"
                            label="Реклама"
                            value={form.advertisingLinkId}
                            onChange={(e) => handleFormChange('advertisingLinkId', e.target.value)}
                            sx={compactFieldSx}
                            disabled={!form.property}
                         >
                            {!selectedLinks.length && <MenuItem value="">Немає реклами</MenuItem>}
                            {selectedLinks.map((link) => (
                               <MenuItem key={link._id} value={link._id}>
                                  {adLinkLabel(link, '', selectedProperty?.advertisingLinks || [])}
                               </MenuItem>
                            ))}
                         </TextField>
                      )}
                      <Autocomplete
                         options={propertyLookupOptions}
                         value={selectedProperty}
                         onChange={(_, value) => handleSelectFormProperty(value)}
                         onInputChange={(_, value, reason) => {
                            if (reason === 'input') setPropertySearch(value);
                         }}
                         getOptionLabel={(option) => propertyLabel(option)}
                         isOptionEqualToValue={(option, value) => String(option?._id || '') === String(value?._id || '')}
                         filterOptions={(options) => options}
                         loading={propertiesLoading}
                         noOptionsText={propertySearch.trim().length >= PROPERTY_MIN_SEARCH_LENGTH ? 'Не знайдено' : `Введи мінімум ${PROPERTY_MIN_SEARCH_LENGTH} символи`}
                         renderOption={(props, option) => (
                            <Box component="li" {...props} key={option._id} sx={{ display: 'block !important', py: 1.1 }}>
                               <Typography sx={{ fontWeight: 950, color: theme.text, lineHeight: 1.15 }}>
                                  {propertyLabel(option)}
                               </Typography>
                               <Typography sx={{ color: theme.textSoft, fontSize: 12, fontWeight: 700 }}>
                                  {[option.location_text, option.cost ? `${Number(option.cost).toLocaleString('uk-UA')} ${option.currency || 'USD'}` : '', option.assignee?.name].filter(Boolean).join(' · ')}
                               </Typography>
                            </Box>
                         )}
                         renderInput={(params) => (
                            <TextField
                               {...params}
                               required
                               label="Об’єкт"
                               size="small"
                               sx={compactFieldSx}
                               InputProps={{
                                  ...params.InputProps,
                                  endAdornment: (
                                     <>
                                        {propertiesLoading ? <CircularProgress color="inherit" size={16} /> : null}
                                        {params.InputProps.endAdornment}
                                     </>
                                  ),
                               }}
                            />
                         )}
                         PaperComponent={(props) => <Box {...props} sx={{ minWidth: { xs: 320, sm: 560 }, bgcolor: theme.bgPanel, color: theme.text, border: `1px solid ${theme.border}` }} />}
                         ListboxProps={{ sx: { maxHeight: 360 } }}
                      />
                      <Box
                         sx={{
                            gridColumn: { xs: 'auto', md: '5 / 11' },
                            display: 'grid',
                            gridTemplateColumns: { xs: '1fr', md: 'repeat(6, minmax(0, 1fr))' },
                            gap: 0.35,
                            alignItems: 'center',
                         }}
                      >
                         {showQuickNumbers ? (
                            <>
                               <TextField size="small" type="number" placeholder="0" value={form.views} onChange={(e) => handleFormChange('views', e.target.value)} sx={metricFieldSx} InputProps={{ startAdornment: <InputAdornment position="start"><VisibilityRoundedIcon sx={{ fontSize: 12, color: theme.textSoft }} /></InputAdornment> }} />
                               <TextField size="small" type="number" placeholder="0" value={form.favorites} onChange={(e) => handleFormChange('favorites', e.target.value)} sx={metricFieldSx} InputProps={{ startAdornment: <InputAdornment position="start"><BookmarkRoundedIcon sx={{ fontSize: 12, color: theme.textSoft }} /></InputAdornment> }} />
                               <TextField size="small" type="number" placeholder="0" value={form.phoneOpens} onChange={(e) => handleFormChange('phoneOpens', e.target.value)} sx={metricFieldSx} InputProps={{ startAdornment: <InputAdornment position="start"><CallMadeRoundedIcon sx={{ fontSize: 12, color: theme.textSoft }} /></InputAdornment> }} />
                               <TextField size="small" type="number" placeholder="0" value={form.messages} onChange={(e) => handleFormChange('messages', e.target.value)} sx={metricFieldSx} InputProps={{ startAdornment: <InputAdornment position="start"><ChatRoundedIcon sx={{ fontSize: 12, color: theme.textSoft }} /></InputAdornment> }} />
                               <TextField size="small" type="number" placeholder="0" value={form.calls} onChange={(e) => handleFormChange('calls', e.target.value)} sx={metricFieldSx} InputProps={{ startAdornment: <InputAdornment position="start"><PhoneInTalkRoundedIcon sx={{ fontSize: 12, color: theme.textSoft }} /></InputAdornment> }} />
                               <TextField size="small" type="number" placeholder="0" value={form.costUah} onChange={(e) => handleFormChange('costUah', e.target.value)} sx={metricFieldSx} InputProps={{ startAdornment: <InputAdornment position="start"><MoneyOffRoundedIcon sx={{ fontSize: 12, color: theme.textSoft }} /></InputAdornment> }} />
                            </>
                         ) : (
                            <TextField
                               size="small"
                               placeholder="URL"
                               value={form.linkUrl}
                               onChange={(e) => handleFormChange('linkUrl', e.target.value)}
                               sx={{ ...metricFieldSx, gridColumn: { xs: 'auto', md: '1 / -1' } }}
                               InputProps={{
                                  startAdornment: (
                                     <InputAdornment position="start">
                                        <LinkRoundedIcon sx={{ fontSize: 12, color: theme.textSoft }} />
                                     </InputAdornment>
                                  ),
                               }}
                            />
                         )}
                         <TextField
                            size="small"
                            placeholder="Примітка"
                            value={form.note}
                            onChange={(e) => handleFormChange('note', e.target.value)}
                            sx={{
                               ...compactFieldSx,
                               gridColumn: { xs: 'auto', md: '1 / -1' },
                               '& .MuiOutlinedInput-root': {
                                  ...compactFieldSx['& .MuiOutlinedInput-root'],
                                  height: 18,
                                  borderRadius: 1.1,
                               },
                               '& .MuiInputBase-input': {
                                  ...compactFieldSx['& .MuiInputBase-input'],
                                  fontSize: 10.5,
                                  py: 0,
                               },
                            }}
                         />
                      </Box>
                       <Box sx={{ display: { xs: 'none', md: 'block' }, gridColumn: '11 / 12' }} />
                       <Stack direction="row" spacing={0.55} alignItems="center" justifyContent="flex-end">
                          <Tooltip title={showDemoRows ? 'Сховати демо' : 'Показати демо'}>
                             <IconButton
                                onClick={() => setShowDemoRows((prev) => !prev)}
                                sx={{
                                   width: 34,
                                   height: 34,
                                   borderRadius: 1.6,
                                   color: showDemoRows ? '#140a02' : theme.textSoft,
                                   bgcolor: showDemoRows ? '#facc15' : 'rgba(255,255,255,0.05)',
                                   border: `1px solid ${showDemoRows ? '#facc15' : theme.border}`,
                                   '&:hover': { bgcolor: showDemoRows ? '#fde047' : 'rgba(255,255,255,0.09)' },
                                }}
                             >
                                <Typography sx={{ fontSize: 9.5, fontWeight: 950, lineHeight: 1 }}>Демо</Typography>
                             </IconButton>
                          </Tooltip>
                          <Tooltip title="Додати дію">
                             <span>
                                <IconButton
                                   disabled={saving || !form.property || (!creatingAdLink && !form.advertisingLinkId)}
                                   onClick={handleSubmit}
                                   sx={{
                                      width: 44,
                                      height: 44,
                                      borderRadius: 1.8,
                                      color: '#120a04',
                                      bgcolor: '#fb923c',
                                      border: '1px solid rgba(251,146,60,0.65)',
                                      '&:hover': { bgcolor: '#fdba74' },
                                      '&.Mui-disabled': {
                                         color: 'rgba(255,255,255,0.35)',
                                         bgcolor: 'rgba(255,255,255,0.06)',
                                      },
                                   }}
                                >
                                   {saving ? <CircularProgress size={18} color="inherit" /> : <AddRoundedIcon />}
                                </IconButton>
                             </span>
                          </Tooltip>
                       </Stack>
                    </Box>
                 </Box>

                {showDemoHint && (
                   <Alert severity="info" sx={{ borderRadius: 2 }}>
                      Поки реальних записів немає, нижче показую демо-вигляд рекламного журналу.
                  </Alert>
               )}

               <Box
                  sx={{
                     display: { xs: 'none', md: 'grid' },
                     gridTemplateColumns: EVENT_GRID_COLUMNS,
                     gap: 0.8,
                     alignItems: 'center',
                     px: 1.2,
                     py: 0.55,
                     color: theme.textSoft,
                     fontSize: 11,
                     fontWeight: 950,
                     textTransform: 'uppercase',
                     letterSpacing: 0,
                  }}
               >
                   <Stack direction="row" spacing={0.35} sx={{ minWidth: 0 }}>
                      <TextField
                         select
                         size="small"
                         label="Дата"
                         value={filters.period}
                         onChange={(e) => setFilters((prev) => ({ ...prev, period: e.target.value }))}
                         sx={{ ...headerFilterSx, textTransform: 'none', flex: (filters.period === 'day' || filters.period === 'range') ? '0 0 66px' : 1, minWidth: 0 }}
                      >
                         {PERIOD_OPTIONS.map(([value, label]) => <MenuItem key={value} value={value}>{label}</MenuItem>)}
                      </TextField>
                      {(filters.period === 'day' || filters.period === 'range') && (
                         <TextField
                            size="small"
                            type="date"
                            label={filters.period === 'range' ? 'Від' : ''}
                            value={filters.day}
                            onChange={(e) => setFilters((prev) => ({ ...prev, day: e.target.value }))}
                            sx={{
                               ...headerFilterSx,
                               flex: 1,
                               minWidth: 0,
                               '& .MuiInputBase-input': {
                                  ...headerFilterSx['& .MuiInputBase-input'],
                                  fontSize: 10,
                                  px: 0.55,
                               },
                            }}
                            InputLabelProps={{ shrink: true }}
                         />
                      )}
                      {filters.period === 'range' && (
                         <TextField
                            size="small"
                            type="date"
                            label="До"
                            value={filters.dateTo}
                            onChange={(e) => setFilters((prev) => ({ ...prev, dateTo: e.target.value }))}
                            sx={{
                               ...headerFilterSx,
                               flex: 1,
                               minWidth: 0,
                               '& .MuiInputBase-input': {
                                  ...headerFilterSx['& .MuiInputBase-input'],
                                  fontSize: 10,
                                  px: 0.55,
                               },
                            }}
                            InputLabelProps={{ shrink: true }}
                         />
                      )}
                   </Stack>
                   <TextField
                      select
                      size="small"
                      label="Дія"
                      value={filters.actionType}
                      onChange={(e) => setFilters((prev) => ({ ...prev, actionType: e.target.value }))}
                      sx={{ ...headerFilterSx, textTransform: 'none' }}
                   >
                      <MenuItem value="all">Усі дії</MenuItem>
                      {ACTION_OPTIONS.map(([value, label]) => <MenuItem key={value} value={value}>{label}</MenuItem>)}
                   </TextField>
                   <TextField
                      select
                      size="small"
                      label="Сайт"
                      value={filters.platform}
                      onChange={(e) => setFilters((prev) => ({ ...prev, platform: e.target.value }))}
                      sx={{ ...headerFilterSx, textTransform: 'none' }}
                   >
                      <MenuItem value="all">Усі</MenuItem>
                      {PLATFORM_OPTIONS.map(([value, label]) => <MenuItem key={value} value={value}>{label}</MenuItem>)}
                   </TextField>
                   <TextField
                      size="small"
                      label="Об’єкт"
                      value={filters.q}
                      onChange={(e) => setFilters((prev) => ({ ...prev, q: e.target.value }))}
                      onKeyDown={(e) => { if (e.key === 'Enter') fetchEvents(); }}
                      sx={{ ...headerFilterSx, textTransform: 'none' }}
                   />
                  {[
                     { title: 'Перегляди', icon: <VisibilityRoundedIcon sx={{ fontSize: 15 }} /> },
                     { title: 'Обране', icon: <BookmarkRoundedIcon sx={{ fontSize: 15 }} /> },
                     { title: 'Відкриття телефону', icon: <CallMadeRoundedIcon sx={{ fontSize: 15 }} /> },
                     { title: 'Повідомлення', icon: <ChatRoundedIcon sx={{ fontSize: 15 }} /> },
                     { title: 'Дзвінки', icon: <PhoneInTalkRoundedIcon sx={{ fontSize: 15 }} /> },
                     { title: 'Витрати', icon: <MoneyOffRoundedIcon sx={{ fontSize: 15 }} /> },
                  ].map((item) => (
                     <Tooltip key={item.title} title={item.title}>
                        <Box sx={{ display: 'flex', justifyContent: 'center' }}>{item.icon}</Box>
                     </Tooltip>
                  ))}
                   <TextField
                      select
                      size="small"
                      label="Рекламщик"
                      value={filters.employee}
                      onChange={(e) => setFilters((prev) => ({ ...prev, employee: e.target.value }))}
                      sx={{ ...headerFilterSx, textTransform: 'none' }}
                   >
                      <MenuItem value="all">Усі</MenuItem>
                      {employees.map((employee) => <MenuItem key={employee._id} value={employee._id}>{employeeName(employee)}</MenuItem>)}
                   </TextField>
                   <Tooltip title="Скинути фільтри">
                      <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                         <IconButton onClick={resetFilters} sx={{ width: 30, height: 30, borderRadius: 1.25, border: `1px solid ${theme.border}`, color: theme.textSoft }}>
                            <FilterAltOffRoundedIcon sx={{ fontSize: 17 }} />
                         </IconButton>
                      </Box>
                   </Tooltip>
               </Box>

               {visibleEvents.map((event) => (
                  <Box
                     key={event._id}
                     sx={{
                        border: event.isDemo ? '1px solid rgba(88,111,176,0.32)' : `1px solid ${theme.border}`,
                        borderRadius: 1.6,
                        bgcolor: event.isDemo
                           ? (mode === 'light' ? 'rgba(255,255,255,0.9)' : 'rgba(13,15,26,0.88)')
                           : (mode === 'light' ? 'rgba(255,255,255,0.88)' : 'rgba(13,15,26,0.82)'),
                        px: { xs: 1, md: 1.2 },
                        py: { xs: 0.85, md: 0.35 },
                     }}
                  >
                     <Box
                        sx={{
                           display: 'grid',
                            gridTemplateColumns: { xs: '1fr', md: EVENT_GRID_COLUMNS },
                           gap: { xs: 0.5, md: 0.8 },
                           alignItems: 'center',
                           minHeight: { xs: 72, md: 38 },
                        }}
                     >
                        <Box sx={{ minWidth: 0 }}>
                           <Typography sx={{ fontSize: 11, fontWeight: 950, lineHeight: 1.05, whiteSpace: 'nowrap' }}>{formatDateOnly(event.occurredAt)}</Typography>
                           <Typography sx={{ fontSize: 9.5, color: theme.textSoft, fontWeight: 800, lineHeight: 1.05, whiteSpace: 'nowrap' }}>{formatTimeOnly(event.occurredAt)}</Typography>
                        </Box>
                        <Tooltip title={event.actionLabel || actionMap[event.actionType] || event.actionType}>
                           <Stack
                              direction="row"
                              spacing={0.7}
                              alignItems="center"
                              sx={{
                                 minWidth: 0,
                                 height: 30,
                                 px: 0.8,
                                 borderRadius: 1.5,
                                 bgcolor: `${getActionColor(event.actionType)}18`,
                                 border: `1px solid ${getActionColor(event.actionType)}55`,
                                 color: getActionColor(event.actionType),
                              }}
                           >
                              <Box sx={{ display: 'flex', flex: '0 0 auto' }}>{getActionIcon(event.actionType)}</Box>
                              <Typography sx={{ minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: 11, fontWeight: 950, color: 'inherit' }}>
                                 {event.actionLabel || actionMap[event.actionType] || event.actionType}
                              </Typography>
                           </Stack>
                        </Tooltip>
                        <Chip
                           label={event.advertisingLinkLabel || event.linkTitle || platformMap[event.platform] || event.platform}
                           size="small"
                           component={event.linkUrl ? 'a' : 'div'}
                           href={event.linkUrl || undefined}
                           target={event.linkUrl ? '_blank' : undefined}
                           rel={event.linkUrl ? 'noreferrer' : undefined}
                           clickable={Boolean(event.linkUrl)}
                           sx={{ height: 22, maxWidth: 120, fontSize: 11, fontWeight: 950, color: theme.text, bgcolor: 'rgba(255,255,255,0.06)', textDecoration: 'none' }}
                        />
                        <Box sx={{ minWidth: 0 }}>
                           <Typography sx={{ fontWeight: 950, fontSize: 13, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', lineHeight: 1.12 }}>
                              {propertyLabel(event.property)}
                           </Typography>
                           <Typography sx={{ color: theme.textSoft, fontWeight: 700, fontSize: 10.5, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', lineHeight: 1.15 }}>
                              {[event.linkTitle || event.linkUrl, event.note].filter(Boolean).join(' · ') || 'без нотатки'}
                           </Typography>
                        </Box>
                        {isCreateAction(event.actionType) ? (
                           <Box sx={{ display: { xs: 'none', md: 'block' }, gridColumn: '5 / 11' }} />
                        ) : (
                           <>
                              {[
                                 { value: event.metrics?.views, title: 'Перегляди', icon: <VisibilityRoundedIcon fontSize="inherit" /> },
                                 { value: event.metrics?.favorites ?? event.metrics?.saves, title: 'Обране', icon: <BookmarkRoundedIcon fontSize="inherit" /> },
                                 { value: event.metrics?.phoneOpens, title: 'Відкриття телефону', icon: <CallMadeRoundedIcon fontSize="inherit" /> },
                                 { value: event.metrics?.messages, title: 'Повідомлення', icon: <ChatRoundedIcon fontSize="inherit" /> },
                                 { value: event.metrics?.calls, title: 'Дзвінки', icon: <PhoneInTalkRoundedIcon fontSize="inherit" /> },
                              ].map((metric) => (
                                 <Tooltip key={metric.title} title={metric.title}>
                                    <Stack spacing={0.1} alignItems="center" justifyContent="center" sx={{ color: metric.value != null ? theme.text : theme.textSoft, fontSize: 11, fontWeight: 950, lineHeight: 1 }}>
                                       <Box sx={{ display: 'flex', fontSize: 13, opacity: 0.72 }}>{metric.icon}</Box>
                                       <Box sx={{ minHeight: 11 }}>{metric.value ?? '-'}</Box>
                                    </Stack>
                                 </Tooltip>
                              ))}
                              <Typography sx={{ color: event.costUah ? '#ef4444' : theme.textSoft, fontWeight: 950, fontSize: 11, textAlign: 'center', whiteSpace: 'nowrap' }}>
                                 {event.costUah ? `-${Number(event.costUah).toLocaleString('uk-UA')} грн` : '-'}
                              </Typography>
                           </>
                        )}
                        <Typography sx={{ gridColumn: { md: '11 / 12' }, minWidth: 0, color: theme.textSoft, fontWeight: 850, fontSize: 11.5, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                           {employeeName(event.responsibleEmployee)}
                        </Typography>
                        <Stack direction="row" spacing={0.4} justifyContent={{ xs: 'flex-start', md: 'flex-end' }} sx={{ gridColumn: { md: '12 / 13' } }}>
                           {event.linkUrl && (
                              <Tooltip title="Відкрити посилання">
                                 <IconButton href={event.linkUrl} target="_blank" rel="noreferrer" size="small" sx={{ width: 30, height: 30, color: theme.text }}>
                                    <OpenInNewRoundedIcon fontSize="small" />
                                 </IconButton>
                              </Tooltip>
                           )}
                           {!event.isDemo && (
                              <>
                                 <Tooltip title="Редагувати">
                                    <IconButton onClick={() => handleEditEvent(event)} size="small" sx={{ width: 30, height: 30, color: theme.text }}>
                                       <EditRoundedIcon fontSize="small" />
                                    </IconButton>
                                 </Tooltip>
                                 <Tooltip title="Видалити">
                                    <IconButton onClick={() => setDeleteEvent(event)} size="small" sx={{ width: 30, height: 30, color: '#ef4444' }}>
                                       <DeleteOutlineRoundedIcon fontSize="small" />
                                    </IconButton>
                                 </Tooltip>
                              </>
                           )}
                        </Stack>
                     </Box>
                  </Box>
               ))}

               {!loading && !visibleEvents.length && (
                  <Box sx={{ py: 5, textAlign: 'center', color: theme.textSoft, border: `1px dashed ${theme.border}`, borderRadius: 3 }}>
                     <Typography sx={{ fontWeight: 900 }}>Ще немає рекламних дій за цими фільтрами</Typography>
                  </Box>
               )}
            </Stack>
         </Stack>

         <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="md" fullWidth PaperProps={{ sx: { borderRadius: 3, bgcolor: theme.bgPanel, color: theme.text } }}>
            <DialogTitle sx={{ fontWeight: 950 }}>{editingEvent ? 'Редагувати рекламну дію' : 'Додати рекламну дію'}</DialogTitle>
            <DialogContent>
               <Stack spacing={1.8} sx={{ pt: 1 }}>
                  <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.2}>
                     <Autocomplete
                        options={propertyLookupOptions}
                         value={selectedProperty}
                         onChange={(_, value) => handleSelectFormProperty(value)}
                        onInputChange={(_, value, reason) => {
                           if (reason === 'input') setPropertySearch(value);
                        }}
                        getOptionLabel={(option) => propertyLabel(option)}
                        isOptionEqualToValue={(option, value) => String(option?._id || '') === String(value?._id || '')}
                        filterOptions={(options) => options}
                        loading={propertiesLoading}
                        noOptionsText={propertySearch.trim().length >= PROPERTY_MIN_SEARCH_LENGTH ? 'Не знайдено' : `Введи мінімум ${PROPERTY_MIN_SEARCH_LENGTH} символи`}
                        renderOption={(props, option) => (
                           <Box component="li" {...props} key={option._id} sx={{ display: 'block !important', py: 1.1 }}>
                              <Typography sx={{ fontWeight: 950, color: theme.text, lineHeight: 1.15 }}>
                                 {propertyLabel(option)}
                              </Typography>
                              <Typography sx={{ color: theme.textSoft, fontSize: 12, fontWeight: 700 }}>
                                 {[option.location_text, option.cost ? `${Number(option.cost).toLocaleString('uk-UA')} ${option.currency || 'USD'}` : '', option.assignee?.name].filter(Boolean).join(' · ')}
                              </Typography>
                           </Box>
                        )}
                        renderInput={(params) => (
                           <TextField
                              {...params}
                              required
                              label="Об’єкт"
                              sx={fieldSx}
                              InputProps={{
                                 ...params.InputProps,
                                 endAdornment: (
                                    <>
                                       {propertiesLoading ? <CircularProgress color="inherit" size={18} /> : null}
                                       {params.InputProps.endAdornment}
                                    </>
                                 ),
                              }}
                           />
                        )}
                        PaperComponent={(props) => <Box {...props} sx={{ minWidth: { xs: 320, sm: 560 }, bgcolor: theme.bgPanel, color: theme.text, border: `1px solid ${theme.border}` }} />}
                        ListboxProps={{ sx: { maxHeight: 360 } }}
                        sx={{ flex: 1.4 }}
                     />
                     <TextField select label="Хто опрацював" value={form.responsibleEmployee} onChange={(e) => handleFormChange('responsibleEmployee', e.target.value)} sx={{ ...fieldSx, flex: 1 }}>
                        <MenuItem value="">Я / поточний користувач</MenuItem>
                        {employees.map((employee) => (
                           <MenuItem key={employee._id} value={employee._id}>{employeeName(employee)}</MenuItem>
                        ))}
                     </TextField>
                  </Stack>

                  <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.2}>
                     <TextField select label="Дія" value={form.actionType} onChange={(e) => handleFormChange('actionType', e.target.value)} sx={{ ...fieldSx, flex: 1 }}>
                        {ACTION_OPTIONS.map(([value, label]) => <MenuItem key={value} value={value}>{label}</MenuItem>)}
                     </TextField>
                     <TextField select label="Майданчик" value={form.platform} onChange={(e) => handleFormChange('platform', e.target.value)} sx={{ ...fieldSx, flex: 1 }}>
                        {PLATFORM_OPTIONS.map(([value, label]) => <MenuItem key={value} value={value}>{label}</MenuItem>)}
                     </TextField>
                     <TextField label="Дата і час" type="datetime-local" value={form.occurredAt} onChange={(e) => handleFormTimeChange(e.target.value)} sx={{ ...fieldSx, flex: 1 }} InputLabelProps={{ shrink: true }} />
                  </Stack>

                  <Divider sx={{ borderColor: theme.border }} />

                  <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.2}>
                     <TextField select label="Посилання" value={form.linkMode} onChange={(e) => handleFormChange('linkMode', e.target.value)} sx={{ ...fieldSx, flex: 0.8 }}>
                        <MenuItem value="existing">З об’єкта</MenuItem>
                        <MenuItem value="new">Нове</MenuItem>
                     </TextField>
                     {form.linkMode === 'existing' ? (
                        <TextField select label="Рекламне посилання" value={form.advertisingLinkId} onChange={(e) => handleFormChange('advertisingLinkId', e.target.value)} sx={{ ...fieldSx, flex: 1.8 }}>
                           <MenuItem value="">Без прив’язки до конкретного посилання</MenuItem>
                           {form.advertisingLinkId && !selectedLinks.some((link) => String(link?._id || '') === String(form.advertisingLinkId)) && (
                              <MenuItem value={form.advertisingLinkId}>
                                 {form.linkTitle || 'Поточне прив’язане посилання'}
                              </MenuItem>
                           )}
                           {selectedLinks.map((link) => (
                              <MenuItem key={link._id} value={link._id}>
                                 {adLinkLabel(link, '', selectedProperty?.advertisingLinks || []) + ' · ' + (sourceMap[link.sourceType] || link.sourceType || 'Наша')}
                              </MenuItem>
                           ))}
                        </TextField>
                     ) : (
                        <>
                           <TextField label="URL" value={form.linkUrl} onChange={(e) => handleFormChange('linkUrl', e.target.value)} sx={{ ...fieldSx, flex: 1.4 }} InputProps={{ startAdornment: <LinkRoundedIcon sx={{ mr: 1, color: theme.textSoft }} /> }} />
                           <TextField select label="Тип" value={form.sourceType} onChange={(e) => handleFormChange('sourceType', e.target.value)} sx={{ ...fieldSx, flex: 0.8 }}>
                              {SOURCE_OPTIONS.map(([value, label]) => <MenuItem key={value} value={value}>{label}</MenuItem>)}
                           </TextField>
                        </>
                     )}
                  </Stack>

                  {form.linkMode === 'new' && (
                     <TextField label="Назва посилання" value={form.linkTitle} onChange={(e) => handleFormChange('linkTitle', e.target.value)} sx={fieldSx} />
                  )}

                  {(showMetrics || showCost) && (
                     <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.2}>
                        {showMetrics && (
                           <>
                              <TextField label="Перегляди" type="number" value={form.views} onChange={(e) => handleFormChange('views', e.target.value)} sx={{ ...fieldSx, flex: 1 }} />
                              <TextField label="Дзвінки" type="number" value={form.calls} onChange={(e) => handleFormChange('calls', e.target.value)} sx={{ ...fieldSx, flex: 1 }} />
                              <TextField label="Повідомлення" type="number" value={form.messages} onChange={(e) => handleFormChange('messages', e.target.value)} sx={{ ...fieldSx, flex: 1 }} />
                              <TextField label="Телефон відкрито" type="number" value={form.phoneOpens} onChange={(e) => handleFormChange('phoneOpens', e.target.value)} sx={{ ...fieldSx, flex: 1 }} />
                           </>
                        )}
                        {showCost && (
                           <TextField label="Витрата, грн" type="number" value={form.costUah} onChange={(e) => handleFormChange('costUah', e.target.value)} sx={{ ...fieldSx, flex: 1 }} />
                        )}
                     </Stack>
                  )}

                  {showMetrics && (
                     <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.2}>
                        <TextField label="Обране" type="number" value={form.favorites} onChange={(e) => handleFormChange('favorites', e.target.value)} sx={{ ...fieldSx, flex: 1 }} />
                        <TextField label="Збереження" type="number" value={form.saves} onChange={(e) => handleFormChange('saves', e.target.value)} sx={{ ...fieldSx, flex: 1 }} />
                        <TextField label="Кліки" type="number" value={form.clicks} onChange={(e) => handleFormChange('clicks', e.target.value)} sx={{ ...fieldSx, flex: 1 }} />
                        <TextField label="Позиція" type="number" value={form.position} onChange={(e) => handleFormChange('position', e.target.value)} sx={{ ...fieldSx, flex: 1 }} />
                     </Stack>
                  )}

                  <TextField label="Примітка" multiline minRows={3} value={form.note} onChange={(e) => handleFormChange('note', e.target.value)} sx={fieldSx} />
               </Stack>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 2.5 }}>
               <Button onClick={handleCloseDialog} sx={{ color: theme.textSoft, fontWeight: 900 }}>Скасувати</Button>
               <Button disabled={saving || !form.property} onClick={handleSubmit} variant="contained" startIcon={<AddRoundedIcon />} sx={{ borderRadius: 999, fontWeight: 950 }}>
                  {saving ? 'Зберігаю...' : (editingEvent ? 'Зберегти' : 'Додати')}
               </Button>
            </DialogActions>
         </Dialog>

         <Dialog open={!!deleteEvent} onClose={() => setDeleteEvent(null)} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 3, bgcolor: theme.bgPanel, color: theme.text, border: `1px solid ${theme.border}` } }}>
            <DialogTitle sx={{ fontWeight: 950 }}>Видалити рекламну дію?</DialogTitle>
            <DialogContent>
               <Typography sx={{ color: theme.textSoft, fontWeight: 750 }}>
                  Запис зникне з рекламного журналу, але саме рекламне посилання в картці об’єкта залишиться.
               </Typography>
               {deleteEvent && (
                  <Box sx={{ mt: 1.5, p: 1.4, borderRadius: 2, bgcolor: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.28)' }}>
                     <Typography sx={{ fontWeight: 950 }}>{deleteEvent.actionLabel || actionMap[deleteEvent.actionType]}</Typography>
                     <Typography sx={{ color: theme.textSoft, fontSize: 13 }}>{propertyLabel(deleteEvent.property)}</Typography>
                  </Box>
               )}
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 2.5 }}>
               <Button onClick={() => setDeleteEvent(null)} sx={{ color: theme.textSoft, fontWeight: 900 }}>Скасувати</Button>
               <Button onClick={handleDeleteEvent} disabled={saving} variant="contained" color="error" startIcon={<DeleteOutlineRoundedIcon />} sx={{ borderRadius: 999, fontWeight: 950 }}>
                  {saving ? 'Видаляю...' : 'Видалити'}
               </Button>
            </DialogActions>
         </Dialog>
      </Box>
      </Box>
   );
}

