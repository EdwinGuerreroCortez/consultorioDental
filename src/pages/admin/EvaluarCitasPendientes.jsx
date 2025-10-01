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
  Box,
  Grid,
  Avatar,
  Button,
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
  Tooltip,
  IconButton,
} from "@mui/material";
import {
  Person,
  CalendarToday,
  AssignmentTurnedIn,
  ErrorOutline,
  ArrowBack,
  ArrowForward,
  MonetizationOn,
  AddCircleOutline,
  Close,
  Search as SearchIcon,
} from "@mui/icons-material";
import { motion } from "framer-motion";
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
  const [csrfToken, setCsrfToken] = useState(null);
  const [horasDisponibles, setHorasDisponibles] = useState([]);
  const [alerta, setAlerta] = useState({ mostrar: false, mensaje: "", tipo: "" });
  const [searchTerm, setSearchTerm] = useState("");
  const [tratamientosPage, setTratamientosPage] = useState(1);
  const tratamientosPorPagina = 12; // Ajustado para mostrar 12 tarjetas por página

  const disponibilidadBase = [
    "09:00 AM", "10:00 AM", "11:00 AM", "12:00 PM", "01:00 PM",
    "03:00 PM", "04:00 PM", "05:00 PM", "06:00 PM",
  ];

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
        setAlerta({
          mostrar: true,
          mensaje: "Error al obtener el token CSRF",
          tipo: "error",
        });
      }
    };
    obtenerTokenCSRF();
  }, []);

  const axiosInstance = axios.create({
    baseURL: "http://localhost:4000/api",
    withCredentials: true,
  });

  const inputStyle = {
    "& .MuiOutlinedInput-root": {
      borderRadius: "12px",
      backgroundColor: "#fff",
      fontFamily: "'Poppins', sans-serif",
      height: "56px",
      transition: "all 0.3s ease-in-out",
      "&:hover fieldset": { borderColor: "#78c1c8" },
      "&.Mui-focused fieldset": { borderColor: "#006d77", borderWidth: "2px" },
    },
    "& .MuiInputLabel-root": {
      fontFamily: "'Poppins', sans-serif",
      color: "#03445e",
      "&.Mui-focused": { color: "#006d77" },
    },
  };

  const selectStyle = {
    borderRadius: "12px",
    backgroundColor: "#fff",
    fontFamily: "'Poppins', sans-serif",
    height: "56px",
    "& .MuiOutlinedInput-notchedOutline": {
      borderColor: "#d2f4ea",
    },
    "&:hover .MuiOutlinedInput-notchedOutline": {
      borderColor: "#78c1c8",
    },
    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
      borderColor: "#006d77",
      borderWidth: "2px",
    },
  };

  const menuItemStyle = {
    fontFamily: "'Poppins', sans-serif",
    padding: "12px 20px",
    borderBottom: "1px solid #e0f7fa",
    transition: "all 0.3s ease-in-out",
    "&:hover": {
      backgroundColor: "#78c1c8",
      color: "#fff",
      boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
    },
  };

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
    setFechaSeleccionada(null);
    setHoraSeleccionada("");
  };

  const handleCloseAgendar = () => {
    setOpenAgendar(false);
  };

  const fetchCitasOcupadas = async () => {
    if (!csrfToken) return;
    try {
      const response = await axiosInstance.get("/citas/activas", {
        headers: { "X-XSRF-TOKEN": csrfToken },
      });
      const citasConHoraFormateada = response.data.map(cita => {
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
      console.error("Error al obtener citas ocupadas:", error);
      setAlerta({
        mostrar: true,
        mensaje: "Error al cargar las citas ocupadas",
        tipo: "error",
      });
    }
  };

  useEffect(() => {
    if (fechaSeleccionada && csrfToken) {
      fetchCitasOcupadas();
    }
  }, [fechaSeleccionada, csrfToken]);

  useEffect(() => {
    if (fechaSeleccionada) {
      const fechaFormateada = fechaSeleccionada.toISOString().split("T")[0];
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
  }, [fechaSeleccionada, citasOcupadas]);

  const actualizarCita = async () => {
    const proximaCitaId = obtenerProximaCitaId();
    if (!proximaCitaId || !fechaSeleccionada || !horaSeleccionada) {
      setAlerta({
        mostrar: true,
        mensaje: "⚠️ No se puede agendar la cita. Verifica los datos.",
        tipo: "warning",
      });
      return;
    }

    const selectedHourObj = horasDisponibles.find(h => h.value === horaSeleccionada);
    if (selectedHourObj.isOccupied) {
      setAlerta({
        mostrar: true,
        mensaje: "Esta hora ya está ocupada. Por favor, selecciona otra.",
        tipo: "error",
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

    try {
      const response = await axiosInstance.put(
        `/citas/actualizar/${proximaCitaId}`,
        { fechaHora: fechaHoraUTC.toISOString() },
        { headers: { "X-XSRF-TOKEN": csrfToken } }
      );

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
                  .length,
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
    const obtenerDatos = async () => {
      if (!csrfToken) return;
      try {
        const { data: tratamientos } = await axiosInstance.get("/tratamientos-pacientes/en-progreso", {
          headers: { "X-XSRF-TOKEN": csrfToken },
        });

        if (tratamientos.length === 0) {
          setTratamientos([]);
          return;
        }

        const peticionesCitas = tratamientos.map((tratamiento) =>
          axiosInstance
            .get(`/citas/tratamiento/${tratamiento.id}`, {
              headers: { "X-XSRF-TOKEN": csrfToken },
            })
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
          return { ...tratamiento, citas_asistidas: citasAsistidas };
        });

        setTratamientos(tratamientosActualizados);
        setCitasPorTratamiento(citasMap);
      } catch (error) {
        console.error("Error al obtener tratamientos y citas", error);
        setTratamientos([]);
      }
    };

    if (csrfToken) {
      obtenerDatos();
    }
  }, [csrfToken]);

  const convertirHoraLocal = (fechaISO) => {
  if (!fechaISO) return "Sin asignar";
  
  // Crear un objeto Date a partir de la cadena ISO
  const fecha = new Date(fechaISO);
  
  // Extraer componentes de la fecha y hora manualmente
  const dia = fecha.getUTCDate();
  const mes = fecha.getUTCMonth() + 1; // Los meses son 0-based en JavaScript
  const anio = fecha.getUTCFullYear();
  let horas = fecha.getUTCHours();
  const minutos = fecha.getUTCMinutes().toString().padStart(2, "0");
  const periodo = horas >= 12 ? "PM" : "AM";
  
  // Convertir a formato de 12 horas
  horas = horas % 12 || 12;
  
  // Obtener el nombre del mes en español
  const meses = [
    "enero", "febrero", "marzo", "abril", "mayo", "junio",
    "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"
  ];
  const mesNombre = meses[mes - 1];

  // Formatear la fecha y hora manualmente
  return `${dia} de ${mesNombre} de ${anio}, ${horas}:${minutos} ${periodo}`;
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
    .sort((a, b) => new Date(b.fecha_hora) - new Date(a.fecha_hora))[0];

  const puedeAgendarCita = ultimaCitaConFecha
    ? ultimaCitaConFecha.estado === "completada" && ultimaCitaConFecha.pagada === 1
    : false;

  const obtenerProximaCitaId = () => {
    const proximaCita = citas.find((cita) => cita.fecha_hora === null && cita.estado === "pendiente");
    return proximaCita ? proximaCita.id : null;
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

  // Filtrar tratamientos según el término de búsqueda
  const filteredTratamientos = tratamientos.filter((tratamiento) =>
    `${tratamiento.nombre} ${tratamiento.apellido_paterno} ${tratamiento.apellido_materno}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  // Paginación de tratamientos
  const totalTratamientosPaginas = Math.ceil(filteredTratamientos.length / tratamientosPorPagina);
  const tratamientosPaginados = filteredTratamientos.slice(
    (tratamientosPage - 1) * tratamientosPorPagina,
    tratamientosPage * tratamientosPorPagina
  );

  return (
    <Box sx={{ p: 3, fontFamily: "'Poppins', sans-serif" }}>
      {/* Controles de búsqueda y paginación */}
      <Box sx={{ mb: 3, display: "flex", gap: 2, alignItems: "center", flexWrap: "wrap" }}>
        <TextField
          label="Buscar paciente"
          variant="outlined"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setTratamientosPage(1); // Reiniciar a la primera página al buscar
          }}
          sx={{
            flex: 1,
            minWidth: 200,
            "& .MuiOutlinedInput-root": {
              borderRadius: "12px",
              "& fieldset": { borderColor: "#006d77" },
              "&:hover fieldset": { borderColor: "#005c66" },
              "&.Mui-focused fieldset": { borderColor: "#006d77", borderWidth: "2px" },
            },
            "& .MuiInputLabel-root": {
              color: "#03445e",
              "&.Mui-focused": { color: "#006d77" },
            },
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: "#006d77" }} />
              </InputAdornment>
            ),
            sx: { color: "#006d77", fontFamily: "'Poppins', sans-serif" },
          }}
        />
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Tooltip title="Página anterior">
            <IconButton
              onClick={() => setTratamientosPage((prev) => Math.max(prev - 1, 1))}
              disabled={tratamientosPage === 1}
              sx={{
                color: tratamientosPage === 1 ? "#b0bec5" : "#006d77",
                "&:hover": { backgroundColor: "#e0f7fa" },
              }}
            >
              <ArrowBack />
            </IconButton>
          </Tooltip>
          <Typography sx={{ fontWeight: "bold", fontSize: 14, color: "#006d77" }}>
            Página {tratamientosPage} de {totalTratamientosPaginas}
          </Typography>
          <Tooltip title="Página siguiente">
            <IconButton
              onClick={() => setTratamientosPage((prev) => Math.min(prev + 1, totalTratamientosPaginas))}
              disabled={tratamientosPage === totalTratamientosPaginas}
              sx={{
                color: tratamientosPage === totalTratamientosPaginas ? "#b0bec5" : "#006d77",
                "&:hover": { backgroundColor: "#e0f7fa" },
              }}
            >
              <ArrowForward />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {filteredTratamientos.length === 0 ? (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "70vh",
            backgroundColor: "#ffffff",
            borderRadius: "16px",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)",
            border: "1px solid #78c1c8",
          }}
        >
          <Typography
            variant="h5"
            sx={{
              fontFamily: "'Poppins', sans-serif",
              color: "#03445e",
              fontWeight: 500,
              textAlign: "center",
            }}
          >
            No hay tratamientos en progreso.
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {tratamientosPaginados.map((tratamiento, index) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={tratamiento.id}>
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: "easeOut", delay: index * 0.1 }}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                style={{ cursor: "pointer" }}
              >
                <Card
                  sx={{
                    borderRadius: 12,
                    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
                    p: 2,
                    background: "#ffffff",
                    border: "1px solid #e0f7fa",
                    transition: "transform 0.3s ease",
                    minHeight: 220,
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    "&:hover": { boxShadow: "0 6px 16px rgba(0, 109, 119, 0.2)" },
                  }}
                  onClick={() => handleOpenDialog(tratamiento)}
                >
                  <CardContent>
                    <Box sx={{ mb: 2, textAlign: "center" }}>
                      <Avatar sx={{ bgcolor: "#e0f7fa", width: 40, height: 40, mx: "auto", mb: 1 }}>
                        <AssignmentTurnedIn sx={{ fontSize: 24, color: "#006d77" }} />
                      </Avatar>
                      <Typography
                        variant="subtitle1"
                        sx={{ fontWeight: "bold", color: "#006d77", textTransform: "uppercase" }}
                      >
                        {determinarTipoCita(tratamiento)}
                      </Typography>
                    </Box>
                    <Box display="flex" alignItems="center" gap={2} mb={2}>
                      <Avatar sx={{ bgcolor: "#e0f7fa", width: 40, height: 40 }}>
                        <Person sx={{ fontSize: 24, color: "#006d77" }} />
                      </Avatar>
                      <Box>
                        <Typography
                          variant="h6"
                          sx={{ fontWeight: "bold", color: "#006d77", lineHeight: 1.2 }}
                        >
                          {`${(tratamiento.nombre || "").charAt(0).toUpperCase()}${(
                            tratamiento.nombre || ""
                          ).slice(1).toLowerCase()}`}
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{ color: "#78909c", fontStyle: "italic" }}
                        >
                          {`${(tratamiento.apellido_paterno || "").charAt(0).toUpperCase()}${(
                            tratamiento.apellido_paterno || ""
                          ).slice(1).toLowerCase()} ${(tratamiento.apellido_materno || "")
                            .charAt(0)
                            .toUpperCase()}${(
                            tratamiento.apellido_materno || ""
                          ).slice(1).toLowerCase()}`}
                        </Typography>
                        <Box
                          sx={{
                            display: "inline-flex",
                            alignItems: "center",
                            bgcolor: "#e0f7fa",
                            borderRadius: "50%",
                            px: 1.5,
                            py: 0.5,
                            mt: 0.5,
                          }}
                        >
                          <CalendarToday sx={{ fontSize: 16, color: "#006d77", mr: 0.5 }} />
                          <Typography variant="caption" sx={{ color: "#006d77" }}>
                            {tratamiento.edad} años
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                    <Box sx={{ mt: 2 }}>
                      <Typography
                        variant="body1"
                        sx={{ fontWeight: "bold", color: "#006d77", mb: 1 }}
                      >
                        Progreso de citas
                      </Typography>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          bgcolor: "#e0f7fa",
                          borderRadius: 8,
                          overflow: "hidden",
                          height: 10,
                        }}
                      >
                        <Box
                          sx={{
                            bgcolor: "#78c1c8",
                            height: "100%",
                            width: `${(tratamiento.citas_asistidas / tratamiento.citas_totales) * 100}%`,
                            transition: "width 0.3s ease",
                          }}
                        />
                      </Box>
                      <Typography
                        variant="body2"
                        sx={{ mt: 1, color: "#78909c", textAlign: "right" }}
                      >
                        <strong>{tratamiento.citas_asistidas}</strong> de {tratamiento.citas_totales}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>
          ))}
        </Grid>
      )}

      {selectedTratamiento && (
        <Dialog
          open={open}
          onClose={handleCloseDialog}
          fullWidth
          maxWidth="md"
          sx={{ "& .MuiDialog-paper": { height: "650px", borderRadius: 12, boxShadow: "0 6px 20px rgba(0, 0, 0, 0.1)" } }}
        >
          <DialogTitle
            sx={{
              fontWeight: "bold",
              textAlign: "center",
              backgroundColor: "#006d77",
              color: "#ffffff",
              borderTopLeftRadius: 12,
              borderTopRightRadius: 12,
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
              p: 3,
              pt: 4,
              backgroundColor: "#fafafa",
            }}
          >
            <TableContainer
              component={Paper}
              sx={{
                borderRadius: 12,
                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)",
                border: "1px solid #e0f7fa",
                mt: 2,
              }}
            >
              <Table sx={{ minWidth: 650 }}>
                <TableHead>
                  <TableRow sx={{ backgroundColor: "#e0f7fa", borderBottom: "2px solid #78c1c8" }}>
                    <TableCell
                      sx={{ fontWeight: "bold", textAlign: "center", color: "#006d77", fontSize: "1.1rem", py: 2.5 }}
                    >
                      #
                    </TableCell>
                    <TableCell
                      sx={{ fontWeight: "bold", textAlign: "center", color: "#006d77", fontSize: "1.1rem", py: 2.5 }}
                    >
                      Fecha
                    </TableCell>
                    <TableCell
                      sx={{ fontWeight: "bold", textAlign: "center", color: "#006d77", fontSize: "1.1rem", py: 2.5 }}
                    >
                      Estado Cita
                    </TableCell>
                    <TableCell
                      sx={{ fontWeight: "bold", textAlign: "center", color: "#006d77", fontSize: "1.1rem", py: 2.5 }}
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
                          backgroundColor: index % 2 === 0 ? "#ffffff" : "#f5f5f5",
                          "&:hover": { backgroundColor: "#e0f7fa" },
                          transition: "background-color 0.3s ease",
                          borderRadius: 8,
                          height: "65px",
                        }}
                      >
                        <TableCell
                          sx={{ textAlign: "center", fontWeight: "medium", color: "#455a64", fontSize: "1rem", py: 2 }}
                        >
                          {index + 1 + currentPage * citasPorPagina}
                        </TableCell>
                        <TableCell sx={{ textAlign: "center", fontSize: "1rem", color: "#455a64", py: 2 }}>
                          {cita.fecha_hora ? convertirHoraLocal(cita.fecha_hora) : "Sin Asignar"}
                        </TableCell>
                        <TableCell sx={{ textAlign: "center", py: 2 }}>
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
                                fontSize: "1rem",
                                fontWeight: "medium",
                                color: cita.estado === "pendiente" ? "#ff9800" : "#4caf50",
                                bgcolor: cita.estado === "pendiente" ? "#fff3e0" : "#e8f5e9",
                                borderRadius: 12,
                                px: 1.5,
                                py: 0.5,
                              }}
                            >
                              {cita.estado}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell sx={{ textAlign: "center", py: 2 }}>
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
                                sx={{ fontSize: 18, color: cita.pagada ? "#4caf50" : "#f44336" }}
                              />
                            </Box>
                            <Typography
                              sx={{
                                fontSize: "1rem",
                                fontWeight: "medium",
                                color: cita.pagada ? "#4caf50" : "#f44336",
                                bgcolor: cita.pagada ? "#e8f5e9" : "#ffebee",
                                borderRadius: 12,
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
                        sx={{ textAlign: "center", fontStyle: "italic", color: "#78909c", py: 4 }}
                      >
                        No hay citas registradas.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
            <Box display="flex" justifyContent="center" alignItems="center" gap={2} sx={{ mt: 3, mb: 2 }}>
              <Tooltip title="Navegar a la página anterior">
                <IconButton
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 0))}
                  disabled={currentPage === 0}
                  sx={{
                    color: currentPage === 0 ? "#b0bec5" : "#006d77",
                    "&:hover": { backgroundColor: "#e0f7fa" },
                  }}
                >
                  <ArrowBack />
                </IconButton>
              </Tooltip>
              <Typography sx={{ fontWeight: "bold", fontSize: 14, color: "#006d77" }}>
                Página {currentPage + 1} de {totalPaginas}
              </Typography>
              <Tooltip title="Navegar a la página siguiente">
                <IconButton
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPaginas - 1))}
                  disabled={currentPage === totalPaginas - 1}
                  sx={{
                    color: currentPage === totalPaginas - 1 ? "#b0bec5" : "#006d77",
                    "&:hover": { backgroundColor: "#e0f7fa" },
                  }}
                >
                  <ArrowForward />
                </IconButton>
              </Tooltip>
            </Box>
          </DialogContent>
          <DialogActions
            sx={{
              backgroundColor: "#fafafa",
              borderBottomLeftRadius: 12,
              borderBottomRightRadius: 12,
              display: "flex",
              justifyContent: "center",
              gap: 2,
            }}
          >
            <Button
              onClick={() => {
                const proximaCitaId = obtenerProximaCitaId();
                if (proximaCitaId) {
                  handleOpenAgendar();
                }
              }}
              disabled={!puedeAgendarCita}
              variant="contained"
              startIcon={<AddCircleOutline />}
              sx={{
                backgroundColor: puedeAgendarCita ? "#006d77" : "#b0bec5",
                color: "#e0f7fa",
                padding: "12px 40px",
                borderRadius: "12px",
                fontFamily: "'Poppins', sans-serif",
                fontWeight: 600,
                "&:hover": { backgroundColor: puedeAgendarCita ? "#78c1c8" : "#b0bec5", transform: "translateY(-2px)" },
                transition: "all 0.3s ease-in-out",
              }}
            >
              Agendar Próxima Cita
            </Button>
            <Button
              onClick={handleCloseDialog}
              variant="contained"
              startIcon={<Close />}
              sx={{
                backgroundColor: "#f44336",
                color: "#ffffff",
                padding: "12px 40px",
                borderRadius: "12px",
                fontFamily: "'Poppins', sans-serif",
                fontWeight: 600,
                "&:hover": { backgroundColor: "#d32f2f", transform: "translateY(-2px)" },
                transition: "all 0.3s ease-in-out",
              }}
            >
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
            backgroundColor: "#006d77",
            color: "#ffffff",
            borderTopLeftRadius: 12,
            borderTopRightRadius: 12,
            boxShadow: "0px 3px 10px rgba(0, 0, 0, 0.1)",
          }}
        >
          Seleccionar Fecha y Hora
        </DialogTitle>
        <DialogContent
          sx={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "24px", backgroundColor: "#ffffff" }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            style={{ padding: "24px", borderRadius: "12px", boxShadow: "0px 4px 15px rgba(0, 0, 0, 0.05)", width: "100%" }}
          >
            <Box sx={{ mb: 3 }}>
              <Typography sx={{ mb: 1, color: "#03445e", fontWeight: 600, fontFamily: "'Poppins', sans-serif" }}>
                Fecha
              </Typography>
              <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
                <DatePicker
                  label="Selecciona la Fecha"
                  value={fechaSeleccionada}
                  onChange={(newValue) => setFechaSeleccionada(newValue)}
                  minDate={obtenerUltimaFechaCita() || new Date()}
                  renderInput={(params) => <TextField {...params} fullWidth sx={inputStyle} />}
                  disablePast
                  shouldDisableDate={(date) => ![1, 2, 3, 6].includes(date.getDay())}
                />
              </LocalizationProvider>
              <Typography sx={{ mt: 1, color: "#d32f2f", fontFamily: "'Poppins', sans-serif" }}>
                Solo se pueden agendar citas en: Lunes, Martes, Miércoles y Sábado.
              </Typography>
            </Box>
            <FormControl fullWidth>
              <Typography sx={{ mb: 1, color: "#03445e", fontWeight: 600, fontFamily: "'Poppins', sans-serif" }}>
                Hora
              </Typography>
              <Select
                value={horaSeleccionada}
                onChange={(e) => setHoraSeleccionada(e.target.value)}
                displayEmpty
                startAdornment={
                  <InputAdornment position="start">
                    <AccessTimeIcon sx={{ color: "#006d77", fontSize: 20 }} />
                  </InputAdornment>
                }
                sx={selectStyle}
                disabled={!fechaSeleccionada}
                MenuProps={{
                  PaperProps: {
                    sx: {
                      borderRadius: "12px",
                      boxShadow: "0 4px 16px rgba(0, 0, 0, 0.15)",
                      backgroundColor: "#fff",
                    },
                  },
                }}
              >
                <MenuItem value="" disabled sx={menuItemStyle}>
                  Selecciona una hora
                </MenuItem>
                {horasDisponibles.map((horaObj, index) => (
                  <MenuItem
                    key={index}
                    value={horaObj.value}
                    disabled={horaObj.isOccupied}
                    sx={{
                      ...menuItemStyle,
                      color: horaObj.isOccupied ? "#d32f2f" : "inherit",
                      fontStyle: horaObj.isOccupied ? "italic" : "normal",
                    }}
                  >
                    {horaObj.value} {horaObj.isOccupied && "(Ocupada)"}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </motion.div>
        </DialogContent>
        <DialogActions
          sx={{
            display: "flex",
            justifyContent: "center",
            padding: "24px",
            backgroundColor: "#ffffff",
            borderBottomLeftRadius: 12,
            borderBottomRightRadius: 12,
          }}
        >
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              onClick={handleCloseAgendar}
              variant="outlined"
              sx={{
                color: "#006d77",
                borderColor: "#78c1c8",
                fontWeight: "bold",
                textTransform: "none",
                height: "48px",
                width: "120px",
                padding: "12px 40px",
                borderRadius: "12px",
                fontFamily: "'Poppins', sans-serif",
                "&:hover": { backgroundColor: "#e0f7fa", borderColor: "#006d77" },
                transition: "all 0.3s ease-in-out",
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
                height: "48px",
                width: "150px",
                borderRadius: "12px",
                textTransform: "none",
                backgroundColor: "#78c1c8",
                color: "#ffffff",
                padding: "12px 40px",
                fontFamily: "'Poppins', sans-serif",
                "&:hover": { backgroundColor: "#006d77", transform: "translateY(-2px)" },
                transition: "all 0.3s ease-in-out",
              }}
            >
              Confirmar Cita
            </Button>
          </motion.div>
        </DialogActions>
      </Dialog>

      {alerta.mostrar && (
        <Box sx={{ position: "fixed", bottom: 20, left: 20, zIndex: 2000, width: "auto", maxWidth: "400px" }}>
          <Alert
            severity={alerta.tipo}
            variant="filled"
            sx={{
              width: "100%",
              backgroundColor:
                alerta.tipo === "success" ? "#e8f5e9" : alerta.tipo === "error" ? "#ffebee" : "#fff3e0",
              color: alerta.tipo === "success" ? "#4caf50" : alerta.tipo === "error" ? "#f44336" : "#ff9800",
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