import {
  Box,
  Button,
  Divider,
  Stack,
  Typography,
  useTheme,
} from "@mui/material";
import React, { useState } from "react";
import useWindowSize from "../../../hooks/useWindowSize";
import { EffectCoverflow, Navigation } from "swiper/modules";
import QuestionItem from "./QuestionItem";
import { StyledPrevNextBox } from "../Carousel/Carousel";
import Iconify from "../../iconify/iconify";
import { Swiper, SwiperSlide } from "swiper/react";
import StarIcon from "../../icons/StarIcon";
import FrequentlyQuestion from "../../../_moc_data/FrequentlyQuestion";
import { LayoutContainer } from "../../app-layoout/container";
import { FourViewCarousel } from "../../../hooks/CarouselView";

const FrequentlyQuestions = () => {
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
          className="mySwiper"
          modules={[Navigation, EffectCoverflow]}
          onSlideChange={handleSlideChange}
          onSwiper={handleSwiperInit}
          navigation={false}
        >
          {FrequentlyQuestion.map((item, i) => (
            <SwiperSlide key={i}>
              <QuestionItem {...item} />
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
              {activeIndex + 1} of {FrequentlyQuestion.length}
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

export default FrequentlyQuestions;
