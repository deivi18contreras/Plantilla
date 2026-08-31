<template>
  <div class="row justify-center q-pa-md">
    <div class="card-widget" style="max-width: 880px; width: 100%;">

      <!-- Encabezado Principal -->
      <div class="column col-sm-row items-start justify-between q-mb-md" style="gap:12px;">
        <div>
          <div class="text-h5 text-weight-bolder text-slate-900">Historial</div>
          <div class="text-caption text-slate-500 font-medium">
            Registros contables del negocio
            <span v-if="authStore.isAdmin" class="text-blue-6"> · Toca ✒ para editar o eliminar</span>
            <span v-else class="text-slate-400"> · Solo lectura</span>
          </div>
        </div>

        <!-- Filtros de Fecha -->
        <div class="row items-center q-gutter-sm full-width-xs">
          <q-input
            v-model="filtroFecha"
            type="date"
            borderless
            dense
            class="clean-input col"
            style="min-width: 140px; max-width: 175px;"
            @update:model-value="buscarPorFecha"
          />
          <q-btn flat no-caps label="Ver todos" color="primary" class="text-weight-bold" @click="verTodos" />
          <q-btn flat no-caps icon="table_view" label="Excel" color="positive" class="text-weight-bold" @click="exportarHistorialExcel" />
        </div>
      </div>

      <!-- PESTAÑAS TIPO PÍLDORA -->
      <div class="row q-col-gutter-sm q-mb-lg">
        <div class="col-12 col-sm-6">
          <div
            class="pill-option text-center cursor-pointer"
            :class="{ active: pestanaActiva === 'movimientos' }"
            @click="pestanaActiva = 'movimientos'"
          >
            <span class="text-weight-bold">📜 Movimientos Individuales ({{ movimientosStore.movimientos.length }})</span>
          </div>
        </div>

        <div class="col-12 col-sm-6">
          <div
            class="pill-option text-center cursor-pointer"
            :class="{ active: pestanaActiva === 'cierres' }"
            @click="pestanaActiva = 'cierres'"
          >
            <span class="text-weight-bold">🔒 Cierres Diarios Agrupados ({{ cierresAgrupados.length }})</span>
          </div>
        </div>
      </div>

      <!-- 🟢 VISTA 1: MOVIMIENTOS INDIVIDUALES -->
      <template v-if="pestanaActiva === 'movimientos'">
        <q-list separator>
          <q-item v-if="movimientosStore.loading" class="justify-center q-py-lg">
            <q-spinner color="primary" size="28px" />
          </q-item>

          <q-item v-else-if="movimientosPaginados.length === 0" class="text-center text-slate-400 q-py-xl">
            <q-item-section>Sin movimientos para esta fecha</q-item-section>
          </q-item>

          <q-item
            v-for="m in movimientosPaginados"
            :key="m._id"
            class="q-px-none q-py-md"
          >
            <q-item-section avatar style="min-width: 36px">
              <q-icon
                :name="m.tipo === 'recaudo' ? 'add_circle' : m.tipo === 'gasto' ? 'remove_circle' : 'swap_horiz'"
                :color="m.tipo === 'recaudo' ? 'positive' : m.tipo === 'gasto' ? 'negative' : 'primary'"
                size="26px"
              />
            </q-item-section>

            <q-item-section>
              <div class="row items-center q-gutter-x-xs">
                <span class="text-weight-bold text-slate-900 text-subtitle1">
                  {{ m.descripcion || m.tipo }}
                  <span class="text-caption text-slate-500 font-normal q-ml-xs">({{ formatFechaItem(m.fecha) }})</span>
                </span>
                <!-- Icono Editar — SOLO ADMIN -->
                <q-icon
                  v-if="authStore.isAdmin"
                  name="edit"
                  size="18px"
                  color="blue-6"
                  class="cursor-pointer q-ml-sm"
                  title="Editar este movimiento"
                  @click="abrirModalEdicion(m)"
                />
              </div>
              <div class="text-caption text-slate-500">
                Cuenta: <span class="text-weight-bold text-slate-700">{{ m.cuenta }}</span>
                <span v-if="m.cuentaDestino"> → {{ m.cuentaDestino }}</span>
                <span v-if="m.categoria"> | {{ m.categoria }}</span>
                <span v-if="m.creadoPor"> | Por: {{ m.creadoPor.nombre }}</span>
              </div>
            </q-item-section>

            <q-item-section side>
              <span class="text-weight-bolder text-subtitle1" :class="m.tipo === 'recaudo' ? 'text-green-6' : m.tipo === 'gasto' ? 'text-red-6' : 'text-blue-6'">
                {{ m.tipo === 'recaudo' ? '+' : '-' }}{{ formatCOP(m.monto) }}
              </span>
            </q-item-section>
          </q-item>
        </q-list>

        <!-- Paginación -->
        <div v-if="totalPaginas > 1" class="row justify-center q-mt-md q-gutter-sm">
          <q-btn flat round dense icon="chevron_left" :disable="paginaActual <= 1" @click="paginaActual--" />
          <div class="text-caption text-slate-600 self-center">Página {{ paginaActual }} de {{ totalPaginas }}</div>
          <q-btn flat round dense icon="chevron_right" :disable="paginaActual >= totalPaginas" @click="paginaActual++" />
        </div>
      </template>

      <!-- 🔵 VISTA 2: CIERRES DIARIOS AGRUPADOS CON ETIQUETAS EXACTAS -->
      <template v-else>
        <div v-if="movimientosStore.loading" class="column items-center q-py-xl">
          <q-spinner color="primary" size="32px" />
        </div>

        <div v-else-if="cierresAgrupados.length === 0" class="text-center text-slate-400 q-py-xl">
          Sin cierres de caja registrados para esta fecha
        </div>

        <div v-else class="column q-gutter-y-md">
          <CardCierreAgrupado
            v-for="cierre in cierresAgrupados"
            :key="cierre.fecha"
            :cierre="cierre"
            @compartir="abrirCompartirCierre"
            @editar="iniciarEdicionCierre"
          />
        </div>
      </template>

    </div>

    <!-- MODAL EDICIÓN — SOLO ADMIN -->
    <q-dialog v-model="modalEdicion">
      <q-card style="width: 480px; max-width: 90vw; border-radius: 24px;" class="q-pa-md">
        <q-card-section class="row items-center justify-between q-pb-xs">
          <div class="text-h6 text-weight-bolder text-slate-900">Editar Movimiento</div>
          <q-btn flat round icon="close" v-close-popup />
        </q-card-section>

        <q-card-section class="column q-gutter-y-md">
          <div>
            <div class="text-caption text-weight-bold text-slate-700 q-mb-xs">Fecha</div>
            <q-input v-model="formEdit.fecha" type="date" borderless class="clean-input" />
          </div>
          <div>
            <div class="text-caption text-weight-bold text-slate-700 q-mb-xs">Descripción</div>
            <q-input v-model="formEdit.descripcion" placeholder="Descripción" borderless class="clean-input" />
          </div>
          <div>
            <div class="text-caption text-weight-bold text-slate-700 q-mb-xs">Monto</div>
            <q-input v-model="formEdit.monto" type="number" prefix="$" placeholder="0" borderless class="clean-input" />
          </div>
          <div>
            <div class="text-caption text-weight-bold text-slate-700 q-mb-xs">Categoría</div>
            <q-input v-model="formEdit.categoria" placeholder="Categoría" borderless class="clean-input" />
          </div>
          <div>
            <div class="text-caption text-weight-bold text-slate-700 q-mb-xs">Cuenta</div>
            <div class="row q-col-gutter-xs">
              <div v-for="c in cuentas" :key="c" class="col-4">
                <div class="pill-option" :class="{ active: formEdit.cuenta === c }" @click="formEdit.cuenta = c">
                  <span style="font-size: 13px;">{{ c }}</span>
                </div>
              </div>
            </div>
          </div>
        </q-card-section>

        <q-card-actions class="row justify-between q-pt-md">
          <q-btn outline color="red-7" label="Eliminar" icon="delete" no-caps class="text-weight-bold" style="border-radius: 12px;" :loading="cargandoAccion" @click="confirmarEliminar" />
          <q-btn color="primary" label="Guardar cambios" no-caps class="text-weight-bold" style="border-radius: 12px; padding: 8px 20px;" :loading="cargandoAccion" @click="guardarCambios" />
        </q-card-actions>
      </q-card>
    </q-dialog>

  </div>

  <!-- MODAL COMPARTIR CIERRE (DESDE HISTORIAL) -->
  <ModalCompartirCierre v-model="modalCompartir" :texto="textoCompartir" />

  <!-- MODAL VERIFICAR CONTRASEÑA ADMIN -->
  <ModalVerificarAdmin
    v-model="modalVerificarAdmin"
    @autorizado="onAdminAutorizado"
  />

  <!-- MODAL EDITAR CIERRE DIARIO -->
  <ModalEditarCierre
    v-model="modalEditarCierre"
    :cierre="cierreSeleccionadoParaEditar"
    @guardado="onCierreEditado"
  />
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useMovimientosStore } from '@/store/movimientosStore'
import { useCuentasStore } from '@/store/cuentasStore'
import { useAuthStore } from '@/store/authStore'
import { useConfiguracionStore } from '@/store/configuracionStore'
import { putData, deleteData } from '@/services/apiService'
import { useQuasar } from 'quasar'
import * as XLSX from 'xlsx'
import ModalCompartirCierre from '@/components/ModalCompartirCierre.vue'
import CardCierreAgrupado from '@/components/CardCierreAgrupado.vue'
import ModalVerificarAdmin from '@/components/ModalVerificarAdmin.vue'
import ModalEditarCierre from '@/components/ModalEditarCierre.vue'
import { parseFechaLocal, formatFechaLarga, formatFechaCorta, getFechaLocalHoy } from '@/utils/dateUtils'

const $q = useQuasar()
const movimientosStore = useMovimientosStore()
const cuentasStore = useCuentasStore()
const authStore = useAuthStore()
const configStore = useConfiguracionStore()

const modalCompartir = ref(false)
const textoCompartir = ref('')

const modalVerificarAdmin = ref(false)
const modalEditarCierre = ref(false)
const cierreSeleccionadoParaEditar = ref(null)

const filtroFecha = ref(getFechaLocalHoy())
const pestanaActiva = ref('movimientos')
const modalEdicion = ref(false)
const cargandoAccion = ref(false)
const cuentas = ['Efectivo', 'Nequi', 'Bancolombia']

// Paginación
const paginaActual = ref(1)
const POR_PAGINA = 20

const totalPaginas = computed(() =>
  Math.ceil(movimientosStore.movimientos.length / POR_PAGINA)
)

const movimientosPaginados = computed(() => {
  const inicio = (paginaActual.value - 1) * POR_PAGINA
  return movimientosStore.movimientos.slice(inicio, inicio + POR_PAGINA)
})

const formatCOP = (val) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(val ?? 0)

const formatFechaItem = (fechaStr) => formatFechaCorta(fechaStr)

// CIERRES DIARIOS AGRUPADOS CON DETALLES COMPLETOS Y VALORES REALES DE RECAUDO NETO
const cierresAgrupados = computed(() => {
  const movs = movimientosStore.movimientos
  const grupos = {}

  movs.forEach(m => {
    if (m.tipo === 'recaudo' && (m.categoria === 'Ventas del día' || m.descripcion?.includes('Cierre') || m.descripcion?.includes('Recaudo'))) {
      const fechaClave = m.fecha ? m.fecha.split('T')[0] : 'desconocido'

      if (!grupos[fechaClave]) {
        grupos[fechaClave] = {
          fecha: m.fecha,
          createdAt: m.createdAt,
          creadoPor: m.creadoPor?.nombre || 'Empleado',
          efectivo: 0,
          nequi: 0,
          bancolombia: 0,
          gastosExternos: 0,
          devolucionPrestamo: 0,
          observaciones: ''
        }
      }

      if (m.cuenta === 'Efectivo') {
        grupos[fechaClave].efectivo += m.monto
        // Leemos los gastos externos y devoluciones guardadas en este movimiento de cierre
        if (m.gastosExternos) grupos[fechaClave].gastosExternos = m.gastosExternos
        if (m.devolucionPrestamo) grupos[fechaClave].devolucionPrestamo = m.devolucionPrestamo
        if (m.createdAt) grupos[fechaClave].createdAt = m.createdAt
      }
      if (m.cuenta === 'Nequi') grupos[fechaClave].nequi += m.monto
      if (m.cuenta === 'Bancolombia') grupos[fechaClave].bancolombia += m.monto

      if (m.descripcion && !m.descripcion.includes('Recaudo Nequi') && !m.descripcion.includes('Recaudo Bancolombia')) {
        grupos[fechaClave].observaciones = m.descripcion
      }
    }
  })

  return Object.values(grupos).map(g => {
    const fechaISO = g.fecha ? g.fecha.split('T')[0] : ''
    const gastosDia = movs
      .filter(m => m.tipo === 'gasto' && m.fecha && m.fecha.split('T')[0] === fechaISO)
      .reduce((s, m) => s + m.monto, 0)

    const devPrestamo = Number(g.devolucionPrestamo || 0)
    const totalCierre = g.efectivo + g.nequi + g.bancolombia
    const gastosReales = gastosDia - (g.gastosExternos || 0)
    const totalVenta = totalCierre + gastosReales + devPrestamo

    return {
      ...g,
      devolucionPrestamo: devPrestamo,
      gastosDia,
      gastosReales,
      totalCierre,
      totalVenta
    }
  })
})

const formEdit = ref({ id: '', fecha: '', descripcion: '', monto: 0, categoria: '', cuenta: 'Efectivo' })

const buscarPorFecha = () => {
  paginaActual.value = 1
  movimientosStore.fetchPorFecha(filtroFecha.value)
  if (!filtroFecha.value) {
    movimientosStore.fetchMovimientos()
  } else {
    movimientosStore.fetchPorFecha(filtroFecha.value)
  }
}

const verTodos = () => {
  filtroFecha.value = ''
  paginaActual.value = 1
  movimientosStore.fetchMovimientos()
}

const abrirModalEdicion = (mov) => {
  formEdit.value = {
    id: mov._id,
    fecha: mov.fecha ? mov.fecha.split('T')[0] : '',
    descripcion: mov.descripcion || '',
    monto: mov.monto,
    categoria: mov.categoria || '',
    cuenta: mov.cuenta || 'Efectivo'
  }
  modalEdicion.value = true
}

const guardarCambios = async () => {
  cargandoAccion.value = true
  try {
    await putData(`/movimientos/${formEdit.value.id}`, formEdit.value)
    $q.notify({ type: 'positive', message: '✅ Movimiento actualizado' })
    modalEdicion.value = false
    await Promise.all([buscarPorFecha(), cuentasStore.fetchCuentas()])
  } catch (error) {
    $q.notify({ type: 'negative', message: error.response?.data?.mensaje || '❌ Error al actualizar' })
  } finally {
    cargandoAccion.value = false
  }
}

const confirmarEliminar = () => {
  $q.dialog({
    title: 'Confirmar eliminación',
    message: '¿Estás seguro de eliminar este movimiento? Se ajustará el saldo automáticamente.',
    cancel: true,
    persistent: true
  }).onOk(async () => {
    cargandoAccion.value = true
    try {
      await deleteData(`/movimientos/${formEdit.value.id}`)
      $q.notify({ type: 'positive', message: '🗑️ Movimiento eliminado' })
      modalEdicion.value = false
      await Promise.all([buscarPorFecha(), cuentasStore.fetchCuentas()])
    } catch (error) {
      $q.notify({ type: 'negative', message: error.response?.data?.mensaje || '❌ Error al eliminar' })
    } finally {
      cargandoAccion.value = false
    }
  })
}

const iniciarEdicionCierre = (cierre) => {
  if (!authStore.isAdmin) {
    $q.notify({ type: 'warning', message: '🔒 Solo administradores pueden editar el cierre' })
    return
  }
  cierreSeleccionadoParaEditar.value = cierre
  modalVerificarAdmin.value = true
}

const onAdminAutorizado = () => {
  modalEditarCierre.value = true
}

const onCierreEditado = async () => {
  await Promise.all([
    buscarPorFecha(),
    cuentasStore.fetchCuentas()
  ])
}

const abrirCompartirCierre = (cierre) => {
  const fechaStr = formatFechaLarga(cierre.fecha)
  const negocio = configStore.nombreNegocio || 'Negocio'
  textoCompartir.value = `📊 *CIERRE DE TURNO*
${negocio.toUpperCase()} — ${fechaStr}
${'─'.repeat(32)}
🔴 Gastos del día:   ${formatCOP(cierre.gastosReales)}
💵 Efectivo neto:    ${formatCOP(cierre.efectivo)}${cierre.devolucionPrestamo > 0 ? `
🔄 Devolución deuda: ${formatCOP(cierre.devolucionPrestamo)}` : ''}
📱 Nequi:            ${formatCOP(cierre.nequi)}
🏦 Bancolombia:      ${formatCOP(cierre.bancolombia)}
${'─'.repeat(32)}
🔵 CIERRE TOTAL:     ${formatCOP(cierre.totalCierre)}
🟢 VENTA TOTAL:      ${formatCOP(cierre.totalVenta)}
${'─'.repeat(32)}
👤 Registrado por: ${cierre.creadoPor}${cierre.observaciones ? `
📝 ${cierre.observaciones}` : ''}`
  modalCompartir.value = true
}

const abrirWhatsApp = () => {
  window.open(`https://wa.me/?text=${encodeURIComponent(textoCompartir.value)}`, '_blank')
}

const copiarTexto = () => {
  navigator.clipboard.writeText(textoCompartir.value).then(() => {
    $q.notify({ type: 'positive', message: '✅ Texto copiado al portapapeles' })
  })
}

const exportarHistorialExcel = () => {
  try {
    const movimientos = movimientosStore.movimientos || []
    if (movimientos.length === 0) {
      $q.notify({ type: 'warning', message: 'No hay movimientos para exportar' })
      return
    }

    const nombreNegocio = configStore.nombreNegocio || 'Mi Negocio'
    const filtroTexto = filtroFecha.value ? `Fecha: ${filtroFecha.value}` : 'Todos los registros'
    const wb = XLSX.utils.book_new()

    let totalGastos = 0
    let totalRecaudos = 0
    movimientos.forEach(m => {
      if (m.tipo === 'gasto') totalGastos += m.monto
      if (m.tipo === 'recaudo') totalRecaudos += m.monto
    })

    const aoa = [
      [`HISTORIAL DE MOVIMIENTOS - ${nombreNegocio.toUpperCase()}`],
      [`Filtro: ${filtroTexto}`],
      [`Generado: ${new Date().toLocaleDateString('es-CO')} ${new Date().toLocaleTimeString('es-CO')}`],
      [],
      ['Total Gastos (COP):', totalGastos, 'Total Cierres (COP):', totalRecaudos, 'Total Registros:', movimientos.length],
      [],
      ['Fecha', 'Tipo', 'Categoría', 'Descripción / Detalle', 'Cuenta / Origen', 'Monto (COP)', 'Registrado Por'],
      ...movimientos.map(m => [
        m.fecha ? new Date(m.fecha).toISOString().split('T')[0] : '',
        m.tipo === 'gasto' ? 'Gasto' : (m.tipo === 'recaudo' ? 'Cierre' : 'Traslado'),
        m.categoria || '-',
        m.descripcion || '-',
        m.cuenta || 'Efectivo',
        m.monto,
        m.creadoPor?.nombre || 'Empleado'
      ])
    ]

    const ws = XLSX.utils.aoa_to_sheet(aoa)
    ws['!cols'] = [{ wch: 14 }, { wch: 12 }, { wch: 22 }, { wch: 38 }, { wch: 18 }, { wch: 18 }, { wch: 20 }]
    XLSX.utils.book_append_sheet(wb, ws, 'Movimientos')

    const fechaLabel = filtroFecha.value ? filtroFecha.value : 'completo'
    XLSX.writeFile(wb, `Movimientos_${nombreNegocio}_${fechaLabel}.xlsx`)
  } catch (error) {
    console.error('Error al exportar Excel:', error)
  }
}

onMounted(async () => {
  await configStore.fetchConfiguracion()
  buscarPorFecha()
})
</script>
