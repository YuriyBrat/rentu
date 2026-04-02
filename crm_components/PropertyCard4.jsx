'use client';

import { useState } from 'react';
import {
   Box,
   Typography,
   Stack,
   Chip,
   IconButton,
   Divider,
   Tooltip,
   Menu,
   MenuItem,
   ListItemIcon,
   ListItemText,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';

import { useCRMTheme } from '@/app/(crm)/crm/context/CRMThemeContext';

import LocationOnRoundedIcon from '@mui/icons-material/LocationOnRounded';
import BedRoundedIcon from '@mui/icons-material/BedRounded';
import SquareFootRoundedIcon from '@mui/icons-material/SquareFootRounded';
import LayersRoundedIcon from '@mui/icons-material/LayersRounded';
import StarRoundedIcon from '@mui/icons-material/StarRounded';
import MoreHorizRoundedIcon from '@mui/icons-material/MoreHorizRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded';
import PublicRoundedIcon from '@mui/icons-material/PublicRounded';
import PublicOffRoundedIcon from '@mui/icons-material/PublicOffRounded';

function money(n) {
   if (typeof n !== 'number') return '';
   return n.toLocaleString('uk-UA');
}

function getImageBestUrl(img) {
   if (!img || typeof img !== 'object') return '';

   return (
      img?.variants?.branded ||
      img?.brandedUrl ||
      img?.variants?.card ||
      img?.processedUrl ||
      img?.variants?.preview ||
      img?.variants?.full ||
      img?.url ||
      ''
   );
}

function getMainImage(property) {
   const images = Array.isArray(property?.images) ? property.images : [];
   if (!images.length) return '/krm/logo-krm.png';

   const visible = images
      .filter((img) => img && typeof img === 'object' && !img?.isHidden)
      .sort((a, b) => (a?.sortOrder ?? 0) - (b?.sortOrder ?? 0));

   if (!visible.length) return '/krm/logo-krm.png';

   const main = visible.find((img) => img?.isMain) || visible[0];
   return getImageBestUrl(main) || '/krm/logo-krm.png';
}

function getActualityColor(group, isDark) {
   if (group === 'active') return isDark ? 'rgba(34,197,94,0.16)' : 'rgba(34,197,94,0.10)';
   if (group === 'paused') return isDark ? 'rgba(245,158,11,0.16)' : 'rgba(245,158,11,0.10)';
   if (group === 'inactive') return isDark ? 'rgba(239,68,68,0.14)' : 'rgba(239,68,68,0.10)';
   return isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)';
}

function getActualityBorder(group, isDark) {
   if (group === 'active') return isDark ? 'rgba(34,197,94,0.30)' : 'rgba(34,197,94,0.22)';
   if (group === 'paused') return isDark ? 'rgba(245,158,11,0.30)' : 'rgba(245,158,11,0.22)';
   if (group === 'inactive') return isDark ? 'rgba(239,68,68,0.28)' : 'rgba(239,68,68,0.20)';
   return isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.10)';
}

function getActualityLabel(group) {
   if (group === 'active') return 'Актуальний';
   if (group === 'paused') return 'Зупинений';
   if (group === 'inactive') return 'Неактуальний';
   return 'Статус';
}

export default function PropertyCard({
   property,
   onDelete,
   onEdit,
   onView,
}) {
   // const theme = useTheme();
   // const isDark = theme.palette.mode === 'dark';

   const { mode } = useCRMTheme();
   const isDark = mode === 'dark';

   const [anchorEl, setAnchorEl] = useState(null);
   const openMenu = Boolean(anchorEl);

   const {
      title,
      type_estate,
      type_deal,
      location,
      rooms,
      square_tot,
      floor,
      floors,
      cost,
      currency,
      actualityGroup,
      actualityStatus,
      isPublic,
   } = property;

   const img = getMainImage(property);
   const loc = [location?.city, location?.street, location?.number]
      .filter(Boolean)
      .join(', ');

   const cardBg = isDark
      ? 'linear-gradient(180deg, rgba(255,255,255,0.03), rgba(255,255,255,0.015))'
      : 'linear-gradient(180deg, rgba(255,255,255,0.96), rgba(250,247,255,0.92))';

   const cardBorder = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(20,20,30,0.08)';
   const bodyBg = isDark
      ? 'rgba(255,255,255,0.04)'
      : 'rgba(90,60,140,0.04)';
   const bodyBorder = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(20,20,30,0.08)';
   const textMain = isDark ? '#fff' : '#17121f';
   const textSecondary = isDark ? 'rgba(255,255,255,0.74)' : 'rgba(23,18,31,0.64)';
   const softChipBg = isDark ? 'rgba(255,255,255,0.10)' : 'rgba(255,255,255,0.74)';
   const softChipBorder = isDark ? 'rgba(255,255,255,0.10)' : 'rgba(40,24,60,0.10)';
   const menuBg = isDark
      ? 'linear-gradient(180deg, rgba(21,21,33,0.96), rgba(15,15,23,0.98))'
      : 'linear-gradient(180deg, rgba(255,255,255,0.98), rgba(248,244,255,0.98))';

   const handleMenuOpen = (e) => {
      e.stopPropagation();
      setAnchorEl(e.currentTarget);
   };

   const handleMenuClose = () => setAnchorEl(null);

   const handleDelete = () => {
      handleMenuClose();
      onDelete?.(property);
   };

   const handleEdit = () => {
      handleMenuClose();
      onEdit?.(property);
   };

   const handleView = () => {
      handleMenuClose();
      onView?.(property);
   };

   return (
      <Box
         sx={{
            borderRadius: 4,
            overflow: 'hidden',
            position: 'relative',
            border: `1px solid ${cardBorder}`,
            background: cardBg,
            boxShadow: isDark
               ? '0 18px 40px rgba(0,0,0,0.50)'
               : '0 16px 34px rgba(88,56,136,0.12)',
            transition: 'transform .25s ease, box-shadow .25s ease, border-color .25s ease',
            '&:hover': {
               transform: 'translateY(-6px)',
               borderColor: isDark ? 'rgba(139,92,246,0.45)' : 'rgba(139,92,246,0.30)',
               boxShadow: isDark
                  ? '0 26px 60px rgba(0,0,0,0.65)'
                  : '0 22px 46px rgba(88,56,136,0.16)',
            },
            '&:hover .krmGlow': { opacity: 1 },
            '&:hover .krmImg': { transform: 'scale(1.03)' },
         }}
      >
         <Box
            className="krmGlow"
            sx={{
               pointerEvents: 'none',
               position: 'absolute',
               inset: 0,
               opacity: 0,
               transition: 'opacity .25s ease',
               background: isDark
                  ? 'radial-gradient(circle at 30% 20%, rgba(139,92,246,0.18), transparent 55%), radial-gradient(circle at 80% 75%, rgba(139,92,246,0.10), transparent 55%)'
                  : 'radial-gradient(circle at 30% 20%, rgba(139,92,246,0.12), transparent 55%), radial-gradient(circle at 80% 75%, rgba(139,92,246,0.08), transparent 55%)',
            }}
         />

         <Box sx={{ position: 'relative', height: 210 }}>
            <Box
               className="krmImg"
               sx={{
                  position: 'absolute',
                  inset: 0,
                  backgroundImage: `url(${img})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  transition: 'transform .35s ease',
                  filter: isDark ? 'contrast(1.05) saturate(1.08)' : 'contrast(1.02) saturate(1.02)',
               }}
            />

            <Box
               sx={{
                  position: 'absolute',
                  inset: 0,
                  background: isDark
                     ? 'linear-gradient(180deg, rgba(10,10,14,0.08) 0%, rgba(10,10,14,0.70) 74%, rgba(10,10,14,0.94) 100%)'
                     : 'linear-gradient(180deg, rgba(255,255,255,0.02) 0%, rgba(27,20,39,0.08) 42%, rgba(27,20,39,0.58) 100%)',
               }}
            />

            <Stack
               direction="row"
               spacing={1}
               sx={{
                  position: 'absolute',
                  top: 14,
                  left: 14,
                  right: 14,
                  alignItems: 'center',
               }}
            >
               <Chip
                  label={type_estate || 'Об’єкт'}
                  size="small"
                  sx={{
                     bgcolor: softChipBg,
                     color: isDark ? '#fff' : '#24192f',
                     border: `1px solid ${softChipBorder}`,
                     backdropFilter: 'blur(10px)',
                     fontWeight: 800,
                  }}
               />

               <Chip
                  label={type_deal || 'Угода'}
                  size="small"
                  icon={<StarRoundedIcon sx={{ color: isDark ? '#fff !important' : '#24192f !important' }} />}
                  sx={{
                     bgcolor: isDark ? 'rgba(139,92,246,0.24)' : 'rgba(139,92,246,0.16)',
                     color: isDark ? '#fff' : '#24192f',
                     border: `1px solid ${isDark ? 'rgba(139,92,246,0.35)' : 'rgba(139,92,246,0.20)'}`,
                     backdropFilter: 'blur(10px)',
                     fontWeight: 800,
                  }}
               />

               <Chip
                  label={getActualityLabel(actualityGroup)}
                  size="small"
                  sx={{
                     bgcolor: getActualityColor(actualityGroup, isDark),
                     color: isDark ? '#fff' : '#24192f',
                     border: `1px solid ${getActualityBorder(actualityGroup, isDark)}`,
                     backdropFilter: 'blur(10px)',
                     fontWeight: 800,
                  }}
               />

               <Box sx={{ flexGrow: 1 }} />

               <Tooltip title="Дії">
                  <IconButton
                     onClick={handleMenuOpen}
                     sx={{
                        bgcolor: softChipBg,
                        border: `1px solid ${softChipBorder}`,
                        backdropFilter: 'blur(10px)',
                        color: isDark ? '#fff' : '#24192f',
                        '&:hover': {
                           bgcolor: isDark ? 'rgba(139,92,246,0.18)' : 'rgba(139,92,246,0.14)',
                        },
                     }}
                  >
                     <MoreHorizRoundedIcon />
                  </IconButton>
               </Tooltip>
            </Stack>

            <Stack
               direction="row"
               spacing={1}
               sx={{
                  position: 'absolute',
                  bottom: 14,
                  left: 14,
                  right: 14,
                  alignItems: 'center',
                  flexWrap: 'wrap',
               }}
            >
               <Box
                  sx={{
                     px: 1.25,
                     py: 0.75,
                     borderRadius: 999,
                     display: 'inline-flex',
                     alignItems: 'center',
                     gap: 0.75,
                     bgcolor: isDark ? 'rgba(10,10,14,0.55)' : 'rgba(255,255,255,0.82)',
                     border: `1px solid ${isDark ? 'rgba(255,255,255,0.12)' : 'rgba(20,20,30,0.08)'}`,
                     backdropFilter: 'blur(10px)',
                     boxShadow: isDark
                        ? '0 10px 22px rgba(0,0,0,0.55)'
                        : '0 8px 20px rgba(60,36,92,0.12)',
                  }}
               >
                  <Typography sx={{ fontWeight: 950, color: isDark ? '#fff' : '#17121f', letterSpacing: 0.2 }}>
                     {money(cost)} {currency || ''}
                  </Typography>
               </Box>

               <Box sx={{ flexGrow: 1 }} />

               <Chip
                  icon={isPublic ? <PublicRoundedIcon /> : <PublicOffRoundedIcon />}
                  label={isPublic ? 'На сайті' : 'Не на сайті'}
                  size="small"
                  sx={{
                     bgcolor: isPublic
                        ? (isDark ? 'rgba(34,197,94,0.14)' : 'rgba(34,197,94,0.10)')
                        : softChipBg,
                     color: isDark ? '#fff' : '#24192f',
                     border: isPublic
                        ? `1px solid ${isDark ? 'rgba(34,197,94,0.25)' : 'rgba(34,197,94,0.18)'}`
                        : `1px solid ${softChipBorder}`,
                     backdropFilter: 'blur(10px)',
                     '& .MuiChip-icon': { color: isDark ? '#fff' : '#24192f' },
                  }}
               />
            </Stack>
         </Box>

         <Box sx={{ p: 2.25 }}>
            <Typography
               sx={{
                  fontWeight: 950,
                  fontSize: 16,
                  lineHeight: 1.15,
                  color: textMain,
                  mb: 1,
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                  minHeight: 37,
               }}
            >
               {title || 'Без назви'}
            </Typography>

            <Stack direction="row" spacing={1} alignItems="center" sx={{ opacity: 0.92, mb: 1.5 }}>
               <LocationOnRoundedIcon sx={{ fontSize: 18, color: textSecondary }} />
               <Typography
                  variant="body2"
                  sx={{
                     color: textSecondary,
                     whiteSpace: 'nowrap',
                     overflow: 'hidden',
                     textOverflow: 'ellipsis',
                  }}
                  title={loc}
               >
                  {loc || 'Локація не вказана'}
               </Typography>
            </Stack>

            {actualityStatus && (
               <Box
                  sx={{
                     mb: 1.5,
                     px: 1.15,
                     py: 0.85,
                     borderRadius: 2.4,
                     bgcolor: bodyBg,
                     border: `1px solid ${bodyBorder}`,
                  }}
               >
                  <Typography sx={{ fontSize: 11, color: textSecondary, lineHeight: 1 }}>
                     Статус актуальності
                  </Typography>
                  <Typography sx={{ fontSize: 13, fontWeight: 850, lineHeight: 1.2, color: textMain, mt: 0.35 }}>
                     {actualityStatus}
                  </Typography>
               </Box>
            )}

            <Divider sx={{ borderColor: bodyBorder, mb: 1.5 }} />

            <Stack direction="row" spacing={1.5} flexWrap="wrap" useFlexGap>
               <Spec
                  icon={<BedRoundedIcon sx={{ fontSize: 18 }} />}
                  label="Кімнат"
                  value={rooms}
                  isDark={isDark}
                  textMain={textMain}
                  textSecondary={textSecondary}
                  bodyBg={bodyBg}
                  bodyBorder={bodyBorder}
               />
               <Spec
                  icon={<SquareFootRoundedIcon sx={{ fontSize: 18 }} />}
                  label="Площа"
                  value={square_tot ? `${square_tot} м²` : ''}
                  isDark={isDark}
                  textMain={textMain}
                  textSecondary={textSecondary}
                  bodyBg={bodyBg}
                  bodyBorder={bodyBorder}
               />
               <Spec
                  icon={<LayersRoundedIcon sx={{ fontSize: 18 }} />}
                  label="Поверх"
                  value={floor && floors ? `${floor}/${floors}` : ''}
                  isDark={isDark}
                  textMain={textMain}
                  textSecondary={textSecondary}
                  bodyBg={bodyBg}
                  bodyBorder={bodyBorder}
               />
            </Stack>
         </Box>

         <Menu
            anchorEl={anchorEl}
            open={openMenu}
            onClose={handleMenuClose}
            PaperProps={{
               sx: {
                  mt: 1,
                  minWidth: 190,
                  borderRadius: 3,
                  color: textMain,
                  border: `1px solid ${cardBorder}`,
                  background: menuBg,
                  boxShadow: isDark
                     ? '0 20px 45px rgba(0,0,0,0.55)'
                     : '0 18px 40px rgba(88,56,136,0.14)',
               },
            }}
         >
            <MenuItem onClick={handleView}>
               <ListItemIcon sx={{ color: textMain }}>
                  <VisibilityRoundedIcon fontSize="small" />
               </ListItemIcon>
               <ListItemText primary="Переглянути" />
            </MenuItem>

            <MenuItem onClick={handleEdit}>
               <ListItemIcon sx={{ color: textMain }}>
                  <EditRoundedIcon fontSize="small" />
               </ListItemIcon>
               <ListItemText primary="Редагувати" />
            </MenuItem>

            <Divider sx={{ borderColor: bodyBorder }} />

            <MenuItem onClick={handleDelete} sx={{ color: isDark ? '#ff9b9b' : '#c03952' }}>
               <ListItemIcon sx={{ color: isDark ? '#ff9b9b' : '#c03952' }}>
                  <DeleteOutlineRoundedIcon fontSize="small" />
               </ListItemIcon>
               <ListItemText primary="Видалити" />
            </MenuItem>
         </Menu>
      </Box>
   );
}

function Spec({ icon, label, value, textMain, textSecondary, bodyBg, bodyBorder }) {
   if (!value) return null;

   return (
      <Box
         sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 0.9,
            px: 1.1,
            py: 0.85,
            borderRadius: 2.2,
            bgcolor: bodyBg,
            border: `1px solid ${bodyBorder}`,
         }}
      >
         <Box sx={{ color: textSecondary, display: 'flex' }}>{icon}</Box>
         <Box>
            <Typography sx={{ fontSize: 11, color: textSecondary, lineHeight: 1 }}>
               {label}
            </Typography>
            <Typography sx={{ fontSize: 13, fontWeight: 850, lineHeight: 1.15, color: textMain }}>
               {value}
            </Typography>
         </Box>
      </Box>
   );
}