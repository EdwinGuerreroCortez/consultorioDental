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
    Typography,
    Snackbar,
    Alert,
    CircularProgress,
    Pagination,
    IconButton,
    Tooltip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField
} from "@mui/material";
import { Assignment } from "@mui/icons-material";
import axios from "axios";

const TratamientosPendientes = () => {
    const [tratamientos, setTratamientos] = useState([]);
    const [pagina, setPagina] = useState(1);
    const [alerta, setAlerta] = useState({ open: false, message: "", severity: "success" });
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [tratamientoSeleccionado, setTratamientoSeleccionado] = useState(null);
    const [numCitas, setNumCitas] = useState("");
    const [precio, setPrecio] = useState("");
    const elementosPorPagina = 10;

    useEffect(() => {
        obtenerTratamientos(true);
    }, []);

    useEffect(() => {
        const intervalo = setInterval(() => {
            obtenerTratamientos(false);
        }, 3000);
        return () => clearInterval(intervalo);
    }, []);

    const obtenerTratamientos = (isFirstLoad = false) => {
        axios.get("http://localhost:4000/api/tratamientos-pacientes/pendientes")
            .then(response => {
                setTratamientos(response.data);
                if (isFirstLoad) setLoading(false);
            })
            .catch(error => {
                console.error("Error al obtener tratamientos pendientes:", error);
                setAlerta({ open: true, message: "Error al cargar los tratamientos pendientes", severity: "error" });
                if (isFirstLoad) setLoading(false);
            });
    };

    const handleChangePagina = (event, value) => {
        setPagina(value);
    };

    const handleAbrirModal = (tratamiento) => {
        setTratamientoSeleccionado(tratamiento);
        setModalOpen(true);
    };

    const handleCerrarModal = () => {
        setModalOpen(false);
        setNumCitas("");
        setPrecio("");
    };

    const handleGuardar = async () => {
        if (!numCitas || !precio || isNaN(numCitas) || isNaN(precio) || numCitas <= 0 || precio <= 0) {
            setAlerta({ open: true, message: "Por favor ingresa valores válidos.", severity: "warning" });
            return;
        }

        try {
            const response = await axios.post("http://localhost:4000/api/tratamientos-pacientes/crear-nuevas-citas-pagos", {
                tratamientoPacienteId: tratamientoSeleccionado.id,
                citasTotales: parseInt(numCitas, 10),
                precioPorCita: parseFloat(precio)
            });

            setAlerta({ open: true, message: response.data.mensaje, severity: "success" });
            obtenerTratamientos(); // Recargar lista de tratamientos
            handleCerrarModal();
        } catch (error) {
            console.error("Error al asignar número de citas:", error);
            setAlerta({ open: true, message: "Error al asignar número de citas", severity: "error" });
        }
    };

    const tratamientosPaginados = tratamientos.slice((pagina - 1) * elementosPorPagina, pagina * elementosPorPagina);

    return (
        <Box sx={{ padding: "2rem", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
            <Typography variant="h4" sx={{ fontWeight: "bold", marginBottom: "1.5rem" }}>
                Tratamientos Pendientes de Evaluación
            </Typography>
            <Box sx={{ flexGrow: 1 }}>
                {loading ? (
                    <Typography align="center" sx={{ marginTop: "2rem", color: "#666" }}>
                        <CircularProgress />
                    </Typography>
                ) : (
                    <TableContainer component={Paper} sx={{ borderRadius: "12px", boxShadow: 3 }}>
                        <Table>
                            <TableHead sx={{ backgroundColor: "#d8eaff" }}>
                                <TableRow>
                                    <TableCell>#</TableCell>
                                    <TableCell>Nombre</TableCell>
                                    <TableCell>Apellido Paterno</TableCell>
                                    <TableCell>Apellido Materno</TableCell>
                                    <TableCell>Teléfono</TableCell>
                                    <TableCell>Email</TableCell>
                                    <TableCell>Edad</TableCell>
                                    <TableCell>Sexo</TableCell>
                                    <TableCell>Tratamiento</TableCell>
                                    <TableCell>Fecha de Inicio</TableCell>
                                    <TableCell>Acción</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {tratamientosPaginados.map((tratamiento, index) => (
                                    <TableRow key={tratamiento.id}>
                                        <TableCell>{(pagina - 1) * elementosPorPagina + index + 1}</TableCell>
                                        <TableCell>{tratamiento.nombre}</TableCell>
                                        <TableCell>{tratamiento.apellido_paterno}</TableCell>
                                        <TableCell>{tratamiento.apellido_materno}</TableCell>
                                        <TableCell>{tratamiento.telefono}</TableCell>
                                        <TableCell>{tratamiento.email || "N/A"}</TableCell>
                                        <TableCell>{tratamiento.fecha_nacimiento}</TableCell>
                                        <TableCell>{tratamiento.sexo}</TableCell>
                                        <TableCell>{tratamiento.tratamiento_nombre}</TableCell>
                                        <TableCell>{tratamiento.fecha_inicio}</TableCell>
                                        <TableCell>
                                            <Tooltip title="Evaluar">
                                                <IconButton onClick={() => handleAbrirModal(tratamiento)}>
                                                    <Assignment color="primary" />
                                                </IconButton>
                                            </Tooltip>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                )}
            </Box>
            <Pagination
                count={Math.ceil(tratamientos.length / elementosPorPagina)}
                page={pagina}
                onChange={handleChangePagina}
                color="primary"
                size="large"
                sx={{ marginTop: "1rem", alignSelf: "center" }}
            />

            {/* Modal para asignar citas y precio */}
            <Dialog open={modalOpen} onClose={handleCerrarModal}>
                <DialogTitle>Asignar Número de Citas</DialogTitle>
                <DialogContent>
                    <TextField
                        label="Número de Citas"
                        type="number"
                        fullWidth
                        value={numCitas}
                        onChange={(e) => setNumCitas(e.target.value)}
                        sx={{ marginBottom: 2 }}
                    />
                    <TextField
                        label="Precio por Cita"
                        type="number"
                        fullWidth
                        value={precio}
                        onChange={(e) => setPrecio(e.target.value)}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCerrarModal} color="secondary">Cancelar</Button>
                    <Button onClick={handleGuardar} color="primary" variant="contained">Guardar</Button>
                </DialogActions>
            </Dialog>

            <Snackbar open={alerta.open} autoHideDuration={4000} onClose={() => setAlerta({ ...alerta, open: false })}>
                <Alert onClose={() => setAlerta({ ...alerta, open: false })} severity={alerta.severity} sx={{ width: "100%" }}>
                    {alerta.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default TratamientosPendientes;
