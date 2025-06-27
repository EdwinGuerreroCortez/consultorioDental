import React, { useEffect, useState } from "react";
import {
  Container,
  Typography,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  Box,
  Divider,
  Avatar,
  createTheme,
  ThemeProvider,
  Link,
  Grid,
} from "@mui/material";
import { motion } from "framer-motion";
import SecurityIcon from "@mui/icons-material/Security";

const theme = createTheme({
  palette: {
    primary: { main: "#006d77", contrastText: "#fff" },
    secondary: { main: "#78c1c8" },
    background: {
      default: "#f8fbfc",
      paper: "#ffffff",
    },
    text: {
      primary: "#374151",
      secondary: "#6b7280",
    },
  },
  typography: {
    fontFamily: "'Inter', 'Roboto', sans-serif",
    h4: { fontWeight: 800, letterSpacing: "-0.03em" },
    h6: { fontWeight: 700 },
    body1: { lineHeight: 1.8, color: "#374151" },
    caption: { color: "#9ca3af" },
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          transition: "transform 0.4s ease, box-shadow 0.4s ease",
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)",
          "&:hover": {
            transform: "translateY(-6px)",
            boxShadow: "0 8px 24px rgba(0, 109, 119, 0.15)",
          },
        },
      },
    },
  },
});

const PoliticasPrivacidad = () => {
  const [politicas, setPoliticas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const obtenerPoliticas = async () => {
      try {
        const res = await fetch("http://localhost:4000/api/politicas/listar", {
          credentials: "include",
        });
        if (!res.ok) throw new Error("Error al obtener políticas");
        const data = await res.json();
        setPoliticas(data); // todas las políticas
      } catch (err) {
        console.error(err);
        setError("No se pudo obtener la política de privacidad.");
      } finally {
        setCargando(false);
      }
    };
    obtenerPoliticas();
  }, []);

  const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
  };

  if (cargando) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="70vh">
        <CircularProgress size={70} thickness={5} sx={{ color: "#006d77" }} />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="sm" sx={{ mt: 10 }}>
        <Alert severity="error" sx={{ borderRadius: 8, p: 3, bgcolor: "#fef2f2", color: "#dc2626" }}>
          {error}
        </Alert>
      </Container>
    );
  }

  const ultima = politicas[0];
  const historial = politicas.slice(1); // resto de políticas

  return (
    <ThemeProvider theme={theme}>
      <Container maxWidth="md" sx={{ mt: 8, mb: 12 }}>
        <motion.div variants={cardVariants} initial="hidden" animate="visible">
          <Card elevation={0} sx={{ p: 4, border: "1px solid #cde7e8", mb: 4 }}>
            <CardContent>
              <Box display="flex" alignItems="center" mb={3}>
                <Avatar
                  sx={{
                    bgcolor: "#006d77",
                    mr: 3,
                    width: 60,
                    height: 60,
                    boxShadow: "0 4px 8px rgba(0, 109, 119, 0.2)",
                  }}
                >
                  <SecurityIcon fontSize="large" />
                </Avatar>
                <Typography variant="h4" color="primary" component="h1">
                  Última Política de Privacidad
                </Typography>
              </Box>

              {ultima ? (
                <>
                  <Typography variant="h6" gutterBottom sx={{ color: "#444" }}>
                    {ultima.titulo}
                  </Typography>
                  <Typography variant="body1" sx={{ whiteSpace: "pre-line", textAlign: "justify" }}>
                    {ultima.descripcion}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 2 }}>
                    Publicado el{" "}
                    {new Date(ultima.fecha_creacion).toLocaleDateString("es-MX", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </Typography>
                </>
              ) : (
                <Typography variant="body1" color="text.secondary" textAlign="center">
                  No hay política de privacidad registrada actualmente.
                </Typography>
              )}

              <Box mt={4} textAlign="center">
                <Typography variant="body2" color="text.secondary">
                  Para más información, contáctanos:{" "}
                  <Link
                  href="https://mail.google.com/mail/?view=cm&fs=1&to=leninvelang120381@gmail.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  color="primary"
                >
                  leninvelang120381@gmail.com
                </Link>
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </motion.div>

        {historial.length > 0 && (
          <>
            <Typography variant="h5" sx={{ mb: 2, fontWeight: 700, color: "#006d77" }}>
              Demas Políticas
            </Typography>
            <Grid container spacing={3}>
              {historial.map((item) => (
                <Grid item xs={12} sm={6} key={item.id}>
                  <Card elevation={1} sx={{ p: 2, border: "1px solid #e0f0f3" }}>
                    <CardContent>
                      <Typography variant="h6" color="primary" gutterBottom>
                        {item.titulo}
                      </Typography>
                      <Typography variant="body2" sx={{ whiteSpace: "pre-line", textAlign: "justify" }}>
                        {item.descripcion.length > 300
                          ? item.descripcion.substring(0, 300) + "..."
                          : item.descripcion}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 2 }}>
                        Publicado el{" "}
                        {new Date(item.fecha_creacion).toLocaleDateString("es-MX", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </>
        )}
      </Container>
    </ThemeProvider>
  );
};

export default PoliticasPrivacidad;
