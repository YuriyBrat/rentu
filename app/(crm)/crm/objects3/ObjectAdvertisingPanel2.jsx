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
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded';
import ExpandLessRoundedIcon from '@mui/icons-material/ExpandLessRounded';

function getPlatformLabel(platform) {
   if (platform === 'olx') return 'OLX';
   if (platform === 'dimria') return 'DIM.RIA';
   if (platform === 'rieltor') return 'RIELTOR';
   if (platform === 'facebook') return 'Facebook';
   if (platform === 'instagram') return 'Instagram';
   if (platform === 'site') return 'Сайт';
   return 'Інше';
}

function getAdStatusLabel(status) {
   if (status === 'active') return 'Активна';
   if (status === 'paused') return 'Пауза';
   if (status === 'archived') return 'Архів';
   if (status === 'problem') return 'Проблема';
   return '—';
}

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

function getSourceColors(sourceType, mode, theme) {
   if (sourceType === 'competitor') {
      return {
         text: mode === 'light' ? '#92400e' : '#fde68a',
         bg: mode === 'light' ? 'rgba(245,158,11,0.12)' : 'rgba(245,158,11,0.13)',
         border: '1px solid rgba(245,158,11,0.28)',
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
      text: mode === 'light' ? '#1e40af' : '#bfdbfe',
      bg: mode === 'light' ? 'rgba(59,130,246,0.10)' : 'rgba(59,130,246,0.12)',
      border: '1px solid rgba(59,130,246,0.25)',
   };
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
   const grouped = groupByPlatform(links);
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
            <Typography
               sx={{
                  color: colors.text,
                  fontSize: 11,
                  fontWeight: 950,
                  mr: 0.2,
                  whiteSpace: 'nowrap',
               }}
            >
               {title}
            </Typography>

            {groups.length ? (
               groups.map(([platform, group]) => (
                  <Badge
                     key={platform}
                     badgeContent={group.length > 1 ? group.length : 0}
                     color="primary"
                     sx={{
                        '& .MuiBadge-badge': {
                           height: 16,
                           minWidth: 16,
                           fontSize: 10,
                           fontWeight: 950,
                        },
                     }}
                  >
                     <Chip
                        label={getPlatformLabel(platform)}
                        size="small"
                        onMouseEnter={(e) => onOpenGroup(e.currentTarget, group)}
                        onClick={(e) => onOpenGroup(e.currentTarget, group)}
                        sx={{
                           height: 22,
                           fontSize: 11,
                           fontWeight: 950,
                           color: colors.text,
                           bgcolor: colors.bg + '!important',
                           border: colors.border,
                           cursor: 'pointer',
                        }}
                     />
                  </Badge>
               ))
            ) : (
               <Typography sx={{ color: theme.textSoft, fontSize: 11 }}>
                  —
               </Typography>
            )}
         </Stack>
      </Box>
   );
}

function AdvertisingLinkRow({ link, mode, theme }) {
   const colors = getSourceColors(link.sourceType || 'ours', mode, theme);

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
               height: 22,
               color: colors.text,
               bgcolor: colors.bg + '!important',
               border: colors.border,
               fontWeight: 900,
            }}
         />

         <Chip
            label={getAdStatusLabel(link.status)}
            size="small"
            sx={{
               height: 22,
               color: mode === 'light' ? '#166534' : '#bbf7d0',
               bgcolor: mode === 'light' ? 'rgba(22,101,52,0.08) !important' : 'rgba(34,197,94,0.12) !important',
               border: mode === 'light'
                  ? '1px solid rgba(22,101,52,0.18)'
                  : '1px solid rgba(34,197,94,0.22)',
               fontWeight: 850,
               display: { xs: 'none', md: 'inline-flex' },
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
            {link.note || '—'}
         </Typography>

         <Typography
            sx={{
               color: theme.textSoft,
               fontSize: 11,
               whiteSpace: 'nowrap',
               display: { xs: 'none', md: 'block' },
            }}
         >
            {formatDateTime(link.createdAt)}
         </Typography>

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

function AdTextCard({ item, theme, mode }) {
   return (
      <Box
         sx={{
            p: 1,
            borderRadius: 2.5,
            bgcolor: mode === 'light' ? 'rgba(124,58,237,0.025)' : 'rgba(255,255,255,0.025)',
            border: `1px solid ${theme.border}`,
         }}
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
               display: '-webkit-box',
               WebkitLineClamp: 3,
               WebkitBoxOrient: 'vertical',
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
}) {
   const [anchorEl, setAnchorEl] = useState(null);
   const [hoveredLinks, setHoveredLinks] = useState([]);

   const allLinks = item?.advertisingLinks || [];
   const ownLinks = getLinksBySource(allLinks, 'ours');
   const competitorLinks = getLinksBySource(allLinks, 'competitor');
   const ownerLinks = getLinksBySource(allLinks, 'owner');

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
            anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
            transformOrigin={{ vertical: 'top', horizontal: 'left' }}
            PaperProps={{
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
               </Stack>

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