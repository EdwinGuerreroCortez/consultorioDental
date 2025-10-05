import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  TextField,
  Box,
  Divider,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
} from "@mui/material";
import DientesImage from "../../assets/images/Dientes.jpg";

const HistorialMedico = ({ open, handleClose, paciente }) => {
  const [signosVitales, setSignosVitales] = useState("");
  const [bajoTratamiento, setBajoTratamiento] = useState("");
  const [tipoTratamiento, setTipoTratamiento] = useState("");
  const [medicamentos, setMedicamentos] = useState("");
  const [comentario, setComentario] = useState("");
  const [tieneHistorial, setTieneHistorial] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [historiales, setHistoriales] = useState([]);
  const [historialSeleccionado, setHistorialSeleccionado] = useState(null);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");
  const [csrfToken, setCsrfToken] = useState(null);

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
        setSnackbarMessage("Error al obtener el token CSRF");
        setSnackbarSeverity("error");
        setOpenSnackbar(true);
        setTimeout(() => setOpenSnackbar(false), 3000);
      }
    };
    obtenerTokenCSRF();
  }, []);

  const obtenerHistorial = async () => {
    if (!csrfToken) return;

    try {
      const response = await fetch(`http://localhost:4000/api/historial/usuario/${paciente.id}`, {
        headers: {
          "X-XSRF-TOKEN": csrfToken,
        },
        credentials: "include",
      });

      if (!response.ok) {
        console.warn(`No se encontró historial médico.`);
        setHistoriales([]);
        setHistorialSeleccionado(null);
        setTieneHistorial(false);
        setModoEdicion(false);
        limpiarCampos();
        return;
      }

      const data = await response.json();

      if (!Array.isArray(data) || data.length === 0) {
        console.warn(`No hay historiales médicos.`);
        setHistoriales([]);
        setHistorialSeleccionado(null);
        setTieneHistorial(false);
        setModoEdicion(false);
        limpiarCampos();
        return;
      }

      const historialOrdenado = data.sort((a, b) => new Date(b.fecha_registro) - new Date(a.fecha_registro));
      setHistoriales(historialOrdenado);
      setHistorialSeleccionado(historialOrdenado[0]);
      setTieneHistorial(true);
      setModoEdicion(false);
    } catch (error) {
      console.error("Error al obtener historial médico:", error);
    }
  };

  useEffect(() => {
    if (!open || !paciente || !paciente.id || !csrfToken) {
      return;
    }
    obtenerHistorial();
  }, [open, paciente, csrfToken]);

  const guardarHistorial = async () => {
    if (!paciente || !paciente.id) {
      console.error("Error: No hay paciente seleccionado.");
      return;
    }

    try {
      // Paso 1: Obtener la fecha y hora actual en Huejutla de Reyes
      const fechaActual = new Date();
      console.log("Fecha actual del sistema (sin ajustar):", fechaActual.toISOString());

      // Paso 2: Ajustar a la zona horaria de "America/Mexico_City"
      const fechaLocalString = fechaActual.toLocaleString("en-US", { timeZone: "America/Mexico_City" });
      const fechaLocal = new Date(fechaLocalString);
      console.log("Fecha ajustada a America/Mexico_City:", fechaLocal.toISOString());
      console.log("Fecha ajustada en formato legible (America/Mexico_City):", fechaLocal.toLocaleString("es-MX"));

      // Paso 3: Formatear la fecha en formato "YYYY-MM-DD HH:mm:ss" (hora local, sin zona horaria)
      const year = fechaLocal.getFullYear();
      const month = (fechaLocal.getMonth() + 1).toString().padStart(2, "0");
      const day = fechaLocal.getDate().toString().padStart(2, "0");
      const hours = fechaLocal.getHours().toString().padStart(2, "0");
      const minutes = fechaLocal.getMinutes().toString().padStart(2, "0");
      const seconds = fechaLocal.getSeconds().toString().padStart(2, "0");
      const fechaFormateadaLocal = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
      console.log("Fecha formateada para enviar (hora local, formato YYYY-MM-DD HH:mm:ss):", fechaFormateadaLocal);

      // Paso 4: Preparar los datos para enviar
      const historialData = {
        usuario_id: paciente.id,
        signos_vitales: signosVitales,
        bajo_tratamiento: bajoTratamiento === "Sí" ? 1 : 0,
        tipo_tratamiento: tipoTratamiento,
        medicamentos_recetados: medicamentos,
        observaciones_medicas: comentario,
        fecha_registro: fechaFormateadaLocal,
      };
      console.log("Datos completos que se envían al servidor:", historialData);

      // Paso 5: Enviar la solicitud al servidor
      const response = await fetch(`http://localhost:4000/api/historial/usuario/${paciente.id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-XSRF-TOKEN": csrfToken,
        },
        credentials: "include",
        body: JSON.stringify(historialData),
      });

      // Paso 6: Verificar la respuesta del servidor
      console.log("Estado de la respuesta del servidor:", response.status);
      const responseData = await response.json();
      console.log("Respuesta completa del servidor:", responseData);

      if (!response.ok) {
        throw new Error(`Error al guardar el historial: ${responseData.message || response.statusText}`);
      }

      console.log("Historial guardado correctamente");
      setSnackbarMessage("Historial guardado exitosamente");
      setSnackbarSeverity("success");
      setOpenSnackbar(true);
      setTimeout(() => setOpenSnackbar(false), 3000);

      await obtenerHistorial();
      setModoEdicion(false);
    } catch (error) {
      console.error("Error al guardar historial médico:", error);
      setSnackbarMessage(`Error al guardar historial médico: ${error.message}`);
      setSnackbarSeverity("error");
      setOpenSnackbar(true);
    }
  };

  const limpiarCampos = () => {
    setSignosVitales("");
    setBajoTratamiento("");
    setTipoTratamiento("");
    setMedicamentos("");
    setComentario("");
    setModoEdicion(true);
  };

  const manejarCambioHistorial = (event) => {
    const historialSeleccionado = historiales.find((h) => h.id === event.target.value);
    setHistorialSeleccionado(historialSeleccionado);
  };

  const formatearFecha = (fechaISO) => {
    if (!fechaISO) return "Sin fecha";

    // La fecha viene en formato "2025-03-23T21:40:39.000Z", pero sabemos que en realidad
    // representa la hora local de Huejutla (America/Mexico_City), no UTC.
    // Convertimos la fecha a una cadena y eliminamos el sufijo ".000Z" para tratarla como hora local.
    const fechaStr = fechaISO.replace(".000Z", "");
    const fecha = new Date(fechaStr);

    const dia = fecha.getDate();
    const mes = [
        "enero", "febrero", "marzo", "abril", "mayo", "junio",
        "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"
    ][fecha.getMonth()];
    const anio = fecha.getFullYear();
    let hora = fecha.getHours();
    const minutos = fecha.getMinutes().toString().padStart(2, "0");
    const ampm = hora >= 12 ? "PM" : "AM";
    hora = hora % 12 || 12;

    return `${dia} de ${mes} del ${anio} a las ${hora}:${minutos} ${ampm}`;
  };

  // Simplificación del valor para el Select de "Bajo Tratamiento"
  const valorBajoTratamiento = modoEdicion ? bajoTratamiento : (historialSeleccionado?.bajo_tratamiento ? "Sí" : "No");

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle
        sx={{
          background: "linear-gradient(90deg, #006d77 0%, #78c1c8 100%)",
          color: "#e0f7fa",
          textAlign: "center",
          fontWeight: "bold",
          fontFamily: "'Poppins', sans-serif",
        }}
      >
        {paciente
          ? `Historial Médico de ${paciente.nombre} ${paciente.apellido_paterno}`
          : "Cargando Historial Médico..."}
      </DialogTitle>
      <DialogContent
        dividers
        sx={{
          padding: "2rem",
          overflowY: "auto",
          "&::-webkit-scrollbar": {
            width: "8px",
          },
          "&::-webkit-scrollbar-thumb": {
            backgroundColor: "#006d77",
            borderRadius: "4px",
          },
          "&::-webkit-scrollbar-track": {
            backgroundColor: "#f1f1f1",
          },
        }}
      >
        {!paciente ? (
          <Typography variant="body1" align="center" sx={{ color: "#03445e", fontFamily: "'Poppins', sans-serif" }}>
            🔄 Cargando información del paciente...
          </Typography>
        ) : (
          <>
            <Box sx={{ marginBottom: "2rem" }}>
              {historiales.length > 0 && (
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel sx={{ color: "#03445e", fontFamily: "'Poppins', sans-serif" }}>
                    Seleccionar historial
                  </InputLabel>
                  <Select
                    value={historialSeleccionado?.id || ""}
                    onChange={manejarCambioHistorial}
                    sx={{
                      "& .MuiSelect-select": { fontFamily: "'Poppins', sans-serif" },
                      "& .MuiOutlinedInput-root": {
                        borderRadius: "12px",
                        "&:hover fieldset": { borderColor: "#78c1c8" },
                        "&.Mui-focused fieldset": { borderColor: "#006d77" },
                      },
                    }}
                  >
                    {historiales.map((historial) => (
                      <MenuItem
                        key={historial.id}
                        value={historial.id}
                        sx={{ fontFamily: "'Poppins', sans-serif" }}
                      >
                        {formatearFecha(historial.fecha_registro)}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}

              <Typography
                variant="h6"
                sx={{ fontWeight: "bold", color: "#006d77", fontFamily: "'Poppins', sans-serif" }}
              >
                Datos Personales
              </Typography>
              <Divider sx={{ marginBottom: "1.5rem", borderColor: "#78c1c8" }} />
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <TextField
                    label="Nombre"
                    fullWidth
                    variant="outlined"
                    value={paciente?.nombre || ""}
                    InputProps={{ readOnly: true }}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: "12px",
                        "&:hover fieldset": { borderColor: "#78c1c8" },
                        "&.Mui-focused fieldset": { borderColor: "#006d77" },
                      },
                      "& .MuiInputLabel-root": { color: "#03445e", fontFamily: "'Poppins', sans-serif" },
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    label="Apellido Paterno"
                    fullWidth
                    variant="outlined"
                    value={paciente?.apellido_paterno || ""}
                    InputProps={{ readOnly: true }}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: "12px",
                        "&:hover fieldset": { borderColor: "#78c1c8" },
                        "&.Mui-focused fieldset": { borderColor: "#006d77" },
                      },
                      "& .MuiInputLabel-root": { color: "#03445e", fontFamily: "'Poppins', sans-serif" },
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    label="Apellido Materno"
                    fullWidth
                    variant="outlined"
                    value={paciente?.apellido_materno || ""}
                    InputProps={{ readOnly: true }}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: "12px",
                        "&:hover fieldset": { borderColor: "#78c1c8" },
                        "&.Mui-focused fieldset": { borderColor: "#006d77" },
                      },
                      "& .MuiInputLabel-root": { color: "#03445e", fontFamily: "'Poppins', sans-serif" },
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={3}>
                  <TextField
                    label="Fecha de Nacimiento"
                    fullWidth
                    variant="outlined"
                    value={
                      paciente?.fecha_nacimiento
                        ? new Date(paciente.fecha_nacimiento).toLocaleDateString("es-MX")
                        : ""
                    }
                    InputProps={{ readOnly: true }}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: "12px",
                        "&:hover fieldset": { borderColor: "#78c1c8" },
                        "&.Mui-focused fieldset": { borderColor: "#006d77" },
                      },
                      "& .MuiInputLabel-root": { color: "#03445e", fontFamily: "'Poppins', sans-serif" },
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={3}>
                  <TextField
                    label="Sexo"
                    fullWidth
                    variant="outlined"
                    value={paciente?.sexo ? paciente.sexo.charAt(0).toUpperCase() : ""}
                    InputProps={{ readOnly: true }}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: "12px",
                        "&:hover fieldset": { borderColor: "#78c1c8" },
                        "&.Mui-focused fieldset": { borderColor: "#006d77" },
                      },
                      "& .MuiInputLabel-root": { color: "#03445e", fontFamily: "'Poppins', sans-serif" },
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    label="Teléfono"
                    fullWidth
                    variant="outlined"
                    value={paciente?.telefono || ""}
                    InputProps={{ readOnly: true }}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: "12px",
                        "&:hover fieldset": { borderColor: "#78c1c8" },
                        "&.Mui-focused fieldset": { borderColor: "#006d77" },
                      },
                      "& .MuiInputLabel-root": { color: "#03445e", fontFamily: "'Poppins', sans-serif" },
                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="Email"
                    fullWidth
                    variant="outlined"
                    value={paciente?.email || ""}
                    InputProps={{ readOnly: true }}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: "12px",
                        "&:hover fieldset": { borderColor: "#78c1c8" },
                        "&.Mui-focused fieldset": { borderColor: "#006d77" },
                      },
                      "& .MuiInputLabel-root": { color: "#03445e", fontFamily: "'Poppins', sans-serif" },
                    }}
                  />
                </Grid>
              </Grid>
            </Box>

            <Box sx={{ display: "flex", justifyContent: "center", mb: "2rem" }}>
              <img
                src={DientesImage}
                alt="Dientes"
                style={{ width: "700px", borderRadius: "10px", boxShadow: "0 6px 24px rgba(0, 0, 0, 0.08)" }}
              />
            </Box>

            <Box sx={{ marginBottom: "2rem" }}>
              <Typography
                variant="h6"
                sx={{ fontWeight: "bold", color: "#006d77", fontFamily: "'Poppins', sans-serif" }}
              >
                Información Médica
              </Typography>
              <Divider sx={{ marginBottom: "1.5rem", borderColor: "#78c1c8" }} />
              <TextField
                label="Signos Vitales"
                fullWidth
                variant="outlined"
                value={modoEdicion ? signosVitales : historialSeleccionado?.signos_vitales || ""}
                onChange={(e) => setSignosVitales(e.target.value)}
                InputProps={{ readOnly: !modoEdicion }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "12px",
                    "&:hover fieldset": { borderColor: "#78c1c8" },
                    "&.Mui-focused fieldset": { borderColor: "#006d77" },
                  },
                  "& .MuiInputLabel-root": { color: "#03445e", fontFamily: "'Poppins', sans-serif" },
                }}
              />
            </Box>

            <Box sx={{ marginBottom: "2rem" }}>
              <Typography
                variant="h6"
                sx={{ fontWeight: "bold", color: "#006d77", fontFamily: "'Poppins', sans-serif" }}
              >
                Tratamiento Dental
              </Typography>
              <Divider sx={{ marginBottom: "1.5rem", borderColor: "#78c1c8" }} />
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth variant="outlined">
                    <InputLabel sx={{ color: "#03445e", fontFamily: "'Poppins', sans-serif" }}>
                      Bajo Tratamiento
                    </InputLabel>
                    <Select
                      value={valorBajoTratamiento}
                      onChange={(e) => setBajoTratamiento(e.target.value)}
                      label="Bajo Tratamiento"
                      disabled={!modoEdicion}
                      sx={{
                        "& .MuiSelect-select": { fontFamily: "'Poppins', sans-serif" },
                        "& .MuiOutlinedInput-root": {
                          borderRadius: "12px",
                          "&:hover fieldset": { borderColor: "#78c1c8" },
                          "&.Mui-focused fieldset": { borderColor: "#006d77" },
                        },
                      }}
                    >
                      <MenuItem value="Sí" sx={{ fontFamily: "'Poppins', sans-serif" }}>
                        Sí
                      </MenuItem>
                      <MenuItem value="No" sx={{ fontFamily: "'Poppins', sans-serif" }}>
                        No
                      </MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    label="Tipo de Tratamiento"
                    fullWidth
                    variant="outlined"
                    value={modoEdicion ? tipoTratamiento : historialSeleccionado?.tipo_tratamiento || ""}
                    onChange={(e) => setTipoTratamiento(e.target.value)}
                    InputProps={{ readOnly: !modoEdicion }}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: "12px",
                        "&:hover fieldset": { borderColor: "#78c1c8" },
                        "&.Mui-focused fieldset": { borderColor: "#006d77" },
                      },
                      "& .MuiInputLabel-root": { color: "#03445e", fontFamily: "'Poppins', sans-serif" },
                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="Medicamentos Recetados"
                    fullWidth
                    variant="outlined"
                    value={modoEdicion ? medicamentos : historialSeleccionado?.medicamentos_recetados || ""}
                    onChange={(e) => setMedicamentos(e.target.value)}
                    InputProps={{ readOnly: !modoEdicion }}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: "12px",
                        "&:hover fieldset": { borderColor: "#78c1c8" },
                        "&.Mui-focused fieldset": { borderColor: "#006d77" },
                      },
                      "& .MuiInputLabel-root": { color: "#03445e", fontFamily: "'Poppins', sans-serif" },
                    }}
                  />
                </Grid>
              </Grid>
            </Box>

            <Box sx={{ marginBottom: "2rem" }}>
              <Typography
                variant="h6"
                sx={{ fontWeight: "bold", color: "#006d77", fontFamily: "'Poppins', sans-serif" }}
              >
                Observaciones Médicas
              </Typography>
              <Divider sx={{ marginBottom: "1.5rem", borderColor: "#78c1c8" }} />
              <TextField
                label="Observaciones o notas del paciente"
                multiline
                rows={4}
                variant="outlined"
                fullWidth
                value={modoEdicion ? comentario : historialSeleccionado?.observaciones_medicas || ""}
                onChange={(e) => setComentario(e.target.value)}
                InputProps={{ readOnly: !modoEdicion }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "12px",
                    "&:hover fieldset": { borderColor: "#78c1c8" },
                    "&.Mui-focused fieldset": { borderColor: "#006d77" },
                  },
                  "& .MuiInputLabel-root": { color: "#03445e", fontFamily: "'Poppins', sans-serif" },
                }}
              />
            </Box>
          </>
        )}
      </DialogContent>

      <DialogActions
        sx={{
          justifyContent: "space-between",
          padding: "1.5rem",
          backgroundColor: "#f9fbfd",
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)",
        }}
      >
        <Button
          onClick={handleClose}
          variant="contained"
          sx={{
            background: "linear-gradient(90deg, #006d77 0%, #78c1c8 100%)",
            color: "#e0f7fa",
            "&:hover": {
              background: "linear-gradient(90deg, #004d57 0%, #48cae4 100%)",
            },
            fontFamily: "'Poppins', sans-serif",
          }}
        >
          Cerrar
        </Button>
        <Button
          variant="contained"
          color="warning"
          onClick={limpiarCampos}
          sx={{
            background: "#ff9800",
            "&:hover": { background: "#f57c00" },
            fontFamily: "'Poppins', sans-serif",
          }}
        >
          Agregar Otro Historial
        </Button>
        <Button
          variant="contained"
          color="success"
          onClick={guardarHistorial}
          disabled={!modoEdicion}
          sx={{
            background: "#4caf50",
            "&:hover": { background: "#388e3c" },
            fontFamily: "'Poppins', sans-serif",
          }}
        >
          {tieneHistorial ? "Actualizar Historial" : "Registrar Nuevo"}
        </Button>
      </DialogActions>

      {openSnackbar && (
        <Box
          sx={{
            position: "fixed",
            bottom: 20,
            left: 20,
            zIndex: 1000,
            maxWidth: "350px",
          }}
        >
          <Alert
            severity={snackbarSeverity}
            variant="filled"
            sx={{
              backgroundColor:
                snackbarSeverity === "success"
                  ? "#e8f5e9"
                  : snackbarSeverity === "error"
                  ? "#ffebee"
                  : "#fff3e0",
              color:
                snackbarSeverity === "success"
                  ? "#2e7d32"
                  : snackbarSeverity === "error"
                  ? "#c62828"
                  : "#f57f17",
              borderRadius: "10px",
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
              fontFamily: "'Poppins', sans-serif",
            }}
            onClose={() => setOpenSnackbar(false)}
          >
            {snackbarMessage}
          </Alert>
        </Box>
      )}
    </Dialog>
  );
};

export default HistorialMedico;