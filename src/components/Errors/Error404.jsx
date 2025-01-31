import { Link } from "react-router-dom";
import "../styles/error.css";
import DienteConfundido from "../../assets/images/DienteConfundido.png"; // Importa la imagen

const Error404 = () => {
  return (
    <div className="error-page">
      <div className="error-content">
        <img src={DienteConfundido} alt="Diente confundido" className="error-image" />
        <h1>404</h1>
        <h2>Página no encontrada</h2>
        <p>¡Ups! Parece que te perdiste. ¿Quizás olvidaste tu cepillo de dientes?</p>
        
        <img src={DienteConfundido} alt="Diente confundido" className="error-image2" />
        <Link to="/" className="btn-home">Volver al Inicio</Link>
      </div>
      
      <div className="bubbles">
        <span></span><span></span><span></span><span></span><span></span><span></span>
        <span></span><span></span><span></span><span></span><span></span><span></span>
      </div>
    </div>
  );
};

export default Error404;
