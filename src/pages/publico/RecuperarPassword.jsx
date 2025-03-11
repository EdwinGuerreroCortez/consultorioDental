import React, { useState } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
} from "@mui/material";
import Alerts from "../../components/shared/Button"; // Componente de alerta personalizada
import axios from "axios";
import { validateEmail } from "../../utils/validations";
import { useNavigate } from "react-router-dom";

const RecuperarPassword = () => {
  const [email, setEmail] = useState("");
  const [alert, setAlert] = useState({ type: "", message: "" });
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const obtenerTokenCSRF = () => {
    const csrfToken = document.cookie
      .split("; ")
      .find(row => row.startsWith("XSRF-TOKEN="))
      ?.split("=")[1];
  
    return csrfToken || ""; // Evita valores undefined
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();

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
      const csrfToken = obtenerTokenCSRF(); // 🔹 Obtener token CSRF
      // Enviar solicitud al backend para recuperación de contraseña
      await axios.post("http://localhost:4000/api/usuarios/recuperar-password", { email },{
        headers: {
          "X-XSRF-TOKEN": csrfToken, // 🔹 Agregar token CSRF
          "Content-Type": "application/json",
        },
        withCredentials: true, // 🔹 Permitir cookies con CSRF
      });
      setAlert({ type: "success", message: "Correo enviado con instrucciones para recuperar la contraseña." });
      setTimeout(() => navigate("/login"), 3000);
    } catch (error) {
      setAlert({
        type: "error",
        message: error.response?.data?.mensaje || "Error al enviar la solicitud de recuperación.",
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
            Recuperar Contraseña
          </Typography>
          <form onSubmit={handleSubmit}>
            <TextField
              label="Correo electrónico"
              type="email"
              fullWidth
              variant="outlined"
              margin="normal"
              value={email}
              onChange={(e) => handleChange(e.target.value)}
              error={!!error}
              helperText={error}
            />
            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              sx={{ marginTop: "20px", padding: "10px", backgroundColor: "#0077b6" }}
            >
              Enviar Instrucciones
            </Button>
          </form>
          <Typography variant="body2" sx={{ marginTop: "20px", color: "#555" }}>
            ¿Ya tienes una cuenta? {" "}
            <a href="/login" style={{ color: "#0077b6", textDecoration: "none" }}>
              Inicia sesión
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

export default RecuperarPassword;
