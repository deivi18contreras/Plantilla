<template>
  <div class="q-pa-md">

    <!-- ───── Encabezado ───── -->
    <div class="row items-center justify-between q-mb-lg" style="max-width: 1100px; margin: 0 auto;">
      <div>
        <div class="text-h5 text-weight-bolder text-slate-900">Adelantos Internos</div>
        <div class="text-caption text-slate-500">Préstamos internos del negocio a sí mismo</div>
      </div>
    </div>

    <!-- ───── Layout 2 columnas ───── -->
    <div class="row q-col-gutter-lg" style="max-width: 1100px; margin: 0 auto;">

      <!-- ══════════════════════════════════════
           COLUMNA IZQUIERDA — Formulario
      ══════════════════════════════════════ -->
      <div class="col-12 col-md-5">
        <div class="adelanto-panel q-pa-lg">
          <div class="text-subtitle1 text-weight-bolder text-slate-900 q-mb-md">
            <q-icon name="savings" color="red-6" class="q-mr-xs" />
            Registrar Adelanto Interno
          </div>

          <!-- Fecha -->
          <div class="q-mb-md">
            <div class="field-label">Fecha</div>
            <q-input
              v-model="form.fecha"
              type="date"
              borderless
              class="clean-input"
            />
          </div>

          <!-- Monto -->
          <div class="q-mb-md">
            <div class="field-label">Monto</div>
            <q-input
              v-model="form.monto"
              type="number"
              prefix="$"
              placeholder="0"
              borderless
              class="clean-input"
            />
          </div>

          <!-- Motivo -->
          <div class="q-mb-md">
            <div class="field-label">Motivo</div>
            <q-input
              v-model="form.motivo"
              type="textarea"
              placeholder="Ej. Pedido proveedor de carne"
              borderless
              class="clean-input"
              autogrow
            />
          </div>

          <!-- Cuenta origen — chips -->
          <div class="q-mb-lg">
            <div class="field-label q-mb-xs">Cuenta origen</div>
            <div class="row q-gutter-xs">
              <div
                v-for="opt in cuentaOpciones"
                :key="opt.value"
                class="chip-opt cursor-pointer"
                :class="{ 'chip-opt--active': form.cuentaOrigen === opt.value }"
                @click="form.cuentaOrigen = opt.value"
              >
                {{ opt.icon }} {{ opt.label }}
              </div>
            </div>
          </div>

          <!-- Botón registrar -->
          <q-btn
            v-if="authStore.isAdmin"
            color="red-7"
            label="Registrar Adelanto"
            icon="arrow_upward"
            no-caps
            unelevated
            class="full-width text-weight-bold"
            style="border-radius: 12px; height: 46px; font-size: 15px;"
            :loading="guardando"
            @click="guardarAdelanto"
          />
        </div>
      </div>

      <!-- ══════════════════════════════════════
           COLUMNA DERECHA — Lista de pendientes
      ══════════════════════════════════════ -->
      <div class="col-12 col-md-7">

        <!-- Pestañas -->
        <div class="row q-col-gutter-sm q-mb-md">
          <div class="col-6">
            <div
              class="pill-option text-center cursor-pointer"
              :class="{ active: tab === 'pendientes' }"
              @click="tab = 'pendientes'"
            >
              <span class="text-weight-bold">⏳ Pendientes ({{ adelantosStore.pendientes.length }})</span>
            </div>
          </div>
          <div class="col-6">
            <div
              class="pill-option text-center cursor-pointer"
              :class="{ active: tab === 'todos' }"
              @click="cargarTodos"
            >
              <span class="text-weight-bold">📋 Historial completo</span>
            </div>
          </div>
        </div>

        <!-- ── Pendientes ── -->
        <template v-if="tab === 'pendientes'">

          <!-- Loading -->
          <div v-if="adelantosStore.loading" class="column items-center q-py-xl">
            <q-spinner color="primary" size="28px" />
          </div>

          <!-- Sin pendientes -->
          <div
            v-else-if="adelantosStore.pendientes.length === 0"
            class="text-center q-py-xl"
            style="background: #f0fdf4; border: 1.5px solid #86efac; border-radius: 18px;"
          >
            <q-icon name="check_circle" color="green-6" size="48px" />
            <div class="text-subtitle2 text-weight-bolder text-green-7 q-mt-sm">Sin adelantos pendientes ✅</div>
            <div class="text-caption text-green-6">El negocio está al día</div>
          </div>

          <!-- Lista tarjetas pendientes -->
          <div v-else class="column q-gutter-y-sm">
            <div
              v-for="a in pendientesVisibles"
              :key="a._id"
              class="adelanto-card q-pa-md"
            >
              <div class="row items-start no-wrap q-gutter-x-md">

                <!-- Avatar circular con inicial del motivo -->
                <div class="adelanto-avatar flex flex-center text-white text-weight-bolder" style="font-size: 18px; flex-shrink: 0;">
                  {{ primeraLetra(a.motivo) }}
                </div>

                <!-- Info -->
                <div class="col">
                  <div class="row items-center justify-between q-mb-xs">
                    <span class="text-weight-bolder text-slate-900" style="font-size: 14px;">
                      {{ a.motivo || 'Sin motivo especificado' }}
                    </span>
                    <span class="text-caption text-slate-400">{{ formatFecha(a.fecha) }}</span>
                  </div>

                  <!-- Montos -->
                  <div class="row items-center q-gutter-x-sm q-mb-xs">
                    <span class="text-caption text-slate-500">
                      Original: <strong>{{ formatCOP(a.monto) }}</strong>
                    </span>
                    <span class="text-caption text-red-6 text-weight-bold">
                      Pendiente: {{ formatCOP(a.saldoPendiente) }}
                    </span>
                  </div>

                  <!-- Barra de progreso -->
                  <div class="row items-center q-gutter-x-sm">
                    <div class="col">
                      <q-linear-progress
                        :value="porcentajeRecuperado(a)"
                        color="green-5"
                        track-color="red-2"
                        rounded
                        size="8px"
                      />
                    </div>
                    <span class="text-caption text-weight-bold text-green-7" style="min-width: 36px; text-align: right;">
                      {{ Math.round(porcentajeRecuperado(a) * 100) }}%
                    </span>
                  </div>

                  <!-- Historial de abonos desplegable -->
                  <div v-if="a.abonos && a.abonos.length > 0" class="q-mt-xs">
                    <div
                      class="text-caption text-primary cursor-pointer"
                      @click="toggleAbonos(a._id)"
                    >
                      {{ abonosAbiertos.includes(a._id) ? '▲ Ocultar' : '▼ Ver' }} abonos ({{ a.abonos.length }})
                    </div>
                    <div v-if="abonosAbiertos.includes(a._id)" class="column q-gutter-y-xs q-pl-sm q-mt-xs" style="border-left: 2px solid #bfdbfe;">
                      <div v-for="(abono, i) in a.abonos" :key="i" class="row justify-between text-caption">
                        <span class="text-slate-500">{{ formatFecha(abono.fecha) }}</span>
                        <span class="text-green-7 text-weight-bold">+{{ formatCOP(abono.monto) }}</span>
                        <span class="text-slate-400">{{ formatCOP(abono.saldoAntes) }} → {{ formatCOP(abono.saldoDespues) }}</span>
                      </div>
                    </div>
                  </div>
                  <div v-else class="text-caption text-slate-400 q-mt-xs">Sin abonos aún</div>
                </div>

                <!-- Botón abono y editar -->
                <div class="row items-center q-gutter-x-xs" style="flex-shrink: 0;">
                  <q-btn
                    v-if="authStore.isAdmin"
                    flat dense no-caps
                    size="sm"
                    color="primary"
                    icon="edit"
                    label="Editar"
                    style="background: #eff6ff; border-radius: 8px;"
                    class="text-weight-bold"
                    @click="abrirModalEditar(a)"
                  />
                  <q-btn
                    flat dense no-caps
                    size="sm"
                    color="positive"
                    icon="payments"
                    label="Abonar"
                    style="background: #dcfce7; border-radius: 8px;"
                    class="text-weight-bold"
                    @click="abrirModalAbono(a)"
                  />
                </div>

              </div>
            </div>

            <!-- Ver todos / colapsar -->
            <div v-if="adelantosStore.pendientes.length > 5" class="text-center q-mt-xs">
              <q-btn
                flat no-caps dense
                color="primary"
                :label="mostrarTodos ? 'Ver menos ▲' : `Ver todos (${adelantosStore.pendientes.length}) ▼`"
                @click="mostrarTodos = !mostrarTodos"
              />
            </div>

            <!-- Total pendiente acumulado -->
            <div
              class="q-pa-md q-mt-xs"
              style="background: #fef2f2; border: 1.5px solid #fca5a5; border-radius: 14px;"
            >
              <div class="text-caption text-weight-bold text-red-7 q-mb-xs">💸 Total pendiente por recuperar</div>
              <div class="text-h5 text-weight-bolder text-red-7">{{ formatCOP(adelantosStore.totalPendiente) }}</div>
              <div class="text-caption text-red-6">Se descuenta automáticamente en cada cierre de caja</div>
            </div>
          </div>
        </template>

        <!-- ── Historial completo ── -->
        <template v-else>
          <div v-if="adelantosStore.loading" class="column items-center q-py-xl">
            <q-spinner color="primary" size="28px" />
          </div>
          <div v-else class="column q-gutter-y-sm">
            <div
              v-for="a in adelantosStore.todos"
              :key="a._id"
              class="adelanto-card q-pa-md"
            >
              <div class="row items-center no-wrap q-gutter-x-md">
                <q-icon
                  :name="a.estado === 'recuperado' ? 'check_circle' : 'arrow_upward'"
                  :color="a.estado === 'recuperado' ? 'positive' : 'red-6'"
                  size="28px"
                />
                <div class="col">
                  <div class="text-weight-bold text-slate-900">{{ a.motivo || 'Sin motivo' }}</div>
                  <div class="text-caption text-slate-500">{{ formatFecha(a.fecha) }} · Salió de: {{ a.cuentaOrigen || 'Efectivo' }}</div>
                </div>
                <div class="text-right">
                  <div class="text-weight-bolder" :class="a.estado === 'recuperado' ? 'text-green-7' : 'text-red-6'">
                    {{ formatCOP(a.monto) }}
                  </div>
                  <q-badge :color="a.estado === 'recuperado' ? 'positive' : 'warning'" :label="a.estado" />
                </div>
                <div v-if="authStore.isAdmin" class="row items-center q-gutter-x-xs q-ml-sm">
                  <q-btn
                    flat round dense
                    size="sm"
                    color="primary"
                    icon="edit"
                    @click="abrirModalEditar(a)"
                  >
                    <q-tooltip>Editar adelanto</q-tooltip>
                  </q-btn>
                  <q-btn
                    v-if="a.montoRecuperado === 0"
                    flat round dense
                    size="sm"
                    color="negative"
                    icon="delete"
                    @click="confirmarEliminar(a)"
                  >
                    <q-tooltip>Eliminar adelanto</q-tooltip>
                  </q-btn>
                </div>
              </div>
            </div>
          </div>
        </template>

      </div>
    </div>

    <!-- ───── Modal: registrar nuevo adelanto (admin / fallback) ───── -->
    <q-dialog v-model="modalNuevo">
      <q-card style="width: 420px; max-width: 90vw; border-radius: 24px;" class="q-pa-md">
        <q-card-section class="row items-center justify-between q-pb-xs">
          <div class="text-h6 text-weight-bolder text-slate-900">Nuevo Adelanto</div>
          <q-btn flat round icon="close" v-close-popup />
        </q-card-section>

        <q-card-section class="column q-gutter-y-md">
          <div>
            <div class="text-caption text-weight-bold text-slate-700 q-mb-xs">Fecha del adelanto</div>
            <q-input v-model="form.fecha" type="date" borderless class="clean-input" />
          </div>
          <div>
            <div class="text-caption text-weight-bold text-slate-700 q-mb-xs">Monto</div>
            <q-input v-model="form.monto" type="number" prefix="$" placeholder="0" borderless class="clean-input" />
          </div>
          <div>
            <div class="text-caption text-weight-bold text-slate-700 q-mb-xs">Motivo</div>
            <q-input v-model="form.motivo" placeholder="Ej. Pedido proveedor de carne" borderless class="clean-input" />
          </div>
          <div>
            <div class="text-caption text-weight-bold text-slate-700 q-mb-xs">¿De qué cuenta salió el dinero?</div>
            <q-select
              v-model="form.cuentaOrigen"
              :options="[
                { label: '💵 Efectivo (descuenta de caja)', value: 'Efectivo' },
                { label: '🏦 Bancolombia (descuenta de banco)', value: 'Bancolombia' },
                { label: '📱 Nequi (descuenta de Nequi)', value: 'Nequi' },
                { label: '⚪ Externo (sin tocar cuentas)', value: 'Externo' }
              ]"
              emit-value
              map-options
              borderless
              class="clean-input"
            />
          </div>
        </q-card-section>

        <q-card-actions class="justify-end q-pt-md">
          <q-btn
            color="primary"
            label="Guardar adelanto"
            no-caps
            unelevated
            class="text-weight-bold"
            style="border-radius: 12px; padding: 8px 20px;"
            :loading="guardando"
            @click="guardarAdelanto"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- ───── Modal: abonar / pagar adelanto ───── -->
    <q-dialog v-model="modalAbono">
      <q-card style="width: 100%; max-width: 440px; border-radius: 20px;" class="q-pa-md">
        <q-card-section class="row items-center justify-between q-pb-none">
          <div class="text-subtitle1 text-weight-bolder text-slate-900">💵 Abonar / Pagar Adelanto</div>
          <q-btn flat round dense icon="close" v-close-popup />
        </q-card-section>

        <q-card-section class="q-pt-sm" v-if="adelantoSeleccionado">
          <div class="q-pa-sm bg-slate-100 rounded q-mb-md" style="border-radius: 10px;">
            <div class="text-weight-bold text-slate-800">{{ adelantoSeleccionado.motivo || 'Sin motivo' }}</div>
            <div class="text-caption text-slate-500">
              Fecha: {{ formatFecha(adelantoSeleccionado.fecha) }} · Salió de: {{ adelantoSeleccionado.cuentaOrigen || 'Efectivo' }}
            </div>
            <div class="text-subtitle2 text-weight-bolder text-red-6 q-mt-xs">
              Saldo Pendiente: {{ formatCOP(adelantoSeleccionado.saldoPendiente) }}
            </div>
          </div>

          <div class="q-mb-md">
            <div class="text-caption text-weight-bold text-slate-700 q-mb-xs">¿Cuánto vas a abonar o pagar?</div>
            <q-input
              v-model.number="montoAbono"
              type="number"
              placeholder="$ 0"
              prefix="$"
              borderless
              class="clean-input"
              autofocus
            />
          </div>

          <div class="row q-gutter-xs q-mb-md">
            <q-btn
              flat dense no-caps size="sm"
              color="primary"
              label="Pagar todo el saldo"
              style="background: #eff6ff; border-radius: 6px;"
              @click="montoAbono = adelantoSeleccionado.saldoPendiente"
            />
          </div>

          <div class="q-mb-md">
            <div class="text-caption text-weight-bold text-slate-700 q-mb-xs">¿A qué cuenta entra la plata devuelta?</div>
            <q-select
              v-model="cuentaDestinoAbono"
              :options="[
                { label: '💵 Efectivo (suma a caja)', value: 'Efectivo' },
                { label: '🏦 Bancolombia (suma a banco)', value: 'Bancolombia' },
                { label: '📱 Nequi (suma a Nequi)', value: 'Nequi' },
                { label: '⚪ Externo (sin tocar cuentas)', value: 'Externo' }
              ]"
              emit-value
              map-options
              borderless
              class="clean-input"
            />
          </div>

          <q-btn
            no-caps
            label="Confirmar Abono / Pago"
            color="positive"
            class="full-width text-weight-bold"
            style="border-radius: 12px; height: 44px;"
            :loading="guardandoAbono"
            @click="confirmarAbono"
          />
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- ───── Modal: editar adelanto ───── -->
    <q-dialog v-model="modalEditar">
      <q-card style="width: 100%; max-width: 440px; border-radius: 20px;" class="q-pa-md">
        <q-card-section class="row items-center justify-between q-pb-none">
          <div class="text-subtitle1 text-weight-bolder text-slate-900">✏️ Editar Adelanto</div>
          <q-btn flat round dense icon="close" v-close-popup />
        </q-card-section>

        <q-card-section class="q-pt-sm column q-gutter-y-md" v-if="formEditar">
          <div v-if="formEditar.montoRecuperado > 0" class="q-pa-xs bg-amber-1 text-amber-9 text-caption rounded-borders q-px-sm" style="border: 1px solid #fef3c7; border-radius: 8px;">
            ⚠️ Este adelanto ya tiene <strong>{{ formatCOP(formEditar.montoRecuperado) }}</strong> abonados. El nuevo monto total no puede ser menor a ese valor.
          </div>

          <div>
            <div class="text-caption text-weight-bold text-slate-700 q-mb-xs">Fecha del adelanto</div>
            <q-input v-model="formEditar.fecha" type="date" borderless class="clean-input" />
          </div>

          <div>
            <div class="text-caption text-weight-bold text-slate-700 q-mb-xs">Monto total original</div>
            <q-input
              v-model="formEditar.monto"
              type="number"
              prefix="$"
              placeholder="0"
              borderless
              class="clean-input"
            />
          </div>

          <div>
            <div class="text-caption text-weight-bold text-slate-700 q-mb-xs">Motivo / Descripción</div>
            <q-input
              v-model="formEditar.motivo"
              placeholder="Ej. Pedido proveedor de carne"
              borderless
              class="clean-input"
            />
          </div>

          <div>
            <div class="text-caption text-weight-bold text-slate-700 q-mb-xs">¿De qué cuenta salió el dinero?</div>
            <q-select
              v-model="formEditar.cuentaOrigen"
              :options="[
                { label: '💵 Efectivo (caja física)', value: 'Efectivo' },
                { label: '🏦 Bancolombia', value: 'Bancolombia' },
                { label: '📱 Nequi', value: 'Nequi' },
                { label: '⚪ Externo (sin tocar cuentas)', value: 'Externo' }
              ]"
              emit-value
              map-options
              borderless
              class="clean-input"
            />
          </div>

          <div class="row items-center justify-between q-pt-sm">
            <q-btn
              v-if="formEditar.montoRecuperado === 0"
              flat no-caps
              color="negative"
              icon="delete"
              label="Eliminar"
              class="text-weight-bold"
              @click="confirmarEliminarDesdeModal"
            />
            <div v-else></div>

            <q-btn
              no-caps
              label="Guardar cambios"
              color="primary"
              unelevated
              class="text-weight-bold"
              style="border-radius: 12px; height: 42px; padding: 0 20px;"
              :loading="guardandoEdicion"
              @click="confirmarEdicion"
            />
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAdelantosStore } from '@/store/adelantosStore'
import { useCuentasStore } from '@/store/cuentasStore'
import { useAuthStore } from '@/store/authStore'
import { useQuasar } from 'quasar'
import { getFechaLocalHoy, parseFechaLocal } from '@/utils/dateUtils'

const $q = useQuasar()
const adelantosStore = useAdelantosStore()
const cuentasStore = useCuentasStore()
const authStore = useAuthStore()

// ── Estado de tabs y UI ──────────────────────────────────────────────────
const tab = ref('pendientes')
const mostrarTodos = ref(false)

// ── Formulario nuevo adelanto ─────────────────────────────────────────────
const modalNuevo = ref(false)
const guardando = ref(false)
const form = ref({ fecha: getFechaLocalHoy(), monto: '', motivo: '', cuentaOrigen: 'Efectivo' })

const cuentaOpciones = [
  { value: 'Efectivo', label: 'Efectivo', icon: '💵' },
  { value: 'Nequi', label: 'Nequi', icon: '📱' },
  { value: 'Bancolombia', label: 'Bancolombia', icon: '🏦' },
  { value: 'Externo', label: 'Externo', icon: '⚪' }
]

// ── Modal abono ────────────────────────────────────────────────────────────
const modalAbono = ref(false)
const adelantoSeleccionado = ref(null)
const montoAbono = ref('')
const cuentaDestinoAbono = ref('Efectivo')
const guardandoAbono = ref(false)

// ── Modal editar ───────────────────────────────────────────────────────────
const modalEditar = ref(false)
const guardandoEdicion = ref(false)
const formEditar = ref({
  _id: '',
  fecha: getFechaLocalHoy(),
  monto: '',
  motivo: '',
  cuentaOrigen: 'Efectivo',
  montoRecuperado: 0
})

// ── Historial abonos desplegado ────────────────────────────────────────────
const abonosAbiertos = ref([])

// ── Computed ───────────────────────────────────────────────────────────────

// Máximo 5 pendientes visibles, a menos que se haya expandido
const pendientesVisibles = computed(() =>
  mostrarTodos.value
    ? adelantosStore.pendientes
    : adelantosStore.pendientes.slice(0, 5)
)

// ── Helpers ────────────────────────────────────────────────────────────────

const formatCOP = (val) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(val ?? 0)

const formatFecha = (fechaStr) => {
  if (!fechaStr) return ''
  return parseFechaLocal(fechaStr).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' })
}

const primeraLetra = (motivo) =>
  motivo ? motivo.trim().charAt(0).toUpperCase() : '?'

const porcentajeRecuperado = (a) => {
  if (!a.monto || a.monto === 0) return 0
  const recuperado = Number(a.montoRecuperado ?? 0)
  return Math.min(recuperado / Number(a.monto), 1)
}

// ── Acciones ───────────────────────────────────────────────────────────────

const toggleAbonos = (id) => {
  const idx = abonosAbiertos.value.indexOf(id)
  if (idx === -1) abonosAbiertos.value.push(id)
  else abonosAbiertos.value.splice(idx, 1)
}

const abrirModalAbono = (adelanto) => {
  adelantoSeleccionado.value = adelanto
  montoAbono.value = adelanto.saldoPendiente
  cuentaDestinoAbono.value = adelanto.cuentaOrigen && adelanto.cuentaOrigen !== 'Externo' ? adelanto.cuentaOrigen : 'Efectivo'
  modalAbono.value = true
}

const confirmarAbono = async () => {
  if (!montoAbono.value || Number(montoAbono.value) <= 0) {
    $q.notify({ type: 'warning', message: '⚠️ Ingresa un monto válido mayor a 0' })
    return
  }
  guardandoAbono.value = true
  try {
    const res = await adelantosStore.abonarManual(
      adelantoSeleccionado.value._id,
      Number(montoAbono.value),
      cuentaDestinoAbono.value
    )
    $q.notify({ type: 'positive', message: res.mensaje || '✅ Pago registrado' })
    modalAbono.value = false
    adelantoSeleccionado.value = null
    await cuentasStore.fetchCuentas()
  } catch (error) {
    $q.notify({ type: 'negative', message: error.response?.data?.mensaje || '❌ Error al registrar abono' })
  } finally {
    guardandoAbono.value = false
  }
}

// ── Edición y eliminación de adelantos ───────────────────────────────────────
const abrirModalEditar = (adelanto) => {
  let fechaFormato = getFechaLocalHoy()
  if (adelanto.fecha) {
    const d = parseFechaLocal(adelanto.fecha)
    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    fechaFormato = `${year}-${month}-${day}`
  }

  formEditar.value = {
    _id: adelanto._id,
    fecha: fechaFormato,
    monto: adelanto.monto,
    motivo: adelanto.motivo || '',
    cuentaOrigen: adelanto.cuentaOrigen || 'Efectivo',
    montoRecuperado: Number(adelanto.montoRecuperado || 0)
  }
  modalEditar.value = true
}

const confirmarEdicion = async () => {
  if (!formEditar.value.fecha || !formEditar.value.monto) {
    $q.notify({ type: 'warning', message: '⚠️ La fecha y el monto son obligatorios' })
    return
  }
  const montoNum = Number(formEditar.value.monto)
  if (isNaN(montoNum) || montoNum <= 0) {
    $q.notify({ type: 'warning', message: '⚠️ Ingresa un monto válido mayor a 0' })
    return
  }
  if (montoNum < formEditar.value.montoRecuperado) {
    $q.notify({
      type: 'warning',
      message: `⚠️ El monto no puede ser menor a lo recuperado ($${formEditar.value.montoRecuperado.toLocaleString('es-CO')})`
    })
    return
  }

  guardandoEdicion.value = true
  try {
    const res = await adelantosStore.editarAdelanto(formEditar.value._id, {
      fecha: formEditar.value.fecha,
      monto: montoNum,
      motivo: formEditar.value.motivo,
      cuentaOrigen: formEditar.value.cuentaOrigen
    })
    $q.notify({ type: 'positive', message: res.mensaje || '✅ Adelanto actualizado correctamente' })
    modalEditar.value = false
    await cuentasStore.fetchCuentas()
  } catch (error) {
    $q.notify({ type: 'negative', message: error.response?.data?.mensaje || '❌ Error al editar adelanto' })
  } finally {
    guardandoEdicion.value = false
  }
}

const confirmarEliminar = (adelanto) => {
  $q.dialog({
    title: '🗑️ Eliminar Adelanto',
    message: `¿Estás seguro de eliminar el adelanto "${adelanto.motivo || 'Sin motivo'}" por ${formatCOP(adelanto.monto)}? El dinero saliente se reintegrará a la cuenta de origen.`,
    cancel: { label: 'Cancelar', flat: true, noCaps: true },
    ok: { label: 'Sí, eliminar', color: 'negative', unelevated: true, noCaps: true }
  }).onOk(async () => {
    try {
      const res = await adelantosStore.eliminarAdelanto(adelanto._id)
      $q.notify({ type: 'positive', message: res.mensaje || '✅ Adelanto eliminado correctamente' })
      if (modalEditar.value) modalEditar.value = false
      await cuentasStore.fetchCuentas()
    } catch (error) {
      $q.notify({ type: 'negative', message: error.response?.data?.mensaje || '❌ Error al eliminar' })
    }
  })
}

const confirmarEliminarDesdeModal = () => {
  if (!formEditar.value) return
  confirmarEliminar({
    _id: formEditar.value._id,
    motivo: formEditar.value.motivo,
    monto: formEditar.value.monto
  })
}

const cargarTodos = async () => {
  tab.value = 'todos'
  await adelantosStore.fetchTodos()
}

const guardarAdelanto = async () => {
  if (!form.value.fecha || !form.value.monto) {
    $q.notify({ type: 'warning', message: '⚠️ La fecha y el monto son obligatorios' })
    return
  }
  guardando.value = true
  try {
    await adelantosStore.registrarAdelanto({
      fecha: form.value.fecha,
      monto: Number(form.value.monto),
      motivo: form.value.motivo,
      cuentaOrigen: form.value.cuentaOrigen
    })
    $q.notify({ type: 'positive', message: '✅ Adelanto registrado correctamente' })
    modalNuevo.value = false
    form.value = { fecha: getFechaLocalHoy(), monto: '', motivo: '', cuentaOrigen: 'Efectivo' }
    await cuentasStore.fetchCuentas()
  } catch (error) {
    $q.notify({ type: 'negative', message: error.response?.data?.mensaje || '❌ Error al guardar' })
  } finally {
    guardando.value = false
  }
}

onMounted(() => {
  adelantosStore.fetchPendientes()
  cuentasStore.fetchCuentas()
})
</script>

<style scoped>
/* ── Panel formulario ────────────────────────────────────────────────── */
.adelanto-panel {
  background: #fff;
  border: 1.5px solid #e2e8f0;
  border-radius: 20px;
  height: fit-content;
}

/* ── Tarjeta pendiente ────────────────────────────────────────────────── */
.adelanto-card {
  background: #fff;
  border: 1.5px solid #e2e8f0;
  border-radius: 16px;
  transition: box-shadow 0.15s, border-color 0.15s;
}
.adelanto-card:hover {
  box-shadow: 0 4px 18px rgba(0, 0, 0, 0.07);
  border-color: #fca5a5;
}

/* ── Avatar circular ─────────────────────────────────────────────────── */
.adelanto-avatar {
  width: 46px;
  height: 46px;
  border-radius: 50%;
  background: #fee2e2;
  color: #dc2626;
  flex-shrink: 0;
}

/* ── Field label ─────────────────────────────────────────────────────── */
.field-label {
  font-size: 12px;
  font-weight: 700;
  color: #475569;
  margin-bottom: 4px;
}

/* ── Chips de cuenta ─────────────────────────────────────────────────── */
.chip-opt {
  padding: 6px 12px;
  border: 1.5px solid #e2e8f0;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  color: #64748b;
  background: #f8fafc;
  transition: all 0.15s;
}
.chip-opt:hover {
  border-color: #93c5fd;
  background: #eff6ff;
  color: #1d4ed8;
}
.chip-opt--active {
  border-color: #ef4444;
  background: #fef2f2;
  color: #dc2626;
}
</style>
