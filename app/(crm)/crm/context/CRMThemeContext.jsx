'use client';
import { createContext, useContext, useState } from 'react';
import { crmThemes } from '../crmThemes';

const CRMThemeContext = createContext();

export function CRMThemeProvider({ children }) {
   // const [mode, setMode] = useState('dark');
   const [mode, setMode] = useState(
      typeof window !== 'undefined'
         ? localStorage.getItem('crm-theme') || 'dark'
         : 'dark'
   );



   const theme = crmThemes[mode];
   // const toggleTheme = () => setMode(mode === 'dark' ? 'light' : 'dark');
   const order = ['dark', 'light', 'luxury'];

   // const toggleTheme = () => {
   //    const i = order.indexOf(mode);
   //    const next = order[(i + 1) % order.length];
   //    setMode(next);
   // };
   const toggleTheme = () => {
      const i = order.indexOf(mode);
      const next = order[(i + 1) % order.length];
      setMode(next);
      localStorage.setItem('crm-theme', next);
   };
   return (
      <CRMThemeContext.Provider value={{ theme, mode, toggleTheme }}>
         {children}
      </CRMThemeContext.Provider>
   );
}

export const useCRMTheme = () => useContext(CRMThemeContext);
