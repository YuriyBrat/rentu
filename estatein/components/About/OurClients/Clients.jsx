import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/scrollbar";

import { Box, Stack, Typography, Divider } from "@mui/material";
import React, { useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";

import StarIcon from "../../icons/StarIcon";
import useWindowSize from "../../../hooks/useWindowSize";
import ClientsItem from "./ClientsItem";
import { StyledPrevNextBox } from "../../Main/Carousel/Carousel";
import Iconify from "../../iconify/iconify";
import OurClients from "../../../_moc_data/OurClients";
import { TooViewCarousel } from "../../../hooks/CarouselView";

const Clients = () => {
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
    <Box pb={5}>
      <Box mb={2}>
        <StarIcon />
      </Box>
      <Typography variant="h3" color="text.secondary" mb={2}>
        Our Valued Clients
      </Typography>
      <Typography
        variant="subtitle1"
        color="text.primary"
        width={{ xs: "100%", md: "60%" }}
        mb={5}
      >
        At Estatein, we have had the privilege of working with a diverse range
        of clients across various industries. Here are some of the clients we've
        had the pleasure of serving
      </Typography>

      <Swiper
        grabCursor={true}
        centeredSlides={false}
        slidesPerView={TooViewCarousel(screenWidth)}
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
        onSlideChange={handleSlideChange}
        onSwiper={handleSwiperInit}
        modules={[Navigation, Pagination, Autoplay]}
      >
        {OurClients.map((item, i) => (
          <SwiperSlide key={i}>
            <ClientsItem {...item} />
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
          <Stack direction="row" gap={1}>
            <Typography variant="subtitle1" color="text.secondary">
              {activeIndex + 1 < 10 ? 0 : null}
              {activeIndex + 1}
            </Typography>
            <Typography variant="subtitle1" color="text.primary">
              of {OurClients.length < 10 ? 0 : null}
              {OurClients.length}
            </Typography>
          </Stack>

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
    </Box>
  );
};

export default Clients;
