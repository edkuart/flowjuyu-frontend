// Estructura de endpoints para dashboard del vendedor usando App Router

// 1. Resumen general del negocio
// src/app/api/seller/dashboard/resumen/route.ts
import { NextResponse } from "next/server"

export async function GET() {
  return NextResponse.json({
    ventasDelMes: 3200.00,
    pedidosCompletados: 22,
    productosActivos: 10,
    calificacionPromedio: 4.6,
  })
}
