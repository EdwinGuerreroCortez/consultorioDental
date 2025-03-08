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
                        boxShadow: "0 6px 24px rgba(0,0,0,0.08)", // Sombra más pronunciada
                        overflow: "hidden",
                        background: "#fff"
                    }}>
                        <Table>
                            <TableHead sx={{ 
                                background: "linear-gradient(90deg, #0077b6 0%, #48cae4 100%)" // Ajusté al color original
                            }}>
                                <TableRow>
                                    <TableCell sx={{ 
                                        color: "#fff", 
                                        fontWeight: 600, 
                                        textAlign: "center",
                                        fontFamily: "'Roboto', sans-serif",
                                        borderBottom: "none"
                                    }}>#</TableCell>
                                    {["Nombre", "Apellido Paterno", "Apellido Materno", "Edad", "Sexo", "Teléfono", "Email", "Tratamiento", "Fecha de Inicio", "Citas Totales", "Citas Asistidas", "Estado"].map((header) => (
                                        <TableCell key={header} sx={{ 
                                            color: "#fff", 
                                            fontWeight: 600, 
                                            textAlign: "center",
                                            fontFamily: "'Roboto', sans-serif",
                                            borderBottom: "none"
                                        }}>
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
                                                boxShadow: "inset 0 2px 8px rgba(0,0,0,0.05)" // Sombra interna al pasar el ratón
                                            },
                                            borderBottom: "1px solid #eef3f7"
                                        }}
                                    >
                                        <TableCell sx={{ 
                                            textAlign: "center",
                                            color: "#444",
                                            fontFamily: "'Roboto', sans-serif"
                                        }}>
                                            {(pagina - 1) * elementosPorPagina + index + 1}
                                        </TableCell>
                                        {[tratamiento.nombre, tratamiento.apellido_paterno, tratamiento.apellido_materno, tratamiento.edad || "N/A", tratamiento.sexo, tratamiento.telefono, tratamiento.email || "N/A", tratamiento.tratamiento_nombre, tratamiento.fecha_inicio || "N/A", tratamiento.citas_totales, tratamiento.citas_asistidas, tratamiento.estado].map((value, i) => (
                                            <TableCell 
                                                key={i} 
                                                sx={{ 
                                                    textAlign: "center",
                                                    color: "#444",
                                                    fontFamily: "'Roboto', sans-serif",
                                                    py: "1.2rem"
                                                }}
                                            >
                                                {value}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                ))}
                                {Array.from({ length: filasFaltantes }).map((_, index) => (
                                    <TableRow key={`empty-${index}`}>
                                        <TableCell sx={{ textAlign: "center", color: "#999" }}>
                                            {(pagina - 1) * elementosPorPagina + tratamientosPaginados.length + index + 1}
                                        </TableCell>
                                        {Array(12).fill("-").map((_, i) => (
                                            <TableCell key={i} sx={{ textAlign: "center", color: "#999", py: "1.2rem" }}>-</TableCell>
                                        ))}
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                )}
            </Box>

            {/* Paginación */}
            <Box sx={{ 
                display: "flex", 
                justifyContent: "center", 
                mt: "2rem", 
                mb: "4rem" 
            }}>
                <Pagination
                    count={Math.ceil(tratamientos.length / elementosPorPagina)}
                    page={pagina}
                    onChange={handleChangePagina}
                    color="primary"
                    size="large"
                    sx={{
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
            </Box>

            {/* Snackbar */}
            <Snackbar 
                open={alerta.open} 
                autoHideDuration={6000} 
                onClose={() => setAlerta({ ...alerta, open: false })} 
                anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
            >
                <Alert 
                    onClose={() => setAlerta({ ...alerta, open: false })} 
                    severity={alerta.severity} 
                    sx={{ 
                        width: "100%",
                        borderRadius: "8px",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
                    }}
                >
                    {alerta.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default TratamientosEnCurso;