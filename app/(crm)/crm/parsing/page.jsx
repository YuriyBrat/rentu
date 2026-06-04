'use client';

import { useEffect, useMemo, useState } from 'react';
import {
   Alert,
   Box,
   Button,
   Chip,
   Divider,
   Dialog,
   DialogActions,
   DialogContent,
   DialogTitle,
   Drawer,
   IconButton,
   MenuItem,
   Stack,
   TextField,
   Tooltip,
   Typography,
} from '@mui/material';

import AddRoundedIcon from '@mui/icons-material/AddRounded';
import CallRoundedIcon from '@mui/icons-material/CallRounded';
import CloudDownloadRoundedIcon from '@mui/icons-material/CloudDownloadRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import DoneAllRoundedIcon from '@mui/icons-material/DoneAllRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import HelpOutlineRoundedIcon from '@mui/icons-material/HelpOutlineRounded';
import HomeWorkRoundedIcon from '@mui/icons-material/HomeWorkRounded';
import PestControlRoundedIcon from '@mui/icons-material/PestControlRounded';
import PersonRoundedIcon from '@mui/icons-material/PersonRounded';
import PhoneDisabledRoundedIcon from '@mui/icons-material/PhoneDisabledRounded';
import RestartAltRoundedIcon from '@mui/icons-material/RestartAltRounded';
import TuneRoundedIcon from '@mui/icons-material/TuneRounded';
import UploadFileRoundedIcon from '@mui/icons-material/UploadFileRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';

import { useCRMTheme } from '@/app/(crm)/crm/context/CRMThemeContext';
import CommunicationDialog, { EMPTY_COMMUNICATION_FORM } from '@/crm_components/communications/CommunicationDialog';
import CommunicationTimeline from '@/crm_components/communications/CommunicationTimeline';
import ParsingRowCard, { STAGE_META } from './ParsingRowCard';
import ParsingStatusDialog, { buildInitialStatusForm } from './ParsingStatusDialog';

const DEMO_ITEMS = [
   {
      _id: 'demo-1',
      source: 'olx',
      sourceUrl: 'https://www.olx.ua/',
      importedAt: new Date().toISOString(),
      stage: 'raw',
      title: '2-кімнатна квартира біля парку',
      location_text: 'Львів, Франківський район',
      rooms: 2,
      square_tot: 58,
      floor: 4,
      floors: 9,
      cost: 78500,
      currency: 'USD',
      phone: '+380671112233',
      leadname: 'Власник',
      reviewStatus: 'owner',
      attrs: { phoneCount: 1, contactType: 'owner' },
      phoneCount: 1,
      phoneIntel: {
         total: 1,
         parsingCount: 1,
         objectsCount: 0,
         suggestedKind: 'owner',
         confidence: 'medium',
         relatedParsing: [],
         relatedObjects: [],
      },
      description: 'Сире оголошення з парсингу. Треба перевірити власника, актуальність ціни і фото.',
      images: ['/krm/logo-krm.png'],
   },
   {
      _id: 'demo-2',
      source: 'telegram',
      importedAt: new Date(Date.now() - 3600 * 1000).toISOString(),
      stage: 'raw',
      title: 'Оренда комерції, фасад',
      location_text: 'Львів, вул. Городоцька',
      square_tot: 96,
      floor: 1,
      cost: 1100,
      currency: 'USD',
      phone: '+380931234567',
      reviewStatus: 'realtor',
      attrs: { phoneCount: 4, contactType: 'realtor' },
      phoneCount: 4,
      phoneIntel: {
         total: 4,
         parsingCount: 3,
         objectsCount: 1,
         suggestedKind: 'realtor',
         confidence: 'high',
         relatedParsing: [],
         relatedObjects: [],
      },
      description: 'Оператор взяв у роботу. Перевіряємо чи це власник і чи не дубль нашого обʼєкта.',
      images: ['/krm/logo-krm.png'],
   },
];

const STAGE_OPTIONS = [
   ['all', 'Усі'],
   ['raw', 'Нові'],
   ['duplicate', 'Дублі'],
   ['fake', 'Фейки'],
   ['qualified', 'БАЗА'],
   ['moved', 'Обʼєкти'],
];

const COMMUNICATION_FILTER_OPTIONS = [
   ['stale3', '+3'],
];

const CONTACT_KIND_OPTIONS = [
   ['owner', 'Власник'],
   ['realtor', 'Маклер'],
   ['suspected_realtor', 'Ймов. маклер'],
   ['unknown', 'Невідомо'],
];

const SOURCE_STATUS_OPTIONS = [
   ['unknown', 'Невідомо'],
   ['active', 'Активна'],
   ['inactive', 'Неактивна'],
   ['removed', 'Знята'],
   ['error', 'Помилка'],
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

const QUALITY_FILTER_OPTIONS = [
   ['phone', 'Є телефон'],
   ['price', 'Є ціна'],
   ['address', 'Є адреса'],
   ['link', 'Є посилання'],
   ['photo', 'Є фото'],
];

const DIMRIA_CITY_OPTIONS = [
   { label: 'Львів', state_id: '5', city_id: '5' },
   { label: 'Київ', state_id: '10', city_id: '10' },
];

const DIMRIA_REALTY_OPTIONS = [
   { label: 'Квартира', value: 'apartment', category: '1', realty_type: '2' },
   { label: 'Будинок', value: 'house', category: '4', realty_type: '5' },
];

const DIMRIA_CONTACT_OPTIONS = [
   { label: 'Власник', value: 'owner', params: { 'characteristic[1437]': '1436' } },
   { label: 'Усі', value: 'all', params: {} },
];

const DIMRIA_DEFAULT_FORM = {
   city: 'Львів',
   state_id: '5',
   city_id: '5',
   realty: 'apartment',
   category: '1',
   realty_type: '2',
   operation_type: '1',
   secondary: '1',
   contactType: 'owner',
   limit: '1',
};

function normalizeStageKey(stage) {
   if (stage === 'processing' || stage === 'called') return 'raw';
   if (stage === 'rejected') return 'fake';
   return stage || 'raw';
}

const EMPTY_MANUAL_FORM = {
   source: 'olx',
   sourceId: '',
   sourceUrl: '',
   sourceStatus: 'unknown',
   sourcePublishedAt: '',
   sourceAddedAt: '',
   sourceUpdatedAt: '',
   sourcePriceChangedAt: '',
   contactType: 'unknown',
   verifiedAddressText: '',
   infoVerified: 'unchecked',
   inspectionLoyalty: 'unknown',
   bottomPrice: '',
   interestLevel: '',
   urgencyLevel: '',
   cooperationWarmth: '',
   callCenterNote: '',
   type_estate: '',
   type_deal: '',
   title: '',
   location_text: '',
   rooms: '',
   square_tot: '',
   floor: '',
   floors: '',
   cost: '',
   currency: 'USD',
   phone: '',
   leadname: '',
   email: '',
   description: '',
};

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
   '& .MuiInputBase-input': {
      color: `${theme.text} !important`,
      WebkitTextFillColor: theme.text,
   },
   '& textarea': {
      color: `${theme.text} !important`,
      WebkitTextFillColor: theme.text,
   },
   '& .MuiSelect-icon': { color: theme.text },
});

function formatDateTime(value) {
   if (!value) return '—';
   const d = new Date(value);
   if (Number.isNaN(d.getTime())) return '—';
   return d.toLocaleString('uk-UA', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
   });
}

function getAddress(item) {
   return item?.location_text ||
      [item?.location?.city, item?.location?.street, item?.location?.number].filter(Boolean).join(', ') ||
      '—';
}

function getPhoneIntelLabel(intel) {
   if (!intel) return 'Немає даних';
   if (intel.suggestedKind === 'realtor') return 'Маклер';
   if (intel.suggestedKind === 'suspected_realtor') return 'Ймовірний маклер';
   if (intel.suggestedKind === 'owner') return 'Власник';
   return 'Невідомо';
}

function formatDateChip(value) {
   if (!value) return '';
   const d = new Date(value);
   if (Number.isNaN(d.getTime())) return '';

   return d.toLocaleDateString('uk-UA', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit',
   });
}

function getDateChips(item) {
   const attrs = item?.attrs || {};

   return [
      ['Внесено', item?.importedAt || item?.createdAt],
      ['На сайті', attrs.sourcePublishedAt || attrs.sourceAddedAt],
      ['Оновлено', attrs.sourceUpdatedAt],
      ['Ціна', attrs.sourcePriceChangedAt],
   ]
      .map(([label, value]) => ({ label, value: formatDateChip(value) }))
      .filter((x) => x.value);
}

function getSourceStatusLabel(status) {
   if (status === 'active') return 'Активна';
   if (status === 'inactive') return 'Неактивна';
   if (status === 'removed') return 'Знята';
   if (status === 'error') return 'Помилка';
   return 'Невідомо';
}

function splitCsvLine(line) {
   const cells = [];
   let current = '';
   let quoted = false;

   for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      const next = line[i + 1];

      if (ch === '"' && quoted && next === '"') {
         current += '"';
         i += 1;
         continue;
      }

      if (ch === '"') {
         quoted = !quoted;
         continue;
      }

      if (ch === ',' && !quoted) {
         cells.push(current.trim());
         current = '';
         continue;
      }

      current += ch;
   }

   cells.push(current.trim());
   return cells;
}

function parseCsv(text) {
   const lines = String(text || '')
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean);

   if (lines.length < 2) return [];

   const headers = splitCsvLine(lines[0]).map((x) => x.trim());

   return lines.slice(1).map((line) => {
      const cells = splitCsvLine(line);
      return headers.reduce((acc, header, index) => {
         acc[header] = cells[index] || '';
         return acc;
      }, {});
   });
}

function buildManualFormData(form, images) {
   const formData = new FormData();
   const reviewStatus = form.contactType === 'owner' || form.contactType === 'realtor'
      ? form.contactType
      : 'unknown';
   const callCenter = {
      verifiedAddressText: form.verifiedAddressText,
      infoVerified: form.infoVerified || 'unchecked',
      inspectionLoyalty: form.inspectionLoyalty || 'unknown',
      bottomPrice: form.bottomPrice,
      interestLevel: form.interestLevel,
      urgencyLevel: form.urgencyLevel,
      cooperationWarmth: form.cooperationWarmth,
      note: form.callCenterNote,
   };
   const hasCallCenterData = [
      callCenter.verifiedAddressText,
      callCenter.bottomPrice,
      callCenter.interestLevel,
      callCenter.urgencyLevel,
      callCenter.cooperationWarmth,
      callCenter.note,
   ].some((value) => String(value || '').trim()) ||
      callCenter.infoVerified !== 'unchecked' ||
      callCenter.inspectionLoyalty !== 'unknown';

   Object.entries({
      source: form.source || 'other',
      sourceId: form.sourceId,
      sourceUrl: form.sourceUrl,
      sourceStatus: form.sourceStatus || 'unknown',
      sourceCheckedAt: form.sourceStatus && form.sourceStatus !== 'unknown' ? new Date().toISOString() : '',
      sourcePublishedAt: form.sourcePublishedAt,
      sourceAddedAt: form.sourceAddedAt,
      sourceUpdatedAt: form.sourceUpdatedAt,
      sourcePriceChangedAt: form.sourcePriceChangedAt,
      reviewStatus,
      type_estate: form.type_estate,
      type_deal: form.type_deal,
      title: form.title,
      location_text: form.location_text,
      rooms: form.rooms,
      square_tot: form.square_tot,
      floor: form.floor,
      floors: form.floors,
      cost: form.cost,
      currency: form.currency || 'USD',
      phone: form.phone,
      leadname: form.leadname,
      email: form.email,
      description: form.description,
      importedAt: new Date().toISOString(),
      callCenter: hasCallCenterData ? JSON.stringify(callCenter) : '',
      attrs: JSON.stringify({
         entryMethod: 'manual',
         contactType: form.contactType || 'unknown',
         sourcePublishedAt: form.sourcePublishedAt || null,
         sourceAddedAt: form.sourceAddedAt || null,
         sourceUpdatedAt: form.sourceUpdatedAt || null,
         sourcePriceChangedAt: form.sourcePriceChangedAt || null,
      }),
   }).forEach(([key, value]) => formData.append(key, value || ''));

   const imagesMeta = images.map((item, index) => ({
      originalName: item.file?.name || 'image',
      isMain: !!item.isMain,
      sortOrder: index,
      origin: item.origin || 'unknown',
      sourceUrl: form.sourceUrl || '',
   }));

   images.forEach((item) => {
      if (item.file) formData.append('images', item.file);
   });
   formData.append('imagesMeta', JSON.stringify(imagesMeta));

   return formData;
}

function buildDuplicateSearchSeed(item) {
   return item?.phone || item?.location_text || item?.title || '';
}

function toDatetimeLocalInput(value) {
   if (!value) return '';
   const d = new Date(value);
   if (Number.isNaN(d.getTime())) return '';
   const pad = (part) => String(part).padStart(2, '0');
   return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function buildEditForm(item) {
   const attrs = item?.attrs || {};
   return {
      source: item?.source || 'other',
      sourceId: item?.sourceId || '',
      sourceUrl: item?.sourceUrl || '',
      sourceStatus: item?.sourceStatus && item.sourceStatus !== 'не перевірено' ? item.sourceStatus : 'unknown',
      contactType: attrs.contactType || item?.reviewStatus || 'unknown',
      type_estate: item?.type_estate || '',
      type_deal: item?.type_deal || '',
      title: item?.title || '',
      location_text: item?.location_text || '',
      rooms: item?.rooms || '',
      square_tot: item?.square_tot || '',
      floor: item?.floor || '',
      floors: item?.floors || '',
      cost: item?.cost || '',
      currency: item?.currency || 'USD',
      phone: item?.phone || '',
      leadname: item?.leadname || '',
      email: item?.email || '',
      description: item?.description || '',
      sourcePublishedAt: toDatetimeLocalInput(attrs.sourcePublishedAt),
      sourceAddedAt: toDatetimeLocalInput(attrs.sourceAddedAt),
      sourceUpdatedAt: toDatetimeLocalInput(attrs.sourceUpdatedAt),
      sourcePriceChangedAt: toDatetimeLocalInput(attrs.sourcePriceChangedAt),
      verifiedAddressText: item?.callCenter?.verifiedAddressText || '',
      infoVerified: item?.callCenter?.infoVerified || 'unchecked',
      inspectionLoyalty: item?.callCenter?.inspectionLoyalty || 'unknown',
      bottomPrice: item?.callCenter?.bottomPrice || '',
      interestLevel: item?.callCenter?.interestLevel || '',
      urgencyLevel: item?.callCenter?.urgencyLevel || '',
      cooperationWarmth: item?.callCenter?.cooperationWarmth || '',
      callCenterNote: item?.callCenter?.note || '',
   };
}

export default function ParsingPage() {
   const { theme, mode } = useCRMTheme();
   const fieldSx = getFieldSx(theme, mode);

   const [q, setQ] = useState('');
   const [stage, setStage] = useState('all');
   const [source, setSource] = useState('all');
   const [communicationFilter, setCommunicationFilter] = useState('all');
   const [contactKind, setContactKind] = useState('all');
   const [qualityFilters, setQualityFilters] = useState([]);
   const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
   const [items, setItems] = useState([]);
   const [loading, setLoading] = useState(false);
   const [error, setError] = useState('');
   const [selected, setSelected] = useState(null);
   const [draft, setDraft] = useState({ callResult: '', reviewNote: '' });
   const [openCreate, setOpenCreate] = useState(false);
   const [createMode, setCreateMode] = useState('manual');
   const [manualForm, setManualForm] = useState(EMPTY_MANUAL_FORM);
   const [manualImages, setManualImages] = useState([]);
   const [bulkText, setBulkText] = useState('');
   const [bulkFormat, setBulkFormat] = useState('json');
   const [savingCreate, setSavingCreate] = useState(false);
   const [expandedId, setExpandedId] = useState('');
   const [historyItem, setHistoryItem] = useState(null);
   const [communications, setCommunications] = useState([]);
   const [communicationsLoading, setCommunicationsLoading] = useState(false);
   const [openCommunicationDialog, setOpenCommunicationDialog] = useState(false);
   const [communicationForm, setCommunicationForm] = useState(EMPTY_COMMUNICATION_FORM);
   const [communicationTarget, setCommunicationTarget] = useState(null);
   const [statusItem, setStatusItem] = useState(null);
   const [statusForm, setStatusForm] = useState(null);
   const [savingStatus, setSavingStatus] = useState(false);
   const [statusError, setStatusError] = useState('');
   const [duplicateSearch, setDuplicateSearch] = useState('');
   const [duplicateCandidates, setDuplicateCandidates] = useState([]);
   const [duplicateLoading, setDuplicateLoading] = useState(false);
   const [dimriaForm, setDimriaForm] = useState(DIMRIA_DEFAULT_FORM);
   const [dimriaImporting, setDimriaImporting] = useState(false);
   const [dimriaResult, setDimriaResult] = useState(null);
   const [currentUser, setCurrentUser] = useState(null);
   const [editItem, setEditItem] = useState(null);
   const [editForm, setEditForm] = useState(null);
   const [savingEdit, setSavingEdit] = useState(false);
   const [deleteItem, setDeleteItem] = useState(null);
   const [deleting, setDeleting] = useState(false);

   const canDeleteParsing = !!currentUser?.isFallbackAdmin || currentUser?.role === 'owner';

   const load = async () => {
      setLoading(true);
      setError('');

      try {
         const params = new URLSearchParams();
         if (q.trim()) params.set('q', q.trim());
         if (stage) params.set('stage', stage);
         if (source) params.set('source', source);
         if (communicationFilter) params.set('communicationFilter', communicationFilter);
         if (contactKind) params.set('contactKind', contactKind);
         if (qualityFilters.length) params.set('qualityFilters', qualityFilters.join(','));

         const res = await fetch(`/api/crm/parsing?${params.toString()}`, { cache: 'no-store' });
         const text = await res.text();
         const data = text ? JSON.parse(text) : {};

         if (!res.ok) throw new Error(data?.error || text || 'Не вдалося завантажити парсинг');

         setItems(Array.isArray(data?.items) ? data.items : []);
      } catch (e) {
         console.error(e);
         setError(e?.message || 'Не вдалося завантажити парсинг');
      } finally {
         setLoading(false);
      }
   };

   useEffect(() => {
      load();
   }, []);

   useEffect(() => {
      const t = setTimeout(load, 350);
      return () => clearTimeout(t);
   }, [q, stage, source, communicationFilter, contactKind, qualityFilters]);

   useEffect(() => {
      let alive = true;

      (async () => {
         try {
            const res = await fetch('/api/crm/me', { cache: 'no-store' });
            const data = await res.json().catch(() => ({}));
            if (alive) setCurrentUser(data?.user || null);
         } catch {
            if (alive) setCurrentUser(null);
         }
      })();

      return () => {
         alive = false;
      };
   }, []);

   const visibleItems = useMemo(() => {
      if (items.length) return items;
      if (loading || error) return [];
      return DEMO_ITEMS;
   }, [items, loading, error]);

   const stats = useMemo(() => {
      return visibleItems.reduce((acc, item) => {
         const key = normalizeStageKey(item.stage);
         acc[key] = (acc[key] || 0) + 1;
         return acc;
      }, {});
   }, [visibleItems]);

   const patchItem = async (item, payload) => {
      if (String(item?._id || '').startsWith('demo-')) {
         const demoPayload = payload?.action === 'moveToObjects'
            ? { ...payload, stage: 'moved' }
            : payload;

         setItems((prev) => {
            const base = prev.length ? prev : DEMO_ITEMS;
            return base.map((x) => x._id === item._id ? { ...x, ...demoPayload } : x);
         });
         if (selected?._id === item._id) setSelected((prev) => ({ ...prev, ...demoPayload }));
         return;
      }

      const res = await fetch(`/api/crm/parsing/${item._id}`, {
         method: 'PATCH',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || 'Не вдалося оновити оголошення');

      setItems((prev) => prev.map((x) => x._id === item._id ? data.item : x));
      if (selected?._id === item._id) setSelected(data.item);
   };

   const handleStage = async (item, nextStage) => {
      try {
         const likelyDuplicateProperty = item?.phoneIntel?.relatedObjects?.[0]?._id || '';

         await patchItem(item, {
            stage: nextStage,
            reviewStatus: nextStage === 'qualified' ? 'actual' : item.reviewStatus,
            lastCallAt: nextStage === 'called' || nextStage === 'qualified' ? new Date().toISOString() : item.lastCallAt,
            duplicatePropertyId: nextStage === 'duplicate' ? (item.duplicatePropertyId?._id || item.duplicatePropertyId || likelyDuplicateProperty || null) : item.duplicatePropertyId,
         });
      } catch (e) {
         setError(e?.message || 'Не вдалося оновити статус');
      }
   };

   const loadCommunications = async (item) => {
      if (!item?._id || String(item._id).startsWith('demo-')) {
         setCommunications([]);
         return;
      }

      setCommunicationsLoading(true);
      try {
         const params = new URLSearchParams({
            entityType: 'leadProperty',
            entityId: item._id,
         });
         const res = await fetch(`/api/crm/communications?${params.toString()}`, { cache: 'no-store' });
         const data = await res.json().catch(() => ({}));
         if (!res.ok) throw new Error(data?.error || 'Не вдалося завантажити комунікації');
         setCommunications(Array.isArray(data?.items) ? data.items : []);
      } catch (e) {
         console.error(e);
         setError(e?.message || 'Не вдалося завантажити комунікації');
      } finally {
         setCommunicationsLoading(false);
      }
   };

   const createCommunication = async (item, communication, meta = {}) => {
      if (!item?._id || String(item._id).startsWith('demo-')) return null;

      const res = await fetch('/api/crm/communications', {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({
            entityType: 'leadProperty',
            entityId: item._id,
            type: communication?.type || 'note',
            tone: communication?.tone || 'info',
            happenedAt: communication?.happenedAt || new Date().toISOString(),
            text: communication?.text || '',
            meta,
         }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || 'Не вдалося зберегти комунікацію');
      return data.item;
   };

   const openHistory = async (item) => {
      setHistoryItem(item);
      setCommunicationForm(EMPTY_COMMUNICATION_FORM);
      await loadCommunications(item);
   };

   const openQuickCommunication = (item) => {
      setCommunicationTarget(item);
      setCommunicationForm(EMPTY_COMMUNICATION_FORM);
      setOpenCommunicationDialog(true);
   };

   const openStatus = (item) => {
      setStatusItem(item);
      setStatusForm(buildInitialStatusForm(item));
      setStatusError('');
      setDuplicateSearch(buildDuplicateSearchSeed(item));
      setDuplicateCandidates([]);
   };

   useEffect(() => {
      if (!statusItem || statusForm?.status !== 'duplicate') return undefined;

      const searchText = String(duplicateSearch || '').trim();
      if (searchText.length < 2) {
         setDuplicateCandidates([]);
         return undefined;
      }

      const t = setTimeout(async () => {
         setDuplicateLoading(true);
         try {
            const params = new URLSearchParams({
               mode: 'sale',
               pageSize: '8',
               q: searchText,
            });
            const res = await fetch(`/api/crm/properties?${params.toString()}`, { cache: 'no-store' });
            const data = await res.json().catch(() => ({}));
            if (!res.ok) throw new Error(data?.error || 'Не вдалося знайти обʼєкти');
            setDuplicateCandidates(Array.isArray(data?.items) ? data.items : []);
         } catch (e) {
            console.error(e);
            setDuplicateCandidates([]);
            setStatusError(e?.message || 'Не вдалося знайти обʼєкти');
         } finally {
            setDuplicateLoading(false);
         }
      }, 350);

      return () => clearTimeout(t);
   }, [duplicateSearch, statusForm?.status, statusItem]);

   const handleSubmitStatus = async () => {
      if (!statusItem || !statusForm) return;

      const status = statusForm.status;
      const needsCommunication = ['base', 'inactive', 'paused', 'duplicate', 'fake'].includes(status);
      const shouldSaveCallCenter = ['base', 'paused'].includes(status);

      if (status === 'duplicate' && !statusForm.duplicatePropertyId) {
         setStatusError('Для дубля треба вибрати оригінал у нашій базі.');
         return;
      }

      if (needsCommunication && !String(statusForm.communication?.text || '').trim()) {
         setStatusError('Додай опис комунікації.');
         return;
      }

      setSavingStatus(true);
      setStatusError('');

      try {
         if (needsCommunication) {
            await createCommunication(statusItem, statusForm.communication, {
               parsingStatus: status,
               marketGroup: status === 'inactive' ? 'inactive' : status === 'paused' ? 'paused' : 'active',
               marketReason: statusForm.marketReason,
               callCenter: shouldSaveCallCenter ? statusForm.callCenter : undefined,
            });
         }

         if (status === 'base' || status === 'inactive' || status === 'paused') {
            const actualityGroup = status === 'inactive'
               ? 'inactive'
               : status === 'paused'
                  ? 'paused'
                  : 'active';

            await patchItem(statusItem, {
               action: 'moveToObjects',
               actualityGroup,
               marketReason: statusForm.marketReason || '',
               callCenter: shouldSaveCallCenter ? statusForm.callCenter : undefined,
            });
         } else {
            await patchItem(statusItem, {
               stage: status,
               reviewStatus:
                  status === 'fake' ? 'not_actual' :
                      status === 'duplicate' ? 'unknown' :
                         statusItem.reviewStatus,
               duplicatePropertyId: status === 'duplicate' ? statusForm.duplicatePropertyId : statusItem.duplicatePropertyId,
               callCenter: shouldSaveCallCenter ? statusForm.callCenter : undefined,
            });
         }

         setStatusItem(null);
         setStatusForm(null);
         await load();
      } catch (e) {
         console.error(e);
         setStatusError(e?.message || 'Не вдалося змінити статус');
      } finally {
         setSavingStatus(false);
      }
   };

   const handleAddCommunication = async () => {
      const target = communicationTarget || historyItem;
      if (!target) return;

      try {
         await createCommunication(target, communicationForm);
         setOpenCommunicationDialog(false);
         setCommunicationTarget(null);
         setCommunicationForm(EMPTY_COMMUNICATION_FORM);
         if (historyItem?._id === target._id) {
            await loadCommunications(historyItem);
         }
         await load();
      } catch (e) {
         setError(e?.message || 'Не вдалося додати комунікацію');
      }
   };

   const openEdit = (item) => {
      setEditItem(item);
      setEditForm(buildEditForm(item));
      setError('');
   };

   const handleSaveEdit = async () => {
      if (!editItem || !editForm) return;

      setSavingEdit(true);
      setError('');

      try {
         const contactType = editForm.contactType || 'unknown';
         const reviewStatus = contactType === 'owner' || contactType === 'realtor'
            ? contactType
            : 'unknown';

         await patchItem(editItem, {
            editableFields: true,
            ...editForm,
            reviewStatus,
            sourceCheckedAt: editForm.sourceStatus && editForm.sourceStatus !== 'unknown' ? new Date().toISOString() : editItem.sourceCheckedAt,
            callCenter: {
               verifiedAddressText: editForm.verifiedAddressText,
               infoVerified: editForm.infoVerified,
               inspectionLoyalty: editForm.inspectionLoyalty,
               bottomPrice: editForm.bottomPrice,
               interestLevel: editForm.interestLevel,
               urgencyLevel: editForm.urgencyLevel,
               cooperationWarmth: editForm.cooperationWarmth,
               note: editForm.callCenterNote,
            },
         });

         setEditItem(null);
         setEditForm(null);
      } catch (e) {
         console.error(e);
         setError(e?.message || 'Не вдалося зберегти зміни');
      } finally {
         setSavingEdit(false);
      }
   };

   const handleDeleteParsing = async () => {
      if (!deleteItem?._id) return;

      setDeleting(true);
      setError('');

      try {
         const res = await fetch(`/api/crm/parsing/${deleteItem._id}`, { method: 'DELETE' });
         const data = await res.json().catch(() => ({}));

         if (!res.ok) throw new Error(data?.error || 'Не вдалося видалити запис');

         setItems((prev) => prev.filter((item) => item._id !== deleteItem._id));
         if (selected?._id === deleteItem._id) setSelected(null);
         if (historyItem?._id === deleteItem._id) setHistoryItem(null);
         setDeleteItem(null);
      } catch (e) {
         console.error(e);
         setError(e?.message || 'Не вдалося видалити запис');
      } finally {
         setDeleting(false);
      }
   };

   const handleSaveCall = async () => {
      if (!selected) return;

      try {
         await patchItem(selected, {
            stage: selected.stage === 'raw' ? 'called' : selected.stage,
            callResult: draft.callResult,
            reviewNote: draft.reviewNote,
            lastCallAt: new Date().toISOString(),
         });
      } catch (e) {
         setError(e?.message || 'Не вдалося зберегти продзвін');
      }
   };

   const handleMove = async (item) => {
      try {
         await patchItem(item, { action: 'moveToObjects' });
      } catch (e) {
         setError(e?.message || 'Не вдалося перенести в обʼєкти');
      }
   };

   const openItem = (item) => {
      setSelected(item);
      setDraft({
         callResult: item?.callResult || '',
         reviewNote: item?.reviewNote || '',
      });
   };

   const createParsingItems = async (payload) => {
      setSavingCreate(true);
      setError('');

      try {
         const isFormData = payload instanceof FormData;
         const res = await fetch('/api/crm/parsing', {
            method: 'POST',
            ...(isFormData ? {} : { headers: { 'Content-Type': 'application/json' } }),
            body: isFormData ? payload : JSON.stringify(payload),
         });

         const text = await res.text();
         const data = text ? JSON.parse(text) : {};

         if (!res.ok) throw new Error(data?.error || text || 'Не вдалося додати оголошення');

         setOpenCreate(false);
         setManualForm(EMPTY_MANUAL_FORM);
         setManualImages([]);
         setBulkText('');
         await load();
      } catch (e) {
         console.error(e);
         setError(e?.message || 'Не вдалося додати оголошення');
      } finally {
         setSavingCreate(false);
      }
   };

   const handleCreateManual = async () => {
      await createParsingItems(buildManualFormData(manualForm, manualImages));
   };

   const handleCreateBulk = async () => {
      let rows = [];

      try {
         if (bulkFormat === 'json') {
            const parsed = JSON.parse(bulkText || '[]');
            rows = Array.isArray(parsed) ? parsed : [parsed];
         } else {
            rows = parseCsv(bulkText);
         }
      } catch (e) {
         setError('Не вдалося прочитати імпорт. Перевір JSON або CSV.');
         return;
      }

      if (!rows.length) {
         setError('Немає записів для імпорту.');
         return;
      }

      await createParsingItems({ items: rows });
   };

   const updateDimriaCity = (cityLabel) => {
      const city = DIMRIA_CITY_OPTIONS.find((item) => item.label === cityLabel) || DIMRIA_CITY_OPTIONS[0];
      setDimriaForm((prev) => ({
         ...prev,
         city: city.label,
         state_id: city.state_id,
         city_id: city.city_id,
      }));
   };

   const updateDimriaRealty = (realtyValue) => {
      const realty = DIMRIA_REALTY_OPTIONS.find((item) => item.value === realtyValue) || DIMRIA_REALTY_OPTIONS[0];
      setDimriaForm((prev) => ({
         ...prev,
         realty: realty.value,
         category: realty.category,
         realty_type: realty.realty_type,
      }));
   };

   const handleDimriaImport = async () => {
      setDimriaImporting(true);
      setDimriaResult(null);
      setError('');

      try {
         const contact = DIMRIA_CONTACT_OPTIONS.find((item) => item.value === dimriaForm.contactType) || DIMRIA_CONTACT_OPTIONS[0];
         const payload = {
            limit: Number(dimriaForm.limit) || 1,
            category: dimriaForm.category,
            realty_type: dimriaForm.realty_type,
            operation_type: dimriaForm.operation_type,
            secondary: dimriaForm.secondary === '1' ? 1 : 0,
            state_id: dimriaForm.state_id,
            city_id: dimriaForm.city_id,
            params: contact.params || {},
         };

         const res = await fetch('/api/crm/integrations/dimria/import', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
         });

         const text = await res.text();
         const data = text ? JSON.parse(text) : {};
         if (!res.ok) throw new Error(data?.error || text || 'DIM.RIA import failed');

         setDimriaResult(data);
         setSource('dimria');
         setStage('all');
         await load();
      } catch (e) {
         console.error(e);
         setError(e?.message || 'DIM.RIA import failed');
      } finally {
         setDimriaImporting(false);
      }
   };

   return (
      <Box>
         <Stack
            direction="row"
            spacing={0.8}
            alignItems="center"
            flexWrap="wrap"
            useFlexGap
            sx={{ mb: 1.5 }}
         >
            <Typography variant="h5" fontWeight={950} sx={{ color: theme.text, whiteSpace: 'nowrap', mr: 0.5 }}>
               Парсинг
            </Typography>

            <TextField
               placeholder="Пошук"
               size="small"
               value={q}
               onChange={(e) => setQ(e.target.value)}
               sx={{ ...fieldSx, width: { xs: '100%', sm: 220, md: 260 } }}
               InputProps={{
                  startAdornment: <SearchRoundedIcon sx={{ mr: 1, opacity: 0.7, color: theme.textSoft }} />,
               }}
            />

            <Stack direction="row" spacing={0.45} flexWrap="wrap" useFlexGap>
               {STAGE_OPTIONS.filter(([value]) => value !== 'all').map(([value, label]) => (
                  <Button
                     key={value}
                     onClick={() => setStage(value)}
                     sx={{
                        minHeight: 34,
                        borderRadius: 2.2,
                        px: 1,
                        fontSize: 12,
                        fontWeight: 950,
                        color: stage === value ? '#0b0b12' : theme.text,
                        bgcolor: stage === value ? theme.accent : 'transparent',
                        border: `1px solid ${stage === value ? 'transparent' : theme.border}`,
                     }}
                  >
                     {label}
                  </Button>
               ))}
            </Stack>

            <Stack
               direction="row"
               spacing={0.35}
               alignItems="center"
               sx={{
                  px: 0.55,
                  py: 0.35,
                  borderRadius: 2.5,
                  border: `1px solid ${theme.border}`,
                  bgcolor: mode === 'light' ? 'rgba(124,58,237,0.035)' : 'rgba(255,255,255,0.025)',
               }}
            >
               {CONTACT_KIND_OPTIONS.map(([value, label]) => {
                  const active = contactKind === value;
                  const icon =
                     value === 'owner' ? <PersonRoundedIcon fontSize="small" /> :
                        value === 'realtor' ? <PestControlRoundedIcon fontSize="small" /> :
                           <HelpOutlineRoundedIcon fontSize="small" />;
                  const activeColor =
                     value === 'owner' ? '#22c55e' :
                        value === 'realtor' ? '#ef4444' :
                           value === 'suspected_realtor' ? '#f97316' :
                              '#f59e0b';

                  return (
                     <Tooltip key={value} title={label}>
                        <IconButton
                           size="small"
                           onClick={() => setContactKind(active ? 'all' : value)}
                           sx={{
                              width: 34,
                              height: 34,
                              color: active ? '#0b0b12' : activeColor,
                              bgcolor: active ? activeColor : 'transparent',
                              border: `1px solid ${active ? 'transparent' : `${activeColor}55`}`,
                              '&:hover': { bgcolor: active ? activeColor : `${activeColor}16` },
                           }}
                        >
                           {icon}
                        </IconButton>
                     </Tooltip>
                  );
               })}
            </Stack>

            <Stack direction="row" spacing={0.45} flexWrap="wrap" useFlexGap>
               {COMMUNICATION_FILTER_OPTIONS.map(([value, label]) => {
                  const active = communicationFilter === value;

                  return (
                     <Tooltip key={value} title="Немає контакту 3+ дні">
                        <Button
                           onClick={() => setCommunicationFilter(active ? 'all' : value)}
                           startIcon={<PhoneDisabledRoundedIcon fontSize="small" />}
                           sx={{
                              minHeight: 34,
                              borderRadius: 2.2,
                              px: 1,
                              fontSize: 12,
                              fontWeight: 950,
                              color: active ? '#0b0b12' : theme.text,
                              bgcolor: active ? theme.accent : 'transparent',
                              border: `1px solid ${active ? 'transparent' : theme.border}`,
                              '& .MuiButton-startIcon': { mr: 0.45 },
                           }}
                        >
                           {label}
                        </Button>
                     </Tooltip>
                  );
               })}
            </Stack>

            <Tooltip title="Розширений фільтр">
               <IconButton
                  onClick={() => setShowAdvancedFilters((value) => !value)}
                  sx={{
                     width: 38,
                     height: 38,
                     color: showAdvancedFilters || qualityFilters.length ? '#0b0b12' : theme.text,
                     bgcolor: showAdvancedFilters || qualityFilters.length ? theme.accent : 'transparent',
                     border: `1px solid ${showAdvancedFilters || qualityFilters.length ? 'transparent' : theme.border}`,
                  }}
               >
                  <TuneRoundedIcon />
               </IconButton>
            </Tooltip>

            <Tooltip title="Скинути фільтри">
               <IconButton
                  onClick={() => {
                     setQ('');
                     setStage('all');
                     setSource('all');
                     setCommunicationFilter('all');
                     setContactKind('all');
                     setQualityFilters([]);
                     setShowAdvancedFilters(false);
                  }}
                  sx={{ width: 38, height: 38, color: theme.text, border: `1px solid ${theme.border}` }}
               >
                  <RestartAltRoundedIcon />
               </IconButton>
            </Tooltip>

            <Tooltip title="Додати в парсинг">
               <IconButton
                  onClick={() => setOpenCreate(true)}
                  sx={{
                     width: 40,
                     height: 40,
                     color: '#0b0b12',
                     background: `linear-gradient(90deg, ${theme.accent}, ${theme.accentLight})`,
                  }}
               >
                  <AddRoundedIcon />
               </IconButton>
            </Tooltip>
         </Stack>

         <Box
            sx={{
               mb: 1.5,
               p: 1,
               borderRadius: 2.5,
               border: `1px solid ${theme.border}`,
               bgcolor: mode === 'light' ? 'rgba(124,58,237,0.035)' : 'rgba(255,255,255,0.025)',
            }}
         >
            <Stack direction="row" spacing={0.9} alignItems="center" flexWrap="wrap" useFlexGap>
               <Typography sx={{ color: theme.text, fontWeight: 950, fontSize: 13, mr: 0.3 }}>
                  DIM.RIA
               </Typography>

               <TextField
                  select
                  size="small"
                  label="Місто"
                  value={dimriaForm.city}
                  onChange={(e) => updateDimriaCity(e.target.value)}
                  sx={{ ...fieldSx, width: { xs: '100%', sm: 130 } }}
               >
                  {DIMRIA_CITY_OPTIONS.map((item) => (
                     <MenuItem key={item.city_id} value={item.label}>{item.label}</MenuItem>
                  ))}
               </TextField>

               <TextField
                  select
                  size="small"
                  label="Тип"
                  value={dimriaForm.realty}
                  onChange={(e) => updateDimriaRealty(e.target.value)}
                  sx={{ ...fieldSx, width: { xs: '100%', sm: 130 } }}
               >
                  {DIMRIA_REALTY_OPTIONS.map((item) => (
                     <MenuItem key={item.value} value={item.value}>{item.label}</MenuItem>
                  ))}
               </TextField>

               <TextField
                  select
                  size="small"
                  label="Контакт"
                  value={dimriaForm.contactType}
                  onChange={(e) => setDimriaForm((prev) => ({ ...prev, contactType: e.target.value }))}
                  sx={{ ...fieldSx, width: { xs: '100%', sm: 130 } }}
               >
                  {DIMRIA_CONTACT_OPTIONS.map((item) => (
                     <MenuItem key={item.value} value={item.value}>{item.label}</MenuItem>
                  ))}
               </TextField>

               <TextField
                  size="small"
                  label="К-сть"
                  type="number"
                  value={dimriaForm.limit}
                  onChange={(e) => setDimriaForm((prev) => ({ ...prev, limit: e.target.value }))}
                  inputProps={{ min: 1, max: 20 }}
                  sx={{ ...fieldSx, width: { xs: '100%', sm: 86 } }}
               />

               <Tooltip title="1 пошук + кількість деталей. За замовчуванням імпортуємо 1 квартиру з фото.">
                  <span>
                     <Button
                        disabled={dimriaImporting}
                        onClick={handleDimriaImport}
                        startIcon={<CloudDownloadRoundedIcon />}
                        sx={{
                           minHeight: 40,
                           borderRadius: 2.5,
                           px: 1.5,
                           fontWeight: 950,
                           color: '#0b0b12',
                           background: `linear-gradient(90deg, ${theme.accent}, ${theme.accentLight})`,
                           '& .MuiButton-startIcon': { mr: 0.55 },
                           '&.Mui-disabled': {
                              color: 'rgba(11,11,18,0.55)',
                              opacity: 0.7,
                           },
                        }}
                     >
                        {dimriaImporting ? 'Імпорт...' : `Імпорт ${Number(dimriaForm.limit) || 1}`}
                     </Button>
                  </span>
               </Tooltip>

               {dimriaResult && (
                  <Chip
                     size="small"
                     label={`Створено: ${dimriaResult.created || 0} · Дублі: ${dimriaResult.duplicates || 0} · Помилки: ${dimriaResult.failed || 0}`}
                     sx={{
                        height: 28,
                        borderRadius: 1.5,
                        fontWeight: 900,
                        color: (dimriaResult.created || 0) > 0 ? '#22c55e' : theme.textSoft,
                        bgcolor: (dimriaResult.created || 0) > 0 ? 'rgba(34,197,94,0.12)' : theme.hover,
                        border: `1px solid ${(dimriaResult.created || 0) > 0 ? 'rgba(34,197,94,0.35)' : theme.border}`,
                     }}
                  />
               )}
            </Stack>
         </Box>

         {showAdvancedFilters && (
            <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap sx={{ mb: 1.5 }}>
               {QUALITY_FILTER_OPTIONS.map(([value, label]) => {
                  const active = qualityFilters.includes(value);

                  return (
                     <Button
                        key={value}
                        onClick={() => {
                           setQualityFilters((current) => (
                              current.includes(value)
                                 ? current.filter((item) => item !== value)
                                 : [...current, value]
                           ));
                        }}
                        sx={{
                           minHeight: 32,
                           borderRadius: 2.5,
                           px: 1.4,
                           fontWeight: 950,
                           color: active ? '#0b0b12' : theme.text,
                           bgcolor: active ? theme.accent : 'transparent',
                           border: `1px solid ${active ? 'transparent' : theme.border}`,
                        }}
                     >
                        {label}
                     </Button>
                  );
               })}
            </Stack>
         )}

         <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap sx={{ mb: 1.5 }}>
            {STAGE_OPTIONS.filter(([key]) => key !== 'all').map(([key]) => {
               const meta = STAGE_META[key] || STAGE_META.raw;

               return (
               <Chip
                  key={key}
                  label={`${meta.label}: ${stats[key] || 0}`}
                  size="small"
                  sx={{
                     height: 25,
                     borderRadius: 1.5,
                     fontWeight: 900,
                     color: meta.color,
                     bgcolor: `${meta.color}14`,
                     border: `1px solid ${meta.color}35`,
                  }}
               />
               );
            })}
         </Stack>

         {error && <Alert severity="error" sx={{ mb: 1.5, borderRadius: 2 }}>{error}</Alert>}

         {!items.length && !loading && !error && (
            <Alert severity="info" sx={{ mb: 1.5, borderRadius: 2 }}>
               У базі поки немає записів, тому показую демо-рядки майбутнього потоку.
            </Alert>
         )}

         <Stack spacing={0.85}>
            {visibleItems.map((item) => (
               <ParsingRowCard
                  key={item._id}
                  item={item}
                  expanded={expandedId === item._id}
                  onToggleExpand={(nextItem) => setExpandedId((current) => current === nextItem._id ? '' : nextItem._id)}
                  onStatus={openStatus}
                  onHistory={openHistory}
                  onQuickCommunication={openQuickCommunication}
                  onEdit={openEdit}
                  onDelete={setDeleteItem}
                  canDelete={canDeleteParsing}
               />
            ))}
         </Stack>

         <Dialog
            open={openCreate}
            onClose={() => setOpenCreate(false)}
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
            <DialogTitle sx={{ fontWeight: 950 }}>
               Додати в Парсинг
            </DialogTitle>

            <DialogContent>
               <Stack spacing={1.4} sx={{ mt: 0.5 }}>
                  <Stack direction="row" spacing={0.8} flexWrap="wrap" useFlexGap>
                     <Button
                        onClick={() => setCreateMode('manual')}
                        startIcon={<AddRoundedIcon />}
                        sx={{
                           borderRadius: 3,
                           fontWeight: 950,
                           color: createMode === 'manual' ? '#0b0b12' : theme.text,
                           bgcolor: createMode === 'manual' ? theme.accent : 'transparent',
                           border: `1px solid ${createMode === 'manual' ? 'transparent' : theme.border}`,
                        }}
                     >
                        Вручну
                     </Button>

                     <Button
                        onClick={() => setCreateMode('bulk')}
                        startIcon={<UploadFileRoundedIcon />}
                        sx={{
                           borderRadius: 3,
                           fontWeight: 950,
                           color: createMode === 'bulk' ? '#0b0b12' : theme.text,
                           bgcolor: createMode === 'bulk' ? theme.accent : 'transparent',
                           border: `1px solid ${createMode === 'bulk' ? 'transparent' : theme.border}`,
                        }}
                     >
                        Імпорт
                     </Button>
                  </Stack>

                  {createMode === 'manual' && (
                     <Box
                        sx={{
                           display: 'grid',
                           gridTemplateColumns: { xs: '1fr', md: 'repeat(4, 1fr)' },
                           gap: 1.1,
                        }}
                     >
                         <TextField
                            select
                            label="Джерело оголошення"
                            value={manualForm.source}
                            onChange={(e) => setManualForm((p) => ({ ...p, source: e.target.value }))}
                            sx={fieldSx}
                          >
                             <MenuItem value="olx">OLX</MenuItem>
                             <MenuItem value="dimria">DIM.RIA</MenuItem>
                             <MenuItem value="rieltor">RIELTOR.UA</MenuItem>
                             <MenuItem value="lun">LUN</MenuItem>
                            <MenuItem value="telegram">Telegram</MenuItem>
                            <MenuItem value="facebook">Facebook</MenuItem>
                            <MenuItem value="tiktok">TikTok</MenuItem>
                             <MenuItem value="other">Інше</MenuItem>
                          </TextField>

                          <TextField
                             label="ID на джерелі"
                             value={manualForm.sourceId}
                             onChange={(e) => setManualForm((p) => ({ ...p, sourceId: e.target.value }))}
                             sx={fieldSx}
                             placeholder="ID оголошення"
                          />

                          <TextField
                             select
                             label="Стан посилання"
                             value={manualForm.sourceStatus}
                             onChange={(e) => setManualForm((p) => ({ ...p, sourceStatus: e.target.value }))}
                             sx={fieldSx}
                          >
                             {SOURCE_STATUS_OPTIONS.map(([value, label]) => (
                                <MenuItem key={value} value={value}>{label}</MenuItem>
                             ))}
                          </TextField>

                          <TextField
                             select
                             label="Тип обʼєкта"
                            value={manualForm.type_estate}
                            onChange={(e) => setManualForm((p) => ({ ...p, type_estate: e.target.value }))}
                            sx={fieldSx}
                         >
                            <MenuItem value="">Не вказано</MenuItem>
                            <MenuItem value="квартира">Квартира</MenuItem>
                            <MenuItem value="будинок">Будинок</MenuItem>
                            <MenuItem value="земля">Земля</MenuItem>
                            <MenuItem value="комерція">Комерція</MenuItem>
                         </TextField>

                         <TextField
                            select
                            label="Угода"
                            value={manualForm.type_deal}
                            onChange={(e) => setManualForm((p) => ({ ...p, type_deal: e.target.value }))}
                            sx={fieldSx}
                         >
                            <MenuItem value="">Не вказано</MenuItem>
                            <MenuItem value="продаж">Продаж</MenuItem>
                            <MenuItem value="оренда">Оренда</MenuItem>
                         </TextField>

                          <TextField
                             label="Телефон"
                            value={manualForm.phone}
                            onChange={(e) => setManualForm((p) => ({ ...p, phone: e.target.value }))}
                            sx={fieldSx}
                         />

                         <TextField
                            select
                            label="Тип контакту"
                            value={manualForm.contactType}
                            onChange={(e) => setManualForm((p) => ({ ...p, contactType: e.target.value }))}
                            sx={fieldSx}
                         >
                            {CONTACT_KIND_OPTIONS.map(([value, label]) => (
                               <MenuItem key={value} value={value}>{label}</MenuItem>
                            ))}
                         </TextField>

                         <TextField
                            label="Контакт"
                            value={manualForm.leadname}
                           onChange={(e) => setManualForm((p) => ({ ...p, leadname: e.target.value }))}
                            sx={fieldSx}
                         />

                         <TextField
                            label="Email / месенджер"
                            value={manualForm.email}
                            onChange={(e) => setManualForm((p) => ({ ...p, email: e.target.value }))}
                            sx={fieldSx}
                         />

                         <TextField
                            label="Ціна"
                           value={manualForm.cost}
                           onChange={(e) => setManualForm((p) => ({ ...p, cost: e.target.value }))}
                            sx={fieldSx}
                         />

                         <TextField
                            select
                            label="Валюта"
                            value={manualForm.currency}
                            onChange={(e) => setManualForm((p) => ({ ...p, currency: e.target.value }))}
                            sx={fieldSx}
                         >
                            <MenuItem value="USD">USD</MenuItem>
                            <MenuItem value="EUR">EUR</MenuItem>
                            <MenuItem value="UAH">UAH</MenuItem>
                         </TextField>

                        <TextField
                           label="Назва"
                           value={manualForm.title}
                           onChange={(e) => setManualForm((p) => ({ ...p, title: e.target.value }))}
                           sx={{ ...fieldSx, gridColumn: { xs: 'auto', md: 'span 2' } }}
                        />

                        <TextField
                           label="Адреса"
                           value={manualForm.location_text}
                           onChange={(e) => setManualForm((p) => ({ ...p, location_text: e.target.value }))}
                           sx={{ ...fieldSx, gridColumn: { xs: 'auto', md: 'span 2' } }}
                        />

                        <TextField
                           label="Кімн."
                           value={manualForm.rooms}
                           onChange={(e) => setManualForm((p) => ({ ...p, rooms: e.target.value }))}
                           sx={fieldSx}
                        />

                        <TextField
                           label="Площа"
                           value={manualForm.square_tot}
                           onChange={(e) => setManualForm((p) => ({ ...p, square_tot: e.target.value }))}
                           sx={fieldSx}
                        />

                        <TextField
                           label="Поверх"
                           value={manualForm.floor}
                           onChange={(e) => setManualForm((p) => ({ ...p, floor: e.target.value }))}
                           sx={fieldSx}
                        />

                        <TextField
                           label="Поверховість"
                           value={manualForm.floors}
                           onChange={(e) => setManualForm((p) => ({ ...p, floors: e.target.value }))}
                           sx={fieldSx}
                        />

                         <TextField
                            label="Посилання"
                            value={manualForm.sourceUrl}
                            onChange={(e) => setManualForm((p) => ({ ...p, sourceUrl: e.target.value }))}
                            sx={{ ...fieldSx, gridColumn: { xs: 'auto', md: 'span 4' } }}
                         />

                         <TextField
                            label="Опубліковано на сайті"
                            type="datetime-local"
                            value={manualForm.sourcePublishedAt}
                            onChange={(e) => setManualForm((p) => ({ ...p, sourcePublishedAt: e.target.value }))}
                            InputLabelProps={{ shrink: true }}
                            sx={fieldSx}
                         />

                         <TextField
                            label="Додано на сайт"
                            type="datetime-local"
                            value={manualForm.sourceAddedAt}
                            onChange={(e) => setManualForm((p) => ({ ...p, sourceAddedAt: e.target.value }))}
                            InputLabelProps={{ shrink: true }}
                            sx={fieldSx}
                         />

                         <TextField
                            label="Оновлено на сайті"
                            type="datetime-local"
                            value={manualForm.sourceUpdatedAt}
                            onChange={(e) => setManualForm((p) => ({ ...p, sourceUpdatedAt: e.target.value }))}
                            InputLabelProps={{ shrink: true }}
                            sx={fieldSx}
                         />

                         <TextField
                            label="Зміна ціни"
                            type="datetime-local"
                            value={manualForm.sourcePriceChangedAt}
                            onChange={(e) => setManualForm((p) => ({ ...p, sourcePriceChangedAt: e.target.value }))}
                            InputLabelProps={{ shrink: true }}
                            sx={fieldSx}
                         />

                         <Box
                            sx={{
                               gridColumn: { xs: 'auto', md: 'span 4' },
                               p: 1.2,
                               borderRadius: 3,
                               border: `1px solid ${theme.border}`,
                               bgcolor: mode === 'light' ? 'rgba(124,58,237,0.035)' : 'rgba(255,255,255,0.025)',
                            }}
                         >
                            <Typography sx={{ fontWeight: 950, color: theme.text, mb: 1 }}>
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
                                  value={manualForm.verifiedAddressText}
                                  onChange={(e) => setManualForm((p) => ({ ...p, verifiedAddressText: e.target.value }))}
                                  sx={{ ...fieldSx, gridColumn: { xs: 'auto', md: 'span 2' } }}
                               />

                               <TextField
                                  select
                                  label="Перевірка інформації"
                                  value={manualForm.infoVerified}
                                  onChange={(e) => setManualForm((p) => ({ ...p, infoVerified: e.target.value }))}
                                  sx={fieldSx}
                               >
                                  {INFO_VERIFIED_OPTIONS.map(([value, label]) => (
                                     <MenuItem key={value} value={value}>{label}</MenuItem>
                                  ))}
                               </TextField>

                               <TextField
                                  select
                                  label="Лояльність до огляду"
                                  value={manualForm.inspectionLoyalty}
                                  onChange={(e) => setManualForm((p) => ({ ...p, inspectionLoyalty: e.target.value }))}
                                  sx={fieldSx}
                               >
                                  {INSPECTION_LOYALTY_OPTIONS.map(([value, label]) => (
                                     <MenuItem key={value} value={value}>{label}</MenuItem>
                                  ))}
                               </TextField>

                               <TextField
                                  label="Гранично низька ціна"
                                  value={manualForm.bottomPrice}
                                  onChange={(e) => setManualForm((p) => ({ ...p, bottomPrice: e.target.value }))}
                                  sx={fieldSx}
                               />

                               <TextField
                                  select
                                  label="Цікавість нам"
                                  value={manualForm.interestLevel}
                                  onChange={(e) => setManualForm((p) => ({ ...p, interestLevel: e.target.value }))}
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
                                  value={manualForm.urgencyLevel}
                                  onChange={(e) => setManualForm((p) => ({ ...p, urgencyLevel: e.target.value }))}
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
                                  value={manualForm.cooperationWarmth}
                                  onChange={(e) => setManualForm((p) => ({ ...p, cooperationWarmth: e.target.value }))}
                                  sx={fieldSx}
                               >
                                  <MenuItem value="">Не вказано</MenuItem>
                                  {COOPERATION_WARMTH_OPTIONS.map(([value, label]) => (
                                     <MenuItem key={value} value={value}>{label}</MenuItem>
                                  ))}
                               </TextField>

                               <TextField
                                  label="Нотатка колцентру"
                                  value={manualForm.callCenterNote}
                                  onChange={(e) => setManualForm((p) => ({ ...p, callCenterNote: e.target.value }))}
                                  multiline
                                  minRows={2}
                                  sx={{ ...fieldSx, gridColumn: { xs: 'auto', md: 'span 4' } }}
                               />
                            </Box>
                         </Box>

                         <TextField
                            label="Опис"
                           value={manualForm.description}
                           onChange={(e) => setManualForm((p) => ({ ...p, description: e.target.value }))}
                           multiline
                           minRows={4}
                            sx={{ ...fieldSx, gridColumn: { xs: 'auto', md: 'span 4' } }}
                         />

                          <Box
                             sx={{
                                gridColumn: { xs: 'auto', md: 'span 4' },
                                p: 1.2,
                                borderRadius: 3,
                                border: `1px solid ${theme.border}`,
                                bgcolor: mode === 'light' ? 'rgba(15,23,42,0.025)' : 'rgba(255,255,255,0.025)',
                             }}
                          >
                             <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap sx={{ mb: 1 }}>
                                <Typography sx={{ fontWeight: 950, color: theme.text, mr: 0.5 }}>
                                   Фото парсингу
                                </Typography>

                                <Button
                                   component="label"
                                   startIcon={<UploadFileRoundedIcon />}
                                  sx={{
                                     borderRadius: 3,
                                     fontWeight: 950,
                                     color: theme.text,
                                     border: `1px solid ${theme.border}`,
                                  }}
                               >
                                  Фото
                                  <input
                                     hidden
                                     type="file"
                                     accept="image/*"
                                     multiple
                                     onChange={(e) => {
                                        const files = Array.from(e.target.files || []);
                                        setManualImages((current) => {
                                           const hasMain = current.some((image) => image.isMain);
                                           const next = files.map((file, index) => ({
                                              file,
                                              origin: 'owner',
                                              isMain: !hasMain && index === 0,
                                           }));
                                           return [...current, ...next];
                                        });
                                        e.target.value = '';
                                     }}
                                  />
                                </Button>

                                <Typography sx={{ color: theme.textSoft, fontSize: 12.5 }}>
                                   {manualImages.length ? `${manualImages.length} фото` : 'Можна додати кілька фото, титулку і автора фото'}
                                </Typography>
                             </Stack>

                            {!!manualImages.length && (
                               <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                                  {manualImages.map((image, index) => (
                                     <Box
                                        key={`${image.file?.name || 'image'}-${index}`}
                                        sx={{
                                           width: 138,
                                           p: 0.7,
                                           borderRadius: 2,
                                           border: `1px solid ${image.isMain ? theme.accent : theme.border}`,
                                           bgcolor: mode === 'light' ? 'rgba(124,58,237,0.035)' : 'rgba(255,255,255,0.025)',
                                        }}
                                     >
                                        <Box
                                           component="img"
                                           src={URL.createObjectURL(image.file)}
                                           alt=""
                                           sx={{
                                              width: '100%',
                                              aspectRatio: '4 / 3',
                                              objectFit: 'cover',
                                              borderRadius: 1.5,
                                              border: `1px solid ${theme.border}`,
                                              mb: 0.7,
                                           }}
                                        />

                                        <Stack spacing={0.55}>
                                           <Button
                                              onClick={() => {
                                                 setManualImages((current) => current.map((item, itemIndex) => ({
                                                    ...item,
                                                    isMain: itemIndex === index,
                                                 })));
                                              }}
                                              sx={{
                                                 minHeight: 26,
                                                 borderRadius: 2,
                                                 fontSize: 11,
                                                 fontWeight: 950,
                                                 color: image.isMain ? '#0b0b12' : theme.text,
                                                 bgcolor: image.isMain ? theme.accent : 'transparent',
                                                 border: `1px solid ${image.isMain ? 'transparent' : theme.border}`,
                                              }}
                                           >
                                              Титулка
                                           </Button>

                                           <TextField
                                              select
                                              size="small"
                                              label="Чиї фото"
                                              value={image.origin}
                                              onChange={(e) => {
                                                 setManualImages((current) => current.map((item, itemIndex) => (
                                                    itemIndex === index ? { ...item, origin: e.target.value } : item
                                                 )));
                                              }}
                                              sx={fieldSx}
                                           >
                                              <MenuItem value="owner">Власник</MenuItem>
                                              <MenuItem value="competitor">Конкурент</MenuItem>
                                              <MenuItem value="unknown">Невідомо</MenuItem>
                                           </TextField>

                                           <Button
                                              onClick={() => {
                                                 setManualImages((current) => {
                                                    const filtered = current.filter((_, itemIndex) => itemIndex !== index);
                                                    if (filtered.length && !filtered.some((item) => item.isMain)) {
                                                       filtered[0] = { ...filtered[0], isMain: true };
                                                    }
                                                    return filtered;
                                                 });
                                              }}
                                              sx={{
                                                 minHeight: 26,
                                                 borderRadius: 2,
                                                 fontSize: 11,
                                                 fontWeight: 900,
                                                 color: '#ef4444',
                                                 border: '1px solid rgba(239,68,68,0.35)',
                                              }}
                                           >
                                              Забрати
                                           </Button>
                                        </Stack>
                                     </Box>
                                  ))}
                               </Stack>
                            )}
                         </Box>
                      </Box>
                   )}

                  {createMode === 'bulk' && (
                     <Stack spacing={1.1}>
                        <Stack direction="row" spacing={0.8}>
                           <Button
                              onClick={() => setBulkFormat('json')}
                              sx={{
                                 borderRadius: 3,
                                 fontWeight: 950,
                                 color: bulkFormat === 'json' ? '#0b0b12' : theme.text,
                                 bgcolor: bulkFormat === 'json' ? theme.accent : 'transparent',
                                 border: `1px solid ${bulkFormat === 'json' ? 'transparent' : theme.border}`,
                              }}
                           >
                              JSON
                           </Button>
                           <Button
                              onClick={() => setBulkFormat('csv')}
                              sx={{
                                 borderRadius: 3,
                                 fontWeight: 950,
                                 color: bulkFormat === 'csv' ? '#0b0b12' : theme.text,
                                 bgcolor: bulkFormat === 'csv' ? theme.accent : 'transparent',
                                 border: `1px solid ${bulkFormat === 'csv' ? 'transparent' : theme.border}`,
                              }}
                           >
                              CSV
                           </Button>
                        </Stack>

                        <TextField
                           value={bulkText}
                           onChange={(e) => setBulkText(e.target.value)}
                           multiline
                           minRows={12}
                           placeholder={
                              bulkFormat === 'json'
                                 ? '[{"source":"olx","title":"1к квартира","phone":"+380...","rooms":1,"floor":9,"floors":11}]'
                                 : 'source,title,phone,rooms,floor,floors,cost,location_text\nolx,1к квартира,+380...,1,9,11,50000,Львів'
                           }
                           sx={fieldSx}
                        />
                     </Stack>
                  )}
               </Stack>
            </DialogContent>

            <DialogActions sx={{ px: 3, pb: 2 }}>
               <Button onClick={() => setOpenCreate(false)} sx={{ color: theme.textSoft }}>
                  Скасувати
               </Button>

               <Button
                  disabled={savingCreate}
                  onClick={createMode === 'manual' ? handleCreateManual : handleCreateBulk}
                  sx={{
                     borderRadius: 3,
                     fontWeight: 950,
                     color: '#0b0b12',
                     background: `linear-gradient(90deg, ${theme.accent}, ${theme.accentLight})`,
                  }}
               >
                  {createMode === 'manual' ? 'Додати' : 'Імпортувати'}
               </Button>
            </DialogActions>
          </Dialog>

          <Dialog
             open={!!editItem}
             onClose={savingEdit ? undefined : () => {
                setEditItem(null);
                setEditForm(null);
             }}
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
             <DialogTitle sx={{ fontWeight: 950 }}>
                Редагувати парсинг
             </DialogTitle>

             <DialogContent>
                {!!editForm && (
                   <Box
                      sx={{
                         display: 'grid',
                         gridTemplateColumns: { xs: '1fr', md: 'repeat(4, 1fr)' },
                         gap: 1.1,
                         mt: 0.5,
                      }}
                   >
                      <TextField select label="Джерело" value={editForm.source} onChange={(e) => setEditForm((p) => ({ ...p, source: e.target.value }))} sx={fieldSx}>
                         <MenuItem value="olx">OLX</MenuItem>
                         <MenuItem value="dimria">DIM.RIA</MenuItem>
                         <MenuItem value="rieltor">RIELTOR.UA</MenuItem>
                         <MenuItem value="lun">LUN</MenuItem>
                         <MenuItem value="telegram">Telegram</MenuItem>
                         <MenuItem value="facebook">Facebook</MenuItem>
                         <MenuItem value="tiktok">TikTok</MenuItem>
                         <MenuItem value="reamak">Reamak</MenuItem>
                         <MenuItem value="other">Інше</MenuItem>
                      </TextField>

                      <TextField label="ID на джерелі" value={editForm.sourceId} onChange={(e) => setEditForm((p) => ({ ...p, sourceId: e.target.value }))} sx={fieldSx} />

                      <TextField select label="Стан посилання" value={editForm.sourceStatus} onChange={(e) => setEditForm((p) => ({ ...p, sourceStatus: e.target.value }))} sx={fieldSx}>
                         {SOURCE_STATUS_OPTIONS.map(([value, label]) => (
                            <MenuItem key={value} value={value}>{label}</MenuItem>
                         ))}
                      </TextField>

                      <TextField select label="Тип контакту" value={editForm.contactType} onChange={(e) => setEditForm((p) => ({ ...p, contactType: e.target.value }))} sx={fieldSx}>
                         {CONTACT_KIND_OPTIONS.map(([value, label]) => (
                            <MenuItem key={value} value={value}>{label}</MenuItem>
                         ))}
                      </TextField>

                      <TextField label="Посилання" value={editForm.sourceUrl} onChange={(e) => setEditForm((p) => ({ ...p, sourceUrl: e.target.value }))} sx={{ ...fieldSx, gridColumn: { xs: 'auto', md: 'span 4' } }} />

                      <TextField label="Телефон" value={editForm.phone} onChange={(e) => setEditForm((p) => ({ ...p, phone: e.target.value }))} sx={fieldSx} />
                      <TextField label="Контакт" value={editForm.leadname} onChange={(e) => setEditForm((p) => ({ ...p, leadname: e.target.value }))} sx={fieldSx} />
                      <TextField label="Email / месенджер" value={editForm.email} onChange={(e) => setEditForm((p) => ({ ...p, email: e.target.value }))} sx={fieldSx} />
                      <TextField label="Ціна" value={editForm.cost} onChange={(e) => setEditForm((p) => ({ ...p, cost: e.target.value }))} sx={fieldSx} />

                      <TextField select label="Тип обʼєкта" value={editForm.type_estate} onChange={(e) => setEditForm((p) => ({ ...p, type_estate: e.target.value }))} sx={fieldSx}>
                         <MenuItem value="">Не вказано</MenuItem>
                         <MenuItem value="квартира">Квартира</MenuItem>
                         <MenuItem value="будинок">Будинок</MenuItem>
                         <MenuItem value="земля">Земля</MenuItem>
                         <MenuItem value="комерція">Комерція</MenuItem>
                      </TextField>
                      <TextField select label="Угода" value={editForm.type_deal} onChange={(e) => setEditForm((p) => ({ ...p, type_deal: e.target.value }))} sx={fieldSx}>
                         <MenuItem value="">Не вказано</MenuItem>
                         <MenuItem value="продаж">Продаж</MenuItem>
                         <MenuItem value="оренда">Оренда</MenuItem>
                      </TextField>
                      <TextField label="Валюта" value={editForm.currency} onChange={(e) => setEditForm((p) => ({ ...p, currency: e.target.value }))} sx={fieldSx} />
                      <TextField label="Кімн." value={editForm.rooms} onChange={(e) => setEditForm((p) => ({ ...p, rooms: e.target.value }))} sx={fieldSx} />

                      <TextField label="Назва" value={editForm.title} onChange={(e) => setEditForm((p) => ({ ...p, title: e.target.value }))} sx={{ ...fieldSx, gridColumn: { xs: 'auto', md: 'span 2' } }} />
                      <TextField label="Адреса" value={editForm.location_text} onChange={(e) => setEditForm((p) => ({ ...p, location_text: e.target.value }))} sx={{ ...fieldSx, gridColumn: { xs: 'auto', md: 'span 2' } }} />

                      <TextField label="Площа" value={editForm.square_tot} onChange={(e) => setEditForm((p) => ({ ...p, square_tot: e.target.value }))} sx={fieldSx} />
                      <TextField label="Поверх" value={editForm.floor} onChange={(e) => setEditForm((p) => ({ ...p, floor: e.target.value }))} sx={fieldSx} />
                      <TextField label="Поверховість" value={editForm.floors} onChange={(e) => setEditForm((p) => ({ ...p, floors: e.target.value }))} sx={fieldSx} />
                      <Box />

                      {[
                         ['sourcePublishedAt', 'Опубліковано'],
                         ['sourceAddedAt', 'Додано на сайт'],
                         ['sourceUpdatedAt', 'Оновлено'],
                         ['sourcePriceChangedAt', 'Зміна ціни'],
                      ].map(([key, label]) => (
                         <TextField
                            key={key}
                            label={label}
                            type="datetime-local"
                            value={editForm[key]}
                            onChange={(e) => setEditForm((p) => ({ ...p, [key]: e.target.value }))}
                            InputLabelProps={{ shrink: true }}
                            sx={fieldSx}
                         />
                      ))}

                      <Box sx={{ gridColumn: { xs: 'auto', md: 'span 4' }, p: 1.2, borderRadius: 3, border: `1px solid ${theme.border}`, bgcolor: mode === 'light' ? 'rgba(124,58,237,0.035)' : 'rgba(255,255,255,0.025)' }}>
                         <Typography sx={{ fontWeight: 950, color: theme.text, mb: 1 }}>Технічка продзвону</Typography>
                         <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(4, 1fr)' }, gap: 1 }}>
                            <TextField label="Точна адреса" value={editForm.verifiedAddressText} onChange={(e) => setEditForm((p) => ({ ...p, verifiedAddressText: e.target.value }))} sx={{ ...fieldSx, gridColumn: { xs: 'auto', md: 'span 2' } }} />
                            <TextField select label="Перевірка інформації" value={editForm.infoVerified} onChange={(e) => setEditForm((p) => ({ ...p, infoVerified: e.target.value }))} sx={fieldSx}>
                               {INFO_VERIFIED_OPTIONS.map(([value, label]) => <MenuItem key={value} value={value}>{label}</MenuItem>)}
                            </TextField>
                            <TextField select label="Лояльність до огляду" value={editForm.inspectionLoyalty} onChange={(e) => setEditForm((p) => ({ ...p, inspectionLoyalty: e.target.value }))} sx={fieldSx}>
                               {INSPECTION_LOYALTY_OPTIONS.map(([value, label]) => <MenuItem key={value} value={value}>{label}</MenuItem>)}
                            </TextField>
                            <TextField label="Гранично низька ціна" value={editForm.bottomPrice} onChange={(e) => setEditForm((p) => ({ ...p, bottomPrice: e.target.value }))} sx={fieldSx} />
                            <TextField select label="Цікавість нам" value={editForm.interestLevel} onChange={(e) => setEditForm((p) => ({ ...p, interestLevel: e.target.value }))} sx={fieldSx}>
                               <MenuItem value="">Не вказано</MenuItem>
                               {INTEREST_LEVEL_OPTIONS.map(([value, label]) => <MenuItem key={value} value={value}>{label}</MenuItem>)}
                            </TextField>
                            <TextField select label="Терміновість" value={editForm.urgencyLevel} onChange={(e) => setEditForm((p) => ({ ...p, urgencyLevel: e.target.value }))} sx={fieldSx}>
                               <MenuItem value="">Не вказано</MenuItem>
                               {URGENCY_LEVEL_OPTIONS.map(([value, label]) => <MenuItem key={value} value={value}>{label}</MenuItem>)}
                            </TextField>
                            <TextField select label="Теплість співпраці" value={editForm.cooperationWarmth} onChange={(e) => setEditForm((p) => ({ ...p, cooperationWarmth: e.target.value }))} sx={fieldSx}>
                               <MenuItem value="">Не вказано</MenuItem>
                               {COOPERATION_WARMTH_OPTIONS.map(([value, label]) => <MenuItem key={value} value={value}>{label}</MenuItem>)}
                            </TextField>
                            <TextField label="Нотатка колцентру" value={editForm.callCenterNote} onChange={(e) => setEditForm((p) => ({ ...p, callCenterNote: e.target.value }))} multiline minRows={2} sx={{ ...fieldSx, gridColumn: { xs: 'auto', md: 'span 4' } }} />
                         </Box>
                      </Box>

                      <TextField label="Опис" value={editForm.description} onChange={(e) => setEditForm((p) => ({ ...p, description: e.target.value }))} multiline minRows={4} sx={{ ...fieldSx, gridColumn: { xs: 'auto', md: 'span 4' } }} />
                   </Box>
                )}
             </DialogContent>

             <DialogActions sx={{ px: 3, pb: 2 }}>
                <Button onClick={() => { setEditItem(null); setEditForm(null); }} disabled={savingEdit} sx={{ color: theme.textSoft }}>
                   Скасувати
                </Button>
                <Button
                   onClick={handleSaveEdit}
                   disabled={savingEdit}
                   startIcon={<EditRoundedIcon />}
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

          <Dialog
             open={!!deleteItem}
             onClose={deleting ? undefined : () => setDeleteItem(null)}
             fullWidth
             maxWidth="xs"
             PaperProps={{
                sx: {
                   borderRadius: 4,
                   bgcolor: theme.bgPanel,
                   color: theme.text,
                   border: `1px solid ${theme.border}`,
                },
             }}
          >
             <DialogTitle sx={{ fontWeight: 950 }}>
                Видалити з парсингу?
             </DialogTitle>
             <DialogContent>
                <Typography sx={{ color: theme.textSoft, fontSize: 14, lineHeight: 1.55 }}>
                   Запис буде видалено разом із фото парсингу в Cloudinary. Дія ризикована і поки доступна тільки власнику.
                </Typography>
                <Typography sx={{ mt: 1, color: theme.text, fontWeight: 950 }}>
                   {deleteItem?.title || deleteItem?.location_text || deleteItem?.sourceUrl || ''}
                </Typography>
             </DialogContent>
             <DialogActions sx={{ px: 3, pb: 2 }}>
                <Button onClick={() => setDeleteItem(null)} disabled={deleting} sx={{ color: theme.textSoft }}>
                   Скасувати
                </Button>
                <Button
                   onClick={handleDeleteParsing}
                   disabled={deleting}
                   startIcon={<DeleteOutlineRoundedIcon />}
                   sx={{
                      borderRadius: 3,
                      fontWeight: 950,
                      color: '#fff',
                      bgcolor: '#dc2626',
                      '&:hover': { bgcolor: '#b91c1c' },
                   }}
                >
                   Видалити
                </Button>
             </DialogActions>
          </Dialog>

          <ParsingStatusDialog
            open={!!statusItem}
            item={statusItem}
            form={statusForm}
            onChange={setStatusForm}
            onClose={() => {
               if (savingStatus) return;
               setStatusItem(null);
               setStatusForm(null);
               setStatusError('');
               setDuplicateSearch('');
               setDuplicateCandidates([]);
            }}
            onSubmit={handleSubmitStatus}
            saving={savingStatus}
            error={statusError}
            theme={theme}
            mode={mode}
            duplicateSearch={duplicateSearch}
            duplicateCandidates={duplicateCandidates}
            duplicateLoading={duplicateLoading}
            onDuplicateSearchChange={setDuplicateSearch}
         />

         <Drawer
            anchor="right"
            open={!!historyItem}
            onClose={() => setHistoryItem(null)}
            PaperProps={{
               sx: {
                  width: { xs: '100%', sm: 520 },
                  bgcolor: theme.bgPanel,
                  color: theme.text,
                  borderLeft: `1px solid ${theme.border}`,
               },
            }}
         >
            {historyItem && (
               <Stack spacing={1.5} sx={{ p: 2.2 }}>
                  <Box minWidth={0}>
                     <Typography sx={{ fontWeight: 950, fontSize: 19 }} noWrap>
                        {historyItem.title || 'Оголошення'}
                     </Typography>
                     <Typography sx={{ color: theme.textSoft, fontSize: 13 }}>
                        {historyItem.source || 'manual'} · {historyItem.phone || 'телефон —'}
                     </Typography>
                  </Box>

                  <Divider sx={{ borderColor: theme.border }} />

                  <CommunicationTimeline
                     items={communications}
                     loading={communicationsLoading}
                     onAdd={() => {
                        setCommunicationForm(EMPTY_COMMUNICATION_FORM);
                        setOpenCommunicationDialog(true);
                     }}
                     theme={theme}
                     mode={mode}
                  />
               </Stack>
            )}
         </Drawer>

         <CommunicationDialog
            open={openCommunicationDialog}
            title="Додати комунікацію"
            value={communicationForm}
            onChange={setCommunicationForm}
            onClose={() => {
               setOpenCommunicationDialog(false);
               setCommunicationTarget(null);
            }}
            onSubmit={handleAddCommunication}
            theme={theme}
            mode={mode}
         />

         <Drawer
            anchor="right"
            open={!!selected}
            onClose={() => setSelected(null)}
            PaperProps={{
               sx: {
                  width: { xs: '100%', sm: 520 },
                  bgcolor: theme.bgPanel,
                  color: theme.text,
                  borderLeft: `1px solid ${theme.border}`,
               },
            }}
         >
            {selected && (
               <Stack spacing={1.5} sx={{ p: 2.2 }}>
                  <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between">
                     <Box minWidth={0}>
                        <Typography sx={{ fontWeight: 950, fontSize: 19 }} noWrap>
                           {selected.title || 'Оголошення'}
                        </Typography>
                        <Typography sx={{ color: theme.textSoft, fontSize: 13 }}>
                           {selected.source || 'manual'} · {formatDateTime(selected.importedAt)}
                        </Typography>
                     </Box>

                     <Chip
                        label={(STAGE_META[selected.stage] || STAGE_META.raw).label}
                        sx={{
                           fontWeight: 950,
                           color: (STAGE_META[selected.stage] || STAGE_META.raw).color,
                           bgcolor: `${(STAGE_META[selected.stage] || STAGE_META.raw).color}18`,
                        }}
                     />
                  </Stack>

                  <Divider sx={{ borderColor: theme.border }} />

                  <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                     <Chip label={getAddress(selected)} />
                     <Chip label={selected.rooms ? `${selected.rooms} кімн.` : 'Кімн. —'} />
                     <Chip label={selected.floor || selected.floors ? `${selected.floor || '-'}/${selected.floors || '-'}` : 'Поверх —'} />
                     <Chip label={selected.square_tot ? `${selected.square_tot} м²` : 'Площа —'} />
                     <Chip label={selected.cost ? `${Number(selected.cost).toLocaleString('uk-UA')} ${selected.currency || ''}` : 'Ціна —'} />
                  </Stack>

                  <Box
                     sx={{
                        p: 1,
                        borderRadius: 2.5,
                        border: `1px solid ${theme.border}`,
                        bgcolor: mode === 'light' ? 'rgba(124,58,237,0.035)' : 'rgba(255,255,255,0.025)',
                     }}
                  >
                     <Stack direction="row" spacing={0.8} alignItems="center" flexWrap="wrap" useFlexGap>
                        <Typography sx={{ color: theme.text, fontWeight: 950, fontSize: 13 }}>
                           Джерело:
                        </Typography>

                        {selected.sourceUrl ? (
                           <Button
                              component="a"
                              href={selected.sourceUrl}
                              target="_blank"
                              sx={{ borderRadius: 2.5, fontWeight: 950, color: theme.text, border: `1px solid ${theme.border}` }}
                           >
                              {selected.source || 'відкрити'}
                           </Button>
                        ) : (
                           <Chip label="нема ссилки" size="small" />
                        )}

                        {['unknown', 'active', 'inactive', 'removed'].map((status) => (
                           <Button
                              key={status}
                              onClick={() => patchItem(selected, { sourceStatus: status, sourceCheckedAt: new Date().toISOString() })}
                              sx={{
                                 minHeight: 30,
                                 borderRadius: 2,
                                 fontWeight: 900,
                                 fontSize: 12,
                                 color: selected.sourceStatus === status || (!selected.sourceStatus && status === 'unknown') ? '#0b0b12' : theme.text,
                                 bgcolor: selected.sourceStatus === status || (!selected.sourceStatus && status === 'unknown') ? theme.accent : 'transparent',
                                 border: `1px solid ${theme.border}`,
                              }}
                           >
                              {getSourceStatusLabel(status)}
                           </Button>
                        ))}
                     </Stack>
                  </Box>

                  <Stack direction="row" spacing={0.7} flexWrap="wrap" useFlexGap>
                     {getDateChips(selected).map((item) => (
                        <Chip
                           key={item.label}
                           label={`${item.label}: ${item.value}`}
                           size="small"
                           sx={{
                              height: 24,
                              borderRadius: 1.5,
                              color: theme.textSoft,
                              bgcolor: mode === 'light' ? 'rgba(124,58,237,0.04)' : 'rgba(255,255,255,0.035)',
                              border: `1px solid ${theme.border}`,
                           }}
                        />
                     ))}
                  </Stack>

                  <Stack spacing={0.65}>
                     <Typography sx={{ color: theme.text, fontWeight: 950 }}>Контакт</Typography>
                     <Typography sx={{ color: theme.textSoft, fontSize: 14 }}>
                        {selected.leadname || 'Імʼя —'} · {selected.phone || 'Телефон —'} · {selected.email || 'Email —'}
                     </Typography>
                  </Stack>

                  {!!selected.phone && (
                     <Box
                        sx={{
                           p: 1.2,
                           borderRadius: 2.5,
                           border: `1px solid ${theme.border}`,
                           bgcolor: mode === 'light' ? 'rgba(124,58,237,0.035)' : 'rgba(255,255,255,0.025)',
                        }}
                     >
                        <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between" sx={{ mb: 0.9 }}>
                           <Typography sx={{ color: theme.text, fontWeight: 950 }}>
                              Аналітика номера
                           </Typography>

                           <Chip
                              label={getPhoneIntelLabel(selected.phoneIntel)}
                              size="small"
                              sx={{
                                 height: 24,
                                 fontWeight: 950,
                                 color:
                                    selected.phoneIntel?.suggestedKind === 'owner'
                                       ? '#22c55e'
                                       : selected.phoneIntel?.suggestedKind === 'realtor' || selected.phoneIntel?.suggestedKind === 'suspected_realtor'
                                          ? '#f97316'
                                          : theme.textSoft,
                                 bgcolor: theme.hover,
                              }}
                           />
                        </Stack>

                        <Stack direction="row" spacing={0.8} flexWrap="wrap" useFlexGap>
                           <Chip label={`Всього: ${selected.phoneIntel?.total || selected.phoneCount || 1}`} size="small" />
                           <Chip label={`Парсинг: ${selected.phoneIntel?.parsingCount || 0}`} size="small" />
                           <Chip label={`Обʼєкти: ${selected.phoneIntel?.objectsCount || 0}`} size="small" />
                           <Chip label={`Впевненість: ${selected.phoneIntel?.confidence || 'low'}`} size="small" />
                        </Stack>

                        {!!selected.phoneIntel?.relatedParsing?.length && (
                           <Stack spacing={0.35} sx={{ mt: 1 }}>
                              <Typography sx={{ color: theme.textSoft, fontSize: 12, fontWeight: 900 }}>
                                 Повʼязані оголошення
                              </Typography>
                              {selected.phoneIntel.relatedParsing.slice(0, 4).map((item) => (
                                 <Typography key={item._id} sx={{ color: theme.textSoft, fontSize: 12 }} noWrap>
                                    {item.source || 'джерело'} · {item.title || 'Без назви'} · {item.stage || 'статус'}
                                 </Typography>
                              ))}
                           </Stack>
                        )}

                        {!!selected.phoneIntel?.relatedObjects?.length && (
                           <Stack spacing={0.35} sx={{ mt: 1 }}>
                              <Typography sx={{ color: theme.textSoft, fontSize: 12, fontWeight: 900 }}>
                                 Повʼязані обʼєкти
                              </Typography>
                              {selected.phoneIntel.relatedObjects.slice(0, 4).map((item) => (
                                 <Typography key={item._id} sx={{ color: theme.textSoft, fontSize: 12 }} noWrap>
                                    {item.title || 'Без назви'} · {item.ownerName || 'власник'} · {item.actualityGroup || 'статус'}
                                 </Typography>
                              ))}
                           </Stack>
                        )}
                     </Box>
                  )}

                  {(selected.duplicatePropertyId || selected.stage === 'duplicate') && (
                     <Box
                        sx={{
                           p: 1.2,
                           borderRadius: 2.5,
                           border: `1px solid ${theme.border}`,
                           bgcolor: mode === 'light' ? 'rgba(239,68,68,0.045)' : 'rgba(239,68,68,0.07)',
                        }}
                     >
                        <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between">
                           <Box minWidth={0}>
                              <Typography sx={{ color: theme.text, fontWeight: 950 }}>
                                 Привʼязка дубля
                              </Typography>
                              <Typography sx={{ color: theme.textSoft, fontSize: 13 }} noWrap>
                                 {selected.duplicatePropertyId?.title || selected.duplicatePropertyId?.location_text || 'Наш обʼєкт у базі ще не вибраний'}
                              </Typography>
                           </Box>

                           {selected.duplicatePropertyId?._id && (
                              <Button
                                 component="a"
                                 href={`/crm/objects3?property=${selected.duplicatePropertyId._id}`}
                                 target="_blank"
                                 sx={{
                                    borderRadius: 2.5,
                                    fontWeight: 950,
                                    color: theme.text,
                                    border: `1px solid ${theme.border}`,
                                    whiteSpace: 'nowrap',
                                 }}
                              >
                                 Відкрити
                              </Button>
                           )}
                        </Stack>
                     </Box>
                  )}

                  <Stack spacing={0.65}>
                     <Typography sx={{ color: theme.text, fontWeight: 950 }}>Опис</Typography>
                     <Typography sx={{ color: theme.textSoft, fontSize: 14, lineHeight: 1.65, whiteSpace: 'pre-wrap' }}>
                        {selected.description || 'Опису немає'}
                     </Typography>
                  </Stack>

                  <TextField
                     label="Результат дзвінка"
                     value={draft.callResult}
                     onChange={(e) => setDraft((p) => ({ ...p, callResult: e.target.value }))}
                     fullWidth
                     multiline
                     minRows={3}
                     sx={fieldSx}
                  />

                  <TextField
                     label="Нотатка перевірки"
                     value={draft.reviewNote}
                     onChange={(e) => setDraft((p) => ({ ...p, reviewNote: e.target.value }))}
                     fullWidth
                     multiline
                     minRows={3}
                     sx={fieldSx}
                  />

                  <Stack direction="row" spacing={0.8} flexWrap="wrap" useFlexGap>
                     <Button
                        startIcon={<CallRoundedIcon />}
                        onClick={handleSaveCall}
                        sx={{ borderRadius: 3, fontWeight: 950, color: theme.text, border: `1px solid ${theme.border}` }}
                     >
                        Зберегти продзвін
                     </Button>
                     <Button
                        startIcon={<DoneAllRoundedIcon />}
                        onClick={() => handleStage(selected, 'qualified')}
                        sx={{ borderRadius: 3, fontWeight: 950, color: '#0b0b12', bgcolor: '#22c55e' }}
                     >
                        В базу ринку
                     </Button>
                     <Button
                        startIcon={<HomeWorkRoundedIcon />}
                        onClick={() => handleMove(selected)}
                        sx={{
                           borderRadius: 3,
                           fontWeight: 950,
                           color: '#0b0b12',
                           background: `linear-gradient(90deg, ${theme.accent}, ${theme.accentLight})`,
                        }}
                     >
                        В обʼєкти
                     </Button>
                  </Stack>
               </Stack>
            )}
         </Drawer>
      </Box>
   );
}
