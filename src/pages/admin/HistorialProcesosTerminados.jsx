import React, { useState, useEffect } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    Typography,
    Tabs,
    Tab,
    Box,
    Paper,
} from "@mui/material";
import axios from "axios";
import { motion } from "framer-motion";

const HistorialProcesosTerminados = () => {
    const [tratamientos, setTratamientos] = useState([]);
    const [detalleSeleccionado, setDetalleSeleccionado] = useState(null);
    const [open, setOpen] = useState(false);
    const [tabIndex, setTabIndex] = useState(0);
    const [comentario, setComentario] = useState(null);
    const [openComentario, setOpenComentario] = useState(false);

    useEffect(() => {
        axios.get("http://localhost:4000/api/tratamientos-pacientes/historial")
            .then(response => {
                setTratamientos(response.data);
            })
            .catch(error => {
                console.error("Error al obtener el historial de tratamientos", error);
            });
    }, []);

    const handleVerDetalles = (tratamiento) => {
        setDetalleSeleccionado(tratamiento);
        setOpen(true);
        setTabIndex(0);
    };

    const handleClose = () => {
        setOpen(false);
        setDetalleSeleccionado(null);
    };

    const handleTabChange = (event, newValue) => {
        setTabIndex(newValue);
    };

    const handleVerComentario = (comentario) => {
        setComentario(comentario);
        setOpenComentario(true);
    };

    const handleCloseComentario = () => {
        setOpenComentario(false);
        setComentario(null);
    };

    const tableVariants = {
        hidden: { opacity: 0, y: 50 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.5, staggerChildren: 0.1 } }
    };

    const rowVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.3 } }
    };

    const cellStyle = {
        textAlign: "center",
        width: "150px",
        maxWidth: "150px",
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis",
        fontFamily: "'Roboto', sans-serif",
        color: "#333", // Color más oscuro para mejor contraste
        fontSize: "1rem", // Tamaño de fuente más grande
        py: "1.2rem", // Más espaciado vertical
    };

    const MotionTableRow = motion(TableRow);

    return (
        <Box sx={{ padding: "2rem", minHeight: "100vh" }}>
            {/* Título como en TratamientosEnCurso */}
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
                    HISTORIAL DE PROCESOS TERMINADOS
                </Typography>
            </Box>

            {/* Tabla Principal */}
            <motion.div variants={tableVariants} initial="hidden" animate="visible">
                <TableContainer component={Paper} sx={{ 
                    borderRadius: "16px", 
                    boxShadow: "0 6px 24px rgba(0,0,0,0.08)", 
                    overflow: "hidden", 
                    mt: 3,
                    maxWidth: "1200px",
                    mx: "auto"
                }}>
                    <Table sx={{ tableLayout: "fixed" }}>
                        <TableHead sx={{ background: "linear-gradient(90deg, #0077b6 0%, #48cae4 100%)" }}>
                            <TableRow>
                                {[
                                    "Nombre del Paciente", "Edad", "Sexo", "Correo", "Teléfono",
                                    "Tratamiento", "Citas Totales / Asistidas", "Fecha de Inicio", "Acciones"
                                ].map((header) => (
                                    <TableCell 
                                        key={header} 
                                        sx={{ 
                                            ...cellStyle, 
                                            color: "#fff", 
                                            fontWeight: 600, 
                                            borderBottom: "none",
                                            fontSize: "1.1rem" // Aumenté el tamaño para la cabecera
                                        }}
                                    >
                                        {header}
                                    </TableCell>
                                ))}
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {tratamientos.map((tratamiento) => (
                                <MotionTableRow
                                    key={tratamiento.tratamiento_id}
                                    variants={rowVariants}
                                    whileHover={{ 
                                        scale: 1.01, 
                                        backgroundColor: "#f8fbff",
                                        boxShadow: "inset 0 2px 8px rgba(0,0,0,0.05)"
                                    }}
                                    sx={{ transition: "all 0.2s ease" }}
                                >
                                    <TableCell sx={cellStyle}>{`${tratamiento.nombre} ${tratamiento.apellido_paterno} ${tratamiento.apellido_materno}`}</TableCell>
                                    <TableCell sx={cellStyle}>{tratamiento.edad || "N/A"}</TableCell>
                                    <TableCell sx={cellStyle}>{tratamiento.sexo || "N/A"}</TableCell>
                                    <TableCell sx={cellStyle}>{tratamiento.email || "N/A"}</TableCell>
                                    <TableCell sx={cellStyle}>{tratamiento.telefono || "N/A"}</TableCell>
                                    <TableCell sx={cellStyle}>{tratamiento.tratamiento_nombre}</TableCell>
                                    <TableCell sx={cellStyle}>{`${tratamiento.citas_totales} / ${tratamiento.citas_asistidas}`}</TableCell>
                                    <TableCell sx={cellStyle}>{tratamiento.fecha_inicio || "N/A"}</TableCell>
                                    <TableCell sx={cellStyle}>
                                        <Button 
                                            variant="contained" 
                                            color="primary" 
                                            onClick={() => handleVerDetalles(tratamiento)}
                                            sx={{ 
                                                textTransform: "none", 
                                                borderRadius: "8px",
                                                background: "linear-gradient(45deg, #0077b6, #48cae4)",
                                                boxShadow: "0 2px 8px rgba(0, 119, 182, 0.3)",
                                                "&:hover": {
                                                    background: "linear-gradient(45deg, #005f8d, #2196f3)",
                                                    boxShadow: "0 4px 12px rgba(0, 119, 182, 0.4)"
                                                }
                                            }}
                                        >
                                            Ver Detalles
                                        </Button>
                                    </TableCell>
                                </MotionTableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </motion.div>

            {/* Diálogo de Detalles */}
            <Dialog 
                open={open} 
                onClose={handleClose} 
                fullWidth 
                maxWidth="md" 
                sx={{ "& .MuiDialog-paper": { borderRadius: "16px", boxShadow: "0 8px 32px rgba(0,0,0,0.1)" } }}
            >
                <DialogTitle sx={{ 
                    background: "linear-gradient(90deg, #0077b6 0%, #48cae4 100%)", 
                    color: "#fff", 
                    fontFamily: "'Poppins', sans-serif",
                    fontWeight: 600,
                    borderRadius: "16px 16px 0 0"
                }}>
                    Detalles del Tratamiento
                </DialogTitle>
                <DialogContent sx={{ padding: "2rem" }}>
                    {detalleSeleccionado && (
                        <>
                            <Tabs 
                                value={tabIndex} 
                                onChange={handleTabChange} 
                                centered 
                                sx={{ 
                                    mb: "1.5rem",
                                    "& .MuiTab-root": {
                                        fontFamily: "'Roboto', sans-serif",
                                        textTransform: "none",
                                        fontSize: "1.1rem",
                                        "&.Mui-selected": {
                                            color: "#0077b6"
                                        }
                                    },
                                    "& .MuiTabs-indicator": {
                                        backgroundColor: "#0077b6"
                                    }
                                }}
                            >
                                <Tab label="Citas" />
                                <Tab label="Pagos" />
                            </Tabs>
                            {tabIndex === 0 && (
                                <TableContainer component={Paper} sx={{ borderRadius: "12px", boxShadow: "0 4px 16px rgba(0,0,0,0.05)" }}>
                                    <Table>
                                        <TableHead sx={{ backgroundColor: "#e3f2fd" }}>
                                            <TableRow>
                                                <TableCell sx={{ fontWeight: 600, textAlign: "center", fontSize: "1rem" }}>Fecha</TableCell>
                                                <TableCell sx={{ fontWeight: 600, textAlign: "center", fontSize: "1rem" }}>Estado</TableCell>
                                                <TableCell sx={{ fontWeight: 600, textAlign: "center", fontSize: "1rem" }}>Pago</TableCell>
                                                <TableCell sx={{ fontWeight: 600, textAlign: "center", fontSize: "1rem" }}>Comentario</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {detalleSeleccionado.citas.map((cita) => (
                                                <TableRow 
                                                    key={cita.cita_id}
                                                    sx={{ "&:hover": { backgroundColor: "#f5f5f5" } }}
                                                >
                                                    <TableCell sx={cellStyle}>{cita.fecha_cita || "Pendiente"}</TableCell>
                                                    <TableCell sx={cellStyle}>{cita.estado_cita}</TableCell>
                                                    <TableCell sx={cellStyle}>{cita.cita_pagada ? "Pagado" : "Pendiente"}</TableCell>
                                                    <TableCell sx={cellStyle}>
                                                        <Button 
                                                            variant="outlined" 
                                                            size="small" 
                                                            onClick={() => handleVerComentario(cita.cita_comentario || "Sin comentario")}
                                                            sx={{ 
                                                                borderRadius: "8px",
                                                                color: "#0077b6",
                                                                borderColor: "#0077b6",
                                                                "&:hover": {
                                                                    backgroundColor: "#e3f2fd",
                                                                    borderColor: "#005f8d"
                                                                }
                                                            }}
                                                        >
                                                            Ver Comentario
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            )}
                            {tabIndex === 1 && (
                                <TableContainer component={Paper} sx={{ borderRadius: "12px", boxShadow: "0 4px 16px rgba(0,0,0,0.05)" }}>
                                    <Table>
                                        <TableHead sx={{ backgroundColor: "#e3f2fd" }}>
                                            <TableRow>
                                                <TableCell sx={{ fontWeight: 600, textAlign: "center", fontSize: "1rem" }}>Monto</TableCell>
                                                <TableCell sx={{ fontWeight: 600, textAlign: "center", fontSize: "1rem" }}>Método</TableCell>
                                                <TableCell sx={{ fontWeight: 600, textAlign: "center", fontSize: "1rem" }}>Estado</TableCell>
                                                <TableCell sx={{ fontWeight: 600, textAlign: "center", fontSize: "1rem" }}>Fecha</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {detalleSeleccionado.pagos.map((pago) => (
                                                <TableRow 
                                                    key={pago.pago_id}
                                                    sx={{ "&:hover": { backgroundColor: "#f5f5f5" } }}
                                                >
                                                    <TableCell sx={cellStyle}>{pago.monto_pago}</TableCell>
                                                    <TableCell sx={cellStyle}>{pago.metodo_pago || "No especificado"}</TableCell>
                                                    <TableCell sx={cellStyle}>{pago.estado_pago}</TableCell>
                                                    <TableCell sx={cellStyle}>{pago.fecha_pago || "No registrado"}</TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            )}
                        </>
                    )}
                </DialogContent>
            </Dialog>

            {/* Diálogo de Comentario */}
            <Dialog 
                open={openComentario} 
                onClose={handleCloseComentario} 
                fullWidth 
                maxWidth="sm"
                sx={{ "& .MuiDialog-paper": { borderRadius: "12px", boxShadow: "0 8px 32px rgba(0,0,0,0.1)" } }}
            >
                <DialogTitle sx={{ 
                    backgroundColor: "#e3f2fd", 
                    color: "#0077b6", 
                    fontFamily: "'Poppins', sans-serif",
                    fontWeight: 600,
                    borderRadius: "12px 12px 0 0"
                }}>
                    Comentario
                </DialogTitle>
                <DialogContent sx={{ padding: "1.5rem" }}>
                    <Typography sx={{ fontFamily: "'Roboto', sans-serif", color: "#333", fontSize: "1rem" }}>
                        {comentario}
                    </Typography>
                </DialogContent>
            </Dialog>
        </Box>
    );
};

export default HistorialProcesosTerminados;