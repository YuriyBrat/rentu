import React from "react";
import AppLayout from "../components/app-layoout";
import { Box, Grid, Stack, Typography } from "@mui/material";
import { LayoutContainer } from "../components/app-layoout/container";
import StarIcon from "../components/icons/StarIcon.js";
import CounterBox from "../components/CounterBox.js";
import OurValues from "../components/About/OurValues.js";
import Achievements from "../components/About/Achievements.js";
import Experience from "../components/About/Experience.js";
import Team from "../components/About/Team.js";
import Clients from "../components/About/OurClients/Clients.js";
import Image from "../components/image/image.js";

const AboutUs = () => {
  return (
    <AppLayout>
      <Stack pt="140px">
        <LayoutContainer>
          <Grid
            container
            flexDirection={{ xs: "column-reverse", md: "row" }}
            pb={5}
            spacing={2}
          >
            <Grid
              item
              xs={12}
              md={7}
              lg={6}
              pr={{ xs: 0, md: "20px", lg: "60px" }}
            >
              <Box mb={2}>
                <StarIcon />
              </Box>
              <Box mb={{ xs: "30px", md: "30px", lg: "70px" }}>
                <Typography variant="h2" color="text.secondary">
                  Our Journey
                </Typography>
                <Typography variant="subtitle1" color="text.primary">
                  Our story is one of continuous growth and evolution. We
                  started as a small team with big dreams, determined to create
                  a real estate platform that transcended the ordinary. Over the
                  years, we've expanded our reach, forged valuable partnerships,
                  and gained the trust of countless clients.
                </Typography>
              </Box>

              <CounterBox />
            </Grid>
            <Grid item xs={12} md={5} lg={6}>
              <Image src="/assets/about/home.png" ratio="4/3" />
            </Grid>
          </Grid>
          <OurValues />
          <Achievements />
          <Experience />
          <Team />
          <Clients />
        </LayoutContainer>
      </Stack>
    </AppLayout>
  );
};

export default AboutUs;
