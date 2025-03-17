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
import ErrorOutlineOutlinedIcon from '@mui/icons-material/ErrorOutlineOutlined';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { es } from 'date-fns/locale';
import { motion } from "framer-motion";

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

  const axiosInstance = axios.create({
    baseURL: 'http://localhost:4000/api',
    withCredentials: true,
  });

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
          ? 'Tratamiento creado correctamente, pendiente de valoración.'
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
    console.log("Regresar a la página anterior");
  };

  const horasDisponibles = useMemo(() => obtenerHorasDisponibles(), [fechaSeleccionada, citasOcupadas]);

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
        backgroundColor: "#e6f7ff",
      }}
    >
      <Box sx={{ width: "100%", maxWidth: "1100px", padding: "16px" }}>
        {tratamientoActivo ? (
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -30, scale: 0.5 }}
            transition={{
              duration: 0.8,
              ease: "easeOut",
              type: "spring",
              stiffness: 150
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
                  padding: { xs: "20px", md: "25px" },
                  borderRadius: "15px",
                  boxShadow: "0 12px 35px rgba(211, 47, 47, 0.3)",
                  border: "2px solid #D32F2F",
                  margin: "0 auto",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  transition: "all 0.3s ease-in-out",
                  "&:hover": {
                    boxShadow: "0 15px 40px rgba(211, 47, 47, 0.5)",
                    transform: "scale(1.02)"
                  },
                }}
              >
                <motion.div
                  animate={{ rotate: [0, -8, 8, 0], scale: [1, 1.1, 1] }}
                  transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                >
                  <ErrorOutlineOutlinedIcon
                    sx={{
                      fontSize: { xs: "50px", md: "60px" },
                      color: "#D32F2F",
                      marginBottom: "10px",
                      filter: "drop-shadow(0px 0px 10px rgba(211, 47, 47, 0.5))"
                    }}
                  />
                </motion.div>
                <Typography
                  variant="h5"
                  sx={{
                    fontWeight: "bold",
                    fontSize: { xs: "18px", md: "22px" },
                    color: "#D32F2F",
                    textShadow: "0px 0px 5px rgba(211, 47, 47, 0.3)",
                    fontFamily: "'Poppins', sans-serif",
                  }}
                >
                  No puedes agendar una cita
                </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    fontSize: { xs: "14px", md: "16px" },
                    marginTop: "10px",
                    color: "#B71C1C",
                    fontWeight: "500",
                    fontFamily: "'Poppins', sans-serif",
                  }}
                >
                  Ya tienes un tratamiento en curso. Debes finalizarlo antes de agendar otra cita.
                </Typography>
              </Box>
            </motion.div>
          </motion.div>
        ) : (
          <Paper
            elevation={6}
            sx={{
              padding: { xs: "16px", sm: "24px", md: "50px" },
              width: "100%",
              maxWidth: "100%",
              borderRadius: "20px",
              backgroundColor: "rgba(255, 255, 255, 0.85)",
              backdropFilter: "blur(10px)",
              boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.2)",
              border: "1px solid rgba(255, 255, 255, 0.18)",
            }}
          >
            <Typography
              variant="h4"
              sx={{
                color: "#003087",
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

            <Box sx={{ display: "flex", flexDirection: "column", gap: { xs: "16px", md: "30px" } }}>
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
                  MenuProps={menuProps}
                >
                  <MenuItem disabled value="">
                    Selecciona un servicio
                  </MenuItem>
                  {servicios.map((servicio) => (
                    <MenuItem key={servicio.id} value={servicio.nombre}>
                      {servicio.nombre} -{' '}
                      {servicio.requiere_evaluacion ? (
                        <em style={{ color: "#d32f2f", fontStyle: "italic" }}>Requiere valoración</em>
                      ) : (
                        <span style={{ fontWeight: "bold" }}>${servicio.precio} MXN</span>
                      )}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

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
                    shouldDisableDate={(date) => ![1, 2, 3, 6].includes(date.getDay())}
                  />
                </LocalizationProvider>
              </Box>

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
                  onChange={(e) => setHoraSeleccionada(e.target.value)}
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
                  MenuProps={menuProps}
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
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
              fontFamily: "'Poppins', sans-serif",
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