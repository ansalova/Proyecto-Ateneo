import React, { useContext } from 'react'
import { CartContext } from '../context/CartContext'
import { useCartUI } from '../context/CartUIContext'
import { useNavigate } from 'react-router-dom'
import { X } from 'lucide-react'

export default function CartDrawer() {
  const { items, remove, total, clear, updateQty } = useContext(CartContext)
  const { isOpen, closeCart } = useCartUI()
  const navigate = useNavigate()

  if (!isOpen) return null

  const goToCart = () => {
    closeCart()
    navigate('/carrito')
  }

  return (
    <div
      style={{
        position: 'fixed',
        right: 20,
        top: 80,
        width: 320,
        maxHeight: '70vh',
        overflow: 'auto',
        zIndex: 50
      }}
    >
      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h4>Carrito</h4>
          <button onClick={closeCart} style={{ background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
            <X size={20} />
          </button>
        </div>

        {items.length === 0 && <p>Sin productos</p>}

        {items.map(i => (
          <div
            key={i.id}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 8
            }}
          >
            <div>
              <strong>{i.name}</strong>
              <br />
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <button
                  onClick={() => updateQty(i.id, i.qty - 1)}
                  disabled={i.qty <= 1}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    cursor: i.qty <= 1 ? 'not-allowed' : 'pointer',
                    fontSize: 16,
                    lineHeight: 1
                  }}
                >
                  −
                </button>
                <small>Cantidad: {i.qty}</small>
                <button
                  onClick={() => updateQty(i.id, i.qty + 1)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: 16,
                    lineHeight: 1
                  }}
                >
                  +
                </button>
              </div>
            </div>

            <button
              onClick={() => remove(i.id)}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#ef4444',
                cursor: 'pointer'
              }}
            >
              Quitar
            </button>
          </div>
        ))}

        <hr />

        <p>Total: ${total().toLocaleString('es-CO')}</p>

        <div style={{ display: 'flex', gap: '10px', flexDirection: 'column' }}>
          <button className="button" onClick={goToCart}>
            Ver Carrito Completo
          </button>
          
          <button className="button button--secondary" onClick={clear}>
            Vaciar
          </button>
        </div>
      </div>
    </div>
  )
}
