import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  InputAdornment,
  IconButton,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import Alerts from "../../components/shared/Button"; // Componente de alerta personalizada
import axios from "axios";
import { validateEmail } from "../../utils/validations"; // Validación personalizada
import "./bubbles.css";
import { useNavigate } from "react-router-dom"; // Importar useNavigate

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [alert, setAlert] = useState({ type: "", message: "" });
  const [errors, setErrors] = useState({ email: "", password: "" });
  const [bubbles, setBubbles] = useState([]);
  const navigate = useNavigate(); // Inicializar useNavigate

  // Genera las burbujas solo una vez
  useEffect(() => {
    const generatedBubbles = Array.from({ length: 40 }).map(() => ({
      left: `${Math.random() * 100}%`,
      animationDelay: `${Math.random() * 10}s`,
      animationDuration: `${5 + Math.random() * 10}s`,
      backgroundColor: `rgba(${Math.random() * 50 + 100}, ${Math.random() * 200}, ${
        Math.random() * 150 + 100
      }, 0.7)`,
    }));
    setBubbles(generatedBubbles);
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();

    if (errors.email || errors.password || !email || !password) {
      setAlert({
        type: "error",
        message: "Por favor, corrige los errores antes de continuar.",
      });
      return;
    }

    try {
      // Solicitud al backend para autenticar al usuario
      const response = await axios.post("https://backenddent.onrender.com/api/usuarios/login", {
        email,
        password,
      });

      // Mostrar mensaje de éxito y redirigir al usuario
      setAlert({ type: "success", message: `Bienvenido, ${response.data.nombre}` });

      // Redirigir a la página de pacientes después de 2 segundos
      setTimeout(() => navigate("/paciente"), 2000);
    } catch (error) {
      setAlert({
        type: "error",
        message: error.response?.data?.mensaje || "Error al iniciar sesión.",
      });
    }

    setTimeout(() => setAlert({ type: "", message: "" }), 5000);
  };

  const handleChange = (field, value) => {
    if (field === "email") {
      setEmail(value);
      setErrors((prev) => ({
        ...prev,
        email: value.trim() === "" ? "El correo no puede estar vacío." : validateEmail(value),
      }));
    }

    if (field === "password") {
      setPassword(value);
      setErrors((prev) => ({
        ...prev,
        password: value.trim() === "" ? "La contraseña no puede estar vacía." : "",
      }));
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <Box
      sx={{
        position: "relative",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        overflow: "hidden",
        backgroundColor: "#e6f9f5",
      }}
    >
      <div className="bubbles">
        {bubbles.map((bubble, i) => (
          <div
            key={i}
            className="bubble"
            style={{
              left: bubble.left,
              animationDelay: bubble.animationDelay,
              animationDuration: bubble.animationDuration,
              backgroundColor: bubble.backgroundColor,
            }}
          ></div>
        ))}
      </div>

      <Box sx={{ position: "relative", zIndex: 2 }}>
        <Paper
          elevation={3}
          sx={{
            padding: "30px",
            maxWidth: "400px",
            width: "100%",
            textAlign: "center",
            borderRadius: "10px",
            backgroundColor: "#ffffff",
          }}
        >
          <Typography variant="h5" sx={{ marginBottom: "20px", color: "#0077b6" }}>
            Iniciar Sesión
          </Typography>
          <form onSubmit={handleLogin}>
            <TextField
              label="Correo electrónico"
              type="email"
              fullWidth
              variant="outlined"
              margin="normal"
              value={email}
              onChange={(e) => handleChange("email", e.target.value)}
              error={!!errors.email}
              helperText={errors.email}
            />
            <TextField
              label="Contraseña"
              type={showPassword ? "text" : "password"}
              fullWidth
              variant="outlined"
              margin="normal"
              value={password}
              onChange={(e) => handleChange("password", e.target.value)}
              error={!!errors.password}
              helperText={errors.password}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={togglePasswordVisibility}>
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              sx={{ marginTop: "20px", padding: "10px", backgroundColor: "#0077b6" }}
            >
              Iniciar Sesión
            </Button>
          </form>
          <Typography variant="body2" sx={{ marginTop: "20px", color: "#555" }}>
            ¿No tienes una cuenta?{" "}
            <a href="/registro" style={{ color: "#0077b6", textDecoration: "none" }}>
              Regístrate
            </a>
          </Typography>
        </Paper>
      </Box>

      {alert.type && (
        <Box sx={{ position: "fixed", bottom: "20px", left: "20px", zIndex: 1000 }}>
          {alert.type === "success" && <Alerts.SuccessAlert message={alert.message} />}
          {alert.type === "error" && <Alerts.ErrorAlert message={alert.message} />}
        </Box>
      )}
    </Box>
  );
};

export default Login;
