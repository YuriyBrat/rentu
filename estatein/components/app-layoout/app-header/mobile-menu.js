'use client'
import React, { useState, useEffect } from "react";
// import { useTheme } from "@emotion/react";
import { Box, Drawer, styled, useTheme } from "@mui/material";
import Iconify from "../../iconify/iconify";
import { headerNav } from ".";

const StyledLinkTage = styled(Box)(({ theme }) => ({
  padding: "12px 20px",
  fontWeight: 500,
  cursor: "pointer",
  textDecoration: "none",
  border: `1px solid transparent`,
  color: theme.palette.text.secondary,
  display: "block",
  textAlign: "center",
  fontFamily: '"Urbanist"',
  "&.active": {
    borderRadius: "10px",
    background: theme.palette.background.default,
    border: `1px solid ${theme.palette.divider}`,
  },
}));
const MobileMenu = () => {
  const [open, setOpen] = useState(false);
  const theme = useTheme();
  const handleToggleClick = () => {
    setOpen(!open);
  };
  const handleClose = () => {
    setOpen(false);
  };
  // const pathName = window.location.pathname;

  let pathName = '';


  useEffect(() => {
    pathName = window.location.pathname;
  }, [])
  return (
    <div>
      <Box
        display={{ xs: "block", lg: "none" }}
        onClick={() => handleToggleClick()}
        color="text.secondary"
      >
        {open ? (
          <Iconify icon="iconamoon:close-fill" />
        ) : (
          <Iconify icon="ci:menu-alt-01" />
        )}
      </Box>
      <Drawer
        anchor="right"
        onClose={() => handleClose()}
        open={open}
        ModalProps={{ sx: { zIndex: 2000 } }}
        PaperProps={{ sx: { width: `45%` } }}
      >
        <Box
          bgcolor={theme.palette.background.default}
          sx={{
            // backgroundColor: `${theme.palette.background.default} !important`,
            height: "100dvh",
            paddingTop: "80px",
          }}
        >
          <Box
            component="ul"
            sx={{ listStyle: "none", margin: "0px", padding: "10px" }}
          >
            {headerNav.map((item, index) => (
              <Box component="li" key={index}>
                <StyledLinkTage
                  component="a"
                  href={item.href}
                  className={pathName === item.href ? "active" : ""}
                >
                  {item.title}
                </StyledLinkTage>
              </Box>
            ))}
            <Box component="li">
              <StyledLinkTage
                component="a"
                href="/contact"
                className={pathName === "/contact" ? "active" : ""}
              >
                Contact Us
              </StyledLinkTage>
            </Box>
          </Box>
        </Box>
      </Drawer>
    </div >
  );
};

export default MobileMenu;
