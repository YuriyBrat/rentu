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

import Iconify from "@/estatein/components/iconify/iconify";
import { LayoutContainer } from "@/krm/container";

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
              </Stack>
            </Stack>
            <Stack direction="row" alignItems="center" justifyContent="center" gap={1}>
              <Typography variant="subtitle2" color="text.secondary">Designed by</Typography>
              <Typography  variant="subtitle2" color="primary">ProMax Studio</Typography>
            </Stack>
          </LayoutContainer>
        </Stack>
      </Stack>
    </Stack>
  );
};

export default AppFooter;
