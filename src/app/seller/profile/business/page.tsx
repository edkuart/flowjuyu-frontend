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

export default function SellerBusinessPage() {
  // KPIs
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

  const categorias: { name: string; value: number }[] = [
    { name: 'Blusas', value: 8 },
    { name: 'Trajes', value: 6 },
    { name: 'Carteras', value: 4 },
    { name: 'Otros', value: 2 },
  ];

  const ventasPorCategoria: {
    mes: string;
    blusas: number;
    trajes: number;
    carteras: number;
  }[] = [
    { mes: 'Ene', blusas: 200, trajes: 150, carteras: 80 },
    { mes: 'Feb', blusas: 180, trajes: 120, carteras: 100 },
    { mes: 'Mar', blusas: 210, trajes: 130, carteras: 90 },
    { mes: 'Abr', blusas: 250, trajes: 160, carteras: 110 },
    { mes: 'May', blusas: 140, trajes: 90, carteras: 60 },
    { mes: 'Jun', blusas: 300, trajes: 200, carteras: 120 },
  ];

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

  const colores = ['#8884d8', '#82ca9d', '#ffc658', '#ff7f50'];

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

      {/* GRID PRINCIPAL (12 columnas) */}
      <section className="grid gap-4 md:grid-cols-12">
        {/* Ventas por mes – 8 columnas */}
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

        {/* Top categorías – 4 columnas */}
        <Card className="md:col-span-4">
          <CardHeader className="pb-2">
            <CardTitle>Top categorías</CardTitle>
            <CardDescription>Distribución por categoría</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 md:h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categorias}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name }: { name: string }) => name}
                    outerRadius={80}
                    dataKey="value"
                  >
                    {categorias.map((_, i) => (
                      <Cell key={i} fill={colores[i % colores.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Actividad reciente – 8 columnas */}
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
                      <td className="p-2 whitespace-nowrap">{pedido.estado}</td>
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

        {/* Alertas – 4 columnas */}
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
