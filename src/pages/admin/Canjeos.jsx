import React, { useEffect, useState, useMemo, useCallback } from "react";
import axios from "axios";
import {
    Box,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Snackbar,
    Alert,
    Pagination,
    Tooltip,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    InputAdornment,
    Typography,
    Chip,
    CircularProgress,
} from "@mui/material";

import DoneAllIcon from "@mui/icons-material/DoneAll";
import BlockIcon from "@mui/icons-material/Block";
import RedeemIcon from "@mui/icons-material/Redeem";
import SearchIcon from "@mui/icons-material/Search";

const formatearFecha = (isoString) => {
    if (!isoString) return "N/A";
    const fecha = new Date(isoString);
    const dia = String(fecha.getDate()).padStart(2, "0");
    const mes = String(fecha.getMonth() + 1).padStart(2, "0");
    const anio = fecha.getFullYear();
    const horas24 = fecha.getHours();
    const minutos = String(fecha.getMinutes()).padStart(2, "0");
    const ampm = horas24 >= 12 ? "PM" : "AM";
    const horas12 = horas24 % 12 === 0 ? 12 : horas24 % 12;
    return `${dia}/${mes}/${anio} ${horas12}:${minutos} ${ampm}`;
};

const estadoChip = (estado) => {
    switch (estado) {
        case "pendiente":
            return (
                <Chip
                    label="Pendiente"
                    color="warning"
                    size="small"
                    sx={{ fontWeight: 600, borderRadius: "8px" }}
                />
            );
        case "aprobado":
            return (
                <Chip
                    label="Aprobado"
                    color="success"
                    size="small"
                    sx={{ fontWeight: 600, borderRadius: "8px" }}
                />
            );
        case "rechazado":
            return (
                <Chip
                    label="Rechazado"
                    color="error"
                    size="small"
                    sx={{ fontWeight: 600, borderRadius: "8px" }}
                />
            );
        case "entregado":
            return (
                <Chip
                    label="Entregado"
                    color="primary"
                    size="small"
                    sx={{ fontWeight: 600, borderRadius: "8px" }}
                />
            );
        default:
            return (
                <Chip
                    label={estado || "?"}
                    size="small"
                    sx={{ fontWeight: 600, borderRadius: "8px" }}
                />
            );
    }
};

const CanjeosAdmin = () => {
    // datos
    const [solicitudes, setSolicitudes] = useState([]);

    // UI state
    const [pagina, setPagina] = useState(1);
    const [loading, setLoading] = useState(true);
    const [csrfToken, setCsrfToken] = useState(null);

    // búsqueda
    const [searchTerm, setSearchTerm] = useState("");

    // snackbar global
    const [alerta, setAlerta] = useState({
        open: false,
        message: "",
        severity: "success",
    });

    // diálogo de aprobar / rechazar / entregado
    const [dialogOpen, setDialogOpen] = useState(false);
    const [accionEstado, setAccionEstado] = useState(""); // "aprobado" | "rechazado" | "entregado"
    const [accionCanjeId, setAccionCanjeId] = useState(null);
    const [observaciones, setObservaciones] = useState("");

    // paginación
    const elementosPorPagina = 10;

    // axiosInstance con cookies
    const axiosInstance = useMemo(
        () =>
            axios.create({
                baseURL: "http://localhost:4000/api",
                withCredentials: true,
            }),
        []
    );

    // 1. CSRF
    useEffect(() => {
        const obtenerTokenCSRF = async () => {
            try {
                const response = await fetch(
                    "http://localhost:4000/api/get-csrf-token",
                    { credentials: "include" }
                );
                const data = await response.json();
                setCsrfToken(data.csrfToken);
            } catch (error) {
                console.error("Error al obtener token CSRF:", error);
                setAlerta({
                    open: true,
                    message: "Error al obtener token CSRF.",
                    severity: "error",
                });
            }
        };
        obtenerTokenCSRF();
    }, []);

    // 2. Cargar solicitudes pendientes
    const cargarSolicitudesPendientes = useCallback(async () => {
        if (!csrfToken) return;
        try {
            setLoading(true);

            const resp = await axiosInstance.get("/recompensas/pendientes", {
                headers: {
                    "X-XSRF-TOKEN": csrfToken,
                },
            });

            // resp.data debe ser array con:
            // {
            //   id,
            //   usuario_id,
            //   nombre,
            //   apellido_paterno,
            //   recompensa_id,
            //   recompensa_nombre,
            //   puntos_cobrados,
            //   estado,               // "pendiente"
            //   solicitado_en
            // }
            const normalizado = (resp.data || []).map((row) => ({
                ...row,
                nombre_completo: `${row.nombre || ""} ${row.apellido_paterno || ""}`.trim(),
            }));

            setSolicitudes(normalizado);
        } catch (error) {
            console.error("Error cargando solicitudes:", error);
            setAlerta({
                open: true,
                message: "Error al cargar solicitudes pendientes.",
                severity: "error",
            });
        } finally {
            setLoading(false);
        }
    }, [axiosInstance, csrfToken]);

    useEffect(() => {
        if (csrfToken) {
            cargarSolicitudesPendientes();
        }
    }, [csrfToken, cargarSolicitudesPendientes]);

    // 3. Abrir diálogo de acción admin
    const abrirDialogoAccion = (canjeId, nuevoEstado) => {
        setAccionCanjeId(canjeId);
        setAccionEstado(nuevoEstado);
        setObservaciones("");
        setDialogOpen(true);
    };

    const cerrarDialogo = () => {
        setDialogOpen(false);
        setAccionCanjeId(null);
        setAccionEstado("");
        setObservaciones("");
    };

    // 4. Confirmar acción admin
    const confirmarAccion = async () => {
        if (!csrfToken || !accionCanjeId || !accionEstado) return;

        try {
            const resp = await axiosInstance.put(
                `/recompensas/resolver/${accionCanjeId}`,
                {
                    estado: accionEstado,
                    observaciones: observaciones || null,
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
                message: resp.data.mensaje || "Acción realizada correctamente.",
                severity: "success",
            });

            cerrarDialogo();
            cargarSolicitudesPendientes(); // refrescar tabla
        } catch (error) {
            console.error("Error resolviendo canje:", error);
            setAlerta({
                open: true,
                message:
                    error.response?.data?.mensaje ||
                    "Error al resolver el canje.",
                severity: "error",
            });
        }
    };

    // 5. Búsqueda
    const filteredSolicitudes = solicitudes.filter((s) => {
        const nombre = s.nombre_completo.toLowerCase();
        const recompensa = (s.recompensa_nombre || "").toLowerCase();
        const query = searchTerm.toLowerCase().trim();
        return (
            nombre.includes(query) ||
            recompensa.includes(query) ||
            String(s.usuario_id || "").startsWith(query) ||
            String(s.id || "").startsWith(query)
        );
    });

    // paginar
    const solicitudesPaginadas = filteredSolicitudes.slice(
        (pagina - 1) * elementosPorPagina,
        pagina * elementosPorPagina
    );
    const filasFaltantes = elementosPorPagina - solicitudesPaginadas.length;

    // reset page cuando cambie búsqueda
    useEffect(() => {
        setPagina(1);
    }, [searchTerm]);

    const handleChangePagina = (event, value) => {
        setPagina(value);
    };

    // UI
    return (
        <Box
            sx={{
                padding: "2rem",
                minHeight: "100vh",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                width: "100%",
                maxWidth: "1400px",
                mx: "auto",
                fontFamily: "'Poppins', sans-serif",
                backgroundColor: "#f9fbfd",
            }}
        >
            {/* 🔍 Buscador */}
            <Box
                sx={{
                    width: "100%",
                    maxWidth: "6000px",
                    mb: 3,
                    display: "flex",
                    alignItems: "center",
                }}
            >
                <TextField
                    label="Buscar por paciente, recompensa o ID"
                    variant="outlined"
                    fullWidth
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    sx={{
                        "& .MuiOutlinedInput-root": {
                            borderRadius: "12px",
                            backgroundColor: "#fff",
                            "& fieldset": { borderColor: "#006d77" },
                            "&:hover fieldset": { borderColor: "#005c66" },
                            "&.Mui-focused fieldset": {
                                borderColor: "#006d77",
                                borderWidth: "2px",
                            },
                        },
                        "& .MuiInputLabel-root": {
                            color: "#03445e",
                            "&.Mui-focused": { color: "#006d77" },
                        },
                    }}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchIcon sx={{ color: "#006d77" }} />
                            </InputAdornment>
                        ),
                        sx: { color: "#006d77", fontFamily: "'Poppins', sans-serif" },
                    }}
                />
            </Box>

            <Box sx={{ flexGrow: 1, width: "100%" }}>
                {loading ? (
                    // Loader
                    <Box
                        sx={{
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            height: "70vh",
                            backgroundColor: "#ffffff",
                            borderRadius: "16px",
                            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)",
                            border: "1px solid #eef3f7",
                        }}
                    >
                        <CircularProgress
                            size={80}
                            thickness={4}
                            sx={{
                                color: "#006d77",
                                "& .MuiCircularProgress-circle": { strokeLinecap: "round" },
                            }}
                        />
                    </Box>
                ) : filteredSolicitudes.length === 0 ? (
                    // Sin solicitudes
                    <Box
                        sx={{
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            height: "60vh",
                            backgroundColor: "#ffffff",
                            borderRadius: "16px",
                            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)",
                            border: "1px solid #78c1c8",
                        }}
                    >
                        <Typography
                            variant="h6"
                            sx={{ color: "#03445e", fontWeight: 500, textAlign: "center" }}
                        >
                            No hay solicitudes pendientes en este momento.
                        </Typography>
                    </Box>
                ) : (
                    // Tabla
                    <TableContainer
                        component={Paper}
                        sx={{
                            borderRadius: "16px",
                            boxShadow: "0 8px 24px rgba(0, 0, 0, 0.08)",
                            overflowX: "auto",
                            background: "#ffffff",
                            border: "1px solid #78c1c8",
                        }}
                    >
                        <Table>
                            <TableHead
                                sx={{
                                    background:
                                        "linear-gradient(90deg, #006d77 0%, #78c1c8 100%)",
                                }}
                            >
                                <TableRow>
                                    {[
                                        "#",
                                        "Paciente",
                                        "Recompensa",
                                        "Puntos",
                                        "Estado",
                                        "Solicitado",
                                        "Acción",
                                    ].map((header) => (
                                        <TableCell
                                            key={header}
                                            sx={{
                                                color: "#e0f7fa",
                                                fontWeight: 700,
                                                textAlign: "center",
                                                fontFamily: "'Poppins', sans-serif",
                                                borderBottom: "none",
                                                padding: "12px",
                                                fontSize: "0.95rem",
                                            }}
                                        >
                                            {header}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            </TableHead>

                            <TableBody>
                                {solicitudesPaginadas.map((row, index) => (
                                    <TableRow
                                        key={row.id}
                                        sx={{
                                            "&:hover": {
                                                backgroundColor: "#e0f7fa",
                                                transition: "background-color 0.3s ease",
                                            },
                                            borderBottom: "1px solid #eef3f7",
                                        }}
                                    >
                                        {/* índice */}
                                        <TableCell sx={{ textAlign: "center" }}>
                                            {(pagina - 1) * elementosPorPagina + index + 1}
                                        </TableCell>

                                        {/* paciente */}
                                        <TableCell sx={{ textAlign: "center" }}>
                                            <Typography
                                                sx={{
                                                    color: "#03445e",
                                                    fontWeight: 600,
                                                    fontSize: "0.95rem",
                                                }}
                                            >
                                                {row.nombre_completo || "Sin nombre"}
                                            </Typography>
                                            <Typography
                                                sx={{
                                                    color: "#6b7b83",
                                                    fontSize: "0.8rem",
                                                    lineHeight: 1.2,
                                                }}
                                            >
                                                UserID: {row.usuario_id} <br />
                                                CanjeID: {row.id}
                                            </Typography>
                                        </TableCell>

                                        {/* recompensa */}
                                        <TableCell sx={{ textAlign: "center" }}>
                                            <Typography
                                                sx={{
                                                    color: "#1e88e5",
                                                    fontWeight: 600,
                                                    fontSize: "0.9rem",
                                                }}
                                            >
                                                {row.recompensa_nombre || "—"}
                                            </Typography>
                                        </TableCell>

                                        {/* puntos */}
                                        <TableCell sx={{ textAlign: "center" }}>
                                            <Typography
                                                sx={{
                                                    color: "#1e88e5",
                                                    fontWeight: 600,
                                                    fontSize: "0.9rem",
                                                }}
                                            >
                                                {row.puntos_cobrados} pts
                                            </Typography>
                                        </TableCell>

                                        {/* estado */}
                                        <TableCell sx={{ textAlign: "center" }}>
                                            {estadoChip(row.estado)}
                                        </TableCell>

                                        {/* solicitado */}
                                        <TableCell sx={{ textAlign: "center" }}>
                                            <Typography
                                                sx={{
                                                    color: "#03445e",
                                                    fontWeight: 500,
                                                    fontSize: "0.9rem",
                                                }}
                                            >
                                                {formatearFecha(row.solicitado_en)}
                                            </Typography>
                                        </TableCell>

                                        {/* acción */}
                                        <TableCell sx={{ textAlign: "center" }}>
                                            <Tooltip title="Aprobar canje" arrow>
                                                <IconButton
                                                    onClick={() => abrirDialogoAccion(row.id, "aprobado")}
                                                    sx={{
                                                        color: "#2e7d32",
                                                        "&:hover": {
                                                            color: "#1b5e20",
                                                            transform: "scale(1.2)",
                                                        },
                                                    }}
                                                >
                                                    <DoneAllIcon />
                                                </IconButton>
                                            </Tooltip>

                                            <Tooltip title="Marcar como entregado" arrow>
                                                <IconButton
                                                    onClick={() =>
                                                        abrirDialogoAccion(row.id, "entregado")
                                                    }
                                                    sx={{
                                                        color: "#1976d2",
                                                        "&:hover": {
                                                            color: "#0d47a1",
                                                            transform: "scale(1.2)",
                                                        },
                                                    }}
                                                >
                                                    <RedeemIcon />
                                                </IconButton>
                                            </Tooltip>

                                            <Tooltip title="Rechazar canje" arrow>
                                                <IconButton
                                                    onClick={() => abrirDialogoAccion(row.id, "rechazado")}
                                                    sx={{
                                                        color: "#d32f2f",
                                                        "&:hover": {
                                                            color: "#b71c1c",
                                                            transform: "scale(1.2)",
                                                        },
                                                    }}
                                                >
                                                    <BlockIcon />
                                                </IconButton>
                                            </Tooltip>
                                        </TableCell>
                                    </TableRow>
                                ))}

                                {/* filas vacías para mantener altura paginada bonita */}
                                {filasFaltantes > 0 &&
                                    Array.from({ length: filasFaltantes }).map((_, idx) => (
                                        <TableRow key={`empty-${idx}`}>
                                            {Array(7)
                                                .fill("-")
                                                .map((__, i) => (
                                                    <TableCell
                                                        key={i}
                                                        sx={{
                                                            textAlign: "center",
                                                            color: "#999",
                                                            borderBottom: "1px solid #eef3f7",
                                                        }}
                                                    >
                                                        -
                                                    </TableCell>
                                                ))}
                                        </TableRow>
                                    ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                )}
            </Box>

            {/* Paginación */}
            <Box
                sx={{ display: "flex", justifyContent: "center", mt: 3, mb: 5 }}
            >
                <Pagination
                    count={Math.ceil(filteredSolicitudes.length / elementosPorPagina)}
                    page={pagina}
                    onChange={(_, v) => setPagina(v)}
                    color="primary"
                    size="medium"
                    sx={{
                        "& .MuiPaginationItem-root": {
                            fontSize: "1rem",
                            padding: "8px 16px",
                            borderRadius: "8px",
                            color: "#006d77",
                            "&:hover": {
                                backgroundColor: "#78c1c8",
                                color: "#ffffff",
                            },
                        },
                        "& .Mui-selected": {
                            backgroundColor: "#006d77",
                            color: "#e0f7fa",
                            "&:hover": { backgroundColor: "#004d57" },
                        },
                    }}
                />
            </Box>

            {/* Dialog de acción admin */}
            <Dialog open={dialogOpen} onClose={cerrarDialogo} fullWidth maxWidth="sm">
                <DialogTitle
                    sx={{
                        fontFamily: "'Poppins', sans-serif",
                        fontWeight: 600,
                        color:
                            accionEstado === "rechazado"
                                ? "#d32f2f"
                                : accionEstado === "aprobado"
                                    ? "#2e7d32"
                                    : "#1976d2",
                        textAlign: "center",
                    }}
                >
                    {accionEstado === "aprobado" && "Aprobar canje"}
                    {accionEstado === "rechazado" && "Rechazar canje"}
                    {accionEstado === "entregado" && "Marcar como entregado"}
                </DialogTitle>

                <DialogContent dividers>
                    <Alert
                        severity={
                            accionEstado === "rechazado"
                                ? "warning"
                                : accionEstado === "aprobado"
                                    ? "success"
                                    : "info"
                        }
                        sx={{ mb: 2 }}
                    >
                        {accionEstado === "aprobado" &&
                            "Esto aprobará el canje, consumirá los puntos apartados del paciente y descontará stock."}

                        {accionEstado === "rechazado" &&
                            "Esto rechazará el canje y devolverá al paciente los puntos apartados."}

                        {accionEstado === "entregado" &&
                            "Esto marcará como entregado, consumirá los puntos apartados y descontará stock."}
                    </Alert>

                    <TextField
                        label="Observaciones (opcional)"
                        multiline
                        minRows={2}
                        fullWidth
                        value={observaciones}
                        onChange={(e) => setObservaciones(e.target.value)}
                        sx={{
                            "& .MuiOutlinedInput-root": {
                                borderRadius: "12px",
                                backgroundColor: "#fff",
                                "& fieldset": { borderColor: "#006d77" },
                                "&:hover fieldset": { borderColor: "#005c66" },
                                "&.Mui-focused fieldset": {
                                    borderColor: "#006d77",
                                    borderWidth: "2px",
                                },
                            },
                            "& .MuiInputLabel-root": {
                                color: "#03445e",
                                "&.Mui-focused": { color: "#006d77" },
                            },
                        }}
                    />
                </DialogContent>

                <DialogActions
                    sx={{ justifyContent: "center", pb: 2, pt: 2, gap: 2 }}
                >
                    <Button
                        onClick={cerrarDialogo}
                        variant="outlined"
                        sx={{
                            color: "#006d77",
                            borderColor: "#006d77",
                            textTransform: "none",
                            borderRadius: "10px",
                            fontWeight: 600,
                            "&:hover": {
                                backgroundColor: "rgba(0,109,119,0.05)",
                                borderColor: "#005c66",
                            },
                        }}
                    >
                        Cancelar
                    </Button>

                    <Button
                        onClick={confirmarAccion}
                        variant="contained"
                        sx={{
                            backgroundColor:
                                accionEstado === "rechazado"
                                    ? "#d32f2f"
                                    : accionEstado === "aprobado"
                                        ? "#2e7d32"
                                        : "#1976d2",
                            "&:hover": {
                                backgroundColor:
                                    accionEstado === "rechazado"
                                        ? "#b71c1c"
                                        : accionEstado === "aprobado"
                                            ? "#1b5e20"
                                            : "#0d47a1",
                            },
                            textTransform: "none",
                            borderRadius: "10px",
                            fontWeight: 600,
                        }}
                    >
                        Confirmar
                    </Button>
                </DialogActions>
            </Dialog>

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
                    sx={{ fontFamily: "'Poppins', sans-serif" }}
                >
                    {alerta.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default CanjeosAdmin;
