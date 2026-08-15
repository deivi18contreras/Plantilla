<template>
  <div class="row justify-center q-pa-md">
    <div class="card-widget" style="max-width: 640px; width: 100%;">

      <div class="text-h5 text-weight-bolder text-slate-900 q-mb-xs">Gestión de Usuarios</div>
      <div class="text-caption text-slate-500 q-mb-lg">Administra los roles y el acceso de tu equipo</div>

      <!-- Estado de carga -->
      <div v-if="cargando" class="column items-center q-py-xl">
        <q-spinner color="primary" size="36px" />
      </div>

      <q-list v-else separator>
        <q-item
          v-for="usuario in usuarios"
          :key="usuario._id"
          class="q-px-none q-py-md"
        >
          <q-item-section avatar>
            <q-avatar
              size="42px"
              :color="usuario.activo ? 'blue-1' : 'grey-3'"
              :text-color="usuario.activo ? 'blue-8' : 'grey-6'"
              class="text-weight-bold"
            >
              {{ usuario.nombre.charAt(0).toUpperCase() }}
            </q-avatar>
          </q-item-section>

          <q-item-section>
            <q-item-label class="text-weight-bold text-slate-900" :class="{ 'text-grey-5': !usuario.activo }">
              {{ usuario.nombre }}
              <q-badge v-if="usuario._id === authStore.user?._id" color="blue-2" text-color="blue-8" label="Tú" class="q-ml-xs" />
            </q-item-label>
            <q-item-label caption class="text-slate-500">{{ usuario.email }}</q-item-label>
            <q-item-label caption>
              <q-badge
                :color="usuario.rol === 'admin' ? 'blue-7' : 'grey-5'"
                :label="usuario.rol === 'admin' ? 'Admin' : 'Empleado'"
                class="text-weight-bold"
              />
              <q-badge
                v-if="!usuario.activo"
                color="red-2"
                text-color="red-8"
                label="Desactivado"
                class="q-ml-xs text-weight-bold"
              />
            </q-item-label>
          </q-item-section>

          <!-- Acciones (no aplican a uno mismo) -->
          <q-item-section side v-if="usuario._id !== authStore.user?._id">
            <div class="column q-gutter-y-xs">

              <!-- Botón cambiar rol -->
              <q-btn
                flat
                no-caps
                dense
                size="sm"
                :color="usuario.rol === 'admin' ? 'orange-7' : 'blue-7'"
                :label="usuario.rol === 'admin' ? 'Bajar a Empleado' : 'Subir a Admin'"
                :icon="usuario.rol === 'admin' ? 'arrow_downward' : 'arrow_upward'"
                style="border-radius: 10px; font-size: 11px;"
                @click="cambiarRol(usuario)"
              />

              <!-- Botón activar/desactivar -->
              <q-btn
                flat
                no-caps
                dense
                size="sm"
                :color="usuario.activo ? 'red-6' : 'green-7'"
                :label="usuario.activo ? 'Desactivar' : 'Activar'"
                :icon="usuario.activo ? 'block' : 'check_circle'"
                style="border-radius: 10px; font-size: 11px;"
                @click="toggleActivo(usuario)"
              />

            </div>
          </q-item-section>
        </q-item>
      </q-list>

    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { getData, putData } from '@/services/apiService'
import { useAuthStore } from '@/store/authStore'

const $q = useQuasar()
const authStore = useAuthStore()

const cargando = ref(false)
const usuarios = ref([])

const cargarUsuarios = async () => {
  cargando.value = true
  try {
    usuarios.value = await getData('/usuarios')
  } catch (error) {
    $q.notify({ type: 'negative', message: '❌ Error al cargar usuarios' })
  } finally {
    cargando.value = false
  }
}

const cambiarRol = async (usuario) => {
  const nuevoRol = usuario.rol === 'admin' ? 'empleado' : 'admin'
  $q.dialog({
    title: 'Confirmar cambio de rol',
    message: `¿Cambiar a <strong>${usuario.nombre}</strong> de <em>${usuario.rol}</em> a <em>${nuevoRol}</em>?`,
    html: true,
    cancel: true,
    persistent: true
  }).onOk(async () => {
    try {
      await putData(`/usuarios/${usuario._id}/rol`, { rol: nuevoRol })
      $q.notify({ type: 'positive', message: `✅ Rol de ${usuario.nombre} cambiado a ${nuevoRol}` })
      await cargarUsuarios()
    } catch (error) {
      $q.notify({ type: 'negative', message: error.response?.data?.mensaje || '❌ Error al cambiar rol' })
    }
  })
}

const toggleActivo = async (usuario) => {
  const accion = usuario.activo ? 'desactivar' : 'activar'
  $q.dialog({
    title: `Confirmar ${accion}`,
    message: `¿Deseas ${accion} la cuenta de <strong>${usuario.nombre}</strong>?`,
    html: true,
    cancel: true,
    persistent: true
  }).onOk(async () => {
    try {
      await putData(`/usuarios/${usuario._id}/activo`, {})
      $q.notify({ type: 'positive', message: `✅ Cuenta de ${usuario.nombre} ${accion === 'activar' ? 'activada' : 'desactivada'}` })
      await cargarUsuarios()
    } catch (error) {
      $q.notify({ type: 'negative', message: error.response?.data?.mensaje || '❌ Error al cambiar estado' })
    }
  })
}

onMounted(cargarUsuarios)
</script>
