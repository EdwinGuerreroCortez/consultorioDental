import React from "react";
import NavbarPaciente from "./NavbarPaciente";
import FooterPaciente from "./FooterPaciente";
import { Box } from "@mui/material";

const LayoutPaciente = ({ children }) => {
  return (
    <Box>
      <NavbarPaciente />
      <Box sx={{ marginTop: "64px", padding: "20px", minHeight: "calc(100vh - 128px)" }}>
        {children}
      </Box>
      <FooterPaciente />
    </Box>
  );
};

export default LayoutPaciente;
