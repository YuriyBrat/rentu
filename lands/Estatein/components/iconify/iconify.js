// icons
import { Icon } from "@iconify/react";
// @mui
import Box from "@mui/material/Box";
//

const Iconify = ({ icon, width = 20, sx, ref, ...other }) => (
  <Box
    ref={ref}
    component={Icon}
    className="component-iconify"
    icon={icon}
    sx={{ width, height: width, ...sx }}
    {...other}
  />
);

export default Iconify;
