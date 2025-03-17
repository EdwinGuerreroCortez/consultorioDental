import React, { useState, useEffect, useRef, useMemo } from 'react';
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
} from "@mui/material";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import MedicalServicesOutlinedIcon from "@mui/icons-material/MedicalServicesOutlined";
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CheckCircle from "@mui/icons-material/CheckCircle";
import ArrowBack from "@mui/icons-material/ArrowBack";
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
    const [disponibilidad] = useState([
        '09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '01:00 PM',
        '03:00 PM', '04:00 PM', '05:00 PM', '06:00 PM'
    ]);
    const [citasOcupadas, setCitasOcupadas] = useState([]);
    const [alerta, setAlerta] = useState({ mostrar: false, mensaje: '', tipo: '' });

    // Obtiene el usuario autenticado al montar el componente
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

    // Configurar Axios con la URL de producción
    const axiosInstance = axios.create({
        baseURL: 'http://localhost:4000/api',
        withCredentials: true,
    });

    // Ejecuta las peticiones solo cuando `usuarioId` tiene valor
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

    const obtenerTokenCSRF = () => {
        const csrfToken = document.cookie
            .split("; ")
            .find(row => row.startsWith("XSRF-TOKEN="))
            ?.split("=")[1];
        return csrfToken || "";
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
                    ? 'Tratamiento creado correctamente, pendiente de evaluación.'
                    : 'Tratamiento, citas y pagos creados correctamente.',
                tipo: 'success',
            });

        } catch (error) {
            console.error('❌ Error al agendar la cita:', error);
            setAlerta({
                mostrar: true,
                mensaje: 'Error al agendar la cita. Inténtalo nuevamente.',
                tipo: 'error',
            });
        }
    };

    const handleBack = () => {
        // Aquí podrías implementar una lógica para regresar, como navegar a otra página
        console.log("Regresar a la página anterior");
    };

    const horasDisponibles = useMemo(() => obtenerHorasDisponibles(), [fechaSeleccionada, citasOcupadas]);

    // Estilos personalizados para el menú desplegable de los Select
    const menuProps = {
        PaperProps: {
            sx: {
                borderRadius: "10px",
                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                backgroundColor: "rgba(255, 255, 255, 0.95)",
                backdropFilter: "blur(5px)",
                maxHeight: "300px",
                "& .MuiMenu-list": {
                    padding: "8px",
                },
            },
        },
    };

    return (
        <Box
            sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                minHeight: "100vh",
                backgroundColor: "#e6f7ff", // Fondo claro como en Registro
            }}
        >
            <Box sx={{ width: "100%", maxWidth: "1100px", padding: "16px" }}>
                <Paper
                    elevation={6}
                    sx={{
                        padding: { xs: "16px", sm: "24px", md: "50px" }, // Responsive padding
                        width: "100%",
                        maxWidth: "100%",
                        borderRadius: "20px",
                        backgroundColor: "rgba(255, 255, 255, 0.85)", // Fondo translúcido como en Registro
                        backdropFilter: "blur(10px)",
                        boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.2)",
                        border: "1px solid rgba(255, 255, 255, 0.18)",
                    }}
                >
                    <Typography
                        variant="h4"
                        sx={{
                            color: "#003087", // Color principal como en Registro
                            textAlign: "center",
                            fontWeight: "700",
                            marginBottom: { xs: "16px", md: "30px" },
                            fontFamily: "'Poppins', sans-serif",
                            textShadow: "1px 1px 2px rgba(0, 0, 0, 0.1)",
                            fontSize: { xs: "1.5rem", sm: "2rem", md: "2.5rem" },
                        }}
                    >
                        Agendar Cita Dental
                    </Typography>

                    {/* Si el usuario tiene un tratamiento en curso, mostrar el mensaje */}
                    {tratamientoActivo ? (
                        <Box sx={{ textAlign: "center" }}>
                            <Typography
                                variant="h5"
                                sx={{
                                    fontWeight: "bold",
                                    fontSize: { xs: "18px", md: "22px" },
                                    color: "#d32f2f",
                                    fontFamily: "'Poppins', sans-serif",
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
                                    fontFamily: "'Poppins', sans-serif",
                                }}
                            >
                                Debes finalizar tu tratamiento actual antes de agendar otro.
                            </Typography>
                        </Box>
                    ) : (
                        <Box sx={{ display: "flex", flexDirection: "column", gap: { xs: "16px", md: "30px" } }}>
                            {/* Campo: Servicio */}
                            <FormControl fullWidth>
                                <Typography
                                    variant="subtitle1"
                                    sx={{
                                        fontWeight: "medium",
                                        color: "#003087",
                                        mb: 1,
                                        fontFamily: "'Poppins', sans-serif",
                                        fontSize: { xs: "0.9rem", md: "1.1rem" },
                                    }}
                                >
                                    Selecciona un servicio
                                </Typography>
                                <Select
                                    value={servicioSeleccionado}
                                    onChange={(e) => setServicioSeleccionado(e.target.value)}
                                    displayEmpty
                                    sx={{
                                        "& .MuiOutlinedInput-root": {
                                            "& fieldset": { borderColor: "rgba(0, 87, 183, 0.5)" },
                                            "&:hover fieldset": { borderColor: "#0057b7" },
                                            "&.Mui-focused fieldset": { borderColor: "#003087" },
                                            backgroundColor: "rgba(255, 255, 255, 0.9)",
                                            borderRadius: "10px",
                                            transition: "all 0.3s ease",
                                        },
                                        "& .MuiInputBase-input": {
                                            fontSize: { xs: "1rem", md: "1.2rem" },
                                            padding: { xs: "12px 20px", md: "15px 25px" },
                                        },
                                        fontFamily: "'Poppins', sans-serif",
                                    }}
                                    startAdornment={
                                        <InputAdornment position="start">
                                            <MedicalServicesOutlinedIcon sx={{ color: "#003087" }} />
                                        </InputAdornment>
                                    }
                                    MenuProps={menuProps} // Aplicamos los estilos al menú desplegable
                                >
                                    <MenuItem
                                        disabled
                                        value=""
                                        sx={{
                                            fontFamily: "'Poppins', sans-serif",
                                            fontSize: { xs: "0.9rem", md: "1rem" },
                                            color: "#666",
                                            "&.Mui-disabled": {
                                                opacity: 0.7,
                                            },
                                        }}
                                    >
                                        Selecciona un servicio
                                    </MenuItem>
                                    {servicios.map((servicio) => (
                                        <MenuItem
                                            key={servicio.id}
                                            value={servicio.nombre}
                                            sx={{
                                                fontFamily: "'Poppins', sans-serif",
                                                fontSize: { xs: "0.9rem", md: "1rem" },
                                                color: "#333",
                                                padding: "10px 16px",
                                                borderRadius: "8px",
                                                transition: "all 0.3s ease",
                                                "&:hover": {
                                                    backgroundColor: "rgba(0, 87, 183, 0.1)",
                                                    color: "#003087",
                                                },
                                                "&.Mui-selected": {
                                                    backgroundColor: "rgba(0, 87, 183, 0.2)",
                                                    color: "#003087",
                                                    "&:hover": {
                                                        backgroundColor: "rgba(0, 87, 183, 0.3)",
                                                    },
                                                },
                                            }}
                                        >
                                            {servicio.nombre} -{' '}
                                            {servicio.requiere_evaluacion ? (
                                                <em style={{ color: "#d32f2f", fontStyle: "italic" }}>
                                                    Requiere evaluación
                                                </em>
                                            ) : (
                                                <span style={{ fontWeight: "bold" }}>
                                                    ${servicio.precio} MXN
                                                </span>
                                            )}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>

                            {/* Campo: Fecha de la cita */}
                            <Box>
                                <Typography
                                    variant="subtitle1"
                                    sx={{
                                        fontWeight: "medium",
                                        color: "#003087",
                                        mb: 1,
                                        fontFamily: "'Poppins', sans-serif",
                                        fontSize: { xs: "0.9rem", md: "1.1rem" },
                                    }}
                                >
                                    Fecha de la cita
                                </Typography>
                                <Typography
                                    variant="body2"
                                    sx={{
                                        color: "#d32f2f",
                                        fontWeight: "bold",
                                        mb: 1,
                                        fontFamily: "'Poppins', sans-serif",
                                        fontSize: { xs: "0.8rem", md: "1rem" },
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
                                                sx={{
                                                    "& .MuiOutlinedInput-root": {
                                                        "& fieldset": { borderColor: "rgba(0, 87, 183, 0.5)" },
                                                        "&:hover fieldset": { borderColor: "#0057b7" },
                                                        "&.Mui-focused fieldset": { borderColor: "#003087" },
                                                        backgroundColor: "rgba(255, 255, 255, 0.9)",
                                                        borderRadius: "10px",
                                                        transition: "all 0.3s ease",
                                                    },
                                                    "& .MuiInputBase-input": {
                                                        fontSize: { xs: "1rem", md: "1.2rem" },
                                                        padding: { xs: "12px 20px", md: "15px 25px" },
                                                    },
                                                    "& .MuiInputLabel-root": {
                                                        color: "#003087",
                                                        fontSize: { xs: "0.9rem", md: "1.1rem" },
                                                    },
                                                    "& .MuiInputLabel-root.Mui-focused": { color: "#0057b7" },
                                                    fontFamily: "'Poppins', sans-serif",
                                                }}
                                                InputProps={{
                                                    startAdornment: (
                                                        <InputAdornment position="start">
                                                            <CalendarMonthOutlinedIcon sx={{ color: "#003087" }} />
                                                        </InputAdornment>
                                                    ),
                                                }}
                                            />
                                        )}
                                        disablePast
                                        maxDate={new Date(new Date().setDate(new Date().getDate() + 30))}
                                        inputFormat="dd/MM/yyyy"
                                        shouldDisableDate={(date) => {
                                            const day = date.getDay();
                                            return ![1, 2, 3, 6].includes(day);
                                        }}
                                    />
                                </LocalizationProvider>
                            </Box>

                            {/* Campo: Hora */}
                            <FormControl fullWidth>
                                <Typography
                                    variant="subtitle1"
                                    sx={{
                                        fontWeight: "medium",
                                        color: "#003087",
                                        mb: 1,
                                        fontFamily: "'Poppins', sans-serif",
                                        fontSize: { xs: "0.9rem", md: "1.1rem" },
                                    }}
                                >
                                    Hora de la cita
                                </Typography>
                                <Select
                                    value={horaSeleccionada}
                                    onChange={(e) => {
                                        setHoraSeleccionada(e.target.value);
                                        console.log("🕒 Hora seleccionada:", e.target.value);
                                        console.log("📦 Datos actuales antes de enviar:", {
                                            usuarioId,
                                            servicioSeleccionado,
                                            fechaSeleccionada: fechaSeleccionada ? fechaSeleccionada.toISOString().split('T')[0] : "No seleccionada",
                                            horaSeleccionada: e.target.value
                                        });
                                    }}
                                    displayEmpty
                                    disabled={!fechaSeleccionada || horasDisponibles.length === 0}
                                    sx={{
                                        "& .MuiOutlinedInput-root": {
                                            "& fieldset": { borderColor: "rgba(0, 87, 183, 0.5)" },
                                            "&:hover fieldset": { borderColor: "#0057b7" },
                                            "&.Mui-focused fieldset": { borderColor: "#003087" },
                                            backgroundColor: "rgba(255, 255, 255, 0.9)",
                                            borderRadius: "10px",
                                            transition: "all 0.3s ease",
                                        },
                                        "& .MuiInputBase-input": {
                                            fontSize: { xs: "1rem", md: "1.2rem" },
                                            padding: { xs: "12px 20px", md: "15px 25px" },
                                        },
                                        fontFamily: "'Poppins', sans-serif",
                                    }}
                                    startAdornment={
                                        <InputAdornment position="start">
                                            <AccessTimeIcon sx={{ color: "#003087" }} />
                                        </InputAdornment>
                                    }
                                    MenuProps={menuProps} // Aplicamos los estilos al menú desplegable
                                >
                                    {horasDisponibles.length > 0 ? (
                                        horasDisponibles.map((hora, index) => (
                                            <MenuItem
                                                key={index}
                                                value={hora}
                                                sx={{
                                                    fontFamily: "'Poppins', sans-serif",
                                                    fontSize: { xs: "0.9rem", md: "1rem" },
                                                    color: "#333",
                                                    padding: "10px 16px",
                                                    borderRadius: "8px",
                                                    transition: "all 0.3s ease",
                                                    "&:hover": {
                                                        backgroundColor: "rgba(0, 87, 183, 0.1)",
                                                        color: "#003087",
                                                    },
                                                    "&.Mui-selected": {
                                                        backgroundColor: "rgba(0, 87, 183, 0.2)",
                                                        color: "#003087",
                                                        "&:hover": {
                                                            backgroundColor: "rgba(0, 87, 183, 0.3)",
                                                        },
                                                    },
                                                }}
                                            >
                                                {hora}
                                            </MenuItem>
                                        ))
                                    ) : (
                                        <MenuItem
                                            disabled
                                            sx={{
                                                fontFamily: "'Poppins', sans-serif",
                                                fontSize: { xs: "0.9rem", md: "1rem" },
                                                color: "#666",
                                                "&.Mui-disabled": {
                                                    opacity: 0.7,
                                                },
                                            }}
                                        >
                                            No hay horarios disponibles
                                        </MenuItem>
                                    )}
                                </Select>
                            </FormControl>

                            {/* Botones */}
                            <Box
                                sx={{
                                    display: "flex",
                                    flexDirection: { xs: "column", sm: "row" },
                                    justifyContent: "space-between",
                                    marginTop: { xs: "16px", md: "40px" },
                                    gap: { xs: "16px", sm: "0" },
                                }}
                            >
                                <Button
                                    variant="outlined"
                                    onClick={handleBack}
                                    startIcon={<ArrowBack />}
                                    sx={{
                                        borderRadius: "12px",
                                        padding: { xs: "10px 20px", md: "15px 40px" },
                                        textTransform: "none",
                                        fontSize: { xs: "1rem", md: "1.2rem" },
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
                                    onClick={handleAgendarCita}
                                    startIcon={<CheckCircle />}
                                    disabled={!servicioSeleccionado || !fechaSeleccionada || !horaSeleccionada}
                                    sx={{
                                        background: "linear-gradient(135deg, #003087 0%, #0057b7 100%)",
                                        borderRadius: "12px",
                                        padding: { xs: "10px 20px", md: "15px 40px" },
                                        textTransform: "none",
                                        fontSize: { xs: "1rem", md: "1.2rem" },
                                        fontFamily: "'Poppins', sans-serif",
                                        fontWeight: 600,
                                        transition: "all 0.3s ease",
                                        "&:hover": {
                                            background: "linear-gradient(135deg, #0057b7 0%, #003087 100%)",
                                            boxShadow: "0 4px 15px rgba(0, 87, 183, 0.4)",
                                            transform: "translateY(-2px)",
                                        },
                                        width: { xs: "100%", sm: "auto" },
                                    }}
                                >
                                    Confirmar Cita
                                </Button>
                            </Box>
                        </Box>
                    )}
                </Paper>
            </Box>

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
                        borderRadius: "12px",
                        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                        fontFamily: "'Poppins', sans-serif",
                    }}
                >
                    {alerta.mensaje}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default AgendarCita;