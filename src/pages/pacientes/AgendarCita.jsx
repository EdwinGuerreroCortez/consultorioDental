import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import axios from 'axios';
import { verificarAutenticacion } from '../../utils/auth';
import {
    Box,
    Typography,
    MenuItem,
    Select,
    FormControl,
    TextField,
    Button,
    Snackbar,
    Alert,
    Paper,
    InputAdornment,
    CircularProgress,
} from "@mui/material";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import MedicalServicesOutlinedIcon from "@mui/icons-material/MedicalServicesOutlined";
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CheckCircle from "@mui/icons-material/CheckCircle";
import ArrowBack from "@mui/icons-material/ArrowBack";
import ErrorOutlineOutlinedIcon from '@mui/icons-material/ErrorOutlineOutlined';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { es } from 'date-fns/locale';
import { motion } from "framer-motion";

// Componente para mostrar la advertencia de tratamiento activo
const ActiveTreatmentWarning = ({ onBack }) => (
    <motion.div
        initial={{ opacity: 0, y: -50, scale: 0.8 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -30, scale: 0.5 }}
        transition={{
            duration: 0.8,
            ease: "easeOut",
            type: "spring",
            stiffness: 150,
        }}
    >
        <motion.div
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            transition={{ duration: 0.3 }}
        >
            <Box
                sx={{
                    width: "100%",
                    maxWidth: "800px",
                    textAlign: "center",
                    backgroundColor: "#FFEBEE",
                    padding: { xs: "20px", md: "30px" },
                    borderRadius: "16px",
                    boxShadow: "0 10px 30px rgba(211, 47, 47, 0.25)",
                    border: "2px solid #D32F2F",
                    margin: "0 auto",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    transition: "all 0.4s ease-in-out",
                    "&:hover": {
                        boxShadow: "0 12px 40px rgba(211, 47, 47, 0.35)",
                        transform: "scale(1.02)",
                    },
                }}
            >
                <motion.div
                    animate={{ rotate: [0, -10, 10, 0], scale: [1, 1.15, 1] }}
                    transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
                >
                    <ErrorOutlineOutlinedIcon
                        sx={{
                            fontSize: { xs: "50px", md: "60px" },
                            color: "#D32F2F",
                            marginBottom: "12px",
                            filter: "drop-shadow(0px 2px 10px rgba(211, 47, 47, 0.5))",
                        }}
                    />
                </motion.div>
                <Typography
                    variant="h5"
                    sx={{
                        fontWeight: "bold",
                        fontSize: { xs: "1.25rem", md: "1.5rem" },
                        color: "#D32F2F",
                        textShadow: "1px 1px 5px rgba(211, 47, 47, 0.3)",
                        fontFamily: "'Poppins', sans-serif",
                    }}
                >
                    No puedes agendar una cita
                </Typography>
                <Typography
                    variant="body1"
                    sx={{
                        fontSize: { xs: "0.9rem", md: "1rem" },
                        marginTop: "12px",
                        color: "#B71C1C",
                        fontWeight: "500",
                        fontFamily: "'Poppins', sans-serif",
                    }}
                >
                    Ya tienes un tratamiento en curso. Debes finalizarlo antes de agendar otra cita.
                </Typography>
                <Button
                    variant="outlined"
                    onClick={onBack}
                    startIcon={<ArrowBack />}
                    sx={{
                        marginTop: "20px",
                        borderRadius: "12px",
                        padding: { xs: "10px 20px", md: "12px 24px" },
                        textTransform: "none",
                        fontSize: { xs: "0.9rem", md: "1rem" },
                        color: "#D32F2F",
                        borderColor: "#D32F2F",
                        fontFamily: "'Poppins', sans-serif",
                        "&:hover": {
                            borderColor: "#B71C1C",
                            backgroundColor: "rgba(211, 47, 47, 0.05)",
                            boxShadow: "0 4px 15px rgba(211, 47, 47, 0.2)",
                        },
                    }}
                >
                    Regresar
                </Button>
            </Box>
        </motion.div>
    </motion.div>
);

// Componente para los botones de acción
const ActionButtons = ({ onBack, onSubmit, disabled }) => (
    <Box
        sx={{
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            justifyContent: "space-between",
            marginTop: { xs: "20px", md: "40px" },
            gap: { xs: "16px", sm: "20px" },
        }}
    >
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
                variant="outlined"
                onClick={onBack}
                startIcon={<ArrowBack />}
                sx={{
                    borderRadius: "12px",
                    padding: { xs: "10px 20px", md: "12px 28px" },
                    textTransform: "none",
                    fontSize: { xs: "0.9rem", md: "1rem" },
                    color: "#003087",
                    borderColor: "#003087",
                    fontFamily: "'Poppins', sans-serif",
                    fontWeight: "600",
                    "&:hover": {
                        borderColor: "#0057b7",
                        backgroundColor: "rgba(0, 87, 183, 0.05)",
                        boxShadow: "0 4px 15px rgba(0, 87, 183, 0.2)",
                    },
                    width: { xs: "100%", sm: "auto" },
                }}
            >
                Atrás
            </Button>
        </motion.div>
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
                variant="contained"
                onClick={onSubmit}
                startIcon={<CheckCircle />}
                disabled={disabled}
                sx={{
                    background: "linear-gradient(135deg, #003087 0%, #0057b7 100%)",
                    borderRadius: "12px",
                    padding: { xs: "10px 20px", md: "12px 28px" },
                    textTransform: "none",
                    fontSize: { xs: "0.9rem", md: "1rem" },
                    fontFamily: "'Poppins', sans-serif",
                    fontWeight: "600",
                    transition: "all 0.4s ease",
                    "&:hover": {
                        background: "linear-gradient(135deg, #0057b7 0%, #003087 100%)",
                        boxShadow: "0 6px 20px rgba(0, 87, 183, 0.5)",
                        transform: "translateY(-2px)",
                    },
                    "&:disabled": {
                        background: "linear-gradient(135deg, #b0bec5 0%, #cfd8dc 100%)",
                        cursor: "not-allowed",
                    },
                    width: { xs: "100%", sm: "auto" },
                }}
            >
                Confirmar Cita
            </Button>
        </motion.div>
    </Box>
);

// Componente principal
const AgendarCita = () => {
    const [usuarioId, setUsuarioId] = useState(null);
    const [tratamientoActivo, setTratamientoActivo] = useState(false);
    const [servicios, setServicios] = useState([]);
    const [servicioSeleccionado, setServicioSeleccionado] = useState('');
    const [fechaSeleccionada, setFechaSeleccionada] = useState(null);
    const [horaSeleccionada, setHoraSeleccionada] = useState('');
    const [disponibilidad] = useState([
        '09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '01:00 PM',
        '03:00 PM', '04:00 PM', '05:00 PM', '06:00 PM'
    ]);
    const [citasOcupadas, setCitasOcupadas] = useState([]);
    const [alerta, setAlerta] = useState({ mostrar: false, mensaje: '', tipo: '' });
    const [isLoading, setIsLoading] = useState(false);
    const [csrfToken, setCsrfToken] = useState(null); // Nuevo estado para el token CSRF

    const ultimaFechaConsultada = useRef(null);

    const axiosInstance = useMemo(() => axios.create({
        baseURL: 'https://backenddent.onrender.com/api',
        withCredentials: true,
    }), []);

    // Obtener el token CSRF al montar el componente
    useEffect(() => {
        const obtenerTokenCSRF = async () => {
            try {
                const response = await fetch("https://backenddent.onrender.com/api/get-csrf-token", {
                    credentials: "include",
                });
                const data = await response.json();
                setCsrfToken(data.csrfToken); // Guardar el token en el estado
            } catch (error) {
                console.error("Error obteniendo el token CSRF:", error);
                setAlerta({ mostrar: true, mensaje: "Error al obtener el token CSRF", tipo: "error" });
            }
        };
        obtenerTokenCSRF();
    }, []);

    useEffect(() => {
        const obtenerUsuario = async () => {
            try {
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
            } catch (error) {
                setAlerta({
                    mostrar: true,
                    mensaje: 'Error al verificar la autenticación. Intenta nuevamente.',
                    tipo: 'error',
                });
            }
        };
        obtenerUsuario();
    }, []);

    useEffect(() => {
        if (usuarioId && csrfToken) {
            verificarTratamientoActivo();
            obtenerTratamientos();
        }
    }, [usuarioId, csrfToken]);

    useEffect(() => {
        if (fechaSeleccionada && ultimaFechaConsultada.current !== fechaSeleccionada && csrfToken) {
            obtenerCitasOcupadas();
            ultimaFechaConsultada.current = fechaSeleccionada;
        }
    }, [fechaSeleccionada, csrfToken]);

    const obtenerCitasOcupadas = useCallback(async () => {
        if (!csrfToken) return; // Esperar a que el token esté disponible

        try {
            setIsLoading(true);
            const response = await axiosInstance.get('/citas/activas', {
                headers: { "X-XSRF-TOKEN": csrfToken },
            });
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
            setCitasOcupadas(citasConZonaHoraria);
        } catch (error) {
            console.error('❌ Error al obtener las citas ocupadas:', error);
            setAlerta({
                mostrar: true,
                mensaje: 'Error al obtener las citas. Intenta nuevamente.',
                tipo: 'error',
            });
        } finally {
            setIsLoading(false);
        }
    }, [axiosInstance, csrfToken]);

    const verificarTratamientoActivo = useCallback(async () => {
        if (!usuarioId || !csrfToken) return;

        try {
            setIsLoading(true);
            const response = await axiosInstance.get(`/tratamientos-pacientes/verificar/${usuarioId}`, {
                headers: { "X-XSRF-TOKEN": csrfToken },
            });
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
        } finally {
            setIsLoading(false);
        }
    }, [axiosInstance, usuarioId, csrfToken]);

    const obtenerTratamientos = useCallback(async () => {
        if (!usuarioId || !csrfToken) return;

        try {
            setIsLoading(true);
            const response = await axiosInstance.get('/tratamientos', {
                headers: { "X-XSRF-TOKEN": csrfToken },
            });
            setServicios(response.data.filter(tratamiento => tratamiento.estado === 1));
        } catch (error) {
            setAlerta({
                mostrar: true,
                mensaje: 'Error al cargar los tratamientos.',
                tipo: 'error',
            });
        } finally {
            setIsLoading(false);
        }
    }, [axiosInstance, usuarioId, csrfToken]);

    const obtenerHorasDisponibles = useMemo(() => {
        if (!fechaSeleccionada) return disponibilidad;
        const fechaFormateada = fechaSeleccionada ? new Date(fechaSeleccionada).toISOString().split('T')[0] : null;
        if (!fechaFormateada) return disponibilidad;
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
    }, [fechaSeleccionada, citasOcupadas, disponibilidad]);

    const handleAgendarCita = useCallback(async () => {
        if (!csrfToken) return; // Esperar a que el token esté disponible

        if (!servicioSeleccionado || !fechaSeleccionada || !horaSeleccionada) {
            setAlerta({
                mostrar: true,
                mensaje: 'Por favor, completa todos los campos.',
                tipo: 'error',
            });
            return;
        }

        try {
            setIsLoading(true);
            const tratamientoSeleccionado = servicios.find(s => s.nombre === servicioSeleccionado);
            const estadoTratamiento = tratamientoSeleccionado.requiere_evaluacion ? 'pendiente' : 'en progreso';
            const fechaISO = new Date(fechaSeleccionada).toISOString().split('T')[0];
            const [hora, minutos] = horaSeleccionada.replace(/( AM| PM)/, '').split(':').map(Number);
            const esPM = horaSeleccionada.includes('PM');
            let horaFinal = esPM && hora !== 12 ? hora + 12 : hora;
            if (!esPM && hora === 12) horaFinal = 0;
            const fechaHoraLocal = new Date(`${fechaISO}T${horaFinal.toString().padStart(2, '0')}:${minutos.toString().padStart(2, '0')}:00`);
            const fechaHoraUTC = new Date(fechaHoraLocal.getTime() - fechaHoraLocal.getTimezoneOffset() * 60000);

            await axiosInstance.post('/tratamientos-pacientes/crear', {
                usuarioId,
                tratamientoId: tratamientoSeleccionado.id,
                citasTotales: tratamientoSeleccionado.citas_requeridas || 0,
                fechaInicio: fechaHoraUTC.toISOString(),
                estado: estadoTratamiento,
                precio: tratamientoSeleccionado.precio,
                requiereEvaluacion: tratamientoSeleccionado.requiere_evaluacion
            }, {
                headers: {
                    "X-XSRF-TOKEN": csrfToken,
                    "Content-Type": "application/json",
                },
                withCredentials: true,
            });

            setAlerta({
                mostrar: true,
                mensaje: tratamientoSeleccionado.requiere_evaluacion
                    ? 'Tratamiento creado correctamente, pendiente de valoración.'
                    : 'Tratamiento, citas y pagos creados correctamente.',
                tipo: 'success',
            });
            setServicioSeleccionado('');
            setFechaSeleccionada(null);
            setHoraSeleccionada('');
        } catch (error) {
            console.error('❌ Error al agendar la cita:', error);
            setAlerta({
                mostrar: true,
                mensaje: 'Error al agendar la cita. Inténtalo nuevamente.',
                tipo: 'error',
            });
        } finally {
            setIsLoading(false);
        }
    }, [
        servicioSeleccionado,
        fechaSeleccionada,
        horaSeleccionada,
        usuarioId,
        servicios,
        axiosInstance,
        csrfToken,
    ]);

    const handleBack = useCallback(() => {
        console.log("Regresar a la página anterior");
    }, []);

    const menuProps = {
        PaperProps: {
            sx: {
                borderRadius: "12px",
                boxShadow: "0 6px 20px rgba(0, 87, 183, 0.15)",
                backgroundColor: "rgba(255, 255, 255, 0.98)",
                backdropFilter: "blur(8px)",
                maxHeight: "300px",
                "& .MuiMenuItem-root": {
                    fontFamily: "'Poppins', sans-serif",
                    fontSize: { xs: "0.9rem", md: "1rem" },
                    padding: "12px 20px",
                    borderRadius: "8px",
                    margin: "4px 8px",
                    transition: "all 0.3s ease",
                    "&:hover": {
                        backgroundColor: "rgba(0, 87, 183, 0.1)",
                        transform: "translateX(5px)",
                    },
                    "&.Mui-selected": {
                        backgroundColor: "rgba(0, 87, 183, 0.2)",
                        color: "#003087",
                        fontWeight: "600",
                    },
                },
            },
        },
    };

    const inputStyles = {
        "& .MuiOutlinedInput-root": {
            "& fieldset": { borderColor: "rgba(0, 87, 183, 0.6)" },
            "&:hover fieldset": { borderColor: "#0057b7" },
            "&.Mui-focused fieldset": { borderColor: "#003087", borderWidth: "2px" },
            backgroundColor: "rgba(255, 255, 255, 0.95)",
            borderRadius: "12px",
            transition: "all 0.4s ease",
            boxShadow: "0 2px 10px rgba(0, 87, 183, 0.1)",
        },
        "& .MuiInputBase-input": {
            fontSize: { xs: "0.95rem", md: "1.05rem" },
            padding: { xs: "12px 20px", md: "14px 24px" },
        },
        fontFamily: "'Poppins', sans-serif",
    };

    return (
        <Box
            sx={{
                display: "flex",
                justifyContent: "center",
                minHeight: "auto",
                background: "linear-gradient(135deg, #e6f7ff 0%, #f5fbff 100%)",
                padding: { xs: "12px", md: "24px" },
                width: "100%",
            }}
        >
            <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                style={{ width: "100%", maxWidth: "1600px" }}
            >
                <Box sx={{ width: "100%" }}>
                    {isLoading && (
                        <Box
                            sx={{
                                position: "fixed",
                                top: 0,
                                left: 0,
                                width: "100%",
                                height: "100%",
                                backgroundColor: "rgba(0, 0, 0, 0.4)",
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                                zIndex: 9999,
                            }}
                        >
                            <CircularProgress sx={{ color: "#003087" }} size={40} />
                        </Box>
                    )}

                    {tratamientoActivo ? (
                        <ActiveTreatmentWarning onBack={handleBack} />
                    ) : (
                        <Paper
                            elevation={8}
                            sx={{
                                padding: { xs: "20px", sm: "30px", md: "50px" },
                                width: "100%",
                                borderRadius: "20px",
                                backgroundColor: "rgba(255, 255, 255, 0.92)",
                                backdropFilter: "blur(12px)",
                                boxShadow: "0 8px 30px rgba(31, 38, 135, 0.2)",
                                border: "1px solid rgba(255, 255, 255, 0.2)",
                                marginTop: { xs: "20px", md: "30px" },
                            }}
                        >
                            <Typography
                                variant="h4"
                                sx={{
                                    color: "#003087",
                                    textAlign: "center",
                                    fontWeight: "700",
                                    marginBottom: { xs: "20px", md: "30px" },
                                    fontFamily: "'Poppins', sans-serif",
                                    textShadow: "2px 2px 4px rgba(0, 0, 0, 0.15)",
                                    fontSize: { xs: "1.5rem", sm: "2rem", md: "2.25rem" },
                                }}
                            >
                                Agendar Cita Dental
                            </Typography>

                            <Box sx={{ display: "flex", flexDirection: "column", gap: { xs: "20px", md: "30px" } }}>
                                {/* Selección de Servicio */}
                                <motion.div
                                    initial={{ opacity: 0, x: -50 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.2, duration: 0.6 }}
                                >
                                    <FormControl fullWidth>
                                        <Typography
                                            variant="subtitle1"
                                            sx={{
                                                color: "#003087",
                                                mb: 1,
                                                fontFamily: "'Poppins', sans-serif",
                                                fontSize: { xs: "0.9rem", md: "1rem" },
                                                fontWeight: "bold"
                                            }}
                                        >
                                            Selecciona un servicio
                                        </Typography>
                                        <Select
                                            value={servicioSeleccionado}
                                            onChange={(e) => setServicioSeleccionado(e.target.value)}
                                            displayEmpty
                                            sx={inputStyles}
                                            startAdornment={
                                                <InputAdornment position="start">
                                                    <MedicalServicesOutlinedIcon sx={{ color: "#003087", fontSize: { xs: 24, md: 28 } }} />
                                                </InputAdornment>
                                            }
                                            MenuProps={menuProps}
                                            aria-label="Selecciona un servicio"
                                        >
                                            <MenuItem disabled value="">
                                                Selecciona un servicio
                                            </MenuItem>
                                            {servicios.map((servicio) => (
                                                <MenuItem key={servicio.id} value={servicio.nombre}>
                                                    <Box sx={{ display: "flex", justifyContent: "space-between", width: "100%" }}>
                                                        <Typography sx={{ fontWeight: "500" }}>{servicio.nombre}</Typography>
                                                        {servicio.requiere_evaluacion ? (
                                                            <Typography sx={{ color: "#d32f2f", fontStyle: "italic", fontSize: "0.9rem" }}>
                                                                Requiere valoración
                                                            </Typography>
                                                        ) : (
                                                            <Typography sx={{ fontWeight: "bold", fontSize: "0.9rem" }}>
                                                                ${servicio.precio} MXN
                                                            </Typography>
                                                        )}
                                                    </Box>
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </motion.div>

                                {/* Selección de Fecha */}
                                <motion.div
                                    initial={{ opacity: 0, x: -50 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.4, duration: 0.6 }}
                                >
                                    <Box sx={{ alignSelf: "flex-start", width: "100%", maxWidth: { xs: "100%", md: "450px" } }}>
                                        <Typography
                                            variant="subtitle1"
                                            sx={{
                                                color: "#003087",
                                                mb: 1,
                                                fontFamily: "'Poppins', sans-serif",
                                                fontWeight: "bold",
                                            }}
                                        >
                                            Fecha de la cita
                                        </Typography>
                                        <Typography
                                            variant="caption"
                                            sx={{
                                                color: "#d32f2f",
                                                fontWeight: "bold",
                                                mb: 1.5,
                                                fontFamily: "'Poppins', sans-serif",
                                                fontSize: { xs: "0.8rem", md: "0.9rem" },
                                                display: "block",
                                            }}
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
                                                        sx={inputStyles}
                                                        InputProps={{
                                                            startAdornment: (
                                                                <InputAdornment position="start">
                                                                    <CalendarMonthOutlinedIcon sx={{ color: "#003087", fontSize: { xs: 24, md: 28 } }} />
                                                                </InputAdornment>
                                                            ),
                                                        }}
                                                        aria-label="Selecciona la fecha de la cita"
                                                    />
                                                )}
                                                disablePast
                                                maxDate={new Date(new Date().setDate(new Date().getDate() + 30))}
                                                inputFormat="dd/MM/yyyy"
                                                shouldDisableDate={(date) => ![1, 2, 3, 6].includes(date.getDay())}
                                            />
                                        </LocalizationProvider>
                                    </Box>
                                </motion.div>

                                {/* Selección de Hora */}
                                <motion.div
                                    initial={{ opacity: 0, x: -50 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.6, duration: 0.6 }}
                                >
                                    <FormControl fullWidth>
                                        <Typography
                                            variant="subtitle1"
                                            sx={{
                                                color: "#003087",
                                                mb: 1,
                                                fontFamily: "'Poppins', sans-serif",
                                                fontWeight: "bold",
                                            }}
                                        >
                                            Hora de la cita
                                        </Typography>
                                        <Select
                                            value={horaSeleccionada}
                                            onChange={(e) => setHoraSeleccionada(e.target.value)}
                                            displayEmpty
                                            disabled={!fechaSeleccionada || obtenerHorasDisponibles.length === 0}
                                            sx={inputStyles}
                                            startAdornment={
                                                <InputAdornment position="start">
                                                    <AccessTimeIcon sx={{ color: "#003087", fontSize: { xs: 24, md: 28 } }} />
                                                </InputAdornment>
                                            }
                                            MenuProps={menuProps}
                                            aria-label="Selecciona la hora de la cita"
                                        >
                                            {obtenerHorasDisponibles.length > 0 ? (
                                                obtenerHorasDisponibles.map((hora, index) => (
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

                                {/* Botones de Acción */}
                                <ActionButtons
                                    onBack={handleBack}
                                    onSubmit={handleAgendarCita}
                                    disabled={!servicioSeleccionado || !fechaSeleccionada || !horaSeleccionada || isLoading}
                                />
                            </Box>
                        </Paper>
                    )}

                    <Snackbar
                        open={alerta.mostrar}
                        onClose={() => setAlerta({ mostrar: false, mensaje: '', tipo: '' })}
                        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
                        autoHideDuration={5000}
                    >
                        <Alert
                            severity={alerta.tipo}
                            onClose={() => setAlerta({ mostrar: false, mensaje: '', tipo: '' })}
                            sx={{
                                borderRadius: "12px",
                                boxShadow: "0 6px 15px rgba(0, 0, 0, 0.15)",
                                fontFamily: "'Poppins', sans-serif",
                                fontSize: { xs: "0.9rem", md: "1rem" },
                                padding: "12px 20px",
                            }}
                        >
                            {alerta.mensaje}
                        </Alert>
                    </Snackbar>
                </Box>
            </motion.div>
        </Box>
    );
};

export default AgendarCita;