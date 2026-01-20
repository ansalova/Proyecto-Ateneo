import React from 'react'

export default function Footer() {
  return (
    <footer
      style={{
        background: '#111827',
        color: '#fff',
        padding: '2rem 1rem',
        marginTop: 40,
        textAlign: 'center'
      }}
    >
      <div className="container">
        <div style={{ marginBottom: "1rem" }}>
          <a href="/contacto" style={{ color: "#fff", textDecoration: "none", marginRight: "15px" }}>Contacto</a>
          <a href="/privacidad" style={{ color: "#fff", textDecoration: "none", marginRight: "15px" }}>Política de Privacidad</a>
          <a href="/terminos" style={{ color: "#fff", textDecoration: "none" }}>Términos y Condiciones</a>
        </div>
        &copy; {new Date().getFullYear()} Colegio Ateneo — Tienda Oficial
      </div>
    </footer>
  )
}
