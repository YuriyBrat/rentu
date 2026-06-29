import {
  Box,
  Stack,
  styled,
  Typography,
  Button,
  useTheme,
  Grid2,
  Divider,
  TextField,
} from "@mui/material";
import React, { useEffect, useRef } from "react";
import Iconify from "../../iconify/iconify";
import { LayoutContainer } from "../container";

const StyledAbstractStack = styled(Stack)(({ theme }) => ({
  position: "relative",
  padding: "80px 0 ",
  overflow: "hidden",
  zIndex: 1,
  ":before": {
    content: "url(/esta/assets/AbstractDesign-Footer-Left.png)",
    position: "absolute",
    zIndex: 0,
    left: 0,
    bottom: 0,
  },
  ":after": {
    content: "url(/esta/assets/AbstractDesign-Footer-Right.png)",
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
  width: 38,
  height: 38,
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  "& .component-iconify": {
    width: 24,
    height: 24,
  },
  "& .MuiSvgIcon-root": {
    fontSize: 22,
  },
}));

const RIELTOR_BUTTON_SCRIPT =
  "https://rieltor.ua/js/level_status.js?v=0.6342220391129253&id=408918";

const RieltorPartnerButton = () => {
  const anchorRef = useRef(null);

  useEffect(() => {
    const anchor = anchorRef.current;

    if (!anchor || anchor.dataset.rieltorLoaded === "true") return;

    anchor.dataset.rieltorLoaded = "true";

    const script = document.createElement("script");
    script.async = true;
    script.src = RIELTOR_BUTTON_SCRIPT;
    anchor.appendChild(script);
  }, []);

  return (
    <Box
      component="a"
      ref={anchorRef}
      href="https://rieltor.ua"
      id="rieltor_ua_408918"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Karamax на Rieltor.ua"
      sx={{
        display: "inline-flex",
        alignItems: "center",
        minHeight: 36,
        lineHeight: 0,
      }}
    >
      <Box
        component="span"
        sx={{
          display: "inline-flex",
          alignItems: "center",
          gap: 1,
          minHeight: 42,
          color: "#f7f7f7",
          transition: "0.2s",
          "&:hover": {
            opacity: 0.82,
          },
        }}
      >
        <Box
          component="span"
          sx={{
            width: 36,
            height: 42,
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            flex: "0 0 auto",
            background: "linear-gradient(180deg, #f7f8fb 0%, #d5d8de 100%)",
            clipPath: "polygon(0 0, 100% 0, 100% 72%, 50% 100%, 0 72%)",
            boxShadow: "0 1px 0 rgba(255, 255, 255, 0.65) inset",
          }}
        >
          <Box
            component="span"
            sx={{
              width: 27,
              height: 28,
              borderRadius: "4px",
              mt: "-8px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              color: "#ffffff",
              background: "linear-gradient(180deg, #a13cff 0%, #7224d8 100%)",
              boxShadow: "0 1px 4px rgba(73, 22, 145, 0.45)",
              fontSize: 19,
              fontWeight: 900,
              fontFamily: "Arial, sans-serif",
              lineHeight: 1,
            }}
          >
            R
            <Box
              component="span"
              sx={{
                mt: 0.1,
                color: "#ffffff",
                fontSize: 5.2,
                fontWeight: 800,
                letterSpacing: 0,
                lineHeight: 1,
              }}
            >
              WHITE
            </Box>
          </Box>
        </Box>
        <Box component="span" sx={{ display: "grid", gap: 0.55 }}>
          <Box
            component="span"
            sx={{
              color: "#f5f5f5",
              fontSize: 12,
              fontWeight: 700,
              lineHeight: 1,
              letterSpacing: 0,
              fontFamily: "Arial, sans-serif",
              whiteSpace: "nowrap",
            }}
          >
            RIELTOR.UA
          </Box>
          <Box
            component="span"
            sx={{
              color: "#ffffff",
              fontSize: 8.5,
              fontWeight: 500,
              lineHeight: 1,
              letterSpacing: 0.5,
              whiteSpace: "nowrap",
            }}
          >
            WHITE PARTNER
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

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
          <Grid2 container spacing={2} pb={5}>
            <Grid2 item xs={12} md={3} pr={{ xs: 0, md: "100px" }}>
              <Box component="a" href="/">
                <Box
                  component="img"
                  src="/esta/assets/logo.png"
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
            </Grid2>
            {FooterLink.map((item, i) => (
              <Grid2 item xs={6} md={1.8} key={i}>
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
              </Grid2>
            ))}
          </Grid2>
        </LayoutContainer>
        <Divider variant="fullWidth" orientation="horizontal" />
        <Stack py={1} bgcolor={theme.palette.background.main}>
          <LayoutContainer>
            <Stack
              direction={{ xs: "column", sm: "row" }}
              alignItems="center"
              justifyContent="space-between"
              gap={1.5}
            >
              <Stack
                direction="row"
                alignItems="center"
                gap={2}
                flexWrap="wrap"
                justifyContent={{ xs: "center", sm: "flex-start" }}
              >
                <Typography variant="subtitle1" color="text.secondary">
                  @2023 Estatein. All Rights Reserved.
                </Typography>
                <Typography variant="subtitle1" color="text.secondary">
                  Terms & Conditions
                </Typography>
              </Stack>

              <Stack direction="row" alignItems="center" gap={2} flexWrap="wrap" justifyContent="center">
                <RieltorPartnerButton />

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
