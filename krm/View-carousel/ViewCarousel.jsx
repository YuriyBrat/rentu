'use client'

import { Box, Stack, styled, useTheme } from "@mui/material";
import React, { useState, useEffect } from "react";
import useWindowSize from "@/estatein/hooks/useWindowSize";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/scrollbar";
import 'swiper/css/autoplay';

import { Gallery, Item } from 'react-photoswipe-gallery';
import 'photoswipe/style.css';

import Iconify from "@/estatein/components/iconify/iconify";

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

const ViewCarousel = ({ images = [] }) => {
  const theme = useTheme();
  const screenWidth = useWindowSize();
  const [swiper, setSwiper] = useState(null);
  const [activeIndex, setActiveIndex] = useState(0);

  // Стан для масиву з розмірами
  const [imagesWithSize, setImagesWithSize] = useState([]);

  useEffect(() => {
    if (!images.length) return;

    Promise.all(
      images.map((src) =>
        new Promise((resolve) => {
          const img = new Image();
          img.src = src;
          img.onload = () => resolve({ src, width: img.width, height: img.height });
          img.onerror = () => resolve({ src, width: 1600, height: 900 }); // дефолтні
        })
      )
    ).then(setImagesWithSize);
  }, [images]);

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

  const handleSwiperInit = (swiperInstance) => {
    setSwiper(swiperInstance);
  };

  const handlePrevButton = () => {
    swiper?.slidePrev();
  };

  const handleNextButton = () => {
    swiper?.slideNext();
  };

  if (imagesWithSize.length === 0) return null; // чекаємо розмірів

  return (
    <Gallery>
      <Stack
        p={{ xs: "15px", md: "40px" }}
        mb="30px"
        bgcolor={theme.palette.background.light}
        borderRadius="10px"
      >
        <Stack direction="row">
          <Swiper
            grabCursor
            slidesPerView={screenWidth < 1000 ? 1 : 2}
            spaceBetween={10}
            loop
            speed={400}
            autoplay={{
              delay: 3000,
              pauseOnMouseEnter: true,
            }}
            onSlideChange={handleSlideChange}
            onSwiper={handleSwiperInit}
            modules={[Navigation, Pagination, Autoplay]}
          >
            {imagesWithSize.map(({ src, width, height }, index) => (
              <SwiperSlide key={index}>
                <Item
                  original={src}
                  thumbnail={src}
                  width={width}
                  height={height}
                >
                  {({ ref, open }) => (
                    <StyledMinImgBox ref={ref} onClick={open}>
                      <Box
                        component="img"
                        src={src}
                        alt={`slide-${index}`}
                        width="100%"
                        height="100%"
                        sx={{
                          objectFit: 'cover',
                          cursor: 'zoom-in',
                          transition: 'opacity 0.3s ease-in-out',
                          '&:hover': {
                            opacity: 0.9,
                          },
                        }}
                      />
                    </StyledMinImgBox>
                  )}
                </Item>
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

              {imagesWithSize.map((_, index) => (
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
    </Gallery>
  );
};

export default ViewCarousel;
