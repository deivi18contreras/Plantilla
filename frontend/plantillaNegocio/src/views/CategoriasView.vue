<template>
  <div class="row justify-center q-pa-md">
    <div class="card-widget" style="max-width: 520px; width: 100%;">

      <div class="text-h5 text-weight-bolder text-slate-900 q-mb-xs">🏷️ Categorías de Gasto</div>
      <div class="text-caption text-slate-500 q-mb-lg">Administra las categorías que ven los empleados al registrar un gasto</div>

      <!-- CATEGORÍAS ACTIVAS -->
      <div class="text-caption text-weight-bold text-blue-7 text-uppercase q-mb-sm" style="letter-spacing: 1px;">
        Categorías activas
      </div>

      <div class="bg-white q-mb-md" style="border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden;">
        <div
          v-for="(cat, i) in categoriasActivas"
          :key="i"
          class="row items-center q-px-md q-py-sm"
          style="border-bottom: 1px solid #f1f5f9;"
        >
          <!-- Emoji -->
          <div
            class="text-xl q-mr-sm cursor-pointer"
            style="width: 32px; text-align: center; font-size: 22px;"
            @click="abrirEmojiPicker(cat)"
            :title="'Cambiar emoji'"
          >{{ cat.emoji }}</div>

          <!-- Nombre (editable inline) -->
          <q-input
            v-model="cat.nombre"
            dense
            borderless
            class="col"
            style="font-weight: 600;"
          />

          <!-- Borrar -->
          <q-btn flat round icon="delete" color="red-4" size="sm" @click="eliminarCategoria(i)" />
        </div>

        <!-- FILA NUEVA CATEGORÍA -->
        <div class="row items-center q-px-md q-py-sm q-gutter-x-sm">
          <div
            class="text-xl cursor-pointer"
            style="width: 32px; text-align: center; font-size: 22px;"
            @click="nuevaCategoria.emoji = promptEmoji()"
          >{{ nuevaCategoria.emoji }}</div>
          <q-input
            v-model="nuevaCategoria.nombre"
            dense
            borderless
            class="col"
            placeholder="Nueva categoría..."
            @keyup.enter="agregarCategoria"
          />
          <q-btn
            flat no-caps
            icon="add"
            label="Agregar"
            color="primary"
            class="text-weight-bold"
            @click="agregarCategoria"
          />
        </div>
      </div>

      <!-- CATEGORÍAS INACTIVAS -->
      <div v-if="categoriasInactivas.length > 0">
        <div class="text-caption text-weight-bold text-slate-400 text-uppercase q-mb-sm" style="letter-spacing: 1px;">
          Categorías inactivas
        </div>
        <div class="bg-white q-mb-md" style="border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; opacity: 0.7;">
          <div
            v-for="(cat, i) in categoriasInactivas"
            :key="'inact-' + i"
            class="row items-center q-px-md q-py-sm"
            style="border-bottom: 1px solid #f1f5f9;"
          >
            <div class="text-xl q-mr-sm" style="width: 32px; text-align: center; font-size: 22px;">{{ cat.emoji }}</div>
            <span class="col text-slate-400 text-weight-medium">{{ cat.nombre }}</span>
            <q-btn flat no-caps icon="refresh" label="Reactivar" color="positive" size="sm" @click="reactivarCategoria(cat)" />
          </div>
        </div>
      </div>

      <!-- INFO -->
      <div class="q-pa-sm q-mb-lg text-caption text-slate-500" style="background: #f0f9ff; border-radius: 12px; border: 1px solid #bae6fd;">
        💡 Las categorías activas aparecen como chips en el formulario de "Nuevo Gasto". El orden en que aparecen aquí es el mismo en el formulario.
      </div>

      <!-- GUARDAR -->
      <button class="btn-primary-custom" :disabled="guardando" @click="guardar">
        {{ guardando ? 'Guardando...' : '💾 Guardar categorías' }}
      </button>

    </div>
  </div>

  <!-- EMOJI PICKER SIMPLE -->
  <q-dialog v-model="emojiDialog">
    <q-card style="width: 360px; border-radius: 20px;" class="q-pa-md">
      <div class="text-subtitle1 text-weight-bold q-mb-md">Elige un emoji</div>
      <div class="row wrap q-gutter-sm">
        <div
          v-for="e in emojiOpciones"
          :key="e"
          class="cursor-pointer flex items-center justify-center"
          style="width: 44px; height: 44px; font-size: 24px; border-radius: 10px; background: #f8fafc;"
          :style="emojiTarget?.emoji === e ? 'background:#dbeafe; outline: 2px solid #3b82f6;' : ''"
          @click="seleccionarEmoji(e)"
        >{{ e }}</div>
      </div>
      <q-btn flat no-caps label="Cerrar" class="q-mt-md full-width" v-close-popup />
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { useConfiguracionStore } from '@/store/configuracionStore'

const $q = useQuasar()
const configStore = useConfiguracionStore()
const guardando = ref(false)
const emojiDialog = ref(false)
const emojiTarget = ref(null)

// Copia local editable
const categorias = ref([])

const categoriasActivas = computed(() => categorias.value.filter(c => c.activa))
const categoriasInactivas = computed(() => categorias.value.filter(c => !c.activa))

const nuevaCategoria = ref({ nombre: '', emoji: '🏷️' })

const emojiOpciones = [
  '🥩','🥦','☕','🔗','📦','🧴','🍗','🐟','🥚','🥛',
  '🧅','🌽','🍋','🥫','🍞','🧀','🫙','🛒','💊','🔧',
  '🧹','💡','🚗','📱','💰','🏷️','⭐','🎯','📋','🔑'
]

onMounted(async () => {
  await configStore.fetchConfiguracion()
  categorias.value = JSON.parse(JSON.stringify(configStore.categorias))
  if (categorias.value.length === 0) {
    // Valores por defecto si no hay nada
    categorias.value = [
      { nombre: 'Carnes',           emoji: '🥩', activa: true, orden: 0 },
      { nombre: 'Verduras y Frutas',emoji: '🥦', activa: true, orden: 1 },
      { nombre: 'Tintos y Bebidas', emoji: '☕', activa: true, orden: 2 },
      { nombre: 'Cadena',           emoji: '🔗', activa: true, orden: 3 },
      { nombre: 'Pedidos Varios',   emoji: '📦', activa: true, orden: 4 },
      { nombre: 'Aseo y Limpieza',  emoji: '🧴', activa: true, orden: 5 },
    ]
  }
})

const agregarCategoria = () => {
  const nombre = nuevaCategoria.value.nombre.trim()
  if (!nombre) return
  categorias.value.push({
    nombre,
    emoji: nuevaCategoria.value.emoji,
    activa: true,
    orden: categoriasActivas.value.length
  })
  nuevaCategoria.value = { nombre: '', emoji: '🏷️' }
}

const eliminarCategoria = (idxActiva) => {
  const cat = categoriasActivas.value[idxActiva]
  const globalIdx = categorias.value.findIndex(c => c === cat)
  if (globalIdx !== -1) categorias.value[globalIdx].activa = false
}

const reactivarCategoria = (cat) => {
  const globalIdx = categorias.value.findIndex(c => c === cat)
  if (globalIdx !== -1) categorias.value[globalIdx].activa = true
}

const abrirEmojiPicker = (cat) => {
  emojiTarget.value = cat
  emojiDialog.value = true
}

const seleccionarEmoji = (emoji) => {
  if (emojiTarget.value) emojiTarget.value.emoji = emoji
  emojiDialog.value = false
}

const guardar = async () => {
  guardando.value = true
  try {
    // Recalcular orden según posición actual
    const conOrden = categorias.value.map((c, i) => ({ ...c, orden: i }))
    await configStore.guardarConfiguracion({ categorias: conOrden })
    $q.notify({ type: 'positive', message: '✅ Categorías guardadas correctamente' })
  } catch (e) {
    $q.notify({ type: 'negative', message: '❌ Error al guardar categorías' })
  } finally {
    guardando.value = false
  }
}
</script>
