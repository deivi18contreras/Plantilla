<template>
  <q-dialog :model-value="modelValue" @update:model-value="$emit('update:modelValue', $event)">
    <q-card class="modal-extracto-card q-pa-none">
      
      <!-- HEADER CON GRADIENTE SEGÚN LA CUENTA -->
      <div class="extracto-header q-pa-md text-white" :class="headerClass">
        <div class="row items-center justify-between q-mb-sm">
          <div class="row items-center q-gutter-x-sm">
            <q-avatar size="38px" :icon="cuentaIcon" color="white" :text-color="headerIconColor" class="shadow-1" />
            <div>
              <div class="text-caption text-weight-medium opacity-80">Extracto de Cuenta</div>
              <div class="text-h6 text-weight-bolder leading-tight">{{ cuentaNombre }}</div>
            </div>
          </div>
          <q-btn flat round dense icon="close" color="white" v-close-popup />
        </div>

        <!-- SALDO DESTACADO -->
        <div class="q-mt-sm">
          <div class="text-caption opacity-80">Saldo Disponible</div>
          <div class="text-h4 text-weight-bolder">{{ formatCOP(saldoActual) }}</div>
        </div>

        <!-- RESUMEN ENTRADAS VS SALIDAS -->
        <div class="row q-col-gutter-xs q-mt-sm">
          <div class="col-6">
            <div class="metric-mini-card bg-white-15 q-pa-xs rounded-borders text-center">
              <div class="text-caption text-weight-medium opacity-90">Entradas (+)</div>
              <div class="text-weight-bolder text-green-2 text-subtitle2">+ {{ formatCOP(totalEntradas) }}</div>
            </div>
          </div>
          <div class="col-6">
            <div class="metric-mini-card bg-white-15 q-pa-xs rounded-borders text-center">
              <div class="text-caption text-weight-medium opacity-90">Salidas (-)</div>
              <div class="text-weight-bolder text-red-2 text-subtitle2">- {{ formatCOP(totalSalidas) }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- CONTENIDO Y FILTROS -->
      <div class="q-pa-md">
        <!-- PÍLDORAS DE FILTRO RÁPIDO -->
        <div class="row q-gutter-xs q-mb-md justify-center">
          <q-btn
            no-caps
            rounded
            dense
            size="sm"
            class="q-px-sm text-weight-bold"
            :color="filtroTipo === 'todos' ? 'primary' : 'grey-3'"
            :text-color="filtroTipo === 'todos' ? 'white' : 'slate-700'"
            label="Todos"
            @click="filtroTipo = 'todos'"
          />
          <q-btn
            no-caps
            rounded
            dense
            size="sm"
            class="q-px-sm text-weight-bold"
            :color="filtroTipo === 'entradas' ? 'positive' : 'grey-3'"
            :text-color="filtroTipo === 'entradas' ? 'white' : 'slate-700'"
            label="🟢 Entradas"
            @click="filtroTipo = 'entradas'"
          />
          <q-btn
            no-caps
            rounded
            dense
            size="sm"
            class="q-px-sm text-weight-bold"
            :color="filtroTipo === 'salidas' ? 'negative' : 'grey-3'"
            :text-color="filtroTipo === 'salidas' ? 'white' : 'slate-700'"
            label="🔴 Salidas"
            @click="filtroTipo = 'salidas'"
          />
        </div>

        <!-- LISTA DE MOVIMIENTOS -->
        <div v-if="loading" class="row justify-center q-py-lg">
          <q-spinner color="primary" size="32px" />
        </div>

        <div v-else-if="movimientosFiltrados.length === 0" class="text-center text-slate-400 q-py-xl">
          <q-icon name="receipt_long" size="40px" class="q-mb-xs opacity-40" />
          <div>No hay movimientos registrados para esta cuenta</div>
        </div>

        <q-list v-else separator class="lista-movimientos-scroll">
          <q-item
            v-for="m in movimientosFiltrados"
            :key="m._id"
            class="q-px-none q-py-sm"
          >
            <q-item-section avatar style="min-width: 38px">
              <q-avatar
                size="32px"
                :color="esEntrada(m) ? 'green-1' : 'red-1'"
                :text-color="esEntrada(m) ? 'positive' : 'negative'"
                :icon="esEntrada(m) ? 'arrow_downward' : 'arrow_upward'"
              />
            </q-item-section>

            <q-item-section>
              <div class="row items-center justify-between no-wrap">
                <span class="text-weight-bold text-slate-900 text-body2 ellipsis" style="max-width: 170px;">
                  {{ m.descripcion || (m.tipo === 'recaudo' ? 'Recaudo de ventas' : m.tipo) }}
                </span>
                <span
                  class="text-weight-bolder text-body2"
                  :class="esEntrada(m) ? 'text-positive' : 'text-negative'"
                >
                  {{ esEntrada(m) ? '+' : '-' }} {{ formatCOP(m.monto) }}
                </span>
              </div>

              <div class="row items-center justify-between text-caption text-slate-500 q-mt-xs">
                <span>{{ formatFechaItem(m.fecha) }}</span>
                <q-badge
                  v-if="m.categoria"
                  outline
                  :color="esEntrada(m) ? 'positive' : 'negative'"
                  class="text-caption font-medium"
                >
                  {{ m.categoria }}
                </q-badge>
              </div>
            </q-item-section>
          </q-item>
        </q-list>
      </div>

      <!-- FOOTER CON ACCIONES -->
      <div class="q-pa-md bg-slate-50 border-t border-slate-200 row justify-between items-center">
        <q-btn
          flat
          no-caps
          dense
          color="primary"
          icon="history"
          label="Ver en Historial"
          class="text-weight-bold"
          @click="irAHistorial"
        />
        <q-btn
          unelevated
          no-caps
          color="slate-800"
          label="Cerrar"
          class="text-weight-bold q-px-md"
          v-close-popup
        />
      </div>

    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { getData } from '@/services/apiService'
import { useCuentasStore } from '@/store/cuentasStore'
import { parseFechaLocal } from '@/utils/dateUtils'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  cuentaNombre: { type: String, default: 'Nequi' }
})

const emit = defineEmits(['update:modelValue'])

const router = useRouter()
const cuentasStore = useCuentasStore()
const loading = ref(false)
const movimientos = ref([])
const filtroTipo = ref('todos')

const formatCOP = (val) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(val ?? 0)

const formatFechaItem = (fechaStr) => {
  if (!fechaStr) return ''
  const d = parseFechaLocal(fechaStr)
  return d.toLocaleDateString('es-CO', { day: '2-digit', month: 'short' })
}

const saldoActual = computed(() => {
  if (props.cuentaNombre === 'Total') {
    return cuentasStore.totalSaldo
  }
  return cuentasStore.saldoPor(props.cuentaNombre)
})

const cuentaIcon = computed(() => {
  if (props.cuentaNombre === 'Nequi') return 'phone_android'
  if (props.cuentaNombre === 'Bancolombia') return 'account_balance'
  if (props.cuentaNombre === 'Efectivo') return 'payments'
  return 'account_balance_wallet'
})

const headerClass = computed(() => {
  if (props.cuentaNombre === 'Nequi') return 'bg-gradient-nequi'
  if (props.cuentaNombre === 'Bancolombia') return 'bg-gradient-bancolombia'
  if (props.cuentaNombre === 'Efectivo') return 'bg-gradient-efectivo'
  return 'bg-gradient-total'
})

const headerIconColor = computed(() => {
  if (props.cuentaNombre === 'Nequi') return 'purple-9'
  if (props.cuentaNombre === 'Bancolombia') return 'amber-10'
  if (props.cuentaNombre === 'Efectivo') return 'green-9'
  return 'blue-9'
})

const esEntrada = (m) => {
  if (m.tipo === 'recaudo') return true
  if (m.tipo === 'transferencia' && m.cuentaDestino === props.cuentaNombre) return true
  return false
}

const cargarMovimientosCuenta = async () => {
  loading.value = true
  try {
    const params = { limit: 150 }
    if (props.cuentaNombre && props.cuentaNombre !== 'Total') {
      params.cuenta = props.cuentaNombre
    }
    const res = await getData('/movimientos', params)
    movimientos.value = res || []
  } catch (error) {
    console.error('Error al cargar movimientos de cuenta:', error)
  } finally {
    loading.value = false
  }
}

watch(() => props.modelValue, (isOpen) => {
  if (isOpen) {
    filtroTipo.value = 'todos'
    cargarMovimientosCuenta()
    cuentasStore.fetchCuentas()
  }
})

watch(() => props.cuentaNombre, () => {
  if (props.modelValue) {
    cargarMovimientosCuenta()
  }
})

const totalEntradas = computed(() => {
  return movimientos.value
    .filter(m => esEntrada(m))
    .reduce((sum, m) => sum + (m.monto || 0), 0)
})

const totalSalidas = computed(() => {
  return movimientos.value
    .filter(m => !esEntrada(m))
    .reduce((sum, m) => sum + (m.monto || 0), 0)
})

const movimientosFiltrados = computed(() => {
  if (filtroTipo.value === 'entradas') {
    return movimientos.value.filter(m => esEntrada(m))
  }
  if (filtroTipo.value === 'salidas') {
    return movimientos.value.filter(m => !esEntrada(m))
  }
  return movimientos.value
})

const irAHistorial = () => {
  emit('update:modelValue', false)
  const query = props.cuentaNombre !== 'Total' ? { cuenta: props.cuentaNombre } : {}
  router.push({ path: '/historial', query })
}
</script>

<style scoped>
.modal-extracto-card {
  width: 100%;
  max-width: 440px;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
}

.bg-gradient-nequi {
  background: linear-gradient(135deg, #7b1fa2, #4a148c);
}

.bg-gradient-bancolombia {
  background: linear-gradient(135deg, #f57f17, #e65100);
}

.bg-gradient-efectivo {
  background: linear-gradient(135deg, #2e7d32, #1b5e20);
}

.bg-gradient-total {
  background: linear-gradient(135deg, #1976d2, #0d47a1);
}

.bg-white-15 {
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(4px);
}

.opacity-80 {
  opacity: 0.85;
}

.opacity-90 {
  opacity: 0.95;
}

.lista-movimientos-scroll {
  max-height: 320px;
  overflow-y: auto;
}
</style>

