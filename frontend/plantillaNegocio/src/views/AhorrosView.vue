<template>
  <div class="row justify-center q-pa-md">
    <div class="card-widget" style="max-width: 720px; width: 100%;">

      <!-- Encabezado -->
      <div class="row items-center justify-between q-mb-lg">
        <div>
          <div class="text-h5 text-weight-bolder text-slate-900">💰 Mis Ahorros</div>
          <div class="text-caption text-slate-500">Historial de lo guardado al cerrar cada mes</div>
        </div>
      </div>

      <!-- Total acumulado de todos los meses -->
      <div class="q-pa-md q-mb-lg" style="background: linear-gradient(135deg, #1e40af, #3b82f6); border-radius: 20px;">
        <div class="text-caption text-blue-2 text-weight-bold q-mb-xs">🏦 Total acumulado (todos los meses)</div>
        <div class="text-h4 text-weight-bolder text-white">{{ formatCOP(ahorrosStore.totalAcumulado) }}</div>
        <div class="text-caption text-blue-2 q-mt-xs">{{ ahorrosStore.ahorros.length }} mes(es) registrado(s)</div>
      </div>

      <!-- Loading -->
      <div v-if="ahorrosStore.loading" class="column items-center q-py-xl">
        <q-spinner color="primary" size="32px" />
      </div>

      <!-- Sin ahorros -->
      <div v-else-if="ahorrosStore.ahorros.length === 0" class="text-center q-py-xl">
        <q-icon name="savings" size="52px" color="blue-2" />
        <div class="text-subtitle2 text-slate-500 q-mt-sm">Aún no hay ahorros registrados</div>
        <div class="text-caption text-slate-400">
          El primer ahorro se registrará automáticamente cuando hagas el cierre del último día del mes.
        </div>
      </div>

      <!-- Historial por mes -->
      <div v-else class="column q-gutter-y-md">
        <div
          v-for="ahorro in ahorrosStore.ahorros"
          :key="ahorro._id"
          class="q-pa-md"
          style="border: 1px solid #e2e8f0; border-radius: 16px;"
        >
          <!-- Cabecera del mes -->
          <div class="row items-center justify-between q-mb-md">
            <div>
              <div class="text-subtitle1 text-weight-bolder text-slate-900">
                {{ formatMes(ahorro.mes) }}
              </div>
              <div class="text-caption text-slate-500">
                Ganancia neta del mes: <span class="text-weight-bold text-green-7">{{ formatCOP(ahorro.gananciaNetaMes) }}</span>
              </div>
            </div>
            <div class="text-h6 text-weight-bolder text-blue-7">
              {{ formatCOP(ahorro.total) }}
            </div>
          </div>

          <!-- Desglose por cuenta -->
          <div class="row q-col-gutter-sm q-mb-sm">
            <div class="col-4">
              <div class="q-pa-sm text-center" style="background: #f0fdf4; border-radius: 10px;">
                <div class="text-caption text-green-7">💵 Efectivo</div>
                <div class="text-caption text-weight-bolder text-slate-800">{{ formatCOP(ahorro.efectivo) }}</div>
              </div>
            </div>
            <div class="col-4">
              <div class="q-pa-sm text-center" style="background: #faf5ff; border-radius: 10px;">
                <div class="text-caption text-purple-7">📱 Nequi</div>
                <div class="text-caption text-weight-bolder text-slate-800">{{ formatCOP(ahorro.nequi) }}</div>
              </div>
            </div>
            <div class="col-4">
              <div class="q-pa-sm text-center" style="background: #fffbeb; border-radius: 10px;">
                <div class="text-caption text-amber-7">🏦 Bancolombia</div>
                <div class="text-caption text-weight-bolder text-slate-800">{{ formatCOP(ahorro.bancolombia) }}</div>
              </div>
            </div>
          </div>

          <!-- Notas -->
          <div class="row items-center q-gutter-x-sm">
            <q-icon name="notes" size="16px" color="slate-400" />
            <span
              v-if="!editandoNota[ahorro._id]"
              class="text-caption text-slate-500 cursor-pointer"
              @click="editandoNota[ahorro._id] = true; notaTemp[ahorro._id] = ahorro.notas"
            >
              {{ ahorro.notas || 'Agregar nota...' }}
              <q-icon name="edit" size="12px" color="blue-4" class="q-ml-xs" />
            </span>
            <div v-else class="row items-center q-gutter-x-xs full-width">
              <q-input
                v-model="notaTemp[ahorro._id]"
                dense borderless
                placeholder="Ej: Muy buen mes, pagé el arriendo adelantado"
                class="clean-input col"
                style="font-size: 12px;"
                @keyup.enter="guardarNota(ahorro)"
              />
              <q-btn flat dense icon="check" color="positive" size="sm" @click="guardarNota(ahorro)" />
              <q-btn flat dense icon="close" color="negative" size="sm" @click="editandoNota[ahorro._id] = false" />
            </div>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, reactive } from 'vue'
import { useAhorrosStore } from '@/store/ahorrosStore'
import { useQuasar } from 'quasar'

const $q = useQuasar()
const ahorrosStore = useAhorrosStore()

const editandoNota = reactive({})
const notaTemp = reactive({})

const formatCOP = (val) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(val ?? 0)

const formatMes = (mesStr) => {
  if (!mesStr) return ''
  const [year, month] = mesStr.split('-').map(Number)
  const fecha = new Date(year, month - 1, 1)
  return fecha.toLocaleDateString('es-CO', { month: 'long', year: 'numeric' })
    .replace(/^\w/, c => c.toUpperCase())
}

const guardarNota = async (ahorro) => {
  try {
    await ahorrosStore.editarNotas(ahorro._id, notaTemp[ahorro._id])
    editandoNota[ahorro._id] = false
    $q.notify({ type: 'positive', message: '✅ Nota guardada' })
  } catch {
    $q.notify({ type: 'negative', message: '❌ Error al guardar nota' })
  }
}

onMounted(() => ahorrosStore.fetchAhorros())
</script>
