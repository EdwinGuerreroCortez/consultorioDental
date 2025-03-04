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
    TextField


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
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { es } from 'date-fns/locale';
import { obtenerCitasOcupadas, obtenerHorasDisponibles } from "../../utils/citas";


moment.locale("es");
const localizer = momentLocalizer(moment);

const diasSemana = {
    0: "Domingo",
    1: "Lunes",
    2: "Martes",
    3: "Miércoles",
    4: "Jueves",
    5: "Viernes",
    6: "Sábado"
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
    11: "Diciembre"
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
    dayHeaderFormat: (date) => `${diasSemana[date.getDay()]} ${date.getDate()} de ${meses[date.getMonth()]}`
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
        '09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '01:00 PM',
        '03:00 PM', '04:00 PM', '05:00 PM', '06:00 PM'
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
    
        // Verificar si `nuevaFecha` es un objeto válido antes de formatearla
        if (!(nuevaFecha instanceof Date) || isNaN(nuevaFecha)) {
            alert("La fecha seleccionada no es válida.");
            return;
        }
    
        // Formatear la fecha en `YYYY-MM-DD`
        const fechaFormateada = nuevaFecha.toISOString().split('T')[0];
    
        // Convertir la hora seleccionada a formato de 24 horas
        const [hora, minutos, periodo] = nuevaHora.match(/(\d+):(\d+)\s?(AM|PM)/i).slice(1);
        let hora24 = parseInt(hora, 10);
    
        if (periodo.toUpperCase() === "PM" && hora24 !== 12) {
            hora24 += 12;
        } else if (periodo.toUpperCase() === "AM" && hora24 === 12) {
            hora24 = 0;
        }
    
        const horaFormateada = `${hora24.toString().padStart(2, '0')}:${minutos}:00`;
    
        // Unir fecha y hora en formato `YYYY-MM-DDTHH:mm:ss` para coincidir con Thunder Client
        const nuevaFechaHora = `${fechaFormateada}T${horaFormateada}`;
    
        console.log(`📅 Intentando actualizar la cita ID: ${selectedCita.cita_id} con nueva fecha/hora: ${nuevaFechaHora}`);
    
        try {
            const response = await axios.put(`http://localhost:4000/api/citas/actualizar-fecha-hora/${selectedCita.cita_id}`, {
                fechaHora: nuevaFechaHora // Enviar la clave exacta como en Thunder Client
            });
    
            console.log("✔️ Respuesta del servidor:", response.data);
            alert("Cita reagendada exitosamente.");
    
            fetchCitas(); // Recargar citas después de reagendar
            setOpenReagendar(false);
            setSelectedCita(null);
        } catch (error) {
            console.error("❌ Error al reagendar la cita:", error.response ? error.response.data : error);
            alert(error.response?.data?.mensaje || "Hubo un error al reagendar la cita. Verifica los datos.");
        }
    };
     

    const fetchCitas = async () => {
        try {
            const response = await axios.get("http://localhost:4000/api/citas/proximas");

            // Filtrar las citas para excluir las que están completadas y pagadas
            const citasFiltradas = response.data.filter(
                (cita) => !(cita.estado_cita === "completada" && cita.estado_pago === "Pagado")
            );

            const citasFormateadas = citasFiltradas.map((cita) => ({
                id: cita.cita_id,
                title: `${cita.nombre} ${cita.apellido_paterno} - ${cita.estado_pago}`,
                start: new Date(cita.fecha_hora),
                end: moment(new Date(cita.fecha_hora)).add(1, "hour").toDate(),
                paciente: cita,
                tratamiento: cita.nombre_tratamiento
            }));

            setCitas(citasFormateadas);
            // ✅ Obtener citas ocupadas para bloquear horarios
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
        setIsConfirming(true); // Mostrar el formulario de comentario
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

        console.log("📩 Enviando comentario:", comentario); // 🔹 LOG antes de enviar

        try {
            const response = await axios.put(`http://localhost:4000/api/citas/completar/${selectedCita.cita_id}`, {
                comentario
            });

            console.log("✔️ Respuesta del servidor:", response.data); // 🔹 LOG para verificar

            alert("Cita marcada como completada.");
            fetchCitas(); // Recargar citas
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
                fontWeight: "bold"
            }
        };
    };

    const handleSelectEvent = (event) => {
        console.log("Cita seleccionada ID:", event.id);
        setSelectedCita(event.paciente);
        setComentario(""); // Resetear comentario al abrir el modal
        setIsConfirming(false); // Reiniciar estado de confirmación
    };


    const handleCloseDialog = () => {
        setSelectedCita(null);
    };

    return (
        <Box sx={{ padding: "2rem", minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center" }}>
            {/* ENCABEZADO */}
            <Box
                sx={{
                    width: "100%",
                    maxWidth: "900px",
                    background: "linear-gradient(135deg, #0077b6, #48cae4)",
                    clipPath: "polygon(0 0, 100% 0, 80% 100%, 0% 100%)",
                    color: "#ffffff",
                    padding: "40px 40px",
                    borderRadius: "12px",
                    boxShadow: "0 6px 20px rgba(0, 0, 0, 0.3)",
                    textAlign: "left",
                    marginBottom: "2rem",
                    alignSelf: "flex-start" // 🔹 Asegura que el contenedor no se centre
                }}
            >
                <Typography
                    variant="h4"
                    sx={{
                        fontWeight: "bold",
                        fontFamily: "'Poppins', sans-serif",
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        justifyContent: "flex-start" // 🔹 Mueve el contenido completamente a la izquierda
                    }}
                >
                    <EventIcon fontSize="large" />
                    Calendario de Citas
                </Typography>
            </Box>


            {/* CALENDARIO */}
            <Box sx={{ flexGrow: 1, width: "100%", maxWidth: "1100px" }}>
                {loading ? (
                    <Typography align="center" sx={{ marginTop: "2rem", color: "#666" }}>
                        <CircularProgress />
                    </Typography>
                ) : (
                    <Paper sx={{ padding: "20px", borderRadius: "12px", boxShadow: 3 }}>
                        <Calendar
                            localizer={localizer}
                            events={citas}
                            startAccessor="start"
                            endAccessor="end"
                            style={{ height: 500 }}
                            eventPropGetter={eventStyleGetter}
                            onSelectEvent={handleSelectEvent}
                            culture="es"
                            messages={messages}
                            formats={formats}
                        />
                    </Paper>
                )}
            </Box>

            {/* MODAL DE DETALLES */}
            <Dialog
                open={!!selectedCita}
                onClose={handleCloseDialog}
                sx={{
                    "& .MuiDialog-paper": {
                        borderRadius: 3,
                        padding: "20px",
                        maxWidth: "500px",
                        boxShadow: 6
                    }
                }}
            >
                {/* ENCABEZADO DEL MODAL */}
                <DialogTitle
                    sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        backgroundColor: "#0077b6",
                        color: "white",
                        fontWeight: "bold",
                        borderTopLeftRadius: 3,
                        borderTopRightRadius: 3
                    }}
                >
                    🦷 Detalles de la Cita
                    <IconButton onClick={handleCloseDialog} sx={{ color: "white" }}>
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>

                {/* CUERPO DEL MODAL */}
                <DialogContent
                    sx={{
                        padding: "20px",
                        backgroundColor: "#f8fcff",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center"
                    }}
                >
                    {selectedCita && !isConfirming && ( // 🔹 Ocultar contenido si se confirma
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                            style={{ width: "100%" }}
                        >
                            <Box sx={{ textAlign: "center", width: "100%", padding: 2 }}>
                                <Typography variant="h6" sx={{ fontWeight: "bold", color: "#0077b6", mb: 2 }}>
                                    {selectedCita.nombre} {selectedCita.apellido_paterno}
                                </Typography>

                                <Divider sx={{ my: 2, width: "80%", margin: "auto" }} />

                                <Grid container spacing={2} alignItems="center">
                                    <Grid item xs={6} display="flex" alignItems="center" justifyContent="center">
                                        <EventIcon sx={{ color: "#0077b6", mr: 1 }} />
                                        <Typography sx={{ fontSize: "16px", color: "#555" }}>
                                            <strong>Fecha:</strong><br />
                                            {new Date(selectedCita.fecha_hora).toLocaleDateString("es-ES")}
                                        </Typography>
                                    </Grid>

                                    <Grid item xs={6} display="flex" alignItems="center" justifyContent="center">
                                        <AccessTimeIcon sx={{ color: "#0077b6", mr: 1 }} />
                                        <Typography sx={{ fontSize: "16px", color: "#555" }}>
                                            <strong>Hora:</strong><br />
                                            {new Date(selectedCita.fecha_hora).toLocaleTimeString("es-ES")}
                                        </Typography>
                                    </Grid>

                                    <Grid item xs={12} display="flex" alignItems="center" justifyContent="center">
                                        <MonetizationOnIcon sx={{ color: selectedCita.estado_pago === "Pagado" ? "green" : "red", mr: 1 }} />
                                        <Typography sx={{ fontSize: "16px", color: selectedCita.estado_pago === "Pagado" ? "green" : "red" }}>
                                            <strong>Estado de pago:</strong> {selectedCita.estado_pago}
                                        </Typography>
                                    </Grid>

                                    <Grid item xs={6} display="flex" alignItems="center" justifyContent="center">
                                        <EmailIcon sx={{ color: "#0077b6", mr: 1 }} />
                                        <Typography sx={{ fontSize: "16px", color: "#555" }}>
                                            <strong>Email:</strong><br />
                                            {selectedCita.email}
                                        </Typography>
                                    </Grid>

                                    <Grid item xs={6} display="flex" alignItems="center" justifyContent="center">
                                        <PhoneIcon sx={{ color: "#0077b6", mr: 1 }} />
                                        <Typography sx={{ fontSize: "16px", color: "#555" }}>
                                            <strong>Teléfono:</strong><br />
                                            {selectedCita.telefono}
                                        </Typography>
                                    </Grid>

                                    <Grid item xs={12} display="flex" alignItems="center" justifyContent="center">
                                        <MedicalServicesIcon sx={{ color: "#0077b6", mr: 1 }} />
                                        <Typography sx={{ fontSize: "16px", fontWeight: "bold", color: "#0077b6" }}>
                                            🦷 Tratamiento: {selectedCita.nombre_tratamiento}
                                        </Typography>
                                    </Grid>
                                </Grid>
                            </Box>
                        </motion.div>
                    )}

                    {/* 🔹 SOLO se muestra el formulario si isConfirming está en true */}
                    {isConfirming && (
                        <Grid container spacing={2} alignItems="center" justifyContent="center">
                            <Grid item xs={12}>
                                <Typography variant="subtitle1" sx={{ fontWeight: "bold", color: "#0077b6", mb: 1 }}>
                                    Agregar Comentario:
                                </Typography>
                                <textarea
                                    value={comentario}
                                    onChange={(e) => setComentario(e.target.value)}
                                    placeholder="Escribe un comentario sobre la cita..."
                                    rows="3"
                                    style={{
                                        width: "100%",
                                        padding: "10px",
                                        borderRadius: "5px",
                                        border: "1px solid #ccc"
                                    }}
                                />
                            </Grid>
                        </Grid>
                    )}
                </DialogContent>


                {/* BOTONES DE ACCIÓN */}
                <DialogActions
                    sx={{
                        display: "flex",
                        justifyContent: "center",
                        gap: 2,
                        padding: "15px",
                        backgroundColor: "#f8fcff",
                        borderBottomLeftRadius: 3,
                        borderBottomRightRadius: 3
                    }}
                >
                    {!isConfirming ? (
                        <>
                            {/* 🔹 Verificar si la cita NO está completada antes de mostrar el botón de reagendar */}
                            {selectedCita && selectedCita.estado_cita !== "completada" && (
                                <Button
                                    variant="contained"
                                    onClick={handleReagendar}
                                    sx={{
                                        backgroundColor: "#ffa500",
                                        color: "white",
                                        fontWeight: "bold",
                                        textTransform: "none",
                                        "&:hover": { backgroundColor: "#ff8c00" }
                                    }}
                                >
                                    Reagendar
                                </Button>
                            )}

                            {/* 🔹 Verificar si la cita NO está completada antes de mostrar el botón de marcar como completada */}
                            {selectedCita && selectedCita.estado_cita !== "completada" && (
                                <Button
                                    variant="contained"
                                    sx={{
                                        backgroundColor: "#28a745",
                                        color: "white",
                                        fontWeight: "bold",
                                        textTransform: "none",
                                        "&:hover": { backgroundColor: "#218838" }
                                    }}
                                    onClick={handleMarkAsCompleted} // Muestra el formulario
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
                                sx={{ fontWeight: "bold" }}
                            >
                                Confirmar
                            </Button>
                            <Button
                                variant="contained"
                                color="warning"
                                onClick={() => setIsConfirming(false)}
                                sx={{ fontWeight: "bold" }}
                            >
                                Cancelar
                            </Button>
                        </>
                    )}

                    <Button
                        onClick={handleCloseDialog}
                        variant="contained"
                        sx={{
                            backgroundColor: "#d32f2f",
                            color: "white",
                            fontWeight: "bold",
                            textTransform: "none",
                            "&:hover": { backgroundColor: "#c62828" }
                        }}
                    >
                        Cerrar
                    </Button>
                </DialogActions>

            </Dialog>
            <Dialog open={openReagendar} onClose={() => setOpenReagendar(false)}>
                <DialogTitle>Reagendar Cita</DialogTitle>
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
        return ![1, 2, 3, 6].includes(dia); // Solo Lunes (1), Martes (2), Miércoles (3) y Sábado (6)
    }}
    maxDate={new Date(new Date().setMonth(new Date().getMonth() + 4))} // ✅ Permitir hasta 4 meses en el futuro
/>

                    </LocalizationProvider>
                    <FormControl fullWidth margin="normal">
                        <Select
                            value={nuevaHora}
                            onChange={(e) => setNuevaHora(e.target.value)}
                            displayEmpty
                        >
                            <MenuItem disabled value="">Selecciona una hora</MenuItem>
                            {horasDisponibles.map((hora, index) => (
                                <MenuItem key={index} value={hora}>{hora}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </DialogContent>
                <DialogActions>
                    <Button variant="contained" onClick={handleConfirmReagendar}>Confirmar</Button>
                    <Button onClick={() => setOpenReagendar(false)}>Cancelar</Button>
                </DialogActions>
            </Dialog>

        </Box>
    );
};

export default ProximasCitas;
