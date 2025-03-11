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
    TextField,
} from "@mui/material";
import { CheckCircle, Cancel, Edit } from "@mui/icons-material";

import {
    validarDescripcion,
    validarDuracion,
    validarPrecio,
    validarCitasRequeridas,
} from "../..//utils/validations";

const MisCatalogos = () => {
    const [tratamientos, setTratamientos] = useState([]);
    const [alerta, setAlerta] = useState({ open: false, message: "", severity: "success" });
    const [tratamientoSeleccionado, setTratamientoSeleccionado] = useState(null);
    const [dialogoEdicionAbierto, setDialogoEdicionAbierto] = useState(false);
    const [loading, setLoading] = useState(true);
    const [errores, setErrores] = useState({});

    const obtenerTratamientos = async () => {
        try {
            const response = await fetch("http://localhost:4000/api/tratamientos");
            const data = await response.json();
            setTratamientos(data);
            setLoading(false);
        } catch (error) {
            console.error("Error al obtener tratamientos:", error);
            setAlerta({ open: true, message: "Error al cargar los tratamientos", severity: "error" });
            setLoading(false);
        }
    };

    const actualizarEstado = async (id, estadoActual) => {
        const csrfToken = obtenerTokenCSRF(); // 🔹 Obtener el token CSRF
        try {
            const nuevoEstado = estadoActual === 1 ? 0 : 1;
            await fetch(`http://localhost:4000/api/tratamientos/${id}/estado`, {
                method: "PUT",
                headers: { "Content-Type": "application/json", "X-XSRF-TOKEN": csrfToken },
                credentials: "include",
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

    const abrirDialogoEdicion = (tratamiento) => {
        setTratamientoSeleccionado(tratamiento);
        setErrores({});
        setDialogoEdicionAbierto(true);
    };

    const cerrarDialogoEdicion = () => {
        setDialogoEdicionAbierto(false);
    };

    const manejarCambio = (e) => {
        const { name, value } = e.target;
        setTratamientoSeleccionado((prev) => ({ ...prev, [name]: value }));

        // Validar el campo en tiempo real
        validarCampo(name, value);
    };

    const validarCampo = (campo, valor) => {
        let error = "";

        switch (campo) {
            case "descripcion":
                error = validarDescripcion(valor);
                break;
            case "duracion_minutos":
                error = validarDuracion(valor);
                break;
            case "precio":
                error = validarPrecio(valor);
                break;
            case "citas_requeridas":
                error = validarCitasRequeridas(valor);
                break;
            default:
                break;
        }

        setErrores((prev) => ({ ...prev, [campo]: error }));
    };
    const obtenerTokenCSRF = () => {
        return document.cookie
          .split("; ")
          .find((row) => row.startsWith("XSRF-TOKEN="))
          ?.split("=")[1];
      };
    const guardarCambios = async () => {
        const camposValidos = Object.values(errores).every((error) => error === "");

        if (!camposValidos) {
            setAlerta({ open: true, message: "Corrige los errores antes de guardar.", severity: "error" });
            return;
        }
        const csrfToken = obtenerTokenCSRF(); // 🔹 Obtener el token CSRF
        try {
            await fetch(`http://localhost:4000/api/tratamientos/${tratamientoSeleccionado.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json", "X-XSRF-TOKEN": csrfToken },
                credentials: "include",
                body: JSON.stringify(tratamientoSeleccionado),
            });

            setTratamientos((prev) =>
                prev.map((tratamiento) =>
                    tratamiento.id === tratamientoSeleccionado.id ? tratamientoSeleccionado : tratamiento
                )
            );

            setAlerta({ open: true, message: "Tratamiento actualizado con éxito", severity: "success" });
            cerrarDialogoEdicion();
        } catch (error) {
            console.error("Error al actualizar tratamiento:", error);
            setAlerta({ open: true, message: "Error al actualizar el tratamiento", severity: "error" });
        }
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
                Catálogo de Procesos
            </Typography>

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

                                <TableContainer component={Paper} sx={{ borderRadius: "12px", boxShadow: 3, minHeight: "300px" }}>
                                    <Table>
                                        <TableHead sx={{ backgroundColor: "#d8eaff" }}>
                                            <TableRow>
                                                <TableCell><strong>Nombre</strong></TableCell>
                                                <TableCell><strong>Descripción</strong></TableCell>
                                                <TableCell><strong>Duración (min)</strong></TableCell>
                                                <TableCell><strong>Precio</strong></TableCell>
                                                <TableCell><strong>Citas requeridas</strong></TableCell>
                                                <TableCell><strong>Estado</strong></TableCell>
                                                <TableCell><strong>Acción</strong></TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {data.length === 0 ? (
                                                <TableRow>
                                                    <TableCell colSpan={7} align="center">
                                                        No hay tratamientos disponibles.
                                                    </TableCell>
                                                </TableRow>
                                            ) : (
                                                data.map((tratamiento) => (
                                                    <TableRow key={tratamiento.id} sx={{ "&:hover": { backgroundColor: "#eef3ff" } }}>
                                                        <TableCell>{tratamiento.nombre}</TableCell>
                                                        <TableCell>
                                                            {tratamiento.descripcion.length > 50
                                                                ? `${tratamiento.descripcion.substring(0, 50)}...`
                                                                : tratamiento.descripcion}
                                                            <Button
                                                                size="small"
                                                                onClick={() => abrirDialogoEdicion(tratamiento)}
                                                                sx={{ textTransform: "none", color: "#0056b3" }}
                                                            >
                                                                Ver más
                                                            </Button>
                                                        </TableCell>
                                                        <TableCell>{tratamiento.duracion_minutos}</TableCell>
                                                        <TableCell>${tratamiento.precio}</TableCell>
                                                        <TableCell>{tratamiento.citas_requeridas || "-"}</TableCell>
                                                        <TableCell>{tratamiento.estado === 1 ? "Activo" : "Inactivo"}</TableCell>
                                                        <TableCell>
                                                            <Tooltip title="Editar tratamiento">
                                                                <IconButton color="primary" onClick={() => abrirDialogoEdicion(tratamiento)}>
                                                                    <Edit />
                                                                </IconButton>
                                                            </Tooltip>
                                                            <Tooltip title={tratamiento.estado === 1 ? "Desactivar tratamiento" : "Activar tratamiento"}>
                                                                <IconButton color={tratamiento.estado === 1 ? "error" : "success"} onClick={() => actualizarEstado(tratamiento.id, tratamiento.estado)}>
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

            <Dialog open={dialogoEdicionAbierto} onClose={cerrarDialogoEdicion} fullWidth maxWidth="sm">
                <DialogTitle>Editar Tratamiento</DialogTitle>
                <DialogContent>
                    {tratamientoSeleccionado && (
                        <>
                            <TextField
                                label="Descripción"
                                name="descripcion"
                                value={tratamientoSeleccionado.descripcion || ""}
                                onChange={manejarCambio}
                                fullWidth
                                margin="normal"
                                multiline
                                rows={3}
                                error={!!errores.descripcion}
                                helperText={errores.descripcion}
                            />
                            <TextField
                                label="Duración (minutos)"
                                name="duracion_minutos"
                                type="number"
                                value={tratamientoSeleccionado.duracion_minutos || ""}
                                onChange={manejarCambio}
                                fullWidth
                                margin="normal"
                                error={!!errores.duracion_minutos}
                                helperText={errores.duracion_minutos}
                            />
                            {tratamientoSeleccionado.requiere_evaluacion === 0 && (
                                <>
                                    <TextField
                                        label="Precio"
                                        name="precio"
                                        type="number"
                                        value={tratamientoSeleccionado.precio || ""}
                                        onChange={manejarCambio}
                                        fullWidth
                                        margin="normal"
                                        error={!!errores.precio}
                                        helperText={errores.precio}
                                    />
                                    <TextField
                                        label="Citas requeridas"
                                        name="citas_requeridas"
                                        type="number"
                                        value={tratamientoSeleccionado.citas_requeridas || ""}
                                        onChange={manejarCambio}
                                        fullWidth
                                        margin="normal"
                                        error={!!errores.citas_requeridas}
                                        helperText={errores.citas_requeridas}
                                    />
                                </>
                            )}
                        </>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={cerrarDialogoEdicion} variant="outlined" color="secondary">
                        Cancelar
                    </Button>
                    <Button onClick={guardarCambios} variant="contained" color="primary">
                        Guardar
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
