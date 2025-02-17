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
    IconButton
} from "@mui/material";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import axios from "axios";
import EventIcon from "@mui/icons-material/Event";
import CloseIcon from "@mui/icons-material/Close";
import "./CalendarioEstilos.css"; // Importar estilos personalizados

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

    useEffect(() => {
        const fetchCitas = async () => {
            try {
                const response = await axios.get("http://localhost:4000/api/citas/proximas");
                const citasFormateadas = response.data.map((cita) => ({
                    id: cita.id,
                    title: `${cita.nombre} ${cita.apellido_paterno} - ${cita.estado_pago}`,
                    start: new Date(cita.fecha_hora),
                    end: moment(new Date(cita.fecha_hora)).add(1, "hour").toDate(),
                    paciente: cita,
                    tratamiento: cita.nombre_tratamiento // 🔹 Agregamos el tratamiento
                }));
                setCitas(citasFormateadas);
            } catch (error) {
                console.error("Error al obtener las próximas citas", error);
            } finally {
                setLoading(false);
            }
        };
    
        fetchCitas();
    }, []);
    

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
        setSelectedCita(event.paciente);
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
            <Dialog open={!!selectedCita} onClose={handleCloseDialog}>
                <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    🦷 Detalles de la Cita
                    <IconButton onClick={handleCloseDialog} sx={{ color: "#D32F2F" }}>
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>
                <DialogContent>
    {selectedCita && (
        <Box sx={{ textAlign: "center" }}>
            <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                {selectedCita.nombre} {selectedCita.apellido_paterno}
            </Typography>
            <Divider sx={{ my: 1 }} />
            <Typography>
                <strong>🕒 Fecha y hora:</strong> {new Date(selectedCita.fecha_hora).toLocaleString("es-ES")}
            </Typography>
            <Typography>
                <strong>💳 Estado de pago:</strong> {selectedCita.estado_pago}
            </Typography>
            <Typography>
                <strong>📧 Email:</strong> {selectedCita.email}
            </Typography>
            <Typography>
                <strong>📞 Teléfono:</strong> {selectedCita.telefono}
            </Typography>
            <Typography>
                <strong>🦷 Tratamiento:</strong> {selectedCita.nombre_tratamiento}
            </Typography> {/* 🔹 Mostrar el tratamiento */}
        </Box>
    )}
</DialogContent>

                <DialogActions>
                    <Button onClick={handleCloseDialog} variant="contained" sx={{ background: "#0D47A1", color: "white" }}>
                        Cerrar
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default ProximasCitas;
