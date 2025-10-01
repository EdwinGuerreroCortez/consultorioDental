import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import {
  Box,
  Typography,
  Card,
  CardContent,
  CircularProgress,
  Snackbar,
  Alert,
  IconButton,
  Chip,
  Tooltip,
} from "@mui/material";
import { ArrowBack, History, CalendarToday, AttachMoney, Payment } from "@mui/icons-material";
import { styled } from "@mui/system";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { verificarAutenticacion } from "../../utils/auth";

// Estilos BBVA
const HeaderBox = styled(Box)(({ theme }) => ({
  backgroundColor: "#0288d1",
  color: "#ffffff",
  padding: theme.spacing(2),
  borderRadius: "16px 16px 0 0",
  display: "flex",
  alignItems: "center",
  gap: "12px",
  width: "100%",
  maxWidth: "1200px",
}));

const PagoCard = styled(Card)(({ theme }) => ({
  borderRadius: "16px",
  backgroundColor: "#fefefe",
  padding: theme.spacing(2),
  marginBottom: theme.spacing(2),
  boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.06)",
  transition: "all 0.2s ease",
  "&:hover": {
    transform: "translateY(-2px)",
    boxShadow: "0px 6px 24px rgba(0, 0, 0, 0.1)",
  },
}));

const HistorialPagosPaciente = () => {
  const [pagos, setPagos] = useState([]);
  const [usuarioId, setUsuarioId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [alerta, setAlerta] = useState({ open: false, message: "", severity: "success" });
  const navigate = useNavigate();

  useEffect(() => {
    const obtenerUsuario = async () => {
      try {
        const usuario = await verificarAutenticacion();
        if (usuario) {
          setUsuarioId(usuario.id);
        } else {
          throw new Error("Sesión no válida");
        }
      } catch (error) {
        setAlerta({
          open: true,
          message: "Sesión expirada. Inicia sesión nuevamente.",
          severity: "error",
        });
      }
    };
    obtenerUsuario();
  }, []);

  useEffect(() => {
    if (!usuarioId) return;
    const obtenerPagos = async () => {
      try {
        const { data } = await axios.get(`http://localhost:4000/api/pagos/historial/${usuarioId}`);
        setPagos(data);
      } catch (error) {
        setAlerta({
          open: true,
          message: "Error al cargar historial de pagos.",
          severity: "error",
        });
      } finally {
        setLoading(false);
      }
    };
    obtenerPagos();
  }, [usuarioId]);

  const pagosAgrupados = useMemo(() => {
    const agrupados = {};
    pagos.forEach((pago) => {
      const clave = format(new Date(pago.fecha_pago), "MMMM yyyy", { locale: es });
      const mes = clave.charAt(0).toUpperCase() + clave.slice(1);
      if (!agrupados[mes]) agrupados[mes] = [];
      agrupados[mes].push(pago);
    });

    return Object.entries(agrupados).sort(
      ([, a], [, b]) => new Date(b[0].fecha_pago) - new Date(a[0].fecha_pago)
    );
  }, [pagos]);

  const handleGoBack = () => navigate(-1);

  return (
    <Box
      sx={{
        minHeight: "100vh",
        width: "100vw",
        padding: { xs: "1rem", md: "1.5rem" },
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        background: "#f4faff",
        fontFamily: "'Roboto', sans-serif",
      }}
    >
      <IconButton
        onClick={handleGoBack}
        sx={{
          position: "absolute",
          top: "16px",
          left: "16px",
          color: "#0288d1",
        }}
      >
        <ArrowBack fontSize="medium" />
      </IconButton>

      <HeaderBox>
        <History sx={{ fontSize: 28 }} />
        <Typography variant="h5" sx={{ fontWeight: 600 }}>
          Historial de Pagos
        </Typography>
      </HeaderBox>

      <Box
        sx={{
          width: "100%",
          maxWidth: "1200px",
          backgroundColor: "#ffffff",
          borderRadius: "0 0 16px 16px",
          padding: { xs: "1rem", md: "1.5rem" },
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)",
        }}
      >
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
            <CircularProgress sx={{ color: "#0288d1" }} />
          </Box>
        ) : pagos.length === 0 ? (
          <Typography align="center" sx={{ py: 4, color: "#777" }}>
            No hay pagos registrados aún.
          </Typography>
        ) : (
          pagosAgrupados.map(([mes, lista]) => (
            <Box key={mes} sx={{ mb: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, color: "#0288d1", mb: 2 }}>
                {mes}
              </Typography>
              {lista.map((pago) => (
                <PagoCard key={pago.pago_id}>
                  <CardContent sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                    <Box sx={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap" }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600, color: "#333" }}>
                        {pago.nombre_tratamiento}
                      </Typography>
                      <Chip
                        icon={<Payment sx={{ fontSize: 18 }} />}
                        label={pago.metodo || "Sin método"}
                        size="small"
                        sx={{ backgroundColor: "#e3f2fd", fontWeight: 500 }}
                      />
                    </Box>

                    <Typography variant="body2" sx={{ color: "#555" }}>
                      {pago.fecha_cita
                        ? `Cita: ${format(new Date(pago.fecha_cita), "dd/MM/yyyy HH:mm", { locale: es })}`
                        : "Cita sin fecha programada"}
                    </Typography>

                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 1 }}>
                      <Chip
                        icon={<AttachMoney />}
                        label={`$${pago.monto}`}
                        color="primary"
                        size="small"
                        sx={{ fontWeight: "bold" }}
                      />
                      <Chip
                        icon={<CalendarToday />}
                        label={format(new Date(pago.fecha_pago), "dd/MM/yyyy", { locale: es })}
                        size="small"
                        variant="outlined"
                      />
                      <Chip
                        label={pago.estado}
                        color="success"
                        size="small"
                        sx={{ fontWeight: 500 }}
                      />
                    </Box>
                  </CardContent>
                </PagoCard>
              ))}
            </Box>
          ))
        )}
      </Box>

      <Snackbar
        open={alerta.open}
        autoHideDuration={5000}
        onClose={() => setAlerta({ ...alerta, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity={alerta.severity} onClose={() => setAlerta({ ...alerta, open: false })}>
          {alerta.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default HistorialPagosPaciente;
