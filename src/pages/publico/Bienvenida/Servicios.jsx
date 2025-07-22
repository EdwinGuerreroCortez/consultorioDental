import React, { useState, useEffect } from "react";
import { Box, Typography, Button, Card, CardContent, CardMedia, Grid } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";

const Servicios = () => {
  const [servicios, setServicios] = useState([]);
  const navigate = useNavigate();
  const { ref, inView } = useInView({ triggerOnce: false, threshold: 0.2 });

  useEffect(() => {
    const fetchTratamientos = async () => {
      try {
        const response = await fetch("https://backenddent.onrender.com/api/tratamientos");
        const data = await response.json();
        const tratamientosActivos = data.filter((tratamiento) => tratamiento.estado === 1);
        setServicios(tratamientosActivos.slice(0, 4));
      } catch (error) {
        console.error("Error al obtener tratamientos:", error);
      }
    };

    fetchTratamientos();
  }, []);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
      transition={{ duration: 1 }}
    >
      <Box sx={{ padding: "80px 20px", textAlign: "center", backgroundColor: "#e0f7fa" }}>
        <Typography
          variant="h3"
          sx={{ fontWeight: "bold", marginBottom: "20px", color: "#004d80" }}
        >
          🦷 Nuestros Servicios
        </Typography>
        <Typography variant="body1" sx={{ fontSize: "1.2rem", marginBottom: "40px", color: "#555" }}>
          Conoce algunos de nuestros tratamientos para el cuidado de tu sonrisa.
        </Typography>

        <Grid container spacing={3} justifyContent="center">
          {servicios.map((servicio, index) => (
            <Grid item xs={12} sm={6} md={3} key={servicio.id}>
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
              >
                <Card
                  sx={{
                    borderRadius: "16px",
                    boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)",
                    background: "#fff",
                    transition: "transform 0.3s ease",
                    "&:hover": {
                      transform: "scale(1.05)",
                    },
                  }}
                >
                  <CardMedia
                    component="img"
                    alt={servicio.nombre}
                    height="180"
                    image={servicio.imagen || "https://via.placeholder.com/180"}
                    sx={{ borderTopLeftRadius: "16px", borderTopRightRadius: "16px" }}
                  />
                  <CardContent>
                    <Typography
                      variant="h6"
                      sx={{ fontWeight: "bold", color: "#0077b6", marginBottom: "10px" }}
                    >
                      {servicio.nombre}
                    </Typography>
                    <Typography variant="body2" sx={{ color: "#555", height: "50px", overflow: "hidden" }}>
                      {servicio.descripcion.length > 80
                        ? servicio.descripcion.substring(0, 80) + "..."
                        : servicio.descripcion}
                    </Typography>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>
          ))}
        </Grid>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.8, delay: 1 }}
        >
          <Button
            variant="contained"
            sx={{
              marginTop: "40px",
              backgroundColor: "#00a8e8",
              color: "#fff",
              fontWeight: "bold",
              fontSize: "1rem",
              padding: "12px 24px",
              borderRadius: "8px",
              textTransform: "none",
              "&:hover": { backgroundColor: "#0077b6" },
            }}
            onClick={() => navigate("/catalogo-servicios")}
            startIcon={<Typography component="span">🦷</Typography>}
          >
            Ver todos los servicios
          </Button>
        </motion.div>
      </Box>
    </motion.div>
  );
};

export default Servicios;