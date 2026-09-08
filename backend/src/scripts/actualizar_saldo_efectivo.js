import mongoose from 'mongoose'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

dotenv.config({ path: path.resolve(__dirname, '../../.env') })

async function actualizar() {
  await mongoose.connect(process.env.MONGODB_URI)
  const db = mongoose.connection.db

  // Actualizar cuentaOrigen en los adelantos existentes
  await db.collection('adelantos').updateOne(
    { motivo: 'Se sacaron 90 para olympico' },
    { $set: { cuentaOrigen: 'Efectivo' } }
  )
  await db.collection('adelantos').updateOne(
    { motivo: 'Para Olympico' },
    { $set: { cuentaOrigen: 'Efectivo' } }
  )

  const recaudosEfectivo = await db.collection('movimientos').find({
    tipo: 'recaudo',
    cuenta: 'Efectivo',
    categoria: 'Ventas del día'
  }).toArray()

  const totalRecaudosEfectivo = recaudosEfectivo.reduce((sum, r) => sum + r.monto, 0)
  
  // Restamos los 90.000 que salieron de la caja para Olympico
  const saldoFinalEfectivo = totalRecaudosEfectivo - 90000

  console.log(`Recaudos de cierres: $${totalRecaudosEfectivo.toLocaleString('es-CO')}`)
  console.log(`Menos adelanto sacado de efectivo: -$90.000`)
  console.log(`Saldo real en Efectivo: $${saldoFinalEfectivo.toLocaleString('es-CO')}`)

  await db.collection('cuentas').updateOne({ nombre: 'Efectivo' }, { $set: { saldo: saldoFinalEfectivo } })
  const cuenta = await db.collection('cuentas').findOne({ nombre: 'Efectivo' })
  console.log(`Saldo guardado en BD para Efectivo: $${cuenta.saldo.toLocaleString('es-CO')}`)

  await mongoose.disconnect()
}

actualizar().catch(console.error)
