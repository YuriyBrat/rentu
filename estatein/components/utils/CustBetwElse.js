import React, { useEffect, useRef, useState } from "react";
import { Box, Typography, InputBase, styled } from "@mui/material";
import Iconify from "../iconify/iconify";

// === Styled ===

const StyledWrapperBox = styled(Box)(({ theme, $active }) => ({
  display: "flex",
  alignItems: "center",
  cursor: "pointer",
  padding: "10px",
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: "10px",
  minWidth: "220px",
  justifyContent: "space-between",
  background: $active
    ? theme.palette.primary.light
    : theme.palette.background.default,
  color: $active
    ? theme.palette.primary.contrastText
    : theme.palette.text.primary,
  userSelect: "none",
  flexWrap: "wrap",
  position: "relative",
}));

const StyledIconBox = styled(Box)(({ theme }) => ({
  paddingRight: "10px",
  marginRight: "10px",
  borderRight: `1px solid ${theme.palette.divider}`,
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

const StyledDropdownBox = styled(Box)(({ theme }) => ({
  position: "absolute",
  top: "100%",
  left: 0,
  width: "100%",
  marginTop: "6px",
  zIndex: 10,
  display: "flex",
  gap: "10px",
  background: theme.palette.background.default,
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: "10px",
  padding: "10px",
}));

const StyledInput = styled(InputBase)(({ theme }) => ({
  flex: 1,
  borderRadius: "8px",
  background: theme.palette.background.paper,
  color: theme.palette.text.primary,
  padding: "6px 12px",
  border: `1px solid ${theme.palette.divider}`,
  "&:focus-within": {
    borderColor: theme.palette.primary.main,
  },
}));

// === Component ===

const CustBetwElse = ({
  icon,
  label = "",
  placeholderFrom = "Від",
  placeholderTo = "До",
  symbol = "₴",
  min = 0,
  max = 1000000,
  defaultFrom = "",
  defaultTo = "",
  onChange,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [fromValue, setFromValue] = useState(defaultFrom);
  const [toValue, setToValue] = useState(defaultTo);
  const selectRef = useRef(null);

  const toggleOpen = () => setIsOpen((prev) => !prev);

  const handleOutsideClick = (e) => {
    if (selectRef.current && !selectRef.current.contains(e.target)) {
      setIsOpen(false);
    }
  };

  const handleChange = (type, val) => {
    const value = val.replace(/\D/g, "");
    if (type === "from") setFromValue(value);
    if (type === "to") setToValue(value);
    onChange &&
      onChange({
        from: type === "from" ? value : fromValue,
        to: type === "to" ? value : toValue,
      });
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const hasValue = fromValue || toValue;

  return (
    <Box
      ref={selectRef}
      sx={{
        position: "relative",
        display: "inline-block",
        width: "19%",
        maxWidth: 320,
      }}
    >
      <StyledWrapperBox onClick={toggleOpen} $active={hasValue}>
        <Box display="flex" alignItems="center">
          {icon && (
            <StyledIconBox>
              <Iconify icon={icon} />
            </StyledIconBox>
          )}
          <Typography variant="subtitle2">
            {hasValue
              ? `${fromValue || "—"}${symbol} – ${toValue || "—"}${symbol}`
              : label}
          </Typography>
        </Box>
        <StyledArrowBox>
          <Iconify
            icon={isOpen ? "ep:arrow-down-bold" : "ep:arrow-up-bold"}
            sx={{ width: "15px", height: "15px" }}
          />
        </StyledArrowBox>
      </StyledWrapperBox>

      {isOpen && (
        <StyledDropdownBox>
          <StyledInput
            type="text"
            value={fromValue}
            onChange={(e) => handleChange("from", e.target.value)}
            placeholder={placeholderFrom}
            inputProps={{ min, max }}
          />
          <StyledInput
            type="text"
            value={toValue}
            onChange={(e) => handleChange("to", e.target.value)}
            placeholder={placeholderTo}
            inputProps={{ min, max }}
          />
        </StyledDropdownBox>
      )}
    </Box>
  );
};

export default CustBetwElse;
