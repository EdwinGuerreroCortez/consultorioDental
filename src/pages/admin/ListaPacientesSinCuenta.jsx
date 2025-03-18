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
} from "@mui/material";
import HistoryIcon from "@mui/icons-material/History";
import ToggleOnIcon from "@mui/icons-material/ToggleOn";
import ToggleOffIcon from "@mui/icons-material/ToggleOff";
import SearchIcon from "@mui/icons-material/Search";
import { motion } from "framer-motion";
import HistorialMedicoSinCuenta from "./HistorialMedicoSinCuenta";

const ListaPacientes = () => {
  const [pacientes, setPacientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1); // Cambiado a 1 para coincidir con Pagination
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [estadoCuentas, setEstadoCuentas] = useState({});
  const [showSearch, setShowSearch] = useState(false);
  const [openHistorial, setOpenHistorial] = useState(false);
  const [pacienteSeleccionado, setPacienteSeleccionado] = useState(null);

  useEffect(() => {
    const fetchPacientes = async () => {
      setLoading(true);
      try {
        const response = await fetch("http://localhost:4000/api/pacientes-sin-plataforma");
        const data = await response.json();
        setPacientes(data);

        const estadoInicial = {};
        data.forEach((paciente) => {
          estadoInicial[paciente.id] = true;
        });
        setEstadoCuentas(estadoInicial);
      } catch (error) {
        console.error("Error al obtener los pacientes:", error);
      }
      setLoading(false);
    };

    fetchPacientes();
  }, []);

  const toggleEstadoCuenta = (id) => {
    setEstadoCuentas((prevEstado) => ({
      ...prevEstado,
      [id]: !prevEstado[id],
    }));
  };

  const filteredPacientes = pacientes.filter(
    (paciente) =>
      paciente.nombre.toLowerCase().includes(search.toLowerCase()) ||
      paciente.apellido_paterno.toLowerCase().includes(search.toLowerCase()) ||
      paciente.apellido_materno.toLowerCase().includes(search.toLowerCase()) ||
      paciente.email.toLowerCase().includes(search.toLowerCase())
  );

  const handleChangePage = (event, newPage) => setPage(newPage);

  const handleOpenHistorial = (paciente) => {
    if (!paciente || !paciente.id) {
      console.error("❌ Error: paciente o paciente.id es undefined", paciente);
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
    color: "#03445e", // Consistente con TratamientosEnCurso
    fontFamily: "'Poppins', sans-serif",
    fontSize: "1rem",
    py: "20px", // Consistente con TratamientosEnCurso
    px: "16px", // Consistente con TratamientosEnCurso
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
        backgroundColor: "#f9fbfd", // Consistente con TratamientosEnCurso
      }}
    >
      {/* Contenedor del buscador en la esquina superior derecha */}
      <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 3 }}>
        <IconButton onClick={() => setShowSearch(!showSearch)}>
          <SearchIcon sx={{ color: "#006d77", fontSize: 30 }} /> {/* Consistente con TratamientosEnCurso */}
        </IconButton>
        {showSearch && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: "300px", opacity: 1 }} // Aumentado para mejor proporción
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
                  "&:hover fieldset": { borderColor: "#78c1c8" }, // Consistente con TratamientosEnCurso
                  "&.Mui-focused fieldset": { borderColor: "#006d77" }, // Consistente con TratamientosEnCurso
                },
                "& .MuiInputLabel-root": {
                  fontFamily: "'Poppins', sans-serif",
                  color: "#03445e",
                  "&.Mui-focused": { color: "#006d77" }, // Consistente con TratamientosEnCurso
                },
              }}
            />
          </motion.div>
        )}
      </Box>

      {/* Contenido de la tabla */}
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
              boxShadow: "0 6px 24px rgba(0, 0, 0, 0.08)", // Consistente con TratamientosEnCurso
              border: "1px solid #78c1c8", // Consistente con TratamientosEnCurso
            }}
          >
            <CircularProgress
              size={80}
              thickness={4}
              sx={{
                color: "#006d77", // Consistente con TratamientosEnCurso
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
                boxShadow: "0 6px 24px rgba(0, 0, 0, 0.08)", // Consistente con TratamientosEnCurso
                overflow: "hidden",
                background: "#ffffff",
                border: "1px solid #78c1c8", // Consistente con TratamientosEnCurso
              }}
            >
              <Table>
                <TableHead
                  sx={{
                    background: "linear-gradient(90deg, #006d77 0%, #78c1c8 100%)", // Consistente con TratamientosEnCurso
                  }}
                >
                  <TableRow>
                    <TableCell sx={{ ...cellStyle, color: "#e0f7fa", fontWeight: 700, width: "20%" }}>
                      Nombre Completo
                    </TableCell>
                    <TableCell sx={{ ...cellStyle, color: "#e0f7fa", fontWeight: 700, width: "12%" }}>
                      Teléfono
                    </TableCell>
                    <TableCell sx={{ ...cellStyle, color: "#e0f7fa", fontWeight: 700, width: "8%" }}>
                      Sexo
                    </TableCell>
                    <TableCell sx={{ ...cellStyle, color: "#e0f7fa", fontWeight: 700, width: "20%" }}>
                      Email
                    </TableCell>
                    <TableCell sx={{ ...cellStyle, color: "#e0f7fa", fontWeight: 700, width: "12%" }}>
                      Fecha de Nacimiento
                    </TableCell>
                    <TableCell sx={{ ...cellStyle, color: "#e0f7fa", fontWeight: 700, width: "12%" }}>
                      Fecha de Creación
                    </TableCell>
                    <TableCell sx={{ ...cellStyle, color: "#e0f7fa", fontWeight: 700, width: "16%" }}>
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
                              backgroundColor: "#e0f7fa", // Consistente con TratamientosEnCurso
                              transition: "background-color 0.2s",
                              boxShadow: "inset 0 2px 10px rgba(0, 0, 0, 0.05)", // Consistente con TratamientosEnCurso
                            },
                            borderBottom: "1px solid #eef3f7",
                          }}
                        >
                          <TableCell sx={cellStyle}>
                            {paciente.nombre} {paciente.apellido_paterno} {paciente.apellido_materno}
                          </TableCell>
                          <TableCell sx={cellStyle}>{paciente.telefono}</TableCell>
                          <TableCell sx={cellStyle}>{paciente.sexo.charAt(0).toUpperCase()}</TableCell>
                          <TableCell sx={cellStyle}>{paciente.email}</TableCell>
                          <TableCell sx={cellStyle}>
                            {new Date(paciente.fecha_nacimiento).toLocaleDateString("es-MX")}
                          </TableCell>
                          <TableCell sx={cellStyle}>
                            {new Date(paciente.fecha_creacion).toLocaleDateString("es-MX")}
                          </TableCell>
                          <TableCell sx={{ ...cellStyle, display: "flex", justifyContent: "center", gap: 2 }}>
                            <Tooltip title="Historial Médico" arrow>
                              <IconButton onClick={() => handleOpenHistorial(paciente)}>
                                <HistoryIcon sx={{ color: "#006d77", fontSize: 28 }} /> {/* Consistente con TratamientosEnCurso */}
                              </IconButton>
                            </Tooltip>
                            <Tooltip
                              title={estadoCuentas[paciente.id] ? "Desactivar Cuenta" : "Activar Cuenta"}
                              arrow
                            >
                              <IconButton onClick={() => toggleEstadoCuenta(paciente.id)}>
                                {estadoCuentas[paciente.id] ? (
                                  <ToggleOnIcon sx={{ color: "green", fontSize: 28 }} />
                                ) : (
                                  <ToggleOffIcon sx={{ color: "red", fontSize: 28 }} />
                                )}
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
                count={Math.ceil(filteredPacientes.length / rowsPerPage)}
                page={page + 1} // Ajuste para que coincida con Pagination (base 1)
                onChange={(event, newPage) => setPage(newPage - 1)} // Ajuste para que page sea base 0
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
                    color: "#006d77", // Consistente con TratamientosEnCurso
                    fontFamily: "'Poppins', sans-serif",
                    "&:hover": {
                      backgroundColor: "#78c1c8", // Consistente con TratamientosEnCurso
                      color: "#ffffff",
                      transition: "all 0.3s ease",
                    },
                  },
                  "& .Mui-selected": {
                    backgroundColor: "#006d77", // Consistente con TratamientosEnCurso
                    color: "#e0f7fa", // Consistente con TratamientosEnCurso
                    "&:hover": {
                      backgroundColor: "#004d57", // Consistente con TratamientosEnCurso
                      transition: "all 0.3s ease",
                    },
                  },
                }}
              />
            </Box>
          </>
        )}
      </Box>
      <HistorialMedicoSinCuenta open={openHistorial} handleClose={handleCloseHistorial} paciente={pacienteSeleccionado} />
    </Box>
  );
};

export default ListaPacientes;