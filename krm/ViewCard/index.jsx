'use client'

import { memo } from 'react';
import Link from 'next/link';

import { LazyLoadImage } from "react-lazy-load-image-component";
import { styled, useTheme, Box, Typography, Stack, Button } from '@mui/material';

import Iconify from "@/estatein/components/iconify/iconify";
import LineWeightIcon from '@mui/icons-material/LineWeight';
import SquareFootIcon from '@mui/icons-material/SquareFoot';
import BusinessIcon from '@mui/icons-material/Business';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';

import PhotoCameraOutlinedIcon from '@mui/icons-material/PhotoCameraOutlined';
// import NoPhotographyIcon from '@mui/icons-material/NoPhotography';
import NoPhotographyOutlinedIcon from '@mui/icons-material/NoPhotographyOutlined';

// Import Swiper React components
import { Swiper, SwiperSlide } from 'swiper/react';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
// import required modules
import { Navigation } from 'swiper/modules';

import { checkFieldFront, getCurrencySymbol } from '@/hooks/text.hook';



const ViewCard = memo(({ prop }) => {

   const theme = useTheme();
   const colorGray = theme.palette.divider;
   const borderValue = `1px solid ${colorGray}`;

   const StyledRoomsStack = styled(Stack)(({ theme }) => ({
      padding: "5px 3px 3px 3px",
      border: `1px solid ${colorGray}`,
      borderRadius: "50px",
      gap: "5px",
   }));


   const StyledImage = styled(LazyLoadImage)(() => ({
      width: '100%',
      height: '100%',
      objectFit: 'cover',
      display: 'block',
      borderRadius: '8px',
   }));

   const galleryImages =
      prop?.images?.length > 0
         ? prop.images
         : prop?.mainImage
            ? [prop.mainImage]
            : ['/background/bg1.jpg'];

   const badges = [
      prop?.visualTags?.isHot ? '🔥' : '',
      prop?.visualTags?.isFavorite ? '❤' : '',
   ].filter(Boolean);


   return (
      <Box
         sx={{
            display: 'flex',
            minWidth: 0,
            width: '100%',
            pt: 1.8,
         }}
      >
         <Box
            sx={{
               display: 'flex',
               flexDirection: 'column',
               minWidth: 0,
               width: '100%',
               border: borderValue,
               pt: 2,
               pb: 2,
               px: 2,
               borderRadius: "10px",
               position: 'relative',
               gap: 1.1,
               overflow: 'visible',
            }}
         >

               {!!badges.length && (
                  <Stack
                     direction="row"
                     alignItems="center"
                     gap={0.6}
                     sx={{
                        position: 'absolute',
                        top: '-14px',
                        left: '18px',
                        px: 0.7,
                        bgcolor: 'background.default',
                        lineHeight: 1,
                        zIndex: 2,
                     }}
                  >
                     {badges.map((badge, index) => (
                        <Typography
                           key={`${badge}-${index}`}
                           component="span"
                           sx={{
                              fontSize: '1rem',
                              lineHeight: 1.1,
                           }}
                        >
                           {badge}
                        </Typography>
                     ))}
                  </Stack>
               )}

               {/* Ціна */}
               <Box
                  sx={{
                     position: 'absolute',
                     top: '-13px',
                     right: '18px',
                     px: 0.8,
                     bgcolor: 'background.default',
                     lineHeight: 1,
                     zIndex: 2,
                  }}
               >
                  <Typography variant="subtitle1" color="text.secondary" sx={{ lineHeight: 1.2, fontWeight: 700 }}>
                     {prop.cost} {getCurrencySymbol(prop.currency)}
                  </Typography>
               </Box>

               {/* Заголовок */}
               <Typography
                  variant="subtitle1"
                  color="text.secondary"
                  sx={{
                     textAlign: 'center',
                     lineHeight: 1.25,
                     fontSize: { xs: '1rem', sm: '0.95rem', lg: '0.95rem' },
                     minHeight: 48,
                     mb: 0.5,
                     display: '-webkit-box',
                     WebkitBoxOrient: 'vertical',
                     WebkitLineClamp: 2,
                     overflow: 'hidden',
                  }}
               >
                  {prop.title}
               </Typography>

               {/* Зображення (вирівняне по низу) */}
               <Box sx={{ width: '100%', minWidth: 0 }}>
                  <Swiper
                     loop
                     navigation
                     modules={[Navigation]}
                     style={{ width: '100%', maxWidth: '100%' }}
                     className={"mySwiper"}
                  >
                     {galleryImages.map((img, idx) => (
                        <SwiperSlide key={idx}>
                           <Box
                              sx={{
                                 width: '100%',
                                 aspectRatio: '5 / 3',
                                 position: 'relative',
                                 overflow: 'hidden',
                                 borderRadius: '8px',
                              }}
                           >
                              <StyledImage alt="property image" src={img} />
                              <Box sx={{ position: 'absolute', top: '10px', left: '10px', display: 'flex' }}>
                                 {prop.images?.length > 0 ? (
                                    <>
                                       <PhotoCameraOutlinedIcon fontSize="small" sx={{ color: "white" }} />
                                       <Typography pl={0.5} variant="caption" color="white">
                                          {prop.images.length}
                                       </Typography>
                                    </>
                                 ) : (
                                    <NoPhotographyOutlinedIcon fontSize="small" sx={{ color: "white" }} />
                                 )}
                              </Box>
                           </Box>
                        </SwiperSlide>
                     ))}
                  </Swiper>
               </Box>

               {/* Локація */}
               <Typography
                  variant="subtitle2"
                  color="text.primary"
                  pl={0.5}
                  sx={{
                     fontSize: { sm: '1rem', lg: '0.9rem' },
                     fontWeight: 300,
                     display: '-webkit-box',
                     WebkitBoxOrient: 'vertical',
                     WebkitLineClamp: 2,
                     overflow: 'hidden',
                  }}
               >
                  {/* <LocationOnOutlinedIcon fontSize='small' sx={{ color: "text.secondary" }} /> */}
                  {prop?.location_text ? prop?.location_text : '...  '}
               </Typography>

               {/* Характеристики та кнопка */}
               <Stack
                  direction="row"
                  alignItems="center"
                  gap={0.5}
                  mt={0.4}
                  flexWrap="wrap"
               >
                  <StyledRoomsStack direction="row" alignItems="center">
                     <Iconify icon="ic:outline-bed" fontSize='small' sx={{ color: "text.secondary" }} />
                     <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.8rem' }}>
                        {prop?.rooms}к
                     </Typography>
                  </StyledRoomsStack>

                  <StyledRoomsStack direction="row" alignItems="center">
                     <SquareFootIcon fontSize='small' sx={{ color: "text.secondary" }} />
                     <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.8rem' }}>
                        {prop?.square_tot} м²
                     </Typography>
                  </StyledRoomsStack>

                  <StyledRoomsStack direction="row" alignItems="center">
                     <BusinessIcon fontSize='small' sx={{ color: "text.secondary" }} />
                     <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.8rem' }}>
                        {prop?.floor}/{prop?.floors} {checkFieldFront(prop?.type_walls, 'type_walls')}
                     </Typography>
                  </StyledRoomsStack>

                  <Button
                     component={Link}
                     href={`/views/${prop?._id}`}
                     size="medium"
                     variant="contained"
                     color="primary"
                     sx={{
                        ml: 'auto',
                        paddingY: '8px',
                        paddingX: '9px',
                        minWidth: 'unset',
                        fontSize: '0.8rem',
                        borderRadius: '10px',
                        lineHeight: 1,
                     }}
                  >
                     Опис
                  </Button>
               </Stack>
         </Box>
      </Box>
   );
}
)
export default ViewCard
