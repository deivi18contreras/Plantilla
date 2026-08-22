<template>
  <q-dialog
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
    position="right"
    maximized
    transition-show="slide-left"
    transition-hide="slide-right"
  >
    <q-card style="width: 440px; max-width: 100vw; height: 100vh; border-radius: 0; background: #ffffff;" class="column no-wrap shadow-24">

      <!-- HEADER DEL PANEL LATERAL -->
      <q-card-section class="row items-center justify-between q-pa-md border-b border-slate-100" style="border-bottom: 1px solid #e2e8f0; background: #fafbfc;">
        <div class="row items-center q-gutter-x-sm">
          <q-avatar size="36px" color="blue-1" text-color="blue-9" icon="edit_note" class="text-weight-bold" />
          <div>
            <div class="text-subtitle1 text-weight-bolder text-slate-900">Editar Cierre de Caja</div>
            <div class="text-caption text-slate-500 text-capitalize">{{ fechaLarga }}</div>
          </div>
        </div>
        <q-btn flat round icon="close" size="sm" color="slate-500" v-close-popup />
      </q-card-section>

      <!-- CUERPO DEL PANEL CON SCROLL -->
      <q-card-section class="col overflow-auto q-pa-md column q-gutter-y-md">

        <!-- SECCIÓN 1: EFECTIVO -->
        <div>
          <div class="row items-center justify-between q-mb-xs">
            <span class="text-caption text-weight-bolder text-slate-800 text-uppercase" style="letter-spacing: 0.5px;">💵 Conteo de Efectivo</span>
            <span class="text-caption text-weight-bold text-blue-7">Base fija: {{ formatCOP(BASE_EFECTIVO) }}</span>
          </div>

          <div class="q-mb-sm">
            <div class="text-caption text-slate-500 q-mb-xs">Dinero físico en caja:</div>
            <q-input
              v-model="form.efectivoContado"
              type="number"
              placeholder="$ 0"
              prefix="$"
              borderless
              class="clean-input"
            />
          </div>

          <div class="q-mb-sm">
            <div class="text-caption text-slate-500 q-mb-xs">Cadena apartada (se resta del efectivo):</div>
            <q-input
              v-model="form.cadena"
              type="number"
              placeholder="$ 0"
              prefix="$"
              borderless
              class="clean-input"
            />
          </div>

          <!-- Recaudo Efectivo Neto Calculado -->
          <div class="row items-center justify-between q-pa-sm bg-slate-50" style="border-radius: 12px; border: 1px solid #e2e8f0;">
            <span class="text-caption text-slate-600 font-medium">Recaudo Efectivo Neto:</span>
            <span class="text-subtitle2 text-weight-bolder text-green-7">{{ formatCOP(recaudoEfectivoNeto) }}</span>
          </div>
        </div>

        <q-separator style="opacity: 0.6;" />

        <!-- SECCIÓN 2: DIGITALES -->
        <div>
          <div class="text-caption text-weight-bolder text-slate-800 text-uppercase q-mb-xs" style="letter-spacing: 0.5px;">📱 Transacciones Digitales</div>

          <div class="row q-col-gutter-sm">
            <div class="col-6">
              <div class="text-caption text-slate-500 q-mb-xs">Nequi:</div>
              <q-input
                v-model="form.recaudoNequi"
                type="number"
                placeholder="$ 0"
                prefix="$"
                borderless
                class="clean-input"
              />
            </div>
            <div class="col-6">
              <div class="text-caption text-slate-500 q-mb-xs">Bancolombia:</div>
              <q-input
                v-model="form.recaudoBancolombia"
                type="number"
                placeholder="$ 0"
                prefix="$"
                borderless
                class="clean-input"
              />
            </div>
          </div>
        </div>

        <q-separator style="opacity: 0.6;" />

        <!-- SECCIÓN 3: OTROS AJUSTES -->
        <div>
          <div class="text-caption text-weight-bolder text-slate-800 text-uppercase q-mb-xs" style="letter-spacing: 0.5px;">⚡ Otros Ajustes</div>
          <div class="text-caption text-slate-500 q-mb-xs">Gastos con plata externa (opcional):</div>
          <q-input
            v-model="form.gastosExternos"
            type="number"
            placeholder="$ 0"
            prefix="$"
            borderless
            class="clean-input"
          />
        </div>

        <q-separator style="opacity: 0.6;" />

        <!-- SECCIÓN 4: NOTAS Y OBSERVACIONES (MULTILÍNEA CON ENTER) -->
        <div>
          <div class="text-caption text-weight-bolder text-slate-800 text-uppercase q-mb-xs" style="letter-spacing: 0.5px;">📝 Notas y Observaciones</div>
          <div class="text-caption text-slate-500 q-mb-xs">Escribe notas detalladas (presiona Enter para saltar renglón):</div>
          <q-input
            v-model="form.observaciones"
            type="textarea"
            rows="4"
            placeholder="Añade observaciones adicionales del cierre aquí..."
            outlined
            class="full-width"
            style="border-radius: 14px; font-size: 14px;"
          />
        </div>

      </q-card-section>

      <!-- FOOTER CON RESUMEN Y BOTÓN GUARDAR (FIJADO ABAJO) -->
      <q-card-section class="q-pa-md border-t border-slate-100" style="border-top: 1px solid #e2e8f0; background: #ffffff;">

        <!-- CAJA DE RESUMEN -->
        <div class="q-pa-sm q-mb-md" style="border-radius: 14px; background: #0f172a; color: white;">
          <div class="row items-center justify-between text-caption q-mb-xs">
            <span class="text-slate-300">Cierre Total:</span>
            <span class="text-weight-bold text-blue-4">{{ formatCOP(totalCierre) }}</span>
          </div>
          <div class="row items-center justify-between text-caption q-mb-xs">
            <span class="text-slate-300">Gastos del día:</span>
            <span class="text-weight-bold text-red-4">- {{ formatCOP(gastosReales) }}</span>
          </div>
          <q-separator dark class="q-my-xs" style="opacity: 0.2;" />
          <div class="row items-center justify-between">
            <span class="text-caption text-weight-bolder text-green-4">VENTA TOTAL:</span>
            <span class="text-h6 text-weight-bolder text-green-4">{{ formatCOP(totalVenta) }}</span>
          </div>
        </div>

        <div class="column q-gutter-y-sm">
          <q-btn
            color="primary"
            icon="save"
            label="Guardar Cambios"
            no-caps
            class="full-width text-weight-bold"
            style="border-radius: 12px; padding: 10px 0; font-size: 15px;"
            :loading="guardando"
            @click="guardar"
          />
          <q-btn
            flat
            no-caps
            label="Cancelar"
            color="grey-7"
            class="full-width"
            v-close-popup
          />
        </div>

      </q-card-section>

    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useQuasar } from 'quasar'
import { putData } from '@/services/apiService'
import { formatFechaLarga } from '@/utils/dateUtils'

const props = defineProps({
  modelValue: Boolean,
  cierre: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['update:modelValue', 'guardado'])

const $q = useQuasar()
const guardando = ref(false)

const form = ref({
  efectivoContado: 0,
  cadena: 0,
  recaudoNequi: 0,
  recaudoBancolombia: 0,
  gastosExternos: 0,
  observaciones: ''
})

const BASE_EFECTIVO = 600000

watch(() => props.cierre, (c) => {
  if (c) {
    form.value = {
      efectivoContado: (c.efectivo || 0) > 0 ? (c.efectivo + BASE_EFECTIVO) : BASE_EFECTIVO,
      cadena: 0,
      recaudoNequi: c.nequi || 0,
      recaudoBancolombia: c.bancolombia || 0,
      gastosExternos: c.gastosExternos || 0,
      observaciones: c.observaciones || ''
    }
  }
}, { immediate: true })

const fechaLarga = computed(() => {
  if (!props.cierre?.fecha) return ''
  return formatFechaLarga(props.cierre.fecha)
})

const formatCOP = (val) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(val ?? 0)

const recaudoEfectivoNeto = computed(() => {
  const contado = Number(form.value.efectivoContado || 0)
  const cadena = Number(form.value.cadena || 0)
  return Math.max(0, contado - BASE_EFECTIVO - cadena)
})

const totalCierre = computed(() => {
  return recaudoEfectivoNeto.value + Number(form.value.recaudoNequi || 0) + Number(form.value.recaudoBancolombia || 0)
})

const gastosReales = computed(() => {
  const gTotal = props.cierre?.gastosDia || 0
  const gExt = Number(form.value.gastosExternos || 0)
  return Math.max(0, gTotal - gExt)
})

const totalVenta = computed(() => {
  return totalCierre.value + gastosReales.value
})

const guardar = async () => {
  if (!props.cierre?.fecha) return

  guardando.value = true
  try {
    const cadenaApartada = Number(form.value.cadena || 0)
    const efectivoAjustado = Number(form.value.efectivoContado || 0) - cadenaApartada

    await putData('/movimientos/cierre-diario', {
      fecha: props.cierre.fecha,
      efectivoContado: efectivoAjustado,
      recaudoNequi: Number(form.value.recaudoNequi || 0),
      recaudoBancolombia: Number(form.value.recaudoBancolombia || 0),
      gastosExternos: Number(form.value.gastosExternos || 0),
      observaciones: form.value.observaciones
    })

    $q.notify({
      type: 'positive',
      message: '✅ Cierre Diario actualizado correctamente'
    })

    emit('guardado')
    emit('update:modelValue', false)

  } catch (error) {
    $q.notify({
      type: 'negative',
      message: error.response?.data?.mensaje || '❌ Error al actualizar el cierre diario'
    })
  } finally {
    guardando.value = false
  }
}
</script>
