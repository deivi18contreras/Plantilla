<template>
  <div class="row justify-center q-pa-md">
    <div class="card-widget" style="max-width: 720px; width: 100%;">

      <!-- Encabezado -->
      <div class="row items-center justify-between q-mb-lg">
        <div>
          <div class="text-h5 text-weight-bolder text-slate-900">Gastos Fijos</div>
          <div class="text-caption text-slate-500">Pagos recurrentes del negocio (arriendo, internet, sueldos...)</div>
        </div>
        <q-btn
          v-if="authStore.isAdmin"
          color="primary"
          icon="add"
          label="Agregar"
          no-caps
          class="text-weight-bold"
          style="border-radius: 12px;"
          @click="abrirModalCrear"
        />
      </div>

      <!-- Loading -->
      <div v-if="gastosFijosStore.loading" class="column items-center q-py-xl">
        <q-spinner color="primary" size="32px" />
      </div>

      <!-- Vacío -->
      <div v-else-if="gastosFijosStore.gastosFijos.length === 0" class="text-center text-slate-400 q-py-xl">
        <q-icon name="event_note" size="48px" color="blue-2" />
        <div class="q-mt-sm text-subtitle2 text-slate-500">No hay gastos fijos configurados</div>
        <div class="text-caption">Agrega el arriendo, internet, sueldos, etc.</div>
      </div>

      <!-- Lista de gastos fijos -->
      <q-list separator v-else>
        <q-item
          v-for="gf in gastosFijosStore.gastosFijos"
          :key="gf._id"
          class="q-px-none q-py-md"
        >
          <q-item-section avatar style="min-width: 36px;">
            <q-icon :name="iconoPeriodo(gf.periodicidad)" color="primary" size="26px" />
          </q-item-section>

          <q-item-section>
            <div class="row items-center q-gutter-x-xs">
              <span class="text-weight-bold text-slate-900 text-subtitle1">{{ gf.nombre }}</span>
              <q-badge :color="colorPeriodo(gf.periodicidad)" :label="gf.periodicidad" class="text-weight-bold" />
            </div>
            <div class="text-caption text-slate-500">
              Cuenta: <span class="text-weight-bold text-slate-700">{{ gf.cuentaPago }}</span>
              · Próximo: <span :class="estaVencido(gf.proximoVencimiento) ? 'text-red-6 text-weight-bold' : 'text-slate-700'">
                {{ formatFecha(gf.proximoVencimiento) }}
                <span v-if="estaVencido(gf.proximoVencimiento)">⚠️ VENCIDO</span>
              </span>
            </div>
          </q-item-section>

          <q-item-section side>
            <div class="column items-end q-gutter-y-xs">
              <span class="text-weight-bolder text-subtitle1 text-slate-900">{{ formatCOP(gf.monto) }}</span>
              <div class="row q-gutter-x-xs">
                <q-btn
                  flat dense no-caps
                  color="positive"
                  label="Pagar"
                  icon="check"
                  style="border-radius: 8px; font-size: 11px;"
                  @click="confirmarPago(gf)"
                />
                <q-btn
                  v-if="authStore.isAdmin"
                  flat dense round
                  icon="edit"
                  color="blue-6"
                  size="sm"
                  @click="abrirModalEditar(gf)"
                />
              </div>
            </div>
          </q-item-section>
        </q-item>
      </q-list>

    </div>

    <!-- Modal crear / editar -->
    <q-dialog v-model="modalForm">
      <q-card style="width: 460px; max-width: 90vw; border-radius: 24px;" class="q-pa-md">
        <q-card-section class="row items-center justify-between q-pb-xs">
          <div class="text-h6 text-weight-bolder text-slate-900">
            {{ editando ? 'Editar Gasto Fijo' : 'Nuevo Gasto Fijo' }}
          </div>
          <q-btn flat round icon="close" v-close-popup />
        </q-card-section>

        <q-card-section class="column q-gutter-y-md">
          <div>
            <div class="text-caption text-weight-bold text-slate-700 q-mb-xs">Nombre</div>
            <q-input v-model="form.nombre" placeholder="Ej. Arriendo" borderless class="clean-input" />
          </div>
          <div>
            <div class="text-caption text-weight-bold text-slate-700 q-mb-xs">Monto</div>
            <q-input v-model="form.monto" type="number" prefix="$" placeholder="0" borderless class="clean-input" />
          </div>
          <div>
            <div class="text-caption text-weight-bold text-slate-700 q-mb-xs">Periodicidad</div>
            <div class="row q-col-gutter-xs">
              <div v-for="p in periodos" :key="p" class="col-6">
                <div
                  class="pill-option text-center cursor-pointer"
                  :class="{ active: form.periodicidad === p }"
                  @click="form.periodicidad = p"
                >
                  <span style="font-size: 13px;">{{ p }}</span>
                </div>
              </div>
            </div>
          </div>
          <div>
            <div class="text-caption text-weight-bold text-slate-700 q-mb-xs">Cuenta de pago</div>
            <div class="row q-col-gutter-xs">
              <div v-for="c in cuentas" :key="c" class="col-4">
                <div
                  class="pill-option text-center cursor-pointer"
                  :class="{ active: form.cuentaPago === c }"
                  @click="form.cuentaPago = c"
                >
                  <span style="font-size: 13px;">{{ c }}</span>
                </div>
              </div>
            </div>
          </div>
          <div>
            <div class="text-caption text-weight-bold text-slate-700 q-mb-xs">Próximo vencimiento</div>
            <q-input v-model="form.proximoVencimiento" type="date" borderless class="clean-input" />
          </div>
        </q-card-section>

        <q-card-actions class="justify-end q-pt-md">
          <q-btn
            color="primary"
            :label="editando ? 'Guardar cambios' : 'Crear gasto fijo'"
            no-caps
            class="text-weight-bold"
            style="border-radius: 12px; padding: 8px 20px;"
            :loading="guardando"
            @click="guardar"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useGastosFijosStore } from '@/store/gastosFijosStore'
import { useAuthStore } from '@/store/authStore'
import { useQuasar } from 'quasar'
import { getFechaLocalHoy } from '@/utils/dateUtils'

const $q = useQuasar()
const gastosFijosStore = useGastosFijosStore()
const authStore = useAuthStore()

const periodos = ['diario', 'quincenal', 'mensual', 'bimestral']
const cuentas = ['Efectivo', 'Nequi', 'Bancolombia']

const modalForm = ref(false)
const editando = ref(false)
const editandoId = ref(null)
const guardando = ref(false)

const form = ref({
  nombre: '',
  monto: '',
  periodicidad: 'mensual',
  cuentaPago: 'Efectivo',
  proximoVencimiento: getFechaLocalHoy()
})

const formatCOP = (val) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(val ?? 0)

const formatFecha = (fechaStr) => {
  if (!fechaStr) return ''
  return new Date(fechaStr).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' })
}

const estaVencido = (fechaStr) => {
  if (!fechaStr) return false
  return new Date(fechaStr) < new Date()
}

const iconoPeriodo = (p) => {
  const map = { diario: 'today', quincenal: 'date_range', mensual: 'calendar_month', bimestral: 'event_repeat' }
  return map[p] || 'event'
}

const colorPeriodo = (p) => {
  const map = { diario: 'orange-7', quincenal: 'blue-7', mensual: 'purple-7', bimestral: 'teal-7' }
  return map[p] || 'grey'
}

const abrirModalCrear = () => {
  editando.value = false
  editandoId.value = null
  form.value = { nombre: '', monto: '', periodicidad: 'mensual', cuentaPago: 'Efectivo', proximoVencimiento: getFechaLocalHoy() }
  modalForm.value = true
}

const abrirModalEditar = (gf) => {
  editando.value = true
  editandoId.value = gf._id
  form.value = {
    nombre: gf.nombre,
    monto: gf.monto,
    periodicidad: gf.periodicidad,
    cuentaPago: gf.cuentaPago,
    proximoVencimiento: gf.proximoVencimiento ? gf.proximoVencimiento.split('T')[0] : getFechaLocalHoy()
  }
  modalForm.value = true
}

const guardar = async () => {
  if (!form.value.nombre || !form.value.monto || !form.value.proximoVencimiento) {
    $q.notify({ type: 'warning', message: '⚠️ Nombre, monto y vencimiento son obligatorios' })
    return
  }
  guardando.value = true
  try {
    if (editando.value) {
      await gastosFijosStore.editarGastoFijo(editandoId.value, form.value)
      $q.notify({ type: 'positive', message: '✅ Gasto fijo actualizado' })
    } else {
      await gastosFijosStore.crearGastoFijo(form.value)
      $q.notify({ type: 'positive', message: '✅ Gasto fijo creado' })
    }
    modalForm.value = false
  } catch (error) {
    $q.notify({ type: 'negative', message: error.response?.data?.mensaje || '❌ Error al guardar' })
  } finally {
    guardando.value = false
  }
}

const confirmarPago = (gf) => {
  $q.dialog({
    title: `Confirmar pago: ${gf.nombre}`,
    message: `¿Confirmas el pago de ${formatCOP(gf.monto)} desde ${gf.cuentaPago}? Se registrará como gasto hoy.`,
    cancel: true,
    persistent: true
  }).onOk(async () => {
    try {
      const res = await gastosFijosStore.confirmarPago(gf._id)
      $q.notify({ type: 'positive', message: `✅ Pago confirmado. Próximo: ${formatFecha(res.proximoVencimiento)}` })
    } catch (error) {
      $q.notify({ type: 'negative', message: error.response?.data?.mensaje || '❌ Error al confirmar pago' })
    }
  })
}

onMounted(() => gastosFijosStore.fetchGastosFijos())
</script>
