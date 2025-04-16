import {
  Box,
  Button,
  Checkbox,
  FormControlLabel,
  Grid,
  Stack,
  Typography,
  styled,
} from "@mui/material";
import React from "react";
import StarIcon from "../../icons/StarIcon";
import CustomTextField from "../../utils/CustomTextField";
import CustomeTextarea from "../../utils/CustomeTextarea";

const StyledBorderStack = styled(Stack)(({ theme }) => ({
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: "8px",
  padding: "35px",
  [theme.breakpoints.down("sm")]: {
    padding: "15px",
  },
}));

const FormPage = () => {
  return (
    <Grid container spacing={4} pb={{ xs: 3, md: 7 }}>
      <Grid item xs={12} md={5}>
        <Stack direction="column" gap={2}>
          <Box mb={1}>
            <StarIcon />
          </Box>

          <Typography variant="h4" color="text.secondary">
            Inquire About Seaside Serenity Villa
          </Typography>
          <Typography variant="subtitle1" color="text.primary">
            Interested in this property? Fill out the form below, and our real
            estate experts will get back to you with more details, including
            scheduling a viewing and answering any questions you may have.
          </Typography>
        </Stack>
      </Grid>
      <Grid item xs={12} md={7}>
        <StyledBorderStack>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <CustomTextField
                label="First Name"
                id="first-name"
                placeholder="Enter First Name"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <CustomTextField
                label="Last Name"
                id="last-name"
                placeholder="Enter Last Name"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <CustomTextField
                label="Email"
                id="email"
                type="mail"
                placeholder="Enter your Email"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <CustomTextField
                label="Phone"
                id="phone"
                placeholder="Enter your Number"
              />
            </Grid>
            <Grid item xs={12}>
              <CustomTextField
                label="Select Property"
                id="location"
                placeholder="Seaside Serenity Villa, Malibu, California"
              />
            </Grid>
            <Grid item xs={12}>
              <CustomeTextarea
                id="message"
                label="Message"
                placeholder="Enter your Message here..."
                maxRow={6}
                minRow={6}
              />
            </Grid>
            <Grid item xs={12}>
              <Stack
                direction={{ xs: "column", md: "row" }}
                alignItems={{ xs: "initial", md: "center" }}
                justifyContent="space-between"
                gap={1}
              >
                <FormControlLabel
                  sx={{ color: "text.secondary", userSelect: "none" }}
                  label="I agree with Terms of Use and Privacy Policy"
                  control={<Checkbox color="primary" />}
                />
                <Button variant="contained" color="primary">
                  Send Your Message
                </Button>
              </Stack>
            </Grid>
          </Grid>
        </StyledBorderStack>
      </Grid>
    </Grid>
  );
};

export default FormPage;
