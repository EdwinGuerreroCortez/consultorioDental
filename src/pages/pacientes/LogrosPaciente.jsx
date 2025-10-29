import React, { useEffect, useState, useMemo, useCallback } from "react";
import axios from "axios";
import { verificarAutenticacion } from "../../utils/auth";
import {
    Box,
    Typography,
    Card,
    CardContent,
    CircularProgress,
    Snackbar,
    Alert,
    Chip,
    Grid,
} from "@mui/material";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import LockIcon from "@mui/icons-material/Lock";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { styled } from "@mui/system";

/* ============================
   PALETA (ajustada a tu navbar)
   ============================
   - navbar: azul petróleo oscuro
   - cards / header: azul medio-profesional
   - fondo: azul muy pálido
*/

const AZUL_CARD_TOP = "#0961A8";     // azul medio (cálido, menos neón)
const AZUL_CARD_BOTTOM = "#063C6F";  // azul más oscuro, cercano al navbar
const AZUL_BG = "linear-gradient(145deg, #0961A8 0%, #063C6F 100%)";

const AZUL_CARD_LOCKED_TOP = "#dbeaf6";     // azul grisáceo claro
const AZUL_CARD_LOCKED_BOTTOM = "#c8d9e8";  // un poco más oscuro
const AZUL_BG_LOCKED =
    "linear-gradient(145deg, #dbeaf6 0%, #c8d9e8 100%)";

const BG_PAGINA =
    "linear-gradient(135deg,#e8f2fa 0%,#e3eef8 100%)"; // fondo clarito similar al tuyo

// chip desbloqueado / bloqueado
const BadgeEstado = ({ unlocked }) => (
    <Chip
        size="small"
        label={unlocked ? "DESBLOQUEADO" : "BLOQUEADO"}
        icon={unlocked ? <CheckCircleIcon /> : <LockIcon />}
        sx={{
            fontWeight: 600,
            fontSize: ".7rem",
            height: "24px",
            borderRadius: "8px",
            backgroundColor: unlocked
                ? "rgba(67,160,71,0.12)"
                : "rgba(0,0,0,0.05)",
            border: unlocked
                ? "1px solid rgba(67,160,71,0.5)"
                : "1px solid rgba(0,0,0,0.12)",
            color: unlocked ? "#2e7d32" : "#444",
            "& .MuiChip-icon": {
                color: unlocked ? "#2e7d32" : "#444",
                fontSize: "1rem",
            },
            "& .MuiChip-label": {
                paddingLeft: "4px",
                paddingRight: "8px",
            },
        }}
    />
);

// tarjeta de logro
const LogroCardBox = styled(Card)(({ unlocked }) => ({
    borderRadius: "8px",
    padding: "1rem",
    minHeight: "160px",

    background: unlocked ? AZUL_BG : AZUL_BG_LOCKED,

    border: unlocked
        ? "1px solid rgba(255,255,255,0.18)"
        : "1px solid rgba(0,0,0,0.07)",

    // sombra más clínica (gris azulada), no gamer fluorescente
    boxShadow: unlocked
        ? "0 20px 30px rgba(0,0,0,0.25), 0 4px 10px rgba(0,0,0,0.15)"
        : "0 16px 24px rgba(0,0,0,0.15), 0 2px 6px rgba(0,0,0,0.08)",

    color: unlocked ? "#fff" : "#1a1a1a",
    transition: "all 0.22s ease",

    "&:hover": {
        transform: "translateY(-2px)",
        boxShadow: unlocked
            ? "0 24px 34px rgba(0,0,0,0.32), 0 6px 14px rgba(0,0,0,0.2)"
            : "0 18px 28px rgba(0,0,0,0.18), 0 4px 10px rgba(0,0,0,0.1)",
    },
}));

// círculo de la medalla
const IconoMedalla = styled(Box)(({ unlocked }) => ({
    width: "42px",
    height: "42px",
    borderRadius: "50%",
    display: "grid",
    placeItems: "center",
    fontWeight: 700,
    fontSize: "1rem",
    backgroundColor: unlocked ? "#ffeb3b" : "#dcdcdc",
    color: unlocked ? "#000" : "#666",
    border: unlocked ? "2px solid rgba(255,255,255,0.9)" : "2px solid #bfbfbf",

    boxShadow: unlocked
        ? "0 6px 12px rgba(0,0,0,0.4), 0 0 14px rgba(255,235,59,0.4)"
        : "0 4px 8px rgba(0,0,0,0.2), inset 0 0 4px rgba(0,0,0,0.2)",
}));


const LogrosPaciente = () => {
    const [usuarioId, setUsuarioId] = useState(null);
    const [csrfToken, setCsrfToken] = useState(null);

    const [catalogo, setCatalogo] = useState([]);
    const [logrosUsuario, setLogrosUsuario] = useState([]);
    const [nuevosLogros, setNuevosLogros] = useState([]);

    const [loading, setLoading] = useState(true);
    const [alerta, setAlerta] = useState({
        open: false,
        message: "",
        severity: "success",
    });

    // axios config
    const axiosInstance = useMemo(
        () =>
            axios.create({
                baseURL: "https://backenddent.onrender.com/api",
                withCredentials: true,
            }),
        []
    );

    // csrf
    const obtenerCsrf = useCallback(
        async (reintentos = 3, delay = 1000) => {
            for (let intento = 1; intento <= reintentos; intento++) {
                try {
                    const response = await fetch(
                        "https://backenddent.onrender.com/api/get-csrf-token",
                        { credentials: "include" }
                    );
                    if (!response.ok) {
                        throw new Error(
                            `Error ${response.status}: ${response.statusText}`
                        );
                    }

                    const data = await response.json();
                    if (!data.csrfToken) {
                        throw new Error("Token CSRF no recibido");
                    }

                    setCsrfToken(data.csrfToken);
                    return;
                } catch (error) {
                    console.error(
                        `Intento ${intento} - Error al obtener CSRF:`,
                        error
                    );
                    if (intento === reintentos) {
                        setAlerta({
                            open: true,
                            message:
                                "No se pudo obtener el token de seguridad. Intenta más tarde.",
                            severity: "error",
                        });
                    } else {
                        await new Promise((resolve) =>
                            setTimeout(resolve, delay)
                        );
                    }
                }
            }
        },
        []
    );

    // auth usuario
    useEffect(() => {
        const obtenerUsuario = async () => {
            try {
                const usuario = await verificarAutenticacion();
                if (usuario && usuario.id) {
                    setUsuarioId(usuario.id);
                } else {
                    setAlerta({
                        open: true,
                        message:
                            "No se encontró la sesión del usuario. Inicia sesión.",
                        severity: "error",
                    });
                }
            } catch (error) {
                console.error("Error autenticación:", error);
                setAlerta({
                    open: true,
                    message:
                        "Error al verificar autenticación. Vuelve a iniciar sesión.",
                    severity: "error",
                });
            }
        };
        obtenerUsuario();
    }, []);

    // csrf al montar
    useEffect(() => {
        obtenerCsrf();
    }, [obtenerCsrf]);

    // cargar logros
    const cargarLogros = useCallback(async () => {
        if (!usuarioId || !csrfToken) return;

        try {
            setLoading(true);

            // forzar evaluación
            const respEval = await axiosInstance.post(
                `/logros/evaluar/${usuarioId}`,
                {},
                { headers: { "X-XSRF-TOKEN": csrfToken } }
            );
            setNuevosLogros(respEval.data.nuevosLogros || []);

            // logros usuario
            const respUser = await axiosInstance.get(`/logros/${usuarioId}`, {
                headers: { "X-XSRF-TOKEN": csrfToken },
            });
            setLogrosUsuario(respUser.data);

            // catálogo completo
            const respCat = await axiosInstance.get(
                `/logros/admin/catalogo/listar`,
                {
                    headers: { "X-XSRF-TOKEN": csrfToken },
                }
            );
            setCatalogo(respCat.data);
        } catch (error) {
            console.error("Error al cargar logros:", error);
            let message = "No se pudieron cargar los logros.";
            if (error.response?.status === 403) {
                message = "Sesión expirada o token inválido.";
                obtenerCsrf();
            }
            setAlerta({
                open: true,
                message,
                severity: "error",
            });
        } finally {
            setLoading(false);
        }
    }, [usuarioId, csrfToken, axiosInstance, obtenerCsrf]);

    useEffect(() => {
        cargarLogros();
    }, [cargarLogros]);

    // ids desbloqueados
    const idsDesbloqueados = useMemo(
        () => new Set(logrosUsuario.map((l) => l.logro_id)),
        [logrosUsuario]
    );

    return (
        <Box
            sx={{
                minHeight: "100vh",
                width: "100vw",
                padding: { xs: "1rem", md: "1.5rem" },
                display: "flex",
                flexDirection: "column",
                alignItems: "center",

                background: BG_PAGINA, // azul clinic light
                color: "#06263f",
            }}
        >
            {loading && (
                <Box
                    sx={{
                        position: "fixed",
                        top: 0,
                        left: 0,
                        width: "100%",
                        height: "100%",
                        backgroundColor: "rgba(0, 0, 0, 0.25)",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        zIndex: 9999,
                    }}
                >
                    <CircularProgress sx={{ color: "#ffeb3b" }} size={40} />
                </Box>
            )}

            {/* HEADER - usa el MISMO degradado que las cards desbloqueadas */}
            <Box
                sx={{
                    width: "100%",
                    maxWidth: "1300px",
                    background: AZUL_BG,
                    color: "#fff",
                    borderRadius: "8px",
                    padding: "16px 20px",
                    boxShadow:
                        "0 20px 30px rgba(0,0,0,0.25), 0 4px 12px rgba(0,0,0,0.15)",
                    border: "1px solid rgba(255,255,255,0.18)",
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                }}
            >
                <EmojiEventsIcon
                    sx={{ color: "#ffeb3b", fontSize: 26 }}
                />
                <Typography
                    variant="h5"
                    sx={{
                        fontWeight: 600,
                        fontSize: { xs: "1.25rem", md: "1.4rem" },
                        color: "#fff",
                    }}
                >
                    Mis Logros
                </Typography>
            </Box>

            {/* BANNER NUEVOS LOGROS */}
            {nuevosLogros.length > 0 && (
                <Box
                    sx={{
                        width: "100%",
                        maxWidth: "1300px",
                        mt: "1rem",
                        backgroundColor: "#ffffff",
                        borderRadius: "8px",
                        border: "1px solid rgba(67,160,71,0.4)",
                        boxShadow:
                            "0 16px 24px rgba(0,0,0,0.12), 0 4px 10px rgba(0,0,0,0.07)",
                        padding: "16px 20px",
                    }}
                >
                    <Typography
                        sx={{
                            fontSize: "1rem",
                            fontWeight: 600,
                            color: "#2e7d32",
                            display: "flex",
                            alignItems: "center",
                            gap: ".5rem",
                        }}
                    >
                        <CheckCircleIcon sx={{ color: "#2e7d32" }} />
                        ¡Nuevo logro desbloqueado!
                    </Typography>

                    <Box
                        sx={{
                            mt: ".5rem",
                            fontSize: ".9rem",
                            lineHeight: "1.4rem",
                            color: "#2e7d32",
                            fontWeight: 500,
                        }}
                    >
                        {nuevosLogros.map((clave) => (
                            <div key={clave}>• {clave}</div>
                        ))}
                    </Box>

                    <Typography
                        sx={{
                            mt: ".75rem",
                            fontSize: ".8rem",
                            color: "#666",
                        }}
                    >
                        Ya quedó guardado en tu perfil 😎
                    </Typography>
                </Box>
            )}

            {/* GRID DE LOGROS */}
            <Box
                sx={{
                    width: "100%",
                    maxWidth: "1300px",
                    mt: "1.5rem",
                }}
            >
                <Grid container spacing={2}>
                    {catalogo.map((logro) => {
                        const unlocked = idsDesbloqueados.has(logro.id);
                        const infoUsuario = logrosUsuario.find(
                            (l) => l.logro_id === logro.id
                        );

                        return (
                            <Grid item xs={12} md={6} lg={4} key={logro.id}>
                                <LogroCardBox unlocked={unlocked ? 1 : 0}>
                                    <CardContent
                                        sx={{
                                            padding: 0,
                                            display: "flex",
                                            flexDirection: "column",
                                            height: "100%",
                                            color: unlocked ? "#fff" : "#1a1a1a",
                                        }}
                                    >
                                        {/* fila superior */}
                                        <Box
                                            sx={{
                                                display: "flex",
                                                justifyContent: "space-between",
                                                alignItems: "flex-start",
                                                flexWrap: "wrap",
                                                rowGap: "8px",
                                            }}
                                        >
                                            <Box
                                                sx={{
                                                    display: "flex",
                                                    alignItems: "flex-start",
                                                    gap: "12px",
                                                }}
                                            >
                                                <IconoMedalla
                                                    unlocked={unlocked ? 1 : 0}
                                                >
                                                    {unlocked ? (
                                                        "🏆"
                                                    ) : (
                                                        <LockIcon
                                                            fontSize="small"
                                                            sx={{
                                                                color: "#666",
                                                            }}
                                                        />
                                                    )}
                                                </IconoMedalla>

                                                <Box>
                                                    <Typography
                                                        sx={{
                                                            fontWeight: 600,
                                                            fontSize: ".95rem",
                                                            color: unlocked
                                                                ? "#fff"
                                                                : "#1a1a1a",
                                                        }}
                                                    >
                                                        {logro.nombre}
                                                    </Typography>

                                                    <Typography
                                                        sx={{
                                                            fontSize: ".7rem",
                                                            lineHeight: "1rem",
                                                            fontWeight: 500,
                                                            textTransform:
                                                                "uppercase",
                                                            color: unlocked
                                                                ? "rgba(255,255,255,0.8)"
                                                                : "#444",
                                                        }}
                                                    >
                                                        {logro.clave}
                                                    </Typography>
                                                </Box>
                                            </Box>

                                            <BadgeEstado unlocked={unlocked} />
                                        </Box>

                                        {/* descripción */}
                                        <Typography
                                            sx={{
                                                fontSize: ".8rem",
                                                lineHeight: "1.3rem",
                                                mt: "0.75rem",
                                                minHeight: "2.6rem",
                                                color: unlocked
                                                    ? "rgba(255,255,255,0.9)"
                                                    : "#1a1a1a",
                                            }}
                                        >
                                            {logro.descripcion}
                                        </Typography>

                                        {/* fecha si desbloqueado */}
                                        {unlocked &&
                                            infoUsuario?.fecha_obtencion && (
                                                <Typography
                                                    sx={{
                                                        fontSize: ".7rem",
                                                        lineHeight: "1rem",
                                                        mt: "0.75rem",
                                                        color: unlocked
                                                            ? "rgba(255,255,255,0.7)"
                                                            : "#444",
                                                    }}
                                                >
                                                    Desbloqueado el{" "}
                                                    {new Date(
                                                        infoUsuario.fecha_obtencion
                                                    ).toLocaleDateString(
                                                        "es-MX",
                                                        {
                                                            year: "numeric",
                                                            month: "short",
                                                            day: "numeric",
                                                        }
                                                    )}
                                                </Typography>
                                            )}
                                    </CardContent>
                                </LogroCardBox>
                            </Grid>
                        );
                    })}
                </Grid>
            </Box>

            {/* Snackbar global */}
            <Snackbar
                open={alerta.open}
                autoHideDuration={6000}
                onClose={() => setAlerta({ ...alerta, open: false })}
                anchorOrigin={{
                    vertical: "bottom",
                    horizontal: "center",
                }}
            >
                <Alert
                    onClose={() =>
                        setAlerta({ ...alerta, open: false })
                    }
                    severity={alerta.severity}
                    sx={{ width: "100%" }}
                >
                    {alerta.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default LogrosPaciente;
