import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { getData, putData } from '@/services/apiService'

export const useConfiguracionStore = defineStore('configuracion', () => {
  const baseFija = ref(600000)
  const cadenaDefault = ref(125000)
  const nombreNegocio = ref('Mi Negocio')
  const metaDiaria = ref(0)
  const categorias = ref([])
  const cargando = ref(false)

  // Solo las activas, ordenadas — para usar en GastoView
  const categoriasActivas = computed(() =>
    [...categorias.value]
      .filter(c => c.activa)
      .sort((a, b) => a.orden - b.orden)
  )

  const fetchConfiguracion = async () => {
    try {
      cargando.value = true
      const data = await getData('/configuracion')
      baseFija.value = data.baseFija ?? 600000
      cadenaDefault.value = data.cadenaDefault ?? 125000
      nombreNegocio.value = data.nombreNegocio ?? 'Mi Negocio'
      metaDiaria.value = data.metaDiaria ?? 0
      categorias.value = data.categorias ?? []
    } catch (e) {
      // Si falla, mantiene los valores por defecto
    } finally {
      cargando.value = false
    }
  }

  const guardarConfiguracion = async (datos) => {
    const res = await putData('/configuracion', datos)
    baseFija.value = res.config.baseFija
    cadenaDefault.value = res.config.cadenaDefault
    nombreNegocio.value = res.config.nombreNegocio
    metaDiaria.value = res.config.metaDiaria
    if (res.config.categorias) categorias.value = res.config.categorias
    return res
  }

  return {
    baseFija, cadenaDefault, nombreNegocio, metaDiaria,
    categorias, categoriasActivas,
    cargando, fetchConfiguracion, guardarConfiguracion
  }
})

