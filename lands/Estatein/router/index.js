import { createBrowserRouter } from "react-router-dom";
import MainPage from "../pages/MainPage";
import AboutUs from "../pages/AboutUs";
import Properties from "../pages/Properties";
import ServicesPage from "../pages/ServicesPage";
import Contact from "../pages/ContactPage";
import PropertiesView from "../pages/PropertiesView";
import NotFound from "../pages/config-pages/NotFound";

const router = createBrowserRouter([
  {
    path: "/",
    element: <MainPage />,
  },
  {
    path: "/about",
    element: <AboutUs />,
  },
  {
    path: "/our-facility",
    element: <Properties />,
  },
  {
    path: "/our-facility/:id",
    element: <PropertiesView />,
  },
  {
    path: "/services",
    element: <ServicesPage />,
  },
  {
    path: "/contact",
    element: <Contact />,
  },
  {
    path: "*",
    element: <NotFound />,
  },
]);

export default router;
