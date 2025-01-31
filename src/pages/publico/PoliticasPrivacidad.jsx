import React from "react";
import { Typography, Box } from "@mui/material";

const PoliticasPrivacidad = () => {
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Políticas de Privacidad
      </Typography>
      <Typography variant="body1" paragraph>
        En Consultorio Dental, tu privacidad es importante para nosotros. Esta política explica cómo recopilamos, usamos y protegemos tu información personal.
      </Typography>
      <Typography variant="body1" paragraph>
        Solo recolectamos información necesaria para la prestación de nuestros servicios, como nombre, correo electrónico y detalles de las citas. No compartiremos tu información con terceros sin tu consentimiento.
      </Typography>
      <Typography variant="body1" paragraph>
        Si tienes preguntas sobre nuestras políticas, contáctanos a través de nuestro formulario en la página de ayuda.
      </Typography>
    </Box>
  );
};

export default PoliticasPrivacidad;
