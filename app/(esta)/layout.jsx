import React from "react";
import '@/assets/styles/globals.css';
// import { ToastContainer } from 'react-toastify';
// import 'react-toastify/dist/ReactToastify.css';
// import 'photoswipe/dist/photoswipe.css';

export const metadata = {
   title: 'Власникам',
   description: 'Продавай ефективно',
   keywods: 'продаж, продати квартиру, продаж нерухомості'
};

import MuiThemeProvider from "@/estatein/theme";

const MainLayout = ({ children }) => {
   return (
      // <GlobalProvider>
      //    <AuthProvider>
      <html lang="en">
         <head>

            <link href="assets/images/favicon.png" rel="icon" />
            <link href="assets/images/apple-touch-icon.png" rel="apple-touch-icon" />
         </head>


         <body>
            <main>
               <MuiThemeProvider>
                  {children}
               </MuiThemeProvider>
            </main>
            {/* <ToastContainer /> */}
         </body>
      </html>
      //    </AuthProvider>
      // </GlobalProvider>
   )
}

export default MainLayout
