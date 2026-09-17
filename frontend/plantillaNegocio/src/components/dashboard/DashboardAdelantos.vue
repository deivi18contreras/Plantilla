<template>
  <div class="card-widget full-height column justify-between">
    <div>
      <!-- Header -->
      <div class="row items-center justify-between q-mb-md">
        <div class="row items-center q-gutter-x-sm">
          <div class="dash-icon-box bg-pink-1 text-pink-7">
            <q-icon name="people" size="20px" />
          </div>
          <span class="text-subtitle1 text-weight-bolder text-slate-900">Deudas internas (Adelantos)</span>
        </div>
        <q-btn flat round dense icon="chevron_right" color="grey-6" @click="$emit('ver-todos')" />
      </div>

      <!-- Sin adelantos -->
      <div v-if="adelantosVisibles.length === 0" class="text-center text-slate-400 q-py-lg">
        <q-icon name="check_circle" color="positive" size="36px" class="q-mb-xs" /><br>
        <span class="text-caption text-slate-500">Sin adelantos pendientes 🎉</span>
      </div>

      <!-- Lista de adelantos -->
      <div v-else class="column q-gutter-y-sm">
        <div
          v-for="item in adelantosVisibles"
          :key="item._id"
          class="adelanto-item q-pb-sm"
          style="border-bottom: 1px solid #f1f5f9;"
        >
          <div class="row items-center justify-between q-mb-xs">
            <div class="row items-center q-gutter-x-sm">
              <q-avatar size="32px" color="red-1" text-color="red-7" class="text-weight-bold" style="font-size: 12px;">
                {{ primeraLetra(item.motivo) }}
              </q-avatar>
              <div>
                <div class="text-weight-bold text-slate-900" style="font-size: 13px; line-height: 1.1;">
                  {{ item.motivo ? item.motivo.split(' ')[0] : 'Empleado' }}
                </div>
                <div class="text-caption text-slate-400" style="font-size: 11px;">
                  Motivo: {{ item.motivo || 'Préstamo' }}
                </div>
              </div>
            </div>
            <div class="text-caption text-slate-400" style="font-size: 10.5px;">
              {{ formatFecha(item.fecha) }}
            </div>
          </div>

          <!-- Montos y Barra de Progreso -->
          <div class="row items-center justify-between q-mt-xs text-caption">
            <span class="text-weight-bold text-slate-700" style="font-size: 11.5px;">
              {{ formatCOP(item.monto) }} / <span class="text-slate-500">{{ formatCOP(item.saldoPendiente) }}</span>
            </span>
            <span class="text-weight-bold text-slate-500" style="font-size: 11px;">
              {{ Math.round(porcentajeRecuperado(item) * 100) }}%
            </span>
          </div>

          <q-linear-progress
            :value="porcentajeRecuperado(item)"
            color="positive"
            track-color="grey-3"
            rounded
            size="6px"
            class="q-mt-xs"
          />
        </div>
      </div>
    </div>

    <!-- Footer -->
    <div class="row items-center justify-between q-mt-md q-pt-md" style="border-top: 1px solid #f1f5f9; gap: 8px;">
      <div>
        <div class="text-caption text-slate-400 font-medium" style="font-size: 10.5px;">Total pendiente acumulado</div>
        <div class="text-subtitle1 text-weight-bolder text-red-6" style="line-height: 1.1;">
          {{ formatCOP(totalPendiente) }}
        </div>
      </div>

      <q-btn
        unelevated no-caps
        color="red-7"
        label="Ver todos los adelantos"
        class="text-weight-bold"
        style="border-radius: 10px; font-size: 11.5px; padding: 6px 12px;"
        @click="$emit('ver-todos')"
      />
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  adelantos:      { type: Array,  default: () => [] },
  totalPendiente: { type: Number, default: 0 },
})
defineEmits(['ver-todos'])

const adelantosVisibles = computed(() => props.adelantos.slice(0, 3))

const porcentajeRecuperado = (item) => {
  if (!item.monto || item.monto <= 0) return 0
  const rec = item.montoRecuperado ?? (item.monto - (item.saldoPendiente ?? 0))
  return Math.min(1, Math.max(0, rec / item.monto))
}

const primeraLetra = (motivo) => {
  if (!motivo) return 'A'
  return motivo.trim().charAt(0).toUpperCase()
}

const formatCOP = (val) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(val ?? 0)

const formatFecha = (fechaStr) => {
  if (!fechaStr) return ''
  try {
    const d = new Date(fechaStr)
    return d.toLocaleDateString('es-CO', { day: '2-digit', month: 'short' })
  } catch (e) {
    return ''
  }
}
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
