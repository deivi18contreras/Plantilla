<template>
  <div class="card-widget full-height column justify-between">
    <div>
      <!-- Header -->
      <div class="row items-center justify-between q-mb-md">
        <div class="row items-center q-gutter-x-sm">
          <div class="dash-icon-box bg-purple-1 text-purple-8">
            <q-icon name="shopping_bag" size="20px" />
          </div>
          <span class="text-subtitle1 text-weight-bolder text-slate-900">Gastos de hoy</span>
        </div>
        <q-btn flat round dense icon="chevron_left" color="grey-6" @click="$router.push('/gasto')" />
      </div>

      <!-- Sin gastos hoy -->
      <div v-if="gastos.length === 0" class="text-center text-slate-400 q-py-lg">
        <q-icon name="receipt_long" size="36px" color="grey-4" class="q-mb-xs" /><br>
        <span class="text-caption">Sin gastos registrados hoy</span>
      </div>

      <!-- Lista de Gastos -->
      <div v-else class="column q-gutter-y-xs">
        <div
          v-for="m in gastos.slice(0, 5)"
          :key="m._id"
          class="row items-center justify-between q-py-xs"
          style="border-bottom: 1px solid #f8fafc;"
        >
          <div class="row items-center q-gutter-x-sm" style="flex: 1; min-width: 0;">
            <q-icon :name="iconoGasto(m.categoria)" color="purple-7" size="18px" />
            <div class="text-caption text-weight-bold text-slate-800 text-truncate" style="max-width: 150px;">
              {{ m.descripcion || m.categoria || 'Gasto' }}
            </div>
          </div>
          <div class="row items-center q-gutter-x-sm">
            <span class="text-weight-bold text-slate-900" style="font-size: 13px;">
              {{ formatCOP(m.monto) }}
            </span>
            <span class="text-caption text-slate-400" style="font-size: 11px; min-width: 38px; text-align: right;">
              {{ formatHora(m.fecha) }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Footer Split (Subtotales izquierda + Caja total morada derecha) -->
    <div class="row items-center justify-between q-mt-md q-pt-md" style="border-top: 1px solid #f1f5f9; gap: 12px;">
      
      <!-- Subtotales por cuenta -->
      <div class="column q-gutter-y-xs" style="flex: 1; min-width: 120px;">
        <div class="text-caption text-slate-500 font-bold" style="font-size: 11px;">Subtotal por cuenta</div>
        <div class="row items-center justify-between" style="font-size: 11.5px;">
          <span class="row items-center text-slate-600">
            <span class="dot-indicator bg-green-5 q-mr-xs"></span> Efectivo
          </span>
          <span class="text-weight-bold text-slate-800">{{ formatCOP(subtotales.Efectivo) }}</span>
        </div>
        <div class="row items-center justify-between" style="font-size: 11.5px;">
          <span class="row items-center text-slate-600">
            <span class="dot-indicator bg-purple-5 q-mr-xs"></span> Nequi
          </span>
          <span class="text-weight-bold text-slate-800">{{ formatCOP(subtotales.Nequi) }}</span>
        </div>
        <div class="row items-center justify-between" style="font-size: 11.5px;">
          <span class="row items-center text-slate-600">
            <span class="dot-indicator bg-amber-6 q-mr-xs"></span> Bancolombia
          </span>
          <span class="text-weight-bold text-slate-800">{{ formatCOP(subtotales.Bancolombia) }}</span>
        </div>
      </div>

      <!-- Tarjeta Morada Total Gastos + Botón Ver Historial -->
      <div class="column q-gutter-y-xs" style="width: 140px;">
        <div class="purple-total-box text-center q-pa-sm">
          <div class="text-caption text-purple-8 font-medium" style="font-size: 10.5px;">Total gastos del día</div>
          <div class="text-weight-bolder text-purple-9 text-subtitle1" style="line-height: 1.1;">
            {{ formatCOP(totalGastos) }}
          </div>
        </div>

        <q-btn
          unelevated no-caps
          color="primary"
          label="Ver historial"
          class="full-width text-weight-bold"
          style="border-radius: 8px; font-size: 12px; height: 32px;"
          @click="$router.push('/historial')"
        />
      </div>

    </div>

  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  gastos: { type: Array, default: () => [] }
})

const totalGastos = computed(() =>
  props.gastos.reduce((s, m) => s + (m.monto || 0), 0)
)

const subtotales = computed(() => {
  const map = { Efectivo: 0, Nequi: 0, Bancolombia: 0 }
  props.gastos.forEach(m => {
    if (map[m.cuenta] !== undefined) map[m.cuenta] += (m.monto || 0)
  })
  return map
})

const formatCOP = (val) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(val ?? 0)

const formatHora = (fechaStr) => {
  if (!fechaStr) return '12:00'
  try {
    const d = new Date(fechaStr)
    return d.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })
  } catch (e) {
    return '12:00'
  }
}

const iconoGasto = (categoria) => {
  const cat = String(categoria || '').toLowerCase()
  if (cat.includes('verdur') || cat.includes('fruta')) return 'shopping_basket'
  if (cat.includes('servicio') || cat.includes('publico')) return 'receipt'
  if (cat.includes('empaque') || cat.includes('caja')) return 'inventory_2'
  if (cat.includes('transporte') || cat.includes('flete')) return 'directions_bus'
  if (cat.includes('gas') || cat.includes('energia')) return 'local_fire_department'
  return 'shopping_cart'
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

.dot-indicator {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  display: inline-block;
}

.purple-total-box {
  background: #f5f3ff;
  border: 1px solid #ede9fe;
  border-radius: 12px;
}

.text-truncate {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
