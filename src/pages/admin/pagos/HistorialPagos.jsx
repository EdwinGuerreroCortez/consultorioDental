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
} from "@mui/material";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import MonetizationOnIcon from "@mui/icons-material/MonetizationOn";
import AssignmentTurnedInIcon from "@mui/icons-material/AssignmentTurnedIn";
import SearchIcon from "@mui/icons-material/Search";
import { motion } from "framer-motion";

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
  const [alerta, setAlerta] = useState({ mostrar: false, mensaje: "", tipo: "" });
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const obtenerPagos = async () => {
      try {
        const res = await axios.get("https://backenddent.onrender.com/api/pagos/historial");
        setPagos(res.data);
        setFilteredPagos(res.data);
      } catch (error) {
        console.error("Error al obtener historial de pagos:", error);
        setAlerta({
          mostrar: true,
          mensaje: "Error al cargar el historial de pagos",
          tipo: "error",
        });
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

  // Filtrar pagos por nombre de paciente
  useEffect(() => {
    const updatedPagos = pagos.filter((pago) =>
      pago.nombre_paciente.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredPagos(updatedPagos);
  }, [searchTerm, pagos]);

  const pagosAgrupados = agruparPorMes(filteredPagos);

  const inputStyle = {
    "& .MuiOutlinedInput-root": {
      borderRadius: "12px",
      backgroundColor: "#fff",
      fontFamily: "'Poppins', sans-serif",
      height: "48px",
      transition: "all 0.3s ease-in-out",
      "&:hover fieldset": { borderColor: "#78c1c8" },
      "&.Mui-focused fieldset": { borderColor: "#006d77", borderWidth: "2px" },
    },
    "& .MuiInputLabel-root": {
      fontFamily: "'Poppins', sans-serif",
      color: "#03445e",
      "&.Mui-focused": { color: "#006d77" },
    },
  };

  // Función para formatear la fecha manteniendo la hora exacta del endpoint (UTC)
  const formatUTCDate = (dateString) => {
    if (!dateString) return "Sin registrar";
    const date = new Date(dateString);
    // Extraer componentes manualmente para evitar conversión de zona horaria
    const year = date.getUTCFullYear();
    const month = date.getUTCMonth();
    const day = date.getUTCDate();
    const hours = date.getUTCHours();
    const minutes = date.getUTCMinutes();
    // Crear una nueva fecha con los componentes UTC
    const utcDate = new Date(Date.UTC(year, month, day, hours, minutes));
    return format(utcDate, "dd 'de' MMMM yyyy, hh:mm a", { locale: es });
  };

  return (
    <Box sx={{ p: 3, fontFamily: "'Poppins', sans-serif", backgroundColor: "#fafafa" }}>
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
                <SearchIcon sx={{ color: "#006d77" }} />
              </InputAdornment>
            ),
          }}
        />
      </Box>

      {loading ? (
        <Box textAlign="center" mt={10}>
          <CircularProgress sx={{ color: "#006d77" }} />
        </Box>
      ) : pagosAgrupados.length === 0 ? (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "70vh",
            backgroundColor: "#ffffff",
            borderRadius: "16px",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)",
            border: "1px solid #78c1c8",
          }}
        >
          <Typography
            variant="h5"
            sx={{
              fontFamily: "'Poppins', sans-serif",
              color: "#03445e",
              fontWeight: 500,
              textAlign: "center",
            }}
          >
            No hay pagos registrados.
          </Typography>
        </Box>
      ) : (
        pagosAgrupados.map(({ mes, pagos }, indexMes) => (
          <Box key={mes} sx={{ mb: 5 }}>
            <Typography
              variant="h6"
              sx={{
                mb: 2,
                color: "#006d77",
                fontWeight: "bold",
                textAlign: "center",
                textTransform: "uppercase",
                backgroundColor: "#e0f7fa",
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
                        border: "1px solid #e0f7fa",
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
                              bgcolor: "#e0f7fa",
                              width: 40,
                              height: 40,
                              boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
                            }}
                          >
                            <AssignmentTurnedInIcon sx={{ color: "#006d77", fontSize: 24 }} />
                          </Avatar>
                          <Box>
                            <Typography
                              variant="subtitle1"
                              sx={{
                                fontWeight: "bold",
                                color: "#006d77",
                                textTransform: "capitalize",
                              }}
                            >
                              {pago.nombre_paciente}
                            </Typography>
                            <Typography
                              variant="body2"
                              sx={{ color: "#78909c", fontStyle: "italic" }}
                            >
                              {pago.nombre_tratamiento}
                            </Typography>
                          </Box>
                        </Box>
                        <Box mb={2}>
                          <Typography variant="body2" sx={{ color: "#555", fontWeight: 500 }}>
                            Fecha de pago:
                          </Typography>
                          <Typography
                            variant="body1"
                            sx={{ fontWeight: "medium", color: "#03445e" }}
                          >
                            {formatUTCDate(pago.fecha_pago)}
                          </Typography>
                        </Box>
                        <Box mb={2}>
                          <Typography variant="body2" sx={{ color: "#555", fontWeight: 500 }}>
                            Fecha de cita:
                          </Typography>
                          <Typography
                            variant="body1"
                            sx={{ fontWeight: "medium", color: "#03445e" }}
                          >
                            {formatUTCDate(pago.fecha_cita)}
                          </Typography>
                        </Box>
                        <Box mb={2} display="flex" alignItems="center" gap={1}>
                          <MonetizationOnIcon sx={{ color: "#007b5f", fontSize: 20 }} />
                          <Typography
                            variant="body1"
                            sx={{ fontWeight: "bold", color: "#007b5f" }}
                          >
                            ${parseFloat(pago.monto).toFixed(2)}
                          </Typography>
                        </Box>
                        <Chip
                          label={pago.estado}
                          size="small"
                          sx={{
                            mt: 1,
                            backgroundColor: pago.estado === "pagado" ? "#e8f5e9" : "#ffebee",
                            color: pago.estado === "pagado" ? "#4caf50" : "#f44336",
                            fontWeight: "bold",
                            borderRadius: "8px",
                            px: 1,
                            boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
                          }}
                        />
                        {pago.metodo && (
                          <Typography
                            variant="body2"
                            sx={{ mt: 1, color: "#555", fontWeight: 500 }}
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
        ))
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