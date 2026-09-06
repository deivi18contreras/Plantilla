import { Router } from 'express'
import { listarAhorros, editarNotas } from '../controller/ahorrosController.js'
import { verificarToken, soloAdmin } from '../middlewares/authMiddleware.js'

const router = Router()

// Historial de ahorros mes a mes
router.get('/', verificarToken, listarAhorros)

// Editar nota de un mes (solo admin)
router.put('/:id/notas', verificarToken, soloAdmin, editarNotas)

export default router
