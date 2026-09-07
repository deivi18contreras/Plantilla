import mongoose from 'mongoose'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

dotenv.config({ path: path.resolve(__dirname, '../../.env') })

async function limpiar() {
  console.log('⏳ Conectando a MongoDB...')
  await mongoose.connect(process.env.MONGODB_URI)
  const db = mongoose.connection.db

  // 1. Borrar movimientos de agosto
  const inicioAgosto = new Date('2026-08-01T00:00:00.000Z')
  const finAgosto = new Date('2026-08-31T23:59:59.999Z')
  const delResult = await db.collection('movimientos').deleteMany({
    fecha: { $gte: inicioAgosto, $lte: finAgosto }
  })
  console.log(`🗑️ Movimientos eliminados: ${delResult.deletedCount}`)

  // 2. Reiniciar saldos de cuentas para inicio de mes
  await db.collection('cuentas').updateOne({ nombre: 'Efectivo' }, { $set: { saldo: 600000 } })
  await db.collection('cuentas').updateOne({ nombre: 'Nequi' }, { $set: { saldo: 0 } })
  await db.collection('cuentas').updateOne({ nombre: 'Bancolombia' }, { $set: { saldo: 0 } })

  const cuentasActualizadas = await db.collection('cuentas').find({}).toArray()
  console.log('✨ Nuevos saldos de cuentas:')
  cuentasActualizadas.forEach(c => {
    console.log(`   - ${c.nombre}: $${c.saldo.toLocaleString('es-CO')}`)
  })

  const totalMovsRestantes = await db.collection('movimientos').countDocuments()
  console.log(`📊 Total movimientos restantes en el sistema: ${totalMovsRestantes}`)

  await mongoose.disconnect()
  console.log('🚀 Limpieza finalizada con éxito.')
}

limpiar().catch(err => {
  console.error('❌ Error:', err)
  process.exit(1)
})

