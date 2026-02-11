import { apiFetch } from "@/lib/api";

/* ===========================
   Tipos del Dashboard
=========================== */

export type KPI = {
  ventasMes: number;
  pedidosMes: number;
  ticketPromedio: number;
  productosActivos: number;
};

export type VentasMes = {
  mes: string;
  ventas: number;
};

export type TopCategoria = {
  name: string;
  value: number;
};

export type PedidoResumen = {
  id: string;
  cliente: string;
  total: number;
  estado:
    | "Pendiente"
    | "En preparación"
    | "En camino"
    | "Entregado"
    | "Cancelado";
  fecha: string;
};

export type LowStock = {
  id: string;
  nombre: string;
  stock: number;
};

export type SellerDashboardResponse = {
  kpi: KPI;
  ventasPorMes: VentasMes[];
  topCategorias: TopCategoria[];
  actividad: PedidoResumen[];
  lowStock: LowStock[];
  validaciones: string[];
};

/* ===========================
   Fetch principal
=========================== */

export async function fetchSellerDashboard(): Promise<SellerDashboardResponse> {
  const base = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8800";

  const res = await apiFetch(`${base}/api/seller/dashboard`);

  if (!res.ok) {
    const err = await res.json().catch(() => null);
    throw new Error(
      err?.message || "No se pudo cargar el dashboard del vendedor"
    );
  }

  return res.json();
}
