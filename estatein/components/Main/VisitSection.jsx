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
import CounterBox from "../CounterBox";
import { LayoutContainer } from "../app-layoout/container";
import Image from "../image/image";

const StyledWrapperStack = styled(Stack)(({ theme }) => ({
  position: "relative",
  height: "100%",
  ":before": {
    content: "url(/esta/assets/home/Image.png)",
    right: 0,
    top: "76px",
    zIndex: 1,
    position: "absolute",
    background: theme.palette.grey[900],
  },

  [theme.breakpoints.down("sm")]: {
    ":before": {
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
  left: "47%",
  top: "30%",
  animation: `${rotateAnimation} 10s linear infinite`,
  [theme.breakpoints.down("md")]: {
    width: "110px",
    top: "29%",
    left: "0%",
  },
}));

const VisitSection = () => {
  return (
    <StyledWrapperStack>
      <LayoutContainer>
        <Grid2
          container
          pt="40px"
          pb={{ xs: "20px", md: "252px" }}
          sx={{ position: "relative", zIndex: 5 }}
        >
          {/* <Grid2 item xs={12} md={6} pt={{ xs: "30px", md: "180px" }}> */}
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
            <Stack direction="column" mb={7}>
              <Typography variant="h3" mb={2} color="text.secondary">
                Discover Your Dream <br /> Property with Estatein
              </Typography>
              <Typography variant="body1" color="text.secondary" width="85%">
                Your journey to finding the perfect property begins here.
                Explore our listings to find the home that matches your dreams.
              </Typography>
            </Stack>

            <Stack
              direction={{ xs: "column", md: "row" }}
              gap={2}
              mb={7}
              pt={{ xs: 0, sm: 12, md: 0 }}
              width={{ xs: "100%", md: "100%", lg: "80%" }}
            >
              <Button variant="contained" color="primary" fullWidth>
                Learn More
              </Button>
              <Button variant="contained" size="large" fullWidth>
                Browse Properties
              </Button>
            </Stack>
            <CounterBox />
          </Grid2>

          <Grid2 item xs={12} md={6} position="relative">
          </Grid2>

        </Grid2>
      </LayoutContainer>
    </StyledWrapperStack>
  );
};

export default VisitSection;
