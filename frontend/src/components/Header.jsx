import React, { useContext } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'
import { CartContext } from '../context/CartContext'
import { useCartUI } from '../context/CartUIContext'

export default function Header() {
  const { user, logout } = useContext(AuthContext)
  const { items } = useContext(CartContext)
  const { toggleCart } = useCartUI()
  const nav = useNavigate()

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      width: '100%'
    }}>
      {/* IZQUIERDA */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <Link
          to="/"
          style={{ color: '#fff', fontWeight: 700, fontSize: 40, textDecoration: 'none' }}
        >
          ATENEO
        </Link>
        <Link to="/" style={{ color: '#fff', textDecoration: 'none' }}>
          COLEGIO
        </Link>
      </div>

      {/* DERECHA */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <button className="button" onClick={toggleCart}>
          Carrito ({items.length})
        </button>

        {user ? (
          <>
            {(user.role === 'teacher' || user.role === 'admin') && (
              <Link to="/profesor">
                <button className="button" style={{ backgroundColor: '#ff9800' }}>
                  Panel Profesor
                </button>
              </Link>
            )}
            <Link to="/ordenes">
              <button className="button" style={{ backgroundColor: '#1d4ed8' }}>
                Mis Órdenes
              </button>
            </Link>
            <span style={{ color: '#fff' }}>
              {user.name} <small style={{ opacity: 0.8 }}>({user.role === 'teacher' ? 'Profesor' : user.role === 'admin' ? 'Admin' : 'Estudiante'})</small>
            </span>
            <button
              className="button"
              onClick={() => {
                logout()
                nav('/login')
              }}
            >
              Salir
            </button>
          </>
        ) : (
          <Link to="/login">
            <button className="button">Iniciar sesión</button>
          </Link>
        )}
      </div>
    </div>
  )
}
