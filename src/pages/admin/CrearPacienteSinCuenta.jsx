import React, { useState, useEffect } from "react";
import {
  Container,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  CircularProgress,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import { motion } from "framer-motion";
import { useFormik } from "formik";
import * as Yup from "yup";
import axios from "axios";
import {
  validateName,
  validatePhoneNumber,
  validateEmail,
} from "../../utils/validations";

// Esquema de validación con Yup
const validationSchema = Yup.object({
  nombre: Yup.string()
    .required("El nombre es obligatorio")
    .test("name-validation", "", (value) => !validateName(value)),
  apellido_paterno: Yup.string()
    .required("El apellido paterno es obligatorio")
    .test("name-validation", "", (value) => !validateName(value)),
  apellido_materno: Yup.string()
    .required("El apellido materno es obligatorio")
    .test("name-validation", "", (value) => !validateName(value)),
  telefono: Yup.string()
    .required("El teléfono es obligatorio")
    .test("phone-validation", "", (value) => !validatePhoneNumber(value)),
  fecha_nacimiento: Yup.date()
    .required("La fecha de nacimiento es obligatoria")
    .test("age-validation", "La edad debe estar entre 0 y 100 años", (value) => {
      if (!value) return false;
      const today = new Date();
      const birthDate = new Date(value);
      const age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      const dayDiff = today.getDate() - birthDate.getDate();
      let adjustedAge = age;
      if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
        adjustedAge = age - 1;
      }
      return adjustedAge > 0 && adjustedAge < 100;
    }),
  sexo: Yup.string()
    .oneOf(["M", "F"], "Debe seleccionar 'M' o 'F'")
    .required("El sexo es obligatorio"),
  email: Yup.string()
    .nullable()
    .test("email-validation", "El correo no es válido", (value) => {
      if (!value) return true;
      return !validateEmail(value);
    }),
});

// Paleta de colores
const primaryColor = "#006d77";
const secondaryColor = "#78c1c8";
const accentColor = "#e8f4f8";
const bgGradient = "linear-gradient(135deg, #e8f4f8 0%, #ffffff 100%)";
const textColor = "#1a3c40";

const CrearPacienteSinCuenta = () => {
  const [mensaje, setMensaje] = useState(null);
  const [loading, setLoading] = useState(false);
  const [csrfToken, setCsrfToken] = useState(null);

  useEffect(() => {
    const obtenerTokenCSRF = async () => {
      try {
        const response = await fetch("http://localhost:4000/api/get-csrf-token", {
          credentials: "include",
        });
        const data = await response.json();
        setCsrfToken(data.csrfToken);
      } catch (error) {
        console.error("Error obteniendo el token CSRF:", error);
        setMensaje({ tipo: "error", texto: "Error al obtener el token CSRF" });
        setTimeout(() => setMensaje(null), 3000);
      }
    };
    obtenerTokenCSRF();
  }, []);

  const formik = useFormik({
    initialValues: {
      nombre: "",
      apellido_paterno: "",
      apellido_materno: "",
      telefono: "",
      fecha_nacimiento: "",
      sexo: "",
      email: "",
    },
    validationSchema: validationSchema,
    validateOnChange: true,
    validateOnBlur: true,
    onSubmit: async (values, { resetForm }) => {
      setLoading(true);
      try {
        const fechaActual = new Date();
        console.log("Fecha actual del sistema (sin ajustar):", fechaActual.toISOString());

        const fechaLocalString = fechaActual.toLocaleString("en-US", { timeZone: "America/Mexico_City" });
        const fechaLocal = new Date(fechaLocalString);
        console.log("Fecha ajustada a America/Mexico_City:", fechaLocal.toISOString());
        console.log("Fecha ajustada en formato legible (America/Mexico_City):", fechaLocal.toLocaleString("es-MX"));

        const year = fechaLocal.getFullYear();
        const month = (fechaLocal.getMonth() + 1).toString().padStart(2, "0");
        const day = fechaLocal.getDate().toString().padStart(2, "0");
        const hours = fechaLocal.getHours().toString().padStart(2, "0");
        const minutes = fechaLocal.getMinutes().toString().padStart(2, "0");
        const seconds = fechaLocal.getSeconds().toString().padStart(2, "0");
        const fechaFormateadaLocal = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
        console.log("Fecha formateada para enviar (hora local, formato YYYY-MM-DD HH:mm:ss):", fechaFormateadaLocal);

        const datosPaciente = {
          ...values,
          fecha_registro: fechaFormateadaLocal,
        };
        console.log("Datos completos que se envían al servidor:", datosPaciente);

        const response = await axios.post(
          "http://localhost:4000/api/pacientes-sin-plataforma/registrar",
          datosPaciente,
          {
            headers: {
              "X-XSRF-TOKEN": csrfToken,
              "Content-Type": "application/json",
            },
            withCredentials: true,
          }
        );

        console.log("Estado de la respuesta del servidor:", response.status);
        console.log("Respuesta completa del servidor:", response.data);

        setMensaje({ tipo: "success", texto: response.data.mensaje });
        resetForm();
        setTimeout(() => setMensaje(null), 3000);
      } catch (error) {
        console.error("Error al registrar paciente:", error);
        const errorMessage = error.response?.data?.mensaje || "Error al registrar paciente";
        setMensaje({
          tipo: "error",
          texto: errorMessage,
        });
        setTimeout(() => setMensaje(null), 3000);
      } finally {
        setLoading(false);
      }
    },
  });

  const inputStyle = {
    "& .MuiOutlinedInput-root": {
      transition: "all 0.3s ease-in-out",
      "&:hover fieldset": { borderColor: secondaryColor },
      "&.Mui-focused fieldset": { borderColor: primaryColor, borderWidth: "2px" },
      borderRadius: "16px",
      backgroundColor: "#fff",
      boxShadow: "0 2px 8px rgba(0, 109, 119, 0.05)",
      height: "60px",
    },
    "& .MuiInputLabel-root": {
      color: textColor,
      fontFamily: "'Poppins', sans-serif",
      fontWeight: 500,
      "&.Mui-focused": { color: primaryColor },
    },
    "& .MuiInputBase-input": {
      fontFamily: "'Poppins', sans-serif",
      color: textColor,
      fontSize: "1rem",
    },
  };

  const fieldVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.1, duration: 0.5, ease: "easeOut" },
    }),
  };

  const buttonVariants = {
    hover: { scale: 1.05 },
    tap: { scale: 0.95 },
  };

  const alertVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
    exit: { opacity: 0, y: 50, transition: { duration: 0.5, ease: "easeIn" } },
  };

  const getErrorMessage = (fieldName) => {
    const value = formik.values[fieldName];
    if (!value) return formik.touched[fieldName] && formik.errors[fieldName];
    switch (fieldName) {
      case "nombre":
      case "apellido_paterno":
      case "apellido_materno":
        return validateName(value);
      case "telefono":
        return validatePhoneNumber(value);
      case "email":
        return validateEmail(value);
      case "fecha_nacimiento":
        return formik.touched[fieldName] && formik.errors[fieldName];
      default:
        return formik.touched[fieldName] && formik.errors[fieldName];
    }
  };

  return (
    <Container
      component={motion.div}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.7, ease: "easeOut" }}
      maxWidth="lg"
      sx={{
        mt: 6,
        p: 5,
        background: bgGradient,
        borderRadius: "24px",
        boxShadow: "0 10px 40px rgba(0, 109, 119, 0.1)",
        border: `1px solid ${accentColor}`,
        fontFamily: "'Poppins', sans-serif",
        transition: "all 0.3s ease-in-out",
        "&:hover": { boxShadow: "0 15px 50px rgba(0, 109, 119, 0.15)" },
      }}
    >
      <Typography
        variant="h5"
        align="center"
        component={motion.div}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        sx={{
          fontWeight: 700,
          color: primaryColor,
          mb: 5,
          letterSpacing: "2px",
          textTransform: "uppercase",
          fontSize: "1.75rem",
          fontFamily: "'Poppins', sans-serif",
          textShadow: "0 2px 4px rgba(0, 109, 119, 0.1)",
        }}
      >
        Registrar Paciente sin Cuenta
      </Typography>

      <form onSubmit={formik.handleSubmit}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <motion.div custom={0} initial="hidden" animate="visible" variants={fieldVariants}>
              <TextField
                fullWidth
                label="Nombre"
                {...formik.getFieldProps("nombre")}
                error={Boolean(getErrorMessage("nombre"))}
                helperText={getErrorMessage("nombre")}
                sx={inputStyle}
              />
            </motion.div>
          </Grid>
          <Grid item xs={12} md={6}>
            <motion.div custom={1} initial="hidden" animate="visible" variants={fieldVariants}>
              <TextField
                fullWidth
                label="Apellido Paterno"
                {...formik.getFieldProps("apellido_paterno")}
                error={Boolean(getErrorMessage("apellido_paterno"))}
                helperText={getErrorMessage("apellido_paterno")}
                sx={inputStyle}
              />
            </motion.div>
          </Grid>
          <Grid item xs={12} md={6}>
            <motion.div custom={2} initial="hidden" animate="visible" variants={fieldVariants}>
              <TextField
                fullWidth
                label="Apellido Materno"
                {...formik.getFieldProps("apellido_materno")}
                error={Boolean(getErrorMessage("apellido_materno"))}
                helperText={getErrorMessage("apellido_materno")}
                sx={inputStyle}
              />
            </motion.div>
          </Grid>
          <Grid item xs={12} md={6}>
            <motion.div custom={3} initial="hidden" animate="visible" variants={fieldVariants}>
              <TextField
                fullWidth
                label="Teléfono"
                {...formik.getFieldProps("telefono")}
                error={Boolean(getErrorMessage("telefono"))}
                helperText={getErrorMessage("telefono")}
                sx={inputStyle}
              />
            </motion.div>
          </Grid>
          <Grid item xs={12} md={6}>
            <motion.div custom={4} initial="hidden" animate="visible" variants={fieldVariants}>
              <TextField
                fullWidth
                label="Fecha de Nacimiento"
                type="date"
                InputLabelProps={{ shrink: true }}
                {...formik.getFieldProps("fecha_nacimiento")}
                error={Boolean(getErrorMessage("fecha_nacimiento"))}
                helperText={getErrorMessage("fecha_nacimiento")}
                sx={inputStyle}
              />
            </motion.div>
          </Grid>
          <Grid item xs={12} md={6}>
            <motion.div custom={5} initial="hidden" animate="visible" variants={fieldVariants}>
              <FormControl fullWidth>
                <InputLabel sx={{ fontFamily: "'Poppins', sans-serif", color: textColor }}>
                  Sexo
                </InputLabel>
                <Select
                  value={formik.values.sexo}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  name="sexo"
                  error={formik.touched.sexo && Boolean(formik.errors.sexo)}
                  sx={{
                    ...inputStyle,
                    "& .MuiSelect-select": { padding: "16px" },
                  }}
                >
                  <MenuItem value="M" sx={{ fontFamily: "'Poppins', sans-serif" }}>
                    Masculino (M)
                  </MenuItem>
                  <MenuItem value="F" sx={{ fontFamily: "'Poppins', sans-serif" }}>
                    Femenino (F)
                  </MenuItem>
                </Select>
                {formik.touched.sexo && formik.errors.sexo && (
                  <Typography
                    color="error"
                    variant="caption"
                    sx={{ fontFamily: "'Poppins', sans-serif", mt: 1 }}
                  >
                    {formik.errors.sexo}
                  </Typography>
                )}
              </FormControl>
            </motion.div>
          </Grid>
          <Grid item xs={12}>
            <motion.div custom={6} initial="hidden" animate="visible" variants={fieldVariants}>
              <TextField
                fullWidth
                label="Correo Electrónico (Opcional)"
                type="email"
                {...formik.getFieldProps("email")}
                error={Boolean(getErrorMessage("email"))}
                helperText={getErrorMessage("email")}
                sx={inputStyle}
              />
            </motion.div>
          </Grid>
        </Grid>

        <motion.div
          variants={buttonVariants}
          whileHover="hover"
          whileTap="tap"
          style={{ display: "flex", justifyContent: "center", marginTop: "2.5rem" }}
        >
          <Button
            type="submit"
            variant="contained"
            sx={{
              backgroundColor: primaryColor,
              color: "#ffffff",
              fontWeight: 600,
              padding: "14px 50px",
              borderRadius: "16px",
              fontFamily: "'Poppins', sans-serif",
              fontSize: "1.1rem",
              textTransform: "none",
              boxShadow: "0 4px 15px rgba(0, 109, 119, 0.2)",
              transition: "all 0.3s ease-in-out",
              "&:hover": {
                backgroundColor: secondaryColor,
                boxShadow: "0 6px 20px rgba(0, 109, 119, 0.3)",
                transform: "scale(1.05)",
              },
              "&:active": {
                transform: "scale(0.95)",
              },
              "&:disabled": {
                backgroundColor: "#b0bec5",
                color: "#78909c",
                boxShadow: "none",
              },
            }}
            disabled={loading}
          >
            {loading ? (
              <CircularProgress size={26} sx={{ color: "#ffffff" }} />
            ) : (
              "Registrar Paciente"
            )}
          </Button>
        </motion.div>
      </form>

      {mensaje && (
        <Box sx={{ position: "fixed", bottom: 30, left: 30, zIndex: 2000 }}>
          <motion.div
            variants={alertVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <Alert
              severity={mensaje.tipo}
              variant="filled"
              sx={{
                minWidth: "300px",
                backgroundColor:
                  mensaje.tipo === "success"
                    ? "#C8E6C9"
                    : mensaje.tipo === "error"
                    ? "#FFCDD2"
                    : mensaje.tipo === "warning"
                    ? "#FFE082"
                    : "#B3E5FC",
                color: textColor,
                fontFamily: "'Poppins', sans-serif",
                borderRadius: "12px",
                boxShadow: "0 4px 15px rgba(0, 0, 0, 0.1)",
                padding: "10px 20px",
              }}
              onClose={() => setMensaje(null)}
            >
              {mensaje.texto}
            </Alert>
          </motion.div>
        </Box>
      )}
    </Container>
  );
};

export default CrearPacienteSinCuenta;