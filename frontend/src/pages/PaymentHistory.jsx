import { useContext, useEffect, useState } from 'react'
import { AuthContext } from '../context/AuthContext'
import API from '../services/api'

export default function PaymentHistory() {
  const { user } = useContext(AuthContext)
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true)
        const { data } = await API.get('payments/orders')
        setOrders(data)
        setError('')
      } catch (err) {
        console.error('Error cargando órdenes:', err)
        setError('No se pudieron cargar tus órdenes. Intenta más tarde.')
      } finally {
        setLoading(false)
      }
    }
    if (user) fetchOrders()
  }, [user])

  if (!user) return null // debería estar protegido por ruta

  if (loading) return <div className="card"><p>Cargando órdenes...</p></div>

  return (
    <div style={{ padding: 24, maxWidth: 900, margin: '0 auto' }}>
      <h1>Mis pagos</h1>
      {error && (
        <div className="card" style={{ background: '#fff5f5', border: '1px solid #fecaca', color: '#b91c1c', marginBottom: 12 }}>
          {error}
        </div>
      )}

      {orders.length === 0 ? (
        <div className="card"><p>No tienes órdenes registradas.</p></div>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
          <thead style={{ background: '#f3f4f6' }}>
            <tr>
              <th style={{ padding: 12, textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>Referencia</th>
              <th style={{ padding: 12, textAlign: 'right', borderBottom: '1px solid #e5e7eb' }}>Monto</th>
              <th style={{ padding: 12, textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>Método</th>
              <th style={{ padding: 12, textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>Estado</th>
              <th style={{ padding: 12, textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>Fecha</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(o => (
              <tr key={o.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                <td style={{ padding: 12 }}><code style={{ fontSize:11, background:'#f3f4f6', padding:'2px 6px', borderRadius:3 }}>{o.external_reference}</code></td>
                <td style={{ padding: 12, textAlign: 'right' }}>${parseFloat(o.amount).toFixed(2)}</td>
                <td style={{ padding: 12 }}>{o.method}</td>
                <td style={{ padding: 12 }}>{o.status}</td>
                <td style={{ padding: 12 }}>{new Date(o.created_at).toLocaleDateString('es-CO')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
