import React, { useState } from "react";
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
} from "@mui/material";
import { CheckCircle } from "@mui/icons-material";

import {
    validarNombre,
    validarDuracion,
    validarDescripcion,
    validarPrecio,
    validarCitasRequeridas,
} from "../../utils/validations";

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
            return;
        }

        if (!["image/jpeg", "image/png"].includes(file.type)) {
            setErrores({ ...errores, imagen: "La imagen debe ser en formato JPG o PNG" });
            return;
        }

        if (file.size > 2 * 1024 * 1024) {
            setErrores({ ...errores, imagen: "La imagen no debe superar los 2MB" });
            return;
        }

        setErrores({ ...errores, imagen: "" });
        setFormulario({
            ...formulario,
            imagen: file,
        });
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
            precio: formulario.tipo_citas === "requiere_evaluacion" ? "" : validarPrecio(formulario.precio),
            citas_requeridas:
                formulario.tipo_citas === "citas_requeridas"
                    ? validarCitasRequeridas(formulario.citas_requeridas)
                    : "",
            imagen: formulario.imagen ? "" : "Debe subir una imagen",
        };

        setErrores(nuevosErrores);

        const erroresFiltrados = Object.entries(nuevosErrores).filter(([_, error]) => error !== "");
        if (erroresFiltrados.length > 0) {
            const mensajesErrores = erroresFiltrados.map(([campo, error]) => `${campo}: ${error}`).join("\n");
            setAlerta({ open: true, message: `Corrija los siguientes errores:\n${mensajesErrores}`, severity: "error" });
            return;
        }

        try {
            const formData = new FormData();
            formData.append("nombre", formulario.nombre);
            formData.append("descripcion", formulario.descripcion);
            formData.append("duracion_minutos", formulario.duracion_minutos);
            formData.append("precio", formulario.tipo_citas === "requiere_evaluacion" ? 0 : formulario.precio);
            formData.append("tipo_citas", formulario.tipo_citas);
            formData.append(
                "citas_requeridas",
                formulario.tipo_citas === "citas_requeridas" ? formulario.citas_requeridas : ""
            );
            formData.append("imagen", formulario.imagen);

            const response = await fetch("http://localhost:4000/api/tratamientos/crear", {
                method: "POST",
                body: formData,
            });

            if (response.ok) {
                setAlerta({ open: true, message: "Servicio registrado con éxito", severity: "success" });
            } else {
                setAlerta({ open: true, message: "Error al registrar el servicio", severity: "error" });
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

    return (
        <Box sx={{ maxWidth: 900, margin: "2rem auto", padding: "1rem" }}>
            <Card sx={{ boxShadow: 8, borderRadius: "16px", overflow: "hidden", padding: "2rem" }}>
                <Typography variant="h4" align="center" gutterBottom sx={{ fontWeight: "bold", color: "#0073e6" }}>
                    Registrar Nuevo Servicio Odontológico
                </Typography>
                <Divider sx={{ marginBottom: "2rem" }} />

                <form onSubmit={handleSubmit}>
                    <Grid container spacing={4}>
                        <Grid item xs={12} md={6}>
                            <TextField
                                label="Nombre del Servicio"
                                name="nombre"
                                value={formulario.nombre}
                                onChange={handleChange}
                                fullWidth
                                required
                                error={!!errores.nombre}
                                helperText={errores.nombre}
                                sx={{ backgroundColor: "#f9f9ff", borderRadius: "8px" }}
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                label="Duración (minutos)"
                                name="duracion_minutos"
                                value={formulario.duracion_minutos}
                                onChange={handleChange}
                                fullWidth
                                required
                                error={!!errores.duracion_minutos}
                                helperText={errores.duracion_minutos}
                                sx={{ backgroundColor: "#f9f9ff", borderRadius: "8px" }}
                            />
                        </Grid>
                        <Grid item xs={12}>
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
                                sx={{ backgroundColor: "#f9f9ff", borderRadius: "8px" }}
                            />
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <FormControl fullWidth sx={{ backgroundColor: "#f9f9ff", borderRadius: "8px" }}>
                                <InputLabel>Tipo de citas</InputLabel>
                                <Select name="tipo_citas" value={formulario.tipo_citas} onChange={handleChange}>
                                    <MenuItem value="citas_requeridas">Citas requeridas</MenuItem>
                                    <MenuItem value="requiere_evaluacion">Requiere evaluación</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>

                        {formulario.tipo_citas !== "requiere_evaluacion" && (
                            <Grid item xs={12} md={6}>
                                <TextField
                                    label="Precio"
                                    name="precio"
                                    value={formulario.precio}
                                    onChange={handleChange}
                                    fullWidth
                                    required
                                    error={!!errores.precio}
                                    helperText={errores.precio}
                                    sx={{ backgroundColor: "#f9f9ff", borderRadius: "8px" }}
                                />
                            </Grid>
                        )}

                        {formulario.tipo_citas === "citas_requeridas" && (
                            <Grid item xs={12} md={6}>
                                <TextField
                                    label="Número de citas requeridas"
                                    name="citas_requeridas"
                                    value={formulario.citas_requeridas}
                                    onChange={handleChange}
                                    fullWidth
                                    required
                                    error={!!errores.citas_requeridas}
                                    helperText={errores.citas_requeridas}
                                    sx={{ backgroundColor: "#f9f9ff", borderRadius: "8px" }}
                                />
                            </Grid>
                        )}

                        <Grid item xs={12}>
                            <Typography variant="h6">Imagen del servicio</Typography>
                            <Button variant="outlined" component="label" fullWidth>
                                Subir imagen del servicio
                                <input type="file" hidden onChange={handleImageChange} accept="image/*" />
                            </Button>
                            {errores.imagen && (
                                <Typography color="error" variant="body2" sx={{ marginTop: "0.5rem" }}>
                                    {errores.imagen}
                                </Typography>
                            )}
                            {formulario.imagen && (
                                <Typography variant="body2" sx={{ marginTop: "0.5rem" }}>
                                    Imagen seleccionada: {formulario.imagen.name}
                                </Typography>
                            )}
                        </Grid>

                        <Grid item xs={12}>
                            <Button type="submit" variant="contained" color="primary" size="large" fullWidth>
                                Registrar Servicio
                            </Button>
                        </Grid>
                    </Grid>
                </form>
            </Card>

            {/* Alerta Snackbar */}
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
