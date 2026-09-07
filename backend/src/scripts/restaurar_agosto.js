import mongoose from 'mongoose'
import dotenv from 'dotenv'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

dotenv.config({ path: path.resolve(__dirname, '../../.env') })

async function restaurar() {
  const rutaBackup = path.resolve(__dirname, '../../../backup_movimientos_agosto_2026.json')
  
  if (!fs.existsSync(rutaBackup)) {
    console.error('❌ No se encontró el archivo de backup:', rutaBackup)
    process.exit(1)
  }

  const raw = fs.readFileSync(rutaBackup, 'utf-8')
  const backup = JSON.parse(raw)

  console.log(`⏳ Conectando a la base de datos...`)
  await mongoose.connect(process.env.MONGODB_URI)
  const db = mongoose.connection.db

  console.log(`📦 Restaurando ${backup.movimientos.length} movimientos de agosto...`)
  
  // Limpiar movimientos de agosto primero para evitar duplicados si ya existen
  const inicioAgosto = new Date('2026-08-01T00:00:00.000Z')
  const finAgosto = new Date('2026-08-31T23:59:59.999Z')
  await db.collection('movimientos').deleteMany({
    fecha: { $gte: inicioAgosto, $lte: finAgosto }
  })

  // Insertar los movimientos con sus tipos originales (fechas e ObjectIDs)
  const movsParaInsertar = backup.movimientos.map(m => ({
    ...m,
    _id: new mongoose.Types.ObjectId(m._id),
    fecha: new Date(m.fecha),
    usuario: m.usuario ? new mongoose.Types.ObjectId(m.usuario) : undefined,
    createdAt: m.createdAt ? new Date(m.createdAt) : new Date(),
    updatedAt: m.updatedAt ? new Date(m.updatedAt) : new Date()
  }))

  await db.collection('movimientos').insertMany(movsParaInsertar)

  // Restaurar los saldos de las cuentas
  for (const c of backup.cuentas) {
    await db.collection('cuentas').updateOne(
      { nombre: c.nombre },
      { $set: { saldo: c.saldo } }
    )
  }

  console.log('✅ ¡Restauración completada con éxito!')
  console.log(`Total movimientos restaurados: ${movsParaInsertar.length}`)
  console.log('Saldos restaurados:')
  backup.cuentas.forEach(c => {
    console.log(` - ${c.nombre}: $${c.saldo.toLocaleString('es-CO')}`)
  })

  await mongoose.disconnect()
}

restaurar().catch(err => {
  console.error('❌ Error durante la restauración:', err)
  process.exit(1)
})

