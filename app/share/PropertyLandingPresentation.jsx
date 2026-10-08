'use client';

import { useState, useEffect, useRef } from 'react';

import {
   Box,
   Stack,
   Typography,
   Grid,
   Button,
   Divider,
   CircularProgress,
   Avatar,
} from '@mui/material';

import BedRoundedIcon from '@mui/icons-material/BedRounded';
import SquareFootRoundedIcon from '@mui/icons-material/SquareFootRounded';
import ApartmentRoundedIcon from '@mui/icons-material/ApartmentRounded';
import LocationOnRoundedIcon from '@mui/icons-material/LocationOnRounded';
import PhoneRoundedIcon from '@mui/icons-material/PhoneRounded';
import FavoriteRoundedIcon from '@mui/icons-material/FavoriteRounded';
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded';

import ImageLightbox from '../../crm_components/ImageLightbox';

function getEmployeeName(employee) {
   if (!employee) return '';
   return (
      employee.fullName ||
      [employee.surname, employee.name].filter(Boolean).join(' ') ||
      employee.name ||
      ''
   );
}

function normalizePhone(phone) {
   if (!phone) return '';
   return String(phone).trim();
}

function getManagerPhone(manager) {
   const phones = Array.isArray(manager?.phones) ? manager.phones : [];
   const phone = phones.find((x) => x?.isPrimary)?.number
      || phones.find((x) => x?.showInPortfolio)?.number
      || phones.find((x) => x?.number)?.number
      || manager?.phone
      || '';

   return normalizePhone(phone);
}

function getTelHref(phone) {
   const cleaned = normalizePhone(phone).replace(/[^\d+]/g, '');
   return cleaned ? `tel:${cleaned}` : '';
}

function getManagerPhoto(manager) {
   const photos = Array.isArray(manager?.photos) ? manager.photos : [];
   const photo = photos.find((x) => x?.isPrimary && x?.showInPortfolio !== false && !x?.isHidden)
      || photos.find((x) => x?.showInPortfolio !== false && !x?.isHidden)
      || manager?.livePhoto;

   return photo?.url || manager?.avatarUrl || manager?.avatar || '';
}

function getYouTubeEmbedUrl(url = '') {
   try {
      const parsed = new URL(url);
      const host = parsed.hostname.replace(/^www\./, '');
      let id = '';

      if (host === 'youtu.be') {
         id = parsed.pathname.split('/').filter(Boolean)[0] || '';
      } else if (host.includes('youtube.com')) {
         if (parsed.pathname.startsWith('/embed/')) {
            id = parsed.pathname.split('/').filter(Boolean)[1] || '';
         } else if (parsed.pathname.startsWith('/shorts/')) {
            id = parsed.pathname.split('/').filter(Boolean)[1] || '';
         } else {
            id = parsed.searchParams.get('v') || '';
         }
      }

      return id ? `https://www.youtube.com/embed/${id}` : '';
   } catch {
      return '';
   }
}

function getClientId() {
   if (typeof window === 'undefined') return 'unknown';

   const key = 'karamax-share-client-id';
   let id = localStorage.getItem(key);

   if (!id) {
      id = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
      localStorage.setItem(key, id);
   }

   return id;
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
            threshold: 0.18,
            rootMargin: '0px 0px -8% 0px',
         }
      );

      observer.observe(node);

      return () => observer.disconnect();
   }, []);

   const hiddenTransform = {
      left: 'translate3d(-30px, 0, 0)',
      right: 'translate3d(30px, 0, 0)',
      up: 'translate3d(0, 22px, 0)',
   }[direction] || 'translate3d(0, 28px, 0)';

   return (
      <Box
         ref={ref}
         sx={{
            opacity: 1,
            transform: visible ? 'translate3d(0, 0, 0)' : hiddenTransform,
            transition: `transform 1120ms cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms`,
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

function InfoPill({ icon, label }) {
   return (
      <Stack
         direction="row"
         spacing={0.8}
         alignItems="center"
         sx={{
            px: 1.6,
            py: 0.9,
            borderRadius: 999,
            bgcolor: 'rgba(255,255,255,0.08)',
            border: '1px solid rgba(255,255,255,0.12)',
            backdropFilter: 'blur(10px)',
         }}
      >
         {icon}

         <Typography
            sx={{
               fontSize: 13,
               fontWeight: 800,
               color: '#fff',
            }}
         >
            {label}
         </Typography>
      </Stack>
   );
}

function StorySection({
   title,
   text,
   image,
   media,
   children,
   reverse,
   onImageClick,
}) {
   if (!image?.url && !media) return null;

   return (
      <Grid
         container
         spacing={4}
         alignItems="center"
         sx={{
            mt: { xs: 4, md: 8 },
            flexDirection: { xs: 'column', md: reverse ? 'row-reverse' : 'row' },
         }}
      >
         <Grid item xs={12} md={6}>
            <RevealOnScroll direction={reverse ? 'right' : 'left'}>
               {media || (
                  <Box
                     component="img"
                     src={image.url}
                     onClick={onImageClick}
                     sx={{
                        width: '100%',
                        height: { xs: 280, md: 470 },
                        objectFit: 'cover',
                        borderRadius: 6,
                        cursor: 'zoom-in',
                        border: '1px solid rgba(255,255,255,0.10)',
                        boxShadow: '0 30px 90px rgba(0,0,0,0.42)',
                     }}
                  />
               )}
            </RevealOnScroll>
         </Grid>

         <Grid item xs={12} md={6}>
            <RevealOnScroll direction={reverse ? 'left' : 'right'} delay={90}>
               <Typography
                  sx={{
                     fontSize: { xs: 28, md: 46 },
                     fontWeight: 1000,
                     lineHeight: 1.05,
                  }}
               >
                  {title}
               </Typography>

               {children || (
                  <Typography
                     sx={{
                        mt: 2,
                        color: 'rgba(255,255,255,0.72)',
                        lineHeight: 1.9,
                        fontSize: 16,
                        whiteSpace: 'pre-line',
                     }}
                  >
                     {text}
                  </Typography>
               )}
            </RevealOnScroll>
         </Grid>
      </Grid>
   );
}

function VideoSection({ videos = [] }) {
   const mainVideo = videos.find((v) => v.isMain) || videos[0];

   if (!mainVideo) return null;

   const embedUrl = mainVideo.platform === 'youtube'
      ? getYouTubeEmbedUrl(mainVideo.url)
      : '';

   return (
      <Box sx={{ mt: { xs: 5, md: 10 } }}>
         <Typography
            sx={{
               fontSize: { xs: 28, md: 42 },
               fontWeight: 1000,
               mb: 1,
            }}
         >
            🎬 Відеоогляд
         </Typography>

         <Typography
            sx={{
               color: 'rgba(255,255,255,0.68)',
               mb: 3,
               maxWidth: 760,
               lineHeight: 1.8,
            }}
         >
            Короткий огляд об’єкта, атмосфери, планування та основних переваг.
         </Typography>

         {embedUrl ? (
            <Box
               component="iframe"
               src={embedUrl}
               title={mainVideo.title || 'Property video'}
               loading="lazy"
               allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
               referrerPolicy="strict-origin-when-cross-origin"
               allowFullScreen
               sx={{
                  width: '100%',
                  maxWidth: 980,
                  aspectRatio: '16 / 9',
                  height: 'auto',
                  border: 0,
                  borderRadius: 3,
                  overflow: 'hidden',
                  boxShadow: '0 30px 90px rgba(0,0,0,0.45)',
               }}
            />
         ) : (
            <Button
               component="a"
               href={mainVideo.url}
               target="_blank"
               sx={{
                  borderRadius: 999,
                  px: 3,
                  py: 1.2,
                  fontWeight: 1000,
                  color: '#0b0b12',
                  background:
                     'linear-gradient(90deg, #c4b5fd, #8b5cf6)',
               }}
            >
               Дивитись відео
            </Button>
         )}
      </Box>
   );
}

function VideoFrame({ videos = [] }) {
   const mainVideo = videos.find((v) => v.isMain) || videos[0];

   if (!mainVideo) return null;

   const embedUrl = mainVideo.platform === 'youtube'
      ? getYouTubeEmbedUrl(mainVideo.url)
      : '';

   if (embedUrl) {
      return (
         <Box
            component="iframe"
            src={embedUrl}
            title={mainVideo.title || 'Property video'}
            loading="lazy"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
            sx={{
               width: '100%',
               aspectRatio: '16 / 9',
               border: 0,
               borderRadius: 4,
               overflow: 'hidden',
               boxShadow: '0 30px 90px rgba(0,0,0,0.45)',
            }}
         />
      );
   }

   return (
      <Button
         component="a"
         href={mainVideo.url}
         target="_blank"
         sx={{
            borderRadius: 999,
            px: 3,
            py: 1.2,
            fontWeight: 1000,
            color: '#0b0b12',
            background: 'linear-gradient(90deg, #c4b5fd, #8b5cf6)',
         }}
      >
         Дивитись відео
      </Button>
   );
}

function AdvantagesStoryList({ advantages = [] }) {
   return (
      <Stack spacing={1.2} sx={{ mt: 2 }}>
         {advantages.map((item, idx) => (
            <Box
               key={`${item}-${idx}`}
               sx={{
                  px: 2.1,
                  py: 1.45,
                  borderRadius: 3,
                  border: '1px solid rgba(255,255,255,0.10)',
                  bgcolor: 'rgba(255,255,255,0.045)',
               }}
            >
               <Typography sx={{ fontWeight: 900, lineHeight: 1.55 }}>
                  ✓ {item}
               </Typography>
            </Box>
         ))}
      </Stack>
   );
}

function ManagerContactCard({ manager, compact = false, header = false }) {
   const name = getEmployeeName(manager);
   const phone = getManagerPhone(manager);
   const telHref = getTelHref(phone);
   const photo = getManagerPhoto(manager);

   if (!manager && !phone) return null;

   return (
      <Stack
         direction="row"
         spacing={header ? 1 : 1.5}
         alignItems="center"
         sx={{
            mt: header ? 0 : compact ? 3 : 4,
            p: header ? { xs: 0.55, sm: 0.7, md: 0.8 } : compact ? 1.5 : 2,
            width: header ? { xs: '100%', sm: 210, md: 232 } : 'fit-content',
            minHeight: header ? { xs: 58, sm: 64, md: 72 } : 'auto',
            maxWidth: '100%',
            minWidth: 0,
            borderRadius: header ? 1.2 : 3,
            bgcolor: header ? 'rgba(10,14,22,0.46)' : 'rgba(255,255,255,0.08)',
            border: header ? '1px solid rgba(255,255,255,0.16)' : '1px solid rgba(255,255,255,0.14)',
            backdropFilter: 'blur(12px)',
            boxShadow: header ? '0 14px 34px rgba(0,0,0,0.22)' : 'none',
         }}
      >
         <Avatar
            src={photo}
            alt={name || 'Manager'}
            sx={{
               width: header ? { xs: 38, sm: 42, md: 46 } : compact ? 54 : 68,
               height: header ? { xs: 38, sm: 42, md: 46 } : compact ? 54 : 68,
               bgcolor: '#c4b5fd',
               color: '#0b0b12',
               fontWeight: 1000,
               flex: '0 0 auto',
            }}
         >
            {(name || 'K').slice(0, 1)}
         </Avatar>

         <Box sx={{ minWidth: 0 }}>
            <Typography
               sx={{
                  color: header ? 'rgba(255,255,255,0.76)' : 'rgba(255,255,255,0.62)',
                  fontSize: header ? 10 : 12,
                  fontWeight: 900,
                  display: { xs: header ? 'none' : 'block', sm: 'block' },
               }}
            >
               Ваш менеджер
            </Typography>

            <Typography
               sx={{
                  fontWeight: 1000,
                  fontSize: header ? { xs: 13, sm: 14, md: 15 } : compact ? 17 : 20,
                  maxWidth: header ? { xs: 92, sm: 132, md: 150 } : 'none',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
               }}
            >
               {name || 'Karamax'}
            </Typography>

            {phone && (
               <Button
                  component="a"
                  href={telHref}
                  startIcon={<PhoneRoundedIcon />}
                  sx={{
                     mt: header ? 0 : 0.8,
                     px: 0,
                     minWidth: 0,
                     color: '#c4b5fd',
                     fontWeight: 1000,
                     fontSize: header ? { xs: 12.5, sm: 13.5, md: 14 } : 15,
                     textTransform: 'none',
                     lineHeight: 1.1,
                     '&:hover': {
                        bgcolor: 'transparent',
                        color: '#ddd6fe',
                        textDecoration: 'underline',
                     },
                  }}
               >
                  {phone}
               </Button>
            )}
         </Box>
      </Stack>
   );
}

function ReactionButtonGrid({ items, selectedReaction, onReaction, compact = false }) {
   return (
      <Box
         sx={{
            display: 'grid',
             gridTemplateColumns: {
                xs: 'repeat(2, minmax(0, 1fr))',
                sm: compact ? 'repeat(3, minmax(0, 170px))' : 'repeat(3, minmax(0, 1fr))',
                md: compact ? 'repeat(3, minmax(0, 190px))' : 'repeat(5, minmax(0, 180px))',
             },
             gap: { xs: 1, sm: 1.2 },
             mt: compact ? 2.5 : { xs: 3, md: 5 },
             width: { xs: '100%', sm: compact ? 'fit-content' : '100%' },
             maxWidth: compact ? 620 : 980,
         }}
      >
         {items.map((reaction, idx) => {
            const [icon, ...labelParts] = reaction.label.split(' ');
            const text = labelParts.join(' ');

            return (
            <Button
               key={reaction.type}
               onClick={() => onReaction(reaction.type)}
               sx={{
                  minWidth: 0,
                  width: '100%',
                  borderRadius: 999,
                  px: { xs: 0.75, sm: 1.05, md: 1.15 },
                  py: { xs: 0.95, sm: 1.05 },
                  color: '#fff',
                  border: '1px solid rgba(255,255,255,0.16)',
                  bgcolor: selectedReaction === reaction.type
                     ? 'rgba(196,181,253,0.30)'
                     : 'rgba(255,255,255,0.10)',
                  backdropFilter: 'blur(10px)',
                  boxShadow: selectedReaction === reaction.type
                     ? '0 14px 34px rgba(139,92,246,0.24)'
                     : '0 10px 26px rgba(0,0,0,0.18)',
                  fontWeight: 1000,
                  fontSize: { xs: 13, sm: 13.5, md: 14 },
                  lineHeight: 1.15,
                  whiteSpace: 'nowrap',
                  textTransform: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 0.75,
                  transition: 'transform 260ms cubic-bezier(0.16, 1, 0.3, 1), border-color 260ms ease, background-color 260ms ease, box-shadow 260ms ease',
                  '&:hover': {
                     transform: 'translateY(-2px)',
                     borderColor: 'rgba(255,255,255,0.34)',
                     bgcolor: selectedReaction === reaction.type
                        ? 'rgba(196,181,253,0.38)'
                        : 'rgba(255,255,255,0.16)',
                     boxShadow: '0 18px 42px rgba(0,0,0,0.26)',
                  },
                  '&:hover .reaction-icon': {
                     animation: 'reactionIconWiggle 900ms cubic-bezier(0.16, 1, 0.3, 1) both',
                  },
                  '@keyframes reactionIconPulse': {
                     '0%, 76%, 100%': { transform: 'translateY(0) scale(1)' },
                     '84%': { transform: 'translateY(-1px) scale(1.08)' },
                     '92%': { transform: 'translateY(0) scale(1)' },
                  },
                  '@keyframes reactionIconWiggle': {
                     '0%, 100%': { transform: 'rotate(0deg) scale(1)' },
                     '25%': { transform: 'rotate(-7deg) scale(1.12)' },
                     '50%': { transform: 'rotate(6deg) scale(1.10)' },
                     '75%': { transform: 'rotate(-3deg) scale(1.05)' },
                  },
                  '@media (prefers-reduced-motion: reduce)': {
                     transition: 'none',
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
                     animation: `reactionIconPulse 4.8s ease-in-out ${idx * 220}ms infinite`,
                  }}
               >
                  {icon}
               </Box>
               <Box component="span" sx={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {text}
               </Box>
            </Button>
            );
         })}
      </Box>
   );
}

export default function PropertyLandingPresentation({
   slug
}) {

   const [data, setData] = useState(null);
   const [loading, setLoading] = useState(true);

   const [photoOpen, setPhotoOpen] = useState(false);
   const [photoIndex, setPhotoIndex] = useState(0);
   const [selectedReaction, setSelectedReaction] = useState(null);

   // const images = useMemo(() => {
   //    return (property?.images || []).map((img) => ({
   //       ...img,
   //       url:
   //          img?.brandedUrl ||
   //          img?.processedUrl ||
   //          img?.url ||
   //          img?.preview,
   //    }));
   // }, [property]);

   // const mainImage = images?.[0]?.url;

   // const storyBlocks = [
   //    {
   //       title: 'Простір та атмосфера',
   //       text:
   //          'Оцініть планування, природне освітлення та атмосферу цього об’єкта. Простір продуманий для комфортного життя та щоденного використання.',
   //       image: images?.[1],
   //    },
   //    {
   //       title: 'Деталі, які мають значення',
   //       text:
   //          'Стан квартири, комунікації, меблі та практичні переваги формують комфорт проживання та потенціал для інвестиції.',
   //       image: images?.[2],
   //       reverse: true,
   //    },
   //    {
   //       title: 'Будинок та локація',
   //       text:
   //          'Важливе значення має не лише квартира, а й сам будинок, район та інфраструктура поруч.',
   //       image: images?.[3],
   //    },
   // ].filter((x) => x.image?.url);

   const reactions = [
      '👀 Хочу оглянути',
      '❤️ Подобається',
      '🤔 Подумаю',
      '📞 Передзвоніть',
      '🙅 Не моє',
   ];

   const reactionItems = [
      { type: 'view', label: reactions[0] },
      { type: 'like', label: reactions[1] },
      { type: 'think', label: reactions[2] },
      { type: 'call', label: reactions[3] },
      { type: 'reject', label: reactions[4] },
   ];

   const handleReaction = async (type) => {
      setSelectedReaction(type);

      try {
         await fetch(`/api/public/property-share/${slug}/reaction`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
               type,
               clientId: getClientId(),
            }),
         });
      } catch (error) {
         console.error('Property presentation reaction failed:', error);
      }
   };

   useEffect(() => {
      const load = async () => {
         try {
            const res = await fetch(`/api/public/property-share/${slug}`, {
               cache: 'no-store',
            });

            const json = await res.json();

            if (res.ok) {
               setData(json);
            }
         } finally {
            setLoading(false);
         }
      };

      if (slug) load();
   }, [slug]);

   if (loading) {
      return (
         <Box sx={{ minHeight: '100vh', display: 'grid', placeItems: 'center', bgcolor: '#0b0b12' }}>
            <CircularProgress />
         </Box>
      );
   }

   if (!data?.property) {
      return (
         <Box sx={{ minHeight: '100vh', display: 'grid', placeItems: 'center', bgcolor: '#0b0b12', color: '#fff' }}>
            <Typography fontWeight={900}>Презентацію не знайдено</Typography>
         </Box>
      );
   }


   const { property, share } = data;

   const images = (property?.images || []).map((img) => ({
      ...img,
      url: img?.brandedUrl || img?.processedUrl || img?.url || img?.preview,
   }));

   const mainImage = images?.[0]?.url || '/krm/logo-krm-transparent.png';

   const manager = property.assignee;

   const mainText =
      property?.advertisingTexts?.[0]?.text ||
      property?.description ||
      '';

   const storyBlocks = [
      property?.description && {
         title: 'Про об’єкт',
         text: property.description,
         image: images?.[1],
      },

      false && property?.advantages?.length && {
         title: 'Переваги',
         text: property.advantages.map((x) => `• ${x}`).join('\n'),
         image: images?.[2],
         reverse: true,
      },

      mainText && {
         title: 'Коротка презентація',
         text: mainText,
         image: images?.[3],
      },
      property?.advantages?.length && {
         title: 'Переваги об’єкта',
         image: images?.[2] || images?.[1] || images?.[0],
         children: <AdvantagesStoryList advantages={property.advantages} />,
      },

      property?.propertyVideos?.length && {
         title: 'Відеоогляд',
         media: <VideoFrame videos={property.propertyVideos || []} />,
         text: 'Короткий огляд об’єкта, атмосфери, планування та основних переваг.',
      },
   ].filter((x) => x && (x.image?.url || x.media) && (x.text || x.children));


   // const storyBlocks = [
   //    {
   //       title: 'Простір та атмосфера',
   //       text: 'Оцініть планування, природне освітлення та атмосферу цього об’єкта. Простір продуманий для комфортного життя та щоденного використання.',
   //       image: images?.[1],
   //    },
   //    {
   //       title: 'Деталі, які мають значення',
   //       text: 'Стан квартири, комунікації, меблі та практичні переваги формують комфорт проживання та потенціал для інвестиції.',
   //       image: images?.[2],
   //       reverse: true,
   //    },
   //    {
   //       title: 'Будинок та локація',
   //       text: 'Важливе значення має не лише квартира, а й сам будинок, район та інфраструктура поруч.',
   //       image: images?.[3],
   //    },
   // ].filter((x) => x.image?.url);


   return (
      <Box
         sx={{
            bgcolor: '#0b0b12',
            color: '#fff',
            minHeight: '100vh',
         }}
      >
         {/* HERO */}

         <Box
            sx={{
               position: 'relative',
               minHeight: { xs: 620, sm: 660, md: '100vh' },
               overflow: 'hidden',
            }}
         >
            <Box
               component="img"
               src={mainImage}
               sx={{
                  position: 'absolute',
                  inset: 0,
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
               }}
            />

            <Box
               sx={{
                  position: 'absolute',
                  inset: 0,
                  background:
                     'linear-gradient(180deg, rgba(7,7,12,0.45), rgba(7,7,12,0.88))',
               }}
            />

            <Box
               sx={{
                  position: 'relative',
                  zIndex: 2,
                  px: { xs: 1.5, sm: 2.5, md: 5 },
                  py: { xs: 2.5, sm: 4, md: 8 },
                  maxWidth: 1500,
                  mx: 'auto',
               }}
            >
               {/* <Typography
                  sx={{
                     fontSize: 13,
                     fontWeight: 900,
                     letterSpacing: 1.2,
                     color: '#c4b5fd',
                     textTransform: 'uppercase',
                  }}
               >
                  {share?.showBrand ? 'Karamax Real Estate' : 'Property Presentation'}
               </Typography> */}

               {share?.showBrand && (
                  <Box
                     sx={{
                        display: 'grid',
                        gridTemplateAreas: {
                           xs: '"brand manager" "title title"',
                           md: '"brand title manager"',
                        },
                        gridTemplateColumns: {
                           xs: 'minmax(0, 1fr) minmax(0, 1fr)',
                           md: 'auto minmax(180px, 1fr) auto',
                        },
                        alignItems: 'center',
                        columnGap: { xs: 1, md: 2.5 },
                        rowGap: { xs: 1.2, md: 0 },
                        mb: { xs: 2.5, md: 3 },
                        p: 0,
                        borderRadius: 0,
                        bgcolor: 'transparent',
                        border: 0,
                        backdropFilter: 'none',
                        boxShadow: 'none',
                     }}
                  >
                     <RevealOnScroll
                        direction="left"
                        delay={80}
                        sx={{
                           gridArea: 'brand',
                           justifySelf: 'start',
                           flex: '0 0 auto',
                           width: { xs: '100%', sm: 210, md: 232 },
                           minHeight: { xs: 58, sm: 64, md: 72 },
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
                              width: { xs: 152, sm: 188, md: 214 },
                              maxWidth: '100%',
                              height: 'auto',
                              objectFit: 'contain',
                              filter: 'none',
                           }}
                        />
                     </RevealOnScroll>

                     <RevealOnScroll
                        direction="up"
                        delay={170}
                        sx={{
                           gridArea: 'title',
                           minWidth: 0,
                           textAlign: 'center',
                           justifySelf: 'center',
                           display: { xs: 'none', md: 'block' },
                        }}
                     >
                        <Typography sx={{ fontWeight: 1000, fontSize: { xs: 25, md: 34 }, lineHeight: 1.05, textShadow: '0 4px 20px rgba(0,0,0,0.62)' }}>
                           Презентація об’єкту
                        </Typography>
                        <Typography sx={{
                           color: 'rgba(255,255,255,0.72)',
                           fontSize: { xs: 11, md: 13 },
                           display: 'none',
                           whiteSpace: 'nowrap',
                           overflow: 'hidden',
                           textOverflow: 'ellipsis',
                           maxWidth: { xs: 160, sm: 260 },
                        }}>
                           Агентство нерухомості
                        </Typography>
                     </RevealOnScroll>

                     {share?.showManagerContact && manager && (
                        <RevealOnScroll direction="right" delay={120} sx={{ gridArea: 'manager', justifySelf: 'end' }}>
                           <ManagerContactCard manager={manager} header />
                        </RevealOnScroll>
                     )}
                  </Box>
               )}

               <Typography
                  sx={{
                     mt: 2,
                     fontSize: { xs: 26, md: 39 },
                     fontWeight: 1000,
                     lineHeight: 0.98,
                     maxWidth: 980,
                  }}
               >
                  {property?.title || 'Об’єкт нерухомості'}
               </Typography>

               <Box
                  sx={{
                     mt: 2.5,
                     display: 'flex',
                     flexDirection: { xs: 'column', lg: 'row' },
                     alignItems: { xs: 'flex-start', lg: 'flex-start' },
                     justifyContent: 'space-between',
                     gap: { xs: 2, lg: 5 },
                  }}
               >
                  <Typography
                     sx={{
                        fontSize: { xs: 16, md: 19 },
                        lineHeight: 1.9,
                        color: 'rgba(255,255,255,0.76)',
                        maxWidth: 840,
                     }}
                  >
                     Ми підготували для вас детальну презентацію цього об’єкта.
                     Перегляньте фото, переваги та відеоогляд нижче.
                  </Typography>

                  <Typography
                     sx={{
                        pt: { xs: 0, lg: 0.35 },
                        fontSize: { xs: 34, md: 54, lg: 62 },
                        fontWeight: 1000,
                        lineHeight: 0.95,
                        textAlign: { xs: 'left', lg: 'right' },
                        whiteSpace: 'nowrap',
                        textShadow: '0 8px 26px rgba(0,0,0,0.48)',
                        flexShrink: 0,
                     }}
                  >
                     {property?.price
                        ? `${Number(property.price).toLocaleString('uk-UA')} ${property.currency || ''}`
                        : 'Ціна за запитом'}
                  </Typography>
               </Box>

               <Box
                  sx={{
                     mt: 4,
                  }}
               >
                  <Stack
                     direction="row"
                     spacing={1}
                     flexWrap="wrap"
                     useFlexGap
                     sx={{ minWidth: 0, maxWidth: { xs: '100%', lg: '62%' } }}
                  >
                     <InfoPill
                        icon={<LocationOnRoundedIcon sx={{ fontSize: 18 }} />}
                        label={property?.location_text || 'Локація'}
                     />

                     {property?.rooms ? (
                        <InfoPill
                           icon={<BedRoundedIcon sx={{ fontSize: 18 }} />}
                           label={`${property.rooms} кімн.`}
                        />
                     ) : null}

                     {property?.square_tot ? (
                        <InfoPill
                           icon={<SquareFootRoundedIcon sx={{ fontSize: 18 }} />}
                           label={`${property.square_tot} м²`}
                        />
                     ) : null}

                     {property?.floor && property?.floors ? (
                        <InfoPill
                           icon={<ApartmentRoundedIcon sx={{ fontSize: 18 }} />}
                           label={`${property.floor}/${property.floors} поверх`}
                        />
                     ) : null}
                  </Stack>

               </Box>

               <ReactionButtonGrid
                  items={reactionItems}
                  selectedReaction={selectedReaction}
                  onReaction={handleReaction}
               />
            </Box>
         </Box>

         {/* CONTENT */}

         <Box
            sx={{
               maxWidth: 1480,
               mx: 'auto',
               px: { xs: 2, md: 7 },
               py: { xs: 5, md: 10 },
            }}
         >
            {/* ADVANTAGES */}

            {false && !!property?.advantages?.length && (
               <Box>
                  <Typography
                     sx={{
                        fontSize: { xs: 28, md: 42 },
                        fontWeight: 1000,
                     }}
                  >
                     ✨ Переваги об’єкта
                  </Typography>

                  <Grid container spacing={1.4} sx={{ mt: 1.5, maxWidth: 900 }}>
                     {property.advantages.map((x, idx) => (
                        <Grid item xs={12} key={`${x}-${idx}`}>
                           <Box
                              sx={{
                                 px: 2.2,
                                 py: 1.6,
                                 borderRadius: 3,
                                 border:
                                    '1px solid rgba(255,255,255,0.10)',
                                 bgcolor: 'rgba(255,255,255,0.04)',
                              }}
                           >
                              <Typography
                                 sx={{
                                    fontWeight: 900,
                                    lineHeight: 1.7,
                                 }}
                              >
                                 ✓ {x}
                              </Typography>
                           </Box>
                        </Grid>
                     ))}
                  </Grid>
               </Box>
            )}

            {/* VIDEO */}

            {false && <VideoSection videos={property?.propertyVideos || []} />}

            {/* STORY BLOCKS */}

            {storyBlocks.map((block, idx) => (
               <StorySection
                  key={`${block.title}-${idx}`}
                  {...block}
                  reverse={idx % 2 === 1}
                  onImageClick={() => {
                     if (!block.image?.url) return;

                     const imageIndex = images.findIndex(
                        (x) => x.url === block.image.url
                     );

                     setPhotoIndex(imageIndex >= 0 ? imageIndex : 0);
                     setPhotoOpen(true);
                  }}
               />
            ))}

            {/* GALLERY */}

            {!!images?.length && (
               <Box sx={{ mt: { xs: 6, md: 10 } }}>
                  <Typography
                     sx={{
                        fontSize: { xs: 28, md: 42 },
                        fontWeight: 1000,
                        mb: 3,
                     }}
                  >
                     📸 Галерея
                  </Typography>

                  <Grid container spacing={2}>
                     {images.map((img, idx) => (
                        <Grid item xs={6} md={3} key={`${img.url}-${idx}`}>
                           <Box
                              component="img"
                              src={img.url}
                              onClick={() => {
                                 setPhotoIndex(idx);
                                 setPhotoOpen(true);
                              }}
                              sx={{
                                 width: '100%',
                                 height: { xs: 160, md: 240 },
                                 objectFit: 'cover',
                                 borderRadius: 4,
                                 cursor: 'zoom-in',
                                 border:
                                    '1px solid rgba(255,255,255,0.10)',
                                 transition: '0.18s ease',
                                 '&:hover': {
                                    transform: 'translateY(-2px) scale(1.01)',
                                 },
                              }}
                           />
                        </Grid>
                     ))}
                  </Grid>
               </Box>
            )}

            {/* MANAGER */}

            {share?.showManagerContact && manager && (
               <Box
                  sx={{
                     mt: { xs: 5, md: 10 },
                     p: { xs: 2.2, md: 5 },
                     borderRadius: { xs: 4, md: 6 },
                     border: '1px solid rgba(255,255,255,0.10)',
                     background:
                        'linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0.03))',
                  }}
               >
                  <Typography
                     sx={{
                        fontSize: { xs: 28, md: 42 },
                        fontWeight: 1000,
                     }}
                  >
                     👋 Зацікавив об’єкт?
                  </Typography>

                  <Typography
                     sx={{
                        mt: 1.5,
                        color: 'rgba(255,255,255,0.72)',
                        lineHeight: 1.8,
                        maxWidth: 760,
                     }}
                  >
                     Зв’яжіться з менеджером для детальної інформації,
                     додаткових фото або організації огляду.
                  </Typography>

                  <ManagerContactCard manager={manager} />

                  <ReactionButtonGrid
                     items={reactionItems.filter((reaction) => ['like', 'view', 'call'].includes(reaction.type))}
                     selectedReaction={selectedReaction}
                     onReaction={handleReaction}
                     compact
                  />

                  <Stack
                     direction="row"
                     spacing={1.5}
                     flexWrap="wrap"
                     useFlexGap
                     sx={{ mt: 4, display: 'none' }}
                  >
                     <Button
                        startIcon={<FavoriteRoundedIcon />}
                        onClick={() => handleReaction('like')}
                        sx={{
                           borderRadius: 999,
                           px: 3,
                           py: 1.2,
                           fontWeight: 1000,
                           color: '#fff',
                           border:
                              '1px solid rgba(255,255,255,0.14)',
                        }}
                     >
                        Подобається
                     </Button>

                     <Button
                        startIcon={<VisibilityRoundedIcon />}
                        onClick={() => handleReaction('view')}
                        sx={{
                           borderRadius: 999,
                           px: 3,
                           py: 1.2,
                           fontWeight: 1000,
                           color: '#fff',
                           border:
                              '1px solid rgba(255,255,255,0.14)',
                        }}
                     >
                        Хочу огляд
                     </Button>
                  </Stack>
               </Box>
            )}

            <Divider
               sx={{
                  mt: { xs: 7, md: 12 },
                  borderColor: 'rgba(255,255,255,0.08)',
               }}
            />

            <Typography
               sx={{
                  py: 3,
                  textAlign: 'center',
                  color: 'rgba(255,255,255,0.42)',
                  fontSize: 13,
               }}
            >
               Presentation powered by Karamax CRM
            </Typography>
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

