'use client'

import { Box, Grid, Grid2,  Stack, styled, Typography } from "@mui/material";
import React from "react";

const StyledWrapperStack = styled(Stack)(({ theme }) => ({
  background: theme.palette.background.default,
  padding: "20px",
}));

const StyledItemStack = styled(Stack)(({ theme }) => ({
  background: theme.palette.background.main,
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: "10px",
  padding: "15px 20px",
  gap: "15px",
  height: "100%",
  boxSizing: "border-box",
}));
const ConvenientBar = () => {
  return (
    <StyledWrapperStack>
      <Grid container spacing={2}>
        {data.map((item, index) => (
          <Grid item key={index} xs={12} md={3}>
            <StyledItemStack direction="column" alignItems="center">
              <Box
                component="img"
                src={item.icon}
                width={{ xs: "50px", md: "80px" }}
                height={{ xs: "50px", md: "80px" }}
              />
              <Typography
                variant="subtitle1"
                color="text.secondary"
                align="center"
              >
                {item.txt}
              </Typography>
            </StyledItemStack>
          </Grid>
        ))}
      </Grid>
      
    </StyledWrapperStack>
  );
};

export default ConvenientBar;

const data = [
  {
    icon: "/esta/assets/home/IconContainer.svg",
    txt: "Find Your Dream Home",
  },
  {
    icon: "/esta/assets/home/IconContainer1.svg",
    txt: "Unlock Property Value",
  },
  {
    icon: "/esta/assets/home/IconContainer2.svg",
    txt: "Effortless Property Management",
  },
  {
    icon: "/esta/assets/home/IconContainer3.svg",
    txt: "Smart Investments, Informed Decisions",
  },
];
