import { Link } from "react-router-dom";
import "../styles/error500.css";  // Asegúrate de que el archivo CSS se importa correctamente
import Buscando from "../../assets/images/Buscando.gif"; // Imagen para el error 500

const Error500 = () => {
  return (
    <div className="error500-page"> 
      <div className="error-page500">
        <div className="error-content500">
          <img src={Buscando} alt="Diente roto" className="error-image500" />
          <img src={Buscando} alt="Diente roto" className="error-image5002" />
          <h1>500</h1>
          <h2>Algo salió mal</h2>
          <p>¡Oops! El servidor está teniendo problemas. Intenta más tarde.</p>
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

export default Error500;
