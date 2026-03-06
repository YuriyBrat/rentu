'use client'

import { memo } from 'react';
import Image from 'next/image';
import Link from 'next/link';

import { LazyLoadImage } from "react-lazy-load-image-component";
import { styled, useTheme, Box, Typography, Container, Grid, Stack, Button } from '@mui/material';

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

import { checkFieldFront } from '@/hooks/text.hook';



import { Gallery, Item } from 'react-photoswipe-gallery';
import 'photoswipe/style.css'; // Обов’язково


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



   return (
      <Gallery>
         <Grid item xs={12} sm={6} md={4} lg={3} sx={{ display: 'flex' }}>
            <Box
               sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  width: '100%',
                  height: '100%',
                  border: borderValue,
                  py: 2,
                  px: 2,
                  mb: 1,
                  borderRadius: "10px",
                  position: 'relative',
               }}
            >

               {/* Ціна */}
               <Box sx={{ position: 'absolute', top: '-13px', right: '20px' }}>
                  <Typography variant="subtitle1" color="text.secondary">
                     {prop.cost} {checkFieldFront(prop.currency, 'currency')}
                  </Typography>
               </Box>

               {/* Заголовок */}
               <Typography
                  variant="subtitle1"
                  color="text.secondary"
                  sx={{ textAlign: 'center', lineHeight: 1.25, fontSize: { xs: '1rem', sm: '0.95rem', lg: '0.95rem' }, mb: 0.5 }}
               >
                  {prop.title}
               </Typography>

               {/* Зображення (вирівняне по низу) */}
               <Box sx={{ mt: 'auto', mb: 2 }}>
                  <Swiper
                     loop
                     navigation
                     modules={[Navigation]}
                     style={{ width: '100%' }}
                     className={"mySwiper"}
                  >
                     {(prop?.images?.length > 0 ? prop.images : ['/background/bg1.jpg']).map((img, idx) => (
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
                  sx={{ fontSize: { sm: '1rem', lg: '0.9rem' }, fontWeight: 300 }}
               >
                  {/* <LocationOnOutlinedIcon fontSize='small' sx={{ color: "text.secondary" }} /> */}
                  {prop?.location_text ? prop?.location_text : '...  '}
               </Typography>

               {/* Характеристики та кнопка */}
               <Stack direction="row" alignItems="center" gap={0.2} mt={1} sx={{ position: 'relative' }}>
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
                        position: 'absolute',
                        right: 0,
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
         </Grid>
      </Gallery>
   );
}
)
export default ViewCard