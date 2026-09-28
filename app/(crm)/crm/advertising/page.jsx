'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import {
   Alert,
   Autocomplete,
   Avatar,
   Badge,
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
   IconButton,
   InputAdornment,
   Menu,
   MenuItem,
   Popover,
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
import CloudUploadRoundedIcon from '@mui/icons-material/CloudUploadRounded';
import ContentCopyRoundedIcon from '@mui/icons-material/ContentCopyRounded';
import DriveFileRenameOutlineRoundedIcon from '@mui/icons-material/DriveFileRenameOutlineRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import FilterAltOffRoundedIcon from '@mui/icons-material/FilterAltOffRounded';
import FileDownloadRoundedIcon from '@mui/icons-material/FileDownloadRounded';
import ImageRoundedIcon from '@mui/icons-material/ImageRounded';
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';
import KeyboardArrowUpRoundedIcon from '@mui/icons-material/KeyboardArrowUpRounded';
import LinkRoundedIcon from '@mui/icons-material/LinkRounded';
import ListAltRoundedIcon from '@mui/icons-material/ListAltRounded';
import MonetizationOnRoundedIcon from '@mui/icons-material/MonetizationOnRounded';
import MoneyOffRoundedIcon from '@mui/icons-material/MoneyOffRounded';
import OndemandVideoRoundedIcon from '@mui/icons-material/OndemandVideoRounded';
import OpenInNewRoundedIcon from '@mui/icons-material/OpenInNewRounded';
import PaymentsRoundedIcon from '@mui/icons-material/PaymentsRounded';
import PersonAddAlt1RoundedIcon from '@mui/icons-material/PersonAddAlt1Rounded';
import PersonRoundedIcon from '@mui/icons-material/PersonRounded';
import PestControlRoundedIcon from '@mui/icons-material/PestControlRounded';
import PictureAsPdfRoundedIcon from '@mui/icons-material/PictureAsPdfRounded';
import PhoneInTalkRoundedIcon from '@mui/icons-material/PhoneInTalkRounded';
import PriceChangeRoundedIcon from '@mui/icons-material/PriceChangeRounded';
import QueryStatsRoundedIcon from '@mui/icons-material/QueryStatsRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import SentimentDissatisfiedRoundedIcon from '@mui/icons-material/SentimentDissatisfiedRounded';
import StarRoundedIcon from '@mui/icons-material/StarRounded';
import TrackChangesRoundedIcon from '@mui/icons-material/TrackChangesRounded';
import VisibilityOffRoundedIcon from '@mui/icons-material/VisibilityOffRounded';
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded';
import LogoutIcon from '@mui/icons-material/Logout';

import { useCRMTheme } from '@/app/(crm)/crm/context/CRMThemeContext';
import {
   buildImageUploadBatches,
   prepareImageUploadFiles,
   SAFE_IMAGE_PAYLOAD_BYTES,
} from '@/utils/crm/clientImageTools';
import useCurrentUser from '@/utils/useCurrentUser';

const ACTION_OPTIONS = [
   ['created_first', 'створено вперше'],
   ['created_with_update', 'створено з покращенням'],
   ['created_without_changes', 'створено без змін'],
   ['updated_improved', 'оновлено з покращенням'],
   ['updated_without_changes', 'оновлено без змін'],
   ['edited_photo', 'оновлено фото'],
   ['price_changed', 'змінено ціну'],
   ['scanner', 'сканер'],
   ['financial_promotion', 'фінансове просування'],
   ['deactivated', 'деактивовано'],
   ['photo_processing', 'обробка фото'],
   ['video_processing', 'обробка відео'],
   ['owner_link', 'ссилка власника'],
   ['competitor_link', 'ссилка конкурента'],
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
   ['youtube', 'YouTube'],
   ['drive', 'Drive'],
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
const estateTypeMap = {
   flat: 'квартира',
   house: 'будинок',
   land: 'ділянка',
   commerce: 'комерція',
};
const PROPERTY_MIN_SEARCH_LENGTH = 2;
const EVENT_GRID_COLUMNS = '194px 176px 128px minmax(260px,1fr) 46px 46px 46px 46px 46px 74px 132px 104px';
const LEAD_STAGE_OPTIONS = [
   ['lead', 'Холодний лід'],
   ['hot', 'Гарячий лід'],
   ['ps', 'ПС'],
   ['rs', 'РС'],
   ['ds', 'ДС'],
   ['pzs', 'ПЗС'],
   ['zs', 'ЗС'],
   ['pers', 'ПЕРС'],
];
const LEAD_ACTUALITY_OPTIONS = [
   'Актуальний. Зустріч! В роботі',
   'Актуальний. Продзвін',
   'Актуальний. Переписка',
   'Актуальний. Проблемний',
   'Актуальний. Зустріч! Не в роботі',
   'Неактуальний. Купив зі мною',
   'Неактуальний. Купив без мене',
   'Неактуальний. Відмова покупки',
   'Неактуальний. Невідома причина',
   'Зупинений. Завдаток мій',
   'Зупинений. Завдаток не мій',
   'Зупинений. Виявлена причина',
   'Зупинений. Невиявлена причина',
];
const LEAD_NOTE_TYPES = [
   ['info', 'Інформуюча'],
   ['positive', 'Позитивна'],
   ['important', 'Важлива'],
   ['negative', 'Негативна'],
];
const LEAD_KIND_OPTIONS = [
   ['sale', 'Продаж'],
   ['rent', 'Оренда'],
];
const LEAD_BUDGET_CURRENCIES = [
   ['USD', 'долар'],
   ['EUR', 'євро'],
   ['UAH', 'гривня'],
];
const PHOTO_STAGES = [
   { value: 'draft', label: 'Чорнові' },
   { value: 'processed', label: 'Оброблені' },
   { value: 'branded', label: 'З лого' },
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
      linkCreatedAt: toInputDateTime(new Date()),
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

function emptyLeadForm() {
   return {
      name: '',
      stage: 'lead',
      leadKind: 'sale',
      budgetMax: '',
      budgetCurrency: 'USD',
      sourceChannel: '',
      requestSummary: '',
      phones: '',
      emails: '',
      sourceObject: '',
      sourceNote: '',
      actualityStatus: 'Актуальний. Продзвін',
      assignee: '',
      attractedProperty: '',
      advertisingLinkId: '',
      advertisingPlatform: '',
      advertisingLinkTitle: '',
      advertisingLinkUrl: '',
      initialNoteText: '',
      initialNoteType: 'info',
   };
}

function toInputDateTime(value) {
   const date = value ? new Date(value) : new Date();
   if (Number.isNaN(date.getTime())) return '';
   const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
   return local.toISOString().slice(0, 16);
}

function toPayloadDateTime(value) {
   if (!value) return '';
   const date = new Date(value);
   return Number.isNaN(date.getTime()) ? '' : date.toISOString();
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

function propertyPriceText(property = {}) {
   if (isRentProperty(property)) {
      const price = property?.rentOptions?.price ?? property?.advertisingSettings?.price;
      const currency = property?.rentOptions?.currency || property?.advertisingSettings?.currency || 'USD';
      return price ? `${formatMoney(price, currency)}/міс` : '';
   }

   return property?.cost ? formatMoney(property.cost, property.currency || 'USD') : '';
}

function isRentProperty(property = {}) {
   return property?.type_deal === 'оренда' || (Boolean(property?.statusRent) && property.statusRent !== 'rentNo');
}

function rentStatusLabel(status) {
   if (status === 'rentActual') return 'Актуальна для здачі';
   if (status === 'rentPause') return 'Пауза / завдаток';
   if (status === 'rentRented') return 'Зданий';
   if (status === 'rentNo') return 'Не оренда';
   return '';
}

function imageRawUrl(image = {}) {
   if (!image) return '';
   if (typeof image === 'string') return image;
   return image.url
      || image.secure_url
      || image.src
      || image.preview
      || image.card
      || image.full
      || image.processedUrl
      || image.brandedUrl
      || image.variants?.full
      || image.variants?.card
      || image.variants?.preview
      || image.variants?.branded
      || '';
}

function imageStageValue(image = {}) {
   if (!image || typeof image === 'string') return 'draft';
   return image.stage || 'draft';
}

function getImageUrl(property) {
   const image = (property?.images || []).find((item) => typeof item !== 'string' && item.isMain && !item.isHidden)
      || (property?.images || []).find((item) => typeof item === 'string' || !item.isHidden)
      || (property?.images || [])[0];
   if (!image) return '';
   if (typeof image === 'string') return image;
   return image.variants?.card || image.variants?.preview || image.processedUrl || imageRawUrl(image);
}

function getImageStageUrl(image = {}) {
   if (!image) return '';
   if (typeof image === 'string') return image;
   if (imageStageValue(image) === 'branded') {
      return image.brandedUrl || image.variants?.branded || imageRawUrl(image);
   }
   if (imageStageValue(image) === 'processed') {
      return image.processedUrl || imageRawUrl(image);
   }
   return imageRawUrl(image);
}

function getImageActionId(image = {}) {
   if (!image) return '';
   if (typeof image === 'string') return image;
   return image._id || image.public_id || image.url || image.secure_url || image.src || image.processedUrl || image.brandedUrl || image.variants?.full || image.variants?.card || image.variants?.preview || '';
}
function employeeName(employee) {
   return employee?.name || [employee?.surname, employee?.fullName].filter(Boolean).join(' ') || 'Без працівника';
}

function leadStageLabel(stage) {
   return LEAD_STAGE_OPTIONS.find(([value]) => value === stage)?.[1] || stage || 'Лід';
}

function leadKindLabel(kind) {
   return LEAD_KIND_OPTIONS.find(([value]) => value === kind)?.[1] || 'Продаж';
}

function leadBudgetLabel(lead = {}) {
   if (!lead?.budgetMax) return '';
   return formatMoney(lead.budgetMax, lead.budgetCurrency || 'USD');
}

function escapeHtml(value) {
   return String(value ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
}

function propertyLabel(property) {
   if (isRentProperty(property) && property?.rentOptions?.rentTitle) return property.rentOptions.rentTitle;
   return property?.displayTitle || property?.title || property?.rentOptions?.rentTitle || property?.location_text || 'Без назви';
}

function isCreateAction(actionType) {
   return String(actionType || '').startsWith('created');
}

function isLinkSourceAction(actionType) {
   return ['competitor_link', 'owner_link'].includes(actionType);
}

function isStandaloneWorkAction(actionType) {
   return ['photo_processing', 'video_processing'].includes(actionType);
}

function createsPropertyLinkAction(actionType) {
   return isCreateAction(actionType) || isLinkSourceAction(actionType);
}

function requiresExistingAdvertisingLink(actionType) {
   return !createsPropertyLinkAction(actionType) && !isStandaloneWorkAction(actionType);
}

function actionHasMetrics(actionType) {
   return !createsPropertyLinkAction(actionType) && !isStandaloneWorkAction(actionType);
}

function sourceTypeForAction(actionType, fallback = 'ours') {
   if (actionType === 'competitor_link') return 'competitor';
   if (actionType === 'owner_link') return 'owner';
   return fallback || 'ours';
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
   if (actionType === 'photo_processing') return '#2dd4bf';
   if (actionType === 'video_processing') return '#60a5fa';
   if (actionType === 'competitor_link') return '#f43f5e';
   if (actionType === 'owner_link') return '#fb7185';
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
      photo_processing: <ImageRoundedIcon sx={commonSx} />,
      video_processing: <OndemandVideoRoundedIcon sx={commonSx} />,
      price_changed: <PriceChangeRoundedIcon sx={commonSx} />,
      competitor_link: <LinkRoundedIcon sx={commonSx} />,
      owner_link: <LinkRoundedIcon sx={commonSx} />,
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
   if (status === 'lead_pull') return 'Дотягуємо ліди';
   if (status === 'done') return 'Готово';
   if (status === 'archive') return 'Архів реклами';
   if (status === 'none') return 'Без реклами';
   return 'Активно';
}

function getAdvertisingStatusSx(status) {
   if (status === 'paused') return { color: '#fde68a', bgcolor: 'rgba(250,204,21,0.12)', border: '1px solid rgba(250,204,21,0.28)' };
   if (status === 'lead_pull') return { color: '#93c5fd', bgcolor: 'rgba(59,130,246,0.13)', border: '1px solid rgba(59,130,246,0.28)' };
   if (status === 'done') return { color: '#c4b5fd', bgcolor: 'rgba(167,139,250,0.12)', border: '1px solid rgba(167,139,250,0.28)' };
   if (status === 'archive' || status === 'none') return { color: '#cbd5e1', bgcolor: 'rgba(148,163,184,0.12)', border: '1px solid rgba(148,163,184,0.25)' };
   return { color: '#86efac', bgcolor: 'rgba(34,197,94,0.10)', border: '1px solid rgba(34,197,94,0.24)' };
}

function getActiveAdvertisingLinks(property) {
   return (property?.advertisingLinks || []).filter((link) => !link?.closedAt && link?.status !== 'archived');
}

function groupLinksByPlatform(links = []) {
   return links.reduce((acc, link) => {
      const key = link?.platform || 'other';
      if (!acc[key]) acc[key] = [];
      acc[key].push(link);
      return acc;
   }, {});
}

function propertyVideos(property) {
   return [...(property?.propertyVideos || [])].sort((a, b) => (
      new Date(b?.updatedAt || b?.createdAt || 0).getTime() - new Date(a?.updatedAt || a?.createdAt || 0).getTime()
   ));
}

function videoTypeLabel(type) {
   if (type === 'short_review') return 'Короткий огляд';
   if (type === 'storytelling') return 'Storytelling';
   if (type === 'full_review') return 'Повний огляд';
   if (type === 'other') return 'Інше';
   return 'Огляд';
}

function videoTypeColor(type) {
   if (type === 'short_review') return '#60a5fa';
   if (type === 'storytelling') return '#f472b6';
   if (type === 'full_review') return '#a78bfa';
   if (type === 'other') return '#cbd5e1';
   return '#fde68a';
}

function getLinksBySource(links = [], sourceType) {
   return (links || []).filter((link) => (link?.sourceType || 'ours') === sourceType);
}

function getActualityLabel(group) {
   if (group === 'active') return 'Актуальний';
   if (group === 'paused') return 'Зупинений';
   if (group === 'inactive') return 'Неактуальний';
   return group || '—';
}

function compactValue(value, suffix = '') {
   if (value === undefined || value === null || value === '') return '';
   return `${value}${suffix}`;
}

function wallShort(value = '') {
   const text = String(value || '').toLowerCase();
   if (text.includes('цег')) return 'ц';
   if (text.includes('пан')) return 'п';
   if (text.includes('мон')) return 'м';
   if (text.includes('газ')) return 'г';
   return value ? String(value).slice(0, 1).toLowerCase() : '';
}

function balconyText(value) {
   const n = Number(value || 0);
   if (!n) return '';
   if (n === 1) return '1 балкон';
   if (n > 1 && n < 5) return `${n} балкони`;
   return `${n} балконів`;
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
   const currentEmployeeId = user?._id || user?.employeeId || session?.user?.employeeId || '';
   const currentRole = user?.role || session?.user?.role || '';
   const canSeeAllAdvertisingLeads = ['owner', 'admin'].includes(currentRole) || session?.user?.isFallbackAdmin;
   const [linkGroupPopover, setLinkGroupPopover] = useState({ anchorEl: null, links: [], platform: '', allLinks: [], property: null });

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
   const [form, setForm] = useState(emptyForm);
   const [isTimePinned, setIsTimePinned] = useState(false);
   const [showAllWorkObjects, setShowAllWorkObjects] = useState(false);
   const [expandedAdTextId, setExpandedAdTextId] = useState('');
   const [editingAdText, setEditingAdText] = useState(null);
   const [adTextForm, setAdTextForm] = useState({ title: '', text: '', note: '' });
   const [mediaPropertyId, setMediaPropertyId] = useState('');
   const [mediaStage, setMediaStage] = useState('draft');
   const [mediaUploading, setMediaUploading] = useState(false);
   const [mediaError, setMediaError] = useState('');
   const mediaUploadInputRef = useRef(null);
   const [leadDialogOpen, setLeadDialogOpen] = useState(false);
   const [leadSaving, setLeadSaving] = useState(false);
   const [leadError, setLeadError] = useState('');
   const [leadForm, setLeadForm] = useState(emptyLeadForm);
   const [editingLead, setEditingLead] = useState(null);
   const [deleteLead, setDeleteLead] = useState(null);
   const [advertisingLeads, setAdvertisingLeads] = useState([]);
   const [advertisingLeadsLoading, setAdvertisingLeadsLoading] = useState(false);
   const [showAdvertisingLeadList, setShowAdvertisingLeadList] = useState(false);
   const [expandedAdvertisingLeadId, setExpandedAdvertisingLeadId] = useState('');
   const [leadReportFilters, setLeadReportFilters] = useState({ q: '', kind: 'all', stage: 'all', period: 'all' });
   const [reportsAnchor, setReportsAnchor] = useState(null);

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
   const selectedLeadProperty = useMemo(
      () => propertyLookupOptions.find((item) => String(item._id) === String(leadForm.attractedProperty)) || null,
      [propertyLookupOptions, leadForm.attractedProperty]
   );
   const advertisingLeadStats = useMemo(() => {
      const now = new Date();
      const startToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
      const sevenDaysAgo = now.getTime() - 7 * 24 * 60 * 60 * 1000;
      const thirtyDaysAgo = now.getTime() - 30 * 24 * 60 * 60 * 1000;
      const timeOf = (lead) => new Date(lead?.leadAppearedAt || lead?.createdAt || lead?.updatedAt || 0).getTime() || 0;

      return advertisingLeads.reduce((acc, lead) => {
         const isSale = (lead?.leadKind || 'sale') === 'sale';
         const time = timeOf(lead);
         acc.total += 1;
         if (isSale) acc.sale += 1;
         if (time >= startToday) {
            acc.today += 1;
            if (isSale) acc.todaySale += 1;
         }
         if (time >= sevenDaysAgo) acc.days7 += 1;
         if (time >= sevenDaysAgo && isSale) acc.days7Sale += 1;
         if (time >= thirtyDaysAgo) acc.days30 += 1;
         if (time >= thirtyDaysAgo && isSale) acc.days30Sale += 1;
         return acc;
      }, { total: 0, sale: 0, today: 0, todaySale: 0, days7: 0, days7Sale: 0, days30: 0, days30Sale: 0 });
   }, [advertisingLeads]);
   const filteredAdvertisingLeads = useMemo(() => {
      const now = new Date();
      const startToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
      const days7 = now.getTime() - 7 * 24 * 60 * 60 * 1000;
      const days30 = now.getTime() - 30 * 24 * 60 * 60 * 1000;
      const q = leadReportFilters.q.trim().toLowerCase();

      return advertisingLeads.filter((lead) => {
         const leadKind = lead?.leadKind || 'sale';
         const stage = lead?.stage || 'lead';
         const time = new Date(lead?.leadAppearedAt || lead?.createdAt || lead?.updatedAt || 0).getTime() || 0;

         if (leadReportFilters.kind !== 'all' && leadKind !== leadReportFilters.kind) return false;
         if (leadReportFilters.stage !== 'all' && stage !== leadReportFilters.stage) return false;
         if (leadReportFilters.period === 'today' && time < startToday) return false;
         if (leadReportFilters.period === '7d' && time < days7) return false;
         if (leadReportFilters.period === '30d' && time < days30) return false;
         if (q) {
            const text = [
               lead?.name,
               lead?.phones?.join(' '),
               lead?.emails?.join(' '),
               lead?.sourceObject,
               lead?.advertisingLinkTitle,
               lead?.actualityStatus,
               lead?.requestSummary,
               employeeName(lead?.assignee),
               employeeName(lead?.createdByEmployee),
            ].filter(Boolean).join(' ').toLowerCase();
            if (!text.includes(q)) return false;
         }
         return true;
      });
   }, [advertisingLeads, leadReportFilters]);
   const selectedAdvertisingProperty = useMemo(
      () => advertisingProperties.find((item) => String(item._id) === String(selectedAdvertisingPropertyId)) || null,
      [advertisingProperties, selectedAdvertisingPropertyId]
   );
   const mediaProperty = useMemo(
      () => advertisingProperties.find((item) => String(item._id) === String(mediaPropertyId)) || null,
      [advertisingProperties, mediaPropertyId]
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
   const openLinkGroupPopover = (anchorEl, links = [], platform = '', allLinks = [], property = null) => {
      const activeLinks = links.filter((link) => !link?.closedAt && link?.status !== 'archived');
      if (!anchorEl || !activeLinks.length) return;
      setLinkGroupPopover({ anchorEl, links: activeLinks, platform, allLinks: allLinks.length ? allLinks : activeLinks, property });
   };
   const closeLinkGroupPopover = () => {
      setLinkGroupPopover({ anchorEl: null, links: [], platform: '', allLinks: [], property: null });
   };
   const copyAdvertisingLink = async (url) => {
      if (!url || typeof navigator === 'undefined') return;
      try {
         await navigator.clipboard?.writeText(url);
      } catch (err) {
         console.error('Copy advertising link failed', err);
      }
   };
   const visibleEvents = useMemo(() => {
      return [...events].sort((a, b) => {
         const aTime = new Date(a?.occurredAt || a?.createdAt || 0).getTime() || 0;
         const bTime = new Date(b?.occurredAt || b?.createdAt || 0).getTime() || 0;
         return bTime - aTime;
      });
   }, [events]);
   const creatingAdLink = createsPropertyLinkAction(form.actionType);
   const requiresExistingLink = requiresExistingAdvertisingLink(form.actionType);
   const showQuickNumbers = actionHasMetrics(form.actionType);
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

   const fetchAdvertisingLeads = async () => {
      setAdvertisingLeadsLoading(true);
      try {
         if (!canSeeAllAdvertisingLeads && !currentEmployeeId) {
            setAdvertisingLeads([]);
            return;
         }
         const params = new URLSearchParams({ pageSize: '80', createdFrom: 'advertising' });
         if (!canSeeAllAdvertisingLeads && currentEmployeeId) params.set('createdByEmployee', currentEmployeeId);
         const res = await fetch(`/api/crm/leads?${params.toString()}`, { cache: 'no-store' });
         const data = res.ok ? await res.json() : { items: [] };
         setAdvertisingLeads(Array.isArray(data?.items) ? data.items : []);
      } catch (err) {
         console.error(err);
      } finally {
         setAdvertisingLeadsLoading(false);
      }
   };

   const openLeadDialog = ({ property = null, link = null } = {}) => {
      if (property?._id) {
         rememberPropertyOption(property);
         selectAdvertisingPropertyForActions(property);
      }
      const linkTitle = link ? adLinkLabel(link, '', property?.advertisingLinks || []) : '';
      const platformLabel = link?.platform ? (platformMap[link.platform] || link.platform) : '';
      const propertyIsRent = isRentProperty(property);
      setLeadForm({
         ...emptyLeadForm(),
         leadKind: propertyIsRent ? 'rent' : 'sale',
         budgetCurrency: propertyIsRent ? (property?.rentOptions?.currency || 'USD') : 'USD',
         sourceChannel: platformLabel,
         sourceObject: property ? propertyLabel(property) : '',
         assignee: '',
         attractedProperty: property?._id || '',
         advertisingLinkId: link?._id || '',
         advertisingPlatform: link?.platform || '',
         advertisingLinkTitle: linkTitle,
         advertisingLinkUrl: link?.url || '',
         sourceNote: linkTitle ? `Реклама: ${linkTitle}` : '',
      });
      setLeadError('');
      setLeadDialogOpen(true);
   };
   const openEditLeadDialog = (lead) => {
      const attractedProperty = lead?.attractedProperty && typeof lead.attractedProperty === 'object' ? lead.attractedProperty : null;
      if (attractedProperty?._id) rememberPropertyOption(attractedProperty);
      setEditingLead(lead);
      setLeadForm({
         ...emptyLeadForm(),
         name: lead?.name || '',
         stage: lead?.stage || 'lead',
         leadKind: lead?.leadKind || 'sale',
         budgetMax: lead?.budgetMax ?? '',
         budgetCurrency: lead?.budgetCurrency || 'USD',
         sourceChannel: lead?.sourceChannel || '',
         requestSummary: lead?.requestSummary || '',
         phones: (lead?.phones || []).join(', '),
         emails: (lead?.emails || []).join(', '),
         sourceObject: lead?.sourceObject || propertyLabel(attractedProperty) || '',
         sourceNote: lead?.sourceNote || '',
         actualityStatus: lead?.actualityStatus || emptyLeadForm().actualityStatus,
         assignee: lead?.assignee?._id || lead?.assignee || '',
         attractedProperty: attractedProperty?._id || lead?.attractedProperty || '',
         advertisingLinkId: lead?.advertisingLinkId || '',
         advertisingPlatform: lead?.advertisingPlatform || '',
         advertisingLinkTitle: lead?.advertisingLinkTitle || '',
         advertisingLinkUrl: lead?.advertisingLinkUrl || '',
      });
      setLeadError('');
      setLeadDialogOpen(true);
   };

   const closeLeadDialog = () => {
      setLeadDialogOpen(false);
      setLeadError('');
      setEditingLead(null);
      setLeadForm(emptyLeadForm());
   };

   const handleLeadFormChange = (field, value) => {
      setLeadForm((prev) => {
         const next = { ...prev, [field]: value };
         if (field === 'leadKind' && value === 'sale') next.budgetCurrency = 'USD';
         return next;
      });
   };
   const handleSelectLeadProperty = (property) => {
      if (property?._id) rememberPropertyOption(property);
      const propertyIsRent = isRentProperty(property);
      setLeadForm((prev) => ({
         ...prev,
         leadKind: property ? (propertyIsRent ? 'rent' : 'sale') : prev.leadKind,
         budgetCurrency: propertyIsRent ? (property?.rentOptions?.currency || prev.budgetCurrency || 'USD') : 'USD',
         attractedProperty: property?._id || '',
         sourceObject: property ? propertyLabel(property) : '',
         assignee: prev.assignee,
         advertisingLinkId: '',
         advertisingPlatform: '',
         advertisingLinkTitle: '',
         advertisingLinkUrl: '',
         sourceChannel: property ? '' : prev.sourceChannel,
         sourceNote: property ? '' : prev.sourceNote,
      }));
   };

   const handleSubmitLead = async () => {
      const phones = leadForm.phones.split(/[\n,;]+/).map((item) => item.trim()).filter(Boolean);
      const emails = leadForm.emails.split(/[\n,;]+/).map((item) => item.trim()).filter(Boolean);
      const notes = leadForm.initialNoteText.trim()
         ? [{ text: leadForm.initialNoteText.trim(), type: leadForm.initialNoteType, createdAt: new Date().toISOString() }]
         : [];

      if (!leadForm.name.trim()) {
         setLeadError('Вкажи ім’я ліда');
         return;
      }
      if (!phones.length && !emails.length) {
         setLeadError('Додай хоча б телефон або email');
         return;
      }

      setLeadSaving(true);
      setLeadError('');
      try {
         const payload = {
            name: leadForm.name.trim(),
            stage: leadForm.stage,
            leadKind: leadForm.leadKind,
            budgetMax: leadForm.budgetMax ? Number(leadForm.budgetMax) : undefined,
            budgetCurrency: leadForm.leadKind === 'rent' ? leadForm.budgetCurrency : 'USD',
            sourceChannel: leadForm.sourceChannel.trim(),
            requestSummary: leadForm.requestSummary.trim(),
            phones,
            emails,
            sourceObject: leadForm.sourceObject.trim(),
            sourceNote: leadForm.sourceNote.trim(),
            actualityStatus: leadForm.actualityStatus,
            assignee: leadForm.assignee || undefined,
            createdByEmployee: currentEmployeeId || undefined,
            createdFrom: 'advertising',
            attractedProperty: leadForm.attractedProperty || undefined,
            advertisingLinkId: leadForm.advertisingLinkId || undefined,
            advertisingPlatform: leadForm.advertisingPlatform || undefined,
            advertisingLinkTitle: leadForm.advertisingLinkTitle || undefined,
            advertisingLinkUrl: leadForm.advertisingLinkUrl || undefined,
            leadAppearedAt: new Date().toISOString(),
            lastActualizedAt: new Date().toISOString(),
            notes,
         };

         const res = await fetch(editingLead?._id ? `/api/crm/leads/${editingLead._id}` : '/api/crm/leads', {
            method: editingLead?._id ? 'PATCH' : 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(editingLead?._id ? { ...payload, action: 'update', leadAppearedAt: editingLead.leadAppearedAt || editingLead.createdAt } : payload),
         });
         const data = await res.json().catch(async () => ({ error: await res.text() }));
         if (!res.ok) throw new Error(data?.error || 'Не вдалося створити ліда');

         closeLeadDialog();
         await fetchAdvertisingLeads();
      } catch (err) {
         setLeadError(err.message || 'Не вдалося створити ліда');
      } finally {
         setLeadSaving(false);
      }
   };
   const handleDeleteLead = async () => {
      if (!deleteLead?._id) return;
      setLeadSaving(true);
      try {
         const res = await fetch(`/api/crm/leads/${deleteLead._id}`, { method: 'DELETE' });
         const data = await res.json().catch(async () => ({ error: await res.text() }));
         if (!res.ok) throw new Error(data?.error || 'Не вдалося видалити ліда');
         setDeleteLead(null);
         if (expandedAdvertisingLeadId === deleteLead._id) setExpandedAdvertisingLeadId('');
         await fetchAdvertisingLeads();
      } catch (err) {
         setLeadError(err.message || 'Не вдалося видалити ліда');
      } finally {
         setLeadSaving(false);
      }
   };
   const downloadFilteredLeadsExcel = () => {
      const rows = filteredAdvertisingLeads.map((lead, index) => ([
         index + 1,
         lead.name || '',
         leadKindLabel(lead.leadKind),
         leadStageLabel(lead.stage),
         lead.phones?.join(', ') || '',
         lead.emails?.join(', ') || '',
         leadBudgetLabel(lead),
         lead.actualityStatus || '',
         lead.sourceObject || '',
         lead.advertisingLinkTitle || '',
         lead.sourceChannel || '',
         employeeName(lead.assignee),
         employeeName(lead.createdByEmployee),
         formatDateTime(lead.leadAppearedAt || lead.createdAt),
         lead.requestSummary || '',
      ]));
      const headers = ['№', 'Ім’я', 'Тип ліда', 'Стадія', 'Телефон', 'Email', 'Бюджет max', 'Актуальність', 'Об’єкт', 'Рекламна ссилка', 'Канал', 'Відповідальний', 'Хто вніс', 'Дата появи', 'Заявка'];
      const tableRows = [
         `<tr>${headers.map((header) => `<th>${escapeHtml(header)}</th>`).join('')}</tr>`,
         ...rows.map((row) => `<tr>${row.map((cell) => `<td>${escapeHtml(cell)}</td>`).join('')}</tr>`),
      ].join('');
      const html = `<!doctype html><html><head><meta charset="utf-8" /><style>table{border-collapse:collapse;font-family:"Times New Roman",serif;font-size:12pt;}th{font-weight:bold;background:#d9eaf7;border:1px solid #111;padding:6px;}td{border:1px solid #333;padding:5px;vertical-align:top;} .text{mso-number-format:"\\@";}</style></head><body><table>${tableRows}</table></body></html>`;
      const blob = new Blob([html], { type: 'application/vnd.ms-excel;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `karamax-leads-${toInputDate(new Date())}.xls`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
   };
   const openAdvertisingActionsPdfReport = async () => {
      setError('');
      try {
      const actionRows = visibleEvents;
      const totals = actionRows.reduce((acc, event) => {
         acc.count += 1;
         const label = event.actionLabel || actionMap[event.actionType] || event.actionType || 'Дія';
         acc.actions[label] = (acc.actions[label] || 0) + 1;
         return acc;
      }, { count: 0, actions: {} });
      const actionSummary = Object.entries(totals.actions)
         .filter(([, count]) => count > 0)
         .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], 'uk'));
      const selectedProperty = selectedAdvertisingPropertyId
         ? advertisingProperties.find((item) => String(item._id) === String(selectedAdvertisingPropertyId))
         : null;
      const selectedEmployee = filters.employee === 'all'
         ? 'Усі рекламщики'
         : employeeName(employees.find((item) => String(item._id) === String(filters.employee))) || 'Рекламщик';
      const selectedPlatform = filters.platform === 'all'
         ? 'Усі сайти'
         : platformMap[filters.platform] || filters.platform || 'Сайт';
      const selectedAction = filters.actionType === 'all'
         ? 'Усі дії'
         : actionMap[filters.actionType] || filters.actionType || 'Дія';
      const periodLabel = PERIOD_OPTIONS.find(([value]) => value === filters.period)?.[1] || 'Весь період';
      const reportPeriodLabel = filters.period === 'all'
         ? 'Весь період'
         : filters.period === 'day'
            ? formatDateOnly(filters.day)
            : filters.period === 'range'
               ? `${formatDateOnly(filters.day)} - ${formatDateOnly(filters.dateTo)}`
               : periodLabel;
      const activeFilterLines = [`Період: ${reportPeriodLabel}`];
      if (filters.platform !== 'all') activeFilterLines.push(`Сайт: ${selectedPlatform}`);
      if (filters.actionType !== 'all') activeFilterLines.push(`Дія: ${selectedAction}`);
      if (selectedProperty) activeFilterLines.push(`Об’єкт: ${propertyLabel(selectedProperty)}`);
      if (filters.employee !== 'all') activeFilterLines.push(`Рекламщик: ${selectedEmployee}`);
      if (filters.q.trim()) activeFilterLines.push(`Пошук: ${filters.q.trim()}`);

      const width = 1240;
      const height = Math.max(1754, 560 + Math.max(actionSummary.length, 1) * 58);
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, width, height);
      ctx.fillStyle = '#182033';
      ctx.font = 'bold 44px "Times New Roman", serif';
      ctx.fillText(`Звіт рекламних дій - ${reportPeriodLabel}`, 70, 95);
      ctx.font = '24px "Times New Roman", serif';
      ctx.fillStyle = '#374151';
      ctx.fillText(`Сформовано: ${formatDateTime(new Date())}`, 70, 140);
      ctx.fillText(`Дій у звіті: ${totals.count.toLocaleString('uk-UA')}`, 70, 175);

      ctx.font = '22px "Times New Roman", serif';
      activeFilterLines.forEach((line, index) => ctx.fillText(line, 70, 235 + index * 32));

      const tableTop = 430;
      const tableLeft = 70;
      const tableWidth = width - 140;
      const nameWidth = tableWidth - 210;
      const countWidth = 210;
      const rowHeight = 58;

      ctx.fillStyle = '#fef3c7';
      ctx.fillRect(tableLeft, tableTop, tableWidth, rowHeight);
      ctx.fillStyle = '#fb923c';
      ctx.fillRect(tableLeft, tableTop, 8, rowHeight);
      ctx.strokeStyle = '#f59e0b';
      ctx.strokeRect(tableLeft, tableTop, tableWidth, rowHeight);
      ctx.fillStyle = '#182033';
      ctx.font = 'bold 25px "Times New Roman", serif';
      ctx.fillText('Рекламна дія', tableLeft + 22, tableTop + 38);
      ctx.textAlign = 'right';
      ctx.fillText('Кількість', tableLeft + tableWidth - 22, tableTop + 38);
      ctx.textAlign = 'left';

      const rows = actionSummary.length ? actionSummary : [['Дій за поточними фільтрами немає', 0]];
      rows.forEach(([label, count], index) => {
         const y = tableTop + rowHeight * (index + 1);
         ctx.fillStyle = index % 2 ? '#ffffff' : '#f8fafc';
         ctx.fillRect(tableLeft, y, tableWidth, rowHeight);
         ctx.strokeStyle = '#cbd5e1';
         ctx.strokeRect(tableLeft, y, tableWidth, rowHeight);
         ctx.beginPath();
         ctx.moveTo(tableLeft + nameWidth, y);
         ctx.lineTo(tableLeft + nameWidth, y + rowHeight);
         ctx.stroke();
         ctx.fillStyle = '#111827';
         ctx.font = '24px "Times New Roman", serif';
         ctx.fillText(String(label), tableLeft + 22, y + 37, nameWidth - 44);
         ctx.fillStyle = '#ecfeff';
         ctx.fillRect(tableLeft + nameWidth + 20, y + 10, countWidth - 40, rowHeight - 20);
         ctx.strokeStyle = '#38bdf8';
         ctx.strokeRect(tableLeft + nameWidth + 20, y + 10, countWidth - 40, rowHeight - 20);
         ctx.fillStyle = '#0f172a';
         ctx.textAlign = 'right';
         ctx.font = 'bold 25px "Times New Roman", serif';
         ctx.fillText(Number(count).toLocaleString('uk-UA'), tableLeft + nameWidth + countWidth - 22, y + 37);
         ctx.textAlign = 'left';
      });

      const jpeg = canvas.toDataURL('image/jpeg', 0.92);
      const binary = atob(jpeg.split(',')[1]);
      const imageBytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i += 1) imageBytes[i] = binary.charCodeAt(i);

      const pageWidth = 595.28;
      const pageHeight = pageWidth * (height / width);
      const encoder = new TextEncoder();
      const chunks = [];
      const offsets = [0];
      const pushText = (text) => chunks.push(encoder.encode(text));
      const pushBytes = (bytes) => chunks.push(bytes);
      const currentOffset = () => chunks.reduce((sum, part) => sum + part.length, 0);
      const addObject = (id, body, stream) => {
         offsets[id] = currentOffset();
         pushText(`${id} 0 obj\n${body}`);
         if (stream) {
            pushText('\nstream\n');
            pushBytes(stream);
            pushText('\nendstream');
         }
         pushText('\nendobj\n');
      };

      pushText('%PDF-1.4\n%Karamax\n');
      addObject(1, '<< /Type /Catalog /Pages 2 0 R >>');
      addObject(2, '<< /Type /Pages /Kids [3 0 R] /Count 1 >>');
      addObject(3, `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pageWidth.toFixed(2)} ${pageHeight.toFixed(2)}] /Resources << /XObject << /Im0 4 0 R >> >> /Contents 5 0 R >>`);
      addObject(4, `<< /Type /XObject /Subtype /Image /Width ${width} /Height ${height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${imageBytes.length} >>`, imageBytes);
      const content = encoder.encode(`q\n${pageWidth.toFixed(2)} 0 0 ${pageHeight.toFixed(2)} 0 0 cm\n/Im0 Do\nQ\n`);
      addObject(5, `<< /Length ${content.length} >>`, content);
      const xrefOffset = currentOffset();
      pushText('xref\n0 6\n0000000000 65535 f \n');
      for (let i = 1; i <= 5; i += 1) pushText(`${String(offsets[i]).padStart(10, '0')} 00000 n \n`);
      pushText(`trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`);

      const blob = new Blob(chunks, { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'Звіт рекламних дій.pdf';
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
      setReportsAnchor(null);
      } catch (err) {
         console.error('Advertising PDF report failed', err);
         setError(err?.message || 'Не вдалося сформувати PDF звіт');
         setReportsAnchor(null);
      }
   };

   const openMediaStrip = (property, stage = 'draft') => {
      if (!property?._id) return;
      if (String(mediaPropertyId) === String(property._id)) {
         setMediaPropertyId('');
         setMediaError('');
         return;
      }
      const images = property.images || [];
      const hasStageImages = (stageValue) => images.some((image) => imageStageValue(image) === stageValue);
      const hasVideos = propertyVideos(property).length > 0;
      const initialStage = hasStageImages(stage)
         ? stage
         : (PHOTO_STAGES.find((item) => hasStageImages(item.value))?.value || (hasVideos ? 'video' : stage));
      setMediaPropertyId(property._id);
      setMediaStage(initialStage);
      setMediaError('');
   };

   const mediaStageImages = (property, stage) => (
      (property?.images || [])
         .filter((image) => imageStageValue(image) === stage)
         .sort((a, b) => Number((typeof a === 'string' ? 0 : a.sortOrder) ?? 0) - Number((typeof b === 'string' ? 0 : b.sortOrder) ?? 0))
   );

   const downloadImageFile = async (image, filename = 'photo') => {
      const url = getImageStageUrl(image);
      if (!url) return;

      const res = await fetch(url);
      const blob = await res.blob();
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      const ext = image.format || blob.type?.split('/')?.[1] || 'jpg';
      link.href = blobUrl;
      link.download = `${filename}.${ext}`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(blobUrl);
   };

   const downloadMediaStage = async (property, stage) => {
      const images = mediaStageImages(property, stage);
      if (!images.length) return;

      setMediaError('');
      try {
         for (let index = 0; index < images.length; index += 1) {
            await downloadImageFile(images[index], `${propertyLabel(property)}-${stage}-${index + 1}`);
         }
      } catch (error) {
         setMediaError(error?.message || 'Не вдалося скачати фото');
      }
   };

   const handleMediaImageAction = async (property, image, action, hidden, stage) => {
      const imageId = getImageActionId(image);
      if (!property?._id || !imageId) return;

      setMediaError('');
      try {
         const res = await fetch(`/api/crm/properties/${property._id}/images`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ imageId, action, hidden, stage }),
         });

         if (!res.ok) {
            const body = await res.json().catch(async () => ({ error: await res.text() }));
            throw new Error(body.error || 'Не вдалося оновити фото');
         }

         await fetchAdvertisingProperties();
      } catch (error) {
         setMediaError(error?.message || 'Не вдалося оновити фото');
      }
   };

   const handleDeleteMediaImage = async (property, image) => {
      const imageId = getImageActionId(image);
      if (!property?._id || !imageId) return;
      if (!window.confirm('Видалити це фото з об’єкта?')) return;

      setMediaError('');
      try {
         const res = await fetch(`/api/crm/properties/${property._id}/images`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ imageId }),
         });

         if (!res.ok) {
            const body = await res.json().catch(async () => ({ error: await res.text() }));
            throw new Error(body.error || 'Не вдалося видалити фото');
         }

         await fetchAdvertisingProperties();
      } catch (error) {
         setMediaError(error?.message || 'Не вдалося видалити фото');
      }
   };

   const createPhotoProcessingEvent = async (property, stage, count) => {
      if (!property?._id || !count || stage === 'draft') return;
      const stageLabel = PHOTO_STAGES.find((item) => item.value === stage)?.label || stage;

      await fetch('/api/crm/advertising/events', {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({
            property: property._id,
            actionType: 'photo_processing',
            platform: 'other',
            sourceType: 'ours',
            occurredAt: new Date().toISOString(),
            note: `Додано ${count} фото в групу "${stageLabel}"`,
         }),
      }).catch((error) => console.error('Photo processing event failed', error));
   };

   const uploadMediaFiles = async (property, stage, fileList) => {
      const files = Array.from(fileList || []);
      if (!property?._id || !files.length) return;

      setMediaUploading(true);
      setMediaError('');

      try {
         const prepared = await prepareImageUploadFiles(files, {
            maxPayloadBytes: SAFE_IMAGE_PAYLOAD_BYTES,
         });

         if (prepared.failed.length || prepared.skipped.length) {
            setMediaError([...prepared.failed, ...prepared.skipped.map((name) => `${name} не вліз у пакет`)].join('; '));
         }

         const batches = buildImageUploadBatches(prepared.accepted, {
            maxPayloadBytes: SAFE_IMAGE_PAYLOAD_BYTES,
         });

         let uploadedCount = 0;
         for (const batch of batches) {
            const formData = new FormData();
            batch.forEach((file) => formData.append('images', file));
            formData.append('stage', stage);

            const res = await fetch(`/api/crm/properties/${property._id}/images`, {
               method: 'POST',
               body: formData,
            });

            if (!res.ok) {
               const body = await res.json().catch(async () => ({ error: await res.text() }));
               throw new Error(body.error || 'Не вдалося завантажити фото');
            }

            uploadedCount += batch.length;
         }

         await createPhotoProcessingEvent(property, stage, uploadedCount);
         await Promise.all([fetchAdvertisingProperties(), fetchEvents()]);
      } catch (error) {
         setMediaError(error?.message || 'Не вдалося завантажити фото');
      } finally {
         setMediaUploading(false);
         if (mediaUploadInputRef.current) mediaUploadInputRef.current.value = '';
      }
   };

   const loadProperties = async (search = '') => {
      const requestSeq = propertySearchSeqRef.current + 1;
      propertySearchSeqRef.current = requestSeq;
      try {
         setPropertiesLoading(true);
         const value = search.trim();
         const params = new URLSearchParams();
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
      fetchAdvertisingLeads();
   }, []);

   useEffect(() => {
      const timer = setTimeout(fetchAdvertisingProperties, propertyWorkSearch.trim() ? 350 : 0);
      return () => clearTimeout(timer);
   }, [propertyWorkSearch]);

   useEffect(() => {
      fetchAdvertisingLeads();
   }, [currentEmployeeId, canSeeAllAdvertisingLeads]);

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

   const openEditAdText = (property, text) => {
      if (!property?._id || !text?._id) return;
      setEditingAdText({ propertyId: property._id, textId: text._id });
      setAdTextForm({
         title: text.title || '',
         text: text.text || '',
         note: text.note || '',
      });
   };

   const closeEditAdText = () => {
      setEditingAdText(null);
      setAdTextForm({ title: '', text: '', note: '' });
   };

   const handleSaveAdText = async () => {
      if (!editingAdText?.propertyId || !editingAdText?.textId) return;
      setSaving(true);
      setError('');
      try {
         const res = await fetch(`/api/crm/properties/${editingAdText.propertyId}/add-ad-text`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
               textId: editingAdText.textId,
               title: adTextForm.title,
               text: adTextForm.text,
               note: adTextForm.note,
            }),
         });
         if (!res.ok) throw new Error(await res.text());
         closeEditAdText();
         await fetchAdvertisingProperties();
      } catch (err) {
         setError(err.message || 'Не вдалося зберегти рекламний текст');
      } finally {
         setSaving(false);
      }
   };

   const handleDeleteAdText = async (property, text) => {
      if (!property?._id || !text?._id) return;
      setSaving(true);
      setError('');
      try {
         const res = await fetch(`/api/crm/properties/${property._id}/add-ad-text`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ textId: text._id }),
         });
         if (!res.ok) throw new Error(await res.text());
         if (expandedAdTextId === String(text._id)) setExpandedAdTextId('');
         await fetchAdvertisingProperties();
      } catch (err) {
         setError(err.message || 'Не вдалося видалити рекламний текст');
      } finally {
         setSaving(false);
      }
   };

   const handleEditEvent = (event) => {
      if (!event) return;
      if (event.property?._id) rememberPropertyOption(event.property);
      setEditingEvent(event);
      setForm({
         property: event.property?._id || event.property || '',
         actionType: event.actionType || 'scanner',
         platform: event.platform || 'olx',
         sourceType: event.sourceType || 'ours',
         advertisingLinkId: event.advertisingLinkId || '',
         linkMode: createsPropertyLinkAction(event.actionType) ? 'new' : (event.advertisingLinkId ? 'existing' : 'new'),
         linkTitle: event.linkTitle || '',
         linkUrl: event.advertisingLinkId ? '' : event.linkUrl || '',
         linkCreatedAt: toInputDateTime(event.linkCreatedAt || event.occurredAt || new Date()),
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

   const handleOpenVideoActionForProperty = (property) => {
      handleOpenActionForProperty(property, null, 'video_processing');
      setForm((prev) => ({
         ...prev,
         actionType: 'video_processing',
         platform: 'youtube',
         advertisingLinkId: '',
         linkMode: 'new',
         linkTitle: '',
         linkUrl: '',
      }));
      setDialogOpen(true);
   };

   const handleSelectFormProperty = (property) => {
      rememberPropertyOption(property);
      const firstLink = property?.advertisingLinks?.find((item) => !item?.closedAt && item?.status !== 'archived') || property?.advertisingLinks?.[0] || null;
      setForm((prev) => ({
         ...prev,
         property: property?._id || '',
         responsibleEmployee: property?.advertisingSettings?.assignedEmployee?._id || property?.advertisingSettings?.assignedEmployee || prev.responsibleEmployee || '',
         platform: requiresExistingAdvertisingLink(prev.actionType) ? (firstLink?.platform || prev.platform) : prev.platform,
         advertisingLinkId: requiresExistingAdvertisingLink(prev.actionType) ? (firstLink?._id || '') : '',
         linkMode: createsPropertyLinkAction(prev.actionType) ? 'new' : (firstLink?._id ? 'existing' : prev.linkMode),
         linkTitle: requiresExistingAdvertisingLink(prev.actionType) ? adLinkLabel(firstLink, '', property?.advertisingLinks || []) : prev.linkTitle,
         linkUrl: '',
         linkCreatedAt: prev.linkCreatedAt || toInputDateTime(new Date()),
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
            const shouldCreateLink = createsPropertyLinkAction(value);
            const needsExistingLink = requiresExistingAdvertisingLink(value);
            if (shouldCreateLink) {
               next.linkMode = 'new';
               next.advertisingLinkId = '';
               next.sourceType = sourceTypeForAction(value, next.sourceType);
               if (isLinkSourceAction(value)) next.linkTitle = '';
               next.linkCreatedAt = next.linkCreatedAt || next.occurredAt || toInputDateTime(new Date());
            } else if (needsExistingLink && !next.advertisingLinkId && selectedLinks[0]?._id) {
               next.linkMode = 'existing';
               next.advertisingLinkId = selectedLinks[0]._id;
               next.platform = selectedLinks[0].platform || next.platform;
               next.sourceType = selectedLinks[0].sourceType || next.sourceType;
               next.linkTitle = adLinkLabel(selectedLinks[0], '', selectedProperty?.advertisingLinks || []);
            } else if (!needsExistingLink) {
               next.linkMode = 'existing';
               next.advertisingLinkId = '';
               next.linkTitle = '';
               next.linkUrl = '';
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
      const shouldCreateLink = createsPropertyLinkAction(form.actionType);
      const needsExistingLink = requiresExistingAdvertisingLink(form.actionType);
      const hasStandaloneLink = isStandaloneWorkAction(form.actionType);
      const hasMetrics = actionHasMetrics(form.actionType);
      if (!form.property || (needsExistingLink && !form.advertisingLinkId)) {
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
            sourceType: sourceTypeForAction(form.actionType, form.sourceType),
            advertisingLinkId: shouldCreateLink ? (editingEvent?.advertisingLinkId || '') : (!needsExistingLink ? '' : form.advertisingLinkId),
            linkTitle: shouldCreateLink || hasStandaloneLink || form.linkMode === 'new' ? form.linkTitle : '',
            linkUrl: shouldCreateLink || hasStandaloneLink || form.linkMode === 'new' ? form.linkUrl : '',
            linkCreatedAt: shouldCreateLink || form.linkMode === 'new' ? toPayloadDateTime(form.linkCreatedAt || form.occurredAt) : '',
            occurredAt: toPayloadDateTime(form.occurredAt),
            responsibleEmployee: form.responsibleEmployee,
            costUah: hasMetrics ? form.costUah : '',
            note: form.note,
            metrics: hasMetrics ? {
               views: form.views,
               calls: form.calls,
               messages: form.messages,
               phoneOpens: form.phoneOpens,
               favorites: form.favorites,
               saves: form.saves,
               clicks: form.clicks,
               position: form.position,
            } : {},
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
      if (!deleteEvent?._id) return;
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

         <Popover
            open={Boolean(linkGroupPopover.anchorEl)}
            anchorEl={linkGroupPopover.anchorEl}
            onClose={closeLinkGroupPopover}
            disableScrollLock
            disableAutoFocus
            disableEnforceFocus
            disableRestoreFocus
            marginThreshold={8}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
            transformOrigin={{ vertical: 'top', horizontal: 'left' }}
            PaperProps={{
               onMouseLeave: closeLinkGroupPopover,
               sx: {
                  mt: 0.8,
                  p: 1,
                  borderRadius: 2.2,
                  minWidth: 260,
                  maxWidth: 420,
                  bgcolor: theme.bgPanel,
                  color: theme.text,
                  border: `1px solid ${theme.border}`,
                  boxShadow: '0 18px 44px rgba(0,0,0,0.5)',
               },
            }}
         >
            <Stack spacing={0.65}>
               {linkGroupPopover.links.map((link, index) => (
                  <Stack
                     key={link._id || link.url || `${linkGroupPopover.platform}-${index}`}
                     direction="row"
                     spacing={0.6}
                     alignItems="center"
                  >
                     <Button
                        component={link.url ? 'a' : 'button'}
                        href={link.url || undefined}
                        target={link.url ? '_blank' : undefined}
                        rel={link.url ? 'noreferrer' : undefined}
                        disabled={!link.url}
                        startIcon={<LinkRoundedIcon sx={{ fontSize: 16 }} />}
                        sx={{
                           flex: 1,
                           minHeight: 28,
                           py: 0.25,
                           px: 0.8,
                           justifyContent: 'flex-start',
                           textTransform: 'none',
                           color: theme.text,
                           fontSize: 12,
                           fontWeight: 850,
                           borderRadius: 1.8,
                           bgcolor: 'rgba(255,255,255,0.035)',
                           '& .MuiButton-startIcon': { mr: 0.65 },
                           '& .MuiButton-endIcon': { ml: 0.65 },
                           '& .MuiButton-label': { overflow: 'hidden' },
                        }}
                     >
                        <Box component="span" sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                           {adLinkLabel(link, linkGroupPopover.platform, linkGroupPopover.allLinks)}
                        </Box>
                     </Button>

                     <Tooltip title="Додати ліда з цього посилання">
                        <IconButton
                           size="small"
                           onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              const property = linkGroupPopover.property;
                              closeLinkGroupPopover();
                              openLeadDialog({ property, link });
                           }}
                           sx={{
                              width: 28,
                              height: 28,
                              color: '#38bdf8',
                              border: '1px solid rgba(56,189,248,0.42)',
                              bgcolor: 'rgba(56,189,248,0.08)',
                              '&:hover': { bgcolor: 'rgba(56,189,248,0.16)' },
                           }}
                        >
                           <PersonAddAlt1RoundedIcon sx={{ fontSize: 15 }} />
                        </IconButton>
                     </Tooltip>

                     <Tooltip title="Скопіювати посилання">
                        <span>
                           <IconButton
                              size="small"
                              disabled={!link.url}
                              onClick={(e) => {
                                 e.preventDefault();
                                 e.stopPropagation();
                                 copyAdvertisingLink(link.url);
                              }}
                              sx={{
                                 width: 28,
                                 height: 28,
                                 color: theme.text,
                                 border: `1px solid ${theme.border}`,
                                 opacity: link.url ? 1 : 0.45,
                              }}
                           >
                              <ContentCopyRoundedIcon sx={{ fontSize: 15 }} />
                           </IconButton>
                        </span>
                     </Tooltip>
                  </Stack>
               ))}
            </Stack>
         </Popover>

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
                     display: showAdvertisingLeadList ? 'none' : 'block',
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
                      <Tooltip title="Звіти">
                         <IconButton
                            onMouseEnter={(e) => setReportsAnchor(e.currentTarget)}
                            onClick={(e) => {
                               e.stopPropagation();
                               openAdvertisingActionsPdfReport();
                            }}
                            sx={{
                               width: 48,
                               height: 48,
                               borderRadius: 2,
                               color: '#fde68a',
                               bgcolor: 'rgba(250,204,21,0.1)',
                               border: '1px solid rgba(250,204,21,0.35)',
                               '&:hover': { bgcolor: 'rgba(250,204,21,0.18)' },
                            }}
                         >
                            <PictureAsPdfRoundedIcon />
                         </IconButton>
                      </Tooltip>
                      <Menu
                         anchorEl={reportsAnchor}
                         open={Boolean(reportsAnchor)}
                         onClose={() => setReportsAnchor(null)}
                         PaperProps={{
                            onMouseLeave: () => setReportsAnchor(null),
                            sx: {
                               mt: 1,
                               borderRadius: 2,
                               bgcolor: theme.bgPanel,
                               color: theme.text,
                               border: `1px solid ${theme.border}`,
                            },
                         }}
                      >
                         <MenuItem
                            onClick={() => {
                               setReportsAnchor(null);
                               openAdvertisingActionsPdfReport();
                             }}
                          >
                             <PictureAsPdfRoundedIcon sx={{ mr: 1, color: '#fde68a' }} fontSize="small" />
                             Звіт рекламних дій .pdf
                          </MenuItem>
                      </Menu>
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
                                    onClick={(e) => {
                                       e.stopPropagation();
                                       openMediaStrip(property);
                                    }}
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
                                       cursor: 'zoom-in',
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
                                       <Chip size="small" label={getAdvertisingStatusLabel(settings.status)} sx={{ height: 20, maxWidth: 110, fontSize: 10.5, fontWeight: 900, ...getAdvertisingStatusSx(settings.status), '& .MuiChip-label': { px: 0.65 } }} />
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

                  {mediaProperty && (() => {
                     const stageImages = mediaStageImages(mediaProperty, mediaStage);
                     const videoItems = propertyVideos(mediaProperty);
                     const isVideoStage = mediaStage === 'video';
                     const stageCounts = PHOTO_STAGES.reduce((acc, stage) => {
                        acc[stage.value] = mediaStageImages(mediaProperty, stage.value).length;
                        return acc;
                     }, {});
                     const activeStageLabel = PHOTO_STAGES.find((stage) => stage.value === mediaStage)?.label || 'Фото';
                     const visibleStageLabel = isVideoStage ? '\u0412\u0456\u0434\u0435\u043e' : activeStageLabel;

                     return (
                        <Box
                           sx={{
                              mt: 1,
                              borderRadius: 2.6,
                              border: `1px solid ${theme.border}`,
                              bgcolor: mode === 'light' ? 'rgba(255,255,255,0.9)' : 'rgba(9,9,18,0.76)',
                              overflow: 'hidden',
                           }}
                        >
                           <input
                              ref={mediaUploadInputRef}
                              type="file"
                              accept="image/*,.heic,.heif"
                              multiple
                              hidden
                              onChange={(event) => uploadMediaFiles(mediaProperty, mediaStage, event.target.files)}
                           />

                           <Stack
                              direction={{ xs: 'column', md: 'row' }}
                              spacing={1}
                              alignItems={{ xs: 'stretch', md: 'center' }}
                              sx={{ px: 1.1, py: 0.85, borderBottom: `1px solid ${theme.border}` }}
                           >
                              <Stack direction="row" spacing={0.75} alignItems="center" sx={{ minWidth: 0, flex: 1 }}>
                                 <ImageRoundedIcon sx={{ color: '#38bdf8' }} />
                                 <Box sx={{ minWidth: 0 }}>
                                    <Typography sx={{ fontWeight: 950, lineHeight: 1.1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                       Медіа · {propertyLabel(mediaProperty)}
                                    </Typography>
                                    <Typography sx={{ color: theme.textSoft, fontSize: 11, fontWeight: 800 }}>
                                       {visibleStageLabel}: {isVideoStage ? `${videoItems.length} \u0432\u0456\u0434\u0435\u043e` : `${stageImages.length} \u0444\u043e\u0442\u043e`}
                                    </Typography>
                                 </Box>
                              </Stack>

                              <Stack direction="row" spacing={0.6} flexWrap="wrap" useFlexGap>
                                 {PHOTO_STAGES.map((stage) => {
                                    const active = mediaStage === stage.value;
                                    return (
                                       <Button
                                          key={stage.value}
                                          size="small"
                                          onClick={() => setMediaStage(stage.value)}
                                          sx={{
                                             borderRadius: 999,
                                             minHeight: 28,
                                             px: 1.2,
                                             color: active ? '#0b0b12' : theme.text,
                                             bgcolor: active ? '#38bdf8' : 'rgba(255,255,255,0.045)',
                                             border: `1px solid ${active ? '#38bdf8' : theme.border}`,
                                             fontWeight: 950,
                                             '&:hover': { bgcolor: active ? '#0ea5e9' : 'rgba(255,255,255,0.08)' },
                                          }}
                                       >
                                          {stage.label} {stageCounts[stage.value] || 0}
                                       </Button>
                                    );
                                 })}
                                 <Button
                                    size="small"
                                    onClick={() => setMediaStage('video')}
                                    sx={{
                                       borderRadius: 999,
                                       minHeight: 28,
                                       px: 1.2,
                                       color: isVideoStage ? '#0b0b12' : theme.text,
                                       bgcolor: isVideoStage ? '#60a5fa' : 'rgba(255,255,255,0.045)',
                                       border: `1px solid ${isVideoStage ? '#60a5fa' : theme.border}`,
                                       fontWeight: 950,
                                       '&:hover': { bgcolor: isVideoStage ? '#3b82f6' : 'rgba(255,255,255,0.08)' },
                                    }}
                                 >
                                    {'\u0412\u0456\u0434\u0435\u043e'} {videoItems.length}
                                 </Button>
                              </Stack>

                              <Stack direction="row" spacing={0.6} justifyContent={{ xs: 'flex-start', md: 'flex-end' }}>
                                 <Button
                                    size="small"
                                    startIcon={<DownloadRoundedIcon />}
                                    disabled={isVideoStage || !stageImages.length || mediaUploading}
                                    onClick={() => downloadMediaStage(mediaProperty, mediaStage)}
                                    sx={{ color: '#bfdbfe', borderRadius: 999, fontWeight: 950, border: `1px solid ${theme.border}` }}
                                 >
                                    Скачати
                                 </Button>
                                 <Button
                                    size="small"
                                    startIcon={isVideoStage ? <OndemandVideoRoundedIcon /> : <CloudUploadRoundedIcon />}
                                    disabled={mediaUploading}
                                    onClick={() => isVideoStage ? handleOpenVideoActionForProperty(mediaProperty) : mediaUploadInputRef.current?.click()}
                                    sx={{ color: '#fed7aa', borderRadius: 999, fontWeight: 950, border: '1px solid rgba(251,146,60,0.35)' }}
                                 >
                                    {mediaUploading ? 'Завантажую...' : `+ ${visibleStageLabel}`}
                                 </Button>
                                 <Tooltip title="Закрити медіа">
                                    <IconButton size="small" onClick={() => setMediaPropertyId('')} sx={{ color: theme.textSoft, border: `1px solid ${theme.border}` }}>
                                       <CloseRoundedIcon fontSize="small" />
                                    </IconButton>
                                 </Tooltip>
                              </Stack>
                           </Stack>

                           {!!mediaError && (
                              <Typography sx={{ px: 1.2, pt: 0.75, color: '#fb7185', fontSize: 12, fontWeight: 850 }}>
                                 {mediaError}
                              </Typography>
                           )}

                           <Box sx={{ px: 1.1, py: 0.9, overflowX: 'auto' }}>
                              <Stack direction="row" spacing={0.75} sx={{ minHeight: 104 }}>
                                 {isVideoStage && (videoItems.length ? videoItems.map((video, index) => {
                                    const typeColor = videoTypeColor(video.type);
                                    return (
                                       <Box
                                          key={video._id || video.url || `video-${index}`}
                                          sx={{
                                             width: 220,
                                             minHeight: 96,
                                             flex: '0 0 220px',
                                             borderRadius: 2,
                                             border: `1px solid ${theme.border}`,
                                             bgcolor: 'rgba(255,255,255,0.045)',
                                             p: 0.9,
                                             display: 'flex',
                                             flexDirection: 'column',
                                             gap: 0.6,
                                          }}
                                       >
                                          <Stack direction="row" spacing={0.6} alignItems="center" sx={{ minWidth: 0 }}>
                                             <OndemandVideoRoundedIcon sx={{ fontSize: 18, color: '#60a5fa', flex: '0 0 auto' }} />
                                             <Typography sx={{ fontWeight: 950, fontSize: 12, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
                                                {video.title || platformMap[video.platform] || video.platform || '\u0412\u0456\u0434\u0435\u043e'}
                                             </Typography>
                                          </Stack>
                                          <Stack direction="row" spacing={0.5} alignItems="center" flexWrap="wrap" useFlexGap>
                                             <Chip size="small" label={platformMap[video.platform] || video.platform || 'Video'} sx={{ height: 20, fontSize: 10, fontWeight: 900, bgcolor: 'rgba(96,165,250,0.12)', color: '#bfdbfe', border: '1px solid rgba(96,165,250,0.28)' }} />
                                             <Chip size="small" label={videoTypeLabel(video.type)} sx={{ height: 20, fontSize: 10, fontWeight: 900, bgcolor: `${typeColor}1f`, color: typeColor, border: `1px solid ${typeColor}55` }} />
                                          </Stack>
                                          {!!video.note && (
                                             <Typography sx={{ color: theme.textSoft, fontSize: 11, fontWeight: 750, lineHeight: 1.2, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                                                {video.note}
                                             </Typography>
                                          )}
                                          <Stack direction="row" spacing={0.5} sx={{ mt: 'auto' }}>
                                             <Button size="small" href={video.url || undefined} target="_blank" rel="noreferrer" disabled={!video.url} startIcon={<OpenInNewRoundedIcon />} sx={{ minHeight: 24, px: 0.8, borderRadius: 999, fontSize: 10, fontWeight: 950, color: '#bfdbfe', border: `1px solid ${theme.border}` }}>
                                                URL
                                             </Button>
                                             <Button size="small" disabled={!video.url} onClick={() => navigator.clipboard?.writeText(video.url)} sx={{ minHeight: 24, px: 0.8, borderRadius: 999, fontSize: 10, fontWeight: 950, color: theme.textSoft, border: `1px solid ${theme.border}` }}>
                                                Copy
                                             </Button>
                                          </Stack>
                                       </Box>
                                    );
                                 }) : (
                                    <Stack alignItems="center" justifyContent="center" sx={{ width: '100%', minHeight: 88, color: theme.textSoft }}>
                                       <Typography sx={{ fontWeight: 900 }}>{'\u0412\u0456\u0434\u0435\u043e \u0449\u0435 \u043d\u0435\u043c\u0430\u0454'}</Typography>
                                    </Stack>
                                 ))}
                                 {!isVideoStage && (stageImages.length ? stageImages.map((image, index) => {
                                    const url = getImageStageUrl(image);
                                    return (
                                       <Box
                                          key={image._id || image.public_id || `${mediaStage}-${index}`}
                                          sx={{
                                             width: 118,
                                             height: 88,
                                             flex: '0 0 118px',
                                             borderRadius: 2,
                                             overflow: 'hidden',
                                             border: image.isMain ? '1px solid #facc15' : `1px solid ${theme.border}`,
                                             bgcolor: 'rgba(255,255,255,0.045)',
                                             position: 'relative',
                                             opacity: image.isHidden ? 0.52 : 1,
                                          }}
                                       >
                                          {url ? (
                                             <Box
                                                component="img"
                                                src={url}
                                                alt=""
                                                onClick={() => window.open(url, '_blank', 'noreferrer')}
                                                sx={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', cursor: 'zoom-in' }}
                                             />
                                          ) : (
                                             <Stack alignItems="center" justifyContent="center" sx={{ width: '100%', height: '100%' }}>
                                                <ImageRoundedIcon sx={{ color: theme.textSoft }} />
                                             </Stack>
                                          )}

                                          <Stack
                                             direction="row"
                                             spacing={0.25}
                                             sx={{
                                                position: 'absolute',
                                                left: 5,
                                                right: 5,
                                                bottom: 5,
                                                justifyContent: 'center',
                                                p: 0.25,
                                                borderRadius: 999,
                                                bgcolor: 'rgba(8,8,14,0.72)',
                                                backdropFilter: 'blur(8px)',
                                             }}
                                          >
                                             <Tooltip title="Зробити головним">
                                                <IconButton size="small" onClick={() => handleMediaImageAction(mediaProperty, image, 'setMain')} sx={{ width: 22, height: 22, color: image.isMain ? '#facc15' : '#fff' }}>
                                                   <StarRoundedIcon sx={{ fontSize: 13 }} />
                                                </IconButton>
                                             </Tooltip>
                                             <Tooltip title={image.isHidden ? 'Показати' : 'Приховати'}>
                                                <IconButton size="small" onClick={() => handleMediaImageAction(mediaProperty, image, 'setHidden', !image.isHidden)} sx={{ width: 22, height: 22, color: image.isHidden ? '#fca5a5' : '#fff' }}>
                                                   {image.isHidden ? <VisibilityRoundedIcon sx={{ fontSize: 13 }} /> : <VisibilityOffRoundedIcon sx={{ fontSize: 13 }} />}
                                                </IconButton>
                                             </Tooltip>
                                             <Tooltip title="Скачати">
                                                <IconButton size="small" onClick={() => downloadImageFile(image, `${propertyLabel(mediaProperty)}-${mediaStage}-${index + 1}`)} sx={{ width: 22, height: 22, color: '#bfdbfe' }}>
                                                   <DownloadRoundedIcon sx={{ fontSize: 13 }} />
                                                </IconButton>
                                             </Tooltip>
                                             <Tooltip title="Видалити">
                                                <IconButton size="small" onClick={() => handleDeleteMediaImage(mediaProperty, image)} sx={{ width: 22, height: 22, color: '#fb7185' }}>
                                                   <DeleteOutlineRoundedIcon sx={{ fontSize: 13 }} />
                                                </IconButton>
                                             </Tooltip>
                                          </Stack>
                                       </Box>
                                    );
                                 }) : (
                                    <Stack alignItems="center" justifyContent="center" sx={{ width: '100%', minHeight: 88, color: theme.textSoft }}>
                                       <Typography sx={{ fontWeight: 900 }}>У цій групі ще нема фото</Typography>
                                    </Stack>
                                 ))}
                              </Stack>
                           </Box>
                        </Box>
                     );
                  })()}

                  {selectedAdvertisingProperty && (() => {
                     const property = selectedAdvertisingProperty;
                     const settings = property.advertisingSettings || {};
                     const counters = property.advertisingCounters || {};
                     const priority = getPriorityMeta(settings.priority || 3);
                     const activeLinks = getActiveAdvertisingLinks(property);
                     const allLinks = property.advertisingLinks || [];
                     const rentObject = isRentProperty(property);
                     const propertyTypeText = estateTypeMap[property.type_estate] || property.type_estate || '';
                     const dealText = rentObject ? 'оренда' : (property.type_deal || '');
                     const realtorInfo = [
                        dealText,
                        propertyTypeText,
                        propertyPriceText(property),
                     ].filter(Boolean).join(' · ');
                     const totalArea = property.square_tot ?? property.square_area;
                     const areaFormula = [totalArea, property.square_liv, property.square_kit].filter((value) => value || value === 0).join('/');
                     const floorFormula = property.floor ? `${property.floor}${property.floors ? `/${property.floors}` : ''}${wallShort(property.type_walls || property.type_building)}` : '';
                     const compactTech = [
                        property.rooms ? `${property.rooms}к` : '',
                        floorFormula,
                        areaFormula,
                        balconyText(property.balconies),
                     ].filter(Boolean).join(' · ');
                     const heatingText = property.heating || property.type_heating || property.rentOptions?.heating || '';
                     const techRows = [
                        ['Адреса', property.location_text || [property.location?.city, property.location?.street, property.location?.number].filter(Boolean).join(', ')],
                        ['Будівля', property.type_building || property.type_house],
                        ['Балкони', balconyText(property.balconies)],
                        ['Опалення', heatingText],
                        ['Стіни', property.type_walls],
                        ['Призначення', property.purpose_area],
                     ].filter(([, value]) => value);
                     const advertisingTextItems = [
                        ...(settings.draftText ? [{
                           _id: 'draft-text',
                           title: 'Чорновий текст',
                           text: settings.draftText,
                           isDraftSettings: true,
                        }] : []),
                        ...(property.advertisingTexts || []),
                     ];
                     const rentActualityText = rentObject ? rentStatusLabel(property.statusRent) : '';
                     const actualityText = rentActualityText || [getActualityLabel(property.actualityGroup), property.actualityStatus].filter(Boolean).join(' · ');
                     const actualityNote = rentObject
                        ? property.rentOptions?.rentStory?.note
                        : property.actualityNote;
                     const actualityTone = rentObject
                        ? property.statusRent === 'rentRented'
                           ? '#ddd6fe'
                           : property.statusRent === 'rentPause'
                              ? '#fde68a'
                              : '#86efac'
                        : property.actualityGroup === 'inactive'
                           ? '#fca5a5'
                           : property.actualityGroup === 'paused'
                              ? '#fde68a'
                              : '#86efac';
                      const renderLinkSourceGroup = (title, sourceType, icon) => {
                         const sourceLinks = getLinksBySource(allLinks, sourceType);
                         const activeSourceLinks = sourceLinks.filter((link) => !link.closedAt && link.status !== 'archived');
                         const platformGroups = Object.entries(groupLinksByPlatform(activeSourceLinks));
                         const color = sourceType === 'ours' ? '#facc15' : sourceType === 'competitor' ? '#60a5fa' : '#fb7185';
                         return (
                           <Box sx={{ minHeight: 36, p: 0.65, borderRadius: 2, border: `1px solid ${theme.border}`, bgcolor: 'rgba(255,255,255,0.025)' }}>
                              <Stack direction="row" spacing={0.5} alignItems="center" flexWrap="wrap" useFlexGap>
                                 <Tooltip title={title}>
                                    <Box sx={{ width: 24, height: 24, borderRadius: '50%', display: 'grid', placeItems: 'center', color, bgcolor: `${color}18`, border: `1px solid ${color}44` }}>
                                       {icon}
                                    </Box>
                                 </Tooltip>
                                  {platformGroups.length ? platformGroups.map(([platform, links]) => (
                                     <Badge
                                        key={platform}
                                        badgeContent={links.length > 1 ? links.length : 0}
                                        color="primary"
                                        sx={{
                                           '& .MuiBadge-badge': {
                                              height: 14,
                                              minWidth: 14,
                                              fontSize: 9,
                                              fontWeight: 950,
                                              px: 0.35,
                                           },
                                        }}
                                     >
                                        <Chip
                                           size="small"
                                           label={platformMap[platform] || platform || 'Реклама'}
                                           onMouseEnter={(e) => openLinkGroupPopover(e.currentTarget, links, platform, allLinks, property)}
                                           onClick={(e) => {
                                              e.preventDefault();
                                              e.stopPropagation();
                                              openLinkGroupPopover(e.currentTarget, links, platform, allLinks, property);
                                           }}
                                           sx={{ height: 21, maxWidth: 120, color, bgcolor: `${color}14`, border: `1px solid ${color}44`, fontSize: 10.5, fontWeight: 950, textDecoration: 'none', cursor: 'pointer' }}
                                        />
                                     </Badge>
                                  )) : (
                                     <Typography sx={{ color: theme.textSoft, fontSize: 11, fontWeight: 800 }}>—</Typography>
                                  )}
                              </Stack>
                           </Box>
                        );
                     };

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

                           <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '0.85fr 1.05fr 0.95fr minmax(0, 2fr)' }, gap: 1, p: 1.1 }}>
                              <Box sx={{ minWidth: 0, p: 1, borderRadius: 2, border: `1px solid ${theme.border}`, bgcolor: 'rgba(251,146,60,0.045)' }}>
                                 <Typography sx={{ color: '#fdba74', fontSize: 11, fontWeight: 950, mb: 0.5 }}>Завдання</Typography>
                                 <Typography sx={{ fontSize: 13, fontWeight: 850, lineHeight: 1.35, whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}>
                                    {settings.note || 'Завдання для рекламного відділу ще не вказане'}
                                 </Typography>
                              </Box>

                              <Box sx={{ minWidth: 0, p: 1, borderRadius: 2, border: `1px solid ${theme.border}`, bgcolor: 'rgba(255,255,255,0.025)' }}>
                                 <Typography sx={{ color: theme.textSoft, fontSize: 11, fontWeight: 950, mb: 0.5 }}>Рекламна інфа</Typography>
                                 <Typography sx={{ fontWeight: 900, fontSize: 13, lineHeight: 1.35, overflowWrap: 'anywhere' }}>{realtorInfo || 'Даних ще немає'}</Typography>
                                 <Stack direction="row" spacing={0.45} flexWrap="wrap" useFlexGap sx={{ mt: 0.75 }}>
                                    <Chip size="small" icon={<PersonRoundedIcon sx={{ fontSize: '14px !important' }} />} label={employeeName(settings.assignedEmployee)} sx={{ height: 22, fontSize: 10.5, fontWeight: 850 }} />
                                    <Chip size="small" label={`Рекламна ціна ${settings.price ? formatMoney(settings.price, settings.currency || 'USD') : '-'}`} sx={{ height: 22, fontSize: 10.5, fontWeight: 850 }} />
                                    <Chip size="small" label={getAdvertisingStatusLabel(settings.status)} sx={{ height: 22, fontSize: 10.5, fontWeight: 900, ...getAdvertisingStatusSx(settings.status) }} />
                                    <Chip size="small" label={`дій ${counters.events || 0}`} sx={{ height: 22, fontSize: 10.5, fontWeight: 850 }} />
                                    <Chip size="small" label={`скан ${counters.scanners || 0}`} sx={{ height: 22, fontSize: 10.5, fontWeight: 850 }} />
                                 </Stack>
                              </Box>

                              <Box sx={{ minWidth: 0, p: 1, borderRadius: 2, border: `1px solid ${theme.border}`, bgcolor: 'rgba(255,255,255,0.025)' }}>
                                 <Typography sx={{ color: theme.textSoft, fontSize: 11, fontWeight: 950, mb: 0.5 }}>Технічка</Typography>
                                 {!!compactTech && (
                                    <Typography sx={{ color: '#f8fafc', fontSize: 13, fontWeight: 950, lineHeight: 1.18, mb: 0.45 }}>
                                       {compactTech}
                                    </Typography>
                                 )}
                                 <Stack spacing={0.12}>
                                    {techRows.slice(0, 7).map(([label, value]) => (
                                       <Typography key={label} sx={{ color: theme.textSoft, fontSize: 10.8, fontWeight: 750, lineHeight: 1.14 }}>
                                          <Box component="span" sx={{ color: theme.text, fontWeight: 950 }}>{label}: </Box>{value}
                                       </Typography>
                                    ))}
                                 </Stack>
                                 <Box sx={{ mt: 0.45, pt: 0.45, borderTop: `1px solid ${theme.border}` }}>
                                    <Typography sx={{ color: actualityTone, fontSize: 10.8, fontWeight: 950, lineHeight: 1.16, overflowWrap: 'anywhere' }}>
                                       {actualityText || 'Статус об’єкта не вказаний'}
                                    </Typography>
                                    {!!actualityNote && (
                                       <Typography sx={{ color: theme.textSoft, fontSize: 10.5, fontWeight: 750, lineHeight: 1.14, mt: 0.15, overflowWrap: 'anywhere' }}>
                                          {actualityNote}
                                       </Typography>
                                    )}
                                 </Box>
                              </Box>

                              <Box sx={{ minWidth: 0, p: 1, borderRadius: 2, border: `1px solid ${theme.border}`, bgcolor: 'rgba(255,255,255,0.025)', minHeight: 120 }}>
                                 <Typography sx={{ color: theme.textSoft, fontSize: 11, fontWeight: 950, mb: 0.5 }}>Рекламні тексти</Typography>
                                 <Stack spacing={0.5} sx={{ maxHeight: 150, overflowY: 'auto', pr: 0.4 }}>
                                    {advertisingTextItems.length ? advertisingTextItems.slice(0, 20).map((text) => {
                                       const expanded = expandedAdTextId === String(text._id || text.createdAt);
                                       const id = String(text._id || text.createdAt);
                                       return (
                                          <Box key={id} onClick={() => setExpandedAdTextId(expanded ? '' : id)} sx={{ minWidth: 0, p: 0.65, borderRadius: 1.5, border: `1px solid ${expanded ? '#fb923c66' : theme.border}`, bgcolor: expanded ? 'rgba(251,146,60,0.06)' : 'rgba(255,255,255,0.025)', cursor: 'pointer' }}>
                                             <Typography sx={{ fontSize: 11.5, fontWeight: 950, color: theme.text, whiteSpace: 'normal', overflow: 'hidden', textOverflow: 'ellipsis', overflowWrap: 'anywhere' }}>
                                                {text.title || 'Рекламний текст'}
                                             </Typography>
                                             <Typography sx={{ fontSize: 11.2, fontWeight: 750, color: theme.textSoft, lineHeight: 1.25, maxHeight: expanded ? 'none' : 42, overflow: 'hidden', whiteSpace: 'pre-wrap', textOverflow: 'ellipsis', overflowWrap: 'anywhere' }}>
                                                {text.text || text.note || 'Текст порожній'}
                                             </Typography>
                                             {expanded && !text.isDraftSettings && (
                                                <Stack direction="row" spacing={0.5} justifyContent="flex-end" sx={{ mt: 0.6 }}>
                                                   <Button size="small" startIcon={<EditRoundedIcon />} onClick={(e) => { e.stopPropagation(); openEditAdText(property, text); }} sx={{ color: '#fdba74', fontWeight: 900 }}>
                                                      Редагувати
                                                   </Button>
                                                   <Button size="small" startIcon={<DeleteOutlineRoundedIcon />} onClick={(e) => { e.stopPropagation(); handleDeleteAdText(property, text); }} sx={{ color: '#fb7185', fontWeight: 900 }}>
                                                      Видалити
                                                   </Button>
                                                </Stack>
                                             )}
                                          </Box>
                                       );
                                    }) : (
                                       <Typography sx={{ color: theme.textSoft, fontSize: 12, fontWeight: 750 }}>Рекламних текстів ще немає</Typography>
                                    )}
                                 </Stack>
                              </Box>
                           </Box>

                           <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, minmax(0, 1fr))' }, gap: 0.65, px: 1.1, pb: 1.1 }}>
                              {renderLinkSourceGroup('Наші посилання', 'ours', <Box component="span" sx={{ fontSize: 14, lineHeight: 1 }}>🐯</Box>)}
                              {renderLinkSourceGroup('Конкуренти', 'competitor', <PestControlRoundedIcon sx={{ fontSize: 15 }} />)}
                              {renderLinkSourceGroup('Власник', 'owner', <SentimentDissatisfiedRoundedIcon sx={{ fontSize: 15 }} />)}
                           </Box>
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
                      const cardLinkGroups = Object.entries(groupLinksByPlatform(getActiveAdvertisingLinks(property))).slice(0, 5);

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
                                          label={getAdvertisingStatusLabel(settings.status)}
                                          sx={{ height: 23, fontWeight: 900, ...getAdvertisingStatusSx(settings.status) }}
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

                                    {!!cardLinkGroups.length && (
                                       <Stack direction="row" spacing={0.45} flexWrap="wrap" onClick={(e) => e.stopPropagation()} sx={{ mt: 0.65 }}>
                                          {cardLinkGroups.map(([platform, links]) => {
                                             const firstLink = links[0] || {};
                                             return (
                                                <Stack
                                                   key={platform}
                                                   direction="row"
                                                   alignItems="center"
                                                   spacing={0.2}
                                                   sx={{
                                                      height: 22,
                                                      borderRadius: 999,
                                                      bgcolor: 'rgba(34,197,94,0.1)',
                                                      border: '1px solid rgba(34,197,94,0.28)',
                                                      overflow: 'hidden',
                                                   }}
                                                >
                                                   <Badge
                                                      badgeContent={links.length > 1 ? links.length : 0}
                                                      color="primary"
                                                      sx={{
                                                         '& .MuiBadge-badge': {
                                                            height: 13,
                                                            minWidth: 13,
                                                            fontSize: 8.5,
                                                            fontWeight: 950,
                                                            px: 0.25,
                                                         },
                                                      }}
                                                   >
                                                      <Chip
                                                         size="small"
                                                         label={platformMap[platform] || platform || 'Реклама'}
                                                         onMouseEnter={(e) => openLinkGroupPopover(e.currentTarget, links, platform, property.advertisingLinks || [], property)}
                                                         onClick={(e) => {
                                                            e.preventDefault();
                                                            e.stopPropagation();
                                                            openLinkGroupPopover(e.currentTarget, links, platform, property.advertisingLinks || [], property);
                                                         }}
                                                         sx={{
                                                            height: 20,
                                                            maxWidth: 86,
                                                            fontSize: 10.5,
                                                            fontWeight: 950,
                                                            color: '#d8fff0',
                                                            bgcolor: 'transparent',
                                                            textDecoration: 'none',
                                                            cursor: 'pointer',
                                                            '& .MuiChip-label': { px: 0.8 },
                                                         }}
                                                      />
                                                   </Badge>
                                                   <Tooltip title="Сканер">
                                                      <IconButton size="small" onClick={() => handleOpenActionForProperty(property, firstLink, 'scanner')} sx={{ width: 20, height: 20, color: '#fde047' }}>
                                                         <TrackChangesRoundedIcon sx={{ fontSize: 13 }} />
                                                      </IconButton>
                                                   </Tooltip>
                                                   <Tooltip title="Покращення">
                                                      <IconButton size="small" onClick={() => handleOpenActionForProperty(property, firstLink, 'updated_improved')} sx={{ width: 20, height: 20, color: '#fb923c' }}>
                                                         <AutoFixHighRoundedIcon sx={{ fontSize: 13 }} />
                                                      </IconButton>
                                                   </Tooltip>
                                                   <Tooltip title="Додати ліда">
                                                      <IconButton size="small" onClick={() => openLeadDialog({ property, link: firstLink })} sx={{ width: 20, height: 20, color: '#38bdf8' }}>
                                                         <PersonAddAlt1RoundedIcon sx={{ fontSize: 13 }} />
                                                      </IconButton>
                                                   </Tooltip>
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
                                    <Tooltip title="Додати ліда">
                                       <IconButton size="small" onClick={() => openLeadDialog({ property })} sx={{ color: '#38bdf8' }}>
                                          <PersonAddAlt1RoundedIcon fontSize="small" />
                                       </IconButton>
                                    </Tooltip>
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

               <Box
                  sx={{
                     border: `1px solid ${theme.border}`,
                     borderRadius: 2,
                     bgcolor: 'rgba(13,15,26,0.76)',
                     overflow: 'hidden',
                  }}
               >
                  <Stack direction="row" alignItems="center" spacing={1} flexWrap="wrap" useFlexGap sx={{ px: 1.2, py: 0.9 }}>
                     <PersonAddAlt1RoundedIcon sx={{ color: '#38bdf8', fontSize: 18 }} />
                     <Typography sx={{ fontWeight: 950, mr: 0.4 }}>Ліди з реклами</Typography>
                     {[
                        ['Всього', advertisingLeadStats.sale, advertisingLeadStats.total],
                        ['Сьогодні', advertisingLeadStats.todaySale, advertisingLeadStats.today],
                        ['7 днів', advertisingLeadStats.days7Sale, advertisingLeadStats.days7],
                        ['30 днів', advertisingLeadStats.days30Sale, advertisingLeadStats.days30],
                     ].map(([label, sale, total]) => (
                        <Stack
                           key={label}
                           direction="row"
                           spacing={0.5}
                           alignItems="center"
                           sx={{ height: 24, px: 0.9, borderRadius: 999, bgcolor: 'rgba(255,255,255,0.045)', border: `1px solid ${theme.border}` }}
                        >
                           <Typography sx={{ color: theme.textSoft, fontSize: 10.5, fontWeight: 900, whiteSpace: 'nowrap' }}>{label}</Typography>
                           <Typography sx={{ color: '#86efac', fontSize: 12, fontWeight: 950 }}>{sale}</Typography>
                           <Typography sx={{ color: theme.textSoft, fontSize: 12, fontWeight: 900 }}>/</Typography>
                           <Typography sx={{ color: theme.text, fontSize: 12, fontWeight: 950 }}>{total}</Typography>
                        </Stack>
                     ))}
                     {advertisingLeadsLoading && <CircularProgress size={16} sx={{ color: '#38bdf8' }} />}
                     {showAdvertisingLeadList ? (
                        <IconButton onClick={() => setShowAdvertisingLeadList(false)} sx={{ ml: 'auto', width: 36, height: 36, color: theme.textSoft, border: `1px solid ${theme.border}` }}>
                           <CloseRoundedIcon fontSize="small" />
                        </IconButton>
                     ) : (
                        <Tooltip title="Показати ліди">
                           <Box component="span" sx={{ ml: 'auto' }}>
                              <IconButton
                                 onClick={() => setShowAdvertisingLeadList(true)}
                                 disabled={!advertisingLeads.length}
                                 sx={{ width: 36, height: 36, color: '#bae6fd', border: '1px solid rgba(56,189,248,0.34)', bgcolor: 'rgba(56,189,248,0.08)', '&:hover': { bgcolor: 'rgba(56,189,248,0.15)' } }}
                              >
                                 <ListAltRoundedIcon fontSize="small" />
                              </IconButton>
                           </Box>
                        </Tooltip>
                     )}
                  </Stack>
               </Box>

               <Collapse in={showAdvertisingLeadList} timeout={260} unmountOnExit>
                  <Box
                     sx={{
                        border: `1px solid ${theme.border}`,
                        borderRadius: 2,
                        bgcolor: 'rgba(13,15,26,0.9)',
                        overflow: 'hidden',
                     }}
                  >
                     {advertisingLeads.length ? (
                        <Stack spacing={0.65} sx={{ p: 1 }}>
                           <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'minmax(220px,1fr) 150px 160px 150px 44px' }, gap: 0.8, alignItems: 'center', mb: 0.35 }}>
                              <TextField
                                 size="small"
                                 label="Пошук ліда"
                                 value={leadReportFilters.q}
                                 onChange={(e) => setLeadReportFilters((prev) => ({ ...prev, q: e.target.value }))}
                                 sx={compactFieldSx}
                              />
                              <TextField select size="small" label="Тип" value={leadReportFilters.kind} onChange={(e) => setLeadReportFilters((prev) => ({ ...prev, kind: e.target.value }))} sx={compactFieldSx}>
                                 <MenuItem value="all">Усі</MenuItem>
                                 {LEAD_KIND_OPTIONS.map(([value, label]) => <MenuItem key={value} value={value}>{label}</MenuItem>)}
                              </TextField>
                              <TextField select size="small" label="Стадія" value={leadReportFilters.stage} onChange={(e) => setLeadReportFilters((prev) => ({ ...prev, stage: e.target.value }))} sx={compactFieldSx}>
                                 <MenuItem value="all">Усі</MenuItem>
                                 {LEAD_STAGE_OPTIONS.map(([value, label]) => <MenuItem key={value} value={value}>{label}</MenuItem>)}
                              </TextField>
                              <TextField select size="small" label="Період" value={leadReportFilters.period} onChange={(e) => setLeadReportFilters((prev) => ({ ...prev, period: e.target.value }))} sx={compactFieldSx}>
                                 <MenuItem value="all">Усі</MenuItem>
                                 <MenuItem value="today">Сьогодні</MenuItem>
                                 <MenuItem value="7d">7 днів</MenuItem>
                                 <MenuItem value="30d">30 днів</MenuItem>
                              </TextField>
                              <Tooltip title="Скачати ексель">
                                 <span>
                                    <IconButton
                                       disabled={!filteredAdvertisingLeads.length}
                                       onClick={downloadFilteredLeadsExcel}
                                       sx={{ width: 40, height: 40, color: '#86efac', border: '1px solid rgba(34,197,94,0.34)', bgcolor: 'rgba(34,197,94,0.08)' }}
                                    >
                                       <FileDownloadRoundedIcon fontSize="small" />
                                    </IconButton>
                                 </span>
                              </Tooltip>
                           </Box>
                           {filteredAdvertisingLeads.map((lead) => (
                              <Box
                                 key={lead._id}
                                 sx={{
                                    borderRadius: 1.7,
                                    border: `1px solid ${theme.border}`,
                                    bgcolor: 'rgba(255,255,255,0.035)',
                                    px: 1,
                                    py: 0.8,
                                 }}
                              >
                                 <Box
                                    sx={{
                                       display: 'grid',
                                       gridTemplateColumns: { xs: '1fr', md: 'minmax(190px, 1.1fr) 110px minmax(170px, 0.9fr) minmax(220px, 1.3fr) 104px' },
                                       gap: 1,
                                       alignItems: 'center',
                                    }}
                                 >
                                    <Stack direction="row" alignItems="center" spacing={0.7} sx={{ minWidth: 0 }}>
                                       <Typography sx={{ fontWeight: 950, minWidth: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                          {lead.name}
                                       </Typography>
                                       <Chip size="small" label={leadKindLabel(lead.leadKind)} sx={{ height: 20, fontSize: 10.5, fontWeight: 900, bgcolor: lead.leadKind === 'rent' ? 'rgba(34,197,94,0.12)' : 'rgba(251,146,60,0.12)', color: lead.leadKind === 'rent' ? '#86efac' : '#fdba74' }} />
                                    </Stack>
                                    <Chip size="small" label={leadStageLabel(lead.stage)} sx={{ justifySelf: { xs: 'start', md: 'stretch' }, height: 22, fontSize: 10.5, fontWeight: 900, bgcolor: 'rgba(56,189,248,0.12)', color: '#bae6fd' }} />
                                    <Typography sx={{ color: theme.textSoft, fontSize: 11.5, fontWeight: 800, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                       {[lead.phones?.[0], leadBudgetLabel(lead), lead.actualityStatus].filter(Boolean).join(' · ')}
                                    </Typography>
                                    <Typography sx={{ color: '#fdba74', fontSize: 11.5, fontWeight: 850, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                       {[lead.sourceObject, lead.advertisingLinkTitle].filter(Boolean).join(' · ')}
                                    </Typography>
                                    <Stack direction="row" spacing={0.35} justifyContent={{ xs: 'flex-start', md: 'flex-end' }}>
                                       <Tooltip title={expandedAdvertisingLeadId === lead._id ? 'Згорнути' : 'Розгорнути'}>
                                          <IconButton
                                             onClick={() => setExpandedAdvertisingLeadId((prev) => prev === lead._id ? '' : lead._id)}
                                             sx={{ width: 30, height: 30, color: theme.textSoft, border: `1px solid ${theme.border}` }}
                                          >
                                             {expandedAdvertisingLeadId === lead._id ? <KeyboardArrowUpRoundedIcon sx={{ fontSize: 20 }} /> : <KeyboardArrowDownRoundedIcon sx={{ fontSize: 20 }} />}
                                          </IconButton>
                                       </Tooltip>
                                       <Tooltip title="Редагувати">
                                          <IconButton onClick={() => openEditLeadDialog(lead)} sx={{ width: 30, height: 30, color: theme.text, border: `1px solid ${theme.border}` }}>
                                             <EditRoundedIcon sx={{ fontSize: 17 }} />
                                          </IconButton>
                                       </Tooltip>
                                       <Tooltip title="Видалити">
                                          <IconButton onClick={() => setDeleteLead(lead)} sx={{ width: 30, height: 30, color: '#ef4444', border: '1px solid rgba(239,68,68,0.35)' }}>
                                             <DeleteOutlineRoundedIcon sx={{ fontSize: 17 }} />
                                          </IconButton>
                                       </Tooltip>
                                    </Stack>
                                 </Box>
                                 {expandedAdvertisingLeadId === lead._id && (
                                    <Box sx={{ mt: 0.8, pt: 0.8, borderTop: `1px solid ${theme.border}` }}>
                                       <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(4, minmax(0, 1fr))' }, gap: 0.8 }}>
                                          {[
                                             ['Хто вніс', employeeName(lead.createdByEmployee)],
                                             ['Відповідальний', employeeName(lead.assignee)],
                                             ['Канал', lead.sourceChannel || '—'],
                                             ['Поява', formatDateTime(lead.leadAppearedAt || lead.createdAt)],
                                          ].map(([label, value]) => (
                                             <Box key={label} sx={{ p: 0.8, borderRadius: 1.4, bgcolor: 'rgba(255,255,255,0.03)', border: `1px solid ${theme.border}` }}>
                                                <Typography sx={{ color: theme.textSoft, fontSize: 10.5, fontWeight: 800 }}>{label}</Typography>
                                                <Typography sx={{ mt: 0.15, fontSize: 12, fontWeight: 900, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{value || '—'}</Typography>
                                             </Box>
                                          ))}
                                       </Box>
                                       {!!lead.requestSummary && (
                                          <Typography sx={{ mt: 0.8, color: theme.text, fontSize: 12, fontWeight: 800 }}>
                                             {lead.requestSummary}
                                          </Typography>
                                       )}
                                       <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 0.8, mt: 0.8 }}>
                                          <Box sx={{ p: 0.8, borderRadius: 1.4, bgcolor: 'rgba(56,189,248,0.06)', border: `1px solid ${theme.border}` }}>
                                             <Typography sx={{ color: '#bae6fd', fontSize: 11, fontWeight: 950 }}>Нотатки</Typography>
                                             {(lead.notes || []).length ? (lead.notes || []).slice(0, 4).map((note, index) => (
                                                <Typography key={`${note.createdAt || index}-note`} sx={{ mt: 0.35, color: theme.textSoft, fontSize: 11.5, fontWeight: 750 }}>
                                                   {note.text}
                                                </Typography>
                                             )) : (
                                                <Typography sx={{ mt: 0.35, color: theme.textSoft, fontSize: 11.5, fontWeight: 750 }}>Нотаток ще немає</Typography>
                                             )}
                                          </Box>
                                          <Box sx={{ p: 0.8, borderRadius: 1.4, bgcolor: 'rgba(251,146,60,0.06)', border: `1px solid ${theme.border}` }}>
                                             <Typography sx={{ color: '#fdba74', fontSize: 11, fontWeight: 950 }}>Історія</Typography>
                                             {(lead.history || []).length ? (lead.history || []).slice(0, 4).map((item, index) => (
                                                <Typography key={`${item.createdAt || index}-history`} sx={{ mt: 0.35, color: theme.textSoft, fontSize: 11.5, fontWeight: 750 }}>
                                                   {[item.note || item.type, item.toStage ? leadStageLabel(item.toStage) : '', item.createdAt ? formatDateTime(item.createdAt) : ''].filter(Boolean).join(' · ')}
                                                </Typography>
                                             )) : (
                                                <Typography sx={{ mt: 0.35, color: theme.textSoft, fontSize: 11.5, fontWeight: 750 }}>Історії роботи ще немає</Typography>
                                             )}
                                          </Box>
                                       </Box>
                                    </Box>
                                 )}
                              </Box>
                           ))}
                           {!filteredAdvertisingLeads.length && (
                              <Typography sx={{ px: 1.2, py: 2, color: theme.textSoft, fontWeight: 800, textAlign: 'center' }}>
                                 Лідів за цими фільтрами немає
                              </Typography>
                           )}
                        </Stack>
                     ) : (
                        <Typography sx={{ px: 1.2, py: 1, color: theme.textSoft, fontWeight: 800 }}>
                           Рекламних лідів ще немає
                        </Typography>
                     )}
                  </Box>
               </Collapse>

               {!showAdvertisingLeadList && (
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
                           label="Дата і час дії"
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
                        {!requiresExistingLink ? (
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
                           ) : creatingAdLink ? (
                              <>
                                 <TextField
                                    size="small"
                                    placeholder="Назва ссилки"
                                    value={form.linkTitle}
                                    onChange={(e) => handleFormChange('linkTitle', e.target.value)}
                                    sx={{ ...metricFieldSx, gridColumn: { xs: 'auto', md: '1 / 4' } }}
                                 />
                                 <TextField
                                    size="small"
                                    placeholder="URL"
                                    value={form.linkUrl}
                                    onChange={(e) => handleFormChange('linkUrl', e.target.value)}
                                    sx={{ ...metricFieldSx, gridColumn: { xs: 'auto', md: '4 / -1' } }}
                                    InputProps={{
                                       startAdornment: (
                                          <InputAdornment position="start">
                                             <LinkRoundedIcon sx={{ fontSize: 12, color: theme.textSoft }} />
                                          </InputAdornment>
                                       ),
                                    }}
                                 />
                              </>
                           ) : isStandaloneWorkAction(form.actionType) ? (
                              <>
                                 <TextField
                                    size="small"
                                    placeholder={form.actionType === 'video_processing' ? 'Назва відео' : 'Назва матеріалу'}
                                    value={form.linkTitle}
                                    onChange={(e) => handleFormChange('linkTitle', e.target.value)}
                                    sx={{ ...metricFieldSx, gridColumn: { xs: 'auto', md: '1 / 4' } }}
                                 />
                                 <TextField
                                    size="small"
                                    placeholder="URL"
                                    value={form.linkUrl}
                                    onChange={(e) => handleFormChange('linkUrl', e.target.value)}
                                    sx={{ ...metricFieldSx, gridColumn: { xs: 'auto', md: '4 / -1' } }}
                                    InputProps={{
                                       startAdornment: (
                                          <InputAdornment position="start">
                                             <LinkRoundedIcon sx={{ fontSize: 12, color: theme.textSoft }} />
                                          </InputAdornment>
                                       ),
                                    }}
                                 />
                              </>
                           ) : (
                              null
                           )}
                           <TextField
                              size="small"
                              placeholder="Примітка"
                              value={form.note}
                              onChange={(e) => handleFormChange('note', e.target.value)}
                              sx={{
                                 ...compactFieldSx,
                                 gridColumn: { xs: 'auto', md: creatingAdLink ? '1 / 4' : '1 / -1' },
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
                           {creatingAdLink && (
                              <TextField
                                 size="small"
                                 label="Дата і час ссилки"
                                 type="datetime-local"
                                 value={form.linkCreatedAt}
                                 onChange={(e) => handleFormChange('linkCreatedAt', e.target.value)}
                                 sx={{
                                    ...metricFieldSx,
                                    gridColumn: { xs: 'auto', md: '4 / -1' },
                                    '& .MuiInputBase-input': {
                                       ...metricFieldSx['& .MuiInputBase-input'],
                                       fontSize: 10.5,
                                       px: 0.6,
                                    },
                                 }}
                                 InputLabelProps={{ shrink: true }}
                              />
                           )}
                        </Box>
                        <Box sx={{ display: { xs: 'none', md: 'block' }, gridColumn: '11 / 12' }} />
                        <Stack direction="row" spacing={0.55} alignItems="center" justifyContent="flex-end">
                           <Tooltip title="Додати ліда">
                              <IconButton
                                 disabled={leadSaving}
                                 onClick={() => openLeadDialog()}
                                 sx={{
                                    width: 44,
                                    height: 44,
                                    borderRadius: 1.8,
                                    color: '#06121f',
                                    bgcolor: '#38bdf8',
                                    border: '1px solid rgba(56,189,248,0.65)',
                                    '&:hover': { bgcolor: '#7dd3fc' },
                                 }}
                              >
                                 <PersonAddAlt1RoundedIcon />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Додати дію">
                               <span>
                                 <IconButton
                                    disabled={saving || !form.property || (requiresExistingLink && !form.advertisingLinkId)}
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
                           label="Дата дії"
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
                           border: `1px solid ${theme.border}`,
                           borderRadius: 1.6,
                           bgcolor: mode === 'light' ? 'rgba(255,255,255,0.88)' : 'rgba(13,15,26,0.82)',
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
                           {!actionHasMetrics(event.actionType) ? (
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
               )}
            </Stack>

            {false && mediaProperty && (() => {
               const stageImages = mediaStageImages(mediaProperty, mediaStage);
               const stageCounts = PHOTO_STAGES.reduce((acc, stage) => {
                  acc[stage.value] = mediaStageImages(mediaProperty, stage.value).length;
                  return acc;
               }, {});
               const activeStageLabel = PHOTO_STAGES.find((stage) => stage.value === mediaStage)?.label || 'Фото';
               const visibleStageLabel = isVideoStage ? '\u0412\u0456\u0434\u0435\u043e' : activeStageLabel;

               return (
                  <Box
                     sx={{
                        position: 'fixed',
                        left: { xs: 8, md: 112 },
                        right: { xs: 8, md: 18 },
                        bottom: 14,
                        zIndex: 40,
                        borderRadius: 3,
                        border: `1px solid ${theme.border}`,
                        bgcolor: mode === 'light' ? 'rgba(255,255,255,0.96)' : 'rgba(9,9,18,0.96)',
                        boxShadow: '0 24px 80px rgba(0,0,0,0.45)',
                        backdropFilter: 'blur(18px)',
                        overflow: 'hidden',
                     }}
                  >
                     <input
                        ref={mediaUploadInputRef}
                        type="file"
                        accept="image/*,.heic,.heif"
                        multiple
                        hidden
                        onChange={(event) => uploadMediaFiles(mediaProperty, mediaStage, event.target.files)}
                     />

                     <Stack
                        direction={{ xs: 'column', md: 'row' }}
                        spacing={1}
                        alignItems={{ xs: 'stretch', md: 'center' }}
                        sx={{ px: 1.1, py: 0.85, borderBottom: `1px solid ${theme.border}` }}
                     >
                        <Stack direction="row" spacing={0.75} alignItems="center" sx={{ minWidth: 0, flex: 1 }}>
                           <ImageRoundedIcon sx={{ color: '#38bdf8' }} />
                           <Box sx={{ minWidth: 0 }}>
                              <Typography sx={{ fontWeight: 950, lineHeight: 1.1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                 Медіа · {propertyLabel(mediaProperty)}
                              </Typography>
                              <Typography sx={{ color: theme.textSoft, fontSize: 11, fontWeight: 800 }}>
                                 {visibleStageLabel}: {isVideoStage ? `${videoItems.length} \u0432\u0456\u0434\u0435\u043e` : `${stageImages.length} \u0444\u043e\u0442\u043e`}
                              </Typography>
                           </Box>
                        </Stack>

                        <Stack direction="row" spacing={0.6} flexWrap="wrap" useFlexGap>
                           {PHOTO_STAGES.map((stage) => {
                              const active = mediaStage === stage.value;
                              return (
                                 <Button
                                    key={stage.value}
                                    size="small"
                                    onClick={() => setMediaStage(stage.value)}
                                    sx={{
                                       borderRadius: 999,
                                       minHeight: 28,
                                       px: 1.2,
                                       color: active ? '#0b0b12' : theme.text,
                                       bgcolor: active ? '#38bdf8' : 'rgba(255,255,255,0.045)',
                                       border: `1px solid ${active ? '#38bdf8' : theme.border}`,
                                       fontWeight: 950,
                                       '&:hover': {
                                          bgcolor: active ? '#0ea5e9' : 'rgba(255,255,255,0.08)',
                                       },
                                    }}
                                 >
                                    {stage.label} {stageCounts[stage.value] || 0}
                                 </Button>
                              );
                           })}
                        </Stack>

                        <Stack direction="row" spacing={0.6} justifyContent={{ xs: 'flex-start', md: 'flex-end' }}>
                           <Button
                              size="small"
                              startIcon={<DownloadRoundedIcon />}
                              disabled={isVideoStage || !stageImages.length || mediaUploading}
                              onClick={() => downloadMediaStage(mediaProperty, mediaStage)}
                              sx={{ color: '#bfdbfe', borderRadius: 999, fontWeight: 950, border: `1px solid ${theme.border}` }}
                           >
                              Скачати
                           </Button>
                           <Button
                              size="small"
                              startIcon={isVideoStage ? <OndemandVideoRoundedIcon /> : <CloudUploadRoundedIcon />}
                              disabled={mediaUploading}
                              onClick={() => isVideoStage ? handleOpenVideoActionForProperty(mediaProperty) : mediaUploadInputRef.current?.click()}
                              sx={{ color: '#fed7aa', borderRadius: 999, fontWeight: 950, border: '1px solid rgba(251,146,60,0.35)' }}
                           >
                              {mediaUploading ? 'Завантажую...' : `+ ${visibleStageLabel}`}
                           </Button>
                           <Tooltip title="Закрити медіа">
                              <IconButton size="small" onClick={() => setMediaPropertyId('')} sx={{ color: theme.textSoft, border: `1px solid ${theme.border}` }}>
                                 <CloseRoundedIcon fontSize="small" />
                              </IconButton>
                           </Tooltip>
                        </Stack>
                     </Stack>

                     {!!mediaError && (
                        <Typography sx={{ px: 1.2, pt: 0.75, color: '#fb7185', fontSize: 12, fontWeight: 850 }}>
                           {mediaError}
                        </Typography>
                     )}

                     <Box sx={{ px: 1.1, py: 0.9, overflowX: 'auto' }}>
                        <Stack direction="row" spacing={0.75} sx={{ minHeight: 88 }}>
                           {stageImages.length ? stageImages.map((image, index) => {
                              const url = getImageStageUrl(image);
                              return (
                                 <Box
                                    key={image._id || image.public_id || `${mediaStage}-${index}`}
                                    component={url ? 'a' : 'div'}
                                    href={url || undefined}
                                    target={url ? '_blank' : undefined}
                                    rel={url ? 'noreferrer' : undefined}
                                    sx={{
                                       width: 104,
                                       height: 78,
                                       flex: '0 0 104px',
                                       borderRadius: 2,
                                       overflow: 'hidden',
                                       border: `1px solid ${theme.border}`,
                                       bgcolor: 'rgba(255,255,255,0.045)',
                                       display: 'grid',
                                       placeItems: 'center',
                                       textDecoration: 'none',
                                    }}
                                 >
                                    {url ? (
                                       <Box component="img" src={url} alt="" sx={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                                    ) : (
                                       <ImageRoundedIcon sx={{ color: theme.textSoft }} />
                                    )}
                                 </Box>
                              );
                           }) : (
                              <Stack alignItems="center" justifyContent="center" sx={{ width: '100%', minHeight: 78, color: theme.textSoft }}>
                                 <Typography sx={{ fontWeight: 900 }}>У цій групі ще нема фото</Typography>
                              </Stack>
                           )}
                        </Stack>
                     </Box>
                  </Box>
               );
            })()}

            <Dialog open={Boolean(editingAdText)} onClose={closeEditAdText} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3, bgcolor: theme.bgPanel, color: theme.text, border: `1px solid ${theme.border}` } }}>
               <DialogTitle sx={{ fontWeight: 950 }}>Редагувати рекламний текст</DialogTitle>
               <DialogContent>
                  <Stack spacing={1.4} sx={{ pt: 1 }}>
                     <TextField label="Назва" value={adTextForm.title} onChange={(e) => setAdTextForm((prev) => ({ ...prev, title: e.target.value }))} sx={fieldSx} />
                     <TextField label="Текст" multiline minRows={5} value={adTextForm.text} onChange={(e) => setAdTextForm((prev) => ({ ...prev, text: e.target.value }))} sx={fieldSx} />
                     <TextField label="Нотатка" multiline minRows={2} value={adTextForm.note} onChange={(e) => setAdTextForm((prev) => ({ ...prev, note: e.target.value }))} sx={fieldSx} />
                  </Stack>
               </DialogContent>
               <DialogActions sx={{ px: 3, pb: 2.5 }}>
                  <Button onClick={closeEditAdText} sx={{ color: theme.textSoft, fontWeight: 900 }}>Скасувати</Button>
                  <Button onClick={handleSaveAdText} disabled={saving} variant="contained" startIcon={<EditRoundedIcon />} sx={{ borderRadius: 999, fontWeight: 950 }}>
                     {saving ? 'Зберігаю...' : 'Зберегти'}
                  </Button>
               </DialogActions>
            </Dialog>

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
                        <TextField label="Дата і час дії" type="datetime-local" value={form.occurredAt} onChange={(e) => handleFormTimeChange(e.target.value)} sx={{ ...fieldSx, flex: 1 }} InputLabelProps={{ shrink: true }} />
                     </Stack>

                     <Divider sx={{ borderColor: theme.border }} />

                     {(creatingAdLink || requiresExistingLink) && (
                        <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.2}>
                           <TextField select label="Посилання" value={form.linkMode} onChange={(e) => handleFormChange('linkMode', e.target.value)} disabled={isLinkSourceAction(form.actionType)} sx={{ ...fieldSx, flex: 0.8 }}>
                              <MenuItem value="existing">З об’єкта</MenuItem>
                              <MenuItem value="new">Нове</MenuItem>
                           </TextField>
                           {requiresExistingLink && form.linkMode === 'existing' ? (
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
                                 <TextField select label="Тип" value={sourceTypeForAction(form.actionType, form.sourceType)} onChange={(e) => handleFormChange('sourceType', e.target.value)} disabled={isLinkSourceAction(form.actionType)} sx={{ ...fieldSx, flex: 0.8 }}>
                                    {SOURCE_OPTIONS.map(([value, label]) => <MenuItem key={value} value={value}>{label}</MenuItem>)}
                                 </TextField>
                              </>
                           )}
                        </Stack>
                     )}

                     {isStandaloneWorkAction(form.actionType) && (
                        <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.2}>
                           <TextField
                              label={form.actionType === 'video_processing' ? 'Назва відео' : 'Назва матеріалу'}
                              value={form.linkTitle}
                              onChange={(e) => handleFormChange('linkTitle', e.target.value)}
                              sx={{ ...fieldSx, flex: 1 }}
                           />
                           <TextField
                              label="URL"
                              value={form.linkUrl}
                              onChange={(e) => handleFormChange('linkUrl', e.target.value)}
                              sx={{ ...fieldSx, flex: 1.5 }}
                              InputProps={{ startAdornment: <LinkRoundedIcon sx={{ mr: 1, color: theme.textSoft }} /> }}
                           />
                        </Stack>
                     )}

                     {(creatingAdLink || form.linkMode === 'new') && (
                        <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.2}>
                           <TextField label="Назва посилання" value={form.linkTitle} onChange={(e) => handleFormChange('linkTitle', e.target.value)} sx={{ ...fieldSx, flex: 1.2 }} />
                           <TextField label="Дата і час ссилки" type="datetime-local" value={form.linkCreatedAt} onChange={(e) => handleFormChange('linkCreatedAt', e.target.value)} sx={{ ...fieldSx, flex: 1 }} InputLabelProps={{ shrink: true }} />
                        </Stack>
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
                  <Button disabled={saving || !form.property || (requiresExistingLink && !form.advertisingLinkId)} onClick={handleSubmit} variant="contained" startIcon={<AddRoundedIcon />} sx={{ borderRadius: 999, fontWeight: 950 }}>
                     {saving ? 'Зберігаю...' : (editingEvent ? 'Зберегти' : 'Додати')}
                  </Button>
               </DialogActions>
            </Dialog>

            <Dialog open={leadDialogOpen} onClose={closeLeadDialog} maxWidth="md" fullWidth PaperProps={{ sx: { borderRadius: 3, bgcolor: theme.bgPanel, color: theme.text, border: `1px solid ${theme.border}` } }}>
               <DialogTitle sx={{ fontWeight: 950 }}>{editingLead ? 'Редагувати ліда' : 'Додати ліда'}</DialogTitle>
               <DialogContent>
                  <Stack spacing={1.5} sx={{ pt: 1 }}>
                     {leadError && <Alert severity="error" sx={{ borderRadius: 2 }}>{leadError}</Alert>}
                     {(leadForm.sourceObject || leadForm.advertisingLinkTitle) && (
                        <Box sx={{ p: 1.2, borderRadius: 2, border: `1px solid ${theme.border}`, bgcolor: 'rgba(56,189,248,0.08)' }}>
                           <Typography sx={{ color: '#bae6fd', fontSize: 12, fontWeight: 900 }}>Джерело ліда</Typography>
                           <Typography sx={{ fontWeight: 950, mt: 0.3 }}>{leadForm.sourceObject || 'Без об’єкта'}</Typography>
                           {!!leadForm.advertisingLinkTitle && (
                              <Typography sx={{ color: theme.textSoft, fontSize: 13, fontWeight: 800, mt: 0.2 }}>
                                 {leadForm.advertisingLinkTitle}{leadForm.advertisingLinkUrl ? ` · ${leadForm.advertisingLinkUrl}` : ''}
                              </Typography>
                           )}
                        </Box>
                     )}

                     <Autocomplete
                        options={propertyLookupOptions}
                        value={selectedLeadProperty}
                        onChange={(_, value) => handleSelectLeadProperty(value)}
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
                                 {[isRentProperty(option) ? 'Оренда' : 'Продаж', option.location_text, propertyPriceText(option), option.assignee?.name].filter(Boolean).join(' · ')}
                              </Typography>
                           </Box>
                        )}
                        renderInput={(params) => (
                           <TextField
                              {...params}
                              label="Об’єкт, що примагнітив"
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
                        PaperComponent={(props) => <Box {...props} sx={{ minWidth: { xs: 320, sm: 620 }, bgcolor: theme.bgPanel, color: theme.text, border: `1px solid ${theme.border}` }} />}
                        ListboxProps={{ sx: { maxHeight: 360 } }}
                     />

                     <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.2}>
                        <TextField label="Ім’я" value={leadForm.name} onChange={(e) => handleLeadFormChange('name', e.target.value)} sx={{ ...fieldSx, flex: 1.4 }} />
                        <TextField select label="Тип ліда" value={leadForm.leadKind} onChange={(e) => handleLeadFormChange('leadKind', e.target.value)} sx={{ ...fieldSx, flex: 0.8 }}>
                           {LEAD_KIND_OPTIONS.map(([value, label]) => <MenuItem key={value} value={value}>{label}</MenuItem>)}
                        </TextField>
                        <TextField select label="Стадія" value={leadForm.stage} onChange={(e) => handleLeadFormChange('stage', e.target.value)} sx={{ ...fieldSx, flex: 1 }}>
                           {LEAD_STAGE_OPTIONS.map(([value, label]) => <MenuItem key={value} value={value}>{label}</MenuItem>)}
                        </TextField>
                        <TextField
                           label={leadForm.leadKind === 'rent' ? 'Бюджет max' : 'Бюджет max $'}
                           type="number"
                           value={leadForm.budgetMax}
                           onChange={(e) => handleLeadFormChange('budgetMax', e.target.value)}
                           sx={{
                              ...fieldSx,
                              flex: 0.9,
                              '& input[type=number]': { MozAppearance: 'textfield' },
                              '& input[type=number]::-webkit-outer-spin-button, & input[type=number]::-webkit-inner-spin-button': { WebkitAppearance: 'none', margin: 0 },
                           }}
                        />
                        {leadForm.leadKind === 'rent' && (
                           <TextField select label="Валюта" value={leadForm.budgetCurrency} onChange={(e) => handleLeadFormChange('budgetCurrency', e.target.value)} sx={{ ...fieldSx, flex: 0.75 }}>
                              {LEAD_BUDGET_CURRENCIES.map(([value, label]) => <MenuItem key={value} value={value}>{label}</MenuItem>)}
                           </TextField>
                        )}
                     </Stack>

                     <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.2}>
                        <TextField label="Телефон" value={leadForm.phones} onChange={(e) => handleLeadFormChange('phones', e.target.value)} sx={{ ...fieldSx, flex: 1 }} />
                        <TextField label="Email" value={leadForm.emails} onChange={(e) => handleLeadFormChange('emails', e.target.value)} sx={{ ...fieldSx, flex: 1 }} />
                        <TextField label="Канал" value={leadForm.sourceChannel} onChange={(e) => handleLeadFormChange('sourceChannel', e.target.value)} sx={{ ...fieldSx, flex: 0.9 }} />
                     </Stack>

                     <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.2}>
                        <TextField label="Заявка / деталі пошуку" multiline minRows={4} value={leadForm.requestSummary} onChange={(e) => handleLeadFormChange('requestSummary', e.target.value)} sx={{ ...fieldSx, flex: 1.4 }} />
                        <Stack spacing={1.2} sx={{ flex: 1 }}>
                           <TextField select label="Актуальність" value={leadForm.actualityStatus} onChange={(e) => handleLeadFormChange('actualityStatus', e.target.value)} sx={fieldSx}>
                              {[...new Set([...LEAD_ACTUALITY_OPTIONS.slice(0, 2), 'Актуальний. Переписка', ...LEAD_ACTUALITY_OPTIONS.slice(2)])].map((value) => <MenuItem key={value} value={value}>{value}</MenuItem>)}
                           </TextField>
                           <TextField select label="Відповідальний" value={leadForm.assignee} onChange={(e) => handleLeadFormChange('assignee', e.target.value)} sx={fieldSx}>
                              <MenuItem value="">Не вибрано</MenuItem>
                              {employees.map((employee) => <MenuItem key={employee._id} value={employee._id}>{employeeName(employee)}</MenuItem>)}
                           </TextField>
                           <TextField label="Нотатка до джерела" value={leadForm.sourceNote} onChange={(e) => handleLeadFormChange('sourceNote', e.target.value)} sx={fieldSx} />
                        </Stack>
                     </Stack>

                     <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.2}>
                        <TextField label="Початкова нотатка" value={leadForm.initialNoteText} onChange={(e) => handleLeadFormChange('initialNoteText', e.target.value)} sx={{ ...fieldSx, flex: 1.5 }} />
                        <TextField select label="Тип" value={leadForm.initialNoteType} onChange={(e) => handleLeadFormChange('initialNoteType', e.target.value)} sx={{ ...fieldSx, flex: 0.7 }}>
                           {LEAD_NOTE_TYPES.map(([value, label]) => <MenuItem key={value} value={value}>{label}</MenuItem>)}
                        </TextField>
                     </Stack>
                  </Stack>
               </DialogContent>
               <DialogActions sx={{ px: 3, pb: 2.5 }}>
                  <Button onClick={closeLeadDialog} sx={{ color: theme.textSoft, fontWeight: 900 }}>Скасувати</Button>
                  <Button onClick={handleSubmitLead} disabled={leadSaving} variant="contained" startIcon={<PersonAddAlt1RoundedIcon />} sx={{ borderRadius: 999, fontWeight: 950, bgcolor: '#38bdf8', color: '#06121f', '&:hover': { bgcolor: '#7dd3fc' } }}>
                     {leadSaving ? 'Зберігаю...' : (editingLead ? 'Зберегти ліда' : 'Створити ліда')}
                  </Button>
               </DialogActions>
            </Dialog>

            <Dialog open={!!deleteLead} onClose={() => setDeleteLead(null)} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 3, bgcolor: theme.bgPanel, color: theme.text, border: `1px solid ${theme.border}` } }}>
               <DialogTitle sx={{ fontWeight: 950 }}>Видалити ліда?</DialogTitle>
               <DialogContent>
                  <Typography sx={{ color: theme.textSoft, fontWeight: 750 }}>
                     Лід зникне зі списку рекламного кабінету, але залишиться в архіві бази.
                  </Typography>
                  {deleteLead && (
                     <Box sx={{ mt: 1.5, p: 1.2, borderRadius: 2, bgcolor: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.28)' }}>
                        <Typography sx={{ fontWeight: 950 }}>{deleteLead.name}</Typography>
                        <Typography sx={{ color: theme.textSoft, fontSize: 13 }}>{[deleteLead.phones?.[0], deleteLead.sourceObject].filter(Boolean).join(' · ')}</Typography>
                     </Box>
                  )}
               </DialogContent>
               <DialogActions sx={{ px: 3, pb: 2.5 }}>
                  <Button onClick={() => setDeleteLead(null)} sx={{ color: theme.textSoft, fontWeight: 900 }}>Скасувати</Button>
                  <Button onClick={handleDeleteLead} disabled={leadSaving} variant="contained" color="error" startIcon={<DeleteOutlineRoundedIcon />} sx={{ borderRadius: 999, fontWeight: 950 }}>
                     {leadSaving ? 'Видаляю...' : 'Видалити'}
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

