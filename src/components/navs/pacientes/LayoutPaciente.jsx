import React from "react";
import NavbarPaciente from "../pacientes/NavbarPaciente";
import FooterPaciente from "../pacientes/FooterPaciente";
import BreadcrumbNav from '../../Breadcrumbs';

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
        {/* Breadcrumb */}
      <Box
        sx={{
          marginTop: "94px",  // Altura del Navbar para evitar que el breadcrumb quede oculto
          padding: "10px",
          backgroundColor: "#ffffff",
          zIndex: 2,
          position: "relative",
        }}
      >
        <BreadcrumbNav userType="paciente" />
      </Box>
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
