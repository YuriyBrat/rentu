import {
  Stack,
  useTheme,
  Typography,
  Box,
  Button,
  styled,
} from "@mui/material";
import React from "react";
import Iconify from "../../iconify/iconify";
import ThunderIcon from "../../icons/ThunderIcon";

const StyledWrapperStack = styled(Stack)(({ theme }) => ({
  padding: "40px",
  margin: "15px",
  boxShadow: `0px 0px 15px 0px ${theme.palette.background[100]}`,
  [theme.breakpoints.down("sm")]: {
    margin: "0px",
    padding: "15px",
    boxShadow: "none",
  },
}));

const ClientsItem = ({
  since,
  companyName,
  websiteLink,
  domain,
  category,
  feedback,
}) => {
  const theme = useTheme();
  const borderValue = `1px solid ${theme.palette.divider}`;
  return (
    <StyledWrapperStack border={borderValue} borderRadius="10px">
      <Stack
        direction={{ xs: "column", md: "row" }}
        alignItems={{ xs: "left", md: "center" }}
        justifyContent="space-between"
        mb={2}
        gap={1}
      >
        <Stack direction="column" gap={1}>
          <Typography variant="body2" color="text.primary">
            Since {since}
          </Typography>
          <Typography variant="h5" color="text.secondary">
            {companyName}
          </Typography>
        </Stack>
        <Box>
          <Button
            variant="contained"
            color="primary"
            href={websiteLink}
            target="_blank"
            fullWidth
          >
            Visit Website
          </Button>
        </Box>
      </Stack>
      <Stack
        direction={{ xs: "column", md: "row" }}
        alignItems={{ xs: "left", md: "end" }}
        gap={{ xs: 1, md: 5 }}
        mb={2}
      >
        <Stack
          direction="column"
          borderRight={{ xs: "none", md: borderValue }}
          borderBottom={{ xs: borderValue, md: "none" }}
          width={{ xs: "100%", md: "45%" }}
          paddingBottom={{ xs: "10px", md: 0 }}
        >
          <Stack
            direction="row"
            gap={1}
            alignItems="center"
            color="text.primary"
          >
            <Iconify
              icon="uiw:appstore-o"
              sx={{ width: "20px", height: "18px" }}
            />
            <Typography variant="body2">Domain</Typography>
          </Stack>
          <Typography variant="subtitle1" color="text.secondary">
            {domain}
          </Typography>
        </Stack>
        <Stack direction="column">
          <Stack
            direction="row"
            gap={1}
            alignItems="center"
            color="text.primary"
          >
            <ThunderIcon />
            <Typography variant="body2" color="text.primary">
              Category
            </Typography>
          </Stack>
          <Typography variant="subtitle1" color="text.secondary">
            {category}
          </Typography>
        </Stack>
      </Stack>
      <Stack
        direction="column"
        border={borderValue}
        borderRadius="10px"
        padding={{ xs: "10px", md: "20px" }}
      >
        <Typography variant="body2" color="text.primary">
          What They Said 🤗
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          {feedback}
        </Typography>
      </Stack>
    </StyledWrapperStack>
  );
};

export default ClientsItem;
