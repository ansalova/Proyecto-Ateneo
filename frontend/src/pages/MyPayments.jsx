import { useContext, useEffect, useState } from 'react'
import { CartContext } from '../context/CartContext'
import { AuthContext } from '../context/AuthContext'
import API from '../services/api'
import logger from '../utils/logger'
import { CheckCircle, AlertCircle, Clock, CreditCard, CalendarOff, RotateCcw, ExternalLink, Receipt } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const MESES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
]

export default function MyPayments() {
  const { user } = useContext(AuthContext)
  const { add } = useContext(CartContext)
  const navigate = useNavigate()
  const [monthStatus, setMonthStatus] = useState({})
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [accountStartMonth, setAccountStartMonth] = useState('')

  useEffect(() => {
    // Cargar datos si user está disponible
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

      // Cargar estado de pagos (incluye past months)
      const statusRes = await API.get('/api/payments/my-status')
      logger.debug('Status response:', statusRes.data)
      setMonthStatus(statusRes.data.monthStatus || {})
      setAccountStartMonth(statusRes.data.accountStartMonth || '')

      // Cargar historial de órdenes
      const ordersRes = await API.get('/api/payments/orders')
      logger.debug('Orders response:', ordersRes.data)
      setOrders(ordersRes.data || [])
    } catch (err) {
      logger.error('Error loading payment data:', err)
      const errorMsg = err.response?.data?.msg || err.response?.data?.error || err.message || 'Error desconocido'
      setError(`Error: ${errorMsg}`)
    } finally {
      setLoading(false)
    }
  }

  const getStatusInfo = (status) => {
    if (status === 'past') {
      return {
        label: 'Antes de cuenta',
        icon: CalendarOff,
        color: '#6b7280',
        bg: '#f3f4f6',
        border: '#d1d5db',
        strike: true
      }
    }
    if (status === 'completed') {
      return {
        label: 'Pagado',
        icon: CheckCircle,
        color: '#16a34a',
        bg: '#dcfce7',
        border: '#86efac',
        strike: false
      }
    } else if (status === 'pending') {
      return {
        label: 'Pendiente',
        icon: Clock,
        color: '#ca8a04',
        bg: '#fef3c7',
        border: '#fcd34d',
        strike: false
      }
    } else if (status === 'failed') {
      return {
        label: 'No pagado',
        icon: AlertCircle,
        color: '#dc2626',
        bg: '#fee2e2',
        border: '#fecaca',
        strike: false
      }
    }
    return {
      label: 'Sin pagar',
      icon: Clock,
      color: '#9ca3af',
      bg: '#f3f4f6',
      border: '#e5e7eb',
      strike: false
    }
  }

  const handleQuickPay = (month) => {
    const item = {
      id: `1_${month}`, // Generamos un ID único combinando el ID del producto y el mes
      name: 'Mensualidad Colegio Ateneo',
      price: 80000,
      metadata: { month }
    }
    add(item)
    navigate('/checkout')
  }

  const handleRefresh = () => {
    logger.info('Refrescando datos de pago...')
    loadData()
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

  // Calcular resumen (solo meses relevantes: excluyendo 'past')
  const relevantMonths = Object.values(monthStatus).filter(status => status !== 'past')
  const paid = relevantMonths.filter(s => s === 'completed').length
  const pending = relevantMonths.filter(s => s === 'pending').length
  const unpaid = relevantMonths.filter(s => s === 'failed').length
  const remaining = relevantMonths.filter(s => s === 'none').length
  const totalToPay = (unpaid + remaining) * 80000

  const handlePayAll = () => {
    // Agregamos cada mes pendiente al carrito
    const monthsToPay = Object.entries(monthStatus)
      .filter(([_, status]) => status === 'none' || status === 'failed')
      .map(([month]) => month)
    
    monthsToPay.forEach(month => {
      add({ id: `1_${month}`, name: 'Mensualidad Colegio Ateneo', price: 80000, metadata: { month } })
    })
    navigate('/checkout')
  }

  return (
    <div style={{ padding: 24, maxWidth: 1000, margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <CreditCard size={32} style={{ color: '#0b63f6' }} />
        <div style={{ flex: 1 }}>
          <h1 style={{ margin: 0 }}>Mis pagos</h1>
          {accountStartMonth && (
            <small style={{ color: '#64748b' }}>
              Cuenta desde: {accountStartMonth}
            </small>
          )}
        </div>
        <button 
          onClick={handleRefresh}
          className="button button-outline"
          style={{ padding: '8px 12px', display: 'flex', alignItems: 'center', gap: 6 }}
          title="Actualizar información"
        >
          <RotateCcw size={16} /> Actualizar
        </button>
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

      {/* Resumen (solo meses relevantes) */}
      <div className="card" style={{ marginBottom: 24 }}>
        <h3 style={{ margin: '0 0 16px 0' }}>Resumen (desde {accountStartMonth || 'Enero'})</h3>
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
            <p style={{ margin: 0, opacity: 0.7, fontSize: '0.9rem' }}>No pagados</p>
            <h4 style={{ margin: '8px 0 0 0', fontSize: 24, color: '#dc2626' }}>{unpaid}</h4>
          </div>
          <div style={{ padding: 12, background: '#eff6ff', borderRadius: 8, borderLeft: '4px solid #0b63f6' }}>
            <p style={{ margin: 0, opacity: 0.7, fontSize: '0.9rem' }}>Faltantes</p>
            <h4 style={{ margin: '8px 0 0 0', fontSize: 24, color: '#0b63f6' }}>{remaining}</h4>
          </div>
          <div style={{ padding: 12, background: '#f8fafc', borderRadius: 8, borderLeft: '4px solid #1e293b', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gridColumn: 'span 2' }}>
            <div>
              <p style={{ margin: 0, opacity: 0.7, fontSize: '0.9rem' }}>Total por pagar</p>
              <h4 style={{ margin: '4px 0 0 0', fontSize: 24, color: '#1e293b' }}>${totalToPay.toLocaleString('es-CO')}</h4>
            </div>
            {totalToPay > 0 && (
              <button 
                onClick={handlePayAll}
                className="button"
                style={{ background: '#1e293b', color: '#fff', padding: '10px 20px' }}
              >
                Pagar todo
              </button>
            )}
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
            const canPay = status === 'none' || status === 'failed'

            return (
              <div
                key={month}
                style={{
                  padding: 12,
                  background: info.bg,
                  border: `2px solid ${info.border}`,
                  borderRadius: 8,
                  textAlign: 'center',
                  transition: 'all 0.2s',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  minHeight: '120px'
                }}
              >
                <div>
                  <div style={{ marginBottom: 8, display: 'flex', justifyContent: 'center' }}>
                    <Icon size={24} style={{ color: info.color }} />
                  </div>
                  <div style={{ 
                    fontWeight: 600, 
                    color: '#1e293b', 
                    marginBottom: 4,
                    textDecoration: info.strike ? 'line-through' : 'none',
                    opacity: info.strike ? 0.6 : 1
                  }}>
                    {month}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: info.color, fontWeight: 600 }}>
                    {info.label}
                  </div>
                </div>

                {canPay && (
                  <button 
                    onClick={() => handleQuickPay(month)}
                    style={{ 
                      marginTop: 12, 
                      padding: '6px', 
                      fontSize: '0.75rem', 
                      background: '#0b63f6', 
                      color: '#fff', 
                      border: 'none', 
                      borderRadius: 6, 
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 4,
                      fontWeight: 600
                    }}
                  >
                    Pagar <ExternalLink size={12} />
                  </button>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Historial de pagos */}
      {orders.length > 0 && (
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <Receipt size={20} style={{ color: '#0b63f6' }} />
            <h3 style={{ margin: 0 }}>Historial de pagos</h3>
          </div>
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
