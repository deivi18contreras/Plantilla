import { Router } from 'express';
import { obtenerResumenMes } from '../controller/resumenController.js';
import { verificarToken, soloAdmin } from '../middlewares/authMiddleware.js';

const router = Router();

// Solo admin puede ver el resumen financiero
router.get('/', verificarToken, soloAdmin, obtenerResumenMes);

export default router;
