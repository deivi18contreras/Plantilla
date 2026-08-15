import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import Usuario from '../models/Usuario.js';


export const verificarToken = async (req, res, next) => {
    try {
        // Extraer token del header Authorization: Bearer <token>
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                mensaje: '❌ Acceso denegado. Token no proporcionado'
            });
        }

        const token = authHeader.split(' ')[1];

        // Verificar y decodificar token
        const decoded = jwt.verify(token, env.JWT_SECRET);

        // Buscar el usuario en la BD para confirmar que sigue activo
        const usuario = await Usuario.findById(decoded.id);
        if (!usuario || !usuario.activo) {
            return res.status(401).json({
                mensaje: '❌ Token inválido o usuario desactivado'
            });
        }

        // Inyectar usuario en el request para los controllers
        req.user = {
            id: usuario._id,
            nombre: usuario.nombre,
            email: usuario.email,
            rol: usuario.rol
        };

        next();

    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                mensaje: '❌ El token ha expirado. Inicia sesión nuevamente'
            });
        }
        return res.status(401).json({
            mensaje: '❌ Token inválido',
            error: error.message
        });
    }
};


// Middleware para verificar rol de administrador
export const soloAdmin = (req, res, next) => {
    if (req.user?.rol !== 'admin') {
        return res.status(403).json({
            mensaje: '❌ Acceso denegado. Se requiere rol de administrador'
        });
    }
    next();
};
