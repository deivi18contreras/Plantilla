import { defineStore } from 'pinia'
import { getData, postData } from '@/services/apiService'

export const useAdelantosStore = defineStore('adelantos', {
  state: () => ({
    pendientes: [],
    totalPendiente: 0,
    todos: [],
    loading: false
  }),

  actions: {
    // Carga los adelantos pendientes (para el dashboard)
    async fetchPendientes() {
      this.loading = true
      try {
        const data = await getData('/adelantos/pendientes')
        this.pendientes = data.adelantos
        this.totalPendiente = data.totalPendiente
      } catch (error) {
        console.error('Error al cargar adelantos pendientes:', error)
      } finally {
        this.loading = false
      }
    },

    // Carga todos los adelantos (historial completo)
    async fetchTodos() {
      this.loading = true
      try {
        this.todos = await getData('/adelantos')
      } catch (error) {
        console.error('Error al cargar adelantos:', error)
      } finally {
        this.loading = false
      }
    },

    // Registra un nuevo adelanto
    async registrarAdelanto(payload) {
      const data = await postData('/adelantos', payload)
      // Refrescar la lista después de registrar
      await this.fetchPendientes()
      return data
    }
  }
})

