import React, { useEffect, useState } from "react";
import HeroSection from "./Bienvenida/HeroSection";
import Servicios from "./Bienvenida/Servicios";
import Horarios from "./Bienvenida/Horarios";
import Ubicacion from "./Bienvenida/Ubicacion";

const BienvenidaPublica = () => {
  const [ubicacion, setUbicacion] = useState(null);
  const [errorUbicacion, setErrorUbicacion] = useState(null);

  useEffect(() => {
    // La geolocalización solo funciona en HTTPS o http://localhost
    if (!("geolocation" in navigator)) {
      setErrorUbicacion("Tu navegador no soporta geolocalización.");
      return;
    }

    const onOk = (pos) => {
      setUbicacion({
        latitud: pos.coords.latitude,
        longitud: pos.coords.longitude,
        precision: pos.coords.accuracy
      });
    };

    const onErr = (err) => {
      switch (err.code) {
        case err.PERMISSION_DENIED:
          setErrorUbicacion("Permiso de ubicación denegado.");
          break;
        case err.POSITION_UNAVAILABLE:
          setErrorUbicacion("Ubicación no disponible.");
          break;
        case err.TIMEOUT:
          setErrorUbicacion("Tiempo de espera agotado.");
          break;
        default:
          setErrorUbicacion("Error desconocido al obtener la ubicación.");
      }
    };

    // Solicita la ubicación una vez
    navigator.geolocation.getCurrentPosition(onOk, onErr, {
      enableHighAccuracy: true,
      timeout: 8000,
      maximumAge: 0
    });
  }, []);

  return (
    <>
      <HeroSection />
      <Servicios />
      <Horarios />
      {/* Le pasamos ubicacion y error al componente */}
      <Ubicacion ubicacion={ubicacion} error={errorUbicacion} />
    </>
  );
};

export default BienvenidaPublica;
