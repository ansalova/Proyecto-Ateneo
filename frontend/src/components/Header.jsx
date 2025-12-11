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
            <span style={{ color: '#fff' }}>{user.name}</span>
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
