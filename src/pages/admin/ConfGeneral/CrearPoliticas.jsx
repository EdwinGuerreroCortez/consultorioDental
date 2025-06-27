import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  TextField,
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
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";
import { Edit, Delete } from "@mui/icons-material";

const primaryColor = "#006d77";
const secondaryColor = "#78c1c8";
const accentColor = "#e8f4f8";

const CrearPoliticas = () => {
  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [errores, setErrores] = useState({});
  const [alerta, setAlerta] = useState({ open: false, message: "", severity: "error" });
  const [csrfToken, setCsrfToken] = useState(null);
  const [ultima, setUltima] = useState(null);
  const [historial, setHistorial] = useState([]);
  const [pageHistorial, setPageHistorial] = useState(1);
  const [editMode, setEditMode] = useState(null);
  const [editData, setEditData] = useState({ titulo: "", descripcion: "" });
  const [dialogOpen, setDialogOpen] = useState(false);
  const [politicaToDelete, setPoliticaToDelete] = useState(null);
  const rowsPerPage = 5;

  useEffect(() => {
    const obtenerToken = async () => {
      try {
        const res = await fetch("http://localhost:4000/api/get-csrf-token", {
          credentials: "include",
        });
        const data = await res.json();
        setCsrfToken(data.csrfToken);
      } catch {
        setAlerta({ open: true, message: "Error al obtener CSRF token", severity: "error" });
      }
    };
    obtenerToken();
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      const res = await fetch("http://localhost:4000/api/politicas/listar");
      const data = await res.json();
      setUltima(data[0] || null);
      setHistorial(data.slice(1));
    } catch {
      setAlerta({ open: true, message: "Error al cargar políticas", severity: "error" });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (titulo.trim().length < 5 || descripcion.trim().length < 20) {
      setErrores({
        titulo: titulo.trim().length < 5 ? "Mínimo 5 caracteres" : "",
        descripcion: descripcion.trim().length < 20 ? "Mínimo 20 caracteres" : "",
      });
      return;
    }

    try {
      const res = await fetch("http://localhost:4000/api/politicas/crear", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-XSRF-TOKEN": csrfToken,
        },
        credentials: "include",
        body: JSON.stringify({ titulo, descripcion }),
      });
      const data = await res.json();
      if (res.ok) {
        setAlerta({ open: true, message: "Registrado correctamente", severity: "success" });
        setTitulo("");
        setDescripcion("");
        setErrores({});
        cargarDatos();
      } else {
        setAlerta({ open: true, message: data.mensaje || "Error", severity: "error" });
      }
    } catch {
      setAlerta({ open: true, message: "Error en la solicitud", severity: "error" });
    }
  };

  const handleEditClick = (item) => {
    setEditMode(item.id);
    setEditData({ titulo: item.titulo, descripcion: item.descripcion });
  };

  const handleSaveEdit = async (id) => {
    if (editData.titulo.trim().length < 5 || editData.descripcion.trim().length < 20) {
      setAlerta({ open: true, message: "Título o descripción demasiado cortos", severity: "error" });
      return;
    }

    try {
      const res = await fetch(`http://localhost:4000/api/politicas/editar/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "X-XSRF-TOKEN": csrfToken,
        },
        credentials: "include",
        body: JSON.stringify(editData),
      });
      const data = await res.json();
      if (res.ok) {
        setAlerta({ open: true, message: data.mensaje || "Editado correctamente", severity: "success" });
        setEditMode(null);
        cargarDatos();
      } else {
        setAlerta({ open: true, message: data.mensaje || "Error", severity: "error" });
      }
    } catch {
      setAlerta({ open: true, message: "Error al editar", severity: "error" });
    }
  };

  // Abrir diálogo de confirmación para eliminar
  const handleEliminarClick = (id) => {
    setPoliticaToDelete(id);
    setDialogOpen(true);
  };

  // Confirmar eliminación
  const handleConfirmEliminar = async () => {
    try {
      const res = await fetch(`http://localhost:4000/api/politicas/eliminarPolitica/${politicaToDelete}`, {
        method: "DELETE",
        headers: {
          "X-XSRF-TOKEN": csrfToken,
        },
        credentials: "include",
      });
      const data = await res.json();
      if (res.ok) {
        setAlerta({ open: true, message: data.mensaje || "Eliminado correctamente", severity: "success" });
        cargarDatos();
      } else {
        setAlerta({ open: true, message: data.mensaje || "Error al eliminar", severity: "error" });
      }
    } catch {
      setAlerta({ open: true, message: "Error en la eliminación", severity: "error" });
    }
    setDialogOpen(false);
    setPoliticaToDelete(null);
  };

  // Cancelar eliminación
  const handleCancelEliminar = () => {
    setDialogOpen(false);
    setPoliticaToDelete(null);
  };

  const paginarHistorial = historial.slice((pageHistorial - 1) * rowsPerPage, pageHistorial * rowsPerPage);

  return (
    <Box sx={{ maxWidth: 1200, margin: "4rem auto", padding: "0 1rem" }}>
      <Card sx={{ padding: 4, borderRadius: 4, background: "#f8fbfc", border: `1px solid ${accentColor}` }}>
        <CardContent>
          <Typography variant="h4" sx={{ mb: 3, fontWeight: 700, color: primaryColor }}>
            Registrar Política de Privacidad
          </Typography>

          <form onSubmit={handleSubmit}>
            <TextField
              label="Título"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              fullWidth
              required
              error={!!errores.titulo}
              helperText={errores.titulo}
              sx={{ mb: 3 }}
            />
            <TextField
              label="Descripción"
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              multiline
              rows={6}
              fullWidth
              required
              error={!!errores.descripcion}
              helperText={errores.descripcion}
              sx={{ mb: 3 }}
            />
            <Button type="submit" variant="contained" sx={{ backgroundColor: primaryColor, color: "#fff" }}>
              Registrar
            </Button>
          </form>
        </CardContent>
      </Card>

      <Box sx={{ mt: 6 }}>
        <Typography variant="h5" sx={{ mb: 2, color: primaryColor, fontWeight: 600 }}>
          Última Política
        </Typography>
        {ultima ? (
          <Paper sx={{ padding: 3, mb: 4 }}>
            <Typography variant="h6" sx={{ color: secondaryColor }}>{ultima.titulo}</Typography>
            <Typography variant="body2" sx={{ mb: 2 }}>
              {new Date(ultima.fecha_creacion).toLocaleDateString("es-MX", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </Typography>
            <Typography variant="body1">{ultima.descripcion}</Typography>
          </Paper>
        ) : (
          <Typography>No hay políticas registradas.</Typography>
        )}

        <Typography variant="h5" sx={{ mb: 2, color: primaryColor, fontWeight: 600 }}>
          Historial de Políticas
        </Typography>
        <TableContainer component={Paper}>
          <Table>
            <TableHead sx={{ backgroundColor: primaryColor }}>
              <TableRow>
                <TableCell sx={{ color: "#fff" }}>Título</TableCell>
                <TableCell sx={{ color: "#fff" }}>Descripción</TableCell>
                <TableCell sx={{ color: "#fff" }}>Fecha</TableCell>
                <TableCell sx={{ color: "#fff" }}>Acción</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {historial.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4}>No hay historial de políticas anteriores.</TableCell>
                </TableRow>
              ) : (
                paginarHistorial.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      {editMode === item.id ? (
                        <TextField
                          value={editData.titulo}
                          onChange={(e) => setEditData({ ...editData, titulo: e.target.value })}
                          fullWidth
                        />
                      ) : (
                        item.titulo
                      )}
                    </TableCell>
                    <TableCell>
                      {editMode === item.id ? (
                        <TextField
                          value={editData.descripcion}
                          onChange={(e) => setEditData({ ...editData, descripcion: e.target.value })}
                          multiline
                          fullWidth
                          rows={2}
                        />
                      ) : (
                        item.descripcion
                      )}
                    </TableCell>
                    <TableCell>{new Date(item.fecha_creacion).toLocaleDateString("es-MX")}</TableCell>
                    <TableCell sx={{ display: "flex", gap: 1 }}>
                      {editMode === item.id ? (
                        <>
                          <Button onClick={() => handleSaveEdit(item.id)} size="small" variant="outlined">
                            Guardar
                          </Button>
                          <Button onClick={() => setEditMode(null)} size="small" color="secondary">
                            Cancelar
                          </Button>
                        </>
                      ) : (
                        <>
                          <Tooltip title="Editar">
                            <Edit
                              onClick={() => handleEditClick(item)}
                              sx={{ cursor: "pointer", color: primaryColor }}
                            />
                          </Tooltip>
                          <Tooltip title="Eliminar">
                            <Delete
                              onClick={() => handleEliminarClick(item.id)}
                              sx={{ cursor: "pointer", color: "#d32f2f" }}
                            />
                          </Tooltip>
                        </>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          <Box sx={{ display: "flex", justifyContent: "flex-start", mt: 2 }}>
            <Pagination
              count={Math.ceil(historial.length / rowsPerPage)}
              page={pageHistorial}
              onChange={(e, p) => setPageHistorial(p)}
            />
          </Box>
        </TableContainer>
      </Box>

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

      {/* Dialogo confirmación eliminar */}
      <Dialog open={dialogOpen} onClose={handleCancelEliminar}>
        <DialogTitle>Confirmar eliminación</DialogTitle>
        <DialogContent>
          <DialogContentText>
            ¿Estás seguro de que deseas eliminar esta política? Esta acción no se puede deshacer.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelEliminar} color="primary">
            Cancelar
          </Button>
          <Button onClick={handleConfirmEliminar} color="error" variant="contained">
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CrearPoliticas;
