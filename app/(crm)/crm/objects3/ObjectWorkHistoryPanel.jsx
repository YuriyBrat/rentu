'use client';

import { Box, Stack, Typography, IconButton, Tooltip, Chip, CircularProgress } from '@mui/material';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';

const TYPE_LABELS = {
   note: 'Нотатка',
   call: 'Дзвінок',
   message: 'Переписка',
   meeting: 'Зустріч',
   showing: 'Показ',
   inspection: 'Огляд',
   review: 'Огляд',
   other: 'Операційка',
   pzs: 'ПЗС',
   loss: 'Втрата',
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
   if (tone === 'operationNeutral') {
      return {
         color: mode === 'light' ? '#334155' : '#dbeafe',
         bgcolor: mode === 'light' ? 'rgba(71,85,105,0.08)' : 'rgba(30,41,59,0.72)',
         border: mode === 'light' ? '1px solid rgba(14,165,233,0.20)' : '1px solid rgba(125,211,252,0.22)',
      };
   }

   if (tone === 'pzs') {
      return {
         color: mode === 'light' ? '#9d174d' : '#fbcfe8',
         bgcolor: mode === 'light' ? 'rgba(219,39,119,0.09)' : 'rgba(131,24,67,0.34)',
         border: '1px solid rgba(236,72,153,0.34)',
      };
   }

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

function getChipSx(kind, mode) {
   const base = {
      height: 21,
      fontSize: 11,
      fontWeight: 950,
      color: 'inherit',
   };

   if (kind === 'pzs') {
      return {
         ...base,
         bgcolor: mode === 'light' ? 'rgba(219,39,119,0.10) !important' : 'rgba(236,72,153,0.18) !important',
         border: '1px solid rgba(236,72,153,0.38) !important',
      };
   }

   if (kind === 'zs') {
      return {
         ...base,
         bgcolor: mode === 'light' ? 'rgba(22,163,74,0.10) !important' : 'rgba(34,197,94,0.18) !important',
         border: '1px solid rgba(34,197,94,0.36) !important',
      };
   }

   if (['showing', 'review', 'inspection'].includes(kind)) {
      return {
         ...base,
         bgcolor: mode === 'light' ? 'rgba(71,85,105,0.08) !important' : 'rgba(96,165,250,0.14) !important',
         border: mode === 'light'
            ? '1px solid rgba(14,165,233,0.22) !important'
            : '1px solid rgba(125,211,252,0.26) !important',
      };
   }

   return {
      ...base,
      bgcolor: mode === 'light' ? 'rgba(22,101,52,0.08) !important' : 'rgba(34,197,94,0.12) !important',
      border: mode === 'light'
         ? '1px solid rgba(22,101,52,0.18) !important'
         : '1px solid rgba(34,197,94,0.22) !important',
   };
}

export default function ObjectWorkHistoryPanel({
   item,
   theme,
   mode,
   actionIconSx,
   onAdd,
   onEdit,
   onDelete,
   onClose,
   items,
   loading = false,
   error = '',
   onRetry,
   inDrawer = false,
}) {
   const history = Array.isArray(items) ? items : item?.workHistory || [];

   return (
      <Box
         sx={{
            p: inDrawer ? 0 : 1,
            borderRadius: inDrawer ? 0 : 3,
            border: inDrawer ? 'none' : `1px solid ${theme.border}`,
            bgcolor: inDrawer
               ? 'transparent'
               : mode === 'light'
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
                  Нотатки, дзвінки та операційні події
               </Typography>
            </Box>

            <Stack direction="row" spacing={0.7} alignItems="center">
               <Tooltip title="Додати запис">
                  <IconButton onClick={onAdd} sx={actionIconSx}>
                     <AddRoundedIcon />
                  </IconButton>
               </Tooltip>

               {inDrawer && (
                  <Tooltip title="Закрити">
                     <IconButton onClick={onClose} sx={actionIconSx}>
                        <CloseRoundedIcon />
                     </IconButton>
                  </Tooltip>
               )}
            </Stack>
         </Stack>

         <Box
            sx={{
               maxHeight: inDrawer ? 'calc(100vh - 154px)' : 360,
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
               {loading && (
                  <Stack direction="row" spacing={1} alignItems="center" sx={{ color: theme.textSoft, py: 1 }}>
                     <CircularProgress size={18} sx={{ color: theme.accentLight }} />
                     <Typography sx={{ fontSize: 13, fontWeight: 800 }}>
                        Завантажуємо історію...
                     </Typography>
                  </Stack>
               )}

               {!!error && !loading && (
                  <Box
                     onClick={onRetry}
                     sx={{
                        p: 1,
                        borderRadius: 2.4,
                        color: mode === 'light' ? '#991b1b' : '#fecaca',
                        bgcolor: mode === 'light' ? 'rgba(239,68,68,0.08)' : 'rgba(239,68,68,0.13)',
                        border: '1px solid rgba(239,68,68,0.24)',
                        cursor: onRetry ? 'pointer' : 'default',
                     }}
                  >
                     <Typography sx={{ fontSize: 13, fontWeight: 900 }}>
                        {error}
                     </Typography>
                     {onRetry && (
                        <Typography sx={{ fontSize: 12, opacity: 0.78 }}>
                           Натисніть, щоб спробувати ще раз
                        </Typography>
                     )}
                  </Box>
               )}

               {history.slice(0, 30).map((n) => {
                  const tone = n.tone || 'info';
                  const editable = n.editable !== false && n.source !== 'operation';
                  const chipKind = n.operationKind || n.type;

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
                              label={n.label || TYPE_LABELS[n.type] || 'Запис'}
                              size="small"
                              sx={getChipSx(chipKind, mode)}
                           />

                            {n.source === 'operation' ? (
                               <Chip
                                  label={n.meta || 'Операційка'}
                                  size="small"
                                  sx={getChipSx(chipKind, mode)}
                               />
                            ) : (
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
                            )}

                            <Typography sx={{ ml: 'auto', fontSize: 11, opacity: 0.78 }}>
                               {formatDateTime(n.createdAt)}
                            </Typography>

                             {editable && (
                             <Stack direction="row" spacing={0.35}>
                               <Tooltip title="Редагувати">
                                  <IconButton
                                     size="small"
                                     onClick={() => onEdit?.(n)}
                                     sx={{
                                        width: 24,
                                        height: 24,
                                        color: 'inherit',
                                        opacity: 0.78,
                                        border: '1px solid currentColor',
                                        '&:hover': { opacity: 1 },
                                     }}
                                  >
                                     <EditRoundedIcon sx={{ fontSize: 15 }} />
                                  </IconButton>
                               </Tooltip>

                               <Tooltip title="Видалити">
                                  <IconButton
                                     size="small"
                                     onClick={() => onDelete?.(n)}
                                     sx={{
                                        width: 24,
                                        height: 24,
                                        color: 'inherit',
                                        opacity: 0.78,
                                        border: '1px solid currentColor',
                                        '&:hover': { opacity: 1 },
                                     }}
                                  >
                                     <DeleteOutlineRoundedIcon sx={{ fontSize: 15 }} />
                                  </IconButton>
                               </Tooltip>
                             </Stack>
                             )}
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

                {!loading && !error && !history.length && (
                  <Typography sx={{ color: theme.textSoft, fontSize: 13 }}>
                     Записів ще немає
                  </Typography>
               )}
            </Stack>
         </Box>
      </Box>
   );
}
