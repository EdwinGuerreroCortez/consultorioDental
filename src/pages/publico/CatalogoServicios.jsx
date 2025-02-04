import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardMedia,
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
  Paper,
  IconButton,
} from "@mui/material";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import FilterListIcon from "@mui/icons-material/FilterList";

const CatalogoServicios = () => {
  const [servicios, setServicios] = useState([]);
  const [filteredServicios, setFilteredServicios] = useState([]);
  const [open, setOpen] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [filtro, setFiltro] = useState("");

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
  }, []);

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
        break;
    }

    setFilteredServicios(serviciosFiltrados);
  };

  const truncarDescripcion = (descripcion, limite = 100) => {
    if (descripcion.length > limite) {
      return descripcion.substring(0, limite) + "...";
    }
    return descripcion;
  };

  // Función para formatear la duración
  const formatearDuracion = (minutos) => {
    if (minutos >= 60) {
      const horas = Math.floor(minutos / 60);
      const minutosRestantes = minutos % 60;
      return minutosRestantes > 0
        ? `${horas} ${horas === 1 ? 'hora' : 'horas'} ${minutosRestantes} minutos`
        : `${horas} ${horas === 1 ? 'hora' : 'horas'}`;
    }
    return `${minutos} minutos`;
  };

  return (
    <Box
      sx={{
        padding: "40px",
        backgroundColor: "#e0f7fa",
        minHeight: "100vh",
      }}
    >
      {/* Título */}
      <Box sx={{ textAlign: "center", marginBottom: "20px" }}>
        <Typography
          variant="h3"
          sx={{
            fontWeight: "bold",
            color: "#ffffff",
            padding: "20px 30px",
            borderRadius: "16px",
            background: "linear-gradient(90deg, #0288d1, #26c6da)",
            boxShadow: "0 8px 20px rgba(0, 0, 0, 0.2)",
            display: "inline-block",
          }}
        >
          Servicios Dentales
        </Typography>
      </Box>

      {/* Filtro alineado a la derecha */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "flex-end",
          alignItems: "center",
          marginBottom: "40px",
        }}
      >
        <Paper
          elevation={8}
          sx={{
            display: "flex",
            alignItems: "center",
            background: "#00acc1",
            borderRadius: "16px",
            padding: "10px 20px",
            boxShadow: "0 8px 20px rgba(0, 0, 0, 0.2)",
            color: "#ffffff",
            maxWidth: "500px",
          }}
        >
          <IconButton sx={{ color: "#fff" }}>
            <FilterListIcon sx={{ fontSize: "32px" }} />
          </IconButton>
          <FormControl variant="outlined" sx={{ minWidth: 250, ml: 2, flexGrow: 1 }}>
            <InputLabel sx={{ color: "#ffffff", fontWeight: "bold" }}>Filtrar por</InputLabel>
            <Select
              value={filtro}
              onChange={handleFiltroChange}
              label="Filtrar por"
              sx={{
                color: "#ffffff",
                "& .MuiOutlinedInput-notchedOutline": { borderColor: "transparent" },
                "&:hover": { backgroundColor: "#26c6da" },
                "& .MuiSelect-icon": { color: "#ffffff" },
              }}
              MenuProps={{
                PaperProps: {
                  sx: {
                    backgroundColor: "#00acc1",
                    color: "#ffffff",
                    "& .MuiMenuItem-root": {
                      padding: "10px",
                      "&:hover": { backgroundColor: "#4dd0e1" },
                    },
                  },
                },
              }}
            >
              <MenuItem value="precio-mayor">Mayor precio</MenuItem>
              <MenuItem value="precio-menor">Menor precio</MenuItem>
              <MenuItem value="citas">Citas requeridas</MenuItem>
              <MenuItem value="duracion">Duración</MenuItem>
              <MenuItem value="requiere-evaluacion">Requiere evaluación</MenuItem>
              <MenuItem value="no-requiere-evaluacion">No requiere evaluación</MenuItem>
            </Select>
          </FormControl>
        </Paper>
      </Box>

      {/* Lista de servicios */}
      <Grid container spacing={5}>
        {filteredServicios.map((servicio) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={servicio.id}>
            <Card
              sx={{
                borderRadius: "20px",
                boxShadow: "0 8px 16px rgba(0, 0, 0, 0.1)",
                transition: "transform 0.3s ease, box-shadow 0.3s ease",
                display: "flex",
                flexDirection: "column",
                height: "100%",
                backgroundColor: "#ffffff",
                "&:hover": {
                  transform: "scale(1.05)",
                  boxShadow: "0 12px 24px rgba(0, 0, 0, 0.2)",
                },
              }}
            >
              <CardMedia
                component="img"
                alt={servicio.nombre}
                height="180"
                image={servicio.imagen || "https://via.placeholder.com/150"}
                sx={{ borderTopLeftRadius: "20px", borderTopRightRadius: "20px" }}
              />
              <CardContent sx={{ flexGrow: 1, padding: "20px" }}>
                <Typography variant="h6" sx={{ fontWeight: "bold", color: "#004d40", marginBottom: "10px" }}>
                  {servicio.nombre}
                </Typography>
                <Typography variant="body2" sx={{ color: "#37474f", marginBottom: "10px" }}>
                  {truncarDescripcion(servicio.descripcion)}
                </Typography>
                <Typography variant="body2" sx={{ color: "#00796b", marginBottom: "10px" }}>
                  Duración: {formatearDuracion(servicio.duracion_minutos)}
                </Typography>
                {servicio.requiere_evaluacion ? (
                  <Tooltip title="Este tratamiento requiere evaluación." arrow>
                    <Typography
                      variant="body2"
                      sx={{ color: "#e65100", display: "flex", alignItems: "center" }}
                    >
                      <InfoOutlinedIcon sx={{ fontSize: "18px", marginRight: "5px" }} />
                      Requiere evaluación previa
                    </Typography>
                  </Tooltip>
                ) : (
                  <Typography variant="body2" sx={{ color: "#d32f2f" }}>
                    Precio: {servicio.precio} MXN
                  </Typography>
                )}

                <Button
                  variant="contained"
                  sx={{
                    backgroundColor: "#00796b",
                    color: "#ffffff",
                    fontWeight: "bold",
                    marginTop: "20px",
                    "&:hover": { backgroundColor: "#004d40" },
                  }}
                  onClick={() => handleOpen(servicio)}
                >
                  Ver Más
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Diálogo de detalles */}
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        {selectedService && (
          <>
            <DialogTitle sx={{ fontWeight: "bold", color: "#00796b" }}>{selectedService.nombre}</DialogTitle>
            <DialogContent>
              <Box sx={{ padding: "20px", backgroundColor: "#e0f7fa", borderRadius: "12px" }}>
                <img
                  src={selectedService.imagen || "https://via.placeholder.com/150"}
                  alt={selectedService.nombre}
                  style={{ width: "100%", borderRadius: "12px", marginBottom: "20px" }}
                />
                <Typography variant="body1" sx={{ color: "#37474f", marginBottom: "20px" }}>
                  {selectedService.descripcion}
                </Typography>
                <Box sx={{ display: "flex", justifyContent: "space-between", padding: "10px", backgroundColor: "#fafafa", borderRadius: "8px" }}>
                  <Typography variant="body2" sx={{ color: "#00796b" }}>Citas: {selectedService.citas_requeridas || "N/A"}</Typography>
                  <Typography variant="body2" sx={{ color: "#d32f2f" }}>Precio: {selectedService.precio} MXN</Typography>
                </Box>
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleClose} sx={{ color: "#00796b" }}>Cerrar</Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default CatalogoServicios;
