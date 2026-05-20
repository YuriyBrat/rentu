'use client';

import { useEffect, useState } from 'react';
import {
   Box,
   Stack,
   Typography,
   Button,
   Chip,
   Grid,
   CircularProgress,
} from '@mui/material';

import PhoneRoundedIcon from '@mui/icons-material/PhoneRounded';
import TelegramIcon from '@mui/icons-material/Telegram';
import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import SquareFootRoundedIcon from '@mui/icons-material/SquareFootRounded';
import BedRoundedIcon from '@mui/icons-material/BedRounded';
import ApartmentRoundedIcon from '@mui/icons-material/ApartmentRounded';

import PropertyLandingPresentation from './PropertyLandingPresentation';

import ImageLightbox from '../../crm_components/ImageLightbox';

function formatMoney(value, currency = 'USD') {
   if (!value) return 'Ціна не вказана';
   return `${Number(value).toLocaleString('uk-UA')} ${currency}`;
}

function getEmployeeName(employee) {
   if (!employee) return '';
   return (
      employee.fullName ||
      [employee.surname, employee.name].filter(Boolean).join(' ') ||
      employee.name ||
      ''
   );
}

function InfoChip({ icon, label }) {
   return (
      <Chip
         icon={icon}
         label={label}
         sx={{
            borderRadius: 999,
            bgcolor: 'rgba(255,255,255,0.08)',
            color: '#fff',
            border: '1px solid rgba(255,255,255,0.12)',
            fontWeight: 800,
            '& .MuiChip-icon': { color: '#c4b5fd' },
         }}
      />
   );
}





export default function SharePresentationPage({ slug }) {
   const [data, setData] = useState(null);
   const [loading, setLoading] = useState(true);

   const [photoOpen, setPhotoOpen] = useState(false);
   const [photoIndex, setPhotoIndex] = useState(0);

   const [selectedReaction, setSelectedReaction] = useState(null);

   // const handleReaction = async (type) => {
   //    await fetch(`/api/public/property-share/${slug}/reaction`, {
   //       method: 'POST',
   //       headers: { 'Content-Type': 'application/json' },
   //       body: JSON.stringify({ type }),
   //    });
   // };

   const getClientId = () => {
      const key = 'karamax-share-client-id';
      let id = localStorage.getItem(key);

      if (!id) {
         id = crypto.randomUUID();
         localStorage.setItem(key, id);
      }

      return id;
   };

   const handleReaction = async (type) => {
      setSelectedReaction(type);
      localStorage.setItem(`share-reaction-${slug}`, type);

      await fetch(`/api/public/property-share/${slug}/reaction`, {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({
            type,
            clientId: getClientId(),
         }),
      });
   };



   useEffect(() => {
      const load = async () => {
         try {
            const res = await fetch(`/api/public/property-share/${slug}`, {
               cache: 'no-store',
            });
            const json = await res.json();

            if (res.ok) setData(json);

            const saved = localStorage.getItem(`share-reaction-${slug}`);
            if (saved) setSelectedReaction(saved);
         } finally {
            setLoading(false);
         }
      };

      load();
   }, [slug]);

   if (loading) {
      return (
         <Box
            sx={{
               minHeight: '100vh',
               display: 'flex',
               alignItems: 'center',
               justifyContent: 'center',
               bgcolor: '#0f0f17',
            }}
         >
            <CircularProgress />
         </Box>
      );
   };



   if (!data?.property) {
      return (
         <Box
            sx={{
               minHeight: '100vh',
               display: 'flex',
               alignItems: 'center',
               justifyContent: 'center',
               bgcolor: '#0f0f17',
               color: '#fff',
            }}
         >
            <Typography variant="h5" fontWeight={900}>
               Презентацію не знайдено
            </Typography>
         </Box>
      );
   }

   const { property, share } = data;

   if (share?.presentationType === 'landing' || share?.viewType === 'landing') {
      return <PropertyLandingPresentation slug={slug} />;
   }

   const images = property.images || [];
   const mainImage = images?.[0]?.url || '/krm/logo-krm.png';
   // const mainImage = property.images?.[0]?.url || '/krm/logo-krm.png';
   const manager = property.assignee;

   const reactionItems = [
      { type: 'view', label: '👀 Хочу оглянути' },
      { type: 'like', label: '❤️ Подобається' },
      { type: 'think', label: '🤔 Подумаю' },
      { type: 'reject', label: '🙅 Не моє' },
   ];


   return (
      <Box
         sx={{
            minHeight: '100vh',
            bgcolor: '#0f0f17',
            color: '#fff',
            background:
               'radial-gradient(circle at 15% 10%, rgba(139,92,246,0.28), transparent 35%), radial-gradient(circle at 85% 20%, rgba(59,130,246,0.14), transparent 35%), #0f0f17',
         }}
      >
         <Box sx={{ maxWidth: 1180, mx: 'auto', px: { xs: 2, md: 3 }, py: 3 }}>
            {share.showBrand && (
               <Stack direction="row" alignItems="center" spacing={1.2} sx={{ mb: 2 }}>
                  <Box
                     component="img"
                     src="/krm/logo-krm.png"
                     alt="Karamax"
                     sx={{ width: 80, height: 80, objectFit: 'contain' }}
                  />
                  <Box>
                     <Typography sx={{ fontWeight: 950, fontSize: 20 }}>
                        Karamax
                     </Typography>
                     <Typography sx={{ color: 'rgba(255,255,255,0.62)', fontSize: 13 }}>
                        презентація об’єкту нерухомості
                     </Typography>
                  </Box>
               </Stack>
            )}



            <Grid container spacing={2.2}>
               <Grid item xs={12} md={7}>
                  <Box
                     component="img"
                     src={mainImage}
                     alt={property.title}
                     sx={{
                        width: '100%',
                        height: { xs: 310, md: 520 },
                        objectFit: 'cover',
                        borderRadius: 5,
                        border: '1px solid rgba(255,255,255,0.12)',
                        boxShadow: '0 30px 90px rgba(0,0,0,0.45)',
                        cursor: 'zoom-in',
                     }}
                     onClick={() => {
                        setPhotoIndex(0);
                        setPhotoOpen(true);
                     }}
                  />
               </Grid>

               <Grid item xs={12} md={5}>
                  <Stack spacing={1.4}>
                     <Chip
                        label="Продаж"
                        sx={{
                           alignSelf: 'flex-start',
                           bgcolor: 'rgba(139,92,246,0.18)',
                           color: '#ddd6fe',
                           border: '1px solid rgba(139,92,246,0.3)',
                           fontWeight: 900,
                        }}
                     />

                     <Typography
                        sx={{
                           fontSize: { xs: 28, md: 38 },
                           fontWeight: 950,
                           lineHeight: 1.05,
                        }}
                     >
                        {property.title}
                     </Typography>

                     <Typography sx={{ color: 'rgba(255,255,255,0.66)', fontSize: 16 }}>
                        {property.location_text}
                     </Typography>

                     <Typography sx={{ fontSize: 34, fontWeight: 950, color: '#c4b5fd' }}>
                        {formatMoney(property.price, property.currency)}
                     </Typography>


                     <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                        <InfoChip
                           icon={<BedRoundedIcon />}
                           label={`${property.rooms || '—'} кімнат`}
                        />
                        <InfoChip
                           icon={<SquareFootRoundedIcon />}
                           label={`${property.square_tot || '—'} м²`}
                        />
                        <InfoChip
                           icon={<ApartmentRoundedIcon />}
                           label={`${property.floor || '—'} / ${property.floors || '—'} поверх`}
                        />
                        <InfoChip
                           icon={<HomeRoundedIcon />}
                           label={property.type_building || 'Об’єкт'}
                        />
                     </Stack>


                     {share.showManagerContact && manager && (
                        <Box
                           sx={{
                              mt: 1,
                              p: 1.5,
                              borderRadius: 4,
                              bgcolor: 'rgba(255,255,255,0.06)',
                              border: '1px solid rgba(255,255,255,0.10)',
                           }}
                        >
                           <Typography sx={{ fontWeight: 950, mb: 0.5 }}>
                              Ваш менеджер
                           </Typography>

                           <Typography sx={{ color: 'rgba(255,255,255,0.72)' }}>
                              {getEmployeeName(manager)}
                           </Typography>

                           {!!manager.phone && (
                              <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                                 <Button
                                    href={`tel:${manager.phone}`}
                                    startIcon={<PhoneRoundedIcon />}
                                    sx={{
                                       borderRadius: 999,
                                       color: '#0b0b12',
                                       fontWeight: 950,
                                       bgcolor: '#c4b5fd',
                                       '&:hover': { bgcolor: '#ddd6fe' },
                                    }}
                                 >
                                    Подзвонити
                                 </Button>

                                 <Button
                                    href={`https://t.me/${manager.phone}`}
                                    target="_blank"
                                    startIcon={<TelegramIcon />}
                                    sx={{
                                       borderRadius: 999,
                                       color: '#fff',
                                       fontWeight: 950,
                                       border: '1px solid rgba(255,255,255,0.18)',
                                    }}
                                 >
                                    Telegram
                                 </Button>
                              </Stack>
                           )}
                        </Box>
                     )}
                  </Stack>
               </Grid>

               <Grid item xs={12}>

                  {/* <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mt: 1 }}>
                     
                     {reactions.map((r) => (
                        <Button
                           key={r.type}
                           sx={{
                              borderRadius: 999,
                              px: 2,
                              py: 1,
                              color: '#fff',
                              border: '1px solid rgba(255,255,255,0.16)',
                              bgcolor: 'rgba(255,255,255,0.08)',
                              fontWeight: 950,
                           }}
                           onClick={() => handleReaction(r.type)}>
                           {r.label}
                        </Button>
                     ))}
                  </Stack> */}
                  <Grid item xs={12}>
                     <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mt: 1 }}>
                        {reactionItems.map((r) => {
                           const active = selectedReaction === r.type;

                           return (
                              <Button
                                 key={r.type}
                                 onClick={() => handleReaction(r.type)}
                                 sx={{
                                    borderRadius: 999,
                                    px: 2,
                                    py: 1,
                                    color: '#fff',
                                    border: active
                                       ? '1px solid rgba(196,181,253,0.85)'
                                       : '1px solid rgba(255,255,255,0.16)',
                                    bgcolor: active
                                       ? 'rgba(139,92,246,0.55)'
                                       : 'rgba(255,255,255,0.08)',
                                    fontWeight: 950,
                                    transform: active ? 'translateY(-1px)' : 'none',
                                    boxShadow: active
                                       ? '0 12px 35px rgba(139,92,246,0.35)'
                                       : 'none',
                                 }}
                              >
                                 {active ? `${r.label} ✓` : r.label}
                              </Button>
                           );
                        })}
                     </Stack>
                  </Grid>
               </Grid>

               {!!property.description && (
                  <Grid item xs={12}>
                     <Box
                        sx={{
                           mt: 1,
                           p: { xs: 2, md: 3 },
                           borderRadius: 5,
                           bgcolor: 'rgba(255,255,255,0.055)',
                           border: '1px solid rgba(255,255,255,0.10)',
                        }}
                     >
                        <Typography sx={{ fontSize: 22, fontWeight: 950, mb: 1 }}>
                           Опис
                        </Typography>
                        <Typography sx={{ color: 'rgba(255,255,255,0.76)', lineHeight: 1.7 }}>
                           {property.description}
                        </Typography>
                     </Box>
                  </Grid>
               )}

               {!!property.images?.length && (
                  <Grid item xs={12}>
                     <Grid container spacing={1.2}>
                        {property.images.slice(1, 9).map((img, idx) => (
                           <Grid item xs={6} md={3} key={`${img.url}-${idx}`}>
                              <Box
                                 component="img"
                                 src={img.url}
                                 alt=""
                                 sx={{
                                    width: '100%',
                                    height: 170,
                                    objectFit: 'cover',
                                    borderRadius: 3,
                                    border: '1px solid rgba(255,255,255,0.10)',
                                 }}
                                 onClick={() => {
                                    setPhotoIndex(idx + 1);
                                    setPhotoOpen(true);
                                 }}
                              />
                           </Grid>
                        ))}
                     </Grid>
                  </Grid>
               )}
            </Grid>
         </Box>


         <ImageLightbox
            open={photoOpen}
            images={images}
            index={photoIndex}
            onClose={() => setPhotoOpen(false)}
            onChangeIndex={setPhotoIndex}
         />

      </Box>
   );
}