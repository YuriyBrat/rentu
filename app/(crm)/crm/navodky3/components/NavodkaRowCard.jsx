'use client';

import { useState } from 'react';
import {
   Box,
   Stack,
   Typography,
   Chip,
   Button,
   IconButton,
   Paper,
   Collapse,
   Avatar,
   Divider,
   Tooltip,
   Grid
} from '@mui/material';
import PhoneIcon from '@mui/icons-material/Phone';
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
               {note.createdAt
                  ? new Date(note.createdAt).toLocaleString('uk-UA')
                  : ''}
            </Typography>
         </Stack>

         <Typography sx={{ fontSize: 13.5, lineHeight: 1.4, color: '#e8ecf3' }}>
            {note.text}
         </Typography>
      </Box>
   );
}

export default function NavodkaRowCard({
   item,
   onCreateNote,
   onConvert,
   onCall
}) {
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
                        onClick={() => onCreateNote?.(item)}
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
                        onClick={() => onConvert?.(item)}
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
                           onClick={() => onCall?.(item)}
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
                                 {item.description || 'Без опису'}
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