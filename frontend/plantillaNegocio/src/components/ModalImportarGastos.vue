<template>
  <q-dialog :model-value="modelValue" @update:model-value="$emit('update:modelValue', $event)" maximized transition-show="slide-up" transition-hide="slide-down">
    <q-card class="column" style="max-width: 640px; width: 100%; margin: auto; max-height: 100vh; border-radius: 0;">

      <q-card-section class="row items-center justify-between q-pb-sm" style="background: #0f172a; color: white;">
        <div>
          <div class="text-h6 text-weight-bolder">📥 Importar Gastos desde Excel</div>
          <div class="text-caption" style="opacity: 0.7;">Sube la planilla con los gastos del contratista</div>
        </div>
        <q-btn flat round icon="close" color="white" @click="cerrar" />
      </q-card-section>

      <q-card-section class="col overflow-auto q-pa-md">

        <div class="q-mb-lg q-pa-md" style="background: #f0f9ff; border-radius: 16px; border: 1px solid #bae6fd;">
          <div class="text-subtitle2 text-weight-bold text-blue-8 q-mb-xs">📋 Paso 1 — Descarga la plantilla</div>
          <div class="text-caption text-slate-600 q-mb-sm">Descarga el archivo Excel, llena los gastos y guárdalo.</div>
          <q-btn outline color="blue-7" icon="download" label="Descargar plantilla Excel" no-caps class="text-weight-bold" style="border-radius: 10px;" @click="descargarPlantilla" />
        </div>

        <div class="q-mb-md q-pa-md" style="background: #f8fafc; border-radius: 16px; border: 1px solid #e2e8f0;">
          <div class="text-subtitle2 text-weight-bold text-slate-800 q-mb-xs">📤 Paso 2 — Sube la planilla llenada</div>
          <div class="text-caption text-slate-500 q-mb-sm">Selecciona el archivo .xlsx que llenaste</div>
          <div
            class="row items-center justify-center q-pa-lg cursor-pointer"
            style="border: 2px dashed #cbd5e1; border-radius: 12px; min-height: 80px;"
            :style="archivoSeleccionado ? 'border-color: #22c55e; background: #f0fdf4;' : ''"
            @click="$refs.inputFile.click()"
          >
            <div class="text-center">
              <div class="text-3xl q-mb-xs">{{ archivoSeleccionado ? '✅' : '📂' }}</div>
              <div class="text-weight-medium text-slate-700" style="font-size: 13px;">
                {{ archivoSeleccionado ? archivoSeleccionado.name : 'Toca aquí para seleccionar el archivo' }}
              </div>
              <div v-if="!archivoSeleccionado" class="text-caption text-slate-400">Formatos: .xlsx, .xls</div>
            </div>
          </div>
          <input ref="inputFile" type="file" accept=".xlsx,.xls" style="display:none" @change="leerArchivo" />
        </div>

        <div v-if="gastosLeidos.length > 0" class="q-mb-md">
          <div class="row items-center justify-between q-mb-sm">
            <div class="text-subtitle2 text-weight-bold text-slate-800">👁️ Vista previa — {{ gastosLeidos.length }} gastos</div>
            <div class="text-caption text-green-7 text-weight-bold">Total: {{ formatCOP(totalPreview) }}</div>
          </div>
          <div style="border-radius: 12px; overflow: hidden; border: 1px solid #e2e8f0;">
            <div class="row text-caption text-weight-bold text-slate-500 q-px-md q-py-xs" style="background: #f8fafc; border-bottom: 1px solid #e2e8f0;">
              <div class="col-2">Fecha</div>
              <div class="col-4">Descripción</div>
              <div class="col-2">Categoría</div>
              <div class="col-2">Cuenta</div>
              <div class="col-2 text-right">Monto</div>
            </div>
            <div
              v-for="(g, i) in gastosLeidos"
              :key="i"
              class="row items-center q-px-md q-py-xs text-caption"
              :style="i % 2 === 0 ? 'background: white;' : 'background: #f8fafc;'"
            >
              <div class="col-2 text-slate-600">{{ g.fecha }}</div>
              <div class="col-4 text-slate-800 text-weight-medium">{{ g.descripcion || '—' }}</div>
              <div class="col-2 text-slate-500">{{ g.categoria }}</div>
              <div class="col-2 text-weight-bold" :style="cuentaColor(g.cuenta)">{{ g.cuenta }}</div>
              <div class="col-2 text-right text-weight-bold text-slate-900">{{ formatCOP(g.monto) }}</div>
            </div>
          </div>
          <div v-if="errores.length > 0" class="q-mt-sm q-pa-sm" style="background: #fff1f2; border-radius: 10px; border: 1px solid #fecdd3;">
            <div class="text-caption text-red-7 text-weight-bold q-mb-xs">❌ Errores — corrígelos en el archivo:</div>
            <div v-for="(e, i) in errores" :key="i" class="text-caption text-red-6">• {{ e }}</div>
          </div>
        </div>

        <div v-if="errores.length > 0 && gastosLeidos.length === 0" class="q-pa-sm" style="background: #fff1f2; border-radius: 10px; border: 1px solid #fecdd3;">
          <div class="text-caption text-red-7 text-weight-bold q-mb-xs">❌ Errores:</div>
          <div v-for="(e, i) in errores" :key="i" class="text-caption text-red-6">• {{ e }}</div>
        </div>

      </q-card-section>

      <q-card-section class="q-pt-none">
        <div class="column q-gutter-y-sm">
          <q-btn
            v-if="gastosLeidos.length > 0 && errores.length === 0"
            color="primary" icon="upload"
            :label="`Importar ${gastosLeidos.length} gastos — ${formatCOP(totalPreview)}`"
            no-caps class="full-width text-weight-bold" style="border-radius: 12px; font-size: 14px;"
            :loading="importando" @click="importar"
          />
          <q-btn v-if="archivoSeleccionado" flat no-caps label="Cambiar archivo" color="grey-7" class="full-width" @click="resetArchivo" />
        </div>
      </q-card-section>

    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useQuasar } from 'quasar'
import * as XLSX from 'xlsx'
import { postData } from '@/services/apiService'

defineProps({ modelValue: Boolean })
const emit = defineEmits(['update:modelValue', 'importado'])

const $q = useQuasar()
const inputFile = ref(null)
const archivoSeleccionado = ref(null)
const gastosLeidos = ref([])
const errores = ref([])
const importando = ref(false)

const cerrar = () => { emit('update:modelValue', false); resetArchivo() }
const resetArchivo = () => {
  archivoSeleccionado.value = null
  gastosLeidos.value = []
  errores.value = []
  if (inputFile.value) inputFile.value.value = ''
}

const formatCOP = (val) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(val ?? 0)

const totalPreview = computed(() => gastosLeidos.value.reduce((s, g) => s + (Number(g.monto) || 0), 0))

const cuentaColor = (c) => c === 'Efectivo' ? 'color:#16a34a;' : c === 'Nequi' ? 'color:#7c3aed;' : 'color:#d97706;'

const descargarPlantilla = () => {
  const ws = XLSX.utils.aoa_to_sheet([
    ['Fecha', 'Descripcion', 'Categoria', 'Cuenta', 'Monto'],
    ['2026-08-19', 'Pollo proveedor Luis', 'Carnes', 'Efectivo', 150000],
    ['2026-08-19', 'Jabon y escoba', 'Aseo y Limpieza', 'Efectivo', 25000],
    ['2026-08-19', 'Domicilio Nequi', 'Pedidos Varios', 'Nequi', 8000],
  ])
  ws['!cols'] = [{ wch: 14 }, { wch: 32 }, { wch: 20 }, { wch: 15 }, { wch: 12 }]
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Gastos')
  XLSX.writeFile(wb, 'Plantilla_Gastos.xlsx')
}

const leerArchivo = (event) => {
  const file = event.target.files[0]
  if (!file) return
  archivoSeleccionado.value = file
  gastosLeidos.value = []
  errores.value = []

  const reader = new FileReader()
  reader.onload = (e) => {
    try {
      const wb = XLSX.read(e.target.result, { type: 'binary', cellDates: true })
      const ws = wb.Sheets[wb.SheetNames[0]]
      const filas = XLSX.utils.sheet_to_json(ws, { raw: false, dateNF: 'yyyy-mm-dd' })

      const gastosTemp = []
      const erroresTemp = []
      const cuentasValidas = ['Efectivo', 'Nequi', 'Bancolombia']

      filas.forEach((fila, i) => {
        const n = i + 2
        const fecha = fila['Fecha'] || fila['fecha']
        const descripcion = fila['Descripcion'] || fila['descripcion'] || fila['Descripción'] || ''
        const categoria = fila['Categoria'] || fila['categoria'] || fila['Categoría'] || 'Varios'
        const cuenta = fila['Cuenta'] || fila['cuenta'] || ''
        const montoRaw = fila['Monto'] || fila['monto']
        const monto = Number(String(montoRaw ?? '').replace(/[^0-9.-]/g, ''))

        if (!fecha) { erroresTemp.push(`Fila ${n}: falta la Fecha`); return }
        if (!cuentasValidas.includes(cuenta)) { erroresTemp.push(`Fila ${n}: Cuenta inválida "${cuenta}"`); return }
        if (!montoRaw || isNaN(monto) || monto <= 0) { erroresTemp.push(`Fila ${n}: Monto inválido "${montoRaw}"`); return }

        gastosTemp.push({ fecha: String(fecha).split('T')[0], descripcion: String(descripcion), categoria: String(categoria), cuenta, monto })
      })

      gastosLeidos.value = gastosTemp
      errores.value = erroresTemp
      if (gastosTemp.length === 0 && erroresTemp.length === 0) {
        errores.value = ['El archivo no tiene filas de datos. Usa la plantilla descargada.']
      }
    } catch {
      errores.value = ['No se pudo leer el archivo. Asegúrate de que sea .xlsx válido.']
    }
  }
  reader.readAsBinaryString(file)
}

const importar = async () => {
  if (!gastosLeidos.value.length || errores.value.length) return
  importando.value = true
  try {
    const res = await postData('/movimientos/importar-gastos', { gastos: gastosLeidos.value })
    $q.notify({ type: 'positive', message: res.mensaje || `✅ ${gastosLeidos.value.length} gastos importados` })
    emit('importado')
    cerrar()
  } catch (error) {
    $q.notify({ type: 'negative', message: error.response?.data?.mensaje || '❌ Error al importar gastos' })
  } finally {
    importando.value = false
  }
}
</script>
