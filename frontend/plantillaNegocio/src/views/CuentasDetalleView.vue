<template>
  <div class="row justify-center q-pa-md">
    <div class="card-widget" style="max-width: 960px; width: 100%;">

      <!-- ENCABEZADO -->
      <div class="row items-center justify-between q-mb-md">
        <div>
          <div class="text-h5 text-weight-bolder text-slate-900">Cuentas y Bancos</div>
          <div class="text-caption text-slate-500 font-medium">
            Extracto y movimientos detallados de tus cuentas y transferencias
          </div>
        </div>

        <q-btn
          unelevated
          no-caps
          color="primary"
          icon="swap_horiz"
          label="Transferir Fondos"
          class="text-weight-bold"
          @click="$router.push('/transferencia')"
        />
      </div>

      <!-- TARJETAS SUPERIORES RESUMEN DE SALDOS -->
      <div class="row q-col-gutter-sm q-mb-lg">
        <div class="col-12 col-sm-6 col-md-3">
          <div
            class="saldo-card cursor-pointer"
            :class="{ 'card-activa-efectivo': cuentaActiva === 'Efectivo' }"
            @click="seleccionarCuenta('Efectivo')"
          >
            <div class="row items-center justify-between q-mb-xs">
              <span class="text-caption font-medium text-slate-500">💵 Efectivo</span>
              <q-icon name="payments" color="positive" size="20px" />
            </div>
            <div class="text-h6 text-weight-bolder text-slate-900">
              {{ formatCOP(cuentasStore.saldoPor('Efectivo')) }}
            </div>
            <div class="text-caption text-slate-400" style="font-size: 11px;">Caja & Ganancia limpia</div>
          </div>
        </div>

        <div class="col-12 col-sm-6 col-md-3">
          <div
            class="saldo-card cursor-pointer"
            :class="{ 'card-activa-nequi': cuentaActiva === 'Nequi' }"
            @click="seleccionarCuenta('Nequi')"
          >
            <div class="row items-center justify-between q-mb-xs">
              <span class="text-caption font-medium text-slate-500">📱 Nequi</span>
              <q-icon name="phone_android" color="purple-7" size="20px" />
            </div>
            <div class="text-h6 text-weight-bolder text-slate-900">
              {{ formatCOP(cuentasStore.saldoPor('Nequi')) }}
            </div>
            <div class="text-caption text-slate-400" style="font-size: 11px;">Transferencias QR / Cel</div>
          </div>
        </div>

        <div class="col-12 col-sm-6 col-md-3">
          <div
            class="saldo-card cursor-pointer"
            :class="{ 'card-activa-bancolombia': cuentaActiva === 'Bancolombia' }"
            @click="seleccionarCuenta('Bancolombia')"
          >
            <div class="row items-center justify-between q-mb-xs">
              <span class="text-caption font-medium text-slate-500">🏦 Bancolombia</span>
              <q-icon name="account_balance" color="amber-9" size="20px" />
            </div>
            <div class="text-h6 text-weight-bolder text-slate-900">
              {{ formatCOP(cuentasStore.saldoPor('Bancolombia')) }}
            </div>
            <div class="text-caption text-slate-400" style="font-size: 11px;">Ahorros del negocio</div>
          </div>
        </div>

        <div class="col-12 col-sm-6 col-md-3">
          <div
            class="saldo-card cursor-pointer"
            :class="{ 'card-activa-todas': cuentaActiva === 'Todas' }"
            @click="seleccionarCuenta('Todas')"
          >
            <div class="row items-center justify-between q-mb-xs">
              <span class="text-caption font-medium text-slate-500">💼 Total en Cuentas</span>
              <q-icon name="account_balance_wallet" color="primary" size="20px" />
            </div>
            <div class="text-h6 text-weight-bolder text-primary">
              {{ formatCOP(cuentasStore.totalSaldo) }}
            </div>
            <div class="text-caption text-slate-400" style="font-size: 11px;">Todos los bolsillos</div>
          </div>
        </div>
      </div>

      <!-- PESTAÑAS DE SELECCIÓN -->
      <div class="row q-col-gutter-xs q-mb-md">
        <div class="col-3" v-for="c in ['Nequi', 'Bancolombia', 'Efectivo', 'Todas']" :key="c">
          <div
            class="pill-option text-center cursor-pointer text-weight-bold"
            :class="{ active: cuentaActiva === c }"
            @click="seleccionarCuenta(c)"
          >
            {{ c === 'Todas' ? '🌐 Todas' : c === 'Nequi' ? '📱 Nequi' : c === 'Bancolombia' ? '🏦 Bancolombia' : '💵 Efectivo' }}
          </div>
        </div>
      </div>

      <!-- MÉTRICAS DE ENTRADA Y SALIDA DEL EXTRACTO -->
      <div class="row q-col-gutter-sm q-mb-md">
        <div class="col-12 col-sm-4">
          <div class="metric-box bg-green-1 text-positive q-pa-md rounded-borders">
            <div class="row items-center justify-between">
              <span class="text-caption text-weight-bold">Total Entradas (+)</span>
              <q-icon name="arrow_downward" size="20px" />
            </div>
            <div class="text-h6 text-weight-bolder q-mt-xs">+ {{ formatCOP(resumenExtracto.entradas) }}</div>
            <div class="text-caption opacity-80" style="font-size:11px;">Recaudos y traslados recibidos</div>
          </div>
        </div>

        <div class="col-12 col-sm-4">
          <div class="metric-box bg-red-1 text-negative q-pa-md rounded-borders">
            <div class="row items-center justify-between">
              <span class="text-caption text-weight-bold">Total Salidas (-)</span>
              <q-icon name="arrow_upward" size="20px" />
            </div>
            <div class="text-h6 text-weight-bolder q-mt-xs">- {{ formatCOP(resumenExtracto.salidas) }}</div>
            <div class="text-caption opacity-80" style="font-size:11px;">Pagos a proveedores y gastos</div>
          </div>
        </div>

        <div class="col-12 col-sm-4">
          <div
            class="metric-box q-pa-md rounded-borders"
            :class="resumenExtracto.neto >= 0 ? 'bg-blue-1 text-primary' : 'bg-orange-1 text-orange-9'"
          >
            <div class="row items-center justify-between">
              <span class="text-caption text-weight-bold">Flujo Neto</span>
              <q-icon name="trending_up" size="20px" />
            </div>
            <div class="text-h6 text-weight-bolder q-mt-xs">
              {{ resumenExtracto.neto >= 0 ? '+' : '' }} {{ formatCOP(resumenExtracto.neto) }}
            </div>
            <div class="text-caption opacity-80" style="font-size:11px;">Entradas menos Salidas</div>
          </div>
        </div>
      </div>

      <!-- BUSCADOR Y FILTROS -->
      <div class="row items-center justify-between q-gutter-sm q-mb-md">
        <div class="row items-center q-gutter-xs col-12 col-sm-auto">
          <q-input
            v-model="busquedaTexto"
            dense
            outlined
            placeholder="Buscar proveedor o concepto..."
            class="search-input"
            style="min-width: 240px;"
          >
            <template #prepend>
              <q-icon name="search" size="18px" color="slate-400" />
            </template>
            <template #append v-if="busquedaTexto">
              <q-icon name="close" size="16px" class="cursor-pointer" @click="busquedaTexto = ''" />
            </template>
          </q-input>
        </div>

        <!-- FILTRO DE TIPO: TODOS / ENTRADAS / SALIDAS -->
        <div class="row q-gutter-xs">
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
      </div>

      <!-- LISTADO DE MOVIMIENTOS DEL EXTRACTO -->
      <div v-if="cargando" class="row justify-center q-py-xl">
        <q-spinner color="primary" size="36px" />
      </div>

      <div v-else-if="movimientosFiltrados.length === 0" class="text-center text-slate-400 q-py-xl">
        <q-icon name="receipt_long" size="48px" class="opacity-40 q-mb-sm" />
        <div class="text-body1 font-medium">No se encontraron movimientos</div>
        <div class="text-caption">Prueba cambiando la cuenta o el texto de búsqueda</div>
      </div>

      <q-list v-else separator class="q-mb-md">
        <q-item
          v-for="m in movimientosPaginados"
          :key="m._id"
          class="q-px-sm q-py-md"
        >
          <!-- ICONO ENTRADA / SALIDA -->
          <q-item-section avatar style="min-width: 42px">
            <q-avatar
              size="36px"
              :color="esEntrada(m) ? 'green-1' : 'red-1'"
              :text-color="esEntrada(m) ? 'positive' : 'negative'"
              :icon="esEntrada(m) ? 'arrow_downward' : 'arrow_upward'"
            />
          </q-item-section>

          <!-- DETALLE -->
          <q-item-section>
            <div class="row items-center justify-between no-wrap">
              <span class="text-weight-bold text-slate-900 text-subtitle1 ellipsis" style="max-width: 320px;">
                {{ m.descripcion || (m.tipo === 'recaudo' ? 'Recaudo del día' : m.tipo) }}
              </span>
              <span
                class="text-weight-bolder text-subtitle1"
                :class="esEntrada(m) ? 'text-positive' : 'text-negative'"
              >
                {{ esEntrada(m) ? '+' : '-' }} {{ formatCOP(m.monto) }}
              </span>
            </div>

            <div class="row items-center justify-between text-caption text-slate-500 q-mt-xs">
              <div class="row items-center q-gutter-x-sm">
                <span>{{ formatFechaItem(m.fecha) }}</span>
                <span>·</span>
                <span class="text-weight-bold text-slate-700">{{ m.cuenta }}</span>
                <span v-if="m.cuentaDestino"> → {{ m.cuentaDestino }}</span>
                <span v-if="m.creadoPor">· Por: {{ m.creadoPor.nombre }}</span>
              </div>
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

      <!-- PAGINACIÓN -->
      <div v-if="totalPaginas > 1" class="row justify-center q-mt-md">
        <q-pagination
          v-model="paginaActual"
          :max="totalPaginas"
          :max-pages="6"
          boundary-numbers
          direction-links
          color="primary"
        />
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { getData } from '@/services/apiService'
import { useCuentasStore } from '@/store/cuentasStore'
import { parseFechaLocal, formatFechaCorta } from '@/utils/dateUtils'

const route = useRoute()
const cuentasStore = useCuentasStore()

const cargando = ref(false)
const movimientos = ref([])
const cuentaActiva = ref(route.query.cuenta ? String(route.query.cuenta) : 'Nequi')
const busquedaTexto = ref('')
const filtroTipo = ref('todos')

const paginaActual = ref(1)
const POR_PAGINA = 25

const formatCOP = (val) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(val ?? 0)

const formatFechaItem = (fechaStr) => {
  if (!fechaStr) return ''
  const d = parseFechaLocal(fechaStr)
  return d.toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' })
}

const esEntrada = (m) => {
  if (m.tipo === 'recaudo') return true
  if (m.tipo === 'transferencia' && cuentaActiva.value !== 'Todas' && m.cuentaDestino === cuentaActiva.value) return true
  return false
}

const seleccionarCuenta = (c) => {
  cuentaActiva.value = c
  paginaActual.value = 1
}

const cargarMovimientos = async () => {
  cargando.value = true
  try {
    const res = await getData('/movimientos', { limit: 300 })
    movimientos.value = res || []
  } catch (error) {
    console.error('Error al cargar movimientos para cuentas:', error)
  } finally {
    cargando.value = false
  }
}

// Filtrado de movimientos según cuenta activa, buscador y tipo
const movimientosFiltrados = computed(() => {
  let list = movimientos.value

  // 1. Filtrar por cuenta
  if (cuentaActiva.value !== 'Todas') {
    list = list.filter(m => m.cuenta === cuentaActiva.value || m.cuentaDestino === cuentaActiva.value)
  }

  // 2. Filtrar por tipo (entradas / salidas)
  if (filtroTipo.value === 'entradas') {
    list = list.filter(m => esEntrada(m))
  } else if (filtroTipo.value === 'salidas') {
    list = list.filter(m => !esEntrada(m))
  }

  // 3. Filtrar por buscador de texto
  if (busquedaTexto.value.trim()) {
    const q = busquedaTexto.value.toLowerCase().trim()
    list = list.filter(m =>
      (m.descripcion && m.descripcion.toLowerCase().includes(q)) ||
      (m.categoria && m.categoria.toLowerCase().includes(q)) ||
      (m.creadoPor?.nombre && m.creadoPor.nombre.toLowerCase().includes(q))
    )
  }

  return list
})

// Resumen del extracto para la cuenta seleccionada
const resumenExtracto = computed(() => {
  let list = movimientos.value
  if (cuentaActiva.value !== 'Todas') {
    list = list.filter(m => m.cuenta === cuentaActiva.value || m.cuentaDestino === cuentaActiva.value)
  }

  const entradas = list
    .filter(m => esEntrada(m))
    .reduce((s, m) => s + (m.monto || 0), 0)

  const salidas = list
    .filter(m => !esEntrada(m))
    .reduce((s, m) => s + (m.monto || 0), 0)

  return {
    entradas,
    salidas,
    neto: entradas - salidas
  }
})

// Paginación
const totalPaginas = computed(() =>
  Math.ceil(movimientosFiltrados.value.length / POR_PAGINA)
)

const movimientosPaginados = computed(() => {
  const inicio = (paginaActual.value - 1) * POR_PAGINA
  return movimientosFiltrados.value.slice(inicio, inicio + POR_PAGINA)
})

onMounted(async () => {
  await cuentasStore.fetchCuentas()
  await cargarMovimientos()
})
</script>

<style scoped>
.saldo-card {
  background: #f8fafc;
  border: 1.5px solid #e2e8f0;
  border-radius: 14px;
  padding: 14px;
  transition: all 0.2s ease;
}

.saldo-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.card-activa-efectivo {
  border-color: #2e7d32;
  background: #f0fdf4;
}

.card-activa-nequi {
  border-color: #7b1fa2;
  background: #faf5ff;
}

.card-activa-bancolombia {
  border-color: #f57f17;
  background: #fffbeb;
}

.card-activa-todas {
  border-color: #1976d2;
  background: #eff6ff;
}

.metric-box {
  transition: all 0.2s ease;
}

.search-input :deep(.q-field__control) {
  border-radius: 10px;
}
</style>

