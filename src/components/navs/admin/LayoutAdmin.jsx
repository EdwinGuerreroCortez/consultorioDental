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
          marginTop: "64px", // Altura del AppBar
          height: "calc(100% - 64px)", // Ocupa todo el espacio restante debajo del AppBar
          display: "flex",
          flexDirection: "column",
          backgroundColor: "#ffffff",
          padding: "16px",
          transition: "all 0.3s ease-in-out",
          marginLeft: drawerOpen ? `${drawerWidth}px` : `${drawerCollapsedWidth}px`,
          width: drawerOpen ? `calc(100% - ${drawerWidth}px)` : `calc(100% - ${drawerCollapsedWidth}px)`,
        }}
      >
        <Box
          sx={{
            flexGrow: 1,
            width: "100%",
            maxWidth: "1800px", // Ancho máximo del contenido incrementado
            margin: "0 auto", // Centrado horizontal
            backgroundColor: "#ffffff",
            borderRadius: "16px",
            padding: "40px",
            overflowY: "auto",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {children}
        </Box>
      </Box>
    </>
  );
};

export default LayoutAdmin;
