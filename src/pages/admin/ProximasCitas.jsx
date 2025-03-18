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
} from "@mui/material";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import axios from "axios";
import EventIcon from "@mui/icons-material/Event";
import CloseIcon from "@mui/icons-material/Close";
import "./CalendarioEstilos.css"; // Importar estilos personalizados
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
import { obtenerCitasOcupadas, obtenerHorasDisponibles } from "../../utils/citas";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital"; // Ícono temático para consultorio dental

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

const ProximasCitas = () => {
    const [citas, setCitas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedCita, setSelectedCita] = useState(null);
    const [comentario, setComentario] = useState("");
    const [isConfirming, setIsConfirming] = useState(false);
    const [openReagendar, setOpenReagendar] = useState(false);
    const [nuevaFecha, setNuevaFecha] = useState(null);
    const [nuevaHora, setNuevaHora] = useState("");
    const [horasDisponibles, setHorasDisponibles] = useState([
        "09:00 AM",
        "10:00 AM",
        "11:00 AM",
        "12:00 PM",
        "01:00 PM",
        "03:00 PM",
        "04:00 PM",
        "05:00 PM",
        "06:00 PM",
    ]);
    const [citasOcupadas, setCitasOcupadas] = useState([]);

    const handleReagendar = () => {
        setOpenReagendar(true);
    };

    const handleConfirmReagendar = async () => {
        if (!nuevaFecha || !nuevaHora) {
            alert("Por favor, selecciona una fecha y hora.");
            return;
        }

        if (!(nuevaFecha instanceof Date) || isNaN(nuevaFecha)) {
            alert("La fecha seleccionada no es válida.");
            return;
        }

        const fechaFormateada = nuevaFecha.toISOString().split("T")[0];
        const [hora, minutos, periodo] = nuevaHora.match(/(\d+):(\d+)\s?(AM|PM)/i).slice(1);
        let hora24 = parseInt(hora, 10);

        if (periodo.toUpperCase() === "PM" && hora24 !== 12) {
            hora24 += 12;
        } else if (periodo.toUpperCase() === "AM" && hora24 === 12) {
            hora24 = 0;
        }

        const horaFormateada = `${hora24.toString().padStart(2, "0")}:${minutos}:00`;
        const nuevaFechaHora = `${fechaFormateada}T${horaFormateada}`;

        console.log(`📅 Intentando actualizar la cita ID: ${selectedCita.cita_id} con nueva fecha/hora: ${nuevaFechaHora}`);

        try {
            const csrfToken = obtenerTokenCSRF();
            const response = await axios.put(
                `http://localhost:4000/api/citas/actualizar-fecha-hora/${selectedCita.cita_id}`,
                { fechaHora: nuevaFechaHora },
                {
                    headers: { "X-XSRF-TOKEN": csrfToken },
                    withCredentials: true,
                }
            );

            console.log("✔️ Respuesta del servidor:", response.data);
            alert("Cita reagendada exitosamente.");
            fetchCitas();
            setOpenReagendar(false);
            setSelectedCita(null);
        } catch (error) {
            console.error("❌ Error al reagendar la cita:", error.response ? error.response.data : error);
            alert(error.response?.data?.mensaje || "Hubo un error al reagendar la cita. Verifica los datos.");
        }
    };

    const obtenerTokenCSRF = () => {
        const csrfToken = document.cookie
            .split("; ")
            .find((row) => row.startsWith("XSRF-TOKEN="))
            ?.split("=")[1];
        return csrfToken || "";
    };

    const fetchCitas = async () => {
        try {
            const response = await axios.get("http://localhost:4000/api/citas/proximas");
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
            const citasOcupadasData = await obtenerCitasOcupadas();
            setCitasOcupadas(citasOcupadasData);
        } catch (error) {
            console.error("Error al obtener las próximas citas", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCitas();
    }, []);

    const handleMarkAsCompleted = () => {
        setIsConfirming(true);
    };

    useEffect(() => {
        if (nuevaFecha) {
            setHorasDisponibles(obtenerHorasDisponibles(nuevaFecha, citasOcupadas));
        }
    }, [nuevaFecha, citasOcupadas]);

    const handleConfirmCompletion = async () => {
        if (!comentario.trim()) {
            alert("Por favor, ingresa un comentario.");
            return;
        }

        try {
            const csrfToken = obtenerTokenCSRF();
            const response = await axios.put(
                `http://localhost:4000/api/citas/completar/${selectedCita.cita_id}`,
                { comentario },
                {
                    headers: { "X-XSRF-TOKEN": csrfToken },
                    withCredentials: true,
                }
            );

            console.log("✔️ Respuesta del servidor:", response.data);
            alert("Cita marcada como completada.");
            fetchCitas();
            handleCloseDialog();
        } catch (error) {
            console.error("❌ Error al actualizar la cita:", error.response ? error.response.data : error);
            alert("Hubo un error al actualizar la cita.");
        }
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
        console.log("Cita seleccionada ID:", event.id);
        setSelectedCita(event.paciente);
        setComentario("");
        setIsConfirming(false);
    };

    const handleCloseDialog = () => {
        setSelectedCita(null);
    };

    return (
        <Box sx={{ padding: "1.5rem", minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", backgroundColor: "#f0f4f8" }}>
            {/* ENCABEZADO MEJORADO */}
            <Box
                sx={{
                    width: "100%",
                    maxWidth: "1100px",
                    background: "linear-gradient(135deg, #003087, #0077b6)", /* Gradiente azul marino */
                    borderRadius: "16px",
                    color: "#ffffff",
                    padding: "30px",
                    boxShadow: "0 8px 24px rgba(0, 0, 0, 0.15)",
                    textAlign: "left",
                    marginBottom: "2rem",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                }}
            >
                <Typography
                    variant="h4"
                    sx={{
                        fontWeight: "600",
                        fontFamily: "'Roboto', sans-serif",
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                    }}
                >
                    <LocalHospitalIcon fontSize="large" /> {/* Ícono temático de consultorio */}
                    Calendario de Citas - Consultorio Dental
                </Typography>
                <Button
                    variant="contained"
                    sx={{
                        backgroundColor: "#fff",
                        color: "#003087", /* Azul marino oscuro */
                        fontWeight: "bold",
                        textTransform: "none",
                        borderRadius: "8px",
                        "&:hover": { backgroundColor: "#e6f0fa" },
                    }}
                    onClick={fetchCitas}
                >
                    Actualizar
                </Button>
            </Box>

            {/* CALENDARIO MEJORADO */}
            <Box sx={{ flexGrow: 1, width: "100%", maxWidth: "1100px" }}>
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
                            style={{ height: 600, fontFamily: "'Roboto', sans-serif" }}
                            eventPropGetter={eventStyleGetter}
                            onSelectEvent={handleSelectEvent}
                            culture="es"
                            messages={messages}
                            formats={formats}
                            className="custom-calendar"
                        />
                    </Paper>
                )}
            </Box>

            {/* MODAL DE DETALLES MEJORADO */}
            <Dialog
                open={!!selectedCita}
                onClose={handleCloseDialog}
                sx={{
                    "& .MuiDialog-paper": {
                        borderRadius: "16px",
                        padding: "0",
                        maxWidth: "600px",
                        width: "100%",
                        boxShadow: "0 8px 24px rgba(0, 0, 0, 0.2)",
                        overflow: "hidden",
                    },
                }}
            >
                {/* ENCABEZADO DEL MODAL */}
                <DialogTitle
                    sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        backgroundColor: "#003087", /* Azul marino oscuro */
                        color: "white",
                        fontWeight: "600",
                        fontFamily: "'Roboto', sans-serif",
                        padding: "16px 24px",
                    }}
                >
                    <Box display="flex" alignItems="center" gap={1}>
                        <MedicalServicesIcon /> {/* Ícono temático */}
                        Detalles de la Cita - Consultorio Dental
                    </Box>
                    <IconButton onClick={handleCloseDialog} sx={{ color: "white" }}>
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>

                {/* CUERPO DEL MODAL */}
                <DialogContent
                    sx={{
                        padding: "24px",
                        backgroundColor: "#fff",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                    }}
                >
                    {selectedCita && !isConfirming && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                            style={{ width: "100%" }}
                        >
                            <Box sx={{ textAlign: "center", width: "100%", padding: 2 }}>
                                <Typography
                                    variant="h6"
                                    sx={{
                                        fontWeight: "600",
                                        color: "#003087", /* Azul marino oscuro */
                                        mb: 2,
                                        fontFamily: "'Roboto', sans-serif",
                                    }}
                                >
                                    {selectedCita.nombre} {selectedCita.apellido_paterno}
                                </Typography>

                                <Divider sx={{ my: 2, borderColor: "#e6f0fa" }} />

                                <Grid container spacing={3} alignItems="center">
                                    <Grid item xs={12} sm={6} display="flex" alignItems="center">
                                        <EventIcon sx={{ color: "#003087", mr: 1 }} />
                                        <Typography sx={{ fontSize: "16px", color: "#555" }}>
                                            <strong>Fecha:</strong><br />
                                            {new Date(selectedCita.fecha_hora).toLocaleDateString("es-ES")}
                                        </Typography>
                                    </Grid>

                                    <Grid item xs={12} sm={6} display="flex" alignItems="center">
                                        <AccessTimeIcon sx={{ color: "#003087", mr: 1 }} />
                                        <Typography sx={{ fontSize: "16px", color: "#555" }}>
                                            <strong>Hora:</strong><br />
                                            {new Date(selectedCita.fecha_hora).toLocaleTimeString("es-ES")}
                                        </Typography>
                                    </Grid>

                                    <Grid item xs={12} display="flex" alignItems="center">
                                        <MonetizationOnIcon
                                            sx={{ color: selectedCita.estado_pago === "Pagado" ? "#2E7D32" : "#D32F2F", mr: 1 }}
                                        />
                                        <Typography
                                            sx={{
                                                fontSize: "16px",
                                                color: selectedCita.estado_pago === "Pagado" ? "#2E7D32" : "#D32F2F",
                                                fontWeight: "bold",
                                            }}
                                        >
                                            <strong>Estado de pago:</strong> {selectedCita.estado_pago}
                                        </Typography>
                                    </Grid>

                                    <Grid item xs={12} sm={6} display="flex" alignItems="center">
                                        <EmailIcon sx={{ color: "#003087", mr: 1 }} />
                                        <Typography sx={{ fontSize: "16px", color: "#555" }}>
                                            <strong>Email:</strong><br />
                                            {selectedCita.email}
                                        </Typography>
                                    </Grid>

                                    <Grid item xs={12} sm={6} display="flex" alignItems="center">
                                        <PhoneIcon sx={{ color: "#003087", mr: 1 }} />
                                        <Typography sx={{ fontSize: "16px", color: "#555" }}>
                                            <strong>Teléfono:</strong><br />
                                            {selectedCita.telefono}
                                        </Typography>
                                    </Grid>

                                    <Grid item xs={12} display="flex" alignItems="center">
                                        <MedicalServicesIcon sx={{ color: "#003087", mr: 1 }} />
                                        <Typography
                                            sx={{
                                                fontSize: "16px",
                                                fontWeight: "bold",
                                                color: "#003087",
                                            }}
                                        >
                                            🦷 Tratamiento: {selectedCita.nombre_tratamiento}
                                        </Typography>
                                    </Grid>
                                </Grid>
                            </Box>
                        </motion.div>
                    )}

                    {isConfirming && (
                        <Grid container spacing={2} alignItems="center" justifyContent="center">
                            <Grid item xs={12}>
                                <Typography
                                    variant="subtitle1"
                                    sx={{
                                        fontWeight: "bold",
                                        color: "#003087", /* Azul marino oscuro */
                                        mb: 1,
                                        fontFamily: "'Roboto', sans-serif",
                                    }}
                                >
                                    Agregar Comentario:
                                </Typography>
                                <TextField
                                    value={comentario}
                                    onChange={(e) => setComentario(e.target.value)}
                                    placeholder="Escribe un comentario sobre la cita..."
                                    multiline
                                    rows={3}
                                    fullWidth
                                    variant="outlined"
                                    sx={{
                                        "& .MuiOutlinedInput-root": {
                                            borderRadius: "8px",
                                            backgroundColor: "#f0f4f8",
                                        },
                                    }}
                                />
                            </Grid>
                        </Grid>
                    )}
                </DialogContent>

                {/* BOTONES DE ACCIÓN MEJORADOS */}
                <DialogActions
                    sx={{
                        display: "flex",
                        justifyContent: "center",
                        gap: 2,
                        padding: "16px",
                        backgroundColor: "#f0f4f8",
                    }}
                >
                    {!isConfirming ? (
                        <>
                            {selectedCita && selectedCita.estado_cita !== "completada" && (
                                <Button
                                    variant="contained"
                                    onClick={handleReagendar}
                                    sx={{
                                        backgroundColor: "#ffa500",
                                        color: "white",
                                        fontWeight: "bold",
                                        textTransform: "none",
                                        borderRadius: "8px",
                                        padding: "8px 16px",
                                        "&:hover": { backgroundColor: "#ff8c00" },
                                    }}
                                >
                                    Reagendar
                                </Button>
                            )}

                            {selectedCita && selectedCita.estado_cita !== "completada" && (
                                <Button
                                    variant="contained"
                                    sx={{
                                        backgroundColor: "#2E7D32",
                                        color: "white",
                                        fontWeight: "bold",
                                        textTransform: "none",
                                        borderRadius: "8px",
                                        padding: "8px 16px",
                                        "&:hover": { backgroundColor: "#1B5E20" },
                                    }}
                                    onClick={handleMarkAsCompleted}
                                >
                                    Marcar como Completada
                                </Button>
                            )}
                        </>
                    ) : (
                        <>
                            <Button
                                variant="contained"
                                color="primary"
                                onClick={handleConfirmCompletion}
                                sx={{
                                    fontWeight: "bold",
                                    borderRadius: "8px",
                                    padding: "8px 16px",
                                }}
                            >
                                Confirmar
                            </Button>
                            <Button
                                variant="contained"
                                color="warning"
                                onClick={() => setIsConfirming(false)}
                                sx={{
                                    fontWeight: "bold",
                                    borderRadius: "8px",
                                    padding: "8px 16px",
                                }}
                            >
                                Cancelar
                            </Button>
                        </>
                    )}

                    <Button
                        onClick={handleCloseDialog}
                        variant="contained"
                        sx={{
                            backgroundColor: "#D32F2F",
                            color: "white",
                            fontWeight: "bold",
                            textTransform: "none",
                            borderRadius: "8px",
                            padding: "8px 16px",
                            "&:hover": { backgroundColor: "#B71C1C" },
                        }}
                    >
                        Cerrar
                    </Button>
                </DialogActions>
            </Dialog>

            {/* MODAL DE REAGENDAR MEJORADO */}
            <Dialog open={openReagendar} onClose={() => setOpenReagendar(false)}>
                <DialogTitle sx={{ fontWeight: "600", fontFamily: "'Roboto', sans-serif", color: "#003087" }}>
                    Reagendar Cita - Consultorio Dental
                </DialogTitle>
                <DialogContent>
                    <LocalizationProvider dateAdapter={AdapterDateFns} locale={es}>
                        <DatePicker
                            label="Nueva Fecha"
                            value={nuevaFecha}
                            onChange={setNuevaFecha}
                            renderInput={(params) => <TextField {...params} fullWidth margin="normal" />}
                            disablePast
                            shouldDisableDate={(date) => {
                                const dia = date.getDay();
                                return ![1, 2, 3, 6].includes(dia);
                            }}
                            maxDate={new Date(new Date().setMonth(new Date().getMonth() + 4))}
                            sx={{
                                "& .MuiOutlinedInput-root": {
                                    borderRadius: "8px",
                                    backgroundColor: "#f0f4f8",
                                },
                                "& .MuiInputLabel-root": {
                                    color: "#003087", /* Azul marino oscuro */
                                },
                            }}
                        />
                    </LocalizationProvider>
                    <FormControl fullWidth margin="normal">
                        <Select
                            value={nuevaHora}
                            onChange={(e) => setNuevaHora(e.target.value)}
                            displayEmpty
                            sx={{
                                borderRadius: "8px",
                                backgroundColor: "#f0f4f8",
                                "& .MuiSelect-select": {
                                    color: "#003087", /* Azul marino oscuro */
                                },
                            }}
                        >
                            <MenuItem disabled value="">
                                Selecciona una hora
                            </MenuItem>
                            {horasDisponibles.map((hora, index) => (
                                <MenuItem key={index} value={hora}>
                                    {hora}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </DialogContent>
                <DialogActions>
                    <Button
                        variant="contained"
                        onClick={handleConfirmReagendar}
                        sx={{
                            backgroundColor: "#003087", /* Azul marino oscuro */
                            color: "white",
                            fontWeight: "bold",
                            borderRadius: "8px",
                            "&:hover": { backgroundColor: "#005f8c" },
                        }}
                    >
                        Confirmar
                    </Button>
                    <Button
                        onClick={() => setOpenReagendar(false)}
                        sx={{
                            color: "#D32F2F",
                            fontWeight: "bold",
                            borderRadius: "8px",
                        }}
                    >
                        Cancelar
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default ProximasCitas;