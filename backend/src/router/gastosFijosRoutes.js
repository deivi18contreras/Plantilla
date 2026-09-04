import { Router } from 'express'
import {
  listarGastosFijos,
  listarGastosFijosProximos,
  crearGastoFijo,
  editarGastoFijo,
  confirmarPagoGastoFijo,
  desactivarGastoFijo
} from '../controller/gastosFijosController.js'
import { verificarToken, soloAdmin } from '../middlewares/authMiddleware.js'

const router = Router()

// Ver todos los activos
router.get('/', verificarToken, listarGastosFijos)

// Ver los que vencen pronto (para widget del dashboard) — ?dias=7
router.get('/proximos', verificarToken, listarGastosFijosProximos)

// Crear uno nuevo (solo admin)
router.post('/', verificarToken, soloAdmin, crearGastoFijo)

// Editar uno existente (solo admin)
router.put('/:id', verificarToken, soloAdmin, editarGastoFijo)

// Confirmar el pago de un gasto fijo (crea el Movimiento y recalcula fecha)
router.post('/:id/confirmar-pago', verificarToken, confirmarPagoGastoFijo)

// Desactivar (no elimina, solo marca activo = false)
router.delete('/:id', verificarToken, soloAdmin, desactivarGastoFijo)

export default router
