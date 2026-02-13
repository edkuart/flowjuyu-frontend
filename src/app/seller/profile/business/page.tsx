'use client';

import {
  BarChart as ReBarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import {
  ShoppingCart,
  Package,
  DollarSign,
  Star,
  BarChart3,
} from 'lucide-react';
import { useState } from 'react';

// ✅ Barra de progreso dinámica
import * as React from 'react';
import { cn } from '@/lib/utils';

export interface ProgressProps
  extends React.HTMLAttributes<HTMLDivElement> {
  value?: number;
}

export function Progress({ value = 0, className, ...props }: ProgressProps) {
  const getColor = (val: number) => {
    if (val < 25) return 'bg-rose-500';
    if (val < 50) return 'bg-amber-500';
    if (val < 75) return 'bg-lime-500';
    return 'bg-sky-500';
  };

  return (
    <div
      className={cn(
        'relative h-2 w-full overflow-hidden rounded-full bg-muted',
        className
      )}
      {...props}
    >
      <div
        className={cn(
          'h-full flex-1 transition-all duration-500 ease-in-out rounded-full',
          getColor(value || 0)
        )}
        style={{
          width: `${Math.min(100, Math.max(0, value || 0))}%`,
        }}
      />
    </div>
  );
}

export default function SellerBusinessPage() {
  // KPIs principales
  const resumen = [
    {
      icon: <DollarSign className="text-green-600" />,
      label: 'Ventas del mes',
      value: 'Q 3,200.00',
    },
    {
      icon: <ShoppingCart className="text-blue-600" />,
      label: 'Pedidos completados',
      value: '22',
    },
    {
      icon: <Package className="text-purple-600" />,
      label: 'Productos activos',
      value: '10',
    },
    {
      icon: <Star className="text-yellow-500" />,
      label: 'Calificación promedio',
      value: '4.6 / 5',
    },
  ];

  const [year, setYear] = useState(2025);
  const [detallePedidoIndex, setDetallePedidoIndex] = useState<number | null>(
    null
  );
  const [periodo, setPeriodo] = useState<'dia' | 'mes' | 'anio'>('mes');
  const [tab, setTab] = useState<'productos' | 'resenas' | 'favoritos'>(
    'productos'
  );

  const ventasPorMes = [
    { mes: 'Ene', ventas: 800 },
    { mes: 'Feb', ventas: 1100 },
    { mes: 'Mar', ventas: 950 },
    { mes: 'Abr', ventas: 1200 },
    { mes: 'May', ventas: 600 },
    { mes: 'Jun', ventas: 1300 },
    { mes: 'Jul', ventas: 500 },
    { mes: 'Ago', ventas: 1000 },
    { mes: 'Sep', ventas: 1150 },
    { mes: 'Oct', ventas: 950 },
    { mes: 'Nov', ventas: 1250 },
    { mes: 'Dic', ventas: 1400 },
  ];

  const PIE_COLORS = ['#3b82f6', '#8b5cf6', '#0ea5e9', '#14b8a6', '#f59e0b'];

  const dataDia = [
    { name: 'Huipiles', value: 22 },
    { name: 'Cortes típicos', value: 17 },
    { name: 'Accesorios', value: 12 },
    { name: 'Accesorios típicos', value: 7 },
    { name: 'Otros', value: 4 },
  ];
  const dataMes = [
    { name: 'Huipiles', value: 240 },
    { name: 'Cortes típicos', value: 180 },
    { name: 'Accesorios', value: 120 },
    { name: 'Accesorios típicos', value: 80 },
    { name: 'Otros', value: 60 },
  ];
  const dataAnio = [
    { name: 'Huipiles', value: 2800 },
    { name: 'Cortes típicos', value: 1900 },
    { name: 'Accesorios', value: 1600 },
    { name: 'Accesorios típicos', value: 1100 },
    { name: 'Otros', value: 700 },
  ];

  const currentData =
    periodo === 'dia' ? dataDia : periodo === 'anio' ? dataAnio : dataMes;
  const totalPeriodo = currentData.reduce((a, b) => a + b.value, 0);

  const actividadReciente = [
    {
      cliente: 'Ana López',
      productos: [{ nombre: 'Blusa típica', cantidad: 1, precio: 120.0 }],
      total: 120.0,
      estado: 'Completado',
      fecha: '24/jun',
    },
    {
      cliente: 'Carlos Pérez',
      productos: [
        { nombre: 'Faja multicolor', cantidad: 1, precio: 90.0 },
        { nombre: 'Blusa típica', cantidad: 2, precio: 240.0 },
      ],
      total: 330.0,
      estado: 'Enviado',
      fecha: '23/jun',
    },
  ];

  return (
    <main className="container mx-auto px-4 py-6 space-y-6">
      {/* Encabezado + botón de Reportes */}
      <section className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-neutral-900 mb-1">
            Bienvenido al Panel del Vendedor
          </h1>
          <p className="text-muted-foreground text-sm">
            Consulta métricas generales de tu tienda.
          </p>
        </div>
        <Button asChild className="gap-2">
          <Link href="/seller/reports">
            <BarChart3 className="w-4 h-4" />
            Reportes
          </Link>
        </Button>
      </section>

      {/* KPIs */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {resumen.map((item, idx) => (
          <Card key={idx}>
            <CardContent className="flex flex-col items-start gap-2 p-4">
              <div className="text-2xl">{item.icon}</div>
              <div className="text-sm text-muted-foreground">{item.label}</div>
              <div className="text-lg font-bold">{item.value}</div>
            </CardContent>
          </Card>
        ))}
      </section>

      {/* GRID PRINCIPAL */}
      <section className="grid gap-4 md:grid-cols-12">
        {/* Ventas por mes */}
        <Card className="md:col-span-8">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Ventas por mes - {year}</CardTitle>
                <CardDescription>Rendimiento mensual</CardDescription>
              </div>
              <select
                className="border rounded px-2 py-1 text-sm"
                value={year}
                onChange={(e) => setYear(Number(e.target.value))}
              >
                {[2023, 2024, 2025].map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-64 md:h-72">
              <ResponsiveContainer width="100%" height="100%">
                <ReBarChart data={ventasPorMes}>
                  <XAxis dataKey="mes" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="ventas" fill="#3b82f6" />
                </ReBarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Gráfico circular con progreso y tabs */}
        <Card className="md:col-span-4 border border-muted/40 shadow-md">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Distribución por categoría</CardTitle>
                <CardDescription>
                  {periodo === 'dia'
                    ? 'Hoy'
                    : periodo === 'mes'
                    ? 'Este mes'
                    : 'Este año'}
                </CardDescription>
              </div>
              <div className="flex gap-1">
                {(['dia', 'mes', 'anio'] as const).map((p) => (
                  <Button
                    key={p}
                    size="sm"
                    variant={periodo === p ? 'default' : 'outline'}
                    className="capitalize"
                    onClick={() => setPeriodo(p)}
                  >
                    {p === 'dia' ? 'Día' : p === 'mes' ? 'Mes' : 'Año'}
                  </Button>
                ))}
              </div>
            </div>
            <div className="mt-2">
              <span className="text-xs text-muted-foreground uppercase">
                Total
              </span>
              <div className="text-2xl font-bold text-sky-600">
                Q {totalPeriodo.toLocaleString('es-GT')}
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-5">
            <div className="h-64 md:h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={currentData}
                    cx="50%"
                    cy="50%"
                    outerRadius={85}
                    dataKey="value"
                    label={({ name, percent }) =>
                      `${name} ${(percent * 100).toFixed(1)}%`
                    }
                  >
                    {currentData.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="flex justify-center gap-2">
              {(['productos', 'resenas', 'favoritos'] as const).map((t) => (
                <Button
                  key={t}
                  size="sm"
                  variant={tab === t ? 'default' : 'outline'}
                  onClick={() => setTab(t)}
                  className="capitalize"
                >
                  {t === 'productos'
                    ? 'Productos'
                    : t === 'resenas'
                    ? 'Reseñas'
                    : 'Favoritos'}
                </Button>
              ))}
            </div>

            {tab === 'productos' && (
              <div className="text-sm space-y-3">
                {currentData.map((it, index) => {
                  const porcentaje = ((it.value / totalPeriodo) * 100).toFixed(1);
                  return (
                    <div key={index} className="space-y-1">
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-foreground">
                          {it.name}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {porcentaje}% del total
                        </span>
                      </div>
                      <Progress
                        value={parseFloat(porcentaje)}
                        className="h-2 bg-muted"
                      />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>{it.value} vendidos</span>
                        <span>Ganancia: Q {(it.value * 25).toFixed(2)}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {tab === 'resenas' && (
              <div className="text-sm text-muted-foreground">
                ⭐ Promedio general: <b>4.7 / 5</b> — Huipiles y Cortes lideran{' '}
                {periodo === 'dia'
                  ? 'hoy'
                  : periodo === 'mes'
                  ? 'este mes'
                  : 'este año'}
                .
              </div>
            )}

            {tab === 'favoritos' && (
              <ul className="text-sm text-muted-foreground list-disc pl-5 space-y-1">
                <li>Huipil de Quetzaltenango (58)</li>
                <li>Corte típico azul cielo (42)</li>
                <li>Faja artesanal multicolor (30)</li>
              </ul>
            )}
          </CardContent>
        </Card>

        {/* Actividad reciente */}
        <Card className="md:col-span-8">
          <CardHeader className="pb-2">
            <CardTitle>Actividad reciente</CardTitle>
            <CardDescription>Últimos pedidos</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Cliente</th>
                    <th className="text-left p-2">Productos</th>
                    <th className="text-left p-2">Total</th>
                    <th className="text-left p-2">Estado</th>
                    <th className="text-left p-2">Fecha</th>
                    <th className="text-left p-2">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {actividadReciente.map((pedido, index) => (
                    <tr key={index} className="border-b">
                      <td className="p-2 whitespace-nowrap">{pedido.cliente}</td>
                      <td className="p-2 whitespace-nowrap">
                        {detallePedidoIndex === index ? (
                          <ul className="list-disc ml-4">
                            {pedido.productos.map((prod, i) => (
                              <li key={i}>
                                {prod.nombre} x{prod.cantidad} - Q{' '}
                                {prod.precio.toFixed(2)}
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <span>{pedido.productos.length} producto(s)</span>
                        )}
                      </td>
                      <td className="p-2 whitespace-nowrap">
                        Q {pedido.total.toFixed(2)}
                      </td>
                      <td className="p-2 whitespace-nowrap">
                        {pedido.estado}
                      </td>
                      <td className="p-2 whitespace-nowrap">{pedido.fecha}</td>
                      <td className="p-2 whitespace-nowrap">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            setDetallePedidoIndex(
                              index === detallePedidoIndex ? null : index
                            )
                          }
                        >
                          {detallePedidoIndex === index
                            ? 'Ocultar'
                            : 'Ver productos'}
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Alertas */}
        <Card className="md:col-span-4">
          <CardHeader className="pb-2">
            <CardTitle>Alertas</CardTitle>
            <CardDescription>Estado actual</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <div className="font-medium">Stock bajo</div>
              <ul className="mt-1 text-sm list-disc pl-5 space-y-1">
                <li className="flex items-center justify-between">
                  Blusa roja bordada <Badge variant="secondary">2 uds</Badge>
                </li>
                <li className="flex items-center justify-between">
                  Faja multicolor <Badge variant="secondary">1 uds</Badge>
                </li>
              </ul>
            </div>

            <div className="pt-2">
              <div className="font-medium">Validaciones pendientes</div>
              <ul className="mt-1 text-sm list-disc pl-5 space-y-1">
                <li>Selfie con DPI (seller#123)</li>
              </ul>
            </div>

            <div className="pt-2">
              <Link
                href="/seller/reports"
                className="inline-flex items-center text-sm underline"
              >
                Ver reportes detallados
              </Link>
            </div>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}