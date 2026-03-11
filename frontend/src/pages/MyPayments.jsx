import { useContext, useEffect, useState } from 'react'
import { AuthContext } from '../context/AuthContext'
import API from '../services/api'
import { CheckCircle, AlertCircle, Clock, CreditCard } from 'lucide-react'

const MESES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
]

export default function MyPayments() {
  const { user } = useContext(AuthContext)
  const [monthStatus, setMonthStatus] = useState({})
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    // Cargar datos si user está disponible, o si hay token en localStorage
    const token = localStorage.getItem('token')
    if ((user && user.id) || token) {
      loadData()
    } else {
      setLoading(false)
    }
  }, [user])

  const loadData = async () => {
    try {
      setLoading(true)
      setError('')

      console.log('Cargando datos de pagos...')

      // Cargar estado de pagos
      const statusRes = await API.get('/api/payments/my-status')
      console.log('Status response:', statusRes.data)
      setMonthStatus(statusRes.data)

      // Cargar historial de órdenes
      const ordersRes = await API.get('/api/payments/orders')
      console.log('Orders response:', ordersRes.data)
      setOrders(ordersRes.data || [])
    } catch (err) {
      console.error('Error loading payment data:', err)
      const errorMsg = err.response?.data?.msg || err.response?.data?.error || err.message || 'Error desconocido'
      setError(`Error: ${errorMsg}`)
    } finally {
      setLoading(false)
    }
  }

  const getStatusInfo = (status) => {
    if (status === 'completed') {
      return {
        label: 'Pagado',
        icon: CheckCircle,
        color: '#16a34a',
        bg: '#dcfce7',
        border: '#86efac'
      }
    } else if (status === 'pending') {
      return {
        label: 'Pendiente',
        icon: Clock,
        color: '#ca8a04',
        bg: '#fef3c7',
        border: '#fcd34d'
      }
    } else if (status === 'failed') {
      return {
        label: 'No Pagado',
        icon: AlertCircle,
        color: '#dc2626',
        bg: '#fee2e2',
        border: '#fecaca'
      }
    }
    return {
      label: 'Sin pagar',
      icon: Clock,
      color: '#9ca3af',
      bg: '#f3f4f6',
      border: '#e5e7eb'
    }
  }

  if (!user) {
    return (
      <div className="card" style={{ maxWidth: 600, margin: '0 auto', padding: 24, textAlign: 'center' }}>
        <h2>Debes iniciar sesión</h2>
        <p>Por favor inicia sesión para ver tus pagos.</p>
      </div>
    )
  }

  if (loading) {
    return <div className="card"><p>Cargando tus pagos...</p></div>
  }

  // Calcular resumen
  const paid = Object.values(monthStatus).filter(s => s === 'completed').length
  const pending = Object.values(monthStatus).filter(s => s === 'pending').length
  const unpaid = Object.values(monthStatus).filter(s => s === 'failed').length
  const remaining = MESES.length - paid

  return (
    <div style={{ padding: 24, maxWidth: 1000, margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <CreditCard size={32} style={{ color: '#0b63f6' }} />
        <h1 style={{ margin: 0 }}>Mis Pagos</h1>
      </div>

      {error && (
        <div
          className="card"
          style={{
            background: '#fff5f5',
            border: '1px solid #fecaca',
            color: '#b91c1c',
            marginBottom: 24,
            padding: 12
          }}
        >
          {error}
        </div>
      )}

      {/* Resumen */}
      <div className="card" style={{ marginBottom: 24 }}>
        <h3 style={{ margin: '0 0 16px 0' }}>Resumen</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 16 }}>
          <div style={{ padding: 12, background: '#dcfce7', borderRadius: 8, borderLeft: '4px solid #16a34a' }}>
            <p style={{ margin: 0, opacity: 0.7, fontSize: '0.9rem' }}>Pagados</p>
            <h4 style={{ margin: '8px 0 0 0', fontSize: 24, color: '#16a34a' }}>{paid}</h4>
          </div>
          <div style={{ padding: 12, background: '#fef3c7', borderRadius: 8, borderLeft: '4px solid #ca8a04' }}>
            <p style={{ margin: 0, opacity: 0.7, fontSize: '0.9rem' }}>Pendientes</p>
            <h4 style={{ margin: '8px 0 0 0', fontSize: 24, color: '#ca8a04' }}>{pending}</h4>
          </div>
          <div style={{ padding: 12, background: '#fee2e2', borderRadius: 8, borderLeft: '4px solid #dc2626' }}>
            <p style={{ margin: 0, opacity: 0.7, fontSize: '0.9rem' }}>No Pagados</p>
            <h4 style={{ margin: '8px 0 0 0', fontSize: 24, color: '#dc2626' }}>{unpaid}</h4>
          </div>
          <div style={{ padding: 12, background: '#eff6ff', borderRadius: 8, borderLeft: '4px solid #0b63f6' }}>
            <p style={{ margin: 0, opacity: 0.7, fontSize: '0.9rem' }}>Faltantes</p>
            <h4 style={{ margin: '8px 0 0 0', fontSize: 24, color: '#0b63f6' }}>{remaining}</h4>
          </div>
        </div>
      </div>

      {/* Estado por mes */}
      <div className="card" style={{ marginBottom: 24 }}>
        <h3 style={{ margin: '0 0 16px 0' }}>Estado por Mes</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 12 }}>
          {MESES.map(month => {
            const status = monthStatus[month]
            const info = getStatusInfo(status)
            const Icon = info.icon

            return (
              <div
                key={month}
                style={{
                  padding: 12,
                  background: info.bg,
                  border: `2px solid ${info.border}`,
                  borderRadius: 8,
                  textAlign: 'center',
                  transition: 'all 0.2s'
                }}
              >
                <div style={{ marginBottom: 8, display: 'flex', justifyContent: 'center' }}>
                  <Icon size={24} style={{ color: info.color }} />
                </div>
                <div style={{ fontWeight: 600, color: '#1e293b', marginBottom: 4 }}>
                  {month}
                </div>
                <div style={{ fontSize: '0.75rem', color: info.color, fontWeight: 600 }}>
                  {info.label}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Historial de pagos */}
      {orders.length > 0 && (
        <div className="card">
          <h3 style={{ margin: '0 0 16px 0' }}>Historial de Pagos</h3>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
              <thead style={{ background: '#f3f4f6' }}>
                <tr>
                  <th style={{ padding: 12, textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>Referencia</th>
                  <th style={{ padding: 12, textAlign: 'right', borderBottom: '1px solid #e5e7eb' }}>Monto</th>
                  <th style={{ padding: 12, textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>Método</th>
                  <th style={{ padding: 12, textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>Estado</th>
                  <th style={{ padding: 12, textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>Fecha</th>
                  <th style={{ padding: 12, textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>Meses</th>
                </tr>
              </thead>
              <tbody>
                {orders.map(order => {
                  const statusInfo = getStatusInfo(order.status)
                  const meta = typeof order.metadata === 'string' ? JSON.parse(order.metadata) : order.metadata
                  const months = meta.items && Array.isArray(meta.items)
                    ? meta.items.map(item => item.metadata?.month).filter(Boolean).join(', ')
                    : 'N/A'

                  return (
                    <tr key={order.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                      <td style={{ padding: 12 }}>
                        <code style={{ fontSize: 11, background: '#f3f4f6', padding: '2px 6px', borderRadius: 3 }}>
                          {order.external_reference}
                        </code>
                      </td>
                      <td style={{ padding: 12, textAlign: 'right' }}>
                        <strong>${parseFloat(order.amount).toFixed(2)}</strong>
                      </td>
                      <td style={{ padding: 12 }}>
                        <span style={{ padding: '4px 8px', background: '#eff6ff', borderRadius: 3, fontSize: 12 }}>
                          {order.method}
                        </span>
                      </td>
                      <td style={{ padding: 12 }}>
                        <span
                          style={{
                            padding: '4px 12px',
                            borderRadius: 4,
                            fontSize: 12,
                            fontWeight: 600,
                            background: statusInfo.bg,
                            color: statusInfo.color
                          }}
                        >
                          {statusInfo.label}
                        </span>
                      </td>
                      <td style={{ padding: 12 }}>
                        <small>{new Date(order.created_at).toLocaleDateString('es-CO')}</small>
                      </td>
                      <td style={{ padding: 12 }}>
                        <small>{months}</small>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {orders.length === 0 && (
        <div className="card" style={{ textAlign: 'center', padding: 24, color: '#64748b' }}>
          <p>No tienes pagos registrados</p>
        </div>
      )}
    </div>
  )
}
