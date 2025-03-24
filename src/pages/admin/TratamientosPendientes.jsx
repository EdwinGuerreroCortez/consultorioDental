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
} from "@mui/material";
import { Assignment } from "@mui/icons-material";
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
  const [csrfToken, setCsrfToken] = useState(null); // Nuevo estado para el token CSRF
  const elementosPorPagina = 10;

  // Obtener el token CSRF al montar el componente
  useEffect(() => {
    const obtenerTokenCSRF = async () => {
      try {
        const response = await fetch("https://backenddent.onrender.com/api/get-csrf-token", {
          credentials: "include",
        });
        const data = await response.json();
        setCsrfToken(data.csrfToken); // Guardar el token en el estado
      } catch (error) {
        console.error("Error obteniendo el token CSRF:", error);
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
    if (!csrfToken) return; // Esperar a que el token esté disponible

    const intervalo = setInterval(() => {
      obtenerTratamientos(false);
    }, 3000);
    return () => clearInterval(intervalo);
  }, [csrfToken]);

  const obtenerTratamientos = async (isFirstLoad = false) => {
    if (!csrfToken) return; // Esperar a que el token esté disponible

    try {
      const response = await axios.get("https://backenddent.onrender.com/api/tratamientos-pacientes/pendientes", {
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
    if (!csrfToken) return; // Esperar a que el token esté disponible

    if (!numCitas || !precio || isNaN(numCitas) || isNaN(precio) || numCitas <= 0 || precio <= 0) {
      setAlerta({ open: true, message: "Por favor ingresa valores válidos.", severity: "warning" });
      return;
    }

    try {
      const response = await axios.post(
        "https://backenddent.onrender.com/api/tratamientos-pacientes/crear-nuevas-citas-pagos",
        {
          tratamientoPacienteId: tratamientoSeleccionado.id,
          citasTotales: parseInt(numCitas, 10),
          precioPorCita: parseFloat(precio),
        },
        {
          headers: {
            "X-XSRF-TOKEN": csrfToken,
          },
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

  const tratamientosPaginados = tratamientos.slice(
    (pagina - 1) * elementosPorPagina,
    pagina * elementosPorPagina
  );
  const cellStyle = {
    textAlign: "center",
    fontFamily: "'Poppins', sans-serif",
    color: "#03445e",
    fontSize: "1rem",
    py: "16px",
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
        ) : tratamientos.length === 0 ? (
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
              variant="h5"
              sx={{
                fontFamily: "'Poppins', sans-serif",
                color: "#03445e",
                fontWeight: 500,
                textAlign: "center",
              }}
            >
              No hay procesos pendientes de valoración.
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
                  {["#", "Nombre", "Apellido Paterno", "Apellido Materno", "Teléfono", "Email", "Edad", "Sexo", "Tratamiento", "Fecha de Inicio", "Acción"].map(
                    (header) => (
                      <TableCell
                        key={header}
                        sx={{
                          ...cellStyle,
                          color: "#e0f7fa",
                          fontWeight: 700,
                          borderBottom: "none",
                          padding: "16px",
                          fontSize: "1.1rem",
                        }}
                      >
                        {header}
                      </TableCell>
                    )
                  )}
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
                        boxShadow: "inset 0 2px 10px rgba(0, 0, 0, 0.05)",
                      },
                      borderBottom: "1px solid #eef3f7",
                    }}
                  >
                    <TableCell sx={cellStyle}>{(pagina - 1) * elementosPorPagina + index + 1}</TableCell>
                    <TableCell sx={cellStyle}>{tratamiento.nombre}</TableCell>
                    <TableCell sx={cellStyle}>{tratamiento.apellido_paterno}</TableCell>
                    <TableCell sx={cellStyle}>{tratamiento.apellido_materno}</TableCell>
                    <TableCell sx={cellStyle}>{tratamiento.telefono}</TableCell>
                    <TableCell sx={cellStyle}>{tratamiento.email || "N/A"}</TableCell>
                    <TableCell sx={cellStyle}>{tratamiento.edad || "N/A"}</TableCell>
                    <TableCell sx={cellStyle}>{tratamiento.sexo || "N/A"}</TableCell>
                    <TableCell sx={cellStyle}>{tratamiento.tratamiento_nombre}</TableCell>
                    <TableCell sx={cellStyle}>{tratamiento.fecha_inicio || "N/A"}</TableCell>
                    <TableCell sx={cellStyle}>
                      <Tooltip title="Valorar">
                        <IconButton
                          onClick={() => handleAbrirModal(tratamiento)}
                          sx={{
                            color: "#006d77",
                            "&:hover": { color: "#004d57" },
                          }}
                        >
                          <Assignment />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Box>

      {/* Paginación (mostrar solo si hay tratamientos) */}
      {tratamientos.length > 0 && (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            mt: "2rem",
            mb: "4rem",
          }}
        >
          <Pagination
            count={Math.ceil(tratamientos.length / elementosPorPagina)}
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

      {/* Modal para asignar citas y precio */}
      <Dialog
        open={modalOpen}
        onClose={handleCerrarModal}
        maxWidth="md"
        fullWidth
        sx={{ "& .MuiDialog-paper": { borderRadius: "12px", boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)" } }}
      >
        <DialogTitle
          sx={{
            background: "linear-gradient(90deg, #006d77 0%, #78c1c8 100%)",
            color: "#e0f7fa",
            fontFamily: "'Poppins', sans-serif",
            fontWeight: 600,
            borderRadius: "12px 12px 0 0",
            padding: "20px",
            textAlign: "center",
          }}
        >
          Asignar Número de Citas
        </DialogTitle>
        <DialogContent sx={{ padding: "2.5rem 3rem", backgroundColor: "#ffffff", minHeight: "300px", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" }}>
          <Box sx={{ width: "100%", maxWidth: "600px", display: "flex", flexDirection: "column", gap: "2rem" }}>
            <TextField
              placeholder="Número de Citas"
              type="number"
              fullWidth
              value={numCitas}
              onChange={(e) => setNumCitas(e.target.value)}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: "12px",
                  backgroundColor: "#eef3f7",
                  "& fieldset": { border: "none" },
                  height: "60px",
                  padding: "0 16px",
                },
                "& .MuiInputBase-input": {
                  fontFamily: "'Poppins', sans-serif",
                  color: "#03445e",
                  fontSize: "1.1rem",
                  textAlign: "center",
                },
              }}
              InputProps={{ inputProps: { min: 1 } }}
            />
            <TextField
              placeholder="Precio por Cita"
              type="number"
              fullWidth
              value={precio}
              onChange={(e) => setPrecio(e.target.value)}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: "12px",
                  backgroundColor: "#eef3f7",
                  "& fieldset": { border: "none" },
                  height: "60px",
                  padding: "0 16px",
                },
                "& .MuiInputBase-input": {
                  fontFamily: "'Poppins', sans-serif",
                  color: "#03445e",
                  fontSize: "1.1rem",
                  textAlign: "center",
                },
              }}
              InputProps={{ inputProps: { min: 0, step: 0.01 } }}
            />
          </Box>
        </DialogContent>
        <DialogActions
          sx={{
            padding: "0 3rem 2rem",
            backgroundColor: "#ffffff",
            borderBottomLeftRadius: "12px",
            borderBottomRightRadius: "12px",
            justifyContent: "space-between",
          }}
        >
          <Button
            onClick={handleCerrarModal}
            sx={{
              borderRadius: "12px",
              textTransform: "none",
              color: "#006d77",
              border: "1px solid #78c1c8",
              padding: "10px 30px",
              "&:hover": { backgroundColor: "#e0f7fa", borderColor: "#006d77" },
            }}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleGuardar}
            variant="contained"
            sx={{
              borderRadius: "12px",
              textTransform: "none",
              backgroundColor: "#006d77",
              padding: "10px 30px",
              "&:hover": { backgroundColor: "#004d57" },
            }}
          >
            Guardar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar (abajo a la izquierda) */}
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
            width: "100%",
            borderRadius: "10px",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
            fontFamily: "'Poppins', sans-serif",
            backgroundColor:
              alerta.severity === "success"
                ? "#e8f5e9"
                : alerta.severity === "error"
                ? "#ffebee"
                : "#fff3e0",
            color:
              alerta.severity === "success"
                ? "#2e7d32"
                : alerta.severity === "error"
                ? "#c62828"
                : "#f57f17",
          }}
        >
          {alerta.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default TratamientosPendientes;