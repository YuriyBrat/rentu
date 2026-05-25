'use client';

import { Box, Chip, IconButton, Stack, Tooltip, Typography } from '@mui/material';

import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import ContentCopyRoundedIcon from '@mui/icons-material/ContentCopyRounded';
import DifferenceRoundedIcon from '@mui/icons-material/DifferenceRounded';
import HelpOutlineRoundedIcon from '@mui/icons-material/HelpOutlineRounded';
import OpenInNewRoundedIcon from '@mui/icons-material/OpenInNewRounded';
import PersonRoundedIcon from '@mui/icons-material/PersonRounded';
import PestControlRoundedIcon from '@mui/icons-material/PestControlRounded';
import ReportProblemRoundedIcon from '@mui/icons-material/ReportProblemRounded';
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded';

import { useCRMTheme } from '@/app/(crm)/crm/context/CRMThemeContext';

function formatMoney(value, currency = 'USD') {
   if (!value && value !== 0) return '-';
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

function getSourceLabel(source) {
   if (!source || source === 'manual') return 'ручне';
   if (source === 'olx') return 'OLX';
   if (source === 'dimria') return 'DIM.RIA';
   if (source === 'rieltor') return 'RIELTOR';
   if (source === 'telegram') return 'TG';
   if (source === 'facebook') return 'FB';
   if (source === 'instagram') return 'IG';
   return source;
}

function getPhoneCount(item) {
   const raw =
      item?.phoneCount ??
      item?.phoneHits ??
      item?.attrs?.phoneCount ??
      item?.attrs?.phoneHits ??
      item?.attrs?.phoneMatches ??
      0;
   const n = Number(raw);
   return Number.isFinite(n) && n > 1 ? n : 0;
}

function getContactKind(item) {
   const raw = String(
      item?.attrs?.contactType ||
      item?.attrs?.sellerType ||
      item?.reviewStatus ||
      ''
   ).toLowerCase();

   if (['owner', 'власник', 'actual_owner'].includes(raw)) {
      return { label: 'Власник', short: 'вл', color: '#22c55e', icon: <PersonRoundedIcon fontSize="small" /> };
   }

   if (['realtor', 'agent', 'makler', 'маклер', 'агент'].includes(raw)) {
      return { label: 'Маклер', short: 'мк', color: '#ef4444', icon: <PestControlRoundedIcon fontSize="small" /> };
   }

   return { label: 'Хто це?', short: '?', color: '#f59e0b', icon: <HelpOutlineRoundedIcon fontSize="small" /> };
}

export const STAGE_META = {
   raw: { label: 'Новий', compact: 'Новий', color: '#60a5fa' },
   processing: { label: 'В роботі', compact: 'Робота', color: '#f59e0b' },
   called: { label: 'Продзвонено', compact: 'Дзвінок', color: '#a78bfa' },
   qualified: { label: 'БАЗА', compact: 'БАЗА', color: '#22c55e' },
   duplicate: { label: 'Дубль', compact: 'Дубль', color: '#94a3b8' },
   fake: { label: 'Фейк', compact: 'Фейк', color: '#ef4444' },
   rejected: { label: 'Відхилено', compact: 'Відх.', color: '#f97316' },
   moved: { label: 'В обʼєктах', compact: 'Обʼєкт', color: '#14b8a6' },
};

function ContactCell({ item, theme }) {
   const count = getPhoneCount(item);
   const kind = getContactKind(item);

   return (
      <Stack spacing={0.15} sx={{ minWidth: 0, display: { xs: 'none', lg: 'flex' } }}>
         <Stack direction="row" spacing={0.45} alignItems="center" minWidth={0}>
            <Typography sx={{ color: theme.text, fontWeight: 850, fontSize: 12.4 }} noWrap>
               {item?.phone || item?.leadname || 'Контакт -'}
            </Typography>

            {!!count && (
               <Tooltip title="Скільки разів номер зустрічається в базі">
                  <Box
                     component="span"
                     sx={{
                        minWidth: 17,
                        height: 17,
                        px: 0.45,
                        borderRadius: 1,
                        color: count > 2 ? '#ef4444' : '#8b5cf6',
                        bgcolor: count > 2 ? 'rgba(239,68,68,0.12)' : 'rgba(139,92,246,0.14)',
                        border: `1px solid ${count > 2 ? 'rgba(239,68,68,0.38)' : 'rgba(139,92,246,0.35)'}`,
                        fontSize: 10,
                        fontWeight: 950,
                        lineHeight: '15px',
                        textAlign: 'center',
                     }}
                  >
                     {count}
                  </Box>
               </Tooltip>
            )}
         </Stack>

         <Tooltip title={kind.label}>
            <Stack direction="row" spacing={0.45} alignItems="center" sx={{ color: kind.color, minWidth: 0 }}>
               <Box sx={{ display: 'flex', '& svg': { fontSize: 15 } }}>{kind.icon}</Box>
               <Typography sx={{ fontSize: 10.5, fontWeight: 950, lineHeight: 1 }} noWrap>
                  {kind.label}
               </Typography>
            </Stack>
         </Tooltip>
      </Stack>
   );
}

export default function ParsingRowCard({ item, onOpen, onStage }) {
   const { theme, mode } = useCRMTheme();
   const meta = STAGE_META[item?.stage] || STAGE_META.raw;

   const iconButtonSx = {
      width: 31,
      height: 31,
      borderRadius: 2,
      color: theme.text,
      border: `1px solid ${theme.border}`,
      bgcolor: mode === 'light' ? 'rgba(124,58,237,0.035)' : 'rgba(255,255,255,0.035)',
      flex: '0 0 auto',
      '&:hover': { bgcolor: theme.hover },
   };

   return (
      <Box
         sx={{
            minHeight: 66,
            px: 1.05,
            py: 0.8,
            borderRadius: 2,
            border: `1px solid ${theme.border}`,
            bgcolor: mode === 'light' ? 'rgba(255,255,255,0.78)' : 'rgba(255,255,255,0.025)',
            display: 'grid',
            gridTemplateColumns: {
               xs: '42px 1fr',
               lg: '44px minmax(190px, 1.35fr) 64px 72px 94px minmax(145px, 0.75fr) 72px minmax(204px, auto)',
            },
            gap: 0.8,
            alignItems: 'center',
            boxShadow: mode === 'light' ? '0 10px 24px rgba(124,58,237,0.05)' : 'none',
         }}
      >
         <Box
            component="img"
            src={getImage(item)}
            alt=""
            sx={{
               width: 40,
               height: 40,
               borderRadius: 1.5,
               objectFit: 'cover',
               border: `1px solid ${theme.border}`,
            }}
         />

         <Stack spacing={0.25} minWidth={0}>
            <Stack direction="row" spacing={0.6} alignItems="center" minWidth={0}>
               <Chip
                  label={getSourceLabel(item?.source)}
                  size="small"
                  sx={{
                     height: 21,
                     borderRadius: 1.5,
                     fontSize: 10.5,
                     fontWeight: 900,
                     color: theme.text,
                     bgcolor: theme.hover,
                  }}
               />
               <Typography sx={{ color: theme.text, fontWeight: 950, fontSize: 13.3 }} noWrap>
                  {item?.title || 'Без назви'}
               </Typography>
            </Stack>

            <Typography sx={{ color: theme.textSoft, fontSize: 11.8 }} noWrap>
               {buildAddress(item)}
            </Typography>
         </Stack>

         <Typography sx={{ color: theme.textSoft, fontSize: 12.2, display: { xs: 'none', lg: 'block' } }}>
            {item?.rooms ? `${item.rooms} кімн.` : '-'}
         </Typography>

         <Typography sx={{ color: theme.textSoft, fontSize: 12.2, display: { xs: 'none', lg: 'block' } }}>
            {item?.square_tot ? `${item.square_tot} м²` : '-'}
         </Typography>

         <Typography sx={{ color: theme.text, fontWeight: 950, fontSize: 12.2, display: { xs: 'none', lg: 'block' } }}>
            {formatMoney(item?.cost, item?.currency)}
         </Typography>

         <ContactCell item={item} theme={theme} />

         <Chip
            label={meta.compact || meta.label}
            size="small"
            sx={{
               justifySelf: { xs: 'start', lg: 'stretch' },
               display: { xs: 'none', lg: 'inline-flex' },
               height: 25,
               borderRadius: 1.5,
               fontWeight: 950,
               color: meta.color,
               bgcolor: `${meta.color}18`,
               border: `1px solid ${meta.color}45`,
               '& .MuiChip-label': {
                  px: 0.8,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
               },
            }}
         />

         <Stack
            direction="row"
            spacing={0.35}
            alignItems="center"
            justifyContent="flex-end"
            sx={{
               gridColumn: { xs: '1 / -1', lg: 'auto' },
               minWidth: 0,
               flexWrap: 'nowrap',
            }}
         >
            <Typography sx={{ color: theme.textSoft, fontSize: 11, mr: 'auto', display: { xs: 'block', lg: 'none' } }}>
               {meta.label} · {item?.phone || 'контакт -'}
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

            <Tooltip title="Відкрити">
               <IconButton
                  onClick={() => onOpen(item)}
                  sx={{
                     ...iconButtonSx,
                     color: '#0b0b12',
                     background: `linear-gradient(90deg, ${theme.accent}, ${theme.accentLight})`,
                     borderColor: 'transparent',
                     '&:hover': {
                        background: `linear-gradient(90deg, ${theme.accentLight}, ${theme.accent})`,
                     },
                  }}
               >
                  <VisibilityRoundedIcon fontSize="small" />
               </IconButton>
            </Tooltip>
         </Stack>
      </Box>
   );
}
