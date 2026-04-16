import React, { useContext, useState, useEffect } from 'react'
import { CartContext } from '../context/CartContext'
import { AuthContext } from '../context/AuthContext'
import { useNavigate, Link } from "react-router-dom"
import API from '../services/api'
import { School, BookOpen, ChevronsRight, Calendar, GraduationCap, CreditCard, Clock, X, Check, ArrowRight, ShieldCheck, Zap } from 'lucide-react'

const MENSUALIDAD = {
  id: 1,
  name: 'Mensualidad Colegio Ateneo',
  price: 80000,
  image: '/mensualidad.png',
  description: 'Pago de la mensualidad escolar. Incluye acceso a plataforma y servicios educativos.'
}

const MESES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
]

export default function Home() {
  const { add } = useContext(CartContext)
  const { user, loading } = useContext(AuthContext)
  const navigate = useNavigate()
  const [selectedMonths, setSelectedMonths] = useState([])
  const [showServices, setShowServices] = useState(false)
  const [showLoginPrompt, setShowLoginPrompt] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [monthStatus, setMonthStatus] = useState({}) // Estado de cada mes
  const [loadingStatus, setLoadingStatus] = useState(false)

  useEffect(() => {
    // Si ya cargó y no hay usuario, mostramos el prompt
    if (!loading && !user) {
      setShowLoginPrompt(true)
    }
  }, [loading, user])

  // Cargar estado de pagos cuando el usuario cambia
  useEffect(() => {
    if (user && user.id) {
      loadPaymentStatus()
    }
  }, [user])

  const loadPaymentStatus = async () => {
    try {
      setLoadingStatus(true)
      const { data } = await API.get('api/payments/my-status')
      setMonthStatus(data)
    } catch (error) {
      console.error('Error loading payment status:', error)
      setMonthStatus({})
    } finally {
      setLoadingStatus(false)
    }
  }

  // Determinar el mes actual (0-11)
  const currentMonthIndex = new Date().getMonth()

  // Verificar si un mes ya pasó
  const isMonthPassed = (monthName) => {
    const monthIndex = MESES.indexOf(monthName)
    return monthIndex < currentMonthIndex
  }

  // Obtener el estado visual de un mes
  const getMonthStatusInfo = (month) => {
    const status = monthStatus[month]
    if (status === 'completed') {
      return { label: (<><Check size={14} className="inline mr-1" />Pagado</>), color: '#16a34a', bg: '#dcfce7', border: '#86efac', disabled: true }
    } else if (status === 'pending') {
      return { label: (<><Clock size={14} className="inline mr-1" />Pendiente</>), color: '#ca8a04', bg: '#fef3c7', border: '#fcd34d', disabled: false }
    } else if (status === 'failed') {
      return { label: '❌ No pagado', color: '#dc2626', bg: '#fee2e2', border: '#fecaca', disabled: false }
    }
    return { label: month, color: '#475569', bg: '#ffffff', border: '#e2e8f0', disabled: false }
  }

  const toggleMonth = (month) => {
    // No permitir seleccionar si ya el mes pasó
    if (isMonthPassed(month)) {
      setErrorMsg('⏰ No puedes pagar meses que ya han pasado')
      return
    }
    
    const status = monthStatus[month]
    // No permitir pagar si ya está pagado
    if (status === 'completed') {
      setErrorMsg('✓ Este mes ya está pagado')
      return
    }

    setSelectedMonths(prev => 
      prev.includes(month) 
        ? prev.filter(m => m !== month)
        : [...prev, month]
    )
  }

  const handlePay = () => {
    if (selectedMonths.length === 0) {
      setErrorMsg('Por favor selecciona al menos un mes')
      return
    }
    
    selectedMonths.forEach(month => {
      add({ 
        ...MENSUALIDAD, 
        id: `${MENSUALIDAD.id}_${month}`,
        metadata: { month } 
      })
    })
    // Redirigimos directamente al checkout
    navigate('/checkout')
  }

  return (
    <div>
      {/* HERO */}
      <section className="card" style={{ padding: '2rem', marginBottom: 20, background: 'linear-gradient(180deg, #e8fff3, #ffffff)' }}>
        <div className="hero-grid">
          <div>
            <div className="badge" style={{ marginBottom: 8, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <School size={16} /> Colegio Ateneo
            </div>
            <h1 style={{ margin: 0, fontSize: '2rem' }}>Formación integral con excelencia académica</h1>
            <p style={{ color: '#64748b', marginTop: 8 }}>
              Bienvenido al portal del colegio Ateneo. Aquí encontrarás información general del colegio y podrás realizar el pago de la mensualidad de forma segura y rápida.
            </p>
            <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
              <button className="button" onClick={() => setShowServices(true)}>Ver servicios</button>
              {user && (user.role === 'teacher' || user.role === 'admin') && (
                <button className="button button-outline" onClick={() => navigate('/profesor')}>
                  Panel de profesores
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* MODAL: Servicios */}
      {showServices && (
        <div className="modal-backdrop" onClick={() => setShowServices(false)}>
          <div className="modal-window" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">Servicios</div>
              <button className="modal-close" onClick={() => setShowServices(false)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="grid">
                {/* Mensualidad en modal */}
                <div className="card" style={{ padding: 16 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div className="icon" style={{ width: 42, height: 42, borderRadius: 10, background: '#eef2ff', color: '#1d4ed8', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                      <BookOpen size={22} />
                    </div>
                    <div>
                      <h3 style={{ margin: 0 }}>{MENSUALIDAD.name}</h3>
                      <small style={{ color: '#64748b' }}>{MENSUALIDAD.description}</small>
                    </div>
                  </div>

                  <div style={{ marginTop: 12 }}>
                    <label style={{ display: 'block', marginBottom: 8 }}>Selecciona los meses a pagar:</label>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 12 }}>
                      {MESES.map((month) => {
                        const monthPassed = isMonthPassed(month)
                        const statusInfo = getMonthStatusInfo(month)
                        const isSelected = selectedMonths.includes(month)
                        const isPaid = statusInfo.disabled && monthStatus[month] === 'completed'
                        
                        return (
                          <button
                            key={month}
                            onClick={() => {
                              setErrorMsg('')
                              toggleMonth(month)
                            }}
                            disabled={monthPassed || statusInfo.disabled}
                            title={monthPassed ? 'Este mes ya pasó' : isPaid ? 'Este mes ya está pagado' : ''}
                            style={{
                              padding: '12px 8px',
                              border: isSelected && !isPaid ? `2px solid ${statusInfo.color}` : `2px solid ${statusInfo.border}`,
                              borderRadius: 6,
                              background: isSelected && !isPaid ? statusInfo.bg : isPaid ? statusInfo.bg : monthPassed ? '#f3f4f6' : '#ffffff',
                              color: isSelected && !isPaid ? statusInfo.color : statusInfo.color,
                              fontWeight: isSelected || isPaid ? '600' : '400',
                              cursor: monthPassed || statusInfo.disabled ? 'not-allowed' : 'pointer',
                              opacity: monthPassed || statusInfo.disabled ? 0.6 : 1,
                              transition: 'all 0.2s',
                              textDecoration: monthPassed ? 'line-through' : 'none',
                              fontSize: '0.9rem'
                            }}
                          >
                            <div style={{ fontSize: '0.75rem', color: statusInfo.color, minHeight: 16 }}>
                              {isPaid ? '✓ Pagado' : monthPassed ? 'Pasado' : monthStatus[month] === 'pending' ? '⏳' : monthStatus[month] === 'failed' ? '❌' : ''}
                            </div>
                            <div>{month}</div>
                          </button>
                        )
                      })}
                    </div>
                    {errorMsg && (
                      <div style={{ padding: 8, background: '#fff5f5', border: '1px solid #fecaca', borderRadius: 6, marginBottom: 12, fontSize: '0.9rem', color: '#b91c1c' }}>
                        {errorMsg}
                      </div>
                    )}
                    {selectedMonths.length > 0 && (
                      <div style={{ padding: 8, background: '#f0fdf4', border: '1px solid #86efac', borderRadius: 6, marginBottom: 12, fontSize: '0.9rem', color: '#166534' }}>
                        ✓ {selectedMonths.length} mes{selectedMonths.length !== 1 ? 'es' : ''} seleccionado{selectedMonths.length !== 1 ? 's' : ''}: {selectedMonths.join(', ')}
                      </div>
                    )}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 12, gap: 12, flexWrap: 'wrap' }}>
                    <strong style={{ fontSize: 18 }}>${(MENSUALIDAD.price * selectedMonths.length).toLocaleString('es-CO')}</strong>
                    <button 
                      className="button" 
                      onClick={() => { handlePay(); setShowServices(false); }}
                      disabled={selectedMonths.length === 0}
                      style={{ opacity: selectedMonths.length === 0 ? 0.5 : 1, cursor: selectedMonths.length === 0 ? 'not-allowed' : 'pointer' }}
                    >
                      Mensualidad
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* INFORMACIÓN DEL COLEGIO */}
      <section className="card" style={{ marginBottom: 20 }}>
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <h2 style={{ fontSize: "2rem", marginBottom: "0.5rem", color: "#1e293b" }}>Bienvenidos al Colegio Ateneo</h2>
          <p style={{ maxWidth: "700px", margin: "0 auto", color: "#64748b", fontSize: "1.1rem" }}>
            Especialistas en educación flexible y acelerada. Ofrecemos bachillerato por ciclos desde grado <strong>Sexto hasta Once</strong>, permitiéndote cursar <strong>dos grados en un año</strong>. Nuestra modalidad sabatina es ideal para quienes buscan calidad académica optimizando su tiempo.
          </p>
        </div>

        <div className="grid" style={{ marginBottom: "2rem" }}>
          <div className="card" style={{ background: "#f8fafc", border: "none" }}>
            <h3 style={{ color: "#1f7a4a", borderBottom: "2px solid #1f7a4a", paddingBottom: "0.5rem", display: "inline-block" }}>Nuestra Misión</h3>
            <p style={{ color: "#475569", lineHeight: "1.6" }}>
              Brindar una oportunidad educativa de calidad a jóvenes y adultos mediante un modelo pedagógico flexible (2 años en 1), fomentando el desarrollo personal, académico y laboral de nuestros estudiantes en horarios sabatinos.
            </p>
          </div>
          <div className="card" style={{ background: "#f8fafc", border: "none" }}>
            <h3 style={{ color: "#0b63f6", borderBottom: "2px solid #0b63f6", paddingBottom: "0.5rem", display: "inline-block" }}>Nuestra Visión</h3>
            <p style={{ color: "#475569", lineHeight: "1.6" }}>
              Ser la institución líder en validación y bachillerato por ciclos de la región, reconocidos por nuestra capacidad de graduar bachilleres competentes y preparados para la educación superior o el mundo laboral en menor tiempo.
            </p>
          </div>
        </div>

        <h3 style={{ textAlign: "center", marginBottom: "1.5rem", fontSize: "1.5rem" }}>¿Por qué elegirnos?</h3>
        <div className="grid">
          <div className="card" style={{ padding: 20, textAlign: "center", transition: "transform 0.2s" }}>
            <div style={{ marginBottom: "1rem", color: "#0b63f6", display: "flex", justifyContent: "center" }}>
              <ChevronsRight size={48} />
            </div>
            <h3 style={{ margin: '8px 0 8px', color: "#1e293b" }}>2 Años en 1</h3>
            <p style={{ color: '#64748b', fontSize: "0.95rem" }}>
              Optimiza tu tiempo completando dos grados académicos en un solo ciclo anual. Avanza rápido sin sacrificar calidad.
            </p>
          </div>
          <div className="card" style={{ padding: 20, textAlign: "center", transition: "transform 0.2s" }}>
            <div style={{ marginBottom: "1rem", color: "#0b63f6", display: "flex", justifyContent: "center" }}>
              <Calendar size={48} />
            </div>
            <h3 style={{ margin: '8px 0 8px', color: "#1e293b" }}>Modalidad Sabatina</h3>
            <p style={{ color: '#64748b', fontSize: "0.95rem" }}>
              Clases presenciales los sábados, diseñadas para quienes trabajan o tienen otras ocupaciones durante la semana.
            </p>
          </div>
          <div className="card" style={{ padding: 20, textAlign: "center", transition: "transform 0.2s" }}>
            <div style={{ marginBottom: "1rem", color: "#0b63f6", display: "flex", justifyContent: "center" }}>
              <GraduationCap size={48} />
            </div>
            <h3 style={{ margin: '8px 0 8px', color: "#1e293b" }}>Grados 6° a 11°</h3>
            <p style={{ color: '#64748b', fontSize: "0.95rem" }}>
              Cobertura completa del bachillerato. Ingresa en el ciclo que te corresponda y culmina tus estudios hasta obtener tu título.
            </p>
          </div>
        </div>
      </section>

      {/* SERVICIOS */}
      <section id="servicios" className="card" style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h2 style={{ marginTop: 0 }}>Servicios</h2>
          <span className="badge" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <CreditCard size={16} /> Pagos
          </span>
        </div>

        <div className="grid">
          {/* Mensualidad */}
          <div className="card" style={{ padding: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div className="icon" style={{ width: 42, height: 42, borderRadius: 10, background: '#eef2ff', color: '#1d4ed8', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                <BookOpen size={22} />
              </div>
              <div>
                <h3 style={{ margin: 0 }}>{MENSUALIDAD.name}</h3>
                <small style={{ color: '#64748b' }}>{MENSUALIDAD.description}</small>
              </div>
            </div>

            <div style={{ marginTop: 12 }}>
              <label style={{ display: 'block', marginBottom: 8 }}>Selecciona los meses a pagar (máximo 1 por mes):</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 12 }}>
                {MESES.map((month) => {
                  const monthPassed = isMonthPassed(month)
                  return (
                    <button
                      key={month}
                      onClick={() => {
                        setErrorMsg('')
                        toggleMonth(month)
                      }}
                      disabled={monthPassed}
                      title={monthPassed ? 'Este mes ya pasó' : ''}
                      style={{
                        padding: '10px 8px',
                        border: monthPassed ? '2px solid #d1d5db' : selectedMonths.includes(month) ? '2px solid #0b63f6' : '2px solid #e2e8f0',
                        borderRadius: 6,
                        background: monthPassed ? '#f3f4f6' : selectedMonths.includes(month) ? '#eef2ff' : '#ffffff',
                        color: monthPassed ? '#9ca3af' : selectedMonths.includes(month) ? '#0b63f6' : '#475569',
                        fontWeight: selectedMonths.includes(month) ? '600' : '400',
                        cursor: monthPassed ? 'not-allowed' : 'pointer',
                        opacity: monthPassed ? 0.6 : 1,
                        transition: 'all 0.2s',
                        textDecoration: monthPassed ? 'line-through' : 'none'
                      }}
                    >
                      {month}
                    </button>
                  )
                })}
              </div>
              {errorMsg && (
                <div style={{ padding: 8, background: '#fff5f5', border: '1px solid #fecaca', borderRadius: 6, marginBottom: 12, fontSize: '0.9rem', color: '#b91c1c' }}>
                  {errorMsg}
                </div>
              )}
              {selectedMonths.length > 0 && (
                <div style={{ padding: 8, background: '#f0fdf4', border: '1px solid #86efac', borderRadius: 6, marginBottom: 12, fontSize: '0.9rem', color: '#166534' }}>
                  ✓ {selectedMonths.length} mes{selectedMonths.length !== 1 ? 'es' : ''} seleccionado{selectedMonths.length !== 1 ? 's' : ''}: {selectedMonths.join(', ')}
                </div>
              )}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 12, gap: 12, flexWrap: 'wrap' }}>
              <strong style={{ fontSize: 18 }}>${(MENSUALIDAD.price * selectedMonths.length).toLocaleString('es-CO')}</strong>
              <button 
                className="button" 
                onClick={handlePay}
                disabled={selectedMonths.length === 0}
                style={{ opacity: selectedMonths.length === 0 ? 0.5 : 1, cursor: selectedMonths.length === 0 ? 'not-allowed' : 'pointer' }}
              >
                Pagar mensualidad
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="card" style={{ textAlign: 'center' }}>
        <h2 style={{ marginTop: 0 }}>¿Necesitas ayuda con tu pago?</h2>
        <p style={{ color: '#64748b' }}>Si tienes dudas, comunícate con Secretaría para recibir orientación.</p>
        <div className="mt-12">
          <button className="button button--secondary" onClick={() => navigate('/checkout')}>Ir al Checkout</button>
        </div>
      </section>
      {/* Modal Prompt Login */}
      {showLoginPrompt && (
        <div className="modal-backdrop">
          <div className="modal-window" style={{ maxWidth: 480, textAlign: 'center', padding: '48px 32px' }}>
            <h2 style={{ fontSize: '28px', margin: '0 0 12px 0', color: '#1e293b' }}>Accede a Ateneo</h2>
            <p style={{ color: '#64748b', fontSize: '16px', marginBottom: 32, lineHeight: 1.6 }}>
              Inicia sesión si ya tienes cuenta o crea una nueva para acceder a todos nuestros servicios educativos.
            </p>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
              <Link to="/login" style={{ textDecoration: 'none' }}>
                <button 
                  className="button" 
                  style={{ 
                    width: '100%',
                    padding: '12px 16px',
                    fontSize: '16px',
                    fontWeight: '600',
                    border: 'none',
                    borderRadius: '8px',
                    background: '#1f7a4a',
                    color: 'white',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    boxShadow: '0 2px 8px rgba(31, 122, 74, 0.2)'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = '#1a6a41';
                    e.target.style.boxShadow = '0 4px 12px rgba(31, 122, 74, 0.3)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = '#1f7a4a';
                    e.target.style.boxShadow = '0 2px 8px rgba(31, 122, 74, 0.2)';
                  }}
                >
                  Iniciar sesión
                </button>
              </Link>
              <Link to="/register" style={{ textDecoration: 'none' }}>
                <button 
                  className="button" 
                  style={{ 
                    width: '100%',
                    padding: '12px 16px',
                    fontSize: '16px',
                    fontWeight: '600',
                    border: '2px solid #1f7a4a',
                    borderRadius: '8px',
                    background: 'white',
                    color: '#1f7a4a',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = '#f0f9f5';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = 'white';
                  }}
                >
                  Registrarse
                </button>
              </Link>
            </div>

            <button
              onClick={() => setShowLoginPrompt(false)}
              style={{
                width: '100%',
                padding: '10px 16px',
                fontSize: '14px',
                fontWeight: '500',
                border: 'none',
                borderRadius: '8px',
                background: 'transparent',
                color: '#64748b',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.color = '#1e293b';
              }}
              onMouseLeave={(e) => {
                e.target.style.color = '#64748b';
              }}
            >
              Continuar como invitado
            </button>

            <p style={{ color: '#94a3b8', fontSize: '13px', marginTop: 24 }}>
              Puedes explorar sin cuenta, pero necesitarás acceso para realizar pagos.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
