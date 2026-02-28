import { useContext, useEffect, useState } from 'react'
import { AuthContext } from '../context/AuthContext'
import API from '../services/api'
import { updateOrderStatus } from '../services/payments'
import { Download, Filter, Calendar } from 'lucide-react'

export default function PaymentReport() {
  const { user } = useContext(AuthContext)
  const [report, setReport] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
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
      setError('Error al cargar el reporte de pagos')
      console.error(err)
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

  if (!user || user.role !== 'admin') {
    return (
      <div className="card" style={{ maxWidth: 600, margin: '0 auto', padding: 24, textAlign: 'center' }}>
        <h2>Acceso Denegado</h2>
        <p>Solo los administradores pueden ver este reporte.</p>
      </div>
    )
  }

  if (loading) {
    return <div className="card"><p>Cargando reporte de pagos...</p></div>
  }

  return (
    <div style={{ padding: 24, maxWidth: 1200, margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <Calendar size={32} style={{ color: '#16a34a' }} />
        <h1 style={{ margin: 0 }}>Reporte de Pagos</h1>
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

      {/* Filtros */}
      <div className="card" style={{ marginBottom: 24, background: '#f9fafb' }}>
        <h3 style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '0 0 16px 0' }}>
          <Filter size={20} /> Filtros
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
            Aplicar Filtros
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
        <div className="card" style={{ marginBottom: 24, background: '#f0fdf4' }}>
          <h3 style={{ margin: '0 0 16px 0' }}>Resumen</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
            <div>
              <p style={{ margin: 0, opacity: 0.7 }}>Total de Transacciones</p>
              <h4 style={{ margin: '8px 0 0 0', fontSize: 24 }}>{report.summary.total}</h4>
            </div>
            <div>
              <p style={{ margin: 0, opacity: 0.7 }}>Monto Total</p>
              <h4 style={{ margin: '8px 0 0 0', fontSize: 24 }}>
                ${report.summary.totalAmount.toFixed(2)}
              </h4>
            </div>
            <div>
              <p style={{ margin: 0, opacity: 0.7 }}>Método: Mercado Pago</p>
              <h4 style={{ margin: '8px 0 0 0', fontSize: 24 }}>
                {report.summary.byMethod?.mp || 0}
              </h4>
            </div>
            <div>
              <p style={{ margin: 0, opacity: 0.7 }}>Método: Offline</p>
              <h4 style={{ margin: '8px 0 0 0', fontSize: 24 }}>
                {(report.summary.byMethod?.nequi || 0) +
                  (report.summary.byMethod?.daviplata || 0) +
                  (report.summary.byMethod?.oficina || 0)}
              </h4>
            </div>
          </div>
        </div>
      )}

      {/* Tabla de Pagos */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h2>Transacciones detalladas</h2>
          <button
            className="button"
            onClick={handleDownloadCSV}
            style={{ display: 'flex', alignItems: 'center', gap: 6 }}
          >
            <Download size={16} /> Descargar CSV
          </button>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
            <thead style={{ background: '#f3f4f6' }}>
              <tr>
                <th style={{ padding: 12, textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>Referencia</th>
                <th style={{ padding: 12, textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>Usuario</th>
                <th style={{ padding: 12, textAlign: 'right', borderBottom: '1px solid #e5e7eb' }}>Monto</th>
                <th style={{ padding: 12, textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>Método</th>
                <th style={{ padding: 12, textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>Estado</th>
                <th style={{ padding: 12, textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>Fecha</th>
                {user?.role === 'admin' && (
                  <th style={{ padding: 12, textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>Acciones</th>
                )}
              </tr>
            </thead>
            <tbody>
              {report?.payments?.length > 0 ? (
                report.payments.map((payment) => (
                  <tr key={payment.id} style={{ borderBottom: '1px solid #e5e7eb', fontSize: 14 }}>
                    <td style={{ padding: 12 }}>
                      <code style={{ fontSize: 11, background: '#f3f4f6', padding: '2px 6px', borderRadius: 3 }}>
                        {payment.external_reference}
                      </code>
                    </td>
                    <td style={{ padding: 12 }}>
                      <div>
                        <strong>{payment.name}</strong>
                        <br />
                        <small style={{ opacity: 0.6 }}>{payment.email}</small>
                      </div>
                    </td>
                    <td style={{ padding: 12, textAlign: 'right' }}>
                      <strong>${parseFloat(payment.amount).toFixed(2)}</strong>
                    </td>
                    <td style={{ padding: 12 }}>
                      <span style={{ padding: '4px 8px', background: '#eff6ff', borderRadius: 3, fontSize: 12 }}>
                        {payment.method}
                      </span>
                    </td>
                    <td style={{ padding: 12 }}>
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
                        {payment.status}
                      </span>
                    </td>
                    <td style={{ padding: 12 }}>
                      <small>{new Date(payment.created_at).toLocaleDateString('es-CO')}</small>
                    </td>
                    {user?.role === 'admin' && (
                      <td style={{ padding: 12 }}>
                        {payment.status === 'pending' && (
                          <button
                            className="button"
                            style={{ padding: '4px 8px', fontSize: 12, whiteSpace: 'nowrap' }}
                            onClick={async () => {
                              try {
                                await updateOrderStatus(payment.external_reference, 'completed');
                                fetchReport(filters);
                              } catch (err) {
                                console.error('Error marcando como pagado', err);
                              }
                            }}
                          >
                            Marcar pagado
                          </button>
                        )}
                      </td>
                    )}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" style={{ padding: 24, textAlign: 'center', opacity: 0.6 }}>
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
