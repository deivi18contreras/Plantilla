<template>
  <div class="row justify-center q-pa-md">
    <div class="card-widget" style="max-width: 640px; width: 100%;">

      <div class="text-h5 text-weight-bolder text-slate-900 q-mb-xs">Cierre Diario de Turno</div>
      <div class="text-caption text-slate-500 q-mb-lg">Resumen automático idéntico a tu planilla de papel</div>

      <!-- ALERTA CIERRE DUPLICADO -->
      <div
        v-if="cierreYaExiste"
        class="q-pa-sm q-mb-md row items-center q-gutter-x-sm"
        style="border-radius: 12px; background: #fff7ed; border: 1px solid #fb923c;"
      >
        <q-icon name="warning" color="orange-7" size="20px" />
        <span class="text-caption text-weight-bold text-orange-8">
          ⚠️ Ya hay un cierre registrado para esta fecha. Si guardas otro, quedarán dos.
        </span>
      </div>

      <q-form @submit="handleSubmit" class="column q-gutter-y-md">

        <!-- Fecha del Cierre -->
        <div>
          <div class="text-caption text-weight-bold text-slate-700 q-mb-xs">Fecha del cierre</div>
          <q-input
            v-model="form.fecha"
            type="date"
            borderless
            class="clean-input"
            @update:model-value="onFechaChange"
            :rules="[val => !!val || 'La fecha es obligatoria']"
          />
        </div>

        <q-separator class="q-my-xs" />

        <!-- 1. SECCION EFECTIVO CON ARQUEO $600.000 -->
        <div class="bg-blue-50 q-pa-md" style="border-radius: 16px; background: #f0f9ff; border: 1px solid #bae6fd;">
          <div class="row items-center justify-between q-mb-xs">
            <span class="text-subtitle2 text-weight-bold text-blue-9">💵 1. Efectivo en Caja</span>
            <q-badge color="blue-2" text-color="blue-9" :label="`Base fija: ${formatCOP(configStore.baseFija)}`" class="text-weight-bold" />
          </div>

          <div class="text-caption text-slate-600 q-mb-sm">Total de dinero contado físicamente en la caja al cerrar:</div>

          <q-input
            v-model="form.efectivoContado"
            type="number"
            placeholder="$ 0"
            prefix="$"
            borderless
            class="clean-input q-mb-sm"
          />

          <!-- Campo Cadena -->
          <div class="row items-center q-gutter-x-sm q-mb-sm">
            <q-icon name="link" color="orange-7" size="18px" />
            <span class="text-caption text-weight-bold text-orange-8">🔗 Cadena (se descuenta del efectivo):</span>
          </div>
          <q-input
            v-model="form.cadena"
            type="number"
            placeholder="$ 0"
            prefix="$"
            borderless
            class="clean-input q-mb-xs"
            style="border: 1px solid #fb923c; border-radius: 10px;"
          />
          <div class="text-caption text-orange-7 q-mb-sm">💡 Esta plata ya está registrada como gasto — se resta del arqueo automáticamente.</div>

          <!-- Campo Devolución de Préstamo / Reposición a Reserva -->
          <div class="row items-center q-gutter-x-sm q-mb-xs q-mt-sm">
            <q-icon name="sync_alt" color="blue-8" size="18px" />
            <span class="text-caption text-weight-bold text-blue-9">🔄 Devolución de préstamo / Reposición (se resta del efectivo):</span>
          </div>
          <q-input
            v-model="form.devolucionPrestamo"
            type="number"
            placeholder="$ 0"
            prefix="$"
            borderless
            class="clean-input q-mb-xs"
            style="border: 1px solid #93c5fd; border-radius: 10px;"
          />
          <div class="text-caption text-slate-500 q-mb-sm" style="font-size: 11px;">
            💡 Ej: plata que sacas para devolver a tu mamá o reponer reservas de días pesados. Descuenta del cajón sin duplicar gastos.
          </div>

          <!-- Resultado del Arqueo -->
          <div class="row items-center justify-between q-pa-sm bg-white" style="border-radius: 10px; border: 1px solid #bae6fd; gap: 8px; flex-wrap: wrap;">
            <div class="text-caption text-slate-600 font-medium" style="flex: 1; min-width: 160px;">Recaudo Neto Efectivo:</div>
            <div class="text-subtitle1 text-weight-bolder text-green-7">
              {{ formatCOP(recaudoEfectivoNeto) }}
            </div>
          </div>
        </div>

        <!-- 2. SECCION NEQUI -->
        <div>
          <div class="text-caption text-weight-bold text-slate-700 q-mb-xs">📱 2. Total recibido en Nequi</div>
          <q-input
            v-model="form.recaudoNequi"
            type="number"
            placeholder="$ 0"
            prefix="$"
            borderless
            class="clean-input"
          />
        </div>

        <!-- 3. SECCION BANCOLOMBIA -->
        <div>
          <div class="text-caption text-weight-bold text-slate-700 q-mb-xs">🏦 3. Total recibido en Bancolombia</div>
          <q-input
            v-model="form.recaudoBancolombia"
            type="number"
            placeholder="$ 0"
            prefix="$"
            borderless
            class="clean-input"
          />
        </div>

        <!-- 4. GASTOS EXTERNOS (OPCIONAL) -->
        <div class="q-pa-md" style="border-radius: 16px; background: #fff7ed; border: 1px dashed #fb923c;">
          <div class="row items-center q-gutter-x-xs q-mb-xs">
            <q-icon name="bolt" color="orange-7" size="18px" />
            <span class="text-subtitle2 text-weight-bold text-orange-8">4. Gastos con plata externa
              <span class="text-caption text-orange-5 text-weight-regular">(opcional)</span>
            </span>
          </div>
          <div class="text-caption text-slate-600 q-mb-sm">Ej: si prestaste plata tuya o usaste plata de meses anteriores para pagar un pedido.</div>
          <q-input
            v-model="form.gastosExternos"
            type="number"
            placeholder="$ 0"
            prefix="$"
            borderless
            class="clean-input"
          />
          <div v-if="gastosExternosNum > 0" class="text-caption text-orange-7 q-mt-xs">
            ⚡ Se descontarán {{ formatCOP(gastosExternosNum) }} del cálculo de Venta Total automáticamente.
          </div>
        </div>

        <!-- 5. TARJETA DE RESUMEN DE CIERRE (CONSOLIDADOS CON ALTO CONTRASTE) -->
        <div class="q-pa-md bg-slate-900 text-white shadow-md" style="border-radius: 20px; background: #0f172a;">
          <div class="row items-center justify-between q-mb-md" style="flex-wrap: wrap; gap: 4px;">
            <div class="row items-center q-gutter-x-xs">
              <q-icon name="analytics" size="20px" color="amber-4" />
              <span class="text-weight-bolder text-amber-4" style="font-size: clamp(12px,3vw,16px);">RESUMEN CIERRE DE CAJA</span>
            </div>
            <span class="text-caption text-slate-400">Calculado automáticamente</span>
          </div>

          <div class="column q-gutter-y-sm">

            <!-- GASTOS DIARIOS -->
            <div class="q-pa-sm bg-slate-800" style="border-radius: 10px;">
              <div class="row items-center justify-between">
                <span class="text-body2 text-weight-bold text-slate-200">🔴 GASTOS (del negocio):</span>
                <span class="text-subtitle1 text-weight-bolder text-red-4">- {{ formatCOP(totalGastosDia - gastosExternosNum) }}</span>
              </div>
              <div v-if="gastosExternosNum > 0" class="text-caption text-orange-4 q-mt-xs">
                ⚡ {{ formatCOP(gastosExternosNum) }} externos excluidos
              </div>
            </div>

            <!-- DESGLOSE DE CUENTAS CON TARJETAS CLARAS -->
            <div class="row q-col-gutter-xs q-my-xs">
              <div class="col-12 col-sm-4">
                <div class="q-pa-xs bg-slate-800 rounded row items-center justify-between" style="border-radius: 8px;">
                  <span class="text-caption text-weight-bold text-slate-200">💵 Efectivo Neto</span>
                  <span class="text-caption text-weight-bolder text-green-4">{{ formatCOP(recaudoEfectivoNeto) }}</span>
                </div>
              </div>
              <div class="col-12 col-sm-4">
                <div class="q-pa-xs bg-slate-800 rounded row items-center justify-between" style="border-radius: 8px;">
                  <span class="text-caption text-weight-bold text-slate-200">📱 Nequi</span>
                  <span class="text-caption text-weight-bolder text-purple-3">{{ formatCOP(Number(form.recaudoNequi || 0)) }}</span>
                </div>
              </div>
              <div class="col-12 col-sm-4">
                <div class="q-pa-xs bg-slate-800 rounded row items-center justify-between" style="border-radius: 8px;">
                  <span class="text-caption text-weight-bold text-slate-200">🏦 Bancolombia</span>
                  <span class="text-caption text-weight-bolder text-amber-3">{{ formatCOP(Number(form.recaudoBancolombia || 0)) }}</span>
                </div>
              </div>
            </div>

            <q-separator dark class="q-my-xs" style="opacity: 0.2;" />

            <!-- CIERRE (Efectivo + Nequi + Bancolombia) -->
            <div class="row justify-between items-center" style="flex-wrap: wrap; gap: 4px;">
              <span class="text-weight-bold text-blue-3" style="font-size: clamp(12px,3vw,16px);">🔵 CIERRE TOTAL:</span>
              <span class="text-h6 text-weight-bolder text-blue-3">{{ formatCOP(totalCierreLiquid) }}</span>
            </div>

            <!-- VENTA TOTAL DEL DIA (Gastos + Cierre) -->
            <div class="row justify-between items-center q-pt-xs border-t border-slate-700" style="border-top: 1px solid rgba(255, 255, 255, 0.15);">
              <span class="text-subtitle1 text-weight-bolder text-green-4">🟢 VENTA TOTAL DEL DÍA:</span>
              <span class="text-h5 text-weight-bolder text-green-4">{{ formatCOP(totalVentaDia) }}</span>
            </div>
            <div class="text-caption text-slate-300 text-right" style="margin-top: -6px;">
              Gastos ({{ formatCOP(totalGastosDia) }}) + Cierre ({{ formatCOP(totalCierreLiquid) }}) = {{ formatCOP(totalVentaDia) }}
            </div>

          </div>
        </div>

        <!-- 5. OBSERVACIONES -->
        <div>
          <div class="text-caption text-weight-bold text-slate-700 q-mb-xs">📝 Observaciones</div>
          <q-input
            v-model="form.observaciones"
            placeholder="Ej: Huevos 351.000 x B&M / MacPollo -> 700"
            borderless
            class="clean-input"
          />
        </div>

        <!-- BOTÓN GUARDAR CIERRE COMPLETO -->
        <div class="q-mt-md">
          <button type="submit" class="btn-primary-custom" :disabled="loading">
            <span>{{ loading ? 'Guardando cierre...' : 'Guardar Cierre Completo del Día' }}</span>
          </button>
        </div>

      </q-form>

    </div>
  </div>

  <!-- MODAL COMPARTIR CIERRE -->
  <ModalCompartirCierre
    v-model="modalCompartir"
    :texto="textoWhatsApp"
    mostrar-continuar
    @cerrar="router.push(authStore.isAdmin ? '/' : '/historial')"
  />
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { postData, getData } from '@/services/apiService'
import { useCuentasStore } from '@/store/cuentasStore'
import { useConfiguracionStore } from '@/store/configuracionStore'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/store/authStore'
import ModalCompartirCierre from '@/components/ModalCompartirCierre.vue'
import { formatFechaLarga, getFechaLocalHoy } from '@/utils/dateUtils'

const $q = useQuasar()
const router = useRouter()
const cuentasStore = useCuentasStore()
const configStore = useConfiguracionStore()
const authStore = useAuthStore()

const loading = ref(false)
const totalGastosDia = ref(0)
const cierreYaExiste = ref(false)
const modalCompartir = ref(false)
const textoWhatsApp = ref('')
const ultimoCierreData = ref(null)

const form = ref({
  fecha: getFechaLocalHoy(),
  efectivoContado: null,
  cadena: 125000,
  devolucionPrestamo: null,
  recaudoNequi: null,
  recaudoBancolombia: null,
  gastosExternos: null,
  observaciones: ''
})

const BASE_EFECTIVO = computed(() => configStore.baseFija)
const devolucionNum = computed(() => Math.max(0, Number(form.value.devolucionPrestamo || 0)))

const recaudoEfectivoNeto = computed(() => {
  const eContado = Number(form.value.efectivoContado || 0)
  const cadenaApartada = Number(form.value.cadena || 0)
  return Math.max(0, eContado - cadenaApartada - devolucionNum.value - BASE_EFECTIVO.value)
})

// CIERRE = EFECTIVO NETO + NEQUI + BANCOLOMBIA (Igual a tu hoja física)
const totalCierreLiquid = computed(() => {
  return recaudoEfectivoNeto.value + Number(form.value.recaudoNequi || 0) + Number(form.value.recaudoBancolombia || 0)
})

// Gastos externos (préstamos, plata de meses anteriores) que NO cuentan como venta real
const gastosExternosNum = computed(() => Math.max(0, Number(form.value.gastosExternos || 0)))

// VENTA REAL = (Gastos del día - Gastos Externos) + Cierre + Devolución de préstamos (que salieron de las ventas)
const totalVentaDia = computed(() => {
  return (totalGastosDia.value - gastosExternosNum.value) + totalCierreLiquid.value + devolucionNum.value
})

const formatCOP = (val) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(val ?? 0)

const cargarGastosDelDia = async () => {
  if (!form.value.fecha) return
  try {
    const movimientos = await getData('/movimientos', { fecha: form.value.fecha })
    totalGastosDia.value = movimientos
      .filter(m => m.tipo === 'gasto')
      .reduce((sum, m) => sum + (m.monto || 0), 0)
    // Verificar si ya hay cierre para esta fecha
    cierreYaExiste.value = movimientos.some(
      m => m.tipo === 'recaudo' && m.categoria === 'Ventas del día'
    )
  } catch (error) {
    totalGastosDia.value = 0
    cierreYaExiste.value = false
  }
}

const onFechaChange = async () => {
  await cargarGastosDelDia()
}

const generarTextoWhatsApp = () => {
  const fechaStr = formatFechaLarga(form.value.fecha)
  const negocio = configStore.nombreNegocio || 'Negocio'
  const por = authStore.nombreUsuario || 'Empleado'
  const gastos = totalGastosDia.value - gastosExternosNum.value

  return `📊 *CIERRE DE TURNO*
${negocio.toUpperCase()} — ${fechaStr}
${'─'.repeat(32)}
🔴 Gastos del día:   ${formatCOP(gastos)}
💵 Efectivo neto:    ${formatCOP(recaudoEfectivoNeto.value)}${devolucionNum.value > 0 ? `
🔄 Devolución deuda: ${formatCOP(devolucionNum.value)}` : ''}
📱 Nequi:            ${formatCOP(Number(form.value.recaudoNequi || 0))}
🏦 Bancolombia:      ${formatCOP(Number(form.value.recaudoBancolombia || 0))}
${'─'.repeat(32)}
🔵 CIERRE TOTAL:     ${formatCOP(totalCierreLiquid.value)}
🟢 VENTA TOTAL:      ${formatCOP(totalVentaDia.value)}
${'─'.repeat(32)}
👤 Registrado por: ${por}${form.value.observaciones ? `
📝 ${form.value.observaciones}` : ''}`
}

const abrirWhatsApp = () => {
  const texto = encodeURIComponent(textoWhatsApp.value)
  window.open(`https://wa.me/?text=${texto}`, '_blank')
}

const copiarTexto = () => {
  navigator.clipboard.writeText(textoWhatsApp.value).then(() => {
    $q.notify({ type: 'positive', message: '✅ Texto copiado al portapapeles' })
  })
}

const cerrarModalYRedirigir = () => {
  modalCompartir.value = false
  router.push(authStore.isAdmin ? '/' : '/historial')
}

const handleSubmit = async () => {
  loading.value = true
  try {
    const cadenaApartada = Number(form.value.cadena || 0)
    const devPrestamo = devolucionNum.value
    const efectivoAjustado = Number(form.value.efectivoContado || 0) - cadenaApartada - devPrestamo
    await postData('/movimientos/cierre-diario', {
      fecha: form.value.fecha,
      efectivoContado: efectivoAjustado,
      recaudoNequi: Number(form.value.recaudoNequi || 0),
      recaudoBancolombia: Number(form.value.recaudoBancolombia || 0),
      gastosExternos: Number(form.value.gastosExternos || 0),
      devolucionPrestamo: devPrestamo,
      observaciones: form.value.observaciones
    })

    await cuentasStore.fetchCuentas()
    textoWhatsApp.value = generarTextoWhatsApp()
    modalCompartir.value = true
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: error.response?.data?.mensaje || '❌ Error al registrar el cierre diario'
    })
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  await configStore.fetchConfiguracion()
  // Aplicar cadenaDefault de configuración
  form.value.cadena = configStore.cadenaDefault
  await cuentasStore.fetchCuentas()
  await cargarGastosDelDia()
})
</script>
