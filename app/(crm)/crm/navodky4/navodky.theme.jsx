'use client';

import { useMemo } from 'react';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { useCRMTheme } from '../context/CRMThemeContext';

export default function NavodkyTheme({ children }) {
  const { theme: crm, mode } = useCRMTheme();
  const theme = useMemo(() => createTheme({
    palette: {
      mode: mode === 'light' ? 'light' : 'dark',
      primary: { main: crm.accent, contrastText: mode === 'luxury' ? '#17120f' : '#ffffff' },
      background: { default: crm.bgDark, paper: crm.bgPanel },
      text: { primary: crm.text, secondary: crm.textSoft },
      divider: crm.border,
      action: { hover: crm.hover, selected: crm.hover },
    },
    typography: { fontFamily: "'Segoe UI', Arial, sans-serif", button: { textTransform: 'none', fontWeight: 700 } },
    shape: { borderRadius: 8 },
    components: {
      MuiPaper: { styleOverrides: { root: { backgroundImage: 'none' } } },
      MuiOutlinedInput: { styleOverrides: { root: { backgroundColor: crm.hover }, notchedOutline: { borderColor: crm.border } } },
      // The legacy global CSS forces MUI inputs/labels to black with !important.
      // These component-scoped overrides win only inside this page and its dialogs.
      MuiInputBase: { styleOverrides: { root: { '&&&': { color: `${crm.text} !important` }, '&&& input, &&& textarea': { color: `${crm.text} !important`, WebkitTextFillColor: crm.text } } } },
      MuiFormLabel: { styleOverrides: { root: { '&&&': { color: `${crm.textSoft} !important` }, '&&&.Mui-focused': { color: `${crm.accent} !important` } } } },
      MuiInputLabel: { styleOverrides: { root: { '&&&': { color: `${crm.textSoft} !important` }, '&&&.Mui-focused': { color: `${crm.accent} !important` } } } },
      MuiFormHelperText: { styleOverrides: { root: { '&&&': { color: `${crm.textSoft} !important` } } } },
      MuiDialog: { defaultProps: { fullWidth: true }, styleOverrides: { paper: { '@media (max-width:599px)': { margin: 8, width: 'calc(100% - 16px)', maxHeight: 'calc(100% - 16px)' } } } },
    },
  }), [crm, mode]);
  return <ThemeProvider theme={theme}><div data-navodky-theme={mode}>{children}</div></ThemeProvider>;
}

export function navodkaDate(value, time = false) {
  if (!value || !Number.isFinite(new Date(value).getTime())) return '—';
  return new Date(value).toLocaleString('uk-UA', { timeZone: 'Europe/Kyiv', day: '2-digit', month: '2-digit', year: 'numeric', ...(time ? { hour: '2-digit', minute: '2-digit' } : {}) });
}

export const navodkaPanelSx = { p: { xs: 1.5, md: 2 }, borderRadius: 3, border: 1, borderColor: 'divider', bgcolor: 'background.paper' };
