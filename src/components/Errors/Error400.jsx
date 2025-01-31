import { Link } from "react-router-dom";
import "../styles/error400.css";
import DienteMuerto from "../../assets/images/DienDead.png"; // Imagen para el error 400

const Error400 = () => {
  return (
    <div className="error400-page"> {/* Asegúrate de que esta clase esté aquí */}
      <div className="error-page2">
        <div className="error-content2">
          <img src={DienteMuerto} alt="Diente muerto" className="error-image2" />
          <h1>400</h1>
          <h2>Solicitud incorrecta</h2>
          <p>¡Ups! Algo no salió bien. ¿Quizás olvidaste algo importante, como tu pasta de dientes?</p>
          <Link to="/" className="btn-home">Volver al Inicio</Link>
        </div>
      </div>
      
      <div className="bubbles">
        <span></span><span></span><span></span><span></span><span></span><span></span>
        <span></span><span></span><span></span><span></span><span></span><span></span>
      </div>
    </div>
  );
};

export default Error400;
