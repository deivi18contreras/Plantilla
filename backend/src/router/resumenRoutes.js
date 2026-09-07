import { Router } from 'express';
import { obtenerResumenMes, obtenerTendenciaMensual } from '../controller/resumenController.js';
import { verificarToken, soloAdmin } from '../middlewares/authMiddleware.js';

const router = Router();

// Solo admin puede ver el resumen financiero
router.get('/', verificarToken, soloAdmin, obtenerResumenMes);

// Tendencia mensual: cuánto entra/sale por categoría en los últimos N meses
router.get('/tendencia', verificarToken, soloAdmin, obtenerTendenciaMensual);

export default router;
