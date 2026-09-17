import { defineStore } from 'pinia'
import { getData } from '@/services/apiService'

export const useRemanentesStore = defineStore('remanentes', {
  state: () => ({
    disponibles: [],
    todos: [],
    loading: false
  }),

  getters: {
    totalDisponibleEnSobres: (state) => {
      return (state.disponibles || []).reduce((sum, r) => sum + Number(r.saldoDisponible || 0), 0)
    }
  },

  actions: {
    async fetchDisponibles() {
      this.loading = true
      try {
        const data = await getData('/remanentes/disponibles')
        this.disponibles = Array.isArray(data) ? data : []
      } catch (error) {
        console.error('Error al cargar remanentes disponibles:', error)
        this.disponibles = []
      } finally {
        this.loading = false
      }
    },

    async fetchTodos() {
      this.loading = true
      try {
        const data = await getData('/remanentes')
        this.todos = Array.isArray(data) ? data : []
      } catch (error) {
        console.error('Error al cargar todos los remanentes:', error)
        this.todos = []
      } finally {
        this.loading = false
      }
    }
  }
})

