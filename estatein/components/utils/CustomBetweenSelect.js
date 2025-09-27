import React, { useEffect, useRef, useState } from "react";
import {
  Box,
  Typography,
  styled,
  TextField,
  InputAdornment,
  useTheme,
} from "@mui/material";
import Iconify from "../iconify/iconify";

const StyledWrapperBox = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  cursor: "pointer",
  padding: "10px",
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: "10px",
  minWidth: "220px",
  justifyContent: "space-between",
  background: theme.palette.background.default,
  color: theme.palette.text.primary,
  userSelect: "none",
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

const StyledInputWrapper = styled(Box)(({ theme }) => ({
  position: "absolute",
  top: "100%",
  left: 0,
  width: "100%",
  zIndex: 10,
  marginTop: "6px",
  display: "flex",
  gap: "8px",
  padding: "10px",
  background: theme.palette.background.default,
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: "10px",
  boxShadow: theme.shadows[4],
}));

const StyledInput = styled(TextField)(({ theme }) => ({
  "& input": {
    textAlign: "center",
    padding: "6px 10px",
    fontSize: "0.875rem",
    color: theme.palette.text.primary,
  },
  "& .MuiInputBase-root": {
    background: theme.palette.background.default,
    borderRadius: 8,
  },
}));

const SelectedValue = styled(Typography)(({ theme }) => ({
  backgroundColor: theme.palette.primary.light,
  color: theme.palette.primary.contrastText,
  borderRadius: "12px",
  padding: "1px 10px",
  fontSize: "0.875rem",
  userSelect: "none",
}));

const CustomBetweenSelect = ({
  icon,
  placeholder = "Діапазон",
  symbol = "$",
  min = 0,
  max = 1000000,
  step = 1,
  fromValue = "",
  toValue = "",
  onChange,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [from, setFrom] = useState(fromValue);
  const [to, setTo] = useState(toValue);

  const wrapperRef = useRef(null);

  const toggleOpen = () => setIsOpen((prev) => !prev);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const handleChange = (type, value) => {
    const clean = value.replace(/\D/g, "");

    const num = Number(clean);
    const isValid = !clean || (num >= min && num <= max);
    const newValue = isValid ? clean : "";

    if (type === "from") setFrom(newValue);
    if (type === "to") setTo(newValue);

    onChange?.({
      from: type === "from" ? newValue : from,
      to: type === "to" ? newValue : to,
    });
  };

  const displayValue =
    from || to
      ? `${from ? `від ${from}` : ""}${from && to ? " " : ""}${to ? `до ${to}` : ""} ${symbol}`
      : placeholder;

  return (
    <Box
      ref={wrapperRef}
      sx={{
        position: "relative",
        display: "inline-block",
        width: "19%",
        maxWidth: 320,
      }}
    >
      <StyledWrapperBox onClick={toggleOpen}>
        <Box display="flex" alignItems="center">
          {icon && (
            <StyledIconBox>
              <Iconify icon={icon} />
            </StyledIconBox>
          )}
          {from || to ? (
            <SelectedValue>{displayValue}</SelectedValue>
          ) : (
            <Typography
              variant="subtitle2"
              noWrap
              sx={{ maxWidth: "calc(100% - 40px)" }}
            >
              {placeholder}
            </Typography>
          )}
        </Box>
        <StyledArrowBox>
          <Iconify
            icon={isOpen ? "ep:arrow-down-bold" : "ep:arrow-up-bold"}
            sx={{ width: "15px", height: "15px" }}
          />
        </StyledArrowBox>
      </StyledWrapperBox>

      {isOpen && (
        <StyledInputWrapper>
          <StyledInput
            type="number"
            variant="standard"
            placeholder="від"
            value={from}
            onChange={(e) => handleChange("from", e.target.value)}
            inputProps={{ min, max, step }}
            InputProps={{
              endAdornment: symbol && (
                <InputAdornment position="end">{symbol}</InputAdornment>
              ),
            }}
          />
          <StyledInput
            type="number"
            variant="standard"
            placeholder="до"
            value={to}
            onChange={(e) => handleChange("to", e.target.value)}
            inputProps={{ min, max, step }}
            InputProps={{
              endAdornment: symbol && (
                <InputAdornment position="end">{symbol}</InputAdornment>
              ),
            }}
          />
        </StyledInputWrapper>
      )}
    </Box>
  );
};

export default CustomBetweenSelect;
