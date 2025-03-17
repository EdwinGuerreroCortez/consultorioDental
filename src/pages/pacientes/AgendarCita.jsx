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
                    maxWidth: "600px",
                    textAlign: "center",
                    backgroundColor: "#FFEBEE",
                    padding: { xs: "16px", md: "20px" },
                    borderRadius: "12px",
                    boxShadow: "0 8px 25px rgba(211, 47, 47, 0.2)",
                    border: "1px solid #D32F2F",
                    margin: "0 auto",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    transition: "all 0.3s ease-in-out",
                    "&:hover": {
                        boxShadow: "0 10px 30px rgba(211, 47, 47, 0.3)",
                        transform: "scale(1.02)",
                    },
                }}
            >
                <motion.div
                    animate={{ rotate: [0, -8, 8, 0], scale: [1, 1.1, 1] }}
                    transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                >
                    <ErrorOutlineOutlinedIcon
                        sx={{
                            fontSize: { xs: "40px", md: "50px" },
                            color: "#D32F2F",
                            marginBottom: "8px",
                            filter: "drop-shadow(0px 0px 8px rgba(211, 47, 47, 0.4))",
                        }}
                    />
                </motion.div>
                <Typography
                    variant="h6"
                    sx={{
                        fontWeight: "bold",
                        fontSize: { xs: "1rem", md: "1.25rem" },
                        color: "#D32F2F",
                        textShadow: "0px 0px 4px rgba(211, 47, 47, 0.2)",
                        fontFamily: "'Poppins', sans-serif",
                    }}
                >
                    No puedes agendar una cita
                </Typography>
                <Typography
                    variant="body2"
                    sx={{
                        fontSize: { xs: "0.85rem", md: "0.9rem" },
                        marginTop: "8px",
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
                        marginTop: "16px",
                        borderRadius: "10px",
                        padding: { xs: "8px 16px", md: "10px 20px" },
                        textTransform: "none",
                        fontSize: { xs: "0.85rem", md: "0.9rem" },
                        color: "#D32F2F",
                        borderColor: "#D32F2F",
                        fontFamily: "'Poppins', sans-serif",
                        "&:hover": {
                            borderColor: "#B71C1C",
                            backgroundColor: "rgba(211, 47, 47, 0.04)",
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
            marginTop: { xs: "12px", md: "30px" },
            gap: { xs: "12px", sm: "16px" },
        }}
    >
        <Button
            variant="outlined"
            onClick={onBack}
            startIcon={<ArrowBack />}
            sx={{
                borderRadius: "10px",
                padding: { xs: "8px 16px", md: "10px 20px" },
                textTransform: "none",
                fontSize: { xs: "0.85rem", md: "0.9rem" },
                color: "#003087",
                borderColor: "#003087",
                fontFamily: "'Poppins', sans-serif",
                "&:hover": {
                    borderColor: "#0057b7",
                    backgroundColor: "rgba(0, 87, 183, 0.04)",
                },
                width: { xs: "100%", sm: "auto" },
            }}
        >
            Atrás
        </Button>
        <Button
            variant="contained"
            onClick={onSubmit}
            startIcon={<CheckCircle />}
            disabled={disabled}
            sx={{
                background: "linear-gradient(135deg, #003087 0%, #0057b7 100%)",
                borderRadius: "10px",
                padding: { xs: "8px 16px", md: "10px 20px" },
                textTransform: "none",
                fontSize: { xs: "0.85rem", md: "0.9rem" },
                fontFamily: "'Poppins', sans-serif",
                fontWeight: 600,
                transition: "all 0.3s ease",
                "&:hover": {
                    background: "linear-gradient(135deg, #0057b7 0%, #003087 100%)",
                    boxShadow: "0 4px 15px rgba(0, 87, 183, 0.4)",
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

    const ultimaFechaConsultada = useRef(null);

    // Instancia de axios con configuración base
    const axiosInstance = useMemo(() => axios.create({
        baseURL: 'http://localhost:4000/api',
        withCredentials: true,
    }), []);

    // Verificar autenticación al montar el componente
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

    // Cargar datos cuando usuarioId esté disponible
    useEffect(() => {
        if (usuarioId) {
            verificarTratamientoActivo();
            obtenerTratamientos();
        }
    }, [usuarioId]);

    // Obtener citas ocupadas cuando cambia la fecha seleccionada
    useEffect(() => {
        if (fechaSeleccionada && ultimaFechaConsultada.current !== fechaSeleccionada) {
            obtenerCitasOcupadas();
            ultimaFechaConsultada.current = fechaSeleccionada;
        }
    }, [fechaSeleccionada]);

    // Función para obtener citas ocupadas
    const obtenerCitasOcupadas = useCallback(async () => {
        try {
            setIsLoading(true);
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
    }, [axiosInstance]);

    // Verificar si el usuario tiene un tratamiento activo
    const verificarTratamientoActivo = useCallback(async () => {
        if (!usuarioId) return;
        try {
            setIsLoading(true);
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
        } finally {
            setIsLoading(false);
        }
    }, [axiosInstance, usuarioId]);

    // Obtener tratamientos disponibles
    const obtenerTratamientos = useCallback(async () => {
        if (!usuarioId) return;
        try {
            setIsLoading(true);
            const response = await axiosInstance.get('/tratamientos');
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
    }, [axiosInstance, usuarioId]);

    // Obtener horas disponibles
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

    // Obtener token CSRF
    const obtenerTokenCSRF = useCallback(() => {
        const csrfToken = document.cookie
            .split("; ")
            .find(row => row.startsWith("XSRF-TOKEN="))
            ?.split("=")[1];
        return csrfToken || "";
    }, []);

    // Manejar el envío del formulario
    const handleAgendarCita = useCallback(async () => {
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
            const csrfToken = obtenerTokenCSRF();
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
        obtenerTokenCSRF,
    ]);

    // Manejar el botón "Atrás"
    const handleBack = useCallback(() => {
        console.log("Regresar a la página anterior");
    }, []);

    // Estilos para los menús desplegables
    const menuProps = {
        PaperProps: {
            sx: {
                borderRadius: "8px",
                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                backgroundColor: "rgba(255, 255, 255, 0.95)",
                backdropFilter: "blur(5px)",
                maxHeight: "250px",
                "& .MuiMenu-list": {
                    padding: "6px",
                },
            },
        },
    };

    // Estilos para los campos de formulario
    const inputStyles = {
        "& .MuiOutlinedInput-root": {
            "& fieldset": { borderColor: "rgba(0, 87, 183, 0.5)" },
            "&:hover fieldset": { borderColor: "#0057b7" },
            "&.Mui-focused fieldset": { borderColor: "#003087" },
            backgroundColor: "rgba(255, 255, 255, 0.9)",
            borderRadius: "8px",
            transition: "all 0.3s ease",
        },
        "& .MuiInputBase-input": {
            fontSize: { xs: "0.9rem", md: "1rem" },
            padding: { xs: "10px 16px", md: "12px 20px" },
        },
        fontFamily: "'Poppins', sans-serif",
    };

    return (
        <Box
            sx={{
                display: "flex",
                justifyContent: "center",
                minHeight: "auto", // Eliminado minHeight: "100vh" para mover el formulario más arriba
                background: "linear-gradient(135deg, #e6f7ff 0%, #ffffff 100%)",
                padding: { xs: "8px", md: "16px" }, // Reducido el padding superior
            }}
        >
            <Box sx={{ width: "100%", maxWidth: "1400px" }}>
                {isLoading && (
                    <Box
                        sx={{
                            position: "fixed",
                            top: 0,
                            left: 0,
                            width: "100%",
                            height: "100%",
                            backgroundColor: "rgba(0, 0, 0, 0.3)",
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            zIndex: 9999,
                        }}
                    >
                        <CircularProgress sx={{ color: "#003087" }} size={30} />
                    </Box>
                )}

                {tratamientoActivo ? (
                    <ActiveTreatmentWarning onBack={handleBack} />
                ) : (
                    <Paper
                        elevation={6}
                        sx={{
                            padding: { xs: "12px", sm: "20px", md: "40px" },
                            width: "100%",
                            maxWidth: "100%",
                            borderRadius: "16px",
                            backgroundColor: "rgba(255, 255, 255, 0.9)",
                            backdropFilter: "blur(10px)",
                            boxShadow: "0 6px 24px rgba(31, 38, 135, 0.15)",
                            border: "1px solid rgba(255, 255, 255, 0.18)",
                            marginTop: { xs: "16px", md: "24px" }, // Añadido margen superior para separar del borde
                        }}
                    >
                        <Typography
                            variant="h5"
                            sx={{
                                color: "#003087",
                                textAlign: "center",
                                fontWeight: "700",
                                marginBottom: { xs: "12px", md: "24px" },
                                fontFamily: "'Poppins', sans-serif",
                                textShadow: "1px 1px 2px rgba(0, 0, 0, 0.1)",
                                fontSize: { xs: "1.25rem", sm: "1.5rem", md: "1.75rem" },
                            }}
                        >
                            Agendar Cita Dental
                        </Typography>

                        <Box sx={{ display: "flex", flexDirection: "column", gap: { xs: "12px", md: "24px" } }}>
                            {/* Selección de Servicio */}
                            <FormControl fullWidth>
                                <Typography
                                    variant="subtitle2"
                                    sx={{
                                        fontWeight: "medium",
                                        color: "#003087",
                                        mb: 0.5,
                                        fontFamily: "'Poppins', sans-serif",
                                        fontSize: { xs: "0.85rem", md: "0.9rem" },
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
                                            <MedicalServicesOutlinedIcon sx={{ color: "#003087", fontSize: { xs: 20, md: 24 } }} />
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
                                            {servicio.nombre} -{' '}
                                            {servicio.requiere_evaluacion ? (
                                                <em style={{ color: "#d32f2f", fontStyle: "italic", fontSize: "0.85rem" }}>
                                                    Requiere valoración
                                                </em>
                                            ) : (
                                                <span style={{ fontWeight: "bold", fontSize: "0.85rem" }}>${servicio.precio} MXN</span>
                                            )}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                            {/* Selección de Fecha */}
                            <Box sx={{ alignSelf: "flex-start", width: "100%", maxWidth: { xs: "100%", md: "400px" } }}>
                                <Typography
                                    variant="subtitle2"
                                    sx={{
                                        fontWeight: "medium",
                                        color: "#003087",
                                        mb: 0.5,
                                        fontFamily: "'Poppins', sans-serif",
                                        fontSize: { xs: "0.85rem", md: "0.9rem" },
                                    }}
                                >
                                    Fecha de la cita
                                </Typography>
                                <Typography
                                    variant="caption"
                                    sx={{
                                        color: "#d32f2f",
                                        fontWeight: "bold",
                                        mb: 1,
                                        fontFamily: "'Poppins', sans-serif",
                                        fontSize: { xs: "0.75rem", md: "0.85rem" },
                                        display: "block", // Asegura que el texto ocupe toda la línea
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
                                                            <CalendarMonthOutlinedIcon sx={{ color: "#003087", fontSize: { xs: 20, md: 24 } }} />
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

                            {/* Selección de Hora */}
                            <FormControl fullWidth>
                                <Typography
                                    variant="subtitle2"
                                    sx={{
                                        fontWeight: "medium",
                                        color: "#003087",
                                        mb: 0.5,
                                        fontFamily: "'Poppins', sans-serif",
                                        fontSize: { xs: "0.85rem", md: "0.9rem" },
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
                                            <AccessTimeIcon sx={{ color: "#003087", fontSize: { xs: 20, md: 24 } }} />
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

                            {/* Botones de Acción */}
                            <ActionButtons
                                onBack={handleBack}
                                onSubmit={handleAgendarCita}
                                disabled={!servicioSeleccionado || !fechaSeleccionada || !horaSeleccionada || isLoading}
                            />
                        </Box>
                    </Paper>
                )}

                {/* Snackbar para alertas */}
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
                            borderRadius: "10px",
                            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                            fontFamily: "'Poppins', sans-serif",
                            fontSize: { xs: "0.85rem", md: "0.9rem" },
                        }}
                    >
                        {alerta.mensaje}
                    </Alert>
                </Snackbar>
            </Box>
        </Box>
    );
};

export default AgendarCita;