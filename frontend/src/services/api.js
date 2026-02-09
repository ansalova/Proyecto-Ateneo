import axios from 'axios'

// Si tienes backend real, coloca aquí la URL.
// Ejemplo: https://mi-backend.com/api
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000'

console.log('Backend URL:', BACKEND_URL)

const API = axios.create({
  baseURL: BACKEND_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Interceptor para manejar errores globales
API.interceptors.response.use(
  response => response,
  error => {
    console.error('API Error:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
      code: error.code
    })
    
    if (error.response?.status === 401) {
      console.warn('Token expirado o inválido - redirigiendo al login');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default API

