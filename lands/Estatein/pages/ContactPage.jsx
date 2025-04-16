import React from "react";
import AppLayout from "../components/app-layoout";
import { Stack, Typography, Divider, Grid, styled, Box } from "@mui/material";
import { StyledGradienthBox } from "./Properties";
import { LayoutContainer } from "../components/app-layoout/container";
import StarIcon from "../components/icons/StarIcon";
import ContactForm from "../components/ContactForm";
import Office from "../components/Office";
import ExploreContact from "../components/Explore-Contact";
import AskedQuestionCarousel from "../components/PropertiesView/Question-carousel";
import useWindowSize from "../hooks/useWindowSize";
const StyledItemStack = styled(Stack)(({ theme }) => ({
  background: theme.palette.background.main,
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: "10px",
  padding: "15px 20px",
  gap: "15px",
}));

const Contact = () => {
  const screenWidth = useWindowSize();
  return (
    <AppLayout>
      <Stack py="70px">
        <StyledGradienthBox>
          <LayoutContainer>
            <Stack>
              <Typography variant="h2" color="text.secondary" mb={2}>
                Get in Touch with Estatein
              </Typography>

              <Typography
                variant="subtitle1"
                color="text.primary"
                width={{ xs: "100%", md: "70%" }}
              >
                Welcome to Estatein's Contact Us page. We're here to assist you
                with any inquiries, requests, or feedback you may have. Whether
                you're looking to buy or sell a property, explore investment
                opportunities, or simply want to connect, we're just a message
                away. Reach out to us, and let's start a conversation.
              </Typography>
            </Stack>
          </LayoutContainer>
        </StyledGradienthBox>
        <Divider variant="fullWidth" orientation="horizontal" />
        <Grid container spacing={2} p={2}>
          {contactData.map((item, i) => (
            <Grid
              item
              key={i}
              xs={screenWidth < 700 ? 12 : 6}
              md={6}
              lg={3}
              xl={3}
            >
              <StyledItemStack direction="column" alignItems="center">
                <Box
                  component="img"
                  src={item.icon}
                  width={{ xs: "40px", md: "65px" }}
                  height={{ xs: "40px", md: "65px" }}
                />
                {item?.txt ? (
                  <Typography
                    variant="subtitle1"
                    color="text.secondary"
                    align="center"
                  >
                    {item.txt}
                  </Typography>
                ) : null}
                {item?.link ? (
                  <Stack direction="row" alignItems="center" gap={1}>
                    {item?.link.map((socil, index) => (
                      <Typography
                        key={index}
                        variant="subtitle1"
                        color="text.secondary"
                        align="center"
                      >
                        {socil.socilName}
                      </Typography>
                    ))}
                  </Stack>
                ) : null}
              </StyledItemStack>
            </Grid>
          ))}
        </Grid>
        <Divider variant="fullWidth" orientation="horizontal" />
      </Stack>
      <LayoutContainer>
        <Stack mb={3}>
          <Box mb={2}>
            <StarIcon />
          </Box>
          <Typography variant="h3" color="text.secondary" mb={2}>
            Let's Connect
          </Typography>
          <Typography
            variant="subtitle1"
            color="text.primary"
            width={{ xs: "100%", md: "60%" }}
            mb={5}
          >
            We're excited to connect with you and learn more about your real
            estate goals. Use the form below to get in touch with Estatein.
            Whether you're a prospective client, partner, or simply curious
            about our services, we're here to answer your questions and provide
            the assistance you need.
          </Typography>
        </Stack>

        <ContactForm />
        <Office />
        <ExploreContact />
        <AskedQuestionCarousel />
      </LayoutContainer>
    </AppLayout>
  );
};

export default Contact;

const contactData = [
  {
    icon: "/assets/mail.svg",
    txt: "info@estatein.com",
  },
  {
    icon: "/assets/phone.svg",
    txt: "+1 (123) 456-7890",
  },
  {
    icon: "/assets/location.svg",
    txt: "Main Headquarters",
  },
  {
    icon: "/assets/socil.svg",
    txt: "",
    link: [
      {
        socilName: "Instagram",
        link: "https://www.instagram.com",
      },
      {
        socilName: "LinkedIn",
        link: "https://www.linkedin.com",
      },
      {
        socilName: "Facebook",
        link: "https://www.facebook.com",
      },
    ],
  },
];
