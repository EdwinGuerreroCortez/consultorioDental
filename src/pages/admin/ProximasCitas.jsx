import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  CircularProgress,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Divider,
  IconButton,
  Grid,
  Select,
  MenuItem,
  FormControl,
  TextField,
  Tooltip,
  Snackbar,
  Alert,
} from "@mui/material";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import axios from "axios";
import EventIcon from "@mui/icons-material/Event";
import CloseIcon from "@mui/icons-material/Close";
import "./CalendarioEstilos.css";
import { motion } from "framer-motion";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import MonetizationOnIcon from "@mui/icons-material/MonetizationOn";
import EmailIcon from "@mui/icons-material/Email";
import PhoneIcon from "@mui/icons-material/Phone";
import MedicalServicesIcon from "@mui/icons-material/MedicalServices";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { es } from "date-fns/locale";
import ScheduleIcon from "@mui/icons-material/Schedule";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";

moment.locale("es");
const localizer = momentLocalizer(moment);

const diasSemana = {
  0: "Domingo",
  1: "Lunes",
  2: "Martes",
  3: "Miércoles",
  4: "Jueves",
  5: "Viernes",
  6: "Sábado",
};

const meses = {
  0: "Enero",
  1: "Febrero",
  2: "Marzo",
  3: "Abril",
  4: "Mayo",
  5: "Junio",
  6: "Julio",
  7: "Agosto",
  8: "Septiembre",
  9: "Octubre",
  10: "Noviembre",
  11: "Diciembre",
};

const messages = {
  allDay: "Todo el día",
  previous: "Anterior",
  next: "Siguiente",
  today: "Hoy",
  month: "Mes",
  week: "Semana",
  day: "Día",
  agenda: "Agenda",
  date: "Fecha",
  time: "Hora",
  event: "Evento",
  showMore: (total) => `+ Ver más (${total})`,
};

const formats = {
  dateFormat: "DD",
  dayFormat: (date) => diasSemana[date.getDay()],
  weekdayFormat: (date) => diasSemana[date.getDay()],
  monthHeaderFormat: (date) => `${meses[date.getMonth()]} ${date.getFullYear()}`,
  dayHeaderFormat: (date) => `${diasSemana[date.getDay()]} ${date.getDate()} de ${meses[date.getMonth()]}`,
};

const disponibilidadBase = [
  "09:00 AM", "10:00 AM", "11:00 AM", "12:00 PM", "01:00 PM",
  "03:00 PM", "04:00 PM", "05:00 PM", "06:00 PM"
];

const ProximasCitas = () => {
  const [citas, setCitas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCita, setSelectedCita] = useState(null);
  const [comentario, setComentario] = useState("");
  const [isConfirming, setIsConfirming] = useState(false);
  const [openReagendar, setOpenReagendar] = useState(false);
  const [nuevaFecha, setNuevaFecha] = useState(null);
  const [nuevaHora, setNuevaHora] = useState("");
  const [horasDisponibles, setHorasDisponibles] = useState([]);
  const [citasOcupadas, setCitasOcupadas] = useState([]);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");
  const [csrfToken, setCsrfToken] = useState(null);

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
        setSnackbarMessage("Error al obtener el token CSRF");
        setSnackbarSeverity("error");
        setSnackbarOpen(true);
      }
    };
    obtenerTokenCSRF();
  }, []);

  const axiosInstance = axios.create({
    baseURL: "https://backenddent.onrender.com/api",
    withCredentials: true,
  });

  const fetchCitas = async () => {
    if (!csrfToken) return;

    try {
      const response = await axiosInstance.get("/citas/proximas", {
        headers: { "X-XSRF-TOKEN": csrfToken },
      });
      const citasFiltradas = response.data.filter(
        (cita) => !(cita.estado_cita === "completada" && cita.estado_pago === "Pagado")
      );

      const citasFormateadas = citasFiltradas.map((cita) => ({
        id: cita.cita_id,
        title: `${cita.nombre} ${cita.apellido_paterno} - ${cita.estado_pago}`,
        start: new Date(cita.fecha_hora),
        end: moment(new Date(cita.fecha_hora)).add(1, "hour").toDate(),
        paciente: cita,
        tratamiento: cita.nombre_tratamiento,
      }));

      setCitas(citasFormateadas);

      const citasOcupadasData = await axiosInstance.get("/citas/activas", {
        headers: { "X-XSRF-TOKEN": csrfToken },
      });
      const citasConHoraFormateada = citasOcupadasData.data.map(cita => {
        const fechaUTC = new Date(cita.fecha_hora);
        let horas = fechaUTC.getUTCHours();
        const minutos = fechaUTC.getUTCMinutes().toString().padStart(2, "0");
        const periodo = horas >= 12 ? "PM" : "AM";
        horas = horas % 12 || 12;
        const horaFormateada = `${horas.toString().padStart(2, "0")}:${minutos} ${periodo}`;
        return { ...cita, hora_formateada: horaFormateada };
      });
      setCitasOcupadas(citasConHoraFormateada);
    } catch (error) {
      console.error("Error al obtener las próximas citas", error);
      setSnackbarMessage("Error al cargar las citas");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (csrfToken) {
      fetchCitas();
    }
  }, [csrfToken]);

  useEffect(() => {
    if (nuevaFecha) {
      const fechaFormateada = nuevaFecha.toISOString().split("T")[0];
      const horasOcupadas = citasOcupadas
        .filter(cita => new Date(cita.fecha_hora).toISOString().split("T")[0] === fechaFormateada)
        .map(cita => cita.hora_formateada);

      const nuevasHoras = disponibilidadBase.map(hora => ({
        value: hora,
        isOccupied: horasOcupadas.includes(hora),
      }));
      setHorasDisponibles(nuevasHoras);
    } else {
      setHorasDisponibles(disponibilidadBase.map(hora => ({ value: hora, isOccupied: false })));
    }
  }, [nuevaFecha, citasOcupadas]);

  const handleReagendar = () => {
    setOpenReagendar(true);
    setNuevaFecha(null);
    setNuevaHora("");
  };

  const handleConfirmReagendar = async () => {
    if (!csrfToken) return;

    if (!nuevaFecha || !nuevaHora) {
      setSnackbarMessage("Por favor, selecciona una fecha y hora.");
      setSnackbarSeverity("warning");
      setSnackbarOpen(true);
      return;
    }

    const selectedHourObj = horasDisponibles.find(h => h.value === nuevaHora);
    if (selectedHourObj.isOccupied) {
      setSnackbarMessage("Esta hora ya está ocupada. Por favor, selecciona otra.");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
      return;
    }

    const fechaFormateada = nuevaFecha.toISOString().split("T")[0];
    const [hora, minutos] = nuevaHora.replace(/( AM| PM)/, "").split(":").map(Number);
    const esPM = nuevaHora.includes("PM");
    let horaFinal = esPM && hora !== 12 ? hora + 12 : hora;
    if (!esPM && hora === 12) horaFinal = 0;
    const horaFormateada = `${horaFinal.toString().padStart(2, "0")}:${minutos.toString().padStart(2, "0")}:00`;
    const nuevaFechaHoraUTC = new Date(`${fechaFormateada}T${horaFormateada}Z`).toISOString();

    try {
      await axiosInstance.put(
        `/citas/actualizar-fecha-hora/${selectedCita.cita_id}`,
        { fechaHora: nuevaFechaHoraUTC },
        {
          headers: { "X-XSRF-TOKEN": csrfToken },
        }
      );
      setSnackbarMessage("¡Cita reagendada exitosamente!");
      setSnackbarSeverity("success");
      setSnackbarOpen(true);
      fetchCitas();
      setOpenReagendar(false);
      setSelectedCita(null);
    } catch (error) {
      console.error("Error al reagendar la cita:", error);
      setSnackbarMessage("Hubo un error al reagendar la cita.");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    }
  };

  const handleMarkAsCompleted = () => {
    setIsConfirming(true);
  };

  const handleConfirmCompletion = async () => {
    if (!csrfToken) return;

    if (!comentario.trim()) {
      setSnackbarMessage("Por favor, ingresa un comentario.");
      setSnackbarSeverity("warning");
      setSnackbarOpen(true);
      return;
    }

    try {
      await axiosInstance.put(
        `/citas/completar/${selectedCita.cita_id}`,
        { comentario },
        {
          headers: { "X-XSRF-TOKEN": csrfToken },
        }
      );
      setSnackbarMessage("¡Cita marcada como completada exitosamente!");
      setSnackbarSeverity("success");
      setSnackbarOpen(true);
      fetchCitas();
      handleCloseDialog();
    } catch (error) {
      console.error("Error al actualizar la cita:", error);
      setSnackbarMessage("Hubo un error al marcar la cita como completada.");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  const eventStyleGetter = (event) => {
    let backgroundColor = event.paciente.estado_pago === "Pagado" ? "#2E7D32" : "#D32F2F";
    return {
      style: {
        backgroundColor,
        color: "white",
        borderRadius: "8px",
        padding: "5px",
        textAlign: "center",
        fontWeight: "bold",
      },
    };
  };

  const handleSelectEvent = (event) => {
    setSelectedCita(event.paciente);
    setComentario("");
    setIsConfirming(false);
  };

  const handleCloseDialog = () => {
    setSelectedCita(null);
    setIsConfirming(false);
  };

  return (
    <Box
      sx={{
        flexGrow: 1,
        padding: { xs: "20px", md: "40px" },
        width: "100%",
        maxWidth: "1800px",
        backgroundColor: "transparent",
        borderRadius: "16px",
        fontFamily: "'Roboto', sans-serif",
      }}
    >
      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "500px" }}>
          <CircularProgress size={60} sx={{ color: "#003087" }} />
        </Box>
      ) : (
        <Paper
          sx={{
            padding: "20px",
            borderRadius: "16px",
            boxShadow: "0 4px 16px rgba(0, 0, 0, 0.1)",
            backgroundColor: "#fff",
          }}
        >
          <Calendar
            localizer={localizer}
            events={citas}
            startAccessor="start"
            endAccessor="end"
            style={{ height: 600 }}
            eventPropGetter={eventStyleGetter}
            onSelectEvent={handleSelectEvent}
            culture="es"
            messages={messages}
            formats={formats}
            className="custom-calendar"
          />
        </Paper>
      )}

      <Dialog
        open={!!selectedCita}
        onClose={handleCloseDialog}
        sx={{
          "& .MuiDialog-paper": {
            borderRadius: "16px",
            maxWidth: "800px",
            width: "100%",
            boxShadow: "0 8px 24px rgba(0, 0, 0, 0.2)",
            padding: "20px",
          },
        }}
      >
        <DialogTitle
          sx={{
            backgroundColor: "#003087",
            color: "white",
            fontWeight: "600",
            fontFamily: "'Roboto', sans-serif",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "20px 24px",
          }}
        >
          <Box display="flex" alignItems="center" gap={1}>
            <MedicalServicesIcon sx={{ fontSize: 32 }} />
            <Typography variant="h5" sx={{ fontSize: "1.5rem" }}>
              Detalles de la Cita
            </Typography>
          </Box>
          <IconButton onClick={handleCloseDialog} sx={{ color: "white" }}>
            <CloseIcon sx={{ fontSize: 28 }} />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ padding: "32px" }}>
          {selectedCita && !isConfirming && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <Typography variant="h5" sx={{ color: "#003087", fontWeight: "600", mb: 3, fontSize: "1.75rem" }}>
                {selectedCita.nombre} {selectedCita.apellido_paterno}
              </Typography>
              <Divider sx={{ my: 3 }} />
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <Box display="flex" alignItems="center">
                    <EventIcon sx={{ color: "#003087", mr: 1.5, fontSize: 28 }} />
                    <Typography sx={{ fontSize: "1.1rem" }}>
                      {new Date(selectedCita.fecha_hora).toLocaleDateString("es-ES")}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box display="flex" alignItems="center">
                    <AccessTimeIcon sx={{ color: "#003087", mr: 1.5, fontSize: 28 }} />
                    <Typography sx={{ fontSize: "1.1rem" }}>
                      {new Date(selectedCita.fecha_hora).toLocaleTimeString("es-ES", {
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: true,
                      })}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12}>
                  <Box display="flex" alignItems="center">
                    <MonetizationOnIcon
                      sx={{
                        color: selectedCita.estado_pago === "Pagado" ? "#2E7D32" : "#D32F2F",
                        mr: 1.5,
                        fontSize: 28,
                      }}
                    />
                    <Typography
                      sx={{
                        color: selectedCita.estado_pago === "Pagado" ? "#2E7D32" : "#D32F2F",
                        fontSize: "1.1rem",
                      }}
                    >
                      {selectedCita.estado_pago}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box display="flex" alignItems="center">
                    <EmailIcon sx={{ color: "#003087", mr: 1.5, fontSize: 28 }} />
                    <Typography sx={{ fontSize: "1.1rem" }}>{selectedCita.email}</Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box display="flex" alignItems="center">
                    <PhoneIcon sx={{ color: "#003087", mr: 1.5, fontSize: 28 }} />
                    <Typography sx={{ fontSize: "1.1rem" }}>{selectedCita.telefono}</Typography>
                  </Box>
                </Grid>
                <Grid item xs={12}>
                  <Box display="flex" alignItems="center">
                    <MedicalServicesIcon sx={{ color: "#003087", mr: 1.5, fontSize: 28 }} />
                    <Typography sx={{ color: "#003087", fontSize: "1.1rem" }}>
                      🦷 {selectedCita.nombre_tratamiento}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </motion.div>
          )}
          {isConfirming && (
            <Box>
              <Typography variant="subtitle1" sx={{ color: "#003087", mb: 2, fontSize: "1.25rem" }}>
                Agregar Comentario:
              </Typography>
              <TextField
                value={comentario}
                onChange={(e) => setComentario(e.target.value)}
                placeholder="Escribe un comentario..."
                multiline
                rows={4}
                fullWidth
                variant="outlined"
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: "8px" } }}
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ padding: "20px 32px", backgroundColor: "#f0f4f8", gap: 2 }}>
          {!isConfirming ? (
            <>
              {selectedCita && selectedCita.estado_cita !== "completada" && (
                <>
                  <Tooltip title="Reagendar Cita">
                    <IconButton
                      onClick={handleReagendar}
                      sx={{
                        backgroundColor: "#ffa500",
                        color: "white",
                        "&:hover": { backgroundColor: "#ff8c00" },
                      }}
                    >
                      <ScheduleIcon sx={{ fontSize: 28 }} />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Marcar como Completada">
                    <IconButton
                      onClick={handleMarkAsCompleted}
                      sx={{
                        backgroundColor: "#2E7D32",
                        color: "white",
                        "&:hover": { backgroundColor: "#1B5E20" },
                      }}
                    >
                      <CheckCircleIcon sx={{ fontSize: 28 }} />
                    </IconButton>
                  </Tooltip>
                </>
              )}
            </>
          ) : (
            <>
              <Tooltip title="Confirmar Completada">
                <IconButton
                  onClick={handleConfirmCompletion}
                  sx={{
                    backgroundColor: "#003087",
                    color: "white",
                    "&:hover": { backgroundColor: "#005f8c" },
                  }}
                >
                  <CheckCircleIcon sx={{ fontSize: 28 }} />
                </IconButton>
              </Tooltip>
              <Tooltip title="Cancelar Acción">
                <IconButton
                  onClick={() => setIsConfirming(false)}
                  sx={{
                    backgroundColor: "#ffa500",
                    color: "white",
                    "&:hover": { backgroundColor: "#ff8c00" },
                  }}
                >
                  <CancelIcon sx={{ fontSize: 28 }} />
                </IconButton>
              </Tooltip>
            </>
          )}
        </DialogActions>
      </Dialog>

      <Dialog open={openReagendar} onClose={() => setOpenReagendar(false)}>
        <DialogTitle sx={{ color: "#003087", fontFamily: "'Roboto', sans-serif'" }}>
          Reagendar Cita
        </DialogTitle>
        <DialogContent>
          <LocalizationProvider dateAdapter={AdapterDateFns} locale={es}>
            <DatePicker
              label="Nueva Fecha"
              value={nuevaFecha}
              onChange={setNuevaFecha}
              renderInput={(params) => <TextField {...params} fullWidth margin="normal" />}
              disablePast
              shouldDisableDate={(date) => ![1, 2, 3, 6].includes(date.getDay())}
              maxDate={new Date(new Date().setMonth(new Date().getMonth() + 4))}
              sx={{ "& .MuiOutlinedInput-root": { borderRadius: "8px" } }}
            />
          </LocalizationProvider>
          <FormControl fullWidth margin="normal">
            <Select
              value={nuevaHora}
              onChange={(e) => setNuevaHora(e.target.value)}
              displayEmpty
              sx={{ borderRadius: "8px" }}
            >
              <MenuItem value="" disabled>
                Selecciona una hora
              </MenuItem>
              {horasDisponibles.map((horaObj, index) => (
                <MenuItem
                  key={index}
                  value={horaObj.value}
                  disabled={horaObj.isOccupied}
                  sx={{
                    color: horaObj.isOccupied ? "#d32f2f" : "inherit",
                    fontStyle: horaObj.isOccupied ? "italic" : "normal",
                  }}
                >
                  {horaObj.value} {horaObj.isOccupied && "(Ocupada)"}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button variant="contained" sx={{ backgroundColor: "#003087" }} onClick={handleConfirmReagendar}>
            Confirmar
          </Button>
          <Button onClick={() => setOpenReagendar(false)} sx={{ color: "#D32F2F" }}>
            Cancelar
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbarSeverity} sx={{ width: "100%" }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ProximasCitas;