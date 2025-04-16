import { Stack, styled, Typography, Button, Box } from "@mui/material";
import React from "react";
import Iconify from "../iconify/iconify";
import useWindowSize from "../../hooks/useWindowSize";

const StyledWrapperStack = styled(Box)(({ theme }) => ({
  padding: "20px",
  margin: "0px 30px",
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: "10px",
  color: theme.palette.text.secondary,
  display: "flex",
  flexDirection: "column",
  gap: "10px",
  justifyContent: "space-between",
  height: "100%", // Set the height to 100%
  boxSizing: "border-box",
  alignItems: "stretch", // Ensure all items stretch to the same height
  minHeight: "300px",
  [theme.breakpoints.down("sm")]: {
    margin: "0px",
    padding: "15px",
  },
}));

const StyledSocilStack = styled(Stack)(({ theme }) => ({
  alignItems: "center",
  gap: "10px",
  border: `1px solid ${theme.palette.divider}`,
  padding: "5px 10px",
  borderRadius: "10px",
}));

const OfficeItem = ({
  buildingType,
  placeName,
  location,
  text,
  emial,
  phone,
}) => {
  const screenWidth = useWindowSize();
  return (
    <StyledWrapperStack>
      <Typography variant="subtitle1">{buildingType}</Typography>
      <Typography variant="h5">{placeName}</Typography>
      <Typography variant="body2" color="text.primary">
        {text}
      </Typography>
      <Stack direction={screenWidth < 1450 ? "column" : "row"} gap={1}>
        <StyledSocilStack direction="row">
          <Iconify icon="mdi:email-outline" />
          <Typography variant="subtitle1">{emial}</Typography>
        </StyledSocilStack>
        <StyledSocilStack direction="row">
          <Iconify icon="line-md:phone-call-loop" />
          <Typography variant="subtitle1">{phone}</Typography>
        </StyledSocilStack>
        <StyledSocilStack direction="row">
          <Iconify icon="ion:location-outline" />
          <Typography variant="subtitle1">{location}</Typography>
        </StyledSocilStack>
      </Stack>
      <Button variant="contained" color="primary" fullWidth>
        Get Direction
      </Button>
    </StyledWrapperStack>
  );
};

export default OfficeItem;
