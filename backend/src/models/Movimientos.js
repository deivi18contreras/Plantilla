import mongoose from "mongoose";

const movimientoSchema = new mongoose.Schema({
  fecha: {
    type: Date,
    required: true
  },
  tipo: {
    type: String,
    enum: ['gasto', 'recaudo', 'transferencia'],
    required: true
  },
  descripcion: {
    type: String
  },
  categoria: {
    type: String
  },
  monto: {
    type: Number,
    required: true
  },
  cuenta: {
    type: String,
    enum: ['Efectivo', 'Nequi', 'Bancolombia'],
    required: true
  },
  cuentaDestino: {
    type: String,
    enum: ['Efectivo', 'Nequi', 'Bancolombia'],
    default: null
  },
  gastosExternos: {
    type: Number,
    default: 0
  },
  creadoPor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Usuario',
    required: true
  }
}, {
  timestamps: true
})

const Movimiento = mongoose.model('Movimiento', movimientoSchema)
export default Movimiento