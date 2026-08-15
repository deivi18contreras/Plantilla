import mongoose from 'mongoose'

const cuentaSchema = new mongoose.Schema({
    nombre: {
        type: String,
        enum: ['Efectivo', 'Nequi', 'Bancolombia'],
        required: true
    },

    saldo:{
        type: Number,
        required: true,
        default: 0
    }
})

const Cuenta = mongoose.model('Cuenta', cuentaSchema)

export default Cuenta