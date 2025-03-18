import React, { useState } from "react";
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

// Esquema de validación con Yup
const validationSchema = Yup.object({
  nombre: Yup.string().required("El nombre es obligatorio"),
  apellido_paterno: Yup.string().required("El apellido paterno es obligatorio"),
  apellido_materno: Yup.string().required("El apellido materno es obligatorio"),
  telefono: Yup.string()
    .matches(/^\d{10}$/, "Debe ser un número de 10 dígitos")
    .required("El teléfono es obligatorio"),
  fecha_nacimiento: Yup.date().required("La fecha de nacimiento es obligatoria"),
  sexo: Yup.string()
    .oneOf(["M", "F"], "Debe seleccionar 'M' o 'F'")
    .required("El sexo es obligatorio"),
  email: Yup.string().email("Correo inválido").required("El correo es obligatorio"),
});

const CrearPacienteSinCuenta = () => {
  const [mensaje, setMensaje] = useState(null);
  const [loading, setLoading] = useState(false);

  const obtenerTokenCSRF = () => {
    return document.cookie
      .split("; ")
      .find((row) => row.startsWith("XSRF-TOKEN="))
      ?.split("=")[1];
  };

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
    onSubmit: async (values, { resetForm }) => {
      setLoading(true);
      try {
        const csrfToken = obtenerTokenCSRF();

        const response = await axios.post(
          "http://localhost:4000/api/pacientes-sin-plataforma/registrar",
          values,
          {
            headers: {
              "X-XSRF-TOKEN": csrfToken,
              "Content-Type": "application/json",
            },
            withCredentials: true,
          }
        );
        setMensaje({ tipo: "success", texto: response.data.mensaje });
        resetForm();
      } catch (error) {
        setMensaje({
          tipo: "error",
          texto: error.response?.data?.mensaje || "Error al registrar paciente",
        });
      } finally {
        setLoading(false);
      }
    },
  });

  return (
    <Container
      component={motion.div}
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -50 }}
      transition={{ duration: 0.5 }}
      maxWidth="md"
      sx={{
        mt: 5,
        p: 4,
        bgcolor: "#ffffff",
        borderRadius: 2,
        boxShadow: "0 6px 24px rgba(0, 0, 0, 0.08)", // Consistente con TratamientosEnCurso
        border: "1px solid #78c1c8", // Consistente con TratamientosEnCurso
        fontFamily: "'Poppins', sans-serif",
      }}
    >
      <Typography
        variant="h5"
        align="center"
        gutterBottom
        sx={{ color: "#006d77", fontWeight: "bold", mb: 3 }}
      >
        Registrar Paciente sin Cuenta
      </Typography>

      {mensaje && (
        <Alert severity={mensaje.tipo} sx={{ mb: 3, borderRadius: "10px" }}>
          {mensaje.texto}
        </Alert>
      )}

      <form onSubmit={formik.handleSubmit}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Nombre"
              margin="normal"
              {...formik.getFieldProps("nombre")}
              error={formik.touched.nombre && Boolean(formik.errors.nombre)}
              helperText={formik.touched.nombre && formik.errors.nombre}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: "12px",
                  "&:hover fieldset": { borderColor: "#78c1c8" },
                  "&.Mui-focused fieldset": { borderColor: "#006d77" },
                },
                "& .MuiInputLabel-root": {
                  color: "#03445e",
                  fontFamily: "'Poppins', sans-serif",
                },
                "& .MuiInputBase-input": { fontFamily: "'Poppins', sans-serif" },
              }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Apellido Paterno"
              margin="normal"
              {...formik.getFieldProps("apellido_paterno")}
              error={formik.touched.apellido_paterno && Boolean(formik.errors.apellido_paterno)}
              helperText={formik.touched.apellido_paterno && formik.errors.apellido_paterno}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: "12px",
                  "&:hover fieldset": { borderColor: "#78c1c8" },
                  "&.Mui-focused fieldset": { borderColor: "#006d77" },
                },
                "& .MuiInputLabel-root": {
                  color: "#03445e",
                  fontFamily: "'Poppins', sans-serif",
                },
                "& .MuiInputBase-input": { fontFamily: "'Poppins', sans-serif" },
              }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Apellido Materno"
              margin="normal"
              {...formik.getFieldProps("apellido_materno")}
              error={formik.touched.apellido_materno && Boolean(formik.errors.apellido_materno)}
              helperText={formik.touched.apellido_materno && formik.errors.apellido_materno}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: "12px",
                  "&:hover fieldset": { borderColor: "#78c1c8" },
                  "&.Mui-focused fieldset": { borderColor: "#006d77" },
                },
                "& .MuiInputLabel-root": {
                  color: "#03445e",
                  fontFamily: "'Poppins', sans-serif",
                },
                "& .MuiInputBase-input": { fontFamily: "'Poppins', sans-serif" },
              }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Teléfono"
              margin="normal"
              {...formik.getFieldProps("telefono")}
              error={formik.touched.telefono && Boolean(formik.errors.telefono)}
              helperText={formik.touched.telefono && formik.errors.telefono}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: "12px",
                  "&:hover fieldset": { borderColor: "#78c1c8" },
                  "&.Mui-focused fieldset": { borderColor: "#006d77" },
                },
                "& .MuiInputLabel-root": {
                  color: "#03445e",
                  fontFamily: "'Poppins', sans-serif",
                },
                "& .MuiInputBase-input": { fontFamily: "'Poppins', sans-serif" },
              }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Fecha de Nacimiento"
              type="date"
              margin="normal"
              InputLabelProps={{ shrink: true }}
              {...formik.getFieldProps("fecha_nacimiento")}
              error={formik.touched.fecha_nacimiento && Boolean(formik.errors.fecha_nacimiento)}
              helperText={formik.touched.fecha_nacimiento && formik.errors.fecha_nacimiento}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: "12px",
                  "&:hover fieldset": { borderColor: "#78c1c8" },
                  "&.Mui-focused fieldset": { borderColor: "#006d77" },
                },
                "& .MuiInputLabel-root": {
                  color: "#03445e",
                  fontFamily: "'Poppins', sans-serif",
                },
                "& .MuiInputBase-input": { fontFamily: "'Poppins', sans-serif" },
              }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth variant="outlined" margin="normal">
              <InputLabel
                sx={{
                  color: "#03445e",
                  fontFamily: "'Poppins', sans-serif",
                  "&.Mui-focused": { color: "#006d77" },
                }}
              >
                Sexo
              </InputLabel>
              <Select
                value={formik.values.sexo}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                name="sexo"
                error={formik.touched.sexo && Boolean(formik.errors.sexo)}
                sx={{
                  "& .MuiSelect-select": { fontFamily: "'Poppins', sans-serif" },
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "12px",
                    "&:hover fieldset": { borderColor: "#78c1c8" },
                    "&.Mui-focused fieldset": { borderColor: "#006d77" },
                  },
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
                <Typography color="error" variant="caption" sx={{ fontFamily: "'Poppins', sans-serif" }}>
                  {formik.errors.sexo}
                </Typography>
              )}
            </FormControl>
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Correo Electrónico"
              type="email"
              margin="normal"
              {...formik.getFieldProps("email")}
              error={formik.touched.email && Boolean(formik.errors.email)}
              helperText={formik.touched.email && formik.errors.email}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: "12px",
                  "&:hover fieldset": { borderColor: "#78c1c8" },
                  "&.Mui-focused fieldset": { borderColor: "#006d77" },
                },
                "& .MuiInputLabel-root": {
                  color: "#03445e",
                  fontFamily: "'Poppins', sans-serif",
                },
                "& .MuiInputBase-input": { fontFamily: "'Poppins', sans-serif" },
              }}
            />
          </Grid>
        </Grid>

        <Box mt={4} textAlign="center">
          <Button
            type="submit"
            variant="contained"
            sx={{
              background: "linear-gradient(90deg, #006d77 0%, #78c1c8 100%)", // Consistente con TratamientosEnCurso
              color: "#e0f7fa",
              width: "100%",
              py: 1.5,
              "&:hover": {
                background: "linear-gradient(90deg, #004d57 0%, #48cae4 100%)",
              },
              fontFamily: "'Poppins', sans-serif",
            }}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} sx={{ color: "#e0f7fa" }} /> : "Registrar Paciente"}
          </Button>
        </Box>
      </form>
    </Container>
  );
};

export default CrearPacienteSinCuenta;