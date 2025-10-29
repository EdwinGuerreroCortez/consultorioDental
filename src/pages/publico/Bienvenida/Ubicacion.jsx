import React from "react";
import { Box, Typography, Button } from "@mui/material";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import LocationOnIcon from "@mui/icons-material/LocationOn";

const Ubicacion = ({ ubicacion, error }) => {
  // Detectar cuando el componente entra en vista
  const { ref, inView } = useInView({ triggerOnce: false, threshold: 0.2 });

  // Coordenadas fijas de tu consultorio (fallback)
  const LAT_FIJO = 21.1416355;
  const LNG_FIJO = -98.4253395;

  // Si hay ubicación del usuario, priorízala para el iframe
  const lat = ubicacion?.latitud ?? LAT_FIJO;
  const lng = ubicacion?.longitud ?? LNG_FIJO;

  // URL dinámica para el iframe de Google Maps
  // Nota: para usar *embed* con coordenadas dinámicas, el formato simple con q=lat,lng funciona bien.
  const mapSrc = `https://www.google.com/maps?q=${lat},${lng}&z=15&output=embed`;

  // Link para abrir Google Maps en pestaña nueva (usa ubicación del usuario si existe)
  const linkMaps = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;

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

        {/* Mensajes de estado de geolocalización */}
        <Box sx={{ mb: 2 }}>
          {!ubicacion && !error && (
            <Typography variant="body2" sx={{ color: "#e3f2fd" }}>
              Solicitando permiso de ubicación…
            </Typography>
          )}
          {ubicacion && (
            <Typography variant="body2" sx={{ color: "#e3f2fd" }}>
              Usando tu ubicación actual:{" "}
              <strong>
                {ubicacion.latitud.toFixed(4)}, {ubicacion.longitud.toFixed(4)}
              </strong>{" "}
              (±{Math.round(ubicacion.precision || 0)} m)
            </Typography>
          )}
          {error && (
            <Typography variant="body2" sx={{ color: "#ffebee" }}>
              {error} — Mostrando ubicación del consultorio.
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
          {/* Mapa con animación */}
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
                title="Ubicación"
                src={mapSrc}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              ></iframe>
            </Box>
          </motion.div>

          {/* Información con animación */}
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
              Nos encontramos en una ubicación céntrica con fácil acceso.
              Disponemos de estacionamiento y atención en horarios extendidos.
            </Typography>

            <Typography variant="body2" sx={{ color: "#b3e5fc" }}>
              Si necesitas más información o rutas, abre el mapa.
            </Typography>

            {/* Enlace / Botón a Google Maps (con la ubicación actual si está disponible) */}
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
                  ? "Usando tu ubicación actual."
                  : "Mostrando la ubicación del consultorio."}
              </Typography>
            </Box>
          </motion.div>
        </Box>
      </Box>
    </motion.div>
  );
};

export default Ubicacion;
