import { styled, Container } from "@mui/material";

export const LayoutContainer = styled(Container)(({ theme }) => ({
  maxWidth: "90% !important",
  [theme.breakpoints.down("md")]: {
    maxWidth: "98% !important",
  },
}));
