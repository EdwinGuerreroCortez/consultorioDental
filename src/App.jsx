import React, { useState, useEffect, useRef } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { Snackbar, Alert } from "@mui/material"; // Eliminé Box y Typography
import RutaProtegida from './components/RutaProtegida';

// Públicos
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

// Paciente
import LayoutPaciente from "./components/navs/pacientes/LayoutPaciente";
import Inicio from "./pages/pacientes/Inicio";
import DetalleServicio from "./pages/pacientes/DetalleServicio";
import AgendarCita from "./pages/pacientes/AgendarCita";
import TratamientosActivos from "./pages/pacientes/TratamientosActivos";
import CitasAgendadas from "./pages/pacientes/CitasAgendadas";
import Perfil from "./pages/pacientes/Perfil";
import HistorialTratamientoPaciente from "./pages/pacientes/HistorialTratamientoPaciente";
import Pagos from "./pages/pacientes/Pagos";
import MisionVision from "./pages/pacientes/MisionVision";
import HistorialPagosPaciente from "./pages/pacientes/HistorialPagosPaciente";
import PagosExito from "./pages/pacientes/PagosExito";
import PagosCancelado from "./pages/pacientes/PagosCancelado";
// Admin
import LayoutAdmin from "./components/navs/admin/LayoutAdmin";
import BienvenidaAdmin from "./pages/admin/BienvenidaAdmin";
import CrearServicioOdontologia from "./pages/admin/CatalogoServicios";
import MisCatalogos from "./pages/admin/MisCatalogos";
import TratamientosEnCurso from "./pages/admin/ProcesosCurso";
import TratamientosPendientes from "./pages/admin/TratamientosPendientes";
import ProximasCitas from "./pages/admin/ProximasCitas";
import EvaluarCitasPendientes from "./pages/admin/EvaluarCitasPendientes";
import AgendarCitaAdmin from "./pages/admin/AgendarCitaAdmin";
import HistorialProcesosTerminados from "./pages/admin/HistorialProcesosTerminados";
import ListaPacientes from "./pages/admin/ListaPacientes";
import ListaPacientesSinCuenta from "./pages/admin/ListaPacientesSinCuenta";
import CrearPacienteSinCuenta from "./pages/admin/CrearPacienteSinCuenta";
import CrearMisionVision from "./pages/admin/ConfGeneral/CrearMisionVision";
import CrearPoliticas from "./pages/admin/ConfGeneral/CrearPoliticas";
import RegistroPago from "./pages/admin/pagos/RegistroPago";
import HistorialPagos from "./pages/admin/pagos/HistorialPagos";
import Valores from "./pages/admin/ConfGeneral/Valores";
import QuienesSomos from "./pages/admin/ConfGeneral/QuienesSomos";
import Configuraciones from "./pages/admin/ConfGeneral/Configuraciones";
import Prediccion from "./pages/admin/prediccion";
// Errores
import Error404 from "./components/Errors/Error404";
import Error400 from "./components/Errors/Error400";
import Error500 from "./components/Errors/Error500";

// Cargas
import Loader from "./components/Loader";

import '@fontsource/geologica'; // Importa la fuente

const theme = createTheme({
  typography: {
    fontFamily: "'Geologica', sans-serif",
  },
});

const INACTIVITY_LIMIT = 1800000; // 30 minutos (1800000 milisegundos)

// Componente para manejar la lógica de inactividad
const InactivityHandler = ({ children }) => {
  const [alertaExito, setAlertaExito] = useState(false);
  const [csrfToken, setCsrfToken] = useState(null);
  const inactivityTimeoutRef = useRef(null);
  const location = useLocation();

  // Obtener el token CSRF
  useEffect(() => {
    const obtenerTokenCSRF = async () => {
      try {
        const response = await fetch("http://localhost:4000/api/get-csrf-token", {
          credentials: "include",
        });
        const data = await response.json();
        setCsrfToken(data.csrfToken);
      } catch (error) {
        console.error("Error obteniendo el token CSRF:", error);
      }
    };
    obtenerTokenCSRF();
  }, []);

  // Lógica de inactividad
  useEffect(() => {
    const isProtectedRoute =
      location.pathname.startsWith("/paciente") ||
      location.pathname.startsWith("/admin") ||
      location.pathname === "/agendar-cita" ||
      location.pathname === "/citas-agendadas" ||
      location.pathname === "/tratamientos-activos" ||
      location.pathname === "/perfil" ||
      location.pathname === "/historial-tratamientos";

    const resetInactivityTimeout = () => {
      if (inactivityTimeoutRef.current) {
        clearTimeout(inactivityTimeoutRef.current);
      }
      inactivityTimeoutRef.current = setTimeout(cerrarSesion, INACTIVITY_LIMIT);
    };

    const handleUserActivity = () => {
      if (isProtectedRoute) {
        resetInactivityTimeout();
      }
    };

    if (isProtectedRoute) {
      window.addEventListener("mousemove", handleUserActivity);
      window.addEventListener("keypress", handleUserActivity);
      window.addEventListener("click", handleUserActivity);
      resetInactivityTimeout();
    }

    return () => {
      window.removeEventListener("mousemove", handleUserActivity);
      window.removeEventListener("keypress", handleUserActivity);
      window.removeEventListener("click", handleUserActivity);
      if (inactivityTimeoutRef.current) {
        clearTimeout(inactivityTimeoutRef.current);
      }
    };
  }, [location.pathname, csrfToken]);

  const cerrarSesion = async () => {
    if (!csrfToken) {
      console.error("Token CSRF no disponible");
      return;
    }

    try {
      const response = await fetch("http://localhost:4000/api/usuarios/logout", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "X-XSRF-TOKEN": csrfToken,
        },
      });
      if (response.ok) {
        localStorage.removeItem("token");
        localStorage.removeItem("tipoUsuario");
        setAlertaExito(true);
        setTimeout(() => {
          setAlertaExito(false);
          window.location.href = "/login";
        }, 2000);
      } else {
        console.error("Error al cerrar sesión:", await response.json());
      }
    } catch (error) {
      console.error("Error en la solicitud de cierre de sesión:", error);
    }
  };

  const isProtectedRoute =
    location.pathname.startsWith("/paciente") ||
    location.pathname.startsWith("/admin") ||
    location.pathname === "/agendar-cita" ||
    location.pathname === "/citas-agendadas" ||
    location.pathname === "/tratamientos-activos" ||
    location.pathname === "/perfil" ||
    location.pathname === "/historial-tratamientos";

  return (
    <>
      {children}
      <Snackbar
        open={alertaExito}
        autoHideDuration={2000}
        onClose={() => setAlertaExito(false)}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={() => setAlertaExito(false)}
          severity="warning"
          sx={{ width: "100%", fontSize: "1.1rem" }}
        >
          ¡Sesión cerrada por inactividad!
        </Alert>
      </Snackbar>
    </>
  );
};

// Componente principal con las rutas
const App = () => {
  return (
    <ThemeProvider theme={theme}>
      <Router>
        <InactivityHandler>
          <Loader>
            <Routes>
              {/**************************************************** Rutas públicas *******************************************************/}
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
              <Route path="/login" element={<Login />} />
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
              <Route
                path="/mision-vision"
                element={
                  <LayoutPublico>
                    <MisionVision />
                  </LayoutPublico>
                }
              />

              {/**************************************************** Rutas paciente *******************************************************/}
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
              <Route
                path="/perfil"
                element={
                  <RutaProtegida tiposPermitidos={['paciente']}>
                    <LayoutPaciente>
                      <Perfil />
                    </LayoutPaciente>
                  </RutaProtegida>
                }
              />
              <Route
                path="/historial-tratamientos"
                element={
                  <RutaProtegida tiposPermitidos={['paciente']}>
                    <LayoutPaciente>
                      <HistorialTratamientoPaciente />
                    </LayoutPaciente>
                  </RutaProtegida>
                }
              />
              <Route
                path="/Pagos"
                element={
                  <RutaProtegida tiposPermitidos={['paciente']}>
                    <LayoutPaciente>
                      <Pagos />
                    </LayoutPaciente>
                  </RutaProtegida>
                }
              />
              <Route
                path="/paciente/mision-vision"
                element={
                  <RutaProtegida tiposPermitidos={['paciente']}>
                    <LayoutPaciente>
                      <MisionVision />
                    </LayoutPaciente>
                  </RutaProtegida>
                }
              />
                            <Route
                path="/Historial-pagos"
                element={
                  <RutaProtegida tiposPermitidos={['paciente']}>
                    <LayoutPaciente>
                      <HistorialPagosPaciente />
                    </LayoutPaciente>
                  </RutaProtegida>
                }
              />

              <Route
                path="/pagos-exito" 
                element={
                  <RutaProtegida tiposPermitidos={['paciente']}>
                    <LayoutPaciente>
                      <PagosExito />
                    </LayoutPaciente>
                  </RutaProtegida>
                }
              />
              <Route
                path="/pagos-cancelado"
                element={
                  <RutaProtegida tiposPermitidos={['paciente']}>
                    <LayoutPaciente>
                      <PagosCancelado />
                    </LayoutPaciente>
                  </RutaProtegida>
                }
              />
              {/**************************************************** Rutas admin *******************************************************/}
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
                    <LayoutAdmin title={"Ver Citas Programadas"}>
                      <ProximasCitas />
                    </LayoutAdmin>
                  </RutaProtegida>
                }
              />
              <Route
                path="/admin/procesos-en-curso"
                element={
                  <RutaProtegida tiposPermitidos={['admin']}>
                    <LayoutAdmin title={"Procesos en Curso"}>
                      <TratamientosEnCurso />
                    </LayoutAdmin>
                  </RutaProtegida>
                }
              />
              <Route
                path="/admin/tratamientos-pendientes"
                element={
                  <RutaProtegida tiposPermitidos={['admin']}>
                    <LayoutAdmin title={"Procesos Pendientes De Valoración"}>
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
                    <LayoutAdmin title="Registrar Nuevas Citas">
                      <AgendarCitaAdmin />
                    </LayoutAdmin>
                  </RutaProtegida>
                }
              />
              <Route
                path="/admin/citas-valorar"
                element={
                  <RutaProtegida tiposPermitidos={['admin']}>
                    <LayoutAdmin title={"Valorar Citas Pendientes"}>
                      <EvaluarCitasPendientes />
                    </LayoutAdmin>
                  </RutaProtegida>
                }
              />
              <Route
                path="/admin/tratamientos-historial"
                element={
                  <RutaProtegida tiposPermitidos={['admin']}>
                    <LayoutAdmin title={"Historial Procesos Terminados"}>
                      <HistorialProcesosTerminados />
                    </LayoutAdmin>
                  </RutaProtegida>
                }
              />
              <Route
                path="/admin/pacientes/con-cuenta"
                element={
                  <RutaProtegida tiposPermitidos={['admin']}>
                    <LayoutAdmin title={"Lista de Pacientes"}>
                      <ListaPacientes />
                    </LayoutAdmin>
                  </RutaProtegida>
                }
              />
              <Route
                path="/admin/pacientes/sin-cuenta"
                element={
                  <RutaProtegida tiposPermitidos={['admin']}>
                    <LayoutAdmin title={"Lista de Pacientes Sin Cuenta"}>
                      <ListaPacientesSinCuenta />
                    </LayoutAdmin>
                  </RutaProtegida>
                }
              />
              <Route
                path="/admin/pacientes/registrar"
                element={
                  <RutaProtegida tiposPermitidos={['admin']}>
                    <LayoutAdmin title={"Registrar Pacientes"}>
                      <CrearPacienteSinCuenta />
                    </LayoutAdmin>
                  </RutaProtegida>
                }
              />
              <Route
                path="/admin/configuracion/mision-vision"
                element={
                  <RutaProtegida tiposPermitidos={['admin']}>
                    <LayoutAdmin title={"Misión y Visión"}>
                      <CrearMisionVision />
                    </LayoutAdmin>
                  </RutaProtegida>
                }
              />
              <Route
                path="/admin/configuracion/politicas"
                element={
                  <RutaProtegida tiposPermitidos={['admin']}>
                    <LayoutAdmin title={"Politicas de privacidad"}>
                      <CrearPoliticas />
                    </LayoutAdmin>
                  </RutaProtegida>
                }
              />
              <Route
                path="/admin/pagos-registrar"
                element={
                  <RutaProtegida tiposPermitidos={['admin']}>
                    <LayoutAdmin title={"Registro de Pagos"}>
                      <RegistroPago />
                    </LayoutAdmin>
                  </RutaProtegida>
                }
              />
               <Route
                path="/admin/pagos-historial"
                element={
                  <RutaProtegida tiposPermitidos={['admin']}>
                    <LayoutAdmin title={"Historial de Pagos"}>
                      <HistorialPagos />
                    </LayoutAdmin>
                  </RutaProtegida>
                }
              />
              <Route
                path="/admin/configuracion/valores"
                element={
                  <RutaProtegida tiposPermitidos={['admin']}>
                    <LayoutAdmin title={"Valores"}>
                      <Valores />
                    </LayoutAdmin>
                  </RutaProtegida>
                }
              />
              <Route
                path="/admin/configuracion/quienes-somos"
                element={
                  <RutaProtegida tiposPermitidos={['admin']}>
                    <LayoutAdmin title={"¿Quiénes Somos?"}>
                      <QuienesSomos />
                    </LayoutAdmin>
                  </RutaProtegida>
                }
              />
              <Route
                path="/admin/configuracion/sistema"
                element={
                  <RutaProtegida tiposPermitidos={['admin']}>
                    <LayoutAdmin title={"Configuración de Seguridad"}>
                      <Configuraciones />
                    </LayoutAdmin>
                  </RutaProtegida>
                }
              />
              <Route
                path="/admin/pacientes/prediccion"
                element={
                  <RutaProtegida tiposPermitidos={['admin']}>
                    <LayoutAdmin title={"Predicción "}>
                      <Prediccion />
                    </LayoutAdmin>
                  </RutaProtegida>
                }
              />


              {/* Rutas Errores */}
              <Route path="/400" element={<Error400 />} />
              <Route path="*" element={<Error404 />} />
              <Route path="/500" element={<Error500 />} />
            </Routes>
          </Loader>
        </InactivityHandler>
      </Router>
    </ThemeProvider>
  );
};

export default App;