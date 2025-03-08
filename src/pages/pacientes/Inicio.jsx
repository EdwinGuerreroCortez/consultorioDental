import React, { useEffect, useState } from "react";
import { Box, Typography } from "@mui/material";
import Horarios from "../publico/Bienvenida/Horarios"; // Asegúrate de importar el componente
import Ubicacion from "../publico/Bienvenida/Ubicacion"; // Asegúrate de importar el componente

const Inicio = () => {
  const [nombreUsuario, setNombreUsuario] = useState("");

  useEffect(() => {
    const nombre = localStorage.getItem("nombreUsuario") || "Usuario";
    setNombreUsuario(nombre);
  }, []);

  return (
    <Box sx={{ textAlign: "center", marginTop: "50px" }}>
      <Typography variant="h4" sx={{ color: "#0077b6" }}>
        Bienvenido al consultorio dental, {nombreUsuario}
      </Typography>
      <Typography variant="h5" sx={{ color: "#0077b6" }}>
       ¿Cómo te encuentras hoy?
      </Typography>
      <Horarios />
      <Ubicacion />
    </Box>
  );
};

export default Inicio;
