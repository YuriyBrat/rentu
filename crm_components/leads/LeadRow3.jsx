'use client';

import { useMemo, useState } from 'react';
import {
   Box,
   Stack,
   Typography,
   Chip,
   Collapse,
   Divider,
   Button,
   Grid,
} from '@mui/material';

import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded';
import ExpandLessRoundedIcon from '@mui/icons-material/ExpandLessRounded';
import PhoneRoundedIcon from '@mui/icons-material/PhoneRounded';
import PersonRoundedIcon from '@mui/icons-material/PersonRounded';
import EventRoundedIcon from '@mui/icons-material/EventRounded';
import SellRoundedIcon from '@mui/icons-material/SellRounded';

const stageColors = {
   lead: { bg: '#9ca3af', color: '#111', label: 'LEAD' },
   hot: { bg: '#facc15', color: '#111', label: 'HOT' },
   ps: { bg: '#60a5fa', color: '#111', label: 'ПС' },
   rs: { bg: '#2dd4bf', color: '#111', label: 'РС' },
   ds: { bg: '#fb923c', color: '#111', label: 'ДС' },
   zs: { bg: '#4ade80', color: '#111', label: 'ЗС' },
   pers: { bg: '#a78bfa', color: '#111', label: 'ПЕРС' },
};

const noteStyles = {
   positive: {
      color: '#86efac',
      bg: 'rgba(34,197,94,0.14)',
      border: '1px solid rgba(34,197,94,0.22)',
      label: 'Позитивна',
   },
   negative: {
      color: '#fca5a5',
      bg: 'rgba(239,68,68,0.12)',
      border: '1px solid rgba(239,68,68,0.22)',
      label: 'Негативна',
   },
   info: {
      color: '#fde68a',
      bg: 'rgba(250,204,21,0.12)',
      border: '1px solid rgba(250,204,21,0.22)',
      label: 'Інформуюча',
   },
   important: {
      color: '#93c5fd',
      bg: 'rgba(59,130,246,0.12)',
      border: '1px solid rgba(59,130,246,0.22)',
      label: 'Важлива',
   },
};

function MetaPill({ icon, label, value }) {
   return (
      <Stack
         direction="row"
         spacing={0.8}
         alignItems="center"
         sx={{
            px: 1.05,
            py: 0.72,
            borderRadius: 2.5,
            bgcolor: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.06)',
            minWidth: 132,
         }}
      >
         <Box sx={{ color: 'rgba(255,255,255,0.62)', display: 'flex' }}>{icon}</Box>
         <Stack spacing={0.1} minWidth={0}>
            <Typography sx={{ color: 'rgba(255,255,255,0.54)', fontSize: 11, lineHeight: 1.1 }}>
               {label}
            </Typography>
            <Typography sx={{ color: '#fff', fontSize: 13, fontWeight: 800, lineHeight: 1.1 }} noWrap>
               {value || '—'}
            </Typography>
         </Stack>
      </Stack>
   );
}

export default function LeadRow({ item }) {
   const [open, setOpen] = useState(false);

   const stage = stageColors[item.stage] || stageColors.lead;
   const lastNote = item.notes?.[item.notes.length - 1];

   const statusChip = useMemo(() => {
      return item.status === 'client'
         ? {
            label: 'Клієнт',
            color: '#111',
            bg: '#e9d5ff',
         }
         : {
            label: 'Лід',
            color: '#111',
            bg: '#d1d5db',
         };
   }, [item.status]);

   return (
      <Box
         sx={{
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 3.5,
            bgcolor: 'rgba(255,255,255,0.03)',
            overflow: 'hidden',
            transition: '0.2s ease',
         }}
      >
         <Box sx={{ p: 1.15 }}>
            <Box
               sx={{
                  display: 'grid',
                  gridTemplateColumns: {
                     xs: '1fr',
                     lg: '240px minmax(0,1fr) 170px',
                  },
                  gap: 1.2,
                  alignItems: 'center',
               }}
            >
               {/* LEFT */}
               <Stack spacing={0.45} minWidth={0}>
                  <Stack direction="row" spacing={0.7} flexWrap="wrap" useFlexGap>
                     <Chip
                        label={statusChip.label}
                        sx={{
                           bgcolor: statusChip.bg,
                           color: statusChip.color,
                           fontWeight: 900,
                           height: 26,
                        }}
                     />
                  </Stack>

                  <Typography sx={{ color: '#fff', fontWeight: 900, fontSize: 16 }} noWrap>
                     {item.name}
                  </Typography>

                  <Typography sx={{ color: 'rgba(255,255,255,0.68)', fontSize: 12.5 }} noWrap>
                     {(item.phones || []).join(', ') || 'Без телефону'}
                  </Typography>
               </Stack>

               {/* CENTER */}
               <Stack spacing={0.55} minWidth={0}>
                  <Stack
                     direction={{ xs: 'column', sm: 'row' }}
                     spacing={0.7}
                     alignItems={{ xs: 'flex-start', sm: 'center' }}
                     flexWrap="wrap"
                     useFlexGap
                  >
                     <Chip
                        label={stage.label}
                        sx={{
                           bgcolor: stage.bg,
                           color: stage.color,
                           fontWeight: 950,
                           borderRadius: 999,
                           px: 0.8,
                           height: 28,
                        }}
                     />

                     <Chip
                        icon={<SellRoundedIcon sx={{ color: '#111 !important', fontSize: 16 }} />}
                        label={
                           item.budgetMax
                              ? `${item.budgetMax.toLocaleString('uk-UA')} $`
                              : 'Бюджет —'
                        }
                        sx={{
                           bgcolor: 'rgba(255,255,255,0.92)',
                           color: '#111',
                           fontWeight: 900,
                           borderRadius: 999,
                           height: 28,
                           '& .MuiChip-label': {
                              px: 1,
                           },
                        }}
                     />
                  </Stack>

                  <Typography
                     sx={{
                        color: 'rgba(255,255,255,0.64)',
                        fontSize: 12,
                        fontWeight: 700,
                     }}
                     noWrap
                  >
                     {item.actualityStatus || '—'}
                  </Typography>

                  <Typography
                     sx={{
                        color: '#fff',
                        fontWeight: 700,
                        lineHeight: 1.35,
                        fontSize: 13.5,
                     }}
                     noWrap
                  >
                     {item.requestSummary}
                  </Typography>

                  {!!lastNote && (
                     <Typography
                        sx={{
                           color: noteStyles[lastNote.type]?.color || 'rgba(255,255,255,0.62)',
                           fontSize: 11.5,
                           lineHeight: 1.25,
                           maxWidth: '100%',
                        }}
                        noWrap
                     >
                        {lastNote.text}
                     </Typography>
                  )}
               </Stack>

               {/* RIGHT */}
               <Stack spacing={0.75} alignItems={{ xs: 'stretch', lg: 'flex-end' }}>
                  <MetaPill
                     icon={<PersonRoundedIcon sx={{ fontSize: 16 }} />}
                     label="Відповідальний"
                     value={item.assignee}
                  />

                  <MetaPill
                     icon={<PhoneRoundedIcon sx={{ fontSize: 16 }} />}
                     label="Контакт"
                     value={item.lastContactAt}
                  />

                  <Button
                     onClick={() => setOpen((p) => !p)}
                     endIcon={open ? <ExpandLessRoundedIcon /> : <ExpandMoreRoundedIcon />}
                     sx={{
                        borderRadius: 3,
                        color: '#fff',
                        fontWeight: 900,
                        border: '1px solid rgba(255,255,255,0.10)',
                        bgcolor: 'rgba(255,255,255,0.04)',
                        minWidth: 150,
                     }}
                  >
                     {open ? 'Згорнути' : 'Детальніше'}
                  </Button>
               </Stack>
            </Box>
         </Box>

         <Collapse in={open} timeout="auto" unmountOnExit>
            <Divider sx={{ borderColor: 'rgba(255,255,255,0.06)' }} />

            <Box sx={{ p: 1.3 }}>
               <Grid container spacing={1.2}>
                  <Grid item xs={12} lg={7}>
                     <Stack spacing={1.1}>
                        <Box
                           sx={{
                              p: 1.2,
                              borderRadius: 3,
                              bgcolor: 'rgba(255,255,255,0.03)',
                              border: '1px solid rgba(255,255,255,0.06)',
                           }}
                        >
                           <Typography sx={{ color: '#fff', fontWeight: 850, mb: 0.7 }}>
                              Деталі пошуку
                           </Typography>
                           <Typography sx={{ color: 'rgba(255,255,255,0.74)', lineHeight: 1.65 }}>
                              {item.requestSummary}
                           </Typography>
                        </Box>

                        <Box
                           sx={{
                              p: 1.2,
                              borderRadius: 3,
                              bgcolor: 'rgba(255,255,255,0.03)',
                              border: '1px solid rgba(255,255,255,0.06)',
                           }}
                        >
                           <Typography sx={{ color: '#fff', fontWeight: 850, mb: 0.7 }}>
                              Джерело
                           </Typography>

                           <Stack spacing={0.6}>
                              <Typography sx={{ color: 'rgba(255,255,255,0.74)' }}>
                                 <b style={{ color: '#fff' }}>Канал:</b> {item.sourceChannel}
                              </Typography>
                              <Typography sx={{ color: 'rgba(255,255,255,0.74)' }}>
                                 <b style={{ color: '#fff' }}>Об’єкт, що примагнітив:</b> {item.sourceObject}
                              </Typography>
                              <Typography sx={{ color: 'rgba(255,255,255,0.74)' }}>
                                 <b style={{ color: '#fff' }}>Нотатка до джерела:</b> {item.sourceNote}
                              </Typography>
                              <Typography sx={{ color: 'rgba(255,255,255,0.74)' }}>
                                 <b style={{ color: '#fff' }}>Хто вніс:</b> {item.createdBy}
                              </Typography>
                           </Stack>
                        </Box>
                     </Stack>
                  </Grid>

                  <Grid item xs={12} lg={5}>
                     <Stack spacing={1.1}>
                        <Box
                           sx={{
                              p: 1.2,
                              borderRadius: 3,
                              bgcolor: 'rgba(255,255,255,0.03)',
                              border: '1px solid rgba(255,255,255,0.06)',
                           }}
                        >
                           <Typography sx={{ color: '#fff', fontWeight: 850, mb: 0.8 }}>
                              Службова інформація
                           </Typography>

                           <Stack spacing={0.55}>
                              <Typography sx={{ color: 'rgba(255,255,255,0.74)' }}>
                                 <b style={{ color: '#fff' }}>Статус:</b> {item.status}
                              </Typography>
                              <Typography sx={{ color: 'rgba(255,255,255,0.74)' }}>
                                 <b style={{ color: '#fff' }}>Стадія:</b> {stage.label}
                              </Typography>
                              <Typography sx={{ color: 'rgba(255,255,255,0.74)' }}>
                                 <b style={{ color: '#fff' }}>Макс. бюджет:</b>{' '}
                                 {item.budgetMax ? `${item.budgetMax.toLocaleString('uk-UA')} $` : '—'}
                              </Typography>
                              <Typography sx={{ color: 'rgba(255,255,255,0.74)' }}>
                                 <b style={{ color: '#fff' }}>Останній контакт:</b> {item.lastContactAt}
                              </Typography>
                              <Typography sx={{ color: 'rgba(255,255,255,0.74)' }}>
                                 <b style={{ color: '#fff' }}>Остання дата актуальності:</b> {item.lastActualizedAt}
                              </Typography>
                              <Typography sx={{ color: 'rgba(255,255,255,0.74)' }}>
                                 <b style={{ color: '#fff' }}>Статус актуальності:</b> {item.actualityStatus}
                              </Typography>
                              <Typography sx={{ color: 'rgba(255,255,255,0.74)' }}>
                                 <b style={{ color: '#fff' }}>Дата внесення:</b> {item.createdAt}
                              </Typography>
                           </Stack>
                        </Box>

                        <Box
                           sx={{
                              p: 1.2,
                              borderRadius: 3,
                              bgcolor: 'rgba(255,255,255,0.03)',
                              border: '1px solid rgba(255,255,255,0.06)',
                           }}
                        >
                           <Typography sx={{ color: '#fff', fontWeight: 850, mb: 0.8 }}>
                              Нотатки
                           </Typography>

                           <Stack spacing={0.8}>
                              {(item.notes || []).map((note, i) => {
                                 const style = noteStyles[note.type] || noteStyles.info;
                                 return (
                                    <Box
                                       key={i}
                                       sx={{
                                          p: 1,
                                          borderRadius: 2.5,
                                          bgcolor: style.bg,
                                          border: style.border,
                                       }}
                                    >
                                       <Stack
                                          direction="row"
                                          justifyContent="space-between"
                                          spacing={1}
                                          sx={{ mb: 0.4 }}
                                       >
                                          <Typography sx={{ color: style.color, fontWeight: 800 }}>
                                             {style.label}
                                          </Typography>
                                          <Typography sx={{ color: 'rgba(255,255,255,0.46)', fontSize: 11 }}>
                                             {note.createdAt}
                                          </Typography>
                                       </Stack>

                                       <Typography sx={{ color: '#fff', lineHeight: 1.5 }}>
                                          {note.text}
                                       </Typography>
                                    </Box>
                                 );
                              })}
                           </Stack>
                        </Box>
                     </Stack>
                  </Grid>
               </Grid>
            </Box>
         </Collapse>
      </Box>
   );
}