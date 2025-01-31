import React from "react";
import { Typography, Box, Grid, Card, CardContent } from "@mui/material";
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

// Registra los elementos de Chart.js
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

const BienvenidaAdmin = () => {
  // Datos simulados para los gráficos
  const lineData = {
    labels: ["Enero", "Febrero", "Marzo", "Abril", "Mayo"],
    datasets: [
      {
        label: "Citas Programadas",
        data: [12, 19, 3, 5, 2],
        borderColor: "#1e88e5",
        backgroundColor: "rgba(30, 136, 229, 0.3)",
        fill: true,
      },
    ],
  };

  const barData = {
    labels: ["Tratamientos", "Pagos", "Pacientes"],
    datasets: [
      {
        label: "Actividades",
        data: [15, 30, 12],
        backgroundColor: ["#f44336", "#4caf50", "#ffc107"],
      },
    ],
  };

  const doughnutData = {
    labels: ["Citas Completadas", "Citas Pendientes", "Citas Canceladas"],
    datasets: [
      {
        data: [40, 25, 10],
        backgroundColor: ["#66bb6a", "#ffa726", "#ef5350"],
      },
    ],
  };

  return (
    <Box sx={{ padding: "24px" }}>
      <Typography variant="h4" component="h1" sx={{ marginBottom: "24px", fontWeight: "bold" }}>
        Bienvenido al Panel de Administración
      </Typography>

      <Grid container spacing={3}>
        {/* Gráfico de línea */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" component="div" sx={{ marginBottom: "16px", fontWeight: "bold" }}>
                Citas Programadas (Mensuales)
              </Typography>
              <Box sx={{ height: 300 }}>
                <Line data={lineData} options={{ responsive: true, maintainAspectRatio: false }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Gráfico de barras */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" component="div" sx={{ marginBottom: "16px", fontWeight: "bold" }}>
                Actividades por Sección
              </Typography>
              <Box sx={{ height: 300 }}>
                <Bar data={barData} options={{ responsive: true, maintainAspectRatio: false }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Gráfico de dona */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" component="div" sx={{ marginBottom: "16px", fontWeight: "bold" }}>
                Distribución de Citas
              </Typography>
              <Box sx={{ height: 300 }}>
                <Doughnut data={doughnutData} options={{ responsive: true, maintainAspectRatio: false }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default BienvenidaAdmin;
