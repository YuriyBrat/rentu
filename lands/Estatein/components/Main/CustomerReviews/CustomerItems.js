import {
  Box,
  Rating,
  Stack,
  useTheme,
  Typography,
  Avatar,
  styled,
} from "@mui/material";
import React from "react";

const StyledWrapperStack = styled(Box)(({ theme }) => ({
  borderRadius: "10px",
  minHeight: "250px",
  display: "flex",
  flexDirection: "column",
  justifyContent: "space-between",
}));

const CustomerItems = ({
  id,
  rating,
  title,
  text,
  userName,
  userImg,
  userCountry,
}) => {
  const theme = useTheme();
  const borderValue = `1px solid ${theme.palette.divider}`;
  return (
    <StyledWrapperStack
      border={borderValue}
      p={{ xs: "20px", md: "30px" }}
      key={id}
    >
      <Box mb={2}>
        <Rating
          name="read-only"
          value={rating}
          size="small"
          readOnly
          sx={{ gap: 1 }}
        />
      </Box>
      <Typography variant="h5" color="text.secondary" mb={1}>
        {title}
      </Typography>
      <Typography variant="subtitle2" color="text.secondary" mb={3}>
        {text}
      </Typography>

      <Stack direction="row" gap={2} alignItems="center">
        <Avatar src={userImg} />
        <Stack direction="column">
          <Typography variant="body1" color="text.secondary">
            {userName}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {userCountry}
          </Typography>
        </Stack>
      </Stack>
    </StyledWrapperStack>
  );
};

export default CustomerItems;
