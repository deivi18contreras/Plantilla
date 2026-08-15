<template>
  <div class="bg-white q-pa-md q-mb-md" style="border-radius: 20px; border: 1px solid #e2e8f0;">
    <div class="row items-center justify-between q-mb-md">
      <div class="row items-center q-gutter-x-sm">
        <q-avatar size="40px" color="blue-1" text-color="blue-8" icon="event" class="text-weight-bold" />
        <div>
          <div class="text-subtitle1 text-weight-bolder text-slate-900 text-capitalize">
            Cierre Diario — {{ formatFechaLarga(cierre.fecha) }}
          </div>
          <div class="text-caption text-slate-500 font-medium">
            Registrado por: <strong class="text-slate-800">{{ cierre.creadoPor }}</strong>
          </div>
        </div>
      </div>
    </div>

    <!-- Fila 1: GASTOS Y EFECTIVO NETO -->
    <div class="row q-col-gutter-sm q-mb-sm">
      <div class="col-12 col-sm-6">
        <div class="q-pa-sm bg-red-50 border border-red-2" style="border-radius: 12px; background: #fff1f2; border: 1px solid #fecdd3;">
          <div class="text-caption text-red-7 text-weight-bold">🔴 Gastos del día (del negocio):</div>
          <div class="text-h6 text-weight-bolder text-red-8">- {{ formatCOP(cierre.gastosReales) }}</div>
          <div v-if="cierre.gastosExternos > 0" class="text-caption text-orange-7 q-mt-xs">
            ⚡ + {{ formatCOP(cierre.gastosExternos) }} externos (no cuentan en venta)
          </div>
        </div>
      </div>

      <div class="col-12 col-sm-6">
        <div class="q-pa-sm bg-green-50 border border-green-2" style="border-radius: 12px; background: #f0fdf4; border: 1px solid #bbf7d0;">
          <div class="text-caption text-green-7 text-weight-bold">💵 Recaudo Efectivo Neto:</div>
          <div class="text-h6 text-weight-bolder text-green-8">{{ formatCOP(cierre.efectivo) }}</div>
        </div>
      </div>
    </div>

    <!-- Fila 2: NEQUI Y BANCOLOMBIA -->
    <div class="row q-col-gutter-sm q-mb-md">
      <div class="col-12 col-sm-6">
        <div class="q-pa-sm bg-purple-50 border border-purple-2" style="border-radius: 12px; background: #faf5ff; border: 1px solid #e9d5ff;">
          <div class="text-caption text-purple-7 text-weight-bold">📱 Total Nequi recibido:</div>
          <div class="text-h6 text-weight-bolder text-purple-9">{{ formatCOP(cierre.nequi) }}</div>
        </div>
      </div>

      <div class="col-12 col-sm-6">
        <div class="q-pa-sm bg-amber-50 border border-amber-2" style="border-radius: 12px; background: #fffbeb; border: 1px solid #fde68a;">
          <div class="text-caption text-amber-8 text-weight-bold">🏦 Total Bancolombia recibido:</div>
          <div class="text-h6 text-weight-bolder text-amber-9">{{ formatCOP(cierre.bancolombia) }}</div>
        </div>
      </div>
    </div>

    <!-- Caja Resumen Oscura -->
    <div class="q-pa-md bg-slate-900 text-white shadow-md" style="border-radius: 16px; background: #0f172a;">
      <div class="column q-gutter-y-xs">
        <div class="row items-center justify-between" style="flex-wrap: wrap; gap: 4px;">
          <span class="text-caption text-weight-bold text-slate-200">🔵 CIERRE TOTAL (Efectivo + Nequi + Bancolombia):</span>
          <span class="text-h6 text-weight-bolder text-blue-4">{{ formatCOP(cierre.totalCierre) }}</span>
        </div>

        <q-separator dark class="q-my-xs" style="opacity: 0.2;" />

        <div class="row items-center justify-between" style="flex-wrap: wrap; gap: 4px;">
          <span class="text-subtitle2 text-weight-bolder text-green-4">🟢 VENTA TOTAL DEL DÍA (Gastos + Cierre):</span>
          <span class="text-h5 text-weight-bolder text-green-4">{{ formatCOP(cierre.totalVenta) }}</span>
        </div>

        <div v-if="cierre.observaciones" class="text-caption text-amber-3 q-mt-xs font-medium border-t border-slate-800 q-pt-xs" style="border-top: 1px solid rgba(255,255,255,0.15);">
          📝 Observaciones: {{ cierre.observaciones }}
        </div>
      </div>
    </div>

    <!-- BOTÓN COMPARTIR -->
    <div class="row justify-end q-mt-sm">
      <q-btn
        flat no-caps
        icon="share"
        label="Compartir por WhatsApp"
        color="positive"
        class="text-weight-bold"
        style="border-radius: 10px;"
        @click="$emit('compartir', cierre)"
      />
    </div>
  </div>
</template>

<script setup>
defineProps({
  cierre: {
    type: Object,
    required: true
  }
})

defineEmits(['compartir'])

const formatCOP = (val) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(val ?? 0)

const formatFechaLarga = (fechaStr) => {
  if (!fechaStr) return ''
  const d = new Date(fechaStr + 'T12:00:00')
  return d.toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
}
</script>
