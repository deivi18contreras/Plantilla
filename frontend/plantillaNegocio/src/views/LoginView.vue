<template>
  <div class="flex flex-center min-height-screen bg-slate-100 q-pa-md">

    <!-- CONTENEDOR TARJETA BLANCA (AUTH-CARD) -->
    <div class="auth-card">

      <!-- Header -->
      <div class="text-center q-mb-lg">
        <q-avatar size="56px" color="blue-1" text-color="primary" icon="storefront" class="q-mb-xs" />
        <div class="text-h5 text-weight-bolder text-slate-900">
          Polleria Lb
        </div>
        <div class="text-slate-500 text-caption">Control financiero diario</div>
      </div>

      <!-- Formulario -->
      <q-form @submit="handleSubmit" class="column q-gutter-y-md">

        <div>
          <div class="text-caption text-weight-bold text-slate-700 q-mb-xs">Correo electrónico</div>
          <q-input v-model="email" type="email" borderless class="clean-input"
            :rules="[val => !!val || 'El correo es obligatorio']" />
        </div>

        <div>
          <div class="text-caption text-weight-bold text-slate-700 q-mb-xs">Contraseña</div>
          <q-input v-model="password" :type="showPass ? 'text' : 'password'"  borderless
            class="clean-input" :rules="[val => !!val || 'La contraseña es obligatoria']">
            <template v-slot:append>
              <q-icon :name="showPass ? 'visibility_off' : 'visibility'" class="cursor-pointer text-slate-400"
                @click="showPass = !showPass" />
            </template>
          </q-input>
        </div>

        <div class="q-mt-lg">
          <button type="submit" class="btn-primary-custom" :disabled="authStore.loading">
            <span>{{ authStore.loading ? 'Iniciando...' : 'Iniciar Sesión' }}</span>
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

      <!-- Link a Registro -->
      <div class="text-center q-mt-lg text-caption text-slate-500">
        ¿No tienes cuenta?
        <router-link to="/registro" class="text-primary text-weight-bold" style="text-decoration: none;">
          Crear cuenta
        </router-link>
      </div>

    </div>

  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useAuthStore } from '@/store/authStore'
import { useRouter } from 'vue-router'

const authStore = useAuthStore()
const router = useRouter()

const email = ref('')
const password = ref('')
const showPass = ref(false)
const errorMsg = ref('')

const handleSubmit = async () => {
  errorMsg.value = ''
  const result = await authStore.login(email.value, password.value)
  if (result.success) {
    router.push('/')
  } else {
    errorMsg.value = result.message
  }
}
</script>

<style lang="scss" scoped>
.min-height-screen {
  min-height: 100vh;
}
</style>
