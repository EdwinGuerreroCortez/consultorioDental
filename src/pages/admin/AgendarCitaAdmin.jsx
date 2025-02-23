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
      } else {
        console.log("⚠️ No se encontró ningún usuario con los datos proporcionados.");
        setUsuarioEncontrado(null);
        setAlerta({
          mostrar: true,
          mensaje: "No se encontró el usuario. Verifica los datos.",
          tipo: "error",
        });
      }
    } catch (error) {
      console.error("❌ Error al buscar usuario:", error);

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

      // ✅ Convertir la fecha seleccionada a string 'YYYY-MM-DD'
      const fechaISO = new Date(fechaSeleccionada).toISOString().split('T')[0];

      // ✅ Convertir la hora seleccionada correctamente
      const [hora, minutos] = horaSeleccionada.replace(/( AM| PM)/, '').split(':').map(Number);
      const esPM = horaSeleccionada.includes('PM');

      let horaFinal = esPM && hora !== 12 ? hora + 12 : hora;
      if (!esPM && hora === 12) horaFinal = 0; // Convertir 12 AM a 00:00

      // ✅ Crear la fecha final en zona horaria local (México)
      const fechaHoraLocal = new Date(fechaISO);
      fechaHoraLocal.setHours(horaFinal, minutos, 0, 0);

      // ✅ Convertir la fecha local a UTC antes de enviarla
      const fechaHoraUTC = new Date(fechaHoraLocal.getTime() - fechaHoraLocal.getTimezoneOffset() * 60000);

      console.log("📅 Fecha y hora final en hora local (México):", fechaHoraLocal.toString());
      console.log("🌎 Fecha y hora final en UTC:", fechaHoraUTC.toISOString());
      console.log("📦 Datos que se enviarán al backend:", {
        usuarioId: usuarioEncontrado.id,
        tratamientoId: tratamientoSeleccionado.id,
        citasTotales: tratamientoSeleccionado.citas_requeridas || 0,
        fechaInicio: fechaHoraUTC.toISOString(), // ✅ Enviar fecha en formato UTC
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
      {/* 🔍 FORMULARIO PARA BUSCAR USUARIO */}
      <Box
        sx={{
          width: "100%",
          maxWidth: "900px",
          padding: "20px",
          backgroundColor: "#ffffff",
          borderRadius: "16px",
          boxShadow: "0 8px 24px rgba(0, 0, 0, 0.1)",
          marginBottom: "20px",
        }}
      >
        <Typography variant="h5" sx={{ fontWeight: "bold", marginBottom: "10px" }}>
          Buscar Paciente
        </Typography>

        <TextField
          fullWidth
          label="Nombre"
          variant="outlined"
          value={busquedaUsuario.nombre}
          onChange={(e) => setBusquedaUsuario({ ...busquedaUsuario, nombre: e.target.value })}
          sx={{ marginBottom: "10px" }}
        />
        <TextField
          fullWidth
          label="Apellido Paterno"
          variant="outlined"
          value={busquedaUsuario.apellido_paterno}
          onChange={(e) => setBusquedaUsuario({ ...busquedaUsuario, apellido_paterno: e.target.value })}
          sx={{ marginBottom: "10px" }}
        />
        <TextField
          fullWidth
          label="Apellido Materno"
          variant="outlined"
          value={busquedaUsuario.apellido_materno}
          onChange={(e) => setBusquedaUsuario({ ...busquedaUsuario, apellido_materno: e.target.value })}
          sx={{ marginBottom: "10px" }}
        />
        <LocalizationProvider dateAdapter={AdapterDateFns} locale={es}>
          <DatePicker
            label="Fecha de Nacimiento"
            value={busquedaUsuario.fecha_nacimiento ? new Date(busquedaUsuario.fecha_nacimiento) : null} // Asegurar que sea Date
            onChange={(newValue) => setBusquedaUsuario({ ...busquedaUsuario, fecha_nacimiento: newValue })}
            renderInput={(params) => <TextField {...params} fullWidth sx={{ marginBottom: "10px" }} />}
          />
        </LocalizationProvider>

        <TextField
          fullWidth
          label="Correo Electrónico (Opcional)"
          variant="outlined"
          value={busquedaUsuario.email}
          onChange={(e) => setBusquedaUsuario({ ...busquedaUsuario, email: e.target.value })}
          sx={{ marginBottom: "10px" }}
        />
        <TextField
          fullWidth
          label="Teléfono (Opcional)"
          variant="outlined"
          value={busquedaUsuario.telefono}
          onChange={(e) => setBusquedaUsuario({ ...busquedaUsuario, telefono: e.target.value })}
          sx={{ marginBottom: "10px" }}
        />

        <Button
          variant="contained"
          color="primary"
          fullWidth
          onClick={buscarUsuario}
          sx={{ padding: "14px", fontWeight: "bold", borderRadius: "12px", backgroundColor: "#0077b6" }}
        >
          Buscar Paciente
        </Button>
      </Box>
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
      {usuarioEncontrado && !tratamientoActivo && (
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
              onChange={(e) => {
                setHoraSeleccionada(e.target.value);
                console.log("🕒 Hora seleccionada:", e.target.value);
                console.log("📦 Datos actuales antes de enviar:", {
                  usuarioId: usuarioEncontrado?.id || "No seleccionado",
                  servicioSeleccionado,
                  fechaSeleccionada: fechaSeleccionada ? fechaSeleccionada.toISOString().split('T')[0] : "No seleccionada",
                  horaSeleccionada: e.target.value
                });
              }}
              displayEmpty
              startAdornment={
                <InputAdornment position="start">
                  <AccessTimeIcon color="primary" />
                </InputAdornment>
              }
              disabled={!fechaSeleccionada || horasDisponibles.length === 0} // 🔹 Bloquear hasta seleccionar fecha
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
              backgroundColor: tratamientoActivo ? "#ccc" : "#0077b6", // Cambia el color si está bloqueado
            }}
            disabled={tratamientoActivo} // 🔹 Deshabilita si ya tiene un tratamiento activo
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

export default AgendarCitaAdmin;
