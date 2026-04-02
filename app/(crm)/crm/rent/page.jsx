'use client';

import { useEffect, useMemo, useState } from 'react';
import {
   Box,
   Stack,
   Typography,
   TextField,
   MenuItem,
   InputAdornment,
   CircularProgress,
   Alert,
   Chip,
} from '@mui/material';

import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import HomeWorkRoundedIcon from '@mui/icons-material/HomeWorkRounded';

import RentRowCard from '@/crm_components/rent/RentRowCard';

const STATUS_OPTIONS = [
   { value: 'all', label: 'Усі статуси' },
   { value: 'rentActual', label: 'Актуальні' },
   { value: 'rentPause', label: 'Пауза' },
   { value: 'rentRented', label: 'Здані' },
];

const TYPE_OPTIONS = [
   { value: 'all', label: 'Усі типи' },
   { value: 'flat', label: 'Квартира' },
   { value: 'house', label: 'Будинок' },
   { value: 'commerce', label: 'Комерція' },
   { value: 'land', label: 'Ділянка' },
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
      '& fieldset': {
         borderColor: 'rgba(255,255,255,0.12)',
      },
      '&:hover fieldset': {
         borderColor: 'rgba(139,92,246,0.35)',
      },
      '&.Mui-focused fieldset': {
         borderColor: 'rgba(168,85,247,0.95)',
      },
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
         '& .MuiMenuItem-root': {
            color: '#fff',
         },
         '& .MuiMenuItem-root.Mui-selected': {
            bgcolor: 'rgba(139,92,246,0.22)',
         },
      },
   },
};

export default function RentPage() {
   const [items, setItems] = useState([]);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState('');
   const [q, setQ] = useState('');
   const [status, setStatus] = useState('all');
   const [type, setType] = useState('all');

   useEffect(() => {
      let ignore = false;

      const load = async () => {
         setLoading(true);
         setError('');

         try {
            const res = await fetch('/api/crm/properties?mode=rent', {
               cache: 'no-store',
            });

            if (!res.ok) {
               throw new Error('Не вдалося завантажити базу оренди');
            }

            const data = await res.json();
            if (!ignore) {
               setItems(Array.isArray(data?.items) ? data.items : []);
            }
         } catch (e) {
            if (!ignore) setError(e?.message || 'Помилка завантаження');
         } finally {
            if (!ignore) setLoading(false);
         }
      };

      load();
      return () => {
         ignore = true;
      };
   }, []);

   const filtered = useMemo(() => {
      return items.filter((item) => {
         if (status !== 'all' && item.statusRent !== status) return false;
         if (type !== 'all' && item.type_estate !== type) return false;

         const text = [
            item.title,
            item.location_text,
            item.location?.city,
            item.location?.street,
            item.rentOptions?.adText,
            item.rentOptions?.notes,
            ...(item.owners || []).map((x) => x?.name || ''),
         ]
            .filter(Boolean)
            .join(' ')
            .toLowerCase();

         if (q.trim() && !text.includes(q.trim().toLowerCase())) return false;

         return true;
      });
   }, [items, q, status, type]);

   const counts = useMemo(() => {
      return {
         all: items.length,
         rentActual: items.filter((x) => x.statusRent === 'rentActual').length,
         rentPause: items.filter((x) => x.statusRent === 'rentPause').length,
         rentRented: items.filter((x) => x.statusRent === 'rentRented').length,
      };
   }, [items]);

   return (
      <Box
         sx={{
            minHeight: '100vh',
            bgcolor: '#0b0b12',
            px: { xs: 1.2, md: 2.2 },
            py: { xs: 1.2, md: 2 },
         }}
      >
         <Stack spacing={2}>
            <Stack
               direction={{ xs: 'column', md: 'row' }}
               alignItems={{ xs: 'flex-start', md: 'center' }}
               justifyContent="space-between"
               spacing={1.2}
            >
               <Stack spacing={0.6}>
                  <Stack direction="row" spacing={1} alignItems="center">
                     <HomeWorkRoundedIcon sx={{ color: '#c084fc' }} />
                     <Typography sx={{ color: '#fff', fontSize: 24, fontWeight: 950 }}>
                        Оренда
                     </Typography>
                  </Stack>

                  <Typography sx={{ color: 'rgba(255,255,255,0.64)', fontSize: 13 }}>
                     База орендних об&apos;єктів зі статусами, контактами та розгортанням деталей
                  </Typography>
               </Stack>

               <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                  <Chip
                     label={`Усього: ${counts.all}`}
                     sx={{
                        color: '#fff',
                        bgcolor: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(255,255,255,0.08)',
                     }}
                  />
                  <Chip
                     label={`Актуальні: ${counts.rentActual}`}
                     sx={{
                        color: '#d1fae5',
                        bgcolor: 'rgba(16,185,129,0.16)',
                        border: '1px solid rgba(16,185,129,0.28)',
                     }}
                  />
                  <Chip
                     label={`Пауза: ${counts.rentPause}`}
                     sx={{
                        color: '#fde68a',
                        bgcolor: 'rgba(245,158,11,0.14)',
                        border: '1px solid rgba(245,158,11,0.24)',
                     }}
                  />
                  <Chip
                     label={`Здані: ${counts.rentRented}`}
                     sx={{
                        color: '#ddd6fe',
                        bgcolor: 'rgba(139,92,246,0.16)',
                        border: '1px solid rgba(139,92,246,0.24)',
                     }}
                  />
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
               <TextField
                  label="Пошук"
                  placeholder="Назва, адреса, власник..."
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  fullWidth
                  sx={fieldSx}
                  InputProps={{
                     startAdornment: (
                        <InputAdornment position="start">
                           <SearchRoundedIcon sx={{ color: 'rgba(255,255,255,0.62)' }} />
                        </InputAdornment>
                     ),
                  }}
               />

               <TextField
                  select
                  label="Статус оренди"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  sx={{ minWidth: { xs: '100%', lg: 220 }, ...fieldSx }}
                  SelectProps={{ MenuProps: selectMenuProps }}
               >
                  {STATUS_OPTIONS.map((x) => (
                     <MenuItem key={x.value} value={x.value}>
                        {x.label}
                     </MenuItem>
                  ))}
               </TextField>

               <TextField
                  select
                  label="Тип"
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  sx={{ minWidth: { xs: '100%', lg: 200 }, ...fieldSx }}
                  SelectProps={{ MenuProps: selectMenuProps }}
               >
                  {TYPE_OPTIONS.map((x) => (
                     <MenuItem key={x.value} value={x.value}>
                        {x.label}
                     </MenuItem>
                  ))}
               </TextField>
            </Stack>

            {loading && (
               <Stack alignItems="center" sx={{ py: 8 }}>
                  <CircularProgress />
               </Stack>
            )}

            {!!error && <Alert severity="error">{error}</Alert>}

            {!loading && !error && filtered.length === 0 && (
               <Box
                  sx={{
                     py: 8,
                     textAlign: 'center',
                     borderRadius: 4,
                     border: '1px solid rgba(255,255,255,0.06)',
                     bgcolor: 'rgba(255,255,255,0.02)',
                  }}
               >
                  <Typography sx={{ color: '#fff', fontWeight: 800 }}>
                     Нічого не знайдено
                  </Typography>
                  <Typography sx={{ color: 'rgba(255,255,255,0.62)', mt: 0.5 }}>
                     Спробуй змінити фільтри або пошуковий запит
                  </Typography>
               </Box>
            )}

            {!loading && !error && (
               <Stack spacing={1.2}>
                  {filtered.map((item) => (
                     <RentRowCard key={item._id} item={item} />
                  ))}
               </Stack>
            )}
         </Stack>
      </Box>
   );
}