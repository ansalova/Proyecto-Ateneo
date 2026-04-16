import axios from 'axios'

// Si tienes backend real, coloca aquí la URL (sin '/api').
// Ejemplo: http://localhost:5000
let BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000'
try { BACKEND_URL = BACKEND_URL.replace(/\/$/, '') } catch(e) {}
console.log('Backend URL:', BACKEND_URL)

const API = axios.create({
  baseURL: BACKEND_URL + '/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Añadir token automáticamente desde localStorage en cada petición
API.interceptors.request.use(
  (config) => {
    try {
      const token = localStorage.getItem('token')
      if (token) {
        config.headers = config.headers || {}
        config.headers.Authorization = `Bearer ${token}`
      }
      // Forzar no caché para peticiones GET
      if (config.method === 'get' || config.method === 'GET') {
        config.headers['Cache-Control'] = 'no-cache, no-store, must-revalidate'
        config.headers['Pragma'] = 'no-cache'
        config.headers['Expires'] = '0'
      }
    } catch (e) {
      // localStorage puede fallar en algunos entornos de prueba; ignorar
    }
    return config
  },
  (error) => Promise.reject(error)
)
// Retry logic para peticiones fallidas
const MAX_RETRIES = 3
const RETRY_DELAY = 1000 // ms

API.interceptors.response.use(
  response => response,
  async (error) => {
    const config = error.config
    
    console.error('API Error:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
      code: error.code
    })
    
    // Manejar errores de autenticación
    if (error.response?.status === 401) {
      console.warn('Token expirado o inválido - redirigiendo al login');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    
    // Retry en errores de conexión o timeout (no en errores 4xx/5xx del servidor)
    if (!config.__retryCount) {
      config.__retryCount = 0
    }
    
    // Solo reintentar en conexión perdida, timeout, o errores 5xx
    const shouldRetry = 
      (error.code === 'ECONNABORTED' || 
       error.code === 'ECONNREFUSED' ||
       error.code === 'ERR_NETWORK' ||
       error.response?.status >= 500) &&
      config.__retryCount < MAX_RETRIES
    
    if (shouldRetry) {
      config.__retryCount += 1
      console.warn(`Reintentando petición (${config.__retryCount}/${MAX_RETRIES})...`)
      
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * config.__retryCount))
      return API(config)
    }
    
    return Promise.reject(error);
  }
);

export default API
export { BACKEND_URL }

