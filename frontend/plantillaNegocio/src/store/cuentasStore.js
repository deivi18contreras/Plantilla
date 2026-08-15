import { defineStore } from 'pinia'
import { getData } from '@/services/apiService'

export const useCuentasStore = defineStore('cuentas', {
  state: () => ({
    cuentas: [],
    loading: false
  }),

  getters: {
    totalSaldo: (state) => state.cuentas.reduce((sum, c) => sum + c.saldo, 0),
    saldoPor: (state) => (nombre) => state.cuentas.find(c => c.nombre === nombre)?.saldo ?? 0
  },

  actions: {
    async fetchCuentas() {
      this.loading = true
      try {
        this.cuentas = await getData('/cuentas')
      } catch (error) {
        console.error('Error al cargar cuentas:', error)
      } finally {
        this.loading = false
      }
    }
  }
})
