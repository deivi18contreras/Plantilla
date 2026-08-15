<template>
  <div class="row justify-center q-pa-md">
    <div class="card-widget" style="max-width: 560px; width: 100%;">

      <div class="text-h5 text-weight-bolder text-slate-900 q-mb-xs">⚙️ Configuraciones</div>
      <div class="text-caption text-slate-500 q-mb-lg">Solo el administrador puede modificar estos valores</div>

      <!-- SECCIÓN: CAJA Y EFECTIVO -->
      <div class="text-caption text-weight-bold text-blue-7 text-uppercase q-mb-sm" style="letter-spacing: 1px;">
        💰 Caja y Efectivo
      </div>
      <div class="bg-white q-mb-lg" style="border-radius: 16px; border: 1px solid #e2e8f0;">
        <div class="q-pa-md">
          <div class="config-row">
            <div>
              <div class="text-weight-bold text-slate-800">Base fija de la caja</div>
              <div class="text-caption text-slate-500">Plata que siempre debe quedar en caja al cerrar</div>
            </div>
            <q-input
              v-model.number="form.baseFija"
              type="number"
              prefix="$"
              dense
              borderless
              class="clean-input config-input"
            />
          </div>
        </div>
        <q-separator />
        <div class="q-pa-md">
          <div class="config-row">
            <div>
              <div class="text-weight-bold text-slate-800">Cadena por defecto</div>
              <div class="text-caption text-slate-500">Valor inicial del campo cadena en el cierre</div>
            </div>
            <q-input
              v-model.number="form.cadenaDefault"
              type="number"
              prefix="$"
              dense
              borderless
              class="clean-input config-input"
            />
          </div>
        </div>
      </div>

      <!-- SECCIÓN: NEGOCIO -->
      <div class="text-caption text-weight-bold text-blue-7 text-uppercase q-mb-sm" style="letter-spacing: 1px;">
        🏪 Negocio
      </div>
      <div class="bg-white q-mb-lg" style="border-radius: 16px; border: 1px solid #e2e8f0;">
        <div class="q-pa-md">
          <div class="config-row">
            <div>
              <div class="text-weight-bold text-slate-800">Nombre del negocio</div>
              <div class="text-caption text-slate-500">Se muestra en los reportes compartidos</div>
            </div>
            <q-input
              v-model="form.nombreNegocio"
              dense
              borderless
              class="clean-input config-input"
              placeholder="Mi Negocio"
            />
          </div>
        </div>
        <q-separator />
        <div class="q-pa-md">
          <div class="config-row">
            <div>
              <div class="text-weight-bold text-slate-800">Meta de venta diaria</div>
              <div class="text-caption text-slate-500">Objetivo de ventas por día (dashboard)</div>
            </div>
            <q-input
              v-model.number="form.metaDiaria"
              type="number"
              prefix="$"
              dense
              borderless
              class="clean-input config-input"
              placeholder="0"
            />
          </div>
        </div>
      </div>

      <!-- SECCIÓN: ACCESOS RÁPIDOS -->
      <div class="text-caption text-weight-bold text-blue-7 text-uppercase q-mb-sm" style="letter-spacing: 1px;">
        🔗 Accesos rápidos
      </div>
      <div
        class="row items-center justify-between q-pa-md q-mb-lg cursor-pointer bg-white"
        style="border-radius: 16px; border: 1px solid #e2e8f0;"
        @click="$router.push('/categorias')"
      >
        <div>
          <div class="text-weight-bold text-slate-800">🏷️ Gestionar Categorías de Gasto</div>
          <div class="text-caption text-slate-500">Agregar, eliminar o cambiar emojis de categorías</div>
        </div>
        <q-icon name="chevron_right" color="slate-400" size="24px" />
      </div>

      <!-- INFO -->
      <div class="q-pa-sm q-mb-lg text-caption text-slate-500" style="background: #f0f9ff; border-radius: 12px; border: 1px solid #bae6fd;">
        💡 Estos valores se aplican automáticamente en el Cierre de Turno. No afectan los registros anteriores.
      </div>

      <!-- BOTÓN GUARDAR -->
      <button class="btn-primary-custom" :disabled="guardando" @click="guardar">
        {{ guardando ? 'Guardando...' : '💾 Guardar cambios' }}
      </button>

    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { useConfiguracionStore } from '@/store/configuracionStore'

const $q = useQuasar()
const configStore = useConfiguracionStore()
const guardando = ref(false)

const form = ref({
  baseFija: 600000,
  cadenaDefault: 125000,
  nombreNegocio: 'Mi Negocio',
  metaDiaria: 0
})

onMounted(async () => {
  await configStore.fetchConfiguracion()
  form.value = {
    baseFija: configStore.baseFija,
    cadenaDefault: configStore.cadenaDefault,
    nombreNegocio: configStore.nombreNegocio,
    metaDiaria: configStore.metaDiaria
  }
})

const guardar = async () => {
  guardando.value = true
  try {
    await configStore.guardarConfiguracion(form.value)
    $q.notify({ type: 'positive', message: '✅ Configuración guardada correctamente' })
  } catch (e) {
    $q.notify({ type: 'negative', message: '❌ Error al guardar la configuración' })
  } finally {
    guardando.value = false
  }
}
</script>

<style scoped>
/* En desktop: label a la izquierda, input a la derecha */
.config-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}
.config-input {
  max-width: 160px;
  min-width: 100px;
  text-align: right;
}
/* En mobile: apilan verticalmente */
@media (max-width: 480px) {
  .config-row {
    flex-direction: column;
    align-items: flex-start;
  }
  .config-input {
    max-width: 100%;
    width: 100%;
  }
}
</style>
