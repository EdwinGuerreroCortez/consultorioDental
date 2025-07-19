import React, { useState, useEffect } from "react";
import {
  Box,
  TextField,
  Snackbar,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Tooltip
} from "@mui/material";
import { Edit, Save } from "@mui/icons-material";

const primaryColor = "#006d77";
const secondaryColor = "#78c1c8";
const accentColor = "#e8f4f8";

const Configuraciones = () => {
  const [config, setConfig] = useState({ max_intentos: "", tiempo_bloqueo: "" });
  const [editMode, setEditMode] = useState(false);
  const [alerta, setAlerta] = useState({ open: false, message: "", severity: "info" });
  const [csrfToken, setCsrfToken] = useState(null);

  useEffect(() => {
    const fetchToken = async () => {
      try {
        const res = await fetch("http://localhost:4000/api/get-csrf-token", {
          credentials: "include",
        });
        const data = await res.json();
        setCsrfToken(data.csrfToken);
      } catch {
        setAlerta({ open: true, message: "Error al obtener token CSRF", severity: "error" });
      }
    };
    fetchToken();
  }, []);

  const fetchConfiguracion = async () => {
    try {
      const res = await fetch("http://localhost:4000/api/configuraciones/obtener");
      const data = await res.json();
      setConfig(data);
    } catch {
      setAlerta({ open: true, message: "Error al cargar configuraciones", severity: "error" });
    }
  };

  useEffect(() => {
    fetchConfiguracion();
  }, []);

  const handleChange = (e) => {
    setConfig({ ...config, [e.target.name]: e.target.value });
  };

  const handleGuardar = async () => {
    try {
      const res = await fetch("http://localhost:4000/api/configuraciones/actualizar", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "X-XSRF-TOKEN": csrfToken,
        },
        credentials: "include",
        body: JSON.stringify(config),
      });

      const data = await res.json();
      if (res.ok) {
        setAlerta({ open: true, message: data.mensaje, severity: "success" });
        setEditMode(false);
        fetchConfiguracion();
      } else {
        setAlerta({ open: true, message: data.mensaje, severity: "error" });
      }
    } catch {
      setAlerta({ open: true, message: "Error al actualizar", severity: "error" });
    }
  };

  return (
    <Box sx={{ maxWidth: "1600px", margin: "4rem auto", padding: "0 1.5rem" }}>
      <TableContainer
        component={Paper}
        sx={{
          borderRadius: "16px",
          border: `1px solid ${accentColor}`,
          backgroundColor: "transparent",
        }}
      >
        <Table>
          <TableHead
            sx={{ background: `linear-gradient(90deg, ${primaryColor} 0%, ${secondaryColor} 100%)` }}
          >
            <TableRow>
              <TableCell sx={{ color: "#fff", fontWeight: 600 }}>Parámetro</TableCell>
              <TableCell sx={{ color: "#fff", fontWeight: 600 }}>Valor</TableCell>
              <TableCell sx={{ color: "#fff", fontWeight: 600, textAlign: "center" }}>Acción</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              <TableCell>Máx. Intentos Fallidos</TableCell>
              <TableCell>
                {editMode ? (
                  <TextField
                    name="max_intentos"
                    value={config.max_intentos}
                    onChange={handleChange}
                    size="small"
                  />
                ) : (
                  config.max_intentos
                )}
              </TableCell>
              <TableCell rowSpan={2} sx={{ textAlign: "center", verticalAlign: "middle" }}>
                {editMode ? (
                  <Tooltip title="Guardar cambios">
                    <IconButton onClick={handleGuardar}><Save /></IconButton>
                  </Tooltip>
                ) : (
                  <Tooltip title="Editar configuración">
                    <IconButton onClick={() => setEditMode(true)}><Edit /></IconButton>
                  </Tooltip>
                )}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Tiempo de Bloqueo (segundos)</TableCell>
              <TableCell>
                {editMode ? (
                  <TextField
                    name="tiempo_bloqueo"
                    value={config.tiempo_bloqueo}
                    onChange={handleChange}
                    size="small"
                  />
                ) : (
                  config.tiempo_bloqueo
                )}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>

      <Snackbar
        open={alerta.open}
        autoHideDuration={6000}
        onClose={() => setAlerta({ ...alerta, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          severity={alerta.severity}
          onClose={() => setAlerta({ ...alerta, open: false })}
        >
          {alerta.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Configuraciones;
