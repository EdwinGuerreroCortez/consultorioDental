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
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [alert, setAlert] = useState({ type: "", message: "" });
  const [errors, setErrors] = useState({ email: "", password: "" });
  const [bubbles, setBubbles] = useState([]);
  const navigate = useNavigate();

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
   useEffect(() => {
      const obtenerTokenCSRF = async () => {
        try {
          await fetch('http://localhost:4000/api/get-csrf-token', {
            credentials: 'include',
          });
        } catch (error) {
          console.error('Error obteniendo el token CSRF:', error);
        }
      };
    
      obtenerTokenCSRF();
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
        // 1️⃣ Obtener el token CSRF desde las cookies
        const csrfToken = document.cookie
          .split("; ")
          .find((row) => row.startsWith("XSRF-TOKEN="))
          ?.split("=")[1];
    
        // 2️⃣ Enviar la solicitud con el token CSRF en los headers
        const response = await axios.post(
          "http://localhost:4000/api/usuarios/login",
          { email, password },
          {
            withCredentials: true,
            headers: {
              "Content-Type": "application/json",
              "X-XSRF-TOKEN": csrfToken, // Incluir el token CSRF en la solicitud
            },
          }
        );
    
        const { nombre, tipo } = response.data;
    
        // Guardar el nombre del usuario en localStorage
        localStorage.setItem("nombreUsuario", nombre);
    
        setAlert({ type: "success", message: `Bienvenido, ${nombre}` });
    
        // Redirigir según el tipo de usuario
        setTimeout(() => {
          if (tipo === "admin") {
            navigate("/admin");
          } else if (tipo === "paciente") {
            navigate("/paciente");
          } else {
            navigate("/inicio");
          }
        }, 2000);
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
            <Typography variant="body2" sx={{ marginTop: "10px" }}>
  ¿No tienes cuenta?{" "}
  <Button
    variant="text"
    color="primary"
    onClick={() => navigate("/registro")}
    sx={{ textTransform: "none" }}
  >
    Regístrate aquí
  </Button>
</Typography>

<Typography variant="body2" sx={{ marginTop: "5px" }}>
  ¿Olvidaste tu contraseña?{" "}
  <Button
    variant="text"
    color="primary"
    onClick={() => navigate("/recuperar-password")}
    sx={{ textTransform: "none" }}
  >
    Recuperar contraseña
  </Button>
</Typography>

          </form>
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
