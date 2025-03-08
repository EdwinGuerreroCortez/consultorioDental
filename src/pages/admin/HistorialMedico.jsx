import React, { useState, useEffect } from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Typography,
    TextField,
    Box,
    Divider,
    Grid
} from "@mui/material";
import DientesImage from "../../assets/images/Dientes.jpg"; // Imagen de dientes

const HistorialMedico = ({ open, handleClose, paciente }) => {
    // Estados para información médica
    const [signosVitales, setSignosVitales] = useState("");
    const [bajoTratamiento, setBajoTratamiento] = useState("");
    const [tipoTratamiento, setTipoTratamiento] = useState("");
    const [medicamentos, setMedicamentos] = useState("");
    const [comentario, setComentario] = useState("");

    useEffect(() => {
        if (!open || !paciente || !paciente.id) {
            return;
        }
    
        console.log(`🟢 Obteniendo historial médico para usuarioId: ${paciente.id}`);
    
        const obtenerHistorial = async () => {
            try {
                const response = await fetch(`http://localhost:4000/api/historial/usuario/${paciente.id}`);
    
                if (response.status === 404) {
                    // ✅ Silenciar el error 404 en la consola
                    console.warn(`⚠️ No hay historial médico registrado para el usuario ID: ${paciente.id}.`);
                    return; // Detener ejecución sin mostrar error en consola
                }
    
                if (!response.ok) {
                    throw new Error(`⚠️ Error en la respuesta del servidor: ${response.status}`);
                }
    
                const data = await response.json();
    
                if (!data || data.length === 0) {
                    // Si el historial está vacío, asigna valores predeterminados
                    setSignosVitales("");
                    setBajoTratamiento("");
                    setTipoTratamiento("");
                    setMedicamentos("");
                    setComentario("");
                    return;
                }
    
                const historialReciente = data[data.length - 1];
                setSignosVitales(historialReciente.signos_vitales || "");
                setBajoTratamiento(historialReciente.bajo_tratamiento ? "Sí" : "No");
                setTipoTratamiento(historialReciente.tipo_tratamiento || "");
                setMedicamentos(historialReciente.medicamentos_recetados || "");
                setComentario(historialReciente.observaciones_medicas || "");
    
                console.log("✅ Historial cargado correctamente:", historialReciente);
            } catch (error) {
                if (error.message.includes("404")) {
                    return; // ✅ No mostrar error en consola si es un 404
                }
                console.error("❌ Error al obtener historial médico:", error);
            }
        };
    
        obtenerHistorial();
    }, [open, paciente]);
    
    const guardarHistorial = () => {
        if (!paciente || !paciente.id) {
            console.error("❌ Error: No hay paciente seleccionado.");
            return;
        }

        const historialData = {
            usuario_id: paciente.id,
            signos_vitales: signosVitales,
            bajo_tratamiento: bajoTratamiento === "Sí" ? 1 : 0,
            tipo_tratamiento: tipoTratamiento,
            medicamentos_recetados: medicamentos,
            observaciones_medicas: comentario,
        };

        console.log("🟢 Enviando historial médico con datos:", historialData);

        fetch(`http://localhost:4000/api/historial/usuario/${paciente.id}`, { // ✅ Corrección aquí
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(historialData),
        })

            .then(response => response.json())
            .then(data => {
                console.log("✅ Historial guardado correctamente:", data);
                handleClose(); // Cerrar el modal tras guardar
            })
            .catch(error => console.error("❌ Error al guardar historial médico:", error));
    };


    return (
        <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
            {/* 🔹 ENCABEZADO */}
            <DialogTitle sx={{ backgroundColor: "#0077b6", color: "white", textAlign: "center", fontWeight: "bold" }}>
                {paciente ? `Historial Médico de ${paciente.nombre} ${paciente.apellido_paterno}` : "Cargando Historial Médico..."}
            </DialogTitle>
            <DialogContent dividers sx={{ padding: "1.5rem" }}>
                {/* 🔹 Mostrar mensaje si paciente es null */}
                {!paciente ? (
                    <Typography variant="body1" align="center">
                        🔄 Cargando información del paciente...
                    </Typography>
                ) : (
                    <>
                        {/* 🔹 IMAGEN */}
                        <Box sx={{ display: "flex", justifyContent: "center", mb: 2 }}>
                            <img src={DientesImage} alt="Dientes" style={{ width: "150px", borderRadius: "10px" }} />
                        </Box>

                        {/* 🔹 SECCIÓN: Datos personales */}
                        <Box sx={{ marginBottom: "1.5rem" }}>
                            <Typography variant="h6" sx={{ fontWeight: "bold", color: "#0077b6" }}>
                                Datos Personales
                            </Typography>
                            <Divider sx={{ marginBottom: "1rem" }} />
                            <Grid container spacing={2}>
                                <Grid item xs={12} md={6}>
                                    <TextField label="Nombre" fullWidth variant="outlined"
                                        value={paciente?.nombre || ""}
                                        InputProps={{ readOnly: true }} />
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <TextField label="Apellido Paterno" fullWidth variant="outlined"
                                        value={paciente?.apellido_paterno || ""}
                                        InputProps={{ readOnly: true }} />
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <TextField label="Apellido Materno" fullWidth variant="outlined"
                                        value={paciente?.apellido_materno || ""}
                                        InputProps={{ readOnly: true }} />
                                </Grid>
                                <Grid item xs={12} md={3}>
                                    <TextField label="Fecha de Nacimiento" fullWidth variant="outlined"
                                        value={paciente?.fecha_nacimiento ? new Date(paciente.fecha_nacimiento).toLocaleDateString("es-MX") : ""}
                                        InputProps={{ readOnly: true }} />
                                </Grid>
                                <Grid item xs={12} md={3}>
                                    <TextField label="Sexo" fullWidth variant="outlined"
                                        value={paciente?.sexo ? paciente.sexo.charAt(0).toUpperCase() : ""}
                                        InputProps={{ readOnly: true }} />
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <TextField label="Ocupación" fullWidth variant="outlined"
                                        value={paciente?.ocupacion || "No especificada"}
                                        InputProps={{ readOnly: true }} />
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <TextField label="Teléfono" fullWidth variant="outlined"
                                        value={paciente?.telefono || ""}
                                        InputProps={{ readOnly: true }} />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField label="Email" fullWidth variant="outlined"
                                        value={paciente?.email || ""}
                                        InputProps={{ readOnly: true }} />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField label="Dirección" fullWidth variant="outlined"
                                        value={paciente?.direccion || "No disponible"}
                                        InputProps={{ readOnly: true }} />
                                </Grid>
                            </Grid>
                        </Box>

                        {/* 🔹 SECCIÓN: Información médica */}
                        <Box sx={{ marginBottom: "1.5rem" }}>
                            <Typography variant="h6" sx={{ fontWeight: "bold", color: "#0077b6" }}>
                                Información Médica
                            </Typography>
                            <Divider sx={{ marginBottom: "1rem" }} />
                            <TextField
                                label="Signos Vitales"
                                fullWidth
                                variant="outlined"
                                value={signosVitales || ""} // ✅ Evita errores de undefined
                                onChange={(e) => setSignosVitales(e.target.value)}
                            />

                        </Box>

                        {/* 🔹 SECCIÓN: Tratamiento Dental */}
                        <Box sx={{ marginBottom: "1.5rem" }}>
                            <Typography variant="h6" sx={{ fontWeight: "bold", color: "#0077b6" }}>
                                Tratamiento Dental
                            </Typography>
                            <Divider sx={{ marginBottom: "1rem" }} />
                            <Grid container spacing={2}>
                                <Grid item xs={12} md={6}>
                                    <TextField
                                        label="Bajo Tratamiento"
                                        fullWidth
                                        variant="outlined"
                                        value={bajoTratamiento || ""}  // ✅ Evita undefined
                                        onChange={(e) => setBajoTratamiento(e.target.value)}
                                    />
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <TextField
                                        label="Tipo de Tratamiento"
                                        fullWidth
                                        variant="outlined"
                                        value={tipoTratamiento || ""}  // ✅ Evita undefined
                                        onChange={(e) => setTipoTratamiento(e.target.value)}
                                    />


                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        label="Medicamentos Recetados"
                                        fullWidth
                                        variant="outlined"
                                        value={medicamentos || ""}  // ✅ Evita undefined
                                        onChange={(e) => setMedicamentos(e.target.value)}
                                    />
                                </Grid>
                            </Grid>
                        </Box>

                        {/* 🔹 SECCIÓN: Observaciones médicas */}
                        <Box sx={{ marginBottom: "1.5rem" }}>
                            <Typography variant="h6" sx={{ fontWeight: "bold", color: "#0077b6" }}>
                                Observaciones Médicas
                            </Typography>
                            <Divider sx={{ marginBottom: "1rem" }} />
                            <TextField
                                label="Observaciones o notas del paciente"
                                multiline
                                rows={4}
                                variant="outlined"
                                fullWidth
                                value={comentario || ""}  // ✅ Evita undefined
                                onChange={(e) => setComentario(e.target.value)}
                            />

                        </Box>
                    </>
                )}
            </DialogContent>



            {/* 🔹 BOTÓN DE CIERRE Y GUARDAR */}
            <DialogActions sx={{ justifyContent: "space-between", padding: "1rem" }}>
                <Button onClick={handleClose} variant="contained" sx={{ backgroundColor: "#0077b6", "&:hover": { backgroundColor: "#005f91" } }}>
                    Cerrar
                </Button>
                <Button variant="contained" color="success" onClick={guardarHistorial}>
                    Guardar Cambios
                </Button>

            </DialogActions>
        </Dialog>
    );
};

export default HistorialMedico;
