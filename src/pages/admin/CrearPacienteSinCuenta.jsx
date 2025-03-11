import React, { useState } from "react";
import {
  Container,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  CircularProgress,
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
        const csrfToken = obtenerTokenCSRF(); // 🔹 Obtener el token CSRF

        const response = await axios.post(
          "http://localhost:4000/api/pacientes-sin-plataforma/registrar",
          values,
          {
          headers: {
            "X-XSRF-TOKEN": csrfToken, // 🔹 Agregar token CSRF en headers
            "Content-Type": "application/json",
          },
          withCredentials: true, // 🔹 Asegurar que las cookies sean enviadas
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
    <Container component={motion.div} 
      initial={{ opacity: 0, y: 50 }} 
      animate={{ opacity: 1, y: 0 }} 
      exit={{ opacity: 0, y: -50 }} 
      transition={{ duration: 0.5 }}
      maxWidth="sm"
      sx={{ mt: 5, p: 3, bgcolor: "background.paper", borderRadius: 2, boxShadow: 3 }}
    >
      <Typography variant="h5" align="center" gutterBottom>
        Registrar Paciente sin Cuenta
      </Typography>

      {mensaje && <Alert severity={mensaje.tipo} sx={{ mb: 2 }}>{mensaje.texto}</Alert>}

      <form onSubmit={formik.handleSubmit}>
        <TextField
          fullWidth
          label="Nombre"
          margin="normal"
          {...formik.getFieldProps("nombre")}
          error={formik.touched.nombre && Boolean(formik.errors.nombre)}
          helperText={formik.touched.nombre && formik.errors.nombre}
        />
        <TextField
          fullWidth
          label="Apellido Paterno"
          margin="normal"
          {...formik.getFieldProps("apellido_paterno")}
          error={formik.touched.apellido_paterno && Boolean(formik.errors.apellido_paterno)}
          helperText={formik.touched.apellido_paterno && formik.errors.apellido_paterno}
        />
        <TextField
          fullWidth
          label="Apellido Materno"
          margin="normal"
          {...formik.getFieldProps("apellido_materno")}
          error={formik.touched.apellido_materno && Boolean(formik.errors.apellido_materno)}
          helperText={formik.touched.apellido_materno && formik.errors.apellido_materno}
        />
        <TextField
          fullWidth
          label="Teléfono"
          margin="normal"
          {...formik.getFieldProps("telefono")}
          error={formik.touched.telefono && Boolean(formik.errors.telefono)}
          helperText={formik.touched.telefono && formik.errors.telefono}
        />
        <TextField
          fullWidth
          label="Fecha de Nacimiento"
          type="date"
          margin="normal"
          InputLabelProps={{ shrink: true }}
          {...formik.getFieldProps("fecha_nacimiento")}
          error={formik.touched.fecha_nacimiento && Boolean(formik.errors.fecha_nacimiento)}
          helperText={formik.touched.fecha_nacimiento && formik.errors.fecha_nacimiento}
        />
        <TextField
          fullWidth
          label="Sexo (M/F)"
          margin="normal"
          {...formik.getFieldProps("sexo")}
          error={formik.touched.sexo && Boolean(formik.errors.sexo)}
          helperText={formik.touched.sexo && formik.errors.sexo}
        />
        <TextField
          fullWidth
          label="Correo Electrónico"
          type="email"
          margin="normal"
          {...formik.getFieldProps("email")}
          error={formik.touched.email && Boolean(formik.errors.email)}
          helperText={formik.touched.email && formik.errors.email}
        />

        <Box mt={3} textAlign="center">
          <Button
            type="submit"
            variant="contained"
            color="primary"
            sx={{ width: "100%", py: 1.5 }}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : "Registrar Paciente"}
          </Button>
        </Box>
      </form>
    </Container>
  );
};

export default CrearPacienteSinCuenta;
