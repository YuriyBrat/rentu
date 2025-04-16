import {
  Box,
  Stack,
  Typography,
  useTheme,
  Divider,
  styled,
} from "@mui/material";
import React, { useState } from "react";
import StarIcon from "../../icons/StarIcon";
import { Swiper, SwiperSlide } from "swiper/react";
import { EffectCoverflow, Navigation } from "swiper/modules";
import CarouselData from "../../../_moc_data/caoursel";
import CarouselItem from "./CarouselItem";
import useWindowSize from "../../../hooks/useWindowSize";
import Iconify from "../../iconify/iconify";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/scrollbar";
import { LayoutContainer } from "../../app-layoout/container";
import { ThreeViewCarousel } from "../../../hooks/CarouselView";

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
const Carousel = () => {
  const theme = useTheme();
  const screenWidth = useWindowSize();
  const [activeIndex, setActiveIndex] = useState(0);
  const [swiper, setSwiper] = useState(null);

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
    <Stack py={{ xs: 2, md: 8 }} bgcolor={theme.palette.background.default}>
      <LayoutContainer>
        <Stack mb={3}>
          <Box mb={2}>
            <StarIcon />
          </Box>
          <Typography variant="h3" color="text.secondary">
            Featured Properties
          </Typography>
          <Typography variant="subtitle1" color="text.primary">
            Explore our handpicked selection of featured properties. Each
            listing offers a glimpse into exceptional homes and investments
            available through Estatein. Click "View Details" for more
            information.
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
            slideShadows: false,
          }}
          loop={true}
          className="mySwiper"
          modules={[Navigation, EffectCoverflow]}
          onSlideChange={handleSlideChange}
          onSwiper={handleSwiperInit}
          navigation={false}
        >
          {CarouselData.map((item, i) => (
            <SwiperSlide key={i}>
              <CarouselItem {...item} />
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
              {activeIndex + 1} of {CarouselData.length}
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

export default Carousel;
