<template>
  <q-page class="q-pa-md bg-slate-100">
    <div class="view-container">

      <!-- TARJETA FORMULARIO PROPORCIONADA PARA ESCRITORIO + MOVIL -->
      <div class="form-card">

        <div class="screen-title">Transferir</div>
        <div class="screen-subtitle font-medium text-slate-800">Mover plata entre cuentas</div>

        <q-form @submit="handleSubmit" class="column q-gutter-y-md q-mt-sm">

          <!-- Selector Desde (Horizontal en PC) -->
          <div>
            <div class="text-caption text-weight-bold text-slate-700 q-mb-xs">Desde</div>
            <div class="row q-col-gutter-sm">
              <div
                v-for="cuenta in todasCuentas"
                :key="'desde-'+cuenta"
                class="col-12 col-sm-4"
              >
                <div
                  class="pill-option"
                  :class="{ active: form.cuenta === cuenta }"
                  @click="form.cuenta = cuenta"
                >
                  <span>{{ cuenta }}</span>
                  <q-icon v-if="form.cuenta === cuenta" name="check" size="20px" color="blue-8" />
                </div>
              </div>
            </div>
          </div>

          <!-- Selector Hacia (Horizontal en PC) -->
          <div>
            <div class="text-caption text-weight-bold text-slate-700 q-mb-xs">Hacia</div>
            <div class="row q-col-gutter-sm">
              <div
                v-for="cuenta in todasCuentas"
                :key="'hacia-'+cuenta"
                class="col-12 col-sm-4"
              >
                <div
                  class="pill-option"
                  :class="{ active: form.cuentaDestino === cuenta }"
                  @click="form.cuentaDestino = cuenta"
                >
                  <span>{{ cuenta }}</span>
                  <q-icon v-if="form.cuentaDestino === cuenta" name="check" size="20px" color="blue-8" />
                </div>
              </div>
            </div>
            <div v-if="form.cuenta && form.cuenta === form.cuentaDestino" class="text-caption text-red-6 q-mt-xs">
              La cuenta de destino debe ser diferente a la de origen
            </div>
          </div>

          <!-- Campo Monto -->
          <div>
            <div class="text-caption text-weight-bold text-slate-700 q-mb-xs">Monto</div>
            <q-input
              v-model="form.monto"
              type="number"
              placeholder="$200.000"
              prefix="$"
              borderless
              class="clean-input"
              :rules="[val => !!val && val > 0 || 'Ingresa un monto válido']"
            />
          </div>

          <!-- Botón Confirmar traslado -->
          <div class="q-mt-lg">
            <button
              type="submit"
              class="btn-outline-dark"
              :disabled="loading || form.cuenta === form.cuentaDestino"
            >
              {{ loading ? 'Procesando...' : 'Confirmar traslado' }}
            </button>
          </div>

        </q-form>

      </div>

    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { postData } from '@/services/apiService'
import { useCuentasStore } from '@/store/cuentasStore'
import { useRouter } from 'vue-router'

const $q = useQuasar()
const router = useRouter()
const cuentasStore = useCuentasStore()
const loading = ref(false)

const todasCuentas = ['Efectivo', 'Bancolombia', 'Nequi']

const form = ref({
  cuenta: 'Efectivo',
  cuentaDestino: 'Bancolombia',
  monto: 200000,
  descripcion: 'Traslado entre cuentas',
  fecha: new Date().toISOString().split('T')[0]
})

const handleSubmit = async () => {
  if (form.value.cuenta === form.value.cuentaDestino) return

  loading.value = true
  try {
    await postData('/movimientos/transferencia', {
      monto: Number(form.value.monto),
      cuenta: form.value.cuenta,
      cuentaDestino: form.value.cuentaDestino,
      descripcion: form.value.descripcion,
      fecha: form.value.fecha
    })
    $q.notify({ type: 'positive', message: '✅ Traslado realizado con éxito' })
    await cuentasStore.fetchCuentas()
    router.push('/')
  } catch (error) {
    $q.notify({ type: 'negative', message: error.response?.data?.mensaje || '❌ Error en la transferencia' })
  } finally {
    loading.value = false
  }
}

onMounted(() => cuentasStore.fetchCuentas())
</script>
