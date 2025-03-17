import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { verificarAutenticacion } from "../../utils/auth";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  CircularProgress,
  Snackbar,
  Alert,
  Pagination,
  Chip,
  IconButton,
  Tooltip,
} from "@mui/material";
import { CalendarToday, ArrowBack, EventAvailable, Add } from "@mui/icons-material";
import dayjs from "dayjs";
import "dayjs/locale/es";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import { styled } from "@mui/system";
import { useNavigate } from "react-router-dom";

// Extend dayjs with timezone support
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.locale("es");

// Styled components
const HeaderBox = styled(Box)(({ theme }) => ({
  backgroundColor: "#0288d1",
  color: "#ffffff",
  padding: theme.spacing(2),
  borderRadius: "12px 12px 0 0",
  display: "flex",
  alignItems: "center",
  gap: "8px",
  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
  width: "100%",
  maxWidth: "1200px", // Aumentado para hacer el formulario más largo en los lados
}));

const AppointmentCard = styled(Card)(({ theme }) => ({
  backgroundColor: "#ffffff",
  borderRadius: "10px",
  marginBottom: theme.spacing(1.5),
  boxShadow: "0 2px 6px rgba(0, 0, 0, 0.05)",
  border: "1px solid #e0e0e0", // Borde sutil para mejorar la separación
  transition: "transform 0.2s ease, box-shadow 0.2s ease",
  "&:hover": {
    transform: "translateY(-2px)",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
  },
  padding: theme.spacing(0.5),
}));

const MisCitas = () => {
  const [citas, setCitas] = useState([]);
  const [pagina, setPagina] = useState(1);
  const [loading, setLoading] = useState(true);
  const [alerta, setAlerta] = useState({ open: false, message: "", severity: "success" });
  const elementosPorPagina = 5;
  const [usuarioId, setUsuarioId] = useState(null);
  const navigate = useNavigate();

  // Get authenticated user
  useEffect(() => {
    const obtenerUsuario = async () => {
      try {
        const usuario = await verificarAutenticacion();
        if (usuario) {
          setUsuarioId(usuario.id);
        } else {
          setAlerta({
            open: true,
            message: "No se pudo obtener la sesión. Por favor, inicia sesión nuevamente.",
            severity: "error",
          });
        }
      } catch (error) {
        setAlerta({
          open: true,
          message: "Error al verificar la autenticación. Intenta nuevamente.",
          severity: "error",
        });
      }
    };
    obtenerUsuario();
  }, []);

  // Fetch appointments when usuarioId is available
  useEffect(() => {
    if (!usuarioId) return;
    const obtenerCitas = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`http://localhost:4000/api/citas/usuario/${usuarioId}`, {
          withCredentials: true,
        });
        setCitas(response.data);
      } catch (error) {
        console.error("Error al obtener citas:", error);
        setAlerta({
          open: true,
          message: "Error al cargar las citas. Por favor, intenta nuevamente.",
          severity: "error",
        });
      } finally {
        setLoading(false);
      }
    };
    obtenerCitas();
  }, [usuarioId]);

  const handleChangePagina = (event, value) => {
    setPagina(value);
  };

  const citasPaginadas = useMemo(
    () => citas.slice((pagina - 1) * elementosPorPagina, pagina * elementosPorPagina),
    [citas, pagina]
  );

  const obtenerHoraExacta = useMemo(
    () => (fechaUTC) => {
      return fechaUTC
        ? dayjs.utc(fechaUTC).tz("America/Mexico_City").format("D [de] MMMM [de] YYYY [a las] hh:mm A")
        : "Fecha no registrada";
    },
    []
  );

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleScheduleNewAppointment = () => {
    navigate("/agendar-cita"); // Ajusta esta ruta según tu aplicación
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        width: "100vw",
        padding: { xs: "1rem", md: "1.5rem" },
        fontFamily: "'Roboto', sans-serif",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        background: "linear-gradient(135deg, #f5f7fa 0%, #e6f7ff 100%)", // Fondo más suave
      }}
    >
      {/* Back Button */}
      <IconButton
        onClick={handleGoBack}
        sx={{
          position: "absolute",
          top: "16px",
          left: "16px",
          color: "#0288d1",
          "&:hover": { color: "#01579b" },
        }}
        aria-label="Volver atrás"
      >
        <ArrowBack fontSize="medium" />
      </IconButton>

      {/* Header */}
      <HeaderBox>
        <CalendarToday sx={{ fontSize: { xs: 24, md: 28 } }} />
        <Typography
          variant="h5"
          sx={{
            fontWeight: 600,
            fontSize: { xs: "1.25rem", md: "1.5rem" }, // Tamaño de letra más discreto
            fontFamily: "'Roboto', sans-serif",
          }}
        >
          Mis Citas Agendadas
        </Typography>
      </HeaderBox>

      {/* Main Content */}
      <Box
        sx={{
          width: "100%",
          maxWidth: "1200px", // Aumentado para hacer el formulario más largo en los lados
          backgroundColor: "#ffffff",
          borderRadius: "0 0 12px 12px",
          padding: { xs: "1rem", md: "1.5rem" },
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)",
        }}
      >
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", padding: "1.5rem" }}>
            <CircularProgress sx={{ color: "#0288d1" }} size={30} />
          </Box>
        ) : citasPaginadas.length > 0 ? (
          citasPaginadas.map((cita, index) => (
            <AppointmentCard key={cita.id}>
              <CardContent
                sx={{
                  display: "flex",
                  flexDirection: { xs: "column", md: "row" },
                  alignItems: { xs: "flex-start", md: "center" },
                  justifyContent: "space-between",
                  padding: { xs: "0.75rem", md: "1rem" },
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: "12px", flexGrow: 1 }}>
                  <EventAvailable sx={{ color: "#0288d1", fontSize: { xs: 20, md: 24 } }} />
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography
                      variant="body1"
                      sx={{
                        fontWeight: 500,
                        fontSize: { xs: "0.9rem", md: "1rem" }, // Letras más pequeñas
                        color: "#333",
                      }}
                    >
                      {obtenerHoraExacta(cita.fecha_hora)}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{
                        color: "#666",
                        mt: 0.25,
                        fontSize: { xs: "0.75rem", md: "0.85rem" },
                      }}
                    >
                      Cita #{(pagina - 1) * elementosPorPagina + index + 1}
                    </Typography>
                  </Box>
                </Box>
                <Box
                  sx={{
                    display: "flex",
                    gap: "12px",
                    mt: { xs: 1, md: 0 },
                    alignItems: "center",
                    flexShrink: 0,
                  }}
                >
                  <Tooltip title="Estado de la Cita" arrow>
                    <Chip
                      label={cita.estado_cita}
                      color={cita.estado_cita === "Confirmada" ? "success" : "warning"}
                      size="small"
                      sx={{
                        fontWeight: 500,
                        fontSize: { xs: "0.65rem", md: "0.75rem" }, // Letras más pequeñas
                        padding: "2px",
                      }}
                    />
                  </Tooltip>
                  <Tooltip title="Estado de Pago" arrow>
                    <Chip
                      label={cita.estado_pago}
                      color={cita.estado_pago === "Pagado" ? "primary" : "error"}
                      size="small"
                      sx={{
                        fontWeight: 500,
                        fontSize: { xs: "0.65rem", md: "0.75rem" }, // Letras más pequeñas
                        padding: "2px",
                      }}
                    />
                  </Tooltip>
                </Box>
              </CardContent>
            </AppointmentCard>
          ))
        ) : (
          <Box sx={{ textAlign: "center", padding: "2rem" }}>
            <Typography
              variant="body1"
              sx={{
                color: "#666",
                fontSize: { xs: "0.9rem", md: "1rem" }, // Letras más pequeñas
                mb: 2,
              }}
            >
              No tienes citas registradas.
            </Typography>
            <Button
              variant="contained"
              onClick={handleScheduleNewAppointment}
              startIcon={<Add />}
              sx={{
                backgroundColor: "#0288d1",
                borderRadius: "8px",
                textTransform: "none",
                fontSize: { xs: "0.85rem", md: "0.9rem" }, // Letras más pequeñas
                fontFamily: "'Roboto', sans-serif",
                fontWeight: 500,
                padding: { xs: "8px 16px", md: "10px 20px" },
                "&:hover": {
                  backgroundColor: "#01579b",
                },
              }}
            >
              Agendar Nueva Cita
            </Button>
          </Box>
        )}

        {/* Pagination */}
        {citas.length > elementosPorPagina && (
          <Box sx={{ display: "flex", justifyContent: "center", mt: "1.5rem" }}>
            <Pagination
              count={Math.ceil(citas.length / elementosPorPagina)}
              page={pagina}
              onChange={handleChangePagina}
              color="primary"
              sx={{
                "& .MuiPaginationItem-root": {
                  fontFamily: "'Roboto', sans-serif",
                  fontSize: { xs: "0.75rem", md: "0.85rem" }, // Letras más pequeñas
                  "&:hover": { backgroundColor: "rgba(2, 136, 209, 0.1)" },
                },
              }}
            />
          </Box>
        )}
      </Box>

      {/* Snackbar for Alerts */}
      <Snackbar
        open={alerta.open}
        autoHideDuration={6000}
        onClose={() => setAlerta({ ...alerta, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setAlerta({ ...alerta, open: false })}
          severity={alerta.severity}
          sx={{
            width: "100%",
            fontFamily: "'Roboto', sans-serif",
            fontSize: { xs: "0.85rem", md: "0.9rem" }, // Letras más pequeñas
            borderRadius: "8px",
            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
          }}
        >
          {alerta.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default MisCitas;