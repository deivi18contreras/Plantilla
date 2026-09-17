<template>
  <div class="card-widget">
    <!-- Header -->
    <div class="row items-center q-gutter-x-sm q-mb-md">
      <div class="dash-icon-box bg-blue-1 text-primary">
        <q-icon name="analytics" size="20px" />
      </div>
      <span class="text-subtitle1 text-weight-bolder text-slate-900">Resumen rápido del mes</span>
    </div>

    <!-- 4 Métricas en Fila -->
    <div class="row q-col-gutter-sm">
      <!-- Venta bruta del mes -->
      <div class="col-12 col-sm-6 col-md-3">
        <div class="resumen-mini-card">
          <div class="row items-center q-gutter-x-sm">
            <div class="stat-avatar bg-green-1 text-positive">
              <q-icon name="trending_up" size="22px" />
            </div>
            <div>
              <div class="text-caption text-slate-500 font-medium">Venta bruta del mes</div>
              <div class="text-subtitle1 text-weight-bolder text-slate-900" style="line-height: 1.1;">
                {{ formatCOP(ventaBruta) }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Gastos totales del mes -->
      <div class="col-12 col-sm-6 col-md-3">
        <div class="resumen-mini-card">
          <div class="row items-center q-gutter-x-sm">
            <div class="stat-avatar bg-red-1 text-negative">
              <q-icon name="shopping_bag" size="22px" />
            </div>
            <div>
              <div class="text-caption text-slate-500 font-medium">Gastos totales del mes</div>
              <div class="text-subtitle1 text-weight-bolder text-negative" style="line-height: 1.1;">
                {{ formatCOP(totalGastos) }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Ganancia neta del mes -->
      <div class="col-12 col-sm-6 col-md-3">
        <div class="resumen-mini-card">
          <div class="row items-center q-gutter-x-sm">
            <div class="stat-avatar bg-purple-1 text-purple-8">
              <q-icon name="signal_cellular_alt" size="22px" />
            </div>
            <div>
              <div class="text-caption text-slate-500 font-medium">Ganancia neta del mes</div>
              <div class="text-subtitle1 text-weight-bolder text-slate-900" style="line-height: 1.1;">
                {{ formatCOP(gananciaNeta) }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Días trabajados en el mes -->
      <div class="col-12 col-sm-6 col-md-3">
        <div class="resumen-mini-card">
          <div class="row items-center q-gutter-x-sm">
            <div class="stat-avatar bg-blue-1 text-primary">
              <q-icon name="calendar_month" size="22px" />
            </div>
            <div>
              <div class="text-caption text-slate-500 font-medium">Días trabajados en el mes</div>
              <div class="text-subtitle1 text-weight-bolder text-slate-900" style="line-height: 1.1;">
                {{ diasTrabajados }} / {{ diasMes }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  ventaBruta:     { type: Number, default: 0 },
  totalGastos:    { type: Number, default: 0 },
  gananciaNeta:   { type: Number, default: 0 },
  diasTrabajados: { type: Number, default: 0 },
  diasMes:        { type: Number, default: 30 },
})

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

.resumen-mini-card {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  padding: 12px 14px;
}

.stat-avatar {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
