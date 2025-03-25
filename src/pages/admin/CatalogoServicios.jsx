import React, { useState, useEffect } from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
  Card,
  CardContent,
  Grid,
  Divider,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Snackbar,
  Alert,
  IconButton,
} from "@mui/material";
import { CloudUpload, CheckCircle, Delete } from "@mui/icons-material";
import { motion } from "framer-motion";
import {
  validarNombre,
  validarDuracion,
  validarDescripcion,
  validarPrecio,
  validarCitasRequeridas,
} from "../../utils/validations";

// Paleta de colores
const primaryColor = "#006d77";
const secondaryColor = "#78c1c8";
const accentColor = "#e8f4f8";
const bgGradient = "linear-gradient(135deg, #e8f4f8 0%, #ffffff 100%)";
const textColor = "#1a3c40";

const CrearServicioOdontologia = () => {
  const [formulario, setFormulario] = useState({
    nombre: "",
    descripcion: "",
    duracion_minutos: "",
    precio: "",
    tipo_citas: "citas_requeridas",
    citas_requeridas: "",
    imagen: null,
  });

  const [errores, setErrores] = useState({});
  const [alerta, setAlerta] = useState({ open: false, message: "", severity: "error" });
  const [imagenPrevia, setImagenPrevia] = useState(null);
  const [csrfToken, setCsrfToken] = useState(null); // Nuevo estado para el token CSRF

  // Obtener el token CSRF al cargar el componente
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
        setAlerta({ open: true, message: "Error al obtener el token CSRF", severity: "error" });
      }
    };
    obtenerTokenCSRF();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormulario({
      ...formulario,
      [name]: value,
    });
    validarCampo(name, value);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) {
      setErrores({ ...errores, imagen: "Debe seleccionar una imagen" });
      setImagenPrevia(null);
      return;
    }

    if (!["image/jpeg", "image/png"].includes(file.type)) {
      setErrores({ ...errores, imagen: "La imagen debe ser en formato JPG o PNG" });
      setImagenPrevia(null);
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setErrores({ ...errores, imagen: "La imagen no debe superar los 2MB" });
      setImagenPrevia(null);
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setImagenPrevia(reader.result);
    };
    reader.readAsDataURL(file);

    setErrores({ ...errores, imagen: "" });
    setFormulario({
      ...formulario,
      imagen: file,
    });
  };

  const handleDeleteImage = () => {
    setFormulario({ ...formulario, imagen: null });
    setImagenPrevia(null);
    setErrores({ ...errores, imagen: "Debe subir una imagen" });
  };

  const validarCampo = (campo, valor) => {
    let mensajeError = "";

    switch (campo) {
      case "nombre":
        mensajeError = validarNombre(valor);
        break;
      case "duracion_minutos":
        mensajeError = validarDuracion(valor);
        break;
      case "descripcion":
        mensajeError = validarDescripcion(valor);
        break;
      case "precio":
        mensajeError = validarPrecio(valor);
        break;
      case "citas_requeridas":
        mensajeError = validarCitasRequeridas(valor);
        break;
      default:
        break;
    }

    setErrores({
      ...errores,
      [campo]: mensajeError,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const nuevosErrores = {
      nombre: validarNombre(formulario.nombre),
      descripcion: validarDescripcion(formulario.descripcion),
      duracion_minutos: validarDuracion(formulario.duracion_minutos),
      precio:
        formulario.tipo_citas === "requiere_evaluacion" ? "" : validarPrecio(formulario.precio),
      citas_requeridas:
        formulario.tipo_citas === "citas_requeridas"
          ? validarCitasRequeridas(formulario.citas_requeridas)
          : "",
      imagen: formulario.imagen ? "" : "Debe subir una imagen",
    };

    setErrores(nuevosErrores);

    const erroresFiltrados = Object.entries(nuevosErrores).filter(([_, error]) => error !== "");
    if (erroresFiltrados.length > 0) {
      const mensajesErrores = erroresFiltrados
        .map(([campo, error]) => `${campo}: ${error}`)
        .join("\n");
      setAlerta({
        open: true,
        message: `Corrija los siguientes errores:\n${mensajesErrores}`,
        severity: "error",
      });
      return;
    }

    try {
      const formData = new FormData();
      formData.append("nombre", formulario.nombre);
      formData.append("descripcion", formulario.descripcion);
      formData.append("duracion_minutos", formulario.duracion_minutos);
      formData.append(
        "precio",
        formulario.tipo_citas === "requiere_evaluacion" ? 0 : formulario.precio
      );
      formData.append("tipo_citas", formulario.tipo_citas);
      formData.append(
        "citas_requeridas",
        formulario.tipo_citas === "citas_requeridas" ? formulario.citas_requeridas : ""
      );
      formData.append("imagen", formulario.imagen);

      const response = await fetch("http://localhost:4000/api/tratamientos/crear", {
        method: "POST",
        body: formData,
        headers: { "X-XSRF-TOKEN": csrfToken }, // Usar el token del estado
        credentials: "include",
      });

      if (response.ok) {
        setAlerta({ open: true, message: "Servicio registrado con éxito", severity: "success" });
        setImagenPrevia(null);
      } else {
        const errorData = await response.json();
        setAlerta({
          open: true,
          message: errorData.message || "Error al registrar el servicio",
          severity: "error",
        });
      }
    } catch (error) {
      console.error("Error en la solicitud:", error);
      setAlerta({ open: true, message: "Error en la solicitud", severity: "error" });
    }

    setFormulario({
      nombre: "",
      descripcion: "",
      duracion_minutos: "",
      precio: "",
      tipo_citas: "citas_requeridas",
      citas_requeridas: "",
      imagen: null,
    });
  };

  const cerrarAlerta = () => {
    setAlerta({ ...alerta, open: false });
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

  return (
    <Box
      sx={{
        maxWidth: "lg",
        margin: "2rem auto",
        padding: "1rem",
      }}
    >
      <Card
        component={motion.div}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        sx={{
          boxShadow: 10,
          borderRadius: "24px",
          padding: "2.5rem",
          background: bgGradient,
          border: `1px solid ${accentColor}`,
          transition: "all 0.3s ease-in-out",
          "&:hover": { boxShadow: "0 15px 50px rgba(0, 109, 119, 0.15)" },
        }}
      >
        <CardContent>
          <Typography
            variant="h4"
            align="center"
            gutterBottom
            component={motion.div}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            sx={{
              fontWeight: 700,
              color: primaryColor,
              mb: 3,
              letterSpacing: "2px",
              textTransform: "uppercase",
              fontSize: "1.75rem",
              fontFamily: "'Poppins', sans-serif",
              textShadow: "0 2px 4px rgba(0, 109, 119, 0.1)",
            }}
          >
            Registrar Nuevo Servicio Odontológico
          </Typography>
          <Divider sx={{ marginBottom: "2rem", borderColor: accentColor }} />

          <form onSubmit={handleSubmit}>
            <Grid container spacing={4}>
              <Grid item xs={12} md={6}>
                <motion.div custom={0} initial="hidden" animate="visible" variants={fieldVariants}>
                  <TextField
                    label="Nombre del Servicio"
                    name="nombre"
                    value={formulario.nombre}
                    onChange={handleChange}
                    fullWidth
                    required
                    error={!!errores.nombre}
                    helperText={errores.nombre}
                    sx={{
                      backgroundColor: "#fff",
                      borderRadius: "16px",
                      "& .MuiOutlinedInput-root": {
                        transition: "all 0.3s ease-in-out",
                        "&:hover fieldset": { borderColor: secondaryColor },
                        "&.Mui-focused fieldset": {
                          borderColor: primaryColor,
                          borderWidth: "2px",
                        },
                        boxShadow: "0 2px 8px rgba(0, 109, 119, 0.05)",
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
                    }}
                  />
                </motion.div>
              </Grid>
              <Grid item xs={12} md={6}>
                <motion.div custom={1} initial="hidden" animate="visible" variants={fieldVariants}>
                  <TextField
                    label="Duración (minutos)"
                    name="duracion_minutos"
                    value={formulario.duracion_minutos}
                    onChange={handleChange}
                    fullWidth
                    required
                    error={!!errores.duracion_minutos}
                    helperText={errores.duracion_minutos}
                    sx={{
                      backgroundColor: "#fff",
                      borderRadius: "16px",
                      "& .MuiOutlinedInput-root": {
                        transition: "all 0.3s ease-in-out",
                        "&:hover fieldset": { borderColor: secondaryColor },
                        "&.Mui-focused fieldset": {
                          borderColor: primaryColor,
                          borderWidth: "2px",
                        },
                        boxShadow: "0 2px 8px rgba(0, 109, 119, 0.05)",
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
                    }}
                  />
                </motion.div>
              </Grid>
              <Grid item xs={12}>
                <motion.div custom={2} initial="hidden" animate="visible" variants={fieldVariants}>
                  <TextField
                    label="Descripción"
                    name="descripcion"
                    value={formulario.descripcion}
                    onChange={handleChange}
                    multiline
                    rows={3}
                    fullWidth
                    required
                    error={!!errores.descripcion}
                    helperText={errores.descripcion}
                    sx={{
                      backgroundColor: "#fff",
                      borderRadius: "16px",
                      "& .MuiOutlinedInput-root": {
                        transition: "all 0.3s ease-in-out",
                        "&:hover fieldset": { borderColor: secondaryColor },
                        "&.Mui-focused fieldset": {
                          borderColor: primaryColor,
                          borderWidth: "2px",
                        },
                        boxShadow: "0 2px 8px rgba(0, 109, 119, 0.05)",
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
                    }}
                  />
                </motion.div>
              </Grid>

              <Grid item xs={12} md={6}>
                <motion.div custom={3} initial="hidden" animate="visible" variants={fieldVariants}>
                  <FormControl
                    fullWidth
                    sx={{
                      backgroundColor: "#fff",
                      borderRadius: "16px",
                      "& .MuiOutlinedInput-root": {
                        transition: "all 0.3s ease-in-out",
                        "&:hover fieldset": { borderColor: secondaryColor },
                        "&.Mui-focused fieldset": {
                          borderColor: primaryColor,
                          borderWidth: "2px",
                        },
                        boxShadow: "0 2px 8px rgba(0, 109, 119, 0.05)",
                      },
                    }}
                  >
                    <InputLabel sx={{ color: textColor, fontFamily: "'Poppins', sans-serif" }}>
                      Tipo de citas
                    </InputLabel>
                    <Select
                      name="tipo_citas"
                      value={formulario.tipo_citas}
                      onChange={handleChange}
                      sx={{
                        "& .MuiSelect-select": { padding: "16px", fontFamily: "'Poppins', sans-serif" },
                      }}
                    >
                      <MenuItem value="citas_requeridas" sx={{ fontFamily: "'Poppins', sans-serif" }}>
                        Citas requeridas
                      </MenuItem>
                      <MenuItem value="requiere_evaluacion" sx={{ fontFamily: "'Poppins', sans-serif" }}>
                        Requiere valoración
                      </MenuItem>
                    </Select>
                  </FormControl>
                </motion.div>
              </Grid>

              {formulario.tipo_citas !== "requiere_evaluacion" && (
                <Grid item xs={12} md={6}>
                  <motion.div custom={4} initial="hidden" animate="visible" variants={fieldVariants}>
                    <TextField
                      label="Precio"
                      name="precio"
                      value={formulario.precio}
                      onChange={handleChange}
                      fullWidth
                      required
                      error={!!errores.precio}
                      helperText={errores.precio}
                      sx={{
                        backgroundColor: "#fff",
                        borderRadius: "16px",
                        "& .MuiOutlinedInput-root": {
                          transition: "all 0.3s ease-in-out",
                          "&:hover fieldset": { borderColor: secondaryColor },
                          "&.Mui-focused fieldset": {
                            borderColor: primaryColor,
                            borderWidth: "2px",
                          },
                          boxShadow: "0 2px 8px rgba(0, 109, 119, 0.05)",
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
                      }}
                    />
                  </motion.div>
                </Grid>
              )}

              {formulario.tipo_citas === "citas_requeridas" && (
                <Grid item xs={12} md={6}>
                  <motion.div custom={5} initial="hidden" animate="visible" variants={fieldVariants}>
                    <TextField
                      label="Número de citas requeridas"
                      name="citas_requeridas"
                      value={formulario.citas_requeridas}
                      onChange={handleChange}
                      fullWidth
                      required
                      error={!!errores.citas_requeridas}
                      helperText={errores.citas_requeridas}
                      sx={{
                        backgroundColor: "#fff",
                        borderRadius: "16px",
                        "& .MuiOutlinedInput-root": {
                          transition: "all 0.3s ease-in-out",
                          "&:hover fieldset": { borderColor: secondaryColor },
                          "&.Mui-focused fieldset": {
                            borderColor: primaryColor,
                            borderWidth: "2px",
                          },
                          boxShadow: "0 2px 8px rgba(0, 109, 119, 0.05)",
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
                      }}
                    />
                  </motion.div>
                </Grid>
              )}

              <Grid item xs={12}>
                <motion.div custom={6} initial="hidden" animate="visible" variants={fieldVariants}>
                  <Typography
                    variant="h6"
                    sx={{ color: textColor, fontFamily: "'Poppins', sans-serif", mb: 1 }}
                  >
                    Imagen del servicio
                  </Typography>
                  <Button
                    variant="outlined"
                    component="label"
                    fullWidth
                    startIcon={<CloudUpload />}
                    sx={{
                      marginTop: "0.5rem",
                      padding: "12px",
                      borderColor: primaryColor,
                      color: primaryColor,
                      "&:hover": { borderColor: secondaryColor, color: secondaryColor },
                    }}
                  >
                    Subir imagen del servicio
                    <input type="file" hidden onChange={handleImageChange} accept="image/*" />
                  </Button>
                  {errores.imagen && (
                    <Typography color="error" variant="body2" sx={{ marginTop: "0.5rem" }}>
                      {errores.imagen}
                    </Typography>
                  )}
                  {imagenPrevia && (
                    <Box sx={{ mt: 2, display: "flex", justifyContent: "center", alignItems: "center" }}>
                      <img
                        src={imagenPrevia}
                        alt="Vista previa"
                        style={{
                          maxWidth: "300px",
                          height: "auto",
                          borderRadius: "12px",
                          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                          objectFit: "cover",
                          marginRight: "1rem",
                        }}
                      />
                      <IconButton
                        onClick={handleDeleteImage}
                        sx={{
                          color: primaryColor,
                          "&:hover": { color: secondaryColor },
                        }}
                      >
                        <Delete />
                      </IconButton>
                    </Box>
                  )}
                  {formulario.imagen && !errores.imagen && !imagenPrevia && (
                    <Typography
                      variant="body2"
                      sx={{ marginTop: "0.5rem", color: textColor, fontFamily: "'Poppins', sans-serif" }}
                    >
                      Imagen seleccionada: {formulario.imagen.name}
                    </Typography>
                  )}
                </motion.div>
              </Grid>

              <Grid item xs={12}>
                <motion.div
                  variants={buttonVariants}
                  whileHover="hover"
                  whileTap="tap"
                  style={{ display: "flex", justifyContent: "center" }}
                >
                  <Button
                    type="submit"
                    variant="contained"
                    size="large"
                    fullWidth
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
                  >
                    Registrar Servicio
                  </Button>
                </motion.div>
              </Grid>
            </Grid>
          </form>
        </CardContent>
      </Card>

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

export default CrearServicioOdontologia;