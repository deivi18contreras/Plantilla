<template>
  <q-dialog :model-value="modelValue" @update:model-value="$emit('update:modelValue', $event)">
    <q-card style="width: 540px; max-width: 95vw; border-radius: 24px; max-height: 90vh;" class="column">
      
      <!-- ENCABEZADO -->
      <q-card-section class="row items-center justify-between q-pb-none">
        <div class="row items-center q-gutter-x-sm">
          <q-avatar size="40px" color="amber-1" text-color="amber-9" icon="edit_note" class="text-weight-bold" />
          <div>
            <div class="text-h6 text-weight-bolder text-slate-900">Editar Cierre Diario</div>
            <div class="text-caption text-slate-500 text-capitalize">{{ fechaLarga }}</div>
          </div>
        </div>
        <q-btn flat round icon="close" size="sm" v-close-popup />
      </q-card-section>

      <!-- CUERPO DEL FORMULARIO SCROLLEABLE -->
      <q-card-section class="col overflow-auto q-py-md column q-gutter-y-md">

        <!-- 1. EFECTIVO EN CAJA -->
        <div class="bg-blue-50 q-pa-md" style="border-radius: 16px; background: #f0f9ff; border: 1px solid #bae6fd;">
          <div class="row items-center justify-between q-mb-xs">
            <span class="text-subtitle2 text-weight-bold text-blue-9">💵 1. Dinero Contado en Efectivo</span>
            <q-badge color="blue-2" text-color="blue-9" :label="`Base fija: ${formatCOP(600000)}`" class="text-weight-bold" />
          </div>

          <div class="text-caption text-slate-600 q-mb-xs">Total de billetes y monedas que había en caja:</div>
          <q-input
            v-model="form.efectivoContado"
            type="number"
            placeholder="$ 0"
            prefix="$"
            outlined
            dense
            class="q-mb-sm bg-white"
            style="border-radius: 10px;"
          />

          <!-- Cadena apartada -->
          <div class="row items-center q-gutter-x-xs q-mb-xs">
            <q-icon name="link" color="orange-7" size="16px" />
            <span class="text-caption text-weight-bold text-orange-8">Cadena apartada (se resta del efectivo):</span>
          </div>
          <q-input
            v-model="form.cadena"
            type="number"
            placeholder="$ 0"
            prefix="$"
            outlined
            dense
            class="q-mb-sm bg-white"
            style="border-radius: 10px;"
          />

          <!-- Recaudo Efectivo Neto Calculado -->
          <div class="row items-center justify-between q-pa-sm bg-white" style="border-radius: 10px; border: 1px solid #bae6fd;">
            <span class="text-caption text-slate-600 font-medium">Recaudo Efectivo Neto:</span>
            <span class="text-subtitle1 text-weight-bolder text-green-7">{{ formatCOP(recaudoEfectivoNeto) }}</span>
          </div>
        </div>

        <!-- 2. NEQUI Y BANCOLOMBIA -->
        <div class="row q-col-gutter-sm">
          <div class="col-12 col-sm-6">
            <div class="text-caption text-weight-bold text-purple-9 q-mb-xs">📱 2. Total Nequi</div>
            <q-input
              v-model="form.recaudoNequi"
              type="number"
              placeholder="$ 0"
              prefix="$"
              outlined
              dense
              style="border-radius: 10px;"
            />
          </div>
          <div class="col-12 col-sm-6">
            <div class="text-caption text-weight-bold text-amber-9 q-mb-xs">🏦 3. Total Bancolombia</div>
            <q-input
              v-model="form.recaudoBancolombia"
              type="number"
              placeholder="$ 0"
              prefix="$"
              outlined
              dense
              style="border-radius: 10px;"
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
            outlined
            dense
            class="bg-white"
            style="border-radius: 10px;"
          />
        </div>

        <!-- 4. OBSERVACIONES -->
        <div>
          <div class="text-caption text-weight-bold text-slate-700 q-mb-xs">📝 Observaciones</div>
          <q-input
            v-model="form.observaciones"
            placeholder="Notas sobre el cierre..."
            outlined
            dense
            autogrow
            style="border-radius: 10px;"
          />
        </div>

        <!-- 5. RESUMEN EN VIVO DE TOTALES -->
        <div class="q-pa-md bg-slate-900 text-white" style="border-radius: 16px; background: #0f172a;">
          <div class="text-caption text-weight-bold text-amber-4 q-mb-xs">📊 VISTA PREVIA DE TOTALES:</div>
          <div class="column q-gutter-y-xs">
            <div class="row items-center justify-between">
              <span class="text-caption text-slate-300">Gastos del día:</span>
              <span class="text-caption text-weight-bold text-red-4">- {{ formatCOP(gastosReales) }}</span>
            </div>
            <div class="row items-center justify-between">
              <span class="text-caption text-slate-300">Cierre Total (Efectivo + Nequi + Bancolombia):</span>
              <span class="text-caption text-weight-bold text-blue-4">{{ formatCOP(totalCierre) }}</span>
            </div>
            <q-separator dark class="q-my-xs" style="opacity: 0.2;" />
            <div class="row items-center justify-between">
              <span class="text-subtitle2 text-weight-bolder text-green-4">🟢 VENTA TOTAL RECALCULADA:</span>
              <span class="text-subtitle1 text-weight-bolder text-green-4">{{ formatCOP(totalVenta) }}</span>
            </div>
          </div>
        </div>

      </q-card-section>

      <!-- BOTONES DE ACCIÓN -->
      <q-card-actions class="row justify-between q-pa-md border-t border-slate-100">
        <q-btn flat no-caps label="Cancelar" color="grey-7" v-close-popup />
        <q-btn
          color="primary"
          icon="save"
          label="Guardar Cambios del Cierre"
          no-caps
          class="text-weight-bold"
          style="border-radius: 12px; padding: 8px 20px;"
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
    // Si viene con efectivo neto, calculamos el efectivo contado aproximado sumándole la base
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
