import React, { useContext } from 'react'
import { CartContext } from '../context/CartContext'
import { useCartUI } from '../context/CartUIContext'

export default function CartDrawer() {
  const { items, remove, total, clear } = useContext(CartContext)
  const { isOpen, closeCart } = useCartUI()

  if (!isOpen) return null

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
          <button onClick={closeCart} style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: 18 }}>✕</button>
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
              <small>qty: {i.qty}</small>
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

        <button className="button" onClick={clear}>
          Vaciar
        </button>
      </div>
    </div>
  )
}
