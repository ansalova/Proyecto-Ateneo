import { useContext, useState, useEffect } from 'react'
import { CartContext } from '../context/CartContext'
import { useNavigate } from 'react-router-dom'
import { ShoppingBag, User, CreditCard, ChevronRight, AlertCircle, ShieldCheck, ArrowLeft } from 'lucide-react'
import logger from '../utils/logger'

export default function Checkout() {
  const { items, total } = useContext(CartContext)
  const nav = useNavigate()

  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  // Obtener datos del usuario autenticado
  useEffect(() => {
    try {
      const userStr = localStorage.getItem('user')
      if (userStr) {
        setUser(JSON.parse(userStr))
      }
    } catch (e) {
      logger.error('Error reading user:', e)
    }
  }, [])

  const goToPaymentMethods = async () => {
    if (!items.length) {
      setErrorMsg('El carrito está vacío')
      return
    }

    setLoading(true)
    setErrorMsg('')

    try {
      const metadata = {
        studentName: user?.name || 'Estudiante',
        studentId: user?.document_number || 'N/A',
        grade: 'N/A',
        user_email: user?.email || '',
        phone: null,
        items: items.map(i => ({ id: i.id, name: i.name, qty: i.qty, price: i.price, metadata: i.metadata || {} })),
        total: total(),
        checkoutId: crypto.randomUUID() // ID único para evitar duplicados en el backend
      }

      nav('/pago', { state: { amount: total(), metadata } })
    } catch (err) {
      setErrorMsg('Error al preparar el pago. Intenta de nuevo.')
      logger.error('Checkout error:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ maxWidth: 900, margin: '40px auto', padding: '0 20px' }}>
      {/* Indicador de Progreso */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '40px', gap: '15px' }}>
        <div onClick={() => nav('/carrito')} style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#1f7a4a', fontWeight: 'bold', cursor: 'pointer' }} title="Regresar al carrito">
          <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: '#1f7a4a', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px' }}>1</div>
          Carrito
        </div>
        <div style={{ width: '40px', height: '2px', background: '#1f7a4a' }}></div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#1f7a4a', fontWeight: 'bold' }}>
          <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: '#1f7a4a', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px' }}>2</div>
          Confirmación
        </div>
        <div style={{ width: '40px', height: '2px', background: '#e2e8f0' }}></div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#94a3b8' }}>
          <div style={{ width: '30px', height: '30px', borderRadius: '50%', border: '2px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px' }}>3</div>
          Pago
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '30px' }}>
        <div>
          <button 
            onClick={() => nav('/carrito')}
            style={{ 
              background: 'none', 
              border: 'none', 
              color: '#1f7a4a', 
              cursor: 'pointer', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px',
              marginBottom: '20px',
              fontSize: '15px',
              fontWeight: '600',
              padding: 0
            }}
          >
            <ArrowLeft size={18} /> Volver al carrito para editar o eliminar productos
          </button>

          <h1 style={{ fontSize: '24px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <ShoppingBag style={{ color: '#1f7a4a' }} /> Resumen del Pedido
          </h1>

          {errorMsg && (
            <div style={{ background: '#fff5f5', border: '1px solid #fecaca', color: '#b91c1c', padding: '15px', borderRadius: '8px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <AlertCircle size={20} /> {errorMsg}
            </div>
          )}

          {/* Tarjeta del Estudiante */}
          <div style={{ 
            marginBottom: '24px', 
            background: 'linear-gradient(to right, #ffffff, #f8fafc)', 
            border: '1px solid #e2e8f0', 
            borderRadius: '16px', 
            padding: '24px',
            boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' 
          }}>
            <h3 style={{ fontSize: '18px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px', color: '#1e293b' }}>
              <User size={20} style={{ color: '#1f7a4a' }} /> Perfil del Estudiante
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div style={{ background: '#fff', padding: '12px', borderRadius: '8px', border: '1px solid #f1f5f9' }}>
                <span style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: '700' }}>Nombre</span>
                <p style={{ margin: '4px 0 0 0', fontWeight: '600', color: '#334155' }}>{user?.name || 'Cargando...'}</p>
              </div>
              <div style={{ background: '#fff', padding: '12px', borderRadius: '8px', border: '1px solid #f1f5f9' }}>
                <span style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: '700' }}>Documento</span>
                <p style={{ margin: '4px 0 0 0', fontWeight: '600', color: '#334155' }}>{user?.document_number || 'N/A'}</p>
              </div>
            </div>
          </div>

          {/* Lista de Items */}
          <div className="card" style={{ padding: '0' }}>
            {items.map((i, index) => (
              <div key={i.id} style={{ 
                padding: '20px', 
                borderBottom: index === items.length - 1 ? 'none' : '1px solid #f1f5f9',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div>
                  <h4 style={{ margin: '0 0 5px 0', fontSize: '16px' }}>{i.name}</h4>
                  <span style={{ fontSize: '13px', color: '#1f7a4a', fontWeight: 'bold', background: '#e8fff3', padding: '4px 10px', borderRadius: '20px' }}>
                    Mes: {i.metadata?.month || 'N/A'}
                  </span>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ margin: 0, fontWeight: 'bold', fontSize: '16px' }}>${(i.price * i.qty).toLocaleString('es-CO')}</p>
                  <small style={{ color: '#94a3b8' }}>Cantidad: {i.qty}</small>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Panel Lateral de Pago */}
        <div style={{ position: 'sticky', top: '100px', height: 'fit-content' }}>
          <div className="card" style={{ border: '2px solid #1f7a4a' }}>
            <h3 style={{ marginTop: 0, marginBottom: '20px', fontSize: '18px' }}>Total a Pagar</h3>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', color: '#64748b' }}>
              <span>Subtotal</span>
              <span>${total().toLocaleString('es-CO')}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', color: '#64748b' }}>
              <span>Impuestos / Tasas</span>
              <span>$0.00</span>
            </div>
            
            <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '15px', marginBottom: '25px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 'bold', fontSize: '18px' }}>Total</span>
                <span style={{ fontWeight: 'bold', fontSize: '24px', color: '#1f7a4a' }}>${total().toLocaleString('es-CO')}</span>
              </div>
            </div>

            <button 
              className="button" 
              onClick={goToPaymentMethods} 
              disabled={loading || items.length === 0} 
              style={{ width: '100%', padding: '15px', fontSize: '16px', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}
            >
              {loading ? 'Procesando...' : <>Continuar al Pago <ChevronRight size={18} /></>}
            </button>

            <div style={{ marginTop: '20px', display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b', fontSize: '12px', justifyContent: 'center' }}>
              <ShieldCheck size={16} /> Pago seguro y encriptado
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
