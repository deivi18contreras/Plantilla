import { Router } from 'express';
import {
    registrarGasto,
    registrarRecaudo,
    registrarTransferencia,
    registrarCierreDiario,
    editarCierreDiario,
    listarMovimientos,
    editarMovimiento,
    eliminarMovimiento,
    importarGastos
} from '../controller/movimientosController.js';
import { verificarToken, soloAdmin } from '../middlewares/authMiddleware.js';

const router = Router();

router.post('/gasto', verificarToken, registrarGasto);
router.post('/recaudo', verificarToken, registrarRecaudo);
router.post('/cierre-diario', verificarToken, registrarCierreDiario);
router.put('/cierre-diario', verificarToken, soloAdmin, editarCierreDiario);
router.post('/transferencia', verificarToken, registrarTransferencia);
router.post('/importar-gastos', verificarToken, importarGastos);
router.get('/', verificarToken, listarMovimientos);
router.put('/:id', verificarToken, editarMovimiento);
router.delete('/:id', verificarToken, eliminarMovimiento);

export default router;
