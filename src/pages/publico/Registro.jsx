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
  InputAdornment,
  IconButton,
} from "@mui/material";
import {
  Visibility,
  VisibilityOff,
  Person,
  CalendarToday,
  Phone,
  Email,
  Lock,
  ArrowBack,
  ArrowForward,
  CheckCircle, // Corregido de CheckCircleIllustration a CheckCircle
} from "@mui/icons-material";
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
    fechaNacimiento: "",
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
  const [showPassword, setShowPassword] = useState(false);
  const [showRepeatPassword, setShowRepeatPassword] = useState(false);
  const [csrfToken, setCsrfToken] = useState(null); // Nuevo estado para el token CSRF
  const navigate = useNavigate();

  const steps = ["Datos Personales", "Cuenta", "Verificación"];

  // Obtener el token CSRF al montar el componente
  useEffect(() => {
    const obtenerTokenCSRF = async () => {
      try {
        const response = await fetch("http://localhost:4000/api/get-csrf-token", {
          credentials: "include",
        });
        const data = await response.json();
        setCsrfToken(data.csrfToken); // Guardar el token en el estado
      } catch (error) {
        console.error("Error obteniendo el token CSRF:", error);
        setAlert({ open: true, message: "Error al obtener el token CSRF", severity: "error" });
      }
    };
    obtenerTokenCSRF();
  }, []);

  useEffect(() => {
    const generatedBubbles = Array.from({ length: 20 }).map(() => ({
      left: `${Math.random() * 100}%`,
      size: `${Math.random() * 40 + 20}px`,
      animationDelay: `${Math.random() * 8}s`,
      animationDuration: `${6 + Math.random() * 8}s`,
    }));
    setBubbles(generatedBubbles);
  }, []);

  const handleNext = async () => {
    if (!validateStep()) {
      setAlert({
        open: true,
        message: "Por favor, corrige los errores antes de continuar.",
        severity: "error",
      });
      return;
    }

    if (!csrfToken) {
      setAlert({ open: true, message: "Error: Token CSRF no disponible", severity: "error" });
      return;
    }

    if (step === steps.length - 1) {
      try {
        console.log("Datos enviados a la verificación:", {
          email: formData.correo,
          codigo: formData.codigoVerificacion,
        });

        const response = await axios.post(
          "http://localhost:4000/api/usuarios/verificar",
          {
            email: formData.correo,
            codigo: formData.codigoVerificacion,
          },
          {
            headers: {
              "X-XSRF-TOKEN": csrfToken,
              "Content-Type": "application/json",
            },
            withCredentials: true,
          }
        );

        setAlert({ open: true, message: response.data.mensaje, severity: "success" });
        setTimeout(() => navigate("/login"), 2000);
      } catch (error) {
        setAlert({
          open: true,
          message: error.response?.data?.mensaje || "Error al verificar la cuenta.",
          severity: "error",
        });
        console.error("Error en la verificación:", error.response?.data);
      }
    } else if (step === 1) {
      try {
        await axios.post(
          "http://localhost:4000/api/usuarios/registrar",
          {
            nombre: formData.nombre,
            apellido_paterno: formData.apellidoPaterno,
            apellido_materno: formData.apellidoMaterno,
            fecha_nacimiento: formData.fechaNacimiento,
            sexo: formData.genero,
            telefono: formData.telefono,
            email: formData.correo,
            password: formData.contrasena,
            repetir_password: formData.repetirContrasena,
          },
          {
            headers: {
              "X-XSRF-TOKEN": csrfToken,
              "Content-Type": "application/json",
            },
            withCredentials: true,
          }
        );

        setAlert({
          open: true,
          message: "Registro exitoso. Revisa tu correo.",
          severity: "success",
        });
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
      case "fechaNacimiento":
        const birthDate = new Date(value);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
          age--;
        }
        if (age < 18) {
          errorMessage = "Debes ser mayor de 18 años.";
        }
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
          formData.fechaNacimiento &&
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

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleRepeatPasswordVisibility = () => {
    setShowRepeatPassword(!showRepeatPassword);
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
        backgroundColor: "#e6f7ff",
      }}
    >
      <div className="bubbles">
        {bubbles.map((bubble, i) => (
          <div
            key={i}
            className="bubble"
            style={{
              left: bubble.left,
              width: bubble.size,
              height: bubble.size,
              animationDelay: bubble.animationDelay,
              animationDuration: bubble.animationDuration,
            }}
          />
        ))}
      </div>

      <Box sx={{ position: "relative", zIndex: 2, width: "100%", maxWidth: "1100px", padding: "16px" }}>
        <Paper
          elevation={6}
          sx={{
            padding: { xs: "16px", sm: "24px", md: "50px" },
            width: "100%",
            maxWidth: "100%",
            borderRadius: "20px",
            backgroundColor: "rgba(255, 255, 255, 0.85)",
            backdropFilter: "blur(10px)",
            boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.2)",
            border: "1px solid rgba(255, 255, 255, 0.18)",
          }}
        >
          <Typography
            variant="h4"
            sx={{
              color: "#003087",
              textAlign: "center",
              fontWeight: "700",
              marginBottom: { xs: "16px", md: "30px" },
              fontFamily: "'Poppins', sans-serif",
              textShadow: "1px 1px 2px rgba(0, 0, 0, 0.1)",
              fontSize: { xs: "1.5rem", sm: "2rem", md: "2.5rem" },
            }}
          >
            Registro - {steps[step]}
          </Typography>

          <Stepper
            activeStep={step}
            alternativeLabel
            sx={{
              marginBottom: { xs: "16px", md: "40px" },
              "& .MuiStepLabel-label": {
                fontSize: { xs: "0.9rem", sm: "1.1rem", md: "1.2rem" },
              },
            }}
          >
            {steps.map((label, index) => (
              <Step key={index}>
                <StepLabel
                  sx={{
                    "& .MuiStepLabel-label": {
                      color: step >= index ? "#003087" : "#757575",
                      fontWeight: step === index ? "bold" : "normal",
                      fontFamily: "'Poppins', sans-serif",
                    },
                  }}
                >
                  {label}
                </StepLabel>
              </Step>
            ))}
          </Stepper>

          <Box sx={{ display: "flex", flexDirection: "column", gap: { xs: "16px", md: "30px" } }}>
            {step === 0 && (
              <>
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: { xs: "column", sm: "row" },
                    gap: { xs: "16px", md: "30px" },
                  }}
                >
                  <TextField
                    label="Nombre"
                    name="nombre"
                    variant="outlined"
                    value={formData.nombre}
                    onChange={handleChange}
                    error={!!errors.nombre}
                    helperText={errors.nombre}
                    fullWidth
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Person sx={{ color: "#003087" }} />
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        "& fieldset": { borderColor: "rgba(0, 87, 183, 0.5)" },
                        "&:hover fieldset": { borderColor: "#0057b7" },
                        "&.Mui-focused fieldset": { borderColor: "#003087" },
                        backgroundColor: "rgba(255, 255, 255, 0.9)",
                        borderRadius: "10px",
                        transition: "all 0.3s ease",
                      },
                      "& .MuiInputBase-input": {
                        fontSize: { xs: "1rem", md: "1.2rem" },
                        padding: { xs: "12px 20px", md: "15px 25px" },
                      },
                      "& .MuiInputLabel-root": {
                        color: "#003087",
                        fontSize: { xs: "0.9rem", md: "1.1rem" },
                      },
                      "& .MuiInputLabel-root.Mui-focused": { color: "#0057b7" },
                      fontFamily: "'Poppins', sans-serif",
                    }}
                  />
                  <TextField
                    label="Apellido Paterno"
                    name="apellidoPaterno"
                    variant="outlined"
                    value={formData.apellidoPaterno}
                    onChange={handleChange}
                    error={!!errors.apellidoPaterno}
                    helperText={errors.apellidoPaterno}
                    fullWidth
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Person sx={{ color: "#003087" }} />
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        "& fieldset": { borderColor: "rgba(0, 87, 183, 0.5)" },
                        "&:hover fieldset": { borderColor: "#0057b7" },
                        "&.Mui-focused fieldset": { borderColor: "#003087" },
                        backgroundColor: "rgba(255, 255, 255, 0.9)",
                        borderRadius: "10px",
                        transition: "all 0.3s ease",
                      },
                      "& .MuiInputBase-input": {
                        fontSize: { xs: "1rem", md: "1.2rem" },
                        padding: { xs: "12px 20px", md: "15px 25px" },
                      },
                      "& .MuiInputLabel-root": {
                        color: "#003087",
                        fontSize: { xs: "0.9rem", md: "1.1rem" },
                      },
                      "& .MuiInputLabel-root.Mui-focused": { color: "#0057b7" },
                      fontFamily: "'Poppins', sans-serif",
                    }}
                  />
                </Box>
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: { xs: "column", sm: "row" },
                    gap: { xs: "16px", md: "30px" },
                  }}
                >
                  <TextField
                    label="Apellido Materno"
                    name="apellidoMaterno"
                    variant="outlined"
                    value={formData.apellidoMaterno}
                    onChange={handleChange}
                    error={!!errors.apellidoMaterno}
                    helperText={errors.apellidoMaterno}
                    fullWidth
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Person sx={{ color: "#003087" }} />
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        "& fieldset": { borderColor: "rgba(0, 87, 183, 0.5)" },
                        "&:hover fieldset": { borderColor: "#0057b7" },
                        "&.Mui-focused fieldset": { borderColor: "#003087" },
                        backgroundColor: "rgba(255, 255, 255, 0.9)",
                        borderRadius: "10px",
                        transition: "all 0.3s ease",
                      },
                      "& .MuiInputBase-input": {
                        fontSize: { xs: "1rem", md: "1.2rem" },
                        padding: { xs: "12px 20px", md: "15px 25px" },
                      },
                      "& .MuiInputLabel-root": {
                        color: "#003087",
                        fontSize: { xs: "0.9rem", md: "1.1rem" },
                      },
                      "& .MuiInputLabel-root.Mui-focused": { color: "#0057b7" },
                      fontFamily: "'Poppins', sans-serif",
                    }}
                  />
                  <TextField
                    label="Fecha de Nacimiento"
                    name="fechaNacimiento"
                    type="date"
                    variant="outlined"
                    InputLabelProps={{ shrink: true }}
                    value={formData.fechaNacimiento}
                    onChange={handleChange}
                    error={!!errors.fechaNacimiento}
                    helperText={errors.fechaNacimiento}
                    fullWidth
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <CalendarToday sx={{ color: "#003087" }} />
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        "& fieldset": { borderColor: "rgba(0, 87, 183, 0.5)" },
                        "&:hover fieldset": { borderColor: "#0057b7" },
                        "&.Mui-focused fieldset": { borderColor: "#003087" },
                        backgroundColor: "rgba(255, 255, 255, 0.9)",
                        borderRadius: "10px",
                        transition: "all 0.3s ease",
                      },
                      "& .MuiInputBase-input": {
                        fontSize: { xs: "1rem", md: "1.2rem" },
                        padding: { xs: "12px 20px", md: "15px 25px" },
                      },
                      "& .MuiInputLabel-root": {
                        color: "#003087",
                        fontSize: { xs: "0.9rem", md: "1.1rem" },
                      },
                      "& .MuiInputLabel-root.Mui-focused": { color: "#0057b7" },
                      fontFamily: "'Poppins', sans-serif",
                    }}
                  />
                </Box>
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: { xs: "column", sm: "row" },
                    gap: { xs: "16px", md: "30px" },
                  }}
                >
                  <TextField
                    label="Género"
                    name="genero"
                    select
                    variant="outlined"
                    value={formData.genero}
                    onChange={handleChange}
                    error={!!errors.genero}
                    helperText={errors.genero}
                    fullWidth
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Person sx={{ color: "#003087" }} />
                        </InputAdornment>
                      ),
                    }}
                    SelectProps={{
                      MenuProps: {
                        PaperProps: {
                          sx: {
                            backgroundColor: "rgba(255, 255, 255, 0.95)",
                            borderRadius: "10px",
                            boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.2)",
                            border: "1px solid rgba(255, 255, 255, 0.18)",
                            maxHeight: "300px",
                            "& .MuiMenuItem-root": {
                              fontFamily: "'Poppins', sans-serif",
                              fontSize: { xs: "1rem", md: "1.2rem" },
                              color: "#003087",
                              padding: { xs: "10px 20px", md: "15px 25px" },
                              transition: "all 0.3s ease",
                              "&:hover": {
                                backgroundColor: "rgba(0, 87, 183, 0.1)",
                                color: "#0057b7",
                              },
                              "&.Mui-selected": {
                                backgroundColor: "rgba(0, 87, 183, 0.2)",
                                color: "#003087",
                                fontWeight: "bold",
                                "&:hover": {
                                  backgroundColor: "rgba(0, 87, 183, 0.3)",
                                },
                              },
                            },
                          },
                        },
                      },
                    }}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        "& fieldset": { borderColor: "rgba(0, 87, 183, 0.5)" },
                        "&:hover fieldset": { borderColor: "#0057b7" },
                        "&.Mui-focused fieldset": { borderColor: "#003087" },
                        backgroundColor: "rgba(255, 255, 255, 0.9)",
                        borderRadius: "10px",
                        transition: "all 0.3s ease",
                      },
                      "& .MuiInputBase-input": {
                        fontSize: { xs: "1rem", md: "1.2rem" },
                        padding: { xs: "12px 20px", md: "15px 25px" },
                      },
                      "& .MuiInputLabel-root": {
                        color: "#003087",
                        fontSize: { xs: "0.9rem", md: "1.1rem" },
                      },
                      "& .MuiInputLabel-root.Mui-focused": { color: "#0057b7" },
                      fontFamily: "'Poppins', sans-serif",
                    }}
                  >
                    <MenuItem value="Masculino">Masculino</MenuItem>
                    <MenuItem value="Femenino">Femenino</MenuItem>
                    <MenuItem value="Otro">Otro</MenuItem>
                  </TextField>
                  <TextField
                    label="Teléfono"
                    name="telefono"
                    type="tel"
                    variant="outlined"
                    value={formData.telefono}
                    onChange={handleChange}
                    error={!!errors.telefono}
                    helperText={errors.telefono}
                    fullWidth
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Phone sx={{ color: "#003087" }} />
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        "& fieldset": { borderColor: "rgba(0, 87, 183, 0.5)" },
                        "&:hover fieldset": { borderColor: "#0057b7" },
                        "&.Mui-focused fieldset": { borderColor: "#003087" },
                        backgroundColor: "rgba(255, 255, 255, 0.9)",
                        borderRadius: "10px",
                        transition: "all 0.3s ease",
                      },
                      "& .MuiInputBase-input": {
                        fontSize: { xs: "1rem", md: "1.2rem" },
                        padding: { xs: "12px 20px", md: "15px 25px" },
                      },
                      "& .MuiInputLabel-root": {
                        color: "#003087",
                        fontSize: { xs: "0.9rem", md: "1.1rem" },
                      },
                      "& .MuiInputLabel-root.Mui-focused": { color: "#0057b7" },
                      fontFamily: "'Poppins', sans-serif",
                    }}
                  />
                </Box>
              </>
            )}

            {step === 1 && (
              <>
                <TextField
                  label="Correo Electrónico"
                  name="correo"
                  type="email"
                  variant="outlined"
                  value={formData.correo}
                  onChange={handleChange}
                  error={!!errors.correo}
                  helperText={errors.correo}
                  fullWidth
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Email sx={{ color: "#003087" }} />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      "& fieldset": { borderColor: "rgba(0, 87, 183, 0.5)" },
                      "&:hover fieldset": { borderColor: "#0057b7" },
                      "&.Mui-focused fieldset": { borderColor: "#003087" },
                      backgroundColor: "rgba(255, 255, 255, 0.9)",
                      borderRadius: "10px",
                      transition: "all 0.3s ease",
                    },
                    "& .MuiInputBase-input": {
                      fontSize: { xs: "1rem", md: "1.2rem" },
                      padding: { xs: "12px 20px", md: "15px 25px" },
                    },
                    "& .MuiInputLabel-root": {
                      color: "#003087",
                      fontSize: { xs: "0.9rem", md: "1.1rem" },
                    },
                    "& .MuiInputLabel-root.Mui-focused": { color: "#0057b7" },
                    fontFamily: "'Poppins', sans-serif",
                  }}
                />
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: { xs: "column", sm: "row" },
                    gap: { xs: "16px", md: "30px" },
                  }}
                >
                  <TextField
                    label="Contraseña"
                    name="contrasena"
                    type={showPassword ? "text" : "password"}
                    variant="outlined"
                    value={formData.contrasena}
                    onChange={handleChange}
                    error={!!errors.contrasena}
                    helperText={errors.contrasena}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Lock sx={{ color: "#003087" }} />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton onClick={togglePasswordVisibility}>
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                    fullWidth
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        "& fieldset": { borderColor: "rgba(0, 87, 183, 0.5)" },
                        "&:hover fieldset": { borderColor: "#0057b7" },
                        "&.Mui-focused fieldset": { borderColor: "#003087" },
                        backgroundColor: "rgba(255, 255, 255, 0.9)",
                        borderRadius: "10px",
                        transition: "all 0.3s ease",
                      },
                      "& .MuiInputBase-input": {
                        fontSize: { xs: "1rem", md: "1.2rem" },
                        padding: { xs: "12px 20px", md: "15px 25px" },
                      },
                      "& .MuiInputLabel-root": {
                        color: "#003087",
                        fontSize: { xs: "0.9rem", md: "1.1rem" },
                      },
                      "& .MuiInputLabel-root.Mui-focused": { color: "#0057b7" },
                      fontFamily: "'Poppins', sans-serif",
                    }}
                  />
                  <TextField
                    label="Repetir Contraseña"
                    name="repetirContrasena"
                    type={showRepeatPassword ? "text" : "password"}
                    variant="outlined"
                    value={formData.repetirContrasena}
                    onChange={handleChange}
                    error={!!errors.repetirContrasena}
                    helperText={errors.repetirContrasena}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Lock sx={{ color: "#003087" }} />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton onClick={toggleRepeatPasswordVisibility}>
                            {showRepeatPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                    fullWidth
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        "& fieldset": { borderColor: "rgba(0, 87, 183, 0.5)" },
                        "&:hover fieldset": { borderColor: "#0057b7" },
                        "&.Mui-focused fieldset": { borderColor: "#003087" },
                        backgroundColor: "rgba(255, 255, 255, 0.9)",
                        borderRadius: "10px",
                        transition: "all 0.3s ease",
                      },
                      "& .MuiInputBase-input": {
                        fontSize: { xs: "1rem", md: "1.2rem" },
                        padding: { xs: "12px 20px", md: "15px 25px" },
                      },
                      "& .MuiInputLabel-root": {
                        color: "#003087",
                        fontSize: { xs: "0.9rem", md: "1.1rem" },
                      },
                      "& .MuiInputLabel-root.Mui-focused": { color: "#0057b7" },
                      fontFamily: "'Poppins', sans-serif",
                    }}
                  />
                </Box>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 1, marginTop: 2 }}>
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: "bold",
                      color:
                        passwordStrength.score < 2
                          ? "#d32f2f"
                          : passwordStrength.score < 4
                            ? "#ff9800"
                            : "#4caf50",
                      fontFamily: "'Poppins', sans-serif",
                      fontSize: { xs: "1rem", md: "1.25rem" },
                    }}
                  >
                    Fortaleza: {passwordStrength.level}
                  </Typography>
                  <Box sx={{ display: "flex", gap: 1 }}>
                    {[0, 1, 2, 3, 4].map((i) => (
                      <Box
                        key={i}
                        sx={{
                          height: "12px",
                          flex: 1,
                          borderRadius: "4px",
                          backgroundColor:
                            i <= passwordStrength.score
                              ? passwordStrength.score < 2
                                ? "#d32f2f"
                                : passwordStrength.score < 4
                                  ? "#ff9800"
                                  : "#4caf50"
                              : "#e0e0e0",
                          transition: "background-color 0.3s",
                        }}
                      />
                    ))}
                  </Box>
                  <Typography
                    variant="body1"
                    color="textSecondary"
                    fontFamily="'Poppins', sans-serif"
                    sx={{ fontSize: { xs: "0.8rem", md: "1rem" } }}
                  >
                    {passwordStrength.suggestions}
                  </Typography>
                </Box>
              </>
            )}

            {step === 2 && (
              <TextField
                label="Código de Verificación"
                name="codigoVerificacion"
                variant="outlined"
                value={formData.codigoVerificacion}
                onChange={handleChange}
                error={!!errors.codigoVerificacion}
                helperText={errors.codigoVerificacion}
                fullWidth
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <CheckCircle sx={{ color: "#003087" }} /> {/* Corregido aquí */}
                    </InputAdornment>
                  ),
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    "& fieldset": { borderColor: "rgba(0, 87, 183, 0.5)" },
                    "&:hover fieldset": { borderColor: "#0057b7" },
                    "&.Mui-focused fieldset": { borderColor: "#003087" },
                    backgroundColor: "rgba(255, 255, 255, 0.9)",
                    borderRadius: "10px",
                    transition: "all 0.3s ease",
                  },
                  "& .MuiInputBase-input": {
                    fontSize: { xs: "1rem", md: "1.2rem" },
                    padding: { xs: "12px 20px", md: "15px 25px" },
                  },
                  "& .MuiInputLabel-root": {
                    color: "#003087",
                    fontSize: { xs: "0.9rem", md: "1.1rem" },
                  },
                  "& .MuiInputLabel-root.Mui-focused": { color: "#0057b7" },
                  fontFamily: "'Poppins', sans-serif",
                }}
              />
            )}
          </Box>

          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", sm: "row" },
              justifyContent: "space-between",
              marginTop: { xs: "16px", md: "40px" },
              gap: { xs: "16px", sm: "0" },
            }}
          >
            <Button
              variant="outlined"
              onClick={handleBack}
              disabled={step === 0}
              startIcon={<ArrowBack />}
              sx={{
                borderRadius: "12px",
                padding: { xs: "10px 20px", md: "15px 40px" },
                textTransform: "none",
                fontSize: { xs: "1rem", md: "1.2rem" },
                color: "#003087",
                borderColor: "#003087",
                fontFamily: "'Poppins', sans-serif",
                "&:hover": {
                  borderColor: "#0057b7",
                  backgroundColor: "rgba(0, 87, 183, 0.04)",
                },
                width: { xs: "100%", sm: "auto" },
              }}
            >
              Atrás
            </Button>
            <Button
              variant="contained"
              onClick={handleNext}
              disabled={!validateStep()}
              startIcon={step === steps.length - 1 ? <CheckCircle /> : <ArrowForward />}
              sx={{
                background: "linear-gradient(135deg, #003087 0%, #0057b7 100%)",
                borderRadius: "12px",
                padding: { xs: "10px 20px", md: "15px 40px" },
                textTransform: "none",
                fontSize: { xs: "1rem", md: "1.2rem" },
                fontFamily: "'Poppins', sans-serif",
                fontWeight: 600,
                transition: "all 0.3s ease",
                "&:hover": {
                  background: "linear-gradient(135deg, #0057b7 0%, #003087 100%)",
                  boxShadow: "0 4px 15px rgba(0, 87, 183, 0.4)",
                  transform: "translateY(-2px)",
                },
                width: { xs: "100%", sm: "auto" },
              }}
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
        <Alert
          onClose={handleCloseAlert}
          severity={alert.severity}
          sx={{ borderRadius: "12px", boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)" }}
        >
          {alert.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Registro;