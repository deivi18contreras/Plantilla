import mongoose from 'mongoose'

const adelantoSchema = new mongoose.Schema({
  // Fecha en que se sacó la plata
  fecha: {
    type: Date,
    required: true
  },
  // Monto total que se sacó
  monto: {
    type: Number,
    required: true
  },
  // Por qué se sacó (ej. "Pedido proveedor de carne")
  motivo: {
    type: String,
    default: ''
  },
  // Cuánto se ha abonado ya (empieza en 0)
  montoRecuperado: {
    type: Number,
    default: 0
  },
  // Lo que aún se debe: monto - montoRecuperado
  saldoPendiente: {
    type: Number,
    default: function () {
      return this.monto
    }
  },
  // Estado del adelanto
  estado: {
    type: String,
    enum: ['pendiente', 'recuperado'],
    default: 'pendiente'
  },
  // Quién lo registró
  creadoPor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Usuario',
    required: true
  }
}, {
  timestamps: true
})

const Adelanto = mongoose.model('Adelanto', adelantoSchema)
export default Adelanto

