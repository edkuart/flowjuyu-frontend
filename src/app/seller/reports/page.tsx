'use client'

import { useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import ExcelJS from 'exceljs'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

type Dia = { fecha: string; ventas: number; costos: number; perdidas: number }
type Reporte = {
  from: string
  to: string
  resumen: {
    ingresos: number
    costos: number
    perdidas: number
    utilidad: number
    pedidos: number
    ticketPromedio: number
  }
  porDia: Dia[]
  topProductos: { nombre: string; unidades: number; ingresos: number }[]
}

export default function ReportesPage() {
  const [from, setFrom] = useState<string>('')
  const [to, setTo] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<Reporte | null>(null)

  const Q = (n: number) =>
    `Q ${n.toLocaleString('es-GT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

  async function cargarReporte() {
    if (!from || !to) {
      alert('Selecciona un rango de fechas')
      return
    }
    setLoading(true)
    try {
      // 🔁 Ajusta el endpoint a tu backend
      const url = `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8800"}/api/seller/reportes?from=${from}&to=${to}`
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token') || ''}` },
      })

      // Si aún no tienes el endpoint, usa un mock rápido:
      const fallback: Reporte = {
        from,
        to,
        resumen: {
          ingresos: 4560,
          costos: 2800,
          perdidas: 120, // devoluciones/cancelaciones
          utilidad: 4560 - 2800 - 120,
          pedidos: 32,
          ticketPromedio: 4560 / 32,
        },
        porDia: [
          { fecha: from, ventas: 300, costos: 180, perdidas: 0 },
          { fecha: '2025-06-02', ventas: 520, costos: 310, perdidas: 0 },
          { fecha: '2025-06-03', ventas: 0, costos: 0, perdidas: 40 },
          { fecha: '2025-06-04', ventas: 780, costos: 470, perdidas: 0 },
        ],
        topProductos: [
          { nombre: 'Blusa típica', unidades: 12, ingresos: 1440 },
          { nombre: 'Faja multicolor', unidades: 9, ingresos: 810 },
          { nombre: 'Cartera artesanal', unidades: 6, ingresos: 720 },
        ],
      }

      const body: Reporte = res.ok ? await res.json() : fallback
      setData(body)
    } catch (e) {
      console.error(e)
      alert('No se pudo cargar el reporte. Usaré datos de ejemplo.')
      // mock por si el fetch falla
      setData({
        from,
        to,
        resumen: {
          ingresos: 4560,
          costos: 2800,
          perdidas: 120,
          utilidad: 4560 - 2800 - 120,
          pedidos: 32,
          ticketPromedio: 4560 / 32,
        },
        porDia: [
          { fecha: from, ventas: 300, costos: 180, perdidas: 0 },
          { fecha: '2025-06-02', ventas: 520, costos: 310, perdidas: 0 },
          { fecha: '2025-06-03', ventas: 0, costos: 0, perdidas: 40 },
          { fecha: '2025-06-04', ventas: 780, costos: 470, perdidas: 0 },
        ],
        topProductos: [
          { nombre: 'Blusa típica', unidades: 12, ingresos: 1440 },
          { nombre: 'Faja multicolor', unidades: 9, ingresos: 810 },
          { nombre: 'Cartera artesanal', unidades: 6, ingresos: 720 },
        ],
      })
    } finally {
      setLoading(false)
    }
  }

  
// ================================
// ExcelJS – exportación avanzada
// ================================
async function exportarExcel() {
  if (!data) return

  const wb = new ExcelJS.Workbook()

  // ===== Hoja 1: Resumen =====
  const wsResumen = wb.addWorksheet('Resumen', { views: [{ state: 'frozen', ySplit: 1 }] })

  wsResumen.mergeCells('A1:C1')
  wsResumen.getCell('A1').value = `Reporte de ventas — ${data.from} a ${data.to}`
  wsResumen.getCell('A1').font = { bold: true, size: 14 }

  wsResumen.addRow([])
  wsResumen.addRow(['Métrica', 'Valor'])
  const headerResumen = wsResumen.getRow(3)
  headerResumen.font = { bold: true }
  headerResumen.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF1F5F9' } }

  const rowsResumen: Array<[string, number | string]> = [
    ['Ingresos', data.resumen.ingresos],
    ['Costos', data.resumen.costos],
    ['Pérdidas', data.resumen.perdidas],
    ['Utilidad', data.resumen.utilidad],
    ['Pedidos', data.resumen.pedidos],
    ['Ticket Promedio', data.resumen.ticketPromedio],
  ]
  rowsResumen.forEach(r => wsResumen.addRow(r))

  // Formato moneda para fila 4..9 col B
  for (let r = 4; r <= 9; r++) {
    const label = wsResumen.getCell(`A${r}`).value as string
    const isMoney = ['Ingresos', 'Costos', 'Pérdidas', 'Utilidad', 'Ticket Promedio'].includes(label)
    if (isMoney) wsResumen.getCell(`B${r}`).numFmt = '[$Q-140A] #,##0.00'
  }
  wsResumen.columns = [
    { key: 'metric', width: 24 },
    { key: 'value', width: 18 },
    { key: 'pad', width: 2 },
  ]

  // ===== Hoja 2: Por día =====
  const wsDia = wb.addWorksheet('Por día', { views: [{ state: 'frozen', ySplit: 1 }] })
  wsDia.columns = [
    { header: 'Fecha', key: 'fecha', width: 14 },
    { header: 'Ventas', key: 'ventas', width: 16, style: { numFmt: '[$Q-140A] #,##0.00' } },
    { header: 'Costos', key: 'costos', width: 16, style: { numFmt: '[$Q-140A] #,##0.00' } },
    { header: 'Pérdidas', key: 'perdidas', width: 16, style: { numFmt: '[$Q-140A] #,##0.00' } },
  ]
  wsDia.addRows(data.porDia)

  const lastDataRow = wsDia.rowCount // incluye encabezado+datos, aún sin el total
  const totalRowDia = wsDia.addRow({
    fecha: 'TOTAL',
    ventas: { formula: `SUM(B2:B${lastDataRow})` },
    costos: { formula: `SUM(C2:C${lastDataRow})` },
    perdidas: { formula: `SUM(D2:D${lastDataRow})` },
  })
  totalRowDia.font = { bold: true }
  wsDia.getCell(`A${totalRowDia.number}`).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFF1F5F9' },
  }
  const headerDia = wsDia.getRow(1)
  headerDia.font = { bold: true }
  headerDia.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE2E8F0' } }

  // ===== Hoja 3: Top productos =====
  const wsTop = wb.addWorksheet('Top productos', { views: [{ state: 'frozen', ySplit: 1 }] })
  wsTop.columns = [
    { header: 'Producto', key: 'nombre', width: 32 },
    { header: 'Unidades', key: 'unidades', width: 14 },
    { header: 'Ingresos', key: 'ingresos', width: 18, style: { numFmt: '[$Q-140A] #,##0.00' } },
  ]
  wsTop.addRows(data.topProductos)

  const lastTopRow = wsTop.rowCount
  const totalRowTop = wsTop.addRow({
    nombre: 'TOTAL',
    unidades: { formula: `SUM(B2:B${lastTopRow})` },
    ingresos: { formula: `SUM(C2:C${lastTopRow})` },
  })
  totalRowTop.font = { bold: true }
  wsTop.getCell(`A${totalRowTop.number}`).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFF1F5F9' },
  }
  const headerTop = wsTop.getRow(1)
  headerTop.font = { bold: true }
  headerTop.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE2E8F0' } }

  // ===== Descargar en navegador =====
  const buffer = await wb.xlsx.writeBuffer()
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  })
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = `reporte_${data.from}_a_${data.to}.xlsx`
  a.click()
  URL.revokeObjectURL(a.href)
}
  // (opcional) exportar a PDF con jsPDF
  function exportarPDF() {
    if (!data) return
    const doc = new jsPDF()

    doc.setFontSize(14)
    doc.text('Reporte de ventas', 14, 16)
    doc.setFontSize(10)
    doc.text(`Periodo: ${data.from} a ${data.to}`, 14, 22)

    autoTable(doc, {
      startY: 28,
      head: [['Métrica', 'Valor']],
      body: [
        ['Ingresos', Q(data.resumen.ingresos)],
        ['Costos', Q(data.resumen.costos)],
        ['Pérdidas', Q(data.resumen.perdidas)],
        ['Utilidad', Q(data.resumen.utilidad)],
        ['Pedidos', String(data.resumen.pedidos)],
        ['Ticket Promedio', Q(data.resumen.ticketPromedio)],
      ],
      theme: 'grid',
    })

    autoTable(doc, {
      startY: (doc as any).lastAutoTable.finalY + 8,
      head: [['Fecha', 'Ventas', 'Costos', 'Pérdidas']],
      body: data.porDia.map(d => [d.fecha, Q(d.ventas), Q(d.costos), Q(d.perdidas)]),
      theme: 'grid',
      headStyles: { fillColor: [33, 150, 243] },
    })

    autoTable(doc, {
      startY: (doc as any).lastAutoTable.finalY + 8,
      head: [['Producto', 'Unidades', 'Ingresos']],
      body: data.topProductos.map(t => [t.nombre, String(t.unidades), Q(t.ingresos)]),
      theme: 'grid',
      headStyles: { fillColor: [76, 175, 80] },
    })

    doc.save(`reporte_${data.from}_a_${data.to}.pdf`)
  }

  return (
    <div className="min-h-screen bg-[#f8f5ef]">
      <div className="mx-auto max-w-4xl space-y-6 px-4 py-6 sm:px-6 sm:py-10">
        <div>
          <p className="text-[10px] font-bold tracking-[0.18em] text-[var(--seller-accent)] uppercase">
            Reportes · Flowjuyu Seller
          </p>
          <h1 className="mt-1.5 text-2xl font-bold tracking-tight text-[var(--seller-ink)] sm:text-[28px] sm:leading-[1.05]">
            Reportes financieros
          </h1>
          <p className="mt-1.5 text-sm leading-relaxed text-[var(--seller-muted)]">
            Selecciona un rango de fechas para ver ventas, costos, pérdidas y utilidad.
          </p>
        </div>

        {/* Filtros */}
        <div className="rounded-3xl border border-[var(--seller-line)] bg-white p-5">
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-1.5">
              <label className="block text-[10px] font-bold tracking-[0.18em] text-[var(--seller-muted)] uppercase">Desde</label>
              <input type="date" value={from} onChange={e => setFrom(e.target.value)}
                className="w-full rounded-xl border border-[var(--seller-line)] bg-white px-4 py-2.5 text-sm text-[var(--seller-ink)] outline-none transition focus:border-[var(--seller-accent)] focus:ring-2 focus:ring-[color:color-mix(in_srgb,var(--seller-accent)_20%,transparent)]" />
            </div>
            <div className="space-y-1.5">
              <label className="block text-[10px] font-bold tracking-[0.18em] text-[var(--seller-muted)] uppercase">Hasta</label>
              <input type="date" value={to} onChange={e => setTo(e.target.value)}
                className="w-full rounded-xl border border-[var(--seller-line)] bg-white px-4 py-2.5 text-sm text-[var(--seller-ink)] outline-none transition focus:border-[var(--seller-accent)] focus:ring-2 focus:ring-[color:color-mix(in_srgb,var(--seller-accent)_20%,transparent)]" />
            </div>
            <div className="flex items-end gap-2">
              <button onClick={cargarReporte} disabled={loading}
                className="group relative flex-1 overflow-hidden rounded-xl bg-[var(--seller-accent)] px-4 py-2.5 text-sm font-semibold text-white transition disabled:opacity-50">
                <span aria-hidden className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/15 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
                {loading ? 'Generando…' : 'Generar'}
              </button>
              <button onClick={exportarExcel} disabled={!data}
                className="rounded-xl border border-[var(--seller-line-strong)] px-3 py-2.5 text-sm font-medium text-[var(--seller-ink)] transition hover:bg-[var(--seller-panel)] disabled:opacity-40">
                Excel
              </button>
              <button onClick={exportarPDF} disabled={!data}
                className="rounded-xl border border-[var(--seller-line-strong)] px-3 py-2.5 text-sm font-medium text-[var(--seller-ink)] transition hover:bg-[var(--seller-panel)] disabled:opacity-40">
                PDF
              </button>
            </div>
          </div>
        </div>

        {/* Resultados */}
        {data && (
          <>
            {/* KPIs */}
            <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { label: 'Ingresos', value: Q(data.resumen.ingresos), color: 'text-emerald-600' },
                { label: 'Costos', value: Q(data.resumen.costos), color: 'text-[var(--seller-ink)]' },
                { label: 'Pérdidas', value: Q(data.resumen.perdidas), color: 'text-red-500' },
                { label: 'Utilidad', value: Q(data.resumen.utilidad), color: 'text-[var(--seller-accent)]' },
              ].map(kpi => (
                <div key={kpi.label} className="rounded-3xl border border-[var(--seller-line)] bg-white p-5">
                  <p className="text-xs text-[var(--seller-muted)]">{kpi.label}</p>
                  <p className={`mt-1 text-2xl font-bold ${kpi.color}`}>{kpi.value}</p>
                </div>
              ))}
            </section>

            {/* Serie por día */}
            <div className="rounded-3xl border border-[var(--seller-line)] bg-white p-5">
              <h2 className="mb-4 text-sm font-semibold text-[var(--seller-ink)]">Ventas por día</h2>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={data.porDia}>
                  <XAxis dataKey="fecha" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(v: any) => Q(Number(v))} />
                  <Bar dataKey="ventas" name="Ventas" fill="#0f3d3a" radius={[4,4,0,0]} />
                  <Bar dataKey="costos" name="Costos" fill="#94a3b8" radius={[4,4,0,0]} />
                  <Bar dataKey="perdidas" name="Pérdidas" fill="#ef4444" radius={[4,4,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Top productos */}
            <div className="overflow-hidden rounded-3xl border border-[var(--seller-line)] bg-white">
              <div className="px-5 py-4">
                <h2 className="text-sm font-semibold text-[var(--seller-ink)]">Top productos por ingresos</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="border-b border-[var(--seller-line)] bg-[var(--seller-panel)]">
                      <th className="px-5 py-3 text-left text-[10px] font-bold tracking-[0.14em] text-[var(--seller-muted)] uppercase">Producto</th>
                      <th className="px-5 py-3 text-left text-[10px] font-bold tracking-[0.14em] text-[var(--seller-muted)] uppercase">Unidades</th>
                      <th className="px-5 py-3 text-left text-[10px] font-bold tracking-[0.14em] text-[var(--seller-muted)] uppercase">Ingresos</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--seller-line)]">
                    {data.topProductos.map((p, i) => (
                      <tr key={i} className="transition hover:bg-[var(--seller-panel)]">
                        <td className="px-5 py-3 font-medium text-[var(--seller-ink)]">{p.nombre}</td>
                        <td className="px-5 py-3 text-[var(--seller-muted)]">{p.unidades}</td>
                        <td className="px-5 py-3 font-semibold text-[var(--seller-accent)]">{Q(p.ingresos)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
