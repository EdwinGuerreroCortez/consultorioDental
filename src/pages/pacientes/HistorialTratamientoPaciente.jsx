import React, { useEffect, useState } from "react";
import axios from "axios";
import { verificarAutenticacion } from "../../utils/auth";
import {
  Box,
  Typography,
  Card,
  CardContent,
  CircularProgress,
  Chip,
  ThemeProvider,
  createTheme,
  IconButton,
  Tooltip,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Tabs,
  Tab,
} from "@mui/material";
import { History as HistoryIcon, ArrowBack, Visibility } from "@mui/icons-material";
import { styled } from "@mui/system";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

// Definir el tema con la fuente "Geologica"
const theme = createTheme({
  typography: {
    fontFamily: "'Geologica', sans-serif",
  },
  palette: {
    primary: {
      main: "#0077b6",
    },
    secondary: {
      main: "#48cae4",
    },
  },
});

// Styled components
const HeaderBox = styled(Box)(({ theme }) => ({
  background: "linear-gradient(135deg, #0077b6 0%, #48cae4 100%)",
  color: "#ffffff",
  padding: theme.spacing(2.5),
  borderRadius: "16px 16px 0 0",
  display: "flex",
  alignItems: "center",
  gap: "12px",
  boxShadow: "0 6px 20px rgba(0, 119, 182, 0.3)",
  width: "100%",
  maxWidth: "1400px",
  position: "relative",
  overflow: "hidden",
  "&:before": {
    content: '""',
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    background: "rgba(255, 255, 255, 0.15)",
    clipPath: "polygon(0 0, 40% 0, 20% 100%, 0% 100%)",
    zIndex: 0,
  },
}));

const TreatmentCard = styled(Card)(({ theme }) => ({
  backgroundColor: "#ffffff",
  borderRadius: "12px",
  marginBottom: theme.spacing(2),
  boxShadow: "0 4px 15px rgba(0, 0, 0, 0.08)",
  border: "1px solid rgba(0, 119, 182, 0.1)",
  transition: "all 0.3s ease",
  "&:hover": {
    transform: "translateY(-4px)",
    boxShadow: "0 6px 20px rgba(0, 119, 182, 0.15)",
  },
  padding: theme.spacing(1),
}));

const StyledDialog = styled(Dialog)(({ theme }) => ({
  "& .MuiDialog-paper": {
    width: "90%",
    maxWidth: "1200px",
    height: "80vh",
    maxHeight: "900px",
    borderRadius: "16px",
    boxShadow: "0 10px 30px rgba(0, 119, 182, 0.3)",
    overflow: "hidden",
  },
}));

const HistorialTratamientoPaciente = () => {
  const [historial, setHistorial] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [usuarioId, setUsuarioId] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedTratamiento, setSelectedTratamiento] = useState(null);
  const [activeTab, setActiveTab] = useState(0); // 0 = Citas, 1 = Pagos, 2 = Comentarios
  const navigate = useNavigate();

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
        const response = await axios.get(`https://backenddent.onrender.com/api/tratamientos-pacientes/historial/${usuarioId}`, {
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

  const handleOpenDialog = (tratamiento) => {
    setSelectedTratamiento(tratamiento);
    setActiveTab(0);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedTratamiento(null);
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  // Animaciones
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.8, ease: "easeOut" } },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.1, duration: 0.6, ease: "easeOut" },
    }),
  };

  const dialogVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.3, ease: "easeOut" } },
  };

  return (
    <ThemeProvider theme={theme}>
      <Box
        sx={{
          minHeight: "100vh",
          width: "100%",
          padding: { xs: "2rem", md: "3rem" },
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          background: "linear-gradient(145deg, #f5faff 0%, #e0eefc 100%)",
        }}
      >
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          style={{ width: "100%", maxWidth: "1400px" }}
        >
          {/* Back Button */}
          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
            <IconButton
              onClick={handleGoBack}
              sx={{
                position: "absolute",
                top: "20px",
                left: "20px",
                color: "#0077b6",
                "&:hover": { color: "#01579b" },
              }}
              aria-label="Volver atrás"
            >
              <ArrowBack fontSize="medium" />
            </IconButton>
          </motion.div>

          {/* Header */}
          <HeaderBox>
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
            >
              <HistoryIcon sx={{ fontSize: { xs: 26, md: 30 }, zIndex: 1 }} />
            </motion.div>
            <Typography
              variant="h5"
              sx={{
                fontWeight: 600,
                fontSize: { xs: "1.25rem", md: "1.5rem" },
                textShadow: "1px 1px 4px rgba(0, 0, 0, 0.2)",
                zIndex: 1,
              }}
            >
              Historial de Tratamientos
            </Typography>
          </HeaderBox>

          {/* Main Content */}
          <Box
            sx={{
              width: "100%",
              maxWidth: "1400px",
              backgroundColor: "#ffffff",
              borderRadius: "0 0 16px 16px",
              padding: { xs: "1.5rem", md: "2rem" },
              boxShadow: "0 6px 20px rgba(0, 0, 0, 0.08)",
            }}
          >
            {loading ? (
              <Box sx={{ display: "flex", justifyContent: "center", padding: "2rem" }}>
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  <CircularProgress sx={{ color: "#0077b6" }} size={40} thickness={5} />
                </motion.div>
              </Box>
            ) : error ? (
              <Box sx={{ textAlign: "center", padding: "3rem" }}>
                <Typography
                  variant="body1"
                  sx={{
                    color: "#dc3545",
                    fontSize: { xs: "0.9rem", md: "1rem" },
                  }}
                >
                  {error}
                </Typography>
              </Box>
            ) : historial.length > 0 ? (
              historial.map((t, index) => (
                <motion.div
                  key={t.tratamiento_id}
                  custom={index}
                  variants={cardVariants}
                  initial="hidden"
                  animate="visible"
                >
                  <TreatmentCard>
                    <CardContent
                      sx={{
                        display: "flex",
                        flexDirection: { xs: "column", md: "row" },
                        alignItems: { xs: "flex-start", md: "center" },
                        justifyContent: "space-between",
                        padding: { xs: "1rem", md: "1.25rem" },
                      }}
                    >
                      <Box sx={{ display: "flex", alignItems: "center", gap: "14px", flexGrow: 1 }}>
                        <HistoryIcon sx={{ color: "#0077b6", fontSize: { xs: 22, md: 26 } }} />
                        <Box sx={{ flexGrow: 1 }}>
                          <Typography
                            variant="body1"
                            sx={{
                              fontWeight: 500,
                              fontSize: { xs: "0.85rem", md: "0.95rem" },
                              color: "#333",
                            }}
                          >
                            {t.tratamiento_nombre}
                          </Typography>
                          <Typography
                            variant="caption"
                            sx={{
                              color: "#777",
                              mt: 0.5,
                              fontSize: { xs: "0.7rem", md: "0.8rem" },
                            }}
                          >
                            Fecha Inicio: {t.fecha_inicio} | Fecha Fin: {t.fecha_finalizacion || "No registrada"} | Citas: {t.citas_asistidas}/{t.citas_totales}
                          </Typography>
                        </Box>
                      </Box>
                      <Box
                        sx={{
                          display: "flex",
                          gap: "10px",
                          mt: { xs: 1.5, md: 0 },
                          alignItems: "center",
                          flexShrink: 0,
                        }}
                      >
                        <Tooltip title="Estado del Tratamiento" arrow>
                          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                            <Chip
                              label={t.estado === "terminado" ? "Finalizado" : t.estado}
                              color={t.estado === "terminado" || t.estado === "Finalizado" ? "success" : "default"}
                              size="small"
                              sx={{
                                fontWeight: 500,
                                fontSize: { xs: "0.65rem", md: "0.75rem" },
                                padding: "4px 8px",
                                borderRadius: "8px",
                                boxShadow: "0 2px 6px rgba(0, 0, 0, 0.1)",
                              }}
                            />
                          </motion.div>
                        </Tooltip>
                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                          <Button
                            variant="contained"
                            size="small"
                            startIcon={<Visibility />}
                            sx={{
                              backgroundColor: "#0077b6",
                              borderRadius: "10px",
                              textTransform: "none",
                              fontSize: { xs: "0.8rem", md: "0.85rem" },
                              fontWeight: 500,
                              padding: { xs: "6px 12px", md: "8px 16px" },
                              boxShadow: "0 4px 12px rgba(0, 119, 182, 0.2)",
                              "&:hover": {
                                backgroundColor: "#01579b",
                                boxShadow: "0 6px 15px rgba(0, 119, 182, 0.3)",
                              },
                            }}
                            onClick={() => handleOpenDialog(t)}
                          >
                            Ver Detalles
                          </Button>
                        </motion.div>
                      </Box>
                    </CardContent>
                  </TreatmentCard>
                </motion.div>
              ))
            ) : (
              <Box sx={{ textAlign: "center", padding: "3rem" }}>
                <Typography
                  variant="body1"
                  sx={{
                    color: "#666",
                    fontSize: { xs: "0.9rem", md: "1rem" },
                    mb: 2.5,
                    fontStyle: "italic",
                  }}
                >
                  No tienes tratamientos finalizados registrados.
                </Typography>
              </Box>
            )}
          </Box>

          {/* Dialog para detalles */}
          {selectedTratamiento && (
            <StyledDialog
              open={openDialog}
              onClose={handleCloseDialog}
              maxWidth={false}
              component={motion.div}
              variants={dialogVariants}
              initial="hidden"
              animate="visible"
            >
              <DialogTitle
                sx={{
                  background: "linear-gradient(135deg, #0077b6 0%, #48cae4 100%)",
                  color: "#fff",
                  padding: "24px",
                  borderRadius: "16px 16px 0 0",
                  fontSize: { xs: "1.25rem", md: "1.75rem" },
                  fontWeight: 700,
                  display: "flex",
                  alignItems: "center",
                  gap: "16px",
                  position: "relative",
                  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.2)",
                }}
              >
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                >
                  <HistoryIcon sx={{ fontSize: { xs: 28, md: 36 } }} />
                </motion.div>
                Detalles del Tratamiento: {selectedTratamiento.tratamiento_nombre}
              </DialogTitle>
              <DialogContent
                sx={{
                  padding: "32px",
                  backgroundColor: "#f5faff",
                  display: "flex",
                  flexDirection: "column",
                  gap: "24px",
                  height: "100%",
                  overflowY: "auto",
                }}
              >
                <Box
                  sx={{
                    backgroundColor: "#fff",
                    borderRadius: "16px",
                    padding: "20px",
                    boxShadow: "0 6px 20px rgba(0, 0, 0, 0.1)",
                    border: "1px solid rgba(0, 119, 182, 0.1)",
                  }}
                >
                  <Typography
                    variant="h6"
                    component="div"
                    sx={{ fontWeight: 600, color: "#0077b6", mb: 2, fontSize: { xs: "1rem", md: "1.25rem" } }}
                  >
                    Información General
                  </Typography>
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: "16px" }}>
                    <Typography
                      variant="body2"
                      component="div"
                      sx={{ fontSize: { xs: "0.9rem", md: "1rem" }, color: "#333" }}
                    >
                      <strong>Fecha Inicio:</strong> {selectedTratamiento.fecha_inicio}
                    </Typography>
                    <Typography
                      variant="body2"
                      component="div"
                      sx={{ fontSize: { xs: "0.9rem", md: "1rem" }, color: "#333" }}
                    >
                      <strong>Fecha Fin:</strong> {selectedTratamiento.fecha_finalizacion || "No registrada"}
                    </Typography>
                    <Typography
                      variant="body2"
                      component="div"
                      sx={{ fontSize: { xs: "0.9rem", md: "1rem" }, color: "#333" }}
                    >
                      <strong>Citas:</strong> {selectedTratamiento.citas_asistidas}/{selectedTratamiento.citas_totales}
                    </Typography>
                    <Box sx={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <Typography
                        variant="body2"
                        component="span"
                        sx={{ fontSize: { xs: "0.9rem", md: "1rem" }, color: "#333" }}
                      >
                        <strong>Estado:</strong>
                      </Typography>
                      <Chip
                        label={selectedTratamiento.estado === "terminado" ? "Finalizado" : selectedTratamiento.estado}
                        color={selectedTratamiento.estado === "terminado" || selectedTratamiento.estado === "Finalizado" ? "success" : "default"}
                        size="small"
                        sx={{ fontWeight: 500, padding: "4px 8px", borderRadius: "8px" }}
                      />
                    </Box>
                  </Box>
                </Box>

                <Tabs
                  value={activeTab}
                  onChange={(e, newValue) => setActiveTab(newValue)}
                  centered
                  sx={{
                    mb: 2,
                    "& .MuiTab-root": {
                      fontSize: { xs: "0.9rem", md: "1rem" },
                      textTransform: "none",
                      color: "#555",
                      "&.Mui-selected": { color: "#0077b6", fontWeight: 600 },
                      padding: "10px 20px",
                    },
                    "& .MuiTabs-indicator": { backgroundColor: "#0077b6", height: "4px" },
                  }}
                >
                  <Tab label="Citas" />
                  <Tab label="Pagos" />
                  <Tab label="Comentarios" />
                </Tabs>

                {activeTab === 0 && (
                  <Box
                    sx={{
                      backgroundColor: "#fff",
                      borderRadius: "16px",
                      padding: "20px",
                      boxShadow: "0 6px 20px rgba(0, 0, 0, 0.1)",
                      border: "1px solid rgba(0, 119, 182, 0.1)",
                      flexGrow: 1,
                      overflowX: "auto",
                    }}
                  >
                    <Typography
                      variant="h6"
                      component="div"
                      sx={{ fontWeight: 600, color: "#0077b6", mb: 2, fontSize: { xs: "1rem", md: "1.25rem" } }}
                    >
                      Lista de Citas
                    </Typography>
                    {selectedTratamiento.citas.length > 0 ? (
                      <Box sx={{ minWidth: "600px" }}>
                        {/* Encabezado de la tabla */}
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            padding: "12px",
                            backgroundColor: "#0077b6",
                            color: "#fff",
                            borderRadius: "8px 8px 0 0",
                            fontWeight: 600,
                          }}
                        >
                          <Typography sx={{ flex: 1, fontSize: { xs: "0.9rem", md: "1rem" } }}>
                            Fecha
                          </Typography>
                          <Typography sx={{ flex: 1, fontSize: { xs: "0.9rem", md: "1rem" } }}>
                            Estado
                          </Typography>
                          <Typography sx={{ flex: 1, fontSize: { xs: "0.9rem", md: "1rem" } }}>
                            Pagada
                          </Typography>
                        </Box>
                        {/* Filas de datos */}
                        {selectedTratamiento.citas.map((cita, index) => (
                          <Box
                            key={index}
                            sx={{
                              display: "flex",
                              justifyContent: "space-between",
                              padding: "12px",
                              backgroundColor: index % 2 === 0 ? "#f9f9f9" : "#fff",
                              borderBottom: index < selectedTratamiento.citas.length - 1 ? "1px solid #eee" : "none",
                              borderRadius: index === selectedTratamiento.citas.length - 1 ? "0 0 8px 8px" : "0",
                            }}
                          >
                            <Typography
                              sx={{ flex: 1, fontSize: { xs: "0.9rem", md: "1rem" }, color: "#333" }}
                            >
                              {cita.fecha_cita || "No registrada"}
                            </Typography>
                            <Typography
                              sx={{ flex: 1, fontSize: { xs: "0.9rem", md: "1rem" }, color: "#333" }}
                            >
                              {cita.estado_cita}
                            </Typography>
                            <Typography
                              sx={{
                                flex: 1,
                                fontSize: { xs: "0.9rem", md: "1rem" },
                                color: cita.cita_pagada ? "#00c853" : "#dc3545",
                              }}
                            >
                              {cita.cita_pagada ? "Sí" : "No"}
                            </Typography>
                          </Box>
                        ))}
                      </Box>
                    ) : (
                      <Typography
                        variant="body2"
                        component="div"
                        sx={{ textAlign: "center", color: "#666", fontSize: { xs: "0.9rem", md: "1rem" }, padding: "1rem" }}
                      >
                        No hay citas registradas.
                      </Typography>
                    )}
                  </Box>
                )}

                {activeTab === 1 && (
                  <Box
                    sx={{
                      backgroundColor: "#fff",
                      borderRadius: "16px",
                      padding: "20px",
                      boxShadow: "0 6px 20px rgba(0, 0, 0, 0.1)",
                      border: "1px solid rgba(0, 119, 182, 0.1)",
                      flexGrow: 1,
                      overflowX: "auto",
                    }}
                  >
                    <Typography
                      variant="h6"
                      component="div"
                      sx={{ fontWeight: 600, color: "#0077b6", mb: 2, fontSize: { xs: "1rem", md: "1.25rem" } }}
                    >
                      Lista de Pagos
                    </Typography>
                    {selectedTratamiento.pagos.length > 0 ? (
                      <Box sx={{ minWidth: "800px" }}>
                        {/* Encabezado de la tabla */}
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            padding: "12px",
                            backgroundColor: "#0077b6",
                            color: "#fff",
                            borderRadius: "8px 8px 0 0",
                            fontWeight: 600,
                          }}
                        >
                          <Typography sx={{ flex: 1, fontSize: { xs: "0.9rem", md: "1rem" } }}>
                            Monto
                          </Typography>
                          <Typography sx={{ flex: 1, fontSize: { xs: "0.9rem", md: "1rem" } }}>
                            Método
                          </Typography>
                          <Typography sx={{ flex: 1, fontSize: { xs: "0.9rem", md: "1rem" } }}>
                            Estado
                          </Typography>
                          <Typography sx={{ flex: 1, fontSize: { xs: "0.9rem", md: "1rem" } }}>
                            Fecha
                          </Typography>
                        </Box>
                        {/* Filas de datos */}
                        {selectedTratamiento.pagos.map((pago, index) => (
                          <Box
                            key={index}
                            sx={{
                              display: "flex",
                              justifyContent: "space-between",
                              padding: "12px",
                              backgroundColor: index % 2 === 0 ? "#f9f9f9" : "#fff",
                              borderBottom: index < selectedTratamiento.pagos.length - 1 ? "1px solid #eee" : "none",
                              borderRadius: index === selectedTratamiento.pagos.length - 1 ? "0 0 8px 8px" : "0",
                            }}
                          >
                            <Typography
                              sx={{ flex: 1, fontSize: { xs: "0.9rem", md: "1rem" }, color: "#333" }}
                            >
                              ${pago.monto_pago}
                            </Typography>
                            <Typography
                              sx={{ flex: 1, fontSize: { xs: "0.9rem", md: "1rem" }, color: "#333" }}
                            >
                              {pago.metodo_pago || "No especificado"}
                            </Typography>
                            <Typography
                              sx={{ flex: 1, fontSize: { xs: "0.9rem", md: "1rem" }, color: "#333" }}
                            >
                              {pago.estado_pago}
                            </Typography>
                            <Typography
                              sx={{ flex: 1, fontSize: { xs: "0.9rem", md: "1rem" }, color: "#333" }}
                            >
                              {pago.fecha_pago || "No registrada"}
                            </Typography>
                          </Box>
                        ))}
                      </Box>
                    ) : (
                      <Typography
                        variant="body2"
                        component="div"
                        sx={{ textAlign: "center", color: "#666", fontSize: { xs: "0.9rem", md: "1rem" }, padding: "1rem" }}
                      >
                        No hay pagos registrados.
                      </Typography>
                    )}
                  </Box>
                )}

                {activeTab === 2 && (
                  <Box
                    sx={{
                      backgroundColor: "#fff",
                      borderRadius: "16px",
                      padding: "20px",
                      boxShadow: "0 6px 20px rgba(0, 0, 0, 0.1)",
                      border: "1px solid rgba(0, 119, 182, 0.1)",
                      flexGrow: 1,
                    }}
                  >
                    <Typography
                      variant="h6"
                      component="div"
                      sx={{ fontWeight: 600, color: "#0077b6", mb: 2, fontSize: { xs: "1rem", md: "1.25rem" } }}
                    >
                      Lista de Comentarios
                    </Typography>
                    {selectedTratamiento.citas.length > 0 ? (
                      selectedTratamiento.citas.map((cita, index) => (
                        <Box
                          key={index}
                          sx={{
                            padding: "12px",
                            borderBottom: index < selectedTratamiento.citas.length - 1 ? "1px solid #eee" : "none",
                            backgroundColor: index % 2 === 0 ? "#f9f9f9" : "#fff",
                            borderRadius: index === 0 ? "8px 8px 0 0" : index === selectedTratamiento.citas.length - 1 ? "0 0 8px 8px" : "0",
                          }}
                        >
                          <Typography
                            variant="body2"
                            component="div"
                            sx={{ fontSize: { xs: "0.9rem", md: "1rem" }, color: "#333" }}
                          >
                            {cita.cita_comentario || "Sin comentarios"}
                          </Typography>
                        </Box>
                      ))
                    ) : (
                      <Typography
                        variant="body2"
                        component="div"
                        sx={{ textAlign: "center", color: "#666", fontSize: { xs: "0.9rem", md: "1rem" }, padding: "1rem" }}
                      >
                        No hay comentarios registrados.
                      </Typography>
                    )}
                  </Box>
                )}
              </DialogContent>
              <DialogActions
                sx={{
                  padding: "24px",
                  backgroundColor: "#f5faff",
                  justifyContent: "center",
                  boxShadow: "0 -4px 12px rgba(0, 0, 0, 0.1)",
                }}
              >
                <Button
                  onClick={handleCloseDialog}
                  variant="contained"
                  sx={{
                    backgroundColor: "#0077b6",
                    borderRadius: "12px",
                    textTransform: "none",
                    fontSize: { xs: "0.9rem", md: "1rem" },
                    fontWeight: 600,
                    padding: { xs: "10px 24px", md: "12px 28px" },
                    boxShadow: "0 6px 15px rgba(0, 119, 182, 0.2)",
                    "&:hover": {
                      backgroundColor: "#01579b",
                      boxShadow: "0 8px 20px rgba(0, 119, 182, 0.3)",
                    },
                  }}
                >
                  Cerrar
                </Button>
              </DialogActions>
            </StyledDialog>
          )}
        </motion.div>
      </Box>
    </ThemeProvider>
  );
};

export default HistorialTratamientoPaciente;