<template>
  <div class="card-widget full-height">
    <div class="row items-center justify-between q-mb-md">
      <div>
        <div class="text-subtitle1 text-weight-bolder text-slate-900">Distribución del Mes</div>
        <div class="text-caption text-slate-500">Gastos por categoría en el mes actual</div>
      </div>
      <div class="text-right">
        <div class="text-caption text-slate-400">Total Gastos</div>
        <div class="text-subtitle2 text-weight-bolder text-red-6">{{ formatCOP(totalGastos) }}</div>
      </div>
    </div>

    <!-- Cargando -->
    <div v-if="cargando" class="column items-center justify-center q-py-xl">
      <q-spinner-pie color="primary" size="48px" />
      <div class="text-caption text-slate-400 q-mt-sm">Cargando distribución...</div>
    </div>

    <!-- Vacío -->
    <div v-else-if="!datos || datos.length === 0" class="column items-center justify-center q-py-xl text-slate-400">
      <q-icon name="donut_small" size="48px" color="grey-4" />
      <div class="text-caption q-mt-sm">Sin gastos registrados en el mes</div>
    </div>

    <!-- Contenido con gráfica y desglose -->
    <div v-else>
      <div class="flex justify-center q-mb-md">
        <apexchart
          type="donut"
          width="320"
          :options="chartOptions"
          :series="chartSeries"
        />
      </div>

      <div class="column q-gutter-y-xs q-mt-sm">
        <div
          v-for="item in datos"
          :key="item._id"
          class="row items-center justify-between q-py-xs"
          style="border-bottom: 1px solid #f1f5f9;"
        >
          <div class="row items-center q-gutter-x-xs">
            <span class="text-caption text-weight-bold text-slate-800">{{ item._id }}</span>
          </div>
          <div class="row items-center q-gutter-x-sm">
            <span class="text-caption text-slate-500 font-medium">
              {{ totalGastos > 0 ? Math.round((item.total / totalGastos) * 100) : 0 }}%
            </span>
            <span class="text-caption text-weight-bolder text-slate-900">{{ formatCOP(item.total) }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  datos: {
    type: Array,
    default: () => []
  },
  totalGastos: {
    type: Number,
    default: 0
  },
  cargando: {
    type: Boolean,
    default: false
  }
})

const formatCOP = (val) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(val ?? 0)

const chartSeries = computed(() => {
  return props.datos.map(d => d.total || 0)
})

const chartOptions = computed(() => {
  const labels = props.datos.map(d => d._id || 'Sin categoría')
  return {
    chart: {
      type: 'donut',
      fontFamily: 'inherit'
    },
    labels,
    legend: {
      position: 'bottom',
      fontSize: '12px',
      markers: { radius: 12 }
    },
    stroke: {
      show: true,
      colors: ['#ffffff'],
      width: 2
    },
    dataLabels: {
      enabled: false
    },
    tooltip: {
      y: {
        formatter: (val) => formatCOP(val)
      }
    },
    plotOptions: {
      pie: {
        donut: {
          size: '68%',
          labels: {
            show: true,
            total: {
              show: true,
              label: 'Total',
              formatter: () => formatCOP(props.totalGastos)
            }
          }
        }
      }
    }
  }
})
</script>

