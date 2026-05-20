'use client';

import { useState, useEffect } from 'react';

import {
   Box,
   Stack,
   Typography,
   Grid,
   Button,
   Divider,
   CircularProgress,
} from '@mui/material';

import BedRoundedIcon from '@mui/icons-material/BedRounded';
import SquareFootRoundedIcon from '@mui/icons-material/SquareFootRounded';
import ApartmentRoundedIcon from '@mui/icons-material/ApartmentRounded';
import LocationOnRoundedIcon from '@mui/icons-material/LocationOnRounded';
import PhoneRoundedIcon from '@mui/icons-material/PhoneRounded';
import FavoriteRoundedIcon from '@mui/icons-material/FavoriteRounded';
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded';

import ImageLightbox from '../../crm_components/ImageLightbox';

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
   reverse,
   onImageClick,
}) {
   if (!image?.url) return null;

   return (
      <Grid
         container
         spacing={4}
         alignItems="center"
         sx={{
            mt: { xs: 4, md: 8 },
            flexDirection: reverse ? 'row-reverse' : 'row',
         }}
      >
         <Grid item xs={12} md={6}>
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
         </Grid>

         <Grid item xs={12} md={6}>
            <Typography
               sx={{
                  fontSize: { xs: 28, md: 46 },
                  fontWeight: 1000,
                  lineHeight: 1.05,
               }}
            >
               {title}
            </Typography>

            <Typography
               sx={{
                  mt: 2,
                  color: 'rgba(255,255,255,0.72)',
                  lineHeight: 1.9,
                  fontSize: 16,
               }}
            >
               {text}
            </Typography>
         </Grid>
      </Grid>
   );
}

function VideoSection({ videos = [] }) {
   const mainVideo = videos.find((v) => v.isMain) || videos[0];

   if (!mainVideo) return null;

   const isYoutube = mainVideo.platform === 'youtube';

   const embedUrl = mainVideo.url?.includes('watch?v=')
      ? mainVideo.url.replace('watch?v=', 'embed/')
      : mainVideo.url;

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

         {isYoutube ? (
            <Box
               component="iframe"
               src={embedUrl}
               allowFullScreen
               sx={{
                  width: '100%',
                  height: { xs: 260, md: 620 },
                  border: 0,
                  borderRadius: 6,
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

export default function PropertyLandingPresentation({
   slug
}) {

   const [data, setData] = useState(null);
   const [loading, setLoading] = useState(true);

   const [photoOpen, setPhotoOpen] = useState(false);
   const [photoIndex, setPhotoIndex] = useState(0);

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
      '🙅 Не моє',
   ];


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

   const mainImage = images?.[0]?.url;

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

      property?.advantages?.length && {
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
   ].filter((x) => x && x.image?.url && x.text);


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
               minHeight: { xs: 720, md: '100vh' },
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
                  px: { xs: 2, md: 5 },
                  py: { xs: 4, md: 8 },
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
                  <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 3 }}>
                     <Box
                        component="img"
                        src="/krm/logo-krm.png"
                        alt="Karamax"
                        sx={{ width: 80, height: 80, objectFit: 'contain' }}
                     />

                     <Box>
                        <Typography sx={{ fontWeight: 1000, fontSize: 22 }}>
                           Karamax
                        </Typography>
                        <Typography sx={{ color: 'rgba(255,255,255,0.62)', fontSize: 13 }}>
                           презентація об’єкту нерухомості
                        </Typography>
                     </Box>
                  </Stack>
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

               <Typography
                  sx={{
                     mt: 2.5,
                     fontSize: { xs: 16, md: 19 },
                     lineHeight: 1.9,
                     color: 'rgba(255,255,255,0.76)',
                     maxWidth: 840,
                  }}
               >
                  Ми підготували для вас детальну презентацію цього об’єкта.
                  Перегляньте фото, переваги та відеоогляд нижче.
               </Typography>

               <Stack
                  direction="row"
                  spacing={1}
                  flexWrap="wrap"
                  useFlexGap
                  sx={{ mt: 4 }}
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

               <Typography
                  sx={{
                     mt: 5,
                     fontSize: { xs: 34, md: 62 },
                     fontWeight: 1000,
                  }}
               >
                  {property?.price
                     ? `${Number(property.price).toLocaleString('uk-UA')} ${property.currency || ''}`
                     : 'Ціна за запитом'}
               </Typography>

               <Stack
                  direction="row"
                  spacing={1.2}
                  flexWrap="wrap"
                  useFlexGap
                  sx={{ mt: 5 }}
               >
                  {reactions.map((r) => (
                     <Button
                        key={r}
                        sx={{
                           borderRadius: 999,
                           px: 2,
                           py: 1,
                           color: '#fff',
                           border: '1px solid rgba(255,255,255,0.16)',
                           bgcolor: 'rgba(255,255,255,0.08)',
                           backdropFilter: 'blur(10px)',
                           fontWeight: 1000,
                        }}
                     >
                        {r}
                     </Button>
                  ))}
               </Stack>
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

            {!!property?.advantages?.length && (
               <Box>
                  <Typography
                     sx={{
                        fontSize: { xs: 28, md: 42 },
                        fontWeight: 1000,
                     }}
                  >
                     ✨ Переваги об’єкта
                  </Typography>

                  <Grid container spacing={2} sx={{ mt: 1.5 }}>
                     {property.advantages.map((x, idx) => (
                        <Grid item xs={12} md={4} key={`${x}-${idx}`}>
                           <Box
                              sx={{
                                 p: 2.2,
                                 borderRadius: 4,
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

            <VideoSection videos={property?.propertyVideos || []} />

            {/* STORY BLOCKS */}

            {storyBlocks.map((block, idx) => (
               <StorySection
                  key={`${block.title}-${idx}`}
                  {...block}
                  onImageClick={() => {
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

            {share?.showManagerContact && (
               <Box
                  sx={{
                     mt: { xs: 6, md: 10 },
                     p: { xs: 3, md: 5 },
                     borderRadius: 6,
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

                  <Stack
                     direction="row"
                     spacing={1.5}
                     flexWrap="wrap"
                     useFlexGap
                     sx={{ mt: 4 }}
                  >
                     <Button
                        component="a"
                        href={`tel:${manager.phone}`}
                        startIcon={<PhoneRoundedIcon />}
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
                        Зателефонувати
                     </Button>

                     <Button
                        startIcon={<FavoriteRoundedIcon />}
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

