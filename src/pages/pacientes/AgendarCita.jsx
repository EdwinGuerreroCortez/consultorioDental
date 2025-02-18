import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import {jwtDecode} from 'jwt-decode';  // Importación correcta
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
    const [tratamientoActivo, setTratamientoActivo] = useState(false); // ✅ Estado para bloquear el formulario si hay un tratamiento en curso

    const [servicios, setServicios] = useState([]);
    const [servicioSeleccionado, setServicioSeleccionado] = useState('');
    const [fechaSeleccionada, setFechaSeleccionada] = useState(null);
    const [horaSeleccionada, setHoraSeleccionada] = useState('');
    const [disponibilidad, setDisponibilidad] = useState([
        '09:00 AM', '10:00 AM', '11:00 AM', '02:00 PM', '03:00 PM',
    ]);
    const [alerta, setAlerta] = useState({ mostrar: false, mensaje: '', tipo: '' });

    // Obtener y decodificar el token de sesión desde la cookie
    const token = Cookies.get('sessionToken');
    const decodedToken = token ? jwtDecode(token) : null;
    const usuarioId = decodedToken?.id || null;

    useEffect(() => {
        if (!usuarioId) {
            setAlerta({
                mostrar: true,
                mensaje: 'No se ha encontrado la sesión del usuario. Inicia sesión nuevamente.',
                tipo: 'error',
            });
        }else {
            verificarTratamientoActivo(); // ✅ Llamamos la función aquí
        }
    }, [usuarioId]);

    // Configurar Axios para solicitudes a la API
    const axiosInstance = axios.create({
        baseURL: 'http://localhost:4000/api',
        withCredentials: true,
    });
    const verificarTratamientoActivo = async () => {
        try {
            const response = await axiosInstance.get(`/tratamientos-pacientes/verificar/${usuarioId}`);
            
            if (response.data.tieneTratamientoActivo) {
                setAlerta({
                    mostrar: true,
                    mensaje: 'Ya tienes un tratamiento activo. Finalízalo antes de agendar otro.',
                    tipo: 'warning',
                });
                setTratamientoActivo(true); // 🚫 Bloquea el formulario
            } else {
                setTratamientoActivo(false); // ✅ Permite usar el formulario
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
    
    // Obtener tratamientos desde el backend
    useEffect(() => {
        const obtenerTratamientos = async () => {
            try {
                const response = await axiosInstance.get('/tratamientos');
                const tratamientosActivos = response.data.filter(tratamiento => tratamiento.estado === 1);
                setServicios(tratamientosActivos);
            } catch (error) {
                setAlerta({
                    mostrar: true,
                    mensaje: 'Error al cargar los tratamientos.',
                    tipo: 'error',
                });
            }
        };

        if (usuarioId) obtenerTratamientos();
    }, [usuarioId]);

    const handleAgendarCita = async () => {
        if (servicioSeleccionado && fechaSeleccionada && horaSeleccionada) {
            try {
                const tratamientoSeleccionado = servicios.find(s => s.nombre === servicioSeleccionado);
    
                const estadoTratamiento = tratamientoSeleccionado.requiere_evaluacion
                    ? 'pendiente'
                    : 'en progreso';
    
                const [hora, periodo] = horaSeleccionada.split(' ');
                let [horas, minutos] = hora.split(':').map(Number);
    
                if (periodo === 'PM' && horas !== 12) horas += 12;
                if (periodo === 'AM' && horas === 12) horas = 0;
    
                const fechaHora = new Date(fechaSeleccionada);
                fechaHora.setHours(horas, minutos, 0, 0);
    
                // Enviar solicitud para crear el tratamiento
                const respuesta = await axiosInstance.post('/tratamientos-pacientes/crear', {
                    usuarioId,
                    tratamientoId: tratamientoSeleccionado.id,
                    citasTotales: tratamientoSeleccionado.citas_requeridas || 0,
                    fechaInicio: fechaHora.toISOString(),
                    estado: estadoTratamiento,
                    precio: tratamientoSeleccionado.precio,
                    requiereEvaluacion: tratamientoSeleccionado.requiere_evaluacion
                });
    
                // Mensaje según el tipo de tratamiento
                if (tratamientoSeleccionado.requiere_evaluacion) {
                    setAlerta({
                        mostrar: true,
                        mensaje: 'Tratamiento creado correctamente, pendiente de evaluación.',
                        tipo: 'info',
                    });
                } else {
                    setAlerta({
                        mostrar: true,
                        mensaje: 'Tratamiento, citas y pagos creados correctamente.',
                        tipo: 'success',
                    });
                }
            } catch (error) {
                console.error('Error al agendar la cita:', error.response || error.message);
                setAlerta({
                    mostrar: true,
                    mensaje: 'Error al agendar la cita. Inténtalo nuevamente.',
                    tipo: 'error',
                });
            }
        } else {
            setAlerta({
                mostrar: true,
                mensaje: 'Por favor, completa todos los campos.',
                tipo: 'error',
            });
        }
    };
    
    return (
        <Box
            sx={{
                padding: "40px",
                backgroundColor: "#f0f9ff",
                minHeight: "100vh", // 🔹 Asegura que cubra toda la pantalla
                boxSizing: "border-box",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "flex-start", // 🔹 Inicia desde arriba
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
                    padding: "20px 40px",
                    borderRadius: "12px",
                    boxShadow: "0 6px 20px rgba(0, 0, 0, 0.1)",
                    textAlign: "left",
                    marginTop: "10px", // 🔹 Se acerca más arriba
                }}
            >
                <Typography
                    variant="h4"
                    sx={{
                        fontWeight: "bold",
                        fontFamily: "'Poppins', sans-serif",
                        textShadow: "1px 1px 6px rgba(0, 0, 0, 0.2)",
                    }}
                >
                    Agendar Cita Dental
                </Typography>
                <Typography variant="subtitle1" sx={{ fontStyle: "italic", marginTop: "4px" }}>
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
                        padding: "20px",
                        borderRadius: "12px",
                        boxShadow: "0 6px 20px rgba(0, 0, 0, 0.1)",
                        marginTop: "15px", // 🔹 Lo acerca más al título
                    }}
                >
                    <Typography variant="h5" sx={{ fontWeight: "bold", color: "#d32f2f" }}>
                        Ya tienes un tratamiento en curso.
                    </Typography>
                    <Typography variant="body1" sx={{ marginTop: "10px", color: "#333" }}>
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
                        padding: "40px",
                        backgroundColor: "#ffffff",
                        borderRadius: "16px",
                        boxShadow: "0 8px 24px rgba(0, 0, 0, 0.1)",
                        marginTop: "15px", // 🔹 Lo acerca más al mensaje de advertencia
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
                                inputFormat="dd/MM/yyyy"
                            />
                        </LocalizationProvider>
                    </Box>
    
                    <FormControl fullWidth sx={{ marginBottom: "20px" }}>
                        <InputLabel>Hora</InputLabel>
                        <Select
                            value={horaSeleccionada}
                            onChange={(e) => setHoraSeleccionada(e.target.value)}
                            label="Hora"
                            startAdornment={
                                <InputAdornment position="start">
                                    <AccessTimeIcon color="primary" />
                                </InputAdornment>
                            }
                        >
                            {disponibilidad.map((hora, index) => (
                                <MenuItem key={index} value={hora}>
                                    {hora}
                                </MenuItem>
                            ))}
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
