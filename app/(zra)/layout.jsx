import React from "react";
import '@/assets/styles/globals.css';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import 'photoswipe/dist/photoswipe.css';

//👇 Import Open Sans font, Nunito_Sans, Cormorant,
import { Comfortaa } from 'next/font/google'

const comfortaa = Comfortaa({
   subsets: ['cyrillic-ext'], //`cyrillic`, `cyrillic-ext`, `greek`, `latin`, `latin-ext`, `vietnamese`
   display: 'swap',
});

// import AuthProvider from "@/components/AuthProvider";
// import { GlobalProvider } from "@/context/GlobalContext";

// import { ToastContainer, toast } from 'react-toastify';
// import 'react-toastify/dist/ReactToastify.css';
// import 'photoswipe/dist/photoswipe.css';

export const metadata = {
   title: 'Rentu',
   description: 'Орендуй квартиру',
   keywods: 'оренда, здати в оренду, найм житла, оренда нерухомості, оренда квартири'
}

const MainLayout = ({ children }) => {
   return (
      // <GlobalProvider>
      //    <AuthProvider>
      <html lang="en" >
         <head>
            {/* <meta charset="utf-8"> */}
            {/* <meta content="width=device-width, initial-scale=1.0" name="viewport"> */}

            {/* <title>Zra - Technology & Business Services Landing Page Template</title>
  <meta content="" name="Zra - Technology & Business Services Landing Page Template">
  <meta content="" name="ZRTHEMES"> */}

            {/* <!-- Favicons --> */}
            <link href="assets/images/favicon.png" rel="icon" />
            <link href="assets/images/apple-touch-icon.png" rel="apple-touch-icon" />

            {/* <!-- Google Fonts --> */}
            {/* <link href="https://fonts.googleapis.com/css2?family=Open+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300;1,400;1,600;1,700&family=Montserrat:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300;1,400;1,500;1,600;1,700&family=Raleway:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300;1,400;1,500;1,600;1,700&display=swap" rel="stylesheet" /> */}
            {/* <link rel="preconnect" href="https://fonts.googleapis.com" /> */}
            {/* <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin/> */}
            {/* <link href="https://fonts.googleapis.com/css2?family=Oswald:wght@500&display=swap" rel="stylesheet" /> */}
            {/* <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400&display=swap" rel="stylesheet" /> */}


            {/* <link rel="preconnect" href="https://fonts.googleapis.com" />
            <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
            <link href="https://fonts.googleapis.com/css2?family=Nunito+Sans:ital,opsz,wght@0,6..12,200..1000;1,6..12,200..1000&display=swap" rel="stylesheet"></link> */}
         </head>


         <body >
            <main className={comfortaa.className}>{children}</main>
            <ToastContainer />
         </body>
      </html>
      //    </AuthProvider>
      // </GlobalProvider>
   )
}

export default MainLayout