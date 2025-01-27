import React from "react";
import { Typography, Box } from "@mui/material";

const TerminosCondiciones = () => {
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Términos y Condiciones
      </Typography>
      <Typography variant="body1" paragraph>
        Bienvenido a Consultorio Dental. Al usar este sitio, aceptas los siguientes términos y condiciones.
      </Typography>
      <Typography variant="body1" paragraph>
        Los servicios ofrecidos están sujetos a disponibilidad y pueden modificarse en cualquier momento. Es tu responsabilidad asegurarte de que la información proporcionada durante el registro sea veraz y completa.
      </Typography>
      <Typography variant="body1" paragraph>
        El incumplimiento de estos términos puede resultar en la suspensión de tu acceso al sistema.
      </Typography>
    </Box>
  );
};

export default TerminosCondiciones;
