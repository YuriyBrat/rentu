'use client'

import AppHeader from "./app-header";
import AppFooter from "./app-footer";
import { Stack, useTheme } from "@mui/material";

const AppLayout = ({ children }) => {
  const theme = useTheme();
  return (
    <Stack overflow="hidden" bgcolor={theme.palette.background.default}>
      <AppHeader />
      {children}
      <AppFooter />
    </Stack>
  );
};

export default AppLayout;
