<template>
  <div class="row justify-center q-pa-md">
    <div class="card-widget" style="max-width: 900px; width: 100%;">

      <!-- Encabezado -->
      <div class="row items-center justify-between q-mb-lg">
        <div>
          <div class="text-h5 text-weight-bolder text-slate-900">📈 Tendencia Mensual</div>
          <div class="text-caption text-slate-500">Cuánto entra y sale por categoría cada mes</div>
        </div>
        <div class="row items-center q-gutter-sm">
          <div class="text-caption text-slate-500">Últimos</div>
          <div class="row q-gutter-xs">
            <div
              v-for="n in [3, 6, 12]"
              :key="n"
              class="cursor-pointer text-caption text-weight-bold q-px-sm q-py-xs"
              :style="mesesSeleccionados === n
                ? 'background:#2563eb; color:white; border-radius:8px;'
                : 'background:#f1f5f9; color:#64748b; border-radius:8px;'"
              @click="cambiarMeses(n)"
            >
              {{ n }} meses
            </div>
          </div>
        </div>
      </div>

      <!-- Loading -->
      <div v-if="cargando" class="column items-center q-py-xl">
        <q-spinner color="primary" size="32px" />
        <div class="text-caption text-slate-500 q-mt-sm">Calculando tendencias...</div>
      </div>

      <template v-else>

        <!-- ══ TARJETAS RESUMEN POR MES ══ -->
        <div class="row q-col-gutter-sm q-mb-lg" style="overflow-x: auto; flex-wrap: nowrap;">
          <div
            v-for="mes in tendencia.meses"
            :key="mes.mes"
            class="col-auto"
            style="min-width: 160px;"
          >
            <div class="q-pa-md" style="border-radius:16px; border:1px solid #e2e8f0; background:#f8fafc;">
              <div class="text-caption text-weight-bold text-slate-700 q-mb-xs text-capitalize">{{ mes.label }}</div>
              <div class="text-caption text-slate-500">Ventas</div>
              <div class="text-subtitle2 text-weight-bolder text-green-7">{{ formatCOP(mes.totalVentas) }}</div>
              <div class="text-caption text-slate-500 q-mt-xs">Gastos</div>
              <div class="text-subtitle2 text-weight-bolder text-red-6">{{ formatCOP(mes.totalGastos) }}</div>
              <div class="text-caption text-slate-500 q-mt-xs">Neto</div>
              <div
                class="text-subtitle2 text-weight-bolder"
                :class="mes.neto >= 0 ? 'text-blue-7' : 'text-red-7'"
              >
                {{ formatCOP(mes.neto) }}
              </div>
            </div>
          </div>
        </div>

        <q-separator class="q-mb-lg" />

        <!-- ══ TABLA: GASTOS POR CATEGORÍA MES A MES ══ -->
        <div class="q-mb-lg">
          <div class="text-subtitle2 text-weight-bolder text-slate-800 q-mb-sm">
            💸 Gastos por categoría
          </div>

          <div style="overflow-x: auto;">
            <table style="width:100%; border-collapse: collapse; font-size: 13px;">
              <!-- Encabezado de meses -->
              <thead>
                <tr>
                  <th style="text-align:left; padding:8px 12px; background:#f1f5f9; border-radius:8px 0 0 0; color:#475569; font-weight:700;">Categoría</th>
                  <th
                    v-for="mes in tendencia.meses"
                    :key="mes.mes"
                    style="text-align:right; padding:8px 12px; background:#f1f5f9; color:#475569; font-weight:700; white-space:nowrap; text-transform:capitalize;"
                  >
                    {{ mes.label }}
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="cat in tendencia.categorias"
                  :key="cat"
                  style="border-bottom: 1px solid #f1f5f9;"
                >
                  <td style="padding:8px 12px; color:#334155; font-weight:600;">{{ cat }}</td>
                  <td
                    v-for="mes in tendencia.meses"
                    :key="mes.mes"
                    style="text-align:right; padding:8px 12px;"
                    :style="mes.porCategoria[cat] > 0 ? 'color:#dc2626; font-weight:600;' : 'color:#cbd5e1;'"
                  >
                    {{ mes.porCategoria[cat] ? formatCOP(mes.porCategoria[cat]) : '—' }}
                  </td>
                </tr>
                <!-- Fila total -->
                <tr style="background:#fef9c3; font-weight:700;">
                  <td style="padding:8px 12px; color:#92400e;">TOTAL GASTOS</td>
                  <td
                    v-for="mes in tendencia.meses"
                    :key="mes.mes"
                    style="text-align:right; padding:8px 12px; color:#b45309;"
                  >
                    {{ formatCOP(mes.totalGastos) }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <q-separator class="q-mb-lg" />

        <!-- ══ TABLA: LO QUE ENTRÓ POR CUENTA ══ -->
        <div>
          <div class="text-subtitle2 text-weight-bolder text-slate-800 q-mb-sm">
            💵 Plata que entró (recaudos) por cuenta
          </div>

          <div style="overflow-x: auto;">
            <table style="width:100%; border-collapse: collapse; font-size: 13px;">
              <thead>
                <tr>
                  <th style="text-align:left; padding:8px 12px; background:#f1f5f9; color:#475569; font-weight:700;">Cuenta</th>
                  <th
                    v-for="mes in tendencia.meses"
                    :key="mes.mes"
                    style="text-align:right; padding:8px 12px; background:#f1f5f9; color:#475569; font-weight:700; white-space:nowrap; text-transform:capitalize;"
                  >
                    {{ mes.label }}
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="cuenta in ['Efectivo', 'Nequi', 'Bancolombia']" :key="cuenta" style="border-bottom:1px solid #f1f5f9;">
                  <td style="padding:8px 12px; color:#334155; font-weight:600;">{{ cuenta }}</td>
                  <td
                    v-for="mes in tendencia.meses"
                    :key="mes.mes"
                    style="text-align:right; padding:8px 12px;"
                    :style="mes.porCuenta[cuenta] > 0 ? 'color:#16a34a; font-weight:600;' : 'color:#cbd5e1;'"
                  >
                    {{ mes.porCuenta[cuenta] ? formatCOP(mes.porCuenta[cuenta]) : '—' }}
                  </td>
                </tr>
                <tr style="background:#f0fdf4; font-weight:700;">
                  <td style="padding:8px 12px; color:#166534;">TOTAL ENTRADAS</td>
                  <td
                    v-for="mes in tendencia.meses"
                    :key="mes.mes"
                    style="text-align:right; padding:8px 12px; color:#15803d;"
                  >
                    {{ formatCOP(mes.totalVentas) }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

      </template>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getData } from '@/services/apiService'

const cargando = ref(false)
const mesesSeleccionados = ref(6)
const tendencia = ref({ meses: [], categorias: [] })

const formatCOP = (val) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(val ?? 0)

const cargarTendencia = async () => {
  cargando.value = true
  try {
    const data = await getData('/resumen/tendencia', { meses: mesesSeleccionados.value })
    tendencia.value = data
  } catch (e) {
    console.error('Error al cargar tendencia:', e)
  } finally {
    cargando.value = false
  }
}

const cambiarMeses = (n) => {
  mesesSeleccionados.value = n
  cargarTendencia()
}

onMounted(cargarTendencia)
</script>
