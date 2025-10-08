import React from "react";
import { Box, Typography, Link } from "@mui/material";

const FooterPublico = () => {
  return (
    <Box
      component="footer"
      sx={{
        backgroundColor: "#0077b6",
        color: "#ffffff",
        textAlign: "center",
        padding: "20px 10px",
        width: "100%",
        margin: 0,
        overflowX: "hidden",
        boxSizing: "border-box",
      }}
    >
      {/* Texto principal */}
      <Typography
        variant="body2"
        sx={{
          fontWeight: "bold",
          mb: 1.5,
          fontSize: { xs: "0.9rem", sm: "1rem" },
        }}
      >
        © 2025 Consultorio Dental. Todos los derechos reservados.
      </Typography>

      {/* Enlaces del footer */}
      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          gap: "12px",
          mb: 1.5,
        }}
      >
        <Link
          href="/politicas-privacidad"
          underline="hover"
          sx={{
            color: "#ffffff",
            textDecoration: "none",
            fontSize: { xs: "0.85rem", sm: "0.9rem" },
            "&:hover": { textDecoration: "underline" },
          }}
        >
          Políticas de Privacidad
        </Link>

        <Link
          href="/terminos-condiciones"
          underline="hover"
          sx={{
            color: "#ffffff",
            textDecoration: "none",
            fontSize: { xs: "0.85rem", sm: "0.9rem" },
            "&:hover": { textDecoration: "underline" },
          }}
        >
          Términos y Condiciones
        </Link>

        <Link
          href="/deslinde-legal"
          underline="hover"
          sx={{
            color: "#ffffff",
            textDecoration: "none",
            fontSize: { xs: "0.85rem", sm: "0.9rem" },
            "&:hover": { textDecoration: "underline" },
          }}
        >
          Deslinde Legal
        </Link>

        <Link
          href="/mision-vision"
          underline="hover"
          sx={{
            color: "#ffffff",
            textDecoration: "none",
            fontSize: { xs: "0.85rem", sm: "0.9rem" },
            "&:hover": { textDecoration: "underline" },
          }}
        >
          Misión y Visión
        </Link>

        <Link
          href="https://drive.google.com/file/d/1d2XZ7qsKoQcjTBqBPn3yC1iwXYIhwLuq/view?usp=drive_link"
          target="_blank"
          rel="noopener noreferrer"
          underline="hover"
          sx={{
            color: "#ffffff",
            textDecoration: "none",
            fontSize: { xs: "0.85rem", sm: "0.9rem" },
            "&:hover": { textDecoration: "underline" },
          }}
        >
          Mapa de Sitio
        </Link>
      </Box>

      {/* Versión del sistema */}
      <Typography
        variant="caption"
        sx={{
          display: "block",
          mt: 1,
          opacity: 0.8,
          fontSize: { xs: "0.7rem", sm: "0.75rem" },
        }}
      >
        Versión del sistema: <strong>1.0.0</strong>
      </Typography>
    </Box>
  );
};

export default FooterPublico;
