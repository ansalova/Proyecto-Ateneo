import React, { useContext, useState } from 'react'
import CartDrawer from '../components/CartDrawer'
import { CartContext } from '../context/CartContext'
import { useNavigate } from "react-router-dom"

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
  const navigate = useNavigate()
  const [selectedMonth, setSelectedMonth] = useState(MESES[new Date().getMonth()])
  const [quantity, setQuantity] = useState(1)
  const [showServices, setShowServices] = useState(false)

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
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr .8fr', gap: 16, alignItems: 'center' }}>
          <div>
            <div className="badge" style={{ marginBottom: 8 }}>🏫 Colegio Ateneo</div>
            <h1 style={{ margin: 0, fontSize: '2rem' }}>Formación integral con excelencia académica</h1>
            <p style={{ color: '#64748b', marginTop: 8 }}>
              Bienvenido al portal del Colegio Ateneo. Aquí encontrarás información general del colegio y podrás realizar el pago de la mensualidad de forma segura y rápida.
            </p>
            <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
              <button className="button" onClick={() => setShowServices(true)}>Ver servicios</button>
            </div>
          </div>
          <div style={{ display: 'none', justifyContent: 'center' }}>
            {/* Imagen opcional o ilustración */}
            <img src={MENSUALIDAD.image} alt="Colegio" style={{ width: '100%', borderRadius: 14, boxShadow: '0 10px 30px rgba(2,6,23,0.08)' }} />
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
                    <div className="icon" style={{ width: 42, height: 42, borderRadius: 10, background: '#eef2ff', color: '#1d4ed8', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>📘</div>
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
        <h2 style={{ marginTop: 0 }}>Sobre el Colegio</h2>
        <p style={{ color: '#64748b' }}>
          [Aquí podrás agregar manualmente la información institucional del colegio: misión, visión, valores, historia, logros académicos y deportivos, instalaciones y contacto].
        </p>
        <div className="grid" style={{ marginTop: 12 }}>
          <div className="card" style={{ padding: 16 }}>
            <div className="badge">🎓 Calidad educativa</div>
            <h3 style={{ margin: '8px 0 4px' }}>Excelencia académica</h3>
            <p style={{ color: '#64748b' }}>Programas orientados a desarrollar competencias y valores para la vida.</p>
          </div>
          <div className="card" style={{ padding: 16 }}>
            <div className="badge">🛡️ Seguridad</div>
            <h3 style={{ margin: '8px 0 4px' }}>Entorno seguro</h3>
            <p style={{ color: '#64748b' }}>Instalaciones con protocolos de seguridad y bienestar estudiantil.</p>
          </div>
          <div className="card" style={{ padding: 16 }}>
            <div className="badge">🤝 Comunidad</div>
            <h3 style={{ margin: '8px 0 4px' }}>Familias y docentes</h3>
            <p style={{ color: '#64748b' }}>Trabajo conjunto entre docentes, estudiantes y familias.</p>
          </div>
        </div>
      </section>

      {/* SERVICIOS */}
      <section id="servicios" className="card" style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h2 style={{ marginTop: 0 }}>Servicios</h2>
          <span className="badge">💳 Pagos</span>
        </div>

        <div className="grid">
          {/* Mensualidad */}
          <div className="card" style={{ padding: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div className="icon" style={{ width: 42, height: 42, borderRadius: 10, background: '#eef2ff', color: '#1d4ed8', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>📘</div>
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

      <CartDrawer />
    </div>
  )
}

