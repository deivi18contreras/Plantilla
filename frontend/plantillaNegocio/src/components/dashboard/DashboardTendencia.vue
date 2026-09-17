<template>
  <div class="card-widget full-height column justify-between">
    <div>
      <!-- Header -->
      <div class="row items-center q-gutter-x-sm q-mb-xs">
        <div class="dash-icon-box bg-blue-1 text-primary">
          <q-icon name="show_chart" size="20px" />
        </div>
        <span class="text-subtitle1 text-weight-bolder text-slate-900">Tendencia de ventas (últimos 7 días)</span>
      </div>

      <!-- Gráfica ApexCharts -->
      <div class="q-mt-sm">
        <q-skeleton v-if="cargando" height="190px" square style="border-radius: 12px;" />

        <div
          v-else-if="!chartSeries[0]?.data?.length"
          class="column items-center justify-center text-slate-400"
          style="height: 190px;"
        >
          <q-icon name="bar_chart" size="36px" color="grey-4" />
          <span class="text-caption q-mt-xs">Sin datos registrados esta semana</span>
        </div>

        <VueApexCharts
          v-else
          type="bar"
          height="190"
          :options="chartOptions"
          :series="chartSeries"
        />
      </div>
    </div>

    <!-- Footer: Promedio Semanal -->
    <div class="row items-center q-gutter-x-sm q-mt-xs q-pt-sm" style="border-top: 1px solid #f1f5f9;">
      <div class="dash-icon-box bg-blue-1 text-primary" style="width: 28px; height: 28px;">
        <q-icon name="insights" size="16px" />
      </div>
      <div>
        <div class="text-caption text-slate-500 font-medium" style="font-size: 10.5px;">Promedio semanal</div>
        <div class="text-subtitle2 text-weight-bolder text-slate-900" style="line-height: 1.1;">
          {{ formatCOP(promedioIngresos) }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import VueApexCharts from 'vue3-apexcharts'

const props = defineProps({
  semanaData: { type: Array,   default: () => [] },
  cargando:   { type: Boolean, default: false }
})

const defaultDias = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']

const categorias = computed(() => {
  if (props.semanaData && props.semanaData.length > 0) {
    return props.semanaData.map(d => d.label || d.dia || '')
  }
  return defaultDias
})

const chartSeries = computed(() => {
  let values = []
  if (props.semanaData && props.semanaData.length > 0) {
    values = props.semanaData.map(d => Number(d.recaudos || d.total || 0))
  } else {
    values = [420000, 440000, 520000, 410000, 430000, 480000, 458000]
  }

  return [{
    name: 'Ventas',
    data: values
  }]
})

const chartOptions = computed(() => ({
  chart: {
    type: 'bar',
    toolbar: { show: false },
    fontFamily: 'inherit',
    sparkline: { enabled: false }
  },
  plotOptions: {
    bar: {
      borderRadius: 6,
      columnWidth: '45%',
      distributed: false
    }
  },
  colors: ['#3b82f6'],
  dataLabels: { enabled: false },
  grid: {
    borderColor: '#f1f5f9',
    strokeDashArray: 3,
    padding: { left: 0, right: 0 }
  },
  xaxis: {
    categories: categorias.value,
    labels: {
      style: { colors: '#64748b', fontSize: '11px', fontWeight: 600 }
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
  tooltip: {
    y: {
      formatter: (val) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(val ?? 0)
    }
  }
}))

const promedioIngresos = computed(() => {
  const data = chartSeries.value[0]?.data || []
  if (data.length === 0) return 0
  const suma = data.reduce((s, v) => s + v, 0)
  return Math.round(suma / data.length)
})

const formatCOP = (val) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(val ?? 0)
</script>

<style scoped>
.dash-icon-box {
  width: 34px;
  height: 34px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
