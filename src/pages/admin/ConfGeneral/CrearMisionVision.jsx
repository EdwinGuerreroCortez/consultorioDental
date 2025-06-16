import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  TextField,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
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
} from "@mui/material";
import { CheckCircle, History, Edit } from "@mui/icons-material";
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
  const [editMode, setEditMode] = useState(null);
  const [editContent, setEditContent] = useState("");
  const rowsPerPage = 5;
  const editInputRef = useRef(null);
  const formInputRef = useRef(null);

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
    const input = formInputRef.current;
    const cursorPosition = input ? input.selectionStart : value.length;
    setFormulario((prev) => {
      const newForm = { ...prev, [name]: value };
      if (name === "contenido" && value.length < 10) {
        setErrores({ ...errores, contenido: "El contenido debe tener al menos 10 caracteres." });
      } else {
        setErrores({ ...errores, [name]: "" });
      }
      return newForm;
    });
    if (input) {
      input.selectionStart = input.selectionEnd = cursorPosition;
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
          "X-XSRF-TOKEN": csrfToken,
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

  const handleEditChange = (e) => {
    const value = e.target.value;
    const input = editInputRef.current;
    const cursorPosition = input ? input.selectionStart : value.length;
    setEditContent(value);
    if (input) {
      input.selectionStart = input.selectionEnd = cursorPosition;
    }
  };

  const handleEditClick = (id, currentContent) => {
    setEditMode(id);
    setEditContent(currentContent);
  };

  useEffect(() => {
    if (editMode && editInputRef.current) {
      editInputRef.current.focus();
      editInputRef.current.selectionStart = editInputRef.current.selectionEnd = editContent.length;
    }
  }, [editMode, editContent]);

  const handleSaveEdit = async (id) => {
    if (editContent.length < 10) {
      setAlerta({
        open: true,
        message: "El contenido debe tener al menos 10 caracteres.",
        severity: "error",
      });
      return;
    }

    try {
      const response = await fetch(`http://localhost:4000/api/mision-vision/editar/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "X-XSRF-TOKEN": csrfToken,
        },
        credentials: "include",
        body: JSON.stringify({ contenido: editContent }),
      });

      const data = await response.json();

      if (response.ok) {
        setAlerta({
          open: true,
          message: data.mensaje || "Contenido actualizado correctamente.",
          severity: "success",
        });
        setEditMode(null);
        setEditContent("");
        cargarDatos();
      } else {
        setAlerta({ open: true, message: data.mensaje || "Error al actualizar", severity: "error" });
      }
    } catch (error) {
      setAlerta({ open: true, message: "Error en la solicitud", severity: "error" });
    }
  };

  const handleCancelEdit = () => {
    setEditMode(null);
    setEditContent("");
  };

  const TablaVersiones = ({ titulo, datos, paginar = false, esVigente = false }) => {
    const datosPaginados = paginar
      ? datos.slice((pageHistorial - 1) * rowsPerPage, pageHistorial * rowsPerPage)
      : datos;

    const totalPages = paginar ? Math.ceil(datos.length / rowsPerPage) : 1;

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
      <Box sx={{ mt: 6, mb: 4 }}>
        <Typography
          variant="h5"
          sx={{
            fontWeight: 600,
            mb: 3,
            color: primaryColor,
            fontFamily: "'Poppins', sans-serif",
            textAlign: "left",
            letterSpacing: "0.02em",
          }}
        >
          {titulo}
        </Typography>
        <TableContainer
          component={Paper}
          sx={{
            borderRadius: "16px",
            boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
            background: "#ffffff",
            border: `1px solid ${accentColor}`,
            transition: "all 0.3s ease",
            "&:hover": { boxShadow: "0 6px 24px rgba(0,0,0,0.15)" },
          }}
        >
          <Table>
            <TableHead
              sx={{ background: `linear-gradient(90deg, ${primaryColor} 0%, ${secondaryColor} 100%)` }}
            >
              <TableRow>
                <TableCell sx={{ ...headerStyle, width: "15%" }}>Tipo</TableCell>
                <TableCell sx={{ ...headerStyle, width: "10%" }}>Versión</TableCell>
                <TableCell sx={{ ...headerStyle, width: "45%", textAlign: "left" }}>
                  Contenido
                </TableCell>
                <TableCell sx={{ ...headerStyle, width: "20%" }}>Fecha</TableCell>
                <TableCell sx={{ ...headerStyle, width: "10%" }}>Acción</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {datosPaginados.length > 0 ? (
                datosPaginados.map((item) => (
                  <TableRow
                    key={item.id}
                    component={motion.tr}
                    whileHover={{ backgroundColor: accentColor, transition: { duration: 0.2 } }}
                  >
                    <TableCell sx={{ ...cellStyle, textAlign: "center" }}>{item.tipo}</TableCell>
                    <TableCell sx={{ ...cellStyle, textAlign: "center" }}>{item.version}</TableCell>
                    <TableCell sx={{ ...cellStyle, textAlign: "justify", wordBreak: "break-word" }}>
                      {editMode === item.id ? (
                        <TextField
                          value={editContent}
                          onChange={handleEditChange}
                          fullWidth
                          multiline
                          rows={2}
                          inputRef={editInputRef}
                          sx={{
                            "& .MuiOutlinedInput-root": {
                              "& fieldset": { borderColor: accentColor },
                              "&:hover fieldset": { borderColor: secondaryColor },
                              "&.Mui-focused fieldset": { borderColor: primaryColor },
                            },
                          }}
                        />
                      ) : (
                        item.contenido
                      )}
                    </TableCell>
                    <TableCell sx={{ ...cellStyle, textAlign: "center" }}>
                      {new Date(item.fecha_creacion).toLocaleDateString("es-MX", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </TableCell>
                    <TableCell sx={{ ...cellStyle, textAlign: "center" }}>
                      {esVigente ? (
                        <>
                          <CheckCircle
                            sx={{ color: primaryColor, fontSize: "1.5rem", marginRight: "8px" }}
                            titleAccess="Vigente"
                          />
                          {editMode === item.id ? (
                            <>
                              <Button
                                onClick={() => handleSaveEdit(item.id)}
                                sx={{
                                  color: primaryColor,
                                  "&:hover": { color: secondaryColor },
                                  marginRight: "8px",
                                }}
                              >
                                Guardar
                              </Button>
                              <Button
                                onClick={handleCancelEdit}
                                sx={{
                                  color: primaryColor,
                                  "&:hover": { color: secondaryColor },
                                }}
                              >
                                Cancelar
                              </Button>
                            </>
                          ) : (
                            <Tooltip title="Editar" arrow>
                              <Edit
                                sx={{ color: primaryColor, fontSize: "1.5rem", cursor: "pointer" }}
                                onClick={() => handleEditClick(item.id, item.contenido)}
                              />
                            </Tooltip>
                          )}
                        </>
                      ) : (
                        <History
                          sx={{ color: primaryColor, fontSize: "1.5rem" }}
                          titleAccess="Histórico"
                        />
                      )}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    sx={{ ...cellStyle, color: "#999", textAlign: "center", py: 4 }}
                  >
                    No hay registros disponibles.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {paginar && totalPages > 1 && (
          <Box sx={{ display: "flex", justifyContent: "flex-start", mt: 3 }}>
            <Pagination
              count={totalPages}
              page={pageHistorial}
              onChange={handleChangePageHistorial}
              sx={{
                "& .MuiPaginationItem-root": {
                  color: primaryColor,
                  fontFamily: "'Poppins', sans-serif",
                  "&:hover": { backgroundColor: accentColor },
                  "&.Mui-selected": {
                    backgroundColor: primaryColor,
                    color: "#ffffff",
                    "&:hover": { backgroundColor: secondaryColor },
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
    <Box
      sx={{
        maxWidth: "1200px",
        margin: "4rem auto",
        padding: "0 1.5rem",
        minHeight: "100vh",
      }}
    >
      <Card
        component={motion.div}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        sx={{
          boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
          borderRadius: "24px",
          padding: "2.5rem",
          background: bgGradient,
          border: `1px solid ${accentColor}`,
        }}
      >
        <CardContent>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 700,
              color: primaryColor,
              mb: 3,
              fontFamily: "'Poppins', sans-serif",
              textAlign: "left",
              letterSpacing: "-0.02em",
            }}
          >
            Registrar Misión o Visión
          </Typography>

          <Divider sx={{ mb: 4, borderColor: accentColor, opacity: 0.6 }} />

          <form onSubmit={handleSubmit}>
            <FormControl
              fullWidth
              sx={{
                mb: 3,
                "& .MuiInputLabel-root": {
                  color: primaryColor,
                  fontFamily: "'Poppins', sans-serif",
                },
                "& .Mui-focused": {
                  color: primaryColor,
                },
                "& .MuiOutlinedInput-root": {
                  "& fieldset": { borderColor: accentColor },
                  "&:hover fieldset": { borderColor: secondaryColor },
                  "&.Mui-focused fieldset": { borderColor: primaryColor },
                },
              }}
            >
              <InputLabel>Tipo</InputLabel>
              <Select
                name="tipo"
                value={formulario.tipo}
                onChange={handleChange}
                label="Tipo"
                sx={{ fontFamily: "'Poppins', sans-serif" }}
              >
                <MenuItem value="mision" sx={{ fontFamily: "'Poppins', sans-serif" }}>
                  Misión
                </MenuItem>
                <MenuItem value="vision" sx={{ fontFamily: "'Poppins', sans-serif" }}>
                  Visión
                </MenuItem>
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
              inputRef={formInputRef}
              sx={{
                mb: 3,
                fontFamily: "'Poppins', sans-serif",
                "& .MuiInputLabel-root": {
                  color: primaryColor,
                  fontFamily: "'Poppins', sans-serif",
                },
                "& .Mui-focused": {
                  color: primaryColor,
                },
                "& .MuiOutlinedInput-root": {
                  "& fieldset": { borderColor: accentColor },
                  "&:hover fieldset": { borderColor: secondaryColor },
                  "&.Mui-focused fieldset": { borderColor: primaryColor },
                },
              }}
              InputProps={{
                sx: { fontFamily: "'Poppins', sans-serif", fontSize: "0.95rem" },
              }}
            />

            <Box sx={{ display: "flex", justifyContent: "flex-start" }}>
              <Button
                type="submit"
                variant="contained"
                component={motion.button}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                sx={{
                  backgroundColor: primaryColor,
                  color: "#fff",
                  fontWeight: 600,
                  px: 5,
                  py: 1.5,
                  borderRadius: "12px",
                  textTransform: "none",
                  fontFamily: "'Poppins', sans-serif",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                  "&:hover": {
                    backgroundColor: secondaryColor,
                    boxShadow: "0 6px 16px rgba(0,0,0,0.2)",
                  },
                }}
              >
                Registrar
              </Button>
            </Box>
          </form>
        </CardContent>
      </Card>

      <TablaVersiones titulo="Misión y Visión Vigentes" datos={vigentes} esVigente />
      <TablaVersiones titulo="Historial de Versiones" datos={historial} paginar />

      <Snackbar
        open={alerta.open}
        autoHideDuration={6000}
        onClose={() => setAlerta({ ...alerta, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          severity={alerta.severity}
          onClose={() => setAlerta({ ...alerta, open: false })}
          sx={{
            fontFamily: "'Poppins', sans-serif",
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
          }}
        >
          {alerta.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default CrearMisionVision;