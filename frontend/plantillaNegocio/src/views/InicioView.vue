<template>
  <div class="dashboard-main-card full-width">

    <!-- ENCABEZADO -->
    <div class="row items-start items-md-center justify-between q-mb-lg q-mb-md-xl">
      <div>
        <div class="text-h5 text-md-h4 text-weight-bolder text-slate-900">Control Financiero Diario</div>
        <div class="text-caption text-slate-500 q-mt-xs text-capitalize">{{ fechaHoy }}</div>
      </div>

      <div class="row items-center q-gutter-md">
        <q-btn flat round icon="notifications_none" color="slate-600" size="md" />
        <q-btn flat round no-caps class="q-pa-none">
          <q-avatar size="42px" color="blue-1" text-color="primary" class="font-bold shadow-sm">
            {{ authStore.nombreUsuario.charAt(0).toUpperCase() }}
          </q-avatar>
          <q-menu auto-close class="bg-white text-slate-900 shadow-xl" style="border-radius: 16px; min-width: 200px;">
            <q-list padding>
              <q-item>
                <q-item-section avatar style="min-width: 36px;">
                  <q-avatar size="32px" color="blue-6" text-color="white" class="font-bold">
                    {{ authStore.nombreUsuario.charAt(0).toUpperCase() }}
                  </q-avatar>
                </q-item-section>
                <q-item-section>
                  <q-item-label class="text-weight-bold text-slate-900">{{ authStore.nombreUsuario }}</q-item-label>
                  <q-item-label caption class="text-primary text-weight-bolder text-uppercase" style="font-size: 10px;">
                    {{ authStore.user?.rol }}
                  </q-item-label>
                </q-item-section>
              </q-item>
              <q-separator class="q-my-xs" />
              <q-item clickable @click="$router.push('/usuarios')" class="text-blue-7">
                <q-item-section avatar style="min-width: 32px;">
                  <q-icon name="manage_accounts" color="blue-7" size="20px" />
                </q-item-section>
                <q-item-section class="text-weight-bold">Gestionar usuarios</q-item-section>
              </q-item>
              <q-item clickable @click="handleLogout" class="text-red-6">
                <q-item-section avatar style="min-width: 32px;">
                  <q-icon name="logout" color="red-6" size="20px" />
                </q-item-section>
                <q-item-section class="text-weight-bold">Cerrar sesión</q-item-section>
              </q-item>
            </q-list>
          </q-menu>
        </q-btn>
      </div>
    </div>

    <!-- FILA SUPERIOR: 3 TARJETAS -->
    <div class="row q-col-gutter-sm q-col-gutter-md-lg q-mb-md q-mb-md-lg">

      <!-- TARJETA 1: VENTA HOY + META -->
      <div class="col-12 col-md-4">
        <div class="card-solid-blue full-height column justify-between">
          <div class="title">Venta de hoy</div>
          <div class="row items-center justify-between">
            <div>
              <div class="amount" style="font-size: clamp(1.4rem, 3vw, 2rem);">{{ formatCOP(ventaHoy) }}</div>
              <div v-if="configStore.metaDiaria > 0" class="text-caption text-blue-2 q-mt-xs">
                Meta: {{ formatCOP(configStore.metaDiaria) }}
              </div>
              <div v-if="comparativaAyer !== null" class="q-mt-xs">
                <q-badge
                  :color="comparativaAyer >= 0 ? 'positive' : 'negative'"
                  :label="(comparativaAyer >= 0 ? '+' : '') + comparativaAyer + '% vs ayer'"
                  class="text-weight-bold"
                />
              </div>
            </div>
            <!-- Arco de progreso meta -->
            <div v-if="configStore.metaDiaria > 0" class="column items-center">
              <svg width="72" height="72" viewBox="0 0 72 72">
                <circle cx="36" cy="36" r="28" fill="none" stroke="rgba(255,255,255,0.15)" stroke-width="7"/>
                <circle
                  cx="36" cy="36" r="28" fill="none"
                  stroke="#4ade80"
                  stroke-width="7"
                  stroke-linecap="round"
                  :stroke-dasharray="175.9"
                  :stroke-dashoffset="175.9 * (1 - Math.min(1, ventaHoy / configStore.metaDiaria))"
                  transform="rotate(-90 36 36)"
                />
                <text x="36" y="40" text-anchor="middle" font-size="13" font-weight="bold" fill="white">
                  {{ Math.round(Math.min(100, (ventaHoy / configStore.metaDiaria) * 100)) }}%
                </text>
              </svg>
              <div class="text-caption text-blue-2" style="font-size:10px;">de la meta</div>
            </div>
          </div>
        </div>
      </div>

      <!-- TARJETA 2: CUENTAS -->
      <div class="col-12 col-md-4">
        <div class="card-widget full-height">
          <div class="row items-center justify-between q-mb-sm">
            <div class="text-subtitle1 text-weight-bold text-slate-900">Cuentas</div>
          </div>
          <CardCuenta
            nombre="Nequi"
            :monto="cuentasStore.saldoPor('Nequi')"
            icon="phone_android"
            avatar-color="purple-1"
            avatar-text-color="purple-8"
            clickable
            @click="$router.push('/recaudo')"
          />
          <CardCuenta
            nombre="Bancolombia"
            :monto="cuentasStore.saldoPor('Bancolombia')"
            icon="account_balance"
            avatar-color="amber-1"
            avatar-text-color="amber-9"
            clickable
            @click="$router.push('/recaudo')"
          />
        </div>
      </div>

      <!-- TARJETA 3: EFECTIVO & TOTAL -->
      <div class="col-12 col-md-4">
        <div class="card-widget full-height">
          <div class="row items-center justify-between q-mb-sm">
            <div class="text-subtitle1 text-weight-bold text-slate-900">Efectivo & Total</div>
          </div>
          <CardCuenta
            nombre="Efectivo"
            :monto="cuentasStore.saldoPor('Efectivo')"
            icon="payments"
            avatar-color="green-1"
            avatar-text-color="green-8"
            clickable
            @click="$router.push('/recaudo')"
          />
          <CardCuenta
            nombre="Total en Cuentas"
            :monto="cuentasStore.totalSaldo"
            icon="account_balance_wallet"
            avatar-color="blue-1"
            avatar-text-color="blue-8"
          />
        </div>
      </div>

    </div>

    <!-- FILA INFERIOR: GRÁFICA REAL + ACCIONES -->
    <div class="row q-col-gutter-sm q-col-gutter-md-lg">

      <!-- WIDGET 1: GRÁFICA SEMANAL REAL -->
      <div class="col-12 col-md-7">
        <div class="card-widget full-height">
          <div class="row items-center justify-between q-mb-md">
            <div>
              <div class="text-subtitle1 text-weight-bold text-slate-900">Resumen Semanal</div>
              <div class="text-caption text-slate-500">Ingresos vs Gastos — últimos 7 días</div>
            </div>
            <q-btn v-if="cargandoGrafica" flat dense no-caps>
              <q-spinner size="18px" color="primary" />
            </q-btn>
          </div>
          <div style="height: 240px;">
            <apexchart type="bar" height="100%" :options="chartOptions" :series="chartSeries" />
          </div>
        </div>
      </div>

      <!-- WIDGET 2: ACCIONES RAPIDAS -->
      <div class="col-12 col-md-5">
        <div class="card-widget full-height column justify-between">
          <div class="text-subtitle1 text-weight-bold text-slate-900 q-mb-md">Acciones rápidas</div>
          <div class="column q-gutter-y-md">
            <button class="btn-action-light" @click="$router.push('/recaudo')">
              <q-icon name="description" size="22px" color="primary" />
              <span>Nuevo cierre</span>
            </button>
            <button class="btn-action-light" @click="$router.push('/transferencia')">
              <q-icon name="swap_horiz" size="22px" color="primary" />
              <span>Transferir entre cuentas</span>
            </button>
            <button class="btn-action-light" @click="$router.push('/gasto')">
              <q-icon name="shopping_bag" size="22px" color="primary" />
              <span>Nuevo gasto</span>
            </button>
            <button class="btn-action-light" @click="$router.push('/resumen')">
              <q-icon name="pie_chart" size="22px" color="primary" />
              <span>Ver resumen del mes</span>
            </button>
          </div>
        </div>
      </div>

    </div>

  </div>
</template>

<script setup>
import { onMounted, ref, computed } from 'vue'
import { useAuthStore } from '@/store/authStore'
import { useCuentasStore } from '@/store/cuentasStore'
import { useMovimientosStore } from '@/store/movimientosStore'
import { useConfiguracionStore } from '@/store/configuracionStore'
import { getData } from '@/services/apiService'
import { useRouter } from 'vue-router'
import CardCuenta from '@/components/CardCuenta.vue'

const authStore = useAuthStore()
const cuentasStore = useCuentasStore()
const movimientosStore = useMovimientosStore()
const configStore = useConfiguracionStore()
const router = useRouter()
const cargandoGrafica = ref(false)

const fechaHoy = new Date().toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long' })
const hoyISO = () => new Date().toISOString().split('T')[0]
const formatCOP = (val) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(val ?? 0)

// Venta de hoy = gastos del día + recaudos del día (cierres)
const ventaHoy = computed(() => {
  const movs = movimientosStore.movimientosPorFecha || []
  const gastos   = movs.filter(m => m.tipo === 'gasto').reduce((s, m) => s + m.monto, 0)
  const recaudos = movs.filter(m => m.tipo === 'recaudo').reduce((s, m) => s + m.monto, 0)
  return gastos + recaudos
})

// Comparativa vs ayer
const comparativaAyer = ref(null)
const cargarComparativaAyer = async () => {
  try {
    const ayer = new Date()
    ayer.setDate(ayer.getDate() - 1)
    const ayerISO = `${ayer.getFullYear()}-${String(ayer.getMonth()+1).padStart(2,'0')}-${String(ayer.getDate()).padStart(2,'0')}`
    const movsAyer = await getData('/movimientos', { fecha: ayerISO })
    const gastosAyer   = movsAyer.filter(m => m.tipo === 'gasto').reduce((s, m) => s + m.monto, 0)
    const recaudosAyer = movsAyer.filter(m => m.tipo === 'recaudo').reduce((s, m) => s + m.monto, 0)
    const ventaAyer = gastosAyer + recaudosAyer
    if (ventaAyer > 0 && ventaHoy.value > 0) {
      comparativaAyer.value = Math.round(((ventaHoy.value - ventaAyer) / ventaAyer) * 100)
    }
  } catch { /* no bloquea */ }
}

const handleLogout = () => {
  authStore.logout()
  router.push('/login')
}

// Gráfica inicializada con estructura correcta — datos se rellenan desde la API
const chartSeries = ref([
  { name: 'Ingresos', data: [0, 0, 0, 0, 0, 0, 0] },
  { name: 'Gastos', data: [0, 0, 0, 0, 0, 0, 0] }
])

const chartOptions = ref({
  chart: { type: 'bar', toolbar: { show: false } },
  colors: ['#3b82f6', '#bfdbfe'],
  plotOptions: { bar: { horizontal: false, columnWidth: '45%', borderRadius: 6 } },
  dataLabels: { enabled: false },
  stroke: { show: true, width: 2, colors: ['transparent'] },
  xaxis: {
    categories: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'],
    labels: { style: { colors: '#64748b', fontWeight: 600 } }
  },
  yaxis: { show: false },
  fill: { opacity: 1 },
  legend: { position: 'top', horizontalAlign: 'right' }
})

const cargarGraficaSemanal = async () => {
  cargandoGrafica.value = true
  try {
    const data = await getData('/resumen')
    if (data?.semanaActual) {
      chartSeries.value = [
        { name: 'Ingresos', data: data.semanaActual.map(d => Math.round(d.recaudos / 1000)) },
        { name: 'Gastos', data: data.semanaActual.map(d => Math.round(d.gastos / 1000)) }
      ]
      chartOptions.value = {
        ...chartOptions.value,
        xaxis: {
          categories: data.semanaActual.map(d => d.label),
          labels: { style: { colors: '#64748b', fontWeight: 600 } }
        },
        tooltip: {
          y: {
            formatter: (val) => `$${(val * 1000).toLocaleString('es-CO')}`
          }
        }
      }
    }
  } catch (e) {
    // Si falla mantiene barras en 0 en lugar de datos inventados
  } finally {
    cargandoGrafica.value = false
  }
}

onMounted(async () => {
  await configStore.fetchConfiguracion()
  await cuentasStore.fetchCuentas()
  await movimientosStore.fetchPorFecha(hoyISO())
  await cargarGraficaSemanal()
  await cargarComparativaAyer()
})
</script>
