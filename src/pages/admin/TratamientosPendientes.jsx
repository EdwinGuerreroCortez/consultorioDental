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
    Pagination
} from "@mui/material";
import axios from "axios";

const TratamientosPendientes = () => {
    const [tratamientos, setTratamientos] = useState([]);
    const [pagina, setPagina] = useState(1);
    const [alerta, setAlerta] = useState({ open: false, message: "", severity: "success" });
    const [loading, setLoading] = useState(true);
    const elementosPorPagina = 10;

    // Función para obtener los tratamientos sin modificar loading después de la primera carga
    const obtenerTratamientos = (isFirstLoad = false) => {
        axios.get("http://localhost:4000/api/tratamientos-pacientes/pendientes")
            .then(response => {
                const tratamientosPendientes = response.data.map(tratamiento => ({
                    ...tratamiento,
                    sexo: tratamiento.sexo === "femenino" ? "F" : tratamiento.sexo === "masculino" ? "M" : "N/A"
                }));
                setTratamientos(tratamientosPendientes);
                if (isFirstLoad) setLoading(false); // Solo ocultar el loading en la primera carga
            })
            .catch(error => {
                console.error("Error al obtener tratamientos pendientes:", error);
                setAlerta({ open: true, message: "Error al cargar los tratamientos pendientes", severity: "error" });
                if (isFirstLoad) setLoading(false); // Asegurar que loading se oculta en la primera carga
            });
    };

    // useEffect para la primera carga
    useEffect(() => {
        obtenerTratamientos(true); // Cargar datos iniciales con loading visible
    }, []);

    // useEffect para actualización automática cada 3 segundos (sin modificar loading)
    useEffect(() => {
        const intervalo = setInterval(() => {
            obtenerTratamientos(false); // No modifica loading
        }, 3000);

        return () => clearInterval(intervalo); // Limpiar intervalo al desmontar
    }, []);

    const handleChangePagina = (event, value) => {
        setPagina(value);
    };

    const tratamientosPaginados = tratamientos.slice((pagina - 1) * elementosPorPagina, pagina * elementosPorPagina);
    const filasFaltantes = elementosPorPagina - tratamientosPaginados.length;

    return (
        <Box sx={{ padding: "2rem", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
            {/* Encabezado */}
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
                    marginBottom: "2rem"
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
                                    <TableCell sx={{ fontWeight: "bold", textAlign: "center" }}>#</TableCell>
                                    {["Nombre", "Apellido Paterno", "Apellido Materno", "Teléfono", "Email", "Edad", "Sexo", "Tratamiento", "Fecha de Inicio"].map((header) => (
                                        <TableCell key={header} sx={{ fontWeight: "bold", textAlign: "center" }}>{header}</TableCell>
                                    ))}
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {tratamientosPaginados.map((tratamiento, index) => (
                                    <TableRow key={tratamiento.id} sx={{ "&:hover": { backgroundColor: "#eef3ff" } }}>
                                        <TableCell sx={{ textAlign: "center" }}>{(pagina - 1) * elementosPorPagina + index + 1}</TableCell>
                                        {[tratamiento.nombre, tratamiento.apellido_paterno, tratamiento.apellido_materno, tratamiento.telefono, tratamiento.email || "N/A", tratamiento.fecha_nacimiento || "N/A", tratamiento.sexo, tratamiento.tratamiento_nombre, tratamiento.fecha_inicio || "N/A"].map((value, i) => (
                                            <TableCell key={i} sx={{ textAlign: "center" }}>{value}</TableCell>
                                        ))}
                                    </TableRow>
                                ))}
                                {Array.from({ length: filasFaltantes }).map((_, index) => (
                                    <TableRow key={`empty-${index}`}>
                                        <TableCell sx={{ textAlign: "center" }}>{(pagina - 1) * elementosPorPagina + tratamientosPaginados.length + index + 1}</TableCell>
                                        {Array(9).fill("-").map((_, i) => (
                                            <TableCell key={i} sx={{ textAlign: "center" }}>-</TableCell>
                                        ))}
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                )}
            </Box>

            <Box sx={{ display: "flex", justifyContent: "center", marginTop: "0.5rem", marginBottom: "7rem", padding: "0.5rem" }}>
                <Pagination
                    count={Math.ceil(tratamientos.length / elementosPorPagina)}
                    page={pagina}
                    onChange={handleChangePagina}
                    color="primary"
                    size="large"
                />
            </Box>

            <Snackbar open={alerta.open} autoHideDuration={6000} onClose={() => setAlerta({ ...alerta, open: false })}>
                <Alert onClose={() => setAlerta({ ...alerta, open: false })} severity={alerta.severity}>
                    {alerta.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default TratamientosPendientes;
