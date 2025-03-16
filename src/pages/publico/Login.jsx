import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  InputAdornment,
  IconButton,
  Grid,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import {
  LocalHospital,
  HealthAndSafety,
  MedicalServices,
  ArrowBack,
} from "@mui/icons-material";
import Alerts from "../../components/shared/Button"; // Asegúrate de que esta importación sea correcta
import axios from "axios";
import { validateEmail } from "../../utils/validations";
import "./bubbles.css";
import { useNavigate } from "react-router-dom";
import { styled, keyframes } from "@mui/system";

// Animación para íconos de fondo
const floatAnimation = keyframes`
  0% { transform: translateY(0); }
  50% { transform: translateY(-20px); }
  100% { transform: translateY(0); }
`;

// Estilo personalizado para el Paper con efecto de vidrio esmerilado
const GlassPaper = styled(Paper)(({ theme }) => ({
  background: "rgba(255, 255, 255, 0.85)",
  backdropFilter: "blur(10px)",
  borderRadius: "20px",
  boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.2)",
  border: "1px solid rgba(255, 255, 255, 0.18)",
  padding: theme.spacing(3),
  maxWidth: "550px",
  width: "100%",
  textAlign: "center",
  [theme.breakpoints.down("sm")]: {
    padding: theme.spacing(2),
    borderRadius: "15px",
    maxWidth: "90%", // Más compacto en móviles
  },
}));

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [alert, setAlert] = useState({ type: "", message: "" });
  const [errors, setErrors] = useState({ email: "", password: "" });
  const [bubbles, setBubbles] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const generatedBubbles = Array.from({ length: 20 }).map(() => ({
      left: `${Math.random() * 100}%`,
      animationDelay: `${Math.random() * 10}s`,
      animationDuration: `${5 + Math.random() * 10}s`,
      backgroundColor: `rgba(0, 87, 183, 0.3)`,
    }));
    setBubbles(generatedBubbles);
  }, []);

  useEffect(() => {
    const obtenerTokenCSRF = async () => {
      try {
        await fetch("http://localhost:4000/api/get-csrf-token", {
          credentials: "include",
        });
      } catch (error) {
        console.error("Error obteniendo el token CSRF:", error);
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
      const csrfToken = document.cookie
        .split("; ")
        .find((row) => row.startsWith("XSRF-TOKEN="))
        ?.split("=")[1];

      const response = await axios.post(
        "http://localhost:4000/api/usuarios/login",
        { email, password },
        {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
            "X-XSRF-TOKEN": csrfToken,
          },
        }
      );

      const { nombre, tipo } = response.data;
      localStorage.setItem("nombreUsuario", nombre);
      setAlert({ type: "success", message: `Bienvenido, ${nombre}` });

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

  // Function to go back to the previous page
  const handleGoBack = () => {
    navigate(-1); // This navigates to the previous page in history
  };

  return (
    <Box
      sx={{
        position: "relative",
        minHeight: "100vh",
        width: "100vw",
        overflowY: { xs: "auto", md: "hidden" },
        background: "linear-gradient(135deg, #e6f0fa 0%, #f5f7fa 100%)",
        margin: -1,
        padding: 0,
        fontFamily: "'Poppins', sans-serif",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Bubble Animation Background */}
      <Box sx={{ position: "absolute", width: "100%", height: "100%", zIndex: 0 }}>
        {bubbles.map((bubble, index) => (
          <Box
            key={index}
            className="bubble"
            sx={{
              position: "absolute",
              bottom: "-100px",
              width: { xs: "8px", sm: "15px", md: "20px" },
              height: { xs: "8px", sm: "15px", md: "20px" },
              borderRadius: "50%",
              backgroundColor: bubble.backgroundColor,
              animation: `float ${bubble.animationDuration} infinite linear`,
              animationDelay: bubble.animationDelay,
              left: bubble.left,
            }}
          />
        ))}
      </Box>

      {/* Back Button */}
      <Button
        variant="text"
        onClick={handleGoBack}
        sx={{
          position: "absolute",
          top: "20px",
          left: "20px",
          color: "#ffffff",
          textTransform: "none",
          fontFamily: "'Poppins', sans-serif",
          fontSize: { xs: "0.9rem", md: "1rem" },
          "&:hover": {
            color: "#ffffff",
          },
          zIndex: 10,
        }}
        startIcon={<ArrowBack />}
      >
        Regresar
      </Button>

      {/* Main Content */}
      <Grid
        container
        sx={{
          minHeight: "100vh",
          width: "100vw",
          zIndex: 2,
          margin: 0,
          padding: { xs: "10px", md: 0 },
          flexDirection: { xs: "column", md: "row" },
          alignItems: { xs: "center", md: "stretch" },
          justifyContent: { xs: "flex-start", md: "center" },
        }}
      >
        {/* Left Side - Description */}
        <Grid
          item
          xs={12}
          md={5}
          sx={{
            background: "linear-gradient(135deg, #003087 0%, #0057b7 100%)",
            color: "#fff",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            padding: { xs: "20px", sm: "30px", md: "40px" },
            textAlign: "center",
            height: { xs: "auto", md: "100vh" },
            minHeight: { xs: "30vh", md: "100vh" },
            position: "relative",
            overflow: "hidden",
          }}
        >
          <Box
            sx={{
              position: "absolute",
              top: "10%",
              left: "10%",
              opacity: 0.1,
              color: "#fff",
              animation: `${floatAnimation} 6s ease-in-out infinite`,
            }}
          >
            <LocalHospital sx={{ fontSize: { xs: 40, sm: 100, md: 150 } }} />
          </Box>
          <Box
            sx={{
              position: "absolute",
              bottom: "10%",
              right: "10%",
              opacity: 0.1,
              color: "#fff",
              animation: `${floatAnimation} 8s ease-in-out infinite`,
            }}
          >
            <HealthAndSafety sx={{ fontSize: { xs: 40, sm: 100, md: 150 } }} />
          </Box>

          <Typography
            variant="h3"
            sx={{
              fontWeight: 700,
              mb: { xs: 1, sm: 2 },
              fontSize: { xs: "1.5rem", sm: "2rem", md: "3.5rem" },
              fontFamily: "'Poppins', sans-serif",
              textShadow: "2px 2px 4px rgba(0, 0, 0, 0.2)",
            }}
          >
            Consultorio Dental Velázquez
          </Typography>
          <Typography
            variant="body1"
            sx={{
              mb: { xs: 2, sm: 4 },
              maxWidth: "450px",
              fontSize: { xs: "0.9rem", sm: "1rem", md: "1.3rem" },
              fontFamily: "'Poppins', sans-serif",
              lineHeight: 1.6,
            }}
          >
            Tu clínica dental de confianza. Ofrecemos los mejores servicios para cuidar tu sonrisa, desde limpiezas hasta tratamientos avanzados. ¡Inicia sesión para gestionar tus citas!
          </Typography>
          <Box sx={{ display: "flex", gap: { xs: 1, sm: 2 } }}>
            <LocalHospital
              sx={{
                fontSize: { xs: 20, sm: 30, md: 40 },
                color: "#fff",
                transition: "transform 0.3s ease",
                "&:hover": { transform: "scale(1.2)" },
              }}
            />
            <HealthAndSafety
              sx={{
                fontSize: { xs: 20, sm: 30, md: 40 },
                color: "#fff",
                transition: "transform 0.3s ease",
                "&:hover": { transform: "scale(1.2)" },
              }}
            />
            <MedicalServices
              sx={{
                fontSize: { xs: 20, sm: 30, md: 40 },
                color: "#fff",
                transition: "transform 0.3s ease",
                "&:hover": { transform: "scale(1.2)" },
              }}
            />
          </Box>
        </Grid>

        {/* Right Side - Login Form */}
        <Grid
          item
          xs={12}
          md={7}
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: { xs: "flex-start", md: "center" },
            padding: { xs: "20px", md: "40px" },
            backgroundColor: "transparent",
            height: { xs: "auto", md: "100vh" },
            minHeight: { xs: "auto", md: "100vh" },
          }}
        >
          <Box
            sx={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              backgroundImage: "url('https://www.transparenttextures.com/patterns/white-diamond.png')",
              opacity: 0.05,
              zIndex: -1,
              display: { xs: "none", md: "block" },
            }}
          />

          <GlassPaper elevation={0}>
            <Typography
              variant="h5"
              sx={{
                marginBottom: { xs: "10px", md: "30px" },
                color: "#003087",
                fontWeight: 700,
                fontSize: { xs: "1.2rem", sm: "1.5rem", md: "2.5rem" },
                fontFamily: "'Poppins', sans-serif",
                textShadow: "1px 1px 2px rgba(0, 0, 0, 0.1)",
              }}
            >
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
                sx={{
                  "& .MuiOutlinedInput-root": {
                    "& fieldset": { borderColor: "rgba(0, 87, 183, 0.5)" },
                    "&:hover fieldset": { borderColor: "#0057b7" },
                    "&.Mui-focused fieldset": { borderColor: "#003087" },
                    backgroundColor: "rgba(255, 255, 255, 0.9)",
                    borderRadius: "10px",
                    transition: "all 0.3s ease",
                  },
                  "& .MuiInputLabel-root": { color: "#003087" },
                  "& .MuiInputLabel-root.Mui-focused": { color: "#0057b7" },
                  fontFamily: "'Poppins', sans-serif",
                  fontSize: { xs: "0.9rem", md: "1rem" },
                }}
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
                sx={{
                  "& .MuiOutlinedInput-root": {
                    "& fieldset": { borderColor: "rgba(0, 87, 183, 0.5)" },
                    "&:hover fieldset": { borderColor: "#0057b7" },
                    "&.Mui-focused fieldset": { borderColor: "#003087" },
                    backgroundColor: "rgba(255, 255, 255, 0.9)",
                    borderRadius: "10px",
                    transition: "all 0.3s ease",
                  },
                  "& .MuiInputLabel-root": { color: "#003087" },
                  "& .MuiInputLabel-root.Mui-focused": { color: "#0057b7" },
                  fontFamily: "'Poppins', sans-serif",
                  fontSize: { xs: "0.9rem", md: "1rem" },
                }}
              />
              <Button
                type="submit"
                variant="contained"
                fullWidth
                sx={{
                  marginTop: { xs: "10px", md: "30px" },
                  padding: { xs: "8px", md: "12px" },
                  background: "linear-gradient(135deg, #003087 0%, #0057b7 100%)",
                  borderRadius: "10px",
                  fontFamily: "'Poppins', sans-serif",
                  fontWeight: 600,
                  fontSize: { xs: "0.9rem", md: "1.1rem" },
                  transition: "all 0.3s ease",
                  "&:hover": {
                    background: "linear-gradient(135deg, #0057b7 0%, #003087 100%)",
                    boxShadow: "0 4px 15px rgba(0, 87, 183, 0.4)",
                    transform: "translateY(-2px)",
                  },
                }}
              >
                Iniciar Sesión
              </Button>
              <Typography
                variant="body2"
                sx={{
                  marginTop: { xs: "8px", md: "15px" },
                  color: "#003087",
                  fontSize: { xs: "0.8rem", md: "1rem" },
                  fontFamily: "'Poppins', sans-serif",
                }}
              >
                ¿No tienes cuenta?{" "}
                <Button
                  variant="text"
                  onClick={() => navigate("/registro")}
                  sx={{
                    textTransform: "none",
                    color: "#0057b7",
                    fontFamily: "'Poppins', sans-serif",
                    transition: "color 0.3s ease",
                    "&:hover": { color: "#003087" },
                    fontSize: { xs: "0.8rem", md: "1rem" },
                  }}
                >
                  Regístrate aquí
                </Button>
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  marginTop: { xs: "5px", md: "10px" },
                  color: "#003087",
                  fontSize: { xs: "0.8rem", md: "1rem" },
                  fontFamily: "'Poppins', sans-serif",
                }}
              >
                ¿Olvidaste tu contraseña?{" "}
                <Button
                  variant="text"
                  onClick={() => navigate("/recuperar-password")}
                  sx={{
                    textTransform: "none",
                    color: "#0057b7",
                    fontFamily: "'Poppins', sans-serif",
                    transition: "color 0.3s ease",
                    "&:hover": { color: "#003087" },
                    fontSize: { xs: "0.8rem", md: "1rem" },
                  }}
                >
                  Recuperar contraseña
                </Button>
              </Typography>
            </form>
          </GlassPaper>
        </Grid>
      </Grid>

      {/* Alerts */}
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