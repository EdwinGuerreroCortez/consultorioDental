import React, { useEffect, useState } from "react";
import {
  Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
  Button, Dialog, DialogActions, DialogContent, DialogTitle, Tabs, Tab,
} from "@mui/material";
import axios from "axios";
import { verificarAutenticacion } from "../../utils/auth";
import { Visibility as VisibilityIcon, LocalHospital as DentalIcon } from '@mui/icons-material';
const HistorialTratamientoPaciente = () => {
  const [historial, setHistorial] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [usuarioId, setUsuarioId] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedTratamiento, setSelectedTratamiento] = useState(null);
  const [activeTab, setActiveTab] = useState(0); // 0 = Citas, 1 = Pagos

  useEffect(() => {
    const obtenerUsuario = async () => {
      const usuario = await verificarAutenticacion();
      if (usuario && usuario.id) {
        setUsuarioId(usuario.id);
      } else {
        setError("No se pudo obtener la sesión del usuario.");
        setLoading(false);
      }
    };

    obtenerUsuario();
  }, []);

  useEffect(() => {
    const fetchHistorial = async () => {
      if (!usuarioId) return;

      try {
        const response = await axios.get(`http://localhost:4000/api/tratamientos-pacientes/historial/${usuarioId}`, {
          withCredentials: true,
        });
        setHistorial(response.data);
      } catch (error) {
        console.error("Error al obtener el historial de tratamientos:", error);
        setError("Error al obtener el historial de tratamientos");
      } finally {
        setLoading(false);
      }
    };

    fetchHistorial();
  }, [usuarioId]);

  // Abrir modal con tratamiento seleccionado
  const handleOpenDialog = (tratamiento) => {
    setSelectedTratamiento(tratamiento);
    setActiveTab(0); // Reiniciar a la pestaña de Citas
    setOpenDialog(true);
  };

  // Cerrar modal
  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedTratamiento(null);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ color: "#0077b6", mb: 2, textAlign: "center" }}>
        Historial de Tratamientos
      </Typography>

      {loading ? (
        <Typography textAlign="center">Cargando historial...</Typography>
      ) : error ? (
        <Typography color="error" textAlign="center">{error}</Typography>
      ) : historial.length === 0 ? (
        <Typography textAlign="center">No hay tratamientos finalizados registrados.</Typography>
      ) : (
<TableContainer
      component={Paper}
      sx={{
        boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
        borderRadius: "16px",
        overflowX: "auto",
        margin: "30px auto",
        maxWidth: "100%",
        background: "linear-gradient(135deg, #f7fafc 0%, #e6f0fa 100%)", // Fondo con degradado suave
        border: "1px solid #e0e7ff",
      }}
    >
      {/* Encabezado personalizado con ícono dental */}
      <Typography
        variant="h6"
        sx={{
          padding: "16px",
          backgroundColor: "#4a90e2",
          color: "white",
          display: "flex",
          alignItems: "center",
          borderTopLeftRadius: "16px",
          borderTopRightRadius: "16px",
          fontFamily: "'Poppins', sans-serif",
          fontWeight: 600,
        }}
      >
        <DentalIcon sx={{ marginRight: "8px" }} />
        Historial de Tratamientos Dentales
      </Typography>

      <Table>
        <TableHead>
          <TableRow
            sx={{
              backgroundColor: "#e6f0fa", // Fondo azul claro para el encabezado
              "& th": {
                color: "#2d6187", // Texto azul oscuro para contraste
                fontWeight: "600",
                fontSize: "1rem",
                padding: "14px 16px",
                borderBottom: "2px solid #d0e4ff",
                fontFamily: "'Roboto', sans-serif",
              },
            }}
          >
            <TableCell>Tratamiento</TableCell>
            <TableCell>Estado</TableCell>
            <TableCell>Fecha Inicio</TableCell>
            <TableCell>Fecha Finalización</TableCell>
            <TableCell>Citas Asistidas</TableCell>
            <TableCell>Acción</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {historial.length > 0 ? (
            historial.map((tratamiento) => (
              <TableRow
                key={tratamiento.tratamiento_id}
                hover
                sx={{
                  "&:hover": { backgroundColor: "#f0f7ff" },
                  transition: "background-color 0.3s ease",
                  backgroundColor: "white",
                }}
              >
                <TableCell sx={{ padding: "14px 16px", fontSize: "0.95rem", color: "#333" }}>
                  {tratamiento.tratamiento_nombre}
                </TableCell>
                <TableCell sx={{ padding: "14px 16px" }}>
                  <span
                    style={{
                      color:
                        tratamiento.estado === "Activo"
                          ? "#28a745" // Verde para activo
                          : tratamiento.estado === "Finalizado"
                          ? "#6c757d" // Gris para finalizado
                          : "#dc3545", // Rojo para otros estados
                      fontWeight: "500",
                      fontFamily: "'Roboto', sans-serif",
                    }}
                  >
                    {tratamiento.estado}
                  </span>
                </TableCell>
                <TableCell sx={{ padding: "14px 16px", color: "#333" }}>
                  {tratamiento.fecha_inicio}
                </TableCell>
                <TableCell sx={{ padding: "14px 16px", color: "#333" }}>
                  {tratamiento.fecha_finalizacion || "No registrada"}
                </TableCell>
                <TableCell sx={{ padding: "14px 16px", color: "#333" }}>
                  {tratamiento.citas_asistidas} / {tratamiento.citas_totales}
                </TableCell>
                <TableCell sx={{ padding: "14px 16px" }}>
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<VisibilityIcon />}
                    sx={{
                      color: "#4a90e2",
                      borderColor: "#4a90e2",
                      "&:hover": {
                        backgroundColor: "#4a90e2",
                        color: "white",
                        borderColor: "#4a90e2",
                      },
                      textTransform: "none",
                      padding: "6px 12px",
                      borderRadius: "12px",
                      fontSize: "0.9rem",
                      transition: "all 0.3s ease",
                      fontFamily: "'Roboto', sans-serif",
                    }}
                    onClick={() => handleOpenDialog(tratamiento)}
                  >
                    Ver Detalles
                  </Button>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={6} align="center" sx={{ padding: "30px", color: "#6c757d" }}>
                <Typography variant="body1" sx={{ fontFamily: "'Roboto', sans-serif" }}>
                  No hay tratamientos registrados.
                </Typography>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
      )}

      {/* Dialog para mostrar Citas y Pagos */}
      {selectedTratamiento && (
        <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
          <DialogTitle>Detalles del Tratamiento</DialogTitle>
          <DialogContent>
            {/* Tabs para cambiar entre Citas y Pagos */}
            <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)} centered>
              <Tab label="Citas" />
              <Tab label="Pagos" />
              <Tab label="Comenatrios" />
            </Tabs>

            {/* Contenido de Citas */}
            {activeTab === 0 && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="h6" color="primary">Citas</Typography>
                <TableContainer component={Paper}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Fecha</TableCell>
                        <TableCell>Estado</TableCell>
                        <TableCell>Pagada</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {selectedTratamiento.citas.length > 0 ? (
                        selectedTratamiento.citas.map((cita, index) => (
                          <TableRow key={index}>
                            <TableCell>{cita.fecha_cita || "No registrada"}</TableCell>
                            <TableCell>{cita.estado_cita}</TableCell>
                            <TableCell>{cita.cita_pagada ? "Sí" : "No"}</TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow><TableCell colSpan={4}>No hay citas registradas.</TableCell></TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            )}

            {/* Contenido de Pagos */}
            {activeTab === 1 && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="h6" color="primary">Pagos</Typography>
                <TableContainer component={Paper}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Monto</TableCell>
                        <TableCell>Método</TableCell>
                        <TableCell>Estado</TableCell>
                        <TableCell>Fecha Pago</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {selectedTratamiento.pagos.length > 0 ? (
                        selectedTratamiento.pagos.map((pago, index) => (
                          <TableRow key={index}>
                            <TableCell>${pago.monto_pago}</TableCell>
                            <TableCell>{pago.metodo_pago || "No especificado"}</TableCell>
                            <TableCell>{pago.estado_pago}</TableCell>
                            <TableCell>{pago.fecha_pago || "No registrada"}</TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow><TableCell colSpan={4}>No hay pagos registrados.</TableCell></TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            )}

            {activeTab === 2 && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="h6" color="primary">Citas</Typography>
                <TableContainer component={Paper}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Comentario</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {selectedTratamiento.citas.length > 0 ? (
                        selectedTratamiento.citas.map((cita, index) => (
                          <TableRow key={index}>
                            <TableCell>{cita.cita_comentario || "Sin comentarios"}</TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow><TableCell colSpan={4}>No hay citas registradas.</TableCell></TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog} color="secondary" variant="contained">
              Cerrar
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </Box>
  );
};

export default HistorialTratamientoPaciente;
