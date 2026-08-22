import mongoose from 'mongoose';
import Movimiento from '../models/Movimientos.js';
import Cuenta from '../models/Cuentas.js';

// ─── POST /api/movimientos/gasto ──────────────────────────────────────────────
export const registrarGasto = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { fecha, descripcion, categoria, monto, cuenta } = req.body;

        if (!fecha || !monto || !cuenta) {
            await session.abortTransaction();
            session.endSession();
            return res.status(400).json({ mensaje: '❌ fecha, monto y cuenta son obligatorios' });
        }

        let cuentaDoc = await Cuenta.findOne({ nombre: cuenta }).session(session);
        if (!cuentaDoc) {
            const [nuevaCuenta] = await Cuenta.create([{ nombre: cuenta, saldo: cuenta === 'Efectivo' ? 600000 : 0 }], { session });
            cuentaDoc = nuevaCuenta;
        }

        let advertencia = null;
        if (cuentaDoc.saldo < monto) {
            advertencia = `⚠️ El saldo de ${cuenta} quedó negativo temporalmente. Se regularización al registrar el Cierre Diario de hoy.`;
        }

        // Crear el movimiento de gasto
        const [movimiento] = await Movimiento.create(
            [{ fecha, tipo: 'gasto', descripcion, categoria, monto: Number(monto), cuenta, creadoPor: req.user.id }],
            { session }
        );

        // Descontar del saldo
        cuentaDoc.saldo -= Number(monto);
        await cuentaDoc.save({ session });

        await session.commitTransaction();
        session.endSession();

        res.status(201).json({
            mensaje: '✅ Gasto registrado correctamente',
            advertencia,
            movimiento,
            nuevoSaldo: cuentaDoc.saldo
        });

    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        res.status(500).json({
            mensaje: '❌ Error al registrar gasto',
            error: error.message
        });
    }
};

// ─── POST /api/movimientos/cierre-diario (UNIFICADO) ─────────────────────────
export const registrarCierreDiario = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { fecha, efectivoContado, recaudoNequi, recaudoBancolombia, observaciones, gastosExternos } = req.body;

        if (!fecha) {
            await session.abortTransaction();
            session.endSession();
            return res.status(400).json({ mensaje: '❌ La fecha es obligatoria' });
        }

        const BASE_EFECTIVO = 600000;
        const eContado = Number(efectivoContado || 0);
        const rNequi = Number(recaudoNequi || 0);
        const rBancolombia = Number(recaudoBancolombia || 0);
        const gExt = Number(gastosExternos || 0);

        // Arqueo Efectivo Neto sobrante (por encima de los $600.000 de base)
        const recaudoEfectivoNeto = Math.max(0, eContado - BASE_EFECTIVO);

        const movimientosCreados = [];

        // 1. Procesar Efectivo: El recaudo neto guardado en el movimiento es recaudoEfectivoNeto (ej: $12.000)
        let cuentaEfectivo = await Cuenta.findOne({ nombre: 'Efectivo' }).session(session);
        if (!cuentaEfectivo) {
            const [c] = await Cuenta.create([{ nombre: 'Efectivo', saldo: BASE_EFECTIVO }], { session });
            cuentaEfectivo = c;
        }

        const [mEfectivo] = await Movimiento.create(
            [{ 
                fecha,
                tipo: 'recaudo',
                descripcion: observaciones || `Cierre de caja (Contado: $${eContado.toLocaleString('es-CO')})`,
                categoria: 'Ventas del día',
                monto: recaudoEfectivoNeto,
                cuenta: 'Efectivo',
                gastosExternos: gExt,
                creadoPor: req.user.id
            }],
            { session }
        );
        movimientosCreados.push(mEfectivo);

        // Ajustar el saldo de Efectivo en caja al dinero contado real (Base + Neto)
        cuentaEfectivo.saldo = eContado > 0 ? eContado : (cuentaEfectivo.saldo + recaudoEfectivoNeto);
        await cuentaEfectivo.save({ session });

        // 2. Procesar Nequi
        if (rNequi > 0) {
            let cuentaNequi = await Cuenta.findOne({ nombre: 'Nequi' }).session(session);
            if (!cuentaNequi) {
                const [c] = await Cuenta.create([{ nombre: 'Nequi', saldo: 0 }], { session });
                cuentaNequi = c;
            }

            const [mNequi] = await Movimiento.create(
                [{
                    fecha,
                    tipo: 'recaudo',
                    descripcion: `Recaudo Nequi del día`,
                    categoria: 'Ventas del día',
                    monto: rNequi,
                    cuenta: 'Nequi',
                    creadoPor: req.user.id
                }],
                { session }
            );
            movimientosCreados.push(mNequi);

            cuentaNequi.saldo += rNequi;
            await cuentaNequi.save({ session });
        }

        // 3. Procesar Bancolombia
        if (rBancolombia > 0) {
            let cuentaBancolombia = await Cuenta.findOne({ nombre: 'Bancolombia' }).session(session);
            if (!cuentaBancolombia) {
                const [c] = await Cuenta.create([{ nombre: 'Bancolombia', saldo: 0 }], { session });
                cuentaBancolombia = c;
            }

            const [mBancolombia] = await Movimiento.create(
                [{
                    fecha,
                    tipo: 'recaudo',
                    descripcion: `Recaudo Bancolombia del día`,
                    categoria: 'Ventas del día',
                    monto: rBancolombia,
                    cuenta: 'Bancolombia',
                    creadoPor: req.user.id
                }],
                { session }
            );
            movimientosCreados.push(mBancolombia);

            cuentaBancolombia.saldo += rBancolombia;
            await cuentaBancolombia.save({ session });
        }

        await session.commitTransaction();
        session.endSession();

        res.status(201).json({
            mensaje: '✅ Cierre Diario completo registrado exitosamente',
            recaudoEfectivoNeto,
            movimientos: movimientosCreados
        });

    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        res.status(500).json({
            mensaje: '❌ Error al registrar cierre diario unificado',
            error: error.message
        });
    }
};

// ─── POST /api/movimientos/recaudo ───────────────────────────────────────────
export const registrarRecaudo = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { fecha, descripcion, categoria, monto, cuenta } = req.body;

        if (!fecha || !monto || !cuenta) {
            await session.abortTransaction();
            session.endSession();
            return res.status(400).json({ mensaje: '❌ fecha, monto y cuenta son obligatorios' });
        }

        let cuentaDoc = await Cuenta.findOne({ nombre: cuenta }).session(session);
        if (!cuentaDoc) {
            const [nuevaCuenta] = await Cuenta.create([{ nombre: cuenta, saldo: cuenta === 'Efectivo' ? 600000 : 0 }], { session });
            cuentaDoc = nuevaCuenta;
        }

        const [movimiento] = await Movimiento.create(
            [{ fecha, tipo: 'recaudo', descripcion, categoria, monto: Number(monto), cuenta, creadoPor: req.user.id }],
            { session }
        );

        cuentaDoc.saldo += Number(monto);
        await cuentaDoc.save({ session });

        await session.commitTransaction();
        session.endSession();

        res.status(201).json({
            mensaje: '✅ Recaudo registrado correctamente',
            movimiento,
            nuevoSaldo: cuentaDoc.saldo
        });

    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        res.status(500).json({
            mensaje: '❌ Error al registrar recaudo',
            error: error.message
        });
    }
};

// ─── POST /api/movimientos/transferencia ──────────────────────────────────────
export const registrarTransferencia = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { fecha, descripcion, monto, cuenta, cuentaDestino } = req.body;

        if (!fecha || !monto || !cuenta || !cuentaDestino) {
            await session.abortTransaction();
            session.endSession();
            return res.status(400).json({ mensaje: '❌ fecha, monto, cuenta y cuentaDestino son obligatorios' });
        }

        if (cuenta === cuentaDestino) {
            await session.abortTransaction();
            session.endSession();
            return res.status(400).json({ mensaje: '❌ La cuenta origen y destino no pueden ser la misma' });
        }

        const cuentaOrigen = await Cuenta.findOne({ nombre: cuenta }).session(session);
        if (!cuentaOrigen) {
            await session.abortTransaction();
            session.endSession();
            return res.status(404).json({ mensaje: `❌ Cuenta origen "${cuenta}" no encontrada` });
        }

        if (cuentaOrigen.saldo < monto) {
            await session.abortTransaction();
            session.endSession();
            return res.status(400).json({
                mensaje: '❌ Saldo insuficiente en cuenta origen',
                saldoActual: cuentaOrigen.saldo,
                montoSolicitado: monto
            });
        }

        const cuentaDest = await Cuenta.findOne({ nombre: cuentaDestino }).session(session);
        if (!cuentaDest) {
            await session.abortTransaction();
            session.endSession();
            return res.status(404).json({ mensaje: `❌ Cuenta destino "${cuentaDestino}" no encontrada` });
        }

        const [movimiento] = await Movimiento.create(
            [{ fecha, tipo: 'transferencia', descripcion, monto: Number(monto), cuenta, cuentaDestino, creadoPor: req.user.id }],
            { session }
        );

        cuentaOrigen.saldo -= Number(monto);
        cuentaDest.saldo += Number(monto);
        await cuentaOrigen.save({ session });
        await cuentaDest.save({ session });

        await session.commitTransaction();
        session.endSession();

        res.status(201).json({
            mensaje: '✅ Transferencia realizada correctamente',
            movimiento,
            saldos: {
                [cuenta]: cuentaOrigen.saldo,
                [cuentaDestino]: cuentaDest.saldo
            }
        });

    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        res.status(500).json({
            mensaje: '❌ Error al realizar transferencia',
            error: error.message
        });
    }
};

// ─── GET /api/movimientos ─────────────────────────────────────────────────────
export const listarMovimientos = async (req, res) => {
    try {
        const { fecha, desde, hasta, page = 1, limit = 200 } = req.query;
        let filtro = {};

        if (fecha) {
            const inicio = new Date(fecha);
            const fin = new Date(fecha);
            fin.setHours(23, 59, 59, 999);
            filtro.fecha = { $gte: inicio, $lte: fin };
        } else if (desde || hasta) {
            filtro.fecha = {};
            if (desde) filtro.fecha.$gte = new Date(desde);
            if (hasta) {
                const finHasta = new Date(hasta);
                finHasta.setHours(23, 59, 59, 999);
                filtro.fecha.$lte = finHasta;
            }
        }

        const skip = (Number(page) - 1) * Number(limit);

        const movimientos = await Movimiento.find(filtro)
            .populate('creadoPor', 'nombre email')
            .sort({ fecha: -1 })
            .skip(skip)
            .limit(Number(limit));

        res.status(200).json(movimientos);

    } catch (error) {
        res.status(500).json({
            mensaje: '❌ Error al listar movimientos',
            error: error.message
        });
    }
};

// ─── PUT /api/movimientos/:id ──────────────────────────────────────────────────
export const editarMovimiento = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { id } = req.params;
        const { fecha, descripcion, categoria, monto, cuenta } = req.body;

        const movimientoViejo = await Movimiento.findById(id).session(session);
        if (!movimientoViejo) {
            await session.abortTransaction();
            session.endSession();
            return res.status(404).json({ mensaje: '❌ Movimiento no encontrado' });
        }

        const cuentaVieja = await Cuenta.findOne({ nombre: movimientoViejo.cuenta }).session(session);
        if (cuentaVieja) {
            if (movimientoViejo.tipo === 'gasto') {
                cuentaVieja.saldo += movimientoViejo.monto;
            } else if (movimientoViejo.tipo === 'recaudo') {
                cuentaVieja.saldo -= movimientoViejo.monto;
            }
            await cuentaVieja.save({ session });
        }

        const nuevaCuentaNombre = cuenta || movimientoViejo.cuenta;
        const nuevoMonto = monto !== undefined ? Number(monto) : movimientoViejo.monto;

        let cuentaNueva = await Cuenta.findOne({ nombre: nuevaCuentaNombre }).session(session);
        if (!cuentaNueva) {
            const [c] = await Cuenta.create([{ nombre: nuevaCuentaNombre, saldo: 0 }], { session });
            cuentaNueva = c;
        }

        if (movimientoViejo.tipo === 'gasto') {
            cuentaNueva.saldo -= nuevoMonto;
        } else if (movimientoViejo.tipo === 'recaudo') {
            cuentaNueva.saldo += nuevoMonto;
        }
        await cuentaNueva.save({ session });

        if (fecha) movimientoViejo.fecha = fecha;
        if (descripcion !== undefined) movimientoViejo.descripcion = descripcion;
        if (categoria !== undefined) movimientoViejo.categoria = categoria;
        if (monto !== undefined) movimientoViejo.monto = nuevoMonto;
        if (cuenta) movimientoViejo.cuenta = cuenta;

        await movimientoViejo.save({ session });

        await session.commitTransaction();
        session.endSession();

        res.status(200).json({
            mensaje: '✅ Movimiento actualizado correctamente',
            movimiento: movimientoViejo
        });

    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        res.status(500).json({
            mensaje: '❌ Error al editar movimiento',
            error: error.message
        });
    }
};

// ─── DELETE /api/movimientos/:id ───────────────────────────────────────────────
export const eliminarMovimiento = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { id } = req.params;
        const movimiento = await Movimiento.findById(id).session(session);
        if (!movimiento) {
            await session.abortTransaction();
            session.endSession();
            return res.status(404).json({ mensaje: '❌ Movimiento no encontrado' });
        }

        const cuentaDoc = await Cuenta.findOne({ nombre: movimiento.cuenta }).session(session);
        if (cuentaDoc) {
            if (movimiento.tipo === 'gasto') {
                cuentaDoc.saldo += movimiento.monto;
            } else if (movimiento.tipo === 'recaudo') {
                cuentaDoc.saldo -= movimiento.monto;
            }
            await cuentaDoc.save({ session });
        }

        await Movimiento.findByIdAndDelete(id).session(session);

        await session.commitTransaction();
        session.endSession();

        res.status(200).json({ mensaje: '✅ Movimiento eliminado correctamente' });

    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        res.status(500).json({
            mensaje: '❌ Error al eliminar movimiento',
            error: error.message
        });
    }
};

// ─── POST /api/movimientos/importar-gastos ────────────────────────────────────
// Recibe un array de gastos y los importa todos en una sola transacción.
export const importarGastos = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { gastos } = req.body;

        if (!Array.isArray(gastos) || gastos.length === 0) {
            await session.abortTransaction();
            session.endSession();
            return res.status(400).json({ mensaje: '❌ Se requiere un array de gastos no vacío' });
        }

        // Validar cada fila
        for (let i = 0; i < gastos.length; i++) {
            const g = gastos[i];
            if (!g.fecha || !g.monto || !g.cuenta) {
                await session.abortTransaction();
                session.endSession();
                return res.status(400).json({
                    mensaje: `❌ Fila ${i + 1}: fecha, monto y cuenta son obligatorios`
                });
            }
            if (isNaN(Number(g.monto)) || Number(g.monto) <= 0) {
                await session.abortTransaction();
                session.endSession();
                return res.status(400).json({
                    mensaje: `❌ Fila ${i + 1}: monto inválido "${g.monto}"`
                });
            }
            const cuentasValidas = ['Efectivo', 'Nequi', 'Bancolombia'];
            if (!cuentasValidas.includes(g.cuenta)) {
                await session.abortTransaction();
                session.endSession();
                return res.status(400).json({
                    mensaje: `❌ Fila ${i + 1}: cuenta inválida "${g.cuenta}" (use Efectivo, Nequi o Bancolombia)`
                });
            }
        }

        // Agrupar montos por cuenta para un solo update por cuenta
        const montosPorCuenta = {};
        for (const g of gastos) {
            const monto = Number(g.monto);
            montosPorCuenta[g.cuenta] = (montosPorCuenta[g.cuenta] || 0) + monto;
        }

        // Actualizar saldos de cuentas
        for (const [nombreCuenta, totalDescontar] of Object.entries(montosPorCuenta)) {
            let cuentaDoc = await Cuenta.findOne({ nombre: nombreCuenta }).session(session);
            if (!cuentaDoc) {
                const [nueva] = await Cuenta.create(
                    [{ nombre: nombreCuenta, saldo: nombreCuenta === 'Efectivo' ? 600000 : 0 }],
                    { session }
                );
                cuentaDoc = nueva;
            }
            cuentaDoc.saldo -= totalDescontar;
            await cuentaDoc.save({ session });
        }

        // Insertar todos los movimientos de una sola vez
        const movimientos = gastos.map(g => ({
            fecha: g.fecha,
            tipo: 'gasto',
            descripcion: g.descripcion || '',
            categoria: g.categoria || 'Varios',
            monto: Number(g.monto),
            cuenta: g.cuenta,
            creadoPor: req.user.id
        }));

        const insertados = await Movimiento.insertMany(movimientos, { session });

        await session.commitTransaction();
        session.endSession();

        res.status(201).json({
            mensaje: `✅ ${insertados.length} gastos importados correctamente`,
            total: insertados.length
        });

    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        res.status(500).json({
            mensaje: '❌ Error al importar gastos',
            error: error.message
        });
    }
};

// ─── PUT /api/movimientos/cierre-diario ──────────────────────────────────────
// Solo Admin. Edita o recalcula el Cierre Diario de una fecha específica.
export const editarCierreDiario = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { fecha, efectivoContado, recaudoNequi, recaudoBancolombia, observaciones, gastosExternos } = req.body;

        if (!fecha) {
            await session.abortTransaction();
            session.endSession();
            return res.status(400).json({ mensaje: '❌ La fecha es obligatoria' });
        }

        const dateStr = String(fecha).split('T')[0];
        const [year, month, day] = dateStr.split('-').map(Number);
        const inicio = new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0));
        const fin = new Date(Date.UTC(year, month - 1, day, 23, 59, 59, 999));

        // 1. Buscar los movimientos de cierre existentes para ese día
        const cierresExistentes = await Movimiento.find({
            fecha: { $gte: inicio, $lte: fin },
            tipo: 'recaudo',
            categoria: 'Ventas del día'
        }).session(session);

        // 2. Revertir saldos de los movimientos viejos de cierre
        for (const mov of cierresExistentes) {
            const cuentaDoc = await Cuenta.findOne({ nombre: mov.cuenta }).session(session);
            if (cuentaDoc) {
                cuentaDoc.saldo -= mov.monto;
                await cuentaDoc.save({ session });
            }
        }

        // Eliminar los movimientos viejos de cierre
        if (cierresExistentes.length > 0) {
            await Movimiento.deleteMany({
                _id: { $in: cierresExistentes.map(m => m._id) }
            }).session(session);
        }

        // 3. Crear los nuevos movimientos de cierre con los valores actualizados
        const BASE_EFECTIVO = 600000;
        const eContado = Number(efectivoContado || 0);
        const rNequi = Number(recaudoNequi || 0);
        const rBancolombia = Number(recaudoBancolombia || 0);
        const gExt = Number(gastosExternos || 0);

        const recaudoEfectivoNeto = Math.max(0, eContado - BASE_EFECTIVO);
        const fechaParaGuardar = new Date(Date.UTC(year, month - 1, day, 12, 0, 0));
        const movimientosCreados = [];

        // Efectivo
        let cuentaEfectivo = await Cuenta.findOne({ nombre: 'Efectivo' }).session(session);
        if (!cuentaEfectivo) {
            const [c] = await Cuenta.create([{ nombre: 'Efectivo', saldo: BASE_EFECTIVO }], { session });
            cuentaEfectivo = c;
        }

        const [mEfectivo] = await Movimiento.create(
            [{
                fecha: fechaParaGuardar,
                tipo: 'recaudo',
                descripcion: observaciones || `Cierre de caja (Contado: $${eContado.toLocaleString('es-CO')})`,
                categoria: 'Ventas del día',
                monto: recaudoEfectivoNeto,
                cuenta: 'Efectivo',
                gastosExternos: gExt,
                creadoPor: req.user.id
            }],
            { session }
        );
        movimientosCreados.push(mEfectivo);

        cuentaEfectivo.saldo = eContado > 0 ? eContado : (cuentaEfectivo.saldo + recaudoEfectivoNeto);
        await cuentaEfectivo.save({ session });

        // Nequi
        if (rNequi > 0) {
            let cuentaNequi = await Cuenta.findOne({ nombre: 'Nequi' }).session(session);
            if (!cuentaNequi) {
                const [c] = await Cuenta.create([{ nombre: 'Nequi', saldo: 0 }], { session });
                cuentaNequi = c;
            }

            const [mNequi] = await Movimiento.create(
                [{
                    fecha: fechaParaGuardar,
                    tipo: 'recaudo',
                    descripcion: 'Recaudo Nequi del día',
                    categoria: 'Ventas del día',
                    monto: rNequi,
                    cuenta: 'Nequi',
                    creadoPor: req.user.id
                }],
                { session }
            );
            movimientosCreados.push(mNequi);
            cuentaNequi.saldo += rNequi;
            await cuentaNequi.save({ session });
        }

        // Bancolombia
        if (rBancolombia > 0) {
            let cuentaBancolombia = await Cuenta.findOne({ nombre: 'Bancolombia' }).session(session);
            if (!cuentaBancolombia) {
                const [c] = await Cuenta.create([{ nombre: 'Bancolombia', saldo: 0 }], { session });
                cuentaBancolombia = c;
            }

            const [mBancolombia] = await Movimiento.create(
                [{
                    fecha: fechaParaGuardar,
                    tipo: 'recaudo',
                    descripcion: 'Recaudo Bancolombia del día',
                    categoria: 'Ventas del día',
                    monto: rBancolombia,
                    cuenta: 'Bancolombia',
                    creadoPor: req.user.id
                }],
                { session }
            );
            movimientosCreados.push(mBancolombia);
            cuentaBancolombia.saldo += rBancolombia;
            await cuentaBancolombia.save({ session });
        }

        await session.commitTransaction();
        session.endSession();

        res.status(200).json({
            mensaje: '✅ Cierre Diario actualizado correctamente',
            recaudoEfectivoNeto,
            movimientos: movimientosCreados
        });

    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        res.status(500).json({
            mensaje: '❌ Error al editar Cierre Diario',
            error: error.message
        });
    }
};

