import express from 'express';
import { verificarToken } from '../middlewares/authMiddleware.js';
import { listarRemanentesDisponibles, listarTodosRemanentes, consolidarSobres } from '../controller/remanentesController.js';

const router = express.Router();

router.get('/disponibles', verificarToken, listarRemanentesDisponibles);
router.get('/', verificarToken, listarTodosRemanentes);
router.post('/consolidar', verificarToken, consolidarSobres);

export default router;

