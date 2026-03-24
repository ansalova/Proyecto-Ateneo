import { useState } from 'react'
import { useSearchParams, useNavigate, Link } from 'react-router-dom'
import API from '../services/api'
import { Lock, Check, AlertCircle, ArrowLeft } from 'lucide-react'

export default function ResetPassword() {
  const [searchParams] = useSearchParams()
  const nav = useNavigate()
  const token = searchParams.get('token')
  
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [passwordStrength, setPasswordStrength] = useState(0)

  if (!token) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      }}>
        <div className="card" style={{ maxWidth: 450, width: '100%', textAlign: 'center' }}>
          <AlertCircle size={48} style={{ color: '#dc2626', margin: '0 auto 16px' }} />
          <h2 style={{ color: '#dc2626' }}>Token Inválido</h2>
          <p>El enlace de recuperación es inválido o ha expirado.</p>
          <Link
            to="/forgot-password"
            className="button"
            style={{
              display: 'inline-block',
              marginTop: 16,
              textDecoration: 'none'
            }}
          >
            Solicitar nuevo link
          </Link>
        </div>
      </div>
    )
  }

  const calculateStrength = (pwd) => {
    let strength = 0
    if (pwd.length >= 8) strength++
    if (pwd.length >= 12) strength++
    if (/[A-Z]/.test(pwd)) strength++
    if (/[0-9]/.test(pwd)) strength++
    if (/[^A-Za-z0-9]/.test(pwd)) strength++
    return strength
  }

  const handlePasswordChange = (e) => {
    const pwd = e.target.value
    setPassword(pwd)
    setPasswordStrength(calculateStrength(pwd))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden')
      return
    }

    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres')
      return
    }

    setLoading(true)

    try {
      const { data } = await API.post('/api/auth/reset-password', {
        token,
        newPassword: password
      })
      setSuccess(true)
      setPassword('')
      setConfirmPassword('')
      
      // Redirigir al login después de 2 segundos
      setTimeout(() => {
        nav('/login')
      }, 2000)
    } catch (err) {
      setError(err.response?.data?.msg || 'Error al restablecer contraseña')
    } finally {
      setLoading(false)
    }
  }

  const strengthLabels = ['Muy débil', 'Débil', 'Regular', 'Buena', 'Fuerte', 'Muy fuerte']
  const strengthColors = ['#dc2626', '#f97316', '#eab308', '#84cc16', '#22c55e', '#00d084']

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 16,
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    }}>
      <div className="card" style={{ maxWidth: 450, width: '100%' }}>
        <Link
          to="/login"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            color: '#2563eb',
            textDecoration: 'none',
            marginBottom: 16,
            fontSize: 14
          }}
        >
          <ArrowLeft size={16} /> Volver al Login
        </Link>

        <h2 style={{ marginTop: 0 }}>Restablecer contraseña</h2>

        {success ? (
          <div style={{ textAlign: 'center' }}>
            <div style={{
              background: '#dcfce7',
              border: '2px solid #16a34a',
              borderRadius: 8,
              padding: 24,
              marginBottom: 24
            }}>
              <Check size={48} style={{ color: '#16a34a', margin: '0 auto 16px' }} />
              <h3 style={{ color: '#16a34a', margin: '0 0 12px 0' }}>¡Éxito!</h3>
              <p style={{ margin: 0, opacity: 0.8 }}>
                Tu contraseña ha sido restablecida correctamente. Te redirigiremos al login...
              </p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            {error && (
              <div style={{
                background: '#fee2e2',
                border: '1px solid #fecaca',
                color: '#b91c1c',
                padding: 12,
                borderRadius: 6,
                marginBottom: 16,
                fontSize: 14
              }}>
                {error}
              </div>
            )}

            <label style={{ display: 'block', marginBottom: 8, fontWeight: 600 }}>
              Nueva Contraseña
            </label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <Lock size={18} style={{ opacity: 0.5 }} />
              <input
                type="password"
                value={password}
                onChange={handlePasswordChange}
                required
                placeholder="Mínimo 6 caracteres"
                style={{
                  flex: 1,
                  padding: 10,
                  border: '1px solid #d1d5db',
                  borderRadius: 6,
                  fontSize: 14
                }}
              />
            </div>

            {password && (
              <div style={{ marginBottom: 16 }}>
                <div style={{
                  display: 'flex',
                  gap: 4,
                  marginBottom: 6
                }}>
                  {[...Array(6)].map((_, i) => (
                    <div
                      key={i}
                      style={{
                        height: 4,
                        flex: 1,
                        background: i < passwordStrength ? strengthColors[passwordStrength - 1] : '#e5e7eb',
                        borderRadius: 2
                      }}
                    />
                  ))}
                </div>
                <small style={{ opacity: 0.7 }}>
                  Fortaleza: <strong style={{ color: strengthColors[passwordStrength - 1] || '#999' }}>
                    {strengthLabels[passwordStrength - 1] || 'Ingresa contraseña'}
                  </strong>
                </small>
              </div>
            )}

            <label style={{ display: 'block', marginBottom: 8, fontWeight: 600 }}>
              Confirmar Contraseña
            </label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <Lock size={18} style={{ opacity: 0.5 }} />
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                placeholder="Repite tu contraseña"
                style={{
                  flex: 1,
                  padding: 10,
                  border: confirmPassword && password === confirmPassword ? '1px solid #16a34a' : '1px solid #d1d5db',
                  borderRadius: 6,
                  fontSize: 14,
                  background: confirmPassword && password === confirmPassword ? '#dcfce7' : 'transparent'
                }}
              />
              {confirmPassword && password === confirmPassword && (
                <Check size={18} style={{ color: '#16a34a' }} />
              )}
            </div>

            <button
              type="submit"
              disabled={loading || !password || password !== confirmPassword}
              className="button"
              style={{
                width: '100%',
                background: loading || !password ? '#9ca3af' : '#2563eb',
                color: '#fff',
                fontWeight: 600,
                cursor: loading || !password ? 'not-allowed' : 'pointer'
              }}
            >
              {loading ? 'Actualizando...' : 'Restablecer contraseña'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
