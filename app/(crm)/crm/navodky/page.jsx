'use client';

import { useMemo, useState } from 'react';
import {
   Box,
   Stack,
   Typography,
   TextField,
   InputAdornment,
   Grid,
   Card,
   CardContent,
   Chip,
   Button,
   Divider,
   IconButton,
   MenuItem,
   Select,
   FormControl,
   InputLabel,
   Avatar,
   Tooltip,
   Paper
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import PhoneIcon from '@mui/icons-material/Phone';
import EventIcon from '@mui/icons-material/Event';
import HomeWorkIcon from '@mui/icons-material/HomeWork';
import PersonIcon from '@mui/icons-material/Person';
import AddCommentIcon from '@mui/icons-material/AddComment';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import PublishedWithChangesIcon from '@mui/icons-material/PublishedWithChanges';

const noteTypeMap = {
   positive: {
      label: 'Позитивна',
      bg: 'success.main',
      color: '#fff'
   },
   negative: {
      label: 'Негативна',
      bg: 'error.main',
      color: '#fff'
   },
   info: {
      label: 'Інформуюча',
      bg: 'warning.main',
      color: '#111'
   },
   important: {
      label: 'Важлива',
      bg: 'info.main',
      color: '#fff'
   }
};

const statusMap = {
   active: { label: 'Активна', color: 'warning' },
   contact: { label: 'На контакті', color: 'info' },
   waiting: { label: 'Чекати', color: 'default' },
   converted: { label: 'Конвертована', color: 'success' },
   lost: { label: 'Втрачена', color: 'error' }
};

const readinessMap = {
   soon: 'До 1 місяця',
   q1: '1-3 місяці',
   q2: '3-6 місяців',
   later: '6+ місяців',
   unknown: 'Невідомо'
};

const demoNavodky = [
   {
      _id: '1',
      title: '2к квартира, Сихів',
      ownerName: 'Іван',
      phone: '+380671112233',
      source: 'Розклейка',
      status: 'active',
      readiness: 'q2',
      locationText: 'Львів, Сихів',
      propertyType: 'Квартира',
      priceExpectation: 'Орієнтовно 72 000$',
      nextContactAt: '2026-04-24',
      lastContactAt: '2026-04-15',
      description: 'Власник думає про продаж ближче до осені. Поки хоче просто підтримувати контакт.',
      notes: [
         {
            _id: 'n1',
            text: 'Спокійний у спілкуванні, просив набрати через 2 тижні.',
            type: 'positive',
            createdAt: '2026-04-15 11:20'
         },
         {
            _id: 'n2',
            text: 'Документи ще не перевірялися.',
            type: 'info',
            createdAt: '2026-04-15 11:25'
         }
      ]
   },
   {
      _id: '2',
      title: 'Будинок, Брюховичі',
      ownerName: 'Марія',
      phone: '+380931234567',
      source: 'Рекомендація',
      status: 'waiting',
      readiness: 'later',
      locationText: 'Брюховичі',
      propertyType: 'Будинок',
      priceExpectation: 'Ще не назвала',
      nextContactAt: '2026-05-20',
      lastContactAt: '2026-04-01',
      description: 'Можливо продаватимуть після переїзду дітей.',
      notes: [
         {
            _id: 'n3',
            text: 'Дуже обережна, не любить тиску.',
            type: 'important',
            createdAt: '2026-04-01 16:10'
         }
      ]
   },
   {
      _id: '3',
      title: '1к квартира, Франківський район',
      ownerName: 'Петро',
      phone: '+380501112244',
      source: 'Дзвінок з реклами',
      status: 'contact',
      readiness: 'soon',
      locationText: 'Львів, Франківський район',
      propertyType: 'Квартира',
      priceExpectation: 'Орієнтовно 48 000$',
      nextContactAt: '2026-04-21',
      lastContactAt: '2026-04-19',
      description: 'Власник уже тепліший, може запросити на огляд найближчим часом.',
      notes: [
         {
            _id: 'n4',
            text: 'Є шанс зайти в роботу швидко.',
            type: 'positive',
            createdAt: '2026-04-19 13:00'
         },
         {
            _id: 'n5',
            text: 'Не хоче ексклюзив одразу.',
            type: 'negative',
            createdAt: '2026-04-19 13:10'
         }
      ]
   }
];

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

function formatDate(dateStr) {
   if (!dateStr) return '—';
   return new Date(dateStr).toLocaleDateString('uk-UA');
}

function NoteChip({ note }) {
   const config = noteTypeMap[note.type] || noteTypeMap.info;

   return (
      <Box
         sx={{
            px: 1.2,
            py: 0.8,
            borderRadius: 2,
            bgcolor: config.bg,
            color: config.color,
            fontSize: 13
         }}
      >
         <Typography sx={{ fontSize: 12, fontWeight: 700, mb: 0.3 }}>
            {config.label}
         </Typography>
         <Typography sx={{ fontSize: 13, lineHeight: 1.35 }}>
            {note.text}
         </Typography>
         <Typography sx={{ fontSize: 11, opacity: 0.85, mt: 0.4 }}>
            {note.createdAt}
         </Typography>
      </Box>
   );
}

function NavodkaCard({ item }) {
   const overdue = isOverdue(item.nextContactAt);
   const today = isToday(item.nextContactAt);

   return (
      <Card
         sx={{
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            borderRadius: 3,
            border: theme =>
               overdue
                  ? `1px solid ${theme.palette.error.main}`
                  : today
                     ? `1px solid ${theme.palette.warning.main}`
                     : `1px solid ${theme.palette.divider}`,
            boxShadow: '0 8px 30px rgba(0,0,0,0.08)'
         }}
      >
         <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, flex: 1 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={1}>
               <Box>
                  <Typography variant="h6" sx={{ fontWeight: 800, lineHeight: 1.2 }}>
                     {item.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                     {item.locationText}
                  </Typography>
               </Box>

               <Chip
                  label={statusMap[item.status]?.label || item.status}
                  color={statusMap[item.status]?.color || 'default'}
                  size="small"
                  sx={{ fontWeight: 700 }}
               />
            </Stack>

            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
               <Chip size="small" icon={<HomeWorkIcon />} label={item.propertyType} />
               <Chip size="small" label={readinessMap[item.readiness] || item.readiness} />
               <Chip size="small" label={item.source} />
            </Stack>

            <Divider />

            <Stack spacing={1}>
               <Stack direction="row" spacing={1} alignItems="center">
                  <Avatar sx={{ width: 32, height: 32 }}>
                     <PersonIcon fontSize="small" />
                  </Avatar>
                  <Box>
                     <Typography sx={{ fontWeight: 700 }}>{item.ownerName}</Typography>
                     <Typography variant="body2" color="text.secondary">
                        {item.phone}
                     </Typography>
                  </Box>
               </Stack>

               <Typography variant="body2">
                  <strong>Очікування по ціні:</strong> {item.priceExpectation || '—'}
               </Typography>

               <Typography variant="body2">
                  <strong>Останній контакт:</strong> {formatDate(item.lastContactAt)}
               </Typography>

               <Typography
                  variant="body2"
                  sx={{
                     color: overdue ? 'error.main' : today ? 'warning.dark' : 'text.primary',
                     fontWeight: overdue || today ? 700 : 500
                  }}
               >
                  <strong>Наступний контакт:</strong> {formatDate(item.nextContactAt)}
                  {overdue ? ' • прострочено' : today ? ' • сьогодні' : ''}
               </Typography>

               <Typography variant="body2" color="text.secondary">
                  {item.description}
               </Typography>
            </Stack>

            <Divider />

            <Box>
               <Typography sx={{ fontWeight: 700, mb: 1 }}>Нотатки</Typography>

               <Stack spacing={1}>
                  {item.notes?.length ? (
                     item.notes.slice(0, 3).map(note => <NoteChip key={note._id} note={note} />)
                  ) : (
                     <Typography variant="body2" color="text.secondary">
                        Нотаток ще немає
                     </Typography>
                  )}
               </Stack>
            </Box>

            <Box sx={{ mt: 'auto' }}>
               <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                  <Button variant="outlined" startIcon={<OpenInNewIcon />}>
                     Відкрити
                  </Button>

                  <Button variant="outlined" startIcon={<AddCommentIcon />}>
                     Нотатка
                  </Button>

                  <Button variant="contained" startIcon={<PublishedWithChangesIcon />}>
                     В об’єкт
                  </Button>

                  <Tooltip title="Подзвонити">
                     <IconButton color="primary">
                        <PhoneIcon />
                     </IconButton>
                  </Tooltip>

                  <Tooltip title="Запланувати контакт">
                     <IconButton color="primary">
                        <EventIcon />
                     </IconButton>
                  </Tooltip>
               </Stack>
            </Box>
         </CardContent>
      </Card>
   );
}

export default function NavodkyPage() {
   const [search, setSearch] = useState('');
   const [status, setStatus] = useState('all');
   const [contactFilter, setContactFilter] = useState('all');

   const filtered = useMemo(() => {
      return demoNavodky.filter(item => {
         const searchText = [
            item.title,
            item.ownerName,
            item.phone,
            item.locationText,
            item.source,
            item.description
         ]
            .join(' ')
            .toLowerCase();

         const matchesSearch = searchText.includes(search.toLowerCase());

         const matchesStatus = status === 'all' ? true : item.status === status;

         const matchesContact =
            contactFilter === 'all'
               ? true
               : contactFilter === 'today'
                  ? isToday(item.nextContactAt)
                  : contactFilter === 'overdue'
                     ? isOverdue(item.nextContactAt)
                     : contactFilter === 'planned'
                        ? !isOverdue(item.nextContactAt) && !isToday(item.nextContactAt)
                        : true;

         return matchesSearch && matchesStatus && matchesContact;
      });
   }, [search, status, contactFilter]);

   const stats = useMemo(() => {
      return {
         total: demoNavodky.length,
         today: demoNavodky.filter(x => isToday(x.nextContactAt)).length,
         overdue: demoNavodky.filter(x => isOverdue(x.nextContactAt)).length,
         active: demoNavodky.filter(x => x.status === 'active' || x.status === 'contact').length
      };
   }, []);

   return (
      <Box sx={{ p: { xs: 2, md: 3 } }}>
         <Stack spacing={3}>
            <Stack
               direction={{ xs: 'column', md: 'row' }}
               justifyContent="space-between"
               alignItems={{ xs: 'flex-start', md: 'center' }}
               spacing={2}
            >
               <Box>
                  <Typography variant="h4" sx={{ fontWeight: 900 }}>
                     Наводки
                  </Typography>
                  <Typography color="text.secondary" sx={{ mt: 0.5 }}>
                     Потенційні об’єкти, які можуть зайти в роботу пізніше
                  </Typography>
               </Box>

               <Button variant="contained" size="large">
                  + Додати наводку
               </Button>
            </Stack>

            <Grid container spacing={2}>
               <Grid item xs={12} sm={6} md={3}>
                  <Paper sx={{ p: 2.2, borderRadius: 3 }}>
                     <Typography color="text.secondary" variant="body2">
                        Всього
                     </Typography>
                     <Typography variant="h5" sx={{ fontWeight: 900 }}>
                        {stats.total}
                     </Typography>
                  </Paper>
               </Grid>

               <Grid item xs={12} sm={6} md={3}>
                  <Paper sx={{ p: 2.2, borderRadius: 3 }}>
                     <Typography color="text.secondary" variant="body2">
                        Дзвонити сьогодні
                     </Typography>
                     <Typography variant="h5" sx={{ fontWeight: 900 }}>
                        {stats.today}
                     </Typography>
                  </Paper>
               </Grid>

               <Grid item xs={12} sm={6} md={3}>
                  <Paper sx={{ p: 2.2, borderRadius: 3 }}>
                     <Typography color="text.secondary" variant="body2">
                        Прострочені
                     </Typography>
                     <Typography variant="h5" sx={{ fontWeight: 900, color: 'error.main' }}>
                        {stats.overdue}
                     </Typography>
                  </Paper>
               </Grid>

               <Grid item xs={12} sm={6} md={3}>
                  <Paper sx={{ p: 2.2, borderRadius: 3 }}>
                     <Typography color="text.secondary" variant="body2">
                        Активні / на контакті
                     </Typography>
                     <Typography variant="h5" sx={{ fontWeight: 900 }}>
                        {stats.active}
                     </Typography>
                  </Paper>
               </Grid>
            </Grid>

            <Paper sx={{ p: 2, borderRadius: 3 }}>
               <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                     <TextField
                        fullWidth
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Пошук по назві, власнику, телефону, району..."
                        InputProps={{
                           startAdornment: (
                              <InputAdornment position="start">
                                 <SearchIcon />
                              </InputAdornment>
                           )
                        }}
                     />
                  </Grid>

                  <Grid item xs={12} sm={6} md={3}>
                     <FormControl fullWidth>
                        <InputLabel>Статус</InputLabel>
                        <Select
                           value={status}
                           label="Статус"
                           onChange={e => setStatus(e.target.value)}
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
                     <FormControl fullWidth>
                        <InputLabel>Контакт</InputLabel>
                        <Select
                           value={contactFilter}
                           label="Контакт"
                           onChange={e => setContactFilter(e.target.value)}
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

            <Grid container spacing={2}>
               {filtered.length ? (
                  filtered.map(item => (
                     <Grid item xs={12} md={6} xl={4} key={item._id}>
                        <NavodkaCard item={item} />
                     </Grid>
                  ))
               ) : (
                  <Grid item xs={12}>
                     <Paper sx={{ p: 4, borderRadius: 3, textAlign: 'center' }}>
                        <Typography variant="h6" sx={{ fontWeight: 800 }}>
                           Нічого не знайдено
                        </Typography>
                        <Typography color="text.secondary" sx={{ mt: 1 }}>
                           Спробуй змінити пошук або фільтри
                        </Typography>
                     </Paper>
                  </Grid>
               )}
            </Grid>
         </Stack>
      </Box>
   );
}