import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import { verificarAutenticacion } from "../../utils/auth";
import { Box, Typography, CircularProgress, Snackbar, Alert } from "@mui/material";

const PagosExito = () => {
  const [estado, setEstado] = useState("cargando");
  const [alerta, setAlerta] = useState({ open: false, message: "", severity: "success" });
  const [csrfToken, setCsrfToken] = useState(null);
  const [usuarioId, setUsuarioId] = useState(null);
  const location = useLocation();

  // Crear instancia de Axios reutilizable
  const axiosInstance = useMemo(() => axios.create({
    baseURL: "http://localhost:4000/api",
    withCredentials: true,
  }), []);

  // Obtener token CSRF con reintento
  const obtenerCsrf = useCallback(async (reintentos = 3, delay = 1000) => {
    for (let intento = 1; intento <= reintentos; intento++) {
      try {
        const response = await fetch("http://localhost:4000/api/get-csrf-token", {
          credentials: "include",
        });
        if (!response.ok) {
          throw new Error(`Error ${response.status}: ${response.statusText}`);
        }
        const data = await response.json();
        if (!data.csrfToken) {
          throw new Error("Token CSRF no recibido");
        }
        setCsrfToken(data.csrfToken);
        return;
      } catch (error) {
        console.error(`Intento ${intento} - Error al obtener CSRF token:`, error);
        if (intento === reintentos) {
          setAlerta({
            open: true,
            message: "No se pudo obtener el token CSRF tras varios intentos. Por favor, intenta de nuevo más tarde.",
            severity: "error",
          });
          setEstado("error");
        } else {
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }
  }, []);

  // Obtener usuario autenticado
  const obtenerUsuario = useCallback(async () => {
    try {
      const usuario = await verificarAutenticacion();
      if (usuario) {
        setUsuarioId(usuario.id);
      } else {
        setAlerta({
          open: true,
          message: "No se pudo obtener la sesión. Por favor, inicia sesión nuevamente.",
          severity: "error",
        });
        setEstado("error");
      }
    } catch (error) {
      console.error("Error al verificar la autenticación:", error);
      setAlerta({
        open: true,
        message: "Error al verificar la autenticación. Intenta nuevamente.",
        severity: "error",
      });
      setEstado("error");
    }
  }, []);

  // Procesar pago
  const procesarPago = useCallback(async (pagosIds) => {
    if (!csrfToken || !usuarioId) {
      setAlerta({
        open: true,
        message: "No se puede procesar el pago: token CSRF o usuario no disponible.",
        severity: "error",
      });
      setEstado("error");
      return;
    }

    try {
      const response = await axiosInstance.post(
        "/pagos/pagar-por-ids",
        { pagosIds },
        {
          headers: { "X-XSRF-TOKEN": csrfToken },
        }
      );
      setEstado("ok");
      setAlerta({
        open: true,
        message: response.data.mensaje || "Tus pagos fueron procesados correctamente.",
        severity: "success",
      });
    } catch (error) {
      console.error("Error al confirmar el pago:", error);
      let message = "Error al confirmar el pago. Por favor, contacta al administrador.";
      if (error.response?.status === 403) {
        message = "Acceso denegado. Verifica tu sesión o el token CSRF.";
        obtenerCsrf(); // Reintentar obtener el token CSRF
      }
      setAlerta({
        open: true,
        message,
        severity: "error",
      });
      setEstado("error");
    }
  }, [csrfToken, usuarioId, axiosInstance, obtenerCsrf]);

  useEffect(() => {
    // Obtener token CSRF y usuario al montar el componente
    obtenerCsrf();
    obtenerUsuario();
  }, [obtenerCsrf, obtenerUsuario]);

  useEffect(() => {
    // Procesar los pagos una vez que se tengan el token CSRF y el usuario
    const params = new URLSearchParams(location.search);
    const ids = params.get("ids");

    if (!ids) {
      setAlerta({
        open: true,
        message: "No se recibieron IDs de pagos válidos.",
        severity: "error",
      });
      setEstado("error");
      return;
    }

    if (csrfToken && usuarioId) {
      const pagosIds = ids.split(",").map(id => parseInt(id));
      procesarPago(pagosIds);
    }
  }, [location, csrfToken, usuarioId, procesarPago]);

  return (
    <Box sx={{ textAlign: "center", mt: 8 }}>
      {estado === "cargando" && <CircularProgress />}
      {estado === "ok" && (
        <>
          <Typography variant="h5" color="primary">✅ ¡Pago exitoso!</Typography>
          <Typography variant="body1">Tus pagos fueron procesados correctamente.</Typography>
        </>
      )}
      {estado === "error" && (
        <>
          <Typography variant="h5" color="error">❌ Error al confirmar el pago</Typography>
          <Typography variant="body2">Por favor, contacta al administrador.</Typography>
        </>
      )}
      <Snackbar
        open={alerta.open}
        autoHideDuration={6000}
        onClose={() => setAlerta({ ...alerta, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setAlerta({ ...alerta, open: false })}
          severity={alerta.severity}
          sx={{ width: "100%" }}
        >
          {alerta.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default PagosExito;