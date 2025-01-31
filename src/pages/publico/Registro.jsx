import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

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
import axios from "axios";
import "./bubbles.css";
import {
  validateName,
  validateEmail,
  validateAge,
  validatePassword,
  validatePhoneNumber,
  evaluatePasswordStrength,
} from "../../utils/validations";

const Registro = () => {
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState({
    nombre: "",
    apellidoPaterno: "",
    apellidoMaterno: "",
    edad: "",
    genero: "",
    telefono: "",
    correo: "",
    contrasena: "",
    repetirContrasena: "",
    codigoVerificacion: "",
  });
  const [errors, setErrors] = useState({});
  const [alert, setAlert] = useState({ open: false, message: "", severity: "" });
  const [bubbles, setBubbles] = useState([]);
  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    level: "",
    suggestions: "",
  });
  const navigate = useNavigate();


  const steps = ["Datos Personales", "Cuenta", "Verificación"];

  useEffect(() => {
    const generatedBubbles = Array.from({ length: 40 }).map(() => ({
      left: `${Math.random() * 100}%`,
      animationDelay: `${Math.random() * 10}s`,
      animationDuration: `${5 + Math.random() * 10}s`,
    }));
    setBubbles(generatedBubbles);
  }, []);

  const handleNext = async () => {
    if (step === steps.length - 1) {
      try {
         // Log para verificar los datos enviados al backend
         console.log('Datos enviados a la verificación:', {
          email: formData.correo,
          codigo: formData.codigoVerificacion,
      });
        const response = await axios.post("https://backenddent.onrender.com/api/usuarios/verificar", {
          email: formData.correo,
          codigo: formData.codigoVerificacion,
        });

        setAlert({ open: true, message: response.data.mensaje, severity: "success" });
        // Redirigir a otra ruta después de unos segundos o de forma inmediata
        setTimeout(() => {
          navigate("/paciente");  // Reemplaza '/dashboard' por la ruta deseada
      }, 2000);
      } catch (error) {
        setAlert({
          open: true,
          message: error.response?.data?.mensaje || "Error al verificar la cuenta.",
          severity: "error",
        });
        // Log para mostrar cualquier error recibido desde el backend
        console.error('Error en la verificación:', error.response?.data);
      }
    } else if (step === 1) {
      try {
        await axios.post("https://backenddent.onrender.com/api/usuarios/registrar", {
          nombre: formData.nombre,
          apellido_paterno: formData.apellidoPaterno,
          apellido_materno: formData.apellidoMaterno,
          edad: formData.edad,
          sexo: formData.genero,
          telefono: formData.telefono,
          email: formData.correo,
          password: formData.contrasena,
          repetir_password: formData.repetirContrasena,  // Y aquí 'repetir_password'

        });

        setAlert({ open: true, message: "Registro exitoso. Revisa tu correo para el código de verificación.", severity: "success" });
        setStep((prevStep) => prevStep + 1);
      } catch (error) {
        setAlert({
          open: true,
          message: error.response?.data?.mensaje || "Error al registrar el usuario.",
          severity: "error",
        });
      }
    } else {
      setStep((prevStep) => prevStep + 1);
    }
  };

  const handleBack = () => {
    setStep((prevStep) => prevStep - 1);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));

    validateField(name, value);

    if (name === "contrasena") {
      const strength = evaluatePasswordStrength(value);
      setPasswordStrength(strength);
    }
  };

  const validateField = (fieldName, value) => {
    let errorMessage = "";

    switch (fieldName) {
      case "nombre":
      case "apellidoPaterno":
      case "apellidoMaterno":
        errorMessage = validateName(value);
        break;
      case "edad":
        errorMessage = validateAge(value);
        break;
      case "telefono":
        errorMessage = validatePhoneNumber(value);
        break;
      case "correo":
        errorMessage = validateEmail(value);
        break;
      case "contrasena":
        errorMessage = validatePassword(value);
        break;
      case "repetirContrasena":
        errorMessage = value !== formData.contrasena ? "Las contraseñas no coinciden." : "";
        break;
      default:
        break;
    }

    setErrors((prevErrors) => ({
      ...prevErrors,
      [fieldName]: errorMessage,
    }));
  };

  const validateStep = () => {
    switch (step) {
      case 0:
        return (
          !Object.values(errors).some((error) => error) &&
          formData.nombre &&
          formData.apellidoPaterno &&
          formData.apellidoMaterno &&
          formData.edad &&
          formData.genero &&
          formData.telefono
        );
      case 1:
        return (
          !Object.values(errors).some((error) => error) &&
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
        backgroundColor: "#e0f7fa",
      }}
    >
      <div className="bubbles">
        {bubbles.map((bubble, i) => (
          <div
            key={i}
            className="bubble"
            style={{
              left: bubble.left,
              animationDelay: bubble.animationDelay,
              animationDuration: bubble.animationDuration,
            }}
          ></div>
        ))}
      </div>

      <Box
        sx={{
          position: "relative",
          zIndex: 2,
        }}
      >
        <Paper
          elevation={3}
          sx={{
            padding: "20px",
            width: "500px",
            borderRadius: "10px",
            backgroundColor: "#ffffff",
          }}
        >
          <Typography
            variant="h6"
            sx={{
              color: "#0077b6",
              textAlign: "center",
              fontWeight: "bold",
              marginBottom: "10px",
            }}
          >
            Registro - {steps[step]}
          </Typography>

          <Stepper activeStep={step} alternativeLabel sx={{ marginBottom: "10px" }}>
            {steps.map((label, index) => (
              <Step key={index}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: "15px",
            }}
          >
            {step === 0 && (
              <>
                <TextField
                  label="Nombre"
                  name="nombre"
                  fullWidth
                  margin="dense"
                  value={formData.nombre}
                  onChange={handleChange}
                  error={!!errors.nombre}
                  helperText={errors.nombre}
                />
                <TextField
                  label="Apellido Paterno"
                  name="apellidoPaterno"
                  fullWidth
                  margin="dense"
                  value={formData.apellidoPaterno}
                  onChange={handleChange}
                  error={!!errors.apellidoPaterno}
                  helperText={errors.apellidoPaterno}
                />
                <TextField
                  label="Apellido Materno"
                  name="apellidoMaterno"
                  fullWidth
                  margin="dense"
                  value={formData.apellidoMaterno}
                  onChange={handleChange}
                  error={!!errors.apellidoMaterno}
                  helperText={errors.apellidoMaterno}
                />
                <TextField
                  label="Edad"
                  name="edad"
                  type="number"
                  fullWidth
                  margin="dense"
                  value={formData.edad}
                  onChange={handleChange}
                  error={!!errors.edad}
                  helperText={errors.edad}
                />
                <TextField
                  label="Género"
                  name="genero"
                  select
                  fullWidth
                  margin="dense"
                  value={formData.genero}
                  onChange={handleChange}
                  error={!!errors.genero}
                  helperText={errors.genero}
                >
                  <MenuItem value="Masculino">Masculino</MenuItem>
                  <MenuItem value="Femenino">Femenino</MenuItem>
                  <MenuItem value="Otro">Otro</MenuItem>
                </TextField>
                <TextField
                  label="Teléfono"
                  name="telefono"
                  type="tel"
                  fullWidth
                  margin="dense"
                  value={formData.telefono}
                  onChange={handleChange}
                  error={!!errors.telefono}
                  helperText={errors.telefono}
                />
              </>
            )}

            {step === 1 && (
              <>
                <TextField
                  label="Correo Electrónico"
                  name="correo"
                  type="email"
                  fullWidth
                  margin="dense"
                  value={formData.correo}
                  onChange={handleChange}
                  error={!!errors.correo}
                  helperText={errors.correo}
                />
                <TextField
                  label="Contraseña"
                  name="contrasena"
                  type="password"
                  fullWidth
                  margin="dense"
                  value={formData.contrasena}
                  onChange={handleChange}
                  error={!!errors.contrasena}
                  helperText={errors.contrasena}
                />
                <TextField
                  label="Repetir Contraseña"
                  name="repetirContrasena"
                  type="password"
                  fullWidth
                  margin="dense"
                  value={formData.repetirContrasena}
                  onChange={handleChange}
                  error={!!errors.repetirContrasena}
                  helperText={errors.repetirContrasena}
                />

                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 1,
                    marginTop: 1,
                  }}
                >
                  <Typography
                    variant="body2"
                    color={
                      passwordStrength.score < 2 ? "error" : passwordStrength.score < 4 ? "warning" : "success"
                    }
                    sx={{ fontWeight: "bold" }}
                  >
                    Fortaleza: {passwordStrength.level}
                  </Typography>
                  <Box
                    sx={{
                      display: "flex",
                      gap: 0.5,
                      marginTop: 1,
                    }}
                  >
                    {[0, 1, 2, 3, 4].map((i) => (
                      <Box
                        key={i}
                        sx={{
                          height: "8px",
                          flex: 1,
                          borderRadius: 1,
                          backgroundColor: i <= passwordStrength.score ? "#4caf50" : "#e0e0e0",
                        }}
                      ></Box>
                    ))}
                  </Box>
                  <Typography variant="caption" color="textSecondary">
                    {passwordStrength.suggestions}
                  </Typography>
                </Box>
              </>
            )}

            {step === 2 && (
              <TextField
                label="Código de Verificación"
                name="codigoVerificacion"
                fullWidth
                margin="dense"
                value={formData.codigoVerificacion}
                onChange={handleChange}
                error={!!errors.codigoVerificacion}
                helperText={errors.codigoVerificacion}
              />
            )}
          </Box>

          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              marginTop: "10px",
            }}
          >
            <Button variant="outlined" onClick={handleBack} disabled={step === 0}>
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
        </Paper>
      </Box>

      <Snackbar
        open={alert.open}
        autoHideDuration={6000}
        onClose={handleCloseAlert}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert onClose={handleCloseAlert} severity={alert.severity}>
          {alert.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Registro;
