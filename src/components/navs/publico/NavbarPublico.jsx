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
import ListAltIcon from "@mui/icons-material/ListAlt";
import LoginIcon from "@mui/icons-material/Login";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import "@fontsource/poppins";
import logo from "../../../assets/images/logo.png";

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

  // Define el tema con la fuente Poppins
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
          background: "linear-gradient(90deg, #0077b6, #00aaff)", // Fondo azul con degradado
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

          {/* Menú de navegación para pantallas grandes */}
          <Box sx={{ display: { xs: "none", md: "flex" } }}>
            <Button
              color="inherit"
              startIcon={<HomeIcon />}
              href="/"
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
              startIcon={<LoginIcon />}
              href="/login"
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
              Login
            </Button>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Menú lateral para pantallas pequeñas */}
      <Drawer anchor="left" open={drawerOpen} onClose={toggleDrawer(false)}>
        <Box
          sx={{
            width: 250,
            backgroundColor: "#e0f7fa",
            height: "100%",
          }}
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
              <ListItemButton href="/">
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
            <ListItem disablePadding>
              <ListItemButton href="/catalogo-servicios">
                <ListAltIcon sx={{ marginRight: "10px", color: "#01579b" }} />
                <ListItemText
                  primary="Catálogo de Servicios"
                  sx={{
                    color: "#01579b",
                    "& .MuiListItemText-primary": { fontWeight: "bold" },
                  }}
                />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton href="/login">
                <LoginIcon sx={{ marginRight: "10px", color: "#01579b" }} />
                <ListItemText
                  primary="Login"
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

export default NavbarPublico;
