import Cuenta from "../models/Cuentas.js"

const cuentasInciales = ['Efectivo', 'Nequi', 'Bancolombia'];

export const postRegistrarCuenta = async (req, res) => {
    try {
        const cuentasExistentes = await Cuenta.find();

        if (cuentasExistentes.length > 0) {
            return res.status(200).json({
                Mensaje: "⚠️ Las cuentas ya fueron inicializadas",
                cuentas: cuentasExistentes
            })
        }
        const cuentasCreadas = await Cuenta.insertMany([
            { nombre: 'Efectivo', saldo: 600000 },
            { nombre: 'Nequi', saldo: 0 },
            { nombre: 'Bancolombia', saldo: 0 }
        ])

        res.status(201).json({
            mensaje: "✅ Cuentas inicializadas correctamente",
            cuentas: cuentasCreadas
        })
    } catch (error) {
        res.status(500).json({
            mensaje: "❌ Error al inicializar cuentas",
            error: error.message
        })
    }
};

export const listarCuentas = async (req, res) => {
    try {
        let cuentas = await Cuenta.find();
        if (cuentas.length === 0) {
            cuentas = await Cuenta.insertMany([
                { nombre: 'Efectivo', saldo: 600000 },
                { nombre: 'Nequi', saldo: 0 },
                { nombre: 'Bancolombia', saldo: 0 }
            ]);
        } else {
            // Asegurar que Efectivo tenga la base inicial de $600.000 si está en 0
            const efectivo = cuentas.find(c => c.nombre === 'Efectivo');
            if (efectivo && efectivo.saldo === 0) {
                efectivo.saldo = 600000;
                await efectivo.save();
            }
        }
        res.status(200).json(cuentas);
    } catch (error) {
        res.status(500).json({
            mensaje: "❌ Error al obtener cuentas",
            error: error.message
        });
    }
};