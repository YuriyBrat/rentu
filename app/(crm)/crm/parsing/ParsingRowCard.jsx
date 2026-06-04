'use client';

import { useMemo, useState } from 'react';
import { Box, Button, Chip, IconButton, Stack, Tooltip, Typography } from '@mui/material';

import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import HelpOutlineRoundedIcon from '@mui/icons-material/HelpOutlineRounded';
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';
import KeyboardArrowUpRoundedIcon from '@mui/icons-material/KeyboardArrowUpRounded';
import OpenInNewRoundedIcon from '@mui/icons-material/OpenInNewRounded';
import PersonRoundedIcon from '@mui/icons-material/PersonRounded';
import PestControlRoundedIcon from '@mui/icons-material/PestControlRounded';
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded';

import { useCRMTheme } from '@/app/(crm)/crm/context/CRMThemeContext';
import ImageLightbox from '@/crm_components/ImageLightbox';

function formatMoney(value, currency = 'USD') {
   if (!value && value !== 0) return '-';
   return `${Math.round(Number(value)).toLocaleString('uk-UA')} ${currency || ''}`;
}

function formatImportDate(value) {
   if (!value) return '-';
   const d = new Date(value);
   if (Number.isNaN(d.getTime())) return '-';

   return d.toLocaleDateString('uk-UA', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit',
   });
}

function formatShortTime(value) {
   if (!value) return '';
   const d = new Date(value);
   if (Number.isNaN(d.getTime())) return '';

   return d.toLocaleTimeString('uk-UA', {
      hour: '2-digit',
      minute: '2-digit',
   });
}

function formatFullDateTime(value) {
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

function formatSourceDateTime(value) {
   if (!value) return '-';
   return formatFullDateTime(value);
}

function getDaysSince(value) {
   if (!value) return null;
   const d = new Date(value);
   if (Number.isNaN(d.getTime())) return null;

   return Math.max(0, Math.floor((Date.now() - d.getTime()) / 86400000));
}

function getCommunicationAgeMeta(days, theme) {
   if (days === null) {
      return {
         label: '—',
         color: theme.textSoft,
         bg: 'rgba(148,163,184,0.12)',
         border: 'rgba(148,163,184,0.28)',
      };
   }

   if (days <= 1) return { label: `${days}д`, color: '#22c55e', bg: 'rgba(34,197,94,0.13)', border: 'rgba(34,197,94,0.35)' };
   if (days <= 3) return { label: `${days}д`, color: '#f59e0b', bg: 'rgba(245,158,11,0.13)', border: 'rgba(245,158,11,0.35)' };
   return { label: `${days}д`, color: '#ef4444', bg: 'rgba(239,68,68,0.12)', border: 'rgba(239,68,68,0.35)' };
}

function getRoomFloorText(item) {
   const rooms = item?.rooms ? `${item.rooms}к` : '-';
   const floor = item?.floor || item?.floors ? `${item?.floor || '-'}/${item?.floors || '-'}` : '';
   return floor ? `${rooms} · ${floor}` : rooms;
}

function getImage(item) {
   const image = Array.isArray(item?.images) ? item.images[0] : null;
   if (typeof image === 'string') return image;
   return image?.url || '/krm/logo-krm.png';
}

function getRoomFloorDisplay(item) {
   const rooms = item?.rooms ? `${item.rooms}к` : '-';
   const floorNum = Number(item?.floor);
   const floorsNum = Number(item?.floors);
   const floor = Number.isFinite(floorNum) &&
      Number.isFinite(floorsNum) &&
      floorNum > 0 &&
      floorsNum > 0 &&
      floorNum <= floorsNum &&
      floorsNum <= 40
      ? `${floorNum}/${floorsNum}`
      : '';

   return floor ? `${rooms} · ${floor}` : rooms;
}

function getImageUrl(image) {
   if (typeof image === 'string') return image;
   return image?.variants?.full || image?.variants?.card || image?.url || image?.sourceUrl || '';
}

function normalizeLightboxImages(images) {
   return (Array.isArray(images) ? images : [])
      .map((image) => {
         const url = getImageUrl(image);
         return url ? { ...(typeof image === 'object' ? image : {}), url } : null;
      })
      .filter(Boolean);
}

function getSourceExternalId(item) {
   return item?.attrs?.reamak?.siteId || item?.sourceId || item?.attrs?.realtyId || item?.attrs?.webId || '';
}

function getReamakId(item) {
   return item?.reamakId || item?.attrs?.reamak?.reamakId || item?.attrs?.reamakId || item?.attrs?.reamak_id || '';
}

function getOriginalSiteName(item) {
   const name = item?.attrs?.reamak?.siteName || item?.attrs?.sourceSite || '';
   return String(name).toLowerCase() === 'reamak' ? '' : name;
}

function getSiteDisplayName(item) {
   const original = getOriginalSiteName(item);
   if (original) return original;

   const detected = getSourceFromUrl(item?.sourceUrl);
   return detected ? getSourceLabel(detected) : '-';
}

function getImportKindLabel(item) {
   if (item?.source === 'reamak') return 'reamak';
   if (item?.source === 'dimria') return 'авто';
   if (item?.source === 'manual') return 'ручне';
   return item?.source || 'ручне';
}

function getPriceHistory(item) {
   const history = Array.isArray(item?.priceHistory) ? item.priceHistory : [];
   const attrsHistory = Array.isArray(item?.attrs?.priceHistory) ? item.attrs.priceHistory : [];

   return [...history, ...attrsHistory]
      .filter((entry) => entry?.price || entry?.cost)
      .map((entry) => ({
         price: Number(entry.price ?? entry.cost),
         currency: entry.currency || item?.currency || 'USD',
         changedAt: entry.changedAt || entry.detectedAt || entry.date,
         detectedAt: entry.detectedAt,
         source: entry.source || item?.source || '',
      }))
      .filter((entry) => Number.isFinite(entry.price))
      .sort((a, b) => new Date(a.changedAt || a.detectedAt || 0) - new Date(b.changedAt || b.detectedAt || 0));
}

function getPreviousPrice(item) {
   const current = Number(item?.cost);
   const history = getPriceHistory(item);
   const previous = [...history].reverse().find((entry) => Math.abs(Number(entry.price) - current) >= 100);
   return previous || null;
}

function getSourceDates(item) {
   const attrs = item?.attrs || {};

   return [
      ['На сайті', attrs.sourcePublishedAt || attrs.sourceAddedAt],
      ['Оновлено на сайті', attrs.sourceUpdatedAt],
      ['Ціна змінена', attrs.sourcePriceChangedAt],
      ['Скан CRM', attrs.sourceLastScannedAt || item?.sourceCheckedAt],
      ['Імпорт CRM', item?.importedAt || item?.createdAt],
   ].filter(([, value]) => value);
}

function buildDateTooltip(item) {
   const attrs = item?.attrs || {};
   const rows = [
      ['Додано на сайт', attrs.sourcePublishedAt || attrs.sourceAddedAt],
      ['Остання зміна на сайті', attrs.sourceUpdatedAt],
      ['Зміна ціни на сайті', attrs.sourcePriceChangedAt],
      ['Останній скан CRM', attrs.sourceLastScannedAt || item?.sourceCheckedAt],
   ];

   const unique = [];
   const seen = new Set();

   rows.forEach(([label, value]) => {
      if (!value) return;
      const key = `${label}:${value}`;
      if (seen.has(key)) return;
      seen.add(key);
      unique.push(`${label}: ${formatFullDateTime(value)}`);
   });

   return unique.join('\n') || 'Даних сайту поки немає';
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
   if (source === 'lun') return 'LUN';
   if (source === 'realestate') return 'RealEstate';
   if (source === 'est') return 'EST';
   if (source === 'obyava') return 'OBYAVA';
   if (source === 'telegram') return 'TG';
   if (source === 'facebook') return 'FB';
   if (source === 'instagram') return 'IG';
   if (source === 'tiktok') return 'TikTok';
   return source;
}

function getSourceFromUrl(url) {
   const value = String(url || '').toLowerCase();
   if (value.includes('olx.')) return 'olx';
   if (value.includes('dom.ria') || value.includes('dim.ria')) return 'dimria';
   if (value.includes('rieltor.')) return 'rieltor';
   if (value.includes('lun.')) return 'lun';
   if (value.includes('realestate')) return 'realestate';
   if (value.includes('est.')) return 'est';
   if (value.includes('obyava')) return 'obyava';
   if (value.includes('facebook') || value.includes('fb.')) return 'facebook';
   if (value.includes('telegram') || value.includes('t.me')) return 'telegram';
   if (value.includes('tiktok')) return 'tiktok';
   return '';
}

function getSourceStatusMeta(item, theme) {
   if (!item?.sourceUrl) {
      return {
         label: 'нема ссилки',
         color: theme.textSoft,
         bg: 'rgba(148,163,184,0.12)',
         border: 'rgba(148,163,184,0.30)',
      };
   }

   const status = item?.sourceStatus || 'unknown';
   if (status === 'active') return { label: 'активна', color: '#22c55e', bg: 'rgba(34,197,94,0.13)', border: 'rgba(34,197,94,0.38)' };
   if (status === 'inactive' || status === 'removed') return { label: 'неактивна', color: '#ef4444', bg: 'rgba(239,68,68,0.12)', border: 'rgba(239,68,68,0.35)' };
   if (status === 'error') return { label: 'помилка', color: '#f97316', bg: 'rgba(249,115,22,0.13)', border: 'rgba(249,115,22,0.35)' };
   return { label: 'невідомо', color: '#f59e0b', bg: 'rgba(245,158,11,0.13)', border: 'rgba(245,158,11,0.35)' };
}

function SourceButton({ item, theme }) {
   const detected = getSourceFromUrl(item?.sourceUrl);
   const originalSite = getOriginalSiteName(item);
   const source = detected || (item?.source && item.source !== 'manual' ? item.source : '');
   const label = originalSite || getSourceLabel(source || item?.source);
   const status = getSourceStatusMeta(item, theme);
   const disabled = !item?.sourceUrl;

   return (
      <Tooltip title={`${status.label}${item?.sourceUrl ? ': ' + item.sourceUrl : ''}`}>
         <span>
            <Button
               component={disabled ? 'button' : 'a'}
               href={disabled ? undefined : item.sourceUrl}
               target={disabled ? undefined : '_blank'}
               rel="noreferrer"
               onClick={(event) => event.stopPropagation()}
               disabled={disabled}
               endIcon={!disabled ? <OpenInNewRoundedIcon sx={{ fontSize: '14px !important' }} /> : null}
               sx={{
                  minWidth: 0,
                  height: 23,
                  px: 0.8,
                  borderRadius: 1.5,
                  fontSize: 10.5,
                  fontWeight: 950,
                  lineHeight: 1,
                  color: `${status.color} !important`,
                  bgcolor: status.bg,
                  border: `1px solid ${status.border}`,
                  textTransform: 'none',
                  '& .MuiButton-endIcon': { ml: 0.35 },
                  '&:hover': {
                     bgcolor: status.bg,
                     borderColor: status.color,
                  },
                  '&.Mui-disabled': {
                     color: `${theme.textSoft} !important`,
                     borderColor: 'rgba(148,163,184,0.22)',
                  },
               }}
            >
               {label}
            </Button>
         </span>
      </Tooltip>
   );
}

function getPhoneCount(item) {
   const raw =
      item?.phoneIntel?.total ??
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
   const suggested = item?.phoneIntel?.suggestedKind;

   if (suggested === 'realtor') {
      return { label: 'Маклер', short: 'мк', color: '#ef4444', icon: <PestControlRoundedIcon fontSize="small" /> };
   }

   if (suggested === 'suspected_realtor') {
      return { label: 'Ймов. маклер', short: 'м?', color: '#f97316', icon: <PestControlRoundedIcon fontSize="small" /> };
   }

   if (suggested === 'owner') {
      return { label: 'Власник', short: 'вл', color: '#22c55e', icon: <PersonRoundedIcon fontSize="small" /> };
   }

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
   raw: { label: 'Нові', compact: 'Нові', color: '#60a5fa' },
   processing: { label: 'Нові', compact: 'Нові', color: '#60a5fa' },
   called: { label: 'Нові', compact: 'Нові', color: '#60a5fa' },
   qualified: { label: 'БАЗА', compact: 'БАЗА', color: '#22c55e' },
   duplicate: { label: 'Дубль', compact: 'Дубль', color: '#94a3b8' },
   fake: { label: 'Фейк', compact: 'Фейк', color: '#ef4444' },
   rejected: { label: 'Фейк', compact: 'Фейк', color: '#ef4444' },
   moved: { label: 'Обʼєкти', compact: 'Обʼєкти', color: '#14b8a6' },
};

function CommunicationClock({ item, theme, onClick }) {
   const age = getCommunicationAgeMeta(getDaysSince(item?.lastCommunicationAt), theme);

   return (
      <Tooltip title={`Остання комунікація: ${formatFullDateTime(item?.lastCommunicationAt)}. Натисни, щоб додати комунікацію.`}>
         <IconButton
            onClick={() => onClick?.(item)}
            sx={{
               width: 36,
               height: 36,
               borderRadius: 2,
               border: `1px solid ${age.border}`,
               bgcolor: age.bg,
               color: age.color,
               flex: '0 0 auto',
               '&:hover': {
                  bgcolor: age.bg,
                  borderColor: age.color,
               },
            }}
         >
            <AccessTimeRoundedIcon sx={{ fontSize: 22 }} />
         </IconButton>
      </Tooltip>
   );
}

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

export default function ParsingRowCard({ item, expanded, onToggleExpand, onStatus, onHistory, onQuickCommunication, onEdit, onDelete, canDelete }) {
   if (item?.sourceStatus === 'unknown') {
      item = { ...item, sourceStatus: 'не перевірено' };
   }
   const { theme, mode } = useCRMTheme();
   const meta = STAGE_META[item?.stage] || STAGE_META.raw;
   const [lightboxIndex, setLightboxIndex] = useState(0);
   const [lightboxOpen, setLightboxOpen] = useState(false);
   const galleryImages = useMemo(() => normalizeLightboxImages(item?.images), [item?.images]);
   const previousPrice = getPreviousPrice(item);
   const sourceDates = getSourceDates(item);

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
                xs: '36px 42px 1fr',
                lg: '36px 44px minmax(190px, 1.32fr) 84px 72px 94px minmax(145px, 0.75fr) 74px 72px minmax(166px, auto)',
             },
            gap: 0.8,
            alignItems: 'center',
            boxShadow: mode === 'light' ? '0 10px 24px rgba(124,58,237,0.05)' : 'none',
         }}
      >
         <CommunicationClock item={item} theme={theme} onClick={onQuickCommunication} />

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
               <SourceButton item={item} theme={theme} />
               <Typography sx={{ color: theme.text, fontWeight: 950, fontSize: 13.3 }} noWrap>
                  {item?.title || 'Без назви'}
               </Typography>
            </Stack>

            <Typography sx={{ color: theme.textSoft, fontSize: 11.8 }} noWrap>
               {buildAddress(item)}
            </Typography>
         </Stack>

         <Typography sx={{ color: theme.textSoft, fontSize: 12.2, display: { xs: 'none', lg: 'block' } }}>
            {getRoomFloorDisplay(item)}
         </Typography>

         <Typography sx={{ color: theme.textSoft, fontSize: 12.2, display: { xs: 'none', lg: 'block' } }}>
            {item?.square_tot ? `${item.square_tot} м²` : '-'}
         </Typography>

         <Stack spacing={0.05} sx={{ display: { xs: 'none', lg: 'flex' }, minWidth: 0 }}>
            <Typography sx={{ color: theme.text, fontWeight: 950, fontSize: 12.2, lineHeight: 1.05 }}>
               {formatMoney(item?.cost, item?.currency)}
            </Typography>
            {previousPrice && (
               <Typography
                  sx={{
                     color: Number(previousPrice.price) > Number(item?.cost) ? '#ef4444' : theme.textSoft,
                     fontWeight: 850,
                     fontSize: 10.5,
                     lineHeight: 1.05,
                     textDecoration: 'line-through',
                  }}
               >
                  {formatMoney(previousPrice.price, previousPrice.currency)}
               </Typography>
            )}
         </Stack>

         <ContactCell item={item} theme={theme} />

         <Stack spacing={0.1} sx={{ minWidth: 0, display: { xs: 'none', lg: 'flex' } }}>
            <Tooltip title={<span style={{ whiteSpace: 'pre-line' }}>{buildDateTooltip(item)}</span>}>
               <Stack alignItems="center" spacing={0.05} sx={{ cursor: 'help' }}>
                  <Typography sx={{ color: theme.text, fontSize: 12.1, lineHeight: 1.05, fontWeight: 750 }}>
                     {formatImportDate(item?.importedAt || item?.createdAt)}
                  </Typography>
                   <Typography sx={{ color: theme.textSoft, fontSize: 10.5, lineHeight: 1.05, fontWeight: 450 }}>
                      {formatShortTime(item?.importedAt || item?.createdAt)}
                   </Typography>
                   <Typography sx={{ color: theme.textSoft, fontSize: 9.5, lineHeight: 1, fontWeight: 850, textTransform: 'uppercase', opacity: 0.78 }}>
                      {getImportKindLabel(item)}
                   </Typography>
                </Stack>
             </Tooltip>
            {false && (
            <Tooltip title={`Внесено: ${formatFullDateTime(item?.importedAt || item?.createdAt)}`}>
               <Stack alignItems="center" spacing={0.05} title={buildDateTooltip(item)} sx={{ cursor: 'help' }}>
                  <Typography sx={{ color: theme.text, fontSize: 12.1, lineHeight: 1.05, fontWeight: 750 }}>
                     {formatImportDate(item?.importedAt || item?.createdAt)}
                  </Typography>
                  <Typography sx={{ color: theme.textSoft, fontSize: 10.5, lineHeight: 1.05, fontWeight: 450 }}>
                     {formatShortTime(item?.importedAt || item?.createdAt)}
                  </Typography>
               </Stack>
            </Tooltip>
            )}
         </Stack>

         <Button
            onClick={() => onStatus?.(item)}
            sx={{
               justifySelf: { xs: 'start', lg: 'stretch' },
               display: { xs: 'none', lg: 'inline-flex' },
               height: 27,
               minWidth: 0,
               px: 0.8,
               borderRadius: 1.5,
               fontWeight: 950,
               fontSize: 11,
               color: meta.color,
               bgcolor: `${meta.color}18`,
               border: `1px solid ${meta.color}45`,
               textTransform: 'none',
               overflow: 'hidden',
               textOverflow: 'ellipsis',
               '&:hover': { bgcolor: `${meta.color}22`, borderColor: meta.color },
            }}
         >
            {meta.compact || meta.label}
         </Button>

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

             <Tooltip title="Редагувати">
                <IconButton onClick={() => onEdit?.(item)} sx={iconButtonSx}>
                   <EditRoundedIcon fontSize="small" />
                </IconButton>
             </Tooltip>

             {canDelete && (
                <Tooltip title="Видалити">
                   <IconButton
                      onClick={() => onDelete?.(item)}
                      sx={{
                         ...iconButtonSx,
                         color: '#ef4444',
                         borderColor: 'rgba(239,68,68,0.38)',
                         bgcolor: 'rgba(239,68,68,0.08)',
                         '&:hover': { bgcolor: 'rgba(239,68,68,0.16)' },
                      }}
                   >
                      <DeleteOutlineRoundedIcon fontSize="small" />
                   </IconButton>
                </Tooltip>
             )}

             <Tooltip title={expanded ? 'Згорнути' : 'Розгорнути'}>
               <IconButton onClick={() => onToggleExpand?.(item)} sx={iconButtonSx}>
                  {expanded ? <KeyboardArrowUpRoundedIcon fontSize="small" /> : <KeyboardArrowDownRoundedIcon fontSize="small" />}
               </IconButton>
            </Tooltip>

            <Tooltip title="Історія комунікацій">
               <IconButton
                  onClick={() => onHistory?.(item)}
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

         {expanded && (
            <Box
               sx={{
                  gridColumn: '1 / -1',
                  mt: 0.2,
                  p: 1.15,
                  borderRadius: 2,
                  border: `1px solid ${theme.border}`,
                  bgcolor: mode === 'light' ? 'rgba(124,58,237,0.035)' : 'rgba(255,255,255,0.022)',
               }}
            >
               <Box
                  sx={{
                     display: 'grid',
                     gridTemplateColumns: { xs: '1fr', md: '300px minmax(0, 1fr)' },
                     gap: 1.15,
                     alignItems: 'start',
                  }}
               >
                  <Stack spacing={0.55} minWidth={0}>
                     <Box
                        sx={{
                           display: 'grid',
                           gridTemplateColumns: '150px minmax(0, 1fr)',
                           gap: 0.5,
                           alignItems: 'start',
                        }}
                     >
                        <Box
                           component="button"
                           type="button"
                           onClick={() => {
                              if (!galleryImages.length) return;
                              setLightboxIndex(0);
                              setLightboxOpen(true);
                           }}
                           sx={{
                              p: 0,
                              width: '100%',
                              aspectRatio: '1 / 1',
                              borderRadius: 2,
                              border: `1px solid ${theme.border}`,
                              bgcolor: mode === 'light' ? 'rgba(255,255,255,0.72)' : 'rgba(255,255,255,0.035)',
                              overflow: 'hidden',
                              cursor: galleryImages.length ? 'zoom-in' : 'default',
                           }}
                        >
                           <Box
                              component="img"
                              src={galleryImages[0]?.url || '/krm/logo-krm.png'}
                              alt=""
                              sx={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                           />
                        </Box>

                        <Box
                           sx={{
                              display: 'grid',
                              gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
                              gap: 0.5,
                           }}
                        >
                           {galleryImages.slice(1, 10).map((image, thumbIndex) => {
                              const index = thumbIndex + 1;

                              return (
                                 <Box
                                    key={`${image.url}-${index}`}
                                    component="button"
                                    type="button"
                                    onClick={() => {
                                       setLightboxIndex(index);
                                       setLightboxOpen(true);
                                    }}
                                    sx={{
                                       p: 0,
                                       aspectRatio: '1 / 1',
                                       borderRadius: 1.2,
                                       border: `1px solid ${theme.border}`,
                                       overflow: 'hidden',
                                       cursor: 'zoom-in',
                                       bgcolor: 'transparent',
                                    }}
                                 >
                                    <Box
                                       component="img"
                                       src={image.url}
                                       alt=""
                                       sx={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                                    />
                                 </Box>
                              );
                           })}
                        </Box>
                     </Box>

                     {galleryImages.length > 10 && (
                        <Box
                           sx={{
                              display: 'grid',
                              gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
                              gap: 0.5,
                           }}
                        >
                           {galleryImages.slice(10, 18).map((image, thumbIndex) => {
                              const index = thumbIndex + 10;

                              return (
                               <Box
                                  key={`${image.url}-${index}`}
                                  component="button"
                                 type="button"
                                 onClick={() => {
                                    setLightboxIndex(index);
                                    setLightboxOpen(true);
                                 }}
                                 sx={{
                                    p: 0,
                                    aspectRatio: '1 / 1',
                                    borderRadius: 1.2,
                                    border: `1px solid ${index === 0 ? theme.accent : theme.border}`,
                                    overflow: 'hidden',
                                    cursor: 'zoom-in',
                                     bgcolor: 'transparent',
                                  }}
                               >
                                 <Box
                                    component="img"
                                    src={image.url}
                                    alt=""
                                     sx={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                                  />
                               </Box>
                              );
                           })}
                        </Box>
                     )}
                  </Stack>

                  <Stack spacing={0.95} minWidth={0}>
                     <Stack direction="row" spacing={0.7} flexWrap="wrap" useFlexGap>
                        <Chip size="small" label={`Сайт: ${getOriginalSiteName(item) || getSourceLabel(getSourceFromUrl(item?.sourceUrl)) || '-'}`} />
                        <Chip size="small" label={`ID на сайті: ${getSourceExternalId(item) || '-'}`} />
                        <Chip size="small" label={`Імпорт: ${getImportKindLabel(item)}`} />
                        <Chip size="small" label={`REAMAK ID: ${getReamakId(item) || '-'}`} />
                        <Chip size="small" label={item?.sourceStatus ? `Статус джерела: ${item.sourceStatus}` : 'Статус джерела: unknown'} />
                        <Chip size="small" label={`Фото: ${galleryImages.length}`} />
                     </Stack>

                     <Box
                        sx={{
                           p: 1,
                           borderRadius: 2,
                           border: `1px solid ${theme.border}`,
                           bgcolor: mode === 'light' ? 'rgba(255,255,255,0.62)' : 'rgba(255,255,255,0.025)',
                        }}
                     >
                        <Stack direction="row" spacing={1.5} alignItems="flex-end" flexWrap="wrap" useFlexGap>
                           <Box>
                              <Typography sx={{ color: theme.textSoft, fontSize: 11, fontWeight: 900 }}>
                                 Поточна ціна
                              </Typography>
                              <Tooltip title={sourceDates.map(([label, value]) => `${label}: ${formatSourceDateTime(value)}`).join('\n')}>
                                 <Typography sx={{ color: theme.text, fontWeight: 950, fontSize: 20, lineHeight: 1.15 }}>
                                    {formatMoney(item?.cost, item?.currency)}
                                 </Typography>
                              </Tooltip>
                              {previousPrice && (
                                 <Typography
                                    sx={{
                                       mt: 0.15,
                                       color: Number(previousPrice.price) > Number(item?.cost) ? '#ef4444' : theme.textSoft,
                                       fontWeight: 900,
                                       fontSize: 12,
                                       textDecoration: 'line-through',
                                    }}
                                 >
                                    {formatMoney(previousPrice.price, previousPrice.currency)}
                                 </Typography>
                              )}
                           </Box>

                           {getPriceHistory(item).slice(-4).map((entry, index) => (
                              <Box key={`${entry.price}-${entry.changedAt}-${index}`}>
                                 <Typography sx={{ color: theme.textSoft, fontSize: 10.5, fontWeight: 800 }}>
                                    {formatSourceDateTime(entry.changedAt || entry.detectedAt)}
                                 </Typography>
                                 <Typography sx={{ color: theme.textSoft, fontSize: 12, fontWeight: 900 }}>
                                    {formatMoney(entry.price, entry.currency)}
                                 </Typography>
                              </Box>
                           ))}
                        </Stack>
                     </Box>

                     <Box
                        sx={{
                           display: 'grid',
                           gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))' },
                           gap: 0.65,
                        }}
                     >
                        {sourceDates.map(([label, value]) => (
                           <Box
                              key={label}
                              sx={{
                                 p: 0.75,
                                 borderRadius: 1.5,
                                 border: `1px solid ${theme.border}`,
                                 bgcolor: mode === 'light' ? 'rgba(255,255,255,0.52)' : 'rgba(255,255,255,0.02)',
                              }}
                           >
                              <Typography sx={{ color: theme.textSoft, fontSize: 10.5, fontWeight: 900 }}>
                                 {label}
                              </Typography>
                              <Typography sx={{ color: theme.text, fontSize: 12.2, fontWeight: 850 }}>
                                 {formatSourceDateTime(value)}
                              </Typography>
                           </Box>
                        ))}
                     </Box>

                     <Stack direction="row" spacing={0.7} flexWrap="wrap" useFlexGap>
                        <Chip size="small" label={item?.phone ? `Телефон: ${item.phone}` : 'Телефон -'} />
                        <Chip size="small" label={item?.leadname ? `Контакт: ${item.leadname}` : 'Контакт -'} />
                        <Chip size="small" label={item?.rooms ? `${item.rooms} кім.` : 'Кімнати -'} />
                        <Chip size="small" label={item?.square_tot ? `${item.square_tot} м2` : 'Площа -'} />
                        <Chip size="small" label={getRoomFloorDisplay(item).includes('·') ? `${getRoomFloorDisplay(item).split('·')[1].trim()} поверх` : 'Поверх -'} />
                        {!!item?.duplicatePropertyId && (
                           <Chip size="small" label={`Дубль бази: ${item.duplicatePropertyId.title || item.duplicatePropertyId.location_text || 'обʼєкт'}`} />
                        )}
                     </Stack>

                     <Stack spacing={0.35}>
                        <Typography sx={{ color: theme.text, fontSize: 13, fontWeight: 950 }}>
                           Опис
                        </Typography>
                        <Typography sx={{ color: theme.textSoft, fontSize: 13, lineHeight: 1.55, whiteSpace: 'pre-wrap' }}>
                           {item?.description || 'Опису немає'}
                        </Typography>
                     </Stack>
                  </Stack>
               </Box>
            </Box>
         )}

         {false && expanded && (
            <Box
               sx={{
                  gridColumn: '1 / -1',
                  mt: 0.2,
                  p: 1.15,
                  borderRadius: 2,
                  border: `1px solid ${theme.border}`,
                  bgcolor: mode === 'light' ? 'rgba(124,58,237,0.035)' : 'rgba(255,255,255,0.022)',
               }}
            >
               <Stack spacing={0.85}>
                  <Typography sx={{ color: theme.textSoft, fontSize: 13, lineHeight: 1.55, whiteSpace: 'pre-wrap' }}>
                     {item?.description || 'Опису немає'}
                  </Typography>

                  <Stack direction="row" spacing={0.7} flexWrap="wrap" useFlexGap>
                     <Chip size="small" label={item?.phone ? `Телефон: ${item.phone}` : 'Телефон —'} />
                     <Chip size="small" label={item?.leadname ? `Контакт: ${item.leadname}` : 'Контакт —'} />
                     <Chip size="small" label={item?.sourceStatus ? `Ссилка: ${item.sourceStatus}` : 'Ссилка: unknown'} />
                     {!!item?.duplicatePropertyId && (
                        <Chip size="small" label={`Дубль бази: ${item.duplicatePropertyId.title || item.duplicatePropertyId.location_text || 'обʼєкт'}`} />
                     )}
                  </Stack>
               </Stack>
            </Box>
         )}

         <ImageLightbox
            open={lightboxOpen}
            images={galleryImages}
            index={lightboxIndex}
            onClose={() => setLightboxOpen(false)}
            onChangeIndex={setLightboxIndex}
         />
      </Box>
   );
}
