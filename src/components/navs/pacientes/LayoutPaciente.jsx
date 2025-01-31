import React from "react";
import NavbarPaciente from "../pacientes/NavbarPaciente";
import FooterPaciente from "../pacientes/FooterPaciente";
import { Box, CssBaseline } from "@mui/material";

const LayoutPaciente = ({ children }) => {
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
        <NavbarPaciente />
        <Box
          sx={{
            flex: 1,
            marginTop: "94px", // Altura del Navbar
            marginBottom: "0", // Asegura que no haya espacio antes del footer
            
          }}
        >
          {children}
        </Box>
        <FooterPaciente />
      </Box>
    </>
  );
};

export default LayoutPaciente;
