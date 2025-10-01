import axios from "axios";

// Configuración de Axios
const axiosInstance = axios.create({
  baseURL: "http://localhost:4000/api",
  withCredentials: true,
});

/**
 * ✅ Obtiene las citas ocupadas desde el backend y las convierte a la zona horaria de México.
 */
export const obtenerCitasOcupadas = async () => {
  try {
    const response = await axiosInstance.get("/citas/activas");
    const citas = response.data || [];

    // Convertir fechas a la zona horaria de México
    const citasConZonaHoraria = citas.map(cita => {
      const fechaUTC = new Date(cita.fecha_hora);
      const fechaMX = new Intl.DateTimeFormat("es-MX", {
        timeZone: "America/Mexico_City",
        year: "numeric", month: "2-digit", day: "2-digit",
        hour: "2-digit", minute: "2-digit", second: "2-digit",
        hour12: true
      }).format(fechaUTC);

      return { ...cita, fecha_hora_mx: fechaMX };
    });

    return citasConZonaHoraria;
  } catch (error) {
    console.error("❌ Error al obtener las citas ocupadas:", error);
    return [];
  }
};

/**
 * ✅ Filtra las horas disponibles en función de las citas ocupadas.
 * @param {Date} fechaSeleccionada - Fecha para la cual se buscan horas disponibles.
 * @param {Array} citasOcupadas - Lista de citas ocupadas obtenidas del backend.
 * @returns {Array} Horas disponibles para la fecha seleccionada.
 */
export const obtenerHorasDisponibles = (fechaSeleccionada, citasOcupadas) => {
  const disponibilidad = [
    "09:00 AM", "10:00 AM", "11:00 AM", "12:00 PM", "01:00 PM",
    "03:00 PM", "04:00 PM", "05:00 PM", "06:00 PM"
  ];

  if (!fechaSeleccionada) return disponibilidad;

  const fechaFormateada = new Date(fechaSeleccionada).toISOString().split("T")[0];

  const horasOcupadas = citasOcupadas
    .filter(cita => {
      const fechaCita = new Date(cita.fecha_hora).toISOString().split("T")[0];
      return fechaCita === fechaFormateada;
    })
    .map(cita => new Date(cita.fecha_hora).toLocaleTimeString("es-MX", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true
    }).toUpperCase().replace(/\./g, ""));

  return disponibilidad.filter(hora => !horasOcupadas.includes(hora));
};
