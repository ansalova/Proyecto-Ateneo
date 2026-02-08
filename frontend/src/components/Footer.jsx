import React from 'react'

export default function Footer() {
  return (
    <footer
      style={{
        background: '#111827',
        color: '#fff',
        padding: '1rem',
        marginTop: 40,
        textAlign: 'center'
      }}
    >
      <div className="container">
        &copy; {new Date().getFullYear()} Colegio Ateneo — Tienda Oficial
      </div>
    </footer>
  )
}
