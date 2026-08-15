import jwt from 'jsonwebtoken';
import Usuario from '../models/Usuario.js';
import { env } from '../config/env.js';


// ─── Generar token JWT ────────────────────────────────────────────────────────
const generarToken = (id) => {
    const secret = env.JWT_SECRET || 'finanzas_negocio_jwt_super_secreto_2026_deivi';
    return jwt.sign({ id }, secret, {
        expiresIn: env.JWT_EXPIRES_IN || '8h'
    });
};


// ─── POST /api/auth/registro ──────────────────────────────────────────────────
export const registrarUsuario = async (req, res) => {
    try {
        const { nombre, email, password, rol } = req.body;

        if (!nombre || !email || !password) {
            return res.status(400).json({
                mensaje: '❌ nombre, email y password son obligatorios'
            });
        }

        // Normalizar email antes de buscar
        const emailNormalizado = email.toLowerCase().trim();

        // Verificar si el email ya existe
        const existe = await Usuario.findOne({ email: emailNormalizado });
        if (existe) {
            return res.status(409).json({
                mensaje: '❌ Ya existe un usuario con ese email'
            });
        }

        // Por seguridad, todo registro público crea usuarios con rol 'empleado'
        const usuario = await Usuario.create({
            nombre: nombre.trim(),
            email: emailNormalizado,
            password,
            rol: 'empleado'
        });

        res.status(201).json({
            mensaje: '✅ Usuario registrado correctamente',
            usuario,
            token: generarToken(usuario._id)
        });

    } catch (error) {
        console.error('❌ Error en registrarUsuario:', error);
        res.status(500).json({
            mensaje: '❌ Error al registrar usuario',
            error: error.message
        });
    }
};


// ─── POST /api/auth/login ─────────────────────────────────────────────────────
export const loginUsuario = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                mensaje: '❌ email y password son obligatorios'
            });
        }

        // Normalizar email igual que al registrar
        const emailNormalizado = email.toLowerCase().trim();

        // Buscar usuario trayendo explícitamente el campo password
        const usuario = await Usuario.findOne({ email: emailNormalizado }).select('nombre email rol activo password');
        if (!usuario) {
            return res.status(401).json({
                mensaje: '❌ Credenciales incorrectas'
            });
        }

        // Verificar que el usuario esté activo
        if (!usuario.activo) {
            return res.status(401).json({
                mensaje: '❌ Usuario desactivado. Contacta al administrador'
            });
        }

        // Comparar password
        const passwordCorrecta = await usuario.compararPassword(password);
        if (!passwordCorrecta) {
            return res.status(401).json({
                mensaje: '❌ Credenciales incorrectas'
            });
        }

        res.status(200).json({
            mensaje: '✅ Login exitoso',
            usuario,
            token: generarToken(usuario._id)
        });

    } catch (error) {
        res.status(500).json({
            mensaje: '❌ Error al iniciar sesión',
            error: error.message
        });
    }
};


// ─── GET /api/auth/perfil ─────────────────────────────────────────────────────
export const obtenerPerfil = async (req, res) => {
    try {
        // req.user lo inyecta el middleware verificarToken
        const usuario = await Usuario.findById(req.user.id);
        if (!usuario) {
            return res.status(404).json({ mensaje: '❌ Usuario no encontrado' });
        }

        res.status(200).json(usuario);

    } catch (error) {
        res.status(500).json({
            mensaje: '❌ Error al obtener perfil',
            error: error.message
        });
    }
};
