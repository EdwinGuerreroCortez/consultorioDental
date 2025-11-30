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
  Snackbar,
  Alert,
  Pagination,
  Tooltip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  InputAdornment,
  Typography,
} from "@mui/material";
import CircularProgress from "@mui/material/CircularProgress";
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";
import SearchIcon from "@mui/icons-material/Search";
import axios from "axios";

const TratamientosEnCurso = () => {
  const [tratamientos, setTratamientos] = useState([]);
  const [pagina, setPagina] = useState(1);
  const [alerta, setAlerta] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const elementosPorPagina = 10;
  const [confirmarOpen, setConfirmarOpen] = useState(false);
  const [tratamientoSeleccionado, setTratamientoSeleccionado] = useState(null);
  const [csrfToken, setCsrfToken] = useState(null);

  useEffect(() => {
    const obtenerTokenCSRF = async () => {
      try {
        const response = await fetch("https://backenddent.onrender.com/api/get-csrf-token", {
          credentials: "include",
        });
        const data = await response.json();
        setCsrfToken(data.csrfToken);
      } catch (error) {
        console.error("Error al obtener token CSRF:", error);
      }
    };
    obtenerTokenCSRF();
  }, []);

  useEffect(() => {
    axios
      .get("https://backenddent.onrender.com/api/tratamientos-pacientes/en-progreso")
      .then((response) => {
        const tratamientosEnProgreso = response.data.map((tratamiento) => ({
          ...tratamiento,
          sexo:
            tratamiento.sexo === "femenino"
              ? "F"
              : tratamiento.sexo === "masculino"
                ? "M"
                : "N/A",
          nombre_completo: `${tratamiento.nombre} ${tratamiento.apellido_paterno} ${tratamiento.apellido_materno}`.trim(),
        }));
        setTratamientos(tratamientosEnProgreso);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error al obtener tratamientos en curso:", error);
        setAlerta({
          open: true,
          message: "Error al cargar los tratamientos",
          severity: "error",
        });
        setLoading(false);
      });
  }, []);

  const handleChangePagina = (event, value) => {
    setPagina(value);
  };

  const handleCancelarTratamiento = (id) => {
    setTratamientoSeleccionado(id);
    setConfirmarOpen(true);
  };

  const confirmarCancelacion = async () => {
    if (!tratamientoSeleccionado) return;

    setConfirmarOpen(false);
    setLoading(true);

    try {
      const response = await axios.put(
        `https://backenddent.onrender.com/api/tratamientos-pacientes/cancelar/${tratamientoSeleccionado}`,
        {},
        {
          headers: { "X-XSRF-TOKEN": csrfToken },
          withCredentials: true,
        }
      );

      setAlerta({
        open: true,
        message: response.data.mensaje || "Tratamiento cancelado correctamente.",
        severity: "success",
      });

      const updated = await axios.get("https://backenddent.onrender.com/api/tratamientos-pacientes/en-progreso");
      const tratamientosEnProgreso = updated.data.map((tratamiento) => ({
        ...tratamiento,
        sexo:
          tratamiento.sexo === "femenino"
            ? "F"
            : tratamiento.sexo === "masculino"
              ? "M"
              : "N/A",
        nombre_completo: `${tratamiento.nombre} ${tratamiento.apellido_paterno} ${tratamiento.apellido_materno}`.trim(),
      }));
      setTratamientos(tratamientosEnProgreso);
    } catch (error) {
      console.error("Error al cancelar el tratamiento:", error);
      setAlerta({
        open: true,
        message: error.response?.data?.mensaje || "Error al cancelar el tratamiento.",
        severity: "error",
      });
    } finally {
      setLoading(false);
      setTratamientoSeleccionado(null);
    }
  };

  //  Filtro de búsqueda
  const filteredTratamientos = tratamientos.filter((tratamiento) => {
    const nombreCompleto = tratamiento.nombre_completo.toLowerCase().trim();
    return nombreCompleto.startsWith(searchTerm.toLowerCase().trim());
  });

  const tratamientosPaginados = filteredTratamientos.slice(
    (pagina - 1) * elementosPorPagina,
    pagina * elementosPorPagina
  );

  const filasFaltantes = elementosPorPagina - tratamientosPaginados.length;

  useEffect(() => {
    setPagina(1); // Reinicia la paginación al cambiar el término de búsqueda
  }, [searchTerm]);

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
          maxWidth: "6000px",
          mb: 3,
          display: "flex",
          alignItems: "center",
        }}
      >
        <TextField
          label="Buscar paciente"
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
            sx: { color: "#006d77", fontFamily: "'Poppins', sans-serif" },
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
            <CircularProgress
              size={80}
              thickness={4}
              sx={{
                color: "#006d77",
                "& .MuiCircularProgress-circle": { strokeLinecap: "round" },
              }}
            />
          </Box>
        ) : filteredTratamientos.length === 0 ? (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: "60vh",
              backgroundColor: "#ffffff",
              borderRadius: "16px",
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)",
              border: "1px solid #78c1c8",
            }}
          >
            <Typography variant="h6" sx={{ color: "#03445e", fontWeight: 500 }}>
              No se encontraron pacientes con ese nombre.
            </Typography>
          </Box>
        ) : (
          <TableContainer
            component={Paper}
            sx={{
              borderRadius: "16px",
              boxShadow: "0 8px 24px rgba(0, 0, 0, 0.08)",
              overflowX: "auto",
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
                    "Edad",
                    "Sexo",
                    "Teléfono",
                    "Email",
                    "Tratamiento",
                    "Fecha de Inicio",
                    "Citas Totales",
                    "Citas Asistidas",
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
                        padding: "12px",
                        fontSize: "0.95rem",
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
                    <TableCell sx={{ textAlign: "center" }}>
                      {(pagina - 1) * elementosPorPagina + index + 1}
                    </TableCell>
                    <TableCell sx={{ textAlign: "center" }}>{tratamiento.nombre_completo}</TableCell>
                    <TableCell sx={{ textAlign: "center" }}>{tratamiento.edad || "N/A"}</TableCell>
                    <TableCell sx={{ textAlign: "center" }}>{tratamiento.sexo}</TableCell>
                    <TableCell sx={{ textAlign: "center" }}>{tratamiento.telefono}</TableCell>
                    <TableCell sx={{ textAlign: "center" }}>{tratamiento.email || "N/A"}</TableCell>
                    <TableCell sx={{ textAlign: "center" }}>{tratamiento.tratamiento_nombre}</TableCell>
                    <TableCell sx={{ textAlign: "center" }}>{tratamiento.fecha_inicio || "N/A"}</TableCell>
                    <TableCell sx={{ textAlign: "center" }}>{tratamiento.citas_totales}</TableCell>
                    <TableCell sx={{ textAlign: "center" }}>{tratamiento.citas_asistidas}</TableCell>
                    <TableCell sx={{ textAlign: "center" }}>
                      <Tooltip title="Cancelar todo el tratamiento" arrow>
                        <IconButton
                          onClick={() => handleCancelarTratamiento(tratamiento.id)}
                          sx={{
                            color: "#ff0000b2",
                            transition: "all 0.3s ease",
                            "&:hover": { color: "#ff0000ff", transform: "scale(1.2)" },
                          }}
                        >
                          <CancelOutlinedIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}

                {filasFaltantes > 0 &&
                  Array.from({ length: filasFaltantes }).map((_, index) => (
                    <TableRow key={`empty-${index}`}>
                      {Array(11)
                        .fill("-")
                        .map((_, i) => (
                          <TableCell key={i} sx={{ textAlign: "center", color: "#999" }}>
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

      {/* Paginación */}
      <Box sx={{ display: "flex", justifyContent: "center", mt: 3, mb: 5 }}>
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
              borderRadius: "8px",
              color: "#006d77",
              "&:hover": {
                backgroundColor: "#78c1c8",
                color: "#ffffff",
              },
            },
            "& .Mui-selected": {
              backgroundColor: "#006d77",
              color: "#e0f7fa",
              "&:hover": { backgroundColor: "#004d57" },
            },
          }}
        />
      </Box>

      {/* Dialog de confirmación */}
      <Dialog open={confirmarOpen} onClose={() => setConfirmarOpen(false)}>
        <DialogTitle
          sx={{
            fontFamily: "'Poppins', sans-serif",
            fontWeight: 600,
            color: "#d32f2f",
            textAlign: "center",
          }}
        >
          Confirmar Cancelación
        </DialogTitle>
        <DialogContent>
          <Alert severity="warning">
            ¿Estás seguro de que deseas cancelar este tratamiento?
            Esta acción afectará todas las citas y pagos asociados.
          </Alert>
        </DialogContent>
        <DialogActions sx={{ justifyContent: "center" }}>
          <Button onClick={() => setConfirmarOpen(false)} variant="outlined" sx={{ color: "#006d77" }}>
            No, volver
          </Button>
          <Button
            onClick={confirmarCancelacion}
            variant="contained"
            sx={{ backgroundColor: "#d32f2f", "&:hover": { backgroundColor: "#b71c1c" } }}
          >
            Sí, cancelar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={alerta.open}
        autoHideDuration={6000}
        onClose={() => setAlerta({ ...alerta, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={() => setAlerta({ ...alerta, open: false })}
          severity={alerta.severity}
          sx={{ fontFamily: "'Poppins', sans-serif" }}
        >
          {alerta.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default TratamientosEnCurso;
