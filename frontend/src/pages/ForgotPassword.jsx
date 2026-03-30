import { useState } from 'react'
import { Link } from 'react-router-dom'
import API from '../services/api'
import { Mail, ArrowLeft, Copy, Check } from 'lucide-react'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [resetLink, setResetLink] = useState('')
  const [copied, setCopied] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setMessage('')
    setLoading(true)

    try {
      const { data } = await API.post('auth/forgot-password', { email })
      setMessage(data.msg)
      setResetLink(data.resetLink || '')
      setSubmitted(true)
      setEmail('')
    } catch (err) {
      setError(err.response?.data?.msg || 'Error al enviar email de recuperación')
    } finally {
      setLoading(false)
    }
  }

  const copyLink = () => {
    navigator.clipboard.writeText(resetLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

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
          <ArrowLeft size={16} /> Volver
        </Link>

        <h2 style={{ marginTop: 0 }}>Recuperar contraseña</h2>

        {submitted ? (
          <div style={{ textAlign: 'center' }}>
            <div style={{
              background: '#dcfce7',
              border: '2px solid #16a34a',
              borderRadius: 8,
              padding: 24,
              marginBottom: 24
            }}>
              <Mail size={48} style={{ color: '#16a34a', margin: '0 auto 16px' }} />
              <h3 style={{ color: '#16a34a', margin: '0 0 12px 0' }}>Revisa tu Email</h3>
              <p style={{ margin: 0, opacity: 0.8 }}>
                Si la cuenta existe, recibirás un enlace para restablecer tu contraseña en los próximos minutos.
              </p>
            </div>

            {resetLink && (
              <div style={{
                background: '#fef3c7',
                border: '2px solid #f59e0b',
                borderRadius: 8,
                padding: 16,
                marginBottom: 24
              }}>
                <p style={{ margin: '0 0 12px 0', color: '#92400e', fontSize: 12, fontWeight: 600 }}>
                  💡 MODO DESARROLLO: Link de Reset
                </p>
                <div style={{
                  background: '#fff',
                  padding: 12,
                  borderRadius: 6,
                  marginBottom: 12,
                  wordBreak: 'break-all',
                  fontSize: 12,
                  color: '#666',
                  maxHeight: 80,
                  overflowY: 'auto',
                  fontFamily: 'monospace'
                }}>
                  {resetLink}
                </div>
                <button
                  onClick={copyLink}
                  style={{
                    background: '#f59e0b',
                    color: '#fff',
                    border: 'none',
                    padding: '8px 16px',
                    borderRadius: 6,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    fontWeight: 600,
                    fontSize: 12
                  }}
                >
                  {copied ? <Check size={16} /> : <Copy size={16} />}
                  {copied ? 'Copiado!' : 'Copiar Link'}
                </button>
              </div>
            )}

            <Link
              to="/login"
              style={{
                display: 'inline-block',
                marginTop: 16,
                padding: '10px 24px',
                background: '#2563eb',
                color: '#fff',
                textDecoration: 'none',
                borderRadius: 6,
                fontWeight: 600
              }}
            >
              Volver al Login
            </Link>
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
              Ingresa tu Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="tu.email@ejemplo.com"
              style={{
                width: '100%',
                padding: 12,
                border: '1px solid #d1d5db',
                borderRadius: 6,
                marginBottom: 16,
                fontSize: 14,
                boxSizing: 'border-box'
              }}
            />

            <p style={{ fontSize: 12, opacity: 0.7, marginBottom: 16 }}>
              Te enviaremos un enlace seguro para restablecer tu contraseña. El enlace expirará en 1 hora.
            </p>

            <button
              type="submit"
              disabled={loading}
              className="button"
              style={{
                width: '100%',
                background: loading ? '#9ca3af' : '#2563eb',
                color: '#fff',
                fontWeight: 600,
                cursor: loading ? 'not-allowed' : 'pointer'
              }}
            >
              {loading ? 'Enviando...' : 'Enviar link de recuperación'}
            </button>
          </form>
        )}

        <p style={{ textAlign: 'center', marginTop: 16, fontSize: 14, opacity: 0.7 }}>
          ¿No tienes cuenta? 
          <Link
            to="/register"
            style={{ color: '#2563eb', textDecoration: 'none', marginLeft: 6, fontWeight: 600 }}
          >
            Regístrate aquí
          </Link>
        </p>
      </div>
    </div>
  )
}
