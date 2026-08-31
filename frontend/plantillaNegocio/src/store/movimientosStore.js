import { defineStore } from 'pinia'
import { getData } from '@/services/apiService'

export const useMovimientosStore = defineStore('movimientos', {
  state: () => ({
    movimientos: [],
    loading: false
  }),

  getters: {
    totalRecaudoHoy: (state) =>
      state.movimientos
        .filter(m => m.tipo === 'recaudo')
        .reduce((sum, m) => sum + m.monto, 0),

    totalGastoHoy: (state) =>
      state.movimientos
        .filter(m => m.tipo === 'gasto')
        .reduce((sum, m) => sum + m.monto, 0),

    netoHoy: (state) => {
      const recaudos = state.movimientos.filter(m => m.tipo === 'recaudo').reduce((s, m) => s + m.monto, 0)
      const gastos = state.movimientos.filter(m => m.tipo === 'gasto').reduce((s, m) => s + m.monto, 0)
      return recaudos - gastos
    },

    ultimos5: (state) => state.movimientos.slice(0, 5)
  },

  actions: {
    async fetchMovimientos() {
      this.loading = true
      try {
        this.movimientos = await getData('/movimientos')
      } catch (error) {
        console.error('Error al cargar movimientos:', error)
      } finally {
        this.loading = false
      }
    },

    async fetchPorFecha(fecha) {
      this.loading = true
      try {
        this.movimientos = await getData('/movimientos', { fecha })
        const params = fecha ? { fecha } : {}
        this.movimientos = await getData('/movimientos', params)
      } catch (error) {
        console.error('Error al cargar movimientos:', error)
      } finally {
        this.loading = false
      }
    },

    async fetchRango(desde, hasta) {
      this.loading = true
      try {
        this.movimientos = await getData('/movimientos', { desde, hasta })
      } catch (error) {
        console.error('Error al cargar movimientos:', error)
      } finally {
        this.loading = false
      }
    }
  }
})
