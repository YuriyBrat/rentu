import { Box, Grid, Stack, Typography, styled, useTheme } from "@mui/material";
import React from "react";
import StarIcon from "../icons/StarIcon";
import OurValuesData from "../../_moc_data/OurValuesData";

const StyledWrapperStack = styled(Stack)(({ theme }) => ({
  padding: "20px 0",
  height: "100%",
  boxSizing: "border-box",
  "&.item0 ,&.item1": {
    borderBottom: `1px solid ${theme.palette.divider}`,
  },
  "&.br": {
    paddingLeft: "20px",
    borderLeft: `1px solid ${theme.palette.divider}`,
  },

  [theme.breakpoints.down("md")]: {
    margin: "0",
    "&.br": {
      paddingLeft: "0",
      borderBottom: `none`,
      borderLeft: "none",
    },
    "&.item0 ,&.item1": {
      borderBottom: `none`,
    },
  },
}));

const OurValues = () => {
  const theme = useTheme();
  return (
    <Grid container spacing={3} pb={4}>
      <Grid item xs={12} md={12} lg={4} xl={5}>
        <Box mb={2}>
          <StarIcon />
        </Box>
        <Typography variant="h3" color="text.secondary" mb={2}>
          Our Values
        </Typography>
        <Typography variant="subtitle1" color="text.primary">
          Our story is one of continuous growth and evolution. We started as a
          small team with big dreams, determined to create a real estate
          platform that transcended the ordinary.
        </Typography>
      </Grid>
      <Grid item xs={12} md={12} lg={8} xl={7}>
        <Stack
          direction="column"
          padding="5px 15px"
          border={`1px solid ${theme.palette.divider}`}
          boxShadow={`0px 0px 15px 0px ${theme.palette.background[100]}`}
          borderRadius="15px"
        >
          <Grid container p={1}>
            {OurValuesData.map((item) => (
              <Grid item xs={12} md={6} lg={6} key={item.id}>
                <StyledWrapperStack
                  direction="column"
                  className={`item${item.id} ${item.className}`}
                >
                  <Stack direction="row" alignItems="center" gap={2} mb={2}>
                    <Box
                      component="img"
                      src={item.icon}
                      width="75px"
                      height="75px"
                    />
                    <Typography variant="subtitle1" color="text.secondary">
                      {item.title}
                    </Typography>
                  </Stack>
                  <Typography variant="body1" color="text.primary">
                    {item.text}
                  </Typography>
                </StyledWrapperStack>
              </Grid>
            ))}
          </Grid>
        </Stack>
      </Grid>
    </Grid>
  );
};

export default OurValues;
