import mongoose from 'mongoose'

const categoriaSchema = new mongoose.Schema({
    nombre: { type: String, required: true, trim: true },
    emoji:  { type: String, default: '🏷️' },
    activa: { type: Boolean, default: true },
    orden:  { type: Number, default: 0 }
}, { _id: false })

const configuracionSchema = new mongoose.Schema({
    baseFija: {
        type: Number,
        default: 600000
    },
    cadenaDefault: {
        type: Number,
        default: 125000
    },
    nombreNegocio: {
        type: String,
        default: 'Mi Negocio',
        trim: true
    },
    metaDiaria: {
        type: Number,
        default: 0
    },
    categorias: {
        type: [categoriaSchema],
        default: [
            { nombre: 'Carnes',           emoji: '🥩', activa: true, orden: 0 },
            { nombre: 'Verduras y Frutas',emoji: '🥦', activa: true, orden: 1 },
            { nombre: 'Tintos y Bebidas', emoji: '☕', activa: true, orden: 2 },
            { nombre: 'Cadena',           emoji: '🔗', activa: true, orden: 3 },
            { nombre: 'Pedidos Varios',   emoji: '📦', activa: true, orden: 4 },
            { nombre: 'Aseo y Limpieza',  emoji: '🧴', activa: true, orden: 5 },
        ]
    }
}, { timestamps: true })

const Configuracion = mongoose.model('Configuracion', configuracionSchema)

export default Configuracion
