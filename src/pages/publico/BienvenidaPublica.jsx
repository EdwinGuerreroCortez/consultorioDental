import React, { useEffect, useState } from "react";
import HeroSection from "./Bienvenida/HeroSection";
import Servicios from "./Bienvenida/Servicios";
import Horarios from "./Bienvenida/Horarios";
import Ubicacion from "./Bienvenida/Ubicacion";

const BienvenidaPublica = () => {
  const [ubicacion, setUbicacion] = useState(null);
  const [errorUbicacion, setErrorUbicacion] = useState(null);

  useEffect(() => {
    // Verifica compatibilidad
    if (!("geolocation" in navigator)) {
      setErrorUbicacion("Tu navegador no soporta geolocalización.");
      return;
    }

    // 🧭 Intenta revisar el permiso de ubicación
    if (navigator.permissions) {
      navigator.permissions
        .query({ name: "geolocation" })
        .then((result) => {
          if (result.state === "denied") {
            setErrorUbicacion("Permiso de ubicación denegado por el usuario.");
            return;
          }

          // Solicita ubicación si no está denegada
          navigator.geolocation.getCurrentPosition(onOk, onErr, {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0,
          });
        })
        .catch(() => {
          // Si falla, igualmente intenta solicitarla
          navigator.geolocation.getCurrentPosition(onOk, onErr, {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0,
          });
        });
    } else {
      // Si no soporta Permissions API
      navigator.geolocation.getCurrentPosition(onOk, onErr, {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      });
    }

    // Funciones auxiliares
    function onOk(pos) {
      setUbicacion({
        latitud: pos.coords.latitude,
        longitud: pos.coords.longitude,
        precision: pos.coords.accuracy,
      });
    }

    function onErr(err) {
      switch (err.code) {
        case err.PERMISSION_DENIED:
          setErrorUbicacion("Permiso de ubicación denegado.");
          break;
        case err.POSITION_UNAVAILABLE:
          setErrorUbicacion("Ubicación no disponible.");
          break;
        case err.TIMEOUT:
          setErrorUbicacion("Tiempo de espera agotado al obtener la ubicación.");
          break;
        default:
          setErrorUbicacion("Error desconocido al obtener la ubicación.");
      }
    }
  }, []);

  return (
    <>
      <HeroSection />
      <Servicios />
      <Horarios />
      <Ubicacion ubicacion={ubicacion} error={errorUbicacion} />
    </>
  );
};

export default BienvenidaPublica;
