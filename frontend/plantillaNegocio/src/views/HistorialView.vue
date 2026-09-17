<template>
  <div class="dashboard-main-card full-width q-pa-lg">

    <!-- ─── ENCABEZADO SUPERIOR (ESTILO FIGMA / IMAGEN 2) ─── -->
    <div class="row items-center justify-between q-mb-lg" style="gap: 16px; flex-wrap: wrap;">
      <div class="row items-center q-gutter-x-md">
        <q-btn
          flat round dense
          icon="arrow_back"
          color="slate-700"
          class="bg-slate-100 hover-bg-slate-200"
          style="width: 40px; height: 40px; border-radius: 12px; background: #f1f5f9;"
          @click="$router.push('/')"
        />
        <div>
          <div class="text-h5 text-weight-bolder text-slate-900" style="letter-spacing: -0.5px;">
            Historial de movimientos
          </div>
          <div class="text-caption text-slate-500 font-medium">
            Consulta todas las transacciones de tu cuenta
          </div>
        </div>
      </div>

      <!-- Selector de Cuenta Superior Derecho (Pill Dropdown) + Toggle Vista -->
      <div class="row items-center q-gutter-sm">
        <!-- Toggle Movimientos vs Cierres -->
        <div class="row items-center q-pa-xs bg-slate-100 rounded-borders" style="background: #f1f5f9; border-radius: 12px;">
          <q-btn
            no-caps dense unelevated
            :color="pestanaActiva === 'movimientos' ? 'primary' : 'transparent'"
            :text-color="pestanaActiva === 'movimientos' ? 'white' : 'slate-700'"
            label="Movimientos"
            class="text-weight-bold q-px-sm"
            style="border-radius: 8px; font-size: 12px;"
            @click="pestanaActiva = 'movimientos'"
          />
          <q-btn
            no-caps dense unelevated
            :color="pestanaActiva === 'cierres' ? 'primary' : 'transparent'"
            :text-color="pestanaActiva === 'cierres' ? 'white' : 'slate-700'"
            label="Cierres Diarios"
            class="text-weight-bold q-px-sm"
            style="border-radius: 8px; font-size: 12px;"
            @click="pestanaActiva = 'cierres'"
          />
        </div>

        <!-- Pill Dropdown de Cuenta Activa -->
        <q-btn-dropdown
          outline
          no-caps
          color="primary"
          style="border-radius: 14px; border: 1.5px solid #cbd5e1; background: #ffffff; padding: 4px 12px;"
        >
          <template #label>
            <div class="row items-center q-gutter-x-sm">
              <q-avatar size="28px" :color="colorAvatar(filtroCuenta)" text-color="white" :icon="iconoCuenta(filtroCuenta)" />
              <div class="column text-left">
                <span class="text-weight-bold text-slate-900" style="font-size: 13px; line-height: 1.1;">
                  {{ filtroCuenta === 'Todas' ? 'Todas las cuentas' : filtroCuenta }}
                </span>
                <span class="text-caption text-weight-bolder text-primary" style="font-size: 11px;">
                  {{ formatCOP(saldoCuentaActiva) }}
                </span>
              </div>
            </div>
          </template>

          <q-list style="min-width: 220px; border-radius: 12px;">
            <q-item clickable v-close-popup @click="seleccionarCuenta('Todas')" :active="filtroCuenta === 'Todas'">
              <q-item-section avatar>
                <q-avatar size="28px" color="blue-1" text-color="primary" icon="account_balance_wallet" />
              </q-item-section>
              <q-item-section>
                <q-item-label class="text-weight-bold">Todas las cuentas</q-item-label>
                <q-item-label caption>{{ formatCOP(cuentasStore.totalSaldo) }}</q-item-label>
              </q-item-section>
            </q-item>

            <q-item
              v-for="c in cuentas"
              :key="c"
              clickable v-close-popup
              @click="seleccionarCuenta(c)"
              :active="filtroCuenta === c"
            >
              <q-item-section avatar>
                <q-avatar size="28px" :color="colorAvatar(c)" text-color="white" :icon="iconoCuenta(c)" />
              </q-item-section>
              <q-item-section>
                <q-item-label class="text-weight-bold">{{ c }}</q-item-label>
                <q-item-label caption>{{ formatCOP(cuentasStore.saldoPor(c)) }}</q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
        </q-btn-dropdown>
      </div>
    </div>

    <!-- ─── VISTA 1: MOVIMIENTOS INDIVIDUALES (LAYOUT 2 COLUMNAS IMAGEN 2) ─── -->
    <div v-if="pestanaActiva === 'movimientos'" class="historial-grid-container">

      <!-- COLUMNA IZQUIERDA: TABLA Y FILTROS -->
      <div class="historial-left-col">

        <!-- Barra de Filtros Superior -->
        <div class="row items-center justify-between q-mb-md" style="gap: 12px; flex-wrap: wrap;">
          
          <!-- Filtro Tipo: Todos / Entradas / Salidas -->
          <div class="row items-center q-gutter-x-xs">
            <q-btn
              unelevated no-caps
              :color="filtroTipo === 'todos' ? 'primary' : 'white'"
              :text-color="filtroTipo === 'todos' ? 'white' : 'slate-700'"
              icon="tune"
              label="Todos"
              class="filter-btn text-weight-bold"
              :class="{ 'filter-btn--outline': filtroTipo !== 'todos' }"
              @click="filtroTipo = 'todos'; paginaActual = 1"
            />
            <q-btn
              unelevated no-caps
              :color="filtroTipo === 'recaudo' ? 'positive' : 'white'"
              :text-color="filtroTipo === 'recaudo' ? 'white' : 'positive'"
              icon="arrow_upward"
              label="Entradas"
              class="filter-btn text-weight-bold"
              :class="{ 'filter-btn--outline': filtroTipo !== 'recaudo' }"
              @click="filtroTipo = 'recaudo'; paginaActual = 1"
            />
            <q-btn
              unelevated no-caps
              :color="filtroTipo === 'gasto' ? 'negative' : 'white'"
              :text-color="filtroTipo === 'gasto' ? 'white' : 'negative'"
              icon="arrow_downward"
              label="Salidas"
              class="filter-btn text-weight-bold"
              :class="{ 'filter-btn--outline': filtroTipo !== 'gasto' }"
              @click="filtroTipo = 'gasto'; paginaActual = 1"
            />
          </div>

          <!-- Selector de Fecha y Buscador -->
          <div class="row items-center q-gutter-x-sm" style="flex: 1; justify-content: flex-end; min-width: 280px;">
            <div class="date-filter-box row items-center q-px-sm">
              <q-icon name="calendar_today" size="16px" color="slate-500" class="q-mr-xs" />
              <input
                type="date"
                v-model="filtroFecha"
                class="date-native-input"
                @change="buscarPorFecha"
              />
              <q-btn
                v-if="filtroFecha"
                flat round dense
                icon="close"
                size="xs"
                color="grey-6"
                title="Limpiar fecha / Ver todos"
                @click="verTodos"
              />
            </div>

            <q-input
              v-model="busqueda"
              dense outlined
              placeholder="Buscar descripción..."
              class="search-box"
              style="min-width: 180px; flex: 1; max-width: 260px;"
            >
              <template #prepend>
                <q-icon name="search" size="18px" color="grey-6" />
              </template>
              <template #append v-if="busqueda">
                <q-icon name="close" size="14px" class="cursor-pointer" @click="busqueda = ''" />
              </template>
            </q-input>
          </div>
        </div>

        <!-- Barra Flotante de Acciones Masivas (cuando hay items seleccionados) -->
        <transition name="fade">
          <div v-if="authStore.isAdmin && seleccionados.length > 0" class="bulk-action-bar row items-center justify-between q-px-md q-py-sm q-mb-md shadow-1">
            <div class="row items-center q-gutter-x-sm">
              <q-badge color="primary" class="q-px-sm q-py-xs text-weight-bold" style="font-size: 13px; border-radius: 8px;">
                <q-icon name="check_circle" size="14px" class="q-mr-xs" />
                {{ seleccionados.length }} seleccionados
              </q-badge>
              <span class="text-caption text-weight-bolder text-slate-800 gt-xs">
                Monto total: {{ formatCOP(montoTotalSeleccionados) }}
              </span>
              <q-btn
                v-if="seleccionados.length < movimientosFiltrados.length"
                flat dense no-caps
                size="sm"
                color="primary"
                icon="select_all"
                :label="`Seleccionar todos los filtrados (${movimientosFiltrados.length})`"
                class="text-weight-bold q-ml-xs gt-sm"
                @click="seleccionarTodosFiltrados"
              />
            </div>
            <div class="row items-center q-gutter-x-sm">
              <q-btn
                flat dense no-caps
                size="sm"
                color="slate-600"
                icon="close"
                label="Deseleccionar"
                class="text-weight-bold"
                @click="limpiarSeleccion"
              />
              <q-btn
                unelevated no-caps
                color="negative"
                icon="delete"
                :label="`Eliminar seleccionados (${seleccionados.length})`"
                class="text-weight-bold shadow-1 btn-delete-bulk"
                :loading="cargandoAccion"
                @click="confirmarEliminarMultiples"
              />
            </div>
          </div>
        </transition>

        <!-- Tabla Estilizada de Transacciones -->
        <div class="table-container">
          <div class="table-header row items-center text-slate-500 text-caption font-bold q-px-md q-py-sm">
            <div v-if="authStore.isAdmin" style="width: 36px;" class="text-center">
              <q-checkbox
                :model-value="todosPaginaSeleccionados"
                :indeterminate="algunosPaginaSeleccionados"
                dense
                color="primary"
                @update:model-value="toggleSeleccionarTodosPagina"
              />
            </div>
            <div style="width: 110px;">Fecha</div>
            <div style="flex: 1; min-width: 140px;">Descripción</div>
            <div style="width: 120px;" class="gt-xs">Categoría</div>
            <div style="width: 85px;" class="gt-xs text-center">Tipo</div>
            <div style="width: 105px;" class="text-right">Monto</div>
            <div style="width: 105px;" class="text-right gt-sm">Saldo</div>
            <div style="width: 36px;" class="text-center"></div>
          </div>

          <!-- Spinner Loading -->
          <div v-if="movimientosStore.loading" class="row justify-center q-py-xl">
            <q-spinner color="primary" size="36px" />
          </div>

          <!-- Empty State -->
          <div v-else-if="movimientosPaginados.length === 0" class="text-center text-slate-400 q-py-xl">
            <q-icon name="receipt_long" size="48px" color="grey-4" />
            <div class="text-body2 text-weight-bold text-slate-600 q-mt-sm">Sin movimientos registrados</div>
            <div class="text-caption text-slate-400">Intenta cambiar la fecha o limpiar los filtros de búsqueda</div>
            <q-btn flat no-caps color="primary" label="Ver todos los movimientos" class="q-mt-md text-weight-bold" @click="verTodos" />
          </div>

          <!-- Filas de Datos -->
          <div v-else>
            <div
              v-for="item in movimientosPaginados"
              :key="item._id"
              class="table-row row items-center q-px-md q-py-sm cursor-pointer"
              :class="{ 'table-row--selected': seleccionados.includes(item._id) }"
              @click="authStore.isAdmin ? abrirModalEdicion(item) : null"
            >
              <!-- Checkbox de Selección Masiva -->
              <div v-if="authStore.isAdmin" style="width: 36px;" class="text-center" @click.stop>
                <q-checkbox
                  v-model="seleccionados"
                  :val="item._id"
                  dense
                  color="primary"
                />
              </div>

              <!-- Fecha y Hora -->
              <div style="width: 110px;">
                <div class="text-weight-bold text-slate-900" style="font-size: 13px;">
                  {{ formatFechaCorta(item.fecha) }}
                </div>
                <div class="text-caption text-slate-400" style="font-size: 11px;">
                  {{ formatHora(item.createdAt) }}
                </div>
              </div>

              <!-- Descripción con Ícono Redondo -->
              <div class="row items-center q-gutter-x-sm" style="flex: 1; min-width: 140px;">
                <q-avatar
                  size="36px"
                  :color="tipoColorBg(item.tipo)"
                  :text-color="tipoColorText(item.tipo)"
                  :icon="tipoIcono(item.tipo)"
                  style="border-radius: 12px;"
                />
                <div style="min-width: 0;">
                  <div class="text-weight-bold text-slate-900 text-truncate" style="font-size: 13px; max-width: 220px;">
                    {{ item.descripcion || (item.tipo === 'recaudo' ? 'Cierre / Venta' : item.tipo) }}
                  </div>
                  <div class="text-caption text-slate-500 text-truncate" style="font-size: 11px; max-width: 220px;">
                    <span class="text-weight-bold">{{ item.cuenta }}</span>
                    <span v-if="item.cuentaDestino"> → {{ item.cuentaDestino }}</span>
                    <span v-if="item.creadoPor?.nombre"> · {{ item.creadoPor.nombre }}</span>
                  </div>
                </div>
              </div>

              <!-- Categoría (Badge Pill con Color) -->
              <div style="width: 120px;" class="gt-xs">
                <span class="categoria-badge" :style="estiloBadgeCategoria(item.categoria)">
                  {{ item.categoria || 'General' }}
                </span>
              </div>

              <!-- Tipo (Entrada / Salida / Traslado) -->
              <div style="width: 85px;" class="gt-xs text-center">
                <span
                  class="tipo-badge"
                  :class="{
                    'tipo-badge--entrada': item.tipo === 'recaudo',
                    'tipo-badge--salida': item.tipo === 'gasto',
                    'tipo-badge--traslado': item.tipo === 'transferencia'
                  }"
                >
                  <q-icon :name="item.tipo === 'recaudo' ? 'arrow_upward' : item.tipo === 'gasto' ? 'arrow_downward' : 'swap_horiz'" size="12px" class="q-mr-xs" />
                  {{ item.tipo === 'recaudo' ? 'Entrada' : item.tipo === 'gasto' ? 'Salida' : 'Traslado' }}
                </span>
              </div>

              <!-- Monto -->
              <div style="width: 105px;" class="text-right">
                <div
                  class="text-weight-bolder"
                  :class="item.tipo === 'recaudo' ? 'text-positive' : item.tipo === 'gasto' ? 'text-negative' : 'text-primary'"
                  style="font-size: 13.5px;"
                >
                  {{ item.tipo === 'recaudo' ? '+ ' : item.tipo === 'gasto' ? '- ' : '± ' }}{{ formatCOP(item.monto) }}
                </div>
              </div>

              <!-- Saldo Resultante -->
              <div style="width: 105px;" class="text-right gt-sm">
                <div class="text-weight-bold text-slate-700" style="font-size: 12.5px;">
                  {{ formatCOP(item.saldoEstimado) }}
                </div>
              </div>

              <!-- Acción / Flecha -->
              <div style="width: 36px;" class="text-center">
                <q-icon v-if="authStore.isAdmin" name="edit" size="16px" color="blue-6" class="cursor-pointer" title="Editar" />
                <q-icon v-else name="chevron_right" size="18px" color="grey-5" />
              </div>
            </div>
          </div>
        </div>

        <!-- Paginación Inferior -->
        <div class="row items-center justify-between q-mt-md" style="gap: 12px; flex-wrap: wrap;">
          <div class="text-caption text-slate-500 font-medium">
            Mostrando {{ movimientosPaginados.length }} de {{ movimientosFiltrados.length }} movimientos
          </div>
          <div v-if="totalPaginas > 1">
            <q-pagination
              v-model="paginaActual"
              :max="totalPaginas"
              :max-pages="5"
              boundary-numbers
              direction-links
              color="primary"
              size="sm"
            />
          </div>
        </div>

      </div>

      <!-- COLUMNA DERECHA: TARJETA DE CUENTA Y RESÚMENES (SIDEBAR IMAGEN 2) -->
      <div class="historial-right-col">

        <!-- Tarjeta Azul de Cuenta Activa -->
        <div class="cuenta-blue-card shadow-1">
          <div class="row items-center q-gutter-x-sm q-mb-md">
            <div class="cuenta-blue-card__icon">
              <q-icon :name="iconoCuenta(filtroCuenta)" size="20px" color="white" />
            </div>
            <div>
              <div class="text-weight-bolder text-white" style="font-size: 16px; line-height: 1.1;">
                {{ filtroCuenta === 'Todas' ? 'Resumen Global' : filtroCuenta }}
              </div>
              <div class="text-caption text-blue-2">
                {{ filtroCuenta === 'Todas' ? 'Todas las cuentas combinadas' : 'Cuenta de operaciones' }}
              </div>
            </div>
          </div>

          <!-- Saldo Gigante -->
          <div class="q-mb-md">
            <div class="text-caption text-blue-2 text-weight-bold">Saldo actual</div>
            <div class="text-h4 text-weight-bolder text-white" style="letter-spacing: -0.5px;">
              {{ formatCOP(saldoCuentaActiva) }}
            </div>
          </div>

          <!-- Métricas 3 Columnas -->
          <div class="cuenta-blue-card__stats row q-col-gutter-xs">
            <div class="col-4 text-center stat-box">
              <div class="text-caption text-green-3 font-medium" style="font-size: 10px;">Total entradas</div>
              <div class="text-weight-bolder text-white" style="font-size: 12px;">
                +{{ formatCOPCompacto(resumenPeriodo.entradas) }}
              </div>
            </div>
            <div class="col-4 text-center stat-box">
              <div class="text-caption text-red-2 font-medium" style="font-size: 10px;">Total salidas</div>
              <div class="text-weight-bolder text-white" style="font-size: 12px;">
                -{{ formatCOPCompacto(resumenPeriodo.salidas) }}
              </div>
            </div>
            <div class="col-4 text-center stat-box">
              <div class="text-caption text-blue-2 font-medium" style="font-size: 10px;">Neto período</div>
              <div class="text-weight-bolder text-white" style="font-size: 12px;">
                {{ formatCOPCompacto(resumenPeriodo.neto) }}
              </div>
            </div>
          </div>
        </div>

        <!-- Filtros Rápidos -->
        <div class="card-widget q-pa-md">
          <div class="text-subtitle2 text-weight-bolder text-slate-900 q-mb-sm">
            Filtros rápidos
          </div>
          <div class="row q-gutter-xs">
            <q-btn
              unelevated no-caps dense
              :color="filtroTipo === 'todos' ? 'primary' : 'grey-2'"
              :text-color="filtroTipo === 'todos' ? 'white' : 'slate-700'"
              label="Todos"
              class="col text-weight-bold"
              style="border-radius: 8px; font-size: 12px;"
              @click="filtroTipo = 'todos'; paginaActual = 1"
            />
            <q-btn
              unelevated no-caps dense
              :color="filtroTipo === 'recaudo' ? 'green-1' : 'grey-2'"
              :text-color="filtroTipo === 'recaudo' ? 'positive' : 'slate-700'"
              label="↑ Entradas"
              class="col text-weight-bold"
              style="border-radius: 8px; font-size: 12px;"
              @click="filtroTipo = 'recaudo'; paginaActual = 1"
            />
            <q-btn
              unelevated no-caps dense
              :color="filtroTipo === 'gasto' ? 'red-1' : 'grey-2'"
              :text-color="filtroTipo === 'gasto' ? 'negative' : 'slate-700'"
              label="↓ Salidas"
              class="col text-weight-bold"
              style="border-radius: 8px; font-size: 12px;"
              @click="filtroTipo = 'gasto'; paginaActual = 1"
            />
          </div>
        </div>

        <!-- Resumen del Período -->
        <div class="card-widget q-pa-md">
          <div class="text-subtitle2 text-weight-bolder text-slate-900 q-mb-md">
            Resumen del período
          </div>

          <div class="column q-gutter-y-sm">
            <div class="row items-center justify-between">
              <div class="row items-center text-slate-600 text-caption font-medium">
                <q-icon name="arrow_upward" color="positive" size="16px" class="q-mr-xs" />
                Entradas
              </div>
              <div class="text-weight-bolder text-positive" style="font-size: 13px;">
                + {{ formatCOP(resumenPeriodo.entradas) }}
              </div>
            </div>

            <div class="row items-center justify-between">
              <div class="row items-center text-slate-600 text-caption font-medium">
                <q-icon name="arrow_downward" color="negative" size="16px" class="q-mr-xs" />
                Salidas
              </div>
              <div class="text-weight-bolder text-negative" style="font-size: 13px;">
                - {{ formatCOP(resumenPeriodo.salidas) }}
              </div>
            </div>

            <q-separator color="slate-200" class="q-my-xs" />

            <div class="row items-center justify-between">
              <div class="text-slate-600 text-caption text-weight-bold">
                Balance neto
              </div>
              <div
                class="text-weight-bolder"
                :class="resumenPeriodo.neto >= 0 ? 'text-positive' : 'text-negative'"
                style="font-size: 13px;"
              >
                {{ resumenPeriodo.neto >= 0 ? '+ ' : '' }}{{ formatCOP(resumenPeriodo.neto) }}
              </div>
            </div>
          </div>
        </div>

        <!-- Botón Exportar Reporte Excel -->
        <q-btn
          unelevated no-caps
          color="primary"
          icon="table_view"
          label="Exportar reporte en Excel"
          class="full-width text-weight-bold shadow-1"
          style="border-radius: 14px; padding: 12px;"
          @click="exportarHistorialExcel"
        />

      </div>

    </div>

    <!-- ─── VISTA 2: CIERRES DIARIOS AGRUPADOS ─── -->
    <div v-else>
      <div v-if="movimientosStore.loading" class="column items-center q-py-xl">
        <q-spinner color="primary" size="36px" />
      </div>
      <div v-else-if="cierresAgrupados.length === 0" class="text-center text-slate-400 q-py-xl">
        <q-icon name="lock_clock" size="44px" color="grey-4" />
        <div class="text-body2 text-weight-bold text-slate-600 q-mt-sm">Sin cierres de caja registrados</div>
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
    </div>

    <!-- ─── MODAL EDICIÓN MOVIMIENTO (ADMIN) ─── -->
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
            <q-input v-model="formEdit.monto" type="number" prefix="$" borderless class="clean-input" />
          </div>
          <div>
            <div class="text-caption text-weight-bold text-slate-700 q-mb-xs">Categoría</div>
            <q-input v-model="formEdit.categoria" placeholder="Categoría" borderless class="clean-input" />
          </div>
          <div>
            <div class="text-caption text-weight-bold text-slate-700 q-mb-xs">Cuenta</div>
            <div class="row q-col-gutter-xs">
              <div v-for="c in cuentas" :key="c" class="col-4">
                <div class="pill-option text-center cursor-pointer" :class="{ active: formEdit.cuenta === c }" @click="formEdit.cuenta = c">{{ c }}</div>
              </div>
            </div>
          </div>
        </q-card-section>
        <q-card-actions class="row justify-between q-pt-md">
          <q-btn outline color="red-7" label="Eliminar" icon="delete" no-caps class="text-weight-bold" style="border-radius:12px;" :loading="cargandoAccion" @click="confirmarEliminar" />
          <q-btn color="primary" label="Guardar cambios" no-caps class="text-weight-bold" style="border-radius:12px; padding:8px 20px;" :loading="cargandoAccion" @click="guardarCambios" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- MODALES DE COMPARTIR Y AUDITORÍA -->
    <ModalCompartirCierre v-model="modalCompartir" :texto="textoCompartir" />
    <ModalVerificarAdmin v-model="modalVerificarAdmin" @autorizado="onAdminAutorizado" />
    <ModalEditarCierre v-model="modalEditarCierre" :cierre="cierreSeleccionadoParaEditar" @guardado="onCierreEditado" />

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useMovimientosStore } from '@/store/movimientosStore'
import { useCuentasStore } from '@/store/cuentasStore'
import { useAuthStore } from '@/store/authStore'
import { useConfiguracionStore } from '@/store/configuracionStore'
import { putData, deleteData, postData } from '@/services/apiService'
import { useQuasar } from 'quasar'
import * as XLSX from 'xlsx'
import ModalCompartirCierre from '@/components/ModalCompartirCierre.vue'
import CardCierreAgrupado from '@/components/CardCierreAgrupado.vue'
import ModalVerificarAdmin from '@/components/ModalVerificarAdmin.vue'
import ModalEditarCierre from '@/components/ModalEditarCierre.vue'
import { formatFechaLarga, formatFechaCorta, getFechaLocalHoy } from '@/utils/dateUtils'

const $q = useQuasar()
const route = useRoute()
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
const filtroCuenta = ref(route.query.cuenta ? String(route.query.cuenta) : 'Todas')
const filtroTipo = ref('todos')
const busqueda = ref('')
const pestanaActiva = ref('movimientos')
const modalEdicion = ref(false)
const cargandoAccion = ref(false)
const cuentas = ['Efectivo', 'Nequi', 'Bancolombia']

const paginaActual = ref(1)
const POR_PAGINA = 10

// ─── SELECCIÓN MÚLTIPLE DE MOVIMIENTOS ───
const seleccionados = ref([])

const todosPaginaSeleccionados = computed(() => {
  if (!movimientosPaginados.value.length) return false
  return movimientosPaginados.value.every(m => seleccionados.value.includes(m._id))
})

const algunosPaginaSeleccionados = computed(() => {
  if (todosPaginaSeleccionados.value) return false
  return movimientosPaginados.value.some(m => seleccionados.value.includes(m._id))
})

const toggleSeleccionarTodosPagina = (val) => {
  if (val) {
    const idsPagina = movimientosPaginados.value.map(m => m._id)
    seleccionados.value = Array.from(new Set([...seleccionados.value, ...idsPagina]))
  } else {
    const idsPaginaSet = new Set(movimientosPaginados.value.map(m => m._id))
    seleccionados.value = seleccionados.value.filter(id => !idsPaginaSet.has(id))
  }
}

const seleccionarTodosFiltrados = () => {
  seleccionados.value = movimientosFiltrados.value.map(m => m._id)
}

const limpiarSeleccion = () => {
  seleccionados.value = []
}

const montoTotalSeleccionados = computed(() => {
  const movs = movimientosStore.movimientos || []
  const mapMovs = new Map(movs.map(m => [m._id, m.monto || 0]))
  return seleccionados.value.reduce((sum, id) => sum + (mapMovs.get(id) || 0), 0)
})

// Saldo actual de la cuenta seleccionada
const saldoCuentaActiva = computed(() => {
  if (filtroCuenta.value === 'Todas') {
    return cuentasStore.totalSaldo
  }
  return cuentasStore.saldoPor(filtroCuenta.value)
})

// Filtrado de movimientos
const movimientosFiltrados = computed(() => {
  let list = movimientosStore.movimientos || []

  // Filtro por tipo
  if (filtroTipo.value === 'recaudo') {
    list = list.filter(m => m.tipo === 'recaudo')
  } else if (filtroTipo.value === 'gasto') {
    list = list.filter(m => m.tipo === 'gasto')
  } else if (filtroTipo.value === 'transferencia') {
    list = list.filter(m => m.tipo === 'transferencia')
  }

  // Filtro por cuenta
  if (filtroCuenta.value && filtroCuenta.value !== 'Todas') {
    list = list.filter(m => m.cuenta === filtroCuenta.value || m.cuentaDestino === filtroCuenta.value)
  }

  // Filtro por búsqueda
  if (busqueda.value.trim()) {
    const q = busqueda.value.toLowerCase().trim()
    list = list.filter(m =>
      (m.descripcion && m.descripcion.toLowerCase().includes(q)) ||
      (m.categoria && m.categoria.toLowerCase().includes(q)) ||
      (m.cuenta && m.cuenta.toLowerCase().includes(q)) ||
      (m.creadoPor?.nombre && m.creadoPor.nombre.toLowerCase().includes(q))
    )
  }

  return list
})

// Cálculo de saldos progresivos para cada movimiento
const movimientosConSaldo = computed(() => {
  const baseSaldo = saldoCuentaActiva.value
  let acumulador = baseSaldo

  return movimientosFiltrados.value.map((m, idx) => {
    // Estimación progresiva del saldo en esa transacción
    const saldoEstimado = Math.max(0, acumulador)
    if (m.tipo === 'recaudo') {
      acumulador -= m.monto
    } else if (m.tipo === 'gasto') {
      acumulador += m.monto
    }
    return {
      ...m,
      saldoEstimado
    }
  })
})

// Paginación
const totalPaginas = computed(() => Math.ceil(movimientosConSaldo.value.length / POR_PAGINA))
const movimientosPaginados = computed(() => {
  const inicio = (paginaActual.value - 1) * POR_PAGINA
  return movimientosConSaldo.value.slice(inicio, inicio + POR_PAGINA)
})

// Resumen del período seleccionado
const resumenPeriodo = computed(() => {
  const entradas = movimientosFiltrados.value
    .filter(m => m.tipo === 'recaudo' || (m.tipo === 'transferencia' && m.cuentaDestino === filtroCuenta.value))
    .reduce((s, m) => s + (m.monto || 0), 0)

  const salidas = movimientosFiltrados.value
    .filter(m => m.tipo === 'gasto' || (m.tipo === 'transferencia' && m.cuenta === filtroCuenta.value))
    .reduce((s, m) => s + (m.monto || 0), 0)

  return {
    entradas,
    salidas,
    neto: entradas - salidas
  }
})

// Formateadores
const formatCOP = (val) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(val ?? 0)

const formatCOPCompacto = (val) => {
  const n = Math.abs(val || 0)
  if (n >= 1000000) {
    return `$ ${(val / 1000000).toFixed(1)}M`
  }
  if (n >= 1000) {
    return `$ ${(val / 1000).toFixed(0)}k`
  }
  return formatCOP(val)
}

const formatHora = (fechaIso) => {
  if (!fechaIso) return '12:00 m.'
  try {
    const d = new Date(fechaIso)
    return d.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit', hour12: true })
  } catch (e) {
    return '12:00 m.'
  }
}

const iconoCuenta = (cuenta) => {
  if (cuenta === 'Nequi') return 'phone_android'
  if (cuenta === 'Bancolombia') return 'account_balance'
  if (cuenta === 'Efectivo') return 'payments'
  return 'account_balance_wallet'
}

const colorAvatar = (cuenta) => {
  if (cuenta === 'Nequi') return 'purple-7'
  if (cuenta === 'Bancolombia') return 'blue-8'
  if (cuenta === 'Efectivo') return 'positive'
  return 'primary'
}

const tipoIcono = (tipo) => {
  if (tipo === 'recaudo') return 'payments'
  if (tipo === 'gasto') return 'shopping_bag'
  return 'swap_horiz'
}

const tipoColorBg = (tipo) => {
  if (tipo === 'recaudo') return 'green-1'
  if (tipo === 'gasto') return 'red-1'
  return 'blue-1'
}

const tipoColorText = (tipo) => {
  if (tipo === 'recaudo') return 'positive'
  if (tipo === 'gasto') return 'negative'
  return 'primary'
}

const estiloBadgeCategoria = (categoria) => {
  const cat = String(categoria || '').toLowerCase()
  if (cat.includes('venta')) {
    return { background: '#ecfdf5', color: '#059669', border: '1px solid #a7f3d0' }
  }
  if (cat.includes('carne') || cat.includes('pollo') || cat.includes('comida')) {
    return { background: '#f5f3ff', color: '#7c3aed', border: '1px solid #ddd6fe' }
  }
  if (cat.includes('aseo') || cat.includes('servicio')) {
    return { background: '#eff6ff', color: '#2563eb', border: '1px solid #bfdbfe' }
  }
  if (cat.includes('tinto') || cat.includes('bebida')) {
    return { background: '#fff7ed', color: '#ea580c', border: '1px solid #fed7aa' }
  }
  return { background: '#f8fafc', color: '#475569', border: '1px solid #e2e8f0' }
}

const seleccionarCuenta = (c) => {
  filtroCuenta.value = c
  paginaActual.value = 1
}

// Cierres agrupados
const cierresAgrupados = computed(() => {
  const movs = movimientosStore.movimientos || []
  const grupos = {}
  movs.forEach(m => {
    if (m.tipo === 'recaudo' && (m.categoria === 'Ventas del día' || m.descripcion?.includes('Cierre') || m.descripcion?.includes('Recaudo'))) {
      const fechaClave = m.fecha ? m.fecha.split('T')[0] : 'desconocido'
      if (!grupos[fechaClave]) {
        grupos[fechaClave] = { fecha: m.fecha, createdAt: m.createdAt, creadoPor: m.creadoPor?.nombre || 'Empleado', efectivo: 0, nequi: 0, bancolombia: 0, gastosExternos: 0, devolucionPrestamo: 0, observaciones: '' }
      }
      if (m.cuenta === 'Efectivo') {
        grupos[fechaClave].efectivo += m.monto
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
    const gastosDia = movs.filter(m => m.tipo === 'gasto' && m.fecha && m.fecha.split('T')[0] === fechaISO).reduce((s, m) => s + m.monto, 0)
    const devPrestamo = Number(g.devolucionPrestamo || 0)
    const totalCierre = g.efectivo + g.nequi + g.bancolombia
    const gastosReales = gastosDia - (g.gastosExternos || 0)
    const totalVenta = totalCierre + gastosReales + devPrestamo
    return { ...g, devolucionPrestamo: devPrestamo, gastosDia, gastosReales, totalCierre, totalVenta }
  })
})

const formEdit = ref({ id: '', fecha: '', descripcion: '', monto: 0, categoria: '', cuenta: 'Efectivo' })

const buscarPorFecha = () => { limpiarSeleccion(); paginaActual.value = 1; movimientosStore.fetchPorFecha(filtroFecha.value) }
const verTodos = () => { limpiarSeleccion(); filtroFecha.value = ''; paginaActual.value = 1; movimientosStore.fetchMovimientos() }

const abrirModalEdicion = (mov) => {
  formEdit.value = { id: mov._id, fecha: mov.fecha ? mov.fecha.split('T')[0] : '', descripcion: mov.descripcion || '', monto: mov.monto, categoria: mov.categoria || '', cuenta: mov.cuenta || 'Efectivo' }
  modalEdicion.value = true
}

const guardarCambios = async () => {
  cargandoAccion.value = true
  try {
    await putData(`/movimientos/${formEdit.value.id}`, formEdit.value)
    $q.notify({ type: 'positive', message: '✅ Movimiento actualizado' })
    modalEdicion.value = false
    await Promise.all([buscarPorFecha(), cuentasStore.fetchCuentas()])
  } catch (e) {
    $q.notify({ type: 'negative', message: e.response?.data?.mensaje || '❌ Error al actualizar' })
  } finally { cargandoAccion.value = false }
}

const confirmarEliminar = () => {
  $q.dialog({ title: 'Confirmar eliminación', message: '¿Eliminar este movimiento?', cancel: true, persistent: true }).onOk(async () => {
    cargandoAccion.value = true
    try {
      await deleteData(`/movimientos/${formEdit.value.id}`)
      $q.notify({ type: 'positive', message: '🗑️ Movimiento eliminado' })
      modalEdicion.value = false
      await Promise.all([buscarPorFecha(), cuentasStore.fetchCuentas()])
    } catch (e) {
      $q.notify({ type: 'negative', message: e.response?.data?.mensaje || '❌ Error al eliminar' })
    } finally { cargandoAccion.value = false }
  })
}

// Eliminación masiva de movimientos seleccionados
const confirmarEliminarMultiples = () => {
  const cantidad = seleccionados.value.length
  if (cantidad === 0) return

  $q.dialog({
    title: '⚠️ Confirmar eliminación múltiple',
    message: `¿Estás seguro de que deseas eliminar permanentemente estos ${cantidad} movimientos por un valor total de ${formatCOP(montoTotalSeleccionados.value)}?\n\nLos saldos de las cuentas afectadas (Efectivo, Nequi, Bancolombia) se recalcularán automáticamente. Esta acción no se puede deshacer.`,
    cancel: { label: 'Cancelar', flat: true, noCaps: true, color: 'slate-600' },
    ok: { label: `Sí, eliminar ${cantidad} movimientos`, color: 'negative', unelevated: true, noCaps: true, class: 'text-weight-bold' },
    persistent: true
  }).onOk(async () => {
    cargandoAccion.value = true
    try {
      try {
        await postData('/movimientos/eliminar-multiples', { ids: seleccionados.value })
      } catch (errBulk) {
        console.warn('Fallback eliminando individualmente:', errBulk)
        for (const id of seleccionados.value) {
          await deleteData(`/movimientos/${id}`)
        }
      }
      $q.notify({
        type: 'positive',
        message: `🗑️ ${cantidad} movimientos eliminados correctamente`,
        icon: 'delete_sweep',
        position: 'top'
      })
      limpiarSeleccion()
      await Promise.all([buscarPorFecha(), cuentasStore.fetchCuentas()])
    } catch (e) {
      $q.notify({
        type: 'negative',
        message: e.response?.data?.mensaje || '❌ Error al eliminar movimientos seleccionados',
        position: 'top'
      })
    } finally {
      cargandoAccion.value = false
    }
  })
}

const iniciarEdicionCierre = (cierre) => {
  if (!authStore.isAdmin) { $q.notify({ type: 'warning', message: '🔒 Solo administradores pueden editar' }); return }
  cierreSeleccionadoParaEditar.value = cierre
  modalVerificarAdmin.value = true
}
const onAdminAutorizado = () => { modalEditarCierre.value = true }
const onCierreEditado = async () => { await Promise.all([buscarPorFecha(), cuentasStore.fetchCuentas()]) }

const abrirCompartirCierre = (cierre) => {
  const fechaStr = formatFechaLarga(cierre.fecha)
  const negocio = configStore.nombreNegocio || 'Negocio'
  textoCompartir.value = `📊 *CIERRE DE TURNO*\n${negocio.toUpperCase()} — ${fechaStr}\n${'─'.repeat(32)}\n🔴 Gastos del día:   ${formatCOP(cierre.gastosReales)}\n💵 Efectivo neto:    ${formatCOP(cierre.efectivo)}${cierre.devolucionPrestamo > 0 ? `\n🔄 Devolución deuda: ${formatCOP(cierre.devolucionPrestamo)}` : ''}\n📱 Nequi:            ${formatCOP(cierre.nequi)}\n🏦 Bancolombia:      ${formatCOP(cierre.bancolombia)}\n${'─'.repeat(32)}\n🔵 CIERRE TOTAL:     ${formatCOP(cierre.totalCierre)}\n🟢 VENTA TOTAL:      ${formatCOP(cierre.totalVenta)}\n${'─'.repeat(32)}\n👤 Registrado por: ${cierre.creadoPor}${cierre.observaciones ? `\n📝 ${cierre.observaciones}` : ''}`
  modalCompartir.value = true
}

const exportarHistorialExcel = () => {
  try {
    const movimientos = movimientosFiltrados.value || []
    if (!movimientos.length) { $q.notify({ type: 'warning', message: 'No hay movimientos para exportar' }); return }
    const nombreNegocio = configStore.nombreNegocio || 'Mi Negocio'
    const filtroTexto = filtroFecha.value ? `Fecha: ${filtroFecha.value}` : 'Todos los registros'
    const wb = XLSX.utils.book_new()
    let totalGastos = 0, totalRecaudos = 0
    movimientos.forEach(m => { if (m.tipo === 'gasto') totalGastos += m.monto; if (m.tipo === 'recaudo') totalRecaudos += m.monto })
    const aoa = [
      [`HISTORIAL DE MOVIMIENTOS - ${nombreNegocio.toUpperCase()}`],
      [`Filtro: ${filtroTexto}`],
      [`Generado: ${new Date().toLocaleDateString('es-CO')} ${new Date().toLocaleTimeString('es-CO')}`],
      [],
      ['Total Gastos:', totalGastos, 'Total Cierres:', totalRecaudos, 'Total Registros:', movimientos.length],
      [],
      ['Fecha', 'Tipo', 'Categoría', 'Descripción', 'Cuenta', 'Monto (COP)', 'Registrado Por'],
      ...movimientos.map(m => [
        m.fecha ? new Date(m.fecha).toISOString().split('T')[0] : '',
        m.tipo === 'gasto' ? 'Gasto' : (m.tipo === 'recaudo' ? 'Cierre' : 'Traslado'),
        m.categoria || '-', m.descripcion || '-', m.cuenta || 'Efectivo', m.monto, m.creadoPor?.nombre || 'Empleado'
      ])
    ]
    const ws = XLSX.utils.aoa_to_sheet(aoa)
    ws['!cols'] = [{ wch: 14 }, { wch: 12 }, { wch: 22 }, { wch: 38 }, { wch: 18 }, { wch: 18 }, { wch: 20 }]
    XLSX.utils.book_append_sheet(wb, ws, 'Movimientos')
    XLSX.writeFile(wb, `Movimientos_${nombreNegocio}_${filtroFecha.value || 'completo'}.xlsx`)
  } catch (e) { console.error('Error exportar Excel:', e) }
}

onMounted(async () => {
  await configStore.fetchConfiguracion()
  await cuentasStore.fetchCuentas()
  if (route.query.cuenta) {
    filtroCuenta.value = String(route.query.cuenta)
    filtroFecha.value = ''
    movimientosStore.fetchMovimientos()
  } else {
    buscarPorFecha()
  }
})
</script>

<style scoped>
.historial-grid-container {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 330px;
  gap: 24px;
  align-items: start;
}

@media (max-width: 1024px) {
  .historial-grid-container {
    grid-template-columns: 1fr;
  }
}

.historial-left-col {
  min-width: 0;
}

.historial-right-col {
  display: flex;
  flex-direction: column;
  gap: 16px;
  min-width: 0;
}

/* Botones de Filtro */
.filter-btn {
  border-radius: 10px;
  font-size: 13px;
  padding: 6px 14px;
}
.filter-btn--outline {
  border: 1px solid #e2e8f0 !important;
  background: #ffffff !important;
}

/* Date Input Custom Box */
.date-filter-box {
  border: 1px solid #cbd5e1;
  background: #ffffff;
  border-radius: 10px;
  height: 40px;
}
.date-native-input {
  border: none;
  outline: none;
  font-family: inherit;
  font-size: 13px;
  font-weight: 600;
  color: #334155;
  background: transparent;
  cursor: pointer;
}

/* Search Box */
.search-box :deep(.q-field__control) {
  border-radius: 10px;
  background: #ffffff;
  height: 40px;
}

/* Tabla Estilo Imagen 2 */
.table-container {
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  overflow: hidden;
  background: #ffffff;
}

.table-header {
  background: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-size: 11px;
}

.table-row {
  border-bottom: 1px solid #f1f5f9;
  transition: background-color 0.15s ease;
}
.table-row:hover {
  background-color: #f8fafc;
}
.table-row:last-child {
  border-bottom: none;
}
.table-row--selected {
  background-color: #eff6ff !important;
  border-left: 3px solid #3b82f6;
}

/* Barra de Selección Masiva */
.bulk-action-bar {
  background: #f0fdf4;
  border: 1.5px solid #86efac;
  border-radius: 14px;
}
.btn-delete-bulk {
  border-radius: 10px;
  font-size: 13px;
  padding: 6px 14px;
}
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}

/* Badges */
.categoria-badge {
  display: inline-block;
  padding: 3px 10px;
  border-radius: 12px;
  font-size: 11.5px;
  font-weight: 600;
  white-space: nowrap;
}

.tipo-badge {
  display: inline-flex;
  align-items: center;
  padding: 3px 8px;
  border-radius: 8px;
  font-size: 11px;
  font-weight: 700;
}
.tipo-badge--entrada {
  background: #ecfdf5;
  color: #16a34a;
}
.tipo-badge--salida {
  background: #fef2f2;
  color: #dc2626;
}
.tipo-badge--traslado {
  background: #eff6ff;
  color: #2563eb;
}

/* Tarjeta Azul Derecha */
.cuenta-blue-card {
  background: linear-gradient(135deg, #1e40af 0%, #2563eb 100%);
  border-radius: 20px;
  padding: 22px;
  color: #ffffff;
}
.cuenta-blue-card__icon {
  width: 38px;
  height: 38px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.cuenta-blue-card__stats {
  background: rgba(0, 0, 0, 0.15);
  border-radius: 14px;
  padding: 10px 4px;
}
.stat-box {
  border-right: 1px solid rgba(255, 255, 255, 0.15);
}
.stat-box:last-child {
  border-right: none;
}

.text-truncate {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
