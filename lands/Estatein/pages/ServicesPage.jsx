import React from "react";
import AppLayout from "../components/app-layoout";
import {
  Stack,
  Typography,
  Divider,
  Grid,
  Box,
  styled,
  Button,
} from "@mui/material";
import { StyledGradienthBox } from "./Properties";
import { LayoutContainer } from "../components/app-layoout/container";
import ConvenientBar from "../components/Main/ConvenientBar";
import Services from "../_moc_data/Services";
import RepeatingSection, {
  StyledBox,
  StyledIconBox,
} from "../components/Services-page/RepeatingSection";
import StarIcon from "../components/icons/StarIcon";
import useWindowSize from "../hooks/useWindowSize";

const StyledAbstractBox = styled(Box)(({ theme }) => ({
  padding: "50px",
  background: "url(/assets/services/Abstract.png)",
  backgroundSize: "100% 100%",
  backgroundRepeat: "no-repeat",
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: "10px",
  height: "100%",
  boxSizing: "border-box",
  [theme.breakpoints.down("sm")]: {
    padding: "20px",
  },
}));

const InformedData = [
  {
    icon: "/assets/services/icon1.png",
    title: "Market Insight",
    text: "Stay ahead of market trends with our expert Market Analysis. We provide in-depth insights into real estate market conditions",
  },
  {
    icon: "/assets/services/icon9.png",
    title: "ROI Assessment",
    text: "Make investment decisions with confidence. Our ROI Assessment services evaluate the potential returns on your investments",
  },
  {
    icon: "/assets/services/icon10.png",
    title: "Customized Strategies",
    text: "Every investor is unique, and so are their goals. We develop Customized Investment Strategies tailored to your specific needs",
  },
  {
    icon: "/assets/services/icon8.png",
    title: "Diversification Mastery",
    text: "Diversify your real estate portfolio effectively. Our experts guide you in spreading your investments across various property types and locations",
  },
];

const ServicesPage = () => {
  const screenWidth = useWindowSize();
  return (
    <AppLayout>
      <Stack py="70px">
        <StyledGradienthBox>
          <LayoutContainer>
            <Stack>
              <Typography variant="h2" color="text.secondary" mb={2}>
                Elevate Your Real Estate Experience
              </Typography>

              <Typography
                variant="subtitle1"
                color="text.primary"
                width={{ xs: "100%", md: "70%" }}
              >
                Welcome to Estatein, where your real estate aspirations meet
                expert guidance. Explore our comprehensive range of services,
                each designed to cater to your unique needs and dreams.
              </Typography>
            </Stack>
          </LayoutContainer>
        </StyledGradienthBox>
        <Divider variant="fullWidth" orientation="horizontal" />
        <ConvenientBar />
        <Divider variant="fullWidth" orientation="horizontal" />
        <Stack>
          {Services.map((item, i) => (
            <RepeatingSection {...item} key={i} />
          ))}
        </Stack>

        <LayoutContainer>
          <Stack pt="100px">
            <Grid container spacing={3}>
              <Grid item xs={12} md={5}>
                <Stack height="100%">
                  <Box mb={2}>
                    <StarIcon />
                  </Box>
                  <Typography variant="h3" color="text.secondary" mb={2}>
                    Smart Investments, Informed Decisions
                  </Typography>
                  <Typography variant="subtitle1" color="text.secondary" mb={5}>
                    Building a real estate portfolio requires a strategic
                    approach. Estatein's Investment Advisory Service empowers
                    you to make smart investments and informed decisions.
                  </Typography>

                  <StyledAbstractBox>
                    <Typography variant="h6" color="text.secondary" mb={2}>
                      Unlock Your Investment Potential
                    </Typography>
                    <Typography variant="subtitle1" color="text.primary" mb={2}>
                      Explore our Property Management Service categories and let
                      us handle the complexities while you enjoy the benefits of
                      property ownership.
                    </Typography>
                    <Box width={{ xs: "100%", md: "50%" }}>
                      <Button variant="contained" color="primary" fullWidth>
                        Learn More
                      </Button>
                    </Box>
                  </StyledAbstractBox>
                </Stack>
              </Grid>
              <Grid item xs={12} md={7}>
                <Stack height="100%">
                  <Grid container spacing={2} height="100%">
                    {InformedData.map((item, i) => (
                      <Grid item xs={12} md={6} key={i}>
                        <StyledBox>
                          <Stack
                            direction={
                              screenWidth < 1100
                                ? screenWidth < 1000
                                  ? "row"
                                  : "column"
                                : "row"
                            }
                            alignItems="center"
                            gap={2}
                            mb={2}
                          >
                            <StyledIconBox component="img" src={item.icon} />
                            <Typography variant="h5" color="text.secondary">
                              {item.title}
                            </Typography>
                          </Stack>
                          <Typography variant="subtitle1" color="text.primary">
                            {item.text}
                          </Typography>
                        </StyledBox>
                      </Grid>
                    ))}
                  </Grid>
                </Stack>
              </Grid>
            </Grid>
          </Stack>
        </LayoutContainer>
      </Stack>
    </AppLayout>
  );
};

export default ServicesPage;
