<template>
  <q-dialog
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
    position="right"
    maximized
    transition-show="slide-left"
    transition-hide="slide-right"
  >
    <q-card style="width: 460px; max-width: 100vw; height: 100vh; border-radius: 0; background: #ffffff; display: flex; flex-direction: column; overflow: hidden;" class="shadow-24">

      <!-- HEADER DEL PANEL LATERAL -->
      <div class="row items-center justify-between q-pa-md" style="border-bottom: 1px solid #e2e8f0; background: #fafbfc; flex-shrink: 0;">
        <div class="row items-center q-gutter-x-sm">
          <q-avatar size="36px" color="blue-1" text-color="blue-9" icon="edit_note" class="text-weight-bold" />
          <div>
            <div class="text-subtitle1 text-weight-bolder text-slate-900">Editar Cierre de Caja</div>
            <div class="text-caption text-slate-500 text-capitalize">{{ fechaLarga }}</div>
          </div>
        </div>
        <q-btn flat round icon="close" size="sm" color="slate-500" v-close-popup />
      </div>

      <!-- CUERPO DEL PANEL CON SCROLL VERTICAL EXCLUSIVO (CERO SCROLL HORIZONTAL) -->
      <div class="q-pa-md" style="flex: 1; overflow-y: auto; overflow-x: hidden; box-sizing: border-box;">
        <div class="column q-gutter-y-md" style="width: 100%; max-width: 100%; flex-wrap: nowrap;">

          <!-- SECCIÓN 1: EFECTIVO -->
          <div style="width: 100%;">
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

            <!-- Devolución de Préstamo / Reposición -->
            <div class="q-mb-sm">
              <div class="text-caption text-slate-500 q-mb-xs">🔄 Devolución de préstamo / Reposición (se resta del efectivo):</div>
              <q-input
                v-model="form.devolucionPrestamo"
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
          <div style="width: 100%;">
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
          <!-- SECCIÓN 3: OTROS AJUSTES / GASTOS CON SOBRES -->
          <div style="width: 100%;">
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
            <div class="row items-center justify-between q-mb-xs" style="flex-wrap: wrap; gap: 8px;">
              <span class="text-caption text-weight-bolder text-slate-800 text-uppercase" style="letter-spacing: 0.5px;">⚡ Gastos con plata de días anteriores</span>
              <q-toggle
                v-model="usarRemanentes"
                dense
                color="orange-8"
                label="¿Usó sobres anteriores?"
                left-label
                class="text-weight-bold text-caption text-slate-700"
              />
            </div>

            <!-- LISTA DE SOBRES DISPONIBLES -->
            <div v-if="usarRemanentes" class="q-mt-sm column q-gutter-y-sm">
              <div v-if="remanentesStore.disponibles.length === 0" class="q-pa-sm bg-orange-100 rounded-borders text-caption text-orange-9">
                ℹ️ No hay otros sobres disponibles registrados actualmente. Puedes colocar el valor manual abajo.
              </div>

              <div
                v-for="sobre in remanentesStore.disponibles"
                :key="sobre._id"
                class="q-pa-sm bg-white rounded-borders shadow-1"
                style="border: 1px solid #fed7aa; border-radius: 12px;"
              >
                <div class="row items-center justify-between q-mb-xs">
                  <div class="row items-center q-gutter-x-xs">
                    <q-icon name="mail" color="orange-8" size="16px" />
                    <span class="text-caption text-weight-bold text-slate-800">
                      Sobre del {{ formatFechaCorta(sobre.fecha) }}
                    </span>
                  </div>
                  <span class="text-caption text-weight-bolder text-green-7">
                    Disponible: {{ formatCOP(sobre.saldoDisponible) }}
                  </span>
                </div>

                <div class="row items-center q-col-gutter-sm">
                  <div class="col-12 col-sm-7">
                    <q-input
                      v-model.number="montosSobres[sobre._id]"
                      type="number"
                      placeholder="Monto sacado"
                      prefix="$"
                      dense
                      outlined
                      class="bg-slate-50"
                      style="border-radius: 8px;"
                    />
                  </div>
                  <div class="col-12 col-sm-5 text-right">
                    <span v-if="montosSobres[sobre._id] > 0" class="text-caption text-orange-8 font-medium">
                      Le quedará: <strong>{{ formatCOP(Math.max(0, sobre.saldoDisponible - montosSobres[sobre._id])) }}</strong>
                    </span>
                  </div>
                </div>
              </div>

              <!-- Manual / Otra plata externa -->
              <div class="q-pt-xs">
                <div class="text-caption text-slate-500 q-mb-xs">Otra plata externa / Préstamo personal (opcional):</div>
                <q-input
                  v-model.number="otraPlataExterna"
                  type="number"
                  placeholder="$ 0"
                  prefix="$"
                  dense
                  outlined
                  class="bg-white"
                  style="border-radius: 8px;"
                />
              </div>
            </div>

            <!-- Entrada manual simple si no activa el toggle -->
            <div v-else>
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

            <div v-if="gastosExternosNum > 0" class="text-caption text-orange-8 text-weight-bold q-mt-xs">
              ⚡ Total gastos externos: {{ formatCOP(gastosExternosNum) }}
            </div>
          </div>

          <q-separator style="opacity: 0.6;" />

          <!-- SECCIÓN 4: NOTAS Y OBSERVACIONES (MULTILÍNEA CON ENTER) -->
          <div style="width: 100%;">
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

        </div>
      </div>

      <!-- FOOTER CON RESUMEN Y BOTÓN GUARDAR (FIJADO ABAJO) -->
      <div class="q-pa-md" style="border-top: 1px solid #e2e8f0; background: #ffffff; flex-shrink: 0;">

        <!-- CAJA DE RESUMEN -->
        <div class="q-pa-sm q-mb-sm" style="border-radius: 14px; background: #0f172a; color: white;">
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
            <span class="text-subtitle1 text-weight-bolder text-green-4">{{ formatCOP(totalVenta) }}</span>
          </div>
        </div>

        <div class="column q-gutter-y-xs">
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

      </div>

    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { putData } from '@/services/apiService'
import { useRemanentesStore } from '@/store/remanentesStore'
import { formatFechaLarga, formatFechaCorta } from '@/utils/dateUtils'

const props = defineProps({
  modelValue: Boolean,
  cierre: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['update:modelValue', 'guardado'])

const $q = useQuasar()
const remanentesStore = useRemanentesStore()
const guardando = ref(false)

const usarRemanentes = ref(false)
const montosSobres = ref({})
const otraPlataExterna = ref(null)

const form = ref({
  efectivoContado: 0,
  cadena: 0,
  devolucionPrestamo: 0,
  recaudoNequi: 0,
  recaudoBancolombia: 0,
  gastosExternos: 0,
  observaciones: ''
})

const BASE_EFECTIVO = 600000

watch(() => props.cierre, (c) => {
  if (c) {
    form.value = {
      efectivoContado: (c.efectivo || 0) > 0 ? (c.efectivo + BASE_EFECTIVO + (c.devolucionPrestamo || 0)) : BASE_EFECTIVO,
      cadena: 0,
      devolucionPrestamo: c.devolucionPrestamo || 0,
      recaudoNequi: c.nequi || 0,
      recaudoBancolombia: c.bancolombia || 0,
      gastosExternos: c.gastosExternos || 0,
      observaciones: c.observaciones || ''
    }
    montosSobres.value = {}
    otraPlataExterna.value = null
    usarRemanentes.value = false
    remanentesStore.fetchDisponibles()
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
  const devPrestamo = Number(form.value.devolucionPrestamo || 0)
  return Math.max(0, contado - BASE_EFECTIVO - cadena - devPrestamo)
})

const totalSacadoSobres = computed(() => {
  return Object.values(montosSobres.value).reduce((sum, val) => sum + (Number(val) || 0), 0)
})

const gastosExternosNum = computed(() => {
  if (usarRemanentes.value) {
    return totalSacadoSobres.value + (Number(otraPlataExterna.value) || 0)
  }
  return Math.max(0, Number(form.value.gastosExternos || 0))
})

const totalCierre = computed(() => {
  return recaudoEfectivoNeto.value + Number(form.value.recaudoNequi || 0) + Number(form.value.recaudoBancolombia || 0)
})

const gastosReales = computed(() => {
  const gTotal = props.cierre?.gastosDia || 0
  return Math.max(0, gTotal - gastosExternosNum.value)
})

const totalVenta = computed(() => {
  const devPrestamo = Number(form.value.devolucionPrestamo || 0)
  return totalCierre.value + gastosReales.value + devPrestamo
})

const guardar = async () => {
  if (!props.cierre?.fecha) return

  guardando.value = true
  try {
    const cadenaApartada = Number(form.value.cadena || 0)
    const devPrestamo = Number(form.value.devolucionPrestamo || 0)
    const efectivoAjustado = Number(form.value.efectivoContado || 0) - cadenaApartada - devPrestamo

    const desgloseRemanentes = []
    if (usarRemanentes.value) {
      for (const sobre of remanentesStore.disponibles) {
        const m = Number(montosSobres.value[sobre._id] || 0)
        if (m > 0) {
          desgloseRemanentes.push({
            remanenteId: sobre._id,
            fechaRemanente: sobre.fecha,
            monto: m,
            motivo: `Ajuste en cierre ${props.cierre.fecha.split('T')[0]}`
          })
        }
      }
    }

    await putData('/movimientos/cierre-diario', {
      fecha: props.cierre.fecha,
      efectivoContado: efectivoAjustado,
      recaudoNequi: Number(form.value.recaudoNequi || 0),
      recaudoBancolombia: Number(form.value.recaudoBancolombia || 0),
      gastosExternos: gastosExternosNum.value,
      devolucionPrestamo: devPrestamo,
      observaciones: form.value.observaciones,
      desgloseRemanentes
    })

    $q.notify({
      type: 'positive',
      message: '✅ Cierre Diario actualizado correctamente'
    })

    await remanentesStore.fetchDisponibles()
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

onMounted(() => {
  remanentesStore.fetchDisponibles()
})
</script>
