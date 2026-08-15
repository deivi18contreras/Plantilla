import axios from 'axios'

const axiosInstance = axios.create({
  baseURL: 'http://127.0.0.1:3000/api',
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' }
})

// Interceptor: agrega el token automáticamente en cada request
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Interceptor: si el servidor responde 401 en rutas protegidas, limpia sesión
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    const url = error.config?.url || ''
    const es401 = error.response?.status === 401
    const esRutaAuth = url.includes('/auth/')

    // Solo redirige al login si el 401 viene de una ruta protegida (no de login/registro)
    if (es401 && !esRutaAuth) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      // Mostrar mensaje claro antes de redirigir
      const msg = error.response?.data?.mensaje || 'Sesión expirada. Inicia sesión nuevamente.'
      window.__sessionExpiredMsg = msg
      window.location.href = '/#/login'
    }
    return Promise.reject(error)
  }
)

export default axiosInstance
