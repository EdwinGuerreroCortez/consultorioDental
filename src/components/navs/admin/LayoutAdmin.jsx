import React, { useState } from "react";
import NavbarAdmin from "./NavbarAdmin";
import BreadcrumbNav from "../../Breadcrumbs";
import { Box, CssBaseline, Typography } from "@mui/material";
import { motion } from "framer-motion";

const drawerWidth = 280;
const drawerCollapsedWidth = 72;

const LayoutAdmin = ({ children, title }) => {
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
          backgroundColor: "transparent",
          height: "auto", // 🔹 Se ajusta automáticamente al contenido
          display: "flex",
          flexDirection: "column",
          overflow: "visible", // 🔹 Permitir que el contenido crezca y se desplace normalmente
        }}
      >
        {/* 🔹 Header ahora es parte del contenido y se moverá con el scroll */}
        <Box
          sx={{
            width: "100%",
            backgroundColor: "#fff",
            padding: { xs: "12px 18px", md: "16px 24px" },
            borderBottom: "1px solid #ddd", // 🔹 Línea sutil para separación
            display: "flex",
            flexDirection: "column",
            gap: 1.5,
          }}
        >
          {/* 🔹 Título Animado */}
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          >
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                textAlign: "left",
                color: "#0056b3",
                letterSpacing: "0.6px",
                textTransform: "capitalize",
                fontSize: { xs: "1.3rem", md: "1.5rem" },
                lineHeight: 1.4,
              }}
            >
              {title}
            </Typography>
          </motion.div>

          {/* 🔹 Breadcrumbs con más separación */}
          <Box sx={{ width: "100%" }}>
            <BreadcrumbNav userType="admin" />
          </Box>
        </Box>


        {/* 🔹 Contenido Principal con scroll normal */}
        <Box
          sx={{
            flexGrow: 1,
            padding: "40px",
            margin: "0 auto",
            width: "100%",
            maxWidth: "1800px",
            backgroundColor: "transparent",
            borderRadius: "16px",
            height: "auto", // 🔹 Ajuste dinámico para adaptarse al contenido
          }}
        >
          {children}
        </Box>
      </Box>
    </>
  );
};

export default LayoutAdmin;
