'use client';

import { useEffect, useMemo, useState } from 'react';
import {
   Box,
   Typography,
   Button,
   IconButton,
   Tooltip,
   TextField,
   Stack,
   Grid,
   Dialog,
   DialogTitle,
   DialogContent,
   DialogActions,
   Alert,
   MenuItem,
   Popover,
} from '@mui/material';

import { useCRMTheme } from '@/app/(crm)/crm/context/CRMThemeContext';
import useCurrentUser from '@/utils/useCurrentUser';

import AddIcon from '@mui/icons-material/Add';
import CampaignRoundedIcon from '@mui/icons-material/CampaignRounded';
import VisibilityOffRoundedIcon from '@mui/icons-material/VisibilityOffRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import LockRoundedIcon from '@mui/icons-material/LockRounded';
import AccountTreeRoundedIcon from '@mui/icons-material/AccountTreeRounded';
import PersonRoundedIcon from '@mui/icons-material/PersonRounded';
import MapsHomeWorkRoundedIcon from '@mui/icons-material/MapsHomeWorkRounded';
import TrendingUpRoundedIcon from '@mui/icons-material/TrendingUpRounded';
import HeartBrokenRoundedIcon from '@mui/icons-material/HeartBrokenRounded';
import GavelRoundedIcon from '@mui/icons-material/GavelRounded';
import FilterAltOffRoundedIcon from '@mui/icons-material/FilterAltOffRounded';

import CreatePropertyDialog from '@/crm_components/CreatePropertyDialog';

// import PropertyCard from '@/crm_components/PropertyCard4';
import ObjectWorkRowCard from './ObjectWorkRowCard2';

import EditPropertyDialog from '@/crm_components/EditPropertyDialog';
import { createProperty, updateProperty } from '@/utils/crm/propertyApi';

const MAX_FILES = 25;

const friendlyObjectError = (title, error) => {
   const status = Number(error?.status || 0);
   const rawMessage = String(error?.message || '').trim();
   const isAccessError = status === 401 || status === 403 || ['Unauthorized', 'Forbidden', 'forbidden'].includes(rawMessage);

   if (isAccessError) {
      return {
         title: 'Немає доступу до об’єкта',
         message: 'Цей об’єкт закріплений за іншим працівником. Редагувати або видаляти його може відповідальний, той хто вніс об’єкт, керівник вище по ієрархії або адміністратор.',
         details: '',
         kind: 'access',
      };
   }

   return {
      title,
      message: rawMessage || 'Щось пішло не так. Спробуй ще раз або онови сторінку.',
      details: '',
      kind: 'error',
   };
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
   '& .MuiInputLabel-root': {
      color: theme.textSoft,
   },
   '& .MuiInputBase-input': {
      color: `${theme.text} !important`,
      WebkitTextFillColor: theme.text,
   },
   '& textarea': {
      color: `${theme.text} !important`,
      WebkitTextFillColor: theme.text,
   },
   '& .MuiSelect-icon': {
      color: theme.text,
   },
});

const employeeName = (employee = {}) => (
   employee.fullName ||
   [employee.surname, employee.name].filter(Boolean).join(' ') ||
   employee.name ||
   'Працівник'
);

const buildEmployeeTree = (employees = []) => {
   const byId = new Map(employees.map((employee) => [String(employee._id), { ...employee, children: [] }]));
   const roots = [];

   byId.forEach((employee) => {
      const managerId = String(employee.manager?._id || employee.manager || '');
      const manager = managerId ? byId.get(managerId) : null;

      if (manager) {
         manager.children.push(employee);
      } else {
         roots.push(employee);
      }
   });

   const sortTree = (items) => items
      .sort((a, b) => employeeName(a).localeCompare(employeeName(b), 'uk'))
      .map((employee) => ({
         ...employee,
         children: sortTree(employee.children || []),
      }));

   return sortTree(roots);
};

const collectEmployeeIds = (employee) => {
   const ids = [String(employee?._id || '')].filter(Boolean);
   (employee?.children || []).forEach((child) => {
      ids.push(...collectEmployeeIds(child));
   });
   return ids;
};

function ObjectStatsHeader({ summary, theme, mode }) {
   const total = summary?.total ?? 0;
   const normalizeCurrency = (value = '') => {
      const raw = String(value || '').trim().toLowerCase();
      if (!raw || raw.includes('usd') || raw.includes('$') || raw.includes('дол')) return 'USD';
      if (raw.includes('eur') || raw.includes('€') || raw.includes('євр')) return 'EUR';
      if (raw.includes('uah') || raw.includes('₴') || raw.includes('грн')) return 'UAH';
      return String(value || 'USD').trim().toUpperCase();
   };
   const currencySymbol = (currency = 'USD') => (
      currency === 'USD' ? '$' : currency === 'EUR' ? '€' : currency === 'UAH' ? '₴' : currency
   );
   const portfolioValue = Array.isArray(summary?.portfolioValue) ? summary.portfolioValue : [];
   const portfolioMap = portfolioValue.reduce((map, row) => {
      const value = Number(row?.value || 0);
      if (!value) return map;
      const currency = normalizeCurrency(row?.currency);
      const prev = map.get(currency) || { currency, value: 0, count: 0 };
      prev.value += value;
      prev.count += Number(row?.count || 0);
      map.set(currency, prev);
      return map;
   }, new Map());
   const portfolioRows = Array.from(portfolioMap.values())
      .filter((row) => Number(row?.value || 0) > 0)
      .sort((a, b) => Number(b?.value || 0) - Number(a?.value || 0));
   const portfolioCount = portfolioRows.reduce((sum, row) => sum + Number(row?.count || 0), 0);
   const formatMoneyCompact = (value, currency = 'USD') => {
      const amount = Number(value || 0);
      if (!amount) return '';
      const symbol = currencySymbol(currency);
      if (amount >= 1000000) {
         return `${(amount / 1000000).toLocaleString('uk-UA', {
            minimumFractionDigits: 3,
            maximumFractionDigits: 3,
         })} млн ${symbol}`;
      }
      return `${Math.round(amount).toLocaleString('uk-UA')} ${symbol}`;
   };
   const portfolioLabel = portfolioRows
      .map((row) => formatMoneyCompact(row.value, row.currency))
      .filter(Boolean)
      .join(' + ');
   const portfolioTooltip = portfolioRows
      .map((row) => `${row.currency || 'USD'}: ${Number(row.value || 0).toLocaleString('uk-UA')} ${currencySymbol(row.currency)} · ${row.count || 0} об.`)
      .join('\n');
   const statItems = [
      {
         label: '7 днів',
         created: summary?.created7d ?? 0,
         inactive: summary?.inactive7d ?? 0,
         sold: summary?.sold7d ?? 0,
      },
      {
         label: 'Місяць',
         created: summary?.created30d ?? 0,
         inactive: summary?.inactive30d ?? 0,
         sold: summary?.sold30d ?? 0,
      },
      {
         label: '3 міс.',
         created: summary?.created90d ?? 0,
         inactive: summary?.inactive90d ?? 0,
         sold: summary?.sold90d ?? 0,
      },
   ];

   return (
      <Box
         sx={{
            mb: 1.1,
            px: { xs: 1, md: 1.2 },
            py: 0.8,
            borderRadius: 2.4,
            bgcolor: mode === 'light' ? 'rgba(255,255,255,0.78)' : 'rgba(255,255,255,0.035)',
            border: `1px solid ${theme.border}`,
            boxShadow: mode === 'light' ? '0 10px 24px rgba(15,23,42,0.06)' : `0 14px 34px ${theme.glow}`,
         }}
      >
         <Stack
            direction={{ xs: 'column', lg: 'row' }}
            spacing={0.9}
            alignItems={{ xs: 'stretch', lg: 'center' }}
            justifyContent="space-between"
         >
            <Stack direction="row" spacing={0.85} alignItems="center" sx={{ minWidth: 0 }}>
               <Box
                  sx={{
                     width: 36,
                     height: 36,
                     borderRadius: 2,
                     display: 'flex',
                     alignItems: 'center',
                     justifyContent: 'center',
                     color: '#fff',
                     bgcolor: 'linear-gradient(135deg, #7c3aed, #2563eb)',
                     background: 'linear-gradient(135deg, #7c3aed, #2563eb)',
                     boxShadow: '0 10px 22px rgba(37,99,235,0.22)',
                     flexShrink: 0,
                  }}
               >
                  <MapsHomeWorkRoundedIcon sx={{ fontSize: 21 }} />
               </Box>
                <Stack spacing={0.1} sx={{ minWidth: 0 }}>
                   <Stack direction="row" spacing={0.7} alignItems="baseline" sx={{ minWidth: 0 }}>
                      <Typography sx={{ color: theme.text, fontSize: { xs: 24, md: 28 }, fontWeight: 950, lineHeight: 1 }}>
                         {total}
                      </Typography>
                      <Typography sx={{ color: theme.textSoft, fontSize: 12, fontWeight: 900 }} noWrap>
                         об’єктів
                      </Typography>
                   </Stack>
                   {portfolioLabel && (
                      <Tooltip
                         title={
                            <Box sx={{ whiteSpace: 'pre-line', fontWeight: 800 }}>
                               {`Портфель за поточними фільтрами\n${portfolioTooltip}`}
                            </Box>
                         }
                         arrow
                      >
                         <Typography sx={{ color: mode === 'light' ? '#0f766e' : '#5eead4', fontSize: 11.5, fontWeight: 950, lineHeight: 1.1 }} noWrap>
                            портфель: {portfolioLabel}{portfolioCount ? ` · ${portfolioCount} об.` : ''}
                         </Typography>
                      </Tooltip>
                   )}
                </Stack>
             </Stack>

            <Stack
               direction="row"
               spacing={0.65}
               flexWrap="wrap"
               useFlexGap
               justifyContent={{ xs: 'flex-start', lg: 'flex-end' }}
               sx={{ minWidth: 0 }}
            >
               {statItems.map((item) => (
                  <Stack
                     key={item.label}
                     direction="row"
                     spacing={0.8}
                     alignItems="center"
                     sx={{
                        height: 34,
                        px: 1,
                        borderRadius: 2,
                        border: `1px solid ${theme.border}`,
                        bgcolor: mode === 'light' ? 'rgba(15,23,42,0.035)' : 'rgba(255,255,255,0.035)',
                     }}
                  >
                     <Typography sx={{ color: theme.textSoft, fontSize: 11, fontWeight: 950, minWidth: 42 }} noWrap>
                        {item.label}
                     </Typography>
                     <Stack direction="row" spacing={0.25} alignItems="center" sx={{ color: '#22c55e' }}>
                        <TrendingUpRoundedIcon sx={{ fontSize: 17 }} />
                        <Typography sx={{ color: '#22c55e', fontSize: 14, fontWeight: 950, lineHeight: 1 }}>
                           {item.created}
                        </Typography>
                     </Stack>
                      <Stack direction="row" spacing={0.25} alignItems="center" sx={{ color: '#fb7185' }}>
                        <HeartBrokenRoundedIcon sx={{ fontSize: 17 }} />
                        <Typography sx={{ color: '#fb7185', fontSize: 14, fontWeight: 950, lineHeight: 1 }}>
                           {item.inactive}
                        </Typography>
                      </Stack>
                      <Stack direction="row" spacing={0.25} alignItems="center" sx={{ color: '#a78bfa' }}>
                         <GavelRoundedIcon sx={{ fontSize: 17 }} />
                         <Typography sx={{ color: '#a78bfa', fontSize: 14, fontWeight: 950, lineHeight: 1 }}>
                            {item.sold}
                         </Typography>
                      </Stack>
                   </Stack>
                ))}
            </Stack>
         </Stack>
      </Box>
   );
}

export default function ObjectsPage() {
   const [openCreate, setOpenCreate] = useState(false);
   const [q, setQ] = useState('');
   const [items, setItems] = useState([]);
   const [summary, setSummary] = useState({
      total: 0,
      created7d: 0,
      created30d: 0,
      created90d: 0,
      inactive7d: 0,
      inactive30d: 0,
      inactive90d: 0,
      sold7d: 0,
      sold30d: 0,
      sold90d: 0,
      portfolioValue: [],
   });
   const [loading, setLoading] = useState(false);
   const [showAdvertisingRows, setShowAdvertisingRows] = useState(true);

   const [editingItem, setEditingItem] = useState(null);
   const [employees, setEmployees] = useState([]);
   const [employeeAnchor, setEmployeeAnchor] = useState(null);
   const [defaultsApplied, setDefaultsApplied] = useState(false);

   const { theme, mode } = useCRMTheme();
   const { user, loading: userLoading } = useCurrentUser();
   const fieldSx = getFieldSx(theme, mode);


   const [filters, setFilters] = useState({
      assignee: '',
      actualityGroup: 'active',
      type_estate: '',
      isPublic: '',
   });

   const [errorDialog, setErrorDialog] = useState({
      open: false,
      title: '',
      message: '',
      details: '',
      kind: 'error',
   });

   // const load = async (query = '') => {
   //    setLoading(true);
   //    try {
   //       // const res = await fetch(`/api/crm/properties?q=${encodeURIComponent(query)}`, { cache: 'no-store' });
   //       const res = await fetch(`/api/crm/properties?mode=sale&q=${encodeURIComponent(query)}`, { cache: 'no-store' });
   //       const data = await res.json();
   //       setItems(data.items || []);
   //    } finally {
   //       setLoading(false);
   //    }
   // };

   const load = async (query = q, nextFilters = filters) => {
      setLoading(true);

      try {
         const params = new URLSearchParams();

         params.set('mode', 'sale');
         if (nextFilters.actualityGroup && nextFilters.actualityGroup !== 'inactive') {
            params.set('crmStage', 'work');
         }

         if (query?.trim()) params.set('q', query.trim());
         if (nextFilters.assignee) params.set('assignee', nextFilters.assignee);
         if (nextFilters.actualityGroup) params.set('actualityGroup', nextFilters.actualityGroup);
         if (nextFilters.type_estate) params.set('type_estate', nextFilters.type_estate);
         if (nextFilters.isPublic) params.set('isPublic', nextFilters.isPublic);

         const res = await fetch(`/api/crm/properties?${params.toString()}`, {
            cache: 'no-store',
         });

         const text = await res.text();

         let data = null;
         try {
            data = JSON.parse(text);
         } catch {
            data = null;
         }

         if (!res.ok) {
            throw new Error(data?.error || data?.message || text || 'Не вдалося завантажити об’єкти');
         }

         setItems(data?.items || []);
         setSummary(data?.summary || {
            total: data?.total || 0,
            created7d: 0,
            created30d: 0,
            created90d: 0,
            inactive7d: 0,
            inactive30d: 0,
            inactive90d: 0,
            sold7d: 0,
            sold30d: 0,
            sold90d: 0,
            portfolioValue: [],
         });
      } catch (e) {
         console.error(e);
         showError('Не вдалося завантажити об’єкти', e);
      } finally {
         setLoading(false);
      }
   };

   const loadEmployees = async () => {
      try {
         const res = await fetch('/api/crm/employees', { cache: 'no-store' });
         if (!res.ok) throw new Error('Не вдалося завантажити працівників');

         const data = await res.json();
         setEmployees(Array.isArray(data?.items) ? data.items : []);
      } catch (e) {
         console.error(e);
         setEmployees([]);
      }
   };

   const showError = (title, error) => {
      const friendly = friendlyObjectError(title, error);
      setErrorDialog({
         open: true,
         ...friendly,
      });
   };

   const idOf = (value) => value?._id?.$oid || value?._id || value?.$oid || value || '';
   const objectIdLike = (value) => /^[a-f\d]{24}$/i.test(String(value || ''));
   const normalizeLoginValue = (value) => String(value || '').trim().toLowerCase();
   const directEmployeeId = [user?.employeeId, user?._id, user?.id]
      .map(idOf)
      .find(objectIdLike) || '';
   const fallbackEmployeeId = employees.find((employee) => {
      const userLogin = normalizeLoginValue(user?.login || user?.email || user?.name || user?.fullName);
      if (!userLogin) return false;

      const employeeValues = [
         employee.login,
         employee.name,
         employee.fullName,
         ...(Array.isArray(employee.emails) ? employee.emails : []),
         ...(Array.isArray(employee.phones) ? employee.phones.map((phone) => phone?.number || phone) : []),
      ].map(normalizeLoginValue);

      return employeeValues.includes(userLogin);
   })?._id || '';
   const currentEmployeeId = String(directEmployeeId || fallbackEmployeeId || '');

   const financialProductFromPropertyFinance = (payload = {}) => {
      const financeScore = Number(payload?.businessScore?.finance);
      if (!financeScore || Number.isNaN(financeScore)) return '';
      return financeScore === 5 ? 'OO' : 'OP';
   };

   const properties = [
      {
         _id: 1,
         title: '2-кімнатна квартира з видом на центр',
         type_estate: 'Квартира',
         type_deal: 'Продаж',
         location: { city: 'Львів', street: 'Шевченка', number: '15' },
         rooms: 2,
         square_tot: 65,
         floor: 3,
         floors: 9,
         cost: 85000,
         currency: 'USD',
         images: ['/krm/demo/flat1.jpg'],
      },
      {
         _id: 2,
         title: 'Комерційне приміщення фасадне',
         type_estate: 'Комерція',
         type_deal: 'Оренда',
         location: { city: 'Львів', street: 'Городоцька', number: '200' },
         rooms: 1,
         square_tot: 120,
         floor: 1,
         floors: 5,
         cost: 1200,
         currency: 'USD',
         images: ['/krm/demo/com1.jpg'],
      },
   ];

   useEffect(() => {
      loadEmployees();
   }, []);

   useEffect(() => {
      if (userLoading || defaultsApplied) return;
      if (user?.isFallbackAdmin && !currentEmployeeId && !employees.length) return;

      setFilters((p) => ({
         ...p,
         assignee: currentEmployeeId || '',
         actualityGroup: p.actualityGroup || 'active',
      }));
      setDefaultsApplied(true);
   }, [currentEmployeeId, defaultsApplied, employees.length, user?.isFallbackAdmin, userLoading]);

   // простий debounce
   useEffect(() => {
      if (!defaultsApplied) return undefined;
      const t = setTimeout(() => load(q), 350);
      return () => clearTimeout(t);
   }, [q, filters, defaultsApplied]);

   const employeeTree = useMemo(() => buildEmployeeTree(employees), [employees]);
   const employeeById = useMemo(
      () => new Map(employees.map((employee) => [String(employee._id), employee])),
      [employees]
   );
   const managerByEmployeeId = useMemo(
      () => new Map(employees.map((employee) => [String(employee._id), String(employee.manager?._id || employee.manager || '')])),
      [employees]
   );
   const selectedAssigneeIds = useMemo(
      () => String(filters.assignee || '').split(',').map((x) => x.trim()).filter(Boolean),
      [filters.assignee]
   );
   const assigneeFilterLabel = useMemo(() => {
      if (!selectedAssigneeIds.length) return 'Працівник: всі';
      if (selectedAssigneeIds.length === 1) {
         if (selectedAssigneeIds[0] === currentEmployeeId) return 'Мої об’єкти';
         return employeeName(employeeById.get(selectedAssigneeIds[0]));
      }

      const rootEmployee = employeeById.get(selectedAssigneeIds[0]);
      return `${employeeName(rootEmployee)} +${selectedAssigneeIds.length - 1}`;
   }, [currentEmployeeId, employeeById, selectedAssigneeIds]);

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

   const canManagePropertyItem = (item) => {
      if (!item || !currentEmployeeId) return false;
      if (user?.isFallbackAdmin || ['owner', 'admin'].includes(user?.role)) return true;

      const ownerIds = [
         idOf(item.assignee),
         idOf(item.createdByEmployee),
      ].filter(Boolean).map(String);

      return ownerIds.includes(currentEmployeeId) || ownerIds.some(isManagerAbove);
   };

   const setAssigneeFilter = (ids = []) => {
      setFilters((p) => ({
         ...p,
         assignee: ids.filter(Boolean).join(','),
      }));
      setEmployeeAnchor(null);
   };

   const renderEmployeeTree = (nodes = [], level = 0) => nodes.map((employee) => {
      const ids = collectEmployeeIds(employee);
      const isActive = selectedAssigneeIds.length === ids.length && ids.every((id) => selectedAssigneeIds.includes(id));
      const hasChildren = !!employee.children?.length;

      return (
         <Box key={employee._id}>
            <Button
               fullWidth
               onClick={() => setAssigneeFilter(ids)}
               startIcon={hasChildren ? <AccountTreeRoundedIcon /> : <PersonRoundedIcon />}
               sx={{
                  justifyContent: 'flex-start',
                  minHeight: 36,
                  pl: 1 + level * 2,
                  pr: 1,
                  borderRadius: 2,
                  color: isActive ? '#fff' : theme.text,
                  bgcolor: isActive ? 'rgba(124,58,237,0.78)' : 'transparent',
                  fontWeight: isActive ? 950 : 800,
                  textTransform: 'none',
                  '&:hover': {
                     bgcolor: isActive ? 'rgba(124,58,237,0.88)' : theme.hover,
                  },
                  '& .MuiButton-startIcon': {
                     color: hasChildren ? theme.accentLight : theme.textSoft,
                  },
               }}
            >
               <Stack direction="row" spacing={0.75} alignItems="center" sx={{ minWidth: 0, width: '100%' }}>
                  <Typography sx={{ fontSize: 13, fontWeight: 'inherit' }} noWrap>
                     {employeeName(employee)}
                  </Typography>
                  {hasChildren && (
                     <Typography sx={{ ml: 'auto !important', color: isActive ? 'rgba(255,255,255,0.78)' : theme.textSoft, fontSize: 11, fontWeight: 900 }}>
                        {ids.length}
                     </Typography>
                  )}
               </Stack>
            </Button>
            {!!employee.children?.length && renderEmployeeTree(employee.children, level + 1)}
         </Box>
      );
   });

   const fetchOriginShowing = async (originAction = {}) => {
      const sourceId = originAction.sourceOperationEvent;
      if (!sourceId || !originAction.occurredAt) return null;

      const from = new Date(`${originAction.occurredAt}T00:00:00`);
      if (Number.isNaN(from.getTime())) return null;

      const to = new Date(from);
      to.setDate(to.getDate() + 1);

      const params = new URLSearchParams();
      params.set('type', 'showing');
      params.set('pageSize', '100');
      params.set('occurredFrom', from.toISOString());
      params.set('occurredTo', to.toISOString());

      const res = await fetch(`/api/crm/operations?${params.toString()}`, { cache: 'no-store' });
      if (!res.ok) return null;

      const data = await res.json();
      return (Array.isArray(data?.items) ? data.items : []).find((item) => idOf(item) === sourceId) || null;
   };

   const markOriginShowingNewObject = async (originAction = {}, note = '', fallbackFinancialProduct = '') => {
      if (originAction.kind !== 'showing' || !originAction.sourceOperationEvent) return;

      try {
         const source = await fetchOriginShowing(originAction);
         if (!source || (source.resultObject === 'new_object' && (source.financialProduct || !fallbackFinancialProduct))) return;

         await fetch(`/api/crm/operations/${originAction.sourceOperationEvent}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
               type: source.type || 'showing',
               occurredAt: source.occurredAt,
               responsibleEmployee: idOf(source.responsibleEmployee),
               showingKind: source.showingKind || 'passive',
               financialProduct: source.financialProduct || fallbackFinancialProduct || '',
               presenceType: source.presenceType || 'me',
               shownByEmployee: idOf(source.shownByEmployee),
               facilitatedByEmployee: idOf(source.facilitatedByEmployee),
               property: idOf(source.property),
               lead: idOf(source.lead),
               propertyStage: source.propertyStage || '',
               buyerStage: source.buyerStage || '',
               objectRealtorKind: source.objectRealtorKind || 'employee',
               objectRealtorEmployee: idOf(source.objectRealtorEmployee),
               objectPartnerName: source.objectPartnerName || '',
               buyerRealtorKind: source.buyerRealtorKind || 'employee',
               buyerRealtorEmployee: idOf(source.buyerRealtorEmployee),
               buyerPartnerName: source.buyerPartnerName || '',
               resultObject: 'new_object',
               resultBuyer: source.resultBuyer || 'none',
               resultShowing: source.resultShowing || 'unclear',
               objections: source.objections || [],
               objectionArguments: source.objectionArguments || '',
               resultDescription: note || source.resultDescription || 'Після показу об’єкт взято в роботу',
            }),
         }).catch((error) => console.error('Failed to mark source showing as new object', error));
      } catch (error) {
         console.error('Failed to load source showing for new object result', error);
      }
   };


   const handleCreate = async (payload) => {
      try {
         const created = await createProperty(payload);
         const property = created?.item;
         const originAction = payload?.originAction || {};
         const inferredFinancialProduct = financialProductFromPropertyFinance(payload);

         if (property?._id && originAction.kind === 'review') {
            await fetch('/api/crm/operations', {
               method: 'POST',
               headers: { 'Content-Type': 'application/json' },
               body: JSON.stringify({
                  type: 'review',
                  occurredAt: originAction.occurredAt ? new Date(`${originAction.occurredAt}T12:00:00`).toISOString() : new Date().toISOString(),
                  responsibleEmployee: payload.assignee || payload.createdByEmployee || '',
                  financialProduct: inferredFinancialProduct,
                  property: property._id,
                  lead: '',
                  resultShowing: 'unclear',
                  resultObject: 'new_object',
                  resultBuyer: 'none',
                  objectRealtorKind: 'employee',
                  objectRealtorEmployee: payload.assignee || payload.createdByEmployee || '',
                  buyerRealtorKind: 'none',
                  resultDescription: originAction.note || 'Об’єкт взято в роботу після огляду',
                  review: {
                     result: 'new_object',
                     objectResult: 'other',
                     source: 'properties',
                     sourceLabel: 'Створено зі сторінки Об’єкти',
                     reason: '',
                     note: originAction.note || 'Об’єкт взято в роботу після огляду',
                     linkedPropertyStatus: 'об’єкт у роботі',
                  },
               }),
            }).catch((error) => console.error('Failed to create origin review event', error));
         }
         if (property?._id && originAction.kind === 'showing') {
            await markOriginShowingNewObject(originAction, originAction.note || 'Після показу об’єкт взято в роботу', inferredFinancialProduct);
         }
         setOpenCreate(false);
         await load(q);
      } catch (e) {
         console.error(e);
         // alert(e?.message || 'Помилка створення');
         showError('Не вдалося додати об’єкт', e);
      }
   };

   const handleUpdate = async (payload) => {
      if (!editingItem?._id) return;

      try {
         await updateProperty(editingItem._id, payload);
         setEditingItem(null);
         await load(q);
      } catch (e) {
         console.error(e);
         // alert(e?.message || 'Помилка оновлення');
         showError('Не вдалося оновити об’єкт', e);
      }
   };

   const handleDelete = async (property) => {
      const ok = window.confirm(`Видалити об'єкт "${property.title}"? Фото теж будуть видалені.`);
      if (!ok) return;

      try {
         const res = await fetch(`/api/crm/properties/${property._id}`, {
            method: 'DELETE',
         });

         if (!res.ok) {
            const txt = await res.text();
            const error = new Error(txt || 'Помилка видалення');
            error.status = res.status;
            throw error;
         }

         await load(q);
      } catch (e) {
         console.error(e);
         showError('Не вдалося видалити об’єкт', e);
      }
   };



   return (
      <Box>
         <ObjectStatsHeader summary={summary} theme={theme} mode={mode} />

         <Stack
            direction={{ xs: 'column', lg: 'row' }}
            spacing={1.4}
            alignItems={{ xs: 'stretch', lg: 'center' }}
            justifyContent="space-between"
            sx={{ mb: 2.2 }}
         >
            {/* LEFT */}
            <Stack
               direction="row"
               spacing={1.5}
               alignItems="center"
               flexWrap="wrap"
               sx={{ flex: 1 }}
            >
               <Typography
                  variant="h5"
                  fontWeight={950}
                  sx={{
                     color: theme.text,
                     whiteSpace: 'nowrap',
                     mr: 1,
                  }}
               >
                  Об'єкти
               </Typography>

                <Button
                   onClick={(e) => {
                      if (currentEmployeeId) {
                         setAssigneeFilter(filters.assignee === currentEmployeeId ? [] : [currentEmployeeId]);
                      } else {
                         setEmployeeAnchor(e.currentTarget);
                      }
                   }}
                   startIcon={<PersonRoundedIcon />}
                   sx={{
                      height: 40,
                      borderRadius: 3,
                      fontWeight: 950,
                      color: filters.assignee === currentEmployeeId ? '#fff' : theme.text,
                      border: filters.assignee === currentEmployeeId ? '1px solid rgba(124,58,237,0.55)' : `1px solid ${theme.border}`,
                      bgcolor: filters.assignee === currentEmployeeId ? 'rgba(124,58,237,0.72)' : 'transparent',
                      px: 1.6,
                      opacity: currentEmployeeId ? 1 : 0.65,
                      '&:hover': {
                         bgcolor: filters.assignee === currentEmployeeId ? 'rgba(124,58,237,0.86)' : theme.hover,
                      },
                   }}
                >
                   Мої
                </Button>

                <Button
                   onClick={(e) => setEmployeeAnchor(e.currentTarget)}
                   startIcon={<AccountTreeRoundedIcon />}
                   sx={{
                      height: 40,
                      borderRadius: 3,
                      fontWeight: 900,
                      color: selectedAssigneeIds.length ? theme.accentLight : theme.text,
                      border: selectedAssigneeIds.length ? '1px solid rgba(168,85,247,0.42)' : `1px solid ${theme.border}`,
                      bgcolor: selectedAssigneeIds.length ? 'rgba(124,58,237,0.10)' : 'transparent',
                      px: 1.6,
                      minWidth: 180,
                      justifyContent: 'flex-start',
                      textTransform: 'none',
                      '&:hover': { bgcolor: theme.hover, borderColor: theme.accent },
                   }}
                >
                   {assigneeFilterLabel}
                </Button>

                <Popover
                   open={!!employeeAnchor}
                   anchorEl={employeeAnchor}
                   onClose={() => setEmployeeAnchor(null)}
                   anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
                   transformOrigin={{ vertical: 'top', horizontal: 'left' }}
                   PaperProps={{
                      sx: {
                         mt: 0.8,
                         width: 320,
                         maxHeight: 430,
                         overflow: 'auto',
                         p: 1,
                         borderRadius: 3,
                         bgcolor: theme.bgPanel,
                         color: theme.text,
                         border: `1px solid ${theme.border}`,
                         boxShadow: `0 20px 55px ${theme.glow}`,
                      },
                   }}
                >
                   <Stack spacing={0.35}>
                      <Button
                         fullWidth
                         onClick={() => setAssigneeFilter([])}
                         sx={{
                            justifyContent: 'flex-start',
                            minHeight: 36,
                            borderRadius: 2,
                            color: !selectedAssigneeIds.length ? '#fff' : theme.text,
                            bgcolor: !selectedAssigneeIds.length ? 'rgba(124,58,237,0.78)' : 'transparent',
                            fontWeight: 950,
                            textTransform: 'none',
                            '&:hover': {
                               bgcolor: !selectedAssigneeIds.length ? 'rgba(124,58,237,0.88)' : theme.hover,
                            },
                         }}
                      >
                         Всі працівники
                      </Button>
                      {renderEmployeeTree(employeeTree)}
                   </Stack>
                </Popover>

               <TextField
                  select
                  size="small"
                  label="Статус"
                  value={filters.actualityGroup}
                  onChange={(e) =>
                     setFilters((p) => ({
                        ...p,
                        actualityGroup: e.target.value,
                     }))
                  }
                  sx={{
                     ...fieldSx,
                     minWidth: 160,
                  }}
               >
                  <MenuItem value="">Всі</MenuItem>
                  <MenuItem value="active">Актуальні</MenuItem>
                  <MenuItem value="paused">Зупинені</MenuItem>
                  <MenuItem value="inactive">Неактуальні</MenuItem>
               </TextField>

               <TextField
                  select
                  size="small"
                  label="Тип"
                  value={filters.type_estate}
                  onChange={(e) =>
                     setFilters((p) => ({
                        ...p,
                        type_estate: e.target.value,
                     }))
                  }
                  sx={{
                     ...fieldSx,
                     minWidth: 150,
                  }}
               >
                  <MenuItem value="">Всі</MenuItem>
                  <MenuItem value="flat">Квартира</MenuItem>
                  <MenuItem value="house">Будинок</MenuItem>
                  <MenuItem value="commerce">Комерція</MenuItem>
                  <MenuItem value="land">Ділянка</MenuItem>
               </TextField>

             </Stack>

             {/* RIGHT */}
             <TextField
                placeholder="Пошук..."
                size="small"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                sx={{
                   ...fieldSx,
                   minWidth: { xs: '100%', sm: 240 },
                   maxWidth: { xs: '100%', lg: 330 },
                   flexShrink: 0,
                   alignSelf: { xs: 'stretch', lg: 'center' },
                }}
                InputProps={{
                   startAdornment: (
                      <SearchRoundedIcon
                         sx={{
                            mr: 1,
                            opacity: 0.7,
                            color: theme.textSoft,
                         }}
                      />
                   ),
                }}
             />

             <Tooltip title="Скинути фільтри">
                <IconButton
                   onClick={() => {
                      setQ('');
                      setFilters({
                         assignee: currentEmployeeId,
                         actualityGroup: 'active',
                         type_estate: '',
                         isPublic: '',
                      });
                   }}
                   aria-label="Скинути фільтри"
                   sx={{
                      width: 42,
                      height: 42,
                      borderRadius: 3,
                      flexShrink: 0,
                      alignSelf: { xs: 'flex-start', lg: 'center' },
                      color: theme.textSoft,
                      border: `1px solid ${theme.border}`,
                      bgcolor: mode === 'light' ? 'rgba(0,0,0,0.035)' : 'rgba(255,255,255,0.035)',
                      '&:hover': {
                         color: theme.accentLight,
                         borderColor: theme.accent,
                         bgcolor: theme.hover,
                      },
                   }}
                >
                   <FilterAltOffRoundedIcon />
                </IconButton>
             </Tooltip>

             <Tooltip title={showAdvertisingRows ? 'Сховати рекламні рядки' : 'Показати рекламні рядки'}>
                <IconButton
                  onClick={() => setShowAdvertisingRows((value) => !value)}
                  aria-label={showAdvertisingRows ? 'Сховати рекламні рядки' : 'Показати рекламні рядки'}
                  sx={{
                     width: 42,
                     height: 42,
                     borderRadius: 3,
                     flexShrink: 0,
                     alignSelf: { xs: 'flex-start', lg: 'center' },
                     color: showAdvertisingRows
                        ? (mode === 'light' ? '#1d4ed8' : '#bfdbfe')
                        : theme.textSoft,
                     border: showAdvertisingRows
                        ? '1px solid rgba(59,130,246,0.38)'
                        : `1px solid ${theme.border}`,
                     bgcolor: showAdvertisingRows
                        ? (mode === 'light' ? 'rgba(59,130,246,0.12)' : 'rgba(59,130,246,0.16)')
                        : (mode === 'light' ? 'rgba(0,0,0,0.035)' : 'rgba(255,255,255,0.035)'),
                     boxShadow: showAdvertisingRows ? `0 12px 24px ${theme.glow}` : 'none',
                     '&:hover': {
                        borderColor: theme.accent,
                        bgcolor: showAdvertisingRows
                           ? (mode === 'light' ? 'rgba(59,130,246,0.18)' : 'rgba(59,130,246,0.22)')
                           : theme.hover,
                     },
                  }}
               >
                  {showAdvertisingRows ? <CampaignRoundedIcon /> : <VisibilityOffRoundedIcon />}
               </IconButton>
            </Tooltip>

            <Button
               variant="contained"
               startIcon={<AddIcon />}
               onClick={() => setOpenCreate(true)}
               sx={{
                  borderRadius: 3,
                  fontWeight: 950,
                  px: 2.2,
                  minHeight: 42,
                  whiteSpace: 'nowrap',
                  flexShrink: 0,
                  alignSelf: { xs: 'flex-start', lg: 'center' },
                  background: `linear-gradient(90deg, ${theme.accent}, ${theme.accentLight})`,
                  boxShadow: `0 14px 30px ${theme.glow}`,
               }}
            >
               Додати об'єкт
            </Button>
         </Stack>



         <Stack spacing={1.15}>
            {items.map((p) => (
               <ObjectWorkRowCard
                  key={p._id}
                  item={p}
                  onDelete={handleDelete}
                  onEdit={(item) => setEditingItem(item)}
                  onView={(item) => console.log('view', item)}
                  // onRefresh={() => load()}
                  onRefresh={() => load(q, filters)}
                  showAdvertisingRows={showAdvertisingRows}
                  canManage={canManagePropertyItem(p)}
                />
            ))}
         </Stack>



         <CreatePropertyDialog
            open={openCreate}
            onClose={() => setOpenCreate(false)}
            onSubmit={handleCreate}
            employees={employees}
         />

         {editingItem && (
            <EditPropertyDialog
               key={editingItem._id}
               open={!!editingItem}
               item={editingItem}
               employees={employees}
               onClose={() => setEditingItem(null)}
               onSubmit={handleUpdate}
            />
         )}



         <Dialog
            open={errorDialog.open}
            onClose={() => setErrorDialog((p) => ({ ...p, open: false }))}
            fullWidth
            maxWidth="sm"
            PaperProps={{
               sx: {
                  borderRadius: 4,
                  bgcolor: theme.bgPanel,
                  color: theme.text,
                   border: errorDialog.kind === 'access'
                      ? '1px solid rgba(168,85,247,0.35)'
                      : '1px solid rgba(248,113,113,0.28)',
                   boxShadow: errorDialog.kind === 'access'
                      ? '0 24px 80px rgba(109,40,217,0.22)'
                      : '0 24px 80px rgba(127,29,29,0.20)',
                },
             }}
          >
             <DialogTitle sx={{ fontWeight: 950, display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box
                   sx={{
                      width: 34,
                      height: 34,
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: errorDialog.kind === 'access' ? '#c4b5fd' : '#fecaca',
                      bgcolor: errorDialog.kind === 'access' ? 'rgba(124,58,237,0.18)' : 'rgba(239,68,68,0.16)',
                      border: errorDialog.kind === 'access' ? '1px solid rgba(196,181,253,0.36)' : '1px solid rgba(252,165,165,0.32)',
                   }}
                >
                   <LockRoundedIcon fontSize="small" />
                </Box>
                {errorDialog.title}
             </DialogTitle>

             <DialogContent>
                <Alert
                   severity={errorDialog.kind === 'access' ? 'info' : 'error'}
                   sx={{
                      borderRadius: 3,
                      bgcolor: errorDialog.kind === 'access' ? 'rgba(124,58,237,0.12)' : 'rgba(127,29,29,0.18)',
                      color: theme.text,
                      border: errorDialog.kind === 'access' ? '1px solid rgba(168,85,247,0.28)' : '1px solid rgba(248,113,113,0.28)',
                      '& .MuiAlert-icon': {
                         color: errorDialog.kind === 'access' ? '#c4b5fd' : '#f87171',
                      },
                   }}
                >
                   {errorDialog.message}
                </Alert>

               {!!errorDialog.details && (
                  <Typography sx={{ mt: 2, fontSize: 12, color: theme.textSoft, whiteSpace: 'pre-wrap' }}>
                     {errorDialog.details}
                  </Typography>
               )}
            </DialogContent>

            <DialogActions sx={{ px: 3, pb: 2 }}>
               <Button onClick={() => setErrorDialog((p) => ({ ...p, open: false }))}>
                  Закрити
               </Button>
            </DialogActions>
         </Dialog>
      </Box>
   );
}
