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
} from "@mui/material";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";

const CatalogoServicios = () => {
  const [servicios, setServicios] = useState([]);
  const [open, setOpen] = useState(false);
  const [selectedService, setSelectedService] = useState(null);

  useEffect(() => {
    // Obtener tratamientos desde el backend
    const fetchTratamientos = async () => {
      try {
        const response = await fetch("http://localhost:4000/api/tratamientos"); // Cambia la URL si es necesario
        const data = await response.json();

        // Filtrar solo los tratamientos activos
        const tratamientosActivos = data.filter((tratamiento) => tratamiento.estado === 1);
        setServicios(tratamientosActivos);
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

  // Función para truncar la descripción
  const truncarDescripcion = (descripcion, limite = 100) => {
    if (descripcion.length > limite) {
      return descripcion.substring(0, limite) + "...";
    }
    return descripcion;
  };

  return (
    <Box
      sx={{
        padding: "30px",
        backgroundColor: "#e0f7fa",
        minHeight: "100vh",
      }}
    >
      <Typography
        variant="h3"
        align="center"
        sx={{
          marginBottom: "30px",
          fontWeight: "bold",
          color: "#00695c",
          fontFamily: "Arial, sans-serif",
        }}
      >
        Servicios Dentales
      </Typography>
      <Grid container spacing={4}>
        {servicios.map((servicio) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={servicio.id}>
            <Card
              sx={{
                borderRadius: "20px",
                boxShadow: "0 6px 12px rgba(0, 0, 0, 0.1)",
                transition: "transform 0.3s ease, box-shadow 0.3s ease",
                display: "flex",
                flexDirection: "column",
                height: "100%",
                "&:hover": {
                  transform: "scale(1.05)",
                  boxShadow: "0 8px 16px rgba(0, 0, 0, 0.2)",
                },
              }}
            >
              <CardMedia
                component="img"
                alt={servicio.nombre}
                height="160"
                image={servicio.imagen || "https://via.placeholder.com/150"}
                sx={{
                  borderTopLeftRadius: "20px",
                  borderTopRightRadius: "20px",
                }}
              />
              <CardContent sx={{ flexGrow: 1, display: "flex", flexDirection: "column" }}>
                <Typography
                  variant="h5"
                  sx={{ fontWeight: "bold", color: "#004d40", marginBottom: "10px" }}
                >
                  {servicio.nombre}
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ margin: "10px 0", flexGrow: 1, fontSize: "0.9rem" }}
                >
                  {truncarDescripcion(servicio.descripcion, 120)}
                </Typography>

                {/* Mostrar detalles adicionales */}
                {servicio.requiere_evaluacion ? (
                  <Tooltip
                    title="Este tratamiento requiere evaluación para determinar el plan adecuado."
                    arrow
                    placement="top"
                  >
                    <Typography
                      variant="body2"
                      sx={{
                        color: "#ff7043",
                        display: "flex",
                        alignItems: "center",
                        marginBottom: "10px",
                        fontSize: "0.95rem",
                      }}
                    >
                      <InfoOutlinedIcon sx={{ fontSize: "18px", marginRight: "5px" }} />
                      Requiere evaluación previa
                    </Typography>
                  </Tooltip>
                ) : (
                  <>
                    <Typography variant="body2" sx={{ marginBottom: "5px", fontSize: "0.95rem" }}>
                      Citas requeridas: {servicio.citas_requeridas || "N/A"}
                    </Typography>
                    <Typography variant="body2" sx={{ marginBottom: "10px", fontSize: "0.95rem" }}>
                      Precio: {servicio.precio} MXN
                    </Typography>
                  </>
                )}

                <Button
                  variant="contained"
                  sx={{
                    backgroundColor: "#004d40",
                    "&:hover": {
                      backgroundColor: "#002f2b",
                    },
                    width: "100%",
                    marginTop: "auto",
                    color: "#fff",
                    fontWeight: "bold",
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

      {/* Dialog para detalles del servicio */}
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        {selectedService && (
          <>
            <DialogTitle sx={{ fontWeight: "bold", color: "#00695c" }}>
              {selectedService.nombre}
            </DialogTitle>
            <DialogContent>
              <img
                src={selectedService.imagen || "https://via.placeholder.com/150"}
                alt={selectedService.nombre}
                style={{ width: "100%", borderRadius: "10px", marginBottom: "20px" }}
              />
              <Typography variant="body1" sx={{ marginBottom: "10px" }}>
                {selectedService.descripcion}
              </Typography>
              <Typography variant="body2" sx={{ marginBottom: "5px" }}>
                Citas requeridas: {selectedService.citas_requeridas || "N/A"}
              </Typography>
              <Typography variant="body2" sx={{ marginBottom: "10px" }}>
                Precio: {selectedService.requiere_evaluacion ? "Evaluación previa requerida" : `${selectedService.precio} MXN`}
              </Typography>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleClose} color="primary">
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
