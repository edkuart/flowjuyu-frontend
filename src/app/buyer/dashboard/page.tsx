"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

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
    if (!token) return;

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
    <div>
      <h1 className="text-2xl font-bold mb-6">Pedidos</h1>

      {loading && <p className="text-muted-foreground">Cargando pedidos...</p>}

      {!loading && pedidos.length === 0 && (
        <p className="text-muted-foreground">No tienes pedidos aún.</p>
      )}

      <div className="space-y-4">
        {pedidos.map((p) => (
          <Card key={p.id} className="shadow-sm hover:shadow-md transition">
            <CardContent className="flex items-center justify-between p-4">
              <div className="flex items-center gap-4">
                {/* Imagen */}
                {p.productos?.length > 0 ? (
                  <img
                    src={p.productos[0].imagen_url}
                    alt="Producto"
                    className="w-16 h-16 object-cover rounded-md border"
                  />
                ) : (
                  <div className="w-16 h-16 bg-muted rounded-md" />
                )}

                {/* Info */}
                <div>
                  <p className="font-semibold">
                    Pedido #{p.codigo || p.id.slice(0, 6)}
                  </p>

                  <p className="text-sm text-muted-foreground">
                    {new Date(p.fecha_creacion).toLocaleDateString("es-GT", {
                      day: "2-digit",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>

                  <EstadoBadge estado={p.estado} />
                </div>
              </div>

              {/* Total */}
              <div className="text-right">
                <p className="text-lg font-semibold">Q {p.total.toFixed(2)}</p>

                <p className="text-sm text-muted-foreground">
                  {p.productos?.length || 1} producto
                  {p.productos?.length > 1 ? "s" : ""}
                </p>

                <Link href={`/buyer/orders/${p.id}`}>
                  <Button variant="outline" size="sm" className="mt-2">
                    Ver detalle
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function EstadoBadge({ estado }: { estado: string }) {
  const estadoClasses: Record<string, string> = {
    entregado: "bg-green-100 text-green-700 border-green-300",
    enviado: "bg-blue-100 text-blue-700 border-blue-300",
    procesando: "bg-yellow-100 text-yellow-700 border-yellow-300",
    cancelado: "bg-red-100 text-red-700 border-red-300",
  };

  const className =
    estadoClasses[estado?.toLowerCase()] ||
    "bg-gray-100 text-gray-700 border-gray-300";

  return (
    <span
      className={`inline-block px-2 py-1 text-xs font-medium rounded-md border ${className}`}
    >
      {estado?.charAt(0).toUpperCase() + estado?.slice(1)}
    </span>
  );
}
