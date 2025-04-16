import {
  Grid,
  Stack,
  useTheme,
  FormControlLabel,
  Checkbox,
  Button,
} from "@mui/material";
import React from "react";
import CustomeTextarea from "./utils/CustomeTextarea";
import CustomTextField from "./utils/CustomTextField";
import CustomSelect from "./utils/CustomSelect";
import useWindowSize from "../hooks/useWindowSize";

const ContactForm = () => {
  const theme = useTheme();
  const screenWidth = useWindowSize();
  return (
    <Stack
      p={{ xs: 2, md: 4 }}
      border={`1px solid ${theme.palette.divider}`}
      borderRadius="10px"
    >
      <Grid container spacing={3}>
        <Grid item xs={screenWidth < 700 ? 12 : 6} md={4} lg={4}>
          <CustomTextField
            label="First Name"
            id="first-name"
            placeholder="Enter First Name"
          />
        </Grid>
        <Grid item xs={screenWidth < 700 ? 12 : 6} md={4} lg={4}>
          <CustomTextField
            label="Last Name"
            id="last-name"
            placeholder="Enter Last Name"
          />
        </Grid>
        <Grid item xs={screenWidth < 700 ? 12 : 6} md={4} lg={4}>
          <CustomTextField
            label="Email"
            id="email"
            type="mail"
            placeholder="Enter your Email"
          />
        </Grid>

        <Grid item xs={screenWidth < 700 ? 12 : 6} md={4} lg={4}>
          <CustomTextField
            label="Phone"
            id="phone"
            placeholder="Enter your Number"
          />
        </Grid>
        <Grid item xs={screenWidth < 700 ? 12 : 6} md={4} lg={4}>
          <CustomSelect
            placeholder="Select Inquiry Type"
            label="Inquiry Type"
            data={[]}
          />
        </Grid>
        <Grid item xs={screenWidth < 700 ? 12 : 6} md={4} lg={4}>
          <CustomSelect
            placeholder="Select"
            label="How Did You Hear About Us?"
            data={[]}
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
    </Stack>
  );
};

export default ContactForm;
