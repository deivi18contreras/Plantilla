<template>
  <q-dialog :model-value="modelValue" @update:model-value="$emit('update:modelValue', $event)" persistent>
    <q-card style="width: 500px; max-width: 94vw; border-radius: 24px; max-height: 92vh;" class="q-pa-md column no-wrap">
      
      <!-- ENCABEZADO -->
      <q-card-section class="row items-center justify-between q-pb-xs q-pt-none q-px-xs">
        <div class="row items-center q-gutter-x-sm">
          <q-avatar size="38px" color="blue-1" text-color="blue-8" icon="edit_note" class="text-weight-bold" />
          <div>
            <div class="text-subtitle1 text-weight-bolder text-slate-900">Editar Cierre Diario</div>
            <div class="text-caption text-slate-500 text-capitalize">{{ fechaLarga }}</div>
          </div>
        </div>
        <q-btn flat round icon="close" size="sm" v-close-popup />
      </q-card-section>

      <!-- CUERPO DEL FORMULARIO SCROLLEABLE -->
      <q-card-section class="col overflow-auto q-px-xs q-py-sm column q-gutter-y-sm" style="box-sizing: border-box;">

        <!-- 1. EFECTIVO EN CAJA -->
        <div class="q-pa-sm bg-blue-50" style="border-radius: 14px; background: #f0f9ff; border: 1px solid #bae6fd;">
          <div class="row items-center justify-between q-mb-xs">
            <span class="text-caption text-weight-bold text-blue-9">💵 1. Dinero Contado en Efectivo</span>
            <span class="text-caption text-weight-bold text-blue-7">Base: {{ formatCOP(600000) }}</span>
          </div>

          <div class="text-caption text-slate-500 q-mb-xs" style="font-size: 11px;">Total de dinero físico que había en caja:</div>
          <q-input
            v-model="form.efectivoContado"
            type="number"
            placeholder="$ 0"
            prefix="$"
            borderless
            class="clean-input q-mb-xs"
          />

          <!-- Cadena apartada -->
          <div class="text-caption text-weight-bold text-orange-8 q-mt-xs q-mb-xs" style="font-size: 12px;">
            🔗 Cadena apartada (se resta del efectivo):
          </div>
          <q-input
            v-model="form.cadena"
            type="number"
            placeholder="$ 0"
            prefix="$"
            borderless
            class="clean-input q-mb-xs"
          />

          <!-- Recaudo Efectivo Neto Calculado -->
          <div class="row items-center justify-between q-pa-xs bg-white q-mt-xs" style="border-radius: 8px; border: 1px solid #bae6fd;">
            <span class="text-caption text-slate-600 font-medium" style="font-size: 12px;">Recaudo Efectivo Neto:</span>
            <span class="text-subtitle2 text-weight-bolder text-green-7">{{ formatCOP(recaudoEfectivoNeto) }}</span>
          </div>
        </div>

        <!-- 2. NEQUI Y BANCOLOMBIA -->
        <div class="row q-col-gutter-xs">
          <div class="col-6">
            <div class="text-caption text-weight-bold text-purple-9 q-mb-xs">📱 2. Total Nequi</div>
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
            <div class="text-caption text-weight-bold text-amber-9 q-mb-xs">🏦 3. Total Bancolombia</div>
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

        <!-- 3. GASTOS EXTERNOS -->
        <div class="q-pa-sm" style="border-radius: 12px; background: #fff7ed; border: 1px dashed #fb923c;">
          <div class="text-caption text-weight-bold text-orange-8 q-mb-xs">⚡ Gastos con plata externa (opcional):</div>
          <q-input
            v-model="form.gastosExternos"
            type="number"
            placeholder="$ 0"
            prefix="$"
            borderless
            class="clean-input"
          />
        </div>

        <!-- 4. OBSERVACIONES -->
        <div>
          <div class="text-caption text-weight-bold text-slate-700 q-mb-xs">📝 Observaciones</div>
          <q-input
            v-model="form.observaciones"
            placeholder="Notas sobre el cierre..."
            borderless
            class="clean-input"
          />
        </div>

        <!-- 5. RESUMEN EN VIVO DE TOTALES -->
        <div class="q-pa-sm bg-slate-900 text-white" style="border-radius: 14px; background: #0f172a;">
          <div class="column q-gutter-y-xs">
            <div class="row items-center justify-between text-caption">
              <span class="text-slate-300">Gastos del día:</span>
              <span class="text-weight-bold text-red-4">- {{ formatCOP(gastosReales) }}</span>
            </div>
            <div class="row items-center justify-between text-caption">
              <span class="text-slate-300">Cierre Total (Efectivo + Nequi + Bancolombia):</span>
              <span class="text-weight-bold text-blue-4">{{ formatCOP(totalCierre) }}</span>
            </div>
            <q-separator dark class="q-my-xs" style="opacity: 0.2;" />
            <div class="row items-center justify-between">
              <span class="text-caption text-weight-bolder text-green-4">🟢 VENTA TOTAL RECALCULADA:</span>
              <span class="text-subtitle1 text-weight-bolder text-green-4">{{ formatCOP(totalVenta) }}</span>
            </div>
          </div>
        </div>

      </q-card-section>

      <!-- BOTONES DE ACCIÓN -->
      <q-card-actions class="row justify-between items-center q-pt-sm q-pb-none q-px-xs">
        <q-btn flat no-caps label="Cancelar" color="grey-7" v-close-popup />
        <q-btn
          color="primary"
          icon="save"
          label="Guardar Cierre"
          no-caps
          class="text-weight-bold"
          style="border-radius: 12px; padding: 6px 18px;"
          :loading="guardando"
          @click="guardar"
        />
      </q-card-actions>

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
    // Si viene con efectivo neto, calculamos el efectivo contado sumándole la base
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
