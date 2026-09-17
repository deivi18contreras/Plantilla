<template>
  <div class="dashboard-main-card full-width">

    <!-- ENCABEZADO -->
    <div class="row items-center justify-between q-mb-lg">
      <div>
        <div class="text-h5 text-weight-bolder text-slate-900">Gastos</div>
        <div class="text-caption text-slate-500">Registra un gasto individual o importa desde Excel</div>
      </div>
    </div>

    <!-- LAYOUT 2 COLUMNAS -->
    <div class="gasto-grid">

      <!-- COLUMNA IZQUIERDA: Formulario -->
      <div class="card-widget">
        <div class="text-subtitle1 text-weight-bolder text-slate-900 q-mb-md">
          <q-icon name="add_shopping_cart" color="negative" size="22px" class="q-mr-xs" />
          Nuevo Gasto
        </div>

        <q-form @submit="handleSubmit" class="column q-gutter-y-md">

          <!-- Fecha -->
          <div>
            <div class="form-label">Fecha</div>
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
            <div class="form-label">Monto</div>
            <q-input
              v-model="form.monto"
              type="number"
              placeholder="$ 0"
              borderless
              class="clean-input"
              :rules="[val => !!val && val > 0 || 'Ingresa un monto válido']"
            />
          </div>

          <!-- Categoría -->
          <div>
            <div class="form-label">Categoría</div>
            <SelectorCategorias v-model="form.categoria" :categorias="configStore.categoriasActivas" />
          </div>

          <!-- Descripción -->
          <div>
            <div class="form-label">Descripción <span class="text-slate-400">(opcional)</span></div>
            <q-input
              v-model="form.descripcion"
              placeholder="Ej: Pollo proveedor Luis"
              borderless
              class="clean-input"
            />
          </div>

          <!-- Método de pago -->
          <div>
            <div class="form-label">Pagado con</div>
            <div class="row q-gutter-sm q-mt-xs">
              <div
                v-for="cuenta in cuentas"
                :key="cuenta"
                class="cuenta-chip"
                :class="{ 'cuenta-chip--active': form.cuenta === cuenta }"
                @click="form.cuenta = cuenta"
              >
                <q-icon :name="iconoCuenta(cuenta)" size="16px" class="q-mr-xs" />
                {{ cuenta }}
              </div>
            </div>
          </div>

          <!-- Saldo disponible -->
          <div v-if="saldoCuentaSeleccionada !== null" class="row items-center q-gutter-x-xs q-pa-sm" style="background:#f0fdf4; border-radius:10px;">
            <q-icon name="account_balance_wallet" color="green-6" size="16px" />
            <span class="text-caption text-green-8 text-weight-bold">
              Saldo en {{ form.cuenta }}: {{ formatCOP(saldoCuentaSeleccionada) }}
            </span>
          </div>

          <q-btn
            type="submit"
            color="negative"
            size="lg"
            class="full-width text-weight-bold q-mt-sm"
            style="border-radius: 14px;"
            :loading="loading"
            icon="save"
            label="Guardar Gasto"
          />

        </q-form>
      </div>

      <!-- COLUMNA DERECHA -->
      <div class="gasto-right-col">

        <!-- BANNER IMPORTAR EXCEL -->
        <div
          class="cursor-pointer q-pa-lg"
          style="background: linear-gradient(135deg, #0f172a 0%, #1e3a5f 100%); border-radius: 20px;"
          @click="modalImportar = true"
        >
          <div style="font-size: 36px; margin-bottom: 10px;">📥</div>
          <div class="text-white text-weight-bolder q-mb-xs" style="font-size: 18px;">Importar planilla de gastos</div>
          <div class="text-caption q-mb-md" style="color: rgba(255,255,255,0.65); line-height: 1.6;">
            ¿El contratista llenó la planilla en papel? Pásala a Excel y sube todos los gastos de una vez.
          </div>
          <div class="row items-center q-gutter-x-xs" style="color: rgba(255,255,255,0.85);">
            <q-icon name="download" size="14px" />
            <span class="text-caption text-weight-bold">Descargar plantilla → Llenar → Subir</span>
          </div>
          <div class="row items-center justify-between text-caption q-pa-sm q-mt-md" style="background: rgba(255,255,255,0.1); border-radius: 10px; color: white;">
            <span>📋 Fecha</span><span>🏷️ Cat.</span><span>💳 Cuenta</span><span>💰 Monto</span>
          </div>
        </div>

        <!-- ÚLTIMOS GASTOS DEL DÍA -->
        <div class="card-widget">
          <div class="row items-center justify-between q-mb-md">
            <div class="text-subtitle1 text-weight-bold text-slate-900">Últimos gastos de hoy</div>
            <q-btn flat dense no-caps color="primary" label="Ver historial →" style="font-size:11px;" @click="$router.push('/historial')" />
          </div>

          <div v-if="gastosHoy.length === 0" class="text-center text-slate-400 q-py-md">
            <q-icon name="receipt_long" size="32px" color="grey-4" /><br>
            <span style="font-size:13px;">Sin gastos registrados hoy</span>
          </div>

          <div v-else>
            <div
              v-for="m in gastosHoy"
              :key="m._id"
              class="row items-center justify-between q-py-sm"
              style="border-bottom: 1px solid #f1f5f9;"
            >
              <div class="row items-center q-gutter-x-sm">
                <q-avatar size="32px" :color="colorAvatar(m.cuenta)" text-color="white" style="font-size:11px;">
                  {{ (m.cuenta || 'E').charAt(0) }}
                </q-avatar>
                <div>
                  <div class="text-caption text-weight-bold text-slate-800" style="max-width:180px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">
                    {{ m.descripcion || m.categoria || 'Sin descripción' }}
                  </div>
                  <div class="text-caption text-slate-400">{{ m.cuenta }} · {{ m.categoria }}</div>
                </div>
              </div>
              <span class="text-caption text-weight-bolder text-red-6">-{{ formatCOP(m.monto) }}</span>
            </div>

            <div class="row justify-between items-center q-mt-sm q-pt-xs" style="border-top: 2px solid #e2e8f0;">
              <span class="text-caption text-weight-bold text-slate-600">Total gastos hoy:</span>
              <span class="text-subtitle2 text-weight-bolder text-red-6">{{ formatCOP(totalHoy) }}</span>
            </div>
          </div>
        </div>

      </div>
    </div>

    <!-- MODAL IMPORTAR EXCEL -->
    <ModalImportarGastos v-model="modalImportar" @importado="onImportado" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { postData } from '@/services/apiService'
import { useCuentasStore } from '@/store/cuentasStore'
import { useConfiguracionStore } from '@/store/configuracionStore'
import { useMovimientosStore } from '@/store/movimientosStore'
import { useRouter } from 'vue-router'
import SelectorCategorias from '@/components/SelectorCategorias.vue'
import ModalImportarGastos from '@/components/ModalImportarGastos.vue'
import { getFechaLocalHoy } from '@/utils/dateUtils'

const $q = useQuasar()
const router = useRouter()
const cuentasStore = useCuentasStore()
const configStore = useConfiguracionStore()
const movimientosStore = useMovimientosStore()

const cuentas = ['Efectivo', 'Nequi', 'Bancolombia']
const loading = ref(false)
const modalImportar = ref(false)

const form = ref({
  monto: null,
  cuenta: 'Efectivo',
  categoria: '',
  descripcion: '',
  fecha: getFechaLocalHoy()
})

const saldoCuentaSeleccionada = computed(() =>
  cuentasStore.saldoPor(form.value.cuenta) ?? null
)

const gastosHoy = computed(() =>
  (movimientosStore.movimientos || []).filter(m => m.tipo === 'gasto')
)
const totalHoy = computed(() =>
  gastosHoy.value.reduce((s, m) => s + m.monto, 0)
)

const onImportado = async () => {
  await cuentasStore.fetchCuentas()
  $q.notify({ type: 'positive', message: '✅ Gastos importados. Historial actualizado.' })
}

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
    form.value = {
      monto: null,
      cuenta: 'Efectivo',
      categoria: configStore.categoriasActivas[0]?.nombre || '',
      descripcion: '',
      fecha: getFechaLocalHoy()
    }
    await cuentasStore.fetchCuentas()
    await movimientosStore.fetchPorFecha(getFechaLocalHoy())
  } catch (error) {
    $q.notify({ type: 'negative', message: error.response?.data?.mensaje || '❌ Error al guardar gasto' })
  } finally {
    loading.value = false
  }
}

const formatCOP = (val) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(val ?? 0)

const iconoCuenta = (cuenta) => {
  if (cuenta === 'Nequi') return 'phone_android'
  if (cuenta === 'Bancolombia') return 'account_balance'
  return 'payments'
}

const colorAvatar = (cuenta) => {
  if (cuenta === 'Nequi') return 'purple-6'
  if (cuenta === 'Bancolombia') return 'amber-8'
  return 'green-6'
}

onMounted(async () => {
  await configStore.fetchConfiguracion()
  if (configStore.categoriasActivas.length > 0 && !form.value.categoria) {
    form.value.categoria = configStore.categoriasActivas[0].nombre
  }
  await cuentasStore.fetchCuentas()
  await movimientosStore.fetchPorFecha(getFechaLocalHoy())
})
</script>

<style scoped>
.gasto-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  align-items: start;
}

@media (max-width: 900px) {
  .gasto-grid {
    grid-template-columns: 1fr;
  }
}

.gasto-grid > * {
  min-width: 0;
  overflow: hidden;
}

.gasto-right-col {
  display: flex;
  flex-direction: column;
  gap: 16px;
  min-width: 0;
}

.form-label {
  font-size: 12px;
  font-weight: 700;
  color: #475569;
  margin-bottom: 4px;
}

.cuenta-chip {
  display: flex;
  align-items: center;
  padding: 8px 14px;
  border-radius: 10px;
  border: 1.5px solid #e2e8f0;
  cursor: pointer;
  font-size: 13px;
  font-weight: 600;
  color: #64748b;
  background: white;
  transition: all 0.15s;
}

.cuenta-chip:hover {
  border-color: #94a3b8;
  color: #0f172a;
}

.cuenta-chip--active {
  border-color: #ef4444;
  background: #fef2f2;
  color: #dc2626;
}
</style>
