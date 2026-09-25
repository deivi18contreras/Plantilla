<template>
  <div class="bg-white q-pa-md shadow-1" style="border-radius: 20px; border: 1px solid #e2e8f0;">
    <div class="row items-center justify-between q-mb-md" style="flex-wrap: wrap; gap: 8px;">
      <div class="row items-center q-gutter-x-sm">
        <q-avatar size="36px" color="orange-1" text-color="orange-9" icon="folder_open" class="text-weight-bold" />
        <div>
          <div class="text-subtitle1 text-weight-bolder text-slate-900">Sobres de Efectivo</div>
          <div class="text-caption text-slate-500">Dinero físico disponible de días anteriores</div>
        </div>
      </div>
      <div class="row items-center q-gutter-x-md" style="flex-wrap: wrap; gap: 8px;">
        <!-- Botón Juntar Dinero -->
        <q-btn
          v-if="remanentesStore.disponibles.length > 0"
          dense
          unelevated
          color="orange-9"
          text-color="white"
          icon="inventory"
          label="Juntar dinero"
          class="q-px-sm text-weight-bold"
          style="border-radius: 8px; font-size: 12px;"
          @click="abrirModalConsolidar"
        />
        <div class="text-right">
          <div class="text-caption text-slate-500 font-medium">Total en sobres:</div>
          <div class="text-h6 text-weight-bolder text-green-7">{{ formatCOP(remanentesStore.totalDisponibleEnSobres) }}</div>
        </div>
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
          :style="sobre.esConsolidado
            ? 'border: 1.5px solid #93c5fd; background: #f0f7ff; border-radius: 12px; min-height: 60px;'
            : 'border: 1px solid #fed7aa; background: #fffbf5; border-radius: 12px; min-height: 60px;'"
        >
          <div class="row items-center justify-between">
            <div class="row items-center q-gutter-x-xs">
              <q-badge
                :color="sobre.esConsolidado ? 'blue-8' : 'orange-2'"
                :text-color="sobre.esConsolidado ? 'white' : 'orange-9'"
                class="text-weight-bold q-px-xs"
              >
                <q-icon v-if="sobre.esConsolidado" name="inventory" size="12px" class="q-mr-xs" />
                {{ sobre.esConsolidado ? 'Consolidado ' + formatFechaCorta(sobre.fecha) : formatFechaCorta(sobre.fecha) }}
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

    <!-- MODAL JUNTAR DINERO EN UN SOLO SOBRE -->
    <q-dialog v-model="modalConsolidarAbierto">
      <q-card style="border-radius: 18px; max-width: 440px; width: 95%;">
        <q-card-section class="row items-center justify-between q-pb-none">
          <div class="row items-center q-gutter-x-sm">
            <q-avatar size="32px" color="orange-1" text-color="orange-9" icon="inventory" />
            <div class="text-subtitle1 text-weight-bolder text-slate-900">Juntar todo el dinero</div>
          </div>
          <q-btn flat round dense icon="close" v-close-popup />
        </q-card-section>

        <q-card-section class="q-pt-sm">
          <p class="text-body2 text-slate-600 q-mb-md">
            Se juntarán todos los sobres en <strong>1 solo sobre unificado</strong> con el dinero físico que tienes.
          </p>

          <div class="q-pa-md bg-orange-1 text-orange-10 rounded-borders q-mb-md" style="border: 1px solid #fed7aa; border-radius: 12px;">
            <div class="row items-center justify-between">
              <span class="text-caption font-medium">Total a juntar:</span>
              <span class="text-h6 text-weight-bolder text-green-8">
                {{ formatCOP(cuentasStore.saldoPor('Efectivo')) }}
              </span>
            </div>
            <div class="text-caption text-slate-500 q-mt-xs" style="font-size: 11px;">
              Basado en el saldo físico actual de tu cuenta Efectivo.
            </div>
          </div>

          <div class="q-mb-sm">
            <div class="text-caption text-weight-bold text-slate-700 q-mb-xs">Fecha de consolidación:</div>
            <q-input
              v-model="fechaConsolidacion"
              type="date"
              dense
              outlined
              class="bg-white"
            />
          </div>

          <div>
            <div class="text-caption text-weight-bold text-slate-700 q-mb-xs">Nota u observación (opcional):</div>
            <q-input
              v-model="observacionConsolidacion"
              type="text"
              placeholder="Ej: Unificación de paquetes quincena"
              dense
              outlined
              class="bg-white"
            />
          </div>
        </q-card-section>

        <q-card-actions align="right" class="q-pa-md">
          <q-btn flat label="Cancelar" color="grey-7" v-close-popup />
          <q-btn
            unelevated
            label="Confirmar y Juntar"
            color="orange-9"
            text-color="white"
            icon="check"
            :loading="guardandoConsolidacion"
            @click="ejecutarConsolidacion"
            class="text-weight-bold q-px-md"
            style="border-radius: 10px;"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { useRemanentesStore } from '@/store/remanentesStore'
import { useCuentasStore } from '@/store/cuentasStore'
import { formatFechaCorta, getFechaLocalHoy } from '@/utils/dateUtils'


const $q = useQuasar()
const remanentesStore = useRemanentesStore()
const cuentasStore = useCuentasStore()

const modalConsolidarAbierto = ref(false)
const fechaConsolidacion = ref('')
const observacionConsolidacion = ref('')
const guardandoConsolidacion = ref(false)

const formatCOP = (val) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(val ?? 0)

const abrirModalConsolidar = () => {
  fechaConsolidacion.value = getFechaLocalHoy()
  observacionConsolidacion.value = ''
  modalConsolidarAbierto.value = true
}

const ejecutarConsolidacion = async () => {
  guardandoConsolidacion.value = true
  try {
    const totalEfectivo = cuentasStore.saldoPor('Efectivo')
    await remanentesStore.consolidarSobres({
      fecha: fechaConsolidacion.value,
      monto: totalEfectivo,
      observacion: observacionConsolidacion.value || `Unificación de sobres al ${fechaConsolidacion.value}`
    })

    await Promise.all([
      remanentesStore.fetchDisponibles(),
      cuentasStore.fetchCuentas()
    ])

    modalConsolidarAbierto.value = false
    $q.notify({
      type: 'positive',
      message: '✅ Dinero unificado en 1 solo sobre con éxito'
    })
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: error.response?.data?.mensaje || '❌ Error al unificar sobres'
    })
  } finally {
    guardandoConsolidacion.value = false
  }
}

onMounted(() => {
  remanentesStore.fetchDisponibles()
})
</script>
