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
  Chip,
  CircularProgress,

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
import ScheduleIcon from "@mui/icons-material/Schedule";
import HistoryIcon from "@mui/icons-material/History";
import PaymentIcon from "@mui/icons-material/Payment";
import RedeemIcon from "@mui/icons-material/Redeem";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import "@fontsource/poppins";
import logo from "../../../assets/images/logo.png";
import puntosImg from "../../../assets/images/puntos.png"; // Importar la imagen de puntos
import { verificarAutenticacion } from "../../../utils/auth"; // Importar la función de autenticación
import axios from "axios"; // Importar axios para la solicitud al endpoint

const NavbarPaciente = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  const [subMenuOpen, setSubMenuOpen] = useState(false);
  const [paymentsOpen, setPaymentsOpen] = useState(false);
  const [recompensasOpen, setRecompensasOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const searchBoxRef = useRef(null);
  const [alertaExito, setAlertaExito] = useState(false);
  const [csrfToken, setCsrfToken] = useState(null);
  const [puntos, setPuntos] = useState(null); // Estado para los puntos
  const [usuarioId, setUsuarioId] = useState(null); // Estado para el usuarioId
  const [errorPuntos, setErrorPuntos] = useState(false); // Estado para manejar errores

  // Temporizadores para retrasar el cierre de submenús
  const [servicesTimeout, setServicesTimeout] = useState(null);
  const [treatmentsTimeout, setTreatmentsTimeout] = useState(null);
  const [paymentsTimeout, setPaymentsTimeout] = useState(null);
  const [recompensasTimeout, setRecompensasTimeout] = useState(null);

  // Obtener el token CSRF y el usuarioId al montar el componente
  useEffect(() => {
    const obtenerUsuarioYToken = async () => {
      try {
        // Obtener el usuarioId
        const usuario = await verificarAutenticacion();
        if (usuario) {
          setUsuarioId(usuario.id);
        } else {
          throw new Error("Sesión no válida");
        }
        console.log("Usuario ID:", usuario.id);
        // Obtener el token CSRF
        const response = await fetch("http://localhost:4000/api/get-csrf-token", {
          credentials: "include",
        });
        const data = await response.json();
        setCsrfToken(data.csrfToken);
      } catch (error) {
        console.error("Error obteniendo usuario o token CSRF:", error);
      }
    };
    obtenerUsuarioYToken();
  }, []);

  // Obtener los puntos del usuario
  useEffect(() => {
    if (!usuarioId) return;
    const obtenerPuntos = async () => {
      try {
        const response = await axios.get(`http://localhost:4000/api/puntos/saldo/${usuarioId}`, {
          credentials: "include",
        });
        setPuntos(response.data);
      } catch (error) {
        console.error("Error al obtener los puntos:", error);
        setErrorPuntos(true);
      }
    };
    obtenerPuntos();
  }, [usuarioId]);

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
        const response = await fetch(`http://localhost:4000/api/tratamientos/buscar?search=${term}`, {
          credentials: "include",
        });
        const results = await response.json();
        const filteredResults = results.filter((result) => new RegExp(term, "i").test(result.nombre));
        setSearchResults(filteredResults);
      } catch (error) {
        console.error("Error en la búsqueda:", error);
        setSearchResults([]);
      }
    } else {
      setSearchResults([]);
    }
  };

  const cerrarSesion = async () => {
    if (!csrfToken) {
      console.error("Token CSRF no disponible");
      return;
    }

    try {
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

  const handleSubMenuEnter = (menu) => {
    clearTimeout(servicesTimeout);
    clearTimeout(treatmentsTimeout);
    clearTimeout(paymentsTimeout);
    clearTimeout(recompensasTimeout);
    setServicesOpen(menu === "services");
    setSubMenuOpen(menu === "treatments");
    setPaymentsOpen(menu === "payments");
    setRecompensasOpen(menu === "recompensas");
  };

  const handleSubMenuLeave = (menu) => {
    if (menu === "services") {
      const timeout = setTimeout(() => setServicesOpen(false), 300);
      setServicesTimeout(timeout);
    }
    if (menu === "treatments") {
      const timeout = setTimeout(() => setSubMenuOpen(false), 300);
      setTreatmentsTimeout(timeout);
    }
    if (menu === "payments") {
      const timeout = setTimeout(() => setPaymentsOpen(false), 300);
      setPaymentsTimeout(timeout);
    }
    if (menu === "recompensas") {
      const timeout = setTimeout(() => setRecompensasOpen(false), 300);
      setRecompensasTimeout(timeout);
    }
  };

  const handleSubMenuToggle = (menu) => {
    if (menu === "services") setServicesOpen(!servicesOpen);
    if (menu === "treatments") setSubMenuOpen(!subMenuOpen);
    if (menu === "payments") setPaymentsOpen(!paymentsOpen);
    if (menu === "recompensas") setRecompensasOpen(!recompensasOpen);
  };

  const submenuStyle = {
    position: "absolute",
    top: "100%",
    left: 0,
    background: "linear-gradient(135deg, #ffffff 0%, #e6f0fa 100%)",
    boxShadow: "0 8px 24px rgba(0, 0, 0, 0.2)",
    borderRadius: "12px",
    border: "1px solid #0077b6",
    width: "260px",
    padding: "8px 0",
    zIndex: 20,
    transform: "translateY(5px)",
    transition: "opacity 0.25s ease-in-out, transform 0.25s ease-in-out",
  };

  return (
    <ThemeProvider theme={theme}>
      <AppBar
        sx={{
          height: "80px",
          background: "linear-gradient(90deg, #003366, #0077b6)",
          position: "static",
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
                    background: "linear-gradient(135deg, #ffffff 0%, #e6f0fa 100%)",
                    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                    borderRadius: "12px",
                    marginTop: "8px",
                    width: "100%",
                    zIndex: 9999,
                    padding: "8px 0",
                    maxHeight: "300px",
                    overflowY: "auto",
                    border: "1px solid #0077b6",
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
                            padding: "10px 16px",
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

          {/* Mostrar puntos disponibles con la imagen */}
          <Box sx={{ display: "flex", alignItems: "center", mr: 2 }}>
            {puntos ? (
              <Tooltip
                title={`Ver historial de puntos (${puntos.puntos_disponibles})`}
                placement="top"
                arrow
              >
                <Box
                  component="a"
                  href="/historial-puntos"
                  sx={{
                    textDecoration: "none",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    background: "rgba(255,255,255,0.18)",
                    border: "1px solid rgba(255,255,255,0.4)",
                    borderRadius: "999px",
                    padding: "6px 12px 6px 8px",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.25)",
                    backdropFilter: "blur(4px)",
                    WebkitBackdropFilter: "blur(4px)",
                    cursor: "pointer",
                    transition: "all .25s",
                    "&:hover": {
                      transform: "translateY(-2px) scale(1.03)",
                      boxShadow: "0 6px 16px rgba(0,0,0,0.3)",
                    },
                  }}
                >
                  {/* Icono / avatar de puntos */}
                  <Box
                    component="img"
                    src={puntosImg}
                    alt="Puntos"
                    sx={{
                      width: 34,
                      height: 34,
                      borderRadius: "50%",
                      backgroundColor: "#fff",
                      border: "2px solid #0077b6",
                      boxShadow: "0 2px 6px rgba(0,0,0,0.25)",
                      objectFit: "cover",
                    }}
                  />

                  {/* Cantidad de puntos */}
                  <Box
                    sx={{
                      backgroundColor: "#ffffff",
                      borderRadius: "14px",
                      padding: "4px 10px",
                      minWidth: "48px",
                      textAlign: "center",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      lineHeight: 1,
                      boxShadow: "0 2px 4px rgba(0,0,0,0.15)",
                      border: "1px solid rgba(0,0,0,0.05)",
                    }}
                  >
                    <Typography
                      sx={{
                        color: "#0077b6",
                        fontWeight: 700,
                        fontSize: "0.95rem",
                        fontFamily: "Poppins, sans-serif",
                      }}
                    >
                      {puntos.puntos_disponibles}
                    </Typography>
                  </Box>
                </Box>
              </Tooltip>
            ) : errorPuntos ? (
              <Tooltip title="Error al cargar puntos" placement="top" arrow>
                <Box
                  sx={{
                    backgroundColor: "rgba(255,0,0,0.15)",
                    borderRadius: "999px",
                    border: "1px solid rgba(255,255,255,0.5)",
                    padding: "6px 12px",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.25)",
                  }}
                >
                  <Typography
                    sx={{
                      color: "#fff",
                      fontWeight: 600,
                      fontSize: "0.8rem",
                      whiteSpace: "nowrap",
                      fontFamily: "Poppins, sans-serif",
                    }}
                  >
                    Error puntos
                  </Typography>
                </Box>
              </Tooltip>
            ) : (
              <CircularProgress size={20} sx={{ color: "#ffffff" }} />
            )}
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

            {/* Submenú de "Mis Citas" */}
            <Box
              sx={{ position: "relative" }}
              onMouseEnter={() => handleSubMenuEnter("services")}
              onMouseLeave={() => handleSubMenuLeave("services")}
            >
              <Tooltip title="Mis Citas" placement="top" arrow>
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
              <Fade in={servicesOpen} timeout={250}>
                <Box
                  sx={{
                    ...submenuStyle,
                    opacity: servicesOpen ? 1 : 0,
                    transform: servicesOpen ? "translateY(5px)" : "translateY(-5px)",
                  }}
                >
                  <List>
                    <ListItem disablePadding>
                      <ListItemButton
                        href="/citas-agendadas"
                        sx={{
                          padding: "12px 20px",
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
                              fontSize: "1rem",
                              fontWeight: "bold",
                              color: "#1a237e",
                            },
                          }}
                        />
                      </ListItemButton>
                    </ListItem>
                    <ListItem disablePadding>
                      <ListItemButton
                        href="/agendar-cita"
                        sx={{
                          padding: "12px 20px",
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
                              color: "#1a237e",
                            },
                          }}
                        />
                      </ListItemButton>
                    </ListItem>
                  </List>
                </Box>
              </Fade>
            </Box>

            {/* Submenú de "Tratamientos" */}
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
              <Fade in={subMenuOpen} timeout={250}>
                <Box
                  sx={{
                    ...submenuStyle,
                    opacity: subMenuOpen ? 1 : 0,
                    transform: subMenuOpen ? "translateY(5px)" : "translateY(-5px)",
                  }}
                >
                  <List>
                    <ListItem disablePadding>
                      <ListItemButton
                        href="/tratamientos-activos"
                        sx={{
                          padding: "12px 20px",
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
                              color: "#1a237e",
                            },
                          }}
                        />
                      </ListItemButton>
                    </ListItem>
                    <ListItem disablePadding>
                      <ListItemButton
                        href="/historial-tratamientos"
                        sx={{
                          padding: "12px 20px",
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
                              color: "#1a237e",
                            },
                          }}
                        />
                      </ListItemButton>
                    </ListItem>
                  </List>
                </Box>
              </Fade>
            </Box>

            {/* Submenú de "Pagos" */}
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
              <Fade in={paymentsOpen} timeout={250}>
                <Box
                  sx={{
                    ...submenuStyle,
                    opacity: paymentsOpen ? 1 : 0,
                    transform: paymentsOpen ? "translateY(5px)" : "translateY(-5px)",
                  }}
                >
                  <List>
                    <ListItem disablePadding>
                      <ListItemButton
                        href="/historial-pagos"
                        sx={{
                          padding: "12px 20px",
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
                              color: "#1a237e",
                            },
                          }}
                        />
                      </ListItemButton>
                    </ListItem>
                    <ListItem disablePadding>
                      <ListItemButton
                        href="/pagos"
                        sx={{
                          padding: "12px 20px",
                          "&:hover": {
                            backgroundColor: "#0077b6",
                            color: "#ffffff",
                          },
                          transition: "background-color 0.2s ease",
                        }}
                      >
                        <AttachMoneyIcon sx={{ marginRight: "14px", color: "#0077b6" }} />
                        <ListItemText
                          primary="Pagos"
                          sx={{
                            "& .MuiListItemText-primary": {
                              fontSize: "1rem",
                              fontWeight: "bold",
                              color: "#1a237e",
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
            <Tooltip title="Mis Logros" placement="top" arrow>
              <IconButton
                href="/logros-paciente"
                sx={{
                  color: "#fff",
                  backgroundColor: "rgba(255, 255, 255, 0.2)",
                  borderRadius: "50%",
                  p: 1.5,
                  "&:hover": {
                    backgroundColor: "rgba(255, 255, 255, 0.4)",
                    transform: "scale(1.1)",
                  },
                  transition: "all 0.3s",
                }}
                aria-label="Mis Logros"
              >
                <EmojiEventsIcon />
              </IconButton>
            </Tooltip>
            {/* Submenú de "Recompensas" */}
            <Box
              sx={{ position: "relative" }}
              onMouseEnter={() => handleSubMenuEnter("recompensas")}
              onMouseLeave={() => handleSubMenuLeave("recompensas")}
            >
              <Tooltip title="Recompensas" placement="top" arrow>
                <IconButton
                  sx={{
                    color: "#fff",
                    backgroundColor: "rgba(255, 255, 255, 0.2)",
                    borderRadius: "50%",
                    p: 1.5,
                    "&:hover": { backgroundColor: "rgba(255, 255, 255, 0.4)", transform: "scale(1.1)" },
                    transition: "all 0.3s",
                  }}
                  aria-label="Recompensas"
                >
                  <RedeemIcon />
                </IconButton>
              </Tooltip>
              <Fade in={recompensasOpen} timeout={250}>
                <Box
                  sx={{
                    ...submenuStyle,
                    opacity: recompensasOpen ? 1 : 0,
                    transform: recompensasOpen ? "translateY(5px)" : "translateY(-5px)",
                  }}
                >
                  <List>
                    <ListItem disablePadding>
                      <ListItemButton
                        href="/recompensas-paciente"
                        sx={{
                          padding: "12px 20px",
                          "&:hover": {
                            backgroundColor: "#0077b6",
                            color: "#ffffff",
                          },
                          transition: "background-color 0.2s ease",
                        }}
                      >
                        <RedeemIcon sx={{ marginRight: "14px", color: "#0077b6" }} />
                        <ListItemText
                          primary="Recompensas"
                          sx={{
                            "& .MuiListItemText-primary": {
                              fontSize: "1rem",
                              fontWeight: "bold",
                              color: "#1a237e",
                            },
                          }}
                        />
                      </ListItemButton>
                    </ListItem>
                    <ListItem disablePadding>
                      <ListItemButton
                        href="/cupones-paciente"
                        sx={{
                          padding: "12px 20px",
                          "&:hover": {
                            backgroundColor: "#0077b6",
                            color: "#ffffff",
                          },
                          transition: "background-color 0.2s ease",
                        }}
                      >
                        <LocalOfferIcon sx={{ marginRight: "14px", color: "#0077b6" }} />
                        <ListItemText
                          primary="Mis Cupones"
                          sx={{
                            "& .MuiListItemText-primary": {
                              fontSize: "1rem",
                              fontWeight: "bold",
                              color: "#1a237e",
                            },
                          }}
                        />
                      </ListItemButton>
                    </ListItem>
                  </List>
                </Box>
              </Fade>
            </Box>
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

          {/* Mostrar puntos en el Drawer */}
          {puntos && (
            <Box sx={{ padding: "16px", display: "flex", alignItems: "center", gap: 1 }}>
              <img
                src={puntosImg}
                alt="Puntos"
                style={{
                  height: "30px",
                  width: "auto",
                  borderRadius: "50%",
                }}
              />
              <Typography sx={{ color: "#01579b", fontWeight: "bold" }}>
                {puntos.puntos_disponibles} Puntos
              </Typography>
            </Box>
          )}
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
                          color: "#1a237e",
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
                          color: "#1a237e",
                        },
                      }}
                    />
                  </ListItemButton>
                </ListItem>
              </List>
            </Collapse>

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
                          color: "#1a237e",
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
                          color: "#1a237e",
                        },
                      }}
                    />
                  </ListItemButton>
                </ListItem>
              </List>
            </Collapse>

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
                          color: "#1a237e",
                        },
                      }}
                    />
                  </ListItemButton>
                </ListItem>
                <ListItem disablePadding>
                  <ListItemButton
                    href="/pago"
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
                      primary="Pago"
                      sx={{
                        "& .MuiListItemText-primary": {
                          fontSize: "1rem",
                          fontWeight: "bold",
                          color: "#1a237e",
                        },
                      }}
                    />
                  </ListItemButton>
                </ListItem>
              </List>
            </Collapse>

            <ListItem disablePadding>
              <ListItemButton href="/paciente/catalogo-servicios" onClick={toggleDrawer(false)}>
                <ListAltIcon sx={{ marginRight: "10px", color: "#01579b" }} />
                <ListItemText
                  primary="Servicios"
                  sx={{ color: "#01579b", "& .MuiListItemText-primary": { fontWeight: "bold" } }}
                />
              </ListItemButton>
            </ListItem>

            <ListItem disablePadding>
              <ListItemButton href="/logros-paciente" onClick={toggleDrawer(false)}>
                <EmojiEventsIcon sx={{ marginRight: "10px", color: "#01579b" }} />
                <ListItemText
                  primary="Mis Logros"
                  sx={{ color: "#01579b", "& .MuiListItemText-primary": { fontWeight: "bold" } }}
                />
              </ListItemButton>
            </ListItem>

            <ListItem disablePadding>
              <ListItemButton onClick={() => handleSubMenuToggle("recompensas")}>
                <RedeemIcon sx={{ marginRight: "10px", color: "#01579b" }} />
                <ListItemText
                  primary="Recompensas"
                  sx={{ color: "#01579b", "& .MuiListItemText-primary": { fontWeight: "bold" } }}
                />
                {recompensasOpen ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              </ListItemButton>
            </ListItem>
            <Collapse in={recompensasOpen} timeout="auto" unmountOnExit>
              <List component="div" disablePadding>
                <ListItem disablePadding>
                  <ListItemButton
                    href="/recompensas-paciente"
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
                    <RedeemIcon sx={{ marginRight: "14px", color: "#0077b6" }} />
                    <ListItemText
                      primary="Recompensas"
                      sx={{
                        "& .MuiListItemText-primary": {
                          fontSize: "1rem",
                          fontWeight: "bold",
                          color: "#1a237e",
                        },
                      }}
                    />
                  </ListItemButton>
                </ListItem>
                <ListItem disablePadding>
                  <ListItemButton
                    href="/cupones-paciente"
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
                    <LocalOfferIcon sx={{ marginRight: "14px", color: "#0077b6" }} />
                    <ListItemText
                      primary="Mis Cupones"
                      sx={{
                        "& .MuiListItemText-primary": {
                          fontSize: "1rem",
                          fontWeight: "bold",
                          color: "#1a237e",
                        },
                      }}
                    />
                  </ListItemButton>
                </ListItem>
              </List>
            </Collapse>

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
    </ThemeProvider>
  );
};

export default NavbarPaciente;