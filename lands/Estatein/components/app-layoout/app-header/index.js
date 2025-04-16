import React from "react";
import { Stack, Box, styled, useTheme, Divider } from "@mui/material";
import MobileMenu from "./mobile-menu";
import { LayoutContainer } from "../container";

const StyledLinkTage = styled(Box)(({ theme }) => ({
  padding: "12px 20px",
  fontWeight: 500,
  cursor: "pointer",
  textDecoration: "none",
  border: `1px solid transparent`,
  fontFamily: '"Urbanist"',
  "&.active": {
    borderRadius: "10px",
    background: theme.palette.background.default,
    border: `1px solid ${theme.palette.divider}`,
  },
}));

export const headerNav = [
  { title: "Home", href: "/" },
  { title: "About Us", href: "/about" },
  { title: "Properties", href: "/our-facility" },
  { title: "Property View", href: "/our-facility/444" },
  { title: "Services", href: "/services" },
];

const AppHeader = () => {
  const theme = useTheme();
  const pathName = window.location.pathname;
  return (
    <header>
      <Box
        bgcolor={theme.palette.background.main}
        sx={{
          position: "fixed",
          width: "100%",
          left: 0,
          right: 0,
          zIndex: 9999,
        }}
      >
        <LayoutContainer>
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            py={1.5}
          >
            <Box component="a" href="/home">
              <Box
                component="img"
                src="/assets/logo.png"
                width={{ xs: "120px", md: "auto" }}
              />
            </Box>

            <Box
              component="ul"
              display={{ xs: "none", lg: "flex" }}
              sx={{ listStyle: "none" }}
            >
              {headerNav.map((item, index) => (
                <Box component="li" key={index}>
                  <StyledLinkTage
                    component="a"
                    href={item.href}
                    className={pathName === item.href ? "active" : ""}
                    color="text.secondary"
                  >
                    {item.title}
                  </StyledLinkTage>
                </Box>
              ))}
            </Box>
            <Box display={{ xs: "none", lg: "block" }}>
              <StyledLinkTage
                component="a"
                href="/contact"
                color="text.secondary"
              >
                Contact Us
              </StyledLinkTage>
            </Box>
            <Box display={{ xs: "block", lg: "none" }}>
              <MobileMenu />
            </Box>
          </Stack>
        </LayoutContainer>
        <Divider variant="fullWidth" orientation="horizontal" />
      </Box>
    </header>
  );
};

export default AppHeader;
