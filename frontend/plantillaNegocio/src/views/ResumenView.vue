<template>
  <div class="row justify-center q-pa-md">
    <div class="card-widget" style="max-width: 760px; width: 100%;">

      <!-- Encabezado con selector de mes -->
      <div class="column column-sm-row items-start items-sm-center justify-between q-mb-lg" style="gap:12px;">
        <div>
          <div class="text-h5 text-weight-bolder text-slate-900">Resumen del Mes</div>
          <div class="text-caption text-slate-500 font-medium">Análisis financiero consolidado del negocio</div>
        </div>
        <div class="row items-center q-gutter-xs">
          <q-input
            v-model="mesSeleccionado"
            type="month"
            borderless
            dense
            class="clean-input"
            style="max-width: 160px;"
            @update:model-value="cargarResumen"
          />
          <q-btn
            flat no-caps
            icon="picture_as_pdf"
            label="PDF"
            color="red-7"
            class="text-weight-bold"
            style="border-radius: 10px;"
            @click="exportarPDF"
          />
          <q-btn
            flat no-caps
            icon="table_view"
            label="Excel"
            color="positive"
            class="text-weight-bold"
            style="border-radius: 10px;"
            @click="exportarExcel"
          />
        </div>
      </div>

      <!-- Estado de carga -->
      <div v-if="cargando" class="column items-center q-py-xl">
        <q-spinner color="primary" size="36px" />
        <div class="text-caption text-slate-500 q-mt-sm">Calculando resumen mensual...</div>
      </div>

      <template v-else>

        <!-- Fila: Ventas Brutas, Gastos y Te Queda -->
        <div class="row q-col-gutter-sm q-mb-lg">
          <div class="col-12 col-sm-4">
            <div class="q-pa-md bg-green-50 rounded-xl text-center" style="border-radius: 16px; background: #f0fdf4; border: 1px solid #bbf7d0;">
              <div class="text-caption text-green-7 text-weight-bold q-mb-xs">📈 VENTAS TOTALES</div>
              <div class="text-h6 text-weight-bolder text-green-8">{{ formatCOP(resumen.totalRecaudos) }}</div>
              <div class="text-caption text-slate-500" style="font-size: 11px;">Gastos + Cierres</div>
            </div>
          </div>

          <div class="col-12 col-sm-4">
            <div class="q-pa-md rounded-xl text-center" style="border-radius: 16px; background: #fff1f2; border: 1px solid #fecdd3;">
              <div class="text-caption text-red-7 text-weight-bold q-mb-xs">📉 GASTOS DEL MES</div>
              <div class="text-h6 text-weight-bolder text-red-8">{{ formatCOP(resumen.totalGastos) }}</div>
              <div class="text-caption text-slate-500" style="font-size: 11px;">Compras del mes</div>
            </div>
          </div>

          <div class="col-12 col-sm-4">
            <div class="card-solid-blue text-center q-pa-md" style="border-radius: 16px; min-height: unset; background: #2563eb;">
              <div class="text-caption text-blue-2 text-weight-bold q-mb-xs">💰 TE QUEDA (LÍQUIDO)</div>
              <div class="text-h6 text-weight-bolder text-white">{{ formatCOP(resumen.neto) }}</div>
              <div class="text-caption text-blue-2" style="font-size: 11px;">Ventas - Gastos</div>
            </div>
          </div>
        </div>

        <!-- Desglose por Cuenta -->
        <div class="q-mb-md">
          <div class="text-subtitle2 text-weight-bold text-slate-700 q-mb-sm">Plata Guardada por Cuenta (Cierres del Mes)</div>
          <div class="row q-col-gutter-sm">
            <div class="col-12 col-sm-4">
              <div class="q-pa-sm bg-slate-50 rounded-xl text-center" style="border-radius: 12px; border: 1px solid #e2e8f0;">
                <div class="text-caption text-slate-500 font-medium">💵 Efectivo Neto</div>
                <div class="text-subtitle2 text-weight-bolder text-slate-800">{{ formatCOP(resumen.recaudosPorCuenta?.Efectivo || 0) }}</div>
              </div>
            </div>
            <div class="col-12 col-sm-4">
              <div class="q-pa-sm bg-slate-50 rounded-xl text-center" style="border-radius: 12px; border: 1px solid #e2e8f0;">
                <div class="text-caption text-slate-500 font-medium">📱 Nequi</div>
                <div class="text-subtitle2 text-weight-bolder text-slate-800">{{ formatCOP(resumen.recaudosPorCuenta?.Nequi || 0) }}</div>
              </div>
            </div>
            <div class="col-12 col-sm-4">
              <div class="q-pa-sm bg-slate-50 rounded-xl text-center" style="border-radius: 12px; border: 1px solid #e2e8f0;">
                <div class="text-caption text-slate-500 font-medium">🏦 Bancolombia</div>
                <div class="text-subtitle2 text-weight-bolder text-slate-800">{{ formatCOP(resumen.recaudosPorCuenta?.Bancolombia || 0) }}</div>
              </div>
            </div>
          </div>
        </div>

        <q-separator class="q-my-md" />

        <!-- COMPARATIVA MES ANTERIOR -->
        <div v-if="resumen.mesAnterior" class="q-mb-md">
          <div class="text-subtitle2 text-weight-bold text-slate-700 q-mb-sm">📊 Comparativa vs Mes Anterior</div>
          <div class="row q-col-gutter-sm">
            <!-- Ventas -->
            <div class="col-12 col-sm-4">
              <div class="q-pa-sm text-center" style="border-radius: 12px; border: 1px solid #e2e8f0; background: #f8fafc;">
                <div class="text-caption text-slate-500 q-mb-xs">📈 Ventas</div>
                <div class="text-caption text-slate-400">Antes: {{ formatCOP(resumen.mesAnterior.totalVentas) }}</div>
                <div class="text-caption text-slate-400">Ahora: {{ formatCOP(resumen.totalRecaudos) }}</div>
                <q-badge
                  :color="resumen.totalRecaudos >= resumen.mesAnterior.totalVentas ? 'positive' : 'negative'"
                  :label="diferenciaLabel(resumen.totalRecaudos, resumen.mesAnterior.totalVentas)"
                  class="q-mt-xs text-weight-bold"
                />
              </div>
            </div>
            <!-- Gastos -->
            <div class="col-12 col-sm-4">
              <div class="q-pa-sm text-center" style="border-radius: 12px; border: 1px solid #e2e8f0; background: #f8fafc;">
                <div class="text-caption text-slate-500 q-mb-xs">📉 Gastos</div>
                <div class="text-caption text-slate-400">Antes: {{ formatCOP(resumen.mesAnterior.totalGastos) }}</div>
                <div class="text-caption text-slate-400">Ahora: {{ formatCOP(resumen.totalGastos) }}</div>
                <q-badge
                  :color="resumen.totalGastos <= resumen.mesAnterior.totalGastos ? 'positive' : 'negative'"
                  :label="diferenciaLabel(resumen.totalGastos, resumen.mesAnterior.totalGastos)"
                  class="q-mt-xs text-weight-bold"
                />
              </div>
            </div>
            <!-- Neto -->
            <div class="col-12 col-sm-4">
              <div class="q-pa-sm text-center" style="border-radius: 12px; border: 1px solid #e2e8f0; background: #f8fafc;">
                <div class="text-caption text-slate-500 q-mb-xs">💰 Te Queda</div>
                <div class="text-caption text-slate-400">Antes: {{ formatCOP(resumen.mesAnterior.neto) }}</div>
                <div class="text-caption text-slate-400">Ahora: {{ formatCOP(resumen.neto) }}</div>
                <q-badge
                  :color="resumen.neto >= resumen.mesAnterior.neto ? 'positive' : 'negative'"
                  :label="diferenciaLabel(resumen.neto, resumen.mesAnterior.neto)"
                  class="q-mt-xs text-weight-bold"
                />
              </div>
            </div>
          </div>
        </div>

        <q-separator class="q-my-md" />

        <!-- Gastos por categoría -->
        <div>
          <div class="text-subtitle2 text-weight-bold text-slate-700 q-mb-sm">Gastos por Categoría</div>

          <div v-if="resumen.gastosPorCategoria?.length === 0" class="text-caption text-slate-400 q-py-md text-center">
            No hay gastos registrados en este mes
          </div>

          <q-list v-else separator>
            <q-item
              v-for="cat in resumen.gastosPorCategoria"
              :key="cat._id"
              class="q-px-none q-py-sm"
            >
              <q-item-section>
                <q-item-label class="text-weight-bold text-slate-800">{{ cat._id || 'Sin categoría' }}</q-item-label>
                <q-linear-progress
                  :value="resumen.totalGastos > 0 ? cat.total / resumen.totalGastos : 0"
                  color="blue-6"
                  track-color="blue-1"
                  class="q-mt-xs"
                  rounded
                  style="height: 6px;"
                />
              </q-item-section>
              <q-item-section side>
                <span class="text-weight-bolder text-slate-900">{{ formatCOP(cat.total) }}</span>
                <span class="text-caption text-slate-400 text-right">
                  {{ resumen.totalGastos > 0 ? Math.round((cat.total / resumen.totalGastos) * 100) : 0 }}%
                </span>
              </q-item-section>
            </q-item>
          </q-list>
        </div>

      </template>

    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getData } from '@/services/apiService'
import { useConfiguracionStore } from '@/store/configuracionStore'
import * as XLSX from 'xlsx'

const configStore = useConfiguracionStore()
const cargando = ref(false)

const ahora = new Date()
const mesSeleccionado = ref(`${ahora.getFullYear()}-${String(ahora.getMonth() + 1).padStart(2, '0')}`)

const resumen = ref({
  totalRecaudos: 0,
  totalGastos: 0,
  neto: 0,
  gastosPorCategoria: [],
  recaudosPorCuenta: { Efectivo: 0, Nequi: 0, Bancolombia: 0 },
  mesAnterior: null
})

const formatCOP = (val) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(val ?? 0)

const diferenciaLabel = (actual, anterior) => {
  if (!anterior || anterior === 0) return 'N/D'
  const pct = Math.round(((actual - anterior) / Math.abs(anterior)) * 100)
  return (pct >= 0 ? '+' : '') + pct + '%'
}

const exportarPDF = () => {
  const nombre = configStore.nombreNegocio || 'Negocio'
  const titulo = `${nombre} - Resumen ${mesSeleccionado.value}`
  const original = document.title
  document.title = titulo
  window.print()
  document.title = original
}

const exportarExcel = async () => {
  try {
    const [year, month] = mesSeleccionado.value.split('-').map(Number)
    const ultimoDia = new Date(year, month, 0).getDate()
    const desde = `${year}-${String(month).padStart(2, '0')}-01`
    const hasta = `${year}-${String(month).padStart(2, '0')}-${String(ultimoDia).padStart(2, '0')}`

    const movimientos = await getData('/movimientos', { desde, hasta, limit: 1000 })
    const gastos = movimientos.filter(m => m.tipo === 'gasto')
    const recaudos = movimientos.filter(m => m.tipo === 'recaudo')

    const nombreNegocio = configStore.nombreNegocio || 'Mi Negocio'
    const wb = XLSX.utils.book_new()

    // ─── HOJA 1: RESUMEN MENSUAL ─────────────────────────
    const resumenAoa = [
      [`REPORTE FINANCIERO MENSUAL - ${nombreNegocio.toUpperCase()}`],
      [`Período: ${mesSeleccionado.value}`],
      [`Generado: ${new Date().toLocaleDateString('es-CO')} ${new Date().toLocaleTimeString('es-CO')}`],
      [],
      ['INDICADOR FINANCIERO', 'MONTO (COP)', 'DETALLE / OBSERVACIÓN'],
      ['Ventas Totales', resumen.value.totalRecaudos, 'Gastos del mes + Cierres guardados'],
      ['Gastos del Mes', resumen.value.totalGastos, 'Total compras e insumos'],
      ['Te Queda (Ganancia Líquida)', resumen.value.neto, 'Plata neta en cuentas'],
      ['Efectivo Guardado en Caja', resumen.value.recaudosPorCuenta?.Efectivo || 0, 'Total acumulado en efectivo'],
      ['Nequi Acumulado', resumen.value.recaudosPorCuenta?.Nequi || 0, 'Recibido en transferencias Nequi'],
      ['Bancolombia Acumulado', resumen.value.recaudosPorCuenta?.Bancolombia || 0, 'Recibido en transferencias Bancolombia'],
      [],
      ['#', 'CATEGORÍA DE GASTO', 'TOTAL GASTADO (COP)', '% DEL TOTAL'],
      ...resumen.value.gastosPorCategoria.map((cat, idx) => [
        idx + 1,
        cat._id || 'Sin categoría',
        cat.total,
        `${resumen.value.totalGastos > 0 ? Math.round((cat.total / resumen.value.totalGastos) * 100) : 0}%`
      ]),
      ['', 'TOTAL GASTOS', resumen.value.totalGastos, '100%']
    ]

    const wsResumen = XLSX.utils.aoa_to_sheet(resumenAoa)
    wsResumen['!cols'] = [{ wch: 28 }, { wch: 20 }, { wch: 40 }, { wch: 15 }]
    XLSX.utils.book_append_sheet(wb, wsResumen, 'Resumen General')

    // ─── HOJA 2: DETALLE DE GASTOS ───────────────────────
    const gastosAoa = [
      ['Fecha', 'Categoría', 'Descripción / Proveedor', 'Método de Pago', 'Monto (COP)', 'Registrado Por'],
      ...gastos.map(g => [
        g.fecha ? new Date(g.fecha).toISOString().split('T')[0] : '',
        g.categoria || 'Sin categoría',
        g.descripcion || '',
        g.cuenta || 'Efectivo',
        g.monto,
        g.creadoPor?.nombre || 'Empleado'
      ]),
      [],
      ['', '', '', 'TOTAL COMPRAS:', resumen.value.totalGastos, '']
    ]

    const wsGastos = XLSX.utils.aoa_to_sheet(gastosAoa)
    wsGastos['!cols'] = [{ wch: 14 }, { wch: 22 }, { wch: 38 }, { wch: 18 }, { wch: 18 }, { wch: 20 }]
    XLSX.utils.book_append_sheet(wb, wsGastos, 'Detalle de Gastos')

    // ─── HOJA 3: RECAUDOS Y CIERRES ──────────────────────
    const cierresAoa = [
      ['Fecha', 'Concepto', 'Cuenta', 'Monto Guardado (COP)', 'Observaciones', 'Registrado Por'],
      ...recaudos.map(r => [
        r.fecha ? new Date(r.fecha).toISOString().split('T')[0] : '',
        r.categoria || 'Cierre',
        r.cuenta,
        r.monto,
        `${r.descripcion || ''} ${r.observaciones || ''}`.trim(),
        r.creadoPor?.nombre || 'Empleado'
      ])
    ]

    const wsCierres = XLSX.utils.aoa_to_sheet(cierresAoa)
    wsCierres['!cols'] = [{ wch: 14 }, { wch: 20 }, { wch: 16 }, { wch: 22 }, { wch: 38 }, { wch: 20 }]
    XLSX.utils.book_append_sheet(wb, wsCierres, 'Cierres Diarios')

    // Descarga nativa .xlsx sin errores de formato
    XLSX.writeFile(wb, `Reporte_Financiero_${nombreNegocio}_${mesSeleccionado.value}.xlsx`)
  } catch (error) {
    console.error('Error al exportar Excel:', error)
  }
}


const cargarResumen = async () => {
  cargando.value = true
  try {
    const data = await getData('/resumen', { mes: mesSeleccionado.value })
    resumen.value = data
  } catch (error) {
    console.error('Error al cargar resumen:', error)
  } finally {
    cargando.value = false
  }
}

onMounted(async () => {
  await configStore.fetchConfiguracion()
  cargarResumen()
})
</script>
