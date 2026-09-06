import mongoose from 'mongoose'

const ahorroSchema = new mongoose.Schema({
  // Mes al que corresponde este ahorro (formato YYYY-MM, ej: "2026-08")
  mes: {
    type: String,
    required: true,
    unique: true  // Solo puede haber un registro de ahorro por mes
  },
  // Saldo de cada cuenta al cerrar el mes (foto del estado final)
  efectivo: { type: Number, default: 0 },
  nequi: { type: Number, default: 0 },
  bancolombia: { type: Number, default: 0 },
  // Total acumulado entre todas las cuentas
  total: { type: Number, default: 0 },
  // Ganancia neta del mes (ventas - gastos - adelantos pagados)
  gananciaNetaMes: { type: Number, default: 0 },
  // Nota opcional del administrador
  notas: { type: String, default: '' },
  // Quién registró el cierre de ese último día
  creadoPor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Usuario'
  }
}, {
  timestamps: true
})

const Ahorro = mongoose.model('Ahorro', ahorroSchema)
export default Ahorro
