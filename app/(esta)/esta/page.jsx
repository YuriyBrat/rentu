import { Divider } from "@mui/material";
// import React from "react";
import VisitSection from "@/estatein/components/Main/VisitSection";
import ConvenientBar from "@/estatein/components/Main/ConvenientBar";
import Carousel from "@/estatein/components/Main/Carousel/Carousel";
import CustomerReviews from "@/estatein/components/Main/CustomerReviews/CustomerReviews";
import FrequentlyQuestions from "@/estatein/components/Main/FrequentlyQuestions/FrequentlyQuestions";
import AppLayout from "@/estatein/components/app-layoout";

const MainPage = () => {
   return (
         <AppLayout>
            <VisitSection />
            <Divider variant="fullWidth" orientation="horizontal" />

            <ConvenientBar />
            <Divider variant="fullWidth" orientation="horizontal" />
            <Carousel />

            <CustomerReviews />
            <FrequentlyQuestions />
         </AppLayout>
   );
};

export default MainPage;