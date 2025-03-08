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
            obtenerTratamientos();
            handleCerrarModal();
        } catch (error) {
            console.error("Error al asignar número de citas:", error);
            setAlerta({ open: true, message: "Error al asignar número de citas", severity: "error" });
        }
    };

    const tratamientosPaginados = tratamientos.slice((pagina - 1) * elementosPorPagina, pagina * elementosPorPagina);
    const cellStyle = {
        textAlign: "center",
        fontFamily: "'Roboto', sans-serif",
        color: "#333",
        fontSize: "1rem",
        py: "1.2rem"
    };

    return (
        <Box sx={{ padding: "2rem", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
            {/* Título con diseño de TratamientosEnCurso */}
            <Box
                sx={{
                    width: "100%",
                    maxWidth: "900px",
                    background: "linear-gradient(135deg, #0077b6, #48cae4)",
                    clipPath: "polygon(0 0, 100% 0, 80% 100%, 0% 100%)",
                    color: "#ffffff",
                    padding: "40px 40px",
                    borderRadius: "12px",
                    boxShadow: "0 6px 20px rgba(0, 0, 0, 0.1)",
                    textAlign: "left",
                    marginBottom: "2rem",
                    mx: "auto"
                }}
            >
                <Typography
                    variant="h4"
                    sx={{
                        fontWeight: "bold",
                        fontFamily: "'Poppins', sans-serif",
                        textShadow: "1px 1px 6px rgba(0, 0, 0, 0.2)",
                    }}
                >
                    TRATAMIENTOS PENDIENTES DE EVALUACIÓN
                </Typography>
            </Box>

            <Box sx={{ flexGrow: 1, maxWidth: "1200px", mx: "auto", width: "100%" }}>
                {loading ? (
                    <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "50vh" }}>
                        <CircularProgress
                            size={60}
                            sx={{ 
                                color: "#0077b6",
                                '& .MuiCircularProgress-circle': { strokeLinecap: 'round' }
                            }}
                        />
                    </Box>
                ) : (
                    <TableContainer component={Paper} sx={{ 
                        borderRadius: "16px", 
                        boxShadow: "0 6px 24px rgba(0,0,0,0.08)", 
                        overflow: "hidden" 
                    }}>
                        <Table>
                            <TableHead sx={{ background: "linear-gradient(90deg, #0077b6 0%, #48cae4 100%)" }}>
                                <TableRow>
                                    {["#", "Nombre", "Apellido Paterno", "Apellido Materno", "Teléfono", "Email", "Edad", "Sexo", "Tratamiento", "Fecha de Inicio", "Acción"].map((header) => (
                                        <TableCell 
                                            key={header} 
                                            sx={{ 
                                                ...cellStyle, 
                                                color: "#fff", 
                                                fontWeight: 600, 
                                                borderBottom: "none",
                                                fontSize: "1.1rem"
                                            }}
                                        >
                                            {header}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {tratamientosPaginados.map((tratamiento, index) => (
                                    <TableRow 
                                        key={tratamiento.id}
                                        sx={{ 
                                            "&:hover": { 
                                                backgroundColor: "#f8fbff",
                                                transition: "background-color 0.2s",
                                                boxShadow: "inset 0 2px 8px rgba(0,0,0,0.05)"
                                            }
                                        }}
                                    >
                                        <TableCell sx={cellStyle}>{(pagina - 1) * elementosPorPagina + index + 1}</TableCell>
                                        <TableCell sx={cellStyle}>{tratamiento.nombre}</TableCell>
                                        <TableCell sx={cellStyle}>{tratamiento.apellido_paterno}</TableCell>
                                        <TableCell sx={cellStyle}>{tratamiento.apellido_materno}</TableCell>
                                        <TableCell sx={cellStyle}>{tratamiento.telefono}</TableCell>
                                        <TableCell sx={cellStyle}>{tratamiento.email || "N/A"}</TableCell>
                                        <TableCell sx={cellStyle}>{tratamiento.fecha_nacimiento || "N/A"}</TableCell>
                                        <TableCell sx={cellStyle}>{tratamiento.sexo || "N/A"}</TableCell>
                                        <TableCell sx={cellStyle}>{tratamiento.tratamiento_nombre}</TableCell>
                                        <TableCell sx={cellStyle}>{tratamiento.fecha_inicio || "N/A"}</TableCell>
                                        <TableCell sx={cellStyle}>
                                            <Tooltip title="Evaluar">
                                                <IconButton 
                                                    onClick={() => handleAbrirModal(tratamiento)}
                                                    sx={{ 
                                                        color: "#0077b6",
                                                        "&:hover": { color: "#005f8d" }
                                                    }}
                                                >
                                                    <Assignment />
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

            {/* Paginación */}
            <Pagination
                count={Math.ceil(tratamientos.length / elementosPorPagina)}
                page={pagina}
                onChange={handleChangePagina}
                color="primary"
                size="large"
                sx={{
                    marginTop: "2rem",
                    alignSelf: "center",
                    "& .MuiPaginationItem-root": {
                        fontSize: "1.1rem",
                        padding: "8px 16px",
                        margin: "0 4px",
                        borderRadius: "8px",
                        backgroundColor: "#fff",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                        "&:hover": {
                            backgroundColor: "#0077b6",
                            color: "#fff"
                        }
                    },
                    "& .Mui-selected": {
                        backgroundColor: "#0077b6",
                        color: "#fff",
                        "&:hover": {
                            backgroundColor: "#005f8d"
                        }
                    }
                }}
            />

            {/* Modal para asignar citas y precio */}
            <Dialog 
                open={modalOpen} 
                onClose={handleCerrarModal}
                sx={{ "& .MuiDialog-paper": { borderRadius: "12px", boxShadow: "0 8px 32px rgba(0,0,0,0.1)" } }}
            >
                <DialogTitle sx={{ 
                    background: "linear-gradient(90deg, #0077b6 0%, #48cae4 100%)",
                    color: "#fff",
                    fontFamily: "'Poppins', sans-serif",
                    fontWeight: 600,
                    borderRadius: "12px 12px 0 0"
                }}>
                    Asignar Número de Citas
                </DialogTitle>
                <DialogContent sx={{ padding: "2rem" }}>
                    <TextField
                        label="Número de Citas"
                        type="number"
                        fullWidth
                        value={numCitas}
                        onChange={(e) => setNumCitas(e.target.value)}
                        sx={{ marginBottom: 2 }}
                        InputProps={{ inputProps: { min: 1 } }}
                    />
                    <TextField
                        label="Precio por Cita"
                        type="number"
                        fullWidth
                        value={precio}
                        onChange={(e) => setPrecio(e.target.value)}
                        InputProps={{ inputProps: { min: 0, step: 0.01 } }}
                    />
                </DialogContent>
                <DialogActions sx={{ padding: "0 2rem 1.5rem" }}>
                    <Button 
                        onClick={handleCerrarModal} 
                        color="inherit" 
                        sx={{ borderRadius: "8px", textTransform: "none" }}
                    >
                        Cancelar
                    </Button>
                    <Button 
                        onClick={handleGuardar} 
                        variant="contained"
                        sx={{ 
                            borderRadius: "8px", 
                            textTransform: "none",
                            background: "linear-gradient(45deg, #0077b6, #48cae4)",
                            "&:hover": { background: "linear-gradient(45deg, #005f8d, #2196f3)" }
                        }}
                    >
                        Guardar
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Snackbar */}
            <Snackbar 
                open={alerta.open} 
                autoHideDuration={4000} 
                onClose={() => setAlerta({ ...alerta, open: false })}
                anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
            >
                <Alert 
                    onClose={() => setAlerta({ ...alerta, open: false })} 
                    severity={alerta.severity} 
                    sx={{ width: "100%", borderRadius: "8px", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
                >
                    {alerta.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default TratamientosPendientes;