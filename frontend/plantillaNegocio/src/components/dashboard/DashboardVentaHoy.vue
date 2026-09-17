<template>
  <div class="card-widget full-height column justify-between">
    <div>
      <!-- Header -->
      <div class="row items-center justify-between q-mb-md">
        <div class="row items-center q-gutter-x-sm">
          <div class="dash-icon-box bg-blue-1 text-primary">
            <q-icon name="trending_up" size="20px" />
          </div>
          <span class="text-subtitle1 text-weight-bolder text-slate-900">Venta de hoy</span>
        </div>

        <span
          v-if="comparativa !== null"
          class="porcentaje-badge"
          :class="comparativa >= 0 ? 'porcentaje-badge--pos' : 'porcentaje-badge--neg'"
        >
          {{ comparativa >= 0 ? '+' : '' }}{{ comparativa }}% vs. ayer
        </span>
      </div>

      <!-- Total Vendido Hoy -->
      <div>
        <div class="text-caption text-slate-500 font-medium">Total vendido hoy</div>
        <div class="text-h4 text-weight-bolder text-slate-900 q-mt-xs" style="letter-spacing: -0.5px;">
          {{ formatCOP(ventaHoy) }}
        </div>
        <div class="text-caption text-slate-400 q-mt-xs" style="font-size: 11px;">
          (Gastos del día + Recaudo cierre)
        </div>
      </div>
    </div>

    <!-- Meta diaria + Gauge Circular -->
    <div class="row items-center justify-between q-mt-lg q-pt-md" style="border-top: 1px solid #f1f5f9;">
      <div>
        <div class="text-caption text-slate-500 font-medium">Meta diaria</div>
        <div class="text-subtitle1 text-weight-bolder text-slate-900">
          {{ formatCOP(metaDiaria || 600000) }}
        </div>
      </div>

      <!-- Gráfica de Progreso Circular -->
      <div class="column items-center">
        <div style="position: relative; width: 78px; height: 78px;">
          <svg width="78" height="78" viewBox="0 0 80 80">
            <!-- Círculo de fondo -->
            <circle cx="40" cy="40" r="32" fill="none" stroke="#e2e8f0" stroke-width="7"/>
            <!-- Círculo de progreso -->
            <circle
              cx="40" cy="40" r="32" fill="none"
              stroke="#10b981"
              stroke-width="7"
              stroke-linecap="round"
              :stroke-dasharray="201.1"
              :stroke-dashoffset="201.1 * (1 - porcentajeProgreso)"
              transform="rotate(-90 40 40)"
              style="transition: stroke-dashoffset 0.8s ease;"
            />
          </svg>
          <div class="absolute-center text-center">
            <div class="text-weight-bolder text-slate-900" style="font-size: 14px; line-height: 1;">
              {{ Math.round(porcentajeProgreso * 100) }}%
            </div>
            <div class="text-caption text-slate-400" style="font-size: 9px;">Cumplido</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Comparativa con ayer Footer -->
    <div class="row items-center q-gutter-x-xs q-mt-sm">
      <q-icon
        :name="comparativa >= 0 ? 'trending_up' : 'trending_down'"
        :color="comparativa >= 0 ? 'positive' : 'negative'"
        size="16px"
      />
      <span
        class="text-caption text-weight-bold"
        :class="comparativa >= 0 ? 'text-positive' : 'text-negative'"
        style="font-size: 11.5px;"
      >
        {{ comparativa >= 0 ? '+' : '' }}{{ comparativa || 12 }}% en comparación con ayer
      </span>
    </div>

  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  ventaHoy:    { type: Number, default: 0 },
  metaDiaria:  { type: Number, default: 600000 },
  comparativa: { type: Number, default: 12 }
})

const porcentajeProgreso = computed(() => {
  const meta = props.metaDiaria > 0 ? props.metaDiaria : 600000
  return Math.min(1, props.ventaHoy / meta)
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

.porcentaje-badge {
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 700;
}
.porcentaje-badge--pos {
  background: #dcfce7;
  color: #16a34a;
}
.porcentaje-badge--neg {
  background: #fee2e2;
  color: #dc2626;
}
</style>
