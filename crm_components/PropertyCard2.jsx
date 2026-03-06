'use client';

import {
   Box,
   Typography,
   Stack,
   Chip,
   IconButton,
   Divider,
   Tooltip,
} from '@mui/material';

import LocationOnRoundedIcon from '@mui/icons-material/LocationOnRounded';
import BedRoundedIcon from '@mui/icons-material/BedRounded';
import SquareFootRoundedIcon from '@mui/icons-material/SquareFootRounded';
import LayersRoundedIcon from '@mui/icons-material/LayersRounded';
import StarRoundedIcon from '@mui/icons-material/StarRounded';
import MoreHorizRoundedIcon from '@mui/icons-material/MoreHorizRounded';

function money(n) {
   if (typeof n !== 'number') return '';
   return n.toLocaleString('uk-UA');
}

export default function PropertyCard({ property, onMore }) {
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
      images,
   } = property;

   const img = images?.[0] || '/krm/placeholder-estate.jpg';

   const loc = [
      location?.city,
      location?.street,
      location?.number,
   ].filter(Boolean).join(', ');

   return (
      <Box
         sx={{
            borderRadius: 4,
            overflow: 'hidden',
            position: 'relative',
            border: '1px solid rgba(255,255,255,0.08)',
            background: 'linear-gradient(180deg, rgba(255,255,255,0.03), rgba(255,255,255,0.015))',
            boxShadow: '0 18px 40px rgba(0,0,0,0.50)',
            transition: 'transform .25s ease, box-shadow .25s ease, border-color .25s ease',
            '&:hover': {
               transform: 'translateY(-6px)',
               borderColor: 'rgba(139,92,246,0.45)',
               boxShadow: '0 26px 60px rgba(0,0,0,0.65)',
            },
            '&:hover .krmGlow': { opacity: 1 },
            '&:hover .krmImg': { transform: 'scale(1.03)' },
         }}
      >
         {/* glow overlay */}
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
         <Box sx={{ position: 'relative', height: 190 }}>
            <Box
               className="krmImg"
               sx={{
                  position: 'absolute',
                  inset: 0,
                  backgroundImage: `url(${img})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  transition: 'transform .35s ease',
                  filter: 'contrast(1.05) saturate(1.1)',
               }}
            />
            {/* gradient on image */}
            <Box
               sx={{
                  position: 'absolute',
                  inset: 0,
                  background:
                     'linear-gradient(180deg, rgba(10,10,14,0.10) 0%, rgba(10,10,14,0.72) 75%, rgba(10,10,14,0.92) 100%)',
               }}
            />

            {/* top chips */}
            <Stack
               direction="row"
               spacing={1}
               sx={{ position: 'absolute', top: 14, left: 14, right: 14, alignItems: 'center' }}
            >
               <Chip
                  label={type_estate || 'Об’єкт'}
                  size="small"
                  sx={{
                     bgcolor: 'rgba(255,255,255,0.10)',
                     color: '#fff',
                     border: '1px solid rgba(255,255,255,0.10)',
                     backdropFilter: 'blur(10px)',
                     fontWeight: 700,
                  }}
               />
               <Chip
                  label={type_deal || 'Угода'}
                  size="small"
                  icon={<StarRoundedIcon sx={{ color: '#fff !important' }} />}
                  sx={{
                     bgcolor: 'rgba(139,92,246,0.25)',
                     color: '#fff',
                     border: '1px solid rgba(139,92,246,0.35)',
                     backdropFilter: 'blur(10px)',
                     fontWeight: 800,
                     ml: 0,
                  }}
               />

               <Box sx={{ flexGrow: 1 }} />

               <Tooltip title="Дії">
                  <IconButton
                     onClick={() => onMore?.(property)}
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

            {/* price pill */}
            <Box
               sx={{
                  position: 'absolute',
                  bottom: 14,
                  left: 14,
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
               <Typography sx={{ fontWeight: 900, color: '#fff', letterSpacing: 0.2 }}>
                  {money(cost)} {currency || ''}
               </Typography>
            </Box>
         </Box>

         {/* BODY */}
         <Box sx={{ p: 2.25 }}>
            <Typography
               sx={{
                  fontWeight: 900,
                  fontSize: 16,
                  lineHeight: 1.15,
                  color: '#fff',
                  mb: 1,
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
               }}
            >
               {title || 'Без назви'}
            </Typography>

            <Stack direction="row" spacing={1} alignItems="center" sx={{ opacity: 0.8, mb: 1.5 }}>
               <LocationOnRoundedIcon sx={{ fontSize: 18, color: 'rgba(255,255,255,0.75)' }} />
               <Typography
                  variant="body2"
                  sx={{
                     color: 'rgba(255,255,255,0.72)',
                     whiteSpace: 'nowrap',
                     overflow: 'hidden',
                     textOverflow: 'ellipsis',
                  }}
                  title={loc}
               >
                  {loc || 'Локація не вказана'}
               </Typography>
            </Stack>

            <Divider sx={{ borderColor: 'rgba(255,255,255,0.08)', mb: 1.5 }} />

            {/* Specs row */}
            <Stack direction="row" spacing={1.5} flexWrap="wrap" useFlexGap>
               <Spec icon={<BedRoundedIcon sx={{ fontSize: 18 }} />} label="Кімнат" value={rooms} />
               <Spec icon={<SquareFootRoundedIcon sx={{ fontSize: 18 }} />} label="Площа" value={square_tot ? `${square_tot} м²` : ''} />
               <Spec icon={<LayersRoundedIcon sx={{ fontSize: 18 }} />} label="Поверх" value={floor && floors ? `${floor}/${floors}` : ''} />
            </Stack>
         </Box>
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
            <Typography sx={{ fontSize: 11, opacity: 0.7, lineHeight: 1 }}>{label}</Typography>
            <Typography sx={{ fontSize: 13, fontWeight: 850, lineHeight: 1.15, color: '#fff' }}>
               {value}
            </Typography>
         </Box>
      </Box>
   );
}