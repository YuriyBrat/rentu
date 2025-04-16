import {
  Box,
  Grid,
  Stack,
  Typography,
  styled,
  useTheme,
  Button,
  Divider,
} from "@mui/material";
import React from "react";
import StarIcon from "../../icons/StarIcon";

const StyledBox = styled(Box)(({ theme }) => ({
  padding: "30px",
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: "10px",
  marginBottom: "30px",
  [theme.breakpoints.down("sm")]: {
    padding: "15px",
  },
}));

const StyledInfoBox = styled(Box)(({ theme }) => ({
  padding: "5px 10px",
  borderRadius: "50px",
  border: `1px solid ${theme.palette.divider}`,
  background: theme.palette.background.main,
  [theme.breakpoints.down("md")]: {
    borderRadius: "10px",
  },
}));

const StyledRowBox = styled(Box)(({ theme }) => ({
  display: "flex",
  flexDirection: "row",
  alignItems: "center",
  [theme.breakpoints.down("sm")]: {
    display: "flex",
    flexDirection: "column",
    alignItems: "start",
  },
}));

const StyledWrapperBox = styled(Box)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  gap: "10px",
  borderBottom: "none",
  "&.br": {
    borderRight: `1px solid ${theme.palette.divider}`,
    paddingRight: "10px",
  },
  [theme.breakpoints.down("md")]: {
    borderBottom: `1px solid ${theme.palette.divider}`,
    borderRight: "none",
    paddingBottom: "15px",
    "&.br": {
      borderRight: "none",
      paddingRight: "0px",
    },
  },
}));
const Details = () => {
  const theme = useTheme();
  return (
    <Stack direction="column" gap={{ xs: 2, md: 5 }} mb={3}>
      <Stack direction="column" gap={2}>
        <Box mb={1}>
          <StarIcon />
        </Box>

        <Typography variant="h4" color="text.secondary">
          Comprehensive Pricing Details
        </Typography>
        <Typography variant="subtitle1" color="text.primary">
          At Estatein, transparency is key. We want you to have a clear
          understanding of all costs associated with your property investment.
          Below, we break down the pricing for Seaside Serenity Villa to help
          you make an informed decision
        </Typography>
      </Stack>

      <Stack
        direction="row"
        alignItems="center"
        border={`1px solid ${theme.palette.divider}`}
        bgcolor={theme.palette.background.main}
        padding={{ xs: "10px 20px", md: "20px 30px" }}
        borderRadius="10px"
      >
        <Typography
          variant="subtitle1"
          color="text.secondary"
          borderRight={`1px solid ${theme.palette.divider}`}
          pr={2}
          mr={2}
        >
          Note
        </Typography>
        <Typography variant="body1" color="text.primary">
          The figures provided above are estimates and may vary depending on the
          property, location, and individual circumstances.
        </Typography>
      </Stack>
      <Grid container spacing={2}>
        <Grid item xs={12} md={12} lg={2} xl={2}>
          <Stack direction="column" gap={1}>
            <Typography variant="subtitle1" color="text.primary">
              Listing Price
            </Typography>
            <Typography variant="h5" color="text.secondary">
              $1,250,000
            </Typography>
          </Stack>
        </Grid>
        <Grid item xs={12} md={12} lg={10} xl={10}>
          <StyledBox>
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
              pb={3}
            >
              <Typography variant="h5" color="text.secondary">
                Additional Fees
              </Typography>
              <Button variant="contained" color="primary">
                Learn More
              </Button>
            </Stack>
            <Divider variant="fullWidth" orientation="horizontal" />
            {/*  */}
            <Stack
              direction={{ xs: "column", md: "row" }}
              justifyContent="space-between"
              py={3}
            >
              <StyledWrapperBox width="100%" className="br">
                <Typography variant="body1" color="text.primary">
                  Property Transfer Tax
                </Typography>
                <StyledRowBox gap={2}>
                  <Typography variant="subtitle1" color="text.secondary">
                    $25,000
                  </Typography>
                  <StyledInfoBox>
                    <Typography
                      variant="body1"
                      color="text.primary"
                      textAlign="center"
                    >
                      Based on the sale price and local regulations
                    </Typography>
                  </StyledInfoBox>
                </StyledRowBox>
              </StyledWrapperBox>
              {/*  */}
              <StyledWrapperBox
                width="100%"
                pl={{ xs: 0, md: 3 }}
                pt={{ xs: 1, md: 0 }}
              >
                <Typography variant="body1" color="text.primary">
                  Legal Fees
                </Typography>
                <StyledRowBox gap={2}>
                  <Typography variant="subtitle1" color="text.secondary">
                    $3,000
                  </Typography>
                  <StyledInfoBox>
                    <Typography
                      variant="body1"
                      color="text.primary"
                      textAlign="center"
                    >
                      Approximate cost for legal services, including title
                      transfer
                    </Typography>
                  </StyledInfoBox>
                </StyledRowBox>
              </StyledWrapperBox>
            </Stack>
            <Box display={{ xs: "none", md: "block" }}>
              <Divider variant="fullWidth" orientation="horizontal" />
            </Box>
            {/*  */}
            <Stack
              py={{ xs: 0, md: 3 }}
              direction={{ xs: "column", md: "row" }}
            >
              <StyledWrapperBox gap={1} width="100%" className="br">
                <Typography variant="body1" color="text.primary">
                  Home Inspection
                </Typography>
                <StyledRowBox gap={2}>
                  <Typography variant="subtitle1" color="text.secondary">
                    $500
                  </Typography>
                  <StyledInfoBox>
                    <Typography
                      variant="body1"
                      color="text.primary"
                      textAlign="center"
                    >
                      Recommended for due diligence
                    </Typography>
                  </StyledInfoBox>
                </StyledRowBox>
              </StyledWrapperBox>
              {/*  */}
              <StyledWrapperBox
                pt={{ xs: 1, md: 0 }}
                pl={{ xs: 0, md: 3 }}
                width="100%"
              >
                <Typography variant="body1" color="text.primary">
                  Property Insurance
                </Typography>
                <StyledRowBox gap={2}>
                  <Typography variant="subtitle1" color="text.secondary">
                    $1,200
                  </Typography>
                  <StyledInfoBox>
                    <Typography
                      variant="body1"
                      color="text.primary"
                      textAlign="center"
                    >
                      Annual cost for comprehensive property insurance
                    </Typography>
                  </StyledInfoBox>
                </StyledRowBox>
              </StyledWrapperBox>
            </Stack>
            {/*  */}
            <Divider variant="fullWidth" orientation="horizontal" />
            <Stack direction="column" gap={1} pt={2}>
              <Typography variant="body1" color="text.primary">
                Property Transfer Tax
              </Typography>
              <StyledRowBox gap={2}>
                <Typography variant="subtitle1" color="text.secondary">
                  Varies
                </Typography>
                <StyledInfoBox>
                  <Typography
                    variant="body1"
                    color="text.primary"
                    textAlign="center"
                  >
                    If applicable, consult with your lender for specific details
                  </Typography>
                </StyledInfoBox>
              </StyledRowBox>
            </Stack>
          </StyledBox>
          {/*  */}
          <StyledBox>
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
              pb={3}
            >
              <Typography variant="h5" color="text.secondary">
                Monthly Costs
              </Typography>
              <Button variant="contained" color="primary">
                Learn More
              </Button>
            </Stack>
            <Divider variant="fullWidth" orientation="horizontal" />
            <Stack direction="row" justifyContent="space-between" py={3}>
              <Stack direction="column" gap={1}>
                <Typography variant="body1" color="text.primary">
                  Property Taxes
                </Typography>
                <StyledRowBox gap={2}>
                  <Typography variant="subtitle1" color="text.secondary">
                    $1,250
                  </Typography>
                  <StyledInfoBox>
                    <Typography
                      variant="body1"
                      color="text.primary"
                      textAlign="center"
                    >
                      Approximate monthly property tax based on the sale price
                      and local rates
                    </Typography>
                  </StyledInfoBox>
                </StyledRowBox>
              </Stack>
            </Stack>
            <Divider variant="fullWidth" orientation="horizontal" />
            <Stack direction="row" justifyContent="space-between" py={3}>
              <Stack direction="column" gap={1}>
                <Typography variant="body1" color="text.primary">
                  Homeowners' Association Fee
                </Typography>
                <StyledRowBox gap={2}>
                  <Typography variant="subtitle1" color="text.secondary">
                    $300
                  </Typography>
                  <StyledInfoBox>
                    <Typography
                      variant="body1"
                      color="text.primary"
                      textAlign="center"
                    >
                      Monthly fee for common area maintenance and security
                    </Typography>
                  </StyledInfoBox>
                </StyledRowBox>
              </Stack>
            </Stack>
          </StyledBox>
          {/*  */}
          <StyledBox>
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
              pb={2}
            >
              <Typography variant="h5" color="text.secondary">
                Total Initial Costs
              </Typography>
              <Button variant="contained" color="primary">
                Learn More
              </Button>
            </Stack>
            <Divider variant="fullWidth" orientation="horizontal" />
            {/*  */}
            <Stack
              direction={{ xs: "column", md: "row" }}
              justifyContent="space-between"
              py={3}
            >
              <StyledWrapperBox gap={1} width="100%" className="br">
                <Typography variant="body1" color="text.primary">
                  Listing Price
                </Typography>
                <Stack direction="row" alignItems="center" gap={2}>
                  <Typography variant="subtitle1" color="text.secondary">
                    $1,250,000
                  </Typography>
                </Stack>
              </StyledWrapperBox>
              {/*  */}
              <Stack
                direction="column"
                gap={1}
                pl={{ xs: 0, md: 3 }}
                pt={{ xs: 1, md: 0 }}
                width="100%"
              >
                <Typography variant="body1" color="text.primary">
                  Additional Fees
                </Typography>
                <StyledRowBox gap={2}>
                  <Typography variant="subtitle1" color="text.secondary">
                    $29,700
                  </Typography>
                  <StyledInfoBox>
                    <Typography
                      variant="body1"
                      color="text.primary"
                      textAlign="center"
                    >
                      Property transfer tax, legal fees, inspection, insurance
                    </Typography>
                  </StyledInfoBox>
                </StyledRowBox>
              </Stack>
            </Stack>
            <Divider variant="fullWidth" orientation="horizontal" />
            {/*  */}
            <Stack
              direction={{ xs: "column", md: "row" }}
              justifyContent="space-between"
              py={2}
            >
              <StyledWrapperBox gap={1} width="100%" className="br">
                <Typography variant="body1" color="text.primary">
                  Down Payment
                </Typography>
                <StyledRowBox gap={2}>
                  <Typography variant="subtitle1" color="text.secondary">
                    $250,000
                  </Typography>
                  <StyledInfoBox>
                    <Typography
                      variant="body1"
                      color="text.primary"
                      textAlign="center"
                    >
                      20%
                    </Typography>
                  </StyledInfoBox>
                </StyledRowBox>
              </StyledWrapperBox>
              {/*  */}
              <Stack
                direction="column"
                gap={1}
                pl={{ xs: 0, md: 3 }}
                pt={{ xs: 1, md: 0 }}
                width="100%"
              >
                <Typography variant="body1" color="text.primary">
                  Mortgage Amount
                </Typography>
                <StyledRowBox gap={1}>
                  <Typography variant="subtitle1" color="text.secondary">
                    $1,000,000
                  </Typography>
                  <StyledInfoBox>
                    <Typography
                      variant="body1"
                      color="text.primary"
                      textAlign="center"
                    >
                      If applicable
                    </Typography>
                  </StyledInfoBox>
                </StyledRowBox>
              </Stack>
            </Stack>
          </StyledBox>
          {/*  */}
          <StyledBox>
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
              pb={3}
            >
              <Typography variant="h5" color="text.secondary">
                Monthly Expenses
              </Typography>
              <Button variant="contained" color="primary">
                Learn More
              </Button>
            </Stack>
            <Divider variant="fullWidth" orientation="horizontal" />
            {/*  */}
            <Stack
              direction={{ xs: "column", md: "row" }}
              justifyContent="space-between"
              py={3}
            >
              <StyledWrapperBox gap={1} width="100%" className="br">
                <Typography variant="body1" color="text.primary">
                  Property Taxes
                </Typography>
                <Stack direction="row" alignItems="center" gap={2}>
                  <Typography variant="subtitle1" color="text.secondary">
                    $1,250
                  </Typography>
                </Stack>
              </StyledWrapperBox>
              {/*  */}
              <StyledRowBox
                gap={1}
                pl={{ xs: 0, md: 3 }}
                pt={{ xs: 1, md: 0 }}
                width="100%"
              >
                <Typography variant="body1" color="text.primary">
                  Homeowners' Association Fee
                </Typography>
                <Stack direction="row" alignItems="center" gap={2}>
                  <Typography variant="subtitle1" color="text.secondary">
                    $300
                  </Typography>
                </Stack>
              </StyledRowBox>
            </Stack>
            <Divider variant="fullWidth" orientation="horizontal" />
            {/*  */}
            <Stack
              direction={{ xs: "column", md: "row" }}
              justifyContent="space-between"
              py={{ xs: 1, md: 3 }}
            >
              <StyledWrapperBox gap={1} width="100%" className="br">
                <Typography variant="body1" color="text.primary">
                  Mortgage Payment
                </Typography>
                <StyledRowBox gap={2}>
                  <Typography variant="subtitle1" color="text.secondary">
                    Varies based on terms and interest rate
                  </Typography>
                  <StyledInfoBox>
                    <Typography
                      variant="body1"
                      color="text.primary"
                      textAlign="center"
                    >
                      If applicable
                    </Typography>
                  </StyledInfoBox>
                </StyledRowBox>
              </StyledWrapperBox>
              {/*  */}
              <Stack
                direction="column"
                gap={1}
                pl={{ xs: 0, md: 3 }}
                pt={{ xs: 1, md: 0 }}
                width="100%"
              >
                <Typography variant="body1" color="text.primary">
                  Property Insurance
                </Typography>
                <StyledRowBox gap={2}>
                  <Typography variant="subtitle1" color="text.secondary">
                    $100
                  </Typography>
                  <StyledInfoBox>
                    <Typography
                      variant="body1"
                      color="text.primary"
                      textAlign="center"
                    >
                      Approximate monthly cost
                    </Typography>
                  </StyledInfoBox>
                </StyledRowBox>
              </Stack>
            </Stack>
          </StyledBox>
        </Grid>
      </Grid>
    </Stack>
  );
};

export default Details;
