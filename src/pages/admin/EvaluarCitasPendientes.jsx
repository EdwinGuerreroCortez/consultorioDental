import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  List,
  ListItem,
  ListItemText,
  Divider,
} from "@mui/material";

export default function EvaluarCitasPendientes() {
  const [tratamientos, setTratamientos] = useState([]);
  const [selectedTratamiento, setSelectedTratamiento] = useState(null);
  const [citas, setCitas] = useState([]);
  const [open, setOpen] = useState(false);
  const [fechaNueva, setFechaNueva] = useState("");

  useEffect(() => {
    axios.get("http://localhost:4000/api/tratamientos-pacientes/en-progreso")
      .then(response => {
        setTratamientos(response.data);
      })
      .catch(error => {
        console.error("Error al obtener los tratamientos en progreso", error);
      });
  }, []);

  const convertirHoraLocal = (fechaISO) => {
    if (!fechaISO) return "Sin asignar";
    const fecha = new Date(fechaISO);
    return fecha.toLocaleString("es-MX", { timeZone: "America/Mexico_City" });
  };

  const handleOpenDialog = (tratamiento) => {
    setSelectedTratamiento(tratamiento);
    axios.get(`http://localhost:4000/api/citas/tratamiento/${tratamiento.id}`)
      .then(response => {
        setCitas(response.data);
        setOpen(true);
      })
      .catch(error => {
        console.error("Error al obtener las citas del tratamiento", error);
      });
  };

  const handleCloseDialog = () => {
    setOpen(false);
    setFechaNueva("");
    setCitas([]);
  };

  const handleAgregarCita = (citaId) => {
    if (fechaNueva) {
      console.log("Nueva cita registrada para:", selectedTratamiento.tratamiento, "Fecha:", fechaNueva);
      setFechaNueva("");
      setOpen(false);
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <Typography variant="h4" gutterBottom>
        Tratamientos Activos
      </Typography>
      {tratamientos.map((tratamiento) => (
        <Card key={tratamiento.id} style={{ marginBottom: 20 }}>
          <CardContent>
            <Typography variant="h6">{tratamiento.tratamiento}</Typography>
            <Typography>Paciente: {tratamiento.nombre} {tratamiento.apellido_paterno} {tratamiento.apellido_materno}</Typography>
            <Typography>Edad: {tratamiento.edad} años</Typography>
            <Typography>Citas asistidas: {tratamiento.citas_asistidas}/{tratamiento.citas_totales}</Typography>
            <Typography>Estado: {tratamiento.estado}</Typography>
            <Button variant="contained" color="primary" onClick={() => handleOpenDialog(tratamiento)}>
              Ver Citas
            </Button>
          </CardContent>
        </Card>
      ))}

      {selectedTratamiento && (
        <Dialog open={open} onClose={handleCloseDialog} fullWidth>
          <DialogTitle>Citas de {selectedTratamiento.tratamiento}</DialogTitle>
          <DialogContent>
            <List>
              {citas.map((cita, index) => (
                <div key={cita.id}>
                  <ListItem>
                    <ListItemText primary={`Fecha: ${convertirHoraLocal(cita.fecha_hora)}`} secondary={`Estado: ${cita.estado}, Pagada: ${cita.pagada ? "Sí" : "No"}`} />
                    {cita.fecha_hora ? null : index === 0 || citas[index - 1].fecha_hora ? (
                      <TextField
                        type="date"
                        fullWidth
                        value={fechaNueva}
                        onChange={(e) => setFechaNueva(e.target.value)}
                        InputLabelProps={{ shrink: true }}
                      />
                    ) : null}
                  </ListItem>
                  <Divider />
                </div>
              ))}
            </List>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancelar</Button>
            <Button onClick={() => handleAgregarCita()} variant="contained" color="primary" disabled={!fechaNueva}>
              Agregar Cita
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </div>
  );
}
