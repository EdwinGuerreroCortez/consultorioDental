import React, { useEffect, useState } from "react";
import axios from "axios";
import {
    Box,
    Typography,
    Grid,
    Card,
    CircularProgress,
    Avatar,
    Chip,
    Alert,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    LinearProgress,
} from "@mui/material";
import {
    MonetizationOn,
    Star,
    EmojiEvents,
    TrendingUp,
    Person,
} from "@mui/icons-material";
import { motion } from "framer-motion";

const primaryColor = "#1e40af"; // Azul oscuro bonito
const bgGradient = "linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)";
//Gamificacion front en Render
const ReporteGamificacionAlineado = () => {
    const [resumen, setResumen] = useState(null);
    const [topPacientes, setTopPacientes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchResumen = async () => {
        try {
            // 🔁 Endpoint correcto del backend que montaste en Express
            const response = await axios.get(
                "https://backenddent.onrender.com/api/gamificacion/resumen"
            );

            if (!response.data?.ok) throw new Error("Respuesta no válida");

            const data = response.data.data || {};
            setResumen(data);
            setTopPacientes(data.top_pacientes || []);
        } catch (err) {
            console.error(err);
            setError("Error al cargar el reporte.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchResumen();
    }, []);

    const medalIcons = [
        { color: "#FFD700", label: "Oro" },     // 1er lugar
        { color: "#C0C0C0", label: "Plata" },   // 2do lugar
        { color: "#CD7F32", label: "Bronce" },  // 3er lugar
    ];

    if (loading) {
        return (
            <Box
                display="flex"
                flexDirection="column"
                alignItems="center"
                justifyContent="center"
                minHeight="80vh"
            >
                <CircularProgress sx={{ color: primaryColor }} size={60} />
                <Typography sx={{ mt: 2, fontWeight: 500, color: "#555" }}>
                    Cargando reporte...
                </Typography>
            </Box>
        );
    }

    if (error) {
        return (
            <Box sx={{ maxWidth: 1200, mx: "auto", p: 3 }}>
                <Alert severity="error" sx={{ borderRadius: 3 }}>
                    {error}
                </Alert>
            </Box>
        );
    }

    if (!resumen) {
        return (
            <Box sx={{ maxWidth: 1200, mx: "auto", p: 3 }}>
                <Alert severity="info" sx={{ borderRadius: 3 }}>
                    No hay datos disponibles aún.
                </Alert>
            </Box>
        );
    }

    return (
        <Box
            sx={{
                p: { xs: 2, md: 4 },
                fontFamily: "'Poppins', sans-serif",
                backgroundColor: "#f8fafc",
                minHeight: "100vh",
                maxWidth: "1200px",
                mx: "auto",
            }}
        >
            {/* Título */}
            <Typography
                variant="h3"
                sx={{
                    mb: 5,
                    fontWeight: "bold",
                    textAlign: "center",
                    background: bgGradient,
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                }}
            >
                Reporte de Gamificación
            </Typography>

            {/* Tarjetas de Resumen */}
            <Grid container spacing={4} sx={{ mb: 6 }}>
                {[
                    {
                        title: "Puntos Otorgados",
                        value: resumen.total_puntos_otorgados ?? 0,
                        icon: <MonetizationOn sx={{ fontSize: 36, color: "#f59e0b" }} />,
                        bg: "#fff7e6",
                        border: "#fed7aa",
                    },
                    {
                        title: "Logros Desbloqueados",
                        value: resumen.total_logros_desbloqueados ?? 0,
                        icon: <Star sx={{ fontSize: 36, color: "#10b981" }} />,
                        bg: "#ecfdf5",
                        border: "#a7f3d0",
                    },
                    {
                        title: "Recompensas Canjeadas",
                        value: resumen.total_recompensas_canjeadas ?? 0,
                        icon: <EmojiEvents sx={{ fontSize: 36, color: "#3b82f6" }} />,
                        bg: "#eff6ff",
                        border: "#93c5fd",
                    },
                ].map((stat, i) => (
                    <Grid item xs={12} sm={4} key={i}>
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                        >
                            <Card
                                sx={{
                                    borderRadius: 4,
                                    border: `2px solid ${stat.border}`,
                                    backgroundColor: stat.bg,
                                    boxShadow: "0 8px 20px rgba(0,0,0,0.06)",
                                    height: "100%",
                                    display: "flex",
                                    flexDirection: "column",
                                    justifyContent: "center",
                                    alignItems: "center",
                                    py: 3,
                                    textAlign: "center",
                                    transition: "0.3s",
                                    "&:hover": {
                                        transform: "translateY(-6px)",
                                        boxShadow: "0 12px 30px rgba(0,0,0,0.12)",
                                    },
                                }}
                            >
                                <Avatar
                                    sx={{
                                        bgcolor: "white",
                                        width: 70,
                                        height: 70,
                                        mb: 2,
                                        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                                    }}
                                >
                                    {stat.icon}
                                </Avatar>
                                <Typography
                                    variant="subtitle1"
                                    sx={{ fontWeight: 600, color: "#374151", mb: 1 }}
                                >
                                    {stat.title}
                                </Typography>
                                <Typography
                                    variant="h3"
                                    sx={{ fontWeight: "bold", color: primaryColor }}
                                >
                                    {Number(stat.value).toLocaleString()}
                                </Typography>
                            </Card>
                        </motion.div>
                    </Grid>
                ))}
            </Grid>

            {/* Top Pacientes */}
            <Typography
                variant="h5"
                sx={{
                    mb: 3,
                    fontWeight: "bold",
                    color: primaryColor,
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                }}
            >
                <TrendingUp sx={{ color: "#3b82f6" }} />
                Top Pacientes Más Activos
            </Typography>

            {topPacientes.length === 0 ? (
                <Card sx={{ p: 4, textAlign: "center", borderRadius: 3 }}>
                    <Typography color="text.secondary">
                        No hay pacientes registrados.
                    </Typography>
                </Card>
            ) : (
                <TableContainer
                    component={Paper}
                    sx={{
                        borderRadius: 3,
                        overflow: "hidden",
                        boxShadow: "0 8px 25px rgba(0,0,0,0.1)",
                        border: "1px solid #e2e8f0",
                    }}
                >
                    <Table>
                        <TableHead>
                            <TableRow sx={{ background: primaryColor }}>
                                <TableCell
                                    sx={{
                                        color: "white",
                                        fontWeight: "bold",
                                        width: "60px",
                                    }}
                                >
                                    #
                                </TableCell>
                                <TableCell
                                    sx={{ color: "white", fontWeight: "bold" }}
                                >
                                    Paciente
                                </TableCell>
                                <TableCell
                                    sx={{
                                        color: "white",
                                        fontWeight: "bold",
                                        textAlign: "center",
                                    }}
                                >
                                    Puntos
                                </TableCell>
                                <TableCell
                                    sx={{
                                        color: "white",
                                        fontWeight: "bold",
                                        textAlign: "center",
                                    }}
                                >
                                    Medalla
                                </TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {topPacientes.map((p, i) => (
                                <TableRow
                                    key={p.usuario_id}
                                    sx={{
                                        "&:hover": { backgroundColor: "#f8fafc" },
                                        height: 70,
                                    }}
                                >
                                    {/* Posición */}
                                    <TableCell>
                                        <Typography
                                            fontWeight="bold"
                                            color={primaryColor}
                                        >
                                            {i + 1}
                                        </Typography>
                                    </TableCell>

                                    {/* Nombre + ID */}
                                    <TableCell>
                                        <Box
                                            display="flex"
                                            alignItems="center"
                                            gap={1.5}
                                        >
                                            <Avatar
                                                sx={{
                                                    bgcolor:
                                                        i < 3
                                                            ? medalIcons[i].color
                                                            : "#94a3b8",
                                                    width: 40,
                                                    height: 40,
                                                    fontSize: "1rem",
                                                    fontWeight: "bold",
                                                    color:
                                                        i < 3
                                                            ? "#000"
                                                            : "#fff",
                                                }}
                                            >
                                                {i < 3 ? (
                                                    <EmojiEvents />
                                                ) : (
                                                    <Person />
                                                )}
                                            </Avatar>
                                            <Box>
                                                <Typography
                                                    fontWeight={600}
                                                    sx={{
                                                        textTransform:
                                                            "capitalize",
                                                    }}
                                                >
                                                    {p.nombre}{" "}
                                                    {p.apellido_paterno}
                                                </Typography>
                                                <Typography
                                                    variant="caption"
                                                    color="text.secondary"
                                                >
                                                    ID: {p.usuario_id}
                                                </Typography>
                                            </Box>
                                        </Box>
                                    </TableCell>

                                    {/* Puntos */}
                                    <TableCell align="center">
                                        <Chip
                                            label={`${Number(
                                                p.puntos_ganados || 0
                                            ).toLocaleString()} pts`}
                                            sx={{
                                                backgroundColor:
                                                    i === 0
                                                        ? "#fff7e6"
                                                        : "#f1f5f9",
                                                color:
                                                    i === 0
                                                        ? "#d97706"
                                                        : primaryColor,
                                                fontWeight: "bold",
                                                border: `1px solid ${i === 0
                                                    ? "#fed7aa"
                                                    : "#cbd5e1"
                                                    }`,
                                                borderRadius: 3,
                                            }}
                                        />
                                    </TableCell>

                                    {/* Medalla */}
                                    <TableCell align="center">
                                        {i < 3 ? (
                                            <Box
                                                sx={{
                                                    width: 44,
                                                    height: 44,
                                                    borderRadius: "50%",
                                                    backgroundColor:
                                                        medalIcons[i].color,
                                                    display: "flex",
                                                    alignItems: "center",
                                                    justifyContent: "center",
                                                    mx: "auto",
                                                    boxShadow:
                                                        "0 4px 12px rgba(0,0,0,0.2)",
                                                }}
                                            >
                                                <EmojiEvents
                                                    sx={{
                                                        color: "white",
                                                        fontSize: 26,
                                                    }}
                                                />
                                            </Box>
                                        ) : (
                                            <Box
                                                sx={{
                                                    width: 44,
                                                    height: 44,
                                                }}
                                            />
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}

            {/* Footer */}
            <Box sx={{ mt: 6, textAlign: "center" }}>
                <LinearProgress
                    variant="determinate"
                    value={100}
                    sx={{
                        height: 6,
                        borderRadius: 3,
                        backgroundColor: "#e2e8f0",
                        "& .MuiLinearProgress-bar": { background: bgGradient },
                    }}
                />
                <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{
                        mt: 1,
                        display: "block",
                        fontWeight: 500,
                    }}
                >
                    Reporte actualizado al{" "}
                    {new Date().toLocaleDateString("es-MX", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                    })}
                </Typography>
            </Box>
        </Box>
    );
};

export default ReporteGamificacionAlineado;
