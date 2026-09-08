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
  // De qué cuenta salió el dinero ('Efectivo', 'Nequi', 'Bancolombia', 'Externo')
  cuentaOrigen: {
    type: String,
    enum: ['Efectivo', 'Nequi', 'Bancolombia', 'Externo', ''],
    default: 'Efectivo'
  },
  // Quién lo registró
  creadoPor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Usuario',
    required: true
  },
  // Historial de cada abono que se le ha hecho a este adelanto
  abonos: [
    {
      fecha: { type: Date, required: true },          // fecha del abono
      monto: { type: Number, required: true },         // cuánto se abonó
      saldoAntes: { type: Number, required: true },    // saldo pendiente antes del abono
      saldoDespues: { type: Number, required: true },   // saldo pendiente después del abono
      cuentaDestino: { type: String, default: 'Efectivo' } // cuenta a la que entró el dinero devuelto
    }
  ]
}, {
  timestamps: true
})

const Adelanto = mongoose.model('Adelanto', adelantoSchema)
export default Adelanto

