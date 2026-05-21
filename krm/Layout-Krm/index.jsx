'use client'

import AppHeader from "./header1";
import AppFooter from "./footer";
import { GlobalStyles, Stack, useTheme } from "@mui/material";

const KrmLayout = ({ children }) => {
  const theme = useTheme();
  return (
    <>
      <GlobalStyles
        styles={{
          html: {
            backgroundColor: theme.palette.background.default,
            overflowX: "hidden",
          },
          body: {
            margin: 0,
            backgroundColor: theme.palette.background.default,
            overflowX: "hidden",
          },
          main: {
            backgroundColor: theme.palette.background.default,
            overflowX: "hidden",
          },
        }}
      />
      <Stack
        overflow="hidden"
        bgcolor={theme.palette.background.default}
        sx={{ width: "100%", minHeight: "100vh" }}
      >
        <AppHeader />
        {children}
        <AppFooter />
      </Stack>
    </>
  );
};

export default KrmLayout;
