import React from "react";
import { useNavigate } from "react-router-dom";
import { Box, Typography, Button, Container, Grid } from "@mui/material";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import EventAvailableIcon from "@mui/icons-material/EventAvailable";
import MedicalServicesIcon from "@mui/icons-material/MedicalServices";
import PeopleIcon from "@mui/icons-material/People";
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";
import FavoriteIcon from "@mui/icons-material/Favorite";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import imagenDental from "../../../assets/images/image.jpg";

const HeroSection = () => {
  const { ref: heroRef, inView: heroInView } = useInView({ triggerOnce: false, threshold: 0.2 });
  const { ref: benefitsRef, inView: benefitsInView } = useInView({ triggerOnce: false, threshold: 0.2 });
  const navigate = useNavigate();

  const benefits = [
    {
      icon: <MedicalServicesIcon fontSize="large" sx={{ color: "#0077b6" }} />,
      title: "Odontología Avanzada",
      description: "Tratamientos modernos y mínimamente invasivos para cuidar tu sonrisa sin dolor.",
    },
    {
      icon: <PeopleIcon fontSize="large" sx={{ color: "#00a8e8" }} />,
      title: "Equipo Profesional",
      description: "Nuestro personal está altamente capacitado y comprometido con tu bienestar.",
    },
    {
      icon: <VerifiedUserIcon fontSize="large" sx={{ color: "#0077b6" }} />,
      title: "Certificación y Seguridad",
      description: "Cumplimos con los más altos estándares de higiene y normativas internacionales.",
    },
    {
      icon: <FavoriteIcon fontSize="large" sx={{ color: "#0077b6" }} />,
      title: "Atención Personalizada",
      description: "Cada paciente recibe un plan de tratamiento adaptado a sus necesidades.",
    },
  ];

  return (
    <>
      {/* Hero Section */}
      <motion.div
        ref={heroRef}
        initial={{ opacity: 0, y: 50 }}
        animate={heroInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
        transition={{ duration: 1 }}
      >
        <Box sx={{ py: { xs: 4, md: 8 }, backgroundColor: "#fff" }}>
          <Container maxWidth="lg">
            <Grid container spacing={4} alignItems="center">
              {/* Columna de texto */}
              <Grid item xs={12} md={6}>
                <Typography
                  variant="overline"
                  sx={{
                    background: "#0077b6",
                    padding: "5px 15px",
                    borderRadius: "5px",
                    color: "white",
                    fontWeight: "bold",
                    letterSpacing: 1.5,
                  }}
                >
                  ATENCIÓN ODONTOLÓGICA
                </Typography>

                <Typography
                  variant="h2"
                  fontWeight="bold"
                  gutterBottom
                  sx={{
                    mt: 2,
                    fontSize: { xs: "1.8rem", sm: "2.5rem", md: "3.5rem" },
                    color: "#004d80",
                  }}
                >
                  Bienvenido al{" "}
                  <motion.span
                    animate={{ color: ["#004d80", "#00b4d8", "#004d80"] }}
                    transition={{ repeat: Infinity, duration: 3 }}
                  >
                    Consultorio Dental
                  </motion.span>
                </Typography>

                <Typography
                  variant="h6"
                  sx={{
                    mb: 4,
                    color: "#555",
                    fontSize: { xs: "1rem", md: "1.2rem" },
                  }}
                >
                  Ofrecemos atención odontológica de calidad con la mejor tecnología y un equipo de
                  profesionales dedicados a cuidar tu sonrisa. Agenda tu cita y deja que nuestros
                  especialistas te brinden el mejor servicio.
                </Typography>

                <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
                  <motion.div whileHover={{ scale: 1.1 }} transition={{ duration: 0.3 }}>
                    <Button
                      variant="contained"
                      sx={{
                        fontSize: { xs: "0.9rem", md: "1rem" },
                        padding: { xs: "8px 16px", md: "10px 20px" },
                        backgroundColor: "#00a8e8",
                        borderRadius: "8px",
                        "&:hover": {
                          backgroundColor: "#0077b6",
                        },
                      }}
                      startIcon={<EventAvailableIcon />}
                      onClick={() => navigate("/agendar-cita")}
                    >
                      Agendar Cita
                    </Button>
                  </motion.div>

                  <motion.div whileHover={{ scale: 1.1 }} transition={{ duration: 0.3 }}>
                    <Button
                      variant="outlined"
                      sx={{
                        fontSize: { xs: "0.9rem", md: "1rem" },
                        padding: { xs: "8px 16px", md: "10px 20px" },
                        borderColor: "#00a8e8",
                        color: "#00a8e8",
                        borderRadius: "8px",
                        "&:hover": {
                          backgroundColor: "#e0f7fa",
                          borderColor: "#0077b6",
                        },
                      }}
                      startIcon={<WhatsAppIcon />}
                      onClick={() => window.open("https://wa.me/1234567890", "_blank")} //por si queremos poner numero de whats
                    >
                      Contactar por WhatsApp
                    </Button>
                  </motion.div>
                </Box>
              </Grid>

              {/* Columna de imagen */}
              <Grid item xs={12} md={6}>
                <motion.div
                  initial={{ opacity: 0, x: 50 }}
                  animate={heroInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 50 }}
                  transition={{ duration: 1 }}
                >
                  <Box
                    component="img"
                    src={imagenDental}
                    alt="Consultorio Dental"
                    sx={{
                      width: "105%",
                      height: "auto",
                      borderRadius: "20px",
                      boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
                    }}
                  />
                </motion.div>
              </Grid>
            </Grid>
          </Container>
        </Box>
      </motion.div>

      {/* Sección de Beneficios */}
      <motion.div
        ref={benefitsRef}
        initial={{ opacity: 0, y: 50 }}
        animate={benefitsInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
        transition={{ duration: 1 }}
      >
        <Box sx={{ backgroundColor: "#f8f8f8", py: { xs: 4, md: 8 } }}>
          <Container maxWidth="lg">
            <Grid container spacing={4} justifyContent="center">
              {benefits.map((item, index) => (
                <Grid item xs={12} sm={6} md={3} key={index}>
                  <motion.div whileHover={{ scale: 1.1 }} transition={{ duration: 0.3 }}>
                    <Box
                      sx={{
                        width: "100px",
                        height: "100px",
                        borderRadius: "50%",
                        backgroundColor: "#ffffff",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        boxShadow: "0px 4px 10px rgba(0,0,0,0.1)",
                        margin: "0 auto 15px auto",
                      }}
                    >
                      {item.icon}
                    </Box>
                  </motion.div>
                  <Typography
                    variant="h6"
                    align="center"
                    sx={{ fontWeight: "bold", color: "#004d80" }}
                  >
                    {item.title}
                  </Typography>
                  <Typography
                    variant="body2"
                    align="center"
                    sx={{ color: "#555", maxWidth: "90%", margin: "0 auto" }}
                  >
                    {item.description}
                  </Typography>
                </Grid>
              ))}
            </Grid>
          </Container>
        </Box>
      </motion.div>
    </>
  );
};

export default HeroSection;