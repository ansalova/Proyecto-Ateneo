import axios from 'axios'

// Si tienes backend real, coloca aquí la URL.
// Ejemplo: https://mi-backend.com/api
const API = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL || 'http://127.0.0.1:5000'
})

export default API
