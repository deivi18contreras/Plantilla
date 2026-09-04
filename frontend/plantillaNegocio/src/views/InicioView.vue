<template>
  <div class="dashboard-main-card full-width">

    <!-- ENCABEZADO -->
    <div class="row items-start items-md-center justify-between q-mb-lg q-mb-md-xl">
      <div>
        <div class="text-h5 text-md-h4 text-weight-bolder text-slate-900">Control Financiero Diario</div>
        <div class="text-caption text-slate-500 q-mt-xs text-capitalize">{{ fechaHoy }}</div>
      </div>
      <div class="row items-center q-gutter-md">
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
                <q-item-section avatar style="min-width: 32px;"><q-icon name="manage_accounts" color="blue-7" size="20px" /></q-item-section>
                <q-item-section class="text-weight-bold">Gestionar usuarios</q-item-section>
              </q-item>
              <q-item clickable @click="handleLogout" class="text-red-6">
                <q-item-section avatar style="min-width: 32px;"><q-icon name="logout" color="red-6" size="20px" /></q-item-section>
                <q-item-section class="text-weight-bold">Cerrar sesión</q-item-section>
              </q-item>
            </q-list>
          </q-menu>
        </q-btn>
      </div>
    </div>

    <!-- ═══ FILA 1: ALERTA ADELANTOS + ALERTAS GASTOS FIJOS ═══ -->
    <!-- Solo se muestran si hay algo urgente -->
    <div class="row q-col-gutter-sm q-mb-md">

      <!-- ALERTA: Adelantos pendientes -->
      <div v-if="adelantosStore.totalPendiente > 0" class="col-12 col-md-6">
        <div
          class="q-pa-md cursor-pointer"
          style="background: #fef2f2; border: 1.5px solid #fca5a5; border-radius: 16px;"
          @click="$router.push('/adelantos')"
        >
          <div class="row items-center justify-between">
            <div class="row items-center q-gutter-x-sm">
              <q-icon name="savings" color="red-6" size="28px" />
              <div>
                <div class="text-caption text-weight-bold text-red-7">💸 Adelantos pendientes</div>
                <div class="text-subtitle1 text-weight-bolder text-red-7">{{ formatCOP(adelantosStore.totalPendiente) }}</div>
                <div class="text-caption text-red-5">{{ adelantosStore.pendientes.length }} adelanto(s) sin recuperar</div>
              </div>
            </div>
            <q-icon name="chevron_right" color="red-4" size="20px" />
          </div>
        </div>
      </div>

      <!-- ALERTA: Gastos fijos próximos a vencer -->
      <div v-if="gastosFijosStore.proximos.length > 0" class="col-12 col-md-6">
        <div
          class="q-pa-md cursor-pointer"
          style="background: #fffbeb; border: 1.5px solid #fcd34d; border-radius: 16px;"
          @click="$router.push('/gastos-fijos')"
        >
          <div class="row items-center justify-between">
            <div class="row items-center q-gutter-x-sm">
              <q-icon name="event_repeat" color="orange-7" size="28px" />
              <div>
                <div class="text-caption text-weight-bold text-orange-8">📅 Pagos próximos a vencer</div>
                <div
                  v-for="gf in gastosFijosStore.proximos.slice(0, 2)"
                  :key="gf._id"
                  class="text-caption text-slate-700"
                >
                  <span class="text-weight-bold">{{ gf.nombre }}</span> — {{ formatCOP(gf.monto) }}
                  <span class="text-orange-7">({{ formatFechaCorta(gf.proximoVencimiento) }})</span>
                </div>
                <div v-if="gastosFijosStore.proximos.length > 2" class="text-caption text-orange-6">
                  +{{ gastosFijosStore.proximos.length - 2 }} más...
                </div>
              </div>
            </div>
            <q-icon name="chevron_right" color="orange-4" size="20px" />
          </div>
        </div>
      </div>
    </div>

    <!-- ═══ FILA 2: TARJETAS PRINCIPALES ═══ -->
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

      <!-- TARJETA 2: SALDOS POR CUENTA -->
      <div class="col-12 col-md-4">
        <div class="card-widget full-height">
          <div class="text-subtitle1 text-weight-bold text-slate-900 q-mb-sm">Cuentas</div>
          <CardCuenta nombre="Efectivo" :monto="cuentasStore.saldoPor('Efectivo')" icon="payments" avatar-color="green-1" avatar-text-color="green-8" clickable @click="$router.push('/recaudo')" />
          <CardCuenta nombre="Nequi" :monto="cuentasStore.saldoPor('Nequi')" icon="phone_android" avatar-color="purple-1" avatar-text-color="purple-8" clickable @click="$router.push('/recaudo')" />
          <CardCuenta nombre="Bancolombia" :monto="cuentasStore.saldoPor('Bancolombia')" icon="account_balance" avatar-color="amber-1" avatar-text-color="amber-9" clickable @click="$router.push('/recaudo')" />
          <CardCuenta nombre="Total" :monto="cuentasStore.totalSaldo" icon="account_balance_wallet" avatar-color="blue-1" avatar-text-color="blue-8" />
        </div>
      </div>

      <!-- TARJETA 3: GASTOS DEL DÍA DESGLOSADOS -->
      <div class="col-12 col-md-4">
        <div class="card-widget full-height">
          <div class="row items-center justify-between q-mb-sm">
            <div class="text-subtitle1 text-weight-bold text-slate-900">Gastos de hoy</div>
            <q-btn flat dense no-caps color="primary" label="Ver historial" style="font-size:11px;" @click="$router.push('/historial')" />
          </div>

          <!-- Sin movimientos hoy -->
          <div v-if="movimientosHoy.length === 0" class="text-center text-slate-400 q-py-md" style="font-size: 13px;">
            Sin movimientos registrados hoy
          </div>

          <!-- Lista de últimos 5 gastos del día -->
          <div v-for="m in movimientosHoy.slice(0, 5)" :key="m._id" class="row items-center justify-between q-py-xs" style="border-bottom: 1px solid #f1f5f9;">
            <div class="row items-center q-gutter-x-xs">
              <q-icon :name="m.tipo === 'gasto' ? 'remove_circle' : 'add_circle'" :color="m.tipo === 'gasto' ? 'red-5' : 'green-6'" size="18px" />
              <div>
                <div class="text-caption text-weight-bold text-slate-800" style="max-width: 140px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                  {{ m.descripcion || m.categoria || m.tipo }}
                </div>
                <div class="text-caption text-slate-400">{{ m.cuenta }}</div>
              </div>
            </div>
            <span class="text-caption text-weight-bolder" :class="m.tipo === 'gasto' ? 'text-red-6' : 'text-green-7'">
              {{ m.tipo === 'gasto' ? '-' : '+' }}{{ formatCOP(m.monto) }}
            </span>
          </div>

          <div v-if="movimientosHoy.length > 5" class="text-caption text-slate-400 text-center q-mt-xs">
            +{{ movimientosHoy.length - 5 }} más — <span class="text-primary cursor-pointer" @click="$router.push('/historial')">ver todos</span>
          </div>

          <!-- Total gastos del día -->
          <div v-if="movimientosHoy.length > 0" class="row justify-between q-mt-sm q-pt-xs" style="border-top: 2px solid #e2e8f0;">
            <span class="text-caption text-weight-bold text-slate-600">Total gastos hoy:</span>
            <span class="text-caption text-weight-bolder text-red-6">{{ formatCOP(totalGastosHoy) }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- ═══ FILA 3: RESUMEN DE DEUDAS INTERNAS ═══ -->
    <!-- Solo aparece si hay adelantos pendientes -->
    <div v-if="adelantosStore.pendientes.length > 0" class="q-mb-md">
      <div class="card-widget">
        <!-- Cabecera -->
        <div class="row items-center justify-between q-mb-md">
          <div class="row items-center q-gutter-x-sm">
            <q-icon name="savings" color="red-6" size="24px" />
            <div>
              <div class="text-subtitle1 text-weight-bolder text-slate-900">Deudas internas pendientes</div>
              <div class="text-caption text-slate-500">Se descuentan automáticamente en cada cierre de caja</div>
            </div>
          </div>
          <div class="text-right">
            <div class="text-caption text-slate-500">Total a recuperar</div>
            <div class="text-h6 text-weight-bolder text-red-7">{{ formatCOP(adelantosStore.totalPendiente) }}</div>
          </div>
        </div>

        <!-- Lista de adelantos -->
        <div class="row q-col-gutter-sm">
          <div
            v-for="a in adelantosStore.pendientes"
            :key="a._id"
            class="col-12 col-sm-6 col-md-4"
          >
            <div class="q-pa-sm" style="background: #fff1f2; border: 1px solid #fecaca; border-radius: 12px;">
              <!-- Motivo y fecha -->
              <div class="text-caption text-weight-bold text-slate-800 q-mb-xs" style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                {{ a.motivo || 'Sin motivo especificado' }}
              </div>
              <div class="text-caption text-slate-500 q-mb-sm">{{ formatFechaCorta(a.fecha) }}</div>

              <!-- Barra de progreso de recuperación -->
              <div style="background: #fee2e2; border-radius: 6px; height: 6px; overflow: hidden;" class="q-mb-xs">
                <div
                  :style="`width: ${Math.round((a.montoRecuperado / a.monto) * 100)}%; background: #ef4444; height: 100%; border-radius: 6px; transition: width 0.3s;`"
                />
              </div>

              <!-- Montos -->
              <div class="row justify-between">
                <div>
                  <div class="text-caption text-slate-400">Recuperado</div>
                  <div class="text-caption text-weight-bold text-green-6">{{ formatCOP(a.montoRecuperado) }}</div>
                </div>
                <div class="text-right">
                  <div class="text-caption text-slate-400">Pendiente</div>
                  <div class="text-caption text-weight-bold text-red-6">{{ formatCOP(a.saldoPendiente) }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Botón ver detalle -->
        <div class="text-right q-mt-sm">
          <q-btn flat no-caps dense color="red-6" label="Ver todos los adelantos →" style="font-size: 12px;" @click="$router.push('/adelantos')" />
        </div>
      </div>
    </div>

    <!-- ═══ FILA 4: GRÁFICA SEMANAL + ACCIONES RÁPIDAS ═══ -->
    <div class="row q-col-gutter-sm q-col-gutter-md-lg">

      <!-- GRÁFICA SEMANAL -->
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
          <div style="height: 220px;">
            <apexchart type="bar" height="100%" :options="chartOptions" :series="chartSeries" />
          </div>
        </div>
      </div>

      <!-- ACCIONES RÁPIDAS -->
      <div class="col-12 col-md-5">
        <div class="card-widget full-height column justify-between">
          <div class="text-subtitle1 text-weight-bold text-slate-900 q-mb-md">Acciones rápidas</div>
          <div class="column q-gutter-y-sm">
            <button class="btn-action-light" @click="$router.push('/recaudo')">
              <q-icon name="description" size="22px" color="primary" />
              <span>Nuevo cierre de turno</span>
            </button>
            <button class="btn-action-light" @click="$router.push('/gasto')">
              <q-icon name="shopping_bag" size="22px" color="negative" />
              <span>Registrar gasto</span>
            </button>
            <button class="btn-action-light" @click="$router.push('/adelantos')">
              <q-icon name="savings" size="22px" color="red-6" />
              <span>Registrar adelanto interno</span>
              <q-badge v-if="adelantosStore.pendientes.length > 0" color="red-5" :label="adelantosStore.pendientes.length" class="q-ml-xs" />
            </button>
            <button class="btn-action-light" @click="$router.push('/gastos-fijos')">
              <q-icon name="event_repeat" size="22px" color="orange-7" />
              <span>Gastos fijos</span>
              <q-badge v-if="gastosFijosStore.proximos.length > 0" color="orange-5" :label="gastosFijosStore.proximos.length" class="q-ml-xs" />
            </button>
            <button class="btn-action-light" @click="$router.push('/transferencia')">
              <q-icon name="swap_horiz" size="22px" color="primary" />
              <span>Transferir entre cuentas</span>
            </button>
            <button class="btn-action-light" @click="$router.push('/resumen')">
              <q-icon name="pie_chart" size="22px" color="blue-7" />
              <span>Resumen del mes</span>
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
import { useAdelantosStore } from '@/store/adelantosStore'
import { useGastosFijosStore } from '@/store/gastosFijosStore'
import { getData } from '@/services/apiService'
import { useRouter } from 'vue-router'
import { parseFechaLocal } from '@/utils/dateUtils'
import CardCuenta from '@/components/CardCuenta.vue'

const authStore = useAuthStore()
const cuentasStore = useCuentasStore()
const movimientosStore = useMovimientosStore()
const configStore = useConfiguracionStore()
const adelantosStore = useAdelantosStore()
const gastosFijosStore = useGastosFijosStore()
const router = useRouter()
const cargandoGrafica = ref(false)

const fechaHoy = new Date().toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long' })
const hoyISO = () => {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}
const formatCOP = (val) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(val ?? 0)
const formatFechaCorta = (fechaStr) => {
  if (!fechaStr) return ''
  return parseFechaLocal(fechaStr).toLocaleDateString('es-CO', { day: '2-digit', month: 'short' })
}

// Movimientos de hoy (todos: gastos y recaudos)
const movimientosHoy = computed(() => movimientosStore.movimientos || [])

// Venta de hoy = gastos del día + recaudos del día
const ventaHoy = computed(() => {
  const movs = movimientosHoy.value
  const gastos   = movs.filter(m => m.tipo === 'gasto').reduce((s, m) => s + m.monto, 0)
  const recaudos = movs.filter(m => m.tipo === 'recaudo').reduce((s, m) => s + m.monto, 0)
  return gastos + recaudos
})

// Total solo gastos del día (sin cierres)
const totalGastosHoy = computed(() =>
  movimientosHoy.value.filter(m => m.tipo === 'gasto').reduce((s, m) => s + m.monto, 0)
)

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

// Gráfica semanal
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
        tooltip: { y: { formatter: (val) => `$${(val * 1000).toLocaleString('es-CO')}` } }
      }
    }
  } catch (e) { /* mantiene barras en 0 */ } finally {
    cargandoGrafica.value = false
  }
}

onMounted(async () => {
  await configStore.fetchConfiguracion()
  await cuentasStore.fetchCuentas()
  await movimientosStore.fetchPorFecha(hoyISO())
  await adelantosStore.fetchPendientes()
  await gastosFijosStore.fetchProximos(7)
  await cargarGraficaSemanal()
  await cargarComparativaAyer()
})
</script>
