import React, { useState, useEffect } from "react";
import { TextField, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, TablePagination, CircularProgress } from "@mui/material";

const ListaPacientes = () => {
    const [pacientes, setPacientes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);

    useEffect(() => {
        // Simulación de datos de pacientes (Aquí se conectará con el backend más adelante)
        const fetchPacientes = async () => {
            setLoading(true);
            try {
                const response = await fetch("http://localhost:4000/api/usuarios/pacientes");
                const data = await response.json();
                setPacientes(data);
            } catch (error) {
                console.error("Error al obtener los pacientes:", error);
            }
            setLoading(false);
        };

        fetchPacientes();
    }, []);

    // Filtrar pacientes por nombre o correo
    const filteredPacientes = pacientes.filter((paciente) =>
        paciente.nombre.toLowerCase().includes(search.toLowerCase()) ||
        paciente.email.toLowerCase().includes(search.toLowerCase())
    );

    // Cambio de página
    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    // Cambio de filas por página
    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    return (
        <div>
            <h2>Lista de Pacientes</h2>
            <TextField
                label="Buscar por nombre o email"
                variant="outlined"
                fullWidth
                margin="normal"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
            />

            {loading ? (
                <CircularProgress />
            ) : (
                <TableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Nombre</TableCell>
                                <TableCell>Email</TableCell>
                                <TableCell>Teléfono</TableCell>
                                <TableCell>Fecha de Nacimiento</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filteredPacientes.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((paciente) => (
                                <TableRow key={paciente.id}>
                                    <TableCell>{paciente.nombre} {paciente.apellido_paterno} {paciente.apellido_materno}</TableCell>
                                    <TableCell>{paciente.email}</TableCell>
                                    <TableCell>{paciente.telefono}</TableCell>
                                    <TableCell>{paciente.fecha_nacimiento}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                    <TablePagination
                        rowsPerPageOptions={[5, 10, 25]}
                        component="div"
                        count={filteredPacientes.length}
                        rowsPerPage={rowsPerPage}
                        page={page}
                        onPageChange={handleChangePage}
                        onRowsPerPageChange={handleChangeRowsPerPage}
                    />
                </TableContainer>
            )}
        </div>
    );
};

export default ListaPacientes;
