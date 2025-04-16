// 'use client'

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/scrollbar";
import { Box, Divider, Stack, Typography } from "@mui/material";
import React, { useState } from "react";
import StarIcon from "../../icons/StarIcon";
import useWindowSize from "../../../hooks/useWindowSize";

import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import PossibilitiesItem from "./PossibilitiesItem";
import { StyledPrevNextBox } from "../../Main/Carousel/Carousel";
import Iconify from "../../iconify/iconify";
import PossibilitesData from "../../../_moc_data/PossibilitesData";
import { LayoutContainer } from "../../app-layoout/container";
import { ThreeViewCarousel } from "../../../hooks/CarouselView";

const Possibilities = () => {
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
    <Stack py={8}>
      <LayoutContainer>
        <Box mb={2}>
          <StarIcon />
        </Box>
        <Typography variant="h3" color="text.secondary" mb={2}>
          Discover a World of Possibilites
        </Typography>
        <Typography variant="subtitle1" color="text.primary" mb={2}>
          Our portfolio of properties is as diverse as your dreams. Explore the
          following categories to find the perfect property that resonates with
          your vision of home
        </Typography>

        <Swiper
          grabCursor={true}
          centeredSlides={false}
          slidesPerView={ThreeViewCarousel(screenWidth)}
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
          spaceBetween={10}
          className="mySwiper"
          modules={[Navigation, Pagination, Autoplay]}
          onSlideChange={handleSlideChange}
          onSwiper={handleSwiperInit}
          navigation={false}
        >
          {PossibilitesData.map((item, i) => (
            <SwiperSlide key={i}>
              <PossibilitiesItem {...item} />
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
              {activeIndex + 1} of {PossibilitesData.length < 10 ? 0 : null}
              {PossibilitesData.length}
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

export default Possibilities;
