import { useContext, useState } from 'react'
import { CartContext } from '../context/CartContext'
import { useNavigate } from 'react-router-dom'

export default function Checkout() {
  const { items, total } = useContext(CartContext)
  const nav = useNavigate()

  // Campos obligatorios para la mensualidad
  const [studentName, setStudentName] = useState('')
  const [studentId, setStudentId] = useState('')
  const [grade, setGrade] = useState('')
  const [parentEmail, setParentEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  const goToPaymentMethods = async () => {
    if (!items.length) {
      setErrorMsg('El carrito está vacío')
      return
    }
    if (!studentName || !studentId || !grade || !parentEmail) {
      setErrorMsg('Por favor completa los datos del estudiante (nombre, identificación, grado y correo).')
      return
    }

    setLoading(true)
    setErrorMsg('')

    // Preparamos metadata que irá al backend / pasarela
    const metadata = {
      studentName,
      studentId,
      grade,
      parentEmail,
      phone,
      items: items.map(i => ({ id: i.id, name: i.name, qty: i.qty, price: i.price, metadata: i.metadata || {} })),
      total: total()
    }

    // Navegamos a selección de método de pago, llevando amount y metadata
    nav('/pago', { state: { amount: total(), metadata } })
    setLoading(false)
  }

  return (
    <div className="card" style={{ maxWidth: 720, margin: '0 auto' }}>
      <h2>Confirmar pago de mensualidad</h2>

      {items.length === 0 ? (
        <p>No hay mensualidades en el carrito</p>
      ) : (
        <>
          {errorMsg && (
            <div className="card" style={{ background: '#fff5f5', border: '1px solid #fecaca', color: '#b91c1c', marginBottom: 12 }}>
              {errorMsg}
            </div>
          )}
          <div style={{ marginBottom: 12 }}>
            {items.map(i => (
              <div key={i.id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span>{i.name} — {i.metadata?.month || ''} × {i.qty}</span>
                <span>${(i.price * i.qty).toLocaleString('es-CO')}</span>
              </div>
            ))}
          </div>

          <hr />

          <h3>Datos del estudiante</h3>
          <label>Nombre del estudiante</label>
          <input value={studentName} onChange={e => setStudentName(e.target.value)} style={{ width: '100%', padding: 8, marginBottom: 8 }} />

          <label>Documento (C.C.)</label>
          <input value={studentId} onChange={e => setStudentId(e.target.value)} style={{ width: '100%', padding: 8, marginBottom: 8 }} />

          <label>Grado</label>
          <input value={grade} onChange={e => setGrade(e.target.value)} style={{ width: '100%', padding: 8, marginBottom: 8 }} />

          <label>Correo del acudiente</label>
          <input value={parentEmail} onChange={e => setParentEmail(e.target.value)} type="email" style={{ width: '100%', padding: 8, marginBottom: 8 }} />

          <label>Teléfono (opcional)</label>
          <input value={phone} onChange={e => setPhone(e.target.value)} style={{ width: '100%', padding: 8, marginBottom: 8 }} />

          <p style={{ fontWeight: 700 }}>Total a pagar: ${total().toLocaleString('es-CO')}</p>

          <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
            <button className="button" onClick={goToPaymentMethods} disabled={loading}>
              {loading ? 'Preparando...' : 'Elegir método de pago'}
            </button>
          </div>
        </>
      )}
    </div>
  )
}
