import React from "react";
import { Box, Typography, Paper, Grid, Divider } from "@mui/material";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import imagenDental from "../../../assets/images/Silla.jpg"; 

const horarios = [
  { dia: "Lunes", horario: "9:00 AM - 2:00 PM | 4:00 PM - 7:00 PM" },
  { dia: "Martes", horario: "9:00 AM - 2:00 PM | 4:00 PM - 7:00 PM" },
  { dia: "Miércoles", horario: "9:00 AM - 2:00 PM | 4:00 PM - 7:00 PM" },
  { dia: "Jueves", horario: "CERRADO" },
  { dia: "Viernes", horario: "CERRADO" },
  { dia: "Sábado", horario: "9:00 AM - 2:00 PM" },
  { dia: "Domingo", horario: "CERRADO" },
];

const Horarios = () => {
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
          padding: { xs: "20px", md: "50px" },
          backgroundColor: "#fafafa", // Beige claro similar al de la imagen
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "70vh",
          flexDirection: { xs: "column", md: "row" }, // Apilado en móviles
          gap: { xs: 2, md: 4 },
        }}
      >
        {/* Contenedor de imagen */}
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: { xs: 2, md: 3 },
            alignItems: "center",
            width: { xs: "100%", md: "40%" },
          }}
        >
          <Paper
            elevation={6}
            sx={{
              width: { xs: "300px", md: "500px" }, // Aumentado a 250px en móviles y 300px en escritorio
              height: { xs: "350px", md: "500px" }, // Aumentado a 250px en móviles y 300px en escritorio
              backgroundImage: `url(${imagenDental})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              clipPath: "polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)", // Forma hexagonal
              boxShadow: "0 6px 15px rgba(0, 0, 0, 0.1)",
              borderRadius: "8px",
            }}
          />
        </Box>

        {/* Contenedor de calendario */}
        <Box
          sx={{
            width: { xs: "100%", md: "50%" },
            textAlign: "center",
            padding: { xs: "10px", md: "20px" },
          }}
        >
          <motion.div
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          >
            <CalendarMonthIcon
              sx={{
                fontSize: { xs: "40px", md: "50px" },
                color: "#0077b6",
                marginBottom: "10px",
              }}
            />
          </motion.div>

          <Typography
            variant="h5"
            sx={{
              fontWeight: "bold",
              marginBottom: "15px",
              color: "#333",
              fontSize: { xs: "1.5rem", md: "1.8rem" },
            }}
          >
            Horarios de Atención
          </Typography>
          <Divider sx={{ backgroundColor: "#0077b6", marginBottom: "15px" }} />

          <Grid container spacing={{ xs: 1, md: 2 }}>
            {horarios.map((dia, index) => (
              <Grid item xs={12} key={index}>
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 15 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Paper
                    sx={{
                      padding: { xs: "10px", md: "12px" },
                      borderRadius: "12px",
                      backgroundColor: dia.horario === "CERRADO" ? "#ffdddd" : "#e0f7fa",
                      color: dia.horario === "CERRADO" ? "#d32f2f" : "#0077b6",
                      fontWeight: "bold",
                      boxShadow: "0 3px 8px rgba(0, 0, 0, 0.05)",
                      textAlign: "center",
                      transition: "transform 0.3s ease",
                      fontSize: { xs: "0.85rem", md: "0.9rem" },
                      "&:hover": {
                        transform: "scale(1.05)",
                      },
                    }}
                  >
                    <Typography
                      variant="body1"
                      sx={{ fontWeight: "bold", fontSize: { xs: "0.9rem", md: "1rem" } }}
                    >
                      {dia.dia}
                    </Typography>
                    <Typography variant="body2">{dia.horario}</Typography>
                  </Paper>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </Box>
      </Box>
    </motion.div>
  );
};

export default Horarios;