import React from "react";
import { AppBar, Toolbar, Typography, Button } from "@mui/material";

const NavbarPaciente = () => {
  return (
    <AppBar position="fixed">
      <Toolbar>
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          Consultorio Dental
        </Typography>
        <Button color="inherit" href="/inicio">Inicio</Button>
        <Button color="inherit" href="/mis-citas">Mis Citas</Button>
        <Button color="inherit" href="/perfil">Perfil</Button>
        <Button color="inherit" href="/ayuda">Ayuda</Button>
      </Toolbar>
    </AppBar>
  );
};

export default NavbarPaciente;
