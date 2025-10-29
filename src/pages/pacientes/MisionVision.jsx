import React, { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  Box,
  Divider,
  Stack,
  Avatar,
  createTheme,
  ThemeProvider,
} from '@mui/material';
import { motion } from 'framer-motion';
import FlagIcon from '@mui/icons-material/Flag';
import VisibilityIcon from '@mui/icons-material/Visibility';

// Custom MUI Theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#1e3a8a', // Deep blue to match nav
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#6b7280', // Neutral gray for accents
    },
    background: {
      default: '#f3f4f6', // Light gray background
      paper: '#ffffff',
    },
  },
  typography: {
    fontFamily: "'Inter', 'Roboto', sans-serif",
    h4: {
      fontWeight: 800,
      letterSpacing: '-0.03em',
    },
    h6: {
      fontWeight: 700,
    },
    body1: {
      lineHeight: 1.8,
      color: '#374151',
    },
    caption: {
      color: '#9ca3af',
    },
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          transition: 'transform 0.4s ease, box-shadow 0.4s ease',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
          '&:hover': {
            transform: 'translateY(-10px)',
            boxShadow: '0 8px 24px rgba(30, 58, 138, 0.15)',
          },
        },
      },
    },
  },
});

const MisionVision = () => {
  const [datos, setDatos] = useState({ mision: null, vision: null });
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const obtenerDatos = async () => {
      try {
        const respuesta = await fetch('https://backenddent.onrender.com/api/mision-vision/vigentes', {
          credentials: 'include',
        });
        if (!respuesta.ok) throw new Error('Error al obtener misión y visión');

        const resultado = await respuesta.json();
        setDatos(resultado);
      } catch (err) {
        console.error(err);
        setError('No se pudo obtener la información institucional.');
      } finally {
        setCargando(false);
      }
    };

    obtenerDatos();
  }, []);

  const heroVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
  };
  const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
  };

  if (cargando) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="70vh"
        sx={{
          background: 'linear-gradient(180deg, #f3f4f6 0%, #e5e7eb 100%)',
          position: 'relative',
        }}
      >
        <CircularProgress size={70} thickness={5} sx={{ color: '#4b5563' }} />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="sm" sx={{ mt: 10, position: 'relative' }}>
        <Alert
          severity="error"
          sx={{
            borderRadius: 8,
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
            p: 3,
            bgcolor: '#fef2f2',
            color: '#dc2626',
          }}
        >
          {error}
        </Alert>
      </Container>
    );
  }

  return (
    <ThemeProvider theme={theme}>


      <Container maxWidth="md" sx={{ mb: 12 }}>
        <Stack spacing={6}>
          {datos.mision && (
            <motion.div variants={cardVariants} initial="hidden" animate="visible" transition={{ delay: 0.2 }}>
              <Card
                elevation={0}
                sx={{
                  borderRadius: 12,
                  p: 3,
                  background: '#ffffff',
                  border: '1px solid #e5e7eb',
                }}
              >
                <CardContent>
                  <Box display="flex" alignItems="center" mb={4}>
                    <Avatar
                      sx={{
                        bgcolor: '#1e3a8a',
                        mr: 3,
                        width: 60,
                        height: 60,
                        boxShadow: '0 4px 8px rgba(30, 58, 138, 0.1)',
                      }}
                    >
                      <FlagIcon fontSize="large" />
                    </Avatar>
                    <Box>
                      <Typography variant="h6" sx={{ color: '#1e3a8a' }}>
                        Misión
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#9ca3af' }}>
                        Versión {datos.mision.version}
                      </Typography>
                    </Box>
                  </Box>
                  <Divider sx={{ mb: 4, borderColor: '#e5e7eb' }} />
                  <Typography variant="body1" sx={{ textAlign: 'justify' }}>
                    {datos.mision.contenido}
                  </Typography>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {datos.vision && (
            <motion.div variants={cardVariants} initial="hidden" animate="visible" transition={{ delay: 0.4 }}>
              <Card
                elevation={0}
                sx={{
                  borderRadius: 12,
                  p: 3,
                  background: '#ffffff',
                  border: '1px solid #e5e7eb',
                }}
              >
                <CardContent>
                  <Box display="flex" alignItems="center" mb={4}>
                    <Avatar
                      sx={{
                        bgcolor: '#6b7280',
                        mr: 3,
                        width: 60,
                        height: 60,
                        boxShadow: '0 4px 8px rgba(107, 114, 128, 0.1)',
                      }}
                    >
                      <VisibilityIcon fontSize="large" />
                    </Avatar>
                    <Box>
                      <Typography variant="h6" sx={{ color: '#6b7280' }}>
                        Visión
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#9ca3af' }}>
                        Versión {datos.vision.version}
                      </Typography>
                    </Box>
                  </Box>
                  <Divider sx={{ mb: 4, borderColor: '#e5e7eb' }} />
                  <Typography variant="body1" sx={{ textAlign: 'justify' }}>
                    {datos.vision.contenido}
                  </Typography>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </Stack>
      </Container>
    </ThemeProvider>
  );
};

export default MisionVision;