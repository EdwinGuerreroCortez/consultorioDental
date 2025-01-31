import React, { useState } from "react";
import NavbarAdmin from "./NavbarAdmin";
import { Box, CssBaseline } from "@mui/material";

const drawerWidth = 280;
const drawerCollapsedWidth = 72;

const LayoutAdmin = ({ children }) => {
  const [drawerOpen, setDrawerOpen] = useState(true);

  const handleDrawerToggle = () => {
    setDrawerOpen(!drawerOpen);
  };

  return (
    <>
      <CssBaseline />
      <NavbarAdmin drawerOpen={drawerOpen} onToggleDrawer={handleDrawerToggle} />
      <Box
        sx={{
          marginTop: "64px",
          height: "calc(100vh - 64px)", // Ajuste para ocupar toda la pantalla debajo del AppBar
          display: "flex",
          flexDirection: "column",
          backgroundColor: "#ffffff",
          marginLeft: drawerOpen ? `${drawerWidth}px` : `${drawerCollapsedWidth}px`,
          transition: "all 0.3s ease-in-out",
          overflow: "hidden", // Evita que los hijos desborden el contenedor principal
        }}
      >
        <Box
          sx={{
            flexGrow: 1,
            width: "100%",
            maxWidth: "1800px",
            margin: "0 auto",
            backgroundColor: "#ffffff",
            borderRadius: "16px",
            padding: "40px",
            overflowY: "auto", // Agregar desplazamiento vertical
            display: "flex",
            flexDirection: "column",
            height: "100%", // Asegura que el contenedor crezca con el padre
          }}
        >
          {children}
        </Box>
      </Box>
    </>
  );
};

export default LayoutAdmin;
