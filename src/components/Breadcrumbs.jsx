import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Typography from '@mui/material/Typography';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import { Box } from '@mui/material';

// Definición de nombres para cada tipo de usuario
const routeNames = {
  publico: {
    "": "Inicio",
    "catalogo-servicios": "Servicios",
    "login": "Login",
    "registro": "Registro"
  },
  paciente: {
    "": "Inicio",
    "paciente": "Inicio del Paciente",
    "mis-citas": "Mis Citas",
    "citas-agendadas": "Citas Agendadas",
    "agendar-cita": "Agendar Cita",
    "tratamientos": "Tratamientos",
    "historial-tratamientos": "Historial de Tratamientos",
    "pagos": "Pagos",
    "historial-pagos": "Historial de Pagos"
  },
  admin: {
    "admin": "Dashboard",
    "admin/citas": "Citas",
    "admin/citas-ver": "Ver Citas",
    "admin/tratamientos": "Tratamientos",
    "admin/tratamientos-activos": "Tratamientos Activos",
    "admin/configuracion": "Configuración",
    "admin/configuracion-sistema": "Sistema"
  }
};

const BreadcrumbNav = ({ userType = "publico" }) => {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter((x) => x);

  const userRoutes = routeNames[userType] || {};

  return (
    <Box sx={{ padding: 2, backgroundColor: "#f5f5f5", borderRadius: "8px" }}>
      <Breadcrumbs
        aria-label="breadcrumb"
        separator={<NavigateNextIcon fontSize="small" />}
        sx={{
          '& a': {
            textDecoration: 'none',
            fontWeight: 'bold',
            color: '#0077b6',
            '&:hover': {
              color: '#005f8c',
              textDecoration: 'underline',
            },
          },
        }}
      >
        {/* Enlace dinámico según el tipo de usuario */}
        <Link to={`/${userType === "publico" ? "" : userType}`}>Inicio</Link>
        
        {pathnames.map((value, index) => {
          // Generar la ruta completa actual
          const fullPath = `/${pathnames.slice(0, index + 1).join('/')}`;
          const isLast = index === pathnames.length - 1;

          return isLast ? (
            <Typography key={fullPath} color="text.primary" sx={{ fontWeight: 'bold', color: '#023e8a' }}>
              {userRoutes[fullPath.substring(1)] || value.replace(/-/g, ' ')}
            </Typography>
          ) : (
            <Link key={fullPath} to={fullPath}>
              {userRoutes[fullPath.substring(1)] || value.replace(/-/g, ' ')}
            </Link>
          );
        })}
      </Breadcrumbs>
    </Box>
  );
};

export default BreadcrumbNav;
