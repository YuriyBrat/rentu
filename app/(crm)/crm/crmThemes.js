// crmThemes.js — зберігає кілька варіантів тем

export const crmThemes = {
   // dark: {
   //    name: 'dark',
   //    accent: '#b19fff',
   //    accentLight: '#c8b6ff',
   //    bgDark: '#1e1e2d',
   //    bgPanel: '#26263b',
   //    hover: '#2d2d45',
   //    border: '#4b3f6b',
   //    text: '#ffffff',
   // },
   dark: {
      name: 'dark',
      accent: '#b19fff',
      accentLight: '#c8b6ff',

      bgDark: "#0f0f17",          // глибший чорний
      bgPanel: "#151521",         // панелі трохи світліші
      border: "#26263a",
      text: "#e6e6f0",
      accent: "#8b5cf6",          // яскравий фіолет
      // accent: "#a855f7",
      hover: "rgba(139, 92, 246, 0.12)",
   },
   light: {
      name: 'light',
      accent: '#8a5eff',
      accentLight: '#a47cff',
      bgDark: '#f4f2ff',
      bgPanel: '#ffffff',
      hover: '#ece7ff',
      border: '#d0c4ff',
      text: '#1a1a1a',
   },
};
