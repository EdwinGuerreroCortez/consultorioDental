import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CircularProgress,
  Avatar,
  Chip,
  Alert,
  TextField,
  InputAdornment,
  Pagination,
} from "@mui/material";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import MonetizationOnIcon from "@mui/icons-material/MonetizationOn";
import AssignmentTurnedInIcon from "@mui/icons-material/AssignmentTurnedIn";
import SearchIcon from "@mui/icons-material/Search";
import { motion } from "framer-motion";

// Paleta de colores
const primaryColor = "#006d77";
const secondaryColor = "#78c1c8";
const accentColor = "#e0f7fa";
const textColor = "#03445e";
const bgGradient = "linear-gradient(90deg, #006d77 0%, #78c1c8 100%)";

const agruparPorMes = (pagos) => {
  const agrupados = {};

  pagos.forEach((pago) => {
    const fecha = new Date(pago.fecha_pago || pago.fecha_cita);
    const clave = format(fecha, "MMMM yyyy", { locale: es });
    const claveCapitalizada = clave.charAt(0).toUpperCase() + clave.slice(1);

    if (!agrupados[claveCapitalizada]) agrupados[claveCapitalizada] = [];
    agrupados[claveCapitalizada].push(pago);
  });

  return Object.entries(agrupados)
    .map(([mes, pagos]) => {
      const fechaReferencia = new Date(pagos[0].fecha_pago || pagos[0].fecha_cita);
      return { mes, fechaReferencia, pagos };
    })
    .sort((a, b) => b.fechaReferencia - a.fechaReferencia)
    .map(({ mes, pagos }) => ({ mes, pagos }));
};

const HistorialPagosDiseño = () => {
  const [pagos, setPagos] = useState([]);
  const [filteredPagos, setFilteredPagos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pageLoading, setPageLoading] = useState(false);
  const [alerta, setAlerta] = useState({ mostrar: false, mensaje: "", tipo: "" });
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const rowsPerPage = 10;

  useEffect(() => {
    const obtenerPagos = async () => {
      setLoading(true);
      try {
        const res = await axios.get("http://localhost:4000/api/pagos/historial", {
          params: { page: 1, limit: rowsPerPage },
        });

        let data = [];
        let total = 0;

        if (Array.isArray(res.data)) {
          data = res.data;
          total = res.data.length;
        } else if (res.data && Array.isArray(res.data.data)) {
          data = res.data.data;
          total = res.data.total || data.length;
        } else {
          throw new Error("Formato de respuesta del backend no válido");
        }

        setPagos(data);
        setFilteredPagos(data);
        setTotalPages(Math.ceil(total / rowsPerPage));
      } catch (error) {
        console.error("Error al obtener historial de pagos:", error);
        const errorMessage =
          error.response?.data?.error || error.message || "Error desconocido al cargar los pagos";
        setAlerta({
          mostrar: true,
          mensaje: `Error al cargar el historial de pagos: ${errorMessage}`,
          tipo: "error",
        });
        setPagos([]);
        setFilteredPagos([]);
        setTotalPages(1);
      } finally {
        setLoading(false);
      }
    };
    obtenerPagos();
  }, []);

  useEffect(() => {
    if (alerta.mostrar) {
      const timer = setTimeout(() => {
        setAlerta({ mostrar: false, mensaje: "", tipo: "" });
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [alerta.mostrar]);

  useEffect(() => {
    const updatedPagos = Array.isArray(pagos)
      ? pagos.filter((pago) =>
          pago.nombre_paciente?.toLowerCase().includes(searchTerm.toLowerCase())
        )
      : [];
    setFilteredPagos(updatedPagos);
    setTotalPages(Math.ceil(updatedPagos.length / rowsPerPage));
    setCurrentPage(1);
  }, [searchTerm, pagos]);

  const handlePageChange = (event, newPage) => {
    setCurrentPage(newPage);
  };

  const paginatedPagos = filteredPagos.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

const formatUTCDate = (dateString) => {
  if (!dateString) return "Sin registrar";
  try {
    // Intentar parsear como ISO 8601 (ej. 2025-07-24T14:30:00)
    const date = parseISO(dateString);
    if (!isNaN(date.getTime())) {
      return format(date, "dd 'de' MMMM yyyy, hh:mm a", { locale: es });
    }
    // Respaldo para otros formatos (ej. DD/MM/YYYY HH:mm:ss)
    const dateLocal = new Date(dateString);
    if (!isNaN(dateLocal.getTime())) {
      return format(dateLocal, "dd 'de' MMMM yyyy, hh:mm a", { locale: es });
    }
    throw new Error("Formato de fecha no reconocido");
  } catch (error) {
    console.error("Error al parsear la fecha:", dateString, error);
    return "Formato de fecha inválido";
  }
};

  const inputStyle = {
    "& .MuiOutlinedInput-root": {
      borderRadius: "8px",
      backgroundColor: "#fff",
      fontFamily: "'Poppins', sans-serif",
      height: "48px",
      transition: "all 0.3s ease-in-out",
      "&:hover fieldset": { borderColor: secondaryColor },
      "&.Mui-focused fieldset": { borderColor: primaryColor, borderWidth: "2px" },
    },
    "& .MuiInputLabel-root": {
      fontFamily: "'Poppins', sans-serif",
      color: textColor,
      fontSize: "0.9rem",
      "&.Mui-focused": { color: primaryColor },
    },
    "& .MuiInputBase-input": {
      fontFamily: "'Poppins', sans-serif",
      color: textColor,
      fontSize: "0.9rem",
    },
  };

  return (
    <Box
      sx={{
        p: 3,
        fontFamily: "'Poppins', sans-serif",
        backgroundColor: "#f9fbfd",
        minHeight: "100vh",
        maxWidth: "1400px",
        mx: "auto",
      }}
    >
      <Typography
        variant="h4"
        sx={{
          mb: 4,
          fontWeight: "bold",
          color: primaryColor,
          textAlign: "center",
          fontFamily: "'Poppins', sans-serif",
          textShadow: "0 2px 4px rgba(0, 109, 119, 0.1)",
        }}
      >
        Historial de Pagos
      </Typography>

      <Box
        sx={{
          display: "flex",
          justifyContent: "flex-start",
          alignItems: "center",
          mb: 4,
          flexWrap: "wrap",
          gap: 2,
        }}
      >
        <TextField
          label="Buscar por nombre del paciente"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          variant="outlined"
          sx={{ ...inputStyle, width: { xs: "100%", sm: "300px" } }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: primaryColor }} />
              </InputAdornment>
            ),
          }}
        />
      </Box>

      {loading ? (
        <Box textAlign="center" mt={10}>
          <CircularProgress sx={{ color: primaryColor }} />
          <Typography sx={{ mt: 2, color: textColor, fontFamily: "'Poppins', sans-serif" }}>
            Cargando historial de pagos...
          </Typography>
        </Box>
      ) : !Array.isArray(paginatedPagos) || paginatedPagos.length === 0 ? (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "70vh",
            backgroundColor: "#ffffff",
            borderRadius: "16px",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)",
            border: `1px solid ${secondaryColor}`,
          }}
        >
          <Typography
            variant="h5"
            sx={{
              fontFamily: "'Poppins', sans-serif",
              color: textColor,
              fontWeight: 500,
              textAlign: "center",
            }}
          >
            No hay pagos registrados.
          </Typography>
        </Box>
      ) : (
        <>
          {agruparPorMes(paginatedPagos).map(({ mes, pagos }, indexMes) => (
            <Box key={mes} sx={{ mb: 5 }}>
              <Typography
                variant="h6"
                sx={{
                  mb: 2,
                  color: primaryColor,
                  fontWeight: "bold",
                  textAlign: "center",
                  textTransform: "uppercase",
                  background: bgGradient,
                  borderRadius: "12px",
                  py: 1.5,
                  boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)",
                }}
              >
                {mes}
              </Typography>
              <Grid container spacing={3}>
                {pagos.map((pago, index) => (
                  <Grid item xs={12} sm={6} md={4} key={pago.pago_id}>
                    <motion.div
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, ease: "easeOut", delay: index * 0.1 }}
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Card
                        sx={{
                          borderRadius: 12,
                          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
                          border: `1px solid ${accentColor}`,
                          background: "#ffffff",
                          transition: "all 0.3s ease",
                          "&:hover": {
                            boxShadow: "0 6px 16px rgba(0, 109, 119, 0.2)",
                            transform: "translateY(-4px)",
                          },
                        }}
                      >
                        <CardContent sx={{ p: 3 }}>
                          <Box display="flex" alignItems="center" gap={2} mb={2}>
                            <Avatar
                              sx={{
                                bgcolor: accentColor,
                                width: 40,
                                height: 40,
                                boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
                              }}
                            >
                              <AssignmentTurnedInIcon sx={{ color: primaryColor, fontSize: 24 }} />
                            </Avatar>
                            <Box>
                              <Typography
                                variant="subtitle1"
                                sx={{
                                  fontWeight: "bold",
                                  color: primaryColor,
                                  textTransform: "capitalize",
                                  fontFamily: "'Poppins', sans-serif",
                                }}
                              >
                                {pago.nombre_paciente || "Sin nombre"}
                              </Typography>
                              <Typography
                                variant="body2"
                                sx={{ color: "#78909c", fontStyle: "italic", fontFamily: "'Poppins', sans-serif" }}
                              >
                                {pago.nombre_tratamiento || "Sin tratamiento"}
                              </Typography>
                            </Box>
                          </Box>
                          <Box mb={2}>
                            <Typography
                              variant="body2"
                              sx={{ color: "#555", fontWeight: 500, fontFamily: "'Poppins', sans-serif" }}
                            >
                              Fecha de pago:
                            </Typography>
                            <Typography
                              variant="body1"
                              sx={{ fontWeight: "medium", color: textColor, fontFamily: "'Poppins', sans-serif" }}
                            >
                              {formatUTCDate(pago.fecha_pago)}
                            </Typography>
                          </Box>
                          <Box mb={2}>
                            <Typography
                              variant="body2"
                              sx={{ color: "#555", fontWeight: 500, fontFamily: "'Poppins', sans-serif" }}
                            >
                              Fecha de cita:
                            </Typography>
                            <Typography
                              variant="body1"
                              sx={{ fontWeight: "medium", color: textColor, fontFamily: "'Poppins', sans-serif" }}
                            >
                              {formatUTCDate(pago.fecha_cita)}
                            </Typography>
                          </Box>
                          <Box mb={2} display="flex" alignItems="center" gap={1}>
                            <MonetizationOnIcon sx={{ color: "#007b5f", fontSize: 20 }} />
                            <Typography
                              variant="body1"
                              sx={{ fontWeight: "bold", color: "#007b5f", fontFamily: "'Poppins', sans-serif" }}
                            >
                              ${pago.monto ? parseFloat(pago.monto).toFixed(2) : "0.00"}
                            </Typography>
                          </Box>
                          <Chip
                            label={pago.estado || "Desconocido"}
                            size="small"
                            sx={{
                              mt: 1,
                              backgroundColor: pago.estado === "pagado" ? "#e8f5e9" : "#ffebee",
                              color: pago.estado === "pagado" ? "#4caf50" : "#f44336",
                              fontWeight: "bold",
                              borderRadius: "8px",
                              px: 1,
                              boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
                              fontFamily: "'Poppins', sans-serif",
                            }}
                          />
                          {pago.metodo && (
                            <Typography
                              variant="body2"
                              sx={{ mt: 1, color: "#555", fontWeight: 500, fontFamily: "'Poppins', sans-serif" }}
                            >
                              Método: {pago.metodo}
                            </Typography>
                          )}
                        </CardContent>
                      </Card>
                    </motion.div>
                  </Grid>
                ))}
              </Grid>
            </Box>
          ))}
          <Box sx={{ mt: 4, display: "flex", justifyContent: "center" }}>
            <Pagination
              count={totalPages}
              page={currentPage}
              onChange={handlePageChange}
              sx={{
                "& .MuiPaginationItem-root": {
                  fontFamily: "'Poppins', sans-serif",
                  color: textColor,
                  "&:hover": { backgroundColor: accentColor },
                },
                "& .Mui-selected": {
                  backgroundColor: primaryColor,
                  color: "#e0f7fa",
                  "&:hover": { backgroundColor: secondaryColor },
                },
                "& .MuiPaginationItem-ellipsis": {
                  color: textColor,
                },
              }}
            />
          </Box>
        </>
      )}

      {alerta.mostrar && (
        <Box
          sx={{
            position: "fixed",
            bottom: 20,
            left: 20,
            zIndex: 2000,
            width: "auto",
            maxWidth: "400px",
          }}
        >
          <Alert
            severity={alerta.tipo}
            variant="filled"
            sx={{
              width: "100%",
              backgroundColor:
                alerta.tipo === "success"
                  ? "#e8f5e9"
                  : alerta.tipo === "error"
                  ? "#ffebee"
                  : "#fff3e0",
              color:
                alerta.tipo === "success"
                  ? "#4caf50"
                  : alerta.tipo === "error"
                  ? "#f44336"
                  : "#ff9800",
              fontFamily: "'Poppins', sans-serif",
              borderRadius: "8px",
            }}
            onClose={() => setAlerta({ mostrar: false, mensaje: "", tipo: "" })}
          >
            {alerta.mensaje}
          </Alert>
        </Box>
      )}
    </Box>
  );
};

export default HistorialPagosDiseño;