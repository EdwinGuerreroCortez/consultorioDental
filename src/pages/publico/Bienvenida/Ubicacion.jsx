import React from "react";
import { Box, Typography, Button, Switch, FormControlLabel } from "@mui/material";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import LocationOnIcon from "@mui/icons-material/LocationOn";

const Ubicacion = ({ ubicacion, error }) => {
  // Detecta cuando el componente entra en vista
  const { ref, inView } = useInView({ triggerOnce: false, threshold: 0.2 });

  // ⚓️ URL *exacta* del mapa que ya tenías (pin y etiqueta del consultorio)
  const FIXED_EMBED_SRC =
    "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3754.884335732754!2d-98.4253395!3d21.1416355!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x85d726eb6d80e10d%3A0xb66064b6cb4b79a9!2sZacatecas%204%2C%20Centro%2C%2043000%20Huejutla%20de%20Reyes%2C%20Hgo.!5e0!3m2!1ses-419!2smx!4v1710974398765!5m2!1ses-419!2smx";

  // Coordenadas del consultorio (por si se usan en el enlace)
  const LAT_FIJO = 21.1416355;
  const LNG_FIJO = -98.4253395;

  // 🧭 Si hay ubicación del usuario, se usará solo para el ENLACE (no para el iframe),
  // así el mapa embebido SIEMPRE muestra el consultorio como pediste.
  const latLink = ubicacion?.latitud ?? LAT_FIJO;
  const lngLink = ubicacion?.longitud ?? LNG_FIJO;

  // Enlace para abrir Google Maps en pestaña nueva
  const linkMaps = `https://www.google.com/maps/search/?api=1&query=${latLink},${lngLink}`;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
      transition={{ duration: 1 }}
    >
      <Box
        sx={{
          padding: "60px 20px",
          background: "linear-gradient(135deg, #e0f7fa, #00b4d8)",
          color: "#fff",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
        }}
      >
        {/* Título con animación */}
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: -50 }}
          transition={{ duration: 1 }}
        >
          <Typography variant="h3" sx={{ fontWeight: "bold", marginBottom: "20px" }}>
            📍 Nuestra Ubicación
          </Typography>
        </motion.div>

        {/* Mensajes de estado (informativos, el mapa siempre queda fijo al consultorio) */}
        <Box sx={{ mb: 2 }}>
          {!ubicacion && !error && (
            <Typography variant="body2" sx={{ color: "#e3f2fd" }}>
              (Opcional) Puedes permitir ubicación para abrir rutas desde donde estás.
            </Typography>
          )}
          {ubicacion && (
            <Typography variant="body2" sx={{ color: "#e3f2fd" }}>
              Tu ubicación actual:{" "}
              <strong>
                {ubicacion.latitud.toFixed(4)}, {ubicacion.longitud.toFixed(4)}
              </strong>{" "}
              (±{Math.round(ubicacion.precision || 0)} m). El mapa muestra el consultorio.
            </Typography>
          )}
          {error && (
            <Typography variant="body2" sx={{ color: "#ffebee" }}>
              {error}. El mapa embebido muestra la dirección del consultorio.
            </Typography>
          )}
        </Box>

        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            alignItems: "center",
            justifyContent: "space-between",
            maxWidth: "1200px",
            width: "100%",
            gap: "30px",
          }}
        >
          {/* Mapa (SIEMPRE fijo al consultorio) */}
          <motion.div
            initial={{ opacity: 0, x: -100 }}
            animate={inView ? { opacity: 1, x: 0 } : { opacity: 0, x: -100 }}
            transition={{ duration: 1 }}
            style={{ flex: 1.2 }}
          >
            <Box
              sx={{
                width: "100%",
                height: "450px",
                borderRadius: "16px",
                overflow: "hidden",
                boxShadow: "0 6px 15px rgba(0, 0, 0, 0.15)",
                backgroundColor: "#e0f2f1",
              }}
            >
              <iframe
                title="Ubicación del Consultorio"
                src={FIXED_EMBED_SRC}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              ></iframe>
            </Box>
          </motion.div>

          {/* Información */}
          <motion.div
            initial={{ opacity: 0, x: 100 }}
            animate={inView ? { opacity: 1, x: 0 } : { opacity: 0, x: 100 }}
            transition={{ duration: 1 }}
            style={{ flex: 1, textAlign: "left" }}
          >
            <Typography
              variant="h5"
              sx={{ fontWeight: "bold", color: "#fff", marginBottom: "15px" }}
            >
              📌 Calle Zacatecas #4, Zona Centro, Huejutla, Hgo.
            </Typography>

            <Typography variant="body1" sx={{ color: "#e3f2fd", marginBottom: "10px" }}>
              Ubicación céntrica con fácil acceso. Contamos con estacionamiento y horarios extendidos.
            </Typography>

            <Typography variant="body2" sx={{ color: "#b3e5fc" }}>
              Para rutas desde tu ubicación actual, ábrelo en Google Maps.
            </Typography>

            {/* Botón para abrir en Google Maps (usa tu ubicación si existe; si no, abre con la del consultorio) */}
            <Box sx={{ mt: 2, display: "flex", gap: 1, alignItems: "center" }}>
              <Button
                component="a"
                href={linkMaps}
                target="_blank"
                rel="noopener noreferrer"
                variant="contained"
                color="warning"
                startIcon={<LocationOnIcon />}
                sx={{ fontWeight: "bold" }}
              >
                Ver en Google Maps
              </Button>
              <Typography variant="caption" sx={{ color: "#e3f2fd" }}>
                {ubicacion
                  ? "Se calcularán rutas desde tu ubicación."
                  : "Abrirá la ubicación del consultorio."}
              </Typography>
            </Box>
          </motion.div>
        </Box>
      </Box>
    </motion.div>
  );
};

export default Ubicacion;
