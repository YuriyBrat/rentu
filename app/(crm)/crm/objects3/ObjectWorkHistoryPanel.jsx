'use client';

import { Box, Stack, Typography, IconButton, Tooltip, Chip } from '@mui/material';
import AddRoundedIcon from '@mui/icons-material/AddRounded';

const TYPE_LABELS = {
   note: 'Нотатка',
   call: 'Дзвінок',
   message: 'Переписка',
   meeting: 'Зустріч',
   review: 'Огляд',
   showing: 'Показ',
};

const TONE_LABELS = {
   positive: 'Позитивна',
   negative: 'Негативна',
   info: 'Інформуюча',
   important: 'Важлива',
};

function formatDateTime(value) {
   if (!value) return '—';
   const d = new Date(value);
   if (Number.isNaN(d.getTime())) return '—';

   return d.toLocaleString('uk-UA', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
   });
}

function getToneSx(tone, mode) {
   if (tone === 'positive') {
      return {
         color: mode === 'light' ? '#166534' : '#bbf7d0',
         bgcolor: mode === 'light' ? 'rgba(22,101,52,0.08) !important' : 'rgba(34,197,94,0.13) !important',
         border: '1px solid rgba(34,197,94,0.24)',
      };
   }

   if (tone === 'negative') {
      return {
         color: mode === 'light' ? '#991b1b' : '#fecaca',
         bgcolor: mode === 'light' ? 'rgba(239,68,68,0.08)' : 'rgba(239,68,68,0.13)',
         border: '1px solid rgba(239,68,68,0.24)',
      };
   }

   if (tone === 'important') {
      return {
         color: mode === 'light' ? '#1e40af' : '#bfdbfe',
         bgcolor: mode === 'light' ? 'rgba(59,130,246,0.08)' : 'rgba(59,130,246,0.13)',
         border: '1px solid rgba(59,130,246,0.24)',
      };
   }

   return {
      color: mode === 'light' ? '#92400e' : '#fde68a',
      bgcolor: mode === 'light' ? 'rgba(245,158,11,0.10)' : 'rgba(245,158,11,0.13)',
      border: '1px solid rgba(245,158,11,0.26)',
   };
}

export default function ObjectWorkHistoryPanel({
   item,
   theme,
   mode,
   actionIconSx,
   onAdd,
}) {
   const history = item?.workHistory || [];

   return (
      <Box
         sx={{
            p: 1,
            borderRadius: 3,
            border: `1px solid ${theme.border}`,
            bgcolor: mode === 'light'
               ? 'rgba(124,58,237,0.025)'
               : 'rgba(255,255,255,0.018)',
         }}
      >
         <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 0.8 }}>
            <Box>
               <Typography sx={{ color: theme.text, fontWeight: 950 }}>
                  Історія роботи
               </Typography>
               <Typography sx={{ color: theme.textSoft, fontSize: 12 }}>
                  Останні записи по об’єкту
               </Typography>
            </Box>

            <Tooltip title="Додати запис">
               <IconButton onClick={onAdd} sx={actionIconSx}>
                  <AddRoundedIcon />
               </IconButton>
            </Tooltip>
         </Stack>

         <Box
            sx={{
               maxHeight: 360,
               overflowY: 'auto',
               pr: 0.4,
               '&::-webkit-scrollbar': { width: 6 },
               '&::-webkit-scrollbar-thumb': {
                  bgcolor: mode === 'light'
                     ? 'rgba(124,58,237,0.22)'
                     : 'rgba(255,255,255,0.16)',
                  borderRadius: 999,
               },
            }}
         >
            <Stack spacing={0.75}>
               {history.slice(0, 30).map((n) => {
                  const tone = n.tone || 'info';

                  return (
                     <Box
                        key={n._id || n.createdAt}
                        sx={{
                           p: 0.9,
                           borderRadius: 2.4,
                           ...getToneSx(tone, mode),
                        }}
                     >
                        <Stack direction="row" spacing={0.6} alignItems="center" flexWrap="wrap" useFlexGap>
                           <Chip
                              label={TYPE_LABELS[n.type] || 'Запис'}
                              size="small"
                              sx={{
                                 height: 21,
                                 fontSize: 11,
                                 fontWeight: 950,
                                 color: 'inherit',
                                 // bgcolor: 'rgba(255,255,255,0.28) ',
                                 bgcolor: mode === 'light' ? 'rgba(22,101,52,0.08) !important' : 'rgba(34,197,94,0.12) !important',
                                 border: mode === 'light'
                                    ? '1px solid rgba(22,101,52,0.18) !important'
                                    : '1px solid rgba(34,197,94,0.22) !important',
                              }}
                           />

                           <Chip
                              label={TONE_LABELS[tone] || 'Інформуюча'}
                              size="small"
                              sx={{
                                 height: 21,
                                 fontSize: 11,
                                 fontWeight: 950,
                                 color: 'inherit',
                                 // bgcolor: 'rgba(255,255,255,0.18)',
                                 bgcolor: mode === 'light' ? 'rgba(22,101,52,0.08) !important' : 'rgba(34,197,94,0.12) !important',
                                 border: mode === 'light'
                                    ? '1px solid rgba(22,101,52,0.18) !important'
                                    : '1px solid rgba(34,197,94,0.22) !important',
                              }}
                           />

                           <Typography sx={{ ml: 'auto', fontSize: 11, opacity: 0.78 }}>
                              {formatDateTime(n.createdAt)}
                           </Typography>
                        </Stack>

                        <Typography
                           sx={{
                              mt: 0.65,
                              fontSize: 13,
                              lineHeight: 1.45,
                              fontWeight: 750,
                              whiteSpace: 'pre-wrap',
                           }}
                        >
                           {n.text}
                        </Typography>
                     </Box>
                  );
               })}

               {!history.length && (
                  <Typography sx={{ color: theme.textSoft, fontSize: 13 }}>
                     Записів ще немає
                  </Typography>
               )}
            </Stack>
         </Box>
      </Box>
   );
}