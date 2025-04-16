import {
  Stack,
  useTheme,
  Typography,
  Box,
  Button,
  styled,
} from "@mui/material";
import React from "react";
import Image from "../../image/image";

const StyledBox = styled(Box)(({ theme }) => ({
  padding: "2px 15px",
  borderRadius: "0 0 3px 3px",
  border: `1px solid ${theme.palette.divider}`,
  background: theme.palette.background.main,
}));

const PossibilitiesItem = ({
  id,
  img,
  nameOfResidence,
  locationName,
  text,
  price,
}) => {
  const theme = useTheme();
  const borderValue = `1px solid ${theme.palette.divider}`;
  return (
    <Stack
      border={borderValue}
      p={{ xs: "20px", md: "40px" }}
      direction="column"
      key={id}
      borderRadius="10px"
    >
      <Image src={img} ratio="16/9" />
      <StyledBox>
        <Typography variant="body2" color="text.secondary">
          {nameOfResidence}
        </Typography>
      </StyledBox>
      <Typography variant="subtitle1" color="text.secondary" py={2}>
        {locationName}
      </Typography>
      <Typography variant="subtitle1" color="text.primary" mb={2}>
        {text}
      </Typography>

      <Stack direction="row" justifyContent="space-between">
        <Stack direction="column">
          <Typography variant="caption" color="text.primary">
            Price
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            {price} $
          </Typography>
        </Stack>

        <Button variant="contained" color="primary">
          View Property Details
        </Button>
      </Stack>
    </Stack>
  );
};

export default PossibilitiesItem;
