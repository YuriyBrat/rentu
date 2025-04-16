import {
  Box,
  Stack,
  styled,
  Typography,
  Button,
  useTheme,
  Grid,
  Divider,
  TextField,
} from "@mui/material";
import React from "react";
import Iconify from "../../iconify/iconify";
import { LayoutContainer } from "../container";

const StyledAbstractStack = styled(Stack)(({ theme }) => ({
  position: "relative",
  padding: "80px 0 ",
  overflow: "hidden",
  zIndex: 1,
  ":before": {
    content: "url(/assets/AbstractDesign-Footer-Left.png)",
    position: "absolute",
    zIndex: 0,
    left: 0,
    bottom: 0,
  },
  ":after": {
    content: "url(/assets/AbstractDesign-Footer-Right.png)",
    position: "absolute",
    zIndex: 0,
    right: 0,
    bottom: 0,
  },
  [theme.breakpoints.down("sm")]: {
    padding: "50px 0 ",
    ":before": {
      top: "-80px",
    },
    ":after": {
      bottom: "-80px",
    },
  },
}));

const StyledEmailBox = styled(Box)(({ theme }) => ({
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: "5px",
  padding: "2px 11px 2px 0px",
  display: "flex",
  alignItems: "center",
  fieldset: {
    border: "none !important",
  },
}));

const StyledLinkTage = styled(Box)(({ theme }) => ({
  color: theme.palette.text.secondary,
  textDecoration: "none",
  padding: "10px 3px",
  display: "inline-block",
  fontWeight: 500,
  fontFamily: '"Urbanist"',
}));

const StyledTargerLink = styled(Box)(({ theme }) => ({
  color: theme.palette.text.secondary,
  textDecoration: "none",
  padding: "10px 3px",
  display: "inline-block",
}));
const AppFooter = () => {
  const theme = useTheme();
  return (
    <Stack bgcolor={theme.palette.background.default}>
      <Divider variant="fullWidth" orientation="horizontal" />
      <StyledAbstractStack>
        <LayoutContainer>
          <Stack
            direction={{ xs: "column", md: "row" }}
            alignItems="center"
            justifyContent="space-between"
            gap={3}
            position="relative"
            zIndex={1}
          >
            <Stack direction="column" gap={2} width={{ xs: "100%", md: "60%" }}>
              <Typography variant="h4" color="text.secondary">
                Start Your Real Estate Journey Today
              </Typography>
              <Typography variant="subtitle1" color="text.secondary">
                Your dream property is just a click away. Whether you're looking
                for a new home, a strategic investment, or expert real estate
                advice, Estatein is here to assist you every step of the way.
                Take the first step towards your real estate goals and explore
                our available properties or get in touch with our team for
                personalized assistance.
              </Typography>
            </Stack>
            <Stack textAlign="right" width={{ xs: "100%", md: "13%" }}>
              <Button variant="contained" color="primary" fullWidth>
                Explore Properties
              </Button>
            </Stack>
          </Stack>
        </LayoutContainer>
      </StyledAbstractStack>
      <Divider variant="fullWidth" orientation="horizontal" />

      <Stack pt={10}>
        <LayoutContainer>
          <Grid container spacing={2} pb={5}>
            <Grid item xs={12} md={3} pr={{ xs: 0, md: "100px" }}>
              <Box component="a" href="/">
                <Box
                  component="img"
                  src="/assets/logo.png"
                  width={{ xs: "120px", md: "auto" }}
                />
              </Box>
              <StyledEmailBox mt={2}>
                <TextField
                  id="email"
                  placeholder="Enter Your Email"
                  size="small"
                  sx={{ border: "none !important" }}
                  fullWidth
                />
                <Box
                  color="text.secondary"
                  sx={{ cursor: "pointer", pt: "5px" }}
                >
                  <Iconify icon="mingcute:send-fill" />
                </Box>
              </StyledEmailBox>
            </Grid>
            {FooterLink.map((item, i) => (
              <Grid item xs={6} md={1.8} key={i}>
                <Typography variant="subtitle1" color="grey" mb={2}>
                  {item.title}
                </Typography>
                <Box
                  component="ul"
                  sx={{
                    listStyle: "none",
                    margin: "0 !important",
                    padding: "0",
                  }}
                >
                  {item?.child.map((child, i) => (
                    <Box component="li" key={i}>
                      <StyledLinkTage component="a" href={child.link}>
                        {child.title}
                      </StyledLinkTage>
                    </Box>
                  ))}
                </Box>
              </Grid>
            ))}
          </Grid>
        </LayoutContainer>
        <Divider variant="fullWidth" orientation="horizontal" />
        <Stack py={1} bgcolor={theme.palette.background.main}>
          <LayoutContainer>
            <Stack
              direction="row"
              alignItems="center"
              justifyContent="space-between"
            >
              <Stack direction="row" alignItems="center" gap={2}>
                <Typography variant="subtitle1" color="text.secondary">
                  @2023 Estatein. All Rights Reserved.
                </Typography>
                <Typography variant="subtitle1" color="text.secondary">
                  Terms & Conditions
                </Typography>
              </Stack>

              <Stack direction="row" alignItems="center" gap={2}>
                <StyledTargerLink component="a" href="/">
                  <Iconify icon="mingcute:facebook-line" />
                </StyledTargerLink>
                <StyledTargerLink component="a" href="/">
                  <Iconify icon="mdi:linkedin" />
                </StyledTargerLink>
                <StyledTargerLink component="a" href="/">
                  <Iconify icon="ri:twitter-fill" />
                </StyledTargerLink>
                <StyledTargerLink component="a" href="/">
                  <Iconify icon="mdi:youtube" />
                </StyledTargerLink>
              </Stack>
            </Stack>
            <Stack direction="row" alignItems="center" justifyContent="center" gap={1}>
              <Typography variant="subtitle2" color="text.secondary">Designed by</Typography>
              <Typography component="a" href="https://www.figma.com/community/file/1314076616839640516" variant="subtitle2" color="primary">Produce UI</Typography>
            </Stack>
          </LayoutContainer>
        </Stack>
      </Stack>
    </Stack>
  );
};

export default AppFooter;

const FooterLink = [
  {
    id: 0,
    title: "Home",
    child: [
      {
        link: "/",
        title: "Hero Section",
      },
      {
        link: "/",
        title: "Features",
      },
      {
        link: "/",
        title: "Properties",
      },
      {
        link: "/",
        title: "Testimanials",
      },
      {
        link: "/",
        title: "FAQ's",
      },
    ],
  },
  {
    id: 1,
    title: "About Us",
    child: [
      {
        link: "/",
        title: "Our Story",
      },
      {
        link: "/",
        title: "Our Works",
      },
      {
        link: "/",
        title: "How It Works",
      },
      {
        link: "/",
        title: "Our Team",
      },
      {
        link: "/",
        title: "Our Clients",
      },
    ],
  },
  {
    id: 1,
    title: "Properties",
    child: [
      {
        link: "/",
        title: "Portfolio",
      },
      {
        link: "/",
        title: "Categories",
      },
    ],
  },
  {
    id: 1,
    title: "Services",
    child: [
      {
        link: "/",
        title: "Valuation Mastery",
      },
      {
        link: "/",
        title: "Strategic Marketing",
      },
      {
        link: "/",
        title: "Negotiation Wizardry",
      },
      {
        link: "/",
        title: "Closing Success",
      },
      {
        link: "/",
        title: "Property Management",
      },
    ],
  },
  {
    id: 1,
    title: "Contact Us",
    child: [
      {
        link: "/",
        title: "Contact Form",
      },
      {
        link: "/",
        title: "Our Offices",
      },
    ],
  },
];
