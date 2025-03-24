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
  Alert,
  Grid,
} from "@mui/material";
import ErrorOutlineOutlinedIcon from '@mui/icons-material/ErrorOutlineOutlined';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { es } from 'date-fns/locale';
import { motion } from "framer-motion";

const AgendarCitaAdmin = () => {
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
  const [usuarioEncontrado, setUsuarioEncontrado] = useState(null);
  const [busquedaUsuario, setBusquedaUsuario] = useState({
    nombre: '',
    apellido_paterno: '',
    apellido_materno: '',
    fecha_nacimiento: null,
    email: '',
    telefono: ''
  });
  const [pasoActual, setPasoActual] = useState(1);
  const [csrfToken, setCsrfToken] = useState(null); // Nuevo estado para el token CSRF

  const inputStyle = {
    "& .MuiOutlinedInput-root": {
      borderRadius: "12px",
      backgroundColor: "#fff",
      fontFamily: "'Poppins', sans-serif",
      height: "56px",
      transition: "all 0.3s ease-in-out",
      "&:hover fieldset": { borderColor: "#78c1c8" },
      "&.Mui-focused fieldset": { borderColor: "#006d77", borderWidth: "2px" },
    },
    "& .MuiInputLabel-root": {
      fontFamily: "'Poppins', sans-serif",
      color: "#03445e",
      "&.Mui-focused": { color: "#006d77" },
    },
  };

  const selectStyle = {
    borderRadius: "12px",
    backgroundColor: "#fff",
    fontFamily: "'Poppins', sans-serif",
    height: "56px",
    "& .MuiOutlinedInput-notchedOutline": {
      borderColor: "#d2f4ea",
    },
    "&:hover .MuiOutlinedInput-notchedOutline": {
      borderColor: "#78c1c8",
    },
    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
      borderColor: "#006d77",
      borderWidth: "2px",
    },
  };

  const menuItemStyle = {
    fontFamily: "'Poppins', sans-serif",
    padding: "12px 20px",
    borderBottom: "1px solid #e0f7fa",
    transition: "all 0.3s ease-in-out",
    "&:hover": {
      backgroundColor: "#78c1c8",
      color: "#fff",
      boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
    },
  };

  useEffect(() => {
    if (alerta.mostrar) {
      const timer = setTimeout(() => setAlerta({ mostrar: false, mensaje: '', tipo: '' }), 3000);
      return () => clearTimeout(timer);
    }
  }, [alerta.mostrar]);

  useEffect(() => {
    const obtenerUsuario = async () => {
      const usuario = await verificarAutenticacion();
      if (usuario) setUsuarioId(usuario.id);
      else setAlerta({ mostrar: true, mensaje: 'No se ha encontrado la sesión del usuario.', tipo: 'error' });
    };
    obtenerUsuario();
  }, []);

  const axiosInstance = axios.create({
    baseURL: 'https://backenddent.onrender.com/api',
    withCredentials: true,
  });

  useEffect(() => {
    if (usuarioEncontrado) {
      verificarTratamientoActivo();
      obtenerTratamientos();
    }
  }, [usuarioEncontrado]);

  const obtenerCitasOcupadas = async () => {
    try {
      const response = await axiosInstance.get('/citas/activas');
      const citas = response.data.map(cita => ({
        ...cita,
        fecha_hora_mx: new Intl.DateTimeFormat('es-MX', {
          timeZone: 'America/Mexico_City',
          year: 'numeric', month: '2-digit', day: '2-digit',
          hour: '2-digit', minute: '2-digit', second: '2-digit',
          hour12: true
        }).format(new Date(cita.fecha_hora)),
      }));
      setCitasOcupadas(citas);
    } catch (error) {
      setAlerta({ mostrar: true, mensaje: 'Error al obtener citas ocupadas.', tipo: 'error' });
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
    if (!usuarioEncontrado?.id || !usuarioEncontrado?.tipo) return;
    try {
      const response = await axiosInstance.get(`/tratamientos-pacientes/verificar/${usuarioEncontrado.tipo}/${usuarioEncontrado.id}`);
      setTratamientoActivo(response.data.tieneTratamientoActivo);
      if (response.data.tieneTratamientoActivo) {
        setAlerta({ mostrar: true, mensaje: 'El paciente ya tiene un tratamiento activo.', tipo: 'warning' });
      }
    } catch (error) {
      setAlerta({ mostrar: true, mensaje: 'Error al verificar tratamiento.', tipo: 'error' });
    }
  };

  const obtenerHorasDisponibles = () => {
    if (!fechaSeleccionada) return disponibilidad;
    const fechaFormateada = fechaSeleccionada.toISOString().split('T')[0];
    const horasOcupadas = citasOcupadas
      .filter(cita => new Date(cita.fecha_hora).toISOString().split('T')[0] === fechaFormateada)
      .map(cita => new Date(cita.fecha_hora).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', hour12: true }).toUpperCase().replace(/\./g, ""));
    return disponibilidad.filter(hora => !horasOcupadas.includes(hora));
  };

  const obtenerTratamientos = async () => {
    if (!usuarioId) return;
    try {
      const response = await axiosInstance.get('/tratamientos');
      setServicios(response.data.filter(t => t.estado === 1));
    } catch (error) {
      setAlerta({ mostrar: true, mensaje: 'Error al cargar tratamientos.', tipo: 'error' });
    }
  };

  // Obtener el token CSRF al cargar el componente y guardarlo en el estado
  useEffect(() => {
    const obtenerTokenCSRF = async () => {
      try {
        const response = await fetch("https://backenddent.onrender.com/api/get-csrf-token", { credentials: "include" });
        const data = await response.json();
        setCsrfToken(data.csrfToken); // Guardar el token en el estado
      } catch (error) {
        console.error("Error obteniendo el token CSRF:", error);
      }
    };
    obtenerTokenCSRF();
  }, []);

  const buscarUsuario = async () => {
    const datosEnvio = {
      ...busquedaUsuario,
      fecha_nacimiento: busquedaUsuario.fecha_nacimiento ? busquedaUsuario.fecha_nacimiento.toISOString().split('T')[0] : "",
    };
    try {
      const response = await axios.post('https://backenddent.onrender.com/api/usuarios/buscar', datosEnvio, {
        headers: { 'X-XSRF-TOKEN': csrfToken }, // Usar el token del estado
        withCredentials: true,
      });
      if (response.data.length > 0) {
        const usuario = response.data[0];
        setUsuarioEncontrado({ ...usuario, tipo: usuario.tipo, fecha_nacimiento: usuario.fecha_nacimiento ? new Date(usuario.fecha_nacimiento) : null });
        setAlerta({ mostrar: true, mensaje: 'Usuario encontrado correctamente.', tipo: 'success' });
        setPasoActual(2);
      } else {
        setUsuarioEncontrado(null);
        setPasoActual(1);
        setAlerta({ mostrar: true, mensaje: 'No se encontró el usuario.', tipo: 'error' });
      }
    } catch (error) {
      setAlerta({ mostrar: true, mensaje: 'Error al buscar usuario.', tipo: 'error' });
    }
  };

  const handleAgendarCita = async () => {
    if (!servicioSeleccionado || !fechaSeleccionada || !horaSeleccionada) {
      setAlerta({ mostrar: true, mensaje: 'Completa todos los campos.', tipo: 'error' });
      return;
    }
    try {
      const tratamientoSeleccionado = servicios.find(s => s.nombre === servicioSeleccionado);
      const estadoTratamiento = tratamientoSeleccionado.requiere_evaluacion ? 'pendiente' : 'en progreso';
      const fechaSeleccionadaStr = fechaSeleccionada.toISOString().split('T')[0];
      const [hora, minutos] = horaSeleccionada.replace(/( AM| PM)/, '').split(':').map(Number);
      const esPM = horaSeleccionada.includes('PM');
      let horaFinal = esPM && hora !== 12 ? hora + 12 : hora;
      if (!esPM && hora === 12) horaFinal = 0;
      const fechaHoraLocal = new Date(`${fechaSeleccionadaStr}T${horaFinal.toString().padStart(2, '0')}:${minutos.toString().padStart(2, '0')}:00`);
      const fechaHoraUTC = new Date(fechaHoraLocal.getTime() - fechaHoraLocal.getTimezoneOffset() * 60000);

      let usuarioId = null, pacienteId = null;
      if (usuarioEncontrado) {
        if (usuarioEncontrado.tipo === 'usuario') usuarioId = usuarioEncontrado.id;
        else if (usuarioEncontrado.tipo === 'paciente_sin_plataforma') pacienteId = usuarioEncontrado.id;
      }
      if (!usuarioId && !pacienteId) throw new Error("No se pudo identificar el tipo de usuario.");

      const datosEnvio = {
        usuarioId,
        pacienteId,
        tratamientoId: tratamientoSeleccionado.id,
        citasTotales: tratamientoSeleccionado.citas_requeridas || 0,
        fechaInicio: fechaHoraUTC.toISOString(),
        estado: estadoTratamiento,
        precio: tratamientoSeleccionado.precio,
        requiereEvaluacion: tratamientoSeleccionado.requiere_evaluacion
      };
      await axiosInstance.post('/tratamientos-pacientes/crear', datosEnvio, { headers: { 'X-XSRF-TOKEN': csrfToken } }); // Usar el token del estado
      setAlerta({
        mostrar: true,
        mensaje: tratamientoSeleccionado.requiere_evaluacion ? 'Tratamiento pendiente de evaluación.' : 'Cita agendada correctamente.',
        tipo: 'success',
      });
      // Add a small delay to allow the success message to be visible before reloading
      setTimeout(() => {
        window.location.reload();
      }, 2000); // 2-second delay before reload
    } catch (error) {
      setAlerta({ mostrar: true, mensaje: 'Error al agendar la cita.', tipo: 'error' });
    }
  };

  const horasDisponibles = useMemo(() => obtenerHorasDisponibles(), [fechaSeleccionada, citasOcupadas]);

  return (
    <Box
      sx={{
        flexGrow: 1,
        padding: { xs: "20px", md: "40px 80px" },
        width: "100%",
        maxWidth: "1800px",
        backgroundColor: "transparent",
        fontFamily: "'Poppins', sans-serif",
        mx: "auto",
      }}
    >
      {/* Paso 1: Buscar Paciente */}
      {pasoActual === 1 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <Box
            sx={{
              width: "100%",
              padding: { xs: "30px", md: "40px" },
              background: "linear-gradient(135deg, #ffffff 0%, #e0f7fa 100%)",
              borderRadius: "16px",
              boxShadow: "0 8px 24px rgba(0, 0, 0, 0.15)",
              border: "1px solid #78c1c8",
            }}
          >
            <Typography
              variant="h5"
              sx={{
                fontWeight: 700,
                mb: "30px",
                textAlign: "center",
                color: "#006d77",
                fontFamily: "'Poppins', sans-serif",
                fontSize: "1.8rem",
              }}
            >
              Buscar Paciente
            </Typography>
            <Grid container spacing={3}>
              {[
                { label: "Nombre", value: "nombre" },
                { label: "Apellido Paterno", value: "apellido_paterno" },
                { label: "Apellido Materno", value: "apellido_materno" },
                { label: "Correo Electrónico (Opcional)", value: "email" },
                { label: "Teléfono (Opcional)", value: "telefono" },
              ].map((field, index) => (
                <Grid item xs={12} sm={6} key={index}>
                  <TextField
                    fullWidth
                    label={field.label}
                    variant="outlined"
                    value={busquedaUsuario[field.value]}
                    onChange={(e) => setBusquedaUsuario({ ...busquedaUsuario, [field.value]: e.target.value })}
                    sx={inputStyle}
                  />
                </Grid>
              ))}
              <Grid item xs={12} sm={6}>
                <LocalizationProvider dateAdapter={AdapterDateFns} locale={es}>
                  <DatePicker
                    label="Fecha de Nacimiento"
                    value={busquedaUsuario.fecha_nacimiento}
                    onChange={(newValue) => setBusquedaUsuario({ ...busquedaUsuario, fecha_nacimiento: newValue })}
                    renderInput={(params) => <TextField {...params} fullWidth sx={inputStyle} />}
                  />
                </LocalizationProvider>
              </Grid>
            </Grid>
            <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
              <Button
                variant="contained"
                onClick={buscarUsuario}
                sx={{
                  backgroundColor: "#006d77",
                  color: "#e0f7fa",
                  padding: "12px 40px",
                  borderRadius: "12px",
                  fontFamily: "'Poppins', sans-serif",
                  fontWeight: 600,
                  "&:hover": { backgroundColor: "#78c1c8", transform: "translateY(-2px)" },
                  transition: "all 0.3s ease-in-out",
                }}
              >
                Buscar Paciente
              </Button>
            </Box>
          </Box>
        </motion.div>
      )}

      {/* Tratamiento Activo */}
      {tratamientoActivo && (
        <motion.div initial={{ opacity: 0, y: -50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
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
              mt: "20px",
              mx: "auto",
              transition: "all 0.3s ease-in-out",
              "&:hover": {
                boxShadow: "0 15px 40px rgba(211, 47, 47, 0.5)",
                transform: "scale(1.02)"
              },
            }}
          >
            <ErrorOutlineOutlinedIcon sx={{ fontSize: 60, color: "#D32F2F", mb: 2 }} />
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                color: "#D32F2F",
                fontFamily: "'Poppins', sans-serif",
                fontSize: "1.5rem",
              }}
            >
              No puedes agendar una cita
            </Typography>
            <Typography
              sx={{
                mt: 1,
                color: "#B71C1C",
                fontFamily: "'Poppins', sans-serif",
                fontSize: "1.1rem",
              }}
            >
              Este paciente ya tiene un tratamiento en curso.
            </Typography>
          </Box>
        </motion.div>
      )}

      {/* Paso 2: Agendar Cita */}
      {pasoActual === 2 && usuarioEncontrado && !tratamientoActivo && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <Box
            sx={{
              width: "100%",
              padding: { xs: "30px", md: "40px" },
              background: "linear-gradient(135deg, #ffffff 0%, #e0f7fa 100%)",
              borderRadius: "16px",
              boxShadow: "0 8px 24px rgba(0, 0, 0, 0.15)",
              border: "1px solid #78c1c8",
            }}
          >
            <Typography
              variant="h5"
              sx={{
                fontWeight: 700,
                mb: "40px",
                textAlign: "center",
                color: "#006d77",
                fontFamily: "'Poppins', sans-serif",
                fontSize: "1.8rem",
              }}
            >
              Agendar Cita
            </Typography>
            {usuarioEncontrado && (
              <Box sx={{ mb: 4, p: 3, backgroundColor: "#d2f4ea", borderRadius: "12px" }}>
                <Typography variant="h6" sx={{ color: "#006d77", fontWeight: 600, fontFamily: "'Poppins', sans-serif" }}>
                  Paciente: {usuarioEncontrado.nombre.toUpperCase()} {usuarioEncontrado.apellido_paterno.toUpperCase()} {usuarioEncontrado.apellido_materno.toUpperCase()}
                </Typography>
                <Typography sx={{ color: "#03445e", fontFamily: "'Poppins', sans-serif" }}>
                  Fecha de Nacimiento: {new Date(usuarioEncontrado.fecha_nacimiento).toLocaleDateString()}
                </Typography>
              </Box>
            )}
            <Grid container spacing={4}>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <Typography sx={{ mb: 1, color: "#03445e", fontWeight: 600, fontFamily: "'Poppins', sans-serif" }}>Servicio</Typography>
                  <Select
                    value={servicioSeleccionado}
                    onChange={(e) => setServicioSeleccionado(e.target.value)}
                    sx={selectStyle}
                    MenuProps={{
                      PaperProps: {
                        sx: {
                          borderRadius: "12px",
                          boxShadow: "0 4px 16px rgba(0, 0, 0, 0.15)",
                          backgroundColor: "#fff",
                        },
                      },
                    }}
                  >
                    <MenuItem value="" disabled sx={menuItemStyle}>Selecciona un servicio</MenuItem>
                    {servicios.map((servicio) => (
                      <MenuItem key={servicio.id} value={servicio.nombre} sx={menuItemStyle}>
                        {servicio.nombre} - {servicio.requiere_evaluacion ? "Requiere evaluación" : `$${servicio.precio} MXN`}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography sx={{ mb: 1, color: "#03445e", fontWeight: 600, fontFamily: "'Poppins', sans-serif" }}>Fecha</Typography>
                <LocalizationProvider dateAdapter={AdapterDateFns} locale={es}>
                  <DatePicker
                    value={fechaSeleccionada}
                    onChange={(newValue) => setFechaSeleccionada(newValue)}
                    renderInput={(params) => <TextField {...params} fullWidth sx={inputStyle} />}
                    disablePast
                    maxDate={new Date(new Date().setDate(new Date().getDate() + 30))}
                    shouldDisableDate={(date) => ![1, 2, 3, 6].includes(date.getDay())}
                  />
                </LocalizationProvider>
                <Typography sx={{ mt: 1, color: "#d32f2f", fontFamily: "'Poppins', sans-serif" }}>
                  Solo Lunes, Martes, Miércoles y Sábado.
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <Typography sx={{ mb: 1, color: "#03445e", fontWeight: 600, fontFamily: "'Poppins', sans-serif" }}>Hora</Typography>
                  <Select
                    value={horaSeleccionada}
                    onChange={(e) => setHoraSeleccionada(e.target.value)}
                    sx={selectStyle}
                    disabled={!fechaSeleccionada || horasDisponibles.length === 0}
                    MenuProps={{
                      PaperProps: {
                        sx: {
                          borderRadius: "12px",
                          boxShadow: "0 4px 16px rgba(0, 0, 0, 0.15)",
                          backgroundColor: "#fff",
                        },
                      },
                    }}
                  >
                    {horasDisponibles.length > 0 ? (
                      horasDisponibles.map((hora, index) => (
                        <MenuItem key={index} value={hora} sx={menuItemStyle}>{hora}</MenuItem>
                      ))
                    ) : (
                      <MenuItem disabled sx={menuItemStyle}>No hay horarios disponibles</MenuItem>
                    )}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
            <Box sx={{ display: "flex", justifyContent: "center", gap: 3, mt: 5 }}>
              <Button
                variant="contained"
                onClick={handleAgendarCita}
                disabled={tratamientoActivo}
                sx={{
                  backgroundColor: tratamientoActivo ? "#ccc" : "#006d77",
                  color: "#e0f7fa",
                  padding: "12px 40px",
                  borderRadius: "12px",
                  fontFamily: "'Poppins', sans-serif",
                  fontWeight: 600,
                  "&:hover": { backgroundColor: tratamientoActivo ? "#ccc" : "#78c1c8", transform: "translateY(-2px)" },
                  transition: "all 0.3s ease-in-out",
                }}
              >
                Confirmar Cita
              </Button>
              <Button
                variant="outlined"
                onClick={() => setPasoActual(1)}
                sx={{
                  borderColor: "#006d77",
                  color: "#006d77",
                  padding: "12px 40px",
                  borderRadius: "12px",
                  fontFamily: "'Poppins', sans-serif",
                  fontWeight: 600,
                  "&:hover": { borderColor: "#78c1c8", color: "#78c1c8", transform: "translateY(-2px)" },
                  transition: "all 0.3s ease-in-out",
                }}
              >
                Volver
              </Button>
            </Box>
          </Box>
        </motion.div>
      )}

      {/* Alerta */}
      {alerta.mostrar && (
        <Box sx={{ position: "fixed", bottom: 20, left: 20, zIndex: 2000 }}>
          <Alert
            severity={alerta.tipo}
            variant="filled"
            sx={{
              width: "100%",
              backgroundColor:
                alerta.tipo === "success" ? "#DFF6DD" :
                  alerta.tipo === "error" ? "#F8D7DA" :
                    alerta.tipo === "warning" ? "#FFF3CD" :
                      "#D1ECF1",
              color:
                alerta.tipo === "success" ? "#1E4620" :
                  alerta.tipo === "error" ? "#721C24" :
                    alerta.tipo === "warning" ? "#856404" :
                      "#0C5460",
            }}
            onClose={() => setAlerta({ mostrar: false, mensaje: '', tipo: '' })}
          >
            {alerta.mensaje}
          </Alert>
        </Box>
      )}
    </Box>
  );
};

export default AgendarCitaAdmin;