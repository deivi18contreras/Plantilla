import Remanente from '../models/Remanente.js';

// ─── GET /api/remanentes/disponibles ──────────────────────────────────────────
// Lista los sobres de días anteriores que aún tienen efectivo disponible
export const listarRemanentesDisponibles = async (req, res) => {
    try {
        const disponibles = await Remanente.find({
            saldoDisponible: { $gt: 0 },
            activo: true
        }).sort({ fecha: -1 });

        res.status(200).json(disponibles);
    } catch (error) {
        res.status(500).json({
            mensaje: '❌ Error al listar remanentes disponibles',
            error: error.message
        });
    }
};

// ─── GET /api/remanentes ──────────────────────────────────────────────────────
// Lista todos los sobres de remanentes (con saldo o ya agotados)
export const listarTodosRemanentes = async (req, res) => {
    try {
        const remanentes = await Remanente.find({ activo: true }).sort({ fecha: -1 });
        res.status(200).json(remanentes);
    } catch (error) {
        res.status(500).json({
            mensaje: '❌ Error al listar todos los remanentes',
            error: error.message
        });
    }
};

