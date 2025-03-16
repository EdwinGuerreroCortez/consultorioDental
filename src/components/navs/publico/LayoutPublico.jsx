import React from "react";
import NavbarPublico from "../publico/NavbarPublico";
import FooterPublico from "../publico/FooterPublico";
import BreadcrumbNav from "../../Breadcrumbs";

import { Box, CssBaseline } from "@mui/material";

const LayoutPublico = ({ children }) => {
  return (
    <>
      <CssBaseline />
      <NavbarPublico />

      {/* Breadcrumb */}
      <Box
        sx={{
          padding: "0px",
          backgroundColor: "#e6f7ff",
          zIndex: 2,
          position: "relative",
        }}
      >
        <BreadcrumbNav userType="publico" />
      </Box>

      {/* Contenido principal */}
      {children}

      <FooterPublico />
    </>
  );
};

export default LayoutPublico;
