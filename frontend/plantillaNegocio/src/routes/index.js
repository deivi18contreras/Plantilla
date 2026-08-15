import { createRouter, createWebHashHistory } from 'vue-router'
import { useAuthStore } from '@/store/authStore'

const routes = [
  {
    path: '/login',
    name: 'login',
    component: () => import('@/views/LoginView.vue'),
    meta: { guest: true }
  },
  {
    path: '/registro',
    name: 'registro',
    component: () => import('@/views/RegisterView.vue'),
    meta: { guest: true }
  },
  {
    path: '/',
    component: () => import('@/layouts/MainLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        name: 'inicio',
        component: () => import('@/views/InicioView.vue'),
        meta: { requiresAdmin: true } // El Dashboard con saldos totales es SOLO para Admin
      },
      {
        path: 'gasto',
        name: 'gasto',
        component: () => import('@/views/GastoView.vue')
      },
      {
        path: 'recaudo',
        name: 'recaudo',
        component: () => import('@/views/RecaudoView.vue')
      },
      {
        path: 'transferencia',
        name: 'transferencia',
        component: () => import('@/views/TransferenciaView.vue'),
        meta: { requiresAdmin: true }
      },
      {
        path: 'historial',
        name: 'historial',
        component: () => import('@/views/HistorialView.vue')
      },
      {
        path: 'resumen',
        name: 'resumen',
        component: () => import('@/views/ResumenView.vue'),
        meta: { requiresAdmin: true }
      },
      {
        path: 'usuarios',
        name: 'usuarios',
        component: () => import('@/views/UsuariosView.vue'),
        meta: { requiresAdmin: true }
      },
      {
        path: 'configuracion',
        name: 'configuracion',
        component: () => import('@/views/ConfiguracionView.vue'),
        meta: { requiresAdmin: true }
      },
      {
        path: 'categorias',
        name: 'categorias',
        component: () => import('@/views/CategoriasView.vue'),
        meta: { requiresAdmin: true }
      }
    ]
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

// Guard de navegación
router.beforeEach((to) => {
  const authStore = useAuthStore()

  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    return '/login'
  }

  if (to.meta.guest && authStore.isAuthenticated) {
    return authStore.isAdmin ? '/' : '/recaudo'
  }

  // Si un empleado intenta entrar a una ruta de Admin (ej: /, /transferencia, /resumen), lo redirige a Cierre de Turno
  if (to.meta.requiresAdmin && !authStore.isAdmin) {
    return '/recaudo'
  }
})

export default router
