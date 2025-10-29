import React, { useState, useEffect } from "react";
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
  CircularProgress,
  Pagination,
  IconButton,
  Tooltip,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Chip,
  Snackbar,
  Alert,
} from "@mui/material";
import HistoryIcon from "@mui/icons-material/History";
import SearchIcon from "@mui/icons-material/Search";
import RedeemIcon from "@mui/icons-material/Redeem";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { motion } from "framer-motion";
import HistorialMedico from "./HistorialMedico";

const ListaPacientes = () => {
  const [pacientes, setPacientes] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [rowsPerPage] = useState(5);
  const [showSearch, setShowSearch] = useState(false);

  const [openHistorial, setOpenHistorial] = useState(false);
  const [pacienteSeleccionado, setPacienteSeleccionado] = useState(null);

  // 🔥 Cupones modal
  const [openCupones, setOpenCupones] = useState(false);
  const [cupones, setCupones] = useState([]);
  const [loadingCupones, setLoadingCupones] = useState(false);
  const [entregandoId, setEntregandoId] = useState(null); // evita doble clic

  // 🔥 Snackbar global
  const [alerta, setAlerta] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  // 🔥 CSRF token
  const [csrfToken, setCsrfToken] = useState(null);

  // 🔥 Obtener CSRF al inicio
  useEffect(() => {
    const obtenerCSRF = async () => {
      try {
        const resp = await fetch("http://localhost:4000/api/get-csrf-token", {
          credentials: "include",
        });
        const data = await resp.json();
        setCsrfToken(data.csrfToken);
      } catch (err) {
        console.error("Error obteniendo CSRF:", err);
        setAlerta({
          open: true,
          severity: "error",
          message: "No se pudo obtener el token de seguridad.",
        });
      }
    };
    obtenerCSRF();
  }, []);

  // Cargar pacientes
  useEffect(() => {
    const fetchPacientes = async () => {
      setLoading(true);
      try {
        const response = await fetch("http://localhost:4000/api/usuarios/pacientes", {
          credentials: "include",
        });
        const data = await response.json();
        setPacientes(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Error al obtener los pacientes:", error);
        setAlerta({
          open: true,
          severity: "error",
          message: "Error al cargar pacientes",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchPacientes();
  }, []);

  // Filtro de búsqueda
  const filteredPacientes = pacientes.filter(
    (paciente) =>
      paciente.nombre?.toLowerCase().includes(search.toLowerCase()) ||
      paciente.apellido_paterno?.toLowerCase().includes(search.toLowerCase()) ||
      paciente.apellido_materno?.toLowerCase().includes(search.toLowerCase()) ||
      paciente.email?.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(filteredPacientes.length / rowsPerPage);

  useEffect(() => {
    if (page > totalPages && totalPages > 0) {
      setPage(totalPages);
    }
  }, [filteredPacientes, page, totalPages]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  // Historial médico
  const handleOpenHistorial = (paciente) => {
    if (!paciente?.id) {
      console.error("Error: paciente o id inválido", paciente);
      return;
    }
    setPacienteSeleccionado(paciente);
    setOpenHistorial(true);
  };

  const handleCloseHistorial = () => {
    setOpenHistorial(false);
    setPacienteSeleccionado(null);
  };

  // 🔥 Abrir modal de cupones
  const handleOpenCupones = async (paciente) => {
    if (!paciente?.id || !csrfToken) {
      setAlerta({
        open: true,
        severity: "error",
        message: !csrfToken ? "Token de seguridad no disponible" : "Paciente inválido",
      });
      return;
    }

    setPacienteSeleccionado(paciente);
    setOpenCupones(true);
    setLoadingCupones(true);

    try {
      const resp = await fetch(
        `http://localhost:4000/api/recompensas/mis-solicitudes/${paciente.id}`,
        {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            "X-XSRF-TOKEN": csrfToken,
          },
        }
      );

      if (!resp.ok) {
        const errData = await resp.json().catch(() => ({}));
        throw new Error(errData.mensaje || "No se pudieron cargar los cupones");
      }

      const data = await resp.json();
      setCupones(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error al obtener cupones:", err);
      setCupones([]);
      setAlerta({
        open: true,
        severity: "error",
        message: err.message || "Error al cargar cupones",
      });
    } finally {
      setLoadingCupones(false);
    }
  };

  const handleCloseCupones = () => {
    setOpenCupones(false);
    setCupones([]);
    setPacienteSeleccionado(null);
    setEntregandoId(null);
  };

  // 🔥 Marcar como ENTREGADO
  const marcarEntregado = async (canjeId) => {
    if (entregandoId || !csrfToken) return;

    setEntregandoId(canjeId);

    try {
      const resp = await fetch(
        `http://localhost:4000/api/recompensas/entregar/${canjeId}`,
        {
          method: "PUT",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            "X-XSRF-TOKEN": csrfToken,
          },
          body: JSON.stringify({
            observaciones: "Cupón entregado físicamente en recepción",
          }),
        }
      );

      if (!resp.ok) {
        const errData = await resp.json().catch(() => ({}));
        throw new Error(errData.mensaje || "Error al marcar como ENTREGADO");
      }

      // Refrescar solo si fue exitoso
      const refreshed = await fetch(
        `http://localhost:4000/api/recompensas/mis-solicitudes/${pacienteSeleccionado.id}`,
        {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            "X-XSRF-TOKEN": csrfToken,
          },
        }
      );

      if (!refreshed.ok) throw new Error("No se pudo actualizar la lista");

      const nuevos = await refreshed.json();
      setCupones(Array.isArray(nuevos) ? nuevos : []);

      setAlerta({
        open: true,
        severity: "success",
        message: "Cupón marcado como ENTREGADO",
      });
    } catch (err) {
      console.error("Error entregando cupón:", err);
      setAlerta({
        open: true,
        severity: "error",
        message: err.message || "No se pudo entregar el cupón",
      });
    } finally {
      setEntregandoId(null);
    }
  };

  const cellStyle = {
    textAlign: "center",
    color: "#03445e",
    fontFamily: "'Poppins', sans-serif",
    fontSize: "1rem",
    py: "20px",
    px: "16px",
  };

  // Chip de estado
  const EstadoChip = ({ estado }) => {
    const up = (estado || "").toUpperCase();
    let color = "default";
    if (up === "PENDIENTE") color = "warning";
    if (up === "APROBADO") color = "info";
    if (up === "ENTREGADO") color = "success";
    if (up === "RECHAZADO") color = "error";

    return (
      <Chip
        label={up}
        color={color}
        size="small"
        sx={{ fontWeight: 600, fontSize: "0.7rem", minWidth: 90 }}
      />
    );
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
      {/* Buscador */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "flex-start",
          alignItems: "center",
          mb: 4,
          width: "100%",
          maxWidth: "1400px",
          backgroundColor: "#ffffff",
          borderRadius: "12px",
          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)",
          p: 2,
        }}
      >
        <IconButton onClick={() => setShowSearch(!showSearch)}>
          <SearchIcon sx={{ color: "#006d77", fontSize: 30 }} />
        </IconButton>
        {showSearch && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: "300px", opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.4 }}
          >
            <TextField
              label="Buscar paciente"
              variant="outlined"
              fullWidth
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              sx={{
                ml: 2,
                "& .MuiOutlinedInput-root": {
                  borderRadius: "12px",
                  backgroundColor: "#fff",
                  "&:hover fieldset": { borderColor: "#78c1c8" },
                  "&.Mui-focused fieldset": { borderColor: "#006d77" },
                },
                "& .MuiInputLabel-root": {
                  fontFamily: "'Poppins', sans-serif",
                  color: "#03445e",
                  "&.Mui-focused": { color: "#006d77" },
                },
              }}
            />
          </motion.div>
        )}
      </Box>

      {/* Tabla de pacientes */}
      <Box sx={{ flexGrow: 1, maxWidth: "1400px", mx: "auto", width: "100%" }}>
        {loading ? (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: "70vh",
              backgroundColor: "#ffffff",
              borderRadius: "16px",
              boxShadow: "0 6px 24px rgba(0, 0, 0, 0.08)",
              border: "1px solid #78c1c8",
            }}
          >
            <CircularProgress
              size={80}
              thickness={4}
              sx={{ color: "#006d77" }}
            />
          </Box>
        ) : (
          <>
            <TableContainer
              component={Paper}
              sx={{
                borderRadius: "16px",
                boxShadow: "0 6px 24px rgba(0, 0, 0, 0.08)",
                overflow: "hidden",
                background: "#ffffff",
                border: "1px solid #78c1c8",
              }}
            >
              <Table>
                <TableHead
                  sx={{
                    background: "linear-gradient(90deg, #006d77 0%, #78c1c8 100%)",
                  }}
                >
                  <TableRow>
                    <TableCell sx={{ ...cellStyle, color: "#e0f7fa", fontWeight: 700 }}>
                      Nombre Completo
                    </TableCell>
                    <TableCell sx={{ ...cellStyle, color: "#e0f7fa", fontWeight: 700 }}>
                      Teléfono
                    </TableCell>
                    <TableCell sx={{ ...cellStyle, color: "#e0f7fa", fontWeight: 700 }}>
                      Sexo
                    </TableCell>
                    <TableCell sx={{ ...cellStyle, color: "#e0f7fa", fontWeight: 700 }}>
                      Email
                    </TableCell>
                    <TableCell sx={{ ...cellStyle, color: "#e0f7fa", fontWeight: 700 }}>
                      Fecha de Nacimiento
                    </TableCell>
                    <TableCell sx={{ ...cellStyle, color: "#e0f7fa", fontWeight: 700 }}>
                      Fecha de Creación
                    </TableCell>
                    <TableCell sx={{ ...cellStyle, color: "#e0f7fa", fontWeight: 700 }}>
                      Acciones
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredPacientes.length > 0 ? (
                    filteredPacientes
                      .slice((page - 1) * rowsPerPage, page * rowsPerPage)
                      .map((paciente) => (
                        <TableRow
                          key={paciente.id}
                          sx={{
                            "&:hover": {
                              backgroundColor: "#e0f7fa",
                              transition: "background-color 0.2s",
                            },
                            borderBottom: "1px solid #eef3f7",
                          }}
                        >
                          <TableCell sx={cellStyle}>
                            {paciente.nombre} {paciente.apellido_paterno} {paciente.apellido_materno}
                          </TableCell>
                          <TableCell sx={cellStyle}>{paciente.telefono || "—"}</TableCell>
                          <TableCell sx={cellStyle}>
                            {paciente.sexo?.[0]?.toUpperCase() || "?"}
                          </TableCell>
                          <TableCell sx={cellStyle}>{paciente.email}</TableCell>
                          <TableCell sx={cellStyle}>
                            {new Date(paciente.fecha_nacimiento).toLocaleDateString("es-MX")}
                          </TableCell>
                          <TableCell sx={cellStyle}>
                            {new Date(paciente.fecha_creacion).toLocaleDateString("es-MX")}
                          </TableCell>

                          <TableCell
                            sx={{
                              ...cellStyle,
                              display: "flex",
                              justifyContent: "center",
                              gap: "8px",
                            }}
                          >
                            <Tooltip title="Historial Médico" arrow>
                              <IconButton onClick={() => handleOpenHistorial(paciente)}>
                                <HistoryIcon sx={{ color: "#006d77", fontSize: 28 }} />
                              </IconButton>
                            </Tooltip>

                            <Tooltip title="Cupones / Recompensas" arrow>
                              <IconButton onClick={() => handleOpenCupones(paciente)}>
                                <RedeemIcon sx={{ color: "#8e24aa", fontSize: 28 }} />
                              </IconButton>
                            </Tooltip>
                          </TableCell>
                        </TableRow>
                      ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} sx={{ ...cellStyle, color: "#999" }}>
                        No se encontraron pacientes.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            <Box sx={{ display: "flex", justifyContent: "center", mt: 3, mb: 4 }}>
              <Pagination
                count={totalPages}
                page={page}
                onChange={handleChangePage}
                color="primary"
                size="large"
                sx={{
                  "& .MuiPaginationItem-root": {
                    fontSize: "1.1rem",
                    padding: "10px 18px",
                    margin: "0 6px",
                    borderRadius: "10px",
                    backgroundColor: "#ffffff",
                    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)",
                    color: "#006d77",
                    fontFamily: "'Poppins', sans-serif",
                    "&:hover": {
                      backgroundColor: "#78c1c8",
                      color: "#fff",
                    },
                  },
                  "& .Mui-selected": {
                    backgroundColor: "#006d77 !important",
                    color: "#e0f7fa",
                  },
                }}
              />
            </Box>
          </>
        )}
      </Box>

      {/* Historial Médico */}
      <HistorialMedico
        open={openHistorial}
        handleClose={handleCloseHistorial}
        paciente={pacienteSeleccionado}
      />

      {/* Modal de Cupones */}
      <Dialog
        open={openCupones}
        onClose={handleCloseCupones}
        fullWidth
        maxWidth="md"
        PaperProps={{
          sx: {
            borderRadius: "16px",
            backgroundColor: "#ffffff",
            border: "1px solid #e0f7fa",
            boxShadow: "0 8px 24px rgba(0,0,0,0.1)",
          },
        }}
      >
        <DialogTitle
          sx={{
            bgcolor: "#e0f7fa",
            color: "#006d77",
            fontWeight: 600,
            fontSize: "1.1rem",
          }}
        >
          {pacienteSeleccionado
            ? `Cupones de ${pacienteSeleccionado.nombre} ${pacienteSeleccionado.apellido_paterno}`
            : "Cupones"}
        </DialogTitle>

        <DialogContent dividers sx={{ maxHeight: 400 }}>
          {loadingCupones ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
              <CircularProgress sx={{ color: "#006d77" }} />
            </Box>
          ) : cupones.length === 0 ? (
            <Typography sx={{ textAlign: "center", color: "#666", py: 4 }}>
              No hay solicitudes de canje.
            </Typography>
          ) : (
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600, color: "#03445e" }}>Recompensa</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: "#03445e" }}>Pts</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: "#03445e" }}>Estado</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: "#03445e" }}>Solicitado</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: "#03445e" }}>Acción</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {cupones.map((c) => {
                  const estadoUpper = String(c.estado || "").toUpperCase();

                  return (
                    <TableRow
                      key={c.id}
                      sx={{
                        "&:hover": { backgroundColor: "#f5f9fa" },
                      }}
                    >
                      <TableCell sx={{ color: "#03445e" }}>
                        {c.recompensa_nombre || "—"}
                      </TableCell>
                      <TableCell sx={{ color: "#03445e" }}>
                        {c.puntos_cobrados} pts
                      </TableCell>
                      <TableCell>
                        <EstadoChip estado={estadoUpper} />
                      </TableCell>
                      <TableCell sx={{ color: "#03445e" }}>
                        {c.solicitado_en
                          ? new Date(c.solicitado_en).toLocaleString("es-MX")
                          : "—"}
                      </TableCell>
                      <TableCell>
                        {estadoUpper === "APROBADO" ? (
                          <Tooltip title="Marcar como ENTREGADO">
                            <span>
                              <IconButton
                                onClick={() => marcarEntregado(c.id)}
                                disabled={entregandoId === c.id}
                                sx={{
                                  color: "#2e7d32",
                                  "&:hover": {
                                    color: "#1b5e20",
                                    backgroundColor: "rgba(46,125,50,0.08)",
                                  },
                                }}
                              >
                                {entregandoId === c.id ? (
                                  <CircularProgress size={20} color="success" />
                                ) : (
                                  <CheckCircleIcon />
                                )}
                              </IconButton>
                            </span>
                          </Tooltip>
                        ) : (
                          <EstadoChip estado={estadoUpper} />
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </DialogContent>

        <DialogActions>
          <Button
            onClick={handleCloseCupones}
            sx={{
              color: "#006d77",
              fontWeight: 600,
              textTransform: "none",
            }}
          >
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={alerta.open}
        autoHideDuration={4000}
        onClose={() => setAlerta({ ...alerta, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setAlerta({ ...alerta, open: false })}
          severity={alerta.severity}
          variant="filled"
          sx={{
            borderRadius: "10px",
            fontFamily: "'Poppins', sans-serif",
          }}
        >
          {alerta.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ListaPacientes;