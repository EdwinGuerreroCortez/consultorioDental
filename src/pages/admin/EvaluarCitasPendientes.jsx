import React, { useState, useEffect } from "react";
import axios from "axios";
import {
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
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper 
} from "@mui/material";
import { Person, CalendarToday, AssignmentTurnedIn, ErrorOutline, ArrowBack, ArrowForward, MonetizationOn } from "@mui/icons-material";
import { motion } from "framer-motion";

export default function EvaluarCitasPendientes() {
  const [tratamientos, setTratamientos] = useState([]);
  const [selectedTratamiento, setSelectedTratamiento] = useState(null);
  const [citas, setCitas] = useState([]);
  const [open, setOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const citasPorPagina = 5;

  useEffect(() => {
    axios.get("http://localhost:4000/api/tratamientos-pacientes/en-progreso")
      .then(response => setTratamientos(response.data))
      .catch(error => console.error("Error al obtener los tratamientos en progreso", error));
  }, []);

  const convertirHoraLocal = (fechaISO) => {
    if (!fechaISO) return "Sin asignar";
    const fecha = new Date(fechaISO);
    return fecha.toLocaleString("es-MX", { timeZone: "America/Mexico_City" });
  };

  const handleOpenDialog = (tratamiento) => {
    setSelectedTratamiento(tratamiento);
    axios.get(`http://localhost:4000/api/citas/tratamiento/${tratamiento.id}`)
      .then(response => {
        setCitas(response.data);
        setCurrentPage(0); // Reiniciar la paginación al abrir el modal
        setOpen(true);
      })
      .catch(error => console.error("Error al obtener las citas del tratamiento", error));
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
  return (
    <Box sx={{ p: 3 }}>
      <Grid container spacing={3}>
        {tratamientos.map((tratamiento) => (
          <Grid item xs={12} sm={6} md={3} lg={3} key={tratamiento.id}>
            <motion.div
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: "spring", stiffness: 120, damping: 10 }}
              onClick={() => handleOpenDialog(tratamiento)}
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
                        {tratamiento.nombre} {tratamiento.apellido_paterno}
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
          onClick={() => alert("Agendar próxima cita")}
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

    </Box>
  );
}
