import { defineStore } from 'pinia'
import { getData, postData, putData, deleteData } from '@/services/apiService'

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
    },

    // Editar un adelanto
    async editarAdelanto(id, payload) {
      const data = await putData(`/adelantos/${id}`, payload)
      await this.fetchPendientes()
      if (this.todos.length > 0) {
        await this.fetchTodos()
      }
      return data
    },

    // Eliminar un adelanto
    async eliminarAdelanto(id) {
      const data = await deleteData(`/adelantos/${id}`)
      await this.fetchPendientes()
      if (this.todos.length > 0) {
        await this.fetchTodos()
      }
      return data
    },

    // Abonar o pagar un adelanto manualmente
    async abonarManual(id, monto, cuentaDestino = 'Efectivo') {
      const data = await postData(`/adelantos/${id}/abono`, { monto, cuentaDestino })
      await this.fetchPendientes()
      if (this.todos.length > 0) {
        await this.fetchTodos()
      }
      return data
    }
  }
})

