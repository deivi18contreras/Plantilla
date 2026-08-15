import {Router} from 'express';
import { postRegistrarCuenta, listarCuentas } from '../controller/cuentasController.js';
import { verificarToken, soloAdmin } from '../middlewares/authMiddleware.js';

const router = Router();

router.post('/', verificarToken, soloAdmin, postRegistrarCuenta);
router.get('/', verificarToken, listarCuentas);

export default router;