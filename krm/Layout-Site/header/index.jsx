'use client'
import { useEffect } from "react";
import { Stack, Box, styled, useTheme, Divider } from "@mui/material";
import MobileMenu from "./mobile-menu";
import { LayoutContainer } from "../../container";

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
const StyledLogo = styled(Box)(({ theme }) => ({
  fontSize: '30px',
  margin: 0,
  fontWeight: 600,
  letterSpacing: '0.8px',
  color: '#fff',
  // fontFamily: 'var(--font-primary)',
  '& span': {
    color: '#f85a40'
  }
}))

export const headerNav = [
  { title: "Головна", href: "/esta/views/444/#main" },
  { title: "Галерея", href: "/esta/views/444/#gallery" },
  { title: "Опис", href: "/esta/views/444/#description" },
  { title: "Переваги", href: "/esta/views/444/#amenities" },
  // { title: "Характеристики", href: "/esta/views/444/#math" },
  { title: "Запис на огляд", href: "/esta/views/444/#review" },
];

const AppHeader = () => {
  const theme = useTheme();
  let pathName = '';


  useEffect(() => {
    pathName = window.location.pathname;
  }, [])

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
            <Box>
              <StyledLogo
                component="a"
              // href={item.href}
              >
                Rentu
                <span>.</span>
              </StyledLogo>
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
                href="/esta/views/444/review"
                color="text.secondary"
              >
                Контакти
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
