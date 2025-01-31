import React, { useState } from "react";
import {
  Drawer,
  Toolbar,
  Box,
  Typography,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  AppBar,
  Divider,
  IconButton,
  Collapse,
} from "@mui/material";

// Iconos importados de MUI
import MenuIcon from "@mui/icons-material/Menu";
import HomeIcon from "@mui/icons-material/Home";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import PersonIcon from "@mui/icons-material/Person";
import LibraryBooksIcon from "@mui/icons-material/LibraryBooks";
import SettingsIcon from "@mui/icons-material/Settings";
import BarChartIcon from "@mui/icons-material/BarChart";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import LogoutIcon from "@mui/icons-material/Logout";

// Importa el logo del consultorio
import logo from "../../../assets/images/logo.png";

// Definición de anchos del panel lateral
const drawerWidth = 280;
const drawerCollapsedWidth = 72;

const NavbarAdmin = ({ drawerOpen, onToggleDrawer }) => {
  const [openSubmenus, setOpenSubmenus] = useState({});

  // Función para alternar el estado de un submenu
  const toggleSubmenu = (key) => {
    setOpenSubmenus((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // Definición de los ítems del menú
  const menuItems = [
    { text: "Dashboard", icon: <HomeIcon />, href: "/admin" },
    {
      text: "Citas",
      icon: <CalendarMonthIcon />,
      submenu: [
        { text: "Ver Citas Programadas", href: "/admin/citas/ver" },
        { text: "Registrar Nueva Cita", href: "/admin/citas/registrar" },
        { text: "Evaluar Citas Pendientes", href: "/admin/citas/evaluar" },
      ],
    },
    {
      text: "Tratamientos",
      icon: <ReceiptLongIcon />,
      submenu: [
        { text: "Gestionar Tratamientos Activos", href: "/admin/tratamientos/activos" },
        { text: "Tratamientos Pendientes de Evaluación", href: "/admin/tratamientos/pendientes" },
        { text: "Historial de Tratamientos", href: "/admin/tratamientos/historial" },
      ],
    },
    {
      text: "Pacientes",
      icon: <PersonIcon />,
      submenu: [
        { text: "Lista de Pacientes (Con Cuenta)", href: "/admin/pacientes/con-cuenta" },
        { text: "Lista de Pacientes (Sin Cuenta)", href: "/admin/pacientes/sin-cuenta" },
        { text: "Registrar Paciente Manualmente", href: "/admin/pacientes/registrar" },
      ],
    },
    {
      text: "Pagos",
      icon: <AttachMoneyIcon />,
      submenu: [
        { text: "Historial de Pagos", href: "/admin/pagos/historial" },
        { text: "Registrar Pago Manual", href: "/admin/pagos/registrar" },
        { text: "Comprobantes de Pago", href: "/admin/pagos/comprobantes" },
      ],
    },
    {
      text: "Catálogos",
      icon: <LibraryBooksIcon />,
      submenu: [
        { text: "Gestionar Tratamientos", href: "/admin/catalogos-tratamientos" },
        { text: "Mis Tratamientos", href: "/admin/mis-tratamientos" },
        
      ],
    },
    {
      text: "Configuración General",
      icon: <SettingsIcon />,
      submenu: [
        { text: "Misión y Visión", href: "/admin/configuracion/mision-vision" },
        { text: "Políticas del Consultorio", href: "/admin/configuracion/politicas" },
        { text: "Valores", href: "/admin/configuracion/valores" },
        { text: "Quiénes Somos", href: "/admin/configuracion/quienes-somos" },
        { text: "Configuración del Sistema", href: "/admin/configuracion/sistema" },
      ],
    },
    {
      text: "Reportes",
      icon: <BarChartIcon />,
      submenu: [
        { text: "Reporte de Citas", href: "/admin/reportes/citas" },
        { text: "Reporte de Pagos", href: "/admin/reportes/pagos" },
        { text: "Reporte de Tratamientos", href: "/admin/reportes/tratamientos" },
        { text: "Reporte de Evaluaciones Médicas", href: "/admin/reportes/evaluaciones" },
      ],
    },
    { text: "Cerrar Sesión", icon: <LogoutIcon />, href: "/admin/logout" },
  ];

  return (
    <Box sx={{ display: "flex" }}>
      {/* AppBar superior */}
      <AppBar
        position="fixed"
        sx={{
          width: drawerOpen ? `calc(100% - ${drawerWidth}px)` : `calc(100% - ${drawerCollapsedWidth}px)`,
          ml: drawerOpen ? `${drawerWidth}px` : `${drawerCollapsedWidth}px`,
          background: "#006d77",
          boxShadow: "0 6px 12px rgba(0, 0, 0, 0.15)",
          transition: "all 0.3s ease-in-out",
        }}
      >
        <Toolbar>
          <IconButton edge="start" color="inherit" onClick={onToggleDrawer}>
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ fontWeight: "bold", color: "#e0f7fa" }}>
            Panel de Administración
          </Typography>
        </Toolbar>
      </AppBar>

      {/* Drawer lateral */}
      <Drawer
        variant="permanent"
        sx={{
          width: drawerOpen ? drawerWidth : drawerCollapsedWidth,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: {
            width: drawerOpen ? drawerWidth : drawerCollapsedWidth,
            boxSizing: "border-box",
            display: "flex",
            flexDirection: "column",
            backgroundColor: "rgba(3, 68, 94, 0.9)",
            color: "#d2f4ea",
            transition: "all 0.3s ease-in-out",
          },
        }}
      >
        {/* Encabezado del Drawer */}
        <Toolbar
          sx={{
            justifyContent: "center",
            padding: drawerOpen ? "16px" : "8px",
            background: "#0096c7",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <Box
            component="img"
            src={logo}
            alt="Logo Consultorio Dental Velázquez"
            sx={{
              width: drawerOpen ? "100px" : "40px",
              height: drawerOpen ? "100px" : "40px",
              borderRadius: "50%",
            }}
          />
          {drawerOpen && (
            <Typography variant="h6" sx={{ fontWeight: "bold", color: "#e0f7fa", marginTop: "8px" }}>
              Consultorio Dental Velázquez
            </Typography>
          )}
        </Toolbar>

        {/* Menú del Drawer */}
        <Box sx={{ flexGrow: 1, overflowY: "auto" }}>
          <Divider sx={{ backgroundColor: "#78c1c8" }} />
          <List>
            {menuItems.map((item, index) => (
              <React.Fragment key={index}>
                <ListItem disablePadding>
                  <ListItemButton onClick={() => item.submenu && toggleSubmenu(index)}>
                    <ListItemIcon>{item.icon}</ListItemIcon>
                    <ListItemText primary={item.text} sx={{ display: drawerOpen ? "block" : "none" }} />
                    {item.submenu && drawerOpen && (openSubmenus[index] ? <ExpandLessIcon /> : <ExpandMoreIcon />)}
                  </ListItemButton>
                </ListItem>
                {item.submenu && (
                  <Collapse in={openSubmenus[index] && drawerOpen} timeout="auto" unmountOnExit>
                    <List component="div" disablePadding>
                      {item.submenu.map((subItem, subIndex) => (
                        <ListItem key={subIndex} disablePadding>
                          <ListItemButton href={subItem.href} sx={{ pl: 4 }}>
                            <ListItemText primary={subItem.text} />
                          </ListItemButton>
                        </ListItem>
                      ))}
                    </List>
                  </Collapse>
                )}
              </React.Fragment>
            ))}
          </List>
        </Box>
      </Drawer>
    </Box>
  );
};

export default NavbarAdmin;
