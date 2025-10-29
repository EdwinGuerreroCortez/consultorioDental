import React, { useEffect, useState } from "react";
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Tooltip,
  Typography,
  Snackbar,
  Alert,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
  Tabs,
  Tab,
  TextField,
} from "@mui/material";
import { CheckCircle, Cancel, Edit } from "@mui/icons-material";
import { motion } from "framer-motion";
import {
  validarDescripcion,
  validarDuracion,
  validarPrecio,
  validarCitasRequeridas,
} from "../../utils/validations";

// Paleta de colores
const primaryColor = "#006d77";
const secondaryColor = "#78c1c8";
const accentColor = "#e0f7fa";
const bgGradient = "linear-gradient(90deg, #006d77 0%, #78c1c8 100%)";
const textColor = "#03445e";

const MisCatalogos = () => {
  const [tratamientos, setTratamientos] = useState([]);
  const [alerta, setAlerta] = useState({ open: false, message: "", severity: "success" });
  const [tratamientoSeleccionado, setTratamientoSeleccionado] = useState(null);
  const [dialogoEdicionAbierto, setDialogoEdicionAbierto] = useState(false);
  const [loading, setLoading] = useState(true);
  const [errores, setErrores] = useState({});
  const [csrfToken, setCsrfToken] = useState(null);
  const [tabIndex, setTabIndex] = useState(0); // 0: Todos, 1: Con citas, 2: Requieren evaluación

  // Obtener el token CSRF
  useEffect(() => {
    const obtenerTokenCSRF = async () => {
      try {
        const response = await fetch("https://backenddent.onrender.com/api/get-csrf-token", {
          credentials: "include",
        });
        const data = await response.json();
        setCsrfToken(data.csrfToken);
      } catch (error) {
        console.error("Error obteniendo el token CSRF:", error);
        setAlerta({ open: true, message: "Error al obtener el token CSRF", severity: "error" });
      }
    };
    obtenerTokenCSRF();
  }, []);

  // Obtener tratamientos
  const obtenerTratamientos = async () => {
    if (!csrfToken) return;
    try {
      const response = await fetch("https://backenddent.onrender.com/api/tratamientos", {
        headers: {
          "X-XSRF-TOKEN": csrfToken,
        },
        credentials: "include",
      });
      const data = await response.json();
      setTratamientos(data);
      setLoading(false);
    } catch (error) {
      console.error("Error al obtener tratamientos:", error);
      setAlerta({ open: true, message: "Error al cargar los tratamientos", severity: "error" });
      setLoading(false);
    }
  };

  // Actualizar estado de un tratamiento
  const actualizarEstado = async (id, estadoActual) => {
    if (!csrfToken) return;
    try {
      const nuevoEstado = estadoActual === 1 ? 0 : 1;
      await fetch(`https://backenddent.onrender.com/api/tratamientos/${id}/estado`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "X-XSRF-TOKEN": csrfToken,
        },
        credentials: "include",
        body: JSON.stringify({ estado: nuevoEstado }),
      });

      setTratamientos((prev) =>
        prev.map((tratamiento) =>
          tratamiento.id === id ? { ...tratamiento, estado: nuevoEstado } : tratamiento
        )
      );

      setAlerta({
        open: true,
        message: `Tratamiento ${nuevoEstado === 1 ? "activado" : "desactivado"} con éxito`,
        severity: "success",
      });
    } catch (error) {
      console.error("Error al actualizar estado:", error);
      setAlerta({ open: true, message: "Error al cambiar el estado", severity: "error" });
    }
  };

  // Manejo del diálogo de edición
  const abrirDialogoEdicion = (tratamiento) => {
    setTratamientoSeleccionado(tratamiento);
    setErrores({});
    setDialogoEdicionAbierto(true);
  };

  const cerrarDialogoEdicion = () => {
    setDialogoEdicionAbierto(false);
  };

  const manejarCambio = (e) => {
    const { name, value } = e.target;
    setTratamientoSeleccionado((prev) => ({ ...prev, [name]: value }));
    validarCampo(name, value);
  };

  const validarCampo = (campo, valor) => {
    let error = "";
    switch (campo) {
      case "descripcion":
        error = validarDescripcion(valor);
        break;
      case "duracion_minutos":
        error = validarDuracion(valor);
        break;
      case "precio":
        error = validarPrecio(valor);
        break;
      case "citas_requeridas":
        error = validarCitasRequeridas(valor);
        break;
      default:
        break;
    }
    setErrores((prev) => ({ ...prev, [campo]: error }));
  };

  const guardarCambios = async () => {
    if (!csrfToken) return;
    const camposValidos = Object.values(errores).every((error) => error === "");
    if (!camposValidos) {
      setAlerta({ open: true, message: "Corrige los errores antes de guardar.", severity: "error" });
      return;
    }

    try {
      await fetch(`https://backenddent.onrender.com/api/tratamientos/${tratamientoSeleccionado.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "X-XSRF-TOKEN": csrfToken,
        },
        credentials: "include",
        body: JSON.stringify(tratamientoSeleccionado),
      });

      setTratamientos((prev) =>
        prev.map((tratamiento) =>
          tratamiento.id === tratamientoSeleccionado.id ? tratamientoSeleccionado : tratamiento
        )
      );

      setAlerta({ open: true, message: "Tratamiento actualizado con éxito", severity: "success" });
      cerrarDialogoEdicion();
    } catch (error) {
      console.error("Error al actualizar tratamiento:", error);
      setAlerta({ open: true, message: "Error al actualizar el tratamiento", severity: "error" });
    }
  };

  useEffect(() => {
    if (csrfToken) {
      obtenerTratamientos();
    }
  }, [csrfToken]);

  const cerrarAlerta = () => setAlerta({ ...alerta, open: false });

  const tratamientosConCitas = tratamientos.filter((t) => t.requiere_evaluacion === 0);
  const tratamientosRequierenEvaluacion = tratamientos.filter((t) => t.requiere_evaluacion === 1);

  const cellStyle = {
    textAlign: "center",
    color: textColor,
    fontFamily: "'Poppins', sans-serif",
    padding: "12px",
    fontSize: "0.9rem",
    whiteSpace: "normal",
    wordWrap: "break-word",
  };

  const handleTabChange = (event, newValue) => {
    setTabIndex(newValue);
  };

  return (
    <Box
      sx={{
        padding: "2rem",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        width: "100%",
        maxWidth: "1400px",
        mx: "auto",
        fontFamily: "'Poppins', sans-serif",
        backgroundColor: "#f9fbfd",
      }}
    >
      <Typography
        variant="h3"
        component={motion.div}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        sx={{
          marginBottom: "2rem",
          fontWeight: "bold",
          color: primaryColor,
          textAlign: "center",
          textShadow: "2px 2px 4px rgba(0, 109, 119, 0.1)",
          fontFamily: "'Poppins', sans-serif",
        }}
      >
        Catálogo de Procesos
      </Typography>

      {/* Tabs para filtrar */}
      <Tabs
        value={tabIndex}
        onChange={handleTabChange}
        centered
        sx={{
          mb: "1rem",
          "& .MuiTab-root": {
            fontFamily: "'Poppins', sans-serif",
            textTransform: "none",
            fontSize: "1rem",
            "&.Mui-selected": { color: primaryColor },
          },
          "& .MuiTabs-indicator": { backgroundColor: primaryColor },
        }}
      >
        <Tab label="Todos" />
        <Tab label="Con Citas Requeridas" />
        <Tab label="Requieren Evaluación" />
      </Tabs>

      <Box sx={{ flexGrow: 1, width: "100%" }}>
        {loading ? (
          <Typography
            align="center"
            sx={{ marginTop: "2rem", color: textColor, fontFamily: "'Poppins', sans-serif" }}
          >
            Cargando tratamientos...
          </Typography>
        ) : (
          <>
            {(tabIndex === 0 || tabIndex === 1) && (
              <TableContainer
                component={Paper}
                sx={{
                  borderRadius: "16px",
                  boxShadow: "0 8px 24px rgba(0, 0, 0, 0.08)",
                  overflow: "hidden",
                  mt: 3,
                  maxWidth: "1400px",
                  mx: "auto",
                  border: `1px solid ${secondaryColor}`,
                }}
              >
                <Table sx={{ tableLayout: "auto" }}>
                  <TableHead sx={{ background: bgGradient }}>
                    <TableRow>
                      {[
                        "Nombre",
                        "Descripción",
                        "Duración (min)",
                        "Precio",
                        "Citas requeridas",
                        "Estado",
                        "Acción",
                      ].map((header) => (
                        <TableCell
                          key={header}
                          sx={{
                            color: "#e0f7fa",
                            fontWeight: 700,
                            textAlign: "center",
                            fontFamily: "'Poppins', sans-serif",
                            borderBottom: "none",
                            padding: "12px",
                            fontSize: "0.95rem",
                            whiteSpace: "normal",
                          }}
                        >
                          {header}
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {tratamientosConCitas.length === 0 && tabIndex === 1 ? (
                      <TableRow>
                        <TableCell colSpan={7} sx={{ ...cellStyle, color: "#999" }}>
                          No hay tratamientos con citas requeridas.
                        </TableCell>
                      </TableRow>
                    ) : (
                      tratamientosConCitas.map((tratamiento) => (
                        <TableRow
                          key={tratamiento.id}
                          sx={{
                            "&:hover": {
                              backgroundColor: accentColor,
                              transition: "background-color 0.3s ease",
                              boxShadow: "inset 0 2px 10px rgba(0, 0, 0, 0.05)",
                            },
                            borderBottom: "1px solid #eef3f7",
                          }}
                        >
                          <TableCell sx={cellStyle}>{tratamiento.nombre}</TableCell>
                          <TableCell sx={cellStyle}>
                            {tratamiento.descripcion.length > 50
                              ? `${tratamiento.descripcion.substring(0, 50)}...`
                              : tratamiento.descripcion}
                            <Button
                              size="small"
                              onClick={() => abrirDialogoEdicion(tratamiento)}
                              sx={{
                                textTransform: "none",
                                color: primaryColor,
                                fontFamily: "'Poppins', sans-serif",
                              }}
                            >
                              Ver más
                            </Button>
                          </TableCell>
                          <TableCell sx={cellStyle}>{tratamiento.duracion_minutos}</TableCell>
                          <TableCell sx={cellStyle}>${tratamiento.precio}</TableCell>
                          <TableCell sx={cellStyle}>{tratamiento.citas_requeridas || "-"}</TableCell>
                          <TableCell sx={cellStyle}>{tratamiento.estado === 1 ? "Activo" : "Inactivo"}</TableCell>
                          <TableCell sx={cellStyle}>
                            <Box sx={{ display: "flex", flexDirection: "row", gap: "0.5rem" }}>
                              <Tooltip title="Editar tratamiento">
                                <IconButton
                                  color="primary"
                                  onClick={() => abrirDialogoEdicion(tratamiento)}
                                  sx={{ "&:hover": { color: secondaryColor } }}
                                >
                                  <Edit />
                                </IconButton>
                              </Tooltip>
                              <Tooltip
                                title={
                                  tratamiento.estado === 1 ? "Desactivar tratamiento" : "Activar tratamiento"
                                }
                              >
                                <IconButton
                                  color={tratamiento.estado === 1 ? "error" : "success"}
                                  onClick={() => actualizarEstado(tratamiento.id, tratamiento.estado)}
                                  sx={{ "&:hover": { color: secondaryColor } }}
                                >
                                  {tratamiento.estado === 1 ? <Cancel /> : <CheckCircle />}
                                </IconButton>
                              </Tooltip>
                            </Box>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            )}

            {(tabIndex === 0 || tabIndex === 2) && (
              <TableContainer
                component={Paper}
                sx={{
                  borderRadius: "16px",
                  boxShadow: "0 8px 24px rgba(0, 0, 0, 0.08)",
                  overflow: "hidden",
                  mt: tabIndex === 0 ? 3 : 0,
                  maxWidth: "1400px",
                  mx: "auto",
                  border: `1px solid ${secondaryColor}`,
                }}
              >
                <Table sx={{ tableLayout: "auto" }}>
                  <TableHead sx={{ background: bgGradient }}>
                    <TableRow>
                      {[
                        "Nombre",
                        "Descripción",
                        "Duración (min)",
                        "Precio",
                        "Citas requeridas",
                        "Estado",
                        "Acción",
                      ].map((header) => (
                        <TableCell
                          key={header}
                          sx={{
                            color: "#e0f7fa",
                            fontWeight: 700,
                            textAlign: "center",
                            fontFamily: "'Poppins', sans-serif",
                            borderBottom: "none",
                            padding: "12px",
                            fontSize: "0.95rem",
                            whiteSpace: "normal",
                          }}
                        >
                          {header}
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {tratamientosRequierenEvaluacion.length === 0 && tabIndex === 2 ? (
                      <TableRow>
                        <TableCell colSpan={7} sx={{ ...cellStyle, color: "#999" }}>
                          No hay tratamientos que requieran evaluación.
                        </TableCell>
                      </TableRow>
                    ) : (
                      tratamientosRequierenEvaluacion.map((tratamiento) => (
                        <TableRow
                          key={tratamiento.id}
                          sx={{
                            "&:hover": {
                              backgroundColor: accentColor,
                              transition: "background-color 0.3s ease",
                              boxShadow: "inset 0 2px 10px rgba(0, 0, 0, 0.05)",
                            },
                            borderBottom: "1px solid #eef3f7",
                          }}
                        >
                          <TableCell sx={cellStyle}>{tratamiento.nombre}</TableCell>
                          <TableCell sx={cellStyle}>
                            {tratamiento.descripcion.length > 50
                              ? `${tratamiento.descripcion.substring(0, 50)}...`
                              : tratamiento.descripcion}
                            <Button
                              size="small"
                              onClick={() => abrirDialogoEdicion(tratamiento)}
                              sx={{
                                textTransform: "none",
                                color: primaryColor,
                                fontFamily: "'Poppins', sans-serif",
                              }}
                            >
                              Ver más
                            </Button>
                          </TableCell>
                          <TableCell sx={cellStyle}>{tratamiento.duracion_minutos}</TableCell>
                          <TableCell sx={cellStyle}>${tratamiento.precio}</TableCell>
                          <TableCell sx={cellStyle}>{tratamiento.citas_requeridas || "-"}</TableCell>
                          <TableCell sx={cellStyle}>{tratamiento.estado === 1 ? "Activo" : "Inactivo"}</TableCell>
                          <TableCell sx={cellStyle}>
                            <Box sx={{ display: "flex", flexDirection: "row", gap: "0.5rem" }}>
                              <Tooltip title="Editar tratamiento">
                                <IconButton
                                  color="primary"
                                  onClick={() => abrirDialogoEdicion(tratamiento)}
                                  sx={{ "&:hover": { color: secondaryColor } }}
                                >
                                  <Edit />
                                </IconButton>
                              </Tooltip>
                              <Tooltip
                                title={
                                  tratamiento.estado === 1 ? "Desactivar tratamiento" : "Activar tratamiento"
                                }
                              >
                                <IconButton
                                  color={tratamiento.estado === 1 ? "error" : "success"}
                                  onClick={() => actualizarEstado(tratamiento.id, tratamiento.estado)}
                                  sx={{ "&:hover": { color: secondaryColor } }}
                                >
                                  {tratamiento.estado === 1 ? <Cancel /> : <CheckCircle />}
                                </IconButton>
                              </Tooltip>
                            </Box>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </>
        )}
      </Box>

      {/* Diálogo de edición */}
      <Dialog
        open={dialogoEdicionAbierto}
        onClose={cerrarDialogoEdicion}
        fullWidth
        maxWidth="sm"
        PaperComponent={motion.div}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        sx={{
          "& .MuiDialog-paper": {
            borderRadius: "12px",
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
            backgroundColor: "#f5f9fa",
          },
        }}
      >
        <DialogTitle
          sx={{
            background: bgGradient,
            color: "#e0f7fa",
            fontFamily: "'Poppins', sans-serif",
            fontWeight: 600,
            borderRadius: "12px 12px 0 0",
            padding: "16px",
            fontSize: "1.1rem",
          }}
        >
          Editar Tratamiento
        </DialogTitle>
        <DialogContent sx={{ padding: "2rem 1rem 1rem" }}>
          {tratamientoSeleccionado && (
            <Box sx={{ display: "flex", flexDirection: "column", gap: "0.6rem", padding: "2rem 0.5rem 0.5rem" }}>
              <TextField
                label="Descripción"
                name="descripcion"
                value={tratamientoSeleccionado.descripcion || ""}
                onChange={manejarCambio}
                fullWidth
                multiline
                rows={4}
                error={!!errores.descripcion}
                helperText={errores.descripcion}
                variant="outlined"
                InputLabelProps={{
                  shrink: true,
                  sx: {
                    color: textColor,
                    fontFamily: "'Poppins', sans-serif",
                    fontWeight: 400,
                    fontSize: "0.9rem",
                    transform: "translate(14px, -6px) scale(0.75)",
                  },
                }}
                inputProps={{
                  style: {
                    textAlign: "left",
                    padding: "0.8rem",
                    lineHeight: "1.5",
                  },
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "6px",
                    backgroundColor: "#ffffff",
                    borderColor: "#ddd",
                    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.05)",
                    "&:hover fieldset": { borderColor: secondaryColor },
                    "&.Mui-focused fieldset": { borderColor: primaryColor },
                  },
                  "& .MuiInputLabel-root": {
                    color: textColor,
                    fontFamily: "'Poppins', sans-serif",
                    fontWeight: 400,
                    fontSize: "0.9rem",
                    "&.Mui-focused": { color: primaryColor },
                  },
                  "& .MuiInputBase-input": {
                    fontFamily: "'Poppins', sans-serif",
                    color: textColor,
                    fontSize: "0.9rem",
                  },
                }}
              />
              <TextField
                label="Duración (minutos)"
                name="duracion_minutos"
                type="number"
                value={tratamientoSeleccionado.duracion_minutos || ""}
                onChange={manejarCambio}
                fullWidth
                error={!!errores.duracion_minutos}
                helperText={errores.duracion_minutos}
                variant="outlined"
                InputLabelProps={{
                  shrink: true,
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "6px",
                    backgroundColor: "#ffffff",
                    borderColor: "#ddd",
                    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.05)",
                    "&:hover fieldset": { borderColor: secondaryColor },
                    "&.Mui-focused fieldset": { borderColor: primaryColor },
                  },
                  "& .MuiInputLabel-root": {
                    color: textColor,
                    fontFamily: "'Poppins', sans-serif",
                    fontWeight: 400,
                    fontSize: "0.9rem",
                    "&.Mui-focused": { color: primaryColor },
                  },
                  "& .MuiInputBase-input": {
                    fontFamily: "'Poppins', sans-serif",
                    color: textColor,
                    padding: "0.6rem",
                    fontSize: "0.9rem",
                  },
                }}
              />
              {tratamientoSeleccionado.requiere_evaluacion === 0 && (
                <>
                  <TextField
                    label="Precio"
                    name="precio"
                    type="number"
                    value={tratamientoSeleccionado.precio || ""}
                    onChange={manejarCambio}
                    fullWidth
                    error={!!errores.precio}
                    helperText={errores.precio}
                    variant="outlined"
                    InputLabelProps={{
                      shrink: true,
                    }}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: "6px",
                        backgroundColor: "#ffffff",
                        borderColor: "#ddd",
                        boxShadow: "0 2px 4px rgba(0, 0, 0, 0.05)",
                        "&:hover fieldset": { borderColor: secondaryColor },
                        "&.Mui-focused fieldset": { borderColor: primaryColor },
                      },
                      "& .MuiInputLabel-root": {
                        color: textColor,
                        fontFamily: "'Poppins', sans-serif",
                        fontWeight: 400,
                        fontSize: "0.9rem",
                        "&.Mui-focused": { color: primaryColor },
                      },
                      "& .MuiInputBase-input": {
                        fontFamily: "'Poppins', sans-serif",
                        color: textColor,
                        padding: "0.6rem",
                        fontSize: "0.9rem",
                      },
                    }}
                  />
                  <TextField
                    label="Citas requeridas"
                    name="citas_requeridas"
                    type="number"
                    value={tratamientoSeleccionado.citas_requeridas || ""}
                    onChange={manejarCambio}
                    fullWidth
                    error={!!errores.citas_requeridas}
                    helperText={errores.citas_requeridas}
                    variant="outlined"
                    InputLabelProps={{
                      shrink: true,
                    }}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: "6px",
                        backgroundColor: "#ffffff",
                        borderColor: "#ddd",
                        boxShadow: "0 2px 4px rgba(0, 0, 0, 0.05)",
                        "&:hover fieldset": { borderColor: secondaryColor },
                        "&.Mui-focused fieldset": { borderColor: primaryColor },
                      },
                      "& .MuiInputLabel-root": {
                        color: textColor,
                        fontFamily: "'Poppins', sans-serif",
                        fontWeight: 400,
                        fontSize: "0.9rem",
                        "&.Mui-focused": { color: primaryColor },
                      },
                      "& .MuiInputBase-input": {
                        fontFamily: "'Poppins', sans-serif",
                        color: textColor,
                        padding: "0.6rem",
                        fontSize: "0.9rem",
                      },
                    }}
                  />
                </>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ padding: "1rem", backgroundColor: "#f5f9fa" }}>
          <Button
            onClick={cerrarDialogoEdicion}
            variant="outlined"
            sx={{
              borderColor: secondaryColor,
              color: secondaryColor,
              borderRadius: "8px",
              padding: "0.4rem 1.2rem",
              fontFamily: "'Poppins', sans-serif",
              fontWeight: 500,
              fontSize: "0.9rem",
              textTransform: "none",
            }}
          >
            Cancelar
          </Button>
          <Button
            onClick={guardarCambios}
            variant="contained"
            sx={{
              backgroundColor: primaryColor,
              color: "#fff",
              borderRadius: "8px",
              padding: "0.4rem 1.2rem",
              fontFamily: "'Poppins', sans-serif",
              fontWeight: 500,
              fontSize: "0.9rem",
              textTransform: "none",
              "&:hover": { backgroundColor: "#004d57" },
            }}
          >
            Guardar
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={alerta.open}
        autoHideDuration={6000}
        onClose={cerrarAlerta}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
      >
        <Alert
          onClose={cerrarAlerta}
          severity={alerta.severity}
          sx={{ width: "100%", fontFamily: "'Poppins', sans-serif" }}
        >
          {alerta.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default MisCatalogos;