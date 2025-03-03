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
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, InputAdornment, FormControl, Select, MenuItem, TextField
} from "@mui/material";
import { Person, CalendarToday, AssignmentTurnedIn, ErrorOutline, ArrowBack, ArrowForward, MonetizationOn } from "@mui/icons-material";
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
  const [openAgendar, setOpenAgendar] = useState(false); // Estado para abrir el formulario
  const [fechaSeleccionada, setFechaSeleccionada] = useState(null);
  const [horaSeleccionada, setHoraSeleccionada] = useState("");
  const [citasOcupadas, setCitasOcupadas] = useState([]);
  const [citasPorTratamiento, setCitasPorTratamiento] = useState({}); // 🔹 Estado para almacenar citas

  const disponibilidad = [
    "09:00 AM", "10:00 AM", "11:00 AM", "12:00 PM", "01:00 PM",
    "03:00 PM", "04:00 PM", "05:00 PM", "06:00 PM"
  ];
  const [alerta, setAlerta] = useState({ mostrar: false, mensaje: "", tipo: "" });
  useEffect(() => {
    if (alerta.mostrar) {
      const timer = setTimeout(() => {
        setAlerta({ mostrar: false, mensaje: "", tipo: "" });
      }, 3000); // 🔹 La alerta se oculta después de 3 segundos

      return () => clearTimeout(timer); // 🔹 Limpia el timer al desmontar
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
  
    // Convertir la fecha seleccionada a formato 'YYYY-MM-DD'
    const fechaSeleccionadaStr = fechaSeleccionada.toISOString().split('T')[0];
  
    // Convertir la hora seleccionada correctamente
    const [hora, minutos] = horaSeleccionada.replace(/( AM| PM)/, '').split(':').map(Number);
    const esPM = horaSeleccionada.includes('PM');
  
    let horaFinal = esPM && hora !== 12 ? hora + 12 : hora;
    if (!esPM && hora === 12) horaFinal = 0; // Convertir 12 AM a 00:00
  
    // Crear la fecha completa con la hora seleccionada en zona horaria local (México)
    const fechaHoraLocal = new Date(`${fechaSeleccionadaStr}T${horaFinal.toString().padStart(2, '0')}:${minutos.toString().padStart(2, '0')}:00`);
  
    // Convertir la fecha local a UTC antes de enviarla al backend
    const fechaHoraUTC = new Date(fechaHoraLocal.getTime() - fechaHoraLocal.getTimezoneOffset() * 60000);
  
    console.log("📌 Enviando actualización de cita con ID:", proximaCitaId);
    console.log("🕒 Nueva fecha y hora en UTC:", fechaHoraUTC.toISOString());
  
    try {
      const response = await axios.put(`http://localhost:4000/api/citas/actualizar/${proximaCitaId}`, {
        fechaHora: fechaHoraUTC.toISOString(),
      });
  
      console.log("✅ Cita actualizada con éxito:", response.data);
  
      // 🔹 Actualizar el estado de citas localmente
   setCitas(prevCitas => (prevCitas || []).map(cita =>
  cita.id === proximaCitaId
    ? { ...cita, fecha_hora: fechaHoraUTC.toISOString(), estado: "pendiente" }
    : cita
));

  
      // 🔹 También actualizamos citasPorTratamiento
      setCitasPorTratamiento(prevCitas => ({
        ...prevCitas,
        [selectedTratamiento.id]: (prevCitas[selectedTratamiento.id] || []).map(cita =>
          cita.id === proximaCitaId
            ? { ...cita, fecha_hora: fechaHoraUTC.toISOString(), estado: "pendiente" }
            : cita
        )
      }));
      
  
      // 🔹 Recalcular citas asistidas en tratamientos
      setTratamientos(prevTratamientos =>
        prevTratamientos.map(tratamiento =>
          tratamiento.id === selectedTratamiento.id
            ? {
                ...tratamiento,
                citas_asistidas: (citasPorTratamiento[selectedTratamiento.id] || []).filter(cita =>
                  cita.estado === "completada" && cita.pagada === 1 && cita.fecha_hora !== null
                ).length + 1 // Incrementamos la cuenta si la cita está confirmada
              }
            : tratamiento
        )
      );
      
  
      // 🔔 Mostrar alerta de éxito
      setAlerta({
        mostrar: true,
        mensaje: "La cita ha sido agendada exitosamente.",
        tipo: "success",
      });
  
      setOpenAgendar(false); // Cerrar el modal después de actualizar
  
    } catch (error) {
      console.error("❌ Error al actualizar la cita:", error);
  
      // 🔔 Mostrar alerta de error
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
        // 1️⃣ Obtener todos los tratamientos
        const { data: tratamientos } = await axios.get("http://localhost:4000/api/tratamientos-pacientes/en-progreso");

        if (tratamientos.length === 0) return;

        // 2️⃣ Obtener todas las citas en paralelo (pero almacenarlas globalmente)
        const peticionesCitas = tratamientos.map(tratamiento =>
          axios.get(`http://localhost:4000/api/citas/tratamiento/${tratamiento.id}`)
            .then(response => ({
              id: tratamiento.id,
              citas: response.data
            }))
            .catch(error => {
              console.error(`Error al obtener citas para el tratamiento ${tratamiento.id}`, error);
              return { id: tratamiento.id, citas: [] };
            })
        );

        const citasObtenidas = await Promise.all(peticionesCitas);

        // 3️⃣ Crear un diccionario {tratamientoId: citas[]}
        const citasMap = {};
        citasObtenidas.forEach(({ id, citas }) => {
          citasMap[id] = citas;
        });

        // 4️⃣ Fusionar los tratamientos con el conteo de citas asistidas
        const tratamientosActualizados = tratamientos.map(tratamiento => {
          const citas = citasMap[tratamiento.id] || [];
          const citasAsistidas = citas.filter(cita =>
            cita.estado === "completada" && cita.pagada === 1 && cita.fecha_hora !== null
          ).length;

          return {
            ...tratamiento,
            citas_asistidas: citasAsistidas, // ✅ Se actualiza el conteo sin peticiones extra
          };
        });

        // 5️⃣ Guardamos todo en el estado
        setTratamientos(tratamientosActualizados);
        setCitasPorTratamiento(citasMap); // 🔹 Guardamos las citas para reutilizarlas

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
    setCitas(citasPorTratamiento[tratamiento.id] || []); // 🔹 Reutilizamos citas ya obtenidas
    setOpen(true);
  };

  const handleCloseDialog = () => {
    setOpen(false);
    setCitas([]);
  };

  // Paginación
  const totalPaginas = Math.ceil(citas.length / citasPorPagina);
  const citasPaginadas = citas.slice(currentPage * citasPorPagina, (currentPage + 1) * citasPorPagina);
  /* Verificar si la última cita con fecha está "completada" y "pagada" */
  const ultimaCitaConFecha = citas
    .filter(cita => cita.fecha_hora) // Filtrar solo citas con fecha asignada
    .pop(); // Obtener la última cita con fecha

  const puedeAgendarCita = ultimaCitaConFecha
    ? ultimaCitaConFecha.estado === "completada" && ultimaCitaConFecha.pagada === 1
    : false;
  const obtenerProximaCitaId = () => {
    const proximaCita = citas.find(cita => cita.fecha_hora === null && cita.estado === "pendiente");

    if (proximaCita) {
      console.log("📌 ID de la próxima cita pendiente:", proximaCita.id);
      return proximaCita.id;
    } else {
      console.log("⚠️ No hay citas pendientes disponibles.");
      return null;
    }
  };

  return (
    <Box sx={{ p: 3 }}>
  <Grid container spacing={3}>
    {tratamientos.map((tratamiento, index) => (
      <Grid item xs={12} sm={6} md={3} lg={3} key={tratamiento.id}>
        <motion.div
          initial={{ opacity: 0, y: 30 }} // 🔹 Inicia invisible y desplazado hacia abajo
          animate={{ opacity: 1, y: 0 }} // 🔹 Se vuelve visible y regresa a su posición normal
          transition={{
            duration: 0.5,
            ease: "easeOut",
            delay: index * 0.1, // 🔹 Pequeño delay para cada tarjeta en secuencia
          }}
          whileHover={{ scale: 1.03 }} // 🔹 Efecto hover
          whileTap={{ scale: 0.98 }}
          style={{ cursor: "pointer" }}
        >
          <Card
            sx={{
              borderRadius: 4,
              boxShadow: 4,
              p: 2,
              backgroundColor: "background.paper",
              transition: "0.3s",
              "&:hover": { boxShadow: 8 },
              minHeight: 180,
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
            }}
            onClick={() => handleOpenDialog(tratamiento)}
          >
            <CardContent>
              <Box display="flex" alignItems="center" gap={2} mb={1}>
                <Avatar sx={{ bgcolor: "primary.main" }}>
                  <AssignmentTurnedIn />
                </Avatar>
                <Typography variant="h6" sx={{ fontWeight: "bold", color: "primary.main" }}>
                  {tratamiento.tratamiento}
                </Typography>
              </Box>

              <Stack direction="row" spacing={2} justifyContent="space-between" alignItems="center">
                <Box display="flex" alignItems="center" gap={1}>
                  <Person sx={{ fontSize: 20, color: "text.secondary" }} />
                  <Typography sx={{ fontSize: 14, color: "text.secondary" }}>
                    {`${(tratamiento.nombre || "").charAt(0).toUpperCase() + (tratamiento.nombre || "").slice(1).toLowerCase()} 
                      ${(tratamiento.apellido_paterno || "").charAt(0).toUpperCase() + (tratamiento.apellido_paterno || "").slice(1).toLowerCase()} 
                      ${(tratamiento.apellido_materno || "").charAt(0).toUpperCase() + (tratamiento.apellido_materno || "").slice(1).toLowerCase()}`.trim()}
                  </Typography>
                </Box>

                <Box display="flex" alignItems="center" gap={1}>
                  <CalendarToday sx={{ fontSize: 18, color: "text.secondary" }} />
                  <Typography sx={{ fontSize: 14, color: "text.secondary" }}>
                    {tratamiento.edad} años
                  </Typography>
                </Box>
              </Stack>

              <Box display="flex" alignItems="center" gap={1} mt={1}>
                <AssignmentTurnedIn sx={{ fontSize: 20, color: "success.main" }} />
                <Typography sx={{ fontSize: 14, color: "success.main" }}>
                  Citas: <strong>{tratamiento.citas_asistidas}/{tratamiento.citas_totales}</strong>
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
              backgroundColor: "primary.main",
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
            }}
          >
            <TableContainer component={Paper} sx={{ borderRadius: 2, boxShadow: 3 }}>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: "#e0e0e0" }}>
                    <TableCell sx={{ fontWeight: "bold", textAlign: "center", width: "10%" }}>#</TableCell>
                    <TableCell sx={{ fontWeight: "bold", textAlign: "center", width: "30%" }}>Fecha</TableCell>
                    <TableCell sx={{ fontWeight: "bold", textAlign: "center", width: "30%" }}>Estado Cita</TableCell>
                    <TableCell sx={{ fontWeight: "bold", textAlign: "center", width: "30%" }}>Estado Pago</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {citasPaginadas.length > 0 ? (
                    citasPaginadas.map((cita, index) => (
                      <TableRow
                        key={index}
                        sx={{
                          "&:nth-of-type(odd)": { backgroundColor: "#f5f5f5" },
                          "&:hover": { backgroundColor: "#e3f2fd" },
                          height: "60px", // Se asegura que todas las filas tengan la misma altura
                        }}
                      >
                        {/* Enumeración */}
                        <TableCell sx={{ textAlign: "center", fontWeight: "bold", color: "gray" }}>
                          {index + 1 + currentPage * 5}
                        </TableCell>

                        {/* Columna Fecha */}
                        <TableCell sx={{ textAlign: "center" }}>
                          {cita.fecha_hora ? convertirHoraLocal(cita.fecha_hora) : "Sin Asignar"}
                        </TableCell>

                        {/* Columna Estado Cita */}
                        <TableCell sx={{ textAlign: "center" }}>
                          <Box display="flex" justifyContent="center" alignItems="center" gap={1}>
                            {cita.estado === "pendiente" ? (
                              <ErrorOutline sx={{ color: "warning.main" }} />
                            ) : (
                              <AssignmentTurnedIn sx={{ color: "success.main" }} />
                            )}
                            <Typography sx={{ fontSize: 14, fontWeight: "bold", color: cita.estado === "pendiente" ? "warning.main" : "success.main" }}>
                              {cita.estado}
                            </Typography>
                          </Box>
                        </TableCell>

                        {/* Columna Estado Pago */}
                        <TableCell sx={{ textAlign: "center" }}>
                          <Box display="flex" justifyContent="center" alignItems="center" gap={1}>
                            <MonetizationOn sx={{ color: cita.pagada ? "success.main" : "error.main" }} />
                            <Typography sx={{ fontSize: 14, fontWeight: "bold", color: cita.pagada ? "success.main" : "error.main" }}>
                              {cita.pagada ? "Pagada" : "No Pagada"}
                            </Typography>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} sx={{ textAlign: "center", fontStyle: "italic", color: "text.secondary" }}>
                        No hay citas registradas.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            {/* Botón Agendar Próxima Cita */}
            <Box display="flex" justifyContent="center" sx={{ mt: 2 }}>
              <Button
                variant="contained"
                color="primary"
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
                }}
              >
                Agendar Próxima Cita
              </Button>
            </Box>



            {/* Paginación SIEMPRE en la parte inferior */}
            <Box display="flex" justifyContent="center" alignItems="center" sx={{ py: 2 }}>
              <IconButton
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 0))}
                disabled={currentPage === 0}
                sx={{
                  color: currentPage === 0 ? "gray" : "primary.main",
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
                  color: currentPage === totalPaginas - 1 ? "gray" : "primary.main",
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
            backgroundColor: "#0077b6",
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
          {/* Tarjeta envolvente con animación */}
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
            {/* Selector de Fecha */}
            <LocalizationProvider dateAdapter={AdapterDateFns} locale={es}>
              <DatePicker
                label="Selecciona la Fecha"
                value={fechaSeleccionada}
                onChange={(newValue) => setFechaSeleccionada(newValue)}
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

            {/* Selector de Hora */}
            <FormControl fullWidth sx={{ mt: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: "bold", color: "#0077b6", textAlign: "center" }}>
                Horario Disponible
              </Typography>
              <Select
                value={horaSeleccionada}
                onChange={(e) => setHoraSeleccionada(e.target.value)}
                displayEmpty
                startAdornment={
                  <InputAdornment position="start">
                    <AccessTimeIcon color="primary" />
                  </InputAdornment>
                }
                sx={{
                  borderRadius: "10px",
                  backgroundColor: "#e6f7ff",
                  height: "50px",
                  textAlign: "center",
                }}
                disabled={!fechaSeleccionada || obtenerHorasDisponibles(fechaSeleccionada, citasOcupadas, disponibilidad).length === 0}
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

        {/* Botones de acción */}
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
                color: "#0077b6",
                borderColor: "#0077b6",
                fontWeight: "bold",
                textTransform: "none",
                height: "45px",
                width: "120px",
                "&:hover": {
                  backgroundColor: "#e6f7ff",
                  borderColor: "#005f8a",
                },
              }}
            >
              Cancelar
            </Button>
          </motion.div>

          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              variant="contained"
              color="primary"
              onClick={actualizarCita} // ⬅️ Llamamos la función aquí
              sx={{
                fontWeight: "bold",
                height: "45px",
                width: "150px",
                borderRadius: "8px",
                textTransform: "none",
                backgroundColor: "#0077b6",
                "&:hover": {
                  backgroundColor: "#005f8a",
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
            severity={alerta.tipo} // Cambia el color y el icono según el tipo
            variant="filled"
            sx={{
              width: "100%",
              backgroundColor:
                alerta.tipo === "success" ? "#DFF6DD" :
                  alerta.tipo === "error" ? "#F8D7DA" :
                    alerta.tipo === "warning" ? "#FFF3CD" :
                      "#D1ECF1", // Default: Info
              color:
                alerta.tipo === "success" ? "#1E4620" :
                  alerta.tipo === "error" ? "#721C24" :
                    alerta.tipo === "warning" ? "#856404" :
                      "#0C5460", // Default: Info
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
