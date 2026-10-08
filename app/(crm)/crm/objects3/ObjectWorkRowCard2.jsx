'use client';

import { useEffect, useRef, useState } from 'react';
import {
   Box,
   Typography,
   Button,
   TextField,
   Stack,
   Chip,
   Collapse,
   Divider,
   IconButton,
   Tooltip,
   Grid,
   MenuItem,

   Dialog,
   DialogTitle,
   DialogContent,
   DialogActions,
   Drawer,
   Autocomplete,
} from '@mui/material';

import { useCRMTheme } from '@/app/(crm)/crm/context/CRMThemeContext';

import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded';
import ExpandLessRoundedIcon from '@mui/icons-material/ExpandLessRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import BedRoundedIcon from '@mui/icons-material/BedRounded';
import SquareFootRoundedIcon from '@mui/icons-material/SquareFootRounded';
import ApartmentRoundedIcon from '@mui/icons-material/ApartmentRounded';
import PersonRoundedIcon from '@mui/icons-material/PersonRounded';
import PaidRoundedIcon from '@mui/icons-material/PaidRounded';
import HomeWorkRoundedIcon from '@mui/icons-material/HomeWorkRounded';
import HandshakeRoundedIcon from '@mui/icons-material/HandshakeRounded';
import GavelRoundedIcon from '@mui/icons-material/GavelRounded';
import MovingRoundedIcon from '@mui/icons-material/MovingRounded';
import PersonAddAlt1RoundedIcon from '@mui/icons-material/PersonAddAlt1Rounded';
import HeartBrokenRoundedIcon from '@mui/icons-material/HeartBrokenRounded';

import AddRoundedIcon from '@mui/icons-material/AddRounded';

import MonetizationOnRoundedIcon from '@mui/icons-material/MonetizationOnRounded';
import CurrencyBitcoinRoundedIcon from '@mui/icons-material/CurrencyBitcoinRounded';
import PestControlRoundedIcon from '@mui/icons-material/PestControlRounded';

import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';

import Badge from '@mui/material/Badge';
import Popover from '@mui/material/Popover';
import LinkRoundedIcon from '@mui/icons-material/LinkRounded';
import TuneRoundedIcon from '@mui/icons-material/TuneRounded';

import ContentCopyRoundedIcon from '@mui/icons-material/ContentCopyRounded';
import ImageRoundedIcon from '@mui/icons-material/ImageRounded';
import OpenInNewRoundedIcon from '@mui/icons-material/OpenInNewRounded';
import TextSnippetRoundedIcon from '@mui/icons-material/TextSnippetRounded';
import TelegramIcon from '@mui/icons-material/Telegram';
import PlayCircleFilledRoundedIcon from '@mui/icons-material/PlayCircleFilledRounded';
import VideoLibraryRoundedIcon from '@mui/icons-material/VideoLibraryRounded';
import StarRoundedIcon from '@mui/icons-material/StarRounded';
import VisibilityOffRoundedIcon from '@mui/icons-material/VisibilityOffRounded';
import ArrowBackIosNewRoundedIcon from '@mui/icons-material/ArrowBackIosNewRounded';
import ArrowForwardIosRoundedIcon from '@mui/icons-material/ArrowForwardIosRounded';

import { BUSINESS_SCORE_OPTIONS } from '@/utils/crm/BusinessScore';

import ObjectAdvertisingPanel from './ObjectAdvertisingPanel2';
import ObjectWorkHistoryPanel from './ObjectWorkHistoryPanel';

import ImageLightbox from '@/crm_components/ImageLightbox';
import {
   buildImageUploadBatches,
   prepareImageUploadFiles,
   SAFE_IMAGE_PAYLOAD_BYTES,
} from '@/utils/crm/clientImageTools';

const getFieldSx = (theme, mode) => ({
   '& .MuiOutlinedInput-root': {
      bgcolor: mode === 'light' ? 'rgba(124,58,237,0.035)' : 'rgba(255,255,255,0.04)',
      borderRadius: 2.5,
      color: theme.text,
      '& fieldset': { borderColor: theme.border },
      '&:hover fieldset': { borderColor: theme.accent },
      '&.Mui-focused fieldset': { borderColor: theme.accentLight },
   },
   '& .MuiInputLabel-root': {
      color: theme.textSoft,
   },
   '& .MuiInputBase-input': {
      color: `${theme.text} !important`,
      WebkitTextFillColor: theme.text,
   },
   '& textarea': {
      color: `${theme.text} !important`,
      WebkitTextFillColor: theme.text,
   },
   '& .MuiSelect-icon': {
      color: theme.text,
   },
});

const AD_PRIORITY_OPTIONS = [
   [5, '5 - Надвисокий'],
   [4, '4 - Високий'],
   [3, '3 - Нормальний'],
   [2, '2 - Низький'],
   [1, '1 - Найнижчий'],
];

const AD_CURRENCY_OPTIONS = [
   ['USD', 'долар'],
   ['UAH', 'гривня'],
   ['EUR', 'євро'],
];

const PHOTO_STAGES = [
   { value: 'draft', label: 'Чорнові' },
   { value: 'processed', label: 'Оброблені' },
   { value: 'branded', label: 'З лого' },
];

function getPhotoStageLabel(stage) {
   return PHOTO_STAGES.find((item) => item.value === stage)?.label || stage || 'Чорнові';
}

const emptyAdvertisingSettingsForm = (item = {}) => {
   const settings = item?.advertisingSettings || {};
   return {
      property: item?._id || '',
      assignedEmployee: settings.assignedEmployee?._id || settings.assignedEmployee || '',
      status: settings.status || 'active',
      priority: settings.priority || 3,
      price: settings.price ?? '',
      currency: settings.currency || 'USD',
      draftText: settings.draftText || '',
      note: settings.note || '',
   };
};


function formatMoney(value, currency = 'USD') {
   if (!value && value !== 0) return '—';
   return `${Number(value).toLocaleString('uk-UA')} ${currency || ''}`;
}

function formatDate(value) {
   if (!value) return '—';
   const d = new Date(value);
   if (Number.isNaN(d.getTime())) return '—';
   return d.toLocaleDateString('uk-UA');
}

function getImageUrl(item) {
   const images = Array.isArray(item?.images) ? item.images : [];
   const visible = images
      .filter((img) => !img?.isHidden)
      .sort((a, b) => (a?.sortOrder ?? 0) - (b?.sortOrder ?? 0));

   const main = visible.find((img) => img?.isMain) || visible[0];

   return (
      main?.variants?.branded ||
      main?.brandedUrl ||
      main?.variants?.card ||
      main?.processedUrl ||
      main?.variants?.preview ||
      main?.url ||
      '/krm/logo-krm.png'
   );
}

function getImageStageUrl(image = {}) {
   if (image.stage === 'branded') {
      return image.brandedUrl || image.url || image.processedUrl || image.preview || image.variants?.card || image.variants?.preview || '';
   }
   if (image.stage === 'processed') {
      return image.processedUrl || image.url || image.brandedUrl || image.preview || image.variants?.card || image.variants?.preview || '';
   }
   return image.url || image.preview || image.processedUrl || image.brandedUrl || image.variants?.card || image.variants?.preview || '';
}

function getImageActionId(image = {}) {
   return image._id || image.public_id || image.url || image.processedUrl || image.brandedUrl || '';
}

const WORK_HISTORY_TYPES = ['note', 'call', 'message', 'meeting'];

const SHARE_REACTION_META = {
   view: { icon: '👀', label: 'Хочу оглянути' },
   like: { icon: '❤️', label: 'Подобається' },
   think: { icon: '🤔', label: 'Подумаю' },
   call: { icon: '📞', label: 'Передзвоніть' },
   reject: { icon: '🙅', label: 'Не моє' },
};

function getShareReactionGroups(reactions = []) {
   const groups = [];
   const byType = new Map();

   reactions.forEach((reaction) => {
      const type = reaction?.type || 'like';
      if (!byType.has(type)) {
         const meta = SHARE_REACTION_META[type] || { icon: '💬', label: reaction?.label || 'Реакція' };
         const group = { type, ...meta, count: 0, items: [] };
         byType.set(type, group);
         groups.push(group);
      }

      const group = byType.get(type);
      group.count += 1;
      group.items.push(reaction);
   });

   return groups;
}

function getEmployeeName(employee) {
   if (!employee) return '—';

   return (
      employee.fullName ||
      [employee.surname, employee.name].filter(Boolean).join(' ') ||
      employee.name ||
      employee.email ||
      '—'
   );
}

function getActualityLabel(group) {
   if (group === 'active') return 'Актуальний';
   if (group === 'paused') return 'Зупинений';
   if (group === 'inactive') return 'Неактуальний';
   return 'Статус';
}

function getRentStatusLabel(statusRent) {
   if (statusRent === 'rentActual') return 'Оренда актуальна';
   if (statusRent === 'rentPause') return 'Оренда пауза';
   if (statusRent === 'rentRented') return 'Зданий';
   return '';
}

function getEstateLabel(type) {
   if (type === 'flat') return 'Квартира';
   if (type === 'house') return 'Будинок';
   if (type === 'commerce') return 'Комерція';
   if (type === 'land') return 'Ділянка';
   return type || 'Об’єкт';
};


function getNowLocal() {
   const d = new Date();

   const pad = (n) => String(n).padStart(2, '0');

   return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

function toLocalInputValue(value) {
   if (!value) return getNowLocal();
   const d = new Date(value);
   if (Number.isNaN(d.getTime())) return getNowLocal();

   const pad = (n) => String(n).padStart(2, '0');
   return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};


function InfoPill({ icon, label, value, theme }) {
   return (
      <Stack
         direction="row"
         spacing={0.7}
         alignItems="center"
         sx={{
            px: 1,
            py: 0.75,
            borderRadius: 2.5,
            bgcolor: theme?.hover || 'rgba(255,255,255,0.04)',
            border: `1px solid ${theme?.border || 'rgba(255,255,255,0.07)'}`,
            minWidth: 0,
         }}
      >
         <Box sx={{ color: theme?.textSoft || 'rgba(255,255,255,0.58)', display: 'flex' }}>
            {icon}
         </Box>

         <Stack spacing={0.1} minWidth={0}>
            <Typography sx={{ color: theme?.textSoft || 'rgba(255,255,255,0.52)', fontSize: 10.5, lineHeight: 1 }}>
               {label}
            </Typography>
            <Typography
               sx={{ color: theme?.text || '#fff', fontSize: 12.5, fontWeight: 850, lineHeight: 1.1 }}
               noWrap
            >
               {value || '—'}
            </Typography>
         </Stack>
      </Stack>
   );
}

function DetailBox({ title, children, theme, mode, sx }) {
   const bg =
      mode === 'light'
         ? '#fff'
         : mode === 'luxury'
            ? 'rgba(212,175,55,0.045)'
            : 'rgba(255,255,255,0.018)';

   return (
      <Box
         sx={{
            p: 1.25,
            borderRadius: 3,
            bgcolor: bg,
            border: `1px solid ${theme?.border || 'rgba(255,255,255,0.06)'}`,
            minHeight: 0,
            boxShadow: mode === 'light' ? '0 8px 22px rgba(124,58,237,0.05)' : 'none',
            // height: '90%',
            width: '100%',
            ...sx,
         }}
      >
         <Typography sx={{ color: theme?.text || '#fff', fontWeight: 950, mb: 0.9 }}>
            {title}
         </Typography>
         <Stack spacing={0.55}>{children}</Stack>
      </Box>
   );
};

function DetailLine({ label, value, theme }) {
   if (!value && value !== 0) return null;

   return (
      <Typography
         sx={{
            color: theme?.textSoft || 'rgba(255,255,255,0.72)',
            fontSize: 13,
            lineHeight: 1.45,
            wordBreak: 'break-word',
         }}
      >
         <Box component="span" sx={{ color: theme?.text || '#fff', fontWeight: 900 }}>
            {label}:
         </Box>{' '}
         {value}
      </Typography>
   );
};

function VideoPhotoBadge({ video, theme, mode, onOpen }) {
   if (!video?.url) return null;

   return (
      <Tooltip title={video.title || getVideoPlatformLabel(video.platform)}>
         <Box
            component="button"
            type="button"
            onClick={(event) => {
               event.stopPropagation();
               onOpen?.(video);
            }}
            sx={{
               position: 'absolute',
               right: 7,
               top: '50%',
               transform: 'translateY(-50%)',
               width: '18%',
               minWidth: 28,
               maxWidth: 36,
               aspectRatio: '1 / 1',
               borderRadius: '50%',
               p: 0,
               display: 'inline-flex',
               alignItems: 'center',
               justifyContent: 'center',
               color: '#fff7ed',
               zIndex: 4,
               cursor: 'pointer',
               background: mode === 'light'
                  ? 'linear-gradient(135deg, #fb923c, #f97316)'
                  : 'linear-gradient(135deg, rgba(251,146,60,0.98), rgba(234,88,12,0.94))',
               border: '2px solid rgba(255,255,255,0.82)',
               boxShadow: '0 10px 26px rgba(249,115,22,0.42), 0 0 0 0 rgba(251,146,60,0.34)',
               animation: 'videoPulse 2s ease-in-out infinite',
               transition: 'transform 150ms ease, box-shadow 150ms ease',
               '@keyframes videoPulse': {
                  '0%, 100%': { boxShadow: '0 10px 26px rgba(249,115,22,0.42), 0 0 0 0 rgba(251,146,60,0.36)' },
                  '50%': { boxShadow: '0 12px 30px rgba(249,115,22,0.5), 0 0 0 8px rgba(251,146,60,0)' },
               },
               '&:hover': {
                  transform: 'translateY(-50%) scale(1.08)',
                  boxShadow: '0 14px 34px rgba(249,115,22,0.54)',
               },
            }}
            onMouseDown={(event) => event.stopPropagation()}
         >
            <PlayCircleFilledRoundedIcon sx={{ fontSize: 25 }} />
         </Box>
      </Tooltip>
   );
}

function PropertyVideosPanel({ item, theme, mode, canManage, onAdd, onOpen, onEdit, onDelete }) {
   const videos = Array.isArray(item?.propertyVideos) ? item.propertyVideos : [];

   return (
      <Box
         sx={{
            p: 1,
            borderRadius: 3,
            bgcolor: mode === 'light' ? '#fff' : mode === 'luxury' ? 'rgba(212,175,55,0.045)' : 'rgba(255,255,255,0.018)',
            border: `1px solid ${theme?.border || 'rgba(255,255,255,0.06)'}`,
            width: '100%',
         }}
      >
         <Stack spacing={0.7}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={1}>
               <Stack direction="row" spacing={1} alignItems="center" minWidth={0}>
                  <Typography sx={{ color: theme.text, fontWeight: 950, fontSize: 16, lineHeight: 1, whiteSpace: 'nowrap' }}>
                     Відео
                  </Typography>
                  <Typography sx={{ color: theme.textSoft, fontSize: 12.5, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                     {videos.length ? `${videos.length} відео` : 'Відео ще немає'}
                  </Typography>
               </Stack>

               {canManage && (
                  <Tooltip title="Додати відео">
                     <IconButton size="small" onClick={onAdd} sx={{ width: 34, height: 34, flexShrink: 0, color: theme.text, border: `1px solid ${theme.border}` }}>
                        <AddRoundedIcon fontSize="small" />
                     </IconButton>
                  </Tooltip>
               )}
            </Stack>

            {videos.map((video) => (
               <Box
                  key={video._id || video.url}
                  sx={{
                     display: 'grid',
                     gridTemplateColumns: { xs: '1fr auto', md: '96px minmax(140px, 1fr) 90px auto' },
                     gap: 0.8,
                     alignItems: 'center',
                     p: 0.8,
                     borderRadius: 2,
                     border: `1px solid ${theme.border}`,
                     bgcolor: mode === 'light' ? 'rgba(239,68,68,0.035)' : 'rgba(255,255,255,0.025)',
                  }}
               >
                  <Chip
                     label={getVideoPlatformLabel(video.platform)}
                     size="small"
                     color={video.platform === 'youtube' ? 'error' : 'primary'}
                     sx={{ height: 21, fontSize: 10.5, fontWeight: 900 }}
                  />

                  <Box
                     component="button"
                     type="button"
                     onClick={() => onOpen?.(video)}
                     sx={{
                        minWidth: 0,
                        color: theme.text,
                        textAlign: 'left',
                        fontSize: 12.5,
                        fontWeight: 900,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        border: 0,
                        p: 0,
                        bgcolor: 'transparent',
                        cursor: 'pointer',
                     }}
                  >
                     {video.title || video.url}
                  </Box>

                  <Chip
                     label={video.isMain ? 'Головне' : getVideoTypeLabel(video.type)}
                     size="small"
                     sx={{
                        height: 21,
                        fontSize: 10.5,
                        fontWeight: 900,
                        color: video.isMain ? '#fde68a' : theme.textSoft,
                        bgcolor: video.isMain ? 'rgba(245,158,11,0.16) !important' : 'rgba(255,255,255,0.035) !important',
                        border: video.isMain ? '1px solid rgba(245,158,11,0.28)' : `1px solid ${theme.border}`,
                        display: { xs: 'none', md: 'inline-flex' },
                     }}
                  />

                  <Stack direction="row" spacing={0.45}>
                     <Tooltip title="Відкрити">
                        <IconButton onClick={() => onOpen?.(video)} size="small" sx={{ color: theme.text }}>
                           <OpenInNewRoundedIcon fontSize="small" />
                        </IconButton>
                     </Tooltip>
                     {canManage && (
                        <>
                           <Tooltip title="Редагувати">
                              <IconButton size="small" onClick={() => onEdit?.(video)} sx={{ color: theme.accentLight }}>
                                 <EditRoundedIcon fontSize="small" />
                              </IconButton>
                           </Tooltip>
                           <Tooltip title="Видалити">
                              <IconButton size="small" onClick={() => onDelete?.(video)} sx={{ color: '#fca5a5' }}>
                                 <DeleteOutlineRoundedIcon fontSize="small" />
                              </IconButton>
                           </Tooltip>
                        </>
                     )}
                  </Stack>
               </Box>
            ))}
         </Stack>
      </Box>
   );
}

function PropertyGalleryPanel({
   item,
   images = [],
   theme,
   mode,
   canManage,
   imageActionLoading,
   photoUploadStage,
   photoUploading,
   onPhotoStageChange,
   onAddPhotoClick,
   onOpen,
   onImageAction,
   onImageDelete,
}) {
   const [showAll, setShowAll] = useState(false);
   const allImages = Array.isArray(item?.images) ? item.images : [];
   const compactLimit = 6;
   const activeStage = photoUploadStage || 'draft';
   const stageCounts = PHOTO_STAGES.reduce((acc, stage) => {
      acc[stage.value] = allImages.filter((image) => (image.stage || 'draft') === stage.value).length;
      return acc;
   }, {});
   const allGalleryImages = allImages
      .slice()
      .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
      .filter((img) => (img.stage || 'draft') === activeStage)
      .map((img) => ({
         ...img,
         url: getImageStageUrl(img),
      }))
      .filter((img) => img.url);
   const visibleStageImages = allGalleryImages.filter((img) => !img.isHidden);
   const previewImages = showAll ? allGalleryImages : visibleStageImages.slice(0, compactLimit);
   const hasMore = visibleStageImages.length > compactLimit || allGalleryImages.length !== visibleStageImages.length;

   return (
      <Box
         sx={{
            p: 1,
            borderRadius: 3,
            bgcolor: mode === 'light' ? '#fff' : mode === 'luxury' ? 'rgba(212,175,55,0.045)' : 'rgba(255,255,255,0.018)',
            border: `1px solid ${theme?.border || 'rgba(255,255,255,0.06)'}`,
            width: '100%',
         }}
      >
         <Stack direction="row" spacing={0.65} alignItems="center" sx={{ minWidth: 0 }}>
            <Stack spacing={0.35} sx={{ width: 82, flex: '0 0 82px', minWidth: 0 }}>
               <Typography sx={{ color: theme.text, fontWeight: 950, fontSize: 13.5, lineHeight: 1, whiteSpace: 'nowrap' }}>
                  Галерея
               </Typography>
               <Stack direction="row" spacing={0.35} alignItems="center">
                  <Tooltip title={`Фото: ${allImages.length}`}>
                     <Chip size="small" icon={<ImageRoundedIcon sx={{ fontSize: '12px !important' }} />} label={allImages.length} sx={{ height: 18, minWidth: 34, fontSize: 9.5, fontWeight: 850, '& .MuiChip-icon': { ml: 0.35, mr: 0.1 } }} />
                  </Tooltip>
                  {canManage && (
                     <Tooltip title="Додати фото">
                        <span>
                           <IconButton
                              size="small"
                              disabled={photoUploading}
                              onClick={onAddPhotoClick}
                              sx={{ width: 24, height: 24, color: '#fb923c', border: `1px solid ${theme.border}` }}
                           >
                              <AddRoundedIcon sx={{ fontSize: 16 }} />
                           </IconButton>
                        </span>
                     </Tooltip>
                  )}
               </Stack>
            </Stack>
            <Stack direction="row" spacing={0.45} alignItems="center" flexWrap={showAll ? 'wrap' : 'nowrap'} useFlexGap sx={{ minWidth: 0, flex: 1, overflow: showAll ? 'visible' : 'hidden', pr: 0.25 }}>
               <TextField
                  select
                  size="small"
                  label="Група"
                  value={activeStage}
                  onChange={(event) => {
                     onPhotoStageChange?.(event.target.value);
                     setShowAll(false);
                  }}
                  sx={{
                     width: 126,
                     flex: '0 0 auto',
                     '& .MuiOutlinedInput-root': {
                        height: 32,
                        borderRadius: 2,
                        color: theme.text,
                        bgcolor: mode === 'light' ? 'rgba(124,58,237,0.05)' : 'rgba(255,255,255,0.035)',
                        '& fieldset': { borderColor: theme.border },
                     },
                     '& .MuiInputLabel-root': {
                        color: theme.textSoft,
                        fontSize: 11,
                        transform: 'translate(11px, -7px) scale(0.75)',
                     },
                     '& .MuiSelect-select': { py: 0.35, fontSize: 11, fontWeight: 900 },
                     '& .MuiSelect-icon': { color: theme.textSoft },
                  }}
               >
                  {PHOTO_STAGES.map((stage) => (
                     <MenuItem key={stage.value} value={stage.value}>
                        {stage.label} {stageCounts[stage.value] || 0}
                     </MenuItem>
                  ))}
               </TextField>
               {previewImages.length ? (
               <>
                  {previewImages.map((image, index) => {
                      const visibleIndex = images.findIndex((img) => String(img._id) === String(image._id));
                     const openIndex = visibleIndex >= 0 ? visibleIndex : 0;
                     const actionId = getImageActionId(image);
                     const isLoading = imageActionLoading === String(actionId);
                     return (
                      <Box
                         key={image._id || image.url || index}
                         role="button"
                         tabIndex={image.isHidden ? -1 : 0}
                         onClick={() => !image.isHidden && onOpen?.(openIndex)}
                         onKeyDown={(event) => {
                            if (!image.isHidden && (event.key === 'Enter' || event.key === ' ')) {
                               event.preventDefault();
                               onOpen?.(openIndex);
                            }
                         }}
                         sx={{
                            position: 'relative',
                           width: 54,
                            height: 42,
                           flex: '0 0 auto',
                           border: `1px solid ${image.isMain ? 'rgba(245,158,11,0.72)' : theme.border}`,
                           borderRadius: 2,
                           overflow: 'hidden',
                            p: 0,
                            cursor: image.isHidden ? 'default' : 'pointer',
                            opacity: image.isHidden ? 0.45 : 1,
                            bgcolor: mode === 'light' ? 'rgba(0,0,0,0.04)' : 'rgba(255,255,255,0.035)',
                            boxShadow: image.isMain ? '0 0 0 1px rgba(245,158,11,0.35)' : 'none',
                            '&:hover .gallery-actions': {
                               opacity: 1,
                            },
                         }}
                      >
                        <Box
                           component="img"
                           src={image.url}
                           alt={image.title || 'Фото об’єкта'}
                           sx={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                        />
                        {image.isMain && (
                           <Box
                              sx={{
                                 position: 'absolute',
                                 left: 4,
                                 top: 4,
                                 px: 0.55,
                                 py: 0.15,
                                 borderRadius: 999,
                                 fontSize: 9.5,
                                 fontWeight: 950,
                                 color: '#fde68a',
                                 bgcolor: 'rgba(15,15,23,0.78)',
                              }}
                           >
                              головне
                           </Box>
                        )}
                        {canManage && (
                           <Stack
                              className="gallery-actions"
                              direction="row"
                              spacing={0.12}
                              sx={{
                                 position: 'absolute',
                                 right: 2,
                                 bottom: 2,
                                 zIndex: 4,
                                 opacity: 0.88,
                                 transition: 'opacity 0.15s ease',
                              }}
                              onMouseDown={(event) => {
                                 event.preventDefault();
                                 event.stopPropagation();
                              }}
                              onClick={(event) => {
                                 event.preventDefault();
                                 event.stopPropagation();
                              }}
                            >
                              {!image.isMain && !image.isHidden && (
                                 <Tooltip title="Зробити головним">
                                    <IconButton
                                       size="small"
                                       disabled={isLoading}
                                       onMouseDown={(event) => {
                                          event.preventDefault();
                                          event.stopPropagation();
                                       }}
                                       onClick={(event) => {
                                          event.preventDefault();
                                          event.stopPropagation();
                                          onImageAction?.(image, 'setMain');
                                       }}
                                       sx={{ width: 16, height: 16, p: 0, color: '#fde68a', bgcolor: 'rgba(15,15,23,0.84)' }}
                                    >
                                       <StarRoundedIcon sx={{ fontSize: 10.5 }} />
                                    </IconButton>
                                 </Tooltip>
                              )}
                              <Tooltip title={image.isHidden ? 'Показати фото' : 'Сховати фото'}>
                                 <IconButton
                                     size="small"
                                     disabled={isLoading}
                                     onMouseDown={(event) => {
                                        event.preventDefault();
                                        event.stopPropagation();
                                     }}
                                     onClick={(event) => {
                                       event.preventDefault();
                                       event.stopPropagation();
                                       onImageAction?.(image, 'setHidden', !image.isHidden);
                                     }}
                                     sx={{ width: 16, height: 16, p: 0, color: image.isHidden ? '#86efac' : '#fecaca', bgcolor: 'rgba(15,15,23,0.84)' }}
                                  >
                                    <VisibilityOffRoundedIcon sx={{ fontSize: 10.5 }} />
                                  </IconButton>
                              </Tooltip>
                              <Tooltip title="Видалити фото">
                                 <IconButton
                                     size="small"
                                     disabled={isLoading}
                                     onMouseDown={(event) => {
                                        event.preventDefault();
                                        event.stopPropagation();
                                     }}
                                     onClick={(event) => {
                                       event.preventDefault();
                                       event.stopPropagation();
                                       onImageDelete?.(image);
                                     }}
                                     sx={{ width: 16, height: 16, p: 0, color: '#fca5a5', bgcolor: 'rgba(15,15,23,0.84)' }}
                                  >
                                    <DeleteOutlineRoundedIcon sx={{ fontSize: 10.5 }} />
                                  </IconButton>
                              </Tooltip>
                           </Stack>
                        )}
                      </Box>
                     );
                  })}
                  {hasMore && (
                     <Button
                        size="small"
                        onClick={() => setShowAll((value) => !value)}
                        sx={{
                           flexShrink: 0,
                           minHeight: 30,
                           borderRadius: 2,
                           px: 0.85,
                           minWidth: 36,
                           maxWidth: showAll ? 'none' : 40,
                           overflow: 'hidden',
                           textOverflow: 'ellipsis',
                           color: theme.accentLight,
                           fontSize: 10,
                           fontWeight: 950,
                           border: `1px solid ${theme.border}`,
                           bgcolor: mode === 'light' ? 'rgba(124,58,237,0.06)' : 'rgba(139,92,246,0.10)',
                        }}
                     >
                        {showAll ? 'Сховати' : 'Всі'}
                      </Button>
                   )}
                </>
            ) : (
               <Typography sx={{ color: theme.textSoft, fontSize: 13 }}>
                  Фото ще немає
               </Typography>
            )}
         </Stack>
         </Stack>
      </Box>
   );
}

function VideoGalleryDialog({ open, onClose, videos, activeIndex, onSelect, theme, mode }) {
   const safeVideos = Array.isArray(videos) ? videos : [];
   const currentIndex = Math.min(Math.max(activeIndex || 0, 0), Math.max(safeVideos.length - 1, 0));
   const current = safeVideos[currentIndex] || null;
   const embedUrl = current?.platform === 'youtube' ? getYouTubeEmbedUrl(current.url) : '';
   const hasMany = safeVideos.length > 1;

   const go = (step) => {
      if (!safeVideos.length) return;
      const next = (currentIndex + step + safeVideos.length) % safeVideos.length;
      onSelect?.(next);
   };

   return (
      <Dialog
         open={open}
         onClose={onClose}
         fullWidth
         maxWidth="md"
         PaperProps={{
            sx: {
               borderRadius: 4,
               overflow: 'hidden',
               bgcolor: theme.bgPanel,
               color: theme.text,
               border: `1px solid ${theme.border}`,
            },
         }}
      >
         <DialogTitle sx={{ fontWeight: 950, display: 'flex', alignItems: 'center', gap: 1 }}>
            <PlayCircleFilledRoundedIcon sx={{ color: '#fb923c' }} />
            {current?.title || 'Відео об’єкта'}
         </DialogTitle>

         <DialogContent>
            <Box
               sx={{
                  position: 'relative',
                  aspectRatio: '16 / 9',
                  borderRadius: 3,
                  overflow: 'hidden',
                  bgcolor: mode === 'light' ? '#111827' : '#05050a',
                  border: `1px solid ${theme.border}`,
               }}
            >
               {embedUrl ? (
                  <Box
                     component="iframe"
                     src={embedUrl}
                     title={current?.title || 'Відео об’єкта'}
                     allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                     allowFullScreen
                     sx={{
                        width: '100%',
                        height: '100%',
                        border: 0,
                        display: 'block',
                     }}
                  />
               ) : (
                  <Stack
                     spacing={1.2}
                     alignItems="center"
                     justifyContent="center"
                     sx={{ width: '100%', height: '100%', p: 3, textAlign: 'center' }}
                  >
                     <VideoLibraryRoundedIcon sx={{ color: '#fb923c', fontSize: 54 }} />
                     <Typography sx={{ color: theme.text, fontWeight: 950 }}>
                        {getVideoPlatformLabel(current?.platform)} відкриється на платформі
                     </Typography>
                     <Typography sx={{ color: theme.textSoft, fontSize: 13, maxWidth: 460 }}>
                        Для цього типу відео краще використати зовнішній перегляд, щоб усе коректно відкрилося.
                     </Typography>
                  </Stack>
               )}

               {hasMany && (
                  <>
                     <IconButton
                        onClick={() => go(-1)}
                        sx={{
                           position: 'absolute',
                           left: 10,
                           top: '50%',
                           transform: 'translateY(-50%)',
                           color: '#fff',
                           bgcolor: 'rgba(0,0,0,0.36)',
                           '&:hover': { bgcolor: 'rgba(0,0,0,0.54)' },
                        }}
                     >
                        <ArrowBackIosNewRoundedIcon fontSize="small" />
                     </IconButton>
                     <IconButton
                        onClick={() => go(1)}
                        sx={{
                           position: 'absolute',
                           right: 10,
                           top: '50%',
                           transform: 'translateY(-50%)',
                           color: '#fff',
                           bgcolor: 'rgba(0,0,0,0.36)',
                           '&:hover': { bgcolor: 'rgba(0,0,0,0.54)' },
                        }}
                     >
                        <ArrowForwardIosRoundedIcon fontSize="small" />
                     </IconButton>
                  </>
               )}
            </Box>

            {current?.note && (
               <Typography sx={{ color: theme.textSoft, fontSize: 13, lineHeight: 1.55, mt: 1.1 }}>
                  {current.note}
               </Typography>
            )}

            {hasMany && (
               <Stack direction="row" spacing={0.7} useFlexGap flexWrap="wrap" sx={{ mt: 1.1 }}>
                  {safeVideos.map((video, index) => (
                     <Chip
                        key={video._id || video.url}
                        icon={video.isMain ? <PlayCircleFilledRoundedIcon /> : undefined}
                        label={video.title || getVideoTypeLabel(video.type)}
                        size="small"
                        onClick={() => onSelect?.(index)}
                        sx={{
                           height: 26,
                           maxWidth: 190,
                           color: index === currentIndex ? '#111827' : theme.text,
                           bgcolor: index === currentIndex
                              ? '#fb923c !important'
                              : mode === 'light'
                                 ? 'rgba(249,115,22,0.08) !important'
                                 : 'rgba(255,255,255,0.045) !important',
                           border: index === currentIndex
                              ? '1px solid rgba(251,146,60,0.9)'
                              : `1px solid ${theme.border}`,
                           fontWeight: 900,
                           '& .MuiChip-label': {
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                           },
                        }}
                     />
                  ))}
               </Stack>
            )}
         </DialogContent>

         <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button
               onClick={() => navigator.clipboard.writeText(current?.url || '')}
               disabled={!current?.url}
               startIcon={<ContentCopyRoundedIcon />}
               sx={{ color: theme.accentLight, fontWeight: 900 }}
            >
               Копіювати
            </Button>

            <Button
               component="a"
               href={current?.url || '#'}
               target="_blank"
               rel="noreferrer"
               disabled={!current?.url}
               startIcon={<OpenInNewRoundedIcon />}
               sx={{ color: '#fb923c', fontWeight: 900 }}
            >
               Відкрити
            </Button>

            <Button onClick={onClose} sx={{ color: theme.textSoft }}>
               Закрити
            </Button>
         </DialogActions>
      </Dialog>
   );
}


function getPlatformLabel(platform) {
   if (platform === 'olx') return 'OLX';
   if (platform === 'dimria') return 'DIM.RIA';
   if (platform === 'rieltor') return 'RIELTOR.UA';
   if (platform === 'lun') return 'LUN.UA';
   if (platform === 'flatfy') return 'Flatfy.ua';
   if (platform === 'real-estate') return 'Real-estate';
   if (platform === 'facebook') return 'Facebook';
   if (platform === 'instagram') return 'Instagram';
   if (platform === 'tiktok') return 'TikTok';
   if (platform === 'telegram') return 'Telegram';
   if (platform === 'site') return 'Сайт';
   return 'Інше';
}

function getVideoPlatformLabel(platform) {
   if (platform === 'youtube') return 'YouTube';
   if (platform === 'tiktok') return 'TikTok';
   if (platform === 'instagram') return 'Instagram';
   if (platform === 'facebook') return 'Facebook';
   if (platform === 'telegram') return 'Telegram';
   if (platform === 'drive') return 'Drive';
   return 'Інше';
}

function getVideoTypeLabel(type) {
   if (type === 'main') return 'Основне';
   if (type === 'short_review') return 'Короткий огляд';
   if (type === 'storytelling') return 'Сторітелінг';
   if (type === 'full_review') return 'Повний огляд';
   return 'Інше';
}

function getMainVideo(item) {
   const videos = Array.isArray(item?.propertyVideos) ? item.propertyVideos : [];
   return videos.find((video) => video?.isMain) || videos[0] || null;
}

function getYouTubeEmbedUrl(url) {
   if (!url) return '';

   try {
      const parsed = new URL(url);
      const host = parsed.hostname.replace(/^www\./, '');
      let id = '';

      if (host === 'youtu.be') {
         id = parsed.pathname.split('/').filter(Boolean)[0] || '';
      } else if (host.includes('youtube.com')) {
         if (parsed.pathname.startsWith('/embed/')) id = parsed.pathname.split('/')[2] || '';
         else if (parsed.pathname.startsWith('/shorts/')) id = parsed.pathname.split('/')[2] || '';
         else id = parsed.searchParams.get('v') || '';
      }

      return id ? `https://www.youtube.com/embed/${id}` : '';
   } catch (error) {
      return '';
   }
}

function getAdStatusLabel(status) {
   if (status === 'active') return 'Активна';
   if (status === 'paused') return 'Пауза';
   if (status === 'archived') return 'Архів';
   if (status === 'problem') return 'Проблема';
   return '—';
};


function groupLinksByPlatform(links = []) {
   return links.reduce((acc, link) => {
      const key = link.platform || 'other';
      if (!acc[key]) acc[key] = [];
      acc[key].push(link);
      return acc;
   }, {});
}

function getLinksBySource(links = [], sourceType) {
   return links.filter((x) => (x.sourceType || 'ours') === sourceType);
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
   });
}


// function BusinessScoreView({ score = {}, theme, mode }) {
//    return (
//       <Stack spacing={0.65}>
//          {Object.entries(BUSINESS_SCORE_OPTIONS).map(([key, config]) => {
//             const value = score?.[key];
//             if (!value) return null;

//             return (
//                <Box
//                   key={key}
//                   sx={{
//                      p: 0.75,
//                      borderRadius: 2,
//                      bgcolor:
//                         mode === 'light'
//                            ? 'rgba(124,58,237,0.035)'
//                            : 'rgba(255,255,255,0.025)',
//                      border: `1px solid ${theme.border}`,
//                   }}
//                >
//                   <Typography sx={{ color: theme.text, fontWeight: 900, fontSize: 12.5 }}>
//                      {config.label}: {value}
//                   </Typography>
//                   <Typography sx={{ color: theme.textSoft, fontSize: 12 }}>
//                      {config.options[value]}
//                   </Typography>
//                </Box>
//             );
//          })}
//       </Stack>
//    );
// };


function BusinessScoreView({ score = {}, theme, mode, strategyApprovedByName = '' }) {
   return (
      <Stack spacing={0.18}>
         {Object.entries(BUSINESS_SCORE_OPTIONS).map(([key, config]) => {
            const value = score?.[key];
            if (!value) return null;

            const row = (
               <Box
                  key={key}
                  sx={{
                     px: 0.58,
                     py: 0.2,
                     borderRadius: 1.45,
                     bgcolor:
                        mode === 'light'
                           ? 'rgba(124,58,237,0.035)'
                           : 'rgba(255,255,255,0.022)',
                     border: `1px solid ${theme.border}`,
                     display: 'flex',
                     alignItems: 'center',
                     gap: 0.38,
                     minWidth: 0,
                  }}
               >
                  <Typography
                     sx={{
                        color: theme.text,
                        fontWeight: 950,
                        fontSize: 10.8,
                        whiteSpace: 'nowrap',
                     }}
                  >
                     {config.label}: {value}
                  </Typography>

                  <Typography
                     sx={{
                        color: theme.textSoft,
                        fontSize: 10.6,
                        minWidth: 0,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                     }}
                     title={config.options[value]}
                  >
                     — {config.options[value]}
                  </Typography>
               </Box>
            );

            if (key === 'adStrategy' && strategyApprovedByName) {
               return (
                  <Tooltip key={key} title={`Стратегію погодив: ${strategyApprovedByName}`} arrow>
                     {row}
                  </Tooltip>
               );
            }

            return row;
         })}
      </Stack>
   );
};


function PhotoBadge({ label, title, active, color, onClick }) {
   return (
      <Tooltip title={title}>
         <Box
            onClick={onClick}
            sx={{
               width: 28,
               height: 28,
               borderRadius: '50%',
               display: 'flex',
               alignItems: 'center',
               justifyContent: 'center',
               fontSize: 15,
               cursor: 'pointer',
               opacity: active ? 1 : 0.45,
               bgcolor: active ? color : 'rgba(15,15,23,0.68)',
               border: active
                  ? '1px solid rgba(255,255,255,0.45)'
                  : '1px solid rgba(255,255,255,0.22)',
               boxShadow: active ? '0 8px 22px rgba(0,0,0,0.35)' : 'none',
               backdropFilter: 'blur(8px)',
               transition: '0.18s ease',
               '&:hover': {
                  opacity: 1,
                  transform: 'translateY(-1px) scale(1.04)',
               },
            }}
         >
            {label}
         </Box>
      </Tooltip>
   );
};

function RealtorBugBadge() {
   return (
      <Tooltip title="Маклерський об’єкт">
         <Box
            sx={{
               width: 26,
               height: 26,
               display: 'flex',
               alignItems: 'center',
               justifyContent: 'center',
               filter: 'drop-shadow(0 5px 8px rgba(0,0,0,0.52))',
               transform: 'rotate(-12deg)',
            }}
         >
            <PestControlRoundedIcon
               sx={{
                  fontSize: 24,
                  color: '#ef4444',
                  '&:hover': {
                     transform: 'rotate(-12deg) scale(1.08)',
                  }
               }}
            />
         </Box>
      </Tooltip>
   );
}

// function MiniPhotoMark({ label }) {
//    return (
//       <Box
//          sx={{
//             width: 22,
//             height: 22,
//             borderRadius: '50%',
//             display: 'flex',
//             alignItems: 'center',
//             justifyContent: 'center',
//             fontSize: 12,
//             bgcolor: 'rgba(15,15,23,0.72)',
//             border: '1px solid rgba(255,255,255,0.25)',
//             backdropFilter: 'blur(8px)',
//          }}
//       >
//          {label}
//       </Box>
//    );
// };



// const FINANCE_PRODUCT_META = {
//    5: {
//       label: 'Власник платить комісію',
//       short: 'Наша комісія',
//       color: '#8b5cf6',
//       icon: '💰',
//    },
//    4: {
//       label: 'Власник платить частково',
//       short: 'Частково',
//       color: '#22c55e',
//       icon: '💵',
//    },
//    2: {
//       label: 'Ділимо комісію з маклером',
//       short: 'Ділимо',
//       color: '#ef4444',
//       icon: '🪙',
//    },
//    1: {
//       label: 'Віддаємо всю комісію',
//       short: 'Невигідно',
//       color: '#374151',
//       icon: '₿',
//    },
// };


//  тут міняємо стилі іконок на фото
function MiniPhotoMark({ label, title, color, type }) {
   const isCoin = type === 'coin';

   return (
      <Tooltip title={title || ''}>
         <Box
            sx={{
               width: 26,
               height: 26,
               display: 'flex',
               alignItems: 'center',
               justifyContent: 'center',
               lineHeight: 1,
               fontSize: isCoin ? 24 : 22,
               color: color || '#fff',
               textShadow: '0 2px 8px rgba(0,0,0,0.65)',
               filter: 'drop-shadow(0 5px 8px rgba(0,0,0,0.45))',
            }}
         >
            {label}
         </Box>
      </Tooltip>
   );
}

const FINANCE_PRODUCT_META = {
   5: {
      label: 'Власник платить комісію',
      short: 'Наша комісія',
      color: '#6212b2', // '#8b5cf6',
      icon: '●',
   },
   4: {
      label: 'Власник платить частково',
      short: 'Частково',
      color: '#008f1a',
      icon: '●',
   },
   3: {
      label: 'Власник не платить',
      short: 'Не платить',
      color: '#fff500',
      icon: '●',
   },
   2: {
      label: 'Ділимо комісію з маклером',
      short: 'Ділимо',
      color: '#ad0101',
      icon: '●',
   },
   1: {
      label: 'Віддаємо всю комісію',
      short: 'Невигідно',
      color: '#400808', // '#111827',
      icon: '●',
   },
};

function getFinanceProduct(item) {
   const value = Number(item?.businessScore?.finance);
   if (!value || value === 3) return null;
   return FINANCE_PRODUCT_META[value] || null;
};


// function FinanceCoin({ title, color }) {
//    return (
//       <Tooltip title={title || ''}>
//          <Box
//             sx={{
//                width: 26,
//                height: 26,
//                display: 'flex',
//                alignItems: 'center',
//                justifyContent: 'center',
//                filter: 'drop-shadow(0 5px 8px rgba(0,0,0,0.48))',
//             }}
//          >
//             <MonetizationOnRoundedIcon
//                sx={{
//                   fontSize: 27,
//                   color,
//                   stroke: 'rgba(255,255,255,0.45)',
//                   strokeWidth: 0.4,
//                }}
//             />
//          </Box>
//       </Tooltip>
//    );
// };

function FinanceCoin({ title, color }) {
   return (
      <Tooltip title={title || ''}>
         <Box
            sx={{
               width: 26,
               height: 26,
               borderRadius: '50%',
               display: 'flex',
               alignItems: 'center',
               justifyContent: 'center',

               background: `radial-gradient(circle at 30% 30%, rgba(255,255,255,0.28), transparent 45%), ${color}`,

               border: '1px solid rgba(255,255,255,0.38)',

               boxShadow: `
                  0 6px 14px rgba(0,0,0,0.38),
                  inset 0 1px 2px rgba(255,255,255,0.35)
               `,

               backdropFilter: 'blur(8px)',

               position: 'relative',
            }}
         >
            <Box
               component="span"
               sx={{
                  fontSize: 18,
                  fontWeight: 1000,

                  color: '#facc15',

                  textShadow: `
                     0 1px 2px rgba(0,0,0,0.55),
                     0 0 6px rgba(250,204,21,0.45)
                  `,
                  lineHeight: 1,

                  transform: 'translateY(-0.5px)',
               }}
            >
               $
            </Box>
         </Box>
      </Tooltip>
   );
};


function getObjectRating(score = {}) {
   const weights = {
      finance: 2,
      liquidity: 1.5,
      loyalty: 1.2,
      motivation: 1.2,
      problemFree: 1,
      adAttractiveness: 1,
      adHistory: 1,
      adStrategy: 1,
   };

   let sum = 0;
   let weightSum = 0;

   Object.entries(weights).forEach(([key, weight]) => {
      const value = Number(score?.[key]);
      if (value >= 1 && value <= 5) {
         sum += value * weight;
         weightSum += weight;
      }
   });

   if (!weightSum) return null;

   return Number((sum / weightSum).toFixed(1));
}

function getRatingMeta(rating) {
   if (!rating) return null;
   if (rating >= 4.4) return { label: 'Топ', color: '#22c55e' };
   if (rating >= 3.6) return { label: 'Сильний', color: '#8b5cf6' };
   if (rating >= 2.8) return { label: 'Норм', color: '#eab308' };
   return { label: 'Слабкий', color: '#ef4444' };
}

function getOperationMarker(summary = {}) {
   if ((summary?.persCount || 0) > 0) {
      return {
         label: 'ПЕРС',
         title: 'ПЕРС по об’єкту',
         color: '#a855f7',
         glow: 'rgba(168,85,247,0.42)',
         icon: <GavelRoundedIcon sx={{ fontSize: 54 }} />,
      };
   }

   if ((summary?.lossCount || 0) > 0) {
      return {
         label: 'Втрата',
         title: 'Втрата об’єкта',
         color: '#ef4444',
         glow: 'rgba(239,68,68,0.42)',
         icon: <HeartBrokenRoundedIcon sx={{ fontSize: 58 }} />,
      };
   }

   if ((summary?.activeDepositCount || 0) > 0) {
      return {
         label: 'ЗС',
         title: 'Завдаток по об’єкту',
         color: '#22c55e',
         glow: 'rgba(34,197,94,0.38)',
         icon: <HandshakeRoundedIcon sx={{ fontSize: 56 }} />,
      };
   }

   if ((summary?.activePzsCount || 0) > 0) {
      return {
         label: 'ПЗС',
         title: 'Активний ПЗС по об’єкту',
         color: '#e879f9',
         glow: 'rgba(232,121,249,0.34)',
         icon: <MovingRoundedIcon sx={{ fontSize: 56 }} />,
      };
   }

   return null;
}

function OperationPhotoMarker({ marker }) {
   if (!marker) return null;

   return (
      <Tooltip title={marker.title}>
         <Box
            sx={{
               position: 'absolute',
               inset: 0,
               display: 'flex',
               alignItems: 'center',
               justifyContent: 'center',
               pointerEvents: 'none',
               zIndex: 1,
            }}
         >
            <Box
               sx={{
                  width: 78,
                  height: 78,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: marker.color,
                  bgcolor: 'rgba(10,10,18,0.32)',
                  border: `1px solid ${marker.color}55`,
                  boxShadow: `0 0 34px ${marker.glow}, inset 0 0 22px rgba(255,255,255,0.06)`,
                  backdropFilter: 'blur(2px)',
                  opacity: 0.76,
                  textShadow: '0 4px 16px rgba(0,0,0,0.55)',
               }}
            >
               {marker.icon}
            </Box>
         </Box>
      </Tooltip>
   );
}

function MiniCounter({ icon, label, value, color, theme, mode }) {
   if (!value) return null;

   return (
      <Tooltip title={label}>
         <Stack
            direction="row"
            spacing={0.45}
            alignItems="center"
            sx={{
               height: 28,
               px: 0.75,
               borderRadius: 2,
               color,
               bgcolor: mode === 'light' ? 'rgba(255,255,255,0.74)' : 'rgba(255,255,255,0.045)',
               border: `1px solid ${color}44`,
               boxShadow: mode === 'light' ? '0 5px 14px rgba(15,23,42,0.06)' : 'none',
               flexShrink: 0,
            }}
         >
            <Box sx={{ display: 'flex', color }}>
               {icon}
            </Box>
            <Typography sx={{ color: theme.text, fontSize: 12, fontWeight: 950, lineHeight: 1 }}>
               {value}
            </Typography>
         </Stack>
      </Tooltip>
   );
}

function OperationCounters({ summary = {}, theme, mode }) {
   const hasCounters =
      (summary?.showingsCount || 0) ||
      (summary?.pzsCount || 0) ||
      (summary?.newClientsCount || 0) ||
      (summary?.lossCount || 0);

   if (!hasCounters) return null;

   return (
      <Stack direction="row" spacing={0.45} alignItems="center" flexWrap="wrap" useFlexGap>
         <MiniCounter
            icon={<VisibilityRoundedIcon sx={{ fontSize: 15 }} />}
            label="Покази"
            value={summary.showingsCount}
            color="#38bdf8"
            theme={theme}
            mode={mode}
         />
         <MiniCounter
            icon={<MovingRoundedIcon sx={{ fontSize: 15 }} />}
            label="ПЗС"
            value={summary.pzsCount}
            color="#e879f9"
            theme={theme}
            mode={mode}
         />
         <MiniCounter
            icon={<PersonAddAlt1RoundedIcon sx={{ fontSize: 15 }} />}
            label="Нові клієнти"
            value={summary.newClientsCount}
            color="#f59e0b"
            theme={theme}
            mode={mode}
         />
         <MiniCounter
            icon={<HeartBrokenRoundedIcon sx={{ fontSize: 15 }} />}
            label="Втрати"
            value={summary.lossCount}
            color="#ef4444"
            theme={theme}
            mode={mode}
         />
      </Stack>
   );
}




export default function ObjectWorkRowCard({ item, onEdit, onDelete, onRefresh, showAdvertisingRows = true, canManage = false, employees = [] }) {
   const [open, setOpen] = useState(false);

   const [adTitle, setAdTitle] = useState('');
   const [adText, setAdText] = useState('');
   const [adNote, setAdNote] = useState('');
   const [editingAdText, setEditingAdText] = useState(null);
   const [selectedAdText, setSelectedAdText] = useState(null);
   const [adTextDeleteOpen, setAdTextDeleteOpen] = useState(false);
   const [adTextDeleting, setAdTextDeleting] = useState(false);

   const [openVideoDialog, setOpenVideoDialog] = useState(false);
   const [videoPlatform, setVideoPlatform] = useState('youtube');
   const [videoType, setVideoType] = useState('main');
   const [videoTitle, setVideoTitle] = useState('');
   const [videoUrl, setVideoUrl] = useState('');
   const [videoNote, setVideoNote] = useState('');
   const [videoCreatedAt, setVideoCreatedAt] = useState(getNowLocal());
   const [videoIsMain, setVideoIsMain] = useState('yes');
   const [editingVideo, setEditingVideo] = useState(null);
   const [selectedVideo, setSelectedVideo] = useState(null);
   const [videoDeleteOpen, setVideoDeleteOpen] = useState(false);
   const [videoDeleting, setVideoDeleting] = useState(false);
   const [videoGalleryOpen, setVideoGalleryOpen] = useState(false);
   const [videoGalleryIndex, setVideoGalleryIndex] = useState(0);



   const [adPlatform, setAdPlatform] = useState('olx');
   const [adUrl, setAdUrl] = useState('');
   const [adTitleLink, setAdTitleLink] = useState('');
   const [adNoteLink, setAdNoteLink] = useState('');
   const [adClosedAt, setAdClosedAt] = useState('');
   const [adClosedNote, setAdClosedNote] = useState('');
   const [editingAdvertisingLink, setEditingAdvertisingLink] = useState(null);


   const [linksAnchor, setLinksAnchor] = useState(null);
   const [hoveredLinks, setHoveredLinks] = useState([]);
   const [showAdsPanel, setShowAdsPanel] = useState(false);

   const [adSourceType, setAdSourceType] = useState('ours');
   const [openAddLink, setOpenAddLink] = useState(false);
   const [openAdText, setOpenAdText] = useState(false);

   const [showAdvertisingPanel, setShowAdvertisingPanel] = useState(false);
   const [openAdvertisingSettings, setOpenAdvertisingSettings] = useState(false);
   const [advertisingSettingsForm, setAdvertisingSettingsForm] = useState(() => emptyAdvertisingSettingsForm(item));
   const [advertisingSettingsSaving, setAdvertisingSettingsSaving] = useState(false);
   const [advertisingSettingsError, setAdvertisingSettingsError] = useState('');

   const [adCreatedAt, setAdCreatedAt] = useState(getNowLocal());

   const [openWorkNote, setOpenWorkNote] = useState(false);
   const [historyDrawerOpen, setHistoryDrawerOpen] = useState(false);
   const [timelineItems, setTimelineItems] = useState([]);
   const [timelineLoading, setTimelineLoading] = useState(false);
   const [timelineLoaded, setTimelineLoaded] = useState(false);
   const [timelineError, setTimelineError] = useState('');
   const [noteText, setNoteText] = useState('');
   const [noteType, setNoteType] = useState('note');
   const [noteTone, setNoteTone] = useState('info');
   const [noteCreatedAt, setNoteCreatedAt] = useState(getNowLocal());
   const [editingWorkNote, setEditingWorkNote] = useState(null);
   const [selectedWorkNote, setSelectedWorkNote] = useState(null);
   const [workNoteDeleteOpen, setWorkNoteDeleteOpen] = useState(false);
   const [workNoteDeleting, setWorkNoteDeleting] = useState(false);

   const [openShare, setOpenShare] = useState(false);
   const [shareLoading, setShareLoading] = useState(false);
   const [shareLead, setShareLead] = useState(null);
   const [shareLeadQuery, setShareLeadQuery] = useState('');
   const [shareLeadOptions, setShareLeadOptions] = useState([]);
   const [shareLeadLoading, setShareLeadLoading] = useState(false);

   const [aiStyle, setAiStyle] = useState('telegram');
   const [aiLoading, setAiLoading] = useState(false);


   const [visualTags, setVisualTags] = useState(item?.visualTags || {});


   const [photoOpen, setPhotoOpen] = useState(false);
   const [photoIndex, setPhotoIndex] = useState(0);
   const [imageActionLoading, setImageActionLoading] = useState('');
   const [photoUploadStage, setPhotoUploadStage] = useState('draft');
   const [photoUploading, setPhotoUploading] = useState(false);
   const [imageDeleteTarget, setImageDeleteTarget] = useState(null);
   const photoUploadInputRef = useRef(null);


   const [editingLink, setEditingLink] = useState(null);
   const [editTitle, setEditTitle] = useState('');

   const [shareTitleDraft, setShareTitleDraft] = useState('');
   const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
   const [selectedShareLink, setSelectedShareLink] = useState(null);
   const [shareActionLoading, setShareActionLoading] = useState(false);
   const [advertisingLinkDeleteTarget, setAdvertisingLinkDeleteTarget] = useState(null);
   const [advertisingLinkDeleting, setAdvertisingLinkDeleting] = useState(false);


   const galleryImages = (item?.images || [])
      .filter((img) => !img.isHidden)
      .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
      .map((img) => ({
         ...img,
         url: getImageStageUrl(img),
      }));

   const closeLinksMenu = () => {
      setLinksAnchor(null);
      setHoveredLinks([]);
   };


   const { theme, mode } = useCRMTheme();
   const fieldSx = getFieldSx(theme, mode);

   const loadTimeline = async (force = false) => {
      if (!item?._id) return;
      if (timelineLoading) return;
      if (timelineLoaded && !force) return;

      setTimelineLoading(true);
      setTimelineError('');

      try {
         const res = await fetch(`/api/crm/properties/${item._id}/timeline`, { cache: 'no-store' });
         if (!res.ok) throw new Error('timeline failed');
         const data = await res.json();
         setTimelineItems(Array.isArray(data?.items) ? data.items : []);
         setTimelineLoaded(true);
      } catch (error) {
         console.error('Failed to load property timeline', error);
         setTimelineError('Не вдалося завантажити історію');
      } finally {
         setTimelineLoading(false);
      }
   };

   useEffect(() => {
      setTimelineItems([]);
      setTimelineLoaded(false);
      setTimelineError('');
   }, [item?._id]);

   useEffect(() => {
      if (historyDrawerOpen) loadTimeline();
   }, [historyDrawerOpen]);

   useEffect(() => {
      if (!openShare || shareLeadQuery.trim().length < 2) {
         setShareLeadOptions([]);
         setShareLeadLoading(false);
         return undefined;
      }

      let cancelled = false;
      const timeout = setTimeout(async () => {
         setShareLeadLoading(true);
         try {
            const params = new URLSearchParams({
               q: shareLeadQuery.trim(),
               searchFields: 'identity',
               pageSize: '8',
               actuality: 'active',
            });
            const res = await fetch(`/api/crm/leads?${params.toString()}`, { cache: 'no-store' });
            const data = await res.json();
            if (!cancelled) setShareLeadOptions(Array.isArray(data?.items) ? data.items : []);
         } catch (error) {
            console.error('Failed to load leads for share link', error);
            if (!cancelled) setShareLeadOptions([]);
         } finally {
            if (!cancelled) setShareLeadLoading(false);
         }
      }, 280);

      return () => {
         cancelled = true;
         clearTimeout(timeout);
      };
   }, [openShare, shareLeadQuery]);

   const isLight = mode === 'light';

   const softBoxSx = {
      bgcolor: isLight ? 'rgba(124,58,237,0.04)' : 'rgba(255,255,255,0.03)',
      border: `1px solid ${theme.border}`,
   };

   const isLuxury = mode === 'luxury';

   const panelBg =
      mode === 'dark'
         ? '#0f0f17' // 'rgba(15,15,23,0.92)'
         : mode === 'light'
            ? '#ffffff'
            : 'rgba(23,18,15,0.96)';

   const mutedPanel =
      mode === 'light'
         ? 'rgba(124,58,237,0.045)'
         : mode === 'luxury'
            ? 'rgba(212,175,55,0.07)'
            : 'rgba(255,255,255,0.035)';


   const chipBase = {
      fontWeight: 900,
      borderRadius: 999,
      height: 24,
   };

   const chipNeutralSx = {
      ...chipBase,
      color: mode === 'light' ? '#374151' : theme.text,
      bgcolor: mode === 'light'
         ? 'rgba(0,0,0,0.04) !important'
         : 'rgba(255,255,255,0.035) !important',
      border: `1px solid ${theme.border}`,
   };

   const chipAccentSx = {
      ...chipBase,
      color: mode === 'light' ? '#5b21b6' : theme.accentLight,
      bgcolor: mode === 'light'
         ? 'rgba(124,58,237,0.10) !important'
         : 'rgba(139,92,246,0.15) !important',
      border: `1px solid ${theme.border}`,
   };

   const chipSuccessSx = {
      ...chipBase,
      color: mode === 'light' ? '#065f46' : '#bbf7d0',
      bgcolor: mode === 'light'
         ? 'rgba(16,185,129,0.12) !important'
         : 'rgba(34,197,94,0.13) !important',
      border: mode === 'light'
         ? '1px solid rgba(16,185,129,0.25)'
         : '1px solid rgba(34,197,94,0.22)',
   };
   const chipOnlineSx = {
      ...chipBase,
      color: mode === 'light' ? '#1e3a8a' : '#bfdbfe',
      bgcolor: mode === 'light'
         ? 'rgba(59,130,246,0.10) !important'
         : 'rgba(59,130,246,0.12) !important',
      border: mode === 'light'
         ? '1px solid rgba(59,130,246,0.22)'
         : '1px solid rgba(59,130,246,0.22)',
   };

   const cardSx = {
      border: `1px solid ${theme.border}`,
      bgcolor: panelBg,
      color: theme.text,
      boxShadow: open ? `0 18px 44px ${theme.glow}` : 'none',
   };

   const textSoft = theme.textSoft;


   const image = getImageUrl(item);
   const assigneeName = getEmployeeName(item?.assignee);
   const createdByName = getEmployeeName(item?.createdByEmployee);

   const locationText =
      item?.location_text ||
      [item?.location?.city, item?.location?.street, item?.location?.number]
         .filter(Boolean)
         .join(', ') ||
      'Адреса не вказана';

   const openAdvertisingSettingsDialog = () => {
      setAdvertisingSettingsForm(emptyAdvertisingSettingsForm(item));
      setAdvertisingSettingsError('');
      setOpenAdvertisingSettings(true);
   };

   const handleSaveAdvertisingSettings = async () => {
      setAdvertisingSettingsSaving(true);
      setAdvertisingSettingsError('');
      try {
         const res = await fetch('/api/crm/advertising/properties', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
               ...advertisingSettingsForm,
               property: item?._id,
            }),
         });

         if (!res.ok) {
            const body = await res.json().catch(async () => ({ error: await res.text() }));
            throw new Error(body.error || 'Не вдалося зберегти рекламне завдання');
         }

         setOpenAdvertisingSettings(false);
         await onRefresh?.();
      } catch (err) {
         setAdvertisingSettingsError(err.message || 'Не вдалося зберегти рекламне завдання');
      } finally {
         setAdvertisingSettingsSaving(false);
      }
   };

   const handleImageAction = async (image, action, hidden, stage) => {
      const imageId = getImageActionId(image);
      if (!item?._id || !imageId) return;
      setImageActionLoading(String(imageId));
      try {
         const res = await fetch(`/api/crm/properties/${item._id}/images`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
               imageId,
               action,
               hidden,
               stage,
            }),
         });

         if (!res.ok) {
            const body = await res.json().catch(async () => ({ error: await res.text() }));
            throw new Error(body.error || 'Не вдалося оновити фото');
         }

         await onRefresh?.();
      } catch (error) {
         console.error('Gallery image action failed', error);
      } finally {
         setImageActionLoading('');
      }
   };

   const handleUploadGalleryPhotos = async (event) => {
      const files = Array.from(event.target.files || []);
      event.target.value = '';
      if (!item?._id || !files.length) return;

      setPhotoUploading(true);
      try {
         const prepared = await prepareImageUploadFiles(files, {
            maxPayloadBytes: Number.POSITIVE_INFINITY,
         });
         if (!prepared.accepted.length) {
            const reason = prepared.failed[0] || 'фото не вдалося підготувати';
            throw new Error(reason);
         }

         const batches = buildImageUploadBatches(prepared.accepted, {
            maxPayloadBytes: SAFE_IMAGE_PAYLOAD_BYTES,
         });

         for (const batch of batches) {
            const formData = new FormData();
            batch.forEach((file) => formData.append('images', file));
            formData.append('stage', photoUploadStage);

            const res = await fetch(`/api/crm/properties/${item._id}/images`, {
               method: 'POST',
               body: formData,
            });

            if (!res.ok) {
               const body = await res.json().catch(async () => ({ error: await res.text() }));
               throw new Error(body.error || 'Не вдалося додати фото');
            }
         }

         await onRefresh?.();
         if (prepared.failed.length) {
            alert(`Не вдалося обробити частину фото: ${prepared.failed.join(', ')}`);
         }
      } catch (error) {
         console.error('Gallery image upload failed', error);
         alert(error?.message || 'Не вдалося додати фото');
      } finally {
         setPhotoUploading(false);
      }
   };

   const handleDeleteGalleryPhoto = async (image) => {
      const imageId = getImageActionId(image);
      if (!item?._id || !imageId) return;
      setImageActionLoading(String(imageId));
      try {
         const res = await fetch(`/api/crm/properties/${item._id}/images`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ imageId }),
         });

         if (!res.ok) {
            const body = await res.json().catch(async () => ({ error: await res.text() }));
            throw new Error(body.error || 'Не вдалося видалити фото');
         }

         await onRefresh?.();
         setImageDeleteTarget(null);
      } catch (error) {
         console.error('Gallery image delete failed', error);
      } finally {
         setImageActionLoading('');
      }
   };


   const handleAddAdvertisingLink = async () => {
      if (!adUrl.trim()) return;

      const linkId = editingAdvertisingLink?._id || '';
      const res = await fetch(`/api/crm/properties/${item._id}/advertising-links`, {
         method: linkId ? 'PATCH' : 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({
            linkId,
            sourceType: adSourceType,
            platform: adPlatform,
            url: adUrl.trim(),
            title: adTitleLink.trim(),
            note: adNoteLink.trim(),
            status: adClosedAt ? 'archived' : 'active',
            createdAt: adCreatedAt || '',
            closedAt: adClosedAt || '',
            closedNote: adClosedNote.trim(),
         }),
      });

      if (!res.ok) {
         alert('Не вдалося додати посилання');
         return;
      }

      setAdSourceType('ours');
      setAdPlatform('olx');
      setAdUrl('');
      setAdTitleLink('');
      setAdNoteLink('');
      setAdClosedAt('');
      setAdClosedNote('');
      setEditingAdvertisingLink(null);
      setOpenAddLink(false);
      setAdCreatedAt(getNowLocal());

      await onRefresh?.();
   };

   const handleDeleteAdvertisingLink = async (link) => {
      if (!item?._id || !link?._id) return;
      setAdvertisingLinkDeleteTarget(link);
   };

   const confirmDeleteAdvertisingLink = async () => {
      if (!item?._id || !advertisingLinkDeleteTarget?._id) return;
      setAdvertisingLinkDeleting(true);

      try {
         const res = await fetch(`/api/crm/properties/${item._id}/advertising-links`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ linkId: advertisingLinkDeleteTarget._id }),
         });

         if (!res.ok) {
            alert('Не вдалося видалити посилання');
            return;
         }

         await onRefresh?.();
         setAdvertisingLinkDeleteTarget(null);
      } catch (error) {
         console.error('Advertising link delete failed', error);
         alert('Не вдалося видалити посилання');
      } finally {
         setAdvertisingLinkDeleting(false);
      }
   };

   const closeAdvertisingLinkDialog = () => {
      setOpenAddLink(false);
      setEditingAdvertisingLink(null);
      setAdClosedAt('');
      setAdClosedNote('');
   };

   const openCreateAdvertisingLink = () => {
      setEditingAdvertisingLink(null);
      setAdSourceType('ours');
      setAdPlatform('olx');
      setAdUrl('');
      setAdTitleLink('');
      setAdNoteLink('');
      setAdClosedAt('');
      setAdClosedNote('');
      setAdCreatedAt(getNowLocal());
      setOpenAddLink(true);
   };

   const openEditAdvertisingLink = (link) => {
      setEditingAdvertisingLink(link || null);
      setAdSourceType(link?.sourceType || 'ours');
      setAdPlatform(link?.platform || 'olx');
      setAdUrl(link?.url || '');
      setAdTitleLink(link?.title || '');
      setAdNoteLink(link?.note || '');
      setAdCreatedAt(toLocalInputValue(link?.createdAt));
      setAdClosedAt(link?.closedAt ? toLocalInputValue(link.closedAt) : getNowLocal());
      setAdClosedNote(link?.closedNote || '');
      setOpenAddLink(true);
   };

   const handleAddNote = async () => {
      if (!noteText.trim()) return;

      const noteId = editingWorkNote?._id || '';
      const res = await fetch(`/api/crm/properties/${item._id}/add-note`, {
         method: noteId ? 'PATCH' : 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({
            noteId,
            text: noteText.trim(),
            type: noteType,
            tone: noteTone,
            createdAt: noteCreatedAt ? new Date(noteCreatedAt).toISOString() : '',
         }),
      });

      if (!res.ok) {
         alert('Не вдалося додати запис');
         return;
      }

      setNoteText('');
      setNoteType('note');
      setNoteTone('info');
      setNoteCreatedAt(getNowLocal());
      setEditingWorkNote(null);
      setOpenWorkNote(false);

      await loadTimeline(true);
   };

   const openCreateWorkNote = () => {
      setEditingWorkNote(null);
      setNoteText('');
      setNoteType('note');
      setNoteTone('info');
      setNoteCreatedAt(getNowLocal());
      setOpenWorkNote(true);
   };

   const openEditWorkNote = (note) => {
      setEditingWorkNote(note || null);
      setNoteText(note?.text || '');
      setNoteType(WORK_HISTORY_TYPES.includes(note?.type) ? note.type : 'note');
      setNoteTone(note?.tone || 'info');
      setNoteCreatedAt(toLocalInputValue(note?.createdAt));
      setOpenWorkNote(true);
   };

   const closeWorkNoteDialog = () => {
      setOpenWorkNote(false);
      setEditingWorkNote(null);
   };

   const handleDeleteWorkNote = async (note) => {
      if (!note?._id) return;

      setSelectedWorkNote(note);
      setWorkNoteDeleteOpen(true);
   };

   const confirmDeleteWorkNote = async () => {
      if (!selectedWorkNote?._id) return;

      setWorkNoteDeleting(true);
      const res = await fetch(`/api/crm/properties/${item._id}/add-note`, {
         method: 'DELETE',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({ noteId: selectedWorkNote._id }),
      });
      setWorkNoteDeleting(false);

      if (!res.ok) {
         alert('Не вдалося видалити запис');
         return;
      }

      setSelectedWorkNote(null);
      setWorkNoteDeleteOpen(false);
      await loadTimeline(true);
   };

   const handleAddAdText = async () => {
      if (!adText.trim()) return;

      const textId = editingAdText?._id || '';
      const res = await fetch(`/api/crm/properties/${item._id}/add-ad-text`, {
         method: textId ? 'PATCH' : 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({
            textId,
            title: adTitle.trim(),
            text: adText.trim(),
            note: adNote.trim(),
         }),
      });

      if (!res.ok) {
         alert('Не вдалося додати рекламний текст');
         return;
      }

      setAdTitle('');
      setAdText('');
      setAdNote('');
      setEditingAdText(null);
      setOpenAdText(false);

      await onRefresh?.();
   };

   const openCreateAdText = () => {
      setEditingAdText(null);
      setAdTitle('');
      setAdText('');
      setAdNote('');
      setOpenAdText(true);
   };

   const openEditAdText = (text) => {
      setEditingAdText(text || null);
      setAdTitle(text?.title || '');
      setAdText(text?.text || '');
      setAdNote(text?.note || '');
      setOpenAdText(true);
   };

   const closeAdTextDialog = () => {
      setOpenAdText(false);
      setEditingAdText(null);
   };

   const openDeleteAdTextDialog = (text) => {
      setSelectedAdText(text || null);
      setAdTextDeleteOpen(true);
   };

   const confirmDeleteAdText = async () => {
      if (!selectedAdText?._id) return;

      setAdTextDeleting(true);
      const res = await fetch(`/api/crm/properties/${item._id}/add-ad-text`, {
         method: 'DELETE',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({ textId: selectedAdText._id }),
      });
      setAdTextDeleting(false);

      if (!res.ok) {
         alert('Не вдалося видалити рекламний текст');
         return;
      }

      setSelectedAdText(null);
      setAdTextDeleteOpen(false);
      await onRefresh?.();
   };

   const closeVideoDialog = () => {
      setOpenVideoDialog(false);
      setEditingVideo(null);
   };

   const openCreateVideo = () => {
      const hasVideos = Array.isArray(item?.propertyVideos) && item.propertyVideos.length > 0;
      setEditingVideo(null);
      setVideoPlatform('youtube');
      setVideoType('main');
      setVideoTitle('');
      setVideoUrl('');
      setVideoNote('');
      setVideoCreatedAt(getNowLocal());
      setVideoIsMain(hasVideos ? 'no' : 'yes');
      setOpenVideoDialog(true);
   };

   const openEditVideo = (video) => {
      setEditingVideo(video || null);
      setVideoPlatform(video?.platform || 'youtube');
      setVideoType(video?.type || 'main');
      setVideoTitle(video?.title || '');
      setVideoUrl(video?.url || '');
      setVideoNote(video?.note || '');
      setVideoCreatedAt(toLocalInputValue(video?.createdAt));
      setVideoIsMain(video?.isMain ? 'yes' : 'no');
      setOpenVideoDialog(true);
   };

   const openVideoGallery = (video) => {
      const videos = Array.isArray(item?.propertyVideos) ? item.propertyVideos : [];
      const index = Math.max(0, videos.findIndex((entry) => String(entry?._id || entry?.url) === String(video?._id || video?.url)));
      setVideoGalleryIndex(index);
      setVideoGalleryOpen(true);
   };

   const handleSaveVideo = async () => {
      if (!videoUrl.trim()) return;

      const videoId = editingVideo?._id || '';
      const res = await fetch(`/api/crm/properties/${item._id}/videos`, {
         method: videoId ? 'PATCH' : 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({
            videoId,
            platform: videoPlatform,
            type: videoType,
            title: videoTitle.trim(),
            url: videoUrl.trim(),
            note: videoNote.trim(),
            createdAt: videoCreatedAt || '',
            isMain: videoIsMain === 'yes',
         }),
      });

      if (!res.ok) {
         alert('Не вдалося зберегти відео');
         return;
      }

      closeVideoDialog();
      await onRefresh?.();
   };

   const openDeleteVideoDialog = (video) => {
      setSelectedVideo(video || null);
      setVideoDeleteOpen(true);
   };

   const confirmDeleteVideo = async () => {
      if (!selectedVideo?._id) return;

      setVideoDeleting(true);
      const res = await fetch(`/api/crm/properties/${item._id}/videos`, {
         method: 'DELETE',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({ videoId: selectedVideo._id }),
      });
      setVideoDeleting(false);

      if (!res.ok) {
         alert('Не вдалося видалити відео');
         return;
      }

      setSelectedVideo(null);
      setVideoDeleteOpen(false);
      await onRefresh?.();
   };


   const getShareUrl = (link) => {
      if (!link?.slug) return '';

      const base =
         typeof window !== 'undefined'
            ? window.location.origin
            : '';

      return link.type === 'partner'
         ? `${base}/p/${link.slug}`
         : `${base}/share/${link.slug}`;
   };

   // const handleCreateShareLink = async (type = 'client', presentationType = 'classic') => {
   //    setShareLoading(true);

   //    try {
   //       const res = await fetch(`/api/crm/properties/${item._id}/share-links`, {
   //          method: 'POST',
   //          headers: {
   //             'Content-Type': 'application/json',
   //          },
   //          body: JSON.stringify({
   //             type,
   //             presentationType,
   //          }),
   //       });

   //       // const json = await res.json();

   //       const text = await res.text();

   //       let json = null;
   //       try {
   //          json = JSON.parse(text);
   //       } catch {
   //          console.error('API повернув не JSON:', text);
   //       }

   //       if (!res.ok) {
   //          console.error('CREATE SHARE LINK ERROR:', json || text);
   //          return;
   //       }

   //       if (json?.link) {
   //          // setShareLinks((prev) => [json.link, ...prev]);
   //          await onRefresh?.();

   //       }
   //    } finally {
   //       setShareLoading(false);
   //    }
   // };


   const handleCreateShareLink = async (type = 'client', presentationType = 'classic') => {
      setShareLoading(true);

      try {
         const res = await fetch(`/api/crm/properties/${item._id}/share-links`, {
            method: 'POST',
            headers: {
               'Content-Type': 'application/json',
            },
            body: JSON.stringify({
               type,
               presentationType,
               title: shareTitleDraft.trim(),
               leadId: shareLead?._id || '',
            }),
         });

         const json = await res.json();

         if (!res.ok) {
            console.error('CREATE SHARE LINK ERROR:', json);
            return;
         }

         if (json?.link) {
            item.shareLinks = [json.link, ...(item.shareLinks || [])];
            setShareTitleDraft('');
            setShareLead(null);
            setShareLeadQuery('');
         }
      } finally {
         setShareLoading(false);
      }
   };

   const handleCopyShare = async (link) => {
      const url = getShareUrl(link);
      if (!url) return;

      await navigator.clipboard.writeText(url);
   };



   function buildShareMessage(item, link) {
      const title = item?.title || 'Об’єкт нерухомості';

      const price = item?.cost
         ? `${Number(item.cost).toLocaleString('uk-UA')} ${item.currency || ''}`
         : 'Ціна за запитом';

      const location = item?.location_text || '';

      const area = item?.square_tot ? `${item.square_tot} м²` : '';
      const floor =
         item?.floor && item?.floors
            ? `${item.floor}/${item.floors} поверх`
            : '';

      const rooms = item?.rooms ? `${item.rooms} кімн.` : '';

      const desc =
         item?.description?.slice(0, 120)?.trim() || '';

      const url = link ? getShareUrl(link) : '';

      return `🏡 ${title}

📍 ${location}
📐 ${[area, floor].filter(Boolean).join(' | ')}
🛏 ${rooms}
💰 ${price}

${desc ? `✨ ${desc}\n\n` : ''}📸 Деталі та фото:
${url}`;
   };


   const handleRenameShare = async (link) => {
      const title = window.prompt(
         'Нова назва презентації',
         link.title || ''
      );

      if (title === null) return;

      try {
         const res = await fetch(
            `/api/crm/properties/${item._id}/share-links/${link.slug}`,
            {
               method: 'PATCH',
               headers: {
                  'Content-Type': 'application/json',
               },
               body: JSON.stringify({
                  title,
               }),
            }
         );

         if (!res.ok) return;

         link.title = title;

         forceUpdate?.();
      } catch (error) {
         console.error(error);
      }
   };

   // const handleDeleteShare = async (link) => {
   //    const ok = window.confirm(
   //       'Видалити це посилання?'
   //    );

   //    if (!ok) return;

   //    try {
   //       const res = await fetch(
   //          `/api/crm/properties/${item._id}/share-links/${link.slug}`,
   //          {
   //             method: 'DELETE',
   //          }
   //       );

   //       if (!res.ok) return;

   //       item.shareLinks = item.shareLinks.filter(
   //          (x) => x.slug !== link.slug
   //       );

   //       forceUpdate?.();
   //    } catch (error) {
   //       console.error(error);
   //    }
   // };

   const openDeleteShareDialog = (link) => {
      setSelectedShareLink(link);
      setDeleteDialogOpen(true);
   };

   const handleDeleteShare = async () => {
      if (!selectedShareLink) return;

      setShareActionLoading(true);

      try {
         const res = await fetch(
            `/api/crm/properties/${item._id}/share-links/${selectedShareLink.slug}`,
            { method: 'DELETE' }
         );

         if (!res.ok) return;

         item.shareLinks = (item.shareLinks || []).filter(
            (x) => x.slug !== selectedShareLink.slug
         );

         setDeleteDialogOpen(false);
         setSelectedShareLink(null);
      } finally {
         setShareActionLoading(false);
      }
   };


   const generateAI = async (style) => {
      const res = await fetch(`/api/crm/properties/${item._id}/generate-text`, {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({ style }),
      });

      const data = await res.json();

      if (data?.text) {
         navigator.clipboard.writeText(data.text);
      }

      await onRefresh?.();
   };

   const handleGenerateAIText = async () => {
      try {
         setAiLoading(true);

         const res = await fetch(`/api/crm/properties/${item._id}/generate-text`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ style: aiStyle }),
         });

         const data = await res.json();

         if (!res.ok) {
            alert(data?.error || 'Не вдалося згенерувати текст');
            return;
         }

         setAdText(data.text || '');
         setAdTitle(`AI текст: ${aiStyle}`);
      } finally {
         setAiLoading(false);
      }
   };



   // Візуальні теги: "Гаряча пропозиція", "Обране", "Ріелторський об'єкт"
   const toggleVisualTag = async (key) => {
      const optimistic = {
         ...visualTags,
         [key]: !visualTags?.[key],
      };

      setVisualTags(optimistic);

      const res = await fetch(`/api/crm/properties/${item._id}/visual-tags`, {
         method: 'PATCH',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({ key }),
      });

      if (!res.ok) {
         setVisualTags(item?.visualTags || {});
         alert('Не вдалося оновити мітку');
         return;
      }

      const data = await res.json();
      setVisualTags(data.visualTags || optimistic);
   };

   const financeProduct = getFinanceProduct(item);
   const propertyVideos = Array.isArray(item?.propertyVideos) ? item.propertyVideos : [];
   const mainVideo = getMainVideo(item);
   const operationTimelineEstimate = item?.operationSummary
      ? (
         (item.operationSummary.showingsCount || 0) +
         (item.operationSummary.pzsCount || 0) +
         (item.operationSummary.lossCount || 0)
      )
      : 0;
   const timelineBadgeCount = timelineLoaded
      ? timelineItems.length
      : operationTimelineEstimate;
   const shareLinks = Array.isArray(item?.shareLinks) ? item.shareLinks : [];
   const shareLinksCount = shareLinks.length;
   const shareLeadId = shareLead?._id ? String(shareLead._id) : '';
   const repeatedLeadLinks = shareLeadId
      ? shareLinks.filter((link) => String(link?.lead?._id || link?.lead || '') === shareLeadId)
      : [];

   const actionIconSx = {
      color: theme.text,
      border: `1px solid ${theme.border}`,
      bgcolor: mode === 'light' ? 'rgba(124,58,237,0.06)' : theme.hover,
      '&:hover': {
         bgcolor: mode === 'light' ? 'rgba(124,58,237,0.12)' : theme.hover,
         borderColor: theme.accent,
      },
   };

   const deleteIconSx = {
      color: mode === 'light' ? '#b91c1c' : '#ffb4b4',
      border: '1px solid rgba(239,68,68,0.28)',
      bgcolor: mode === 'light' ? 'rgba(239,68,68,0.06)' : 'rgba(255,82,82,0.07)',
      '&:hover': {
         bgcolor: mode === 'light' ? 'rgba(239,68,68,0.12)' : 'rgba(255,82,82,0.12)',
      },
   };

   const iconBtn = (theme, type) => ({
      width: 32,
      height: 32,
      borderRadius: 2,
      border: `1px solid ${theme.border}`,
      color:
         type === 'telegram'
            ? '#38bdf8'
            : theme.text,
      bgcolor:
         type === 'telegram'
            ? 'rgba(56,189,248,0.12)'
            : 'rgba(255,255,255,0.04)',

      '&:hover': {
         bgcolor:
            type === 'telegram'
               ? 'rgba(56,189,248,0.22)'
               : theme.hover,
      },
   });


   const getShareKindLabel = (link) => {
      const isLanding = link.presentationType === 'landing';
      const isPartner = link.type === 'partner';
      const leadLabel = [link.leadNameSnapshot, link.leadPhoneSnapshot].filter(Boolean).join(' · ');

      const icon = isLanding
         ? '✨' // '🚀'
         : isPartner
            ? '🪲'
            : '💎';

      const defaultTitle = isLanding
         ? 'Лендінг-презентація' // 'WOW-лендінг'
         : isPartner
             ? 'Партнерська презентація'
             : 'Клієнтська презентація';

      if (!link.title && leadLabel) return `${icon} Клієнт: ${leadLabel}`;

      return `${icon} ${link.title || defaultTitle}`;
   };

   const getShareRepeatKey = (link) => {
      if (!link || link.type === 'partner') return '';

      const leadId = String(link.lead?._id || link.lead || '').trim();
      if (leadId) return `lead:${leadId}`;

      const snapshot = [link.leadNameSnapshot, link.leadPhoneSnapshot]
         .filter(Boolean)
         .join('|')
         .trim()
         .toLowerCase();

      return snapshot ? `snapshot:${snapshot}` : '';
   };

   const getShareCreatedTime = (link) => {
      const time = new Date(link?.createdAt || 0).getTime();
      return Number.isNaN(time) ? 0 : time;
   };

   const isRepeatedShareLink = (link, index, links = []) => {
      const key = getShareRepeatKey(link);
      if (!key) return false;

      const currentTime = getShareCreatedTime(link);

      return links.some((other, otherIndex) => {
         if (otherIndex === index) return false;
         if (getShareRepeatKey(other) !== key) return false;

         const otherTime = getShareCreatedTime(other);
         if (currentTime && otherTime) return currentTime > otherTime;

         return otherIndex > index;
      });
   };


   const rating = getObjectRating(item?.businessScore);
   const ratingMeta = getRatingMeta(rating);
   const operationMarker = getOperationMarker(item?.operationSummary);



   return (
      <Box
         sx={{
            borderRadius: 4,
            overflow: 'hidden',
            ...cardSx,
         }}
      >
         <Box sx={{ p: 1.15 }}>
            <Box
               sx={{
                  display: 'grid',
                  gridTemplateColumns: {
                     xs: '1fr',
                     md: '150px minmax(0, 1fr)',
                     lg: '150px minmax(0, 1fr) 210px',
                  },
                  gap: 1.15,
                  alignItems: 'center',
               }}
            >
               <Box
                  sx={{
                     height: 108,
                     borderRadius: 3,
                     overflow: 'visible',
                     border: `1px solid ${theme.border}`,
                     bgcolor: mode === 'light' ? 'rgba(0,0,0,0.04)' : 'rgba(255,255,255,0.04)',
                     position: 'relative',
                     '&:hover .tagControls': {
                        opacity: 1,
                        transform: 'translateX(-50%) translateY(0)',
                        pointerEvents: 'auto',
                     },
                  }}
               >
                  <Box
                     component="img"
                     src={image}
                     alt={item?.title || 'object'}
                     sx={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        display: 'block',
                        overflow: 'hidden',
                        borderRadius: 3,
                     }}
                     onClick={() => {
                        setPhotoIndex(0);
                        setPhotoOpen(true);
                     }}
                   />

                   <OperationPhotoMarker marker={operationMarker} />
                   <VideoPhotoBadge
                      video={mainVideo}
                      theme={theme}
                      mode={mode}
                      onOpen={openVideoGallery}
                   />

                   <Stack
                     direction="row"
                     spacing={0.45}
                     className="tagControls"
                     sx={{
                        position: 'absolute',
                        // top: 7,
                        bottom: 2,
                        left: '50%',
                        transform: 'translateX(-50%) translateY(-5px)',
                        opacity: 0,
                        pointerEvents: 'none',
                        transition: '0.18s ease',
                        zIndex: 2,
                     }}
                  >
                     <PhotoBadge
                        label="🔥"
                        title="Гарячий"
                        active={!!visualTags?.isHot}
                        color="rgba(239,68,68,0.88)"
                        onClick={() => toggleVisualTag('isHot')}
                     />

                     <PhotoBadge
                        label="❤️"
                        title="Улюблений"
                        active={!!visualTags?.isFavorite}
                        color="rgba(236,72,153,0.88)"
                        onClick={() => toggleVisualTag('isFavorite')}
                     />

                     <PhotoBadge
                        label="🪲"
                        title="Маклерський об’єкт"
                        active={!!visualTags?.isRealtorObject}
                        // color="rgba(245,158,11,0.92)"
                        color="rgba(239,68,68,0.92)"
                        onClick={() => toggleVisualTag('isRealtorObject')}
                     />
                  </Stack>


                  <Stack
                     direction="row"
                     spacing={0.45}
                     sx={{
                        position: 'absolute',
                        // top: 7,
                        // left: 7,
                        top: -11,
                        left: 10,
                        zIndex: 2,
                     }}
                  >
                     {visualTags?.isHot && <MiniPhotoMark label="🔥" />}
                     {visualTags?.isFavorite && <MiniPhotoMark label="❤️" />}
                     {visualTags?.isRealtorObject && <MiniPhotoMark label="🪲" color="rgba(239,68,68,0.92)" />}

                     {/* {financeProduct && (
                        <MiniPhotoMark
                           label={financeProduct.icon}
                           title={financeProduct.short}
                           color={financeProduct.color}
                        />
                     )} */}
                     {financeProduct && (
                        <FinanceCoin
                           title={financeProduct.short}
                           color={financeProduct.color}
                        />
                     )}
                  </Stack>
               </Box>

               <Stack spacing={0.8} minWidth={0}>
                  <Stack direction="row" spacing={0.7} flexWrap="wrap" useFlexGap>
                     <Chip
                        label={getActualityLabel(item?.actualityGroup)}
                        size="small"
                        sx={chipSuccessSx}
                     />

                     <Chip
                        label={getEstateLabel(item?.type_estate)}
                        size="small"
                        sx={chipNeutralSx}
                     />

                     <Chip
                        label={item?.type_deal || 'Угода'}
                        size="small"
                        sx={chipAccentSx}
                     />

                     {item?.isPublic && (
                        <Chip
                           label="На сайті"
                           size="small"
                           sx={chipOnlineSx}
                        />
                     )}
                  </Stack>

                  <Typography
                     sx={{
                        color: theme.text,
                        fontWeight: 950,
                        fontSize: { xs: 16, md: 18 },
                        lineHeight: 1.15,
                     }}
                     noWrap
                  >
                     {item?.title || 'Без назви'}
                  </Typography>

                  <Typography
                     sx={{
                        color: textSoft,
                        fontSize: 13,
                     }}
                     noWrap
                  >
                     {locationText}
                  </Typography>

                  <Stack direction="row" spacing={0.8} flexWrap="wrap" useFlexGap>
                     <InfoPill
                        icon={<PaidRoundedIcon sx={{ fontSize: 16 }} />}
                        label="Продаж"
                        value={item?.cost ? formatMoney(item.cost, item.currency) : '—'}
                        theme={theme}
                     />

                     <InfoPill
                        icon={<BedRoundedIcon sx={{ fontSize: 16 }} />}
                        label="Кімнат"
                        value={item?.rooms || '—'}
                        theme={theme}
                     />

                     <InfoPill
                        icon={<SquareFootRoundedIcon sx={{ fontSize: 16 }} />}
                        label="Площа"
                        value={item?.square_tot ? `${item.square_tot} м²` : '—'}
                        theme={theme}
                     />

                     <InfoPill
                        icon={<ApartmentRoundedIcon sx={{ fontSize: 16 }} />}
                        label="Поверх"
                        value={
                           item?.floor
                              ? `${item.floor}${item?.floors ? ` / ${item.floors}` : ''}`
                              : '—'
                        }
                        theme={theme}
                     />

                     {rating && (
                        <InfoPill
                           icon={<span style={{ fontSize: 16 }}>⭐</span>}
                           label="Рейтинг"
                           value={`${rating} · ${ratingMeta.label}`}
                           theme={theme}
                        />
                     )}

                     <OperationCounters
                        summary={item?.operationSummary}
                        theme={theme}
                        mode={mode}
                     />

                     {/* <InfoPill
                        icon={<PersonRoundedIcon sx={{ fontSize: 16 }} />}
                        label="Відповідальний"
                        value={assigneeName}
                        theme={theme}
                     /> */}
                  </Stack>
               </Stack>


               <Stack spacing={0.75} alignItems={{ xs: 'stretch', lg: 'flex-end' }}>
                  <InfoPill
                     icon={<PersonRoundedIcon sx={{ fontSize: 16 }} />}
                     label="Відповідальний"
                     value={assigneeName}
                     theme={theme}
                  />

                  <Stack direction="row" spacing={0.7}>
                     <Tooltip title="Посилання">
                        <IconButton onClick={() => setOpenShare(true)} sx={actionIconSx}>
                           <Badge
                              badgeContent={shareLinksCount}
                              max={99}
                              sx={{
                                 '& .MuiBadge-badge': {
                                    minWidth: 16,
                                    height: 16,
                                    px: 0.45,
                                    fontSize: 10,
                                    fontWeight: 950,
                                    color: '#0b0b12',
                                    bgcolor: '#fff',
                                    border: '1px solid rgba(11,11,18,0.18)',
                                 },
                              }}
                           >
                              <LinkRoundedIcon />
                           </Badge>
                        </IconButton>
                     </Tooltip>

                     {canManage && (
                        <Tooltip title="Редагувати">
                           <IconButton onClick={() => onEdit?.(item)} sx={actionIconSx}>
                              <EditRoundedIcon />
                           </IconButton>
                        </Tooltip>
                     )}

                     <Tooltip title={open ? 'Згорнути' : 'Детальніше'}>
                        <IconButton onClick={() => setOpen((p) => !p)} sx={actionIconSx}>
                           {open ? <ExpandLessRoundedIcon /> : <ExpandMoreRoundedIcon />}
                        </IconButton>
                     </Tooltip>

                     <Tooltip title="Історія комунікацій">
                        <IconButton
                           onClick={() => setHistoryDrawerOpen(true)}
                           sx={{
                              ...actionIconSx,
                              color: '#0b0b12',
                              background: `linear-gradient(135deg, ${theme.accent}, ${theme.accentLight})`,
                              borderColor: 'transparent',
                              '&:hover': {
                                 background: `linear-gradient(135deg, ${theme.accentLight}, ${theme.accent})`,
                              },
                           }}
                        >
                           <Badge
                              badgeContent={timelineBadgeCount}
                              max={99}
                              sx={{
                                 '& .MuiBadge-badge': {
                                    minWidth: 16,
                                    height: 16,
                                    px: 0.45,
                                    fontSize: 10,
                                    fontWeight: 950,
                                    color: '#0b0b12',
                                    bgcolor: '#fff',
                                    border: '1px solid rgba(11,11,18,0.18)',
                                 },
                              }}
                           >
                              <VisibilityRoundedIcon />
                           </Badge>
                        </IconButton>
                     </Tooltip>
                  </Stack>
               </Stack>
            </Box>
         </Box>

         <Collapse in={showAdvertisingRows} timeout="auto" unmountOnExit>
            <ObjectAdvertisingPanel
               item={item}
               theme={theme}
               mode={mode}
               actionIconSx={actionIconSx}
               open={showAdvertisingPanel}
               onToggleOpen={() => setShowAdvertisingPanel((p) => !p)}
                onAddLink={() => {
                  openCreateAdvertisingLink();
               }}
                onAddText={openCreateAdText}
                onEditText={openEditAdText}
                 onDeleteText={openDeleteAdTextDialog}
                 onEditLink={openEditAdvertisingLink}
                 onDeleteLink={handleDeleteAdvertisingLink}
                  onEditSettings={openAdvertisingSettingsDialog}
                 employees={employees}
                 canManage={canManage}
              />
         </Collapse>


         <Collapse in={open || showAdsPanel} timeout="auto" unmountOnExit>

            <Divider sx={{ borderColor: 'rgba(255,255,255,0.07)' }} />

            <Box sx={{ p: 1.35 }}>

               <Grid container spacing={1.2} alignItems="stretch">

                  <Grid item xs={12} md={3} sx={{ display: 'flex' }}>
                     <DetailBox title="Робочий стан" theme={theme} mode={mode} >
                        <DetailLine label="Група" value={getActualityLabel(item?.actualityGroup)} theme={theme} />
                        <DetailLine label="Статус роботи" value={item?.actualityStatus} theme={theme} />
                        <DetailLine label="Примітка" value={item?.actualityNote} theme={theme} />
                        <DetailLine label="Відповідальний" value={assigneeName} theme={theme} />
                        <DetailLine label="Хто вніс" value={createdByName} theme={theme} />

                        <Divider sx={{ borderColor: 'rgba(255,255,255,0.07)' }} />


                        <Box sx={{ mt: 0.6 }}>
                           <DetailLine label="Джерело" value={item?.source} theme={theme} />

                        </Box>
                     </DetailBox>
                  </Grid>

                  <Grid item xs={12} md={3} sx={{ display: 'flex' }}>
                     <DetailBox title="Основні дані" theme={theme} mode={mode}>
                        <DetailLine label="Тип об’єкта" value={getEstateLabel(item?.type_estate)} theme={theme} />
                        <DetailLine label="Тип угоди" value={item?.type_deal} theme={theme} />
                        <DetailLine label="Ціна продажу" value={formatMoney(item?.cost, item?.currency)} theme={theme} />
                        <DetailLine label="Адреса" value={locationText} theme={theme} />
                        <DetailLine label="Дата появи (огляд)" value={formatDate(item?.originAction?.occurredAt || item?.inspectedAt)} theme={theme} />
                        <DetailLine label="Створено" value={formatDate(item?.createdAt)} theme={theme} />
                     </DetailBox>
                  </Grid>

                  <Grid item xs={12} md={3} sx={{ display: 'flex' }}>
                     <DetailBox title="Характеристики" theme={theme} mode={mode}>
                        <DetailLine label="Кімнат" value={item?.rooms} theme={theme} />
                        <DetailLine label="Загальна площа" value={item?.square_tot ? `${item.square_tot} м²` : ''} theme={theme} />
                        <DetailLine label="Житлова" value={item?.square_liv ? `${item.square_liv} м²` : ''} theme={theme} />
                        <DetailLine label="Кухня" value={item?.square_kit ? `${item.square_kit} м²` : ''} theme={theme} />
                        <DetailLine label="Поверх" value={item?.floor ? `${item.floor}/${item?.floors || '—'}` : ''} theme={theme} />
                        <DetailLine label="Стіни" value={item?.type_walls} theme={theme} />
                        <DetailLine label="Будівля" value={item?.type_building} theme={theme} />
                     </DetailBox>
                  </Grid>

                  <Grid item xs={12} lg={3} sx={{ display: 'flex' }}>
                     <DetailBox title="Бізнес-оцінка" theme={theme} mode={mode}>
                        <BusinessScoreView
                           score={item?.businessScore}
                           theme={theme}
                           mode={mode}
                           strategyApprovedByName={getEmployeeName(item?.strategyApprovedBy)}
                        />
                     </DetailBox>
                  </Grid>

                   {!!item?.description && (
                      <Grid item xs={12}>
                         <DetailBox title="Опис" theme={theme} mode={mode}>
                            <Typography sx={{ color: theme?.textSoft || 'rgba(255,255,255,0.72)', lineHeight: 1.55 }}>
                               {item.description}
                            </Typography>
                         </DetailBox>
                      </Grid>
                   )}

                   <Grid item xs={12} lg={6} sx={{ display: 'flex', alignItems: 'flex-start' }}>
                      <PropertyVideosPanel
                         item={item}
                         theme={theme}
                         mode={mode}
                         canManage={canManage}
                         onAdd={openCreateVideo}
                         onOpen={openVideoGallery}
                         onEdit={openEditVideo}
                         onDelete={openDeleteVideoDialog}
                      />
                   </Grid>

                   <Grid item xs={12} lg={6} sx={{ display: 'flex', alignItems: 'flex-start' }}>
                      <PropertyGalleryPanel
                         item={item}
                         images={galleryImages}
                         theme={theme}
                         mode={mode}
                         canManage={canManage}
                         imageActionLoading={imageActionLoading}
                         photoUploadStage={photoUploadStage}
                         photoUploading={photoUploading}
                         onPhotoStageChange={setPhotoUploadStage}
                         onAddPhotoClick={() => photoUploadInputRef.current?.click()}
                         onOpen={(index) => {
                            setPhotoIndex(index);
                            setPhotoOpen(true);
                         }}
                          onImageAction={handleImageAction}
                          onImageDelete={setImageDeleteTarget}
                       />
                      <input
                         ref={photoUploadInputRef}
                         type="file"
                         accept="image/*"
                         multiple
                         hidden
                         onChange={handleUploadGalleryPhotos}
                      />
                   </Grid>
                 </Grid>
              </Box>

            {canManage && (
               <Box sx={{ display: 'flex', justifyContent: 'flex-end', px: 1.35, pb: 1.35 }}>
                  <Button
                     onClick={() => onDelete?.(item)}
                     startIcon={<DeleteOutlineRoundedIcon />}
                     sx={{
                        borderRadius: 2,
                        px: 1.6,
                        py: 0.75,
                        color: '#fb7185',
                        fontWeight: 900,
                        border: '1px solid rgba(251,113,133,0.32)',
                        bgcolor: 'rgba(127,29,29,0.08)',
                        '&:hover': {
                           bgcolor: 'rgba(127,29,29,0.16)',
                           borderColor: 'rgba(251,113,133,0.58)',
                        },
                     }}
                  >
                     Видалити об’єкт
                  </Button>
               </Box>
            )}
          </Collapse>

          <Drawer
             anchor="right"
             open={historyDrawerOpen}
             onClose={() => setHistoryDrawerOpen(false)}
             PaperProps={{
                sx: {
                   width: { xs: '100%', sm: 500 },
                   bgcolor: theme.bgPanel,
                   color: theme.text,
                   borderLeft: `1px solid ${theme.border}`,
                   background: mode === 'light'
                      ? 'linear-gradient(180deg, rgba(255,255,255,0.98), rgba(248,250,252,0.96))'
                      : 'linear-gradient(180deg, rgba(18,18,28,0.98), rgba(10,10,16,0.98))',
                },
             }}
          >
             <Stack spacing={1.4} sx={{ p: { xs: 1.35, sm: 2 }, minHeight: '100%' }}>
                <Box
                   sx={{
                      p: 1.25,
                      borderRadius: 3,
                      border: `1px solid ${theme.border}`,
                      bgcolor: mode === 'light' ? 'rgba(124,58,237,0.045)' : 'rgba(255,255,255,0.035)',
                   }}
                >
                   <Typography sx={{ fontWeight: 950, fontSize: 18, lineHeight: 1.2 }} noWrap>
                      {item?.title || 'Об’єкт'}
                   </Typography>
                   <Typography sx={{ color: theme.textSoft, fontSize: 13, mt: 0.35 }} noWrap>
                      {locationText || 'Адресу не вказано'}
                   </Typography>
                </Box>

                <ObjectWorkHistoryPanel
                   item={item}
                   theme={theme}
                   mode={mode}
                   actionIconSx={actionIconSx}
                   items={timelineItems}
                   loading={timelineLoading}
                   error={timelineError}
                   onRetry={() => loadTimeline(true)}
                   onAdd={openCreateWorkNote}
                   onEdit={openEditWorkNote}
                   onDelete={handleDeleteWorkNote}
                   onClose={() => setHistoryDrawerOpen(false)}
                   inDrawer
                />
             </Stack>
          </Drawer>


          <Dialog
             open={!!imageDeleteTarget}
             onClose={() => !imageActionLoading && setImageDeleteTarget(null)}
             fullWidth
             maxWidth="xs"
             PaperProps={{
                sx: {
                   borderRadius: 4,
                   bgcolor: theme.bgPanel,
                   color: theme.text,
                   border: `1px solid ${theme.border}`,
                   boxShadow: '0 24px 80px rgba(0,0,0,0.42)',
                },
             }}
          >
             <DialogTitle sx={{ fontWeight: 950, display: 'flex', alignItems: 'center', gap: 1 }}>
                <WarningAmberRoundedIcon sx={{ color: '#fb7185' }} />
                Видалити фото?
             </DialogTitle>
             <DialogContent>
                <Typography sx={{ color: theme.textSoft, fontWeight: 750 }}>
                   Видалиться тільки це одне фото з галереї об’єкта.
                </Typography>
             </DialogContent>
             <DialogActions sx={{ px: 3, pb: 2 }}>
                <Button onClick={() => setImageDeleteTarget(null)} disabled={!!imageActionLoading} sx={{ color: theme.textSoft, fontWeight: 900 }}>
                   Скасувати
                </Button>
                <Button
                   onClick={() => handleDeleteGalleryPhoto(imageDeleteTarget)}
                   disabled={!!imageActionLoading}
                   variant="contained"
                   startIcon={<DeleteOutlineRoundedIcon />}
                   sx={{
                      borderRadius: 999,
                      fontWeight: 950,
                      bgcolor: '#ef4444',
                      color: '#fff',
                      '&:hover': { bgcolor: '#dc2626' },
                   }}
                >
                   Видалити
                </Button>
             </DialogActions>
          </Dialog>



          <Dialog
             open={openAdvertisingSettings}
             onClose={() => setOpenAdvertisingSettings(false)}
             fullWidth
             maxWidth="sm"
             PaperProps={{
                sx: {
                   borderRadius: 4,
                   bgcolor: theme.bgPanel,
                   color: theme.text,
                   border: `1px solid ${theme.border}`,
                },
             }}
          >
             <DialogTitle sx={{ fontWeight: 950 }}>Рекламні параметри об’єкта</DialogTitle>
             <DialogContent>
                <Stack spacing={1.5} sx={{ pt: 1 }}>
                   {!!advertisingSettingsError && (
                      <Typography sx={{ color: '#fb7185', fontWeight: 850, fontSize: 13 }}>
                         {advertisingSettingsError}
                      </Typography>
                   )}

                   <TextField
                      select
                      label="Рекламщик"
                      value={advertisingSettingsForm.assignedEmployee}
                      onChange={(e) => setAdvertisingSettingsForm((prev) => ({ ...prev, assignedEmployee: e.target.value }))}
                      sx={fieldSx}
                   >
                      <MenuItem value="">Не призначено</MenuItem>
                      {employees.map((employee) => (
                         <MenuItem key={employee._id} value={employee._id}>{getEmployeeName(employee)}</MenuItem>
                      ))}
                   </TextField>

                   <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.1}>
                      <TextField select label="Статус реклами" value={advertisingSettingsForm.status} onChange={(e) => setAdvertisingSettingsForm((prev) => ({ ...prev, status: e.target.value }))} sx={{ ...fieldSx, flex: 1 }}>
                          <MenuItem value="active">Активно</MenuItem>
                          <MenuItem value="paused">Пауза</MenuItem>
                          <MenuItem value="lead_pull">Дотягуємо ліди</MenuItem>
                          <MenuItem value="done">Готово</MenuItem>
                          <MenuItem value="archive">Архів реклами</MenuItem>
                          <MenuItem value="none">Без реклами</MenuItem>
                       </TextField>
                      <TextField select label="Пріоритет" value={advertisingSettingsForm.priority} onChange={(e) => setAdvertisingSettingsForm((prev) => ({ ...prev, priority: e.target.value }))} sx={{ ...fieldSx, flex: 1 }}>
                         {AD_PRIORITY_OPTIONS.map(([value, label]) => (
                            <MenuItem key={value} value={value}>{label}</MenuItem>
                         ))}
                      </TextField>
                   </Stack>

                   <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.1}>
                      <TextField
                         label="Рекламна ціна"
                         type="number"
                         value={advertisingSettingsForm.price}
                         onChange={(e) => setAdvertisingSettingsForm((prev) => ({ ...prev, price: e.target.value }))}
                         sx={{
                            ...fieldSx,
                            flex: 1,
                            '& input[type=number]': { MozAppearance: 'textfield' },
                            '& input[type=number]::-webkit-outer-spin-button, & input[type=number]::-webkit-inner-spin-button': {
                               WebkitAppearance: 'none',
                               margin: 0,
                            },
                         }}
                      />
                      <TextField select label="Валюта" value={advertisingSettingsForm.currency} onChange={(e) => setAdvertisingSettingsForm((prev) => ({ ...prev, currency: e.target.value }))} sx={{ ...fieldSx, flex: 0.7 }}>
                         {AD_CURRENCY_OPTIONS.map(([value, label]) => (
                            <MenuItem key={value} value={value}>{label}</MenuItem>
                         ))}
                      </TextField>
                   </Stack>

                   <TextField
                      label="Чорновий текст"
                      multiline
                      minRows={3}
                      value={advertisingSettingsForm.draftText}
                      onChange={(e) => setAdvertisingSettingsForm((prev) => ({ ...prev, draftText: e.target.value }))}
                      sx={fieldSx}
                   />
                   <TextField
                      label="Завдання"
                      multiline
                      minRows={2}
                      value={advertisingSettingsForm.note}
                      onChange={(e) => setAdvertisingSettingsForm((prev) => ({ ...prev, note: e.target.value }))}
                      sx={fieldSx}
                   />
                </Stack>
             </DialogContent>
             <DialogActions sx={{ px: 3, pb: 2.5 }}>
                <Button onClick={() => setOpenAdvertisingSettings(false)} sx={{ color: theme.textSoft, fontWeight: 900 }}>Скасувати</Button>
                <Button onClick={handleSaveAdvertisingSettings} disabled={advertisingSettingsSaving || !item?._id} variant="contained" startIcon={<TuneRoundedIcon />} sx={{ borderRadius: 999, fontWeight: 950 }}>
                   {advertisingSettingsSaving ? 'Зберігаю...' : 'Зберегти'}
                </Button>
             </DialogActions>
          </Dialog>



          <Dialog
             open={openAddLink}
             onClose={closeAdvertisingLinkDialog}
            fullWidth
            maxWidth="sm"
            PaperProps={{
               sx: {
                  borderRadius: 4,
                  bgcolor: theme.bgPanel,
                  color: theme.text,
                  border: `1px solid ${theme.border}`,
               },
            }}
         >
             <DialogTitle sx={{ fontWeight: 950 }}>
                {editingAdvertisingLink ? 'Змінити рекламне посилання' : 'Додати рекламне посилання'}
             </DialogTitle>

            <DialogContent>
               <Grid container spacing={1.2} sx={{ mt: 0.2 }}>
                  <Grid item xs={12} md={4}>
                     <TextField
                        select
                        label="Тип"
                        value={adSourceType}
                        onChange={(e) => setAdSourceType(e.target.value)}
                        fullWidth
                        sx={fieldSx}
                     >
                        <MenuItem value="ours">Наша</MenuItem>
                        <MenuItem value="competitor">Конкурент</MenuItem>
                        <MenuItem value="owner">Власник</MenuItem>
                     </TextField>
                  </Grid>

                  <Grid item xs={12} md={4}>
                     <TextField
                        select
                        label="Платформа"
                        value={adPlatform}
                        onChange={(e) => setAdPlatform(e.target.value)}
                        fullWidth
                        sx={fieldSx}
                     >
                        <MenuItem value="olx">OLX</MenuItem>
                        <MenuItem value="dimria">DIM.RIA</MenuItem>
                        <MenuItem value="rieltor">RIELTOR.UA</MenuItem>
                        <MenuItem value="lun">LUN.UA</MenuItem>
                        <MenuItem value="flatfy">Flatfy.ua</MenuItem>
                        <MenuItem value="real-estate">Real-estate</MenuItem>
                        <MenuItem value="facebook">Facebook</MenuItem>
                        <MenuItem value="instagram">Instagram</MenuItem>
                        <MenuItem value="tiktok">TikTok</MenuItem>
                        <MenuItem value="telegram">Telegram</MenuItem>
                        <MenuItem value="site">Сайт</MenuItem>
                        <MenuItem value="other">Інше</MenuItem>
                     </TextField>
                  </Grid>

                   <Grid item xs={12} md={4}>
                      <TextField
                         select
                         label="Статус"
                         value={adClosedAt ? 'archived' : 'active'}
                         disabled={!editingAdvertisingLink}
                         onChange={(e) => {
                            if (e.target.value === 'active') {
                               setAdClosedAt('');
                               setAdClosedNote('');
                            } else {
                               setAdClosedAt((current) => current || getNowLocal());
                            }
                         }}
                         fullWidth
                         sx={fieldSx}
                      >
                         <MenuItem value="active">Активна</MenuItem>
                         <MenuItem value="archived">Неактивна</MenuItem>
                      </TextField>
                   </Grid>

                  <Grid item xs={12}>
                     <TextField
                        label="Посилання"
                        value={adUrl}
                        onChange={(e) => setAdUrl(e.target.value)}
                        fullWidth
                        sx={fieldSx}
                        placeholder="https://..."
                     />
                  </Grid>

                  <Grid item xs={12} md={6}>
                     <TextField
                        label="Назва посилання"
                        value={adTitleLink}
                        onChange={(e) => setAdTitleLink(e.target.value)}
                        fullWidth
                        sx={fieldSx}
                        placeholder="Наприклад: OLX основне оголошення"
                     />
                  </Grid>
                  <Grid item xs={12} md={6}>
                     <TextField
                        type="datetime-local"
                        label="Дата і час створення"
                        value={adCreatedAt}
                        onChange={(e) => setAdCreatedAt(e.target.value)}
                        fullWidth
                        sx={fieldSx}
                        InputLabelProps={{ shrink: true }}
                        helperText="Якщо пусто — буде поточний час"
                     />
                  </Grid>

                   <Grid item xs={12}>
                      <TextField
                         label="Нотатка"
                        value={adNoteLink}
                        onChange={(e) => setAdNoteLink(e.target.value)}
                        fullWidth
                        multiline
                        minRows={2}
                        sx={fieldSx}
                      />
                   </Grid>

                   {editingAdvertisingLink && (
                      <>
                         <Grid item xs={12} md={6}>
                            <TextField
                               type="datetime-local"
                               label="Дата і час закриття"
                               value={adClosedAt}
                               onChange={(e) => setAdClosedAt(e.target.value)}
                               fullWidth
                               sx={fieldSx}
                               InputLabelProps={{ shrink: true }}
                               helperText="Якщо очистити дату, посилання знову стане активним"
                            />
                         </Grid>

                         <Grid item xs={12} md={6}>
                            <TextField
                               label="Пояснення закриття"
                               value={adClosedNote}
                               onChange={(e) => setAdClosedNote(e.target.value)}
                               fullWidth
                               multiline
                               minRows={2}
                               sx={fieldSx}
                            />
                         </Grid>
                      </>
                   )}
                </Grid>
             </DialogContent>

             <DialogActions sx={{ px: 3, pb: 2 }}>
               <Button onClick={closeAdvertisingLinkDialog} sx={{ color: theme.textSoft }}>
                  Скасувати
               </Button>

               <Button
                  onClick={handleAddAdvertisingLink}
                  disabled={!adUrl.trim() || (!!adClosedAt && !adClosedNote.trim())}
                  startIcon={editingAdvertisingLink ? <EditRoundedIcon /> : <AddRoundedIcon />}
                  sx={{
                     borderRadius: 3,
                     fontWeight: 950,
                     color: '#0b0b12',
                     background: `linear-gradient(90deg, ${theme.accent}, ${theme.accentLight})`,
                  }}
               >
                  {editingAdvertisingLink ? 'Зберегти' : 'Додати'}
               </Button>
            </DialogActions>
          </Dialog>

          <VideoGalleryDialog
             open={videoGalleryOpen}
             onClose={() => setVideoGalleryOpen(false)}
             videos={propertyVideos}
             activeIndex={videoGalleryIndex}
             onSelect={setVideoGalleryIndex}
             theme={theme}
             mode={mode}
          />

          <Dialog
             open={openVideoDialog}
             onClose={closeVideoDialog}
             fullWidth
             maxWidth="sm"
             PaperProps={{
                sx: {
                   borderRadius: 4,
                   bgcolor: theme.bgPanel,
                   color: theme.text,
                   border: `1px solid ${theme.border}`,
                },
             }}
          >
             <DialogTitle sx={{ fontWeight: 950, display: 'flex', alignItems: 'center', gap: 1 }}>
                <VideoLibraryRoundedIcon sx={{ color: '#f87171' }} />
                {editingVideo ? 'Змінити відео' : 'Додати відео'}
             </DialogTitle>

             <DialogContent>
                <Grid container spacing={1.2} sx={{ mt: 0.2 }}>
                   <Grid item xs={12} md={4}>
                      <TextField
                         select
                         label="Платформа"
                         value={videoPlatform}
                         onChange={(e) => setVideoPlatform(e.target.value)}
                         fullWidth
                         sx={fieldSx}
                      >
                         <MenuItem value="youtube">YouTube</MenuItem>
                         <MenuItem value="tiktok">TikTok</MenuItem>
                         <MenuItem value="instagram">Instagram</MenuItem>
                         <MenuItem value="facebook">Facebook</MenuItem>
                         <MenuItem value="telegram">Telegram</MenuItem>
                         <MenuItem value="drive">Drive</MenuItem>
                         <MenuItem value="other">Інше</MenuItem>
                      </TextField>
                   </Grid>

                   <Grid item xs={12} md={4}>
                      <TextField
                         select
                         label="Тип відео"
                         value={videoType}
                         onChange={(e) => setVideoType(e.target.value)}
                         fullWidth
                         sx={fieldSx}
                      >
                         <MenuItem value="main">Основне</MenuItem>
                         <MenuItem value="short_review">Короткий огляд</MenuItem>
                         <MenuItem value="storytelling">Сторітелінг</MenuItem>
                         <MenuItem value="full_review">Повний огляд</MenuItem>
                         <MenuItem value="other">Інше</MenuItem>
                      </TextField>
                   </Grid>

                   <Grid item xs={12} md={4}>
                      <TextField
                         select
                         label="Показувати на фото"
                         value={videoIsMain}
                         onChange={(e) => setVideoIsMain(e.target.value)}
                         fullWidth
                         sx={fieldSx}
                      >
                         <MenuItem value="yes">Так, головне</MenuItem>
                         <MenuItem value="no">Ні</MenuItem>
                      </TextField>
                   </Grid>

                   <Grid item xs={12}>
                      <TextField
                         label="Посилання на відео"
                         value={videoUrl}
                         onChange={(e) => setVideoUrl(e.target.value)}
                         fullWidth
                         sx={fieldSx}
                         placeholder="https://youtube.com/..."
                      />
                   </Grid>

                   <Grid item xs={12} md={6}>
                      <TextField
                         label="Назва"
                         value={videoTitle}
                         onChange={(e) => setVideoTitle(e.target.value)}
                         fullWidth
                         sx={fieldSx}
                         placeholder="Наприклад: Огляд квартири"
                      />
                   </Grid>

                   <Grid item xs={12} md={6}>
                      <TextField
                         type="datetime-local"
                         label="Дата додавання"
                         value={videoCreatedAt}
                         onChange={(e) => setVideoCreatedAt(e.target.value)}
                         fullWidth
                         sx={fieldSx}
                         InputLabelProps={{ shrink: true }}
                      />
                   </Grid>

                   <Grid item xs={12}>
                      <TextField
                         label="Нотатка"
                         value={videoNote}
                         onChange={(e) => setVideoNote(e.target.value)}
                         fullWidth
                         multiline
                         minRows={2}
                         sx={fieldSx}
                      />
                   </Grid>
                </Grid>
             </DialogContent>

             <DialogActions sx={{ px: 3, pb: 2 }}>
                <Button onClick={closeVideoDialog} sx={{ color: theme.textSoft }}>
                   Скасувати
                </Button>

                <Button
                   onClick={handleSaveVideo}
                   disabled={!videoUrl.trim()}
                   startIcon={editingVideo ? <EditRoundedIcon /> : <AddRoundedIcon />}
                   sx={{
                      borderRadius: 3,
                      fontWeight: 950,
                      color: '#0b0b12',
                      background: `linear-gradient(90deg, ${theme.accent}, ${theme.accentLight})`,
                   }}
                >
                   {editingVideo ? 'Зберегти' : 'Додати'}
                </Button>
             </DialogActions>
          </Dialog>

          <Dialog
             open={openAdText}
             onClose={closeAdTextDialog}
            fullWidth
            maxWidth="md"
            PaperProps={{
               sx: {
                  borderRadius: 4,
                  bgcolor: theme.bgPanel,
                  color: theme.text,
                  border: `1px solid ${theme.border}`,
               },
            }}
         >
             <DialogTitle sx={{ fontWeight: 950 }}>
                {editingAdText ? 'Змінити рекламний текст' : 'Додати рекламний текст'}
             </DialogTitle>

            <DialogContent>
               <Grid container spacing={1.2} sx={{ mt: 0.2 }}>

                  <Grid item xs={12} md={6}>
                     <TextField
                        select
                        label="AI варіант"
                        value={aiStyle}
                        onChange={(e) => setAiStyle(e.target.value)}
                        fullWidth
                        sx={fieldSx}
                     >
                        <MenuItem value="telegram">Telegram короткий</MenuItem>
                        <MenuItem value="short">Короткий</MenuItem>
                        <MenuItem value="selling">Продаючий</MenuItem>
                        <MenuItem value="investor">Для інвестора</MenuItem>
                        <MenuItem value="family">Для сім’ї</MenuItem>
                     </TextField>
                  </Grid>

                  <Grid item xs={12} md={6}>
                     <Button
                        onClick={handleGenerateAIText}
                        disabled={aiLoading}
                        fullWidth
                        sx={{
                           height: '100%',
                           minHeight: 54,
                           borderRadius: 3,
                           fontWeight: 950,
                           color: '#0b0b12',
                           background: `linear-gradient(90deg, ${theme.accent}, ${theme.accentLight})`,
                        }}
                     >
                        {aiLoading ? 'Генерує...' : 'Згенерувати AI'}
                     </Button>
                  </Grid>


                  <Grid item xs={12}>
                     <TextField
                        label="Назва"
                        value={adTitle}
                        onChange={(e) => setAdTitle(e.target.value)}
                        fullWidth
                        sx={fieldSx}
                        placeholder="Наприклад: OLX варіант 1"
                     />
                  </Grid>

                  <Grid item xs={12}>
                     <TextField
                        label="Текст реклами"
                        value={adText}
                        onChange={(e) => setAdText(e.target.value)}
                        fullWidth
                        multiline
                        minRows={7}
                        sx={fieldSx}
                     />
                  </Grid>

                  <Grid item xs={12}>
                     <TextField
                        label="Нотатка / як спрацював"
                        value={adNote}
                        onChange={(e) => setAdNote(e.target.value)}
                        fullWidth
                        multiline
                        minRows={2}
                        sx={fieldSx}
                     />
                  </Grid>
               </Grid>
            </DialogContent>

            <DialogActions sx={{ px: 3, pb: 2 }}>
               <Button
                  onClick={() => navigator.clipboard.writeText(adText || '')}
                  disabled={!adText.trim()}
                  sx={{ color: theme.accentLight, fontWeight: 900 }}
               >
                  Копіювати
               </Button>

               <Button onClick={closeAdTextDialog} sx={{ color: theme.textSoft }}>
                  Скасувати
               </Button>

               <Button
                  onClick={handleAddAdText}
                  disabled={!adText.trim()}
                  startIcon={editingAdText ? <EditRoundedIcon /> : <AddRoundedIcon />}
                  sx={{
                     borderRadius: 3,
                     fontWeight: 950,
                     color: '#0b0b12',
                     background: `linear-gradient(90deg, ${theme.accent}, ${theme.accentLight})`,
                  }}
               >
                  {editingAdText ? 'Змінити текст' : 'Додати текст'}
               </Button>
            </DialogActions>
          </Dialog>

          <Dialog
             open={videoDeleteOpen}
             onClose={() => {
                if (videoDeleting) return;
                setVideoDeleteOpen(false);
                setSelectedVideo(null);
             }}
             fullWidth
             maxWidth="xs"
             PaperProps={{
                sx: {
                   borderRadius: 4,
                   bgcolor: theme.bgPanel,
                   color: theme.text,
                   border: '1px solid rgba(248,113,113,0.28)',
                },
             }}
          >
             <DialogTitle sx={{ fontWeight: 950, display: 'flex', alignItems: 'center', gap: 1 }}>
                <WarningAmberRoundedIcon sx={{ color: '#f87171' }} />
                Видалити відео?
             </DialogTitle>

             <DialogContent>
                <Typography sx={{ color: theme.textSoft, fontSize: 14, lineHeight: 1.7 }}>
                   Посилання на відео буде прибрано з картки об’єкта.
                </Typography>
                {!!selectedVideo?.title && (
                   <Typography sx={{ color: theme.text, fontWeight: 900, mt: 1.2 }}>
                      {selectedVideo.title}
                   </Typography>
                )}
             </DialogContent>

             <DialogActions sx={{ px: 3, pb: 2 }}>
                <Button
                   disabled={videoDeleting}
                   onClick={() => {
                      setVideoDeleteOpen(false);
                      setSelectedVideo(null);
                   }}
                   sx={{ color: theme.textSoft }}
                >
                   Скасувати
                </Button>

                <Button
                   disabled={videoDeleting}
                   onClick={confirmDeleteVideo}
                   startIcon={<DeleteRoundedIcon />}
                   sx={{
                      borderRadius: 999,
                      px: 2.4,
                      fontWeight: 950,
                      color: '#fff',
                      bgcolor: '#ef4444',
                      '&:hover': {
                         bgcolor: '#dc2626',
                      },
                   }}
                >
                   Видалити
                </Button>
             </DialogActions>
          </Dialog>

          <Dialog
             open={adTextDeleteOpen}
             onClose={() => {
                if (adTextDeleting) return;
                setAdTextDeleteOpen(false);
                setSelectedAdText(null);
             }}
             fullWidth
             maxWidth="xs"
             PaperProps={{
                sx: {
                   borderRadius: 4,
                   bgcolor: theme.bgPanel,
                   color: theme.text,
                   border: '1px solid rgba(248,113,113,0.28)',
                },
             }}
          >
             <DialogTitle sx={{ fontWeight: 950, display: 'flex', alignItems: 'center', gap: 1 }}>
                <WarningAmberRoundedIcon sx={{ color: '#f87171' }} />
                Видалити рекламний текст?
             </DialogTitle>

             <DialogContent>
                <Typography sx={{ color: theme.textSoft, fontSize: 14, lineHeight: 1.7 }}>
                   Текст буде прибрано з рекламного блоку об’єкта. Якщо він ще потрібен для роботи, краще спершу скопіювати його.
                </Typography>

                {!!selectedAdText?.text && (
                   <Box
                      sx={{
                         mt: 2,
                         p: 1.4,
                         borderRadius: 3,
                         bgcolor: 'rgba(248,113,113,0.08)',
                         border: '1px solid rgba(248,113,113,0.18)',
                      }}
                   >
                      <Typography
                         sx={{
                            color: theme.text,
                            fontWeight: 850,
                            fontSize: 13,
                            lineHeight: 1.45,
                            display: '-webkit-box',
                            WebkitLineClamp: 4,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                         }}
                      >
                         {selectedAdText.text}
                      </Typography>
                   </Box>
                )}
             </DialogContent>

             <DialogActions sx={{ px: 3, pb: 2 }}>
                <Button
                   disabled={adTextDeleting}
                   onClick={() => {
                      setAdTextDeleteOpen(false);
                      setSelectedAdText(null);
                   }}
                   sx={{ color: theme.textSoft }}
                >
                   Скасувати
                </Button>

                <Button
                   disabled={adTextDeleting}
                   onClick={confirmDeleteAdText}
                   startIcon={<DeleteRoundedIcon />}
                   sx={{
                      borderRadius: 999,
                      px: 2.4,
                      fontWeight: 950,
                      color: '#fff',
                      bgcolor: '#ef4444',
                      '&:hover': {
                         bgcolor: '#dc2626',
                      },
                   }}
                >
                   Видалити
                </Button>
             </DialogActions>
          </Dialog>

          <Dialog
             open={openWorkNote}
             onClose={closeWorkNoteDialog}
            fullWidth
            maxWidth="sm"
            PaperProps={{
               sx: {
                  borderRadius: 4,
                  bgcolor: theme.bgPanel,
                  color: theme.text,
                  border: `1px solid ${theme.border}`,
               },
            }}
         >
            <DialogTitle sx={{ fontWeight: 950 }}>
               {editingWorkNote ? 'Редагувати запис в історії' : 'Додати запис в історію'}
            </DialogTitle>

            <DialogContent>
               {editingWorkNote && (
                  <Typography sx={{ color: theme.accentLight, fontSize: 12, fontWeight: 900, mb: 1 }}>
                     Режим редагування запису
                  </Typography>
               )}

               <Grid container spacing={1.2} sx={{ mt: 0.2 }}>
                  <Grid item xs={12} md={6}>
                     <TextField
                        select
                        label="Тип дії"
                        value={noteType}
                        onChange={(e) => setNoteType(e.target.value)}
                        fullWidth
                        sx={fieldSx}
                     >
                        <MenuItem value="note">Нотатка</MenuItem>
                        <MenuItem value="call">Дзвінок</MenuItem>
                        <MenuItem value="message">Переписка</MenuItem>
                        <MenuItem value="meeting">Зустріч</MenuItem>
                     </TextField>
                  </Grid>

                  <Grid item xs={12} md={6}>
                     <TextField
                        select
                        label="Вид нотатки"
                        value={noteTone}
                        onChange={(e) => setNoteTone(e.target.value)}
                        fullWidth
                        sx={fieldSx}
                     >
                        <MenuItem value="positive">Позитивна</MenuItem>
                        <MenuItem value="negative">Негативна</MenuItem>
                        <MenuItem value="info">Інформуюча</MenuItem>
                        <MenuItem value="important">Важлива</MenuItem>
                     </TextField>
                  </Grid>

                  <Grid item xs={12} md={6}>
                     <TextField
                        label="Час події"
                        type="datetime-local"
                        value={noteCreatedAt}
                        onChange={(e) => setNoteCreatedAt(e.target.value)}
                        fullWidth
                        sx={fieldSx}
                        InputLabelProps={{ shrink: true }}
                     />
                  </Grid>

                  <Grid item xs={12}>
                     <TextField
                        label="Текст запису"
                        value={noteText}
                        onChange={(e) => setNoteText(e.target.value)}
                        fullWidth
                        multiline
                        minRows={5}
                        sx={fieldSx}
                        placeholder="Наприклад: власник погодив показ на завтра, але просить не скидати ціну..."
                     />
                  </Grid>
               </Grid>
            </DialogContent>

            <DialogActions sx={{ px: 3, pb: 2 }}>
               <Button onClick={closeWorkNoteDialog} sx={{ color: theme.textSoft }}>
                  Скасувати
               </Button>

               <Button
                  onClick={handleAddNote}
                  disabled={!noteText.trim()}
                  startIcon={<AddRoundedIcon />}
                  sx={{
                     borderRadius: 3,
                     fontWeight: 950,
                     color: '#0b0b12',
                     background: `linear-gradient(90deg, ${theme.accent}, ${theme.accentLight})`,
                  }}
               >
                  {editingWorkNote ? 'Змінити' : 'Додати'}
               </Button>
            </DialogActions>
         </Dialog>




         <Dialog
            open={openShare}
            onClose={() => setOpenShare(false)}
            fullWidth
            maxWidth="sm"
            PaperProps={{
               sx: {
                  borderRadius: 4,
                  bgcolor: theme.bgPanel,
                  color: theme.text,
                  border: `1px solid ${theme.border}`,
               },
            }}
         >
            <DialogTitle
               sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 1,
                  fontWeight: 950,
               }}
            >
               <Box component="span">Поділитися об’єктом</Box>
               <Chip
                  size="small"
                  label={`Посилань: ${shareLinksCount}`}
                  sx={{
                     height: 24,
                     fontSize: 11,
                     fontWeight: 950,
                     color: mode === 'light' ? '#5b21b6' : '#ddd6fe',
                     bgcolor: mode === 'light' ? 'rgba(124,58,237,0.10)' : 'rgba(167,139,250,0.14)',
                     border: mode === 'light'
                        ? '1px solid rgba(124,58,237,0.20)'
                        : '1px solid rgba(196,181,253,0.24)',
                  }}
               />
            </DialogTitle>

            <DialogContent>
               <Stack spacing={1.2} sx={{ mt: 1 }}>
                  <TextField
                     fullWidth
                     size="small"
                     value={shareTitleDraft}
                     onChange={(e) => setShareTitleDraft(e.target.value)}
                     placeholder="Назва для посилання: Для клієнтки Ольги"
                     sx={{
                        '& .MuiOutlinedInput-root': {
                           borderRadius: 3,
                           color: theme.text,
                           bgcolor:
                              mode === 'light'
                                 ? 'rgba(124,58,237,0.04)'
                                 : 'rgba(255,255,255,0.04)',
                           '& fieldset': {
                              borderColor: theme.border,
                           },
                           '&:hover fieldset': {
                              borderColor: theme.accent,
                           },
                           '&.Mui-focused fieldset': {
                              borderColor: theme.accent,
                           },
                        },
                        '& input::placeholder': {
                           color: theme.textSoft,
                           opacity: 1,
                        },
                      }}
                   />

                   <Autocomplete
                      value={shareLead}
                      inputValue={shareLeadQuery}
                      onChange={(_event, value) => {
                         setShareLead(value);
                         setShareLeadQuery(value?.name || '');
                      }}
                      onInputChange={(_event, value, reason) => {
                         if (reason !== 'reset') setShareLeadQuery(value);
                      }}
                      options={shareLeadOptions}
                      loading={shareLeadLoading}
                      getOptionLabel={(option) => {
                         if (!option) return '';
                         const phone = Array.isArray(option.phones) ? option.phones[0] : '';
                         return [option.name, phone].filter(Boolean).join(' · ');
                      }}
                      isOptionEqualToValue={(option, value) => option?._id === value?._id}
                      noOptionsText={shareLeadQuery.trim().length < 2 ? 'Введіть мінімум 2 символи' : 'Ліда не знайдено'}
                      renderInput={(params) => (
                         <TextField
                            {...params}
                            size="small"
                            label="Лід / клієнт для посилання"
                            placeholder="Почніть вводити ім’я або телефон"
                            sx={fieldSx}
                         />
                      )}
                   />

                   {!!repeatedLeadLinks.length && (
                      <Box
                         sx={{
                            px: 1,
                            py: 0.75,
                            borderRadius: 3,
                            border: '1px solid rgba(245,158,11,0.30)',
                            bgcolor: mode === 'light' ? 'rgba(245,158,11,0.08)' : 'rgba(245,158,11,0.12)',
                            color: mode === 'light' ? '#92400e' : '#fde68a',
                         }}
                      >
                         <Typography sx={{ fontSize: 13, fontWeight: 950 }}>
                            Цьому ліду вже створювали посилання на цей об’єкт: {repeatedLeadLinks.length}
                         </Typography>
                         <Typography sx={{ fontSize: 12, opacity: 0.82 }}>
                            Можна створити ще одне посилання, але команда бачитиме повтор у списку.
                         </Typography>
                      </Box>
                   )}

                  {/* <Typography sx={{ color: theme.textSoft, fontSize: 11, mt: -0.4 }}>
                     Можна залишити порожнім — тоді буде стандартна назва.
                  </Typography> */}
                  <Button
                     disabled={shareLoading}
                     onClick={() => handleCreateShareLink('client', 'classic')}
                     startIcon={<Box component="span" sx={{ fontSize: 18, lineHeight: 1 }}>💎</Box>}
                     sx={{
                        borderRadius: 3,
                        fontWeight: 950,
                        color: '#0b0b12',
                        background: `linear-gradient(90deg, ${theme.accent}, ${theme.accentLight})`,
                        boxShadow: `0 10px 24px ${theme.glow}`,
                        '&:hover': {
                           filter: 'brightness(1.08)',
                           boxShadow: `0 14px 30px ${theme.glow}`,
                        },
                     }}
                  >
                     Створити клієнтську презентацію
                  </Button>

                  <Button
                     disabled={shareLoading}
                     onClick={() => handleCreateShareLink('client', 'landing')}
                     startIcon={<Box component="span" sx={{ fontSize: 18, lineHeight: 1 }}>✨</Box>}
                     sx={{
                        borderRadius: 3,
                        fontWeight: 950,
                        color: theme.text,
                        border: `1px solid ${mode === 'light' ? 'rgba(124,58,237,0.28)' : 'rgba(196,181,253,0.28)'}`,
                        background: mode === 'light'
                           ? 'linear-gradient(90deg, rgba(124,58,237,0.08), rgba(14,165,233,0.06))'
                           : 'linear-gradient(90deg, rgba(139,92,246,0.16), rgba(14,165,233,0.10))',
                        '&:hover': {
                           borderColor: mode === 'light' ? 'rgba(124,58,237,0.48)' : 'rgba(196,181,253,0.46)',
                           background: mode === 'light'
                              ? 'linear-gradient(90deg, rgba(124,58,237,0.14), rgba(14,165,233,0.10))'
                              : 'linear-gradient(90deg, rgba(139,92,246,0.24), rgba(14,165,233,0.16))',
                           boxShadow: `0 10px 24px ${theme.glow}`,
                        },
                     }}
                  >
                     Створити клієнтський лендінг
                  </Button>

                  <Button
                     disabled={shareLoading}
                     onClick={() => handleCreateShareLink('partner', 'classic')}
                     startIcon={<Box component="span" sx={{ fontSize: 18, lineHeight: 1 }}>🪲</Box>}
                     sx={{
                        borderRadius: 3,
                        fontWeight: 950,
                        color: mode === 'light' ? '#991b1b' : '#fecaca',
                        border: '1px solid rgba(239,68,68,0.30)',
                        bgcolor: mode === 'light'
                           ? 'rgba(239,68,68,0.06)'
                           : 'rgba(239,68,68,0.10)',
                        '&:hover': {
                           borderColor: 'rgba(239,68,68,0.48)',
                           bgcolor: mode === 'light'
                              ? 'rgba(239,68,68,0.11)'
                              : 'rgba(239,68,68,0.16)',
                        },
                     }}
                  >
                     Створити нейтральну презентацію для партнера
                  </Button>

                  <Divider sx={{ borderColor: theme.border }} />

                  {shareLinks.map((link, linkIndex) => {
                     const isRepeated = isRepeatedShareLink(link, linkIndex, shareLinks);

                     return (

                     <Box
                        key={link._id || link.slug}
                        sx={{
                           p: 1,
                           borderRadius: 3,
                           border: `1px solid ${theme.border}`,
                           bgcolor:
                              mode === 'light'
                                 ? 'rgba(124,58,237,0.035)'
                                 : 'rgba(255,255,255,0.025)',
                           display: 'flex',
                           justifyContent: 'space-between',
                           alignItems: 'center',
                           gap: 1,
                        }}
                     >
                        {/* ЛІВА ЧАСТИНА */}
                         <Box sx={{ minWidth: 0, flex: 1, py: 0.1 }}>
                           {/* <Typography sx={{ fontWeight: 950 }}>
                              {link.type === 'partner' ? 'Партнерська' : 'Клієнтська'} презентація
                           </Typography>  */}
                           {/* <Typography sx={{ fontWeight: 950 }}>
                              {link.presentationType === 'landing'
                                 ? 'Лендінг'
                                 : link.type === 'partner'
                                    ? 'Партнерська'
                                    : 'Клієнтська'} презентація
                           </Typography> */}
                            <Typography
                               sx={{
                                  fontWeight: 950,
                                  fontSize: { xs: 14, sm: 15 },
                                  lineHeight: 1.12,
                                  mb: 0.15,
                               }}
                             >
                                {getShareKindLabel(link)}
                             </Typography>

                             {isRepeated && (
                                <Typography
                                   sx={{
                                      mt: -0.05,
                                      mb: 0.2,
                                      fontSize: 10.5,
                                      lineHeight: 1.15,
                                      color: mode === 'light' ? '#dc2626' : '#fca5a5',
                                      fontWeight: 950,
                                   }}
                                >
                                   повторна презентація
                                </Typography>
                             )}

                             <Typography sx={{ fontSize: 10, lineHeight: 1.15, color: theme.textSoft }}>
                               👁 {link.viewsCount} · {formatDateTime(link.lastViewedAt)}
                            </Typography>

                            {!!link.title && (link.leadNameSnapshot || link.leadPhoneSnapshot) && (
                               <Typography sx={{ fontSize: 11, lineHeight: 1.18, color: theme.accentLight, fontWeight: 900 }}>
                                  Клієнт: {[link.leadNameSnapshot, link.leadPhoneSnapshot].filter(Boolean).join(' · ')}
                               </Typography>
                            )}

                            {!!link.reactions?.length && (
                               <Stack direction="row" spacing={0.45} flexWrap="wrap" useFlexGap sx={{ mt: 0.45 }}>
                                  {getShareReactionGroups(link.reactions).map((group) => (
                                     <Tooltip
                                        key={group.type}
                                        title={
                                           <Box>
                                              <Typography sx={{ fontSize: 12, fontWeight: 900, mb: 0.4 }}>
                                                 {group.icon} {group.label}: {group.count}
                                              </Typography>
                                              {group.items.map((r, idx) => (
                                                 <Typography key={idx} sx={{ fontSize: 12 }}>
                                                    {r.label || group.label} — {formatDateTime(r.createdAt)}
                                                 </Typography>
                                              ))}
                                           </Box>
                                        }
                                     >
                                        <Chip
                                           size="small"
                                           label={`${group.icon} ${group.count}`}
                                           sx={{
                                              height: 22,
                                              fontSize: 11,
                                              fontWeight: 950,
                                              color: mode === 'light' ? '#334155' : '#e5e7eb',
                                              bgcolor: mode === 'light' ? 'rgba(15,23,42,0.06)' : 'rgba(255,255,255,0.08)',
                                              border: `1px solid ${theme.border}`,
                                           }}
                                        />
                                     </Tooltip>
                                  ))}
                               </Stack>
                           )}

                            <Typography sx={{ fontSize: 11, lineHeight: 1.18, color: theme.textSoft }}>
                               {/* {getEmployeeName(item.createdByEmployee)} */}
                               {getEmployeeName(link.createdByEmployee)}
                            </Typography>
                         </Box>

                        {/* ПРАВА ЧАСТИНА — ІКОНКИ */}
                         <Stack direction="row" spacing={0.3} sx={{ alignSelf: 'center', flexShrink: 0 }}>
                           <Tooltip title="Скопіювати лінк">

                              <IconButton
                                 onClick={() => handleCopyShare(link)}
                                 sx={iconBtn(theme)}
                              >
                                 <ContentCopyRoundedIcon fontSize="small" />
                              </IconButton>
                           </Tooltip>

                           <Tooltip title="Відкрити">
                              <IconButton
                                 component="a"
                                 href={getShareUrl(link)}
                                 target="_blank"
                                 sx={iconBtn(theme)}
                              >
                                 <OpenInNewRoundedIcon fontSize="small" />
                              </IconButton>
                           </Tooltip>

                           <Tooltip title="Скопіювати текст для повідомлення">
                              <IconButton
                                 onClick={() => {
                                    const text = buildShareMessage(item, link);
                                    navigator.clipboard.writeText(text);
                                 }}
                                 sx={iconBtn(theme)}
                              >
                                 <TextSnippetRoundedIcon fontSize="small" />
                              </IconButton>
                           </Tooltip>

                           <Tooltip title="Поділитися в Telegram">
                              <IconButton
                                 component="a"
                                 href={`https://t.me/share/url?url=${encodeURIComponent(getShareUrl(link))}&text=${encodeURIComponent(buildShareMessage(item, link))}`}
                                 target="_blank"
                                 sx={iconBtn(theme, 'telegram')}
                              >
                                 <TelegramIcon fontSize="small" />
                              </IconButton>
                           </Tooltip>
                           {/* <Tooltip title="Перейменувати">
                              <IconButton
                                 onClick={() => handleRenameShare(link)}
                                 sx={iconBtn(theme)}
                              >
                                 <EditRoundedIcon fontSize="small" />
                              </IconButton>
                           </Tooltip> */}

                           <Tooltip title="Видалити">
                              <IconButton
                                 onClick={() => openDeleteShareDialog(link)}
                                 sx={{
                                    ...iconBtn(theme),
                                    color: '#f87171',
                                    '&:hover': {
                                       bgcolor: 'rgba(248,113,113,0.14)',
                                    },
                                 }}
                              >
                                 <DeleteRoundedIcon fontSize="small" />
                              </IconButton>
                           </Tooltip>
                        </Stack>
                     </Box>
                     );
                  })}

                  {!item?.shareLinks?.length && (
                     <Typography sx={{ color: theme.textSoft, fontSize: 13 }}>
                        Посилань ще немає
                     </Typography>
                  )}
               </Stack>
            </DialogContent>

            <DialogActions sx={{ px: 3, pb: 2 }}>
               <Button onClick={() => setOpenShare(false)} sx={{ color: theme.textSoft }}>
                  Закрити
               </Button>
            </DialogActions>
         </Dialog>



         <Dialog
            open={workNoteDeleteOpen}
            onClose={() => {
               if (workNoteDeleting) return;
               setWorkNoteDeleteOpen(false);
               setSelectedWorkNote(null);
            }}
            fullWidth
            maxWidth="xs"
            PaperProps={{
               sx: {
                  borderRadius: 4,
                  bgcolor: theme.bgPanel,
                  color: theme.text,
                  border: '1px solid rgba(248,113,113,0.28)',
               },
            }}
         >
            <DialogTitle sx={{ fontWeight: 950, display: 'flex', alignItems: 'center', gap: 1 }}>
               <WarningAmberRoundedIcon sx={{ color: '#f87171' }} />
               Видалити запис?
            </DialogTitle>

            <DialogContent>
               <Typography sx={{ color: theme.textSoft, fontSize: 14, lineHeight: 1.7 }}>
                  Запис буде прибрано з історії роботи об'єкта, а дія відобразиться на сторінці активності.
               </Typography>

               {!!selectedWorkNote?.text && (
                  <Box
                     sx={{
                        mt: 2,
                        p: 1.4,
                        borderRadius: 3,
                        bgcolor: 'rgba(248,113,113,0.08)',
                        border: '1px solid rgba(248,113,113,0.18)',
                     }}
                  >
                     <Typography
                        sx={{
                           color: theme.text,
                           fontWeight: 850,
                           fontSize: 13,
                           lineHeight: 1.45,
                           display: '-webkit-box',
                           WebkitLineClamp: 3,
                           WebkitBoxOrient: 'vertical',
                           overflow: 'hidden',
                        }}
                     >
                        {selectedWorkNote.text}
                     </Typography>
                  </Box>
               )}
            </DialogContent>

            <DialogActions sx={{ px: 3, pb: 2 }}>
               <Button
                  disabled={workNoteDeleting}
                  onClick={() => {
                     setWorkNoteDeleteOpen(false);
                     setSelectedWorkNote(null);
                  }}
                  sx={{ color: theme.textSoft }}
               >
                  Скасувати
               </Button>

               <Button
                  disabled={workNoteDeleting}
                  onClick={confirmDeleteWorkNote}
                  startIcon={<DeleteRoundedIcon />}
                  sx={{
                     borderRadius: 999,
                     px: 2.4,
                     fontWeight: 950,
                     color: '#fff',
                     bgcolor: '#ef4444',
                     '&:hover': {
                        bgcolor: '#dc2626',
                     },
                  }}
               >
                  Видалити
               </Button>
            </DialogActions>
         </Dialog>



         <Dialog
            open={deleteDialogOpen}
            onClose={() => setDeleteDialogOpen(false)}
            fullWidth
            maxWidth="xs"
            PaperProps={{
               sx: {
                  borderRadius: 4,
                  bgcolor: theme.bgPanel,
                  color: theme.text,
                  border: '1px solid rgba(248,113,113,0.28)',
               },
            }}
         >
            <DialogTitle sx={{ fontWeight: 950, display: 'flex', alignItems: 'center', gap: 1 }}>
               <WarningAmberRoundedIcon sx={{ color: '#f87171' }} />
               Видалити посилання?
            </DialogTitle>

            <DialogContent>
               <Typography sx={{ color: theme.textSoft, fontSize: 14, lineHeight: 1.7 }}>
                  Це посилання більше не відкриватиметься у клієнта або партнера.
               </Typography>

               {!!selectedShareLink && (
                  <Box
                     sx={{
                        mt: 2,
                        p: 1.4,
                        borderRadius: 3,
                        bgcolor: 'rgba(248,113,113,0.08)',
                        border: '1px solid rgba(248,113,113,0.18)',
                     }}
                  >
                     <Typography sx={{ fontWeight: 950 }}>
                        {getShareKindLabel(selectedShareLink)}
                     </Typography>
                  </Box>
               )}
            </DialogContent>

            <DialogActions sx={{ px: 3, pb: 2 }}>
               <Button
                  onClick={() => setDeleteDialogOpen(false)}
                  sx={{ color: theme.textSoft }}
               >
                  Скасувати
               </Button>

               <Button
                  disabled={shareActionLoading}
                  onClick={handleDeleteShare}
                  startIcon={<DeleteRoundedIcon />}
                  sx={{
                     borderRadius: 999,
                     px: 2.4,
                     fontWeight: 950,
                     color: '#fff',
                     bgcolor: '#ef4444',
                     '&:hover': {
                        bgcolor: '#dc2626',
                     },
                  }}
               >
                  Видалити
               </Button>
            </DialogActions>
          </Dialog>


         <Dialog
            open={!!advertisingLinkDeleteTarget}
            onClose={() => {
               if (!advertisingLinkDeleting) setAdvertisingLinkDeleteTarget(null);
            }}
            fullWidth
            maxWidth="xs"
            PaperProps={{
               sx: {
                  borderRadius: 4,
                  bgcolor: theme.bgPanel,
                  color: theme.text,
                  border: '1px solid rgba(248,113,113,0.28)',
               },
            }}
         >
            <DialogTitle sx={{ fontWeight: 950, display: 'flex', alignItems: 'center', gap: 1 }}>
               <WarningAmberRoundedIcon sx={{ color: '#f87171' }} />
               Видалити рекламне посилання?
            </DialogTitle>

            <DialogContent>
               <Typography sx={{ color: theme.textSoft, fontSize: 14, lineHeight: 1.7 }}>
                  Посилання зникне з картки об’єкта. Пов’язані рекламні дії по ньому теж будуть видалені.
               </Typography>

               {!!advertisingLinkDeleteTarget && (
                  <Box
                     sx={{
                        mt: 2,
                        p: 1.4,
                        borderRadius: 3,
                        bgcolor: 'rgba(248,113,113,0.08)',
                        border: '1px solid rgba(248,113,113,0.18)',
                     }}
                  >
                     <Typography sx={{ fontWeight: 950 }}>
                        {advertisingLinkDeleteTarget.title || advertisingLinkDeleteTarget.workTitle || advertisingLinkDeleteTarget.url || 'Рекламне посилання'}
                     </Typography>
                     {!!advertisingLinkDeleteTarget.note && (
                        <Typography sx={{ color: theme.textSoft, fontSize: 12, mt: 0.4 }}>
                           {advertisingLinkDeleteTarget.note}
                        </Typography>
                     )}
                  </Box>
               )}
            </DialogContent>

            <DialogActions sx={{ px: 3, pb: 2 }}>
               <Button
                  disabled={advertisingLinkDeleting}
                  onClick={() => setAdvertisingLinkDeleteTarget(null)}
                  sx={{ color: theme.textSoft }}
               >
                  Скасувати
               </Button>

               <Button
                  disabled={advertisingLinkDeleting}
                  onClick={confirmDeleteAdvertisingLink}
                  startIcon={<DeleteRoundedIcon />}
                  sx={{
                     borderRadius: 999,
                     px: 2.4,
                     fontWeight: 950,
                     color: '#fff',
                     bgcolor: '#ef4444',
                     '&:hover': {
                        bgcolor: '#dc2626',
                     },
                  }}
               >
                  Видалити
               </Button>
            </DialogActions>
         </Dialog>





         <ImageLightbox
            open={photoOpen}
            images={galleryImages}
            index={photoIndex}
            onClose={() => setPhotoOpen(false)}
            onChangeIndex={setPhotoIndex}
         />
      </Box>
   );
};



function AdsLinksSection({
   title,
   links,
   color,
   bg,
   border,
   onOpenGroup,
}) {
   const grouped = groupLinksByPlatform(links);
   const platforms = Object.entries(grouped);

   if (!platforms.length) return null;

   return (
      <Stack direction="row" spacing={0.7} alignItems="center" flexWrap="wrap" useFlexGap>
         <Typography
            sx={{
               color,
               fontSize: 11,
               fontWeight: 950,
               opacity: 0.9,
               mr: 0.2,
            }}
         >
            {title}
         </Typography>

         {platforms.map(([platform, group]) => (
            <Badge
               key={platform}
               badgeContent={group.length > 1 ? group.length : 0}
               color="primary"
               overlap="circular"
               sx={{
                  '& .MuiBadge-badge': {
                     fontSize: 10,
                     height: 16,
                     minWidth: 16,
                     fontWeight: 950,
                  },
               }}
            >
               <Button
                  size="small"
                  onMouseEnter={(e) => onOpenGroup(e.currentTarget, group)}
                  onClick={(e) => onOpenGroup(e.currentTarget, group)}
                  sx={{
                     minHeight: 25,
                     px: 1,
                     py: 0.2,
                     borderRadius: 999,
                     fontSize: 11,
                     fontWeight: 950,
                     color,
                     bgcolor: bg,
                     border,
                  }}
               >
                  {getPlatformLabel(platform)}
               </Button>
            </Badge>
         ))}
      </Stack>
   );
}
