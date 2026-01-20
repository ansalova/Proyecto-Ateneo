import React from 'react';

export default function Contact() {
  return (
    <div className="container" style={{ padding: "40px 20px", maxWidth: "800px", margin: "0 auto" }}>
      <h1 style={{ textAlign: "center", marginBottom: "40px" }}>Contáctanos</h1>

      <div className="grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "40px" }}>
        {/* Información de Contacto */}
        <div className="contact-info">
          <h3>Información</h3>
          <p>
            <strong>Dirección:</strong><br />
            Calle 123 #45-67<br />
            Barrio El Prado<br />
            Ciudad, País
          </p>
          <p>
            <strong>Teléfono:</strong><br />
            +57 300 123 4567<br />
            (601) 234 5678
          </p>
          <p>
            <strong>Email:</strong><br />
            secretaria@colegioateneo.edu.co<br />
            pagos@colegioateneo.edu.co
          </p>
          <p>
            <strong>Horario de Atención:</strong><br />
            Lunes a Viernes: 7:00 AM - 3:00 PM
          </p>
        </div>

        {/* Mapa (Placeholder) */}
        <div className="map-container" style={{ backgroundColor: "#eee", minHeight: "300px", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "8px" }}>
          <p style={{ color: "#666" }}>Aquí iría el mapa de Google Maps</p>
          {/* 
            Para integrar Google Maps real:
            <iframe 
              src="https://www.google.com/maps/embed?..." 
              width="100%" 
              height="300" 
              style={{ border: 0 }} 
              allowFullScreen="" 
              loading="lazy">
            </iframe>
          */}
        </div>
      </div>

      {/* Formulario de Contacto Simple */}
      <div style={{ marginTop: "50px" }}>
        <h3>Envíanos un mensaje</h3>
        <form onSubmit={(e) => { e.preventDefault(); alert("Mensaje enviado (simulación)"); }}>
          <div style={{ marginBottom: "15px" }}>
            <label>Nombre</label>
            <input type="text" className="input" required style={{ width: "100%" }} />
          </div>
          <div style={{ marginBottom: "15px" }}>
            <label>Email</label>
            <input type="email" className="input" required style={{ width: "100%" }} />
          </div>
          <div style={{ marginBottom: "15px" }}>
            <label>Mensaje</label>
            <textarea className="input" rows="5" required style={{ width: "100%" }}></textarea>
          </div>
          <button type="submit" className="button">Enviar Mensaje</button>
        </form>
      </div>
    </div>
  );
}
