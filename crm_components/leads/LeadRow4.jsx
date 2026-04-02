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
   Tooltip,
   TextField,
   Button,
   MenuItem,
} from '@mui/material';

import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded';
import ExpandLessRoundedIcon from '@mui/icons-material/ExpandLessRounded';

import AccessTimeFilledRoundedIcon from '@mui/icons-material/AccessTimeFilledRounded';
import AddRoundedIcon from '@mui/icons-material/AddRounded';


const stageColors = {
   lead: { bg: '#9ca3af', color: '#111', label: 'Холодний лід' },   // сірий
   hot: { bg: '#fa6515', color: '#111', label: 'Гарячий лід' },     // жовтий   facc15
   ps: { bg: '#60a5fa', color: '#111', label: 'ПС' },               // синій
   rs: { bg: '#2dd4bf', color: '#111', label: 'РС' },               // бірюзовий
   ds: { bg: '#fb923c', color: '#111', label: 'ДС' },               // помаранчевий
   zs: { bg: '#4ade80', color: '#111', label: 'ЗС' },               // зелений
   pers: { bg: '#a78bfa', color: '#111', label: 'ПЕРС' },           // фіолетовий
};

function formatDateOnly(value) {
   if (!value) return '—';

   const str = String(value).trim();

   if (str.includes(' ')) {
      const [datePart] = str.split(' ');
      const d = new Date(datePart);
      if (!Number.isNaN(d.getTime())) {
         return d.toLocaleDateString('uk-UA');
      }
      return datePart;
   }

   if (str.includes('T')) {
      const d = new Date(str);
      if (!Number.isNaN(d.getTime())) {
         return d.toLocaleDateString('uk-UA');
      }
   }

   const d = new Date(str);
   if (!Number.isNaN(d.getTime())) {
      return d.toLocaleDateString('uk-UA');
   }

   return str;
};

function formatTimeOnly(value) {
   if (!value) return '';

   const str = String(value).trim();

   if (str.includes(' ')) {
      const [, timePart] = str.split(' ');
      return (timePart || '').slice(0, 5);
   }

   if (str.includes('T')) {
      const d = new Date(str);
      if (!Number.isNaN(d.getTime())) {
         return d.toLocaleTimeString('uk-UA', {
            hour: '2-digit',
            minute: '2-digit',
         });
      }
   }

   return '';
};

function formatDateTime(value) {
   if (!value) return 'Не вказано';
   const d = new Date(value);
   if (Number.isNaN(d.getTime())) return String(value);
   return d.toLocaleString('uk-UA', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
   });
};



const actualityColors = {
   'Актуальний. Зустріч! В роботі': { bg: 'rgba(34,197,94,0.18)', color: '#86efac' },
   'Актуальний. Продзвін': { bg: 'rgba(45,212,191,0.18)', color: '#5eead4' },
   'Актуальний. Проблемний': { bg: 'rgba(239,68,68,0.18)', color: '#fca5a5' },
   'Актуальний. Зустріч! Не в роботі': { bg: 'rgba(59,130,246,0.18)', color: '#93c5fd' },

   'Неактуальний. Купив зі мною': { bg: 'rgba(139,92,246,0.18)', color: '#c4b5fd' },
   'Неактуальний. Купив без мене': { bg: 'rgba(107,114,128,0.22)', color: '#d1d5db' },
   'Неактуальний. Відмова покупки': { bg: 'rgba(239,68,68,0.18)', color: '#fca5a5' },
   'Неактуальний. Невідома причина': { bg: 'rgba(107,114,128,0.22)', color: '#d1d5db' },

   'Зупинений. Завдаток мій': { bg: 'rgba(34,197,94,0.18)', color: '#86efac' },
   'Зупинений. Завдаток не мій': { bg: 'rgba(245,158,11,0.18)', color: '#fdba74' },
   'Зупинений. Виявлена причина': { bg: 'rgba(59,130,246,0.18)', color: '#93c5fd' },
   'Зупинений. Невиявлена причина': { bg: 'rgba(107,114,128,0.22)', color: '#d1d5db' },
};

const noteColors = {
   positive: '#86efac',
   negative: '#fca5a5',
   info: '#fde68a',
   important: '#93c5fd',
};

function splitDateTime(value) {
   if (!value) return { date: '—', time: '' };

   const str = String(value).trim();

   if (str.includes(' ')) {
      const [date, time] = str.split(' ');
      return { date: date || '—', time: time || '' };
   }

   if (str.includes('T')) {
      const [date, timeRaw] = str.split('T');
      return { date: date || '—', time: (timeRaw || '').slice(0, 5) };
   }

   return { date: str, time: '' };
};

function getFreshnessMeta(lastActualizedAt) {
   if (!lastActualizedAt) {
      return { color: '#ef4444', glow: 'rgba(239,68,68,0.6)' }; // червоний
   }

   const now = new Date();
   const d = new Date(lastActualizedAt);
   const diff = Math.floor((now - d) / (1000 * 60 * 60 * 24));

   if (diff <= 2) return { color: '#22c55e', glow: 'rgba(34,197,94,0.7)' }; // зелений
   if (diff <= 7) return { color: '#3b82f6', glow: 'rgba(59,130,246,0.7)' }; // синій
   if (diff <= 14) return { color: '#facc15', glow: 'rgba(250,204,21,0.7)' }; // жовтий
   return { color: '#ef4444', glow: 'rgba(239,68,68,0.7)' }; // червоний
};



export default function LeadRow({ item, employees = [], onPatched }) {
   const [open, setOpen] = useState(false);

   const [noteOpen, setNoteOpen] = useState(false);
   const [noteText, setNoteText] = useState('');
   const [noteType, setNoteType] = useState('info');
   const [noteAuthor, setNoteAuthor] = useState('');
   const [savingNote, setSavingNote] = useState(false);
   const [noteError, setNoteError] = useState('');


   const stage = stageColors[item.stage] || stageColors.lead;
   const actuality =
      actualityColors[item.actualityStatus] || {
         bg: 'rgba(255,255,255,0.08)',
         color: '#fff',
      };

   // console.log(stage);
   const freshness = getFreshnessMeta(item.lastActualizedAt);


   // const lastNote = item.notes?.[item.notes.length - 1];
   const lastNote = Array.isArray(item.notes) && item.notes.length ? item.notes[0] : null;

   // const dt = useMemo(() => splitDateTime(item.lastContactAt), [item.lastContactAt]);
   const dt = useMemo(
      () => ({
         date: formatDateOnly(item.lastActualizedAt),
         time: formatTimeOnly(item.lastActualizedAt),
      }),
      [item.lastActualizedAt]
   );

   // Get employee names from populated data
   const assignee = item.assignee;
   const createdBy = item.createdByEmployee;


   const handleAddNote = async () => {
      try {
         setSavingNote(true);
         setNoteError('');

         const res = await fetch(`/api/crm/leads/${item._id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
               action: 'add_note',
               text: noteText,
               type: noteType,
               createdByEmployee: noteAuthor || undefined,
               updateLastContactAt: true,
               updateLastActualizedAt: true,
            }),
         });

         const data = await res.json();

         if (!res.ok) {
            throw new Error(data?.error || 'Не вдалося додати нотатку');
         }

         onPatched?.(data.item);

         setNoteText('');
         setNoteType('info');
         setNoteOpen(false);
      } catch (e) {
         setNoteError(e?.message || 'Помилка додавання нотатки');
      } finally {
         setSavingNote(false);
      }
   };


   function getLeadAgeDays(leadAppearedAt) {
      if (!leadAppearedAt) return null;
      const d = new Date(leadAppearedAt);
      if (Number.isNaN(d.getTime())) return null;

      const now = new Date();
      return Math.floor((now - d) / (1000 * 60 * 60 * 24));
   };

   const appearedAt = item.leadAppearedAt || item.createdAt;
   const leadAgeDays = getLeadAgeDays(appearedAt);



   return (
      <Box
         sx={{
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 3,
            bgcolor: 'rgba(255,255,255,0.03)',
            overflow: 'hidden',
            transition: '0.18s ease',
            boxShadow: '0 0 0 rgba(0,0,0,0)',
            '&:hover': {
               borderColor: 'rgba(139,92,246,0.22)',
               bgcolor: 'rgba(255,255,255,0.045)',
               boxShadow: '0 10px 26px rgba(0,0,0,0.16)',
            },
         }}
      >
         <Box sx={{ px: 1.2, py: 0.8 }}>
            <Box
               sx={{
                  display: 'grid',
                  gridTemplateColumns: {
                     xs: '1fr',
                     // lg: '220px 180px minmax(0,1fr) 120px 130px 44px',
                     lg: '220px 220px minmax(0,1fr) 120px 130px 44px',
                  },
                  gap: 1,
                  alignItems: 'center',
               }}
            >
               {/* NAME */}
               <Stack spacing={0.2} minWidth={0}>
                  {/* <Typography
                     sx={{
                        color: '#fff',
                        fontWeight: 850,
                        fontSize: 14,
                        lineHeight: 1.1,
                     }}
                     noWrap
                  >
                     {item.name}
                  </Typography> */}
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
                     {(item.phones || []).join(', ') || 'Без телефону'}
                  </Typography>
                  {item.duplicateState && (
                     <Chip
                        label={
                           item.duplicateState === 'active'
                              ? `Дубль (в роботі)`
                              : 'Можливий дубль'
                        }
                        size="small"
                        sx={{
                           mt: 0.4,
                           bgcolor:
                              item.duplicateState === 'active'
                                 ? 'rgba(239,68,68,0.18)'
                                 : 'rgba(250,204,21,0.18)',
                           color:
                              item.duplicateState === 'active'
                                 ? '#fca5a5'
                                 : '#fde68a',
                           fontSize: 10,
                        }}
                     />
                  )}
               </Stack>

               {/* STAGE + BUDGET + ACTUALITY */}
               <Stack
                  spacing={0.35}
                  minWidth={0}
                  sx={{
                     width: { xs: '100%', lg: 220 },
                     justifySelf: { lg: 'start' },
                     ml: { lg: -0.5 },
                  }}
               >
                  {/* <Stack direction="row" spacing={0.7} alignItems="center" flexWrap="wrap" useFlexGap> */}
                  <Stack
                     direction="row"
                     alignItems="center"
                     justifyContent="space-between"
                     sx={{ width: '100%' }}
                  >
                     <Chip
                        label={stage.label}
                        size="small"
                        sx={{
                           bgcolor: stage.bg + ' !important',
                           color: stage.color,
                           fontWeight: 900,
                           borderRadius: 999,
                           height: 25,
                           boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.08)',
                           '& .MuiChip-label': {
                              px: 1.1,
                           },
                        }}
                     />

                     <Chip
                        label={
                           item.budgetMax
                              ? `${item.budgetMax.toLocaleString('uk-UA')} $`
                              : '—'
                        }
                        size="small"
                        sx={{
                           bgcolor: 'rgba(17,24,39,0.92)',
                           color: '#5eead4',
                           fontWeight: 500,
                           borderRadius: 999,
                           height: 25,
                           border: '1px solid rgba(156,163,175,0.28)',
                           '& .MuiChip-label': {
                              px: 1.15,
                           },
                        }}
                     />
                  </Stack>

                  <Chip
                     label={item.actualityStatus || '—'}
                     size="small"
                     sx={{
                        alignSelf: 'flex-start',
                        bgcolor: actuality.bg,
                        color: actuality.color,
                        fontWeight: 800,
                        borderRadius: 999,
                        maxWidth: '100%',
                        height: 22,
                        '& .MuiChip-label': {
                           px: 1,
                           display: 'block',
                           overflow: 'hidden',
                           textOverflow: 'ellipsis',
                           whiteSpace: 'nowrap',
                        },
                     }}
                  />
               </Stack>

               {/* REQUEST + LAST NOTE */}
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
                     title={item.requestSummary}
                  >
                     {item.requestSummary}
                  </Typography>

                  {!!lastNote && (
                     <Stack direction="row" alignItems="center" spacing={1}>
                        <Typography
                           sx={{
                              color: noteColors[lastNote.type] || 'rgba(255,255,255,0.58)',
                              fontSize: 11,
                              lineHeight: 1.1,
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              flex: 1,
                           }}
                           title={lastNote.text}
                        >
                           {lastNote.text}
                        </Typography>
                        <Button
                           size="small"
                           onClick={() => setNoteOpen((p) => !p)}
                           sx={{
                              fontSize: 11,
                              color: '#5eead4',
                              textTransform: 'none',
                              minWidth: 'auto',
                              px: 1,
                              height: 20,
                              minHeight: 20,
                           }}
                        >
                           + нотатка
                        </Button>
                     </Stack>
                  )}

                  {!lastNote && (
                     <Button
                        size="small"
                        onClick={() => setNoteOpen((p) => !p)}
                        sx={{
                           fontSize: 11,
                           color: '#5eead4',
                           textTransform: 'none',
                           alignSelf: 'flex-start',
                           height: 24,
                           minHeight: 24,
                        }}
                     >
                        + нотатка
                     </Button>
                  )}
               </Stack>



               {/* DATE/TIME */}
               <Stack spacing={0.1} alignItems={{ xs: 'flex-start', lg: 'flex-end', marginRight: '7px' }}>
                  <Typography
                     sx={{
                        color: '#fff',
                        fontWeight: 800,
                        fontSize: 12.5,
                        lineHeight: 1.1,
                     }}
                     noWrap
                  >
                     {dt.date}
                  </Typography>

                  <Stack direction="row" spacing={0.6} alignItems="center">
                     <Stack
                        direction="row"
                        spacing={0.6}
                        alignItems="center"
                     >
                        <Tooltip title={`Дата появи: ${formatDateTime(appearedAt)}`}>
                           <Typography
                              sx={{
                                 color: 'rgba(255,255,255,0.62)',
                                 fontSize: 10.5,
                                 lineHeight: 1.1,
                                 fontWeight: 400,
                                 marginRight: '6px !important',
                                 cursor: 'help',
                              }}
                           >
                              {leadAgeDays ?? '—'}<span style={{ marginLeft: '1.5px' }}>д</span>
                           </Typography>
                        </Tooltip>

                        <Tooltip title={`Остання актуальність: ${formatDateTime(item.lastActualizedAt)}`}>
                           <AccessTimeFilledRoundedIcon
                              sx={{
                                 fontSize: 14,
                                 color: freshness.color,
                                 filter: `drop-shadow(0 0 4px ${freshness.glow})`,
                                 cursor: 'help',
                              }}
                           />
                        </Tooltip>
                     </Stack>

                     <Typography
                        sx={{
                           color: 'rgba(255,255,255,0.55)',
                           fontSize: 10.5,
                           lineHeight: 1.1,
                        }}
                        noWrap
                     >
                        {dt.time}
                     </Typography>
                  </Stack>

               </Stack>



               {/* ASSIGNEE */}
               <Stack spacing={0.1} alignItems={{ xs: 'flex-start', lg: 'flex-end' }}>
                  <Typography
                     sx={{
                        color: '#fff',
                        fontWeight: 750,
                        fontSize: 12.3,
                        lineHeight: 1.1,
                     }}
                     noWrap
                  >
                     {assignee?.name || '—'}
                  </Typography>
                  <Typography
                     sx={{
                        color: 'rgba(255,255,255,0.5)',
                        fontSize: 10.5,
                        lineHeight: 1.1,
                     }}
                     noWrap
                  >
                     відповідальний
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

         {noteOpen && (
            <Box
               sx={{
                  p: 1,
                  borderRadius: 2.5,
                  bgcolor: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  mb: 1,
               }}
            >
               <Stack spacing={0.9}>
                  {noteError ? (
                     <Typography sx={{ color: '#fca5a5', fontSize: 12 }}>{noteError}</Typography>
                  ) : null}

                  <TextField
                     placeholder="Напиши нотатку..."
                     value={noteText}
                     onChange={(e) => setNoteText(e.target.value)}
                     fullWidth
                     // multiline
                     minRows={2}
                     sx={{
                        '& .MuiOutlinedInput-root': {
                           color: '#fff',
                           bgcolor: 'rgba(255,255,255,0.04)',
                           borderRadius: 2.5,
                           '& fieldset': {
                              borderColor: 'rgba(255,255,255,0.10)',
                           },
                        },
                     }}
                  />

                  <Stack direction={{ xs: 'column', md: 'row' }} spacing={1}>
                     <TextField
                        select
                        label="Тип нотатки"
                        value={noteType}
                        onChange={(e) => setNoteType(e.target.value)}
                        sx={{
                           minWidth: 180,
                           '& .MuiOutlinedInput-root': {
                              color: '#fff',
                              bgcolor: 'rgba(255,255,255,0.04)',
                              borderRadius: 2.5,
                           },
                           '& .MuiInputLabel-root': {
                              color: 'rgba(255,255,255,0.72)',
                           },
                           '& .MuiSelect-icon': {
                              color: 'rgba(255,255,255,0.78)',
                           },
                        }}
                     >
                        <MenuItem value="positive">Позитивна</MenuItem>
                        <MenuItem value="negative">Негативна</MenuItem>
                        <MenuItem value="info">Інформуюча</MenuItem>
                        <MenuItem value="important">Важлива</MenuItem>
                     </TextField>

                     <TextField
                        select
                        label="Хто вносить"
                        value={noteAuthor}
                        onChange={(e) => setNoteAuthor(e.target.value)}
                        sx={{
                           minWidth: 220,
                           '& .MuiOutlinedInput-root': {
                              color: '#fff',
                              bgcolor: 'rgba(255,255,255,0.04)',
                              borderRadius: 2.5,
                           },
                           '& .MuiInputLabel-root': {
                              color: 'rgba(255,255,255,0.72)',
                           },
                           '& .MuiSelect-icon': {
                              color: 'rgba(255,255,255,0.78)',
                           },
                        }}
                     >
                        <MenuItem value="">—</MenuItem>
                        {employees.map((emp) => (
                           <MenuItem key={emp._id} value={emp._id}>
                              {emp.name}
                           </MenuItem>
                        ))}
                     </TextField>

                     <Box sx={{ flexGrow: 1 }} />

                     <Stack direction="row" spacing={1}>
                        <Button
                           size="small"
                           onClick={() => setNoteOpen(false)}
                           sx={{
                              color: 'rgba(255,255,255,0.72)',
                              border: '1px solid rgba(255,255,255,0.12)',
                              borderRadius: 2.5,
                           }}
                        >
                           Скасувати
                        </Button>

                        <Button
                           size="small"
                           disabled={savingNote || !noteText.trim()}
                           onClick={handleAddNote}
                           sx={{
                              color: '#111',
                              fontWeight: 800,
                              borderRadius: 2.5,
                              background:
                                 'linear-gradient(90deg, rgba(139,92,246,1), rgba(168,85,247,1))',
                           }}
                        >
                           {savingNote ? 'Збереження...' : 'Зберегти'}
                        </Button>
                     </Stack>
                  </Stack>
               </Stack>
            </Box>
         )}

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
                                 <b style={{ color: '#fff' }}>Хто вніс:</b> {createdBy?.name || '—'}
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
                                 <b style={{ color: '#fff' }}>Стадія:</b> {stage.label}
                              </Typography>
                              <Typography sx={{ color: 'rgba(255,255,255,0.74)' }}>
                                 <b style={{ color: '#fff' }}>Макс. бюджет:</b>{' '}
                                 {item.budgetMax ? `${item.budgetMax.toLocaleString('uk-UA')} $` : '—'}
                              </Typography>

                              <Typography sx={{ color: 'rgba(255,255,255,0.74)' }}>
                                 <b style={{ color: '#fff' }}>Остання дата актуальності:</b> {formatDateTime(item.lastActualizedAt)}
                              </Typography>
                              <Typography sx={{ color: 'rgba(255,255,255,0.74)' }}>
                                 <b style={{ color: '#fff' }}>Статус актуальності:</b> {item.actualityStatus}
                              </Typography>
                              <Typography sx={{ color: 'rgba(255,255,255,0.74)' }}>
                                 <b style={{ color: '#fff' }}>Дата появи ліда:</b> {formatDateTime(item.leadAppearedAt)}
                              </Typography>
                              <Typography sx={{ color: 'rgba(255,255,255,0.74)' }}>
                                 <b style={{ color: '#fff' }}>Дата внесення:</b> {formatDateTime(item.createdAt)}
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
                                 const style =
                                    {
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
                                    }[note.type] || {
                                       color: '#fff',
                                       bg: 'rgba(255,255,255,0.06)',
                                       border: '1px solid rgba(255,255,255,0.08)',
                                       label: 'Нотатка',
                                    };

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
                                          <Stack direction="row" spacing={1} alignItems="center">
                                             {note.createdByName && (
                                                <Typography sx={{ color: 'rgba(255,255,255,0.6)', fontSize: 11 }}>
                                                   {note.createdByName}
                                                </Typography>
                                             )}
                                             <Typography sx={{ color: 'rgba(255,255,255,0.46)', fontSize: 11 }}>
                                                {formatDateTime(note.createdAt)}
                                             </Typography>
                                          </Stack>
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