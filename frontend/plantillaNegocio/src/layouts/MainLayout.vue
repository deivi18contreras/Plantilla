<template>
  <q-layout view="hHh lpR fFf" class="bg-slate-100">

    <!-- TOOLBAR MÓVIL SUPERIOR (pantallas < 768px) -->
    <q-header class="lt-md bg-white text-slate-900 border-b border-slate-200" height-hint="56">
      <q-toolbar class="q-px-sm">
        <q-btn flat dense round icon="menu" color="primary" @click="drawer = !drawer" aria-label="Menu" />
        <q-avatar size="30px" color="blue-6" text-color="white" icon="trending_up" class="q-ml-xs q-mr-sm" />
        <q-toolbar-title class="text-weight-bolder text-slate-900" style="font-size: 16px;">
          Control Financiero
        </q-toolbar-title>
        <q-btn flat round icon="logout" color="red-6" size="sm" @click="handleLogout" title="Cerrar sesión" />
      </q-toolbar>
    </q-header>

    <!-- DRAWER LATERAL (ESCRITORIO + MÓVIL DESLIZABLE) -->
    <q-drawer
      v-model="drawer"
      :show-if-above="false"
      :width="260"
      :breakpoint="768"
      bordered
      class="bg-white column justify-between"
    >
      <div class="q-pa-md">
        <!-- Logo & Header del Menú -->
        <div class="row items-center q-gutter-x-sm q-mb-lg">
          <q-avatar size="36px" color="blue-6" text-color="white" icon="trending_up" class="shadow-sm" />
          <div>
            <div class="text-weight-bolder text-slate-900" style="font-size: 15px;">Finanzas Negocio</div>
            <div class="text-caption text-slate-500" style="font-size: 11px;">{{ authStore.nombreUsuario }} ({{ authStore.user?.rol }})</div>
          </div>
        </div>

        <q-list class="q-gutter-y-xs">
          <!-- SOLO ADMIN: INICIO -->
          <q-item
            v-if="authStore.isAdmin"
            clickable
            v-ripple
            :active="$route.path === '/'"
            active-class="menu-item-active"
            class="menu-item-custom"
            @click="navTo('/')"
          >
            <q-item-section avatar min-width="36px">
              <q-icon name="home" size="22px" />
            </q-item-section>
            <q-item-section class="text-weight-bold">Inicio (Dashboard)</q-item-section>
          </q-item>

          <!-- CIERRE DE TURNO -->
          <q-item
            clickable
            v-ripple
            :active="$route.path === '/recaudo'"
            active-class="menu-item-active"
            class="menu-item-custom"
            @click="navTo('/recaudo')"
          >
            <q-item-section avatar min-width="36px">
              <q-icon name="add_circle" size="22px" color="positive" />
            </q-item-section>
            <q-item-section class="text-weight-bold">Cierre de Turno</q-item-section>
          </q-item>

          <!-- NUEVO GASTO -->
          <q-item
            clickable
            v-ripple
            :active="$route.path === '/gasto'"
            active-class="menu-item-active"
            class="menu-item-custom"
            @click="navTo('/gasto')"
          >
            <q-item-section avatar min-width="36px">
              <q-icon name="remove_circle" size="22px" color="negative" />
            </q-item-section>
            <q-item-section class="text-weight-bold">Nuevo Gasto</q-item-section>
          </q-item>

          <!-- HISTORIAL -->
          <q-item
            clickable
            v-ripple
            :active="$route.path === '/historial'"
            active-class="menu-item-active"
            class="menu-item-custom"
            @click="navTo('/historial')"
          >
            <q-item-section avatar min-width="36px">
              <q-icon name="history" size="22px" />
            </q-item-section>
            <q-item-section class="text-weight-bold">Historial</q-item-section>
          </q-item>

          <!-- SECCIÓN SOLO ADMIN -->
          <template v-if="authStore.isAdmin">
            <q-separator class="q-my-sm" />
            <div class="text-caption text-weight-bold text-slate-400 text-uppercase q-px-sm q-mb-xs" style="font-size: 10px; letter-spacing: 1px;">
              Administración
            </div>

            <!-- TRANSFERIR -->
            <q-item
              clickable
              v-ripple
              :active="$route.path === '/transferencia'"
              active-class="menu-item-active"
              class="menu-item-custom"
              @click="navTo('/transferencia')"
            >
              <q-item-section avatar min-width="36px">
                <q-icon name="swap_horiz" size="22px" />
              </q-item-section>
              <q-item-section class="text-weight-bold">Transferir Fondos</q-item-section>
            </q-item>

            <!-- RESUMEN MENSUAL -->
            <q-item
              clickable
              v-ripple
              :active="$route.path === '/resumen'"
              active-class="menu-item-active"
              class="menu-item-custom"
              @click="navTo('/resumen')"
            >
              <q-item-section avatar min-width="36px">
                <q-icon name="pie_chart" size="22px" color="blue-7" />
              </q-item-section>
              <q-item-section class="text-weight-bold">Resumen del Mes</q-item-section>
            </q-item>

            <!-- CATEGORÍAS -->
            <q-item
              clickable
              v-ripple
              :active="$route.path === '/categorias'"
              active-class="menu-item-active"
              class="menu-item-custom"
              @click="navTo('/categorias')"
            >
              <q-item-section avatar min-width="36px">
                <q-icon name="label" size="22px" color="purple-6" />
              </q-item-section>
              <q-item-section class="text-weight-bold">Categorías de Gasto</q-item-section>
            </q-item>

            <!-- USUARIOS -->
            <q-item
              clickable
              v-ripple
              :active="$route.path === '/usuarios'"
              active-class="menu-item-active"
              class="menu-item-custom"
              @click="navTo('/usuarios')"
            >
              <q-item-section avatar min-width="36px">
                <q-icon name="manage_accounts" size="22px" />
              </q-item-section>
              <q-item-section class="text-weight-bold">Gestionar Usuarios</q-item-section>
            </q-item>

            <!-- CONFIGURACIONES -->
            <q-item
              clickable
              v-ripple
              :active="$route.path === '/configuracion'"
              active-class="menu-item-active"
              class="menu-item-custom"
              @click="navTo('/configuracion')"
            >
              <q-item-section avatar min-width="36px">
                <q-icon name="settings" size="22px" />
              </q-item-section>
              <q-item-section class="text-weight-bold">Configuraciones</q-item-section>
            </q-item>

            <!-- ADELANTOS INTERNOS -->
            <q-item
              clickable
              v-ripple
              :active="$route.path === '/adelantos'"
              active-class="menu-item-active"
              class="menu-item-custom"
              @click="navTo('/adelantos')"
            >
              <q-item-section avatar min-width="36px">
                <q-icon name="savings" size="22px" color="red-6" />
              </q-item-section>
              <q-item-section class="text-weight-bold">Adelantos Internos</q-item-section>
            </q-item>

            <!-- GASTOS FIJOS -->
            <q-item
              clickable
              v-ripple
              :active="$route.path === '/gastos-fijos'"
              active-class="menu-item-active"
              class="menu-item-custom"
              @click="navTo('/gastos-fijos')"
            >
              <q-item-section avatar min-width="36px">
                <q-icon name="event_repeat" size="22px" color="orange-7" />
              </q-item-section>
              <q-item-section class="text-weight-bold">Gastos Fijos</q-item-section>
            </q-item>
          </template>
        </q-list>
      </div>

      <!-- BOTÓN CERRAR SESIÓN AL FONDO -->
      <div class="q-pa-md border-t border-slate-200">
        <q-item clickable v-ripple class="menu-item-custom text-red-6" @click="handleLogout">
          <q-item-section avatar min-width="36px">
            <q-icon name="logout" color="red-6" size="22px" />
          </q-item-section>
          <q-item-section class="text-weight-bold">Cerrar Sesión</q-item-section>
        </q-item>
      </div>
    </q-drawer>

    <!-- AREA DE CONTENIDO -->
    <q-page-container class="q-pa-xs q-pa-sm-md q-pa-md-lg max-content" style="padding-bottom: 70px;">
      <q-page>
        <router-view />
      </q-page>
    </q-page-container>

    <!-- BOTONERA MÓVIL INFERIOR COMPACTA (pantallas < 768px) -->
    <q-footer class="lt-md bg-white text-slate-700 border-t border-slate-200 shadow-md" style="z-index: 1000;">
      <div class="row items-center justify-around q-py-xs">
        <q-btn
          v-if="authStore.isAdmin"
          flat dense stack
          icon="home"
          label="Inicio"
          to="/"
          :class="{ 'text-primary text-weight-bolder': $route.path === '/' }"
          style="font-size: 10px; min-width: 50px;"
        />
        <q-btn
          flat dense stack
          icon="add_circle"
          label="Cierre"
          to="/recaudo"
          :class="{ 'text-primary text-weight-bolder': $route.path === '/recaudo' }"
          style="font-size: 10px; min-width: 50px;"
        />
        <q-btn
          flat dense stack
          icon="remove_circle"
          label="Gasto"
          to="/gasto"
          :class="{ 'text-primary text-weight-bolder': $route.path === '/gasto' }"
          style="font-size: 10px; min-width: 50px;"
        />
        <q-btn
          flat dense stack
          icon="history"
          label="Historial"
          to="/historial"
          :class="{ 'text-primary text-weight-bolder': $route.path === '/historial' }"
          style="font-size: 10px; min-width: 50px;"
        />
        <q-btn
          flat dense stack
          icon="menu"
          label="Menú"
          @click="drawer = !drawer"
          style="font-size: 10px; min-width: 50px;"
        />
      </div>
    </q-footer>

  </q-layout>
</template>

<script setup>
import { ref } from 'vue'
import { useAuthStore } from '@/store/authStore'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'

const $q = useQuasar()
const authStore = useAuthStore()
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

.menu-item-custom {
  border-radius: 12px;
  color: #475569;
  transition: all 0.15s ease;
  min-height: 44px;
}
.menu-item-custom:hover {
  background-color: #f1f5f9;
  color: #0f172a;
}
.menu-item-active {
  background-color: #dbeafe !important;
  color: #1d4ed8 !important;
}
</style>

