<template>
  <div class="row justify-center q-pa-md">
    <div class="card-widget" style="max-width: 480px; width: 100%;">

      <div class="text-h5 text-weight-bolder text-slate-900 q-mb-lg">Nuevo Gasto</div>

      <q-form @submit="handleSubmit" class="column q-gutter-y-md">

        <!-- Fecha -->
        <div>
          <div class="text-caption text-weight-bold text-slate-700 q-mb-xs">Fecha</div>
          <q-input
            v-model="form.fecha"
            type="date"
            borderless
            class="clean-input"
            :rules="[val => !!val || 'La fecha es obligatoria']"
          />
        </div>

        <!-- Monto -->
        <div>
          <div class="text-caption text-weight-bold text-slate-700 q-mb-xs">Monto</div>
          <q-input
            v-model="form.monto"
            type="number"
            placeholder="Monto"
            borderless
            class="clean-input"
            :rules="[val => !!val && val > 0 || 'Ingresa un monto']"
          />
        </div>

        <!-- Categoría -->
        <div>
          <div class="text-caption text-weight-bold text-slate-700 q-mb-sm">Categoría</div>
          <SelectorCategorias v-model="form.categoria" :categorias="configStore.categoriasActivas" />
        </div>

        <!-- Descripción -->
        <div>
          <div class="text-caption text-weight-bold text-slate-700 q-mb-xs">Descripción</div>
          <q-input
            v-model="form.descripcion"
            placeholder="Ej: Pollo proveedor Luis"
            borderless
            class="clean-input"
          />
        </div>

        <!-- Método de pago -->
        <div>
          <div class="text-caption text-weight-bold text-slate-700 q-mb-sm">Método de pago</div>
          <div class="row q-gutter-sm">
            <div
              v-for="cuenta in cuentas"
              :key="cuenta"
              class="categoria-chip col-auto"
              :class="{ active: form.cuenta === cuenta }"
              @click="form.cuenta = cuenta"
            >
              <span>{{ cuenta }}</span>
            </div>
          </div>
        </div>

        <div class="q-mt-lg">
          <q-btn
            type="submit"
            color="primary"
            size="lg"
            class="full-width text-weight-bold shadow-md"
            style="border-radius: 16px;"
            :loading="loading"
            label="Guardar Gasto"
          />
        </div>

      </q-form>

    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { postData } from '@/services/apiService'
import { useCuentasStore } from '@/store/cuentasStore'
import { useConfiguracionStore } from '@/store/configuracionStore'
import { useRouter } from 'vue-router'
import SelectorCategorias from '@/components/SelectorCategorias.vue'
import { getFechaLocalHoy } from '@/utils/dateUtils'

const $q = useQuasar()
const router = useRouter()
const cuentasStore = useCuentasStore()
const configStore = useConfiguracionStore()

const cuentas = ['Nequi', 'Bancolombia', 'Efectivo']
const loading = ref(false)

const form = ref({
  monto: null,
  cuenta: 'Efectivo',
  categoria: '',
  descripcion: '',
  fecha: getFechaLocalHoy()
})

const handleSubmit = async () => {
  if (!form.value.cuenta) return

  loading.value = true
  try {
    const res = await postData('/movimientos/gasto', {
      monto: Number(form.value.monto),
      cuenta: form.value.cuenta,
      categoria: form.value.categoria,
      descripcion: form.value.descripcion,
      fecha: form.value.fecha
    })
    $q.notify({ type: 'positive', message: '✅ Gasto registrado con éxito' })
    if (res?.advertencia) {
      $q.notify({ type: 'warning', message: res.advertencia, timeout: 4000 })
    }
    await cuentasStore.fetchCuentas()
    router.push('/')
  } catch (error) {
    $q.notify({ type: 'negative', message: error.response?.data?.mensaje || '❌ Error al guardar gasto' })
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  await configStore.fetchConfiguracion()
  // Preseleccionar la primera categoría activa
  if (configStore.categoriasActivas.length > 0 && !form.value.categoria) {
    form.value.categoria = configStore.categoriasActivas[0].nombre
  }
  await cuentasStore.fetchCuentas()
})
</script>

<style scoped>
.chips-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
}
@media (min-width: 480px) {
  .chips-grid { grid-template-columns: repeat(3, 1fr); }
}
@media (min-width: 768px) {
  .chips-grid { grid-template-columns: repeat(4, 1fr); }
}
</style>
