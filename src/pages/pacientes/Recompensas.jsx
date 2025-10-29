import React, { useEffect, useState, useMemo, useCallback } from "react";
import axios from "axios";
import { verificarAutenticacion } from "../../utils/auth";
import {
    Box,
    Typography,
    Card,
    CardContent,
    CardActions,
    Button,
    Grid,
    Chip,
    Avatar,
    LinearProgress,
    Stack,
    Divider,
    IconButton,
    Tooltip,
    Snackbar,
    Alert,
} from "@mui/material";
import {
    Redeem,
    Inventory2,
    Star,
    LocalOffer,
    AddShoppingCart,
} from "@mui/icons-material";

const Recompensas = () => {
    const [usuarioId, setUsuarioId] = useState(null);
    const [csrfToken, setCsrfToken] = useState(null);

    const [recompensas, setRecompensas] = useState([]);
    const [loading, setLoading] = useState(true);

    const [saldo, setSaldo] = useState({
        puntos_disponibles: 0,
        puntos_en_pausa: 0,
        actualizado_en: null,
    });

    const [alerta, setAlerta] = useState({
        open: false,
        mensaje: "",
        tipo: "success",
    });

    // axiosInstance igual que en AgendarCita
    const axiosInstance = useMemo(
        () =>
            axios.create({
                baseURL: "http://localhost:4000/api",
                withCredentials: true,
            }),
        []
    );

    // 1. Obtener token CSRF
    useEffect(() => {
        const obtenerTokenCSRF = async () => {
            try {
                const resp = await fetch("http://localhost:4000/api/get-csrf-token", {
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

    // 3. Obtener saldo de puntos del usuario
    const cargarSaldo = useCallback(async () => {
        if (!usuarioId || !csrfToken) return;
        try {
            const resp = await axiosInstance.get(`/puntos/saldo/${usuarioId}`, {
                headers: {
                    "X-XSRF-TOKEN": csrfToken,
                },
            });
            setSaldo(resp.data || {});
        } catch (error) {
            console.error("Error al obtener saldo:", error);
            setAlerta({
                open: true,
                mensaje: "No se pudo obtener tu saldo de puntos.",
                tipo: "error",
            });
        }
    }, [axiosInstance, usuarioId, csrfToken]);

    // 4. Obtener catálogo de recompensas
    const cargarRecompensas = useCallback(async () => {
        if (!csrfToken) return;
        try {
            setLoading(true);
            const response = await axiosInstance.get("/recompensas/catalogo", {
                headers: {
                    "X-XSRF-TOKEN": csrfToken,
                },
            });
            setRecompensas(Array.isArray(response.data) ? response.data : response.data.recompensas || []);
        } catch (error) {
            console.error("Error al obtener recompensas:", error);
            setAlerta({
                open: true,
                mensaje: "Error al cargar recompensas.",
                tipo: "error",
            });
        } finally {
            setLoading(false);
        }
    }, [axiosInstance, csrfToken]);

    // disparamos ambas cargas cuando ya tenemos usuario y csrf
    useEffect(() => {
        if (usuarioId && csrfToken) {
            cargarSaldo();
            cargarRecompensas();
        }
    }, [usuarioId, csrfToken, cargarSaldo, cargarRecompensas]);

    // 5. Canje de recompensa
    const manejarCanje = async (recompensaId) => {
        if (!csrfToken) {
            setAlerta({
                open: true,
                mensaje: "Error de seguridad. Intenta de nuevo.",
                tipo: "error",
            });
            return;
        }

        if (!usuarioId) {
            setAlerta({
                open: true,
                mensaje: "No se pudo identificar al usuario.",
                tipo: "error",
            });
            return;
        }

        try {
            const response = await axiosInstance.post(
                "/recompensas/canjear",
                {
                    usuarioId: usuarioId,
                    recompensaId: recompensaId,
                },
                {
                    headers: {
                        "X-XSRF-TOKEN": csrfToken,
                        "Content-Type": "application/json",
                    },
                    withCredentials: true,
                }
            );

            setAlerta({
                open: true,
                mensaje: response.data.mensaje || "Solicitud enviada.",
                tipo: "success",
            });

            // Después de canjear: recarga saldo y catálogo (por si bajó el stock)
            cargarSaldo();
            cargarRecompensas();
        } catch (error) {
            console.error("Error al canjear recompensa:", error);

            let mensaje = "Error al solicitar el canje.";
            if (error.response && error.response.data && error.response.data.mensaje) {
                mensaje = error.response.data.mensaje;
            }

            setAlerta({
                open: true,
                mensaje,
                tipo: "error",
            });
        }
    };

    // helper visual para stock
    const getStockStatus = (stock) => {
        if (stock === 0)
            return {
                label: "Agotado",
                color: "error",
                icon: <Inventory2 fontSize="small" />,
            };
        if (stock <= 3)
            return {
                label: `Solo ${stock} left`,
                color: "warning",
                icon: <Star fontSize="small" />,
            };
        return {
            label: `${stock} en stock`,
            color: "success",
            icon: <Inventory2 fontSize="small" />,
        };
    };

    return (
        <Box
            sx={{
                p: { xs: 2, md: 4 },
                backgroundColor: "#f9f9fb",
                minHeight: "100vh",
            }}
        >
            {/* Header con saldo */}
            <Box sx={{ mb: 5, textAlign: { xs: "center", md: "left" } }}>
                <Typography
                    variant="h3"
                    fontWeight="bold"
                    gutterBottom
                    sx={{
                        background: "linear-gradient(90deg, #4caf50, #2196f3)",
                        backgroundClip: "text",
                        WebkitBackgroundClip: "text",
                        color: "transparent",
                    }}
                >
                    Recompensas del Paciente
                </Typography>

                <Typography variant="body1" color="text.secondary">
                    Canjea tus puntos por recompensas. ¡Elige la tuya!
                </Typography>

                <Box
                    sx={{
                        mt: 2,
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 1,
                        backgroundColor: "#e8f5e9",
                        borderRadius: "12px",
                        px: 2,
                        py: 1,
                        boxShadow: "0 4px 10px rgba(0,0,0,0.05)",
                    }}
                >
                    <Chip
                        icon={<LocalOffer sx={{ color: "#2e7d32 !important" }} />}
                        label={
                            <Typography
                                variant="subtitle2"
                                sx={{ fontWeight: "bold", color: "#2e7d32" }}
                            >
                                {saldo.puntos_disponibles ?? 0} pts disponibles
                            </Typography>
                        }
                        sx={{
                            backgroundColor: "white",
                            borderRadius: "10px",
                            "& .MuiChip-icon": { color: "#2e7d32" },
                        }}
                    />
                    {saldo.puntos_en_pausa > 0 && (
                        <Chip
                            label={`${saldo.puntos_en_pausa} en pausa`}
                            size="small"
                            color="warning"
                            sx={{ fontWeight: "bold" }}
                        />
                    )}
                </Box>
            </Box>

            {/* Loading */}
            {loading ? (
                <Box sx={{ width: "100%", mt: 4 }}>
                    <LinearProgress color="success" />
                    <Typography
                        variant="body2"
                        color="text.secondary"
                        align="center"
                        sx={{ mt: 2 }}
                    >
                        Cargando recompensas...
                    </Typography>
                </Box>
            ) : recompensas.length === 0 ? (
                // Sin recompensas
                <Card
                    sx={{
                        p: 4,
                        textAlign: "center",
                        borderRadius: 3,
                        boxShadow: 2,
                    }}
                >
                    <Redeem sx={{ fontSize: 60, color: "grey.400", mb: 2 }} />
                    <Typography variant="h6" color="text.secondary">
                        No hay recompensas disponibles en este momento.
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Vuelve más tarde o acumula más puntos.
                    </Typography>
                </Card>
            ) : (
                // Grid de recompensas
                <Grid container spacing={3}>
                    {recompensas.map((r) => {
                        const stockStatus = getStockStatus(r.stock);
                        const isOutOfStock = r.stock <= 0;

                        return (
                            <Grid item xs={12} sm={6} md={4} lg={3} key={r.id}>
                                <Card
                                    raised
                                    sx={{
                                        height: "100%",
                                        display: "flex",
                                        flexDirection: "column",
                                        borderRadius: 3,
                                        overflow: "hidden",
                                        transition: "all 0.3s ease-in-out",
                                        "&:hover": {
                                            transform: "translateY(-8px)",
                                            boxShadow: "0 12px 20px rgba(0,0,0,0.1)",
                                        },
                                        opacity: isOutOfStock ? 0.7 : 1,
                                    }}
                                >
                                    {/* Header visual */}
                                    <Box
                                        sx={{
                                            height: 160,
                                            background: `linear-gradient(135deg, ${isOutOfStock ? "#ccc" : "#e8f5e9"
                                                }, ${isOutOfStock ? "#aaa" : "#c8e6c9"
                                                })`,
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            position: "relative",
                                        }}
                                    >
                                        <Avatar
                                            sx={{
                                                width: 90,
                                                height: 90,
                                                bgcolor: "white",
                                                boxShadow: 3,
                                            }}
                                        >
                                            <Redeem sx={{ fontSize: 40, color: "#4caf50" }} />
                                        </Avatar>

                                        {/* Stock chip */}
                                        <Chip
                                            icon={stockStatus.icon}
                                            label={stockStatus.label}
                                            size="small"
                                            color={stockStatus.color}
                                            sx={{
                                                position: "absolute",
                                                top: 12,
                                                right: 12,
                                                fontWeight: "bold",
                                                fontSize: "0.7rem",
                                            }}
                                        />
                                    </Box>

                                    {/* Body */}
                                    <CardContent sx={{ flexGrow: 1, pb: 1 }}>
                                        <Typography
                                            variant="h6"
                                            fontWeight="bold"
                                            gutterBottom
                                            noWrap
                                        >
                                            {r.nombre}
                                        </Typography>

                                        <Typography
                                            variant="body2"
                                            color="text.secondary"
                                            sx={{
                                                mb: 2,
                                                display: "-webkit-box",
                                                WebkitLineClamp: 2,
                                                WebkitBoxOrient: "vertical",
                                                overflow: "hidden",
                                            }}
                                        >
                                            {r.descripcion || "Sin descripción disponible."}
                                        </Typography>

                                        <Divider sx={{ my: 1.5 }} />

                                        <Stack
                                            direction="row"
                                            alignItems="center"
                                            spacing={1}
                                        >
                                            <LocalOffer color="primary" fontSize="small" />
                                            <Typography
                                                variant="subtitle1"
                                                fontWeight="bold"
                                                color="primary"
                                            >
                                                {r.costo_puntos} puntos
                                            </Typography>
                                        </Stack>
                                    </CardContent>

                                    {/* Actions */}
                                    <CardActions
                                        sx={{
                                            p: 2,
                                            pt: 0,
                                            justifyContent: "space-between",
                                        }}
                                    >
                                        <Tooltip
                                            title={
                                                isOutOfStock
                                                    ? "Sin stock disponible"
                                                    : "Solicitar canje"
                                            }
                                        >
                                            <span>
                                                <Button
                                                    variant="contained"
                                                    size="medium"
                                                    startIcon={<AddShoppingCart />}
                                                    disabled={isOutOfStock}
                                                    onClick={() => manejarCanje(r.id)}
                                                    sx={{
                                                        borderRadius: 2,
                                                        textTransform: "none",
                                                        fontWeight: "bold",
                                                        backgroundColor: isOutOfStock
                                                            ? "grey.400"
                                                            : "#4caf50",
                                                        "&:hover": {
                                                            backgroundColor: isOutOfStock
                                                                ? "grey.500"
                                                                : "#388e3c",
                                                        },
                                                        "&:disabled": {
                                                            backgroundColor: "grey.300",
                                                            color: "grey.600",
                                                        },
                                                    }}
                                                >
                                                    {isOutOfStock ? "Agotado" : "Canjear"}
                                                </Button>
                                            </span>
                                        </Tooltip>

                                        <IconButton size="small" color="default">
                                            <Star fontSize="small" />
                                        </IconButton>
                                    </CardActions>
                                </Card>
                            </Grid>
                        );
                    })}
                </Grid>
            )}

            {/* Snackbar global */}
            <Snackbar
                open={alerta.open}
                autoHideDuration={4000}
                onClose={() =>
                    setAlerta((prev) => ({ ...prev, open: false }))
                }
                anchorOrigin={{
                    vertical: "bottom",
                    horizontal: "center",
                }}
            >
                <Alert
                    severity={alerta.tipo}
                    variant="filled"
                    onClose={() =>
                        setAlerta((prev) => ({ ...prev, open: false }))
                    }
                    sx={{ width: "100%" }}
                >
                    {alerta.mensaje}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default Recompensas;
