import { defineStore } from 'pinia'
import { postData } from '@/services/apiService'
import axiosInstance from '@/plugins/axios'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: localStorage.getItem('token') || null,
    user: JSON.parse(localStorage.getItem('user')) || null,
    loading: false
  }),

  getters: {
    isAuthenticated: (state) => !!state.token,
    isAdmin: (state) => state.user?.rol === 'admin',
    nombreUsuario: (state) => state.user?.nombre || 'Usuario'
  },

  actions: {
    async login(email, password) {
      this.loading = true
      try {
        const data = await postData('/auth/login', { email, password })

        this.token = data.token
        this.user = data.usuario

        localStorage.setItem('token', this.token)
        localStorage.setItem('user', JSON.stringify(this.user))

        axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${this.token}`

        return { success: true }
      } catch (error) {
        return {
          success: false,
          message: error.response?.data?.mensaje || 'Error al conectar con el servidor'
        }
      } finally {
        this.loading = false
      }
    },

    logout() {
      this.token = null
      this.user = null
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      delete axiosInstance.defaults.headers.common['Authorization']
      window.location.reload()
    },

    initializeAuth() {
      if (this.token) {
        axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${this.token}`
      }
    }
  }
})
