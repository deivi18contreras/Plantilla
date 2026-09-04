import mongoose from 'mongoose'
import Adelanto from '../models/Adelanto.js'

// ─── POST /api/adelantos ───────────────────────────────────────────────────────
// Registra un nuevo adelanto interno. NO modifica el saldo de Efectivo en Cuentas
// (es solo un registro informativo de deuda interna).
export const registrarAdelanto = async (req, res) => {
  const session = await mongoose.startSession()
  session.startTransaction()

  try {
    const { fecha, monto, motivo } = req.body

    if (!fecha || !monto) {
      await session.abortTransaction()
      session.endSession()
      return res.status(400).json({ mensaje: '❌ fecha y monto son obligatorios' })
    }

    if (Number(monto) <= 0) {
      await session.abortTransaction()
      session.endSession()
      return res.status(400).json({ mensaje: '❌ El monto debe ser mayor a 0' })
    }

    const [adelanto] = await Adelanto.create(
      [{
        fecha,
        monto: Number(monto),
        motivo: motivo || '',
        montoRecuperado: 0,
        saldoPendiente: Number(monto),
        estado: 'pendiente',
        creadoPor: req.user.id
      }],
      { session }
    )

    await session.commitTransaction()
    session.endSession()

    res.status(201).json({
      mensaje: '✅ Adelanto registrado correctamente',
      adelanto
    })

  } catch (error) {
    await session.abortTransaction()
    session.endSession()
    res.status(500).json({
      mensaje: '❌ Error al registrar adelanto',
      error: error.message
    })
  }
}

// ─── GET /api/adelantos/pendientes ────────────────────────────────────────────
// Devuelve todos los adelantos pendientes con el total de deuda acumulada.
export const listarAdelantosPendientes = async (req, res) => {
  try {
    // Traer todos los pendientes, del más antiguo al más reciente (FIFO)
    const adelantos = await Adelanto.find({ estado: 'pendiente' })
      .populate('creadoPor', 'nombre')
      .sort({ fecha: 1 })

    // Sumar el total que aún se debe
    const totalPendiente = adelantos.reduce((sum, a) => sum + a.saldoPendiente, 0)

    res.status(200).json({ totalPendiente, adelantos })

  } catch (error) {
    res.status(500).json({
      mensaje: '❌ Error al listar adelantos',
      error: error.message
    })
  }
}

// ─── GET /api/adelantos ────────────────────────────────────────────────────────
// Devuelve todos los adelantos (pendientes y recuperados), para el historial.
export const listarTodosAdelantos = async (req, res) => {
  try {
    const adelantos = await Adelanto.find()
      .populate('creadoPor', 'nombre')
      .sort({ fecha: -1 })

    res.status(200).json(adelantos)
  } catch (error) {
    res.status(500).json({
      mensaje: '❌ Error al listar adelantos',
      error: error.message
    })
  }
}

// ─── FUNCIÓN INTERNA (no es endpoint) ─────────────────────────────────────────
// Se llama desde registrarCierreDiario para abonar el recaudo neto a los adelantos
// pendientes usando FIFO (más antiguo primero).
//
// Recibe:
//   - montoDisponible: el recaudo neto de efectivo del día
//   - session: la sesión de Mongoose activa
//
// Devuelve:
//   - montoAplicado: cuánto se destinó a pagar adelantos
//   - remanente: cuánto queda como ganancia real del día
export const abonarAdelantos = async (montoDisponible, session) => {
  // Traer adelantos pendientes, del más antiguo al más reciente (FIFO)
  const pendientes = await Adelanto.find({ estado: 'pendiente' })
    .sort({ fecha: 1 })
    .session(session)

  let montoRestante = montoDisponible
  let montoAplicado = 0

  for (const adelanto of pendientes) {
    // Si ya no queda plata para abonar, parar
    if (montoRestante <= 0) break

    if (montoRestante >= adelanto.saldoPendiente) {
      // Alcanza para cubrir este adelanto completo
      montoAplicado += adelanto.saldoPendiente
      montoRestante -= adelanto.saldoPendiente
      adelanto.montoRecuperado += adelanto.saldoPendiente
      adelanto.saldoPendiente = 0
      adelanto.estado = 'recuperado'
    } else {
      // Solo alcanza para un abono parcial
      montoAplicado += montoRestante
      adelanto.montoRecuperado += montoRestante
      adelanto.saldoPendiente -= montoRestante
      montoRestante = 0
    }

    await adelanto.save({ session })
  }

  return {
    montoAplicado,          // lo que se fue a pagar adelantos
    remanente: montoRestante // lo que queda como ganancia neta real
  }
}

