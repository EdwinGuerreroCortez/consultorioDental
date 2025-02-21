import React, { useState, useEffect, useRef, useMemo } from 'react';
import axios from 'axios';
import { verificarAutenticacion } from '../../utils/auth';
import {
    Box,
    Typography,
    MenuItem,
    Select,
    FormControl,
    InputLabel,
    TextField,
    Button,
    Snackbar,
    Alert,
} from "@mui/material";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import InputAdornment from '@mui/material/InputAdornment';

import MedicalServicesOutlinedIcon from "@mui/icons-material/MedicalServicesOutlined";
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { es } from 'date-fns/locale';

const AgendarCita = () => {
    const [usuarioId, setUsuarioId] = useState(null);
    const [tratamientoActivo, setTratamientoActivo] = useState(false);
    const [servicios, setServicios] = useState([]);
    const [servicioSeleccionado, setServicioSeleccionado] = useState('');
    const [fechaSeleccionada, setFechaSeleccionada] = useState(null);
    const [horaSeleccionada, setHoraSeleccionada] = useState('');
    const [disponibilidad, setDisponibilidad] = useState([
        '09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '01:00 PM',
        '03:00 PM', '04:00 PM', '05:00 PM', '06:00 PM'
    ]);
    const [citasOcupadas, setCitasOcupadas] = useState([]);
    const [alerta, setAlerta] = useState({ mostrar: false, mensaje: '', tipo: '' });

    // ✅ Obtiene el usuario autenticado al montar el componente
    useEffect(() => {
        const obtenerUsuario = async () => {
            const usuario = await verificarAutenticacion();
            if (usuario) {
                setUsuarioId(usuario.id);
            } else {
                setAlerta({
                    mostrar: true,
                    mensaje: 'No se ha encontrado la sesión del usuario. Inicia sesión nuevamente.',
                    tipo: 'error',
                });
            }
        };
        obtenerUsuario();
    }, []);

    // ✅ Configurar Axios con la URL de producción
    const axiosInstance = axios.create({
        baseURL: 'http://localhost:4000/api',
        withCredentials: true,
    });

    // ✅ Ejecuta las peticiones solo cuando `usuarioId` tiene valor
    useEffect(() => {
        if (usuarioId) {
            verificarTratamientoActivo();
            obtenerTratamientos();
        }
    }, [usuarioId]);
    const obtenerCitasOcupadas = async () => {
        try {
            const response = await axiosInstance.get('/citas/activas');
            const citas = response.data || [];

            const citasConZonaHoraria = citas.map(cita => {
                const fechaUTC = new Date(cita.fecha_hora);
                const fechaMX = new Intl.DateTimeFormat('es-MX', {
                    timeZone: 'America/Mexico_City',
                    year: 'numeric', month: '2-digit', day: '2-digit',
                    hour: '2-digit', minute: '2-digit', second: '2-digit',
                    hour12: true
                }).format(fechaUTC);

                return { ...cita, fecha_hora_mx: fechaMX };
            });

            console.log("📅 Fechas obtenidas en UTC:", citas);
            console.log("🇲🇽 Fechas convertidas a Hora Centro de México:", citasConZonaHoraria);

            setCitasOcupadas(citasConZonaHoraria);
        } catch (error) {
            console.error('❌ Error al obtener las citas ocupadas:', error);
            setAlerta({
                mostrar: true,
                mensaje: 'Error al obtener las citas. Intenta nuevamente.',
                tipo: 'error',
            });
        }
    };


    const ultimaFechaConsultada = useRef(null);
    useEffect(() => {
        if (fechaSeleccionada && ultimaFechaConsultada.current !== fechaSeleccionada) {
            obtenerCitasOcupadas();
            ultimaFechaConsultada.current = fechaSeleccionada;
        }
    }, [fechaSeleccionada]);


    const verificarTratamientoActivo = async () => {
        if (!usuarioId) return;
        try {
            const response = await axiosInstance.get(`/tratamientos-pacientes/verificar/${usuarioId}`);
            setTratamientoActivo(response.data.tieneTratamientoActivo);
            if (response.data.tieneTratamientoActivo) {
                setAlerta({
                    mostrar: true,
                    mensaje: 'Ya tienes un tratamiento activo. Finalízalo antes de agendar otro.',
                    tipo: 'warning',
                });
            }
        } catch (error) {
            console.error('Error al verificar tratamiento:', error);
            setAlerta({
                mostrar: true,
                mensaje: 'Error al verificar el tratamiento activo.',
                tipo: 'error',
            });
        }
    };
    const obtenerHorasDisponibles = () => {
        if (!fechaSeleccionada) return disponibilidad;

        const fechaFormateada = fechaSeleccionada ? new Date(fechaSeleccionada).toISOString().split('T')[0] : null;

        if (!fechaFormateada) return disponibilidad; // Retorna disponibilidad completa si la fecha es inválida

        const horasOcupadas = citasOcupadas
            .filter(cita => {
                const fechaCita = new Date(cita.fecha_hora).toISOString().split('T')[0];
                return fechaCita === fechaFormateada;
            })
            .map(cita => {
                return new Date(cita.fecha_hora).toLocaleTimeString('es-MX', {
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: true
                }).toUpperCase().replace(/\./g, "");
            });

        return disponibilidad.filter(hora => !horasOcupadas.includes(hora));
    };



    const obtenerTratamientos = async () => {
        if (!usuarioId) return;
        try {
            const response = await axiosInstance.get('/tratamientos');
            setServicios(response.data.filter(tratamiento => tratamiento.estado === 1));
        } catch (error) {
            setAlerta({
                mostrar: true,
                mensaje: 'Error al cargar los tratamientos.',
                tipo: 'error',
            });
        }
    };

    const handleAgendarCita = async () => {
        if (!servicioSeleccionado || !fechaSeleccionada || !horaSeleccionada) {
            setAlerta({
                mostrar: true,
                mensaje: 'Por favor, completa todos los campos.',
                tipo: 'error',
            });
            return;
        }

        try {
            const tratamientoSeleccionado = servicios.find(s => s.nombre === servicioSeleccionado);
            const estadoTratamiento = tratamientoSeleccionado.requiere_evaluacion ? 'pendiente' : 'en progreso';

            const [hora, periodo] = horaSeleccionada.split(' ');
            let [horas, minutos] = hora.split(':').map(Number);
            if (periodo === 'PM' && horas !== 12) horas += 12;
            if (periodo === 'AM' && horas === 12) horas = 0;

            const fechaHora = new Date(fechaSeleccionada);
            fechaHora.setHours(horas, minutos, 0, 0);

            // Enviar solicitud para crear el tratamiento
            await axiosInstance.post('/tratamientos-pacientes/crear', {
                usuarioId,
                tratamientoId: tratamientoSeleccionado.id,
                citasTotales: tratamientoSeleccionado.citas_requeridas || 0,
                fechaInicio: fechaHora.toISOString(),
                estado: estadoTratamiento,
                precio: tratamientoSeleccionado.precio,
                requiereEvaluacion: tratamientoSeleccionado.requiere_evaluacion
            });

            setAlerta({
                mostrar: true,
                mensaje: tratamientoSeleccionado.requiere_evaluacion
                    ? 'Tratamiento creado correctamente, pendiente de evaluación.'
                    : 'Tratamiento, citas y pagos creados correctamente.',
                tipo: 'success',
            });

        } catch (error) {
            console.error('Error al agendar la cita:', error);
            setAlerta({
                mostrar: true,
                mensaje: 'Error al agendar la cita. Inténtalo nuevamente.',
                tipo: 'error',
            });
        }
    };
    const horasDisponibles = useMemo(() => obtenerHorasDisponibles(), [fechaSeleccionada, citasOcupadas]);

    return (
        <Box
            sx={{
                padding: { xs: "20px", md: "40px" }, // 🔹 Menos padding en móviles
                backgroundColor: "#f0f9ff",
                minHeight: "100vh",
                boxSizing: "border-box",
                display: "flex",
                flexDirection: "column",
                alignItems: "column",
                justifyContent: "flex-start",
            }}
        >
            {/* 🔹 Título del componente */}
            <Box
                sx={{
                    width: "100%",
                    maxWidth: "900px",
                    background: "linear-gradient(135deg, #0077b6, #48cae4)",
                    clipPath: "polygon(0 0, 100% 0, 80% 100%, 0% 100%)",
                    color: "#ffffff",
                    padding: { xs: "15px 20px", md: "20px 40px" }, // 🔹 Ajuste en padding
                    borderRadius: "12px",
                    boxShadow: "0 6px 20px rgba(0, 0, 0, 0.1)",
                    textAlign: "left",
                    marginTop: { xs: "5px", md: "10px" },
                }}
            >
                <Typography
                    variant="h4"
                    sx={{
                        fontWeight: "bold",
                        fontSize: { xs: "22px", md: "28px" }, // 🔹 Tamaño menor en móviles
                        fontFamily: "'Poppins', sans-serif",
                        textShadow: "1px 1px 6px rgba(0, 0, 0, 0.2)",
                    }}
                >
                    Agendar Cita Dental
                </Typography>
                <Typography
                    variant="subtitle1"
                    sx={{
                        fontSize: { xs: "14px", md: "16px" }, // 🔹 Reducir texto en móviles
                        fontStyle: "italic",
                        marginTop: "4px",
                    }}
                >
                    ¡Cuidamos tu sonrisa con tratamientos personalizados!
                </Typography>
            </Box>

            {/* 🔴 Si el usuario tiene un tratamiento en curso, mostrar el mensaje debajo del título */}
            {tratamientoActivo && (
                <Box
                    sx={{
                        width: "100%",
                        maxWidth: "600px",
                        textAlign: "center",
                        backgroundColor: "#fff",
                        padding: { xs: "15px", md: "20px" }, // 🔹 Ajusta padding en móviles
                        borderRadius: "12px",
                        boxShadow: "0 6px 20px rgba(0, 0, 0, 0.1)",
                        marginTop: "15px",
                    }}
                >
                    <Typography
                        variant="h5"
                        sx={{
                            fontWeight: "bold",
                            fontSize: { xs: "18px", md: "22px" }, // 🔹 Ajuste de tamaño de texto
                            color: "#d32f2f",
                        }}
                    >
                        Ya tienes un tratamiento en curso.
                    </Typography>
                    <Typography
                        variant="body1"
                        sx={{
                            fontSize: { xs: "14px", md: "16px" },
                            marginTop: "10px",
                            color: "#333",
                        }}
                    >
                        Debes finalizar tu tratamiento actual antes de agendar otro.
                    </Typography>
                </Box>
            )}

            {/* ✅ Si no tiene tratamiento activo, mostrar el formulario pegado al mensaje */}
            {!tratamientoActivo && (
                <Box
                    sx={{
                        width: "100%",
                        maxWidth: "900px",
                        padding: { xs: "20px", md: "40px" }, // 🔹 Ajuste de padding
                        backgroundColor: "#ffffff",
                        borderRadius: "16px",
                        boxShadow: "0 8px 24px rgba(0, 0, 0, 0.1)",
                        marginTop: "15px",
                    }}
                >
                    <FormControl fullWidth sx={{ marginBottom: "20px" }}>
                        <Typography variant="h6" sx={{ fontWeight: "bold", color: "#333" }}>
                            Servicio
                        </Typography>
                        <Select
                            value={servicioSeleccionado}
                            onChange={(e) => setServicioSeleccionado(e.target.value)}
                            displayEmpty
                            sx={{
                                marginTop: "10px",
                                borderRadius: "12px",
                                backgroundColor: "#e6f7ff",
                            }}
                            startAdornment={
                                <InputAdornment position="start">
                                    <MedicalServicesOutlinedIcon color="primary" />
                                </InputAdornment>
                            }
                        >
                            <MenuItem disabled value="">
                                Selecciona un servicio
                            </MenuItem>
                            {servicios.map((servicio) => (
                                <MenuItem key={servicio.id} value={servicio.nombre}>
                                    {servicio.nombre} -{' '}
                                    {servicio.requiere_evaluacion ? (
                                        <em>Requiere evaluación</em>
                                    ) : (
                                        `$${servicio.precio} MXN`
                                    )}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <Box sx={{ marginBottom: "20px" }}>
                        <Typography variant="h6" sx={{ fontWeight: "bold", color: "#333", marginBottom: "10px" }}>
                            Fecha de la cita
                        </Typography>

                        {/* 🔹 Mensaje de advertencia para el usuario */}
                        <Typography
                            variant="body2"
                            sx={{ color: "#d32f2f", fontWeight: "bold", marginBottom: "8px" }}
                        >
                            Solo se pueden agendar citas en: Lunes, Martes, Miércoles y Sábado.
                        </Typography>

                        <LocalizationProvider dateAdapter={AdapterDateFns} locale={es}>
                            <DatePicker
                                value={fechaSeleccionada}
                                onChange={(newValue) => setFechaSeleccionada(newValue)}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        fullWidth
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <CalendarMonthOutlinedIcon color="primary" />
                                                </InputAdornment>
                                            ),
                                        }}
                                    />
                                )}
                                disablePast
                                maxDate={new Date(new Date().setDate(new Date().getDate() + 30))} // 🔹 Restricción a 30 días
                                inputFormat="dd/MM/yyyy"
                                shouldDisableDate={(date) => {
                                    const day = date.getDay(); // Obtiene el día de la semana (0 = Domingo, 6 = Sábado)
                                    return ![1, 2, 3, 6].includes(day); // Solo permite Lunes (1), Martes (2), Miércoles (3) y Sábado (6)
                                }}
                            />

                        </LocalizationProvider>
                    </Box>


                    <FormControl fullWidth sx={{ marginBottom: "20px" }}>
                        <InputLabel>Hora</InputLabel>
                        <Select
                            value={horaSeleccionada}
                            onChange={(e) => setHoraSeleccionada(e.target.value)}
                            displayEmpty
                            startAdornment={
                                <InputAdornment position="start">
                                    <AccessTimeIcon color="primary" />
                                </InputAdornment>
                            }
                            disabled={horasDisponibles.length === 0}
                        >
                            {horasDisponibles.length > 0 ? (
                                horasDisponibles.map((hora, index) => (
                                    <MenuItem key={index} value={hora}>
                                        {hora}
                                    </MenuItem>
                                ))
                            ) : (
                                <MenuItem disabled>No hay horarios disponibles</MenuItem>
                            )}
                        </Select>
                    </FormControl>



                    <Button
                        variant="contained"
                        color="primary"
                        fullWidth
                        onClick={handleAgendarCita}
                        sx={{
                            padding: "14px",
                            fontWeight: "bold",
                            borderRadius: "12px",
                            backgroundColor: "#0077b6",
                        }}
                    >
                        Confirmar Cita
                    </Button>
                </Box>
            )}

            <Snackbar
                open={alerta.mostrar}
                onClose={() => setAlerta({ mostrar: false, mensaje: '', tipo: '' })}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
                autoHideDuration={5000}
            >
                <Alert severity={alerta.tipo} onClose={() => setAlerta({ mostrar: false, mensaje: '', tipo: '' })}>
                    {alerta.mensaje}
                </Alert>
            </Snackbar>
        </Box>
    );


};

export default AgendarCita;
