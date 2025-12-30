import API from './api'

export async function listMyOrders() {
  const token = localStorage.getItem('token')
  const { data } = await API.get('/api/payments/orders', {
    headers: { Authorization: `Bearer ${token}` }
  })
  return data
}

export async function getOrderDetails(reference) {
  const token = localStorage.getItem('token')
  const { data } = await API.get(`/api/payments/orders/${reference}/details`, {
    headers: { Authorization: `Bearer ${token}` }
  })
  return data
}

export async function retryOrder(reference) {
  const token = localStorage.getItem('token')
  const { data } = await API.post(`/api/payments/orders/${reference}/retry`, {}, {
    headers: { Authorization: `Bearer ${token}` }
  })
  return data
}

export async function getOrder(reference) {
  const token = localStorage.getItem('token')
  const { data } = await API.get(`/api/payments/orders/${reference}`, {
    headers: { Authorization: `Bearer ${token}` }
  })
  return data
}
