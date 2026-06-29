
import { useEffect, useRef, useState } from "react";
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
} from "@mui/material";

import Link from "next/link";
import Iconify from "@/estatein/components/iconify/iconify";
import LoginIcon from "@mui/icons-material/Login";

import { LayoutContainer } from "@/krm/container";

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
  // Login dialog
  const [openLogin, setOpenLogin] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loading, setLoading] = useState(false);

  // Popover
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const handlePopoverOpen = (event) => setAnchorEl(event.currentTarget);
  const handlePopoverClose = () => setAnchorEl(null);


  const handleOpenLogin = () => {
    setOpenLogin(true);
    handlePopoverClose();
  };

  const handleCloseLogin = () => {
    setOpenLogin(false);
    setLoginError("");
    setEmail("");
    setPassword("");
  };

  const handleLogin = async () => {
    setLoginError("");
    setLoading(true);

    try {
      const res = await signIn("credentials", {
        redirect: false,
        email,
        password,
      });

      if (res?.error) {
        setLoginError("Невірний email/телефон або пароль");
        return;
      }

      handleCloseLogin();
      router.push("/crm");
      router.refresh();
    } catch (e) {
      setLoginError("Помилка входу. Спробуй ще раз.");
    } finally {
      setLoading(false);
    }
  };

  const theme = useTheme();
  return (
    <Stack bgcolor={theme.palette.background.default}>

      <Stack pt={10}>

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
                  © Copyright Karamax. All Rights Reserved
                </Typography>
                <Typography variant="subtitle1" color="text.secondary">
                  {/* Правила & умови */}
                </Typography>
              </Stack>

              <Stack direction="row" alignItems="center" gap={2} flexWrap="wrap" justifyContent="center">
                <RieltorPartnerButton />

                <StyledTargerLink>
                  <Iconify icon="mingcute:facebook-line" />
                </StyledTargerLink>
                <StyledTargerLink>
                  <Iconify icon="mdi:linkedin" />
                </StyledTargerLink>
                <StyledTargerLink>
                  <Iconify icon="ri:twitter-fill" />
                </StyledTargerLink>
                <StyledTargerLink>
                  <Iconify icon="mdi:youtube" />
                </StyledTargerLink>


                <StyledTargerLink
                  component={Link}
                  href="/crm"
                  title="Вхід"
                  sx={{
                    opacity: 0.35,
                    transition: "0.2s",
                    "&:hover": {
                      opacity: 1,
                      color: theme.palette.primary.main,
                    },
                  }}
                >
                  <LoginIcon sx={{ fontSize: 18 }} />
                </StyledTargerLink>
              </Stack>
            </Stack>
            <Stack direction="row" alignItems="center" justifyContent="center" gap={1}>
              <Typography variant="subtitle2" color="text.secondary">Designed by</Typography>
              <Typography variant="subtitle2" color="primary">ProMax Studio</Typography>
            </Stack>
          </LayoutContainer>
        </Stack>
      </Stack>



      {/* Login Dialog */}
      <Dialog open={openLogin} onClose={handleCloseLogin}>
        <DialogTitle>Вхід у кабінет</DialogTitle>

        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1, minWidth: 320 }}>
            {loginError && <Alert severity="error">{loginError}</Alert>}

            <TextField
              label="Email або телефон"
              fullWidth
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="username"
            />
            <TextField
              label="Пароль"
              type="password"
              fullWidth
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              onKeyDown={(e) => {
                if (e.key === "Enter") handleLogin();
              }}
            />
          </Stack>
        </DialogContent>

        <DialogActions>
          <Button onClick={handleCloseLogin} disabled={loading}>
            Скасувати
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handleLogin}
            disabled={loading || !email || !password}
          >
            {loading ? "Вхід..." : "Увійти"}
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>

  );
};

export default AppFooter;
