import React, { useEffect, useRef, useState } from "react";
import { Box, Typography, styled } from "@mui/material";
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
   flexWrap: "wrap",
}));

const StyledIconBox = styled(Box)(({ theme }) => ({
   paddingRight: "10px",
   marginRight: "10px",
   borderRight: `1px solid ${theme.palette.divider}`,
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
   maxHeight: 200,
   overflowY: "auto",
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

const SelectedValuesBox = styled(Box)(({ theme }) => ({
   display: "flex",
   flexWrap: "wrap",
   gap: "4px",
   maxWidth: "calc(100% - 40px)",
   overflowWrap: "break-word",
}));

const SelectedValue = styled(Typography)(({ theme }) => ({
   backgroundColor: theme.palette.primary.light,
   color: theme.palette.primary.contrastText,
   borderRadius: "12px",
   padding: "1px 10px",
   fontSize: "0.875rem",
   userSelect: "none",
}));





const CustomMultiSelect = ({
   icon,
   data = [],
   placeholder = "",
   defaultChecked = [],
   onChange,
}) => {
   const [isOpen, setIsOpen] = useState(false);
   const [selectedOption, setSelectedOption] = useState(defaultChecked || []);

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

   const toggleOpen = () => setIsOpen(!isOpen);

   const handleOptionClick = (value) => {
      let newSelection = [...selectedOption];
      if (newSelection.includes(value)) {
         newSelection = newSelection.filter((v) => v !== value);
      } else {
         newSelection.push(value);
      }
      setSelectedOption(newSelection);
      onChange && onChange(newSelection); // <-- Повертаємо саме value!
   };

   // Повертаємо масив label-ів, які відповідають вибраним value
   const getSelectedLabels = () => {
      if (!selectedOption.length) return null;
      return selectedOption
         .map((val) => data.find((d) => d.value === val)?.value)   // label було і підтягувало розширені фільтри
         .filter(Boolean);
   };

   const selectedLabels = getSelectedLabels();

   return (
      <Box ref={selectRef} sx={{ position: "relative", display: "inline-block", width: "19%", maxWidth: 320 }}>
         <StyledWrapperBox onClick={toggleOpen}>
            <Box display="flex" alignItems="center" minWidth={0}>
               {icon && (
                  <StyledIconBox>
                     <Iconify icon={icon} />
                  </StyledIconBox>
               )}
               {selectedLabels && selectedLabels.length > 0 ? (
                  <SelectedValuesBox>
                     {selectedLabels.map((label, i) => (
                        <SelectedValue key={i}>{label}</SelectedValue>
                     ))}
                  </SelectedValuesBox>
               ) : (
                  <Typography variant="subtitle2" noWrap sx={{ maxWidth: "calc(100% - 40px)" }}>
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
            <StyledMenuBox>
               {data.map(({ label, value }, index) => (
                  <StyledItemMenuBox
                     key={index}
                     onClick={() => handleOptionClick(value)}
                     sx={{
                        fontWeight: selectedOption.includes(value) ? "bold" : "normal",
                        backgroundColor: selectedOption.includes(value)
                           ? "rgba(255,255,255,0.1)"
                           : undefined,
                     }}
                  >
                     <Typography variant="body1">{label}</Typography>
                  </StyledItemMenuBox>
               ))}
            </StyledMenuBox>
         )}
      </Box>
   );
};

export default CustomMultiSelect;
