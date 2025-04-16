import { Grid, Stack, Typography, styled } from "@mui/material";
import React from "react";
import useWindowSize from "../hooks/useWindowSize";

const StyledStack = styled(Stack)(({ theme }) => ({
  border: `2px solid ${theme.palette.divider}`,
  borderRadius: "12px",
  padding: "15px 10px",
  background: theme.palette.grey[900],
}));
const CounterBox = () => {
  const screenWidth = useWindowSize();
  return (
    <Grid container spacing={2}>
      <Grid item xs={screenWidth < 700 ? 12 : 6} lg={6} xl={3.9}>
        <StyledStack>
          <Typography variant="h4" color="text.secondary">
            200+
          </Typography>
          <Typography variant="subtitle2" color="grey">
            Happy Customers
          </Typography>
        </StyledStack>
      </Grid>
      <Grid item xs={screenWidth < 700 ? 12 : 6} lg={6} xl={3.9}>
        <StyledStack>
          <Typography variant="h4" color="text.secondary">
            10k+
          </Typography>
          <Typography variant="subtitle2" color="grey">
            Properties For Clients
          </Typography>
        </StyledStack>
      </Grid>

      <Grid item xs={12} lg={12} xl={3.9}>
        <StyledStack>
          <Typography variant="h4" color="text.secondary">
            16+
          </Typography>
          <Typography variant="subtitle2" color="grey">
            Years of Experience
          </Typography>
        </StyledStack>
      </Grid>
    </Grid>
  );
};

export default CounterBox;
