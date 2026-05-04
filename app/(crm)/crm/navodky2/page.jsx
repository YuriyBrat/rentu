'use client';

import { useMemo, useState } from 'react';
import {
   Box,
   Stack,
   Typography,
   TextField,
   InputAdornment,
   Grid,
   Chip,
   Button,
   IconButton,
   MenuItem,
   Select,
   FormControl,
   InputLabel,
   Paper,
   Collapse,
   Avatar,
   Divider,
   Tooltip
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import PhoneIcon from '@mui/icons-material/Phone';
import EventIcon from '@mui/icons-material/Event';
import HomeWorkIcon from '@mui/icons-material/HomeWork';
import PersonIcon from '@mui/icons-material/Person';
import AddCommentIcon from '@mui/icons-material/AddComment';
import PublishedWithChangesIcon from '@mui/icons-material/PublishedWithChanges';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import PlaceIcon from '@mui/icons-material/Place';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import SellIcon from '@mui/icons-material/Sell';
import CampaignIcon from '@mui/icons-material/Campaign';

const noteTypeMap = {
   positive: {
      label: 'Позитивна',
      bg: 'rgba(46, 125, 50, 0.16)',
      border: 'rgba(76, 175, 80, 0.4)',
      color: '#9be7a1'
   },
   negative: {
      label: 'Негативна',
      bg: 'rgba(211, 47, 47, 0.16)',
      border: 'rgba(244, 67, 54, 0.4)',
      color: '#ff9b9b'
   },
   info: {
      label: 'Інформуюча',
      bg: 'rgba(245, 158, 11, 0.16)',
      border: 'rgba(245, 158, 11, 0.4)',
      color: '#ffd37a'
   },
   important: {
      label: 'Важлива',
      bg: 'rgba(2, 132, 199, 0.16)',
      border: 'rgba(56, 189, 248, 0.4)',
      color: '#8bd8ff'
   }
};

const statusMap = {
   active: {
      label: 'Активна',
      chipBg: 'rgba(249, 115, 22, 0.16)',
      chipColor: '#ffb067',
      line: '#f97316'
   },
   contact: {
      label: 'На контакті',
      chipBg: 'rgba(59, 130, 246, 0.16)',
      chipColor: '#8fc2ff',
      line: '#3b82f6'
   },
   waiting: {
      label: 'Чекати',
      chipBg: 'rgba(168, 85, 247, 0.16)',
      chipColor: '#cda9ff',
      line: '#a855f7'
   },
   converted: {
      label: 'Конвертована',
      chipBg: 'rgba(34, 197, 94, 0.16)',
      chipColor: '#8ef0aa',
      line: '#22c55e'
   },
   lost: {
      label: 'Втрачена',
      chipBg: 'rgba(239, 68, 68, 0.16)',
      chipColor: '#ff9d9d',
      line: '#ef4444'
   }
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
      priceExpectation: '72 000$',
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
      priceExpectation: 'Не озвучено',
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
      priceExpectation: '48 000$',
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

function MiniMeta({ icon, text, color = 'text.secondary', strong = false }) {
   return (
      <Stack direction="row" spacing={0.8} alignItems="center" sx={{ minWidth: 0 }}>
         <Box sx={{ display: 'flex', color }}>
            {icon}
         </Box>
         <Typography
            sx={{
               fontSize: 13,
               color,
               fontWeight: strong ? 700 : 500,
               whiteSpace: 'nowrap',
               overflow: 'hidden',
               textOverflow: 'ellipsis'
            }}
         >
            {text}
         </Typography>
      </Stack>
   );
}

function NoteBadge({ note }) {
   const config = noteTypeMap[note.type] || noteTypeMap.info;

   return (
      <Box
         sx={{
            p: 1.2,
            borderRadius: 2,
            bgcolor: config.bg,
            border: `1px solid ${config.border}`
         }}
      >
         <Stack direction="row" justifyContent="space-between" spacing={1} sx={{ mb: 0.4 }}>
            <Typography sx={{ fontSize: 12, fontWeight: 800, color: config.color }}>
               {config.label}
            </Typography>
            <Typography sx={{ fontSize: 11, color: 'text.secondary' }}>
               {note.createdAt}
            </Typography>
         </Stack>

         <Typography sx={{ fontSize: 13.5, lineHeight: 1.4, color: '#e8ecf3' }}>
            {note.text}
         </Typography>
      </Box>
   );
}

function NavodkaRowCard({ item }) {
   const [open, setOpen] = useState(false);

   const status = statusMap[item.status] || statusMap.active;
   const overdue = isOverdue(item.nextContactAt);
   const today = isToday(item.nextContactAt);

   const nextContactColor = overdue
      ? '#ff8b8b'
      : today
         ? '#ffd166'
         : '#aab4c3';

   return (
      <Paper
         sx={{
            position: 'relative',
            overflow: 'hidden',
            borderRadius: 4,
            bgcolor: '#111827',
            border: '1px solid rgba(255,255,255,0.07)',
            boxShadow: '0 12px 32px rgba(0,0,0,0.22)'
         }}
      >
         <Box
            sx={{
               position: 'absolute',
               left: 0,
               top: 0,
               bottom: 0,
               width: 5,
               bgcolor: status.line
            }}
         />

         <Box sx={{ p: { xs: 1.4, md: 1.8 }, pl: { xs: 2, md: 2.4 } }}>
            <Stack
               direction={{ xs: 'column', lg: 'row' }}
               spacing={1.4}
               justifyContent="space-between"
               alignItems={{ xs: 'stretch', lg: 'center' }}
            >
               <Stack
                  direction={{ xs: 'column', md: 'row' }}
                  spacing={1.5}
                  alignItems={{ xs: 'flex-start', md: 'center' }}
                  sx={{ minWidth: 0, flex: 1 }}
               >
                  <Avatar
                     sx={{
                        width: 44,
                        height: 44,
                        bgcolor: 'rgba(255,255,255,0.08)',
                        color: '#fff',
                        fontWeight: 800
                     }}
                  >
                     {item.ownerName?.[0] || 'N'}
                  </Avatar>

                  <Box sx={{ minWidth: 0, flex: 1 }}>
                     <Stack
                        direction={{ xs: 'column', md: 'row' }}
                        spacing={1}
                        alignItems={{ xs: 'flex-start', md: 'center' }}
                        sx={{ mb: 0.8 }}
                     >
                        <Typography
                           sx={{
                              fontSize: { xs: 17, md: 18 },
                              fontWeight: 900,
                              color: '#f8fafc',
                              lineHeight: 1.2
                           }}
                        >
                           {item.title}
                        </Typography>

                        <Box
                           sx={{
                              px: 1.1,
                              py: 0.45,
                              borderRadius: 999,
                              bgcolor: status.chipBg,
                              color: status.chipColor,
                              fontSize: 12,
                              fontWeight: 800,
                              border: '1px solid rgba(255,255,255,0.08)'
                           }}
                        >
                           {status.label}
                        </Box>

                        <Chip
                           size="small"
                           label={readinessMap[item.readiness] || item.readiness}
                           sx={{
                              bgcolor: 'rgba(255,255,255,0.06)',
                              color: '#dbe4f0',
                              border: '1px solid rgba(255,255,255,0.06)'
                           }}
                        />
                     </Stack>

                     <Stack
                        direction="row"
                        spacing={1.6}
                        useFlexGap
                        flexWrap="wrap"
                        sx={{ minWidth: 0 }}
                     >
                        <MiniMeta
                           icon={<PersonIcon sx={{ fontSize: 16 }} />}
                           text={`${item.ownerName} • ${item.phone}`}
                        />
                        <MiniMeta
                           icon={<PlaceIcon sx={{ fontSize: 16 }} />}
                           text={item.locationText}
                        />
                        <MiniMeta
                           icon={<HomeWorkIcon sx={{ fontSize: 16 }} />}
                           text={item.propertyType}
                        />
                        <MiniMeta
                           icon={<SellIcon sx={{ fontSize: 16 }} />}
                           text={item.priceExpectation || 'Ціна не вказана'}
                           strong
                           color="#e7edf7"
                        />
                        <MiniMeta
                           icon={<CampaignIcon sx={{ fontSize: 16 }} />}
                           text={item.source}
                        />
                        <MiniMeta
                           icon={<AccessTimeIcon sx={{ fontSize: 16 }} />}
                           text={
                              overdue
                                 ? `Контакт: ${formatDate(item.nextContactAt)} • прострочено`
                                 : today
                                    ? `Контакт: ${formatDate(item.nextContactAt)} • сьогодні`
                                    : `Контакт: ${formatDate(item.nextContactAt)}`
                           }
                           color={nextContactColor}
                           strong={overdue || today}
                        />
                     </Stack>
                  </Box>
               </Stack>

               <Stack
                  direction="row"
                  spacing={1}
                  alignItems="center"
                  justifyContent={{ xs: 'space-between', lg: 'flex-end' }}
                  sx={{ flexShrink: 0 }}
               >
                  <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                     <Button
                        variant="outlined"
                        startIcon={<AddCommentIcon />}
                        sx={{
                           minWidth: 0,
                           borderRadius: 2.5,
                           color: '#dbe4f0',
                           borderColor: 'rgba(255,255,255,0.12)'
                        }}
                     >
                        Нотатка
                     </Button>

                     <Button
                        variant="contained"
                        startIcon={<PublishedWithChangesIcon />}
                        sx={{
                           minWidth: 0,
                           borderRadius: 2.5,
                           fontWeight: 800
                        }}
                     >
                        В об’єкт
                     </Button>

                     <Tooltip title="Подзвонити">
                        <IconButton
                           sx={{
                              bgcolor: 'rgba(255,255,255,0.06)',
                              color: '#dbe4f0',
                              '&:hover': { bgcolor: 'rgba(255,255,255,0.12)' }
                           }}
                        >
                           <PhoneIcon />
                        </IconButton>
                     </Tooltip>

                     <Tooltip title={open ? 'Згорнути' : 'Розгорнути'}>
                        <IconButton
                           onClick={() => setOpen(prev => !prev)}
                           sx={{
                              bgcolor: open ? 'rgba(59,130,246,0.18)' : 'rgba(255,255,255,0.06)',
                              color: open ? '#8fc2ff' : '#dbe4f0',
                              '&:hover': {
                                 bgcolor: open ? 'rgba(59,130,246,0.25)' : 'rgba(255,255,255,0.12)'
                              }
                           }}
                        >
                           {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                        </IconButton>
                     </Tooltip>
                  </Stack>
               </Stack>
            </Stack>

            <Collapse in={open}>
               <Box sx={{ pt: 1.8 }}>
                  <Divider sx={{ borderColor: 'rgba(255,255,255,0.08)', mb: 1.8 }} />

                  <Grid container spacing={2}>
                     <Grid item xs={12} lg={5}>
                        <Paper
                           sx={{
                              p: 1.6,
                              borderRadius: 3,
                              bgcolor: 'rgba(255,255,255,0.03)',
                              border: '1px solid rgba(255,255,255,0.06)',
                              color: '#e8ecf3',
                              height: '100%'
                           }}
                        >
                           <Typography sx={{ fontWeight: 800, mb: 1.2, color: '#fff' }}>
                              Деталі
                           </Typography>

                           <Stack spacing={1}>
                              <Typography sx={{ fontSize: 14 }}>
                                 <strong>Останній контакт:</strong> {formatDate(item.lastContactAt)}
                              </Typography>
                              <Typography sx={{ fontSize: 14 }}>
                                 <strong>Наступний контакт:</strong> {formatDate(item.nextContactAt)}
                              </Typography>
                              <Typography sx={{ fontSize: 14, color: '#cbd5e1', lineHeight: 1.5 }}>
                                 {item.description}
                              </Typography>
                           </Stack>
                        </Paper>
                     </Grid>

                     <Grid item xs={12} lg={7}>
                        <Paper
                           sx={{
                              p: 1.6,
                              borderRadius: 3,
                              bgcolor: 'rgba(255,255,255,0.03)',
                              border: '1px solid rgba(255,255,255,0.06)',
                              height: '100%'
                           }}
                        >
                           <Typography sx={{ fontWeight: 800, mb: 1.2, color: '#fff' }}>
                              Нотатки
                           </Typography>

                           <Stack spacing={1}>
                              {item.notes?.length ? (
                                 item.notes.map(note => <NoteBadge key={note._id} note={note} />)
                              ) : (
                                 <Typography sx={{ color: '#94a3b8', fontSize: 14 }}>
                                    Нотаток ще немає
                                 </Typography>
                              )}
                           </Stack>
                        </Paper>
                     </Grid>
                  </Grid>
               </Box>
            </Collapse>
         </Box>
      </Paper>
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
                        sx={{
                           '& .MuiOutlinedInput-root': {
                              borderRadius: 3,
                              bgcolor: 'rgba(255,255,255,0.04)'
                           }
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
                           sx={{
                              borderRadius: 3,
                              bgcolor: 'rgba(255,255,255,0.04)'
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
                     <FormControl fullWidth>
                        <InputLabel>Контакт</InputLabel>
                        <Select
                           value={contactFilter}
                           label="Контакт"
                           onChange={e => setContactFilter(e.target.value)}
                           sx={{
                              borderRadius: 3,
                              bgcolor: 'rgba(255,255,255,0.04)'
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
               {filtered.length ? (
                  filtered.map(item => <NavodkaRowCard key={item._id} item={item} />)
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
                        Нічого не знайдено
                     </Typography>
                     <Typography sx={{ color: '#94a3b8', mt: 1 }}>
                        Спробуй змінити пошук або фільтри
                     </Typography>
                  </Paper>
               )}
            </Stack>
         </Stack>
      </Box>
   );
}