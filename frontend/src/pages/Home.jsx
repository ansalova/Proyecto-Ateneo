import React, { useContext, useState, useEffect } from 'react'
import { CartContext } from '../context/CartContext'
import { AuthContext } from '../context/AuthContext'
import { useNavigate, Link } from "react-router-dom"

const MENSUALIDAD = {
  id: 1,
  name: 'Mensualidad Colegio Ateneo',
  price: 120000,
  image: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=1200&q=80',
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
  const [selectedMonth, setSelectedMonth] = useState(MESES[new Date().getMonth()])
  const [quantity, setQuantity] = useState(1)
  const [showServices, setShowServices] = useState(false)
  const [showLoginPrompt, setShowLoginPrompt] = useState(false)

  useEffect(() => {
    // Si ya cargó y no hay usuario, mostramos el prompt
    if (!loading && !user) {
      setShowLoginPrompt(true)
    }
  }, [loading, user])

  const handlePay = () => {
    for (let i = 0; i < quantity; i++) {
      add({ ...MENSUALIDAD, metadata: { month: selectedMonth } })
    }
    // Redirigimos al checkout para completar datos del estudiante
    navigate('/checkout')
  }

  return (
    <div>
      {/* HERO */}
      <section className="card" style={{ padding: '2rem', marginBottom: 20, background: 'linear-gradient(180deg, #e8fff3, #ffffff)' }}>
        <div className="hero-grid">
          <div>
            <div className="badge" style={{ marginBottom: 8 }}>Colegio Ateneo</div>
            <h1 style={{ margin: 0, fontSize: '2rem' }}>Formación integral con excelencia académica</h1>
            <p style={{ color: '#64748b', marginTop: 8 }}>
              Bienvenido al portal del Colegio Ateneo. Aquí encontrarás información general del colegio y podrás realizar el pago de la mensualidad de forma segura y rápida.
            </p>
            <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
              <button className="button" onClick={() => setShowServices(true)}>Ver servicios</button>
              {user && (user.role === 'teacher' || user.role === 'admin') && (
                <button className="button button-outline" onClick={() => navigate('/profesor')}>
                  Panel Profesor
                </button>
              )}
            </div>
          </div>
          <div className="hero-image">
            <img
              src="/escudo-colegio.png.PNG"
              alt="Escudo Colegio Ateneo"
              style={{ width: 220, height: 'auto', borderRadius: 14, boxShadow: '0 10px 30px rgba(2,6,23,0.08)' }}
            />
          </div>
        </div>
      </section>

      {/* MODAL: Servicios */}
      {showServices && (
        <div className="modal-backdrop" onClick={() => setShowServices(false)}>
          <div className="modal-window" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">Servicios</div>
              <button className="modal-close" onClick={() => setShowServices(false)}>Cerrar</button>
            </div>
            <div className="modal-body">
              <div className="grid">
                {/* Mensualidad en modal */}
                <div className="card" style={{ padding: 16 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div>
                      <h3 style={{ margin: 0 }}>{MENSUALIDAD.name}</h3>
                      <small style={{ color: '#64748b' }}>{MENSUALIDAD.description}</small>
                    </div>
                  </div>

                  <img src={MENSUALIDAD.image} alt="Mensualidad" style={{ width: '100%', borderRadius: 10, marginTop: 12 }} />

                  <div style={{ display: 'flex', gap: 12, marginTop: 12, flexWrap: 'wrap' }}>
                    <div style={{ minWidth: 180, flex: 1 }}>
                      <label>Mes a pagar</label>
                      <select className="input" value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)}>
                        {MESES.map((m) => (
                          <option key={m} value={m}>{m}</option>
                        ))}
                      </select>
                    </div>
                    <div style={{ width: 140 }}>
                      <label>Cantidad de meses</label>
                      <input className="input" type="number" min="1" value={quantity} onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))} />
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 12, gap: 12, flexWrap: 'wrap' }}>
                    <strong style={{ fontSize: 18 }}>${MENSUALIDAD.price.toLocaleString('es-CO')}</strong>
                    <button className="button" onClick={() => { handlePay(); setShowServices(false); }}>Pagar Mensualidad</button>
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
            <div style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>⏩</div>
            <h3 style={{ margin: '8px 0 8px', color: "#1e293b" }}>2 Años en 1</h3>
            <p style={{ color: '#64748b', fontSize: "0.95rem" }}>
              Optimiza tu tiempo completando dos grados académicos en un solo ciclo anual. Avanza rápido sin sacrificar calidad.
            </p>
          </div>
          <div className="card" style={{ padding: 20, textAlign: "center", transition: "transform 0.2s" }}>
            <div style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>📅</div>
            <h3 style={{ margin: '8px 0 8px', color: "#1e293b" }}>Modalidad Sabatina</h3>
            <p style={{ color: '#64748b', fontSize: "0.95rem" }}>
              Clases presenciales los sábados, diseñadas para quienes trabajan o tienen otras ocupaciones durante la semana.
            </p>
          </div>
          <div className="card" style={{ padding: 20, textAlign: "center", transition: "transform 0.2s" }}>
            <div style={{ fontSize: "2.5rem", marginBottom: "1rem" }}></div>
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
          <span className="badge">Pagos</span>
        </div>

        <div className="grid">
          {/* Mensualidad */}
          <div className="card" style={{ padding: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div>
                <h3 style={{ margin: 0 }}>{MENSUALIDAD.name}</h3>
                <small style={{ color: '#64748b' }}>{MENSUALIDAD.description}</small>
              </div>
            </div>

            <img src={MENSUALIDAD.image} alt="Mensualidad" style={{ width: '100%', borderRadius: 10, marginTop: 12 }} />

            <div style={{ display: 'flex', gap: 12, marginTop: 12, flexWrap: 'wrap' }}>
              <div style={{ minWidth: 180, flex: 1 }}>
                <label>Mes a pagar</label>
                <select className="input" value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)}>
                  {MESES.map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>
              <div style={{ width: 140 }}>
                <label>Cantidad de meses</label>
                <input className="input" type="number" min="1" value={quantity} onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))} />
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 12, gap: 12, flexWrap: 'wrap' }}>
              <strong style={{ fontSize: 18 }}>${MENSUALIDAD.price.toLocaleString('es-CO')}</strong>
              <button className="button" onClick={handlePay}>Pagar Mensualidad</button>
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
          <div className="modal-window" style={{ maxWidth: 400, textAlign: 'center' }}>
            <h2>Bienvenido al Colegio Ateneo</h2>
            <p style={{ marginBottom: 20 }}>Por favor, regístrese o inicie sesión para acceder a los servicios.</p>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
              <Link to="/login">
                <button className="button">Iniciar Sesión</button>
              </Link>
              <Link to="/register">
                <button className="button button-outline">Registrarse</button>
              </Link>
            </div>
            <div style={{ marginTop: 20 }}>
              <button 
                onClick={() => setShowLoginPrompt(false)} 
                style={{ background: 'none', border: 'none', color: '#666', cursor: 'pointer', textDecoration: 'underline' }}
              >
                Continuar como invitado
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
