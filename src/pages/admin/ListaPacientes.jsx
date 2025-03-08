import React, { useState, useEffect } from "react";
import {
    Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
    Typography, CircularProgress, TablePagination, IconButton, Tooltip, TextField
} from "@mui/material";
import HistoryIcon from '@mui/icons-material/History';
import ToggleOnIcon from '@mui/icons-material/ToggleOn';
import ToggleOffIcon from '@mui/icons-material/ToggleOff';
import SearchIcon from '@mui/icons-material/Search';
import { motion } from "framer-motion";
import HistorialMedico from "./HistorialMedico";

const ListaPacientes = () => {
    const [pacientes, setPacientes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [estadoCuentas, setEstadoCuentas] = useState({});
    const [showSearch, setShowSearch] = useState(false); // Estado para mostrar el buscador
    const [openHistorial, setOpenHistorial] = useState(false);
    const [pacienteSeleccionado, setPacienteSeleccionado] = useState(null);


    useEffect(() => {
        const fetchPacientes = async () => {
            setLoading(true);
            try {
                const response = await fetch("http://localhost:4000/api/usuarios/pacientes");
                const data = await response.json();
                setPacientes(data);

                // Inicializa el estado de las cuentas (activadas/desactivadas)
                const estadoInicial = {};
                data.forEach(paciente => {
                    estadoInicial[paciente.id] = true; // Por defecto, todas las cuentas están activas
                });
                setEstadoCuentas(estadoInicial);
            } catch (error) {
                console.error("Error al obtener los pacientes:", error);
            }
            setLoading(false);
        };

        fetchPacientes();
    }, []);

    // Cambiar estado de activación de la cuenta
    const toggleEstadoCuenta = (id) => {
        setEstadoCuentas(prevEstado => ({
            ...prevEstado,
            [id]: !prevEstado[id] // Cambia entre activo e inactivo
        }));
    };

    // Filtrar pacientes por nombre, apellido o correo
    const filteredPacientes = pacientes.filter((paciente) =>
        paciente.nombre.toLowerCase().includes(search.toLowerCase()) ||
        paciente.apellido_paterno.toLowerCase().includes(search.toLowerCase()) ||
        paciente.apellido_materno.toLowerCase().includes(search.toLowerCase()) ||
        paciente.email.toLowerCase().includes(search.toLowerCase())
    );

    // Cambio de página
    const handleChangePage = (event, newPage) => setPage(newPage);

    // Cambio de filas por página
    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };
    const handleOpenHistorial = (paciente) => {
        if (!paciente || !paciente.id) {
            console.error("❌ Error: paciente o paciente.id es undefined", paciente);
            return;
        }
    
        console.log("🟢 Abriendo historial para paciente ID:", paciente.id);
        setPacienteSeleccionado(paciente);
        setOpenHistorial(true);
    };
    

    const handleCloseHistorial = () => {
        setOpenHistorial(false);
        setPacienteSeleccionado(null);
    };


    return (
        <Box sx={{ padding: "2rem", minHeight: "100vh", display: "flex", flexDirection: "column", position: "relative" }}>
            {/* Contenedor del buscador en la esquina superior derecha */}
            <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 2 }}>
                <IconButton onClick={() => setShowSearch(!showSearch)}>
                    <SearchIcon sx={{ color: "#0077b6", fontSize: 30 }} />
                </IconButton>
                {showSearch && (
                    <motion.div
                        initial={{ width: 0, opacity: 0 }}
                        animate={{ width: "250px", opacity: 1 }}
                        exit={{ width: 0, opacity: 0 }}
                        transition={{ duration: 0.4 }}
                    >
                        <TextField
                            label="Buscar paciente"
                            variant="outlined"
                            fullWidth
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            sx={{
                                ml: 2,
                                "& .MuiOutlinedInput-root": {
                                    borderRadius: "12px",
                                }
                            }}
                        />
                    </motion.div>
                )}
            </Box>

            {/* Contenido de la tabla */}
            <Box sx={{ flexGrow: 1, maxWidth: "1200px", mx: "auto", width: "100%" }}>
                {loading ? (
                    <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "50vh" }}>
                        <CircularProgress size={60} sx={{ color: "#0077b6" }} />
                    </Box>
                ) : (
                    <TableContainer component={Paper} sx={{
                        borderRadius: "16px", overflow: "hidden", background: "#fff",
                        boxShadow: "0 6px 24px rgba(0,0,0,0.08)"
                    }}>
                        <Table>
                            <TableHead sx={{ background: "linear-gradient(90deg, #0077b6 0%, #48cae4 100%)" }}>
                                <TableRow>
                                    {["Nombre Completo", "Teléfono", "Sexo", "Email", "Fecha de Nacimiento", "Fecha de Creación", "Acciones"].map(header => (
                                        <TableCell key={header} sx={{ color: "#fff", fontWeight: 600, textAlign: "center", width: "14.28%" }}>
                                            {header}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {filteredPacientes.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((paciente, index) => (
                                    <TableRow key={index} sx={{
                                        "&:hover": { backgroundColor: "#f8fbff", transition: "background-color 0.2s" },
                                        borderBottom: "1px solid #eef3f7"
                                    }}>
                                        <TableCell sx={{ textAlign: "center", color: "#444" }}>
                                            {paciente.nombre} {paciente.apellido_paterno} {paciente.apellido_materno}
                                        </TableCell>
                                        <TableCell sx={{ textAlign: "center", color: "#444" }}>
                                            {paciente.telefono}
                                        </TableCell>
                                        <TableCell sx={{ textAlign: "center", color: "#444" }}>
                                            {paciente.sexo.charAt(0).toUpperCase()}
                                        </TableCell>
                                        <TableCell sx={{ textAlign: "center", color: "#444" }}>
                                            {paciente.email}
                                        </TableCell>
                                        <TableCell sx={{ textAlign: "center", color: "#444" }}>
                                            {new Date(paciente.fecha_nacimiento).toLocaleDateString("es-MX")}
                                        </TableCell>
                                        <TableCell sx={{ textAlign: "center", color: "#444" }}>
                                            {new Date(paciente.fecha_creacion).toLocaleDateString("es-MX")}
                                        </TableCell>
                                        <TableCell sx={{ textAlign: "center", color: "#444" }}>
                                            <Tooltip title="Historial Médico" arrow>
                                                <IconButton onClick={() => handleOpenHistorial(paciente)}>
                                                    <HistoryIcon sx={{ color: "#0077b6" }} />
                                                </IconButton>
                                            </Tooltip>

                                            <Tooltip title={estadoCuentas[paciente.id] ? "Desactivar Cuenta" : "Activar Cuenta"} arrow>
                                                <IconButton onClick={() => toggleEstadoCuenta(paciente.id)}>
                                                    {estadoCuentas[paciente.id] ? (
                                                        <ToggleOnIcon sx={{ color: "green" }} />
                                                    ) : (
                                                        <ToggleOffIcon sx={{ color: "red" }} />
                                                    )}
                                                </IconButton>
                                            </Tooltip>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                )}
            </Box>
            <HistorialMedico open={openHistorial} handleClose={handleCloseHistorial} paciente={pacienteSeleccionado} />

        </Box>
    );
};

export default ListaPacientes;
