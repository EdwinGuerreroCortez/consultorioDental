import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Grid,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tooltip,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  IconButton,
  Chip,
  Divider,
} from "@mui/material";
import FilterListIcon from "@mui/icons-material/FilterList";
import WarningIcon from "@mui/icons-material/Warning";
import ScheduleIcon from "@mui/icons-material/Schedule";
import { motion, useInView, AnimatePresence } from "framer-motion";

const CatalogoServicios = () => {
  const [servicios, setServicios] = useState([]);
  const [filteredServicios, setFilteredServicios] = useState([]);
  const [open, setOpen] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [filtro, setFiltro] = useState("");
  const [destacadoIndex, setDestacadoIndex] = useState(0);
  const navigate = useNavigate();
  const serviciosRef = useRef(null);
  const isInView = useInView(serviciosRef, { once: true, margin: "-50px 0px" });

  useEffect(() => {
    const fetchTratamientos = async () => {
      try {
        const response = await fetch("http://localhost:4000/api/tratamientos");
        const data = await response.json();
        const tratamientosActivos = data.filter((tratamiento) => tratamiento.estado === 1);
        setServicios(tratamientosActivos);
        setFilteredServicios(tratamientosActivos);
      } catch (error) {
        console.error("Error al obtener tratamientos:", error);
      }
    };

    fetchTratamientos();

    const interval = setInterval(() => {
      setDestacadoIndex((prevIndex) => (prevIndex + 1) % servicios.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [servicios.length]);

  const handleOpen = (servicio) => {
    setSelectedService(servicio);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedService(null);
  };

  const handleFiltroChange = (event) => {
    const criterio = event.target.value;
    setFiltro(criterio);

    let serviciosFiltrados = [...servicios];

    switch (criterio) {
      case "precio-mayor":
        serviciosFiltrados = servicios.filter((s) => !s.requiere_evaluacion);
        serviciosFiltrados.sort((a, b) => b.precio - a.precio);
        break;
      case "precio-menor":
        serviciosFiltrados = servicios.filter((s) => !s.requiere_evaluacion);
        serviciosFiltrados.sort((a, b) => a.precio - b.precio);
        break;
      case "citas":
        serviciosFiltrados.sort((a, b) => (a.citas_requeridas || 0) - (b.citas_requeridas || 0));
        break;
      case "duracion":
        serviciosFiltrados.sort((a, b) => a.duracion_minutos - b.duracion_minutos);
        break;
      case "requiere-evaluacion":
        serviciosFiltrados = servicios.filter((s) => s.requiere_evaluacion);
        break;
      case "no-requiere-evaluacion":
        serviciosFiltrados = servicios.filter((s) => !s.requiere_evaluacion);
        break;
      default:
        serviciosFiltrados = servicios;
        break;
    }

    setFilteredServicios(serviciosFiltrados);
  };

  // Función para mostrar el precio con "por cita"
  const getPrecioDisplay = (servicio) => {
    if (servicio.requiere_evaluacion) {
      return "Consultar";
    }
    return servicio.precio === "0.00" ? "N/A" : `${servicio.precio} MXN por cita`;
  };

  // Nueva función para convertir minutos a horas si es necesario
  const getDuracionDisplay = (minutos) => {
    if (minutos >= 60) {
      const horas = Math.floor(minutos / 60);
      const minutosRestantes = minutos % 60;
      return minutosRestantes > 0 ? `${horas} hr ${minutosRestantes} min` : `${horas} hr`;
    }
    return `${minutos} min`;
  };

  const handleScrollToServicios = () => {
    serviciosRef.current.scrollIntoView({ behavior: "smooth" });
  };

  const tratamientoDestacado = servicios.length > 0 ? servicios[destacadoIndex] : null;

  const destacadoVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
    exit: { opacity: 0, y: -20, transition: { duration: 0.5 } },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.2, duration: 0.5, ease: "easeOut" },
    }),
  };

  return (
    <Box
      sx={{
        padding: { xs: "20px", md: "40px" },
        background: "linear-gradient(180deg, #f0f4ff 0%, #ffffff 100%)",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      {/* Sección Introductoria */}
      <Box
        sx={{
          width: "100%",
          maxWidth: "1500px",
          mb: 8,
          padding: { xs: "20px", md: "40px" },
        }}
      >
        <Grid container spacing={4} alignItems="center">
          <Grid item xs={12} md={8}>
            <Typography
              variant="h2"
              sx={{
                fontWeight: 800,
                color: "#003087",
                fontSize: { xs: "2rem", md: "2.5rem" },
                fontFamily: "'Poppins', sans-serif",
                textTransform: "uppercase",
                lineHeight: 1.2,
                mb: 3,
              }}
            >
              Servicios Dentales
            </Typography>
            <Typography
              variant="h6"
              sx={{
                color: "#37474f",
                fontSize: { xs: "1rem", md: "1.3rem" },
                fontFamily: "'Poppins', sans-serif",
                mb: 4,
                maxWidth: "700px",
              }}
            >
              Ofrecemos una amplia gama de tratamientos dentales diseñados para cuidar tu salud bucal. Desde limpiezas profundas hasta procedimientos especializados, nuestro equipo está aquí para ayudarte.
            </Typography>
            <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
              <Button
                variant="contained"
                onClick={handleScrollToServicios}
                sx={{
                  backgroundColor: "#003087",
                  color: "#ffffff",
                  borderRadius: "25px",
                  padding: "10px 25px",
                  fontWeight: 600,
                  fontFamily: "'Poppins', sans-serif",
                  textTransform: "uppercase",
                  "&:hover": { backgroundColor: "#0052cc" },
                }}
              >
                Ver Servicios
              </Button>
            </Box>
          </Grid>
          <Grid item xs={12} md={4}>
            <AnimatePresence mode="wait">
              {tratamientoDestacado && (
                <motion.div
                  key={destacadoIndex}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  variants={destacadoVariants}
                >
                  <Box
                    sx={{
                      background: "#ffffff",
                      borderRadius: "15px",
                      boxShadow: "0 6px 20px rgba(0, 48, 135, 0.1)",
                      padding: "20px",
                    }}
                  >
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 700,
                        color: "#003087",
                        fontSize: { xs: "1.2rem", md: "1.5rem" },
                        fontFamily: "'Poppins', sans-serif",
                        mb: 2,
                        textTransform: "uppercase",
                      }}
                    >
                      Tratamiento Destacado: {tratamientoDestacado.nombre}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        color: "#37474f",
                        fontFamily: "'Poppins', sans-serif",
                        mb: 3,
                      }}
                    >
                      {tratamientoDestacado.descripcion.length > 120
                        ? `${tratamientoDestacado.descripcion.substring(0, 120)}...`
                        : tratamientoDestacado.descripcion}
                    </Typography>
                    <Box sx={{ display: "flex", gap: 2 }}>
                      <Button
                        variant="contained"
                        onClick={() => handleOpen(tratamientoDestacado)}
                        sx={{
                          backgroundColor: "#003087",
                          color: "#ffffff",
                          borderRadius: "20px",
                          padding: "8px 20px",
                          fontFamily: "'Poppins', sans-serif",
                          "&:hover": { backgroundColor: "#0052cc" },
                        }}
                      >
                        Ver Detalles
                      </Button>
                      <Button
                        variant="outlined"
                        onClick={() => navigate("/agendar-cita")}
                        sx={{
                          color: "#003087",
                          borderColor: "#003087",
                          borderRadius: "20px",
                          padding: "8px 20px",
                          fontFamily: "'Poppins', sans-serif",
                          "&:hover": { backgroundColor: "#e6f0fa" },
                        }}
                      >
                        Agendar Cita
                      </Button>
                    </Box>
                  </Box>
                </motion.div>
              )}
            </AnimatePresence>
          </Grid>
        </Grid>
      </Box>

      {/* División clara entre la introducción y el catálogo */}
      <Divider
        sx={{
          width: "100%",
          maxWidth: "1500px",
          borderColor: "#e0e7ff",
          borderWidth: "2px",
          mb: 6,
        }}
      />

      {/* Encabezado del Catálogo */}
      <Box
        sx={{
          width: "100%",
          maxWidth: "1500px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 5,
          flexWrap: "wrap",
          gap: 2,
          padding: "25px 30px",
          background: "#ffffff",
          borderRadius: "15px",
          boxShadow: "0 8px 25px rgba(0, 48, 135, 0.1)",
          border: "1px solid #e0e7ff",
        }}
      >
        <Typography
          variant="h4"
          sx={{
            fontWeight: 800,
            color: "#003087",
            fontSize: { xs: "1.5rem", md: "2rem" },
            fontFamily: "'Poppins', sans-serif",
            letterSpacing: "1.5px",
            textTransform: "uppercase",
          }}
        >
          Todos los Servicios
        </Typography>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Tooltip title="Filtra los servicios según diferentes criterios">
            <IconButton sx={{ color: "#003087", backgroundColor: "#e6f0fa", "&:hover": { backgroundColor: "#d0e0ff" } }}>
              <FilterListIcon sx={{ fontSize: "30px" }} />
            </IconButton>
          </Tooltip>
          <FormControl variant="outlined" sx={{ minWidth: 220 }}>
            <InputLabel sx={{ color: "#003087", fontWeight: "medium" }}>Filtrar por</InputLabel>
            <Select
              value={filtro}
              onChange={handleFiltroChange}
              label="Filtrar por"
              sx={{
                color: "#003087",
                background: "#ffffff",
                borderRadius: "12px",
                fontFamily: "'Poppins', sans-serif",
                "& .MuiOutlinedInput-notchedOutline": { borderColor: "#003087" },
                "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#0052cc" },
              }}
            >
              <MenuItem value="">Sin filtro</MenuItem>
              <MenuItem value="precio-mayor">Mayor precio</MenuItem>
              <MenuItem value="precio-menor">Menor precio</MenuItem>
              <MenuItem value="citas">Citas requeridas</MenuItem>
              <MenuItem value="duracion">Duración</MenuItem>
              <MenuItem value="requiere-evaluacion">Requiere valoración</MenuItem>
              <MenuItem value="no-requiere-evaluacion">No requiere valoración</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Box>

      {/* Lista de servicios con animación controlada por el contenedor */}
      <Box sx={{ width: "100%", maxWidth: "1500px" }} ref={serviciosRef}>
        <motion.div
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={{
            visible: {
              transition: {
                staggerChildren: 0.2,
              },
            },
          }}
        >
          <Grid container spacing={4} justifyContent="center">
            {filteredServicios.map((servicio, index) => (
              <Grid item xs={12} sm={6} md={3} key={servicio.id}>
                <motion.div
                  custom={index}
                  variants={cardVariants}
                  whileHover={{ scale: 1.05 }}
                >
                  <Box
                    sx={{
                      borderRadius: "20px",
                      background: "linear-gradient(145deg, #ffffff 0%, #f9fbfc 100%)",
                      boxShadow: "0 8px 25px rgba(0, 48, 135, 0.15)",
                      height: "450px",
                      display: "flex",
                      flexDirection: "column",
                      overflow: "hidden",
                      border: "1px solid #e0e7ff",
                      position: "relative",
                    }}
                  >
                    <Box sx={{ height: "200px", flexShrink: 0 }}>
                      <img
                        src={servicio.imagen || "https://via.placeholder.com/400x200?text=Sin+Imagen"}
                        alt={servicio.nombre}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                          borderTopLeftRadius: "20px",
                          borderTopRightRadius: "20px",
                        }}
                      />
                    </Box>
                    <Box
                      sx={{
                        padding: "20px",
                        flexGrow: 1,
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "space-between",
                      }}
                    >
                      <Box>
                        <Typography
                          sx={{
                            fontWeight: 700,
                            color: "#003087",
                            fontSize: "1.2rem",
                            fontFamily: "'Poppins', sans-serif",
                            textTransform: "uppercase",
                            mb: 1,
                          }}
                        >
                          {servicio.nombre.toLowerCase()}
                        </Typography>
                        <Typography
                          sx={{
                            color: "#37474f",
                            fontSize: "0.95rem",
                            lineHeight: 1.6,
                            fontFamily: "'Poppins', sans-serif",
                            height: "70px",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                        >
                          {servicio.descripcion.length > 110
                            ? `${servicio.descripcion.substring(0, 110)}...`
                            : servicio.descripcion}
                        </Typography>
                        <Box sx={{ mt: 2, display: "flex", alignItems: "center", gap: 1 }}>
                          <Chip
                            label={getPrecioDisplay(servicio)}
                            size="small"
                            sx={{
                              backgroundColor: "#e6f0fa",
                              color: "#003087",
                              fontWeight: 600,
                              fontFamily: "'Poppins', sans-serif",
                            }}
                          />
                          <Chip
                            icon={<ScheduleIcon />}
                            label={getDuracionDisplay(servicio.duracion_minutos)} // Usamos la nueva función
                            size="small"
                            sx={{
                              backgroundColor: "#e6f0fa",
                              color: "#003087",
                              fontWeight: 600,
                              fontFamily: "'Poppins', sans-serif",
                            }}
                          />
                        </Box>
                      </Box>
                      <Button
                        onClick={() => handleOpen(servicio)}
                        sx={{
                          color: "#ffffff",
                          fontWeight: 600,
                          fontSize: "1rem",
                          fontFamily: "'Poppins', sans-serif",
                          backgroundColor: "#003087",
                          borderRadius: "25px",
                          padding: "8px 20px",
                          textTransform: "uppercase",
                          mt: 2,
                          alignSelf: "center",
                          "&:hover": {
                            backgroundColor: "#0052cc",
                          },
                        }}
                      >
                        Ver Más
                      </Button>
                    </Box>
                  </Box>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </motion.div>
      </Box>

      {/* Diálogo de detalles */}
      <Dialog open={open} onClose={handleClose} maxWidth="lg" fullWidth>
        {selectedService && (
          <>
            <DialogTitle
              sx={{
                fontWeight: 800,
                color: "#ffffff",
                fontSize: { xs: "1.5rem", md: "2rem" },
                fontFamily: "'Poppins', sans-serif",
                background: "linear-gradient(90deg, #003087 0%, #0052cc 100%)",
                py: 4,
                textTransform: "uppercase",
                letterSpacing: "1.5px",
                borderBottom: "3px solid #e0e7ff",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              {selectedService.nombre}
            </DialogTitle>
            <DialogContent
              sx={{
                background: "#f5f9ff",
                py: 6,
                px: 5,
                minHeight: "600px",
              }}
            >
              <Box
                sx={{
                  borderRadius: "20px",
                  overflow: "hidden",
                  background: "#ffffff",
                  boxShadow: "0 8px 30px rgba(0, 48, 135, 0.1)",
                  p: 4,
                }}
              >
                <Grid container spacing={4}>
                  <Grid item xs={12} md={6}>
                    <img
                      src={selectedService.imagen || "https://via.placeholder.com/600x350?text=Sin+Imagen"}
                      alt={selectedService.nombre}
                      style={{
                        width: "100%",
                        maxHeight: "350px",
                        objectFit: "cover",
                        borderRadius: "15px",
                        border: "3px solid #e0e7ff",
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography
                      sx={{
                        color: "#37474f",
                        fontSize: { xs: "1.1rem", md: "1.3rem" },
                        lineHeight: 1.8,
                        fontFamily: "'Poppins', sans-serif",
                        mb: 4,
                        textAlign: "justify",
                      }}
                    >
                      {selectedService.descripcion}
                    </Typography>
                    <Divider sx={{ mb: 3, borderColor: "#e0e7ff" }} />
                    <Box
                      sx={{
                        display: "grid",
                        gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
                        gap: 3,
                        background: "#f9fbfc",
                        borderRadius: "15px",
                        p: 3,
                        border: "2px solid #e0e7ff",
                      }}
                    >
                      <Box>
                        <Typography
                          sx={{
                            color: "#003087",
                            fontWeight: 700,
                            fontSize: "1.1rem",
                            fontFamily: "'Poppins', sans-serif",
                          }}
                        >
                          Precio
                        </Typography>
                        <Typography
                          sx={{
                            color: "#37474f",
                            fontSize: "1.15rem",
                            fontFamily: "'Poppins', sans-serif",
                          }}
                        >
                          {getPrecioDisplay(selectedService)} {/* Actualizado con "por cita" */}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography
                          sx={{
                            color: "#003087",
                            fontWeight: 700,
                            fontSize: "1.1rem",
                            fontFamily: "'Poppins', sans-serif",
                          }}
                        >
                          Citas requeridas
                        </Typography>
                        <Typography
                          sx={{
                            color: "#37474f",
                            fontSize: "1.15rem",
                            fontFamily: "'Poppins', sans-serif",
                          }}
                        >
                          {selectedService.citas_requeridas || "N/A"}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography
                          sx={{
                            color: "#003087",
                            fontWeight: 700,
                            fontSize: "1.1rem",
                            fontFamily: "'Poppins', sans-serif",
                          }}
                        >
                          Duración
                        </Typography>
                        <Typography
                          sx={{
                            color: "#37474f",
                            fontSize: "1.15rem",
                            fontFamily: "'Poppins', sans-serif",
                          }}
                        >
                          {getDuracionDisplay(selectedService.duracion_minutos)} {/* Usamos la nueva función */}
                        </Typography>
                      </Box>
                      <Box>
                        {selectedService.requiere_evaluacion && (
                          <>
                            <Typography
                              sx={{
                                color: "#003087",
                                fontWeight: 700,
                                fontSize: "1.1rem",
                                fontFamily: "'Poppins', sans-serif",
                              }}
                            >
                              Valoración
                            </Typography>
                            <Typography
                              sx={{
                                color: "#d32f2f",
                                fontSize: "1.15rem",
                                fontFamily: "'Poppins', sans-serif",
                                display: "flex",
                                alignItems: "center",
                              }}
                            >
                              <WarningIcon sx={{ mr: 1, fontSize: "1.3rem" }} /> Requiere valoración
                            </Typography>
                          </>
                        )}
                      </Box>
                    </Box>
                    <Button
                      variant="contained"
                      onClick={() => navigate("/agendar-cita")}
                      sx={{
                        mt: 3,
                        backgroundColor: "#003087",
                        color: "#ffffff",
                        borderRadius: "25px",
                        padding: "12px 30px",
                        fontFamily: "'Poppins', sans-serif",
                        "&:hover": { backgroundColor: "#002966" },
                      }}
                    >
                      Agendar Ahora
                    </Button>
                  </Grid>
                </Grid>
              </Box>
            </DialogContent>
            <DialogActions
              sx={{
                background: "#f5f9ff",
                py: 4,
                px: 5,
                borderTop: "3px solid #e0e7ff",
              }}
            >
              <Button
                onClick={handleClose}
                sx={{
                  color: "#ffffff",
                  fontWeight: 600,
                  fontSize: "1.1rem",
                  fontFamily: "'Poppins', sans-serif",
                  backgroundColor: "#003087",
                  borderRadius: "25px",
                  px: 5,
                  py: 1.5,
                  textTransform: "uppercase",
                  "&:hover": { backgroundColor: "#002966" },
                }}
              >
                Cerrar
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default CatalogoServicios;