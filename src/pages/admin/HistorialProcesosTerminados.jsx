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
  Pagination,
  Tooltip,
  IconButton,
  TextField,
  InputAdornment,
} from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import SearchIcon from "@mui/icons-material/Search";
import axios from "axios";

const HistorialProcesosTerminados = () => {
  const [tratamientos, setTratamientos] = useState([]);
  const [detalleSeleccionado, setDetalleSeleccionado] = useState(null);
  const [open, setOpen] = useState(false);
  const [tabIndex, setTabIndex] = useState(0);
  const [comentario, setComentario] = useState(null);
  const [openComentario, setOpenComentario] = useState(false);
  const [pagina, setPagina] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const elementosPorPagina = 10;

  useEffect(() => {
    axios
      .get("https://backenddent.onrender.com/api/tratamientos-pacientes/historial")
      .then((response) => {
        setTratamientos(response.data);
      })
      .catch((error) => {
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

  const handleChangePagina = (event, value) => {
    setPagina(value);
  };

  //  Filtrado por nombre o tratamiento
  const filteredTratamientos = tratamientos.filter((t) => {
    const nombreCompleto = `${t.nombre} ${t.apellido_paterno} ${t.apellido_materno}`.toLowerCase();
    const tratamientoNombre = t.tratamiento_nombre?.toLowerCase() || "";
    return (
      nombreCompleto.includes(searchTerm.toLowerCase().trim()) ||
      tratamientoNombre.includes(searchTerm.toLowerCase().trim())
    );
  });

  useEffect(() => {
    setPagina(1);
  }, [searchTerm]);

  const tratamientosPaginados = filteredTratamientos.slice(
    (pagina - 1) * elementosPorPagina,
    pagina * elementosPorPagina
  );

  const filasFaltantes = elementosPorPagina - tratamientosPaginados.length;

  const cellStyle = {
    textAlign: "center",
    color: "#03445e",
    fontFamily: "'Poppins', sans-serif",
    padding: "12px",
    fontSize: "0.9rem",
    whiteSpace: "normal",
    wordWrap: "break-word",
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
      {/*  Buscador */}
      <Box
        sx={{
          width: "100%",
          maxWidth: "100%",
          mb: 3,
          display: "flex",
          alignItems: "center",
        }}
      >
        <TextField
          label="Buscar paciente o tratamiento"
          variant="outlined"
          fullWidth
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{
            "& .MuiOutlinedInput-root": {
              borderRadius: "12px",
              backgroundColor: "#fff",
              "& fieldset": { borderColor: "#006d77" },
              "&:hover fieldset": { borderColor: "#005c66" },
              "&.Mui-focused fieldset": { borderColor: "#006d77", borderWidth: "2px" },
            },
            "& .MuiInputLabel-root": {
              color: "#03445e",
              "&.Mui-focused": { color: "#006d77" },
            },
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: "#006d77" }} />
              </InputAdornment>
            ),
          }}
        />
      </Box>

      {/* TABLA PRINCIPAL */}
      <Box sx={{ flexGrow: 1, width: "100%" }}>
        <TableContainer
          component={Paper}
          sx={{
            borderRadius: "16px",
            boxShadow: "0 8px 24px rgba(0, 0, 0, 0.08)",
            overflow: "hidden",
            mt: 3,
            border: "1px solid #78c1c8",
          }}
        >
          <Table sx={{ tableLayout: "auto" }}>
            <TableHead
              sx={{
                background: "linear-gradient(90deg, #006d77 0%, #78c1c8 100%)",
              }}
            >
              <TableRow>
                {[
                  "#",
                  "Nombre Completo",
                  "Edad",
                  "Sexo",
                  "Correo",
                  "Teléfono",
                  "Tratamiento",
                  "Citas Totales / Asistidas",
                  "Fecha de Inicio",
                  "Fecha de Finalización",
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
                      padding: "12px",
                      fontSize: "0.95rem",
                      whiteSpace: "normal",
                    }}
                  >
                    {header}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {tratamientosPaginados.length > 0 ? (
                tratamientosPaginados.map((tratamiento, index) => (
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
                    <TableCell sx={cellStyle}>
                      {(pagina - 1) * elementosPorPagina + index + 1}
                    </TableCell>
                    <TableCell sx={cellStyle}>
                      {`${tratamiento.nombre} ${tratamiento.apellido_paterno} ${tratamiento.apellido_materno}`}
                    </TableCell>
                    <TableCell sx={cellStyle}>{tratamiento.edad || "N/A"}</TableCell>
                    <TableCell sx={cellStyle}>{tratamiento.sexo || "N/A"}</TableCell>
                    <TableCell sx={cellStyle}>{tratamiento.email || "N/A"}</TableCell>
                    <TableCell sx={cellStyle}>{tratamiento.telefono || "N/A"}</TableCell>
                    <TableCell sx={cellStyle}>{tratamiento.tratamiento_nombre}</TableCell>
                    <TableCell sx={cellStyle}>
                      {`${tratamiento.citas_totales} / ${tratamiento.citas_asistidas}`}
                    </TableCell>
                    <TableCell sx={cellStyle}>{tratamiento.fecha_inicio || "N/A"}</TableCell>
                    <TableCell sx={cellStyle}>{tratamiento.fecha_finalizacion || "N/A"}</TableCell>
                    <TableCell sx={cellStyle}>
                      <Tooltip title="Ver Detalles" placement="top">
                        <IconButton
                          onClick={() => handleVerDetalles(tratamiento)}
                          sx={{
                            color: "#006d77",
                            "&:hover": {
                              color: "#004d57",
                              backgroundColor: "#e0f7fa",
                            },
                          }}
                        >
                          <VisibilityIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={11} sx={{ ...cellStyle, color: "#999" }}>
                    No hay tratamientos registrados.
                  </TableCell>
                </TableRow>
              )}
              {filasFaltantes > 0 &&
                Array.from({ length: filasFaltantes }).map((_, index) => (
                  <TableRow key={`empty-${index}`}>
                    {Array(11)
                      .fill("-")
                      .map((_, i) => (
                        <TableCell
                          key={i}
                          sx={{
                            textAlign: "center",
                            color: "#999",
                            fontFamily: "'Poppins', sans-serif",
                            padding: "12px",
                            fontSize: "0.9rem",
                          }}
                        >
                          -
                        </TableCell>
                      ))}
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      {/* PAGINACIÓN */}
      {filteredTratamientos.length > 0 && (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            mt: "2rem",
            mb: "4rem",
          }}
        >
          <Pagination
            count={Math.ceil(filteredTratamientos.length / elementosPorPagina)}
            page={pagina}
            onChange={handleChangePagina}
            color="primary"
            size="medium"
            sx={{
              "& .MuiPaginationItem-root": {
                fontSize: "1rem",
                padding: "8px 16px",
                margin: "0 4px",
                borderRadius: "8px",
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
      )}

      {/* DIALOGO DETALLES */}
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
            padding: "16px",
            fontSize: "1.1rem",
          }}
        >
          Detalles del Tratamiento
        </DialogTitle>

        <DialogContent sx={{ padding: "1.5rem", backgroundColor: "#ffffff" }}>
          {/* Tabs */}
          {detalleSeleccionado ? (
            <>
              <Tabs
                value={tabIndex}
                onChange={handleTabChange}
                centered
                sx={{
                  mb: "1rem",
                  "& .MuiTab-root": {
                    fontFamily: "'Poppins', sans-serif",
                    textTransform: "none",
                    fontSize: "1rem",
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

              {/* TAB CITAS */}
              {tabIndex === 0 && (
                <TableContainer component={Paper} sx={{ borderRadius: "12px", backgroundColor: "#e0f7fa" }}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ ...cellStyle, fontWeight: 600 }}>Fecha</TableCell>
                        <TableCell sx={{ ...cellStyle, fontWeight: 600 }}>Estado</TableCell>
                        <TableCell sx={{ ...cellStyle, fontWeight: 600 }}>Pago</TableCell>
                        <TableCell sx={{ ...cellStyle, fontWeight: 600 }}>Comentario</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {detalleSeleccionado.citas?.length ? (
                        detalleSeleccionado.citas.map((cita) => (
                          <TableRow key={cita.cita_id}>
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

              {/* TAB PAGOS */}
              {tabIndex === 1 && (
                <TableContainer component={Paper} sx={{ borderRadius: "12px", backgroundColor: "#e0f7fa" }}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ ...cellStyle, fontWeight: 600 }}>Monto</TableCell>
                        <TableCell sx={{ ...cellStyle, fontWeight: 600 }}>Método</TableCell>
                        <TableCell sx={{ ...cellStyle, fontWeight: 600 }}>Estado</TableCell>
                        <TableCell sx={{ ...cellStyle, fontWeight: 600 }}>Fecha</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {detalleSeleccionado.pagos?.length ? (
                        detalleSeleccionado.pagos.map((pago) => (
                          <TableRow key={pago.pago_id}>
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
            <Typography sx={{ textAlign: "center", color: "#03445e" }}>
              No se encontraron detalles.
            </Typography>
          )}
        </DialogContent>
      </Dialog>

      {/* DIALOGO COMENTARIO */}
      <Dialog
        open={openComentario}
        onClose={handleCloseComentario}
        fullWidth
        maxWidth="sm"
        sx={{ "& .MuiDialog-paper": { borderRadius: "12px" } }}
      >
        <DialogTitle
          sx={{
            backgroundColor: "#e0f7fa",
            color: "#006d77",
            fontFamily: "'Poppins', sans-serif",
            fontWeight: 600,
            borderRadius: "12px 12px 0 0",
          }}
        >
          Comentario
        </DialogTitle>
        <DialogContent sx={{ padding: "1rem", backgroundColor: "#ffffff" }}>
          <Typography
            sx={{
              fontFamily: "'Poppins', sans-serif",
              color: "#03445e",
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
