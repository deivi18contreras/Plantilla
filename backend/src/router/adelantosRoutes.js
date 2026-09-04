import { Router } from 'express'
import {
  registrarAdelanto,
  listarAdelantosPendientes,
  listarTodosAdelantos
} from '../controller/adelantosController.js'
import { verificarToken, soloAdmin } from '../middlewares/authMiddleware.js'

const router = Router()

// Listar todos los adelantos (admin ve el historial completo)
router.get('/', verificarToken, listarTodosAdelantos)

// Listar solo los pendientes (para el dashboard)
router.get('/pendientes', verificarToken, listarAdelantosPendientes)

// Registrar un nuevo adelanto (solo admin)
router.post('/', verificarToken, soloAdmin, registrarAdelanto)

export default router
