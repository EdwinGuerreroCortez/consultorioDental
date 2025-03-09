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
    Grid,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Alert,
    Snackbar,
} from "@mui/material";
import DientesImage from "../../assets/images/Dientes.jpg"; // Imagen de dientes

const HistorialMedico = ({ open, handleClose, paciente }) => {
    // Estados para información médica
    const [signosVitales, setSignosVitales] = useState("");
    const [bajoTratamiento, setBajoTratamiento] = useState("");
    const [tipoTratamiento, setTipoTratamiento] = useState("");
    const [medicamentos, setMedicamentos] = useState("");
    const [comentario, setComentario] = useState("");
    const [tieneHistorial, setTieneHistorial] = useState(false); // ✅ Estado para verificar si hay historial
    const [modoEdicion, setModoEdicion] = useState(false);
    const [historiales, setHistoriales] = useState([]);
    const [historialSeleccionado, setHistorialSeleccionado] = useState(null);
    const [openSnackbar, setOpenSnackbar] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState("");
    const [snackbarSeverity, setSnackbarSeverity] = useState("success");



    // 🔹 Define obtenerHistorial ANTES del useEffect para que pueda ser llamada desde guardarHistorial
    const obtenerHistorial = async () => {
        try {
            const response = await fetch(`http://localhost:4000/api/historial/usuario/${paciente.id}`);

            if (!response.ok) {
                console.warn(`⚠️ No se encontró historial médico.`);
                setHistoriales([]);
                setHistorialSeleccionado(null);
                setTieneHistorial(false);
                setModoEdicion(false);
                limpiarCampos();
                return;
            }

            const data = await response.json();

            if (!Array.isArray(data) || data.length === 0) {
                console.warn(`⚠️ No hay historiales médicos.`);
                setHistoriales([]);
                setHistorialSeleccionado(null);
                setTieneHistorial(false);
                setModoEdicion(false);
                limpiarCampos();
                return;
            }

            // 🔹 Ordenar por fecha y obtener todos los historiales
            const historialOrdenado = data.sort((a, b) => new Date(b.fecha_registro) - new Date(a.fecha_registro));

            setHistoriales(historialOrdenado);
            setHistorialSeleccionado(historialOrdenado[0]); // ✅ Selecciona el más reciente por defecto
            setTieneHistorial(true);
            setModoEdicion(false);
        } catch (error) {
            console.error("Error al obtener historial médico:", error);
        }
    };


    // 🔹 Solo un `useEffect` que llama a `obtenerHistorial`
    useEffect(() => {
        if (!open || !paciente || !paciente.id) {
            return;
        }
        obtenerHistorial();
    }, [open, paciente]);



    const guardarHistorial = async () => {
        if (!paciente || !paciente.id) {
            console.error("Error: No hay paciente seleccionado.");
            return;
        }

        const fechaActual = new Date().toLocaleString("es-MX", { timeZone: "America/Mexico_City" });

        const historialData = {
            usuario_id: paciente.id,
            signos_vitales: signosVitales,
            bajo_tratamiento: bajoTratamiento === "Sí" ? 1 : 0,
            tipo_tratamiento: tipoTratamiento,
            medicamentos_recetados: medicamentos,
            observaciones_medicas: comentario,
            fecha_registro: fechaActual,
        };

        try {
            const response = await fetch(`http://localhost:4000/api/historial/usuario/${paciente.id}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(historialData),
            });

            if (!response.ok) {
                throw new Error("⚠️ Error al guardar el historial");
            }

            console.log("✅ Historial guardado correctamente");
            setSnackbarMessage("Historial guardado exitosamente");
            setSnackbarSeverity("success");
            setOpenSnackbar(true);
            setTimeout(() => setOpenSnackbar(false), 3000);

            // 🔹 Volver a obtener los datos más recientes desde el backend
            await obtenerHistorial();

            // 🔹 Desactivar la edición después de guardar
            setModoEdicion(false);

        } catch (error) {
            console.error("Error al guardar historial médico:", error);
            setSnackbarMessage("Error al guardar historial médico");
            setSnackbarSeverity("error");
            setOpenSnackbar(true);

        }
    };




    // Función para limpiar los campos y permitir añadir otro historial
    const limpiarCampos = () => {
        setSignosVitales("");
        setBajoTratamiento("");
        setTipoTratamiento("");
        setMedicamentos("");
        setComentario("");
        setModoEdicion(true); // 🔹 Activa la edición
    };
    const manejarCambioHistorial = (event) => {
        const historialSeleccionado = historiales.find(h => h.id === event.target.value);
        setHistorialSeleccionado(historialSeleccionado);
    };



    return (
        <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
            {/* 🔹 ENCABEZADO */}
            <DialogTitle sx={{ backgroundColor: "#0077b6", color: "white", textAlign: "center", fontWeight: "bold" }}>
                {paciente ? `Historial Médico de ${paciente.nombre} ${paciente.apellido_paterno}` : "Cargando Historial Médico..."}
            </DialogTitle>
            <DialogContent
                dividers
                sx={{
                    padding: "1.5rem",
                    overflowY: "auto", // Habilita el scroll
                    "&::-webkit-scrollbar": {
                        width: "8px", // Ancho de la barra
                    },
                    "&::-webkit-scrollbar-thumb": {
                        backgroundColor: "#0077b6", // Color de la barra de desplazamiento
                        borderRadius: "4px",
                    },
                    "&::-webkit-scrollbar-track": {
                        backgroundColor: "#f1f1f1", // Color del fondo de la barra
                    },
                }}
            >
                {/* 🔹 Mostrar mensaje si paciente es null */}
                {!paciente ? (
                    <Typography variant="body1" align="center">
                        🔄 Cargando información del paciente...
                    </Typography>
                ) : (
                    <>


                        {/* 🔹 SECCIÓN: Datos personales */}
                        <Box sx={{ marginBottom: "1.5rem" }}>
                            {historiales.length > 0 && (
                                <FormControl fullWidth sx={{ mb: 2 }}>
                                    <InputLabel>Seleccionar historial</InputLabel>
                                    <Select value={historialSeleccionado?.id || ""} onChange={manejarCambioHistorial}>
                                        {historiales.map(historial => (
                                            <MenuItem key={historial.id} value={historial.id}>
                                                {new Date(historial.fecha_registro).toLocaleString("es-MX")}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            )}

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
                        {/* 🔹 IMAGEN */}
                        <Box sx={{ display: "flex", justifyContent: "center", mb: 2 }}>
                            <img src={DientesImage} alt="Dientes" style={{ width: "700px", borderRadius: "10px" }} />
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
                                value={modoEdicion ? signosVitales : historialSeleccionado?.signos_vitales || ""}
                                onChange={(e) => setSignosVitales(e.target.value)}
                                InputProps={{ readOnly: !modoEdicion }}

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
                                    <FormControl fullWidth variant="outlined">
                                        <InputLabel>Bajo Tratamiento</InputLabel>
                                        <Select
                                            value={modoEdicion ? bajoTratamiento : historialSeleccionado?.bajo_tratamiento ? "Sí" : "No"}
                                            onChange={(e) => setBajoTratamiento(e.target.value)}
                                            label="Bajo Tratamiento"
                                            disabled={!modoEdicion} // Desactiva cuando no está en edición
                                        >
                                            <MenuItem value="Sí">Sí</MenuItem>
                                            <MenuItem value="No">No</MenuItem>
                                        </Select>
                                    </FormControl>
                                </Grid>

                                <Grid item xs={12} md={6}>
                                    <TextField
                                        label="Tipo de Tratamiento"
                                        fullWidth
                                        variant="outlined"
                                        value={modoEdicion ? tipoTratamiento : historialSeleccionado?.tipo_tratamiento || ""}
                                        onChange={(e) => setTipoTratamiento(e.target.value)}
                                        InputProps={{ readOnly: !modoEdicion }}
                                    />


                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        label="Medicamentos Recetados"
                                        fullWidth
                                        variant="outlined"
                                        value={modoEdicion ? medicamentos : historialSeleccionado?.medicamentos_recetados || ""}
                                        onChange={(e) => setMedicamentos(e.target.value)}
                                        InputProps={{ readOnly: !modoEdicion }}

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
                                value={modoEdicion ? comentario : historialSeleccionado?.observaciones_medicas || ""}
                                onChange={(e) => setComentario(e.target.value)}
                                InputProps={{ readOnly: !modoEdicion }}

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
                <Button variant="contained" color="warning" onClick={limpiarCampos}>
                    Agregar Otro Historial
                </Button>

                <Button variant="contained" color="success" onClick={guardarHistorial} disabled={!modoEdicion}>
                    {tieneHistorial ? "Actualizar Historial" : "Registrar Nuevo"}
                </Button>



            </DialogActions>
            {/* 🔹 ALERTA EN LA ESQUINA INFERIOR IZQUIERDA */}
            {openSnackbar && (
                <Box
                    sx={{
                        position: "fixed",
                        bottom: 20,
                        left: 20,
                        zIndex: 1000,
                        maxWidth: "350px",
                    }}
                >
                    <Alert
                        severity={snackbarSeverity}
                        variant="filled"
                        sx={{
                            backgroundColor:
                                snackbarSeverity === "success"
                                    ? "#DFF6DD"
                                    : snackbarSeverity === "error"
                                        ? "#F8D7DA"
                                        : snackbarSeverity === "warning"
                                            ? "#FFF3CD"
                                            : "#D1ECF1",
                            color:
                                snackbarSeverity === "success"
                                    ? "#1E4620"
                                    : snackbarSeverity === "error"
                                        ? "#721C24"
                                        : snackbarSeverity === "warning"
                                            ? "#856404"
                                            : "#0C5460",
                        }}
                        onClose={() => setOpenSnackbar(false)}
                    >
                        {snackbarMessage}
                    </Alert>
                </Box>
            )}


        </Dialog>
    );
};

export default HistorialMedico;
