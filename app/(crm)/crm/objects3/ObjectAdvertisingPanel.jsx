'use client';

import {
   Box,
   Stack,
   Typography,
   Chip,
   IconButton,
   Tooltip,
   Badge,
   Grid,
} from '@mui/material';

import CampaignRoundedIcon from '@mui/icons-material/CampaignRounded';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import LinkRoundedIcon from '@mui/icons-material/LinkRounded';

export default function ObjectAdvertisingPanel({
   item,
   theme,
   mode,
   onAddLink,
   onAddText,
}) {
   const getPlatformLabel = (p) => {
      if (p === 'olx') return 'OLX';
      if (p === 'dimria') return 'DIM.RIA';
      if (p === 'rieltor') return 'RIELTOR';
      if (p === 'facebook') return 'Facebook';
      if (p === 'instagram') return 'Instagram';
      if (p === 'site') return 'Сайт';
      return 'Інше';
   };

   const getStatusLabel = (s) => {
      if (s === 'active') return 'Активна';
      if (s === 'paused') return 'Пауза';
      if (s === 'problem') return 'Проблема';
      return '—';
   };

   const groupByPlatform = (links = []) => {
      return links.reduce((acc, l) => {
         const key = l.platform || 'other';
         if (!acc[key]) acc[key] = [];
         acc[key].push(l);
         return acc;
      }, {});
   };

   const getLinks = (type) =>
      (item?.advertisingLinks || []).filter((l) => (l.sourceType || 'ours') === type);

   const renderSection = (title, type, color, bg) => {
      const links = getLinks(type);
      const grouped = groupByPlatform(links);

      if (!links.length) return null;

      return (
         <Stack spacing={0.4}>
            <Typography sx={{ fontSize: 11, color, fontWeight: 900 }}>
               {title}
            </Typography>

            <Stack direction="row" spacing={0.6} flexWrap="wrap">
               {Object.entries(grouped).map(([platform, arr]) => (
                  <Badge
                     key={platform}
                     badgeContent={arr.length > 1 ? arr.length : 0}
                     color="primary"
                  >
                     <Chip
                        label={getPlatformLabel(platform)}
                        size="small"
                        sx={{
                           height: 22,
                           fontSize: 11,
                           fontWeight: 900,
                           color,
                           bgcolor: bg,
                        }}
                     />
                  </Badge>
               ))}
            </Stack>
         </Stack>
      );
   };

   return (
      <Box
         sx={{
            px: 1.2,
            pt: 0.9,
            pb: 1,
            borderTop: `1px solid ${theme.border}`,
         }}
      >
         {/* ===== РЯДОК ===== */}
         <Box
            sx={{
               display: 'grid',
               gridTemplateColumns: {
                  xs: '1fr',
                  md: '1fr 1fr 1fr auto',
               },
               gap: 1,
               alignItems: 'center',
            }}
         >
            {renderSection(
               'Наші',
               'ours',
               mode === 'light' ? '#1e40af' : '#bfdbfe',
               mode === 'light'
                  ? 'rgba(59,130,246,0.10)'
                  : 'rgba(59,130,246,0.12)'
            )}

            {renderSection(
               'Конкуренти',
               'competitor',
               mode === 'light' ? '#92400e' : '#fde68a',
               mode === 'light'
                  ? 'rgba(245,158,11,0.12)'
                  : 'rgba(245,158,11,0.13)'
            )}

            {renderSection(
               'Власник',
               'owner',
               mode === 'light' ? '#991b1b' : '#fecaca',
               mode === 'light'
                  ? 'rgba(239,68,68,0.10)'
                  : 'rgba(239,68,68,0.13)'
            )}

            <Stack direction="row" spacing={0.6}>
               <Tooltip title="Додати рекламу">
                  <IconButton onClick={onAddLink}>
                     <AddRoundedIcon />
                  </IconButton>
               </Tooltip>

               <Tooltip title="Рекламні тексти">
                  <IconButton onClick={onAddText}>
                     <CampaignRoundedIcon />
                  </IconButton>
               </Tooltip>
            </Stack>
         </Box>

         {/* ===== ЛІНКИ ===== */}
         {!!item?.advertisingLinks?.length && (
            <Grid container spacing={1} sx={{ mt: 0.6 }}>
               {item.advertisingLinks.slice(0, 6).map((l) => (
                  <Grid item xs={12} md={6} key={l._id || l.url}>
                     <Box
                        component="a"
                        href={l.url}
                        target="_blank"
                        rel="noreferrer"
                        sx={{
                           display: 'block',
                           p: 0.9,
                           borderRadius: 2,
                           textDecoration: 'none',
                           border: `1px solid ${theme.border}`,
                           bgcolor:
                              mode === 'light'
                                 ? 'rgba(124,58,237,0.03)'
                                 : 'rgba(255,255,255,0.03)',
                        }}
                     >
                        <Stack direction="row" spacing={0.6}>
                           <Chip
                              label={getPlatformLabel(l.platform)}
                              size="small"
                              sx={{ height: 20 }}
                           />
                           <Chip
                              label={getStatusLabel(l.status)}
                              size="small"
                              sx={{ height: 20 }}
                           />
                        </Stack>

                        <Typography
                           sx={{
                              fontSize: 13,
                              fontWeight: 900,
                              mt: 0.4,
                              color: theme.text,
                           }}
                        >
                           {l.title || 'Без назви'}
                        </Typography>

                        {!!l.note && (
                           <Typography sx={{ fontSize: 12, color: theme.textSoft }}>
                              {l.note}
                           </Typography>
                        )}
                     </Box>
                  </Grid>
               ))}
            </Grid>
         )}
      </Box>
   );
}