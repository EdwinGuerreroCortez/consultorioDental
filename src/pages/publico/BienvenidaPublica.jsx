import React from "react";
import imagenDental from "../../assets/images/image.jpg"; // Ruta relativa desde src/pages/publico

const BienvenidaPublica = () => {
  return (
    <>
      <div
        style={{
          position: "relative",
          textAlign: "center",
          color: "white",
        }}
      >
        {/* Imagen de fondo */}
        <img
          src={imagenDental}
          alt="Consultorio Dental"
          style={{
            width: "100%",
            height: "auto",
            objectFit: "cover",
          }}
        />
        {/* Contenedor de texto */}
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            padding: "20px",
            borderRadius: "10px",
          }}
        >
          <h1 style={{ fontSize: "2.5rem", margin: 0 }}>
            Bienvenido al Consultorio Dental
          </h1>
          <p style={{ fontSize: "1.2rem", marginTop: "10px" }}>
            Encuentra a los mejores dentistas cerca de ti.
          </p>
        </div>
      </div>

      {/* Sección de contenido adicional */}
      <div style={{ padding: "20px", textAlign: "center", backgroundColor: "#f5f5f5" }}>
        <section style={{ marginBottom: "30px" }}>
          <h2 style={{ fontSize: "2rem", color: "#0077b6" }}>Nuestros Servicios</h2>
          <p style={{ fontSize: "1.2rem", color: "#333" }}>
            Ofrecemos una amplia gama de servicios para cuidar tu sonrisa:
          </p>
          <ul style={{ listStyleType: "none", padding: 0 }}>
            <li>✔️ Limpiezas dentales</li>
            <li>✔️ Blanqueamientos</li>
            <li>✔️ Ortodoncia</li>
            <li>✔️ Implantes dentales</li>
            <li>✔️ Emergencias dentales</li>
          </ul>
        </section>

        <section style={{ marginBottom: "30px" }}>
          <h2 style={{ fontSize: "2rem", color: "#0077b6" }}>Horarios de Atención</h2>
          <p style={{ fontSize: "1.2rem", color: "#333" }}>
            Lunes a Viernes: 9:00 AM - 7:00 PM <br />
            Sábado: 10:00 AM - 2:00 PM
          </p>
        </section>

        <section style={{ marginBottom: "30px" }}>
          <h2 style={{ fontSize: "2rem", color: "#0077b6" }}>¿Dónde estamos?</h2>
          <p style={{ fontSize: "1.2rem", color: "#333" }}>
            Estamos ubicados en <strong>Huejutla de Reyes, Hgo.</strong> Visítanos en nuestra dirección:
          </p>
          <p>
            <a
              href="https://www.google.com/maps"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                color: "#0077b6",
                textDecoration: "none",
                fontWeight: "bold",
              }}
            >
              Ver en Google Maps
            </a>
          </p>
        </section>

        <section style={{ marginBottom: "30px" }}>
          <h2 style={{ fontSize: "2rem", color: "#0077b6" }}>¡Agende su cita!</h2>
          <button
            style={{
              padding: "10px 20px",
              fontSize: "1.2rem",
              color: "white",
              backgroundColor: "#0077b6",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
            }}
            onClick={() => alert("Agendar cita próximamente")}
          >
            Reservar ahora
          </button>
        </section>
      </div>
    </>
  );
};

export default BienvenidaPublica;
