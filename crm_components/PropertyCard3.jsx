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

// function getMainImage(property) {
//    const images = Array.isArray(property?.images) ? property.images : [];
//    const main = images.find((img) => img?.isMain);

//    const first = main || images[0];

//    if (!first) return '/krm/placeholder-estate.jpg';

//    // нова модель
//    if (typeof first === 'object') {
//       return first?.variants?.card || first?.url || '/krm/placeholder-estate.jpg';
//    }

//    // стара модель
//    if (typeof first === 'string') return first;

//    return '/krm/placeholder-estate.jpg';
// };

function getMainImage(property) {
   const images = Array.isArray(property?.images) ? property.images : [];
   if (!images.length) return '/krm/placeholder-estate.jpg';

   const main = images.find((img) => typeof img === 'object' && img?.isMain);
   const first = main || images[0];

   // старий формат
   if (typeof first === 'string') return first;

   // новий формат
   if (typeof first === 'object' && first) {
      return (
         first?.variants?.card ||
         first?.variants?.preview ||
         first?.full ||
         first?.url ||
         '/krm/placeholder-estate.jpg'
      );
   }

   return '/krm/placeholder-estate.jpg';
}



function getActualityColor(group) {
   if (group === 'active') return 'rgba(34,197,94,0.16)';
   if (group === 'paused') return 'rgba(245,158,11,0.16)';
   if (group === 'inactive') return 'rgba(239,68,68,0.14)';
   return 'rgba(255,255,255,0.08)';
}

function getActualityBorder(group) {
   if (group === 'active') return 'rgba(34,197,94,0.30)';
   if (group === 'paused') return 'rgba(245,158,11,0.30)';
   if (group === 'inactive') return 'rgba(239,68,68,0.28)';
   return 'rgba(255,255,255,0.12)';
}

function getActualityLabel(group) {
   if (group === 'active') return 'Актуальний';
   if (group === 'paused') return 'Зупинений';
   if (group === 'inactive') return 'Неактуальний';
   return 'Статус';
};


export default function PropertyCard({
   property,
   onDelete,
   onEdit,
   onView,
}) {
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

   const handleMenuOpen = (e) => {
      e.stopPropagation();
      setAnchorEl(e.currentTarget);
   };

   const handleMenuClose = () => setAnchorEl(null);

   const handleDelete = async () => {
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
            border: '1px solid rgba(255,255,255,0.08)',
            background:
               'linear-gradient(180deg, rgba(255,255,255,0.03), rgba(255,255,255,0.015))',
            boxShadow: '0 18px 40px rgba(0,0,0,0.50)',
            transition:
               'transform .25s ease, box-shadow .25s ease, border-color .25s ease',
            '&:hover': {
               transform: 'translateY(-6px)',
               borderColor: 'rgba(139,92,246,0.45)',
               boxShadow: '0 26px 60px rgba(0,0,0,0.65)',
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
               background:
                  'radial-gradient(circle at 30% 20%, rgba(139,92,246,0.18), transparent 55%), radial-gradient(circle at 80% 75%, rgba(139,92,246,0.10), transparent 55%)',
            }}
         />

         {/* IMAGE */}
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
                  filter: 'contrast(1.05) saturate(1.08)',
               }}
            />

            <Box
               sx={{
                  position: 'absolute',
                  inset: 0,
                  background:
                     'linear-gradient(180deg, rgba(10,10,14,0.08) 0%, rgba(10,10,14,0.70) 74%, rgba(10,10,14,0.94) 100%)',
               }}
            />

            {/* top row */}
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
                     bgcolor: 'rgba(255,255,255,0.10)',
                     color: '#fff',
                     border: '1px solid rgba(255,255,255,0.10)',
                     backdropFilter: 'blur(10px)',
                     fontWeight: 800,
                  }}
               />

               <Chip
                  label={type_deal || 'Угода'}
                  size="small"
                  icon={<StarRoundedIcon sx={{ color: '#fff !important' }} />}
                  sx={{
                     bgcolor: 'rgba(139,92,246,0.24)',
                     color: '#fff',
                     border: '1px solid rgba(139,92,246,0.35)',
                     backdropFilter: 'blur(10px)',
                     fontWeight: 800,
                  }}
               />

               <Chip
                  label={getActualityLabel(actualityGroup)}
                  size="small"
                  sx={{
                     bgcolor: getActualityColor(actualityGroup),
                     color: '#fff',
                     border: `1px solid ${getActualityBorder(actualityGroup)}`,
                     backdropFilter: 'blur(10px)',
                     fontWeight: 800,
                  }}
               />

               <Box sx={{ flexGrow: 1 }} />

               <Tooltip title="Дії">
                  <IconButton
                     onClick={handleMenuOpen}
                     sx={{
                        bgcolor: 'rgba(255,255,255,0.10)',
                        border: '1px solid rgba(255,255,255,0.10)',
                        backdropFilter: 'blur(10px)',
                        color: '#fff',
                        '&:hover': { bgcolor: 'rgba(139,92,246,0.18)' },
                     }}
                  >
                     <MoreHorizRoundedIcon />
                  </IconButton>
               </Tooltip>
            </Stack>

            {/* bottom pills */}
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
                     bgcolor: 'rgba(10,10,14,0.55)',
                     border: '1px solid rgba(255,255,255,0.12)',
                     backdropFilter: 'blur(10px)',
                     boxShadow: '0 10px 22px rgba(0,0,0,0.55)',
                  }}
               >
                  <Typography sx={{ fontWeight: 950, color: '#fff', letterSpacing: 0.2 }}>
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
                        ? 'rgba(34,197,94,0.14)'
                        : 'rgba(255,255,255,0.08)',
                     color: '#fff',
                     border: isPublic
                        ? '1px solid rgba(34,197,94,0.25)'
                        : '1px solid rgba(255,255,255,0.10)',
                     backdropFilter: 'blur(10px)',
                     '& .MuiChip-icon': { color: '#fff' },
                  }}
               />
            </Stack>
         </Box>

         {/* BODY */}
         <Box sx={{ p: 2.25 }}>
            <Typography
               sx={{
                  fontWeight: 950,
                  fontSize: 16,
                  lineHeight: 1.15,
                  color: '#fff',
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

            <Stack direction="row" spacing={1} alignItems="center" sx={{ opacity: 0.82, mb: 1.5 }}>
               <LocationOnRoundedIcon sx={{ fontSize: 18, color: 'rgba(255,255,255,0.78)' }} />
               <Typography
                  variant="body2"
                  sx={{
                     color: 'rgba(255,255,255,0.74)',
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
                     bgcolor: 'rgba(255,255,255,0.04)',
                     border: '1px solid rgba(255,255,255,0.06)',
                  }}
               >
                  <Typography sx={{ fontSize: 11, opacity: 0.68, lineHeight: 1 }}>
                     Статус актуальності
                  </Typography>
                  <Typography sx={{ fontSize: 13, fontWeight: 850, lineHeight: 1.2, color: '#fff', mt: 0.35 }}>
                     {actualityStatus}
                  </Typography>
               </Box>
            )}

            <Divider sx={{ borderColor: 'rgba(255,255,255,0.08)', mb: 1.5 }} />

            <Stack direction="row" spacing={1.5} flexWrap="wrap" useFlexGap>
               <Spec
                  icon={<BedRoundedIcon sx={{ fontSize: 18 }} />}
                  label="Кімнат"
                  value={rooms}
               />
               <Spec
                  icon={<SquareFootRoundedIcon sx={{ fontSize: 18 }} />}
                  label="Площа"
                  value={square_tot ? `${square_tot} м²` : ''}
               />
               <Spec
                  icon={<LayersRoundedIcon sx={{ fontSize: 18 }} />}
                  label="Поверх"
                  value={floor && floors ? `${floor}/${floors}` : ''}
               />
            </Stack>
         </Box>

         {/* MENU */}
         <Menu
            anchorEl={anchorEl}
            open={openMenu}
            onClose={handleMenuClose}
            PaperProps={{
               sx: {
                  mt: 1,
                  minWidth: 190,
                  borderRadius: 3,
                  color: '#fff',
                  border: '1px solid rgba(255,255,255,0.08)',
                  background:
                     'linear-gradient(180deg, rgba(21,21,33,0.96), rgba(15,15,23,0.98))',
                  boxShadow: '0 20px 45px rgba(0,0,0,0.55)',
               },
            }}
         >
            <MenuItem onClick={handleView}>
               <ListItemIcon sx={{ color: '#fff' }}>
                  <VisibilityRoundedIcon fontSize="small" />
               </ListItemIcon>
               <ListItemText primary="Переглянути" />
            </MenuItem>

            <MenuItem onClick={handleEdit}>
               <ListItemIcon sx={{ color: '#fff' }}>
                  <EditRoundedIcon fontSize="small" />
               </ListItemIcon>
               <ListItemText primary="Редагувати" />
            </MenuItem>

            <Divider sx={{ borderColor: 'rgba(255,255,255,0.08)' }} />

            <MenuItem onClick={handleDelete} sx={{ color: '#ff9b9b' }}>
               <ListItemIcon sx={{ color: '#ff9b9b' }}>
                  <DeleteOutlineRoundedIcon fontSize="small" />
               </ListItemIcon>
               <ListItemText primary="Видалити" />
            </MenuItem>
         </Menu>
      </Box>
   );
}




function Spec({ icon, label, value }) {
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
            bgcolor: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.06)',
         }}
      >
         <Box sx={{ color: 'rgba(255,255,255,0.78)', display: 'flex' }}>{icon}</Box>
         <Box>
            <Typography sx={{ fontSize: 11, opacity: 0.7, lineHeight: 1 }}>
               {label}
            </Typography>
            <Typography sx={{ fontSize: 13, fontWeight: 850, lineHeight: 1.15, color: '#fff' }}>
               {value}
            </Typography>
         </Box>
      </Box>
   );
}