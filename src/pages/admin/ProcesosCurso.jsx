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
    Button,
    Pagination,
    Stack
} from "@mui/material";
import CircularProgress from '@mui/material/CircularProgress';

import axios from "axios";

const TratamientosEnCurso = () => {
    const [tratamientos, setTratamientos] = useState([]);
    const [pagina, setPagina] = useState(1);
    const [alerta, setAlerta] = useState({ open: false, message: "", severity: "success" });
    const [loading, setLoading] = useState(true);
    const elementosPorPagina = 10;

    useEffect(() => {
        axios.get("http://localhost:4000/api/tratamientos-pacientes/en-progreso")
            .then(response => {
                const tratamientosEnProgreso = response.data.map(tratamiento => ({
                    ...tratamiento,
                    sexo: tratamiento.sexo === "femenino" ? "F" : tratamiento.sexo === "masculino" ? "M" : "N/A"
                }));
                setTratamientos(tratamientosEnProgreso);
                setLoading(false);
            })
            .catch(error => {
                console.error("Error al obtener tratamientos en curso:", error);
                setAlerta({ open: true, message: "Error al cargar los tratamientos", severity: "error" });
                setLoading(false);
            });
    }, []);

    const handleChangePagina = (event, value) => {
        setPagina(value);
    };

    const tratamientosPaginados = tratamientos.slice((pagina - 1) * elementosPorPagina, pagina * elementosPorPagina);
    const filasFaltantes = elementosPorPagina - tratamientosPaginados.length;

    return (
        <Box sx={{ padding: "2rem", minHeight: "100vh", display: "flex", flexDirection: "column" }}>

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
                    marginBottom: "2rem"  // <-- Agregar este margen para mayor separación


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
                    TRATAMIENTOS EN CURSO
                </Typography>

            </Box>

            <Box sx={{ flexGrow: 1 }}>
                {loading ? (
                    <Typography align="center" sx={{ marginTop: "2rem", color: "#666" }}>
                        <svg width={0} height={0}>
                            <defs>
                                <linearGradient id="my_gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                                    <stop offset="0%" stopColor="#e01cd5" />
                                    <stop offset="100%" stopColor="#1CB5E0" />
                                </linearGradient>
                            </defs>
                        </svg>
                        <CircularProgress
                            sx={{ 'svg circle': { stroke: 'url(#my_gradient)' } }}
                        />
                    </Typography>
                ) : (
                    <TableContainer component={Paper} sx={{ borderRadius: "12px", boxShadow: 3 }}>
                        <Table>
                            <TableHead sx={{ backgroundColor: "#d8eaff" }}>
                                <TableRow>
                                    <TableCell sx={{ fontWeight: "bold", textAlign: "center" }}>#</TableCell>
                                    {["Nombre", "Apellido Paterno", "Apellido Materno", "Teléfono", "Email", "Edad", "Sexo", "Tratamiento", "Citas Totales", "Citas Asistidas", "Estado", "Fecha de Inicio"].map((header) => (
                                        <TableCell key={header} sx={{ fontWeight: "bold", textAlign: "center" }}>{header}</TableCell>
                                    ))}
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {tratamientosPaginados.map((tratamiento, index) => (
                                    <TableRow key={tratamiento.id} sx={{ "&:hover": { backgroundColor: "#eef3ff" } }}>
                                        <TableCell sx={{ textAlign: "center" }}>{(pagina - 1) * elementosPorPagina + index + 1}</TableCell>
                                        {[tratamiento.nombre, tratamiento.apellido_paterno, tratamiento.apellido_materno, tratamiento.telefono, tratamiento.email || "N/A", tratamiento.edad || "N/A", tratamiento.sexo, tratamiento.tratamiento_nombre, tratamiento.citas_totales, tratamiento.citas_asistidas, tratamiento.estado, tratamiento.fecha_inicio || "N/A"].map((value, i) => (
                                            <TableCell key={i} sx={{ textAlign: "center" }}>{value}</TableCell>
                                        ))}
                                    </TableRow>
                                ))}
                                {Array.from({ length: filasFaltantes }).map((_, index) => (
                                    <TableRow key={`empty-${index}`}>
                                        <TableCell sx={{ textAlign: "center" }}>{(pagina - 1) * elementosPorPagina + tratamientosPaginados.length + index + 1}</TableCell>
                                        {Array(12).fill("-").map((_, i) => (
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
                    sx={{
                        "& .MuiPaginationItem-root": {
                            fontSize: "1.2rem",
                            padding: "8px",
                            margin: "4px",
                        }
                    }}
                />
            </Box>


            <Snackbar open={alerta.open} autoHideDuration={6000} onClose={() => setAlerta({ ...alerta, open: false })} anchorOrigin={{ vertical: "bottom", horizontal: "left" }}>
                <Alert onClose={() => setAlerta({ ...alerta, open: false })} severity={alerta.severity} sx={{ width: "100%" }}>
                    {alerta.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default TratamientosEnCurso;
