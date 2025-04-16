import React from "react";
import { LayoutContainer } from "../app-layoout/container";
import { Box, Grid, Stack, Typography, styled, Button } from "@mui/material";
import StarIcon from "../icons/StarIcon";
import useWindowSize from "../../hooks/useWindowSize";

export const StyledBox = styled(Box)(({ theme }) => ({
  padding: "30px",
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: "10px",
  minHeight: "150px",
  height: "100%",
  boxSizing: "border-box",
  [theme.breakpoints.down("sm")]: {
    padding: "20px",
  },
}));
const StyledLastBox = styled(Box)(({ theme }) => ({
  padding: "30px",
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: "10px",
  minHeight: "150px",
  background: "url(/assets/services/AbstractDesign.png)",
  backgroundRepeat: "no-repeat",
  backgroundSize: "100% 100%",
  height: "100%",
  boxSizing: "border-box",
  [theme.breakpoints.down("sm")]: {
    padding: "20px",
  },
}));

export const StyledIconBox = styled(Box)(({ theme }) => ({
  width: "60px",
  height: "60px",
  [theme.breakpoints.down("sm")]: {
    width: "40px",
    height: "40px",
  },
}));

const RepeatingSection = ({
  title,
  text,
  firstBox,
  secondBox,
  thirdBox,
  theFourthBox,
  lastBox,
}) => {
  const screenWidth = useWindowSize();
  return (
    <Stack pt={{ xs: "60px", md: "130px" }}>
      <LayoutContainer>
        <Stack mb={3}>
          <Box mb={2}>
            <StarIcon />
          </Box>
          <Typography variant="h3" color="text.secondary" mb={2}>
            {title}
          </Typography>
          <Typography
            variant="subtitle1"
            color="text.secondary"
            width={{ xs: "100%", md: "60%" }}
            mb={5}
          >
            {text}
          </Typography>
        </Stack>
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <StyledBox>
              <Stack
                direction={
                  screenWidth < 1100
                    ? screenWidth < 1000
                      ? "row"
                      : "column"
                    : "row"
                }
                alignItems="center"
                gap={2}
                mb={2}
              >
                <StyledIconBox component="img" src={firstBox.icon} />
                <Typography variant="h5" color="text.secondary">
                  {firstBox.title}
                </Typography>
              </Stack>
              <Typography variant="subtitle1" color="text.primary">
                {firstBox.text}
              </Typography>
            </StyledBox>
          </Grid>
          <Grid item xs={12} md={4}>
            <StyledBox>
              <Stack
                direction={
                  screenWidth < 1100
                    ? screenWidth < 1000
                      ? "row"
                      : "column"
                    : "row"
                }
                alignItems="center"
                gap={2}
                mb={2}
              >
                <StyledIconBox component="img" src={secondBox.icon} />
                <Typography variant="h5" color="text.secondary">
                  {secondBox.title}
                </Typography>
              </Stack>
              <Typography variant="subtitle1" color="text.primary">
                {secondBox.text}
              </Typography>
            </StyledBox>
          </Grid>
          <Grid item xs={12} md={4}>
            <StyledBox>
              <Stack
                direction={
                  screenWidth < 1100
                    ? screenWidth < 1000
                      ? "row"
                      : "column"
                    : "row"
                }
                alignItems="center"
                gap={2}
                mb={2}
              >
                <StyledIconBox component="img" src={thirdBox.icon} />
                <Typography variant="h5" color="text.secondary">
                  {thirdBox.title}
                </Typography>
              </Stack>
              <Typography variant="subtitle1" color="text.primary">
                {thirdBox.text}
              </Typography>
            </StyledBox>
          </Grid>
          <Grid item xs={12} md={4}>
            <StyledBox>
              <Stack
                direction={
                  screenWidth < 1100
                    ? screenWidth < 1000
                      ? "row"
                      : "column"
                    : "row"
                }
                alignItems="center"
                gap={2}
                mb={2}
              >
                <StyledIconBox component="img" src={theFourthBox.icon} />
                <Typography variant="h5" color="text.secondary">
                  {theFourthBox.title}
                </Typography>
              </Stack>
              <Typography variant="subtitle1" color="text.primary">
                {theFourthBox.text}
              </Typography>
            </StyledBox>
          </Grid>
          <Grid item xs={12} md={8}>
            <StyledLastBox>
              <Stack
                direction={{ xs: "column", md: "row" }}
                justifyContent="space-between"
                alignItems={{ xs: "initial", md: "center" }}
                mb={3}
                gap={2}
              >
                <Typography variant="h5" color="text.secondary" align="center">
                  {lastBox.title}
                </Typography>

                <Button variant="contained" color="primary">
                  Learn More
                </Button>
              </Stack>
              <Typography variant="subtitle1" color="text.primary">
                {lastBox.text}
              </Typography>
            </StyledLastBox>
          </Grid>
        </Grid>
      </LayoutContainer>
    </Stack>
  );
};

export default RepeatingSection;
