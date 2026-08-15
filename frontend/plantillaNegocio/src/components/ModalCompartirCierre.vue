<template>
  <q-dialog :model-value="modelValue" @update:model-value="$emit('update:modelValue', $event)" persistent>
    <q-card style="width: 480px; max-width: 95vw; border-radius: 24px;" class="q-pa-md">
      <q-card-section class="row items-center justify-between q-pb-xs">
        <div class="text-h6 text-weight-bolder text-slate-900">{{ titulo || '📤 Compartir Cierre' }}</div>
        <q-btn flat round icon="close" @click="handleCerrar" />
      </q-card-section>

      <q-card-section>
        <!-- Preview estilo mensaje -->
        <div
          class="q-pa-md q-mb-md"
          style="background: #dcfce7; border-radius: 16px; font-family: monospace; font-size: 13px; line-height: 1.7; white-space: pre-wrap; word-break: break-word;"
        >
          {{ texto }}
        </div>

        <div class="column q-gutter-y-sm">
          <q-btn
            color="positive"
            icon="chat"
            label="Enviar por WhatsApp"
            no-caps
            class="text-weight-bold"
            style="border-radius: 12px;"
            @click="abrirWhatsApp"
          />
          <q-btn
            outline
            color="primary"
            icon="content_copy"
            label="Copiar al portapapeles"
            no-caps
            class="text-weight-bold"
            style="border-radius: 12px;"
            @click="copiarTexto"
          />
          <q-btn
            v-if="mostrarContinuar"
            flat
            no-caps
            label="Continuar sin compartir"
            class="text-slate-500"
            @click="handleCerrar"
          />
        </div>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { useQuasar } from 'quasar'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  texto: {
    type: String,
    default: ''
  },
  titulo: {
    type: String,
    default: '📤 Compartir Cierre'
  },
  mostrarContinuar: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue', 'cerrar'])
const $q = useQuasar()

const abrirWhatsApp = () => {
  if (!props.texto) return
  const url = `https://wa.me/?text=${encodeURIComponent(props.texto)}`
  window.open(url, '_blank')
}

const copiarTexto = () => {
  if (!props.texto) return
  navigator.clipboard.writeText(props.texto).then(() => {
    $q.notify({ type: 'positive', message: '✅ Texto copiado al portapapeles' })
  })
}

const handleCerrar = () => {
  emit('update:modelValue', false)
  emit('cerrar')
}
</script>
