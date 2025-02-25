import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { createTheme, ThemeProvider } from '@mui/material/styles';
import RutaProtegida from './components/RutaProtegida';

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
import AgendarCita from "./pages/pacientes/AgendarCita";

//Admin
import LayoutAdmin from "./components/navs/admin/LayoutAdmin";
import BienvenidaAdmin from "./pages/admin/BienvenidaAdmin";
import CrearServicioOdontologia from "./pages/admin/CatalogoServicios";
import MisCatalogos from "./pages/admin/MisCatalogos";

import TratamientosEnCurso from "./pages/admin/ProcesosCurso";
import TratamientosPendientes from "./pages/admin/TratamientosPendientes";
import CitasAgendadas from "./pages/pacientes/CitasAgendadas";
import ProximasCitas from "./pages/admin/ProximasCitas";

import EvaluarCitasPendientes from "./pages/admin/EvaluarCitasPendientes";
import AgendarCitaAdmin from "./pages/admin/AgendarCitaAdmin";

import TratamientosActivos from "./pages/pacientes/TratamientosActivos";
//Errores
import Error404 from "./components/Errors/Error404";
import Error400 from "./components/Errors/Error400";
import Error500 from "./components/Errors/Error500";

//Cargas
import Loader from "./components/Loader";

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
        <Loader>
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
                <RutaProtegida tiposPermitidos={['paciente']}>
                  <LayoutPaciente>
                    <Inicio />
                  </LayoutPaciente>
                </RutaProtegida>

              }
            />
            <Route
              path="/paciente/catalogo-servicios"
              element={
                <RutaProtegida tiposPermitidos={['paciente']}>
                  <LayoutPaciente>
                    <CatalogoServicios />
                  </LayoutPaciente>
                </RutaProtegida>

              }
            />
            <Route
              path="/paciente/catalogo-servicios/:hash"
              element={
                <RutaProtegida tiposPermitidos={['paciente']}>
                  <LayoutPaciente>
                    <DetalleServicio />
                  </LayoutPaciente>
                </RutaProtegida>
              }
            />
            <Route
              path="/agendar-cita"
              element={
                <RutaProtegida tiposPermitidos={['paciente']}>
                  <LayoutPaciente>
                    <AgendarCita />
                  </LayoutPaciente>
                </RutaProtegida>
              }
            />
            <Route
              path="/citas-agendadas"
              element={
                <RutaProtegida tiposPermitidos={['paciente']}>
                  <LayoutPaciente>
                    <CitasAgendadas />
                  </LayoutPaciente>
                </RutaProtegida>
              }
            />
            <Route
              path="/tratamientos-activos"
              element={
                <RutaProtegida tiposPermitidos={['paciente']}>
                  <LayoutPaciente>
                    <TratamientosActivos />
                  </LayoutPaciente>
                </RutaProtegida>
              }
            />



            {/* Rutas admin */}
            <Route
              path="/admin"
              element={
                <RutaProtegida tiposPermitidos={['admin']}>

                  <LayoutAdmin>
                    <BienvenidaAdmin />
                  </LayoutAdmin>
                </RutaProtegida>
              }
            />
            <Route
              path="/admin/catalogos-tratamientos"
              element={
                <RutaProtegida tiposPermitidos={['admin']}>

                  <LayoutAdmin>
                    <CrearServicioOdontologia />
                  </LayoutAdmin>
                </RutaProtegida>
              }
            />
            <Route
              path="/admin/mis-tratamientos"
              element={
                <RutaProtegida tiposPermitidos={['admin']}>

                  <LayoutAdmin>
                    <MisCatalogos />
                  </LayoutAdmin>
                </RutaProtegida>
              }
            />
            <Route
              path="/admin/citas-ver"
              element={
                <RutaProtegida tiposPermitidos={['admin']}>

                  <LayoutAdmin>
                    <ProximasCitas />
                  </LayoutAdmin>
                </RutaProtegida>
              }
            />
            <Route
              path="/admin/procesos-en-curso"
              element={
                <RutaProtegida tiposPermitidos={['admin']}>

                  <LayoutAdmin>
                    <TratamientosEnCurso />
                  </LayoutAdmin>
                </RutaProtegida>
              }
            />
            <Route
              path="/admin/tratamientos-pendientes"
              element={
                <RutaProtegida tiposPermitidos={['admin']}>

                  <LayoutAdmin>
                    <TratamientosPendientes />
                  </LayoutAdmin>
                </RutaProtegida>
              }
            />
            <Route
              path="/admin/tratamientos/pendientes"
              element={
                <RutaProtegida tiposPermitidos={['admin']}>

                  <LayoutAdmin>
                    <TratamientosPendientes />
                  </LayoutAdmin>
                </RutaProtegida>
              }
            />
            <Route
              path="/admin/citas-registrar"
              element={
                <RutaProtegida tiposPermitidos={['admin']}>

                  <LayoutAdmin>
                    <AgendarCitaAdmin />
                  </LayoutAdmin>
                </RutaProtegida>
              }
            />
           <Route
              path="/admin/citas-evaluar"
              element={
                <RutaProtegida tiposPermitidos={['admin']}>

                  <LayoutAdmin>
                    <EvaluarCitasPendientes />
                  </LayoutAdmin>
                </RutaProtegida>
              }
            />

            {/*Rutas Errores*/}
            <Route path="/400" element={<Error400 />} /> {/* Ruta específica para error 400 */}
            <Route path="*" element={<Error404 />} /> {/* Ruta comodín para error 404 */}
            <Route path="/500" element={<Error500 />} /> {/* Ruta para el Error 500 */}
          </Routes>
        </Loader>
      </Router>
    </ThemeProvider>
  );
};

export default App;
