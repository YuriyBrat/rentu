'use client';

import { useEffect, useMemo, useState } from 'react';
import {
   Box,
   Stack,
   Typography,
   TextField,
   InputAdornment,
   Grid,
   Button,
   MenuItem,
   Select,
   FormControl,
   InputLabel,
   Paper
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

import NavodkaRowCard from './components/NavodkaRowCard';
import NavodkaFormDialog from './components/NavodkaFormDialog';
import NavodkaNoteDialog from './components/NavodkaNoteDialog';

function isOverdue(dateStr) {
   if (!dateStr) return false;
   const today = new Date();
   today.setHours(0, 0, 0, 0);

   const date = new Date(dateStr);
   date.setHours(0, 0, 0, 0);

   return date < today;
}

function isToday(dateStr) {
   if (!dateStr) return false;
   const today = new Date();
   const date = new Date(dateStr);

   return (
      today.getFullYear() === date.getFullYear() &&
      today.getMonth() === date.getMonth() &&
      today.getDate() === date.getDate()
   );
}

export default function NavodkyPage() {
   const [items, setItems] = useState([]);
   const [loading, setLoading] = useState(false);
   const [openCreate, setOpenCreate] = useState(false);

   const [search, setSearch] = useState('');
   const [status, setStatus] = useState('all');
   const [contactFilter, setContactFilter] = useState('all');

   const [openNote, setOpenNote] = useState(false);
   const [selectedItem, setSelectedItem] = useState(null);

   const loadItems = async () => {
      try {
         setLoading(true);

         const sp = new URLSearchParams({
            q: search,
            status,
            contactFilter,
            page: '1',
            pageSize: '50'
         });

         const res = await fetch(`/api/crm/navodky?${sp.toString()}`);
         const data = await res.json();

         if (!res.ok) {
            throw new Error(data?.error || 'Помилка завантаження');
         }

         setItems(data.items || []);
      } catch (error) {
         console.error(error);
      } finally {
         setLoading(false);
      }
   };

   const handleOpenNote = (item) => {
      setSelectedItem(item);
      setOpenNote(true);
   };

   useEffect(() => {
      loadItems();
   }, []);

   useEffect(() => {
      const t = setTimeout(() => {
         loadItems();
      }, 250);

      return () => clearTimeout(t);
   }, [search, status, contactFilter]);

   const stats = useMemo(() => {
      return {
         total: items.length,
         today: items.filter(x => isToday(x.nextContactAt)).length,
         overdue: items.filter(x => isOverdue(x.nextContactAt)).length,
         active: items.filter(x => x.status === 'active' || x.status === 'contact').length
      };
   }, [items]);

   const inputDarkSx = {
      '& .MuiOutlinedInput-root': {
         borderRadius: 3,
         bgcolor: 'rgba(255,255,255,0.04)',
         color: '#f8fafc',
         '& fieldset': {
            borderColor: 'rgba(255,255,255,0.08)'
         },
         '&:hover fieldset': {
            borderColor: 'rgba(255,255,255,0.16)'
         }
      },
      '& .MuiInputLabel-root': {
         color: '#94a3b8'
      },
      '& .MuiInputBase-input': {
         color: '#f8fafc'
      }
   };

   return (
      <Box sx={{ p: { xs: 2, md: 3 } }}>
         <Stack spacing={2.2}>
            <Stack
               direction={{ xs: 'column', md: 'row' }}
               justifyContent="space-between"
               alignItems={{ xs: 'flex-start', md: 'center' }}
               spacing={2}
            >
               <Box>
                  <Typography
                     sx={{
                        fontSize: { xs: 28, md: 34 },
                        fontWeight: 900,
                        color: '#f8fafc',
                        lineHeight: 1.1
                     }}
                  >
                     Наводки
                  </Typography>
                  <Typography sx={{ color: '#94a3b8', mt: 0.6 }}>
                     Потенційні майбутні об’єкти, які треба тримати на контакті
                  </Typography>
               </Box>

               <Button
                  variant="contained"
                  size="large"
                  onClick={() => setOpenCreate(true)}
                  sx={{
                     borderRadius: 3,
                     px: 2.4,
                     fontWeight: 800
                  }}
               >
                  + Додати наводку
               </Button>
            </Stack>

            <Grid container spacing={1.5}>
               {[
                  { label: 'Всього', value: stats.total },
                  { label: 'Дзвонити сьогодні', value: stats.today },
                  { label: 'Прострочені', value: stats.overdue, color: '#ff8b8b' },
                  { label: 'Активні / на контакті', value: stats.active }
               ].map((item, idx) => (
                  <Grid item xs={6} md={3} key={idx}>
                     <Paper
                        sx={{
                           p: 1.6,
                           borderRadius: 3,
                           bgcolor: '#111827',
                           border: '1px solid rgba(255,255,255,0.07)',
                           boxShadow: '0 8px 24px rgba(0,0,0,0.18)'
                        }}
                     >
                        <Typography sx={{ color: '#94a3b8', fontSize: 13 }}>
                           {item.label}
                        </Typography>
                        <Typography
                           sx={{
                              mt: 0.4,
                              fontSize: 28,
                              fontWeight: 900,
                              color: item.color || '#f8fafc'
                           }}
                        >
                           {item.value}
                        </Typography>
                     </Paper>
                  </Grid>
               ))}
            </Grid>

            <Paper
               sx={{
                  p: 1.6,
                  borderRadius: 4,
                  bgcolor: '#111827',
                  border: '1px solid rgba(255,255,255,0.07)'
               }}
            >
               <Grid container spacing={1.5}>
                  <Grid item xs={12} md={6}>
                     <TextField
                        fullWidth
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Пошук по назві, власнику, телефону, району..."
                        InputProps={{
                           startAdornment: (
                              <InputAdornment position="start">
                                 <SearchIcon sx={{ color: '#94a3b8' }} />
                              </InputAdornment>
                           )
                        }}
                        sx={inputDarkSx}
                     />
                  </Grid>

                  <Grid item xs={12} sm={6} md={3}>
                     <FormControl fullWidth sx={inputDarkSx}>
                        <InputLabel>Статус</InputLabel>
                        <Select
                           value={status}
                           label="Статус"
                           onChange={e => setStatus(e.target.value)}
                           MenuProps={{
                              PaperProps: {
                                 sx: {
                                    bgcolor: '#0f172a',
                                    color: '#f8fafc',
                                    border: '1px solid rgba(255,255,255,0.08)'
                                 }
                              }
                           }}
                        >
                           <MenuItem value="all">Усі</MenuItem>
                           <MenuItem value="active">Активна</MenuItem>
                           <MenuItem value="contact">На контакті</MenuItem>
                           <MenuItem value="waiting">Чекати</MenuItem>
                           <MenuItem value="converted">Конвертована</MenuItem>
                           <MenuItem value="lost">Втрачена</MenuItem>
                        </Select>
                     </FormControl>
                  </Grid>

                  <Grid item xs={12} sm={6} md={3}>
                     <FormControl fullWidth sx={inputDarkSx}>
                        <InputLabel>Контакт</InputLabel>
                        <Select
                           value={contactFilter}
                           label="Контакт"
                           onChange={e => setContactFilter(e.target.value)}
                           MenuProps={{
                              PaperProps: {
                                 sx: {
                                    bgcolor: '#0f172a',
                                    color: '#f8fafc',
                                    border: '1px solid rgba(255,255,255,0.08)'
                                 }
                              }
                           }}
                        >
                           <MenuItem value="all">Усі</MenuItem>
                           <MenuItem value="today">Дзвонити сьогодні</MenuItem>
                           <MenuItem value="overdue">Прострочені</MenuItem>
                           <MenuItem value="planned">Заплановані далі</MenuItem>
                        </Select>
                     </FormControl>
                  </Grid>
               </Grid>
            </Paper>

            <Stack spacing={1.4}>
               {loading ? (
                  <Paper
                     sx={{
                        p: 3,
                        borderRadius: 4,
                        bgcolor: '#111827',
                        border: '1px solid rgba(255,255,255,0.07)'
                     }}
                  >
                     <Typography sx={{ color: '#94a3b8' }}>Завантаження...</Typography>
                  </Paper>
               ) : items.length ? (
                  items.map(item => (
                     <NavodkaRowCard
                        key={item._id}
                        item={item}
                        onCreateNote={(row) => handleOpenNote(row)}
                        onConvert={(row) => console.log('convert', row)}
                        onCall={(row) => window.open(`tel:${row.phone}`)}
                     />
                  ))
               ) : (
                  <Paper
                     sx={{
                        p: 4,
                        borderRadius: 4,
                        textAlign: 'center',
                        bgcolor: '#111827',
                        border: '1px solid rgba(255,255,255,0.07)'
                     }}
                  >
                     <Typography sx={{ fontSize: 22, fontWeight: 900, color: '#f8fafc' }}>
                        Поки немає наводок
                     </Typography>
                     <Typography sx={{ color: '#94a3b8', mt: 1 }}>
                        Додай першу наводку і починай вести майбутні об’єкти
                     </Typography>
                  </Paper>
               )}
            </Stack>
         </Stack>

         <NavodkaFormDialog
            open={openCreate}
            onClose={() => setOpenCreate(false)}
            onCreated={() => loadItems()}
         />


         <NavodkaNoteDialog
            open={openNote}
            onClose={() => {
               setOpenNote(false);
               setSelectedItem(null);
            }}
            item={selectedItem}
            onCreated={() => loadItems()}
         />
      </Box>
   );
}