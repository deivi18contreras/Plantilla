import Movimiento from '../models/Movimientos.js';

// ─── GET /api/resumen ─────────────────────────────────────────────────────────
// Query params: mes=YYYY-MM (opcional, por defecto mes actual)
export const obtenerResumenMes = async (req, res) => {
    try {
        const { mes } = req.query;

        // Determinar rango del mes
        let year, month;
        if (mes) {
            [year, month] = mes.split('-').map(Number);
        } else {
            const hoy = new Date();
            year = hoy.getFullYear();
            month = hoy.getMonth() + 1;
        }

        const inicio = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0, 0));
        const fin = new Date(Date.UTC(year, month, 0, 23, 59, 59, 999));

        // Movimientos del mes
        const movimientosMes = await Movimiento.find({
            fecha: { $gte: inicio, $lte: fin }
        });

        let totalRecaudos = 0; // Plata sobrante del Cierre (Efectivo Neto + Nequi + Bancolombia)
        let totalGastos = 0;   // Plata pagada en compras del mes

        movimientosMes.forEach(m => {
            if (m.tipo === 'recaudo') totalRecaudos += m.monto;
            if (m.tipo === 'gasto') totalGastos += m.monto;
        });

        // En la fórmula de negocio:
        // Venta Total Bruta del Mes = Gastos del Mes + Cierres del Mes
        const totalVentaBrutaMes = totalGastos + totalRecaudos;

        // Te Queda (Ganancia Líquida Neta) = Venta Total Bruta - Gastos = totalRecaudos
        const neto = totalVentaBrutaMes - totalGastos;

        // Gastos por categoría con normalización de espacios y mayúsculas
        const gastosPorCategoriaMap = {};
        movimientosMes.filter(m => m.tipo === 'gasto').forEach(m => {
            let cat = (m.categoria || 'Sin categoría').trim();
            if (cat) {
                cat = cat.charAt(0).toUpperCase() + cat.slice(1);
            }
            gastosPorCategoriaMap[cat] = (gastosPorCategoriaMap[cat] || 0) + m.monto;
        });

        const gastosPorCategoria = Object.entries(gastosPorCategoriaMap)
            .map(([_id, total]) => ({ _id, total }))
            .sort((a, b) => b.total - a.total);

        // Recaudos por cuenta del mes
        const recaudosPorCuenta = { Efectivo: 0, Nequi: 0, Bancolombia: 0 };
        movimientosMes.filter(m => m.tipo === 'recaudo').forEach(m => {
            if (recaudosPorCuenta[m.cuenta] !== undefined) {
                recaudosPorCuenta[m.cuenta] += m.monto;
            }
        });

        // Datos de los últimos 7 días para la gráfica del dashboard
        const hoy = new Date();
        const semanaData = [];
        for (let i = 6; i >= 0; i--) {
            const dia = new Date(hoy);
            dia.setDate(hoy.getDate() - i);
            const y = dia.getFullYear();
            const m = dia.getMonth();
            const d = dia.getDate();

            const inicioDia = new Date(Date.UTC(y, m, d, 0, 0, 0, 0));
            const finDia = new Date(Date.UTC(y, m, d, 23, 59, 59, 999));

            const movsDia = await Movimiento.find({ fecha: { $gte: inicioDia, $lte: finDia } });

            const recaudosDia = movsDia.filter(m => m.tipo === 'recaudo').reduce((s, m) => s + m.monto, 0);
            const gastosDia = movsDia.filter(m => m.tipo === 'gasto').reduce((s, m) => s + m.monto, 0);
            const ventaBrutaDia = recaudosDia + gastosDia;

            semanaData.push({
                fecha: `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`,
                label: dia.toLocaleDateString('es-CO', { weekday: 'short' }),
                recaudos: ventaBrutaDia,
                gastos: gastosDia
            });
        }

        // ── Mes anterior (para comparativa) ──────────────────────────────────
        const mesAntYear  = month === 1 ? year - 1 : year
        const mesAntMonth = month === 1 ? 12 : month - 1
        const inicioAnt   = new Date(Date.UTC(mesAntYear, mesAntMonth - 1, 1, 0, 0, 0, 0))
        const finAnt      = new Date(Date.UTC(mesAntYear, mesAntMonth, 0, 23, 59, 59, 999))

        const movsAnt = await Movimiento.find({ fecha: { $gte: inicioAnt, $lte: finAnt } })
        let recaudosAnt = 0, gastosAnt = 0
        movsAnt.forEach(m => {
            if (m.tipo === 'recaudo') recaudosAnt += m.monto
            if (m.tipo === 'gasto')   gastosAnt   += m.monto
        })
        const ventaAnt = recaudosAnt + gastosAnt

        res.status(200).json({
            mes: mes || `${year}-${String(month).padStart(2, '0')}`,
            totalRecaudos: totalVentaBrutaMes,
            totalGastos,
            neto,
            gastosPorCategoria,
            recaudosPorCuenta,
            semanaActual: semanaData,
            mesAnterior: {
                mes: `${mesAntYear}-${String(mesAntMonth).padStart(2, '0')}`,
                totalVentas: ventaAnt,
                totalGastos: gastosAnt,
                neto: ventaAnt - gastosAnt
            }
        });

    } catch (error) {
        res.status(500).json({
            mensaje: '❌ Error al obtener resumen',
            error: error.message
        });
    }
};
