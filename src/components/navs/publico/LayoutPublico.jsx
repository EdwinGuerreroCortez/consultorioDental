import React from "react";
import NavbarPublico from "../publico/NavbarPublico";
import FooterPublico from "../publico/FooterPublico";
import { Box, CssBaseline } from "@mui/material";

const LayoutPublico = ({ children }) => {
  return (
    <>
      <CssBaseline />
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          minHeight: "100vh",
          width: "100%",
          margin: 0,
          padding: 0,
          boxSizing: "border-box", // Reset general para todos los elementos
        }}
      >
        <NavbarPublico />
        <Box
          sx={{
            flex: 1,
            marginTop: "94px", // Altura del Navbar
            marginBottom: "0", // Asegura que no haya espacio antes del footer
            
          }}
        >
          {children}
        </Box>
        <FooterPublico />
      </Box>
    </>
  );
};

export default LayoutPublico;
