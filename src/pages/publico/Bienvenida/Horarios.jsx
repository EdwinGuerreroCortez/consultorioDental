import React from "react";
import { Box, Typography, Paper, Grid, Divider } from "@mui/material";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";

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
          padding: "50px 15px",
          background: "linear-gradient(135deg, #f9f9f9, #f0f0f0)",
          color: "#fff",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "70vh",
        }}
      >
        <Paper
          elevation={10}
          sx={{
            padding: "30px",
            borderRadius: "16px",
            backgroundColor: "#ffffff",
            color: "#333",
            textAlign: "center",
            boxShadow: "0 6px 20px rgba(0, 0, 0, 0.1)",
            maxWidth: "500px",
            width: "100%",
          }}
        >
          {/* Icono con animación */}
          <motion.div
            animate={{ y: [0, -4, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          >
            <CalendarMonthIcon
              sx={{
                fontSize: "50px",
                color: "#0077b6",
                marginBottom: "10px",
              }}
            />
          </motion.div>

          <Typography variant="h5" sx={{ fontWeight: "bold", marginBottom: "15px" }}>
            Horarios de Atención
          </Typography>
          <Divider sx={{ backgroundColor: "#ccc", marginBottom: "15px" }} />

          {/* Lista de horarios con animaciones */}
          <Grid container spacing={2}>
            {horarios.map((dia, index) => (
              <Grid item xs={12} key={index}>
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 15 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Paper
                    sx={{
                      padding: "12px",
                      borderRadius: "12px",
                      backgroundColor: dia.horario === "CERRADO" ? "#ffdddd" : "#e0f7fa",
                      color: dia.horario === "CERRADO" ? "#d32f2f" : "#0077b6",
                      fontWeight: "bold",
                      boxShadow: "0 3px 8px rgba(0, 0, 0, 0.05)",
                      textAlign: "center",
                      transition: "transform 0.3s ease",
                      fontSize: "0.9rem",
                      "&:hover": {
                        transform: "scale(1.05)",
                      },
                    }}
                  >
                    <Typography variant="body1" sx={{ fontWeight: "bold" }}>
                      {dia.dia}
                    </Typography>
                    <Typography variant="body2">{dia.horario}</Typography>
                  </Paper>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </Paper>
      </Box>
    </motion.div>
  );
};

export default Horarios;
