import React from "react";
import imagenDental from "../../assets/images/image.jpg"; // Ruta relativa desde src/pages/publico
import HeroSection from "./Bienvenida/HeroSection";
import Servicios from "./Bienvenida/Servicios";
import Horarios from "./Bienvenida/Horarios";
import Ubicacion from "./Bienvenida/Ubicacion";

const BienvenidaPublica = () => {
  return (
    <>
     <HeroSection />
      <Servicios />
      <Horarios />
      <Ubicacion />
     
    </>
  );
};

export default BienvenidaPublica;
