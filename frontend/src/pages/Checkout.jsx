import { useContext, useState, useEffect } from 'react'
import { CartContext } from '../context/CartContext'
import { useNavigate } from 'react-router-dom'

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
      console.error('Error reading user:', e)
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
        total: total()
      }

      nav('/pago', { state: { amount: total(), metadata } })
    } catch (err) {
      setErrorMsg('Error al preparar el pago. Intenta de nuevo.')
      console.error('Checkout error:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="card" style={{ maxWidth: 720, margin: '0 auto' }}>
      <h2>Confirmar pago de mensualidad</h2>

      {items.length === 0 ? (
        <p>No hay mensualidades en el carrito</p>
      ) : (
        <>
          {errorMsg && (
            <div className="card" style={{ background: '#fff5f5', border: '1px solid #fecaca', color: '#b91c1c', marginBottom: 12 }}>
              {errorMsg}
            </div>
          )}
          <div style={{ marginBottom: 12 }}>
            {items.map(i => (
              <div key={i.id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span>{i.name} — {i.metadata?.month || ''} × {i.qty}</span>
                <span>${(i.price * i.qty).toLocaleString('es-CO')}</span>
              </div>
            ))}
          </div>

          <hr />

          <p style={{ fontWeight: 700, fontSize: '1.2rem' }}>Total a pagar: ${total().toLocaleString('es-CO')}</p>

          <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
            <button className="button" onClick={goToPaymentMethods} disabled={loading} style={{ width: '100%', padding: '12px' }}>
              {loading ? 'Preparando...' : 'Ir a pagar'}
            </button>
          </div>
        </>
      )}
    </div>
  )
}

