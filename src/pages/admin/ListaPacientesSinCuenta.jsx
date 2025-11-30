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
  Typography,
  Alert,
} from "@mui/material";
import HistoryIcon from "@mui/icons-material/History";
import SearchIcon from "@mui/icons-material/Search";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { motion } from "framer-motion";
import HistorialMedicoSinCuenta from "./HistorialMedicoSinCuenta";
import { useApi } from "../../hooks/useApi";

const ListaPacientesSinPlataforma = () => {
  const [pacientes, setPacientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [rowsPerPage] = useState(5);
  const [showSearch, setShowSearch] = useState(false);
  const [openHistorial, setOpenHistorial] = useState(false);
  const [pacienteSeleccionado, setPacienteSeleccionado] = useState(null);

  // CSRF + axios
  const { axiosInstance, csrfToken, loadingCsrf } = useApi();

  // edición
  const [openEditar, setOpenEditar] = useState(false);
  const [formEditar, setFormEditar] = useState({
    nombre: "",
    apellido_paterno: "",
    apellido_materno: "",
    telefono: "",
    fecha_nacimiento: "",
    sexo: "",
    email: "",
  });
  const [guardando, setGuardando] = useState(false);
  const [errorEditar, setErrorEditar] = useState(null);

  // eliminación
  const [openEliminar, setOpenEliminar] = useState(false);
  const [pacienteEliminar, setPacienteEliminar] = useState(null);
  const [eliminando, setEliminando] = useState(false);

  // alerta global
  const [alerta, setAlerta] = useState({
    mostrar: false,
    mensaje: "",
    tipo: "success",
  });

  // helper para formatear fecha al input date
  const toInputDate = (dateString) => {
    if (!dateString) return "";
    const soloFecha = dateString.split("T")[0];
    return soloFecha;
  };

  const formatFechaMx = (dateString) => {
    if (!dateString) return "";
    const soloFecha = dateString.split("T")[0];
    const [year, month, day] = soloFecha.split("-");
    const d = new Date(Number(year), Number(month) - 1, Number(day));
    return d.toLocaleDateString("es-MX");
  };

  // ocultar alerta automáticamente
  useEffect(() => {
    if (alerta.mostrar) {
      const t = setTimeout(
        () => setAlerta({ mostrar: false, mensaje: "", tipo: "" }),
        3000
      );
      return () => clearTimeout(t);
    }
  }, [alerta.mostrar]);

  useEffect(() => {
    const fetchPacientes = async () => {
      if (loadingCsrf) return;
      setLoading(true);
      try {
        const response = await axiosInstance.get("/pacientes-sin-plataforma", {
          withCredentials: true,
        });
        const data = response.data;
        const pacientesArray = Array.isArray(data) ? data : [];
        setPacientes(pacientesArray);
      } catch (error) {
        console.error("Error al obtener los pacientes sin plataforma:", error);
        setPacientes([]);
        setAlerta({
          mostrar: true,
          mensaje: "Error al obtener pacientes sin plataforma.",
          tipo: "error",
        });
      }
      setLoading(false);
    };

    fetchPacientes();
  }, [axiosInstance, loadingCsrf]);

  // Filtrado
  const filteredPacientes = pacientes.filter((paciente) => {
    const searchLower = search.toLowerCase();
    return (
      (paciente.nombre?.toLowerCase() || "").includes(searchLower) ||
      (paciente.apellido_paterno?.toLowerCase() || "").includes(searchLower) ||
      (paciente.apellido_materno?.toLowerCase() || "").includes(searchLower) ||
      (paciente.email?.toLowerCase() || "").includes(searchLower)
    );
  });

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

    console.log(
      "Abriendo historial para paciente sin plataforma ID:",
      paciente.id
    );
    setPacienteSeleccionado(paciente);
    setOpenHistorial(true);
  };

  const handleCloseHistorial = () => {
    setOpenHistorial(false);
    setPacienteSeleccionado(null);
  };

  // abrir diálogo de edición
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
      telefono: paciente.telefono || "",
      fecha_nacimiento: toInputDate(paciente.fecha_nacimiento),
      sexo: paciente.sexo || "",
      email: paciente.email || "",
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
        setErrorEditar(
          "No se pudo obtener el token de seguridad. Recarga la página."
        );
        setGuardando(false);
        return;
      }

      const resp = await axiosInstance.put(
        `/pacientes-sin-plataforma/${pacienteSeleccionado.id}/datos-personales`,
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
        console.error("Error al actualizar paciente sin plataforma:", dataError);
        setErrorEditar(
          dataError.mensaje || "No se pudieron guardar los cambios."
        );
        setGuardando(false);
        return;
      }

      // Actualizar la lista en memoria
      setPacientes((prev) =>
        prev.map((p) =>
          p.id === pacienteSeleccionado.id
            ? {
              ...p,
              nombre: formEditar.nombre,
              apellido_paterno: formEditar.apellido_paterno,
              apellido_materno: formEditar.apellido_materno,
              telefono: formEditar.telefono,
              fecha_nacimiento: formEditar.fecha_nacimiento,
              sexo: formEditar.sexo,
              email: formEditar.email,
            }
            : p
        )
      );

      setAlerta({
        mostrar: true,
        mensaje: "Datos del paciente actualizados correctamente.",
        tipo: "success",
      });

      setGuardando(false);
      handleCloseEditar();
    } catch (error) {
      console.error("Error al guardar cambios:", error);
      setErrorEditar("Ocurrió un error al guardar los cambios.");
      setAlerta({
        mostrar: true,
        mensaje: "Error al actualizar los datos del paciente.",
        tipo: "error",
      });
      setGuardando(false);
    }
  };

  // eliminar paciente
  const handleOpenEliminar = (paciente) => {
    setPacienteEliminar(paciente);
    setOpenEliminar(true);
  };

  const handleCloseEliminar = () => {
    if (eliminando) return;
    setOpenEliminar(false);
    setPacienteEliminar(null);
  };

  const handleConfirmarEliminar = async () => {
    if (!pacienteEliminar) return;

    if (!csrfToken) {
      setAlerta({
        mostrar: true,
        mensaje: "No se pudo obtener el token de seguridad. Recarga la página.",
        tipo: "error",
      });
      return;
    }

    setEliminando(true);
    try {
      const resp = await axiosInstance.delete(
        `/pacientes-sin-plataforma/${pacienteEliminar.id}`,
        {
          headers: {
            "X-XSRF-TOKEN": csrfToken,
          },
          withCredentials: true,
        }
      );

      if (resp.status === 200) {
        setPacientes((prev) =>
          prev.filter((p) => p.id !== pacienteEliminar.id)
        );
        setAlerta({
          mostrar: true,
          mensaje:
            resp.data?.mensaje ||
            "Paciente sin plataforma y sus datos fueron eliminados correctamente.",
          tipo: "success",
        });
        handleCloseEliminar();
      } else {
        setAlerta({
          mostrar: true,
          mensaje: "No se pudo eliminar el paciente.",
          tipo: "error",
        });
      }
    } catch (error) {
      console.error("Error al eliminar paciente sin plataforma:", error);
      setAlerta({
        mostrar: true,
        mensaje: "Error al eliminar el paciente.",
        tipo: "error",
      });
    } finally {
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
                      .map((paciente) => (
                        <TableRow
                          key={paciente.id}
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
                            {paciente.email || "No disponible"}
                          </TableCell>
                          <TableCell sx={cellStyle}>
                            {formatFechaMx(paciente.fecha_nacimiento)}
                          </TableCell>
                          <TableCell sx={cellStyle}>
                            {formatFechaMx(paciente.fecha_creacion)}
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
                                onClick={() =>
                                  handleOpenHistorial(paciente)
                                }
                              >
                                <HistoryIcon
                                  sx={{ color: "#006d77", fontSize: 28 }}
                                />
                              </IconButton>
                            </Tooltip>

                            <Tooltip
                              title="Editar datos personales"
                              arrow
                            >
                              <IconButton
                                onClick={() => handleOpenEditar(paciente)}
                              >
                                <EditIcon
                                  sx={{ color: "#ff9800", fontSize: 26 }}
                                />
                              </IconButton>
                            </Tooltip>

                            <Tooltip
                              title="Eliminar paciente y sus datos"
                              arrow
                            >
                              <IconButton
                                onClick={() => handleOpenEliminar(paciente)}
                              >
                                <DeleteIcon
                                  sx={{ color: "#d32f2f", fontSize: 26 }}
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

      {/* Historial médico */}
      <HistorialMedicoSinCuenta
        open={openHistorial}
        handleClose={handleCloseHistorial}
        paciente={pacienteSeleccionado}
      />

      {/* Diálogo de edición */}
      <Dialog
        open={openEditar}
        onClose={handleCloseEditar}
        fullWidth
        maxWidth="sm"
      >
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
              label="Teléfono"
              name="telefono"
              value={formEditar.telefono}
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
              <MenuItem value="M">Masculino</MenuItem>
              <MenuItem value="F">Femenino</MenuItem>
              <MenuItem value="otro">Otro</MenuItem>
            </TextField>
            <TextField
              label="Email (opcional)"
              name="email"
              value={formEditar.email}
              onChange={handleChangeEditar}
              fullWidth
            />

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

      {/* Diálogo de confirmación de eliminado */}
      <Dialog
        open={openEliminar}
        onClose={handleCloseEliminar}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle>Eliminar paciente sin plataforma</DialogTitle>
        <DialogContent>
          <Typography>
            ¿Estás seguro de que deseas eliminar a este paciente sin plataforma?
          </Typography>
          <Typography sx={{ mt: 1, fontWeight: 600, color: "#d32f2f" }}>
            Esta acción eliminará también todas sus citas, pagos, tratamientos y
            registros de historial médico relacionados. No se puede deshacer.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ pr: 3, pb: 2 }}>
          <Button onClick={handleCloseEliminar} disabled={eliminando}>
            Cancelar
          </Button>
          <Button
            onClick={handleConfirmarEliminar}
            variant="contained"
            sx={{ backgroundColor: "#d32f2f" }}
            disabled={eliminando}
          >
            {eliminando ? "Eliminando..." : "Eliminar"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Alerta flotante */}
      {alerta.mostrar && (
        <Box sx={{ position: "fixed", bottom: 20, left: 20, zIndex: 2000 }}>
          <Alert
            severity={alerta.tipo}
            variant="filled"
            sx={{
              width: "100%",
              backgroundColor:
                alerta.tipo === "success"
                  ? "#DFF6DD"
                  : alerta.tipo === "error"
                    ? "#F8D7DA"
                    : alerta.tipo === "warning"
                      ? "#FFF3CD"
                      : "#D1ECF1",
              color:
                alerta.tipo === "success"
                  ? "#1E4620"
                  : alerta.tipo === "error"
                    ? "#721C24"
                    : alerta.tipo === "warning"
                      ? "#856404"
                      : "#0C5460",
            }}
            onClose={() =>
              setAlerta({ mostrar: false, mensaje: "", tipo: "" })
            }
          >
            {alerta.mensaje}
          </Alert>
        </Box>
      )}
    </Box>
  );
};

export default ListaPacientesSinPlataforma;
