'use client';

import { useMemo, useState } from 'react';
import {
   Box,
   Stack,
   Typography,
   Chip,
   Collapse,
   Divider,
   Grid,
   IconButton,
   Avatar,
   Tooltip,
} from '@mui/material';

import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded';
import ExpandLessRoundedIcon from '@mui/icons-material/ExpandLessRounded';
import BadgeRoundedIcon from '@mui/icons-material/BadgeRounded';
import AlternateEmailRoundedIcon from '@mui/icons-material/AlternateEmailRounded';
import PhoneRoundedIcon from '@mui/icons-material/PhoneRounded';
import CalendarMonthRoundedIcon from '@mui/icons-material/CalendarMonthRounded';

const roleMeta = {
   owner: { bg: '#e9d5ff', color: '#111', label: 'Owner' },
   admin: { bg: '#c4b5fd', color: '#111', label: 'Admin' },
   manager: { bg: '#93c5fd', color: '#111', label: 'Manager' },
   realtor: { bg: '#5eead4', color: '#111', label: 'Realtor' },
   callcenter: { bg: '#fde68a', color: '#111', label: 'Call Center' },
   viewer: { bg: '#d1d5db', color: '#111', label: 'Viewer' },
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

function formatDateTime(value) {
   if (!value) return '—';
   const d = new Date(value);
   if (Number.isNaN(d.getTime())) return '—';
   return d.toLocaleString('uk-UA', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
   });
}

function formatDateOnly(value) {
   if (!value) return '—';
   const d = new Date(value);
   if (Number.isNaN(d.getTime())) return '—';
   return d.toLocaleDateString('uk-UA');
}

export default function EmployeeCard({ item }) {
   const [open, setOpen] = useState(false);

   const role = roleMeta[item.role] || roleMeta.viewer;
   const lastNote = useMemo(() => {
      if (!Array.isArray(item.notes) || !item.notes.length) return null;
      return [...item.notes].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0];
   }, [item.notes]);

   const initials = (item.name || '?')
      .split(' ')
      .map((x) => x[0])
      .filter(Boolean)
      .slice(0, 2)
      .join('')
      .toUpperCase();

   return (
      <Box
         sx={{
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 3.5,
            bgcolor: 'rgba(255,255,255,0.03)',
            overflow: 'hidden',
            transition: '0.18s ease',
            '&:hover': {
               borderColor: 'rgba(139,92,246,0.22)',
               bgcolor: 'rgba(255,255,255,0.045)',
               boxShadow: '0 10px 26px rgba(0,0,0,0.16)',
            },
         }}
      >
         <Box sx={{ px: 1.2, py: 0.95 }}>
            <Box
               sx={{
                  display: 'grid',
                  gridTemplateColumns: {
                     xs: '1fr',
                     lg: '260px 190px minmax(0,1fr) 180px 44px',
                  },
                  gap: 1,
                  alignItems: 'center',
               }}
            >
               {/* LEFT */}
               <Stack direction="row" spacing={1} alignItems="center" minWidth={0}>
                  <Avatar
                     src={item.avatarUrl || ''}
                     sx={{
                        width: 42,
                        height: 42,
                        fontWeight: 900,
                        bgcolor: item.color || '#7c3aed',
                        flexShrink: 0,
                     }}
                  >
                     {initials}
                  </Avatar>

                  <Stack spacing={0.18} minWidth={0}>
                     <Tooltip title={item.name || ''}>
                        <Typography
                           sx={{
                              color: '#fff',
                              fontWeight: 850,
                              fontSize: 14,
                              lineHeight: 1.1,
                           }}
                           noWrap
                        >
                           {item.name}
                        </Typography>
                     </Tooltip>

                     <Typography
                        sx={{
                           color: 'rgba(255,255,255,0.62)',
                           fontSize: 11.5,
                           lineHeight: 1.1,
                        }}
                        noWrap
                     >
                        {item.position || '—'}
                     </Typography>
                  </Stack>
               </Stack>

               {/* ROLE + ACTIVE */}
               <Stack spacing={0.35} minWidth={0}>
                  <Chip
                     label={role.label}
                     size="small"
                     sx={{
                        alignSelf: 'flex-start',
                        bgcolor: role.bg,
                        color: role.color,
                        fontWeight: 900,
                        borderRadius: 999,
                        height: 24,
                     }}
                  />

                  <Chip
                     label={item.isActive ? 'Активний' : 'Звільнений'}
                     size="small"
                     sx={{
                        alignSelf: 'flex-start',
                        bgcolor: item.isActive
                           ? 'rgba(34,197,94,0.16)'
                           : 'rgba(239,68,68,0.16)',
                        color: item.isActive ? '#86efac' : '#fca5a5',
                        fontWeight: 800,
                        borderRadius: 999,
                        height: 22,
                     }}
                  />
               </Stack>

               {/* CENTER */}
               <Stack spacing={0.18} minWidth={0}>
                  <Typography
                     sx={{
                        color: '#fff',
                        fontSize: 12.8,
                        fontWeight: 700,
                        lineHeight: 1.22,
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        minHeight: '2.44em',
                     }}
                     title={item.about || ''}
                  >
                     {item.about || 'Без опису'}
                  </Typography>

                  {!!lastNote && (
                     <Typography
                        sx={{
                           color: noteStyles[lastNote.type]?.color || 'rgba(255,255,255,0.58)',
                           fontSize: 11,
                           lineHeight: 1.1,
                           whiteSpace: 'nowrap',
                           overflow: 'hidden',
                           textOverflow: 'ellipsis',
                        }}
                        title={lastNote.text}
                     >
                        {lastNote.text}
                     </Typography>
                  )}
               </Stack>

               {/* RIGHT */}
               <Stack spacing={0.12} alignItems={{ xs: 'flex-start', lg: 'flex-end' }}>
                  <Typography
                     sx={{
                        color: '#fff',
                        fontWeight: 750,
                        fontSize: 12.3,
                        lineHeight: 1.1,
                     }}
                     noWrap
                  >
                     {item.login || '—'}
                  </Typography>

                  <Typography
                     sx={{
                        color: 'rgba(255,255,255,0.5)',
                        fontSize: 10.5,
                        lineHeight: 1.1,
                     }}
                     noWrap
                  >
                     login
                  </Typography>
               </Stack>

               {/* ARROW */}
               <Stack alignItems={{ xs: 'flex-end', lg: 'center' }}>
                  <IconButton
                     onClick={() => setOpen((p) => !p)}
                     sx={{
                        color: 'rgba(255,255,255,0.78)',
                        border: '1px solid rgba(255,255,255,0.08)',
                        width: 34,
                        height: 34,
                        borderRadius: 2.5,
                        bgcolor: 'rgba(255,255,255,0.03)',
                     }}
                  >
                     {open ? <ExpandLessRoundedIcon /> : <ExpandMoreRoundedIcon />}
                  </IconButton>
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
                           <Typography sx={{ color: '#fff', fontWeight: 850, mb: 0.8 }}>
                              Контакти
                           </Typography>

                           <Stack spacing={0.7}>
                              <Stack direction="row" spacing={0.7} alignItems="center">
                                 <PhoneRoundedIcon sx={{ color: 'rgba(255,255,255,0.62)', fontSize: 17 }} />
                                 <Typography sx={{ color: 'rgba(255,255,255,0.76)' }}>
                                    {(item.phones || []).join(', ') || '—'}
                                 </Typography>
                              </Stack>

                              <Stack direction="row" spacing={0.7} alignItems="center">
                                 <AlternateEmailRoundedIcon sx={{ color: 'rgba(255,255,255,0.62)', fontSize: 17 }} />
                                 <Typography sx={{ color: 'rgba(255,255,255,0.76)' }}>
                                    {(item.emails || []).join(', ') || '—'}
                                 </Typography>
                              </Stack>

                              <Stack direction="row" spacing={0.7} alignItems="center">
                                 <BadgeRoundedIcon sx={{ color: 'rgba(255,255,255,0.62)', fontSize: 17 }} />
                                 <Typography sx={{ color: 'rgba(255,255,255,0.76)' }}>
                                    Telegram: {item.telegram || '—'}
                                 </Typography>
                              </Stack>
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
                              Профіль
                           </Typography>

                           <Stack spacing={0.55}>
                              <Typography sx={{ color: 'rgba(255,255,255,0.74)' }}>
                                 <b style={{ color: '#fff' }}>Посада:</b> {item.position || '—'}
                              </Typography>
                              <Typography sx={{ color: 'rgba(255,255,255,0.74)' }}>
                                 <b style={{ color: '#fff' }}>CRM роль:</b> {role.label}
                              </Typography>
                              <Typography sx={{ color: 'rgba(255,255,255,0.74)' }}>
                                 <b style={{ color: '#fff' }}>Колір:</b> {item.color || '—'}
                              </Typography>
                              <Typography sx={{ color: 'rgba(255,255,255,0.74)' }}>
                                 <b style={{ color: '#fff' }}>Порядок:</b> {item.displayOrder ?? '—'}
                              </Typography>
                              <Typography sx={{ color: 'rgba(255,255,255,0.74)' }}>
                                 <b style={{ color: '#fff' }}>Початок кар’єри:</b> {formatDateOnly(item.careerStartAt)}
                              </Typography>
                              <Typography sx={{ color: 'rgba(255,255,255,0.74)' }}>
                                 <b style={{ color: '#fff' }}>Дата звільнення:</b> {formatDateOnly(item.firedAt)}
                              </Typography>
                           </Stack>
                        </Box>
                     </Stack>
                  </Grid>

                  <Grid item xs={12} lg={5}>
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
                                          {formatDateTime(note.createdAt)}
                                       </Typography>
                                    </Stack>

                                    <Typography sx={{ color: '#fff', lineHeight: 1.5 }}>
                                       {note.text}
                                    </Typography>

                                    {!!note.createdByName && (
                                       <Typography
                                          sx={{
                                             color: 'rgba(255,255,255,0.5)',
                                             fontSize: 11,
                                             mt: 0.45,
                                          }}
                                       >
                                          {note.createdByName}
                                       </Typography>
                                    )}
                                 </Box>
                              );
                           })}
                        </Stack>
                     </Box>
                  </Grid>
               </Grid>
            </Box>
         </Collapse>
      </Box>
   );
}