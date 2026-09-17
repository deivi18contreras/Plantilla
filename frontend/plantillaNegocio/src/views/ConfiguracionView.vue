<template>
  <div class="dashboard-main-card full-width">

    <!-- ENCABEZADO -->
    <div class="row items-center justify-between q-mb-lg">
      <div>
        <div class="text-h5 text-weight-bolder text-slate-900">Configuraciones</div>
        <div class="text-caption text-slate-500">Ajustes generales, reglas de caja y metas del negocio</div>
      </div>
      <q-btn
        color="primary"
        no-caps
        unelevated
        icon="save"
        label="Guardar cambios"
        class="text-weight-bold"
        style="border-radius: 12px;"
        :loading="guardando"
        @click="guardar"
      />
    </div>

    <!-- GRID DE SECCIONES -->
    <div class="config-grid">

      <!-- TARJETA 1: DATOS DEL NEGOCIO -->
      <div class="card-widget">
        <div class="row items-center q-gutter-x-sm q-mb-md">
          <q-avatar size="36px" color="blue-1" text-color="primary" icon="storefront" />
          <div>
            <div class="text-subtitle1 text-weight-bolder text-slate-900">Identidad del Negocio</div>
            <div class="text-caption text-slate-400">Nombre público y objetivos de facturación</div>
          </div>
        </div>

        <div class="column q-gutter-y-md">
          <div>
            <div class="text-caption text-weight-bold text-slate-700 q-mb-xs">Nombre del establecimiento</div>
            <q-input
              v-model="form.nombreNegocio"
              placeholder="Ej: Pollo Lb"
              borderless
              class="clean-input"
            >
              <template #prepend>
                <q-icon name="store" size="18px" color="slate-400" />
              </template>
            </q-input>
          </div>

          <div>
            <div class="text-caption text-weight-bold text-slate-700 q-mb-xs">Meta de venta diaria sugerida</div>
            <q-input
              v-model.number="form.metaDiaria"
              type="number"
              prefix="$"
              placeholder="0"
              borderless
              class="clean-input"
            >
              <template #prepend>
                <q-icon name="flag" size="18px" color="slate-400" />
              </template>
            </q-input>
            <div class="text-caption text-slate-400 q-mt-xs">
              Alimenta el indicador de progreso en el Dashboard principal.
            </div>
          </div>
        </div>
      </div>

      <!-- TARJETA 2: REGLAS DE CAJA Y EFECTIVO -->
      <div class="card-widget">
        <div class="row items-center q-gutter-x-sm q-mb-md">
          <q-avatar size="36px" color="green-1" text-color="positive" icon="payments" />
          <div>
            <div class="text-subtitle1 text-weight-bolder text-slate-900">Caja y Efectivo</div>
            <div class="text-caption text-slate-400">Valores fijos aplicados al Cierre de Turno</div>
          </div>
        </div>

        <div class="column q-gutter-y-md">
          <div>
            <div class="text-caption text-weight-bold text-slate-700 q-mb-xs">Base fija de caja</div>
            <q-input
              v-model.number="form.baseFija"
              type="number"
              prefix="$"
              borderless
              class="clean-input"
            >
              <template #prepend>
                <q-icon name="lock" size="18px" color="slate-400" />
              </template>
            </q-input>
            <div class="text-caption text-slate-400 q-mt-xs">
              Dinero reservado en caja física. No se cuenta como ganancia neta.
            </div>
          </div>

          <div>
            <div class="text-caption text-weight-bold text-slate-700 q-mb-xs">Aporte de Cadena por defecto</div>
            <q-input
              v-model.number="form.cadenaDefault"
              type="number"
              prefix="$"
              borderless
              class="clean-input"
            >
              <template #prepend>
                <q-icon name="link" size="18px" color="slate-400" />
              </template>
            </q-input>
            <div class="text-caption text-slate-400 q-mt-xs">
              Monto sugerido autocompletado en el formulario de recaudo/cierre.
            </div>
          </div>
        </div>
      </div>

      <!-- TARJETA 3: ACCESOS Y MÓDULOS DE SOPORTE -->
      <div class="card-widget" style="grid-column: 1 / -1;">
        <div class="row items-center q-gutter-x-sm q-mb-md">
          <q-avatar size="36px" color="purple-1" text-color="purple-8" icon="widgets" />
          <div>
            <div class="text-subtitle1 text-weight-bolder text-slate-900">Módulos Complementarios</div>
            <div class="text-caption text-slate-400">Acceso rápido a catálogos y personalización</div>
          </div>
        </div>

        <div class="row q-col-gutter-md">
          <div class="col-12 col-md-4">
            <div
              class="acceso-card cursor-pointer"
              @click="$router.push('/categorias')"
            >
              <div class="row items-center justify-between">
                <div class="row items-center q-gutter-x-sm">
                  <span style="font-size: 24px;">🏷️</span>
                  <div>
                    <div class="text-weight-bold text-slate-900">Categorías</div>
                    <div class="text-caption text-slate-500">Emojis y nombres de gasto</div>
                  </div>
                </div>
                <q-icon name="chevron_right" color="slate-400" size="20px" />
              </div>
            </div>
          </div>

          <div class="col-12 col-md-4">
            <div
              class="acceso-card cursor-pointer"
              @click="$router.push('/usuarios')"
            >
              <div class="row items-center justify-between">
                <div class="row items-center q-gutter-x-sm">
                  <span style="font-size: 24px;">👥</span>
                  <div>
                    <div class="text-weight-bold text-slate-900">Usuarios</div>
                    <div class="text-caption text-slate-500">Roles y accesos al sistema</div>
                  </div>
                </div>
                <q-icon name="chevron_right" color="slate-400" size="20px" />
              </div>
            </div>
          </div>

          <div class="col-12 col-md-4">
            <div
              class="acceso-card cursor-pointer"
              @click="$router.push('/cuentas')"
            >
              <div class="row items-center justify-between">
                <div class="row items-center q-gutter-x-sm">
                  <span style="font-size: 24px;">🏦</span>
                  <div>
                    <div class="text-weight-bold text-slate-900">Cuentas y Bancos</div>
                    <div class="text-caption text-slate-500">Saldos y extractos bancarios</div>
                  </div>
                </div>
                <q-icon name="chevron_right" color="slate-400" size="20px" />
              </div>
            </div>
          </div>
        </div>
      </div>

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
.config-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
  align-items: start;
}
@media (max-width: 768px) {
  .config-grid {
    grid-template-columns: 1fr;
  }
}
.acceso-card {
  background: #f8fafc;
  border: 1.5px solid #e2e8f0;
  border-radius: 14px;
  padding: 14px 16px;
  transition: all 0.15s;
}
.acceso-card:hover {
  background: #f1f5f9;
  border-color: #cbd5e1;
  transform: translateY(-2px);
}
</style>
