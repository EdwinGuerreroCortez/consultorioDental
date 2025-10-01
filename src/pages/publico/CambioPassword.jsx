import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  Snackbar,
  Alert,
  IconButton,
  InputAdornment,
  Fade,
  LinearProgress,
} from "@mui/material";
import {
  Visibility,
  VisibilityOff,
  Lock,
  Key,
  Save,
} from "@mui/icons-material";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import { validatePassword, evaluatePasswordStrength } from "../../utils/validations";
import { styled } from "@mui/system";

// Glass effect Paper with refined styling
const GlassPaper = styled(Paper)(({ theme }) => ({
  background: "rgba(255, 255, 255, 0.9)",
  backdropFilter: "blur(12px)",
  borderRadius: "20px",
  boxShadow: "0 10px 40px rgba(0, 48, 135, 0.15)",
  border: "1px solid rgba(255, 255, 255, 0.2)",
  padding: theme.spacing(4),
  maxWidth: "500px",
  width: "100%",
  textAlign: "center",
  transition: "transform 0.3s ease, box-shadow 0.3s ease",
  "&:hover": {
    transform: "translateY(-5px)",
    boxShadow: "0 12px 50px rgba(0, 48, 135, 0.2)",
  },
  [theme.breakpoints.down("sm")]: {
    padding: theme.spacing(3),
    borderRadius: "15px",
    maxWidth: "90%",
  },
}));

const CambioPassword = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordStrength, setPasswordStrength] = useState({ score: 0, level: "", suggestions: "" });
  const [errors, setErrors] = useState({});
  const [alert, setAlert] = useState({ open: false, message: "", severity: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [csrfToken, setCsrfToken] = useState(null); // Nuevo estado para el token CSRF
  const navigate = useNavigate();
  const location = useLocation();

  // Get token from URL
  const queryParams = new URLSearchParams(location.search);
  const token = queryParams.get("token");

  // Obtener el token CSRF al montar el componente
  useEffect(() => {
    const obtenerTokenCSRF = async () => {
      try {
        const response = await fetch("http://localhost:4000/api/get-csrf-token", {
          credentials: "include",
        });
        const data = await response.json();
        setCsrfToken(data.csrfToken); // Guardar el token en el estado
      } catch (error) {
        console.error("Error obteniendo el token CSRF:", error);
        setAlert({ open: true, message: "Error al obtener el token CSRF", severity: "error" });
      }
    };
    obtenerTokenCSRF();
  }, []);

  useEffect(() => {
    if (!token) {
      setErrors((prevErrors) => ({ ...prevErrors, token: "Token inválido o no encontrado." }));
    }
  }, [token]);

  const handlePasswordChange = (value) => {
    setPassword(value);
    const passwordError = validatePassword(value);
    setErrors((prevErrors) => ({ ...prevErrors, password: passwordError }));
    const strength = evaluatePasswordStrength(value);
    setPasswordStrength(strength);

    if (confirmPassword && value !== confirmPassword) {
      setErrors((prevErrors) => ({ ...prevErrors, confirmPassword: "Las contraseñas no coinciden." }));
    } else {
      setErrors((prevErrors) => ({ ...prevErrors, confirmPassword: "" }));
    }
  };

  const handleConfirmPasswordChange = (value) => {
    setConfirmPassword(value);
    if (password !== value) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        confirmPassword: "Las contraseñas no coinciden.",
      }));
    } else {
      setErrors((prevErrors) => ({ ...prevErrors, confirmPassword: "" }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!csrfToken) {
      setAlert({ open: true, message: "Error: Token CSRF no disponible", severity: "error" });
      return;
    }

    if (errors.password || errors.confirmPassword || password !== confirmPassword || !token) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        confirmPassword: password !== confirmPassword ? "Las contraseñas no coinciden." : "",
      }));
      return;
    }

    try {
      await axios.post(
        "http://localhost:4000/api/usuarios/cambiar-password",
        { token, nuevaPassword: password },
        {
          headers: {
            "X-XSRF-TOKEN": csrfToken,
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );
      setAlert({
        open: true,
        message: "Contraseña cambiada con éxito.",
        severity: "success",
      });
      setTimeout(() => navigate("/login"), 3000);
    } catch (error) {
      setAlert({
        open: true,
        message: error.response?.data?.mensaje || "Error al cambiar la contraseña.",
        severity: "error",
      });
    }
  };

  const handleCloseAlert = () => {
    setAlert({ ...alert, open: false });
  };

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        background: "linear-gradient(135deg, #e6f0fa 0%, #f5f7fa 100%)",
        fontFamily: "'Poppins', sans-serif",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Subtle Background Texture */}
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          backgroundImage:
            "url('https://www.transparenttextures.com/patterns/white-diamond.png')",
          opacity: 0.05,
          zIndex: 1,
        }}
      />

      <Fade in timeout={600}>
        <Box sx={{ position: "relative", zIndex: 2 }}>
          <GlassPaper elevation={0}>
            <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", mb: 4 }}>
              <Key sx={{ fontSize: { xs: 32, md: 40 }, color: "#003087", mr: 1 }} />
              <Typography
                variant="h4"
                sx={{
                  color: "#003087",
                  fontWeight: 700,
                  fontSize: { xs: "1.5rem", sm: "2rem", md: "2.5rem" },
                  fontFamily: "'Poppins', sans-serif",
                  letterSpacing: "0.5px",
                }}
              >
                Cambiar Contraseña
              </Typography>
            </Box>

            <form onSubmit={handleSubmit}>
              <TextField
                label="Nueva Contraseña"
                type={showPassword ? "text" : "password"}
                fullWidth
                variant="outlined"
                margin="normal"
                value={password}
                onChange={(e) => handlePasswordChange(e.target.value)}
                error={!!errors.password}
                helperText={errors.password}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Lock sx={{ color: "#003087" }} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                        sx={{ color: "#003087" }}
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    "& fieldset": {
                      borderColor: "rgba(0, 87, 183, 0.5)",
                      borderWidth: "2px",
                    },
                    "&:hover fieldset": { borderColor: "#0057b7" },
                    "&.Mui-focused fieldset": { borderColor: "#003087" },
                    backgroundColor: "rgba(255, 255, 255, 0.95)",
                    borderRadius: "12px",
                    transition: "all 0.3s ease",
                    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)",
                  },
                  "& .MuiInputLabel-root": {
                    color: "#003087",
                    fontWeight: 500,
                    fontSize: { xs: "0.9rem", md: "1rem" },
                  },
                  "& .MuiInputLabel-root.Mui-focused": { color: "#0057b7" },
                  fontFamily: "'Poppins', sans-serif",
                  marginBottom: { xs: "15px", md: "20px" },
                }}
              />

              <TextField
                label="Confirmar Nueva Contraseña"
                type={showConfirmPassword ? "text" : "password"}
                fullWidth
                variant="outlined"
                margin="normal"
                value={confirmPassword}
                onChange={(e) => handleConfirmPasswordChange(e.target.value)}
                error={!!errors.confirmPassword}
                helperText={errors.confirmPassword}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Lock sx={{ color: "#003087" }} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        edge="end"
                        sx={{ color: "#003087" }}
                      >
                        {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    "& fieldset": {
                      borderColor: "rgba(0, 87, 183, 0.5)",
                      borderWidth: "2px",
                    },
                    "&:hover fieldset": { borderColor: "#0057b7" },
                    "&.Mui-focused fieldset": { borderColor: "#003087" },
                    backgroundColor: "rgba(255, 255, 255, 0.95)",
                    borderRadius: "12px",
                    transition: "all 0.3s ease",
                    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)",
                  },
                  "& .MuiInputLabel-root": {
                    color: "#003087",
                    fontWeight: 500,
                    fontSize: { xs: "0.9rem", md: "1rem" },
                  },
                  "& .MuiInputLabel-root.Mui-focused": { color: "#0057b7" },
                  fontFamily: "'Poppins', sans-serif",
                  marginBottom: { xs: "15px", md: "20px" },
                }}
              />

              {/* Password Strength Meter */}
              <Box sx={{ marginTop: "20px", marginBottom: "25px" }}>
                <Typography
                  variant="body2"
                  sx={{
                    color: "#003087",
                    fontWeight: 500,
                    fontSize: { xs: "0.85rem", md: "1rem" },
                    marginBottom: "8px",
                  }}
                >
                  Fortaleza de la Contraseña: {passwordStrength.level}
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={(passwordStrength.score / 4) * 100}
                  sx={{
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: "#e0e0e0",
                    "& .MuiLinearProgress-bar": {
                      backgroundColor:
                        passwordStrength.score < 2
                          ? "#f44336"
                          : passwordStrength.score < 4
                          ? "#ff9800"
                          : "#4caf50",
                      transition: "width 0.3s ease-in-out",
                    },
                  }}
                />
                {passwordStrength.suggestions && (
                  <Typography
                    variant="caption"
                    sx={{
                      color: "#555",
                      fontSize: { xs: "0.75rem", md: "0.85rem" },
                      marginTop: "8px",
                      display: "block",
                      lineHeight: 1.4,
                    }}
                  >
                    {passwordStrength.suggestions}
                  </Typography>
                )}
              </Box>

              <Button
                type="submit"
                variant="contained"
                fullWidth
                disabled={!!errors.token}
                startIcon={<Save />}
                sx={{
                  marginTop: { xs: "20px", md: "30px" },
                  padding: { xs: "10px", md: "14px" },
                  background: "linear-gradient(135deg, #003087 0%, #0057b7 100%)",
                  borderRadius: "12px",
                  fontFamily: "'Poppins', sans-serif",
                  fontWeight: 600,
                  fontSize: { xs: "0.9rem", md: "1.1rem" },
                  textTransform: "none",
                  transition: "all 0.3s ease",
                  "&:hover": {
                    background: "linear-gradient(135deg, #0057b7 0%, #003087 100%)",
                    boxShadow: "0 6px 20px rgba(0, 87, 183, 0.3)",
                    transform: "translateY(-3px)",
                  },
                  "&:active": {
                    transform: "translateY(0)",
                  },
                  "&:disabled": {
                    background: "#b0bec5",
                    cursor: "not-allowed",
                  },
                }}
              >
                Guardar Nueva Contraseña
              </Button>
            </form>
          </GlassPaper>
        </Box>
      </Fade>

      {/* Alert Snackbar */}
      <Snackbar
        open={alert.open}
        autoHideDuration={6000}
        onClose={handleCloseAlert}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert onClose={handleCloseAlert} severity={alert.severity} sx={{ width: "100%" }}>
          {alert.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default CambioPassword;