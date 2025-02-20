import React, { useEffect, useState } from "react";
import axios from "axios";
import { verificarAutenticacion } from "../../utils/auth";
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
    CircularProgress,
    Chip,
    ThemeProvider,
    createTheme,
} from "@mui/material";
import { Healing } from "@mui/icons-material";

// ✅ Definir el tema con la fuente "Geologica"
const theme = createTheme({
    typography: {
        fontFamily: "'Geologica', sans-serif",
    },
});

const TratamientosActivos = () => {
    const [tratamientos, setTratamientos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [usuarioId, setUsuarioId] = useState(null);

    useEffect(() => {
        const obtenerUsuario = async () => {
            const usuario = await verificarAutenticacion();
            if (usuario) {
                console.log("🔍 Usuario autenticado:", usuario);
                setUsuarioId(usuario.id);
            } else {
                console.error("❌ No se pudo obtener la sesión. Inicia sesión nuevamente.");
            }
        };
        obtenerUsuario();
    }, []);

    useEffect(() => {
        if (!usuarioId) return;

        const obtenerTratamientos = async () => {
            try {
                console.log(`📡 Solicitando tratamientos activos para usuarioId: ${usuarioId}`);
                const response = await axios.get(`http://localhost:4000/api/tratamientos-pacientes/activo/${usuarioId}`, {
                    withCredentials: true,
                });
                console.log("✅ Respuesta del backend:", response.data);
                setTratamientos(response.data);
                setLoading(false);
            } catch (error) {
                console.error("❌ Error al obtener tratamientos:", error);
                setLoading(false);
            }
        };
        obtenerTratamientos();
    }, [usuarioId]);

    return (
        <ThemeProvider theme={theme}>
            <Box sx={{ padding: "2rem", minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", backgroundColor: "#f0f8ff" }}>
                <Box
                    sx={{
                        width: "100%",
                    maxWidth: "900px",
                    background: "linear-gradient(135deg, #0077b6, #48cae4)",
                    clipPath: "polygon(0 0, 100% 0, 80% 100%, 0% 100%)",
                    color: "#ffffff",
                    padding: "20px 40px",
                    borderRadius: "12px",
                    boxShadow: "0 6px 20px rgba(0, 0, 0, 0.1)",
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    marginBottom: "2rem",
                    }}
                >
                    <Healing fontSize="large" />
                    <Typography variant="h4" sx={{ fontWeight: "bold", textShadow: "1px 1px 6px rgba(0, 0, 0, 0.3)" }}>
                        Tratamientos Activos
                    </Typography>
                </Box>

                {loading ? (
                    <CircularProgress />
                ) : (
                    <TableContainer component={Paper} sx={{ borderRadius: "12px", boxShadow: 4, width: "100%", maxWidth: "900px", overflow: "hidden" }}>
                        <Table>
                            <TableHead sx={{ backgroundColor: "#01579b" }}>
                                <TableRow>
                                    {["Paciente", "Tratamiento", "Citas Totales", "Citas Asistidas", "Estado"].map((header) => (
                                        <TableCell
                                            key={header}
                                            sx={{
                                                fontWeight: "bold",
                                                textAlign: "center",
                                                color: "#fff",
                                                fontSize: "1rem",
                                                padding: "14px",
                                            }}
                                        >
                                            {header}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {tratamientos.length > 0 ? (
                                    tratamientos.map((t, index) => (
                                        <TableRow
                                            key={index}
                                            sx={{
                                                "&:hover": { backgroundColor: "#e3f2fd" },
                                                transition: "0.3s",
                                            }}
                                        >
                                            <TableCell sx={{ textAlign: "center", fontSize: "0.95rem" }}>{`${t.nombre} ${t.apellido_paterno} ${t.apellido_materno}`}</TableCell>
                                            <TableCell sx={{ textAlign: "center", fontSize: "0.95rem", fontWeight: "bold" }}>{t.tratamiento_nombre}</TableCell>
                                            <TableCell sx={{ textAlign: "center", fontSize: "0.95rem" }}>{t.citas_totales}</TableCell>
                                            <TableCell sx={{ textAlign: "center", fontSize: "0.95rem" }}>{t.citas_asistidas}</TableCell>
                                            <TableCell sx={{ textAlign: "center" }}>
                                                <Chip
                                                    label={t.estado}
                                                    sx={{
                                                        fontSize: "0.85rem",
                                                        padding: "6px 12px",
                                                        fontWeight: "bold",
                                                        backgroundColor: t.estado === "en progreso" ? "#00c853" : "#ff9100",
                                                        color: "#fff",
                                                    }}
                                                />
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={5} sx={{ textAlign: "center", fontSize: "1rem", padding: "16px" }}>
                                            No hay tratamientos activos.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                )}
            </Box>
        </ThemeProvider>
    );
};

export default TratamientosActivos;
