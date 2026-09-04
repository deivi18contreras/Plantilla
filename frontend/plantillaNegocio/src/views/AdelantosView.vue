<template>
  <div class="row justify-center q-pa-md">
    <div class="card-widget" style="max-width: 720px; width: 100%;">

      <!-- Encabezado -->
      <div class="row items-center justify-between q-mb-lg">
        <div>
          <div class="text-h5 text-weight-bolder text-slate-900">Adelantos Internos</div>
          <div class="text-caption text-slate-500">Préstamos internos del negocio a sí mismo</div>
        </div>
        <q-btn
          v-if="authStore.isAdmin"
          color="primary"
          icon="add"
          label="Nuevo adelanto"
          no-caps
          class="text-weight-bold"
          style="border-radius: 12px;"
          @click="modalNuevo = true"
        />
      </div>

      <!-- Resumen total pendiente -->
      <div
        v-if="adelantosStore.totalPendiente > 0"
        class="q-pa-md q-mb-md"
        style="background: #fef2f2; border: 1px solid #fca5a5; border-radius: 16px;"
      >
        <div class="text-caption text-weight-bold text-red-7 q-mb-xs">💸 Total pendiente por recuperar</div>
        <div class="text-h5 text-weight-bolder text-red-7">{{ formatCOP(adelantosStore.totalPendiente) }}</div>
        <div class="text-caption text-red-6">Se irá descontando automáticamente en cada cierre de caja</div>
      </div>

      <div
        v-else-if="!adelantosStore.loading"
        class="q-pa-md q-mb-md text-center"
        style="background: #f0fdf4; border: 1px solid #86efac; border-radius: 16px;"
      >
        <div class="text-subtitle2 text-weight-bold text-green-7">✅ Sin adelantos pendientes</div>
        <div class="text-caption text-green-6">El negocio está al día</div>
      </div>

      <!-- Pestañas -->
      <div class="row q-col-gutter-sm q-mb-lg">
        <div class="col-6">
          <div
            class="pill-option text-center cursor-pointer"
            :class="{ active: tab === 'pendientes' }"
            @click="tab = 'pendientes'"
          >
            <span class="text-weight-bold">⏳ Pendientes ({{ adelantosStore.pendientes.length }})</span>
          </div>
        </div>
        <div class="col-6">
          <div
            class="pill-option text-center cursor-pointer"
            :class="{ active: tab === 'todos' }"
            @click="cargarTodos"
          >
            <span class="text-weight-bold">📋 Historial completo</span>
          </div>
        </div>
      </div>

      <!-- Lista de pendientes -->
      <template v-if="tab === 'pendientes'">
        <q-item v-if="adelantosStore.loading" class="justify-center q-py-lg">
          <q-spinner color="primary" size="28px" />
        </q-item>
        <q-item v-else-if="adelantosStore.pendientes.length === 0" class="text-center text-slate-400 q-py-xl">
          <q-item-section>Sin adelantos pendientes</q-item-section>
        </q-item>

        <q-list separator v-else>
          <q-item v-for="a in adelantosStore.pendientes" :key="a._id" class="q-px-none q-py-md">
            <q-item-section avatar style="min-width: 36px;">
              <q-icon name="arrow_upward" color="red-6" size="26px" />
            </q-item-section>
            <q-item-section>
              <div class="text-weight-bold text-slate-900">{{ a.motivo || 'Sin motivo especificado' }}</div>
              <div class="text-caption text-slate-500">
                Fecha: {{ formatFecha(a.fecha) }}
                · Recuperado: {{ formatCOP(a.montoRecuperado) }}
              </div>
            </q-item-section>
            <q-item-section side>
              <div class="text-right">
                <div class="text-caption text-slate-500">Total: {{ formatCOP(a.monto) }}</div>
                <div class="text-weight-bolder text-red-6">Pendiente: {{ formatCOP(a.saldoPendiente) }}</div>
              </div>
            </q-item-section>
          </q-item>
        </q-list>
      </template>

      <!-- Lista de todos -->
      <template v-else>
        <q-item v-if="adelantosStore.loading" class="justify-center q-py-lg">
          <q-spinner color="primary" size="28px" />
        </q-item>

        <q-list separator v-else>
          <q-item v-for="a in adelantosStore.todos" :key="a._id" class="q-px-none q-py-md">
            <q-item-section avatar style="min-width: 36px;">
              <q-icon
                :name="a.estado === 'recuperado' ? 'check_circle' : 'arrow_upward'"
                :color="a.estado === 'recuperado' ? 'positive' : 'red-6'"
                size="26px"
              />
            </q-item-section>
            <q-item-section>
              <div class="text-weight-bold text-slate-900">{{ a.motivo || 'Sin motivo' }}</div>
              <div class="text-caption text-slate-500">{{ formatFecha(a.fecha) }}</div>
            </q-item-section>
            <q-item-section side>
              <div class="text-right">
                <div class="text-weight-bolder" :class="a.estado === 'recuperado' ? 'text-green-7' : 'text-red-6'">
                  {{ formatCOP(a.monto) }}
                </div>
                <q-badge :color="a.estado === 'recuperado' ? 'positive' : 'warning'" :label="a.estado" />
              </div>
            </q-item-section>
          </q-item>
        </q-list>
      </template>

    </div>

    <!-- Modal: registrar nuevo adelanto -->
    <q-dialog v-model="modalNuevo">
      <q-card style="width: 420px; max-width: 90vw; border-radius: 24px;" class="q-pa-md">
        <q-card-section class="row items-center justify-between q-pb-xs">
          <div class="text-h6 text-weight-bolder text-slate-900">Nuevo Adelanto</div>
          <q-btn flat round icon="close" v-close-popup />
        </q-card-section>

        <q-card-section class="column q-gutter-y-md">
          <div>
            <div class="text-caption text-weight-bold text-slate-700 q-mb-xs">Fecha del adelanto</div>
            <q-input v-model="form.fecha" type="date" borderless class="clean-input" />
          </div>
          <div>
            <div class="text-caption text-weight-bold text-slate-700 q-mb-xs">Monto</div>
            <q-input v-model="form.monto" type="number" prefix="$" placeholder="0" borderless class="clean-input" />
          </div>
          <div>
            <div class="text-caption text-weight-bold text-slate-700 q-mb-xs">Motivo</div>
            <q-input v-model="form.motivo" placeholder="Ej. Pedido proveedor de carne" borderless class="clean-input" />
          </div>
        </q-card-section>

        <q-card-actions class="justify-end q-pt-md">
          <q-btn
            color="primary"
            label="Guardar adelanto"
            no-caps
            class="text-weight-bold"
            style="border-radius: 12px; padding: 8px 20px;"
            :loading="guardando"
            @click="guardarAdelanto"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useAdelantosStore } from '@/store/adelantosStore'
import { useAuthStore } from '@/store/authStore'
import { useQuasar } from 'quasar'
import { getFechaLocalHoy } from '@/utils/dateUtils'

const $q = useQuasar()
const adelantosStore = useAdelantosStore()
const authStore = useAuthStore()

const tab = ref('pendientes')
const modalNuevo = ref(false)
const guardando = ref(false)
const form = ref({ fecha: getFechaLocalHoy(), monto: '', motivo: '' })

const formatCOP = (val) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(val ?? 0)

const formatFecha = (fechaStr) => {
  if (!fechaStr) return ''
  return new Date(fechaStr).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' })
}

const cargarTodos = async () => {
  tab.value = 'todos'
  await adelantosStore.fetchTodos()
}

const guardarAdelanto = async () => {
  if (!form.value.fecha || !form.value.monto) {
    $q.notify({ type: 'warning', message: '⚠️ La fecha y el monto son obligatorios' })
    return
  }
  guardando.value = true
  try {
    await adelantosStore.registrarAdelanto({
      fecha: form.value.fecha,
      monto: Number(form.value.monto),
      motivo: form.value.motivo
    })
    $q.notify({ type: 'positive', message: '✅ Adelanto registrado correctamente' })
    modalNuevo.value = false
    form.value = { fecha: getFechaLocalHoy(), monto: '', motivo: '' }
  } catch (error) {
    $q.notify({ type: 'negative', message: error.response?.data?.mensaje || '❌ Error al guardar' })
  } finally {
    guardando.value = false
  }
}

onMounted(() => adelantosStore.fetchPendientes())
</script>
