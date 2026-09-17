<template>
  <div class="card-widget full-height column justify-between">
    <div>
      <!-- Header -->
      <div class="row items-center justify-between q-mb-md">
        <div class="row items-center q-gutter-x-sm">
          <div class="dash-icon-box bg-teal-1 text-teal-8">
            <q-icon name="account_balance" size="20px" />
          </div>
          <span class="text-subtitle1 text-weight-bolder text-slate-900">Saldos de cuentas</span>
        </div>
      </div>

      <!-- Lista de Cuentas -->
      <div class="column q-gutter-y-xs">
        <!-- Efectivo -->
        <div class="cuenta-item-row cursor-pointer" @click="$emit('abrir-extracto', 'Efectivo')">
          <div class="row items-center q-gutter-x-sm">
            <div class="cuenta-avatar-box bg-green-1 text-positive">
              <q-icon name="payments" size="20px" />
            </div>
            <div>
              <div class="text-caption text-slate-500 font-medium">Efectivo</div>
              <div class="text-weight-bolder text-slate-900" style="font-size: 15px; line-height: 1.1;">
                {{ formatCOP(efectivo) }}
              </div>
            </div>
          </div>
          <q-icon name="chevron_right" color="grey-5" size="18px" />
        </div>

        <!-- Nequi -->
        <div class="cuenta-item-row cursor-pointer" @click="$emit('abrir-extracto', 'Nequi')">
          <div class="row items-center q-gutter-x-sm">
            <div class="cuenta-avatar-box bg-purple-1 text-purple-8">
              <q-icon name="phone_android" size="20px" />
            </div>
            <div>
              <div class="text-caption text-slate-500 font-medium">Nequi</div>
              <div class="text-weight-bolder text-slate-900" style="font-size: 15px; line-height: 1.1;">
                {{ formatCOP(nequi) }}
              </div>
            </div>
          </div>
          <q-icon name="chevron_right" color="grey-5" size="18px" />
        </div>

        <!-- Bancolombia -->
        <div class="cuenta-item-row cursor-pointer" @click="$emit('abrir-extracto', 'Bancolombia')">
          <div class="row items-center q-gutter-x-sm">
            <div class="cuenta-avatar-box bg-amber-1 text-amber-9">
              <q-icon name="account_balance" size="20px" />
            </div>
            <div>
              <div class="text-caption text-slate-500 font-medium">Bancolombia</div>
              <div
                class="text-weight-bolder"
                :class="bancolombia < 0 ? 'text-negative' : 'text-slate-900'"
                style="font-size: 15px; line-height: 1.1;"
              >
                {{ formatCOP(bancolombia) }}
              </div>
            </div>
          </div>
          <q-icon name="chevron_right" color="grey-5" size="18px" />
        </div>

        <!-- Total -->
        <div class="cuenta-item-row cuenta-item-row--total cursor-pointer q-mt-xs" @click="$emit('abrir-extracto', 'Total')">
          <div class="row items-center q-gutter-x-sm">
            <div class="cuenta-avatar-box bg-teal-1 text-teal-8">
              <q-icon name="attach_money" size="20px" />
            </div>
            <div>
              <div class="text-caption text-slate-500 font-medium">Total</div>
              <div class="text-weight-bolder text-slate-900" style="font-size: 15.5px; line-height: 1.1;">
                {{ formatCOP(total) }}
              </div>
            </div>
          </div>
          <q-icon name="chevron_right" color="teal-8" size="18px" />
        </div>

      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  efectivo:     { type: Number, default: 0 },
  nequi:        { type: Number, default: 0 },
  bancolombia:  { type: Number, default: 0 },
  total:        { type: Number, default: 0 }
})
defineEmits(['abrir-extracto'])

const formatCOP = (val) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(val ?? 0)
</script>

<style scoped>
.dash-icon-box {
  width: 34px;
  height: 34px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.cuenta-item-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 10px;
  border-radius: 12px;
  transition: all 0.15s ease;
  border: 1px solid transparent;
}
.cuenta-item-row:hover {
  background: #f8fafc;
  border-color: #e2e8f0;
}
.cuenta-item-row--total {
  background: #f0fdfa;
  border-color: #ccfbf1;
}

.cuenta-avatar-box {
  width: 38px;
  height: 38px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
