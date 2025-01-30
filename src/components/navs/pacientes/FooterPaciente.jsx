import React from "react";
import { Box, Typography, Link } from "@mui/material";

const FooterPaciente = () => {
  return (
    <Box
      sx={{
        backgroundColor: "#f5f5f5",
        textAlign: "center",
        padding: "10px 0",
        position: "fixed",
        bottom: 0,
        width: "100%",
      }}
    >
      <Typography variant="body2" color="textSecondary">
        © 2025 Consultorio Dental. Todos los derechos reservados.
      </Typography>
      <Box>
        <Link href="/politicas-privacidad" color="inherit" underline="hover">
          Políticas de Privacidad
        </Link>{" "}
        |{" "}
        <Link href="/terminos-condiciones" color="inherit" underline="hover">
          Términos y Condiciones
        </Link>
      </Box>
    </Box>
  );
};

export default FooterPaciente;
