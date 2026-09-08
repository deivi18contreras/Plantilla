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

  const recaudosEfectivo = await db.collection('movimientos').find({
    tipo: 'recaudo',
    cuenta: 'Efectivo',
    categoria: 'Ventas del día'
  }).toArray()

  const totalNetoEfectivo = recaudosEfectivo.reduce((sum, r) => sum + r.monto, 0)
  console.log('Recaudos Efectivo encontrados:', recaudosEfectivo.map(r => ({ fecha: r.fecha.toISOString().split('T')[0], monto: r.monto })))
  console.log(`Total neto efectivo acumulado (sin base de 600k): $${totalNetoEfectivo.toLocaleString('es-CO')}`)

  await db.collection('cuentas').updateOne({ nombre: 'Efectivo' }, { $set: { saldo: totalNetoEfectivo } })
  const cuenta = await db.collection('cuentas').findOne({ nombre: 'Efectivo' })
  console.log(`Nuevo saldo cuenta Efectivo en DB: $${cuenta.saldo.toLocaleString('es-CO')}`)

  await mongoose.disconnect()
}

actualizar().catch(console.error)

