import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { verificarAutenticacion } from "../../utils/auth";
import {
  Box,
  Typography,
  Card,
  CardContent,
  CircularProgress,
  Snackbar,
  Alert,
  Pagination,
  Chip,
  IconButton,
  Tooltip,
  Button,
} from "@mui/material";
import { ArrowBack, Payments } from "@mui/icons-material";
import PaymentIcon from '@mui/icons-material/Payment';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import { styled } from "@mui/system";
import { useNavigate } from "react-router-dom";

// Estilos
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
  maxWidth: "1200px",
}));

const PagoCard = styled(Card)(({ theme }) => ({
  backgroundColor: "#ffffff",
  borderRadius: "10px",
  marginBottom: theme.spacing(1.5),
  boxShadow: "0 2px 6px rgba(0, 0, 0, 0.05)",
  border: "1px solid #e0e0e0",
  transition: "transform 0.2s ease, box-shadow 0.2s ease",
  "&:hover": {
    transform: "translateY(-2px)",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
  },
  padding: theme.spacing(0.5),
}));

const PagosPendientes = () => {
  const [pagos, setPagos] = useState([]);
  const [pagina, setPagina] = useState(1);
  const [loading, setLoading] = useState(true);
  const [alerta, setAlerta] = useState({ open: false, message: "", severity: "success" });
  const elementosPorPagina = 5;
  const [usuarioId, setUsuarioId] = useState(null);
  const [csrfToken, setCsrfToken] = useState(null);
  const navigate = useNavigate();

  // Obtener token CSRF
  useEffect(() => {
    const obtenerCsrf = async () => {
      try {
        const res = await fetch("http://localhost:4000/api/get-csrf-token", {
          credentials: "include",
        });
        const data = await res.json();
        setCsrfToken(data.csrfToken);
      } catch (error) {
        console.error("Error al obtener CSRF token:", error);
        setAlerta({
          open: true,
          message: "Error al obtener el token CSRF.",
          severity: "error",
        });
      }
    };
    obtenerCsrf();
  }, []);

  // Obtener usuario autenticado
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

  // Obtener pagos pendientes del usuario
  useEffect(() => {
    if (!usuarioId) return;
    const obtenerPagos = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`http://localhost:4000/api/pagos/pendientes/${usuarioId}`, {
          withCredentials: true,
        });
        setPagos(response.data);
      } catch (error) {
        console.error("Error al obtener pagos:", error);
        setAlerta({
          open: true,
          message: "Error al cargar los pagos. Intenta nuevamente.",
          severity: "error",
        });
      } finally {
        setLoading(false);
      }
    };
    obtenerPagos();
  }, [usuarioId]);

  const pagosPaginados = useMemo(
    () => pagos.slice((pagina - 1) * elementosPorPagina, pagina * elementosPorPagina),
    [pagos, pagina]
  );

  const handleChangePagina = (event, value) => {
    setPagina(value);
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  const handlePagarTodos = async () => {
    try {
      const pagosIds = pagosPaginados.map(p => p.id);

      if (!csrfToken || pagosIds.length === 0) {
        return setAlerta({
          open: true,
          message: "No hay pagos en esta página o token inválido.",
          severity: "warning",
        });
      }

      const response = await axios.post("http://localhost:4000/api/pagos/pagar-por-ids", {
        pagosIds
      }, {
        withCredentials: true,
        headers: {
          "X-XSRF-TOKEN": csrfToken
        }
      });

      setAlerta({
        open: true,
        message: response.data.mensaje,
        severity: "success",
      });

      const pagosRestantes = pagos.filter(p => !pagosIds.includes(p.id));
      setPagos(pagosRestantes);
    } catch (error) {
      console.error("Error al pagar todos:", error);
      setAlerta({
        open: true,
        message: "No se pudo procesar el pago.",
        severity: "error",
      });
    }
  };

  const handlePagarUno = async () => {
    try {
      if (!csrfToken || pagosPaginados.length === 0) {
        return setAlerta({
          open: true,
          message: "No hay pagos para procesar o token inválido.",
          severity: "warning",
        });
      }

      const primerPagoId = pagosPaginados[0].id;

      const response = await axios.post("http://localhost:4000/api/pagos/pagar-por-ids", {
        pagosIds: [primerPagoId]
      }, {
        withCredentials: true,
        headers: {
          "X-XSRF-TOKEN": csrfToken
        }
      });

      setAlerta({
        open: true,
        message: response.data.mensaje,
        severity: "success",
      });

      const pagosRestantes = pagos.filter(p => p.id !== primerPagoId);
      setPagos(pagosRestantes);
    } catch (error) {
      console.error("Error al pagar uno:", error);
      setAlerta({
        open: true,
        message: "No se pudo pagar la cita actual.",
        severity: "error",
      });
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        width: "100vw",
        padding: { xs: "1rem", md: "1.5rem" },
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        background: "linear-gradient(135deg, #f5f7fa 0%, #e6f7ff 100%)",
      }}
    >
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

      <HeaderBox>
        <Payments sx={{ fontSize: { xs: 24, md: 28 } }} />
        <Typography variant="h5" sx={{ fontWeight: 600, fontSize: { xs: "1.25rem", md: "1.5rem" } }}>
          Pagos Pendientes
        </Typography>
      </HeaderBox>

      <Box
        sx={{
          width: "100%",
          maxWidth: "1200px",
          backgroundColor: "#ffffff",
          borderRadius: "0 0 12px 12px",
          padding: { xs: "1rem", md: "1.5rem" },
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)",
        }}
      >
        {/* Botones de acción */}
        <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2, mb: 2 }}>
          <Button
            variant="contained"
            color="primary"
            startIcon={<ReceiptLongIcon />}
            sx={{ textTransform: "none" }}
            onClick={handlePagarTodos}
          >
            Pagar todo el tratamiento
          </Button>
          <Button
            variant="outlined"
            color="primary"
            startIcon={<PaymentIcon />}
            sx={{ textTransform: "none" }}
            onClick={handlePagarUno}
          >
            Pagar cita actual
          </Button>
        </Box>

        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", padding: "1.5rem" }}>
            <CircularProgress sx={{ color: "#0288d1" }} size={30} />
          </Box>
        ) : pagosPaginados.length > 0 ? (
          pagosPaginados.map((pago, index) => (
            <PagoCard key={pago.id}>
              <CardContent
                sx={{
                  display: "flex",
                  flexDirection: { xs: "column", md: "row" },
                  alignItems: { xs: "flex-start", md: "center" },
                  justifyContent: "space-between",
                  padding: { xs: "0.75rem", md: "1rem" },
                }}
              >
                <Box>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    Pago #{(pagina - 1) * elementosPorPagina + index + 1}
                  </Typography>
                  <Typography variant="body2" sx={{ color: "#444" }}>
                    Monto: ${pago.monto}
                  </Typography>
                  <Typography variant="caption" sx={{ color: "#666", display: "block" }}>
                    Fecha: {pago.fecha_hora || "Sin fecha"}
                  </Typography>
                </Box>
                <Box sx={{ display: "flex", gap: "12px", mt: { xs: 1, md: 0 } }}>
                  <Tooltip title="Estado del Pago" arrow>
                    <Chip
                      label={pago.estado}
                      color={pago.estado === "pagado" ? "primary" : "error"}
                      size="small"
                      sx={{ fontWeight: 500 }}
                    />
                  </Tooltip>
                  <Tooltip title="Método" arrow>
                    <Chip
                      label={pago.metodo || "Sin definir"}
                      size="small"
                      sx={{ fontWeight: 500 }}
                    />
                  </Tooltip>
                </Box>
              </CardContent>
            </PagoCard>
          ))
        ) : (
          <Box sx={{ textAlign: "center", padding: "2rem" }}>
            <Typography variant="body1" sx={{ color: "#666", mb: 2 }}>
              No hay pagos pendientes.
            </Typography>
          </Box>
        )}

        {/* Paginación */}
        {pagos.length > elementosPorPagina && (
          <Box sx={{ display: "flex", justifyContent: "center", mt: "1.5rem" }}>
            <Pagination
              count={Math.ceil(pagos.length / elementosPorPagina)}
              page={pagina}
              onChange={handleChangePagina}
              color="primary"
            />
          </Box>
        )}
      </Box>

      {/* Snackbar de alerta */}
      <Snackbar
        open={alerta.open}
        autoHideDuration={6000}
        onClose={() => setAlerta({ ...alerta, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert onClose={() => setAlerta({ ...alerta, open: false })} severity={alerta.severity} sx={{ width: "100%" }}>
          {alerta.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default PagosPendientes;
