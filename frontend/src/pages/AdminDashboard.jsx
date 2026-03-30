import { useContext, useEffect, useState } from 'react'
import { AuthContext } from '../context/AuthContext'
import API from '../services/api'
import { Users, DollarSign, FileText, MessageSquare, TrendingUp, Download, Users2, User, GraduationCap } from 'lucide-react'
import AlertModal from '../components/AlertModal'

export default function AdminDashboard() {
  const { user } = useContext(AuthContext)
  const [stats, setStats] = useState(null)
  const [payments, setPayments] = useState(null)
  const [users, setUsers] = useState(null)
  const [activity, setActivity] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showAlert, setShowAlert] = useState(false)
  const [alertMessage, setAlertMessage] = useState('')

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      const [statsRes, paymentsRes, usersRes, activityRes] = await Promise.all([
        API.get('admin/stats'),
        API.get('admin/payments/report'),
        API.get('admin/users'),
        API.get('admin/activity')
      ])

      setStats(statsRes.data)
      setPayments(paymentsRes.data)
      setUsers(usersRes.data)
      setActivity(activityRes.data)
      setError('')
    } catch (err) {
      setError('Error al cargar datos del dashboard')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  if (!user || user.role !== 'admin') {
    return (
      <div className="card" style={{ maxWidth: 600, margin: '0 auto', padding: 24, textAlign: 'center' }}>
        <h2>Acceso Denegado</h2>
        <p>Solo los administradores pueden ver este panel.</p>
      </div>
    )
  }

  if (loading) {
    return <div className="card"><p>Cargando datos del dashboard...</p></div>
  }

  return (
    <div style={{ padding: 24, maxWidth: 1400, margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 32 }}>
        <TrendingUp size={32} style={{ color: '#2563eb' }} />
        <h1 style={{ margin: 0 }}>Panel de Administración</h1>
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

      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 16, marginBottom: 32 }}>
        {/* Usuarios */}
        <div className="card" style={{ background: '#eff6ff' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <p style={{ margin: '0 0 8px 0', opacity: 0.7 }}>Total Usuarios</p>
              <h3 style={{ margin: 0, fontSize: 28 }}>
                {stats?.usersByRole.student + stats?.usersByRole.teacher + stats?.usersByRole.admin || 0}
              </h3>
            </div>
            <Users size={40} style={{ color: '#2563eb' }} />
          </div>
          <small style={{ opacity: 0.6, marginTop: 12, display: 'block' }}>
            <Users2 size={14} className="inline mr-1" /> Estudiantes: {stats?.usersByRole.student || 0} | <GraduationCap size={14} className="inline mr-1" /> Profesores: {stats?.usersByRole.teacher || 0}
          </small>
        </div>

        {/* Pagos Completados */}
        <div className="card" style={{ background: '#f0fdf4' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <p style={{ margin: '0 0 8px 0', opacity: 0.7 }}>Pagos Completados</p>
              <h3 style={{ margin: 0, fontSize: 28 }}>
                ${stats?.orders.totalAmount.toFixed(2) || 0}
              </h3>
            </div>
            <DollarSign size={40} style={{ color: '#16a34a' }} />
          </div>
          <small style={{ opacity: 0.6, marginTop: 12, display: 'block' }}>
            Total transacciones: {stats?.orders.total || 0}
          </small>
        </div>

        {/* Anuncios */}
        <div className="card" style={{ background: '#faf5ff' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <p style={{ margin: '0 0 8px 0', opacity: 0.7 }}>Anuncios Activos</p>
              <h3 style={{ margin: 0, fontSize: 28 }}>{stats?.announcements || 0}</h3>
            </div>
            <MessageSquare size={40} style={{ color: '#9333ea' }} />
          </div>
        </div>

        {/* Documentos */}
        <div className="card" style={{ background: '#fef3c7' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <p style={{ margin: '0 0 8px 0', opacity: 0.7 }}>Documentos</p>
              <h3 style={{ margin: 0, fontSize: 28 }}>{stats?.documents || 0}</h3>
            </div>
            <FileText size={40} style={{ color: '#ca8a04' }} />
          </div>
        </div>
      </div>

      {/* Últimos Pagos */}
      <div className="card" style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h2>Últimos Pagos</h2>
          <button
            className="button"
            style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}
            onClick={() => { setAlertMessage('Descargar reporte de pagos'); setShowAlert(true) }}
          >
            <Download size={16} /> Descargar CSV
          </button>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={{ background: '#f3f4f6' }}>
              <tr>
                <th style={{ padding: 12, textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>Referencia</th>
                <th style={{ padding: 12, textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>Monto</th>
                <th style={{ padding: 12, textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>Método</th>
                <th style={{ padding: 12, textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>Estado</th>
                <th style={{ padding: 12, textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>Fecha</th>
              </tr>
            </thead>
            <tbody>
              {stats?.recentPayments.map((payment) => (
                <tr key={payment.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                  <td style={{ padding: 12 }}>
                    <small>{payment.external_reference}</small>
                  </td>
                  <td style={{ padding: 12 }}>
                    <strong>${parseFloat(payment.amount).toFixed(2)}</strong>
                  </td>
                  <td style={{ padding: 12 }}>{payment.method}</td>
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
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Usuarios por Rol */}
      <div className="card">
        <h2>Distribución de Usuarios</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
          {stats?.usersByRole &&
            Object.entries(stats.usersByRole).map(([role, count]) => (
              <div
                key={role}
                style={{
                  padding: 16,
                  background: '#f9fafb',
                  borderRadius: 6,
                  textAlign: 'center'
                }}
              >
                <p style={{ margin: '0 0 8px 0', opacity: 0.7 }}>
{role === 'student' ? (<><Users2 size={14} className="inline mr-1" /> Estudiantes</>) : role === 'teacher' ? (<><GraduationCap size={14} className="inline mr-1" /> Profesores</>) : (<><User size={14} className="inline mr-1" /> Admins</>)}
                </p>
                <h3 style={{ margin: 0, fontSize: 24 }}>{count}</h3>
              </div>
            ))}
        </div>
      </div>

      <AlertModal open={showAlert} title="Descargar" message={alertMessage} onClose={() => setShowAlert(false)} />
    </div>
  )
}
