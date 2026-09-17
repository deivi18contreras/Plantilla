<template>
  <div class="dashboard-main-card full-width q-pa-lg">

    <!-- ─── ENCABEZADO SUPERIOR ─── -->
    <div class="row items-center justify-between q-mb-lg" style="gap: 16px; flex-wrap: wrap;">
      <!-- Título y Subtítulo -->
      <div class="row items-center q-gutter-x-md">
        <div class="header-icon-box">
          <q-icon name="trending_up" size="24px" color="primary" />
        </div>
        <div>
          <div class="text-h5 text-weight-bolder text-slate-900" style="letter-spacing: -0.5px;">
            Tendencia Mensual
          </div>
          <div class="text-caption text-slate-500 font-medium">
            Visualiza el comportamiento real de tus finanzas durante el mes.
          </div>
        </div>
      </div>

      <!-- Selector de Mes (Centro) -->
      <div class="month-selector-pill row items-center q-px-sm">
        <q-btn flat round dense icon="chevron_left" size="sm" color="slate-600" @click="cambiarMesRelativo(-1)" />
        <div class="row items-center q-gutter-x-xs q-px-sm">
          <q-icon name="calendar_today" size="16px" color="primary" />
          <span class="text-weight-bold text-slate-900 text-capitalize" style="font-size: 13.5px;">
            {{ nombreMesSeleccionado }}
          </span>
        </div>
        <q-btn flat round dense icon="chevron_right" size="sm" color="slate-600" @click="cambiarMesRelativo(1)" />
      </div>

      <!-- Segmented Buttons (General | Ventas | Gastos | Ganancia) -->
      <div class="segmented-control row items-center">
        <button
          v-for="modo in ['general', 'ventas', 'gastos', 'ganancia']"
          :key="modo"
          class="segmented-btn text-capitalize"
          :class="{ 'segmented-btn--active': filtroModo === modo }"
          @click="filtroModo = modo"
        >
          {{ modo }}
        </button>
      </div>
    </div>

    <!-- ─── FILA 1: CUATRO TARJETAS KPI RESUMEN (DATOS REALES) ─── -->
    <div class="row q-col-gutter-md q-mb-lg">
      <!-- 1. Venta bruta del mes -->
      <div class="col-12 col-sm-6 col-md-3">
        <div class="kpi-card">
          <div class="row items-center justify-between q-mb-sm">
            <span class="text-caption text-weight-bold text-positive">Venta bruta del mes</span>
            <div class="kpi-avatar bg-green-1 text-positive">
              <q-icon name="trending_up" size="20px" />
            </div>
          </div>
          <div class="text-h4 text-weight-bolder text-slate-900" style="letter-spacing: -0.5px;">
            {{ formatCOP(metricasMes.totalVentas) }}
          </div>
          <div class="row items-center q-gutter-x-xs q-mt-xs">
            <q-icon name="point_of_sale" color="positive" size="14px" />
            <span class="text-caption text-positive font-bold">Recaudos + Gastos Efectivo</span>
          </div>
        </div>
      </div>

      <!-- 2. Gastos totales del mes -->
      <div class="col-12 col-sm-6 col-md-3">
        <div class="kpi-card">
          <div class="row items-center justify-between q-mb-sm">
            <span class="text-caption text-weight-bold text-negative">Gastos totales del mes</span>
            <div class="kpi-avatar bg-red-1 text-negative">
              <q-icon name="credit_card" size="20px" />
            </div>
          </div>
          <div class="text-h4 text-weight-bolder text-slate-900" style="letter-spacing: -0.5px;">
            {{ formatCOP(metricasMes.totalGastos) }}
          </div>
          <div class="row items-center q-gutter-x-xs q-mt-xs">
            <q-icon name="shopping_bag" color="negative" size="14px" />
            <span class="text-caption text-negative font-bold">{{ movimientosGastos.length }} gastos registrados</span>
          </div>
        </div>
      </div>

      <!-- 3. Ganancia neta del mes -->
      <div class="col-12 col-sm-6 col-md-3">
        <div class="kpi-card">
          <div class="row items-center justify-between q-mb-sm">
            <span class="text-caption text-weight-bold text-purple-7">Ganancia neta del mes</span>
            <div class="kpi-avatar bg-purple-1 text-purple-7">
              <q-icon name="savings" size="20px" />
            </div>
          </div>
          <div
            class="text-h4 text-weight-bolder"
            :class="metricasMes.neto >= 0 ? 'text-slate-900' : 'text-negative'"
            style="letter-spacing: -0.5px;"
          >
            {{ formatCOP(metricasMes.neto) }}
          </div>
          <div class="row items-center q-gutter-x-xs q-mt-xs">
            <q-icon :name="metricasMes.neto >= 0 ? 'trending_up' : 'trending_down'" :color="metricasMes.neto >= 0 ? 'positive' : 'negative'" size="14px" />
            <span class="text-caption font-bold" :class="metricasMes.neto >= 0 ? 'text-positive' : 'text-negative'">
              {{ metricasMes.neto >= 0 ? 'Ganancia positiva' : 'Pérdida en el período' }}
            </span>
          </div>
        </div>
      </div>

      <!-- 4. Días trabajados -->
      <div class="col-12 col-sm-6 col-md-3">
        <div class="kpi-card">
          <div class="row items-center justify-between q-mb-sm">
            <span class="text-caption text-weight-bold text-primary">Días del mes</span>
            <div class="kpi-avatar bg-blue-1 text-primary">
              <q-icon name="calendar_today" size="20px" />
            </div>
          </div>
          <div class="text-h4 text-weight-bolder text-slate-900" style="letter-spacing: -0.5px;">
            {{ diasTrabajados }} / {{ totalDiasMes }}
          </div>
          <div class="text-caption text-slate-400 q-mt-xs">
            {{ totalDiasMes - diasTrabajados > 0 ? `Quedan ${totalDiasMes - diasTrabajados} días para cerrar el mes` : 'Mes finalizado' }}
          </div>
        </div>
      </div>
    </div>

    <!-- ─── FILA 2: GRÁFICA DE LADO A LADO (FULL WIDTH) ─── -->
    <div class="card-widget q-pa-lg q-mb-lg full-width">
      <div class="row items-center justify-between q-mb-md" style="gap: 12px; flex-wrap: wrap;">
        <div>
          <div class="text-h6 text-weight-bolder text-slate-900">
            Evolución mensual de ingresos y gastos
          </div>
          <div class="row items-center q-gutter-x-lg q-mt-xs text-caption">
            <span class="row items-center text-slate-700 font-bold">
              <span class="legend-dot bg-blue-6 q-mr-xs"></span> Ventas
            </span>
            <span class="row items-center text-slate-700 font-bold">
              <span class="legend-dot bg-rose-5 q-mr-xs"></span> Gastos
            </span>
            <span class="row items-center text-slate-700 font-bold">
              <span class="legend-dot bg-green-5 q-mr-xs"></span> Ganancia
            </span>
          </div>
        </div>

        <!-- Selector de Granularidad: Días | Semanas -->
        <div class="pills-toggle row items-center">
          <button
            v-for="vista in ['semanas', 'dias']"
            :key="vista"
            class="pill-btn text-capitalize"
            :class="{ 'pill-btn--active': vistaGranularidad === vista }"
            @click="vistaGranularidad = vista"
          >
            {{ vista === 'semanas' ? 'Semanas' : 'Días' }}
          </button>
        </div>
      </div>

      <!-- Spinner mientras carga -->
      <div v-if="cargando" class="row justify-center items-center q-py-xl" style="height: 320px;">
        <q-spinner color="primary" size="44px" />
      </div>

      <!-- Gráfica de Barras Agrupadas con espacio amplio de lado a lado -->
      <div v-else style="min-height: 320px; width: 100%;">
        <VueApexCharts
          type="bar"
          height="320"
          :options="chartEvolucionOptions"
          :series="chartEvolucionSeries"
        />
      </div>
    </div>

    <!-- ─── FILA 3: TRES COLUMNAS (RESUMEN POR CUENTAS | DETALLE MENÚ CATEGORÍAS | TOP PRODUCTOS) ─── -->
    <div class="row q-col-gutter-lg q-mb-lg">

      <!-- COLUMNA 1: Resumen por cuentas (Dona + Desglose) -->
      <div class="col-12 col-md-4">
        <div class="card-widget q-pa-md full-height column justify-between">
          <div>
            <div class="text-subtitle1 text-weight-bolder text-slate-900 q-mb-xs">
              Resumen por cuenta
            </div>
            <div class="text-caption text-slate-400 q-mb-sm">
              Participación de cada cuenta este mes
            </div>

            <!-- ApexCharts Donut -->
            <div class="row justify-center q-my-sm">
              <VueApexCharts
                type="donut"
                height="220"
                :options="chartDonaOptions"
                :series="chartDonaSeries"
              />
            </div>

            <!-- Desglose con Importes Reales -->
            <div class="column q-gutter-y-xs q-mt-md">
              <div class="row items-center justify-between q-py-xs" style="border-bottom: 1px solid #f1f5f9;">
                <div class="row items-center q-gutter-x-xs">
                  <span class="legend-dot bg-green-5"></span>
                  <span class="text-caption text-weight-bold text-slate-700">Efectivo</span>
                </div>
                <div class="row items-center q-gutter-x-sm">
                  <span class="text-caption text-weight-bolder text-slate-900">{{ formatCOP(porCuenta.Efectivo) }}</span>
                  <span class="text-caption text-slate-400" style="font-size: 11px; min-width: 32px; text-align: right;">
                    {{ porCuentaPct.Efectivo }}%
                  </span>
                </div>
              </div>

              <div class="row items-center justify-between q-py-xs" style="border-bottom: 1px solid #f1f5f9;">
                <div class="row items-center q-gutter-x-xs">
                  <span class="legend-dot bg-purple-5"></span>
                  <span class="text-caption text-weight-bold text-slate-700">Nequi</span>
                </div>
                <div class="row items-center q-gutter-x-sm">
                  <span class="text-caption text-weight-bolder text-slate-900">{{ formatCOP(porCuenta.Nequi) }}</span>
                  <span class="text-caption text-slate-400" style="font-size: 11px; min-width: 32px; text-align: right;">
                    {{ porCuentaPct.Nequi }}%
                  </span>
                </div>
              </div>

              <div class="row items-center justify-between q-py-xs">
                <div class="row items-center q-gutter-x-xs">
                  <span class="legend-dot bg-amber-6"></span>
                  <span class="text-caption text-weight-bold text-slate-700">Bancolombia</span>
                </div>
                <div class="row items-center q-gutter-x-sm">
                  <span class="text-caption text-weight-bolder text-slate-900">{{ formatCOP(porCuenta.Bancolombia) }}</span>
                  <span class="text-caption text-slate-400" style="font-size: 11px; min-width: 32px; text-align: right;">
                    {{ porCuentaPct.Bancolombia }}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- COLUMNA 2: Detalle mensual por categoría -->
      <div class="col-12 col-md-4">
        <div class="card-widget q-pa-md full-height column justify-between">
          <div>
            <div class="text-subtitle1 text-weight-bolder text-slate-900 q-mb-xs">
              Detalle mensual por categoría
            </div>
            <div class="text-caption text-slate-400 q-mb-sm">
              Gastos y ventas por rubro
            </div>

            <div v-if="categoriasDetalle.length === 0" class="text-center text-slate-400 q-py-xl">
              <q-icon name="category" size="36px" color="grey-4" />
              <div class="text-caption q-mt-xs">Sin registros por categoría este mes</div>
            </div>

            <div v-else class="table-clean-wrapper">
              <table class="table-clean full-width">
                <thead>
                  <tr>
                    <th style="text-align: left;">Categoría</th>
                    <th style="text-align: right;">Gastos</th>
                    <th style="text-align: right;">% Rubro</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="cat in categoriasDetalle" :key="cat.nombre">
                    <td style="font-weight: 600; color: #1e293b;">
                      <span class="q-mr-xs">{{ cat.icono }}</span> {{ cat.nombre }}
                    </td>
                    <td style="text-align: right; color: #ef4444; font-weight: 700;">
                      {{ formatCOP(cat.gastos) }}
                    </td>
                    <td style="text-align: right; color: #64748b; font-size: 11px;">
                      {{ cat.porcentaje }}%
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div class="row items-center justify-between q-pt-sm q-mt-xs" style="border-top: 1.5px solid #e2e8f0;">
            <span class="text-caption text-weight-bold text-slate-700">Total Gastos:</span>
            <span class="text-caption text-weight-bolder text-negative">{{ formatCOP(metricasMes.totalGastos) }}</span>
          </div>
        </div>
      </div>

      <!-- COLUMNA 3: Top productos / Categorías más activas -->
      <div class="col-12 col-md-4">
        <div class="card-widget q-pa-md full-height column justify-between">
          <div>
            <div class="text-subtitle1 text-weight-bolder text-slate-900 q-mb-xs">
              Top categorías / Productos
            </div>
            <div class="text-caption text-slate-400 q-mb-sm">
              Rubros de mayor movimiento financiero
            </div>

            <div v-if="topProductos.length === 0" class="text-center text-slate-400 q-py-xl">
              <q-icon name="storefront" size="36px" color="grey-4" />
              <div class="text-caption q-mt-xs">Sin datos registrados este mes</div>
            </div>

            <div v-else class="column q-gutter-y-xs">
              <div
                v-for="(item, idx) in topProductos"
                :key="item.nombre"
                class="q-py-xs"
                style="border-bottom: 1px solid #f8fafc;"
              >
                <div class="row items-center justify-between">
                  <div class="row items-center q-gutter-x-xs">
                    <span class="text-caption text-weight-bold text-primary">{{ idx + 1 }}.</span>
                    <span style="font-size: 15px;">{{ item.icono }}</span>
                    <span class="text-caption text-weight-bold text-slate-800">{{ item.nombre }}</span>
                  </div>
                  <div class="row items-center q-gutter-x-sm">
                    <span class="text-caption text-weight-bolder text-slate-900">{{ formatCOP(item.monto) }}</span>
                    <span class="text-caption text-slate-400" style="font-size: 11px; min-width: 26px; text-align: right;">
                      {{ item.pct }}%
                    </span>
                  </div>
                </div>

                <q-linear-progress
                  :value="item.pct / 100"
                  color="primary"
                  track-color="blue-1"
                  rounded
                  size="5px"
                  class="q-mt-xs"
                />
              </div>
            </div>
          </div>

          <div class="row items-center q-gutter-x-xs q-pt-sm q-mt-xs text-caption text-slate-400" style="border-top: 1px solid #f1f5f9;">
            <q-icon name="insights" size="14px" color="primary" />
            <span>Datos basados en transacciones del mes</span>
          </div>
        </div>
      </div>

    </div>

    <!-- ─── FILA 4: TENDENCIA DE LA GANANCIA NETA DE LADO A LADO (FULL WIDTH) ─── -->
    <div class="card-widget q-pa-lg full-width">
      <div class="row items-center justify-between q-mb-md" style="gap: 12px; flex-wrap: wrap;">
        <div>
          <div class="text-h6 text-weight-bolder text-slate-900">
            Tendencia de la ganancia neta
          </div>
          <div class="text-caption text-slate-500">
            Progresión acumulada de ganancias netas durante el transcurso del mes
          </div>
        </div>

        <div class="row items-center q-gutter-x-sm">
          <span class="text-caption text-slate-500 font-bold">Ganancia del mes:</span>
          <span
            class="ganancia-tag text-weight-bolder"
            :class="metricasMes.neto >= 0 ? 'bg-positive' : 'bg-negative'"
          >
            {{ formatCOP(metricasMes.neto) }}
          </span>
        </div>
      </div>

      <!-- Gráfica de Área de Ganancia Neta de lado a lado -->
      <div style="min-height: 220px; width: 100%;">
        <VueApexCharts
          type="area"
          height="220"
          :options="chartGananciaOptions"
          :series="chartGananciaSeries"
        />
      </div>

      <!-- Banner Inferior Informativo -->
      <div class="info-green-banner q-pa-sm q-mt-md row items-center no-wrap q-gutter-x-sm">
        <div class="arrow-up-circle">
          <q-icon :name="metricasMes.neto >= 0 ? 'arrow_upward' : 'arrow_downward'" size="16px" :color="metricasMes.neto >= 0 ? 'positive' : 'negative'" />
        </div>
        <div class="text-caption text-slate-700" style="font-size: 12px; line-height: 1.3;">
          Resultado neto calculado a partir de todos los recaudos de caja menos los gastos del período en
          <strong class="text-slate-900">{{ nombreMesSeleccionado }}</strong>:
          <strong :class="metricasMes.neto >= 0 ? 'text-positive' : 'text-negative'">
            {{ formatCOP(metricasMes.neto) }}
          </strong>.
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import VueApexCharts from 'vue3-apexcharts'
import { getData } from '@/services/apiService'

const cargando = ref(false)
const filtroModo = ref('general')
const vistaGranularidad = ref('semanas')

// Manejo de mes seleccionado
const offsetMes = ref(0)
const fechaReferencia = computed(() => {
  const d = new Date()
  return new Date(d.getFullYear(), d.getMonth() + offsetMes.value, 1)
})

const nombreMesSeleccionado = computed(() => {
  return fechaReferencia.value.toLocaleDateString('es-CO', { month: 'long', year: 'numeric' })
})

const cambiarMesRelativo = (delta) => {
  offsetMes.value += delta
  cargarDatosMes()
}

// Movimientos crudos del mes obtenidos de la base de datos
const movimientosMes = ref([])

const movimientosGastos = computed(() =>
  movimientosMes.value.filter(m => m.tipo === 'gasto')
)

const movimientosRecaudos = computed(() =>
  movimientosMes.value.filter(m => m.tipo === 'recaudo')
)

// Días del mes
const totalDiasMes = computed(() => {
  const d = fechaReferencia.value
  return new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate()
})

const diasTrabajados = computed(() => {
  const hoy = new Date()
  if (offsetMes.value === 0) {
    return Math.min(hoy.getDate(), totalDiasMes.value)
  }
  if (offsetMes.value < 0) {
    return totalDiasMes.value
  }
  return 0
})

// Métricas Reales del Mes (Venta bruta = Recaudos + Gastos en Efectivo, Gastos totales = sum de gastos)
const metricasMes = computed(() => {
  let totalRecaudos = 0
  let gastosEfectivo = 0
  let totalGastos = 0

  movimientosMes.value.forEach(m => {
    if (m.tipo === 'recaudo') {
      totalRecaudos += (m.monto || 0)
    }
    if (m.tipo === 'gasto') {
      totalGastos += (m.monto || 0)
      if (m.cuenta === 'Efectivo') {
        gastosEfectivo += (m.monto || 0)
      }
    }
  })

  // Venta bruta = lo que entró en caja y bancos antes de descontar gastos pagados en caja
  const totalVentas = totalRecaudos + gastosEfectivo
  const neto = totalVentas - totalGastos

  return {
    totalVentas,
    totalGastos,
    neto
  }
})

// Por cuenta real
const porCuenta = computed(() => {
  const map = { Efectivo: 0, Nequi: 0, Bancolombia: 0 }
  movimientosRecaudos.value.forEach(m => {
    if (map[m.cuenta] !== undefined) {
      map[m.cuenta] += (m.monto || 0)
    }
  })
  return map
})

const porCuentaPct = computed(() => {
  const tot = (porCuenta.value.Efectivo + porCuenta.value.Nequi + porCuenta.value.Bancolombia) || 1
  return {
    Efectivo: Math.round((porCuenta.value.Efectivo / tot) * 100),
    Nequi: Math.round((porCuenta.value.Nequi / tot) * 100),
    Bancolombia: Math.round((porCuenta.value.Bancolombia / tot) * 100)
  }
})

const normalizarCategoria = (categoria) => {
  if (!categoria) return 'Otros'
  const raw = String(categoria).trim().toLowerCase()

  if (raw.includes('carne') || raw.includes('pollo') || raw.includes('res') || raw.includes('cerdo') || raw.includes('pescado')) {
    return 'Carnes y Pollo'
  }
  if (raw.includes('verdura') || raw.includes('fruta') || raw.includes('legumbre') || raw.includes('platano') || raw.includes('papa')) {
    return 'Verduras y Frutas'
  }
  if (raw.includes('bebid') || raw.includes('tinto') || raw.includes('gaseosa') || raw.includes('jugo') || raw.includes('agua') || raw.includes('cerveza')) {
    return 'Bebidas y Tintos'
  }
  if (raw.includes('abarrote') || raw.includes('arroz') || raw.includes('aceite') || raw.includes('grano') || raw.includes('viveres') || raw.includes('tienda')) {
    return 'Abarrotes'
  }
  if (raw.includes('aseo') || raw.includes('limpieza') || raw.includes('jabon') || raw.includes('cloro') || raw.includes('detergente')) {
    return 'Aseo y Limpieza'
  }
  if (raw.includes('empaque') || raw.includes('bolsa') || raw.includes('caja') || raw.includes('desechable')) {
    return 'Empaques'
  }
  if (raw.includes('lacteo') || raw.includes('leche') || raw.includes('queso') || raw.includes('yogurt')) {
    return 'Lácteos y Quesos'
  }
  if (raw.includes('snack') || raw.includes('dulce') || raw.includes('confiteria') || raw.includes('galleta') || raw.includes('papas')) {
    return 'Snacks y Dulces'
  }
  if (raw.includes('servicio') || raw.includes('luz') || raw.includes('energia') || raw.includes('agua') || raw.includes('gas') || raw.includes('internet') || raw.includes('arriendo')) {
    return 'Servicios y Arriendo'
  }
  if (raw.includes('transporte') || raw.includes('flete') || raw.includes('gasolina') || raw.includes('domicilio')) {
    return 'Transporte y Fletes'
  }

  return raw.charAt(0).toUpperCase() + raw.slice(1)
}

// Detalle por Categoría Real (Agrupado, normalizado y con límite de filas)
const categoriasDetalle = computed(() => {
  const map = {}
  const totalG = metricasMes.value.totalGastos || 1

  movimientosGastos.value.forEach(m => {
    const cat = normalizarCategoria(m.categoria)
    map[cat] = (map[cat] || 0) + (m.monto || 0)
  })

  const ordenadas = Object.entries(map).sort((a, b) => b[1] - a[1])

  // Si hay más de 5 categorías, dejamos las 4 principales y agrupamos el resto en "Otras categorías"
  if (ordenadas.length > 5) {
    const top4 = ordenadas.slice(0, 4).map(([nombre, gastos]) => ({
      nombre,
      icono: iconoPorCategoria(nombre),
      gastos,
      porcentaje: Math.round((gastos / totalG) * 100)
    }))
    const restoMonto = ordenadas.slice(4).reduce((sum, [, gastos]) => sum + gastos, 0)
    top4.push({
      nombre: 'Otras categorías',
      icono: '📦',
      gastos: restoMonto,
      porcentaje: Math.round((restoMonto / totalG) * 100)
    })
    return top4
  }

  return ordenadas.map(([nombre, gastos]) => ({
    nombre,
    icono: iconoPorCategoria(nombre),
    gastos,
    porcentaje: Math.round((gastos / totalG) * 100)
  }))
})

// Top Categorías / Productos Reales (Normalizados)
const topProductos = computed(() => {
  const map = {}
  const totalG = metricasMes.value.totalGastos || 1

  movimientosGastos.value.forEach(m => {
    const cat = normalizarCategoria(m.categoria)
    map[cat] = (map[cat] || 0) + (m.monto || 0)
  })

  return Object.entries(map)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([nombre, monto]) => ({
      nombre,
      icono: iconoPorCategoria(nombre),
      monto,
      pct: Math.round((monto / totalG) * 100)
    }))
})


// Agrupación Semanal Real para la Gráfica de Barras de lado a lado
const datosSemanalesReales = computed(() => {
  const semanas = [
    { label: 'Semana 1 (1 - 7)', inicio: 1, fin: 7, ventas: 0, gastos: 0 },
    { label: 'Semana 2 (8 - 14)', inicio: 8, fin: 14, ventas: 0, gastos: 0 },
    { label: 'Semana 3 (15 - 21)', inicio: 15, fin: 21, ventas: 0, gastos: 0 },
    { label: 'Semana 4 (22 - 28)', inicio: 22, fin: 28, ventas: 0, gastos: 0 },
    { label: `Semana 5 (29 - ${totalDiasMes.value})`, inicio: 29, fin: totalDiasMes.value, ventas: 0, gastos: 0 }
  ]

  movimientosMes.value.forEach(m => {
    if (!m.fecha) return
    const dia = new Date(m.fecha).getUTCDate()
    const sem = semanas.find(s => dia >= s.inicio && dia <= s.fin)
    if (sem) {
      if (m.tipo === 'recaudo') {
        sem.ventas += (m.monto || 0)
      } else if (m.tipo === 'gasto') {
        sem.gastos += (m.monto || 0)
        if (m.cuenta === 'Efectivo') {
          sem.ventas += (m.monto || 0)
        }
      }
    }
  })

  return semanas.map(s => ({
    ...s,
    ganancia: s.ventas - s.gastos
  }))
})

// Agrupación Diaria Real
const datosDiariosReales = computed(() => {
  const maxDias = Math.min(totalDiasMes.value, 31)
  const dias = []

  for (let i = 1; i <= maxDias; i++) {
    dias.push({ dia: `${i}`, ventas: 0, gastos: 0, ganancia: 0 })
  }

  movimientosMes.value.forEach(m => {
    if (!m.fecha) return
    const diaNum = new Date(m.fecha).getUTCDate()
    if (diaNum >= 1 && diaNum <= maxDias) {
      const target = dias[diaNum - 1]
      if (m.tipo === 'recaudo') {
        target.ventas += (m.monto || 0)
      } else if (m.tipo === 'gasto') {
        target.gastos += (m.monto || 0)
        if (m.cuenta === 'Efectivo') {
          target.ventas += (m.monto || 0)
        }
      }
    }
  })

  return dias.map(d => ({ ...d, ganancia: d.ventas - d.gastos }))
})

// Series de la Gráfica de Evolución
const chartEvolucionSeries = computed(() => {
  const isSemanas = vistaGranularidad.value === 'semanas'
  const lista = isSemanas ? datosSemanalesReales.value : datosDiariosReales.value

  const ventasData = lista.map(item => item.ventas)
  const gastosData = lista.map(item => item.gastos)
  const gananciaData = lista.map(item => item.ganancia)

  if (filtroModo.value === 'ventas') {
    return [{ name: 'Ventas', data: ventasData }]
  }
  if (filtroModo.value === 'gastos') {
    return [{ name: 'Gastos', data: gastosData }]
  }
  if (filtroModo.value === 'ganancia') {
    return [{ name: 'Ganancia', data: gananciaData }]
  }

  return [
    { name: 'Ventas', data: ventasData },
    { name: 'Gastos', data: gastosData },
    { name: 'Ganancia', data: gananciaData }
  ]
})

const chartEvolucionOptions = computed(() => {
  const isSemanas = vistaGranularidad.value === 'semanas'
  const categories = isSemanas
    ? datosSemanalesReales.value.map(s => s.label)
    : datosDiariosReales.value.map(d => `Día ${d.dia}`)

  return {
    chart: {
      type: 'bar',
      toolbar: { show: false },
      fontFamily: 'inherit',
      animations: { enabled: true, speed: 400 }
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: isSemanas ? '45%' : '75%',
        borderRadius: 4
      }
    },
    colors: ['#3b82f6', '#f43f5e', '#10b981'],
    dataLabels: { enabled: false },
    stroke: { show: true, width: 2, colors: ['transparent'] },
    xaxis: {
      categories,
      labels: {
        style: { colors: '#64748b', fontSize: '11.5px', fontWeight: 600 }
      },
      axisBorder: { show: false },
      axisTicks: { show: false }
    },
    yaxis: {
      labels: {
        formatter: (val) => `$ ${(val / 1000000).toFixed(1)}M`,
        style: { colors: '#94a3b8', fontSize: '11px' }
      }
    },
    legend: { show: false },
    grid: {
      borderColor: '#f1f5f9',
      strokeDashArray: 3,
      padding: { left: 10, right: 10 }
    },
    tooltip: {
      y: {
        formatter: (val) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(val ?? 0)
      }
    }
  }
})

// Gráfica de Ganancia Neta (Área acumulada día a día o semana a semana)
const chartGananciaSeries = computed(() => {
  let acumulador = 0
  const puntos = datosSemanalesReales.value.map(s => {
    acumulador += s.ganancia
    return acumulador
  })

  return [{
    name: 'Ganancia acumulada',
    data: puntos
  }]
})

const chartGananciaOptions = computed(() => ({
  chart: {
    type: 'area',
    toolbar: { show: false },
    fontFamily: 'inherit'
  },
  stroke: { curve: 'smooth', width: 3, colors: ['#10b981'] },
  fill: {
    type: 'gradient',
    gradient: {
      shadeIntensity: 1,
      opacityFrom: 0.35,
      opacityTo: 0.05,
      stops: [0, 95, 100],
      colorStops: [{ offset: 0, color: '#10b981', opacity: 0.35 }, { offset: 100, color: '#10b981', opacity: 0.05 }]
    }
  },
  colors: ['#10b981'],
  markers: { size: 5, colors: ['#10b981'], strokeColors: '#fff', strokeWidth: 2 },
  xaxis: {
    categories: ['Semana 1', 'Semana 2', 'Semana 3', 'Semana 4', 'Semana 5'],
    labels: { style: { colors: '#94a3b8', fontSize: '11px', fontWeight: 600 } }
  },
  yaxis: {
    labels: {
      formatter: (v) => `$ ${(v / 1000000).toFixed(1)}M`,
      style: { colors: '#94a3b8', fontSize: '11px' }
    }
  },
  grid: { borderColor: '#f1f5f9', strokeDashArray: 3 },
  tooltip: {
    y: {
      formatter: (val) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(val ?? 0)
    }
  }
}))

// Gráfica Dona por Cuenta
const chartDonaSeries = computed(() => [
  porCuenta.value.Efectivo,
  porCuenta.value.Nequi,
  porCuenta.value.Bancolombia
])

const chartDonaOptions = computed(() => ({
  chart: { type: 'donut', fontFamily: 'inherit' },
  colors: ['#10b981', '#a855f7', '#f59e0b'],
  labels: ['Efectivo', 'Nequi', 'Bancolombia'],
  legend: { show: false },
  dataLabels: { enabled: false },
  plotOptions: {
    pie: {
      donut: {
        size: '72%',
        labels: {
          show: true,
          total: {
            show: true,
            label: 'Total ingresos',
            fontSize: '11px',
            color: '#64748b',
            formatter: () => {
              const tot = porCuenta.value.Efectivo + porCuenta.value.Nequi + porCuenta.value.Bancolombia
              return `$ ${(tot / 1000000).toFixed(1)}M`
            }
          }
        }
      }
    }
  },
  tooltip: {
    y: {
      formatter: (val) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(val ?? 0)
    }
  }
}))

const iconoPorCategoria = (categoria) => {
  const cat = String(categoria || '').toLowerCase()
  if (cat.includes('abarrote') || cat.includes('tienda')) return '🛒'
  if (cat.includes('bebid') || cat.includes('tinto') || cat.includes('gaseosa')) return '🥤'
  if (cat.includes('carne') || cat.includes('pollo')) return '🥩'
  if (cat.includes('verdura') || cat.includes('fruta')) return '🥦'
  if (cat.includes('snack') || cat.includes('papas')) return '🍿'
  if (cat.includes('lacteo') || cat.includes('queso') || cat.includes('leche')) return '🥛'
  if (cat.includes('aseo') || cat.includes('limpieza')) return '🧼'
  if (cat.includes('servicio') || cat.includes('arriendo')) return '💡'
  return '📦'
}

const formatCOP = (val) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(val ?? 0)

// Cargar movimientos reales del mes
const cargarDatosMes = async () => {
  cargando.value = true
  try {
    const año = fechaReferencia.value.getFullYear()
    const mes = fechaReferencia.value.getMonth()
    const ultimoDia = new Date(año, mes + 1, 0).getDate()

    const desde = `${año}-${String(mes + 1).padStart(2, '0')}-01`
    const hasta = `${año}-${String(mes + 1).padStart(2, '0')}-${String(ultimoDia).padStart(2, '0')}`

    const movs = await getData('/movimientos', { desde, hasta, limit: 1000 })
    movimientosMes.value = Array.isArray(movs) ? movs : []
  } catch (e) {
    console.error('Error al cargar datos reales del mes:', e)
    movimientosMes.value = []
  } finally {
    cargando.value = false
  }
}

onMounted(() => {
  cargarDatosMes()
})
</script>

<style scoped>
.header-icon-box {
  width: 44px;
  height: 44px;
  border-radius: 14px;
  background: #eff6ff;
  display: flex;
  align-items: center;
  justify-content: center;
}

.month-selector-pill {
  background: #ffffff;
  border: 1px solid #cbd5e1;
  border-radius: 12px;
  height: 40px;
}

.segmented-control {
  background: #f1f5f9;
  border-radius: 12px;
  padding: 3px;
  gap: 2px;
}
.segmented-btn {
  border: none;
  background: transparent;
  padding: 6px 14px;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 700;
  color: #64748b;
  cursor: pointer;
  transition: all 0.15s ease;
}
.segmented-btn--active {
  background: #2563eb;
  color: #ffffff;
  box-shadow: 0 2px 8px rgba(37, 99, 235, 0.25);
}

.kpi-card {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 18px;
  padding: 18px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.02);
}
.kpi-avatar {
  width: 36px;
  height: 36px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.legend-dot {
  width: 9px;
  height: 9px;
  border-radius: 50%;
  display: inline-block;
}

.pills-toggle {
  background: #f1f5f9;
  border-radius: 10px;
  padding: 2px;
}
.pill-btn {
  border: none;
  background: transparent;
  padding: 4px 12px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 700;
  color: #64748b;
  cursor: pointer;
}
.pill-btn--active {
  background: #2563eb;
  color: #ffffff;
}

/* Tabla limpia */
.table-clean-wrapper {
  overflow-x: auto;
}
.table-clean {
  border-collapse: collapse;
  font-size: 12.5px;
}
.table-clean th {
  padding: 8px 6px;
  color: #64748b;
  font-weight: 700;
  border-bottom: 1.5px solid #e2e8f0;
  font-size: 11px;
  text-transform: uppercase;
}
.table-clean td {
  padding: 8px 6px;
  border-bottom: 1px solid #f1f5f9;
}

.ganancia-tag {
  color: white;
  padding: 4px 12px;
  border-radius: 14px;
  font-size: 13px;
}

.info-green-banner {
  background: #f0fdf4;
  border: 1px solid #dcfce7;
  border-radius: 14px;
}
.arrow-up-circle {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: #dcfce7;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
</style>

