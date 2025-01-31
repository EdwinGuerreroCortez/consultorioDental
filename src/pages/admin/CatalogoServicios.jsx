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
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    IconButton,
    Tooltip,
} from "@mui/material";
import { CheckCircle, Cancel, PowerSettingsNew } from "@mui/icons-material";

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

    const [serviciosRegistrados, setServiciosRegistrados] = useState([]);

    // Manejo de cambios en los campos
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormulario({
            ...formulario,
            [name]: value,
        });
    };

    const handleImageChange = (e) => {
        setFormulario({
            ...formulario,
            imagen: e.target.files[0],
        });
    };

    // Manejo del envío del formulario
    const handleSubmit = (e) => {
        e.preventDefault();

        const nuevoServicio = {
            nombre: formulario.nombre,
            descripcion: formulario.descripcion,
            duracion_minutos: formulario.duracion_minutos,
            precio:
                formulario.tipo_citas === "requiere_evaluacion"
                    ? "A definir después de evaluación"
                    : `$${formulario.precio}`,
            tipo_citas: formulario.tipo_citas === "citas_requeridas"
                ? `${formulario.citas_requeridas} citas`
                : "Requiere evaluación",
            imagen: formulario.imagen?.name || "Sin imagen",
            activo: false, // Por defecto, el servicio está desactivado
        };

        setServiciosRegistrados([...serviciosRegistrados, nuevoServicio]);

        // Reinicio del formulario
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

    // Manejo de activación/desactivación
    const toggleServicioActivo = (index) => {
        setServiciosRegistrados((prevServicios) =>
            prevServicios.map((servicio, i) =>
                i === index ? { ...servicio, activo: !servicio.activo } : servicio
            )
        );
    };

    return (
        <Box sx={{ maxWidth: 900, margin: "2rem auto", padding: "1rem" }}>
            {/* Barra de título */}
            <Box
                sx={{
                    background: "linear-gradient(135deg, #0073e6, #66b3ff)",
                    padding: "1rem",
                    color: "white",
                    borderRadius: "12px 12px 0 0",
                    textAlign: "center",
                    fontWeight: "bold",
                }}
            >
                <Typography variant="h4" component="h2">
                    Registrar Nuevo Servicio Odontológico
                </Typography>
            </Box>

            {/* Formulario de registro */}
            <Card sx={{ boxShadow: 4, borderRadius: "12px", overflow: "hidden", border: "1px solid #e0e0e0" }}>
                <CardContent>
                    <Typography variant="body1" color="textSecondary" sx={{ marginBottom: "1rem" }}>
                        Complete el formulario con los datos necesarios. Seleccione si el servicio requiere citas o evaluación previa.
                    </Typography>
                    <Divider sx={{ marginBottom: "2rem" }} />

                    <form onSubmit={handleSubmit}>
                        <Grid container spacing={3}>
                            {/* Información básica */}
                            <Grid item xs={12}>
                                <Typography variant="h6" fontWeight="medium" color="#0073e6">
                                    Información básica
                                </Typography>
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    label="Nombre del Servicio"
                                    name="nombre"
                                    value={formulario.nombre}
                                    onChange={handleChange}
                                    fullWidth
                                    required
                                    sx={{ backgroundColor: "#f0f4ff", borderRadius: "8px" }}
                                />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    label="Duración (minutos)"
                                    name="duracion_minutos"
                                    value={formulario.duracion_minutos}
                                    onChange={handleChange}
                                    type="number"
                                    fullWidth
                                    required
                                    sx={{ backgroundColor: "#f0f4ff", borderRadius: "8px" }}
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
                                    sx={{ backgroundColor: "#f0f4ff", borderRadius: "8px" }}
                                />
                            </Grid>

                            {/* Detalles del servicio */}
                            <Grid item xs={12}>
                                <Typography variant="h6" fontWeight="medium" color="#0073e6">
                                    Detalles del servicio
                                </Typography>
                            </Grid>

                            {/* Selección entre citas o evaluación */}
                            <Grid item xs={12} md={6}>
                                <FormControl fullWidth sx={{ backgroundColor: "#f0f4ff", borderRadius: "8px" }}>
                                    <InputLabel>Tipo de citas</InputLabel>
                                    <Select
                                        name="tipo_citas"
                                        value={formulario.tipo_citas}
                                        onChange={handleChange}
                                        fullWidth
                                    >
                                        <MenuItem value="citas_requeridas">Citas requeridas</MenuItem>
                                        <MenuItem value="requiere_evaluacion">Requiere evaluación</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>

                            {/* Campo de precio */}
                            {formulario.tipo_citas !== "requiere_evaluacion" && (
                                <Grid item xs={12} md={6}>
                                    <TextField
                                        label="Precio"
                                        name="precio"
                                        value={formulario.precio}
                                        onChange={handleChange}
                                        type="number"
                                        fullWidth
                                        required
                                        sx={{ backgroundColor: "#f0f4ff", borderRadius: "8px" }}
                                    />
                                </Grid>
                            )}

                            {/* Campo de citas requeridas */}
                            {formulario.tipo_citas === "citas_requeridas" && (
                                <Grid item xs={12} md={6}>
                                    <TextField
                                        label="Número de citas requeridas"
                                        name="citas_requeridas"
                                        value={formulario.citas_requeridas}
                                        onChange={handleChange}
                                        type="number"
                                        fullWidth
                                        required
                                        sx={{ backgroundColor: "#f0f4ff", borderRadius: "8px" }}
                                    />
                                </Grid>
                            )}

                            {/* Imagen del servicio */}
                            <Grid item xs={12}>
                                <Typography variant="h6" fontWeight="medium" color="#0073e6">
                                    Imagen del servicio
                                </Typography>
                            </Grid>
                            <Grid item xs={12}>
                                <Button
                                    variant="outlined"
                                    component="label"
                                    fullWidth
                                    sx={{ padding: "10px", borderColor: "#0073e6", color: "#0073e6" }}
                                >
                                    Subir imagen del servicio
                                    <input type="file" hidden onChange={handleImageChange} accept="image/*" />
                                </Button>
                                {formulario.imagen && (
                                    <Typography variant="body2" sx={{ marginTop: "0.5rem" }}>
                                        Imagen seleccionada: {formulario.imagen.name}
                                    </Typography>
                                )}
                            </Grid>

                            {/* Botón de envío */}
                            <Grid item xs={12}>
                                <Divider sx={{ margin: "1.5rem 0" }} />
                                <Button
                                    type="submit"
                                    variant="contained"
                                    color="primary"
                                    size="large"
                                    fullWidth
                                    sx={{ backgroundColor: "#0073e6", color: "white", fontWeight: "bold" }}
                                >
                                    Registrar Servicio
                                </Button>
                            </Grid>
                        </Grid>
                    </form>
                </CardContent>
            </Card>

            {/* Tabla de servicios registrados */}
            <Card sx={{ marginTop: "2rem", boxShadow: 4, borderRadius: "12px" }}>
                <CardContent>
                    <Typography variant="h5" fontWeight="bold" gutterBottom>
                        Servicios Registrados
                    </Typography>
                    <TableContainer component={Paper} sx={{ borderRadius: "12px", overflow: "hidden" }}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Nombre</TableCell>
                                    <TableCell>Descripción</TableCell>
                                    <TableCell>Duración (min)</TableCell>
                                    <TableCell>Precio</TableCell>
                                    <TableCell>Tipo de citas</TableCell>
                                    <TableCell>Imagen</TableCell>
                                    <TableCell>Acciones</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {serviciosRegistrados.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={7} align="center">
                                            No hay servicios registrados.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    serviciosRegistrados.map((servicio, index) => (
                                        <TableRow
                                            key={index}
                                            sx={{
                                                "&:hover": {
                                                    backgroundColor: "#e6f7ff",
                                                },
                                            }}
                                        >
                                            <TableCell>{servicio.nombre}</TableCell>
                                            <TableCell>{servicio.descripcion}</TableCell>
                                            <TableCell>{servicio.duracion_minutos}</TableCell>
                                            <TableCell>{servicio.precio}</TableCell>
                                            <TableCell>{servicio.tipo_citas}</TableCell>
                                            <TableCell>{servicio.imagen}</TableCell>
                                            <TableCell>
                                                <Tooltip
                                                    title={servicio.activo ? "Desactivar servicio" : "Activar servicio"}
                                                >
                                                    <IconButton
                                                        color={servicio.activo ? "success" : "error"}
                                                        onClick={() => toggleServicioActivo(index)}
                                                    >
                                                        {servicio.activo ? <CheckCircle /> : <PowerSettingsNew />}
                                                    </IconButton>
                                                </Tooltip>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </CardContent>
            </Card>
        </Box>
    );
};

export default CrearServicioOdontologia;
