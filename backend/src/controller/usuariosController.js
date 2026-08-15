import Usuario from '../models/Usuario.js';

// ─── GET /api/usuarios ────────────────────────────────────────────────────────
export const listarUsuarios = async (req, res) => {
    try {
        const usuarios = await Usuario.find().select('-password').sort({ createdAt: -1 });
        res.status(200).json(usuarios);
    } catch (error) {
        res.status(500).json({ mensaje: '❌ Error al listar usuarios', error: error.message });
    }
};

// ─── PUT /api/usuarios/:id/rol ────────────────────────────────────────────────
export const cambiarRol = async (req, res) => {
    try {
        const { id } = req.params;
        const { rol } = req.body;

        if (!['admin', 'empleado'].includes(rol)) {
            return res.status(400).json({ mensaje: '❌ Rol inválido. Debe ser admin o empleado' });
        }

        // No puede cambiarse a sí mismo para evitar quedarse sin acceso
        if (id === req.user.id.toString()) {
            return res.status(400).json({ mensaje: '❌ No puedes cambiar tu propio rol' });
        }

        const usuario = await Usuario.findByIdAndUpdate(id, { rol }, { new: true }).select('-password');
        if (!usuario) {
            return res.status(404).json({ mensaje: '❌ Usuario no encontrado' });
        }

        res.status(200).json({ mensaje: `✅ Rol cambiado a ${rol}`, usuario });
    } catch (error) {
        res.status(500).json({ mensaje: '❌ Error al cambiar rol', error: error.message });
    }
};

// ─── PUT /api/usuarios/:id/activo ─────────────────────────────────────────────
export const toggleActivo = async (req, res) => {
    try {
        const { id } = req.params;

        if (id === req.user.id.toString()) {
            return res.status(400).json({ mensaje: '❌ No puedes desactivar tu propia cuenta' });
        }

        const usuario = await Usuario.findById(id);
        if (!usuario) {
            return res.status(404).json({ mensaje: '❌ Usuario no encontrado' });
        }

        usuario.activo = !usuario.activo;
        await usuario.save();

        const estadoTexto = usuario.activo ? 'activado' : 'desactivado';
        res.status(200).json({ mensaje: `✅ Usuario ${estadoTexto} correctamente`, usuario });
    } catch (error) {
        res.status(500).json({ mensaje: '❌ Error al cambiar estado del usuario', error: error.message });
    }
};
