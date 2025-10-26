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
  const [loadingStates, setLoadingStates] = useState({});
  const [resultado, setResultado] = useState(null);
  const [alerta, setAlerta] = useState({ open: false, message: "", severity: "info" });

  useEffect(() => {
    const obtenerPacientes = async () => {
      try {
        const res = await axios.get("http://localhost:4000/api/usuarios/prediccion-pacientes");
        const updatedPacientes = res.data.map(p => ({
          ...p,
          monto_ultimo_pago: p.monto_ultimo_pago || "$0.00"
        }));
        setPacientes(updatedPacientes);
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

  const extraerDatosParaPrediccion = (paciente) => ({
    edad: paciente.edad,
    citas_totales: paciente.citas_totales,
    citas_asistidas: paciente.citas_asistidas,
    monto_ultimo_pago: paciente.monto_ultimo_pago,
    dia_semana: paciente.dia_semana,
  });

  const obtenerPrediccion = async (paciente, index) => {
    setLoadingStates((prev) => ({ ...prev, [index]: true }));
    setResultado(null);
    try {
      const datos = extraerDatosParaPrediccion(paciente);
      console.log("📤 Enviando a Flask:", datos);

      const res = await axios.post("https://predicciondentista.onrender.com/predict", datos);

      console.log("📥 Respuesta de Flask:", res.data);

      setResultado(res.data.asistira);
      setAlerta({
        open: true,
        message: `Predicción: ${res.data.asistira === 1 ? "Sí asistirá" : "No asistirá"}`,
        severity: res.data.asistira === 1 ? "success" : "warning",
      });
    } catch (err) {
      console.error(" Error en la predicción:", err);
      setAlerta({
        open: true,
        message: "Error al obtener predicción",
        severity: "error",
      });
    } finally {
      setLoadingStates((prev) => ({ ...prev, [index]: false }));
    }
  };

  const cerrarAlerta = () => setAlerta({ ...alerta, open: false });

  return (
    <Box sx={{ p: 3, backgroundColor: "#f5f9fa", minHeight: "100vh", fontFamily: "'Poppins', sans-serif" }}>
      <Typography variant="h5" sx={{ fontWeight: "bold", color: "#006d77", mb: 4, textAlign: "center" }}>
        Predicción de Asistencia a Citas
      </Typography>

      <Grid container spacing={3} sx={{ alignItems: "stretch" }}>
        {pacientes.map((p, index) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
            <motion.div
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              transition={{ duration: 0.3 }}
            >
              <Card
                sx={{
                  borderRadius: 12,
                  boxShadow: "0 6px 12px rgba(0,0,0,0.1)",
                  border: "1px solid #e0f2f1",
                  backgroundColor: "#ffffff",
                  height: 420, // Altura fija para todas las cartas
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  alignItems: "stretch",
                }}
              >
                <CardContent
                  sx={{
                    flexGrow: 1,
                    p: 2,
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    "&:last-child": {
                      pb: 2,
                    },
                    overflow: "hidden", // Evita desbordamiento
                  }}
                >
                  <Box>
                    <Avatar
                      sx={{
                        bgcolor: "#e0f7fa",
                        width: 60,
                        height: 60,
                        mb: 3,
                        mx: "auto",
                        my: "auto",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                      }}
                    >
                      <Person sx={{ color: "#006d77", fontSize: 30 }} />
                    </Avatar>
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: "bold",
                        color: "#006d77",
                        textAlign: "center",
                        mb: 2,
                        fontSize: "1.1rem",
                        wordBreak: "break-word", // Evita desbordamiento de nombres largos
                      }}
                    >
                      {p.nombre_completo}
                    </Typography>
                    <Typography variant="body2" sx={{ color: "#555", mb: 1.5, textAlign: "center" }}>
                      Tratamiento: <strong>{p.nombre_tratamiento}</strong>
                    </Typography>
                    <Typography variant="body2" sx={{ color: "#555", mb: 1.5, textAlign: "center" }}>
                      Edad: <strong>{p.edad}</strong>
                    </Typography>
                    <Typography variant="body2" sx={{ color: "#555", mb: 1.5, textAlign: "center" }}>
                      Citas Totales: <strong>{p.citas_totales}</strong>
                    </Typography>
                    <Typography variant="body2" sx={{ color: "#555", mb: 1.5, textAlign: "center" }}>
                      Asistidas: <strong>{p.citas_asistidas}</strong>
                    </Typography>
                    <Typography variant="body2" sx={{ color: "#555", mb: 1.5, textAlign: "center" }}>
                      Día de la semana: <strong>{p.dia_semana}</strong>
                    </Typography>
                    {p.monto_ultimo_pago && (
                      <Typography variant="body2" sx={{ color: "#555", mb: 3, textAlign: "center" }}>
                        Último pago: <strong>${p.monto_ultimo_pago}</strong>
                      </Typography>
                    )}
                  </Box>
                </CardContent>
                <Box sx={{ p: 2, pt: 0 }}>
                  <Button
                    fullWidth
                    variant="contained"
                    startIcon={
                      loadingStates[index] ? (
                        <CircularProgress size={24} sx={{ color: "#fff", mx: "auto", display: "flex", alignItems: "center" }} />
                      ) : (
                        <Psychology sx={{ fontSize: 24, mx: "auto", display: "flex", alignItems: "center" }} />
                      )
                    }
                    sx={{
                      bgcolor: "#006d77",
                      ":hover": { bgcolor: "#005c66" },
                      borderRadius: 8,
                      fontWeight: "bold",
                      textTransform: "none",
                      py: 1,
                      minHeight: 48,
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      textAlign: "center",
                    }}
                    onClick={() => obtenerPrediccion(p, index)}
                    disabled={loadingStates[index]}
                  >
                    {loadingStates[index] ? "Cargando..." : "Predecir asistencia"}
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