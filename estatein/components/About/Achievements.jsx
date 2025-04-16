import { Box, Grid, Stack, Typography, styled } from "@mui/material";
import React from "react";
import StarIcon from "../icons/StarIcon";

const StyledBox = styled(Box)(({ theme }) => ({
  boxShadow: `0px 0px 15px 0px ${theme.palette.background[100]}`,
  border: `1px solid ${theme.palette.divider}`,
  padding: "30px",
  borderRadius: "10px",
  display: "flex",
  flexDirection: "column",
  gap: "15px",
  height: "100%",

  [theme.breakpoints.down("md")]: {
    height: "auto",
  },
}));

const Achievements = () => {
  return (
    <Stack py={4} mb={5}>
      <Box mb={2}>
        <StarIcon />
      </Box>
      <Typography variant="h3" color="text.secondary" mb={2}>
        Our Achievements
      </Typography>
      <Typography
        variant="subtitle1"
        color="text.secondary"
        width={{ xs: "100%", md: "60%" }}
        mb={5}
      >
        Our story is one of continuous growth and evolution. We started as a
        small team with big dreams, determined to create a real estate platform
        that transcended the ordinary.
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <StyledBox>
            <Typography variant="h6" color="text.secondary">
              3+ Years of Excellence
            </Typography>
            <Typography variant="subtitle2" color="text.primary">
              With over 3 years in the industry, we've amassed a wealth of
              knowledge and experience.
            </Typography>
          </StyledBox>
        </Grid>
        <Grid item xs={12} md={4}>
          <StyledBox>
            <Typography variant="h6" color="text.secondary">
              Happy Clients
            </Typography>
            <Typography variant="subtitle2" color="text.primary">
              Our greatest achievement is the satisfaction of our clients. Their
              success stories fuel our passion for what we do.
            </Typography>
          </StyledBox>
        </Grid>
        <Grid item xs={12} md={4}>
          <StyledBox>
            <Typography variant="h6" color="text.secondary">
              Industry Recognition
            </Typography>
            <Typography variant="subtitle2" color="text.primary">
              We've earned the respect of our peers and industry leaders, with
              accolades and awards that reflect our commitment to excellence.
            </Typography>
          </StyledBox>
        </Grid>
      </Grid>
    </Stack>
  );
};

export default Achievements;
