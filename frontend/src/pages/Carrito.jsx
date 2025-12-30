import React, { useContext } from 'react'
import { CartContext } from '../context/CartContext'
import { useNavigate } from 'react-router-dom'

export default function Carrito() {
  const { items, remove, updateQty, clear, total } = useContext(CartContext)
  const navigate = useNavigate()

  if (items.length === 0) {
    return (
      <div className="container" style={{ textAlign: 'center', marginTop: '4rem' }}>
        <div className="card" style={{ maxWidth: 500, margin: '0 auto', padding: '3rem' }}>
          <h2>Tu carrito está vacío</h2>
          <p style={{ color: '#64748b', marginBottom: '2rem' }}>
            Parece que aún no has agregado servicios a tu carrito.
          </p>
          <button className="button" onClick={() => navigate('/')}>
            Ver servicios
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="container" style={{ marginTop: '2rem' }}>
      <h1 style={{ marginBottom: '1.5rem' }}>Carrito de Compras</h1>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '2rem' }}>
        {/* Lista de Items */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {items.map(item => (
            <div key={item.id} className="card" style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', padding: '1rem' }}>
              <img 
                src={item.image} 
                alt={item.name} 
                style={{ width: 100, height: 100, objectFit: 'cover', borderRadius: 8 }} 
              />
              
              <div style={{ flex: 1 }}>
                <h3 style={{ margin: '0 0 0.5rem 0' }}>{item.name}</h3>
                <p style={{ margin: 0, color: '#64748b' }}>
                  {item.metadata?.month && `Mes: ${item.metadata.month}`}
                </p>
                <div style={{ marginTop: '0.5rem', fontWeight: 'bold', color: 'var(--primary)' }}>
                  ${item.price.toLocaleString('es-CO')}
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #e2e8f0', borderRadius: 8 }}>
                  <button 
                    onClick={() => updateQty(item.id, item.qty - 1)}
                    style={{ background: 'none', border: 'none', padding: '0.5rem 1rem', cursor: 'pointer', fontSize: '1.2rem' }}
                    disabled={item.qty <= 1}
                  >
                    -
                  </button>
                  <span style={{ padding: '0 0.5rem', fontWeight: 600 }}>{item.qty}</span>
                  <button 
                    onClick={() => updateQty(item.id, item.qty + 1)}
                    style={{ background: 'none', border: 'none', padding: '0.5rem 1rem', cursor: 'pointer', fontSize: '1.2rem' }}
                  >
                    +
                  </button>
                </div>

                <button 
                  onClick={() => remove(item.id)}
                  className="button button--danger"
                  style={{ padding: '0.5rem', borderRadius: 8 }}
                  title="Eliminar"
                >
                  Eliminar
                </button>
              </div>
            </div>
          ))}

          <button 
            onClick={clear}
            style={{ alignSelf: 'flex-start', background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', textDecoration: 'underline' }}
          >
            Vaciar carrito
          </button>
        </div>

        {/* Resumen */}
        <div>
          <div className="card" style={{ position: 'sticky', top: 100 }}>
            <h3 style={{ marginTop: 0 }}>Resumen del pedido</h3>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', color: '#64748b' }}>
              <span>Subtotal</span>
              <span>${total().toLocaleString('es-CO')}</span>
            </div>
            
            <div style={{ borderTop: '1px solid #e2e8f0', margin: '1rem 0' }}></div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', fontSize: '1.2rem', fontWeight: 'bold' }}>
              <span>Total</span>
              <span>${total().toLocaleString('es-CO')}</span>
            </div>

            <button 
              className="button" 
              style={{ width: '100%', fontSize: '1.1rem' }}
              onClick={() => navigate('/checkout')}
            >
              Proceder al pago
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
