// Componente actualizado de Valores con diseño unificado
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
import { Edit, Delete } from "@mui/icons-material";
import { motion } from "framer-motion";

const primaryColor = "#006d77";
const secondaryColor = "#78c1c8";
const accentColor = "#e8f4f8";
const bgGradient = "linear-gradient(135deg, #e8f4f8 0%, #ffffff 100%)";

const Valores = () => {
  const [valores, setValores] = useState([]);
  const [nuevoValor, setNuevoValor] = useState({ valor: "", descripcion: "" });
  const [csrfToken, setCsrfToken] = useState(null);
  const [alerta, setAlerta] = useState({ open: false, message: "", severity: "success" });
  const [editandoId, setEditandoId] = useState(null);
  const [editContent, setEditContent] = useState({ valor: "", descripcion: "" });
  const [pagina, setPagina] = useState(1);
  const rowsPerPage = 5;
  const editInputRef = useRef(null);

  const obtenerToken = async () => {
    try {
      const res = await fetch("https://backenddent.onrender.com/api/get-csrf-token", { credentials: "include" });
      const data = await res.json();
      setCsrfToken(data.csrfToken);
    } catch {
      setAlerta({ open: true, message: "Error al obtener token", severity: "error" });
    }
  };

  const cargarValores = async () => {
    try {
      const res = await fetch("https://backenddent.onrender.com/api/valores");
      const data = await res.json();
      setValores(data);
    } catch {
      setAlerta({ open: true, message: "Error al cargar valores", severity: "error" });
    }
  };

  useEffect(() => {
    obtenerToken();
    cargarValores();
  }, []);

  const handleChange = (e) => {
    setNuevoValor({ ...nuevoValor, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("https://backenddent.onrender.com/api/valores", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-XSRF-TOKEN": csrfToken,
        },
        credentials: "include",
        body: JSON.stringify(nuevoValor),
      });
      const data = await res.json();
      if (res.ok) {
        setAlerta({ open: true, message: "Valor creado", severity: "success" });
        setNuevoValor({ valor: "", descripcion: "" });
        cargarValores();
      } else {
        setAlerta({ open: true, message: data.mensaje || "Error", severity: "error" });
      }
    } catch {
      setAlerta({ open: true, message: "Error al crear", severity: "error" });
    }
  };

  const iniciarEdicion = (valor) => {
    setEditandoId(valor.id);
    setEditContent({ valor: valor.valor, descripcion: valor.descripcion });
  };

  const guardarEdicion = async () => {
    try {
      const res = await fetch(`https://backenddent.onrender.com/api/valores/${editandoId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "X-XSRF-TOKEN": csrfToken,
        },
        credentials: "include",
        body: JSON.stringify(editContent),
      });
      const data = await res.json();
      if (res.ok) {
        setAlerta({ open: true, message: "Valor actualizado", severity: "success" });
        setEditandoId(null);
        cargarValores();
      } else {
        setAlerta({ open: true, message: data.mensaje || "Error", severity: "error" });
      }
    } catch {
      setAlerta({ open: true, message: "Error al actualizar", severity: "error" });
    }
  };

  const eliminarValor = async (id) => {
    try {
      const res = await fetch(`https://backenddent.onrender.com/api/valores/${id}`, {
        method: "DELETE",
        headers: { "X-XSRF-TOKEN": csrfToken },
        credentials: "include",
      });
      if (res.ok) {
        setAlerta({ open: true, message: "Valor eliminado", severity: "success" });
        cargarValores();
      } else {
        setAlerta({ open: true, message: "Error al eliminar", severity: "error" });
      }
    } catch {
      setAlerta({ open: true, message: "Error al eliminar", severity: "error" });
    }
  };

  const valoresPaginados = valores.slice((pagina - 1) * rowsPerPage, pagina * rowsPerPage);

  const cellStyle = {
    fontFamily: "'Poppins', sans-serif",
    fontSize: "0.95rem",
    padding: "16px",
    borderBottom: `1px solid ${accentColor}`,
    verticalAlign: "middle",
    color: "#2d3748",
  };

  const headerStyle = {
    ...cellStyle,
    color: "#ffffff",
    fontWeight: 700,
    textAlign: "center",
    backgroundColor: primaryColor,
  };

  return (
    <Box sx={{ maxWidth: "1100px", margin: "4rem auto", padding: "0 1.5rem" }}>
      <Card sx={{ background: bgGradient, padding: "2.5rem", borderRadius: "24px" }}>
        <CardContent>
          <Typography variant="h4" sx={{ fontWeight: 700, color: primaryColor, mb: 3 }}>
            Registrar Valor
          </Typography>
          <Divider sx={{ mb: 4 }} />
          <form onSubmit={handleSubmit}>
            <TextField label="Valor" name="valor" value={nuevoValor.valor} onChange={handleChange} fullWidth required sx={{ mb: 3 }} />
            <TextField label="Descripción" name="descripcion" value={nuevoValor.descripcion} onChange={handleChange} fullWidth multiline rows={4} required sx={{ mb: 3 }} />
            <Button type="submit" variant="contained" sx={{ backgroundColor: primaryColor }}>
              Registrar
            </Button>
          </form>
        </CardContent>
      </Card>

      <Box mt={6}>
        <Typography variant="h5" sx={{ mb: 3, color: primaryColor, fontWeight: 600 }}>Valores Registrados</Typography>
        <TableContainer component={Paper} sx={{ borderRadius: "16px", boxShadow: "0 4px 20px rgba(0,0,0,0.1)", border: `1px solid ${accentColor}` }}>
          <Table>
            <TableHead sx={{ background: `linear-gradient(90deg, ${primaryColor} 0%, ${secondaryColor} 100%)` }}>
              <TableRow>
                <TableCell sx={headerStyle}>Valor</TableCell>
                <TableCell sx={headerStyle}>Descripción</TableCell>
                <TableCell sx={headerStyle}>Fecha</TableCell>
                <TableCell sx={headerStyle}>Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {valoresPaginados.length > 0 ? valoresPaginados.map((item) => (
                <TableRow key={item.id} component={motion.tr} whileHover={{ backgroundColor: accentColor }}>
                  <TableCell sx={cellStyle}>
                    {editandoId === item.id ? (
                      <TextField value={editContent.valor} onChange={(e) => setEditContent({ ...editContent, valor: e.target.value })} fullWidth />
                    ) : item.valor}
                  </TableCell>
                  <TableCell sx={cellStyle}>
                    {editandoId === item.id ? (
                      <TextField value={editContent.descripcion} onChange={(e) => setEditContent({ ...editContent, descripcion: e.target.value })} fullWidth />
                    ) : item.descripcion}
                  </TableCell>
                  <TableCell sx={{ ...cellStyle, textAlign: "center" }}>
                    {new Date(item.fecha_creacion).toLocaleDateString("es-MX")}
                  </TableCell>
                  <TableCell sx={{ ...cellStyle, textAlign: "center" }}>
                    {editandoId === item.id ? (
                      <>
                        <Button onClick={guardarEdicion} sx={{ mr: 1, color: primaryColor }}>Guardar</Button>
                        <Button onClick={() => setEditandoId(null)} sx={{ color: primaryColor }}>Cancelar</Button>
                      </>
                    ) : (
                      <>
                        <Tooltip title="Editar">
                          <IconButton onClick={() => iniciarEdicion(item)}><Edit /></IconButton>
                        </Tooltip>
                        <Tooltip title="Eliminar">
                          <IconButton onClick={() => eliminarValor(item.id)}><Delete /></IconButton>
                        </Tooltip>
                      </>
                    )}
                  </TableCell>
                </TableRow>
              )) : (
                <TableRow>
                  <TableCell colSpan={4} sx={{ ...cellStyle, textAlign: "center", color: "#999" }}>No hay valores registrados.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <Box mt={3} display="flex" justifyContent="center">
          <Pagination count={Math.ceil(valores.length / rowsPerPage)} page={pagina} onChange={(e, value) => setPagina(value)} sx={{ '& .MuiPaginationItem-root': { color: primaryColor } }} />
        </Box>
      </Box>

      <Snackbar open={alerta.open} autoHideDuration={6000} onClose={() => setAlerta({ ...alerta, open: false })} anchorOrigin={{ vertical: "bottom", horizontal: "center" }}>
        <Alert severity={alerta.severity} onClose={() => setAlerta({ ...alerta, open: false })}>
          {alerta.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Valores;
