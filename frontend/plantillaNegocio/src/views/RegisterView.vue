<template>
  <div class="flex flex-center min-height-screen bg-slate-100 q-pa-md">

    <!-- CONTENEDOR TARJETA BLANCA (AUTH-CARD) -->
    <div class="auth-card">

      <!-- Header -->
      <div class="text-center q-mb-lg">
        <q-avatar size="56px" color="blue-1" text-color="primary" icon="storefront" class="q-mb-xs" />
        <div class="text-h5 text-weight-bolder text-slate-900">
          Crear <span class="text-primary">Cuenta</span>
        </div>
        <div class="text-slate-500 text-caption">Registro de cuenta de empleado</div>
      </div>

      <!-- Formulario -->
      <q-form @submit="handleSubmit" class="column q-gutter-y-md">

        <div>
          <div class="text-caption text-weight-bold text-slate-700 q-mb-xs">Nombre completo</div>
          <q-input
            v-model="form.nombre"
            placeholder="Nombre completo"
            borderless
            class="clean-input"
            :rules="[val => !!val || 'El nombre es obligatorio']"
          />
        </div>

        <div>
          <div class="text-caption text-weight-bold text-slate-700 q-mb-xs">Correo electrónico</div>
          <q-input
            v-model="form.email"
            type="email"
            placeholder="correo@ejemplo.com"
            borderless
            class="clean-input"
            :rules="[val => !!val || 'El correo es obligatorio']"
          />
        </div>

        <div>
          <div class="text-caption text-weight-bold text-slate-700 q-mb-xs">Contraseña</div>
          <q-input
            v-model="form.password"
            :type="showPass ? 'text' : 'password'"
            placeholder="••••••••"
            borderless
            class="clean-input"
            :rules="[val => !!val && val.length >= 6 || 'Mínimo 6 caracteres']"
          >
            <template v-slot:append>
              <q-icon
                :name="showPass ? 'visibility_off' : 'visibility'"
                class="cursor-pointer text-slate-400"
                @click="showPass = !showPass"
              />
            </template>
          </q-input>
        </div>

        <div>
          <div class="text-caption text-weight-bold text-slate-700 q-mb-xs">Confirmar contraseña</div>
          <q-input
            v-model="form.confirmar"
            :type="showPass ? 'text' : 'password'"
            placeholder="••••••••"
            borderless
            class="clean-input"
            :rules="[val => val === form.password || 'Las contraseñas no coinciden']"
          />
        </div>

        <div class="q-mt-lg">
          <button type="submit" class="btn-primary-custom" :disabled="loading">
            <span>{{ loading ? 'Creando cuenta...' : 'Crear Cuenta' }}</span>
          </button>
        </div>

      </q-form>

      <!-- Error Banner -->
      <div v-if="errorMsg" class="q-mt-md">
        <q-banner dense rounded class="bg-red-50 text-red-7 text-weight-bold">
          <template v-slot:avatar><q-icon name="error_outline" color="negative" /></template>
          {{ errorMsg }}
        </q-banner>
      </div>

      <!-- Link a Login -->
      <div class="text-center q-mt-lg text-caption text-slate-500">
        ¿Ya tienes cuenta?
        <router-link to="/login" class="text-primary text-weight-bold" style="text-decoration: none;">
          Iniciar sesión
        </router-link>
      </div>

    </div>

  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useQuasar } from 'quasar'
import { postData } from '@/services/apiService'
import { useAuthStore } from '@/store/authStore'
import { useRouter } from 'vue-router'

const $q = useQuasar()
const router = useRouter()
const authStore = useAuthStore()

const showPass = ref(false)
const loading = ref(false)
const errorMsg = ref('')

const form = ref({
  nombre: '',
  email: '',
  password: '',
  confirmar: ''
})

const handleSubmit = async () => {
  errorMsg.value = ''
  loading.value = true
  try {
    const data = await postData('/auth/registro', {
      nombre: form.value.nombre,
      email: form.value.email,
      password: form.value.password
    })

    authStore.token = data.token
    authStore.user = data.usuario
    localStorage.setItem('token', data.token)
    localStorage.setItem('user', JSON.stringify(data.usuario))

    $q.notify({
      type: 'positive',
      message: `✅ ¡Cuenta creada exitosamente! Bienvenido, ${data.usuario.nombre}`,
      timeout: 2000,
      position: 'top'
    })

    setTimeout(() => {
      // Si es empleado va a Cierre de Turno, si es Admin va al Dashboard
      if (data.usuario.rol === 'admin') {
        router.push('/')
      } else {
        router.push('/recaudo')
      }
    }, 1500)

  } catch (error) {
    errorMsg.value = error.response?.data?.mensaje || '❌ Error al registrar usuario'
  } finally {
    loading.value = false
  }
}
</script>

<style lang="scss" scoped>
.min-height-screen {
  min-height: 100vh;
}
</style>
