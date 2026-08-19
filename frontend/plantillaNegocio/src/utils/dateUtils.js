/**
 * Utilidades para manejo consistente de fechas sin desfase horario (Timezone / UTC)
 */

export const parseFechaLocal = (fechaStr) => {
  if (!fechaStr) return new Date()
  
  if (fechaStr instanceof Date) {
    return new Date(fechaStr.getFullYear(), fechaStr.getMonth(), fechaStr.getDate(), 12, 0, 0)
  }

  const str = String(fechaStr).trim()
  const datePart = str.split('T')[0]
  const partes = datePart.split('-').map(Number)

  if (partes.length === 3 && !isNaN(partes[0]) && !isNaN(partes[1]) && !isNaN(partes[2])) {
    return new Date(partes[0], partes[1] - 1, partes[2], 12, 0, 0)
  }

  // Fallback si viene en otro formato
  const parsed = new Date(fechaStr)
  return isNaN(parsed.getTime()) ? new Date() : parsed
}

export const formatFechaLarga = (fechaStr) => {
  if (!fechaStr) return ''
  const d = parseFechaLocal(fechaStr)
  return d.toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
}

export const formatFechaCorta = (fechaStr) => {
  if (!fechaStr) return ''
  const d = parseFechaLocal(fechaStr)
  return d.toLocaleDateString('es-CO', { day: 'numeric', month: 'short' })
}

export const getFechaLocalHoy = () => {
  const d = new Date()
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}
