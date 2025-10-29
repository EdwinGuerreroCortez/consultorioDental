import React from "react";
import NavbarPaciente from "../pacientes/NavbarPaciente";
import FooterPaciente from "../pacientes/FooterPaciente";
import BreadcrumbNav from "../../Breadcrumbs";
import { Box, CssBaseline } from "@mui/material";

const LayoutPaciente = ({ children }) => {
  return (
    <>
      <CssBaseline />
      <NavbarPaciente />

      {/* Contenedor general de la vista paciente */}
      <Box
        sx={{
          width: "100%",
          overflowX: "hidden",
          overflowY: "visible",
          position: "relative",
          boxSizing: "border-box",
          backgroundColor: "#fff",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        {/* Breadcrumb pegado debajo del AppBar fijo */}
        <Box
          sx={{
            width: "100%",
            maxWidth: "100%",
            padding: "10px 16px",
            backgroundColor: "#e6f7ff",
            position: "relative",
            zIndex: 2,
            boxSizing: "border-box",
            mt: "80px", // separa contenido del navbar fijo (misma altura del AppBar)
          }}
        >
          <BreadcrumbNav userType="paciente" />
        </Box>

        {/* Contenido principal de cada página / dashboard paciente */}
        <Box
          sx={{
            width: "100%",
            maxWidth: "100%",
            overflow: "hidden",
            paddingBottom: "20px",
            boxSizing: "border-box",
          }}
        >
          {children}
        </Box>
      </Box>

      <FooterPaciente />
    </>
  );
};

export default LayoutPaciente;
