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
        padding: "20px 0",
        width: "100%",
        margin: 0,
        boxSizing: "border-box",
      }}
    >
      <Typography variant="body2" sx={{ fontWeight: "bold", marginBottom: "10px" }}>
        © 2025 Consultorio Dental. Todos los derechos reservados.
      </Typography>
      
      <Box>
        <Link
          href="/politicas-privacidad"
          underline="hover"
          sx={{
            color: "#ffffff",
            marginRight: "15px",
            textDecoration: "none",
          }}
        >
          Políticas de Privacidad
        </Link>
        <Link
          href="/terminos-condiciones"
          underline="hover"
          sx={{
            color: "#ffffff",
            marginRight: "15px",
            textDecoration: "none",
          }}
        >
          Términos y Condiciones
        </Link>
        <Link
          href="/deslinde-legal"
          underline="hover"
          sx={{
            color: "#ffffff",
            marginRight: "15px",
            textDecoration: "none",
          }}
        >
          Deslinde Legal
        </Link>
        <Link
          href="https://drive.google.com/file/d/16dwTH7sIyEYtWbRuis-I94y4imh4SZb-/view?usp=drive_link"
          target="_blank"  // Abre el enlace en una nueva pestaña
          rel="noopener noreferrer"  // Mejora la seguridad
          underline="hover"
          sx={{
            color: "#ffffff",
            textDecoration: "none",
          }}
        >
          Mapa de Sitio
        </Link>
      </Box>
    </Box>
  );
};

export default FooterPublico;
