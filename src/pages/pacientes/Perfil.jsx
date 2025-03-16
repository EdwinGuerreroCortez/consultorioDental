import React, { useEffect, useState } from "react";
import { verificarAutenticacion } from "../../utils/auth";
import {
  Card, CardContent, Typography, Grid, Avatar, CircularProgress,
  Alert, Box, Divider, Chip, Paper, Container, IconButton, Dialog,
  DialogActions, DialogContent, DialogTitle, TextField, Button, InputAdornment
} from "@mui/material";
import { motion } from "framer-motion";
import {
  Person, Phone, Mail, CalendarToday, Wc, Badge, Lock, Visibility, VisibilityOff
} from "@mui/icons-material";
import { styled } from "@mui/material/styles";
import { validatePassword, evaluatePasswordStrength } from "../../utils/validations";

// Create motion components using motion.create()
const MotionCard = motion.create(Card);
const MotionAvatar = motion.create(Avatar);
const MotionPaper = motion.create(Paper);

// Estilos con Glassmorphism + Neumorphism
const ProfileCard = styled(MotionCard)(({ theme }) => ({
  maxWidth: 850,
  margin: "4rem auto",
  borderRadius: "20px",
  padding: "2.5rem",
  backdropFilter: "blur(12px)",
  background: "rgba(255, 255, 255, 0.15)",
  boxShadow: "0px 15px 30px rgba(0,0,0,0.15)",
  border: "1px solid rgba(255, 255, 255, 0.2)",
  transition: "all 0.3s ease-in-out",
  "&:hover": {
    boxShadow: "0px 20px 40px rgba(0,0,0,0.2)",
    transform: "scale(1.02)",
  },
}));

const ProfileAvatar = styled(MotionAvatar)(({ theme }) => ({
  width: 140,
  height: 140,
  background: "linear-gradient(135deg, #FF6B6B, #5562EA)",
  border: "5px solid white",
  boxShadow: "0px 5px 15px rgba(0,0,0,0.2)",
  cursor: "pointer",
  transition: "all 0.3s ease-in-out",
  "&:hover": {
    transform: "scale(1.1)",
  },
}));

const InfoItem = styled(MotionPaper)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  gap: theme.spacing(1.5),
  padding: theme.spacing(2),
  borderRadius: "12px",
  background: "rgba(255, 255, 255, 0.8)",
  backdropFilter: "blur(5px)",
  boxShadow: "0px 5px 15px rgba(0,0,0,0.1)",
  transition: "all 0.3s ease-in-out",
  "&:hover": {
    background: "rgba(255, 255, 255, 1)",
    transform: "scale(1.05)",
    boxShadow: "0px 8px 20px rgba(0,0,0,0.2)",
  },
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPasswords((prev) => ({ ...prev, [name]: value }));

    // Validaciones
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

  const obtenerTokenCSRF = () => {
    const csrfToken = document.cookie
      .split("; ")
      .find((row) => row.startsWith("XSRF-TOKEN="))
      ?.split("=")[1];

    return csrfToken || ""; // Evita valores undefined
  };

  const handleSubmit = async () => {
    if (errors.nueva || errors.repetir || passwords.nueva !== passwords.repetir) {
      setErrors((prev) => ({
        ...prev,
        repetir: passwords.nueva !== passwords.repetir ? "Las contraseñas no coinciden." : prev.repetir,
      }));
      return;
    }

    try {
      const csrfToken = obtenerTokenCSRF();
      const response = await fetch(`http://localhost:4000/api/usuarios/cambiar-password/${perfil.id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-XSRF-TOKEN": csrfToken, // 🔹 Enviar el token CSRF en los headers
        },
        credentials: "include", // 🔹 Importante para enviar cookies CSRF
        body: JSON.stringify({
          actualPassword: passwords.actual, // 🔹 Asegurar que coincide con el backend
          nuevaPassword: passwords.nueva,
        }),
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.mensaje || "Error al cambiar la contraseña");

      setMensaje("Contraseña actualizada correctamente");
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
      try {
        const usuario = await verificarAutenticacion();
        if (!usuario || !usuario.id) {
          throw new Error("No se encontró el usuario autenticado");
        }

        const response = await fetch(`http://localhost:4000/api/usuarios/perfil/${usuario.id}`);
        if (!response.ok) {
          throw new Error("Error al obtener el perfil");
        }
        const data = await response.json();
        setPerfil(data);
      } catch (error) {
        console.error("Error:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    cargarPerfil();
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 5 }}>
        <CircularProgress size={60} thickness={4} />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert
        severity="error"
        sx={{
          mt: 3,
          maxWidth: 600,
          mx: "auto",
          borderRadius: 2,
          boxShadow: 1,
        }}
      >
        {error}
      </Alert>
    );
  }

  return (
    <Container>
      <ProfileCard initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <CardContent sx={{ p: 4, textAlign: "center" }}>
          <ProfileAvatar animate={{ rotate: 360 }} transition={{ duration: 1 }} whileHover={{ scale: 1.1 }}>
            <Person sx={{ fontSize: 70, color: "white" }} />
          </ProfileAvatar>
          <Typography
            variant="h4"
            fontWeight="bold"
            color="text.primary"
            sx={{ mt: 2 }}
          >
            {perfil.nombre} {perfil.apellido_paterno} {perfil.apellido_materno}
          </Typography>
          <Chip
            icon={<Badge />}
            label="Perfil de usuario"
            color="primary"
            variant="filled"
            sx={{ mt: 2 }}
          />
          <IconButton color="primary" onClick={() => setOpen(true)} sx={{ ml: 2 }}>
            <Lock sx={{ fontSize: 28 }} />
          </IconButton>
        </CardContent>

        <Divider sx={{ my: 3 }} />

        <Grid container spacing={2}>
          {[
            { icon: <Phone sx={{ color: "#5562EA" }} />, label: "Teléfono", value: perfil.telefono },
            { icon: <Mail sx={{ color: "#FF6B6B" }} />, label: "Email", value: perfil.email },
            {
              icon: <CalendarToday sx={{ color: "#56CCF2" }} />,
              label: "Fecha de Nacimiento",
              value: new Date(perfil.fecha_nacimiento).toLocaleDateString("es-ES", {
                day: "numeric",
                month: "long",
                year: "numeric",
              }),
            },
            { icon: <Wc sx={{ color: "#27AE60" }} />, label: "Sexo", value: perfil.sexo },
          ].map((item, index) => (
            <Grid item xs={12} md={6} key={index}>
              <InfoItem whileHover={{ scale: 1.05 }} transition={{ duration: 0.3 }} elevation={3}>
                {item.icon}
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    {item.label}
                  </Typography>
                  <Typography variant="body1" fontWeight="medium">
                    {item.value}
                  </Typography>
                </Box>
              </InfoItem>
            </Grid>
          ))}
        </Grid>
      </ProfileCard>

      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>Cambiar Contraseña</DialogTitle>
        <DialogContent>
          {mensaje && <Alert severity="info" sx={{ mb: 2 }}>{mensaje}</Alert>}

          <TextField
            label="Contraseña Actual"
            type={showPassword.actual ? "text" : "password"}
            name="actual"
            fullWidth
            margin="dense"
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
          />

          <TextField
            label="Nueva Contraseña"
            type={showPassword.nueva ? "text" : "password"}
            name="nueva"
            fullWidth
            margin="dense"
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
          />

          <TextField
            label="Repetir Nueva Contraseña"
            type={showPassword.repetir ? "text" : "password"}
            name="repetir"
            fullWidth
            margin="dense"
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
          />

          {/* Medidor de fortaleza de contraseña */}
          <Box sx={{ mt: 2 }}>
            <Typography
              variant="body2"
              color={passwordStrength.score < 2 ? "error" : passwordStrength.score < 4 ? "warning" : "success"}
              sx={{ fontWeight: "bold" }}
            >
              Fortaleza: {passwordStrength.level}
            </Typography>

            <Box sx={{ display: "flex", gap: 0.5, mt: 1 }}>
              {[0, 1, 2, 3, 4].map((i) => (
                <Box
                  key={i}
                  sx={{
                    height: "8px",
                    flex: 1,
                    borderRadius: 1,
                    backgroundColor: i <= passwordStrength.score ? "#4caf50" : "#e0e0e0",
                  }}
                ></Box>
              ))}
            </Box>

            <Typography variant="caption" color="textSecondary" sx={{ mt: 1 }}>
              {passwordStrength.suggestions}
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)} color="secondary">
            Cancelar
          </Button>
          <Button onClick={handleSubmit} color="primary" variant="contained">
            Actualizar
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Perfil;