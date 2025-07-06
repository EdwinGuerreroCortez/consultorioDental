import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Divider,
  CircularProgress,
  Chip
} from "@mui/material";
import axios from "axios";
import { format } from "date-fns";
import { motion } from "framer-motion";
import { es } from "date-fns/locale";

const agruparPorMes = (pagos) => {
  const agrupados = {};

  pagos.forEach((pago) => {
    const fecha = new Date(pago.fecha_pago);
    const clave = format(fecha, "MMMM yyyy", { locale: es });
    const claveCapitalizada = clave.charAt(0).toUpperCase() + clave.slice(1);

    if (!agrupados[claveCapitalizada]) agrupados[claveCapitalizada] = [];
    agrupados[claveCapitalizada].push(pago);
  });

  // 🔁 Ordenar meses del más reciente al más antiguo
  const resultadoOrdenado = Object.entries(agrupados)
    .map(([mes, pagos]) => {
      const fechaReferencia = new Date(pagos[0].fecha_pago);
      return { mes, fechaReferencia, pagos };
    })
    .sort((a, b) => b.fechaReferencia - a.fechaReferencia) // ← Aquí está el cambio
    .map(({ mes, pagos }) => ({ mes, pagos }));

  return resultadoOrdenado;
};


const HistorialPagos = () => {
  const [pagos, setPagos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const obtenerPagos = async () => {
      try {
        const res = await axios.get("http://localhost:4000/api/pagos/historial");
        setPagos(res.data);
      } catch (error) {
        console.error("Error al obtener historial de pagos:", error);
      } finally {
        setLoading(false);
      }
    };
    obtenerPagos();
  }, []);

  const pagosAgrupados = agruparPorMes(pagos);

  return (
    <Box sx={{ p: 4, fontFamily: "'Poppins', sans-serif", background: "#f9fdfd" }}>
      {loading ? (
        <Box sx={{ textAlign: "center", mt: 10 }}>
          <CircularProgress sx={{ color: "#006d77" }} />
        </Box>
      ) : (
        pagosAgrupados.map(({ mes, pagos }, index) => (
          <Box key={mes} sx={{ mb: 5 }}>
            <Typography
              variant="h6"
              sx={{ mb: 2, color: "#03445e", fontWeight: "bold" }}
            >
              {mes}
            </Typography>
            <Grid container spacing={3}>
              {pagos.map((pago, i) => (
                <Grid item xs={12} md={6} lg={4} key={pago.pago_id}>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <Card
                      sx={{
                        borderRadius: 4,
                        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
                        background: "#ffffff",
                        border: "1px solid #e0f7fa",
                      }}
                    >
                      <CardContent>
                        <Typography variant="subtitle1" sx={{ fontWeight: "bold", color: "#006d77" }}>
                          {pago.nombre_paciente}
                        </Typography>
                        <Typography variant="body2" sx={{ color: "#555", mb: 1 }}>
                          Tratamiento: {pago.nombre_tratamiento}
                        </Typography>

                        <Divider sx={{ my: 1 }} />

                        <Typography variant="body2" sx={{ color: "#555" }}>
                          Monto: <strong>${pago.monto}</strong>
                        </Typography>
                        <Typography variant="body2" sx={{ color: "#555" }}>
                          Fecha: {format(new Date(pago.fecha_pago), "dd/MM/yyyy")}
                        </Typography>
                        <Typography variant="body2" sx={{ color: "#555" }}>
                          Método: {pago.metodo}
                        </Typography>
                        <Chip
                          label={pago.estado}
                          size="small"
                          sx={{
                            mt: 1,
                            backgroundColor:
                              pago.estado === "pagado" ? "#d0f0e4" : "#ffe0e0",
                            color: pago.estado === "pagado" ? "#007b5f" : "#b00020",
                            fontWeight: "bold",
                          }}
                        />
                      </CardContent>
                    </Card>
                  </motion.div>
                </Grid>
              ))}
            </Grid>
          </Box>
        ))
      )}
    </Box>
  );
};

export default HistorialPagos;
