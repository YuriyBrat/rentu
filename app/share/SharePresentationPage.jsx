'use client';

import { useEffect, useRef, useState } from 'react';
import {
   Box,
   Stack,
   Typography,
   Button,
   Chip,
   Grid,
   CircularProgress,
   Avatar,
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

function getManagerPhone(manager) {
   const phones = Array.isArray(manager?.phones) ? manager.phones : [];
   const phone = (
      phones.find((phone) => phone?.isPrimary)?.number ||
      phones.find((phone) => phone?.showInPortfolio)?.number ||
      phones.find((phone) => phone?.number)?.number ||
      manager?.phone ||
      ''
   );

   return String(phone).trim();
}

function getTelHref(phone) {
   const cleaned = String(phone || '').replace(/[^\d+]/g, '');
   return cleaned ? `tel:${cleaned}` : '';
}

function getManagerPhoto(manager) {
   const photos = Array.isArray(manager?.photos) ? manager.photos : [];
   const photo = photos.find((item) => item?.isPrimary && item?.showInPortfolio !== false && !item?.isHidden)
      || photos.find((item) => item?.showInPortfolio !== false && !item?.isHidden)
      || manager?.livePhoto;

   return photo?.url || manager?.avatarUrl || manager?.avatar || '';
}

function getYouTubeVideoId(url = '') {
   try {
      const parsed = new URL(url);
      const host = parsed.hostname.replace(/^www\./, '');

      if (host === 'youtu.be') {
         return parsed.pathname.split('/').filter(Boolean)[0] || '';
      }

      if (host.includes('youtube.com')) {
         if (parsed.pathname.startsWith('/embed/')) {
            return parsed.pathname.split('/').filter(Boolean)[1] || '';
         }
         if (parsed.pathname.startsWith('/shorts/')) {
            return parsed.pathname.split('/').filter(Boolean)[1] || '';
         }
         return parsed.searchParams.get('v') || '';
      }
   } catch {
      return '';
   }

   return '';
}

function getMutedVideoPreview(videos = []) {
   const video = videos.find((item) => item?.isMain) || videos[0];
   if (!video?.url) return null;

   const youtubeId = video.platform === 'youtube' ? getYouTubeVideoId(video.url) : '';
   if (youtubeId) {
      return {
         type: 'youtube',
         title: video.title || 'Відеоогляд',
         url: `https://www.youtube.com/embed/${youtubeId}?autoplay=1&mute=1&controls=0&playsinline=1&rel=0&modestbranding=1&loop=1&playlist=${youtubeId}`,
      };
   }

   if (/\.(mp4|webm|ogg)(\?|#|$)/i.test(video.url)) {
      return {
         type: 'video',
         title: video.title || 'Відеоогляд',
         url: video.url,
      };
   }

   return null;
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

function ReactionButton({ item, active, index, onClick }) {
   const [icon, ...labelParts] = item.label.split(' ');
   const label = labelParts.join(' ');

   return (
      <Button
         onClick={onClick}
         sx={{
            borderRadius: 999,
            px: { xs: 1.35, sm: 1.8 },
            py: { xs: 0.9, sm: 1 },
            minWidth: 0,
            color: '#fff',
            border: active
               ? '1px solid rgba(196,181,253,0.82)'
               : '1px solid rgba(255,255,255,0.16)',
            bgcolor: active
               ? 'rgba(139,92,246,0.42)'
               : 'rgba(255,255,255,0.08)',
            fontWeight: 950,
            lineHeight: 1.15,
            textTransform: 'none',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 0.75,
            backdropFilter: 'blur(10px)',
            boxShadow: active
               ? '0 14px 34px rgba(139,92,246,0.30)'
               : '0 10px 24px rgba(0,0,0,0.16)',
            transform: active ? 'translateY(-1px)' : 'translateY(0)',
            transition: 'transform 260ms cubic-bezier(0.16, 1, 0.3, 1), border-color 260ms ease, background-color 260ms ease, box-shadow 260ms ease',
            '&:hover': {
               transform: 'translateY(-2px)',
               borderColor: active ? 'rgba(221,214,254,0.95)' : 'rgba(255,255,255,0.34)',
               bgcolor: active ? 'rgba(139,92,246,0.52)' : 'rgba(255,255,255,0.15)',
               boxShadow: active
                  ? '0 18px 42px rgba(139,92,246,0.36)'
                  : '0 18px 42px rgba(0,0,0,0.24)',
            },
            '&:hover .reaction-icon': {
               animation: 'classicReactionWiggle 900ms cubic-bezier(0.16, 1, 0.3, 1) both',
            },
            '@keyframes classicReactionPulse': {
               '0%, 76%, 100%': { transform: 'translateY(0) scale(1)' },
               '84%': { transform: 'translateY(-1px) scale(1.08)' },
               '92%': { transform: 'translateY(0) scale(1)' },
            },
            '@keyframes classicReactionWiggle': {
               '0%, 100%': { transform: 'rotate(0deg) scale(1)' },
               '25%': { transform: 'rotate(-7deg) scale(1.12)' },
               '50%': { transform: 'rotate(6deg) scale(1.10)' },
               '75%': { transform: 'rotate(-3deg) scale(1.05)' },
            },
            '@media (prefers-reduced-motion: reduce)': {
               transition: 'none',
               transform: 'none',
               '& .reaction-icon': { animation: 'none' },
               '&:hover': { transform: 'none' },
            },
         }}
      >
         <Box
            component="span"
            className="reaction-icon"
            sx={{
               display: 'inline-flex',
               alignItems: 'center',
               justifyContent: 'center',
               fontSize: { xs: 15, sm: 16 },
               lineHeight: 1,
               animation: `classicReactionPulse 4.8s ease-in-out ${index * 220}ms infinite`,
            }}
         >
            {icon}
         </Box>
         <Box component="span" sx={{ whiteSpace: 'nowrap' }}>
            {label}{active ? ' ✓' : ''}
         </Box>
      </Button>
   );
}

function RevealOnScroll({ children, direction = 'up', delay = 0, sx }) {
   const ref = useRef(null);
   const [visible, setVisible] = useState(false);

   useEffect(() => {
      const node = ref.current;
      if (!node) return undefined;

      const observer = new IntersectionObserver(
         ([entry]) => {
            if (entry.isIntersecting) {
               setVisible(true);
               observer.unobserve(entry.target);
            }
         },
         {
            threshold: 0.14,
            rootMargin: '0px 0px -6% 0px',
         }
      );

      observer.observe(node);

      return () => observer.disconnect();
   }, []);

   const hiddenTransform = {
      left: 'translate3d(-28px, 0, 0)',
      right: 'translate3d(28px, 0, 0)',
      up: 'translate3d(0, 22px, 0)',
   }[direction] || 'translate3d(0, 22px, 0)';

   return (
      <Box
         ref={ref}
         sx={{
            opacity: 1,
            transform: visible ? 'translate3d(0, 0, 0)' : hiddenTransform,
            transition: `transform 1080ms cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms`,
            willChange: 'transform',
            '@media (prefers-reduced-motion: reduce)': {
               opacity: 1,
               transform: 'none',
               transition: 'none',
            },
            ...sx,
         }}
      >
         {children}
      </Box>
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
   const mainImage = images?.[0]?.url || '/krm/logo-krm-transparent.png';
   // const mainImage = property.images?.[0]?.url || '/krm/logo-krm-transparent.png';
   const manager = property.assignee;
   const managerName = getEmployeeName(manager);
   const managerPhone = getManagerPhone(manager);
   const managerPhoto = getManagerPhoto(manager);
   const videoPreview = share?.type === 'client'
      ? getMutedVideoPreview(property.propertyVideos || [])
      : null;
   const advantages = Array.isArray(property.advantages)
      ? property.advantages.map((item) => String(item || '').trim()).filter(Boolean)
      : [];

   const reactionItems = [
      { type: 'view', label: '👀 Хочу оглянути' },
      { type: 'like', label: '❤️ Подобається' },
      { type: 'think', label: '🤔 Подумаю' },
      { type: 'call', label: '📞 Передзвоніть' },
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
                <Stack
                   direction="row"
                   alignItems="center"
                   spacing={1.4}
                   sx={{
                      mb: 2,
                      p: 0,
                      width: 'fit-content',
                      maxWidth: '100%',
                      borderRadius: 0,
                      bgcolor: 'transparent',
                      border: 0,
                      backdropFilter: 'none',
                      boxShadow: 'none',
                   }}
                >
                  <Box
                     sx={{
                        flex: '0 0 auto',
                        width: { xs: 176, sm: 210 },
                        minHeight: { xs: 58, sm: 64 },
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        px: { xs: 0.45, sm: 0.6, md: 0.7 },
                        py: { xs: 0.35, sm: 0.45, md: 0.5 },
                        borderRadius: 1.2,
                        bgcolor: 'rgba(255,255,255,0.90)',
                        border: '1px solid rgba(255,255,255,0.35)',
                        boxShadow: '0 12px 28px rgba(0,0,0,0.22)',
                     }}
                  >
                     <Box
                        component="img"
                        src="/krm/logo-krm-transparent.png"
                        alt="Karamax"
                        sx={{
                           display: 'block',
                           width: { xs: 152, sm: 188 },
                           maxWidth: '100%',
                           height: 'auto',
                           objectFit: 'contain',
                           filter: 'none',
                        }}
                     />
                  </Box>
                  <Box sx={{ minWidth: 0 }}>
                     <Typography sx={{ fontWeight: 950, fontSize: { xs: 22, md: 28 }, lineHeight: 1.05, textShadow: '0 3px 18px rgba(0,0,0,0.50)' }}>
                        Презентація об’єкту
                     </Typography>
                     <Typography sx={{ color: 'rgba(255,255,255,0.62)', fontSize: 13, display: 'none' }}>
                        Агентство нерухомості
                     </Typography>
                  </Box>
               </Stack>
            )}



            <Grid container spacing={2.2}>
               <Grid item xs={12} md={7}>
                  <RevealOnScroll direction="left">
                     <Box
                        sx={{
                           position: 'relative',
                           borderRadius: 5,
                           overflow: 'hidden',
                           boxShadow: '0 30px 90px rgba(0,0,0,0.45)',
                           border: '1px solid rgba(255,255,255,0.12)',
                        }}
                     >
                        <Box
                           component="img"
                           src={mainImage}
                           alt={property.title}
                           sx={{
                              display: 'block',
                              width: '100%',
                              height: { xs: 310, md: 520 },
                              objectFit: 'cover',
                              cursor: 'zoom-in',
                           }}
                           onClick={() => {
                              setPhotoIndex(0);
                              setPhotoOpen(true);
                           }}
                        />

                        {videoPreview && (
                           <Box
                              sx={{
                                 position: 'absolute',
                                 right: { xs: 10, sm: 16 },
                                 bottom: { xs: 10, sm: 16 },
                                 width: { xs: 132, sm: 190, md: 230 },
                                 aspectRatio: '16 / 9',
                                 borderRadius: { xs: 2, md: 2.5 },
                                 overflow: 'hidden',
                                 bgcolor: 'rgba(15,23,42,0.84)',
                                 border: '1px solid rgba(255,255,255,0.22)',
                                 boxShadow: '0 18px 44px rgba(0,0,0,0.38)',
                                 pointerEvents: 'auto',
                              }}
                           >
                              {videoPreview.type === 'youtube' ? (
                                 <Box
                                    component="iframe"
                                    src={videoPreview.url}
                                    title={videoPreview.title}
                                    loading="lazy"
                                    allow="autoplay; encrypted-media; picture-in-picture; web-share"
                                    referrerPolicy="strict-origin-when-cross-origin"
                                    sx={{
                                       display: 'block',
                                       width: '100%',
                                       height: '100%',
                                       border: 0,
                                    }}
                                 />
                              ) : (
                                 <Box
                                    component="video"
                                    src={videoPreview.url}
                                    autoPlay
                                    muted
                                    loop
                                    playsInline
                                    sx={{
                                       display: 'block',
                                       width: '100%',
                                       height: '100%',
                                       objectFit: 'cover',
                                    }}
                                 />
                              )}
                           </Box>
                        )}
                     </Box>
                  </RevealOnScroll>
               </Grid>

               <Grid item xs={12} md={5}>
                  <RevealOnScroll direction="right" delay={100}>
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
                               p: 1.3,
                               borderRadius: 2,
                               bgcolor: 'rgba(255,255,255,0.07)',
                               border: '1px solid rgba(255,255,255,0.12)',
                            }}
                         >
                            <Stack direction="row" alignItems="center" spacing={1.4}>
                               <Avatar
                                  src={managerPhoto}
                                  alt={managerName || 'Manager'}
                                  sx={{
                                     width: 54,
                                     height: 54,
                                     bgcolor: '#c4b5fd',
                                     color: '#0b0b12',
                                     fontWeight: 1000,
                                     flex: '0 0 auto',
                                  }}
                               >
                                  {(managerName || 'K').slice(0, 1)}
                               </Avatar>

                               <Box sx={{ minWidth: 0 }}>
                                  <Typography sx={{ fontWeight: 950, mb: 0.2 }}>
                                     Ваш менеджер
                                  </Typography>

                                  <Typography sx={{ color: 'rgba(255,255,255,0.84)', fontSize: 17, lineHeight: 1.25 }}>
                                     {managerName}
                                  </Typography>

                                  {!!managerPhone && (
                                     <Button
                                        component="a"
                                        href={getTelHref(managerPhone)}
                                        startIcon={<PhoneRoundedIcon />}
                                        sx={{
                                           mt: 0.6,
                                           p: 0,
                                           minWidth: 0,
                                           color: '#c4b5fd',
                                           fontWeight: 950,
                                           textTransform: 'none',
                                           '&:hover': {
                                              bgcolor: 'transparent',
                                              color: '#ddd6fe',
                                              textDecoration: 'underline',
                                           },
                                        }}
                                     >
                                        {managerPhone}
                                     </Button>
                                  )}
                               </Box>
                            </Stack>

                            <Typography sx={{ fontWeight: 950, mb: 0.5, display: 'none' }}>
                              Ваш менеджер
                           </Typography>

                            <Typography sx={{ color: 'rgba(255,255,255,0.72)', display: 'none' }}>
                              {getEmployeeName(manager)}
                           </Typography>

                           {!!manager.phone && (
                               <Stack direction="row" spacing={1} sx={{ mt: 1, display: 'none' }}>
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
                  </RevealOnScroll>
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
                     <RevealOnScroll direction="up" delay={170}>
                        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mt: 1 }}>
                        {reactionItems.map((r, index) => {
                           const active = selectedReaction === r.type;

                           return (
                              <ReactionButton
                                 key={r.type}
                                  item={r}
                                  active={active}
                                  index={index}
                                  onClick={() => handleReaction(r.type)}
                              />
                           );
                        })}
                        </Stack>
                     </RevealOnScroll>
                  </Grid>
               </Grid>

               {!!advantages.length && (
                  <Grid item xs={12}>
                     <RevealOnScroll direction="up" delay={110}>
                        <Box
                           sx={{
                              mt: 1,
                              p: { xs: 1.6, md: 2.4 },
                              borderRadius: { xs: 3, md: 5 },
                              bgcolor: 'rgba(255,255,255,0.055)',
                              border: '1px solid rgba(255,255,255,0.10)',
                              boxShadow: '0 18px 55px rgba(0,0,0,0.18)',
                           }}
                        >
                           <Box
                              sx={{
                                 display: 'grid',
                                 gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))', md: 'repeat(3, minmax(0, 1fr))' },
                                 gap: { xs: 0.75, md: 1 },
                              }}
                           >
                              {advantages.map((item, index) => (
                                 <Stack
                                    key={`${item}-${index}`}
                                    direction="row"
                                    alignItems="flex-start"
                                    spacing={0.9}
                                    sx={{
                                       minWidth: 0,
                                       p: { xs: 1.05, md: 1.25 },
                                       borderRadius: { xs: 2.2, md: 3 },
                                       bgcolor: 'rgba(196,181,253,0.07)',
                                       border: '1px solid rgba(196,181,253,0.14)',
                                    }}
                                 >
                                    <Box
                                       component="span"
                                       sx={{
                                          flex: '0 0 auto',
                                          width: 18,
                                          color: '#c4b5fd',
                                          fontWeight: 1000,
                                          lineHeight: 1.45,
                                       }}
                                    >
                                       ✓
                                    </Box>
                                    <Typography
                                       sx={{
                                          minWidth: 0,
                                          color: 'rgba(255,255,255,0.86)',
                                          fontWeight: 850,
                                          lineHeight: 1.42,
                                          fontSize: { xs: 14.5, md: 15.5 },
                                       }}
                                    >
                                       {item}
                                    </Typography>
                                 </Stack>
                              ))}
                           </Box>
                        </Box>
                     </RevealOnScroll>
                  </Grid>
               )}

               {!!property.description && (
                  <Grid item xs={12}>
                     <RevealOnScroll direction="up" delay={120}>
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
                           <Typography
                              sx={{
                                 color: 'rgba(255,255,255,0.76)',
                                 lineHeight: 1.7,
                                 fontSize: { xs: 15.5, md: 16.5 },
                                 whiteSpace: 'pre-line',
                              }}
                           >
                              {property.description}
                           </Typography>
                        </Box>
                     </RevealOnScroll>
                  </Grid>
               )}

               {!!property.images?.length && (
                  <Grid item xs={12}>
                     <Grid container spacing={1.2}>
                        {property.images.slice(1).map((img, idx) => (
                           <Grid item xs={6} md={3} key={`${img.url}-${idx}`}>
                              <RevealOnScroll direction="up" delay={Math.min(idx, 8) * 45}>
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
                                       cursor: 'zoom-in',
                                    }}
                                    onClick={() => {
                                       setPhotoIndex(idx + 1);
                                       setPhotoOpen(true);
                                    }}
                                 />
                              </RevealOnScroll>
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
