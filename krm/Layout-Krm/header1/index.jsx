'use client';

import { useEffect, useState } from "react";
// import { useRouter } from "next/navigation";
// import { signIn } from "next-auth/react";

import {
  Stack,
  Box,
  styled,
  useTheme,
  Divider
} from "@mui/material";

import WifiCalling3Icon from "@mui/icons-material/WifiCalling3";

import MobileMenu from "./mobile-menu";
import { LayoutContainer } from "../../container";

import Image from "next/image";

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

const StyledLogo = styled(Box)(() => ({
  padding: "3px 0",
  "& img": {
    opacity: "95%",
    height: "48px",
    borderRadius: "50%",
    display: "block",
  },
}));

export const headerNav = [
  { title: "Головна", href: "/" },
  { title: "Об'єкти продажу", href: "/views" },
  { title: "Заявки на купівлю", href: "/orders" },
  { title: "Каталог послуг", href: "/service1" },
];

const AppHeader = () => {
  const theme = useTheme();
  // const router = useRouter();

  const [pathName, setPathName] = useState("");
  const [phone] = useState("067 9850 911");


  useEffect(() => {
    setPathName(window.location.pathname);
  }, []);

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
          <Stack direction="row" alignItems="center" justifyContent="space-between" py={0.8}>
            {/* Logo */}
            <Box display="flex" alignItems="center">
              <StyledLogo component="a">
                <Image
                  width={120}
                  height={40}
                  className="w-full h-auto"
                  src="/krm/logo-krm.png"
                  alt="logo"
                />
              </StyledLogo>
            </Box>

            {/* Menu */}
            <Box component="ul" display={{ xs: "none", lg: "flex" }} sx={{ listStyle: "none" }}>
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

            {/* Phone with popover */}
            {/* <Box display={{ xs: "none", lg: "block" }}>
              <StyledLinkTage
                aria-owns={open ? "phone-popover" : undefined}
                aria-haspopup="true"
                onMouseEnter={handlePopoverOpen}
                color="text.secondary"
              >
                <Link
                  href={"tel: +38" + phone}
                  position="relative"
                  left="20%"
                  top="2px"
                  color="#ff8803"
                >
                  <WifiCalling3Icon />
                  <Box display="inline" ml={0.5} position="relative" top="2px" fontSize="1.05rem">
                    <span>{phone}</span>
                  </Box>
                </Link>
              </StyledLinkTage>
            </Box> */}

            {/* Phone */}
            <Box display={{ xs: "none", lg: "block" }}>
              <StyledLinkTage
                component="a"
                href={`tel:+38${phone.replace(/\s/g, "")}`}
                color="text.secondary"
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 0.7,
                  color: "#ff8803",
                  "&:hover": {
                    color: "#ff9f2f",
                  },
                }}
              >
                <WifiCalling3Icon />
                <Box component="span" fontSize="1.05rem">
                  {phone}
                </Box>
              </StyledLinkTage>
            </Box>

            {/* Mobile menu */}
            <Box display={{ xs: "block", lg: "none" }}>
              <MobileMenu />
            </Box>
          </Stack>
        </LayoutContainer>

        <Divider variant="fullWidth" orientation="horizontal" />

        {/* Popover Menu */}
        {/* <Popover
          id="phone-popover"
          open={open}
          anchorEl={anchorEl}
          onClose={handlePopoverClose}
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
          transformOrigin={{ vertical: "top", horizontal: "right" }}
          disableScrollLock
          TransitionComponent={Fade}
          TransitionProps={{ timeout: 200 }}
          slotProps={{
            paper: {
              onMouseEnter: () => setAnchorEl(anchorEl),
              onMouseLeave: handlePopoverClose,
            },
          }}
        >
          <Box>
            <MenuItem onClick={handlePopoverClose}>
              <BusinessIcon fontSize="small" sx={{ mr: 1 }} /> Про компанію
            </MenuItem>
            <MenuItem onClick={handlePopoverClose}>
              <WorkIcon fontSize="small" sx={{ mr: 1 }} /> Вакансії
            </MenuItem>
            <MenuItem onClick={handleOpenLogin}>
              <LoginIcon fontSize="small" sx={{ mr: 1 }} /> Вхід
            </MenuItem>
          </Box>
        </Popover> */}

      </Box>
    </header>
  );
};

export default AppHeader;