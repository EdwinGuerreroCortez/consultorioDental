import React, { useState, useEffect, useRef } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
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
  Fade,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import HomeIcon from "@mui/icons-material/Home";
import ListAltIcon from "@mui/icons-material/ListAlt";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import SearchIcon from "@mui/icons-material/Search";
import InputAdornment from "@mui/material/InputAdornment";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import LogoutIcon from "@mui/icons-material/Logout";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ScheduleIcon from "@mui/icons-material/Schedule"; // Ícono para citas
import HistoryIcon from "@mui/icons-material/History"; // Ícono para historial
import PaymentIcon from "@mui/icons-material/Payment"; // Ícono para pagos
import { createTheme, ThemeProvider } from "@mui/material/styles";
import "@fontsource/poppins";
import logo from "../../../assets/images/logo.png";

const NavbarPaciente = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [showNavbar, setShowNavbar] = useState(true);
  const [lastScroll, setLastScroll] = useState(0);
  const [servicesOpen, setServicesOpen] = useState(false);
  const [subMenuOpen, setSubMenuOpen] = useState(false);
  const [paymentsOpen, setPaymentsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const searchBoxRef = useRef(null);
  const [alertaExito, setAlertaExito] = useState(false);

  // Temporizadores para retrasar el cierre de submenús
  const [servicesTimeout, setServicesTimeout] = useState(null);
  const [treatmentsTimeout, setTreatmentsTimeout] = useState(null);
  const [paymentsTimeout, setPaymentsTimeout] = useState(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchBoxRef.current && !searchBoxRef.current.contains(event.target)) {
        setSearchResults([]);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearch = async (event) => {
    const term = event.target.value;
    setSearchTerm(term);
    if (term.length > 0) {
      try {
        const response = await fetch(`http://localhost:4000/api/tratamientos/buscar?search=${term}`);
        const results = await response.json();
        const filteredResults = results.filter((result) => new RegExp(term, "i").test(result.nombre));
        setSearchResults(results);
      } catch (error) {
        console.error("Error en la búsqueda:", error);
      }
    } else {
      setSearchResults([]);
    }
  };

  const cerrarSesion = async () => {
    try {
      const csrfToken = document.cookie
        .split("; ")
        .find((row) => row.startsWith("XSRF-TOKEN="))
        ?.split("=")[1];
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
          window.location.href = "/";
        }, 2000);
      } else {
        const errorData = await response.json();
        console.error("Error al cerrar sesión:", errorData);
      }
    } catch (error) {
      console.error("Error en la solicitud de cierre de sesión:", error);
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
    palette: {
      primary: { main: "#0077b6" },
      secondary: { main: "#80deea" },
    },
  });

  const highlightMatch = (text, searchTerm) => {
    if (!searchTerm) return text;
    const regex = new RegExp(`(${searchTerm})`, "gi");
    const parts = text.split(regex);
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

  // Funciones para manejar hover en submenús
  const handleSubMenuEnter = (menu) => {
    if (menu === "services") {
      clearTimeout(servicesTimeout);
      setServicesOpen(true);
    }
    if (menu === "treatments") {
      clearTimeout(treatmentsTimeout);
      setSubMenuOpen(true);
    }
    if (menu === "payments") {
      clearTimeout(paymentsTimeout);
      setPaymentsOpen(true);
    }
  };

  const handleSubMenuLeave = (menu) => {
    if (menu === "services") {
      const timeout = setTimeout(() => setServicesOpen(false), 200);
      setServicesTimeout(timeout);
    }
    if (menu === "treatments") {
      const timeout = setTimeout(() => setSubMenuOpen(false), 200);
      setTreatmentsTimeout(timeout);
    }
    if (menu === "payments") {
      const timeout = setTimeout(() => setPaymentsOpen(false), 200);
      setPaymentsTimeout(timeout);
    }
  };

  // Funciones para manejar clics en el drawer
  const handleSubMenuToggle = (menu) => {
    if (menu === "services") setServicesOpen(!servicesOpen);
    if (menu === "treatments") setSubMenuOpen(!subMenuOpen);
    if (menu === "payments") setPaymentsOpen(!paymentsOpen);
  };

  return (
    <ThemeProvider theme={theme}>
      <AppBar
        sx={{
          height: "80px",
          background: "linear-gradient(90deg, #003366, #0077b6)",
          transform: showNavbar ? "translateY(0)" : "translateY(-100%)",
          transition: "transform 0.4s ease-in-out",
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          zIndex: 10,
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.2)",
        }}
      >
        <Toolbar sx={{ height: "100%", display: "flex", alignItems: "center", paddingX: 2 }}>
          <IconButton
            color="inherit"
            edge="start"
            onClick={toggleDrawer(true)}
            sx={{
              display: { xs: "block", md: "none" },
              "&:hover": { transform: "rotate(180deg)", transition: "transform 0.3s" },
            }}
            aria-label="Abrir menú lateral"
          >
            <MenuIcon />
          </IconButton>

          <Box sx={{ flexGrow: 1, display: "flex", alignItems: "center" }}>
            <img
              src={logo}
              alt="Consultorio Dental"
              style={{
                height: "60px",
                width: "auto",
                marginRight: "12px",
                borderRadius: "50%",
                transition: "transform 0.3s",
                "&:hover": { transform: "scale(1.1)" },
              }}
            />
            <Typography
              variant="h6"
              sx={{
                fontWeight: "bold",
                color: "#ffffff",
                letterSpacing: "0.5px",
                textShadow: "1px 1px 2px rgba(0, 0, 0, 0.2)",
              }}
            >
              Consultorio Dental
            </Typography>
            <Box
              sx={{
                marginLeft: "16px",
                flexGrow: 1,
                maxWidth: "400px",
                position: "relative",
              }}
              ref={searchBoxRef}
            >
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
                  borderRadius: "20px",
                  "& .MuiOutlinedInput-root": {
                    "& fieldset": { borderColor: "#0077b6" },
                    "&:hover fieldset": { borderColor: "#005f8a" },
                    "&.Mui-focused fieldset": { borderColor: "#0077b6", borderWidth: "2px" },
                  },
                  transition: "all 0.3s",
                  "&:hover": { boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)" },
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
                    maxHeight: "300px",
                    overflowY: "auto",
                  }}
                >
                  <List>
                    {searchResults.slice(0, 5).map((result) => (
                      <ListItem key={result.id} disablePadding>
                        <ListItemButton
                          href={`/paciente/catalogo-servicios/${result.hash}`}
                          sx={{
                            color: "#0077b6",
                            "&:hover": { backgroundColor: "#0077b6", color: "#ffffff" },
                            transition: "background-color 0.2s",
                          }}
                        >
                          <ListItemText
                            primary={highlightMatch(result.nombre, searchTerm)}
                            sx={{ "& .MuiListItemText-primary": { fontWeight: "bold" } }}
                          />
                        </ListItemButton>
                      </ListItem>
                    ))}
                  </List>
                </Box>
              )}
            </Box>
          </Box>

          <Box sx={{ display: { xs: "none", md: "flex" }, alignItems: "center", gap: 1 }}>
            <Tooltip title="Inicio" placement="top" arrow>
              <IconButton
                href="/paciente"
                sx={{
                  color: "#fff",
                  backgroundColor: "rgba(255, 255, 255, 0.2)",
                  borderRadius: "50%",
                  p: 1.5,
                  "&:hover": { backgroundColor: "rgba(255, 255, 255, 0.4)", transform: "scale(1.1)" },
                  transition: "all 0.3s",
                }}
                aria-label="Inicio"
              >
                <HomeIcon />
              </IconButton>
            </Tooltip>

            {/* Submenú de "Mis Citas" - Más visible y alineado a la izquierda */}
            <Box
              sx={{ position: "relative" }}
              onMouseEnter={() => handleSubMenuEnter("services")}
              onMouseLeave={() => handleSubMenuLeave("services")}
            >
              <Tooltip title="Mis Citas" placement="" arrow>
                <IconButton
                  sx={{
                    color: "#fff",
                    backgroundColor: "rgba(255, 255, 255, 0.2)",
                    borderRadius: "50%",
                    p: 1.5,
                    "&:hover": { backgroundColor: "rgba(255, 255, 255, 0.4)", transform: "scale(1.1)" },
                    transition: "all 0.3s",
                  }}
                  aria-label="Mis Citas"
                >
                  <CalendarMonthIcon />
                </IconButton>
              </Tooltip>
              <Fade in={servicesOpen} timeout={300}>
                <Box
                  sx={{
                    position: "absolute",
                    top: "100%",
                    left: 0, // Alineado a la izquierda
                    backgroundColor: "#ffffff", // Fondo blanco sólido para mayor visibilidad
                    boxShadow: "0 8px 24px rgba(0, 0, 0, 0.2)", // Sombra más pronunciada
                    borderRadius: "10px",
                    border: "1px solid #0077b6", // Borde para destacar
                    overflow: "hidden",
                    zIndex: 20,
                    width: "250px", // Ancho más grande
                    padding: "10px 0",
                    transform: servicesOpen ? "translateY(0)" : "translateY(-10px)",
                    transition: "transform 0.3s ease",
                  }}
                  onMouseEnter={() => handleSubMenuEnter("services")}
                  onMouseLeave={() => handleSubMenuLeave("services")}
                >
                  <List>
                    <ListItem disablePadding>
                      <ListItemButton
                        href="/citas-agendadas"
                        sx={{
                          padding: "14px 20px", // Más espacio interno
                          "&:hover": {
                            backgroundColor: "#0077b6",
                            color: "#ffffff",
                          },
                          transition: "background-color 0.2s ease",
                        }}
                      >
                        <ScheduleIcon sx={{ marginRight: "14px", color: "#0077b6" }} />
                        <ListItemText
                          primary="Citas Agendadas"
                          sx={{
                            "& .MuiListItemText-primary": {
                              fontSize: "1rem", // Fuente más grande
                              fontWeight: "bold", // Negrita para mayor visibilidad
                              color: "#333", // Color oscuro para contraste
                            },
                          }}
                        />
                      </ListItemButton>
                    </ListItem>
                    <ListItem disablePadding>
                      <ListItemButton
                        href="/agendar-cita"
                        sx={{
                          padding: "14px 20px",
                          "&:hover": {
                            backgroundColor: "#0077b6",
                            color: "#ffffff",
                          },
                          transition: "background-color 0.2s ease",
                        }}
                      >
                        <CalendarMonthIcon sx={{ marginRight: "14px", color: "#0077b6" }} />
                        <ListItemText
                          primary="Agendar Cita"
                          sx={{
                            "& .MuiListItemText-primary": {
                              fontSize: "1rem",
                              fontWeight: "bold",
                              color: "#333",
                            },
                          }}
                        />
                      </ListItemButton>
                    </ListItem>
                  </List>
                </Box>
              </Fade>
            </Box>

            {/* Submenú de "Tratamientos" - Más visible y alineado a la izquierda */}
            <Box
              sx={{ position: "relative" }}
              onMouseEnter={() => handleSubMenuEnter("treatments")}
              onMouseLeave={() => handleSubMenuLeave("treatments")}
            >
              <Tooltip title="Tratamientos" placement="top" arrow>
                <IconButton
                  sx={{
                    color: "#fff",
                    backgroundColor: "rgba(255, 255, 255, 0.2)",
                    borderRadius: "50%",
                    p: 1.5,
                    "&:hover": { backgroundColor: "rgba(255, 255, 255, 0.4)", transform: "scale(1.1)" },
                    transition: "all 0.3s",
                  }}
                  aria-label="Tratamientos"
                >
                  <ReceiptLongIcon />
                </IconButton>
              </Tooltip>
              <Fade in={subMenuOpen} timeout={300}>
                <Box
                  sx={{
                    position: "absolute",
                    top: "100%",
                    left: 0, // Alineado a la izquierda
                    backgroundColor: "#ffffff", // Fondo blanco sólido
                    boxShadow: "0 8px 24px rgba(0, 0, 0, 0.2)",
                    borderRadius: "10px",
                    border: "1px solid #0077b6",
                    overflow: "hidden",
                    zIndex: 20,
                    width: "250px",
                    padding: "10px 0",
                    transform: subMenuOpen ? "translateY(0)" : "translateY(-10px)",
                    transition: "transform 0.3s ease",
                  }}
                  onMouseEnter={() => handleSubMenuEnter("treatments")}
                  onMouseLeave={() => handleSubMenuLeave("treatments")}
                >
                  <List>
                    <ListItem disablePadding>
                      <ListItemButton
                        href="/tratamientos-activos"
                        sx={{
                          padding: "14px 20px",
                          "&:hover": {
                            backgroundColor: "#0077b6",
                            color: "#ffffff",
                          },
                          transition: "background-color 0.2s ease",
                        }}
                      >
                        <ReceiptLongIcon sx={{ marginRight: "14px", color: "#0077b6" }} />
                        <ListItemText
                          primary="Tratamientos Activos"
                          sx={{
                            "& .MuiListItemText-primary": {
                              fontSize: "1rem",
                              fontWeight: "bold",
                              color: "#333",
                            },
                          }}
                        />
                      </ListItemButton>
                    </ListItem>
                    <ListItem disablePadding>
                      <ListItemButton
                        href="/historial-tratamientos"
                        sx={{
                          padding: "14px 20px",
                          "&:hover": {
                            backgroundColor: "#0077b6",
                            color: "#ffffff",
                          },
                          transition: "background-color 0.2s ease",
                        }}
                      >
                        <HistoryIcon sx={{ marginRight: "14px", color: "#0077b6" }} />
                        <ListItemText
                          primary="Historial de Tratamientos"
                          sx={{
                            "& .MuiListItemText-primary": {
                              fontSize: "1rem",
                              fontWeight: "bold",
                              color: "#333",
                            },
                          }}
                        />
                      </ListItemButton>
                    </ListItem>
                  </List>
                </Box>
              </Fade>
            </Box>

            {/* Submenú de "Pagos" - Más visible y alineado a la izquierda */}
            <Box
              sx={{ position: "relative" }}
              onMouseEnter={() => handleSubMenuEnter("payments")}
              onMouseLeave={() => handleSubMenuLeave("payments")}
            >
              <Tooltip title="Pagos" placement="top" arrow>
                <IconButton
                  sx={{
                    color: "#fff",
                    backgroundColor: "rgba(255, 255, 255, 0.2)",
                    borderRadius: "50%",
                    p: 1.5,
                    "&:hover": { backgroundColor: "rgba(255, 255, 255, 0.4)", transform: "scale(1.1)" },
                    transition: "all 0.3s",
                  }}
                  aria-label="Pagos"
                >
                  <AttachMoneyIcon />
                </IconButton>
              </Tooltip>
              <Fade in={paymentsOpen} timeout={300}>
                <Box
                  sx={{
                    position: "absolute",
                    top: "100%",
                    left: 0, // Alineado a la izquierda
                    backgroundColor: "#ffffff", // Fondo blanco sólido
                    boxShadow: "0 8px 24px rgba(0, 0, 0, 0.2)",
                    borderRadius: "10px",
                    border: "1px solid #0077b6",
                    overflow: "hidden",
                    zIndex: 20,
                    width: "250px",
                    padding: "10px 0",
                    transform: paymentsOpen ? "translateY(0)" : "translateY(-10px)",
                    transition: "transform 0.3s ease",
                  }}
                  onMouseEnter={() => handleSubMenuEnter("payments")}
                  onMouseLeave={() => handleSubMenuLeave("payments")}
                >
                  <List>
                    <ListItem disablePadding>
                      <ListItemButton
                        href="/historial-pagos"
                        sx={{
                          padding: "14px 20px",
                          "&:hover": {
                            backgroundColor: "#0077b6",
                            color: "#ffffff",
                          },
                          transition: "background-color 0.2s ease",
                        }}
                      >
                        <PaymentIcon sx={{ marginRight: "14px", color: "#0077b6" }} />
                        <ListItemText
                          primary="Historial de Pagos"
                          sx={{
                            "& .MuiListItemText-primary": {
                              fontSize: "1rem",
                              fontWeight: "bold",
                              color: "#333",
                            },
                          }}
                        />
                      </ListItemButton>
                    </ListItem>
                    <ListItem disablePadding>
                      <ListItemButton
                        href="/facturacion"
                        sx={{
                          padding: "14px 20px",
                          "&:hover": {
                            backgroundColor: "#0077b6",
                            color: "#ffffff",
                          },
                          transition: "background-color 0.2s ease",
                        }}
                      >
                        <AttachMoneyIcon sx={{ marginRight: "14px", color: "#0077b6" }} />
                        <ListItemText
                          primary="Facturación"
                          sx={{
                            "& .MuiListItemText-primary": {
                              fontSize: "1rem",
                              fontWeight: "bold",
                              color: "#333",
                            },
                          }}
                        />
                      </ListItemButton>
                    </ListItem>
                  </List>
                </Box>
              </Fade>
            </Box>

            <Tooltip title="Servicios" placement="top" arrow>
              <IconButton
                href="/paciente/catalogo-servicios"
                sx={{
                  color: "#fff",
                  backgroundColor: "rgba(255, 255, 255, 0.2)",
                  borderRadius: "50%",
                  p: 1.5,
                  "&:hover": { backgroundColor: "rgba(255, 255, 255, 0.4)", transform: "scale(1.1)" },
                  transition: "all 0.3s",
                }}
                aria-label="Servicios"
              >
                <ListAltIcon />
              </IconButton>
            </Tooltip>

            <Tooltip title="Perfil" placement="top" arrow>
              <IconButton
                href="/perfil"
                sx={{
                  color: "#fff",
                  backgroundColor: "rgba(255, 255, 255, 0.2)",
                  borderRadius: "50%",
                  p: 1.5,
                  "&:hover": { backgroundColor: "rgba(255, 255, 255, 0.4)", transform: "scale(1.1)" },
                  transition: "all 0.3s",
                }}
                aria-label="Perfil"
              >
                <AccountCircleIcon />
              </IconButton>
            </Tooltip>

            <Tooltip title="Cerrar Sesión" placement="top" arrow>
              <IconButton
                onClick={cerrarSesion}
                sx={{
                  color: "#fff",
                  backgroundColor: "rgba(255, 255, 255, 0.2)",
                  borderRadius: "50%",
                  p: 1.5,
                  "&:hover": { backgroundColor: "rgba(255, 255, 255, 0.4)", transform: "scale(1.1)" },
                  transition: "all 0.3s",
                }}
                aria-label="Cerrar Sesión"
              >
                <LogoutIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Toolbar>
      </AppBar>

      <Drawer anchor="left" open={drawerOpen} onClose={toggleDrawer(false)}>
        <Box
          sx={{
            width: 250,
            backgroundColor: "#e0f7fa",
            height: "100%",
            borderRight: "1px solid rgba(0, 0, 0, 0.1)",
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
              boxShadow: "0 2px 10px rgba(0, 0, 0, 0.2)",
            }}
          >
            Consultorio Dental
          </Typography>
          <Divider />

          <List>
            <ListItem disablePadding>
              <ListItemButton href="/paciente" onClick={toggleDrawer(false)}>
                <HomeIcon sx={{ marginRight: "10px", color: "#01579b" }} />
                <ListItemText
                  primary="Inicio"
                  sx={{ color: "#01579b", "& .MuiListItemText-primary": { fontWeight: "bold" } }}
                />
              </ListItemButton>
            </ListItem>

            {/* Submenú de "Mis Citas" en el Drawer - Más visible */}
            <ListItem disablePadding>
              <ListItemButton onClick={() => handleSubMenuToggle("services")}>
                <CalendarMonthIcon sx={{ marginRight: "10px", color: "#01579b" }} />
                <ListItemText
                  primary="Mis Citas"
                  sx={{ color: "#01579b", "& .MuiListItemText-primary": { fontWeight: "bold" } }}
                />
                {servicesOpen ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              </ListItemButton>
            </ListItem>
            <Collapse in={servicesOpen} timeout="auto" unmountOnExit>
              <List component="div" disablePadding>
                <ListItem disablePadding>
                  <ListItemButton
                    href="/citas-agendadas"
                    sx={{
                      paddingLeft: 4,
                      padding: "14px 20px",
                      "&:hover": {
                        backgroundColor: "#0077b6",
                        color: "#ffffff",
                      },
                      transition: "background-color 0.2s ease",
                    }}
                    onClick={toggleDrawer(false)}
                  >
                    <ScheduleIcon sx={{ marginRight: "14px", color: "#0077b6" }} />
                    <ListItemText
                      primary="Citas Agendadas"
                      sx={{
                        "& .MuiListItemText-primary": {
                          fontSize: "1rem",
                          fontWeight: "bold",
                          color: "#333",
                        },
                      }}
                    />
                  </ListItemButton>
                </ListItem>
                <ListItem disablePadding>
                  <ListItemButton
                    href="/agendar-cita"
                    sx={{
                      paddingLeft: 4,
                      padding: "14px 20px",
                      "&:hover": {
                        backgroundColor: "#0077b6",
                        color: "#ffffff",
                      },
                      transition: "background-color 0.2s ease",
                    }}
                    onClick={toggleDrawer(false)}
                  >
                    <CalendarMonthIcon sx={{ marginRight: "14px", color: "#0077b6" }} />
                    <ListItemText
                      primary="Agendar Cita"
                      sx={{
                        "& .MuiListItemText-primary": {
                          fontSize: "1rem",
                          fontWeight: "bold",
                          color: "#333",
                        },
                      }}
                    />
                  </ListItemButton>
                </ListItem>
              </List>
            </Collapse>

            {/* Submenú de "Tratamientos" en el Drawer - Más visible */}
            <ListItem disablePadding>
              <ListItemButton onClick={() => handleSubMenuToggle("treatments")}>
                <ReceiptLongIcon sx={{ marginRight: "10px", color: "#01579b" }} />
                <ListItemText
                  primary="Tratamientos"
                  sx={{ color: "#01579b", "& .MuiListItemText-primary": { fontWeight: "bold" } }}
                />
                {subMenuOpen ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              </ListItemButton>
            </ListItem>
            <Collapse in={subMenuOpen} timeout="auto" unmountOnExit>
              <List component="div" disablePadding>
                <ListItem disablePadding>
                  <ListItemButton
                    href="/tratamientos-activos"
                    sx={{
                      paddingLeft: 4,
                      padding: "14px 20px",
                      "&:hover": {
                        backgroundColor: "#0077b6",
                        color: "#ffffff",
                      },
                      transition: "background-color 0.2s ease",
                    }}
                    onClick={toggleDrawer(false)}
                  >
                    <ReceiptLongIcon sx={{ marginRight: "14px", color: "#0077b6" }} />
                    <ListItemText
                      primary="Tratamientos Activos"
                      sx={{
                        "& .MuiListItemText-primary": {
                          fontSize: "1rem",
                          fontWeight: "bold",
                          color: "#333",
                        },
                      }}
                    />
                  </ListItemButton>
                </ListItem>
                <ListItem disablePadding>
                  <ListItemButton
                    href="/historial-tratamientos"
                    sx={{
                      paddingLeft: 4,
                      padding: "14px 20px",
                      "&:hover": {
                        backgroundColor: "#0077b6",
                        color: "#ffffff",
                      },
                      transition: "background-color 0.2s ease",
                    }}
                    onClick={toggleDrawer(false)}
                  >
                    <HistoryIcon sx={{ marginRight: "14px", color: "#0077b6" }} />
                    <ListItemText
                      primary="Historial de Tratamientos"
                      sx={{
                        "& .MuiListItemText-primary": {
                          fontSize: "1rem",
                          fontWeight: "bold",
                          color: "#333",
                        },
                      }}
                    />
                  </ListItemButton>
                </ListItem>
              </List>
            </Collapse>

            {/* Submenú de "Pagos" en el Drawer - Más visible */}
            <ListItem disablePadding>
              <ListItemButton onClick={() => handleSubMenuToggle("payments")}>
                <AttachMoneyIcon sx={{ marginRight: "10px", color: "#01579b" }} />
                <ListItemText
                  primary="Pagos"
                  sx={{ color: "#01579b", "& .MuiListItemText-primary": { fontWeight: "bold" } }}
                />
                {paymentsOpen ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              </ListItemButton>
            </ListItem>
            <Collapse in={paymentsOpen} timeout="auto" unmountOnExit>
              <List component="div" disablePadding>
                <ListItem disablePadding>
                  <ListItemButton
                    href="/historial-pagos"
                    sx={{
                      paddingLeft: 4,
                      padding: "14px 20px",
                      "&:hover": {
                        backgroundColor: "#0077b6",
                        color: "#ffffff",
                      },
                      transition: "background-color 0.2s ease",
                    }}
                    onClick={toggleDrawer(false)}
                  >
                    <PaymentIcon sx={{ marginRight: "14px", color: "#0077b6" }} />
                    <ListItemText
                      primary="Historial de Pagos"
                      sx={{
                        "& .MuiListItemText-primary": {
                          fontSize: "1rem",
                          fontWeight: "bold",
                          color: "#333",
                        },
                      }}
                    />
                  </ListItemButton>
                </ListItem>
                <ListItem disablePadding>
                  <ListItemButton
                    href="/facturacion"
                    sx={{
                      paddingLeft: 4,
                      padding: "14px 20px",
                      "&:hover": {
                        backgroundColor: "#0077b6",
                        color: "#ffffff",
                      },
                      transition: "background-color 0.2s ease",
                    }}
                    onClick={toggleDrawer(false)}
                  >
                    <AttachMoneyIcon sx={{ marginRight: "14px", color: "#0077b6" }} />
                    <ListItemText
                      primary="Facturación"
                      sx={{
                        "& .MuiListItemText-primary": {
                          fontSize: "1rem",
                          fontWeight: "bold",
                          color: "#333",
                        },
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
                  sx={{ color: "#01579b", "& .MuiListItemText-primary": { fontWeight: "bold" } }}
                />
              </ListItemButton>
            </ListItem>

            <ListItem disablePadding>
              <ListItemButton href="/perfil" onClick={toggleDrawer(false)}>
                <AccountCircleIcon sx={{ marginRight: "10px", color: "#01579b" }} />
                <ListItemText
                  primary="Perfil"
                  sx={{ color: "#01579b", "& .MuiListItemText-primary": { fontWeight: "bold" } }}
                />
              </ListItemButton>
            </ListItem>

            <ListItem disablePadding>
              <ListItemButton onClick={cerrarSesion}>
                <LogoutIcon sx={{ marginRight: "10px", color: "#01579b" }} />
                <ListItemText
                  primary="Cerrar Sesión"
                  sx={{ color: "#01579b", "& .MuiListItemText-primary": { fontWeight: "bold" } }}
                />
              </ListItemButton>
            </ListItem>
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