<template>
  <div class="row justify-center q-pa-md">
    <div style="max-width: 760px; width: 100%;">

      <!-- ───── Encabezado ───── -->
      <div class="row items-center justify-between q-mb-lg">
        <div>
          <div class="text-h5 text-weight-bolder text-slate-900">Gastos Fijos</div>
          <div class="text-caption text-slate-500">Pagos recurrentes del negocio (arriendo, internet, sueldos…)</div>
        </div>
        <q-btn
          v-if="authStore.isAdmin"
          color="primary"
          icon="add"
          label="Agregar gasto fijo"
          no-caps
          unelevated
          class="text-weight-bold"
          style="border-radius: 12px;"
          @click="abrirModalCrear"
        />
      </div>

      <!-- ───── Tarjeta resumen mensual ───── -->
      <div
        v-if="!gastosFijosStore.loading && gastosFijosStore.gastosFijos.length > 0"
        class="q-mb-lg q-pa-md"
        style="background: linear-gradient(135deg, #1d4ed8 0%, #3b82f6 100%); border-radius: 20px; color: #fff;"
      >
        <div class="text-caption text-weight-bold q-mb-sm" style="opacity: .75; letter-spacing: .05em; text-transform: uppercase;">
          Resumen mensual
        </div>
        <div class="row q-col-gutter-md">
          <div class="col-12 col-sm-6">
            <div class="text-caption" style="opacity: .8;">Total mensual comprometido</div>
            <div class="text-h5 text-weight-bolder">{{ formatCOP(totalMensual) }}</div>
          </div>
          <div class="col-12 col-sm-6">
            <div class="text-caption" style="opacity: .8;">Próximo vencimiento</div>
            <div class="text-h6 text-weight-bold">{{ proximoVencimientoLabel }}</div>
          </div>
        </div>
      </div>

      <!-- ───── Loading ───── -->
      <div v-if="gastosFijosStore.loading" class="column items-center q-py-xl">
        <q-spinner color="primary" size="32px" />
      </div>

      <!-- ───── Vacío ───── -->
      <div
        v-else-if="gastosFijosStore.gastosFijos.length === 0"
        class="text-center text-slate-400 q-py-xl"
      >
        <q-icon name="event_note" size="56px" color="blue-2" />
        <div class="q-mt-sm text-subtitle2 text-slate-500">No hay gastos fijos configurados</div>
        <div class="text-caption">Agrega el arriendo, internet, sueldos, etc.</div>
      </div>

      <!-- ───── Lista de gastos fijos (tarjetas) ───── -->
      <div v-else class="column q-gutter-y-sm">
        <div
          v-for="gf in gastosFijosStore.gastosFijos"
          :key="gf._id"
          class="gf-card q-pa-md"
          :class="estadoClaseCard(gf.proximoVencimiento)"
        >
          <div class="row items-center no-wrap q-gutter-x-md">

            <!-- Ícono período -->
            <div
              class="gf-icon-wrap flex flex-center"
              :style="{ background: bgIconoPeriodo(gf.periodicidad) }"
            >
              <q-icon :name="iconoPeriodo(gf.periodicidad)" color="white" size="22px" />
            </div>

            <!-- Info central -->
            <div class="col">
              <div class="row items-center q-gutter-x-xs q-mb-xs">
                <span class="text-weight-bolder text-slate-900" style="font-size: 15px;">{{ gf.nombre }}</span>
                <q-badge :color="colorPeriodo(gf.periodicidad)" :label="gf.periodicidad" class="text-weight-bold" />
                <q-badge
                  :color="badgeEstado(gf.proximoVencimiento).color"
                  class="text-weight-bold"
                >
                  {{ badgeEstado(gf.proximoVencimiento).label }}
                </q-badge>
              </div>
              <div class="row items-center q-gutter-x-sm text-caption text-slate-500">
                <span>
                  <q-icon name="account_balance_wallet" size="12px" class="q-mr-xs" />
                  {{ gf.cuentaPago }}
                </span>
                <span>·</span>
                <span>
                  <q-icon name="event" size="12px" class="q-mr-xs" />
                  Vence: <strong>{{ formatFecha(gf.proximoVencimiento) }}</strong>
                </span>
              </div>
            </div>

            <!-- Monto + acciones -->
            <div class="column items-end q-gutter-y-xs" style="min-width: 120px;">
              <span class="text-weight-bolder text-slate-900" style="font-size: 17px;">
                {{ formatCOP(gf.monto) }}
              </span>
              <div class="row q-gutter-x-xs">
                <q-btn
                  unelevated dense no-caps
                  color="positive"
                  label="Pagar"
                  icon="check"
                  size="sm"
                  style="border-radius: 8px;"
                  @click="confirmarPago(gf)"
                />
                <q-btn
                  v-if="authStore.isAdmin"
                  flat dense round
                  icon="edit"
                  color="blue-6"
                  size="sm"
                  @click="abrirModalEditar(gf)"
                />
              </div>
            </div>

          </div>
        </div>
      </div>

    </div>

    <!-- ───── Modal crear / editar ───── -->
    <q-dialog v-model="modalForm">
      <q-card style="width: 460px; max-width: 90vw; border-radius: 24px;" class="q-pa-md">
        <q-card-section class="row items-center justify-between q-pb-xs">
          <div class="text-h6 text-weight-bolder text-slate-900">
            {{ editando ? 'Editar Gasto Fijo' : 'Nuevo Gasto Fijo' }}
          </div>
          <q-btn flat round icon="close" v-close-popup />
        </q-card-section>

        <q-card-section class="column q-gutter-y-md">
          <div>
            <div class="text-caption text-weight-bold text-slate-700 q-mb-xs">Nombre</div>
            <q-input v-model="form.nombre" placeholder="Ej. Arriendo" borderless class="clean-input" />
          </div>
          <div>
            <div class="text-caption text-weight-bold text-slate-700 q-mb-xs">Monto</div>
            <q-input v-model="form.monto" type="number" prefix="$" placeholder="0" borderless class="clean-input" />
          </div>
          <div>
            <div class="text-caption text-weight-bold text-slate-700 q-mb-xs">Periodicidad</div>
            <div class="row q-col-gutter-xs">
              <div v-for="p in periodos" :key="p" class="col-6">
                <div
                  class="pill-option text-center cursor-pointer"
                  :class="{ active: form.periodicidad === p }"
                  @click="form.periodicidad = p"
                >
                  <span style="font-size: 13px;">{{ p }}</span>
                </div>
              </div>
            </div>
          </div>
          <div>
            <div class="text-caption text-weight-bold text-slate-700 q-mb-xs">Cuenta de pago</div>
            <div class="row q-col-gutter-xs">
              <div v-for="c in cuentas" :key="c" class="col-4">
                <div
                  class="pill-option text-center cursor-pointer"
                  :class="{ active: form.cuentaPago === c }"
                  @click="form.cuentaPago = c"
                >
                  <span style="font-size: 13px;">{{ c }}</span>
                </div>
              </div>
            </div>
          </div>
          <div>
            <div class="text-caption text-weight-bold text-slate-700 q-mb-xs">Próximo vencimiento</div>
            <q-input v-model="form.proximoVencimiento" type="date" borderless class="clean-input" />
          </div>
        </q-card-section>

        <q-card-actions class="justify-end q-pt-md">
          <q-btn
            color="primary"
            :label="editando ? 'Guardar cambios' : 'Crear gasto fijo'"
            no-caps
            unelevated
            class="text-weight-bold"
            style="border-radius: 12px; padding: 8px 20px;"
            :loading="guardando"
            @click="guardar"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useGastosFijosStore } from '@/store/gastosFijosStore'
import { useAuthStore } from '@/store/authStore'
import { useQuasar } from 'quasar'
import { getFechaLocalHoy, parseFechaLocal } from '@/utils/dateUtils'

const $q = useQuasar()
const gastosFijosStore = useGastosFijosStore()
const authStore = useAuthStore()

const periodos = ['diario', 'quincenal', 'mensual', 'bimestral']
const cuentas = ['Efectivo', 'Nequi', 'Bancolombia']

const modalForm = ref(false)
const editando = ref(false)
const editandoId = ref(null)
const guardando = ref(false)

const form = ref({
  nombre: '',
  monto: '',
  periodicidad: 'mensual',
  cuentaPago: 'Efectivo',
  proximoVencimiento: getFechaLocalHoy()
})

// ── Formatters ──────────────────────────────────────────────────────────────

const formatCOP = (val) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(val ?? 0)

const formatFecha = (fechaStr) => {
  if (!fechaStr) return ''
  // parseFechaLocal evita el bug de zona horaria (UTC-5 Colombia)
  return parseFechaLocal(fechaStr).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' })
}

// ── Estado de vencimiento ─────────────────────────────────────────────────

const estaVencido = (fechaStr) => {
  if (!fechaStr) return false
  // Comparar solo fechas sin hora para evitar falsas alarmas por hora del día
  const hoy = new Date()
  hoy.setHours(0, 0, 0, 0)
  const vencimiento = parseFechaLocal(fechaStr)
  vencimiento.setHours(0, 0, 0, 0)
  return vencimiento < hoy
}

const venceEnSieteDias = (fechaStr) => {
  if (!fechaStr) return false
  const hoy = new Date()
  hoy.setHours(0, 0, 0, 0)
  const vencimiento = parseFechaLocal(fechaStr)
  vencimiento.setHours(0, 0, 0, 0)
  const diff = vencimiento - hoy
  return diff >= 0 && diff <= 7 * 24 * 60 * 60 * 1000
}

const badgeEstado = (fechaStr) => {
  if (estaVencido(fechaStr)) return { color: 'red-7', label: '⚠️ VENCIDO' }
  if (venceEnSieteDias(fechaStr)) return { color: 'orange-7', label: '📅 Próximo' }
  return { color: 'green-7', label: '✅ Al día' }
}

const estadoClaseCard = (fechaStr) => {
  if (estaVencido(fechaStr)) return 'gf-card--vencido'
  if (venceEnSieteDias(fechaStr)) return 'gf-card--proximo'
  return ''
}

// ── Íconos y colores de período ───────────────────────────────────────────

const iconoPeriodo = (p) => {
  const map = { diario: 'today', quincenal: 'date_range', mensual: 'calendar_month', bimestral: 'event_repeat' }
  return map[p] || 'event'
}

const colorPeriodo = (p) => {
  const map = { diario: 'orange-7', quincenal: 'blue-7', mensual: 'purple-7', bimestral: 'teal-7' }
  return map[p] || 'grey'
}

const bgIconoPeriodo = (p) => {
  const map = { diario: '#f97316', quincenal: '#3b82f6', mensual: '#7c3aed', bimestral: '#0d9488' }
  return map[p] || '#64748b'
}

// ── Computed: resumen ──────────────────────────────────────────────────────

const totalMensual = computed(() =>
  gastosFijosStore.gastosFijos.reduce((acc, gf) => acc + Number(gf.monto ?? 0), 0)
)

const proximoVencimientoLabel = computed(() => {
  const lista = gastosFijosStore.gastosFijos
    .filter((gf) => gf.proximoVencimiento)
    .map((gf) => parseFechaLocal(gf.proximoVencimiento))
    .sort((a, b) => a - b)
  if (!lista.length) return 'Sin datos'
  return lista[0].toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' })
})

// ── Acciones ───────────────────────────────────────────────────────────────

const abrirModalCrear = () => {
  editando.value = false
  editandoId.value = null
  form.value = { nombre: '', monto: '', periodicidad: 'mensual', cuentaPago: 'Efectivo', proximoVencimiento: getFechaLocalHoy() }
  modalForm.value = true
}

const abrirModalEditar = (gf) => {
  editando.value = true
  editandoId.value = gf._id
  form.value = {
    nombre: gf.nombre,
    monto: gf.monto,
    periodicidad: gf.periodicidad,
    cuentaPago: gf.cuentaPago,
    proximoVencimiento: gf.proximoVencimiento ? gf.proximoVencimiento.split('T')[0] : getFechaLocalHoy()
  }
  modalForm.value = true
}

const guardar = async () => {
  if (!form.value.nombre || !form.value.monto || !form.value.proximoVencimiento) {
    $q.notify({ type: 'warning', message: '⚠️ Nombre, monto y vencimiento son obligatorios' })
    return
  }
  guardando.value = true
  try {
    if (editando.value) {
      await gastosFijosStore.editarGastoFijo(editandoId.value, form.value)
      $q.notify({ type: 'positive', message: '✅ Gasto fijo actualizado' })
    } else {
      await gastosFijosStore.crearGastoFijo(form.value)
      $q.notify({ type: 'positive', message: '✅ Gasto fijo creado' })
    }
    modalForm.value = false
  } catch (error) {
    $q.notify({ type: 'negative', message: error.response?.data?.mensaje || '❌ Error al guardar' })
  } finally {
    guardando.value = false
  }
}

const confirmarPago = (gf) => {
  $q.dialog({
    title: `Confirmar pago: ${gf.nombre}`,
    message: `¿Confirmas el pago de ${formatCOP(gf.monto)} desde ${gf.cuentaPago}? Se registrará como gasto hoy.`,
    cancel: true,
    persistent: true
  }).onOk(async () => {
    try {
      const res = await gastosFijosStore.confirmarPago(gf._id)
      $q.notify({ type: 'positive', message: `✅ Pago confirmado. Próximo: ${formatFecha(res.proximoVencimiento)}` })
    } catch (error) {
      $q.notify({ type: 'negative', message: error.response?.data?.mensaje || '❌ Error al confirmar pago' })
    }
  })
}

onMounted(() => gastosFijosStore.fetchGastosFijos())
</script>

<style scoped>
/* ── Tarjeta base ──────────────────────────────────────────────────────── */
.gf-card {
  background: #fff;
  border: 1.5px solid #e2e8f0;
  border-radius: 16px;
  transition: box-shadow 0.15s, border-color 0.15s;
}
.gf-card:hover {
  box-shadow: 0 4px 18px rgba(0, 0, 0, 0.08);
  border-color: #bfdbfe;
}

/* ── Variantes de estado ─────────────────────────────────────────────── */
.gf-card--vencido {
  border-color: #fca5a5;
  background: #fff8f8;
}
.gf-card--proximo {
  border-color: #fed7aa;
  background: #fffbf5;
}

/* ── Ícono de período ────────────────────────────────────────────────── */
.gf-icon-wrap {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  flex-shrink: 0;
}
</style>
