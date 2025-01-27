import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { createTheme, ThemeProvider } from '@mui/material/styles';

//Publicos 
import LayoutPublico from "./components/publico/LayoutPublico";
import BienvenidaPublica from "./pages/publico/BienvenidaPublica";
import PoliticasPrivacidad from "./pages/publico/PoliticasPrivacidad";
import DeslindeLegal from "./pages/publico/DeslindeLegal";

import TerminosCondiciones from "./pages/publico/TerminosCondiciones";
import Login from "./pages/publico/Login";
import Registro from "./pages/publico/Registro";
import CatalogoServicios from "./pages/publico/CatalogoServicios";


import '@fontsource/geologica'; // Importa la fuente

const theme = createTheme({
  typography: {
    fontFamily: "'Geologica', sans-serif",
  },
});


const App = () => {
  return (
    <ThemeProvider theme={theme}>
    <Router>
      <Routes>
        
        {/* Rutas públicas */}
        <Route
          path="/"
          element={
            <LayoutPublico>
              <BienvenidaPublica />
            </LayoutPublico>
          }
        />
        <Route
          path="/politicas-privacidad"
          element={
            <LayoutPublico>
              <PoliticasPrivacidad />
            </LayoutPublico>
          }
        />
        <Route
          path="/deslinde-legal"
          element={
            <LayoutPublico>
              <DeslindeLegal />
            </LayoutPublico>
          }
        />
        <Route
          path="/terminos-condiciones"
          element={
            <LayoutPublico>
              <TerminosCondiciones />
            </LayoutPublico>
          }
        />
        <Route
          path="/login"
          element={
            <LayoutPublico>
              <Login />
            </LayoutPublico>
          }
        />
        <Route
          path="/registro"
          element={
            <LayoutPublico>
              <Registro />
            </LayoutPublico>
          }
        />
         <Route
          path="/catalogo-servicios"
          element={
            <LayoutPublico>
              <CatalogoServicios />
            </LayoutPublico>
          }
        />
      </Routes>
    </Router>
    </ThemeProvider>
  );
};

export default App;
