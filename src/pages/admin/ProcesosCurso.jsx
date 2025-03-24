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
  Pagination,
  Stack,
} from "@mui/material";
import CircularProgress from "@mui/material/CircularProgress";
import axios from "axios";

const TratamientosEnCurso = () => {
  const [tratamientos, setTratamientos] = useState([]);
  const [pagina, setPagina] = useState(1);
  const [alerta, setAlerta] = useState({ open: false, message: "", severity: "success" });
  const [loading, setLoading] = useState(true);
  const elementosPorPagina = 10;

  useEffect(() => {
    axios
      .get("https://backenddent.onrender.com/api/tratamientos-pacientes/en-progreso")
      .then((response) => {
        const tratamientosEnProgreso = response.data.map((tratamiento) => ({
          ...tratamiento,
          sexo: tratamiento.sexo === "femenino" ? "F" : tratamiento.sexo === "masculino" ? "M" : "N/A",
        }));
        setTratamientos(tratamientosEnProgreso);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error al obtener tratamientos en curso:", error);
        setAlerta({ open: true, message: "Error al cargar los tratamientos", severity: "error" });
        setLoading(false);
      });
  }, []);

  const handleChangePagina = (event, value) => {
    setPagina(value);
  };

  const tratamientosPaginados = tratamientos.slice(
    (pagina - 1) * elementosPorPagina,
    pagina * elementosPorPagina
  );
  const filasFaltantes = elementosPorPagina - tratamientosPaginados.length;

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
        backgroundColor: "#f9fbfd", // Light background to match Navbar's subtle tones
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
              border: "1px solid #eef3f7",
            }}
          >
            <CircularProgress
              size={80}
              thickness={4}
              sx={{
                color: "#006d77", // Matches AppBar color
                "& .MuiCircularProgress-circle": { strokeLinecap: "round" },
              }}
            />
          </Box>
        ) : (
          <TableContainer
            component={Paper}
            sx={{
              borderRadius: "16px",
              boxShadow: "0 8px 24px rgba(0, 0, 0, 0.08)", // Matches Navbar shadow depth
              overflow: "hidden",
              background: "#ffffff",
              border: "1px solid #78c1c8", // Subtle teal border to tie with Navbar
            }}
          >
            <Table>
              <TableHead
                sx={{
                  background: "linear-gradient(90deg, #006d77 0%, #78c1c8 100%)", // Matches AppBar gradient
                }}
              >
                <TableRow>
                  <TableCell
                    sx={{
                      color: "#e0f7fa", // Matches AppBar text color
                      fontWeight: 700,
                      textAlign: "center",
                      fontFamily: "'Poppins', sans-serif",
                      borderBottom: "none",
                      padding: "16px",
                    }}
                  >
                    #
                  </TableCell>
                  {[
                    "Nombre",
                    "Apellido Paterno",
                    "Apellido Materno",
                    "Edad",
                    "Sexo",
                    "Teléfono",
                    "Email",
                    "Tratamiento",
                    "Fecha de Inicio",
                    "Citas Totales",
                    "Citas Asistidas",
                    "Estado",
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
                        backgroundColor: "#e0f7fa", // Light teal hover to match Navbar
                        transition: "background-color 0.3s ease",
                        boxShadow: "inset 0 2px 10px rgba(0, 0, 0, 0.05)",
                      },
                      borderBottom: "1px solid #eef3f7",
                    }}
                  >
                    <TableCell
                      sx={{
                        textAlign: "center",
                        color: "#03445e", // Darker teal to match Drawer text
                        fontFamily: "'Poppins', sans-serif",
                        padding: "16px",
                      }}
                    >
                      {(pagina - 1) * elementosPorPagina + index + 1}
                    </TableCell>
                    {[tratamiento.nombre, tratamiento.apellido_paterno, tratamiento.apellido_materno, tratamiento.edad || "N/A", tratamiento.sexo, tratamiento.telefono, tratamiento.email || "N/A", tratamiento.tratamiento_nombre, tratamiento.fecha_inicio || "N/A", tratamiento.citas_totales, tratamiento.citas_asistidas, tratamiento.estado].map((value, i) => (
                      <TableCell
                        key={i}
                        sx={{
                          textAlign: "center",
                          color: "#03445e",
                          fontFamily: "'Poppins', sans-serif",
                          padding: "16px",
                        }}
                      >
                        {value}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
                {filasFaltantes > 0 &&
                  Array.from({ length: filasFaltantes }).map((_, index) => (
                    <TableRow key={`empty-${index}`}>
                      <TableCell
                        sx={{
                          textAlign: "center",
                          color: "#999",
                          fontFamily: "'Poppins', sans-serif",
                          padding: "16px",
                        }}
                      >
                        {(pagina - 1) * elementosPorPagina + tratamientosPaginados.length + index + 1}
                      </TableCell>
                      {Array(12)
                        .fill("-")
                        .map((_, i) => (
                          <TableCell
                            key={i}
                            sx={{
                              textAlign: "center",
                              color: "#999",
                              fontFamily: "'Poppins', sans-serif",
                              padding: "16px",
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
        )}
      </Box>

      {/* Paginación */}
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
              color: "#006d77", // Matches AppBar color
              fontFamily: "'Poppins', sans-serif",
              "&:hover": {
                backgroundColor: "#78c1c8", // Matches Drawer hover
                color: "#ffffff",
                transition: "all 0.3s ease",
              },
            },
            "& .Mui-selected": {
              backgroundColor: "#006d77", // Matches AppBar
              color: "#e0f7fa", // Matches AppBar text
              "&:hover": {
                backgroundColor: "#004d57", // Darker shade for consistency
                transition: "all 0.3s ease",
              },
            },
          }}
        />
      </Box>

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

export default TratamientosEnCurso;