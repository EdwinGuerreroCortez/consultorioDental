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
          backgroundColor: "#e6f7ff",

          
        }}
      >

        <NavbarPaciente />
        {/* Breadcrumb */}
        <Box
          sx={{
            backgroundColor: "#ffffff",
            zIndex: 2,
            position: "relative",
          }}
        >
          <BreadcrumbNav userType="paciente" />
        </Box>

        {children}
        <FooterPaciente />
      </Box>
    </>
  );
};

export default LayoutPaciente;
