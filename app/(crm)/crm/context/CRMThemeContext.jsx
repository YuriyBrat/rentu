'use client';
import { createContext, useContext, useState } from 'react';
import { crmThemes } from '../crmThemes';

const CRMThemeContext = createContext();

export function CRMThemeProvider({ children }) {
   const [mode, setMode] = useState('dark');
   const theme = crmThemes[mode];
   const toggleTheme = () => setMode(mode === 'dark' ? 'light' : 'dark');
   return (
      <CRMThemeContext.Provider value={{ theme, mode, toggleTheme }}>
         {children}
      </CRMThemeContext.Provider>
   );
}

export const useCRMTheme = () => useContext(CRMThemeContext);
