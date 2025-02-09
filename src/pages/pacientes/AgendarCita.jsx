import React, { useState } from 'react';
import {
    Box,
    Typography,
    MenuItem,
    Select,
    FormControl,
    InputLabel,
    TextField,
    Button,
    Tooltip,
    IconButton,
    InputAdornment,
    Snackbar,
    Alert,
    AlertTitle,
} from "@mui/material";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import MedicalServicesOutlinedIcon from "@mui/icons-material/MedicalServicesOutlined";
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { es } from 'date-fns/locale';

const AgendarCita = () => {
    const [servicios, setServicios] = useState([
        { id: 1, nombre: 'Limpieza dental', duracion: 30, precio: 500 },
        { id: 2, nombre: 'Extracción de muela', duracion: 60, precio: 1200 },
        { id: 3, nombre: 'Blanqueamiento dental', duracion: 90, precio: 1500 },
    ]);
    const [servicioSeleccionado, setServicioSeleccionado] = useState('');
    const [fechaSeleccionada, setFechaSeleccionada] = useState(null);
    const [horaSeleccionada, setHoraSeleccionada] = useState('');
    const [disponibilidad, setDisponibilidad] = useState([
        '09:00 AM', '10:00 AM', '11:00 AM', '02:00 PM', '03:00 PM'
    ]);
    const [alerta, setAlerta] = useState({ mostrar: false, mensaje: '', tipo: '' });

    const handleAgendarCita = () => {
        if (servicioSeleccionado && fechaSeleccionada && horaSeleccionada) {
            setAlerta({
                mostrar: true,
                mensaje: `Cita agendada para el servicio "${servicioSeleccionado}" el ${fechaSeleccionada.toLocaleDateString()} a las ${horaSeleccionada}.`,
                tipo: 'success',
            });
        } else {
            setAlerta({
                mostrar: true,
                mensaje: 'Por favor, completa todos los campos antes de agendar la cita.',
                tipo: 'error',
            });
        }
    };

    return (
        <Box
            sx={{
                padding: "40px",
                backgroundColor: "#f0f9ff",
                minHeight: "100vh",
                boxSizing: "border-box",
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
                gap: "20px",
            }}
        >
            {/* Título del componente */}
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

            {/* Formulario */}
            <Box
                sx={{
                    width: "100%",
                    maxWidth: "900px",
                    padding: "40px",
                    backgroundColor: "#ffffff",
                    borderRadius: "16px",
                    boxShadow: "0 8px 24px rgba(0, 0, 0, 0.1)",
                }}
            >
                <FormControl fullWidth sx={{ marginBottom: "20px" }}>
                    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <Typography variant="h6" sx={{ fontWeight: "bold", color: "#333" }}>
                            Servicio
                        </Typography>
                        <Tooltip title="Consulta más detalles en la sección de servicios." arrow>
                            <IconButton size="small">
                                <InfoOutlinedIcon color="info" />
                            </IconButton>
                        </Tooltip>
                    </Box>
                    <Select
                        value={servicioSeleccionado}
                        onChange={(e) => setServicioSeleccionado(e.target.value)}
                        displayEmpty
                        sx={{
                            marginTop: "10px",
                            borderRadius: "12px",
                            backgroundColor: "#e6f7ff",
                            '& .MuiSelect-icon': { color: '#0077b6' },
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
                                {servicio.nombre} - ${servicio.precio} MXN
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
                        textTransform: "none",
                        backgroundColor: "#0077b6",
                        boxShadow: "0 6px 16px rgba(0, 0, 0, 0.1)",
                        '&:hover': {
                            backgroundColor: '#005f8d',
                        },
                    }}
                >
                    Confirmar Cita
                </Button>
            </Box>

            {/* Snackbar para mostrar alertas */}
            <Snackbar
                open={alerta.mostrar}
                onClose={() => setAlerta({ mostrar: false, mensaje: '', tipo: '' })}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
                autoHideDuration={5000}
            >
                <Alert severity={alerta.tipo} onClose={() => setAlerta({ mostrar: false, mensaje: '', tipo: '' })}>
                    <AlertTitle>{alerta.tipo === 'success' ? 'Éxito' : 'Error'}</AlertTitle>
                    {alerta.mensaje}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default AgendarCita;
