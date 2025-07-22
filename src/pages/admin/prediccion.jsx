import React, { useState, useEffect } from "react";
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Avatar,
  CircularProgress,
  Alert,
  Snackbar,
  Button,
} from "@mui/material";
import { Psychology, Person } from "@mui/icons-material";
import axios from "axios";
import { motion } from "framer-motion";

const Prediccion = () => {
  const [pacientes, setPacientes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [resultado, setResultado] = useState(null);
  const [alerta, setAlerta] = useState({ open: false, message: "", severity: "info" });

  useEffect(() => {
    const obtenerPacientes = async () => {
      try {
        const res = await axios.get("http://localhost:4000/api/usuarios/prediccion-pacientes");
        setPacientes(res.data);
      } catch (err) {
        console.error("Error al cargar pacientes:", err);
        setAlerta({
          open: true,
          message: "Error al cargar pacientes",
          severity: "error",
        });
      }
    };
    obtenerPacientes();
  }, []);
const obtenerPrediccion = async (paciente) => {
  setLoading(true);
  setResultado(null);
  try {
    console.log("📤 Enviando a Flask:", paciente); // 🔍 Log del paciente que se envía

    const res = await axios.post("https://predicciondentista.onrender.com/predict", paciente);

    console.log("📥 Respuesta de Flask:", res.data); // 🔍 Log de la respuesta

    setResultado(res.data.asistira);
   setAlerta({
  open: true,
  message: `Predicción: ${res.data.asistira === 1 ? "Sí asistirá" : "No asistirá"}`,
  severity: res.data.asistira === 1 ? "success" : "warning",
});
  } catch (err) {
    console.error("❌ Error en la predicción:", err);
    setAlerta({
      open: true,
      message: "Error al obtener predicción",
      severity: "error",
    });
  } finally {
    setLoading(false);
  }
};


  const cerrarAlerta = () => setAlerta({ ...alerta, open: false });

  return (
    <Box sx={{ p: 3, backgroundColor: "#f5f9fa", minHeight: "100vh", fontFamily: "'Poppins', sans-serif" }}>
      <Typography variant="h5" sx={{ fontWeight: "bold", color: "#006d77", mb: 3 }}>
        Predicción de Asistencia a Citas
      </Typography>

      {loading && (
        <Box sx={{ display: "flex", justifyContent: "center", my: 4 }}>
          <CircularProgress sx={{ color: "#006d77" }} />
        </Box>
      )}

      <Grid container spacing={3}>
        {pacientes.map((p, index) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
            <motion.div
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              transition={{ duration: 0.3 }}
            >
              <Card
                sx={{
                  borderRadius: 3,
                  boxShadow: "0 4px 10px rgba(0,0,0,0.05)",
                  border: "1px solid #e0f2f1",
                  backgroundColor: "#ffffff",
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                }}
              >
                <CardContent>
                  <Avatar
                    sx={{
                      bgcolor: "#e0f7fa",
                      width: 56,
                      height: 56,
                      mb: 2,
                    }}
                  >
                    <Person sx={{ color: "#006d77" }} />
                  </Avatar>
                  <Typography variant="h6" sx={{ fontWeight: "bold", color: "#006d77" }}>
                    {p.nombre_completo}
                  </Typography>
                  <Typography variant="body2" sx={{ color: "#555", mt: 1 }}>
                    Edad: <strong>{p.edad}</strong>
                  </Typography>
                  <Typography variant="body2" sx={{ color: "#555" }}>
                    Citas Totales: <strong>{p.citas_totales}</strong>
                  </Typography>
                  <Typography variant="body2" sx={{ color: "#555" }}>
                    Asistidas: <strong>{p.citas_asistidas}</strong>
                  </Typography>
                  <Typography variant="body2" sx={{ color: "#555" }}>
                    Día de la semana: <strong>{p.dia_semana}</strong>
                  </Typography>
                  <Typography variant="body2" sx={{ color: "#555" }}>
                    Último pago: <strong>${p.monto_ultimo_pago}</strong>
                  </Typography>
                </CardContent>
                <Box sx={{ p: 2 }}>
                  <Button
                    fullWidth
                    variant="contained"
                    startIcon={<Psychology />}
                    sx={{
                      bgcolor: "#006d77",
                      ":hover": { bgcolor: "#005c66" },
                      borderRadius: 2,
                      fontWeight: "bold",
                    }}
                    onClick={() => obtenerPrediccion(p)}
                    disabled={loading}
                  >
                    Predecir asistencia
                  </Button>
                </Box>
              </Card>
            </motion.div>
          </Grid>
        ))}
      </Grid>

      <Snackbar
        open={alerta.open}
        autoHideDuration={6000}
        onClose={cerrarAlerta}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
      >
        <Alert onClose={cerrarAlerta} severity={alerta.severity} sx={{ width: "100%" }}>
          {alerta.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Prediccion;
