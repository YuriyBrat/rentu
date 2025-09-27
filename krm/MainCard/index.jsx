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


const MainCard = memo(({ prop }) => {

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
      // <Gallery> Grid id="description" item xs={6} md={4}
      <Grid id="description" item xs={6} md={4} sx={{
         display: 'flex',
         height: '100%', // ⬅️ ключ до вирівнювання
      }}>
         {/* <Badge color="secondary" badgeContent={25}> */}
         <Box
            sx={{
               display: 'flex',
               flexDirection: 'column',
               justifyContent: 'flex-start',
               width: '100%',
               height: '100%', // ⬅️ важливо
               border: borderValue,
               py: 2,
               px: 2,
               mb: 1,
               borderRadius: "10px",
               position: 'relative',
            }}
         >
            <Box
               sx={{
                  // background: 'darkgray',
                  // background: 'inherit',
                  // paddingX: '10px',

                  display: 'inline - block',
                  position: 'absolute',
                  top: '-13px',
                  right: '25px',

                  // border: `1px solid ${colorGray}`,
                  // borderRadius: "50px",
                  // gap: "5px",
               }}
            >
               <Typography variant="subtitle1" color="text.secondary">{prop.cost} {checkFieldFront(prop.currency, 'currency')}</Typography>
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'center', minHeight: '20px' }}>
               <Typography align='' variant="subtitle1" color="text.secondary" pb={0} sx={{ lineHeight: 1.1 }}>{prop.title}</Typography>
            </Box>


            {
               prop?.images?.length > 1
                  ?
                  <Box sx={{
                     mt: 'auto', // ⬅️ ЦЕ — щоб фото було знизу
                     width: '100%',
                     aspectRatio: '5 / 3',
                     position: 'relative',
                     overflow: 'hidden',
                     borderRadius: '8px',
                     mb: 2
                  }}>
                     <StyledImage
                        component={LazyLoadImage}
                        alt={'alt'}
                        // src={im}
                        src={prop.images[0]}
                     />

                     <Box sx={{ position: 'absolute', top: '25px', left: '15px', display: 'flex' }} >
                        <PhotoCameraOutlinedIcon fontSize='medium' sx={{ color: "text.secondary" }} />
                        <Typography pl={0.5} variant="subtitle1" color="text.secondary">{prop?.images?.length}</Typography>
                     </Box>
                  </Box>
                  :
                  <Box sx={{
                     width: '100%',
                     aspectRatio: '5 / 3',
                     position: 'relative',
                     overflow: 'hidden',
                     borderRadius: '8px',
                     mt: 'auto',
                     mb: 2
                  }}>
                     <StyledImage
                        component={LazyLoadImage}
                        alt={'alt'}
                        src='/background/bg1.jpg'
                        // px={5}
                        my={1}
                     />

                     <Box sx={{ position: 'absolute', top: '25px', left: '15px', display: 'flex' }} >
                        <NoPhotographyOutlinedIcon fontSize='medium' sx={{ color: "text.secondary" }} />
                     </Box>
                  </Box>
            }



            <Typography variant="subtitle1" color="text.primary" sx={{ lineHeight: 1.25, fontWeight: 300 }}>
               {prop?.location_text ? prop?.location_text : '...'}
            </Typography>

            <Stack direction="row" alignItems="center" gap={1} mt={1} sx={{
               wordSpacing: '-0.2rem'
            }}>

               <StyledRoomsStack direction="row" alignItems="center">
                  <Iconify
                     icon="ic:outline-bed"
                     sx={{ color: "text.secondary" }}
                  />
                  <Typography variant="caption" color="text.secondary">
                     {prop?.rooms}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                     {'к'}
                  </Typography>
               </StyledRoomsStack>

               <StyledRoomsStack direction="row" alignItems="center">
                  <SquareFootIcon sx={{ color: "text.secondary" }} />
                  <Typography variant="caption" color="text.secondary">
                     {prop?.square_tot + '/' + prop?.square_liv + '/' + prop?.square_kit}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                     {'м²'}
                  </Typography>
               </StyledRoomsStack>

               <StyledRoomsStack direction="row" alignItems="center">
                  {/* <LineWeightIcon sx={{ color: "text.secondary" }} /> */}
                  <BusinessIcon fontSize='small' sx={{ color: "text.secondary" }} />
                  <Typography variant="caption" color="text.secondary">
                     {prop?.floor + '/' + prop?.floors}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                     {checkFieldFront(prop?.type_walls, 'type_walls')}
                  </Typography>
               </StyledRoomsStack>



               <Button size="small" variant="contained" color="primary" sx={{
                  position: 'absolute',
                  right: '25px',
                  paddingY: '3px',
                  paddingX: '0px',
                  // borderRadius: '15px'
               }}>
                  <Link href={'/esta/views/' + prop?._id}>
                     Опис
                  </Link>

               </Button>
            </Stack>
         </Box>
         {/* </Badge> */}
      </Grid>
      // </Gallery >
   )
})

export default MainCard