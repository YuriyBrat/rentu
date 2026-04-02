'use client';

import { useMemo, useState, useEffect } from 'react';
import {
   Box,
   Stack,
   Typography,
   TextField,
   InputAdornment,
   MenuItem,
   Chip,
   CircularProgress,
   Button,
   Dialog,
   DialogContent
} from '@mui/material';

import AddRoundedIcon from '@mui/icons-material/AddRounded';

import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import GroupsRoundedIcon from '@mui/icons-material/GroupsRounded';

import EmployeeCard from '@/crm_components/employees/EmployeeCard';
import EmployeeForm from '@/crm_components/employees/EmployeeForm';


const ROLE_OPTIONS = [
   { value: 'all', label: 'Усі ролі' },
   { value: 'owner', label: 'Засновник' },
   { value: 'admin', label: 'Адміністратор' },
   { value: 'manager', label: 'Менеджер' },
   { value: 'realtor', label: 'Рієлтор' },
   { value: 'callcenter', label: 'Оператор кол-центру' },
   { value: 'viewer', label: 'Глядач' },
];

const demoEmployees = [
   {
      _id: '1',
      name: 'Юрій Брат',
      phones: ['+380971234567', '+380501112233'],
      emails: ['yuriy@karamax.ua'],
      position: 'Рієлтор',
      role: 'owner',
      login: 'yuriy',
      avatarUrl: '',
      telegram: '@yuriy_brat',
      color: '#a78bfa',
      about: 'Веде ключових клієнтів, купівлю та складні переговори.',
      displayOrder: 1,
      careerStartAt: '2021-05-10T09:00:00',
      firedAt: '',
      isActive: true,
      notes: [
         {
            text: 'Сильно веде клієнтів по купівлі та добре закриває складні угоди.',
            type: 'positive',
            createdAt: '2026-03-28T10:20:00',
            createdByName: 'Марія',
         },
         {
            text: 'Важливо: перевантажений лідами, краще рівномірно розподіляти.',
            type: 'important',
            createdAt: '2026-03-27T18:10:00',
            createdByName: 'Олег',
         },
      ],
   },
   {
      _id: '2',
      name: 'Олег Коваль',
      phones: ['+380931234567'],
      emails: ['oleg@karamax.ua', 'oleg.work@gmail.com'],
      position: 'Менеджер',
      role: 'manager',
      login: 'oleg',
      avatarUrl: '',
      telegram: '@oleg_karamax',
      color: '#2dd4bf',
      about: 'Координує обдзвін, фільтрацію лідів та контроль актуальності.',
      displayOrder: 2,
      careerStartAt: '2022-02-15T10:00:00',
      firedAt: '',
      isActive: true,
      notes: [
         {
            text: 'Добре організовує процеси і тримає порядок у CRM.',
            type: 'positive',
            createdAt: '2026-03-28T09:40:00',
            createdByName: 'Юрій',
         },
      ],
   },
   {
      _id: '3',
      name: 'Марія Іванюк',
      phones: ['+380671234567'],
      emails: ['maria@karamax.ua'],
      position: 'Колцентр',
      role: 'callcenter',
      login: 'maria',
      avatarUrl: '',
      telegram: '',
      color: '#facc15',
      about: 'Перший контакт із лідами, кваліфікація, первинні нотатки.',
      displayOrder: 3,
      careerStartAt: '2024-09-01T09:30:00',
      firedAt: '',
      isActive: true,
      notes: [
         {
            text: 'Швидко вносить ліди, добре працює з первинною інформацією.',
            type: 'positive',
            createdAt: '2026-03-26T14:00:00',
            createdByName: 'Олег',
         },
         {
            text: 'Іноді потрібно детальніше прописувати джерело-об’єкт.',
            type: 'info',
            createdAt: '2026-03-27T12:30:00',
            createdByName: 'Юрій',
         },
      ],
   },
   {
      _id: '4',
      name: 'Ірина Мельник',
      phones: ['+380991115577'],
      emails: ['iryna@karamax.ua'],
      position: 'Рієлтор',
      role: 'realtor',
      login: 'iryna',
      avatarUrl: '',
      telegram: '@iryna_estate',
      color: '#60a5fa',
      about: 'Спеціалізується на оренді квартир та швидких підборах.',
      displayOrder: 4,
      careerStartAt: '2023-06-20T09:00:00',
      firedAt: '',
      isActive: true,
      notes: [
         {
            text: 'Сильна в оренді, добре тримає темп по показах.',
            type: 'positive',
            createdAt: '2026-03-25T16:45:00',
            createdByName: 'Юрій',
         },
         {
            text: 'Потрібно частіше оновлювати актуальність по базі оренди.',
            type: 'negative',
            createdAt: '2026-03-28T08:10:00',
            createdByName: 'Олег',
         },
      ],
   },
   {
      _id: '5',
      name: 'Степан Левицький',
      phones: ['+380661118899'],
      emails: ['stepan@karamax.ua'],
      position: 'Помічник',
      role: 'viewer',
      login: 'stepan',
      avatarUrl: '',
      telegram: '',
      color: '#fb923c',
      about: 'Допомагає зі збором інформації та супроводом об’єктів.',
      displayOrder: 5,
      careerStartAt: '2025-01-10T11:00:00',
      firedAt: '2026-02-20T18:00:00',
      isActive: false,
      notes: [
         {
            text: 'Працював акуратно, але вибув із команди.',
            type: 'info',
            createdAt: '2026-02-20T18:05:00',
            createdByName: 'Юрій',
         },
      ],
   },
];

const fieldSx = {
   '& .MuiOutlinedInput-root': {
      bgcolor: 'rgba(255,255,255,0.04)',
      borderRadius: 3,
      color: '#fff',
      minHeight: 30,
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
         paddingBottom: '8px',
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

export default function EmployeesPage() {
   const [q, setQ] = useState('');
   const [role, setRole] = useState('all');

   const [items, setItems] = useState([]);
   const [loading, setLoading] = useState(true);
   const [openCreate, setOpenCreate] = useState(false);

   const load = async () => {
      try {
         setLoading(true);

         const res = await fetch('/api/crm/employees');
         const data = await res.json();

         const dbItems = Array.isArray(data?.items) ? data.items : [];
         const arrdata = [...dbItems, ...demoEmployees];

         setItems(arrdata);
      } catch (e) {
         console.error(e);
      } finally {
         setLoading(false);
      }
   };

   useEffect(() => {
      load();
   }, []);


   const filtered = useMemo(() => {
      return [...items]
         .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0))
         .filter((item) => {
            if (role !== 'all' && item.role !== role) return false;

            const text = [
               item.name,
               item.position,
               item.role,
               item.login,
               item.telegram,
               item.about,
               ...(item.phones || []),
               ...(item.emails || []),
               ...(item.notes || []).map((x) => x.text),
            ]
               .filter(Boolean)
               .join(' ')
               .toLowerCase();

            if (q.trim() && !text.includes(q.trim().toLowerCase())) return false;

            return true;
         });
   }, [items, q, role]);

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
                  <Stack direction="row" spacing={1} alignItems="center">
                     <GroupsRoundedIcon sx={{ color: '#c084fc' }} />
                     <Typography sx={{ color: '#fff', fontSize: 24, fontWeight: 950 }}>
                        Працівники
                     </Typography>
                  </Stack>

                  <Typography sx={{ color: 'rgba(255,255,255,0.62)', fontSize: 13 }}>
                     Команда CRM: посади, доступи, контакти, нотатки та статуси
                  </Typography>
               </Stack>

               <Chip
                  label={`Усього: ${filtered.length}`}
                  sx={{
                     color: '#fff',
                     bgcolor: 'rgba(255,255,255,0.05)',
                     border: '1px solid rgba(255,255,255,0.08)',
                  }}
               />
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
               <TextField
                  placeholder="Пошук по імені, логіну, посаді, нотатках..."
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
                  label="CRM роль"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  sx={{ minWidth: { xs: '100%', lg: 220 }, ...fieldSx }}
                  SelectProps={{ MenuProps: selectMenuProps }}
               >
                  {ROLE_OPTIONS.map((x) => (
                     <MenuItem key={x.value} value={x.value}>
                        {x.label}
                     </MenuItem>
                  ))}
               </TextField>

               <Button
                  onClick={() => setOpenCreate(true)}
                  startIcon={<AddRoundedIcon />}
                  sx={{
                     borderRadius: 3,
                     padding: '10px 25px',
                     fontWeight: 900,
                     color: '#0b0b12',
                     height: 40,
                     background:
                        'linear-gradient(90deg, rgba(139,92,246,1), rgba(168,85,247,1))',
                  }}
               >
                  Додати
               </Button>
            </Stack>


            {loading ? (
               <Stack alignItems="center" sx={{ mt: 5 }}>
                  <CircularProgress />
               </Stack>
            ) : (
               <Stack spacing={1.2}>
                  {filtered.map((item) => (
                     <EmployeeCard key={item._id} item={item} />
                  ))}
               </Stack>
            )}


         </Stack>




         {/* MODAL */}
         <Dialog
            open={openCreate}
            onClose={() => setOpenCreate(false)}
            maxWidth="md"
            fullWidth
            PaperProps={{
               sx: {
                  bgcolor: '#0f0f17',
                  border: '1px solid rgba(255,255,255,0.06)',
                  borderRadius: 4,
               },
            }}
         >
            <DialogContent>
               <EmployeeForm
                  onCancel={() => setOpenCreate(false)}
                  onCreated={() => {
                     setOpenCreate(false);
                     load();
                  }}
               />
            </DialogContent>
         </Dialog>
      </Box>
   );
}