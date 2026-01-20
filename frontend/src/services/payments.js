// src/services/payments.js
import API from './api'

// Inicia un checkout real dependiendo del método
export async function startCheckout({ method, amount, metadata }) {
  const token = localStorage.getItem('token')
  const { data } = await API.post('/api/payments/checkout', { method, amount, metadata }, {
    headers: { Authorization: `Bearer ${token}` }
  })
  return data
}

// Para compatibilidad con código existente: simula o redirige si hay backend
export async function processPayment({ amount, metadata, method = 'tarjeta' }) {
  try {
    const baseUrl = API.defaults.baseURL
    if (!baseUrl) throw new Error('Backend URL no configurada')

    const res = await startCheckout({ method, amount, metadata })

    if (res.provider === 'mercadopago' && res.redirectUrl) {
      // Redirige al checkout de Mercado Pago
      window.location.href = res.redirectUrl
      return { success: true, redirected: true, externalReference: res.externalReference }
    }

    // Métodos offline devuelven instrucciones y referencia
    if (res.provider === 'offline') {
      return { success: true, offline: true, ...res }
    }

    return { success: false, message: 'Respuesta desconocida del servidor' }
  } catch (e) {
    console.error('Fallo al iniciar checkout real:', e?.message)
    throw e
  }
}
