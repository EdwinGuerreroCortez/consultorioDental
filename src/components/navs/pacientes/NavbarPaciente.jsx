import React, { useState, useEffect, useRef } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Divider,
  Collapse,
  TextField,
  Snackbar,
  Alert,
  Tooltip,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import HomeIcon from "@mui/icons-material/Home";
import ListAltIcon from "@mui/icons-material/ListAlt";
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import SearchIcon from "@mui/icons-material/Search";
import InputAdornment from "@mui/material/InputAdornment";

import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import LoginIcon from "@mui/icons-material/Login";
import LogoutIcon from "@mui/icons-material/Logout";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import "@fontsource/poppins";
import logo from "../../../assets/images/logo.png";

const NavbarPaciente = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [showNavbar, setShowNavbar] = useState(true);
  const [lastScroll, setLastScroll] = useState(0);
  const [servicesOpen, setServicesOpen] = useState(false);
  const [subMenuOpen, setSubMenuOpen] = useState(false);
  const [paymentsOpen, setPaymentsOpen] = useState(false); // Nueva variable para el submenú de Pagos
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const searchBoxRef = useRef(null);  // Referencia para la caja de búsqueda
  const [alertaExito, setAlertaExito] = useState(false);


  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchBoxRef.current && !searchBoxRef.current.contains(event.target)) {
        setSearchResults([]);  // Cierra el cuadro de resultados
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  

  // Función para manejar la búsqueda
  const handleSearch = async (event) => {
    const term = event.target.value;
    setSearchTerm(term);

    if (term.length > 0) {
      try {
        const response = await fetch(`http://localhost:4000/api/tratamientos/buscar?search=${term}`);
        const results = await response.json();
        // Filtrar en el frontend para asegurar coincidencias exactas (opcional si el backend ya lo hace)
        const filteredResults = results.filter((result) => {
          const regex = new RegExp(term, "i");  // Coincidencias consecutivas y sin distinguir mayúsculas
          return regex.test(result.nombre);
        });
        setSearchResults(results);
      } catch (error) {
        console.error("Error en la búsqueda:", error);
      }
    } else {
      setSearchResults([]);
    }

  };
  // Función para manejar el cierre de sesión
  const cerrarSesion = async () => {
    try {
      const csrfToken = document.cookie
        .split('; ')
        .find(row => row.startsWith('XSRF-TOKEN='))
        ?.split('=')[1];
  
      const response = await fetch('http://localhost:4000/api/usuarios/logout', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'X-XSRF-TOKEN': csrfToken, // Incluir el token CSRF en la solicitud
        },
      });
  
      if (response.ok) {
        setAlertaExito(true);
        setTimeout(() => {
          setAlertaExito(false);
          window.location.href = '/';
        }, 2000);
      } else {
        const errorData = await response.json();
        console.error('Error al cerrar sesión:', errorData);
      }
    } catch (error) {
      console.error('Error en la solicitud de cierre de sesión:', error);
    }
  };
  

  const toggleDrawer = (open) => (event) => {
    if (event.type === "keydown" && (event.key === "Tab" || event.key === "Shift")) {
      return;
    }
    setDrawerOpen(open);
  };

  useEffect(() => {
    const handleScroll = () => {
      const currentScroll = window.scrollY;
      if (currentScroll > lastScroll && currentScroll > 100) {
        setShowNavbar(false);
      } else {
        setShowNavbar(true);
      }
      setLastScroll(currentScroll);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScroll]);

  const theme = createTheme({
    typography: {
      fontFamily: "Poppins, Arial, sans-serif",
    },
  });
  // Función para resaltar coincidencias
  const highlightMatch = (text, searchTerm) => {
    if (!searchTerm) return text;

    // Escapar caracteres especiales y crear una expresión regular
    const regex = new RegExp(`(${searchTerm})`, "gi");

    // Dividir el texto en partes
    const parts = text.split(regex);

    // Mapear las partes, subrayando las que coincidan
    return parts.map((part, index) =>
      part.toLowerCase() === searchTerm.toLowerCase() ? (
        <Typography
          key={index}
          component="span"
          sx={{ fontWeight: "bold", textDecoration: "underline", color: "#d32f2f" }}
        >
          {part}
        </Typography>
      ) : (
        part
      )
    );
  };
  return (
    <ThemeProvider theme={theme}>
      <AppBar
        sx={{
          height: "100px",
          background: "linear-gradient(90deg, #0077b6, #00aaff)",
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.2)",
          transform: showNavbar ? "translateY(0)" : "translateY(-100%)",
          transition: "transform 0.4s ease-in-out",
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          zIndex: 10,
        }}
      >
        <Toolbar sx={{ height: "100%", display: "flex", alignItems: "center", paddingX: 2 }}>
          <IconButton
            color="inherit"
            edge="start"
            onClick={toggleDrawer(true)}
            sx={{ display: { xs: "block", md: "none" } }}
          >
            <MenuIcon />
          </IconButton>

          <Box sx={{ flexGrow: 1, display: "flex", alignItems: "center" }}>
            <img
              src={logo}
              alt="Consultorio Dental"
              style={{ height: "100px", width: "auto", marginRight: "12px", borderRadius: "50px" }}
            />
            <Typography variant="h6" sx={{ fontWeight: "bold", color: "#ffffff" }}>
              Consultorio Dental
            </Typography>
            <Box sx={{ marginLeft: "16px", flexGrow: 1, maxWidth: "400px", position: "relative" }} ref={searchBoxRef}>
              <TextField
                fullWidth
                variant="outlined"
                placeholder="Buscar servicios..."
                value={searchTerm}
                onChange={handleSearch}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ color: "#0077b6" }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  backgroundColor: "#ffffff",
                  borderRadius: "8px",
                  "& .MuiOutlinedInput-root": {
                    "& fieldset": { borderColor: "#0077b6" },
                    "&:hover fieldset": { borderColor: "#005f8a" },
                  },
                }}
              />
              {searchResults.length > 0 && (
                <Box
                  sx={{
                    position: "absolute",
                    top: "100%",
                    left: 0,
                    backgroundColor: "#ffffff",
                    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                    borderRadius: "8px",
                    marginTop: "8px",
                    width: "100%",
                    zIndex: 9999,
                    padding: "8px 0",
                  }}
                >
                  <List>
                    {searchResults.slice(0, 5).map((result) => (
                      <ListItem key={result.id} disablePadding>
                        <ListItemButton
                          href={`/paciente/catalogo-servicios/${result.hash}`}
                          sx={{
                            color: "#0077b6",
                            "&:hover": {
                              backgroundColor: "#0077b6",
                              color: "#ffffff",
                            },
                          }}
                        >
                          <ListItemText
                            primary={highlightMatch(result.nombre, searchTerm)}
                            sx={{
                              "& .MuiListItemText-primary": {
                                fontWeight: "bold",
                              },
                            }}
                          />
                        </ListItemButton>
                      </ListItem>
                    ))}
                  </List>
                </Box>
              )}
            </Box>

          </Box>

          {/* Menú en pantalla grande */}
          <Box sx={{ display: { xs: "none", md: "flex" }, alignItems: "center" }}>
  {/* Botón Inicio */}
  <Tooltip title="Inicio" placement="top" arrow>
    <Button
      color="inherit"
      href="/paciente"
      sx={{
        fontWeight: "bold",
        fontSize: "16px",
        color: "#ffffff",
        borderRadius: "8px",
        padding: "8px 16px",
        marginX: 1,
        "&:hover": { backgroundColor: "rgba(255, 255, 255, 0.2)" },
      }}
    >
      <HomeIcon />
    </Button>
  </Tooltip>

  {/* Botón Mis Citas con submenú */}
  <Box
    sx={{
      position: "relative",
      marginX: 1,
      "&:hover .submenu": {
        display: "block",
      },
    }}
  >
    <Tooltip  placement="top" arrow>
      <Button
        color="inherit"
        sx={{
          fontWeight: "bold",
          fontSize: "16px",
          color: "#ffffff",
          borderRadius: "8px",
          padding: "8px 16px",
          display: "flex",
          alignItems: "center",
          "&:hover": { backgroundColor: "rgba(255, 255, 255, 0.2)" },
        }}
      >
        <CalendarMonthIcon />
      </Button>
    </Tooltip>

    <Box
      className="submenu"
      sx={{
        display: "none",
        position: "absolute",
        top: "100%",
        left: 0,
        background: "#e0f7fa",
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
        borderRadius: "8px",
        overflow: "hidden",
        zIndex: 20,
        width: "200px",
        transition: "all 0.3s ease-in-out",
      }}
    >
      <List>
        <ListItem disablePadding>
          <ListItemButton href="/citas-agendadas">
            <ListItemText
              primary="Citas Agendadas"
              sx={{
                color: "#01579b",
                "&:hover": { color: "#ffffff", backgroundColor: "#80deea" },
              }}
            />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton href="/agendar-cita">
            <ListItemText
              primary="Agendar Cita"
              sx={{
                color: "#01579b",
                "&:hover": { color: "#ffffff", backgroundColor: "#80deea" },
              }}
            />
          </ListItemButton>
        </ListItem>
      </List>
    </Box>
  </Box>

  {/* Botón Tratamientos con submenú */}
  <Box
    sx={{
      position: "relative",
      marginX: 1,
      "&:hover .submenu": {
        display: "block",
      },
    }}
  >
    <Tooltip  placement="top" arrow>
      <Button
        color="inherit"
        sx={{
          fontWeight: "bold",
          fontSize: "16px",
          color: "#ffffff",
          borderRadius: "8px",
          padding: "8px 16px",
          display: "flex",
          alignItems: "center",
          "&:hover": { backgroundColor: "rgba(255, 255, 255, 0.2)" },
        }}
      >
        <ReceiptLongIcon />
      </Button>
    </Tooltip>

    <Box
      className="submenu"
      sx={{
        display: "none",
        position: "absolute",
        top: "100%",
        left: 0,
        background: "#e0f7fa",
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
        borderRadius: "8px",
        overflow: "hidden",
        zIndex: 20,
        width: "200px",
        transition: "all 0.3s ease-in-out",
      }}
    >
      <List>
        <ListItem disablePadding>
          <ListItemButton href="/tratamientos-activos">
            <ListItemText
              primary="Tratamientos Activos"
              sx={{
                color: "#01579b",
                "&:hover": { color: "#ffffff", backgroundColor: "#80deea" },
              }}
            />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton href="/historial-tratamientos">
            <ListItemText
              primary="Historial de Tratamientos"
              sx={{
                color: "#01579b",
                "&:hover": { color: "#ffffff", backgroundColor: "#80deea" },
              }}
            />
          </ListItemButton>
        </ListItem>
      </List>
    </Box>
  </Box>

  {/* Botón Pagos con submenú */}
  <Box
    sx={{
      position: "relative",
      marginX: 1,
      "&:hover .submenu": {
        display: "block",
      },
    }}
  >
    <Tooltip  placement="top" arrow>
      <Button
        color="inherit"
        sx={{
          fontWeight: "bold",
          fontSize: "16px",
          color: "#ffffff",
          borderRadius: "8px",
          padding: "8px 16px",
          display: "flex",
          alignItems: "center",
          "&:hover": { backgroundColor: "rgba(255, 255, 255, 0.2)" },
        }}
      >
        <AttachMoneyIcon />
      </Button>
    </Tooltip>

    <Box
      className="submenu"
      sx={{
        display: "none",
        position: "absolute",
        top: "100%",
        left: 0,
        background: "#e0f7fa",
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
        borderRadius: "8px",
        overflow: "hidden",
        zIndex: 20,
        width: "200px",
        transition: "all 0.3s ease-in-out",
      }}
    >
      <List>
        <ListItem disablePadding>
          <ListItemButton href="/historial-pagos">
            <ListItemText
              primary="Historial de Pagos"
              sx={{
                color: "#01579b",
                "&:hover": { color: "#ffffff", backgroundColor: "#80deea" },
              }}
            />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton href="/facturacion">
            <ListItemText
              primary="Facturación"
              sx={{
                color: "#01579b",
                "&:hover": { color: "#ffffff", backgroundColor: "#80deea" },
              }}
            />
          </ListItemButton>
        </ListItem>
      </List>
    </Box>
  </Box>

  {/* Botón Servicios */}
  <Tooltip title="Servicios" placement="top" arrow>
    <Button
      color="inherit"
      href="/paciente/catalogo-servicios"
      sx={{
        fontWeight: "bold",
        fontSize: "16px",
        color: "#ffffff",
        borderRadius: "8px",
        padding: "8px 16px",
        marginX: 1,
        "&:hover": { backgroundColor: "rgba(255, 255, 255, 0.2)" },
      }}
    >
      <ListAltIcon />
    </Button>
  </Tooltip>

  {/* Botón Perfil */}
  <Tooltip title="Perfil" placement="top" arrow>
    <Button
      color="inherit"
      href="/perfil"
      sx={{
        fontWeight: "bold",
        fontSize: "16px",
        color: "#ffffff",
        borderRadius: "8px",
        padding: "8px 16px",
        marginX: 1,
        "&:hover": { backgroundColor: "rgba(255, 255, 255, 0.2)" },
      }}
    >
      <AccountCircleIcon />
    </Button>
  </Tooltip>

  {/* Botón Cerrar Sesión */}
  <Tooltip title="Cerrar Sesión" placement="top" arrow>
    <Button
      color="inherit"
      onClick={cerrarSesion}
      sx={{
        fontWeight: "bold",
        fontSize: "16px",
        color: "#ffffff",
        borderRadius: "8px",
        padding: "8px 16px",
        marginX: 1,
        "&:hover": { backgroundColor: "rgba(255, 255, 255, 0.2)" },
      }}
    >
      <LogoutIcon />
    </Button>
  </Tooltip>
</Box>
        </Toolbar>
      </AppBar>

      {/* Menú lateral */}

      <Drawer anchor="left" open={drawerOpen} onClose={toggleDrawer(false)}>
        <Box
          sx={{
            width: 250,
            backgroundColor: "#e0f7fa",
            height: "100%",
          }}
          role="presentation"
        >
          <Typography
            variant="h6"
            sx={{
              padding: "16px",
              fontWeight: "bold",
              textAlign: "center",
              background: "linear-gradient(90deg, #0077b6, #00aaff)",
              color: "#ffffff",
            }}
          >
            Consultorio Dental
          </Typography>
          <Divider />

          <List>
            {/* Opción de Inicio */}
            <ListItem disablePadding>
              <ListItemButton href="/paciente" onClick={toggleDrawer(false)}>
                <HomeIcon sx={{ marginRight: "10px", color: "#01579b" }} />
                <ListItemText
                  primary="Inicio"
                  sx={{
                    color: "#01579b",
                    "& .MuiListItemText-primary": { fontWeight: "bold" },
                  }}
                />
              </ListItemButton>
            </ListItem>

            {/* Submenú para Mis Citas */}
            <ListItem disablePadding>
              <ListItemButton onClick={(event) => { event.stopPropagation(); setServicesOpen(!servicesOpen); }}>
                <CalendarMonthIcon sx={{ marginRight: "10px", color: "#01579b" }} />
                <ListItemText
                  primary="Mis Citas"
                  sx={{
                    color: "#01579b",
                    "& .MuiListItemText-primary": { fontWeight: "bold" },
                  }}
                />
                {servicesOpen ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              </ListItemButton>
            </ListItem>

            <Collapse in={servicesOpen} timeout="auto" unmountOnExit>
              <List component="div" disablePadding>
                <ListItem disablePadding>
                  <ListItemButton href="/citas-agendadas" sx={{ paddingLeft: 4 }} onClick={toggleDrawer(false)}>
                    <ListItemText
                      primary="Citas Agendadas"
                      sx={{
                        color: "#0077b6",
                        "&:hover": { color: "#ffffff", backgroundColor: "#80deea" },
                      }}
                    />
                  </ListItemButton>
                </ListItem>
                <ListItem disablePadding>
                  <ListItemButton href="/agendar-cita" sx={{ paddingLeft: 4 }} onClick={toggleDrawer(false)}>
                    <ListItemText
                      primary="Agendar Cita"
                      sx={{
                        color: "#0077b6",
                        "&:hover": { color: "#ffffff", backgroundColor: "#80deea" },
                      }}
                    />
                  </ListItemButton>
                </ListItem>
              </List>
            </Collapse>

            {/* Submenú para Tratamientos */}
            <ListItem disablePadding>
              <ListItemButton onClick={(event) => { event.stopPropagation(); setSubMenuOpen(!subMenuOpen); }}>
                <ReceiptLongIcon sx={{ marginRight: "10px", color: "#01579b" }} />
                <ListItemText
                  primary="Tratamientos"
                  sx={{
                    color: "#01579b",
                    "& .MuiListItemText-primary": { fontWeight: "bold" },
                  }}
                />
                {subMenuOpen ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              </ListItemButton>
            </ListItem>

            <Collapse in={subMenuOpen} timeout="auto" unmountOnExit>
              <List component="div" disablePadding>
                <ListItem disablePadding>
                  <ListItemButton href="/tratamientos-activos" sx={{ paddingLeft: 4 }} onClick={toggleDrawer(false)}>
                    <ListItemText
                      primary="Tratamientos Activos"
                      sx={{
                        color: "#0077b6",
                        "&:hover": { color: "#ffffff", backgroundColor: "#80deea" },
                      }}
                    />
                  </ListItemButton>
                </ListItem>
                <ListItem disablePadding>
                  <ListItemButton href="/historial-tratamientos" sx={{ paddingLeft: 4 }} onClick={toggleDrawer(false)}>
                    <ListItemText
                      primary="Historial de Tratamientos"
                      sx={{
                        color: "#0077b6",
                        "&:hover": { color: "#ffffff", backgroundColor: "#80deea" },
                      }}
                    />
                  </ListItemButton>
                </ListItem>
              </List>
            </Collapse>

            {/* Submenú para Pagos */}
            <ListItem disablePadding>
              <ListItemButton onClick={(event) => { event.stopPropagation(); setPaymentsOpen(!paymentsOpen); }}>
                <AttachMoneyIcon sx={{ marginRight: "10px", color: "#01579b" }} />
                <ListItemText
                  primary="Pagos"
                  sx={{
                    color: "#01579b",
                    "& .MuiListItemText-primary": { fontWeight: "bold" },
                  }}
                />
                {paymentsOpen ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              </ListItemButton>
            </ListItem>

            <Collapse in={paymentsOpen} timeout="auto" unmountOnExit>
              <List component="div" disablePadding>
                <ListItem disablePadding>
                  <ListItemButton href="/historial-pagos" sx={{ paddingLeft: 4 }} onClick={toggleDrawer(false)}>
                    <ListItemText
                      primary="Historial de Pagos"
                      sx={{
                        color: "#0077b6",
                        "&:hover": { color: "#ffffff", backgroundColor: "#80deea" },
                      }}
                    />
                  </ListItemButton>
                </ListItem>
                <ListItem disablePadding>
                  <ListItemButton href="/facturacion" sx={{ paddingLeft: 4 }} onClick={toggleDrawer(false)}>
                    <ListItemText
                      primary="Facturación"
                      sx={{
                        color: "#0077b6",
                        "&:hover": { color: "#ffffff", backgroundColor: "#80deea" },
                      }}
                    />
                  </ListItemButton>
                </ListItem>
              </List>
            </Collapse>
            <ListItem disablePadding>
              <ListItemButton href="/catalogo-servicios" onClick={toggleDrawer(false)}>
                <ListAltIcon sx={{ marginRight: "10px", color: "#01579b" }} />
                <ListItemText
                  primary="Servicios"
                  sx={{
                    color: "#01579b",
                    "& .MuiListItemText-primary": { fontWeight: "bold" },
                  }}
                />
              </ListItemButton>
            </ListItem>
            {/* Opción de Perfil */}
            <ListItem disablePadding>
              <ListItemButton href="/perfil" onClick={toggleDrawer(false)}>
                <AccountCircleIcon sx={{ marginRight: "10px", color: "#01579b" }} />
                <ListItemText
                  primary="Perfil"
                  sx={{
                    color: "#01579b",
                    "& .MuiListItemText-primary": { fontWeight: "bold" },
                  }}
                />
              </ListItemButton>
            </ListItem>

            <List>
              {/* Aquí va el botón de Cerrar Sesión en el menú lateral */}
              <ListItem disablePadding>
                <ListItemButton onClick={cerrarSesion}>
                  <LogoutIcon sx={{ marginRight: "10px", color: "#01579b" }} />
                  <ListItemText
                    primary="Cerrar Sesión"
                    sx={{
                      color: "#01579b",
                      "& .MuiListItemText-primary": { fontWeight: "bold" },
                    }}
                  />
                </ListItemButton>
              </ListItem>
            </List>

          </List>
        </Box>
      </Drawer>

      {/* Alerta de éxito */}
      <Snackbar
        open={alertaExito}
        autoHideDuration={2000}  // La alerta se cierra automáticamente después de 2 segundos
        onClose={() => setAlertaExito(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}  // Posición inferior izquierda
      >
        <Alert onClose={() => setAlertaExito(false)} severity="success" sx={{ width: '100%' }}>
          Sesión cerrada correctamente.
        </Alert>
      </Snackbar>
    </ThemeProvider>
  );
};

export default NavbarPaciente;
