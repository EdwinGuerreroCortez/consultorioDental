import React from "react";
import { Box, Typography, Link } from "@mui/material";

const FooterPaciente = () => {
  return (
    <Box
      sx={{
        backgroundColor: "#f5f5f5",
        textAlign: "center",
        padding: "15px 0",
        bottom: 0,
        width: "100%",
        boxShadow: "0 -2px 5px rgba(0, 0, 0, 0.1)",
      }}
    >
      <Typography
        variant="body2"
        color="textSecondary"
        sx={{ marginBottom: "8px" }}
      >
        © 2025 Consultorio Dental. Todos los derechos reservados.
      </Typography>

      <Box>
        <Link
          href="/politicas-privacidad"
          color="inherit"
          underline="hover"
          sx={{ marginRight: "10px" }}
        >
          Políticas de Privacidad
        </Link>

        <Link
          href="/terminos-condiciones"
          color="inherit"
          underline="hover"
          sx={{ marginRight: "10px" }}
        >
          Términos y Condiciones
        </Link>

        <Link
          href="/paciente/mision-vision"
          color="inherit"
          underline="hover"
          sx={{ marginRight: "10px" }}
        >
          Misión y Visión
        </Link>

        <Link
          href="https://drive.google.com/file/d/1d2XZ7qsKoQcjTBqBPn3yC1iwXYIhwLuq/view?usp=drive_link"
          target="_blank"
          rel="noopener noreferrer"
          color="inherit"
          underline="hover"
        >
          Mapa de Sitio
        </Link>
      </Box>

      {/* 🆕 Versión del sistema */}
      <Typography
        variant="caption"
        sx={{ display: "block", marginTop: "10px", fontSize: "0.75rem", opacity: 0.6 }}
      >
        Versión del sistema: <strong>1.0.0</strong>
      </Typography>
    </Box>
  );
};

export default FooterPaciente;
