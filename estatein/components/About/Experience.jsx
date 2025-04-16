import { Box, Grid, Stack, Typography, styled } from "@mui/material";
import React from "react";
import StarIcon from "../icons/StarIcon";
import useWindowSize from "../../hooks/useWindowSize";

const StyledBorderBox = styled(Box)(({ theme }) => ({
  padding: "50px",
  border: `2px solid ${theme.palette.divider}`,
  borderRadius: "0px 10px 10px 10px",
  position: "relative",
  marginTop: "40px",
  minHeight: "135px",
  ".index": {
    position: "absolute",
    top: "-40px",
  },
  ":before": {
    content: "url()",
    position: "absolute",
    width: "2px",
    height: "200px",
    background:
      "linear-gradient(180deg, rgba(122,59,247,0.9220063025210083) 39%, rgba(38,38,38,1) 71%)",
    left: "-1px",
    top: "-50px",
  },

  ":after": {
    content: "url()",
    position: "absolute",
    width: "200px",
    height: "2px",
    background:
      "linear-gradient(90deg, rgba(122,59,247,0.9220063025210083) 39%, rgba(38,38,38,1) 71%)",
    left: "0px",
    top: "-2px",
  },
}));

const StyledItemGrid = styled(Grid)(({ theme }) => ({
  position: "relative",
  ":before": {
    content: "url(/esta/assets/about/shadow.png)",
    position: "absolute",
    width: "10px",
    height: "10px",
    top: "72px",
    left: "36px",
  },
}));

const Experience = () => {
  const screenWidth = useWindowSize();
  return (
    <Stack py={5}>
      <Box mb={2}>
        <StarIcon />
      </Box>

      <Typography variant="h3" color="text.secondary" mb={2}>
        Navigating the Estatein Experience
      </Typography>
      <Typography
        variant="subtitle1"
        color="text.primary"
        width={{ xs: "100%", md: "60%" }}
        mb={4}
      >
        At Estatein, we've designed a straightforward process to help you find
        and purchase your dream property with ease. Here's a step-by-step guide
        to how it all works.
      </Typography>

      <Grid container spacing={4}>
        {data.map((item, i) => (
          <StyledItemGrid
            item
            key={i}
            xs={12}
            md={6}
            lg={screenWidth > 1500 ? 4 : 6}
            xl={4}
          >
            <StyledBorderBox>
              <Box className="index">
                <Typography variant="body1" color="text.secondary">
                  Step {item.id}
                </Typography>
              </Box>

              <Typography variant="h5" color="text.secondary">
                {item.title}
              </Typography>
              <Typography variant="body1" color="text.primary">
                {item.text}
              </Typography>
            </StyledBorderBox>
          </StyledItemGrid>
        ))}
      </Grid>
    </Stack>
  );
};

export default Experience;

const data = [
  {
    id: "01",
    title: "Discover a World of Possibilities",
    text: "Your journey begins with exploring our carefully curated property listings. Use our intuitive search tools to filter properties based on your preferences, including location, type, size, and budget.",
  },
  {
    id: "02",
    title: "Narrowing Down Your Choices",
    text: "Once you've found properties that catch your eye, save them to your account or make a shortlist. This allows you to compare and revisit your favorites as you make your decision.",
  },
  {
    id: "03",
    title: "Personalized Guidance",
    text: "Have questions about a property or need more information? Our dedicated team of real estate experts is just a call or message away.",
  },
  {
    id: "04",
    title: "See It for Yourself",
    text: "Arrange viewings of the properties you're interested in. We'll coordinate with the property owners and accompany you to ensure you get a firsthand look at your potential new home.",
  },
  {
    id: "05",
    title: "Making Informed Decisions",
    text: "Before making an offer, our team will assist you with due diligence, including property inspections, legal checks, and market analysis. We want you to be fully informed and confident in your choice.",
  },
  {
    id: "06",
    title: "Getting the Best Deal",
    text: "We'll help you negotiate the best terms and prepare your offer. Our goal is to secure the property at the right price and on favorable terms.",
  },
];
