// src/services/payments.js
import API from './api'

// Inicia un checkout real dependiendo del método
export async function startCheckout({ method, amount, metadata }) {
  const { data } = await API.post('/api/payments/checkout', { method, amount, metadata })
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
    console.warn('Fallo al iniciar checkout real, usando simulación:', e?.message)

    // Simulación como fallback
    await new Promise(r => setTimeout(r, 800))
    const tx = 'ATENEO-' + Date.now()
    return { success: true, transactionId: tx, simulated: true }
  }
}

// Permite a un administrador cambiar el estado de una orden
export async function updateOrderStatus(reference, status) {
  const { data } = await API.patch(`/api/payments/orders/${reference}`, { status });
  return data;
}