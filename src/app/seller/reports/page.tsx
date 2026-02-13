'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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
      const url = `${process.env.NEXT_PUBLIC_API_URL}/api/seller/reportes?from=${from}&to=${to}`
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
    <main className="min-h-screen p-6 space-y-6">
      <h1 className="text-2xl font-bold">Reportes</h1>
      <p className="text-muted-foreground">
        Selecciona un rango de fechas para ver ventas, costos, pérdidas y utilidad.
      </p>

      {/* Filtros */}
      <Card className="p-4 space-y-4">
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <Label>Desde</Label>
            <Input type="date" value={from} onChange={e => setFrom(e.target.value)} />
          </div>
          <div>
            <Label>Hasta</Label>
            <Input type="date" value={to} onChange={e => setTo(e.target.value)} />
          </div>
          <div className="flex items-end gap-2">
            <Button onClick={cargarReporte} disabled={loading}>
              {loading ? 'Generando…' : 'Generar'}
            </Button>
            <Button variant="outline" onClick={exportarExcel} disabled={!data}>
              Exportar Excel
            </Button>
            <Button variant="outline" onClick={exportarPDF} disabled={!data}>
              Exportar PDF
            </Button>
          </div>
        </div>
      </Card>

      {/* Resultados */}
      {data && (
        <>
          {/* KPIs */}
          <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card className="p-4">
              <div className="text-sm text-muted-foreground">Ingresos</div>
              <div className="text-2xl font-bold">{Q(data.resumen.ingresos)}</div>
            </Card>
            <Card className="p-4">
              <div className="text-sm text-muted-foreground">Costos</div>
              <div className="text-2xl font-bold">{Q(data.resumen.costos)}</div>
            </Card>
            <Card className="p-4">
              <div className="text-sm text-muted-foreground">Pérdidas</div>
              <div className="text-2xl font-bold">{Q(data.resumen.perdidas)}</div>
            </Card>
            <Card className="p-4">
              <div className="text-sm text-muted-foreground">Utilidad</div>
              <div className="text-2xl font-bold">{Q(data.resumen.utilidad)}</div>
            </Card>
          </section>

          {/* Serie por día */}
          <Card className="p-4">
            <h2 className="text-lg font-semibold mb-2">Ventas por día</h2>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={data.porDia}>
                <XAxis dataKey="fecha" />
                <YAxis />
                <Tooltip formatter={(v: any) => Q(Number(v))} />
                <Bar dataKey="ventas" name="Ventas" fill="#3b82f6" />
                <Bar dataKey="costos" name="Costos" fill="#94a3b8" />
                <Bar dataKey="perdidas" name="Pérdidas" fill="#ef4444" />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          {/* Top productos */}
          <Card className="p-4">
            <h2 className="text-lg font-semibold mb-2">Top productos por ingresos</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Producto</th>
                    <th className="text-left p-2">Unidades</th>
                    <th className="text-left p-2">Ingresos</th>
                  </tr>
                </thead>
                <tbody>
                  {data.topProductos.map((p, i) => (
                    <tr key={i} className="border-b">
                      <td className="p-2">{p.nombre}</td>
                      <td className="p-2">{p.unidades}</td>
                      <td className="p-2">{Q(p.ingresos)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </>
      )}
    </main>
  )
}
