// Componente React de "Quiénes Somos" con diseño alineado y coherente
import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  TextField,
  Divider,
  Snackbar,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Pagination,
  Tooltip,
  IconButton,
} from "@mui/material";
import { Edit, CheckCircle } from "@mui/icons-material";
import { motion } from "framer-motion";

const primaryColor = "#006d77";
const secondaryColor = "#78c1c8";
const accentColor = "#e8f4f8";
const bgGradient = "linear-gradient(135deg, #e8f4f8 0%, #ffffff 100%)";

const QuienesSomos = () => {
  const [formulario, setFormulario] = useState({ contenido: "" });
  const [errores, setErrores] = useState({});
  const [alerta, setAlerta] = useState({ open: false, message: "", severity: "error" });
  const [csrfToken, setCsrfToken] = useState(null);
  const [vigente, setVigente] = useState(null);
  const [historial, setHistorial] = useState([]);
  const [editMode, setEditMode] = useState(null);
  const [editContent, setEditContent] = useState("");
  const [page, setPage] = useState(1);
  const rowsPerPage = 5;
  const editInputRef = useRef(null);
  const formInputRef = useRef(null);

  useEffect(() => {
    const obtenerToken = async () => {
      try {
        const res = await fetch("https://backenddent.onrender.com/api/get-csrf-token", { credentials: "include" });
        const data = await res.json();
        setCsrfToken(data.csrfToken);
      } catch {
        setAlerta({ open: true, message: "Error al obtener CSRF token", severity: "error" });
      }
    };
    obtenerToken();
  }, []);

  const cargarDatos = async () => {
    try {
      const [resVigente, resHistorial] = await Promise.all([
        fetch("https://backenddent.onrender.com/api/quienes-somos/vigente"),
        fetch("https://backenddent.onrender.com/api/quienes-somos/listar"),
      ]);
      const vigenteData = await resVigente.json();
      const historialData = await resHistorial.json();
      setVigente(vigenteData);
      const historialFiltrado = historialData.filter((item) => item.vigente !== 1);
      setHistorial(historialFiltrado);
    } catch {
      setAlerta({ open: true, message: "Error al cargar datos", severity: "error" });
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const handleChange = (e) => {
    setFormulario({ ...formulario, [e.target.name]: e.target.value });
    if (e.target.value.length < 10) {
      setErrores({ contenido: "Debe tener al menos 10 caracteres." });
    } else {
      setErrores({});
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formulario.contenido || formulario.contenido.length < 10) {
      setErrores({ contenido: "Debe tener al menos 10 caracteres." });
      return;
    }

    try {
      const response = await fetch("https://backenddent.onrender.com/api/quienes-somos/crear", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-XSRF-TOKEN": csrfToken,
        },
        credentials: "include",
        body: JSON.stringify(formulario),
      });

      const data = await response.json();
      if (response.ok) {
        setAlerta({ open: true, message: data.mensaje, severity: "success" });
        setFormulario({ contenido: "" });
        cargarDatos();
      } else {
        setAlerta({ open: true, message: data.mensaje || "Error", severity: "error" });
      }
    } catch {
      setAlerta({ open: true, message: "Error en la solicitud", severity: "error" });
    }
  };

  const handleEditClick = (id, contenido) => {
    setEditMode(id);
    setEditContent(contenido);
  };

  const handleSaveEdit = async (id) => {
    if (editContent.length < 10) {
      setAlerta({ open: true, message: "Debe tener al menos 10 caracteres.", severity: "error" });
      return;
    }

    try {
      const response = await fetch(`https://backenddent.onrender.com/api/quienes-somos/editar/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "X-XSRF-TOKEN": csrfToken,
        },
        credentials: "include",
        body: JSON.stringify({ contenido: editContent }),
      });
      if (response.ok) {
        setAlerta({ open: true, message: "Actualizado correctamente", severity: "success" });
        setEditMode(null);
        cargarDatos();
      }
    } catch {
      setAlerta({ open: true, message: "Error al guardar", severity: "error" });
    }
  };

  const activarComoVigente = async (id) => {
    try {
      const res = await fetch(`https://backenddent.onrender.com/api/quienes-somos/activar/${id}`, {
        method: "PUT",
        headers: { "X-XSRF-TOKEN": csrfToken },
        credentials: "include",
      });
      const data = await res.json();
      if (res.ok) {
        setAlerta({ open: true, message: data.mensaje, severity: "success" });
        cargarDatos();
      } else {
        setAlerta({ open: true, message: data.mensaje, severity: "error" });
      }
    } catch {
      setAlerta({ open: true, message: "Error al activar versión", severity: "error" });
    }
  };

  const cellStyle = {
    fontFamily: "'Poppins', sans-serif",
    fontSize: "0.95rem",
    padding: "16px",
    borderBottom: `1px solid ${accentColor}`,
    verticalAlign: "middle",
    color: "#2d3748",
    textAlign: "left",
  };

  const headerStyle = {
    ...cellStyle,
    color: "#ffffff",
    fontWeight: 700,
    textAlign: "center",
    backgroundColor: primaryColor,
  };

  const datosPaginados = historial.slice((page - 1) * rowsPerPage, page * rowsPerPage);
  const totalPages = Math.ceil(historial.length / rowsPerPage);

  return (
    <Box sx={{ maxWidth: "1200px", margin: "4rem auto", padding: "0 1.5rem" }}>
      <Card sx={{ boxShadow: "0 8px 32px rgba(0,0,0,0.12)", borderRadius: "24px", padding: "2.5rem", background: bgGradient, border: `1px solid ${accentColor}` }}>
        <CardContent>
          <Typography variant="h4" sx={{ fontWeight: 700, color: primaryColor, mb: 3 }}>Registrar "Quiénes Somos"</Typography>
          <Divider sx={{ mb: 4 }} />
          <form onSubmit={handleSubmit}>
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
              inputRef={formInputRef}
              sx={{ mb: 3 }}
            />
            <Button type="submit" variant="contained" sx={{ backgroundColor: primaryColor }}>Registrar</Button>
          </form>
        </CardContent>
      </Card>

      {vigente && (
        <Box mt={6}>
          <Typography variant="h5" sx={{ mb: 3, color: primaryColor, fontWeight: 600 }}>Versión Vigente</Typography>
          <Card sx={{ background: "#fff", padding: "1.5rem", borderRadius: "16px", border: `1px solid ${accentColor}` }}>
            <Typography>{vigente.contenido}</Typography>
            <Typography variant="caption" sx={{ color: "gray" }}>
              Fecha: {new Date(vigente.fecha_creacion).toLocaleDateString("es-MX")}
            </Typography>
          </Card>
        </Box>
      )}

      <Box mt={6}>
        <Typography variant="h5" sx={{ mb: 3, color: primaryColor, fontWeight: 600 }}>Historial</Typography>
        <TableContainer component={Paper} sx={{ borderRadius: "16px", border: `1px solid ${accentColor}` }}>
          <Table>
            <TableHead sx={{ background: `linear-gradient(90deg, ${primaryColor} 0%, ${secondaryColor} 100%)` }}>
              <TableRow>
                <TableCell sx={{ ...headerStyle, width: "60%" }}>Contenido</TableCell>
                <TableCell sx={{ ...headerStyle, width: "20%" }}>Fecha</TableCell>
                <TableCell sx={{ ...headerStyle, width: "20%" }}>Acción</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {datosPaginados.map((item) => (
                <TableRow key={item.id} component={motion.tr} whileHover={{ backgroundColor: accentColor }}>
                  <TableCell sx={cellStyle}>
                    {editMode === item.id ? (
                      <TextField value={editContent} onChange={(e) => setEditContent(e.target.value)} fullWidth multiline />
                    ) : (
                      item.contenido
                    )}
                  </TableCell>
                  <TableCell sx={{ ...cellStyle, textAlign: "center" }}>{new Date(item.fecha_creacion).toLocaleDateString("es-MX")}</TableCell>
                  <TableCell sx={{ ...cellStyle, textAlign: "center" }}>
                    {editMode === item.id ? (
                      <>
                        <Button onClick={() => handleSaveEdit(item.id)} sx={{ color: primaryColor, mr: 1 }}>Guardar</Button>
                        <Button onClick={() => setEditMode(null)} sx={{ color: primaryColor }}>Cancelar</Button>
                      </>
                    ) : (
                      <>
                        <Tooltip title="Editar">
                          <IconButton onClick={() => handleEditClick(item.id, item.contenido)}><Edit /></IconButton>
                        </Tooltip>
                        <Tooltip title="Activar como vigente">
                          <IconButton onClick={() => activarComoVigente(item.id)}><CheckCircle /></IconButton>
                        </Tooltip>
                      </>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {totalPages > 1 && (
          <Box mt={3} display="flex" justifyContent="flex-start">
            <Pagination count={totalPages} page={page} onChange={(e, val) => setPage(val)} />
          </Box>
        )}
      </Box>

      <Snackbar open={alerta.open} autoHideDuration={6000} onClose={() => setAlerta({ ...alerta, open: false })} anchorOrigin={{ vertical: "bottom", horizontal: "center" }}>
        <Alert severity={alerta.severity} onClose={() => setAlerta({ ...alerta, open: false })}>{alerta.message}</Alert>
      </Snackbar>
    </Box>
  );
};

export default QuienesSomos;
