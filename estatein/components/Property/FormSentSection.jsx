import {
  Box,
  Checkbox,
  FormControlLabel,
  Grid,
  Stack,
  Typography,
  useTheme,
  Button,
} from "@mui/material";
import React from "react";
import StarIcon from "../icons/StarIcon";
import CustomTextField from "../utils/CustomTextField";
import CustomSelect from "../utils/CustomSelect";
import CustomeTextarea from "../utils/CustomeTextarea";
import useWindowSize from "../../hooks/useWindowSize";

const FormSentSection = () => {
  const theme = useTheme();
  const screenWidth = useWindowSize();
  return (
    <Stack py={5}>
      <Box mb={2}>
        <StarIcon />
      </Box>
      <Typography variant="h3" color="text.secondary" mb={2}>
        Let's Make it Happen
      </Typography>
      <Typography variant="subtitle1" color="text.primary" mb={2}>
        Ready to take the first step toward your dream property? Fill out the
        form below, and our real estate wizards will work their magic to find
        your perfect match. Don't wait; let's embark on this exciting journey
        together.
      </Typography>

      <Stack
        border={`1px solid ${theme.palette.divider}`}
        p={{ xs: "20px", md: "60px" }}
        borderRadius="10px"
      >
        <Grid container spacing={3}>
          <Grid item xs={12} md={4} lg={4} xl={3}>
            <CustomTextField
              label="First Name"
              placeholder="Enter First Name"
              id="name"
            />
          </Grid>
          <Grid item xs={screenWidth < 700 ? 12 : 6} md={4} lg={4} xl={3}>
            <CustomTextField
              label="Last Name"
              placeholder="Enter Last Name"
              id="last-name"
            />
          </Grid>
          <Grid item xs={screenWidth < 700 ? 12 : 6} md={4} lg={4} xl={3}>
            <CustomTextField
              label="Email"
              placeholder="Enter Email"
              id="email"
              type="email"
            />
          </Grid>
          <Grid item xs={screenWidth < 700 ? 12 : 6} md={4} lg={4} xl={3}>
            <CustomTextField
              label="Phone"
              placeholder="Enter Phone Number"
              id="number"
            />
          </Grid>
          <Grid item xs={screenWidth < 700 ? 12 : 6} md={4} lg={4} xl={3}>
            <CustomSelect
              label="Preferred Location"
              placeholder="Select Location"
              data={[]}
            />
          </Grid>
          <Grid item xs={screenWidth < 700 ? 12 : 6} md={4} lg={4} xl={3}>
            <CustomSelect
              label="Property Type"
              placeholder="Select Property Type"
              data={[]}
            />
          </Grid>
          <Grid item xs={screenWidth < 700 ? 12 : 6} md={4} lg={4} xl={3}>
            <CustomSelect
              label="No. of Bathrooms"
              placeholder="Select no. of Bathrooms"
              data={[]}
            />
          </Grid>
          <Grid item xs={screenWidth < 700 ? 12 : 6} md={4} lg={4} xl={3}>
            <CustomSelect
              label="No. of Bedrooms"
              placeholder="Select no. of Bedrooms"
              data={[]}
            />
          </Grid>
          <Grid
            item
            xs={screenWidth < 700 ? 12 : 6}
            md={screenWidth > 1000 ? 4 : 6}
            xl={4}
          >
            <CustomSelect
              label="Budget"
              placeholder="Select Budget"
              data={[]}
            />
          </Grid>
          <Grid item xs={screenWidth < 700 ? 12 : 6} md={6} lg={6} xl={4}>
            <CustomTextField
              label="Preferred Contact Method"
              placeholder="Enter Your Number"
              id="perferred-number"
              icon="line-md:phone"
              iconStatus={true}
            />
          </Grid>
          <Grid item xs={screenWidth < 700 ? 12 : 6} md={6} lg={6} xl={4}>
            <CustomTextField
              label="Preferred Contact Method"
              placeholder="Enter Your Email"
              id="name"
              icon="line-md:email-twotone-alt"
              iconStatus={true}
            />
          </Grid>
          <Grid item xs={12}>
            <CustomeTextarea
              placeholder="Enter your Message here.."
              label="Message"
              minRow={6}
              maxRow={6}
            />
          </Grid>
          <Grid item xs={screenWidth < 820 ? 12 : 6} md={9} xl={10}>
            <FormControlLabel
              control={<Checkbox />}
              label="I agree with Terms of Use and Privacy Policy"
              sx={{ color: "text.primary", userSelect: "none" }}
            />
          </Grid>
          <Grid item xs={screenWidth < 820 ? 12 : 6} md={3} xl={2}>
            <Button variant="contained" color="primary" fullWidth>
              Send Your Message
            </Button>
          </Grid>
        </Grid>
      </Stack>
    </Stack>
  );
};

export default FormSentSection;
