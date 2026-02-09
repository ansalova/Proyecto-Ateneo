import React, { useContext, useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'
import { CartContext } from '../context/CartContext'
import { useCartUI } from '../context/CartUIContext'
import { ShoppingCart, LogOut, User, MessageCircle, FileText } from 'lucide-react'
import API from '../services/api'

export default function Header() {
  const { user, logout } = useContext(AuthContext)
  const { items } = useContext(CartContext)
  const { toggleCart } = useCartUI()
  const nav = useNavigate()
  const [unreadCount, setUnreadCount] = useState(0)
  
  // El repo contiene un archivo público llamado `escudo-colegio.png.PNG`.
  // Usarlo primero para evitar 404; mantener otros fallbacks útiles.
  const [logoSrc, setLogoSrc] = useState('/escudo-colegio.png.PNG')
  const [fallbackIndex, setFallbackIndex] = useState(0)
  const fallbacks = ['/escudo-colegio.png', '/escudo-colegio.svg', '/escudo.png', '/escudo.svg', 'https://via.placeholder.com/40?text=Escudo']

  // Obtener contador de anuncios sin leer
  useEffect(() => {
    if (user) {
      const fetchUnreadCount = async () => {
        try {
          const { data } = await API.get('/api/announcements/new-count')
          setUnreadCount(data.unread_count)
        } catch (err) {
          console.error('Error fetching unread count:', err)
        }
      }
      fetchUnreadCount()
      
      // Actualizar cada 30 segundos
      const interval = setInterval(fetchUnreadCount, 30000)
      return () => clearInterval(interval)
    }
  }, [user])

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      width: '100%'
    }}>
      {/* IZQUIERDA */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <img
          src={logoSrc}
          alt="Escudo del Colegio"
          style={{ height: 40, width: 40, objectFit: 'contain', borderRadius: 6 }}
          onError={() => {
            if (fallbackIndex < fallbacks.length) {
              setLogoSrc(fallbacks[fallbackIndex])
              setFallbackIndex(fallbackIndex + 1)
            } else {
              setLogoSrc('https://via.placeholder.com/40?text=')
            }
          }}
        />
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
        <Link to="/anuncios" style={{ position: 'relative' }}>
          <button className="button" style={{ display: 'flex', alignItems: 'center', gap: 6, position: 'relative' }}>
            <MessageCircle size={18} /> Anuncios
            {user && unreadCount > 0 && (
              <span style={{
                position: 'absolute',
                top: -8,
                right: -8,
                backgroundColor: '#ef4444',
                color: '#fff',
                borderRadius: '50%',
                width: 24,
                height: 24,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 12,
                fontWeight: 'bold'
              }}>
                {unreadCount}
              </span>
            )}
          </button>
        </Link>

        <Link to="/documentos">
          <button className="button" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <FileText size={18} /> Documentos
          </button>
        </Link>

        <button className="button" onClick={toggleCart} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <ShoppingCart size={18} /> Carrito ({items.length})
        </button>

        {user ? (
          <>
            {(user.role === 'teacher' || user.role === 'admin') ? (
              <Link to="/profesor">
                <button className="button" style={{ backgroundColor: '#ff9800' }}>
                  Panel de profesores
                </button>
              </Link>
            ) : (
              <Link to="/mis-notas">
                <button className="button" style={{ backgroundColor: '#4caf50' }}>
                  Mis Calificaciones
                </button>
              </Link>
            )}
            <span style={{ color: '#fff', display: 'flex', alignItems: 'center', gap: 6 }}>
              <User size={18} />
              {user.name} <small style={{ opacity: 0.8 }}>({user.role === 'teacher' ? 'Profesor' : user.role === 'admin' ? 'Admin' : 'Estudiante'})</small>
            </span>
            <button
              className="button"
              onClick={() => {
                logout()
                nav('/login')
              }}
              style={{ display: 'flex', alignItems: 'center', gap: 6 }}
            >
              <LogOut size={18} /> Salir
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
