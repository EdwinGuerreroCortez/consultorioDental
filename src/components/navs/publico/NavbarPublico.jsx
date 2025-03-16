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
  TextField,
  Tooltip,
  Fade,
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

  return (
    <ThemeProvider theme={theme}>
      <AppBar
        sx={{
          height: "80px", // Altura fija del Navbar
          background: "linear-gradient(90deg, #003366, #0077b6)",
          position: "static", // Desplazamiento natural
          width: "100%",
          zIndex: 10,
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.2)",
          margin: 0, // Sin márgenes alrededor del AppBar
          padding: 0, // Sin relleno externo
        }}
      >
        <Toolbar
          sx={{
            height: "80px", // Igualamos la altura al AppBar
            minHeight: "80px !important", // Forzamos la altura mínima para evitar valores predeterminados de MUI
            display: "flex",
            alignItems: "center",
            paddingX: 2,
            paddingY: 0, // Sin relleno vertical
            margin: 0, // Sin márgenes internos
          }}
        >
          <IconButton
            color="inherit"
            edge="start"
            onClick={toggleDrawer(true)}
            sx={{
              display: { xs: "block", md: "none" },
              "&:hover": { transform: "rotate(180deg)", transition: "transform 0.3s" },
              margin: 0, // Sin márgenes en el botón
            }}
            aria-label="Abrir menú lateral"
          >
            <MenuIcon />
          </IconButton>

          <Box sx={{ flexGrow: 1, display: "flex", alignItems: "center", margin: 0 }}>
            <img
              src={logo}
              alt="Consultorio Dental"
              style={{
                height: "60px",
                width: "auto",
                marginRight: "12px",
                marginTop: 0,
                marginBottom: 0,
                borderRadius: "50%",
                transition: "transform 0.3s",
              }}
            />
            <Typography
              variant="h6"
              sx={{
                fontWeight: "bold",
                color: "#ffffff",
                letterSpacing: "0.5px",
                textShadow: "1px 1px 2px rgba(0, 0, 0, 0.2)",
                margin: 0, // Sin márgenes en el texto
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
                marginTop: 0,
                marginBottom: 0,
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
                  margin: 0, // Sin márgenes en el TextField
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
                          href={`/catalogo-servicios/${result.hash}`}
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

          <Box
            sx={{ display: { xs: "none", md: "flex" }, alignItems: "center", gap: 1, margin: 0 }}
          >
            <Tooltip title="Inicio" placement="top" arrow>
              <IconButton
                href="/"
                sx={{
                  color: "#fff",
                  backgroundColor: "rgba(255, 255, 255, 0.2)",
                  borderRadius: "50%",
                  p: 1.5,
                  "&:hover": { backgroundColor: "rgba(255, 255, 255, 0.4)", transform: "scale(1.1)" },
                  transition: "all 0.3s",
                  margin: 0, // Sin márgenes en el botón
                }}
                aria-label="Inicio"
              >
                <HomeIcon />
              </IconButton>
            </Tooltip>

            <Tooltip title="Servicios" placement="top" arrow>
              <IconButton
                href="/catalogo-servicios"
                sx={{
                  color: "#fff",
                  backgroundColor: "rgba(255, 255, 255, 0.2)",
                  borderRadius: "50%",
                  p: 1.5,
                  "&:hover": { backgroundColor: "rgba(255, 255, 255, 0.4)", transform: "scale(1.1)" },
                  transition: "all 0.3s",
                  margin: 0, // Sin márgenes en el botón
                }}
                aria-label="Servicios"
              >
                <ListAltIcon />
              </IconButton>
            </Tooltip>

            <Tooltip title="Iniciar Sesión" placement="top" arrow>
              <IconButton
                href="/login"
                sx={{
                  color: "#fff",
                  backgroundColor: "rgba(255, 255, 255, 0.2)",
                  borderRadius: "50%",
                  p: 1.5,
                  "&:hover": { backgroundColor: "rgba(255, 255, 255, 0.4)", transform: "scale(1.1)" },
                  transition: "all 0.3s",
                  margin: 0, // Sin márgenes en el botón
                }}
                aria-label="Iniciar Sesión"
              >
                <LoginIcon />
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
              <ListItemButton href="/" onClick={toggleDrawer(false)}>
                <HomeIcon sx={{ marginRight: "10px", color: "#01579b" }} />
                <ListItemText
                  primary="Inicio"
                  sx={{ color: "#01579b", "& .MuiListItemText-primary": { fontWeight: "bold" } }}
                />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton href="/catalogo-servicios" onClick={toggleDrawer(false)}>
                <ListAltIcon sx={{ marginRight: "10px", color: "#01579b" }} />
                <ListItemText
                  primary="Catálogo de Servicios"
                  sx={{ color: "#01579b", "& .MuiListItemText-primary": { fontWeight: "bold" } }}
                />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton href="/login" onClick={toggleDrawer(false)}>
                <LoginIcon sx={{ marginRight: "10px", color: "#01579b" }} />
                <ListItemText
                  primary="Login"
                  sx={{ color: "#01579b", "& .MuiListItemText-primary": { fontWeight: "bold" } }}
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