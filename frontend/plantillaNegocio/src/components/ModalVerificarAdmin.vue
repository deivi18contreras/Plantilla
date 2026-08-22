<template>
  <q-dialog :model-value="modelValue" @update:model-value="$emit('update:modelValue', $event)">
    <q-card style="width: 400px; max-width: 95vw; border-radius: 24px;" class="q-pa-md">
      <q-card-section class="row items-center justify-between q-pb-none">
        <div class="row items-center q-gutter-x-sm">
          <q-avatar size="36px" color="blue-1" text-color="blue-9" icon="lock" />
          <div class="text-subtitle1 text-weight-bolder text-slate-900">Autorización Requerida</div>
        </div>
        <q-btn flat round icon="close" size="sm" @click="cerrar" />
      </q-card-section>

      <q-card-section class="q-pt-sm">
        <div class="text-caption text-slate-600 q-mb-md">
          Para editar este Cierre Diario, ingresa tu contraseña de <strong>Administrador</strong>:
        </div>

        <q-input
          v-model="password"
          :type="mostrarPassword ? 'text' : 'password'"
          placeholder="Tu contraseña de admin"
          outlined
          dense
          autofocus
          class="q-mb-sm"
          style="border-radius: 12px;"
          @keyup.enter="verificar"
        >
          <template #append>
            <q-icon
              :name="mostrarPassword ? 'visibility_off' : 'visibility'"
              class="cursor-pointer"
              @click="mostrarPassword = !mostrarPassword"
            />
          </template>
        </q-input>

        <div v-if="errorMsg" class="text-caption text-red-6 text-weight-bold q-mb-sm">
          {{ errorMsg }}
        </div>
      </q-card-section>

      <q-card-actions class="row justify-end q-gutter-x-sm q-pt-none">
        <q-btn
          flat
          no-caps
          label="Cancelar"
          color="grey-7"
          @click="cerrar"
        />
        <q-btn
          color="primary"
          no-caps
          label="Verificar y Continuar"
          class="text-weight-bold"
          style="border-radius: 12px; padding: 6px 18px;"
          :loading="cargando"
          @click="verificar"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref } from 'vue'
import { postData } from '@/services/apiService'

defineProps({
  modelValue: Boolean
})

const emit = defineEmits(['update:modelValue', 'autorizado'])

const password = ref('')
const mostrarPassword = ref(false)
const cargando = ref(false)
const errorMsg = ref('')

const cerrar = () => {
  password.value = ''
  errorMsg.value = ''
  emit('update:modelValue', false)
}

const verificar = async () => {
  if (!password.value) {
    errorMsg.value = 'Ingresa tu contraseña'
    return
  }

  cargando.value = true
  errorMsg.value = ''

  try {
    const res = await postData('/auth/verificar-password', { password: password.value })
    if (res.autorizado) {
      emit('autorizado')
      cerrar()
    }
  } catch (error) {
    errorMsg.value = error.response?.data?.mensaje || '❌ Contraseña incorrecta'
  } finally {
    cargando.value = false
  }
}
</script>
