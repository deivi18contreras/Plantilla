import Ahorro from '../models/Ahorro.js'
import Movimiento from '../models/Movimientos.js'

// ─── GET /api/ahorros ────────────────────────────────────────────────────────
// Devuelve el historial completo de ahorros mes a mes (del más reciente al más antiguo)
export const listarAhorros = async (req, res) => {
  try {
    const ahorros = await Ahorro.find()
      .populate('creadoPor', 'nombre')
      .sort({ mes: -1 })

    // Calcular el total acumulado de todos los meses
    const totalAcumulado = ahorros.reduce((sum, a) => sum + a.total, 0)

    res.status(200).json({ ahorros, totalAcumulado })
  } catch (error) {
    res.status(500).json({ mensaje: '❌ Error al listar ahorros', error: error.message })
  }
}

// ─── PUT /api/ahorros/:id/notas ──────────────────────────────────────────────
// Permite al admin agregar o editar la nota de un mes guardado
export const editarNotas = async (req, res) => {
  try {
    const { id } = req.params
    const { notas } = req.body

    const ahorro = await Ahorro.findByIdAndUpdate(id, { notas }, { new: true })
    if (!ahorro) return res.status(404).json({ mensaje: '❌ Ahorro no encontrado' })

    res.status(200).json({ mensaje: '✅ Notas actualizadas', ahorro })
  } catch (error) {
    res.status(500).json({ mensaje: '❌ Error al editar notas', error: error.message })
  }
}

// ─── FUNCIÓN INTERNA (no es endpoint) ────────────────────────────────────────
// Se llama desde registrarCierreDiario cuando la fecha del cierre es el último
// día del mes. Guarda una foto de los saldos actuales y la ganancia del mes.
//
// Recibe:
//   - fecha: la fecha del cierre (Date)
//   - saldoEfectivo: saldo actual de Efectivo después del cierre
//   - saldoNequi: saldo actual de Nequi
//   - saldoBancolombia: saldo actual de Bancolombia
//   - userId: quién hizo el cierre
//   - session: sesión Mongoose activa
export const registrarAhorroMes = async ({
  fecha,
  saldoEfectivo,
  saldoNequi,
  saldoBancolombia,
  userId,
  session
}) => {
  const d = new Date(fecha)
  const year = d.getFullYear()
  const month = d.getMonth() + 1
  const mes = `${year}-${String(month).padStart(2, '0')}`

  // Calcular ganancia neta del mes: recaudos - gastos del mes
  const inicio = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0, 0))
  const fin = new Date(Date.UTC(year, month, 0, 23, 59, 59, 999))

  const movsMes = await Movimiento.find({ fecha: { $gte: inicio, $lte: fin } }).session(session)
  let recaudosMes = 0
  let gastosMes = 0
  movsMes.forEach(m => {
    if (m.tipo === 'recaudo') recaudosMes += m.monto
    if (m.tipo === 'gasto') gastosMes += m.monto
  })
  const gananciaNetaMes = recaudosMes - gastosMes

  const total = saldoEfectivo + saldoNequi + saldoBancolombia

  // Usar upsert para que si ya existe el ahorro del mes no duplique
  await Ahorro.findOneAndUpdate(
    { mes },
    {
      mes,
      efectivo: saldoEfectivo,
      nequi: saldoNequi,
      bancolombia: saldoBancolombia,
      total,
      gananciaNetaMes,
      creadoPor: userId
    },
    { upsert: true, new: true, session }
  )

  return { mes, total }
}
