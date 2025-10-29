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
} from "@mui/material";
import HistoryIcon from "@mui/icons-material/History";
import SearchIcon from "@mui/icons-material/Search";
import { motion } from "framer-motion";
import HistorialMedicoSinCuenta from "./HistorialMedicoSinCuenta";

const ListaPacientesSinPlataforma = () => {
  const [pacientes, setPacientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [rowsPerPage] = useState(5);
  const [showSearch, setShowSearch] = useState(false);
  const [openHistorial, setOpenHistorial] = useState(false);
  const [pacienteSeleccionado, setPacienteSeleccionado] = useState(null);

  useEffect(() => {
    const fetchPacientes = async () => {
      setLoading(true);
      try {
        const response = await fetch("https://backenddent.onrender.com/api/pacientes-sin-plataforma");
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        const pacientesArray = Array.isArray(data) ? data : [];
        setPacientes(pacientesArray);
      } catch (error) {
        console.error("Error al obtener los pacientes:", error);
        setPacientes([]);
      }
      setLoading(false);
    };

    fetchPacientes();
  }, []);

  // Filtrado con manejo de valores null
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

    console.log("🟢 Abriendo historial para paciente ID:", paciente.id);
    setPacienteSeleccionado(paciente);
    setOpenHistorial(true);
  };

  const handleCloseHistorial = () => {
    setOpenHistorial(false);
    setPacienteSeleccionado(null);
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
                              boxShadow: "inset 0 2px 10px rgba(0, 0, 0, 0.05)",
                            },
                            borderBottom: "1px solid #eef3f7",
                          }}
                        >
                          <TableCell sx={cellStyle}>
                            {paciente.nombre} {paciente.apellido_paterno} {paciente.apellido_materno}
                          </TableCell>
                          <TableCell sx={cellStyle}>{paciente.telefono}</TableCell>
                          <TableCell sx={cellStyle}>{paciente.sexo.charAt(0).toUpperCase()}</TableCell>
                          <TableCell sx={cellStyle}>{paciente.email || "No disponible"}</TableCell>
                          <TableCell sx={cellStyle}>
                            {new Date(paciente.fecha_nacimiento).toLocaleDateString("es-MX")}
                          </TableCell>
                          <TableCell sx={cellStyle}>
                            {new Date(paciente.fecha_creacion).toLocaleDateString("es-MX")}
                          </TableCell>
                          <TableCell sx={{ ...cellStyle, display: "flex", justifyContent: "center" }}>
                            <Tooltip title="Historial Médico" arrow>
                              <IconButton onClick={() => handleOpenHistorial(paciente)}>
                                <HistoryIcon sx={{ color: "#006d77", fontSize: 28 }} />
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
            <Box sx={{ display: "flex", justifyContent: "center", mt: "2rem", mb: "4rem" }}>
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

      <HistorialMedicoSinCuenta
        open={openHistorial}
        handleClose={handleCloseHistorial}
        paciente={pacienteSeleccionado}
      />
    </Box>
  );
};

export default ListaPacientesSinPlataforma;
