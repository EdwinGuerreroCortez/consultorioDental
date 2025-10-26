import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import {
    Box,
    Typography,
    Card,
    CardContent,
    CircularProgress,
    Snackbar,
    Alert,
    IconButton,
    Chip,
} from "@mui/material";
import { ArrowBack } from "@mui/icons-material";
import { styled } from "@mui/system";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { verificarAutenticacion } from "../../utils/auth";

// ----- estilos tipo BBVA -----
const HeaderBox = styled(Box)(({ theme }) => ({
    backgroundColor: "#0288d1",
    color: "#ffffff",
    padding: theme.spacing(2),
    borderRadius: "16px 16px 0 0",
    display: "flex",
    alignItems: "center",
    gap: "12px",
    width: "100%",
    maxWidth: "1200px",
}));

const MovimientoCard = styled(Card)(({ theme }) => ({
    borderRadius: "16px",
    backgroundColor: "#ffffff",
    padding: theme.spacing(2),
    marginBottom: theme.spacing(2),
    boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.06)",
    transition: "all 0.2s ease",
    "&:hover": {
        transform: "translateY(-2px)",
        boxShadow: "0px 6px 24px rgba(0, 0, 0, 0.1)",
    },
}));

const HistorialPuntos = () => {
    const [movimientos, setMovimientos] = useState([]);
    const [usuarioId, setUsuarioId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [alerta, setAlerta] = useState({ open: false, message: "", severity: "success" });
    const navigate = useNavigate();

    // 1. obtener usuario logueado
    useEffect(() => {
        const obtenerUsuario = async () => {
            try {
                const usuario = await verificarAutenticacion();
                if (usuario) {
                    setUsuarioId(usuario.id);
                } else {
                    throw new Error("Sesión no válida");
                }
            } catch (error) {
                setAlerta({
                    open: true,
                    message: "Sesión expirada. Inicia sesión nuevamente.",
                    severity: "error",
                });
                setLoading(false);
            }
        };
        obtenerUsuario();
    }, []);

    // 2. pedir historial de puntos
    useEffect(() => {
        if (!usuarioId) return;
        const obtenerHistorial = async () => {
            try {
                const { data } = await axios.get(
                    `http://localhost:4000/api/puntos/historial/${usuarioId}`,
                    { withCredentials: true }
                );
                // Ordenar desc por fecha (por si backend no lo manda ya)
                const ordenados = [...data].sort(
                    (a, b) => new Date(b.fecha_movimiento) - new Date(a.fecha_movimiento)
                );
                setMovimientos(ordenados);
            } catch (error) {
                console.error("Error cargando historial de puntos:", error);
                setAlerta({
                    open: true,
                    message: "Error al cargar historial de puntos.",
                    severity: "error",
                });
            } finally {
                setLoading(false);
            }
        };
        obtenerHistorial();
    }, [usuarioId]);

    // 3. agrupar por mes/año para mostrar secciones tipo "Octubre 2025"
    const movimientosAgrupados = useMemo(() => {
        const grupos = {};
        movimientos.forEach((mov) => {
            const claveMes = format(new Date(mov.fecha_movimiento), "MMMM yyyy", { locale: es });
            const mesCapitalizado = claveMes.charAt(0).toUpperCase() + claveMes.slice(1);
            if (!grupos[mesCapitalizado]) grupos[mesCapitalizado] = [];
            grupos[mesCapitalizado].push(mov);
        });

        // devolver [[mes, [movs...]], ...] ordenado por fecha desc del primer item de cada grupo
        return Object.entries(grupos).sort((a, b) => {
            const fechaA = new Date(a[1][0].fecha_movimiento);
            const fechaB = new Date(b[1][0].fecha_movimiento);
            return fechaB - fechaA;
        });
    }, [movimientos]);

    // helpers UI
    const handleGoBack = () => navigate(-1);

    const traducirMotivo = (motivo) => {
        switch (motivo) {
            case "CITA_PUNTUAL":
                return "Asistencia puntual a cita";
            case "TRATAMIENTO_COMPLETADO":
                return "Tratamiento completado";
            default:
                return motivo;
        }
    };

    const formatoPuntos = (tipo, puntos) => {
        // tipo normalmente "ALTA" (suma) o podría ser "BAJA" (resta, si en el futuro descuentas)
        const signo = tipo === "BAJA" ? "-" : "+";
        return `${signo}${puntos} pts`;
    };

    const chipColor = (tipo) => {
        // ALTA => verde; BAJA => rojo
        return tipo === "BAJA" ? "error" : "success";
    };

    const referenciaTexto = (mov) => {
        if (mov.referencia_cita_id) {
            return `Cita #${mov.referencia_cita_id}`;
        }
        if (mov.referencia_tratamiento_paciente_id) {
            return `Tratamiento #${mov.referencia_tratamiento_paciente_id}`;
        }
        return null;
    };

    return (
        <Box
            sx={{
                minHeight: "100vh",
                width: "100vw",
                padding: { xs: "1rem", md: "1.5rem" },
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                background: "#f4faff",
                fontFamily: "'Roboto', sans-serif",
            }}
        >
            {/* Botón volver */}
            <IconButton
                onClick={handleGoBack}
                sx={{
                    position: "absolute",
                    top: "16px",
                    left: "16px",
                    color: "#0288d1",
                }}
            >
                <ArrowBack fontSize="medium" />
            </IconButton>

            {/* Encabezado */}
            <HeaderBox>
                <Typography variant="h5" sx={{ fontWeight: 600 }}>
                    Historial de Puntos
                </Typography>
            </HeaderBox>

            {/* Contenido principal */}
            <Box
                sx={{
                    width: "100%",
                    maxWidth: "1200px",
                    backgroundColor: "#ffffff",
                    borderRadius: "0 0 16px 16px",
                    padding: { xs: "1rem", md: "1.5rem" },
                    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)",
                }}
            >
                {loading ? (
                    <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
                        <CircularProgress sx={{ color: "#0288d1" }} />
                    </Box>
                ) : movimientos.length === 0 ? (
                    <Typography align="center" sx={{ py: 4, color: "#777" }}>
                        Aún no tienes movimientos de puntos.
                    </Typography>
                ) : (
                    movimientosAgrupados.map(([mes, lista]) => (
                        <Box key={mes} sx={{ mb: 3 }}>
                            {/* Título del mes */}
                            <Typography
                                variant="h6"
                                sx={{ fontWeight: 700, color: "#0288d1", mb: 2 }}
                            >
                                {mes}
                            </Typography>

                            {/* Movimientos del mes */}
                            {lista.map((mov) => (
                                <MovimientoCard key={mov.id}>
                                    <CardContent
                                        sx={{ display: "flex", flexDirection: "column", gap: 1 }}
                                    >
                                        {/* fila superior: motivo y puntos ganados */}
                                        <Box
                                            sx={{
                                                display: "flex",
                                                justifyContent: "space-between",
                                                flexWrap: "wrap",
                                                alignItems: "center",
                                            }}
                                        >
                                            <Typography
                                                variant="subtitle1"
                                                sx={{ fontWeight: 600, color: "#333" }}
                                            >
                                                {traducirMotivo(mov.motivo)}
                                            </Typography>

                                            <Chip
                                                label={formatoPuntos(mov.tipo, mov.puntos)}
                                                color={chipColor(mov.tipo)}
                                                size="small"
                                                sx={{ fontWeight: "bold" }}
                                            />
                                        </Box>

                                        {/* fecha */}
                                        <Typography variant="body2" sx={{ color: "#555" }}>
                                            {format(
                                                new Date(mov.fecha_movimiento),
                                                "dd/MM/yyyy HH:mm",
                                                { locale: es }
                                            )}
                                        </Typography>


                                    </CardContent>
                                </MovimientoCard>
                            ))}
                        </Box>
                    ))
                )}
            </Box>

            {/* Snackbar de alerta (errores / sesión expirada) */}
            <Snackbar
                open={alerta.open}
                autoHideDuration={5000}
                onClose={() => setAlerta({ ...alerta, open: false })}
                anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
            >
                <Alert
                    severity={alerta.severity}
                    onClose={() => setAlerta({ ...alerta, open: false })}
                >
                    {alerta.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default HistorialPuntos;
