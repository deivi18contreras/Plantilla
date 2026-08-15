import { Router } from 'express';
import { listarUsuarios, cambiarRol, toggleActivo } from '../controller/usuariosController.js';
import { verificarToken, soloAdmin } from '../middlewares/authMiddleware.js';

const router = Router();

// Todas las rutas solo para Admin
router.get('/', verificarToken, soloAdmin, listarUsuarios);
router.put('/:id/rol', verificarToken, soloAdmin, cambiarRol);
router.put('/:id/activo', verificarToken, soloAdmin, toggleActivo);

export default router;
