import { styled, Container } from "@mui/material";

// export const LayoutContainer = styled(Container)(({ theme }) => ({
//   maxWidth: "90% !important",
//   [theme.breakpoints.down("md")]: {
//     maxWidth: "98% !important",
//   },
// }));


export const LayoutContainer = styled(Container)(({ theme }) => ({
  width: '100%',
  margin: '0 auto',

  [theme.breakpoints.up('xl')]: {
    maxWidth: '90%',
  },

  [theme.breakpoints.between('md', 'xl')]: {
    maxWidth: '94%',
  },

  [theme.breakpoints.down('md')]: {
    maxWidth: '98%',
  },
}));
