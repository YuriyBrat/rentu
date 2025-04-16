import React, { useEffect, useRef, useState } from "react";
import { Box, InputLabel, Typography, styled } from "@mui/material";
import Iconify from "../iconify/iconify";

const StyledWrapperBox = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  cursor: "pointer",
  padding: "15px",
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: "10px",
  minWidth: "220px",
  justifyContent: "space-between",
  background: theme.palette.background.main,
  color: theme.palette.text.primary,
}));

const StyledMenuBox = styled(Box)(({ theme }) => ({
  position: "absolute",
  top: "100%",
  left: 0,
  width: "100%",
  zIndex: 55,
  borderRadius: "4px",
  border: `1px solid ${theme.palette.divider}`,
  background: theme.palette.grey[800],
  color: theme.palette.text.secondary,
}));
const StyledItemMenuBox = styled(Box)(({ theme }) => ({
  padding: "10px",
  cursor: "pointer",
  background: theme.palette.grey[800],
  "&:hover": {
    background: theme.palette.background.default,
  },
}));

const StyledArrowBox = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  width: "25px",
  height: "25px",
  borderRadius: "50%",
  background: theme.palette.background.main,
  color: theme.palette.text.secondary,
}));
const CustomSelect = ({ data = [], placeholder, defaultChecked, label }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState(defaultChecked || "");
  const selectRef = useRef(null);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (selectRef.current && !selectRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("click", handleOutsideClick);

    return () => {
      document.removeEventListener("click", handleOutsideClick);
    };
  }, []);

  const toggleOpen = () => {
    setIsOpen(!isOpen);
  };

  const handleOptionClick = (value) => {
    setSelectedOption(value);
    setIsOpen(false);
  };
  return (
    <Box width="100%">
      <InputLabel sx={{ marginBottom: "10px" }}>{label}</InputLabel>
      <Box
        ref={selectRef}
        sx={{ position: "relative", display: "inline-block" }}
        width="100%"
      >
        <StyledWrapperBox onClick={toggleOpen}>
          <Typography variant="subtitle2">
            {selectedOption || placeholder}
          </Typography>
          <StyledArrowBox>
            <Iconify
              icon={isOpen ? "ep:arrow-down-bold" : "ep:arrow-up-bold"}
              sx={{ width: "15px", height: "15px" }}
            />
          </StyledArrowBox>
        </StyledWrapperBox>
        {isOpen && (
          <StyledMenuBox>
            {data.map((item, index) => (
              <StyledItemMenuBox
                key={index}
                onClick={() => handleOptionClick(item.value)}
              >
                <Typography variant="body1">{item.label}</Typography>
              </StyledItemMenuBox>
            ))}
          </StyledMenuBox>
        )}
      </Box>
    </Box>
  );
};

export default CustomSelect;
