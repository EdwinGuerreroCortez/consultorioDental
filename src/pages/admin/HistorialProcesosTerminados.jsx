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

const HistorialProcesosTerminados = () => {
  const [tratamientos, setTratamientos] = useState([]);
  const [detalleSeleccionado, setDetalleSeleccionado] = useState(null);
  const [open, setOpen] = useState(false);
  const [tabIndex, setTabIndex] = useState(0);
  const [comentario, setComentario] = useState(null);
  const [openComentario, setOpenComentario] = useState(false);

  useEffect(() => {
    axios
      .get("https://backenddent.onrender.com/api/tratamientos-pacientes/historial")
      .then((response) => {
        console.log("Datos recibidos del historial:", response.data);
        setTratamientos(response.data);
      })
      .catch((error) => {
        console.error("Error al obtener el historial de tratamientos", error);
      });
  }, []);

  const handleVerDetalles = (tratamiento) => {
    console.log("Tratamiento seleccionado:", tratamiento);
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

  // Estilo para las celdas, alineado con el tamaño más pequeño de TratamientosEnCurso
  const cellStyle = {
    textAlign: "center",
    color: "#03445e",
    fontFamily: "'Poppins', sans-serif",
    padding: "12px", // Reduced padding to match TratamientosEnCurso
    fontSize: "0.9rem", // Smaller font size
    whiteSpace: "normal", // Allow text wrapping to ensure visibility
    wordWrap: "break-word", // Break long words if necessary
  };

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
      <Box sx={{ flexGrow: 1, width: "100%" }}>
        <TableContainer
          component={Paper}
          sx={{
            borderRadius: "16px",
            boxShadow: "0 8px 24px rgba(0, 0, 0, 0.08)",
            overflow: "hidden",
            mt: 3,
            maxWidth: "1400px",
            mx: "auto",
            border: "1px solid #78c1c8",
          }}
        >
          <Table sx={{ tableLayout: "auto" }}> {/* Changed to "auto" to allow natural column sizing */}
            <TableHead
              sx={{
                background: "linear-gradient(90deg, #006d77 0%, #78c1c8 100%)",
              }}
            >
              <TableRow>
                {[
                  "Nombre del Paciente",
                  "Edad",
                  "Sexo",
                  "Correo",
                  "Teléfono",
                  "Tratamiento",
                  "Citas Totales / Asistidas",
                  "Fecha de Inicio",
                  "Acciones",
                ].map((header) => (
                  <TableCell
                    key={header}
                    sx={{
                      color: "#e0f7fa",
                      fontWeight: 700,
                      textAlign: "center",
                      fontFamily: "'Poppins', sans-serif",
                      borderBottom: "none",
                      padding: "12px", // Reduced padding
                      fontSize: "0.95rem", // Smaller font size
                      whiteSpace: "normal", // Allow wrapping
                    }}
                  >
                    {header}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {tratamientos.length > 0 ? (
                tratamientos.map((tratamiento) => (
                  <TableRow
                    key={tratamiento.tratamiento_id}
                    sx={{
                      "&:hover": {
                        backgroundColor: "#e0f7fa",
                        transition: "background-color 0.3s ease",
                        boxShadow: "inset 0 2px 10px rgba(0, 0, 0, 0.05)",
                      },
                      borderBottom: "1px solid #eef3f7",
                    }}
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
                          background: "linear-gradient(45deg, #006d77, #78c1c8)",
                          boxShadow: "0 2px 8px rgba(0, 109, 119, 0.3)",
                          "&:hover": {
                            background: "linear-gradient(45deg, #004d57, #48cae4)",
                            boxShadow: "0 4px 12px rgba(0, 109, 119, 0.4)",
                          },
                          fontSize: "0.9rem", // Smaller font size
                          padding: "6px 12px", // Reduced padding
                        }}
                      >
                        Ver Detalles
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={9} sx={{ ...cellStyle, color: "#999" }}>
                    No hay tratamientos registrados.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      {/* Diálogo de Detalles */}
      <Dialog
        open={open}
        onClose={handleClose}
        fullWidth
        maxWidth="md"
        sx={{ "& .MuiDialog-paper": { borderRadius: "12px", boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)" } }}
      >
        <DialogTitle
          sx={{
            background: "linear-gradient(90deg, #006d77 0%, #78c1c8 100%)",
            color: "#e0f7fa",
            fontFamily: "'Poppins', sans-serif",
            fontWeight: 600,
            borderRadius: "12px 12px 0 0",
            padding: "16px", // Reduced padding
            fontSize: "1.1rem", // Slightly smaller font
          }}
        >
          Detalles del Tratamiento
        </DialogTitle>
        <DialogContent sx={{ padding: "1.5rem", backgroundColor: "#ffffff" }}> {/* Reduced padding */}
          {detalleSeleccionado ? (
            <>
              <Tabs
                value={tabIndex}
                onChange={handleTabChange}
                centered
                sx={{
                  mb: "1rem", // Reduced margin
                  "& .MuiTab-root": {
                    fontFamily: "'Poppins', sans-serif",
                    textTransform: "none",
                    fontSize: "1rem", // Smaller font
                    "&.Mui-selected": {
                      color: "#006d77",
                    },
                  },
                  "& .MuiTabs-indicator": {
                    backgroundColor: "#006d77",
                  },
                }}
              >
                <Tab label="Citas" />
                <Tab label="Pagos" />
              </Tabs>
              {tabIndex === 0 && (
                <TableContainer
                  component={Paper}
                  sx={{ borderRadius: "12px", boxShadow: "0 4px 16px rgba(0, 0, 0, 0.05)", backgroundColor: "#e0f7fa" }}
                >
                  <Table>
                    <TableHead sx={{ backgroundColor: "#e0f7fa" }}>
                      <TableRow>
                        <TableCell sx={{ ...cellStyle, fontWeight: 600 }}>Fecha</TableCell>
                        <TableCell sx={{ ...cellStyle, fontWeight: 600 }}>Estado</TableCell>
                        <TableCell sx={{ ...cellStyle, fontWeight: 600 }}>Pago</TableCell>
                        <TableCell sx={{ ...cellStyle, fontWeight: 600 }}>Comentario</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {detalleSeleccionado.citas && detalleSeleccionado.citas.length > 0 ? (
                        detalleSeleccionado.citas.map((cita) => (
                          <TableRow
                            key={cita.cita_id}
                            sx={{ "&:hover": { backgroundColor: "#d3ecef" } }}
                          >
                            <TableCell sx={cellStyle}>{cita.fecha_cita || "Pendiente"}</TableCell>
                            <TableCell sx={cellStyle}>{cita.estado_cita || "N/A"}</TableCell>
                            <TableCell sx={cellStyle}>{cita.cita_pagada ? "Pagado" : "Pendiente"}</TableCell>
                            <TableCell sx={cellStyle}>
                              <Button
                                variant="outlined"
                                size="small"
                                onClick={() => handleVerComentario(cita.cita_comentario || "Sin comentario")}
                                sx={{
                                  borderRadius: "8px",
                                  color: "#006d77",
                                  borderColor: "#78c1c8",
                                  "&:hover": {
                                    backgroundColor: "#e0f7fa",
                                    borderColor: "#004d57",
                                  },
                                  fontSize: "0.8rem", // Smaller font
                                  padding: "4px 8px", // Reduced padding
                                }}
                              >
                                Ver Comentario
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={4} sx={{ ...cellStyle, color: "#999" }}>
                            No hay citas registradas.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
              {tabIndex === 1 && (
                <TableContainer
                  component={Paper}
                  sx={{ borderRadius: "12px", boxShadow: "0 4px 16px rgba(0, 0, 0, 0.05)", backgroundColor: "#e0f7fa" }}
                >
                  <Table>
                    <TableHead sx={{ backgroundColor: "#e0f7fa" }}>
                      <TableRow>
                        <TableCell sx={{ ...cellStyle, fontWeight: 600 }}>Monto</TableCell>
                        <TableCell sx={{ ...cellStyle, fontWeight: 600 }}>Método</TableCell>
                        <TableCell sx={{ ...cellStyle, fontWeight: 600 }}>Estado</TableCell>
                        <TableCell sx={{ ...cellStyle, fontWeight: 600 }}>Fecha</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {detalleSeleccionado.pagos && detalleSeleccionado.pagos.length > 0 ? (
                        detalleSeleccionado.pagos.map((pago) => (
                          <TableRow
                            key={pago.pago_id}
                            sx={{ "&:hover": { backgroundColor: "#d3ecef" } }}
                          >
                            <TableCell sx={cellStyle}>{pago.monto_pago || "N/A"}</TableCell>
                            <TableCell sx={cellStyle}>{pago.metodo_pago || "No especificado"}</TableCell>
                            <TableCell sx={cellStyle}>{pago.estado_pago || "N/A"}</TableCell>
                            <TableCell sx={cellStyle}>{pago.fecha_pago || "No registrado"}</TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={4} sx={{ ...cellStyle, color: "#999" }}>
                            No hay pagos registrados.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </>
          ) : (
            <Typography sx={{ textAlign: "center", color: "#03445e", fontFamily: "'Poppins', sans-serif", fontSize: "0.9rem" }}>
              No se encontraron detalles.
            </Typography>
          )}
        </DialogContent>
      </Dialog>

      {/* Diálogo de Comentario */}
      <Dialog
        open={openComentario}
        onClose={handleCloseComentario}
        fullWidth
        maxWidth="sm"
        sx={{ "& .MuiDialog-paper": { borderRadius: "12px", boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)" } }}
      >
        <DialogTitle
          sx={{
            backgroundColor: "#e0f7fa",
            color: "#006d77",
            fontFamily: "'Poppins', sans-serif",
            fontWeight: 600,
            borderRadius: "12px 12px 0 0",
            padding: "12px", // Reduced padding
            fontSize: "1rem", // Smaller font
          }}
        >
          Comentario
        </DialogTitle>
        <DialogContent sx={{ padding: "1rem", backgroundColor: "#ffffff" }}> {/* Reduced padding */}
          <Typography
            sx={{
              fontFamily: "'Poppins', sans-serif",
              color: "#03445e",
              fontSize: "0.9rem", // Smaller font
              textAlign: "center",
            }}
          >
            {comentario}
          </Typography>
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default HistorialProcesosTerminados;