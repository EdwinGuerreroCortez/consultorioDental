import React, { useEffect, useState } from "react";
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
import { CalendarToday, ArrowBack, EventAvailable } from "@mui/icons-material";
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
  padding: theme.spacing(3),
  borderRadius: "12px 12px 0 0",
  display: "flex",
  alignItems: "center",
  gap: "12px",
  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
  width: "100%",
  maxWidth: "1000px",
}));

const AppointmentCard = styled(Card)(({ theme }) => ({
  backgroundColor: "#ffffff",
  borderRadius: "12px",
  marginBottom: theme.spacing(2),
  boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)",
  transition: "transform 0.3s ease, box-shadow 0.3s ease",
  "&:hover": {
    transform: "translateY(-4px)",
    boxShadow: "0 6px 16px rgba(0, 0, 0, 0.1)",
  },
  padding: theme.spacing(1),
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
      const usuario = await verificarAutenticacion();
      if (usuario) {
        setUsuarioId(usuario.id);
      } else {
        setAlerta({ open: true, message: "No se pudo obtener la sesión. Inicia sesión nuevamente.", severity: "error" });
      }
    };
    obtenerUsuario();
  }, []);

  // Fetch appointments when usuarioId is available
  useEffect(() => {
    if (!usuarioId) return;
    const obtenerCitas = async () => {
      try {
        const response = await axios.get(`http://localhost:4000/api/citas/usuario/${usuarioId}`, { withCredentials: true });
        setCitas(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Error al obtener citas:", error);
        setAlerta({ open: true, message: "Error al cargar las citas.", severity: "error" });
        setLoading(false);
      }
    };
    obtenerCitas();
  }, [usuarioId]);

  const handleChangePagina = (event, value) => {
    setPagina(value);
  };

  const citasPaginadas = citas.slice((pagina - 1) * elementosPorPagina, pagina * elementosPorPagina);
  const obtenerHoraExacta = (fechaUTC) => {
    return dayjs.utc(fechaUTC).tz("UTC").format("D [de] MMMM [de] YYYY [a las] hh:mm A");
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        width: "100vw",
        padding: { xs: "1rem", md: "2rem" },
        fontFamily: "'Roboto', sans-serif",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      {/* Back Button */}
      <IconButton
        onClick={handleGoBack}
        sx={{
          position: "absolute",
          top: "20px",
          left: "20px",
          color: "#0288d1",
          "&:hover": { color: "#01579b" },
        }}
      >
        <ArrowBack />
      </IconButton>

      {/* Header */}
      <HeaderBox>
        <CalendarToday sx={{ fontSize: { xs: 30, md: 40 } }} />
        <Typography
          variant="h4"
          sx={{
            fontWeight: 600,
            fontSize: { xs: "1.5rem", md: "2.25rem" },
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
          maxWidth: "1000px",
          backgroundColor: "#ffffff",
          borderRadius: "0 0 12px 12px",
          padding: { xs: "1rem", md: "2rem" },
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)",
        }}
      >
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", padding: "2rem" }}>
            <CircularProgress sx={{ color: "#0288d1" }} />
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
                  padding: "1rem",
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <EventAvailable sx={{ color: "#0288d1", fontSize: { xs: 24, md: 30 } }} />
                  <Box>
                    <Typography
                      variant="h6"
                      sx={{ fontWeight: 500, fontSize: { xs: "1rem", md: "1.25rem" }, color: "#333" }}
                    >
                      {cita.fecha_hora ? obtenerHoraExacta(cita.fecha_hora) : "Fecha no registrada"}
                    </Typography>
                    <Typography variant="body2" sx={{ color: "#666", mt: 0.5 }}>
                      Cita #{(pagina - 1) * elementosPorPagina + index + 1}
                    </Typography>
                  </Box>
                </Box>
                <Box sx={{ display: "flex", gap: "12px", mt: { xs: 2, md: 0 } }}>
                  <Tooltip title="Estado de la Cita" arrow>
                    <Chip
                      label={cita.estado_cita}
                      color={cita.estado_cita === "Confirmada" ? "success" : "warning"}
                      size="small"
                      sx={{ fontWeight: 500, fontSize: "0.75rem", padding: "4px" }}
                    />
                  </Tooltip>
                  <Tooltip title="Estado de Pago" arrow>
                    <Chip
                      label={cita.estado_pago}
                      color={cita.estado_pago === "Pagado" ? "primary" : "error"}
                      size="small"
                      sx={{ fontWeight: 500, fontSize: "0.75rem", padding: "4px" }}
                    />
                  </Tooltip>
                </Box>
              </CardContent>
            </AppointmentCard>
          ))
        ) : (
          <Typography
            variant="body1"
            sx={{ textAlign: "center", color: "#666", padding: "2rem", fontSize: { xs: "1rem", md: "1.25rem" } }}
          >
            No tienes citas registradas.
          </Typography>
        )}

        {/* Pagination */}
        {citas.length > elementosPorPagina && (
          <Box sx={{ display: "flex", justifyContent: "center", mt: "2rem" }}>
            <Pagination
              count={Math.ceil(citas.length / elementosPorPagina)}
              page={pagina}
              onChange={handleChangePagina}
              color="primary"
              sx={{
                "& .MuiPaginationItem-root": {
                  fontFamily: "'Roboto', sans-serif",
                  "&:hover": { backgroundColor: "rgba(2, 136, 209, 0.1)" },
                },
              }}
            />
          </Box>
        )}
      </Box>

      {/* Snackbar for Alerts */}
      <Snackbar open={alerta.open} autoHideDuration={6000} onClose={() => setAlerta({ ...alerta, open: false })}>
        <Alert
          onClose={() => setAlerta({ ...alerta, open: false })}
          severity={alerta.severity}
          sx={{ width: "100%", fontFamily: "'Roboto', sans-serif" }}
        >
          {alerta.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default MisCitas;