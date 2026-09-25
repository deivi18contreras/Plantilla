import mongoose from 'mongoose';
import Remanente from '../models/Remanente.js';
import Cuenta from '../models/Cuentas.js';

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

// ─── POST /api/remanentes/consolidar ─────────────────────────────────────────
// Junta todos los sobres activos en uno solo con la fecha indicada
export const consolidarSobres = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { fecha, monto, observacion } = req.body;

        const cuentaEf = await Cuenta.findOne({ nombre: 'Efectivo' }).session(session);
        const montoFinal = monto !== undefined ? Number(monto) : (cuentaEf ? cuentaEf.saldo : 0);

        if (montoFinal < 0) {
            await session.abortTransaction();
            session.endSession();
            return res.status(400).json({ mensaje: '❌ El monto no puede ser negativo' });
        }

        const fechaObj = fecha ? new Date(fecha) : new Date();

        // 1. Archivar todos los sobres activos anteriores
        await Remanente.updateMany(
            { activo: true },
            { 
                $set: { 
                    activo: false, 
                    archivadoMotivo: observacion || `Consolidado en sobre único al ${fechaObj.toISOString().split('T')[0]}` 
                } 
            }
        ).session(session);

        // 2. Crear el nuevo sobre consolidado
        const [nuevoSobre] = await Remanente.create(
            [{
                fecha: fechaObj,
                montoInicial: montoFinal,
                saldoDisponible: montoFinal,
                montoGastado: 0,
                activo: true,
                esConsolidado: true,
                usos: []
            }],
            { session }
        );

        // 3. Asegurar que la cuenta de Efectivo tenga este mismo saldo
        if (cuentaEf) {
            cuentaEf.saldo = montoFinal;
            await cuentaEf.save({ session });
        }

        await session.commitTransaction();
        session.endSession();

        res.status(201).json({
            mensaje: '✅ Sobres unificados correctamente en un solo sobre',
            sobre: nuevoSobre
        });

    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        res.status(500).json({
            mensaje: '❌ Error al consolidar sobres',
            error: error.message
        });
    }
};

