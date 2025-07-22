import React, { useEffect, useState } from "react";
import axios from "axios";
import { verificarAutenticacion } from "../../utils/auth";
import {
    Box,
    Typography,
    Card,
    CardContent,
    CircularProgress,
    Chip,
    ThemeProvider,
    createTheme,
    IconButton,
    Tooltip,
    Button,
} from "@mui/material";
import { Healing, ArrowBack, Add } from "@mui/icons-material";
import { styled } from "@mui/system";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

// Definir el tema con la fuente "Geologica"
const theme = createTheme({
    typography: {
        fontFamily: "'Geologica', sans-serif",
    },
    palette: {
        primary: {
            main: "#0077b6",
        },
        secondary: {
            main: "#48cae4",
        },
    },
});

// Styled components
const HeaderBox = styled(Box)(({ theme }) => ({
    background: "linear-gradient(135deg, #0077b6 0%, #48cae4 100%)",
    color: "#ffffff",
    padding: theme.spacing(2.5),
    borderRadius: "16px 16px 0 0",
    display: "flex",
    alignItems: "center",
    gap: "12px",
    boxShadow: "0 6px 20px rgba(0, 119, 182, 0.3)",
    width: "100%",
    maxWidth: "1400px",
    position: "relative",
    overflow: "hidden",
    "&:before": {
        content: '""',
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        background: "rgba(255, 255, 255, 0.15)",
        clipPath: "polygon(0 0, 40% 0, 20% 100%, 0% 100%)",
        zIndex: 0,
    },
}));

const TreatmentCard = styled(Card)(({ theme }) => ({
    backgroundColor: "#ffffff",
    borderRadius: "12px",
    marginBottom: theme.spacing(2),
    boxShadow: "0 4px 15px rgba(0, 0, 0, 0.08)",
    border: "1px solid rgba(0, 119, 182, 0.1)",
    transition: "all 0.3s ease",
    "&:hover": {
        transform: "translateY(-4px)",
        boxShadow: "0 6px 20px rgba(0, 119, 182, 0.15)",
    },
    padding: theme.spacing(1),
}));

const TratamientosActivos = () => {
    const [tratamientos, setTratamientos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [usuarioId, setUsuarioId] = useState(null);
    const navigate = useNavigate();

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
                const response = await axios.get(`https://backenddent.onrender.com/api/tratamientos-pacientes/activo/${usuarioId}`, {
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

    // Animaciones
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { duration: 0.8, ease: "easeOut" } },
    };

    const cardVariants = {
        hidden: { opacity: 0, y: 30 },
        visible: (i) => ({
            opacity: 1,
            y: 0,
            transition: { delay: i * 0.1, duration: 0.6, ease: "easeOut" },
        }),
    };

    const handleGoBack = () => {
        navigate(-1);
    };

    const handleScheduleNewTreatment = () => {
        navigate("/agendar-cita"); // Ajusta esta ruta según tu aplicación
    };

    return (
        <ThemeProvider theme={theme}>
            <Box
                sx={{
                    minHeight: "100vh",
                    width: "100%",
                    padding: { xs: "2rem", md: "3rem" },
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    background: "linear-gradient(145deg, #f5faff 0%, #e0eefc 100%)",
                }}
            >
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    style={{ width: "100%", maxWidth: "1400px" }}
                >
                    {/* Back Button */}
                    <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                        <IconButton
                            onClick={handleGoBack}
                            sx={{
                                position: "absolute",
                                top: "20px",
                                left: "20px",
                                color: "#0077b6",
                                "&:hover": { color: "#01579b" },
                            }}
                            aria-label="Volver atrás"
                        >
                            <ArrowBack fontSize="medium" />
                        </IconButton>
                    </motion.div>

                    {/* Header */}
                    <HeaderBox>
                        <motion.div
                            animate={{ rotate: [0, 10, -10, 0] }}
                            transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                        >
                            <Healing sx={{ fontSize: { xs: 26, md: 30 }, zIndex: 1 }} />
                        </motion.div>
                        <Typography
                            variant="h5"
                            sx={{
                                fontWeight: 600,
                                fontSize: { xs: "1.25rem", md: "1.5rem" },
                                textShadow: "1px 1px 4px rgba(0, 0, 0, 0.2)",
                                zIndex: 1,
                            }}
                        >
                            Mis Tratamientos Activos
                        </Typography>
                    </HeaderBox>

                    {/* Main Content */}
                    <Box
                        sx={{
                            width: "100%",
                            maxWidth: "1400px",
                            backgroundColor: "#ffffff",
                            borderRadius: "0 0 16px 16px",
                            padding: { xs: "1.5rem", md: "2rem" },
                            boxShadow: "0 6px 20px rgba(0, 0, 0, 0.08)",
                        }}
                    >
                        {loading ? (
                            <Box sx={{ display: "flex", justifyContent: "center", padding: "2rem" }}>
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ duration: 0.5 }}
                                >
                                    <CircularProgress sx={{ color: "#0077b6" }} size={40} thickness={5} />
                                </motion.div>
                            </Box>
                        ) : tratamientos.length > 0 ? (
                            tratamientos.map((t, index) => (
                                <motion.div
                                    key={index}
                                    custom={index}
                                    variants={cardVariants}
                                    initial="hidden"
                                    animate="visible"
                                >
                                    <TreatmentCard>
                                        <CardContent
                                            sx={{
                                                display: "flex",
                                                flexDirection: { xs: "column", md: "row" },
                                                alignItems: { xs: "flex-start", md: "center" },
                                                justifyContent: "space-between",
                                                padding: { xs: "1rem", md: "1.25rem" },
                                            }}
                                        >
                                            <Box sx={{ display: "flex", alignItems: "center", gap: "14px", flexGrow: 1 }}>
                                                <Healing sx={{ color: "#0077b6", fontSize: { xs: 22, md: 26 } }} />
                                                <Box sx={{ flexGrow: 1 }}>
                                                    <Typography
                                                        variant="body1"
                                                        sx={{
                                                            fontWeight: 500,
                                                            fontSize: { xs: "0.85rem", md: "0.95rem" },
                                                            color: "#333",
                                                        }}
                                                    >
                                                        {t.tratamiento_nombre}
                                                    </Typography>
                                                    <Typography
                                                        variant="caption"
                                                        sx={{
                                                            color: "#777",
                                                            mt: 0.5,
                                                            fontSize: { xs: "0.7rem", md: "0.8rem" },
                                                        }}
                                                    >
                                                        {`${t.nombre} ${t.apellido_paterno} ${t.apellido_materno}`} | Citas: {t.citas_asistidas}/{t.citas_totales}
                                                    </Typography>
                                                </Box>
                                            </Box>
                                            <Box
                                                sx={{
                                                    display: "flex",
                                                    gap: "10px",
                                                    mt: { xs: 1.5, md: 0 },
                                                    alignItems: "center",
                                                    flexShrink: 0,
                                                }}
                                            >
                                                <Tooltip title="Estado del Tratamiento" arrow>
                                                    <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                                                        <Chip
                                                            label={t.estado}
                                                            color={t.estado === "en progreso" ? "success" : "warning"}
                                                            size="small"
                                                            sx={{
                                                                fontWeight: 500,
                                                                fontSize: { xs: "0.65rem", md: "0.75rem" },
                                                                padding: "4px 8px",
                                                                borderRadius: "8px",
                                                                boxShadow: "0 2px 6px rgba(0, 0, 0, 0.1)",
                                                            }}
                                                        />
                                                    </motion.div>
                                                </Tooltip>
                                            </Box>
                                        </CardContent>
                                    </TreatmentCard>
                                </motion.div>
                            ))
                        ) : (
                            <Box sx={{ textAlign: "center", padding: "3rem" }}>
                                <Typography
                                    variant="body1"
                                    sx={{
                                        color: "#666",
                                        fontSize: { xs: "0.9rem", md: "1rem" },
                                        mb: 2.5,
                                        fontStyle: "italic",
                                    }}
                                >
                                    No tienes tratamientos activos en este momento.
                                </Typography>
                                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                    <Button
                                        variant="contained"
                                        onClick={handleScheduleNewTreatment}
                                        startIcon={<Add />}
                                        sx={{
                                            backgroundColor: "#0077b6",
                                            borderRadius: "10px",
                                            textTransform: "none",
                                            fontSize: { xs: "0.8rem", md: "0.85rem" },
                                            fontWeight: 500,
                                            padding: { xs: "8px 18px", md: "10px 22px" },
                                            boxShadow: "0 4px 12px rgba(0, 119, 182, 0.2)",
                                            "&:hover": {
                                                backgroundColor: "#01579b",
                                                boxShadow: "0 6px 15px rgba(0, 119, 182, 0.3)",
                                            },
                                        }}
                                    >
                                        Agendar Nuevo Tratamiento
                                    </Button>
                                </motion.div>
                            </Box>
                        )}
                    </Box>
                </motion.div>
            </Box>
        </ThemeProvider>
    );
};

export default TratamientosActivos;