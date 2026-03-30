import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { User, Mail, Phone, Send, MapPin, Clock, MessageSquare, AlertTriangle, CheckCircle2 } from 'lucide-react'
import API from '../services/api' // Usar API en mayúsculas para consistencia

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
      // Sin barra inicial para que sea /api/contact
      await API.post('contact', {
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
    <div style={{ background: '#f8fafc', minHeight: '100vh', padding: '60px 20px' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <h1 style={{ fontSize: '2.5rem', fontWeight: '800', margin: '0 0 12px 0', color: '#1e293b' }}>Ponte en <span style={{ color: '#1f7a4a' }}>Contacto</span></h1>
          <p style={{ color: '#64748b', fontSize: '1.1rem', margin: '0 auto', maxWidth: 600 }}>¿Tienes alguna duda sobre el proceso de matrícula o nuestros servicios? Nuestro equipo está listo para ayudarte.</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 40 }}>
          {/* Form Side */}
          <div>
            {success && (
              <div style={{ marginBottom: 24, padding: '20px', background: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: 12 }}>
                <CheckCircle2 style={{ color: '#059669' }} />
                <p style={{ color: '#065f46', fontWeight: 600, margin: 0 }}>¡Mensaje enviado! Nos pondremos en contacto pronto.</p>
              </div>
            )}

            {error && (
              <div style={{ marginBottom: 24, padding: '20px', background: '#fee2e2', border: '1px solid #fecaca', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: 12 }}>
                <AlertTriangle style={{ color: '#dc2626' }} />
                <p style={{ color: '#991b1b', fontWeight: 600, margin: 0 }}>{error}</p>
              </div>
            )}

            <div className="card" style={{ padding: 40, borderRadius: 24, boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05)', background: 'white' }}>
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                  <div style={{ position: 'relative' }}>
                    <label style={{ fontSize: '13px', fontWeight: '700', color: '#475569', marginBottom: '8px', display: 'block', textTransform: 'uppercase' }}>Nombre Completo</label>
                    <div style={{ position: 'relative' }}>
                      <User size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                      <input className="input" name="name" value={formData.name} onChange={handleChange} placeholder="Tu nombre" required style={{ paddingLeft: '40px', width: '100%', boxSizing: 'border-box' }} />
                    </div>
                  </div>
                  <div style={{ position: 'relative' }}>
                    <label style={{ fontSize: '13px', fontWeight: '700', color: '#475569', marginBottom: '8px', display: 'block', textTransform: 'uppercase' }}>Correo Electrónico</label>
                    <div style={{ position: 'relative' }}>
                      <Mail size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                      <input className="input" type="email" name="email" value={formData.email} onChange={handleChange} placeholder="tu@email.com" required style={{ paddingLeft: '40px', width: '100%', boxSizing: 'border-box' }} />
                    </div>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                  <div style={{ position: 'relative' }}>
                    <label style={{ fontSize: '13px', fontWeight: '700', color: '#475569', marginBottom: '8px', display: 'block', textTransform: 'uppercase' }}>Teléfono (Opcional)</label>
                    <div style={{ position: 'relative' }}>
                      <Phone size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                      <input className="input" type="tel" name="phone" value={formData.phone} onChange={handleChange} placeholder="310..." style={{ paddingLeft: '40px', width: '100%', boxSizing: 'border-box' }} />
                    </div>
                  </div>
                  <div style={{ position: 'relative' }}>
                    <label style={{ fontSize: '13px', fontWeight: '700', color: '#475569', marginBottom: '8px', display: 'block', textTransform: 'uppercase' }}>Asunto</label>
                    <div style={{ position: 'relative' }}>
                      <MessageSquare size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                      <input className="input" type="text" name="subject" value={formData.subject} onChange={handleChange} placeholder="Ej: Matrícula" required style={{ paddingLeft: '40px', width: '100%', boxSizing: 'border-box' }} />
                    </div>
                  </div>
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <label style={{ fontSize: '13px', fontWeight: '700', color: '#475569', margin: 0, textTransform: 'uppercase' }}>Mensaje o Consulta</label>
                    <span style={{ fontSize: 12, color: '#94a3b8' }}>{formData.message.length}/2000</span>
                  </div>
                  <textarea
                    className="input"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Cuéntanos en qué podemos ayudarte..."
                    required
                    rows="6"
                    style={{ width: '100%', height: '150px', resize: 'none', padding: '12px', boxSizing: 'border-box', fontFamily: 'inherit' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 12 }}>
                  <button 
                    className="button" 
                    type="submit" 
                    disabled={loading}
                    style={{ padding: '16px', fontSize: '16px', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', borderRadius: '12px' }}
                  >
                    {loading ? 'Enviando...' : <><Send size={18} /> Enviar Mensaje</>}
                  </button>
                  <button 
                    type="button" 
                    className="button button-outline" 
                    onClick={() => navigate('/')}
                    style={{ padding: '16px', background: 'white', borderRadius: '12px' }}
                  >
                    Volver al Inicio
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Info Side */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            <div className="card" style={{ padding: 32, borderRadius: 24, background: '#1e293b', color: 'white', border: 'none' }}>
              <h3 style={{ fontSize: '20px', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 10 }}>
                <MessageSquare style={{ color: '#1f7a4a' }} /> Canales Directos
              </h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                <div style={{ display: 'flex', gap: 16 }}>
                  <div style={{ background: 'rgba(255,255,255,0.1)', width: 44, height: 44, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Phone size={20} />
                  </div>
                  <div>
                    <label style={{ fontSize: 12, color: '#94a3b8', display: 'block', fontWeight: 600 }}>TELÉFONO</label>
                    <p style={{ margin: 0, fontWeight: 600 }}>+57 3103115016</p>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 16 }}>
                  <div style={{ background: 'rgba(255,255,255,0.1)', width: 44, height: 44, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Mail size={20} />
                  </div>
                  <div>
                    <label style={{ fontSize: 12, color: '#94a3b8', display: 'block', fontWeight: 600 }}>CORREO</label>
                    <p style={{ margin: 0, fontWeight: 600 }}>ateneoautonomos.a.s@gmail.com</p>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 16 }}>
                  <div style={{ background: 'rgba(255,255,255,0.1)', width: 44, height: 44, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <MapPin size={20} />
                  </div>
                  <div>
                    <label style={{ fontSize: 12, color: '#94a3b8', display: 'block', fontWeight: 600 }}>UBICACIÓN</label>
                    <p style={{ margin: 0, fontWeight: 600 }}>Sede 774 Cl. 11 Barrio Panamá</p>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 16 }}>
                  <div style={{ background: 'rgba(255,255,255,0.1)', width: 44, height: 44, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Clock size={20} />
                  </div>
                  <div>
                    <label style={{ fontSize: 12, color: '#94a3b8', display: 'block', fontWeight: 600 }}>HORARIO DE ATENCIÓN</label>
                    <p style={{ margin: 0, fontWeight: 600 }}>Lunes a Viernes</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="card" style={{ padding: 24, borderRadius: 20, background: '#f0fdf4', border: '1px solid #dcfce7' }}>
              <h4 style={{ margin: '0 0 12px 0', color: '#16a34a', display: 'flex', alignItems: 'center', gap: 8 }}>
                <CheckCircle2 size={18} /> Respuesta Garantizada
              </h4>
              <p style={{ margin: 0, fontSize: 14, color: '#166534', lineHeight: 1.5 }}>
                Nuestro equipo administrativo revisa cada consulta y responde en un plazo máximo de 24 horas hábiles.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
