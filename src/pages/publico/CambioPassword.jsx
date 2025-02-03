import React, { useState, useEffect } from 'react';
import { Box, Button, TextField, Typography, Paper, Snackbar, Alert, IconButton, InputAdornment } from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import { validatePassword, evaluatePasswordStrength } from '../../utils/validations';

const CambioPassword = () => {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [passwordStrength, setPasswordStrength] = useState({ score: 0, level: '', suggestions: '' });
    const [errors, setErrors] = useState({});
    const [alert, setAlert] = useState({ open: false, message: '', severity: '' });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    // Obtener el token desde la URL
    const queryParams = new URLSearchParams(location.search);
    const token = queryParams.get('token');

    useEffect(() => {
        if (!token) {
            setErrors((prevErrors) => ({ ...prevErrors, token: 'Token inválido o no encontrado.' }));
        }
    }, [token]);

    const handlePasswordChange = (value) => {
        setPassword(value);

        // Validar la contraseña
        const passwordError = validatePassword(value);
        setErrors((prevErrors) => ({ ...prevErrors, password: passwordError }));

        // Evaluar fortaleza de la contraseña
        const strength = evaluatePasswordStrength(value);
        setPasswordStrength(strength);

        // Verificar coincidencia de contraseñas al actualizar la contraseña principal
        if (confirmPassword && value !== confirmPassword) {
            setErrors((prevErrors) => ({ ...prevErrors, confirmPassword: 'Las contraseñas no coinciden.' }));
        } else {
            setErrors((prevErrors) => ({ ...prevErrors, confirmPassword: '' }));
        }
    };

    const handleConfirmPasswordChange = (value) => {
        setConfirmPassword(value);

        // Validar que las contraseñas coincidan
        if (password !== value) {
            setErrors((prevErrors) => ({
                ...prevErrors,
                confirmPassword: 'Las contraseñas no coinciden.',
            }));
        } else {
            setErrors((prevErrors) => ({
                ...prevErrors,
                confirmPassword: '', // Limpiar error si coinciden
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (errors.password || errors.confirmPassword || password !== confirmPassword) {
            setErrors((prevErrors) => ({
                ...prevErrors,
                confirmPassword: password !== confirmPassword ? 'Las contraseñas no coinciden.' : '',
            }));
            return;
        }

        try {
            await axios.post('http://localhost:4000/api/usuarios/cambiar-password', {
                token,
                nuevaPassword: password
            });

            setAlert({ open: true, message: 'Contraseña cambiada con éxito.', severity: 'success' });
            setTimeout(() => navigate('/login'), 3000);
        } catch (error) {
            setAlert({
                open: true,
                message: error.response?.data?.mensaje || 'Error al cambiar la contraseña.',
                severity: 'error',
            });
        }
    };

    const handleCloseAlert = () => {
        setAlert({ ...alert, open: false });
    };

    return (
        <Box
            sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '100vh',
                backgroundColor: '#e6f9f5',
            }}
        >
            <Box sx={{ position: 'relative', zIndex: 2 }}>
                <Paper
                    elevation={3}
                    sx={{
                        padding: '30px',
                        maxWidth: '400px',
                        width: '100%',
                        textAlign: 'center',
                        borderRadius: '10px',
                        backgroundColor: '#ffffff',
                    }}
                >
                    <Typography variant="h5" sx={{ marginBottom: '20px', color: '#0077b6' }}>
                        Cambiar Contraseña
                    </Typography>

                    <form onSubmit={handleSubmit}>
                        <TextField
                            label="Nueva contraseña"
                            type={showPassword ? 'text' : 'password'}
                            fullWidth
                            variant="outlined"
                            margin="normal"
                            value={password}
                            onChange={(e) => handlePasswordChange(e.target.value)}
                            error={!!errors.password}
                            helperText={errors.password}
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton
                                            onClick={() => setShowPassword(!showPassword)}
                                            edge="end"
                                        >
                                            {showPassword ? <VisibilityOff /> : <Visibility />}
                                        </IconButton>
                                    </InputAdornment>
                                ),
                            }}
                        />

                        <TextField
                            label="Confirmar nueva contraseña"
                            type={showConfirmPassword ? 'text' : 'password'}
                            fullWidth
                            variant="outlined"
                            margin="normal"
                            value={confirmPassword}
                            onChange={(e) => handleConfirmPasswordChange(e.target.value)}
                            error={!!errors.confirmPassword}
                            helperText={errors.confirmPassword}
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            edge="end"
                                        >
                                            {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                                        </IconButton>
                                    </InputAdornment>
                                ),
                            }}
                        />

                        {/* Medidor de fortaleza de contraseña */}
                        <Box sx={{ marginTop: '20px' }}>
                            <Typography
                                variant="body2"
                                color={
                                    passwordStrength.score < 2
                                        ? 'error'
                                        : passwordStrength.score < 4
                                            ? 'warning'
                                            : 'success'
                                }
                                sx={{ fontWeight: 'bold' }}
                            >
                                Fortaleza: {passwordStrength.level}
                            </Typography>

                            <Box sx={{ display: 'flex', gap: 0.5, marginTop: 1 }}>
                                {[0, 1, 2, 3, 4].map((i) => (
                                    <Box
                                        key={i}
                                        sx={{
                                            height: '8px',
                                            flex: 1,
                                            borderRadius: 1,
                                            backgroundColor: i <= passwordStrength.score ? '#4caf50' : '#e0e0e0',
                                        }}
                                    ></Box>
                                ))}
                            </Box>

                            <Typography variant="caption" color="textSecondary" sx={{ marginTop: '5px' }}>
                                {passwordStrength.suggestions}
                            </Typography>
                        </Box>

                        <Button
                            type="submit"
                            variant="contained"
                            color="primary"
                            fullWidth
                            sx={{ marginTop: '20px', padding: '10px', backgroundColor: '#0077b6' }}
                        >
                            Cambiar Contraseña
                        </Button>
                    </form>
                </Paper>
            </Box>

            {/* Alerta de mensajes */}
            <Snackbar
                open={alert.open}
                autoHideDuration={6000}
                onClose={handleCloseAlert}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert onClose={handleCloseAlert} severity={alert.severity} sx={{ width: '100%' }}>
                    {alert.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default CambioPassword;
