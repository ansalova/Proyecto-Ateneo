import { useState, useEffect } from 'react'
import { useSearchParams, Link, useNavigate } from 'react-router-dom'
import API from '../services/api'
import { Check, AlertCircle, ArrowLeft } from 'lucide-react'

export default function VerifyEmail() {
  const [searchParams] = useSearchParams()
  const nav = useNavigate()
  const token = searchParams.get('token')

  const [status, setStatus] = useState('pending') // pending, success, error
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    if (!token) {
      setStatus('error')
      setErrorMsg('Token de verificación ausente')
      return
    }

    const verify = async () => {
      try {
        await API.get(`/api/auth/verify-email?token=${token}`)
        setStatus('success')
        // optionally redirect after short delay
        setTimeout(() => nav('/login?verified=1'), 2000)
      } catch (err) {
        setStatus('error')
        setErrorMsg(err.response?.data || 'Error verificando email')
      }
    }

    verify()
  }, [token, nav])

  if (status === 'pending') {
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
          <p>Verificando tu cuenta...</p>
        </div>
      </div>
    )
  }

  if (status === 'error') {
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
          <h2 style={{ color: '#dc2626' }}>Error</h2>
          <p>{errorMsg}</p>
          <Link
            to="/"
            className="button"
            style={{
              display: 'inline-block',
              marginTop: 16,
              textDecoration: 'none'
            }}
          >
            Ir al inicio
          </Link>
        </div>
      </div>
    )
  }

  // success
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
        <Check size={48} style={{ color: '#16a34a', margin: '0 auto 16px' }} />
        <h2 style={{ color: '#16a34a' }}>¡Cuenta Verificada!</h2>
        <p>Gracias por confirmar tu correo. Serás redirigido al login...</p>
        <Link
          to="/login"
          className="button"
          style={{
            display: 'inline-block',
            marginTop: 16,
            textDecoration: 'none'
          }}
        >
          Ir al login
        </Link>
      </div>
    </div>
  )
}
