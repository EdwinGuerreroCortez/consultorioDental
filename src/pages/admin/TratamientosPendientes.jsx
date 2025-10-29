import React, { useEffect, useState } from "react";
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
  Snackbar,
  Alert,
  CircularProgress,
  Pagination,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  InputAdornment,
} from "@mui/material";
import { Assignment, Search as SearchIcon } from "@mui/icons-material";
import axios from "axios";

const TratamientosPendientes = () => {
  const [tratamientos, setTratamientos] = useState([]);
  const [pagina, setPagina] = useState(1);
  const [alerta, setAlerta] = useState({ open: false, message: "", severity: "success" });
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [tratamientoSeleccionado, setTratamientoSeleccionado] = useState(null);
  const [numCitas, setNumCitas] = useState("");
  const [precio, setPrecio] = useState("");
  const [csrfToken, setCsrfToken] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const elementosPorPagina = 10;

  // Obtener token CSRF
  useEffect(() => {
    const obtenerTokenCSRF = async () => {
      try {
        const response = await fetch("http://localhost:4000/api/get-csrf-token", {
          credentials: "include",
        });
        const data = await response.json();
        setCsrfToken(data.csrfToken);
      } catch (error) {
        console.error("Error obteniendo token CSRF:", error);
        setAlerta({ open: true, message: "Error al obtener el token CSRF", severity: "error" });
      }
    };
    obtenerTokenCSRF();
  }, []);

  useEffect(() => {
    if (csrfToken) {
      obtenerTratamientos(true);
    }
  }, [csrfToken]);

  useEffect(() => {
    if (!csrfToken) return;
    const intervalo = setInterval(() => {
      obtenerTratamientos(false);
    }, 3000);
    return () => clearInterval(intervalo);
  }, [csrfToken]);

  const obtenerTratamientos = async (isFirstLoad = false) => {
    if (!csrfToken) return;
    try {
      const response = await axios.get("http://localhost:4000/api/tratamientos-pacientes/pendientes", {
        headers: { "X-XSRF-TOKEN": csrfToken },
        withCredentials: true,
      });
      setTratamientos(response.data);
      if (isFirstLoad) setLoading(false);
    } catch (error) {
      console.error("Error al obtener tratamientos pendientes:", error);
      setAlerta({ open: true, message: "Error al cargar los tratamientos pendientes", severity: "error" });
      if (isFirstLoad) setLoading(false);
    }
  };

  const handleChangePagina = (event, value) => {
    setPagina(value);
  };

  const handleAbrirModal = (tratamiento) => {
    setTratamientoSeleccionado(tratamiento);
    setModalOpen(true);
  };

  const handleCerrarModal = () => {
    setModalOpen(false);
    setNumCitas("");
    setPrecio("");
  };

  const handleGuardar = async () => {
    if (!csrfToken) return;

    if (!numCitas || !precio || isNaN(numCitas) || isNaN(precio) || numCitas <= 0 || precio <= 0) {
      setAlerta({ open: true, message: "Por favor ingresa valores válidos.", severity: "warning" });
      return;
    }

    try {
      const response = await axios.post(
        "http://localhost:4000/api/tratamientos-pacientes/crear-nuevas-citas-pagos",
        {
          tratamientoPacienteId: tratamientoSeleccionado.id,
          citasTotales: parseInt(numCitas, 10),
          precioPorCita: parseFloat(precio),
        },
        {
          headers: { "X-XSRF-TOKEN": csrfToken },
          withCredentials: true,
        }
      );

      setAlerta({ open: true, message: response.data.mensaje, severity: "success" });
      obtenerTratamientos();
      handleCerrarModal();
    } catch (error) {
      console.error("Error al asignar número de citas:", error);
      setAlerta({ open: true, message: "Error al asignar número de citas", severity: "error" });
    }
  };

  // 🔍 Filtro del buscador
  const filteredTratamientos = tratamientos.filter((t) => {
    const nombreCompleto = `${t.nombre} ${t.apellido_paterno} ${t.apellido_materno}`.toLowerCase();
    const tratamientoNombre = t.tratamiento_nombre?.toLowerCase() || "";
    return (
      nombreCompleto.startsWith(searchTerm.toLowerCase().trim()) ||
      tratamientoNombre.startsWith(searchTerm.toLowerCase().trim())
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
    padding: "16px",
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
      {/* 🔍 Buscador */}
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

      <Box sx={{ flexGrow: 1, width: "100%" }}>
        {loading ? (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: "70vh",
              backgroundColor: "#ffffff",
              borderRadius: "16px",
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)",
              border: "1px solid #eef3f7",
            }}
          >
            <CircularProgress size={80} thickness={4} sx={{ color: "#006d77" }} />
          </Box>
        ) : filteredTratamientos.length === 0 ? (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: "70vh",
              backgroundColor: "#ffffff",
              borderRadius: "16px",
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)",
              border: "1px solid #78c1c8",
            }}
          >
            <Typography
              variant="h6"
              sx={{
                fontFamily: "'Poppins', sans-serif",
                color: "#03445e",
                fontWeight: 500,
                textAlign: "center",
              }}
            >
              No se encontraron pacientes con ese nombre o tratamiento.
            </Typography>
          </Box>
        ) : (
          <TableContainer
            component={Paper}
            sx={{
              borderRadius: "16px",
              boxShadow: "0 8px 24px rgba(0, 0, 0, 0.08)",
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
                  {[
                    "#",
                    "Nombre Completo",
                    "Teléfono",
                    "Email",
                    "Edad",
                    "Sexo",
                    "Tratamiento",
                    "Fecha de Inicio",
                    "Acción",
                  ].map((header) => (
                    <TableCell
                      key={header}
                      sx={{
                        color: "#e0f7fa",
                        fontWeight: 700,
                        textAlign: "center",
                        fontFamily: "'Poppins', sans-serif",
                        borderBottom: "none",
                        padding: "16px",
                      }}
                    >
                      {header}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {tratamientosPaginados.map((tratamiento, index) => (
                  <TableRow
                    key={tratamiento.id}
                    sx={{
                      "&:hover": {
                        backgroundColor: "#e0f7fa",
                        transition: "background-color 0.3s ease",
                      },
                      borderBottom: "1px solid #eef3f7",
                    }}
                  >
                    <TableCell sx={cellStyle}>{(pagina - 1) * elementosPorPagina + index + 1}</TableCell>
                    <TableCell sx={cellStyle}>
                      {`${tratamiento.nombre} ${tratamiento.apellido_paterno} ${tratamiento.apellido_materno}`}
                    </TableCell>
                    <TableCell sx={cellStyle}>{tratamiento.telefono}</TableCell>
                    <TableCell sx={cellStyle}>{tratamiento.email || "N/A"}</TableCell>
                    <TableCell sx={cellStyle}>{tratamiento.fecha_nacimiento || "N/A"}</TableCell>
                    <TableCell sx={cellStyle}>{tratamiento.sexo || "N/A"}</TableCell>
                    <TableCell sx={cellStyle}>{tratamiento.tratamiento_nombre}</TableCell>
                    <TableCell sx={cellStyle}>{tratamiento.fecha_inicio || "N/A"}</TableCell>
                    <TableCell sx={cellStyle}>
                      <Tooltip title="Valorar">
                        <IconButton
                          onClick={() => handleAbrirModal(tratamiento)}
                          sx={{ color: "#006d77", "&:hover": { color: "#004d57" } }}
                        >
                          <Assignment />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
                {filasFaltantes > 0 &&
                  Array.from({ length: filasFaltantes }).map((_, index) => (
                    <TableRow key={`empty-${index}`}>
                      {Array(9)
                        .fill("-")
                        .map((_, i) => (
                          <TableCell key={i} sx={{ ...cellStyle, color: "#999" }}>
                            -
                          </TableCell>
                        ))}
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Box>

      {/* PAGINACIÓN */}
      {filteredTratamientos.length > 0 && (
        <Box sx={{ display: "flex", justifyContent: "center", mt: "2rem", mb: "4rem" }}>
          <Pagination
            count={Math.ceil(filteredTratamientos.length / elementosPorPagina)}
            page={pagina}
            onChange={handleChangePagina}
            color="primary"
            size="large"
            sx={{
              "& .MuiPaginationItem-root": {
                fontSize: "1.1rem",
                padding: "10px 18px",
                margin: "0 6px",
                borderRadius: "10px",
                backgroundColor: "#ffffff",
                color: "#006d77",
                "&:hover": { backgroundColor: "#78c1c8", color: "#ffffff" },
              },
              "& .Mui-selected": { backgroundColor: "#006d77", color: "#e0f7fa" },
            }}
          />
        </Box>
      )}

      {/* MODAL */}
      <Dialog open={modalOpen} onClose={handleCerrarModal} maxWidth="md" fullWidth>
        <DialogTitle
          sx={{
            background: "linear-gradient(90deg, #006d77 0%, #78c1c8 100%)",
            color: "#e0f7fa",
            fontFamily: "'Poppins', sans-serif",
            fontWeight: 600,
            textAlign: "center",
          }}
        >
          Asignar Número de Citas
        </DialogTitle>
        <DialogContent
          sx={{
            padding: "2.5rem 3rem",
            backgroundColor: "#ffffff",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <Box sx={{ width: "100%", maxWidth: "600px", display: "flex", flexDirection: "column", gap: "2rem" }}>
            <TextField
              placeholder="Número de Citas"
              type="number"
              fullWidth
              value={numCitas}
              onChange={(e) => setNumCitas(e.target.value)}
              InputProps={{ inputProps: { min: 1 } }}
            />
            <TextField
              placeholder="Precio por Cita"
              type="number"
              fullWidth
              value={precio}
              onChange={(e) => setPrecio(e.target.value)}
              InputProps={{ inputProps: { min: 0, step: 0.01 } }}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ justifyContent: "space-between", padding: "0 3rem 2rem" }}>
          <Button onClick={handleCerrarModal} sx={{ color: "#006d77" }}>
            Cancelar
          </Button>
          <Button
            onClick={handleGuardar}
            variant="contained"
            sx={{ backgroundColor: "#006d77", "&:hover": { backgroundColor: "#004d57" } }}
          >
            Guardar
          </Button>
        </DialogActions>
      </Dialog>

      {/* ALERTAS */}
      <Snackbar
        open={alerta.open}
        autoHideDuration={4000}
        onClose={() => setAlerta({ ...alerta, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
      >
        <Alert
          onClose={() => setAlerta({ ...alerta, open: false })}
          severity={alerta.severity}
          sx={{
            fontFamily: "'Poppins', sans-serif",
            backgroundColor:
              alerta.severity === "success"
                ? "#e8f5e9"
                : alerta.severity === "error"
                  ? "#ffebee"
                  : "#fff3e0",
          }}
        >
          {alerta.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default TratamientosPendientes;
