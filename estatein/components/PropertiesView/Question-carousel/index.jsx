import {
  Box,
  Stack,
  Typography,
  styled,
  Button,
  Divider,
} from "@mui/material";
import React, { useState } from "react";
import useWindowSize from "../../../hooks/useWindowSize";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import QuestionCarousel from "../../../_moc_data/QuestionCarousel";
import StarIcon from "../../icons/StarIcon";
import Iconify from "../../iconify/iconify";
import { ThreeViewCarousel } from "../../../hooks/CarouselView";

const StyledQuestionBox = styled(Box)(({ theme }) => ({
  padding: "30px",
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: "10px",
  minHeight: "180px",
  display: "flex",
  flexDirection: "column",
  justifyContent: "space-between",
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

const AskedQuestionCarousel = () => {
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
    <Stack>
      <Stack>
        <Box mb={2}>
          <StarIcon />
        </Box>
        <Typography variant="h3" color="text.secondary" mb={2}>
          Frequently Asked Questions
        </Typography>
        <Typography
          variant="subtitle1"
          color="text.primary"
          width={{ xs: "100%", md: "60%" }}
          mb={5}
        >
          Find answers to common questions about Estatein's services, property
          listings, and the real estate process. We're here to provide clarity
          and assist you every step of the way.
        </Typography>
      </Stack>
      <Stack pb="30px">
        <Stack direction="row">
          <Swiper
            grabCursor={true}
            centeredSlides={false}
            slidesPerView={ThreeViewCarousel(screenWidth)}
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
            {QuestionCarousel.map((item, index) => (
              <SwiperSlide key={index}>
                <StyledQuestionBox>
                  <Typography variant="h6" color="text.secondary">
                    {item.title}
                  </Typography>
                  <Typography variant="subtitle2" color="text.primary">
                    {item.text}
                  </Typography>
                  <Box mt={2} width={{ xs: "100%", md: "40%" }}>
                    <Button variant="contained" color="primary" fullWidth>
                      Read More
                    </Button>
                  </Box>
                </StyledQuestionBox>
              </SwiperSlide>
            ))}
          </Swiper>
        </Stack>
      </Stack>
      <Divider variant="fullWidth" orientation="horizontal" />
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        py={4}
      >
        <Stack direction="row" gap={1}>
          <Typography variant="subtitle1" color="text.secondary">
            {activeIndex + 1 < 10 ? 0 : null}
            {activeIndex + 1}
          </Typography>
          <Typography variant="subtitle1" color="text.primary">
            of
          </Typography>
          <Typography variant="subtitle1" color="text.primary">
            {activeIndex + 1 < 10 ? 0 : null}
            {QuestionCarousel.length}
          </Typography>
        </Stack>
        <Stack direction="row" gap={2}>
          <StyledArrowBox onClick={handlePrevButton}>
            <Iconify icon="grommet-icons:link-previous" />
          </StyledArrowBox>
          <StyledArrowBox onClick={handleNextButton}>
            <Iconify icon="ooui:arrow-previous-rtl" />
          </StyledArrowBox>
        </Stack>
      </Stack>
    </Stack>
  );
};

export default AskedQuestionCarousel;
