import { Box, InputLabel, TextField, styled } from "@mui/material";
import React from "react";
import Iconify from "../iconify/iconify";

const StyledBox = styled(Box)(({ theme }) => ({
  border: `1px solid ${theme.palette.divider}`,
  background: theme.palette.background.main,
  borderRadius: "10px",
  display: "flex",
  alignItems: "center",
  gap: "2px",
  input: {
    "&::placeholder": {
      color: theme.palette.text.primary,
    },
  },
  fieldset: {
    border: "none !important",
  },
}));

const StyledIconBox = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: theme.palette.text.secondary,
  paddingLeft: "15px",
}));

const CustomTextField = ({
  label,
  placeholder,
  id,
  type = "string",
  icon,
  iconStatus = false,
}) => {
  return (
    <Box>
      <InputLabel htmlFor={id} sx={{ marginBottom: "10px" }}>
        {label}
      </InputLabel>
      <StyledBox>
        <StyledIconBox>
          {iconStatus ? <Iconify icon={icon} /> : null}
        </StyledIconBox>
        <TextField
          id={id}
          type={type}
          placeholder={placeholder}
          required
          fullWidth
        />
      </StyledBox>
    </Box>
  );
};

export default CustomTextField;
