<template>
  <div class="dashboard-main-card full-width q-pa-lg">

    <!-- ─── ENCABEZADO SUPERIOR (ESTILO IMAGEN) ─── -->
    <div class="row items-center justify-between q-mb-lg" style="gap: 16px; flex-wrap: wrap;">
      <!-- Título y Subtítulo con Ícono -->
      <div class="row items-center q-gutter-x-md">
        <div class="header-icon-box bg-purple-1 text-purple-7">
          <q-icon name="label" size="24px" />
        </div>
        <div>
          <div class="text-h5 text-weight-bolder text-slate-900" style="letter-spacing: -0.5px;">
            Categorías de Gasto
          </div>
          <div class="text-caption text-slate-500 font-medium">
            Conoce en qué se está invirtiendo tu dinero.
          </div>
        </div>
      </div>

      <!-- Selector de Mes (Derecha) -->
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
    </div>

    <!-- ─── FILA 1: TRES TARJETAS (DONUT | BARRAS | RESUMEN GASTOS) ─── -->
    <div class="row q-col-gutter-md q-mb-lg">

      <!-- TARJETA 1: Donut Chart de Gastos por Categoría -->
      <div class="col-12 col-md-4">
        <div class="card-widget q-pa-md full-height column justify-between">
          <div>
            <div class="text-subtitle2 text-weight-bolder text-slate-900 q-mb-xs">
              Distribución de gastos
            </div>
            <div class="text-caption text-slate-400 q-mb-sm">
              Participación porcentual por categoría
            </div>

            <!-- Gráfica Dona -->
            <div class="row justify-center q-my-xs">
              <div v-if="cargando" class="row justify-center items-center" style="height: 180px;">
                <q-spinner color="primary" size="36px" />
              </div>
              <div v-else-if="categoriasAgrupadas.length === 0" class="column items-center justify-center text-slate-400" style="height: 180px;">
                <q-icon name="donut_large" size="36px" color="grey-4" />
                <span class="text-caption q-mt-xs">Sin gastos este mes</span>
              </div>
              <VueApexCharts
                v-else
                type="donut"
                height="190"
                :options="chartDonaOptions"
                :series="chartDonaSeries"
              />
            </div>

            <!-- Leyenda de Categorías -->
            <div v-if="categoriasAgrupadas.length > 0" class="column q-gutter-y-xs q-mt-sm">
              <div
                v-for="(cat, idx) in categoriasAgrupadas.slice(0, 5)"
                :key="cat.nombre"
                class="row items-center justify-between q-py-xs"
                style="border-bottom: 1px solid #f8fafc;"
              >
                <div class="row items-center q-gutter-x-xs">
                  <span class="legend-color-dot" :style="{ background: paletaColores[idx % paletaColores.length] }"></span>
                  <span class="text-caption text-weight-bold text-slate-700">{{ cat.nombre }}</span>
                </div>
                <div class="row items-center q-gutter-x-sm">
                  <span class="text-caption text-weight-bolder text-slate-900">{{ formatCOP(cat.monto) }}</span>
                  <span class="text-caption text-slate-400" style="font-size: 11px; min-width: 32px; text-align: right;">
                    {{ cat.porcentaje }}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- TARJETA 2: Gráfica de Barras por Categoría -->
      <div class="col-12 col-md-5">
        <div class="card-widget q-pa-md full-height column justify-between">
          <div>
            <div class="text-subtitle2 text-weight-bolder text-slate-900 q-mb-xs">
              Gastos por categoría
            </div>
            <div class="text-caption text-slate-400 q-mb-sm">
              Comparativa de montos invertidos en cada categoría
            </div>

            <div v-if="cargando" class="row justify-center items-center" style="height: 220px;">
              <q-spinner color="primary" size="36px" />
            </div>
            <div v-else-if="categoriasAgrupadas.length === 0" class="column items-center justify-center text-slate-400" style="height: 220px;">
              <q-icon name="bar_chart" size="40px" color="grey-4" />
              <span class="text-caption q-mt-xs">Sin registros de gastos para graficar</span>
            </div>
            <div v-else style="min-height: 220px;">
              <VueApexCharts
                type="bar"
                height="220"
                :options="chartBarrasOptions"
                :series="chartBarrasSeries"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- TARJETA 3: Resumen de Gastos (3 Cajas Métricas) -->
      <div class="col-12 col-md-3">
        <div class="card-widget q-pa-md full-height column justify-between">
          <div>
            <div class="text-subtitle2 text-weight-bolder text-slate-900 q-mb-md">
              Resumen de gastos
            </div>

            <div class="column q-gutter-y-md">
              <!-- Total Gastado -->
              <div class="kpi-mini-box bg-red-1" style="border: 1px solid #fee2e2;">
                <div class="row items-center q-gutter-x-sm">
                  <div class="mini-icon-circle bg-negative text-white">
                    <q-icon name="credit_card" size="18px" />
                  </div>
                  <div>
                    <div class="text-caption text-negative font-bold" style="font-size: 11px;">Total gastado</div>
                    <div class="text-h6 text-weight-bolder text-slate-900" style="line-height: 1.1;">
                      {{ formatCOP(totalGastadoMes) }}
                    </div>
                  </div>
                </div>
              </div>

              <!-- Categoría Más Alta -->
              <div class="kpi-mini-box bg-green-1" style="border: 1px solid #dcfce7;">
                <div class="row items-center q-gutter-x-sm">
                  <div class="mini-icon-circle bg-positive text-white">
                    <q-icon name="arrow_upward" size="18px" />
                  </div>
                  <div>
                    <div class="text-caption text-positive font-bold" style="font-size: 11px;">Categoría más alta</div>
                    <div class="text-subtitle2 text-weight-bolder text-slate-900" style="line-height: 1.1;">
                      {{ categoriaMasAlta.nombre }}
                    </div>
                    <div class="text-caption text-positive font-bold" style="font-size: 11px;">
                      {{ categoriaMasAlta.porcentaje }}% del total
                    </div>
                  </div>
                </div>
              </div>

              <!-- Categoría Más Baja -->
              <div class="kpi-mini-box bg-blue-1" style="border: 1px solid #dbeafe;">
                <div class="row items-center q-gutter-x-sm">
                  <div class="mini-icon-circle bg-primary text-white">
                    <q-icon name="arrow_downward" size="18px" />
                  </div>
                  <div>
                    <div class="text-caption text-primary font-bold" style="font-size: 11px;">Categoría más baja</div>
                    <div class="text-subtitle2 text-weight-bolder text-slate-900" style="line-height: 1.1;">
                      {{ categoriaMasBaja.nombre }}
                    </div>
                    <div class="text-caption text-primary font-bold" style="font-size: 11px;">
                      {{ categoriaMasBaja.porcentaje }}% del total
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>

    <!-- ─── FILA 2: CONTENEDOR INFERIOR 2 COLUMNAS (TABLA GASTOS | PANEL DERECHO) ─── -->
    <div class="categorias-bottom-grid">

      <!-- ══════════════ COLUMNA IZQUIERDA: TABLA DE GASTOS ══════════════ -->
      <div class="card-widget q-pa-md" style="min-width: 0;">
        
        <!-- Header de la Tabla -->
        <div class="row items-center justify-between q-mb-md" style="gap: 12px; flex-wrap: wrap;">
          <div class="row items-center q-gutter-x-sm">
            <div class="dash-icon-box bg-red-1 text-negative">
              <q-icon name="receipt_long" size="20px" />
            </div>
            <div>
              <div class="text-subtitle1 text-weight-bolder text-slate-900">Gastos</div>
              <div class="text-caption text-slate-500 font-medium">
                Registra y consulta todos los gastos de tu tienda.
              </div>
            </div>
          </div>

          <!-- Filtros y Botón Nuevo Gasto -->
          <div class="row items-center q-gutter-x-sm" style="flex: 1; justify-content: flex-end; min-width: 280px;">
            <q-input
              v-model="busqueda"
              dense outlined
              placeholder="Buscar descripción..."
              class="search-box"
              style="min-width: 170px; flex: 1; max-width: 220px;"
            >
              <template #prepend><q-icon name="search" size="16px" color="grey-6" /></template>
              <template #append v-if="busqueda"><q-icon name="close" size="14px" class="cursor-pointer" @click="busqueda = ''" /></template>
            </q-input>

            <q-btn
              unelevated no-caps
              color="primary"
              icon="add"
              label="Nuevo gasto"
              class="text-weight-bold"
              style="border-radius: 10px; height: 38px;"
              @click="abrirModalNuevoGasto"
            />
          </div>
        </div>

        <!-- Tabla Estilizada de Gastos -->
        <div class="table-container">
          <div class="table-header row items-center text-slate-500 text-caption font-bold q-px-md q-py-sm">
            <div style="width: 120px;">Fecha</div>
            <div style="flex: 1; min-width: 140px;">Descripción</div>
            <div style="width: 140px;" class="gt-xs">Categoría</div>
            <div style="width: 100px;" class="text-right">Monto</div>
            <div style="width: 120px;" class="text-center gt-sm">Método de pago</div>
            <div style="width: 80px;" class="text-center">Acciones</div>
          </div>

          <!-- Spinner -->
          <div v-if="cargando" class="row justify-center q-py-xl">
            <q-spinner color="primary" size="36px" />
          </div>

          <!-- Empty State -->
          <div v-else-if="gastosPaginados.length === 0" class="text-center text-slate-400 q-py-xl">
            <q-icon name="shopping_bag" size="44px" color="grey-4" />
            <div class="text-body2 text-weight-bold text-slate-600 q-mt-sm">Sin gastos encontrados</div>
            <div class="text-caption text-slate-400">No hay gastos para este mes o con ese término de búsqueda</div>
          </div>

          <!-- Filas de Datos -->
          <div v-else>
            <div
              v-for="item in gastosPaginados"
              :key="item._id"
              class="table-row row items-center q-px-md q-py-sm"
            >
              <!-- Fecha y Hora -->
              <div style="width: 120px;">
                <div class="text-weight-bold text-slate-900" style="font-size: 12.5px;">
                  {{ formatFechaItem(item.fecha) }}
                </div>
                <div class="text-caption text-slate-400" style="font-size: 11px;">
                  {{ formatHora(item.createdAt || item.fecha) }}
                </div>
              </div>

              <!-- Descripción con Ícono Redondo -->
              <div class="row items-center q-gutter-x-xs" style="flex: 1; min-width: 140px;">
                <q-avatar size="32px" color="purple-1" text-color="purple-8" style="font-size: 15px;">
                  {{ iconoPorCategoria(item.categoria) }}
                </q-avatar>
                <div class="text-weight-bold text-slate-900 text-truncate" style="font-size: 13px; max-width: 200px;">
                  {{ item.descripcion || item.categoria || 'Gasto registrado' }}
                </div>
              </div>

              <!-- Categoría (Badge Pill con Color Suave) -->
              <div style="width: 140px;" class="gt-xs">
                <span class="categoria-badge" :style="estiloBadgeCategoria(item.categoria)">
                  {{ item.categoria || 'General' }}
                </span>
              </div>

              <!-- Monto -->
              <div style="width: 100px;" class="text-right">
                <div class="text-weight-bolder text-slate-900" style="font-size: 13.5px;">
                  {{ formatCOP(item.monto) }}
                </div>
              </div>

              <!-- Método de Pago (Badge con Ícono) -->
              <div style="width: 120px;" class="text-center gt-sm">
                <span
                  class="metodo-badge"
                  :class="{
                    'metodo-badge--efectivo': item.cuenta === 'Efectivo',
                    'metodo-badge--nequi': item.cuenta === 'Nequi',
                    'metodo-badge--bancolombia': item.cuenta === 'Bancolombia'
                  }"
                >
                  <q-icon :name="iconoCuenta(item.cuenta)" size="13px" class="q-mr-xs" />
                  {{ item.cuenta || 'Efectivo' }}
                </span>
              </div>

              <!-- Acciones: Editar y Eliminar -->
              <div style="width: 80px;" class="row items-center justify-center q-gutter-x-xs">
                <q-btn flat round dense icon="edit" size="xs" color="blue-6" @click="iniciarEdicionGasto(item)" title="Editar" />
                <q-btn flat round dense icon="delete_outline" size="xs" color="red-5" @click="confirmarEliminarGasto(item)" title="Eliminar" />
              </div>
            </div>
          </div>
        </div>

        <!-- Paginación Inferior -->
        <div class="row items-center justify-between q-mt-md" style="gap: 12px; flex-wrap: wrap;">
          <div class="text-caption text-slate-500 font-medium">
            Mostrando {{ gastosPaginados.length }} de {{ gastosFiltrados.length }} gastos
          </div>
          <div v-if="totalPaginas > 1">
            <q-pagination
              v-model="paginaActual"
              :max="totalPaginas"
              :max-pages="5"
              boundary-numbers
              direction-links
              color="primary"
              size="sm"
            />
          </div>
        </div>

      </div>

      <!-- ══════════════ COLUMNA DERECHA: SIDEBAR DE GASTOS ══════════════ -->
      <div class="column q-gutter-y-md" style="min-width: 0;">

        <!-- Card 1: Mini Gastos por Categoría -->
        <div class="card-widget q-pa-md">
          <div class="text-subtitle2 text-weight-bolder text-slate-900 q-mb-sm">
            Gastos por categoría
          </div>

          <div class="row justify-center q-my-xs">
            <VueApexCharts
              type="donut"
              height="160"
              :options="chartMiniDonaOptions"
              :series="chartDonaSeries"
            />
          </div>

          <div class="column q-gutter-y-xs q-mt-xs">
            <div
              v-for="(cat, idx) in categoriasAgrupadas.slice(0, 5)"
              :key="cat.nombre"
              class="row items-center justify-between q-py-xs"
              style="border-bottom: 1px solid #f8fafc; font-size: 12px;"
            >
              <div class="row items-center q-gutter-x-xs">
                <span class="legend-color-dot" :style="{ background: paletaColores[idx % paletaColores.length] }"></span>
                <span class="text-caption text-slate-700 font-medium">{{ cat.nombre }}</span>
              </div>
              <span class="text-caption text-weight-bold text-slate-900">{{ cat.porcentaje }}%</span>
            </div>
          </div>
        </div>

        <!-- Card 2: Últimos gastos registrados -->
        <div class="card-widget q-pa-md column justify-between">
          <div>
            <div class="row items-center q-gutter-x-xs q-mb-sm">
              <q-icon name="receipt" color="purple-7" size="18px" />
              <span class="text-subtitle2 text-weight-bolder text-slate-900">Últimos gastos registrados</span>
            </div>

            <div v-if="ultimosGastos.length === 0" class="text-center text-slate-400 q-py-md text-caption">
              Sin gastos recientes
            </div>

            <div v-else class="column q-gutter-y-xs">
              <div
                v-for="g in ultimosGastos"
                :key="g._id"
                class="row items-center justify-between q-py-xs"
                style="border-bottom: 1px solid #f8fafc;"
              >
                <div class="row items-center q-gutter-x-xs" style="flex: 1; min-width: 0;">
                  <span style="font-size: 14px;">{{ iconoPorCategoria(g.categoria) }}</span>
                  <div class="text-caption text-weight-bold text-slate-800 text-truncate" style="max-width: 140px;">
                    {{ g.descripcion || g.categoria || 'Gasto' }}
                  </div>
                </div>
                <div class="column items-end">
                  <span class="text-caption text-weight-bolder text-slate-900">{{ formatCOP(g.monto) }}</span>
                  <span class="text-caption text-slate-400" style="font-size: 10px;">{{ formatFechaItem(g.fecha) }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Botón Ver Historial Completo -->
          <q-btn
            unelevated no-caps
            color="primary"
            icon="description"
            label="Ver historial completo de gastos"
            class="full-width text-weight-bold q-mt-md shadow-1"
            style="border-radius: 12px; height: 38px; font-size: 12px;"
            @click="$router.push('/historial')"
          />
        </div>

      </div>

    </div>

    <!-- ─── MODAL EDITAR GASTO ─── -->
    <q-dialog v-model="modalEditar">
      <q-card style="width: 440px; max-width: 90vw; border-radius: 20px;" class="q-pa-md">
        <q-card-section class="row items-center justify-between q-pb-xs">
          <div class="text-h6 text-weight-bolder text-slate-900">Editar Gasto</div>
          <q-btn flat round icon="close" v-close-popup />
        </q-card-section>
        <q-card-section class="column q-gutter-y-sm">
          <div>
            <div class="text-caption text-weight-bold text-slate-700 q-mb-xs">Fecha</div>
            <q-input v-model="formEdit.fecha" type="date" borderless class="clean-input" />
          </div>
          <div>
            <div class="text-caption text-weight-bold text-slate-700 q-mb-xs">Descripción</div>
            <q-input v-model="formEdit.descripcion" placeholder="Ej. Compra de verduras" borderless class="clean-input" />
          </div>
          <div>
            <div class="text-caption text-weight-bold text-slate-700 q-mb-xs">Categoría</div>
            <q-input v-model="formEdit.categoria" placeholder="Categoría" borderless class="clean-input" />
          </div>
          <div>
            <div class="text-caption text-weight-bold text-slate-700 q-mb-xs">Monto</div>
            <q-input v-model="formEdit.monto" type="number" prefix="$" borderless class="clean-input" />
          </div>
          <div>
            <div class="text-caption text-weight-bold text-slate-700 q-mb-xs">Método de pago</div>
            <div class="row q-col-gutter-xs">
              <div v-for="c in ['Efectivo', 'Nequi', 'Bancolombia']" :key="c" class="col-4">
                <div
                  class="pill-option text-center cursor-pointer"
                  :class="{ active: formEdit.cuenta === c }"
                  @click="formEdit.cuenta = c"
                >
                  {{ c }}
                </div>
              </div>
            </div>
          </div>
        </q-card-section>
        <q-card-actions class="row justify-between q-pt-md">
          <q-btn outline color="red-7" label="Eliminar" icon="delete" no-caps class="text-weight-bold" style="border-radius:12px;" @click="eliminarGastoDesdeModal" />
          <q-btn color="primary" label="Guardar cambios" no-caps class="text-weight-bold" style="border-radius:12px; padding:8px 18px;" :loading="guardandoEdit" @click="guardarEdicionGasto" />
        </q-card-actions>
      </q-card>
    </q-dialog>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import VueApexCharts from 'vue3-apexcharts'
import { getData, putData, deleteData } from '@/services/apiService'
import { formatFechaCorta } from '@/utils/dateUtils'

const router = useRouter()
const $q = useQuasar()

const cargando = ref(false)
const busqueda = ref('')
const paginaActual = ref(1)
const POR_PAGINA = 8

// Paleta de colores para gráficos
const paletaColores = ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ec4899', '#06b6d4', '#f97316']

// Mes seleccionado
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
  paginaActual.value = 1
  cargarDatosMes()
}

// Movimientos de gasto del mes
const movimientosGastos = ref([])

// Normalización de nombres de categorías (agrupa carnes/Carnes, verduras/frutas, etc.)
const normalizarCategoria = (cat) => {
  if (!cat) return 'Otros'
  const raw = String(cat).trim().toLowerCase()

  if (raw.includes('carne') || raw.includes('pollo') || raw.includes('res') || raw.includes('cerdo') || raw.includes('pescado')) {
    return 'Carnes y Pollo'
  }
  if (raw.includes('verdura') || raw.includes('fruta') || raw.includes('legumbre') || raw.includes('platano') || raw.includes('papa')) {
    return 'Verduras y Frutas'
  }
  if (raw.includes('alimento') || raw.includes('comida') || raw.includes('viveres') || raw.includes('abarrote')) {
    return 'Alimentos'
  }
  if (raw.includes('bebid') || raw.includes('tinto') || raw.includes('gaseosa') || raw.includes('jugo') || raw.includes('agua')) {
    return 'Bebidas y Tintos'
  }
  if (raw.includes('aseo') || raw.includes('limpieza') || raw.includes('jabon') || raw.includes('cloro')) {
    return 'Aseo y Limpieza'
  }
  if (raw.includes('empaque') || raw.includes('bolsa') || raw.includes('caja')) {
    return 'Empaques'
  }
  if (raw.includes('lacteo') || raw.includes('leche') || raw.includes('queso') || raw.includes('yogurt')) {
    return 'Lácteos'
  }
  if (raw.includes('snack') || raw.includes('dulce') || raw.includes('confiteria') || raw.includes('papas')) {
    return 'Snacks'
  }
  if (raw.includes('servicio') || raw.includes('luz') || raw.includes('energia') || raw.includes('agua') || raw.includes('internet')) {
    return 'Servicios públicos'
  }
  if (raw.includes('gas') || raw.includes('bombona')) {
    return 'Gas'
  }
  if (raw.includes('transporte') || raw.includes('flete') || raw.includes('gasolina') || raw.includes('domicilio')) {
    return 'Transporte'
  }

  return raw.charAt(0).toUpperCase() + raw.slice(1)
}

// Categorías agrupadas reales del mes
const categoriasAgrupadas = computed(() => {
  const map = {}
  let total = 0

  movimientosGastos.value.forEach(m => {
    const cat = normalizarCategoria(m.categoria)
    const monto = Number(m.monto) || 0
    map[cat] = (map[cat] || 0) + monto
    total += monto
  })

  return Object.entries(map)
    .sort((a, b) => b[1] - a[1])
    .map(([nombre, monto]) => ({
      nombre,
      monto,
      porcentaje: total > 0 ? Number(((monto / total) * 100).toFixed(1)) : 0
    }))
})

// Total gastado en el mes
const totalGastadoMes = computed(() =>
  categoriasAgrupadas.value.reduce((sum, c) => sum + c.monto, 0)
)

// Categoría más alta y más baja
const categoriaMasAlta = computed(() => {
  if (categoriasAgrupadas.value.length === 0) return { nombre: 'Sin datos', porcentaje: 0 }
  return categoriasAgrupadas.value[0]
})

const categoriaMasBaja = computed(() => {
  if (categoriasAgrupadas.value.length === 0) return { nombre: 'Sin datos', porcentaje: 0 }
  return categoriasAgrupadas.value[categoriasAgrupadas.value.length - 1]
})

// Gráfica de Dona (ApexCharts)
const chartDonaSeries = computed(() =>
  categoriasAgrupadas.value.map(c => c.monto)
)

const chartDonaOptions = computed(() => ({
  chart: { type: 'donut', fontFamily: 'inherit' },
  colors: paletaColores,
  labels: categoriasAgrupadas.value.map(c => c.nombre),
  legend: { show: false },
  dataLabels: { enabled: false },
  plotOptions: {
    pie: {
      donut: {
        size: '70%',
        labels: {
          show: true,
          total: {
            show: true,
            label: 'Total gastos',
            fontSize: '11px',
            color: '#64748b',
            formatter: () => formatCOP(totalGastadoMes.value)
          }
        }
      }
    }
  },
  tooltip: {
    y: {
      formatter: (val) => formatCOP(val)
    }
  }
}))

const chartMiniDonaOptions = computed(() => ({
  chart: { type: 'donut', fontFamily: 'inherit' },
  colors: paletaColores,
  labels: categoriasAgrupadas.value.map(c => c.nombre),
  legend: { show: false },
  dataLabels: { enabled: false },
  plotOptions: {
    pie: {
      donut: {
        size: '65%',
        labels: {
          show: true,
          total: {
            show: true,
            label: 'Total',
            fontSize: '10px',
            color: '#64748b',
            formatter: () => `$ ${(totalGastadoMes.value / 1000000).toFixed(1)}M`
          }
        }
      }
    }
  },
  tooltip: {
    y: {
      formatter: (val) => formatCOP(val)
    }
  }
}))

// Gráfica de Barras por Categoría (ApexCharts)
const chartBarrasSeries = computed(() => [{
  name: 'Gasto',
  data: categoriasAgrupadas.value.map(c => c.monto)
}])

const chartBarrasOptions = computed(() => ({
  chart: {
    type: 'bar',
    toolbar: { show: false },
    fontFamily: 'inherit'
  },
  plotOptions: {
    bar: {
      distributed: true,
      columnWidth: '50%',
      borderRadius: 6,
      dataLabels: { position: 'top' }
    }
  },
  colors: paletaColores,
  dataLabels: {
    enabled: true,
    formatter: (val) => `$ ${(val / 1000).toFixed(0)}k`,
    offsetY: -18,
    style: { fontSize: '10.5px', colors: ['#475569'], fontWeight: 700 }
  },
  xaxis: {
    categories: categoriasAgrupadas.value.map(c => c.nombre),
    labels: {
      style: { colors: '#64748b', fontSize: '10.5px', fontWeight: 600 }
    },
    axisBorder: { show: false },
    axisTicks: { show: false }
  },
  yaxis: {
    labels: {
      formatter: (val) => `$ ${(val / 1000).toFixed(0)}k`,
      style: { colors: '#94a3b8', fontSize: '10px' }
    }
  },
  legend: { show: false },
  grid: { borderColor: '#f1f5f9', strokeDashArray: 3 },
  tooltip: {
    y: {
      formatter: (val) => formatCOP(val)
    }
  }
}))

// Filtrado y Búsqueda en Tabla de Gastos
const gastosFiltrados = computed(() => {
  let list = movimientosGastos.value || []
  if (busqueda.value.trim()) {
    const q = busqueda.value.toLowerCase().trim()
    list = list.filter(m =>
      (m.descripcion && m.descripcion.toLowerCase().includes(q)) ||
      (m.categoria && m.categoria.toLowerCase().includes(q)) ||
      (m.cuenta && m.cuenta.toLowerCase().includes(q))
    )
  }
  return list
})

const totalPaginas = computed(() => Math.ceil(gastosFiltrados.value.length / POR_PAGINA))
const gastosPaginados = computed(() => {
  const inicio = (paginaActual.value - 1) * POR_PAGINA
  return gastosFiltrados.value.slice(inicio, inicio + POR_PAGINA)
})

// Últimos 5 gastos del mes
const ultimosGastos = computed(() =>
  movimientosGastos.value.slice(0, 5)
)

// Modales y Edición
const modalEditar = ref(false)
const guardandoEdit = ref(false)
const formEdit = ref({ id: '', fecha: '', descripcion: '', categoria: '', monto: 0, cuenta: 'Efectivo' })

const abrirModalNuevoGasto = () => router.push('/gasto')

const iniciarEdicionGasto = (item) => {
  formEdit.value = {
    id: item._id,
    fecha: item.fecha ? item.fecha.split('T')[0] : '',
    descripcion: item.descripcion || '',
    categoria: item.categoria || '',
    monto: item.monto || 0,
    cuenta: item.cuenta || 'Efectivo'
  }
  modalEditar.value = true
}

const guardarEdicionGasto = async () => {
  guardandoEdit.value = true
  try {
    await putData(`/movimientos/${formEdit.value.id}`, formEdit.value)
    $q.notify({ type: 'positive', message: '✅ Gasto actualizado' })
    modalEditar.value = false
    await cargarDatosMes()
  } catch (e) {
    $q.notify({ type: 'negative', message: e.response?.data?.mensaje || 'Error al actualizar gasto' })
  } finally {
    guardandoEdit.value = false
  }
}

const confirmarEliminarGasto = (item) => {
  $q.dialog({
    title: 'Confirmar eliminación',
    message: `¿Eliminar este gasto de ${formatCOP(item.monto)}?`,
    cancel: true,
    persistent: true
  }).onOk(async () => {
    try {
      await deleteData(`/movimientos/${item._id}`)
      $q.notify({ type: 'positive', message: '🗑️ Gasto eliminado' })
      await cargarDatosMes()
    } catch (e) {
      $q.notify({ type: 'negative', message: 'Error al eliminar gasto' })
    }
  })
}

const eliminarGastoDesdeModal = () => {
  if (!formEdit.value.id) return
  confirmarEliminarGasto({ _id: formEdit.value.id, monto: formEdit.value.monto })
  modalEditar.value = false
}

// Formateadores
const formatCOP = (val) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(val ?? 0)

const formatFechaItem = (fechaStr) => formatFechaCorta(fechaStr)

const formatHora = (fechaIso) => {
  if (!fechaIso) return '12:00 m.'
  try {
    const d = new Date(fechaIso)
    return d.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit', hour12: true })
  } catch {
    return '12:00 m.'
  }
}

const iconoCuenta = (cuenta) => {
  if (cuenta === 'Nequi') return 'phone_android'
  if (cuenta === 'Bancolombia') return 'account_balance'
  return 'payments'
}

const iconoPorCategoria = (cat) => {
  const c = String(cat || '').toLowerCase()
  if (c.includes('carne') || c.includes('pollo')) return '🥩'
  if (c.includes('verdura') || c.includes('fruta')) return '🥦'
  if (c.includes('bebid') || c.includes('tinto')) return '🥤'
  if (c.includes('aseo') || c.includes('limpieza')) return '🧼'
  if (c.includes('empaque')) return '📦'
  if (c.includes('servicio') || c.includes('luz')) return '💡'
  if (c.includes('gas')) return '🔥'
  if (c.includes('transporte')) return '🚌'
  if (c.includes('lacteo')) return '🥛'
  if (c.includes('snack')) return '🍿'
  return '🏷️'
}

const estiloBadgeCategoria = (categoria) => {
  const cat = String(categoria || '').toLowerCase()
  if (cat.includes('alimento') || cat.includes('carne') || cat.includes('verdura')) {
    return { background: '#fce7f3', color: '#db2777', border: '1px solid #fbcfe8' }
  }
  if (cat.includes('servicio') || cat.includes('luz')) {
    return { background: '#dbeafe', color: '#2563eb', border: '1px solid #bfdbfe' }
  }
  if (cat.includes('nequi')) {
    return { background: '#f3e8ff', color: '#7e22ce', border: '1px solid #e9d5ff' }
  }
  if (cat.includes('transporte')) {
    return { background: '#fef3c7', color: '#d97706', border: '1px solid #fde68a' }
  }
  if (cat.includes('gas')) {
    return { background: '#fee2e2', color: '#dc2626', border: '1px solid #fecaca' }
  }
  return { background: '#f1f5f9', color: '#475569', border: '1px solid #e2e8f0' }
}

// Cargar movimientos del mes desde la API
const cargarDatosMes = async () => {
  cargando.value = true
  try {
    const año = fechaReferencia.value.getFullYear()
    const mes = fechaReferencia.value.getMonth()
    const ultimoDia = new Date(año, mes + 1, 0).getDate()

    const desde = `${año}-${String(mes + 1).padStart(2, '0')}-01`
    const hasta = `${año}-${String(mes + 1).padStart(2, '0')}-${String(ultimoDia).padStart(2, '0')}`

    const movs = await getData('/movimientos', { desde, hasta, limit: 1000 })
    const todos = Array.isArray(movs) ? movs : []
    movimientosGastos.value = todos.filter(m => m.tipo === 'gasto')
  } catch (e) {
    console.error('Error al cargar gastos del mes:', e)
    movimientosGastos.value = []
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

.kpi-mini-box {
  border-radius: 14px;
  padding: 12px 14px;
}
.mini-icon-circle {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.legend-color-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  display: inline-block;
}

.categorias-bottom-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 330px;
  gap: 20px;
  align-items: start;
}
@media (max-width: 1024px) {
  .categorias-bottom-grid {
    grid-template-columns: 1fr;
  }
}

.table-container {
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  overflow: hidden;
  background: #ffffff;
}

.table-header {
  background: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-size: 11px;
}

.table-row {
  border-bottom: 1px solid #f1f5f9;
  transition: background-color 0.15s ease;
}
.table-row:hover {
  background-color: #f8fafc;
}
.table-row:last-child {
  border-bottom: none;
}

.categoria-badge {
  display: inline-block;
  padding: 3px 10px;
  border-radius: 12px;
  font-size: 11.5px;
  font-weight: 600;
  white-space: nowrap;
}

.metodo-badge {
  display: inline-flex;
  align-items: center;
  padding: 3px 8px;
  border-radius: 8px;
  font-size: 11.5px;
  font-weight: 600;
}
.metodo-badge--efectivo {
  background: #ecfdf5;
  color: #16a34a;
}
.metodo-badge--nequi {
  background: #f3e8ff;
  color: #7e22ce;
}
.metodo-badge--bancolombia {
  background: #fffbeb;
  color: #d97706;
}

.text-truncate {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>

