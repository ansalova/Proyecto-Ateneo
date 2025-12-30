import { useEffect, useState } from 'react'
import { listMyOrders, getOrderDetails } from '../services/orders'
import { retryOrder } from '../services/orders'

export default function Orders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [expanded, setExpanded] = useState({})
  const [details, setDetails] = useState({})

  useEffect(() => {
    ;(async () => {
      try {
        const data = await listMyOrders()
        setOrders(data)
      } catch (e) {
        setError('No fue posible cargar tus órdenes')
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  if (loading) return <div className="card">Cargando órdenes...</div>
  if (error) return <div className="card">{error}</div>

  return (
    <div className="container" style={{ marginTop: '1rem' }}>
      <h1>Mis Órdenes</h1>
      {orders.length === 0 ? (
        <div className="card">No tienes órdenes registradas</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {orders.map(o => (
            <div key={o.id} className="card" style={{ padding: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontWeight: 700 }}>Referencia: {o.external_reference}</div>
                  <div>Método: {o.method}</div>
                  <div>Estado: {o.status}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 700 }}>${Number(o.amount).toLocaleString('es-CO')}</div>
                  <small>{new Date(o.created_at).toLocaleString()}</small>
                </div>
              </div>
              <div style={{ marginTop: 10 }}>
                <button
                  className="button"
                  onClick={async () => {
                    const ref = o.external_reference
                    const isOpen = expanded[ref]
                    if (isOpen) {
                      setExpanded(prev => ({ ...prev, [ref]: false }))
                      return
                    }
                    try {
                      const d = await getOrderDetails(ref)
                      setDetails(prev => ({ ...prev, [ref]: d }))
                      setExpanded(prev => ({ ...prev, [ref]: true }))
                    } catch {
                      setExpanded(prev => ({ ...prev, [ref]: false }))
                    }
                  }}
                >
                  {expanded[o.external_reference] ? 'Ocultar detalle' : 'Ver detalle'}
                </button>
                {(o.method === 'tarjeta' || o.method === 'pse') && o.status !== 'approved' && (
                  <button
                    className="button"
                    style={{ marginLeft: 8, backgroundColor: '#0b63f6' }}
                    onClick={async () => {
                      try {
                        const res = await retryOrder(o.external_reference)
                        if (res?.redirectUrl) {
                          window.location.href = res.redirectUrl
                        } else {
                          alert('No fue posible reintentar el pago')
                        }
                      } catch (e) {
                        alert('Error al reintentar el pago')
                      }
                    }}
                  >
                    Reintentar pago
                  </button>
                )}
              </div>
              {expanded[o.external_reference] && details[o.external_reference] && (
                <div style={{ marginTop: 12 }}>
                  <div style={{ fontWeight: 700, marginBottom: 6 }}>Ítems</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {details[o.external_reference].items.map(it => (
                      <div key={it.id} style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>{it.title} × {it.qty}</span>
                        <span>${Number(it.unit_price).toLocaleString('es-CO')}</span>
                      </div>
                    ))}
                  </div>
                  <div style={{ fontWeight: 700, margin: '12px 0 6px' }}>Pagos</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {details[o.external_reference].payments.length === 0 ? (
                      <small>No hay pagos registrados</small>
                    ) : (
                      details[o.external_reference].payments.map(p => (
                        <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span>{p.provider}{p.preference_id ? ` (${p.preference_id})` : ''}</span>
                          <span>{p.status}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
