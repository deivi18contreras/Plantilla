import Configuracion from '../models/Configuracion.js'

// ─── GET /api/configuracion ───────────────────────────────────────────────────
// Devuelve la configuración actual. Si no existe, la crea con valores por defecto.
export const obtenerConfiguracion = async (req, res) => {
    try {
        let config = await Configuracion.findOne()
        if (!config) {
            config = await Configuracion.create({})
        }
        res.status(200).json(config)
    } catch (error) {
        res.status(500).json({
            mensaje: '❌ Error al obtener configuración',
            error: error.message
        })
    }
}

// ─── PUT /api/configuracion ───────────────────────────────────────────────────
// Solo Admin. Actualiza los valores de configuración.
export const actualizarConfiguracion = async (req, res) => {
    try {
        const { baseFija, cadenaDefault, nombreNegocio, metaDiaria, categorias } = req.body

        const config = await Configuracion.findOneAndUpdate(
            {},
            {
                ...(baseFija !== undefined && { baseFija: Number(baseFija) }),
                ...(cadenaDefault !== undefined && { cadenaDefault: Number(cadenaDefault) }),
                ...(nombreNegocio !== undefined && { nombreNegocio }),
                ...(metaDiaria !== undefined && { metaDiaria: Number(metaDiaria) }),
                ...(categorias !== undefined && { categorias })
            },
            { new: true, upsert: true }
        )

        res.status(200).json({
            mensaje: '✅ Configuración actualizada correctamente',
            config
        })
    } catch (error) {
        res.status(500).json({
            mensaje: '❌ Error al actualizar configuración',
            error: error.message
        })
    }
}
