import React, { useState } from "react";
import NavbarAdmin from "./NavbarAdmin";
import BreadcrumbNav from '../../Breadcrumbs';
import { Box, CssBaseline } from "@mui/material";

const drawerWidth = 280;
const drawerCollapsedWidth = 72;

const LayoutAdmin = ({ children }) => {
  const [drawerOpen, setDrawerOpen] = useState(true);

  const handleDrawerToggle = () => setDrawerOpen(!drawerOpen);

  return (
    <>
      <CssBaseline />
      <NavbarAdmin drawerOpen={drawerOpen} onToggleDrawer={handleDrawerToggle} />

      <Box
        sx={{
          marginTop: "64px",
          marginLeft: drawerOpen ? `${drawerWidth}px` : `${drawerCollapsedWidth}px`,
          transition: "all 0.3s ease-in-out",
          backgroundColor: "#fffff",
          height: "calc(100vh - 64px)",
          overflow: "hidden",
        }}
      >
        <Box sx={{ padding: "20px", backgroundColor: "#ffffff" }}>
          {/* Aquí pasamos userType para que solo cargue las rutas del admin */}
          <BreadcrumbNav userType="admin" />
        </Box>

        <Box
          sx={{
            flexGrow: 1,
            padding: "40px",
            margin: "0 auto",
            width: "100%",
            maxWidth: "1800px",
            backgroundColor: "#ffffff",
            borderRadius: "16px",
            overflowY: "auto",
            height: "100%",
          }}
        >
          {children}
        </Box>
      </Box>
    </>
  );
};

export default LayoutAdmin;
