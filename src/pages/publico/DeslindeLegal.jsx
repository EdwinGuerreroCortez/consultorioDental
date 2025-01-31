import React from "react";
import { Typography, Box } from "@mui/material";

const DeslindeLegal = () => {
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Deslinde Legal
      </Typography>
      <Typography variant="body1" paragraph>
        Este documento establece el deslinde legal de Consultorio Dental. Todo el contenido mostrado en este sitio es informativo y no sustituye la consulta directa con un profesional de salud.
      </Typography>
      <Typography variant="body1" paragraph>
        Consultorio Dental no se hace responsable por el mal uso de la información proporcionada en este sitio. Al acceder, aceptas nuestras condiciones y políticas.
      </Typography>
    </Box>
  );
};

export default DeslindeLegal;
