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
  MenuItem,
  Snackbar,
  Alert,
} from "@mui/material";
import HistoryIcon from "@mui/icons-material/History";
import SearchIcon from "@mui/icons-material/Search";
import EditIcon from "@mui/icons-material/Edit";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import { motion } from "framer-motion";
import HistorialMedico from "./HistorialMedico";
import { useApi } from "../../hooks/useApi";

const ListaPacientes = () => {
  const [pacientes, setPacientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [rowsPerPage] = useState(5);
  const [showSearch, setShowSearch] = useState(false);

  const [openHistorial, setOpenHistorial] = useState(false);
  const [pacienteSeleccionado, setPacienteSeleccionado] = useState(null);

  const { axiosInstance, csrfToken, loadingCsrf } = useApi();

  // edición
  const [openEditar, setOpenEditar] = useState(false);
  const [formEditar, setFormEditar] = useState({
    nombre: "",
    apellido_paterno: "",
    apellido_materno: "",
    fecha_nacimiento: "",
    sexo: "",
  });
  const [guardando, setGuardando] = useState(false);
  const [errorEditar, setErrorEditar] = useState(null);

  // eliminación
  const [openEliminar, setOpenEliminar] = useState(false);
  const [pacienteAEliminar, setPacienteAEliminar] = useState(null);
  const [eliminando, setEliminando] = useState(false);

  // snackbar global
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const mostrarSnackbar = (message, severity = "success") => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  useEffect(() => {
    const fetchPacientes = async () => {
      if (loadingCsrf) return;
      setLoading(true);
      try {
        const response = await axiosInstance.get("/usuarios/pacientes", {
          withCredentials: true,
        });
        const data = response.data;
        setPacientes(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Error al obtener los pacientes:", error);
        mostrarSnackbar("Error al obtener los pacientes.", "error");
      }
      setLoading(false);
    };

    fetchPacientes();
  }, [axiosInstance, loadingCsrf]);

  const filteredPacientes = pacientes.filter((paciente) =>
    [
      paciente.nombre,
      paciente.apellido_paterno,
      paciente.apellido_materno,
      paciente.email,
    ]
      .join(" ")
      .toLowerCase()
      .includes(search.toLowerCase())
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

  const handleOpenHistorial = (paciente) => {
    if (!paciente || !paciente.id) {
      console.error("Error: paciente o paciente.id es undefined", paciente);
      return;
    }

    setPacienteSeleccionado(paciente);
    setOpenHistorial(true);
  };

  const handleCloseHistorial = () => {
    setOpenHistorial(false);
    setPacienteSeleccionado(null);
  };

  const toInputDate = (dateString) => {
    if (!dateString) return "";
    const soloFecha = dateString.split("T")[0];
    const [year, month, day] = soloFecha.split("-");
    return `${year}-${month}-${day}`;
  };

  const handleOpenEditar = (paciente) => {
    if (!paciente || !paciente.id) {
      console.error("Error: paciente o paciente.id es undefined", paciente);
      return;
    }

    setPacienteSeleccionado(paciente);
    setFormEditar({
      nombre: paciente.nombre || "",
      apellido_paterno: paciente.apellido_paterno || "",
      apellido_materno: paciente.apellido_materno || "",
      fecha_nacimiento: toInputDate(paciente.fecha_nacimiento),
      sexo: paciente.sexo || "",
    });
    setErrorEditar(null);
    setOpenEditar(true);
  };

  const handleCloseEditar = () => {
    if (guardando) return;
    setOpenEditar(false);
    setPacienteSeleccionado(null);
    setErrorEditar(null);
  };

  const handleChangeEditar = (e) => {
    const { name, value } = e.target;
    setFormEditar((prev) => ({ ...prev, [name]: value }));
  };

  const handleGuardarCambios = async () => {
    if (!pacienteSeleccionado) return;

    setGuardando(true);
    setErrorEditar(null);

    try {
      if (!csrfToken) {
        setErrorEditar("No se pudo obtener el token de seguridad. Recarga la página.");
        setGuardando(false);
        return;
      }

      const resp = await axiosInstance.put(
        `/usuarios/${pacienteSeleccionado.id}/datos-personales`,
        formEditar,
        {
          headers: {
            "Content-Type": "application/json",
            "X-XSRF-TOKEN": csrfToken,
          },
          withCredentials: true,
        }
      );

      if (resp.status !== 200) {
        const dataError = resp.data || {};
        console.error("Error al actualizar datos personales:", dataError);
        setErrorEditar(
          dataError.mensaje || "No se pudieron guardar los cambios."
        );
        setGuardando(false);
        return;
      }

      setPacientes((prev) =>
        prev.map((p) =>
          p.id === pacienteSeleccionado.id
            ? {
              ...p,
              nombre: formEditar.nombre,
              apellido_paterno: formEditar.apellido_paterno,
              apellido_materno: formEditar.apellido_materno,
              fecha_nacimiento: formEditar.fecha_nacimiento,
              sexo: formEditar.sexo,
            }
            : p
        )
      );

      setGuardando(false);
      handleCloseEditar();
      mostrarSnackbar("Datos personales actualizados correctamente.", "success");
    } catch (error) {
      console.error("Error al guardar cambios:", error);
      setErrorEditar("Ocurrió un error al guardar los cambios.");
      setGuardando(false);
    }
  };

  const handleOpenEliminar = (paciente) => {
    if (!paciente || !paciente.id) {
      console.error("Error: paciente o paciente.id es undefined", paciente);
      return;
    }
    setPacienteAEliminar(paciente);
    setOpenEliminar(true);
  };

  const handleCloseEliminar = () => {
    if (eliminando) return;
    setOpenEliminar(false);
    setPacienteAEliminar(null);
  };

  const handleConfirmarEliminar = async () => {
    if (!pacienteAEliminar) return;
    if (!csrfToken) {
      mostrarSnackbar("No se pudo obtener el token de seguridad.", "error");
      return;
    }

    setEliminando(true);
    try {
      const resp = await axiosInstance.delete(`/usuarios/${pacienteAEliminar.id}`, {
        headers: {
          "X-XSRF-TOKEN": csrfToken,
        },
        withCredentials: true,
      });

      if (resp.status !== 200) {
        const dataError = resp.data || {};
        console.error("Error al eliminar paciente:", dataError);
        mostrarSnackbar(
          dataError.mensaje || "No se pudo eliminar el paciente.",
          "error"
        );
        setEliminando(false);
        return;
      }

      setPacientes((prev) =>
        prev.filter((p) => p.id !== pacienteAEliminar.id)
      );

      setEliminando(false);
      handleCloseEliminar();
      mostrarSnackbar(
        "Paciente eliminado correctamente junto con sus citas, pagos y tratamientos.",
        "success"
      );
    } catch (error) {
      console.error("Error al eliminar paciente:", error);
      mostrarSnackbar("Ocurrió un error al eliminar el paciente.", "error");
      setEliminando(false);
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

      {/* Tabla */}
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
              sx={{
                color: "#006d77",
                "& .MuiCircularProgress-circle": { strokeLinecap: "round" },
              }}
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
                    background:
                      "linear-gradient(90deg, #006d77 0%, #78c1c8 100%)",
                  }}
                >
                  <TableRow>
                    <TableCell
                      sx={{ ...cellStyle, color: "#e0f7fa", fontWeight: 700 }}
                    >
                      Nombre Completo
                    </TableCell>
                    <TableCell
                      sx={{ ...cellStyle, color: "#e0f7fa", fontWeight: 700 }}
                    >
                      Teléfono
                    </TableCell>
                    <TableCell
                      sx={{ ...cellStyle, color: "#e0f7fa", fontWeight: 700 }}
                    >
                      Sexo
                    </TableCell>
                    <TableCell
                      sx={{ ...cellStyle, color: "#e0f7fa", fontWeight: 700 }}
                    >
                      Email
                    </TableCell>
                    <TableCell
                      sx={{ ...cellStyle, color: "#e0f7fa", fontWeight: 700 }}
                    >
                      Fecha de Nacimiento
                    </TableCell>
                    <TableCell
                      sx={{ ...cellStyle, color: "#e0f7fa", fontWeight: 700 }}
                    >
                      Fecha de Creación
                    </TableCell>
                    <TableCell
                      sx={{ ...cellStyle, color: "#e0f7fa", fontWeight: 700 }}
                    >
                      Acciones
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredPacientes.length > 0 ? (
                    filteredPacientes
                      .slice((page - 1) * rowsPerPage, page * rowsPerPage)
                      .map((paciente, index) => (
                        <TableRow
                          key={index}
                          sx={{
                            "&:hover": {
                              backgroundColor: "#e0f7fa",
                              transition: "background-color 0.2s",
                              boxShadow:
                                "inset 0 2px 10px rgba(0, 0, 0, 0.05)",
                            },
                            borderBottom: "1px solid #eef3f7",
                          }}
                        >
                          <TableCell sx={cellStyle}>
                            {paciente.nombre} {paciente.apellido_paterno}{" "}
                            {paciente.apellido_materno}
                          </TableCell>
                          <TableCell sx={cellStyle}>
                            {paciente.telefono}
                          </TableCell>
                          <TableCell sx={cellStyle}>
                            {paciente.sexo
                              ? paciente.sexo.charAt(0).toUpperCase() +
                              paciente.sexo.slice(1)
                              : ""}
                          </TableCell>
                          <TableCell sx={cellStyle}>
                            {paciente.email}
                          </TableCell>
                          <TableCell sx={cellStyle}>
                            {paciente.fecha_nacimiento
                              ? new Date(
                                paciente.fecha_nacimiento
                              ).toLocaleDateString("es-MX")
                              : ""}
                          </TableCell>
                          <TableCell sx={cellStyle}>
                            {paciente.fecha_creacion
                              ? new Date(
                                paciente.fecha_creacion
                              ).toLocaleDateString("es-MX")
                              : ""}
                          </TableCell>
                          <TableCell
                            sx={{
                              ...cellStyle,
                              display: "flex",
                              justifyContent: "center",
                              gap: 1,
                            }}
                          >
                            <Tooltip title="Historial Médico" arrow>
                              <IconButton
                                onClick={() => handleOpenHistorial(paciente)}
                              >
                                <HistoryIcon
                                  sx={{ color: "#006d77", fontSize: 28 }}
                                />
                              </IconButton>
                            </Tooltip>

                            <Tooltip title="Editar datos personales" arrow>
                              <IconButton
                                onClick={() => handleOpenEditar(paciente)}
                              >
                                <EditIcon
                                  sx={{ color: "#ff9800", fontSize: 26 }}
                                />
                              </IconButton>
                            </Tooltip>

                            <Tooltip
                              title="Eliminar paciente y todas sus relaciones"
                              arrow
                            >
                              <IconButton
                                onClick={() => handleOpenEliminar(paciente)}
                              >
                                <DeleteForeverIcon
                                  sx={{ color: "#e53935", fontSize: 28 }}
                                />
                              </IconButton>
                            </Tooltip>
                          </TableCell>
                        </TableRow>
                      ))
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={7}
                        sx={{ ...cellStyle, color: "#999" }}
                      >
                        No se encontraron pacientes.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                mt: "2rem",
                mb: "4rem",
              }}
            >
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
                      color: "#ffffff",
                      transition: "all 0.3s ease",
                    },
                  },
                  "& .Mui-selected": {
                    backgroundColor: "#006d77",
                    color: "#e0f7fa",
                    "&:hover": {
                      backgroundColor: "#004d57",
                      transition: "all 0.3s ease",
                    },
                  },
                }}
              />
            </Box>
          </>
        )}
      </Box>

      {/* Dialog historial */}
      <HistorialMedico
        open={openHistorial}
        handleClose={handleCloseHistorial}
        paciente={pacienteSeleccionado}
      />

      {/* Dialog edición */}
      <Dialog open={openEditar} onClose={handleCloseEditar} fullWidth maxWidth="sm">
        <DialogTitle>Editar datos personales</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
            <TextField
              label="Nombre"
              name="nombre"
              value={formEditar.nombre}
              onChange={handleChangeEditar}
              fullWidth
            />
            <TextField
              label="Apellido paterno"
              name="apellido_paterno"
              value={formEditar.apellido_paterno}
              onChange={handleChangeEditar}
              fullWidth
            />
            <TextField
              label="Apellido materno"
              name="apellido_materno"
              value={formEditar.apellido_materno}
              onChange={handleChangeEditar}
              fullWidth
            />
            <TextField
              label="Fecha de nacimiento"
              name="fecha_nacimiento"
              type="date"
              value={formEditar.fecha_nacimiento}
              onChange={handleChangeEditar}
              InputLabelProps={{ shrink: true }}
              fullWidth
            />
            <TextField
              select
              label="Sexo"
              name="sexo"
              value={formEditar.sexo}
              onChange={handleChangeEditar}
              fullWidth
            >
              <MenuItem value="masculino">Masculino</MenuItem>
              <MenuItem value="femenino">Femenino</MenuItem>
              <MenuItem value="otro">Otro</MenuItem>
            </TextField>

            {errorEditar && (
              <Typography color="error" variant="body2">
                {errorEditar}
              </Typography>
            )}
          </Box>
        </DialogContent>
        <DialogActions sx={{ pr: 3, pb: 2 }}>
          <Button onClick={handleCloseEditar} disabled={guardando}>
            Cancelar
          </Button>
          <Button
            onClick={handleGuardarCambios}
            variant="contained"
            sx={{ backgroundColor: "#006d77" }}
            disabled={guardando}
          >
            {guardando ? "Guardando..." : "Guardar cambios"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog eliminar */}
      <Dialog
        open={openEliminar}
        onClose={handleCloseEliminar}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Eliminar paciente</DialogTitle>
        <DialogContent>
          <Typography>
            Esta acción eliminará al paciente seleccionado y todas sus relaciones:
            tratamientos, citas, pagos, historial médico, tokens y contraseñas.
          </Typography>
          <Typography mt={2} fontWeight="bold" color="error">
            ¿Está seguro de que desea continuar?
          </Typography>
        </DialogContent>
        <DialogActions sx={{ pr: 3, pb: 2 }}>
          <Button onClick={handleCloseEliminar} disabled={eliminando}>
            Cancelar
          </Button>
          <Button
            onClick={handleConfirmarEliminar}
            variant="contained"
            color="error"
            disabled={eliminando}
          >
            {eliminando ? "Eliminando..." : "Eliminar definitivamente"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={5000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ListaPacientes;
