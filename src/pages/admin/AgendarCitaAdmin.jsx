import React, { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Snackbar,
  Alert,
} from '@mui/material';
import Autocomplete from '@mui/material/Autocomplete';
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import InputAdornment from '@mui/material/InputAdornment';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { es } from 'date-fns/locale';

const AgendarCitaAdmin = () => {
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [selectedTreatment, setSelectedTreatment] = useState('');
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState('');
  const [alert, setAlert] = useState({ open: false, message: '', severity: '' });

  // Datos de ejemplo para pacientes y tratamientos
  const patients = [
    { id: 1, name: 'Juan Pérez', email: 'juan@example.com' },
    { id: 2, name: 'María García', email: 'maria@example.com' },
    { id: 3, name: 'Carlos López', email: 'carlos@example.com' },
    // ...más pacientes
  ];

  const treatments = [
    { id: 1, name: 'Limpieza Dental', price: 500 },
    { id: 2, name: 'Ortodoncia', price: 1500 },
    { id: 3, name: 'Blanqueamiento Dental', price: 800 },
  ];

  const availableTimes = [
    '09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '01:00 PM',
    '03:00 PM', '04:00 PM', '05:00 PM', '06:00 PM'
  ];

  const handleSchedule = () => {
    if (!selectedPatient || !selectedTreatment || !selectedDate || !selectedTime) {
      setAlert({ open: true, message: 'Por favor, completa todos los campos.', severity: 'error' });
      return;
    }
    // Aquí se integraría la lógica para enviar los datos al backend
    setAlert({ open: true, message: 'Cita agendada correctamente.', severity: 'success' });
  };

  return (
    <Box sx={{ padding: { xs: '20px', md: '40px' }, backgroundColor: '#f0f9ff', minHeight: '100vh' }}>
      <Box
        sx={{
          width: '100%',
          maxWidth: '900px',
          background: 'linear-gradient(135deg, #0077b6, #48cae4)',
          clipPath: 'polygon(0 0, 100% 0, 80% 100%, 0% 100%)',
          color: '#ffffff',
          padding: { xs: '15px 20px', md: '20px 40px' },
          borderRadius: '12px',
          boxShadow: '0 6px 20px rgba(0, 0, 0, 0.1)',
          margin: '0 auto',
        }}
      >
        <Typography variant="h4" sx={{ fontWeight: 'bold', fontSize: { xs: '22px', md: '28px' } }}>
          Agendar Cita Dental - Admin
        </Typography>
        <Typography variant="subtitle1" sx={{ fontSize: { xs: '14px', md: '16px' }, fontStyle: 'italic', marginTop: '4px' }}>
          Selecciona el paciente, tratamiento, fecha y hora
        </Typography>
      </Box>

      <Box
        sx={{
          width: '100%',
          maxWidth: '900px',
          padding: { xs: '20px', md: '40px' },
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.1)',
          margin: '15px auto',
        }}
      >
        {/* Autocomplete para seleccionar paciente */}
        <Autocomplete
          options={patients}
          getOptionLabel={(option) => `${option.name} (${option.email})`}
          renderInput={(params) => <TextField {...params} label="Paciente" variant="outlined" />}
          onChange={(event, newValue) => setSelectedPatient(newValue)}
          sx={{ marginBottom: '20px' }}
        />

        {/* Seleccionar tratamiento */}
        <TextField
          select
          label="Tratamiento"
          value={selectedTreatment}
          onChange={(e) => setSelectedTreatment(e.target.value)}
          fullWidth
          SelectProps={{ native: true }}
          sx={{ marginBottom: '20px', backgroundColor: '#e6f7ff', borderRadius: '12px' }}
        >
          <option value="" disabled>
            Selecciona un tratamiento
          </option>
          {treatments.map((treatment) => (
            <option key={treatment.id} value={treatment.id}>
              {treatment.name} {treatment.price && `- $${treatment.price} MXN`}
            </option>
          ))}
        </TextField>

        {/* Seleccionar fecha */}
        <Box sx={{ marginBottom: '20px' }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#333', marginBottom: '10px' }}>
            Fecha de la cita
          </Typography>
          <LocalizationProvider dateAdapter={AdapterDateFns} locale={es}>
            <DatePicker
              value={selectedDate}
              onChange={(newValue) => setSelectedDate(newValue)}
              renderInput={(params) => (
                <TextField
                  {...params}
                  fullWidth
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <CalendarMonthOutlinedIcon color="primary" />
                      </InputAdornment>
                    ),
                  }}
                />
              )}
              disablePast
              inputFormat="dd/MM/yyyy"
            />
          </LocalizationProvider>
        </Box>

        {/* Seleccionar hora */}
        <TextField
          select
          label="Hora"
          value={selectedTime}
          onChange={(e) => setSelectedTime(e.target.value)}
          fullWidth
          SelectProps={{ native: true }}
          sx={{ marginBottom: '20px', backgroundColor: '#e6f7ff', borderRadius: '12px' }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <AccessTimeIcon color="primary" />
              </InputAdornment>
            ),
          }}
        >
          <option value="" disabled>
            Selecciona una hora
          </option>
          {availableTimes.map((time, index) => (
            <option key={index} value={time}>
              {time}
            </option>
          ))}
        </TextField>

        <Button
          variant="contained"
          color="primary"
          fullWidth
          onClick={handleSchedule}
          sx={{ padding: '14px', fontWeight: 'bold', borderRadius: '12px', backgroundColor: '#0077b6' }}
        >
          Confirmar Cita
        </Button>
      </Box>

      <Snackbar
        open={alert.open}
        onClose={() => setAlert({ ...alert, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        autoHideDuration={5000}
      >
        <Alert severity={alert.severity} onClose={() => setAlert({ ...alert, open: false })}>
          {alert.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AgendarCitaAdmin;
