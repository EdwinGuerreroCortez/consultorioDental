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
import { CheckCircle, Cancel } from "@mui/icons-material";

const MisCatalogos = () => {
    const [tratamientos, setTratamientos] = useState([]);
    const [alerta, setAlerta] = useState({ open: false, message: "", severity: "success" });
    const [tratamientoSeleccionado, setTratamientoSeleccionado] = useState(null);
    const [dialogoAbierto, setDialogoAbierto] = useState(false);
    const [loading, setLoading] = useState(true);
    const [renderKey, setRenderKey] = useState(0);

    const obtenerTratamientos = async () => {
        try {
            const response = await fetch("http://localhost:4000/api/tratamientos");
            const data = await response.json();

            console.log("Datos recibidos:", data);
            setTratamientos(data);

            // Simulación de retraso mínimo para asegurar la visualización correcta
            setTimeout(() => {
                setLoading(false);
                setRenderKey((prev) => prev + 1);  // Forzar un re-render
            }, 200);  // 200 ms de espera para estabilidad visual
        } catch (error) {
            console.error("Error al obtener tratamientos:", error);
            setAlerta({ open: true, message: "Error al cargar los tratamientos", severity: "error" });
            setLoading(false);
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

    const tratamientosConCitas = tratamientos.filter((t) => t.requiere_evaluacion === 0);
    const tratamientosRequierenEvaluacion = tratamientos.filter((t) => t.requiere_evaluacion === 1);

    return (
        <Box sx={{ padding: "2rem", backgroundColor: "#f0f4fa", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
            <Typography
                variant="h3"
                sx={{
                    marginBottom: "2rem",
                    fontWeight: "bold",
                    color: "#004aad",
                    textAlign: "center",
                    textShadow: "2px 2px 4px rgba(0, 0, 0, 0.1)",
                }}
            >
                Catálogo de Tratamientos
            </Typography>

            {/* Contenedor para tablas */}
            <Box sx={{ flexGrow: 1 }}>
                {loading ? (
                    <Typography align="center" sx={{ marginTop: "2rem", color: "#666" }}>
                        Cargando tratamientos...
                    </Typography>
                ) : (
                    [{ titulo: "Tratamientos con citas requeridas", data: tratamientosConCitas },
                    { titulo: "Tratamientos que requieren evaluación", data: tratamientosRequierenEvaluacion }].map(({ titulo, data }) => (
                        <Card key={titulo} sx={{ marginBottom: "2rem", boxShadow: 6, borderRadius: "16px", overflow: "hidden" }}>
                            <CardContent>
                                <Typography
                                    variant="h5"
                                    sx={{
                                        marginBottom: "1.5rem",
                                        fontWeight: "bold",
                                        color: "#003f8f",
                                        borderBottom: "3px solid #004aad",
                                        paddingBottom: "0.5rem",
                                    }}
                                >
                                    {titulo}
                                </Typography>

                                <TableContainer key={`table-${renderKey}`} component={Paper} sx={{ borderRadius: "12px", boxShadow: 3, minHeight: "300px" }}>
                                    <Table>
                                        <TableHead sx={{ backgroundColor: "#d8eaff" }}>
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
                                            {data.length === 0 ? (
                                                <TableRow>
                                                    <TableCell colSpan={8} align="center">
                                                        No hay tratamientos disponibles.
                                                    </TableCell>
                                                </TableRow>
                                            ) : (
                                                data.map((tratamiento, index) => (
                                                    <TableRow key={`${tratamiento.id}-${index}`} sx={{ "&:hover": { backgroundColor: "#eef3ff" } }}>
                                                        <TableCell>{tratamiento.nombre}</TableCell>
                                                        <TableCell>
                                                            {tratamiento.descripcion.length > 50
                                                                ? `${tratamiento.descripcion.substring(0, 50)}...`
                                                                : tratamiento.descripcion}
                                                            <Button
                                                                size="small"
                                                                onClick={() => abrirDialogo(tratamiento)}
                                                                sx={{ textTransform: "none", color: "#0056b3" }}
                                                            >
                                                                Ver más
                                                            </Button>
                                                        </TableCell>
                                                        <TableCell>{tratamiento.duracion_minutos}</TableCell>
                                                        <TableCell>${tratamiento.precio}</TableCell>
                                                        <TableCell>{tratamiento.citas_requeridas || "-"}</TableCell>
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
                                                            <Typography color={tratamiento.estado === 1 ? "green" : "red"}>
                                                                {tratamiento.estado === 1 ? "Activo" : "Inactivo"}
                                                            </Typography>
                                                        </TableCell>
                                                        <TableCell>
                                                            <Tooltip
                                                                title={tratamiento.estado === 1 ? "Desactivar tratamiento" : "Activar tratamiento"}
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
                    ))
                )}
            </Box>

            {/* Espacio extra al final */}
            <Box sx={{ height: "4rem" }} />

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
