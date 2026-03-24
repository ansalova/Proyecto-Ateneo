// src/services/payments.js
import API from './api'

// Inicia un checkout real dependiendo del método
export async function startCheckout({ method, amount, metadata }) {
  const { data } = await API.post('/api/payments/checkout', { method, amount, metadata })
  return data
}

// Para compatibilidad con código existente: simula o redirige si hay backend
export async function processPayment({ amount, metadata, method = 'nequi' }) {
  try {
    const baseUrl = API.defaults.baseURL
    if (!baseUrl) throw new Error('Backend URL no configurada')

    const res = await startCheckout({ method, amount, metadata })

    // Métodos offline devuelven instrucciones y referencia
    if (res.provider === 'offline') {
      return { success: true, offline: true, ...res }
    }

    return { success: false, message: 'Respuesta desconocida del servidor' }
  } catch (e) {
    // Capturar error del servidor (ej: meses pasados)
    const errorMessage = e?.response?.data?.error || e?.message || 'Error al procesar el pago'
    
    if (e?.response?.status === 400) {
      // Error de validación del servidor
      return { success: false, message: errorMessage }
    }

    console.warn('Fallo al iniciar checkout real:', errorMessage)
    return { success: false, message: errorMessage }
  }
}

// Permite a un administrador cambiar el estado de una orden
export async function updateOrderStatus(reference, status) {
  const { data } = await API.patch(`/api/payments/orders/${reference}`, { status });
  return data;
}