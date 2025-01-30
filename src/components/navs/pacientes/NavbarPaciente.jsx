import React, { useState, useEffect } from "react";
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
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import HomeIcon from "@mui/icons-material/Home";
import ListAltIcon from "@mui/icons-material/ListAlt";
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import LoginIcon from "@mui/icons-material/Login";
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
              style={{ height: "60px", width: "auto", marginRight: "12px" }}
            />
            <Typography variant="h6" sx={{ fontWeight: "bold", color: "#ffffff" }}>
              Consultorio Dental
            </Typography>
          </Box>

          {/* Menú en pantalla grande */}
          <Box sx={{ display: { xs: "none", md: "flex" }, alignItems: "center" }}>
            <Button
              color="inherit"
              startIcon={<HomeIcon />}
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
              Inicio
            </Button>
            <Box
              sx={{
                position: "relative",
                marginX: 1,
                "&:hover .submenu": {
                  display: "block",
                },
              }}
            >
              <Button
                color="inherit"
                startIcon={<CalendarMonthIcon />}
                sx={{
                  fontWeight: "bold",
                  fontSize: "16px",
                  color: "#ffffff",
                  borderRadius: "8px",
                  padding: "8px 16px",
                }}
              >
                Mis citas
              </Button>
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
                    <ListItemButton href="/citas-agendadas" sx={{ padding: "10px 16px" }}>
                      <ListItemText
                        primary="Citas Agendadas"
                        sx={{
                          color: "#01579b",
                          "&:hover": {
                            color: "#ffffff",
                            backgroundColor: "#80deea",
                          },
                        }}
                      />
                    </ListItemButton>
                  </ListItem>
                  <ListItem disablePadding>
                    <ListItemButton href="/agendar-cita" sx={{ padding: "10px 16px" }}>
                      <ListItemText
                        primary="Agendar Cita"
                        sx={{
                          color: "#01579b",
                          "&:hover": {
                            color: "#ffffff",
                            backgroundColor: "#80deea",
                          },
                        }}
                      />
                    </ListItemButton>
                  </ListItem>
                </List>
              </Box>
            </Box>
            <Box
              sx={{
                position: "relative",
                marginX: 1,
                "&:hover .submenu": {
                  display: "block",
                },
              }}
            >
              <Button
                color="inherit"
                startIcon={<ReceiptLongIcon />}
                sx={{
                  fontWeight: "bold",
                  fontSize: "16px",
                  color: "#ffffff",
                  borderRadius: "8px",
                  padding: "8px 16px",
                }}
              >
                Tratamientos
              </Button>
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
                    <ListItemButton href="/tratamientos-activos" sx={{ padding: "10px 16px" }}>
                      <ListItemText
                        primary="Tratamientos Activos"
                        sx={{
                          color: "#01579b",
                          "&:hover": {
                            color: "#ffffff",
                            backgroundColor: "#80deea",
                          },
                        }}
                      />
                    </ListItemButton>
                  </ListItem>
                  <ListItem disablePadding>
                    <ListItemButton href="/historial-tratamientos" sx={{ padding: "10px 16px" }}>
                      <ListItemText
                        primary="Historial de tratamientos"
                        sx={{
                          color: "#01579b",
                          "&:hover": {
                            color: "#ffffff",
                            backgroundColor: "#80deea",
                          },
                        }}
                      />
                    </ListItemButton>
                  </ListItem>
                </List>
              </Box>
            </Box>
            <Box
              sx={{
                position: "relative",
                marginX: 1,
                "&:hover .submenu": {
                  display: "block",
                },
              }}
            >
              <Button
                color="inherit"
                startIcon={<AttachMoneyIcon/>}
                sx={{
                  fontWeight: "bold",
                  fontSize: "16px",
                  color: "#ffffff",
                  borderRadius: "8px",
                  padding: "8px 16px",
                }}
              >
                Pagos
              </Button>
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
                    <ListItemButton href="/historial-pagos" sx={{ padding: "10px 16px" }}>
                      <ListItemText
                        primary="Historial de Pagos"
                        sx={{
                          color: "#01579b",
                          "&:hover": {
                            color: "#ffffff",
                            backgroundColor: "#80deea",
                          },
                        }}
                      />
                    </ListItemButton>
                  </ListItem>
                  <ListItem disablePadding>
                    <ListItemButton href="/facturacion" sx={{ padding: "10px 16px" }}>
                      <ListItemText
                        primary="Facturación"
                        sx={{
                          color: "#01579b",
                          "&:hover": {
                            color: "#ffffff",
                            backgroundColor: "#80deea",
                          },
                        }}
                      />
                    </ListItemButton>
                  </ListItem>
                </List>
              </Box>
            </Box>
            
            {/* Botón con submenú */}
            <Button
              color="inherit"
              startIcon={<ListAltIcon />}
              href="/catalogo-servicios"
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
              Servicios
            </Button>
            <Button
              color="inherit"
              startIcon={<AccountCircleIcon/>}
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
              Perfil
            </Button>

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

      
    </List>
  </Box>
</Drawer>


    </ThemeProvider>
  );
};

export default NavbarPaciente;
