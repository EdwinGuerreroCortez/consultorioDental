import React, { useEffect, useState } from "react";
import {
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  CircularProgress,
  TextField,
  Button,
} from "@mui/material";
import axios from "axios";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Line, Bar, Doughnut } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const Reportes = () => {
  const [lineData, setLineData] = useState(null);
  const [barData, setBarData] = useState(null);
  const [doughnutData, setDoughnutData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [desde, setDesde] = useState("2024-01-01");
  const [hasta, setHasta] = useState("2024-12-31");

  const fetchData = async () => {
    try {
      setLoading(true);
      const [citasRes, ingresosRes, tratamientosRes] = await Promise.all([
        axios.get(`https://backenddent.onrender.com/api/reportes/citas?desde=${desde}&hasta=${hasta}`),
        axios.get(`https://backenddent.onrender.com/api/reportes/ingresos?desde=${desde}&hasta=${hasta}`),
        axios.get(`https://backenddent.onrender.com/api/reportes/tratamientos?desde=${desde}&hasta=${hasta}`),
      ]);

      // Línea: Ingresos por mes
      const mesesLine = ingresosRes.data.map(item => item.mes);
      const ingresosLine = ingresosRes.data.map(item => item.ingresos);
      setLineData({
        labels: mesesLine,
        datasets: [
          {
            label: "Ingresos Mensuales",
            data: ingresosLine,
            borderColor: "#1e88e5",
            backgroundColor: "rgba(30, 136, 229, 0.3)",
            fill: true,
          },
        ],
      });

      // Dona: Estado de citas
      const estados = ["completada", "pendiente", "cancelado"];
      const resumenEstados = estados.map(estado =>
        citasRes.data.reduce((acc, item) => {
          if (item.estado === estado) return acc + item.total;
          return acc;
        }, 0)
      );
      setDoughnutData({
        labels: ["Citas Completadas", "Citas Pendientes", "Citas Canceladas"],
        datasets: [
          {
            data: resumenEstados,
            backgroundColor: ["#66bb6a", "#ffa726", "#ef5350"],
          },
        ],
      });

      // Barras: Tratamientos más solicitados
      const resumenTratamientos = {};
      tratamientosRes.data.forEach(item => {
        if (!resumenTratamientos[item.tratamiento]) {
          resumenTratamientos[item.tratamiento] = 0;
        }
        resumenTratamientos[item.tratamiento] += item.total_solicitudes;
      });
      const tratamientos = Object.keys(resumenTratamientos);
      const totales = Object.values(resumenTratamientos);
      setBarData({
        labels: tratamientos,
        datasets: [
          {
            label: "Solicitudes",
            data: totales,
            backgroundColor: "#42a5f5",
          },
        ],
      });

      setLoading(false);
    } catch (error) {
      console.error(" Error al obtener datos de reportes:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAplicarFiltros = () => {
    fetchData();
  };

  return (
    <Box sx={{ padding: "24px", fontFamily: "'Poppins', sans-serif" }}>

      {/* Filtros visualmente como barra de búsqueda */}
      <Box sx={{ mb: 3, display: "flex", gap: 2, alignItems: "center" }}>
        <TextField
          label="Desde"
          type="date"
          variant="outlined"
          value={desde}
          onChange={(e) => setDesde(e.target.value)}
          sx={{
            flex: 1,
            "& .MuiOutlinedInput-root": {
              borderRadius: 2,
              backgroundColor: "#f4f7f8",
              "& fieldset": { borderColor: "#006d77" },
              "&:hover fieldset": { borderColor: "#005c66" },
            },
          }}
          InputProps={{ sx: { color: "#006d77" } }}
          InputLabelProps={{ shrink: true, sx: { color: "#006d77" } }}
        />
        <TextField
          label="Hasta"
          type="date"
          variant="outlined"
          value={hasta}
          onChange={(e) => setHasta(e.target.value)}
          sx={{
            flex: 1,
            "& .MuiOutlinedInput-root": {
              borderRadius: 2,
              backgroundColor: "#f4f7f8",
              "& fieldset": { borderColor: "#006d77" },
              "&:hover fieldset": { borderColor: "#005c66" },
            },
          }}
          InputProps={{ sx: { color: "#006d77" } }}
          InputLabelProps={{ shrink: true, sx: { color: "#006d77" } }}
        />
        <Button
          variant="outlined"
          onClick={handleAplicarFiltros}
          sx={{
            height: "56px",
            borderRadius: 2,
            fontWeight: "bold",
            color: "#006d77",
            borderColor: "#006d77",
            ":hover": { bgcolor: "#e0f7fa", borderColor: "#005c66" },
          }}
        >
          Aplicar filtros
        </Button>
      </Box>

      {loading ? (
        <Box sx={{ textAlign: "center", padding: 5 }}>
          <CircularProgress />
          <Typography>Cargando reportes...</Typography>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {/* Línea: Ingresos mensuales */}
          <Grid item xs={12} md={6}>
            <Card sx={{ borderRadius: 3, boxShadow: 3 }}>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: "bold", color: "#03445e" }}>
                  Ingresos por Mes
                </Typography>
                <Box sx={{ height: 300 }}>
                  <Line data={lineData} options={{ responsive: true, maintainAspectRatio: false }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Barras: Tratamientos más solicitados */}
          <Grid item xs={12} md={6}>
            <Card sx={{ borderRadius: 3, boxShadow: 3 }}>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: "bold", color: "#03445e" }}>
                  Tratamientos Más Solicitados
                </Typography>
                <Box sx={{ height: 300 }}>
                  <Bar data={barData} options={{ responsive: true, maintainAspectRatio: false }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Dona: Distribución de citas */}
          <Grid item xs={12} md={6}>
            <Card sx={{ borderRadius: 3, boxShadow: 3 }}>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: "bold", color: "#03445e" }}>
                  Distribución de Citas
                </Typography>
                <Box sx={{ height: 300 }}>
                  <Doughnut data={doughnutData} options={{ responsive: true, maintainAspectRatio: false }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}
    </Box>
  );
};

export default Reportes;
