import React, { useEffect, useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";
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
    CircularProgress,
    Chip,
} from "@mui/material";
import { CalendarToday } from "@mui/icons-material";
import dayjs from "dayjs";
import "dayjs/locale/es";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

// Extender dayjs con soporte de zona horaria
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.locale("es");

const MisCitas = () => {
    const [citas, setCitas] = useState([]);
    const [pagina, setPagina] = useState(1);
    const [loading, setLoading] = useState(true);
    const [alerta, setAlerta] = useState({ open: false, message: "", severity: "success" });
    const elementosPorPagina = 10;
    const [usuarioId, setUsuarioId] = useState(null);

    useEffect(() => {
        const obtenerUsuarioDesdeCookie = () => {
            try {
                const token = Cookies.get("sessionToken");
                if (!token) {
                    throw new Error("No se encontró el token de sesión.");
                }
                const decodedToken = jwtDecode(token);
                if (!decodedToken?.id) {
                    throw new Error("El token no contiene un ID de usuario válido.");
                }
                setUsuarioId(decodedToken.id);
            } catch (error) {
                console.error("Error al obtener usuario desde la cookie:", error);
                setAlerta({ open: true, message: "No se pudo obtener la sesión. Inicia sesión nuevamente.", severity: "error" });
            }
        };

        obtenerUsuarioDesdeCookie();
    }, []);

    useEffect(() => {
        const obtenerCitas = async () => {
            if (!usuarioId) return;
            try {
                const response = await axios.get(`http://localhost:4000/api/citas/usuario/${usuarioId}`, { withCredentials: true });
                setCitas(response.data);
                setLoading(false);
            } catch (error) {
                console.error("Error al obtener citas:", error);
                setAlerta({ open: true, message: "Error al cargar las citas.", severity: "error" });
                setLoading(false);
            }
        };

        obtenerCitas();
    }, [usuarioId]);

    const handleChangePagina = (event, value) => {
        setPagina(value);
    };

    const citasPaginadas = citas.slice((pagina - 1) * elementosPorPagina, pagina * elementosPorPagina);

    return (
        <Box sx={{ padding: "2rem", minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center" }}>
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
                <CalendarToday fontSize="large" />
                <Typography variant="h4" sx={{ fontWeight: "bold", fontFamily: "'Poppins', sans-serif", textShadow: "1px 1px 6px rgba(0, 0, 0, 0.2)" }}>
                    Mis citas
                </Typography>
            </Box>

            {loading ? (
                <Box sx={{ display: "flex", justifyContent: "center", marginTop: "2rem" }}>
                    <CircularProgress />
                </Box>
            ) : (
                <TableContainer component={Paper} sx={{ borderRadius: "12px", boxShadow: 3, width: "100%", maxWidth: "900px" }}>
                    <Table>
                        <TableHead sx={{ backgroundColor: "#01579b" }}>
                            <TableRow>
                                {["#", "Fecha y Hora", "Estado de Cita", "Estado de Pago"].map((header) => (
                                    <TableCell key={header} sx={{ fontWeight: "bold", textAlign: "center", color: "#fff" }}>
                                        {header}
                                    </TableCell>
                                ))}
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {citasPaginadas.length > 0 ? (
                                citasPaginadas.map((cita, index) => (
                                    <TableRow key={cita.id} sx={{ "&:hover": { backgroundColor: "#f1f8ff" } }}>
                                        <TableCell sx={{ textAlign: "center" }}>{(pagina - 1) * elementosPorPagina + index + 1}</TableCell>
                                        <TableCell sx={{ textAlign: "center" }}>
                                            {cita.fecha_hora
                                                ? dayjs(cita.fecha_hora).tz("America/Mexico_City").format(" D [de] MMMM [de] YYYY [a las] hh:mm A")
                                                : "Fecha no registrada"}
                                        </TableCell>


                                        <TableCell sx={{ textAlign: "center" }}>
                                            <Chip label={cita.estado_cita} color={cita.estado_cita === "Confirmada" ? "success" : "warning"} />
                                        </TableCell>
                                        <TableCell sx={{ textAlign: "center" }}>
                                            <Chip label={cita.estado_pago} color={cita.estado_pago === "Pagado" ? "primary" : "error"} />
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={4} sx={{ textAlign: "center" }}>
                                        No tienes citas registradas.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}

            <Box sx={{ display: "flex", justifyContent: "center", marginTop: "1rem" }}>
                <Pagination count={Math.ceil(citas.length / elementosPorPagina)} page={pagina} onChange={handleChangePagina} color="primary" />
            </Box>

            <Snackbar open={alerta.open} autoHideDuration={6000} onClose={() => setAlerta({ ...alerta, open: false })}>
                <Alert onClose={() => setAlerta({ ...alerta, open: false })} severity={alerta.severity} sx={{ width: "100%" }}>
                    {alerta.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default MisCitas;
