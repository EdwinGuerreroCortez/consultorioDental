import React from "react";
import { Box, Typography } from "@mui/material";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import LocationOnIcon from "@mui/icons-material/LocationOn";

const Ubicacion = () => {
  // Detectar cuando el componente entra en vista
  const { ref, inView } = useInView({ triggerOnce: false, threshold: 0.2 });

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
              }}
            >
              <iframe
                title="Ubicación"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3754.884335732754!2d-98.4253395!3d21.1416355!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x85d726eb6d80e10d%3A0xb66064b6cb4b79a9!2sZacatecas%204%2C%20Centro%2C%2043000%20Huejutla%20de%20Reyes%2C%20Hgo.!5e0!3m2!1ses-419!2smx!4v1710974398765!5m2!1ses-419!2smx"
                width="100%"
                height="100%"
                style={{ border: "0" }}
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
              Si necesitas más información, haz clic en el enlace de abajo.
            </Typography>

            {/* Enlace a Google Maps */}
            <Typography variant="body2" sx={{ marginTop: "15px" }}>
              <a
                href="https://www.google.com.mx/maps/place/Zacatecas+4,+Centro,+43000+Huejutla+de+Reyes,+Hgo./@21.1416355,-98.4253395,17z"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  color: "#ffeb3b",
                  textDecoration: "none",
                  fontWeight: "bold",
                  fontSize: "1.1rem",
                }}
              >
                📍 Ver en Google Maps
              </a>
            </Typography>
          </motion.div>
        </Box>
      </Box>
    </motion.div>
  );
};

export default Ubicacion;
