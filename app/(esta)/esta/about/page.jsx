'use client'

import AppLayout from "@/estatein/components/app-layoout";
import { Box, Grid, Stack, Typography } from "@mui/material";
import { LayoutContainer } from "@/estatein/components/app-layoout/container";
import StarIcon from "@/estatein/components/icons/StarIcon";

import CounterBox from "@/estatein/components/CounterBox";

import OurValues from "@/estatein/components/About/OurValues";
import Achievements from "@/estatein/components/About/Achievements";
import Experience from "@/estatein/components/About/Experience";
import Team from "@/estatein/components/About/Team";
import Clients from "@/estatein/components/About/OurClients/Clients";
import Image from "@/estatein/components/image/image";

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
              <Image src="/esta/assets/about/home.png" ratio="4/3" />
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
