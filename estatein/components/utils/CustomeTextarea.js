import { Box, InputLabel, TextareaAutosize, styled } from "@mui/material";
import React from "react";

const Textarea = styled(TextareaAutosize)(({ theme }) => ({
  background: theme.palette.background.main,
  border: `1px solid ${theme.palette.divider}`,
  padding: "10px 15px",
  borderRadius: "10px",
  outline: "none",
  width: "100%",
  color: theme.palette.text.primary,
  boxSizing: "border-box",
  maxHeight: "130px",
  resize: "none",
}));

const CustomeTextarea = ({
  id,
  label,
  placeholder,
  maxRow = 4,
  minRow = 4,
}) => {
  return (
    <Box width="100%">
      <InputLabel htmlFor={id} sx={{ marginBottom: "10px" }}>
        {label}
      </InputLabel>
      <Textarea maxRows={maxRow} minRows={minRow} placeholder={placeholder} />
    </Box>
  );
};

export default CustomeTextarea;
