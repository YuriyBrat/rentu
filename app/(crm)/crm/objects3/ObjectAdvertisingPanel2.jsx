'use client';

import { useState } from 'react';
import {
   Box,
   Stack,
   Typography,
   Chip,
   IconButton,
   Tooltip,
   Badge,
   Collapse,
   Popover,
   Button,
   Divider,
} from '@mui/material';

import CampaignRoundedIcon from '@mui/icons-material/CampaignRounded';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import ContentCopyRoundedIcon from '@mui/icons-material/ContentCopyRounded';
import LinkRoundedIcon from '@mui/icons-material/LinkRounded';
import PersonRoundedIcon from '@mui/icons-material/PersonRounded';
import TuneRoundedIcon from '@mui/icons-material/TuneRounded';
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded';
import ExpandLessRoundedIcon from '@mui/icons-material/ExpandLessRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import PestControlRoundedIcon from '@mui/icons-material/PestControlRounded';
import SentimentDissatisfiedRoundedIcon from '@mui/icons-material/SentimentDissatisfiedRounded';
import { BUSINESS_SCORE_OPTIONS } from '@/utils/crm/BusinessScore';

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

function getAdStatusLabel(status, closedAt) {
   if (closedAt) return 'Неактивна';
   return 'Активна';
}

const adPriorityOptions = [
   [5, '5 - Надвисокий'],
   [4, '4 - Високий'],
   [3, '3 - Нормальний'],
   [2, '2 - Низький'],
   [1, '1 - Найнижчий'],
];

function adPriorityLabel(value) {
   return adPriorityOptions.find(([v]) => Number(v) === Number(value))?.[1] || '3 - Нормальний';
}

function getEmployeeName(employee) {
   if (!employee) return '';
   return [employee.surname, employee.name, employee.fullName].filter(Boolean).join(' ') || employee.email || '';
}

function formatMoney(value, currency = 'USD') {
   if (!value && value !== 0) return '—';
   return `${Number(value).toLocaleString('uk-UA')} ${currency || ''}`;
}

const adScoreBadges = [
   ['adAttractiveness', 'рп'],
   ['adHistory', 'рі'],
   ['adStrategy', 'рс'],
];

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

function groupByPlatform(links = []) {
   return links.reduce((acc, link) => {
      const key = link.platform || 'other';
      if (!acc[key]) acc[key] = [];
      acc[key].push(link);
      return acc;
   }, {});
}

function getLinksBySource(links = [], sourceType) {
   return links.filter((x) => (x.sourceType || 'ours') === sourceType);
}

function isActiveAdLink(link) {
   return !link?.closedAt;
}

function getSourceColors(sourceType, mode, theme) {
   if (sourceType === 'competitor') {
      return {
         text: mode === 'light' ? '#1e40af' : '#bfdbfe',
         bg: mode === 'light' ? 'rgba(59,130,246,0.10)' : 'rgba(59,130,246,0.12)',
         border: '1px solid rgba(59,130,246,0.25)',
      };
   }

   if (sourceType === 'owner') {
      return {
         text: mode === 'light' ? '#991b1b' : '#fecaca',
         bg: mode === 'light' ? 'rgba(239,68,68,0.10)' : 'rgba(239,68,68,0.13)',
         border: '1px solid rgba(239,68,68,0.28)',
      };
   }

   return {
      text: mode === 'light' ? '#92400e' : '#fde68a',
      bg: mode === 'light' ? 'rgba(245,158,11,0.12)' : 'rgba(245,158,11,0.13)',
      border: '1px solid rgba(245,158,11,0.28)',
   };
}

function getSourceIcon(sourceType) {
   if (sourceType === 'competitor') return <PestControlRoundedIcon sx={{ fontSize: 15 }} />;
   if (sourceType === 'owner') return <SentimentDissatisfiedRoundedIcon sx={{ fontSize: 15 }} />;
   return (
      <Box component="span" sx={{ fontSize: 14, lineHeight: 1 }}>
         🐯
      </Box>
   );
}

async function copyLink(url) {
   try {
      await navigator.clipboard.writeText(url || '');
   } catch (e) {
      console.error(e);
   }
}

function AdsBadgeSection({ title, sourceType, links, mode, theme, onOpenGroup }) {
   const colors = getSourceColors(sourceType, mode, theme);
   const activeLinks = links.filter(isActiveAdLink);
   const inactiveCount = links.length - activeLinks.length;
   const grouped = groupByPlatform(activeLinks);
   const groups = Object.entries(grouped);

   return (
      <Box
         sx={{
            minHeight: 34,
            p: 0.65,
            borderRadius: 2.5,
            bgcolor: mode === 'light' ? 'rgba(0,0,0,0.025)' : 'rgba(255,255,255,0.025)',
            border: `1px solid ${theme.border}`,
         }}
      >
         <Stack direction="row" spacing={0.7} alignItems="center" flexWrap="wrap" useFlexGap>
             <Stack direction="row" spacing={0.35} alignItems="center" sx={{ flex: '0 0 auto' }}>
                <Tooltip title={title}>
                   <Box
                      sx={{
                         width: 24,
                         height: 24,
                         display: 'inline-flex',
                         alignItems: 'center',
                         justifyContent: 'center',
                         color: colors.text,
                         bgcolor: colors.bg,
                         border: colors.border,
                         borderRadius: '50%',
                      }}
                   >
                      {getSourceIcon(sourceType)}
                   </Box>
                </Tooltip>

                {!!inactiveCount && (
                   <Tooltip title={`Неактивні ${title.toLowerCase()}: ${inactiveCount}`}>
                      <Box
                         component="span"
                         sx={{
                            width: 20,
                            height: 20,
                            borderRadius: '50%',
                            position: 'relative',
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: mode === 'light' ? '#64748b' : '#9ca3af',
                            bgcolor: mode === 'light' ? 'rgba(100,116,139,0.12)' : 'rgba(156,163,175,0.13)',
                            border: mode === 'light' ? '1px solid rgba(100,116,139,0.28)' : '1px solid rgba(156,163,175,0.25)',
                            fontSize: 12.5,
                            fontWeight: 950,
                            lineHeight: 1,
                            boxShadow: mode === 'light' ? '0 3px 8px rgba(15,23,42,0.05)' : 'none',
                            '&::after': {
                               content: '""',
                               position: 'absolute',
                               left: '50%',
                               top: '50%',
                               width: 14,
                               height: 0,
                               borderTop: `1px solid ${mode === 'light' ? '#475569' : '#d1d5db'}`,
                               bgcolor: 'transparent',
                               opacity: 0.9,
                               transform: 'translate(-50%, -50%) rotate(-35deg)',
                            },
                         }}
                      >
                         {inactiveCount}
                      </Box>
                   </Tooltip>
                )}
             </Stack>

             {groups.length ? (
               groups.map(([platform, group]) => (
                  <Badge
                     key={platform}
                     badgeContent={group.length > 1 ? group.length : 0}
                     color="primary"
                     sx={{
                        '& .MuiBadge-badge': {
                           height: 14,
                           minWidth: 14,
                           fontSize: 9,
                           fontWeight: 950,
                           px: 0.35,
                        },
                     }}
                  >
                     <Chip
                        label={getPlatformLabel(platform)}
                        size="small"
                        onMouseEnter={(e) => onOpenGroup(e.currentTarget, group)}
                        onClick={(e) => onOpenGroup(e.currentTarget, group)}
                        sx={{
                           height: 20,
                           fontSize: 10.5,
                           px: 0.2,
                           fontWeight: 950,
                           color: colors.text,
                           bgcolor: colors.bg + '!important',
                           border: colors.border,
                           cursor: 'pointer',
                           '& .MuiChip-label': {
                              px: 0.9,
                           },
                        }}
                     />
                  </Badge>
               ))
            ) : inactiveCount ? null : (
               <Typography sx={{ color: theme.textSoft, fontSize: 11 }}>
                  —
               </Typography>
            )}
         </Stack>
      </Box>
   );
}

function AdvertisingLinkRow({ link, mode, theme, canManage, onStatusClick }) {
   const colors = getSourceColors(link.sourceType || 'ours', mode, theme);
   const isInactive = !!link.closedAt;
   const statusColor = isInactive
      ? {
         text: mode === 'light' ? '#991b1b' : '#fecaca',
         bg: mode === 'light' ? 'rgba(239,68,68,0.08) !important' : 'rgba(239,68,68,0.13) !important',
         border: mode === 'light'
            ? '1px solid rgba(239,68,68,0.22)'
            : '1px solid rgba(239,68,68,0.28)',
      }
      : {
         text: mode === 'light' ? '#166534' : '#bbf7d0',
         bg: mode === 'light' ? 'rgba(22,101,52,0.08) !important' : 'rgba(34,197,94,0.12) !important',
         border: mode === 'light'
            ? '1px solid rgba(22,101,52,0.18)'
            : '1px solid rgba(34,197,94,0.22)',
      };

   return (
      <Box
         sx={{
            display: 'grid',
            gridTemplateColumns: {
               xs: '1fr auto',
               md: '90px 85px minmax(120px, 1fr) minmax(120px, 1.4fr) 135px auto',
            },
            gap: 0.8,
            alignItems: 'center',
            p: 0.85,
            borderRadius: 2.4,
            bgcolor: mode === 'light' ? 'rgba(124,58,237,0.025) !important' : 'rgba(255,255,255,0.025) !important',
            border: `1px solid ${theme.border}`,
         }}
      >
          <Chip
             label={getPlatformLabel(link.platform)}
             size="small"
             sx={{
                height: 20,
                fontSize: 10.5,
                px: 0.25,
                color: colors.text,
                bgcolor: colors.bg + '!important',
                border: colors.border,
                fontWeight: 900,
                '& .MuiChip-label': {
                   px: 1,
                },
             }}
          />

          <Chip
            label={getAdStatusLabel(link.status, link.closedAt)}
            size="small"
            onClick={(event) => {
               event.stopPropagation();
               onStatusClick?.(link);
            }}
             sx={{
               height: 20,
               fontSize: 10.5,
               color: statusColor.text,
               bgcolor: statusColor.bg,
               border: statusColor.border,
               fontWeight: 850,
               display: { xs: 'none', md: 'inline-flex' },
               cursor: canManage ? 'pointer' : 'default',
               pointerEvents: canManage ? 'auto' : 'none',
               '& .MuiChip-label': {
                  px: 1,
               },
            }}
         />

         <Box
            component="a"
            href={link.url}
            target="_blank"
            rel="noreferrer"
            sx={{
               color: colors.text,
               fontWeight: 950,
               fontSize: 13,
               textDecoration: 'none',
               minWidth: 0,
               overflow: 'hidden',
               textOverflow: 'ellipsis',
               whiteSpace: 'nowrap',
            }}
         >
            {link.title || getPlatformLabel(link.platform)}
         </Box>

         <Typography
            sx={{
               color: theme.textSoft,
               fontSize: 12,
               minWidth: 0,
               overflow: 'hidden',
               textOverflow: 'ellipsis',
               whiteSpace: 'nowrap',
               display: { xs: 'none', md: 'block' },
            }}
         >
            {isInactive ? (link.closedNote || link.note || '—') : (link.note || '—')}
          </Typography>

          <Stack spacing={0.15} sx={{ display: { xs: 'none', md: 'flex' }, minWidth: 0 }}>
             <Typography sx={{ color: theme.textSoft, fontSize: 11, whiteSpace: 'nowrap' }}>
                {formatDateTime(link.createdAt)}
             </Typography>
             {isInactive && (
                <Typography sx={{ color: '#fca5a5', fontSize: 10.5, whiteSpace: 'nowrap' }}>
                   до {formatDateTime(link.closedAt)}
                </Typography>
             )}
          </Stack>

         <Tooltip title="Скопіювати посилання">
            <IconButton
               size="small"
               onClick={() => copyLink(link.url)}
               sx={{
                  color: theme.text,
                  border: `1px solid ${theme.border}`,
                  bgcolor: mode === 'light' ? 'rgba(124,58,237,0.045)' : 'rgba(255,255,255,0.035)',
               }}
            >
               <ContentCopyRoundedIcon fontSize="small" />
            </IconButton>
         </Tooltip>
      </Box>
   );
}

function AdTextCard({ item, theme, mode, expanded, canManage, onToggle, onEdit, onDelete }) {
   return (
      <Box
         sx={{
            p: 1,
            borderRadius: 2.5,
            bgcolor: mode === 'light' ? 'rgba(124,58,237,0.025)' : 'rgba(255,255,255,0.025)',
            border: `1px solid ${theme.border}`,
            cursor: 'pointer',
            transition: 'border-color 160ms ease, background-color 160ms ease',
            '&:hover': {
               borderColor: mode === 'light' ? 'rgba(124,58,237,0.34)' : 'rgba(255,255,255,0.22)',
               bgcolor: mode === 'light' ? 'rgba(124,58,237,0.045)' : 'rgba(255,255,255,0.038)',
            },
         }}
         onClick={onToggle}
      >
         <Stack direction="row" justifyContent="space-between" spacing={1}>
            <Typography sx={{ color: theme.text, fontWeight: 950, fontSize: 13 }}>
               {item.title || 'Рекламний текст'}
            </Typography>

            <Typography sx={{ color: theme.textSoft, fontSize: 11, whiteSpace: 'nowrap' }}>
               {formatDateTime(item.createdAt)}
            </Typography>
         </Stack>

          <Typography
             sx={{
                color: theme.textSoft,
                fontSize: 12,
                mt: 0.45,
                lineHeight: 1.55,
                whiteSpace: expanded ? 'pre-wrap' : 'normal',
                display: expanded ? 'block' : '-webkit-box',
                WebkitLineClamp: expanded ? 'unset' : 3,
                WebkitBoxOrient: expanded ? 'unset' : 'vertical',
                overflow: 'hidden',
             }}
          >
             {item.text}
         </Typography>

          {!!item.note && (
             <Typography sx={{ color: theme.textSoft, fontSize: 11, mt: 0.45 }}>
                {item.note}
             </Typography>
          )}

          <Collapse in={expanded && canManage} timeout="auto" unmountOnExit>
             <Stack
                direction="row"
                spacing={0.7}
                justifyContent="flex-end"
                sx={{ mt: 1.1, pt: 0.9, borderTop: `1px solid ${theme.border}` }}
                onClick={(event) => event.stopPropagation()}
             >
                <Button
                   size="small"
                   startIcon={<EditRoundedIcon sx={{ fontSize: 16 }} />}
                   onClick={onEdit}
                   sx={{
                      minHeight: 30,
                      borderRadius: 999,
                      px: 1.4,
                      color: theme.accentLight,
                      fontWeight: 900,
                      textTransform: 'none',
                      bgcolor: mode === 'light' ? 'rgba(124,58,237,0.08)' : 'rgba(124,58,237,0.16)',
                   }}
                >
                   Редагувати
                </Button>

                <Button
                   size="small"
                   startIcon={<DeleteOutlineRoundedIcon sx={{ fontSize: 16 }} />}
                   onClick={onDelete}
                   sx={{
                      minHeight: 30,
                      borderRadius: 999,
                      px: 1.4,
                      color: '#fca5a5',
                      fontWeight: 900,
                      textTransform: 'none',
                      bgcolor: mode === 'light' ? 'rgba(239,68,68,0.08)' : 'rgba(239,68,68,0.14)',
                   }}
                >
                   Видалити
                </Button>
             </Stack>
          </Collapse>
      </Box>
   );
}

export default function ObjectAdvertisingPanel({
   item,
   theme,
   mode,
   actionIconSx,
   open,
   onToggleOpen,
   onAddLink,
   onAddText,
   onEditText,
   onDeleteText,
   onEditLink,
   onEditSettings,
   employees = [],
   canManage = false,
}) {
   const [anchorEl, setAnchorEl] = useState(null);
   const [hoveredLinks, setHoveredLinks] = useState([]);
   const [expandedTextId, setExpandedTextId] = useState('');

   const allLinks = item?.advertisingLinks || [];
   const ownLinks = getLinksBySource(allLinks, 'ours');
   const competitorLinks = getLinksBySource(allLinks, 'competitor');
   const ownerLinks = getLinksBySource(allLinks, 'owner');
   const settings = item?.advertisingSettings || {};
   const advertisingEmployeeId = settings.assignedEmployee?._id || settings.assignedEmployee || '';
   const advertisingEmployee =
      settings.assignedEmployee?._id
         ? settings.assignedEmployee
         : employees.find((employee) => String(employee._id) === String(advertisingEmployeeId));
   const advertisingStatusLabel =
      settings.status === 'paused'
         ? 'Пауза'
         : settings.status === 'done'
            ? 'Готово'
            : settings.status === 'none'
               ? 'Без реклами'
               : 'Активно';

   const handleOpenGroup = (anchor, links) => {
      setAnchorEl(anchor);
      setHoveredLinks(links);
   };

   const handleCloseGroup = () => {
      setAnchorEl(null);
      setHoveredLinks([]);
   };

   return (
      <Box sx={{ px: 1.15, pb: 1 }}>
         <Box
            sx={{
               display: 'grid',
               gridTemplateColumns: {
                  xs: '1fr',
                  md: '1fr 1fr 1fr auto',
               },
               gap: 0.8,
               alignItems: 'center',
               pt: 0.85,
               borderTop: `1px solid ${theme.border}`,
            }}
         >
            <AdsBadgeSection
               title="Наші"
               sourceType="ours"
               links={ownLinks}
               mode={mode}
               theme={theme}
               onOpenGroup={handleOpenGroup}
            />

            <AdsBadgeSection
               title="Конкуренти"
               sourceType="competitor"
               links={competitorLinks}
               mode={mode}
               theme={theme}
               onOpenGroup={handleOpenGroup}
            />

            <AdsBadgeSection
               title="Власник"
               sourceType="owner"
               links={ownerLinks}
               mode={mode}
               theme={theme}
               onOpenGroup={handleOpenGroup}
            />

            <Stack direction="row" spacing={0.6} justifyContent={{ xs: 'flex-start', md: 'flex-end' }}>
               <Tooltip title={open ? 'Сховати рекламний блок' : 'Показати рекламний блок'}>
                  <IconButton onClick={onToggleOpen} sx={actionIconSx}>
                     {open ? <ExpandLessRoundedIcon /> : <CampaignRoundedIcon />}
                  </IconButton>
               </Tooltip>
            </Stack>
         </Box>

          <Popover
             open={!!anchorEl}
             anchorEl={anchorEl}
             onClose={handleCloseGroup}
             disableScrollLock
             disableAutoFocus
             disableEnforceFocus
             disableRestoreFocus
             marginThreshold={8}
             anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
             transformOrigin={{ vertical: 'top', horizontal: 'left' }}
             PaperProps={{
                onMouseLeave: handleCloseGroup,
                sx: {
                   mt: 0.8,
                   p: 1,
                  borderRadius: 3,
                  minWidth: 280,
                  bgcolor: theme.bgPanel,
                  border: `1px solid ${theme.border}`,
                  boxShadow: `0 18px 44px ${theme.glow}`,
               },
            }}
         >
            <Stack spacing={0.65}>
               {hoveredLinks.map((link) => (
                  <Stack
                     key={link._id || link.url}
                     direction="row"
                     spacing={0.6}
                     alignItems="center"
                  >
                     {/* <Button
                        component="a"
                        href={link.url}
                        target="_blank"
                        rel="noreferrer"
                        startIcon={<LinkRoundedIcon />}
                        sx={{
                           flex: 1,
                           justifyContent: 'flex-start',
                           textTransform: 'none',
                           color: theme.text,
                           fontWeight: 850,
                           borderRadius: 2,
                           bgcolor: mode === 'light'
                              ? 'rgba(124,58,237,0.035)'
                              : 'rgba(255,255,255,0.035)',
                        }}
                     >
                        {link.title || getPlatformLabel(link.platform)}
                     </Button> */}
                     <Button
                        component="a"
                        href={link.url}
                        target="_blank"
                        rel="noreferrer"
                        startIcon={<LinkRoundedIcon sx={{ fontSize: 16 }} />}
                        sx={{
                           flex: 1,
                           minHeight: 28,
                           py: 0.25,
                           px: 0.8,
                           justifyContent: 'flex-start',
                           textTransform: 'none',
                           color: theme.text,
                           fontSize: 12,
                           fontWeight: 850,
                           borderRadius: 1.8,
                           bgcolor: mode === 'light'
                              ? 'rgba(124,58,237,0.035)'
                              : 'rgba(255,255,255,0.035)',
                        }}
                     >
                        {link.title || getPlatformLabel(link.platform)}
                     </Button>

                     <Tooltip title="Скопіювати посилання">
                        <IconButton
                           size="small"
                           onClick={() => copyLink(link.url)}
                           sx={{
                              width: 28,
                              height: 28,
                              color: theme.text,
                              border: `1px solid ${theme.border}`,
                           }}
                        >
                           <ContentCopyRoundedIcon sx={{ fontSize: 15 }} />
                        </IconButton>
                     </Tooltip>
                  </Stack>
               ))}
            </Stack>
         </Popover>

         <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ mt: 1 }}>
               <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 0.8 }}>
                  <Typography sx={{ color: theme.text, fontWeight: 950 }}>
                     Рекламний блок
                  </Typography>

                  {canManage && (
                     <Stack direction="row" spacing={0.6}>
                        <Tooltip title="Додати рекламний текст">
                           <IconButton onClick={onAddText} sx={actionIconSx}>
                              <AddRoundedIcon />
                           </IconButton>
                        </Tooltip>

                        <Tooltip title="Додати посилання">
                           <IconButton onClick={onAddLink} sx={actionIconSx}>
                              <LinkRoundedIcon />
                           </IconButton>
                        </Tooltip>
                     </Stack>
                  )}
                </Stack>

                <Box
                   sx={{
                      mb: 0.8,
                      p: 0.85,
                      borderRadius: 2.5,
                      border: `1px solid ${theme.border}`,
                      bgcolor: mode === 'light'
                         ? 'rgba(245,158,11,0.045)'
                         : 'rgba(251,146,60,0.055)',
                   }}
                >
                   <Stack direction={{ xs: 'column', md: 'row' }} spacing={0.75} alignItems={{ xs: 'stretch', md: 'center' }}>
                      <Stack direction="row" spacing={0.55} flexWrap="wrap" useFlexGap sx={{ minWidth: 0, flex: 1 }}>
                         <Chip size="small" icon={<PersonRoundedIcon sx={{ fontSize: '14px !important' }} />} label={getEmployeeName(advertisingEmployee) || 'Рекламщик не призначений'} sx={{ height: 22, fontSize: 11, fontWeight: 850 }} />
                         <Chip size="small" icon={<CampaignRoundedIcon sx={{ fontSize: '14px !important' }} />} label={advertisingStatusLabel} sx={{ height: 22, fontSize: 11, fontWeight: 850, color: settings.status === 'none' ? '#fb7185' : '#86efac', bgcolor: settings.status === 'none' ? 'rgba(251,113,133,0.10)' : 'rgba(34,197,94,0.10)' }} />
                         <Chip size="small" label={adPriorityLabel(settings.priority || 3)} sx={{ height: 22, fontSize: 11, fontWeight: 850, color: '#facc15', bgcolor: 'rgba(250,204,21,0.10)' }} />
                         <Chip size="small" label={`ціна ${settings.price ? formatMoney(settings.price, settings.currency || 'USD') : '—'}`} sx={{ height: 22, fontSize: 11, fontWeight: 850 }} />
                         {adScoreBadges.map(([key, shortLabel]) => {
                            const scoreValue = item?.businessScore?.[key];
                            const config = BUSINESS_SCORE_OPTIONS[key];
                            if (!scoreValue || !config) return null;
                            return (
                               <Tooltip key={key} title={`${config.label}: ${scoreValue} — ${config.options?.[scoreValue] || ''}`} arrow>
                                  <Chip
                                     size="small"
                                     label={`${shortLabel} ${scoreValue}`}
                                     sx={{
                                        height: 22,
                                        fontSize: 11,
                                        fontWeight: 950,
                                        color: '#bfdbfe',
                                        bgcolor: 'rgba(59,130,246,0.12)',
                                        border: '1px solid rgba(59,130,246,0.24)',
                                     }}
                                  />
                               </Tooltip>
                            );
                         })}
                      </Stack>

                      {canManage && (
                         <Button
                            size="small"
                            onClick={onEditSettings}
                            startIcon={<TuneRoundedIcon />}
                            sx={{
                               borderRadius: 2,
                               px: 1.25,
                               py: 0.35,
                               color: theme.accentLight,
                               fontWeight: 950,
                               border: `1px solid ${theme.border}`,
                               bgcolor: mode === 'light' ? 'rgba(124,58,237,0.06)' : 'rgba(139,92,246,0.10)',
                               whiteSpace: 'nowrap',
                            }}
                         >
                            Редагувати завдання
                         </Button>
                      )}
                   </Stack>

                   {(settings.note || settings.draftText) && (
                      <Typography sx={{ mt: 0.5, color: settings.note ? '#fdba74' : theme.textSoft, fontSize: 12, fontWeight: settings.note ? 850 : 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                         {settings.note ? `Завдання: ${settings.note}` : `Чорновий текст: ${settings.draftText}`}
                      </Typography>
                   )}
                </Box>

                <Box
                   sx={{
                     display: 'grid',
                     gridTemplateColumns: {
                        xs: '1fr',
                        md: '1fr 1fr',
                        lg: '1fr 2fr',
                     },
                     gap: 1,
                  }}
               >
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
                     <Typography sx={{ color: theme.text, fontWeight: 900, mb: 0.75 }}>
                        Рекламні тексти
                     </Typography>

                     <Box
                        sx={{
                           maxHeight: 360,
                           overflowY: 'auto',
                           pr: 0.4,
                           '&::-webkit-scrollbar': {
                              width: 6,
                           },
                           '&::-webkit-scrollbar-thumb': {
                              bgcolor: mode === 'light'
                                 ? 'rgba(124,58,237,0.22)'
                                 : 'rgba(255,255,255,0.16)',
                              borderRadius: 999,
                           },
                        }}
                     >
                        <Stack spacing={0.75}>
                            {(item?.advertisingTexts || []).slice(0, 20).map((text) => (
                               <AdTextCard
                                  key={text._id || text.createdAt}
                                  item={text}
                                  theme={theme}
                                  mode={mode}
                                  canManage={canManage}
                                  expanded={expandedTextId === String(text._id || text.createdAt)}
                                  onToggle={() => {
                                     const id = String(text._id || text.createdAt);
                                     setExpandedTextId((current) => current === id ? '' : id);
                                  }}
                                  onEdit={() => onEditText?.(text)}
                                  onDelete={() => onDeleteText?.(text)}
                               />
                            ))}

                           {!item?.advertisingTexts?.length && (
                              <Typography sx={{ color: theme.textSoft, fontSize: 13 }}>
                                 Текстів ще немає
                              </Typography>
                           )}
                        </Stack>
                     </Box>
                  </Box>

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
                     <Typography sx={{ color: theme.text, fontWeight: 900, mb: 0.75 }}>
                        Посилання
                     </Typography>
                     <Box
                        sx={{
                           maxHeight: 360,
                           overflowY: 'auto',
                           pr: 0.4,
                           '&::-webkit-scrollbar': {
                              width: 6,
                           },
                           '&::-webkit-scrollbar-thumb': {
                              bgcolor: mode === 'light'
                                 ? 'rgba(124,58,237,0.22)'
                                 : 'rgba(255,255,255,0.16)',
                              borderRadius: 999,
                           },
                        }}
                     >
                        <Stack spacing={0.7}>
                           {allLinks.map((link) => (
                              <AdvertisingLinkRow
                                 key={link._id || link.url}
                                 link={link}
                                 theme={theme}
                                 mode={mode}
                                 canManage={canManage}
                                 onStatusClick={onEditLink}
                              />
                           ))}

                           {!allLinks.length && (
                              <Typography sx={{ color: theme.textSoft, fontSize: 13 }}>
                                 Посилань ще немає
                              </Typography>
                           )}
                        </Stack>
                     </Box>
                  </Box>
               </Box>
            </Box>
         </Collapse>
      </Box>
   );
}
