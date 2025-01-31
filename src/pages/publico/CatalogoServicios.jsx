import React, { useState } from "react";
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
} from "@mui/material";

const servicios = [
  {
    id: 1,
    titulo: "Limpieza Dental",
    descripcion: "Elimina la placa y el sarro para mantener tus dientes saludables.",
    imagen: "https://imgs.search.brave.com/00j18ILhd-eAkJhik7iXTX7R5BS8TUj6FXNOGVf3VEM/rs:fit:500:0:0:0/g:ce/aHR0cHM6Ly93d3cu/c29ucmlzYW9ydG9k/ZW50YWwuY29tL2Zp/Y2hlcm9zL2ltYWdl/bmVzLzIwMjBfMDEv/bWluaXMvMTIwMHg4/MDBfc2luLXRpLXR1/bG9fMS5wbmc",
    precio: "$500 MXN",
  },
  {
    id: 2,
    titulo: "Blanqueamiento Dental",
    descripcion: "Obtén una sonrisa más blanca y brillante.",
    imagen: "https://imgs.search.brave.com/OPAZehqRNlCX8QHm4b2A5d1q7OqloPU-S_49uKc-lMQ/rs:fit:500:0:0:0/g:ce/aHR0cHM6Ly9sYWNs/aW5pY2Fyb21hLmNv/bS5teC93cC1jb250/ZW50L3VwbG9hZHMv/MjAxOS8wMS9ibGFu/cXVlYW1pZW50by1k/ZXNwdWVzLmpwZw",
    precio: "$1,200 MXN",
  },
  {
    id: 3,
    titulo: "Ortodoncia",
    descripcion: "Corrige la alineación de tus dientes con brackets.",
    imagen: "https://imgs.search.brave.com/dGRD_-2EV-67J2bMzEh6DShYSZwWTg9E2P2_vqsrrc4/rs:fit:500:0:0:0/g:ce/aHR0cHM6Ly9sYWNs/aW5pY2Fyb21hLmNv/bS5teC93cC1jb250/ZW50L3VwbG9hZHMv/MjAxOS8wMy9vcnRv/ZG9uY2lhcy00Lmpw/Zw",
    precio: "$2,500 MXN",
  },
  {
    id: 4,
    titulo: "Implantes Dentales",
    descripcion: "Recupera la funcionalidad y estética de tu sonrisa.",
    imagen: "https://imgs.search.brave.com/gEqW_13zelaqUqi8KTo2EpJsoFgqKiYZnJvglD3DRx4/rs:fit:500:0:0:0/g:ce/aHR0cHM6Ly93d3cu/b2Rvc2RlbnRhbC5j/b20vd3AtY29udGVu/dC91cGxvYWRzLzIw/MjEvMTIvZGVudGFs/LWltcGxhbnRzLWZv/ci1wYXRpZW50LTIw/MjEtMDgtMjktMjEt/MjUtNDctdXRjLTEt/MTE0MHg2NDAuanBn",
    precio: "$10,000 MXN",
  },
];

const CatalogoServicios = () => {
  const [open, setOpen] = useState(false);
  const [selectedService, setSelectedService] = useState(null);

  const handleOpen = (servicio) => {
    setSelectedService(servicio);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedService(null);
  };

  return (
    <Box
      sx={{
        padding: "20px",
        backgroundColor: "#f0f4f8",
        minHeight: "100vh",
      }}
    >
      <Typography
        variant="h4"
        align="center"
        sx={{ marginBottom: "20px", fontWeight: "bold", color: "#0077b6" }}
      >
        Catálogo de Servicios
      </Typography>
      <Grid container spacing={3}>
        {servicios.map((servicio) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={servicio.id}>
            <Card
              sx={{
                borderRadius: "15px",
                boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
                transition: "transform 0.3s ease",
                display: "flex",
                flexDirection: "column",
                height: "100%",
                "&:hover": {
                  transform: "scale(1.05)",
                },
              }}
            >
              <CardMedia
                component="img"
                alt={servicio.titulo}
                height="150"
                image={servicio.imagen}
                sx={{ borderTopLeftRadius: "15px", borderTopRightRadius: "15px" }}
              />
              <CardContent sx={{ flexGrow: 1, display: "flex", flexDirection: "column" }}>
                <Typography
                  variant="h6"
                  sx={{ fontWeight: "bold", color: "#0077b6" }}
                >
                  {servicio.titulo}
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ margin: "10px 0", flexGrow: 1 }}
                >
                  {servicio.descripcion}
                </Typography>
                <Typography
                  variant="h6"
                  sx={{ color: "#009688", marginBottom: "10px" }}
                >
                  {servicio.precio}
                </Typography>
                <Button
                  variant="contained"
                  sx={{
                    backgroundColor: "#0077b6",
                    "&:hover": {
                      backgroundColor: "#005f8d",
                    },
                    width: "100%",
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
            <DialogTitle>{selectedService.titulo}</DialogTitle>
            <DialogContent>
              <img
                src={selectedService.imagen}
                alt={selectedService.titulo}
                style={{ width: "100%", borderRadius: "10px", marginBottom: "20px" }}
              />
              <Typography variant="body1" sx={{ marginBottom: "10px" }}>
                {selectedService.descripcion}
              </Typography>
              <Typography variant="h6" sx={{ color: "#009688" }}>
                Precio: {selectedService.precio}
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
