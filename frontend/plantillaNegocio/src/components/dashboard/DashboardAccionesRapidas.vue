<template>
  <div class="card-widget full-height column justify-between">
    <!-- Header -->
    <div class="row items-center q-gutter-x-sm q-mb-md">
      <div class="dash-icon-box bg-blue-1 text-primary">
        <q-icon name="widgets" size="20px" />
      </div>
      <span class="text-subtitle1 text-weight-bolder text-slate-900">Acciones rápidas</span>
    </div>

    <!-- Contenedor de Botones -->
    <div class="column q-gutter-y-sm">
      
      <!-- 1. Botón Principal Verde: Hacer Cierre de Turno -->
      <q-btn
        unelevated no-caps
        color="positive"
        class="cierre-btn text-weight-bolder full-width"
        @click="navegar('/recaudo')"
      >
        <div class="row items-center justify-center q-gutter-x-sm">
          <q-icon name="check_circle" size="22px" />
          <span style="font-size: 15px;">Hacer Cierre de Turno</span>
        </div>
      </q-btn>

      <!-- 2x2 Grid de Botones con Colores Vibrantes -->
      <div class="row q-col-gutter-xs">
        <!-- Registrar Gasto -->
        <div class="col-6">
          <q-btn
            unelevated no-caps
            class="action-grid-btn full-width"
            style="background: #3b82f6; color: white;"
            @click="navegar('/gasto')"
          >
            <q-icon name="add" size="18px" class="q-mr-xs" />
            <span>Registrar Gasto</span>
          </q-btn>
        </div>

        <!-- Registrar Adelanto Interno -->
        <div class="col-6">
          <q-btn
            unelevated no-caps
            class="action-grid-btn full-width"
            style="background: #f97316; color: white;"
            @click="navegar('/adelantos')"
          >
            <q-icon name="payments" size="18px" class="q-mr-xs" />
            <span>Registrar Adelanto</span>
          </q-btn>
        </div>

        <!-- Gastos Fijos -->
        <div class="col-6">
          <q-btn
            unelevated no-caps
            class="action-grid-btn full-width"
            style="background: #8b5cf6; color: white;"
            @click="navegar('/gastos-fijos')"
          >
            <q-icon name="event_repeat" size="18px" class="q-mr-xs" />
            <span>Gastos Fijos</span>
          </q-btn>
        </div>

        <!-- Transferir entre Cuentas -->
        <div class="col-6">
          <q-btn
            unelevated no-caps
            class="action-grid-btn full-width"
            style="background: #0d9488; color: white;"
            @click="navegar('/transferencia')"
          >
            <q-icon name="swap_horiz" size="18px" class="q-mr-xs" />
            <span>Transferir Fondos</span>
          </q-btn>
        </div>
      </div>

      <!-- 3. Botón Morado Índigo: Ver Resumen del Mes -->
      <q-btn
        unelevated no-caps
        class="resumen-btn full-width text-weight-bold"
        style="background: #4338ca; color: white;"
        @click="navegar('/resumen')"
      >
        <div class="row items-center justify-center q-gutter-x-xs">
          <q-icon name="signal_cellular_alt" size="20px" />
          <span>Ver Resumen del Mes</span>
        </div>
      </q-btn>

    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()
const navegar = (ruta) => router.push(ruta)
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

.cierre-btn {
  background: #059669 !important;
  border-radius: 14px;
  height: 48px;
  box-shadow: 0 4px 14px rgba(5, 150, 105, 0.25);
}

.action-grid-btn {
  border-radius: 12px;
  height: 46px;
  font-size: 12px;
  font-weight: 700;
  padding: 4px 8px;
}

.resumen-btn {
  border-radius: 14px;
  height: 44px;
  font-size: 13.5px;
}
</style>
