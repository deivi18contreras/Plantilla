import { defineStore } from 'pinia'
import { getData, putData } from '@/services/apiService'

export const useAhorrosStore = defineStore('ahorros', {
  state: () => ({
    ahorros: [],
    totalAcumulado: 0,
    loading: false
  }),

  actions: {
    async fetchAhorros() {
      this.loading = true
      try {
        const data = await getData('/ahorros')
        this.ahorros = data.ahorros
        this.totalAcumulado = data.totalAcumulado
      } catch (error) {
        console.error('Error al cargar ahorros:', error)
      } finally {
        this.loading = false
      }
    },

    async editarNotas(id, notas) {
      const data = await putData(`/ahorros/${id}/notas`, { notas })
      await this.fetchAhorros()
      return data
    }
  }
})
