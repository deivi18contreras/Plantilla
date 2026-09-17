import mongoose from 'mongoose';

const usoRemanenteSchema = new mongoose.Schema({
    fechaUso: { type: Date, required: true },
    monto: { type: Number, required: true },
    motivo: { type: String, default: '' },
    cierreDestinoFecha: { type: Date }
}, { _id: false });

const remanenteSchema = new mongoose.Schema({
    fecha: { type: Date, required: true, unique: true },
    montoInicial: { type: Number, required: true },
    montoGastado: { type: Number, default: 0 },
    saldoDisponible: { type: Number, required: true },
    usos: [usoRemanenteSchema],
    activo: { type: Boolean, default: true }
}, {
    timestamps: true
});

const Remanente = mongoose.model('Remanente', remanenteSchema);
export default Remanente;

