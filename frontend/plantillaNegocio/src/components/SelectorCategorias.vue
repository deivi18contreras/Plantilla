<template>
  <div>
    <div v-if="categorias && categorias.length > 0" class="chips-grid">
      <div
        v-for="cat in categorias"
        :key="cat.nombre"
        class="categoria-chip"
        :class="{ active: modelValue === cat.nombre }"
        @click="$emit('update:modelValue', cat.nombre)"
      >
        <span style="font-size: 16px;">{{ cat.emoji }}</span>
        <span>{{ cat.nombre }}</span>
      </div>
    </div>

    <!-- Fallback si no hay categorías configuradas -->
    <q-input
      v-else
      :model-value="modelValue"
      @update:model-value="$emit('update:modelValue', $event)"
      placeholder="Categoría"
      borderless
      class="clean-input"
    />
  </div>
</template>

<script setup>
defineProps({
  modelValue: { type: String, default: '' },
  categorias: { type: Array, default: () => [] }
})

defineEmits(['update:modelValue'])
</script>

<style scoped>
.chips-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
}
@media (min-width: 480px) {
  .chips-grid { grid-template-columns: repeat(3, 1fr); }
}
@media (min-width: 768px) {
  .chips-grid { grid-template-columns: repeat(4, 1fr); }
}
</style>
