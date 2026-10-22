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

const TONE_ACCENTS = {
   operationNeutral: '#7dd3fc',
   pzs: '#e879f9',
   positive: '#34d399',
   negative: '#fb7185',
   important: '#60a5fa',
   info: '#fbbf24',
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
   const accent = TONE_ACCENTS[tone] || TONE_ACCENTS.info;
   const darkBg = tone === 'operationNeutral'
      ? 'rgba(30,41,59,0.58)'
      : 'rgba(30,30,44,0.56)';
   const lightBg = tone === 'operationNeutral'
      ? 'rgba(248,250,252,0.92)'
      : 'rgba(255,255,255,0.92)';

   if (tone === 'operationNeutral') {
      return {
         color: mode === 'light' ? '#334155' : '#dbeafe',
         bgcolor: mode === 'light' ? lightBg : darkBg,
         border: mode === 'light' ? '1px solid rgba(14,165,233,0.18)' : '1px solid rgba(125,211,252,0.22)',
         boxShadow: `inset 3px 0 0 ${accent}55`,
      };
   }

   if (tone === 'pzs') {
      return {
         color: mode === 'light' ? '#475569' : '#f1f5f9',
         bgcolor: mode === 'light' ? lightBg : darkBg,
         border: '1px solid rgba(236,72,153,0.24)',
         boxShadow: `inset 3px 0 0 ${accent}55`,
      };
   }

   if (tone === 'positive') {
      return {
         color: mode === 'light' ? '#334155' : '#f1f5f9',
         bgcolor: mode === 'light' ? lightBg : darkBg,
         border: '1px solid rgba(34,197,94,0.20)',
         boxShadow: `inset 3px 0 0 ${accent}55`,
      };
   }

   if (tone === 'negative') {
      return {
         color: mode === 'light' ? '#334155' : '#f1f5f9',
         bgcolor: mode === 'light' ? lightBg : darkBg,
         border: '1px solid rgba(239,68,68,0.20)',
         boxShadow: `inset 3px 0 0 ${accent}55`,
      };
   }

   if (tone === 'important') {
      return {
         color: mode === 'light' ? '#334155' : '#f1f5f9',
         bgcolor: mode === 'light' ? lightBg : darkBg,
         border: '1px solid rgba(59,130,246,0.22)',
         boxShadow: `inset 3px 0 0 ${accent}55`,
      };
   }

   return {
      color: mode === 'light' ? '#334155' : '#f1f5f9',
      bgcolor: mode === 'light' ? lightBg : darkBg,
      border: '1px solid rgba(245,158,11,0.20)',
      boxShadow: `inset 3px 0 0 ${accent}55`,
   };
}

function getChipSx(kind, mode, tone = '') {
   const base = {
      height: 21,
      fontSize: 11,
      fontWeight: 850,
      color: 'inherit',
   };

   const chipTone = tone || kind;

   if (chipTone === 'pzs') {
      return {
         ...base,
         color: mode === 'light' ? '#9d174d' : '#fbcfe8',
         bgcolor: mode === 'light' ? 'rgba(219,39,119,0.08) !important' : 'rgba(236,72,153,0.13) !important',
         border: '1px solid rgba(236,72,153,0.28) !important',
      };
   }

   if (chipTone === 'zs' || chipTone === 'positive') {
      return {
         ...base,
         color: mode === 'light' ? '#166534' : '#bbf7d0',
         bgcolor: mode === 'light' ? 'rgba(22,163,74,0.08) !important' : 'rgba(34,197,94,0.12) !important',
         border: '1px solid rgba(34,197,94,0.24) !important',
      };
   }

   if (['showing', 'review', 'inspection'].includes(kind)) {
      return {
         ...base,
         color: mode === 'light' ? '#334155' : '#dbeafe',
         bgcolor: mode === 'light' ? 'rgba(71,85,105,0.07) !important' : 'rgba(96,165,250,0.10) !important',
         border: mode === 'light'
            ? '1px solid rgba(14,165,233,0.18) !important'
            : '1px solid rgba(125,211,252,0.22) !important',
      };
   }

   if (chipTone === 'negative') {
      return {
         ...base,
         color: mode === 'light' ? '#991b1b' : '#fecaca',
         bgcolor: mode === 'light' ? 'rgba(239,68,68,0.07) !important' : 'rgba(239,68,68,0.11) !important',
         border: '1px solid rgba(239,68,68,0.22) !important',
      };
   }

   if (chipTone === 'important') {
      return {
         ...base,
         color: mode === 'light' ? '#1d4ed8' : '#bfdbfe',
         bgcolor: mode === 'light' ? 'rgba(59,130,246,0.07) !important' : 'rgba(59,130,246,0.11) !important',
         border: '1px solid rgba(59,130,246,0.22) !important',
      };
   }

   return {
      ...base,
      color: mode === 'light' ? '#92400e' : '#fde68a',
      bgcolor: mode === 'light' ? 'rgba(245,158,11,0.08) !important' : 'rgba(245,158,11,0.11) !important',
      border: mode === 'light'
         ? '1px solid rgba(245,158,11,0.18) !important'
         : '1px solid rgba(245,158,11,0.22) !important',
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
                  const details = Array.isArray(n.details) ? n.details.filter(Boolean) : [];

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
                               sx={getChipSx(chipKind, mode, chipKind)}
                            />

                            {n.source === 'operation' ? (
                               <Chip
                                   label={n.meta || 'Операційка'}
                                   size="small"
                                   sx={getChipSx(chipKind, mode, chipKind)}
                                />
                            ) : (
                               <Chip
                                  label={TONE_LABELS[tone] || 'Інформуюча'}
                                  size="small"
                                   sx={{
                                      ...getChipSx('', mode, tone),
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
                              fontWeight: 500,
                              whiteSpace: 'pre-wrap',
                              color: mode === 'light' ? 'rgba(15,23,42,0.82)' : 'rgba(241,245,249,0.84)',
                            }}
                         >
                            {n.text}
                         </Typography>

                         {!!details.length && (
                            <Stack spacing={0.35} sx={{ mt: 0.6 }}>
                               {details.map((line, index) => (
                                  <Typography
                                     key={`${n._id || n.createdAt}-detail-${index}`}
                                     sx={{
                                        fontSize: 12.2,
                                        lineHeight: 1.35,
                                        fontWeight: 500,
                                        color: mode === 'light' ? 'rgba(71,85,105,0.78)' : 'rgba(203,213,225,0.76)',
                                     }}
                                  >
                                     {line}
                                  </Typography>
                               ))}
                            </Stack>
                         )}
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
