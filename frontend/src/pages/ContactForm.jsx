import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'

export default function ContactForm() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const validateEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return regex.test(email)
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess(false)

    // Validations
    if (!formData.name.trim()) {
      setError('Nombre es requerido')
      return
    }
    if (!formData.email.trim()) {
      setError('Email es requerido')
      return
    }
    if (!validateEmail(formData.email)) {
      setError('Email inválido')
      return
    }
    if (!formData.subject.trim()) {
      setError('Asunto es requerido')
      return
    }
    if (!formData.message.trim()) {
      setError('Mensaje es requerido')
      return
    }
    if (formData.message.length > 2000) {
      setError('Mensaje demasiado largo (máx 2000 caracteres)')
      return
    }

    setLoading(true)
    try {
      const response = await api.post('/contact', {
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim() || null,
        subject: formData.subject.trim(),
        message: formData.message.trim()
      })

      setSuccess(true)
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: ''
      })

      // Redirect after 2 seconds
      setTimeout(() => {
        navigate('/')
      }, 2000)
    } catch (err) {
      setError(err.response?.data?.msg || 'Error al enviar mensaje')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ background: '#f6f8fb', minHeight: '100vh', padding: '48px 20px' }}>
      <div style={{ maxWidth: 600, margin: '0 auto' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <h1 style={{ fontSize: 32, margin: '0 0 12px 0', color: '#1e293b' }}>Contáctanos</h1>
          <p style={{ color: '#64748b', fontSize: 16, margin: 0 }}>Estamos aquí para ayudarte. Envía tu mensaje y nos comunicaremos pronto.</p>
        </div>

        {/* Success Message */}
        {success && (
          <div style={{ marginBottom: 20, padding: 16, background: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: 8 }}>
            <p style={{ color: '#065f46', fontWeight: 500, margin: 0 }}>
              Gracias por tu mensaje. Nos pondremos en contacto pronto.
            </p>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div style={{ marginBottom: 20, padding: 16, background: '#fee2e2', border: '1px solid #fecaca', borderRadius: 8 }}>
            <p style={{ color: '#991b1b', fontWeight: 500, margin: 0 }}>{error}</p>
          </div>
        )}

        {/* Form Card */}
        <div style={{ background: 'white', borderRadius: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.08)', padding: 32 }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Name */}
            <div>
              <label style={{ display: 'block', fontSize: 14, fontWeight: 600, color: '#1e293b', marginBottom: 8 }}>
                Nombre completo
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Tu nombre"
                required
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '1px solid #e2e8f0',
                  borderRadius: 8,
                  fontSize: 14,
                  outline: 'none',
                  transition: 'all 0.3s ease',
                  boxSizing: 'border-box'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#1f7a4a'
                  e.target.style.boxShadow = '0 0 0 3px rgba(31, 122, 74, 0.1)'
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#e2e8f0'
                  e.target.style.boxShadow = 'none'
                }}
              />
            </div>

            {/* Email */}
            <div>
              <label style={{ display: 'block', fontSize: 14, fontWeight: 600, color: '#1e293b', marginBottom: 8 }}>
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="tu@email.com"
                required
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '1px solid #e2e8f0',
                  borderRadius: 8,
                  fontSize: 14,
                  outline: 'none',
                  transition: 'all 0.3s ease',
                  boxSizing: 'border-box'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#1f7a4a'
                  e.target.style.boxShadow = '0 0 0 3px rgba(31, 122, 74, 0.1)'
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#e2e8f0'
                  e.target.style.boxShadow = 'none'
                }}
              />
            </div>

            {/* Phone */}
            <div>
              <label style={{ display: 'block', fontSize: 14, fontWeight: 600, color: '#1e293b', marginBottom: 8 }}>
                Teléfono (opcional)
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+57 3XX XXXX XXX"
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '1px solid #e2e8f0',
                  borderRadius: 8,
                  fontSize: 14,
                  outline: 'none',
                  transition: 'all 0.3s ease',
                  boxSizing: 'border-box'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#1f7a4a'
                  e.target.style.boxShadow = '0 0 0 3px rgba(31, 122, 74, 0.1)'
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#e2e8f0'
                  e.target.style.boxShadow = 'none'
                }}
              />
            </div>

            {/* Subject */}
            <div>
              <label style={{ display: 'block', fontSize: 14, fontWeight: 600, color: '#1e293b', marginBottom: 8 }}>
                Asunto
              </label>
              <input
                type="text"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                placeholder="¿Cuál es el tema?"
                required
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '1px solid #e2e8f0',
                  borderRadius: 8,
                  fontSize: 14,
                  outline: 'none',
                  transition: 'all 0.3s ease',
                  boxSizing: 'border-box'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#1f7a4a'
                  e.target.style.boxShadow = '0 0 0 3px rgba(31, 122, 74, 0.1)'
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#e2e8f0'
                  e.target.style.boxShadow = 'none'
                }}
              />
            </div>

            {/* Message */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <label style={{ fontSize: 14, fontWeight: 600, color: '#1e293b', margin: 0 }}>
                  Mensaje
                </label>
                <span style={{ fontSize: 12, color: '#94a3b8' }}>
                  {formData.message.length}/2000
                </span>
              </div>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                placeholder="Escribe tu mensaje aquí..."
                required
                rows="6"
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '1px solid #e2e8f0',
                  borderRadius: 8,
                  fontSize: 14,
                  outline: 'none',
                  transition: 'all 0.3s ease',
                  boxSizing: 'border-box',
                  fontFamily: 'inherit',
                  resize: 'none'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#1f7a4a'
                  e.target.style.boxShadow = '0 0 0 3px rgba(31, 122, 74, 0.1)'
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#e2e8f0'
                  e.target.style.boxShadow = 'none'
                }}
              />
            </div>

            {/* Buttons */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <button
                type="submit"
                disabled={loading}
                style={{
                  background: '#1f7a4a',
                  color: 'white',
                  fontWeight: 600,
                  padding: '12px 16px',
                  border: 'none',
                  borderRadius: 8,
                  cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.6 : 1,
                  transition: 'all 0.3s ease',
                  fontSize: 14
                }}
                onMouseEnter={(e) => {
                  if (!loading) {
                    e.target.style.background = '#1a6a41'
                  }
                }}
                onMouseLeave={(e) => {
                  if (!loading) {
                    e.target.style.background = '#1f7a4a'
                  }
                }}
              >
                {loading ? 'Enviando...' : 'Enviar mensaje'}
              </button>
              <button
                type="button"
                onClick={() => navigate('/')}
                style={{
                  background: 'white',
                  color: '#1f7a4a',
                  fontWeight: 600,
                  padding: '12px 16px',
                  border: '2px solid #1f7a4a',
                  borderRadius: 8,
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  fontSize: 14
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = '#f0f9f5'
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'white'
                }}
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>

        {/* Info Section */}
        <div style={{ marginTop: 32, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div style={{ background: 'white', borderRadius: 12, padding: 20, boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
            <h3 style={{ margin: '0 0 8px 0', fontSize: 16, fontWeight: 600, color: '#1f7a4a' }}>Respuesta rápida</h3>
            <p style={{ margin: 0, fontSize: 14, color: '#64748b' }}>
              Respondemos a todos los mensajes en menos de 24 horas
            </p>
          </div>
          <div style={{ background: 'white', borderRadius: 12, padding: 20, boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
            <h3 style={{ margin: '0 0 8px 0', fontSize: 16, fontWeight: 600, color: '#1f7a4a' }}>Privacidad</h3>
            <p style={{ margin: 0, fontSize: 14, color: '#64748b' }}>
              Tu información es completamente segura y confidencial
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
