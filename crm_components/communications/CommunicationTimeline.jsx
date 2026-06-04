'use client';

import { Box, Button, Chip, Stack, Typography } from '@mui/material';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import {
   getCommunicationToneMeta,
   getCommunicationTypeLabel,
} from './communicationMeta';

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
   });
}

function getEmployeeName(employee) {
   if (!employee) return '—';
   return employee.fullName || [employee.surname, employee.name].filter(Boolean).join(' ') || employee.name || '—';
}

export default function CommunicationTimeline({
   items = [],
   loading = false,
   onAdd,
   theme,
   mode,
}) {
   return (
      <Stack spacing={1.1}>
         <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1}>
            <Typography sx={{ color: theme.text, fontWeight: 950 }}>
               Комунікації
            </Typography>
            <Button
               startIcon={<AddRoundedIcon />}
               onClick={onAdd}
               sx={{
                  borderRadius: 2.5,
                  fontWeight: 950,
                  color: '#0b0b12',
                  bgcolor: theme.accent,
               }}
            >
               Додати
            </Button>
         </Stack>

         {loading && (
            <Typography sx={{ color: theme.textSoft, fontSize: 13 }}>
               Завантаження...
            </Typography>
         )}

         {!loading && !items.length && (
            <Box
               sx={{
                  p: 1.2,
                  borderRadius: 2.5,
                  border: `1px solid ${theme.border}`,
                  bgcolor: mode === 'light' ? 'rgba(124,58,237,0.035)' : 'rgba(255,255,255,0.025)',
               }}
            >
               <Typography sx={{ color: theme.textSoft, fontSize: 13 }}>
                  Історії комунікацій ще немає.
               </Typography>
            </Box>
         )}

         {items.map((item) => {
            const tone = getCommunicationToneMeta(item.tone);

            return (
               <Box
                  key={item._id}
                  sx={{
                     p: 1.2,
                     borderRadius: 2.5,
                     border: `1px solid ${theme.border}`,
                     bgcolor: mode === 'light' ? 'rgba(255,255,255,0.75)' : 'rgba(255,255,255,0.025)',
                  }}
               >
                  <Stack direction="row" spacing={0.7} alignItems="center" flexWrap="wrap" useFlexGap sx={{ mb: 0.75 }}>
                     <Chip
                        label={getCommunicationTypeLabel(item.type)}
                        size="small"
                        sx={{ height: 23, borderRadius: 1.5, fontWeight: 900, color: theme.text, bgcolor: theme.hover }}
                     />
                     <Chip
                        label={tone.label}
                        size="small"
                        sx={{
                           height: 23,
                           borderRadius: 1.5,
                           fontWeight: 900,
                           color: tone.color,
                           bgcolor: `${tone.color}18`,
                           border: `1px solid ${tone.color}35`,
                        }}
                     />
                     <Typography sx={{ color: theme.textSoft, fontSize: 12, ml: 'auto' }}>
                        {formatDateTime(item.happenedAt)}
                     </Typography>
                  </Stack>

                  <Typography sx={{ color: theme.text, fontSize: 14, lineHeight: 1.55, whiteSpace: 'pre-wrap' }}>
                     {item.text || 'Без опису'}
                  </Typography>

                  <Typography sx={{ color: theme.textSoft, fontSize: 12, mt: 0.75 }}>
                     Відповідальний: {getEmployeeName(item.responsibleEmployee)} · Внесено: {formatDateTime(item.createdAt)}
                  </Typography>
               </Box>
            );
         })}
      </Stack>
   );
}
