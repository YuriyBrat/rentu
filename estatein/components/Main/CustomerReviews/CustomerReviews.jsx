'use client'

import {
  Box,
  Stack,
  Typography,
  useTheme,
  Divider,
  Button,
} from "@mui/material";
import React, { useState } from "react";
import StarIcon from "../../icons/StarIcon";
import { Swiper, SwiperSlide } from "swiper/react";
import { EffectCoverflow, Navigation, Autoplay } from "swiper/modules";
import useWindowSize from "../../../hooks/useWindowSize";
import Iconify from "../../iconify/iconify";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/scrollbar";
import { StyledPrevNextBox } from "../Carousel/Carousel";
import CustomerItems from "./CustomerItems";
import CustomerReviewsData from "../../../_moc_data/CustomerReviewsData";
import { LayoutContainer } from "../../app-layoout/container";
import { FourViewCarousel } from "../../../hooks/CarouselView";

const CustomerReviews = () => {
  const theme = useTheme();
  const screenWidth = useWindowSize();
  const [swiper, setSwiper] = useState(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const handleSlideChange = () => {
    if (swiper) {
      setActiveIndex(swiper.realIndex);
    }
  };

  const handleSwiperInit = (swiper) => {
    setSwiper(swiper);
  };

  const handlePrevButton = () => {
    if (swiper) {
      swiper.slidePrev();
    }
  };

  const handleNextButton = () => {
    if (swiper) {
      swiper.slideNext();
    }
  };

  return (
    <Stack py={{ xs: 2, md: 4 }} bgcolor={theme.palette.background.default}>
      <LayoutContainer>
        <Stack
          mb={3}
          direction={{ xs: "column", md: "row" }}
          alignItems="end"
          justifyContent="space-between"
          gap={2}
        >
          <Stack>
            <Box mb={2}>
              <StarIcon />
            </Box>
            <Typography variant="h3" color="text.secondary">
              What Our Clients Say
            </Typography>
            <Typography variant="subtitle1" color="text.primary">
              Read the success stories and heartfelt testimonials from our
              valued clients. Discover why they chose Estatein for their real
              estate needs.
            </Typography>
          </Stack>
          <Box width={{ xs: "100%", md: "auto" }}>
            <Button variant="contained" color="primary" fullWidth>
              View All Testimonials
            </Button>
          </Box>
        </Stack>
        <Swiper
          grabCursor={true}
          centeredSlides={false}
          slidesPerView={FourViewCarousel(screenWidth)}
          spaceBetween={10}
          coverflowEffect={{
            rotate: 50,
            stretch: 0,
            depth: 100,
            modifier: 2,
            slideShadows: false,
          }}
          loop={true}
          speed={600}
          autoplay={{ delay: 5000 }}
          className="mySwiper"
          modules={[Navigation, EffectCoverflow, Autoplay]}
          onSlideChange={handleSlideChange}
          onSwiper={handleSwiperInit}
          navigation={false}
        >
          {CustomerReviewsData.map((item, i) => (
            <SwiperSlide key={i}>
              <CustomerItems {...item} />
            </SwiperSlide>
          ))}
        </Swiper>
        <Stack pt={{ xs: 2, md: 5 }}>
          <Divider variant="fullWidth" orientation="horizontal" />
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            py={2}
          >
            <Typography variant="subtitle1" color="text.primary">
              {activeIndex + 1 < 10 ? 0 : null}
              {activeIndex + 1} of {CustomerReviewsData.length}
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
      </LayoutContainer>
    </Stack>
  );
};

export default CustomerReviews;
