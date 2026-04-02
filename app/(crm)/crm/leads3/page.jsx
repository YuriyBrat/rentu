'use client';

import { useEffect, useMemo, useState } from 'react';
import {
   Box,
   Stack,
   Typography,
   TextField,
   InputAdornment,
   MenuItem,
   Chip,
   Button,
   Dialog,
   DialogTitle,
   DialogContent,
   CircularProgress,
   Alert,
} from '@mui/material';

import useCurrentUser from '@/utils/useCurrentUser';

import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import AddRoundedIcon from '@mui/icons-material/AddRounded';

import LeadRow from '@/crm_components/leads/LeadRow4';
import LeadForm from '@/crm_components/leads/LeadForm';

const STAGE_OPTIONS = [
   { value: 'all', label: 'Усі стадії' },
   { value: 'lead', label: 'Холодний лід' },
   { value: 'hot', label: 'Гарячий лід' },
   { value: 'ps', label: 'ПС' },
   { value: 'rs', label: 'РС' },
   { value: 'ds', label: 'ДС' },
   { value: 'zs', label: 'ЗС' },
   { value: 'pers', label: 'ПЕРС' },
];

const fieldSx = {
   '& .MuiOutlinedInput-root': {
      bgcolor: 'rgba(255,255,255,0.04)',
      borderRadius: 3,
      color: '#fff',
      minHeight: 44,
      '& input': {
         color: '#fff !important',
         WebkitTextFillColor: '#fff',
         padding: '10px 14px',
      },
      '& .MuiSelect-select': {
         color: '#fff !important',
         WebkitTextFillColor: '#fff',
         display: 'flex',
         alignItems: 'center',
         minHeight: 'auto',
         paddingTop: '10px',
         paddingBottom: '10px',
      },
      '& fieldset': { borderColor: 'rgba(255,255,255,0.12)' },
      '&:hover fieldset': { borderColor: 'rgba(139,92,246,0.35)' },
      '&.Mui-focused fieldset': { borderColor: 'rgba(168,85,247,0.95)' },
   },
   '& .MuiInputLabel-root': {
      color: 'rgba(255,255,255,0.82) !important',
      fontWeight: 700,
   },
   '& .MuiSelect-icon': {
      color: 'rgba(255,255,255,0.78)',
   },
};

const selectMenuProps = {
   PaperProps: {
      sx: {
         bgcolor: '#151521',
         color: '#fff',
         border: '1px solid rgba(255,255,255,0.08)',
         '& .MuiMenuItem-root.Mui-selected': {
            bgcolor: 'rgba(139,92,246,0.22)',
         },
      },
   },
};

export default function LeadsPage() {
   const [items, setItems] = useState([]);
   const [employees, setEmployees] = useState([]);

   const [q, setQ] = useState('');
   const [stage, setStage] = useState('all');

   const [loading, setLoading] = useState(true);
   const [employeesLoading, setEmployeesLoading] = useState(true);
   const [error, setError] = useState('');

   const [openCreate, setOpenCreate] = useState(false);

   const [filterType, setFilterType] = useState('all');
   const [assigneeFilter, setAssigneeFilter] = useState('');

   const { user } = useCurrentUser();

   const loadEmployees = async () => {
      try {
         setEmployeesLoading(true);

         const res = await fetch('/api/crm/employees', {
            cache: 'no-store',
         });

         if (!res.ok) throw new Error('Не вдалося завантажити працівників');

         const data = await res.json();
         setEmployees(Array.isArray(data?.items) ? data.items : []);
      } catch (e) {
         console.error(e);
      } finally {
         setEmployeesLoading(false);
      }
   };

   const loadLeads = async () => {
      try {
         setLoading(true);
         setError('');

         const params = new URLSearchParams();
         if (q.trim()) params.set('q', q.trim());
         if (stage !== 'all') params.set('stage', stage);

         const res = await fetch(`/api/crm/leads?${params.toString()}`, {
            cache: 'no-store',
         });

         if (!res.ok) throw new Error('Не вдалося завантажити лідів');

         const data = await res.json();
         setItems(Array.isArray(data?.items) ? data.items : []);
      } catch (e) {
         console.error(e);
         setError(e?.message || 'Помилка завантаження');
      } finally {
         setLoading(false);
      }
   };

   const handlePatched = (updatedItem) => {
      if (!updatedItem?._id) return;

      setItems((prev) =>
         prev.map((item) => (item._id === updatedItem._id ? updatedItem : item))
      );
   };

   const currentEmployeeId = user?._id || user?.employeeId || null;


   // const filteredLeads = useMemo(() => {
   //    return items.filter((item) => {
   //       const assigneeId = item.assignee?._id || item.assignee || null;

   //       if (filterType === 'mine') {
   //          return currentEmployeeId && assigneeId === currentEmployeeId;
   //       }

   //       if (filterType === 'free') {
   //          return !assigneeId;
   //       }

   //       if (filterType === 'notMine') {
   //          return assigneeId && currentEmployeeId && assigneeId !== currentEmployeeId;
   //       }

   //       if (assigneeFilter) {
   //          return assigneeId === assigneeFilter;
   //       }

   //       return true;
   //    });
   // }, [items, filterType, assigneeFilter, currentEmployeeId]);

   // const currentEmployeeId = user?._id || user?.employeeId || null;

   const filteredLeads = useMemo(() => {
      const qNorm = q.trim().toLowerCase();

      return items.filter((item) => {
         const assigneeId = item.assignee?._id || item.assignee || null;

         // 1. швидкі фільтри
         if (filterType === 'mine') {
            if (!(currentEmployeeId && assigneeId === currentEmployeeId)) return false;
         }

         if (filterType === 'free') {
            if (!!assigneeId) return false;
         }

         if (filterType === 'notMine') {
            if (!(assigneeId && currentEmployeeId && assigneeId !== currentEmployeeId)) return false;
         }

         // 2. фільтр по конкретному відповідальному
         if (assigneeFilter) {
            if (assigneeId !== assigneeFilter) return false;
         }

         // 3. локальний текстовий пошук
         if (qNorm) {
            const haystack = [
               item.name,
               item.requestSummary,
               item.sourceChannel,
               item.sourceObject,
               item.sourceNote,
               item.actualityStatus,
               item.assignee?.name,
               item.createdByEmployee?.name,
               ...(item.phones || []),
               ...(item.emails || []),
               ...(item.notes || []).map((n) => n.text),
            ]
               .filter(Boolean)
               .join(' ')
               .toLowerCase();

            if (!haystack.includes(qNorm)) return false;
         }

         // 4. локальна підстраховка по стадії
         if (stage !== 'all' && item.stage !== stage) {
            return false;
         }

         return true;
      });
   }, [items, q, stage, filterType, assigneeFilter, currentEmployeeId]);


   useEffect(() => {
      loadEmployees();
   }, []);

   useEffect(() => {
      loadLeads();
   }, [q, stage]);

   const counts = useMemo(() => {
      return {
         total: items.length,
      };
   }, [items]);

   const handleCreated = async (createdItem) => {
      setOpenCreate(false);

      if (createdItem) {
         setItems((prev) => [createdItem, ...prev]);
      }

      await loadLeads();
   };

   return (
      <Box
         sx={{
            p: { xs: 1.2, md: 2 },
            bgcolor: '#0b0b12',
            minHeight: '100vh',
         }}
      >
         <Stack spacing={2}>
            <Stack
               direction={{ xs: 'column', md: 'row' }}
               alignItems={{ xs: 'flex-start', md: 'center' }}
               justifyContent="space-between"
               spacing={1.2}
            >
               <Stack spacing={0.5}>
                  <Typography sx={{ color: '#fff', fontSize: 24, fontWeight: 950 }}>
                     Ліди / Клієнти
                  </Typography>
                  <Typography sx={{ color: 'rgba(255,255,255,0.62)', fontSize: 13 }}>
                     Таблиця вхідних лідів та клієнтів у роботі з деталями, актуальністю і нотатками
                  </Typography>
               </Stack>

               <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                  <Chip
                     label={`Усього: ${counts.total}`}
                     sx={{
                        color: '#fff',
                        bgcolor: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(255,255,255,0.08)',
                     }}
                  />

                  <Button
                     startIcon={<AddRoundedIcon />}
                     onClick={() => setOpenCreate(true)}
                     sx={{
                        borderRadius: 999,
                        // px: 1.8,
                        padding: '4px 18px',
                        // my: '0px ',
                        color: '#111',
                        fontWeight: 900,
                        background:
                           'linear-gradient(90deg, rgba(139,92,246,1), rgba(168,85,247,1))',
                        boxShadow: '0 12px 28px rgba(139,92,246,0.25)',
                        '&:hover': {
                           boxShadow: '0 16px 36px rgba(139,92,246,0.35)',
                        },
                     }}
                  >
                     Додати ліда
                  </Button>
               </Stack>
            </Stack>

            <Stack
               direction={{ xs: 'column', lg: 'row' }}
               spacing={1.2}
               sx={{
                  p: 1.2,
                  borderRadius: 4,
                  bgcolor: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.06)',
               }}
            >

               <Stack
                  direction="row"
                  spacing={1}
                  alignItems="center"
               // sx={{ minHeight: 44, flexWrap: 'wrap' }}
               >               {[
                  { value: 'all', label: 'Усі' },
                  { value: 'mine', label: 'Мої' },
                  { value: 'free', label: 'Без відповідального' },
                  { value: 'notMine', label: 'Не мої' },
               ].map((x) => (
                  <Chip
                     key={x.value}
                     label={x.label}
                     onClick={() => {
                        setFilterType(x.value);
                        setAssigneeFilter('');
                     }} sx={{
                        bgcolor:
                           filterType === x.value
                              ? 'rgba(139,92,246,0.35)'
                              : 'rgba(255,255,255,0.05)',
                        color: '#fff',
                        cursor: 'pointer',
                     }}
                  />
               ))}
               </Stack>

               <TextField
                  select
                  label="Відповідальний"
                  value={assigneeFilter}
                  onChange={(e) => {
                     setAssigneeFilter(e.target.value);
                     setFilterType('all');
                  }} sx={{ minWidth: { xs: '100%', lg: 220, }, ...fieldSx }}
                  SelectProps={{ MenuProps: selectMenuProps }}
               >
                  <MenuItem value="">—</MenuItem>

                  {employees.map((emp) => (
                     <MenuItem key={emp._id} value={emp._id}>
                        {emp.name}
                     </MenuItem>
                  ))}
               </TextField>


               <TextField
                  placeholder="Пошук по імені, заявці, джерелу, нотатках..."
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  fullWidth
                  sx={fieldSx}
                  InputProps={{
                     startAdornment: (
                        <InputAdornment position="start">
                           <SearchRoundedIcon sx={{ color: '#aaa' }} />
                        </InputAdornment>
                     ),
                  }}
               />


               <TextField
                  select
                  label="Стадія"
                  value={stage}
                  onChange={(e) => setStage(e.target.value)}
                  sx={{ minWidth: { xs: '100%', lg: 220 }, ...fieldSx }}
                  SelectProps={{ MenuProps: selectMenuProps }}
               >
                  {STAGE_OPTIONS.map((x) => (
                     <MenuItem key={x.value} value={x.value}>
                        {x.label}
                     </MenuItem>
                  ))}
               </TextField>
            </Stack>

            {!!error && <Alert severity="error">{error}</Alert>}

            {(loading || employeesLoading) && (
               <Stack alignItems="center" sx={{ py: 7 }}>
                  <CircularProgress />
               </Stack>
            )}

            {!loading && !employeesLoading && items.length === 0 && (
               <Box
                  sx={{
                     py: 8,
                     textAlign: 'center',
                     borderRadius: 4,
                     border: '1px solid rgba(255,255,255,0.06)',
                     bgcolor: 'rgba(255,255,255,0.02)',
                  }}
               >
                  <Typography sx={{ color: '#fff', fontWeight: 850 }}>
                     Поки немає лідів
                  </Typography>
                  <Typography sx={{ color: 'rgba(255,255,255,0.62)', mt: 0.5 }}>
                     Додай першого ліда і почнемо воронку
                  </Typography>
               </Box>
            )}

            {!loading && !employeesLoading && filteredLeads.length > 0 && (
               <Stack spacing={1}>
                  {/* {items.map((item) => (
                     <LeadRow key={item._id || item.id} item={item} />
                  ))} */}
                  {filteredLeads.map((item) => (
                     <LeadRow key={item._id || item.id} item={item}
                        employees={employees} onPatched={handlePatched}
                     />
                  ))}
               </Stack>
            )}
         </Stack>

         <Dialog
            open={openCreate}
            onClose={() => setOpenCreate(false)}
            maxWidth="lg"
            fullWidth
            PaperProps={{
               sx: {
                  bgcolor: '#0f0f17',
                  color: '#fff',
                  borderRadius: 4,
                  border: '1px solid rgba(255,255,255,0.08)',
               },
            }}
         >
            <DialogTitle sx={{ fontWeight: 950, pb: 1 }}>
               Додати ліда
            </DialogTitle>

            <DialogContent sx={{ pb: 2 }}>
               <LeadForm
                  employees={employees}
                  onCancel={() => setOpenCreate(false)}
                  onCreated={handleCreated}
               />
            </DialogContent>
         </Dialog>
      </Box>
   );
}