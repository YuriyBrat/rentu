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
import StarIcon from "@/estatein/components/icons/StarIcon";
import { Swiper, SwiperSlide } from "swiper/react";
import { EffectCoverflow, Navigation, Autoplay } from "swiper/modules";

import useWindowSize from "@/estatein/hooks/useWindowSize";
import Iconify from "@/estatein/components/iconify/iconify";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/scrollbar";

import { StyledPrevNextBox } from "@/estatein/components/Main/Carousel/Carousel";
import CustomerItems from "./CustomerItems";

// import CustomerReviewsData from "@/estatein/_moc_data/CustomerReviewsData";

import { LayoutContainer } from "../container";
import { FourViewCarousel } from "@/estatein/hooks/CarouselView";
import { ThreeViewCarousel } from '@/estatein/hooks/CarouselView';

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
    <Stack py={{ xs: 2, md: 4 }} bgcolor={theme.palette.background.default} >
      <LayoutContainer>
        <Stack
          mb={3}
          direction={{ xs: "column", md: "row" }}
          alignItems="end"
          justifyContent="space-between"
          gap={2}
        >
          <Stack>
            <Stack direction="row" alignItems="center" spacing={3} mb={2}>
              <StarIcon />
              <Typography variant="h5" color="text.secondary">
                Враження наших клієнтів
              </Typography>
            </Stack>

            <Typography variant="subtitle1" color="text.primary">
              Будемо раді і вмотивовані наповнювати сторінку Вашими відгуками
              після успішної та вдало проведеної роботи
            </Typography>
          </Stack>
          <Box width={{ xs: "100%", md: "auto" }}>
            {/* <Button variant="contained" color="primary" fullWidth>
              View All Testimonials
            </Button> */}
          </Box>
        </Stack>

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
          modules={[Navigation, EffectCoverflow, Autoplay]}
          onSlideChange={handleSlideChange}
          onSwiper={handleSwiperInit}
          navigation={false}
        >
          {CustomerReviewsData.map((item, i) => (
            // <SwiperSlide key={i}>
            //   <CustomerItems {...item} />
            // </SwiperSlide>

            <SwiperSlide key={i} style={{ display: 'flex', height: 'auto' }}>
              <Box
                sx={{
                  // height: '100%',
                  width: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'stretch',
                  // flex: 1,
                  p: 0.5,
                }}
              >
                <CustomerItems {...item} />
              </Box>
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
              {activeIndex + 1} із {CustomerReviewsData.length + 1 < 10 ? 0 : null}{CustomerReviewsData.length}
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


export { CustomerReviewsData }

const CustomerReviewsData = [
  {
    id: 0,
    rating: 5,
    title: "Швидкий пошук житла",
    text: "Завдяки KaRaMax знайшли квартиру в центрі Львова менш ніж за тиждень. Все чітко, оперативно і без зайвих клопотів!",
    userImg: "https://res.cloudinary.com/ddttjhllt/image/upload/v1753178512/fref_2_ckbknf.jpg",
    userName: "Олена Коваль",
    userCountry: "Україна, Львів",
  },
  {
    id: 1,
    rating: 5,
    title: "Підтримка 24/7",
    text: "Приємно здивована, що на всі запитання відповідали навіть у вихідні. Професійна команда, яка дійсно турбується про клієнта.",
    userImg: "/esta/assets/home/user-img.png",
    userName: "Андрій Петренко",
    userCountry: "Україна, Київ",
  },
  {
    id: 2,
    rating: 5,
    title: "Детальний супровід угоди",
    text: "Вперше купували будинок і дуже хвилювались. Але з KaRaMax все пройшло спокійно — супроводжували на кожному етапі.",
    userImg: "/esta/assets/home/user-img1.png",
    userName: "Ірина Шевченко",
    userCountry: "Україна, Івано-Франківськ",
  },
  {
    id: 3,
    rating: 5,
    title: "Зрозумілий інтерфейс",
    text: "Платформа проста й інтуїтивна. Швидко знайшов оренду в бажаному районі без зайвих дзвінків агентам.",
    userImg: "/esta/assets/home/user-img2.png",
    userName: "Максим Дяченко",
    userCountry: "Україна, Дніпро",
  },
  {
    id: 4,
    rating: 5,
    title: "Допомога з документами",
    text: "Мені допомогли з усією бюрократією при продажу квартири. Це була найбільша несподівана перевага KaRaMax.",
    userImg: "https://res.cloudinary.com/ddttjhllt/image/upload/v1753178512/fref_1_i6cjpi.jpg",
    userName: "Тетяна Мельник",
    userCountry: "Україна, Харків",
  },
  {
    id: 5,
    rating: 5,
    title: "Актуальні пропозиції",
    text: "На сайті лише актуальні оголошення — жодних 'вже здано' чи 'вже продано'. Це економить купу часу.",
    userImg: "https://res.cloudinary.com/ddttjhllt/image/upload/v1753179146/bt_2_rnfsu7.jpg",
    userName: "Юрій Савчук",
    userCountry: "Україна, Одеса",
  },
  {
    id: 6,
    rating: 5,
    title: "Рекомендую знайомим",
    text: "Користувалась сама і вже трьом друзям порадила. Завжди приємно, коли сервіс працює на всі 100%.",
    userImg: "https://res.cloudinary.com/ddttjhllt/image/upload/v1753178514/cdsc_fapqau.jpg",
    userName: "Наталія Бондар",
    userCountry: "Україна, Тернопіль",
  },
  {
    id: 7,
    rating: 5,
    title: "Знайшли інвест-об'єкт",
    text: "Шукали нерухомість для інвестицій — менеджер підібрав кілька варіантів, прорахував ROI. Дуже професійний підхід!",
    userImg: "https://res.cloudinary.com/ddttjhllt/image/upload/v1753179148/bt_1_ahgrgf.jpg",
    userName: "Роман Козак",
    userCountry: "Україна, Чернівці",
  },
];