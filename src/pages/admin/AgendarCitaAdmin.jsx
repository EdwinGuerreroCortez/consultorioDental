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
  Alert,
  Grid,

} from "@mui/material";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import InputAdornment from '@mui/material/InputAdornment';

import MedicalServicesOutlinedIcon from "@mui/icons-material/MedicalServicesOutlined";
import AccessTimeIcon from '@mui/icons-material/AccessTime';
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
  const [disponibilidad, setDisponibilidad] = useState([
    '09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '01:00 PM',
    '03:00 PM', '04:00 PM', '05:00 PM', '06:00 PM'
  ]);
  const [citasOcupadas, setCitasOcupadas] = useState([]);
  const [alerta, setAlerta] = useState({ mostrar: false, mensaje: '', tipo: '' });
  const [usuarioEncontrado, setUsuarioEncontrado] = useState(null); // Guardará el usuario encontrado
  const [busquedaUsuario, setBusquedaUsuario] = useState({
    nombre: '',
    apellido_paterno: '',
    apellido_materno: '',
    fecha_nacimiento: null, // Antes estaba como ''
    email: '',
    telefono: ''
  });
  const [pasoActual, setPasoActual] = useState(1);
  const inputStyle = {
    "& .MuiOutlinedInput-root": {
      transition: "all 0.3s ease-in-out",
      "&:hover fieldset": { borderColor: "#0077b6" },
      "&.Mui-focused fieldset": { borderColor: "#005f8a" },
    },
  };

  useEffect(() => {
    if (alerta.mostrar) {
      const timer = setTimeout(() => {
        setAlerta({ mostrar: false, mensaje: '', tipo: '' });
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [alerta.mostrar]);


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
    if (usuarioEncontrado) {
      verificarTratamientoActivo();
      obtenerTratamientos();
    }
  }, [usuarioEncontrado]);
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
    if (!usuarioEncontrado?.id) return; // Asegurar que usuarioEncontrado existe
    try {
      const response = await axiosInstance.get(`/tratamientos-pacientes/verificar/${usuarioEncontrado.id}`);
      setTratamientoActivo(response.data.tieneTratamientoActivo);
      console.log("⚠️ Tratamiento activo:", response.data.tieneTratamientoActivo);

      if (response.data.tieneTratamientoActivo) {
        setAlerta({
          mostrar: true,
          mensaje: 'El paciente ya tiene un tratamiento activo. No puede agendar otra cita.',
          tipo: 'warning',
        });
      }
    } catch (error) {
      console.error('❌ Error al verificar tratamiento:', error);
      setAlerta({
        mostrar: true,
        mensaje: 'Error al verificar el tratamiento activo.',
        tipo: 'error',
      });
    }
  };

  // ✅ Llamar a la función cada vez que se encuentra un usuario
  useEffect(() => {
    if (usuarioEncontrado) {
      verificarTratamientoActivo();
      obtenerTratamientos();
    }
  }, [usuarioEncontrado]);

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
  const buscarUsuario = async () => {
    // Convertir la fecha de nacimiento a formato 'YYYY-MM-DD' si existe
    const datosEnvio = {
      ...busquedaUsuario,
      fecha_nacimiento: busquedaUsuario.fecha_nacimiento
        ? busquedaUsuario.fecha_nacimiento.toISOString().split('T')[0]
        : ""
    };

    console.log("🔍 Enviando solicitud para buscar usuario con los datos:", datosEnvio);

    try {
      const response = await axios.post('http://localhost:4000/api/usuarios/buscar', datosEnvio);
      console.log("✅ Respuesta recibida del servidor:", response.data);

      if (response.data.length > 0) {
        const usuario = response.data[0];

        setUsuarioEncontrado({
          ...usuario,
          fecha_nacimiento: usuario.fecha_nacimiento ? new Date(usuario.fecha_nacimiento) : null
        });

        setAlerta({
          mostrar: true,
          mensaje: "Usuario encontrado correctamente.",
          tipo: "success",
        });
        // Solo pasar al paso 2 si hay un usuario encontrado
        setPasoActual(2);
      } else {
        console.log("⚠️ No se encontró ningún usuario con los datos proporcionados.");
        setUsuarioEncontrado(null);
        setPasoActual(1); // 🔹 Asegurar que el paso se mantenga en 1 si no encuentra usuario

        setAlerta({
          mostrar: true,
          mensaje: "No se encontró el usuario. Verifica los datos.",
          tipo: "error",
        });
      }
    } catch (error) {
      console.error("❌ Error al buscar usuario:", error);
      setUsuarioEncontrado(null);
      setPasoActual(1);
      setAlerta({
        mostrar: true,
        mensaje: "Error al buscar el usuario.",
        tipo: "error",
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

      // ✅ Convertir la fecha seleccionada a formato 'YYYY-MM-DD' sin que cambie
      const fechaSeleccionadaStr = fechaSeleccionada.toISOString().split('T')[0];

      // ✅ Convertir la hora seleccionada correctamente
      const [hora, minutos] = horaSeleccionada.replace(/( AM| PM)/, '').split(':').map(Number);
      const esPM = horaSeleccionada.includes('PM');

      let horaFinal = esPM && hora !== 12 ? hora + 12 : hora;
      if (!esPM && hora === 12) horaFinal = 0; // Convertir 12 AM a 00:00

      // ✅ Crear la fecha con la hora seleccionada en **zona horaria local (México)**
      const fechaHoraLocal = new Date(`${fechaSeleccionadaStr}T${horaFinal.toString().padStart(2, '0')}:${minutos.toString().padStart(2, '0')}:00`);

      // ✅ Convertir la fecha local a UTC antes de enviarla
      const fechaHoraUTC = new Date(fechaHoraLocal.getTime() - fechaHoraLocal.getTimezoneOffset() * 60000);

      console.log("📅 Fecha seleccionada (sin cambios):", fechaSeleccionadaStr);
      console.log("🕒 Hora seleccionada:", horaSeleccionada);
      console.log("🌎 Fecha y hora final en UTC:", fechaHoraUTC.toISOString());
      console.log("📦 Datos que se enviarán al backend:", {
        usuarioId: usuarioEncontrado.id,
        tratamientoId: tratamientoSeleccionado.id,
        citasTotales: tratamientoSeleccionado.citas_requeridas || 0,
        fechaInicio: fechaHoraUTC.toISOString(), // ✅ Enviar en formato UTC corregido
        estado: estadoTratamiento,
        precio: tratamientoSeleccionado.precio,
        requiereEvaluacion: tratamientoSeleccionado.requiere_evaluacion
      });

      // ✅ Enviar solicitud para crear el tratamiento
      await axiosInstance.post('/tratamientos-pacientes/crear', {
        usuarioId: usuarioEncontrado.id,
        tratamientoId: tratamientoSeleccionado.id,
        citasTotales: tratamientoSeleccionado.citas_requeridas || 0,
        fechaInicio: fechaHoraUTC.toISOString(), // ✅ Enviar en formato UTC corregido
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
      console.error('❌ Error al agendar la cita:', error);
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
        padding: { xs: "20px", md: "5px" },
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "flex-start",
        boxSizing: "border-box",
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
          marginTop: { xs: "1px", md: "10px" },
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
      {/* 🔍 FORMULARIO PARA BUSCAR USUARIO */}
      {pasoActual === 1 && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
        >
          <Box
            sx={{
              width: "100%",
              maxWidth: "800px",
              padding: "50px",
              background: "linear-gradient(135deg, #ffffff 30%, #f0f9ff 100%)",
              borderRadius: "20px",
              boxShadow: "0 12px 45px rgba(0, 0, 0, 0.2)",
              marginBottom: "35px",
              border: "2px solid #cceeff",
              transition: "all 0.4s ease-in-out",
              "&:hover": {
                boxShadow: "0 20px 55px rgba(0, 0, 0, 0.25)",
                transform: "scale(1.02)"
              },
            }}
          >
            <Typography
              variant="h5"
              sx={{
                fontWeight: "bold",
                marginBottom: "25px",
                textAlign: "center",
                color: "#0077b6",
                letterSpacing: "1.8px",
                textTransform: "uppercase",
                fontSize: "1.7rem",
                transition: "all 0.3s ease-in-out",
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
                { label: "Teléfono (Opcional)", value: "telefono" }
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
                    value={busquedaUsuario.fecha_nacimiento ? new Date(busquedaUsuario.fecha_nacimiento) : null}
                    onChange={(newValue) => setBusquedaUsuario({ ...busquedaUsuario, fecha_nacimiento: newValue })}
                    renderInput={(params) => <TextField {...params} fullWidth sx={inputStyle} />}
                  />
                </LocalizationProvider>
              </Grid>
            </Grid>

            <motion.div
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              transition={{ duration: 0.2 }}
              style={{ marginTop: "25px" }}
            >
              <Box sx={{ display: "flex", justifyContent: "center", marginTop: "25px" }}>
                <Button
                  variant="contained"
                  onClick={buscarUsuario}
                  sx={{
                    padding: "12px",
                    fontWeight: "bold",
                    height: "50px",
                    width: "250px",
                    borderRadius: "10px",
                    fontSize: "1rem",
                    backgroundColor: "#0077b6",
                    transition: "all 0.3s ease-in-out",
                    "&:hover": {
                      backgroundColor: "#005f8a",
                      boxShadow: "0 5px 15px rgba(0, 119, 182, 0.4)",
                      transform: "translateY(-2px)"
                    },
                  }}
                >
                  Buscar Paciente
                </Button>
              </Box>

            </motion.div>
          </Box>
        </motion.div>

      )}
      {/* 🔴 Si el usuario tiene un tratamiento en curso, mostrar el mensaje debajo del título */}
      {tratamientoActivo && (
        <Box
          sx={{
            width: "100%",
            maxWidth: "600px",
            textAlign: "center",
            backgroundColor: "#fff",
            padding: { xs: "15px", md: "20px" },
            borderRadius: "12px",
            boxShadow: "0 6px 20px rgba(0, 0, 0, 0.1)",
            marginTop: "15px",
          }}
        >
          <Typography
            variant="h5"
            sx={{
              fontWeight: "bold",
              fontSize: { xs: "18px", md: "22px" },
              color: "#d32f2f",
            }}
          >
            No puedes agendar una cita
          </Typography>
          <Typography
            variant="body1"
            sx={{
              fontSize: { xs: "14px", md: "16px" },
              marginTop: "10px",
              color: "#333",
            }}
          >
            Este paciente ya tiene un tratamiento en curso. Debe finalizarlo antes de agendar otra cita.
          </Typography>
        </Box>
      )}

      {/* ✅ Si no tiene tratamiento activo, mostrar el formulario pegado al mensaje */}
      {pasoActual === 2 && usuarioEncontrado && !tratamientoActivo && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
        >
          <Box
            sx={{
              width: "100%",
              maxWidth: "900px",
              padding: { xs: "30px", md: "50px" },
              background: "linear-gradient(135deg, #ffffff 30%, #f0f9ff 100%)",
              borderRadius: "16px",
              boxShadow: "0 10px 30px rgba(0, 0, 0, 0.15)",
              marginBottom: "40px",
              border: "1px solid #cceeff",
              transition: "all 0.3s ease-in-out",
              "&:hover": {
                boxShadow: "0 14px 40px rgba(0, 0, 0, 0.2)",
                transform: "scale(1.02)"
              },
            }}
          >
            <Typography
              variant="h5"
              sx={{
                fontWeight: "bold",
                marginBottom: "30px",
                textAlign: "center",
                color: "#0077b6",
                letterSpacing: "1.5px",
                textTransform: "uppercase",
                fontSize: "1.7rem",
              }}
            >
              Agendar Cita
            </Typography>

            {/* 🔹 Información del usuario encontrado */}
            {usuarioEncontrado && (
              <Box
                sx={{
                  padding: "15px",
                  backgroundColor: "#e6f7ff",
                  borderRadius: "10px",
                  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                  marginBottom: "25px",
                }}
              >
                <Typography variant="h6" sx={{ fontWeight: "bold", color: "#0077b6", marginBottom: "5px" }}>
                  Información del Usuario
                </Typography>
                <Typography variant="body1">
                  <strong>Nombre:</strong> {usuarioEncontrado.nombre} {usuarioEncontrado.apellido_paterno} {usuarioEncontrado.apellido_materno}
                </Typography>
                <Typography variant="body1">
                  <strong>Fecha de Nacimiento:</strong> {new Date(usuarioEncontrado.fecha_nacimiento).toLocaleDateString()}
                </Typography>
              </Box>
            )}

            {/* 🔹 Diseño de 2 Columnas */}
            <Grid container spacing={3}>
              {/* Servicio */}
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <Typography variant="h6" sx={{ fontWeight: "bold", color: "#333", marginBottom: "5px" }}>
                    Servicio
                  </Typography>
                  <Select
                    value={servicioSeleccionado}
                    onChange={(e) => setServicioSeleccionado(e.target.value)}
                    displayEmpty
                    sx={{
                      borderRadius: "10px",
                      backgroundColor: "#e6f7ff",
                      height: "55px",
                    }}
                    startAdornment={
                      <InputAdornment position="start">
                        <MedicalServicesOutlinedIcon color="primary" />
                      </InputAdornment>
                    }
                  >
                    <MenuItem disabled value="">Selecciona un servicio</MenuItem>
                    {servicios.map((servicio) => (
                      <MenuItem key={servicio.id} value={servicio.nombre}>
                        {servicio.nombre} -{" "}
                        {servicio.requiere_evaluacion ? <em>Requiere evaluación</em> : `$${servicio.precio} MXN`}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* Fecha */}
              <Grid item xs={12} md={6}>
                <Typography variant="h6" sx={{ fontWeight: "bold", color: "#333", marginBottom: "5px" }}>
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
                        sx={{
                          "& .MuiOutlinedInput-root": { borderRadius: "10px", height: "55px" },
                        }}
                      />
                    )}
                    disablePast
                    maxDate={new Date(new Date().setDate(new Date().getDate() + 30))}
                    inputFormat="dd/MM/yyyy"
                    shouldDisableDate={(date) => ![1, 2, 3, 6].includes(date.getDay())}
                  />
                </LocalizationProvider>
                <Typography variant="body2" sx={{ color: "#d32f2f", fontWeight: "bold", marginTop: "5px" }}>
                  Solo se pueden agendar citas en: Lunes, Martes, Miércoles y Sábado.
                </Typography>
              </Grid>

              {/* Hora (centrado y bien alineado) */}
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <Typography variant="h6" sx={{ fontWeight: "bold", color: "#333", marginBottom: "8px" }}>
                    Hora
                  </Typography>
                  <Select
                    value={horaSeleccionada}
                    onChange={(e) => setHoraSeleccionada(e.target.value)}
                    displayEmpty
                    startAdornment={
                      <InputAdornment position="start">
                        <AccessTimeIcon color="primary" />
                      </InputAdornment>
                    }
                    sx={{ height: "55px" }}
                    disabled={!fechaSeleccionada || horasDisponibles.length === 0}
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
              </Grid>
            </Grid>

            {/* 🔹 BOTONES (Bien alineados y centrados) */}
            <Box sx={{ display: "flex", justifyContent: "center", marginTop: "35px", gap: "20px" }}>
              <Button
                variant="contained"
                onClick={handleAgendarCita}
                sx={{
                  padding: "12px",
                  fontWeight: "bold",
                  height: "50px",
                  width: "250px",
                  borderRadius: "10px",
                  fontSize: "1rem",
                  backgroundColor: tratamientoActivo ? "#ccc" : "#0077b6",
                  transition: "all 0.3s ease-in-out",
                  "&:hover": {
                    backgroundColor: tratamientoActivo ? "#ccc" : "#005f8a",
                    boxShadow: "0 4px 12px rgba(0, 119, 182, 0.4)",
                    transform: "translateY(-2px)"
                  },
                }}
                disabled={tratamientoActivo}
              >
                Confirmar Cita
              </Button>

              <Button
                variant="outlined"
                onClick={() => setPasoActual(1)}
                sx={{
                  padding: "12px",
                  fontWeight: "bold",
                  height: "50px",
                  width: "250px",
                  borderRadius: "10px",
                  fontSize: "1rem",
                  transition: "all 0.3s ease-in-out",
                  "&:hover": {
                    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                    transform: "translateY(-2px)"
                  },
                }}
              >
                Volver
              </Button>
            </Box>
          </Box>
        </motion.div>

      )}


      {alerta.mostrar && (
        <Box
          sx={{
            position: "fixed",
            bottom: 20, // 🔹 Ubicación en la parte inferior
            left: 20,   // 🔹 Ubicación en la esquina izquierda
            zIndex: 2000, // 🔹 Asegura que esté visible sobre otros elementos
            width: "auto",
            maxWidth: "400px",
          }}
        >
          <Alert
            severity="success" // 🔹 Usa el color verde claro por defecto
            variant="filled"
            sx={{
              width: "100%",
              backgroundColor: "#DFF6DD", // ✅ Color verde claro
              color: "#1E4620", // ✅ Color de texto más oscuro para mejor contraste
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
