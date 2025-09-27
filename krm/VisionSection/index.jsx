'use client'

import {
   Box,
   Grid,
   Grid2,
   Stack,
   Typography,
   styled,
   keyframes,
   Button,
} from "@mui/material";
import React from "react";
// import CounterBox from "../CounterBox";
import { LayoutContainer } from "../container";
import Image from "@/estatein/components/image/image";


import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, EffectFade } from "swiper/modules";
import "swiper/css";
import "swiper/css/effect-fade";

const tips = [
   "Перевіряйте документи перед покупкою",
   "Сайт оновлюється щодня — перевіряйте новинки",
   "Порівнюйте ціни по районах перед вибором",
   "Зберігайте обрані обʼєкти — не втрачайте шанс",
   "Фільтруйте за ціною, кількістю кімнат і площею",
   "Дивіться фото в повноекранному режимі для деталей",
   "Підписуйтеся на оновлення, щоб не пропустити вигідні пропозиції",
   "Оцініть інфраструктуру району перед купівлею",
   "Уточнюйте поверх, тип стін і стан будинку",
   "Звертайте увагу на площу кухні та санвузла",
   "Не відкладайте перегляд, якщо обʼєкт вас зацікавив",
   "Обговорюйте умови з продавцем — часто можливий торг",
   "Зберігайте фільтри пошуку для швидшого доступу",
   "Чим більше фото — тим більше довіри до обʼєкта",
   // "Порівнюйте вартість квадратного метра по районах",
   "Використовуйте мапу для оцінки локації",
   "Час реагування — вирішальний на гарячих об'єктах",
   // "Перевіряйте будинок по кадастровій карті",
   "Часто найкращі пропозиції — серед нових обʼєктів",
   "Додавайте нотатки до обʼєктів, щоб не забути деталі",
 ];
 

// const tips = [
//    {
//       text: "Перевіряйте документи перед покупкою",
//       avatar: "https://avatars.alphacoders.com/222681.jpg",
//       tailPosition: "left",
//       borderRadius: "24px 16px 24px 24px",
//    },
//    {
//       text: "Сайт оновлюється щодня — перевіряйте новинки",
//       avatar: "https://image.freepik.com/.../cute-baby-orange-tiger-cub.jpg",
//       tailPosition: "center",
//       borderRadius: "32px",
//    },
//    {
//       text: "Порівнюйте ціни по районах перед вибором",
//       avatar: "https://vectorstock.com/.../avatar-tiger-icon.jpg",
//       tailPosition: "right",
//       borderRadius: "24px 24px 16px 24px",
//    },
//    {
//       text: "Зберігайте обрані обʼєкти — не втрачайте шанс",
//       avatar: "https://cdn.dreamstime.com/.../baby-tiger-face.jpg",
//       tailPosition: "center",
//       borderRadius: "20px 28px 24px 20px",
//    },
// ];



// const getTailStyle = (position = "left" | "center" | "right") => {
//    const base = {
//       content: "''",
//       position: "absolute",
//       top: "-10px",
//       width: 0,
//       height: 0,
//       borderLeft: "10px solid transparent",
//       borderRight: "10px solid transparent",
//       borderBottom: "10px solid rgba(255,255,255,0.95)",
//       zIndex: 1,
//    };

//    if (position === "left") return { ...base, left: "20px" };
//    if (position === "right") return { ...base, right: "20px" };
//    return { ...base, left: "calc(50% - 10px)" };
// };


const StyledWrapperStack = styled(Stack)(({ theme }) => ({
   position: "relative",
   width: "100%",
   maxHeight: "60vh", // Зменшено на 25%
   backgroundImage: `url('/krm/krm-city2.jpg')`,
   backgroundSize: "cover",
   backgroundRepeat: "no-repeat",
   backgroundPosition: "center center",
   overflow: "hidden",

   "&::before": {
      content: "''",
      position: "absolute",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      zIndex: 1,
      pointerEvents: "none",
      background: "radial-gradient(ellipse at center, rgba(0,0,0,0.25) 0%, rgba(0,0,0,0.45) 70%, rgba(0,0,0,0.75) 100%)",
      // Радіальний градієнт, сильніше затемнення по краях
   },

   [theme.breakpoints.down("sm")]: {
      backgroundImage: "none",
      "&::before": {
         display: "none",
      },
   },
}));

const rotateAnimation = keyframes`
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  `;

const StyledRoundBox = styled(Box)(({ theme }) => ({
   position: "absolute",
   left: "43%",
   top: "38%",
   animation: `${rotateAnimation} 10s linear infinite`,
   [theme.breakpoints.down("md")]: {
      width: "110px",
      top: "29%",
      left: "0%",
   },
}));

const VisitSection = () => {
   return (
      <>

         {/* Тут просто текст міняється */}
         <Box
            sx={{
               position: "absolute",
               top: "30%", // 🔸 трішки нижче
               left: "8%",
               zIndex: 3,
               color: "white",
               fontSize: "1.2rem",
               fontWeight: 400,
               textAlign: "left",
               maxWidth: "300px",
               whiteSpace: "normal",
            }}
         >
            <Swiper
               modules={[Autoplay, EffectFade]}
               effect="fade"
               fadeEffect={{ crossFade: true }}
               autoplay={{ delay: 8000, disableOnInteraction: false }}
               loop
               allowTouchMove={false}
               style={{ width: "100%" }}
            >
               {tips.map((tip, idx) => (
                  <SwiperSlide key={idx}>
                     <Box
                        sx={{
                           lineHeight: 1.5,
                           fontSize: "1.1rem",
                           transition: "opacity 0.8s ease-in-out",
                        }}
                     >
                        {tip}
                     </Box>
                  </SwiperSlide>
               ))}
            </Swiper>
         </Box>


         <Box
            sx={{
               position: "absolute",
               top: "18%",
               right: "8%",
               zIndex: 3,
               display: "flex",
               flexDirection: "column",
               gap: 2,
            }}
         >
            {[
               { number: "400+", label: "угод з продажу" },
               { number: "8+", label: "років досвіду" },
               { number: "1000+", label: "актуальних об'єктів" },
            ].map((item, index) => (
               <Box
                  key={index}
                  sx={{
                     backgroundColor: "rgba(255, 255, 255, 0.12)",
                     border: "1px solid rgba(255, 255, 255, 0.3)",
                     borderRadius: "12px",
                     px: 2,
                     py: 0.3,
                     backdropFilter: "blur(6px)",
                     color: "white",
                     fontSize: "1rem",
                     fontWeight: 400,
                     boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                     textAlign: "center",
                     whiteSpace: "nowrap",
                     minWidth: "150px",
                  }}
               >
                  <Box sx={{ fontWeight: 600, fontSize: "1.4rem", lineHeight: 1.2 }}>{item.number}</Box>
                  <Box sx={{ fontSize: "1rem" }}>{item.label}</Box>
               </Box>
            ))}
         </Box>


         <StyledWrapperStack>
            <LayoutContainer>
               <Grid2
                  container
                  pt="20px"
                  pb={{ xs: "20px", md: "252px" }}
                  sx={{ position: "relative", zIndex: 5 }}
               >

                  <Stack
                     direction="column"
                     alignItems="center"
                     justifyContent="center"
                     textAlign="center"
                     // spacing={1}
                     sx={{
                        position: 'absolute',
                        top: '25%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        zIndex: 2,
                     }}
                  >
                     <Typography variant="h2" color="text.secondary">
                        Вас вітає{" "}
                        <Box component="span" sx={{ color: "#ff8803", fontWeight: 600 }}>
                           Karamax
                        </Box>
                        <Box
                           component="span"
                           sx={{
                              display: "inline-block",
                              width: "8px",
                              height: "8px",
                              backgroundColor: "white",
                              ml: 0.5,
                           }}
                        />
                     </Typography>

                     <Typography
                        variant="subtitle2"
                        color="text.secondary"
                        sx={{
                           fontSize: "1.5rem",
                           mt: -1.5, // 🔸 це зменшує відстань у 2 рази
                        }}
                     >
                        Обирай житло у нас
                     </Typography>
                  </Stack>



                  <Grid2 size={{ xs: 12, md: 6 }} pt={{ xs: "30px", md: "180px" }}>


                     <Box display={{ xs: "block", sm: "none", md: "none" }} mb={10}>
                        <Image src="/esta/assets/home/Image-mobile.png" />
                     </Box>

                     <StyledRoundBox>
                        <Box
                           component="img"
                           src="/esta/assets/home/round-text.svg"
                           width="100%"
                        />
                     </StyledRoundBox>

                     {/* <Stack direction="column" mb={7}> */}
                     {/* <Typography variant="h3" mb={2} color="text.secondary">
                        Discover Your Dream <br /> Property with Estatein
                     </Typography> */}
                     {/* <Typography variant="body1" color="text.secondary" width="85%">
                           Your journey to finding the perfect property begins here.
                           Explore our listings to find the home that matches your dreams.
                        </Typography> */}
                     {/* </Stack> */}


                     {/* <CounterBox /> */}
                  </Grid2>

                  {/* <Grid2 item xs={12} md={6} position="relative">
                  robt roij rob o
               </Grid2> */}

               </Grid2>
            </LayoutContainer>
         </StyledWrapperStack>
      </>
   );
};

export default VisitSection;
