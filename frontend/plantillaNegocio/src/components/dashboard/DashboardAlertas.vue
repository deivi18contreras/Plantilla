<template>
  <div v-if="hayAlertas" class="q-mb-md">
    <!-- Header de Alertas -->
    <div class="row items-center q-gutter-x-xs q-mb-sm">
      <q-avatar size="24px" color="red-6" text-color="white" icon="priority_high" class="text-weight-bolder" />
      <span class="text-subtitle1 text-weight-bolder text-red-8">Alertas urgentes</span>
    </div>

    <div class="row q-col-gutter-sm">
      <!-- 1. Adelantos pendientes -->
      <div v-if="adelantos.length > 0" class="col-12 col-md-4">
        <div class="alerta-card alerta-card--pink cursor-pointer" @click="$router.push('/adelantos')">
          <div class="row items-center justify-between no-wrap">
            <div class="row items-center q-gutter-x-sm">
              <div class="alerta-avatar alerta-avatar--pink">
                <q-icon name="people" size="20px" color="white" />
              </div>
              <div>
                <div class="alerta-title">Adelantos pendientes</div>
                <div class="alerta-amount text-red-7">{{ formatCOP(totalAdelantos) }}</div>
                <div class="alerta-sub">({{ adelantos.length }} en total)</div>
              </div>
            </div>
            <q-icon name="chevron_right" color="red-4" size="18px" />
          </div>
        </div>
      </div>

      <!-- 2. Gastos fijos próximos a vencer -->
      <div v-if="gastosFijos.length > 0" class="col-12 col-md-4">
        <div class="alerta-card alerta-card--amber cursor-pointer" @click="$router.push('/gastos-fijos')">
          <div class="row items-center justify-between no-wrap">
            <div class="row items-center q-gutter-x-sm">
              <div class="alerta-avatar alerta-avatar--amber">
                <q-icon name="calendar_today" size="18px" color="white" />
              </div>
              <div>
                <div class="alerta-title">Gastos fijos próximos a vencer</div>
                <div class="alerta-amount text-slate-900" style="font-size: 14px;">
                  {{ primerGastoFijo?.nombre }} - {{ formatCOP(primerGastoFijo?.monto) }}
                </div>
                <div class="alerta-sub text-amber-9">
                  {{ primerGastoFijo?.proximoVencimiento ? formatFecha(primerGastoFijo.proximoVencimiento) : 'Esta semana' }}
                </div>
              </div>
            </div>
            <q-icon name="chevron_right" color="amber-7" size="18px" />
          </div>
        </div>
      </div>

      <!-- 3. Cuenta en negativo -->
      <div v-if="cuentasNegativas.length > 0" class="col-12 col-md-4">
        <div class="alerta-card alerta-card--orange cursor-pointer" @click="$router.push('/cuentas')">
          <div class="row items-center justify-between no-wrap">
            <div class="row items-center q-gutter-x-sm">
              <div class="alerta-avatar alerta-avatar--orange">
                <q-icon name="account_balance" size="18px" color="white" />
              </div>
              <div>
                <div class="alerta-title">Cuenta en negativo</div>
                <div class="alerta-amount text-slate-900" style="font-size: 14px;">
                  {{ cuentasNegativas[0]?.nombre }}
                </div>
                <div class="alerta-sub text-red-6 text-weight-bold">
                  {{ formatCOP(cuentasNegativas[0]?.saldo) }}
                </div>
              </div>
            </div>
            <q-icon name="chevron_right" color="orange-6" size="18px" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'

const $router = useRouter()

const props = defineProps({
  adelantos: { type: Array, default: () => [] },
  totalAdelantos: { type: Number, default: 0 },
  gastosFijos: { type: Array, default: () => [] },
  cuentas: { type: Array, default: () => [] }
})

const cuentasNegativas = computed(() =>
  props.cuentas.filter(c => (c.saldo || 0) < 0)
)

const primerGastoFijo = computed(() =>
  props.gastosFijos.length > 0 ? props.gastosFijos[0] : null
)

const hayAlertas = computed(() =>
  props.adelantos.length > 0 ||
  props.gastosFijos.length > 0 ||
  cuentasNegativas.value.length > 0
)

const formatCOP = (val) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(val ?? 0)

const formatFecha = (fechaStr) => {
  if (!fechaStr) return ''
  try {
    const d = new Date(fechaStr)
    return d.toLocaleDateString('es-CO', { day: 'numeric', month: 'long' })
  } catch (e) {
    return fechaStr
  }
}
</script>

<style scoped>
.alerta-card {
  border-radius: 16px;
  padding: 14px 16px;
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}
.alerta-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.04);
}

.alerta-card--pink {
  background: #fef2f2;
  border: 1px solid #fee2e2;
}
.alerta-card--amber {
  background: #fffbeb;
  border: 1px solid #fef3c7;
}
.alerta-card--orange {
  background: #fff7ed;
  border: 1px solid #ffedd5;
}

.alerta-avatar {
  width: 42px;
  height: 42px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.alerta-avatar--pink {
  background: #ef4444;
}
.alerta-avatar--amber {
  background: #f59e0b;
}
.alerta-avatar--orange {
  background: #ea580c;
}

.alerta-title {
  font-size: 12px;
  font-weight: 700;
  color: #475569;
}
.alerta-amount {
  font-size: 16px;
  font-weight: 800;
  line-height: 1.2;
}
.alerta-sub {
  font-size: 11px;
  color: #64748b;
  font-weight: 500;
}
</style>
