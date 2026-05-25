'use client';

import { Box, Button, Chip, IconButton, Stack, Tooltip, Typography } from '@mui/material';

import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import ContentCopyRoundedIcon from '@mui/icons-material/ContentCopyRounded';
import DifferenceRoundedIcon from '@mui/icons-material/DifferenceRounded';
import OpenInNewRoundedIcon from '@mui/icons-material/OpenInNewRounded';
import ReportProblemRoundedIcon from '@mui/icons-material/ReportProblemRounded';
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded';

import { useCRMTheme } from '@/app/(crm)/crm/context/CRMThemeContext';

function formatMoney(value, currency = 'USD') {
   if (!value && value !== 0) return '—';
   return `${Number(value).toLocaleString('uk-UA')} ${currency || ''}`;
}

function getImage(item) {
   const image = Array.isArray(item?.images) ? item.images[0] : null;
   if (typeof image === 'string') return image;
   return image?.url || '/krm/logo-krm.png';
}

function buildAddress(item) {
   return item?.location_text ||
      [item?.location?.city, item?.location?.street, item?.location?.number].filter(Boolean).join(', ') ||
      'Адреса не вказана';
}

export const STAGE_META = {
   raw: { label: 'Новий', color: '#60a5fa' },
   processing: { label: 'В роботі', color: '#f59e0b' },
   called: { label: 'Продзвонено', color: '#a78bfa' },
   qualified: { label: 'В базі ринку', color: '#22c55e' },
   duplicate: { label: 'Дубль', color: '#94a3b8' },
   fake: { label: 'Фейк', color: '#ef4444' },
   rejected: { label: 'Відхилено', color: '#f97316' },
   moved: { label: 'В обʼєктах', color: '#14b8a6' },
};

export default function ParsingRowCard({ item, onOpen, onStage }) {
   const { theme, mode } = useCRMTheme();
   const meta = STAGE_META[item?.stage] || STAGE_META.raw;

   const iconButtonSx = {
      width: 34,
      height: 34,
      borderRadius: 2,
      color: theme.text,
      border: `1px solid ${theme.border}`,
      bgcolor: mode === 'light' ? 'rgba(124,58,237,0.035)' : 'rgba(255,255,255,0.035)',
      '&:hover': { bgcolor: theme.hover },
   };

   return (
      <Box
         sx={{
            minHeight: 68,
            px: 1.15,
            py: 0.9,
            borderRadius: 2,
            border: `1px solid ${theme.border}`,
            bgcolor: mode === 'light' ? 'rgba(255,255,255,0.78)' : 'rgba(255,255,255,0.025)',
            display: 'grid',
            gridTemplateColumns: {
               xs: '42px 1fr',
               lg: '46px minmax(220px, 1.45fr) 90px 96px 100px 140px 96px 190px',
            },
            gap: 1,
            alignItems: 'center',
            boxShadow: mode === 'light' ? '0 10px 24px rgba(124,58,237,0.05)' : 'none',
         }}
      >
         <Box
            component="img"
            src={getImage(item)}
            alt=""
            sx={{
               width: 42,
               height: 42,
               borderRadius: 1.5,
               objectFit: 'cover',
               border: `1px solid ${theme.border}`,
            }}
         />

         <Stack spacing={0.25} minWidth={0}>
            <Stack direction="row" spacing={0.65} alignItems="center" minWidth={0}>
               <Chip
                  label={item?.source || 'manual'}
                  size="small"
                  sx={{
                     height: 21,
                     borderRadius: 1.5,
                     fontSize: 11,
                     fontWeight: 900,
                     color: theme.text,
                     bgcolor: theme.hover,
                  }}
               />
               <Typography sx={{ color: theme.text, fontWeight: 950, fontSize: 13.5 }} noWrap>
                  {item?.title || 'Без назви'}
               </Typography>
            </Stack>

            <Typography sx={{ color: theme.textSoft, fontSize: 12 }} noWrap>
               {buildAddress(item)}
            </Typography>
         </Stack>

         <Typography sx={{ color: theme.textSoft, fontSize: 12.5, display: { xs: 'none', lg: 'block' } }}>
            {item?.rooms ? `${item.rooms} кімн.` : '—'}
         </Typography>

         <Typography sx={{ color: theme.textSoft, fontSize: 12.5, display: { xs: 'none', lg: 'block' } }}>
            {item?.square_tot ? `${item.square_tot} м²` : '—'}
         </Typography>

         <Typography sx={{ color: theme.text, fontWeight: 950, fontSize: 12.5, display: { xs: 'none', lg: 'block' } }}>
            {formatMoney(item?.cost, item?.currency)}
         </Typography>

         <Typography sx={{ color: theme.textSoft, fontSize: 12.5, display: { xs: 'none', lg: 'block' } }} noWrap>
            {item?.phone || item?.leadname || 'Контакт —'}
         </Typography>

         <Chip
            label={meta.label}
            size="small"
            sx={{
               justifySelf: { xs: 'start', lg: 'stretch' },
               display: { xs: 'none', lg: 'inline-flex' },
               height: 26,
               borderRadius: 1.5,
               fontWeight: 950,
               color: meta.color,
               bgcolor: `${meta.color}18`,
               border: `1px solid ${meta.color}45`,
            }}
         />

         <Stack
            direction="row"
            spacing={0.45}
            alignItems="center"
            justifyContent="flex-end"
            sx={{ gridColumn: { xs: '1 / -1', lg: 'auto' } }}
         >
            <Typography sx={{ color: theme.textSoft, fontSize: 11, mr: 'auto', display: { xs: 'block', lg: 'none' } }}>
               {meta.label}
            </Typography>

            {item?.sourceUrl && (
               <Tooltip title="Відкрити джерело">
                  <IconButton component="a" href={item.sourceUrl} target="_blank" sx={iconButtonSx}>
                     <OpenInNewRoundedIcon fontSize="small" />
                  </IconButton>
               </Tooltip>
            )}

            <Tooltip title="Дубль">
               <IconButton onClick={() => onStage(item, 'duplicate')} sx={iconButtonSx}>
                  <DifferenceRoundedIcon fontSize="small" />
               </IconButton>
            </Tooltip>

            <Tooltip title="Фейк">
               <IconButton onClick={() => onStage(item, 'fake')} sx={{ ...iconButtonSx, color: '#f87171' }}>
                  <ReportProblemRoundedIcon fontSize="small" />
               </IconButton>
            </Tooltip>

            <Tooltip title="В базу ринку">
               <IconButton onClick={() => onStage(item, 'qualified')} sx={{ ...iconButtonSx, color: '#22c55e' }}>
                  <CheckCircleRoundedIcon fontSize="small" />
               </IconButton>
            </Tooltip>

            <Tooltip title="Копіювати телефон">
               <span>
                  <IconButton
                     disabled={!item?.phone}
                     onClick={() => navigator.clipboard.writeText(item.phone)}
                     sx={iconButtonSx}
                  >
                     <ContentCopyRoundedIcon fontSize="small" />
                  </IconButton>
               </span>
            </Tooltip>

            <Button
               onClick={() => onOpen(item)}
               startIcon={<VisibilityRoundedIcon />}
               sx={{
                  minHeight: 34,
                  borderRadius: 2,
                  px: 1.25,
                  fontSize: 12,
                  fontWeight: 950,
                  color: '#0b0b12',
                  background: `linear-gradient(90deg, ${theme.accent}, ${theme.accentLight})`,
               }}
            >
               Відкрити
            </Button>
         </Stack>
      </Box>
   );
}
