import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  List,
  ListItem,
  ListItemText,
  Divider,
  Checkbox,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  CircularProgress,
  Alert,
  IconButton,
  TextField,
  Snackbar,
  Pagination,
  InputAdornment,
} from "@mui/material";
import {
  Person,
  MonetizationOn,
  AccountBalance,
  Close,
  Percent,
} from "@mui/icons-material";
import { motion, AnimatePresence } from "framer-motion";

// Función para formatear fecha sin cambiar zona horaria
const convertirFecha = (fechaISO) => {
  if (!fechaISO) return "Sin definir";
  const fecha = new Date(fechaISO);
  const dia = fecha.getUTCDate();
  const mes = fecha.getUTCMonth() + 1;
  const anio = fecha.getUTCFullYear();
  let horas = fecha.getUTCHours();
  const minutos = fecha.getUTCMinutes().toString().padStart(2, "0");
  const periodo = horas >= 12 ? "PM" : "AM";
  horas = horas % 12 || 12;
  const meses = [
    "enero", "febrero", "marzo", "abril", "mayo", "junio",
    "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"
  ];
  const mesNombre = meses[mes - 1];
  return `${dia} de ${mesNombre} de ${anio}, ${horas}:${minutos} ${periodo}`;
};

const ListaPacientesTratamiento = () => {
  const [pacientes, setPacientes] = useState([]);
  const [tratamientoSeleccionado, setTratamientoSeleccionado] = useState(null);
  const [loadingDetalle, setLoadingDetalle] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);

  const [citasSeleccionadas, setCitasSeleccionadas] = useState([]);
  const [metodoPago, setMetodoPago] = useState("");
  const [descuentoPorc, setDescuentoPorc] = useState(0); // <<--- NUEVO

  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState("a-z");
  const [csrfToken, setCsrfToken] = useState(null);
  const [alerta, setAlerta] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const [currentPage, setCurrentPage] = useState(1);
  const pacientesPorPagina = 12;

  // CSRF
  useEffect(() => {
    const obtenerTokenCSRF = async () => {
      try {
        const response = await fetch("http://localhost:4000/api/get-csrf-token", {
          credentials: "include",
        });
        const data = await response.json();
        setCsrfToken(data.csrfToken);
      } catch (error) {
        console.error("Error obteniendo el token CSRF:", error);
        setAlerta({
          open: true,
          message: "Error al obtener el token CSRF",
          severity: "error",
        });
      }
    };
    obtenerTokenCSRF();
  }, []);

  // Pacientes
  useEffect(() => {
    const obtenerPacientes = async () => {
      if (!csrfToken) return;
      try {
        const response = await axios.get(
          "http://localhost:4000/api/pagos/pacientes-con-tratamiento",
          {
            headers: { "X-XSRF-TOKEN": csrfToken },
            withCredentials: true,
          }
        );
        setPacientes(response.data);
      } catch (error) {
        console.error("Error al obtener pacientes:", error);
        setAlerta({
          open: true,
          message: "Error al cargar los pacientes",
          severity: "error",
        });
      }
    };
    obtenerPacientes();
  }, [csrfToken]);

  // Filtro + orden
  const filteredAndSortedPacientes = pacientes
    .filter((paciente) =>
      paciente.nombre_completo
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      const nameA = a.nombre_completo.toLowerCase();
      const nameB = b.nombre_completo.toLowerCase();
      return sortOrder === "a-z"
        ? nameA.localeCompare(nameB)
        : nameB.localeCompare(nameA);
    });

  // Paginación
  const totalPaginas = Math.ceil(
    filteredAndSortedPacientes.length / pacientesPorPagina
  );
  const pacientesPaginados = filteredAndSortedPacientes.slice(
    (currentPage - 1) * pacientesPorPagina,
    currentPage * pacientesPorPagina
  );

  const manejarClickPaciente = async (id) => {
    setLoadingDetalle(true);
    setCitasSeleccionadas([]);
    setMetodoPago("");
    setDescuentoPorc(0); // reset descuento al abrir
    setPaymentStatus(null);

    try {
      const res = await axios.get(
        `http://localhost:4000/api/tratamientos-pacientes/citas-por-tratamiento/${id}`,
        {
          headers: { "X-XSRF-TOKEN": csrfToken },
          withCredentials: true,
        }
      );

      // ordenar citas por fecha asc
      const citasOrdenadas = res.data.citas
        ? [...res.data.citas].sort((a, b) => {
          if (!a.fecha_hora) return 1;
          if (!b.fecha_hora) return -1;
          return new Date(a.fecha_hora) - new Date(b.fecha_hora);
        })
        : [];

      setTratamientoSeleccionado({ ...res.data, citas: citasOrdenadas });
      setOpenDialog(true);
    } catch (error) {
      console.error("Error al obtener detalles del tratamiento:", error);
      setAlerta({
        open: true,
        message: "Error al cargar los detalles del tratamiento",
        severity: "error",
      });
    } finally {
      setLoadingDetalle(false);
    }
  };

  const handleToggleCita = (id) => {
    setCitasSeleccionadas((prev) =>
      prev.includes(id)
        ? prev.filter((cita) => cita !== id)
        : [...prev, id]
    );
  };

  // Subtotal bruto SIN descuento
  const subtotalSeleccionado = tratamientoSeleccionado?.citas
    ?.filter((cita) => citasSeleccionadas.includes(cita.cita_id))
    ?.reduce((acc, cita) => acc + parseFloat(cita.monto), 0) || 0;

  // Validamos el porcentaje (0 a 100)
  const porcValido =
    isNaN(descuentoPorc) || descuentoPorc < 0
      ? 0
      : descuentoPorc > 100
        ? 100
        : descuentoPorc;

  // Valor descuento en $
  const descuentoCalculado = (subtotalSeleccionado * porcValido) / 100;

  // Total final después del descuento
  const totalConDescuento = (subtotalSeleccionado - descuentoCalculado)
    .toFixed(2);

  const handlePagar = async () => {
    if (
      citasSeleccionadas.length === 0 ||
      !metodoPago ||
      !csrfToken
    ) {
      setAlerta({
        open: true,
        message: "Seleccione citas y método de pago",
        severity: "warning",
      });
      return;
    }

    setPaymentLoading(true);

    try {
      // IDs de pago que quieres cerrar/pagar
      const pagosSeleccionados = tratamientoSeleccionado?.citas
        ?.filter((cita) => citasSeleccionadas.includes(cita.cita_id))
        ?.map((cita) => cita.pago_id);

      // Fecha/hora local formateada (zona MX)
      const ahora = new Date();
      const fechaLocal = new Date(
        ahora.getTime() - ahora.getTimezoneOffset() * 60000
      )
        .toISOString()
        .slice(0, 19)
        .replace("T", " ");

      // ⬇⬇ ESTA ES LA DATA QUE LE MANDAS AL BACKEND ⬇⬇
      const paymentData = {
        ids: pagosSeleccionados,
        metodo: metodoPago,
        fecha_pago: fechaLocal,
        descuento_porcentaje: porcValido,       // <<--- NUEVO
        subtotal: subtotalSeleccionado,         // para referencia/auditoría
        total_final: parseFloat(totalConDescuento), // lo que realmente pagó
      };

      const response = await axios.put(
        "http://localhost:4000/api/pagos/actualizar-pagos",
        paymentData,
        {
          headers: {
            "Content-Type": "application/json",
            "X-XSRF-TOKEN": csrfToken,
          },
          withCredentials: true,
        }
      );

      setPaymentStatus("success");
      setAlerta({
        open: true,
        message: "Pago registrado exitosamente",
        severity: "success",
      });

      // refrescar la lista de pacientes (para reflejar pagos liquidados)
      const refreshResponse = await axios.get(
        "http://localhost:4000/api/pagos/pacientes-con-tratamiento",
        {
          headers: { "X-XSRF-TOKEN": csrfToken },
          withCredentials: true,
        }
      );
      setPacientes(refreshResponse.data);

      // cerrar modal luego de un ratito
      setTimeout(() => {
        setOpenDialog(false);
        setPaymentStatus(null);
      }, 2000);
    } catch (error) {
      console.error(
        "Error al registrar el pago:",
        error.response ? error.response.data : error.message
      );
      setPaymentStatus("error");
      setAlerta({
        open: true,
        message: "Error al procesar el pago",
        severity: "error",
      });
    } finally {
      setPaymentLoading(false);
    }
  };

  const cerrarAlerta = () =>
    setAlerta({ ...alerta, open: false });

  return (
    <Box
      sx={{
        p: 3,
        fontFamily: "'Poppins', sans-serif",
        backgroundColor: "#f9fdfd",
      }}
    >
      {/* Buscador y orden */}
      <Box
        sx={{
          mb: 3,
          display: "flex",
          gap: 2,
          alignItems: "center",
          flexWrap: "wrap",
        }}
      >
        <TextField
          label="Buscar paciente"
          variant="outlined"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1);
          }}
          sx={{
            flex: 1,
            minWidth: 200,
            "& .MuiOutlinedInput-root": {
              borderRadius: 2,
              "& fieldset": { borderColor: "#006d77" },
              "&:hover fieldset": { borderColor: "#005c66" },
            },
          }}
          InputProps={{
            sx: { color: "#006d77" },
          }}
          InputLabelProps={{
            sx: { color: "#006d77" },
          }}
        />
        <FormControl sx={{ minWidth: 120 }}>
          <InputLabel sx={{ color: "#006d77" }}>Ordenar</InputLabel>
          <Select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            label="Ordenar"
            sx={{
              "& .MuiOutlinedInput-notchedOutline": {
                borderColor: "#006d77",
              },
              "&:hover .MuiOutlinedInput-notchedOutline": {
                borderColor: "#005c66",
              },
            }}
          >
            <MenuItem value="a-z">A-Z</MenuItem>
            <MenuItem value="z-a">Z-A</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* Grid de pacientes */}
      {filteredAndSortedPacientes.length === 0 ? (
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
          <Typography
            variant="h6"
            sx={{
              color: "#03445e",
              fontWeight: 500,
              textAlign: "center",
            }}
          >
            No hay pacientes con tratamiento activo.
          </Typography>
        </Box>
      ) : (
        <>
          <Grid container spacing={3}>
            {pacientesPaginados.map((paciente, index) => (
              <Grid
                item
                xs={12}
                sm={6}
                md={4}
                lg={3}
                key={paciente.tratamiento_paciente_id}
              >
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.5,
                    ease: "easeOut",
                    delay: index * 0.1,
                  }}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() =>
                    manejarClickPaciente(paciente.tratamiento_paciente_id)
                  }
                  style={{ cursor: "pointer" }}
                >
                  <Card
                    sx={{
                      borderRadius: 4,
                      boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                      p: 2,
                      background: "#ffffff",
                      border: "1px solid #e0f7fa",
                      height: 200,
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <CardContent sx={{ textAlign: "center" }}>
                      <Avatar
                        sx={{
                          bgcolor: "#e0f7fa",
                          width: 56,
                          height: 56,
                          mx: "auto",
                          mb: 2,
                        }}
                      >
                        <Person
                          sx={{ fontSize: 30, color: "#006d77" }}
                        />
                      </Avatar>
                      <Typography
                        variant="subtitle1"
                        sx={{
                          fontWeight: "bold",
                          color: "#006d77",
                        }}
                      >
                        {paciente.nombre_completo}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{ color: "#78909c", mt: 0.5 }}
                      >
                        Tipo de paciente:{" "}
                        <strong>{paciente.tipo_paciente}</strong>
                      </Typography>
                    </CardContent>
                  </Card>
                </motion.div>
              </Grid>
            ))}
          </Grid>

          {/* paginación */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              mt: 3,
            }}
          >
            <Pagination
              count={totalPaginas}
              page={currentPage}
              onChange={(event, value) => setCurrentPage(value)}
              color="primary"
              sx={{
                "& .MuiPaginationItem-root": {
                  color: "#006d77",
                  "&.Mui-selected": {
                    backgroundColor: "#006d77",
                    color: "#fff",
                  },
                },
              }}
            />
          </Box>
        </>
      )}

      {/* DIALOG DETALLE / COBRO */}
      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        fullWidth
        maxWidth="sm"
        PaperProps={{
          sx: {
            borderRadius: 4,
            backgroundColor: "#ffffff",
            border: "1px solid #e0f7fa",
            boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
            fontFamily: "'Poppins', sans-serif",
          },
        }}
      >
        <DialogTitle
          sx={{
            bgcolor: "#e0f7fa",
            color: "#006d77",
            fontWeight: "bold",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          Detalle del Tratamiento
          <IconButton
            onClick={() => setOpenDialog(false)}
            sx={{ color: "#006d77" }}
            aria-label="Cerrar diálogo"
          >
            <Close />
          </IconButton>
        </DialogTitle>

        <DialogContent dividers sx={{ p: 3 }}>
          {loadingDetalle ? (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                py: 4,
              }}
            >
              <CircularProgress sx={{ color: "#006d77" }} />
            </Box>
          ) : tratamientoSeleccionado ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              {/* Nombre del tratamiento */}
              <Typography
                variant="h6"
                sx={{
                  color: "#006d77",
                  mb: 2,
                  fontWeight: 600,
                }}
              >
                {tratamientoSeleccionado.nombre_tratamiento}
              </Typography>

              {/* Lista de citas */}
              <List
                sx={{
                  maxHeight: 300,
                  overflowY: "auto",
                  mb: 3,
                }}
              >
                {tratamientoSeleccionado.citas.map((cita) => (
                  <React.Fragment key={cita.cita_id}>
                    <ListItem
                      alignItems="flex-start"
                      sx={{
                        opacity:
                          cita.estado_pago !== "pendiente" ? 0.5 : 1,
                        bgcolor: citasSeleccionadas.includes(
                          cita.cita_id
                        )
                          ? "#e0f7fa"
                          : "transparent",
                        borderRadius: 2,
                        mb: 1,
                        transition: "background-color 0.2s",
                      }}
                    >
                      {cita.estado_pago === "pendiente" ? (
                        <Checkbox
                          edge="start"
                          checked={citasSeleccionadas.includes(
                            cita.cita_id
                          )}
                          onChange={() =>
                            handleToggleCita(cita.cita_id)
                          }
                          sx={{
                            color: "#006d77",
                            "&.Mui-checked": {
                              color: "#006d77",
                            },
                          }}
                          inputProps={{
                            "aria-label": `Seleccionar cita ${cita.cita_id}`,
                          }}
                        />
                      ) : (
                        <Box sx={{ width: 40 }} />
                      )}

                      <ListItemText
                        primary={
                          <Typography
                            sx={{
                              fontWeight: "bold",
                              color: "#03445e",
                            }}
                          >
                            Fecha:{" "}
                            {convertirFecha(cita.fecha_hora)}
                          </Typography>
                        }
                        secondary={
                          <Box sx={{ color: "#555", mt: 1 }}>
                            <Typography variant="body2">
                              <strong>Monto:</strong> $
                              {cita.monto}
                            </Typography>
                            <Typography variant="body2">
                              <strong>Estado:</strong>{" "}
                              {cita.estado_pago}
                            </Typography>
                            <Typography variant="body2">
                              <strong>Comentario:</strong>{" "}
                              {cita.comentario ||
                                "Sin comentarios"}
                            </Typography>
                          </Box>
                        }
                      />
                    </ListItem>
                    <Divider sx={{ bgcolor: "#e0f7fa" }} />
                  </React.Fragment>
                ))}
              </List>

              {/* === DESCUENTO Y RESUMEN === */}
              <Box
                sx={{
                  bgcolor: "#f5f9fa",
                  p: 2,
                  borderRadius: 2,
                  mb: 3,
                }}
              >
                <Typography
                  variant="subtitle1"
                  sx={{
                    color: "#006d77",
                    fontWeight: 600,
                    mb: 1,
                  }}
                >
                  Descuentos y resumen
                </Typography>

                {/* Subtotal */}
                <Typography
                  variant="body2"
                  sx={{ color: "#555" }}
                >
                  Subtotal seleccionado: $
                  {subtotalSeleccionado.toFixed(2)}
                </Typography>

                {/* Campo de descuento en % */}
                <TextField
                  label="Descuento (%)"
                  type="number"
                  value={descuentoPorc}
                  onChange={(e) => {
                    const v = parseFloat(e.target.value);
                    setDescuentoPorc(
                      isNaN(v) ? 0 : v
                    );
                  }}
                  InputProps={{
                    inputProps: {
                      min: 0,
                      max: 100,
                      step: "0.5",
                    },
                    startAdornment: (
                      <InputAdornment position="start">
                        <Percent
                          sx={{ color: "#006d77" }}
                        />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    mt: 2,
                    mb: 1,
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 2,
                      "& fieldset": {
                        borderColor: "#006d77",
                      },
                      "&:hover fieldset": {
                        borderColor: "#005c66",
                      },
                    },
                    "& .MuiInputLabel-root": {
                      color: "#006d77",
                      "&.Mui-focused": {
                        color: "#006d77",
                      },
                    },
                  }}
                />

                {/* Descuento calculado */}
                <Typography
                  variant="body2"
                  sx={{ color: "#555" }}
                >
                  Descuento aplicado: -$
                  {descuentoCalculado.toFixed(2)} (
                  {porcValido}%)
                </Typography>

                {/* Método de pago */}
                <FormControl fullWidth sx={{ mt: 2 }}>
                  <InputLabel
                    sx={{ color: "#006d77" }}
                  >
                    Método de pago
                  </InputLabel>
                  <Select
                    value={metodoPago}
                    onChange={(e) =>
                      setMetodoPago(e.target.value)
                    }
                    label="Método de pago"
                    sx={{
                      "& .MuiOutlinedInput-notchedOutline":
                      {
                        borderColor:
                          "#006d77",
                      },
                      "&:hover .MuiOutlinedInput-notchedOutline":
                      {
                        borderColor:
                          "#005c66",
                      },
                    }}
                  >
                    <MenuItem value="efectivo">
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                        }}
                      >
                        <MonetizationOn
                          sx={{
                            color: "#006d77",
                          }}
                        />
                        Efectivo
                      </Box>
                    </MenuItem>
                    <MenuItem value="transferencia">
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                        }}
                      >
                        <AccountBalance
                          sx={{
                            color: "#006d77",
                          }}
                        />
                        Transferencia
                      </Box>
                    </MenuItem>
                  </Select>
                </FormControl>

                {/* Total final */}
                <Typography
                  variant="h6"
                  sx={{
                    color: "#006d77",
                    fontWeight: "bold",
                    mt: 2,
                  }}
                >
                  Total a pagar: $
                  {totalConDescuento}
                </Typography>
              </Box>

              {/* Mensaje de estado pago */}
              <AnimatePresence>
                {paymentStatus && (
                  <motion.div
                    initial={{
                      opacity: 0,
                      y: 10,
                    }}
                    animate={{
                      opacity: 1,
                      y: 0,
                    }}
                    exit={{
                      opacity: 0,
                      y: 10,
                    }}
                    transition={{
                      duration: 0.3,
                    }}
                  >
                    <Alert
                      severity={
                        paymentStatus
                      }
                      sx={{ mb: 2 }}
                    >
                      {paymentStatus ===
                        "success"
                        ? "Pago registrado exitosamente."
                        : "Hubo un error al procesar el pago."}
                    </Alert>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Botón confirmar pago */}
              <motion.div
                whileHover={{
                  scale: 1.02,
                }}
                whileTap={{
                  scale: 0.98,
                }}
              >
                <Button
                  variant="contained"
                  fullWidth
                  onClick={handlePagar}
                  disabled={
                    citasSeleccionadas.length ===
                    0 ||
                    !metodoPago ||
                    paymentLoading
                  }
                  sx={{
                    bgcolor: "#006d77",
                    color: "#fff",
                    ":hover": {
                      bgcolor: "#005c66",
                    },
                    ":disabled": {
                      bgcolor:
                        "#b0bec5",
                      cursor:
                        "not-allowed",
                    },
                    borderRadius: 2,
                    py: 1.5,
                    fontWeight: "bold",
                    boxShadow:
                      "0 2px 8px rgba(0,0,0,0.2)",
                  }}
                >
                  {paymentLoading ? (
                    <CircularProgress
                      size={24}
                      sx={{ color: "#fff" }}
                    />
                  ) : (
                    "Confirmar pago"
                  )}
                </Button>
              </motion.div>
            </motion.div>
          ) : (
            <Typography>
              No se pudo cargar el tratamiento.
            </Typography>
          )}
        </DialogContent>
      </Dialog>

      {/* Snackbar global */}
      <Snackbar
        open={alerta.open}
        autoHideDuration={6000}
        onClose={cerrarAlerta}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "left",
        }}
      >
        <Alert
          onClose={cerrarAlerta}
          severity={alerta.severity}
          sx={{ width: "100%" }}
        >
          {alerta.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ListaPacientesTratamiento;
