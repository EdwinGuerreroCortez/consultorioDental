import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import loadingGif from "../assets/images/Cargando.gif";
import "../components/styles/Loader.css"; 

const Loader = ({ children }) => {
  const [loading, setLoading] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setLoading(true);
    const timeout = setTimeout(() => setLoading(false), 500); 
    return () => clearTimeout(timeout);
  }, [location]);

  return loading ? (
    <div className="loader-container">
      <img src={loadingGif} alt="Cargando..." className="loader-gif" />
    </div>
  ) : (
    children
  );
};

export default Loader;
