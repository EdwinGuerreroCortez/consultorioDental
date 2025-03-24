import React, { useEffect, useState } from "react";
import { verificarAutenticacion } from "../../utils/auth";
import {
  Card, CardContent, Typography, Grid, Avatar, CircularProgress,
  Alert, Box, Divider, Chip, Container, IconButton, Dialog,
  DialogActions, DialogContent, DialogTitle, TextField, Button, InputAdornment, LinearProgress
} from "@mui/material";
import { motion } from "framer-motion";
import {
  Person, Phone, Mail, CalendarToday, Wc, Lock, Visibility, VisibilityOff, LocalHospital
} from "@mui/icons-material";
import { styled } from "@mui/material/styles";
import { validatePassword, evaluatePasswordStrength } from "../../utils/validations";

// Motion components
const MotionCard = motion.create(Card);
const MotionAvatar = motion.create(Avatar);

// Custom Styled Components
const DentalProfileCard = styled(MotionCard)(({ theme }) => ({
  maxWidth: 1200,
  margin: "2rem auto",
  borderRadius: "20px",
  padding: "2.5rem",
  background: "linear-gradient(135deg, #ffffff 0%, #f0faff 100%)",
  boxShadow: "0 10px 30px rgba(0, 122, 255, 0.1)",
  border: "2px solid #cce7ff",
  transition: "transform 0.3s ease, box-shadow 0.3s ease",
  "&:hover": {
    transform: "translateY(-8px)",
    boxShadow: "0 15px 40px rgba(0, 122, 255, 0.2)",
  },
  [theme.breakpoints.down("sm")]: {
    margin: "1rem",
    padding: "1.5rem",
  },
}));

const DentalAvatar = styled(MotionAvatar)(({ theme }) => ({
  width: 130,
  height: 130,
  background: "linear-gradient(45deg, #007AFF 10%, #00D4FF 90%)",
  border: "5px solid #ffffff",
  boxShadow: "0 5px 15px rgba(0, 122, 255, 0.3)",
}));

const InfoTile = styled(motion(Box))(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  gap: theme.spacing(2),
  padding: theme.spacing(2),
  borderRadius: "12px",
  background: "#ffffff",
  boxShadow: "0 3px 10px rgba(0, 0, 0, 0.05)",
  transition: "all 0.3s ease",
  "&:hover": {
    background: "#f0faff",
    transform: "translateY(-3px)",
    boxShadow: "0 5px 15px rgba(0, 0, 0, 0.1)",
  },
}));

const StyledDivider = styled(Divider)(({ theme }) => ({
  margin: "2.5rem 0",
  borderColor: "#cce7ff",
  borderWidth: 1,
}));

const Perfil = () => {
  const [perfil, setPerfil] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [open, setOpen] = useState(false);
  const [passwords, setPasswords] = useState({ actual: "", nueva: "", repetir: "" });
  const [mensaje, setMensaje] = useState("");
  const [passwordStrength, setPasswordStrength] = useState({ score: 0, level: "", suggestions: "" });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState({ actual: false, nueva: false, repetir: false });
  const [csrfToken, setCsrfToken] = useState(null); // Nuevo estado para el token CSRF

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
        setError("Error al obtener el token CSRF");
      }
    };
    obtenerTokenCSRF();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPasswords((prev) => ({ ...prev, [name]: value }));

    if (name === "nueva") {
      const passwordError = validatePassword(value);
      setErrors((prev) => ({ ...prev, nueva: passwordError }));
      const strength = evaluatePasswordStrength(value);
      setPasswordStrength(strength);
    }

    if (name === "repetir") {
      setErrors((prev) => ({
        ...prev,
        repetir: value !== passwords.nueva ? "Las contraseñas no coinciden." : "",
      }));
    }
  };

  const handleSubmit = async () => {
    if (!csrfToken) {
      setMensaje("Error: Token CSRF no disponible");
      return;
    }

    if (errors.nueva || errors.repetir || passwords.nueva !== passwords.repetir) {
      setErrors((prev) => ({
        ...prev,
        repetir: passwords.nueva !== passwords.repetir ? "Las contraseñas no coinciden." : prev.repetir,
      }));
      return;
    }

    try {
      const response = await fetch(`https://backenddent.onrender.com/api/usuarios/cambiar-password/${perfil.id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-XSRF-TOKEN": csrfToken,
        },
        credentials: "include",
        body: JSON.stringify({
          actualPassword: passwords.actual,
          nuevaPassword: passwords.nueva,
        }),
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.mensaje || "Error al cambiar la contraseña");

      setMensaje("Contraseña actualizada con éxito");
      setPasswords({ actual: "", nueva: "", repetir: "" });
      setPasswordStrength({ score: 0, level: "", suggestions: "" });
      setErrors({});
      setOpen(false);
    } catch (error) {
      setMensaje(error.message);
    }
  };

  useEffect(() => {
    const cargarPerfil = async () => {
      if (!csrfToken) return; // Esperar a que el token esté disponible

      try {
        const usuario = await verificarAutenticacion();
        if (!usuario || !usuario.id) throw new Error("No se encontró el usuario autenticado");

        const response = await fetch(`https://backenddent.onrender.com/api/usuarios/perfil/${usuario.id}`, {
          headers: {
            "X-XSRF-TOKEN": csrfToken,
          },
          credentials: "include",
        });
        if (!response.ok) throw new Error("Error al obtener el perfil");
        const data = await response.json();
        setPerfil(data);
      } catch (error) {
        console.error("Error:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };
    if (csrfToken) {
      cargarPerfil();
    }
  }, [csrfToken]);

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
        <CircularProgress size={60} sx={{ color: "#007AFF" }} />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="sm">
        <Alert severity="error" sx={{ mt: 4, borderRadius: 2, boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)" }}>
          {error}
        </Alert>
      </Container>
    );
  }

  return (
    <Container sx={{ py: 4 }}>
      <DentalProfileCard
        initial={{ opacity: 0, y: 50, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.8, ease: "easeOut", type: "spring", stiffness: 100 }}
        whileHover={{ scale: 1.02 }}
      >
        <CardContent sx={{ textAlign: "center" }}>
          <DentalAvatar
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ duration: 0.7, ease: "backOut", delay: 0.2 }}
            whileHover={{ rotate: 10, scale: 1.15 }}
          >
            <LocalHospital sx={{ fontSize: 60, color: "#ffffff" }} />
          </DentalAvatar>
          <Typography
            variant="h4"
            fontWeight="bold"
            color="#007AFF"
            sx={{ mt: 2, fontFamily: "'Poppins', sans-serif" }}
          >
            {perfil.nombre} {perfil.apellido_paterno} {perfil.apellido_materno}
          </Typography>
          <Chip
            label="Paciente Dental"
            color="primary"
            sx={{ mt: 1, bgcolor: "#007AFF", color: "#fff", fontWeight: "medium" }}
          />
        </CardContent>

        <StyledDivider />

        <Grid container spacing={2}>
          {[
            { icon: <Phone sx={{ color: "#007AFF" }} />, label: "Teléfono", value: perfil.telefono },
            { icon: <Mail sx={{ color: "#00D4FF" }} />, label: "Email", value: perfil.email },
            {
              icon: <CalendarToday sx={{ color: "#007AFF" }} />,
              label: "Fecha de Nacimiento",
              value: new Date(perfil.fecha_nacimiento).toLocaleDateString("es-ES", {
                day: "numeric",
                month: "long",
                year: "numeric",
              }),
            },
            { icon: <Wc sx={{ color: "#00D4FF" }} />, label: "Sexo", value: perfil.sexo },
            { icon: <Lock sx={{ color: "#007AFF" }} />, value: "Cambiar Contraseña", onClick: () => setOpen(true) },
          ].map((item, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <InfoTile
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ scale: 1.05, rotate: 1 }}
                onClick={item.onClick}
              >
                {item.icon}
                <Box>
                  <Typography variant="subtitle2" color="text.secondary" sx={{ fontWeight: "medium" }}>
                    {item.label}
                  </Typography>
                  <Typography variant="body1" color="#333" sx={{ fontWeight: "500" }}>
                    {item.value}
                  </Typography>
                </Box>
              </InfoTile>
            </Grid>
          ))}
        </Grid>
      </DentalProfileCard>

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        PaperProps={{ sx: { borderRadius: "15px", p: 2, bgcolor: "#f0faff" } }}
      >
        <DialogTitle sx={{ fontWeight: "bold", color: "#007AFF" }}>Cambiar Contraseña</DialogTitle>
        <DialogContent>
          {mensaje && (
            <Alert severity={mensaje.includes("éxito") ? "success" : "error"} sx={{ mb: 2, borderRadius: 2 }}>
              {mensaje}
            </Alert>
          )}

          <TextField
            label="Contraseña Actual"
            type={showPassword.actual ? "text" : "password"}
            name="actual"
            fullWidth
            margin="normal"
            value={passwords.actual}
            onChange={handleChange}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => setShowPassword((prev) => ({ ...prev, actual: !prev.actual }))}>
                    {showPassword.actual ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
            sx={{ bgcolor: "#ffffff", borderRadius: 2 }}
          />

          <TextField
            label="Nueva Contraseña"
            type={showPassword.nueva ? "text" : "password"}
            name="nueva"
            fullWidth
            margin="normal"
            value={passwords.nueva}
            onChange={handleChange}
            error={!!errors.nueva}
            helperText={errors.nueva}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => setShowPassword((prev) => ({ ...prev, nueva: !prev.nueva }))}>
                    {showPassword.nueva ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
            sx={{ bgcolor: "#ffffff", borderRadius: 2 }}
          />

          <TextField
            label="Repetir Nueva Contraseña"
            type={showPassword.repetir ? "text" : "password"}
            name="repetir"
            fullWidth
            margin="normal"
            value={passwords.repetir}
            onChange={handleChange}
            error={!!errors.repetir}
            helperText={errors.repetir}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => setShowPassword((prev) => ({ ...prev, repetir: !prev.repetir }))}>
                    {showPassword.repetir ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
            sx={{ bgcolor: "#ffffff", borderRadius: 2 }}
          />

          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" color="#007AFF" sx={{ fontWeight: "medium" }}>
              Fortaleza de la contraseña: {passwordStrength.level}
            </Typography>
            <LinearProgress
              variant="determinate"
              value={(passwordStrength.score / 4) * 100}
              sx={{
                mt: 1,
                height: 8,
                borderRadius: 4,
                bgcolor: "#e0e0e0",
                "& .MuiLinearProgress-bar": {
                  bgcolor: passwordStrength.score < 2 ? "#ff4d4f" : passwordStrength.score < 4 ? "#ffeb3b" : "#4caf50",
                },
              }}
            />
            <Typography variant="caption" color="textSecondary" sx={{ mt: 1 }}>
              {passwordStrength.suggestions}
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setOpen(false)}
            sx={{ color: "#007AFF", fontWeight: "medium" }}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            sx={{ bgcolor: "#007AFF", borderRadius: 2, "&:hover": { bgcolor: "#0056b3" } }}
          >
            Actualizar
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Perfil;