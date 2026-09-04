import mongoose from 'mongoose'
import GastoFijo from '../models/GastoFijo.js'
import Movimiento from '../models/Movimientos.js'
import Cuenta from '../models/Cuentas.js'

// ─── Función interna: calcular la próxima fecha de vencimiento ────────────────
const calcularProximaFecha = (fechaActual, periodicidad) => {
  const nueva = new Date(fechaActual)
  switch (periodicidad) {
    case 'diario':
      nueva.setDate(nueva.getDate() + 1)
      break
    case 'quincenal':
      nueva.setDate(nueva.getDate() + 15)
      break
    case 'mensual':
      nueva.setMonth(nueva.getMonth() + 1)
      break
    case 'bimestral':
      nueva.setMonth(nueva.getMonth() + 2)
      break
  }
  return nueva
}

// ─── GET /api/gastos-fijos ────────────────────────────────────────────────────
// Lista todos los gastos fijos activos
export const listarGastosFijos = async (req, res) => {
  try {
    const gastos = await GastoFijo.find({ activo: true }).sort({ proximoVencimiento: 1 })
    res.status(200).json(gastos)
  } catch (error) {
    res.status(500).json({ mensaje: '❌ Error al listar gastos fijos', error: error.message })
  }
}

// ─── GET /api/gastos-fijos/proximos?dias=7 ────────────────────────────────────
// Lista los gastos fijos que vencen en los próximos N días (para el dashboard)
export const listarGastosFijosProximos = async (req, res) => {
  try {
    const dias = Number(req.query.dias) || 7
    const hoy = new Date()
    const limite = new Date()
    limite.setDate(hoy.getDate() + dias)

    const proximos = await GastoFijo.find({
      activo: true,
      proximoVencimiento: { $lte: limite }
    }).sort({ proximoVencimiento: 1 })

    res.status(200).json(proximos)
  } catch (error) {
    res.status(500).json({ mensaje: '❌ Error al listar gastos próximos', error: error.message })
  }
}

// ─── POST /api/gastos-fijos ───────────────────────────────────────────────────
// Crea un nuevo gasto fijo (solo admin)
export const crearGastoFijo = async (req, res) => {
  try {
    const { nombre, monto, periodicidad, cuentaPago, proximoVencimiento } = req.body

    if (!nombre || !monto || !periodicidad || !proximoVencimiento) {
      return res.status(400).json({ mensaje: '❌ nombre, monto, periodicidad y proximoVencimiento son obligatorios' })
    }

    const gastoFijo = await GastoFijo.create({
      nombre,
      monto: Number(monto),
      periodicidad,
      cuentaPago: cuentaPago || 'Efectivo',
      proximoVencimiento: new Date(proximoVencimiento),
      activo: true
    })

    res.status(201).json({ mensaje: '✅ Gasto fijo creado', gastoFijo })
  } catch (error) {
    res.status(500).json({ mensaje: '❌ Error al crear gasto fijo', error: error.message })
  }
}

// ─── PUT /api/gastos-fijos/:id ────────────────────────────────────────────────
// Edita un gasto fijo existente (solo admin)
export const editarGastoFijo = async (req, res) => {
  try {
    const { id } = req.params
    const { nombre, monto, periodicidad, cuentaPago, proximoVencimiento, activo } = req.body

    const gastoFijo = await GastoFijo.findByIdAndUpdate(
      id,
      { nombre, monto: monto ? Number(monto) : undefined, periodicidad, cuentaPago, proximoVencimiento, activo },
      { new: true, omitUndefined: true }
    )

    if (!gastoFijo) return res.status(404).json({ mensaje: '❌ Gasto fijo no encontrado' })

    res.status(200).json({ mensaje: '✅ Gasto fijo actualizado', gastoFijo })
  } catch (error) {
    res.status(500).json({ mensaje: '❌ Error al editar gasto fijo', error: error.message })
  }
}

// ─── POST /api/gastos-fijos/:id/confirmar-pago ───────────────────────────────
// Confirma el pago de un gasto fijo:
//   1. Crea el Movimiento tipo 'gasto' con la fecha de HOY (fecha real de pago)
//   2. Descuenta el saldo de la cuenta correspondiente
//   3. Recalcula proximoVencimiento según la periodicidad
export const confirmarPagoGastoFijo = async (req, res) => {
  const session = await mongoose.startSession()
  session.startTransaction()

  try {
    const { id } = req.params
    const gastoFijo = await GastoFijo.findById(id).session(session)

    if (!gastoFijo) {
      await session.abortTransaction()
      session.endSession()
      return res.status(404).json({ mensaje: '❌ Gasto fijo no encontrado' })
    }

    if (!gastoFijo.activo) {
      await session.abortTransaction()
      session.endSession()
      return res.status(400).json({ mensaje: '❌ Este gasto fijo está desactivado' })
    }

    // Fecha real de pago = hoy
    const hoy = new Date()

    // 1. Verificar y actualizar el saldo de la cuenta
    let cuentaDoc = await Cuenta.findOne({ nombre: gastoFijo.cuentaPago }).session(session)
    if (!cuentaDoc) {
      // Si la cuenta no existe aún, la creamos con saldo 0
      const [nueva] = await Cuenta.create(
        [{ nombre: gastoFijo.cuentaPago, saldo: 0 }],
        { session }
      )
      cuentaDoc = nueva
    }

    // 2. Registrar el movimiento de gasto
    const [movimiento] = await Movimiento.create(
      [{
        fecha: hoy,
        tipo: 'gasto',
        descripcion: `Gasto fijo: ${gastoFijo.nombre}`,
        categoria: 'Gastos Fijos',
        monto: gastoFijo.monto,
        cuenta: gastoFijo.cuentaPago,
        creadoPor: req.user.id
      }],
      { session }
    )

    // 3. Descontar del saldo
    cuentaDoc.saldo -= gastoFijo.monto
    await cuentaDoc.save({ session })

    // 4. Recalcular la próxima fecha de vencimiento
    gastoFijo.proximoVencimiento = calcularProximaFecha(gastoFijo.proximoVencimiento, gastoFijo.periodicidad)
    await gastoFijo.save({ session })

    await session.commitTransaction()
    session.endSession()

    res.status(200).json({
      mensaje: `✅ Pago de "${gastoFijo.nombre}" confirmado`,
      movimiento,
      proximoVencimiento: gastoFijo.proximoVencimiento
    })

  } catch (error) {
    await session.abortTransaction()
    session.endSession()
    res.status(500).json({ mensaje: '❌ Error al confirmar pago', error: error.message })
  }
}

// ─── DELETE /api/gastos-fijos/:id ────────────────────────────────────────────
// Desactiva un gasto fijo (no lo elimina, solo lo marca como inactivo)
export const desactivarGastoFijo = async (req, res) => {
  try {
    const { id } = req.params
    const gastoFijo = await GastoFijo.findByIdAndUpdate(id, { activo: false }, { new: true })
    if (!gastoFijo) return res.status(404).json({ mensaje: '❌ Gasto fijo no encontrado' })
    res.status(200).json({ mensaje: '✅ Gasto fijo desactivado', gastoFijo })
  } catch (error) {
    res.status(500).json({ mensaje: '❌ Error al desactivar gasto fijo', error: error.message })
  }
}
