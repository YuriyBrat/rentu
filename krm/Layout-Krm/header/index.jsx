'use client'
import { useEffect, useState } from "react";
import {
  Stack,
  Box,
  styled,
  useTheme,
  Divider,
  Link,
  Popover,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Fade,
} from "@mui/material";

import WifiCalling3Icon from "@mui/icons-material/WifiCalling3";
import BusinessIcon from "@mui/icons-material/Business";
import WorkIcon from "@mui/icons-material/Work";
import LoginIcon from "@mui/icons-material/Login";

import MobileMenu from "./mobile-menu";
import { LayoutContainer } from "../../container";

import Image from 'next/image';

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
  { title: "Презентація продажу", href: "/rcs" },
  { title: "Каталог послуг", href: "/service1" },
];

const AppHeader = () => {
  const theme = useTheme();
  const [pathName, setPathName] = useState("");
  const [phone] = useState("067 9850 911");

  // Popover
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const handlePopoverOpen = (event) => setAnchorEl(event.currentTarget);
  const handlePopoverClose = () => setAnchorEl(null);

  // Login dialog
  const [openLogin, setOpenLogin] = useState(false);
  const handleOpenLogin = () => {
    setOpenLogin(true);
    handlePopoverClose();
  };
  const handleCloseLogin = () => setOpenLogin(false);

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
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            py={0.8}
          >
            {/* Logo */}
            <Box display="flex" alignItems="center">
              <StyledLogo component="a">
                <Image
                  width={120}
                  height={40}
                  className="w-full h-auto"
                  src="/krm/logo-krm.png"
                  alt="logo" />
              </StyledLogo>
            </Box>

            {/* Menu */}
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

            {/* Phone with popover */}
            <Box display={{ xs: "none", lg: "block" }}>
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
                  <Box
                    display="inline"
                    ml={0.5}
                    position="relative"
                    top="2px"
                    fontSize="1.05rem"
                  >
                    <span>{phone}</span>
                  </Box>
                </Link>
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
        <Popover
          id="phone-popover"
          open={open}
          anchorEl={anchorEl}
          onClose={handlePopoverClose}
          anchorOrigin={{
            vertical: "bottom",
            horizontal: "right",
          }}
          transformOrigin={{
            vertical: "top",
            horizontal: "right",
          }}
          disableScrollLock // ⬅️ фікс: не стрибає скрол
          TransitionComponent={Fade} // ⬅️ додаємо анімацію
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
        </Popover>

        {/* Login Dialog */}
        <Dialog open={openLogin} onClose={handleCloseLogin}>
          <DialogTitle>Вхід у кабінет</DialogTitle>
          <DialogContent>
            <Stack spacing={2} sx={{ mt: 1 }}>
              <TextField label="Email" fullWidth />
              <TextField label="Пароль" type="password" fullWidth />
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseLogin}>Скасувати</Button>
            <Button variant="contained" color="primary">
              Увійти
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </header>
  );
};

export default AppHeader;
