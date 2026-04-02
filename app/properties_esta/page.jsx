'use client'
import React from "react";
import AppLayout from "@/estatein/components/app-layoout";
import {
   Box,
   Stack,
   Typography,
   styled,
   Divider,
   TextField,
   useTheme,
   Button,
} from "@mui/material";
import { LayoutContainer } from "@/estatein/components/app-layoout/container";
import Iconify from "@/estatein/components/iconify/iconify";
import {
   BuildYear,
   LocationData,
   PriceRange,
   PropertySize,
   PropertyType,
} from "@/estatein/_moc_data/search";
import Possibilities from "@/estatein/components/Property/Possibilities/Possibilities";
import FormSentSection from "@/estatein/components/Property/FormSentSection";
import CustomIconSelect from "@/estatein/components/utils/CustomIconSelect";

export const StyledGradienthBox = styled(Box)(({ theme }) => ({
   background: `linear-gradient(154.12deg, rgb(38, 38, 38) -27.695%,rgba(38, 38, 38, 0) 40.055%)`,
   position: "relative",
   padding: "100px 0",
   [theme.breakpoints.down("sm")]: {
      padding: "50px 0",
   },
}));

const StyledWrapperBox = styled(Box)(({ theme }) => ({
   background: theme.palette.background.main,
   padding: "10px",
   borderRadius: "10px",
}));

const StyledSearchBox = styled(Box)(({ theme }) => ({
   padding: "10px ",
   width: "70%",
   margin: "0 auto",
   position: "absolute",
   bottom: "-40px",
   borderRadius: "10px",
   background: theme.palette.background.main,
   left: 0,
   right: 0,
   display: "flex",
   fieldset: {
      border: `1px solid ${theme.palette.divider} !important`,
   },
   input: {
      paddingRight: "165px",
      "&::placeholder": {
         color: theme.palette.text.primary,
      },
   },
   [theme.breakpoints.down("sm")]: {
      position: "relative",
      bottom: "-165px",
      width: "auto",
      input: {
         paddingRight: "82px ",
      },
   },
}));

const Properties = () => {
   const theme = useTheme();
   return (
      <AppLayout>
         <Stack py="78px">
            <StyledGradienthBox>
               <LayoutContainer>
                  <Stack>
                     <Typography variant="h2" color="text.secondary" mb={2}>
                        Find Your Dream Property
                     </Typography>

                     <Typography
                        variant="subtitle1"
                        color="text.primary"
                        width={{ xs: "100%", md: "70%" }}
                     >
                        Welcome to Estatein, where your dream property awaits in every
                        corner of our beautiful world. Explore our curated selection of
                        properties, each offering a unique story and a chance to
                        redefine your life. With categories to suit every dreamer, your
                        journey
                     </Typography>
                  </Stack>

                  <StyledSearchBox>
                     <TextField
                        id="search-property"
                        placeholder="Search For A Property"
                        fullWidth
                        sx={{
                           background: theme.palette.background.default,
                           borderRadius: "10px",
                        }}
                     />
                     <Box
                        sx={{
                           position: "absolute",
                           right: "20px",
                           top: "18px",
                        }}
                     >
                        <Button
                           variant="contained"
                           color="primary"
                           startIcon={<Iconify icon="fluent:search-12-filled" />}
                           sx={{ display: { xs: "none", md: "flex" } }}
                        >
                           Find Property
                        </Button>
                        <Button
                           variant="contained"
                           color="primary"
                           sx={{ display: { xs: "flex", md: "none" } }}
                        >
                           <Iconify icon="fluent:search-12-filled" />
                        </Button>
                     </Box>
                  </StyledSearchBox>
               </LayoutContainer>
            </StyledGradienthBox>
            <Divider variant="fullWidth" orientation="horizontal" />
            <LayoutContainer>
               <Stack pt={{ xs: 13, md: 4 }}>
                  <StyledWrapperBox>
                     <Stack
                        direction={{ xs: "column", md: "row" }}
                        justifyContent={{
                           xs: "center",
                           md: "center",
                           lg: "center",
                           xl: "space-between",
                        }}
                        gap={1.5}
                        flexWrap="wrap"
                     >
                        <CustomIconSelect
                           data={LocationData}
                           icon="carbon:location"
                           placeholder="Location"
                        />

                        <CustomIconSelect
                           data={PropertyType}
                           icon="ic:outline-maps-home-work"
                           placeholder="Property Type"
                        />

                        <CustomIconSelect
                           data={PriceRange}
                           icon="material-symbols:price-change-outline"
                           placeholder="Pricing Range "
                        />

                        <CustomIconSelect
                           data={PropertySize}
                           icon="bi:box"
                           placeholder="Property Size"
                        />

                        <CustomIconSelect
                           data={BuildYear}
                           icon="clarity:date-solid"
                           placeholder="Build Year"
                        />
                     </Stack>
                  </StyledWrapperBox>
               </Stack>
            </LayoutContainer>
            <Possibilities />
            <LayoutContainer>
               <FormSentSection />
            </LayoutContainer>
         </Stack>
      </AppLayout>
   );
};

export default Properties;
