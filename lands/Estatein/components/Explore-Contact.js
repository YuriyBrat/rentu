import { Box, Grid, styled, Typography } from "@mui/material";
import React from "react";
import StarIcon from "./icons/StarIcon";
import Image from "./image/image";


const StyledWrapperBox = styled(Box)(({ theme }) => ({
  padding: "40px",
  background: theme.palette.background.main,
  backgroundImage: "url(/assets/contactAbstract.svg)",
  backgroundRepeat: "no-repeat",
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: "10px",
  marginBottom: "100px",

  [theme.breakpoints.down("sm")]: {
    padding: "20px",
  },
}));

const ExploreContact = () => {
  return (
    <StyledWrapperBox>
      <Grid container spacing={{ xs: 2, md: 6 }}>
        <Grid item xs={12} md={6}>
          <Image sx={{ borderRadius: "4px" }} src="/assets/contact/Image.png" ratio="21/9" />
        </Grid>
        <Grid item xs={12} md={6}>
          <Image sx={{ borderRadius: "4px" }} src="/assets/contact/Image1.png" ratio="21/9" />
        </Grid>
        <Grid item xs={12} md={12} lg={6}>
          <Image sx={{ borderRadius: "4px" }} src="/assets/contact/Image2.png" ratio="21/9" />
        </Grid>
        <Grid item xs={12} md={6} lg={3} display={{ xs: "none", md: "block" }}>
          <Image sx={{ borderRadius: "4px" }} src="/assets/contact/Image3.png" ratio="4/3" />
        </Grid>
        <Grid item xs={12} md={6} lg={3} display={{ xs: "none", md: "block" }}>
          <Image sx={{ borderRadius: "4px" }} src="/assets/contact/Image4.png" ratio="4/3" />
        </Grid>
        <Grid item xs={12} lg={6}>
          <Box mb={2}>
            <StarIcon />
          </Box>
          <Typography variant="h5" color="text.secondary">
            Explore Estatein's World
          </Typography>
          <Typography variant="subtitle1" color="text.primary">
            Step inside the world of Estatein, where professionalism meets
            warmth, and expertise meets passion. Our gallery offers a glimpse
            into our team and workspaces, inviting you to get to know us better.
          </Typography>
        </Grid>
        <Grid item xs={12} lg={6}>
          <Image
            sx={{ borderRadius: "4px" }}
            src="/assets/contact/Image5.png"
            ratio="21/9"
          />
        </Grid>
      </Grid>
    </StyledWrapperBox>
  );
};

export default ExploreContact;
