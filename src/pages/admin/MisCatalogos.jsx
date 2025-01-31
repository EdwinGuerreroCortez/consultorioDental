import React, { useEffect, useState } from "react";
import {
    Box,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    IconButton,
    Tooltip,
    Typography,
    Snackbar,
    Alert,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Button,
    Card,
    CardContent,
} from "@mui/material";
import { CheckCircle, Cancel, Visibility } from "@mui/icons-material";

const MisCatalogos = () => {
    const [tratamientos, setTratamientos] = useState([]);
    const [alerta, setAlerta] = useState({ open: false, message: "", severity: "success" });
    const [tratamientoSeleccionado, setTratamientoSeleccionado] = useState(null);
    const [dialogoAbierto, setDialogoAbierto] = useState(false);

    const obtenerTratamientos = async () => {
        try {
            const response = await fetch("http://localhost:4000/api/tratamientos");
            const data = await response.json();
            setTratamientos(data);
        } catch (error) {
            console.error("Error al obtener tratamientos:", error);
            setAlerta({ open: true, message: "Error al cargar los tratamientos", severity: "error" });
        }
    };

    const actualizarEstado = async (id, estadoActual) => {
        try {
            const nuevoEstado = estadoActual === 1 ? 0 : 1;
            await fetch(`http://localhost:4000/api/tratamientos/${id}/estado`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ estado: nuevoEstado }),
            });

            setTratamientos((prev) =>
                prev.map((tratamiento) =>
                    tratamiento.id === id ? { ...tratamiento, estado: nuevoEstado } : tratamiento
                )
            );

            setAlerta({
                open: true,
                message: `Tratamiento ${nuevoEstado === 1 ? "activado" : "desactivado"} con éxito`,
                severity: "success",
            });
        } catch (error) {
            console.error("Error al actualizar estado:", error);
            setAlerta({ open: true, message: "Error al cambiar el estado", severity: "error" });
        }
    };

    const abrirDialogo = (tratamiento) => {
        setTratamientoSeleccionado(tratamiento);
        setDialogoAbierto(true);
    };

    const cerrarDialogo = () => {
        setDialogoAbierto(false);
    };

    useEffect(() => {
        obtenerTratamientos();
    }, []);

    const cerrarAlerta = () => setAlerta({ ...alerta, open: false });

    // Separar los tratamientos en categorías
    const tratamientosConCitas = tratamientos.filter((t) => t.requiere_evaluacion === 0);
    const tratamientosRequierenEvaluacion = tratamientos.filter((t) => t.requiere_evaluacion === 1);

    return (
        <Box sx={{ padding: "2rem", backgroundColor: "#f0f9ff", minHeight: "100vh" }}>
            <Typography
                variant="h3"
                sx={{
                    marginBottom: "2rem",
                    fontWeight: "bold",
                    color: "#0077b6",
                    textAlign: "center",
                    textShadow: "1px 1px 2px rgba(0, 0, 0, 0.1)",
                }}
            >
                Catálogo de Tratamientos
            </Typography>

            {/* Tabla: Tratamientos con citas */}
            <Card sx={{ marginBottom: "2rem", boxShadow: 4, borderRadius: "16px", overflow: "hidden" }}>
                <CardContent>
                    <Typography
                        variant="h5"
                        sx={{
                            marginBottom: "1.5rem",
                            fontWeight: "bold",
                            color: "#0056b3",
                            textAlign: "left",
                            borderBottom: "2px solid #0077b6",
                            paddingBottom: "0.5rem",
                        }}
                    >
                        Tratamientos con citas requeridas
                    </Typography>

                    <TableContainer component={Paper} sx={{ borderRadius: "12px" }}>
                        <Table>
                            <TableHead sx={{ backgroundColor: "#e0f7fa" }}>
                                <TableRow>
                                    <TableCell><strong>Nombre</strong></TableCell>
                                    <TableCell><strong>Descripción</strong></TableCell>
                                    <TableCell><strong>Duración (min)</strong></TableCell>
                                    <TableCell><strong>Precio</strong></TableCell>
                                    <TableCell><strong>Citas requeridas</strong></TableCell>
                                    <TableCell><strong>Imagen</strong></TableCell>
                                    <TableCell><strong>Estado</strong></TableCell>
                                    <TableCell><strong>Acción</strong></TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {tratamientosConCitas.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={8} align="center">
                                            No hay tratamientos con citas requeridas.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    tratamientosConCitas.map((tratamiento) => (
                                        <TableRow key={tratamiento.id} sx={{ "&:hover": { backgroundColor: "#f1f1f1" } }}>
                                            <TableCell>{tratamiento.nombre}</TableCell>
                                            <TableCell>
                                                {tratamiento.descripcion.length > 50
                                                    ? `${tratamiento.descripcion.substring(0, 50)}...`
                                                    : tratamiento.descripcion}
                                                <Button
                                                    size="small"
                                                    onClick={() => abrirDialogo(tratamiento)}
                                                    sx={{ textTransform: "none", color: "#0073e6" }}
                                                >
                                                    Ver más
                                                </Button>
                                            </TableCell>
                                            <TableCell>{tratamiento.duracion_minutos}</TableCell>
                                            <TableCell>${tratamiento.precio}</TableCell>
                                            <TableCell>{tratamiento.citas_requeridas}</TableCell>
                                            <TableCell>
                                                {tratamiento.imagen ? (
                                                    <img
                                                        src={tratamiento.imagen}
                                                        alt={tratamiento.nombre}
                                                        style={{ width: "60px", height: "60px", borderRadius: "8px" }}
                                                    />
                                                ) : (
                                                    "Sin imagen"
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                {tratamiento.estado === 1 ? (
                                                    <Typography color="green">Activo</Typography>
                                                ) : (
                                                    <Typography color="red">Inactivo</Typography>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <Tooltip
                                                    title={
                                                        tratamiento.estado === 1
                                                            ? "Desactivar tratamiento"
                                                            : "Activar tratamiento"
                                                    }
                                                >
                                                    <IconButton
                                                        color={tratamiento.estado === 1 ? "error" : "success"}
                                                        onClick={() => actualizarEstado(tratamiento.id, tratamiento.estado)}
                                                    >
                                                        {tratamiento.estado === 1 ? <Cancel /> : <CheckCircle />}
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

            {/* Tabla: Tratamientos que requieren evaluación */}
            <Card sx={{ boxShadow: 4, borderRadius: "16px", overflow: "hidden" }}>
                <CardContent>
                    <Typography
                        variant="h5"
                        sx={{
                            marginBottom: "1.5rem",
                            fontWeight: "bold",
                            color: "#0056b3",
                            borderBottom: "2px solid #0077b6",
                            paddingBottom: "0.5rem",
                        }}
                    >
                        Tratamientos que requieren evaluación
                    </Typography>

                    <TableContainer component={Paper} sx={{ borderRadius: "12px" }}>
                        <Table>
                            <TableHead sx={{ backgroundColor: "#e0f7fa" }}>
                                <TableRow>
                                    <TableCell><strong>Nombre</strong></TableCell>
                                    <TableCell><strong>Descripción</strong></TableCell>
                                    <TableCell><strong>Duración (min)</strong></TableCell>
                                    <TableCell><strong>Precio</strong></TableCell>
                                    <TableCell><strong>Imagen</strong></TableCell>
                                    <TableCell><strong>Estado</strong></TableCell>
                                    <TableCell><strong>Acción</strong></TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {tratamientosRequierenEvaluacion.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={7} align="center">
                                            No hay tratamientos que requieran evaluación.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    tratamientosRequierenEvaluacion.map((tratamiento) => (
                                        <TableRow key={tratamiento.id} sx={{ "&:hover": { backgroundColor: "#f9f9f9" } }}>
                                            <TableCell>{tratamiento.nombre}</TableCell>
                                            <TableCell>
                                                {tratamiento.descripcion.length > 50
                                                    ? `${tratamiento.descripcion.substring(0, 50)}...`
                                                    : tratamiento.descripcion}
                                                <Button
                                                    size="small"
                                                    onClick={() => abrirDialogo(tratamiento)}
                                                    sx={{ textTransform: "none", color: "#0073e6" }}
                                                >
                                                    Ver más
                                                </Button>
                                            </TableCell>
                                            <TableCell>{tratamiento.duracion_minutos}</TableCell>
                                            <TableCell>${tratamiento.precio}</TableCell>
                                            <TableCell>
                                                {tratamiento.imagen ? (
                                                    <img
                                                        src={tratamiento.imagen}
                                                        alt={tratamiento.nombre}
                                                        style={{ width: "60px", height: "60px", borderRadius: "8px" }}
                                                    />
                                                ) : (
                                                    "Sin imagen"
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                {tratamiento.estado === 1 ? (
                                                    <Typography color="green">Activo</Typography>
                                                ) : (
                                                    <Typography color="red">Inactivo</Typography>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <Tooltip
                                                    title={
                                                        tratamiento.estado === 1
                                                            ? "Desactivar tratamiento"
                                                            : "Activar tratamiento"
                                                    }
                                                >
                                                    <IconButton
                                                        color={tratamiento.estado === 1 ? "error" : "success"}
                                                        onClick={() => actualizarEstado(tratamiento.id, tratamiento.estado)}
                                                    >
                                                        {tratamiento.estado === 1 ? <Cancel /> : <CheckCircle />}
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

            {/* Diálogo de descripción completa */}
            <Dialog open={dialogoAbierto} onClose={cerrarDialogo} fullWidth maxWidth="sm">
                <DialogTitle>Descripción del Tratamiento</DialogTitle>
                <DialogContent>
                    {tratamientoSeleccionado && (
                        <>
                            <Typography variant="h6">{tratamientoSeleccionado.nombre}</Typography>
                            <Typography variant="body1" sx={{ marginTop: "1rem" }}>
                                {tratamientoSeleccionado.descripcion}
                            </Typography>
                            {tratamientoSeleccionado.imagen && (
                                <Box sx={{ textAlign: "center", marginTop: "1.5rem" }}>
                                    <img
                                        src={tratamientoSeleccionado.imagen}
                                        alt={tratamientoSeleccionado.nombre}
                                        style={{ width: "100%", maxHeight: "300px", objectFit: "contain" }}
                                    />
                                </Box>
                            )}
                        </>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={cerrarDialogo} variant="outlined" color="primary">
                        Cerrar
                    </Button>
                </DialogActions>
            </Dialog>

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

export default MisCatalogos;
