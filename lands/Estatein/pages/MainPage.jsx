// import { Divider } from "@mui/material";
// import React from "react";
import VisitSection from "../components/Main/VisitSection";
import ConvenientBar from "../components/Main/ConvenientBar";
import Carousel from "../components/Main/Carousel/Carousel";
import CustomerReviews from "../components/Main/CustomerReviews/CustomerReviews";
import FrequentlyQuestions from "../components/Main/FrequentlyQuestions/FrequentlyQuestions";
import AppLayout from "../components/app-layoout";

const MainPage = () => {
  return (
    <AppLayout>
      <VisitSection />
      {/* <Divider variant="fullWidth" orientation="horizontal" /> */}
      <ConvenientBar />
      {/* <Divider variant="fullWidth" orientation="horizontal" /> */}
      <Carousel />
      <CustomerReviews />
      <FrequentlyQuestions />
    </AppLayout>
  );
};

export default MainPage;
