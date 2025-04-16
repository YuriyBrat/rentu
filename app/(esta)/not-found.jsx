import AppLayout from "@/estatein/components/app-layoout";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

const NotFound = () => {
  
  return (
    <AppLayout>
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        minHeight="40dvh"
      >
        <Typography variant="h1" color="#ffffff">
          404
        </Typography>
        <Typography color="#ffffff" variant="h6">
          Page Not Found!!!
        </Typography>
      </Box>
    </AppLayout>
  );
};

export default NotFound;
