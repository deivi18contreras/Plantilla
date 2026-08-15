import { Router } from 'express'
import { obtenerConfiguracion, actualizarConfiguracion } from '../controller/configuracionController.js'
import { verificarToken, soloAdmin } from '../middlewares/authMiddleware.js'

const router = Router()

// GET  /api/configuracion        → cualquier usuario autenticado puede leer
router.get('/', verificarToken, obtenerConfiguracion)

// PUT  /api/configuracion        → solo admin puede modificar
router.put('/', verificarToken, soloAdmin, actualizarConfiguracion)

export default router
