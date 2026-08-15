<template>
  <q-layout view="lHh Lpr lFf" class="bg-slate-100">

    <!-- TOOLBAR MÓVIL SUPERIOR -->
    <q-header class="xs bg-white text-slate-900 border-b border-slate-200">
      <q-toolbar>
        <q-avatar size="32px" color="blue-6" text-color="white" icon="trending_up" class="q-mr-sm" />
        <q-toolbar-title class="text-weight-bolder text-slate-900">Control Financiero</q-toolbar-title>

        <q-btn flat round icon="logout" color="red-6" size="sm" @click="handleLogout" title="Cerrar sesión" />
      </q-toolbar>
    </q-header>

    <!-- SIDEBAR VERTICAL ESCRITORIO (IMAGEN 1 EXACTA) -->
    <q-drawer
      v-model="drawer"
      show-if-above
      :width="80"
      :breakpoint="600"
      class="bg-white border-r border-slate-200 column items-center q-py-md justify-between"
    >
      <div class="column items-center q-gutter-y-md">
        <!-- Logo App (Boton Azul) -->
        <div class="sidebar-btn bg-blue-6 text-white shadow-md" @click="$router.push(authStore.isAdmin ? '/' : '/recaudo')">
          <q-icon name="trending_up" size="26px" color="white" />
        </div>

        <!-- SOLO ADMIN VE EL DASHBOARD INICIO -->
        <div
          v-if="authStore.isAdmin"
          class="sidebar-btn"
          :class="{ active: $route.path === '/' }"
          @click="$router.push('/')"
          title="Inicio (Dashboard)"
        >
          <q-icon name="home" size="24px" />
        </div>

        <!-- CIERRE Y GASTO -->
        <div
          class="sidebar-btn"
          :class="{ active: $route.path === '/recaudo' }"
          @click="$router.push('/recaudo')"
          title="Cierre de Turno"
        >
          <q-icon name="add_circle_outline" size="24px" />
        </div>

        <div
          class="sidebar-btn"
          :class="{ active: $route.path === '/gasto' }"
          @click="$router.push('/gasto')"
          title="Nuevo Gasto"
        >
          <q-icon name="remove_circle_outline" size="24px" />
        </div>

        <!-- SOLO ADMIN VE TRANSFERIR -->
        <div
          v-if="authStore.isAdmin"
          class="sidebar-btn"
          :class="{ active: $route.path === '/transferencia' }"
          @click="$router.push('/transferencia')"
          title="Transferir entre cuentas"
        >
          <q-icon name="swap_horiz" size="24px" />
        </div>

        <!-- HISTORIAL -->
        <div
          class="sidebar-btn"
          :class="{ active: $route.path === '/historial' }"
          @click="$router.push('/historial')"
          title="Historial"
        >
          <q-icon name="history" size="24px" />
        </div>

        <!-- SOLO ADMIN VE RESUMEN MENSUAL -->
        <div
          v-if="authStore.isAdmin"
          class="sidebar-btn"
          :class="{ active: $route.path === '/resumen' }"
          @click="$router.push('/resumen')"
          title="Resumen del mes"
        >
          <q-icon name="pie_chart" size="24px" />
        </div>

        <!-- SOLO ADMIN VE GESTIÓN DE USUARIOS -->
        <div
          v-if="authStore.isAdmin"
          class="sidebar-btn"
          :class="{ active: $route.path === '/usuarios' }"
          @click="$router.push('/usuarios')"
          title="Gestionar usuarios"
        >
          <q-icon name="manage_accounts" size="24px" />
        </div>
      </div>

      <!-- ICONOS INFERIORES DEL SIDEBAR -->
      <div class="column items-center q-gutter-y-sm">
        <!-- CONFIGURACIÓN: Solo Admin -->
        <div
          v-if="authStore.isAdmin"
          class="sidebar-btn"
          :class="{ active: $route.path === '/configuracion' }"
          @click="$router.push('/configuracion')"
          title="Configuraciones"
        >
          <q-icon name="settings" size="24px" />
        </div>
        <!-- CERRAR SESIÓN -->
        <div class="sidebar-btn" @click="handleLogout" title="Cerrar sesión">
          <q-icon name="logout" size="24px" color="red-4" />
        </div>
      </div>
    </q-drawer>

    <!-- AREA DE CONTENIDO -->
    <q-page-container class="q-pa-sm q-pa-md-lg max-content">
      <q-page>
        <router-view />
      </q-page>
    </q-page-container>

    <!-- BOTONERA MÓVIL INFERIOR -->
    <q-footer class="xs bg-white text-slate-900 border-t border-slate-200">
      <div class="row items-center justify-around q-py-xs">
        <q-btn v-if="authStore.isAdmin" flat dense icon="home" label="Inicio" to="/" :class="{ 'text-blue-6': $route.path === '/' }" />
        <q-btn flat dense icon="add_circle" label="Cierre" to="/recaudo" :class="{ 'text-blue-6': $route.path === '/recaudo' }" />
        <q-btn flat dense icon="remove_circle" label="Gasto" to="/gasto" :class="{ 'text-blue-6': $route.path === '/gasto' }" />
        <q-btn v-if="authStore.isAdmin" flat dense icon="swap_horiz" label="Traslado" to="/transferencia" :class="{ 'text-blue-6': $route.path === '/transferencia' }" />
        <q-btn flat dense icon="history" label="Historial" to="/historial" :class="{ 'text-blue-6': $route.path === '/historial' }" />
      </div>
    </q-footer>

  </q-layout>
</template>

<script setup>
import { ref } from 'vue'
import { useAuthStore } from '@/store/authStore'
import { useRouter } from 'vue-router'

const authStore = useAuthStore()
const router = useRouter()
const drawer = ref(true)

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
</style>
