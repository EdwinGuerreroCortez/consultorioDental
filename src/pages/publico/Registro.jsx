import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  Stepper,
  Step,
  StepLabel,
  MenuItem,
  Alert,
  Snackbar,
} from "@mui/material";
import fondo1 from "../../assets/images/fondoregistro.png";
import fondo2 from "../../assets/images/fondoregistro2.png";
import fondo3 from "../../assets/images/fondoregistro3.png";
import "./bubbles.css"; // Archivo CSS para las burbujas

const Registro = () => {
  const [step, setStep] = useState(0); // Manejo de pasos
  const [formData, setFormData] = useState({
    nombre: "",
    apellidoPaterno: "",
    apellidoMaterno: "",
    edad: "",
    genero: "",
    correo: "",
    contrasena: "",
    repetirContrasena: "",
    codigoVerificacion: "",
  });
  const [alert, setAlert] = useState({ open: false, message: "", severity: "" });

  const steps = ["Datos Personales", "Cuenta", "Verificación"];

  const handleNext = () => {
    if (step === steps.length - 1) {
      console.log("Formulario enviado:", formData);
      setAlert({ open: true, message: "Registro completado con éxito.", severity: "success" });
    } else {
      setStep((prevStep) => prevStep + 1);
    }
  };

  const handleBack = () => {
    setStep((prevStep) => prevStep - 1);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const validateStep = () => {
    switch (step) {
      case 0:
        return (
          formData.nombre &&
          formData.apellidoPaterno &&
          formData.apellidoMaterno &&
          formData.edad &&
          formData.genero
        );
      case 1:
        return (
          formData.correo &&
          formData.contrasena &&
          formData.repetirContrasena &&
          formData.contrasena === formData.repetirContrasena
        );
      case 2:
        return formData.codigoVerificacion;
      default:
        return false;
    }
  };

  const handleCloseAlert = () => {
    setAlert({ ...alert, open: false });
  };

  return (
    <Box
      sx={{
        position: "relative",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        overflow: "hidden",
        backgroundColor: "#e0f7fa", // Azul claro como fondo principal
      }}
    >
      {/* Contenedor para las burbujas */}
      <div className="bubbles">
        {Array.from({ length: 40 }).map((_, i) => (
          <div
            key={i}
            className="bubble"
            style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 10}s`,
              animationDuration: `${5 + Math.random() * 10}s`,
            }}
          ></div>
        ))}
      </div>

      <Box
        sx={{
          position: "relative",
          zIndex: 2, // Asegura que el formulario esté por encima de las burbujas
        }}
      >
        <Paper
          elevation={3}
          sx={{
            padding: "30px",
            maxWidth: "500px",
            width: "100%",
            borderRadius: "10px",
            backgroundColor: "#ffffff",
          }}
        >
          <Typography
            variant="h5"
            sx={{ marginBottom: "20px", color: "#0077b6" }}
          >
            Registro - {steps[step]}
          </Typography>

          <Stepper activeStep={step} alternativeLabel>
            {steps.map((label, index) => (
              <Step key={index}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          <Box sx={{ marginTop: "20px" }}>
            {step === 0 && (
              <Box>
                <TextField
                  label="Nombre"
                  name="nombre"
                  fullWidth
                  margin="normal"
                  value={formData.nombre}
                  onChange={handleChange}
                  required
                />
                <TextField
                  label="Apellido Paterno"
                  name="apellidoPaterno"
                  fullWidth
                  margin="normal"
                  value={formData.apellidoPaterno}
                  onChange={handleChange}
                  required
                />
                <TextField
                  label="Apellido Materno"
                  name="apellidoMaterno"
                  fullWidth
                  margin="normal"
                  value={formData.apellidoMaterno}
                  onChange={handleChange}
                  required
                />
                <TextField
                  label="Edad"
                  name="edad"
                  type="number"
                  fullWidth
                  margin="normal"
                  value={formData.edad}
                  onChange={handleChange}
                  required
                />
                <TextField
                  label="Género"
                  name="genero"
                  select
                  fullWidth
                  margin="normal"
                  value={formData.genero}
                  onChange={handleChange}
                  required
                >
                  <MenuItem value="Masculino">Masculino</MenuItem>
                  <MenuItem value="Femenino">Femenino</MenuItem>
                  <MenuItem value="Otro">Otro</MenuItem>
                </TextField>
              </Box>
            )}

            {step === 1 && (
              <Box>
                <TextField
                  label="Correo Electrónico"
                  name="correo"
                  type="email"
                  fullWidth
                  margin="normal"
                  value={formData.correo}
                  onChange={handleChange}
                  required
                />
                <TextField
                  label="Contraseña"
                  name="contrasena"
                  type="password"
                  fullWidth
                  margin="normal"
                  value={formData.contrasena}
                  onChange={handleChange}
                  required
                />
                <TextField
                  label="Repetir Contraseña"
                  name="repetirContrasena"
                  type="password"
                  fullWidth
                  margin="normal"
                  value={formData.repetirContrasena}
                  onChange={handleChange}
                  required
                />
              </Box>
            )}

            {step === 2 && (
              <Box>
                <TextField
                  label="Código de Verificación"
                  name="codigoVerificacion"
                  fullWidth
                  margin="normal"
                  value={formData.codigoVerificacion}
                  onChange={handleChange}
                  required
                />
              </Box>
            )}

            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                marginTop: "20px",
              }}
            >
              <Button
                variant="outlined"
                onClick={handleBack}
                disabled={step === 0}
              >
                Atrás
              </Button>
              <Button
                variant="contained"
                onClick={handleNext}
                disabled={!validateStep()}
                sx={{ backgroundColor: "#0077b6" }}
              >
                {step === steps.length - 1 ? "Finalizar" : "Siguiente"}
              </Button>
            </Box>
          </Box>
        </Paper>
      </Box>

      <Snackbar
        open={alert.open}
        autoHideDuration={6000}
        onClose={handleCloseAlert}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert onClose={handleCloseAlert} severity={alert.severity} sx={{ width: "100%" }}>
          {alert.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Registro;
