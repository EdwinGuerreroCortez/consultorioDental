import React, { useState, useEffect } from "react";
import {
  Box, Button, Card, CardContent, Typography, TextField, Divider,
  FormControl, InputLabel, Select, MenuItem, Snackbar, Alert,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Pagination
} from "@mui/material";
import { motion } from "framer-motion";

const primaryColor = "#006d77";
const secondaryColor = "#78c1c8";
const accentColor = "#e8f4f8";
const bgGradient = "linear-gradient(135deg, #e8f4f8 0%, #ffffff 100%)";

const CrearMisionVision = () => {
  const [formulario, setFormulario] = useState({ tipo: "mision", contenido: "" });
  const [errores, setErrores] = useState({});
  const [alerta, setAlerta] = useState({ open: false, message: "", severity: "error" });
  const [csrfToken, setCsrfToken] = useState(null);
  const [vigentes, setVigentes] = useState([]);
  const [historial, setHistorial] = useState([]);
  const [pageHistorial, setPageHistorial] = useState(1);
  const rowsPerPage = 5;

  useEffect(() => {
    const obtenerToken = async () => {
      try {
        const res = await fetch("http://localhost:4000/api/get-csrf-token", {
          credentials: "include",
        });
        const data = await res.json();
        setCsrfToken(data.csrfToken);
      } catch (err) {
        setAlerta({ open: true, message: "Error al obtener CSRF token", severity: "error" });
      }
    };
    obtenerToken();
  }, []);

  const cargarDatos = async () => {
    try {
      const res = await fetch("http://localhost:4000/api/mision-vision/historial");
      const data = await res.json();
      const misiones = data.filter((d) => d.tipo === "mision");
      const visiones = data.filter((d) => d.tipo === "vision");
      const vigente = [
        ...[...misiones].sort((a, b) => b.version - a.version).slice(0, 1),
        ...[...visiones].sort((a, b) => b.version - a.version).slice(0, 1),
      ];
      const historialFiltrado = data.filter(
        (item) => !vigente.some((v) => v.tipo === item.tipo && v.version === item.version)
      );
      setVigentes(vigente);
      setHistorial(historialFiltrado);
    } catch (error) {
      setAlerta({ open: true, message: "Error al cargar historial", severity: "error" });
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormulario({ ...formulario, [name]: value });
    if (name === "contenido" && value.length < 10) {
      setErrores({ ...errores, contenido: "El contenido debe tener al menos 10 caracteres." });
    } else {
      setErrores({ ...errores, [name]: "" });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formulario.contenido || formulario.contenido.length < 10) {
      setErrores({ contenido: "El contenido debe tener al menos 10 caracteres." });
      return;
    }

    try {
      const response = await fetch("http://localhost:4000/api/mision-vision/crear", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-XSRF-TOKEN": csrfToken
        },
        credentials: "include",
        body: JSON.stringify(formulario),
      });

      const data = await response.json();

      if (response.ok) {
        setAlerta({
          open: true,
          message: `Versión registrada exitosamente (v${data.version})`,
          severity: "success",
        });
        setFormulario({ tipo: "mision", contenido: "" });
        cargarDatos();
      } else {
        setAlerta({ open: true, message: data.mensaje || "Error", severity: "error" });
      }
    } catch (error) {
      setAlerta({ open: true, message: "Error en la solicitud", severity: "error" });
    }
  };

  const handleChangePageHistorial = (event, newPage) => {
    setPageHistorial(newPage);
  };

  const cellStyle = {
    textAlign: "center",
    color: "#03445e",
    fontFamily: "'Poppins', sans-serif",
    fontSize: "1rem",
    py: "20px",
    px: "16px",
  };

  const TablaVersiones = ({ titulo, datos, paginar = false }) => {
    const datosPaginados = paginar
      ? datos.slice((pageHistorial - 1) * rowsPerPage, pageHistorial * rowsPerPage)
      : datos;

    const totalPages = paginar ? Math.ceil(datos.length / rowsPerPage) : 1;

    return (
      <Box sx={{ mt: 6 }}>
        <Typography
          variant="h5"
          sx={{
            fontWeight: 600,
            mb: 2,
            color: "#03445e",
            textAlign: "center",
            fontFamily: "'Poppins', sans-serif",
          }}
        >
          {titulo}
        </Typography>
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
              sx={{ background: "linear-gradient(90deg, #006d77 0%, #78c1c8 100%)" }}
            >
              <TableRow>
                <TableCell sx={{ ...cellStyle, color: "#e0f7fa", fontWeight: 700 }}>Tipo</TableCell>
                <TableCell sx={{ ...cellStyle, color: "#e0f7fa", fontWeight: 700 }}>Versión</TableCell>
                <TableCell sx={{ ...cellStyle, color: "#e0f7fa", fontWeight: 700 }}>Contenido</TableCell>
                <TableCell sx={{ ...cellStyle, color: "#e0f7fa", fontWeight: 700 }}>Fecha</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {datosPaginados.length > 0 ? (
                datosPaginados.map((item, index) => (
                  <TableRow key={index} sx={{ "&:hover": { backgroundColor: "#e0f7fa" } }}>
                    <TableCell sx={cellStyle}>{item.tipo}</TableCell>
                    <TableCell sx={cellStyle}>{item.version}</TableCell>
                    <TableCell sx={{ ...cellStyle, textAlign: "left" }}>{item.contenido}</TableCell>
                    <TableCell sx={cellStyle}>
                      {new Date(item.fecha_creacion).toLocaleDateString("es-MX")}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} sx={{ ...cellStyle, color: "#999" }}>
                    No hay registros disponibles.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {paginar && totalPages > 1 && (
          <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
            <Pagination
              count={totalPages}
              page={pageHistorial}
              onChange={handleChangePageHistorial}
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
      </Box>
    );
  };

  return (
    <Box sx={{ maxWidth: "md", margin: "2rem auto", padding: "1rem" }}>
      <Card
        component={motion.div}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.7 }}
        sx={{
          boxShadow: 10,
          borderRadius: "24px",
          padding: "2.5rem",
          background: bgGradient,
          border: `1px solid ${accentColor}`,
        }}
      >
        <CardContent>
          <Typography
            variant="h4"
            align="center"
            gutterBottom
            sx={{
              fontWeight: 700,
              color: primaryColor,
              mb: 3,
              letterSpacing: "2px",
              textTransform: "uppercase",
              fontSize: "1.75rem",
              fontFamily: "'Poppins', sans-serif",
            }}
          >
            Registrar Misión o Visión
          </Typography>

          <Divider sx={{ mb: 4, borderColor: accentColor }} />

          <form onSubmit={handleSubmit}>
            <FormControl fullWidth sx={{ mb: 4 }}>
              <InputLabel>Tipo</InputLabel>
              <Select
                name="tipo"
                value={formulario.tipo}
                onChange={handleChange}
                label="Tipo"
              >
                <MenuItem value="mision">Misión</MenuItem>
                <MenuItem value="vision">Visión</MenuItem>
              </Select>
            </FormControl>

            <TextField
              label="Contenido"
              name="contenido"
              value={formulario.contenido}
              onChange={handleChange}
              multiline
              rows={5}
              fullWidth
              required
              error={!!errores.contenido}
              helperText={errores.contenido}
            />

            <Box mt={4}>
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{
                  backgroundColor: primaryColor,
                  color: "#fff",
                  fontWeight: 600,
                  padding: "14px 30px",
                  borderRadius: "16px",
                  textTransform: "none",
                  fontFamily: "'Poppins', sans-serif",
                  "&:hover": {
                    backgroundColor: secondaryColor,
                  },
                }}
              >
                Registrar
              </Button>
            </Box>
          </form>
        </CardContent>
      </Card>

      <TablaVersiones titulo="Misión y Visión Vigentes" datos={vigentes} />
      <TablaVersiones titulo="Historial de Versiones" datos={historial} paginar />

      <Snackbar
        open={alerta.open}
        autoHideDuration={6000}
        onClose={() => setAlerta({ ...alerta, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity={alerta.severity} onClose={() => setAlerta({ ...alerta, open: false })}>
          {alerta.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default CrearMisionVision;
