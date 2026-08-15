import { Router } from 'express';
import {
    registrarUsuario,
    loginUsuario,
    obtenerPerfil
} from '../controller/authController.js';
import { verificarToken, soloAdmin } from '../middlewares/authMiddleware.js';

const router = Router();

// Registro — público para que el dueño pueda crear su cuenta
router.post('/registro', registrarUsuario);

// Login — público (no requiere token)
router.post('/login', loginUsuario);

// Perfil — requiere token
router.get('/perfil', verificarToken, obtenerPerfil);

export default router;
