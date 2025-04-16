'use client'


import {
  createTheme as createMuiTheme,
  responsiveFontSizes,
} from "@mui/material/styles";
import { baseThemeOptions } from "./base-theme-options";
import { darkThemeOptions } from "./dark-theme-options";
import { ThemeProvider } from "@mui/material/styles";

const MuiThemeProvider = ({ children }) => {
  let config = {
    mode: "dark",
    direction: "ltr",
    responsiveFontSizes: true,
  };
  let theme = createMuiTheme(baseThemeOptions, darkThemeOptions, {
    direction: config.direction,
  });

  if (config.responsiveFontSizes) {
    theme = responsiveFontSizes(theme);
  }
  return <ThemeProvider theme={theme}>{children}</ThemeProvider>;
};

export default MuiThemeProvider;
