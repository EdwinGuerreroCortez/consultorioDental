import React, { useState, useEffect } from "react";
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
  Snackbar,
  Alert,
  Menu,
  MenuItem,
  Badge,
  Tooltip,
  CircularProgress,
} from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";

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
import NotificationsIcon from "@mui/icons-material/Notifications";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import LockIcon from "@mui/icons-material/Lock";

import logo from "../../../assets/images/logo.png";

// Constantes de diseño
const drawerWidth = 280;
const drawerCollapsedWidth = 72;

const NavbarAdmin = ({ drawerOpen, onToggleDrawer }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [openSubmenus, setOpenSubmenus] = useState({});
  const [alertaExito, setAlertaExito] = useState(false);
  const [anchorElNotifications, setAnchorElNotifications] = useState(null);
  const [anchorElProfile, setAnchorElProfile] = useState(null);
  const [notificacionesCitas, setNotificacionesCitas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [csrfToken, setCsrfToken] = useState(null); // Nuevo estado para el token CSRF

  // Datos estáticos para notificaciones y perfil
  const notifications = [
    { title: "Launch Admin", message: "Just see the my new admin!", time: "9:30 AM", read: false },
    { title: "Event Today", message: "Just a reminder that you have event", time: "9:10 AM", read: false },
    { title: "Event Today", message: "Just a reminder that you have event", time: "9:08 AM", read: true },
    { title: "Launch Today", message: "Just see the my new admin!", time: "9:20 AM", read: false },
  ];

  const profile = {
    name: "Markan Doe",
    email: "info@materialpro.com",
    role: "Administrador",
  };

  // Obtener el token CSRF al montar el componente
  useEffect(() => {
    const obtenerTokenCSRF = async () => {
      try {
        setLoading(true);
        const response = await fetch("http://localhost:4000/api/get-csrf-token", {
          credentials: "include",
        });
        const data = await response.json();
        setCsrfToken(data.csrfToken); // Guardar el token en el estado
      } catch (error) {
        console.error("Error obteniendo el token CSRF:", error);
      } finally {
        setLoading(false);
      }
    };
    obtenerTokenCSRF();
  }, []);

  useEffect(() => {
    menuItems.forEach((item, index) => {
      if (item.submenu) {
        const isActive = item.submenu.some((subItem) => location.pathname.includes(subItem.href));
        if (isActive) {
          setOpenSubmenus((prev) => ({ ...prev, [index]: true }));
        }
      }
    });
  }, [location.pathname]);

  useEffect(() => {
    obtenerNotificacionesCitas();
  }, []);

  const obtenerNotificacionesCitas = async () => {
    try {
      setLoading(true);
      const response = await fetch("http://localhost:4000/api/citas/notificaciones", {
        credentials: "include",
      });
      if (!response.ok) throw new Error("Error al obtener notificaciones");
      const data = await response.json();
      setNotificacionesCitas(data.notificaciones);
    } catch (error) {
      console.error("Error al obtener notificaciones de citas:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!drawerOpen) {
      setOpenSubmenus({});
    }
  }, [drawerOpen]);

  const toggleSubmenu = (key) => {
    if (!drawerOpen) {
      onToggleDrawer();
      setTimeout(() => {
        setOpenSubmenus((prev) => ({ ...prev, [key]: true }));
      }, 300);
    } else {
      setOpenSubmenus((prev) => ({ ...prev, [key]: !prev[key] }));
    }
  };

  const cerrarSesion = async () => {
    if (!csrfToken) {
      console.error("Token CSRF no disponible");
      return;
    }

    try {
      setLoading(true);
      const response = await fetch("http://localhost:4000/api/usuarios/logout", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "X-XSRF-TOKEN": csrfToken,
        },
      });

      if (response.ok) {
        setAlertaExito(true);
        setTimeout(() => {
          setAlertaExito(false);
          navigate("/login");
        }, 2000);
      } else {
        console.error("Error al cerrar sesión:", await response.json());
      }
    } catch (error) {
      console.error("Error en la solicitud de cierre de sesión:", error);
    } finally {
      setLoading(false);
    }
  };

  // Handlers para los menús de notificaciones y perfil
  const handleNotificationsClick = (event) => {
    setAnchorElNotifications(event.currentTarget);
  };

  const handleNotificationsClose = () => {
    setAnchorElNotifications(null);
  };

  const handleProfileClick = (event) => {
    setAnchorElProfile(event.currentTarget);
  };

  const handleProfileClose = () => {
    setAnchorElProfile(null);
  };

  const markNotificationAsRead = (index) => {
    setNotificacionesCitas((prev) =>
      prev.map((notif, i) => (i === index ? { ...notif, read: true } : notif))
    );
  };

  const menuItems = [
    { text: "Dashboard", icon: <HomeIcon />, href: "/admin" },
    {
      text: "Citas",
      icon: <CalendarMonthIcon />,
      submenu: [
        { text: "Ver Citas Programadas", href: "/admin/citas-ver" },
        { text: "Registrar Nueva Cita", href: "/admin/citas-registrar" },
        { text: "Valorar Citas Pendientes", href: "/admin/citas-valorar" },
      ],
    },
    {
      text: "Tratamientos",
      icon: <ReceiptLongIcon />,
      submenu: [
        { text: "Procesos en Curso", href: "/admin/procesos-en-curso" },
        { text: "Procesos Pendientes de Valoración", href: "/admin/tratamientos-pendientes" },
        { text: "Historial de Procesos Terminados", href: "/admin/tratamientos-historial" },
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
        { text: "Historial de Pagos", href: "/admin/pagos-historial" },
        { text: "Registrar Pago Manual", href: "/admin/pagos-registrar" },
      ],
    },
    {
      text: "Mis Procesos",
      icon: <LibraryBooksIcon />,
      submenu: [
        { text: "Subir Nuevo Proceso", href: "/admin/catalogos-tratamientos" },
        { text: "Lista de Procesos", href: "/admin/mis-tratamientos" },
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
    { text: "Cerrar Sesión", icon: <LogoutIcon />, action: cerrarSesion },
  ];

  return (
    <Box sx={{ display: "flex", fontFamily: "'Poppins', sans-serif" }}>
      {/* AppBar con colores originales */}
      <AppBar
        position="fixed"
        sx={{
          width: drawerOpen ? `calc(100% - ${drawerWidth}px)` : `calc(100% - ${drawerCollapsedWidth}px)`,
          ml: drawerOpen ? `${drawerWidth}px` : `${drawerCollapsedWidth}px`,
          background: "#006d77",
          boxShadow: "0 6px 12px rgba(0, 0, 0, 0.15)",
          transition: "all 0.2s ease-in-out",
        }}
      >
        <Toolbar sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <IconButton edge="start" color="inherit" onClick={onToggleDrawer} aria-label="Menú">
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" noWrap component="div" sx={{ fontWeight: "bold", color: "#e0f7fa" }}>
              Panel de Administración
            </Typography>
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Tooltip title="Notificaciones">
              <IconButton color="inherit" onClick={handleNotificationsClick} aria-label="Notificaciones">
                <Badge badgeContent={notificacionesCitas.filter((n) => !n.read).length} color="error">
                  <NotificationsIcon />
                </Badge>
              </IconButton>
            </Tooltip>
            <Tooltip title="Perfil">
              <IconButton color="inherit" onClick={handleProfileClick} aria-label="Perfil">
                <AccountCircleIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Menú de notificaciones mejorado */}
      <Menu
        anchorEl={anchorElNotifications}
        open={Boolean(anchorElNotifications)}
        onClose={handleNotificationsClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
        PaperProps={{
          sx: {
            width: 300,
            maxHeight: 400,
            backgroundColor: "#fff",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
            borderRadius: "8px",
          },
        }}
      >
        <MenuItem sx={{ backgroundColor: "#006d77", color: "#e0f7fa", pointerEvents: "none" }}>
          <Typography variant="subtitle1">Notificaciones</Typography>
        </MenuItem>
        <MenuItem sx={{ pointerEvents: "none" }}>
          <Typography variant="body2" color="textSecondary">
            Tienes {notificacionesCitas.filter((n) => !n.read).length} notificaciones sin leer
          </Typography>
        </MenuItem>
        {notificacionesCitas.length > 0 ? (
          notificacionesCitas.map((notification, index) => (
            <MenuItem
              key={index}
              onClick={() => markNotificationAsRead(index)}
              sx={{
                backgroundColor: notification.read ? "#f5f5f5" : "#fff",
                "&:hover": { backgroundColor: "#78c1c8" },
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Box
                  sx={{
                    width: 10,
                    height: 10,
                    borderRadius: "50%",
                    backgroundColor: notification.read ? "#ccc" : index % 2 === 0 ? "#00c4b4" : "#f06292",
                  }}
                />
                <Box>
                  <Typography variant="body2">{notification.mensaje}</Typography>
                  <Typography variant="caption" color="textSecondary">
                    {new Date(notification.fecha_hora).toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" })}
                  </Typography>
                </Box>
              </Box>
            </MenuItem>
          ))
        ) : (
          <MenuItem>
            <Typography variant="body2" color="textSecondary">
              No hay notificaciones
            </Typography>
          </MenuItem>
        )}
      </Menu>

      {/* Menú de perfil mejorado */}
      <Menu
        anchorEl={anchorElProfile}
        open={Boolean(anchorElProfile)}
        onClose={handleProfileClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
        PaperProps={{
          sx: {
            width: 250,
            backgroundColor: "#fff",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
            borderRadius: "8px",
          },
        }}
      >
        <MenuItem sx={{ pointerEvents: "none", backgroundColor: "#006d77", color: "#e0f7fa" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <AccountCircleIcon sx={{ fontSize: 40 }} />
            <Box>
              <Typography variant="subtitle1">{profile.name}</Typography>
              <Typography variant="body2" color="textSecondary">
                {profile.email}
              </Typography>
              <Typography variant="caption" color="textSecondary">
                {profile.role}
              </Typography>
            </Box>
          </Box>
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleProfileClose}>
          <ListItemIcon>
            <AccountCircleIcon fontSize="small" />
          </ListItemIcon>
          <Typography variant="body2">Mi Perfil</Typography>
        </MenuItem>
        <MenuItem onClick={handleProfileClose}>
          <ListItemIcon>
            <LockIcon fontSize="small" />
          </ListItemIcon>
          <Typography variant="body2">Cambiar Contraseña</Typography>
        </MenuItem>
        <Divider />
        <MenuItem onClick={cerrarSesion}>
          <ListItemIcon>
            <LogoutIcon fontSize="small" />
          </ListItemIcon>
          <Typography variant="body2">Cerrar Sesión</Typography>
        </MenuItem>
      </Menu>

      {/* Drawer con colores y animaciones originales */}
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
            transition: "width 0.2s ease-in-out",
            overflowX: "hidden",
            boxShadow: "4px 0 12px rgba(0, 0, 0, 0.2)",
          },
        }}
      >
        <Toolbar
          sx={{
            height: drawerOpen ? "180px" : "64px",
            justifyContent: "center",
            padding: "16px",
            background: "#0096c7",
            flexDirection: "column",
            alignItems: "center",
            flexShrink: 0,
            transition: "height 0.2s ease-in-out",
          }}
        >
          <Box
            component="img"
            src={logo}
            alt="Logo Consultorio Dental Velázquez"
            sx={{
              width: drawerOpen ? "90px" : "40px",
              height: drawerOpen ? "90px" : "40px",
              objectFit: "contain",
              borderRadius: "50%",
              transition: "all 0.2s ease-in-out",
              marginBottom: drawerOpen ? "8px" : "0",
              boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
            }}
          />
          {drawerOpen && (
            <Typography
              variant="subtitle1"
              sx={{
                fontWeight: "bold",
                color: "#e0f7fa",
                textAlign: "center",
                wordWrap: "break-word",
                whiteSpace: "normal",
                maxWidth: "220px",
                fontSize: "1rem",
              }}
            >
              Consultorio Dental Velázquez
            </Typography>
          )}
        </Toolbar>

        <Box
          sx={{
            flexGrow: 1,
            overflowY: "auto",
            overflowX: "hidden",
            "&::-webkit-scrollbar": {
              width: "8px",
            },
            "&::-webkit-scrollbar-track": {
              background: "#03445e",
            },
            "&::-webkit-scrollbar-thumb": {
              background: "#78c1c8",
              borderRadius: "4px",
            },
            "&::-webkit-scrollbar-thumb:hover": {
              background: "#0096c7",
            },
          }}
        >
          <Divider sx={{ backgroundColor: "#78c1c8" }} />
          <List sx={{ padding: 0 }}>
            {menuItems.map((item, index) => (
              <React.Fragment key={index}>
                <ListItem disablePadding>
                  <Tooltip title={!drawerOpen ? item.text : ""} placement="right">
                    <ListItemButton
                      onClick={() => {
                        if (item.action) {
                          item.action();
                        } else if (item.submenu) {
                          toggleSubmenu(index);
                        } else {
                          navigate(item.href);
                        }
                      }}
                      sx={{
                        minWidth: 0,
                        justifyContent: drawerOpen ? "initial" : "center",
                        padding: "10px 16px",
                        "&:hover": {
                          backgroundColor: "#78c1c8",
                        },
                        backgroundColor: location.pathname === item.href ? "#78c1c8" : "transparent",
                      }}
                    >
                      <ListItemIcon
                        sx={{
                          color: "#d2f4ea",
                          minWidth: 0,
                          marginRight: drawerOpen ? "16px" : "0",
                          fontSize: "1.2rem",
                        }}
                      >
                        {item.icon}
                      </ListItemIcon>
                      <ListItemText
                        primary={item.text}
                        sx={{
                          display: drawerOpen ? "block" : "none",
                          "& .MuiTypography-root": {
                            fontSize: "0.9rem",
                            fontWeight: "medium",
                          },
                        }}
                      />
                      {item.submenu && drawerOpen && (
                        <Box sx={{ marginLeft: "auto" }}>
                          {openSubmenus[index] ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                        </Box>
                      )}
                    </ListItemButton>
                  </Tooltip>
                </ListItem>
                {item.submenu && drawerOpen && (
                  <Collapse in={openSubmenus[index]} timeout="auto" unmountOnExit>
                    <List component="div" disablePadding sx={{ backgroundColor: "rgba(0, 0, 0, 0.1)" }}>
                      {item.submenu.map((subItem, subIndex) => (
                        <ListItem key={subIndex} disablePadding>
                          <ListItemButton
                            onClick={() => navigate(subItem.href)}
                            sx={{
                              pl: 6,
                              "&:hover": {
                                backgroundColor: "#78c1c8",
                              },
                              backgroundColor: location.pathname === subItem.href ? "#78c1c8" : "transparent",
                            }}
                          >
                            <ListItemText
                              primary={subItem.text}
                              sx={{
                                "& .MuiTypography-root": {
                                  fontSize: "0.85rem",
                                  fontWeight: "medium",
                                },
                              }}
                            />
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

      {/* Indicador de carga */}
      {loading && (
        <Box
          sx={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 9999,
          }}
        >
          <CircularProgress color="inherit" />
        </Box>
      )}

      {/* Snackbar con colores originales */}
      <Snackbar
        open={alertaExito}
        autoHideDuration={2000}
        onClose={() => setAlertaExito(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
      >
        <Alert onClose={() => setAlertaExito(false)} severity="success" sx={{ width: "100%" }}>
          Sesión cerrada correctamente.
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default NavbarAdmin;