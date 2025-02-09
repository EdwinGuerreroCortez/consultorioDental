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
  TextField,
  Tooltip,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import HomeIcon from "@mui/icons-material/Home";
import ListAltIcon from "@mui/icons-material/ListAlt";
import LoginIcon from "@mui/icons-material/Login";
import SearchIcon from "@mui/icons-material/Search";
import InputAdornment from "@mui/material/InputAdornment";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import "@fontsource/poppins";
import logo from "../../../assets/images/logo.png";

const NavbarPublico = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [showNavbar, setShowNavbar] = useState(true);
  const [lastScroll, setLastScroll] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const searchBoxRef = useRef(null);

  const toggleDrawer = (open) => (event) => {
    if (event.type === "keydown" && (event.key === "Tab" || event.key === "Shift")) {
      return;
    }
    setDrawerOpen(open);
  };

  useEffect(() => {
    const handleScroll = () => {
      const currentScroll = window.scrollY;
      setShowNavbar(currentScroll <= lastScroll || currentScroll <= 100);
      setLastScroll(currentScroll);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScroll]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchBoxRef.current && !searchBoxRef.current.contains(event.target)) {
        setSearchResults([]); // Cierra el cuadro de resultados
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
        const filteredResults = results.filter((result) =>
          new RegExp(term, "i").test(result.nombre)
        );
        setSearchResults(filteredResults);
      } catch (error) {
        console.error("Error en la búsqueda:", error);
      }
    } else {
      setSearchResults([]);
    }
  };

  const theme = createTheme({
    typography: {
      fontFamily: "Poppins, Arial, sans-serif",
    },
  });

  const highlightMatch = (text, searchTerm) => {
    if (!searchTerm) return text;
    const regex = new RegExp(`(${searchTerm})`, "gi");
    const parts = text.split(regex);
    return parts.map((part, index) =>
      part.toLowerCase() === searchTerm.toLowerCase() ? (
        <Typography key={index} component="span" sx={{ fontWeight: "bold", textDecoration: "underline", color: "#d32f2f" }}>
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
          <IconButton color="inherit" edge="start" onClick={toggleDrawer(true)} sx={{ display: { xs: "block", md: "none" } }}>
            <MenuIcon />
          </IconButton>

          <Box sx={{ flexGrow: 1, display: "flex", alignItems: "center" }}>
            <img src={logo} alt="Consultorio Dental" style={{ height: "100px", width: "auto", marginRight: "12px", borderRadius: "50px" }} />
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
                          href={`/catalogo-servicios/${result.hash}`}
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

          <Box sx={{ display: { xs: "none", md: "flex" }, alignItems: "center" }}>
            {/* Botón Inicio */}
            <Tooltip title="Inicio" placement="top" arrow>
              <Button
                color="inherit"
                href="/"
                sx={{
                  fontSize: "16px",
                  color: "#ffffff",
                  borderRadius: "8px",
                  padding: "8px 16px",
                  marginX: 1,
                  position: "relative",
                  "&:hover .menu-text": {
                    display: "block",
                    opacity: 1,
                  },
                }}
              >
                <HomeIcon />
                <Box
                  className="menu-text"
                  sx={{
                    display: "none",
                    opacity: 0,
                    transition: "opacity 0.3s ease-in-out",
                    position: "absolute",
                    top: "100%",
                    left: "50%",
                    transform: "translateX(-50%)",
                    color: "#ffffff",
                    fontWeight: "bold",
                    marginTop: "4px",
                    whiteSpace: "nowrap",
                  }}
                >

                </Box>
              </Button>
            </Tooltip>

            {/* Botón Servicios */}
            <Tooltip title="Servicios" placement="top" arrow>
              <Button
                color="inherit"
                href="/catalogo-servicios"
                sx={{
                  fontSize: "16px",
                  color: "#ffffff",
                  borderRadius: "8px",
                  padding: "8px 16px",
                  marginX: 1,
                  position: "relative",
                  "&:hover .menu-text": {
                    display: "block",
                    opacity: 1,
                  },
                }}
              >
                <ListAltIcon />
                <Box
                  className="menu-text"
                  sx={{
                    display: "none",
                    opacity: 0,
                    transition: "opacity 0.3s ease-in-out",
                    position: "absolute",
                    top: "100%",
                    left: "50%",
                    transform: "translateX(-50%)",
                    color: "#ffffff",
                    fontWeight: "bold",
                    marginTop: "4px",
                    whiteSpace: "nowrap",
                  }}
                >
                </Box>
              </Button>
            </Tooltip>

            {/* Botón Login */}
            <Tooltip title="Iniciar Sesión" placement="top" arrow>
              <Button
                color="inherit"
                href="/login"
                sx={{
                  fontSize: "16px",
                  color: "#ffffff",
                  borderRadius: "8px",
                  padding: "8px 16px",
                  marginX: 1,
                  position: "relative",
                  "&:hover .menu-text": {
                    display: "block",
                    opacity: 1,
                  },
                }}
              >
                <LoginIcon />
                <Box
                  className="menu-text"
                  sx={{
                    display: "none",
                    opacity: 0,
                    transition: "opacity 0.3s ease-in-out",
                    position: "absolute",
                    top: "100%",
                    left: "50%",
                    transform: "translateX(-50%)",
                    color: "#ffffff",
                    fontWeight: "bold",
                    marginTop: "4px",
                    whiteSpace: "nowrap",
                  }}
                >
                </Box>
              </Button>
            </Tooltip>
          </Box>

        </Toolbar>
      </AppBar>

      <Drawer anchor="left" open={drawerOpen} onClose={toggleDrawer(false)}>
        <Box sx={{ width: 250, backgroundColor: "#e0f7fa", height: "100%" }} role="presentation" onClick={toggleDrawer(false)} onKeyDown={toggleDrawer(false)}>
          <Typography variant="h6" sx={{ padding: "16px", fontWeight: "bold", textAlign: "center", background: "linear-gradient(90deg, #0077b6, #00aaff)", color: "#ffffff" }}>
            Consultorio Dental
          </Typography>
          <Divider />
          <List>
            <ListItem disablePadding>
              <ListItemButton href="/">
                <HomeIcon sx={{ marginRight: "10px", color: "#01579b" }} />
                <ListItemText primary="Inicio" sx={{ color: "#01579b", "& .MuiListItemText-primary": { fontWeight: "bold" } }} />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton href="/catalogo-servicios">
                <ListAltIcon sx={{ marginRight: "10px", color: "#01579b" }} />
                <ListItemText primary="Catálogo de Servicios" sx={{ color: "#01579b", "& .MuiListItemText-primary": { fontWeight: "bold" } }} />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton href="/login">
                <LoginIcon sx={{ marginRight: "10px", color: "#01579b" }} />
                <ListItemText primary="Login" sx={{ color: "#01579b", "& .MuiListItemText-primary": { fontWeight: "bold" } }} />
              </ListItemButton>
            </ListItem>
          </List>
        </Box>
      </Drawer>
    </ThemeProvider>
  );
};

export default NavbarPublico;
