import React, { useContext, useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'
import { CartContext } from '../context/CartContext'
import { useCartUI } from '../context/CartUIContext'
import { ShoppingCart, LogOut, User, Mail, Send, Menu, X, ChevronDown } from 'lucide-react'
import API from '../services/api'

export default function Header() {
  const { user, logout } = useContext(AuthContext)
  const { items } = useContext(CartContext)
  const { toggleCart } = useCartUI()
  const nav = useNavigate()
  const [unreadCount, setUnreadCount] = useState(0)
  const [unreadMessages, setUnreadMessages] = useState(0)
  const [menuOpen, setMenuOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  
  // El repo contiene un archivo público llamado `escudo-colegio.png.PNG`.
  // Usarlo primero para evitar 404; mantener otros fallbacks útiles.
  const [logoSrc, setLogoSrc] = useState('/escudo-colegio.png.PNG')
  const [fallbackIndex, setFallbackIndex] = useState(0)
  const fallbacks = ['/escudo-colegio.png', '/escudo-colegio.svg', '/escudo.png', '/escudo.svg', 'https://via.placeholder.com/40?text=Escudo']

  // Obtener contador de anuncios sin leer
  useEffect(() => {
    if (user) {
      const fetchUnreadData = async () => {
        try {
          const announcementRes = await API.get('/api/announcements/new-count')
          setUnreadCount(announcementRes.data.unread_count)
          
          const messagesRes = await API.get('/api/messages/unread/count')
          setUnreadMessages(messagesRes.data.count || 0)
        } catch (err) {
          console.error('Error fetching unread data:', err)
        }
      }
      fetchUnreadData()
      
      // Actualizar cada 30 segundos
      const interval = setInterval(fetchUnreadData, 30000)
      return () => clearInterval(interval)
    }
  }, [user])

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      width: '100%',
      gap: 16
    }}>
      {/* LOGO */}
      <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none', flexShrink: 0 }}>
        <img
          src={logoSrc}
          alt="Escudo"
          style={{ height: 40, width: 40, objectFit: 'contain', borderRadius: 6 }}
          onError={() => {
            if (fallbackIndex < fallbacks.length) {
              setLogoSrc(fallbacks[fallbackIndex])
              setFallbackIndex(fallbackIndex + 1)
            }
          }}
        />
        <span style={{ color: '#fff', fontWeight: 700, fontSize: 20 }}>ATENEO</span>
      </Link>

      {/* MENÚ PRINCIPAL */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1 }}>
        <Link to="/anuncios">
          <button className="button" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            Anuncios
            {user && unreadCount > 0 && (
              <span style={{
                marginLeft: 4,
                backgroundColor: '#ef4444',
                color: '#fff',
                borderRadius: '50%',
                width: 24,
                height: 24,
                display: 'inline-flex',
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
            Documentos
          </button>
        </Link>

        {user && (
          <Link to="/mensajes">
            <button className="button" style={{ display: 'flex', alignItems: 'center', gap: 6, position: 'relative' }}>
              Mensajes
              {unreadMessages > 0 && (
                <span style={{
                  marginLeft: 4,
                  backgroundColor: '#ef4444',
                  color: '#fff',
                  borderRadius: '50%',
                  width: 24,
                  height: 24,
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 12,
                  fontWeight: 'bold'
                }}>
                  {unreadMessages}
                </span>
              )}
            </button>
          </Link>
        )}

        <button 
          className="button"
          onClick={toggleCart}
          style={{ display: 'flex', alignItems: 'center', gap: 6 }}
        >
          Carrito ({items.length})
        </button>

        <Link to="/contacto">
          <button className="button" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            Contacto
          </button>
        </Link>
      </div>

      {/* MENÚ DE USUARIO */}
      {user ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {user.role === 'admin' && (
            <Link to="/admin">
              <button className="button" style={{ backgroundColor: '#7c3aed', display: 'flex', alignItems: 'center', gap: 6 }}>
                Admin
              </button>
            </Link>
          )}
          
          {(user.role === 'teacher' || user.role === 'admin') ? (
            <Link to="/profesor">
              <button className="button" style={{ backgroundColor: '#ff9800', display: 'flex', alignItems: 'center', gap: 6 }}>
                Panel Profesor
              </button>
            </Link>
          ) : (
            <Link to="/mis-notas">
              <button className="button" style={{ backgroundColor: '#4caf50', display: 'flex', alignItems: 'center', gap: 6 }}>
                Mis Notas
              </button>
            </Link>
          )}

          <div style={{ position: 'relative' }}>
            <button
              className="button"
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6
              }}
            >
              <User size={18} />
              {user.name.split(' ')[0]}
              <ChevronDown size={16} style={{ transform: userMenuOpen ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s' }} />
            </button>

            {userMenuOpen && (
              <div style={{
                position: 'absolute',
                top: '100%',
                right: 0,
                backgroundColor: '#1a1a1a',
                border: '1px solid #333',
                borderRadius: 8,
                minWidth: 220,
                marginTop: 8,
                zIndex: 1000,
                boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
              }}>
                <div style={{ padding: '12px 16px', borderBottom: '1px solid #333', fontSize: 14, color: '#aaa' }}>
                  Rol: {user.role === 'teacher' ? 'Profesor' : user.role === 'admin' ? 'Admin' : 'Estudiante'}
                </div>

                <div style={{ borderTop: '1px solid #333', padding: '8px 0' }}>
                  <button
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      background: 'none',
                      border: 'none',
                      color: '#ef4444',
                      textAlign: 'left',
                      cursor: 'pointer',
                      fontSize: 14,
                      fontWeight: 500
                    }}
                    onClick={() => {
                      logout()
                      setUserMenuOpen(false)
                      nav('/login')
                    }}
                  >
                    Cerrar sesión
                  </button>
                </div>
              </div>
            )}
          </div>

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
        </div>
      ) : (
        <Link to="/login">
          <button className="button">Iniciar sesión</button>
        </Link>
      )}

      {userMenuOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 999
          }}
          onClick={() => setUserMenuOpen(false)}
        />
      )}
    </div>
  )
}
