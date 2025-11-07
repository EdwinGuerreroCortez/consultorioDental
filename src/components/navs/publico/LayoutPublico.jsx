import React, { useEffect } from "react";
import { Outlet } from "react-router-dom";       // 👈 NUEVO
import NavbarPublico from "../publico/NavbarPublico";
import FooterPublico from "../publico/FooterPublico";
import BreadcrumbNav from "../../Breadcrumbs";
import { Box, CssBaseline } from "@mui/material";

const LayoutPublico = () => {
  useEffect(() => {
    const precargarEndpoints = async () => {
      const urls = [
        "https://backenddent.onrender.com/api/politicas/listar",       // Políticas de privacidad
        "https://backenddent.onrender.com/api/tratamientos",           // Catálogo de servicios
        "https://backenddent.onrender.com/api/mision-vision/vigentes", // Misión y visión
      ];

      for (const url of urls) {
        try {
          await fetch(url, {
            credentials: "include",
          });
        } catch (err) {
          console.warn("No se pudo precargar:", url);
        }
      }
    };

    precargarEndpoints();
  }, []);

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
            mt: "80px", // debajo del AppBar fijo
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
          <Outlet />   {/* 👈 Aquí se pintan tus páginas públicas, visualmente igual a {children} */}
        </Box>
      </Box>

      <FooterPublico />
    </>
  );
};

export default LayoutPublico;
