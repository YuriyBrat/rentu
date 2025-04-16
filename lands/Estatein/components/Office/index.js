import { Box, Grid, Stack, Typography, styled } from "@mui/material";
import React, { useState } from "react";
import StarIcon from "../icons/StarIcon";
import { Swiper, SwiperSlide } from "swiper/react";
import { EffectCoverflow, Navigation } from "swiper/modules";
import ContactData from "../../_moc_data/ContactData";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/scrollbar";
import OfficeItem from "./OfficeItem";
import useWindowSize from "../../hooks/useWindowSize";
import { TooViewCarousel } from "../../hooks/CarouselView";

const StyledChangeBox = styled(Box)(({ theme }) => ({
  padding: "5px 25px",
  cursor: "pointer",
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: "8px",
  userSelect: "none",
  "&.active": {
    background: theme.palette.background.default,
  },
}));

const StyledWrapperGrid = styled(Grid)(({ theme }) => ({
  display: "flex",
  background: theme.palette.background.main,
  padding: "10px",
  gap: "10px",
  borderRadius: "8px",
}));

const Page = () => {
  const [active, setActive] = useState("all");
  const screenWidth = useWindowSize();
  const handleChangeFilter = (index) => {
    setActive(index);
  };
  const FilterData = ContactData.filter((item) =>
    active === "all" ? item : item.status === active
  );
  return (
    <Stack py="70px">
      <Stack>
        <Box mb={2}>
          <StarIcon />
        </Box>
        <Typography variant="h3" color="text.secondary" mb={2}>
          Discover Our Office Locations
        </Typography>
        <Typography
          variant="subtitle1"
          color="text.primary"
          width={{ xs: "100%", md: "60%" }}
          mb={5}
        >
          Estatein is here to serve you across multiple locations. Whether
          you're looking to meet our team, discuss real estate opportunities, or
          simply drop by for a chat, we have offices conveniently located to
          serve your needs. Explore the categories below to find the Estatein
          office nearest to you
        </Typography>
      </Stack>

      <Grid container>
        <StyledWrapperGrid item>
          <StyledChangeBox
            className={active === "all" ? "active" : ""}
            onClick={() => handleChangeFilter("all")}
          >
            <Typography variant="subtitle1" color="text.secondary">
              All
            </Typography>
          </StyledChangeBox>
          <StyledChangeBox
            className={active === "regional" ? "active" : ""}
            onClick={() => handleChangeFilter("regional")}
          >
            <Typography variant="subtitle1" color="text.secondary">
              Regional
            </Typography>
          </StyledChangeBox>
          <StyledChangeBox
            className={active === "international" ? "active" : ""}
            onClick={() => handleChangeFilter("international")}
          >
            <Typography variant="subtitle1" color="text.secondary">
              International
            </Typography>
          </StyledChangeBox>
        </StyledWrapperGrid>
      </Grid>

      <Box py="20px">
        <Swiper
          grabCursor={true}
          centeredSlides={false}
          slidesPerView={TooViewCarousel(screenWidth)}
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
          navigation={false}
        >
          {FilterData.map((item, i) => (
            <SwiperSlide key={i}>
              <OfficeItem {...item} />
            </SwiperSlide>
          ))}
        </Swiper>
      </Box>
    </Stack>
  );
};

export default Page;
