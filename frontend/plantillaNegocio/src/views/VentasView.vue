<template>
  <div class="dashboard-main-card full-width">

    <!-- ENCABEZADO -->
    <div class="row items-center justify-between q-mb-lg">
      <div>
        <div class="text-h5 text-weight-bolder text-slate-900">Ventas</div>
        <div class="text-caption text-slate-500">Detalle de ingresos del negocio</div>
      </div>
      <!-- Selector de período -->
      <div class="row q-gutter-xs">
        <q-btn
          v-for="p in periodos"
          :key="p.key"
          :outline="periodoActivo !== p.key"
          :color="periodoActivo === p.key ? 'primary' : 'grey-5'"
          :text-color="periodoActivo === p.key ? 'white' : 'grey-7'"
          no-caps dense rounded
          :label="p.label"
          style="font-size: 12px; padding: 4px 12px;"
          @click="cambiarPeriodo(p.key)"
        />
      </div>
    </div>

    <!-- MÉTRICAS PRINCIPALES -->
    <div class="row q-col-gutter-sm q-mb-md">

      <!-- Total ventas -->
      <div class="col-6 col-md-3">
        <div class="card-widget text-center">
          <q-icon name="trending_up" color="green-6" size="28px" />
          <div class="text-caption text-slate-500 q-mt-xs">Total ventas</div>
          <div class="text-h6 text-weight-bolder text-green-7">{{ formatCOP(metricas.totalVentas) }}</div>
        </div>
      </div>

      <!-- Nº Transacciones -->
      <div class="col-6 col-md-3">
        <div class="card-widget text-center">
          <q-icon name="receipt_long" color="blue-6" size="28px" />
          <div class="text-caption text-slate-500 q-mt-xs">Transacciones</div>
          <div class="text-h6 text-weight-bolder text-blue-7">{{ metricas.numTransacciones }}</div>
        </div>
      </div>

      <!-- Promedio por día -->
      <div class="col-6 col-md-3">
        <div class="card-widget text-center">
          <q-icon name="today" color="purple-6" size="28px" />
          <div class="text-caption text-slate-500 q-mt-xs">Promedio / día</div>
          <div class="text-h6 text-weight-bolder text-purple-7">{{ formatCOP(metricas.promedioDia) }}</div>
        </div>
      </div>

      <!-- Comparativa período anterior -->
      <div class="col-6 col-md-3">
        <div class="card-widget text-center">
          <q-icon
            :name="metricas.variacion >= 0 ? 'arrow_upward' : 'arrow_downward'"
            :color="metricas.variacion >= 0 ? 'green-6' : 'red-5'"
            size="28px"
          />
          <div class="text-caption text-slate-500 q-mt-xs">vs período anterior</div>
          <div
            class="text-h6 text-weight-bolder"
            :class="metricas.variacion >= 0 ? 'text-green-7' : 'text-red-6'"
          >
            {{ metricas.variacion >= 0 ? '+' : '' }}{{ metricas.variacion }}%
          </div>
        </div>
      </div>
    </div>

    <!-- DETALLE DE VENTAS + MEDIO DE PAGO -->
    <div class="row q-col-gutter-md">

      <!-- Tabla detalle -->
      <div class="col-12 col-md-8">
        <div class="card-widget">
          <div class="row items-center justify-between q-mb-md">
            <div class="text-subtitle1 text-weight-bold text-slate-900">Detalle de ventas</div>
            <q-spinner v-if="cargando" size="20px" color="primary" />
          </div>

          <div v-if="!cargando && movimientos.length === 0" class="text-center text-slate-400 q-py-xl">
            <q-icon name="inbox" size="48px" color="grey-4" />
            <div class="q-mt-sm">Sin ventas en este período</div>
          </div>

          <div v-else>
            <!-- Cabecera tabla -->
            <div class="row text-caption text-weight-bold text-slate-400 q-pb-xs" style="border-bottom: 2px solid #e2e8f0;">
              <div class="col-3">Fecha</div>
              <div class="col-4">Descripción</div>
              <div class="col-2">Cuenta</div>
              <div class="col-3 text-right">Monto</div>
            </div>

            <!-- Filas -->
            <div
              v-for="m in movimientosPaginados"
              :key="m._id"
              class="row items-center q-py-xs"
              style="border-bottom: 1px solid #f1f5f9;"
            >
              <div class="col-3 text-caption text-slate-500">{{ formatFecha(m.fecha) }}</div>
              <div class="col-4 text-caption text-slate-800" style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                {{ m.descripcion || m.tipo }}
              </div>
              <div class="col-2">
                <q-badge
                  :color="colorCuenta(m.cuenta)"
                  :label="m.cuenta"
                  style="font-size: 10px;"
                />
              </div>
              <div class="col-3 text-right text-caption text-weight-bolder text-green-7">
                +{{ formatCOP(m.monto) }}
              </div>
            </div>

            <!-- Paginación -->
            <div v-if="totalPaginas > 1" class="row justify-center q-mt-md">
              <q-pagination
                v-model="paginaActual"
                :max="totalPaginas"
                :max-pages="5"
                boundary-numbers
                color="primary"
                size="sm"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- Ventas por medio de pago -->
      <div class="col-12 col-md-4">
        <div class="card-widget">
          <div class="text-subtitle1 text-weight-bold text-slate-900 q-mb-md">Medios de pago</div>

          <div v-if="movimientos.length === 0" class="text-center text-slate-400 q-py-lg">
            Sin datos
          </div>
          <div v-else>
            <!-- Barras por cuenta -->
            <div v-for="(item, idx) in porCuenta" :key="idx" class="q-mb-sm">
              <div class="row justify-between text-caption text-weight-bold q-mb-xs">
                <span class="text-slate-700">{{ item.nombre }}</span>
                <span>{{ item.pct }}%</span>
              </div>
              <div style="background: #f1f5f9; border-radius: 6px; height: 10px; overflow:hidden;">
                <div
                  :style="`width: ${item.pct}%; height: 100%; border-radius: 6px; background: ${item.color}; transition: width 0.4s;`"
                />
              </div>
              <div class="text-caption text-slate-500 q-mt-xs">{{ formatCOP(item.monto) }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { getData } from '@/services/apiService'

const cargando = ref(false)
const movimientos = ref([])
const paginaActual = ref(1)
const porPagina = 15

const periodos = [
  { key: 'hoy',    label: 'Hoy' },
  { key: 'semana', label: 'Esta semana' },
  { key: 'mes',    label: 'Este mes' }
]
const periodoActivo = ref('mes')

// ── Calcular fechas del período ──────────────────────────────────────────────
const calcularRango = (periodo) => {
  const hoy = new Date()
  const yy = hoy.getFullYear()
  const mm = String(hoy.getMonth() + 1).padStart(2, '0')
  const dd = String(hoy.getDate()).padStart(2, '0')

  if (periodo === 'hoy') {
    return { desde: `${yy}-${mm}-${dd}`, hasta: `${yy}-${mm}-${dd}` }
  }
  if (periodo === 'semana') {
    const lunes = new Date(hoy)
    lunes.setDate(hoy.getDate() - ((hoy.getDay() + 6) % 7))
    const lunesISO = `${lunes.getFullYear()}-${String(lunes.getMonth()+1).padStart(2,'0')}-${String(lunes.getDate()).padStart(2,'0')}`
    return { desde: lunesISO, hasta: `${yy}-${mm}-${dd}` }
  }
  // mes
  return { desde: `${yy}-${mm}-01`, hasta: `${yy}-${mm}-${dd}` }
}

// ── Cargar movimientos de tipo recaudo ───────────────────────────────────────
const cargar = async () => {
  cargando.value = true
  movimientos.value = []
  paginaActual.value = 1
  try {
    const { desde, hasta } = calcularRango(periodoActivo.value)
    const data = await getData('/movimientos', {
      tipo: 'recaudo',
      desde,
      hasta,
      limit: 500
    })
    movimientos.value = Array.isArray(data) ? data : []
  } catch { /* no bloquea */ } finally {
    cargando.value = false
  }
}

const cambiarPeriodo = (key) => {
  periodoActivo.value = key
}
watch(periodoActivo, cargar)

// ── Métricas ──────────────────────────────────────────────────────────────────
const metricas = computed(() => {
  const total = movimientos.value.reduce((s, m) => s + m.monto, 0)
  const num = movimientos.value.length
  const dias = periodoActivo.value === 'hoy' ? 1 : periodoActivo.value === 'semana' ? 7 : new Date().getDate()
  return {
    totalVentas:       total,
    numTransacciones:  num,
    promedioDia:       dias > 0 ? Math.round(total / dias) : 0,
    variacion:         0 // se podría calcular comparando con período anterior en futuras mejoras
  }
})

// ── Paginación ────────────────────────────────────────────────────────────────
const totalPaginas = computed(() => Math.ceil(movimientos.value.length / porPagina))
const movimientosPaginados = computed(() => {
  const start = (paginaActual.value - 1) * porPagina
  return movimientos.value.slice(start, start + porPagina)
})

// ── Desglose por cuenta ───────────────────────────────────────────────────────
const porCuenta = computed(() => {
  const total = movimientos.value.reduce((s, m) => s + m.monto, 0)
  const mapa = { Efectivo: 0, Nequi: 0, Bancolombia: 0 }
  movimientos.value.forEach(m => {
    if (mapa[m.cuenta] !== undefined) mapa[m.cuenta] += m.monto
  })
  const colores = { Efectivo: '#22c55e', Nequi: '#a855f7', Bancolombia: '#f59e0b' }
  return Object.entries(mapa)
    .filter(([, v]) => v > 0)
    .map(([nombre, monto]) => ({
      nombre,
      monto,
      pct: total > 0 ? Math.round((monto / total) * 100) : 0,
      color: colores[nombre] || '#64748b'
    }))
    .sort((a, b) => b.monto - a.monto)
})

// ── Helpers ───────────────────────────────────────────────────────────────────
const formatCOP = (val) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(val ?? 0)

const formatFecha = (fechaStr) => {
  if (!fechaStr) return ''
  return new Date(fechaStr).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: '2-digit' })
}

const colorCuenta = (cuenta) => {
  if (cuenta === 'Efectivo') return 'green-6'
  if (cuenta === 'Nequi') return 'purple-6'
  if (cuenta === 'Bancolombia') return 'amber-8'
  return 'grey-6'
}

onMounted(cargar)
</script>

