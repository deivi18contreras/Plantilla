<template>
  <div class="column q-gutter-y-md full-width">

    <!-- ─── HEADER PRINCIPAL DASHBOARD (ESTILO IMAGEN 4) ─── -->
    <div class="row items-center justify-between q-py-xs" style="gap: 12px; flex-wrap: wrap;">
      <!-- Fecha y Saludo Motivacional -->
      <div class="row items-center q-gutter-x-sm">
        <div class="date-icon-badge">
          <q-icon name="calendar_today" size="20px" color="primary" />
        </div>
        <div>
          <div class="text-subtitle1 text-weight-bolder text-slate-900 text-capitalize" style="line-height: 1.1;">
            {{ fechaHoyLarga }}
          </div>
          <div class="text-caption text-slate-500 font-medium">
            Hoy es un gran día para tu negocio
          </div>
        </div>
      </div>

      <!-- Usuario y Rol Admin -->
      <div class="row items-center q-gutter-x-sm">
        <span class="admin-pill text-weight-bolder">
          {{ authStore.user?.rol?.toUpperCase() || 'ADMIN' }}
        </span>

        <q-btn flat no-caps class="q-pa-none user-dropdown-btn">
          <div class="row items-center q-gutter-x-sm">
            <q-avatar size="38px" color="blue-1" text-color="primary" class="text-weight-bolder shadow-xs">
              {{ authStore.nombreUsuario.charAt(0).toUpperCase() }}
            </q-avatar>
            <span class="text-weight-bold text-slate-900 gt-xs">{{ authStore.nombreUsuario }}</span>
            <q-icon name="arrow_drop_down" size="20px" color="slate-500" />
          </div>

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

    <!-- ─── FILA 1: ALERTAS URGENTES ─── -->
    <DashboardAlertas
      :adelantos="adelantosStore.pendientes"
      :total-adelantos="adelantosStore.totalPendiente"
      :gastos-fijos="gastosFijosStore.proximos"
      :cuentas="todasLasCuentas"
    />

    <!-- ─── FILA 2: TRES TARJETAS PRINCIPALES (VENTA | SALDOS | GASTOS) ─── -->
    <div class="row q-col-gutter-md">
      <div class="col-12 col-md-4">
        <DashboardVentaHoy
          :venta-hoy="ventaHoy"
          :meta-diaria="configStore.metaDiaria"
          :comparativa="comparativaAyer"
        />
      </div>
      <div class="col-12 col-md-4">
        <DashboardSaldosCuentas
          :efectivo="cuentasStore.saldoPor('Efectivo')"
          :nequi="cuentasStore.saldoPor('Nequi')"
          :bancolombia="cuentasStore.saldoPor('Bancolombia')"
          :total="cuentasStore.totalSaldo"
          @abrir-extracto="abrirExtracto"
        />
      </div>
      <div class="col-12 col-md-4">
        <DashboardGastosHoy :gastos="gastosHoy" />
      </div>
    </div>

    <!-- ─── FILA 3: RESUMEN RÁPIDO DEL MES (4 COLUMNAS) ─── -->
    <div>
      <DashboardResumenMes
        :venta-bruta="resumenMes.totalRecaudos"
        :total-gastos="resumenMes.totalGastos"
        :ganancia-neta="resumenMes.neto"
        :dias-trabajados="diasTrabajados"
        :dias-mes="diasDelMes"
      />
    </div>

    <!-- ─── FILA 4: ADELANTOS + ACCIONES RÁPIDAS + TENDENCIA 7 DÍAS ─── -->
    <div class="row q-col-gutter-md">
      <!-- Deudas Internas -->
      <div class="col-12 col-md-4">
        <DashboardAdelantos
          :adelantos="adelantosStore.pendientes"
          :total-pendiente="adelantosStore.totalPendiente"
          @ver-todos="$router.push('/adelantos')"
        />
      </div>

      <!-- Acciones Rápidas -->
      <div class="col-12 col-md-4">
        <DashboardAccionesRapidas />
      </div>

      <!-- Tendencia de Ventas (últimos 7 días) -->
      <div class="col-12 col-md-4">
        <DashboardTendencia
          :semana-data="semanaData"
          :cargando="cargandoGrafica"
        />
      </div>
    </div>

    <!-- ─── FILA 5: SOBRES DE EFECTIVO DISPONIBLES (FÍSICO) ─── -->
    <DashboardSobresEfectivo />


    <!-- MODAL EXTRACTO RÁPIDO DE CUENTA -->
    <ModalExtractoCuenta
      v-model="modalExtractoAbierto"
      :cuenta-nombre="cuentaSeleccionada"
    />

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

// Componentes del dashboard
import DashboardAlertas from '@/components/dashboard/DashboardAlertas.vue'
import DashboardVentaHoy from '@/components/dashboard/DashboardVentaHoy.vue'
import DashboardSaldosCuentas from '@/components/dashboard/DashboardSaldosCuentas.vue'
import DashboardGastosHoy from '@/components/dashboard/DashboardGastosHoy.vue'
import DashboardResumenMes from '@/components/dashboard/DashboardResumenMes.vue'
import DashboardAdelantos from '@/components/dashboard/DashboardAdelantos.vue'
import DashboardAccionesRapidas from '@/components/dashboard/DashboardAccionesRapidas.vue'
import DashboardTendencia from '@/components/dashboard/DashboardTendencia.vue'
import DashboardSobresEfectivo from '@/components/dashboard/DashboardSobresEfectivo.vue'
import ModalExtractoCuenta from '@/components/ModalExtractoCuenta.vue'

const authStore = useAuthStore()
const cuentasStore = useCuentasStore()
const movimientosStore = useMovimientosStore()
const configStore = useConfiguracionStore()
const adelantosStore = useAdelantosStore()
const gastosFijosStore = useGastosFijosStore()
const router = useRouter()

const modalExtractoAbierto = ref(false)
const cuentaSeleccionada = ref('Nequi')
const abrirExtracto = (cuenta) => {
  cuentaSeleccionada.value = cuenta
  modalExtractoAbierto.value = true
}

const fechaHoyLarga = computed(() => {
  const d = new Date()
  return d.toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long' })
})

const hoyISO = () => {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

const todosHoy = computed(() => movimientosStore.movimientos || [])
const gastosHoy = computed(() => todosHoy.value.filter(m => m.tipo === 'gasto'))

const ventaHoy = computed(() => {
  const gastos   = gastosHoy.value.reduce((s, m) => s + (m.monto || 0), 0)
  const recaudos = todosHoy.value.filter(m => m.tipo === 'recaudo').reduce((s, m) => s + (m.monto || 0), 0)
  return gastos + recaudos
})

const comparativaAyer = ref(12)
const cargarComparativaAyer = async () => {
  try {
    const ayer = new Date()
    ayer.setDate(ayer.getDate() - 1)
    const ayerISO = `${ayer.getFullYear()}-${String(ayer.getMonth()+1).padStart(2,'0')}-${String(ayer.getDate()).padStart(2,'0')}`
    const movsAyer = await getData('/movimientos', { fecha: ayerISO })
    const gastosAyer   = movsAyer.filter(m => m.tipo === 'gasto').reduce((s, m) => s + (m.monto || 0), 0)
    const recaudosAyer = movsAyer.filter(m => m.tipo === 'recaudo').reduce((s, m) => s + (m.monto || 0), 0)
    const ventaAyer = gastosAyer + recaudosAyer
    if (ventaAyer > 0 && ventaHoy.value > 0) {
      comparativaAyer.value = Math.round(((ventaHoy.value - ventaAyer) / ventaAyer) * 100)
    }
  } catch { /* no bloquea */ }
}

const resumenMes = ref({ totalRecaudos: 0, totalGastos: 0, neto: 0 })
const semanaData = ref([])
const cargandoGrafica = ref(false)

const diasTrabajados = computed(() => new Date().getDate())
const diasDelMes = computed(() => {
  const hoy = new Date()
  return new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0).getDate()
})

const cargarResumenMes = async () => {
  cargandoGrafica.value = true
  try {
    const data = await getData('/resumen')
    resumenMes.value = {
      totalRecaudos: data.totalRecaudos || 0,
      totalGastos:   data.totalGastos || 0,
      neto:          data.neto || 0
    }
    if (data?.semanaActual) {
      semanaData.value = data.semanaActual
    }
  } catch { /* no bloquea */ } finally {
    cargandoGrafica.value = false
  }
}

const todasLasCuentas = computed(() => [
  { nombre: 'Efectivo',    saldo: cuentasStore.saldoPor('Efectivo') },
  { nombre: 'Nequi',       saldo: cuentasStore.saldoPor('Nequi') },
  { nombre: 'Bancolombia', saldo: cuentasStore.saldoPor('Bancolombia') }
])

const handleLogout = () => {
  authStore.logout()
  router.push('/login')
}

onMounted(async () => {
  await configStore.fetchConfiguracion()
  await cuentasStore.fetchCuentas()
  await movimientosStore.fetchPorFecha(hoyISO())
  await adelantosStore.fetchPendientes()
  await gastosFijosStore.fetchProximos(7)
  await cargarResumenMes()
  await cargarComparativaAyer()
})
</script>

<style scoped>
.date-icon-badge {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  background: #eff6ff;
  display: flex;
  align-items: center;
  justify-content: center;
}

.admin-pill {
  background: #10b981;
  color: white;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 11px;
  letter-spacing: 0.5px;
}

.user-dropdown-btn {
  border: 1px solid #e2e8f0;
  border-radius: 24px;
  padding: 2px 10px 2px 4px;
  background: #ffffff;
}

.store-icon-box {
  width: 46px;
  height: 46px;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
