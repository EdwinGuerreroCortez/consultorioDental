import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { createTheme, ThemeProvider } from '@mui/material/styles';

//Publicos 
import LayoutPublico from "./components/navs/publico/LayoutPublico";
import BienvenidaPublica from "./pages/publico/BienvenidaPublica";
import PoliticasPrivacidad from "./pages/publico/PoliticasPrivacidad";
import DeslindeLegal from "./pages/publico/DeslindeLegal";

import TerminosCondiciones from "./pages/publico/TerminosCondiciones";
import Login from "./pages/publico/Login";
import Registro from "./pages/publico/Registro";
import CatalogoServicios from "./pages/publico/CatalogoServicios";

import CambioPassword from "./pages/publico/CambioPassword";


import RecuperarPassword from "./pages/publico/RecuperarPassword";
//Paciente
import LayoutPaciente from "./components/navs/pacientes/LayoutPaciente";
import Inicio from "./pages/pacientes/Inicio";
import DetalleServicio from "./pages/pacientes/DetalleServicio";

//Admin
import LayoutAdmin from "./components/navs/admin/LayoutAdmin";
import BienvenidaAdmin from "./pages/admin/BienvenidaAdmin";
import CrearServicioOdontologia from "./pages/admin/CatalogoServicios";
import MisCatalogos from "./pages/admin/MisCatalogos";

//Errores
import Error404 from "./components/Errors/Error404";
import Error400 from "./components/Errors/Error400";
import Error500 from "./components/Errors/Error500";

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
          <Route
            path="/recuperar-password"
            element={
              <LayoutPublico>
                <RecuperarPassword />
              </LayoutPublico>
            }
          />
          <Route
            path="/cambiar-password"
            element={
              <LayoutPublico>
                <CambioPassword />
              </LayoutPublico>
            }
          />
          <Route
            path="/catalogo-servicios/:hash"
            element={
              <LayoutPublico>
                <DetalleServicio />
              </LayoutPublico>
            }
          />
          {/* Rutas paciente */}

          <Route
            path="/paciente"
            element={
              <LayoutPaciente>
                <Inicio />
              </LayoutPaciente>
            }
          />
          <Route
            path="/paciente/catalogo-servicios"
            element={
              <LayoutPaciente>
                <CatalogoServicios />
              </LayoutPaciente>
            }
          />
          <Route
            path="/paciente/catalogo-servicios/:hash"
            element={
              <LayoutPaciente>
                <DetalleServicio />
              </LayoutPaciente>
            }
          />
          {/* Rutas admin */}
          <Route
            path="/admin"
            element={
              <LayoutAdmin>
                <BienvenidaAdmin />
              </LayoutAdmin>
            }
          />
          <Route
            path="/admin/catalogos-tratamientos"
            element={
              <LayoutAdmin>
                <CrearServicioOdontologia />
              </LayoutAdmin>
            }
          />
          <Route
            path="/admin/mis-tratamientos"
            element={
              <LayoutAdmin>
                <MisCatalogos />
              </LayoutAdmin>
            }
          />
          {/*Rutas Errores*/}
          <Route path="/400" element={<Error400 />} /> {/* Ruta específica para error 400 */}
          <Route path="*" element={<Error404 />} /> {/* Ruta comodín para error 404 */}
          <Route path="/500" element={<Error500 />} /> {/* Ruta para el Error 500 */}
        </Routes>




      </Router>
    </ThemeProvider>
  );
};

export default App;
