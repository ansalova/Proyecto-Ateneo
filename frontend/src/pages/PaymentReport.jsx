import { useContext, useEffect, useState } from 'react'
import { AuthContext } from '../context/AuthContext'
import API from '../services/api'
import { updateOrderStatus } from '../services/payments'
import logger from '../utils/logger'
import { Download, Filter, Calendar, Check, X, Mail, IdCard, BookOpen, Users, TrendingUp, DollarSign, CreditCard, Landmark, Search } from 'lucide-react'

export default function PaymentReport() {
  const { user } = useContext(AuthContext)
  const [report, setReport] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')
  const [updatingOrder, setUpdatingOrder] = useState(null)
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    status: ''
  })

  useEffect(() => {
    fetchReport()
  }, [])

  const fetchReport = async (filterParams = {}) => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      
      if (filterParams.startDate || filters.startDate) {
        params.append('startDate', filterParams.startDate || filters.startDate)
      }
      if (filterParams.endDate || filters.endDate) {
        params.append('endDate', filterParams.endDate || filters.endDate)
      }
      if (filterParams.status || filters.status) {
        params.append('status', filterParams.status || filters.status)
      }

      const { data } = await API.get(`/api/admin/payments/report?${params.toString()}`)
      setReport(data)
      setError('')
    } catch (err) {
      const errorMsg = err.response?.data?.error || err.response?.data?.message || err.message || 'Error desconocido';
      setError(`Error al cargar el reporte de pagos: ${errorMsg}`)
      console.error('PaymentReport error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleFilterChange = (e) => {
    const { name, value } = e.target
    setFilters(prev => ({ ...prev, [name]: value }))
  }

  const handleApplyFilter = () => {
    fetchReport(filters)
  }

  const handleDownloadCSV = () => {
    if (!report?.payments) return

    const csv = [
      ['Referencia', 'Monto', 'Método', 'Estado', 'Fecha'].join(','),
      ...report.payments.map(p =>
        [
          p.external_reference,
          p.amount,
          p.method,
          p.status,
          new Date(p.created_at).toLocaleDateString('es-CO')
        ].join(',')
      )
    ].join('\n')

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `reporte-pagos-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  if (!user || (user.role !== 'admin' && user.role !== 'teacher')) {
    return (
      <div className="card" style={{ maxWidth: 600, margin: '0 auto', padding: 24, textAlign: 'center' }}>
        <h2>Acceso Denegado</h2>
        <p>Solo los administradores y profesores pueden ver este reporte.</p>
      </div>
    )
  }

  if (loading) {
    return <div className="card"><p>Cargando reporte de pagos...</p></div>
  }

  return (
    <div style={{ padding: '40px 24px', maxWidth: 1400, margin: '0 auto', background: '#f8fafc', minHeight: '100vh' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 40 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ background: '#16a34a', width: 56, height: 56, borderRadius: 16, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 10px 15px -3px rgba(22, 163, 74, 0.2)' }}>
            <Calendar size={32} />
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: '32px', color: '#1e293b', fontWeight: '800' }}>Gestión de Recaudos</h1>
            <p style={{ margin: 0, color: '#64748b' }}>Monitoreo y validación de ingresos institucionales</p>
          </div>
        </div>
        <button
          className="button"
          onClick={handleDownloadCSV}
          style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#1e293b' }}
        >
          <Download size={18} /> Exportar Reporte (CSV)
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
          }}
        >
          {error}
        </div>
      )}

      {successMsg && (
        <div
          className="card"
          style={{
            background: '#f0fdf4',
            border: '1px solid #86efac',
            color: '#166534',
            marginBottom: 24,
          }}
        >
          <Check size={14} className="inline mr-1" /> {successMsg}
        </div>
      )}

      {/* Filtros */}
      <div className="card" style={{ marginBottom: 40, border: '1px solid #e2e8f0', borderRadius: '20px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
        <h3 style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '0 0 16px 0' }}>
          <Filter size={20} style={{ color: '#16a34a' }} /> Parámetros de Búsqueda
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
          <div>
            <label>Fecha Inicio</label>
            <input
              type="date"
              name="startDate"
              value={filters.startDate}
              onChange={handleFilterChange}
              style={{ width: '100%', padding: 8 }}
            />
          </div>
          <div>
            <label>Fecha Fin</label>
            <input
              type="date"
              name="endDate"
              value={filters.endDate}
              onChange={handleFilterChange}
              style={{ width: '100%', padding: 8 }}
            />
          </div>
          <div>
            <label>Estado</label>
            <select
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
              style={{ width: '100%', padding: 8 }}
            >
              <option value="">Todos</option>
              <option value="completed">Completado</option>
              <option value="pending">Pendiente</option>
              <option value="failed">Fallido</option>
            </select>
          </div>
        </div>
        <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
          <button className="button" onClick={handleApplyFilter}>
            Buscar
          </button>
          <button
            className="button"
            onClick={() => {
              setFilters({ startDate: '', endDate: '', status: '' })
              fetchReport({ startDate: '', endDate: '', status: '' })
            }}
            style={{ background: '#ccc' }}
          >
            Limpiar
          </button>
        </div>
      </div>

      {/* Resumen */}
      {report?.summary && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 20, marginBottom: 32 }}>
          <div className="card" style={{ border: 'none', borderLeft: '5px solid #3b82f6', display: 'flex', alignItems: 'center', gap: 16, padding: '24px', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
            <div style={{ background: '#eff6ff', width: 48, height: 48, borderRadius: '12px', color: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <TrendingUp size={24} />
            </div>
            <div>
              <p style={{ margin: 0, color: '#64748b', fontSize: '0.85rem', fontWeight: 600 }}>TRANSACCIONES</p>
              <h4 style={{ margin: 0, fontSize: 24 }}>{report.summary.total}</h4>
            </div>
          </div>
          <div className="card" style={{ border: 'none', borderLeft: '5px solid #16a34a', display: 'flex', alignItems: 'center', gap: 16, padding: '24px', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
            <div style={{ background: '#f0fdf4', width: 48, height: 48, borderRadius: '12px', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <DollarSign size={24} />
            </div>
            <div>
              <p style={{ margin: 0, color: '#64748b', fontSize: '0.85rem', fontWeight: 600 }}>TOTAL RECAUDADO</p>
              <h4 style={{ margin: 0, fontSize: 24 }}>${report.summary.totalAmount.toLocaleString('es-CO')}</h4>
            </div>
          </div>
          <div className="card" style={{ border: 'none', borderLeft: '5px solid #0b63f6', display: 'flex', alignItems: 'center', gap: 16, padding: '24px', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
            <div style={{ background: '#eff6ff', width: 48, height: 48, borderRadius: '12px', color: '#0b63f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CreditCard size={24} />
            </div>
            <div>
              <p style={{ margin: 0, color: '#64748b', fontSize: '0.85rem', fontWeight: 600 }}>PAGOS ONLINE</p>
              <h4 style={{ margin: 0, fontSize: 24 }}>{report.summary.byMethod?.mp || 0}</h4>
            </div>
          </div>
          <div className="card" style={{ border: 'none', borderLeft: '5px solid #ca8a04', display: 'flex', alignItems: 'center', gap: 16, padding: '24px', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
            <div style={{ background: '#fef3c7', width: 48, height: 48, borderRadius: '12px', color: '#ca8a04', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Landmark size={24} />
            </div>
            <div>
              <p style={{ margin: 0, color: '#64748b', fontSize: '0.85rem', fontWeight: 600 }}>PAGOS OFFLINE</p>
              <h4 style={{ margin: 0, fontSize: 24 }}>
                {(report.summary.byMethod?.nequi || 0) + (report.summary.byMethod?.daviplata || 0) + (report.summary.byMethod?.oficina || 0)}
              </h4>
            </div>
          </div>
        </div>
      )}

      {/* Tabla de Pagos */}
      <div className="card" style={{ padding: 0, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div style={{ padding: '20px' }}>
            <h2 style={{ margin: 0, fontSize: '18px' }}>Historial Detallado de Transacciones</h2>
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
              <tr>
                <th style={{ padding: '16px', textAlign: 'left', color: '#64748b', fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase' }}>Referencia</th>
                <th style={{ padding: '16px', textAlign: 'left', color: '#64748b', fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase' }}>Estudiante / Usuario</th>
                <th style={{ padding: '16px', textAlign: 'right', color: '#64748b', fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase' }}>Monto</th>
                <th style={{ padding: '16px', textAlign: 'left', color: '#64748b', fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase' }}>Método</th>
                <th style={{ padding: '16px', textAlign: 'left', color: '#64748b', fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase' }}>Estado</th>
                <th style={{ padding: '16px', textAlign: 'left', color: '#64748b', fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase' }}>Fecha</th>
                {(user?.role === 'admin' || user?.role === 'teacher') && (
                  <th style={{ padding: '16px', textAlign: 'center', color: '#64748b', fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase' }}>Acciones</th>
                )}
              </tr>
            </thead>
            <tbody>
              {report?.payments?.length > 0 ? (
                report.payments.map((payment) => (
                  <tr key={payment.id} style={{ borderBottom: '1px solid #f1f5f9', transition: 'background 0.2s' }} onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                    <td style={{ padding: '16px' }}>
                      <code style={{ fontSize: '11px', background: '#f1f5f9', padding: '4px 8px', borderRadius: '6px', color: '#475569', fontWeight: 'bold' }}>
                        {payment.external_reference}
                      </code>
                    </td>
                    <td style={{ padding: '16px' }}>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <div style={{ marginBottom: 4 }}>
                          <strong style={{ color: '#1e293b' }}>{payment.name}</strong>
                        </div>
                          <div style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: 2 }}>
                          <Mail size={14} className="inline mr-1" /> {payment.email}
                        </div>
                        {payment.document_number && (
                          <div style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: 2 }}>
                            <IdCard size={14} className="inline mr-1" /> {payment.document_number}
                          </div>
                        )}
                        {payment.grade && (
                          <div style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: 2 }}>
                            <BookOpen size={14} className="inline mr-1" /> Grado: <strong>{payment.grade}</strong>
                          </div>
                        )}
                        {payment.role && (
                          <div style={{ fontSize: '0.85rem', marginBottom: 4 }}>
                            <Users size={14} className="inline mr-1" /><span style={{ background: '#eef2ff', padding: '2px 8px', borderRadius: 3, color: '#0b63f6', fontWeight: 600 }}>
                              {payment.role === 'student' ? 'Estudiante' : payment.role === 'teacher' ? 'Profesor' : 'Admin'}
                            </span>
                          </div>
                        )}
                        {payment.metadata && (() => {
                          try {
                            const meta = typeof payment.metadata === 'string' ? JSON.parse(payment.metadata) : payment.metadata;
                            const months = meta.items && Array.isArray(meta.items) 
                              ? meta.items.map(item => item.metadata?.month).filter(Boolean)
                              : [];
                            if (months.length > 0) {
                              return (
                                <div style={{ fontSize: '0.85rem', color: '#1f7a4a', fontWeight: 600, padding: '6px 8px', background: '#e8fff3', borderRadius: 4 }}>
                                  <Calendar size={14} className="inline mr-1" /> Meses: {months.join(', ')}
                                </div>
                              );
                            }
                          } catch (e) {
                            console.error('Error parsing metadata:', e);
                          }
                          return null;
                        })()}
                      </div>
                    </td>
                    <td style={{ padding: '16px', textAlign: 'right' }}>
                      <strong style={{ color: '#1e293b' }}>${parseFloat(payment.amount).toLocaleString('es-CO')}</strong>
                    </td>
                    <td style={{ padding: '16px' }}>
                      <span style={{ padding: '4px 10px', background: '#f1f5f9', borderRadius: '20px', fontSize: '12px', color: '#475569', fontWeight: '600', textTransform: 'capitalize' }}>
                        {payment.method.replace('_', ' ')}
                      </span>
                    </td>
                    <td style={{ padding: '16px' }}>
                      <span
                        style={{
                          padding: '4px 12px',
                          borderRadius: 4,
                          fontSize: 12,
                          fontWeight: 600,
                          background:
                            payment.status === 'completed'
                              ? '#dcfce7'
                              : payment.status === 'pending'
                                ? '#fef3c7'
                                : '#fee2e2',
                          color:
                            payment.status === 'completed'
                              ? '#16a34a'
                              : payment.status === 'pending'
                                ? '#ca8a04'
                                : '#dc2626'
                        }}
                      >
                        {payment.status === 'completed' ? 'Pagado' : payment.status === 'pending' ? 'Pendiente' : 'No pagado'}
                      </span>
                    </td>
                    <td style={{ padding: '16px' }}>
                      <div style={{ fontSize: '13px', color: '#64748b' }}>{new Date(payment.created_at).toLocaleDateString('es-CO')}</div>
                    </td>
                    {(user?.role === 'admin' || user?.role === 'teacher') && (
                      <td style={{ padding: '16px' }}>
                        <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
                          {payment.status === 'pending' && (
                            <button
                              className="button"
                              style={{ padding: '6px 10px', fontSize: 11, whiteSpace: 'nowrap', background: '#16a34a', color: 'white', border: 'none', borderRadius: 4, cursor: updatingOrder === payment.external_reference ? 'wait' : 'pointer' }}
                              disabled={updatingOrder === payment.external_reference}
                              onClick={async () => {
                                try {
                                  setUpdatingOrder(payment.external_reference)
                                  logger.info('Marcando como pagado:', payment.external_reference)
                                  await updateOrderStatus(payment.external_reference, 'completed')
                                  logger.debug('✅ Actualizado exitosamente')
                                  setSuccessMsg(`Pago de ${payment.name} marcado como pagado`)
                                  setTimeout(() => setSuccessMsg(''), 3000)
                                  await fetchReport(filters)
                                } catch (err) {
                                  logger.error('Error marcando como pagado:', err.response?.data || err.message)
                                  setError(`Error: ${err.response?.data?.error || err.response?.data?.message || err.message}`)
                                } finally {
                                  setUpdatingOrder(null)
                                }
                              }}
                              title="Marcar este pago como completado"
                            >
                              <Check size={14} style={{ marginRight: 4 }} /> Pagado
                            </button>
                          )}
                          {payment.status !== 'failed' && (
                            <button
                              className="button"
                              style={{ padding: '6px 10px', fontSize: 11, whiteSpace: 'nowrap', background: '#dc2626', color: 'white', border: 'none', borderRadius: 4, cursor: updatingOrder === payment.external_reference ? 'wait' : 'pointer' }}
                              disabled={updatingOrder === payment.external_reference}
                              onClick={async () => {
                                try {
                                  setUpdatingOrder(payment.external_reference)
                                  logger.info('Marcando como no pagado:', payment.external_reference)
                                  await updateOrderStatus(payment.external_reference, 'failed')
                                  logger.debug('✅ Actualizado exitosamente')
                                  setSuccessMsg(`Pago de ${payment.name} marcado como no pagado`)
                                  setTimeout(() => setSuccessMsg(''), 3000)
                                  await fetchReport(filters)
                                } catch (err) {
                                  logger.error('Error marcando como no pagado:', err.response?.data || err.message)
                                  setError(`Error: ${err.response?.data?.error || err.response?.data?.message || err.message}`)
                                } finally {
                                  setUpdatingOrder(null)
                                }
                              }}
                              title="Marcar este pago como rechazado/no pagado"
                            >
                              <X size={14} style={{ marginRight: 4 }} /> No pagado
                            </button>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={(user?.role === 'admin' || user?.role === 'teacher') ? 7 : 6} style={{ padding: 24, textAlign: 'center', opacity: 0.6 }}>
                    No hay transacciones para mostrar
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
