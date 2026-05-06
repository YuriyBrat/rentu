
import { useEffect, useState } from "react";
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
  padding: "10px 3px",
  display: "inline-block",
}));
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
              direction="row"
              alignItems="center"
              justifyContent="space-between"
            >
              <Stack direction="row" alignItems="center" gap={2}>
                <Typography variant="subtitle1" color="text.secondary">
                  © Copyright Karamax. All Rights Reserved
                </Typography>
                <Typography variant="subtitle1" color="text.secondary">
                  {/* Правила & умови */}
                </Typography>
              </Stack>

              <Stack direction="row" alignItems="center" gap={2}>
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
