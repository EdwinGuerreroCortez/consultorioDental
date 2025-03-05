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
      
      // Estilos para mantener las celdas fijas
      const cellStyle = {
        textAlign: "center",
        width: "150px", // Tamaño fijo para que no cambien de tamaño
        maxWidth: "150px",
        whiteSpace: "nowrap", // Evita saltos de línea
        overflow: "hidden", // Oculta el contenido que excede
        textOverflow: "ellipsis", // Agrega "..." si el texto es largo
        display: "table-cell",
      };
      
      const MotionTableRow = motion(TableRow);
      
    return (
    <Box>
  <motion.div variants={tableVariants} initial="hidden" animate="visible">
      <TableContainer component={Paper} sx={{ borderRadius: 3, boxShadow: 4, overflow: "hidden", mt: 3 }}>
        <Table sx={{ tableLayout: "fixed" }}> {/* Se asegura que el tamaño de las celdas sea fijo */}
          <TableHead sx={{ backgroundColor: "#1976d2" }}>
            <TableRow>
              {[
                "Nombre del Paciente", "Edad", "Sexo", "Correo", "Teléfono",
                "Tratamiento", "Citas Totales / Asistidas", "Fecha de Inicio", "Acciones"
              ].map((header) => (
                <TableCell 
                  key={header} 
                  sx={{ ...cellStyle, color: "#fff", fontWeight: "bold", textAlign: "center" }}
                >
                  {header}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {tratamientos.map((tratamiento, index) => (
              <MotionTableRow
                key={tratamiento.tratamiento_id}
                variants={rowVariants}
                whileHover={{ scale: 1.02, backgroundColor: "#f5f5f5" }}
                style={{ cursor: "pointer" }}
              >
                <TableCell sx={cellStyle}>{`${tratamiento.nombre} ${tratamiento.apellido_paterno} ${tratamiento.apellido_materno}`}</TableCell>
                <TableCell sx={cellStyle}>{tratamiento.edad}</TableCell>
                <TableCell sx={cellStyle}>{tratamiento.sexo}</TableCell>
                <TableCell sx={cellStyle}>{tratamiento.email}</TableCell>
                <TableCell sx={cellStyle}>{tratamiento.telefono}</TableCell>
                <TableCell sx={cellStyle}>{tratamiento.tratamiento_nombre}</TableCell>
                <TableCell sx={cellStyle}>{`${tratamiento.citas_totales} / ${tratamiento.citas_asistidas}`}</TableCell>
                <TableCell sx={cellStyle}>{tratamiento.fecha_inicio}</TableCell>
                <TableCell sx={cellStyle}>
                  <Button 
                    variant="contained" 
                    color="primary" 
                    onClick={() => handleVerDetalles(tratamiento)}
                    sx={{ textTransform: "none", borderRadius: 2 }}
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
        <Dialog open={open} onClose={handleClose} fullWidth maxWidth="md">
                <DialogTitle>Detalles del Tratamiento</DialogTitle>
                <DialogContent>
                    {detalleSeleccionado && (
                        <>
                            <Tabs value={tabIndex} onChange={handleTabChange} centered>
                                <Tab label="Citas" />
                                <Tab label="Pagos" />
                            </Tabs>
                            {tabIndex === 0 && (
                                <>
                                    <Typography variant="h6">Citas:</Typography>
                                    <Table>
                                        <TableHead>
                                            <TableRow>
                                                <TableCell>Fecha</TableCell>
                                                <TableCell>Estado</TableCell>
                                                <TableCell>Pago</TableCell>
                                                <TableCell>Comentario</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {detalleSeleccionado.citas.map((cita) => (
                                                <TableRow key={cita.cita_id}>
                                                    <TableCell>{cita.fecha_cita || "Pendiente"}</TableCell>
                                                    <TableCell>{cita.estado_cita}</TableCell>
                                                    <TableCell>{cita.cita_pagada ? "Pagado" : "Pendiente"}</TableCell>
                                                    <TableCell>
                                                        <Button variant="outlined" size="small" onClick={() => handleVerComentario(cita.cita_comentario || "Sin comentario")}>Ver Comentario</Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </>
                            )}
                            {tabIndex === 1 && (
                                <>
                                    <Typography variant="h6">Pagos:</Typography>
                                    <Table>
                                        <TableHead>
                                            <TableRow>
                                                <TableCell>Monto</TableCell>
                                                <TableCell>Método</TableCell>
                                                <TableCell>Estado</TableCell>
                                                <TableCell>Fecha</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {detalleSeleccionado.pagos.map((pago) => (
                                                <TableRow key={pago.pago_id}>
                                                    <TableCell>{pago.monto_pago}</TableCell>
                                                    <TableCell>{pago.metodo_pago || "No especificado"}</TableCell>
                                                    <TableCell>{pago.estado_pago}</TableCell>
                                                    <TableCell>{pago.fecha_pago || "No registrado"}</TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </>
                            )}
                        </>
                    )}
                </DialogContent>
        </Dialog>

        <Dialog open={openComentario} onClose={handleCloseComentario} fullWidth maxWidth="sm">
                <DialogTitle>Comentario</DialogTitle>
                <DialogContent>
                    <Typography>{comentario}</Typography>
                </DialogContent>
        </Dialog>
    </Box>
    );
};

export default HistorialProcesosTerminados;
