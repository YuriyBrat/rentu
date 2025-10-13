'use client'
import { useState, useEffect, useRef, useCallback } from 'react';

import { styled, useTheme, Box, Typography, Container, Card, CardHeader, Grid, Stack, Divider } from '@mui/material';

import MainCard from '@/krm/MainCard';
import VisitSection from '@/krm/VisionSection';
import ViewOrder from '@/krm/ViewOrder';
import { dataOrders } from '@/krm/ViewOrder';

import Spinner from '@/components/Spinner';
// import Pagination from './Pagination';
import useWindowSize from '@/estatein/hooks/useWindowSize';
import { LayoutContainer } from '@/krm/container';
import KrmLayout from '@/krm/Layout-Krm';

import CustomerReviews from '@/krm/CustomerReviews/CustomerReviews';


import StarIcon from "@/estatein/components/icons/StarIcon";
import Iconify from '@/estatein/components/iconify/iconify';


import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay, EffectCoverflow } from "swiper/modules";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/scrollbar";
import 'swiper/css/autoplay';

import { ThreeViewCarousel } from '@/estatein/hooks/CarouselView';  //!

const demoProps = [
   //    {
   //    _id: '9090921',
   //    cost: '75000',
   //    currency: '$',
   //    title: 'Продаж красивої квартири з видом на парк з панорамню лоджією',
   //    rooms: 1,
   //    square_tot: 75,
   //    square_liv: 40,
   //    square_kit: 10,
   //    floor: 5,
   //    floors: 10,

   //    images: ['/esta/assets/home/carousel-img.png', '/esta/assets/home/carousel-img1.png', '/esta/assets/home/carousel-img2.png']
   // },
   // {
   //    _id: '90909255',
   //    cost: '200000',
   //    currency: '$',
   //    title: 'Продаж дизайнерського будинку',
   //    rooms: 5,
   //    square_tot: 120,
   //    square_liv: 40,
   //    square_kit: 10,
   //    floor: 2,
   //    floors: 2,

   //    images: ['/esta/assets/home/carousel-img.png']
   // },
   // {
   //    _id: '9090977',
   //    cost: '40000',
   //    currency: '$',
   //    title: 'Продаж компактної 1к квартири',
   //    rooms: 1,
   //    square_tot: 45,
   //    square_liv: 29,
   //    square_kit: 6,
   //    floor: 1,
   //    floors: 5,

   //    images: []
   // }
];


export const StyledPrevNextBox = styled(Box)(({ theme }) => ({
   color: theme.palette.text.secondary,
   width: "40px",
   height: "40px",
   borderRadius: "50%",
   background: theme.palette.background.main,
   border: `1px solid ${theme.palette.divider}`,
   display: "flex",
   alignItems: "center",
   justifyContent: "center",
   cursor: "pointer",
   userSelect: "none",
}));


const ViewsProp = () => {
   const [leadprops, setLeadprops] = useState([]);
   const [loading, setLoading] = useState(false);
   const [page, setPage] = useState(1);
   const [pageSize, setPageSize] = useState(5);
   const [totalItems, setTotalItems] = useState(0);


   const [activeIndex, setActiveIndex] = useState(0);
   // const [swiper, setSwiper] = useState(null);
   const screenWidth = useWindowSize();

   const swiperRef = useRef(null);

   const handleSlideChange = useCallback(swiper => {
      setActiveIndex(swiper.realIndex);
   }, [activeIndex])

   const handleSwiperInit = useCallback((swiper) => {
      swiperRef.current = swiper;
   }, [])

   const handlePrevButton = useCallback(() => {
      if (swiperRef.current) {
         swiperRef.current.slidePrev();
      }
   }, [])
   const handleNextButton = useCallback(() => {
      if (swiperRef.current) {
         swiperRef.current.slideNext();
      }
   }, []);

   const [activeIndex1, setActiveIndex1] = useState(0);
   const swiperRef1 = useRef(null);
   const handleSlideChange1 = useCallback(swiper => {
      setActiveIndex1(swiper.realIndex);
   }, [activeIndex1]);
   const handleSwiperInit1 = useCallback((swiper) => {
      swiperRef1.current = swiper;
   }, []);
   const handlePrevButton1 = useCallback(() => {
      if (swiperRef1.current) {
         swiperRef1.current.slidePrev();
      }
   }, []);
   const handleNextButton1 = useCallback(() => {
      if (swiperRef1.current) {
         swiperRef1.current.slideNext();
      }
   }, []);


   useEffect(() => {

      const fetchLeadProps = async () => {
         try {
            // const res = await fetch(`/api/rcs/leadprop?page=${page}&pageSize=${pageSize}`);
            const res = await fetch(`/api/rcs/leadprop`);

            if (!res.ok) {
               throw new Error('Failed to get properties')
            };

            const data = await res.json();
            const { leadprops, total } = data;
            if (leadprops) {
               leadprops.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            }
            setLeadprops(leadprops);
            setTotalItems(total)
            setLeadprops(prev => demoProps.concat(prev))
         } catch (error) {
            console.log(error);
         } finally {
            setLoading(false)
         }
      };
      fetchLeadProps()

   }, [page, pageSize]);

   const theme = useTheme();
   const colorGray = theme.palette.divider;
   const borderValue = `1px solid ${colorGray}`;

   const StyledRoomsStack = styled(Stack)(({ theme }) => ({
      padding: "5px 10px 3px 10px",
      border: `1px solid ${colorGray}`,
      borderRadius: "50px",
      gap: "5px",
   }));


   return loading ? (<Spinner />) : (
      <>
         {/* <div>Total is {totalItems}</div> */}
         {/* {
            leadprops.map(prop => (
               <div key={prop?._id} >{prop?.location?.city}</div>
            ))
         } */}
         <KrmLayout>
            <LayoutContainer>


               <VisitSection />

               {/* <Box mt={12} mb={3}>
                  <StarIcon />
               </Box>

               <Typography variant="h3" color="text.secondary" mb={2}>
                  Найгарячіші об'єкти
               </Typography> */}

               <Stack direction="row" alignItems="center" spacing={1} mt={1.5} mb={1.5} sx={{
                  // position: 'relative',
                  // top: '-45px',
                  zIndex: 5
               }}>
                  <StarIcon color="text.secondary" />
                  <Typography variant="h5" color="text.secondary">
                     ТОП продажу
                  </Typography>
               </Stack>

               {
                  leadprops.length === 0
                     ?
                     <Typography variant="h3" color="text.secondary" mb={2}>Об'єктів не знайдено</Typography>
                     : (
                        // <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        // <Container > Grid container spacing={1} p={1}

                        <>
                           <Swiper
                              grabCursor={true}
                              centeredSlides={false}
                              slidesPerView={ThreeViewCarousel(screenWidth)}
                              coverflowEffect={{
                                 rotate: 50,
                                 stretch: 0,
                                 depth: 100,
                                 modifier: 2,
                                 slideShadows: true,
                              }}
                              loop={true}
                              speed={600}
                              autoplay={{ delay: 5000 }}
                              className="mySwiper"
                              modules={[Navigation, EffectCoverflow, Autoplay]}

                              // onSwiper={handleSwiperInit}
                              navigation={false}
                              style={{ height: '100%' }} // ⬅️ важливо!

                              onSwiper={handleSwiperInit}
                              onSlideChange={handleSlideChange}
                           >
                              {/* <Grid container spacing={1} p={1} alignItems="stretch"> */}
                              {
                                 leadprops.map((prop, i) => (
                                    <SwiperSlide key={i} style={{ display: 'flex', height: 'auto' }}>
                                       <Box
                                          sx={{
                                             height: '100%',
                                             display: 'flex',
                                             flexDirection: 'column',
                                             justifyContent: 'stretch',
                                             p: 1,
                                          }}
                                       >
                                          <MainCard prop={prop} />
                                       </Box>
                                    </SwiperSlide>
                                 ))
                              }
                              {/* </Grid> */}
                           </Swiper>


                           <Stack pt={0.5}>
                              {/* <Divider variant="fullWidth" orientation="horizontal" /> */}
                              <Stack
                                 direction="row"
                                 alignItems="center"
                                 justifyContent="space-between"
                                 py={2}
                              >
                                 <Typography variant="subtitle1" color="text.primary">
                                    {activeIndex + 1 < 10 ? 0 : null}
                                    {activeIndex + 1} із {leadprops.length + 1 < 10 ? 0 : null}{leadprops.length}
                                 </Typography>

                                 <Stack direction="row" gap={2}>
                                    <StyledPrevNextBox onClick={handlePrevButton}>
                                       <Iconify icon="grommet-icons:link-previous" />
                                    </StyledPrevNextBox>
                                    <StyledPrevNextBox onClick={handleNextButton}>
                                       <Iconify icon="grommet-icons:link-next" />
                                    </StyledPrevNextBox>
                                 </Stack>
                              </Stack>
                           </Stack>
                        </>
                     )
               }



               <Divider variant="fullWidth" orientation="horizontal" />
               <Stack direction="row" alignItems="center" spacing={3} mt={3} mb={2}>
                  <StarIcon />
                  <Typography variant="h5" color="text.secondary">
                     Гарячий попит на купівлю
                  </Typography>
               </Stack>
               <Swiper
                  grabCursor={true}
                  centeredSlides={false}
                  slidesPerView={ThreeViewCarousel(screenWidth)}
                  coverflowEffect={{
                     rotate: 50,
                     stretch: 0,
                     depth: 100,
                     modifier: 2,
                     slideShadows: true,
                  }}
                  loop={true}
                  speed={600}
                  autoplay={{ delay: 5000 }}
                  className="mySwiper"
                  modules={[Navigation, EffectCoverflow, Autoplay]}

                  // onSwiper={handleSwiperInit}
                  navigation={false}
                  style={{ height: 'auto' }} // ⬅️ важливо!

                  onSwiper={handleSwiperInit1}
                  onSlideChange={handleSlideChange1}
               >
                  {
                     dataOrders.map((order, i) => (
                        <SwiperSlide key={i} style={{ display: 'flex', height: 'auto' }}>
                           <Box
                              sx={{
                                 // height: '100%',
                                 width: '100%',
                                 display: 'flex',
                                 flexDirection: 'column',
                                 justifyContent: 'stretch',
                                 flex: 1,
                                 p: 1,
                              }}
                           >
                              <ViewOrder order={order} />
                           </Box>
                        </SwiperSlide>
                     ))
                  }
                  {/* </Grid> */}
               </Swiper>

               <Stack pt={0.5}>
                  <Stack
                     direction="row"
                     alignItems="center"
                     justifyContent="space-between"
                     py={2}
                  >
                     <Typography variant="subtitle1" color="text.primary">
                        {activeIndex1 + 1 < 10 ? 0 : null}
                        {activeIndex1 + 1} із {dataOrders.length + 1 < 10 ? 0 : null}{dataOrders.length}
                     </Typography>

                     <Stack direction="row" gap={2}>
                        <StyledPrevNextBox onClick={handlePrevButton1}>
                           <Iconify icon="grommet-icons:link-previous" />
                        </StyledPrevNextBox>
                        <StyledPrevNextBox onClick={handleNextButton1}>
                           <Iconify icon="grommet-icons:link-next" />
                        </StyledPrevNextBox>
                     </Stack>
                  </Stack>
               </Stack>



            </LayoutContainer>

            <CustomerReviews />
         </KrmLayout>
      </>
   )
}

export default ViewsProp