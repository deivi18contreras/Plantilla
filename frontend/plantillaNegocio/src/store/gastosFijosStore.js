import { defineStore } from 'pinia'
import { getData, postData, putData, deleteData } from '@/services/apiService'

export const useGastosFijosStore = defineStore('gastosFijos', {
  state: () => ({
    gastosFijos: [],
    proximos: [],
    loading: false
  }),

  actions: {
    // Carga todos los gastos fijos activos
    async fetchGastosFijos() {
      this.loading = true
      try {
        this.gastosFijos = await getData('/gastos-fijos')
      } catch (error) {
        console.error('Error al cargar gastos fijos:', error)
      } finally {
        this.loading = false
      }
    },

    // Carga los gastos que vencen en los próximos N días (para el dashboard)
    async fetchProximos(dias = 7) {
      try {
        this.proximos = await getData('/gastos-fijos/proximos', { dias })
      } catch (error) {
        console.error('Error al cargar gastos próximos:', error)
      }
    },

    // Crea un nuevo gasto fijo
    async crearGastoFijo(payload) {
      const data = await postData('/gastos-fijos', payload)
      await this.fetchGastosFijos()
      return data
    },

    // Edita un gasto fijo existente
    async editarGastoFijo(id, payload) {
      const data = await putData(`/gastos-fijos/${id}`, payload)
      await this.fetchGastosFijos()
      return data
    },

    // Confirma el pago de un gasto fijo (crea el movimiento y recalcula fecha)
    async confirmarPago(id) {
      const data = await postData(`/gastos-fijos/${id}/confirmar-pago`, {})
      await this.fetchGastosFijos()
      await this.fetchProximos()
      return data
    },

    // Desactiva un gasto fijo
    async desactivarGastoFijo(id) {
      const data = await deleteData(`/gastos-fijos/${id}`)
      await this.fetchGastosFijos()
      return data
    }
  }
})

