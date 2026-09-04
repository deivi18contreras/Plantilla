import mongoose from 'mongoose'

const gastoFijoSchema = new mongoose.Schema({
  // Nombre del gasto (ej. "Arriendo", "Internet", "Luz")
  nombre: {
    type: String,
    required: true,
    trim: true
  },
  // Monto a pagar
  monto: {
    type: Number,
    required: true
  },
  // Cada cuánto tiempo se repite
  periodicidad: {
    type: String,
    enum: ['diario', 'quincenal', 'mensual', 'bimestral'],
    required: true
  },
  // De qué cuenta se paga
  cuentaPago: {
    type: String,
    enum: ['Efectivo', 'Nequi', 'Bancolombia'],
    default: 'Efectivo'
  },
  // Fecha en la que vence el próximo pago
  proximoVencimiento: {
    type: Date,
    required: true
  },
  // Si está activo o fue desactivado
  activo: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
})

const GastoFijo = mongoose.model('GastoFijo', gastoFijoSchema)
export default GastoFijo

