import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Alert,
  Card,
  CardContent,
  Typography,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  List,
  ListItem,
  Divider,
  Box,
  Grid,
  Avatar,
  Stack,
  Button,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  InputAdornment,
  FormControl,
  Select,
  MenuItem,
  TextField,
} from "@mui/material";
import {
  Person,
  CalendarToday,
  AssignmentTurnedIn,
  ErrorOutline,
  ArrowBack,
  ArrowForward,
  MonetizationOn,
} from "@mui/icons-material";
import { motion } from "framer-motion";
import { obtenerCitasOcupadas, obtenerHorasDisponibles } from "../../utils/citas";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { es } from "date-fns/locale";
import AccessTimeIcon from "@mui/icons-material/AccessTime";

export default function EvaluarCitasPendientes() {
  const [tratamientos, setTratamientos] = useState([]);
  const [selectedTratamiento, setSelectedTratamiento] = useState(null);
  const [citas, setCitas] = useState([]);
  const [open, setOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const citasPorPagina = 5;
  const [openAgendar, setOpenAgendar] = useState(false);
  const [fechaSeleccionada, setFechaSeleccionada] = useState(null);
  const [horaSeleccionada, setHoraSeleccionada] = useState("");
  const [citasOcupadas, setCitasOcupadas] = useState([]);
  const [citasPorTratamiento, setCitasPorTratamiento] = useState({});

  const disponibilidad = [
    "09:00 AM",
    "10:00 AM",
    "11:00 AM",
    "12:00 PM",
    "01:00 PM",
    "03:00 PM",
    "04:00 PM",
    "05:00 PM",
    "06:00 PM",
  ];
  const [alerta, setAlerta] = useState({ mostrar: false, mensaje: "", tipo: "" });

  useEffect(() => {
    if (alerta.mostrar) {
      const timer = setTimeout(() => {
        setAlerta({ mostrar: false, mensaje: "", tipo: "" });
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [alerta.mostrar]);

  const handleOpenAgendar = () => {
    setOpenAgendar(true);
  };

  const handleCloseAgendar = () => {
    setOpenAgendar(false);
  };

  const actualizarCita = async () => {
    const proximaCitaId = obtenerProximaCitaId();
    if (!proximaCitaId || !fechaSeleccionada || !horaSeleccionada) {
      console.warn("⚠️ No se puede actualizar la cita. Verifica los datos.");
      setAlerta({
        mostrar: true,
        mensaje: "⚠️ No se puede agendar la cita. Verifica los datos.",
        tipo: "warning",
      });
      return;
    }

    const fechaSeleccionadaStr = fechaSeleccionada.toISOString().split("T")[0];
    const [hora, minutos] = horaSeleccionada.replace(/( AM| PM)/, "").split(":").map(Number);
    const esPM = horaSeleccionada.includes("PM");

    let horaFinal = esPM && hora !== 12 ? hora + 12 : hora;
    if (!esPM && hora === 12) horaFinal = 0;

    const fechaHoraLocal = new Date(
      `${fechaSeleccionadaStr}T${horaFinal.toString().padStart(2, "0")}:${minutos.toString().padStart(2, "0")}:00`
    );
    const fechaHoraUTC = new Date(fechaHoraLocal.getTime() - fechaHoraLocal.getTimezoneOffset() * 60000);

    console.log("📌 Enviando actualización de cita con ID:", proximaCitaId);
    console.log("🕒 Nueva fecha y hora en UTC:", fechaHoraUTC.toISOString());

    try {
      const response = await axios.put(`http://localhost:4000/api/citas/actualizar/${proximaCitaId}`, {
        fechaHora: fechaHoraUTC.toISOString(),
      });

      console.log("✅ Cita actualizada con éxito:", response.data);

      setCitas((prevCitas) =>
        (prevCitas || []).map((cita) =>
          cita.id === proximaCitaId
            ? { ...cita, fecha_hora: fechaHoraUTC.toISOString(), estado: "pendiente" }
            : cita
        )
      );

      setCitasPorTratamiento((prevCitas) => ({
        ...prevCitas,
        [selectedTratamiento.id]: (prevCitas[selectedTratamiento.id] || []).map((cita) =>
          cita.id === proximaCitaId
            ? { ...cita, fecha_hora: fechaHoraUTC.toISOString(), estado: "pendiente" }
            : cita
        ),
      }));

      setTratamientos((prevTratamientos) =>
        prevTratamientos.map((tratamiento) =>
          tratamiento.id === selectedTratamiento.id
            ? {
                ...tratamiento,
                citas_asistidas: (citasPorTratamiento[selectedTratamiento.id] || [])
                  .filter((cita) => cita.estado === "completada" && cita.pagada === 1 && cita.fecha_hora !== null)
                  .length + 1,
              }
            : tratamiento
        )
      );

      setAlerta({
        mostrar: true,
        mensaje: "La cita ha sido agendada exitosamente.",
        tipo: "success",
      });

      setOpenAgendar(false);
    } catch (error) {
      console.error("❌ Error al actualizar la cita:", error);
      setAlerta({
        mostrar: true,
        mensaje: "❌ Ocurrió un error al agendar la cita.",
        tipo: "error",
      });
    }
  };

  useEffect(() => {
    if (fechaSeleccionada) {
      obtenerCitasOcupadas().then(setCitasOcupadas);
    }
  }, [fechaSeleccionada]);

  useEffect(() => {
    const obtenerDatos = async () => {
      try {
        const { data: tratamientos } = await axios.get("http://localhost:4000/api/tratamientos-pacientes/en-progreso");

        if (tratamientos.length === 0) return;

        const peticionesCitas = tratamientos.map((tratamiento) =>
          axios
            .get(`http://localhost:4000/api/citas/tratamiento/${tratamiento.id}`)
            .then((response) => ({ id: tratamiento.id, citas: response.data }))
            .catch((error) => {
              console.error(`Error al obtener citas para el tratamiento ${tratamiento.id}`, error);
              return { id: tratamiento.id, citas: [] };
            })
        );

        const citasObtenidas = await Promise.all(peticionesCitas);

        const citasMap = {};
        citasObtenidas.forEach(({ id, citas }) => {
          citasMap[id] = citas;
        });

        const tratamientosActualizados = tratamientos.map((tratamiento) => {
          const citas = citasMap[tratamiento.id] || [];
          const citasAsistidas = citas.filter(
            (cita) => cita.estado === "completada" && cita.pagada === 1 && cita.fecha_hora !== null
          ).length;

          return {
            ...tratamiento,
            citas_asistidas: citasAsistidas,
          };
        });

        setTratamientos(tratamientosActualizados);
        setCitasPorTratamiento(citasMap);
      } catch (error) {
        console.error("Error al obtener tratamientos y citas", error);
      }
    };

    obtenerDatos();
  }, []);

  const convertirHoraLocal = (fechaISO) => {
    if (!fechaISO) return "Sin asignar";
    const fecha = new Date(fechaISO);
    return fecha.toLocaleString("es-MX", { timeZone: "America/Mexico_City" });
  };

  const handleOpenDialog = (tratamiento) => {
    setSelectedTratamiento(tratamiento);
    setCitas(citasPorTratamiento[tratamiento.id] || []);
    setOpen(true);
  };

  const handleCloseDialog = () => {
    setOpen(false);
    setCitas([]);
  };

  const totalPaginas = Math.ceil(citas.length / citasPorPagina);
  const citasPaginadas = citas.slice(currentPage * citasPorPagina, (currentPage + 1) * citasPorPagina);

  const ultimaCitaConFecha = citas
    .filter((cita) => cita.fecha_hora)
    .pop();

  const puedeAgendarCita = ultimaCitaConFecha
    ? ultimaCitaConFecha.estado === "completada" && ultimaCitaConFecha.pagada === 1
    : false;

  const obtenerProximaCitaId = () => {
    const proximaCita = citas.find((cita) => cita.fecha_hora === null && cita.estado === "pendiente");
    if (proximaCita) {
      console.log("📌 ID de la próxima cita pendiente:", proximaCita.id);
      return proximaCita.id;
    } else {
      console.log("⚠️ No hay citas pendientes disponibles.");
      return null;
    }
  };

  const obtenerUltimaFechaCita = () => {
    if (!selectedTratamiento || !citasPorTratamiento[selectedTratamiento.id]) return null;

    const citasConFecha = citasPorTratamiento[selectedTratamiento.id].filter((cita) => cita.fecha_hora);

    if (citasConFecha.length === 0) return null;

    const ultimaCita = citasConFecha.sort((a, b) => new Date(b.fecha_hora) - new Date(a.fecha_hora))[0];

    return new Date(ultimaCita.fecha_hora);
  };

  const determinarTipoCita = (tratamiento) => {
    if (tratamiento.requiere_evaluacion) return "Evaluación";
    return tratamiento.tratamiento || "Valorar cita";
  };

  return (
    <Box sx={{ p: 3 }}>
      <Grid container spacing={3}>
        {tratamientos.map((tratamiento, index) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={tratamiento.id}>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.5,
                ease: "easeOut",
                delay: index * 0.1,
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              style={{ cursor: "pointer" }}
            >
              <Card
                sx={{
                  borderRadius: 16,
                  boxShadow: "0 4px 10px rgba(0, 0, 0, 0.08)",
                  p: 2,
                  background: "linear-gradient(135deg, #ffffff, #f7fbff)",
                  border: "1px solid #b3e5fc",
                  transition: "transform 0.3s ease",
                  minHeight: 220,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  "&:hover": {
                    boxShadow: "0 6px 15px rgba(179, 229, 252, 0.2)",
                  },
                }}
                onClick={() => handleOpenDialog(tratamiento)}
              >
                <CardContent>
                  <Box sx={{ mb: 2, textAlign: "center" }}>
                    <Avatar
                      sx={{
                        bgcolor: "#b3e5fc",
                        width: 40,
                        height: 40,
                        mx: "auto",
                        mb: 1,
                      }}
                    >
                      <AssignmentTurnedIn sx={{ fontSize: 24, color: "#42a5f5" }} />
                    </Avatar>
                    <Typography
                      variant="subtitle1"
                      sx={{ fontWeight: "bold", color: "#42a5f5", textTransform: "uppercase" }}
                    >
                      {determinarTipoCita(tratamiento)}
                    </Typography>
                  </Box>

                  <Box display="flex" alignItems="center" gap={2} mb={2}>
                    <Avatar sx={{ bgcolor: "#e3f2fd", width: 40, height: 40 }}>
                      <Person sx={{ fontSize: 24, color: "#42a5f5" }} />
                    </Avatar>
                    <Box>
                      <Typography
                        variant="h6"
                        sx={{ fontWeight: "bold", color: "#333", lineHeight: 1.2 }}
                      >
                        {`${(tratamiento.nombre || "")
                          .charAt(0)
                          .toUpperCase()}${(
                          tratamiento.nombre || ""
                        ).slice(1).toLowerCase()}`}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{ color: "#666", fontStyle: "italic" }}
                      >
                        {`${(tratamiento.apellido_paterno || "")
                          .charAt(0)
                          .toUpperCase()}${(
                          tratamiento.apellido_paterno || ""
                        ).slice(1).toLowerCase()} ${
                          (tratamiento.apellido_materno || "")
                            .charAt(0)
                            .toUpperCase()
                        }${(tratamiento.apellido_materno || "").slice(1).toLowerCase()}`}
                      </Typography>
                      <Box
                        sx={{
                          display: "inline-flex",
                          alignItems: "center",
                          bgcolor: "#e3f2fd",
                          borderRadius: "50%",
                          px: 1.5,
                          py: 0.5,
                          mt: 0.5,
                        }}
                      >
                        <CalendarToday sx={{ fontSize: 16, color: "#42a5f5", mr: 0.5 }} />
                        <Typography variant="caption" sx={{ color: "#42a5f5" }}>
                          {tratamiento.edad} años
                        </Typography>
                      </Box>
                    </Box>
                  </Box>

                  <Box sx={{ mt: 2 }}>
                    <Typography
                      variant="body1"
                      sx={{ fontWeight: "bold", color: "#333", mb: 1 }}
                    >
                      Progreso de citas
                    </Typography>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        bgcolor: "#e0e0e0",
                        borderRadius: 8,
                        overflow: "hidden",
                        height: 10,
                      }}
                    >
                      <Box
                        sx={{
                          bgcolor: "#b3e5fc",
                          height: "100%",
                          width: `${(tratamiento.citas_asistidas / tratamiento.citas_totales) * 100}%`,
                          transition: "width 0.3s ease",
                        }}
                      />
                    </Box>
                    <Typography
                      variant="body2"
                      sx={{ mt: 1, color: "#666", textAlign: "right" }}
                    >
                      <strong>{tratamiento.citas_asistidas}</strong> de{" "}
                      {tratamiento.citas_totales}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>
        ))}
      </Grid>

      {selectedTratamiento && (
        <Dialog
          open={open}
          onClose={handleCloseDialog}
          fullWidth
          maxWidth="md"
          sx={{
            "& .MuiDialog-paper": { height: "650px", borderRadius: 4, boxShadow: 6 },
          }}
        >
          <DialogTitle
            sx={{
              fontWeight: "bold",
              textAlign: "center",
              backgroundColor: "#b3e5fc",
              color: "white",
              borderTopLeftRadius: 4,
              borderTopRightRadius: 4,
            }}
          >
            Citas de {selectedTratamiento.tratamiento}
          </DialogTitle>

          <DialogContent
            sx={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              height: "100%",
              backgroundColor: "#f9f9f9",
              p: 2,
              pt: 4, // Aumentamos el padding superior para más espacio
            }}
          >
            <TableContainer
              component={Paper}
              sx={{
                borderRadius: 2,
                boxShadow: "0 4px 15px rgba(0, 0, 0, 0.1)",
                border: "1px solid #e3f2fd",
                mt: 2, // Añadimos margen superior para separar del DialogTitle
              }}
            >
              <Table>
                <TableHead>
                  <TableRow
                    sx={{
                      background: "linear-gradient(135deg, #e3f2fd, #b3e5fc)",
                      borderBottom: "2px solid #42a5f5",
                    }}
                  >
                    <TableCell
                      sx={{
                        fontWeight: "bold",
                        textAlign: "center",
                        color: "#42a5f5",
                        fontSize: "1rem",
                        py: 2,
                      }}
                    >
                      #
                    </TableCell>
                    <TableCell
                      sx={{
                        fontWeight: "bold",
                        textAlign: "center",
                        color: "#42a5f5",
                        fontSize: "1rem",
                        py: 2,
                      }}
                    >
                      Fecha
                    </TableCell>
                    <TableCell
                      sx={{
                        fontWeight: "bold",
                        textAlign: "center",
                        color: "#42a5f5",
                        fontSize: "1rem",
                        py: 2,
                      }}
                    >
                      Estado Cita
                    </TableCell>
                    <TableCell
                      sx={{
                        fontWeight: "bold",
                        textAlign: "center",
                        color: "#42a5f5",
                        fontSize: "1rem",
                        py: 2,
                      }}
                    >
                      Estado Pago
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {citasPaginadas.length > 0 ? (
                    citasPaginadas.map((cita, index) => (
                      <TableRow
                        key={index}
                        sx={{
                          backgroundColor: index % 2 === 0 ? "#fafafa" : "#ffffff",
                          "&:hover": { backgroundColor: "#e6f7ff" },
                          transition: "background-color 0.3s ease",
                          borderRadius: "8px",
                          height: "60px",
                        }}
                      >
                        <TableCell
                          sx={{
                            textAlign: "center",
                            fontWeight: "bold",
                            color: "#666",
                            fontSize: "0.9rem",
                            py: 1.5,
                          }}
                        >
                          {index + 1 + currentPage * citasPorPagina}
                        </TableCell>
                        <TableCell
                          sx={{
                            textAlign: "center",
                            fontSize: "0.9rem",
                            color: "#333",
                            py: 1.5,
                          }}
                        >
                          {cita.fecha_hora ? convertirHoraLocal(cita.fecha_hora) : "Sin Asignar"}
                        </TableCell>
                        <TableCell sx={{ textAlign: "center", py: 1.5 }}>
                          <Box display="flex" justifyContent="center" alignItems="center" gap={1}>
                            {cita.estado === "pendiente" ? (
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  bgcolor: "#fff3e0",
                                  borderRadius: "50%",
                                  width: 24,
                                  height: 24,
                                }}
                              >
                                <ErrorOutline sx={{ fontSize: 18, color: "#ff9800" }} />
                              </Box>
                            ) : (
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  bgcolor: "#e8f5e9",
                                  borderRadius: "50%",
                                  width: 24,
                                  height: 24,
                                }}
                              >
                                <AssignmentTurnedIn sx={{ fontSize: 18, color: "#4caf50" }} />
                              </Box>
                            )}
                            <Typography
                              sx={{
                                fontSize: "0.9rem",
                                fontWeight: "bold",
                                color: cita.estado === "pendiente" ? "#ff9800" : "#4caf50",
                                bgcolor:
                                  cita.estado === "pendiente" ? "#fff3e0" : "#e8f5e9",
                                borderRadius: "12px",
                                px: 1.5,
                                py: 0.5,
                              }}
                            >
                              {cita.estado}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell sx={{ textAlign: "center", py: 1.5 }}>
                          <Box display="flex" justifyContent="center" alignItems="center" gap={1}>
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                bgcolor: cita.pagada ? "#e8f5e9" : "#ffebee",
                                borderRadius: "50%",
                                width: 24,
                                height: 24,
                              }}
                            >
                              <MonetizationOn
                                sx={{
                                  fontSize: 18,
                                  color: cita.pagada ? "#4caf50" : "#f44336",
                                }}
                              />
                            </Box>
                            <Typography
                              sx={{
                                fontSize: "0.9rem",
                                fontWeight: "bold",
                                color: cita.pagada ? "#4caf50" : "#f44336",
                                bgcolor: cita.pagada ? "#e8f5e9" : "#ffebee",
                                borderRadius: "12px",
                                px: 1.5,
                                py: 0.5,
                              }}
                            >
                              {cita.pagada ? "Pagada" : "No Pagada"}
                            </Typography>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={4}
                        sx={{
                          textAlign: "center",
                          fontStyle: "italic",
                          color: "text.secondary",
                          py: 3,
                        }}
                      >
                        No hay citas registradas.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            <Box display="flex" justifyContent="center" sx={{ mt: 2 }}>
              <Button
                variant="contained"
                disabled={!puedeAgendarCita}
                onClick={() => {
                  const proximaCitaId = obtenerProximaCitaId();
                  if (proximaCitaId) {
                    setOpenAgendar(true);
                  }
                }}
                sx={{
                  fontWeight: "bold",
                  width: "250px",
                  height: "45px",
                  borderRadius: "8px",
                  textTransform: "none",
                  backgroundColor: "#b3e5fc",
                  color: "#ffffff",
                  "&:hover": {
                    backgroundColor: "#42a5f5",
                  },
                }}
              >
                Agendar Próxima Cita
              </Button>
            </Box>

            <Box display="flex" justifyContent="center" alignItems="center" sx={{ py: 2 }}>
              <IconButton
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 0))}
                disabled={currentPage === 0}
                sx={{
                  color: currentPage === 0 ? "gray" : "#b3e5fc",
                  "&:hover": { backgroundColor: "#e3f2fd" },
                }}
              >
                <ArrowBack />
              </IconButton>
              <Typography sx={{ mx: 2, fontWeight: "bold", fontSize: 14 }}>
                Página {currentPage + 1} de {totalPaginas}
              </Typography>
              <IconButton
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPaginas - 1))}
                disabled={currentPage === totalPaginas - 1}
                sx={{
                  color: currentPage === totalPaginas - 1 ? "gray" : "#b3e5fc",
                  "&:hover": { backgroundColor: "#e3f2fd" },
                }}
              >
                <ArrowForward />
              </IconButton>
            </Box>
          </DialogContent>

          <DialogActions sx={{ backgroundColor: "#f9f9f9", borderBottomLeftRadius: 4, borderBottomRightRadius: 4 }}>
            <Button onClick={handleCloseDialog} variant="contained" color="error">
              Cerrar
            </Button>
          </DialogActions>
        </Dialog>
      )}
      <Dialog open={openAgendar} onClose={handleCloseAgendar} fullWidth maxWidth="sm">
        <DialogTitle
          sx={{
            fontWeight: "bold",
            textAlign: "center",
            backgroundColor: "#b3e5fc",
            color: "white",
            borderTopLeftRadius: 4,
            borderTopRightRadius: 4,
            boxShadow: "0px 3px 10px rgba(0, 0, 0, 0.2)",
          }}
        >
          Seleccionar Fecha y Hora
        </DialogTitle>

        <DialogContent
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            padding: "20px",
            backgroundColor: "#f8fcff",
          }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            whileHover={{ scale: 1.02 }}
            style={{
              backgroundColor: "white",
              padding: "20px",
              borderRadius: "10px",
              boxShadow: "0px 4px 15px rgba(0, 0, 0, 0.1)",
              width: "100%",
            }}
          >
            <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
              <DatePicker
                label="Selecciona la Fecha"
                value={fechaSeleccionada}
                onChange={(newValue) => setFechaSeleccionada(newValue)}
                minDate={obtenerUltimaFechaCita() || new Date()}
                renderInput={(params) => <TextField {...params} fullWidth sx={{ mt: 1 }} />}
                disablePast
                shouldDisableDate={(date) => ![1, 2, 3, 6].includes(date.getDay())}
              />
            </LocalizationProvider>

            <Typography
              variant="body2"
              sx={{ color: "#d32f2f", fontWeight: "bold", mt: 1, textAlign: "center" }}
            >
              Solo se pueden agendar citas en: Lunes, Martes, Miércoles y Sábado.
            </Typography>

            <FormControl fullWidth sx={{ mt: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: "bold", color: "#b3e5fc", textAlign: "center" }}>
                Horario Disponible
              </Typography>
              <Select
                value={horaSeleccionada}
                onChange={(e) => setHoraSeleccionada(e.target.value)}
                displayEmpty
                startAdornment={
                  <InputAdornment position="start">
                    <AccessTimeIcon sx={{ color: "#b3e5fc" }} />
                  </InputAdornment>
                }
                sx={{
                  borderRadius: "10px",
                  backgroundColor: "#e6f7ff",
                  height: "50px",
                  textAlign: "center",
                }}
                disabled={
                  !fechaSeleccionada ||
                  obtenerHorasDisponibles(fechaSeleccionada, citasOcupadas, disponibilidad).length === 0
                }
              >
                {obtenerHorasDisponibles(fechaSeleccionada, citasOcupadas, disponibilidad).length > 0 ? (
                  obtenerHorasDisponibles(fechaSeleccionada, citasOcupadas, disponibilidad).map((hora, index) => (
                    <MenuItem key={index} value={hora}>
                      {hora}
                    </MenuItem>
                  ))
                ) : (
                  <MenuItem disabled>No hay horarios disponibles</MenuItem>
                )}
              </Select>
            </FormControl>
          </motion.div>
        </DialogContent>

        <DialogActions
          sx={{
            display: "flex",
            justifyContent: "center",
            padding: "20px",
            backgroundColor: "#f8fcff",
            borderBottomLeftRadius: 4,
            borderBottomRightRadius: 4,
          }}
        >
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              onClick={handleCloseAgendar}
              variant="outlined"
              sx={{
                color: "#b3e5fc",
                borderColor: "#b3e5fc",
                fontWeight: "bold",
                textTransform: "none",
                height: "45px",
                width: "120px",
                "&:hover": {
                  backgroundColor: "#e6f7ff",
                  borderColor: "#42a5f5",
                },
              }}
            >
              Cancelar
            </Button>
          </motion.div>

          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              variant="contained"
              onClick={actualizarCita}
              sx={{
                fontWeight: "bold",
                height: "45px",
                width: "150px",
                borderRadius: "8px",
                textTransform: "none",
                backgroundColor: "#b3e5fc",
                color: "#ffffff",
                "&:hover": {
                  backgroundColor: "#42a5f5",
                },
              }}
            >
              Confirmar Cita
            </Button>
          </motion.div>
        </DialogActions>
      </Dialog>
      {alerta.mostrar && (
        <Box
          sx={{
            position: "fixed",
            bottom: 20,
            left: 20,
            zIndex: 2000,
            width: "auto",
            maxWidth: "400px",
          }}
        >
          <Alert
            severity={alerta.tipo}
            variant="filled"
            sx={{
              width: "100%",
              backgroundColor:
                alerta.tipo === "success"
                  ? "#DFF6DD"
                  : alerta.tipo === "error"
                  ? "#F8D7DA"
                  : alerta.tipo === "warning"
                  ? "#FFF3CD"
                  : "#D1ECF1",
              color:
                alerta.tipo === "success"
                  ? "#1E4620"
                  : alerta.tipo === "error"
                  ? "#721C24"
                  : alerta.tipo === "warning"
                  ? "#856404"
                  : "#0C5460",
            }}
            onClose={() => setAlerta({ mostrar: false, mensaje: "", tipo: "" })}
          >
            {alerta.mensaje}
          </Alert>
        </Box>
      )}
    </Box>
  );
}