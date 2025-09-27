'use client'

import AppHeader from "./header";
import AppFooter from "./footer";
import { Stack, useTheme } from "@mui/material";

const KrmLayout = ({ children }) => {
  const theme = useTheme();
  return (
    <Stack overflow="hidden" bgcolor={theme.palette.background.default}>
      <AppHeader />
      {children}
      <AppFooter />
    </Stack>
  );
};

export default KrmLayout;
