import React from "react";
import AppLayout from "../components/app-layoout";
import { LayoutContainer } from "../components/app-layoout/container";
import {
  Box,
  Grid,
  Stack,
  Typography,
  styled,
  Divider,
  useTheme,
} from "@mui/material";
import Iconify from "../components/iconify/iconify";
import HauseCarousel from "../components/PropertiesView/Hause-carousel/HauseCarousel";
import FormPage from "../components/PropertiesView/Form";
import Details from "../components/PropertiesView/Details";
import AskedQuestionCarousel from "../components/PropertiesView/Question-carousel";
import useWindowSize from "../hooks/useWindowSize";

const StyledLocationBox = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  padding: "5px 10px",
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: "10px",
  color: theme.palette.text.secondary,
}));

const StyledBorderStack = styled(Stack)(({ theme }) => ({
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: "8px",
  padding: "35px",
  [theme.breakpoints.down("sm")]: {
    padding: "15px",
  },
}));

const StyledKeyBox = styled(Box)(({ theme }) => ({
  background:
    "linear-gradient(90.00deg, rgb(26, 26, 26),rgba(26, 26, 26, 0) 100%)",
  display: "flex",
  alignItems: "center",
  padding: "7px 10px",
  color: theme.palette.text.secondary,
  borderLeft: `2px solid ${theme.palette.primary.main}`,
  gap: "10px",
}));

const PropertiesView = () => {
  const theme = useTheme();
  const borderValue = `1px solid ${theme.palette.divider}`;
  const screenWidth = useWindowSize();
  return (
    <AppLayout>
      <LayoutContainer>
        <Stack
          direction="row"
          alignItems={{ xs: "flex-end", md: "center" }}
          justifyContent="space-between"
          pb={{ xs: "40px", md: "70px" }}
          pt={{ xs: "100px", md: "200px" }}
        >
          <Stack
            direction={{ xs: "column", md: "row" }}
            alignItems={{ xs: "start", md: "center" }}
            gap={2}
          >
            <Typography variant="h5" color="text.secondary">
              Seaside Serenity Villa
            </Typography>
            <StyledLocationBox>
              <Iconify icon="carbon:location" />
              <Typography variant="body1" color="text.secondary">
                Malibu, California
              </Typography>
            </StyledLocationBox>
          </Stack>

          <Stack direction="column">
            <Typography variant="body1" color="text.primary">
              Price
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              $1,250,000
            </Typography>
          </Stack>
        </Stack>
        <HauseCarousel />
        <Grid container spacing={2} pb={{ xs: 3, md: 8 }}>
          <Grid item xs={12} md={6}>
            <StyledBorderStack direction="column" gap={1}>
              <Typography variant="subtitle1" color="text.secondary">
                Description
              </Typography>
              <Typography variant="body1" color="text.primary" mb={3}>
                Discover your own piece of paradise with the Seaside Serenity
                Villa. T With an open floor plan, breathtaking ocean views from
                every room, and direct access to a pristine sandy beach, this
                property is the epitome of coastal living.
              </Typography>

              <Divider variant="fullWidth" orientation="horizontal" />
              <Stack
                direction="row"
                flexWrap={{ xs: "wrap", md: "nowrap" }}
                justifyContent="space-between"
                pt={2}
              >
                <Stack
                  direction="column"
                  gap={1}
                  borderRight={borderValue}
                  width={{ xs: "45%", md: "100%" }}
                >
                  <Stack direction="row" alignItems="center" gap={1}>
                    <Iconify
                      icon="ic:outline-bed"
                      sx={{ color: "text.primary" }}
                    />
                    <Typography variant="body1" color="text.primary">
                      Bedrooms
                    </Typography>
                  </Stack>
                  <Typography variant="subtitle2" color="text.secondary">
                    04
                  </Typography>
                </Stack>
                <Stack
                  direction="column"
                  gap={1}
                  borderRight={{ xs: "none", md: borderValue }}
                  width={{ xs: "45%", md: "100%" }}
                  pl={{ xs: 0, md: 2 }}
                  pb={{ xs: 2, md: 0 }}
                >
                  <Stack direction="row" alignItems="center" gap={1}>
                    <Iconify icon="uil:bath" sx={{ color: "text.primary" }} />
                    <Typography variant="body1" color="text.primary">
                      Bathrooms
                    </Typography>
                  </Stack>
                  <Typography variant="subtitle2" color="text.secondary">
                    03
                  </Typography>
                </Stack>

                <Stack
                  direction="column"
                  gap={1}
                  width="100%"
                  pl={{ xs: 0, md: 3 }}
                  borderTop={{ xs: borderValue, md: "none" }}
                  pt={{ xs: 2, md: 0 }}
                  mt={screenWidth < 1000 ? 2 : 0}
                >
                  <Stack direction="row" alignItems="center" gap={1}>
                    <Iconify
                      icon="mdi:surface-area"
                      sx={{ color: "text.primary" }}
                    />
                    <Typography variant="body1" color="text.primary">
                      Area
                    </Typography>
                  </Stack>
                  <Typography variant="subtitle2" color="text.secondary">
                    2,500 Square Feet
                  </Typography>
                </Stack>
              </Stack>
            </StyledBorderStack>
          </Grid>

          <Grid item xs={12} md={6}>
            <StyledBorderStack direction="column" gap={2}>
              <Typography variant="subtitle1" color="text.secondary">
                Key Feature and Amenities
              </Typography>
              {keyData.map((text, index) => (
                <StyledKeyBox key={index}>
                  <Iconify icon="ph:lightning-fill" />
                  <Typography variant="subtitle1" color="text.primary">
                    {text}
                  </Typography>
                </StyledKeyBox>
              ))}
            </StyledBorderStack>
          </Grid>
        </Grid>

        <FormPage />
        <Details />
        <AskedQuestionCarousel />
      </LayoutContainer>
    </AppLayout>
  );
};

export default PropertiesView;

const keyData = [
  "Expansive oceanfront terrace for outdoor entertaining",
  "Gourmet kitchen with top-of-the-line appliances",
  "Private beach access for morning strolls and sunset views",
  "Master suite with a spa-inspired bathroom and ocean-facing balcony",
  "Private garage and ample storage space",
];
