import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Typography from '@mui/material/Typography';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import { Box } from '@mui/material';

const routeNames = {
  publico: {
    "": "Inicio",
    "catalogo-servicios": "Catalogo de Servicios",
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

  const [dynamicName, setDynamicName] = useState('');
  const userRoutes = routeNames[userType] || {};

  useEffect(() => {
    const fetchServiceName = async (hash) => {
      try {
        const response = await fetch(`https://backenddent.onrender.com/api/tratamientos/${hash}/detalle`);
        if (response.ok) {
          const data = await response.json();
          setDynamicName(data.nombre || 'Servicio desconocido');
        } else {
          setDynamicName('Servicio desconocido');
        }
      } catch {
        setDynamicName('Servicio desconocido');
      }
    };

    const lastSegment = pathnames[pathnames.length - 1];
    if (lastSegment && lastSegment.length === 64) {
      fetchServiceName(lastSegment);
    }
  }, [pathnames]);

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
        <Link to={`/${userType === "publico" ? "" : userType}`}>Inicio</Link>

        {pathnames.map((value, index) => {
          const fullPath = `/${pathnames.slice(0, index + 1).join('/')}`;
          const isLast = index === pathnames.length - 1;

          // Determinar si es un hash
          const isHash = value.length === 64;

          // Mostrar nombre dinámico si es un hash, o el nombre estático si no lo es
          let displayName;
          if (isLast && isHash) {
            displayName = dynamicName || '';
          } else {
            displayName = userRoutes[value] || value.replace(/-/g, ' ');
          }

          return isLast ? (
            <Typography key={fullPath} color="text.primary" sx={{ fontWeight: 'bold', color: '#023e8a' }}>
              {displayName}
            </Typography>
          ) : (
            <Link key={fullPath} to={fullPath}>
              {displayName}
            </Link>
          );
        })}
      </Breadcrumbs>
    </Box>
  );
};

export default BreadcrumbNav;
