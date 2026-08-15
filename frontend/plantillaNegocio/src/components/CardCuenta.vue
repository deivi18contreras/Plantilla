<template>
  <div class="account-item" :class="{ 'cursor-pointer': clickable }" @click="handleClick">
    <div class="row items-center q-gutter-sm">
      <q-avatar size="32px" :color="avatarColor" :text-color="avatarTextColor" :icon="icon" />
      <div>
        <div class="text-caption text-slate-500 font-medium">{{ nombre }}</div>
        <div class="text-subtitle1 text-weight-bolder text-slate-900">{{ formattedMonto }}</div>
      </div>
    </div>
    <q-icon v-if="clickable" name="chevron_right" color="slate-400" size="20px" />
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  nombre: { type: String, required: true },
  monto: { type: Number, default: 0 },
  icon: { type: String, default: 'account_balance_wallet' },
  avatarColor: { type: String, default: 'blue-1' },
  avatarTextColor: { type: String, default: 'primary' },
  clickable: { type: Boolean, default: false }
})

const emit = defineEmits(['click'])

const formattedMonto = computed(() => {
  return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(props.monto ?? 0)
})

const handleClick = () => {
  if (props.clickable) {
    emit('click')
  }
}
</script>
