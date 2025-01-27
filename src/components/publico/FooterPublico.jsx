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
        padding: "10px 0",
        width: "100%", // Abarca todo el ancho
        margin: 0, // Elimina márgenes extras
        boxSizing: "border-box", // Asegura que el footer respete los bordes
      }}
    >
      <Typography variant="body2" sx={{ fontWeight: "bold", margin: 0 }}>
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
            textDecoration: "none",
          }}
        >
          Deslinde Legal
        </Link>
      </Box>
    </Box>
  );
};

export default FooterPublico;
