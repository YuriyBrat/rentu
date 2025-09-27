import { Box, Stack, styled, useTheme } from "@mui/material";
import React, { useState } from "react";
import useWindowSize from "../../../hooks/useWindowSize";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/scrollbar";
import 'swiper/css/autoplay';
import Iconify from "../../iconify/iconify";

const imgData = [
  "/esta/assets/villa/image.jpg",
  "/esta/assets/villa/image1.jpg",
  "/esta/assets/villa/image2.jpg",
  "/esta/assets/villa/image3.jpg",
  "/esta/assets/villa/image4.jpg",
  "/esta/assets/villa/image5.jpg",
  "/esta/assets/villa/image6.jpg",
  "/esta/assets/villa/image7.jpg",
  "/esta/assets/villa/image8.jpg",
  "/esta/assets/villa/image9.jpg",
];

const StyledMinImgBox = styled(Box)(({ theme }) => ({
  height: "500px",
  borderRadius: "10px",
  overflow: "hidden",
  [theme.breakpoints.down("sm")]: {
    height: "400px",
  },
}));

const StyledIndexBox = styled(Box)(({ theme }) => ({
  width: "15px",
  height: "5px",
  borderRadius: "50px",
  cursor: "pointer",
  background: theme.palette.background.light,
  "&.active": {
    background: theme.palette.primary.main,
  },
}));

const StyledArrowBox = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  borderRadius: "50%",
  padding: "10px",
  border: `1px solid ${theme.palette.text.secondary}`,
  color: theme.palette.text.secondary,
  cursor: "pointer",
}));

const HauseCarousel = () => {
  const theme = useTheme();
  const screenWidth = useWindowSize();
  const [swiper, setSwiper] = useState(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const handleIndexClick = (index) => {
    if (swiper) {
      swiper.slideTo(index);
      setActiveIndex(index);
    }
  };

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
    <Stack
      p={{ xs: "15px", md: "40px" }}
      mb="30px"
      bgcolor={theme.palette.background.light}
      borderRadius="10px"
    >
      <Stack direction="row">
        <Swiper
          grabCursor={true}
          centeredSlides={false}
          slidesPerView={screenWidth < 1000 ? 1 : 2}
          spaceBetween={10}
          coverflowEffect={{
            rotate: 50,
            stretch: 0,
            depth: 100,
            modifier: 2,
            slideShadows: false,
          }}
          loop={true}
          className="mySwiper"
          // autoplay={true}
          speed={400}
          autoplay={{
            delay: 3000,
            // disableOnInteraction: true,
            pauseOnMouseEnter: true,
          }}
          onSlideChange={handleSlideChange}
          onSwiper={handleSwiperInit}
          modules={[Navigation, Pagination, Autoplay]}
        >
          {imgData.map((imageUrl, index) => (
            <SwiperSlide key={index}>
              <StyledMinImgBox>
                <Box
                  component="img"
                  width="100%"
                  height="100%"
                  src={imageUrl}
                  alt={`slide-${index}`}
                />
              </StyledMinImgBox>
            </SwiperSlide>
          ))}
        </Swiper>
      </Stack>

      <Stack direction="row" justifyContent="center" mt={{ xs: 2, md: 5 }}>
        <Box
          padding="10px"
          borderRadius="50px"
          bgcolor={theme.palette.background.default}
        >
          <Stack direction="row" alignItems="center" gap={1}>
            <StyledArrowBox onClick={handlePrevButton}>
              <Iconify icon="grommet-icons:link-previous" />
            </StyledArrowBox>
            {imgData.map((_, index) => (
              <StyledIndexBox
                key={index}
                onClick={() => handleIndexClick(index)}
                className={activeIndex === index ? "active" : ""}
              />
            ))}
            <StyledArrowBox onClick={handleNextButton}>
              <Iconify icon="ooui:arrow-previous-rtl" />
            </StyledArrowBox>
          </Stack>
        </Box>
      </Stack>


    </Stack>
  );
};

export default HauseCarousel;
