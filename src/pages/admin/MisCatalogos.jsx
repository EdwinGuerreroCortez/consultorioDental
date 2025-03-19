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
  Card,
  CardContent,
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

// Paleta de colores ajustada para coincidir con la captura
const primaryColor = "#006d77"; // Verde azulado para "Guardar"
const secondaryColor = "#78c1c8"; // Cian claro para "Cancelar"
const accentColor = "#e8f4f8";
const bgGradient = "linear-gradient(135deg, #e8f4f8 0%, #ffffff 100%)";
const textColor = "#1a3c40";

const MisCatalogos = () => {
  const [tratamientos, setTratamientos] = useState([]);
  const [alerta, setAlerta] = useState({ open: false, message: "", severity: "success" });
  const [tratamientoSeleccionado, setTratamientoSeleccionado] = useState(null);
  const [dialogoEdicionAbierto, setDialogoEdicionAbierto] = useState(false);
  const [loading, setLoading] = useState(true);
  const [errores, setErrores] = useState({});

  const obtenerTratamientos = async () => {
    try {
      const response = await fetch("http://localhost:4000/api/tratamientos");
      const data = await response.json();
      setTratamientos(data);
      setLoading(false);
    } catch (error) {
      console.error("Error al obtener tratamientos:", error);
      setAlerta({ open: true, message: "Error al cargar los tratamientos", severity: "error" });
      setLoading(false);
    }
  };

  const actualizarEstado = async (id, estadoActual) => {
    const csrfToken = obtenerTokenCSRF();
    try {
      const nuevoEstado = estadoActual === 1 ? 0 : 1;
      await fetch(`http://localhost:4000/api/tratamientos/${id}/estado`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", "X-XSRF-TOKEN": csrfToken },
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

  const obtenerTokenCSRF = () => {
    return document.cookie
      .split("; ")
      .find((row) => row.startsWith("XSRF-TOKEN="))
      ?.split("=")[1];
  };

  const guardarCambios = async () => {
    const camposValidos = Object.values(errores).every((error) => error === "");
    if (!camposValidos) {
      setAlerta({ open: true, message: "Corrige los errores antes de guardar.", severity: "error" });
      return;
    }
    const csrfToken = obtenerTokenCSRF();
    try {
      await fetch(`http://localhost:4000/api/tratamientos/${tratamientoSeleccionado.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", "X-XSRF-TOKEN": csrfToken },
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
    obtenerTratamientos();
  }, []);

  const cerrarAlerta = () => setAlerta({ ...alerta, open: false });

  const tratamientosConCitas = tratamientos.filter((t) => t.requiere_evaluacion === 0);
  const tratamientosRequierenEvaluacion = tratamientos.filter((t) => t.requiere_evaluacion === 1);

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.2, duration: 0.5, ease: "easeOut" },
    }),
  };

  const titleVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, delay: 0.2 } },
  };

  return (
    <Box
      sx={{
        maxWidth: "lg",
        margin: "2rem auto",
        padding: "2rem",
        background: bgGradient,
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        borderRadius: "24px",
        boxShadow: "0 10px 40px rgba(0, 109, 119, 0.1)",
        border: `1px solid ${accentColor}`,
        transition: "all 0.3s ease-in-out",
        "&:hover": { boxShadow: "0 15px 50px rgba(0, 109, 119, 0.15)" },
      }}
    >
      <Typography
        variant="h3"
        component={motion.div}
        initial="hidden"
        animate="visible"
        variants={titleVariants}
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

      <Box sx={{ flexGrow: 1 }}>
        {loading ? (
          <Typography
            align="center"
            sx={{ marginTop: "2rem", color: textColor, fontFamily: "'Poppins', sans-serif" }}
          >
            Cargando tratamientos...
          </Typography>
        ) : (
          [
            { titulo: "Tratamientos con citas requeridas", data: tratamientosConCitas },
            { titulo: "Tratamientos que requieren evaluación", data: tratamientosRequierenEvaluacion },
          ].map(({ titulo, data }, index) => (
            <Card
              key={titulo}
              component={motion.div}
              custom={index}
              initial="hidden"
              animate="visible"
              variants={cardVariants}
              sx={{
                marginBottom: "2rem",
                boxShadow: 6,
                borderRadius: "16px",
                overflow: "hidden",
                backgroundColor: "#fff",
              }}
            >
              <CardContent>
                <Typography
                  variant="h5"
                  sx={{
                    marginBottom: "1.5rem",
                    fontWeight: "bold",
                    color: primaryColor,
                    borderBottom: `3px solid ${accentColor}`,
                    paddingBottom: "0.5rem",
                    fontFamily: "'Poppins', sans-serif",
                  }}
                >
                  {titulo}
                </Typography>

                <TableContainer
                  component={Paper}
                  sx={{
                    borderRadius: "12px",
                    boxShadow: 3,
                    minHeight: "300px",
                    "& .MuiTableCell-root": {
                      fontFamily: "'Poppins', sans-serif",
                      color: textColor,
                    },
                  }}
                >
                  <Table>
                    <TableHead sx={{ backgroundColor: accentColor }}>
                      <TableRow>
                        <TableCell><strong>Nombre</strong></TableCell>
                        <TableCell><strong>Descripción</strong></TableCell>
                        <TableCell><strong>Duración (min)</strong></TableCell>
                        <TableCell><strong>Precio</strong></TableCell>
                        <TableCell><strong>Citas requeridas</strong></TableCell>
                        <TableCell><strong>Estado</strong></TableCell>
                        <TableCell><strong>Acción</strong></TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {data.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} align="center">
                            <Typography sx={{ color: textColor, fontFamily: "'Poppins', sans-serif" }}>
                              No hay tratamientos disponibles.
                            </Typography>
                          </TableCell>
                        </TableRow>
                      ) : (
                        data.map((tratamiento) => (
                          <TableRow
                            key={tratamiento.id}
                            sx={{ "&:hover": { backgroundColor: "#eef3ff" } }}
                          >
                            <TableCell>{tratamiento.nombre}</TableCell>
                            <TableCell>
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
                            <TableCell>{tratamiento.duracion_minutos}</TableCell>
                            <TableCell>${tratamiento.precio}</TableCell>
                            <TableCell>{tratamiento.citas_requeridas || "-"}</TableCell>
                            <TableCell>{tratamiento.estado === 1 ? "Activo" : "Inactivo"}</TableCell>
                            <TableCell>
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
                                    tratamiento.estado === 1
                                      ? "Desactivar tratamiento"
                                      : "Activar tratamiento"
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
              </CardContent>
            </Card>
          ))
        )}
      </Box>

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
            borderRadius: "10px",
            boxShadow: "0 5px 15px rgba(0, 0, 0, 0.1)",
            backgroundColor: "#f5f9fa",
          },
        }}
      >
        <DialogTitle sx={{ backgroundColor: primaryColor, color: "#fff", padding: "1rem" }}>
          <Typography variant="h6" sx={{ fontWeight: "bold", fontFamily: "'Poppins', sans-serif" }}>
            Editar Tratamiento
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ padding: "2rem 1rem 1rem" }}>
          {tratamientoSeleccionado && (
            <Box sx={{ display: "flex", flexDirection: "column", gap: "0.6rem",padding:"2rem 0.5rem 0.5rem" }}>
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
              borderRadius: "20px",
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
              borderRadius: "20px",
              padding: "0.4rem 1.2rem",
              fontFamily: "'Poppins', sans-serif",
              fontWeight: 500,
              fontSize: "0.9rem",
              textTransform: "none",
              "&:hover": {
                backgroundColor: "#005566",
              },
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
        <Alert onClose={cerrarAlerta} severity={alerta.severity} sx={{ width: "100%" }}>
          {alerta.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default MisCatalogos;