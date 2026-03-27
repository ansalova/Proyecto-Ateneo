import React, { useContext } from 'react'
import { CartContext } from '../context/CartContext'
import { useNavigate } from 'react-router-dom'
import { ShoppingCart, Trash2, Plus, Minus, ChevronRight, ArrowLeft, ShieldCheck, ShoppingBag } from 'lucide-react'

export default function Carrito() {
  const { items, remove, updateQty, clear, total } = useContext(CartContext)
  const navigate = useNavigate()

  if (items.length === 0) {
    return (
      <div style={{ maxWidth: 600, margin: '80px auto', textAlign: 'center', padding: '0 20px' }}>
        <div style={{ background: '#fff', padding: '60px 40px', borderRadius: '24px', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05)' }}>
          <div style={{ width: '100px', height: '100px', background: '#f8fafc', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
            <ShoppingCart size={48} color="#cbd5e1" />
          </div>
          <h2 style={{ fontSize: '24px', color: '#1e293b', marginBottom: '12px' }}>Tu carrito está vacío</h2>
          <p style={{ color: '#64748b', fontSize: '16px', lineHeight: '1.6', marginBottom: '32px' }}>
            Parece que aún no has seleccionado ninguna mensualidad para pagar.
          </p>
          <button 
            className="button" 
            style={{ padding: '14px 32px', fontSize: '16px', borderRadius: '12px' }}
            onClick={() => navigate('/')}
          >
            Explorar Servicios
          </button>
        </div>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: 1000, margin: '40px auto', padding: '0 20px' }}>
      {/* Indicador de Progreso */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '40px', gap: '15px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#1f7a4a', fontWeight: 'bold' }}>
          <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: '#1f7a4a', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px' }}>1</div>
          Carrito
        </div>
        <div style={{ width: '40px', height: '2px', background: '#e2e8f0' }}></div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#94a3b8' }}>
          <div style={{ width: '30px', height: '30px', borderRadius: '50%', border: '2px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px' }}>2</div>
          Confirmación
        </div>
        <div style={{ width: '40px', height: '2px', background: '#e2e8f0' }}></div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#94a3b8' }}>
          <div style={{ width: '30px', height: '30px', borderRadius: '50%', border: '2px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px' }}>3</div>
          Pago
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px' }}>
        <ShoppingBag size={32} style={{ color: '#1f7a4a' }} />
        <h1 style={{ margin: 0, fontSize: '28px', color: '#1e293b' }}>Tu Carrito</h1>
        <span style={{ background: '#f1f5f9', color: '#475569', padding: '4px 12px', borderRadius: '20px', fontSize: '14px', fontWeight: 'bold', marginLeft: '12px' }}>
          {items.length} {items.length === 1 ? 'item' : 'items'}
        </span>
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '32px' }}>
        {/* Lista de Items */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {items.map(item => (
            <div key={item.id} className="card" style={{ display: 'flex', gap: '24px', alignItems: 'center', padding: '24px', border: '1px solid #e2e8f0', borderRadius: '20px', background: '#fff' }}>
              <div style={{ flex: 1 }}>
                <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', color: '#1e293b' }}>{item.name}</h3>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '16px' }}>
                  <span style={{ fontSize: '13px', color: '#1f7a4a', fontWeight: 'bold', background: '#e8fff3', padding: '4px 12px', borderRadius: '20px' }}>
                    Mes: {item.metadata?.month || 'N/A'}
                  </span>
                </div>
                <div style={{ fontWeight: 'bold', fontSize: '20px', color: '#1e293b' }}>
                  ${item.price.toLocaleString('es-CO')}
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '4px' }}>
                  <button 
                    onClick={() => updateQty(item.id, item.qty - 1)}
                    style={{ background: 'white', border: '1px solid #e2e8f0', padding: '8px', borderRadius: '8px', cursor: item.qty <= 1 ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', color: '#64748b', opacity: item.qty <= 1 ? 0.5 : 1 }}
                    disabled={item.qty <= 1}
                  >
                    <Minus size={16} />
                  </button>
                  <span style={{ padding: '0 16px', fontWeight: 'bold', fontSize: '16px', color: '#1e293b' }}>{item.qty}</span>
                  <button 
                    onClick={() => updateQty(item.id, item.qty + 1)}
                    style={{ background: 'white', border: '1px solid #e2e8f0', padding: '8px', borderRadius: '8px', cursor: 'not-allowed', display: 'flex', alignItems: 'center', color: '#64748b', opacity: 0.5 }}
                    disabled={true}
                    title="No puedes aumentar la cantidad de mensualidades"
                  >
                    <Plus size={16} />
                  </button>
                </div>
                <button 
                  onClick={() => remove(item.id)}
                  style={{ background: '#fff1f2', border: '1px solid #fecaca', color: '#e11d48', padding: '12px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                  title="Eliminar del carrito"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            </div>
          ))}

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px' }}>
            <button onClick={() => navigate('/')} style={{ background: 'none', border: 'none', color: '#1f7a4a', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '600', fontSize: '15px' }}>
              <ArrowLeft size={18} /> Seguir explorando
            </button>
            <button onClick={clear} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', textDecoration: 'underline', fontSize: '14px' }}>
              Vaciar carrito
            </button>
          </div>
        </div>

        {/* Resumen */}
        <div style={{ position: 'sticky', top: '40px', height: 'fit-content' }}>
          <div className="card" style={{ padding: '32px', borderRadius: '24px', border: '2px solid #1f7a4a', background: '#fff', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.05)' }}>
            <h3 style={{ marginTop: 0, marginBottom: '24px', fontSize: '20px', color: '#1e293b' }}>Resumen de Compra</h3>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', color: '#64748b', fontSize: '15px' }}>
              <span>Subtotal</span>
              <span style={{ color: '#1e293b', fontWeight: '600' }}>${total().toLocaleString('es-CO')}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', color: '#64748b', fontSize: '15px' }}>
              <span>Impuestos</span>
              <span style={{ color: '#1e293b', fontWeight: '600' }}>$0</span>
            </div>
            <div style={{ borderTop: '1px solid #f1f5f9', margin: '24px 0' }}></div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '32px' }}>
              <span style={{ fontSize: '18px', fontWeight: 'bold', color: '#1e293b' }}>Total</span>
              <span style={{ fontSize: '24px', fontWeight: 'bold', color: '#1f7a4a' }}>${total().toLocaleString('es-CO')}</span>
            </div>
            <button className="button" style={{ width: '100%', fontSize: '16px', padding: '16px', borderRadius: '16px', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }} onClick={() => navigate('/checkout')}>
              Proceder al Pago <ChevronRight size={20} />
            </button>
            <div style={{ marginTop: '24px', display: 'flex', alignItems: 'center', gap: '8px', color: '#94a3b8', fontSize: '13px', justifyContent: 'center' }}>
              <ShieldCheck size={16} /> Pago 100% Seguro
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
