"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { 
  Package, 
  ShoppingBag, 
  ChevronRight, 
  Truck, 
  CheckCircle2, 
  Clock, 
  Loader2,
  XCircle
} from "lucide-react";

type Pedido = {
  id: string;
  codigo: string;
  total: number;
  estado: string;
  fecha_creacion: string;
  productos: { imagen_url: string }[];
};

export default function BuyerDashboardPage() {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setLoading(false);
      return;
    }

    const fetchPedidos = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/buyer/orders`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!res.ok) throw new Error("Error al obtener pedidos");
        const data = await res.json();
        setPedidos(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchPedidos();
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* TÍTULO */}
      <div className="border-b border-gray-100 pb-6">
        <h1 className="text-2xl font-bold text-gray-900">Historial de Pedidos</h1>
        <p className="text-sm text-gray-500 mt-1">
          Consulta el estado de tus compras y revisa los detalles.
        </p>
      </div>

      {/* ESTADO: CARGANDO */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400">
          <Loader2 className="w-8 h-8 animate-spin text-orange-500 mb-4" />
          <p className="text-sm font-medium">Cargando tus pedidos...</p>
        </div>
      )}

      {/* ESTADO: VACÍO */}
      {!loading && pedidos.length === 0 && (
        <div className="flex flex-col items-center justify-center text-center py-16 px-4 bg-gray-50/50 rounded-2xl border border-dashed border-gray-200">
          <div className="w-20 h-20 bg-orange-50 rounded-full flex items-center justify-center mb-6 shadow-sm">
            <ShoppingBag className="w-10 h-10 text-orange-500" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Aún no has realizado ningún pedido
          </h3>
          <p className="text-gray-500 max-w-sm mb-8">
            Explora nuestro catálogo y descubre productos increíbles. ¡Tu primer pedido te espera!
          </p>
          <Link href="/">
            <Button className="bg-orange-500 hover:bg-orange-600 text-white rounded-xl px-6 py-5 shadow-sm transition-all">
              Explorar productos
            </Button>
          </Link>
        </div>
      )}

      {/* LISTA DE PEDIDOS */}
      {!loading && pedidos.length > 0 && (
        <div className="space-y-6">
          {pedidos.map((pedido) => (
            <div 
              key={pedido.id} 
              className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden hover:shadow-md transition-shadow"
            >
              {/* HEADER DEL PEDIDO */}
              <div className="bg-gray-50/50 border-b border-gray-100 px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
                  <div>
                    <p className="text-gray-500 font-medium">Fecha del pedido</p>
                    <p className="font-semibold text-gray-900">
                      {new Date(pedido.fecha_creacion).toLocaleDateString("es-GT", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500 font-medium">Total</p>
                    <p className="font-semibold text-gray-900">Q {pedido.total.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 font-medium">Pedido No.</p>
                    <p className="font-semibold text-gray-900">#{pedido.codigo || pedido.id.slice(0, 8)}</p>
                  </div>
                </div>

                <EstadoBadge estado={pedido.estado} />
              </div>

              {/* CUERPO DEL PEDIDO */}
              <div className="p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                
                <div className="flex items-center gap-4">
                  {/* IMAGEN DEL PRODUCTO (Muestra el primero) */}
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden border border-gray-100 bg-gray-50 relative shrink-0">
                    {pedido.productos?.length > 0 && pedido.productos[0].imagen_url ? (
                      <Image
                        src={pedido.productos[0].imagen_url}
                        alt={`Producto del pedido ${pedido.codigo}`}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-300">
                        <Package className="w-8 h-8" />
                      </div>
                    )}
                  </div>

                  {/* RESUMEN DE PRODUCTOS */}
                  <div>
                    <p className="font-medium text-gray-900">
                      {pedido.productos?.length === 1 
                        ? "1 Producto" 
                        : `${pedido.productos?.length || 0} Productos`}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      {pedido.estado.toLowerCase() === 'entregado' 
                        ? "Paquete entregado con éxito" 
                        : "Detalles del envío en el resumen"}
                    </p>
                  </div>
                </div>

                {/* BOTÓN DE ACCIÓN */}
                <Link href={`/buyer/orders/${pedido.id}`} className="w-full sm:w-auto">
                  <Button variant="outline" className="w-full sm:w-auto rounded-xl border-gray-200 text-gray-700 hover:bg-gray-50 hover:text-gray-900 shadow-sm transition-all flex items-center justify-center">
                    Ver detalles del pedido <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </Link>

              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// COMPONENTE AUXILIAR PARA EL BADGE DE ESTADO
function EstadoBadge({ estado }: { estado: string }) {
  const normalizeEstado = estado?.toLowerCase() || "";

  // Configuramos colores e íconos según el estado
  let config = {
    color: "bg-gray-100 text-gray-700 border-gray-200",
    icon: Package,
    texto: estado || "Desconocido"
  };

  if (normalizeEstado.includes("entregado")) {
    config = { color: "bg-green-100 text-green-700 border-green-200", icon: CheckCircle2, texto: "Entregado" };
  } else if (normalizeEstado.includes("enviado") || normalizeEstado.includes("camino")) {
    config = { color: "bg-blue-100 text-blue-700 border-blue-200", icon: Truck, texto: "Enviado" };
  } else if (normalizeEstado.includes("procesando") || normalizeEstado.includes("pendiente")) {
    config = { color: "bg-orange-100 text-orange-700 border-orange-200", icon: Clock, texto: "Procesando" };
  } else if (normalizeEstado.includes("cancelado")) {
    config = { color: "bg-red-100 text-red-700 border-red-200", icon: XCircle, texto: "Cancelado" };
  }

  const Icono = config.icon;

  return (
    <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-semibold shrink-0 ${config.color}`}>
      <Icono className="w-3.5 h-3.5" />
      {config.texto.charAt(0).toUpperCase() + config.texto.slice(1)}
    </div>
  );
}