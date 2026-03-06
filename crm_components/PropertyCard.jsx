'use client';

import {
   Box,
   Typography,
   Stack,
   Chip,
   Divider,
} from '@mui/material';

export default function PropertyCard({ property }) {
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
   } = property;

   return (
      <Box
         sx={{
            p: 2.5,
            borderRadius: 3,
            background: 'rgba(255,255,255,0.02)',
            border: '1px solid rgba(255,255,255,0.06)',
            transition: 'all 0.25s ease',
            '&:hover': {
               transform: 'translateY(-4px)',
               boxShadow: '0 20px 40px rgba(0,0,0,0.45)',
               borderColor: 'rgba(139,92,246,0.4)',
            },
         }}
      >
         <Stack spacing={1.5}>
            {/* Тип + угода */}
            <Stack direction="row" spacing={1}>
               <Chip label={type_estate} size="small" />
               <Chip label={type_deal} size="small" color="secondary" />
            </Stack>

            {/* Назва */}
            <Typography variant="h6" fontWeight={800}>
               {title}
            </Typography>

            {/* Локація */}
            <Typography variant="body2" sx={{ opacity: 0.7 }}>
               {location?.city}, {location?.street} {location?.number}
            </Typography>

            <Divider sx={{ opacity: 0.15 }} />

            {/* Характеристики */}
            <Stack direction="row" spacing={2} flexWrap="wrap">
               {rooms && <Typography variant="body2">Кімнат: {rooms}</Typography>}
               {square_tot && <Typography variant="body2">Площа: {square_tot} м²</Typography>}
               {floor && floors && (
                  <Typography variant="body2">
                     Поверх: {floor}/{floors}
                  </Typography>
               )}
            </Stack>

            {/* Ціна */}
            <Typography
               variant="h6"
               sx={{
                  mt: 1,
                  fontWeight: 900,
                  color: '#8b5cf6',
               }}
            >
               {cost?.toLocaleString()} {currency}
            </Typography>
         </Stack>
      </Box>
   );
}