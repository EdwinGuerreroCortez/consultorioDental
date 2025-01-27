import React from "react";
import { Alert, AlertTitle } from "@mui/material";

// Alerta de éxito
export const SuccessAlert = ({ title = "Éxito", message = "Operación completada correctamente" }) => {
  return (
    <Alert severity="success">
      <AlertTitle>{title}</AlertTitle>
      {message}
    </Alert>
  );
};

// Alerta de error
export const ErrorAlert = ({ title = "Error", message = "Ocurrió un problema. Inténtalo de nuevo." }) => {
  return (
    <Alert severity="error">
      <AlertTitle>{title}</AlertTitle>
      {message}
    </Alert>
  );
};

// Alerta de advertencia
export const WarningAlert = ({ title = "Advertencia", message = "Ten cuidado con esta acción." }) => {
  return (
    <Alert severity="warning">
      <AlertTitle>{title}</AlertTitle>
      {message}
    </Alert>
  );
};

// Alerta de información
export const InfoAlert = ({ title = "Información", message = "Aquí tienes más detalles sobre esto." }) => {
  return (
    <Alert severity="info">
      <AlertTitle>{title}</AlertTitle>
      {message}
    </Alert>
  );
};

// Exportar como un objeto para acceso conjunto
const Alerts = {
  SuccessAlert,
  ErrorAlert,
  WarningAlert,
  InfoAlert,
};

export default Alerts;
