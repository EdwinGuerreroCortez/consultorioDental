import React from "react";
import NavbarPublico from "../publico/NavbarPublico";
import FooterPublico from "../publico/FooterPublico";
import BreadcrumbNav from "../../Breadcrumbs";
import { Box, CssBaseline } from "@mui/material";

const LayoutPublico = ({ children }) => {
  return (
    <>
      <CssBaseline />
      <NavbarPublico />

      {/* Contenedor principal */}
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
        {/* Migas de pan pegadas al AppBar */}
        <Box
          sx={{
            width: "100%",
            maxWidth: "100%",
            padding: "10px 16px",
            backgroundColor: "#e6f7ff",
            position: "relative",
            zIndex: 2,
            boxSizing: "border-box",
            mt: "80px", // Ajuste para que las migajas estén justo debajo del AppBar fijo
          }}
        >
          <BreadcrumbNav userType="publico" />
        </Box>

        {/* Contenido principal */}
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

      <FooterPublico />
    </>
  );
};

export default LayoutPublico;