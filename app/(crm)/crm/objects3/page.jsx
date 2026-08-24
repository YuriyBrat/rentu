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
} from '@mui/material';

import { useCRMTheme } from '@/app/(crm)/crm/context/CRMThemeContext';

import AddIcon from '@mui/icons-material/Add';
import CampaignRoundedIcon from '@mui/icons-material/CampaignRounded';
import VisibilityOffRoundedIcon from '@mui/icons-material/VisibilityOffRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';

import CreatePropertyDialog from '@/crm_components/CreatePropertyDialog';

// import PropertyCard from '@/crm_components/PropertyCard4';
import ObjectWorkRowCard from './ObjectWorkRowCard2';

import EditPropertyDialog from '@/crm_components/EditPropertyDialog';
import { createProperty, updateProperty } from '@/utils/crm/propertyApi';

const MAX_FILES = 25;

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

export default function ObjectsPage() {
   const [openCreate, setOpenCreate] = useState(false);
   const [q, setQ] = useState('');
   const [items, setItems] = useState([]);
   const [loading, setLoading] = useState(false);
   const [showAdvertisingRows, setShowAdvertisingRows] = useState(true);

   const [editingItem, setEditingItem] = useState(null);
   const [employees, setEmployees] = useState([]);

   const { theme, mode } = useCRMTheme();
   const fieldSx = getFieldSx(theme, mode);


   const [filters, setFilters] = useState({
      assignee: '',
      actualityGroup: '',
      type_estate: '',
      isPublic: '',
   });

   const [errorDialog, setErrorDialog] = useState({
      open: false,
      title: '',
      message: '',
      details: '',
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
         params.set('crmStage', 'work');

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
      setErrorDialog({
         open: true,
         title,
         message: error?.message || 'Щось пішло не так',
         details: error?.details || error?.stack || '',
      });
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
      load();
      loadEmployees();
   }, []);

   // простий debounce
   useEffect(() => {
      const t = setTimeout(() => load(q), 350);
      return () => clearTimeout(t);
   }, [q, filters]);

   const idOf = (value) => value?._id || value || '';

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

   const markOriginShowingNewObject = async (originAction = {}, note = '') => {
      if (originAction.kind !== 'showing' || !originAction.sourceOperationEvent) return;

      try {
         const source = await fetchOriginShowing(originAction);
         if (!source || source.resultObject === 'new_object') return;

         await fetch(`/api/crm/operations/${originAction.sourceOperationEvent}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
               type: source.type || 'showing',
               occurredAt: source.occurredAt,
               responsibleEmployee: idOf(source.responsibleEmployee),
               showingKind: source.showingKind || 'passive',
               financialProduct: source.financialProduct || '',
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

         if (property?._id && originAction.kind === 'review') {
            await fetch('/api/crm/operations', {
               method: 'POST',
               headers: { 'Content-Type': 'application/json' },
               body: JSON.stringify({
                  type: 'review',
                  occurredAt: originAction.occurredAt ? new Date(`${originAction.occurredAt}T12:00:00`).toISOString() : new Date().toISOString(),
                  responsibleEmployee: payload.assignee || payload.createdByEmployee || '',
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
            await markOriginShowingNewObject(originAction, originAction.note || 'Після показу об’єкт взято в роботу');
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
            throw new Error(txt || 'Помилка видалення');
         }

         await load(q);
      } catch (e) {
         console.error(e);
         alert(e?.message || 'Помилка видалення');
      }
   };



   return (
      <Box>
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

               <TextField
                  placeholder="Пошук..."
                  size="small"
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  sx={{
                     ...fieldSx,
                     minWidth: 240,
                     flex: 1,
                     maxWidth: 360,
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

               <TextField
                  select
                  size="small"
                  label="Працівник"
                  value={filters.assignee}
                  onChange={(e) =>
                     setFilters((p) => ({
                        ...p,
                        assignee: e.target.value,
                     }))
                  }
                  sx={{
                     ...fieldSx,
                     minWidth: 180,
                  }}
               >
                  <MenuItem value="">Всі</MenuItem>

                  {employees.map((emp) => (
                     <MenuItem key={emp._id} value={emp._id}>
                        {emp.fullName ||
                           [emp.surname, emp.name]
                              .filter(Boolean)
                              .join(' ') ||
                           emp.name}
                     </MenuItem>
                  ))}
               </TextField>

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

               <Button
                  onClick={() => {
                     setQ('');

                     setFilters({
                        assignee: '',
                        actualityGroup: '',
                        type_estate: '',
                        isPublic: '',
                     });
                  }}
                  sx={{
                     height: 40,
                     borderRadius: 3,
                     fontWeight: 900,
                     color: theme.text,
                     border: `1px solid ${theme.border}`,
                     px: 2,
                  }}
               >
                  Скинути
               </Button>
            </Stack>

            {/* RIGHT */}
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
                  border: '1px solid rgba(248,113,113,0.28)',
               },
            }}
         >
            <DialogTitle sx={{ fontWeight: 950 }}>
               {errorDialog.title}
            </DialogTitle>

            <DialogContent>
               <Alert severity="error" sx={{ borderRadius: 3 }}>
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
