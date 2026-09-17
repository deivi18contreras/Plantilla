<template>
  <q-layout view="hHh lpR fFf" class="bg-slate-100">

    <!-- TOOLBAR MÓVIL SUPERIOR (pantallas < 768px) -->
    <q-header class="lt-md text-white border-b" style="background:#0f172a;" height-hint="56">
      <q-toolbar class="q-px-sm">
        <q-btn flat dense round icon="menu" color="white" @click="drawer = !drawer" aria-label="Menu" />
        <q-avatar size="30px" color="blue-6" text-color="white" icon="store" class="q-ml-xs q-mr-sm" />
        <q-toolbar-title class="text-weight-bolder text-white" style="font-size: 16px;">
          {{ configStore.nombreNegocio || 'Control Financiero' }}
        </q-toolbar-title>
        <q-btn flat round icon="logout" color="red-4" size="sm" @click="handleLogout" title="Cerrar sesión" />
      </q-toolbar>
    </q-header>

    <!-- DRAWER LATERAL OSCURO (ESCRITORIO + MÓVIL DESLIZABLE) -->
    <q-drawer
      v-model="drawer"
      :show-if-above="true"
      :width="248"
      :breakpoint="768"
      bordered
      class="column justify-between"
      style="background: #0f172a;"
    >
      <div class="q-pa-md">
        <!-- Logo & Header del Menú -->
        <div class="row items-center q-gutter-x-sm q-mb-xl q-mt-xs">
          <q-avatar size="38px" color="blue-6" text-color="white" icon="store" class="shadow-md" />
          <div>
            <div class="text-weight-bolder text-white" style="font-size: 15px; line-height:1.2;">
              {{ configStore.nombreNegocio || 'Mi Negocio' }}
            </div>
            <div class="text-caption" style="color:#94a3b8; font-size: 11px;">
              Abarrotes · Comidas · Bebidas
            </div>
          </div>
        </div>

        <q-list class="q-gutter-y-xs">

          <!-- INICIO -->
          <q-item
            v-if="authStore.isAdmin"
            clickable v-ripple
            :active="$route.path === '/'"
            active-class="menu-active"
            class="menu-item"
            @click="navTo('/')"
          >
            <q-item-section avatar style="min-width:32px;">
              <q-icon name="home" size="20px" :color="$route.path === '/' ? 'white' : 'blue-grey-4'" />
            </q-item-section>
            <q-item-section class="text-weight-semibold" :class="$route.path === '/' ? 'text-white' : 'text-blue-grey-3'">Inicio</q-item-section>
          </q-item>

          <!-- VENTAS -->
          <q-item
            v-if="authStore.isAdmin"
            clickable v-ripple
            :active="$route.path === '/ventas'"
            active-class="menu-active"
            class="menu-item"
            @click="navTo('/ventas')"
          >
            <q-item-section avatar style="min-width:32px;">
              <q-icon name="trending_up" size="20px" :color="$route.path === '/ventas' ? 'white' : 'blue-grey-4'" />
            </q-item-section>
            <q-item-section class="text-weight-semibold" :class="$route.path === '/ventas' ? 'text-white' : 'text-blue-grey-3'">Ventas</q-item-section>
          </q-item>

          <!-- GASTOS -->
          <q-item
            clickable v-ripple
            :active="$route.path === '/gasto'"
            active-class="menu-active"
            class="menu-item"
            @click="navTo('/gasto')"
          >
            <q-item-section avatar style="min-width:32px;">
              <q-icon name="shopping_bag" size="20px" :color="$route.path === '/gasto' ? 'white' : 'blue-grey-4'" />
            </q-item-section>
            <q-item-section class="text-weight-semibold" :class="$route.path === '/gasto' ? 'text-white' : 'text-blue-grey-3'">Gastos</q-item-section>
          </q-item>

          <!-- HISTORIAL -->
          <q-item
            clickable v-ripple
            :active="$route.path === '/historial'"
            active-class="menu-active"
            class="menu-item"
            @click="navTo('/historial')"
          >
            <q-item-section avatar style="min-width:32px;">
              <q-icon name="history" size="20px" :color="$route.path === '/historial' ? 'white' : 'blue-grey-4'" />
            </q-item-section>
            <q-item-section class="text-weight-semibold" :class="$route.path === '/historial' ? 'text-white' : 'text-blue-grey-3'">Historial</q-item-section>
          </q-item>

          <!-- CUENTAS -->
          <q-item
            v-if="authStore.isAdmin"
            clickable v-ripple
            :active="$route.path === '/cuentas'"
            active-class="menu-active"
            class="menu-item"
            @click="navTo('/cuentas')"
          >
            <q-item-section avatar style="min-width:32px;">
              <q-icon name="account_balance_wallet" size="20px" :color="$route.path === '/cuentas' ? 'white' : 'blue-grey-4'" />
            </q-item-section>
            <q-item-section class="text-weight-semibold" :class="$route.path === '/cuentas' ? 'text-white' : 'text-blue-grey-3'">Cuentas</q-item-section>
          </q-item>

          <!-- ADELANTOS -->
          <q-item
            v-if="authStore.isAdmin"
            clickable v-ripple
            :active="$route.path === '/adelantos'"
            active-class="menu-active"
            class="menu-item"
            @click="navTo('/adelantos')"
          >
            <q-item-section avatar style="min-width:32px;">
              <q-icon name="savings" size="20px" :color="$route.path === '/adelantos' ? 'white' : 'blue-grey-4'" />
            </q-item-section>
            <q-item-section class="text-weight-semibold" :class="$route.path === '/adelantos' ? 'text-white' : 'text-blue-grey-3'">Adelantos</q-item-section>
          </q-item>

          <!-- GASTOS FIJOS -->
          <q-item
            v-if="authStore.isAdmin"
            clickable v-ripple
            :active="$route.path === '/gastos-fijos'"
            active-class="menu-active"
            class="menu-item"
            @click="navTo('/gastos-fijos')"
          >
            <q-item-section avatar style="min-width:32px;">
              <q-icon name="event_repeat" size="20px" :color="$route.path === '/gastos-fijos' ? 'white' : 'blue-grey-4'" />
            </q-item-section>
            <q-item-section class="text-weight-semibold" :class="$route.path === '/gastos-fijos' ? 'text-white' : 'text-blue-grey-3'">Gastos Fijos</q-item-section>
          </q-item>

          <!-- Separador: Reportes -->
          <template v-if="authStore.isAdmin">
            <div class="text-caption q-px-sm q-mt-md q-mb-xs text-uppercase" style="color:#475569; font-size:10px; letter-spacing:1px;">Reportes</div>

            <q-item clickable v-ripple :active="$route.path === '/resumen'" active-class="menu-active" class="menu-item" @click="navTo('/resumen')">
              <q-item-section avatar style="min-width:32px;"><q-icon name="pie_chart" size="20px" :color="$route.path === '/resumen' ? 'white' : 'blue-grey-4'" /></q-item-section>
              <q-item-section class="text-weight-semibold" :class="$route.path === '/resumen' ? 'text-white' : 'text-blue-grey-3'">Resumen Mensual</q-item-section>
            </q-item>

            <q-item clickable v-ripple :active="$route.path === '/tendencia'" active-class="menu-active" class="menu-item" @click="navTo('/tendencia')">
              <q-item-section avatar style="min-width:32px;"><q-icon name="show_chart" size="20px" :color="$route.path === '/tendencia' ? 'white' : 'blue-grey-4'" /></q-item-section>
              <q-item-section class="text-weight-semibold" :class="$route.path === '/tendencia' ? 'text-white' : 'text-blue-grey-3'">Tendencia Mensual</q-item-section>
            </q-item>

            <q-item clickable v-ripple :active="$route.path === '/ahorros'" active-class="menu-active" class="menu-item" @click="navTo('/ahorros')">
              <q-item-section avatar style="min-width:32px;"><q-icon name="account_balance_wallet" size="20px" :color="$route.path === '/ahorros' ? 'white' : 'blue-grey-4'" /></q-item-section>
              <q-item-section class="text-weight-semibold" :class="$route.path === '/ahorros' ? 'text-white' : 'text-blue-grey-3'">Mis Ahorros</q-item-section>
            </q-item>

            <!-- Separador: Configuración -->
            <div class="text-caption q-px-sm q-mt-md q-mb-xs text-uppercase" style="color:#475569; font-size:10px; letter-spacing:1px;">Configuración</div>

            <q-item clickable v-ripple :active="$route.path === '/categorias'" active-class="menu-active" class="menu-item" @click="navTo('/categorias')">
              <q-item-section avatar style="min-width:32px;"><q-icon name="label" size="20px" :color="$route.path === '/categorias' ? 'white' : 'blue-grey-4'" /></q-item-section>
              <q-item-section class="text-weight-semibold" :class="$route.path === '/categorias' ? 'text-white' : 'text-blue-grey-3'">Categorías</q-item-section>
            </q-item>

            <q-item clickable v-ripple :active="$route.path === '/transferencia'" active-class="menu-active" class="menu-item" @click="navTo('/transferencia')">
              <q-item-section avatar style="min-width:32px;"><q-icon name="swap_horiz" size="20px" :color="$route.path === '/transferencia' ? 'white' : 'blue-grey-4'" /></q-item-section>
              <q-item-section class="text-weight-semibold" :class="$route.path === '/transferencia' ? 'text-white' : 'text-blue-grey-3'">Transferir Fondos</q-item-section>
            </q-item>

            <q-item clickable v-ripple :active="$route.path === '/usuarios'" active-class="menu-active" class="menu-item" @click="navTo('/usuarios')">
              <q-item-section avatar style="min-width:32px;"><q-icon name="manage_accounts" size="20px" :color="$route.path === '/usuarios' ? 'white' : 'blue-grey-4'" /></q-item-section>
              <q-item-section class="text-weight-semibold" :class="$route.path === '/usuarios' ? 'text-white' : 'text-blue-grey-3'">Usuarios</q-item-section>
            </q-item>

            <q-item clickable v-ripple :active="$route.path === '/configuracion'" active-class="menu-active" class="menu-item" @click="navTo('/configuracion')">
              <q-item-section avatar style="min-width:32px;"><q-icon name="settings" size="20px" :color="$route.path === '/configuracion' ? 'white' : 'blue-grey-4'" /></q-item-section>
              <q-item-section class="text-weight-semibold" :class="$route.path === '/configuracion' ? 'text-white' : 'text-blue-grey-3'">Configuraciones</q-item-section>
            </q-item>
          </template>

          <!-- CIERRE DE TURNO (para empleados) -->
          <q-item
            v-if="!authStore.isAdmin"
            clickable v-ripple
            :active="$route.path === '/recaudo'"
            active-class="menu-active"
            class="menu-item"
            @click="navTo('/recaudo')"
          >
            <q-item-section avatar style="min-width:32px;"><q-icon name="check_circle" size="20px" color="green-5" /></q-item-section>
            <q-item-section class="text-weight-semibold text-blue-grey-3">Cierre de Turno</q-item-section>
          </q-item>
        </q-list>
      </div>

      <!-- BOTÓN CERRAR SESIÓN + BANNER AL FONDO -->
      <div class="q-pa-md" style="border-top: 1px solid #1e293b;">
        <!-- Banner motivacional -->
        <div class="q-pa-sm q-mb-sm text-center" style="background:#1e293b; border-radius:12px;">
          <q-icon name="store" size="22px" color="blue-4" />
          <div class="text-caption q-mt-xs" style="color:#94a3b8; font-size:11px; line-height:1.4;">
            Tu esfuerzo también<br>se ve en los números ❤️
          </div>
        </div>


        <q-item clickable v-ripple class="menu-item text-red-4" @click="handleLogout">
          <q-item-section avatar style="min-width:32px;"><q-icon name="logout" color="red-4" size="20px" /></q-item-section>
          <q-item-section class="text-weight-semibold text-red-4">Cerrar Sesión</q-item-section>
        </q-item>
      </div>
    </q-drawer>

    <!-- AREA DE CONTENIDO -->
    <q-page-container class="q-pa-xs q-pa-sm-md q-pa-md-lg max-content" style="padding-bottom: 70px;">
      <q-page>
        <router-view />
      </q-page>
    </q-page-container>

    <!-- BOTONERA MÓVIL INFERIOR (pantallas < 768px) -->
    <q-footer class="lt-md bg-white text-slate-700 border-t border-slate-200 shadow-md" style="z-index: 1000;">
      <div class="row items-center justify-around q-py-xs">
        <q-btn v-if="authStore.isAdmin" flat dense stack icon="home" label="Inicio" to="/"
          :class="{ 'text-primary text-weight-bolder': $route.path === '/' }"
          style="font-size: 10px; min-width: 50px;" />
        <q-btn flat dense stack icon="shopping_bag" label="Gasto" to="/gasto"
          :class="{ 'text-primary text-weight-bolder': $route.path === '/gasto' }"
          style="font-size: 10px; min-width: 50px;" />
        <q-btn flat dense stack icon="check_circle" label="Cierre" to="/recaudo"
          :class="{ 'text-primary text-weight-bolder': $route.path === '/recaudo' }"
          style="font-size: 10px; min-width: 50px;" />
        <q-btn flat dense stack icon="history" label="Historial" to="/historial"
          :class="{ 'text-primary text-weight-bolder': $route.path === '/historial' }"
          style="font-size: 10px; min-width: 50px;" />
        <q-btn flat dense stack icon="menu" label="Menú" @click="drawer = !drawer"
          style="font-size: 10px; min-width: 50px;" />
      </div>
    </q-footer>

  </q-layout>
</template>

<script setup>
import { ref } from 'vue'
import { useAuthStore } from '@/store/authStore'
import { useConfiguracionStore } from '@/store/configuracionStore'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'

const $q = useQuasar()
const authStore = useAuthStore()
const configStore = useConfiguracionStore()
const router = useRouter()
const drawer = ref($q.screen.gt.sm)

const navTo = (path) => {
  router.push(path)
  if ($q.screen.lt.md) {
    drawer.value = false
  }
}

const handleLogout = () => {
  authStore.logout()
  router.push('/login')
}
</script>

<style lang="scss" scoped>
.max-content {
  max-width: 1400px;
  margin: 0 auto;
}

.menu-item {
  border-radius: 10px;
  color: #94a3b8;
  transition: all 0.15s ease;
  min-height: 42px;
  padding: 6px 10px;
}
.menu-item:hover {
  background-color: #1e293b !important;
  color: #e2e8f0;
}
.menu-active {
  background-color: #1d4ed8 !important;
  color: white !important;
}
</style>
