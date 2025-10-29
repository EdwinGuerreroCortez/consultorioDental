import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import {
    Box,
    Typography,
    Card,
    CardContent,
    Chip,
    Stack,
    Divider,
    CircularProgress,
    Alert,
    Snackbar,
    Grid,
} from "@mui/material";
import RedeemIcon from "@mui/icons-material/Redeem";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import HourglassBottomIcon from "@mui/icons-material/HourglassBottom";
import CancelIcon from "@mui/icons-material/Cancel";
import DoneAllIcon from "@mui/icons-material/DoneAll";
import { verificarAutenticacion } from "../../utils/auth";

const MisCupones = () => {
    const [usuarioId, setUsuarioId] = useState(null);
    const [csrfToken, setCsrfToken] = useState(null);

    const [cupones, setCupones] = useState([]);
    const [loading, setLoading] = useState(true);

    const [alerta, setAlerta] = useState({
        open: false,
        mensaje: "",
        tipo: "success",
    });

    // instancia axios local
    const axiosInstance = useMemo(
        () =>
            axios.create({
                baseURL: "https://backenddent.onrender.com/api",
                withCredentials: true,
            }),
        []
    );

    // 1. Obtener token CSRF
    useEffect(() => {
        const obtenerTokenCSRF = async () => {
            try {
                const resp = await fetch("https://backenddent.onrender.com/api/get-csrf-token", {
                    credentials: "include",
                });
                const data = await resp.json();
                setCsrfToken(data.csrfToken);
            } catch (err) {
                console.error("Error obteniendo el token CSRF:", err);
                setAlerta({
                    open: true,
                    mensaje: "Error al obtener token de seguridad.",
                    tipo: "error",
                });
            }
        };
        obtenerTokenCSRF();
    }, []);

    // 2. Obtener usuario autenticado
    useEffect(() => {
        const obtenerUsuario = async () => {
            try {
                const usuario = await verificarAutenticacion();
                if (usuario && usuario.id) {
                    setUsuarioId(usuario.id);
                } else {
                    setAlerta({
                        open: true,
                        mensaje: "No se detectó sesión activa. Inicia sesión.",
                        tipo: "error",
                    });
                }
            } catch (error) {
                console.error("Error verificando autenticación:", error);
                setAlerta({
                    open: true,
                    mensaje: "Error al verificar tu sesión.",
                    tipo: "error",
                });
            }
        };
        obtenerUsuario();
    }, []);

    // 3. Obtener cupones del usuario (cuando ya tengo csrf y usuarioId)
    useEffect(() => {
        const cargarCupones = async () => {
            if (!csrfToken || !usuarioId) return;

            try {
                setLoading(true);
                const resp = await axiosInstance.get(
                    `/recompensas/mis-solicitudes/${usuarioId}`,
                    {
                        headers: {
                            "X-XSRF-TOKEN": csrfToken,
                        },
                    }
                );

                // resp.data debe ser array
                const data = Array.isArray(resp.data) ? resp.data : [];

                // orden: más reciente primero
                data.sort((a, b) => {
                    const fa = new Date(a.solicitado_en).getTime();
                    const fb = new Date(b.solicitado_en).getTime();
                    return fb - fa;
                });

                setCupones(data);
            } catch (error) {
                console.error("Error al obtener cupones:", error);
                setAlerta({
                    open: true,
                    mensaje: "Error al cargar tus cupones.",
                    tipo: "error",
                });
            } finally {
                setLoading(false);
            }
        };

        cargarCupones();
    }, [axiosInstance, csrfToken, usuarioId]);

    // helpers UI

    const formatoFechaBonita = (iso) => {
        if (!iso) return "—";
        const d = new Date(iso);
        const dia = d.getDate().toString().padStart(2, "0");
        const mes = (d.getMonth() + 1).toString().padStart(2, "0");
        const anio = d.getFullYear();
        const hh = d.getHours().toString().padStart(2, "0");
        const mm = d.getMinutes().toString().padStart(2, "0");
        return `${dia}/${mes}/${anio} ${hh}:${mm}`;
    };

    const chipEstado = (estadoRaw) => {
        // Normalizamos a mayúsculas
        const estado = (estadoRaw || "").toUpperCase();

        switch (estado) {
            case "PENDIENTE":
                return (
                    <Chip
                        icon={<HourglassBottomIcon />}
                        label="Pendiente"
                        color="warning"
                        size="small"
                        sx={{ fontWeight: "bold" }}
                    />
                );
            case "APROBADO":
                return (
                    <Chip
                        icon={<CheckCircleIcon />}
                        label="Aprobado (por recoger)"
                        color="info"
                        size="small"
                        sx={{ fontWeight: "bold" }}
                    />
                );
            case "ENTREGADO":
                return (
                    <Chip
                        icon={<DoneAllIcon />}
                        label="Entregado"
                        color="success"
                        size="small"
                        sx={{ fontWeight: "bold" }}
                    />
                );
            case "RECHAZADO":
                return (
                    <Chip
                        icon={<CancelIcon />}
                        label="Rechazado"
                        color="error"
                        size="small"
                        sx={{ fontWeight: "bold" }}
                    />
                );
            default:
                return (
                    <Chip
                        label={estadoRaw || "Desconocido"}
                        size="small"
                        sx={{ fontWeight: "bold" }}
                    />
                );
        }
    };

    return (
        <Box
            sx={{
                p: { xs: 2, md: 4 },
                backgroundColor: "#f9f9fb",
                minHeight: "100vh",
                fontFamily: "'Poppins', sans-serif",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
            }}
        >
            {/* Header */}
            <Box
                sx={{
                    mb: 4,
                    textAlign: "center",
                    width: "100%",
                    maxWidth: "900px",
                }}
            >
                <Typography
                    variant="h3"
                    fontWeight="bold"
                    gutterBottom
                    sx={{
                        background: "linear-gradient(90deg, #0077b6, #00aaff)",
                        backgroundClip: "text",
                        WebkitBackgroundClip: "text",
                        color: "transparent",
                        fontFamily: "'Poppins', sans-serif",
                    }}
                >
                    Mis Cupones y Recompensas
                </Typography>

                <Typography
                    variant="body1"
                    color="text.secondary"
                    sx={{ maxWidth: "600px", mx: "auto" }}
                >
                    Aquí puedes ver el estado de cada recompensa que has canjeado con tus puntos.
                </Typography>
            </Box>

            {/* Loading */}
            {loading ? (
                <Box
                    sx={{
                        width: "100%",
                        maxWidth: "500px",
                        backgroundColor: "#fff",
                        borderRadius: 3,
                        boxShadow: 3,
                        p: 4,
                        textAlign: "center",
                    }}
                >
                    <CircularProgress sx={{ color: "#0077b6" }} />
                    <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mt: 2, fontFamily: "'Poppins', sans-serif" }}
                    >
                        Cargando tus cupones...
                    </Typography>
                </Box>
            ) : cupones.length === 0 ? (
                // Si no hay cupones
                <Card
                    sx={{
                        p: 4,
                        textAlign: "center",
                        borderRadius: 3,
                        boxShadow: 2,
                        backgroundColor: "#ffffff",
                        width: "100%",
                        maxWidth: "500px",
                    }}
                >
                    <RedeemIcon sx={{ fontSize: 60, color: "#0077b6", mb: 2 }} />
                    <Typography
                        variant="h6"
                        color="text.primary"
                        sx={{ fontWeight: "600", fontFamily: "'Poppins', sans-serif" }}
                    >
                        Aún no has canjeado recompensas
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Usa tus puntos y consigue beneficios exclusivos 😎
                    </Typography>
                </Card>
            ) : (
                // Grid de cupones
                <Grid container spacing={3} sx={{ maxWidth: "1200px" }}>
                    {cupones.map((c) => (
                        <Grid item xs={12} sm={6} md={4} key={c.id}>
                            <Card
                                sx={{
                                    borderRadius: 3,
                                    boxShadow: "0 12px 24px rgba(0,0,0,0.07)",
                                    overflow: "hidden",
                                    backgroundColor: "#ffffff",
                                    display: "flex",
                                    flexDirection: "column",
                                    height: "100%",
                                    border: "1px solid #e0f2fe",
                                }}
                            >
                                {/* Header visual del cupón */}
                                <Box
                                    sx={{
                                        background: "linear-gradient(135deg,#e0f7fa 0%,#b2ebf2 100%)",
                                        p: 3,
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "space-between",
                                    }}
                                >
                                    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                                        <Box
                                            sx={{
                                                width: 56,
                                                height: 56,
                                                borderRadius: "50%",
                                                backgroundColor: "#ffffff",
                                                border: "2px solid #0077b6",
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                boxShadow: "0 4px 10px rgba(0,0,0,0.15)",
                                            }}
                                        >
                                            <RedeemIcon sx={{ fontSize: 30, color: "#0077b6" }} />
                                        </Box>

                                        <Box>
                                            <Typography
                                                variant="subtitle1"
                                                sx={{
                                                    fontWeight: "bold",
                                                    color: "#00334e",
                                                    fontFamily: "'Poppins', sans-serif",
                                                }}
                                            >
                                                {c.recompensa_nombre}
                                            </Typography>
                                            <Typography
                                                variant="body2"
                                                sx={{ color: "#004d66", fontFamily: "'Poppins', sans-serif" }}
                                            >
                                                Canje #{c.id}
                                            </Typography>
                                        </Box>
                                    </Box>

                                    {chipEstado(c.estado)}
                                </Box>

                                {/* Body del cupón */}
                                <CardContent sx={{ flexGrow: 1 }}>
                                    <Stack spacing={1.2}>
                                        <Typography
                                            variant="body2"
                                            sx={{ color: "#4a5568", fontFamily: "'Poppins', sans-serif" }}
                                        >
                                            <strong style={{ color: "#00334e" }}>Puntos utilizados:</strong>{" "}
                                            {c.puntos_cobrados} pts
                                        </Typography>

                                        <Typography
                                            variant="body2"
                                            sx={{ color: "#4a5568", fontFamily: "'Poppins', sans-serif" }}
                                        >
                                            <strong style={{ color: "#00334e" }}>Solicitado:</strong>{" "}
                                            {formatoFechaBonita(c.solicitado_en)}
                                        </Typography>

                                        {(c.estado || "").toUpperCase() !== "PENDIENTE" && (
                                            <Typography
                                                variant="body2"
                                                sx={{ color: "#4a5568", fontFamily: "'Poppins', sans-serif" }}
                                            >
                                                <strong style={{ color: "#00334e" }}>Resuelto:</strong>{" "}
                                                {formatoFechaBonita(c.resuelto_en)}
                                            </Typography>
                                        )}

                                        {(c.estado || "").toUpperCase() === "ENTREGADO" && (
                                            <Typography
                                                variant="body2"
                                                sx={{ color: "#4a5568", fontFamily: "'Poppins', sans-serif" }}
                                            >
                                                <strong style={{ color: "#00334e" }}>Entregado:</strong>{" "}
                                                {formatoFechaBonita(c.entregado_en)}
                                            </Typography>
                                        )}

                                        {c.observaciones && (
                                            <Box
                                                sx={{
                                                    mt: 1,
                                                    backgroundColor: "#f1faff",
                                                    borderRadius: 2,
                                                    border: "1px solid #cceeff",
                                                    p: 1.2,
                                                }}
                                            >
                                                <Typography
                                                    variant="caption"
                                                    sx={{
                                                        color: "#00334e",
                                                        fontWeight: "bold",
                                                        fontFamily: "'Poppins', sans-serif",
                                                    }}
                                                >
                                                    Nota de la clínica:
                                                </Typography>
                                                <Typography
                                                    variant="body2"
                                                    sx={{
                                                        color: "#00334e",
                                                        fontFamily: "'Poppins', sans-serif",
                                                        lineHeight: 1.4,
                                                    }}
                                                >
                                                    {c.observaciones}
                                                </Typography>
                                            </Box>
                                        )}
                                    </Stack>
                                </CardContent>

                                <Divider sx={{ mt: "auto" }} />
                                <Box
                                    sx={{
                                        textAlign: "center",
                                        py: 1.5,
                                        fontSize: "0.8rem",
                                        color: "#607d8b",
                                        fontFamily: "'Poppins', sans-serif",
                                    }}
                                >
                                    Muestra este cupón en recepción al usarlo ✨
                                </Box>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            )}

            {/* Snackbar global */}
            <Snackbar
                open={alerta.open}
                autoHideDuration={4000}
                onClose={() => setAlerta((prev) => ({ ...prev, open: false }))}
                anchorOrigin={{
                    vertical: "bottom",
                    horizontal: "center",
                }}
            >
                <Alert
                    severity={alerta.tipo}
                    variant="filled"
                    onClose={() => setAlerta((prev) => ({ ...prev, open: false }))}
                    sx={{ width: "100%" }}
                >
                    {alerta.mensaje}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default MisCupones;
