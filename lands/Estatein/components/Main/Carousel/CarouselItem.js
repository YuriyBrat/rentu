import {
  Box,
  Stack,
  useTheme,
  Typography,
  styled,
  Button,
} from "@mui/material";
import React from "react";
import Image from "../../image/image";

const StyledRoomsStack = styled(Stack)(({ theme }) => ({
  padding: "5px 10px 3px 10px",
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: "50px",
  gap: "5px",
}));

const CarouselItem = ({ id, img, title, text, roms, price }) => {
  const theme = useTheme();
  const borderValue = `1px solid ${theme.palette.divider}`;
  return (
    <Stack
      border={borderValue}
      p={{ xs: "20px", md: "40px" }}
      direction="column"
      key={id}
      mx={{ xs: "0", md: 2 }}
      borderRadius="10px"
    >
      <Image src={img} alt="property listing" ratio="6/4" />
      <Typography variant="subtitle1" color="text.secondary" py={2}>
        {title}
      </Typography>
      <Typography variant="subtitle1" color="text.primary">
        {text}
      </Typography>
      <Stack direction="row" gap={1} my={2}>
        {roms?.map((j, i) => (
          <StyledRoomsStack direction="row" alignItems="center" key={i}>
            <Box>{j?.icon}</Box>
            <Typography variant="caption" color="text.secondary">
              {j?.count}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {j?.name}
            </Typography>
          </StyledRoomsStack>
        ))}
      </Stack>
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

export default CarouselItem;
