import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
    Box,
    Typography,
    CircularProgress,
    Tooltip,
    Grid,
    Divider,
    Paper,
} from "@mui/material";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";

const Detalleservicio = () => {
    const { hash } = useParams();
    const [tratamiento, setTratamiento] = useState(null);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchTratamiento = async () => {
            try {
                const response = await fetch(`http://localhost:4000/api/tratamientos/${hash}/detalle`);
                if (!response.ok) {
                    throw new Error('No se pudo obtener los detalles del tratamiento.');
                }
                const data = await response.json();
                setTratamiento(data);
            } catch (error) {
                setError(error.message);
            }
        };

        fetchTratamiento();
    }, [hash]);

    if (error) {
        return (
            <Box sx={{ padding: "40px", textAlign: "center" }}>
                <Typography variant="h5" color="error">{error}</Typography>
            </Box>
        );
    }

    if (!tratamiento) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    // Función para dividir la descripción en párrafos
    const formatDescripcion = (descripcion) => {
        return descripcion.split('\n\n').map((parrafo, index) => (
            <Typography
                key={index}
                variant="body1"
                sx={{
                    fontSize: "1.1rem",
                    color: "#424242",
                    lineHeight: "1.8",
                    textAlign: "justify",
                    marginBottom: "20px",
                }}
            >
                {parrafo}
            </Typography>
        ));
    };

    return (
        <Box
            sx={{
                padding: "40px",
                backgroundColor: "#f1f8ff",
                minHeight: "100vh",
                boxSizing: "border-box",
            }}
        >
            <Box
                sx={{
                    background: "linear-gradient(135deg, #0077b6, #00aaff)",
                    color: "#ffffff",
                    padding: "20px 30px",
                    borderRadius: "12px",
                    textAlign: "center",
                    boxShadow: "0 6px 12px rgba(0, 0, 0, 0.1)",
                    marginBottom: "30px",
                }}
            >
                <Typography
                    variant="h3"
                    sx={{
                        fontWeight: "bold",
                        fontFamily: "'Poppins', sans-serif",
                        textShadow: "1px 1px 4px rgba(0, 0, 0, 0.2)",
                    }}
                >
                    {tratamiento.nombre}
                </Typography>
            </Box>

            <Grid container spacing={4} justifyContent="center">
                <Grid item xs={12} md={6} lg={4}>
                    <Paper
                        elevation={6}
                        sx={{
                            width: "100%",
                            height: "300px",
                            borderRadius: "12px",
                            overflow: "hidden",
                            boxShadow: "0 6px 16px rgba(0, 0, 0, 0.15)",
                        }}
                    >
                        <img
                            src={tratamiento.imagen || "https://via.placeholder.com/300x200"}
                            alt={tratamiento.nombre}
                            style={{
                                width: "100%",
                                height: "100%",
                                objectFit: "contain",
                                backgroundColor: "#e3f2fd",
                            }}
                        />
                    </Paper>
                </Grid>

                <Grid item xs={12} md={8}>
                    <Box sx={{ padding: "20px", backgroundColor: "#ffffff", borderRadius: "12px", boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)" }}>
                        {formatDescripcion(tratamiento.descripcion)}

                        {tratamiento.requiere_evaluacion ? (
                            <Tooltip
                                title="Este tratamiento requiere evaluación para determinar el plan adecuado."
                                arrow
                                placement="top"
                            >
                                <Box
                                    sx={{
                                        display: "flex",
                                        alignItems: "center",
                                        padding: "10px",
                                        borderRadius: "8px",
                                        backgroundColor: "#fff3e0",
                                        color: "#e65100",
                                        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
                                        marginBottom: "20px",
                                    }}
                                >
                                    <InfoOutlinedIcon sx={{ fontSize: "32px", marginRight: "12px" }} />
                                    <Typography
                                        variant="h6"
                                        sx={{ fontWeight: "bold", fontSize: "1rem" }}
                                    >
                                        Este tratamiento requiere evaluación previa
                                    </Typography>
                                </Box>
                            </Tooltip>
                        ) : (
                            <>
                                <Typography
                                    variant="h6"
                                    sx={{ fontWeight: "bold", color: "#00796b", marginBottom: "10px" }}
                                >
                                    Citas requeridas: {tratamiento.citas_requeridas || "N/A"}
                                </Typography>
                                <Typography
                                    variant="h6"
                                    sx={{ fontWeight: "bold", color: "#00796b", marginBottom: "10px" }}
                                >
                                    Precio: ${tratamiento.precio} MXN
                                </Typography>
                            </>
                        )}

                        <Divider sx={{ marginY: "20px" }} />

                        <Typography
                            variant="h6"
                            sx={{ fontWeight: "bold", color: "#00529b", marginBottom: "10px" }}
                        >
                            Duración del tratamiento: {tratamiento.duracion_minutos} minutos
                        </Typography>
                    </Box>
                </Grid>
            </Grid>
        </Box>
    );
};

export default Detalleservicio;
