import { Box, Grid, Stack, Typography, styled } from "@mui/material";
import React from "react";
import StarIcon from "../icons/StarIcon";
import Iconify from "../iconify/iconify";
import useWindowSize from "../../hooks/useWindowSize";
import Image from "../image/image";

const StyledTeamBox = styled(Box)(({ theme }) => ({
  padding: "30px",
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: "10px",
  textAlign: "center",
}));

const StyledTwitterBox = styled(Box)(({ theme }) => ({
  color: theme.palette.text.secondary,
  width: "70px",
  background: theme.palette.primary.main,
  textAlign: "center",
  borderRadius: "50px",
  position: "absolute",
  bottom: "-10px",
  margin: "0 auto",
  left: 0,
  right: 0,
}));

const StyledTelegramBox = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  border: `1px solid ${theme.palette.divider}`,
  padding: "10px 10px 12px 20px",
  borderRadius: "50px",
  background: theme.palette.background.main,
}));

const StyledSentBox = styled(Box)(({ theme }) => ({
  color: theme.palette.text.secondary,
  width: "35px",
  height: "35px",
  borderRadius: "50%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: theme.palette.primary.main,
}));

const Team = () => {
  const screenWidth = useWindowSize();
  return (
    <Stack py={5}>
      <Box mb={2}>
        <StarIcon />
      </Box>

      <Typography variant="h3" color="text.secondary">
        Meet the Estatein Team
      </Typography>
      <Typography variant="subtitle1" color="text.primary" mb={5}>
        At Estatein, our success is driven by the dedication and expertise of
        our team. Get to know the people behind our mission to make your real
        estate dreams a reality.
      </Typography>

      <Grid container spacing={3}>
        {TeamFakeData.map((item, i) => (
          <Grid
            item
            key={i}
            xs={screenWidth < 700 ? 12 : 6}
            md={6}
            lg={screenWidth > 1500 ? 3 : 6}
            xl={3}
          >
            <StyledTeamBox>
              <Box position="relative" width="100%" mb={3}>
                <Image src={item.img} alt="Team member" ratio="1/1"/>
                <StyledTwitterBox
                  component="a"
                  href={item.twitterLink}
                  target="_blank"
                >
                  <Iconify
                    icon="mdi:twitter"
                    sx={{ width: "30px", height: "30px" }}
                  />
                </StyledTwitterBox>
              </Box>

              <Typography variant="subtitle1" color="text.secondary" mb={1}>
                {item.fullName}
              </Typography>
              <Typography variant="body1" color="text.primary" mb={2}>
                {item.postion}
              </Typography>

              <StyledTelegramBox>
                <Typography variant="body1" color="text.secondary">
                  Say Hello 👋
                </Typography>

                <StyledSentBox
                  component="a"
                  href={item.telegramLink}
                  target="_blank"
                >
                  <Iconify icon="mingcute:send-fill" />
                </StyledSentBox>
              </StyledTelegramBox>
            </StyledTeamBox>
          </Grid>
        ))}
      </Grid>
    </Stack>
  );
};

export default Team;

const TeamFakeData = [
  {
    id: 0,
    img: "/assets/about/Team-Image.png",
    twitterLink: "https://twitter.com",
    fullName: "Max Mitchell",
    postion: "Founder",
    telegramLink: "https://t.me/settings",
  },
  {
    id: 0,
    img: "/assets/about/Team-Image1.png",
    twitterLink: "https://twitter.com",
    fullName: "Sarah Johnson",
    postion: "Chief Real Estate Officer",
    telegramLink: "https://t.me/settings",
  },
  {
    id: 0,
    img: "/assets/about/Team-Image2.png",
    twitterLink: "https://twitter.com",
    fullName: "David Brown",
    postion: "Head of Property Management",
    telegramLink: "https://t.me/settings",
  },
  {
    id: 0,
    img: "/assets/about/Team-Image3.png",
    twitterLink: "https://twitter.com",
    fullName: "Michael Turner",
    postion: "Legal Counsel",
    telegramLink: "https://t.me/settings",
  },
];
