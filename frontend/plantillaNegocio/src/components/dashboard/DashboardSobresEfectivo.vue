<template>
  <div class="bg-white q-pa-md shadow-1" style="border-radius: 20px; border: 1px solid #e2e8f0;">
    <div class="row items-center justify-between q-mb-md">
      <div class="row items-center q-gutter-x-sm">
        <q-avatar size="36px" color="orange-1" text-color="orange-9" icon="folder_open" class="text-weight-bold" />
        <div>
          <div class="text-subtitle1 text-weight-bolder text-slate-900">Sobres de Efectivo</div>
          <div class="text-caption text-slate-500">Dinero físico disponible de días anteriores</div>
        </div>
      </div>
      <div class="text-right">
        <div class="text-caption text-slate-500 font-medium">Total en sobres:</div>
        <div class="text-h6 text-weight-bolder text-green-7">{{ formatCOP(remanentesStore.totalDisponibleEnSobres) }}</div>
      </div>
    </div>

    <!-- Lista de sobres -->
    <div v-if="remanentesStore.loading" class="row justify-center q-py-md">
      <q-spinner color="orange-8" size="24px" />
    </div>

    <div v-else-if="remanentesStore.disponibles.length === 0" class="text-center q-py-md text-slate-400">
      <q-icon name="inventory_2" size="32px" color="grey-4" />
      <div class="text-caption q-mt-xs font-medium">No hay sobres con saldo en este momento</div>
    </div>

    <div v-else class="row q-col-gutter-sm">
      <div
        v-for="sobre in remanentesStore.disponibles"
        :key="sobre._id"
        class="col-12 col-sm-6 col-md-3"
      >
        <div
          class="q-pa-sm rounded-borders full-height column justify-between"
          style="border: 1px solid #fed7aa; background: #fffbf5; border-radius: 12px; min-height: 60px;"
        >
          <div class="row items-center justify-between">
            <div class="row items-center q-gutter-x-xs">
              <q-badge color="orange-2" text-color="orange-9" class="text-weight-bold q-px-xs">
                {{ formatFechaCorta(sobre.fecha) }}
              </q-badge>
              <span class="text-caption text-slate-600" style="font-size: 11px;">
                (Ini: {{ formatCOP(sobre.montoInicial) }})
              </span>
            </div>
            <span class="text-subtitle2 text-weight-bolder text-green-7">
              {{ formatCOP(sobre.saldoDisponible) }}
            </span>
          </div>

          <div v-if="sobre.montoGastado > 0" class="row items-center justify-between q-mt-xs text-caption text-orange-8" style="font-size: 11px;">
            <span>Usado: -{{ formatCOP(sobre.montoGastado) }}</span>
            <span v-if="sobre.usos && sobre.usos.length > 0" class="text-slate-500 italic ellipsis" style="max-width: 120px;" :title="sobre.usos[sobre.usos.length - 1].motivo">
              {{ sobre.usos[sobre.usos.length - 1].motivo }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useRemanentesStore } from '@/store/remanentesStore'
import { formatFechaCorta } from '@/utils/dateUtils'

const remanentesStore = useRemanentesStore()

const formatCOP = (val) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(val ?? 0)

onMounted(() => {
  remanentesStore.fetchDisponibles()
})
</script>
