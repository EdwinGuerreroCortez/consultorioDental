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
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import HomeIcon from "@mui/icons-material/Home";
import ListAltIcon from "@mui/icons-material/ListAlt"; // Ícono para Catálogo
import LoginIcon from "@mui/icons-material/Login"; // Ícono para Login
import { createTheme, ThemeProvider } from "@mui/material/styles";
import "@fontsource/poppins"; // Importa la fuente
import logo from "../../assets/images/logo.png"; // Ruta al logo

const NavbarPublico = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [showNavbar, setShowNavbar] = useState(true);
  const [lastScroll, setLastScroll] = useState(0);

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

  // Define el tema con la nueva fuente
  const theme = createTheme({
    typography: {
      fontFamily: "Geologica, Arial, sans-serif", // Cambia aquí si usas otra fuente
    },
  });

  return (
    <ThemeProvider theme={theme}>
      <AppBar
        sx={{
          height: "80px",
          background: "linear-gradient(90deg,rgb(28, 1, 202),rgb(0, 26, 255))",
          boxShadow: "0 4px 10px rgba(0, 0, 0, 0.2)",
          transform: showNavbar ? "translateY(0)" : "translateY(-100%)",
          transition: "transform 0.3s ease-in-out",
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
        }}
      >
        <Toolbar
          sx={{ height: "100%", display: "flex", alignItems: "center", padding: 0 }}
        >
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
              style={{ height: "80px", width: "auto", marginRight: "10px" }}
            />
            <Typography variant="h5" sx={{ fontWeight: "bold" }}>
              Consultorio Dental
            </Typography>
          </Box>

          {/* Menú de navegación para pantallas grandes */}
          <Box sx={{ display: { xs: "none", md: "flex" } }}>
            <Button
              color="inherit"
              startIcon={<HomeIcon />}
              href="/"
              sx={{
                fontWeight: "bold",
                fontSize: "16px",
                "&:hover": { backgroundColor: "rgba(255, 255, 255, 0.2)" },
              }}
            >
              Inicio
            </Button>
            <Button
              color="inherit"
              startIcon={<ListAltIcon />}
              href="/catalogo-servicios"
              sx={{
                fontWeight: "bold",
                fontSize: "16px",
                "&:hover": { backgroundColor: "rgba(255, 255, 255, 0.2)" },
              }}
            >
              Servicios
            </Button>
            <Button
              color="inherit"
              startIcon={<LoginIcon />}
              href="/login"
              sx={{
                fontWeight: "bold",
                fontSize: "16px",
                "&:hover": { backgroundColor: "rgba(255, 255, 255, 0.2)" },
              }}
            >
              Login
            </Button>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Menú lateral para pantallas pequeñas */}
      <Drawer anchor="left" open={drawerOpen} onClose={toggleDrawer(false)}>
        <Box
          sx={{ width: 250 }}
          role="presentation"
          onClick={toggleDrawer(false)}
          onKeyDown={toggleDrawer(false)}
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
            <ListItem disablePadding>
              <ListItemButton href="/publico">
                <HomeIcon sx={{ marginRight: "10px" }} />
                <ListItemText primary="Inicio" />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton href="/catalogo-servicios">
                <ListAltIcon sx={{ marginRight: "10px" }} />
                <ListItemText primary="Catálogo de Servicios" />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton href="/login">
                <LoginIcon sx={{ marginRight: "10px" }} />
                <ListItemText primary="Login" />
              </ListItemButton>
            </ListItem>
          </List>
        </Box>
      </Drawer>
    </ThemeProvider>
  );
};

export default NavbarPublico;
