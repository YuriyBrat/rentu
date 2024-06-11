import React from "react";
import '@/assets/styles/globals.css';

export const metadata = {
   title: 'Property | Assets',
   description: 'Find your dream rental property',
   keywods: 'rental, find rental, find property'
}

const MainLayout = ({children}) => {
   return (
      <html lang="en">
         <body>
         <div>{children}</div>
         </body>
      </html>
   )
}

export default MainLayout