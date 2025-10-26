import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  Fade,
} from "@mui/material";
import Alerts from "../../components/shared/Button"; // Custom alert component
import axios from "axios";
import { validateEmail } from "../../utils/validations";
import { useNavigate } from "react-router-dom";
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

const RecuperarPassword = () => {
  const [email, setEmail] = useState("");
  const [alert, setAlert] = useState({ type: "", message: "" });
  const [error, setError] = useState("");
  const [csrfToken, setCsrfToken] = useState(null); // Nuevo estado para el token CSRF
  const navigate = useNavigate();

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
        setAlert({ type: "error", message: "Error al obtener el token CSRF" });
      }
    };
    obtenerTokenCSRF();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!csrfToken) {
      setAlert({ type: "error", message: "Error: Token CSRF no disponible" });
      return;
    }

    if (!email.trim()) {
      setError("El correo no puede estar vacío.");
      return;
    }

    const emailError = validateEmail(email);
    if (emailError) {
      setError(emailError);
      return;
    }

    try {
      await axios.post(
        "http://localhost:4000/api/usuarios/recuperar-password",
        { email },
        {
          headers: {
            "X-XSRF-TOKEN": csrfToken,
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );
      setAlert({
        type: "success",
        message: "Correo enviado con instrucciones para recuperar tu contraseña.",
      });
      setTimeout(() => navigate("/login"), 3000);
    } catch (error) {
      setAlert({
        type: "error",
        message:
          error.response?.data?.mensaje ||
          "Error al enviar la solicitud de recuperación.",
      });
    }

    setTimeout(() => setAlert({ type: "", message: "" }), 5000);
  };

  const handleChange = (value) => {
    setEmail(value);
    setError(value.trim() === "" ? "El correo no puede estar vacío." : "");
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
            <Typography
              variant="h4"
              sx={{
                marginBottom: { xs: "20px", md: "40px" },
                color: "#003087",
                fontWeight: 700,
                fontSize: { xs: "1.5rem", sm: "2rem", md: "2.5rem" },
                fontFamily: "'Poppins', sans-serif",
                letterSpacing: "0.5px",
              }}
            >
              Recuperar Contraseña
            </Typography>
            <form onSubmit={handleSubmit}>
              <TextField
                label="Correo Electrónico"
                type="email"
                fullWidth
                variant="outlined"
                margin="normal"
                value={email}
                onChange={(e) => handleChange(e.target.value)}
                error={!!error}
                helperText={error}
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
                  marginBottom: { xs: "10px", md: "20px" },
                }}
              />
              <Button
                type="submit"
                variant="contained"
                fullWidth
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
                }}
              >
                Enviar Instrucciones
              </Button>
              <Typography
                variant="body2"
                sx={{
                  marginTop: { xs: "15px", md: "25px" },
                  color: "#003087",
                  fontSize: { xs: "0.85rem", md: "1rem" },
                  fontFamily: "'Poppins', sans-serif",
                }}
              >
                ¿Ya tienes una cuenta?{" "}
                <Button
                  variant="text"
                  onClick={() => navigate("/login")}
                  sx={{
                    textTransform: "none",
                    color: "#0057b7",
                    fontFamily: "'Poppins', sans-serif",
                    fontWeight: 500,
                    transition: "color 0.3s ease, transform 0.2s ease",
                    "&:hover": {
                      color: "#003087",
                      transform: "scale(1.05)",
                    },
                    fontSize: { xs: "0.85rem", md: "1rem" },
                  }}
                >
                  Inicia sesión
                </Button>
              </Typography>
            </form>
          </GlassPaper>
        </Box>
      </Fade>

      {alert.type && (
        <Box sx={{ position: "fixed", bottom: "20px", left: "20px", zIndex: 1000 }}>
          {alert.type === "success" && <Alerts.SuccessAlert message={alert.message} />}
          {alert.type === "error" && <Alerts.ErrorAlert message={alert.message} />}
        </Box>
      )}
    </Box>
  );
};

export default RecuperarPassword;